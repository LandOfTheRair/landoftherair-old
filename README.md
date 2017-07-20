# Land of the Rair [![Build Status](https://travis-ci.org/LandOfTheRair/landoftherair.svg?branch=master)](https://travis-ci.org/LandOfTheRair/landoftherair)

A prototype MORPG inspired by MUDs of olde.

## Contributor Disclaimer
While I appreciate contributions, consider that all contributions, significant or otherwise, cannot be compensated for at this time. 

## Requirements

* Node.js (recommended: 8.0.0+)
* MongoDB (recommended: 3.4.4+)

## Install

* `npm install`
* `npm run setup`
* `npm start`

## Environment Variables

First, create a [`.env`](https://www.npmjs.com/package/dotenv) file in the root. Then, populate it with these values:

* `MONGODB_URI` - the URI that leads to a mongodb instance
* `AUTH0_SECRET` - Auth0 server secret

## Setup

For initial setup, run this:

* `npm run setup`

For subsequent updates and specific changes, you can run these instead:

* `npm run task:items` - this will populate the database with items
* `npm run task:npcs`  - this will populate the database with npc data
* `npm run task:drops` - this will populate the database with drop table data
* `npm run task:macros`- this will generate the macro icon metadata. If you add new icons, please only take from [my repository](http://seiyria.com/gameicons-font/).

## Making Yourself a GM

If you want to do any debugging, you'll need to make yourself a GM. To do that, you'll want to set your account to be a GM. Open up a mongo shell or run this query through an external tool:

```
db.accounts.update({ username: 'YOUR_ACCOUNT_NAME' }, { $set: { isGM: true } });
db.players.update({ username: 'YOUR_ACCOUNT_NAME' }, { $set: { isGM: true } });
```

You only need to do this once; any time you create a character after being set as a GM, that character will also be flagged.

### Commands

Some commands are hidden and don't really need to be used by players, but should be used when testing out moderation features. Commands have varying prefixes, such as:

* `~` - an internal command used by the UI
* `~~` - a debugging command for players
* `@` - a command for GMs.

#### Internal Commands

* `~look` - look at the ground (only used by `~search`)
* `~use` - use an item
* `~search` - search corpses on the ground, then look.
* `~interact` - called when clicking on something interactable
* `~move` - called when clicking on the map to move
* `~talk` - called automatically when doing `xxx, message` - will trigger appropriate dialog for an npc if it has any

#### Debugging Commands

* `~~pos` - get your current x, y, and map.

#### GM Commands

* `@gold <num>` - create <num> gold on your tile
* `@item <item name>` - create a particular item on your tile
* `@itemdupe` - copy your right hand to your left hand
* `@examine <nothing|npcish>` - if `npcish` is specified, will examine an npc. Otherwise, it'll examine your right hand item
* `@itemforge propsish` - create an item using props syntax, for example: `sprite=1 type=Hammer stats.str=1`
* `@skill <skillname> <xpgain>` - gain `xpgain` skill for `skillname`
* `@xp <xp>` - gain <xp> XP
* `@kill <target>` - will instantly kill `target`
* `@itemmod propsish` - modify your rightHand item based on props specified, for example: `ounces=10`
* `@respawn lairname` - respawn `lairname` on the current map
* `@teleport <x> <y> [map]` - teleport to X,Y, and if map is specified, you'll also change maps
