
import { clone, includes } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';
import { HolidayHelper } from '../../../../shared/helpers/holiday-helper';

export class DailyKillWildlife extends Quest {

  public static isRepeatable = true;
  static killsRequired = 15;

  public static get requirements() {
    return {
      type: 'kill',
      npcIds: [
        'Risan Crazed Deer',
        'Risan Crazed Bear',
        'Risan Crazed Wolf'
      ]
    };
  }

  public static get initialData(): any {
    return clone({ kills: 0 });
  }

  public static canUpdateProgress(player: Player, questOpts: any = {}): boolean {
    return questOpts.kill && includes(this.requirements.npcIds, questOpts.kill);
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const { kills } = player.getQuestData(this);

    const structure = this.initialData;
    structure.kills = kills + 1;

    if(structure.kills <= this.killsRequired) {
      player.sendQuestMessage(this, `You have killed ${structure.kills}/${this.killsRequired} wild creatures.`);
    }

    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    const { kills } = player.getQuestData(this);

    return kills >= this.killsRequired;
  }

  public static incompleteText(player: Player): string {
    const { kills } = player.getQuestData(this);

    return `Thanks for offering your help. You have to kill ${this.killsRequired - kills} more wild creatures.`;
  }

  public static completeFor(player: Player): void {
    this.givePlayerRewards(player);
    player.completeQuest(this);
  }

  public static givePlayerRewards(player: Player): void {
    this.rewardPlayerGold(player, 25000);
    player.gainExp(500000);
    player.$$room.subscriptionHelper.giveSilver(player.$$account, 2);

    const gainedResetPoints = player.skillTree.canGainResetPoints ? 2 : 0;
    player.skillTree.gainResetPoints(gainedResetPoints);
    player.sendClientMessage(`You received 500,000 XP, 25,000 gold, 2 silver and ${gainedResetPoints} RP!`);

    HolidayHelper.tryGrantHolidayTokens(player, 30);
  }
}
