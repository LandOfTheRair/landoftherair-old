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

  constructor(public lobby: ColyseusLobbyService) { }

  ngOnInit() {
    this.accounts$ = this.lobby.lobbyState.account$.subscribe(accounts => this.sortAndSetAccounts(accounts));
  }

  ngOnDestroy() {
    this.accounts$.unsubscribe();
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

  getMarkingClass(account: Account) {
    const myTier = this.lobby.lobbyState.subTier[account.username];

    if(account.isMuted)           return 'muted';

    if(myTier === 10)             return 'gm';
    if(myTier)                    return 'sub';
    return '';
  }

}
