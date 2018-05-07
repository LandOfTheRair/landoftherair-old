
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Stun } from '..';
import { GenderHelper } from '../../helpers/character/gender-helper';

export class Shield extends SpellEffect {

  iconData = {
    name: 'vibrating-shield',
    color: '#a00',
    tooltipDesc: 'Increased physical and magical resistance.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 300;
    if(!this.potency)  this.potency = caster.calcSkillLevel(SkillClassNames.Martial) * 3;

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessageRadius(char, `${char.name} clasps ${GenderHelper.hisher(char)} hands together and exhales.`);

    this.duration += 3;

    const stunned = new Stun({ shouldNotShowMessage: true });
    stunned.duration = 3;
    stunned.cast(char, char);

    this.iconData.tooltipDesc = `+${this.potency} physical/magical resistance.`;

    this.gainStat(char, 'physicalResist', this.potency);
    this.gainStat(char, 'magicalResist', this.potency);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your resistances fade.');
  }
}
