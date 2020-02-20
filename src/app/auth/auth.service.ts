import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  get isLoggedIn(): boolean {
    const authToken = localStorage.getItem('auth-token');

    return !!authToken;
  }

  redirectUrl?: string;

  constructor() { }

  setAuthToken(token: string) {
    localStorage.setItem('auth-token', token);
    const expires: Date = new Date(new Date().setFullYear(new Date().getFullYear() + 10));
    document.cookie = 'auth-token=' + token + ';path=/;expires=' + expires + ';secure;';
  }

  clearTokens() {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;secure;';
  }

  takeRedirectUrl(defaultValue = '/'): string|undefined {
    const url = this.redirectUrl;

    this.redirectUrl = undefined;

    if (!url) {
      return defaultValue;
    }

    return url;
  }
}
