import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { sample } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Royalty';
  npc.affiliation = 'Weapon Vendor';

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

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem(sample(vendorItems));
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
