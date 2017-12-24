
import { compact } from 'lodash';

import { SkillClassNames } from '../../shared/models/character';
import { Player } from '../../shared/models/player';
import { Item } from '../../shared/models/item';
import { DB } from '../database';

export class AlchemyHelper {
  static async alchemize(player: Player): Promise<Item> {
    const reagents = player.tradeSkillContainers.alchemy.reagents;

    const reagentNames = compact(reagents.map(x => x ? x.name : null));
    const recipeMatch = await DB.$recipes.findOne({ recipeType: 'alchemy', ingredients: { $all: reagentNames } });

    let returnedItem = null;

    if(recipeMatch) {
      const { item, skillGained, maxSkillForGains, xpGained } = recipeMatch;
      returnedItem = await player.$$room.itemCreator.getItemByName(item, player.$$room);

      player.gainExp(xpGained);

      if(player.calcSkillLevel(SkillClassNames.Alchemy) < maxSkillForGains) {
        player.gainSkill(SkillClassNames.Alchemy, skillGained);
      }

    } else {
      returnedItem = await player.$$room.itemCreator.getItemByName('Alchemical Mistake', player.$$room);
    }

    player.tradeSkillContainers.alchemy.clearReagents();
    player.tradeSkillContainers.alchemy.result = returnedItem;

    return returnedItem;
  }
}
