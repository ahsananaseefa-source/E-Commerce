import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { CartComponent } from './features/cart/cart.component';
import { ProductsComponent } from './features/products/products.component';
export const routes: Routes = [
    {
         path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component')
        .then(m => m.AuthComponent)
    },
    {
      path: 'checkout',
    loadComponent: () =>
    import('./features/checkout/checkout.component')
      .then(m => m.CheckoutComponent),
    canActivate: [authGuard]
    },
    {
        path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details/product-details.component')
        .then(m => m.ProductDetailsComponent),
    canActivate: [authGuard]

    },
    {
        path:'products',
        component: ProductsComponent,
        canActivate:[authGuard]
    },
    

    {
        path:'home',
        component:HomeComponent,
        canActivate:[authGuard]
    },
    {
        path:'wishlist',
        component:WishlistComponent,
        canActivate:[authGuard]
    },
     {
        path:'cart',
        component:CartComponent,
  
    },
    {
  path: 'order/:id',
  loadComponent: () =>
    import('./features/order-details/order-details.component')
      .then(m => m.OrderDetailsComponent),
  canActivate: [authGuard]
},
    {
        path: 'order',
    loadComponent: () =>
    import('./features/order/order.component')
      .then(m => m.OrderComponent),
       canActivate: [authGuard]
    },
    {
       path: 'order-success',
  loadComponent: () =>
    import('./features/order-success/order-success.component')
      .then(m => m.OrderSuccessComponent),
  canActivate: [authGuard]
    },
    {
        path:'',
        redirectTo:'home',
        pathMatch:'full'
    }
];
