import { Injectable, inject } from '@angular/core';

import {
  Actions,
  createEffect,
  ofType
} from '@ngrx/effects';

import {
  catchError,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { clearCart } from '../cart/cart.actions';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';

import {
  createOrder,
  createOrderSuccess,
  createOrderFailure,

  loadOrders,
  loadOrdersSuccess,
  loadOrdersFailure,

  cancelOrder,
  cancelOrderSuccess,
  cancelOrderFailure

} from './order.actions';

import { Order } from '../../core/models/order.model';


@Injectable()
export class OrderEffects {

  private actions$ = inject(Actions);

  private http = inject(HttpClient);

  private router = inject(Router);
  
   private store = inject(Store)
  private apiUrl =
    'http://localhost:3000/order';


  // CREATE ORDER

  createOrder$ = createEffect(() =>

    this.actions$.pipe(

      ofType(createOrder),

      switchMap(({ order }) =>

        this.http
          .post<Order>(
            this.apiUrl,
            order
          )

          .pipe(

            map(createdOrder =>

              createOrderSuccess({
                order: createdOrder
              })

            ),

            catchError(error =>

              of(
                createOrderFailure({
                  error: error.message
                })
              )

            )

          )

      )

    )

  );


  // ORDER SUCCESS  + CLEAR CART

  orderSuccess$ = createEffect(

    () =>

      this.actions$.pipe(

        ofType(createOrderSuccess),

        tap(() => {


          this.store.dispatch(clearCart());

          this.router.navigate([
            '/order-success'
          ]);

        })

      ),

    {
      dispatch: false
    }

  );




  // LOAD ORDERS

  loadOrders$ = createEffect(() =>

    this.actions$.pipe(

      ofType(loadOrders),

      switchMap(() =>

        this.http
          .get<Order[]>(
            this.apiUrl
          )

          .pipe(

            map(orders =>

              loadOrdersSuccess({
                orders: orders
              })

            ),

            catchError(error =>

              of(
                loadOrdersFailure({
                  error: error.message
                })
              )

            )

          )

      )

    )

  );


  // CANCEL ORDER

  cancelOrder$ = createEffect(() =>

    this.actions$.pipe(

      ofType(cancelOrder),

      switchMap(({ orderId }) =>

        this.http
          .get<Order>(
            `${this.apiUrl}/${orderId}`
          )

          .pipe(

            switchMap(order => {

              const updatedOrder: Order = {

                ...order,

                status: 'Cancelled'

              };

              return this.http
                .put<Order>(
                  `${this.apiUrl}/${orderId}`,
                  updatedOrder
                );

            }),

            map(updatedOrder =>

              cancelOrderSuccess({
                order: updatedOrder
              })

            ),

            catchError(error =>

              of(
                cancelOrderFailure({
                  error: error.message
                })
              )

            )

          )

      )

    )

  );

}