
import { StanceEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { MessageHelper } from '../helpers/message-helper';
import { GenderHelper } from '../helpers/gender-helper';

export class ParryStance extends StanceEffect {

  static get skillRequired() { return 13; }
  protected skillRequired = ParryStance.skillRequired;

  iconData = {
    name: 'surrounded-shield',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Acting defensively.'
  };

  skillFlag = (char) => char.rightHand ? char.rightHand.itemClass : 'Martial';

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.itemClass);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} takes on a defensive stance.`);

    char.gainStat('weaponArmorClass', this.potency);
    char.gainStat('defense', Math.floor(this.potency / 4));

    char.loseStat('offense', Math.floor(this.potency / 2));
    char.loseStat('accuracy', Math.floor(this.potency / 2));
    char.loseStat('weaponDamageRolls', Math.floor(this.potency / 5));
  }

  effectEnd(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} defensive stance.`);

    char.loseStat('weaponArmorClass', this.potency);
    char.loseStat('defense', Math.floor(this.potency / 4));

    char.gainStat('offense', Math.floor(this.potency / 2));
    char.gainStat('accuracy', Math.floor(this.potency / 2));
    char.gainStat('weaponDamageRolls', Math.floor(this.potency / 5));
  }
}
