'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog, PFConsole} from './PFLog';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';
import * as PFUtilsAsync from './PFUtilsAsync';
import * as PFMigrate from './PFMigrate';

export var defenseDropdowns = {
    "AC-ability": "AC-ability-mod",
    "FF-ability": "FF-DEX",
    "CMD-ability1": "CMD-STR",
    "CMD-ability2": "CMD-DEX",
    "CMD-ability": "FF-CMD-DEX"
},
defenseLowerToMixed = {
    "ac-ability": "AC-ability",
    "ff-ability": "FF-ability",
    "cmd-ability1": "CMD-ability1",
    "cmd-ability2": "CMD-ability2",
    "cmd-ability": "CMD-ability"
},
//reverse order to do worn first:
defenseArmorShieldRowsOld = ["armor3", "armor2", "armor", "shield3", "shield2", "shield"],
defenseArmorShieldRows = ["armor3", "shield3"],
defenseArmorShieldColumns = ["equipped", "acbonus", "enhance", "max-dex", "acp", "spell-fail", "proficiency", "type"],
defenseFieldTotals = ["acp", "max-dex", "AC-armor", "AC-shield", "spell-fail", "acp-attack-mod", "max-dex-source", "current-load"],
defenseArmorFields = SWUtils.cartesianAppend(defenseArmorShieldRows, ['-'], defenseArmorShieldColumns).concat(defenseFieldTotals),
events = {
    defenseEventsAuto: "change:bab change:ac-penalty change:cmd-penalty change:size change:ac-shield change:ac-armor change:ac-ability-mod change:ff-dex change:cmd-dex change:ff-cmd-dex change:cmd-str change:max-dex change:ac-misc-mod change:cmd-misc-mod",
    defenseEventsPlayer: "change:ff-dex change:ac-penalty change:cmd-penalty change:size change:ac-dodge change:ac-natural change:ac-deflect",
    defenseEventsEither: "change:size change:AC-ability change:FF-ability change:CMD-ability1 change:CMD-ability2 change:CMD-ability"
};

/** updateDefenses updates the top grid of AC, Touch AC, Flat Footed AC, CMD, Flat Footed CMD
 * http://paizo.com/pathfinderRPG/prd/coreRulebook/combat.html#combat-maneuver-defense
 * Any penalties to a creature's AC also apply to its CMD
 *@param {function} callback optional call when done
 *@param {boolean} silently optional if true call SWUtils.setWrapper with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
export function updateDefenses ( callback, silently, eventInfo) {
    var done = _.once(function () {
        //TAS.debug("leaving PFDefense.updateDefenses");
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["AC-ability-mod", "FF-DEX", "AC-penalty", "CMD-penalty", "size", "max-dex", "AC-dodge", 
    "AC-natural", "AC-deflect", "AC-misc-mod", "buff_AC-total", "buff_Touch-total", "buff_CMD-total", 
    "CMD-DEX", "FF-CMD-DEX", "CMD-STR", "bab", "CMD-misc-mod", "AC", "Touch", "Flat-Footed", "CMD", "FF-CMD", 
    "AC-ability", "FF-ability", "CMD-ability", "CMD-ability1", "CMD-ability2", "AC-armor", "AC-shield", 
    "condition-Blinded", "condition-Pinned", "condition-Stunned", "condition-Cowering", "condition-Drained", 
    "condition-Flat-Footed", "AC-ability-display", "FF-DEX-display", "CMD-DEX-display", "FF-CMD-DEX-display",
    "maxdex-toggle", "nodex-toggle", "uncanny_dodge", "unlock_def_ability", "hd_not_bab", "level",
    "buff_armor-total", "buff_shield-total", "buff_flat-footed-total", "buff_natural-total",
    "buff_dodge-total","buff_deflection-total", "buffsumac", "buffsumtouch", "buffsumff", "buffsumcmd", "buffsumffcmd ",
    "current-load", "max-dex-source"], function (v) {
        var size = parseInt(v["size"], 10) || 0,
        dodge = parseInt(v["AC-dodge"], 10) || 0,
        deflect = parseInt(v["AC-deflect"], 10) || 0,
        miscAC = parseInt(v["AC-misc-mod"], 10) || 0,
        condPenalty = parseInt(v["AC-penalty"], 10) || 0,
        buffs = parseInt(v["buff_AC-total"], 10) || 0,
        buffsTouch = parseInt(v["buff_Touch-total"], 10) || 0,
        buffsCMD = parseInt(v["buff_CMD-total"], 10) || 0,
        armor = parseInt(v["AC-armor"], 10) || 0,
        shield = parseInt(v["AC-shield"], 10) || 0,
        natural = parseInt(v["AC-natural"], 10) || 0,
        bab = parseInt(v["bab"], 10) || 0,
        miscCMD = parseInt(v["CMD-misc-mod"], 10) || 0,
        maxDex = parseInt(v["max-dex"], 10),
        cmdPenalty = parseInt(v["CMD-penalty"], 10) || 0,
        blinded = (parseInt(v["condition-Blinded"], 10) || 0) ? 1 : 0,
        pinned = (parseInt(v["condition-Pinned"], 10) || 0) ? 1 : 0,
        stunned = (parseInt(v["condition-Stunned"], 10) || 0) ? 1 : 0,
        ffed = (parseInt(v["condition-Flat-Footed"], 10) || 0) ? 1 : 0,
        cowering = (parseInt(v["condition-Cowering"], 10) || 0) ? 1 : 0,
        maxDexSource = parseInt(v["max-dex-source"],10)||0,
        currload = parseInt(v["current-load"],10)||0,
        dexModShowLimit = 0,
        currDexModLimit = parseInt(v["maxdex-toggle"], 10) || 0,
        noDexShowLimit = 0,
        currNoDexLimit = parseInt(v["nodex-toggle"], 10) || 0,
        unlockDefAbility = parseInt(v.unlock_def_ability,10)||0,
        lockDefAbility = unlockDefAbility?0:1,
        tempint=0,
        ac = 10,
        touch = 10,
        ff = 10,
        cmd = 10,
        cmdFF = 10,
        currAC = parseInt(v["AC"], 10),
        currTouch = parseInt(v["Touch"], 10),
        currFF = parseInt(v["Flat-Footed"], 10),
        currCMD = parseInt(v["CMD"], 10),
        currCMDFF = parseInt(v["FF-CMD"], 10),
        currUncanny = parseInt(v["uncanny_dodge"], 10) || 0,
        currCMDUncanny = lockDefAbility?currUncanny:(parseInt(v["uncanny_cmd_dodge"], 10) || 0),
        acAbilityName = PFUtils.findAbilityInString(v["AC-ability"]),
        uncannyAbilityName = currUncanny?acAbilityName:PFUtils.findAbilityInString(v["FF-ability"]),
        uncannyCMDabilityName = lockDefAbility?uncannyAbilityName:PFUtils.findAbilityInString(v["CMD-ability"]),
        cmdAbilityDDvalName = lockDefAbility?acAbilityName:PFUtils.findAbilityInString(v["CMD-ability2"]),
        ability = parseInt(v["AC-ability-mod"], 10) || 0,
        ffAbility = (currUncanny&&lockDefAbility)?ability:(parseInt(v["FF-DEX"], 10) || 0),
        cmdAbility1 = parseInt(v["CMD-STR"], 10) || 0,
        cmdAbility2 = lockDefAbility?ability:(parseInt(v["CMD-DEX"], 10) || 0),
        cmdFFAbility2 = lockDefAbility?ffAbility:(parseInt(v["FF-CMD-DEX"], 10) || 0),
        loseDex = 0,
        immobilized = 0,
        armorbuff = parseInt(v['buff_armor-total'],10)||0,
        shieldbuff = parseInt(v['buff_shield-total'],10)||0,
        naturalbuff = parseInt(v['buff_natural-total'],10)||0,
        flatfootedbuff = parseInt(v['buff_flat-footed-total'],10)||0,
        dodgebuff=parseInt(v['buff_dodge-total'],10)||0,
        deflectbuff=parseInt(v['buff_deflection-total'],10)||0,
        buffac = 0,
        bufftouch = 0,
        buffff = 0,
        buffffcmd = 0,
        buffcmd = 0,
        setAny = 0,
        setter = {},
        params = {};
        try {
            //TAS.debug("PFDefense.updateDefenses:",v);
            buffac=buffs+armorbuff+shieldbuff+naturalbuff+dodgebuff+deflectbuff;
            bufftouch=buffsTouch+dodgebuff+deflectbuff;
            buffff=buffs+armorbuff+shieldbuff+naturalbuff+flatfootedbuff+deflectbuff;
            buffcmd = buffs+buffsCMD+dodgebuff+deflectbuff;
            buffffcmd = buffs+buffsCMD+flatfootedbuff+deflectbuff;

            dodge += dodgebuff;
            deflect += deflectbuff;
            armor += armorbuff;
            shield += shieldbuff;
            natural += naturalbuff;

            //TAS.debug(v);
            maxDex = isNaN(maxDex) ? 99 : maxDex; //cannot do "||0" since 0 is falsy but a valid number
            if (acAbilityName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
                tempint = Math.min(ability, maxDex);
                if (tempint !== ability){
                    ability=tempint;
                    dexModShowLimit = 1;
                }
            }
            if (uncannyAbilityName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
                tempint = Math.min(ffAbility, maxDex);
                if (tempint !== ffAbility){
                    ffAbility=tempint;
                    dexModShowLimit = 1;
                }
            }
            if (cmdAbilityDDvalName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
                tempint = Math.min(cmdAbility2, maxDex);
                if (tempint !== cmdAbility2){
                    cmdAbility2=tempint;
                    dexModShowLimit = 1;
                }
            }
            if (uncannyCMDabilityName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
                tempint = Math.min(cmdFFAbility2, maxDex);
                if (tempint !== cmdFFAbility2){
                    cmdFFAbility2=tempint;
                    dexModShowLimit = 1;
                }
            }

            //if ability is below zero, FF dex adj must be set to negative too
            //assume ffability dropdown should be None or the same as dex ability
            //because if not then it doesn't make sense
            if (ability < 0 && ffAbility > ability) {
                ffAbility = ability;
            }
            if (cmdAbility2 < 0 && cmdFFAbility2 > cmdAbility2) {
                cmdFFAbility2 = cmdAbility2;
            }
            if (unlockDefAbility ){
                if (uncannyAbilityName && currUncanny === 0) {
                    //TAS.debug("switching to uncanny");
                    setter["uncanny_dodge"] = "1";
                    setAny = 1;
                    currUncanny = 1;
                } else if (!uncannyAbilityName && currUncanny === 1) {
                    //TAS.debug("switching from uncanny");
                    setter["uncanny_dodge"] = "0";
                    setAny = 1;
                    currUncanny = 0;
                }
                if (uncannyCMDabilityName && currCMDUncanny === 0) {
                    //TAS.debug("switching to cmd uncanny");
                    setter["uncanny_cmd_dodge"] = "1";
                    setAny = 1;
                    currCMDUncanny = 1;
                } else if (!uncannyCMDabilityName && currCMDUncanny === 1) {
                    //TAS.debug("switching from cmd uncanny");
                    setter["uncanny_cmd_dodge"] = "0";
                    setAny = 1;
                    currCMDUncanny = 0;
                }
            }
            //lose Dex: you lose your bonus (and dodge) - not the same as flat footed
            //Must be applied even if your bonus is not dex :
            //http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9qdi
            //flat footed : lose dex unless uncanny
            //blinded: lose dex unless uncanny
            //pinned, cowering, stunned : always lose dex
            if (pinned || cowering || stunned || (currload===4&& (maxDexSource===0 || maxDexSource===2))) {
                immobilized=1;
            } else if (blinded || ffed || (currload===3 && (maxDexSource===0 || maxDexSource===2))) {
                loseDex=1;
            }
            
            if (immobilized ) {
                if (currUncanny) {
                    ffAbility = Math.min(0, ffAbility);
                }
                if (currCMDUncanny){
                    cmdFFAbility2 = Math.min(0, cmdFFAbility2);
                }
                //dexModShowLimit=1;
                ability = Math.min(0, ability);
                cmdAbility2 = Math.min(0, cmdAbility2);
                dodge = 0;
                noDexShowLimit = 1;
            } else if (loseDex) {
                //TAS.debug("we are blinded or flat footed uncanny:"+currUncanny+", cmd uncan:"+currCMDUncanny);
                if (!currUncanny || !currCMDUncanny) {
                    //dexModShowLimit=1;
                    dodge = 0;
                    noDexShowLimit = 1;
                } else {
                    buffff += dodgebuff;
                    buffffcmd += dodgebuff;
                }
                //set to same as flat footed (probably 0) or less than if ability already under 10.
                ability = Math.min(ability,ffAbility);
                cmdAbility2 = Math.min(cmdAbility2,cmdFFAbility2);
            }
            if (parseInt(v.hd_not_bab,10)){
                bab = parseInt(v.level,10)||0;
            }
            ac = 10 + armor + shield + natural + size + dodge + ability + deflect + miscAC + condPenalty + buffs + armorbuff + shieldbuff + naturalbuff;
            touch = 10 + size + dodge + ability + deflect + miscAC + condPenalty + buffsTouch;
            ff = 10 + armor + shield + natural + size + ffAbility + deflect + miscAC + condPenalty + buffs + (currUncanny ? dodge : 0) + armorbuff + shieldbuff + naturalbuff + flatfootedbuff ;
            cmd = 10 + bab + cmdAbility1 + cmdAbility2 + (-1 * size) + dodge + deflect + miscCMD + cmdPenalty + buffsCMD;
            cmdFF = 10 + bab + cmdAbility1 + cmdFFAbility2 + (-1 * size) + deflect + miscCMD + cmdPenalty + buffsCMD + (currCMDUncanny ? dodge : 0) + flatfootedbuff;


            if(parseInt(v.buffsumff,10)!==buffff){
                setter.buffsumff=buffff;
            }
            if(parseInt(v.buffsumffcmd,10)!==buffffcmd){
                setter.buffsumffcmd = buffffcmd;
            }
            if (ac !== currAC || isNaN(currAC)) {
                setter["AC"] = ac;
            }
            if (touch !== currTouch || isNaN(currTouch)) {
                setter["Touch"] = touch;
            }
            if (ff !== currFF || isNaN(currFF)) {
                setter["Flat-Footed"] = ff;
            }
            //TAS.debug("PFDefense.updateDefenses currcmd is :"+ currCMD +", new cmd is:"+ cmd);
            if (cmd !== currCMD || isNaN(currCMD)) {
                setter["CMD"] = cmd;
            }
            if (cmdFF !== currCMDFF || isNaN(currCMDFF)) {
                setter["FF-CMD"] = cmdFF;
                setAny += 1;
            }
            if (ability !== (parseInt(v["AC-ability-display"], 10))) {
                setter["AC-ability-display"] = ability;
            }
            if (ffAbility !== (parseInt(v["FF-DEX-display"], 10))) {
                setter["FF-DEX-display"] = ffAbility;
            }
            if (cmdAbility2 !== (parseInt(v["CMD-DEX-display"], 10))) {
                setter["CMD-DEX-display"] = cmdAbility2;
            }
            if (cmdFFAbility2 !== (parseInt(v["FF-CMD-DEX-display"], 10))) {
                setter["FF-CMD-DEX-display"] = cmdFFAbility2;
            }
            if (dexModShowLimit !== currDexModLimit) {
                setter["maxdex-toggle"] = dexModShowLimit;
            }
            if (noDexShowLimit !== currNoDexLimit) {
                setter["nodex-toggle"] = noDexShowLimit;
            }
        } catch (err) {
            TAS.error("PFDefense.updateDefenses:", err);
        } finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            } else {
                done();
            }
        }
    });
}
/** setDefenseDropdownMod
 * All dropdowns in the defense grid: AC, flat footed AC, touch, CMD, flat footed CMD.
 * calls handledropdown then calls updateDefenses.
 *
 * NOTE: due to the way eventInfo.sourceAttribute is populated if the change comes from the autocalc code, the value is
 * lower case, so you must check either BOTH the regular and all lowercase, or just change it to lower case before comparing to be sure
 *
 *@param {string} dropdownField fieldname of dropdown to set 
 *@param {function} callback callback
 *@param {boolean} silently if true set silently make sure to call updateDefenses after!
 *@param {object} the eventInfo object USED, this is checked for uncanny_dodge flag 
 *@param {boolean} doNotCallUpdateDefenseAfter if not set call updateDefenses after updating dropdown mod.
 */
export function setDefenseDropdownMod (dropdownField, callback, silently, eventInfo, doNotCallUpdateDefenseAfter) {
    var done = _.once(function () {
        //TAS.debug("leaving PFDefense.setDefenseDropdownMod for "+dropdownField);
        if (typeof callback === "function") {
            callback();
        }
    }),
    updateAndDone = _.once(function(){
        if (!doNotCallUpdateDefenseAfter) {
            updateDefenses(done, silently);
        } else {
            done();
        }
    }),
    dropdownLower="",
    dropdownMixed="";
    //TAS.debug"PFDefense.setDefenseDropdownMod called with "+dropdownField +", lower:"+ dropdownLower);
    try {
        if (dropdownField){
            dropdownLower = dropdownField.toLowerCase();
            dropdownMixed = defenseLowerToMixed[dropdownLower];
            if (dropdownMixed){
                getAttrs(['unlock_def_ability','uncanny_dodge'],function(v){
                    if(parseInt(v['unlock_def_ability'],10) || ( dropdownLower==='ac-ability' || dropdownLower==='cmd-ability1') ){
                        PFUtilsAsync.setDropdownValue(dropdownMixed, defenseDropdowns[dropdownMixed], function (newv, oldv) {
                            if (newv !== oldv || newv < 0 || oldv < 0 || dropdownLower==="ff-ability" || dropdownLower=== "cmd-ability") {
                                updateAndDone();
                            } else {
                                done();
                            }
                        }, silently);
                    } else {
                        done();
                    }
                });
            } else {
                TAS.warn("PFDefense.updateDefenses, called with invalid dropdown: "+dropdownField);
                done();
            }
        } else if (eventInfo && eventInfo.sourceAttribute==='uncanny_dodge') {
            getAttrs(['unlock_def_ability','uncanny_dodge','AC-ability',defenseDropdowns['AC-ability']],function(v){
                var unlockAbilityDD = 0,
                    currACmod =  0,
                    setter={};
                try {
                    unlockAbilityDD = parseInt(v.unlock_def_ability,10)||0;
                    if (unlockAbilityDD){
                        //TAS.debug("at PFDefense.setDefenseDropdownMod",v);
                        currACmod=parseInt(v['AC-ability'],10)||0;
                        //we came here because uncanny dodge was checked
                        if (!parseInt(v.uncanny_dodge,10)) {
                            //turn uncanny off
                            setter["FF-ability"]="0";
                            setter[defenseDropdowns["FF-ability"]]=0;
                            setter["CMD-ability"]="0";
                            setter[defenseDropdowns["CMD-ability"]]=0;
                        } else {
                            //turned uncanny on
                            //TAS.debug("set FF_ability to " +v['AC-ability'] );
                            setter["FF-ability"]=v['AC-ability'];
                            setter[defenseDropdowns["FF-ability"]]=currACmod;
                            setter["CMD-ability"]=v['AC-ability'];
                            setter[defenseDropdowns["CMD-ability"]]=currACmod;
                        }
                        SWUtils.setWrapper(setter,PFConst.silentParams,updateAndDone);
                    } else {
                        updateAndDone();
                    }
                } catch (err2) {
                    TAS.error("PFDefense.setDefenseDropdownMod inner error for : "+dropdownField, err2);
                    done();
                }
            });
        }
    } catch (err) {
        TAS.error("PFDefense.setDefenseDropdownMod error for: "+dropdownField, err);
        done();
    }
}
/** updates total AC and penalty and max dex
 * if not proficient sets attack penalty
 * for backward compatibility, proficiency is string and 0 is proficient, anything else non proficient
 *@param {function} callback optional call when done
 *@param {boolean} silently optional if true call SWUtils.setWrapper with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
export function updateArmor (callback, silently, eventInfo) {
    var done = function () { if (typeof callback === "function") { callback(); } },
    params = {};
    getAttrs(defenseArmorFields, function (v) {
        var acp = 0, minAcp = 0, acA = 0, acS = 0, sp = 0, atk = 0, subAC = 0, subD = 0,
        subAcp = 0, nonProf = 0, subsp = 0, maxDex = 99, subE = 0,
        currACP = 0, currMaxDex = 99, currACArmor = 0, currACShield = 0, currSpellFail = 0,
        currAtkMod = 0,
        encumbranceDD = parseInt(v["max-dex-source"], 10) || 0,
        currentLoad = parseInt(v["current-load"], 10) || 0,
        setter = {};
        try {
            //TAS.debug("at updateArmor ",v);
            defenseArmorShieldRows.forEach(function (row) {
                if (parseInt(v[row + "-equipped"],10) === 1) {
                    subAC = parseInt(v[row + "-acbonus"], 10) || 0;
                    subE = parseInt(v[row+"-enhance"],10)||0;
                    subsp = parseInt(v[row + "-spell-fail"], 10) || 0;
                    sp += subsp;
                    if (row.indexOf("armor") >= 0) {
                        acA += subAC + subE;
                    } else {
                        acS += subAC + subE;
                    }
                    subAcp = parseInt(v[row + "-acp"], 10) || 0;
                    if (encumbranceDD < 2) {
                        subD = parseInt(v[row + "-max-dex"], 10);
                        if (v[row + "-max-dex"]==="-" || isNaN(subD)){
                            subD=99;
                        }
                        maxDex = Math.min(subD, maxDex);
                        acp += subAcp;
                    }
                    nonProf = parseInt(v[row + "-proficiency"], 10) || 0;
                    if (nonProf) {
                        atk += subAcp;
                    }
                    if ((/tower/i).test(v[row+"-type"])){
                        atk -= 2;
                    }
                    //TAS.debug("row=" + row + ", subAC=" + subAC + ", subD=" + subD + ", subAcp=" + subAcp + ", nonProf=" + nonProf + ", subsp=" + subsp + ", acA=" + acA + ", maxDex=" + maxDex + ", acp=" + acp + ", sp=" + sp + ", atk=" + atk);
                }
            });
            minAcp = acp;
            // #0: Armor, Shield & Load
            // #1: Armor & Shield only
            // #2: Load only
            // #3: None
            if (encumbranceDD === 0 || encumbranceDD === 2) {
                if (currentLoad === 1) { // under medium encumbrance load
                    maxDex = Math.min(maxDex, 3);
                    minAcp = Math.min(minAcp, -3);
                } else if (currentLoad === 2) { // under heavy encumbrance load
                    maxDex = Math.min(maxDex, 1);
                    minAcp = Math.min(minAcp, -6);
                } else if (currentLoad > 2){
                    maxDex = 0;
                    minAcp = Math.min(minAcp, -6);
                }
            }
            
            
            currACP = parseInt(v.acp, 10) || 0;
            currMaxDex = parseInt(v["max-dex"], 10); //cannot do "||0" since 0 is valid but falsy
            currMaxDex = isNaN(currMaxDex) ? 99 : currMaxDex;
            currACArmor = parseInt(v["AC-armor"], 10) || 0;
            currACShield = parseInt(v["AC-shield"], 10) || 0;
            currSpellFail = parseInt(v["spell-fail"], 10) || 0;
            currAtkMod = parseInt(v["acp-attack-mod"], 10) || 0;
            if (currACP !== minAcp) {
                setter["acp"] = minAcp;
            }
            if (currMaxDex !== maxDex) {
                setter["max-dex"] = maxDex;
            }
            if (currACArmor !== acA) {
                setter["AC-armor"] = acA;
            }
            if (currACShield !== acS) {
                setter["AC-shield"] = acS;
            }
            if (currSpellFail !== sp) {
                setter["spell-fail"] = sp;
            }
            if (currAtkMod !== atk) {
                setter["acp-attack-mod"] = atk;
            }
        } catch (err) {
            TAS.error("PFDefense.updateArmor", err);
        } finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            } else {
                done();
            }
        }
    });
}
/** applyConditions Updates the AC-penalty and CMD-penalty field based on conditions
 *only difference is CMD penalty affected by energy drain for some reason
 *@param {function} callback optional call when done
 *@param {boolean} silently optional if true call SWUtils.setWrapper with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
export function applyConditions (callback, silently,eventInfo) {
    var done = _.once(function () {
        //TAS.debug("leaving PFDefense.applyConditions");
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["AC-penalty", "CMD-penalty", "condition-Blinded", "condition-Cowering", "condition-Stunned", 
    "condition-Pinned", "condition-Wounds", "condition-Drained", "has_endurance_feat", "wounds_gritty_mode",
    "condition-Grappled", "condition-Invisible",
    "condition-Paralyzed","condition-Helpless","condition-Prone","condition_defense_notes"], function (v) {
        var subTotPenalty = 0,
        drained = 0,
        woundLevel = 0,
        AC = 0,
        CMD = 0,
        newCMD = 0,
        woundPenalty = 0,
        hasEndurance = 0,
        grittyMode = 0,
        defenseNote='',
        setter = {},
        params = {};
        try {
            //if user pressed Grappled or invisible, just skip to notes
            if (!eventInfo || !(/grappled|invisible/i).test(eventInfo.sourceAttribute)){ 
                drained = parseInt(v["condition-Drained"], 10) || 0;
                woundLevel = parseInt(v["condition-Wounds"], 10) || 0;
                AC = parseInt(v["AC-penalty"], 10) || 0;
                CMD = parseInt(v["CMD-penalty"], 10) || 0;
                hasEndurance = parseInt(v.has_endurance_feat, 10) || 0;
                grittyMode = parseInt(v.wounds_gritty_mode, 10) || 0;
                woundPenalty = PFUtils.getWoundPenalty(woundLevel, hasEndurance, grittyMode);
                subTotPenalty = -1 * ((parseInt(v["condition-Blinded"], 10) || 0) + (parseInt(v["condition-Pinned"], 10) || 0) + (parseInt(v["condition-Cowering"], 10) || 0) + (parseInt(v["condition-Stunned"], 10) || 0));
                subTotPenalty += woundPenalty;
                newCMD = drained + subTotPenalty;
                if (AC !== subTotPenalty) {
                    setter["AC-penalty"] = subTotPenalty;
                }
                if (CMD !== newCMD) {
                    setter["CMD-penalty"] = newCMD;
                }
            }
			if(parseInt(v['condition-Paralyzed'],10)){
                defenseNote+='**'+ SWUtils.getTranslated('paralyzed')+'**: ';
				defenseNote+=SWUtils.getTranslated('condition-paralyzed-note') + '\r\n';
			}
			if(parseInt(v['condition-Prone'],10)){
                defenseNote+= '**'+SWUtils.getTranslated('prone')+'**: ';
				defenseNote+=SWUtils.getTranslated('condition-prone-note') + '\r\n';
			}
			if(parseInt(v['condition-Helpless'],10)){
                defenseNote+= '**'+SWUtils.getTranslated('helpless')+'**: ';
				defenseNote+=SWUtils.getTranslated('condition-helpless-note') + '\r\n';
			}
			if(parseInt(v['condition-Grappled'],10) && parseInt(v['condition-Invisible'],10)){
                defenseNote+= '**'+SWUtils.getTranslated('grappled')+' + ' +SWUtils.getTranslated('invisible') + '**: ';
				defenseNote+=SWUtils.getTranslated('condition-grappled-invisible-note') + '\r\n';
			}

			if(defenseNote!==v.condition_defense_notes){
				setter['condition_defense_notes'] = defenseNote;				
			}
            
        } catch (err) {
            TAS.error("PFDefense.applyConditions:", err);
        } finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            } else {
                done();
            }
        }
    });
}

/** migrate from old versions
 * @param {function} callback guaranteed call when done
 * @param {number} oldversion 
 */
export function migrate (callback,oldversion){
    var done = _.once(function () {
        //TAS.debug("leaving PFDefense.migrate");
        if (typeof callback === "function") {
            callback();
        }
    });
    if (oldversion > 0 && oldversion < 0.50) {
        PFMigrate.migrateMaxDexAndACP();
    }
    if (oldversion > 0 && oldversion < 1.20){
        getAttrs(['CMD-ability2','unlock_def_ability','AC-ability'],function(v){
            var ac='',cmd='',configflag=0, setter={};
            try {
                ac = PFUtils.findAbilityInString(v['AC-ability']);
                cmd = PFUtils.findAbilityInString(v['CMD-ability2']);
                configflag = parseInt(v.unlock_def_ability,10)||0;
                if (ac && cmd && ac !== cmd && !configflag){
                    setter.unlock_def_ability=1;
                } else if (configflag){
                    setter.unlock_def_ability=0;
                }
            } catch (err){
                TAS.error("PFDefense.migrate",err);
            } finally {
                if (_.size(setter)>0){
                    SWUtils.setWrapper(setter,PFConst.silentParams,done);
                } else {
                    done();
                }
            }
        });
    } else {
        done();
    }
}

/** recalculate defense grid
 * @param {function} callback guaranteed call when done
 * @param {boolean} silently optional if true call SWUtils.setWrapper with PFConst.silentParams
 * @param {number} oldversion 
 */
export var recalculate = TAS.callback(function callrecalculate(callback, silently, oldversion) {
    var done = _.once(function () {
        //TAS.debug("leaving PFDefense.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    }),
    numDropdowns = _.size(defenseDropdowns),
    doneOneDefenseDropdown= _.after(numDropdowns, function(){
        updateDefenses(done, true);
    });

    migrate(function() {
        applyConditions(function () {
            updateArmor(function () {
                _.each(defenseDropdowns, function (value, key) {
                    setDefenseDropdownMod(key, doneOneDefenseDropdown,true,null,true);
                });
            }, silently);
        }, silently);
    },silently);
});

function registerEventHandlers () {
    _.each(defenseDropdowns, function (write, read) {
        on("change:" + read, TAS.callback(function eventsetDefenseDropdownMod(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            setDefenseDropdownMod(read,null,null,eventInfo);
        }));
    });
    on("change:uncanny_dodge" , TAS.callback(function eventUncannyDodgeUpdate(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            setDefenseDropdownMod(null,null,null,eventInfo);
        }
    }));
    on("change:hd_not_bab" , TAS.callback(function eventCMDSwitchHDandBAB(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateDefenses(null,null,eventInfo);
        }
    }));		
    on(events.defenseEventsAuto, TAS.callback(function eventUpdateDefensesAuto(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            updateDefenses(null,null,eventInfo);
        }
    }));
    on(events.defenseEventsPlayer, TAS.callback(function eventUpdateDefensesPlayer(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateDefenses(null,null,eventInfo);
        }
    }));
    on(events.defenseEventsEither, TAS.callback(function eventUpdateDefensesEither(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        updateDefenses(null,null,eventInfo);
    }));
    on("change:max-dex-source change:current-load", TAS.callback(function eventUpdateArmor(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        updateArmor(null,null,eventInfo);
    }));
    _.each(defenseArmorShieldRows, function (row) {
        _.each(defenseArmorShieldColumns, function (column) {
            var eventToWatch = "change:" + row + "-" + column;
            on(eventToWatch, TAS.callback(function eventUpdateDefenseArmorShield(eventInfo) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                updateArmor(null,null,eventInfo);
            }));
        });
    });
}
registerEventHandlers();
//PFConsole.log( '   PFDefense module loaded        ' );
//PFLog.modulecount++;
