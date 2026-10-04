import { createReducer, on } from '@ngrx/store';

import { initialCartState } from './cart.state';

import {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  loadCartSuccess
} from './cart.actions';


export const MAX_CART_QUANTITY = 5;


export const cartReducer = createReducer(

  initialCartState,


  // =====================================================
  // LOAD CART
  // =====================================================

  on(
    loadCartSuccess,
    (state, { items }) => {

      const limitedItems = items
        .filter(item => item.product.stock > 0)
        .map(item => {

          const maximumQuantity = Math.min(
            MAX_CART_QUANTITY,
            item.product.stock
          );

          return {
            ...item,
            quantity: Math.min(
              item.quantity,
              maximumQuantity
            )
          };

        });

      return {
        ...state,

        items: limitedItems,

        totalAmount:
          calculateTotal(limitedItems)
      };

    }
  ),


  // =====================================================
  // ADD TO CART
  // =====================================================

  on(
    addToCart,
    (state, { product, quantity }) => {

      // No stock
      if (product.stock <= 0) {
        return state;
      }


      const maximumQuantity = Math.min(
        MAX_CART_QUANTITY,
        product.stock
      );


      const existingItem = state.items.find(
        item =>
          item.product.id === product.id
      );


      // -------------------------------------------------
      // PRODUCT ALREADY EXISTS
      // -------------------------------------------------

      if (existingItem) {

        const updatedQuantity = Math.min(
          existingItem.quantity + quantity,
          maximumQuantity
        );


        const updatedItems = state.items.map(
          item =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: updatedQuantity
                }
              : item
        );


        return {
          ...state,

          items: updatedItems,

          totalAmount:
            calculateTotal(updatedItems)
        };

      }


      // -------------------------------------------------
      // NEW PRODUCT
      // -------------------------------------------------

      const newItemQuantity = Math.min(
        quantity,
        maximumQuantity
      );


      const newItem = {
        product,
        quantity: newItemQuantity
      };


      const newItems = [
        ...state.items,
        newItem
      ];


      return {
        ...state,

        items: newItems,

        totalAmount:
          calculateTotal(newItems)
      };

    }
  ),


  // =====================================================
  // REMOVE
  // =====================================================

  on(
    removeFromCart,
    (state, { productId }) => {

      const updatedItems =
        state.items.filter(
          item =>
            item.product.id !== productId
        );


      return {
        ...state,

        items: updatedItems,

        totalAmount:
          calculateTotal(updatedItems)
      };

    }
  ),


  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  on(
    increaseQuantity,
    (state, { productId }) => {

      const updatedItems =
        state.items.map(item => {

          if (
            item.product.id !== productId
          ) {
            return item;
          }


          const maximumQuantity =
            Math.min(
              MAX_CART_QUANTITY,
              item.product.stock
            );


          // Already at maximum
          if (
            item.quantity >=
            maximumQuantity
          ) {
            return item;
          }


          return {
            ...item,

            quantity:
              item.quantity + 1
          };

        });


      return {
        ...state,

        items: updatedItems,

        totalAmount:
          calculateTotal(updatedItems)
      };

    }
  ),


  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  on(
    decreaseQuantity,
    (state, { productId }) => {

      const updatedItems =
        state.items.map(item => {

          if (
            item.product.id === productId &&
            item.quantity > 1
          ) {

            return {
              ...item,

              quantity:
                item.quantity - 1
            };

          }

          return item;

        });


      return {
        ...state,

        items: updatedItems,

        totalAmount:
          calculateTotal(updatedItems)
      };

    }
  ),


  // =====================================================
  // CLEAR CART
  // =====================================================

  on(
    clearCart,
    state => ({

      ...state,

      items: [],

      totalAmount: 0

    })
  )

);


// =====================================================
// CALCULATE TOTAL
// =====================================================

function calculateTotal(
  items: typeof initialCartState.items
): number {

  return items.reduce(
    (total, item) =>
      total +
      item.product.price *
      item.quantity,

    0
  );

}