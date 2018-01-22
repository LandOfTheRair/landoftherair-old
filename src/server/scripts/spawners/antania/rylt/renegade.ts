
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Rylt Renegade',
  'Rylt Renegade Mage',
  'Rylt Renegade Healer'
];

export class RyltRenegadeMonsterSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 45,
      initialSpawn: 2,
      maxCreatures: 6,
      spawnRadius: 1,
      randomWalkRadius: 25,
      leashRadius: 35,
      npcIds
    });
  }

}
