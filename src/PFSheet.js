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
import * as PFAttackGrid from './PFAttackGrid';
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
import * as PFHorror from './PFHorror';
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
				npc_spellclass_tab: "99",
				equipment_tab: "99",
				'sheet-conditions-show':0,
				'buffstop-show':0,
				'command-buttons-show':0,
				'NPC-command-buttons-show':0,
				'character-details-show':0,
				'ability-scores-show':0,
				'class-info-show':0,
				'class1_show':0,
				'class2_show':0,
				'class3_show':0,
				'health-and-wounds-show':0,
				'initiative-show':0,
				'macro-text-show':0,
				'notes-show':0,
				'saves-show':0,
				'extra_fields_saves_show':1,
				'extra_fields_spells_show':1,
				'extra_fields_caster_show':1,
				'defense-values-show':0,
				'armor-shield-show':0,
				'sanity-show':0,
				'defense-notes-show':0,
				'attack-bonuses-show':0,
				'atkm2_show':0,
				'attack-notes-show':0,
				'attack-options-show':0,
				'two-weapon-show':0,
				'attacks-show':0,
				'skill-ranks-show':0,
				'skill_options-show':0,
				'skills-show':0,
				'artistry-show':0,
				'craft-show':0,
				'knowledge-show':0,
				'lore-show':0,
				'perform-show':0,
				'profession-show':0,
				'misc-show':0,
				'skill-notes-show':0,
				'ability-command-buttons-show':0,
				'NPC-ability-command-buttons-show':0,
				'feats-show':0,
				'mythic-info-show':0,
				'psionic-info-show':0,
				'abilities-show':0,
				'spellclasses-show':0,
				'spellclass-0-show':0,
				'spellclass-0-spellpoints-show':0,
				'spellclass-0-spells-notes-show':0,
				'spellclass-0-perday-show':0,
				'spellclass-0-domains-show':0,
				'domain02_show':0,
				'domain03_show':0,
				'spellclass-1-show':0,
				'spellclass-1-spellpoints-show':0,
				'spellclass-1-spells-notes-show':0,
				'spellclass-1-perday-show':0,
				'spellclass-1-domains-show':0,
				'spellclass-2-show':0,
				'spellclass-2-spellpoints-show':0,
				'spellclass-2-spells-notes-show':0,
				'spellclass-2-perday-show':0,
				'spellclass-2-domains-show':0,
				'spelloptions-show':0,
				'spell-lists-show':0,
				'currency-show':0,
				'carried-weight-show':0,
				'loads-show':0,
				'worn-items-show':0,
				'other-items-show':0,
				'equipment-show':0,
				'npc-compimport-show':0,
				'npc-details-show':0,
				'npc-defense-show':0,
				'npc-offense-show':0,
				'npc-speed-show':0,
				'npc-repeating-weapons-show':0,
				'npc-spell-like-abilities-show':0,
				'npc-tactics-show':0,
				'npc-statistics-show':0,
				'npc-feats-show':0,
				'npc-mythic-feats-show':0,
				'npc-skills-show':0,
				'npc-ecology-show':0,
				'npc-special-abilities-show':0,
				'custom-attr-sect-a-show':0,
				'custom-attr-sect-c-show':0,
				'custom-attr-sect-b-show':0,
				'custom-attr-sect-d-show':0,
				'custom-attr-sect-n-show':0,
				'header-image-show':0,
				'sheet-import-show':0,
				'roll-template-info-show':1,
				'macros-show':1,
				'migrations-show':0,
				'cleanup-show':0,
				'buff-min-show':0,
				'buff-expand-show':0,
				'buff-column-show':0,
				'weapon-min-show':0,
				'weapon-expand-show':0,
				'weapon-column-show':0,
				'abilities-min-show':0,
				'abilities-expand-show':0,
				'abilities-column-show':0,
				'class-ability-min-show':0,
				'class-ability-expand-show':0,
				'class-ability-column-show':0,
				'feat-min-show':0,
				'feat-expand-show':0,
				'feat-column-show':0,
				'mythic-feats-min-show':0,
				'mythic-feats-expand-show':0,
				'mythic-feats-column-show':0,
				'racial-trait-min-show':0,
				'racial-trait-expand-show':0,
				'racial-trait-column-show':0,
				'traits-min-show':0,
				'traits-expand-show':0,
				'traits-column-show':0,
				'npc-spell-like-abilities-min-show':0,
				'npc-spell-like-abilities-expand-show':0,
				'npc-spell-like-abilities-column-show':0,
				'mythic-min-show':0,
				'mythic-expand-show':0,
				'mythic-column-show':0,
				'newspells-min-show':0,
				'newspells-expand-show':0,
				'newspells-column-show':0,
				'item-min-show':0,
				'item-expand-show':0,
				'item-column-show':0,
				'npcweapon-min-show':0,
				'npcweapon-expand-show':0,
				'npcweapon-column-show':0,
				'npcnewspells-min-show':0,
				'npcnewspells-expand-show':0,
				'npcnewspells-column-show':0,
				'npcfeat-min-show':0,
				'npcfeat-expand-show':0,
				'npcfeat-column-show':0,
				'npcmythic-feats-min-show':0,
				'npcmythic-feats-expand-show':0,
				'npcmythic-feats-column-show':0,
				'npc-abilities-min-show':0,
				'npc-abilities-expand-show':0,
				'npc-abilities-column-show':0,
				'npc-special-abilities-min-show':0,
				'npc-special-abilities-expand-show':0,
				'npc-special-abilities-column-show':0
			});
			//now go through repeating sections and expand those to be sure users can see them.
			_.each(PFConst.repeatingSections, function (section) {
				var rsection = "repeating_" + section;
				getSectionIDs(rsection, function (ids) {
					var setter = _.reduce(ids, function (memo, id) {
						var prefix = rsection + "_" + id + "_";
						switch (section) {
							case 'weapon':
								memo[prefix + "add-damage-show"] = 0;
								memo[prefix + "iterative-attacks-show"] = 0;
								memo[prefix + "advmacro-text-show"] = 0;
								break;
							case 'buff':
								memo[prefix + "options-show"] = 0;
								memo[prefix + "description-show"] = 0;
								break;
							case 'spells':
								memo[prefix + "spell-misc-show"] = 0;
								memo[prefix + "description-show"] = 0;
								break;
							case 'class-ability':
							case 'feat':
							case 'racial-trait':
							case 'trait':
							case 'mythic-ability':
							case 'mythic-feat':
							case 'item':
								memo[prefix + "description-show"] = 0;
								memo[prefix + "armor-attributes-show"] = 0;
								memo[prefix + "weapon-attributes-show"] = 0;
								break;
							case 'npc-spell-like-abilities':
								memo[prefix + "attack-show"] = 0;
								break;
							case 'ability':
								memo[prefix + "options-show"] = 0;
								memo[prefix + "description-show"] = 0;
								memo[prefix + "misc-show"] = 0;
								memo[prefix + "showextrafields"] = 0;
								memo[prefix + "range-show"] = 0;
								break;
						}
						memo[prefix + "row-show"] = 0;
						memo[prefix + "ids-show"] = 0;
						if (section !== 'buff'){
							memo[prefix + "macro-text-show"] = 0;
						}
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
		setAttrs({'is_newsheet':0, 'is_v1':1, 'use_advanced_options':0, 'PFSheet_Version': String((PFConst.version.toFixed(2))) },PFConst.silentParams,function(){
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
			}),oldversion);
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
				PFMigrate.migrateSpellPointFlag(null,oldversion);
			}
			if (oldversion < 1.19){
				PFAttackGrid.setTopMacros();
			}
			if (oldversion < 1.20){
				PFHealth.recalculate();
			}
			if (oldversion < 1.40){
				PFMigrate.migrateWhisperDropdowns();
				PFInventory.resetCommandMacro();
				PFAttackGrid.resetCommandMacro();
				PFAbility.resetCommandMacro();
				PFFeatures.resetCommandMacro();
				PFAttacks.recalculate();
				PFClassRaceGrid.setHitPoints();
		    }
			if (oldversion < 1.43){
				PFSpells.recalculate();
				PFSkills.resetCommandMacro();
			}
			if (oldversion < 1.5){
				PFSpells.resetSpellsTotals(null,null,null,true);
				PFInventory.updateRepeatingItems();
				PFAttacks.migrateLinkedAttacks(null,oldversion);
			}
		}
	} catch (err) {
		TAS.error("PFSheet.migrate", err);
		errorDone();
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
		PFAttacks.recalculate,
		PFHorror.recalculate
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

	PFMigrate.migrateConfigFlags(buffsOnce,oldversion);
	
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
	silently=true;
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
			character_sheet: 'Pathinder_Neceros v'+String(PFConst.version),
			PFSheet_Version: String((PFConst.version.toFixed(2))) }, PFConst.silentParams, function() {
				if (currVer < 1.17) {
					recalculate(currVer, null, false);
				}
			});
		};
		TAS.notice("Attributes at version: " + currVer);
		if (parseInt(v["recalc1"],10) ){
			//HIT RECALC
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
			currVer = -1;
			recalculate(currVer, done, true);
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
	on("change:delete_repeating_spells change:delete_repeating_weapon change:delete_repeating_item change:delete_repeating_ability change:delete_repeating_mythic-feat change:delete_repeating_mythic-ability change:delete_repeating_buff change:delete_repeating_trait change:delete_repeating_racial-trait change:delete_repeating_feat change:delete_repeating_class-ability change:delete_repeating_npc-spell-like-abilities",
	TAS.callback(function eventDeleteOldList(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
			getAttrs([eventInfo.sourceAttribute],function(v){
				var section="";
				if (parseInt(v[eventInfo.sourceAttribute],10)){
					section = eventInfo.sourceAttribute.replace('delete_repeating_','');
					SWUtils.deleteRepeating(
						function(){
							var setter;
							setter={};
							setter[eventInfo.sourceAttribute]=0;
							setter[eventInfo.sourceAttribute+'_btn']=0;
							setAttrs(setter,{silent:true});
							if ((/buff/i).test(eventInfo.sourceAttribute)){
								PFBuffs.clearBuffTotals();
							}		
						},section);
				}
			});
		}
	}));

}
registerEventHandlers();

