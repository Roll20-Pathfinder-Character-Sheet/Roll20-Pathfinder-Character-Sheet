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
        "buff": "buff_CMB-total",
        "abilityMod": "CMB-ability-mod",
        "misc": "attk-CMB-misc",
        "crit": "attk_cmb_crit_conf",
        "attackmacro": "@{toggle_global_cmb_macro_insert}",
        "damagemacro": "@{toggle_global_cmb_damage_macro_insert}"
    },
    "CMB2": {
        "size": "CMD-size",
        "atk": "CMB2",
        "buff": "buff_CMB-total",
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
    }),
    fields;
    if (attackGridFields[attype]) {
        fields=[attackGridFields[attype].atk, "bab", "attk-penalty", attackGridFields[attype].abilityMod,
            attackGridFields[attype].misc, attackGridFields[attype].size, attackGridFields[attype].buff
            ];
        if (attype==='CMB'){
            fields.push('buff_Melee-total');
        }
        SWUtils.updateRowTotal(fields, 0, [], false, done, silently);
    } else {
        TAS.error("PFAttackGrid.updateAttack attack grid fields do not exist for: " + attype);
        done();
    }
}



function getTopMacros(setter,v){
    var header="{{row01= **^{base-attacks}** }} {{row02=[^{melee}](~@{character_id}|Melee-Attack-Roll) [^{ranged}](~@{character_id}|Ranged-Attack-Roll) [^{combat-maneuver-bonus-abbrv}](~@{character_id}|CMB-Check) [^{melee2}](~@{character_id}|Melee2-Attack-Roll)",
        npcHeader="{{row01= **^{base-attacks}** }} {{row02=[^{melee}](~@{character_id}|NPC-Melee-Attack-Roll) [^{ranged}](~@{character_id}|NPC-Ranged-Attack-Roll) [^{combat-maneuver-bonus-abbrv}](~@{character_id}|NPC-CMB-Check) [^{melee2}](~@{character_id}|NPC-Melee2-Attack-Roll)",
        extraattacks="",
        npcextraattacks="",
        ranged2BaseAttacks = " [^{ranged2}](~@{character_id}|Ranged2-Attack-Roll)",
        cmb2BaseAttacks = " [^{combat-maneuver-bonus-abbrv2}](~@{character_id}|CMB2-Check)",
        npcranged2BaseAttacks = " [^{ranged2}](~@{character_id}|npc-Ranged2-Attack-Roll)",
        npccmb2BaseAttacks = " [^{combat-maneuver-bonus-abbrv2}](~@{character_id}|npc-CMB2-Check)";
    try {
        //TAS.debug("at PFAttackGrid.getTopMacros",v);
        setter = setter||{};
        if (parseInt(v.ranged_2_show, 10)) {
            extraattacks+=ranged2BaseAttacks;
            npcextraattacks+=npcranged2BaseAttacks;
        }
        if (parseInt(v.cmb_2_show, 10)) {
            extraattacks+=cmb2BaseAttacks;
            npcextraattacks+=npccmb2BaseAttacks;
        }
        header += extraattacks + " }}";
        npcHeader += npcextraattacks + " }}";
        //TAS.debug("PFAtackGrid.getTopMenus new macros are: ", header, npcHeader);
        if (v.attacks_header_macro !== header || v["NPC-attacks_header_macro"] !== npcHeader ){
            setter.attacks_header_macro = header;
            setter["NPC-attacks_header_macro"] = npcHeader;
        }
    } catch (err){
        TAS.error("PFAttackGrid.getTopMacros",err);
    } finally {
        return setter;
    }
}
export function setTopMacros (callback){
    var done = _.once(function(){
        if (typeof callback === "function"){
            callback();
        }
    });
    //TAS.debug("at PFAttackGrid.setTopMacros");
    getAttrs(["attacks_header_macro","NPC-attacks_header_macro", "ranged_2_show", "cmb_2_show"],function(v){
        var setter = {};
        getTopMacros(setter,v);
        if (_.size(setter) && (v.attacks_header_macro !== setter.attacks_header_macro || 
                v["NPC-attacks_header_macro"] !== setter["NPC-attacks_header_macro"] ) ) {
            setAttrs(setter,PFConst.silentParams,done);
        } else {
            done();
        }
    });
}

export function resetCommandMacro (callback){
    var done = _.after(2,function(){
        if (typeof callback === "function"){
            callback();
        }
    });
    TAS.debug("at PFAttackGrid.resetCommandMacro");
    PFMenus.resetOneCommandMacro('attacks',false,done," @{attacks_header_macro}",groupMapForMenu);
    PFMenus.resetOneCommandMacro('attacks',true,done," @{NPC-attacks_header_macro}",groupMapForMenu);
}
export function updateMelee(eventInfo){
    updateAttack('melee', eventInfo);
    updateAttack('melee2', eventInfo);
    updateAttack('CMB', eventInfo);
    updateAttack('CMB2', eventInfo);
}
export function updateRanged(eventInfo){
    updateAttack('ranged', eventInfo);
    updateAttack('ranged2', eventInfo);    
}
export function updateCMB(eventInfo){
    updateAttack('CMB', eventInfo);
    updateAttack('CMB2', eventInfo);
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
    setTopMacros();
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
        on("change:attk-penalty change:" + attackFields.abilityMod , TAS.callback(function eventAttackPenalty(eventInfo) {
            if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                updateAttack(attack);
            }
        }));
    });

    on("change:acp-attack-mod", TAS.callback(function PFAttackGrid_applyConditions(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        applyConditions();
    }));
    on("change:cmb_2_show change:ranged_2_show", TAS.callback(function displayRangedOrCMB2(eventInfo){
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType==="player" || eventInfo.sourceType === "api"){
            setTopMacros();
        }
    }));
}
registerEventHandlers();
PFConsole.log('   PFAttackGrid module loaded     ');
PFLog.modulecount++;
