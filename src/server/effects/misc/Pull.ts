
import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { random, clamp } from 'lodash';
import { Stun } from '../antibuffs/Stun';
import { MoveHelper } from '../../helpers/character/move-helper';

export class Pull extends SpellEffect {

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const xDiff = caster.x - target.x;
    const yDiff = caster.y - target.y;

    MoveHelper.move(target, { room: caster.$$room, gameState: caster.$$room.state, x: xDiff, y: yDiff }, true, true);

    target.sendClientMessage(`${caster.name} pulls you closer!`);
  }
}
