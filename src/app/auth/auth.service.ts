import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl: string;
  private authToken?: string;

  get isLoggedIn(): boolean {
    const authToken = localStorage.getItem('auth-token');
    let cookieTokenExists = false;

    for(const cookie of document.cookie.split(';')) {
      const items = cookie.split('=');
      if(items[0].trim() === 'auth-token') {
        cookieTokenExists = true;
      }
    }

    return !!authToken && cookieTokenExists;
  }

  constructor() { }

  setAuthToken(token: string, domain?: string) {
    localStorage.setItem('auth-token', token);
    const expires = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toUTCString();

    let cookieString = 'auth-token=' + token + ';path=/;expires=' + expires;
    if(domain) {
      cookieString += ';domain=' + domain;
      localStorage.setItem('auth-domain', domain);
    }

    document.cookie = cookieString;

    this.authToken = token;
  }

  clearTokens() {
    const domain = localStorage.getItem('auth-domain');
    let cookieString = 'auth-token=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if(domain) {
      cookieString += ';domain=' + domain;
    }

    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-domain');

    document.cookie = cookieString;
    this.authToken = undefined;
  }

  getAuthToken(): string {
    if(this.authToken) {
      return this.authToken;
    }

    return localStorage.getItem('auth-token');
  }

  getAuthHeader(): string {
    return 'Bearer ' + this.getAuthToken();
  }
}
