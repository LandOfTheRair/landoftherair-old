

import { DB } from '../database';
import { Account } from '../../shared/models/account';

export class AccountHelper {
  static async getAccount(username): Promise<Account> {
    return DB.$accounts.findOne({ username })
      .then(data => {
        if(data) return new Account(data);
        return null;
      });
  }
}
