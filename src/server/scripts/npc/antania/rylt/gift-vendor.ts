import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Gem RNG Box'
  ];

  const dailyItems = [
    'Antanian Daily Gem RNG Box'
  ];

  await npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);
  await npc.$$room.npcLoader.loadDailyVendorItems(npc, dailyItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Gem RNG Box');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
