
import { Character, SkillClassNames } from '../../../shared/models/character';

import * as Effects from '../../effects';

export class TrapHelper {

  static triggerTrap(target: Character, obj: any): void {
    obj.uses--;
    if(obj.uses <= 0) {
      target.$$room.state.removeInteractable(obj);
    }
    TrapHelper.castEffectFromTrap(target, obj);
  }

  static castEffectFromTrap(target: Character, obj: any) {
    if(!obj || !obj.properties || !obj.properties.effect) return;

    target.sendClientMessage('You\'ve triggered a trap!');

    const { effect, caster } = obj.properties;
    const effectRef = new Effects[effect.name](effect);
    effectRef.casterRef = caster;

    const casterCreature = target.$$room.state.findPlayer(caster.username);

    effectRef.cast(casterCreature ? casterCreature : target, target, obj);
  }

  static placeTrap(x, y, user: Character, trap): boolean {

    const interactable = user.$$room.state.getInteractable(x, y, true, 'Trap');
    if(interactable) return false;

    const statCopy = user.sumStats;

    trap.effect.range = user.getTraitLevel('WiderTraps');
    trap.effect.potency += user.getTraitLevelAndUsageModifier('StrongerTraps');

    const trapInteractable = {
      x: x * 64,
      y: (y + 1) * 64,
      uses: (trap.uses || 1) + user.getTraitLevel('ReusableTraps'),
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
