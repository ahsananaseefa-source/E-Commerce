import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WishlistItem } from '../models/wishlist-item.models';


@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/wishlist';


  // Get current user's wishlist
  getWishlist(
    userId: number
  ): Observable<WishlistItem[]> {

    return this.http.get<WishlistItem[]>(
      `${this.apiUrl}?userId=${userId}`
    );

  }


  // Add product to wishlist
  addToWishlist(
    item: WishlistItem
  ): Observable<WishlistItem> {

    return this.http.post<WishlistItem>(
      this.apiUrl,
      item
    );

  }


  // Remove one wishlist item
  removeFromWishlist(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }


  // Check whether product is already in wishlist
  isInWishlist(
    productId: number,
    userId: number
  ): Observable<boolean> {

    return this.http
      .get<WishlistItem[]>(
        `${this.apiUrl}?userId=${userId}&productId=${productId}`
      )
      .pipe(
        map(items => items.length > 0)
      );

  }

}