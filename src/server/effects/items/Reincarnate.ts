
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';

export class Reincarnate extends Effect {
  cast(char: Character) {
    const spawners = char.$$room.allSpawners.filter(checkSpawner => {
      return checkSpawner.isDangerous && char.distFrom(checkSpawner) < 10 && checkSpawner.npcs.length === 0;
    });

    if(spawners.length === 0) return char.sendClientMessage('There is no lingering evil energy here.');

    spawners.forEach(spawner => {
      spawner.createNPC();
      spawner.currentTick = 0;
    });

    char.sendClientMessage('You have raised the evil dead!');
  }
}
