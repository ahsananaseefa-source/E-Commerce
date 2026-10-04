import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { User } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/user';


  register(user: User): Observable<User> {

    return this.http.post<User>(
      this.apiUrl,
      user
    );

  }


  login(
    email: string,
    password: string
  ): Observable<User[]> {

    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http.get<User[]>(
      this.apiUrl,
      { params }
    );

  }


  getUserByEmail(
    email: string
  ): Observable<User[]> {

    const params = new HttpParams()
      .set('email', email);

    return this.http.get<User[]>(
      this.apiUrl,
      { params }
    );

  }

}