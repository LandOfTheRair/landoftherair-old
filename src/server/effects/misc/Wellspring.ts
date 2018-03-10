
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Wellspring extends SpellEffect {

  maxSkillForSkillGain = 20;

  async cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster.rightHand) return caster.sendClientMessage('You must empty your right hand!');

    caster.sendClientMessage('You channel your holy energies into a bottle.');

    const water = await caster.$$room.itemCreator.getItemByName('Holy Water');

    water.setOwner(caster);

    caster.setRightHand(water);
  }
}
