
import { Spawner } from '../../../../base/Spawner';
import { HolidayHelper } from '../../../../../shared/helpers/holiday-helper';
import { Holiday } from '../../../../../shared/interfaces/holiday';

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
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

  isActive() {
    return HolidayHelper.isHoliday(Holiday.Thanksgiving);
  }

}
