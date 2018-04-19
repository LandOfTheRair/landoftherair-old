import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { sample } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.allegiance = 'Pirates';

  const vendorItems = [
    'Antanian Dagger',
    'Antanian Shortsword',
    'Antanian Staff',
    'Antanian Crossbow',
    'Antanian Shortbow',
    'Antanian Returning Dagger'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem(sample(vendorItems));
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
