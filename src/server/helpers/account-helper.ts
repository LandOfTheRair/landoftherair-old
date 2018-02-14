

import { DB } from '../database';
import { Account } from '../../shared/models/account';

export class AccountHelper {
  static async getAccountById(userId: string): Promise<Account> {
    const account = await DB.$accounts.findOne({ userId });
    if(account) return new Account(account);
    return null;
  }

  static async getAccountByUsername(username: string): Promise<Account> {
    const account = await DB.$accounts.findOne({ username });
    if(account) return new Account(account);
    return null;
  }

  static async createAccount(account: Account) {
    return DB.$accounts.insert(account);
  }

  static async saveAccount(account: Account) {
    delete account.inGame;
    return DB.$accounts.update({ userId: account.userId }, { $set: account });
  }
}
