
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class LoweredDefenses extends SpellEffect {

  iconData = {
    name: 'armor-downgrade',
    color: '#000',
    tooltipDesc: 'Physical defenses lowered.'
  };

  private acPenalty = 0;
  private defensePenalty = 0;
  private mitigationPenalty = 0;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = this.duration || 7;
    this.potency = this.potency || 1;
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.iconData.tooltipDesc = `Physical defenses lowered by ${this.potency * 5}%`;

    const lostPenalty = (this.potency * 5) / 100;
    this.acPenalty = Math.floor(char.getTotalStat('armorClass') * lostPenalty);
    this.defensePenalty = Math.floor(char.getTotalStat('defense') * lostPenalty);
    this.mitigationPenalty = Math.floor(this.potency);

    this.loseStat(char, 'armorClass', this.acPenalty);
    this.loseStat(char, 'defense', this.defensePenalty);
    this.loseStat(char, 'mitigation', this.mitigationPenalty);
  }
}
