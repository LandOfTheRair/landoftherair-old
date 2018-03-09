import { NPC } from '../../../../shared/models/npc';
import { NPCLoader } from '../../../helpers/character/npc-loader';
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

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
