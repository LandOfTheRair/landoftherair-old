import { Injectable } from '@angular/core';
import Auth0Lock from 'auth0-lock';

import { environment } from '../environments/environment';

const lockOptions = {
  autoclose: true,
  auth: {
    redirect: false,
    params: {
      scope: 'openid offline_access',
      access_type: 'offline',
      device: 'idlelands'
    }
  }
};

@Injectable()
export class AuthService {

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

  private setSession(authResult, profile): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('user_id', profile.user_id);

    // this.scheduleRenewal();
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('user_id');

    // this.unscheduleRenewal();
  }

  public isAuthenticated(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return Date.now() < expiresAt;
  }

  /*
  public renewToken() {
    this.auth0.renewAuth({
      audience: environment.auth0.apiUrl,
      redirectUri: 'http://localhost:3001/silent',
      usePostMessage: true
    }, (err, result) => {
      if (err) {
        alert(`Could not get a new token using silent authentication (${err.error}).`);
      } else {
        alert(`Successfully renewed auth!`);
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
    source.subscribe(() => {
      this.renewToken();
      this.scheduleRenewal();
    });
  }

  public unscheduleRenewal() {
    if(!this.refreshSubscription) return;
    this.refreshSubscription.unsubscribe();
  }
*/
}
