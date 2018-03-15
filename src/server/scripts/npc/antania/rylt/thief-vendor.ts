import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Lockpick',
    'Antanian FireMist Thief Trap',
    'Antanian IceMist Thief Trap',
    'Antanian Poison Thief Trap',
    'Antanian MagicMissile Thief Trap',
    'Antanian Afflict Thief Trap',
    'Antanian Distraction Thief Trap'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Lockpick');
  npc.leftHand = await NPCLoader.loadItem('Antanian FireMist Thief Trap');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc, { classRestriction: 'Thief' });
};
