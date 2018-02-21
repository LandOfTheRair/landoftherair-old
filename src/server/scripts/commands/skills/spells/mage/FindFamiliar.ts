
import { startsWith } from 'lodash';

import { Skill } from '../../../../../base/Skill';
import { Character, SkillClassNames } from '../../../../../../shared/models/character';
import { ChannelFindFamiliar as CastEffect } from '../../../../../effects/channels/ChannelFindFamiliar';

export class FindFamiliar extends Skill {

  static macroMetadata = {
    name: 'FindFamiliar',
    macro: 'cast findfamiliar',
    icon: 'eagle-emblem',
    color: '#0aa',
    mode: 'autoActivate',
    tooltipDesc: 'Summon a familiar. Channel: 5s. Cost: 100 MP'
  };

  public name = ['findfamiliar', 'cast findfamiliar'];
  public format = '[AnimalType]';

  mpCost = () => 100;
  range = () => 0;

  execute(user: Character, { gameState, args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, user, effect, args);
  }

  use(user: Character, target: Character, baseEffect = {}, animalStr: string) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this, animalStr);
  }

}
