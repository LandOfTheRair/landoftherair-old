
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class LoweredDefenses extends SpellEffect {

  iconData = {
    name: 'fall-down',
    color: '#000',
    tooltipDesc: 'Physical defenses lowered by 33%.'
  };

  private acPenalty = 0;
  private defensePenalty = 0;
  private mitigationPenalty = 0;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 7;
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.acPenalty = Math.floor(char.getTotalStat('armorClass') / 3);
    this.defensePenalty = Math.floor(char.getTotalStat('defense') / 3);
    this.mitigationPenalty = 10;

    char.loseStat('armorClass', this.acPenalty);
    char.loseStat('defense', this.defensePenalty);
    char.loseStat('mitigation', this.mitigationPenalty);
  }

  effectEnd(char: Character) {
    char.gainStat('armorClass', this.acPenalty);
    char.gainStat('defense', this.defensePenalty);
    char.gainStat('mitigation', this.mitigationPenalty);
  }
}
