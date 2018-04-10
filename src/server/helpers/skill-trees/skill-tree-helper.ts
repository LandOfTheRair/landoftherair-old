
import { DB } from '../../database';
import { Player } from '../../../shared/models/player';
import { SkillTree } from '../../../shared/models/skill-tree';

export class SkillTreeHelper {

  async saveSkillTree(player: Player): Promise<any> {

    if(!player.skillTree) return false;

    return DB.$characterSkillTrees.update(
      { username: player.username, charSlot: player.charSlot },
      { $set: { skillTree: player.skillTree} },
      { upsert: true }
    );
  }

  async loadSkillTree(player: Player): Promise<SkillTree> {
    const treeData = await DB.$characterSkillTrees.findOne({
      username: player.username,
      charSlot: player.charSlot
    });

    const treeRef = new SkillTree(treeData ? treeData.skillTree : { baseClass: player.baseClass });

    treeRef.syncWithPlayer(player);

    return treeRef;
  }

}
