
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Heniz Thief Offender',
  'Heniz Mage Offender'
];

const paths = [
  '20-N 20-S'
];

export class HenizOffenseSpawner extends Spawner {

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
    return minute > 0 && minute < 15;
  }

}
