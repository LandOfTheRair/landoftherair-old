
import { clone, includes } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';
import { HolidayHelper } from '../../../../shared/helpers/holiday-helper';

export class SantasPresents extends Quest {

  public static isRepeatable = true;
  static presentsRequired = 500;

  public static get requirements() {
    return {
      type: 'special'
    };
  }

  public static get initialData(): any {
    return clone({ gifts: 0 });
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const { gifts } = player.getQuestData(this);

    const structure = this.initialData;
    structure.gifts = gifts + (questOpts.giftBoost ? questOpts.giftBoost : 1);

    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    const { gifts } = player.getQuestData(this);

    return gifts >= this.presentsRequired;
  }

  public static incompleteText(player: Player): string {
    const { gifts } = player.getQuestData(this);

    return `You need to bring me ${this.presentsRequired - gifts} gifts yet!`;
  }

  public static completeFor(player: Player): void {
    this.givePlayerRewards(player);
    player.completeQuest(this);
  }

  public static givePlayerRewards(player: Player): void {
    this.rewardPlayerGold(player, 100000);
    player.gainExp(50000);
    player.sendClientMessage('You received 50,000 XP and 100,000 gold!');
    HolidayHelper.tryGrantHolidayTokens(player, 500);
  }
}
