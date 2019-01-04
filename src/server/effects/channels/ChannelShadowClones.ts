
import { some, cloneDeep } from 'lodash';

import { ChanneledSpellEffect, Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { NPC } from '../../../shared/models/npc';
import { Item } from '../../../shared/models/item';
import { StatName } from '../../../shared/interfaces/character';

class SummonedClone extends Effect {

  iconData = {
    name: 'dark-squad',
    color: '#000',
    tooltipDesc: 'Clone. Summoned by Player.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.iconData.tooltipDesc = `Clone. Summoned by ${caster.name}.`;
    this.flagPermanent(target.uuid);
    target.applyEffect(this);
  }
}

class ActiveClones extends Effect {

  iconData = {
    name: 'dark-squad',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'You have summoned backup.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.applyEffect(this);
  }

  effectTick(char: Character) {
    if(!char.$$pets) return;

    char.$$pets.forEach(npc => {

      let itemChanged = false;

      if(char.rightHand) {
        if(char.rightHand.canUseInCombat(char) && (!npc.rightHand || npc.rightHand.uuid !== char.rightHand.uuid)) {
          itemChanged = true;
          const item = new Item(cloneDeep(char.rightHand));
          item.requirements = null;
          item.owner = null;
          item.destroyOnDrop = true;
          npc.setRightHand(item);
        }
      } else {
        if(!npc.rightHand) {
          itemChanged = true;
          npc.setRightHand(null);
        }
      }

      if(char.leftHand) {
        if(char.leftHand && char.leftHand.canUseInCombat(char) && (!npc.leftHand || npc.leftHand.uuid !== char.leftHand.uuid)) {
          itemChanged = true;
          const item = new Item(cloneDeep(char.leftHand));
          item.requirements = null;
          item.owner = null;
          item.destroyOnDrop = true;
          npc.setLeftHand(item);
        }
      } else {
        if(!npc.leftHand) {
          itemChanged = true;
          npc.setLeftHand(null);
        }
      }

      if(itemChanged) npc.$$room.syncNPC(<NPC>npc);
    });

    if(char.$$pets && some(char.$$pets, pet => !pet.isDead())) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    char.killAllPets();
  }
}

export class ChannelShadowClones extends ChanneledSpellEffect {

  iconData = {
    name: 'dark-squad',
    bgColor: '#050',
    color: '#fff',
    tooltipDesc: 'Channeling Shadow Clones.'
  };

  maxSkillForSkillGain = 17;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    super.cast(caster, target, skillRef);

    this.setPotencyAndGainSkill(caster, skillRef);
    if(!this.duration) this.duration = 5;

    // first, go down to a base of skill 10
    this.potency -= 10;

    // then divide by 5 to see the number of clones total
    this.potency = Math.floor(this.potency / 5);

    // min of 1, always
    this.potency = Math.max(this.potency, 1);

    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    char.sendClientMessage('You begin calling for backup.');
    char.killAllPets();
  }

  effectEnd(char: Character) {
    if(this.duration !== 0) return;

    char.sendClientMessage('Your backup has arrived!');

    const defaultSpawner = {
      maxCreatures: this.potency,
      respawnRate: 0,
      initialSpawn: this.potency,
      spawnRadius: 0,
      randomWalkRadius: 30,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true,
      canSlowDown: false,
      removeWhenNoNPCs: true,
      doInitialSpawnImmediately: true,
      npcIds: ['Thief Shadow Clone'],

      npcCreateCallback: (npc: NPC) => {

        // match the player
        npc.allegianceReputation = char.allegianceReputation;
        npc.allegianceReputation.Enemy = -100000;
        npc.allegiance = char.allegiance;
        npc.alignment = char.alignment;
        npc.hostility = 'Faction';
        npc.level = char.level;

        // boost stats
        const skills = char.allSkills;
        Object.keys(skills).forEach(skill => {
          npc._gainSkill(skill, skills[skill]);
        });

        const stats = char.baseStats;
        Object.keys(stats).forEach((stat: StatName) => {
          npc.gainBaseStat(stat, stats[stat]);
        });

        const reversedPotency = (this.potency * 5) + 10;
        npc.gainBaseStat('hp', char.getBaseStat('hp') * reversedPotency);
        npc.gainBaseStat('offense', reversedPotency * 3);
        npc.gainBaseStat('accuracy', reversedPotency * 2);

        npc.recalculateStats();

        // make them know each other
        char.$$pets = char.$$pets || [];
        char.$$pets.push(npc);
        npc.$$owner = char;

        npc.affiliation = `${char.name}'s Clone`;

        const summoned = new SummonedClone({});
        summoned.cast(char, npc);
      }
    };

    char.$$room.createSpawner(defaultSpawner, char);

    const activePet = new ActiveClones({ potency: this.potency });
    activePet.duration = this.potency * 50;
    activePet.updateBuffDurationBasedOnTraits(char);
    activePet.cast(char, char);
  }
}
