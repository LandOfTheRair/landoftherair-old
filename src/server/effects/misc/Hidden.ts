
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CharacterHelper } from '../../helpers/character-helper';

export class Hidden extends SpellEffect {

  iconData = {
    name: 'hidden',
    color: '#ccc',
    bgColor: '#000',
    tooltipDesc: 'Hidden in the shadows, ready to pounce.'
  };

  maxSkillForSkillGain = 5;

  skillFlag() {
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    this.flagPermanent(caster.uuid);
    this.potency = caster.stealthLevel();
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You step into the shadows.');
    char.gainStat('stealth', this.potency);
  }

  effectTick(char: Character) {
    if(CharacterHelper.isInDarkness(char) || CharacterHelper.isNearWall(char)) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer hidden!');
    char.loseStat('stealth', this.potency);
  }
}
