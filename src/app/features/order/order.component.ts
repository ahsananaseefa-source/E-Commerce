import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';

import { loadOrders } from '../../store/order/order.actions';

import {
  selectOrders,
  selectOrderLoading,
  selectOrderError
} from '../../store/order/order.selectors';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-order',
  standalone: true,
  imports: [RouterLink,
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {

  private store = inject(Store);


  orders$ =
    this.store.select(selectOrders);


  loading$ =
    this.store.select(selectOrderLoading);


  error$ =
    this.store.select(selectOrderError);


  constructor() {

    this.store.dispatch(
      loadOrders()
    );

  }

}