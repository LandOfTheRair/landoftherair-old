import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/character/npc-loader';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    'Mend Bottle',
    'Mend Bottle (5oz)',
    'Instant Heal Bottle',
    'Instant Heal Bottle (5oz)',
    'Scribe Scroll',
    'Ink Vial',
    'Antanian Slice of Bread',
    'Antanian Loaf of Bread',
    'Antanian Bottle of Water',
    'Antanian Pint of Water'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Instant Heal Bottle');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
