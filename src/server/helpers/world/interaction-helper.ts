
import { find, values } from 'lodash';

import { Character } from '../../../shared/models/character';
import { SkillClassNames } from '../../../shared/interfaces/character';

export class InteractionHelper {

  static tryToOpenDoor(player: Character, door, { gameState }): boolean {
    door.properties = door.properties || {};
    const { requireLockpick, skillRequired, requireHeld, requireEventToOpen, lockedIfAlive } = door.properties;

    if(requireEventToOpen) return false;

    if(!door.isOpen
      && (requireLockpick || requireHeld || lockedIfAlive)) {

      let shouldOpen = false;

      if(player.rightHand && player.rightHand.itemClass === 'Key') {

        if(player.rightHand.isBroken()) {
          player.sendClientMessage('That key is not currently usable!');
          return;
        }

        if(requireHeld && player.hasHeldItem(requireHeld)) {
          shouldOpen = true;
          player.rightHand.condition -= 1000;
        } else {
          player.sendClientMessage('The key snapped off in the lock!');
          player.rightHand.condition = 0;
          return;
        }
      }

      /** PERK:CLASS:THIEF:Thieves can pick locks. */
      if(requireLockpick
        && skillRequired
        && player.baseClass === 'Thief'
        && player.hasHeldItem('Lockpick', 'right')) {

        const playerSkill = player.calcSkillLevel(SkillClassNames.Thievery) + player.getTraitLevel('LockpickSpecialty');

        if(playerSkill < skillRequired) {
          player.sendClientMessage('You are not skilled enough to pick this lock.');
          return false;
        }

        player.gainSkill(SkillClassNames.Thievery, skillRequired);
        player.sendClientMessage('You successfully picked the lock!');
        player.setRightHand(null);

        shouldOpen = true;
      }

      if(lockedIfAlive) {
        const isNPCAlive = find(values(player.$$room.state.mapNPCs), { npcId: lockedIfAlive });
        if(!isNPCAlive || (isNPCAlive && isNPCAlive.isDead())) {
          shouldOpen = true;
        } else {
          player.sendClientMessage('The door is sealed shut by a magical force.');
          return false;
        }
      }

      if(!shouldOpen) {
        player.sendClientMessage('The door is locked.');
        return false;
      }
    }

    if(door.isOpen) {
      const allInDoor = player.$$room.state.getAllInRangeRaw({ x: door.x / 64, y: (door.y / 64) - 1 }, 0);
      if(allInDoor.length > 0) {
        player.sendClientMessage('Something is blocking the door.');
        return false;
      }
    }

    player.sendClientMessage({ message: door.isOpen ? 'You close the door.' : 'You open the door.', sfx: door.isOpen ? 'env-door-close' : 'env-door-open' });
    gameState.toggleDoor(door);
    return true;
  }

}
