'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFAttacks from './PFAttacks';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFAttackOptions from './PFAttackOptions';

function updateAttack(v,setter){
    var currb=0,newb=0;
    setter=setter||{};
    currb=v.kineticblast_attack||0;
    newb=(v['buff_kineticblast-total']||0) + (v['kineticblast_attack-mod']||0);
    if(currb!==newb){
        setter.kineticblast_attack=newb;
    }
    return setter;
}
function updateDamage(v,setter){
    var currb=0,newb=0;
    setter=setter||{};
    currb=v.kineticblast_dmg||0;
    newb=(v['buff_dmg_kineticblast-total']||0) + (v['kineticblast_dmg-mod']||0);
    if(currb!==newb){
        setter.kineticblast_dmg=newb;
    }
    return setter;
}


export function updateDamageAsync(callback,silently,eventInfo){
    getAttrs(['buff_dmg_kineticblast-total','kineticblast_dmg-mod','kineticblast_dmg'],function(v){
        var setter={},params={};
        try {
            v= _.mapObject(v,function(val,key){
                return (parseInt(val,10)||0);
            });
            updateDamage(v,setter);
        } catch(err){
            TAS.error("PFOccult.updateDamageAsync",err);
        } finally {
            if(_.size(setter)){
                if(silently){params=PFConst.silentParams;}
                SWUtils.setWrapper(setter,params,callback);
            } else if (typeof callback === "function"){
                callback();
            }
        }
    });
}

export function updateAttackAsync(callback,silently,eventInfo){
    getAttrs(['buff_kineticblast-total','kineticblast_attack-mod','kineticblast_attack'],function(v){
        var setter={},params={};
        try {
            v= _.mapObject(v,function(val,key){
                return (parseInt(val,10)||0);
            });
            updateAttack(v,setter);
        } catch(err){
            TAS.error("PFOccult.updateAttackAsync",err);
        } finally {
            if(_.size(setter)){
                if(silently){params=PFConst.silentParams;}
                SWUtils.setWrapper(setter,params,callback);
            } else if (typeof callback === "function"){
                callback();
            }
        }
    });
}

function createAttack (eventInfo){
    getAttrs(['kineticblast_attack_type','create_kineticblast_attack','kineticblast_attack'],function(v){
        var weaponPrefix='',id='',attackType='',setter={},name='',damage='',dmgname='';
        if(parseInt(v.create_kineticblast_attack,10)){
            try {
                id = generateRowID();
                weaponPrefix = 'create_attack_'+id+'_';
                name=v.kineticblast_attack_type;
                name=name.replace('physical','physical-').replace('composite','composite-').replace('energy','energy-');
                name = SWUtils.getTranslated(name);
                name = name.replace('-',' '); //just in case
                setter[weaponPrefix + "name"] = name;
                if((/composite/i).test(v.kineticblast_attack_type)){
                    damage="compositeblast_dmg_";
                } else {
                    damage="kineticblast_dmg_";
                }
                if((/physical/i).test(v.kineticblast_attack_type)){
                    setter[weaponPrefix + "vs"] = "AC";
                    damage += "phys_";
                } else {
                    setter[weaponPrefix + "vs"] = "touch";
                    damage += "energy_";
                }
                if((/blast/i).test(v.kineticblast_attack_type)){
                    setter[weaponPrefix + "attack-type"] = 'attk-ranged';
                    setter[weaponPrefix + "range"] = "@{kineticblast_range}";
                    setter[weaponPrefix + "isranged"] = 1;
                    damage += "ranged";
                } else {
                    setter[weaponPrefix + "attack-type"] = 'attk-melee';
                    damage += "melee";
                }
                dmgname = SWUtils.getTranslated('damage');
                setter[weaponPrefix + "attack"]="@{kineticblast_attack}";
                setter[weaponPrefix + "attack-mod"]=parseInt(v.kineticblast_attack,10)||0;
                setter[weaponPrefix + "precision_dmg_macro"] = damage;
                setter[weaponPrefix + "precision_dmg_type"] = dmgname;
                setter[weaponPrefix + "critical_dmg_macro"] = damage;
                setter[weaponPrefix + "critical_dmg_type"] = dmgname;
                setter[weaponPrefix + "default_damage-dice-num"] = 0;
                setter[weaponPrefix + "default_damage-die"] = 0;
                setter[weaponPrefix + "damage-dice-num"] = 0;
                setter[weaponPrefix + "damage-die"] = 0;
                setter[weaponPrefix + "size_affects"] = 0;
                setter[weaponPrefix + "damage-ability"] = "0";
                
                TAS.debug("PFOccult.createAttack",setter);
            } catch (err) {
                TAS.error("PFAttacks.createAttack err creating "+v.kineticblast_attack_type,err);
            } finally {
                if(_.size(setter)){
                    setter.create_kineticblast_attack=0;
                    SWUtils.setWrapper(setter,PFConst.silentParams,function(){
                        TAS.debug("################ created attack "+id);
                        PFAttacks.recalcRepeatingWeapon(id,function(){
                            PFAttackGrid.resetCommandMacro();
                            PFAttackOptions.resetOption(id);
                        });
                    });
                } else {
                    SWUtils.setWrapper({'create_kineticblast_attack':0},PFConst.silentParams);
                }
            }
        }
    });
}


export var recalculate = TAS.callback(function PFOccultRecalculate(callback,dummy,oldversion){
    var updateBlasts = _.after(2,function(){
        getAttrs(['buff_kineticblast-total','kineticblast_attack-mod','kineticblast_attack',
        'buff_dmg_kineticblast-total','kineticblast_dmg-mod','kineticblast_dmg'],function(v){
            var setter={};
            try {
                v= _.mapObject(v,function(val,key){
                    return (parseInt(val,10)||0);
                });
                updateAttack(v,setter);
                updateDamage(v,setter);
            } catch(err){
                TAS.error("PFOccult.recalculate",err);
            } finally {
                if(_.size(setter)){
                    SWUtils.setWrapper(setter,PFConst.silentParams,callback);
                } else if (typeof callback === "function"){
                    callback();
                }
            }
        });
    });
    getAttrs(['use_burn'],function(vout){
        if(parseInt(vout.use_burn,10)){        
            SWUtils.evaluateAndSetNumber('kineticistburn_macro_text','kineticistburn_max',0);
            SWUtils.evaluateAndSetNumber('internalbuffer_macro_text','internalbuffer_max',0);
            SWUtils.evaluateAndSetNumber('kineticblast_attack_macro_text','kineticblast_attack-mod',0,updateBlasts);            
            SWUtils.evaluateAndSetNumber('kineticblast_dmg_macro_text','kineticblast_dmg-mod',0,updateBlasts);            
        } else if (typeof callback === "function"){
            callback();
        }
    });
});

on("change:kineticblast_attack_macro_text", TAS.callback(function eventKineticBlastMacroUpdate(eventInfo) {
    TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
    SWUtils.evaluateAndAddToTotAsync(null,null,'kineticblast_attack_macro_text','kineticblast_attack-mod','kineticblast_attack');
}));
on("change:kineticblast_dmg_macro_text", TAS.callback(function eventKineticBlastDamageMacroUpdate(eventInfo) {
    TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
    SWUtils.evaluateAndAddToTotAsync(null,null,'kineticblast_dmg_macro_text','kineticblast_dmg-mod','kineticblast_dmg');
}));

on("change:use_burn",TAS.callback(function eventUseBurn(eventInfo){
    if(eventInfo.sourceType==="player"||eventInfo.sourceType==="api"){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        recalculate();
    }
}));

on("change:create_kineticblast_attack",TAS.callback(function eventCreateKineticAttack(eventInfo){
    if(eventInfo.sourceType==="player"||eventInfo.sourceType==="api"){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        createAttack(eventInfo);
    }
}));



on("change:kineticistburn",TAS.callback(function eventUpdateBurn(eventInfo){
    if(eventInfo.sourceType==="player"||eventInfo.sourceType==="api"){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        getAttrs(['non-lethal-damage','kineticistburn','oldkineticistburn','level'],function(v){
            var nld=0,oldburn=0,newburn=0,diff=0,level=0,newdmg=0,newnld=0,setter={};
            try{
                oldburn=parseInt(v['oldkineticistburn'],10)||0;
                newburn=parseInt(v['kineticistburn'],10)||0;
                if(oldburn!==newburn){
                    setter.oldkineticistburn=newburn;
                    nld=parseInt(v['non-lethal-damage'],10)||0;
                    diff = (newburn-oldburn)||0;
                    level = parseInt(v.level,10)||0;
                    newdmg=diff*level;
                    TAS.debug("PFOccult.change:kineticistburn level:"+ level+", newdmg:"+newdmg+", curr nld:"+nld,v);
                    newnld = nld + newdmg;
                    if (newnld<0){
                        newnld=0;
                    }
                    setter['non-lethal-damage']=newnld;
                }
            } catch (err){
                TAS.error("PFOccult.change:kineticistburn kineticburn",err);
            } finally {
                if (_.size(setter)){
                    SWUtils.setWrapper(setter,PFConst.silentParams);
                }
            }
        });
    }
}));