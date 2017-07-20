'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFInitiative from './PFInitiative';
import * as PFSpellCasterClasses from './PFSpellCasterClasses';
import * as PFSkills from './PFSkills';
import * as PFAbilityScores from './PFAbilityScores';
import * as PFSaves from './PFSaves';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFDefense from './PFDefense';
import * as PFHealth from  './PFHealth';
import * as PFChecks from './PFChecks';
import * as PFAttacks from './PFAttacks';
import * as PFEncumbrance from './PFEncumbrance';


function setPinnedGrappled(){
	PFAttackGrid.applyConditions();
	PFDefense.applyConditions();
	PFSpellCasterClasses.applyConditions();
}

/* updateGrapple Ensures Grapple and Pin are mutually exclusive */
function toggleGrappleState () {
	getAttrs(["condition-Pinned", "condition-Grappled"], function (values) {
		if (parseInt(values["condition-Pinned"],10) && parseInt(values["condition-Grappled"],10)) {
			SWUtils.setWrapper({
				"condition-Pinned": "0"
			},PFConst.silentParams,setPinnedGrappled);
		} else {
			setPinnedGrappled();
		}
	});
}
/* updatePin Ensures Grapple and Pin are mutually exclusive */
function togglePinnedState () {
	getAttrs(["condition-Pinned", "condition-Grappled"], function (values) {
		if (parseInt(values["condition-Pinned"],10) && parseInt(values["condition-Grappled"],10)) {
			SWUtils.setWrapper({
				"condition-Grappled": "0"
			},PFConst.silentParams,setPinnedGrappled);
		} else {
			setPinnedGrappled();
		}
	});
}

function setFatiguedExhausted(v){
	TAS.debug("PFConditions setFatiguedExhausted",v);
	//PFAbilityScores.applyFatiguedExhaustedDiff(null,null,v);
	//these 2 just set messages
	PFAttackGrid.applyConditions();
	PFEncumbrance.updateModifiedSpeed();		
	PFAbilityScores.applyConditions();
}

function toggleFatiguedState () {
	getAttrs(["condition-Fatigued", "condition-Exhausted",'STR-mod','STR-cond','DEX-mod','DEX-cond','STR','DEX','STR-modded','DEX-modded'], function (v) {
		v = _.mapObject(v,function(val,key){
			return parseInt(val,10)||0;
		});
		if (v['condition-Fatigued'] && v['condition-Exhausted']) {
			v['condition-Exhausted']=-3;
			SWUtils.setWrapper({
				"condition-Exhausted": "0"
			},PFConst.silentParams,function(){setFatiguedExhausted(v);});
		} else {
			if(v['condition-Fatigued']===0){
				v['condition-Fatigued']=-1;
			}
			setFatiguedExhausted(v);
		}
	});
}

function toggleExhaustedState () {
	getAttrs(["condition-Fatigued", "condition-Exhausted",'STR-mod','STR-cond','DEX-mod','DEX-cond','STR','DEX','STR-modded','DEX-modded'], function (v) {
		v = _.mapObject(v,function(val,key){
			return parseInt(val,10)||0;
		});
		if (v['condition-Fatigued'] && v['condition-Exhausted']) {
			v['condition-Fatigued']=-1;
			SWUtils.setWrapper({
				"condition-Fatigued": "0"
			},PFConst.silentParams,function(){setFatiguedExhausted(v);});
		} else {
			if(v['condition-Exhausted']===0){
				v['condition-Exhausted']=-3;
			}
			setFatiguedExhausted(v);
		}
	});
}
/* updates drain for condition status panel */
function updateDrainCheckbox (callback,silently,eventInfo) {
	var done = _.once(function () {
		//TAS.debug("leaving PFConditions.updateDrainCheckbox");
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["condition-Drained", "condition_is_drained"], function (v) {
		var levels = parseInt(v["condition-Drained"], 10) || 0,
		drained = parseInt(v["condition_is_drained"], 10) || 0;
		if (levels !== 0 && drained === 0) {
			SWUtils.setWrapper({
				"condition_is_drained": 1
			}, PFConst.silentParams, done);
		} else if (levels === 0 && drained !== 0) {
			SWUtils.setWrapper({
				"condition_is_drained": 0
			}, PFConst.silentParams,done);
		} else {
			done();
		}
	});
}
export function migrate (callback, oldversion){
	getAttrs(['migrated_fatigue_conditions','condition-Fatigued'],function(v){
		var setter={};
		if(!parseInt(v.migrate_fatigued_conditions,10)){
			if(parseInt(v['condition-Fatigued'],10)===3){
				setter['condition-Fatigued']=0;
				setter['condition-Exhausted']=3;
			}
			setter.migrate_fatigued_conditions=1;
			SWUtils.setWrapper(setter,PFConst.silentParams,callback);
		} else if (typeof callback === "function"){
			callback();
		}
	});
}

export var recalculate = TAS.callback(function PFConditionsRecalculate(callback, silently, oldversion) {
	migrate(function(){
		updateDrainCheckbox(callback);
	});
});

var events = {
	conditionEventsEither: {
		"change:condition-wounds change:has_endurance_feat change:wounds_gritty_mode": [PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions, PFDefense.applyConditions]
	},
	conditionEventsPlayer: {
		"change:condition-grappled": [toggleGrappleState],
		"change:condition-pinned": [togglePinnedState],
		"change:condition-Fatigued": [toggleFatiguedState],
		"change:condition-Exhausted": [toggleExhaustedState],
		"change:condition-sickened": [PFAttacks.updateRepeatingWeaponDamages, PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions],
		"change:condition-stunned": [PFDefense.updateDefenses, PFDefense.applyConditions],
		"change:condition-flat-footed": [PFDefense.updateDefenses],
		"change:condition-deafened": [PFInitiative.updateInitiative, PFSpellCasterClasses.applyConditions, PFChecks.applyConditions],
		"change:condition-fascinated": [PFChecks.applyConditions],
		"change:condition-entangled": [PFAbilityScores.applyConditions, PFAttackGrid.applyConditions, PFEncumbrance.updateModifiedSpeed],
		"change:condition-drained": [updateDrainCheckbox, PFHealth.updateMaxHPLookup, PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions, PFDefense.applyConditions],
		"change:condition-fear": [PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions],
		"change:condition-blinded": [PFChecks.applyConditions, PFDefense.applyConditions],
		"change:condition-cowering": [PFDefense.applyConditions],
		"change:condition-invisible": [PFDefense.updateDefenses, PFAttackGrid.applyConditions,PFChecks.applyConditions,PFDefense.applyConditions],
		"change:condition-dazzled": [PFAttackGrid.applyConditions, PFChecks.applyConditions],
		"change:condition-prone": [ PFDefense.applyConditions, PFAttackGrid.recalculateMelee],
		"change:condition-paralyzed": [PFAbilityScores.applyConditions, PFDefense.applyConditions],
		"change:condition-helpless": [PFAbilityScores.applyConditions, PFDefense.applyConditions]
	}
};

function registerEventHandlers () {
	_.each(events.conditionEventsPlayer, function (functions, eventToWatch) {
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function eventConditionEventsPlayer(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
					methodToCall(null,null,eventInfo);
				}
			}));
		});
	});
	_.each(events.conditionEventsEither, function (functions, eventToWatch) {
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function eventConditionEventsEither(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				methodToCall(null,null,eventInfo);
			}));
		});
	});
	on("change:Perception-cond", TAS.callback(function eventUpdateSkillPerceptionCond(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		PFSkills.verifyHasSkill("Perception",function(hasSkill){
			if (hasSkill){
				PFSkills.updateSkillAsync("Perception", eventInfo);
			} else {
				PFSkills.updateSkillAsync("CS-Perception", eventInfo);
			}
		});
	}));
}
registerEventHandlers();
//PFConsole.log('   PFConditions module loaded     ');
//PFLog.modulecount++;
