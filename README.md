# Land of the Rair

A prototype MORPG.

## Requirements

* Node.js (recommended: 8.0.0+)
* MongoDB (recommended: 3.4.4+)

## Install

* `npm install`
* [run setup tasks]
* `npm start`

## Environment Variables

First, create a `[.env](https://www.npmjs.com/package/dotenv)` file in the root. Then, populate it with these values:

* `MONGODB_URI` - the URI that leads to a mongodb instance
* `AUTH0_SECRET` - Auth0 server secret

## Setup

* `npm run task:items` - this will populate the database with items
* `npm run task:npcs`  - this will populate the database with npc data

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

* `~look` - look at the ground (currently this has to be done manually, since there is no macro support)
* `~interact` - called when clicking on something interactable
* `~move` - called when clicking on the map to move

#### Debugging Commands

* `~~pos` - get your current x, y, and map.

#### GM Commands

* `@gold <num>` - create <num> gold on your tile
* `@item <item name>` - create a particular item on your tile
* `@teleport <x> <y> [map]` - teleport to X,Y, and if map is specified, you'll also change maps.
