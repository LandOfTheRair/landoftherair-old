
import { clone, includes } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';

export class KillRanata extends Quest {

  static killsRequired = 1;

  public static get requirements() {
    return {
      type: 'kill',
      npcIds: [
        'Ranata'
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
      player.sendQuestMessage(this, `You have killed Ranata ${structure.kills}/${this.killsRequired}.`);
    }

    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    const { kills } = player.getQuestData(this);

    return kills >= this.killsRequired;
  }

  public static incompleteText(player: Player): string {
    return `I see you haven't taken care of Ranata yet. What are you doing here?`;
  }

  public static givePlayerRewards(player: Player): void {
    player.gainGold(5000);
    player.gainExp(20000);
    player.sendClientMessage('You got 20,000 XP and 5,000 gold!');
  }
}
