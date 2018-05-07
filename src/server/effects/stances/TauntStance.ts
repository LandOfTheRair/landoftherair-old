
import { StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { GenderHelper } from '../../helpers/character/gender-helper';

export class TauntStance extends StanceEffect {

  static get skillRequired() { return 10; }
  protected skillRequired = TauntStance.skillRequired;

  iconData = {
    name: 'enrage',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Taunting foes.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessageRadius(char, `${char.name} takes on an taunting stance.`);

    const quartered =  Math.floor(this.potency / 4);

    this.loseStat(char, 'weaponArmorClass', quartered);
    this.loseStat(char, 'armorClass', quartered);
    this.loseStat(char, 'defense', quartered);
    this.loseStat(char, 'offense', quartered);
  }

  effectTick(char: Character) {
    char.$$room.state.getAllHostilesInRange(char, 4).forEach(target => {
      target.addAgro(char, 3);
    });
  }

  effectEnd(char: Character) {
    this.effectMessageRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} taunting stance.`);
  }
}
