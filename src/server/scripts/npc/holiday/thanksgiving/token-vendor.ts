import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { Currency } from '../../../../../shared/helpers/holiday-helper';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = 'Token Vendor';

  const vendorItems = [
    { name: 'Rune Scroll - Slow Digestion I' },
    { name: 'Rune Scroll - Slow Digestion II' },
    { name: 'Rune Scroll - Slow Digestion III' },
    { name: 'Rune Scroll - Slow Digestion IV' },
    { name: 'Rune Scroll - Slow Digestion V' },
    { name: 'Thanksgiving Gem' },
    { name: 'Thanksgiving Arrows' },
    { name: 'Thanksgiving Pilgrim Hat' },
    { name: 'Thanksgiving Pilgrim Cloak' },
    { name: 'Thanksgiving Pilgrim Boots' },
    { name: 'Thanksgiving Gobbler Staff' }
  ];

  const dailyVendorItems = [
    'Thanksgiving Heal Bottle',
    'Antanian Charisma Potion'
  ];

  npc.$$vendorCurrency = Currency.Thanksgiving;
  await npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);
  await npc.$$room.npcLoader.loadDailyVendorItems(npc, dailyVendorItems);

  npc.rightHand = await npc.$$room.npcLoader.loadItem('Thanksgiving Gem');
  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Risan Breastplate');

  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
