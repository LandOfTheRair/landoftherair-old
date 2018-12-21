
import { Skill } from '../../../../../base/Skill';
import { Character } from '../../../../../../shared/models/character';
import { Reincarnate as CastEffect } from '../../../../../effects';

export class Reincarnate extends Skill {

  static macroMetadata = {
    name: 'Reincarnage',
    macro: 'cast reincarnate',
    icon: 'life-in-the-balance',
    color: '#DC143C',
    mode: 'clickToTarget',
    tooltipDesc: 'Bring a strong foe back to life.'
  };

  public name = ['reincarnate', 'cast reincarnate'];
  public format = 'Target';

  canUse(user: Character, target: Character) {
    return true;
  }

  mpCost() { return 0; }
  range(attacker: Character) { return 5; }

  execute(user: Character, { args, effect }) {

    const spawners = user.$$room.allSpawners.filter(checkSpawner => {
      return checkSpawner.isDangerous && user.distFrom(checkSpawner) < 10 && checkSpawner.npcs.length === 0;
    });

    if(spawners.length === 0) return user.sendClientMessage('There is no lingering evil energy here.');

    this.use(user, effect);
  }

  use(user: Character, baseEffect = {}) {
    const effect = new CastEffect(baseEffect);
    effect.cast(user);
  }

}
