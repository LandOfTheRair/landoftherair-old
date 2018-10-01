
import { Spawner } from '../../../../base/Spawner';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

const npcIds = [
  'Halloween Zombie'
];

export class HalloweenZombieSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
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
