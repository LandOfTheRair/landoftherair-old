
import { Spawner } from '../../../../base/Spawner';

const npcIds = [
  'Rylt Renegade Rebel',
  'Rylt Renegade Mage Rebel',
  'Rylt Renegade Healer Rebel',
  'Rylt Renegade Rebel Thief'
];

export class RyltPrisonRebelSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 20,
      initialSpawn: 1,
      maxCreatures: 5,
      spawnRadius: 0,
      randomWalkRadius: 15,
      leashRadius: 25,
      npcIds
    });
  }

}
