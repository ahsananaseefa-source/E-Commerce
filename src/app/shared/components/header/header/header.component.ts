import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import {
  selectWishlistCount
} from '../../../../store/wishlist/wishlist.selectors';

import {
  loadWishlist
} from '../../../../store/wishlist/wishlist.actions';

import {
  selectCartItemCount
} from '../../../../store/cart/cart.selectors';


@Component({
  selector: 'app-header',

  standalone: true,

  imports: [
    AsyncPipe,
    RouterLink
  ],

  templateUrl: './header.component.html',

  styleUrl: './header.component.css'
})
export class HeaderComponent {

  private store = inject(Store);

  private router = inject(Router);


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
  // HEADER COUNTS
  // =====================================================

  cartItemCount$ =
    this.store.select(
      selectCartItemCount
    );

  wishlistCount$ =
    this.store.select(
      selectWishlistCount
    );


  // =====================================================
  // HEADER STATE
  // =====================================================

  showCategoryMenu = false;

  showMobileMenu = false;

  showProfileMenu = false;


  // =====================================================
  // USER STATE
  // =====================================================

  get isLoggedIn(): boolean {

    return !!localStorage.getItem('token');

  }


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {

    this.store.dispatch(
      loadWishlist()
    );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  searchProduct(value: string): void {

    const search = value.trim();

    if (!search) {
      return;
    }

    this.closeAllMenus();

    this.router.navigate(
      ['/products'],
      {
        queryParams: {
          search: search
        }
      }
    );

  }


  // =====================================================
  // CATEGORY NAVIGATION
  // =====================================================

  selectCategory(category: string): void {

    this.closeAllMenus();

    this.router.navigate(
      ['/products'],
      {
        queryParams: {
          category: category
        }
      }
    );

  }


  // =====================================================
  // PROFILE MENU
  // =====================================================

  toggleProfileMenu(): void {

    this.showProfileMenu =
      !this.showProfileMenu;

    this.showCategoryMenu = false;

  }


  closeProfileMenu(): void {

    this.showProfileMenu = false;

  }


  goToAccount(): void {

    this.closeAllMenus();

    this.router.navigate([
      '/account'
    ]);

  }


  goToLogin(): void {

    this.closeAllMenus();

    this.router.navigate([
      '/auth'
    ]);

  }


  goToRegister(): void {

    this.closeAllMenus();

    this.router.navigate(
      ['/auth'],
      {
        queryParams: {
          mode: 'register'
        }
      }
    );

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    localStorage.removeItem('userId');

    this.closeAllMenus();

    this.router.navigate([
      '/auth'
    ]);

  }


  // =====================================================
  // CATEGORY MENU
  // =====================================================

  toggleCategoryMenu(): void {

    this.showCategoryMenu =
      !this.showCategoryMenu;

    this.showProfileMenu = false;

  }


  closeCategoryMenu(): void {

    this.showCategoryMenu = false;

  }


  // =====================================================
  // MOBILE MENU
  // =====================================================

  toggleMobileMenu(): void {

    this.showMobileMenu =
      !this.showMobileMenu;

    this.showCategoryMenu = false;

    this.showProfileMenu = false;

  }


  closeMobileMenu(): void {

    this.showMobileMenu = false;

  }


  // =====================================================
  // CLOSE ALL MENUS
  // IMPORTANT:
  // This cannot be private because HTML calls it.
  // =====================================================

  closeAllMenus(): void {

    this.showCategoryMenu = false;

    this.showMobileMenu = false;

    this.showProfileMenu = false;

  }

}