
import { Player, Direction } from '../../models/player';

export abstract class Command {

  abstract name: string|string[];
  format: string = '';

  abstract execute(player: Player, args);

  getXYFromDir(dir: Direction) {
    const checkDir = dir.toUpperCase();
    switch(checkDir) {
      case 'N': return { x: 0, y: -1 };
      case 'E': return { x: 1, y: 0 };
      case 'S': return { x: 0, y: 1 };
      case 'W': return { x: -1, y: 0 };
      default:  return { x: 0, y: 0 };
    }
  }
}
