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

/** arrayToMap Splits array of {{x=y}} to mapping of '{{x=': 'y}}' 
 * and splits &{template:templatename} on the :
 * unless the item has no equals sign then the value = map.
 *    e.g. @{option}  is returned as @{option}=@{option}
 *@param {Array} currArray of strings for rolltemplate {{key=value}}
 *@returns {jsobj} of each array entry split in half
 */
function arrayToMap (currArray,removeWhisper){
    return _.reduce(currArray,function(memo,val){
        var spliteq=val.split('=');
        if (val){
            if(spliteq.length===2){
                memo[spliteq[0]+'=']=spliteq[1];
            } else if(spliteq.length>2){
                memo[spliteq[0]+'=']= _.rest(spliteq,1).join('=');
            } else if ((/template:/).test(val)){
                memo['&{template:']=val.slice(val.indexOf(':')+1);
            } else if (!(removeWhisper && (/whisper/i).test(val))){
                memo[val]=val;
            }
        }
        return memo;
    },{});
}
/**mergeMacroMaps merges currMap into defaultMap 
 *@param {jsobj} currMap map of the current macro text on a sheet created by arrayToMap:
                            {rollqueryleft: rollqueryright}
 *@param {jsobj} defaultMap {rollqueryleft : {
                            current:rollqueryright, 
                            old:[  oldrollqueryright1, oldrollqueryright2 ], 
                            replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}] 
                            }
                        }
 *@param {Array} sameAsKeys array of strings of keys in defaultMap where value.current is the same string as the key
 *@returns {Array} of strings for macro entries.
 */
function mergeMacroMaps (currMap,defaultMap,sameAsKeys){
    var currKeys=[],newKeys=[],customKeys=[], newArray=[] , customizedMap={}, userDefinedMap={};
    try {
        currKeys = _.keys(currMap).sort();
        customKeys = _.difference(currKeys,_.keys(defaultMap)).sort();
        if (!sameAsKeys || _.size(sameAsKeys)===0 ){
            sameAsKeys = _.reduce(defaultMap,function(memo,val,key){
                if (val.current===key){
                    memo.push(key);
                }
                return memo;
            },[]).sort();
        }
        //TAS.debug("at mergeMacroMaps comparing: ",currMap,defaultMap,sameAsKeys);
        customizedMap = _.chain(defaultMap)
            .pick(function(compareobj,defaultKey){
                //intersection
                return (_.indexOf(currKeys,defaultKey,true) >=0 );
            })
            .omit(function(compareobj,defaultKey){
                //difference
                return (_.indexOf(sameAsKeys,defaultKey,true)>=0);
            })
            .omit(function(compareobj,defaultKey){
                //user val = new
                return (compareobj.current === currMap[defaultKey]);
            })
            .omit(function(compareobj,defaultKey){
                //user val = one of old vals
                return ( !(compareobj.old) || (_.indexOf(compareobj.old,currMap[defaultKey]) >=0)  );
            })
            .mapObject(function(compareobj,defaultKey){
                //only customized values left, if any
                var newString='';
                try {
                    newString = currMap[defaultKey];
                    if (newString){
                        if (compareobj.replacements){
                            newString = _.reduce(compareobj.replacements,function(memo,replacer){
                                return memo.replace(replacer.from,replacer.to);
                                },newString);		
                        }
                        newString = defaultKey + newString;
                    }
                } catch (erri) {
                    TAS.error('mergeMacroMaps  erri on '+defaultKey,erri);
                } finally {
                    return newString;
                }
            }).value();

        //extra stuff from user.
        userDefinedMap = _.reduce (customKeys,function(memo,currKey){
                if( currKey !== currMap[currKey] ){
                    memo[currKey] = currKey+currMap[currKey];
                } else {
                    memo[currKey] = currKey;
                }
                return memo;
            },{});
            
        //TAS.info("joining ",defaultMap,customizedMap,userDefinedMap);
        //array in order of defaultMap, add in custom values, then turn to array
        newArray = _.chain(defaultMap)
            .mapObject(function(compareobj,defaultKey){
                if (_.indexOf(sameAsKeys,defaultKey)>=0){
                
                    return defaultKey;
                }
                return defaultKey + compareobj.current;
            })
            .extend(customizedMap)
            .extend(userDefinedMap)
            .values()
            .value();

    } catch(err3) {
        TAS.error("getNewArray outer error",err3);
    } finally {
        return newArray;
    }
}
/**migrateMacro makes sure one macro is up to date, synchronous.
 *@param {string} currMacro current macro from sheet
 *@param {string} defaultMacro default / new correct macro string
 *@param {{string : {current:string,  old:[  string ],  replacements:[  { from: string, to:string}]  }
                        }} defaultMap {rollqueryleft : {
                            current:rollqueryright, 
                            old:[  oldrollqueryright1, oldrollqueryright2 ], 
                            replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}] 
                            }
                        }
 *@param {[string]} deleteArray array of strings to just delete from the currMacro.
 *@param {[string]} sameAsKeys array of strings of keys in defaultMap where value.current is the same string as the key
 *@returns {string} one of 3 values:
            null if caller should NOT update macro, 
            "BLANK" if caller should update macro attribute with "" to reset it.
            any other string: the new macro (if the user customized it, then this is the new one with updates)
 */
export function migrateMacro  (currMacro,defaultMacro,defaultMap,deleteArray,sameAsKeys) {
   var currMacroArray, currMacroMap,newMacroArray,newMacroString=null;
    try {
        if (currMacro !== defaultMacro){
            if (deleteArray && Array.isArray(deleteArray)){
                _.each(deleteArray,function(strToDelete){
                    currMacro = currMacro.replace(strToDelete,'');
                });
            }
            if (currMacro===defaultMacro){
                newMacroString=null;
            } else {
                currMacroArray = splitMacro(currMacro);
                currMacroArray = _.reject(currMacroArray,function(val){
                    return (!val || val==="0" || val==="1" || val.indexOf("undefined")>=0);
                });
                currMacroMap = arrayToMap(currMacroArray,true);
                //TAS.info("migrateMacro calling map with ",currMacroMap,defaultMap,sameAsKeys);
                newMacroArray = mergeMacroMaps (currMacroMap,defaultMap,sameAsKeys);
                //TAS.debug("migrateMacro received back ",newMacroArray);
                newMacroArray = _.reject(newMacroArray,function(val){
                    return (!val || val==="0" || val==="1" || val.indexOf("undefined")>=0);
                });
                newMacroString = newMacroArray.join(' ');
                if (newMacroString === defaultMacro){
                    newMacroString= 'BLANK';
                }
            }
        }
    } catch (err){
        TAS.error("PFMacros.migrateMacro error on "+currMacro,err);
    } finally {
        return newMacroString;
    }
}
/** migrateRepeatingMacros updates all macros in the section 
 * @param {function} callback after calling SWUtils.setWrapper with the new macros
 * @param {string} section  name after "repeating_"
 * @param {string} fieldname  the attribute name containing the macro after "id_"
 * @param {string} defaultMacro the current Macro in the page
 * @param {jsobj} defaultMap map of "{{rolltemplatekey=" to right side "var}}"
        {rollqueryleft : {
            current:rollqueryright, 
            old:[  oldrollqueryright1, oldrollqueryright2 ], 
            replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}] 
            }
        }
 * @param {Array} deleteArray  array of strings of old rolltemplate entries that are not used (entire entry not just left side )
 */
export function migrateRepeatingMacros  (callback,section,fieldname,defaultMacro,defaultMap,deleteArray, whisper){
   var done = _.once(function(){
        //TAS.debug("leaving migrateRepeatingMacros for "+ section + ", "+fieldname);
        if (typeof callback === "function") {
            callback();
        }
    });
    whisper=whisper||'';
    if (whisper) {whisper+=' ';}
    getSectionIDs('repeating_'+section,function(ids){
        var fields=[],prefix='repeating_'+section+'_';
        if (!ids || _.size(ids)===0){
            done();
            return;
        }
        _.each(ids,function(id){
            fields.push(prefix+id+'_'+fieldname);
        });
        getAttrs(fields,function(v){
            var setter={},sameAsKeys=[];
            sameAsKeys = _.reduce(defaultMap,function(memo,val,key){
                if (val.current===key){
                    memo.push(key);
                }
                return memo;
            },[]).sort();
            setter=_.reduce(v,function(memo,currMacro,key){
                var newMacro="";
                try {
                    if (!currMacro){
                        //setting to blank does not seem to work, it keeps coming back as undefined, so set to default.
                        memo[key]=whisper +defaultMacro;
                    } else {
                        currMacro=PFUtils.removeWhisperFromMacro(currMacro);
                        newMacro = migrateMacro(currMacro,defaultMacro,defaultMap,deleteArray,sameAsKeys);
                        if (newMacro==="BLANK") {
                            memo[key]="";
                        } else if (newMacro){
                            memo[key]=whisper + newMacro;
                        }
                    }
                } catch (innererr){
                    TAS.error("migrateRepeatingMacros error migrating "+ key,innererr);
                } finally {
                    return memo;
                }
            },{});
            if (_.size(setter)>0){
                SWUtils.setWrapper(setter,{},done);
            } else {
                done();
            }
        });
    });		
}
/**Calls migrateRepeatingMacros once for each version of the parameters in replaceArray
 * each parameter below potentially has the word 'REPLACE' in it, for each element in replaceArray,
 * replace the word REPLACE with that element.
 * This is not the most efficient, but it was alot easier than rewriting migrateRepeatingMacros 
 *@param {function} callback after calling SWUtils.setWrapper with the new macros
 *@param {string} section  name after "repeating_"
 *@param {string} fieldname  the attribute name containing the macro after "id_"
 *@param {string} defaultMacro the current Macro in the page
 *@param {jsobj} defaultMap map of "{{rolltemplatekey=" to right side "var}}"
        {rollqueryleft : {
            current:rollqueryright, 
            old:[  oldrollqueryright1, oldrollqueryright2 ], 
            replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}] 
            }
        }
 *@param {Array} deleteArray array of strings of old rolltemplate entries that are not used (entire entry not just left side )
 *@param {Array} replaceArray array of strings to replace the word 'REPLACE' with that are found in the other params.
 */
export function migrateRepeatingMacrosMult  (callback,section,fieldname,defaultMacro,defaultMap,deleteArray,replaceArray, whisper){
   var done=_.once(function(){
        //TAS.debug("leaving migrateRepeatingMacrosMult for "+section+"_"+fieldname);
        if (typeof callback === "function"){
            callback();
        }
    }),
    fieldnames={}, defaultMacros={}, defaultMaps={}, deleteArrays={}, numTimes, doneOnce;
    try {
        if(!( replaceArray && Array.isArray(replaceArray) && _.size(replaceArray)>0)){
            TAS.warn("migrateRepeatingMacrosMult no replace array for "+section+", "+fieldname);
            done();
            return;
        }
        numTimes = _.size(replaceArray);
        doneOnce = _.after(numTimes,done);
        //create new mappings of fieldname, defaultMacro, defaultMap, deleteArray
        //one new version of each per element in replaceArray.
        fieldnames = _.reduce(replaceArray,function(m,val){
            m[val]=fieldname.replace(/REPLACE/g,val);
            return m;
        },{});
        defaultMacros = _.reduce(replaceArray,function(m,val){
            m[val]=defaultMacro.replace(/REPLACE/g,val);
            return m;
        },{});
        defaultMaps =_.reduce(replaceArray,function(replaceMemo,val){
            var newMap ={};
            try {
                newMap =_.reduce(defaultMap,function(m,currobj,key){
                    var newkey, newobj={};
                    try {
                        newkey = key.replace(/REPLACE/g,val);
                        newobj.current = currobj.current.replace(/REPLACE/g,val);
                        if(currobj.old){
                            newobj.old = _.map(currobj.old,function(oldmacro){
                                return oldmacro.replace(/REPLACE/g,val);
                            });
                        }
                        if (currobj.replacements){
                            newobj.replacements= _.map(currobj.replacements,function(replacementobj){
                                var newreplacement = {};
                                newreplacement.from = replacementobj.from.replace(/REPLACE/g,val);
                                newreplacement.to = replacementobj.to.replace(/REPLACE/g,val);
                                return newreplacement;
                            });
                        }
                        m[newkey]=newobj;
                    } catch (innererr){
                        TAS.error("migrateRepeatingMacrosMult, error creating defaultMaps: replaceval"+val+", key="+key+", matching obj:",currobj);
                    } finally {
                        return m;
                    }
                },{});
                replaceMemo[val]=newMap;
            } catch (errineer2){
                TAS.error("error building map of defaultMap : replaceval:"+val);
            } finally {
                return replaceMemo;
            }
        },{});
        if(deleteArray){
            deleteArrays = _.reduce(replaceArray,function(m,val){
                m[val] = _.map(deleteArray,function(delstr){
                        return delstr.replace(/REPLACE/g,val);
                    });
                return m;
            },{});
        }
        _.each(replaceArray,function(val){
            var delArray;
            try {
                if(fieldnames[val] && defaultMacros[val] && defaultMaps[val] ){
                    delArray= deleteArrays[val]||null;
                    migrateRepeatingMacros(doneOnce,section,fieldnames[val],defaultMacros[val],defaultMaps[val],delArray,whisper);
                } else {
                    doneOnce();
                }
            } catch(err){
                TAS.error("migrateRepeatingMacrosMult error calling migrateRepeatingMacros for "+val,err);
                doneOnce();
            }
        });
    } catch (outererr){
        TAS.ERROR("migrateRepeatingMacrosMult error in outermost section SHOULD NOT HAPPEN ",outererr);
        done();
    }
}
/**
 * 
 * 
 * @export
 * @param {any} callback 
 * @param {any} fieldname 
 * @param {any} defaultMacro 
 * @param {any} defaultMap 
 * @param {any} deleteArray 
 * @param {any} sameAsKeys 
 * @param {any} whisper 
 */
export function migrateStaticMacro (callback, fieldname, defaultMacro, defaultMap, deleteArray, sameAsKeys, whisper){
    var done = _.once(function(){
        //TAS.debug("leaving migrateRepeatingMacros for "+ fieldname);
        if (typeof callback === "function") {
            callback();
        }
    });
    whisper=whisper||'';
    if (whisper) {whisper+=' ';}
    //TAS.debug("at PFMacros.migrateStaticMacro for repeating_"+ fieldname);
    getAttrs([fieldname],function(v){
        var setter={}, newMacro='', currMacro='';
        try {
            if (!sameAsKeys){
                sameAsKeys = _.reduce(defaultMap,function(memo,val,key){
                    if (val.current===key){
                        memo.push(key);
                    }
                    return memo;
                },[]).sort();
            }
            currMacro = v[fieldname];
            if(!currMacro){
                setter[fieldname]=whisper + defaultMacro;
            } else {
                currMacro=PFUtils.removeWhisperFromMacro(currMacro);
                newMacro = migrateMacro(currMacro,defaultMacro,defaultMap,deleteArray,sameAsKeys);
                if(newMacro){
                    if (newMacro === 'BLANK'){
                        setter[fieldname]="";
                    } else {
                        setter[fieldname]=whisper + newMacro;
                    }
                }
            }
        } catch (innererr){
            TAS.error("migrateRepeatingMacros error migrating "+fieldname+", "+currMacro,innererr);
        } finally {
            if (_.size(setter)>0){
                SWUtils.setWrapper(setter,{},done);
            } else {
                done();
            }
        }
    });
}
/**
 * 
 * @param {any} callback 
 * @param {any} fieldnames 
 * @param {any} defaultMacros 
 * @param {any} defaultMaps 
 * @param {any} deleteArrays 
 * @param {any} sameAsKeys 
 * @param {any} whisper 
 */
export function migrateStaticMacros  (callback,fieldnames,defaultMacros,defaultMaps,deleteArrays, sameAsKeys, whisper){
    var done = _.once(function(){
        //TAS.debug("leaving migrateStaticMacros ");
        if (typeof callback === "function") {
            callback();
        }
    }), fields =[], keys=[];
    whisper=whisper||'';
    if (whisper) {whisper+=' ';}
    fields =_.values(fieldnames);
    keys = _.keys(fieldnames);
    getAttrs(fields,function(v){
        var setter={};
        if (!sameAsKeys || !Array.isArray(sameAsKeys) || _.size(sameAsKeys)===0){
            sameAsKeys = _.reduce(defaultMaps[0],function(memo,val,key){
                if (val.current===key){
                    memo.push(key);
                }
                return memo;
            },[]).sort();
        }
        setter=_.reduce(keys,function(memo,key){
            var newMacro="", currMacro="", delArray=null, field='';
            try {
                field=fieldnames[key];
                currMacro = v[field];
                if(!currMacro){
                    memo[field]=defaultMacros[key];
                } else {
                    if(deleteArrays && deleteArrays[key]){
                        delArray = deleteArrays[key];
                    }
                    if (currMacro){
                        newMacro = migrateMacro(currMacro,defaultMacros[key],defaultMaps[key],delArray,sameAsKeys);
                        if (newMacro==="BLANK") {
                            memo[field]="";
                        } else if (newMacro){
                            memo[field]=newMacro;
                        }
                    }
                }
            } catch (innererr){
                TAS.error("migrateStaticMacros error migrating "+ key,innererr);
            } finally {
                return memo;
            }
        },{});
        //TAS.debug("migrateStaticMacros setting ", setter);
        if (_.size(setter)>0){
            SWUtils.setWrapper(setter,{},done);
        } else {
            done();
        }
    });		
}
/** migrateStaticMacrosMult migrate many static macros with names following a pattern (skills)
 * fieldname can have the following keys in it:
 * REPLACE  - replace this with string from replaceArray
 * REPLACELOWER - replace this with lowercase of string from replaceArray
 * REPLACEREMOVENUMBER - replace this with: strip out digit chars from string from replaceArray
 * REPLACELOWERREMOVENUMBER - replace this with: strip out digit chars from lowercase string from replaceArray
 * 
 * if any of the "REMOVENUMBER" values are used, then caller should set useNoNumber to true
 * 
 * @param {function} callback after calling SWUtils.setWrapper with the new macros
 * @param {string} fieldname string pattern of attr we are saving to. Should have one of 'REPLACE','REPLACELOWER','REPLACEREMOVENUMBER','REPLACELOWERREMOVENUMBER' in it, which will be replaced by values in replaceArray
 * @param {string} defaultMacro default macro with REPLACE strings
 * @param {{string : {current:string,  old:[  string ],  replacements:[  { from: string, to:string}]  }
                        }} defaultMap a map of key and values for the rolltemplate.  
                         {rollqueryleft : {current:rollqueryright, old:[  oldrollqueryright1, oldrollqueryright2 ], 
                            replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}] } }
 * @param {[string]} deleteArray Strings to delete from the macro (such as @{PC-Whisper} or other @{attrname}) that do not correspond to key-value pair in defaultMacro
 * @param {[string]} replaceArray values to insert in place of "REPLACEx" strings found in fieldname
 * @param {[string]} keysToReplaceShortcut array of keys from defaultMacro, if not supplied will be built
 * @param {[string]} valsToReplaceShortcut 
 * @param {boolean} useNoNumber When matching replaceArray, whether to try to strip numbers from replace strings as well as use the whole string
 * @param {string} whisper Either @{PC-Whisper} or @{NPC-Whisper}
 */
export function migrateStaticMacrosMult (callback, fieldname, defaultMacro, defaultMap, deleteArray, replaceArray, 
    keysToReplaceShortcut, valsToReplaceShortcut, useNoNumber, whisper){
    var done=_.once(function(){
        //TAS.debug("leaving migrateRepeatingMacrosMult for "+fieldname);
        if (typeof callback === "function"){
            callback();
        }
    }),
    fieldnames={}, replacers = {},defaultMacros={}, defaultMaps={}, deleteArrays={}, numTimes, doneOnce, sameAsKeys,
    replaceStrings = function(str,val){
        var fromAndTos=[];
        try {
            fromAndTos =replacers[val];
            //TAS.debug("now using replacer to replace :"+val+" in "+str,fromAndTos);
            if (fromAndTos){
                _.each(fromAndTos,function(replacer){
                    str = str.replace(replacer.from,replacer.to);
                });
            }
        } catch (err){
            TAS.error("PFMacros migrateStaticMacrosMult replaceStrings error replacing  "+val+" in "+str,replacers[val],err);
        } finally {
            return str;
        }
    };
    try {
        whisper=whisper||'';
        if (whisper) {whisper+=' ';}
        if(!( replaceArray && Array.isArray(replaceArray) )){
            TAS.warn("migrateStaticMacrosMult no replace array for  "+fieldname);
            done();
            return;
        }
        numTimes = _.size(replaceArray);
        doneOnce = _.after(numTimes,done);
        //create new mappings of fieldname, defaultMacro, defaultMap, deleteArray
        //one new version of each per element in replaceArray.
        if (useNoNumber){
            replacers = _.reduce(replaceArray,function(m,val){
                var valNoNum = val.replace(/\d+/g,'').replace(/\-+$/,'');
                    m[val] = [{ 'from':/REPLACELOWERREMOVENUMBER/g, 'to': valNoNum.toLowerCase()},
                        {'from':/REPLACELOWER/g, 'to': val.toLowerCase()},
                        {'from':/REPLACEREMOVENUMBER/g, 'to': valNoNum},
                        {'from':/REPLACE/g, 'to': val}];
                    return m;
            },{});
        } else {
            replacers = _.reduce(replaceArray,function(m,val){
                m[val] = [{'from':/REPLACELOWER/g, 'to': val.toLowerCase()},
                    {'from':/REPLACE/g, 'to': val}];
                return m;
            },{});
        }
        fieldnames = _.reduce(replaceArray,function(m,val){
            m[val]=fieldname.replace(/REPLACE/g,val);
            return m;
        },{});
        sameAsKeys = _.reduce(defaultMap,function(memo,compObj,key){
            var replacedKeys=[];
            if (compObj.current===key){
                //see if this needs replacing.
                if (_.indexOf(keysToReplaceShortcut,key,true)>=0){
                    replacedKeys = _.map(replaceArray,function(replaceKey){
                        return key.replace(/REPLACE/g, replaceKey);
                    });
                    memo = memo.concat(replacedKeys);
                } else {
                    memo.push(key);
                }
            }
            return memo;
        },[]).sort();

        defaultMacros = _.reduce(replaceArray,function(m,val){
            var newMacro = replaceStrings(defaultMacro, val);
            m[val]=newMacro;
            return m;
        },{});
        defaultMaps =_.reduce(replaceArray,function(replaceMemo,val){
            var newMap ={};
            try {
                newMap =_.reduce(defaultMap,function(memo,currobj,key){
                    var newkey, newobj={};
                    try {
                        if (_.indexOf(keysToReplaceShortcut,key,true)>=0){
                            newkey = key.replace(/REPLACE/g,val);
                        } else {
                            newkey = key;
                        }
                        if (_.indexOf(valsToReplaceShortcut,key,true)>=0){
                            newobj.current = replaceStrings(currobj.current, val);
                            if(currobj.old){
                                newobj.old = _.map(currobj.old,function(oldmacro){
                                    return replaceStrings(oldmacro, val);
                                });
                            }
                        } else {
                            newobj.current = currobj.current;
                            if (currobj.old){
                                newobj.old = currobj.old;
                            }
                        }
                        if (currobj.replacements){ 
                            newobj.replacements = currobj.replacements;
                        }
                        memo[newkey]=newobj;
                    } catch (innererr) {
                        TAS.error("migrateStaticMacrosMult error creating defaultMaps: replaceval"+val+", key="+key+", matching obj:",currobj);
                    } finally {
                        return memo;
                    }
                },{});
                replaceMemo[val]=newMap;
            } catch (errineer2){
                TAS.error("migrateStaticMacrosMult error building map of defaultMap : replaceval:"+val);
            } finally {
                return replaceMemo;
            }
        },{});
        
        if(deleteArray){
            deleteArrays = _.reduce(replaceArray,function(m,val){
                m[val] = _.map(deleteArray,function(delstr){
                        return replaceStrings(delstr,val);
                    });
                return m;
            },{});
        }
        migrateStaticMacros(done,fieldnames,defaultMacros,defaultMaps,deleteArrays,sameAsKeys,whisper);
    } catch (outererr){
        TAS.ERROR("migrateStaticMacrosMult error in outermost section SHOULD NOT HAPPEN ",outererr);
        done();
    }
}
//PFConsole.log('   PFMacros module loaded         ');
//PFLog.modulecount++;
