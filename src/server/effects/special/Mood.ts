
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

enum MoodStatus {
  CALM = 0,
  AGITATED = 1,
  NORMAL = 2,
  ANGERED = 3,
  DESPERATE = 4,
  ENRAGED = 5
}

const moods = [
  { color: '#008080', text: 'This creature is calm. -25% Damage',         damageFactor: -0.25 },
  { color: '#5f5f00', text: 'This creature is agitated. -10% Damage',     damageFactor: -0.1 },
  { color: '#004000', text: 'This creature is acting normally.',          damageFactor: 0 },
  { color: '#664200', text: 'This creature is angered. +10% Damage',      damageFactor: 0.1 },
  { color: '#ff0000', text: 'This creature is desperate. +25% Damage',    damageFactor: 0.25 },
  { color: '#330000', text: 'This creature is enraged! +50% Damage',      damageFactor: 0.5 }
];

export class Mood extends Effect {

  iconData = {
    name: 'bully-minion',
    color: '#fff',
    tooltipDesc: 'This creature is calm.'
  };

  private startTime: number;
  private mood: MoodStatus;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(target.uuid);
    this.setMood(caster, MoodStatus.CALM);
    caster.applyEffect(this);
  }

  effectTick(char: Character) {

    // reset mood/hp when no combat ticks
    if(char.combatTicks <= 0) {
      char.hp.toMaximum();
      this.setMood(char, MoodStatus.CALM);
      this.startTime = 0;
      return;
    }

    if(!this.startTime) this.startTime = Date.now();

    if(this.effectInfo.enrageTimer && this.startTime && this.startTime + this.effectInfo.enrageTimer < Date.now()) {
      this.setMood(char, MoodStatus.ENRAGED);
      return;
    }

    // > 90% HP = Calm
    if(char.hp.gtePercent(90)) {
      this.setMood(char, MoodStatus.CALM);
      return;
    }

    if(char.hp.gtePercent(75)) {
      this.setMood(char, MoodStatus.AGITATED);
      return;
    }

    if(char.hp.gtePercent(50)) {
      this.setMood(char, MoodStatus.NORMAL);
      return;
    }

    if(char.hp.gtePercent(25)) {
      this.setMood(char, MoodStatus.ANGERED);
      return;
    }

    this.setMood(char, MoodStatus.DESPERATE);
  }

  private setMood(char: Character, mood: MoodStatus) {
    if(this.mood === mood) return;

    this.mood = mood;
    const { color, text, damageFactor } = moods[mood];
    this.iconData.color = color;
    this.iconData.tooltipDesc = text;

    this.resetStats(char);
    this.gainStat(char, 'damageFactor', damageFactor);
  }

}
