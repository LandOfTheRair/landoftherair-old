
import * as Quests from '../../quests';

export class QuestHelper {

  getQuestByName(name: string, throwErrorIfNotExist = true) {
    if(!Quests[name] && throwErrorIfNotExist) throw new Error(`Quest "${name}" does not exist.`);
    return Quests[name];
  }

}
