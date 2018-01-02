
import { clone, includes } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';

export class KillHeniz extends Quest {

  static killsRequired = 25;

  public static get requirements() {
    return {
      type: 'kill',
      npcIds: [
        'Heniz Townee',
        'Heniz Warrior Defender',
        'Heniz Healer Defender',
        'Heniz Warrior Offender',
        'Heniz Healer Offender'
      ]
    };
  }

  public static get initialData(): any {
    return clone({ kills: 0, isRepeatable: true });
  }

  public static canUpdateProgress(player: Player, questOpts: any = {}): boolean {
    return questOpts.kill && includes(this.requirements.npcIds, questOpts.kill);
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const { kills } = player.getQuestData(this);

    const structure = this.initialData;
    structure.kills = kills + 1;

    if(structure.kills <= this.killsRequired) {
      player.sendQuestMessage(this, `You have killed ${structure.kills}/${this.killsRequired} Heniz.`);
    }

    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    const { kills } = player.getQuestData(this);

    return kills >= this.killsRequired;
  }

  public static incompleteText(player: Player): string {
    const { kills } = player.getQuestData(this);

    return `You're not done yet. You have to kill ${this.killsRequired - kills} Heniz still!`;
  }

  public static completeFor(player: Player): void {
    this.givePlayerRewards(player);
    player.completeQuest(this);
  }

  public static givePlayerRewards(player: Player): void {
    player.gainGold(1000);
    player.gainExp(1000);
    player.changeRep('Royalty', 100, true);
    player.sendClientMessage('You received 1,000 XP, 1,000 gold, and Royalty faction reputation!');
  }
}
