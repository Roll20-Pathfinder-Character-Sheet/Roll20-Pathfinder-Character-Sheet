'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
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

/* updateGrapple Ensures Grapple and Pin are mutually exclusive */
function updateGrapple () {
	getAttrs(["condition-Pinned", "condition-Grappled"], function (values) {
		if (values["condition-Pinned"] !== "0" && values["condition-Grappled"] !== "0") {
			setAttrs({
				"condition-Pinned": "0"
			});
		} else {
			//user hit either pinned and it undid grapple, or hit grapple first time.
			PFAbilityScores.applyConditions();
		}
	});
}
/* updatePin Ensures Grapple and Pin are mutually exclusive */
function updatePin () {
	getAttrs(["condition-Pinned", "condition-Grappled"], function (values) {
		if (values["condition-Pinned"] !== "0" && values["condition-Grappled"] !== "0") {
			setAttrs({
				"condition-Grappled": "0"
			});
		} else {
			//user hit grapple and it  undid pinned, or hit pinned first time.
			PFAbilityScores.applyConditions();
		}
	});
}
/* updates drain for condition status panel */
function updateDrainCheckbox (callback,silently,eventInfo) {
	var done = _.once(function () {
		TAS.debug("Leaving PFConditions.updateDrainCheckbox");
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["condition-Drained", "condition_is_drained"], function (v) {
		var levels = parseInt(v["condition-Drained"], 10) || 0,
		drained = parseInt(v["condition_is_drained"], 10) || 0;
		if (levels !== 0 && drained === 0) {
			setAttrs({
				"condition_is_drained": "1"
			}, PFConst.silentParams, done);
		} else if (levels === 0 && drained !== 0) {
			setAttrs({
				"condition_is_drained": "0"
			}, PFConst.silentParams,done);
		} else {
			done();
		}
	});
}
export var recalculate = TAS.callback(function callrecalculate(callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("Leaving PFConditions.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	});
	updateDrainCheckbox(done);
	//PFAbilityScores.applyConditions(done);
});

var events = {
	conditionEventsEither: {
		"change:condition-grappled": [updateGrapple, PFAttackGrid.applyConditions],
		"change:condition-pinned": [updatePin, PFDefense.applyConditions],
		"change:condition-wounds change:has_endurance_feat change:wounds_gritty_mode": [PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions, PFDefense.applyConditions]
	},
	conditionEventsPlayer: {
		"change:condition-Sickened": [PFAttacks.updateRepeatingWeaponDamages, PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions],
		"change:condition-stunned": [PFDefense.updateDefenses, PFDefense.applyConditions],
		"change:condition-Flat-Footed": [PFDefense.updateDefenses],
		"change:condition-deafened": [PFInitiative.updateInitiative, PFSpellCasterClasses.applyConditions],
		"change:condition-fatigued": [PFAbilityScores.applyConditions],
		"change:condition-entangled": [PFAbilityScores.applyConditions, PFAttackGrid.applyConditions],
		"change:condition-drained": [updateDrainCheckbox, PFHealth.updateMaxHPLookup, PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions, PFDefense.applyConditions],
		"change:condition-fear": [PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions],
		"change:condition-blinded": [PFChecks.applyConditions, PFDefense.applyConditions],
		"change:condition-cowering": [PFDefense.applyConditions],
		"change:condition-invisible": [PFDefense.updateDefenses, PFDefense.applyConditions, PFAttackGrid.applyConditions],
		"change:condition-dazzled": [PFAttackGrid.applyConditions],
		"change:condition-prone": [PFAttackGrid.applyConditions],
		"change:condition-Helpless": [PFAbilityScores.applyConditions]
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
				PFSkills.updateSkill("Perception", eventInfo);
			} else {
				PFSkills.updateSkill("CS-Perception", eventInfo);
			}
		});
	}));
}
registerEventHandlers();
PFConsole.log('   PFConditions module loaded     ');
PFLog.modulecount++;
