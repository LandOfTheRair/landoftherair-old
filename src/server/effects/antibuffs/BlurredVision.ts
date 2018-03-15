
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BlurredVision extends SpellEffect {

  iconData = {
    name: 'worried-eyes',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'Perception lowered.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.iconData.tooltipDesc = `Perception lowered by ${this.potency}%.`;

    this.potency = Math.floor(char.getTotalStat('perception') * (this.potency / 100));
    this.targetEffectMessage(char, 'Your vision begins to blur.');
    char.loseStat('perception', this.potency);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision is returns to normal.');
    char.gainStat('perception', this.potency);
  }
}
