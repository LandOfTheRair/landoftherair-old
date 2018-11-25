
import { Player } from '../../../shared/models/player';
import { SkillClassNames } from '../../../shared/interfaces/character';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class RunewritingHelper {

  static canRunewrite(player: Player): boolean {
    return player.calcBaseSkillLevel(SkillClassNames.Restoration) >= 1;
  }

  static doRunewrite(player: Player): void {

    const ink = player.potionHand;
    const scroll = player.rightHand;
    const blood = player.leftHand;

    const mySkill = player.calcSkillLevel(SkillClassNames.Runewriting);

    const effect = blood.stats.effect;

    const failChance = (5 + effect.potency - mySkill) * 5;

    if(failChance > 0 && RollerHelper.XInOneHundred(failChance)) {
      player.sendClientMessage('The blood is too difficult to inscribe.');
      player.gainSkill(SkillClassNames.Runewriting, Math.floor(effect.potency / 3));
      player.setLeftHand(null);
      return;
    }

    const skillGain = effect.potency + 10;
    player.gainSkill(SkillClassNames.Runewriting, skillGain);

    ink.ounces--;
    if(ink.ounces <= 0) player.setPotionHand(null);

    scroll.name = `Runewritten Scroll - ${effect.name} Lv. ${effect.potency}`;
    scroll.desc = `a rune scroll inscribed with the spell "${effect.name}"`;
    scroll.effect = {
      name: effect.name,
      potency: effect.potency,
      uses: blood.ounces + mySkill
    };

    scroll.cosmetic = { name: 'Ancientify', isPermanent: true };

    player.setLeftHand(null);

    player.sendClientMessage(`The blood imparts the knowledge of the spell "${effect.name}"!`);
  }
}
