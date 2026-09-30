import { createFeatureSelector, createSelector } from '@ngrx/store';

import { CartState } from './cart.state';


export const selectCartState =
  createFeatureSelector<CartState>('cart');


export const selectCartItems = createSelector(
  selectCartState,
  state => state.items
);


export const selectCartTotalAmount = createSelector(
  selectCartState,
  state => state.totalAmount
);


export const selectCartItemCount = createSelector(
  selectCartState,
  state =>
    state.items.reduce(
      (total, item) => total + item.quantity,
      0
    )
);


export const selectIsCartEmpty = createSelector(
  selectCartState,
  state => state.items.length === 0
);