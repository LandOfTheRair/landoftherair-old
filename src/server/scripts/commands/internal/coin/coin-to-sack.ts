
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';
import { ItemCreator } from '../../../../helpers/item-creator';

export class CoinToSack extends Command {

  public name = '~CtS';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    // it is a no-op
  }

}
