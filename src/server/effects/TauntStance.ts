
import { StanceEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { MessageHelper } from '../helpers/message-helper';
import { GenderHelper } from '../helpers/gender-helper';

export class TauntStance extends StanceEffect {

  static get skillRequired() { return 15; }
  protected skillRequired = TauntStance.skillRequired;

  iconData = {
    name: 'enrage',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Taunting foes.'
  };

  skillFlag = (char) => char.rightHand ? char.rightHand.itemClass : 'Martial';

  cast(caster: Character, target: Character, skillRef?: Skill): boolean {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;
    this.flagPermanent(caster.uuid);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} takes on an taunting stance.`);

    const quartered =  Math.floor(this.potency / 4);

    char.loseStat('weaponArmorClass', quartered);
    char.loseStat('armorClass', quartered);
    char.loseStat('defense', quartered);
    char.loseStat('offense', quartered);
  }

  effectTick(char: Character) {
    char.$$room.state.getAllHostilesInRange(char, 4).forEach(target => {
      target.addAgro(char, 1);
    });
  }

  effectEnd(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} taunting stance.`);

    const quartered =  Math.floor(this.potency / 4);

    char.gainStat('weaponArmorClass', quartered);
    char.gainStat('armorClass', quartered);
    char.gainStat('defense', quartered);
    char.gainStat('offense', quartered);
  }
}
