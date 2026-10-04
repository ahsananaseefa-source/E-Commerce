import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { HeaderComponent } from '../../shared/components/header/header/header.component';

import { User } from '../../core/models/user.models';
import { Address } from '../../core/models/address.model';
import { AddressService } from '../../core/services/address.service';

import {
  loadOrders,
  cancelOrder
} from '../../store/order/order.actions';

import {
  selectOrders,
  selectOrderLoading,
  selectOrderError
} from '../../store/order/order.selectors';

import { Order } from '../../core/models/order.model';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    HeaderComponent,
    AsyncPipe
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {

  private router = inject(Router);
  private addressService = inject(AddressService);
  private store = inject(Store);

  user: User | null = null;

  // =========================
  // ADDRESS STATE
  // =========================

  addresses: Address[] = [];

  isAddressFormOpen = false;
  isEditingAddress = false;
  editingAddressId: string | null = null;

  addressError = '';
  addressSuccess = '';

  // =========================
  // DELETE CONFIRMATION
  // =========================

  isDeleteConfirmOpen = false;
  addressToDelete: Address | null = null;

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
  // ORDER STATE
  // =========================

  orders$ = this.store.select(selectOrders);

  orderLoading$ =
    this.store.select(selectOrderLoading);

  orderError$ =
    this.store.select(selectOrderError);

  userOrders: Order[] = [];

  constructor() {
    this.loadUser();
    this.loadOrders();
  }

  // =========================
  // LOAD USER
  // =========================

  loadUser(): void {

    const storedUser =
      localStorage.getItem('user');

    if (!storedUser) {

      this.router.navigate(['/auth']);

      return;
    }

    try {

      this.user =
        JSON.parse(storedUser) as User;

      if (!this.user.id) {

        this.router.navigate(['/auth']);

        return;
      }

      this.loadAddresses();

    } catch (error) {

      console.error(
        'Failed to load user:',
        error
      );

      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');

      this.router.navigate(['/auth']);
    }
  }

  // =========================
  // LOAD ADDRESSES
  // =========================

  loadAddresses(): void {

    if (!this.user?.id) {
      return;
    }

    this.addressService
      .getUserAddresses(this.user.id)
      .subscribe({

        next: (addresses) => {

          this.addresses = addresses;
        },

        error: (error) => {

          console.error(
            'Failed to load addresses:',
            error
          );

          this.addressError =
            'Unable to load your saved addresses.';
        }

      });
  }

  // =========================
  // LOAD ORDERS
  // =========================

  loadOrders(): void {

    this.store.dispatch(loadOrders());

    this.orders$.subscribe({

      next: orders => {

        const userId =
          localStorage.getItem('userId');

        if (!userId) {

          this.userOrders = [];

          return;
        }

        this.userOrders = orders
          .filter(
            order => order.userId === userId
          )
          .sort(
            (a, b) =>
              new Date(b.orderDate).getTime() -
              new Date(a.orderDate).getTime()
          );
      }

    });
  }

  // =========================
  // CANCEL ORDER
  // =========================

  cancelUserOrder(orderId: number): void {

    const confirmed = confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      cancelOrder({
        orderId
      })
    );
  }

  // =========================
  // ORDER STATUS
  // =========================

  canCancelOrder(order: Order): boolean {

    return (
      order.status !== 'Cancelled' &&
      order.status !== 'Delivered'
    );
  }

  // =========================
  // ORDER DATE
  // =========================

  formatOrderDate(
    date: Date | string
  ): string {

    const orderDate =
      new Date(date);

    return orderDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  // =========================
  // ADD ADDRESS
  // =========================

  openAddAddress(): void {

    if (this.addresses.length >= 2) {

      this.addressError =
        'You can save a maximum of 2 addresses.';

      return;
    }

    this.resetAddressForm();

    this.addressForm.userId =
      this.user?.id ?? '';

    this.addressForm.fullName =
      this.user?.name ?? '';

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

    this.isAddressFormOpen = true;

    this.isEditingAddress = true;

    this.editingAddressId =
      address.id ?? null;

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

    this.resetAddressForm();
  }

  // =========================
  // SAVE ADDRESS
  // =========================

  saveAddress(): void {

    this.addressError = '';
    this.addressSuccess = '';

    if (!this.validateAddressForm()) {
      return;
    }

    if (!this.user?.id) {

      this.addressError =
        'User information is missing.';

      return;
    }

    const addressData: Address = {

      ...this.addressForm,

      userId: this.user.id,

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
    // ADD ADDRESS
    // =========================

    if (!this.isEditingAddress) {

      if (this.addresses.length === 0) {

        addressData.isDefault = true;
      }

      if (addressData.isDefault) {

        this.removeDefaultFromExistingAddresses();
      }

      this.addressService
        .addAddress(addressData)
        .subscribe({

          next: (savedAddress) => {

            this.addresses = [
              ...this.addresses,
              savedAddress
            ];

            this.isAddressFormOpen = false;

            this.addressSuccess =
              'Address saved successfully.';

            this.resetAddressForm();
          },

          error: (error) => {

            console.error(
              'Failed to save address:',
              error
            );

            this.addressError =
              'Unable to save the address. Please try again.';
          }

        });

      return;
    }

    // =========================
    // UPDATE ADDRESS
    // =========================

    if (!this.editingAddressId) {

      this.addressError =
        'Address ID is missing.';

      return;
    }

    if (addressData.isDefault) {

      this.removeDefaultFromExistingAddresses(
        this.editingAddressId
      );
    }

    this.addressService
      .updateAddress(
        this.editingAddressId,
        addressData
      )
      .subscribe({

        next: (updatedAddress) => {

          this.addresses =
            this.addresses.map(address =>
              address.id === updatedAddress.id
                ? updatedAddress
                : address
            );

          this.isAddressFormOpen = false;

          this.isEditingAddress = false;

          this.editingAddressId = null;

          this.addressSuccess =
            'Address updated successfully.';

          this.resetAddressForm();
        },

        error: (error) => {

          console.error(
            'Failed to update address:',
            error
          );

          this.addressError =
            'Unable to update the address. Please try again.';
        }

      });
  }

  // =========================
  // DELETE ADDRESS
  // =========================

  deleteAddress(address: Address): void {

    if (!address.id) {
      return;
    }

    this.addressToDelete = address;

    this.isDeleteConfirmOpen = true;
  }

  // =========================
  // CANCEL DELETE
  // =========================

  cancelDelete(): void {

    this.isDeleteConfirmOpen = false;

    this.addressToDelete = null;
  }

  // =========================
  // CONFIRM DELETE
  // =========================

  confirmDelete(): void {

    if (!this.addressToDelete?.id) {
      return;
    }

    const addressId =
      this.addressToDelete.id;

    const wasDefault =
      this.addressToDelete.isDefault;

    this.addressService
      .deleteAddress(addressId)
      .subscribe({

        next: () => {

          this.addresses =
            this.addresses.filter(
              address =>
                address.id !== addressId
            );

          this.isDeleteConfirmOpen = false;

          this.addressToDelete = null;

          if (
            wasDefault &&
            this.addresses.length > 0
          ) {

            this.setDefaultAddress(
              this.addresses[0]
            );
          }

          this.addressSuccess =
            'Address deleted successfully.';

          this.addressError = '';
        },

        error: (error) => {

          console.error(
            'Failed to delete address:',
            error
          );

          this.addressError =
            'Unable to delete the address. Please try again.';

          this.isDeleteConfirmOpen = false;

          this.addressToDelete = null;
        }

      });
  }

  // =========================
  // SET DEFAULT ADDRESS
  // =========================

  setDefaultAddress(
    address: Address
  ): void {

    if (!address.id) {
      return;
    }

    this.addressService
      .updateAddress(
        address.id,
        {
          isDefault: true
        }
      )
      .subscribe({

        next: (updatedAddress) => {

          this.addresses =
            this.addresses.map(item => ({

              ...item,

              isDefault:
                item.id === updatedAddress.id

            }));

          this.addressSuccess =
            'Default address updated.';

          this.addressError = '';
        },

        error: (error) => {

          console.error(
            'Failed to set default address:',
            error
          );

          this.addressError =
            'Unable to update the default address.';
        }

      });
  }

  // =========================
  // REMOVE EXISTING DEFAULT
  // =========================

  private removeDefaultFromExistingAddresses(
    exceptId?: string
  ): void {

    this.addresses

      .filter(address =>
        address.isDefault &&
        address.id !== exceptId &&
        address.id
      )

      .forEach(address => {

        this.addressService
          .updateAddress(
            address.id!,
            {
              isDefault: false
            }
          )

          .subscribe({

            next: () => {

              this.addresses =
                this.addresses.map(item =>
                  item.id === address.id
                    ? {
                        ...item,
                        isDefault: false
                      }
                    : item
                );
            },

            error: (error) => {

              console.error(
                'Failed to remove old default address:',
                error
              );
            }

          });
      });

    this.addresses =
      this.addresses.map(address =>
        address.id === exceptId
          ? address
          : {
              ...address,
              isDefault: false
            }
      );
  }

  // =========================
  // VALIDATE ADDRESS
  // =========================

  private validateAddressForm(): boolean {

    if (
      !this.addressForm.fullName.trim()
    ) {

      this.addressError =
        'Please enter your full name.';

      return false;
    }

    if (
      !this.addressForm.phone.trim()
    ) {

      this.addressError =
        'Please enter your phone number.';

      return false;
    }

    const phonePattern =
      /^[0-9]{10}$/;

    if (
      !phonePattern.test(
        this.addressForm.phone.trim()
      )
    ) {

      this.addressError =
        'Please enter a valid 10-digit phone number.';

      return false;
    }

    if (
      !this.addressForm.addressLine.trim()
    ) {

      this.addressError =
        'Please enter your address.';

      return false;
    }

    if (
      !this.addressForm.city.trim()
    ) {

      this.addressError =
        'Please enter your city.';

      return false;
    }

    if (
      !this.addressForm.state.trim()
    ) {

      this.addressError =
        'Please enter your state.';

      return false;
    }

    const pincodePattern =
      /^[0-9]{6}$/;

    if (
      !pincodePattern.test(
        this.addressForm.pincode.trim()
      )
    ) {

      this.addressError =
        'Please enter a valid 6-digit pincode.';

      return false;
    }

    return true;
  }

  // =========================
  // RESET ADDRESS FORM
  // =========================

  private resetAddressForm(): void {

    this.addressForm = {

      userId:
        this.user?.id ?? '',

      fullName: '',

      phone: '',

      addressLine: '',

      city: '',

      state: '',

      pincode: '',

      isDefault: false
    };
  }

  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    localStorage.removeItem('userId');

    this.router.navigate(['/auth']);
  }
}