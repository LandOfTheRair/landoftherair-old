
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Transmute as CastEffect } from '../../../../../effects/misc/Transmute';

export class Transmute extends Skill {

  static macroMetadata = {
    name: 'Transmute',
    macro: 'cast transmute',
    icon: 'coins',
    color: '#665600',
    mode: 'autoActivate',
    tooltipDesc: 'Convert the items on your current tile into currentGold. Allows directional targeting. Cost: 15 MP'
  };

  public name = ['transmute', 'cast transmute'];

  mpCost() { return 15; }

  execute(user: Character, { args, effect }) {
    let target = this.getTarget(user, args, true, true);
    if(!target) target = user;

    if(!this.tryToConsumeMP(user, effect)) return;

    this.use(user, target, effect);
  }

  use(user: Character, target: Character|{ x: number, y: number }, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user, target, this);
  }

}
