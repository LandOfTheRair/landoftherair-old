
import { Character, SkillClassNames } from '../../../shared/models/character';

import * as Effects from '../../effects';

export class TrapHelper {

  static castEffectFromTrap(target: Character, obj: any) {
    if(!obj || !obj.properties || !obj.properties.effect) return;

    target.sendClientMessage('You\'ve triggered a trap!');

    const { effect, caster } = obj.properties;
    const effectRef = new Effects[effect.name](effect);
    effectRef.casterRef = caster;

    effectRef.cast(target, target);
  }

  static placeTrap(x, y, user: Character, trap): boolean {

    const interactable = user.$$room.state.getInteractable(x, y, true, 'Trap');
    if(interactable) return false;

    const statCopy = user.sumStats;

    const trapInteractable = {
      x: x * 64,
      y: (y + 1) * 64,
      type: 'Trap',
      properties: {
        effect: trap.effect,
        caster: {
          name: user.name,
          username: (<any>user).username,
          casterStats: statCopy
        },
        setSkill: user.calcSkillLevel(SkillClassNames.Thievery),
        setStealth: user.getTotalStat('stealth'),
        timestamp: Date.now()
      }
    };

    user.$$room.state.addInteractable(trapInteractable);

    return true;
  }
}
