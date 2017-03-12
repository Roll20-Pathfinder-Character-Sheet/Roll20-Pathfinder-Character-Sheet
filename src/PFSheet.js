'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFMigrate from './PFMigrate';
import * as PFDefense from './PFDefense';
import * as PFSize from './PFSize';
import * as PFUtilsAsync  from './PFUtilsAsync';
//import * as PFMacros from './PFMacros';
//import * as PFMenus from './PFMenus';
import * as PFInitiative from './PFInitiative';
import * as PFSkills from './PFSkills';
import * as PFEncumbrance from './PFEncumbrance';
import* as PFInventory from './PFInventory';
import * as PFAbilityScores from './PFAbilityScores';
import * as PFBuffs from './PFBuffs';
import * as PFSaves from './PFSaves';
import * as PFHealth from  './PFHealth';
import * as PFChecks from './PFChecks';
import * as PFAbility from './PFAbility';
import * as PFNPC from './PFNPC';
import * as PFAttackOptions from './PFAttackOptions';
import * as PFAttacks from './PFAttacks';
import * as PFFeatures from './PFFeatures';
import * as PFSpells from './PFSpells';
import * as PFSpellCasterClasses from './PFSpellCasterClasses';
import * as PFPsionic from './PFPsionic';
import * as PFMythic from './PFMythic';
import * as PFClassRaceGrid from './PFClassRaceGrid';
import * as PFConditions from './PFConditions';
import * as PFNPCParser from './PFNPCParser';

function expandAll  () {
	getAttrs(["expandall"], function (v) {
		var skilltab = "4",
		setter = {};
		if (parseInt(v["expandall"],10)) {
			//set expandall to 0
			//set tabs to "all"
			//set conditions and buffs to "show"
			//set all others to default (which is "show")
			setAttrs({
				"expandall": "0",
				pagetab: "99",
				abilities_tab: "99",
				skills_tab: "99",
				spellclass_tab: "99",
				spells_tab: "99",
				npc_spellclass_tab: "0",
				equipment_tab: "99",
				"conditions-show": "1",
				"buffstop-show": "1",
				"character-details-show": "",
				"ability-scores-show": "",
				"health-and-wounds-show": "",
				"initiative-and-speeds-show": "",
				"experience-and-hero-points-show": "",
				"class-info-show": "",
				"mythic-info-show": "",
				"psionic-info-show": "",
				"abilities-show": "",
				"defense-values-show": "",
				"special-defenses-show": "",
				"armor-penalties-show": "",
				"saves-show": "",
				"armor-shield-show": "",
				"defense-notes-show": "",
				"attack-bonuses-show": "",
				"attack-notes-show": "",
				"attack-options-show": "",
				"attacks-show": "",
				"skills-show": "",
				"skill_options-show": "",
				"skill-ranks-show": "",
				"skill-notes-show": "",
				"artistry-show": "",
				"craft-show": "",
				"knowledge-show": "",
				"lore-show": "",
				"perform-show": "",
				"profession-show": "",
				"misc-show": "",
				"currency-show": "",
				"inventory-show": "",
				"carried-weight-show": "",
				"loads-show": "",
				"domains0-show": "",
				"spellsPerDay0-show": "",
				"spell_ranges0-show": "",
				"domains1-show": "",
				"spellsPerDay1-show": "",
				"spell_ranges1-show": "",
				"domains2-show": "",
				"spellsPerDay2-show": "",
				"spell_ranges2-show": "",
				"spelloptions-show": "",
				"newspells-show": "",
				"npc-quick_stats-show": "",
				"npc-defense-show": "",
				"options_defense_options-show": "",
				"npc-offense-show": "",
				"npc-speed-show": "",
				"npc-space-show": "",
				"npc-special-attacks-show": "",
				"npc-repeating_weapons-show": "",
				"npc-spell-like-abilities-show": "",
				"npc-spells-show": "",
				"npc-tactics-show": "",
				"npc-before-combat-show": "",
				"npc-during-combat-show": "",
				"npc-morale-show": "",
				"npc-base-statistics-show": "",
				"npc-statistics-show": "",
				"npc-feats-show": "",
				"npc-mythic-feats-show": "",
				"npc-skills-show": "",
				"npc-cgear-show": "",
				"npc-ogear-show": "",
				"npc-special-abilities-show": "",
				"header-image-show": "",
				"pathfinder-unchained-show": "",
				"pathfinder-mythic-adventures-show": "",
				"pathfinder-psionics-show": "",
				"roll-template-info-show": "",
				"sheet-config-show": "",
				"sheetcleanup-show": "",
				"buff-min-show": "",
				"buff-expand-show": "",
				"buff-column-show": "",
				"class-ability-min-show": "",
				"class-ability-expand-show": "",
				"class-ability-column-show": "",
				"feat-min-show": "",
				"feat-expand-show": "",
				"feat-column-show": "",
				"racial-trait-min-show": "0",
				"racial-trait-expand-show": "",
				"racial-trait-column-show": "",
				"traits-min-show": "0",
				"traits-expand-show": "",
				"traits-column-show": "",
				"mythic-min-show": "0",
				"mythic-expand-show": "",
				"mythic-column-show": "",
				"mythic-feats-min-show": "",
				"mythic-feats-expand-show": "",
				"mythic-feats-column-show": "",
				"weapon-min-show": "",
				"weapon-expand-show": "",
				"weapon-column-show": "",
				"item-min-show": "",
				"item-expand-show": "",
				"item-column-show": "",
				"newspells-min-show": "",
				"newspells-expand-show": "",
				"newspells-column-show": "",
				"npcweapon-min-show": "",
				"npcweapon-expand-show": "",
				"npcweapon-column-show": "",
				"npc-spell-like-abilities-min-show": "",
				"npc-spell-like-abilities-expand-show": "",
				"npc-spell-like-abilities-column-show": "",
				"npcnewspells-min-show": "",
				"npcnewspells-expand-show": "",
				"npcnewspells-column-show": "",
				"npcfeat-min-show": "",
				"npcfeat-expand-show": "",
				"npcfeat-column-show": "",
				"npcmythic-feats-min-show": "",
				"npcmythic-feats-expand-show": "",
				"npcmythic-feats-column-show": "",
				"npc-special-abilities-min-show": "",
				"npc-special-abilities-expand-show": "",
				"npc-special-abilities-column-show": ""
			});
			//now go through repeating sections and expand those to be sure users can see them.
			_.each(PFConst.repeatingSections, function (section) {
				var rsection = "repeating_" + section;
				getSectionIDs(rsection, function (ids) {
					var setter = _.reduce(ids, function (memo, id) {
						var prefix = rsection + "_" + id + "_";
						switch (section) {
							case 'weapon':
								memo[prefix + "add-damage-show"] = "";
								memo[prefix + "iterative-attacks-show"] = "";
								memo[prefix + "macro-text-show"] = "";
								break;
							case 'buff':
								memo[prefix + "options-show"] = "";
								memo[prefix + "description-show"] = "";
								break;
							case 'spells':
								memo[prefix + "spell-misc-show"] = "";
								memo[prefix + "description-show"] = "";
								memo[prefix + "macro-text-show"] = "";
								break;
							case 'class-ability':
							case 'feat':
							case 'racial-trait':
							case 'trait':
							case 'mythic-ability':
							case 'mythic-feat':
							case 'item':
								memo[prefix + "description-show"] = "";
								memo[prefix + "macro-text-show"] = "";
								break;
							case 'npc-spell-like-abilities':
								memo[prefix + "macro-text-show"] = "";
								break;
						}
						memo[prefix + "row-show"] = "";
						memo[prefix + "ids-show"] = "";
						return memo;
					}, {});
					setAttrs(setter, {
						silent: true
					});
				});
			});
		}
	});
}

/** Sets any values if sheet created brand new. Makes sure all migrations up to date.
* makes sure NPC value set. 
*/
function setupNewSheet (callback){
	var done = _.once(function(){
		setAttrs({'is_newsheet':0, 'is_v1':1, 'PFSheet_Version': String((PFConst.version.toFixed(2))) },PFConst.silentParams,function(){
			if (typeof callback === "function"){
				callback();
			}
		});
	});
	
	getAttrs(['is_npc', 'set_pfs'],function(v){
		var isNPC = parseInt(v.is_npc,10)||0,
		isPFS = parseInt(v.set_pfs,10)||0;
		PFMigrate.setAllMigrateFlags(function(){
			if (isNPC){
				PFNPC.setToNPC(done);
			} else if (isPFS){
				PFHealth.setToPFS(done);
			} else {
				done();
			}
		});
	});
}
function recalcExpressions (callback, silently, oldversion) {
	var countEqs = _.size(PFConst.equationMacros),
	done = _.once(function () {
		TAS.debug("leaving PFSheet.recalcExpressions");
		if (typeof callback === "function") {
			callback();
		}
	}),
	doneOne = _.after(countEqs, done);
	try {
		_.each(PFConst.equationMacros, function (writeField, readField) {
			try {
				SWUtils.evaluateAndSetNumber(readField, writeField, 0, doneOne, silently);
			} catch (err) {
				TAS.error("PFSheet.recalcExpressions", err);
				doneOne();
			}
		});
	} catch (err2) {
		TAS.error("PFSheet.recalcExpressions OUTER wtf how did this happen?", err2);
	} finally {
		done();
	}
}
function recalcDropdowns (callback, silently, oldversion) {
	var countEqs = _.size(PFConst.dropdowns),
	done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	}),
	doneOne = _.after(countEqs, done);
	try {
		_.each(PFConst.dropdowns, function (writeField, readField) {
			try {
				PFUtilsAsync.setDropdownValue(readField, writeField, doneOne, silently);
			} catch (err) {
				TAS.error("PFSheet.recalcDropdowns", err);
				doneOne();
			}
		});
	} catch (err2) {
		TAS.error("PFSheet.recalcDropdowns OUTER wtf how did this happen?", err2);
	} finally {
		done();
	}
}
export function migrate (oldversion, callback, errorCallback) {
	var done = _.once(function () {
		TAS.debug("leaving PFSheet.migrate");
		if (typeof callback === "function") {
			callback();
		}
	}),
	errorDone = _.once(function (){
		TAS.warn("leaving migrate ERROR UPGRADE NOT FINISHED");
		if (typeof errorCallback === "function") {
			errorCallback();
		} else {
			done();
		}
	}),
	doneOne;
	try {
		//don't need to check if oldversion > 0 since this is only called if it is.
		TAS.debug("At PFSheet.migrate from oldversion:"+oldversion);
		if (oldversion < 1.0) {
			doneOne=_.after(7,function(){
				TAS.info("we finished calling all the migrates");
				done();
			});
			PFMigrate.migrateConfigFlags(TAS.callback( function (){
				PFInventory.migrate(doneOne,oldversion);
				PFSkills.migrate(doneOne,oldversion);
				PFHealth.migrate(doneOne,oldversion);
				PFAttacks.migrate(doneOne,oldversion);
				PFAbility.migrate(doneOne,oldversion);
				PFFeatures.migrate(doneOne,oldversion);
				PFSpells.migrate(doneOne,oldversion);
			}));
		} else if (oldversion < 1.17) {
			if (oldversion < 1.02) {
				PFAbility.migrate(null,oldversion);
				PFFeatures.migrate(null,oldversion);
			}
			if (oldversion < 1.05){
				PFAttackOptions.resetOptions();
			}
			if (oldversion < 1.07){
				PFInventory.migrate(null,oldversion);
			}
			if (oldversion < 1.10){
				PFMigrate.migrateAbilityListFlags();
				PFFeatures.migrate(null,oldversion);
			}
			if (oldversion < 1.12){
				PFAbility.migrate(null,oldversion);
			}
			if (oldversion < 1.17){
				PFInventory.migrate(function(){PFInventory.resetCommandMacro();});
			}
		} else {
			if (oldversion < 1.18){
				//future updates here. any above will recalc whole sheet after callback
				PFInitiative.recalculate(null,false,oldversion);
				PFHealth.recalculate(null,false,oldversion);
			}
		}
	} catch (err) {
		TAS.error("PFSheet.migrate", err);
		//errorDone();
	} finally {
		done();
	}
}
function recalculateParallelModules (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("leaving PFSheet.recalculateParallelModules");
		if (typeof callback === "function") {
			callback();
		}
	}),
	parallelRecalcFuncs = [
		PFSpellCasterClasses.recalculate, 
		PFSaves.recalculate,
		PFFeatures.recalculate,
		PFPsionic.recalculate,
		PFSkills.recalculate,
		PFAbility.recalculate,
		PFInitiative.recalculate,
		PFAttacks.recalculate
	],		
	numberModules = _.size(parallelRecalcFuncs),
	doneOneModuleInner = _.after(numberModules, done),
	curr = 0,
	currstarted = 0,

	doneOneModule = function () {
		curr++;
		TAS.info("PFSheet.recalculateParallelModules, finished " + curr + " modules");
		doneOneModuleInner();
	};

	TAS.debug("at recalculateParallelModules! there are "+numberModules +" modules");
	try {
		_.each(parallelRecalcFuncs, function (methodToCall) {
			try {
				currstarted++;
				TAS.info("starting " + currstarted + " parallel modules");
				methodToCall(doneOneModule, silently, oldversion);
			} catch (err) {
				TAS.error("PFSheet.recalculateParallelModules", err);
				doneOneModule();
			}
		});
	} catch (err2) {
		TAS.error("PFSheet.recalculateParallelModules OUTER error!", err2);
		done();
	}
}
function recalculateDefenseAndEncumbrance (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("leaving PFSheet.recalculateDefenseAndEncumbrance");
		if (typeof callback === "function") {
			callback();
		}
	}),
	callEncumbrance = function(){
		PFEncumbrance.recalculate(done, silently, oldversion);
	},
	doneBeforeEncumbrance = _.after(2, callEncumbrance);
	try {
		PFInventory.recalculate(doneBeforeEncumbrance, silently, oldversion);
		PFDefense.recalculate(doneBeforeEncumbrance, silently, oldversion);
	} catch (err){
		TAS.error("pfsheet.recalculateDefenseAndEncumbrance",err);
		callEncumbrance();
	}
}
function recalculateCore (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("leaving PFSheet.recalculateCore");
		if (typeof callback === "function") {
			callback();
		}
	}),
	sizeOnce = _.once(function(){
		PFSize.recalculate(done,silently,oldversion);
	}),
	healthOnce = _.once (function(){
		PFHealth.recalculate(sizeOnce,silently,oldversion);
	}),
	npcOnce = _.once(function(){
		PFNPC.recalculate(healthOnce,silently,oldversion);
	}),
	mythicOnce = _.once(function(){
		PFMythic.recalculate(npcOnce, silently, oldversion);
	}),
	expressionsOnce = _.once(function () {
		recalcExpressions(mythicOnce, silently, oldversion);
	}),
	dropdownsOnce = _.once(function () {
		recalcDropdowns(expressionsOnce, silently, oldversion);
	}),
	conditioncheckOnce = _.once(function () {
		PFChecks.applyConditions(dropdownsOnce, silently, oldversion);
	}),
	classOnce = _.once(function () {
		PFClassRaceGrid.recalculate(conditioncheckOnce, silently, oldversion);
	}),
	abilityScoresOnce = _.once(function () {
		PFAbilityScores.recalculate(classOnce, silently, oldversion);
	}),
	abilityAffectingConditionsOnce = _.once(function () {
		PFConditions.recalculate(abilityScoresOnce, silently, oldversion);
	}),
	buffsOnce = _.once(function () {
		PFBuffs.recalculate(abilityAffectingConditionsOnce, silently, oldversion);
	});

	PFMigrate.migrateConfigFlags(buffsOnce);
	
	//TAS.debug("at recalculateCore!!!!");

}
/** recalculate - all pages in sheet!  
*@param {number} oldversion the current version attribute
*@param {function} callback when done if no errors
*@param {function} errorCallback  call this if we get an error
*/
export function recalculate (oldversion, callback, silently) {
	var done = function () {
		TAS.info("leaving PFSheet.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	},
	callParallel = TAS.callback(function callRecalculateParallelModules() {
		recalculateParallelModules(TAS.callback(done), silently, oldversion);
	}),
	callEncumbrance = TAS.callback(function callRecalculateDefenseAndEncumbrance() {
		recalculateDefenseAndEncumbrance(TAS.callback(callParallel), silently, oldversion);
	});
	recalculateCore(callEncumbrance, silently, oldversion);

}
/* checkForUpdate looks at current version of page in PFSheet_Version and compares to code PFConst.version
*  calls recalulateSheet if versions don't match or if recalculate button was pressed.*/
function checkForUpdate () {
	var done = function () {
		setAttrs({ recalc1: 0, migrate1: 0, is_newsheet: 0}, PFConst.silentParams);
	},
	errorDone = _.once(function (){
		TAS.warn("leaving checkForUpdate ERROR UPGRADE NOT FINISHED DO NOT RESET VERSION");
		setAttrs({ recalc1: 0, migrate1: 0 }, { silent: true });
	});
	getAttrs(['PFSheet_Version', 'migrate1', 'recalc1', 'is_newsheet', 'is_v1', 'hp', 'hp_max', 'npc-hd', 'npc-hd-num',
	'race', 'class-0-name', 'npc-type', 'level'], function (v) {
		var setter = {},
		setAny = 0,
		migrateSheet=false,
		newSheet= false,
		recalc = false,
		currVer = parseFloat(v.PFSheet_Version, 10) || 0,
		setUpgradeFinished = function() {
			setAttrs({ recalc1: 0, migrate1: 0, is_newsheet: 0, 
			character_sheet: 'Pathinder_Necerosv'+String(PFConst.version),
			PFSheet_Version: String((PFConst.version.toFixed(2))) }, PFConst.silentParams, function() {
				if (currVer < 1.17) {
					recalculate(currVer, null, false);
				}
			});
		};
		TAS.notice("Attributes at version: " + currVer);
		if (parseInt(v["recalc1"],10) ){
			//HIT RECALC
			currVer = -1;
			recalc = true;
		} 
		if (parseInt(v["migrate1"],10)) {
			migrateSheet =true;
		}
		if  ( parseInt(v["is_newsheet"],10) || (currVer === 0 &&  (parseInt(v.is_v1,10) || (  !(parseInt(v.hp, 10) || parseInt(v.hp_max, 10) || parseInt(v['npc-hd'], 10) || parseInt(v['npc-hd-num'], 10) ||
			v.race || v['class-0-name'] || v['npc-type'] || parseInt(v['level'], 10))))) ) {
			//NEW SHEET:
			newSheet=true;
		} 
		if (currVer !== PFConst.version) {
			migrateSheet = true;
		}
		if (newSheet) {
			setupNewSheet(done);
		} else if (migrateSheet){
			migrate(currVer, setUpgradeFinished, errorDone);
		} else if (recalc) {
			recalculate(currVer, done, false);
		} else  {
			done();
		}
	});
}
function registerEventHandlers () {
	on("sheet:opened", TAS.callback(function eventSheetOpened() {
		//eventInfo has undefined values for this event.
		checkForUpdate();
	}));
	on("change:recalc1 change:migrate1", TAS.callback(function eventRecaluateSheet(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			checkForUpdate();
		}
	}));
	on("change:expandall", function (eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			expandAll();
		}
	});
	//GENERIC DROPDOWNS
	_.each(PFConst.dropdowns, function (write, read) {
		on("change:" + read, TAS.callback(function eventGenericDropdowns(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			PFUtilsAsync.setDropdownValue(read, write);
		}));
	});
	//GENERIC EQUATIONS
	_.each(PFConst.equationMacros, function (write, read) {
		on("change:" + read, TAS.callback(function eventGenericEquationMacro(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			SWUtils.evaluateAndSetNumber(read, write);
		}));
	});

	on("change:repeating_weapon:source-item", TAS.callback(function eventUpdateAttackSourceItem(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs([eventInfo.sourceAttribute],function(v){
				var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
				sourceId = v[eventInfo.sourceAttribute];
				//TAS.debug("PFSheet new item id: " + sourceId + " this row weapon id: "+weaponId, v);
				if (sourceId){
					sourceId = 'repeating_item_'+sourceId+'_create-attack-entry';
					PFInventory.createAttackEntryFromRow(sourceId,null,false,weaponId);
				}
			});
		}
	}));
	on("change:repeating_weapon:source-ability", TAS.callback(function eventUpdateAttackSourceAbility(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs([eventInfo.sourceAttribute],function(v){
				var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
				sourceId = v[eventInfo.sourceAttribute];
				if (sourceId){
					PFAbility.createAttackEntryFromRow(sourceId,null,false,null,weaponId);
				}
			});
		}
	}));
	on("change:repeating_weapon:source-spell", TAS.callback(function eventUpdateAttackSourceSpell(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs([eventInfo.sourceAttribute],function(v){
				var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
				sourceId = v[eventInfo.sourceAttribute];
				if (sourceId){
					PFSpells.createAttackEntryFromRow(sourceId,null,false,null,weaponId);
				}
			});
		}
	}));
	
	// PARSE CREATE NPC MONSTER
	on("change:npc_import_now", TAS.callback(function eventParseMonsterImport(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			getAttrs(['npc_import_now'], function (v) {
				if ((parseInt(v.npc_import_now, 10) || 0) === 1) {
					PFNPCParser.importFromCompendium(eventInfo, function(){
						//instead of just calling recalculate set recalc button and call checkforupdate
						//so users sees something is happening.
						setAttrs({recalc1:1},PFConst.silentParams,function(){
							checkForUpdate();
						});
					});
				}
			});
		}
	}));

}
registerEventHandlers();

