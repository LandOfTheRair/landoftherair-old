
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Antanian Dolphin',
  'Antanian Shark'
];

export class RyltAquaticSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 5,
      spawnRadius: 1,
      randomWalkRadius: 45,
      leashRadius: 55,
      npcIds
    });
  }

}
