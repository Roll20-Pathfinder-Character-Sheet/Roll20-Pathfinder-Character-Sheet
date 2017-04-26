'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';


function setSanityThreshold (callback){
    var done=function(){
        if (typeof callback === "function"){
            callback();
        }
    }
    getAttrs(['use_horror_adventures','sanity_threshold','sanity-ability-mod','sanity_threshold_misc-mod'],function(v){
        var currThreshold=0,newThreshold=0,setter={};
        try {
            TAS.debug("At PFHorror.setSanityThreshold:",v);
            if (parseInt(v.use_horror_adventures,10)){
                currThreshold=parseInt(v.sanity_threshold,10)||0;
                newThreshold=(parseInt(v['sanity-ability-mod'],10)||0)+(parseInt(v['sanity_threshold_misc-mod'],10)||0);
                if (currThreshold!==newThreshold){
                    setter.sanity_threshold=newThreshold;
                } 
            }
        } catch (err){
            TAS.error("PFHorror.setSanityThreshold error",err);
        } finally {
            if (_.size(setter)){
                setAttrs(setter,PFConst.silentParams,done);
            } else {
                done();
            }
        }
    });
}


function setSanityScore (callback){
    var done=function(){
        if (typeof callback === "function"){
            callback();
        }
    }
    getAttrs(['use_horror_adventures','sanity_score_max','sanity_edge', 'WIS-mod','INT-mod','CHA-mod','sanity_score_misc-mod'],function(v){
        var currSanity=0,newSanity=0,newEdge=0,setter={};
        try {
            TAS.debug("At PFHorror.setSanityScore:",v);
            if (parseInt(v.use_horror_adventures,10)){
                currSanity=parseInt(v.sanity_score_max,10)||0;
                newSanity=(parseInt(v['WIS-mod'],10)||0)+(parseInt(v['INT-mod'],10)||0)+(parseInt(v['CHA-mod'],10)||0)+
                    (parseInt(v['sanity_score_misc-mod'],10)||0);
                if (currSanity!==newSanity){
                    newEdge = Math.floor(newSanity/2);
                    setter.sanity_score_max = newSanity;
                    setter.sanity_edge = newEdge;
                } 
            }
        } catch (err){
            TAS.error("PFHorror.setSanityScore error",err);
        } finally {
            if (_.size(setter)){
                setAttrs(setter,PFConst.silentParams,done);
            } else {
                done();
            }
        }
    });
}

export function recalculate(callback){
    setSanityScore();
    setSanityThreshold();
    if (typeof callback === "function"){
        callback();
    }
}

function registerEventHandlers () {
 	on("change:WIS-mod change:INT-mod change:CHA:mod change:sanity_score_misc-mod",TAS.callback(function eventAllMentalStatsUpdate(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if(eventInfo.sourceType === "sheetworker" ) {
            setSanityScore();
		}
	}));   
 	on("change:sanity-ability-mod change:sanity_threshold_misc-mod",TAS.callback(function eventThresholdUpdate(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if(eventInfo.sourceType === "sheetworker" ) {
            setSanityThreshold();
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFHealth module loaded         ');
PFLog.modulecount++;

