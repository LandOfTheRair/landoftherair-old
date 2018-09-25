
import { Spawner } from '../../../../base/Spawner';
import { Holiday, HolidayHelper } from '../../../../helpers/world/holiday-helper';

const npcIds = [
  'Halloween Zombie'
];

export class HalloweenZombieSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 600,
      initialSpawn: 2,
      maxCreatures: 2,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 35,
      alwaysSpawn: true,
      npcIds
    });
  }

  isActive() {
    return HolidayHelper.isHoliday(Holiday.Halloween);
  }

}
