'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';
import * as PFMigrate from './PFMigrate';
import * as PFMenus from './PFMenus';

export var attackGridFields = {
    "melee": {
        "size": "size",
        "atk": "attk-melee",
        "buff": "buff_Melee-total",
        "abilityMod": "melee-ability-mod",
        "misc": "attk-melee-misc",
        "crit": "attk_melee_crit_conf",
        "attackmacro": "@{toggle_global_melee_macro_insert}",
        "damagemacro": "@{toggle_global_melee_damage_macro_insert}"
    },
    "melee2": {
        "size": "size",
        "atk": "attk-melee2",
        "buff": "buff_Melee-total",
        "abilityMod": "melee2-ability-mod",
        "misc": "attk-melee2-misc",
        "crit": "attk_melee2_crit_conf",
        "attackmacro": "@{toggle_global_melee_macro_insert}",
        "damagemacro": "@{toggle_global_melee_damage_macro_insert}"
    },
    "ranged": {
        "size": "size",
        "atk": "attk-ranged",
        "buff": "buff_Ranged-total",
        "abilityMod": "ranged-ability-mod",
        "misc": "attk-ranged-misc",
        "crit": "attk_ranged_crit_conf",
        "attackmacro": "@{toggle_global_ranged_macro_insert}",
        "damagemacro": "@{toggle_global_ranged_damage_macro_insert}"
    },
    "ranged2": {
        "size": "size",
        "atk": "attk-ranged2",
        "buff": "buff_Ranged-total",
        "abilityMod": "ranged2-ability-mod",
        "misc": "attk-ranged2-misc",
        "crit": "attk_ranged2_crit_conf",
        "attackmacro": "@{toggle_global_ranged_macro_insert}",
        "damagemacro": "@{toggle_global_ranged_damage_macro_insert}"
    },
    "CMB": {
        "size": "CMD-size",
        "atk": "CMB",
        "buff": "buff_Melee-total",
        "abilityMod": "CMB-ability-mod",
        "misc": "attk-CMB-misc",
        "crit": "attk_cmb_crit_conf",
        "attackmacro": "@{toggle_global_cmb_macro_insert}",
        "damagemacro": "@{toggle_global_cmb_damage_macro_insert}"
    },
    "CMB2": {
        "size": "CMD-size",
        "atk": "CMB2",
        "buff": "buff_Melee-total",
        "abilityMod": "CMB2-ability-mod",
        "misc": "attk-CMB2-misc",
        "crit": "attk_cmb2_crit_conf",
        "attackmacro": "@{toggle_global_cmb_macro_insert}",
        "damagemacro": "@{toggle_global_cmb_damage_macro_insert}"
    }
};
var attkpenaltyAddToFields = ["condition-Invisible", "acp-attack-mod", "condition-Drained"],
attkpenaltySubtractFromFields = ["condition-Dazzled", "condition-Entangled", "condition-Grappled", "condition-Fear", "condition-Prone", "condition-Sickened", "condition-Wounds"],
attkpenaltySumRow = ["attk-penalty"].concat(attkpenaltyAddToFields),
groupMapForMenu = {'0':'none','@{attk-melee}':'melee','@{attk-melee2}':'melee',
        '@{attk-ranged}':'ranged','@{attk-ranged2}':'ranged2',
        '@{CMB}':'combat-maneuver-bonus-abbrv','@{CMB2}':'combat-maneuver-bonus-abbrv'};


/** updates DMG-mod
 * @param {function} callback optional call when done
 * @param {boolean} silently optional if true call setAttrs with PFConst.silentParams
 */
export function updateDamage (callback, silently) {
    SWUtils.updateRowTotal(["DMG-mod", "buff_DMG-total"], 0, ["condition-Sickened"], false, callback, silently);
}
/** updates the attk-penalty for attacks based on conditions including wearing armor you are not proficient in 
 *@param {function} callback optional call when done
 *@param {boolean} silently optional if true call setAttrs with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
export function applyConditions  (callback, silently, eventInfo) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
    SWUtils.updateRowTotal(attkpenaltySumRow, 0, attkpenaltySubtractFromFields, false, done, silently);
}
/** updateAttack - updates one row of attack grid (left most column in grid)
 * Updates the attack type totals at top of attack page for one row of grid
 * @param {string} attype = key for attackGridFields to indicate which row from attack grid
 * @param {eventInfo } eventInfo unused
 * @param {function} callback optional call when done
 * @param {boolean} silently optional if true call setAttrs with PFConst.silentParams
 */
export function updateAttack  (attype, eventInfo, callback, silently) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
    if (attackGridFields[attype]) {
        SWUtils.updateRowTotal([attackGridFields[attype].atk, "bab", "attk-penalty", attackGridFields[attype].abilityMod,
            attackGridFields[attype].misc, attackGridFields[attype].size, attackGridFields[attype].buff
            ], 0, [], false, done, silently);
    } else {
        TAS.error("PFAttackGrid.updateAttack attack grid fields do not exist for: " + attype);
        done();
    }
}

export function resetCommandMacro (callback){
	getAttrs(['is_npc'],function(v){
		var isNPC = parseInt(v.is_npc,10)||0,
        header="{{row01= **^{base-attacks}** }} {{row02=[^{melee}](~@{character_id}|Melee-Attack-Roll) [^{ranged}](~@{character_id}|Ranged-Attack-Roll) [^{combat-maneuver-bonus-abbrv}](~@{character_id}|CMB-Check) [^{melee2}](~@{character_id}|Melee2-Attack-Roll) }}",
        npcHeader="{{row01= **^{base-attacks}** }} {{row02=[^{melee}](~@{character_id}|NPC-Melee-Attack-Roll) [^{ranged}](~@{character_id}|NPC-Ranged-Attack-Roll) [^{combat-maneuver-bonus-abbrv}](~@{character_id}|NPC-CMB-Check) [^{melee2}](~@{character_id}|NPC-Melee2-Attack-Roll) }}";
 TAS.debug("at PFAttackGrid.resetCommandMacro");
        PFMenus.resetOneCommandMacro('attacks',true,null,header,groupMapForMenu);
        PFMenus.resetOneCommandMacro('attacks',false,null,npcHeader,groupMapForMenu);
/*
		getTopOfMenu ( function(header){
			PFMenus.resetOneCommandMacro('ability',isNPC,null,header);
		}, isNPC);
		if (isNPC){
			getTopOfMenu ( function(header){
				PFMenus.resetOneCommandMacro('ability',false,null,header);
			});
		}
        */
		if (typeof callback === "function"){
			callback();
		}
	});
}

export function resetCommandMacroOld  (callback) {
    var done = _.once(function () { if (typeof callback === "function") { callback(); } }),
    baseAttacks = "{{row01= **^{base-attacks}** }} {{row02=[^{melee}](~@{character_id}|REPLACENPCMelee-Attack-Roll) [^{ranged}](~@{character_id}|REPLACENPCRanged-Attack-Roll) [^{combat-maneuver-bonus-abbrv}](~@{character_id}|REPLACENPCCMB-Check) [^{melee2}](~@{character_id}|REPLACENPCMelee2-Attack-Roll) REPLACE}}",
    ranged2BaseAttacks = "[^{ranged2}](~@{character_id}|REPLACENPCRanged2-Attack-Roll)",
    cmb2BaseAttacks = "[^{combat-maneuver-bonus-abbrv2}](~@{character_id}|REPLACENPCCMB2-Check)",
    //           012 345678901234567890 23
    baseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_attack_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_attack-melee}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{attacks}}}",
    npcBaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_attack_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_attack-melee}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} ^{attacks}}}";
    getAttrs(["is_npc", "attacks-macro", "attacks-macro-npc", "include_attack_totals", "ranged_2_show", "cmb_2_show"], function (currMacros) {
        var showBonus = parseInt(currMacros["include_attack_totals"], 10) || 0,
        isNPC = parseInt(currMacros.is_npc, 10) || 0,
        npcStr = isNPC ? "npc-" : "";
        baseAttacks = baseAttacks.replace(/REPLACENPC/g, npcStr);
        if (parseInt(currMacros.ranged_2_show, 10)) {
            ranged2BaseAttacks = ranged2BaseAttacks.replace(/REPLACENPC/g, npcStr)||"";
        } else {
            ranged2BaseAttacks = "";
        }
        if (parseInt(currMacros.cmb_2_show, 10)) {
            cmb2BaseAttacks = cmb2BaseAttacks.replace(/REPLACENPC/g, npcStr)||"";
        } else {
            cmb2BaseAttacks = "";
        }
        baseAttacks = baseAttacks.replace(/REPLACE/, (ranged2BaseAttacks + ' ' + cmb2BaseAttacks))||"";
        if (isNPC){
            baseMacro = npcBaseMacro + baseAttacks;
        } else {
            baseMacro += baseAttacks;
        }
        
        TAS.debug("PFAttackGrid.resetCommandMacro baseMacro: " + baseMacro);
        getSectionIDs("repeating_weapon", function (idarray) {
            //if no attacks just set the base melee, ranged, cmb attacks
            if (!idarray || idarray.length === 0) {
                var attrs = {};
                if (!isNPC && currMacros["attacks-macro"].slice(13) !== baseMacro.slice(13)) {
                    attrs["attacks-macro"] = baseMacro;
                } else if (isNPC && currMacros["attacks-macro-npc"].slice(13) !== baseMacro.slice(13)) {
                    attrs["attacks-macro-npc"] = baseMacro;
                }
                if (_.size(attrs)) {
                    setAttrs(attrs, PFConst.silentParams, done);
                } else {
                    done();
                }
                return;
            }
            getAttrs(["_reporder_repeating_weapon"], function (repValues) {
                var atkattrs = [];
                //TAS.debug("PFAttackGrid.resetCommandMacro values:", repValues);
                _.each(idarray, function (id) {
                    atkattrs.push("repeating_weapon_" + id + "_attack-type");
                    atkattrs.push("repeating_weapon_" + id + "_name");
                    atkattrs.push("repeating_weapon_" + id + "_group");
                    if (showBonus) {
                        atkattrs.push("repeating_weapon_" + id + "_total-attack");
                    }
                });
                getAttrs(atkattrs, function (values) {
                    var repList,
                    orderedList,
                    attackIDList,
                    melee = "",
                    ranged = "",
                    cmb = "",
                    misc = "",
                    attrs = {},
                    otherGroups = {},
                    other = "",
                    tempstr="",
                    rowcounter=10,
                    newMacro="";
                    try {
                        if (!_.isUndefined(repValues._reporder_repeating_weapon) && repValues._reporder_repeating_weapon !== "") {
                            repList = repValues._reporder_repeating_weapon.split(",");
                            repList = _.map(repList, function (ID) {
                                return ID.toLowerCase();
                            });
                        }
                        orderedList = _.union(repList, idarray);
                        attackIDList = _.object(_.map(orderedList, function (id) {
                            return [id, values["repeating_weapon_" + id + "_attack-type"]];
                        }));
                        orderedList = _.filter(orderedList, function (ID) {
                            if (typeof values["repeating_weapon_" + ID + "_name"] === "undefined" || typeof values["repeating_weapon_" + ID + "_attack-type"] === "undefined") {
                                return false;
                            }
                            return true;
                        });
                        _.each(orderedList, function (ID) {
                            var temproll = "",
                            NPCtemproll = "",
                            value = "",
                            buttonName = "",
                            bonusStr = showBonus ? (" + @{repeating_weapon_" + ID + "_total-attack}") : "",
                            attackName = values["repeating_weapon_" + ID + "_name"],
                            groupName = values["repeating_weapon_" + ID + "_group"];
                            buttonName = attackName + bonusStr;
                            buttonName = SWUtils.escapeForChatLinkButton(buttonName);
                            buttonName = SWUtils.escapeForRollTemplate(buttonName);

                            temproll = " [" + buttonName + "](~@{character_id}|repeating_weapon_" + ID + "_attack-" + npcStr + "roll)";

                            if (attackIDList[ID]) {
                                if (groupName) {
                                    if (!otherGroups[groupName]) {
                                        otherGroups[groupName] = "";
                                    }
                                    otherGroups[groupName] += temproll;
                                } else {
                                    value = PFUtils.findAbilityInString(attackIDList[ID]);
                                    switch (value) {
                                        case 'attk-melee':
                                        case 'attk-melee2':
                                            melee += temproll;
                                            break;
                                        case 'attk-ranged':
                                        case 'attk-ranged2':
                                            ranged += temproll;
                                            break;
                                        case 'CMB':
                                        case 'CMB2':
                                            cmb += temproll;
                                            break;
                                        default:
                                            misc += temproll;
                                            break;
                                    }
                                }
                            }
                        });
                        if (otherGroups && _.size(otherGroups) > 0) {
                            other = _.reduce(otherGroups, function (memo, str, loopgroup) {
                                memo += " {{row"+rowcounter +"=**"+ loopgroup + "**}}" ;
                                rowcounter++;
                                memo += " {{row"+rowcounter +"="+ str.trim() + "}}";
                                rowcounter++;
                                return memo;
                            }, other);
                        }
                        other = other||"";
                        if (melee) {
                            tempstr = " {{row"+rowcounter +"=**^{melee}**}}";
                            rowcounter++;
                            tempstr += " {{row"+rowcounter +"="+ melee.trim() + "}}";
                            rowcounter++;
                            melee = tempstr;
                        }
                        if (ranged) {
                            tempstr = " {{row"+rowcounter +"=**^{ranged}**}}";
                            rowcounter++;
                            tempstr += " {{row"+rowcounter +"=" + ranged.trim() + "}}";
                            rowcounter++;
                            ranged = tempstr;
                        }
                        if (cmb) {
                            tempstr = " {{row"+rowcounter +"=**^{combat-maneuver-bonus-abbrv}**}}";
                            rowcounter++;
                            tempstr += " {{row"+rowcounter +"=" + cmb.trim() + "}}";
                            rowcounter++;
                            cmb = tempstr;
                        }
                        if (misc) {
                            tempstr = " {{row"+rowcounter +"=**^{miscellaneous-abbrv}**}}";
                            rowcounter++;
                            tempstr += " {{row"+rowcounter +"=" + cmb.trim() + "}}";
                            rowcounter++;
                            misc = tempstr;
                        }

                        newMacro = baseMacro + other + melee + ranged + cmb + misc;
                        if (newMacro){
                            if (!isNPC && currMacros["attacks-macro"].slice(13) !== newMacro.slice(13)) {
                                attrs["attacks-macro"] = newMacro;
                            } else if (isNPC && currMacros["attacks-macro-npc"].slice(13) !== newMacro.slice(13)) {
                                attrs["attacks-macro-npc"] = newMacro;
                            }
                        }
                    } catch (err) {
                        TAS.error("PFAttackGrid.resetCommandMacro", err);
                    } finally {
                        if (_.size(attrs) > 0) {
                            setAttrs(attrs, { silent: true }, done);
                        } else {
                            done();
                        }
                    }
                });
            });
        });
    });
}
export function migrate (callback, oldversion){
    var done = function () {
        TAS.debug("leaving PFAttackGrid.migrate");
        if (typeof callback === "function") {
            callback();
        }
    };
    PFMigrate.migrateAltAttackGridrowFlags();
    done();
}
/** recalculates all write-to fields in module 
 * @param {function} callback optional call when done
 * @param {boolean} silently optional if true call setAttrs with PFConst.silentParams
 * @param {number} oldversion the version upgrading from 
 */
export function recalculate  (callback, silently, oldversion) {
    var done = function () {
        TAS.debug("leaving PFAttackGrid.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    },
    doneAttack=_.after(7,done),
    callUpdateAttacksAndDamage = _.once(function(){
        _.each(attackGridFields, function (attrMap, attack) {
            updateAttack(attack,null,doneAttack,silently);
        });
        updateDamage(doneAttack,silently);
    }),
    callApplyConditions = _.once(function(){
        applyConditions(callUpdateAttacksAndDamage,silently);
    });
    //TAS.debug"At PFAttackGrid.recalculate");
    migrate(callApplyConditions,oldversion);
}
function registerEventHandlers () {
    _.each(attackGridFields, function (attackFields, attack) {
        on("change:bab change:" + attackFields.size, TAS.callback(function eventBABSizeAbilityModchange(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            updateAttack(attack);
        }));
        on("change:" + attackFields.misc, TAS.callback(function eventAttackMisc(eventInfo) {
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                updateAttack(attack);
            }
        }));
        on("change:attk-penalty change:" + attackFields.abilityMod + " change:" + attackFields.buff, TAS.callback(function eventAttackPenalty(eventInfo) {
            if (eventInfo.sourceType === "sheetworker") {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                updateAttack(attack);
            }
        }));
    });
    on("change:buff_Melee-total", TAS.callback(function meleebuffEventMelee(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker") {
            updateAttack('melee', eventInfo);
            updateAttack('melee2', eventInfo);
            updateAttack('CMB', eventInfo);
            updateAttack('CMB2', eventInfo);
        }
    }));
    on("change:buff_Ranged-total", TAS.callback(function meleebuffEventRanged(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker") {
            updateAttack('ranged', eventInfo);
            updateAttack('ranged2', eventInfo);
        }
    }));
    on("change:acp-attack-mod", TAS.callback(function PFAttackGrid_applyConditions(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        applyConditions();
    }));
}
registerEventHandlers();
PFConsole.log('   PFAttackGrid module loaded     ');
PFLog.modulecount++;
