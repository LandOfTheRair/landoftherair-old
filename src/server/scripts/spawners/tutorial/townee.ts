
import { Spawner } from '../../../base/spawner';

const paths = [
  '23-E 16-S 23-W 16-N',
  '16-S 23-E 16-N 23-W',
  '8-S 23-E 8-S 23-W 8-N 23-E 8-N 23-W',
  '23-E 8-S 23-W 8-S 23-E 8-N 23-W 8-N'
];

const npcIds = [
  'Tutorial Townee'
];

export class TutorialTowneeSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 30,
      initialSpawn: 4,
      maxCreatures: 20,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 30,
      paths,
      npcIds
    });
  }

}
