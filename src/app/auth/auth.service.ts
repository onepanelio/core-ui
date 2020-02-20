import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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

  setAuthToken(token: string) {
    localStorage.setItem('auth-token', token);
    const expires = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toUTCString();
    document.cookie = 'auth-token=' + token + ';path=/;expires=' + expires;
  }

  clearTokens() {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}
