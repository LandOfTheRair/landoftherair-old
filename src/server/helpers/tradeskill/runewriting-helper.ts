
import { Player } from '../../../shared/models/player';
import { SkillClassNames } from '../../../shared/models/character';

export class RunewritingHelper {

  static canRunewrite(player: Player): boolean {
    return player.calcSkillLevel(SkillClassNames.Restoration) >= 1;
  }

  static doRunewrite(player: Player): boolean {
    if(!player.potionHand || !player.rightHand || !player.leftHand) return false;

    // hardcoded ink vial for now, maybe use more ink vials later?
    if(player.potionHand.name !== 'Ink Vial') return false;

    // must be an empty scribe scroll
    if(player.rightHand.name !== 'Scribe Scroll') return false;
    if(player.rightHand.desc !== 'an empty scroll') return false;

    // must be a corpse, but not a player corpse
    if(player.leftHand.itemClass !== 'Corpse') return false;
    if(player.leftHand.$$isPlayerCorpse) return false;

    // TODO
    // consume an ounce of ink
    // pick a spell known by the target (check usableSkills, but ignore monster skills)
    // check if there is spell "the blood did not impart any knowledge" if not
    // write the desc of the scroll
    // write the effect of the scroll
    // effect potency is based on potency of writer
    // effect chance is based on the level of the corpse compared to the casters level
    //   50% chance when corpse level == player level, down to 10% if you're 10 levels lower, and up to 100% if you're 10 levels higher 
    // elite creatures have a potency bonus of 3, and a skill gain bonus of *2
    // Dangerous creatures have a potency bonus of 5, and a skill gain bonus of *3
    // skill gain is based on the level of the corpse
    // the corpse should be consumed no matter what, dropped to the ground and searched "the corpse crumbled to dust"
  }
}
