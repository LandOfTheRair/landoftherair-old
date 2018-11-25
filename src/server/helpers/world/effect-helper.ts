
import * as Effects from '../../effects';
import { IEffect } from '../../../shared/interfaces/effect';

export class EffectHelper {

  getEffectByName(name: string, throwErrorIfNotExist = true): IEffect {
    if(!Effects[name] && throwErrorIfNotExist) throw new Error(`No effect "${name}" exists.`);
    return Effects[name];
  }

}
