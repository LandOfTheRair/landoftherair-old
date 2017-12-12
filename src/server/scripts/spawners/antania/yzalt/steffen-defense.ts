
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Steffen Warrior Defender',
  'Steffen Healer Defender'
];

export class SteffenDefenseSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 10,
      initialSpawn: 0,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 35,
      npcIds
    });
  }

  isActive() {
    const minute = new Date().getMinutes();
    return minute > 0 && minute < 15;
  }

}
