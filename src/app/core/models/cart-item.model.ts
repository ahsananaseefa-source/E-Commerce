import { Product } from './product.model';

export interface CartItem {

  id?: string;

  userId?: string;

  product: Product;

  quantity: number;

}