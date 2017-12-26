
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Insane Heniz Thief',
  'Insane Heniz Mage',
  'Insane Steffen Warrior',
  'Insane Steffen Healer'
];

export class DungeonInsaneSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 5,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 10,
      leashRadius: 35,
      npcIds
    });
  }

}
