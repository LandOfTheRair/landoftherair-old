
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { CharacterHelper } from '../helpers/character-helper';

export class ShadowMeld extends SpellEffect {

  iconData = {
    name: 'hidden',
    color: '#ccc',
    bgColor: '#00c',
    tooltipDesc: 'Melded with the shadows, ready to pounce.'
  };

  maxSkillForSkillGain = 15;
  skillFlag = () => SkillClassNames.Thievery;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    this.duration = 2 * caster.calcSkillLevel(SkillClassNames.Thievery);
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
