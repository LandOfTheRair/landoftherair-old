
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Vortex extends SpellEffect {
  async cast(caster: Character, target: Character, skillRef?: Skill) {

    const radius = this.potency || 3;

    for(let x = caster.x - radius; x < caster.x + radius; x++) {
      for(let y = caster.y - radius; y < caster.y + radius; y++) {
        if(x === caster.x && y === caster.y) continue;

        const items = caster.$$room.state.getGroundItems(x, y);

        Object.keys(items).forEach(itemClass => {
          items[itemClass].forEach(item => {
            caster.$$room.removeItemFromGround(item);
            caster.$$room.addItemToGround(caster, item);
          });
        });
      }
    }
  }
}
