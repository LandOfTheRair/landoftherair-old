import { Injectable } from '@angular/core';
import { of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import auth0 from 'auth0-js';

import { environment } from '../environments/environment';

import { startsWith } from 'lodash';

@Injectable()
export class AuthService {

  refreshSubscription: any;
  private isScheduled: boolean;

  auth0 = new auth0.WebAuth({
    clientID: environment.auth0.client,
    domain: environment.auth0.domain,
    responseType: 'token id_token',
    audience: environment.auth0.apiUrl,
    redirectUri: environment.auth0.callbackUrl,
    scope: 'openid email profile'
  });

  isReady: Promise<any>;
  private resolveReady: any;

  public get testUsername(): string {
    return new URLSearchParams(window.location.search || '').get('username');
  }

  constructor() {
    this.isReady = new Promise(resolve => this.resolveReady = resolve);
    this.renewIfAuthenticated();
  }

  public async login() {
    await this.resolveReady();
    this.auth0.authorize();
  }

  public async handleAuthentication(): Promise<any> {
    return new Promise((resolve, reject) => {

      const username = this.testUsername;
      if(username) {
        const authResult = {
          expiresIn: 36000000,
          idToken: 'DEV_ID_TOKEN',
          accessToken: 'DEV_ACCESS_TOKEN',
          idTokenPayload: {
            sub: `dev|${username}`
          }
        };

        localStorage.setItem('user_name', username);
        this.setSession(authResult);
        resolve();
        this.resolveReady(authResult);
        return;
      }

      this.auth0.parseHash({ hash: window.location.hash }, (err, authResult) => {

        // just authenticated
        if(authResult && authResult.accessToken && authResult.idToken) {
          window.location.hash = '';
          this.setSession(authResult);
          resolve();

        // failed to auth
        } else if(err) {
          console.error('AUTH ERROR', err);
          reject(err);

        // already authenticated
        } else {
          resolve();
        }

        this.resolveReady(authResult);
      });
    });
  }

  private renewIfAuthenticated() {
    if(!this.isAuthenticated()) return;

    this.renewToken();
  }

  private setSession(authResult?): void {

    if(authResult) {
      // Set the time that the access token will expire at
      const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());

      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);

      if(authResult.idTokenPayload && authResult.idTokenPayload.sub) {
        localStorage.setItem('user_id', authResult.idTokenPayload.sub);
      }
    } else {
      console.error(new Error('No auth result was given.'));
    }

    this.scheduleRenewal();
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user_id');

    this.unscheduleRenewal();
  }

  public isAuthenticated(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  public renewToken() {
    this.auth0.renewAuth({
      audience: environment.auth0.apiUrl,
      redirectUri: `${environment.server.protocol}://${environment.server.domain}:${environment.server.port}/silent-${environment.server.silentExt}`,
      usePostMessage: true
    }, (err, result) => {
      if(!err && !result && this.isAuthenticated()) {
        console.error(new Error('Could not successfully renew auth token.'), err, result);
        this.scheduleRenewal();
        return;
      }

      if(err || result.error) {
        console.error(err);
      } else {
        this.setSession(result);
        this.cleanUpIframes();
      }
    });
  }

  public scheduleRenewal() {
    if(!this.isAuthenticated() || this.isScheduled) return;
    this.isScheduled = true;
    this.clearOldNonces();

    const expiresAt = JSON.parse(window.localStorage.getItem('expires_at'));

    const source = of(expiresAt)
      .pipe(
        mergeMap((expiresAtTime) => {
          const now = Date.now();

          // Use the delay in a timer to
          // run the refresh at the proper time
          return timer(Math.max(1, expiresAtTime - now));
      }));

    // Once the delay time from above is
    // reached, get a new JWT and schedule
    // additional refreshes
    this.refreshSubscription = source.subscribe(() => {
      this.renewToken();
      this.clearOldNonces();
      this.scheduleRenewal();
    });
  }

  public unscheduleRenewal() {
    if(!this.refreshSubscription) return;
    this.refreshSubscription.unsubscribe();
  }

  private cleanUpIframes() {
    setTimeout(() => {
      const elements = document.getElementsByTagName('iframe');
      while (elements[0]) elements[0].parentNode.removeChild(elements[0]);
    }, 1000);
  }

  private clearOldNonces() {
    Object.keys(localStorage).forEach(key => {
      if(!startsWith(key, 'com.auth0.auth')) return;
      localStorage.removeItem(key);
    });
  }
}
