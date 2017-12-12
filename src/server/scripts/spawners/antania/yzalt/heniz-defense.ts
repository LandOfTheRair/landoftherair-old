
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Heniz Thief Defender',
  'Heniz Mage Defender'
];

export class HenizDefenseSpawner extends Spawner {

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
    return minute > 30 && minute < 45;
  }

}
