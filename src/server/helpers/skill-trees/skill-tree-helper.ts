
import { DB } from '../../database';
import { Player } from '../../../shared/models/player';
import { SkillTree } from '../../../shared/models/skill-tree';

export class SkillTreeHelper {

  async saveSkillTree(player: Player): Promise<any> {

    return DB.$characterSkillTrees.update(
      { username: player.username, charSlot: player.charSlot },
      { $set: { skillTree: player.skillTree} },
      { upsert: true }
    );
  }

  async loadSkillTree(player: Player): Promise<SkillTree> {
    const tree = await DB.$characterSkillTrees.findOne({
      username: player.username,
      charSlot: player.charSlot
    });

    return new SkillTree(tree);
  }

}
