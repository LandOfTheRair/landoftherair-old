
import { Spawner } from '../../../../base/Spawner';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

const npcIds = [
  { chance: 50, result: 'Thanksgiving Weak Turkey' },
  { chance: 10, result: 'Thanksgiving Strong Turkey' },
  { chance: 1,  result: 'Thanksgiving Secret Turkey' }
];

export class ThanksgivingTurkeySpawner extends Spawner {

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
    return HolidayHelper.isHoliday(Holiday.Thanksgiving);
  }

}
