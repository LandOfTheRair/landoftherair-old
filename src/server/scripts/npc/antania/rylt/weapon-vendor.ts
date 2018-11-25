import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { sample } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Weapon Vendor';

  const vendorItems = [
    'Antanian Dagger',
    'Antanian Shortsword',
    'Antanian Longsword',
    'Antanian Greatsword',
    'Antanian Staff',
    'Antanian Crossbow',
    'Antanian Shortbow',
    'Antanian Longbow',
    'Antanian Wooden Shield',
    'Antanian Halberd',
    'Antanian Spear',
    'Antanian Arrows',
    'Smith Hammer'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem(sample(vendorItems));
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
