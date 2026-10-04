import { Component, inject } from '@angular/core';

import { AsyncPipe } from '@angular/common';

import { RouterLink } from '@angular/router';

import { Store } from '@ngrx/store';

import { map } from 'rxjs/operators';

import { HeaderComponent } from '../../shared/components/header/header/header.component';

import { FooterComponent } from '../../shared/components/footer/footer.component';

import { loadProducts } from '../../store/products/products.actions';

import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError
} from '../../store/products/products.selectors';

import {
  addToWishlist,
  removeFromWishlist,
  loadWishlist
} from '../../store/wishlist/wishlist.actions';

import {
  selectWishlistItems
} from '../../store/wishlist/wishlist.selectors';

import { Product } from '../../core/models/product.model';

import { WishlistItem } from '../../core/models/wishlist-item.models';


@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],

  templateUrl: './home.component.html',

  styleUrl: './home.component.css'
})
export class HomeComponent {

  private store = inject(Store);


  // =====================================================
  // CATEGORIES
  // =====================================================

  categories = [
    'Rings',
    'Earrings',
    'Bracelets',
    'Bangles',
    'Chains',
    'Anklets'
  ];


  // =====================================================
  // PRODUCTS
  // =====================================================

  private allProducts$ =
    this.store.select(
      selectAllProducts
    );


  // =====================================================
  // FEATURED PRODUCTS
  // HIGHEST RATING FIRST
  // =====================================================

  products$ =
    this.allProducts$.pipe(

      map(products => {

        return [...products]

          .sort(
            (a, b) =>
              Number(b.rating) -
              Number(a.rating)
          )

          .slice(0, 6);

      })

    );


  // =====================================================
  // LOADING
  // =====================================================

  loading$ =
    this.store.select(
      selectProductsLoading
    );


  // =====================================================
  // ERROR
  // =====================================================

  error$ =
    this.store.select(
      selectProductsError
    );


  // =====================================================
  // WISHLIST
  // =====================================================

  wishlistItems$ =
    this.store.select(
      selectWishlistItems
    );


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    // Load products

    this.store.dispatch(
      loadProducts()
    );


    // Load wishlist

    this.store.dispatch(
      loadWishlist()
    );

  }


  // =====================================================
  // CHECK WISHLIST
  // =====================================================

  isInWishlist(
    product: Product,
    wishlistItems: WishlistItem[]
  ): boolean {

    return wishlistItems.some(
      item =>
        item.productId ===
        product.id
    );

  }


  // =====================================================
  // TOGGLE WISHLIST
  // =====================================================

  toggleWishlist(
    product: Product,
    wishlistItems: WishlistItem[]
  ): void {

    const alreadyInWishlist =
      this.isInWishlist(
        product,
        wishlistItems
      );


    if (alreadyInWishlist) {

      this.store.dispatch(
        removeFromWishlist({
          productId:
            product.id
        })
      );

    }

    else {

      this.store.dispatch(
        addToWishlist({
          product
        })
      );

    }

  }

}