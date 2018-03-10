
import { last, includes } from 'lodash';

import { ChanneledSpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { MessageHelper } from '../../helpers/lobby/message-helper';
import { GenderHelper } from '../../helpers/character/gender-helper';
import { NPC } from '../../../shared/models/npc';
import { ActivePet } from '../special/ActivePet';
import { SummonedPet } from '../special/SummonedPet';

const animalHash = {
  deer: 'Mage Summon Deer',
  wolf: 'Mage Summon Wolf',
  bear: 'Mage Summon Bear',
  chillspider: 'Mage Summon Chillspider'
};

// this hash is for boosting stats/etc of the summoned creature, so it's useful
const animalModHash = {
  deer: (npc: NPC, potency: number) => {
    const base = npc.baseStats;
    npc.gainBaseStat('hp', Math.floor(base.hp * potency));
  },
  wolf: (npc: NPC, potency: number) => {
    const base = npc.baseStats;
    npc.gainBaseStat('hp', Math.floor(base.hp * potency / 5));
    npc.gainBaseStat('str', Math.floor(potency / 3));
  },
  bear: (npc: NPC, potency: number) => {
    const base = npc.baseStats;
    npc.gainBaseStat('hp', Math.floor(base.hp * potency / 3));
    npc.gainBaseStat('str', Math.floor(potency / 5));
    npc.gainBaseStat('con', Math.floor(potency / 5));
  },
  chillspider: (npc: NPC, potency: number) => {
    const base = npc.baseStats;
    npc.gainBaseStat('hp', Math.floor(base.hp * potency / 4));
    npc.gainBaseStat('str', Math.floor(potency / 4));
    npc.gainBaseStat('con', Math.floor(potency / 6));
  }
};

export class ChannelFindFamiliar extends ChanneledSpellEffect {

  iconData = {
    name: 'eagle-emblem',
    bgColor: '#050',
    color: '#fff',
    tooltipDesc: 'Channeling FindFamiliar.'
  };

  private animalId: string;
  private animalStr: string;

  maxSkillForSkillGain = 17;

  cast(caster: Character, target: Character, skillRef?: Skill, animalStr?: string) {
    super.cast(caster, target, skillRef);

    this.setPotencyAndGainSkill(caster, skillRef);
    if(!this.duration) this.duration = 5;

    animalStr = animalStr.toLowerCase();

    const allPossibleAnimals = ['deer'];

    if(this.potency >= 5) allPossibleAnimals.push('wolf');
    if(this.potency >= 10) allPossibleAnimals.push('bear');
    if(this.potency >= 20) allPossibleAnimals.push('chillspider');

    // can't cast for an animal at a higher skill
    if(!includes(allPossibleAnimals, animalStr)) animalStr = '';

    let resultingId = animalHash[animalStr];
    if(!resultingId) resultingId = animalHash[last(allPossibleAnimals)];

    this.animalStr = animalStr || last(allPossibleAnimals);
    this.animalId = resultingId;

    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    MessageHelper.sendClientMessageToRadius(char, `${char.name} begins channeling find familiar.`);

    if(char.$$pet) {
      char.$$pet.die(char, true);
    }
  }

  effectEnd(char: Character) {
    if(this.duration !== 0) {
      MessageHelper.sendClientMessageToRadius(char, `${char.name} ceases channeling find familiar.`);
      return;
    }

    MessageHelper.sendClientMessageToRadius(char, `${char.name} finishes channeling find familiar for ${GenderHelper.hisher(char)} pet ${this.animalStr}!`);

    const defaultSpawner = {
      maxCreatures: 1,
      respawnRate: 0,
      initialSpawn: 1,
      spawnRadius: 0,
      randomWalkRadius: 30,
      leashRadius: 50,
      shouldStrip: false,
      stripOnSpawner: true,
      removeWhenNoNPCs: true,
      npcIds: [this.animalId],

      npcCreateCallback: (npc: NPC) => {

        // match the player
        npc.allegianceReputation = char.allegianceReputation;
        npc.allegianceReputation.Enemy = -100000;
        npc.allegiance = char.allegiance;
        npc.alignment = char.alignment;
        npc.hostility = 'Faction';
        npc.level = char.level;

        npc.name = `pet ${npc.name}`;

        // boost stats
        animalModHash[this.animalStr](npc, this.potency);

        // make them know each other
        char.$$pet = npc;
        npc.$$owner = char;

        const summonedPet = new SummonedPet({});
        summonedPet.cast(char, npc);
      }
    };

    char.$$room.createSpawner(defaultSpawner, char);

    const activePet = new ActivePet({ potency: this.potency });
    activePet.duration = this.potency * 50;
    activePet.cast(char, char);
  }
}
