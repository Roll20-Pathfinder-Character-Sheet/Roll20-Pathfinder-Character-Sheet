'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';
import * as PFUtilsAsync from './PFUtilsAsync';
import * as PFMigrate from './PFMigrate';
import * as PFMenus from './PFMenus';

export var attackGridFields = {
    "melee": {
        "size": "size",
        "atk": "attk-melee",
        "buff": "buff_Melee-total",
        "buff2":"",
        "pen": "condition-Prone",
        "abilityMod": "melee-ability-mod",
        "miscmacro": "attk-melee-misc",
        "misc": "attk-melee-misc-mod",
        "crit": "attk_melee_crit_conf",
        "attackmacro": "@{toggle_global_melee_macro_insert}",
        "damagemacro": "@{toggle_global_melee_damage_macro_insert}",
        "babdd": "melee_bab",
        "bab": "melee_bab-mod"        
    },
    "melee2": {
        "size": "size",
        "atk": "attk-melee2",
        "buff": "buff_Melee-total",
        "buff2": "buff_melee2-total",
        "pen": "condition-Prone",
        "abilityMod": "melee2-ability-mod",
        "miscmacro": "attk-melee2-misc",
        "misc": "attk-melee2-misc-mod",
        "crit": "attk_melee2_crit_conf",
        "attackmacro": "@{toggle_global_melee_macro_insert}",
        "damagemacro": "@{toggle_global_melee_damage_macro_insert}",
        "babdd": "melee2_bab",
        "bab": "melee2_bab-mod"
    },
    "ranged": {
        "size": "size",
        "atk": "attk-ranged",
        "buff": "buff_Ranged-total",
        "buff2":"",
        "pen": "",
        "abilityMod": "ranged-ability-mod",
        "miscmacro": "attk-ranged-misc",
        "misc": "attk-ranged-misc-mod",
        "crit": "attk_ranged_crit_conf",
        "attackmacro": "@{toggle_global_ranged_macro_insert}",
        "damagemacro": "@{toggle_global_ranged_damage_macro_insert}",
        "babdd": "ranged_bab",
        "bab": "ranged_bab-mod"
    },
    "ranged2": {
        "size": "size",
        "atk": "attk-ranged2",
        "buff": "buff_Ranged-total",
        "buff2": "buff_ranged2-total",
        "pen": "",
        "abilityMod": "ranged2-ability-mod",
        "miscmacro": "attk-ranged2-misc",
        "misc": "attk-ranged2-misc-mod",
        "crit": "attk_ranged2_crit_conf",
        "attackmacro": "@{toggle_global_ranged_macro_insert}",
        "damagemacro": "@{toggle_global_ranged_damage_macro_insert}",
        "babdd": "ranged2_bab",
        "bab": "ranged2_bab-mod"
    },
    "CMB": {
        "size": "CMD-size",
        "atk": "CMB",
        "buff": "buff_CMB-total",
        "buff2":"",
        "pen": "",
        "abilityMod": "CMB-ability-mod",
        "miscmacro": "attk-CMB-misc",
        "misc": "attk-CMB-misc-mod",
        "crit": "attk_cmb_crit_conf",
        "attackmacro": "@{toggle_global_cmb_macro_insert}",
        "damagemacro": "@{toggle_global_cmb_damage_macro_insert}",
        "babdd": "cmb_bab",
        "bab": "cmb_bab-mod"
    },
    "CMB2": {
        "size": "CMD-size",
        "atk": "CMB2",
        "buff": "buff_CMB-total",
        "buff2": "buff_cmb2-total",
        "pen": "",
        "abilityMod": "CMB2-ability-mod",
        "miscmacro": "attk-CMB2-misc",
        "misc": "attk-CMB2-misc-mod",
        "crit": "attk_cmb2_crit_conf",
        "attackmacro": "@{toggle_global_cmb_macro_insert}",
        "damagemacro": "@{toggle_global_cmb_damage_macro_insert}",
        "babdd": "cmb2_bab",
        "bab": "cmb2_bab-mod"
    }
};
var attkpenaltyAddToFields = [ "acp-attack-mod", "condition-Drained"],
attkpenaltySubtractFromFields = ["condition-Dazzled", "condition-Entangled", "condition-Grappled", "condition-Fear", "condition-Sickened", "condition-Wounds"],
attkpenaltySumRow = ["attk-penalty"].concat(attkpenaltyAddToFields),
groupMapForMenu = {'0':'none','@{attk-melee}':'melee','@{attk-melee2}':'melee',
        '@{attk-ranged}':'ranged','@{attk-ranged2}':'ranged2',
        '@{CMB}':'combat-maneuver-bonus-abbrv','@{CMB2}':'combat-maneuver-bonus-abbrv'};


/** updates the attk-penalty for attacks based on conditions including wearing armor you are not proficient in 
 *@param {function} callback optional call when done
 *@param {boolean} silently optional if true call SWUtils.setWrapper with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
export function applyConditions  (callback, silently, eventInfo) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    fields=[];
    SWUtils.updateRowTotal(attkpenaltySumRow, 0, attkpenaltySubtractFromFields, false, done, silently);
    getAttrs(['condition-Entangled','condition-Fatigued','condition-Invisible','condition_attack_notes','condition-Grappled','condition-Pinned'],function(v){
        var attackNote='',setter={};
        if(parseInt(v['condition-Entangled'],10)) {
            attackNote+='**'+SWUtils.getTranslated('entangled')+'**: ';
            attackNote+=SWUtils.getTranslated('condition-nocharge-note')+'\r\n';
        } else if( parseInt(v['condition-Fatigued'],10)){
            attackNote+='**'+SWUtils.getTranslated('Fatigued')+'**: ';
            attackNote+=SWUtils.getTranslated('condition-nocharge-note')+'\r\n';
        }
        if(parseInt(v['condition-Invisible'],10)){
            attackNote+='**'+SWUtils.getTranslated('invisible')+'**: ';
            attackNote+=SWUtils.getTranslated('condition-invisible-title')+'\r\n';
        }
        if(parseInt(v['condition-Grappled'],10)){
            attackNote+='**'+SWUtils.getTranslated('grappled')+'**: ';
            attackNote+=SWUtils.getTranslated('condition-grappled-cmb-note')+'\r\n';
        }
        if(attackNote!==v.condition_attack_notes){
            setter['condition_attack_notes'] = attackNote;
            SWUtils.setWrapper(setter,PFConst.silentParams);
        }
        //done is already called at end of updateRowTotal
    });
    
}

export function updateAttack(attype,v,setter){
    var currtot=0,newtot=0;
    try {
        setter=setter||{};
        currtot=v[attackGridFields[attype].atk];
        newtot = v[attackGridFields[attype].bab]+v["attk-penalty"]+v[attackGridFields[attype].abilityMod]+
        v[attackGridFields[attype].misc]+v[attackGridFields[attype].size]+v[attackGridFields[attype].buff]+
        v['buff_attack-total'];
        if (attackGridFields[attype].pen){
            newtot -= v[attackGridFields[attype].pen];
        }
        if (attackGridFields[attype].buff2){
             newtot += v[attackGridFields[attype].buff2];
        }
        if (newtot !== currtot){
            setter[attackGridFields[attype].atk]=newtot;
        }
    } catch (err){
        TAS.error("PFAttackGrid.updateAttack",err);
    } finally {
        return setter;
    }
}

/**
 * 
 * @param {string} attype 
 * @returns {[string]} for getAttrs
 */
function getOneSetAttackFields (attype){
    var fields=[];
    if (attackGridFields[attype]) {
        fields= _.chain(attackGridFields[attype]).values().flatten().compact().uniq().reject(function(a){return a.indexOf('macro')>=0; }).value().sort();
    }
    fields.push('attk-penalty');
    fields.push('buff_attack-total');
    TAS.debug("PFAttackGrid.getOneSetAttackFields returning fields for "+attype,fields);
    return fields;
}
/**
 * 
 * @param {[string]} attypes 
 * @returns {[string]} for getAttrs
 */
function getAttackFields (attypes){
    var fields=[],validtypes=[];
    validtypes = _.intersection( Object.keys(attackGridFields),attypes);
    fields= _.chain(validtypes).map(function(key){return _.values(attackGridFields[key]);}).flatten().compact().uniq().reject(function(a){return a.indexOf('macro')>=0; }).value().sort();
    fields.push('attk-penalty');
    fields.push('buff_attack-total');
    TAS.debug("PFAttackGrid.getAttackFields returning fields for ",attypes,fields);
    return fields;
}
/** updateAttack - updates one row of attack grid (left most column in grid)
 * Updates the attack type totals at top of attack page for one row of grid
 * @param {string} attype = key for attackGridFields to indicate which row from attack grid
 */
export function updateAttackAsync  (attype, callback, silently) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    fields,
    negfields=[];
    if (attackGridFields[attype]) {
        fields=getOneSetAttackFields(attype);
        fields.push('attk-penalty');
        fields.push('buff_attack-total');
        getAttrs(fields,function(vout){
            var v={},setter={},params={};
            try{
                v=_.reduce(vout,function(m,val,key){
                    m[key]=parseInt(val,10)||0;
                    return m;
                },{});
                setter=updateAttack(attype,v);
            } catch(err) {
                TAS.error("PFAttackGrid.updateAttack for "+attype,err);
            } finally {
                if(_.size(setter)){
                    if(silently){
                        params = PFConst.silentParams;
                    }
                    SWUtils.setWrapper(setter,params,callback);
                } else {
                    if(typeof(callback)==="function"){
                        callback();
                    }
                }
            }
        });
    } else {
        TAS.error("PFAttackGrid.updateAttack attack grid fields do not exist for: " + attype);
        done();
    }
}

export function updateAttacks(callback,silently,attypes){
    var fields,validtypes;
    try {
        if (!attypes){ 
            attypes = Object.keys(attackGridFields);
            validtypes = attypes;
        } else {
            validtypes =  _.intersection( Object.keys(attackGridFields),attypes);
            if(_.size(validtypes)!==_.size(attypes)){
                TAS.warn("Error in parameters, some of these are not valid attacks:",attypes);
            }
        }
        fields = getAttackFields(attypes);
      //  TAS.debug("PFAttackGrid.updateAttacks. Fields are:",fields);
    } catch(err1){
        TAS.error("PFAttackGrid.updateAttacks error creating list of fields for ",attypes,err1);
        if(typeof callback === "function"){
            callback();
        }
    }
    getAttrs(fields,function(vout){
        var v={},setter={},params={};
        try{
            v=_.reduce(vout,function(m,val,key){
                m[key]=parseInt(val,10)||0;
                return m;
            },{});
            setter=_.reduce(validtypes,function(m,key){
                m = updateAttack(key,v,m);
                return m;
            },{});
        } catch(err) {
            TAS.error("PFAttackGrid.updateAttacks ",err);
        } finally {
            if(_.size(setter)){
                if(silently){
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter,params,callback);
            } else {
                if(typeof(callback)==="function"){
                    callback();
                }
            }
        }
    });
}

/** wrapper for updateAttack
 * 
 * @param {string} buffType buff column without 'buff_' or '-total'
 * @param {*} eventInfo 
 */
export function updateAttackGrid(buffType,eventInfo){
    switch(buffType.toLowerCase()){
        case 'melee':
            updateAttacks(null, ['melee','melee2']);
            break;
        case 'ranged':
            updateAttacks(null, ['ranged','ranged2']);
            break;
        case 'cmb':
            updateAttacks(null, ['CMB','CMB2']);
            break;
        case 'melee2':
            updateAttackAsync('melee2');
            break;        
        case 'ranged2':
            updateAttackAsync('ranged2');
            break;
        case 'cmb2':
            updateAttackAsync('CMB2');
            break;
    }
}
export function recalculateMelee(dummy1,dummy2,eventInfo){
    updateAttacks(null, ['melee','melee2','CMB','CMB2']);
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
            SWUtils.setWrapper(setter,PFConst.silentParams,done);
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
    //TAS.debug("at PFAttackGrid.resetCommandMacro");
    PFMenus.resetOneCommandMacro('attacks',false,done," @{attacks_header_macro}",groupMapForMenu);
    PFMenus.resetOneCommandMacro('attacks',true,done," @{NPC-attacks_header_macro}",groupMapForMenu);
}

function updateAttackBABDropdownDiffs(callback,silently,eventInfo){
    var fieldUpdated = '',fields;
    if(!eventInfo){
        return;
    }
    fieldUpdated =eventInfo.sourceAttribute;
    fields=[fieldUpdated,'ranged_2_show','cmb_2_show'];
    fields = Object.keys(attackGridFields).reduce(function(m,a){
        m.push(a);
        m.push(attackGridFields[a].babdd);
        m.push(attackGridFields[a].bab);
        return m;
    },fields);
    getAttrs(fields,function(v){
        var newVal=0,setter={},silentSetter={},ranged2=0,cmb2=0;
        TAS.debug("updateAttackBABDropdownDiffs values", v);

        newVal=parseInt(v[fieldUpdated],10)||0;
        ranged2=parseInt(v.ranged_2_show,10)||0;
        cmb2= parseInt(v.cmb_2_show,10)||0;
        Object.keys(attackGridFields).filter(function(a){
            return ((a!=='ranged2'||ranged2) &&  (a!=='CMB2'||cmb2));
        }).filter(function(a){
            TAS.debug("a is "+a +", dropdown is "+attackGridFields[a].babdd+", val is "+ v[attackGridFields[a].babdd]);
            return ( (v[attackGridFields[a].babdd]||'').toLowerCase()===fieldUpdated.toLowerCase());
        }).forEach(function(a){
            var currVal=0,diff=0;
            currVal=parseInt(v[attackGridFields[a].bab],10)||0;
            diff=newVal-currVal;
            if(diff ){
                //update dropdown mod field
                silentSetter[attackGridFields[a].bab]=newVal;
                //update the attack type
                setter[a]=( (parseInt(v[a],10)||0)+diff   );
            }
        });
        if(_.size(silentSetter)){
            SWUtils.setWrapper(silentSetter,PFConst.silentParams);
        }
        if(_.size(setter)){
            SWUtils.setWrapper(setter,{},callback);
        } else if (typeof callback === "function") {
            callback();
        }
    });
}
export function migrate (callback, oldversion){
    PFMigrate.migrateAttackDropdowns(callback);
}
/** recalculates all write-to fields in module 
 * @param {function} callback optional call when done
 * @param {boolean} silently optional if true call SWUtils.setWrapper with PFConst.silentParams
 * @param {number} oldversion the version upgrading from 
 */
export var recalculate = TAS.callback(function callPFAttackGridRecalculate (callback, silently, oldversion) {
    var done = function () {
        //TAS.debug("leaving PFAttackGrid.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    },
    callUpdateAttacksAndDamage = _.once(function(){
        updateAttacks(done,silently);
    }),
    callApplyConditions = _.once(function(){
        applyConditions(callUpdateAttacksAndDamage,silently);
    });
    //TAS.debug"At PFAttackGrid.recalculate");
    migrate(callApplyConditions,oldversion);
    setTopMacros();
});
function registerEventHandlers () {
    var tempString='';
    _.each(attackGridFields, function (attackFields, attack) {
        on("change:" + attackFields.miscmacro, TAS.callback(function eventAttackMisc(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            SWUtils.evaluateAndAddToTotAsync(null,null,attackFields.miscmacro,attackFields.misc,attackFields.atk);
        }));
        on("change:"+attackFields.babdd, TAS.callback(function eventAttackGridUpdateBABorLevel(eventInfo) {
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                SWUtils.setDropdownAndAddToTotAsync(attackFields.babdd,attackFields.bab,attackFields.atk);
            }
        }));
        on("change:" + attackFields.bab + " change:" + attackFields.abilityMod + " change:" + attackFields.misc, TAS.callback(function eventAttackGridDropDownMod(eventInfo) {
            if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                updateAttackAsync(attack);
            }
        }));
    });

    on("change:attk-penalty", TAS.callback(function eventAttackPenalty(eventInfo) {
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            updateAttacks();
        }
    }));
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
    tempString="change:class-0-level change:class-1-level change:class-2-level change:class-3-level change:class-4-level change:class-5-level";
    on(tempString, TAS.callback(function classLevelUpdateDropdowns(eventInfo){
        if (eventInfo.sourceType==="player" || eventInfo.sourceType==="api"){
            updateAttackBABDropdownDiffs(null,null,eventInfo);
        }
    }));
    on("change:bab", TAS.callback(function classBABDropdowns(eventInfo){
        if (eventInfo.sourceType==="sheetworker" || eventInfo.sourceType==="api"){
            updateAttackBABDropdownDiffs(null,null,eventInfo);
        }
    }));

    
}
registerEventHandlers();
//PFConsole.log('   PFAttackGrid module loaded     ');
//PFLog.modulecount++;
