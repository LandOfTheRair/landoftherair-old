import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Tunic',
    'Antanian Studded Tunic',
    'Antanian Scalemail Tunic',
    'Antanian Cloak',
    'Antanian Leather Gloves',
    'Antanian Leather Boots',
    'Leather Ring'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Antanian Longsword');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Scalemail Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
