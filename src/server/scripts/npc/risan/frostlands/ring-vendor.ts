import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Ring Vendor';

  const vendorItems = [
    'Identify Ring (Medium)',
    'Transmute Ring (Medium)',
    'Succor Ring (Medium)',
    'DarkVision Ring (Medium)',
    'Revive Ring (Medium)',
    'EagleEye Ring (Medium)',
    'BarFire Ring (Medium)',
    'BarFrost Ring (Medium)'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
