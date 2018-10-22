
import { Character } from '../../../shared/models/character';
import { random, cloneDeep } from 'lodash';
import { Item } from '../../../shared/models/item';
import * as Classes from '../../classes';

export class CharacterHelper {

  static isAbleToSee(char: Character): boolean {
    if(char.hasEffect('Blind')) return false;
    if(CharacterHelper.isInDarkness(char) && !char.hasEffect('DarkVision')) return false;
    return true;
  }

  static canHide(char: Character): boolean|string {
    if(char.hasEffect('Revealed')) return 'You cannot hide right now!';
    if(char.hasEffect('Hidden')) return 'You are already hidden!';
    if(char.hasEffect('ShadowMeld')) return 'You are already melded with the shadows!';

    /** PERK:CLASS:THIEF:Thieves can hide if their HP exceeds 70% (compared to 90%). */
    const hideHpPercent = char.baseClass === 'Thief' ? 70 : 90;
    if(char.hp.ltePercent(hideHpPercent)) return 'You are too injured to hide!';

    const nearWall = CharacterHelper.isNearWall(char);
    const inDark = CharacterHelper.isInDarkness(char);

    if(!nearWall && !inDark) {
      if(!nearWall) return 'You are not near a wall!';
      if(!inDark) return 'There are no shadows here to hide in!';
    }

    return true;
  }

  static isInDarkness(char: Character): boolean {
    return char.$$room.state.isDarkAt(char.x, char.y);
  }

  static isNearWall(char: Character): boolean {
    for(let x = char.x - 1; x <= char.x + 1; x++) {
      for(let y = char.y - 1; y <= char.y + 1; y++) {
        const tile = char.$$room.state.checkIfDenseWall(x, y, false);
        if(tile) return true;
      }
    }
    return false;
  }

  static dropHands(char: Character): void {
    if(char.rightHand) {
      char.$$room.addItemToGround(char, char.rightHand);
      char.setRightHand(null);
    }

    if(char.leftHand) {
      char.$$room.addItemToGround(char, char.leftHand);
      char.setLeftHand(null);
    }
  }

  static strip(char: Character, { x, y }, spread = 0) {
    if(char.hasEffect('Secondwind')) return;

    this.dropHands(char);

    char.sendClientMessage('You feel an overwhelming heat as your equipment disappears from your body!', true);

    const pickSlot = () => ({ x: random(x - spread, x + spread), y: random(y - spread, y + spread) });

    if(char.currentGold > 0) {

      // can't use itemcreator because this is a shared model
      const gold = new Item({
        itemClass: 'Coin',
        name: 'Gold Coin',
        sprite: 212,
        value: char.currentGold,
        isBeltable: false,
        desc: 'gold coins'
      });

      char.$$room.addItemToGround(pickSlot(), gold);
      char.spendGold(char.currentGold);
    }

    Object.keys(char.gear).forEach(gearSlot => {
      const item = char.gear[gearSlot];
      if(!item) return;

      const point = pickSlot();
      char.$$room.addItemToGround(point, item);
      char.unequip(gearSlot);
    });

    for(let i = char.sack.allItems.length; i >= 0; i--) {
      const item = char.sack.takeItemFromSlot(i);
      if(!item || item.succorInfo) continue;

      const point = pickSlot();
      char.$$room.addItemToGround(point, item);
    }

    for(let i = char.belt.allItems.length; i >= 0; i--) {
      const item = char.belt.takeItemFromSlot(i);
      if(!item) continue;

      const point = pickSlot();
      char.$$room.addItemToGround(point, item);
    }
  }

  static handleDeadCharacter(char: Character) {

    char.dir = 'C';

    if(char.$$corpseRef && char.$$corpseRef.$heldBy) {
      const holder = char.$$room.state.findPlayer(char.$$corpseRef.$heldBy);

      if(char.isPlayer()) {
        char.$$room.setPlayerXY(char, holder.x, holder.y);
        char.fov = cloneDeep(holder.fov);
        char.$$room.updateFOV(char);

      } else {
        char.x = holder.x;
        char.y = holder.y;
      }
    }

    if(char.$$deathTicks > 0) {
      char.$$deathTicks--;
      if(char.$$deathTicks <= 0) {
        char.restore(true);
      }
    }
  }

  static setUpClassFor(char: Character) {
    Classes[char.baseClass || 'Undecided'].becomeClass(char);
  }
}
