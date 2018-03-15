
import { Skill } from '../../../../base/Skill';
import { Character } from '../../../../../shared/models/character';
import { Applied } from '../../../../effects/augments/Applied';

export class Apply extends Skill {

  static macroMetadata = {
    name: 'Apply',
    macro: 'apply',
    icon: 'bloody-sword',
    color: '#050',
    mode: 'autoActivate',
    tooltipDesc: 'Apply a bottle\'s effects from your left hand onto your weapon strikes.',
    requireBaseClass: 'Thief'
  };

  public name = 'apply';

  requiresLearn = false;

  execute(user: Character) {
    if(user.baseClass !== 'Thief') return user.sendClientMessage('You don\'t know how to do that!');

    if(!user.leftHand || user.leftHand.itemClass !== 'Bottle') return user.sendClientMessage('You are not holding a bottle!');
    if(!user.leftHand.effect || !user.leftHand.effect.canApply) return user.sendClientMessage('That bottle will not work for your weapons!');

    this.use(user);
  }

  use(user: Character) {
    const item = user.leftHand;

    user.useItem('leftHand', true);
    const effect = item.effect;

    const applied = new Applied({ appliedEffect: effect });
    applied.cast(user, user);
  }

}
