import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { UserLogin } from '../models/requestModel/user-login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseAuthAPIUrl = environment.apiUrl + 'Auth/';
  
  constructor(private readonly http: HttpClient) { }

  userLogin(loginDetails:UserLogin): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseAuthAPIUrl}login`, loginDetails);
  }  
}
