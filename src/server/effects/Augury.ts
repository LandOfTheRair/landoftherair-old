
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { Player } from '../../shared/models/player';

export class Augury extends SpellEffect {

  maxSkillForSkillGain = 15;
  skillFlag = (caster) => SkillClassNames.Restoration;

  private distanceToMeasurement(dist: number): string {
    if(dist <= 0) return 'on top of you';
    if(dist <  5) return 'very close to you';
    if(dist < 10) return 'nearby';
    if(dist < 50) return 'a fair distance away from you';
    return 'very far away from you';
  }

  private healthToMeasurement(target): string {
    if(target.isDead())           return 'has passed from this world';
    if(target.hp.atMaximum())     return 'is unscathed';
    if(target.hp.ltePercent(5))   return 'is in critical condition';
    if(target.hp.ltePercent(25))  return 'is nearing death';
    if(target.hp.ltePercent(50))  return 'has taken some damage';
    if(target.hp.ltePercent(75))  return 'is in pain';
    return 'looks a bit ruffled up'
  }

  async cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const distFrom = target.distFrom(caster);

    let baseString = `The birds have found a creature called ${target.name}.`;
    baseString = `${baseString} ${target.name} is ${this.distanceToMeasurement(distFrom)}.`;
    baseString = `${baseString} ${target.name} ${this.healthToMeasurement(target)}.`;

    caster.sendClientMessage(baseString);
  }
}
