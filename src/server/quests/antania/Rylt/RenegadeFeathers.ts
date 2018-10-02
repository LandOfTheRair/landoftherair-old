
import { Quest } from '../../../base/Quest';
import { Player } from '../../../../shared/models/player';

export class RenegadeFeathers extends Quest {

  public static get requirements() {
    return {
      type: 'killitem'
    };
  }

  public static get initialData(): any {
    return {};
  }

  public static canUpdateProgress(player: Player, questOpts: any = {}): boolean {
    return false;
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {
    return;
  }

  public static isComplete(player: Player): boolean {
    return player.rightHand && player.rightHand.name === 'Renegade Feather';
  }

  public static incompleteText(player: Player): string {
    return `Dat's not a feather!`;
  }

  public static completeFor(player: Player): void {
    this.givePlayerRewards(player);
    player.setRightHand(null);
    player.completeQuest(this);
  }

  public static givePlayerRewards(player: Player): void {
    this.rewardPlayerGold(player, 10000);
    player.gainExp(5000);
    player.sendClientMessage('You received 5,000 XP and 10,000 gold!');
  }
}
