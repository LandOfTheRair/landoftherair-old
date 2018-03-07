
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class ShadowMeld extends SpellEffect {

  iconData = {
    name: 'hidden',
    color: '#ccc',
    bgColor: '#00c',
    tooltipDesc: 'Melded with the shadows, ready to pounce.'
  };

  maxSkillForSkillGain = 15;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    this.duration = this.potency;
    this.updateDurationBasedOnTraits(caster);
    this.potency = caster.stealthLevel();
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You meld with the shadows.');
    char.gainStat('stealth', this.potency);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer melded with the shadows!');
    char.loseStat('stealth', this.potency);
  }
}
