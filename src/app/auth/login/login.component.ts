import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthServiceService } from '../../../api';
import { NamespaceTracker } from '../../namespace/namespace-tracker.service';
import { AppRouter } from '../../router/app-router.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '../../alert/alert.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    form: FormGroup;
    usernameInput: AbstractControl;
    tokenInput: AbstractControl;
    loggingIn = false;

    constructor(
        private alertService: AlertService,
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private appRouter: AppRouter,
        private apiAuthService: AuthServiceService,
        private namespaceTracker: NamespaceTracker
    ) {
        this.form = this.formBuilder.group({
            username: ['', Validators.compose([
                Validators.required,
                Validators.minLength(3)
            ])],
            token: ['', Validators.compose([
                Validators.required,
                Validators.minLength(3)
            ])],
        });

        this.tokenInput = this.form.get('token');
        this.usernameInput = this.form.get('username');
    }

    ngOnInit() {
        this.snackBar.dismiss();

        const state = history.state;
        if (state.referer && !this.authService.redirectUrl) {
            this.authService.redirectUrl = state.referer;
        }
    }

    login() {
        let error = false;
        if (this.usernameInput.value.length === 0) {
            this.usernameInput.setErrors({error: 'Must not be blank'});

            error = true;
        }
        if (this.tokenInput.value.length === 0) {
            this.tokenInput.setErrors({error: 'Must not be blank'});

            error = true;
        }

        if (error) {
            return;
        }

        this.loggingIn = true;

        this.apiAuthService.getAccessToken({
            token: this.tokenInput.value,
            username: this.usernameInput.value
        }).subscribe(res => {
            this.authService.setLogin(this.usernameInput.value, res.accessToken, res.domain);

            this.namespaceTracker.activeNamespace = res.username;
            this.namespaceTracker.getNamespaces();

            if (this.authService.redirectUrl) {
                this.appRouter.navigateByUrl(this.authService.redirectUrl);
                this.authService.redirectUrl = null;
                this.loggingIn = false;
                return;
            }

            this.appRouter.navigateToNamespaceHomepage(res.username);
            this.loggingIn = false;
        }, (err: HttpErrorResponse) => {
            if (err.status === 0) {
                this.alertService.danger('Unable to connect to server');
            } else if (err.status > 499) {
                this.alertService.danger('Server error occurred');
            } else if (err.status === 400) {
                this.tokenInput.setErrors({error: 'Invalid token'});
            } else {
                this.alertService.danger('Unknown error');
            }

            this.loggingIn = false;
        });
    }
}
