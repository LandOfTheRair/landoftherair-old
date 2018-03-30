
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Orc Warlord'
];

export class TowerOrcWarlordSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 180,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 1,
      randomWalkRadius: 10,
      leashRadius: 20,
      npcIds
    });
  }

}
