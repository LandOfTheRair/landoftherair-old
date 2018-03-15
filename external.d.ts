
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

declare module 'pathfinding' {
  export class Grid {
    constructor(width: number, height: number);
    setWalkableAt(x: number, y: number, canWalk: boolean);
  }

  export class AStarFinder {
    constructor(opts: any);
    findPath(x: number, y: number, destX: number, destY: number, grid: Grid): any[];
  }
}

declare module 'fantastical' {
  export const species: { [key: string]: Function };
}

/*
declare module 'node-redis-pubsub' {
  class NRP {
    constructor(opts: any);
    on(event: string, func: Function);
    emit(event: string, opts: any);
    quit();
  }

  export = NRP;
}
*/
