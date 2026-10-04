import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Store } from '@ngrx/store';

import {
  map,
  switchMap,
  of
} from 'rxjs';

import { Product } from '../../../core/models/product.model';
import { WishlistItem } from '../../../core/models/wishlist-item.models';

import {
  loadProducts
} from '../../../store/products/products.actions';

import {
  selectAllProducts
} from '../../../store/products/products.selectors';

import {
  addToCart
} from '../../../store/cart/cart.actions';

import {
  addToWishlist,
  removeFromWishlist,
  loadWishlist
} from '../../../store/wishlist/wishlist.actions';

import {
  selectWishlistItems
} from '../../../store/wishlist/wishlist.selectors';

import {
  HeaderComponent
} from '../../../shared/components/header/header/header.component';

import {
  FooterComponent
} from '../../../shared/components/footer/footer.component';


@Component({
  selector: 'app-product-details',

  standalone: true,

  imports: [
    AsyncPipe,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],

  templateUrl: './product-details.component.html',

  styleUrl: './product-details.component.css'
})


export class ProductDetailsComponent {

  private store = inject(Store);

  private route = inject(ActivatedRoute);

  private router = inject(Router);


  readonly MAX_CART_QUANTITY = 5;


  quantity = 1;


  // =================================
  // ADD TO CART STATE
  // =================================

  addedToCart = false;


  // =================================
  // LOGIN MESSAGE STATE
  // =================================

  loginMessage = false;


  // =================================
  // ALL PRODUCTS
  // =================================

  private allProducts$ =
    this.store.select(
      selectAllProducts
    );


  // =================================
  // CURRENT PRODUCT
  // =================================

  product$ =
    this.route.paramMap.pipe(

      switchMap(params => {

        const id = params.get('id');

        return this.allProducts$.pipe(

          map(products =>

            products.find(
              product =>
                product.id === id
            ) ?? null

          )

        );

      })

    );


  // =================================
  // SIMILAR PRODUCTS
  // =================================

  similarProducts$ =
    this.product$.pipe(

      switchMap(product => {

        if (!product) {

          return of([]);

        }


        return this.allProducts$.pipe(

          map(products =>

            products.filter(

              similarProduct =>

                similarProduct.id !==
                product.id &&

                similarProduct.category
                  .toLowerCase() ===
                product.category
                  .toLowerCase()

            )

          )

        );

      })

    );


  // =================================
  // WISHLIST
  // =================================

  wishlistItems$ =
    this.store.select(
      selectWishlistItems
    );


  // =================================
  // CONSTRUCTOR
  // =================================

  constructor() {

    this.store.dispatch(
      loadProducts()
    );

    this.store.dispatch(
      loadWishlist()
    );

  }


  // =================================
  // MAXIMUM QUANTITY
  // =================================

  getMaximumQuantity(
    stock: number
  ): number {

    return Math.min(
      this.MAX_CART_QUANTITY,
      stock
    );

  }


  // =================================
  // INCREASE QUANTITY
  // =================================

  increaseQuantity(
    stock: number
  ): void {

    const maximumQuantity =
      this.getMaximumQuantity(
        stock
      );


    if (
      this.quantity <
      maximumQuantity
    ) {

      this.quantity++;

    }

  }


  // =================================
  // DECREASE QUANTITY
  // =================================

  decreaseQuantity(): void {

    if (
      this.quantity > 1
    ) {

      this.quantity--;

    }

  }


  // =================================
  // ADD PRODUCT TO CART
  // =================================

  addProductToCart(
    product: Product
  ): void {

    // Check login first
    if (
      !localStorage.getItem('token')
    ) {

      this.loginMessage = true;

      return;

    }


    // Prevent adding again
    if (
      this.addedToCart
    ) {

      return;

    }


    // Product out of stock
    if (
      product.stock <= 0
    ) {

      return;

    }


    const maximumQuantity =
      this.getMaximumQuantity(
        product.stock
      );


    const quantityToAdd =
      Math.min(
        this.quantity,
        maximumQuantity
      );


    this.store.dispatch(

      addToCart({

        product,

        quantity:
          quantityToAdd

      })

    );


    // Disable button after adding
    this.addedToCart = true;

  }


  // =================================
  // BUY NOW
  // =================================

  buyNow(
    product: Product
  ): void {

    // Check login
    if (
      !localStorage.getItem('token')
    ) {

      this.loginMessage = true;

      return;

    }


    if (
      product.stock <= 0
    ) {

      return;

    }


    this.addProductToCart(
      product
    );


    this.router.navigate([
      '/checkout'
    ]);

  }


  // =================================
  // CLOSE LOGIN MESSAGE
  // =================================

  closeLoginMessage(): void {

    this.loginMessage = false;

  }


  // =================================
  // GO TO LOGIN
  // =================================

  goToLogin(): void {

    this.loginMessage = false;

    this.router.navigate([
      '/auth'
    ]);

  }


  // =================================
  // CHECK WISHLIST
  // =================================

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


  // =================================
  // TOGGLE WISHLIST
  // =================================

  toggleWishlist(
    product: Product,
    wishlistItems: WishlistItem[]
  ): void {

    const alreadyInWishlist =
      this.isInWishlist(
        product,
        wishlistItems
      );


    if (
      alreadyInWishlist
    ) {

      this.store.dispatch(

        removeFromWishlist({

          productId:
            product.id

        })

      );

    } else {

      this.store.dispatch(

        addToWishlist({

          product

        })

      );

    }

  }

}