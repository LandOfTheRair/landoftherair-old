
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
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

  public targetsFriendly = true;

  public name = ['findfamiliar', 'cast findfamiliar'];
  public format = '[AnimalType]';

  canUse(user: Character, target: Character) {
    return false;
  }

  mpCost() { return 100; }

  execute(user: Character, { args, effect }) {
    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, user, effect, args);
  }

  use(user: Character, target: Character, baseEffect = {}, animalStr: string) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this, animalStr);
  }

}
