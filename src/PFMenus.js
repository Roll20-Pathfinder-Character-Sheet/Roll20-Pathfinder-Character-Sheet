'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog, PFConsole} from './PFLog';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';

var menuMap={
    'class-ability':{'name':'original-class-features-list','section':'class-ability','useshowinmenu':1},
    'feat':{'npcMacroName':'NPC-feat','npcName':' ^{npc} ','name':'original-feats-list','section':'feat','npcLinkField':'npc-roll','useshowinmenu':1},
    'racial-trait':{'npcMacroName':'NPC-racial-trait','npcName':' ^{npc} ','name':'original-racial-traits-list','section':'racial-trait','npcLinkField':'npc-roll','useshowinmenu':1},
    'trait':{'name':'original-traits-list','section':'trait','useshowinmenu':1},
    'mythic-ability':{'name':'mythic-abilities','section':'mythic-ability','useshowinmenu':1},
    'mythic-feat':{'name':'mythic-feats','section':'mythic-feat','useshowinmenu':1},
    'npc-spell-like-abilities':{'name':'original-spell-like-abilities-list','section':'npc-spell-like-abilities','useshowinmenu':1},
    'ability':{'npcMacroName':'NPC-ability','npcName':' ^{npc} ','name':'abilities','section':'ability','groupBy':'rule_category','translateGroup':1,'npcLinkField':'npc-roll','useshowinmenu':1},
    'ex':{'npcMacroName':'NPC-ex','npcName':' ^{npc} ','name':'extraordinary-abilities-menu','section':'ability','filterField':'ability_type','filterValue':'Ex','groupBy':'frequency','translateGroup':1,'altUsesField':'rounds_between','npcLinkField':'npc-roll','useshowinmenu':1},
    'sp':{'npcMacroName':'NPC-sp','npcName':' ^{npc} ','name':'spell-like-abilities-menu','section':'ability','filterField':'ability_type','filterValue':'Sp','groupBy':'frequency','translateGroup':1,'altUsesField':'rounds_between','npcLinkField':'npc-roll','useshowinmenu':1},
    'su':{'npcMacroName':'NPC-su','npcName':' ^{npc} ','name':'supernatural-abilities-menu','section':'ability','filterField':'ability_type','filterValue':'Su','groupBy':'frequency','translateGroup':1,'altUsesField':'rounds_between','npcLinkField':'npc-roll','useshowinmenu':1},
    'item':{'npcMacroName':'NPC-item','npcName':' ^{npc} ','name':'items','section':'item','usesField':'','bonusField':'','groupBy':'equip-type','translateGroup':1,'npcLinkField':'npc-roll','useshowinmenu':1},
    'attacks':{'macroSuffix':'-macro','npcMacroSuffix':'-macro-npc','npcName':' ^{npc} ','section':'weapon','name':'attacks','usesField':'','bonusField':'','groupBy':'attack-type','altGroupBy':'group','translateGroup':1,'npcLinkField':'attack-npc-roll','linkField':'attack-roll'}
};

/** creates a command macro button for a repeating section
 * it also extends to add old lists using "extendbysections"
 * @param {jsmap} baseAttribs object of schema:
 *  name:string ex:'abilities',
 *  template:string ex:'pf_generic',
 *  header:string ex:'header_image-pf_generic',
 *  section:string the name after 'repeating_' e.g. weapon,item, spells, etc
 *  bonusField:string bonus attr to add at the end of the name attr of each row, put into parenthesis, such as Burning Hands (Sp),
 *  usesField:string used or attr name with |max if instead to print uses/max,
 *  nameField:string name of header of menu written to {{#name}}
 *  linkField:string the attr of the roll button 'roll'
 *  npclinkField:string if necessary, different link field to use if the char is an NPC
 *  filterField:string optional attr to pass to _.filter or _.pick , if 1 then display, if 0 then don't , ex:'showinmenu'
 *  filterValue:string if filter should be custom (not 1/0) then fill in value ex: 'Sp', cannot be '0' (zero)
 *  groupByField:string optional name of attr to group by
 *  translateGroup: if ^{} should be placed around groupby field value
 *  translateBonus: if ^{} should be placed around bonus field value
 *  groupMap:{key:string,key:string} if instead of grouping by the groupField itself, pass the value to a map and group by the result.
 * @param {function(string)} callback Pass string for command macro as first param, or ""
 */
export function getRepeatingCommandMacro (baseAttribs,callback,header){
    var done = function (macro) { 
            if (typeof callback === "function") { callback(macro); } 
        },
        defaultTemplate = "pf_block",
        defaultHeader="header_image-pf_block",
        defaultName="ability-menus",
        nameField = "name",
        bonusField ="",
        usesField="",
        altUsesField="",
        groupByField="",
        altGroupByField="",
        linkField="roll",
        filterField="",
        filterValue="",
		baseMacro = "/w \"@{character_name}\" &{template:REPLACETEMPLATE} @{toggle_attack_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{REPLACEHEADER}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle=REPLACESUBTITLE}} {{name=REPLACENPC^{REPLACENAME}}}",
        baseCommand = " [ REPLACEBUTTON ](~@{character_id}|REPLACELINK)",
        noRows = " {{description=^{none-available} }}";
    if (!baseAttribs || !baseAttribs.section || !baseAttribs.linkField){
        TAS.error("PFMenus.getRepeatingCommandMacro cannot process",baseAttribs);
        done("");
        return;
    }
    try {
        header=header||"";
        baseMacro = baseMacro.replace('REPLACETEMPLATE',baseAttribs.template||defaultTemplate);
        baseMacro = baseMacro.replace('REPLACEHEADER',baseAttribs.header||defaultHeader);
        baseMacro = baseMacro.replace('REPLACENAME',baseAttribs.name||defaultName);
        baseMacro = baseMacro.replace('REPLACESUBTITLE','');
        baseMacro = baseMacro.replace(/REPLACENPC/g,baseAttribs.npcName||'');
        baseMacro += header;
        nameField=baseAttribs.nameField||nameField;
        bonusField=baseAttribs.bonusField||bonusField;
        usesField=baseAttribs.usesField||usesField;
        linkField=baseAttribs.linkField||linkField;
        groupByField=baseAttribs.groupBy||groupByField;
        filterField=baseAttribs.filterField||filterField;
        altUsesField=baseAttribs.altUsesField||altUsesField;
        altGroupByField=baseAttribs.altGroupBy||'';
        TAS.debug("PFMenus.getRepeatingCommandMacro attribs, menu so far:",baseAttribs,baseMacro);
    } catch (outerErr){
        TAS.error("PFMenus.getRepeatingCommandMacro outererror for "+ baseAttribs.section, outerErr);
        done("");
        return;
    }
    getSectionIDs("repeating_"+baseAttribs.section,function(ids){
        var fields=[],prefix="repeating_"+baseAttribs.section+"_";
        try {
            if (!ids || _.size(ids)<=0){
                TAS.error("It says "+baseAttribs.section+" has no rows!");
                done(baseMacro+ noRows);
                return;
            }
            _.each(ids,function(id){
                var linePrefix=prefix+id+"_";
                fields.push(linePrefix+nameField);
                if (baseAttribs.useshowinmenu){
                    fields.push(linePrefix+'showinmenu');
                }
                if (altGroupByField){
                    fields.push(linePrefix+altGroupByField);
                }
                if (bonusField){
                    fields.push(linePrefix+bonusField);
                }
                if (usesField){
                    fields.push(linePrefix+usesField);
                    fields.push(linePrefix+usesField+"_max");
                }
                if (filterField){
                    fields.push(linePrefix+filterField);
                }
                if (groupByField){
                    fields.push(linePrefix+groupByField);
                }
                if (altUsesField){
                    fields.push(linePrefix+altUsesField);
                }
            });
        } catch (outerError2){
            TAS.error("PFMenus.getRepeatingCommandMacro outererror 2 assembling all attrs in rows for "+ baseAttribs.section, outerError2);
            done("");
            return;
        }
        fields.push( '_reporder_repeating_'+baseAttribs.section);
        getAttrs(fields,function(v){
            var restOfMacro="", totalMacro="",orderedList,repList,customSorted=0, rowCounter=20;
            try {
                TAS.debug('PFMenus.getRepeatingCommandMacro returned with',v);
                if (v['_reporder_repeating_'+baseAttribs.section]) {
                    repList = v['_reporder_repeating_'+baseAttribs.section].split(",");
                    repList = _.map(repList, function (ID) {
                        return ID.toLowerCase();
                    });
                    orderedList = _.intersection(_.union(repList, ids), ids);
                    customSorted = 1;
                } else {
                    orderedList = ids;
                }
                restOfMacro=_.chain(orderedList)
                    .map(function(id){
                        var linePrefix=prefix+id+'_',buttonName='',bonus='',uses='',max='',usesStr='',tempshow=0,
                        retObj= {
                            'id': id,
                            'name': (v[linePrefix+'name']||id),
                            'showinmenu':1
                        };
                        try {
                            if (usesField){
                                uses = v[linePrefix+usesField]||'';
                                max = v[linePrefix+usesField+"_max"]||'';
                            }
                            if(altGroupByField && v[linePrefix+altGroupByField]){
                                retObj.group =  v[linePrefix+altGroupByField];
                                retObj.doNotTranslate=true;
                            } else if (groupByField && v[linePrefix+groupByField]){
                                if (baseAttribs.groupMap){
                                    if (baseAttribs.groupMap[v[linePrefix+groupByField]]){
                                        retObj.group = baseAttribs.groupMap[v[linePrefix+groupByField]];
                                    } else {
                                        retObj.group='AAAAAA';
                                    }
                                } else if (groupByField==='frequency' ){
                                    switch(v[linePrefix+groupByField]){
                                        case 'perday':
                                            retObj.group='';
                                            if (max) {
                                                retObj.group = max + ' ';
                                            }
                                            retObj.group += (baseAttribs.translateGroup?'^{':'') + v[linePrefix+groupByField] + (baseAttribs.translateGroup?'}':'');
                                            retObj.doNotTranslate=1;
                                            break;
                                        case 'not-applicable':
                                            retObj.group='AAAAAA';
                                            uses=0;
                                            max=0;
                                            break;
                                        case 'constant':
                                        case 'atwill':
                                            retObj.group=v[linePrefix+groupByField];
                                            uses=0;
                                            max=0;
                                            break;
                                        case 'hexfreq':
                                        case 'other':
                                            retObj.group=v[linePrefix+groupByField];
                                            break;
                                        case 'everyrounds':
                                            retObj.group=v[linePrefix+groupByField];
                                            if(v[linePrefix+altUsesField]){
                                                uses= v[linePrefix+altUsesField];
                                                max=0;
                                            }
                                            break;
                                        default:
                                            retObj.group=v[linePrefix+groupByField];
                                            break;
                                    }
                                } else {
                                    retObj.group =  v[linePrefix+groupByField];
                                }
                            } else {
                                retObj.group='AAAAAA';
                            }
                            if (retObj.group!=='AAAAAA' && baseAttribs.translateGroup && !retObj.doNotTranslate){
                                retObj.group = '^{'+retObj.group+'}'; 
                            }
                            if (usesField){
                                if(uses&&max){
                                    usesStr = ' ('+uses+'/'+max+')';
                                } else if (uses){
                                    usesStr = ' ('+uses+')';
                                }
                            }
                            if (filterField){
                                if(baseAttribs.filterValue){
                                    if(String(v[linePrefix+filterField]) === String(baseAttribs.filterValue)){
                                        retObj.showinmenu = 1;
                                    } else {
                                        retObj.showinmenu = 0;
                                    }
                                } else {
                                    retObj.showinmenu = parseInt(v[linePrefix+filterField],10)||0;
                                }
                            } else {
                                retObj.showinmenu = 1;
                            }
                            if(retObj.filterField !== 'showinmenu' && baseAttribs.useshowinmenu){
                                tempshow=parseInt(v[linePrefix+'showinmenu'],10)||0;
                                retObj.showinmenu = retObj.showinmenu && tempshow;
                            }
                            if (bonusField && v[linePrefix+bonusField] && v[linePrefix+bonusField]!=='not-applicable'){
                                bonus = ' (' + (baseAttribs.translateBonus?'^{':'') + v[linePrefix+bonusField] + (baseAttribs.translateBonus?'}':'') +')';
                            }
                            buttonName  = retObj.name + bonus + usesStr;
                            retObj.chatLink='['+SWUtils.escapeForRollTemplate(SWUtils.escapeForChatLinkButton(buttonName))+'](~@{character_id}|'+ linePrefix + linkField + ')';
                        } catch (builderr){
                            TAS.error("PFMenus.getRepeatingCommandMacro builderr object for id "+id,builderr);
                        } finally {
                            return retObj;
                        }
                    })
                    .tap(function(item){TAS.debug('PFMENU at item',item);})
                    .filter(function(o){return o.showinmenu;})
                    .sortBy('group');
                    if(groupByField==='frequency'){
                        restOfMacro = restOfMacro.reverse();
                    }
                    restOfMacro=restOfMacro.groupBy('group')
                    .reduce(function(m,rowList,groupName){
                        var restOflink='';
                        try {
                            if(groupName !== 'AAAAAA' && _.size(rowList)>0){
                                m += ' {{row'+ String(rowCounter) + '=' + SWUtils.escapeForRollTemplate(groupName) + '}}';
                                rowCounter++;
                            }
                            restOflink=_.reduce(rowList,function(mi,o){
                                mi+= ' '+ o.chatLink;
                                return mi;
                            },' {{row' + String(rowCounter)+ '=' );
                            m  += restOflink + '}}';
                            rowCounter++;
                        } catch (strerror) {
                            TAS.error("PFMenus.getRepeatingCommandMacro strerror creating string for group "+groupName,strerror);
                        } finally {
                            return m;
                        }
                    },"")
                    .value();
            } catch (innererror2){
                TAS.error("PFMenus.getRepeatingCommandMacro innererror2 for "+ baseAttribs.section, innererror2);
            } finally {
                if (restOfMacro){
                    totalMacro = baseMacro + restOfMacro;
                } else {
                    totalMacro=baseMacro + noRows; 
                }
                done(totalMacro);
            }
        });
    });
}
/**resetOneCommandMacro sets command button macro with all rows from one ability list.
 * calls PFMenus.getRepeatingCommandMacro
 * sets the returned string to macro with attribute name: section+"_buttons_macro"
 *@param {string} section name after "repeating_"
 *@param {boolean} isNPC  true if npc false or not needed otherwise.
 *@param {function} callback  when done
 */
export function resetOneCommandMacro (menuName,isNPC,callback,header,groupMap){
    var done = _.once(function () {
            //TAS.debug("leaving PFMenus.resetOneCommandMacro: " + menuName);
            if (typeof callback === "function") {
                callback();
            }
        }),
        params={},
        macroName=menuName;
    //this is here because putting it above cloning was not working, 
    //so this makes sure new instance gets created each time
    params = {
        'usesField': 'used',
        'linkField': 'roll',
        'nameField': 'name',
        'bonusField': 'ability_type',
        'translateBonus':1,
        'macroSuffix': '_buttons_macro'
        };
    if (menuMap[menuName]) {
        params = _.extend(params,menuMap[menuName]);
        if(isNPC){
            if (menuMap[menuName].npcLinkField){
                params.linkField=menuMap[menuName].npcLinkField;
            }
            if(menuMap[menuName].npcMacroName){
                macroName = menuMap[menuName].npcMacroName;
            }
            if (menuMap[menuName].npcMacroSuffix){
                params.macroSuffix = menuMap[menuName].npcMacroSuffix;
            }
        } else {
            if (params.npcName){
                params.npcName = '';
            }
        }
    } else {
        TAS.error("PFMenus.resetOneCommandMacro Could not find parameters for menu "+menuName);
        done();
        return;
    }
    if (groupMap && params.groupBy){
        params.groupMap = groupMap;
    }
    TAS.debug("PFMenus.resetOneCommandMacro getting rollmenu for "+menuName,params);
    getRepeatingCommandMacro( params,function(newMacro){
        var setter={};
        TAS.debug("PFMenus.resetOneCommandMacro returned with "+menuName+", writing to "+macroName + params.macroSuffix,newMacro);
        setter[macroName + params.macroSuffix]=newMacro||"";
        setAttrs(setter,PFConst.silentParams,done);
    },header);
}
/** same as resetOneCommandMacro if you do not know the npc status 
 *@param {string} section name after "repeating_"
 *@param {function} callback  when done
 */
export function resetOneCommandMacroNoNPC (section,callback,header){
    getAttrs(['is_npc'],function(v){
        resetOneCommandMacro(section, (parseInt(v.is_npc,10)||0), callback,header);
    });
}

PFConsole.log('   PFMenus module loaded          ');
PFLog.modulecount++;
