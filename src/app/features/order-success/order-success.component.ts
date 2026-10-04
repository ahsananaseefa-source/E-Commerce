import { Component } from '@angular/core';
import {   RouterLink } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header/header.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink,HeaderComponent],
  templateUrl: './order-success.component.html',
  styleUrl: './order-success.component.css'
})
export class OrderSuccessComponent {

}
