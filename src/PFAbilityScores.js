'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog,PFConsole} from './PFLog';
import PFConst from './PFConst';
import * as PFUtils from './PFUtils';

export var abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
export var abilitymods = ["STR-mod", "DEX-mod", "CON-mod", "INT-mod", "WIS-mod", "CHA-mod"];
/** map of event types to event string for 'on' function to look for */
var events = {
    abilityEventsAuto: "change:REPLACE-cond",
    abilityEventsPlayer: "change:REPLACE-base change:REPLACE-enhance change:REPLACE-inherent change:REPLACE-misc change:REPLACE-temp change:REPLACE-damage change:REPLACE-penalty change:REPLACE-drain"
};

/** updateAbilityScore - Updates the final ability score, ability modifier, condition column based on entries in ability grid plus conditions and buffs.
 * Note: Ability value is not affected by damage and penalties, instead only modifier is affected.
 *@param {string} ability 3 letter abbreviation for one of the 6 ability scores, member of PFAbilityScores.abilities
 *@param {eventInfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback to call when done.
 *@param {boolean} silently if true update with PFConst.silentParams
 */
function updateAbilityScore (ability, eventInfo, callback, silently) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
    //TAS.debug("at updateAbilityScore:" + ability);
    getAttrs([ability + "-base", ability + "-enhance", ability + "-inherent", ability + "-misc", ability + "-damage", ability + "-penalty", ability + "-drain", ability, ability + "-mod", ability + "-cond", ability + "-modded", "buff_" + ability + "-total", "buff_" + ability + "-total_penalty", "condition-Helpless"], function (values) {
        var setter = {},
        params = {
            silent: false
        },
        base = 0,
        newVal = 0,
        rawDmg = 0,
        rawPen = 0,
        dmgAndPen = 0,
        rawCond = 0,
        penalized = 0,
        rawDmgAndPen = 0,
        currAbility = 0,
        currMod = 0,
        currPenalized = 0,
        mod = 0;
        try {
            base = parseInt(values[ability + "-base"], 10);
            if (isNaN(base)){base = 10;}
            newVal = base + (parseInt(values[ability + "-enhance"], 10) || 0) + 
                (parseInt(values[ability + "-inherent"], 10) || 0) + (parseInt(values[ability + "-misc"], 10) || 0) + 
                (parseInt(values[ability + "-drain"], 10) || 0) + (parseInt(values["buff_" + ability + "-total"], 10) || 0);
            rawDmg = Math.abs(parseInt(values[ability + "-damage"], 10) || 0);
            rawPen = Math.abs(parseInt(values[ability + "-penalty"], 10) || 0) + Math.abs(parseInt(values["buff_" + ability + "-total_penalty"], 10) || 0);
            rawCond = Math.abs(parseInt(values[ability + "-cond"], 10) || 0);
            rawDmgAndPen = rawDmg + rawPen + rawCond;
            dmgAndPen = Math.floor(rawDmgAndPen / 2);
            currAbility = parseInt(values[ability], 10);
            currPenalized = parseInt(values[ability+"-modded"],10)||0;
            currMod = parseInt(values[ability + "-mod"], 10);
            mod = Math.floor((newVal - 10) / 2) - dmgAndPen;
            //TAS.debug(values);
            if (ability === "DEX" && (parseInt(values["condition-Helpless"], 10) || 0) === 1) {
                newVal = 0;
                mod = -5;
                penalized = 1;
            } else if (rawDmg >= newVal) {
                newVal = 0;
                mod = -5;
                penalized = 1;
            } else if (rawDmgAndPen >= (newVal - 1)) {
                //minimum effective ability score of 1 from non damage penalties
                mod = -5;
            }
            if (newVal < 0){
                newVal = 0;
            }
            if (mod < -5){
                mod = -5;
            }
            if (rawDmgAndPen !== 0) {
                penalized = 1;					
            }
            //TAS.debug("base:" + base + ", newval:" + newVal + ", mod:" + mod);
            if (isNaN(base)) {
                setter[ability] = "-";
                setter[ability + "-mod"] = 0;
            } else {
                if (currAbility !== newVal || isNaN(currAbility)) {
                    setter[ability] = newVal;
                }
                if (currMod !== mod || isNaN(currMod)) {
                    setter[ability + "-mod"] = mod;
                }
            }
            if (penalized && !currPenalized){
                setter[ability+"-modded"]=1;
            } else if (!penalized && currPenalized){
                setter[ability+"-modded"]=0;
            }
        } catch (err) {
            TAS.error("updateAbilityScore:" + ability, err);
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
/** updateAbilityScores - update all 6 scores then calls callback 
 *@param {function(bool)} callback to call when done, pass in true if any changes were made.
 *@param {boolean} silently if true update with PFConst.silentParams
 */
function updateAbilityScores (callback, silently) {
    //TAS.debug("at updateAbilityScores");
    var callatend = _.after(6, function (changed) {
        if (typeof callback === "function") {
            callback(changed);
        }
    }),
    anychanged = false,
    thecount = 0,
    calleach = function (newval, currval, changed) {
        anychanged = anychanged || changed;
        thecount++;
        callatend(anychanged);
    };
    _.each(abilities, function (ability) {
        updateAbilityScore(ability, null, calleach, silently);
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
