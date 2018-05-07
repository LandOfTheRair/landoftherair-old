
import { StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { GenderHelper } from '../../helpers/character/gender-helper';

export class ParryStance extends StanceEffect {

  static get skillRequired() { return 10; }
  protected skillRequired = ParryStance.skillRequired;

  iconData = {
    name: 'surrounded-shield',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Acting defensively.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessageRadius(char, `${char.name} takes on a defensive stance.`);

    this.gainStat(char, 'weaponArmorClass', this.potency);
    this.gainStat(char, 'defense', Math.floor(this.potency / 4));
    this.gainStat(char, 'mitigation', Math.floor(this.potency / 8));

    this.loseStat(char, 'offense', Math.floor(this.potency / 2));
    this.loseStat(char, 'accuracy', Math.floor(this.potency / 2));
    this.loseStat(char, 'weaponDamageRolls', Math.floor(this.potency / 2));
  }

  effectEnd(char: Character) {
    this.effectMessageRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} defensive stance.`);
  }
}
