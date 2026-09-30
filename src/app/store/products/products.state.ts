import { EntityState, createEntityAdapter } from '@ngrx/entity';

import { Product } from '../../core/models/product.model';

export interface ProductState extends EntityState<Product> {
  loading: boolean;
  error: string | null;
}

export const productAdapter = createEntityAdapter<Product>();

export const initialState: ProductState =
  productAdapter.getInitialState({
    loading: false,
    error: null
  });