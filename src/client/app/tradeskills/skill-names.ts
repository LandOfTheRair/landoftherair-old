
const skills = {
  alchemy: [
    'Unpracticed',
    'Dropper of Flasks',
    'Novice of Alchemy',
    'Practicer of Alchemy',
    'Student of Alchemy',
    'Skilled Alchemist',
    'Proficient Alchemist',
    'Astute Alchemist',
    'Adept Alchemist',
    'Prodigious Alchemist'
  ]
};

export class SkillNames {
  static determineArray(skill) {
    return skills[skill];
  }

  static getName(level, skill) {
    const arr = this.determineArray(skill);
    if(level < 0) level = 0;
    if(level >= arr.length) return arr[arr.length - 1];
    return arr[level];
  }
}
