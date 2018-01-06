
import { Character } from '../../shared/models/character';

export class GenderHelper {
  static hisher(char: Character): string {
    return char.sex === 'Male' ? 'his' : 'her';
  }
}
