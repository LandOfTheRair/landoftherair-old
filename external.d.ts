
declare module 'mingy' {
  export class Parser {
    setEnv(str: string, obj: any): void;
    parse(str: string): string;
  }
}

declare module 'luxon' {
  export class DateTime {
    static local(): number;
    static fromObject(obj: any): DateTime;
    minus(obj: any): DateTime;
  }
}

declare module 'lootastic' {
  export class LootTable {
    constructor(choices: any[], bonus?: number);

    chooseWithReplacement(num: number): any;
    chooseWithoutReplacement(num: number): any;
    tryToDropEachItem(num: number): any;
  }

  export class LootRoller {
    static rollTables(tables: LootTable[]): any[];
  }

  export enum LootFunctions {
    WithReplacement = 'chooseWithReplacement',
    WithoutReplacement = 'chooseWithoutReplacement',
    EachItem = 'tryToDropEachItem'
  }
}

declare module 'dice.js' {
  export function roll(str: string, scope?: any): any;
}

declare module 'yamljs' {
  export function load(str: string): any;
}

declare module 'mongodb' {
  export class MongoClient {
    static connect(opts: any): any;

    collection(str: string): any;
  }
}

declare module 'roman-numerals' {
  export function toRoman(num: number): string;
}
