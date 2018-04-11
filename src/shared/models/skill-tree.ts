
import { extend, maxBy, values, every, some } from 'lodash';
import { Player } from './player';
import { SkillClassNames } from './character';
import { nonenumerable } from 'nonenumerable';
import { AllTrees } from '../generated/skilltrees';

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
    return AllTrees[this.baseClass][traitName];
  }

  public hasEnoughPointsToRefund(): boolean {
    return this.resetPoints > 0;
  }

  public hasEnoughPointsToBuy(traitName: string): boolean {
    const node = this.linkBuyableNodeToRealNode(traitName);
    if(!node) return false;

    if(node.isParty) return this.partyPoints >= node.cost;
    return this.traitPoints >= node.cost;
  }

  public isCapableOfBuying(traitName: string, player: Player): boolean {
    const node = this.linkBuyableNodeToRealNode(traitName);
    if(!node) return false;

    const myLevel = player.level;
    const mySkill = this.getHighestRelevantSkillLevel(player);

    return myLevel >= (node.requireCharacterLevel || 0) && mySkill > (node.requireSkillLevel || 0);
  }

  public isCapableOfRefunding(traitName: string): boolean {
    const node = this.linkBuyableNodeToRealNode(traitName);
    if(!node) return false;

    if(!node.unlocks || node.unlocks.length === 0) return true;

    return every(node.unlocks, unlock => !this.isBought(unlock));
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

  public reset(player: Player): void {

    // TODO actually un-buy everything so refunds are processed correctly - do it here, then reset

    this.nodesClaimed = {};
    this.levelsClaimed = {};
    this.skillsClaimed = {};

    this.traitPoints = 0;
    player.$$room.savePlayer(player);
    this.updateBuyableNodes();
  }

  public validateSelf(player: Player): void {

    Object.keys(this.nodesClaimed).forEach(claimedNode => {
      const realNode = this.linkBuyableNodeToRealNode(claimedNode);

      // no node = instant refund
      if(!realNode) {
        this.refundNode(player, claimedNode);
        return;
      }

      // if it has no parents, whatever, probably not a buyable node or something
      if(!realNode.unlockedBy) return;

      // if it's missing all parents, probably not valid
      const missingAllParents = !some(realNode.unlockedBy, boughtNode => {
        const boughtRef = this.linkBuyableNodeToRealNode(boughtNode);
        return boughtRef.root || this.isBought(boughtNode);
      });

      const unableToBuyNode = !this.isCapableOfBuying(claimedNode, player);

      if(missingAllParents || unableToBuyNode) {
        this.refundNode(player, claimedNode);
      } else {
        if(realNode.cost !== this.nodesClaimed[claimedNode]) {
          const refund = realNode.cost - this.nodesClaimed[claimedNode];
          this.traitPoints += refund;
          this.nodesClaimed[claimedNode] = realNode.cost;
          player.sendClientMessage(`Refunded ${refund} TP due to inconsistency with ${claimedNode}.`);
        }
      }

    });
  }

  public syncWithPlayer(player: Player): void {
    this.baseClass = player.baseClass;

    this.validateSelf(player);
  }

  private buyItem(traitNode: any): void {
    this.nodesClaimed[traitNode.name] = traitNode.cost;

    if(traitNode.isParty) {
      this.partyPoints -= traitNode.cost;
      return;
    }

    this.traitPoints -= traitNode.cost;
  }

  private unbuyItem(traitNode: any): void {

    if(traitNode.isParty) {
      this.partyPoints += this.nodesClaimed[traitNode.name];
    } else {
      this.traitPoints += this.nodesClaimed[traitNode.name];
    }

    delete this.nodesClaimed[traitNode.name];
  }

  public refundNode(player: Player, traitName: string, recalculateBuyable = true): void {

    const ref = this.linkBuyableNodeToRealNode(traitName);
    if(!ref) return;

    // is trait
    if(ref.traitName) {
      this.refundTrait(player, ref.name, ref.traitName);

    // is skill
    } else {
      this.refundSkill(player, ref.name);

    }

    this.resetPoints--;
    this.unbuyItem(ref);

    if(recalculateBuyable) {
      this.updateBuyableNodes();
      player.$$room.savePlayer(player);
    }

  }

  private refundTrait(player: Player, traitName: string, realName: string): void {
    const node = this.linkBuyableNodeToRealNode(traitName);

    player.sendClientMessage(`You have refunded the trait "${realName}"!`);
    const boost = node.capstone ? 3 : 1;

    player.decreaseTraitLevel(realName, boost);
  }

  private refundSkill(player: Player, skillName: string): void {
    const node = this.linkBuyableNodeToRealNode(skillName);
    if(!node) return;

    player.sendClientMessage(`You have refunded the skill "${skillName}"!`);
    player.unlearnSpell(skillName);
  }

  public buyNode(player: Player, traitName: string) {

    const ref = this.linkBuyableNodeToRealNode(traitName);
    if(!ref) return;

    // is trait
    if(ref.traitName) {
      this.buyTrait(player, ref.name, ref.traitName);

    // is skill
    } else {
      this.buySkill(player, ref.name);

    }

    this.buyItem(ref);
    this.updateBuyableNodes();
    player.$$room.savePlayer(player);
  }

  private buyTrait(player: Player, traitName: string, realName: string): void {
    const node = this.linkBuyableNodeToRealNode(traitName);

    player.sendClientMessage(`You have expanded your trait "${realName}"!`);
    const boost = node.capstone ? 3 : 1;
    player.increaseTraitLevel(realName, boost);
  }

  private buySkill(player: Player, skillName: string): void {
    player.sendClientMessage(`You have learned the skill "${skillName}"!`);
    player.learnSpell(skillName);
    player.$$room.resetMacros(player);
  }
}
