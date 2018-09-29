
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Lunatic Healer',
  'Lunatic Mage',
  'Lunatic Thief',
  'Lunatic Warrior'
];

export class BelowMadhouseInsaneSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 0,
      initialSpawn: 0,
      maxCreatures: 100,
      spawnRadius: 2,
      randomWalkRadius: 7,
      leashRadius: 50,
      shouldBeActive: true,
      npcIds
    });
  }

}
