import { NPC } from '../../../../shared/models/npc';
import { VendorResponses } from '../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Mend Bottle'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Mend Bottle');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
