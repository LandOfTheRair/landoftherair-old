import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Auth0Lock from 'auth0-lock';
import * as auth0 from 'auth0-js';

import { environment } from '../environments/environment';

const lockOptions = {
  // autoclose: true,
  oidcConformant: true,
  auth: {
    audience: environment.auth0.apiUrl,
    params: {
      scope: 'openid'
    }
  }
};

@Injectable()
export class AuthService {

  refreshSubscription: any;

  auth0 = new auth0.WebAuth({
    clientID: environment.auth0.client,
    domain: environment.auth0.domain,
    responseType: 'token id_token',
    audience: environment.auth0.apiUrl,
    redirectUri: environment.auth0.callbackUrl,
    scope: 'openid profile'
  });

  public login() {

    const lock = new Auth0Lock(environment.auth0.client, environment.auth0.domain, lockOptions);

    lock.on('authorization_error', (error) => {
      lock.show({
        flashMessage: {
          type: 'error',
          text: error.error_description
        }
      });
    });

    return new Promise((resolve, reject) => {

      lock.on('authenticated', (authResult) => {

        if(authResult.error) {
          return reject(authResult.error);
        }

        lock.getUserInfo(authResult.accessToken, (error, profile) => {
          if(error) {
            return reject(error);
          }

          this.setSession(authResult, profile);

          resolve();
        });
      });

      lock.show();
    });
  }


  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
      } else if (err) {
        console.log(err);
      }
    });
  }

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }

    this.auth0.client.userInfo(accessToken, (err, profile) => {
      this.setSession(null, profile);
      cb(err, profile);
    });
  }

  private setSession(authResult?, profile?): void {

    if(authResult) {
      // Set the time that the access token will expire at
      const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());

      console.log(authResult);

      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);
    }

    if(profile) {
      localStorage.setItem('user_id', profile.user_id);
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
      redirectUri: `${environment.client.protocol}://${environment.client.domain}:${environment.client.port}/silent-${environment.client.silentExt}`,
      usePostMessage: true
    }, (err, result) => {
      if(err) {
        console.error(err);
      } else {
        this.setSession(result);
      }
    });
  }

  public scheduleRenewal() {
    if(!this.isAuthenticated()) return;

    const expiresAt = JSON.parse(window.localStorage.getItem('expires_at'));

    const source = Observable.of(expiresAt).flatMap(
      expiresAt => {

        const now = Date.now();

        // Use the delay in a timer to
        // run the refresh at the proper time
        return Observable.timer(Math.max(1, expiresAt - now));
      });

    // Once the delay time from above is
    // reached, get a new JWT and schedule
    // additional refreshes
    this.refreshSubscription = source.subscribe(() => {
      this.renewToken();
      this.scheduleRenewal();
    });
  }

  public unscheduleRenewal() {
    if(!this.refreshSubscription) return;
    this.refreshSubscription.unsubscribe();
  }
}
