
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Tower Orc Warlord'
];

export class TowerOrcWarlordSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 120,
      initialSpawn: 1,
      maxCreatures: 1,
      spawnRadius: 1,
      randomWalkRadius: 30,
      leashRadius: 40,
      npcIds
    });
  }

}
