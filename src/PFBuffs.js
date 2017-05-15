'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFAbilityScores from './PFAbilityScores';
import * as PFSaves from './PFSaves';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFDefense from './PFDefense';
import * as PFHealth from  './PFHealth';
import * as PFChecks from './PFChecks';

var buffColumns = PFAbilityScores.abilities.concat(["Ranged", "Melee", "DMG", "AC", "Touch", "CMD", "HP-temp", "Fort", "Will", "Ref", "Check", "CasterLevel"]),
events = {
	// events pass in the column updated macro-text is "either", buffs are auto only
	buffTotalNonAbilityEvents: {
		//ranged and attack are in the PFAttackGrid module
		"Fort": [PFSaves.updateSave],
		"Will": [PFSaves.updateSave],
		"Ref": [PFSaves.updateSave]
	},
	buffTotalAbilityEvents: {
		"STR": [PFAbilityScores.updateAbilityScore],
		"DEX": [PFAbilityScores.updateAbilityScore],
		"CON": [PFAbilityScores.updateAbilityScore],
		"INT": [PFAbilityScores.updateAbilityScore],
		"WIS": [PFAbilityScores.updateAbilityScore],
		"CHA": [PFAbilityScores.updateAbilityScore]
	},
	// events do NOT pass in column updated
	buffTotalEventsNoParam: {
		"Melee": [PFAttackGrid.updateMelee],
		"Ranged": [PFAttackGrid.updateRanged],
		"DMG": [PFAttackGrid.updateDamage],
		"AC": [PFDefense.updateDefenses],
		"Touch": [PFDefense.updateDefenses],
		"CMD": [PFDefense.updateDefenses],
		"HP-temp": [PFHealth.updateTempMaxHP],
		"Check": [PFChecks.applyConditions]
	}
},
//why did i make this? it just repeats the ability scores
allBuffColumns = buffColumns; //buffColumns.concat(PFAbilityScores.abilities),
/* this is so old no one will be using it*/
export function migrate (outerCallback) {
	var done = _.once(function () {
		TAS.debug("leaving PFBuffs.migrate");
		if (typeof outerCallback === "function") {
			outerCallback();
		}
	});
	getAttrs(["migrated_buffs", "migrated_effects"], function (v) {
		var setter = {};
		try {
			if (parseInt(v.migrated_buffs,10)!==1) {
				setter.migrated_buffs = 1;
			}
			if (parseInt(v.migrated_effects,10)!==1) {
				setter.migrated_effects = 1;
			}
		} catch (err) {
			TAS.error("PFBuffs.migrate", err);
		} finally {
			if (_.size(setter) > 0) {
				setAttrs(setter, {
					silent: true
				}, done);
			} else {
				done();
			}
		}
	});
}
/** createTotalBuffEntry - used by parseNPC
 * adds enabled buff for a new sheet where this is the only buff so sets total as well.
 * adds attributes to array passed in
 * @param {string} name name of buff row  for buff-name
 * @param {string} bufftype  -string from buffColumns
 * @param {string} buffmacro ?
 * @param {number} modamount - value for the buff
 * @param {map} newRowAttrs - object of {name:value} to pass to setAttrs
 * @returns {map} return newRowAttrs after adding maps to it.
 */
export function createTotalBuffEntry (name, bufftype, buffmacro, modamount, newRowAttrs) {
	var newRowId = generateRowID();
	newRowAttrs = newRowAttrs||{};
	newRowAttrs["repeating_buff_" + newRowId + "_buff-name"] = name;
	newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype + "_macro-text"] = buffmacro;
	newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype] = modamount;
	newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype + "-show"] = "1";
	newRowAttrs["repeating_buff_" + newRowId + "_buff-enable_toggle"] = "1";
	newRowAttrs["buff_" + bufftype + "-total"] = modamount;
	return newRowAttrs;
}
function resetStatuspanel (callback) {
	var done = _.once(function () { if (typeof callback === "function") { callback(); } }),
	buffTotalsColumns, fields;
	try {
		buffTotalsColumns = _.extend(
		_.map(allBuffColumns, function (col) {
			return "buff_" + col + "-total";
		}),
		_.map(PFAbilityScores.abilities, function (col) {
			return "buff_" + col + "-total_penalty";
		})
		);
		fields = SWUtils.cartesianAppend(["buff_"], buffColumns, ["-total", "_exists"]).concat(
			SWUtils.cartesianAppend(["buff_"], PFAbilityScores.abilities, ["-total", "-total_penalty", "_exists", "_penalty_exists"])
		);
		getAttrs(fields, function (v) {
			var setter = {};
			try {
				setter = _.reduce(allBuffColumns, function (memo, col) {
					var val, field, exists;
					try {
						val = parseInt(v["buff_" + col + "-total"], 10) || 0; field = "buff_" + col + "_exists"; exists = parseInt(v[field], 10) || 0;
						if (val !== 0 && !exists) {
							memo[field] = "1";
						} else if (val === 0 && exists) {
							memo[field] = "";
						}
					} catch (erri1) { } finally {
						return memo;
					}
				}, setter);
				setter = _.reduce(PFAbilityScores.abilities, function (memo, col) {
					var val, field, exists;
					try {
						val = parseInt(v["buff_" + col + "-total_penalty"], 10) || 0; field = "buff_" + col + "_penalty_exists"; exists = parseInt(v[field], 10) || 0;
						if (val !== 0 && !exists) {
							memo[field] = "1";
						} else if (val === 0 && exists) {
							memo[field] = "";
						}
					} catch (erri1) { } finally {
						return memo;
					}
				}, setter);
			} catch (err) {
				TAS.error("PFBuffs.resetStatuspanel error inside calculate exists", err);
			} finally {
				if (_.size(setter) > 0) {
					setAttrs(setter, { silent: true }, done);
				} else {
					done();
				}
			}
		});
	} catch (errO) {
		TAS.error("PFBuffs.resetStatuspanel error creating field array, abort:", errO);
		done();
	}
}
/* Sets 1 or 0 for buffexists in status panel - only called by updateBuffTotals. */

/** NO LONGER USED but keep since we're redoing buffs soon
 * Updates buff_<col>_exists checkbox if the val paramter has a nonzero value
 * also switches it off
 * @param {string} col column name of buff to check
 * @param {int} val value of the buff
 */
function toggleBuffStatusPanel (col, val) {
	var field = "buff_" + col + "_exists";
	getAttrs([field], function (v) {
		var setter = {};
		try {
			if (val && parseInt(v[field],10)!==1) {
				setter[field] = "1";
			} else if (!val && parseInt(v[field],10)===1) {
				setter[field] = "";
			}
		} catch (err) {
			TAS.error("PFBuffs.toggleBuffStatusPanel", err);
		} finally {
			if (_.size(setter) > 0) {
				setAttrs(setter, { silent: true });
			}
		}
	});
}
function updateBuffTotals (col, callback) {
	var done = _.once(function () {
		TAS.debug("leaving PFBuffs.updateBuffTotals");
		if (typeof callback === "function") {
			callback();
		}
	}),
	isAbility = (PFAbilityScores.abilities.indexOf(col) >= 0);
	try {
		TAS.repeating('buff').attrs('buff_' + col + '-total', 'buff_' + col + '-total_penalty', 'buff_'+col+'_exists', 'buff_'+col+'_penalty_exists').fields('buff-' + col, 'buff-enable_toggle', 'buff-' + col + '-show').reduce(function (m, r) {
			try {
				var tempM = (r.I['buff-' + col] * ((r.I['buff-enable_toggle']||0) & (r.I['buff-' + col + '-show']||0)));
				tempM=tempM||0;
				if (!(isAbility && tempM < 0)) {
					m.mod += tempM;
				} else {
					m.pen += tempM;
				}
			} catch (err) {
				TAS.error("PFBuffs.updateBuffTotals error:" + col, err);
			} finally {
				return m;
			}
		}, {
			mod: 0,
			pen: 0
		}, function (m, r, a) {
			try {
				//TAS.debug('setting buff_' + col + '-total to '+ (m.mod||0));
				a.S['buff_' + col + '-total'] = m.mod||0;
				if (m.mod){
					a.S['buff_' + col + '_exists'] = 1;
				} else if (a.I['buff_' + col + '_exists']) {
					a.S['buff_'+ col + '_exists'] = 0;
				}
				//toggleBuffStatusPanel(col, m.mod);
				if (isAbility) {
					a.S['buff_' + col + '-total_penalty'] = m.pen||0;
					//TAS.debug("now also check ability penalty status");
					//toggleBuffStatusPanel(col + "_penalty", m.pen);
					if (m.pen){
						a.S['buff_' + col + '_penalty_exists'] = 1;
					} else {
						a.S['buff_'+ col + '_penalty_exists'] = 0;
					}
				}
			} catch (errfinalset){
				TAS.error("error setting buff_" + col + "-total");
			}
		}).execute(done);
	} catch (err2) {
		TAS.error("PFBuffs.updateBuffTotals error:" + col, err2);
		done();
	}
}
export function clearBuffTotals(callback){
	var fields;
	fields = SWUtils.cartesianAppend(['buff_'],buffColumns,['-total','_exists']);
	fields = fields.concat(SWUtils.cartesianAppend(['buff_'],PFAbilityScores.abilities,['-total_penalty','_penalty_exists']));
	TAS.debug("PFBuffs.clearBuffTotals getting fields:",fields);
	getAttrs(fields,function(v){
		var setter={};
		TAS.notice("PFBuffs.clearBuffTotals we got back the following: ",v);
		setter = _.reduce(v,function(memo,val,attr){
			if ((/exists/).test(attr)){
				if (parseInt(val,10)){
					memo[attr]=0;
				}
			} else if (parseInt(val,10) || typeof val === "undefined"){
				memo[attr]=0;
			}
			return memo;
		},{});
		if (_.size(setter)){
			TAS.debug("PFBuffs.clearBuffTotals, setting",setter);
			setAttrs(setter,{},callback);
		} else {
			if (typeof callback ==="function"){
				callback();
			}
		}
	});
}
function setBuff (id, col, callback, silently) {
	var done = function () {
		if (typeof callback === "function") {
			callback();
		}
	},
	idStr = SWUtils.getRepeatingIDStr(id),
	prefix = "" , setted;
	prefix = "repeating_buff_" + idStr + "buff-" + col;
	setted = function(newval,oldval,changed){
		if(changed){
			updateBuffTotals(col,done);
		} else {
			done();
		}
	};
	SWUtils.evaluateAndSetNumber(prefix + "_macro-text", prefix,0,setted,true,done);
}
export function recalculate (callback, silently, oldversion) {
	var done = _.once(function () {
		resetStatuspanel();
		TAS.debug("Leaving PFBuffs.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	}),
	numColumns = _.size(allBuffColumns),
	columnDone = _.after(numColumns, done),
	colsDoneCount = 0,
	recalculateBuffColumn = function (ids, col) {
		var rowtotal = _.size(ids),
			totalItUp = _.once(function () {
				colsDoneCount++;
				updateBuffTotals(col, columnDone);
			}),
			rowDone;
		if (rowtotal <=0){
			totalItUp();
			return;
		}
		rowDone = _.after(rowtotal, function () {
			totalItUp();
		});
		try {
			_.each(ids, function (id) {
				try {
					getAttrs(['repeating_buff_'+id+'_buff-enable_toggle',
					'repeating_buff_'+id+'_buff-' + col + '-show'],function(v){
						if (parseInt(v['repeating_buff_'+id+'_buff-enable_toggle'],10) && 
							parseInt(v['repeating_buff_'+id+'_buff-' + col + '-show'],10) ) {
								setBuff(id, col, rowDone, silently);
						} else {
							rowDone();
						}
					});
				} catch (err) {
					TAS.error("PFBuffs.recalculate_recalculateBuffColumn:" + col + ", rowid" + id, err);
					rowDone();
				}
			});
		} catch (err2) {
			TAS.error("PFBuffs.recalculate_recalculateBuffColumn OUTER error:" + col, err2);
			totalItUp();
		}
	};
	getSectionIDs("repeating_buff", function (ids) {
		//TAS.debug("pfbuffsrecalculate there are " + _.size(ids) + " rows and " + numColumns + " columns");
		try {
			if (_.size(ids) > 0) {
				_.each(allBuffColumns, function (col) {
					recalculateBuffColumn(ids, col);
				});
			} else {
				_.each(allBuffColumns, function (col) {
					updateBuffTotals(col, columnDone, silently);
				});
			}
		} catch (err) {
			TAS.error("PFBuffs.recalculate_recalcbuffs", err);
			//what to do? just quit
			done();
		}
	});
}
function registerEventHandlers () {
	//BUFFS
	_.each(buffColumns, function (col) {
		//Evaluate macro text upon change
		var prefix = "change:repeating_buff:buff-" + col ;
		on(prefix + "_macro-text", TAS.callback(function eventBuffMacroText(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " for column " + col + ", event: " + eventInfo.sourceType);
			setBuff(null, col);
		}));
		//Update total for a buff upon Mod change
		on(prefix, TAS.callback(function PFBuffs_updateBuffRowVal(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType === "sheetworker" ) {
				updateBuffTotals(col);
			}
		}));
		on(prefix + "-show", TAS.callback(function PFBuffs_updateBuffRowShowBuff(eventInfo) {
			var id;
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				id = SWUtils.getRowId(eventInfo.sourceAttribute)||'';
				updateBuffTotals(col);
			}
		}));		
	});
	on("change:repeating_buff:buff-enable_toggle remove:repeating_buff", TAS.callback(function PFBuffs_updateBuffTotalsToggle(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			_.each(buffColumns, function (col) {
				updateBuffTotals(col);
			});
		}
	}));
	//generic easy buff total updates
	_.each(events.buffTotalNonAbilityEvents, function (functions, col) {
		var eventToWatch = "change:buff_" + col + "-total";
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function event_updateBuffNonAbilityEvents(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker") {
					methodToCall(col, eventInfo);
				}
			}));
		});
	});
	_.each(events.buffTotalAbilityEvents, function (functions, col) {
		var eventToWatch = "change:buff_" + col + "-total change:buff_" + col + "-total_penalty";
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function event_updateBuffAbilityEvents(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker") {
					methodToCall(col, eventInfo);
				}
			}));
		});
	});
	_.each(events.buffTotalEventsNoParam, function (functions, col) {
		var eventToWatch = "change:buff_" + col + "-total";
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function eventBuffTotalNoParam(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker") {
					methodToCall(null,false, eventInfo);
				}
			}));
		});
	});
}
registerEventHandlers();
PFConsole.log('   PFBuffs module loaded          ');
PFLog.modulecount++;
