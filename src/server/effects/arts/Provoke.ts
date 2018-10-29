
import { WeaponEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Provoke extends WeaponEffect {

  static get skillRequired() { return 9; }
  protected skillRequired = Provoke.skillRequired;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.sendClientMessage(`You provoke ${target.name}!`);
    target.sendClientMessage({ message: `${caster.name} provoked you!`, target: caster.uuid });

    this.potency = caster.rightHand ? caster.calcSkillLevel(caster.rightHand.type) : 1;
    target.addAgroOverTop(caster, 25 * this.potency);
  }
}
