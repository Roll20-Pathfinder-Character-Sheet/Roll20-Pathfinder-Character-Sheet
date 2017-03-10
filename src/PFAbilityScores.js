'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog, PFConsole} from './PFLog';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils from './PFUtils';

export var abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
export var abilitymods = ["STR-mod", "DEX-mod", "CON-mod", "INT-mod", "WIS-mod", "CHA-mod"];
var columnMods = [ "-base",  "-enhance",  "-inherent",  "-misc",  "-damage",  "-penalty",  "-drain",  "-mod",  "-cond",  "-modded"],
columnBuffMods = [  "-total",  "-total_penalty"],
columnModHelpers=[ "condition-Helpless"],
/** map of event types to event string for 'on' function to look for */
events = {
    abilityEventsAuto: "change:REPLACE-cond", //buffs events handled in PFBuffs
    abilityEventsPlayer: "change:REPLACE-base change:REPLACE-enhance change:REPLACE-inherent change:REPLACE-misc change:REPLACE-temp change:REPLACE-damage change:REPLACE-penalty change:REPLACE-drain"
};


export function getAttributes (ability){
    var fields = _.map(columnMods,function(col){return ability+col;});
    fields.push(ability);
    fields = fields.concat( _.map(columnBuffMods,function(col){
        return 'buff_'+ability+col;
    }));
    fields = fields.concat(columnModHelpers);
    return fields;
}

export function getAllAttributes (){
    var fields = SWUtils.cartesianAppend(abilities,columnMods);
    fields = fields.concat(abilities);
    fields = fields.concat(SWUtils.cartesianAppend(['buff_'],abilities,columnBuffMods));
    fields = fields.concat(columnModHelpers);
    return fields;
}

/** Looks at current values and calculates new ability , ability-mod and ability-modded values
 * @param {string} ability string matching a value in abilities
 * @param {Map} values map of return values from getAttrs
 * @param {Map} setter map of values to pass to setAttrs. or null
 * @returns {Map}  same setter passed in, with added values if necessary
 */
function getAbilityScore (ability, values, setter) {
    var base = 0,
    newVal = 0,
    rawDmg = 0,
    rawPen = 0,
    dmgAndPen = 0,
    rawCond = 0,
    helpless = 0,
    penalized = 0,
    rawDmgAndPen = 0,
    currAbility = 0,
    currMod = 0,
    currPenalized = 0,
    mod = 0;
    try {
        setter = setter || {};
        base = parseInt(values[ability + "-base"], 10);
        //if NaN, make sure it's either empty or has a minus
        if (isNaN(base) && !PFConst.minusreg.test(values[ability+'-base']) ){
            return setter;
        }
        currMod = parseInt(values[ability + "-mod"], 10);
        currPenalized = parseInt(values[ability+"-modded"],10)||0;
        currAbility = parseInt(values[ability], 10);
        if (isNaN(base)) {
            newVal = "-";
            mod = 0;
            penalized = 0;
        } else {
            helpless = parseInt(values["condition-Helpless"], 10) || 0;
            if (ability === "DEX" && helpless) {
                newVal = 0;
                mod = -5;
                penalized = 1;
            } else {
                newVal = base + (parseInt(values[ability + "-enhance"], 10) || 0) + 
                    (parseInt(values[ability + "-inherent"], 10) || 0) + (parseInt(values[ability + "-misc"], 10) || 0) + 
                    (parseInt(values[ability + "-drain"], 10) || 0) + (parseInt(values["buff_" + ability + "-total"], 10) || 0);
                rawDmg = Math.abs(parseInt(values[ability + "-damage"], 10) || 0);
                if (rawDmg >= newVal || newVal <= 0) {
                    newVal = 0;
                    mod = -5;
                    penalized = 1;
                } else {
                    rawPen = Math.abs(parseInt(values[ability + "-penalty"], 10) || 0) + Math.abs(parseInt(values["buff_" + ability + "-total_penalty"], 10) || 0);
                    rawCond = Math.abs(parseInt(values[ability + "-cond"], 10) || 0);
                    rawDmgAndPen = rawDmg + rawPen + rawCond;
                    if (rawDmgAndPen >= newVal ) {
                        newVal = currAbility;
                        mod = -5;
                        penalized = 1;
                    } else {
                        //normal
                        if (rawDmgAndPen !== 0) {
                            penalized = 1;					
                        }
                        dmgAndPen = Math.floor(rawDmgAndPen / 2);
                        mod = Math.max(-5,Math.floor((newVal - 10) / 2) - dmgAndPen);
                    }
                }
            }
        }
        if (currAbility !== newVal ) {
            setter[ability] = newVal;
        }
        if (currMod !== mod || isNaN(currMod)) {
            setter[ability + "-mod"] = mod;
        }
        if (penalized !== currPenalized){
            setter[ability + "-modded"] = penalized;
        }
    } catch (err) {
        TAS.error("updateAbilityScore:" + ability, err);
    } finally {
        return setter;
    }
}

/** updateAbilityScore - Updates the final ability score, ability modifier, condition column based on entries in ability grid plus conditions and buffs.
 * Note: Ability value is not affected by damage and penalties, instead only modifier is affected.
 * @param {string} ability 3 letter abbreviation for one of the 6 ability scores, member of PFAbilityScores.abilities
 * @param {eventInfo} eventInfo unused eventinfo from 'on' method
 * @param {function} callback when done
 * @param {boolean} silently if silent:true or not
 */
function updateAbilityScore (ability,eventInfo,callback,silently){
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    fields = getAttributes(ability);
    getAttrs(fields,function(v){
        var params = {}, setter={};
        getAbilityScore(ability,v,setter);
        if (_.size(setter) ) {
            if (silently) {
                params = PFConst.silentParams;
            }
            setAttrs(setter, params, done);
        } else {
            done();
        }
    });
}
/** calls getAbilityScore for all abilities
 * @param {function} callback when done
 * @param {boolean} silently if silent:true or not
 */
function updateAbilityScores (callback, silently) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    fields = getAllAttributes();
    getAttrs(fields,function(v){
        var params = {}, setter={};
        setter = _.reduce(abilities,function(m,a){
                getAbilityScore(a,v,m);
                return m;
            },{});
        if (_.size(setter) ) {
            if (silently) {
                params = PFConst.silentParams;
            }
            setAttrs(setter, params, done);
        } else {
            done();
        }
    });
}

/** Sets ability penalties, not "ability check" penalties 
 * Sets DEX-cond and STR-cond for fatigued, entangled, and grappled  
 *@param {function} callback to call when done.
 *@param {boolean} silently if true update with PFConst.silentParams
 */
export function applyConditions (callback, silently) {
    //TAS.debug("at PFAbilityScores.applyConditions");
    getAttrs(["STR-cond", "DEX-cond", "condition-Fatigued", "condition-Entangled", "condition-Grappled", "condition-Helpless"], function (v) {
        var done = function () {
            if (typeof callback === "function") {
                callback();
            }
        },
        setter = {},
        params = {},
        helpless = parseInt(v["condition-Helpless"], 10) || 0,
        strMod = parseInt(v["condition-Fatigued"], 10) || 0,
        dexMod = 0,
        dexAbMod = 0,
        strAbMod = 0;
        try {
            dexMod = strMod + (parseInt(v["condition-Entangled"], 10) || 0) + (parseInt(v["condition-Grappled"], 10) || 0);
            dexAbMod = dexMod * -2;
            strAbMod = strMod * -2;
            if (!helpless) {
                if (dexAbMod !== (parseInt(v["DEX-cond"], 10) || 0)) {
                    setter["DEX-cond"] = dexAbMod;
                }
                if (strAbMod !== (parseInt(v["STR-cond"], 10) || 0)) {
                    setter["STR-cond"] = strAbMod;
                }
            } else {
                setter["DEX"] = 0;
                setter["DEX-mod"] = -5;
            }
        } catch (err) {
            TAS.error("PFAbilityScores.applyConditions", err);
        } finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                setAttrs(setter, params, done);
            } else {
                done();
            }
        }
    });
}
/** migrate (currently empty just calls callback
 * @param {function} callback when done
 * @param {Number} oldversion
 */
export function migrate (callback,oldversion){
    if (typeof callback === "function"){
        callback();
    }
}
/** recalculates all attributes written to by this module.
 *@param {function()} callback to call when done.
 *@param {boolean} silently if true update with PFConst.silentParams
 *@param {float} oldversion the current @{PFVersion} in the attributes
 */
export function recalculate (callback, silently, oldversion) {
    var done = _.once(function () {
        TAS.debug("leaving PFAbilityScores.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    }),
    updateScoresOnce = _.once(function () {
        updateAbilityScores(done, silently);
    });
    applyConditions(updateScoresOnce, silently);
}

/** Calls 'on' function for everything related to this module */
function registerEventHandlers () {
    //register event handlers **********************************************
    _.each(abilities, function (ability) {
        on((events.abilityEventsAuto.replace(/REPLACE/g, ability)), TAS.callback(function eventUpdateAbility(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            if (eventInfo.sourceType === "sheetworker") {
                updateAbilityScore(ability, eventInfo);
            }
        }));
        on((events.abilityEventsPlayer.replace(/REPLACE/g, ability)), TAS.callback(function eventUpdateAbilityPlayerUpdated(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                updateAbilityScore(ability, eventInfo);
            }
        }));
    });
    on("change:condition-Helpless", TAS.callback(function eventUpdateAbilityHelpless(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateAbilityScore("DEX", eventInfo);
        }
    }));
}
registerEventHandlers();
PFConsole.log('   PFAbilityScores module loaded  ');
PFLog.modulecount++;
