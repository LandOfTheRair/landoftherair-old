
import { Player } from '../../models/player';

export class Quest {

  public get name(): string {
    return this.constructor.name;
  }

  public get initialData(): any {
    return {};
  }

  public static canUpdateProgress(player: Player, questOpts: any = {}): boolean {
    return false;
  }

  public static updateProgress(player: Player, questOpts: any = {}): void {}

  public static isComplete(player: Player): boolean {
    return false;
  }

  public static incompleteText(player: Player): string {
    return '';
  }

  public static completeFor(player: Player): void {}

  public static givePlayerRewards(player: Player): void {}
}
