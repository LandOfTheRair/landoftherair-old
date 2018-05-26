
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Identify extends SpellEffect {

  maxSkillForSkillGain = 7;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!caster.rightHand) return caster.sendClientMessage('You are looking at your right hand. It\'s in average condition. Of course, it belongs to you.');
    caster.sendClientMessage(caster.rightHand.descTextFor(caster, this.potency));
  }
}
