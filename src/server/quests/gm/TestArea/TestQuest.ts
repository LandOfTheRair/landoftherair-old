
import { clone, includes } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';

export class TestQuest extends Quest {

  public static isRepeatable = false;

  public static get requirements() {
    return {
      type: 'other'
    };
  }

  public static get initialData(): any {
    return clone({ canTeleport: false, canComplete: false });
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const { canTeleport, canComplete } = player.getQuestData(this);

    const structure = this.initialData;
    structure.canTeleport = canTeleport;
    structure.canComplete = canComplete;

    if(questOpts.canTeleport) structure.canTeleport = !canTeleport;
    if(questOpts.canComplete) structure.canComplete = !canComplete;

    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    const { canComplete } = player.getQuestData(this);

    return canComplete;
  }

  public static incompleteText(player: Player): string {
    return 'idk';
  }

  public static completeFor(player: Player): void {
    player.completeQuest(this);
  }
}
