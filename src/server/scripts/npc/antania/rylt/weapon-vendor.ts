import { NPC } from '../../../../../models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { VendorResponses } from '../../common-responses';
import { sample } from 'lodash';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Dagger',
    'Antanian Shortsword',
    'Antanian Longsword',
    'Antanian Greatsword',
    'Antanian Staff',
    'Antanian Crossbow',
    'Antanian Shortbow',
    'Antanian Wooden Shield',
    'Antanian Halberd'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem(sample(vendorItems));
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
