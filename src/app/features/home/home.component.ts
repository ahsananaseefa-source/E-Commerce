import { Component, inject } from '@angular/core';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { HeaderComponent } from '../../shared/components/header/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

import { loadProducts } from '../../store/products/products.actions';

import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError
} from '../../store/products/products.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    SlicePipe,
    RouterLink,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private store = inject(Store);

  categories = [
    'Rings',
    'Earrings',
    'Bracelets',
    'Bangles',
    'Chains',
    'Anklets'
  ];

  products$ = this.store.select(selectAllProducts);

  loading$ = this.store.select(selectProductsLoading);

  error$ = this.store.select(selectProductsError);

  constructor() {
    this.store.dispatch(loadProducts());
  }
}