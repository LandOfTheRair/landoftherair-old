
import { Spawner } from '../../../../base/Spawner';
import { Holiday, HolidayHelper } from '../../../../../shared/helpers/holiday-helper';

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
      npcIds
    });
  }

  isActive() {
    return HolidayHelper.isHoliday(Holiday.Thanksgiving);
  }

}
