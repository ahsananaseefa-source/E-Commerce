import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs';
import { Router } from '@angular/router';

import { Product } from '../../../core/models/product.model';

import {
  loadProducts
} from '../../../store/products/products.actions';

import {
  selectAllProducts
} from '../../../store/products/products.selectors';

import {
  selectWishlistItems
} from '../../../store/wishlist/wishlist.selectors';

import {
  addToCart
} from '../../../store/cart/cart.actions';

import {
  addToWishlist
} from '../../../store/wishlist/wishlist.actions';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    AsyncPipe
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {

  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  quantity = 1;

  product$ = this.route.paramMap.pipe(

    switchMap(params => {

      const id = params.get('id');

      return this.store.select(selectAllProducts).pipe(

        map(products =>
          products.find(
            product => String(product.id) === id
          ) ?? null
        )

      );

    })

  );

  wishlistItems$ =
    this.store.select(selectWishlistItems);


  constructor() {

    this.store.dispatch(loadProducts());

  }

 increaseQuantity(stock: number): void {

  if (this.quantity < stock) {

    this.quantity++;

  }

}

decreaseQuantity(): void {

  if (this.quantity > 1) {

    this.quantity--;

  }

}


  addProductToCart(product: Product): void {

    this.store.dispatch(
      addToCart({ product,
        quantity: this.quantity })
    );

  }


  addProductToWishlist(product: Product): void {

    this.store.dispatch(
      addToWishlist({ product })
    );

  }


  isInWishlist(
    product: Product,
    wishlistItems: any[]
  ): boolean {

    return wishlistItems.some(
      item => item.product.id === product.id
    );

  }


  buyNow(product: Product): void {

    this.store.dispatch(
      addToCart({ product ,
        quantity: this.quantity
      })
    );

    this.router.navigate(['/checkout']);

  }

}