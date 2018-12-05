
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

    const failChance = effect ? (5 + (effect.potency / 2) - mySkill) * 5 : 100;

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

  static doImbue(player: Player) {
    const item = player.rightHand;
    const scroll = player.leftHand;

    const effect = scroll.effect;

    const mySkill = player.calcSkillLevel(SkillClassNames.Runewriting);

    let failChance = 0;
    if(!item.effect) {
      failChance = 1;
    } else if(item.effect.name === effect.name) {
      failChance = item.effect.potency + 1;
    }

    if(item.effect && item.effect.name === effect.name && item.effect.potency + 1 > effect.potency) failChance = 100;

    if(failChance > 0 && RollerHelper.XInOneHundred(failChance)) {
      player.sendClientMessage('The spell is too difficult to imbue.');
      player.gainSkill(SkillClassNames.Runewriting, Math.floor(effect.potency / 3));
      player.setLeftHand(null);
      return;
    }

    const skillGain = effect.potency + 10;
    player.gainSkill(SkillClassNames.Runewriting, skillGain);

    if(!item.effect || item.effect.name !== effect.name) item.effect = { potency: 0, name: effect.name };
    item.effect.potency++;
    item.effect.chance = mySkill;

    player.setLeftHand(null);
    player.sendClientMessage(`The scroll imparts the spell "${effect.name}" onto your ${player.rightHand.itemClass.toLowerCase()}!`);
  }
}
