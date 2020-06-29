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
                const pageUrl = this.router.url;
                const currentUrl = req.url;
                const isOnPermittedUrl = pageUrl === '/login' || currentUrl === '/login' || currentUrl.indexOf('/apis/v1beta1/auth') > -1;

                // Display a login alerts on a permissions related (401/403) error.
                // If we're already displaying such an alert, don't display it again.
                if(error.status === 401 && !this.snackbarRef && !isOnPermittedUrl) {
                    let message = 'You are not logged in';
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
                if(error.status === 403 && !this.snackbarRef && !isOnPermittedUrl) {
                    let message = 'Unauthorized';
                    this.snackbarRef = this.snackbar.open(message, 'Close');
                    this.snackbarRef.afterDismissed()
                        .subscribe(() => {
                            this.snackbarRef = null;
                        })
                }

                return throwError(error);
            })
        )
    }
}
