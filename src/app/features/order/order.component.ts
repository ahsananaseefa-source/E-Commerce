import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';

import { loadOrders } from '../../store/order/order.actions';

import {
  selectOrders,
  selectOrderLoading,
  selectOrderError
} from '../../store/order/order.selectors';

import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header/header.component';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    RouterLink,
    AsyncPipe,
    DatePipe,
    HeaderComponent
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {

  private store = inject(Store);

  orders$ = this.store.select(selectOrders).pipe(
    map(orders =>
      [...orders].sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();

        return dateB - dateA;
      })
    )
  );

  loading$ = this.store.select(selectOrderLoading);

  error$ = this.store.select(selectOrderError);

  constructor() {
    this.store.dispatch(loadOrders());
  }
}