import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import {
  selectCartItems,
  selectCartTotalAmount
} from '../../store/cart/cart.selectors';

import { createOrder } from '../../store/order/order.actions';

import { CartItem } from '../../core/models/cart-item.model';

import { Order } from '../../core/models/order.model';


@Component({
  selector: 'app-checkout',
  standalone: true,

  imports: [
    AsyncPipe,
    FormsModule
  ],

  templateUrl: './checkout.component.html',

  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  private store = inject(Store);


  cartItems$ =
    this.store.select(selectCartItems);


  cartTotal$ =
    this.store.select(selectCartTotalAmount);

  paymentMethod ='';
  shippingDetails = {

    name: '',

    phone: '',

    address: '',

    city: '',

    pincode: ''

  };


  placeOrder(): void {

    if (
      !this.shippingDetails.name ||
      !this.shippingDetails.phone ||
      !this.shippingDetails.address ||
      !this.shippingDetails.city ||
      !this.shippingDetails.pincode ||
      !this.paymentMethod
    ) {

      alert(
        'Please fill in all shipping details and select a payment method.'
      );

      return;
    }


    this.cartItems$
      .pipe(take(1))
      .subscribe((items: CartItem[]) => {

        if (items.length === 0) {

          alert(
            'Your cart is empty.'
          );

          return;
        }


        this.cartTotal$
          .pipe(take(1))
          .subscribe((total: number) => {

            const order: Order = {

              id: Date.now(),

              userId: 1,

              items: items,

              totalAmount: total,

              shippingAddress:
                `${this.shippingDetails.name}, ` +
                `${this.shippingDetails.phone}, ` +
                `${this.shippingDetails.address}, ` +
                `${this.shippingDetails.city}, ` +
                `${this.shippingDetails.pincode}`,

              orderDate: new Date(),

              status: 'Success',

              paymentMethod : this.paymentMethod

            };


            this.store.dispatch(
              createOrder({
                order: order
              })
            );

          });

      });

  }

}