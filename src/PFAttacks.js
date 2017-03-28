'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFUtilsAsync  from './PFUtilsAsync';
import * as PFMacros from './PFMacros';
import * as PFMenus from './PFMenus';
import * as PFMigrate from './PFMigrate';
import * as PFAttackOptions from './PFAttackOptions';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFInventory from './PFInventory';
import * as PFSpells from './PFSpells';
import * as PFAbility from './PFAbility';
import * as PFSize from './PFSize';

/** module for repeating_weapon section  */
/* **********************************ATTACKS PAGE ********************************** */
export var damageRowAttrs=["damage-ability-max","damage-ability-mod","damage-mod","damage_ability_mult","enhance","total-damage"],
damageRowAttrsLU=_.map(damageRowAttrs,function(a){return '_'+a;}),
updateRowAttrs=["attack-mod","attack-type","attack-type-mod","crit_conf_mod","crit_confirm",
	"isranged","masterwork","proficiency","total-attack",
	"attack-type_macro_insert","damage-type_macro_insert"].concat(damageRowAttrs),
updateRowAttrsLU = _.map(updateRowAttrs,function(a){return '_'+a;}),
sizeFields=['default_damage-dice-num','default_damage-die','default_size','not_default_size','damage-dice-num','damage-die','size_affects'],
sizeFieldsLU=['_default_damage-dice-num','_default_damage-die','_default_size','_not_default_size','_damage-dice-num','_damage-die','_size_affects'],
updateCharAttrs=["attk_ranged_crit_conf", "attk_ranged2_crit_conf", "attk_melee_crit_conf",	"attk_melee2_crit_conf", "attk_cmb_crit_conf", "attk_cmb2_crit_conf","DMG-mod"];

var defaultRepeatingMacro = '&{template:pf_attack} @{toggle_attack_accessible} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{name}}} {{attack=[[ 1d20cs>[[ @{crit-target} ]] + @{attack_macro} ]]}} {{damage=[[@{damage-dice-num}d@{damage-die} + @{damage_macro}]]}} {{crit_confirm=[[ 1d20 + @{attack_macro} + [[ @{crit_conf_mod} ]] ]]}} {{crit_damage=[[ [[ @{damage-dice-num} * (@{crit-multiplier} - 1) ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}} {{type=@{type}}} {{weapon_notes=@{notes}}} @{iterative_attacks} @{macro_options} {{vs=@{vs}}} {{vs@{vs}=@{vs}}} {{precision_dmg1=@{precision_dmg_macro}}} {{precision_dmg1_type=@{precision_dmg_type}}} {{precision_dmg2=@{global_precision_dmg_macro}}} {{precision_dmg2_type=@{global_precision_dmg_type}}} {{critical_dmg1=@{critical_dmg_macro}}} {{critical_dmg1_type=@{critical_dmg_type}}} {{critical_dmg2=@{global_critical_dmg_macro}}} {{critical_dmg2_type=@{global_critical_dmg_type}}} {{attack1name=@{iterative_attack1_name}}}',
defaultRepeatingMacroMap={
	'&{template:':{'current':'pf_attack}',old:['pf_generic}','pf_block}']},
	'@{toggle_attack_accessible}':{'current':'@{toggle_attack_accessible}'},
	'@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
	'{{color=':{'current':'@{rolltemplate_color}}}'},
	'{{character_name=':{'current':'@{character_name}}}'},
	'{{character_id=':{'current':'@{character_id}}}'},
	'{{subtitle}}':{'current':'{{subtitle}}'},
	'{{name=':{'current':'@{name}}}'},
	'{{attack=':{'current':'[[ 1d20cs>[[ @{crit-target} ]] + @{attack_macro} ]]}}','old':['{{attack=[[ 1d20cs>[[ @{crit-target} ]] + [[ @{total-attack} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} ]]','to':'@{attack_macro}'},{'from':'@{total-attack}','to':'@{attack_macro}'}]},
	'{{damage=':{'current':'[[@{damage-dice-num}d@{damage-die} + @{damage_macro}]]}}','old':['[[ @{damage-dice-num}d@{damage-die} + [[ @{total-damage} ]] ]]}}'],'replacements':[{'from':'[[ @{total-damage} ]]','to':'@{damage_macro}'},{'from':'@{total-damage}','to':'@{damage_macro}'}]},
	'{{crit_confirm=':{'current':'[[ 1d20 + @{attack_macro} + [[ @{crit_conf_mod} ]] ]]}}','old':['[[ 1d20 + [[ @{total-attack} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} ]]','to':'@{attack_macro} + [[ @{crit_conf_mod} ]]'},{'from':'@{total-attack}','to':'@{attack_macro} + [[ @{crit_conf_mod} ]]'}]},
	'{{crit_damage=':{'current':'[[ [[ @{damage-dice-num} * (@{crit-multiplier} - 1) ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}}','old':['[[ [[ (@{damage-dice-num} * (@{crit-multiplier} - 1)) ]]d@{damage-die} + [[ (@{total-damage} * (@{crit-multiplier} - 1)) ]] ]]}}'],'replacements':[{'from':'@{total-damage}','to':'(@{damage_macro})'}]},
	'{{type=':{'current':'@{type}}}'},
	'{{weapon_notes=':{'current':'@{notes}}}'},
	'@{iterative_attacks}':{'current':'@{iterative_attacks}'},
	'@{macro_options}':{'current':'@{macro_options}'},
	'{{vs=':{'current':'@{vs}}}'},
	'{{vs@{vs}=':{'current':'@{vs}}}'},
	'{{precision_dmg1=':{'current':'@{precision_dmg_macro}}}'},
	'{{precision_dmg1_type=':{'current':'@{precision_dmg_type}}}'},
	'{{precision_dmg2=':{'current':'@{global_precision_dmg_macro}}}'},
	'{{precision_dmg2_type=':{'current':'@{global_precision_dmg_type}}}'},
	'{{critical_dmg1=':{'current':'@{critical_dmg_macro}}}'},
	'{{critical_dmg1_type=':{'current':'@{critical_dmg_type}}}'},
	'{{critical_dmg2=':{'current':'@{global_critical_dmg_macro}}}'},
	'{{critical_dmg2_type=':{'current':'@{global_critical_dmg_type}}}'},
	'{{attack1name=':{'current':'@{iterative_attack1_name}}}'}
	},
defaultDeletedMacroAttrs = ['{{description=@{notes}}}','@{toggle_accessible_flag}'],
defaultIterativeRepeatingMacro='{{attackREPLACE=[[ 1d20cs>[[ @{crit-target} ]] + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] ]]}} {{damageREPLACE=[[ @{damage-dice-num}d@{damage-die} + @{damage_macro} ]]}} {{crit_confirmREPLACE=[[ 1d20 + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] + [[ @{crit_conf_mod} ]] ]]}} {{crit_damageREPLACE=[[ [[ @{damage-dice-num} * [[ @{crit-multiplier} - 1 ]] ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}} {{precision_dmgREPLACE1=@{precision_dmg_macro}}} {{precision_dmgREPLACE2=@{global_precision_dmg_macro}}} {{critical_dmgREPLACE1=@{critical_dmg_macro}}} {{critical_dmgREPLACE2=@{global_critical_dmg_macro}}} {{attackREPLACEname=@{iterative_attackREPLACE_name}}}',
defaultIterativeRepeatingMacroMap = {
	'{{attackREPLACE=':{'current':'[[ 1d20cs>[[ @{crit-target} ]] + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] ]]}}', 'old':['[[ 1d20cs>[[ @{crit-target} ]] + [[ @{total-attack} + @{iterative_attackREPLACE_value} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} ]]','to':'@{attack_macro}'},{'from':'@{total-attack}','to':'@{attack_macro}'}]},
	'{{damageREPLACE=':{'current':'[[ @{damage-dice-num}d@{damage-die} + @{damage_macro} ]]}}', 'old':['[[ @{damage-dice-num}d@{damage-die} + [[ @{total-damage} ]] ]]}}'],'replacements':[{'from':'[[ @{total-damage} ]]','to':'@{damage_macro}'},{'from':'@{total-damage}','to':'@{damage_macro}'}]},
	'{{crit_confirmREPLACE=':{'current':'[[ 1d20 + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] + [[ @{crit_conf_mod} ]] ]]}}', 'old':['[[ 1d20 + [[ @{total-attack} + @{iterative_attackREPLACE_value} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} + @{iterative_attackREPLACE_value} ]]','to':'[[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] + [[ @{crit_conf_mod} ]]'},{'from':'@{total-attack} + @{iterative_attackREPLACE_value}','to':'@{attack_macro} + @{iterative_attackREPLACE_value} + @{crit_conf_mod}'}]},
	'{{crit_damageREPLACE=':{'current':'[[ [[ @{damage-dice-num} * [[ @{crit-multiplier} - 1 ]] ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}}', 'old':['[[ [[ (@{damage-dice-num} * (@{crit-multiplier} - 1)) ]]d@{damage-die} + [[ (@{total-damage} * (@{crit-multiplier} - 1)) ]] ]]}}'],'replacements':[{'from':'@{total-damage}','to':'(@{damage_macro})'}]},
	'{{precision_dmgREPLACE1=':{'current':'@{precision_dmg_macro}}}'},
	'{{precision_dmgREPLACE2=':{'current':'@{global_precision_dmg_macro}}}'},
	'{{critical_dmgREPLACE1=':{'current':'@{critical_dmg_macro}}}'},
	'{{critical_dmgREPLACE2=':{'current':'@{global_critical_dmg_macro}}}'},
	'{{attackREPLACEname=':{'current':'@{iterative_attackREPLACE_name}}}'}
},
defaultIterativeDeletedMacroAttrs=null,
defaultIterativeAttrName='var_iterative_attackREPLACE_macro',
defaultIterativeReplaceArray=['2','3','4','5','6','7','8'];

function getRepeatingAddInMacroPortion (macro, toggle, portion) {
	if (!(macro === "" || macro === "0" || macro === undefined || macro === null || toggle === "" || toggle === "0" || toggle === undefined || toggle === null)) {
		return " " + portion;
	}
	return "";
}
function updateRepeatingAddInMacro (id, eventInfo) {
	var idStr = SWUtils.getRepeatingIDStr(id),
	prefix = "repeating_weapon_" + idStr,
	attackType = prefix + "attack-type",
	tattackPlusNm = prefix + "toggle_attack_macro_insert",
	tdamagePlusNm = prefix + "toggle_damage_macro_insert",
	attackPlusNm = prefix + "attack_macro_insert",
	damagePlusNm = prefix + "damage_macro_insert",
	tattackGlobalNm = "toggle_global_attack_macro_insert",
	tdamageGlobalNm = "toggle_global_damage_macro_insert",
	attackGlobalNm = "global_attack_macro_insert",
	damageGlobalNm = "global_damage_macro_insert",
	attackMacroNm = prefix + "attack_macro",
	damageMacroNm = prefix + "damage_macro",
	fields = ["adv_macro_show", attackType, attackGlobalNm, damageGlobalNm, attackPlusNm, damagePlusNm, attackMacroNm, damageMacroNm];
	getAttrs(fields, function (v) {
		var showMacros = parseInt(v.adv_macro_show, 10) || 0,
		newAtkMacro = "[[ @{total-attack} ]]",
		newDmgMacro = "[[ @{total-damage} ]]",
		setter = {};
		if (showMacros) {
			newAtkMacro += getRepeatingAddInMacroPortion(v[attackPlusNm], v[tattackPlusNm], "@{toggle_attack_macro_insert}");
			newAtkMacro += " @{attack-type_macro_insert}";
			newAtkMacro += getRepeatingAddInMacroPortion(v[attackGlobalNm], v[tattackGlobalNm], "@{toggle_global_attack_macro_insert}");
			newDmgMacro += " @{damage-type_macro_insert}";
			newDmgMacro += getRepeatingAddInMacroPortion(v[damagePlusNm], v[tdamagePlusNm], "@{toggle_damage_macro_insert}");
			newDmgMacro += getRepeatingAddInMacroPortion(v[damageGlobalNm], v[tdamageGlobalNm], "@{toggle_global_damage_macro_insert}");
		}
		if (newAtkMacro !== v[attackMacroNm]) {
			setter[attackMacroNm] = newAtkMacro;
		}
		if (newDmgMacro !== v[damageMacroNm]) {
			setter[damageMacroNm] = newDmgMacro;
		}
		if (_.size(setter)) {
			setAttrs(setter);
		}
	});
}
function setAdvancedMacroCheckbox () {
	getAttrs(["adv_macro_show", "global_melee_macro_insert", "global_ranged_macro_insert", "global_cmb_macro_insert", "global_attack_macro_insert", "global_melee_damage_macro_insert", "global_ranged_damage_macro_insert", "global_cmb_damage_macro_insert", "global_damage_macro_insert"], function (v) {
		var showAdv = parseInt(v.adv_macro_show, 10) || 0,
		hasAnyMacros = _.reduce(v, function (tot, value, fieldname) {
			if (fieldname !== "adv_macro_show" && !(value === "" || value === "0" || value === undefined || value === null)) {
				tot += 1;
			}
			return tot;
		}, 0);
		//TAS.debug("setAdvancedMacroCheckbox, checked:" + showAdv + " , has macros:" + hasAnyMacros);
		if (hasAnyMacros && !showAdv) {
			setAttrs({
				adv_macro_show: 1
			}, PFConst.silentParams);
		}
	});
}
/********* REPEATING WEAPON FIELDSET *********/
function setRepeatingWeaponInsertMacro (id, eventInfo) {
	var done = function () { }, //updateRepeatingAddInMacro(id,eventInfo);},
	idStr = SWUtils.getRepeatingIDStr(id),
	prefix = "repeating_weapon_" + idStr,
	attkTypeField = prefix + "attack-type";
	getAttrs([attkTypeField], function (v) {
		var attkType = PFUtils.findAbilityInString(v[attkTypeField]),
		setter = {};
		if (attkType) {
			attkType = attkType.replace('attk-', '');
			setter[prefix + "attack-type_macro_insert"] = PFAttackGrid.attackGridFields[attkType].attackmacro;
			setter[prefix + "damage-type_macro_insert"] = PFAttackGrid.attackGridFields[attkType].damagemacro;
		} else {
			setter[prefix + "attack-type_macro_insert"] = "0";
		}
		//TAS.debug("setRepeatingWeaponInsertMacro",setter);
		setAttrs(setter, {
			silent: true
		}, done);
	});
}
/* updateRepeatingWeaponAttack - calculates total-attack
 * also updates attk-effect-total-copy
 * @id {string} optional = id of row, if blank we are within the context of the row
 * @overrideAttr {string} optional = if we are passing in a value this is the fieldname after "repeating_weapon_"
 * @overrideValue {number} optional = if overrideAttr then this should be a number usually int but it won't check
 */
function updateRepeatingWeaponAttack (id, eventInfo) {
	//is it faster to not do the idstr each time? try it with ?:
	var resetOptionsWhenDone = function () {
		PFAttackOptions.resetOption(id, eventInfo);
	},
	idStr = SWUtils.getRepeatingIDStr(id),
	enhanceField = "repeating_weapon_" + idStr + "enhance",
	mwkField = "repeating_weapon_" + idStr + "masterwork",
	attkTypeModField = "repeating_weapon_" + idStr + "attack-type-mod",
	profField = "repeating_weapon_" + idStr + "proficiency",
	attkMacroModField = "repeating_weapon_" + idStr + "attack-mod",
	totalAttackField = "repeating_weapon_" + idStr + "total-attack";
	getAttrs([enhanceField, mwkField, attkTypeModField, profField, attkMacroModField, totalAttackField], function (v) {
		var enhance = (parseInt(v[enhanceField], 10) || 0),
		masterwork = (parseInt(v[mwkField], 10) || 0),
		attkTypeMod = (parseInt(v[attkTypeModField], 10) || 0),
		prof = (parseInt(v[profField], 10) || 0),
		attkMacroMod = (parseInt(v[attkMacroModField], 10) || 0),
		currTotalAttack = (parseInt(v[totalAttackField], 10) || 0),
		newTotalAttack = 0,
		setter = {};
		newTotalAttack = Math.max(enhance, masterwork) + attkTypeMod + prof + attkMacroMod;
		if (newTotalAttack !== currTotalAttack || isNaN(currTotalAttack)) {
			setter[totalAttackField] = newTotalAttack;
			setAttrs(setter, PFConst.silentParams, resetOptionsWhenDone);
		}
	});
}
/* updateRepeatingWeaponDamage - updates total-damage*/
function updateRepeatingWeaponDamage (id, eventInfo) {
	var resetOptionsWhenDone = function () {
		PFAttackOptions.resetOption(id, eventInfo);
	},
	idStr = SWUtils.getRepeatingIDStr(id),
	maxname = "repeating_weapon_" + idStr + "damage-ability-max",
	modname = "repeating_weapon_" + idStr + "damage-ability-mod",
	totalDamageField = "repeating_weapon_" + idStr + "total-damage",
	enhanceField = "repeating_weapon_" + idStr + "enhance",
	miscDmgField = "repeating_weapon_" + idStr + "damage-mod",
	abilityMultField = "repeating_weapon_" + idStr + "damage_ability_mult";
	getAttrs([maxname, modname, "DMG-mod", totalDamageField, enhanceField, miscDmgField, abilityMultField], function (v) {
		var maxA ,
		ability = parseInt(v[modname], 10) || 0,
		abilityMult = parseFloat(v[abilityMultField], 10) || 1,
		abilityTot,
		globalBuffConds = parseInt(v["DMG-mod"], 10) || 0,
		currTotalDmg = parseInt(v[totalDamageField], 10),
		miscDmg = parseInt(v[miscDmgField], 10) || 0,
		enhance = parseInt(v[enhanceField], 10) || 0,
		totalDamage,
		setter = {};
		maxA = parseInt(v[maxname], 10);
		if(isNaN(maxA)) {
			maxA=99;
		}
		abilityTot = Math.floor(Math.min(abilityMult * ability, maxA));
		totalDamage = abilityTot + globalBuffConds + miscDmg + enhance;

		if (totalDamage !== currTotalDmg || isNaN(currTotalDmg)) {
			//TAS.debug("setting damage to "+totalDamage);
			setter[totalDamageField] = totalDamage;
		}
		if (_.size(setter)) {
			setAttrs(setter, PFConst.silentParams, resetOptionsWhenDone);
		}
	});
}
function updateRepeatingWeaponCrit (id, eventInfo) {
	var idStr = SWUtils.getRepeatingIDStr(id),
	critConfirmTotalField = "repeating_weapon_" + idStr + "crit_conf_mod",
	critConfirmField = "repeating_weapon_" + idStr + "crit_confirm",
	attkTypeField = "repeating_weapon_" + idStr + "attack-type",
	attrs = ["attk_ranged_crit_conf", "attk_ranged2_crit_conf", "attk_melee_crit_conf", "attk_melee2_crit_conf", "attk_cmb_crit_conf", "attk_cmb2_crit_conf", critConfirmTotalField, critConfirmField, attkTypeField];
	getAttrs(attrs, function (v) {
		try {
			var currCritBonus = (parseInt(v[critConfirmTotalField], 10) || 0),
			critConfirmBonus = (parseInt(v[critConfirmField], 10) || 0),
			attkType = PFUtils.findAbilityInString(v[attkTypeField]),
			attkTypeForGrid = (!attkType) ? "" : (attkType.replace('attk-', '')),
			attackTypeBonusField = (!attkTypeForGrid) ? "" : (PFAttackGrid.attackGridFields[attkTypeForGrid].crit),
			attackTypeBonus = (!attackTypeBonusField) ? 0 : (parseInt(v[attackTypeBonusField], 10) || 0),
			newBonus = critConfirmBonus + attackTypeBonus,
			setter = {};
			if (newBonus !== currCritBonus) {
				setter[critConfirmTotalField] = newBonus;
				setAttrs(setter, {
					silent: true
				});
			}
		} catch (err) {
			TAS.error("updateRepeatingWeaponCrit:cannot find " + v[attkTypeField] + " in grid");
		}
	});
}
function updateRepeatingWeaponsFromCrit (attacktype, eventInfo) {
	var globalCritBonusField = PFAttackGrid.attackGridFields[attacktype].crit;
	getSectionIDs("repeating_weapon", function (ids) {
		var attrs = [globalCritBonusField];
		_.each(ids, function (id) {
			var idStr = SWUtils.getRepeatingIDStr(id);
			attrs.push("repeating_weapon_" + idStr + "crit_conf_mod");
			attrs.push("repeating_weapon_" + idStr + "crit_confirm");
			attrs.push("repeating_weapon_" + idStr + "attack-type");
		});
		//TAS.debug("about to get ",attrs);
		getAttrs(attrs, function (v) {
			var globalCritBonus = parseInt(v[globalCritBonusField], 10) || 0,
			setter = {};
			_.each(ids, function (id) {
				var idStr = SWUtils.getRepeatingIDStr(id),
				attackTypeField = "repeating_weapon_" + idStr + "attack-type",
				rowCritTotField = "",
				rowCrit = 0,
				rowTot = 0,
				currRowTot = 0;
				//TAS.debug("row:"+id+" attacktypefield:"+v[attackTypeField]+", ability:"+ PFUtils.findAbilityInString(v[attackTypeField]) +", type is:"+attacktype);
				if (PFUtils.findAbilityInString(v[attackTypeField]) === ("attk-" + attacktype)) {
					//TAS.debug("this row equal");
					rowCritTotField = "repeating_weapon_" + idStr + "crit_conf_mod";
					currRowTot = parseInt(v[rowCritTotField], 10) || 0;
					rowTot = globalCritBonus + (parseInt(v["repeating_weapon_" + idStr + "crit_confirm"], 10) || 0);
					//TAS.debug("global:"+globalCritBonus+", this row:"+currRowTot+", plus "+v["repeating_weapon_" + idStr + "crit_confirm"] );
					if (rowTot !== currRowTot) {
						setter[rowCritTotField] = rowTot;
					}
				}
			});
			if (_.size(setter) > 0) {
				setAttrs(setter, {
					silent: true
				});
			}
		});
	});
}
function setRepeatingWeaponRangedFlag (id){
	var idStr = SWUtils.getRepeatingIDStr(id),
	prefix = "repeating_weapon_" + idStr,
	attypeAttr=prefix+"attack-type",
	isRangedAttr=prefix+"isranged";
	getAttrs([attypeAttr,isRangedAttr],function(v){
		var setter={},
		newIsRanged=0,
		attackType="";
		attackType=PFUtils.findAbilityInString(v[attypeAttr]);
		if ((/ranged/i).test(attackType)) {
			newIsRanged=1;
		}
		if ((parseInt(v[isRangedAttr],10)||0) !== newIsRanged){
			setter[isRangedAttr]=newIsRanged;
			setAttrs(setter,PFConst.silentParams);
		}
	});

}
function getRecalculatedDamageOnly (id,v){
	var prefix = 'repeating_weapon_' + SWUtils.getRepeatingIDStr(id),
		enhance = (parseInt(v[prefix+ "enhance"], 10) || 0),
		abilitydmg = parseInt(v[prefix+ "damage-ability-mod"], 10) || 0,
		abilityMult = parseFloat(v[prefix+ "damage_ability_mult"], 10) || 1,
		currTotalDmg = parseInt(v[prefix+ "total-damage"], 10),
		dmgMacroMod = parseInt(v[prefix+ "damage-mod"], 10) || 0,
		maxAbility = parseInt(v[prefix+ "damage-ability-max"], 10),
		globalBuffConds = v["DMG-mod"], 
		abilityTotDmg=0,
		newTotalDamage=0,
		localsetter={};
	try {
		if(isNaN(maxAbility)) {
			maxAbility=99;
		}
		abilityTotDmg = Math.floor(Math.min(abilityMult * abilitydmg, maxAbility));
		newTotalDamage = abilityTotDmg + globalBuffConds + dmgMacroMod + enhance;
		if (newTotalDamage !== currTotalDmg || isNaN(currTotalDmg)) {
			localsetter[prefix+ "total-damage"] = newTotalDamage;
		}
	} catch (err){
		TAS.error("PFAttacks.recalculateAttack for id " + id,err);
	} finally {
		return localsetter;
	}
}
/* updateRepeatingWeaponDamages - updates all attacks when DMG-mod changes */
function updateRepeatingWeaponDamages (callback) {
	var done = _.once(function(){
		if (typeof callback === "function"){
			callback();
		}
	});
	getSectionIDs("repeating_weapon", function (ids) {
		var fields = SWUtils.cartesianAppend(['repeating_weapon_'],ids,damageRowAttrsLU);
		fields.push("DMG-mod");
		getAttrs(fields,function(v){
			var setter;
			v["DMG-mod"]= parseInt(v["DMG-mod"],10)||0;
			setter = _.reduce(ids,function(m,id){
				var xtra=getRecalculatedDamageOnly(id,v);
				_.extend(m,xtra);
				return m;
			},{});
			if(_.size(setter)){
				setAttrs(setter,{},done);
			} else {
				done();
			}
		});
	});
}		

/* this is faster than looping through the 3 parent lists */
export function updateAssociatedAttacksFromParents (callback){
	var done = _.once(function(){
		if (typeof callback === "function"){
			callback();
		}
	});
	getSectionIDs('repeating_weapon',function(ids){
		var doneOne = _.after(_.size(ids),function(){
			done();
		}),
		attrs = _.map(ids,function(id){
			return ['repeating_weapon_'+id+'_source-item','repeating_weapon_'+id+'_source-spell','repeating_weapon_'+id+'_source-ability'];
		});
		attrs = _.flatten(attrs);
		getAttrs(attrs,function(v){
			_.each(ids,function(id){
				doneOne();
				if(v['repeating_weapon_'+id+'_source-spell']) {
					PFInventory.createAttackEntryFromRow('repeating_item_'+v['repeating_weapon_'+id+'_source-item']+'_create-attack-entry',doneOne,true,id);
				} else if (v['repeating_weapon_'+id+'_source-item']) {
					PFSpells.createAttackEntryFromRow('repeating_spells_'+v['repeating_weapon_'+id+'_source-spell']+'_create-attack-entry',doneOne,true,id);
				} else if (v['repeating_weapon_'+id+'_source-item']) {
					PFAbility.createAttackEntryFromRow('repeating_ability_'+v['repeating_weapon_'+id+'_source-ability']+'_create-attack-entry',doneOne,true,id);
				} else {
					doneOne();
				}
			});
		});
	});
}

export function getRecalculatedAttack (id,v,setter){
	var prefix = 'repeating_weapon_'+id+'_',
		isRanged=parseInt(v[prefix+"isranged"],10)||0,
		enhance = (parseInt(v[prefix+ "enhance"], 10) || 0),
		masterwork = (parseInt(v[prefix+ "masterwork"], 10) || 0),
		attkTypeMod = (parseInt(v[prefix+ "attack-type-mod"], 10) || 0),
		prof = (parseInt(v[prefix+ "proficiency"], 10) || 0),
		attkMacroMod = (parseInt(v[prefix+ "attack-mod"], 10) || 0),
		currTotalAttack = parseInt(v[prefix+ "total-attack"], 10),
		abilitydmg = parseInt(v[prefix+ "damage-ability-mod"], 10) || 0,
		abilityMult = parseFloat(v[prefix+ "damage_ability_mult"], 10) || 1,
		currTotalDmg = parseInt(v[prefix+ "total-damage"], 10),
		dmgMacroMod = parseInt(v[prefix+ "damage-mod"], 10) || 0,
		maxAbility = parseInt(v[prefix+ "damage-ability-max"], 10),
		currCritBonus = (parseInt(v[prefix+ "crit_conf_mod"], 10) || 0),
		critConfirmBonus = (parseInt(v[prefix+ "crit_confirm"], 10) || 0),
		attkType = PFUtils.findAbilityInString(v[prefix+ "attack-type"]),
		globalBuffConds = v["DMG-mod"], 
		attkTypeForGrid='',
		attackTypeCritBonusField='',
		attackTypeCritBonus =0,
		newCritBonus=0,
		abilityTotDmg=0,
		newTotalDamage=0,
		newTotalAttack=0,
		localsetter;
	try{
		localsetter = setter || {};
		newTotalAttack = Math.max(enhance, masterwork) + attkTypeMod + prof + attkMacroMod;
		if (newTotalAttack !== currTotalAttack || isNaN(currTotalAttack)) {
			localsetter[prefix+ "total-attack"] = newTotalAttack;
		}
		if(isNaN(maxAbility)) {
			maxAbility=99;
		}
		abilityTotDmg = Math.floor(Math.min(abilityMult * abilitydmg, maxAbility));
		newTotalDamage = abilityTotDmg + globalBuffConds + dmgMacroMod + enhance;
		if (newTotalDamage !== currTotalDmg || isNaN(currTotalDmg)) {
			//TAS.debug("setting damage to "+newTotalDamage);
			localsetter[prefix+ "total-damage"] = newTotalDamage;
		}
		if(attkType){
			if((/range/i).test(attkType)){
				if(!isRanged){
					localsetter[prefix+"isranged"]=1;
				}
			} else if (isRanged){
				localsetter[prefix+"isranged"]=0;
			}
			attkTypeForGrid = attkType.replace('attk-','');
			//TAS.debug("at update attack attkTypeForGrid="+attkTypeForGrid+", comparing to:",PFAttackGrid.attackGridFields);
			if(attkTypeForGrid){
				attackTypeCritBonusField = PFAttackGrid.attackGridFields[attkTypeForGrid].crit;
				attackTypeCritBonus = (!attackTypeCritBonusField) ? 0 : v[attackTypeCritBonusField];
				if(v[prefix + "attack-type_macro_insert"] !== PFAttackGrid.attackGridFields[attkTypeForGrid].attackmacro){
					localsetter[prefix + "attack-type_macro_insert"] = PFAttackGrid.attackGridFields[attkTypeForGrid].attackmacro;
				}
				if (v[prefix + "damage-type_macro_insert"]!==PFAttackGrid.attackGridFields[attkTypeForGrid].damagemacro){
					localsetter[prefix + "damage-type_macro_insert"] = PFAttackGrid.attackGridFields[attkTypeForGrid].damagemacro;
				}
			}
		}
		newCritBonus = critConfirmBonus + attackTypeCritBonus;
		if (newCritBonus !== currCritBonus) {
			localsetter[prefix+ "crit_conf_mod"] = newCritBonus;
		}
		if (!attkTypeForGrid) {
			if (v[prefix + "attack-type_macro_insert"]!=="0"){
				localsetter[prefix + "attack-type_macro_insert"] = "0";
			}
			if (v[prefix + "damage-type_macro_insert"]!=="0"){
				localsetter[prefix + "damage-type_macro_insert"] = "0";
			}
		}
	} catch (err){
		TAS.error("PFAttacks.getRecalculatedAttack for id " + id,err);
	} finally {
		return localsetter;
	}
}
function updateWeaponSize(id,currCharSize,v,setter){
	var idStr = SWUtils.getRepeatingIDStr(id),
		prefix='repeating_weapon_'+idStr,
		currDice=0,defDice=0,
		currDie=0,defDie=0,
	 	defWeaponSize=0, sizeDiff=0, newDice={};
	try {
		if (parseInt(v[prefix+'size_affects'],10)){
			currDice=parseInt(v[prefix+'damage-dice-num'],10)||0;
			currDie=parseInt(v[prefix+'damage-die'],10)||0;
			TAS.debug("PFAttacks.updateWeaponSize curr size:"+ currCharSize+" and current dmg: "+currDice+"d"+currDie);
			if (!(currDice ===0 || currDie === 0)){
				defWeaponSize=parseInt(v[prefix+'default_size'],10);
				defDice=parseInt(v[prefix+'default_damage-dice-num'],10)||0;
				defDie=parseInt(v[prefix+'default_damage-die'],10)||0;
				TAS.debug("PFAttacks.updateWeaponSize default is:"+defDice+"d"+defDie+", for size:"+defWeaponSize);
				//check for errors 
				if (isNaN(defWeaponSize)){
					defWeaponSize = currCharSize;
					setter[prefix+'default_size']=defWeaponSize;
				}
				if ( defDice===0 ||  defDie === 0){
					defDice = currDice;
					defDie = currDie;
					setter[prefix+'default_damage-dice-num']=defDice;
					setter[prefix+'default_damage-die']=defDie;
				}
				//end of check for errors
				if (currCharSize !== defWeaponSize){
					setter[prefix+'not_default_size']=1;
					sizeDiff=PFSize.getSizeLevelChange(defWeaponSize,currCharSize);
					newDice= PFSize.updateDamageDice (sizeDiff,defWeaponSize,defDice,defDie);
					TAS.debug("###########","PFAttacks.updateWeaponSize NEW DAMAGE is:"+newDice.dice+"d"+newDice.die+", for sizeDiff:"+sizeDiff);
					if(currDice!==newDice.dice || currDie!==newDice.die  ){
						setter[prefix+'damage-dice-num']=newDice.dice;
						setter[prefix+'damage-die']=newDice.die;
					}
				} else {
					if (parseInt(v[prefix+'not_default_size'],10)){
						setter[prefix+'not_default_size']=0;
					}
					if(currDice !== defDice || currDie !== defDie){
						setter[prefix+'damage-dice-num']=defDice;
						setter[prefix+'damage-die']=defDie;
					}
				}
			} else {
				//size affects was 1, but no damage dice
				setter[prefix+'size_affects']=0;
			}
		}
	} catch (err){
		TAS.error("PFAttacks.updateWeaponSize",err);
	} finally {
		TAS.debug("PFAttacks.updateWeaponSize returning with ",setter);
		return setter;
	}
}

function updateWeaponSizeAsync(id,callback){
	var idStr = SWUtils.getRepeatingIDStr(id),
	prefix='repeating_weapon_'+idStr;
	getAttrs(['size',prefix+'size_affects',prefix+'default_damage-dice-num',prefix+'default_damage-die',prefix+'default_size',prefix+'not_default_size',prefix+'damage-dice-num',prefix+'damage-die'],function(v){
		var  setter={},currCharSize=0;
		try {
			TAS.debug("at PFAttacks.updateWeaponSizeAsync for id "+id+", got ",v);
			currCharSize=parseInt(v.size,10)||0;
			updateWeaponSize(id,currCharSize,v,setter);
		} finally {
			if (_.size(setter)){
				setAttrs(setter);
			}
		}
	});
}

export function updateWeaponsDamageDueToSizeAsync(){
	TAS.debug("at updateWeaponsDamageDueToSizeAsync");
		getSectionIDs('repeating_weapon',function(ids){
			var fields;
			if (!(ids || _.size(ids))){
				
				return;
			}
			TAS.debug("at PFAttacks.updateWeaponDamageDueToSizeAsync: ",ids);
			_.each(ids,function(id){
				updateWeaponSizeAsync(id);
			});
		});
	
}

/**
 * assumes id has values in it.
 * @param {[string]} ids 
 * @param {function} callback 
 */
function updateAllRowsNonCalcFields (ids,callback){
	var done = function(){
		if(typeof callback ==="function"){
			callback();
		}
	},
	doneWithAllRows,
	fields;
	if (!ids || _.size(ids)===0){
		done();
		return;
	}
	doneWithAllRows = _.after(_.size(ids),done);
	fields = SWUtils.cartesianAppend(['repeating_weapon_'],ids,updateRowAttrsLU);
	fields = fields.concat(updateCharAttrs);
	getAttrs(fields,function(v){
		var charAttMap={},	setter;
		//set global values to int so we don't have to do it over and over per row.
		charAttMap = _.object(_.map(updateCharAttrs,function(attr){
			return [attr, parseInt(v[attr],10)||0];
		}));
		_.extend(v,charAttMap);
		setter = _.reduce(ids,function(m,id){
			var xtra={}
			try {
				xtra=getRecalculatedAttack(id,v);
				_.extend(m,xtra);
				updateWeaponSizeAsync(id);
			} catch (erri){
				TAS.error("PFAttacks.updateAllRowsNonCalcFields erri",erri);
			} finally {
				return m;
			}
		},{});
		if(_.size(setter)){
			setAttrs(setter,{},done);
		} else {
			done();
		}
	});
}
function recalcCalculatedFields (ids,callback){
	var done = _.once(function(){
		if (typeof callback === "function"){
			callback();
		}
	}),
	doneWithCalculatedFields = _.after(_.size(ids),done),
	fields;
	fields =_.chain(ids)
		.map(function(id){
			var prefix = "repeating_weapon_" + id + "_";
			return [prefix + "damage",prefix + "attack",prefix + "damage-mod",prefix + "attack-mod"];
		})
		.flatten()
		.value();
	getAttrs(fields,function(v){
		try{
			_.each(ids,function (id) {
				var doneWithField =_.after(4,doneWithCalculatedFields),
				prefix = "repeating_weapon_" + id + "_";
				if((!v[prefix + "damage"] || v[prefix + "damage"]==="0"|| v[prefix + "damage"]==="+0") && parseInt(v[prefix+"damage-mod"],10)===0){
					doneWithField();
				} else {
					SWUtils.evaluateAndSetNumber(prefix + "damage", prefix + "damage-mod",0,doneWithField,true);
				}
				if((!v[prefix + "attack"] || v[prefix + "attack"]==="0" || v[prefix + "attack"]==="+0") && parseInt(v[prefix+"attack-mod"],10)===0){
					doneWithField();
				} else {
					SWUtils.evaluateAndSetNumber(prefix + "attack", prefix + "attack-mod",0,doneWithField,true);
				}
				SWUtils.setDropdownValue(prefix + "attack-type",prefix +"attack-type-mod",PFUtils.findAbilityInString,doneWithField,true);
				SWUtils.setDropdownValue(prefix + "damage-ability",prefix +"damage-ability-mod",PFUtils.findAbilityInString,doneWithField,true);
			});
		}catch(err){
			TAS.error("recalcCalculatedFIelds",err);
			done();
		}
	});
}
export function recalculateRepeatingWeapons (callback){
	var done = _.once(function(){
		TAS.debug("leaving PFAttacks.recalculateRepeatingWeapons");
		if (typeof callback === "function"){
			callback();
		}
	});
	getSectionIDs("repeating_weapon", function (ids) {
		recalcCalculatedFields(ids,function(){
			updateAllRowsNonCalcFields(ids,done);
		});
	});
}

export function getNewDefaults (ids,v,setter){
	var localsetter,defaultSize;
	try {
		setter = setter || {};
		defaultSize = parseInt(v['size'],10)||0;
		localsetter = _.reduce(ids,function(m,id){
			var prefix = 'repeating_weapon_'+id+'_';
			try {
				m[prefix+'default_size']=defaultSize;
				if(v[prefix+'damage-dice-num']){
					m[prefix+'default_damage-dice-num']=v[prefix+'damage-dice-num'];
				} else {
					m[prefix+'default_damage-dice-num']=0;
					m[prefix+'damage-dice-num']=0;
				}
				if(v[prefix+'damage-die']){
					m[prefix+'default_damage-die']=v[prefix+'damage-die'];
				} else {
					m[prefix+'default_damage-die']=0;
					m[prefix+'damage-die']=0;
				}
			} catch (errin){
				TAS.error("PFAttacks.setNewDefaultsSync errin id "+id,errin);
			} finally {
				return m;
			}
		},{});
		_.extend(setter,localsetter);
	} catch (errout){
		TAS.error("PFAttacks.getNewDefaults errout ",errout);
	} finally {
		return setter;
	}
}
export function setNewDefaults (callback){
	var done = _.once(function(){
		TAS.debug("leaving PFAttacks.setNewDefaults");
		if(typeof callback === "function"){
			callback();
		}
	}),
	finishedMigrating=_.once(function(){
		setAttrs({'migrated_attacklist_defaults111':1},PFConst.silentParams,done);
	});
	//TAS.debug("At PFAttacks.setNewDefaults");
	getAttrs(['migrated_attacklist_defaults111'],function(vsize){
		if(parseInt(vsize['migrated_attacklist_defaults111'],10)){
			done();
			return;
		}
		getSectionIDs('repeating_weapon',function(ids){
			var fields;
			if (!(ids || _.size(ids))){
				finishedMigrating();
				return;
			}
			fields= SWUtils.cartesianAppend(['repeating_weapon_'],ids,['_damage-dice-num','_damage-die']);
			fields.push('size');
			getAttrs(fields,function(v){
				var setter={};
				try {
					setter = getNewDefaults(ids, v, setter);
				} catch (errout){
					TAS.error("PFAttacks.setNewDefaults errout ",errout);
				} finally {
					if (_.size(setter)){
						setAttrs(setter,PFConst.silentParams,finishedMigrating);
					} else {
						done();
					}
				}
			});
		});
	});
}
export function migrateRepeatingMacro (callback){
	var done = _.once(function(){
		if(typeof callback === "function"){
			callback();
		}
	}),
	migratedIteratives = function(){
		setAttrs({'migrated_attack_macrosv1':1},PFConst.silentParams,done);
	},
	migrated = _.after(2,function(){
		PFMacros.migrateRepeatingMacrosMult(migratedIteratives,'weapon',defaultIterativeAttrName,defaultIterativeRepeatingMacro,defaultIterativeRepeatingMacroMap,defaultIterativeDeletedMacroAttrs,defaultIterativeReplaceArray);
	});
	PFMacros.migrateRepeatingMacros(migrated,'weapon','macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{PC-Whisper}');
	PFMacros.migrateRepeatingMacros(migrated,'weapon','npc-macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{NPC-Whisper}');
}
export function migrate (callback, oldversion){
	var done=_.once(function(){
		TAS.debug("leaving PFAttacks.migrate");
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs([ "migrated_damage-multiplier","migrated_attack_macrosv1"],function(v){
		var migrateDamage = 0, migrateMacrosv1=0,migrateIteratives=0;
		migrateDamage = parseInt(v["migrated_damage-multiplier"], 10) || 0;
		migrateMacrosv1 = parseInt(v["migrated_attack_macrosv1"], 10) || 0;
		getSectionIDs('repeating_weapon',function(ids){
			var callmigrateMacrostov1,callmigrateMacrostov64,callmigrateRepeatingDamage,callSetDefaults;
			try{
				if (!ids || _.size(ids)<=0){
					setAttrs({"migrated_damage-multiplier":1,'migrated_attack_macrosv1':1,'migrated_attacklist_defaults111':1},
						PFConst.silentParams,done);
					return;
				}
				callSetDefaults = function(){
					setNewDefaults(done);
				};
				callmigrateMacrostov1=function(){
					if(!migrateMacrosv1){migrateRepeatingMacro(callSetDefaults);}
					else { callSetDefaults();}
				};
				callmigrateRepeatingDamage =function(){
					if(!migrateDamage){PFMigrate.migrateRepeatingDamage(ids,callmigrateMacrostov1);}
					else {callmigrateMacrostov1();}
				};
				callmigrateRepeatingDamage();
			} catch (err){
				TAS.error("PFAttacks.migrate",err);
				done();
			} finally {					
			}
		});
	});
}
export function recalculate (callback, silently, oldversion) {
	var done = function () {
		TAS.info("leaving PFAttacks.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	};
	TAS.debug("at PFAttacks.recalculate");
	PFAttackGrid.recalculate( function(){
		migrate(function(){
			setAdvancedMacroCheckbox();
			recalculateRepeatingWeapons();
			PFAttackGrid.resetCommandMacro();
			PFAttackOptions.recalculate();
			updateAssociatedAttacksFromParents();
			done();
		},oldversion);
	}  ,silently,oldversion);
}
function registerEventHandlers () {
	_.each(PFAttackGrid.attackGridFields, function (attackFields, attack) {
		on("change:" + attackFields.crit, TAS.callback(function eventAttackCrit(eventInfo) {
			if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				updateRepeatingWeaponsFromCrit(attack, eventInfo);
			}
		}));
	});
	on("change:repeating_weapon:attack-type-mod change:repeating_weapon:attack-mod", TAS.callback(function eventUpdateRepeatingWeaponAttackSheet(eventInfo) {
		if (eventInfo.sourceType === "sheetworker") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateRepeatingWeaponAttack(null, eventInfo);
		}
	}));
	on("change:repeating_weapon:masterwork change:repeating_weapon:proficiency", TAS.callback(function eventUpdateRepeatingWeaponAttackPlayer(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateRepeatingWeaponAttack(null, eventInfo);
		}
	}));
	on("change:repeating_weapon:damage-ability-mod change:repeating_weapon:damage-mod", TAS.callback(function eventUpdateRepeatingWeaponDamageSheet(eventInfo) {
		if (eventInfo.sourceType === "sheetworker") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateRepeatingWeaponDamage(null, eventInfo);
		}
	}));
	on("change:repeating_weapon:damage_ability_mult change:repeating_weapon:damage-ability-max", TAS.callback(function eventUpdateRepeatingWeaponDamagePlayer(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateRepeatingWeaponDamage(null, eventInfo);
		}
	}));
	on("change:repeating_weapon:attack-type", TAS.callback(function eventHandleRepeatingAttackDropdown(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		PFUtilsAsync.setRepeatingDropdownValue("weapon", null, "attack-type", "attack-type-mod");
		updateRepeatingWeaponCrit(null, eventInfo);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			setRepeatingWeaponInsertMacro(null, eventInfo);
			setRepeatingWeaponRangedFlag();
		}
	}));
	on("change:repeating_weapon:damage-ability", TAS.callback(function eventHandleRepeatingDamageDropdown(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		PFUtilsAsync.setRepeatingDropdownValue("weapon", null, "damage-ability", "damage-ability-mod");
	}));
	on("change:repeating_weapon:damage", TAS.callback(function eventRepeatingWeaponDamage(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		SWUtils.evaluateAndSetNumber("repeating_weapon_damage", "repeating_weapon_damage-mod");
	}));
	on("change:repeating_weapon:attack", TAS.callback(function eventRepeatingWeaponAttack(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		SWUtils.evaluateAndSetNumber("repeating_weapon_attack", "repeating_weapon_attack-mod");
	}));
	on("change:repeating_weapon:enhance", TAS.callback(function eventUpdateRepeatingWeaponAttackAndDamage(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			updateRepeatingWeaponAttack(null, eventInfo);
			updateRepeatingWeaponDamage();
		}
	}));
	on("change:repeating_weapon:crit_confirm", TAS.callback(function eventWeaponCritConfirmBonus(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateRepeatingWeaponCrit(null, eventInfo);
		}
	}));

	on("change:repeating_weapon:default_size", TAS.callback(function eventWeaponSize(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		updateWeaponSizeAsync(null,null);
	}));
	
	on("change:repeating_weapon:default_damage-dice-num change:repeating_weapon:default_damage-die", TAS.callback(function eventWeaponDice(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateWeaponSizeAsync(null,null);
		}
	}));

	on("remove:repeating_weapon change:repeating_weapon:attack-type change:_reporder_repeating_weapon change:repeating_weapon:group change:repeating_weapon:name change:include_attack_totals", TAS.callback(function eventRepeatingWeaponChange(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			PFAttackGrid.resetCommandMacro();
		}
	}));
	
	on("change:dmg-mod", TAS.callback(function eventUpdateRepeatingWeaponDamageTotal(eventInfo) {
		if (eventInfo.sourceType === "sheetworker") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateRepeatingWeaponDamages(eventInfo);
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFAttacks module loaded        ');
PFLog.modulecount++;
