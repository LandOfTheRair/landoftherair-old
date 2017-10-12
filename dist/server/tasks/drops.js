"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });
const database_1 = require("../database");
const YAML = require("yamljs");
const recurse = require("recursive-readdir");
const path = require("path");
const lodash_1 = require("lodash");
class DropsLoader {
    static loadAllRegions() {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.DB.isReady;
            yield database_1.DB.$regionDrops.remove({}, { multi: true });
            return new Promise(resolve => {
                recurse(`${__dirname}/../data/droptables/regions`).then(files => {
                    const filePromises = files.map(file => {
                        const droptable = YAML.load(file);
                        const fileName = path.basename(file, path.extname(file));
                        console.log(`Inserting Region ${fileName}`);
                        return database_1.DB.$regionDrops.insert({
                            regionName: fileName,
                            drops: droptable
                        });
                    });
                    Promise.all(lodash_1.flatten(filePromises)).then(() => {
                        console.log('Regions - Done');
                        resolve();
                    });
                });
            });
        });
    }
    static loadAllMaps() {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.DB.isReady;
            yield database_1.DB.$mapDrops.remove({}, { multi: true });
            return new Promise(resolve => {
                recurse(`${__dirname}/../data/droptables/maps`).then(files => {
                    const filePromises = files.map(file => {
                        const droptable = YAML.load(file);
                        const fileName = path.basename(file, path.extname(file));
                        console.log(`Inserting Map ${fileName}`);
                        return database_1.DB.$mapDrops.insert({
                            mapName: fileName,
                            drops: droptable
                        });
                    });
                    Promise.all(lodash_1.flatten(filePromises)).then(() => {
                        console.log('Maps - Done');
                        resolve();
                    });
                });
            });
        });
    }
}
Promise.all([DropsLoader.loadAllRegions(), DropsLoader.loadAllMaps()])
    .then(() => {
    process.exit(0);
});
//# sourceMappingURL=drops.js.map