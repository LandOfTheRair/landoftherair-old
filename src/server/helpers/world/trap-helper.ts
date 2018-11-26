
import { cloneDeep } from 'lodash';

import { Character } from '../../../shared/models/character';

import { SkillClassNames } from '../../../shared/interfaces/character';
import { IItem } from '../../../shared/interfaces/item';

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
    const effectProto = target.$$room.effectHelper.getEffectByName(effect.name);
    const effectRef = new effectProto(effect);
    effectRef.casterRef = caster;

    const casterCreature = target.$$room.state.findCharacter(caster.uuid);

    effectRef.cast(casterCreature ? casterCreature : target, target, obj);
  }

  static placeTrap(x, y, user: Character, trap: IItem): boolean {

    const interactable = user.$$room.state.getInteractable(x, y, true);
    if(interactable) return false;

    const statCopy = user.sumStats;

    const effect = cloneDeep(trap.effect);

    effect.range = user.getTraitLevel('WiderTraps');
    effect.potency += user.getTraitLevelAndUsageModifier('StrongerTraps');

    const trapInteractable = {
      x: x * 64,
      y: (y + 1) * 64,
      uses: (effect.uses || 1) + user.getTraitLevel('ReusableTraps'),
      type: 'Trap',
      sprite: trap.sprite,
      properties: {
        effect,
        caster: {
          name: user.name,
          uuid: user.uuid,
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
