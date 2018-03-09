
import { DB } from '../../database';
import { Player } from '../../../shared/models/player';
import { NPC } from '../../../shared/models/npc';

export class BankHelper {

  private static async createBankIfNotExist(player) {
    return DB.$banks.update(
      { username: player.username },
      { $setOnInsert: { banks: {} } },
      { upsert: true }
    );
  }

  static async openBank(player: Player, npc: NPC): Promise<any> {

    await this.createBankIfNotExist(player);
    const banks = await this.loadBank(player);

    banks[npc.bankId] = banks[npc.bankId] || 0;

    return banks;
  }

  static async saveBank(player: Player): Promise<any> {
    return DB.$banks.update(
      { username: player.username },
      { $set: { banks: player.$$banks } }
    );
  }

  static async loadBank(player: Player): Promise<any> {
    if(player.$$banks) {
      return await player.$$banks;
    }

    player.$$banks = DB.$banks.findOne({ username: player.username })
      .then(({ banks }) => banks);

    return player.$$banks;
  }
}
