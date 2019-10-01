import { NPC } from '../../../../../shared/models/npc';
import { VendorResponses } from '../../common-responses';
import { Currency } from '../../../../../shared/interfaces/holiday';

export const setup = async (npc: NPC) => {
  npc.hostility = 'Never';
  npc.affiliation = '???';
  npc.$$vendorCurrency = Currency.Fate;

  const vendorItems = [
    'Abacus of Life',

    { name: 'Money Scroll 1M', valueMult: 0.0001 },
    { name: 'Money Scroll 25M', valueMult: 0.0001 },
    { name: 'Money Scroll 100M', valueMult: 0.0001 },
    { name: 'Money Scroll 1B', valueMult: 0.0001 },

    'Cosmetic Scroll - Fate',
    'Titanium Ingot (Fate)',
    'Enchanting Brick - Fate'
  ];

  npc.$$room.npcLoader.loadVendorItems(npc, vendorItems);

  npc.gear.Armor = await npc.$$room.npcLoader.loadItem('Antanian Tunic');
  npc.recalculateStats();
};

export const responses = (npc: NPC) => {
  VendorResponses(npc);
};
