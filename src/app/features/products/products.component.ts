import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';

import {
  BehaviorSubject,
  combineLatest
} from 'rxjs';

import { map } from 'rxjs/operators';

import { loadProducts } from '../../store/products/products.actions';

import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError
} from '../../store/products/products.selectors';

import { addToCart } from '../../store/cart/cart.actions';

import {
  selectCartItems
} from '../../store/cart/cart.selectors';

import {
  addToWishlist,
  removeFromWishlist,
  loadWishlist
} from '../../store/wishlist/wishlist.actions';

import {
  selectWishlistItems
} from '../../store/wishlist/wishlist.selectors';

import { Product } from '../../core/models/product.model';

import { HeaderComponent } from '../../shared/components/header/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';


@Component({
  selector: 'app-products',

  standalone: true,

  imports: [
    AsyncPipe,
    FormsModule,
    RouterLink,
    FooterComponent,
    HeaderComponent
  ],

  templateUrl: './products.component.html',

  styleUrl: './products.component.css'
})
export class ProductsComponent {

  private store = inject(Store);

  private route = inject(ActivatedRoute);


  // =====================================================
  // FILTER CHANGE TRIGGER
  // =====================================================

  private filterChange$ =
    new BehaviorSubject<void>(undefined);


  // =====================================================
  // PAGE CHANGE TRIGGER
  // =====================================================

  private pageChange$ =
    new BehaviorSubject<number>(1);


  // =====================================================
  // FILTER VALUES
  // =====================================================

  selectedCategory = '';

  searchTerm = '';

  minPrice: number | null = null;

  maxPrice: number | null = null;

  sortOrder:
    | 'default'
    | 'lowToHigh'
    | 'highToLow' = 'default';


  // =====================================================
  // PAGINATION VALUES
  // =====================================================

  currentPage = 1;

  itemsPerPage = 6;


  // =====================================================
  // ALL PRODUCTS
  // =====================================================

  private allProducts$ =
    this.store.select(
      selectAllProducts
    );


  // =====================================================
  // FILTERED + SORTED PRODUCTS
  // =====================================================

  products$ = combineLatest([
    this.allProducts$,
    this.filterChange$
  ]).pipe(

    map(([products]) => {

      let filteredProducts = [
        ...products
      ];


      // ===============================================
      // CATEGORY FILTER
      // ===============================================

      if (this.selectedCategory) {

        filteredProducts =
          filteredProducts.filter(
            product =>
              product.category
                .toLowerCase()
                .trim() ===

              this.selectedCategory
                .toLowerCase()
                .trim()
          );

      }


      // ===============================================
      // SEARCH FILTER
      // ===============================================

      if (this.searchTerm.trim()) {

        const search =
          this.searchTerm
            .trim()
            .toLowerCase();


        filteredProducts =
          filteredProducts.filter(
            product => {

              const name =
                product.name
                  .toLowerCase();

              const category =
                product.category
                  .toLowerCase();

              const description =
                product.description
                  .toLowerCase();


              const searchPattern =
                new RegExp(
                  `\\b${this.escapeRegExp(search)}\\b`,
                  'i'
                );


              return (
                searchPattern.test(name) ||
                searchPattern.test(category) ||
                searchPattern.test(description)
              );

            }
          );

      }


      // ===============================================
      // MINIMUM PRICE
      // ===============================================

      if (
        this.minPrice !== null &&
        this.minPrice >= 0
      ) {

        filteredProducts =
          filteredProducts.filter(
            product =>
              product.price >= this.minPrice!
          );

      }


      // ===============================================
      // MAXIMUM PRICE
      // ===============================================

      if (
        this.maxPrice !== null &&
        this.maxPrice >= 0
      ) {

        filteredProducts =
          filteredProducts.filter(
            product =>
              product.price <= this.maxPrice!
          );

      }


      // ===============================================
      // PRICE SORTING
      // ===============================================

      if (
        this.sortOrder === 'lowToHigh'
      ) {

        filteredProducts.sort(
          (a, b) =>
            a.price - b.price
        );

      }

      else if (
        this.sortOrder === 'highToLow'
      ) {

        filteredProducts.sort(
          (a, b) =>
            b.price - a.price
        );

      }


      return filteredProducts;

    })

  );


  // =====================================================
  // PAGINATED PRODUCTS
  // =====================================================

  paginatedProducts$ =
    combineLatest([
      this.products$,
      this.pageChange$
    ]).pipe(

      map(([products, page]) => {

        const startIndex =
          (page - 1) *
          this.itemsPerPage;

        const endIndex =
          startIndex +
          this.itemsPerPage;


        return products.slice(
          startIndex,
          endIndex
        );

      })

    );


  // =====================================================
  // TOTAL PAGES
  // =====================================================

  totalPages$ =
    this.products$.pipe(

      map(products =>
        Math.ceil(
          products.length /
          this.itemsPerPage
        )
      )

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
  // CART
  // =====================================================

  cartItems$ =
    this.store.select(
      selectCartItems
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

    // ===============================================
    // LOAD PRODUCTS
    // ===============================================

    this.store.dispatch(
      loadProducts()
    );


    // ===============================================
    // LOAD WISHLIST
    // ===============================================

    this.store.dispatch(
      loadWishlist()
    );


    // ===============================================
    // READ URL PARAMETERS
    // ===============================================

    this.route.queryParams
      .subscribe(params => {

        if (params['search']) {

          this.searchTerm =
            params['search'];

          this.selectedCategory = '';

        }

        else {

          this.selectedCategory =
            params['category'] || '';

          this.searchTerm = '';

        }


        // Reset pagination

        this.currentPage = 1;

        this.pageChange$.next(
          this.currentPage
        );


        // Recalculate products

        this.filterChange$.next();

      });

  }


  // =====================================================
  // ESCAPE REGEX
  // =====================================================

  private escapeRegExp(
    value: string
  ): string {

    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

  }


  // =====================================================
  // PRICE FILTER CHANGE
  // =====================================================

  onPriceFilterChange(): void {

    this.currentPage = 1;


    // Recalculate filtered products

    this.filterChange$.next();


    // Reset pagination

    this.pageChange$.next(
      this.currentPage
    );

  }


  // =====================================================
  // SORT CHANGE
  // =====================================================

  onSortChange(): void {

    // Reset to first page

    this.currentPage = 1;


    // Recalculate products

    this.filterChange$.next();


    // Update pagination

    this.pageChange$.next(
      this.currentPage
    );

  }


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  clearFilters(): void {

    this.minPrice = null;

    this.maxPrice = null;

    this.sortOrder = 'default';

    this.selectedCategory = '';

    this.searchTerm = '';

    this.currentPage = 1;


    // Recalculate products

    this.filterChange$.next();


    // Reset pagination

    this.pageChange$.next(
      this.currentPage
    );

  }


  // =====================================================
  // NEXT PAGE
  // =====================================================

  nextPage(
    totalPages: number
  ): void {

    if (
      this.currentPage <
      totalPages
    ) {

      this.currentPage++;


      this.pageChange$.next(
        this.currentPage
      );


      this.scrollToTop();

    }

  }


  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  previousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.currentPage--;


      this.pageChange$.next(
        this.currentPage
      );


      this.scrollToTop();

    }

  }


  // =====================================================
  // GO TO PAGE
  // =====================================================

  goToPage(
    page: number
  ): void {

    this.currentPage = page;


    this.pageChange$.next(
      this.currentPage
    );


    this.scrollToTop();

  }


  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  getPageNumbers(
    totalPages: number
  ): number[] {

    return Array.from(
      {
        length: totalPages
      },

      (_, index) =>
        index + 1
    );

  }


  // =====================================================
  // SCROLL TO TOP
  // =====================================================

  private scrollToTop(): void {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  // =====================================================
  // ADD TO CART
  // =====================================================

  addProductToCart(
    product: Product,
    cartItems: any[]
  ): void {

    if (
      this.isInCart(
        product,
        cartItems
      )
    ) {

      return;

    }


    if (
      product.stock <= 0
    ) {

      return;

    }


    this.store.dispatch(
      addToCart({
        product,
        quantity: 1
      })
    );

  }


  // =====================================================
  // CHECK PRODUCT IN CART
  // =====================================================

  isInCart(
    product: Product,
    cartItems: any[]
  ): boolean {

    return cartItems.some(
      item =>
        item.product.id ===
        product.id
    );

  }


  // =====================================================
  // CHECK PRODUCT IN WISHLIST
  // =====================================================

  isInWishlist(
    product: Product,
    wishlistItems: any[]
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
    wishlistItems: any[]
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