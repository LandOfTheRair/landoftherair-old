
import { clone } from 'lodash';

import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';

export class ClubAccess extends Quest {

  public static isRepeatable = false;

  public static get requirements() {
    return {
      type: 'other'
    };
  }

  public static get initialData(): any {
    return clone({});
  }

  public static canUpdateProgress(player: Player, questOpts: any = {}): boolean {
    return false;
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    const structure = this.initialData;
    player.setQuestData(this, structure);
  }

  public static isComplete(player: Player): boolean {
    return true;
  }

  public static incompleteText(player: Player): string {
    return '';
  }

  public static completeFor(player: Player): void {
    player.completeQuest(this);
  }
}
