"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ silent: true });
const lodash_1 = require("lodash");
const fs = require("fs");
const recurse = require("recursive-readdir");
class MacroMetadataOrganizer {
    static organize() {
        recurse(`${__dirname}/../scripts/commands`).then(commands => {
            const allMeta = [];
            commands.forEach(command => {
                if (lodash_1.includes(command, 'index'))
                    return;
                const cmd = require(command);
                const meta = cmd[Object.keys(cmd)[0]].macroMetadata;
                if (!meta.name)
                    return;
                meta.isSystem = true;
                meta.requiresLearn = lodash_1.includes(command, 'spell');
                allMeta.push(meta);
            });
            fs.writeFileSync(`${__dirname}/../../client/app/macro-bars/macros.json`, JSON.stringify({ allMeta }, null, 4));
            process.exit(0);
        });
    }
}
MacroMetadataOrganizer.organize();
//# sourceMappingURL=macrometadata.js.map