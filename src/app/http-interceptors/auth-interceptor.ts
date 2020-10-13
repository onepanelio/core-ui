import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Skip auth token request as it doesn't need an auth header.
        if (req.url.endsWith('/apis/v1beta1/auth/token')) {
            return next.handle(req);
        }

        const authReq = req.clone({
            headers: req.headers.set('Authorization', this.authService.getAuthHeader())
        });

        return next.handle(authReq);
    }
}
