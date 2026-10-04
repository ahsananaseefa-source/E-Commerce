import { createAction, props } from '@ngrx/store';

import { Product } from '../../core/models/product.model';
import { WishlistItem } from '../../core/models/wishlist-item.models';


export const addToWishlist = createAction(
  '[Wishlist] Add To Wishlist',
  props<{ product: Product }>()
);


export const removeFromWishlist = createAction(
  '[Wishlist] Remove From Wishlist',
  props<{ productId: string }>()
);


export const clearWishlist = createAction(
  '[Wishlist] Clear Wishlist'
);


export const loadWishlist = createAction(
  '[Wishlist] Load Wishlist'
);


export const loadWishlistSuccess = createAction(
  '[Wishlist] Load Wishlist Success',
  props<{ items: WishlistItem[] }>()
);