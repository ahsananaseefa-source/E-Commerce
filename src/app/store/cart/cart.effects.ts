import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import { CartService } from '../../core/services/cart.service';

import {
  loadCart,
  loadCartSuccess,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart
} from './cart.actions';

import { selectCartItems } from './cart.selectors';

@Injectable()
export class CartEffects {

  private actions$ = inject(Actions);
  private cartService = inject(CartService);
  private store = inject(Store);
 
  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCart),

      switchMap(() => {
        const items = this.cartService.getCart();

        return of(
          loadCartSuccess({ items })
        );
      }),

      catchError(() =>
        of(
          loadCartSuccess({ items: [] })
        )
      )
    )
  );

  
  saveCart$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          addToCart,
          removeFromCart,
          increaseQuantity,
          decreaseQuantity,
          clearCart
        ),

        withLatestFrom(
          this.store.select(selectCartItems)
        ),

        tap(([, items]) => {
          this.cartService.saveCart(items);
        })
      ),
    { dispatch: false }
  );
}