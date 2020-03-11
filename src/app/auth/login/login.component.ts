import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { AuthServiceService } from "../../../api";
import { NamespaceTracker } from "../../namespace/namespace-tracker.service";

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
      private formBuilder: FormBuilder,
      private authService: AuthService,
      private router: Router,
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

    this.authService.setAuthToken(this.tokenInput.value);

    this.apiAuthService.isValidToken()
        .subscribe(res => {
          if (res.valid) {
            this.namespaceTracker.getNamespaces();

            if(this.redirectUrl) {
              this.router.navigateByUrl(this.redirectUrl);
              return;
            }

            this.router.navigate(['/']);
          } else {
            this.authService.clearTokens();
            this.tokenInput.setErrors({error: 'Invalid token'})
          }
        })
  }
}
