
import { Account } from './account';
import { Message } from './message';

import { reject, find } from 'lodash';

export class LobbyState {
  accounts: Account[] = [];
  messages: Message[] = [];

  constructor({ accounts = [], messages = [] }) {
    this.accounts = accounts;
    this.messages = messages;
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

  addAccount(account: Account) {
    this.accounts.push(account);
  }

  removeAccount(userId: string) {
    this.accounts = reject(this.accounts, account => account.userId === userId);
  }
}
