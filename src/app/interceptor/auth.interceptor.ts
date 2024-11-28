import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { LocalStorageConstants, RouteConstants } from '../constants/app.constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem(LocalStorageConstants.Token);
    
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.clear();
          this.router.navigate([RouteConstants.UserLogin]);
        }
        return throwError(error);
      })
    );
  }
};
