import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs';

import {
  cancelOrder,
  loadOrders
} from '../../store/order/order.actions';

import { selectOrders } from '../../store/order/order.selectors';
import { HeaderComponent } from '../../shared/components/header/header/header.component';


@Component({
  selector: 'app-order-details',
  standalone: true,

  imports: [
    AsyncPipe,
    DatePipe,HeaderComponent
  ],

  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent {

  private store = inject(Store);

  private route = inject(ActivatedRoute);


  order$ = this.route.paramMap.pipe(

    switchMap(params => {

      const id = params.get('id');

      return this.store.select(selectOrders).pipe(

        map(orders =>
          orders.find(
            order => String(order.id) === id
          ) ?? null
        )

      );

    })

  );


  constructor() {

    this.store.dispatch(
      loadOrders()
    );

  }


  canCancelOrder(status: string): boolean {

    return (
      status === 'Pending' ||
      status === 'Processing'
    );

  }


  cancelOrder(orderId: number): void {

    const confirmed = confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) {
      return;
    }


    this.store.dispatch(
      cancelOrder({
        orderId: orderId
      })
    );

  }

}