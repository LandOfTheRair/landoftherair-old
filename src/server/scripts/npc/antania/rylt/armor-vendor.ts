import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Armor Vendor';

  const vendorItems = [
    'Antanian Tunic',
    'Antanian Studded Tunic',
    'Antanian Scalemail Tunic',
    'Antanian Ringmail Tunic',
    'Antanian Breastplate',
    'Antanian Cloak',
    'Leather Ring'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Longsword');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
