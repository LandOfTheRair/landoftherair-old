
import { clone, capitalize } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';
import { Holiday } from '../../../../shared/interfaces/holiday';

export class SantasReindeer extends Quest {

  public static isRepeatable = true;

  public static get requirements() {
    return {
      type: 'special',
      activeHoliday: Holiday.Christmas
    };
  }

  public static get initialData(): any {
    return clone({ blitzen: false, comet: false, prancer: false, dancer: false, dasher: false, cupid: false, vixen: false, donner: false });
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const reindeer = player.getQuestData(this);
    reindeer[questOpts.reindeer] = true;
    player.setQuestData(this, reindeer);
  }

  public static isComplete(player: Player): boolean {
    const { blitzen, comet, prancer, dancer, dasher, cupid, vixen, donner } = player.getQuestData(this);

    return blitzen && comet && prancer && dasher && dancer && cupid && vixen && donner;
  }

  public static incompleteText(player: Player): string {
    const reindeers = player.getQuestData(this);

    const unfound = [];
    Object.keys(reindeers).forEach(deer => {
      if(reindeers[deer]) return;

      unfound.push(capitalize(deer));
    });

    return `You need to find ${unfound.join(', ')} yet!`;
  }

  public static completeFor(player: Player): void {
    this.givePlayerRewards(player);
    player.completeQuest(this);
  }

  public static givePlayerRewards(player: Player): void {
    this.rewardPlayerGold(player, 100000);
    player.gainExp(50000);
    player.sendClientMessage('You received 50,000 XP and 100,000 gold!');
  }
}
