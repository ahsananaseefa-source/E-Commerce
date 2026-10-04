import { createAction, props } from '@ngrx/store';

import { CartItem } from '../../core/models/cart-item.model';
import { Product } from '../../core/models/product.model';


export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{
    product: Product;
    quantity: number;
  }>()
);


export const removeFromCart = createAction(
  '[Cart] Remove From Cart',
  props<{
    productId: string;
  }>()
);


export const increaseQuantity = createAction(
  '[Cart] Increase Quantity',
  props<{
    productId: string;
  }>()
);


export const decreaseQuantity = createAction(
  '[Cart] Decrease Quantity',
  props<{
    productId: string;
  }>()
);


export const clearCart = createAction(
  '[Cart] Clear Cart'
);


export const loadCart = createAction(
  '[Cart] Load Cart'
);


export const loadCartSuccess = createAction(
  '[Cart] Load Cart Success',
  props<{
    items: CartItem[];
  }>()
);