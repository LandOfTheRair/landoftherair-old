import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Pirates';

  const vendorItems = [
    'Antanian Tunic',
    'Antanian Studded Tunic',
    'Antanian Scalemail Tunic',
    'Antanian Cloak',
    'Antanian Leather Gloves',
    'Antanian Leather Boots',
    'Leather Ring'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Returning Dagger');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Scalemail Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
