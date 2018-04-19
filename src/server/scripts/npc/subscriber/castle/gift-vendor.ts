import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';

  const dailyItems = [
    'Antanian Daily Gem RNG Box',
    'Antanian Daily Gem RNG Box',
    'Antanian Daily General Rune Scroll RNG Box',
    'Antanian Daily Healer Rune Scroll RNG Box',
    'Antanian Daily Mage Rune Scroll RNG Box',
    'Antanian Daily Thief Rune Scroll RNG Box',
    'Antanian Daily Warrior Rune Scroll RNG Box'
  ];

  await npc.$$room.npcLoader.loadDailyVendorItems(npc, dailyItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Antanian Gem RNG Box');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
