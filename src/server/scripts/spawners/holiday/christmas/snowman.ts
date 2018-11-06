
import { Spawner } from '../../../../base/Spawner';
import { HolidayHelper } from '../../../../../shared/helpers/holiday-helper';
import { Holiday } from '../../../../../shared/interfaces/holiday';

const npcIds = [
  { chance: 50, result: 'Christmas Weak Snowman' },
  { chance: 10, result: 'Christmas Strong Snowman' }
];

export class ChristmasSnowmanSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

  isActive() {
    return HolidayHelper.isHoliday(Holiday.Christmas);
  }

}
