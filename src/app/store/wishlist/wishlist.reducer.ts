 import { createReducer, on } from '@ngrx/store';

import {
  initialWishlistState
} from './wishlist.state';

import {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  loadWishlistSuccess
} from './wishlist.actions';


export const wishlistReducer = createReducer(

  initialWishlistState,


  // Load wishlist from db.json
  on(
    loadWishlistSuccess,
    (state, { items }) => ({
      ...state,
      items: items
    })
  ),


  // Add product to wishlist
  on(
    addToWishlist,
    (state, { product }) => {

      const alreadyExists =
        state.items.some(
          item => item.productId === product.id
        );

      if (alreadyExists) {
        return state;
      }

      const newItem = {
        productId: product.id,
        userId: Number(
          localStorage.getItem('userId')
        ),
        addedAt: new Date().toISOString()
      };

      return {
        ...state,
        items: [
          ...state.items,
          newItem
        ]
      };

    }
  ),


  // Remove product from wishlist
  on(
    removeFromWishlist,
    (state, { productId }) => {

      const updatedItems =
        state.items.filter(
          item => item.productId !== productId
        );

      return {
        ...state,
        items: updatedItems
      };

    }
  ),


  // Clear wishlist
  on(
    clearWishlist,
    state => ({
      ...state,
      items: []
    })
  )

);