import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';

import {
  selectCartItems,
  selectCartTotalAmount,
  selectIsCartEmpty
} from '../../store/cart/cart.selectors';

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart
} from '../../store/cart/cart.actions';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  private store = inject(Store);


  cartItems$ = this.store.select(selectCartItems);

  totalAmount$ = this.store.select(selectCartTotalAmount);

  isCartEmpty$ = this.store.select(selectIsCartEmpty);


  

  increaseQuantity(productId: number): void {

    this.store.dispatch(
      increaseQuantity({ productId })
    );

  }


  decreaseQuantity(productId: number): void {

    this.store.dispatch(
      decreaseQuantity({ productId })
    );

  }


  removeProduct(productId: number): void {

    this.store.dispatch(
      removeFromCart({ productId })
    );

  }


  clearCart(): void {

    this.store.dispatch(clearCart());

  }

}