# Changelog

## v0.1.5 (08/03/2018)

#### Bug Fixes

- [#585](https://github.com/LandOfTheRair/landoftherair/issues/585) Character creation does not work when there is no pouch for the account

---

## v0.1.4 (08/03/2018)

#### Enhancements

- [#569](https://github.com/LandOfTheRair/landoftherair/issues/569) Dangerous Debuff for lairs
- [#560](https://github.com/LandOfTheRair/landoftherair/issues/560) Run offensive checking on character names when they're created

#### Balance Adjustments

- [#583](https://github.com/LandOfTheRair/landoftherair/issues/583) weredeer (and all lairs) need more perception
- [#578](https://github.com/LandOfTheRair/landoftherair/issues/578) Prisoners should not see skill 0 thief 
- [#577](https://github.com/LandOfTheRair/landoftherair/issues/577) Truesight may not be using potency correctly

#### New Content

- [#559](https://github.com/LandOfTheRair/landoftherair/issues/559) Powerword spells (healer skill 16, 17)

#### Bug Fixes

- [#582](https://github.com/LandOfTheRair/landoftherair/issues/582) throw/attack/backstab does not cause gain skill to proc 
- [#581](https://github.com/LandOfTheRair/landoftherair/issues/581) shadow swap should not trigger when you're already hidden (or have Revealed)
- [#580](https://github.com/LandOfTheRair/landoftherair/issues/580) @examine checks for visible targets but should not
- [#579](https://github.com/LandOfTheRair/landoftherair/issues/579) Armor should not exhaust thief when hiding and casting
- [#576](https://github.com/LandOfTheRair/landoftherair/issues/576) succor does not use potency correctly

---

## v0.1.3 (07/03/2018)

#### Enhancements

- [#554](https://github.com/LandOfTheRair/landoftherair/issues/554) Clean up range() and skillFlag() functions to not be = function

#### Balance Adjustments

- [#558](https://github.com/LandOfTheRair/landoftherair/issues/558) Nerf energy blast
- [#557](https://github.com/LandOfTheRair/landoftherair/issues/557) Add trait scroll for ShadowRanger
- [#556](https://github.com/LandOfTheRair/landoftherair/issues/556) Proportionalize elemental buildup with damage % blocked
- [#555](https://github.com/LandOfTheRair/landoftherair/issues/555) Improve barfire/barice for mages
- [#552](https://github.com/LandOfTheRair/landoftherair/issues/552) Tighten up range for Greatsword type (and other 2h) slightly
- [#551](https://github.com/LandOfTheRair/landoftherair/issues/551) Lower dex of goblins so they shoot for less damage
- [#550](https://github.com/LandOfTheRair/landoftherair/issues/550) Give ranata another healing skill
- [#549](https://github.com/LandOfTheRair/landoftherair/issues/549) Adjust npc casting to check multiple times (5) before declaring a target is not hittable with a spell
- [#547](https://github.com/LandOfTheRair/landoftherair/issues/547) Push should not be a choice for casting if it cannot work (check int/wis/will scores to precalculate this)
- [#546](https://github.com/LandOfTheRair/landoftherair/issues/546) Nerf int of orc casters so they don't push as often 

#### New Content

- [#544](https://github.com/LandOfTheRair/landoftherair/issues/544) Thief ability: Assassinate (skill 13)
- [#543](https://github.com/LandOfTheRair/landoftherair/issues/543) Thief ability: sneak attack (when hidden, plain attacks should fill up sneak attack gauge)

#### Bug Fixes

- [#545](https://github.com/LandOfTheRair/landoftherair/issues/545) RRing any character slot wipes the pouch

---

## v0.1.2 (06/03/2018)

#### Enhancements

- [#540](https://github.com/LandOfTheRair/landoftherair/issues/540) add source text name to all DoTs and buffs (at the bottom of the tooltip)

---

## v0.1.1 (06/03/2018)

#### Enhancements

- [#538](https://github.com/LandOfTheRair/landoftherair/issues/538) Add a full tier of ether weapons

---

## 0.1.0 (06/03/2018)

#### Enhancements

- [#536](https://github.com/LandOfTheRair/landoftherair/issues/536) combat log as csv
- [#533](https://github.com/LandOfTheRair/landoftherair/issues/533) right click from ground -> sack
- [#532](https://github.com/LandOfTheRair/landoftherair/issues/532) make ranged attacks (bow, throwing) do damage based off of dex instead of str
- [#531](https://github.com/LandOfTheRair/landoftherair/issues/531) Remember stage 1 craft when doing stage 2 for metalworking (also, transfer owner so you can't untie gear)
- [#530](https://github.com/LandOfTheRair/landoftherair/issues/530) T2 metal work recipes should be higher level requirements 
- [#526](https://github.com/LandOfTheRair/landoftherair/issues/526) Click off buffs
- [#519](https://github.com/LandOfTheRair/landoftherair/issues/519) "connecting to server" message should spin while loading instead of saying connection failed
- [#518](https://github.com/LandOfTheRair/landoftherair/issues/518) formalized roadmap
- [#516](https://github.com/LandOfTheRair/landoftherair/issues/516) fix up spacing between lines in char create; add note that name is "first name only, no spaces"
- [#514](https://github.com/LandOfTheRair/landoftherair/issues/514) Look for a tour module for first time char creation 
- [#512](https://github.com/LandOfTheRair/landoftherair/issues/512) Make Ctrl click select multiple items in containers 
- [#511](https://github.com/LandOfTheRair/landoftherair/issues/511) Add tooltip to daily reset timer
- [#509](https://github.com/LandOfTheRair/landoftherair/issues/509) auto unstuck
- [#508](https://github.com/LandOfTheRair/landoftherair/issues/508) alias n to north, s to south, etc
- [#507](https://github.com/LandOfTheRair/landoftherair/issues/507) add ability to do ne, nw, sw, se
- [#506](https://github.com/LandOfTheRair/landoftherair/issues/506) add brown wall cave door and secret wall
- [#502](https://github.com/LandOfTheRair/landoftherair/issues/502) Tester set stats
- [#501](https://github.com/LandOfTheRair/landoftherair/issues/501) Tester set hp
- [#500](https://github.com/LandOfTheRair/landoftherair/issues/500) Add 5 mitigation to Shields and fix fur not getting mitigation
- [#498](https://github.com/LandOfTheRair/landoftherair/issues/498) map boss timers are not saved by party
- [#496](https://github.com/LandOfTheRair/landoftherair/issues/496) mute, game mute, auto mute
- [#495](https://github.com/LandOfTheRair/landoftherair/issues/495) Change tier 2 ether gear to use a 5x ether scale created with alchemy.
- [#494](https://github.com/LandOfTheRair/landoftherair/issues/494) GM align should always always always be grey tag
- [#493](https://github.com/LandOfTheRair/landoftherair/issues/493) remove ability to buff enemies
- [#489](https://github.com/LandOfTheRair/landoftherair/issues/489) good and evil should see each other as red
- [#488](https://github.com/LandOfTheRair/landoftherair/issues/488) make trait, stat, skill, trade skill window minimizable
- [#487](https://github.com/LandOfTheRair/landoftherair/issues/487) add quick open buttons on tagline window for belt, sack, pouch, equipment
- [#486](https://github.com/LandOfTheRair/landoftherair/issues/486) add resiable lobby sizes, mirroring others
- [#483](https://github.com/LandOfTheRair/landoftherair/issues/483) accounts designated as testers
- [#482](https://github.com/LandOfTheRair/landoftherair/issues/482) add an option for "show friendly creatures first"
- [#479](https://github.com/LandOfTheRair/landoftherair/issues/479) gm party join command
- [#477](https://github.com/LandOfTheRair/landoftherair/issues/477) align = gm
- [#476](https://github.com/LandOfTheRair/landoftherair/issues/476) lairs need super wil to resist stun
- [#474](https://github.com/LandOfTheRair/landoftherair/issues/474) buff acolyte hp, give them magicbolt, 5x saraxa hp
- [#473](https://github.com/LandOfTheRair/landoftherair/issues/473) intercept command
- [#472](https://github.com/LandOfTheRair/landoftherair/issues/472) make ranata drop a totem
- [#471](https://github.com/LandOfTheRair/landoftherair/issues/471) craft npcs should offer right click to send an alt keyword
- [#470](https://github.com/LandOfTheRair/landoftherair/issues/470) add more info to DoTs
- [#469](https://github.com/LandOfTheRair/landoftherair/issues/469) consistentize the trait popups
- [#466](https://github.com/LandOfTheRair/landoftherair/issues/466) move asset spritesheets over to a new repo
- [#462](https://github.com/LandOfTheRair/landoftherair/issues/462) Newbie guides for each class
- [#459](https://github.com/LandOfTheRair/landoftherair/issues/459) cache bust assets
- [#458](https://github.com/LandOfTheRair/landoftherair/issues/458) Metalworking
- [#457](https://github.com/LandOfTheRair/landoftherair/issues/457) update #lobby with the number of people online in the title
- [#456](https://github.com/LandOfTheRair/landoftherair/issues/456) Account Settings
- [#455](https://github.com/LandOfTheRair/landoftherair/issues/455) trait scroll rng box
- [#454](https://github.com/LandOfTheRair/landoftherair/issues/454) keys that tie
- [#453](https://github.com/LandOfTheRair/landoftherair/issues/453) Ensure all tower gear uses red sprites
- [#450](https://github.com/LandOfTheRair/landoftherair/issues/450) more decor descriptions
- [#449](https://github.com/LandOfTheRair/landoftherair/issues/449) make wands/totems cut spell casting cost
- [#448](https://github.com/LandOfTheRair/landoftherair/issues/448) make xp bar sub lower bound so it doesnt start at half
- [#446](https://github.com/LandOfTheRair/landoftherair/issues/446) View other player gear
- [#443](https://github.com/LandOfTheRair/landoftherair/issues/443) Make main hand wands boost damage rolls for mage spells by their damage roll boost.
- [#440](https://github.com/LandOfTheRair/landoftherair/issues/440) test to ensure no commands conflict
- [#437](https://github.com/LandOfTheRair/landoftherair/issues/437) Adjust algorithm for item garbage collector
- [#434](https://github.com/LandOfTheRair/landoftherair/issues/434) training dummy
- [#431](https://github.com/LandOfTheRair/landoftherair/issues/431) alchemist should tie bottles
- [#429](https://github.com/LandOfTheRair/landoftherair/issues/429) pet level should match player level
- [#428](https://github.com/LandOfTheRair/landoftherair/issues/428) clean up unused imports
- [#424](https://github.com/LandOfTheRair/landoftherair/issues/424) global player viewer
- [#423](https://github.com/LandOfTheRair/landoftherair/issues/423) discord chat linked to lobby
- [#413](https://github.com/LandOfTheRair/landoftherair/issues/413) make teleports check for item in either hand
- [#411](https://github.com/LandOfTheRair/landoftherair/issues/411) increase number of creatures in rylt
- [#410](https://github.com/LandOfTheRair/landoftherair/issues/410) Add level requirements for gems
- [#409](https://github.com/LandOfTheRair/landoftherair/issues/409) Rebalance gems
- [#408](https://github.com/LandOfTheRair/landoftherair/issues/408) cut magic skill gain in half
- [#406](https://github.com/LandOfTheRair/landoftherair/issues/406) change magic boost to mana boost and also validate if it gives mp
- [#404](https://github.com/LandOfTheRair/landoftherair/issues/404) Add upgraded versions of mm (energybolt)
- [#402](https://github.com/LandOfTheRair/landoftherair/issues/402) change levelup flow
- [#398](https://github.com/LandOfTheRair/landoftherair/issues/398) Update charge tooltip
- [#391](https://github.com/LandOfTheRair/landoftherair/issues/391) lower tower respawn by 100% and melee skills by 1
- [#388](https://github.com/LandOfTheRair/landoftherair/issues/388) if there is a cardinal direction push can go, it should do that first
- [#387](https://github.com/LandOfTheRair/landoftherair/issues/387) assess trade skills at utilizers
- [#384](https://github.com/LandOfTheRair/landoftherair/issues/384) armor that cuts outgoing magic damage
- [#381](https://github.com/LandOfTheRair/landoftherair/issues/381) Scale stat specified in recipe for increasing duration of potions
- [#379](https://github.com/LandOfTheRair/landoftherair/issues/379) Nerf insane caster skill again
- [#378](https://github.com/LandOfTheRair/landoftherair/issues/378) scale chance of resisting push
- [#374](https://github.com/LandOfTheRair/landoftherair/issues/374) Don't spawn creatures in instances dungeon where there is no party
- [#373](https://github.com/LandOfTheRair/landoftherair/issues/373) make banks account wide
- [#372](https://github.com/LandOfTheRair/landoftherair/issues/372) Make daily timer match up with reset timer
- [#370](https://github.com/LandOfTheRair/landoftherair/issues/370) give crazed/insane darkvision helms
- [#369](https://github.com/LandOfTheRair/landoftherair/issues/369) maces/flails need to be toned down
- [#366](https://github.com/LandOfTheRair/landoftherair/issues/366) add delay to sedgwicks explosion
- [#362](https://github.com/LandOfTheRair/landoftherair/issues/362) Party points in a party of 2
- [#360](https://github.com/LandOfTheRair/landoftherair/issues/360) hp seller Aychpos
- [#357](https://github.com/LandOfTheRair/landoftherair/issues/357) disenchant should require item bound to the user
- [#350](https://github.com/LandOfTheRair/landoftherair/issues/350) Nightly reset 
- [#349](https://github.com/LandOfTheRair/landoftherair/issues/349) Make spawner actions more intelligent
- [#337](https://github.com/LandOfTheRair/landoftherair/issues/337) macro substitutions
- [#335](https://github.com/LandOfTheRair/landoftherair/issues/335) recipes that require certain alchemy level
- [#334](https://github.com/LandOfTheRair/landoftherair/issues/334) add floors to rylt prison
- [#333](https://github.com/LandOfTheRair/landoftherair/issues/333) evaluate which commands require hands
- [#332](https://github.com/LandOfTheRair/landoftherair/issues/332) improve trainer window
- [#330](https://github.com/LandOfTheRair/landoftherair/issues/330) Tone down the average wildlife
- [#329](https://github.com/LandOfTheRair/landoftherair/issues/329) Rearrange rylt to make prison easier to find
- [#328](https://github.com/LandOfTheRair/landoftherair/issues/328) Allow editing the default macro group 
- [#326](https://github.com/LandOfTheRair/landoftherair/issues/326) add a diplomat npc to check faction values
- [#325](https://github.com/LandOfTheRair/landoftherair/issues/325) change ivel quest to be just a deer
- [#324](https://github.com/LandOfTheRair/landoftherair/issues/324) refactor getTraitLevel + modifiers
- [#321](https://github.com/LandOfTheRair/landoftherair/issues/321) Periodically save ground (every few minutes)
- [#318](https://github.com/LandOfTheRair/landoftherair/issues/318) Add quest that teaches alchemy
- [#313](https://github.com/LandOfTheRair/landoftherair/issues/313) disable buttons when joining game
- [#312](https://github.com/LandOfTheRair/landoftherair/issues/312) right click to use, add use, consume, eat, drink (aliases)
- [#310](https://github.com/LandOfTheRair/landoftherair/issues/310) Spell changes
- [#309](https://github.com/LandOfTheRair/landoftherair/issues/309) Alchemy
- [#308](https://github.com/LandOfTheRair/landoftherair/issues/308) Spellforging
- [#307](https://github.com/LandOfTheRair/landoftherair/issues/307) create a web-based tool to generate items at a certain tier level
- [#289](https://github.com/LandOfTheRair/landoftherair/issues/289) instanced dungeons
- [#282](https://github.com/LandOfTheRair/landoftherair/issues/282) allow option for npc conversations to be in a popup
- [#260](https://github.com/LandOfTheRair/landoftherair/issues/260) improve FoV
- [#255](https://github.com/LandOfTheRair/landoftherair/issues/255) add some tests
- [#232](https://github.com/LandOfTheRair/landoftherair/issues/232) ai improvements for casters
- [#120](https://github.com/LandOfTheRair/landoftherair/issues/120) kick already-logged-in accounts out
- [#65](https://github.com/LandOfTheRair/landoftherair/issues/65) Combat effects on npc boxes

#### Balance Adjustments

- [#524](https://github.com/LandOfTheRair/landoftherair/issues/524) Increase Rocky's damage output a little bit.
- [#523](https://github.com/LandOfTheRair/landoftherair/issues/523) Make saraxa have a higher int and fire and skill
- [#522](https://github.com/LandOfTheRair/landoftherair/issues/522) Give bows to saraxa acolytes
- [#515](https://github.com/LandOfTheRair/landoftherair/issues/515) Adjust crazy saraxa encounter
- [#513](https://github.com/LandOfTheRair/landoftherair/issues/513) Bump up ranata healer skill
- [#467](https://github.com/LandOfTheRair/landoftherair/issues/467) damage resist rating for armor
- [#465](https://github.com/LandOfTheRair/landoftherair/issues/465) Lower focus dps boost to 4%
- [#463](https://github.com/LandOfTheRair/landoftherair/issues/463) Nerf crazed saraxa gear
- [#461](https://github.com/LandOfTheRair/landoftherair/issues/461) increase hp regen of acolytes from 2 to 4% for crazed saraxa
- [#445](https://github.com/LandOfTheRair/landoftherair/issues/445) Make damage roll boost owts only
- [#433](https://github.com/LandOfTheRair/landoftherair/issues/433) nerf magic shield (mult 4 -> 3)
- [#427](https://github.com/LandOfTheRair/landoftherair/issues/427) make magiccutarmorclasses cut potency by half, instead of just damage
- [#363](https://github.com/LandOfTheRair/landoftherair/issues/363) Nerf Sedgwick
- [#361](https://github.com/LandOfTheRair/landoftherair/issues/361) Buff cure roll (not mult)
- [#356](https://github.com/LandOfTheRair/landoftherair/issues/356) Make npc box more performant
- [#355](https://github.com/LandOfTheRair/landoftherair/issues/355) lower spawn in the dungeon
- [#351](https://github.com/LandOfTheRair/landoftherair/issues/351) Change skill required for charge
- [#348](https://github.com/LandOfTheRair/landoftherair/issues/348) Spawners should not respawn creatures if they're currently slow.
- [#346](https://github.com/LandOfTheRair/landoftherair/issues/346) give casters a generic f/i prot gear item (maybe gloves)
- [#344](https://github.com/LandOfTheRair/landoftherair/issues/344) healer buffs
- [#343](https://github.com/LandOfTheRair/landoftherair/issues/343) Weaken crazed and buff insane xp
- [#342](https://github.com/LandOfTheRair/landoftherair/issues/342) Possibly lower rare ring and pot spawns to a lower range
- [#341](https://github.com/LandOfTheRair/landoftherair/issues/341) Make sure Bradley's con pots don't go to 15 (13 might be an ok number)
- [#340](https://github.com/LandOfTheRair/landoftherair/issues/340) Clean up tonwin dp area so things don't Regen on it
- [#338](https://github.com/LandOfTheRair/landoftherair/issues/338) Buff wand damage
- [#336](https://github.com/LandOfTheRair/landoftherair/issues/336) Lower spawn in prisons

#### Bug Fixes

- [#539](https://github.com/LandOfTheRair/landoftherair/issues/539) tower guards do not attack orcs on sight
- [#535](https://github.com/LandOfTheRair/landoftherair/issues/535) validate chosen macro group persisting correctly between game launches
- [#534](https://github.com/LandOfTheRair/landoftherair/issues/534) macro to change should also set active macro if target macro 
- [#528](https://github.com/LandOfTheRair/landoftherair/issues/528) parties do not share skill
- [#527](https://github.com/LandOfTheRair/landoftherair/issues/527) Carrying a corpse sometimes loses its items
- [#521](https://github.com/LandOfTheRair/landoftherair/issues/521) Swap hands does not recalculate stats
- [#520](https://github.com/LandOfTheRair/landoftherair/issues/520) cant drag from ground to merchant
- [#517](https://github.com/LandOfTheRair/landoftherair/issues/517) cant drop 0 gold
- [#510](https://github.com/LandOfTheRair/landoftherair/issues/510) discord -> lobby broken
- [#505](https://github.com/LandOfTheRair/landoftherair/issues/505) Look at heart container
- [#504](https://github.com/LandOfTheRair/landoftherair/issues/504) Sedgwick chest drops undefined
- [#503](https://github.com/LandOfTheRair/landoftherair/issues/503) Owts dust should not drop from 0 quality 
- [#492](https://github.com/LandOfTheRair/landoftherair/issues/492) lock all window positions doesn't necessarily work until you re-check the option
- [#491](https://github.com/LandOfTheRair/landoftherair/issues/491) items don't get GCd when the map loads
- [#490](https://github.com/LandOfTheRair/landoftherair/issues/490) pouch can't drop to face
- [#485](https://github.com/LandOfTheRair/landoftherair/issues/485) dots on dummy do not reset agro
- [#481](https://github.com/LandOfTheRair/landoftherair/issues/481) learning new skills does not refresh your macro list
- [#480](https://github.com/LandOfTheRair/landoftherair/issues/480) hide logic seems a bit wrong
- [#475](https://github.com/LandOfTheRair/landoftherair/issues/475) stun does not check for recently stunned
- [#468](https://github.com/LandOfTheRair/landoftherair/issues/468) darkvision does not kick in until moving
- [#460](https://github.com/LandOfTheRair/landoftherair/issues/460) acolyte spawns are infrequent and sometimes not working for crazed saraxa
- [#447](https://github.com/LandOfTheRair/landoftherair/issues/447) fix door displays
- [#444](https://github.com/LandOfTheRair/landoftherair/issues/444) spellforging/alchemy skill isn't being gained
- [#442](https://github.com/LandOfTheRair/landoftherair/issues/442) parties are broken - can create but cant join
- [#438](https://github.com/LandOfTheRair/landoftherair/issues/438) teleports between maps can still leave you in the wrong spot
- [#436](https://github.com/LandOfTheRair/landoftherair/issues/436) heart sometimes does not go down when the bar does
- [#435](https://github.com/LandOfTheRair/landoftherair/issues/435) investigate: npc heart does not go down as they die
- [#432](https://github.com/LandOfTheRair/landoftherair/issues/432) fix display of discord messages
- [#430](https://github.com/LandOfTheRair/landoftherair/issues/430) learned spells do not add macros (again)
- [#426](https://github.com/LandOfTheRair/landoftherair/issues/426) Magicshield doesn't work
- [#425](https://github.com/LandOfTheRair/landoftherair/issues/425) gold is sometimes not lootable
- [#422](https://github.com/LandOfTheRair/landoftherair/issues/422) enchanting bricks are not lost on failure(?)
- [#421](https://github.com/LandOfTheRair/landoftherair/issues/421) cant move items around in the tradeskill window
- [#420](https://github.com/LandOfTheRair/landoftherair/issues/420) succoring or teleporting shows npcs that shouldn't be there from old maps
- [#419](https://github.com/LandOfTheRair/landoftherair/issues/419) find sedgwick quests aren't quite right
- [#417](https://github.com/LandOfTheRair/landoftherair/issues/417) map transitions cause ground to be invisible for players periodically
- [#416](https://github.com/LandOfTheRair/landoftherair/issues/416) prevent skill gain from gems
- [#415](https://github.com/LandOfTheRair/landoftherair/issues/415) macro group is blank on new character
- [#414](https://github.com/LandOfTheRair/landoftherair/issues/414) kills don't rot unless you're in range
- [#412](https://github.com/LandOfTheRair/landoftherair/issues/412) malnourished is not clearing stat reductions
- [#407](https://github.com/LandOfTheRair/landoftherair/issues/407) make mainhand shield not work
- [#403](https://github.com/LandOfTheRair/landoftherair/issues/403) dv doesnt reset fov like it should
- [#401](https://github.com/LandOfTheRair/landoftherair/issues/401) weapon damage roll changes are not working for rage stance
- [#400](https://github.com/LandOfTheRair/landoftherair/issues/400) item checking for stances should check the type instead of itemClass
- [#399](https://github.com/LandOfTheRair/landoftherair/issues/399) box contents can be duped
- [#397](https://github.com/LandOfTheRair/landoftherair/issues/397) gold on piles are not updated correctly when corpses rot or transmute is cast
- [#396](https://github.com/LandOfTheRair/landoftherair/issues/396) Hobgoblins don't spawn
- [#395](https://github.com/LandOfTheRair/landoftherair/issues/395) No tower creatures have dv
- [#393](https://github.com/LandOfTheRair/landoftherair/issues/393) client map data is not reset when leaving map
- [#392](https://github.com/LandOfTheRair/landoftherair/issues/392) warriors only should gain skill on hit
- [#390](https://github.com/LandOfTheRair/landoftherair/issues/390) Bar water and bar fire potions work without water
- [#383](https://github.com/LandOfTheRair/landoftherair/issues/383) Killing creatures drops no corpse
- [#382](https://github.com/LandOfTheRair/landoftherair/issues/382) Dying in an instance might kick from party
- [#380](https://github.com/LandOfTheRair/landoftherair/issues/380) optimize ground
- [#377](https://github.com/LandOfTheRair/landoftherair/issues/377) dailies are still broken garbage
- [#375](https://github.com/LandOfTheRair/landoftherair/issues/375) dailies are infinitely repeatable
- [#371](https://github.com/LandOfTheRair/landoftherair/issues/371) party/dungeon bugs
- [#368](https://github.com/LandOfTheRair/landoftherair/issues/368) add reset button for default macro group
- [#367](https://github.com/LandOfTheRair/landoftherair/issues/367) fov doesnt change while dead
- [#365](https://github.com/LandOfTheRair/landoftherair/issues/365) Direction doesn't reset when restoring or reviving 
- [#364](https://github.com/LandOfTheRair/landoftherair/issues/364) Round all incoming damage and heals
- [#359](https://github.com/LandOfTheRair/landoftherair/issues/359) Fix effect validation to or the two effect check conditions
- [#358](https://github.com/LandOfTheRair/landoftherair/issues/358) sewerrat not registering kill - killed just using afflict
- [#354](https://github.com/LandOfTheRair/landoftherair/issues/354) insanes should not fight each other
- [#353](https://github.com/LandOfTheRair/landoftherair/issues/353) start creatures at max health before adding them to deepstream
- [#352](https://github.com/LandOfTheRair/landoftherair/issues/352) Make sure tanning still works
- [#345](https://github.com/LandOfTheRair/landoftherair/issues/345) bank input is broken too (similar to the lobby input)
- [#339](https://github.com/LandOfTheRair/landoftherair/issues/339) Party agro
- [#331](https://github.com/LandOfTheRair/landoftherair/issues/331) lobby text box does not keep focus
- [#327](https://github.com/LandOfTheRair/landoftherair/issues/327) Can't see items in edge
- [#323](https://github.com/LandOfTheRair/landoftherair/issues/323) Don't add darkness to wall tiles
- [#322](https://github.com/LandOfTheRair/landoftherair/issues/322) New fov also reveals secret doors
- [#320](https://github.com/LandOfTheRair/landoftherair/issues/320) lockers act weirdly when trying to add/deposit from a diff one from the one you're standing on
- [#319](https://github.com/LandOfTheRair/landoftherair/issues/319) Game automatically levels you up but it shouldn't 
- [#317](https://github.com/LandOfTheRair/landoftherair/issues/317) fov is not updated when dv is cast
- [#316](https://github.com/LandOfTheRair/landoftherair/issues/316) losing party on map transition?
- [#315](https://github.com/LandOfTheRair/landoftherair/issues/315) loaded ground items do not count as equipment?
- [#314](https://github.com/LandOfTheRair/landoftherair/issues/314) teleports to other maps shouldn't temporarily place the player at that x,y in the current map
- [#311](https://github.com/LandOfTheRair/landoftherair/issues/311) it is possible to get stuck out of lobby (game thinks you're logged in)
- [#225](https://github.com/LandOfTheRair/landoftherair/issues/225) multiple musics play at once

---

## 0.0.1 (22/12/2017)

#### Enhancements

- [#306](https://github.com/LandOfTheRair/landoftherair/issues/306) items that come with trait-boosting abilities
- [#305](https://github.com/LandOfTheRair/landoftherair/issues/305) make enemy thieves able to steal
- [#304](https://github.com/LandOfTheRair/landoftherair/issues/304) Add skill requirements for weapons
- [#303](https://github.com/LandOfTheRair/landoftherair/issues/303) re-evaluate ticks for npcs
- [#302](https://github.com/LandOfTheRair/landoftherair/issues/302) allow for alternate art testing urls
- [#301](https://github.com/LandOfTheRair/landoftherair/issues/301) make armorClass a straight damage reduction boost too
- [#300](https://github.com/LandOfTheRair/landoftherair/issues/300) make npcs try to pick up gear from ground if they are empty handed
- [#299](https://github.com/LandOfTheRair/landoftherair/issues/299) make exp bar a progress bar
- [#292](https://github.com/LandOfTheRair/landoftherair/issues/292) add messages for target being stolen from
- [#291](https://github.com/LandOfTheRair/landoftherair/issues/291) item rarity
- [#288](https://github.com/LandOfTheRair/landoftherair/issues/288) add skill requirements to skill tooltips
- [#287](https://github.com/LandOfTheRair/landoftherair/issues/287) Change item value based on encrusted gem
- [#279](https://github.com/LandOfTheRair/landoftherair/issues/279) slow game loop down
- [#272](https://github.com/LandOfTheRair/landoftherair/issues/272) text on top of a progress bar for hp/mp
- [#267](https://github.com/LandOfTheRair/landoftherair/issues/267) Difficulty indicators
- [#266](https://github.com/LandOfTheRair/landoftherair/issues/266) add traits for "above a threshold" and "below a threshold"
- [#261](https://github.com/LandOfTheRair/landoftherair/issues/261) upgrade ng-drag-drop
- [#258](https://github.com/LandOfTheRair/landoftherair/issues/258) move encrust to top right
- [#256](https://github.com/LandOfTheRair/landoftherair/issues/256) dont send to client:
- [#254](https://github.com/LandOfTheRair/landoftherair/issues/254) Add ping-pong debug command 
- [#253](https://github.com/LandOfTheRair/landoftherair/issues/253) Add a debug command to count number of mobs
- [#250](https://github.com/LandOfTheRair/landoftherair/issues/250) clear old npc, etc data when quitting game
- [#249](https://github.com/LandOfTheRair/landoftherair/issues/249) Add chase command 
- [#245](https://github.com/LandOfTheRair/landoftherair/issues/245) dropPool
- [#244](https://github.com/LandOfTheRair/landoftherair/issues/244) analysis tools
- [#243](https://github.com/LandOfTheRair/landoftherair/issues/243) requireQuest
- [#242](https://github.com/LandOfTheRair/landoftherair/issues/242) elemental damage boosts
- [#239](https://github.com/LandOfTheRair/landoftherair/issues/239) make mapNPCs a hash for the client
- [#238](https://github.com/LandOfTheRair/landoftherair/issues/238) remove .message strong letter spacing in non-fantasy
- [#237](https://github.com/LandOfTheRair/landoftherair/issues/237) remove old auth0 keys from strorage
- [#236](https://github.com/LandOfTheRair/landoftherair/issues/236) reduce drop rate if npc killed by npc (cut by 90%)
- [#233](https://github.com/LandOfTheRair/landoftherair/issues/233) merchant in sewers that sells prot pots at a high fee
- [#227](https://github.com/LandOfTheRair/landoftherair/issues/227) add option for light theme
- [#226](https://github.com/LandOfTheRair/landoftherair/issues/226) add option to use roboto instead of fantasy
- [#221](https://github.com/LandOfTheRair/landoftherair/issues/221) stop sending messages to people through walls
- [#220](https://github.com/LandOfTheRair/landoftherair/issues/220) optimize data transferrence
- [#219](https://github.com/LandOfTheRair/landoftherair/issues/219) dont strip succors
- [#217](https://github.com/LandOfTheRair/landoftherair/issues/217) add succor 'region'
- [#216](https://github.com/LandOfTheRair/landoftherair/issues/216) Add . Macro for repeat from macro use in addition to cmd
- [#215](https://github.com/LandOfTheRair/landoftherair/issues/215) drink command, when potion slot empty, should put new potion in potion slot
- [#214](https://github.com/LandOfTheRair/landoftherair/issues/214) right click to sell, locker if the window is open
- [#212](https://github.com/LandOfTheRair/landoftherair/issues/212) fill in black areas on all sprites
- [#211](https://github.com/LandOfTheRair/landoftherair/issues/211) click on stairs to populate the up command
- [#208](https://github.com/LandOfTheRair/landoftherair/issues/208) encrust certain gems to add spells
- [#207](https://github.com/LandOfTheRair/landoftherair/issues/207) increase buff duration
- [#206](https://github.com/LandOfTheRair/landoftherair/issues/206) items that give buffs
- [#205](https://github.com/LandOfTheRair/landoftherair/issues/205) add color difference between cmd and say mode
- [#203](https://github.com/LandOfTheRair/landoftherair/issues/203) add permanent buff for "low con" warnings
- [#201](https://github.com/LandOfTheRair/landoftherair/issues/201) drink from sack
- [#199](https://github.com/LandOfTheRair/landoftherair/issues/199) give rep on kill
- [#197](https://github.com/LandOfTheRair/landoftherair/issues/197) add new damage rolls property to item
- [#196](https://github.com/LandOfTheRair/landoftherair/issues/196) party distance indicator modifications
- [#195](https://github.com/LandOfTheRair/landoftherair/issues/195) sort creatures by distance
- [#194](https://github.com/LandOfTheRair/landoftherair/issues/194) items that require a class
- [#193](https://github.com/LandOfTheRair/landoftherair/issues/193) items that require alignment to benefit or wear
- [#192](https://github.com/LandOfTheRair/landoftherair/issues/192) arrows on macro bars
- [#190](https://github.com/LandOfTheRair/landoftherair/issues/190) respawnX/respawnY on maps
- [#189](https://github.com/LandOfTheRair/landoftherair/issues/189) aquatic monsters
- [#185](https://github.com/LandOfTheRair/landoftherair/issues/185) split deer and wolf spawners up
- [#184](https://github.com/LandOfTheRair/landoftherair/issues/184) when an npc dies, it should get every player username in view(5) of it for tanning purposes
- [#182](https://github.com/LandOfTheRair/landoftherair/issues/182) nerf the skill curve
- [#181](https://github.com/LandOfTheRair/landoftherair/issues/181) small logging system
- [#178](https://github.com/LandOfTheRair/landoftherair/issues/178) hp/mp regen quest
- [#177](https://github.com/LandOfTheRair/landoftherair/issues/177) next batch of spells
- [#176](https://github.com/LandOfTheRair/landoftherair/issues/176) warriors get a passive 1/1 every 5 levels
- [#175](https://github.com/LandOfTheRair/landoftherair/issues/175) gm summon command
- [#174](https://github.com/LandOfTheRair/landoftherair/issues/174) kill quests
- [#172](https://github.com/LandOfTheRair/landoftherair/issues/172) actually render traps
- [#171](https://github.com/LandOfTheRair/landoftherair/issues/171) warriors charge at sk3?
- [#170](https://github.com/LandOfTheRair/landoftherair/issues/170) make traps stronger
- [#169](https://github.com/LandOfTheRair/landoftherair/issues/169) npcs set traps
- [#168](https://github.com/LandOfTheRair/landoftherair/issues/168) disarm traps
- [#167](https://github.com/LandOfTheRair/landoftherair/issues/167) mouseover for desc as well as dbl click
- [#166](https://github.com/LandOfTheRair/landoftherair/issues/166) buy max, drop max
- [#165](https://github.com/LandOfTheRair/landoftherair/issues/165) add thief npcs
- [#164](https://github.com/LandOfTheRair/landoftherair/issues/164) add traps for thieves
- [#162](https://github.com/LandOfTheRair/landoftherair/issues/162) take stack of items
- [#161](https://github.com/LandOfTheRair/landoftherair/issues/161) show buffs in party menu?
- [#160](https://github.com/LandOfTheRair/landoftherair/issues/160) add lockpicks
- [#159](https://github.com/LandOfTheRair/landoftherair/issues/159) perception should factor distance into account
- [#158](https://github.com/LandOfTheRair/landoftherair/issues/158) shopkeeper sell commands
- [#156](https://github.com/LandOfTheRair/landoftherair/issues/156) clean up windows
- [#155](https://github.com/LandOfTheRair/landoftherair/issues/155) flash lobby on new messages
- [#154](https://github.com/LandOfTheRair/landoftherair/issues/154) option: lock window position
- [#153](https://github.com/LandOfTheRair/landoftherair/issues/153) add a phaser loading state
- [#151](https://github.com/LandOfTheRair/landoftherair/issues/151) lock target box 
- [#146](https://github.com/LandOfTheRair/landoftherair/issues/146) add bgm
- [#134](https://github.com/LandOfTheRair/landoftherair/issues/134) active target box
- [#133](https://github.com/LandOfTheRair/landoftherair/issues/133) add gradient to item slot backgrounds
- [#132](https://github.com/LandOfTheRair/landoftherair/issues/132) strip to safe areas
- [#131](https://github.com/LandOfTheRair/landoftherair/issues/131) make thieves able to use spells
- [#130](https://github.com/LandOfTheRair/landoftherair/issues/130) add flowers
- [#129](https://github.com/LandOfTheRair/landoftherair/issues/129) remove flowers from drop pool
- [#128](https://github.com/LandOfTheRair/landoftherair/issues/128) hide lobby when in game by default
- [#127](https://github.com/LandOfTheRair/landoftherair/issues/127) assign classes to monsters
- [#125](https://github.com/LandOfTheRair/landoftherair/issues/125) add mage skills
- [#124](https://github.com/LandOfTheRair/landoftherair/issues/124) add healer skills
- [#123](https://github.com/LandOfTheRair/landoftherair/issues/123) add thief skills
- [#121](https://github.com/LandOfTheRair/landoftherair/issues/121) add ~PtW
- [#119](https://github.com/LandOfTheRair/landoftherair/issues/119) render updates are a bit slow
- [#118](https://github.com/LandOfTheRair/landoftherair/issues/118) add command directional movement
- [#116](https://github.com/LandOfTheRair/landoftherair/issues/116) linkify links in lobby
- [#115](https://github.com/LandOfTheRair/landoftherair/issues/115) items that come with random stats
- [#114](https://github.com/LandOfTheRair/landoftherair/issues/114) items that boost skills
- [#113](https://github.com/LandOfTheRair/landoftherair/issues/113) items with stat growth
- [#112](https://github.com/LandOfTheRair/landoftherair/issues/112) after something dies, remove all of the items related to it from the queue
- [#111](https://github.com/LandOfTheRair/landoftherair/issues/111) tell some lairs to strip
- [#110](https://github.com/LandOfTheRair/landoftherair/issues/110) tweak forest spawns
- [#107](https://github.com/LandOfTheRair/landoftherair/issues/107) items that can attack from the offhand
- [#106](https://github.com/LandOfTheRair/landoftherair/issues/106) drop hands/strip implementation
- [#104](https://github.com/LandOfTheRair/landoftherair/issues/104) show charges when sensing an item
- [#95](https://github.com/LandOfTheRair/landoftherair/issues/95) prevent talksRandomly from saying the same message twice in a row
- [#94](https://github.com/LandOfTheRair/landoftherair/issues/94) stagger npc chatter messages when speaking randomly
- [#92](https://github.com/LandOfTheRair/landoftherair/issues/92) condition should affect AC
- [#91](https://github.com/LandOfTheRair/landoftherair/issues/91) in game chat
- [#86](https://github.com/LandOfTheRair/landoftherair/issues/86) throw bottles to dispense their effect on the target
- [#84](https://github.com/LandOfTheRair/landoftherair/issues/84) add option for "suppress 0-damage attacks"
- [#83](https://github.com/LandOfTheRair/landoftherair/issues/83) remove extraneous data from entities
- [#80](https://github.com/LandOfTheRair/landoftherair/issues/80) rep quests
- [#78](https://github.com/LandOfTheRair/landoftherair/issues/78) keep last selected slot selected on refresh
- [#77](https://github.com/LandOfTheRair/landoftherair/issues/77) split macros per character

#### Balance Adjustments

- [#294](https://github.com/LandOfTheRair/landoftherair/issues/294) add some rylt townie spawners that walk randomly
- [#275](https://github.com/LandOfTheRair/landoftherair/issues/275) add debuff for when dead

#### Bug Fixes

- [#298](https://github.com/LandOfTheRair/landoftherair/issues/298) wardrobe -> potion slot overwrites potion in slot if present
- [#297](https://github.com/LandOfTheRair/landoftherair/issues/297) Keybinds mess with lobby?
- [#296](https://github.com/LandOfTheRair/landoftherair/issues/296) right clicking group on ground = GtG is not valid
- [#293](https://github.com/LandOfTheRair/landoftherair/issues/293) set off traps leave a bad icon
- [#286](https://github.com/LandOfTheRair/landoftherair/issues/286) firemist reports that it hits the wrong person
- [#285](https://github.com/LandOfTheRair/landoftherair/issues/285) bank withdrawall doesnt work
- [#283](https://github.com/LandOfTheRair/landoftherair/issues/283) learning new spells doesn't add them to your macro list.
- [#281](https://github.com/LandOfTheRair/landoftherair/issues/281) sync when effects are done for npcs
- [#280](https://github.com/LandOfTheRair/landoftherair/issues/280) not seeing corpses or any items on the ground sometimes (same with monsters - deepstream is broke)
- [#278](https://github.com/LandOfTheRair/landoftherair/issues/278) a second player loading into the map doesnt load npcs
- [#277](https://github.com/LandOfTheRair/landoftherair/issues/277) dead players still show sprite
- [#276](https://github.com/LandOfTheRair/landoftherair/issues/276) restore doesn't work?
- [#274](https://github.com/LandOfTheRair/landoftherair/issues/274) No way to remove macro from bar
- [#273](https://github.com/LandOfTheRair/landoftherair/issues/273) Max size log window is broken 
- [#271](https://github.com/LandOfTheRair/landoftherair/issues/271) ping is sometimes negative?
- [#268](https://github.com/LandOfTheRair/landoftherair/issues/268) Floating boxes are broken (in chrome)
- [#259](https://github.com/LandOfTheRair/landoftherair/issues/259) close/reenter - loading text in wrong spot
- [#257](https://github.com/LandOfTheRair/landoftherair/issues/257) clear all inGame data when quitting the client(?)
- [#251](https://github.com/LandOfTheRair/landoftherair/issues/251) sprite does not appear in some cases
- [#248](https://github.com/LandOfTheRair/landoftherair/issues/248) Backstab and probably mug don't show you as moved 
- [#246](https://github.com/LandOfTheRair/landoftherair/issues/246) Sell all doesn't work correctly
- [#240](https://github.com/LandOfTheRair/landoftherair/issues/240) you hear direction is not right
- [#235](https://github.com/LandOfTheRair/landoftherair/issues/235) active target bar doesnt disappear on death?
- [#234](https://github.com/LandOfTheRair/landoftherair/issues/234) validate that truesight still works correctly
- [#231](https://github.com/LandOfTheRair/landoftherair/issues/231) greatmace warriors can attack from a tile away?
- [#230](https://github.com/LandOfTheRair/landoftherair/issues/230) evil people need to show up as red to grey because they will attack on sight
- [#229](https://github.com/LandOfTheRair/landoftherair/issues/229) sprite does not reappear immediately when doing a map change
- [#228](https://github.com/LandOfTheRair/landoftherair/issues/228) changing map causes macro wipes
- [#224](https://github.com/LandOfTheRair/landoftherair/issues/224) items sometimes do not show up on the ground
- [#223](https://github.com/LandOfTheRair/landoftherair/issues/223) You don't see anyone - right click sack to locker
- [#222](https://github.com/LandOfTheRair/landoftherair/issues/222) spells can be cast through walls somehow (specifically darkness)
- [#218](https://github.com/LandOfTheRair/landoftherair/issues/218) locker to sack, right click quickly, item dupe
- [#213](https://github.com/LandOfTheRair/landoftherair/issues/213) clear floating boxes on logout
- [#210](https://github.com/LandOfTheRair/landoftherair/issues/210) npc-opened doors dont render correctly?
- [#209](https://github.com/LandOfTheRair/landoftherair/issues/209) periodically commands are sent twice
- [#204](https://github.com/LandOfTheRair/landoftherair/issues/204) private messages are borked
- [#202](https://github.com/LandOfTheRair/landoftherair/issues/202) sometimes buffs become permanent
- [#200](https://github.com/LandOfTheRair/landoftherair/issues/200) fix window size options
- [#198](https://github.com/LandOfTheRair/landoftherair/issues/198) creature going out of sight but still in range keeps active target box up
- [#191](https://github.com/LandOfTheRair/landoftherair/issues/191) tooltip placement currently inconsistent
- [#188](https://github.com/LandOfTheRair/landoftherair/issues/188) investigate players not dropping corpses and player rotting not happening
- [#187](https://github.com/LandOfTheRair/landoftherair/issues/187) npcs not casting spells?
- [#186](https://github.com/LandOfTheRair/landoftherair/issues/186) Fix layering so stairs and doors are on top of loot
- [#183](https://github.com/LandOfTheRair/landoftherair/issues/183) macro window needs all data
- [#180](https://github.com/LandOfTheRair/landoftherair/issues/180) ground sub-items (bottom level) tooltips do not persist very long
- [#179](https://github.com/LandOfTheRair/landoftherair/issues/179) store a timestamp for when bosses should respawn as well as their current tick
- [#157](https://github.com/LandOfTheRair/landoftherair/issues/157) 0,0 area flickers on the map when entering 
- [#145](https://github.com/LandOfTheRair/landoftherair/issues/145) door state is still broken
- [#141](https://github.com/LandOfTheRair/landoftherair/issues/141) $isPlayerCorpse in groundItems is being saved
- [#140](https://github.com/LandOfTheRair/landoftherair/issues/140) remove padding from hp/mp
- [#135](https://github.com/LandOfTheRair/landoftherair/issues/135) auth0 keeps adding iframes to the page and not cleaning them up
- [#117](https://github.com/LandOfTheRair/landoftherair/issues/117) player sprite ghosts
- [#109](https://github.com/LandOfTheRair/landoftherair/issues/109) users are not correctly ordered in lobby
- [#108](https://github.com/LandOfTheRair/landoftherair/issues/108) add fov calculations for npcs if players are nearby (spawner.isActive)
- [#105](https://github.com/LandOfTheRair/landoftherair/issues/105) Greatsword is working with a shield?
- [#103](https://github.com/LandOfTheRair/landoftherair/issues/103) apparently harder to pick things up while regenning hp
- [#102](https://github.com/LandOfTheRair/landoftherair/issues/102) npcs on path can walk through walls
- [#101](https://github.com/LandOfTheRair/landoftherair/issues/101) corpses can apparently be re-tanned
- [#100](https://github.com/LandOfTheRair/landoftherair/issues/100) find better tooltip library that tries to fit it to stay on page
- [#99](https://github.com/LandOfTheRair/landoftherair/issues/99) motd is not always loaded and sent correctly
- [#97](https://github.com/LandOfTheRair/landoftherair/issues/97) doors don't work correctly in MP
- [#93](https://github.com/LandOfTheRair/landoftherair/issues/93) ~CtS is invalid
- [#89](https://github.com/LandOfTheRair/landoftherair/issues/89) logging in where there are ground items shows no items
- [#88](https://github.com/LandOfTheRair/landoftherair/issues/88) map changes do not work via teleporter (?)
- [#85](https://github.com/LandOfTheRair/landoftherair/issues/85) logging out and back in = no player sprite
- [#76](https://github.com/LandOfTheRair/landoftherair/issues/76) swimming sprites aren't set correctly per faction
- [#73](https://github.com/LandOfTheRair/landoftherair/issues/73) do not show floating boxes when changing characters
- [#63](https://github.com/LandOfTheRair/landoftherair/issues/63) Killing monsters drops the corpse 1 y too low
- [#52](https://github.com/LandOfTheRair/landoftherair/issues/52) WebGL: INVALID_OPERATION: bindTexture: object not from this context
- [#44](https://github.com/LandOfTheRair/landoftherair/issues/44) NPCs don't show up at the bottom edge(?)
- [#41](https://github.com/LandOfTheRair/landoftherair/issues/41) NPCs can walk through walls when walking randomly
