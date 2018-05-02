
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { NPC } from '../../../shared/models/npc';

export class Distraction extends SpellEffect {

  cast(caster: Character, target: Character, skillRef?: Skill) {
    super.cast(caster, target, skillRef);

    const defaultSpawner = {
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 0,
      leashRadius: 0,
      shouldStrip: false,
      removeWhenNoNPCs: true,
      npcIds: ['Thief Distraction'],

      npcCreateCallback: (npc: NPC) => {

        // match the player
        npc.allegianceReputation.Enemy = -100000;
        npc.allegiance = 'None';
        npc.alignment = 'Neutral';
        npc.hostility = 'Faction';
        npc.level = this.potency;

        // boost stats
        npc.gainBaseStat('hp', npc.getBaseStat('hp') * this.potency * 5);
        npc.recalculateStats();
      }
    };

    caster.$$room.createSpawner(defaultSpawner, caster);
  }

}
