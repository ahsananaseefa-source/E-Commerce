import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { take } from 'rxjs';

import {
  selectCartItems,
  selectCartTotalAmount
} from '../../store/cart/cart.selectors';

import { createOrder } from '../../store/order/order.actions';

import { CartItem } from '../../core/models/cart-item.model';
import { Order } from '../../core/models/order.model';
import { Address } from '../../core/models/address.model';

import { AddressService } from '../../core/services/address.service';

import { HeaderComponent } from '../../shared/components/header/header/header.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  private store = inject(Store);
  private addressService = inject(AddressService);
  private router = inject(Router);

  cartItems$ = this.store.select(selectCartItems);
  cartTotal$ = this.store.select(selectCartTotalAmount);

  // =========================
  // ADDRESS
  // =========================

  addresses: Address[] = [];

  selectedAddressId: string | null = null;

  isAddressFormOpen = false;
  isEditingAddress = false;
  editingAddressId: string | null = null;

  addressLoading = true;
  addressError = '';
  addressSuccess = '';

  addressForm: Address = {
    userId: '',
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  };

  // =========================
  // DELETE ADDRESS POPUP
  // =========================

  isDeletePopupOpen = false;
  addressToDelete: Address | null = null;
  isDeletingAddress = false;

  // =========================
  // PAYMENT
  // =========================

  paymentMethod = '';
  upiId = '';
  paymentError = '';

  // =========================
  // ORDER
  // =========================

  orderError = '';
  isPlacingOrder = false;

  constructor() {
    this.loadAddresses();
  }

  // =========================
  // LOAD ADDRESSES
  // =========================

  loadAddresses(): void {

    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.addressLoading = false;
      this.addressError = 'Please sign in to continue.';
      return;
    }

    this.addressService.getUserAddresses(userId).subscribe({

      next: (addresses: Address[]) => {

        this.addresses = addresses;

        const defaultAddress = addresses.find(
          address => address.isDefault
        );

        if (defaultAddress?.id) {

          this.selectedAddressId = defaultAddress.id;

        } else if (
          addresses.length > 0 &&
          addresses[0].id
        ) {

          this.selectedAddressId = addresses[0].id;
        }

        this.addressLoading = false;
      },

      error: (error: unknown) => {

        console.error(error);

        this.addressError =
          'Unable to load your saved addresses.';

        this.addressLoading = false;
      }
    });
  }

  // =========================
  // OPEN ADD ADDRESS
  // =========================

  openAddAddress(): void {

    if (this.addresses.length >= 2) {

      this.addressError =
        'You can save up to 2 addresses.';

      return;
    }

    const userId = localStorage.getItem('userId');

    const storedUser = localStorage.getItem('user');

    let userName = '';

    if (storedUser) {

      try {

        const user = JSON.parse(storedUser);

        userName = user.name || '';

      } catch (error) {

        console.error(error);
      }
    }

    this.addressForm = {

      userId: userId || '',

      fullName: userName,

      phone: '',

      addressLine: '',

      city: '',

      state: '',

      pincode: '',

      isDefault: this.addresses.length === 0
    };

    this.isAddressFormOpen = true;

    this.isEditingAddress = false;

    this.editingAddressId = null;

    this.addressError = '';

    this.addressSuccess = '';
  }

  // =========================
  // EDIT ADDRESS
  // =========================

  editAddress(address: Address): void {

    this.addressForm = {
      ...address
    };

    this.isEditingAddress = true;

    this.editingAddressId =
      address.id || null;

    this.isAddressFormOpen = true;

    this.addressError = '';

    this.addressSuccess = '';
  }

  // =========================
  // CANCEL ADDRESS FORM
  // =========================

  cancelAddressForm(): void {

    this.isAddressFormOpen = false;

    this.isEditingAddress = false;

    this.editingAddressId = null;

    this.addressError = '';

    this.addressSuccess = '';
  }

  // =========================
  // ADDRESS VALIDATION
  // =========================

  isAddressValid(): boolean {

    return (

      this.addressForm.fullName.trim().length >= 2 &&

      /^[0-9]{10}$/.test(
        this.addressForm.phone.trim()
      ) &&

      this.addressForm.addressLine.trim().length >= 5 &&

      this.addressForm.city.trim().length >= 2 &&

      this.addressForm.state.trim().length >= 2 &&

      /^[0-9]{6}$/.test(
        this.addressForm.pincode.trim()
      )

    );
  }

  // =========================
  // SAVE ADDRESS
  // =========================

  saveAddress(): void {

    this.addressError = '';
    this.addressSuccess = '';

    const userId = localStorage.getItem('userId');

    if (!userId) {

      this.addressError =
        'Please sign in before saving an address.';

      return;
    }

    if (!this.isAddressValid()) {

      this.addressError =
        'Please enter valid address details.';

      return;
    }

    const addressData: Address = {

      ...this.addressForm,

      userId: userId,

      fullName:
        this.addressForm.fullName.trim(),

      phone:
        this.addressForm.phone.trim(),

      addressLine:
        this.addressForm.addressLine.trim(),

      city:
        this.addressForm.city.trim(),

      state:
        this.addressForm.state.trim(),

      pincode:
        this.addressForm.pincode.trim()
    };

    // =========================
    // UPDATE ADDRESS
    // =========================

    if (
      this.isEditingAddress &&
      this.editingAddressId
    ) {

      this.addressService
        .updateAddress(
          this.editingAddressId,
          addressData
        )
        .subscribe({

          next: (updatedAddress: Address) => {

            this.addresses =
              this.addresses.map(address =>
                address.id === updatedAddress.id
                  ? updatedAddress
                  : address
              );

            this.selectedAddressId =
              updatedAddress.id || null;

            this.addressSuccess =
              'Address updated successfully.';

            this.isAddressFormOpen = false;

            this.isEditingAddress = false;

            this.editingAddressId = null;
          },

          error: (error: unknown) => {

            console.error(error);

            this.addressError =
              'Unable to update the address.';
          }
        });

      return;
    }

    // =========================
    // ADD NEW ADDRESS
    // =========================

    this.addressService
      .addAddress(addressData)
      .subscribe({

        next: (newAddress: Address) => {

          this.addresses = [
            ...this.addresses,
            newAddress
          ];

          this.selectedAddressId =
            newAddress.id || null;

          this.addressSuccess =
            'Address saved successfully.';

          this.isAddressFormOpen = false;

          this.resetAddressForm();
        },

        error: (error: unknown) => {

          console.error(error);

          this.addressError =
            'Unable to save the address.';
        }
      });
  }

  // =========================
  // RESET ADDRESS FORM
  // =========================

  resetAddressForm(): void {

    const userId =
      localStorage.getItem('userId') || '';

    this.addressForm = {

      userId: userId,

      fullName: '',

      phone: '',

      addressLine: '',

      city: '',

      state: '',

      pincode: '',

      isDefault: false
    };

    this.isEditingAddress = false;

    this.editingAddressId = null;
  }

  // =========================
  // DELETE ADDRESS POPUP
  // =========================

  openDeleteAddressPopup(
    address: Address
  ): void {

    this.addressToDelete = address;

    this.isDeletePopupOpen = true;

    this.addressError = '';

    this.addressSuccess = '';
  }

  cancelDeleteAddress(): void {

    this.isDeletePopupOpen = false;

    this.addressToDelete = null;

    this.isDeletingAddress = false;
  }

  confirmDeleteAddress(): void {

    if (!this.addressToDelete?.id) {
      return;
    }

    const addressId =
      this.addressToDelete.id;

    this.isDeletingAddress = true;

    this.addressError = '';

    this.addressSuccess = '';

    this.addressService
      .deleteAddress(addressId)
      .subscribe({

        next: () => {

          this.addresses =
            this.addresses.filter(
              address =>
                address.id !== addressId
            );

          // If deleted address was selected
          if (
            this.selectedAddressId === addressId
          ) {

            if (this.addresses.length > 0) {

              const defaultAddress =
                this.addresses.find(
                  address =>
                    address.isDefault
                );

              this.selectedAddressId =
                defaultAddress?.id ||
                this.addresses[0].id ||
                null;

            } else {

              this.selectedAddressId = null;
            }
          }

          this.addressSuccess =
            'Address removed successfully.';

          this.isDeletePopupOpen = false;

          this.addressToDelete = null;

          this.isDeletingAddress = false;
        },

        error: (error: unknown) => {

          console.error(error);

          this.addressError =
            'Unable to remove the address.';

          this.isDeletingAddress = false;
        }
      });
  }

  // =========================
  // PAYMENT
  // =========================

  onPaymentMethodChange(): void {

    this.paymentError = '';

    if (this.paymentMethod !== 'UPI') {

      this.upiId = '';
    }
  }

  isUpiValid(): boolean {

    const upiPattern =
      /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/;

    return upiPattern.test(
      this.upiId.trim()
    );
  }

  // =========================
  // PLACE ORDER
  // =========================

  placeOrder(): void {

    this.orderError = '';

    this.paymentError = '';

    if (!this.selectedAddressId) {

      this.orderError =
        'Please select a delivery address.';

      return;
    }

    if (!this.selectedAddress) {

      this.orderError =
        'Please select a valid delivery address.';

      return;
    }

    if (!this.paymentMethod) {

      this.paymentError =
        'Please select a payment method.';

      return;
    }

    if (
      this.paymentMethod === 'UPI' &&
      !this.isUpiValid()
    ) {

      this.paymentError =
        'Please enter a valid UPI ID.';

      return;
    }

    this.cartItems$
      .pipe(take(1))
      .subscribe((items: CartItem[]) => {

        if (items.length === 0) {

          this.orderError =
            'Your cart is empty.';

          return;
        }

        this.cartTotal$
          .pipe(take(1))
          .subscribe((total: number) => {

            const userId =
              localStorage.getItem('userId');

            if (!userId) {

              this.orderError =
                'Please sign in to place your order.';

              return;
            }

            const address =
              this.selectedAddress!;

            const shippingAddress =
              `${address.fullName}, ` +
              `${address.phone}, ` +
              `${address.addressLine}, ` +
              `${address.city}, ` +
              `${address.state}, ` +
              `${address.pincode}`;

            const order: Order = {

              id: Date.now(),

              userId: userId,

              items: items,

              totalAmount: total,

              shippingAddress:
                shippingAddress,

              orderDate: new Date(),

              status: 'Success',

              paymentMethod:
                this.paymentMethod
            };

            this.isPlacingOrder = true;

            this.store.dispatch(
              createOrder({
                order: order
              })
            );
          });
      });
  }

  // =========================
  // SELECTED ADDRESS
  // =========================

  get selectedAddress(): Address | undefined {

    return this.addresses.find(
      address =>
        address.id ===
        this.selectedAddressId
    );
  }
}