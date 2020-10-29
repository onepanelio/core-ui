import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl?: string;
  private username?: string;
  private authToken?: string;

  get isLoggedIn(): boolean {
    const authToken = localStorage.getItem('auth-token');
    let cookieTokenExists = false;

    for (const cookie of document.cookie.split(';')) {
      const items = cookie.split('=');
      if (items[0].trim() === 'auth-token') {
        cookieTokenExists = true;
      }
    }

    return !!authToken && cookieTokenExists;
  }

  constructor() { }

  private setCookie(name: string, value: string, domain?: string) {
    const expires = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toUTCString();

    let cookieString = name + '=' + value + ';path=/;expires=' + expires;
    if (domain) {
      cookieString += ';domain=' + domain;
    }

    document.cookie = cookieString;
  }

  private removeCookie(name: string, domain?: string) {
    let cookieString = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    if (domain) {
      cookieString += ';domain=' + domain;
    }

    document.cookie = cookieString;
  }

  setLogin(username: string, token: string, domain?: string) {
    // When using a local environment, we don't want the domain set as we could be connected to a live running server
    // on it's domain. This causes issues with cookies, so we don't set a domain when running locally.
    if (environment.type === 'local') {
      domain = undefined;
    }

    localStorage.setItem('auth-token', token);
    localStorage.setItem('auth-username', username);
    if (domain) {
      localStorage.setItem('auth-domain', domain);
    }

    this.setCookie('auth-username', username, domain);
    this.setCookie('auth-token', token, domain);

    this.authToken = token;
    this.username = username;
  }

  clearTokens() {
    const domain = localStorage.getItem('auth-domain');

    this.removeCookie('auth-username', domain);
    this.removeCookie('auth-token', domain);

    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-username');
    localStorage.removeItem('auth-domain');

    this.authToken = undefined;
    this.username = undefined;
  }

  getAuthToken(): string {
    if (this.authToken) {
      return this.authToken;
    }

    return localStorage.getItem('auth-token');
  }

  getAuthHeader(): string {
    return 'Bearer ' + this.getAuthToken();
  }
}
