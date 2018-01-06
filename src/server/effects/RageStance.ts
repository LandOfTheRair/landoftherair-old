
import { StanceEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { MessageHelper } from '../helpers/message-helper';
import { GenderHelper } from '../helpers/gender-helper';

export class RageStance extends StanceEffect {

  static get skillRequired() { return 14; }
  protected skillRequired = RageStance.skillRequired;

  iconData = {
    name: 'swords-power',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Stance. Acting offensively.'
  };

  skillFlag = (char) => char.rightHand ? char.rightHand.itemClass : 'Martial';

  cast(caster: Character, target: Character, skillRef?: Skill) {
    super.cast(caster, target, skillRef);
    this.flagPermanent(caster.uuid);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} takes on an offensive stance.`);
    // char.gainStat('fireResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} breaks ${GenderHelper.hisher(char)} offensive stance.`);
    // char.loseStat('fireResist', this.potency * this.potencyMultiplier);
  }
}
