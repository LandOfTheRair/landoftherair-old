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

  @ViewChild('motd')
  public motd;

  @ViewChild('chat')
  public chat;

  public chatText: string;

  public accounts$: any;
  public newMessage$: any;
  public displayAccounts: Account[] = [];

  public chatHeight: string;

  constructor(public lobby: ColyseusLobbyService) { }

  ngOnInit() {
    this.accounts$ = this.lobby.lobbyState.account$.subscribe(accounts => this.sortAndSetAccounts(accounts));
    this.newMessage$ = this.lobby.lobbyState.newMessage$.subscribe(() => this.recalcChatHeight());

    setTimeout(() => {
      this.recalcChatHeight();
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    }, 500);
  }

  ngOnDestroy() {
    this.accounts$.unsubscribe();
    this.newMessage$.unsubscribe();
  }

  private recalcChatHeight() {
    if(this.motd.nativeElement.offsetHeight === 0) return;
    this.chatHeight = `calc(100% - ${this.motd.nativeElement.offsetHeight}px)`;
  }

  sendMessage() {
    if(!this.chatText || !this.chatText.trim()) return;

    this.lobby.sendMessage(this.chatText);
    this.chatText = '';
  }

  sortAndSetAccounts(accounts: Account[]) {
    this.displayAccounts = _(accounts)
      .sortBy(acc => acc.username.toLowerCase())
      .sortBy(acc => !this.lobby.lobbyState.subTier[acc.username])
      .value();
  }

  getMarkingClass(account: Account) {
    const myTier = this.lobby.lobbyState.subTier[account.username];

    if(account.isMuted)           return 'muted';
    if(account.isTester)          return 'tester';

    if(myTier === 10)             return 'gm';
    if(myTier)                    return 'sub';
    return '';
  }

}
