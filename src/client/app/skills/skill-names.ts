
const Thievery = [
  'Unpracticed',
  'Clumsy',
  'Dextrous',
  'Swift',
  'Agile',
  'Pickpocket',           // 5
  'Observer of Shadows',
  'Finder of Shadows',
  'Seeker of Shadows',
  'Initiate of Shadows',
  'Creator of Shadows', // 10
  'Student of Shadows',
  'Adept of Shadows',
  'Master of Shadows',
  'Lord of Shadows',
  'Observer of Thievery', // 15
  'Seeker of Thievery',
  'Initiate of Thievery',
  'Thief',
  'Student of Thievery',
  'Adept of Thievery',  // 20
  'Master of Thievery',
  'Lord of Thievery',
  'Master Thief',
  'Observer of Darkness',
  'Finder of Darkness', // 25
  'Seeker of Darkness',
  'Initiate of Darkness',
  'Student of Darkness',
  'Adept of Darkness',
  'Master of Darkness', // 30
  'Lord of Darkness',
  'Grand Master Thief',
  'Observer of Deception',
  'Seeker of Deception',  // 30
  'Initiate of Deception',
  'Student of Deception',
  'Creator of Deception',
  'Adept of Deception',
  'Master of Deception',
  'Lord of Deception' // 40
];

const HealingMagic = [
  'Unpracticed'
];

const ElementalMagic = [
  'Unpracticed'
];

const Martial = [
  'Unpracticed',
  'Seeker of the Blue',
  '1st Blue Belt',
  '2nd Blue Belt',
  '3rd Blue Belt',
  'Aqua Sash',        // 5
  'Seeker of the White',
  '1st White Belt',
  '2nd White Belt',
  '3rd White Belt',
  'Snow Sash',        // 10
  'Seeker of the Brown',
  '1st Brown Belt',
  '2nd Brown Belt',
  '3rd Brown Belt',
  'Earthen Sash',     // 15
  'Seeker of the Black',
  '1st Black Belt',
  '2nd Black Belt',
  '3rd Black Belt',
  '4th Black Belt',   // 20
  '5th Black Belt',
  '6th Black Belt',
  '7th Black Belt',
  '8th Black Belt',
  'Shadow Sash',      // 25
  'Seeker of the Red',
  '1st Red Belt',
  '2nd Red Belt',
  '3rd Red Belt',
  'Crimson Sash',     // 30
  'Seeker of the Silver',
  '1st Silver Sash',
  '2nd Silver Sash',
  '3rd Silver Sash',
  'Silver Soul',      // 35
  'Seeker of the Gold',
  '1st Gold Sash',
  '2nd Gold Sash',
  '3rd Gold Sash',
  'Gold Heart'        // 40
];

const Weapon = [
  'Unpracticed',
  'Clumsy',
  'Rookie',
  'Novice',
  'Beginner',
  'Practiced',        // 5
  'Dedicated',
  'Student',
  'Skilled',
  'Proficient',
  'Astute',           // 10
  'Adept',
  'Prodigious',
  'Incredible',
  'Seasoned',
  'Experienced',      // 15
  'Initiate of Stance',
  'Student of Stance',
  'Adept of Stance',
  'Master of Stance',
  'Expert',           // 20
  'Initiate of Form',
  'Student of Form',
  'Adept of Form',
  'Master of Form',
  'Master',           // 25
  'Initiate of Style',
  'Student of Style',
  'Adept of Style',
  'Master of Style',
  'Grand Master',     // 30
  'Initiate of Finesse',
  'Student of Finesse',
  'Adept of Finesse',
  'Master of Finesse',
  'Lord',             // 35
  'Initiate of Combat',
  'Student of Combat',
  'Adept of Combat',
  'Master of Combat',
  'Lord of Combat'    // 40
];

export class SkillNames {
  static determineArray(skill) {
    switch(skill) {
      case 'thievery': return Thievery;
      case 'restoration': return HealingMagic;
      case 'conjuration': return ElementalMagic;
      case 'martial': return Martial;
      default: return Weapon;
    }
  }

  static getName(level, skill) {
    const arr = this.determineArray(skill);
    if(level < 0) level = 0;
    if(level > arr.length) return arr[arr.length - 1];
    return arr[level];
  }
}
