import { NPC } from '../../../../models/npc';
import { NPCLoader } from '../../../helpers/npc-loader';

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
    'Antanian Wooden Shield'
  ];

  NPCLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await NPCLoader.loadItem('Antanian Greatsword');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Cloak');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {

};
