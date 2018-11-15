
import { Effect, SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { NPC } from '../../../shared/models/npc';


class SummonedDistraction extends Effect {

  iconData = {
    name: 'eagle-emblem',
    color: '#a0a',
    tooltipDesc: 'Distraction. Summoned by Player.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.iconData.tooltipDesc = `Distraction. Summoned by ${caster.name}.`;
    target.applyEffect(this);
  }

  effectEnd(char: Character) {
    char.die(null, true);
  }
}

export class Distraction extends SpellEffect {

  cast(caster: Character, target: Character, skillRef?: Skill) {
    super.cast(caster, target, skillRef);

    const defaultSpawner = {
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true,
      removeWhenNoNPCs: true,
      doInitialSpawnImmediately: true,
      npcIds: ['Thief Distraction'],

      npcCreateCallback: (npc: NPC) => {

        // match the player
        npc.allegianceReputation = { Enemy: -100000 };
        npc.allegiance = caster.allegiance;
        npc.alignment = caster.alignment;
        npc.hostility = 'Faction';
        npc.level = this.potency;

        const summoned = new SummonedDistraction({ duration: this.potency * 5 });
        summoned.cast(caster, npc);

        // boost stats
        npc.setBaseStat('move', 0);
        npc.gainBaseStat('hp', npc.getBaseStat('hp') * this.potency);
        npc.recalculateStats();
      }
    };

    caster.$$room.createSpawner(defaultSpawner, caster);
  }

}
