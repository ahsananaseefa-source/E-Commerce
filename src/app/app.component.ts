import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadCart } from './store/cart/cart.actions';
import { loadWishlist } from './store/wishlist/wishlist.actions';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  private store = inject(Store);

  constructor() {
    this.store.dispatch(loadCart());
     this.store.dispatch(loadWishlist());
  }
  
  }

