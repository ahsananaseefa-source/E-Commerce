import {
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { WishlistState } from './wishlist.state';


export const selectWishlistState =
  createFeatureSelector<WishlistState>('wishlist');


export const selectWishlistItems = createSelector(
  selectWishlistState,
  state => state.items
);


export const selectWishlistCount = createSelector(
  selectWishlistState,
  state => state.items.length
);


export const selectIsWishlistEmpty = createSelector(
  selectWishlistState,
  state => state.items.length === 0
);