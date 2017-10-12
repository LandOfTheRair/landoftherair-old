"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class MacroNameGetter {
    static getNames() {
        const files = fs.readdirSync(`${__dirname}/../../client/assets/icons`);
        const realNames = files.map(x => x.split('.')[0]);
        fs.writeFileSync(`${__dirname}/../../client/macicons/macicons.json`, JSON.stringify({ macroNames: realNames }));
    }
}
MacroNameGetter.getNames();
//# sourceMappingURL=macroiconnames.js.map