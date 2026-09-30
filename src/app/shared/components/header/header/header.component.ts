import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { selectWishlistCount } from '../../../../store/wishlist/wishlist.selectors';
import { selectCartItemCount } from '../../../../store/cart/cart.selectors';

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

  cartItemCount$ = this.store.select(selectCartItemCount);
  wishlistCount$ = this.store.select(selectWishlistCount);

  searchProduct(value: string): void {

    const search = value.trim();

    if (!search) {
      return;
    }

    this.router.navigate(
      ['/products'],
      {
        queryParams: {
          search: search
        }
      }
    );

  }
  logout(): void {

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/auth']);

  }
  showCategoryMenu = false;

toggleCategoryMenu(): void {
  this.showCategoryMenu = !this.showCategoryMenu;
}

closeCategoryMenu(): void {
  this.showCategoryMenu = false;
}

showMobileMenu = false;

toggleMobileMenu(): void {
  this.showMobileMenu = !this.showMobileMenu;

  this.showCategoryMenu = false;
}

closeMobileMenu(): void {
  this.showMobileMenu = false;
}

}

