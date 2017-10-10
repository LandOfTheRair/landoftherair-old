import { NPC } from '../../../../../models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Lockpick'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Lockpick');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc, { classRestriction: 'Thief' });
};
