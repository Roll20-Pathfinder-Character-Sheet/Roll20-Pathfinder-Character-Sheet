'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFUtilsAsync from './PFUtilsAsync';

/** splitMacro Splits macro into {{x=y}} components
 * and @{attr} if at top level (not inside a {{x=@{attr}}})
 * @param {string} macrostr the macro-text from a repeating row
 * @returns {Array} of strings comprising macro
 */
function splitMacro (macrostr){
    var splitted,newsplit,lastclosing,temparray;
    if (!macrostr) {return "";}
    splitted = macrostr.split(/(?=\{\{)|(?=\&\{)|(?=\|\|)/);
    splitted = SWUtils.trimBoth(splitted);
    newsplit = _.reduce(splitted,function(memo,val){
        try {
            if (val.slice(0,2)==='{{') {
                if (val.slice(-2)==='}}'){
                    memo.push(val);
                } else {
                    lastclosing= val.lastIndexOf('}}');
                    if (lastclosing <0){
                        TAS.error ("error! no closing brackets for ",val);
                        //just fix it
                        val += '}}';
                        lastclosing= val.lastIndexOf('}}');
                        memo.push(val);
                    } else {
                        memo.push(SWUtils.trimBoth(val.slice(0,lastclosing+2)));
                        memo=memo.concat(SWUtils.trimBoth(SWUtils.trimBoth(val.slice(lastclosing+2)).replace('&amp;','&').split(/(?=[\@\&]\{)/)));
                    }
                }
            } else if (val.slice(0,2)==='&{'){
                val=val.replace('&amp;','&'); 
                memo=memo.concat(SWUtils.trimBoth(val.split(/(?=[\@\&]\{)/)));
            } else if (val.slice(0,2)==='||'){
                if(SWUtils.trimBoth(val)!=='||'){
                    val=val.replace('&amp;','&');
                    temparray=SWUtils.trimBoth(val.split(/(?=[\@\&]\{)/));
                    if (temparray[0]==='||'){
                        //skip first one
                        temparray = temparray.slice(1);
                    } else if (temparray[0].slice(-2)!=='||'){
                        //only add || to end of first one
                        temparray[0]= temparray[0]+'||';
                    }
                    memo=memo.concat(temparray);
                }
            } else {
                val=val.replace('&amp;','&'); 
                memo=memo.concat(SWUtils.trimBoth(val.split(/(?=[\@\&]\{)/)));
            }
        } catch (err){
            TAS.error("splitmacro",err);
        } finally {
            return memo;
        }
    },[]);
    return newsplit;
}

export function getTracking(macrostr){
    var trackArray=[],entries=[],last;
    try {
        //TAS.debug("PFMacros.getTracking on" ,macrostr);
        entries = splitMacro(macrostr);
        TAS.debug("PFMacros.getTracking array is ",entries);
        if(entries && _.size(entries) ){
            trackArray = entries.filter(function(entry){
                return (/^\{\{[a-z]+tracking\d+=/i).test(entry);
            }).concat(entries.filter(function(entry){
                if (entry.slice(0,1)!=='{{' && entry.indexOf('||')>=0){
                    return 1;
                }
                return 0;
            }));
        }
        TAS.debug("PFMacros.getTracking tracking is ",trackArray);        
    } catch (err){
        TAS.error("PFMacros.getTracking error",err);
    } finally {
        return trackArray;
    }
}

