
import { clone, includes } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';
import { SkillClassNames } from '../../../../shared/models/character';

export class LearnAlchemy extends Quest {

  public static isRepeatable = false;

  public static get requirements() {
    return {
      type: 'other'
    };
  }

  public static get initialData(): any {
    return clone({ hasGivenBread: false });
  }

  public static canUpdateProgress(player: Player, questOpts: any = {}): boolean {
    return false;
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const structure = this.initialData;
    structure.hasGivenBread = true;

    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    const { hasGivenBread } = player.getQuestData(this);
    return hasGivenBread;
  }

  public static incompleteText(player: Player): string {
    return `You haven't brought me the fungus bread yet! Remember, tell me ALCHEMY and mix bread with water - you can buy them from the vendor!`;
  }

  public static completeFor(player: Player): void {
    this.givePlayerRewards(player);
    player.completeQuest(this);
  }

  public static givePlayerRewards(player: Player): void {
    player.gainExp(500);
    player.gainSkill(SkillClassNames.Alchemy, 50);
    player.sendClientMessage('You got 500 XP and progress towards your Alchemy skill!');
  }
}
