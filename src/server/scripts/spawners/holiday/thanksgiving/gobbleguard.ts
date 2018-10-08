
import { Spawner } from '../../../../base/Spawner';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

const npcIds = [
  'Thanksgiving Gobbleguard'
];

export class ThanksgivingTurkeyGobbleGuardSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 15,
      initialSpawn: 1,
      maxCreatures: 2,
      spawnRadius: 1,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

  isActive() {
    return HolidayHelper.isHoliday(Holiday.Thanksgiving);
  }

}
