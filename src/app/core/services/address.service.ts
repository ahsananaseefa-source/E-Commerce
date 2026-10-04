import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/address';

  getUserAddresses(userId: string): Observable<Address[]> {
    const params = new HttpParams()
      .set('userId', userId);

    return this.http.get<Address[]>(this.apiUrl, { params });
  }

  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.http.patch<Address>(
      `${this.apiUrl}/${id}`,
      address
    );
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}