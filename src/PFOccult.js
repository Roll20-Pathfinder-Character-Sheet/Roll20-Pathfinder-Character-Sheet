'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';

on("change:use_burn",TAS.callback(function eventUseBurn(eventInfo){
    getAttrs(['use_burn'],function(v){
        if(parseInt(v.use_burn,10)){
            SWUtils.evaluateAndSetNumber('kineticistburn_macro_text','kineticistburn_max',0);
            SWUtils.evaluateAndSetNumber('internalbuffer_macro_text','internalbuffer_max',0);
        }
    });
}));


on("change:kineticistburn",TAS.callback(function eventUpdateBurn(eventInfo){
    if(eventInfo.sourceType==="player"){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        getAttrs(['non-lethal-damage','kineticistburn','oldkineticistburn','internalbuffer_macro_text',
            'class-0-level','class-1-level','class-2-level','class-3-level','class-4-level',
            'class-5-level','level','npc-hd-num'],function(v){
            var nld=0,oldburn=0,newburn=0,diff=0,level=0,tempstr='',newdmg=0,newnld=0,matches,setter={};
            try{
                nld=parseInt(v['non-lethal-damage'],10)||0;
                oldburn=parseInt(v['oldkineticistburn'],10)||0;
                newburn=parseInt(v['kineticistburn'],10)||0;
                if(oldburn!==newburn){
                    setter.oldkineticistburn=newburn;
                    diff = (newburn-oldburn)||0;
                    if(v.internalbuffer_macro_text){
                        matches=v.internalbuffer_macro_text.match(/class\-0\-level|class\-1\-level|class\-2\-level|class\-3\-level|class\-4\-level|class\-5\-level|level|npc\-hd\-num/i);
                        if(matches ){
                            //TAS.debug("the values are nonlethal:"+nld+", old:"+oldburn+", new:"+newburn+", diff:"+diff,v);
                            tempstr=matches[0].toLowerCase();
                            level = parseInt(v[tempstr],10)||0;
                            newdmg=diff*level;
                            //TAS.debug("the value of "+tempstr+" is "+ level+", newdmg:"+newdmg+", curr nld:"+nld);
                            newnld = nld + newdmg;
                            if (newnld<0){
                                newnld=0;
                            }
                            setter['non-lethal-damage']=newnld;
                        }
                    }
                }
            } catch (err){
                TAS.error("PFOccult modifle kineticburn",err);
            } finally {
                if (_.size(setter)){
                    SWUtils.setWrapper(setter);
                }
            }

        });
    }
}));