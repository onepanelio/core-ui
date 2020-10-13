import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AuthServiceService } from '../../../api';
import { NamespaceTracker } from '../../namespace/namespace-tracker.service';
import { AppRouter } from '../../router/app-router.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

        this.apiAuthService.isValidToken({
            token: this.tokenInput.value,
            username: this.usernameInput.value
        })
            .subscribe(res => {
                this.authService.setLogin(res.username, res.jwtToken);

                this.namespaceTracker.getNamespaces();

                if (this.authService.redirectUrl) {
                    this.appRouter.navigateByUrl(this.authService.redirectUrl);
                    this.authService.redirectUrl = null;
                    this.loggingIn = false;
                    return;
                }

                this.appRouter.navigateToHomePage();
                this.loggingIn = false;
            }, err => {
                this.tokenInput.setErrors({error: 'Invalid token'});
                this.loggingIn = false;
            });
    }
}
