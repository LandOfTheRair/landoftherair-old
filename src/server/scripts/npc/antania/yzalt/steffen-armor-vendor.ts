import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Royalty';

  const vendorItems = [
    'Antanian Ringmail Tunic',
    'Antanian Breastplate',
    'Antanian Cloak',
    'Antanian Leather Gloves',
    'Antanian Leather Boots',
    'Leather Ring'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Halberd');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
