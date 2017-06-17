
import { Player } from '../../models/player';
import { Direction } from '../../models/character';

export abstract class Command {

  abstract name: string|string[];
  format: string = '';
  static macroMetadata: any = {};

  abstract execute(player: Player, args);
}
