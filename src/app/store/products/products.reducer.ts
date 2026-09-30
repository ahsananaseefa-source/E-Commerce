import { createReducer, on } from '@ngrx/store';

import {
  ProductState,
  productAdapter,
  initialState
} from './products.state';

import {
  loadProducts,
  loadProductsSuccess,
  loadProductsFailure
} from './products.actions';


export const productReducer = createReducer(

  initialState,


  on(loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),


  on(loadProductsSuccess, (state, { products }) =>
    productAdapter.setAll(products, {
      ...state,
      loading: false,
      error: null
    })
  ),


  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))

);