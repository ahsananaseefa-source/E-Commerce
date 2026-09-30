import { createReducer, on } from '@ngrx/store';

import {
  initialCartState
} from './cart.state';

import {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  loadCartSuccess
} from './cart.actions';


export const cartReducer = createReducer(

  initialCartState,


  on(loadCartSuccess, (state, { items }) => ({
    ...state,
    items: items,
    totalAmount: calculateTotal(items)
  })),


  on(addToCart, (state, { product, quantity }) => {

    const existingItem = state.items.find(
      item => item.product.id === product.id
    );

    if (existingItem) {

      const updatedItems = state.items.map(item =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity
            }
          : item
      );

      return {
        ...state,
        items: updatedItems,
        totalAmount: calculateTotal(updatedItems)
      };

    }


    const newItems = [
      ...state.items,
      {
        product: product,
        quantity: quantity
      }
    ];

    return {
      ...state,
      items: newItems,
      totalAmount: calculateTotal(newItems)
    };

  }),


  on(removeFromCart, (state, { productId }) => {

    const updatedItems = state.items.filter(
      item => item.product.id !== productId
    );

    return {
      ...state,
      items: updatedItems,
      totalAmount: calculateTotal(updatedItems)
    };

  }),


  on(increaseQuantity, (state, { productId }) => {

    const updatedItems = state.items.map(item =>
      item.product.id === productId
        ? {
            ...item,
            quantity: item.quantity + 1
          }
        : item
    );

    return {
      ...state,
      items: updatedItems,
      totalAmount: calculateTotal(updatedItems)
    };

  }),


  on(decreaseQuantity, (state, { productId }) => {

    const updatedItems = state.items.map(item =>
      item.product.id === productId && item.quantity > 1
        ? {
            ...item,
            quantity: item.quantity - 1
          }
        : item
    );

    return {
      ...state,
      items: updatedItems,
      totalAmount: calculateTotal(updatedItems)
    };

  }),


  on(clearCart, (state) => ({
    ...state,
    items: [],
    totalAmount: 0
  }))

);


function calculateTotal(
  items: typeof initialCartState.items
): number {

  return items.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

}