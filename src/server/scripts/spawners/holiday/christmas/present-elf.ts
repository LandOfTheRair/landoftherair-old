
import { Spawner } from '../../../../base/Spawner';
import { HolidayHelper } from '../../../../../shared/helpers/holiday-helper';
import { Holiday } from '../../../../../shared/interfaces/holiday';

const npcIds = [
  'Christmas Present Elf'
];

export class ChristmasPresentElfSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 300,
      initialSpawn: 1,
      maxCreatures: 1,
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
