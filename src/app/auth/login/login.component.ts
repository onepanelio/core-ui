import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { AuthServiceService } from "../../../api";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";
import { AppRouter } from "../../router/app-router.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  tokenInput: AbstractControl;

  redirectUrl = null;

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
    if(state.referer) {
      this.redirectUrl = state.referer;
    }
  }

  login() {
    if(this.tokenInput.value.length === 0) {
      this.tokenInput.setErrors({error: 'Must not be blank'});
      return;
    }

    const tokenValue = this.tokenInput.value;
    const token = `Bearer ${tokenValue}`;

    this.apiAuthService.isValidToken({token: token})
        .subscribe(res => {
            this.authService.setAuthToken(tokenValue);

            this.namespaceTracker.getNamespaces();

            if(this.redirectUrl) {
              this.appRouter.navigateByUrl(this.redirectUrl);
              return;
            }

            this.appRouter.navigateToHomePage();
        }, err => {
          this.tokenInput.setErrors({error: 'Invalid token'})
        })
  }
}
