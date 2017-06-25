
import { Player } from '../../models/player';
import { set, startsWith } from 'lodash';

export abstract class Command {

  abstract name: string|string[];
  format: string = '';
  static macroMetadata: any = {};

  abstract execute(player: Player, args);

  getMergeObjectFromArgs(args) {
    const matches = args.match(/(?:[^\s"']+|['"][^'"]*["'])+/g);

    const mergeObj = matches.reduce((obj, prop) => {
      let [key, val] = prop.split('=');
      val = val.trim();

      if(!isNaN(+val)) {
        val = +val;
      } else if(startsWith(val, '"')) {
        val = val.substring(1, val.length - 1);
      }

      set(obj, key.trim(), val);
      return obj;
    }, {});

    return mergeObj;
  }
}
