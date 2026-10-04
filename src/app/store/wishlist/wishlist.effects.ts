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
  withLatestFrom
} from 'rxjs/operators';

import { WishlistService } from '../../core/services/wishlist.service';

import {
  loadWishlist,
  loadWishlistSuccess,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} from './wishlist.actions';

import { selectWishlistItems } from './wishlist.selectors';

@Injectable()
export class WishlistEffects {

  private actions$ = inject(Actions);
  private wishlistService = inject(WishlistService);
  private store = inject(Store);


  // =====================================================
  // LOAD WISHLIST
  // =====================================================

  loadWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(loadWishlist),

      switchMap(() => {

        const userId = localStorage.getItem('userId');

        if (!userId) {
          return of(
            loadWishlistSuccess({
              items: []
            })
          );
        }

        return this.wishlistService
          .getWishlist(userId)
          .pipe(

            map(items =>
              loadWishlistSuccess({
                items
              })
            ),

            catchError(error => {

              console.error(
                'Failed to load wishlist:',
                error
              );

              return of(
                loadWishlistSuccess({
                  items: []
                })
              );

            })

          );

      })

    )
  );


  // =====================================================
  // ADD TO WISHLIST
  // =====================================================

  addToWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(addToWishlist),

      switchMap(({ product }) => {

        const userId = localStorage.getItem('userId');

        if (!userId) {
          console.error(
            'No logged-in user found.'
          );

          return EMPTY;
        }

        return this.wishlistService
          .isInWishlist(
            product.id,
            userId
          )
          .pipe(

            switchMap(isAlreadyInWishlist => {

              if (isAlreadyInWishlist) {
                return of(loadWishlist());
              }

              const wishlistItem = {
                userId,
                productId: product.id,
                addedAt: new Date().toISOString()
              };

              return this.wishlistService
                .addToWishlist(wishlistItem)
                .pipe(
                  map(() =>
                    loadWishlist()
                  )
                );

            }),

            catchError(error => {

              console.error(
                'Failed to add wishlist item:',
                error
              );

              return EMPTY;

            })

          );

      })

    )
  );


  // =====================================================
  // REMOVE ONE ITEM
  // =====================================================

  removeFromWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(removeFromWishlist),

      switchMap(({ productId }) => {

        const userId = localStorage.getItem('userId');

        if (!userId) {
          return EMPTY;
        }

        return this.wishlistService
          .getWishlist(userId)
          .pipe(

            switchMap(items => {

              const item = items.find(
                wishlistItem =>
                  wishlistItem.productId === productId
              );

              if (!item?.id) {
                return of(
                  loadWishlist()
                );
              }

              return this.wishlistService
                .removeFromWishlist(item.id)
                .pipe(

                  map(() =>
                    loadWishlist()
                  )

                );

            }),

            catchError(error => {

              console.error(
                'Failed to remove wishlist item:',
                error
              );

              return EMPTY;

            })

          );

      })

    )
  );


  // =====================================================
  // CLEAR ENTIRE WISHLIST
  // =====================================================

  clearWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(clearWishlist),

      switchMap(() => {

        const userId = localStorage.getItem('userId');

        if (!userId) {
          return of(
            loadWishlist()
          );
        }

        /*
         * IMPORTANT:
         *
         * Instead of depending only on the NgRx state,
         * get the latest wishlist directly from json-server.
         */

        return this.wishlistService
          .getWishlist(userId)
          .pipe(

            switchMap(items => {

              if (items.length === 0) {

                return of(
                  loadWishlist()
                );

              }

              const deleteRequests = items
                .filter(item => item.id)
                .map(item =>
                  this.wishlistService
                    .removeFromWishlist(item.id!)
                );

              if (deleteRequests.length === 0) {

                return of(
                  loadWishlist()
                );

              }

              return forkJoin(
                deleteRequests
              ).pipe(

                map(() =>
                  loadWishlist()
                )

              );

            }),

            catchError(error => {

              console.error(
                'Failed to clear wishlist:',
                error
              );

              return EMPTY;

            })

          );

      })

    )
  );

}