import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from "rxjs/operators";
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Injectable()
export class PermissionInterceptor implements HttpInterceptor {
    private snackbarRef: MatSnackBarRef<SimpleSnackBar>;

    constructor(private snackbar: MatSnackBar,
                private router: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                const currentUrl = this.router.url;
                const isOnLogin =  currentUrl === '/login';
                const errorStatus = error.status === 401 || error.status === 403;
                // Display a login alert on a permissions related (401/403) error.
                // If we're already displaying such an alert, don't display it again.
                if(errorStatus && !this.snackbarRef && !isOnLogin) {
                    let message = 'Not logged in';
                    if(error.status === 403) {
                        message = 'Unauthorized'
                    }

                    this.snackbarRef = this.snackbar.open(message, 'Login');
                    this.snackbarRef.afterDismissed()
                        .subscribe(res => {
                            this.snackbarRef = null;
                            if(res.dismissedByAction) {
                                this.router.navigate(['/', 'login'], {state: {
                                    'referer': this.router.url
                                    }});
                            }
                        })
                }

                return throwError(error);
            })
        )
    }
}
