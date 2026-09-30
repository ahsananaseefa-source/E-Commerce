import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private storageKey = 'zell-cart';

  saveCart(items: CartItem[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(items)
    );
  }

  getCart(): CartItem[] {
    const cart = localStorage.getItem(this.storageKey);

    if (!cart) {
      return [];
    }

    return JSON.parse(cart);
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }
}