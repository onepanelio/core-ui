import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";

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
    this.authService.setAuthToken(this.tokenInput.value);

    if(this.redirectUrl) {
      this.router.navigateByUrl(this.redirectUrl);
      return;
    }

    this.router.navigate(['/']);
  }
}
