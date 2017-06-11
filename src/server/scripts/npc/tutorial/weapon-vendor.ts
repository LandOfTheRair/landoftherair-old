import { NPC } from '../../../../models/npc';

export const setup = (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Dagger',
    'Antanian Shortsword',
    'Antanian Longsword',
    'Antanian Greatsword',
    'Antanian Staff',
    'Antanian Crossbow',
    'Antanian Shortbow',
    'Antanian Wooden Shield'
  ];

  npc.loadVendorItems(vendorItems);
};

export const responses = (npc: NPC) => {

};
