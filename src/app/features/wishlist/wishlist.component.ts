import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

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

import { HeaderComponent } from '../../shared/components/header/header/header.component';

interface WishlistDisplayItem {
  id?: string;
  userId: string;
  productId: string;
  addedAt: string;
  product: Product;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {

  private store = inject(Store);
  private productService = inject(ProductService);

  wishlistItems$ =
    this.store.select(selectWishlistItems);

  wishlistCount$ =
    this.store.select(selectWishlistCount);

  isWishlistEmpty$ =
    this.store.select(selectIsWishlistEmpty);

  products$ =
    this.productService.getProducts();


  wishlistDisplayItems$:
    Observable<WishlistDisplayItem[]> =
    combineLatest([
      this.wishlistItems$,
      this.products$
    ]).pipe(

      map(([wishlistItems, products]) => {

        return wishlistItems

          .map(item => {

            const product =
              products.find(
                product =>
                  product.id === item.productId
              );

            if (!product) {
              return null;
            }

            return {
              ...item,
              product
            };

          })

          .filter(
            (
              item
            ): item is WishlistDisplayItem =>
              item !== null
          );

      })

    );


  ngOnInit(): void {

    this.store.dispatch(
      loadWishlist()
    );

  }


  removeProduct(productId: string): void {

    this.store.dispatch(
      removeFromWishlist({
        productId
      })
    );

  }


  clearWishlist(): void {

    this.store.dispatch(
      clearWishlist()
    );

  }

}