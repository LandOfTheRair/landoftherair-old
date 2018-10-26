
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Stun } from '..';
import { GenderHelper } from '../../helpers/character/gender-helper';
import { LoweredDefenses } from '../antibuffs/LoweredDefenses';

export class Boost extends SpellEffect {

  iconData = {
    name: 'fist',
    color: '#a00',
    tooltipDesc: 'Increased STR, DEX, AGI'
  };

  private ignoreDefenseLoss: boolean;
  private ignoreStun: boolean;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 300;
    if(!this.potency)  this.potency = 1;

    this.potency += caster.getTraitLevel('BoostedBoost');

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessageRadius(char, `${char.name} clasps ${GenderHelper.hisher(char)} hands together and exhales.`);
    this.targetEffectMessage(char, { message: 'You begin channeling your Boost.', sfx: 'spell-buff-physical' });

    if(!this.ignoreStun) {
      this.duration += 3;

      const stunned = new Stun({ shouldNotShowMessage: true });
      stunned.duration = 3;
      stunned.cast(char, char);
    }

    if(!this.ignoreDefenseLoss) {
      const debuff = new LoweredDefenses({ potency: 6, duration: 23 });
      debuff.cast(char, char);
    }

    this.iconData.tooltipDesc = `+${this.potency} STR/DEX/AGI`;

    this.gainStat(char, 'str', this.potency);
    this.gainStat(char, 'dex', this.potency);
    this.gainStat(char, 'agi', this.potency);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your boosted physique fades.');
  }
}
