
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  { chance: 15, result: 'Dedlaen Goblin' },
  { chance: 5,  result: 'Dedlaen Goblin Thief' },
  { chance: 10, result: 'Dedlaen Hobgoblin' },
  { chance: 5,  result: 'Dedlaen Orc' },
  { chance: 2,  result: 'Dedlaen Orc Healer' },
  { chance: 2,  result: 'Dedlaen Orc Mage' },
  { chance: 1,  result: 'Dedlaen Troll' }
];

export class OrckinRoom extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 4,
      maxCreatures: 8,
      spawnRadius: 2,
      randomWalkRadius: 7,
      leashRadius: 15,
      npcIds
    });
  }

}
