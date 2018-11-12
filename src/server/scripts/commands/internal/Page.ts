
import { clamp } from 'lodash';

import { Skill } from '../../../base/Skill';
import { Player } from '../../../../shared/models/player';

export class Page extends Skill {

  public name = ['~page', 'page'];
  public format = 'Hand Page';

  requiresLearn = false;

  execute(user: Player, { args, room, gameState }) {

    if(!args) return false;

    const [handCheck, page] = args.split(' ');

    const hand = handCheck.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;

    const item = hand === 'right' ? user.rightHand : user.leftHand;
    if(!item || item.itemClass !== 'Book') return user.sendClientMessage('That is not a book!');
    if(!item.bookPages)                    return user.sendClientMessage('That book has no pages!');

    item.bookCurrentPage = +page;
    if(isNaN(item.bookCurrentPage)) item.bookCurrentPage = 0;

    item.bookCurrentPage = clamp(item.bookCurrentPage, 0, item.bookPages.length - 1);

    user.sendClientMessage(`Turned the book to page ${item.bookCurrentPage + 1}.`);
  }

}
