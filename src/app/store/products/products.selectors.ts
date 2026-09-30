import { createFeatureSelector, createSelector } from '@ngrx/store';

import {
  ProductState,
  productAdapter
} from './products.state';


export const selectProductState =
  createFeatureSelector<ProductState>('products');


const {
  selectAll,
  selectEntities,
  selectIds,
  selectTotal
} = productAdapter.getSelectors();


export const selectAllProducts = createSelector(
  selectProductState,
  selectAll
);


export const selectProductEntities = createSelector(
  selectProductState,
  selectEntities
);


export const selectProductIds = createSelector(
  selectProductState,
  selectIds
);


export const selectProductTotal = createSelector(
  selectProductState,
  selectTotal
);


export const selectProductsLoading = createSelector(
  selectProductState,
  state => state.loading
);


export const selectProductsError = createSelector(
  selectProductState,
  state => state.error
);