
import { extend, maxBy } from 'lodash';
import { Player } from './player';
import { SkillClassNames } from './character';

export class SkillTree {
  levelsClaimed: { [key: string]: boolean } = {};
  skillsClaimed: { [key: string]: boolean } = {};
  nodesClaimed:  { [key: string]: boolean } = {};

  private traitPoints: number;
  private resetPoints: number;
  private partyPoints: number;

  private baseClass: string;

  public get canGainResetPoints(): boolean {
    return this.resetPoints < 100;
  }

  public get canGainPartyPoints(): boolean {
    return this.partyPoints < 100;
  }

  constructor(opts: any = {}) {
    extend(this, opts);
  }

  public calculateNewTPFromLevels(player: Player): number {
    const level = player.level;

    let gainedTP = 0;

    for(let i = 1; i <= level; i++) {
      if(this.levelsClaimed[i]) continue;
      this.levelsClaimed[i] = true;

      gainedTP += 1;
    }

    this.gainTraitPoints(gainedTP);
    player.saveSkillTree();

    return gainedTP;
  }

  public calculateNewTPFromSkills(player: Player): number {
    const highestSkill = this.getHighestRelevantSkillLevel(player);

    let gainedTP = 0;

    for(let i = 0; i <= highestSkill; i++) {
      if(this.skillsClaimed[i]) continue;
      this.skillsClaimed[i] = true;

      gainedTP += i;
    }

    this.gainTraitPoints(gainedTP);
    player.saveSkillTree();

    return gainedTP;
  }

  private getHighestRelevantSkillLevel(player: Player): number {
    switch(player.baseClass) {
      case 'Mage':    return player.calcSkillLevel(SkillClassNames.Conjuration);
      case 'Thief':   return player.calcSkillLevel(SkillClassNames.Thievery);
      case 'Healer':  return player.calcSkillLevel(SkillClassNames.Restoration);
      case 'Warrior': {
        const otherSkills = [
          SkillClassNames.OneHanded,  SkillClassNames.TwoHanded,  SkillClassNames.Dagger,
          SkillClassNames.Staff,      SkillClassNames.Polearm,    SkillClassNames.Axe,
          SkillClassNames.Dagger,     SkillClassNames.Mace,       SkillClassNames.Martial,
          SkillClassNames.Ranged,     SkillClassNames.Throwing,   SkillClassNames.Wand
        ];

        const highestSkill = maxBy(otherSkills, skill => player.allSkills[skill.toLowerCase()]);
        return player.calcSkillLevel(highestSkill);
      }
    }
  }

  public hasTraitPoints(tp = 0): boolean {
    return this.traitPoints >= tp;
  }

  public gainTraitPoints(tp = 0): void {
    if(!this.traitPoints) this.traitPoints = 0;

    this.traitPoints += tp;
    if(this.traitPoints < 0 || isNaN(this.traitPoints)) this.traitPoints = 0;
  }

  public loseTraitPoints(tp = 1): void {
    this.gainTraitPoints(-tp);
  }

  public gainPartyPoints(pp = 0): void {
    if(!this.partyPoints) this.partyPoints = 0;

    this.partyPoints += pp;
    if(this.partyPoints < 0 || isNaN(this.partyPoints)) this.partyPoints = 0;
  }

  public losePartyPoints(pp = 1): void {
    this.gainPartyPoints(-pp);
  }

  // to check if anything is resettable, make sure all of its unlocked nodes are not bought. if any are, it can't be reset
  public gainResetPoints(rp = 0): void {
    if(!this.resetPoints) this.resetPoints = 0;

    this.resetPoints += rp;
    if(this.resetPoints < 0 || isNaN(this.resetPoints)) this.resetPoints = 0;
  }

  public loseResetPoints(rp = 1): void {
    this.gainResetPoints(-rp);
  }

  public reset(): void {
    this.nodesClaimed = {};
    this.levelsClaimed = {};
    this.skillsClaimed = {};

    this.traitPoints = 0;
  }

  public validateSelf(): void {
    // make sure there are no orphaned nodes. if there are, remove them from the nodesClaimed hash
    // make sure all pre-reqs are met for each node
    // make sure all bought nodes cost the same and refund the difference
  }

  public syncWithPlayer(player: Player): void {
    this.baseClass = player.baseClass;
    // reset learnedskills, recalc to make sure everything still jives
  }

  // should nodes store their cost? so if it changes, the node and children are removed?
  public buyTrait(player: Player, traitName: string, boost = 1): void {
    player.increaseTraitLevel(traitName, boost);
  }

  public buySkill(player: Player, skillName: string): void {
    player.learnSpell(skillName);
    player.$$room.resetMacros(player);
  }
}
