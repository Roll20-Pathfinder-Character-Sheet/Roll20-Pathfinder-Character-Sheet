'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFDefense from './PFDefense';

// Returns the carrying capacity for a given strength score and load type
// Will recursively calculate for strength scores over 29
function getCarryingCapacity (str, load) {
    var l,
    m,
    h,
    r;
    switch (str) {
        case 0:
            l = 0;
            m = 0;
            h = 0;
            break;
        case 1:
            l = 3;
            m = 6;
            h = 10;
            break;
        case 2:
            l = 6;
            m = 13;
            h = 20;
            break;
        case 3:
            l = 10;
            m = 20;
            h = 30;
            break;
        case 4:
            l = 13;
            m = 26;
            h = 40;
            break;
        case 5:
            l = 16;
            m = 33;
            h = 50;
            break;
        case 6:
            l = 20;
            m = 40;
            h = 60;
            break;
        case 7:
            l = 23;
            m = 46;
            h = 70;
            break;
        case 8:
            l = 26;
            m = 53;
            h = 80;
            break;
        case 9:
            l = 30;
            m = 60;
            h = 90;
            break;
        case 10:
            l = 33;
            m = 66;
            h = 100;
            break;
        case 11:
            l = 38;
            m = 76;
            h = 115;
            break;
        case 12:
            l = 43;
            m = 86;
            h = 130;
            break;
        case 13:
            l = 50;
            m = 100;
            h = 150;
            break;
        case 14:
            l = 58;
            m = 116;
            h = 175;
            break;
        case 15:
            l = 66;
            m = 133;
            h = 200;
            break;
        case 16:
            l = 76;
            m = 153;
            h = 230;
            break;
        case 17:
            l = 86;
            m = 173;
            h = 260;
            break;
        case 18:
            l = 100;
            m = 200;
            h = 300;
            break;
        case 19:
            l = 116;
            m = 233;
            h = 350;
            break;
        case 20:
            l = 133;
            m = 266;
            h = 400;
            break;
        case 21:
            l = 153;
            m = 306;
            h = 460;
            break;
        case 22:
            l = 173;
            m = 346;
            h = 520;
            break;
        case 23:
            l = 200;
            m = 400;
            h = 600;
            break;
        case 24:
            l = 233;
            m = 466;
            h = 700;
            break;
        case 25:
            l = 266;
            m = 533;
            h = 800;
            break;
        case 26:
            l = 306;
            m = 613;
            h = 920;
            break;
        case 27:
            l = 346;
            m = 693;
            h = 1040;
            break;
        case 28:
            l = 400;
            m = 800;
            h = 1200;
            break;
        case 29:
            l = 466;
            m = 933;
            h = 1400;
            break;
        default:
            l = getCarryingCapacity(str - 10, "light") * 4;
            m = getCarryingCapacity(str - 10, "medium") * 4;
            h = getCarryingCapacity(str - 10, "heavy") * 4;
            break;
    }
    switch (load) {
        case "light":
            r = l;
            break;
        case "medium":
            r = m;
            break;
        case "heavy":
            r = h;
            break;
    }
    return r;
}

/* updateCurrentLoad-updates the current load radio button */
function updateCurrentLoad (callback, silently) {
    var done = function () {
        if (typeof callback === "function") {
            callback();
        }
    };
    getAttrs(["load-light", "load-medium", "load-heavy", "load-max", "current-load", "carried-total","max-dex-source"], function (v) {
        var curr = 0,
        carried = 0,
        light = 0,
        medium = 0,
        heavy = 0,
        max = 0,
        maxDexSource = 0,
        ignoreEncumbrance = 0,
        newLoad = 0,
        setter = {},
        params = {};
        try {
            //TAS.debug("at updateCurrentLoad",v);
            maxDexSource=parseInt(v["max-dex-source"],10)||0;
            ignoreEncumbrance =  (maxDexSource===1 || maxDexSource===3)?1:0;
            curr = parseInt(v["current-load"], 10) || 0;
            if (ignoreEncumbrance){
                newLoad=0;
            } else {
                
                carried = parseInt(v["carried-total"], 10) || 0;
                light = parseInt(v["load-light"], 10) || 0;
                medium = parseInt(v["load-medium"], 10) || 0;
                heavy = parseInt(v["load-heavy"], 10) || 0;
                max = heavy * 2;
            
                //TAS.debug"current-load=" + curr + ", carried-total=" + carried + ", load-light=" + light + ", load-medium=" + medium);
                if (carried <= light) {
                    //TAS.debug("light load");
                    newLoad = 0;
                } else if (carried <= medium) {
                    //TAS.debug("medium load");
                    newLoad = 1;
                } else if (carried <= heavy) {
                    //TAS.debug("heavy load");
                    newLoad = 2;
                } else if (carried <= max) {
                    //TAS.debug"over heavy but under max");
                    newLoad = 3;
                } else if (carried > max) {
                    //TAS.debug"maximum load");
                    newLoad = 4;
                }
            }
            if (curr !== newLoad){
                setter["current-load"] = newLoad;
            }
        } catch (err) {
            TAS.error("PFEncumbrance.updateCurrentLoad", err);
        } finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            } else {
                done();
            }
        }
    });
}
/* updateLoadsAndLift
 * updates the load and lift numbers
 */
export function updateLoadsAndLift (callback, silently) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
    getAttrs(["STR", "size", "size-multiplier", "legs", "load-light", "load-medium", "load-heavy", "load-max",
    "lift-above-head", "lift-off-ground", "lift-drag-and-push", "load-str-bonus", "load-multiplier", 
    "total-load-multiplier", "load-misc"], function (v) {
        var str = 10,
        size = 1,
        sizeMult = 1,
        currSizeMult = 1,
        currTotalLoadMult = 1,
        legs = 2,
        light = 0,
        medium = 0,
        heavy = 0,
        max = 0,
        aboveHead = 0,
        offGround = 0,
        drag = 0,
        strMod = 0,
        loadMult = 1,
        mult = 1,
        misc = 0,
        l = 0,
        m = 0,
        h = 0,
        a = 0,
        o = 0,
        d = 0,
        setter = {},
        params = {};
        try {
            str = parseInt(v["STR"], 10) || 0;
            size = parseInt(v["size"], 10) || 0;
            sizeMult = parseInt(v["size-multiplier"], 10) || 0;
            currSizeMult = sizeMult;
            currTotalLoadMult = parseInt(v["total-load-multiplier"], 10) || 0;
            legs = parseInt(v["legs"], 10) || 0;
            if (legs!==4){legs=2;}
            light = parseInt(v["load-light"], 10) || 0;
            medium = parseInt(v["load-medium"], 10) || 0;
            heavy = parseInt(v["load-heavy"], 10) || 0;
            max = parseInt(v["load-max"], 10) || 0;
            aboveHead = parseInt(v["lift-above-head"], 10) || 0;
            offGround = parseInt(v["lift-off-ground"], 10) || 0;
            drag = parseInt(v["lift-drag-and-push"], 10) || 0;
            strMod = parseInt(v["load-str-bonus"], 10) || 0;
            loadMult = parseInt(v["load-multiplier"], 10) || 0;
            mult = 1;
            misc = parseInt(v["load-misc"], 10) || 0;
            l = getCarryingCapacity(str + strMod, "light") + misc;
            m = getCarryingCapacity(str + strMod, "medium") + misc;
            h = getCarryingCapacity(str + strMod, "heavy") + misc;
            if (loadMult < 1) {
                loadMult = 1;
            }
            loadMult--;
            //TAS.debug("STR=" + str + ", legs=" + legs + ", load-light=" + light + ", load-medium=" + medium + ", load-heavy=" + heavy + ", lift-above-head=" + aboveHead + ", lift-off-ground=" + offGround + ", lift-drag-and-push=" + drag + ", load-str-bonus=" + strMod + ", load-multiplier=" + loadMult + ", load-misc=" + misc);
            if (legs !== 4 ) {
                switch (size) {
                    case -8:
                        sizeMult = 16;
                        break;
                    case -4:
                        sizeMult = 8;
                        break;
                    case -2:
                        sizeMult = 4;
                        break;
                    case -1:
                        sizeMult = 2;
                        break;
                    case 1:
                        sizeMult = 3 / 4;
                        break;
                    case 2:
                        sizeMult = 1 / 2;
                        break;
                    case 4:
                        sizeMult = 1 / 4;
                        break;
                    case 8:
                        sizeMult = 1 / 8;
                        break;
                    default:
                        sizeMult = 1;
                }
            } else if (legs === 4) {
                switch (size) {
                    case -8:
                        sizeMult = 24;
                        break;
                    case -4:
                        sizeMult = 12;
                        break;
                    case -2:
                        sizeMult = 6;
                        break;
                    case -1:
                        sizeMult = 3;
                        break;
                    case 0:
                        sizeMult = 1.5;
                        break;
                    case 1:
                        sizeMult = 1;
                        break;
                    case 2:
                        sizeMult = 3 / 4;
                        break;
                    case 4:
                        sizeMult = 1 / 2;
                        break;
                    case 8:
                        sizeMult = 1 / 4;
                        break;
                    default:
                        sizeMult = 1.5;
                }
            }
            mult += loadMult;
            mult *= sizeMult;
            l *= mult;
            m *= mult;
            h *= mult;
            a = h;
            o = h * 2;
            d = h * 5;
            //TAS.debug("new light load=" + l + ", new medium load=" + m + ", new heavy load=" + h + ", new above head=" + a + ", new off ground=" + o + ", new drag=" + d);
            if (currSizeMult !== sizeMult) {
                setter["size-multiplier"] = sizeMult;
            }
            if (currTotalLoadMult !== mult) {
                setter["total-load-multiplier"] = mult;
            }
            if (light !== l) {
                setter["load-light"] = l;
            }
            if (medium !== m) {
                setter["load-medium"] = m;
            }
            if (heavy !== h) {
                setter["load-heavy"] = h;
            }
            if (max !== (h*2)){
                setter["load-max"] = (h*2);
            }
            if (aboveHead !== a) {
                setter["lift-above-head"] = a;
            }
            if (offGround !== o) {
                setter["lift-off-ground"] = o;
            }
            if (drag !== d) {
                setter["lift-drag-and-push"] = d;
            }
        } catch (err) {
            TAS.error("updateLoadsAndLift", err);
        } finally {
            if (_.size(setter) > 0) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                SWUtils.setWrapper(setter, params, done);
            } else {
                done();
            }
        }
    });
}
/* updateModifiedSpeed
 * updates the modified speed and run values  */
export function updateModifiedSpeed  (callback) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    }),
    attribList = ["current-load", "speed-base", "speed-modified", "speed-run",
        "race", "is_dwarf", "max-dex-source", "run-mult", "buff_speed-total",
    	"condition-Entangled", "condition-Fatigued","condition-Exhausted" ];    
    _.each(PFDefense.defenseArmorShieldRows, function (row) {
        attribList.push(row + "-equipped");
        attribList.push(row + "-type");
    });
    getAttrs(attribList, function (v) {
        var currSpeed = parseInt(v["speed-modified"], 10) || 0,
        currRun = parseInt(v["speed-run"], 10) || 0,
        currLoad = parseInt(v["current-load"], 10) || 0,
        base = parseInt(v["speed-base"], 10) || 0,
        speedDropdown = parseInt(v["max-dex-source"], 10) || 0,
        origRunMult = isNaN(parseInt(v["run-mult"], 10)) ? 4 : parseInt(v["run-mult"], 10),
        buff = parseInt(v["buff_speed-total"],10)||0,
        halfSpeed = 0,
        cannotRun=0,
        newSpeed = base,
        runMult = origRunMult,
        newRun = base * runMult,
        combinedLoad = 0,
        isDwarf = false,
        inHeavy = false,
        inMedium = false,
        armor3Equipped = 0,
        armorLoad = 0,
        setter = {};
        try {
            base = base + buff;
            newSpeed = newSpeed + buff ;
            if(parseInt(v['condition-Entangled'],10)===2 || parseInt(v['condition-Exhausted']===3)){
                halfSpeed=1;
                base = Math.floor(base/10)*5; //we actually modify old base due to calcs below
                newSpeed = base;
                cannotRun=1;
            } else if (parseInt(v['condition-Fatigued'],10)===1 ){
                cannotRun=1;
            }

             //TAS.debug("speed-modified=" + currSpeed + ", speed-run=" + currRun + ", current-load=" + currLoad + ", speed-base=" + base + ", load-heavy=" + heavy + ", carried-total=" + carried);
            // #0: Armor, Shield & Load
            // #1: Armor & Shield only
            // #2: Load only
            // #3: None
            if (speedDropdown !== 3) {
                armor3Equipped=parseInt(v["armor3-equipped"] ,10)||0;
                //dwarf base speed not lowered but run multiplier can be.
                isDwarf = parseInt(v.is_dwarf,10)||0;
                if (!isDwarf){
                    isDwarf = typeof v.race === "undefined" ? false : v.race.toLowerCase().indexOf("dwarf") >= 0;
                    if (isDwarf){
                        setter["is_dwarf"]=1;
                    }
                }
                if (speedDropdown === 0 || speedDropdown === 1) {
                    if (armor3Equipped){
                        if (v["armor3-type"] === "Heavy"){armorLoad = 2;}
                        else if (v["armor3-type"] === "Medium" ){ armorLoad = 1;}
                    }
                }
                combinedLoad = Math.max(armorLoad,currLoad);
                if (combinedLoad===4){
                    newSpeed = 0;
                    newRun=0;
                    runMult=0;
                } else if (combinedLoad === 3){
                    newSpeed = 5;
                    newRun=0;
                    runMult=0;
                } else if (combinedLoad === 2 || combinedLoad === 1) {
                    if (!isDwarf){
                        if (base <= 5) {
                            newSpeed = 5;
                        } else if (base % 15 === 0) {
                            newSpeed = base * 2 / 3;
                        } else if ((base + 5) % 15 === 0) {
                            newSpeed = (base + 5) * 2 / 3;
                        } else {
                            newSpeed = ((base + 10) * 2 / 3) - 5;
                        }
                    }
                    runMult--;
                } else {
                    newSpeed = base;
                }
            }
            if(cannotRun){
                runMult=0;
            }
            newRun = newSpeed * runMult;
            if (currSpeed !== newSpeed) {
                setter["speed-modified"] = newSpeed;
            }
            if (currRun !== newRun) {
                setter["speed-run"] = newRun;
            }
        } catch (err) {
            TAS.error("PFEncumbrance.updateModifiedSpeed", err);
        } finally {
            if (_.size(setter) > 0) {
                SWUtils.setWrapper(setter, {}, done);
            } else {
                done();
            }
        }
    });
}
export function migrate (callback){
    var done = function(){
        if (typeof callback === "function"){
            callback();
        }
    }
    getAttrs(['max-dex-source'],function(v){
        var val = parseInt(v['max-dex-source'],10);
        if (isNaN(val)){
            SWUtils.setWrapper({'max-dex-source':0},PFConst.silentParams,done);
        } else {
            done();
        }
    });


}
export var recalculate = TAS.callback(function PFEncumbranceRecalculate(callback, silently, oldversion) {
    var done = _.once(function () {
        //TAS.debug("leaving PFEncumbrance.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    }),
    setSpeedWhenDone = _.once(function () {
        updateModifiedSpeed(done);
    }),
    setEncumbrance = _.once(function () {
        updateCurrentLoad(setSpeedWhenDone);
    }),
    setLoadCapability = _.once(function () {
        updateLoadsAndLift(setEncumbrance, silently);
    });
    try {
        migrate(setLoadCapability)
    } catch (err) {
        TAS.error("PFEncumbrance.recalculate", err);
        done();
    }
});
function registerEventHandlers  () {
    on("change:speed-base change:race change:armor3-equipped change:max-dex-source change:run-mult", TAS.callback(function eventUpdateSpeedPlayer(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api"){
            updateModifiedSpeed();
        }
    }));
    on("change:current-load change:armor3-equipped change:armor3-type", TAS.callback(function eventUpdateSpeedAuto(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api"){
            updateModifiedSpeed();
        }
    }));

    on('change:load-light change:carried-total', TAS.callback(function eventUpdateCurrentLoad(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api"){
            updateCurrentLoad();
        }
    }));
    on("change:size-multiplier change:legs change:load-str-bonus change:load-multiplier change:load-misc", TAS.callback(function eventUpdateLoadsAndLiftPlayer(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api"){
            updateLoadsAndLift();
        }
    }));
    on("change:STR change:size", TAS.callback(function eventUpdateLoadsAndLiftAuto(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api"){
            updateLoadsAndLift();
        }
    }));    
}
registerEventHandlers();
//PFConsole.log( '   PFEncumbrance module loaded    ' );
//PFLog.modulecount++;
