import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
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

import { HeaderComponent } from '../../shared/components/header/header/header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    AsyncPipe,
    HeaderComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  private store = inject(Store);
  private router = inject(Router);

  readonly MAX_CART_QUANTITY = 5;

  cartItems$ =
    this.store.select(selectCartItems);

  totalAmount$ =
    this.store.select(selectCartTotalAmount);

  isCartEmpty$ =
    this.store.select(selectIsCartEmpty);


  increaseQuantity(
    productId: string,
    currentQuantity: number,
    stock: number
  ): void {

    const maximumQuantity =
      this.getMaximumQuantity(stock);

    if (currentQuantity >= maximumQuantity) {
      return;
    }

    this.store.dispatch(
      increaseQuantity({
        productId
      })
    );
  }


  decreaseQuantity(productId: string): void {

    this.store.dispatch(
      decreaseQuantity({
        productId
      })
    );
  }


  removeProduct(productId: string): void {

    this.store.dispatch(
      removeFromCart({
        productId
      })
    );
  }


  clearCart(): void {

    this.store.dispatch(
      clearCart()
    );
  }


  proceedToCheckout(): void {

    this.router.navigate(['/checkout']);

  }


  getMaximumQuantity(stock: number): number {

    return Math.min(
      this.MAX_CART_QUANTITY,
      stock
    );
  }

}