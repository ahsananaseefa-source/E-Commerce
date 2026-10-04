import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import { WishlistItem } from '../models/wishlist-item.models';


@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:3000/wishlist';


  getWishlist(
    userId: string
  ): Observable<WishlistItem[]> {

    const params =
      new HttpParams()
        .set('userId', userId);

    return this.http.get<WishlistItem[]>(
      this.apiUrl,
      { params }
    );

  }


  addToWishlist(
    item: WishlistItem
  ): Observable<WishlistItem> {

    return this.http.post<WishlistItem>(
      this.apiUrl,
      item
    );

  }


  removeFromWishlist(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }


  isInWishlist(
    productId: string,
    userId: string
  ): Observable<boolean> {

    const params =
      new HttpParams()
        .set('userId', userId)
        .set('productId', productId);

    return this.http

      .get<WishlistItem[]>(
        this.apiUrl,
        { params }
      )

      .pipe(

        map(items =>
          items.length > 0
        )

      );

  }

}