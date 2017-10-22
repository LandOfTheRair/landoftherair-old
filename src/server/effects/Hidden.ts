
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class Hidden extends SpellEffect {

  iconData = {
    name: 'hidden',
    color: '#ccc',
    bgColor: '#000',
    tooltipDesc: 'Hidden in the shadows, ready to pounce.'
  };

  maxSkillForSkillGain = 5;
  skillFlag = () => SkillClassNames.Thievery;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    this.duration = -1;
    this.potency = caster.stealthLevel();
    this.effectInfo = { isPermanent: true, caster: caster.uuid };
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You step into the shadows.');
    char.gainStat('stealth', this.potency);
  }

  effectTick(char: Character) {
    if(char.isNearWall()) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer hidden!');
    char.loseStat('stealth', this.potency);
  }
}
