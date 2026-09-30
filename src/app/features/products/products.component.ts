import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { loadProducts } from '../../store/products/products.actions';
import { HeaderComponent } from '../../shared/components/header/header/header.component';
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,

} from '../../store/products/products.selectors';

import { addToCart } from '../../store/cart/cart.actions';

import { addToWishlist } from '../../store/wishlist/wishlist.actions';

import { Product } from '../../core/models/product.model';

import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [AsyncPipe,RouterLink,FooterComponent,HeaderComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  private store = inject(Store);
  private route = inject(ActivatedRoute)


  products$ =
    this.store.select(selectAllProducts);

  loading$ =
    this.store.select(selectProductsLoading);

  error$ =
    this.store.select(selectProductsError);

    selectedCategory = '';
    searchTerm = '';

  constructor() {
    this.store.dispatch(loadProducts());

    this.route.queryParams.subscribe(params => {

    this.selectedCategory = params['category'] || '';

    if (params['search']) {

    this.searchTerm = params['search'];
    this.selectedCategory = '';

  } else {

    this.selectedCategory = params['category'] || '';
    this.searchTerm = '';

  }

});

  }


  addProductToCart(product: Product): void {

    this.store.dispatch(
      addToCart({ product ,
         quantity: 1
      })
    );

  }


  addProductToWishlist(product: Product): void {

    this.store.dispatch(
      addToWishlist({ product })
    );

  }

}