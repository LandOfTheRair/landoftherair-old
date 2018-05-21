
import { filter, includes, every } from 'lodash';

import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { Player } from '../../../../../shared/models/player';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Lockpick',
    'Risan FireMist Thief Trap',
    'Risan IceMist Thief Trap',
    'Risan Poison Thief Trap',
    'Risan MagicBolt Thief Trap',
    'Risan HolyFire Thief Trap',
    'Risan Distraction Thief Trap',
    'Risan Blind Thief Trap',
    'Risan Snare Thief Trap',
    'Risan Stun Thief Trap',
    'Risan Darkness Thief Trap',
    'Risan Dispel Thief Trap',
    'Risan Cure Thief Trap',
    'Risan Haste Thief Trap',
    'Weak Disease Potion (5oz)',
    'Weak Blind Potion (5oz)',
    'Weak BlurredVision Potion (5oz)'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Lockpick');
  npc.leftHand = await npc.$$room.npcLoader.loadItem('Antanian FireMist Thief Trap');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

  const filterItems = (items, player: Player) => {
    if(player.getTraitLevel('AdvancedTraps')) return items;

    const trapNames = ['Distraction', 'Blind', 'Snare', 'Stun', 'Darkness', 'Haste'].map(x => `${x} Thief Trap`);
    return filter(items, item => every(trapNames, name => !includes(item.name, name)));
  };

  VendorResponses(npc, { classRestriction: 'Thief', filter: filterItems });
};
