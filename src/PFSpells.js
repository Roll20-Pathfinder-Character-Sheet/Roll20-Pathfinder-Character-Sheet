'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog, PFConsole} from './PFLog';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';
import * as PFMigrate from './PFMigrate';
import * as PFMacros from './PFMacros';
import * as PFSpellOptions from './PFSpellOptions';
import * as PFAttackOptions from './PFAttackOptions';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFAttacks from './PFAttacks';
export var
//spell levels for repeating spell sections
spellLevels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
//for parsing: classes without their own spell lists plus bloodrager as sorcerer, whose list is not in compendium - hunter handled special
classesUsingOtherSpellLists = {
    "arcanist": "wizard",
    "investigator": "alchemist",
    "warpriest": "cleric",
    "skald": "bard",
    "bloodrager": "sorcerer"
};
var defaultRepeatingMacro='&{template:pf_spell} @{toggle_spell_accessible} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_spell}}} {{name=@{name}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{deafened_note=@{SpellFailureNote}}} @{spell_options}',
defaultRepeatingMacroMap = {
    '&{template:':{'current':'pf_spell}',old:['pf_generic}','pf_block}']},
    '@{toggle_spell_accessible}':{'current':'@{toggle_spell_accessible}'},
    '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
    '{{color=':{'current':'@{rolltemplate_color}}}'},
    '{{header_image=':{'current':'@{header_image-pf_spell}}}'},
    '{{name=':{'current':'@{name}}}'},
    '{{character_name=':{'current':'@{character_name}}}'},
    '{{character_id=':{'current':'@{character_id}}}'},
    '{{subtitle}}':{'current':'{{subtitle}}'},
    '{{deafened_note=':{'current':'@{SpellFailureNote}}}'},
    '@{spell_options}':{'current':'@{spell_options}'}},
defaultDeletedMacroAttrs=['@{toggle_accessible_flag}'];


export function resetCommandMacro (eventInfo, callback) {
    //TAS.debug("at PFSpells.resetCommandMacro");
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    repeatingSpellAttrs = ["spell_level","spellclass_number","name","school","slot","metamagic","used","isDomain","isMythic"],
    class0BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-0-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-0-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-0) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
    class1BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-1-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-1-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-1) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
    class2BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-2-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-2-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-2) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
    npcClass0BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-0-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-0-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-0) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
    npcClass1BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-1-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-1-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-1) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
    npcClass2BaseMacro = "&{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-2-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-2-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-2) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
    pcBaseMacro=[class0BaseMacro,class1BaseMacro,class2BaseMacro],
    npcBaseMacro=[npcClass0BaseMacro,npcClass1BaseMacro,npcClass2BaseMacro],
    resetToDefault = function(configV){
        var attrs = [],i=0;
        for(i=0;i<3;i++){
            if(configV["spellclass-"+i+"-book"].slice(13) !== pcBaseMacro[i].slice(13)){
                attrs["spellclass-"+i+"-book"]=pcBaseMacro[i];
            }
            if(configV["spellclass-"+i+"-book-npc"].slice(13) !== npcBaseMacro[i].slice(13)){
                attrs["spellclass-"+i+"-book-npc"]=npcBaseMacro[i];
            }
        }
        if (_.size(attrs) > 0) {
            SWUtils.setWrapper(attrs, {
                silent: true
            }, done);
        } else {
            done();
        }
    };
    getAttrs(["spellclass-0-casting_type", "spellclass-1-casting_type", "spellclass-2-casting_type", "spellclass-0-hide_unprepared", 
            "spellclass-1-hide_unprepared", "spellclass-2-hide_unprepared", "spellclass-0-book", "spellclass-1-book", "spellclass-2-book",
            "spellclass-0-book-npc", "spellclass-1-book-npc", "spellclass-2-book-npc", 
            "spellclass-0-show_domain_spells", "spellclass-1-show_domain_spells", "spellclass-2-show_domain_spells",
            "spellmenu_groupby_school", "spellmenu_show_uses", "mythic-adventures-show"], function (configV) {
        var isPrepared = [], showDomain = [], hideUnprepared = [], groupBySchool=0, showUses=0, usesMythic=0;
        try{
            isPrepared = [
                (parseInt(configV["spellclass-0-casting_type"], 10) === 2),
                (parseInt(configV["spellclass-1-casting_type"], 10) === 2),
                (parseInt(configV["spellclass-2-casting_type"], 10) === 2)];
            showDomain = [
                (parseInt(configV["spellclass-0-show_domain_spells"],10)||0),
                (parseInt(configV["spellclass-1-show_domain_spells"],10)||0),
                (parseInt(configV["spellclass-2-show_domain_spells"],10)||0)];
            hideUnprepared = [
                (parseInt(configV["spellclass-0-hide_unprepared"], 10) || 0),
                (parseInt(configV["spellclass-1-hide_unprepared"], 10) || 0),
                (parseInt(configV["spellclass-2-hide_unprepared"], 10) || 0)];
            groupBySchool = parseInt(configV["spellmenu_groupby_school"],10)||0;
            showUses = parseInt(configV["spellmenu_show_uses"],10)||0;
            usesMythic = parseInt(configV["mythic-adventures-show"],10)||0;
        } catch(outererr){
            TAS.error("PFSpells.resetCommandMacro, error assembling global vars",outererr);
            done();
            return;
        }
        getSectionIDs("repeating_spells", function (idarray) {
            var attrs = {};
            //TAS.debug(idarray);
            if (!idarray || idarray.length === 0) {
                resetToDefault(configV);
                return;
            }
            getAttrs(["_reporder_repeating_spells"], function (repValues) {
                //TAS.debug("PFSpells.resetCommandMacro order repValues:",repValues);
                var spellAttrs;
                try {
                spellAttrs = _.chain(idarray)
                    .map(function(id){
                        var prefix = 'repeating_spells_'+SWUtils.getRepeatingIDStr(id),
                        retVal = [];
                        _.each(repeatingSpellAttrs,function(attr){
                            retVal.push(prefix + attr);
                        });
                        return retVal;
                    })
                    .flatten()
                    .value();
                } catch (errouter2){
                    TAS.error("PFSpells.resetCommandMacro errouter",errouter2);
                    done();
                    return;
                }
                getAttrs(spellAttrs, function (values) {
                    //TAS.debug(values);
                    var orderedList, repList, filteredIds, spellsByClass, npcSpellsArray, customSorted=0,
                    spellsPC, spellsNPC, i,groups = [],
                    spellSchoolReg = /[^\(\[]*/,
                    attrs = {},rollTemplateCounter=0,
                    tempstr;
                    try {
                        if (!_.isUndefined(repValues._reporder_repeating_spells) && repValues._reporder_repeating_spells !== "") {
                            repList = repValues._reporder_repeating_spells.split(",");
                            repList = _.map(repList, function (ID) {
                                return ID.toLowerCase();
                            });
                            orderedList = _.intersection(_.union(repList, idarray), idarray);
                            customSorted = 1;
                        } else {
                            orderedList = idarray;
                        }
                        spellsByClass = _.chain(orderedList)
                        .map(function(id){
                            var prefix='', metaMagic=0,spellSlot=0,matches,schoolForGroup='',levelstr='',
                            rawlevel=0,spellClass='',classStr='',isDomain=0,isMythic=0,uses=0,name='';
                            try {
                                prefix = "repeating_spells_"+ SWUtils.getRepeatingIDStr(id);
                                metaMagic = parseInt(values[prefix + "metamagic"], 10)||0;
                                spellSlot = (metaMagic) ? (values[prefix + "slot"]||values[prefix + "spell_level"]) : values[prefix + "spell_level"];
                                schoolForGroup=values[prefix + "school"]||"";
                                matches = spellSchoolReg.exec(values[prefix + "school"]||"");
                                if (matches && matches[0]){
                                    schoolForGroup = SWUtils.trimBoth(matches[0]);
                                    schoolForGroup = schoolForGroup[0].toUpperCase() + schoolForGroup.slice(1).toLowerCase();
                                }
                                levelstr = "^{level} "+String(spellSlot);
                                rawlevel = parseInt(values[prefix + "spell_level"],10)||0;
                                spellClass = parseInt(values[prefix + "spellclass_number"],10)||0;
                                classStr = "class"+ (values[prefix + "spellclass_number"]||"0");
                                isDomain = parseInt(values[prefix + "isDomain"],10)||0;
                                isMythic = usesMythic * parseInt(values[prefix+"isMythic"],10)||0;
                                uses = parseInt(values[prefix + "used"],10)||0;
                                name = values[prefix+"name"]||"";
                            } catch (errmap){
                                TAS.error("PFSpells.resetCommandMacro errmap on id "+id,errmap);
                            } finally {
                                return { 'id': id,
                                    'level': spellSlot,
                                    'levelstr': levelstr,
                                    'rawlevel': rawlevel,
                                    'school': schoolForGroup,
                                    'spellClass': spellClass,
                                    'spellClassstr': classStr,
                                    'isDomain': isDomain,
                                    'isMythic': isMythic,
                                    'uses': uses,
                                    'name': name
                                };
                            }
                        })
                        .omit(function(spellObj){
                            return (hideUnprepared[spellObj.spellClass] && isPrepared[spellObj.spellClass] && spellObj.uses===0 &&
                                    !( showDomain[spellObj.spellClass] && spellObj.isDomain ));
                        })
                        .map(function(spellObj){
                            var spellName = spellObj.name, usesStr="",dstr="",mystr="",lvlstr="", spacestr="";
                            try {
                                spellName = SWUtils.escapeForChatLinkButton(spellName);
                                spellName = SWUtils.escapeForRollTemplate(spellName);
                                spellName = SWUtils.trimBoth(spellName);
                                usesStr = showUses?("("+spellObj.uses+")"):"";
                                if(showUses&&isPrepared[spellObj.spellClass]&&spellObj.isDomain){
                                    usesStr="";
                                }
                                mystr=spellObj.isMythic?"&#x1f11c;":""; //   // "&#x24A8;":"";//"(m)":"";//
                                dstr= spellObj.isDomain?"&#x1f113;":""; // "";  //"&#x249F;":"";//"(d)":"";//
                                lvlstr=groupBySchool?(spellObj.level+":"):"";
                                spacestr= (usesStr||mystr||dstr)?" ":"";
                                spellName = " ["+lvlstr + spellName + spacestr + dstr + mystr + usesStr + "]";
                            } catch (maperr){
                                TAS.error("PFSpells.resetCommandMacro error creating link name:",maperr);
                            } finally {
                                spellObj.pcChatLink = spellName+"(~@{character_id}|repeating_spells_" + spellObj.id + "_roll)";
                                spellObj.npcChatLink = spellName+"(~@{character_id}|repeating_spells_" + spellObj.id + "_npc-roll)";
                                return spellObj;
                            }
                        }).value();
                        if (!customSorted){
                            spellsByClass = _.sortBy(spellsByClass,'level');
                        }
                        spellsByClass = _.chain(spellsByClass)
                        .groupBy('spellClassstr')
                        .mapObject(function(classArray){
                            return _.chain(classArray)
                            .sortBy(groupBySchool?'school':'levelstr')
                            .groupBy(groupBySchool?'school':'levelstr')
                            .value();
                        })
                        .value();

                        
                        //TAS.debug("#############################");
                        //TAS.debug(spellsByClass);
                        //TAS.debug("#############################");
                        
                        //was 2 sets of 3 reduces but can do this faster with 3 each loops and populating both at once 
                        spellsPC={};
                        spellsNPC={};
                        rollTemplateCounter=10;
                        _.each(spellsByClass, function(groupList,classGroup){
                            var pcstr="",npcstr="";
                            _.each(groupList,function(spellList,groupName){
                                rollTemplateCounter++;
                                pcstr += " {{row"+rollTemplateCounter+"=**" + groupName+"**}}" ;
                                npcstr += " {{row"+rollTemplateCounter+"=**" + groupName+"**}}" ;
                                rollTemplateCounter++;
                                pcstr += " {{row"+rollTemplateCounter+"=";
                                npcstr += " {{row"+rollTemplateCounter+"=";
                                _.each(spellList,function(spellObj){
                                    pcstr += spellObj.pcChatLink;
                                    npcstr += spellObj.npcChatLink;
                                });
                                pcstr += "}}";
                                npcstr += "}}";
                            });
                            spellsPC[classGroup]=pcstr;
                            spellsNPC[classGroup]=npcstr;
                        });
                        //TAS.debug("#############################");
                        //TAS.debug(spellsPC,spellsNPC);
                        //TAS.debug("#############################");

                        for (i=0;i<3;i++){
                            tempstr = pcBaseMacro[i] + spellsPC['class'+i];
                            if (tempstr && configV["spellclass-"+i+"-book"].slice(13) !== tempstr.slice(13)) {
                                attrs["spellclass-"+i+"-book"]=tempstr;
                            } else if (!tempstr && configV["spellclass-"+i+"-book"].slice(13) !== pcBaseMacro[i].slice(13)){
                                attrs["spellclass-"+i+"-book"]="";
                            }
                            tempstr = npcBaseMacro[i] + spellsNPC['class'+i];
                            if (tempstr && configV["spellclass-"+i+"-book-npc"].slice(13) !== tempstr.slice(13)) {
                                attrs["spellclass-"+i+"-book-npc"]=tempstr;
                            } else if (!tempstr && configV["spellclass-"+i+"-book-npc"].slice(13) !== npcBaseMacro[i].slice(13)){
                                attrs["spellclass-"+i+"-book-npc"]="";
                            }	
                        }
                        if (_.size(attrs) > 0) {
                            SWUtils.setWrapper(attrs, {
                                silent: true
                            }, done);
                        } else {
                            done();
                        }
                    } catch (err) {
                        TAS.error("PFSpells.resetCommandMacro", err);
                        done();
                    }
                });
            });
        });
    });
}

/** update spells if a user changes "uses" on spell row
 * @param {string} dummy normally id but not used
 * @param {map} eventInfo from event, not used
 * @param {function} callbackwhen done
 * @param {boolean} silently if you want to update silently
 */
function updateSpellsPerDay(dummy,eventInfo,callback,silently){
    var done = _.once(function () {
        TAS.debug("leaving PFSpells.updateSpellsPerDay");
        if (typeof callback === "function") {
            callback();
        }
    }),
    fields = ['total_spells_manually','repeating_spells_used','repeating_spells_spellclass_number', 'repeating_spells_spell_level', 'repeating_spells_slot', 'repeating_spells_metamagic'];
    getAttrs(fields,function(v){
        var classNum=0, spellLevel,slot=0,metamagic=0,fieldname='',fieldname2='',initialtot={};
        TAS.debug("PFSpells.updateSpellsPerDay: ",v);
        if(!parseInt(v.total_spells_manually,10)){
            spellLevel= parseInt(v.repeating_spells_spell_level, 10);
            TAS.debug("total spells manually is off spellLEvel is "+spellLevel);
            if (!isNaN(spellLevel)){
                classNum = parseInt(v.repeating_spells_spellclass_number,10)||0;
                metamagic = parseInt(v.repeating_spells_metamagic, 10) || 0;
                if (metamagic){
                    slot = parseInt(v.repeating_spells_slot,10);
                    if(!isNaN(slot)){
                        spellLevel =slot;
                    }
                }
                //now update the spells per day for the associated class idx and spell level
                fieldname = "spellclass-" + classNum + "-level-" + spellLevel + "-spells-per-day";
                fieldname2 =  "spellclass-" + classNum + "-level-" + spellLevel + "-spells-prepared";
                initialtot[fieldname]=0;
                initialtot[fieldname2]=0;
                TAS.debug("about to set "+fieldname+", and "+ fieldname2);
                TAS.repeating('spells').attrs(fieldname,fieldname2).fields('row_id','used', 'spell_level', 'metamagic', 'slot').reduce(function (m, r) {
                    try {
                        if (r.I.spell_level===spellLevel || (r.I.metamagic && r.I.slot===spellLevel)){
                            m+=r.I.used;
                           // m[fieldname2]+=r.I.used;
                            TAS.debug("adding "+r.I.used);
                        }
                        TAS.debug(fieldname+" now at "+m);//, m);
                    } catch (innererr){
                        TAS.error("PFSpells.updateSpellsPerDay innererr",innererr);
                    } finally {
                        return m;
                    }
                }, 0 , function (m, r, a) {
                    a.S[fieldname] = m;
                    a.S[fieldname2] = m;
                }).execute(done);
            }  else { 
                done();
            }
        } else {
            done();
        }
    });
}

function getSpellTotals  (ids, v, setter) {
    var doNotProcess=0,
        casterTypeMap = {'spontaneous':1, 'prepared':2},
        casterTypes = [0,0,0],
        totalPrepped = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],
        totalListed = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
   try {
        doNotProcess = parseInt(v.total_spells_manually,10)||0;
        casterTypes[0] = parseInt(v['spellclass-0-casting_type'],10)||0;
        if (parseInt(v.spellclasses_multiclassed,10)) {
            casterTypes[1] = parseInt(v['spellclass-1-casting_type'],10)||0;
            casterTypes[2] = parseInt(v['spellclass-2-casting_type'],10)||0;
        }
        _.each(ids, function (id) {
            var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id),
                spellLevel, classNum=0, metamagic=0,slot,uses=0;
            try {
                spellLevel = parseInt(v[prefix + "spell_level"], 10);
                if ( !isNaN(spellLevel) ) {
                    classNum = parseInt(v[prefix + "spellclass_number"], 10)||0;
                    metamagic = parseInt(v[prefix + "metamagic"], 10) || 0;
                    slot = parseInt(v[prefix + "slot"], 10);
                    if (metamagic && !isNaN(slot)){
                        spellLevel = slot;
                    }
                    totalListed[classNum][spellLevel] += 1;
                    if (!doNotProcess){
                        uses = parseInt(v[prefix + "used"], 10) || 0;
                        totalPrepped[classNum][spellLevel] += uses;
                    }
                } else {
                    TAS.warn("PFSpells.getSpellTotals: Spelllevel NAN: spellLevel:"+ spellLevel);
                }
            } catch (err2){
                TAS.error("PFSpells.getSpellTotals err2",err2);
            }
        });

        _.each(PFConst.spellClassIndexes, function (classidx) {
            _.each(spellLevels, function (spellLevel) {
                var prefix="spellclass-" + classidx + "-level-" + spellLevel , total=0,prepped=0,perday=0;
                total = parseInt(v[prefix + "-total-listed"], 10) || 0;
                if (total!== totalListed[classidx][spellLevel]) {
                    setter[prefix + "-total-listed"] = totalListed[classidx][spellLevel];
                }
                //prepped  = parseInt(v[prefix + "-spells-prepared"], 10) || 0;
                perday = parseInt(v[prefix + "-spells-per-day"], 10) || 0;
                if ( casterTypes[classidx]>0 && !doNotProcess){
                    //if (prepped !== totalPrepped[classidx][spellLevel]) {
                    //    setter[prefix + "-spells-prepared"] = totalPrepped[classidx][spellLevel];
                    //}
                    if (perday !== totalPrepped[classidx][spellLevel]) {
                        setter[prefix + "-spells-per-day"] = totalPrepped[classidx][spellLevel];						
                    }
                } else {
                    //if (prepped !== 0){
                    //    setter[prefix + "-spells-prepared"] =0;
                    //}
                    if (perday !== 0){
                        setter[prefix + "-spells-per-day"] = 0;
                    }
                }
            });
        });
    } catch (err) {
        TAS.error("PFSpells.getSpellTotals", err);
    } finally {
        return setter;
    }
}

export function resetSpellsTotals  (dummy, eventInfo, callback, silently) {
    var done = _.once(function () {
        TAS.debug("leaving PFSpells.resetSpellsTotals");
        if (typeof callback === "function") {
            callback();
        }
    });
    
    getSectionIDs("repeating_spells", function (ids) {
        var fields = ['total_spells_manually','spellclasses_multiclassed','spellclass-0-casting_type','spellclass-1-casting_type','spellclass-2-casting_type'],
        rowattrs = ['spellclass_number', 'spell_level', 'slot', 'metamagic', 'used'];
        try {
            _.each(ids, function (id) {
                var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                _.each(rowattrs, function (attr) {
                    fields.push(prefix + attr);
                });
            });
            _.each(PFConst.spellClassIndexes, function (classidx) {
                _.each(spellLevels, function (spellLevel) {
                    fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-total-listed");
                    fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-spells-prepared");
                    fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-spells-per-day");
                });
            });
            getAttrs(fields, function (v) {
                var setter = {};
                try {
                    setter = getSpellTotals(ids, v, setter);
                    if (_.size(setter)) {
                        SWUtils.setWrapper(setter, PFConst.silentParams, done);
                    } else {
                        done();
                    }
                } catch (innererr) {
                    TAS.error("PFSpells.resetSpellsTotals innererror:", innererr);
                    done();
                }
            });
        } catch (err) {
            TAS.error("PFSpells.resetSpellsTotals:", err);
            done();
        }
    });
}
/* ******************************** REPEATING SPELL FUNCTIONS ********************************** */
function setAttackEntryVals (spellPrefix,weaponPrefix,v,setter,noName){
    var notes="",attackType="";
    setter = setter||{};
    try {
        attackType=PFUtils.findAbilityInString(v[spellPrefix + "spell-attack-type"]);
        if (v[spellPrefix + "name"]) {
            if(!noName){
                setter[weaponPrefix + "name"] = v[spellPrefix + "name"];
            }
            setter[weaponPrefix + "source-spell-name"] = v[spellPrefix + "name"];
        }
        if (attackType) {
            setter[weaponPrefix + "attack-type"] = v[spellPrefix + "spell-attack-type"];
            if ((/CMB/i).test(attackType)) {
                setter[weaponPrefix + "vs"] = "cmd";
            } else {
                setter[weaponPrefix + "vs"] = "touch";
            }
        }
        if (v[spellPrefix+"range_numeric"]){
            setter[weaponPrefix + "range"]=v[spellPrefix+"range_numeric"];
        }
        if (v[spellPrefix+"range"] && v[spellPrefix+"range_pick"]==="see_text" ){
            notes += "Range:" + v[spellPrefix+"range"];
        }
        
        if (v[spellPrefix +"damage-macro-text"]){
            setter[weaponPrefix+"precision_dmg_macro"] = v[spellPrefix+"damage-macro-text"];
            if(attackType){
                setter[weaponPrefix+"critical_dmg_macro"] = v[spellPrefix+"damage-macro-text"];
            }
        }
        if (v[spellPrefix+ "damage-type"]){
            setter[weaponPrefix+"precision_dmg_type"] = v[spellPrefix+"damage-type"];
            if(attackType){
                setter[weaponPrefix+"critical_dmg_type"] = v[spellPrefix+"damage-type"];
            }
        }
        if (v[spellPrefix+"save"]){
            notes += "Save: "+ v[spellPrefix+"save"] + " DC: " + v[spellPrefix+"savedc"];
        }
        if ( v[spellPrefix+"sr"]){
            if (notes) { notes += ", ";}
            notes += "Spell resist:"+ v[spellPrefix+"sr"];
        }
        if (notes){
            setter[weaponPrefix+"notes"]=notes;
        }
    } catch (err){
        TAS.error("PFSpells.setAttackEntryVals",err);
    } finally {
        return setter;
    }
}
/*Triggered from a button in repeating spells */
export function createAttackEntryFromRow  (id, callback, silently, eventInfo, weaponId) {
    var done = _.once(function () {
        TAS.debug("leaving PFSpells.createAttackEntryFromRow");
        if (typeof callback === "function") {
            callback();
        }
    }),
    attribList = [],
    itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : ""),
    idStr = SWUtils.getRepeatingIDStr(id),
    item_entry = 'repeating_spells_' + idStr,
    attributes = ["range_pick","range","range_numeric","damage-macro-text","damage-type","sr","savedc","save"],
    commonAttributes = ["spell-attack-type","name"];
    
    //TAS.debug("at PFSpells creatattack entry ");
    attributes.forEach(function(attr){
        attribList.push(item_entry +  attr);
    });
    commonAttributes.forEach(function (attr) {
        attribList.push(item_entry +  attr);
    });
    //TAS.debug("attribList=" + attribList);
    getAttrs(attribList, function (v) {
        var newRowId="",
        setter = {},
        prefix = "repeating_weapon_",
        idStr="",
        params = {};
        try {
            //TAS.debug("at PFSpells.createAttackEntryFromRow",v);
            if (!PFUtils.findAbilityInString(v[item_entry + "spell-attack-type"]) && !v[item_entry + "damage-macro-text"]) {
                TAS.warn("no attack to create for spell "+ v[item_entry+"name"] +", "+ itemId );
            } else {
                if (! weaponId ){
                    newRowId = generateRowID();
                } else {
                    newRowId = weaponId;
                }
                idStr = newRowId+"_";
                prefix += idStr;
                setter = setAttackEntryVals(item_entry, prefix,v,setter,weaponId);
                setter[prefix + "source-spell"] = itemId;
                setter[prefix+"group"]="Spell";
				setter[prefix+'link_type']=PFAttacks.linkedAttackType.spell;
            }
        } catch (err) {
            TAS.error("PFSpells.createAttackEntryFromRow", err);
        } finally {
            if (_.size(setter)>0){
                setter[item_entry + "create-attack-entry"] = 0;
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, {}, function(){
                    //can do these in parallel
                    PFAttackOptions.resetOption(newRowId);
                    PFAttackGrid.resetCommandMacro();
                    done();
                });
            } else {
                setter[item_entry + "create-attack-entry"] = 0;
                SWUtils.setWrapper(setter,PFConst.silentParams,done);
            }
        }
    });
}
export function updateAssociatedAttack (id, callback, silently, eventInfo) {
    var done = _.once(function () {
        //TAS.debug("leaving PFSpells.updateAssociatedAttack");
        if (typeof callback === "function") {
            callback();
        }
    }),
    itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : ""),
    item_entry = 'repeating_spells_' + SWUtils.getRepeatingIDStr(itemId),
    attrib = (eventInfo ? SWUtils.getAttributeName(eventInfo.sourceAttribute) : ""),
    attributes=[];
    if (attrib){
        attributes = [item_entry+attrib];
        if ((/range/i).test(attrib)){
            attributes =[item_entry+'range_pick',item_entry+'range',item_entry+'range_numeric'];
        }
    } else {
        attributes = ["range_pick", "range", "range_numeric", "damage-macro-text", "damage-type", "sr", "savedc", "save", "spell-attack-type", "name"];
    }
    getAttrs(attributes,function(spellVal){
        getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
            var spellsourcesFields=[];
            spellsourcesFields = _.reduce(idarray,function(memo,currentID){
                memo.push("repeating_weapon_"+currentID+"_source-spell");
                return memo;
            },[]);
            getAttrs(spellsourcesFields,function(v){
                var setter={}, params={},idlist=[];
                try {
                    _.each(idarray,function(currentID){
                        var prefix = "repeating_weapon_"+currentID+"_";
                        if (v[prefix+"source-spell"]===itemId){
                            idlist.push(currentID);
                            setter= setAttackEntryVals(item_entry, prefix,spellVal,setter);
                        }
                    });
                    if (silently) {
                        params = PFConst.silentParams;
                    }
                } catch (err){
                    TAS.error("PFSpells.updateAssociatedAttack",err);
                } finally {
                    if (_.size(setter)>0){
                        SWUtils.setWrapper(setter, params, function(){
                            PFAttackOptions.resetSomeOptions(idlist);
                        });
                    } else {
                        done();
                    }
                }
                
            });
        });
    });
}
function updatePreparedSpellState (id, eventInfo) {
    getAttrs(["repeating_spells_used", "repeating_spells_spellclass_number", "repeating_spells_prepared_state", "spellclass-0-hide_unprepared", "spellclass-1-hide_unprepared", "spellclass-2-hide_unprepared"], function (values) {
        var uses = parseInt(values.repeating_spells_used, 10) || 0,
        preparedState = parseInt(values.repeating_spells_prepared_state, 10) || 0,
        classnum = values["repeating_spells_spellclass_number"],
        isPrepared = (parseInt(values["spellclass-" + classnum + "-casting_type"], 10) || 0) === 2 ? 1 : 0,
        hideUnprepared = isPrepared * (parseInt(values["spellclass-" + classnum + "-hide_unprepared"], 10) || 0),
        setter = {};
        if (uses > 0 && preparedState === 0) {
            setter["repeating_spells_prepared_state"] = "1";
        } else if (uses < 1 && preparedState !== 0) {
            setter["repeating_spells_prepared_state"] = "0";
        }
        if (_.size(setter)) {
            if (hideUnprepared) {
                SWUtils.setWrapper(setter, PFConst.silentParams, resetCommandMacro());
            } else {
                SWUtils.setWrapper(setter, {
                    silent: true
                });
            }
        }
    });
}
/** - sets prepared_state to 1 if used has a value > 0 */
function resetSpellsPrepared () {
    getSectionIDs("repeating_spells", function (ids) {
        var fieldarray = [];
        _.each(ids, function (id) {
            var idStr = SWUtils.getRepeatingIDStr(id),
            prefix = "repeating_spells_" + idStr;
            fieldarray.push(prefix + "used");
            fieldarray.push(prefix + "prepared_state");
        });
        getAttrs(fieldarray, function (v) {
            var setter = {};
            _.each(ids, function (id) {
                var idStr = SWUtils.getRepeatingIDStr(id),
                prefix = "repeating_spells_" + idStr,
                uses = parseInt(v[prefix + "used"], 10) || 0,
                preparedState = parseInt(v[prefix + "prepared_state"], 10) || 0,
                setter = {};
                if (uses > 0 && preparedState === 0) {
                    setter[prefix + "prepared_state"] = "1";
                    //TAS.debug("resetSpellsPrepared, setting to 1:" + prefix);
                } else if (uses < 1 && preparedState !== 0) {
                    setter[prefix + "prepared_state"] = "0";
                }
            });
            if (_.size(setter)) {
                SWUtils.setWrapper(setter, {
                    silent: true
                });
            }
        });
    });
}
/************* SPELL OPTIONS *********************/
/** updates all spells when level or concentration or spell penetration is updated 
*@param {int} classIdx 0..2
*@param {object} eventInfo from on event 
*@param {function} callback when done
*/
export function updateSpellsCasterLevelRelated (classIdx, eventInfo, callback) {
    var done = _.once(function(){
        if (typeof callback === "function"){
            callback();
        }
    });
    //TAS.debug("updateSpellsCasterLevelRelated", eventInfo);
    if (!(classIdx >= 0 && classIdx <= 2) || isNaN(parseInt(classIdx, 10))) {
        done();
        return;
    }
    getAttrs(["spellclass-" + classIdx + "-level-total", "spellclasses_multiclassed", "Concentration-" + classIdx + "-misc", "spellclass-" + classIdx + "-name",
        "spellclass-" + classIdx + "-SP-mod", "Concentration-" + classIdx + "-def", "Concentration-" + classIdx + "-mod"],function(vout){
        var classLevel = parseInt(vout["spellclass-" + classIdx + "-level-total"], 10) || 0,
            abilityMod = parseInt(vout["Concentration-" + classIdx + "-mod"], 10) || 0,
            multiclassed = parseInt(vout["spellclasses_multiclassed"], 10) || 0,
            defMod = parseInt(vout["Concentration-" + classIdx + "-def"], 10),
            classConcentrationMisc = parseInt(vout["Concentration-" + classIdx + "-misc"], 10) || 0,
            classSPMisc = parseInt(vout["spellclass-" + classIdx + "-SP-mod"], 10) || 0,
            newClassName = vout["spellclass-" + classIdx + "-name"],
            updateDefensiveCasting = eventInfo ? (/\-def$/i.test(eventInfo.sourceAttribute)) : false;
        if (classLevel <= 0) {
            done();
            return;
        }
        //TAS.debug("updateSpellsCasterLevelRelated,class:"+classIdx+", class values:",vout);				
        getSectionIDs("repeating_spells", function (ids) {
            var rowFieldAppnd = ['casterlevel', 'CL_misc', 'spell_class_r', 'spellclass_number', 'spellclass', 'range', 'range_numeric', 'range_pick', 'SP-mod', 'SP_misc', 'Concentration_misc', 'Concentration-mod', 'spell_options'],
            fields = _.reduce(ids, function (memo, id) {
                var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id), row;
                row = _.map(rowFieldAppnd, function (field) {
                    return prefix + field;
                });
                return memo.concat(row);
            }, ['spellclass-0-name']);
            getAttrs(fields, function (v) {
                var doneOneRow = _.after(_.size(ids),done),
                classNumSetter = {},
                setter = {};
                try {
                    //TAS.debug("updateSpellsCasterLevelRelated,class:"+classIdx+", spells:",v);
                    _.each(ids, function (id) {
                        var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id),
                        classNum = parseInt(v[prefix + "spellclass_number"], 10),
                        classRadio = parseInt(v[prefix + "spell_class_r"], 10),
                        chosenRange = v[prefix + "range_pick"] || "",
                        currRange = parseInt(v[prefix + "range_numeric"], 10) || 0,
                        spellConcentrationMisc = parseInt(v[prefix + "Concentration_misc"], 10) || 0,
                        optionText = v[prefix + "spell_options"],
                        setOption = 0,
                        tempstr = "",
                        casterlevel = 0,
                        newcasterlevel = 0,
                        newConcentration = 0,
                        newSP = 0,
                        newClassName = "",
                        newRange = 0;
                        try {
                            if (isNaN(classNum)) {
                                classNum = 0;
                                classNumSetter[prefix + "spellclass_number"] = 0;
                                classNumSetter[prefix + "spellclass"] = v['spellclass-0-name'];
                            } else if (!multiclassed || classNum === classIdx) {
                                if (classNum !== classRadio || isNaN(classRadio)) {
                                    setter[prefix + "spell_class_r"] = classNum;
                                }
                                newClassName = v['spellclass-'+classNum+'-name'];
                                if (newClassName !== v[prefix + "spellclass"]) {
                                    setter[prefix + "spellclass"] = newClassName;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.spellclass, PFSpellOptions.optionTemplates.spellclass.replace("REPLACE", SWUtils.escapeForRollTemplate(v[prefix + "spellclass"])));
                                        setOption = 1;
                                    }
                                }
                                casterlevel = parseInt(v[prefix + "casterlevel"], 10);
                                newcasterlevel = classLevel + (parseInt(v[prefix + "CL_misc"], 10) || 0);
                                if (newcasterlevel < 1) {
                                    newcasterlevel = 1;
                                }
                                if (newcasterlevel !== casterlevel || isNaN(casterlevel)) {
                                    casterlevel = newcasterlevel;
                                    setter[prefix + "casterlevel"] = newcasterlevel;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.casterlevel, PFSpellOptions.optionTemplates.casterlevel.replace("REPLACE", newcasterlevel));
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.casterlevel_chk, PFSpellOptions.optionTemplates.casterlevel_chk.replace("REPLACE", newcasterlevel));
                                        setOption = 1;
                                    }
                                }
                                newRange = PFUtils.findSpellRange(v[prefix + "range"], chosenRange, casterlevel) || 0;
                                if (newRange !== currRange) {
                                    setter[prefix + "range_numeric"] = newRange;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.range, PFSpellOptions.optionTemplates.range.replace("REPLACE", newRange));
                                        setOption = 1;
                                    }
                                }
                                if (updateDefensiveCasting && optionText) {
                                    if (defMod > 0) {
                                        tempstr = PFSpellOptions.optionTemplates.cast_def.replace("REPLACE", defMod);
                                    } else {
                                        tempstr = "{{cast_def=}}";
                                    }
                                    if (optionText.indexOf("{{cast_def=") >= 0) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.cast_def, tempstr);
                                    } else {
                                        optionText += tempstr;
                                    }
                                    setOption = 1;
                                }
                                newConcentration = newcasterlevel + abilityMod + classConcentrationMisc + spellConcentrationMisc;
                                if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                                    setter[prefix + "Concentration-mod"] = newConcentration;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration, PFSpellOptions.optionTemplates.Concentration.replace("REPLACE", newConcentration));
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration_chk, PFSpellOptions.optionTemplates.Concentration_chk.replace("REPLACE", newConcentration));
                                        setOption = 1;
                                    }
                                }
                                newSP = classSPMisc + (parseInt(v[prefix + "SP_misc"], 10) || 0);
                                if (newSP !== (parseInt(v[prefix + "SP-mod"], 10) || 0)) {
                                    setter[prefix + "SP-mod"] = newSP;
                                    if (optionText) {
                                        optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.spellPen, PFSpellOptions.optionTemplates.spellPen.replace("REPLACE", newSP));
                                        setOption = 1;
                                    }
                                }
                                if (setOption) {
                                    setter[prefix + "spell_options"] = optionText;
                                }
                            }
                        } catch (innererror) {
                            TAS.error("updateSpellsCasterLevelRelated innererror on id: "+id,innererror);
                        }
                    });
                    
                } catch (err){
                    TAS.error("updateSpellsCasterLevelRelated error:",err);
                } finally {
                    if (_.size(setter) > 0 || _.size(classNumSetter) > 0) {
                        //TAS.debug"updateSpellsCasterLevelRelated, setting:",classNumSetter,setter);
                        if (_.size(classNumSetter) > 0) {
                            SWUtils.setWrapper(classNumSetter,{},done);
                        }
                        if (_.size(setter) > 0) {
                            SWUtils.setWrapper(setter, PFConst.silentParams, done);
                        }
                    } else {
                        done();
                    }
                }
            });
        });
    });
}
/** updates all spells when caster ability or DCs are updated 
 *@param {int} classIdx 0..2
 *@param {map} eventInfo from on event 
 *@param {function} callback when done
 */
export function updateSpellsCasterAbilityRelated (classIdx, eventInfo, callback) {
    var done = _.once(function(){
        if (typeof callback === "function"){
            callback();
        }
    });
    //TAS.debug("updateSpellsCasterAbilityRelated", eventInfo);
    if (!(classIdx >= 0 && classIdx <= 2) || isNaN(parseInt(classIdx, 10))) {
        done();
        return;
    }
    getAttrs(["spellclass-" + classIdx + "-level-total", "Concentration-" + classIdx + "-mod", "Concentration-" + classIdx + "-misc", "spellclasses_multiclassed"],function(vout){
        var abilityMod, classConcentrationMisc,multiclassed;
        try {
            abilityMod = parseInt(vout["Concentration-" + classIdx + "-mod"], 10) || 0;
            classConcentrationMisc = parseInt(vout["Concentration-" + classIdx + "-misc"], 10) || 0;
            multiclassed = parseInt(vout["spellclasses_multiclassed"], 10) || 0;
            if (!parseInt(vout["spellclass-" + classIdx + "-level-total"],10)){
                done();
                return;
            }
            //var updateAbilityScore = eventInfo?(/concentration\-[012]\-mod/i.test(eventInfo.sourceAttribute)):true;
            getSectionIDs("repeating_spells", function (ids) {
                var fields=[];
                //TAS.debug("updateSpellsCasterAbilityRelated",classIdx,eventInfo);
                //TAS.debug(ids);
                _.each(ids, function (id) {
                    var prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id);
                    fields = fields.concat([prefix + "spellclass_number", prefix + "spell_level", prefix + "spell_level_r", prefix + "spellclass_number",
                    prefix + "casterlevel", prefix + "DC_misc", prefix + "savedc", prefix + "Concentration-mod", prefix + "Concentration_misc", prefix + "spell_options"]);
                });
                getAttrs(fields, function (v) {
                    var newConcentration = 0,
                    casterlevel = 0,
                    setter = {};
                    try {
                        TAS.debug("updateSpellsCasterAbilityRelated,class:"+classIdx+", spells:", v);
                        _.each(ids, function (id) {
                            var spellLevel = 0, spellLevelRadio = 0, newDC = 0, setOption = 0, currDC = 0,
                            prefix = "repeating_spells_" + SWUtils.getRepeatingIDStr(id),
                            optionText = v[prefix + "spell_options"],
                            spellConcentrationMisc = parseInt(v[prefix + "Concentration_misc"], 10) || 0;
                            try {
                                if (!multiclassed || parseInt(v[prefix + "spellclass_number"], 10) === classIdx) {
                                    spellLevel = parseInt(v[prefix + "spell_level"], 10);
                                    spellLevelRadio = parseInt(v[prefix + "spell_level_r"], 10);
                                    if (isNaN(spellLevel)) {
                                        TAS.warn("spell level is NaN for " + prefix);
                                        if (spellLevelRadio !== -1 || isNaN(spellLevelRadio)) {
                                            setter[prefix + "spell_level_r"] = "-1";
                                            //setter[prefix + "savedc"] = 0;
                                        }
                                    } else {
                                        if (spellLevel !== spellLevelRadio || isNaN(spellLevelRadio)) {
                                            setter[prefix + "spell_level_r"] = spellLevel;
                                        }
                                        newDC = 10 + spellLevel + abilityMod + (parseInt(v[prefix + "DC_misc"], 10) || 0);
                                        currDC = parseInt(v[prefix + "savedc"], 10) || 0;
                                        if (newDC !== currDC) {
                                            setter[prefix + "savedc"] = newDC;
                                            if (optionText) {
                                                optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.dc, PFSpellOptions.optionTemplates.dc.replace("REPLACE", newDC));
                                                setOption = 1;
                                            }
                                         }
                                        casterlevel = parseInt(v[prefix + "casterlevel"], 10) || 0;
                                        if (!isNaN(casterlevel)) {
                                            newConcentration = casterlevel + abilityMod + classConcentrationMisc + spellConcentrationMisc;
                                            if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                                                setter[prefix + "Concentration-mod"] = newConcentration;
                                                if (optionText) {
                                                    optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration, PFSpellOptions.optionTemplates.Concentration.replace("REPLACE", newConcentration));
                                                    optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration_chk, PFSpellOptions.optionTemplates.Concentration_chk.replace("REPLACE", newConcentration));
                                                    setOption = 1;
                                                }
                                            }
                                            if (setOption && optionText) {
                                                //TAS.debug("setting option for id "+ id +" to "+optionText);
                                                setter[prefix + "spell_options"] = optionText;
                                            }
                                        } else {
                                            TAS.warn("spell casterlevel is NaN for " + prefix);
                                            //if ((parseInt(v[prefix + "Concentration-mod"], 10) || 0) !== 0) {
                                            //    setter[prefix + "Concentration-mod"] = "";
                                            //}
                                        }
                                    }
                                }
                            } catch (innererror){
                                TAS.error("updateSpellsCasterAbilityRelated innererror on id:"+id,innererror);
                            }
                        });
                    } catch(miderr){
                        TAS.error("updateSpellsCasterAbilityRelated miderr :",miderr);
                    }finally {
                        if (_.size(setter) > 0) {
                            TAS.debug("updateSpellsCasterAbilityRelated setting:",setter);
                            SWUtils.setWrapper(setter, PFConst.silentParams, done());
                        } else {
                            done();
                        }
                    }
                });
            });
        } catch(err){
            TAS.error("updateSpellsCasterAbilityRelated outer error:",err);
        }
    });

}
//faster smaller than updateSpell
function updateSpellSlot (id, eventInfo, callback) {
    var outerdone = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    done = _.once(function () {
        resetCommandMacro(eventInfo, outerdone);
    }),
    idStr = SWUtils.getRepeatingIDStr(id),
    prefix = "repeating_spells_" + idStr,
    spellLevelRadioField = prefix + "spell_level_r",
    spellSlotField = prefix + "slot",
    spellLevelField = prefix + "spell_level",
    metamagicField = prefix + "metamagic";
    //TAS.debug("updateSpellSlot", eventInfo, id);
    getAttrs([spellSlotField, spellLevelField, spellLevelRadioField], function (v) {
        var slot = parseInt(v[spellSlotField], 10),
        level = parseInt(v[spellLevelField], 10),
        metamagic = parseInt(v[metamagicField], 10) || 0,
        spellLevelRadio = parseInt(v[spellLevelRadioField],10)||0,
        setter = {};
        try {
            //TAS.debug("updateSpellSlot", v);
            if (metamagic) {
                if (isNaN(level)) {
                    slot = -1;
                }
                if (isNaN(slot)) {
                    slot = level;
                    setter[spellSlotField] = level;
                    SWUtils.setWrapper(setter, {
                        silent: true
                    }, done);
                    return;
                }
                if (slot !== spellLevelRadio) {
                    //TAS.debug("updating slot to " + slot);
                    setter[spellLevelRadioField] = slot;
                    if (spellLevelRadio===-1){
                        setter["spells_tab"] = slot;
                    }
                    SWUtils.setWrapper(setter, {
                        silent: true
                    }, done);
                    return;
                }
            }
            outerdone();
        } catch (err) {
            TAS.error("updateSpellSlot", err);
            outerdone();
        }
    });
}
/** updates a spell
 *@param {string} id optional, pass id if looping through list of IDs. Null if context is row itself. 
 *@param {eventInfo} eventInfo ACTUALLY USED : if not present forces recalc of everything
 *@param {function} callback - to call when done.
 *@param {bool} doNotUpdateTotals - if true do NOT call resetSpellsTotals() and resetCommandMacro() at end, otherwise do.
 */
function updateSpell (id, eventInfo, callback, doNotUpdateTotals) {
    var spellLevelUndefined = false,
    classNumWasUndefined=false,
    done = _.once(function () {
        //TAS.debug("leaving PFSpells.updateSpell: id:" + id + " spelllevelundefined=" + spellLevelUndefined);
        //these asynchronous functions can be called at same time as callback.
        if (!spellLevelUndefined) {
            PFSpellOptions.resetOption(id, eventInfo);
            if (!doNotUpdateTotals) {
                resetSpellsTotals();
                resetCommandMacro();
            }
        }
        if (typeof callback === "function") {
            callback();
        }
    }),
    idStr = SWUtils.getRepeatingIDStr(id),
    prefix = "repeating_spells_" + idStr,
    classNameField = prefix + "spellclass",
    classRadioField = prefix + "spell_class_r",
    classNumberField = prefix + "spellclass_number",
    casterlevelField = prefix + "casterlevel",
    spellLevelField = prefix + "spell_level",
    spellLevelRadioField = prefix + "spell_level_r",
    dcMiscField = prefix + "DC_misc",
    currDCField = prefix + "savedc",
    fields = [classNumberField, classRadioField, classNameField, casterlevelField, prefix + "CL_misc", 
        prefix + "spellclass_number", prefix + "range_pick", prefix + "range", prefix + "range_numeric", 
        prefix + "SP-mod", prefix + "SP_misc", prefix + "Concentration_misc", prefix + "Concentration-mod", 
        prefix + "spell_options", prefix + "used", prefix + "slot", prefix + "metamagic", spellLevelField, 
        spellLevelRadioField, dcMiscField, currDCField, 
        "spellclass-0-level-total", "spellclass-1-level-total", "spellclass-2-level-total", 
        "spellclass-0-SP-mod", "spellclass-1-SP-mod", "spellclass-2-SP-mod", 
        "Concentration-0-mod", "Concentration-1-mod", "Concentration-2-mod", 
        "Concentration-0-misc", "Concentration-1-misc", "Concentration-2-misc", 
        "Concentration-0-def", "Concentration-1-def", "Concentration-2-def", 
        "spellclass-0-name", "spellclass-1-name", "spellclass-2-name"];
    getAttrs(fields, function (v) {
        var setter = {},
        baseClassNum, classNum = 0, classRadio,	currClassName = "",	className = "",
        baseSpellLevel,	spellLevel,	spellSlot,	metaMagic, spellLevelRadio,
        currCasterLevel, casterlevel, spellAbilityMod,	newDC = 10,
        levelSlot,
        currRange,
        currChosenRange,
        newSP = 0,
        newConcentration = 0,
        updateClass = false,
        updateClassLevel = false,
        updateRange = false,
        updateSP = false,
        updateConcentration = false,
        updateSpellLevel = false,
        updateDC = false,
        updateSlot = false,
        updateStr = "",
        tempMatches,
        hadToSetClass = false,
        newRange = 0;
        try {
            baseClassNum = parseInt(v[classNumberField], 10);
            classNum = baseClassNum || 0;
            classRadio = parseInt(v[classRadioField], 10);
            baseSpellLevel = parseInt(v[spellLevelField], 10);
            spellLevel = baseSpellLevel || 0;
            spellSlot = parseInt(v[prefix + "slot"], 10);
            metaMagic = parseInt(v[prefix + "metamagic"], 10) || 0;
            spellLevelRadio = parseInt(v[spellLevelRadioField], 10);
            currCasterLevel = parseInt(v[casterlevelField], 10);
            casterlevel = currCasterLevel || 0;
            spellAbilityMod = parseInt(v["Concentration-" + classNum + "-mod"], 10) || 0;
            levelSlot = (metaMagic ? spellSlot : spellLevel);
            currRange = parseInt(v[prefix + "range_numeric"], 10) || 0;
            currChosenRange = v[prefix + "range_pick"] || "blank";
            //cannot perform calculations
            if (isNaN(baseClassNum) && isNaN(baseSpellLevel)) {
                TAS.warn("cannot update spell! id:" + id + " both class and level are not numbers", v);
                return;
            }
            //TAS.debug("spell slot:" + spellSlot + ", metamagic:" + metaMagic + ", spelllevel:" + spellLevel + ", radio:" + spellLevelRadio);
            //if looping through with id then force update of all fields.
            if (!eventInfo) {
                updateClass = true;
            }
            //if class is not set, then set to default class 0
            if (isNaN(baseClassNum)) {
                //force to zero?
                classNumWasUndefined=true;
                TAS.debug("#########################","Forcing spell "+id+" to class 0");
                setter[classNumberField] = String(classNum);
                updateClass = true;
                hadToSetClass = true;
            }
            if (classNum !== classRadio) {
                setter[classRadioField] = classNum;
                updateClass = true;
            }
            if (!updateClass && eventInfo && eventInfo.sourceAttribute) {
                updateStr = eventInfo.sourceAttribute.toLowerCase();
                tempMatches = updateStr.match(/lvlstr|range_pick|range|sp_misc|cl_misc|spellclass_number|spell_level|dc_misc|concen|slot/);
                if (tempMatches && tempMatches[0]) {
                    switch (tempMatches[0]) {
                        case 'range_pick':
                        case 'range':
                            updateRange = true;
                            break;
                        case 'sp_misc':
                            updateSP = true;
                            break;
                        case 'cl_misc':
                            updateClassLevel = true;
                            break;
                        case 'spellclass_number':
                            updateClass = true;
                            break;
                        case 'concen':
                            updateConcentration = true;
                            break;
                        case 'spell_level':
                            updateSpellLevel = true;
                            break;
                        case 'dc_misc':
                            updateDC = true;
                            break;
                        case 'slot':
                            updateSlot = true;
                            break;
                        case 'lvlstr':
                            updateClass = true;
                            updateClassLevel = true;
                            updateConcentration = true;
                            updateSP = true;
                            updateDC = true;
                            updateRange = true;
                            break;
                        default:
                            updateClass = true; //unknown just update all
                    }
                } else {
                    //if we called from importFromCompendium then it's lvlstr
                    TAS.warn("Unimportant field updated, do not update row: " + eventInfo.sourceAttribute);
                    done();
                    return;
                }
            }
            if (isNaN(baseSpellLevel)) {
                if (spellLevelRadio !== -1) {
                    setter[spellLevelRadioField] = "-1";
                    setter[prefix + "slot"] = "";
                }
                spellLevelUndefined = true;
            } else if (!metaMagic && (updateSpellLevel || spellLevel !== spellLevelRadio)) {
                //TAS.debug("reset radio field after spell update");
                setter[spellLevelRadioField] = spellLevel;
                if (spellLevelRadio===-1){
                    setter["spells_tab"] = spellLevel;
                }
                updateSpellLevel = true;
            } else if (metaMagic && !isNaN(spellSlot) && (updateSlot || spellSlot !== spellLevelRadio)) {
                //TAS.debug("reset radio field after spell SLOT update");
                setter[spellLevelRadioField] = spellSlot;
                if (spellLevelRadio===-1){
                    setter["spells_tab"] = spellSlot;
                }
            }
            //keep slot in sync
            if (!spellLevelUndefined) {
                if (isNaN(spellSlot)) {
                    setter[prefix + "slot"] = spellLevel;
                    spellSlot = spellLevel;
                    updateSlot = true;
                } else if (!metaMagic && (updateSpellLevel || spellSlot !== spellLevel)) {
                    setter[prefix + "slot"] = spellLevel;
                }
            }
            //classname
            className = v["spellclass-" + classNum + "-name"];
            if (updateClass) {
                currClassName = v[classNameField];
                if (currClassName !== className) {
                    TAS.debug("setting class name field, should be doing this if classnum was undefined");
                    setter[classNameField] = className;
                }
            }
            if (isNaN(currCasterLevel)) {
                updateClassLevel = true;
            }
            //set caster level
            if (updateClass || updateClassLevel) {
                casterlevel = (parseInt(v["spellclass-" + classNum + "-level-total"], 10) || 0) + (parseInt(v[prefix + "CL_misc"], 10) || 0);
                if (casterlevel < 1) {
                    casterlevel = 1;
                }
                if (currCasterLevel !== casterlevel || isNaN(currCasterLevel)) {
                    setter[prefix + "casterlevel"] = casterlevel;
                    updateClassLevel = true;
                }
            }
            if (!(spellLevelUndefined) && (updateClass || updateSpellLevel || updateDC)) {
                newDC = 10 + spellLevel + spellAbilityMod + (parseInt(v[dcMiscField], 10) || 0);
                if (newDC !== (parseInt(v[currDCField], 10) || 0)) {
                    setter[currDCField] = newDC;
                }
            }
            if (updateClass || updateClassLevel || updateConcentration) {
                newConcentration = casterlevel + spellAbilityMod + (parseInt(v["Concentration-" + classNum + "-misc"], 10) || 0) + (parseInt(v[prefix + "Concentration_misc"], 10) || 0);
                if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                    setter[prefix + "Concentration-mod"] = newConcentration;
                }
            }
            if (updateClass || updateRange || updateClassLevel) {
                newRange = PFUtils.findSpellRange(v[prefix + "range"], currChosenRange, casterlevel) || 0;
                if (newRange !== currRange) {
                    setter[prefix + "range_numeric"] = newRange;
                }
            }
            if (updateClass || updateSP || updateClassLevel) {
                newSP = (parseInt(v["spellclass-" + classNum + "-SP-mod"], 10) || 0) + (parseInt(v[prefix + "SP_misc"], 10) || 0);
                if (newSP !== (parseInt(v[prefix + "SP-mod"], 10) || 0)) {
                    setter[prefix + "SP-mod"] = newSP;
                }
            }
        } catch (err) {
            TAS.error("PFSpells.updateSpell:" + id, err);
        } finally {
            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, {
                    silent: true
                }, done);
            } else {
                done();
            }
        }
    });
}
/** - updates all spells
 *@param {function} callback when done
 *@param {silently} if should call SWUtils.setWrapper with {silent:true}
 *@param {object} eventInfo not used
 */
export function updateSpells (callback, silently, eventInfo) {
    var done = _.once(function () {
        TAS.debug("leaving PFSpells.updateSpells");
        if (typeof callback === "function") {
            callback();
        }
    }),
    doneOne = _.after(3,done);
    getAttrs(['use_spells','spellclass-0-exists','spellclass-1-exists','spellclass-2-exists'],function(v){
        //TAS.debug"at PFSpells.updateSpells. Existing classes:",v);
        if(parseInt(v.use_spells,10)){
            _.times(3,function(n){
                //TAS.debug("###############", "PFSpells.updateSpells index is: "+n);
                if (parseInt(v['spellclass-'+n+'-exists'],10)){
                    updateSpellsCasterAbilityRelated (n,null,function(){
                        updateSpellsCasterLevelRelated(n,null,doneOne);
                    });
                } else {
                    doneOne();
                }
            });
        } else {
            done();
        }
    });
}

function updateSpellsOld  (callback, silently, eventInfo) {
    getSectionIDs("repeating_spells", function (ids) {
        var done = _.after(_.size(ids), function () {
                TAS.debug("leaving PFSpells.updateSpells after " + _.size(ids)+" rows");
                    if (typeof callback === "function") {
                        callback();
                    }
            });
        _.each(ids, function (id) {
            try {
                updateSpell(id, eventInfo, done, true);
            } catch (err){
                TAS.error("PFSpells.updateSpells error - should never happen!",err);
                done();
            }
        });
    });
}

/** gets level and class from repeating_spells_spell_lvlstr then updates spell
 * matches class name in compendium against current spell classes in this order:
 * spell class already selected by spell dropdown, spellclass0, spellclass1, spellclass2
 * then sets spell level to the matching level for that class
 * if it cannot find then sets class name to the class level string and updates silently.
 *@param {string} id the id of the row
 *@param {object} eventInfo used to find row id since id param will be null
 */
export function importFromCompendium (id, eventInfo) {
    var trueId = "";

    trueId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");
    
    getAttrs(["repeating_spells_compendium_category","repeating_spells_spell_lvlstr", "spellclass-0-name", "spellclass-1-name", "spellclass-2-name", "repeating_spells_range_from_compendium", "repeating_spells_target_from_compendium", "repeating_spells_area_from_compendium", "repeating_spells_effect_from_compendium","repeating_spells_description"], function (v) {
        var levelStrBase = v["repeating_spells_spell_lvlstr"],
        rangeText = v["repeating_spells_range_from_compendium"],
        areaEffectText = (v["repeating_spells_target_from_compendium"] || "") + (v["repeating_spells_area_from_compendium"] || "") + (v["repeating_spells_effect_from_compendium"] || ""),
        classesInital = [],
        classes = [],
        originalClasses = ["", "", ""],
        classMatch = "",
        level = 0,
        idx = -1,
        foundMatch = false,
        setSilent = {},
        i = 0,
        classesToMatch = {},
        tempclassname = "",
        newRangeSettings,
        hasHunter = false,
        hasDruid = false,
        hasRanger = false,
        minHunterSpellLevel = 99,
        hunterIdx = 99,
        isAttack = false,
        allSame=1,
        modeLevel=-1,
        counter = 0,
        callUpdateSpell = true;
        //TAS.debug("at pfspells.importFromCompendium",v);
        if (levelStrBase) {
            try {
                levelStrBase = levelStrBase.toLowerCase();
                //get first word in names of classes (since users may put archetypes or other variables in)
                //if (currClass) {classesToMatch[0]=currClass.toLowerCase().replace(/^\s+/,"").match(/\w[^\d]+/)[0];}
                if (v["spellclass-0-name"]) {
                    tempclassname = v["spellclass-0-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
                    classesToMatch[tempclassname] = 0;
                    originalClasses[0] = tempclassname;
                    if (/hunter/.test(tempclassname)) {
                        hasHunter = true;
                        hunterIdx = 0;
                    } else if (/druid/.test(tempclassname)) {
                        hasDruid = true;
                    } else if (/ranger/.test(tempclassname)) {
                        hasRanger = true;
                    }
                }
                if (v["spellclass-1-name"]) {
                    tempclassname = v["spellclass-1-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
                    classesToMatch[tempclassname] = 1;
                    originalClasses[1] = tempclassname;
                    if (/hunter/.test(tempclassname)) {
                        hasHunter = true;
                        hunterIdx = 1;
                    } else if (/druid/.test(tempclassname)) {
                        hasDruid = true;
                    } else if (/ranger/.test(tempclassname)) {
                        hasRanger = true;
                    }
                }
                if (v["spellclass-2-name"]) {
                    tempclassname = v["spellclass-2-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
                    classesToMatch[tempclassname] = 2;
                    originalClasses[2] = tempclassname;
                    if (/hunter/.test(tempclassname)) {
                        hasHunter = true;
                        hunterIdx = 2;
                    } else if (/druid/.test(tempclassname)) {
                        hasDruid = true;
                    } else if (/ranger/.test(tempclassname)) {
                        hasRanger = true;
                    }
                }
                if (!(hasHunter && (hasDruid || hasRanger))) {
                    //if user is hunter AND other class it's based on then can't tell.
                    if (_.size(classesToMatch) > 0) {
                        //add the translated classes from classesUsingOtherSpellLists
                        _.each(classesToMatch, function (classindex, classname) {
                            _.each(classesUsingOtherSpellLists, function (toclass, fromclass) {
                                if (classname.indexOf(fromclass) >= 0) {
                                    classesToMatch[toclass] = classindex;
                                }
                            });
                        });
                        //from spell: first split on comma between classes, then on spaces between classname and level
                        classesInital = levelStrBase.split(/\s*,\s*/);
                        classes = _.map(classesInital, function (a) {
                            return a.split(/\s+/);
                        });
                        for (i = 0; i < classes.length; i++) {
                            classes[i][1] = (parseInt(classes[i][1], 10) || 0);
                            if (i===0){
                                modeLevel=classes[i][1];
                            } else {
                                if (modeLevel !== classes[i][1]){
                                    allSame=0;
                                }
                                
                            }
                        }
                        //classes example: [["sorcerer/wizard","2"],["summoner","1"],["inquisitor","3"],["magus","2"]]
                        if (hasHunter) {
                            for (i = 0; i < classes.length; i++) {
                                if (/druid|ranger/.test(classes[i][0]) && classes[i][1] < minHunterSpellLevel) {
                                    minHunterSpellLevel = classes[i][1];
                                    classMatch = classes[i][0];
                                }
                            }
                            if (minHunterSpellLevel < 99) {
                                counter++;
                                foundMatch = true;
                                level = minHunterSpellLevel;
                                idx = hunterIdx;
                            }
                        }
                        _.each(classesToMatch, function (classindex, classname) {
                            for (i = 0; i < classes.length; i++) {
                                //classes on left because it can be longer and have multiple class names such as cleric/druid
                                if (classes[i][0].indexOf(classname) >= 0) {
                                    counter++;
                                    if (!foundMatch) {
                                        classMatch = originalClasses[classindex];
                                        level = classes[i][1];
                                        idx = classindex;
                                        foundMatch = true;
                                    }
                                }
                            }
                        });
                    }
                }
            } catch (err) {
                classMatch = "";
            }
            if (!foundMatch){
                //get mode 
                // IF FOODS IS AN ARRAY then : so how to do it with 
                var levels = _.map(classes,function(oneclass){
                    return oneclass[1];
                });
                level=_.chain(levels).countBy().pairs().max(_.last).head().value();
                idx=0;
                classMatch = originalClasses[0];
                setSilent['repeating_spells_description']= 'Original spell level:'+v['repeating_spells_spell_lvlstr'] + ' \r\n'+ v['repeating_spells_description'];
            }
            if (counter > 1 || !foundMatch) {
                TAS.warn("importFromCompendium: did not find class match");
                //leave at current choice if there is one
                setSilent["repeating_spells_spell_level"] = "";
                setSilent["repeating_spells_spell_level_r"] = -1;
                setSilent["repeating_spells_spell_class_r"] = -1;
                setSilent["repeating_spells_spellclass_number"] = "";
                setSilent["repeating_spells_spellclass"] = levelStrBase;
                callUpdateSpell = false;
            } else {
                setSilent["repeating_spells_spellclass_number"] = idx;
                setSilent["repeating_spells_spell_level"] = level;
                setSilent["repeating_spells_spell_level_r"] = level;
                setSilent["repeating_spells_spellclass"] = classMatch;
                setSilent["repeating_spells_spell_class_r"] = idx;
                //change tab so spell doesn't disappear.
                setSilent["spells_tab"] = level;
            }
        }
        if (rangeText) {
            try {
                newRangeSettings = PFUtils.parseSpellRangeText(rangeText, areaEffectText);
                setSilent["repeating_spells_range_pick"] = newRangeSettings.dropdown;
                setSilent["repeating_spells_range"] = newRangeSettings.rangetext;
                if (newRangeSettings.dropdown==='touch' ) {
                    isAttack=true;
                    setSilent["repeating_spells_attack-type"]='attk-melee';
                } else if ( (/ranged touch|ray\s/i).test(v["repeating_spells_description"])  ) {
                    isAttack=true;
                    setSilent["repeating_spells_attack-type"]='attk-ranged';
                }
            } catch (err2) {
                TAS.error(err2);
                setSilent["repeating_spells_range"] = rangeText.replace(/\s*\(..*/, '');
                setSilent["repeating_spells_range_pick"] = "unknownrange";
            }
        }
        if (areaEffectText) {
            setSilent["repeating_spells_targets"] = areaEffectText;
        }
        setSilent["repeating_spells_spell_lvlstr"] = "";
        setSilent["repeating_spells_range_from_compendium"] = "";
        setSilent["repeating_spells_target_from_compendium"] = "";
        setSilent["repeating_spells_area_from_compendium"] = "";
        setSilent["repeating_spells_effect_from_compendium"] = "";
        if (_.size(setSilent) > 0) {
            SWUtils.setWrapper(setSilent, PFConst.silentParams, function () {
                if (callUpdateSpell) {
                    updateSpell(null, eventInfo);
                }
            });
        }
    });
}
export function migrateRepeatingMacros (callback){
    var done = _.once(function(){
        TAS.debug("leaving PFSpells.migrateRepeatingMacros");
        if(typeof callback === "function"){
            callback();
        }
    }),
    migrated = _.after(2,function(){
        resetCommandMacro();
        SWUtils.setWrapper({'migrated_spells_macrosv1':1},PFConst.silentParams,done);
    });
    //TAS.debug("at PFSpells.migrateRepeatingMacros");
    getAttrs(['migrated_spells_macrosv1'],function(v){
        if (parseInt(v.migrated_spells_macrosv1,10)!==1){
            PFMacros.migrateRepeatingMacros(migrated,'spells','npc-macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{NPC-Whisper}');
            PFMacros.migrateRepeatingMacros(migrated,'spells','macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{PC-Whisper}');
        } else {
            done();
        }
    });
}
export function migrate (callback) {
    PFMigrate.migrateSpells(function () {
        PFMigrate.migrateSpellRanges(function () {
            migrateRepeatingMacros (function() {
                if (typeof callback === "function") {
                    callback();
                }
            });
        });
    });
}

export function recalculate (callback, silently, oldversion) {
    var done = _.once(function () {
        TAS.debug("leaving PFSpells.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    }),
    recalcTotals = _.once(function () {
        //TAS.debug("at PFSpells.recalculate.recalcTotals");
        resetSpellsPrepared();
        resetSpellsTotals(null, null, null, silently);
        resetCommandMacro();
        //do not call because updateSpells already calls update options
        done();
    }),
    callUpdateSpells = _.once(function(){
        getAttrs(["use_spells"],function(v){
            if (parseInt(v.use_spells,10)){
                updateSpells(recalcTotals,silently);
            } else {
                done();
            }
        });
    });
    migrate(callUpdateSpells);
}
var events = {
    //events for spell repeating rows
    repeatingSpellEventsPlayer: {
        "change:repeating_spells:DC_misc change:repeating_spells:slot change:repeating_spells:Concentration_misc change:repeating_spells:range change:repeating_spells:range_pick change:repeating_spells:CL_misc change:repeating_spells:SP_misc": [updateSpell],
        "change:repeating_spells:spell_lvlstr": [importFromCompendium],
        "change:repeating_spells:used": [updateSpellsPerDay, updatePreparedSpellState],
        "change:repeating_spells:slot": [updateSpellSlot]
    },
    repeatingSpellEventsEither: {
        "change:repeating_spells:spellclass_number change:repeating_spells:spell_level": [updateSpell]
    },
    repeatingSpellAttackEvents: ["range_pick", "range", "range_numeric", "damage-macro-text", "damage-type", "sr", "savedc", "save", "spell-attack-type", "name"]
};
function registerEventHandlers  () {
    //SPELLS
    //all repeating spell updates
    var tempstr="";
    _.each(events.repeatingSpellEventsPlayer, function (functions, eventToWatch) {
        _.each(functions, function (methodToCall) {
            on(eventToWatch, TAS.callback(function eventRepeatingSpellsPlayer(eventInfo) {
                if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                    TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                    methodToCall(null, eventInfo);
                }
            }));
        });
    });
    _.each(events.repeatingSpellEventsEither, function (functions, eventToWatch) {
        _.each(functions, function (methodToCall) {
            on(eventToWatch, TAS.callback(function eventRepeatingSpellsEither(eventInfo) {
                TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
                methodToCall(null, eventInfo);
            }));
        });
    });
    on("change:spellmenu_groupby_school change:spellmenu_show_uses change:spellclass-0-hide_unprepared change:spellclass-1-hide_unprepared change:spellclass-2-hide_unprepared change:spellclass-0-show_domain_spells change:spellclass-1-show_domain_spells change:spellclass-2-show_domain_spells", TAS.callback(function eventUnpreparedSpellCommandChange(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            resetCommandMacro();
        }
    }));

   	on("remove:repeating_spells", TAS.callback(function eventUpdateRemoveLinkedSpell(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        PFAttacks.removeLinkedAttack(null, PFAttacks.linkedAttackType.spell , SWUtils.getRowId(eventInfo.sourceAttribute));
	}));	
    
    on("remove:repeating_spells change:repeating_spells:spellclass_number change:repeating_spells:spell_level change:repeating_spells:slot change:repeating_spells:used change:repeating_spells:school change:repeating_spells:metamagic change:repeating_spells:isDomain change:repeating_spells:isMythic change:_reporder_repeating_spells", TAS.callback(function eventRepeatingSpellAffectingMenu(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            resetCommandMacro();
        }
    }));
    on("remove:repeating_spells change:repeating_spells:spellclass_number change:repeating_spells:spell_level", TAS.callback(function eventRepeatingSpellsTotals(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            resetSpellsTotals();
        }
    }));
    on("change:repeating_spells:create-attack-entry", TAS.callback(function eventcreateAttackEntryFromSpell(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            createAttackEntryFromRow(null,null,false,eventInfo);
        }
    }));
    tempstr = _.reduce(events.repeatingSpellAttackEvents,function(memo,attr){
        memo+="change:repeating_spells:"+attr+" ";
        return memo;
    },"");
    on(tempstr,	TAS.callback(function eventupdateAssociatedSpellAttack(eventInfo) {
        var attr;
        TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
        attr = SWUtils.getAttributeName(eventInfo.sourceAttribute);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (attr === 'attack-type')){
            updateAssociatedAttack(null,null,null,eventInfo);
        }
    }));
}
registerEventHandlers();
PFConsole.log('   PFSpells module loaded         ' );
PFLog.modulecount++;
