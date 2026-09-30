import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';

import {
  selectWishlistItems,
  selectWishlistCount,
  selectIsWishlistEmpty
} from '../../store/wishlist/wishlist.selectors';

import {
  removeFromWishlist,
  clearWishlist,
  loadWishlist
} from '../../store/wishlist/wishlist.actions';

import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

interface WishlistDisplayItem {
  id?: number;
  userId: number;
  productId: number;
  addedAt: string;
  product: Product;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {

  private store = inject(Store);

  private productService = inject(ProductService);


  // =========================
  // WISHLIST STATE
  // =========================

  wishlistItems$ =
    this.store.select(selectWishlistItems);

  wishlistCount$ =
    this.store.select(selectWishlistCount);

  isWishlistEmpty$ =
    this.store.select(selectIsWishlistEmpty);


  // =========================
  // PRODUCTS
  // =========================

  products$ =
    this.productService.getProducts();


  // =========================
  // WISHLIST + PRODUCTS
  // =========================

  wishlistDisplayItems$: Observable<WishlistDisplayItem[]> =
    combineLatest([
      this.wishlistItems$,
      this.products$
    ]).pipe(

      map(([wishlistItems, products]) => {

        return wishlistItems
          .map(item => {

            const product = products.find(
              product => product.id === item.productId
            );

            if (!product) {
              return null;
            }

            return {
              ...item,
              product: product
            };

          })
          .filter(
            (item): item is WishlistDisplayItem =>
              item !== null
          );

      })

    );


  // =========================
  // LOAD WISHLIST
  // =========================

  ngOnInit(): void {

    this.store.dispatch(
      loadWishlist()
    );

  }


  // =========================
  // REMOVE
  // =========================

  removeProduct(productId: number): void {

    this.store.dispatch(
      removeFromWishlist({
        productId
      })
    );

  }


  // =========================
  // CLEAR
  // =========================

  clearWishlist(): void {

    this.store.dispatch(
      clearWishlist()
    );

  }

}