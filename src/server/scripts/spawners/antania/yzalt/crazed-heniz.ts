
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Crazed Heniz Thief',
  'Crazed Heniz Mage'
];

export class CrazedHenizSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 3,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 10,
      leashRadius: 35,
      npcIds
    });
  }

}
