
import { LootFunctions, LootTable } from 'lootastic';
import { LootHelper } from '../../../../helpers/world/loot-helper';

export const setup = async (room) => {

  const possibleLoot = [
    'Steffen Offensive Sash',
    'Yzalt Basic Sash',
    'Heniz Agility Sash',
    'Yzalt MagicResist Bracers',
    'Heniz Dexterity Bracers',
    'Yzalt Defensive Claws',
    'Yzalt Combat Boots',
    'Yzalt Combat Amulet',
    'Yzalt Armor Ring',
    'Steffen DamageResist Ring',
    'Heniz Intelligence Ring',
    'Heniz Battlemage Gloves',
    'Steffen Strength Gloves',
    'Steffen Mana Ring',
    'Steffen Wisdom Amulet'
  ];

  const lootTables = [{
    table: new LootTable(possibleLoot, 0),
    func: LootFunctions.WithoutReplacement,
    args: 1
  }];

  const chest1 = room.getInteractableByName('Chest 1');
  chest1.searchItems = await LootHelper.getItemsFromTables(lootTables, room);

};
