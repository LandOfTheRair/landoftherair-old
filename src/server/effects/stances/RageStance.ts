
import { StanceEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { MessageHelper } from '../../helpers/lobby/message-helper';
import { GenderHelper } from '../../helpers/character/gender-helper';

export class RageStance extends StanceEffect {

  static get skillRequired() { return 14; }
  protected skillRequired = RageStance.skillRequired;

  iconData = {
    name: 'swords-power',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Acting offensively.'
  };

  skillFlag = (char) => char.rightHand ? char.rightHand.type : 'Martial';

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    this.potency = caster.calcSkillLevel(caster.rightHand.type);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} takes on an offensive stance.`);

    char.loseStat('weaponArmorClass', this.potency);
    char.loseStat('armorClass', this.potency);
    char.loseStat('defense', Math.floor(this.potency / 4));
    char.loseStat('mitigation', Math.floor(this.potency / 4));

    char.gainStat('offense', Math.floor(this.potency / 2));
    char.gainStat('accuracy', Math.floor(this.potency / 2));
    char.gainStat('weaponDamageRolls', Math.floor(this.potency / 2));
  }

  effectEnd(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} offensive stance.`);

    char.gainStat('weaponArmorClass', this.potency);
    char.gainStat('armorClass', this.potency);
    char.gainStat('defense', Math.floor(this.potency / 4));
    char.gainStat('mitigation', Math.floor(this.potency / 4));

    char.loseStat('offense', Math.floor(this.potency / 2));
    char.loseStat('accuracy', Math.floor(this.potency / 2));
    char.loseStat('weaponDamageRolls', Math.floor(this.potency / 2));
  }
}
