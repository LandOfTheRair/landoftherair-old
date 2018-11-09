import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { Currency } from '../../../../../shared/interfaces/holiday';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Token Vendor';

  const vendorItems = [
    { name: 'Rune Scroll - Winters Embrace I' },
    { name: 'Rune Scroll - Winters Embrace II' },
    { name: 'Rune Scroll - Winters Embrace III' },
    { name: 'Rune Scroll - Winters Embrace IV' },
    { name: 'Rune Scroll - Winters Embrace V' },
    { name: 'Christmas Gem' },
    { name: 'Christmas Walnuts' },
    { name: 'Christmas Carrot' },
    { name: 'Christmas Scarf' },
    { name: 'Christmas Scarf (Improved)' },
    { name: 'Christmas Top Hat' },
    { name: 'Christmas Top Hat (Improved)' },
    { name: 'Christmas Button Shield' },
    { name: 'Christmas Button Shield (Improved)' },
    { name: 'Christmas Wreath Ring' },
    { name: 'Christmas Pipe' },
    { name: 'Christmas Pipe (Improved)' },
    { name: 'Christmas Candy Staff' },
    { name: 'Christmas Candy Staff (Improved)' },
    { name: 'Christmas Snowglobe' },
    { name: 'Christmas Snowball' },
    { name: 'Cosmetic Scroll - Snowflake Joy' },
  ];

  const dailyVendorItems = [
    'Antanian Willpower Potion'
  ];

  npc.$$vendorCurrency = Currency.Christmas;
  await npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);
  await npc.$$room.npcLoader.loadDailyVendorItems(npc, dailyVendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Christmas Gem');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
