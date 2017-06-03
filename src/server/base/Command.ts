
import { Player } from '../../models/player';

export abstract class Command {

  abstract name: string;

  abstract execute(player: Player, args);
}
