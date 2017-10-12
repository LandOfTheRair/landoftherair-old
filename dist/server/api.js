"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus = require("colyseus");
const http = require("http");
const express = require("express");
const cors = require("cors");
const staticFile = require("connect-static-file");
const Rooms = require("./rooms");
const recurse = require("recursive-readdir");
const path = require("path");
const logger_1 = require("./logger");
class GameAPI {
    constructor() {
        this.isReady = new Promise(resolve => {
            const app = express();
            app.use(cors());
            app.use('/silent-dev', staticFile(`${__dirname}/silent-dev.html`));
            app.use('/silent-production', staticFile(`${__dirname}/silent-production.html`));
            app.use('/maps', express.static(require('path').join(__dirname, 'maps')));
            const port = process.env.PORT || 3303;
            const server = http.createServer(app);
            const gameServer = new colyseus.Server({ server });
            gameServer.register('Lobby', Rooms.Lobby);
            const allMapNames = {};
            recurse(`${__dirname}/maps`).then(files => {
                files.forEach(file => {
                    const mapName = path.basename(file, path.extname(file));
                    allMapNames[mapName] = true;
                    gameServer.register(mapName, Rooms.GameWorld, { mapName, mapPath: file, allMapNames });
                });
            });
            server.listen(port);
            logger_1.Logger.log(`Started server on port ${port}`);
            resolve();
        });
    }
}
exports.API = new GameAPI();
//# sourceMappingURL=api.js.map