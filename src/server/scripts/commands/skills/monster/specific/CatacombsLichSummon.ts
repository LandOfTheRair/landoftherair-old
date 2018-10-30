
import { sample } from 'lodash';

import { MonsterSkill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { RollerHelper } from '../../../../../../shared/helpers/roller-helper';

export class CatacombsLichSummon extends MonsterSkill {

  name = 'catacombslichsummon';

  use(user: Character, target: Character) {
    const spawners = user.$$room.spawners.filter(x => x.name === 'Lich Random Spawner' && x.hasAnyAlive());
    const chosenSpawner = sample(spawners);
    if(!chosenSpawner) return;

    const npc = sample(chosenSpawner.npcs);
    if(!npc) return;

    npc.x = user.x;
    npc.y = user.y;

    target.sendClientMessageToRadius(`${npc.name} was summoned through a hole in the rift!`, 4);
  }

}
