
import { LootRoller, LootFunctions, LootTable } from 'lootastic';
import { LootHelper } from '../../../../helpers/loot-helper';

export const setup = async (room) => {

  const possibleLoot = [
    'Steffen Offensive Sash',
    'Yzalt Basic Sash',
    'Yzalt MagicResist Bracers',
    'Heniz Dexterity Bracers',
    'Yzalt Defensive Claws',
    'Yzalt Combat Boots',
    'Yzalt Combat Amulet',
    'Yzalt Armor Ring',
    'Steffen DamageResist Ring',
    'Heniz Intelligence Ring',
    'Heniz Battlemage Gloves',
    'Steffen Mana Ring',
    'Steffen Wisdom Amulet'
  ];

  const lootTables = [{
    table: new LootTable(possibleLoot, 0),
    func: LootFunctions.WithoutReplacement,
    args: 1
  }];

  const chest1 = room.state.getInteractableByName('Chest 1');
  chest1.searchItems = await LootHelper.getItemsFromTables(lootTables, room);

  const chest2 = room.state.getInteractableByName('Chest 2');
  chest2.searchItems = await LootHelper.getItemsFromTables(lootTables, room);

  const chest3 = room.state.getInteractableByName('Chest 3');
  chest3.searchItems = await LootHelper.getItemsFromTables(lootTables, room);

};
