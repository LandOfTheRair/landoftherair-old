
declare module 'mingy' {
  export interface Parser {
    setEnv(str: string, obj: any): void;
    parse(str: string): string;
  }
}

declare module 'luxon' {
  export interface DateTime {
    local(): number;
  }
}

declare module 'lootastic' {
  export interface LootTable {
    chooseWithReplacement(num: number): any;
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
