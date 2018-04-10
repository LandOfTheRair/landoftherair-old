
import { extend, maxBy, values } from 'lodash';
import { Player } from './player';
import { SkillClassNames } from './character';
import { nonenumerable } from 'nonenumerable';
import { AllTrees } from '../generated/skilltrees';

// TODO how can you NaN traitPoints?
// TODO how does saving the skill tree sometimes null it?

export class SkillTree {
  levelsClaimed: { [key: string]: boolean } = {};
  skillsClaimed: { [key: string]: boolean } = {};
  nodesClaimed:  { [key: string]: number  } = {};

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

  @nonenumerable
  public buyableNodesHash: { [key: string]: boolean } = {};

  constructor(opts: any = {}) {
    extend(this, opts);
    if(!this.traitPoints) this.traitPoints = 0;
    if(!this.resetPoints) this.resetPoints = 0;
    if(!this.partyPoints) this.partyPoints = 0;

    this.updateBuyableNodes();
  }

  public isBought(traitName: string): boolean {
    return !!this.nodesClaimed[traitName];
  }

  public isAvailableToBuy(traitName: string): boolean {
    if(this.isBought(traitName)) return false;

    return this.buyableNodesHash[traitName];
  }

  public linkBuyableNodeToRealNode(traitName: string): any {
    if(!this.isAvailableToBuy(traitName)) return null;

    return AllTrees[this.baseClass][traitName];
  }

  public hasEnoughPointsToBuy(traitName: string): boolean {
    const node = this.linkBuyableNodeToRealNode(traitName);
    if(!node) return false;

    if(node.isParty) return this.partyPoints >= node.cost;
    return this.traitPoints >= node.cost;
  }

  public isCapableOfBuying(traitName, player: Player): boolean {
    const node = this.linkBuyableNodeToRealNode(traitName);
    if(!node) return false;

    const myLevel = player.level;
    const mySkill = this.getHighestRelevantSkillLevel(player);

    return myLevel >= (node.requireCharacterLevel || 0) && mySkill > (node.requireSkillLevel || 0);
  }

  private updateBuyableNodes(): void {
    if(!this.baseClass) return;

    this.buyableNodesHash = {};

    values(AllTrees[this.baseClass]).forEach(node => {
      if(!node.root) return;
      node.unlocks.forEach(unlock => this.buyableNodesHash[unlock] = true);
    });

    Object.keys(this.nodesClaimed).forEach(boughtNode => {
      if(this.buyableNodesHash[boughtNode]) delete this.buyableNodesHash[boughtNode];

      const node = AllTrees[this.baseClass][boughtNode];
      if(!node.unlocks) return;

      node.unlocks.forEach(unlock => this.buyableNodesHash[unlock] = true);
    });

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
    this.updateBuyableNodes();
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

  private buyItem(traitNode: any): void {
    this.nodesClaimed[traitNode.name] = traitNode.cost;

    if(traitNode.isParty) {
      this.partyPoints -= traitNode.cost;
      return;
    }

    this.traitPoints -= traitNode.cost;
  }

  // should nodes store their cost? so if it changes, the node and children are removed?
  public buyTrait(player: Player, traitName: string, realName: string): void {
    const node = this.linkBuyableNodeToRealNode(traitName);
    if(!node) return;

    this.buyItem(node);

    player.sendClientMessage(`You have expanded your trait "${realName}"!`);
    const boost = node.capstone ? 3 : 1;
    player.increaseTraitLevel(realName, boost);

    this.updateBuyableNodes();
  }

  public buySkill(player: Player, skillName: string): void {
    const node = this.linkBuyableNodeToRealNode(skillName);
    if(!node) return;

    this.buyItem(node);

    player.sendClientMessage(`You have learned the skill "${skillName}"!`);
    player.learnSpell(skillName);
    player.$$room.resetMacros(player);

    this.updateBuyableNodes();
  }
}
