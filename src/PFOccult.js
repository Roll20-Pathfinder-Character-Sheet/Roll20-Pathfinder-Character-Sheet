'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';

on("change:use_burn",TAS.callback(function eventUseBurn(eventInfo){
    getAttrs(['use_burn'],function(v){
        if(parseInt(v.use_burn,10)){
            //set initial values
            SWUtils.evaluateAndSetNumber('kineticistburn_macro_text','kineticistburn_max',0);
            SWUtils.evaluateAndSetNumber('internalbuffer_macro_text','internalbuffer_max',0);
        }
    });
}));


on("change:kineticistburn",TAS.callback(function eventUpdateBurn(eventInfo){
    if(eventInfo.sourceType==="player"){
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