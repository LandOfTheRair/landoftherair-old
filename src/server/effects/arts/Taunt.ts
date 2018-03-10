
import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Taunt extends WeaponEffect {

  static get skillRequired() { return 9; }
  protected skillRequired = Taunt.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.sendClientMessage(`You taunt ${target.name}!`);
    target.sendClientMessage(`${caster.name} taunted you!`);

    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    target.addAgro(caster, 25 * this.potency);
  }
}
