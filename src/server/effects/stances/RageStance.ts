
import { StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { MessageHelper } from '../../helpers/world/message-helper';
import { GenderHelper } from '../../helpers/character/gender-helper';

export class RageStance extends StanceEffect {

  static get skillRequired() { return 10; }
  protected skillRequired = RageStance.skillRequired;

  iconData = {
    name: 'swords-power',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Acting offensively.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessageRadius(char, `${char.name} takes on an offensive stance.`);

    this.loseStat(char, 'weaponArmorClass', this.potency);
    this.loseStat(char, 'armorClass', this.potency);
    this.loseStat(char, 'defense', Math.floor(this.potency / 4));
    this.loseStat(char, 'mitigation', Math.floor(this.potency / 4));

    this.gainStat(char, 'offense', Math.floor(this.potency / 2));
    this.gainStat(char, 'accuracy', Math.floor(this.potency / 2));
    this.gainStat(char, 'weaponDamageRolls', Math.floor(this.potency / 2));
  }

  effectEnd(char: Character) {
    this.effectMessageRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} offensive stance.`);
  }
}
