import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Potion Vendor';

  const vendorItems = [
    'Scribe Scroll',
    'Ink Vial',
    'Ink Vial (15oz)',
    'Tweans Gem Codex',
    'Selens Alchemical Guide',
    'Pandiras Hammer Teachings',
    'Newbie Book'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Tweans Gem Codex');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
