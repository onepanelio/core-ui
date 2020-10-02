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
      token: ['', Validators.compose([
        Validators.required,
      ])],
    });

    this.tokenInput = this.form.get('token');
  }

  ngOnInit() {
    this.snackBar.dismiss();

    const state = history.state;
    if (state.referer && !this.authService.redirectUrl) {
      this.authService.redirectUrl = state.referer;
    }
  }

  login() {
    if (this.tokenInput.value.length === 0) {
      this.tokenInput.setErrors({error: 'Must not be blank'});
      return;
    }

    this.loggingIn = true;
    const tokenValue = this.tokenInput.value;
    const token = `Bearer ${tokenValue}`;

    this.apiAuthService.isValidToken({token})
        .subscribe(res => {
            this.authService.setAuthToken(tokenValue, res.domain);

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
