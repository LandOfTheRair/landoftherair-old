import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const vendorItems = [
    { name: 'Weak BarNecro Potion', valueMult: 5 },
    { name: 'Weak BarFire Potion',  valueMult: 5 },
    { name: 'Weak BarFrost Potion', valueMult: 5 },
    { name: 'Weak BarWater Potion', valueMult: 5 },
    { name: 'TrueSight Potion',     valueMult: 5 }
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
