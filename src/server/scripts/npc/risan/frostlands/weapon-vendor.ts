import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { sample } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Weapon Vendor';

  const vendorItems = [
    'Risan Dagger',
    'Risan Shortsword',
    'Risan Longsword',
    'Risan Greatsword',
    'Risan Staff',
    'Risan Crossbow',
    'Risan Shortbow',
    'Risan Longbow',
    'Risan Wooden Shield',
    'Risan Halberd'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem(sample(vendorItems));
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
