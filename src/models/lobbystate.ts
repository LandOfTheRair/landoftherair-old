
import { Account } from './account';
import { Message } from './message';

import * as _ from 'lodash';

export class LobbyState {
  accounts: Account[] = [];
  messages: Message[] = [];
  motd: string;

  constructor({ accounts = [], messages = [], motd = '' }) {
    this.accounts = accounts;
    this.messages = messages;
    this.motd = motd;
  }

  addMessage(message: Message) {
    if(!message.timestamp) message.timestamp = Date.now();

    this.messages.push(message);

    if(this.messages.length > 500) {
      this.messages.shift();
    }
  }

  findAccount(userId: string) {
    return _.find(this.accounts, { userId });
  }

  addAccount(account: Account) {
    this.accounts.push(account);

    this.sortAccounts();
  }

  sortAccounts() {
    this.accounts = _(this.accounts)
      .sortBy('isGM')
      .sortBy('username')
      .value();
  }

  removeAccount(username: string) {
    this.accounts = _.reject(this.accounts, account => account.username === username);
  }

  removeAccountAtPosition(position: number) {
    this.accounts = this.accounts.splice(position, 1);
  }
}
