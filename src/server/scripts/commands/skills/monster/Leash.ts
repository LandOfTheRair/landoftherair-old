

import { MonsterSkill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { NPC } from '../../../../../shared/models/npc';

export class Leash extends MonsterSkill {

  name = 'leash';

  use(user: Character) {
    if(user.isPlayer()) return;

    const npc = <NPC>user;

    npc.sendLeashMessage();

    npc.x = npc.spawner.x;
    npc.y = npc.spawner.y;

  }

}
