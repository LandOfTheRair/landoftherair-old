
import { Account } from './account';
import { Message } from './message';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { nonenumerable } from 'nonenumerable';
import { find, reject, pullAt, extend } from 'lodash';
import { Subject } from 'rxjs/Subject';

export class LobbyState {
  accounts: Account[] = [];
  messages: Message[] = [];
  motd: string;
  discordConnected: boolean;

  silverPurchases: any[] = [];

  @nonenumerable
  account$ = new BehaviorSubject<Account[]>([]);

  @nonenumerable
  newMessage$ = new Subject<number>();

  @nonenumerable
  inGame = {};

  @nonenumerable
  status = {};

  @nonenumerable
  subTier = {};

  constructor({ accounts = [], messages = [], motd = '' }) {
    this.accounts = accounts;
    this.messages = messages;
    this.motd = motd;
  }

  syncTo(state: LobbyState) {
    const oldAccLength = this.accounts.length;
    const oldMessagesLength = this.messages.length;
    extend(this, state);

    if(this.accounts.length !== oldAccLength) {
      this.account$.next(this.accounts);
    }

    if(oldMessagesLength !== 0 && this.messages.length !== oldMessagesLength) {
      this.newMessage$.next(this.messages.length - oldMessagesLength);
    }

    this.accounts.forEach(account => {
      this.inGame[account.username] = account.inGame;
      this.status[account.username] = account.status;
      this.subTier[account.username] = account.isGM ? 10 : account.subscriptionTier;
    });
  }

  addMessage(message: Message) {
    if(!message.timestamp) message.timestamp = Date.now();

    this.messages.push(message);

    if(this.messages.length > 500) {
      this.messages.shift();
    }
  }

  findAccount(userId: string) {
    return find(this.accounts, { userId });
  }

  findAccountByUsername(username: string) {
    return find(this.accounts, { username });
  }

  addAccount(account: Account) {
    this.accounts.push(account);
    this.account$.next(this.accounts);
  }

  removeAccount(username: string) {
    this.accounts = reject(this.accounts, account => account.username === username);
    this.account$.next(this.accounts);
  }

  removeAccountAtPosition(position: number) {
    pullAt(this.accounts, [position]);
    this.account$.next(this.accounts);
  }
}
