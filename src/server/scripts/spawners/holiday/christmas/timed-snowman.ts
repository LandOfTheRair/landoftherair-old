
import { Spawner } from '../../../../base/Spawner';
import { HolidayHelper } from '../../../../../shared/helpers/holiday-helper';
import { Holiday } from '../../../../../shared/interfaces/holiday';

const npcIds = [
  { chance: 50, result: 'Christmas Weak Snowman' },
  { chance: 10, result: 'Christmas Strong Snowman' }
];

export class ChristmasTimedSnowmanSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 3,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 20,
      npcIds
    });
  }

  isActive() {
    const minute = new Date().getMinutes();
    return HolidayHelper.isHoliday(Holiday.Christmas)
      && ((minute % 3) === 0 || (minute % 4) === 0);
  }

}
