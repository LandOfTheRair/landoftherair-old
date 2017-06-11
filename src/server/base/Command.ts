
import { Player } from '../../models/player';
import { Direction } from '../../models/character';

export abstract class Command {

  abstract name: string|string[];
  format: string = '';

  abstract execute(player: Player, args);

  getXYFromDir(dir: Direction) {
    const checkDir = dir.toUpperCase();
    switch(checkDir) {
      case 'N':  return { x: 0,   y: -1 };
      case 'E':  return { x: 1,   y: 0 };
      case 'S':  return { x: 0,   y: 1 };
      case 'W':  return { x: -1,  y: 0 };
      case 'NW': return { x: -1,  y: 1 };
      case 'NE': return { x: 1,   y: 1 };
      case 'SW': return { x: -1,  y: -1 };
      case 'SE': return { x: -1,  y: 1 };
      default:   return { x: 0,   y: 0 };
    }
  }
}
