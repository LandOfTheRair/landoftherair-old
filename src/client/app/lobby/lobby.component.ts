import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ColyseusLobbyService } from '../colyseus.lobby.service';
import { Account } from '../../../shared/models/account';

import * as _ from 'lodash';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {

  @ViewChild('chatInput')
  public chatInput;

  public chatText: string;

  public accounts$: any;
  public displayAccounts: Account[] = [];

  private eventListener: any;

  constructor(public lobby: ColyseusLobbyService) { }

  ngOnInit() {
    this.accounts$ = this.lobby.lobbyState.account$.subscribe(accounts => this.sortAndSetAccounts(accounts));

    this.eventListener = (ev) => {
      if(this.lobby.colyseus.active)
      if(document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      this.chatInput.nativeElement.focus();
    };

    document.addEventListener('keydown', this.eventListener);
  }

  ngOnDestroy() {
    this.accounts$.unsubscribe();
    document.removeEventListener(this.eventListener);
  }

  sendMessage() {
    if(!this.chatText || !this.chatText.trim()) return;

    this.lobby.sendMessage(this.chatText);
    this.chatText = '';
  }

  sortAndSetAccounts(accounts: Account[]) {
    this.displayAccounts = _(accounts)
      .sortBy(acc => acc.username.toLowerCase())
      .sortBy(acc => !acc.isGM)
      .value();
  }

}
