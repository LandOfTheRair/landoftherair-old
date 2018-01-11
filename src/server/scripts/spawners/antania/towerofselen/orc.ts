
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Orc',
  'Tower Orc Mage',
  'Tower Orc Healer'
];

export class TowerOrcSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 60,
      initialSpawn: 2,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 30,
      leashRadius: 40,
      npcIds
    });
  }

}
