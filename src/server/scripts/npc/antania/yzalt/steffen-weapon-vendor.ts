import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';
import { VendorResponses } from '../../common-responses';
import { sample } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Royalty';

  const vendorItems = [
    'Antanian Mace',
    'Antanian Halberd',
    'Antanian Axe',
    'Antanian Greataxe',
    'Antanian Greatmace',
    'Antanian Greatsword',
    'Antanian Hammer',
    'Antanian Longsword',
    'Antanian Wooden Shield',
    'Antanian Bubble Shield',
    'Antanian Iron Shield'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem(sample(vendorItems));
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
