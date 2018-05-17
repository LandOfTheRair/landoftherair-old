
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Identify extends SpellEffect {

  maxSkillForSkillGain = 7;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!caster.rightHand) return user.sendClientMessage('You need to have something in your right hand to identify it.');
    caster.sendClientMessage(caster.rightHand.descTextFor(caster, this.potency));
  }
}
