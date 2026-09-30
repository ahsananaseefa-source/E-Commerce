import { Injectable, inject } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType
} from '@ngrx/effects';

import { Store } from '@ngrx/store';

import { of, forkJoin } from 'rxjs';

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


  // =========================
  // LOAD WISHLIST
  // =========================

  loadWishlist$ = createEffect(() =>

    this.actions$.pipe(

      ofType(loadWishlist),

      switchMap(() => {

        const userId = Number(
          localStorage.getItem('userId')
        );

        return this.wishlistService
          .getWishlist(userId)
          .pipe(

            map(items =>
              loadWishlistSuccess({ items })
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


  // =========================
  // ADD TO WISHLIST
  // =========================

  addToWishlist$ = createEffect(() =>

    this.actions$.pipe(

      ofType(addToWishlist),

      switchMap(({ product }) => {

        const userId = Number(
          localStorage.getItem('userId')
        );

        const wishlistItem = {

          userId: userId,

          productId: product.id,

          addedAt: new Date().toISOString()

        };

        return this.wishlistService
          .addToWishlist(wishlistItem)
          .pipe(

            map(() =>
              loadWishlist()
            ),

            catchError(error => {

              console.error(
                'Failed to add wishlist item:',
                error
              );

              return of();

            })

          );

      })

    )

  );


  // =========================
  // REMOVE FROM WISHLIST
  // =========================

  removeFromWishlist$ = createEffect(() =>

    this.actions$.pipe(

      ofType(removeFromWishlist),

      switchMap(({ productId }) => {

        const userId = Number(
          localStorage.getItem('userId')
        );

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

              return of();

            })

          );

      })

    )

  );


  // =========================
  // CLEAR WISHLIST
  // =========================

  clearWishlist$ = createEffect(() =>

    this.actions$.pipe(

      ofType(clearWishlist),

      withLatestFrom(
        this.store.select(selectWishlistItems)
      ),

      switchMap(([, items]) => {

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

        return forkJoin(deleteRequests).pipe(

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

        return of();

      })

    )

  );

}