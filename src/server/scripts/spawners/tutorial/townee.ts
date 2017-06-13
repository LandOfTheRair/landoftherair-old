
import { Spawner } from '../../../base/spawner';

const paths = [
  '23E 16S 23W 16N',
  '16S 23E 16N 23W',
  '8S 23E 8S 16W 8N 23E 8N 23W',
  '23E 8S 23W 8S 23E 8N 23W 8N'
];

const npcIds = [
  'Tutorial Townee'
];

export class TutorialTowneeSpawner extends Spawner {

  constructor(room, opts) {
    super(room, opts, {
      respawnRate: 3600,
      initialSpawn: 4,
      maxCreatures: 25,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 20,
      paths,
      npcIds
    });
  }

}
