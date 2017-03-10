'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
import * as PFMigrate from './PFMigrate';
import * as PFClassRaceGrid from './PFClassRaceGrid';

/*setWoundLevel sets would level based on current HP when you already have all fields.
* sets  @{condition-Wounds} based on :
*@hp current hp
*@grazed {int} hp  value for grazed level
*@wounded {int} hp value for wounded level
*@critical {int} hp value for critical level
*@currWounds {int}  value of @{condition-Wounds}
*/
function setWoundLevel (hp, grazed, wounded, critical, currWounds) {
	var setWounds = 0;
	if (hp <= grazed) {
		if (hp > wounded) {
			setWounds = 1;
		} else if (hp > critical) {
			setWounds = 2;
		} else {
			setWounds = 3;
		}
	}
	//TAS.debug("PFHealth.setWoundLevel, hp:"+hp+", currWounds:"+currWounds+", setWounds:"+setWounds);
	if (setWounds !== currWounds) {
		setAttrs({
			"condition-Wounds": setWounds
		});
	}
}
/*setWoundLevelLookup - looks up data needed to set current would level.
* calls setWoundLevel
* @hp {int} the current hit points. will look up if this is not set.
*/
function setWoundLevelLookup (hp) {
	//TAS.debug"PFHealth.setWoundLevelLookup, hp passed in is:" + hp);
	getAttrs(["HP", "HP_grazed", "HP_wounded", "HP_critical", "condition-Wounds"], function (v) {
		if (isNaN(parseInt(hp, 10))) {
			hp = parseInt(v["HP"], 10) || 0;
		}
		//TAS.debug("PFHealth.setWoundLevelLookup",v);
		setWoundLevel(hp, parseInt(v["HP_grazed"], 10) || 0, parseInt(v["HP_wounded"], 10) || 0, parseInt(v["HP_critical"], 10) || 0, parseInt(v["condition-Wounds"], 10) || 0);
	});
}
/*setWoundThreshholds - sets wound thresholds when you already have hp data.
* Also calls setWoundLevel
* @hp {int} = current hit points @{HP}
* @maxHP {int} = max hp @{HP|max}
* @currWoundLevel {int} = @{condition-Wounds}
* @abilityMod {int} = usually @{CON-mod} or mod of whataver ability is used. 0 if no ability (like undead)
*/
function setWoundThreshholds (hp, maxHP, currWoundLevel, abilityMod) {
	var grazed = Math.floor(maxHP * 0.75),
	wounded = Math.floor(maxHP * 0.5),
	critical = Math.floor(maxHP * 0.25),
	disabled = ((abilityMod > 0 ? abilityMod : 0) * -1);
	getAttrs(["HP_grazed", "HP_wounded", "HP_critical", "HP_disabled"], function (v) {
		var setter = {};
		if ((parseInt(v["HP_grazed"], 10) || 0) !== grazed) {
			setter["HP_grazed"] = grazed;
		}
		if ((parseInt(v["HP_wounded"], 10) || 0) !== wounded) {
			setter["HP_wounded"] = wounded;
		}
		if ((parseInt(v["HP_critical"], 10) || 0) !== critical) {
			setter["HP_critical"] = critical;
		}
		if ((parseInt(v["HP_disabled"], 10) || 0) !== disabled) {
			setter["HP_disabled"] = disabled;
		}
		if (_.size(setter) > 0) {
			setAttrs(setter, PFConst.silentParams);
		}
	});
	setWoundLevel(hp, grazed, wounded, critical, currWoundLevel);
}
/*setWoundThreshholdsLookup
* Sets wound thresholds by looking up values for "are we even useing wound threshold rules?" and the max hit points.
* Calls the other setWoundThresholds
* If Wound Threshholds are not used, makes sure that condition-Wounds is set to 0.
*/
function setWoundThreshholdsLookup (eventInfo) {
	getAttrs(["HP", "HP_max", "wound_threshold-show", "condition-Wounds", "HP-ability-mod"], function (v) {
		if (parseInt(v["wound_threshold-show"],10)===1){
			setWoundThreshholds(parseInt(v["HP"], 10) || 0, parseInt(v["HP_max"], 10) || 0, parseInt(v["condition-Wounds"], 10) || 0, parseInt(v["HP-ability-mod"], 10) || 0);
		} else if ((parseInt(v["condition-Wounds"], 10) || 0) > 0) {
			setAttrs({
				"condition-Wounds": "0"
			});
		}
	});
}
/** updateCurrHP- when updating hp, check nonLethalDmg level and wound threshold levels
 * 
 * @param {int} hp 
 * @param {int} temphp 
 * @param {int} nonLethalDmg 
 * @param {boolean} usesWounds 
 * @param {string} hpAbility value of hp dropdown 
 * @param {int} hpAbilityMod 
 * @param {boolean} staggered 
 */ 
function updateCurrHP (hp, temphp, nonLethalDmg, usesWounds, hpAbility, hpAbilityMod, staggered) {
	if (hpAbility !== "0") {
		if (nonLethalDmg >= (hp + temphp + (usesWounds ? (1 + hpAbilityMod) : 0))) {
			setAttrs({
				"condition-Staggered": "1"
			});
		} else if (staggered ) {
			setAttrs({
				"condition-Staggered": "0"
			});
		}
	}
	if (usesWounds) {
		setWoundLevelLookup(hp);
	}
}
/* updateCurrHPLookup - looks up data and calls updateCurrHP */
function updateCurrHPLookup () {
	getAttrs(["HP", "HP-temp", "non-lethal-damage", "wound_threshold-show", "HP-ability", "HP-ability-mod", "condition-Staggered"], function (v) {
		//TAS.debug("PFHealth.updateCurrHPLookup",v);
		updateCurrHP(parseInt(v["HP"], 10) || 0, parseInt(v["HP-temp"], 10) || 0, 
		 parseInt(v["non-lethal-damage"], 10) || 0, parseInt(v["wound_threshold-show"],10)||0, 
		  v["HP-ability"], parseInt(v["HP-ability-mod"], 10) || 0,parseInt( v["condition-Staggered"],10)||0);
	});
}
/** updateMaxHPLookup
* sets max HP
* @param {function} callback when done
* @param {boolean} silently if T then call setAttrs with {silent:True}
* @param {boolean} forceReset recalculates max HP and sets HP to it.
* @param {object} eventInfo unused
*/
function updateMaxHPLookup (callback, silently,forceReset,eventInfo) {
	var done = _.once(function () {
		TAS.debug("leaving updateMaxHPLookup");
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["HP", "HP_max", "HP-ability", "HP-ability-mod", "level", "total-hp", "total-mythic-hp", "condition-Drained", "HP-formula-mod", "HP-temp", "mythic-adventures-show", "wound_threshold-show", 
		"condition-Wounds", "non-lethal-damage", "condition-Staggered", "hp_ability_bonus"], function (v) {
		var abilityMod = parseInt(v["HP-ability-mod"], 10) || 0,
		abilityBonus = (abilityMod * (parseInt(v["level"], 10) || 0)),
		currHPMax = parseInt(v["HP_max"], 10) || 0,
		currHP = parseInt(v["HP"], 10) || 0,
		tempHP = parseInt(v["HP-temp"], 10) || 0,
		nonLethal = parseInt(v["non-lethal-damage"], 10) || 0,
		newHPMax = 0,
		mythic = 0,
		currWoundLevel = 0,
		usesWounds = 0,
		setter={};
		try {
			mythic = parseInt(v["mythic-adventures-show"],10)||0;
			//TAS.debug("at updateMaxHPLookup",v);
			newHPMax = (abilityBonus + (parseInt(v["total-hp"], 10) || 0) + 
				(parseInt(v["HP-formula-mod"], 10) || 0) + 
				(5 * (parseInt(v["condition-Drained"], 10) || 0))) + 
				(mythic ? (parseInt(v["total-mythic-hp"], 10) || 0) : 0);
			if (forceReset || currHPMax !== newHPMax) {
				setter = {
					"HP_max": newHPMax,
					"non-lethal-damage_max": newHPMax,
					"hp_ability_bonus": abilityBonus
				};
				if (forceReset) {
					setter["HP"]=newHPMax;
					currHP=newHPMax;
					if (nonLethal !== 0){
						nonLethal=0;
						setter["condition-Staggered"] = 0;
						setter["non-lethal-damage"] = 0;
					}
				}
				usesWounds= parseInt(v["wound_threshold-show"],10)||0;
				if (usesWounds) {
					if (forceReset){
						setter["condition-Wounds"] = 0;
						currWoundLevel = 0;
					} else {
						currWoundLevel = (parseInt(v["condition-Wounds"], 10) || 0);
					}
					if (currHPMax !== newHPMax){
						setWoundThreshholds(currHP + tempHP, newHPMax, currWoundLevel, abilityMod);
					}
				}
			}
		} catch (err) {
			TAS.error("PFHealth.updateMaxHPLookup", err);
		} finally {
			if (_.size(setter)>0){
				setAttrs(setter, PFConst.silentParams, done);
			} else {
				done();
			}
		}
	});
}
/* updateTempMaxHP
* sets temp hp
*/
function updateTempMaxHP (callback, silently,forceReset) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["HP-temp", "HP-temp_max", "HP-temp-misc", "buff_HP-temp-total"], function (v) {
		var newHPTempMax,
		currHPTemp,
		newHPTemp,
		params = {};
		try {
			//TAS.debug("at updateTempMaxHP",v);
			newHPTempMax = (parseInt(v["HP-temp-misc"], 10) || 0) + (parseInt(v["buff_HP-temp-total"], 10) || 0);
			currHPTemp = parseInt(v["HP-temp"], 10) || 0;
			newHPTemp = forceReset ? newHPTempMax : (currHPTemp + newHPTempMax - currHPTemp);
			if (forceReset || newHPTemp !== currHPTemp) {
				if (silently) {
					params = PFConst.silentParams;
				}
				setAttrs({
					"HP-temp": newHPTemp,
					"HP-temp_max": newHPTempMax
				}, params, function () {
					updateCurrHPLookup(); //check for change due to non lethal
					done();
				});
			} else {
				done();
			}
		} catch (err) {
			TAS.error("updateTempMaxHP", err);
			done();
		}
	});
}
function setToPFS (callback,eventInfo){
	var done = _.once(function(){
		if (typeof callback === "function"){
			callback();
		}
	});
	setAttrs({'use_prestige_fame':1, 'auto_calc_hp':1, 'autohp_percent':1,'maxhp_lvl1':1},
	PFConst.silentParams, function (){
		if (eventInfo){
			PFClassRaceGrid.autoCalcClassHpGrid(done,false,eventInfo);
		}
	});
}
export function migrate (callback, oldversion){
	var done = _.once(function(){
		TAS.debug("leaving PFHealth.migrate 2");
		if (typeof callback === "function"){
			callback();
		}
	});
	PFMigrate.migrateHPMisc(done);
}
export function recalculate (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("leaving PFHealth.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	}),
	callUpdateMaxHPLookup = _.once(function () {
		updateMaxHPLookup(done, silently);
	}),
	callUpdateTempHP = _.once(function () {
		updateTempMaxHP(callUpdateMaxHPLookup);
	});
	TAS.debug("at PFHealth.recalculate");
	migrate(callUpdateTempHP,oldversion);
}
function registerEventHandlers () {
	on("change:set_pfs",TAS.callback(function eventsetPFSFlag(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if(eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			getAttrs(["set_pfs"],function(v){
				if (parseInt(v.set_pfs,10)){
					setToPFS(null,eventInfo);
				}
			});
		}
	}));
	//hp************************************************************************
	on("change:hp-ability-mod change:level change:total-hp change:total-mythic-hp change:hp-formula-mod change:HP-misc", TAS.callback(function eventUpdateHPPlayerMisc(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && eventInfo.sourceAttribute !== "hp-misc")) {
			updateMaxHPLookup();
		}
	}));
	on("change:mythic-adventures-show", TAS.callback(function eventUpdateHPPlayer(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			getAttrs(["total-mythic-hp"], function (v) {
				if ((parseInt(v["total-mythic-hp"], 10) || 0) > 0) {
					updateMaxHPLookup();
				}
			});
		}
	}));
	on("change:hp-temp-misc", TAS.callback(function eventUpdateTempHP(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			updateTempMaxHP();
		}
	}));
	on("change:HP_reset", TAS.callback(function eventResetHP(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			updateMaxHPLookup(null,null,true);
			updateTempMaxHP(null,null,true);
			setAttrs({
				"HP_reset": "0"
			}, PFConst.silentParams);
		}
	}));
	on("change:HP change:non-lethal-damage", TAS.callback(function eventUpdateHPCurr(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateCurrHPLookup(eventInfo);
		}
	}));
	on("change:wound_threshold-show", TAS.callback(function eventResetConditionWounds(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			setWoundThreshholdsLookup(eventInfo);
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFHealth module loaded         ');
PFLog.modulecount++;
