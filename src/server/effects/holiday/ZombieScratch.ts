
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { NPC } from '../../../shared/models/npc';

export class ZombieScratch extends SpellEffect {

  iconData = {
    name: 'bleeding-wound',
    color: '#a00',
    tooltipDesc: 'Scratched by a zombie. Will transform if not killed quickly enough.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 30;
    this.flagCasterName(caster.name);
    target.applyEffect(this);
    this.effectMessage(caster, `You zombie-scratched ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were scratched by a zombie!');
  }

  effectEnd(char: Character) {
    char.sendClientMessageToRadius(`${char.name} undergoes a horrific transformation!`);

    char.name = 'zombie';
    char.allegiance = 'Enemy';
    char.sprite = 1465;
    char.alignment = 'Evil';
    char.monsterClass = 'Undead';
    (<NPC>char).hostility = 'Always';
    (<NPC>char).usableSkills.push('ShredTenPercent', 'HalloweenZombieScratch');

    (<NPC>char).drops = (<NPC>char).drops || [];
    (<NPC>char).drops.push({ result: 'Halloween Zombie Brain', chance: 1, maxChance: 2 });

    char.$$room.syncNPC(char);
  }
}
