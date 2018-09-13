
import { sampleSize, filter } from 'lodash';

import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { VALID_TRADESKILLS_HASH } from '../../../shared/helpers/tradeskill-helper';

export class PermanentSkill extends Effect {
  effectStart(char: Character) {
    this.effectMessage(char, 'You feel more skilled!');

    const skills = char.allSkills;
    const gainedSkills = sampleSize(filter(Object.keys(skills), skill => {
      return skills[skill] > 0 && !VALID_TRADESKILLS_HASH[skill];
    }), 3);

    gainedSkills.forEach(skill => {
      char.gainSkill(skill, this.potency);
    });
  }
}
