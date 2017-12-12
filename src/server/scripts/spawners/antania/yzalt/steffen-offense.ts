
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Steffen Warrior Offender',
  'Steffen Healer Offender'
];

const paths = [
  '20-S 20-N'
];

export class SteffenOffenseSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 0,
      maxCreatures: 3,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 35,
      npcIds,
      paths
    });
  }

  isActive() {
    const minute = new Date().getMinutes();
    return minute > 30 && minute < 45;
  }

}
