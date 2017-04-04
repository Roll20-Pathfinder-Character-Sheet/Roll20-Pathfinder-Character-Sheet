'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';
import * as PFMacros from './PFMacros';
import * as PFMenus from './PFMenus';
import * as PFMigrate from './PFMigrate';
import * as PFDefense from './PFDefense';
import * as PFAttackOptions from  './PFAttackOptions';
import * as PFAttackGrid from './PFAttackGrid';

var wornEquipBaseRowsOld = ["Belt", "Body", "Chest", "Eyes", "Feet", "Hands", "Head", "Headband", "Neck", "Ring1", "Ring2", "Shoulders", "Wrist"],
wornEquipBaseRowsNew = wornEquipBaseRowsOld.concat(["Armor3","Shield3"]),
wornEquipmentRowsNew = _.map(wornEquipBaseRowsNew,function(row){return 'worn-'+row;}),
wornEquipmentRowRollsNew = _.map(wornEquipBaseRowsNew,function(row){return 'worn-'+row+'-roll';}),
locationNames = ["Armor", "Belt", "Body", "Chest", "Eyes", "Feet", "Hands", "Head", "Headband", "Neck", "Ring1", "Ring2", "Shield", "Shoulders", "Wrist"],
wornEquipmentRowsPlusCarried=["Carried","NotCarried"].concat(locationNames),
locationMap = {'Carried':0,'NotCarried':1,'Armor':2,'Belt':3,'Body':4,'Chest':5,'Eyes':6,'Feet':7,'Hands':8,
    'Head':9,'Headband':10,'Neck':11,'Ring1':12,'Ring2':13,'Shield':14,'Shoulders':15,'Wrist':16},
equipMap = {'noEquipType':0,'Weapon':1,'Armor':2,'Ammo':3,'Consumables':4,'OtherMagic':5,'Gear':6,'Other':7,'Charged':8,'Other2':9},
groupMapForMenu = {0:'',1:'weapons',2:'armor-shield',3:'ammunition',4:'consumables',5:'other-magic-items',6:'gear-tool',7:'other-items',8:'charged-magics',9:'other-items-2'},
wornEquipmentColumns = ["charges", "weight", "hp", "hp_max", "value"],
wornLocTab = -1,
commonLinkedAttributes = ["attack-type", "range", "masterwork", "crit-target", "crit-multiplier", "damage-dice-num", "damage-die", "damage",
    "precision_dmg_macro", "precision_dmg_type", "critical_dmg_macro", "critical_dmg_type"],
defaultRepeatingMacro='&{template:pf_block} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block-item}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{name}}} {{hasuses=@{has_uses}}} {{qty=@{qty}}} {{qtymax=@{qty_max}}} {{shortdesc=@{short-description}}} {{description=@{description}}}',
defaultRepeatingMacroMap = {
    '&{template:':{'current':'pf_block}'},
    '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
    '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
    '{{color=':{'current':'@{rolltemplate_color}}}'},
    '{{header_image=':{'current':'@{header_image-pf_block-item}}}',old:['header_image-pf_block}}}']},
    '{{name=':{'current':'@{name}}}'},
    '{{character_name=':{'current':'@{character_name}}}'},
    '{{character_id=':{'current':'@{character_id}}}'},
    '{{subtitle}}':{'current':'{{subtitle}}'},
    '{{hasuses=':{'current':'@{has_uses}}}'},
    '{{qty=':{'current':'@{qty}}}'},
    '{{qty_max=':{'current':'@{qty_max}}}'},
    '{{shortdesc=':{'current':'@{short-description}}}'},
    '{{description=':{'current':'@{description}}}',old:['@{short-description}}}']}
},
defaultDeletedMacroAttrs=[];

export function migrateRepeatingMacros(callback){
    var done = _.once(function () {
        TAS.debug("leaving PFInventory.resetCommandMacro: ");
        if (typeof callback === "function") {
            callback();
        }
    }), 
    migrated = function(){
        setAttrs({'migrated_item_macrosv1':1},PFConst.silentParams, done);
    };
    getAttrs(['migrated_item_macrosv1'],function(v){
        if(!parseInt(v.migrated_item_macros,10)){
            PFMacros.migrateRepeatingMacros(migrated,'item','macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs);		
        } else {
            done();
        }
    });
}
/** resetCommandMacro sets command button macro with all rows from one ability list.
 * calls PFMenus.getRepeatingCommandMacro
 * sets the returned string to macro with attribute name: section+"_buttons_macro"
 *@param {function} callback  when done
 */
export function resetCommandMacro(callback){
    var done = _.once(function () {
        TAS.debug("leaving PFInventory.resetCommandMacro: ");
        if (typeof callback === "function") {
            callback();
        }
    }),
    doneOne=_.after(2,done);
    PFMenus.resetOneCommandMacro('item',true,doneOne,'',groupMapForMenu);
    PFMenus.resetOneCommandMacro('item',false,doneOne,'',groupMapForMenu);
}
/** Gets the worn item grid row name corresponding to location number in dropdown
 *@param {int} location a value from repeating_item_$X_location
 *@returns {string} name of "worn-space" to set
 */
function getWornItemNameField (location) {
    var wornSlot = "";
    if (location > 1 && wornEquipmentRowsPlusCarried[location]) {
        //TAS.debug("getWornItemNameField at location:" + wornEquipmentRowsPlusCarried[location]);
        if (location !== locationMap.Armor && location !== locationMap.Shield) {
            wornSlot = "worn-" + wornEquipmentRowsPlusCarried[location];
        } else if (location === locationMap.Armor) {
            wornSlot = "armor3";
        } else if (location === locationMap.Shield) {
            wornSlot = "shield3";
        }
    }
    return wornSlot;
}
/** updateRepeatingItems totals columns 
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
function updateRepeatingItems (callback, silently) {
    var done = _.once(function () {
        if (typeof callback === "function") {
            callback();
        }
    });
    try {
        //TAS.debug("at updateRepeatingItems");
        TAS.repeating('item').attrs('item_total_weight', 'item-total-hp', 'item-total-hp_max', 'item-total-value').fields('item-weight', 'qty', 'qty_max', 'location', 'item-hp', 'item-hp_max', 'value').reduce(function (m, r) {
            try {
                //TAS.debug("in weight add row, variables: weight: "+r.F['item-weight']+", qty:"+r.I.qty+", max:"+r.I.qty_max +", loc:"+ r.I.location);
                if (r.I.qty > 0 && (r.I.location !== locationMap.NotCarried)) {
                    if (r.I.qty_max === 0 || r.I.qty_max===1) {
                        m['item-weight'] += r.F['item-weight'] * r.I.qty;
                    } else {
                        m['item-weight'] += r.F['item-weight'];
                    }
                }
                m['item-hp'] += r.I['item-hp'];
                m['item-hp_max'] += r.I['item-hp_max'];
                m.value += r.I.value * r.I.qty;
            } catch (errinner) {
                TAS.error("PFInventory.updateRepeatingItems inner error", errinner);
            } finally {
                return m;
            }
        }, {
            'item-weight': 0,
            'item-hp': 0,
            'item-hp_max': 0,
            value: 0
        }, function (m, r, a) {
            a.S['item_total_weight'] = m['item-weight'];
            a.S['item-total-hp'] = m['item-hp'];
            a.S['item-total-hp_max'] = m['item-hp_max'];
            a.S['item-total-value'] = m.value;
        }).execute(done);
    } catch (err) {
        TAS.error("PFInventory.updateRepeatingItems", err);
        done();
    }
}
/** updateCarriedCurrency  totals weight for carried currency 
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
function updateCarriedCurrency  (callback, silently) {
    var done = function () {
        if (typeof callback === "function") {
            callback();
        }
    };
    getAttrs(["CP", "SP", "GP", "PP", "carried-currency"], function (v) {
        var curr = parseInt(v["carried-currency"], 10) || 0,
        params = {},
        carried = 0;
        try {
            carried = ((parseInt(v["CP"], 10) || 0) + (parseInt(v["SP"], 10) || 0) + (parseInt(v["GP"], 10) || 0) + (parseInt(v["PP"], 10) || 0)) / 50;
            //TAS.debug("curr=" + curr + ", carried=" + carried);
            if (curr !== carried) {
                if (silently) {
                    params = PFConst.silentParams;
                }
                setAttrs({
                    "carried-currency": carried
                }, params, done);
            } else {
                done();
            }
        } catch (err) {
            TAS.error("PFInventory.updateCarriedCurrency", err);
            done();
        }
    });
}
/** updateCarriedTotal- updates the total for carried weight
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
function updateCarriedTotal (callback, silently) {
    var done = function () {
        if (typeof callback === "function") {
            callback();
        }
    };
    getAttrs(["carried-currency", "item_total_weight", "carried-misc", "carried-total"], function (v) {
        var curr,
        carried,
        params = {};
        try {
            curr = parseFloat(v["carried-total"], 10) || 0;
            carried = ((parseFloat(v["carried-currency"], 10) || 0) * 100 + (parseFloat(v["item_total_weight"], 10) || 0) * 100 + (parseFloat(v["carried-misc"], 10) || 0) * 100) / 100; // Fix bad javascript math
            //TAS.debug("curr=" + curr + ", carried=" + carried);
            if (curr !== carried) {
                setAttrs({
                    "carried-total": carried
                }, params, done);
            } else {
                done();
            }
        } catch (err) {
            TAS.error("PFInventory.updateCarriedTotal", err);
            done();
        }
    });
}
/** Got rid of the Worn Equipment section, so migrate any values to the Equipment as repeating entries.
 * Worn Armor & Worn Shield are now disabled and controlled by the Equipment section in the Inventory tab.
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
function migrateWornEquipment (callback) {
    var done = _.once(function () {
        TAS.debug("leaving PFInventory.migrateWornEquipment");
        if (typeof callback === "function") {
            callback();
        }
    }),
    doneMigrating = _.once(function(){
        setAttrs({"migrated_worn_equipment": "1"}, {}, done);
    }),
    copyWornEquipmentToNewItem = function ( row, callback) {
        var done = _.once(function () {
            TAS.debug("leaving PFInventory.copyWornEquipmentToNewItem for "+row);
            if (typeof callback === "function") {
                callback();
            }
        }),
        attribList = ["worn-" + row];
        attribList.push("worn-" + row + "-description");
        attribList.push("worn-" + row + "-hardness");
        _.each(wornEquipmentColumns,function(col){
            attribList.push("worn-" + row + "-" + col);
        });
        getAttrs(attribList, function (v) {
            var newRowId = '',
            newRowAttrs = {},
            weightRowAttrs = {},
            attrib = "",
            newLocation = 0,
            newEquipType = equipMap.noEquipType;
            // Migrate the worn equipment entry to equipment if the name is populated
            try {
                TAS.debug("PFInventory.copyWornEquipmentToNewItem checking "+row+" it is:"+v["worn-" + row]);
                if (v["worn-" + row]) {
                    newRowId = generateRowID();
                    /* Assign defined worn equipment values to new repeating_item entry */
                    newRowAttrs["repeating_item_" + newRowId + "_name"] = v["worn-" + row];
                    newRowAttrs["repeating_item_" + newRowId + "_row_id"] = newRowId;
                    attrib = v["worn-" + row + "-description"];
                    if (attrib) {
                        newRowAttrs["repeating_item_" + newRowId + "_short-description"] = attrib;
                    }
                    attrib = v["worn-" + row + "-charges"];
                    if (attrib) {
                        newRowAttrs["repeating_item_" + newRowId + "_qty"] = attrib;
                        newRowAttrs["repeating_item_" + newRowId + "_qty_max"] = v["worn-" + row + "-charges_max"]||50;
                    } else {
                        weightRowAttrs["repeating_item_" + newRowId + "_qty"] = 1;
                        weightRowAttrs["repeating_item_" + newRowId + "_qty_max"] = 1;
                    }
                    attrib = v["worn-" + row + "-weight"];
                    if (attrib) {
                        weightRowAttrs["repeating_item_" + newRowId + "_item-weight"] = attrib;
                    }
                    attrib = v["worn-" + row + "-hardness"];
                    if (attrib) {
                        weightRowAttrs["repeating_item_" + newRowId + "_hardness"] = attrib;
                    }
                    attrib = v["worn-" + row + "-hp"];
                    if (attrib) {
                        weightRowAttrs["repeating_item_" + newRowId + "_item-hp"] = attrib;
                    }
                    attrib = v["worn-" + row + "-hp_max"];
                    if (attrib) {
                        newRowAttrs["repeating_item_" + newRowId + "_item-hp_max"] = attrib;
                    }
                    attrib = v["worn-" + row + "-value"];
                    if (attrib) {
                        weightRowAttrs["repeating_item_" + newRowId + "_value"] = attrib;
                    }
                    newRowAttrs["worn-" + row + "-roll"] = "@{repeating_item_" + newRowId + "_macro-text}";
                    // Location
                    newLocation = locationMap[row];
                    //wornEquipmentRowsPlusCarried.indexOf(row);
                    newRowAttrs["repeating_item_" + newRowId + "_location"] = newLocation;
                    newRowAttrs["repeating_item_" + newRowId + "_old_location"] = newLocation;
                    if (newLocation>locationMap.NotCarried) {
                        newRowAttrs["repeating_item_" + newRowId + "_loctype-tab"]=locationMap.Carried;
                    } else {
                        newRowAttrs["repeating_item_" + newRowId + "_loctype-tab"]=newLocation;
                    }
                    
                    newEquipType = equipMap.OtherMagic;
                    newRowAttrs["repeating_item_" + newRowId + "_equip-type"] = newEquipType;
                    newRowAttrs["repeating_item_" + newRowId + "_equiptype-tab"] = newEquipType;
                }
            } catch (err) {
                TAS.error("PFInventory.copyWornEquipmentToNewItem", err);
            } finally {
                //TAS.debug("PFInventory.migrateWornEquipment.copyWornEquipmentToNewItem setting:",newRowAttrs);
                if (_.size(newRowAttrs)>0){
                    setAttrs(newRowAttrs, PFConst.silentParams, done); 
                } else {
                    done();
                }
                //weight, hardness, qty are set non silently to trigger recalc
                if(_.size(weightRowAttrs)>0){
                    setAttrs(weightRowAttrs);
                }
            }
        });
    },
    // Migrate the armor & worn shield entries to equipment if the name is populated
    //item: value from PFDefense.defenseArmorShieldRowsOld
    copyWornDefenseToNewItem = function (item, wornAlreadySet, callback) {
        var done = _.once(function (wasSetToWorn) {
            TAS.debug("leaving PFInventory.copyWornDefenseToNewItem did we set worn for "+item+"?: "+wasSetToWorn);
            if (typeof callback === "function") {
                callback(wasSetToWorn);
            }
        }),
        attribList = [item, item + "-type"],
        defenseName = "",
        isArmor = 0,
        isShield = 0;

        //armor or shield?
        if ((/armor/i).test(item)) {
            isArmor = 1;
        } else if ((/shield/i).test(item)) {
            isShield = 1;
        } else {
            done(0);
            return;
        }
        // Search for pre-existing matching entry in equipment
        getAttrs([item], function (vi) {
            //TAS.debug("vi[item]=" + vi[item]);
            if (!vi[item]){
                done(0);
                return;
            }
            defenseName = vi[item];
            getSectionIDs("repeating_item", function (ids) {
                //TAS.debug("ids=" + ids);
                var fields = [];
                fields = _.map(ids, function (id) {
                    return "repeating_item_" + id + "_name";
                });
                _.each(PFDefense.defenseArmorShieldColumns, function (column) {
                    attribList.push(item + "-" + column);
                });
                attribList = attribList.concat(fields);
                //TAS.debug("copyWornDefenseToNewItem attribList=" + attribList);
                getAttrs(attribList, function (v) {
                    var prefix, matchingField, newRowId = '', newRowAttrs = {}, locationAttrs={},  maxDex=0, attrib = "", isNewRow = true, markedEquipped=0, isWorn=0;
                    try {							
                        //TAS.debug("PFInventory.copyWornDefenseToNewItem item:"+item+" was already set="+wornAlreadySet,v);
                        markedEquipped=parseInt(v[item + "-equipped"],10)||0;
                        maxDex = parseInt(v[item+"-max-dex"],10);
                        if(isNaN(maxDex)){
                            maxDex=99;
                        }
                        matchingField = _.find(fields, function (field) { return defenseName === v[field]; });
                        //TAS.debug("matchingField=" + matchingField);
                        if (matchingField) {
                            isNewRow = false;
                            newRowId = SWUtils.getRowId(matchingField);//.replace("repeating_item_", "").replace("_name", "");
                        } else {
                            newRowId = generateRowID();
                        }
                        newRowAttrs["repeating_item_" + newRowId + "_equip-type"] = equipMap.Armor;
                        newRowAttrs["repeating_item_" + newRowId + "_equiptype-tab"] = equipMap.Armor;
                        /* Assign defined worn equipment values to new repeating_item entry */
                        if (isNewRow) {
                            newRowAttrs["repeating_item_" + newRowId + "_name"] = defenseName;
                        }
                        newRowAttrs["repeating_item_" + newRowId + "_qty"] = 1;
                        newRowAttrs["repeating_item_" + newRowId + "_qty_max"] = 1;
                        if (!wornAlreadySet &&  markedEquipped=== 1) {
                            isWorn=1;
                            if (isArmor) {
                                if(isNewRow){
                                    newRowAttrs["repeating_item_" + newRowId + "_location"] = locationMap.Armor;
                                    newRowAttrs["repeating_item_" + newRowId + "_old_location"] = locationMap.Armor;
                                } else {
                                    locationAttrs["repeating_item_" + newRowId + "_location"] = locationMap.Armor;
                                }
                                newRowAttrs["repeating_item_" + newRowId + "_loctype-tab"] = locationMap.Carried;
                                newRowAttrs["armor3-roll"] = "@{repeating_item_" + newRowId + "_macro-text}";
                                newRowAttrs["armor3"] = v[item];
                            } else {
                                if(isNewRow){
                                    newRowAttrs["repeating_item_" + newRowId + "_location"] = locationMap.Shield;
                                    newRowAttrs["repeating_item_" + newRowId + "_old_location"] = locationMap.Shield;
                                } else {
                                    locationAttrs["repeating_item_" + newRowId + "_location"] = locationMap.Shield;
                                }
                                newRowAttrs["repeating_item_" + newRowId + "_loctype-tab"] = locationMap.Carried;
                                newRowAttrs["shield3-roll"] = "@{repeating_item_" + newRowId + "_macro-text}";
                                newRowAttrs["shield3"] = v[item];
                            }
                            //set to blank
                            if (maxDex>50){
                                newRowAttrs[item+"-max-dex"]="-";
                            }
                        } else {
                            //do not need to put in locationAttrs since we set it something last time we came through for other row
                            newRowAttrs["repeating_item_" + newRowId + "_location"] = locationMap.NotCarried; // not Carried
                            newRowAttrs["repeating_item_" + newRowId + "_old_location"] = locationMap.NotCarried;
                            newRowAttrs["repeating_item_" + newRowId + "_loctype-tab"] = locationMap.NotCarried;
                            
                            //ensure it is not marked equipped
                            if(markedEquipped){
                                newRowAttrs[item + "-equipped"]=0;
                            }
                            // Leave the entry there. The player can manage the entry from inventory and equip it on Defenses tab
                        }
                        //do not set type, max-dex, or equipped, but do all other columns:
                        _.each(["acbonus", "enhance", "acp", "spell-fail", "proficiency"],function(col){
                            attrib = v[item + "-" + col];
                            if (attrib) {
                                newRowAttrs["repeating_item_" + newRowId + "_item-" + col] = attrib;
                            }
                        });
                        
                        if (maxDex> 50){
                            newRowAttrs["repeating_item_" + newRowId + "_item-max-dex"]="-";
                        } else {
                            newRowAttrs["repeating_item_" + newRowId + "_item-max-dex"]=maxDex;
                        }
                        
                        attrib = v[item + "-type"];
                        if (attrib) {
                            newRowAttrs["repeating_item_" + newRowId + "_item-defense-type"] = attrib;
                        }
                    } catch (err) {
                        TAS.error("PFInventory.copyWornDefenseToNewItem", err);
                    } finally {
                        if (_.size(newRowAttrs)>0){
                            //TAS.debug("PFInventory.copyWornDefenseToNewItem item:"+item+",setting:",newRowAttrs);
                            setAttrs(newRowAttrs,PFConst.silentParams, function(){
                                if(_.size(locationAttrs)>0){
                                    setAttrs(locationAttrs,{},function(){done(isWorn);});
                                } else {
                                    done(isWorn);
                                }
                            });
                        } else {
                            done(false);
                        }
                    }
                });
            });
        });
    };
    //TAS.debug("############","at PFInventory.migrateWornEquipment");
    getAttrs(["migrated_worn_equipment"], function (v) {
        var foundWornArmor=false,
        foundWornShield=false,
        doneAll =_.after(2,function(){
            //TAS.debug("#### PFInventory.migrateWornEquipment.doneAll 2");
            doneMigrating();
        }),
        migrateDefenses = function(){
            TAS.debug("checking armor3");
            copyWornDefenseToNewItem('armor3',foundWornArmor,function(wasSet){
                foundWornArmor=foundWornArmor||wasSet;
                TAS.debug("checking armor2, found="+foundWornArmor);
                copyWornDefenseToNewItem('armor2',foundWornArmor,function(wasSet){
                    foundWornArmor=foundWornArmor||wasSet;
                    TAS.debug("checking armor0, found="+foundWornArmor);
                    copyWornDefenseToNewItem('armor',foundWornArmor,doneAll);
                });
            });
            TAS.debug("checking shield3");
            copyWornDefenseToNewItem('shield3',foundWornShield,function(wasSet){
                foundWornShield=foundWornShield||wasSet;
                TAS.debug("checking shield2, found="+foundWornShield);
                copyWornDefenseToNewItem('shield2',foundWornShield,function(wasSet){
                    foundWornShield=foundWornShield||wasSet;
                    TAS.debug("checking shield0, found="+foundWornShield);
                    copyWornDefenseToNewItem('shield',foundWornShield,doneAll);
                });
            });
        },
        doneWornRows = _.after(_.size(wornEquipBaseRowsOld),function(){
            var wornRows,fieldsToClear,setter;
            try {
                wornRows = _.map(wornEquipBaseRowsOld,function(field){ return 'worn-'+field+'-';});
                fieldsToClear = SWUtils.cartesianAppend(wornRows,['charges','weight','hp','hp_max','value','description','hardness']);
                setter = _.reduce(fieldsToClear,function(m,f){m[f]='';return m;},{});
                setAttrs(setter,PFConst.silentParams,migrateDefenses);
            } catch (err){
                TAS.error("PFInventory.migrateWornEquipment.doneWornRows err:",err);
                migrateDefenses();
            }
        });
        try {
            //TAS.debug("PFInventory.migrateWornEquipment flag is ",v," and there are "+_.size(wornEquipBaseRowsOld)+" rows of worn equip");
            if (parseInt(v["migrated_worn_equipment"],10) === 1) {
                TAS.debug("##########","ALREADY MIGRATED WORN EQUIPMENT");
                done();
                return;
            }
            //do worn equipment rows before armor, because sometimes they have armor in a slot.
            _.each(wornEquipBaseRowsOld,function(row){
                copyWornEquipmentToNewItem(row,doneWornRows);
            });
        } catch (err) {
            TAS.error("PFInventory.migrateWornEquipment", err);
            migrateDefenses();
        }
    });
}
/** set old location to the new location, and unset other items set to this location, also updates loctype-tab
 *@param {string} id id of row updated, or null
 *@param {function} callback to call when done
 *@param {boolean} silently if true call setAttrs with {silent:true}
 *@param {object} eventInfo USED - from event, to get id from sourceAttribute
 */
function updateEquipmentLocation (id, callback, silently, eventInfo) {
    var done = _.once(function () {
        //TAS.debug("leaving PFInventory.updateEquipmentLocation for id "+id);
        if (typeof callback === "function") {
            callback();
        }
    }),
    /* unsetOtherItems makes sure any other row than id is not in location */
    unsetOtherItems = function (location, id) {
        if (!id || location < 2 || !location) {
            done();
            return;
        }
        /*
        * The player has now changed the location to a worn slot, so check for other repeating items that have the same
        * slot and set them to 'carried'.
        */
        getSectionIDs("repeating_item", function (idarray) { // get the repeating set
            var attribs = [];
            if (_.size(idarray) <= 1) {
                done();
                return;
            }
            _.each(idarray, function (currentID, i) { // loop through the set
                if (currentID !== id) {
                    attribs.push("repeating_item_" + currentID + "_location");
                }
            });
            getAttrs(attribs, function (w) {
                var setter = {};
                _.each(idarray, function (currentID, i) { // loop through the set
                    if ((parseInt(w["repeating_item_" + currentID + "_location"], 10) || 0) === location) {
                        setter["repeating_item_" + currentID + "_location"] = 0;
                        setter["repeating_item_" + currentID + "_old_location"] = 0;
                    }
                    
                });
                if (_.size(setter) > 0) {
                    setAttrs(setter, { silent: true }, done);
                } else {
                    done();
                }
            });
        });
    },
    idStr = SWUtils.getRepeatingIDStr(id),
    item_entry = 'repeating_item_' + idStr,
    realItemID = id || (eventInfo ? (SWUtils.getRowId(eventInfo.sourceAttribute) || "") : ""),
    prefix = 'repeating_item_' + realItemID + "_",
    locationField = prefix + "location",
    locationTabField = prefix + "loctype-tab",
    nameField = prefix + "name",
    oldLocationField = prefix + "old_location",
    rollField = prefix + "macro-text"
    ;
    try {
        //TAS.debug("updateEquipmentLocation: called for ID "+ realItemID);
        //sample source: repeating_item_-kbkc95wvqw1n4rbgs1c_location
        // note that the source is always lowercase, but the actual ID is both cases
        //check value of 'location' to see if it is being worn; if not check to see if the player is removing it from 'worn'
        //TAS.debug("updateEquipmentLocation source=" + source);
        getAttrs([locationField, oldLocationField, nameField, locationTabField], function (v) {
            var location = 0,
                oldlocation = 0,
                wornItemAttrs = {},
                wornSlot = "",
                itemName = "";
            //TAS.debug("updateEquipmentLocation: ", v);
            try {
                location = parseInt(v[locationField], 10);
                if (isNaN(location)){
                    TAS.debug("why is location not set!?");
                    location = locationMap.NotCarried;
                    wornItemAttrs[locationField]=location;
                }
                if (location>locationMap.NotCarried) {
                    wornItemAttrs[locationTabField]=locationMap.Carried;
                } else {
                    wornItemAttrs[locationTabField]=location;
                }

                oldlocation = parseInt(v[oldLocationField], 10) ;
                if (isNaN(oldlocation)){
                    oldlocation=location;
                }
                wornItemAttrs[oldLocationField] = location;
                if (location ===  locationMap.Carried && oldlocation !== locationMap.NotCarried && oldlocation !== location) { 
                    wornSlot = getWornItemNameField(oldlocation);
                    if (wornSlot) {
                        wornItemAttrs[wornSlot] = "";
                        wornItemAttrs[wornSlot + "-roll"] = "";
                    }
                } else if (location > locationMap.NotCarried) {
                    wornSlot = getWornItemNameField(location);
                    if (wornSlot) {
                        itemName = v[nameField] || "";
                        if (itemName){
                            wornItemAttrs[wornSlot] = itemName;
                        } else {
                            wornItemAttrs[wornSlot] = "Row "+ realItemID;
                        }
                        wornItemAttrs[wornSlot + "-roll"] = "@{" + rollField + "}";
                    }
                    if (oldlocation > 1 && oldlocation !== location) {
                        wornSlot = getWornItemNameField(oldlocation);
                        if (wornSlot) {
                            wornItemAttrs[wornSlot] = "";
                            wornItemAttrs[wornSlot + "-roll"] = "";
                        }
                    }
                }
            } catch (err2) {
                TAS.error("updateEquipmentLocation update location error:", err2);
            } finally {
                if (_.size(wornItemAttrs) > 0) {
                    //TAS.debug("updateEquipmentLocation, setting slot ", wornItemAttrs);
                    setAttrs(wornItemAttrs, PFConst.silentParams, function () {
                        if (location > locationMap.NotCarried){
                            unsetOtherItems(location, realItemID);
                        }
                        done();
                    });
                } else {
                    done();
                }
            }
        });
    } catch (err) {
        TAS.error("PFInventory.updateEquipmentLocation", err);
        done();
    }
}
/** replace the values on the Defenses tab in disabled fields with this row's values
 * from the equipment. Some fields like Armor Bonus, ACP, and Max Dex are not available in the equipment, so they
 * will need to be edited manually after making this change.
 *@param {int} location the value of location attribute in repeating_item
 *@param {string} sourceAttribute eventInfo sourceAttribute of change user made that called this
 *@param {function} callback call when done
 */
function updateWornArmorAndShield  (location, sourceAttribute, callback) {
    var done = _.once(function () {
        TAS.debug("leaving PFInventory.updateWornArmorAndShield");
        if (typeof callback === "function") {
            callback();
        }
    }),
    defenseItem = "",
    attribUpdated = "",
    itemFullPrefix = "",
    attribList = [],
    id ="",
    item_entry="",
    itemFields = ["item-acbonus","item-acenhance","item-max-dex","item-acp","item-spell-fail","item-defense-type","item-proficiency",
        "name","set-as-armor","set-as-shield","location","old_location","equip-type","acenhance"];
    try {
        attribUpdated = SWUtils.getAttributeName(sourceAttribute);
        id = SWUtils.getRowId(sourceAttribute);
        item_entry = "repeating_item_" + id + "_";
        if (item_entry.slice(-1) !== "_") {
            item_entry += "_";
        }
        itemFullPrefix = item_entry + "item-";
        defenseItem = (location === locationMap.Armor ? "armor3" : "shield3");
        //TAS.debug"at update worn armor, defenseItem=" + defenseItem);
        attribList =_.map(itemFields,function(attr){
            return item_entry + attr;
        });
        attribList = _.reduce(PFDefense.defenseArmorShieldColumns, function (memo, col) {
            memo.push(defenseItem + "-" + col);
            return memo;
        }, attribList);
        attribList.push(defenseItem);
        //TAS.debug("PFInventory.updateWornArmorAndShield fields ", attribList);
    } catch (err) {
        TAS.error("PFInventory.updateWornArmorAndShield error before getattrs", err);
        done();
        return;
    }
    //TAS.debug("attribList=" + attribList);
    getAttrs(attribList, function (w) {
        var i=0, setter={}, silentSetter={}, equipType=0,actualLocation=0, attrib="";
        try {
            //if we are setting new, or updating an item in the location, or updating an item in a diffrent location
            //so we can set a new ring of shield, but not update it. but we can update armor and shields.
            if (attribUpdated==='set-as-armor' || attribUpdated==='set-as-shield' || location === locationMap.Armor || location === locationMap.Shield  ) {
                //TAS.debug("updateWornArmorAndShield ", w);
                for (i = 0; i < PFDefense.defenseArmorShieldColumns.length; i++) {
                    if (PFDefense.defenseArmorShieldColumns[i] !== "max-dex" &&
                            PFDefense.defenseArmorShieldColumns[i] !== "equipped" &&
                            PFDefense.defenseArmorShieldColumns[i] !== "type" && 
                            PFDefense.defenseArmorShieldColumns[i] !== "enhance" ) {
                        attrib = parseInt(w[itemFullPrefix + PFDefense.defenseArmorShieldColumns[i]], 10) || 0;
                        if (parseInt(w[defenseItem + "-" + PFDefense.defenseArmorShieldColumns[i]], 10) !== attrib) {
                            setter[defenseItem + "-" + PFDefense.defenseArmorShieldColumns[i]] = attrib;
                        }
                    }
                }
                attrib = w[item_entry + "name"];
                if (attrib) {
                    if (w[defenseItem] !== attrib) {
                        setter[defenseItem] = attrib;
                    }
                } else {
                    setter[defenseItem] = "";
                }
                attrib = w[itemFullPrefix + "acenhance"];
                if (attrib){
                    setter[defenseItem + "-enhance"] = attrib;
                }
                attrib = w[itemFullPrefix + "defense-type"];
                if (attrib) {
                    if (defenseItem === "shield3" && attrib === "Medium") {
                        //invalid choice, prob meant heavy shield
                        attrib = "Heavy";
                    } else if (defenseItem === "armor3" && attrib === "Tower Shield") {
                        //invalid
                        attrib = "Heavy";
                    }
                    if (w[defenseItem + "-type"] !== attrib) {
                        setter[defenseItem + "-type"] = attrib;
                    }
                }
                attrib = parseInt(w[itemFullPrefix + "max-dex"], 10);
                if (w[itemFullPrefix + "max-dex"] === "-" || isNaN(attrib)) {
                    setter[defenseItem + "-max-dex"] = "-";
                } else {
                    setter[defenseItem + "-max-dex"] = attrib;
                }
                if (w[defenseItem + "-equipped"] !== "1") {
                    setter[defenseItem + "-equipped"] = 1;
                }
                //reset the buttons silently so we don't loop.
                attrib = parseInt(w[item_entry + "set-as-armor"], 10);
                if (attrib) {
                    silentSetter[item_entry + "set-as-armor"] = "0";
                }
                attrib = parseInt(w[item_entry + "set-as-shield"], 10);
                if (attrib) {
                    silentSetter[item_entry + "set-as-shield"] = "0";
                }
                //if we hit "set as armor or shield" on a peice of armor / shield equipment, make sure to slot it.
                //do it silently so we don't loop 
                equipType = parseInt(w[item_entry + "equip-type"],10);
                actualLocation= parseInt(w[item_entry+"location"],10);
                if ((!isNaN(equipType)) && actualLocation!== locationMap.Armor && actualLocation !== locationMap.Shield && equipType === equipMap.Armor && 
                    (attribUpdated==='set-as-armor' || attribUpdated==='set-as-shield')  ){
                        silentSetter[item_entry + "old_location"] = actualLocation;
                        silentSetter[item_entry+"location"] = location;
                }
            } else {
                TAS.warning("no reason to update armor or shield for " + sourceAttribute + " in location " + wornEquipmentRowsPlusCarried[location]);
            }
        } catch (errinner) {
            TAS.error("PFInventory.updateWornArmorAndShield INNER error", errinner);
        } finally {
            if (_.size(silentSetter)>0){
                setAttrs(silentSetter,PFConst.silentParams,function(){
                    if (actualLocation !== location){
                        updateEquipmentLocation(id,null,true,null);
                    }
                });
            }
            if (_.size(setter) > 0) {
                //TAS.debug("updating defenses tab for " + defenseItem, setter);
                setAttrs(setter, {}, done);
            } else {
                done();
            }
        }
    });
}
/**  calls updateEquipmentLocation for all items
can be refactored to be faster to do all at once
 */
function updateLocations (callback){
    var done = _.once(function(){
        TAS.debug("Leaving PFInventory.updateLocations");
        if (typeof callback === "function"){
            callback();
        }
    });
    getSectionIDs('repeating_item',function(ids){
        var total=0, doneOne;
        try{
            if (!(ids && _.size(ids))){
                done();
                return;
            }
            total = _.size(ids);
            TAS.debug("PFInventory.updateLocations there are "+total+" rows in items");
            doneOne = _.after(total,done);
            _.each(ids,function(id){
                updateEquipmentLocation(id,doneOne,null,null);
            });
        } catch (err){
            TAS.error("PFInventory.updateLocations",err);
            done();
        }
    });
}
/** Triggered from a button in repeating_items, it will create a repeating attack entry from the item entry
 * @param {string} source the eventItem.sourceAttribute
 * @param {string} weaponId if the row already exists, overwrite all fields but 'name'
 */
export function createAttackEntryFromRow (source, callback, silently, weaponId) {
    var done = _.once(function () {
        //TAS.debug("leaving PFInventory.createAttackEntryFromRow");
        if (typeof callback === "function") {
            callback();
        }
    }),
    attribList = [],
    itemId = SWUtils.getRowId(source),
    idStr = SWUtils.getRepeatingIDStr(itemId),
    item_entry = 'repeating_item_' + idStr;

    //TAS.debug("PFInventory.createAttackEntryFromRow: item_entry=" + item_entry + " , weapon:"+weaponId);
    attribList.push(item_entry + "name");
    commonLinkedAttributes.forEach(function (attr) {
        attribList.push(item_entry + "item-" + attr);
    });
    attribList.push(item_entry + "item-wpenhance");
    attribList.push(item_entry + "item-dmg-type");
    attribList.push(item_entry + "default_size");
    //TAS.debug("attribList=" + attribList);
    getAttrs(attribList, function (v) {
        var newRowId,
        setter = {},
        silentSetter={},
        enhance = 0,
        prof = 0,
        params = silently?PFUtils.silentParams:{};
        try {
            //TAS.debug("weaponId is :"+weaponId);
            if (!weaponId){
                newRowId = generateRowID();
            } else {
                newRowId = weaponId;
            }
            //TAS.debug("the new row id is: "+newRowId);
            //TAS.debug("v[" + item_entry + "name]=" + v[item_entry + "name"]);
            if (v[item_entry + "name"]) {
                if (!weaponId){
                    setter["repeating_weapon_" + newRowId + "_name"] = v[item_entry + "name"];
                }
                silentSetter["repeating_weapon_" + newRowId + "_source-item-name"] = v[item_entry + "name"];
            }
            commonLinkedAttributes.forEach(function (attr) {
                //TAS.debug("v[" + item_entry + "item-" + attr + "]=" + v[item_entry + "item-" + attr]);
                if (v[item_entry + "item-" + attr]) {
                    setter["repeating_weapon_" + newRowId + "_" + attr] = v[item_entry + "item-" + attr];
                }
            });
            if ( (/melee/i).test(v[item_entry + "item-attack_type"])) {
                setter["repeating_weapon_" + newRowId + "_damage-ability"] = "@{STR-mod}";
            }
            enhance = parseInt(v[item_entry + "item-wpenhance"],10)||0;
            if(enhance){
                setter["repeating_weapon_" + newRowId + "_enhance"] = enhance;
            }
            //TAS.debug("v[" + item_entry + "item-defense-type]=" + v[item_entry + "item-defense-type"]);
            if (v[item_entry + "item-dmg-type"]) {
                setter["repeating_weapon_" + newRowId + "_type"] = v[item_entry + "item-dmg-type"];
            }
            //TAS.debug("v[" + item_entry + "item-proficiency]=" + v[item_entry + "item-proficiency"]);
            prof = parseInt(v[item_entry + "item-proficiency"], 10) || 0;
            if (prof !== 0) {
                prof = -4;
                setter["repeating_weapon_" + newRowId + "_proficiency"] = prof;
            }
            if (v[item_entry + "default_size"]) {
                setter["repeating_weapon_" + newRowId + "_default_size"] = v[item_entry + "default_size"];
            }
            setter["repeating_weapon_" + newRowId + "_default_damage-dice-num"] = v[item_entry + "damage-dice-num"]||0;
            setter["repeating_weapon_" + newRowId + "_default_damage-die"] = v[item_entry + "damage-die"]||0;
            silentSetter["repeating_weapon_" + newRowId + "_source-item"] = itemId;
            //TAS.debug("creating new attack", setter);
        } catch (err) {
            TAS.error("PFInventory.createAttackEntryFromRow", err);
        } finally {
            if (_.size(setter)>0){
                setter[item_entry + "create-attack-entry"] = 0;
                setAttrs(setter, params, function(){
                    //can do these in parallel
                    PFAttackOptions.resetOption(newRowId);
                    PFAttackGrid.resetCommandMacro();
                    done();
                });
                if (_.size(silentSetter)){
                    setAttrs(silentSetter,PFConst.silentParams);
                }
            } else {
                setter[item_entry + "create-attack-entry"] = 0;
                setAttrs(setter,PFConst.silentParams,done);
            }
        }
    });
}
export function updateAssociatedAttack (source, callback) {
    var done = _.once(function () {
        TAS.debug("leaving PFInventory.updateAssociatedAttack");
        if (typeof callback === "function") {
            callback();
        }
    }),
    attrib = "", weaponAttrib = "", sourceVal = "", itemId = "", sectionName = "",
    fields = [], setter = {}, attribList = [];
    try {
        if (!source) {
            done();
            return;
        }
        itemId = SWUtils.getRowId(source);
        attrib = SWUtils.getAttributeName(source);
        //TAS.debug("attrib=" + attrib);
        if (source.indexOf("repeating_weapon_") === 0) {
            // source is an attack, so pull all data from the source (item/spell/spell-like ability) to update the attack
            // attrib will be source-item, source-spell, or source-ability
            TAS.error("PFInventory.updateAssociatedAttack, called on weapon event, no longer supported!");
            done();
            return;
        }
        // source is an item, so update all linked attacks with the changed attribute
        weaponAttrib = attrib.replace("item-", "");
        if (attrib === 'name') { weaponAttrib = 'source-item-name'; }
        else if (attrib === 'item-dmg-type') { weaponAttrib = 'type'; }
        else if (attrib === 'wpenhance') {weaponAttrib = 'enhance'; }
    } catch (outererror1) {
        TAS.error("PFInventory.updateAssociatedAttack outer1", outererror1);
        done();
        return;
    }
    getAttrs([source], function (srcv) {
        var sourceAttr='';
        sourceVal = srcv[source];
        if (typeof sourceVal === "undefined"){
            sourceVal = "";
        }
        //TAS.debug"sourceVal=" + sourceVal);
        if (attrib === "proficiency") {
            sourceVal = parseInt(sourceVal, 10) || 0;
            if (sourceVal !== 0) {
                sourceVal = -4;
            }
        }
        sourceVal = String(sourceVal);
        //TAS.debug("itemId=" + itemId, "attrib=" + attrib, "weaponAttrib=" + weaponAttrib);
        getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
            fields = _.reduce(idarray, function (memo, currentID) {
                memo = memo.concat(["repeating_weapon_" + currentID + "_source-item", "repeating_weapon_" + currentID + "_" + weaponAttrib]);
                return memo;
            }, []);
            //TAS.debug("processing currentID=" + currentID);
            getAttrs(fields, function (w) {
                setter = {}; // start with a blank in this loop
                try {
                    //TAS.debug"PFInventory.updateAssociatedAttack ", w);
                    _.each(idarray, function (currentID) { // loop through the set
                        var targetVal = "", wField = ""; // start with blank in this loop
                        //TAS.debug("source=" + source, "v[repeating_weapon_" + currentID + "_source-item]=" + v["repeating_weapon_" + currentID + "_source-item"]);
                        //TAS.debug("itemId=" + itemId)
                        //TAS.debug"comparing " + itemId + " with " + w["repeating_weapon_" + currentID + "_source-item"]);
                        if (itemId === w["repeating_weapon_" + currentID + "_source-item"]) {
                            wField = "repeating_weapon_" + currentID + "_" + weaponAttrib;
                            targetVal = w[wField];
                            if (attrib === "proficiency" ) {
                                targetVal = parseInt(targetVal, 10) || 0;
                            }
                            targetVal= String(targetVal);
                            if (targetVal !== sourceVal) {
                                setter[wField] = sourceVal;
                                if (sourceAttr === 'damage-die' || sourceAttr === 'damage-dice-num'){
                                    setter["repeating_weapon_" + currentID + "_default_"+ sourceAttr]=sourceVal; 
                                }
                            }
                        }
                    });
                } catch (innererror) {
                    TAS.error("PFInventory.updateAssociatedAttack inner1", innererror);
                } finally {
                    if (_.size(setter) > 0) {
                        //TAS.debug"updating attack", setter);
                        setAttrs(setter);
                    }
                }
            });
        });
    });
}
/** Determines the equipment type from looking at the name. 
 * DOES NOT WORK for armor or weapons, this is for after you have already determined it is not an armor or weapon type.
 *@param {string} name the name field 
 */
export function getEquipmentTypeFromName (name){
    var tempstr, currType=equipMap.noEquipType, matches;
    if(!name){return currType;}
    tempstr=name.toLowerCase();
    matches=tempstr.match(/(?:\bwand\b|\bring\b|\brod\b|plate|sword|shield|mail|spear|potion|spellbook|smokestick|incense|scroll|alchemist|antitoxin|antidote|elixir|staff|acid|\boil\b|water|component pouch|arrow|bolt|bullet|sunrod|flask|ration|armor spike|kit|saddle|tool|spike|pole|ladder|lantern|candle|torch|rope|chain|crowbar|\bnet\b|\bram\b|tanglefoot|tinder|flint|vial)/i);
    if (matches){
        switch (matches[0]){
            case 'sword':
            case 'spear':
            case 'armor spike':
            case 'net':
                currType=equipMap.Weapon;
                break;
            case 'mail':
            case 'plate':
            case 'shield':
                currType=equipMap.Armor;
                break;
            case 'vial':
            case 'flint':
            case 'kit':
            case 'tool':
            case 'spike':
            case 'crowbar':
            case 'ram':
            case 'lantern':
            case 'candle':
            case 'torch':
            case 'rope':
            case 'chain':
            case 'saddle':
            case 'spyglass':
            case 'spellbook':
            case 'tinder':
            case 'component pouch':
                currType=equipMap.Gear;
                break;
            case 'ring':
                currType=equipMap.OtherMagic;
                break;
            case 'rod':
            case 'wand':
            case 'staff':
                currType=equipMap.Charged;
                break;
            case 'tanglefoot':
            case 'incense':
            case 'smokestick':
            case 'sunrod':
            case 'ration':
            case 'water':
            case 'alchemist':
            case 'oil':
            case 'flask':
            case 'acid':
            case 'potion':
            case 'elixir':
            case 'scroll':
            case 'antitoxin':
            case 'antidote':
                currType=equipMap.Consumables;
                break;
            case 'arrow':
            case 'bolt':
            case 'bullet':
            case 'stone':
                currType=equipMap.Ammo;
                break;
        }
    }
    return currType;
}
export function importFromCompendium (eventInfo){
    var id=SWUtils.getRowId(eventInfo.sourceAttribute),
    prefix='repeating_item_'+id+'_',
    itemprefix = prefix+'item-',
    fields=['default_char_size','equipment_tab',
        itemprefix+'category_compendium',
        itemprefix+'value_compendium',
        itemprefix+'range_compendium',
        itemprefix+'critical_compendium',
        itemprefix+'smalldamage_compendium',
        itemprefix+'meddamage_compendium',
        itemprefix+'specialtype_compendium',
        itemprefix+'speed20_compendium',
        itemprefix+'speed30_compendium',
        itemprefix+'weight_compendium',
        itemprefix+'spell-fail_compendium',
        itemprefix+'acbonus_compendium',
        itemprefix+'acp_compendium',
        itemprefix+'dmg-type',
        prefix+'description',
        itemprefix+'max-dex',
        prefix+'name'];
    //TAS.debug('at importFromCompendium getting fields', fields);
    getAttrs(fields,function(v){
        var setter={},size=0,tempInt=0,temp,name,matches,attr='',tempstr='',
            isWeapon=0,isArmor=0,isOther=0,currTab=99,currType=equipMap.noEquipType,
            speed30=0,speed20=0;
        try {
            //TAS.debug("importFromCompendium values are",v);
            if (v[itemprefix+'category_compendium']!=='Items'){
                TAS.warn("compendium item is " +v['repeating_item_item-category_compendium'] + ', INVALID' );
                return;
            }
            setter[prefix+'row_id']=id;
            name= v[prefix+'name'];
            PFUtils.getCompendiumIntSet(itemprefix,'range',v,setter);
            PFUtils.getCompendiumFunctionSet(itemprefix,'value',PFUtils.getCostInGP,v,setter);
            PFUtils.getCompendiumIntSet(itemprefix,'spell-fail',v,setter);
            PFUtils.getCompendiumIntSet(itemprefix,'acbonus',v,setter);
            PFUtils.getCompendiumIntSet(itemprefix,'acp',v,setter);
            if(v[itemprefix+'acbonus_compendium']){
                isArmor=1;
            }
            
            speed30 = parseInt(v[itemprefix+'speed20_compendium'],10)||0;
            speed20 = parseInt(v[itemprefix+'speed30_compendium'],10)||0;
            
            if (v[itemprefix+'max-dex']){
                temp=v[itemprefix+'max-dex'];
                temp=temp.replace(/\u2013|\u2014|-|\\u2013|\\u2014/,'-');
                if (temp!==v[itemprefix+'max-dex']){
                    setter[itemprefix+'max-dex']=temp;
                }
            }
            if (v[itemprefix+'specialtype_compendium']){
                temp = v[itemprefix+'specialtype_compendium'];
                temp=temp.replace(/\u2013|\u2014|-|\\u2013|\\u2014/,'');
                if (temp){
                    if(v[itemprefix+'item-dmg-type']){
                        temp = v[itemprefix+'item-dmg-type'] + ' ' + v[itemprefix+'specialtype_compendium'];
                    } else {
                        temp = v[itemprefix+'specialtype_compendium'];
                    }
                    setter[itemprefix+'item-dmg-type']=temp;
                }
            }
            if(v[itemprefix+'critical_compendium']){
                isWeapon=1;
                temp = PFUtils.getCritFromString(v[itemprefix+'critical_compendium']);
                if(temp){
                    if(temp.crit!==20){
                        setter[itemprefix+'crit-target']=temp.crit;
                    }
                    if(temp.critmult!==2){
                        setter[itemprefix+'crit-multiplier']=temp.critmult;
                    }
                }
            }
            size=parseInt(v['default_char_size'],10)||0;
            tempstr='meddamage_compendium';
            tempInt=0;
            if (size>=1){
                tempInt=1;
                tempstr='smalldamage_compendium';
            }
            if (size !== 0){
                //set  default size of item to small or medium, not other, let user do that for now
                setter[prefix+'default_size']=tempInt;
            }
            PFUtils.getCompendiumIntSet(itemprefix,'weight',v,setter);
            //small size, weight is 1/2
            if(size >= 1){
                tempInt=parseInt(setter[itemprefix+'weight'],10)||0;
                if (tempInt){
                    tempInt = (tempInt / 2)*100/100;
                    setter[itemprefix+'weight']=tempInt;
                }
            } 
            if (v[itemprefix+tempstr]){
                isWeapon=1;
                temp = PFUtils.getDiceDieFromString(v[itemprefix+tempstr]);
                if (temp){
                    if (temp.dice && temp.die){
                        setter[itemprefix+'damage-dice-num']=temp.dice;
                        setter[itemprefix+'damage-die']=temp.die;
                    }
                    if (temp.plus){
                        setter[itemprefix+'damage']=temp.plus;
                    }
                }
            }

            if (isWeapon){
                currType=equipMap.Weapon;
                if(v[itemprefix+'range_compendium']&& parseInt(v[itemprefix+'range_compendium'],10)>0){
                    setter[itemprefix+'attack-type']='@{attk-ranged}';
                } else {
                    setter[itemprefix+'attack-type']='@{attk-melee}';
                }
            } else if (isArmor){
                currType=equipMap.Armor;
                //set encumbrance 
                //mUST LOOK AT name string and determine armor, then set heavy, medium, or light.
                //for shields it is easy
                //we can probably look at the change in speed to determine this.
                if (name) {
                    if ((/tower/i).test(name)){
                        tempstr="Tower Shield";
                    } else if (speed30===30 && speed20 === 20){
                        tempstr="Light";
                    } else if ((/heavy|stone|full|half.plate|splint|banded|iron|tatami|kusari/i).test(tempstr)){
                        tempstr="Heavy";
                    } else if ((/medium|mountain|chainmail|breastplate|scale|kikko|steel|horn|mirror|hide|maru|armored coat/i).test(tempstr)){
                        tempstr="Medium";
                    } else {
                        tempstr="Light";
                    }
                    setter[itemprefix+"defense-type"]=tempstr;
                }
                
            } else  {
                currType=getEquipmentTypeFromName(name);
            }
            if (currType<0){
                currType=equipMap.Other;
            } else if (currType===equipMap.Weapon){
                setter[prefix+'weapon-attributes-show']=1;
            } else if (currType===equipMap.Armor){
                setter[prefix+'armor-attributes-show']=1;					
            }
            //it just ignores it! why!? so don't change tab cause it won't be on the new tab.
            if(currType){
                setter['equipment_tab']=currType;
                setter[prefix+'equip-type']=currType;
                setter[prefix+'equiptype-tab']=currType;
            }
            setter[prefix+'qty']=1;
            setter[prefix+'qty_max']=1;
            //default to carried or not carried?
            setter[prefix+'location']=locationMap.Carried;
            setter[prefix+'old_location']=locationMap.Carried;
            setter[prefix+'loctype-tab']=locationMap.Carried;

            setter[itemprefix+'category_compendium']="";
            setter[itemprefix+'value_compendium']="";
            setter[itemprefix+'range_compendium']="";
            setter[itemprefix+'critical_compendium']="";
            setter[itemprefix+'smalldamage_compendium']="";
            setter[itemprefix+'meddamage_compendium']="";
            setter[itemprefix+'specialtype_compendium']="";
            setter[itemprefix+'speed20_compendium']="";
            setter[itemprefix+'speed30_compendium']="";
            setter[itemprefix+'weight_compendium']="";
            setter[itemprefix+'spell-fail_compendium']="";
            setter[itemprefix+'acbonus_compendium']="";
            setter[itemprefix+'acp_compendium']="";

            
        } catch (err){
            TAS.error("importFromCompendium",err);
        } finally {
            //TAS.debug"importFromCompendium setting",setter);
            if (_.size(setter)>0){
                setAttrs(setter,PFConst.silentParams, updateRepeatingItems);
            }
        }
    });
}
function updateUses (callback){
    var done = _.once(function(){
        TAS.debug("leaving PFInventory.updateUses");
        if(typeof callback === "function"){
            callback();
        }
    });
    //TAS.debug("at PFInventory.updateUses");
    getSectionIDs('repeating_item',function(ids){
        var fields=[];
        if (!ids || !_.size(ids)){
            done();
            return;
        }
        fields = _.reduce(ids,function(m,id){
            m.push('repeating_item_'+id+'_has_uses');
            m.push('repeating_item_'+id+'_qty_max');
            return m;
        },[]);
        //_.flatten(fields);
        getAttrs(fields,function(v){
            var setter={};
            try {
                setter = _.reduce(ids,function(m,id){
                    var prefix = 'repeating_item_'+id+'_',maxQty=0;
                    try {
                        maxQty=parseInt(v[prefix+'qty_max'],10)||0;
                        if (maxQty > 1){
                            m[prefix+'has_uses']='true';
                        } else {
                            m[prefix+'has_uses']='';
                        }
                    } catch (errin){
                        TAS.error("PFInventory.updateUses error repeating_item  id "+id,errin);
                    } finally {
                        return m;
                    }
                },{});
            } catch (err){
                TAS.error("PFInventory.updateUses error setting defaults ",err);
            } finally {
                if (_.size(setter)>0){
                    setAttrs(setter,PFConst.silentParams,done);
                } else {
                    done();
                }
            }
        });
    });
}
/**
 * @param {function} callback 
 */
function deleteOrphanWornRows (callback){
    var done = _.once(function(){
        TAS.debug("leaving PFInventory.deleteOrphanWornRows");
        if (typeof callback === "function"){
            callback();
        }
    });
    getSectionIDs('repeating_item',function(ids){
        if (! (ids && _.size(ids)>0)){
            done();
            return;
        }
        getAttrs(wornEquipmentRowRollsNew,function(v){
            var notFoundList=[],lowerIDs=[],setter={};
            try {
                lowerIDs = _.map(ids,function(id){return id.toLowerCase();});
                notFoundList = _.chain(v)
                    .omit(function(val,key){ if (!val) {return true;} return false; })
                    .mapObject(function(val){ return SWUtils.getRowId(val).toLowerCase(); })
                    .omit(function(val,key){ return _.contains(lowerIDs,val);  })
                    .value();
                if(_.size(notFoundList)>0){
                    setter=_.reduce(notFoundList,function(m,v,key){
                        var nameAttr= key.slice(-5);
                        m[nameAttr]='';
                        m[key]='';
                        return m;
                    },{});
                    setAttrs(setter,PFConst.params,done);
                } else {
                    done();
                }
            } catch (err){
                TAS.error("PFInventory.deleteOrphanWornRows",err);
                done();
            }
        });
    });
}
function deleteWornRow (source){
    source = source.toLowerCase();
    getAttrs(wornEquipmentRowRollsNew,function(v){
        var match='',row='',setter={};
        try {
            match = _.findKey(v,function(val){
                if (!val) {return false;}
                if (val.toLowerCase().indexOf(source)>=0){
                    return true;
                }
                return false;
            });
            if (match){
                row = match.slice(0,-5);
                setter[match]='';
                setter[row]='';
                setAttrs(setter,PFConst.silent);
            }
        } catch (err){
            TAS.error("PFInventory.event delete item for attribute: "+source,err);
        }
    });
}
export function setNewDefaults (callback, oldversion){
    var done = _.once(function(){
        TAS.debug("leaving PFInventory.setNewDefaults");
        if(typeof callback === "function"){
            callback();
        }
    });
    TAS.debug("at PFInventory.setNewDefaults");
    getAttrs(['migrated_itemlist_defaults'],function(vout){
        try {
            //TAS.debug("PFInventory.setNewDefaults ",v);
            if(parseInt(vout.migrated_itemlist_defaults,10)===1){
                done();
                return;
            }
            getSectionIDs('repeating_item',function(ids){
                var fields=[];
                try {
                    if (!ids || !_.size(ids)){
                        done();
                        return;
                    }
                    fields = _.map(ids,function(id){
                        return ['repeating_item_'+id+'_name','repeating_item_'+id+'_location',
                        'repeating_item_'+id+'_qty_max','repeating_item_'+id+'_equip-type'];
                    });
                    fields = _.flatten(fields);
                } catch (miderror){
                    TAS.error("PFInventory.setNewDefaults miderror",miderror);
                    done();
                    return;
                }
                //TAS.debug("PFInventory.setNewDefaults fields:",fields);
                getAttrs(fields,function(v){
                    var setter={},currEquip=0;
                    try {
                        //TAS.debug("PFInventory.setNewDefaults fields ",v);
                        setter = _.reduce(ids,function(m,id){
                            var prefix = 'repeating_item_'+id+'_',maxQty=0,
                            nameField=prefix+'name',currLoc=0,guess=0;
                            try {
                                currLoc = parseInt(v[prefix+'location'],10);
                                if(isNaN(currLoc)){
                                    //default is carried
                                    currLoc = locationMap.Carried;
                                    m[prefix+'location']=currLoc;
                                }
                                m[prefix+'oldlocation']=currLoc;
                                if (currLoc>locationMap.NotCarried) {
                                    m[prefix+'loctype-tab']=locationMap.Carried;
                                } else {
                                    m[prefix+'loctype-tab']=currLoc;
                                }
                                maxQty=parseInt(v[prefix+'qty_max'],10);
                                if (isNaN(maxQty)){
                                    maxQty=0;
                                    m[prefix+'_qty_max']=maxQty;
                                }
                                if (maxQty > 1){
                                    m[prefix+'has_uses']='true';
                                } else {
                                    m[prefix+'has_uses']='';
                                }
                                currEquip =parseInt(v['repeating_item_'+id+'_equip-type'],10);
                                if (!currEquip){
                                    if(v[nameField]){
                                        guess=getEquipmentTypeFromName(v[nameField]);
                                    }
                                    if (guess){
                                        m[prefix+'equip-type']=guess;
                                        m[prefix+'equiptype-tab']=guess;
                                    } else {
                                        m[prefix+'equip-type']=equipMap.noEquipType;
                                        m[prefix+'equiptype-tab']=equipMap.noEquipType;
                                    }
                                } else {
                                    m[prefix+'equiptype-tab']=currEquip;
                                }
                                m[prefix+'showinmenu']=0;
                            } catch (errin){
                                TAS.error("PFInventory.setNewDefaults error repeating_item  id "+id,errin);
                            } finally {
                                return m;
                            }
                        },{});
                        setter['migrated_itemlist_defaults']=1;
                    } catch (err){
                        TAS.error("PFInventory.setNewDefaults error setting defaults ",err);
                    } finally {
                        if (_.size(setter)>0){
                            TAS.debug("PFInventory.setNewDefaults setting",setter);
                            setAttrs(setter,PFConst.silentParams,done);
                        } else {
                            done();
                        }
                    }
                });
            });
        } catch (outererr){
            TAS.error("PFInventory.setNewDefaults outererr",outererr);
            done();
        }
    });
}
export function migrate  (callback, oldversion) {
    var done = _.once(function(){
        TAS.debug("leaving PFInventory.migrate");
        if (typeof callback === "function"){
            callback();
        }
    });
    TAS.debug("At PFInventory.migrate");
    PFMigrate.migrateRepeatingItemAttributes(TAS.callback(function callPFInventorySetNewDefaults(){
        setNewDefaults(TAS.callback( function callPFInventoryMigrateWornEquipment(){
            migrateWornEquipment(done);
            migrateRepeatingMacros();
        }));
    }));
}
export function recalculate (callback, silently, oldversion) {
    var done = _.once(function () {
        TAS.debug("leaving PFInventory.recalculate");
        if (typeof callback === "function") {
            callback();
        }
    }),
    setTotals = _.after(2, function () {
        TAS.debug("PFInventory.recalculate at setTotals");
        updateLocations(TAS.callback(updateUses));
        resetCommandMacro();
        deleteOrphanWornRows();
        updateCarriedTotal(done);
    });
    try {
        TAS.debug("at PFInventory.recalculate");
        migrate(function(){
            updateCarriedCurrency(setTotals, silently);
            updateRepeatingItems(setTotals, silently);
        });
    } catch (err) {
        TAS.error("PFInventory.recalculate", err);
        done();
    }
}
function registerEventHandlers  () {
    var tempstr="";
    on('change:repeating_item:item-category_compendium', TAS.callback(function EventItemCompendium(eventInfo){
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            importFromCompendium(eventInfo);
        }
    }));
    on('change:repeating_item:location', TAS.callback(function eventUpdateItemLocation(eventInfo){
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateEquipmentLocation(null,null,null,eventInfo);
        }
    }));
    on('change:repeating_item:qty_max', TAS.callback(function eventUpdateItemMaxQty(eventInfo){
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            getAttrs(['repeating_item_qty_max'],function(v){
                if(parseInt(v['repeating_item_qty_max'],10) > 1){
                    setAttrs({'repeating_item_has_uses':'true'},PFConst.silentParams);
                } else {
                    setAttrs({'repeating_item_has_uses':''},PFConst.silentParams);
                }
            });
        }
    }));
    on('change:repeating_item:item-weight change:repeating_item:qty change:repeating_item:qty_max change:repeating_item:location', TAS.callback(function eventUpdateItemTotalWeight(eventInfo) {
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            getAttrs(['repeating_item_location','repeating_item_old_location','repeating_item_item-weight','repeating_item_qty'],function(v){
                var newloc = parseInt(v.repeating_item_location,10)||0,
                oldloc = parseInt(v.repeating_item_old_location,10)||0;
                    TAS.repeating('item').attrs('item_total_weight').fields('item-weight', 'qty', 'qty_max', 'location').reduce(function (m, r) {
                        //TAS.debug"in weight add row, variables: weight: "+r.F['item-weight']+", qty:"+r.I.qty+", max:"+r.I.qty_max +", loc:"+ r.I.location);
                        if (r.I.qty > 0 && (r.I.location !== locationMap.NotCarried)) {
                            //TAS.debug("adding "+r.F['item-weight']);
                            if (r.I.qty_max === 0 || r.I.qty_max===1) {
                                m['item-weight'] += r.F['item-weight'] * r.I.qty;
                            } else {
                                m['item-weight'] += r.F['item-weight'];
                            }
                        }
                        return m;
                    }, {
                        'item-weight': 0
                    }, function (m, r, a) {
                        a.S['item_total_weight'] = m['item-weight'];
                    }).execute();
            });
        }
    }));
    on('change:repeating_item:item-hp change:repeating_item:item-hp_max', TAS.callback(function eventUpdateItemTotalHp(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        TAS.repeating('item').attrs('item-total-hp', 'item-total-hp_max').fields('item-hp', 'item-hp_max').reduce(function (m, r) {
            m['item-hp'] += r.I['item-hp'];
            m['item-hp_max'] += r.I['item-hp_max'];
            return m;
        }, {
            'item-hp': 0,
            'item-hp_max': 0
        }, function (m, r, a) {
            a.S['item-total-hp'] = m['item-hp'];
            a.S['item-total-hp_max'] = m['item-hp_max'];
        }).execute();
    }));
    on('change:repeating_item:value', TAS.callback(function eventUpdateItemTotalValue(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        TAS.repeating('item').attrs('item-total-value').fields('value', 'qty').reduce(function (m, r) {
            m.value += r.I.value * r.I.qty;
            return m;
        }, {
            value: 0
        }, function (m, r, a) {
            a.S['item-total-value'] = m.value;
        }).execute();
    }));
    on('remove:repeating_item', TAS.callback(function eventRemoveItem(eventInfo) {
        var source='',setter = {}, itemId ='';
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateRepeatingItems();
            deleteWornRow(eventInfo.sourceAttribute);
        }
        // Find matching source-item in repeating_weapon then clear the source-item and source-item-name attributes for each
        itemId = eventInfo.sourceAttribute.replace("repeating_item_", "");
        getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
            _.each(idarray, function (currentID) { // loop through the set
                getAttrs(["repeating_weapon_" + currentID + "_source-item"], function (v) {
                    if (itemId === v["repeating_weapon_" + currentID + "_source-item"]) {
                        setter["repeating_weapon_" + currentID + "_source-item"] = "";
                        setter["repeating_weapon_" + currentID + "_source-item-name"] = "";
                        //TAS.debug"clearing source-item for attack entry " + currentID, setter);
                        setAttrs(setter, PFConst.silentParams);
                    }
                });
            });
        });
    }));
    on('change:CP change:SP change:GP change:PP', TAS.callback(function eventUpdateCarriedCurrency(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        updateCarriedCurrency();
    }));
    on('change:carried-currency change:item_total_weight change:carried-misc', TAS.callback(function eventUpdateCarriedTotal(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        updateCarriedTotal();
    }));
    //change item worn in shield or armor location
    on('change:repeating_item:location change:repeating_item:item-defense-type change:repeating_item:item-acbonus change:repeating_item:item-max-dex change:repeating_item:item-acp change:repeating_item:item-spell-fail change:repeating_item:item-proficiency change:repeating_item:acenhance', TAS.callback(function eventUpdateWornArmorAndShield(eventInfo) {
            var location = 0;
            TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
            getAttrs(["repeating_item_location"], function (v) {
                var location = parseInt(v["repeating_item_location"], 10) || 0;
                if (location === locationMap.Armor || location === locationMap.Shield){
                    updateWornArmorAndShield(location, eventInfo.sourceAttribute);
                }
            });
    }));
    _.each(commonLinkedAttributes, function (fieldToWatch) {
        var eventToWatch = "change:repeating_item:item-" + fieldToWatch;
        on(eventToWatch, TAS.callback(function eventupdateAssociatedAttackLoop(eventInfo) {
            TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                updateAssociatedAttack(eventInfo.sourceAttribute);
            }
        }));
    });
    on('change:repeating_item:name change:repeating_item:item-dmg-type change:repeating_item:item-proficiency change:repeating_item:default_size change:repeating_item:wpenhance', TAS.callback(function eventupdateAssociatedAttack(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateAssociatedAttack(eventInfo.sourceAttribute);
        }
    }));
    on("change:repeating_item:create-attack-entry", TAS.callback(function eventcreateAttackEntryFromRow(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            createAttackEntryFromRow(eventInfo.sourceAttribute);
        }
    }));
    on("change:repeating_item:set-as-armor", TAS.callback(function eventcreateArmorEntryFromRow(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateWornArmorAndShield(locationMap.Armor, eventInfo.sourceAttribute,null );
        }
    }));
    on("change:repeating_item:set-as-shield", TAS.callback(function eventcreateShieldEntryFromRow(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            updateWornArmorAndShield(locationMap.Shield, eventInfo.sourceAttribute,null );
        }
    }));
    on("change:repeating_item:showinmenu change:repeating_item:equip-type change:repeating_item:name", TAS.callback(function eventShowItemInMenu(eventInfo) {
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            resetCommandMacro( );
        }
    }));
    on("change:repeating_item:equip-type", TAS.callback(function eventItemEquipTypeChange(eventInfo){
        TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
        if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
            getAttrs(['repeating_item_equip-type','repeating_item_equiptype-tab'],function(v){
                var newtype=parseInt(v['repeating_item_equip-type'],10)||0,
                oldtype=parseInt(v['repeating_item_equiptype-tab'],10)||0;
                //TAS.debug("################","At change:repeating_item:equip-type updating equiptype:"+newtype+", currtab:"+oldtype,v);
                if (newtype !== oldtype){
                    setAttrs({'repeating_item_equiptype-tab':newtype},PFConst.silentParams);
                }
            });
        }
    }));
}
registerEventHandlers();
PFConsole.log('   PFInventory module loaded      ' );
PFLog.modulecount++;
