import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Antanian Tunic',
    'Antanian Studded Tunic',
    'Antanian Scalemail Tunic',
    'Antanian Ringmail Tunic',
    'Antanian Breastplate',
    'Antanian Cloak',
    'Leather Ring'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Antanian Longsword');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
