import { createFeatureSelector, createSelector } from '@ngrx/store';

import { OrderState } from './order.state';


export const selectOrderState =
  createFeatureSelector<OrderState>('order');


export const selectOrders = createSelector(
  selectOrderState,
  state => state.orders
);


export const selectOrderLoading = createSelector(
  selectOrderState,
  state => state.loading
);


export const selectOrderError = createSelector(
  selectOrderState,
  state => state.error
);


export const selectOrderCount = createSelector(
  selectOrderState,
  state => state.orders.length
);


export const selectIsOrderEmpty = createSelector(
  selectOrderState,
  state => state.orders.length === 0
);