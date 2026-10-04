import { Injectable, inject } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType
} from '@ngrx/effects';

import { Store } from '@ngrx/store';

import {
  EMPTY,
  forkJoin,
  of
} from 'rxjs';

import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  loadCart,
  loadCartSuccess
} from './cart.actions';

import {
  selectCartItems
} from './cart.selectors';

import { CartService } from '../../core/services/cart.service';


@Injectable()
export class CartEffects {

  private actions$ = inject(Actions);

  private cartService = inject(CartService);

  private store = inject(Store);


  // =====================================================
  // LOAD CART
  // =====================================================

  loadCart$ = createEffect(() =>

    this.actions$.pipe(

      ofType(loadCart),

      switchMap(() => {

        const userId =
          localStorage.getItem('userId');


        // -----------------------------------------------
        // GUEST
        // -----------------------------------------------

        if (!userId) {

          const guestCart =
            this.cartService.getGuestCart();

          return of(
            loadCartSuccess({
              items: guestCart
            })
          );

        }


        // -----------------------------------------------
        // LOGGED IN
        // -----------------------------------------------

        return this.cartService
          .getUserCart(userId)
          .pipe(

            map(items =>
              loadCartSuccess({
                items
              })
            ),

            catchError(error => {

              console.error(
                'Failed to load user cart:',
                error
              );

              return of(
                loadCartSuccess({
                  items: []
                })
              );

            })

          );

      })

    )

  );


  // =====================================================
  // ADD TO CART
  // =====================================================

  addToCart$ = createEffect(() =>

    this.actions$.pipe(

      ofType(addToCart),

      withLatestFrom(
        this.store.select(selectCartItems)
      ),

      switchMap(([action, cartItems]) => {

        const userId =
          localStorage.getItem('userId');


        // -----------------------------------------------
        // GUEST
        // -----------------------------------------------

        if (!userId) {

          // The separate save effect handles
          // guest localStorage.

          return EMPTY;

        }


        // -----------------------------------------------
        // LOGGED IN
        // -----------------------------------------------

        const currentItem =
          cartItems.find(
            item =>
              item.product.id ===
              action.product.id
          );


        return this.cartService
          .getUserCart(userId)
          .pipe(

            switchMap(serverItems => {

              const serverItem =
                serverItems.find(
                  item =>
                    item.product.id ===
                    action.product.id
                );


              // -----------------------------------------
              // EXISTS IN SERVER
              // -----------------------------------------

              if (serverItem?.id) {

                const maximumQuantity =
                  Math.min(
                    this.cartService.MAX_CART_QUANTITY,
                    action.product.stock
                  );


                const newQuantity =
                  Math.min(
                    currentItem?.quantity ??
                      action.quantity,

                    maximumQuantity
                  );


                return this.cartService
                  .updateCartItem(
                    serverItem.id,
                    newQuantity
                  );

              }


              // -----------------------------------------
              // NEW SERVER ITEM
              // -----------------------------------------

              const maximumQuantity =
                Math.min(
                  this.cartService.MAX_CART_QUANTITY,
                  action.product.stock
                );


              const newItem = {

                userId,

                product:
                  action.product,

                quantity:
                  Math.min(
                    action.quantity,
                    maximumQuantity
                  )

              };


              return this.cartService
                .addToCart(newItem);

            }),

            catchError(error => {

              console.error(
                'Failed to sync cart:',
                error
              );

              return EMPTY;

            })

          );

      })

    ),

    {
      dispatch: false
    }

  );


  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  removeFromCart$ = createEffect(() =>

    this.actions$.pipe(

      ofType(removeFromCart),

      switchMap(({ productId }) => {

        const userId =
          localStorage.getItem('userId');


        // Guest:
        // localStorage effect handles it.

        if (!userId) {
          return EMPTY;
        }


        return this.cartService
          .getUserCart(userId)
          .pipe(

            switchMap(items => {

              const item =
                items.find(
                  cartItem =>
                    cartItem.product.id ===
                    productId
                );


              if (!item?.id) {
                return EMPTY;
              }


              return this.cartService
                .removeFromCart(item.id);

            }),

            catchError(error => {

              console.error(
                'Failed to remove cart item:',
                error
              );

              return EMPTY;

            })

          );

      })

    ),

    {
      dispatch: false
    }

  );


  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  increaseQuantity$ = createEffect(() =>

    this.actions$.pipe(

      ofType(increaseQuantity),

      withLatestFrom(
        this.store.select(selectCartItems)
      ),

      switchMap(([{ productId }, cartItems]) => {

        const userId =
          localStorage.getItem('userId');


        if (!userId) {
          return EMPTY;
        }


        const currentItem =
          cartItems.find(
            item =>
              item.product.id ===
              productId
          );


        if (!currentItem) {
          return EMPTY;
        }


        const maximumQuantity =
          Math.min(
            this.cartService.MAX_CART_QUANTITY,
            currentItem.product.stock
          );


        if (
          currentItem.quantity >=
          maximumQuantity
        ) {
          return EMPTY;
        }


        return this.cartService
          .getUserCart(userId)
          .pipe(

            switchMap(serverItems => {

              const serverItem =
                serverItems.find(
                  item =>
                    item.product.id ===
                    productId
                );


              if (!serverItem?.id) {
                return EMPTY;
              }


              return this.cartService
                .updateCartItem(
                  serverItem.id,
                  currentItem.quantity
                );

            }),

            catchError(error => {

              console.error(
                'Failed to increase quantity:',
                error
              );

              return EMPTY;

            })

          );

      })

    ),

    {
      dispatch: false
    }

  );


  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  decreaseQuantity$ = createEffect(() =>

    this.actions$.pipe(

      ofType(decreaseQuantity),

      withLatestFrom(
        this.store.select(selectCartItems)
      ),

      switchMap(([{ productId }, cartItems]) => {

        const userId =
          localStorage.getItem('userId');


        if (!userId) {
          return EMPTY;
        }


        const currentItem =
          cartItems.find(
            item =>
              item.product.id ===
              productId
          );


        if (
          !currentItem ||
          currentItem.quantity <= 1
        ) {
          return EMPTY;
        }


        return this.cartService
          .getUserCart(userId)
          .pipe(

            switchMap(serverItems => {

              const serverItem =
                serverItems.find(
                  item =>
                    item.product.id ===
                    productId
                );


              if (!serverItem?.id) {
                return EMPTY;
              }


              return this.cartService
                .updateCartItem(
                  serverItem.id,
                  currentItem.quantity
                );

            }),

            catchError(error => {

              console.error(
                'Failed to decrease quantity:',
                error
              );

              return EMPTY;

            })

          );

      })

    ),

    {
      dispatch: false
    }

  );


  // =====================================================
  // CLEAR CART
  // =====================================================

  clearCart$ = createEffect(() =>

    this.actions$.pipe(

      ofType(clearCart),

      switchMap(() => {

        const userId =
          localStorage.getItem('userId');


        // Guest cart is handled
        // by saveGuestCart$.

        if (!userId) {
          return EMPTY;
        }


        return this.cartService
          .getUserCart(userId)
          .pipe(

            switchMap(items =>
              this.cartService
                .clearUserCart(items)
            ),

            catchError(error => {

              console.error(
                'Failed to clear cart:',
                error
              );

              return EMPTY;

            })

          );

      })

    ),

    {
      dispatch: false
    }

  );


  // =====================================================
  // SAVE GUEST CART
  // =====================================================

  saveGuestCart$ = createEffect(
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

        tap(([, cartItems]) => {

          const userId =
            localStorage.getItem('userId');


          // Only save to localStorage
          // when user is NOT logged in.

          if (!userId) {

            this.cartService
              .saveGuestCart(cartItems);

          }

        })

      ),

    {
      dispatch: false
    }

  );

}