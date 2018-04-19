import { NPC } from '../../../../shared/models/npc';
import { VendorResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Strength Potion',
    'Antanian Dexterity Potion',
    'Antanian Agility Potion',
    'Antanian Intelligence Potion',
    'Antanian Wisdom Potion',
    'Antanian Willpower Potion',
    'Antanian Constitution Potion',
    'Antanian Charisma Potion',
    'Antanian Luck Potion',
    'Antanian Health Potion',
    'Antanian Magic Potion'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
