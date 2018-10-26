
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Revealed } from '../misc/Revealed';

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
    this.casterEffectMessage(char, { message: 'You meld with the shadows.', sfx: 'spell-sight-effect' });
    this.gainStat(char, 'stealth', this.potency);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer melded with the shadows!');

    const revealed = new Revealed({});
    revealed.duration = 3;
    revealed.cast(char, char);
  }
}
