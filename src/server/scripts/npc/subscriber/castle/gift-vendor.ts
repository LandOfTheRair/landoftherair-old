import { NPC } from '../../../../../shared/models/npc';
import { NPCLoader } from '../../../../helpers/npc-loader';
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

  await NPCLoader.loadDailyVendorItems(npc, dailyItems);

  npc.rightHand = await NPCLoader.loadItem('Antanian Gem RNG Box');
  npc.gear.Armor = await NPCLoader.loadItem('Antanian Tunic');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
