import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', this.getAuthToken())
        });
        
        return next.handle(authReq);
    }
  
    private getAuthToken(): string {
        let authToken: string = localStorage.getItem('auth-token');
        return 'Bearer ' + authToken;
    }
}