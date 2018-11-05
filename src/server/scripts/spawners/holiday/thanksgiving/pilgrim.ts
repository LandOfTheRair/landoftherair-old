
import { Spawner } from '../../../../base/Spawner';
import { HolidayHelper } from '../../../../../shared/helpers/holiday-helper';
import { Holiday } from '../../../../../shared/interfaces/holiday';

const npcIds = [
  'Thanksgiving Pilgrim'
];

export class ThanksgivingPilgrimSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 2,
      maxCreatures: 6,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 35,
      doInitialSpawnImmediately: true,
      npcIds
    });
  }

  isActive() {
    return HolidayHelper.isHoliday(Holiday.Thanksgiving);
  }

}
