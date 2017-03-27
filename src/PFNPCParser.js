'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import PFDB from './PFDB';
import * as PFMigrate from './PFMigrate';
import * as PFUtils  from './PFUtils';
import * as PFSize from './PFSize';
import * as PFSkills from './PFSkills';
import * as PFAbilityScores from './PFAbilityScores';
import * as PFBuffs from './PFBuffs';

var npcCompendiumAttributesPlayer = [ "npc-spellike-ability-text","npc-spells-known-text",
	"character_name","cr_compendium","xp_compendium","alignment","size_compendium","type_compendium","init_compendium",
	"senses_compendium","npc-aura","ac_compendium","npc_hp_compendium","fort_compendium","ref_compendium","will_compendium",
	"dr_compendium","sr_compendium","npc-defensive-abilities","immunities","resistances","weaknesses","speed_compendium",
	"space_compendium","reach_compendium","npc-melee-attacks-text","npc-ranged-attacks-text","npc-special-attacks",
	"str_compendium","dex_compendium","con_compendium","int_compendium","wis_compendium","cha_compendium",
	"bab_compendium","cmb_compendium","cmd_compendium","class_compendium","npc-feats-text",
	"skills_compendium","racial_mods_compendium","environment",
	"organization","other_items_treasure","languages","SQ_compendium","content_compendium"];

/* ******************************** PARSING ******************************** */

/** returns number from a string, first looks at end of string, then beginning, then anywhere in middle
 * so it works with both compendium (number at end) and SRD ("init " number at beginning) or just a string number
 *@param {string} initstring from the compendium entry
 *@returns {int} the initiative modifier
 */
function getNPCInit (initstring) {
	var numberInit;
	if ((/[\-\+]{0,1}\d+$/).test(initstring)) {
		numberInit = parseInt(initstring.match(/[\-\+]{0,1}\d+$/), 10);
	} else if ((/^(Init\s){0,1}[\-\+]{0,1}\d+/i).test(initstring)) {
		numberInit = parseInt(initstring.match(/[\-\+]{0,1}\d+$/), 10);
	} else if ((/^[\-\+]{0,1}\d+$/).test(initstring)) {
		numberInit = parseInt(initstring.match(/^[\-\+]{0,1}\d+$/), 10);
	} else if ((/[\-\+]{0,1}\d+/).test(initstring)) {
		numberInit = parseInt(initstring.match(/[\-\+]{0,1}\d+/), 10);
	}
	if (!isNaN(numberInit)) {
		return numberInit;
	}
	return 0;
}
/**getAbilityAndMod- returns the number and mod for an ability
 * @param {string} numberAsString the ability score -a number in string form
 * @returns {base: number or '-', mod:number}
 */
function getAbilityAndMod (numberAsString) {
	var base = parseInt(numberAsString, 10),
	mod = 0;
	if (!isNaN(base)) {
		mod = Math.floor((base - 10) / 2);
		return {
			"base": base,
			"mod": mod
		};
	}
	if (/dash|\-|8212|—/i.test(numberAsString)) {
		return {
			"base": "-",
			"mod": 0
		};
	}
	return {
		"base": 10,
		"mod": 0
	};
}
/** Splits string into array, based on commas (ignoring commas between parenthesis) 
 * @param {string} featstring 
 * @returns {[string]} feats
 */
function parseFeats (featstring) {
	return SWUtils.splitByCommaIgnoreParens(featstring);
}

/** parseNPChp - parses statblock hp string such as 203 (14d10+126)
 * @param {string} hpstring - string format: "15 (3d8 + 2d8 + 4) Fast Healing 5"  can have multiple xdy, and any string left after ) is considered healing note.
 * @param {int} abilityMod: number representing ability score mod (normally CON-mod)
 * @returns {object} {hp:0,hdie1:0,hdice1:0,hdie2:0,hdice2:0,misc:0,heal:""}
 *  where hdie1 d hdice1 is racial, and 2 is class, can go up to n classes
 */
function parseNPChp (hpstring, abilityMod) {
	var newHP = 0,
	plus = 0,
	matches,
	hparray = {
		hp: 0,
		hdie1: 0,
		hdice1: 0,
		basehp: 0,
		misc: 0,
		heal: ""
	},
	totalAbility = 0,
	matchessub,
	i = 0,
	tempstr = "",
	tempHD = 0,
	tempHdn = 0,
	tempmisc = 0,
	calcHP = 0;
	abilityMod = abilityMod || 0;
	if ((/^hp\s/i).test(hpstring)){
		hpstring = hpstring.slice(3);
	}
	//TAS.debug"parseNPChp", hpstring, abilityMod);
	newHP = parseInt(hpstring, 10);
	if (!isNaN(newHP)) {
		hparray.hp = newHP;
		if (hpstring.indexOf("(") > 0) {
			hpstring = hpstring.slice(hpstring.indexOf("(") + 1);
		}
		matches = hpstring.match(/\d+d\d+/ig);
		if (matches) {
			for (i = 0; i < matches.length; i++) {
				tempstr = matches[i];
				matchessub = tempstr.match(/(\d+)d(\d+)/i);
				if (matchessub && matchessub[1] && matchessub[2]) {
					tempHdn = parseInt(matchessub[1], 10) || 0;
					tempHD = parseInt(matchessub[2], 10) || 0;
					if (i > 0 && tempHD === 8 && hparray.hdie1 !== 8) {
						hparray["hdice" + (i + 1)] = hparray.hdice1;
						hparray["hdie" + (i + 1)] = hparray.hdie1;
						hparray.hdice1 = tempHdn;
						hparray.hdie1 = tempHD;
					} else {
						hparray["hdice" + (i + 1)] = tempHdn;
						hparray["hdie" + (i + 1)] = tempHD;
					}
				}
			}
		}
		//skip to next
		if (i > 0) {
			i--;
			hpstring = hpstring.slice(hpstring.indexOf(matches[i]) + matches[i].length);
		}
		// some entries have "plus" instead of "+"
		matches = hpstring.match(/\s*?([+\-]\s*\d+)\s*?|\s*?plus\s(\d+)\s*?/);
		if (matches) {
			hpstring = hpstring.slice(matches.index + matches[0].length);
			if (matches[1]) {
				plus = parseInt(matches[1].replace(/\s/g, ''), 10) || 0;
			} else if (matches[2]) {
				plus = parseInt(matches[2], 10) || 0;
			}
		} 
		//bug in compendium: no minus sign, so adds mod to end of die:
		//  instead of 1d8-1 it's 1d81, 1 dee 81 !
		// see Flying Squirrel
		if (!matches && hparray.hdie1 > 10 && (abilityMod < 0 || (hparray.hdie1 !== 12 && hparray.hdie1 !== 20))) {
			plus = hparray.hdie1 % 10;
			plus = -1 * plus;
			hparray.hdie1 = Math.floor(hparray.hdie1 / 10);
			TAS.warn("negative in compendium: plus is -1 * hit die mod 10");
		}
		totalAbility = abilityMod * hparray.hdice1;
		tempmisc = plus - totalAbility;
		//TAS.debug"plus "+plus +" minus con:"+totalAbility+" = "+ tempmisc);
		//misc is any bonus to the dice that is not due to CON modifier
		hparray.misc = tempmisc;
		if (hpstring.indexOf(")") >= 0) {
			hpstring = hpstring.slice(hpstring.indexOf(")") + 1);
		}
		if (hpstring.indexOf(";") === 0) {
			hpstring = hpstring.slice(1);
		}
		if (hpstring.length > 0) {
			hparray.heal = hpstring;
		}
	}
	//set the base hp to only the hd average, so will be less than what is in statblock
	hparray.basehp = PFUtils.getAvgHP(hparray.hdice1, hparray.hdie1);
	//check total, if does not match, add more
	calcHP = PFUtils.getAvgHP(hparray.hdice1, hparray.hdie1) + tempmisc+ (abilityMod *hparray.hdice1);
	if (calcHP && calcHP !== newHP) {
		//wtf?
		TAS.warn("parseNPChp, hp not adding right, should be:" + newHP + " but getNPCHP returns " + calcHP,hparray);
		hparray.misc += (newHP - calcHP);
	}

	//check:
	//basehp=newHP-abilityMod
	return hparray;
}
/** parseNPCAC - parses AC string from statblock
 * @param {string} acstring - format: "24, Touch 24, Flat-footed 16 (+6 Deflection, +7 Dex, +1 Dodge, +1 Armor, +1 Shield, +1 Size, +6 Natural) some note can go here"
 * can start with "AC " or not.
 * if it doesn't add up then the bonus will be added to misc.
 * (others include: Luck, Sacred/Profane, Circumstance, Enhancement, Insight, Morale) - these ALL go to CMD too (and dodge, deflection).
 * @param {string} cmdStr string for cmd , just checks for a number in the string
 * @param {int} abilityMod - to apply, usually dex.
 * @param {int} sizeMod - ac mod due to size.
 * @returns {ac:10,touch:10,ff:10,armor:0,shield:0,deflect:0,dex:0,dodge:0,natural:0,misc:0,note:,size:0,acbuff:0,altability:""}
 */
function parseNPCAC (acstring, cmdStr, abilityMod, sizeMod) {
	var matches,
	tempnum = 0,
	tempstr='',
	acMap = {
		ac: 10,
		touch: 10,
		ff: 10,
		armor: 0,
		shield: 0,
		deflect: 0,
		dex: 0,
		dodge: 0,
		natural: 0,
		misc: 0,
		note: "",
		size: 0,
		altability: "",
		acbuff: 0,
		uncanny: 0 ,
		cmd: 10,
		notes:'',
		cmdnotes:''
	};
	abilityMod = abilityMod || 0;
	sizeMod = sizeMod || 0;
	//TAS.debug"parseNPCAC: string:" + acstring + ", ability:" + abilityMod + ", size:" + sizeMod);
	try {
		if ((/^ac\s/i).test(acstring)){
			acstring = acstring.slice(3);
		}
		acMap.ac = parseInt(acstring,10)||0;

		matches=cmdStr.match(/(\d+)/);//get first match
		if (matches && matches[1]){
			//TAS.debug("getting cmd matches is cmd is : "+matches[1],matches);
			acMap.cmd = parseInt(matches[1],10)||0;
			tempstr=cmdStr.slice(matches.index+matches[0].length);
			if(tempstr){
				tempstr = SWUtils.trimBoth(tempstr);
				acMap.cmdnotes=tempstr;
			}
		}

		//get other AC totals
		matches = acstring.match(/Touch\s*?(\d+)/i);
		if (matches && matches[1]) {
			acMap.touch = parseInt(matches[1], 10);
		}
		matches = acstring.match(/Flat\-footed\s*?(\d+)/i);
		if (matches && matches[1]) {
			acMap.ff = parseInt(matches[1], 10);
		}
		//get modifiers compendium has all negatives as "1" intead of "-1"
		matches = acstring.match(/([+\-]??\d+)\s*?Deflect[,\i\s]/i);
		if (matches && matches[1]) {
			acMap.deflect = parseInt(matches[1], 10);
		}
		matches = acstring.match(/([+\-]??\d+)\s*?Nat[,u\s]/i);
		if (matches && matches[1]) {
			acMap.natural = parseInt(matches[1], 10);
		}
		matches = acstring.match(/([+\-]??\d+)\s*?Dodge/i);
		if (matches && matches[1]) {
			acMap.dodge = parseInt(matches[1], 10);
		}
		matches = acstring.match(/([+\-]??\d+)\s*?Size/i);
		if (matches && matches[1]) {
			acMap.size = parseInt(matches[1], 10);
		}
		//compendium size wrong: missing minus sign.
		// see Marilith
		if (acMap.size !== sizeMod) {
			acMap.size = sizeMod;
		}
		matches = acstring.match(/([+\-]??\d+)\s*?armor/i);
		if (matches && matches[1]) {
			acMap.armor = parseInt(matches[1], 10);
		}
		matches = acstring.match(/([+\-]??\d+)\s*?shield/i);
		if (matches && matches[1]) {
			acMap.shield = parseInt(matches[1], 10);
		}
		matches = acstring.match(/\)\s*?(.*)/);
		if (matches && matches[1]) {
			acMap.note = matches[1];
		}
		//get ability modifier, should be Dex by default.
		matches = acstring.match(/([+\-]??\d+)\s*?Dex/i);
		if (matches && matches[1]) {
			acMap.dex = parseInt(matches[1],10)||0;
			//if different then set, compendium error no minus
			// see Fire Giant.
			if (abilityMod !== acMap.dex) {
				acMap.dex = abilityMod;
			}
		} else {
			matches = acstring.match(/([+\-]??\d+)\s*?(Wis|Int|Str|Con|Cha)/i);
			if (matches && matches[1] && matches[2]) {
				acMap.dex = parseInt(matches[1], 10) || 0;
				//should not happen anymore since 6th printing of PRD they removed abilities that change ability to AC, now
				// just add dodge instead.
				acMap.altability = matches[2].toUppercase();
			}
		}
		//check total for any other (untyped, Luck, Sacred/Profane, Circumstance, Enhancement, Insight, Morale)
		//touch - if touch does not add up put difference in misc. (AC not match we'll put in a buff row)
		// we need to track a seperate ac misc buff/penalty. we can put it in buffs.
		tempnum = acMap.dodge + acMap.dex + acMap.deflect + acMap.size + 10;
		if (acMap.touch !== tempnum) {
			acMap.misc = (acMap.touch - tempnum);
		}
		//if AC does not add up, even including misc found above, then put it in ac buff row.
		tempnum = acMap.armor + acMap.shield + acMap.dodge + acMap.dex + acMap.natural + acMap.deflect + acMap.size + acMap.misc + 10;
		if (acMap.ac !== tempnum) {
			acMap.acbuff = (acMap.ac - tempnum);
		}
		//check for not caught flat footed
		if (acMap.ac === acMap.ff && (acMap.dex > 0 || acMap.dodge > 0)) {
			acMap.uncanny = 1;
		}
	} catch (err){
		TAS.error("parseNPCAC",err);
	} finally {
		return acMap;
	}
}
/* parseSpeed -returns object with speeds {land:base,fly:xx,swim:xx} etc*/
function parseSpeed (speedstr) {
	var speeds = speedstr.split(/,\s*/),
	retobj;
	retobj = _.reduce(speeds, function (memo, speedComponent, idx) {
		var matches,
		speedNum = 0;
		try {
			if (idx === 0) {
				speedNum = parseInt(speedComponent.match(/(\d+)/)[1], 10) || 0;
				if (speedNum) {
					memo["land"] = speedNum;
				}
			} else {
				matches = speedComponent.match(/([\w]+)\s*(\d+)/);
				if (matches) {
					speedNum = parseInt(matches[2], 10) || 0;
					if (speedNum) {
						memo[matches[1].toLowerCase()] = speedNum;
						if (/fly/i.test(matches[1])) {
							matches = speedComponent.match(/\(([\w]+)\)/);
							if (matches && matches[1].length > 0) {
								memo["flyability"] = matches[1];
							}
						}
					}
				}
			}
		} catch (err) {
			TAS.error("parseSped", err);
		} finally {
			return memo;
		}
	}, {});
	return retobj;
}
/* getAtkNameFromStr get names of an attack or special attack
 * { Name :(full str up to first parens) , abilityName (without pluses the base ability ), basename (ability name lower case no spces)}
 * for instance: Mwk Longsword +6/+1 would be : {name:Mwk longsword +6/+1, abilityName:Longsword, basename: longsword}
 */
function getAtkNameFromStr (abilitystr) {
	var matches = abilitystr.match(/^\s*([^\(]+)/),
	name = '',
	abilityName = '',
	basename = '';
	if (matches && matches[1]) {
		name = (matches[1]);
		name = SWUtils.trimBoth(name);
		abilityName = name.replace(/\d+d\d+|\-\d+|\+|\d+|\//g, '');
		abilityName = SWUtils.trimBoth(abilityName);
		abilityName = abilityName[0].toUpperCase() + abilityName.slice(1);
		basename = abilityName.toLowerCase();
		basename = basename.replace(/ray|cone|aura|mwk/ig, '');
		basename = basename.replace(/\s+/g, '');
	}
	return {
		'name': name,
		'basename': basename,
		'abilityName': abilityName
	};
}
/*parseReach - parses reach string from compendium or statblock
 * returns the default reach, rest of the string (if any), and an array of exceptions and reaches if any.
 *  (for instance, diplodacus
 * @returns = {reach:number (5,10,15 etc), reachNotes:"rest of string", reachExceptions:[['Bite':10],['Claw':5]]}
 */
function parseReach (reachStr) {
	var numerator = 0,
	denominator = 1,
	tempInt = 0,
	tempFloat = 0.0,
	tempstr,
	restOf = "",
	matches,
	exceptionstr = "",
	tempArray = [],
	reachExceptions = [],
	retobj = {
		reach: 5,
		reachNotes: "",
		reachExceptions: []
	};
	if (!reachStr) {
		return null;
	}
	reachStr = reachStr.replace(/^\s+|\s+$/g, '');
	if (reachStr.slice(0, 5) === "2-1/2" || reachStr.slice(0, 4) === "21/2") {
		retobj.reach = 2.5;
		exceptionstr = reachStr.slice(5);
	} else {
		matches = reachStr.match(/^\s*(\d*\.?\d*)?\s*(.*)\s*$/);
		if (matches) {
			tempFloat = parseFloat(matches[1]);
			restOf = matches[2];
			if (!/\(|;/.test(reachStr) && /with/i.test(reachStr)) {
				retobj.reach = 5;
				exceptionstr = reachStr;
			} else {
				retobj.reach = tempFloat;
			}
			if (restOf && restOf.length > 0) {
				exceptionstr = restOf;
			}
		} else {
			exceptionstr = reachStr;
		}
	}
	if (exceptionstr) {
		exceptionstr = exceptionstr.replace('(', '').replace(')', '').replace(';', '').replace(/ft\./ig, '').replace(/ft/ig, '').replace(/^\s+|\s+$/g, '');
	}
	if (exceptionstr) {
		retobj.reachNotes = exceptionstr;
		tempstr = exceptionstr.toLowerCase().replace(/with\s/ig, '');
		tempArray = tempstr.split(/,\s*/);
		reachExceptions = _.reduce(tempArray, function (memo, exceptioninstance) {
			var reachExceptions = [],
			matches;
			if (!exceptioninstance) {
				return memo;
			}
			//not necessary since changed split(',') to split(/,\s*/)
			//exceptioninstance = exceptioninstance.replace(/^\s+|\s+$/g, '');
			if (exceptioninstance.slice(0, 5) === "2-1/2" || exceptioninstance.slice(0, 4) === "21/2") {
				tempstr = exceptioninstance.slice(5);
				if (tempstr) {
					reachExceptions.push(tempstr.replace(/^\s+|\s+$/g, ''));
					reachExceptions.push(2.5);
					memo.push(reachExceptions);
				}
			} else {
				matches = exceptioninstance.match(/(\d+)\s*(.*)/);
				if (matches) {
					reachExceptions.push(matches[2].replace(/^\s+|\s+$/g, ''));
					reachExceptions.push(matches[1]);
					memo.push(reachExceptions);
				}
			}
			return memo;
		}, []);
		if (reachExceptions && reachExceptions.length > 0) {
			retobj.reachExceptions = reachExceptions;
		}
	}
	return retobj;
}
function getCreatureClassSkills (creatureType) {
	var typeToCheck = creatureType.toLowerCase().replace(/\s/g, ''),
	classSkills,
	subSkills;
	try {
		subSkills = _.find(PFDB.creatureTypeClassSkills, function (skills, mainType) {
			var reg = new RegExp(mainType);
			return reg.test(typeToCheck);
		});
		if (subSkills && subSkills.length > 0) {
			classSkills = subSkills;
		}
		subSkills = _.find(PFDB.creatureSubtypeClassSkills, function (skills, mainType) {
			var reg = new RegExp(mainType);
			return reg.test(typeToCheck);
		});
		if (subSkills) {
			if (classSkills) {
				classSkills = classSkills.concat(subSkills);
			} else {
				classSkills = subSkills;
			}
		}
	} catch (err) {
		TAS.error("parseCreatureClassSkills", err);
	} finally {
		if (classSkills) {
			return classSkills;
		}
		return [];
	}
}
/* assignPrimarySecondary
 * to each attack in array, assigns attack.naturaltype='primary|secondary' and sometimes attack.dmgMult=1.5
 * returns attacks for chaining.
 */
function assignPrimarySecondary (attacks) {
	var attackGroups,
	attacksToCheck = _.filter(attacks, function (attack) {
		return (attack.type === 'natural');
	});
	if (_.size(attacksToCheck) <= 0) {
		return attacks;
	}
	if (_.size(attacksToCheck) === 1) {
		attacksToCheck[0].naturaltype = 'primary';
		if((attacksToCheck[0].iter && attacksToCheck[0].iter.length ===1) || isNaN(parseInt(attacksToCheck[0].iter,10))){
			attacksToCheck[0].dmgMult = 1.5;
		}
	} else {
		attackGroups = _.groupBy(attacksToCheck, function (attack) {
			return PFDB.primaryNaturalAttacksRegExp.exec(attack.name);
		});
		if (_.size(attackGroups) === 1) {
			_.each(attacksToCheck, function (attack) {
				attack.naturaltype = 'primary';
			});
		} else {
			_.each(attacksToCheck, function (attack) {
				if (PFDB.primaryNaturalAttacksRegExp.test(attack.name)) {
					attack.naturaltype = 'primary';
				} else {
					attack.naturaltype = 'secondary';
				}
			});
		}
	}
	return attacks;
}
/*buildImportantFeatObj - saves feats that require updates to the sheet in an object, no spaces and all lowercase.
 * returns sub objects for feats that only apply to certain attacks, and a criticaldamage subobject.
 * for instance:::  obj.weaponfinesse=1 obj.criticaldamage.bleedingcritical:1 obj.longsword.weaponfocus:1
 * @returns object of feats   as  {featname:1,feat2name:1, attacks:{attack1name:{featname:1}}, criticaldamage:{featname:1}}
 */
function buildImportantFeatObj (featlist) {
	return _.chain(featlist)
	.filter( function(feat){if (!feat) {return false;} return true;})
	.filter( function (feat) {
		return PFDB.importantFeatRegExp.test(feat);
	})
	.map(function(feat){
		
		TAS.debug("checking <" + feat + "> for ending letter");
		//if there is an "endnote" letter indicator at the end then remove it
		feat = SWUtils.trimBoth(feat);
		if ((/\b[A-Z]$/i).test(feat)) {
			feat = feat.slice(0,-2);
			feat=SWUtils.trimBoth(feat);
		}
		return feat;
	})
	.reduce(function (memo, feat) {
		var origfeat = feat,
		atktype = "",
		matches,
		attacks = {},
		attack = {},
		crits = {},
		skills = {},
		skill = "";
		try {
			if (feat.indexOf('(') >= 0) {
				matches = /(.*?)\((.*)\)/.exec(feat);
				feat = matches[1];
				atktype = matches[2];
				feat = SWUtils.trimBoth(feat);
				atktype = SWUtils.trimBoth(atktype);
			}
			feat = feat.replace(/\s/g, '').toLowerCase();
			if (feat === 'improvedcritical' || feat === 'criticalmastery') {
				return memo;
			}
			if (feat.indexOf('critical') > 0) {
				atktype = feat;
				feat = "criticaldamage";
			} else if (feat.indexOf('skillfocus') >= 0) {
				skill = atktype.replace(' ', '-');
				skill = skill[0].toUpperCase() + skill.slice(1);
			}
			memo[feat] = 1;
			switch (feat) {
				case 'weaponfinesse':
				case 'improvedcritical':
					if (memo.attacks) {
						attacks = memo.attacks;
					}
					if (attacks[atktype]) {
						attack = attacks[atktype];
					}
					attack[feat] = 1;
					attacks[atktype] = attack;
					memo.attacks = attacks;
					break;
				case 'criticaldamage':
					if (memo.criticaldamage) {
						crits = memo.criticaldamage;
					}
					crits[atktype] = 1; //or put sickening?
					memo.criticaldamage = crits;
					break;
				case 'skillfocus':
					if (memo.skillfocuses) {
						skills = memo.skillfocuses;
					}
					if (skill) {
						skills[skill] = 1;
						memo.skillfocuses = skills;
					} 
					break;
			}
		} catch (err) {
			TAS.error("buildImportantFeatObj error:", err);
			memo[feat] = 1;
		} finally {
			return memo;
		}
	}, {}).value();
}
function parseAttack (atkstr, atktypestr, addgroups, groupidx, isUndead) {
	var matches, currpos = 0, name = "", iteratives, i = 0, tempInt = 0,
		beforeBetweenAfterParens, bonus = "", origStr = atkstr, countspaces = 0, specCMB = 0,
		abilityBaseName = '', tempstr = "", tempidx = 0, names, attackdescs,
	retobj = {
		enh: 0,
		mwk: 0,
		name: "",
		basename: "",
		atktype: "melee",
		type: "",
		range: "",
		countFullBAB: 1,
		iter: [],
		dmgdice: 0,
		dmgdie: 0,
		dmgtype: "",
		crit: 20,
		critmult: 2,
		dmgbonus: 0,
		plus: "",
		plusamount: "",
		plustype: "",
		note: ""
	};
	try {
		//TAS.debug"parseAttack: "+atkstr);
		if (addgroups) {
			//retobj.name += "Group " + groupidx + ": ";
			retobj.group = 'Full attack ' + groupidx;
		}
		names = getAtkNameFromStr(atkstr);
		retobj.name += names.name;
		retobj.basename = names.basename;
		atkstr = SWUtils.trimBoth(atkstr);
		//if stars with #, it means number of attacks
		matches = atkstr.match(/^(\d+)\s*/);
		if (matches && matches[1]) {
			retobj.countFullBAB = parseInt(matches[1], 10) || 1;
			atkstr = atkstr.slice(matches[0].length);
			//retobj.name += (matches[1] + " ");
		}
		//starts with +number(enh) or mwk
		matches = atkstr.match(/^([+\-]\d+)\s*|^(mwk)\s*/i);
		if (matches) {
			//starts with +n, is weapon
			//retobj.name += matches[0];
			if (matches[1]) {
				retobj.enh = parseInt(matches[1], 10) || 0;
			} else if (matches[2] && (/mwk/i).test(matches[2])) {
				retobj.mwk = 1;
			}
			retobj.type = "weapon";
			atkstr = atkstr.slice(matches[0].length);
		}
		if (PFDB.cmbPlusStrsrch.test(retobj.basename)) {
			retobj.atktype = 'cmb';
			retobj.vs = 'cmd';
			retobj.type = 'natural';
			specCMB = 1;
		} else if (atktypestr === 'melee' && PFDB.combatManeuversRegExp.test(retobj.basename)) {
			retobj.atktype = 'cmb';
			retobj.vs = 'cmd';
		} else if (PFDB.cmbMonsterSrch.test(retobj.basename)) {
			retobj.atktype = 'cmb';
			retobj.type = 'natural';
			retobj.vs = 'cmd';
		} else if ((/web/i).test(retobj.basename)) {
			retobj.atktype = 'ranged';
			retobj.type = 'special';
			retobj.vs = 'touch';
			retobj.range = 10;
		} else if ((/touch/i).test(retobj.basename)) {
			if ((/ranged/i).test(retobj.basename)) {
				retobj.atktype = 'ranged';
			} else {
				retobj.atktype = 'melee';
			}
			retobj.vs = 'touch';
		} else if ((/special/i).test(atktypestr)) {
			retobj.atktype = 'special';
			retobj.type = 'special';
		} else {
			retobj.atktype = atktypestr;
		}
		if (!retobj.type) {
			if (PFDB.naturalAttackRegExp.test(retobj.basename)) {
				retobj.type = "natural";
			} else if (PFDB.unarmedAttacksRegExp.test(name)) {
				retobj.type = "unarmed";
			} else {
				retobj.type = "weapon";
			}
		}
		if (!retobj.vs) {
			if ((/touch|web/i).test(retobj.name)) {
				retobj.vs = 'touch';
				if ((/ranged|web/i).test(retobj.name)) {
					retobj.atktype = 'ranged';
					if ((/web/i).test(retobj.basename)) {
						retobj.range = 10;
					}
				}
			}
		}
		//skip past name
		//if the attack value is -n, then it may skip past the- and go to n
		// for compendium treated as -n, for statblock results in +n
		matches = atkstr.match(/\s*([^0-9+\/\+\(]+)/);
		if (matches && matches[0]) {
			if (matches.index) {
				tempidx = matches.index;
			}
			atkstr = atkstr.slice(tempidx + matches[0].length);
		}
		if (atkstr) {
			//after name split rest by parenthesis
			// format: name   attack bonus ( damage ) plus additional
			beforeBetweenAfterParens = atkstr.split(/\(|\)/);
			//attack amounts before paren
			iteratives = beforeBetweenAfterParens[0].split(/\//);
			if ((/\d/).test(iteratives[0])) {
				retobj.iter = _.map(iteratives, function (iter, index) {
					if (/^[+\-]/.test(iter)) {
						return parseInt(iter, 10) || 0;
					}
					//minus missing assume minus
					return -1 * (parseInt(iter, 10) || 0);
				});
			} else if (retobj.atktype === 'cmb') {
				retobj.iter[0] = 0;
			}
			//damage between parens
			if (beforeBetweenAfterParens[1]) {
				attackdescs = beforeBetweenAfterParens[1].split(/,\s*/);
				//split on commas and strip out non damage, put damage in tempstr
				tempstr = _.reduce(attackdescs, function (memo, subattack) {
					if ((/ft\./i).test(subattack)) {
						retobj.range = subattack;
					} else if (/D[Cc]\s\d+/.test(subattack)) {
						matches = subattack.match(/(D[Cc]\s\d+)/);
						retobj.DC = matches[1].toUpperCase();
						retobj.DCability= PFDB.specialAttackDCAbilityBase[retobj.basename]||'CON';
						if (isUndead && retobj.DCability === 'CON'){
							retobj.DCability='CHA';
						}
						retobj.dcequation = PFUtils.getDCString(retobj.DCability, 'npc-hd-num', isUndead);
					} else if ((/freq|day|constant|at.will/i).test(subattack)) {
						retobj.frequency = subattack;
					} else if ((/AC|hp/).test(subattack) || !(/\d|plus/).test(subattack)) {
						//if no number or 'plus' don't know what to do so stick it in note.
						retobj.note += subattack + ', ';
					} else {
						memo += subattack + ' ';
					}
					return memo;
				}, "");
				//TAS.debug"now left with :"+tempstr);
				// find damage
				//damage dice and die
				matches = tempstr.match(/^(\d+)d(\d+)\s*/i);
				if (matches) {
					if(matches[1]){
						retobj.dmgdice = parseInt(matches[1], 10) || 0;
					}
					if(matches[2]){
						tempInt = parseInt(matches[2], 10) || 0;
					}
					//compendium bug no minus:
					if ( (tempInt!==3 && tempInt % 2) || tempInt > 12) {
						retobj.dmgdie = Math.floor(tempInt / 10);
						retobj.dmgbonus = -1 * (tempInt % 10);
					} else {
						retobj.dmgdie = tempInt;
					}
					tempstr = tempstr.slice(matches[0].length);
				}
				if(!retobj.dmgbonus) {
					//flat damage
					matches = tempstr.match(/^([+\-]??\d+)\s*/);
					if(specCMB){ 
						TAS.debug("#####Parse attack damage dice looking for bonus: ",bonus, matches )
					}
					if (matches) {
						//flat number
						retobj.dmgbonus = parseInt(matches[1], 10) || 0;
						bonus = tempstr.slice(matches[0].length);
						//bonus = beforeBetweenAfterParens[1].slice(matches[1].length);
					} else {
						bonus = tempstr;
					}
				} else {
					bonus = tempstr;
				}
				//any text after damage is 'plus' or damage type
				if (bonus) {
					//if engulf or swallowwhole, there will be inner AC and hp to put in notes
					if (specCMB){
						matches = bonus.match(/\sac\s\d+/i);
						if(matches){
							retobj.note+=bonus.slice(matches.index);
							bonus = SWUtils.trimBoth(bonus.slice(0,matches.index));
						}
					}
					//look for plus
					matches = bonus.match(/plus(.*)/i);
					if (matches) {
						tempstr = SWUtils.trimBoth(matches[1]);
						bonus = SWUtils.trimBoth(bonus.slice(0, matches.index));
						if (/\d+d\d+/i.test(tempstr)) {
							matches = tempstr.match(/(\d+d\d+)\s*([\w\s]*)/);
							retobj.plusamount = matches[1];
							if (matches[2]) {
								retobj.plustype = matches[2].replace(/^\s+|\s+$/g, '');
							}
						} else {
							retobj.plus = tempstr;
						}
					}
					//matches = bonus.match(/\s|\//g);
					//if (matches) {
					//	countspaces = matches.length - 1;
					//}
					if (retobj.dmgbonus === 0) {
						matches = bonus.match(/\s|\//g);
						if (matches) {
							countspaces = matches.length - 1;
						}
						matches = bonus.match(/(x\d+)|(\/\d+\-??20)|([+\-]??\d+)/ig);
						_.each(matches, function (match, index) {
							bonus = bonus.slice(match.length);
							if (/^[+\-]/.test(match)) {
								retobj.dmgbonus = (parseInt(match, 10) || 0);
							} else if (/^[x\u00d7]\d+/.test(match)) {
								match = match.slice(1);
								retobj.critmult = parseInt(match, 10) || 2;
							} else if (/^\d+/.test(match)) {
								//minus missing
								retobj.dmgbonus = ((-1) * (parseInt(match, 10) || 0));
							} else if (match.indexOf('20') >= 0) {
								match = match.replace('20', '').replace('-', '').replace('/', '');
								if (match && match.length > 0) {
									retobj.crit = parseInt(match, 10) || 20;
								}
							}
						});
						bonus = bonus.slice(countspaces);
					}
					if (bonus && bonus.length > 0) {
						retobj.dmgtype += bonus;
					}
				}
				if (retobj.atktype !== 'cmb' && !retobj.iter[0] && retobj.dmgtype && retobj.dmgdice && retobj.dmgdie && !retobj.plusamount && !retobj.plustype && (!(/bludg|slash|pierc/i).test(retobj.dmgtype))) {
					retobj.plustype = retobj.dmgtype;
					tempstr = String(retobj.dmgdice) + "d" + String(retobj.dmgdie);
					if (retobj.dmgbonus) {
						if (retobj.dmgbonus > 0) {
							tempstr += "+" + retobj.dmgbonus;
						} else {
							tempstr += "-" + Math.abs(retobj.dmgbonus);
						}
					}
					retobj.plusamount = tempstr;
					retobj.dmgtype = "";
					retobj.dmgdice = 0;
					retobj.dmgdie = 0;
				}
			}
			//any notes at end
			i = 2;
			while (i < beforeBetweenAfterParens.length) {
				//can use filter then reduce, or use each, or use easy for loop.
				retobj.note += SWUtils.trimBoth(beforeBetweenAfterParens[i]);
				i++;
			}
		}
		if (retobj.note) {
			retobj.note = SWUtils.trimBoth(retobj.note);
		}
	} catch (err) {
		TAS.error("parseAttack: error parsing:" + atkstr, err);
		if (retobj.name) {
			retobj.name += " ";
		}
		retobj.name += "Could not parse attack!";
		retobj.note = origStr + " , error: ";
		retobj.note += err;
	} finally {
		return retobj;
	}
}
/** parseAttacks parse atttack string one at a time, returns arrays grouped by full attacks
 * attacks split by commas, full attack groups split by 'or'
 * the name of the attack starts with Group 0, Group 1, etc.
 * @param {string} atkstr
 * @param {string} atktypestr "melee" or "ranged"
 * @returns {[{enh:0,mwk:0,name:"",atktype:"melee",type:"",countFullBAB:1,plus:"",plusamount:"",plustype:"",note:"",iter:[],dmgdice:0,dmgdie:0,crit:20,critmult:2,dmgbonus:0}]}
 */
function parseAttacks (atkstr, atktypestr, cmbval) {
	var atkarrayout,
	atkarraysub,
	attacksouter,
	addgroups = false;
	atkarrayout = atkstr.split(/\sor\s/i);
	if (atkarrayout.length > 1) {
		addgroups = true;
	}
	attacksouter = _.reduce(atkarrayout, function (memoout, atkstrout, groupidx) {
		var atkarray = atkstrout.split(/,\s*(?![^\(\)]*\))/),
		attacks;
		if (atkarray.length > 1) {
			addgroups = true;
		}
		//TAS.debug('parseattacks outer group: ' + groupidx);
		attacks = _.reduce(atkarray, function (memo, atkstr) {
			var retobj;
			//TAS.debug('parseattacks: ' + atkstr);
			retobj = parseAttack(atkstr, atktypestr, addgroups, groupidx, cmbval);
			if (retobj) {
				memo.push(retobj);
			}
			return memo;
		}, []);
		return memoout.concat(attacks);
	}, []);
	return attacksouter;
}function parseSkillRacialBonuses (racialstr) {
	//abilitymods = modify default ability score for a skill
	var abilitieslower = _.map(PFAbilityScores.abilities, function (ab) {
		return ab.toLowerCase();
	}),
	allCoreSkillsLower = _.map(PFSkills.allCoreSkills, function (skill) {
		return skill.toLowerCase();
	}),
	skillsWithSubSkillsLower = _.map(PFSkills.skillsWithSubSkills, function (skill) {
		return skill.toLowerCase();
	}),
	skillsWithSpaces = PFSkills.skillsWithSpaces,
	temparray,
	modifiers = [],
	abilitymodstr = "",
	abilitymodlower = "",
	ability = "",
	setability = false,
	tempskill = "",
	matches,
	skillmods = {},
	skillnotes = [],
	abilitymods = {},
	retobj = {
		"skillmods": skillmods,
		"skillnotes": skillnotes,
		"abilitymods": abilitymods
	};
	if (!racialstr) {
		return retobj;
	}
	temparray = racialstr.split(';');
	if (temparray.length > 1) {
		racialstr = temparray[0];
		abilitymodstr = temparray[1];
	}
	if (abilitymodstr) {
		try {
			abilitymodlower = abilitymodstr.toLowerCase();
			ability = _.find(abilitieslower, function (ab) {
				return abilitymodlower.indexOf(ab) >= 0;
			});
			if (ability) {
				tempskill = _.find(allCoreSkillsLower, function (skill) {
					return abilitymodlower.indexOf(skill) >= 0;
				});
				if (tempskill) {
					abilitymods[tempskill[0].toUpperCase() + tempskill.slice(1)] = ability.toLowerCase();
					setability = true;
				}
			}
		} catch (err1) {
			TAS.error("parseSkillRacialBonuses inner", err1);
		}
		if (!setability) {
			skillnotes.push(abilitymodstr);
		}
	}
	modifiers = racialstr.split(/,\s*/);
	_.each(modifiers, function (modstr) {
		var modstrlower = modstr.toLowerCase(),
		mod = 0,
		moddedTitle,
		modded = "",
		tempstr = "",
		exceptionstr = "",
		conditionmod = 0,
		conditionstr = "",
		hasSubSkill = false,
		matches;
		try {
			matches = modstr.match(/\s*([+\-]\d+)\s*(?:on|to)?\s*([\w]+)\s*([\w\s]+)?\s*(\([^)]*\))?/);
			if (!matches) {
				//is an exception or note
				tempskill = _.find(allCoreSkillsLower, function (skill) {
					return modstrlower.indexOf(skill) >= 0;
				});
				if (tempskill) {
					ability = _.find(abilitieslower, function (ab) {
						return modstrlower.indexOf(ab) >= 0;
					});
					if (ability) {
						abilitymods[tempskill.toLowerCase()] = ability;
					} else {
						skillnotes.push(modstr);
					}
				} else {
					skillnotes.push(modstr);
				}
				return;
			}
			exceptionstr = matches[3];
			mod = parseInt(matches[1], 10) || 0;
			modded = matches[2];
			if (!_.contains(allCoreSkillsLower, modded.toLowerCase())) {
				//TAS.warn("does not match " + modded);
				// +8 Sleight of Hand
				tempskill = _.find(skillsWithSpaces, function (skill) {
					return modstrlower.indexOf(skill) >= 0;
				});
				if (!tempskill || tempskill.length < 1) {
					//not sure what this is
					skillnotes.push(modstr);
					return;
				}
				temparray = tempskill.split(/\s/);
				temparray = _.map(temparray, function (part) {
					if (part === "of") {
						return "of";
					}
					return part[0].toUpperCase() + part.slice(1);
				});
				modded = temparray.join('-');
				exceptionstr = exceptionstr.slice(tempskill.length - tempskill.indexOf(' ') + 1);
				TAS.debug("found skill with space converted to modded:"+modded+", exceptionstr:"+exceptionstr);
			}
			if (exceptionstr) {
				//entire thing is a "when" exception
				skillnotes.push(modstr);
				return;
			}
			moddedTitle = modded[0].toUpperCase() + modded.slice(1);
			if (!matches[4]) {
				skillmods[moddedTitle] = mod;
				return;
			}
			//if craft, knowledge, etc
			exceptionstr = matches[4].replace(/^\s+|\(|\)|\s+$/g, '');
			if (_.contains(skillsWithSubSkillsLower, modded.toLowerCase())) {
				exceptionstr = exceptionstr[0].toUpperCase() + exceptionstr.slice(1);
				if (modded.toLowerCase() === "knowledge") {
					moddedTitle += "-" + exceptionstr;
				} else {
					moddedTitle += "[" + exceptionstr + "]";
				}
				skillmods[moddedTitle] = mod;
			} else {
				//has bonus
				matches = exceptionstr.match(/([+\-]\d+)\s(.*)$/);
				if (matches && matches[1]) {
					conditionmod = parseInt(matches[1], 10) || 0;
					if (matches[2]) {
						conditionstr = matches[2];
					}
					conditionmod = conditionmod - mod;
					skillmods[moddedTitle] = mod;
					tempstr = ((conditionmod > 0) ? "+" : "") + conditionmod + " " + moddedTitle + " " + conditionstr;
					skillnotes.push(tempstr);
				} else {
					skillnotes.push(modstr);
				}
			}
		} catch (err) {
			TAS.error("parseSkillRacialBonuses outer error", err);
			skillnotes.push(modstr);
		}
	});
	return retobj;
}
function parseSkills (skillstr) {
	var rawSkills = skillstr.match(/[\w][\w\s]+\s*(?:\([\w\s,]+\))?\s*[+\-]\d+[,]??/g),
	skills = _.reduce(rawSkills, function (memo, skill) {
		var matches = skill.match(/^([\w][\w\s]+[\w])\s*(\([\w\s,]+\))??([+\s]+\d+)$/),
		tempskill = "",
		tempval = 0,
		tempskill2 = "",
		subskills;
		if (matches) {
			tempval = parseInt(matches[3], 10) || 0;
			tempskill = matches[1].replace(/^\s+|\s+$/g, '');
			tempskill = tempskill[0].toUpperCase() + tempskill.slice(1);
			tempskill = tempskill.replace(/\s/g, '-');
			if (matches[2]) {
				subskills = matches[2].split(/,\s*/);
				_.each(subskills, function (subskill) {
					subskill = subskill.replace(/^\s+|,|\(|\)|\s+$/g, '');
					subskill = subskill[0].toUpperCase() + subskill.slice(1);
					if (tempskill === "Knowledge") {
						subskill = "-" + subskill;
					} else {
						subskill = "[" + subskill + "]";
					}
					memo[tempskill + subskill] = tempval;
				});
			} else {
				memo[tempskill] = tempval;
			}
		}
		return memo;
	}, {});
	return skills || {};
}
function parseAbilityScores (v) {
	var aS = {};
	aS.str = getAbilityAndMod(v["str_compendium"]);
	aS.dex = getAbilityAndMod(v["dex_compendium"]);
	aS.con = getAbilityAndMod(v["con_compendium"]);
	aS.wis = getAbilityAndMod(v["wis_compendium"]);
	aS['int'] = getAbilityAndMod(v["int_compendium"]);
	aS.cha = getAbilityAndMod(v["cha_compendium"]);
	return aS;
}
function parseSpecialAttack (setter,sastr) {
	var origsastr, names, tempstr, tempstr2, match, matches, parensplit,
	atktyp = 'special',baseability="",
	abilitytype="",
	isAttack = false,
	retobj = {};
	try {
		origsastr = sastr;
		names = getAtkNameFromStr(sastr);
		if (sastr.indexOf('(') >= 0) {
			if (PFDB.spAttackAttacksPreProcess.test(names.basename)) {
				//preprocess
				if ((/rake/i).test(names.basename)) {
					sastr = PFUtils.removeUptoFirstComma(sastr, true);
				} else if ((/rend/i).test(names.basename)) {
					sastr = PFUtils.removeUptoFirstComma(sastr);
				} else if ((/web/i).test(names.basename)) {
					sastr = PFUtils.removeUptoFirstComma(sastr, true);
					sastr = 'web ' + sastr;
					atktyp = 'ranged';
				}
				isAttack = true;
			} else if (PFDB.spAttackAttacks.test(names.basename)) {
				isAttack = true;
			}
		} else if ((/damage|drain|dmg/i).test(names.basename) && !(/blood|energy/i).test(names.basename) && PFDB.abilitySrch.test(names.basename)) {
			match = names.basename.match(/damage|drain/i);
			names.AbilityName = 'Ability ' + match[0];
			sastr = names.AbilityName + ' (' + sastr + ')';
			isAttack = true;
		}
		
		if (isAttack) {
			retobj = parseAttack(sastr, atktyp, false, 0);
			retobj.specialtype = 'attack';
			retobj.group = 'Special';
			retobj.name = (names.AbilityName && names.AbilityName.slice(0,7)==='Ability')?names.AbilityName:names.name;
			retobj.basename = names.basename;
		}
		if (!isAttack) {
			retobj.name = names.abilityName || names.name;
			retobj.basename = names.basename;
			retobj.specialtype = 'ability';
			retobj.rule_category="special-attacks";
			matches= (/usable\severy/i).exec(origsastr);
			if (matches){
				retobj.frequency='everyrounds';
				tempstr = origsastr.slice(matches.index+matches[0].length);
				tempstr2= PFUtils.getDiceDieString(tempstr);
				if (tempstr2){
					retobj.used=tempstr2;
					matches= tempstr.match(/rounds|days|minutes/i);
					if (matches){
						retobj.used += " "+ matches[0];
					}
				}
			}
			if(PFDB.specialAttackDCAbilityBase[retobj.basename]){
				retobj.DCability= PFDB.specialAttackDCAbilityBase[retobj.basename];
				if (parseInt(setter['is_undead'],10)===1 && retobj.DCability === 'CON'){
					retobj.DCability='CHA';
				}
			}
			retobj.shortdesc = PFUtils.replaceDCString(PFUtils.replaceDiceDieString(origsastr),
						retobj.DCability, 'npc-hd-num', setter.is_undead);
		}
		abilitytype=PFUtils.getSpecialAbilityTypeFromString(sastr);
		if (abilitytype) {
			retobj.ability_type=abilitytype;
		}
	} catch (err) {
		TAS.error("parseSpecialAttack", err);
	} finally {
		return retobj;
	}
}
function parseSpecialAttacks (setter,saString,cmb) {
	var retarray ;
	if (!saString) {
		return {};
	}
	retarray = saString.split(/,\s*(?![^\(\)]*\))/);
	return _.reduce(retarray, function (memo, sa) {
		var retobj,
		tempstr,
		names;
		try {
			retobj = parseSpecialAttack(setter,sa);
		} catch (err) {
			TAS.error("parseSpecialAttacks", err);
			retobj = {};
			retobj.name = sa;
			retobj.specialtype = 'ability';
			retobj.rule_category="special-attacks";
		} finally {
			memo.push(retobj);
			return memo;
		}
	}, []);
}
function parseSpecialAbilities (str) {
	var saObj = {}, initiallines, lines, extralines, contentstr,tempstr, lastLineIndex=0;
	saObj.description = [];
	saObj.specialAbilities = [];
	//We break on last period, 3 spaces, or newline that is before an (Su), (Ex), or (Sp) this because sometimes special abilities 
	// do not have newlines between them. (also go back to beginning of string if it's the first one)
	//also looks for  "words:" as first word after newline or period since some abilities are like that (dragons). (and sometimes spells does not have colon at end as in faerie dragon.)
	initiallines = str.split(/(?:\s\s\s|\r\n|^|[\.\n\v\f\r\x85\u2028\u2029])(?=\s*spells[:\s]|\s*[\w\s]+:|[^\.\v\r\n\x85\u2028\u2029]+(?:\(Su\):??|\(Ex\):??|\(Sp\):??))/i);
	//split the last one by newlines:
	if (_.size(initiallines>1)) {
		lastLineIndex = _.size(lines)-1 ;
		extralines = initiallines[lastLineIndex].split(/\s\s\s|\r\n|[\n\v\f\r\x85\u2028\u2029]/);
		if (_.size(extralines)>1){
			lines = initiallines.slice(0,lastLineIndex).concat(extralines);
		} 
	}
	if (!lines) {
		lines = initiallines;
	}
	lines = _.filter(lines,function(line){
		if(!line) {return false;}
		return true;
	});
	saObj = _.reduce(lines, function (memo, line) {
		var spObj = {}, trimmedline = '', splitter = '',tempstr='', startIdx, endIdx = -1, matches, abilitytype='',foundSpecialNoType=false;
		try {
			trimmedline = line.replace(/^[^\w]+|[^\w]+$/g, '');
			if (trimmedline) {
				matches = trimmedline.match(/\(Su\):??|\(Ex\):??|\(Sp\):??/i);
				if (!matches || matches === null){
					matches = trimmedline.match(/^Spells[:\s]|^[\w\s]+:/i);//first one only
					if (matches && matches[0].length<20 && PFDB.monsterRules.test(matches[0]) ) {
						foundSpecialNoType=true;
						spObj.name = SWUtils.trimBoth(matches[0].replace(':',''));
						startIdx =  matches[0].length+1;
						spObj.description = SWUtils.trimBoth(trimmedline.slice(startIdx));
						memo.specialAbilities.push(spObj);
					}
					if (!foundSpecialNoType && trimmedline.toLowerCase() !== 'special abilities') {
						//this is just part of the description
						memo.description.push(trimmedline);
					}
										
				} else if (matches && matches.index>0 ) {
					tempstr=trimmedline.slice(0,matches.index);
					spObj.name = SWUtils.trimBoth(tempstr);
					spObj.basename = spObj.name.replace(/\s/g,'').toLowerCase();
					spObj.rule_category='special-abilities';
					spObj.ability_type=matches[0][1].toUpperCase()+matches[0][2].toLowerCase();
					startIdx = matches.index + matches[0].length + 1;
					spObj.description = SWUtils.trimBoth(trimmedline.slice(startIdx));
					matches=spObj.description.match(/(\d+d\d+) (?:points of){0,1}(.*?) damage/i);
					if(matches){
						if(matches[1]){
							spObj.extraDamage = '[['+matches[1]+']]';
						}
						if (matches[2]){
							spObj.extraDamageType = matches[2];
						}
					} else {
						matches=spObj.description.match(/([a-z]) for (\d+d\d+) (rounds|minutes|hours|days)/i);
						if(matches){
							if(matches[2]){
								spObj.extraDamage = '[['+matches[2]+']] '+matches[3]||'';
							}
							if(matches[1]){
								spObj.extraDamageType = matches[1];
							}
						}
					}
					//before dc is usually 'the save'
					matches = spObj.description.match(/dc is (cha|con|wis|int|str|dex)[a-zA-Z]*.based/i);
					//TAS.debug"parseSpecialAbilities looking for DC ability it is: ",matches);
					if(matches && matches[1]){
						tempstr=matches[1].toUpperCase();
						spObj.DCability = tempstr;
						//TAS.debug"parseSpecialAbilities setting DC ability to "+tempstr);
					} else if(PFDB.specialAttackDCAbilityBase[spObj.basename]){
						spObj.DCability= PFDB.specialAttackDCAbilityBase[spObj.basename];
						//TAS.debug"parseSpecialAbilities setting DC ability to "+spObj.DCability+" based on "+ spObj.basename);
					}
					//bfore dc could be 'must make a', 'fails a'
					matches = spObj.description.match(/DC (\d+) (Will|Fort|Ref)[a-zA-Z]* save/i);
					if (matches){
						if(matches[1]){
							spObj.DC= matches[1];
						}
						if(matches[2]){
							tempstr=matches[2][0].toUpperCase()+ matches[2].slice(1).toLowerCase();
							spObj.save=tempstr;
						}
					} else {
						matches = spObj.description.match(/(Will|Fort|Ref)[a-zA-Z]* DC (\d+) ([^),.])/i);
						if (matches){
							if(matches[1]){
								tempstr=matches[1][0].toUpperCase()+ matches[1].slice(1).toLowerCase();
								spObj.save=tempstr;
								if (matches[3]){
									spObj.save += ' '+matches[3];
								}
							}
							if(matches[2]){
								spObj.DC=matches[2];
							}
						}
					}
					memo.specialAbilities.push(spObj);
				}
			}
		} catch (err) {
			TAS.error('parseSpecialAbilities error parsing: ' + line + ' error is' + err);
		} finally {
			return memo;
		}
	}, saObj);
	//TAS.debug("parseSpecialAbilities returning",saObj);
	return saObj;
}
function parseSpecialQualities (str){
	var matches, rawAbilities, saObjs=[];
	if (str){
		//TAS.debug("PFNPCParser.parseSpecialQualities: "+str);
		//skip over "SQ" in front
		matches = str.match(/^SQ[\s:]*/i);
		if (matches){
			str = str.slice(matches[0].length);
		}
		rawAbilities = str.split(/,\s*/);
		//TAS.debug("found the following:", rawAbilities);
		_.each(rawAbilities,function(ability){
			var saAb={},type="";
			saAb.name=ability;
			type=PFUtils.getSpecialAbilityTypeFromString(ability);
			if(type){
				saAb.ability_type=type;
			}
			saAb.rule_category='special-qualities';
			saObjs.push(saAb);
		});
		//TAS.debug"returning ", saObjs);
		return saObjs;
	}
	return null;
}
function parseSLAs (spLAstr) {
	var lines, clname = '', lastFreq = '', tempstr='', lastPerDay = 0, slas = {};
	try {
		slas.spellLikeAbilities = [];
		slas.CL = 0;
		slas.concentration = 0;
		slas.classname = "";
		lines = spLAstr.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
		_.each(lines, function (line) {
			var matches, slatdivider, SLAArray, freqStr = "", slaofTypeStr = "", thisSlaObj = {},rawDC=0, tempstr2='',
			slatype = "", numPerDay = 0, slasOfType, header=0, row=0, hasSpellLevel=0, freqIsPer=0, tempsplit;
			try {
				//TAS.debug"parsing "+line);
				if ((/CL\s*\d+/i).test(line) || (/concentrat/i).test(line) ||
				(/psychic\smagic/i).test(line) || (/spell.like.abilit/i).test(line)) {
					header=1;
				} else if ((/\u2013|\u2014|-/).test(line)) {
					row = 1;
				} 
				if (header){
					if ((/CL\s*\d+/i).test(line)) {
						matches = line.match(/CL\s*(\d+)/i);
						if (matches[1]) {
							slas.CL = parseInt(matches[1], 10) || 0;
						}
					}
					if ((/concentrat/i).test(line)) {
						matches = line.match(/concentrat[\w]*\s*[+\-]??(\d+)/i);
						if (matches[1]) {
							slas.concentration = parseInt(matches[1], 10) || 0;
						}
					}
					if ((/psychic\smagic/i).test(line)) {
						slas.classname = 'Psychic Magic';
					} else {
						slas.classname = 'Spell-like abilities';
					}
				} else if (row) {
					//TAS.debug"splitting line "+line);
					matches = line.match(/\u2013|\u2014|\-/);
					slaofTypeStr = line.slice(matches.index+1);
					freqStr = SWUtils.trimBoth(line.slice(0,matches.index)).toLowerCase();
					matches = freqStr.match(/constant|will|day|month/i);
					if (matches && matches[0]) {
						slatype = matches[0].toLowerCase();
						thisSlaObj.type = slatype;
						if (slatype === 'day' || slatype==='month') {
							freqIsPer=1;
							matches = freqStr.match(/\d+/);
							if (matches && matches[0]) {
								numPerDay = parseInt(matches[0], 10) || 0;
								thisSlaObj.perDay = numPerDay;
							}
						}
					} else {
						tempsplit = freqStr.split('/');
						if (tempsplit.length>=2){
							freqIsPer=1;
							matches = tempsplit[0].match(/\d+/);
							if (matches && matches[0]) {
								numPerDay = parseInt(matches[0], 10) || 0;
								thisSlaObj.perDay = numPerDay;
							}
							slatype='other';
							thisSlaObj.type = slatype;
							thisSlaObj.otherPer=tempsplit[1];
						}
					}
					//TAS.debug"the frequency is " + slatype + " and are " + numPerDay + " per that");
					slasOfType = slaofTypeStr.split(/,\s*(?![^\(\)]*\))/);
					SLAArray = _.reduce(slasOfType, function (memo, sla) {
						var thissla = {}, dcstr = '';
						try {
							thissla.type = slatype;
							if (freqIsPer && numPerDay > 0) {
								thissla.perDay = numPerDay;
							}
							//look for spell level.
							matches = sla.match(/level\s*(\d+)/i);
							if (matches){
								if (matches[1]){
									//TAS.debug"spell level match on "+ sla+ " Is " + matches[1]);
									thissla.spell_level = parseInt(matches[1],10)||0;
									hasSpellLevel=1;
								}
								sla = sla.replace(matches[0],'');
							}

							matches = sla.match(/D[Cc]\s*\d+/);
							if (matches){
								tempstr2 = sla.replace(matches[0],'');
								tempstr =matches[0].match(/\d+/);
								rawDC=parseInt(tempstr,10)||0;
								thissla.DC = rawDC;
								matches = tempstr2.match(/\b(fortitude|willpower|reflex|fort|will|ref)\b([^,]+,)/i);
								if(matches){
									thissla.save=matches[0]; //type of save up to first comma after it
								}
								
							}
							//if parenthesis, name should be only what is in parens,
							if (sla.indexOf('(')>0){
								thissla.name= sla.slice(0,sla.indexOf('(')-1);
								tempstr = sla.slice(sla.indexOf('(')-1);
								//sla= tempstr;
								//summon spells have levels
								thissla.shortdesc = tempstr;
							} else {
								thissla.name = sla;
							}
							if (thissla.spell_level && (/^summon/i).test(thissla.name )){
								thissla.name += " Level "+ String(thissla.spell_level);
							}
							memo.push(thissla);
						} catch(errslain){
							TAS.error("parseSLAs, error reducing to SLAArray for: "+sla ,errslain);
							if(!thissla.name){
								thissla.name= sla;
							} else {
								thissla.description=sla;
							}
							memo.push(thissla);
						} finally {
							return memo;
						}
					}, []);
					if (SLAArray && _.size(SLAArray) > 0) {
						thisSlaObj.type = slatype;
						if (freqIsPer && numPerDay > 0) {
							thisSlaObj.perDay = numPerDay;
						}
						thisSlaObj.SLAs = SLAArray;
						slas.spellLikeAbilities.push(thisSlaObj);
					}
				} else {
					TAS.warn("Cannot parse " + line);
					return;
				}
			} catch (ierr) {
				TAS.error("parseSLAs error parsing" + line, ierr);
			}
		});
	} catch (err) {
		TAS.error("parseSLAs", err);
	} finally {
		if (slas.spellLikeAbilities && _.size(slas.spellLikeAbilities) > 0) {
			return slas;
		}
		return null;
	}
}
/** parseSpells - parses spell string from compendium and returns js object
 *@param {string} spellstr the block of spells known text ex: "Sorcerer Spells Known (CL 8th)\r\n3rd (3/day)-Fireball (DC12)," etc
 *@returns {jsobject} {classname:"name",CL:#,concentration:#,
 * spells:{
 *	0:[{name:spellname,DC:#}],
 *   1:[{name:spellname},{name:spellname}]
 * }}
 */
function parseSpells (spellstr) {
	var lines, spells = {};
	spells.classLevel = -1;
	spells.concentration = -1;
	spells.classname = "";
	spells.spellsByLevel = [];

	if (!spellstr) {
		return null;
	}
	lines = spellstr.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
	spells = _.reduce(lines, function (omemo, line) {
		var matches,
		spellarray,
		slatdivider,
		splittedSpells,
		dcstr,
		tempstr, 
		temparray=[],
		match,
		thislvl = {},
		slasOfType;
		thislvl.perDay = -1;
		thislvl.spellLevel = -1;
		try {
			if (spells.classLevel === -1 && (/C[Ll]\s*\d+/i).test(line)) {
				matches = line.match(/C[Ll]\s*(\d+)/i);
				if (matches && matches[1]) {
					spells.classLevel = parseInt(matches[1], 10) || 0;
				}
				matches = line.match(/concentrat[\w]*\s*[+\-]??(\d+)/i);
				if (matches && matches[1]) {
					spells.concentration = parseInt(matches[1], 10) || 0;
				}
				matches = line.match(/([\w\s]*)spells\sknown/i);
				if (matches && matches[1]) {
					spells.classname = matches[1].replace(/^\s|\s$/g, '');
					spells.classname = spells.classname[0].toUpperCase() + spells.classname[1];
				}
			} else {
				//look for endash, emdash, or dash
				slatdivider = line.split(/\u2013|\u2014|-/);
				if (slatdivider && slatdivider[0]) {
					matches = slatdivider[0].match(/^(\d+)/);
					if (matches && matches[1]) {
						thislvl.spellLevel = parseInt(matches[1], 10) || 0;
						matches = slatdivider[0].match(/(\d+)\/day/i);
						if (matches && matches[1]) {
							thislvl.perDay = parseInt(matches[1], 10) || 0;
						}
					} else {
						match = slatdivider[0].match(/opposition schools\s*/i);
						if (match) {
							tempstr = slatdivider[0].slice(match.index + match[0].length);
							spells.oppositionschools = tempstr;			
						} else {
							//stuff is here but what? add to notes
							spells.spellnotes = slatdivider[0];
						}
					}
				}
				if (slatdivider && slatdivider[1]) {
					splittedSpells = slatdivider[1].split(',');
					spellarray = _.reduce(splittedSpells, function (memo, spell) {
						var thisspell = {};
						try {
							matches = spell.split(/\(dc/i);
							thisspell.name = matches[0].replace(/^\s|\s$/g, '');
							if (matches[1]) {
								dcstr = matches[1];
								matches = dcstr.match(/\d+/);
								if (matches && matches[0]) {
									thisspell.DC = parseInt(matches[0], 10) || 0;
								}
							}
							memo.push(thisspell);
						} catch (errinner) {
							TAS.error("PFNPCParser.parseSpells errinner:",errinner);
						}
						finally {
							return memo;
						}
					}, []);
					if (thislvl.spellLevel >= 0 && spellarray && spellarray.length > 0) {
						thislvl.spells = spellarray;
						omemo.spellsByLevel.push(thislvl);
					}
				}
			}
		} catch (err) {
			TAS.error("PFNPCParser.parseSpells",err);
		}
		finally {
			return omemo;
		}
	}, spells);
	return spells;
}
function parseSpace (spaceStr) {
	var retstr = spaceStr,
	matches,
	tempFloat;
	try {
		matches = spaceStr.match(/\s*(\d*\.?\d*)?/);
		if (matches) {
			tempFloat = parseFloat(matches[1]);
			if (!isNaN) {
				retstr = String(tempFloat);
			}
		}
	} finally {
		return retstr;
	}
}
function getCasterObj (spellObj, abilityScores, healthObj, isSLA) {
	var caster = {};
	if (!spellObj || !abilityScores || !healthObj) { return null; }
	try {
		//TAS.debug"getCasterObj spellObj,abilities,health are:", spellObj, abilityScores, healthObj);
		caster.abilityMod = 0;
		caster.CL = 0;
		caster.concentrationBonus = 0;
		if (isSLA) {
			caster.classname = "Spell-like abilities";
			caster.ability = 'CHA';
			caster.abilityMod = abilityScores.cha.mod;
		} else {
			if (spellObj.classname) {
				caster.classname = spellObj.classname;
				if (PFDB.casterDefaultAbility[spellObj.classname] && abilityScores[PFDB.casterDefaultAbility[spellObj.classname]]) {
					caster.ability = PFDB.casterDefaultAbility[spellObj.classname].toUpperCase();
					caster.abilityMod = abilityScores[PFDB.casterDefaultAbility[spellObj.classname]].mod;
				}
			} else {
				//assume sorcerer
				caster.classname = 'Sorcerer';
				caster.ability = 'CHA';
				caster.abilityMod = abilityScores.cha.mod;
			}
		}
		if (spellObj.CL) {
			caster.CL = spellObj.CL;
		} else {
			//assume HD
			caster.CL = healthObj.hdice1;
		}
		if (spellObj.concentration) {
			caster.concentrationBonus = parseInt(spellObj.concentration, 10) - parseInt(caster.abilityMod, 10) - parseInt(caster.CL, 10);
		}
		if (spellObj.oppositionschools){
			caster.oppositionschools = spellObj.oppositionschools;
			spellObj.oppositionschools = null;
		}
		if (spellObj.spellnotes){
			caster.spellnotes = spellObj.spellnotes;
			spellObj.spellnotes = null;
		}
		
	} catch (err) {
		TAS.error("getCasterObj error trying to create obj returning null", err);
		caster = null;
	} finally {
		//TAS.debug"returning ", caster);
		return caster;
	}
}
function setCasterFields (setter, casterObj, classidx) {
	var alreadyPresent = false;
	try {
		//TAS.debug"setCasterFields");
		classidx = classidx || 0;
		if (classidx < 0) { classidx = 0; }
		if (setter["spellclass-" + classidx + "-name"] || setter["spellclass-" + classidx + "-level"]) {
			if (!(parseInt(setter["spellclass-" + classidx + "-level"], 10) === parseInt(casterObj.CL, 10) &&
				PFUtils.findAbilityInString(setter["Concentration-" + classidx + "-ability"]) === casterObj.ability.toUpperCase())) {
				classidx++;
			} else {
				alreadyPresent = true;
			}
		}
		if (classidx > 2) {
			TAS.error("Could not setCasterFields, 0,1,2 spellclasses already defined:" +
			setter["spellclass-0-name"] + ", " + setter["spellclass-1-name"] + ", " + setter["spellclass-2-name"], classidx);
			casterObj.pageClassIdx = -1;
		} else if (alreadyPresent) {
			setter["spellclass-" + classidx + "-name"] = setter["spellclass-" + classidx + "-name"] + " and " + casterObj.classname;
			casterObj.pageClassIdx = classidx;
		} else {
			setter["spellclass-" + classidx + "-name"] = casterObj.classname;
			//should add class here ? setter['class-'+what+'-name']
			setter["spellclass-" + classidx + "-level"] = casterObj.CL;//if they have hit dice, this will make it increase? not if we don'tdo class-x-level
			setter["spellclass-" + classidx + "-level-total"] = casterObj.CL;
			if ((/wizard|cleric|druid|paladin|ranger|investigator|shaman|witch|alchemist|warpriest/i).test(casterObj.classname)){
				setter["spellclass-" + classidx + "-casting_type"] =2;//prepared
			} else {
				setter["spellclass-" + classidx + "-casting_type"] = 1;//spontaneous
			}
			if (casterObj.ability) {
				setter["Concentration-" + classidx + "-ability"] = "@{" + casterObj.ability + "-mod}";
			}
			setter["Concentration-" + classidx + "-mod"] = casterObj.abilityMod;
			if (casterObj.concentrationBonus) {
				setter["Concentration-" + classidx + "-misc"] = casterObj.concentrationBonus;
			}
			casterObj.pageClassIdx = classidx;
			if (casterObj.oppositionschools){
				setter["spellclass-" + classidx + "-oppositionschool-0"]=casterObj.oppositionschools;
			}
			if (casterObj.spellnotes){
				setter["spellclass-" + classidx + "-notes"]=casterObj.spellnotes;
			}
		}
	} catch (err) {
		TAS.error("setSLACasterFields", err);
	} finally {
		return setter;
	}
}
/** createSpellEntries
 *@param {jsobject} setter - map to pass to setAttrs
 *@param {jsobject} spellObj obj like: {classname:"name",CL:#,concentration:#,
 *	spells:{
 *		0:[{name:spellname,DC:#}],
 *		1:[{name:spellname},{name:spellname}]
 *	}}
 *@param {?} casterObj ?
 *@param {?} section ?
 *@returns {jsobject} setter
 */
function createSpellEntries (setter, spellObj, casterObj, section) {
	section = section || 'spells';
	setter = setter || {};
	if (!spellObj || !casterObj) {
		return setter;
	}
	_.each(spellObj.spellsByLevel, function (spellLevel) {
		var thisSpellLevel = parseInt(spellLevel.spellLevel, 10) || 0, baseDC = 0, perdayPrefix = "";
		try {
			//TAS.debug"now look at level " + thisSpellLevel + " spells", spellLevel);
			perdayPrefix = "spellclass-" + casterObj.pageClassIdx + "-level-" + thisSpellLevel;
			if (spellLevel.perDay) {
				setter[perdayPrefix + "-class"] = spellLevel.perDay;
				setter[perdayPrefix + "-spells-per-day_max"] = spellLevel.perDay;
				setter[perdayPrefix + "-spells-per-day"] = spellLevel.perDay;
			}
			baseDC = 10 + thisSpellLevel + (parseInt(casterObj.abilityMod, 10) || 0);
		} catch (errlvl) {
			TAS.error("createSpellEntries error setting spells per day", errlvl);
		}
		setter = _.reduce(spellLevel.spells, function (memo, spell) {
			var newRowId = generateRowID(), thisDC = 0,
			prefix = "repeating_" + section + "_" + newRowId + "_";
			try {
				setter[prefix + "name"] = (spell.name[0].toUpperCase() + spell.name.slice(1));
				setter[prefix + "classnumber"] = casterObj.pageClassIdx;
				setter[prefix + "spellclass"] = casterObj.classname;
				setter[prefix + "spell_level"] = thisSpellLevel;
				if (spell.DC) {
					thisDC = parseInt(spell.DC, 10) || 0;
					if (thisDC !== baseDC) {
						setter[prefix + "DC_misc"] = thisDC - baseDC;
					}
					setter[prefix + "savedc"] = thisDC;
				}
				if (casterObj.concentration) {
					setter[prefix + "Concentration-mod"] = casterObj.concentration;
				}
			} catch (err) {
				TAS.error("createSpellEntries error setting spell :", spell, err);
			} finally {
				return setter;
			}
		}, setter);
	});
	return setter;
}
function createSLAEntries (setter, slaObj, casterObj, section) {
	var defaultLevel=0;
	section = section || 'ability';
	setter = setter || {};
	if (!slaObj || !casterObj) {
		return setter;
	}
	defaultLevel = parseInt(setter.level,10)||0;
	
	_.each(slaObj.spellLikeAbilities, function (perDaySLAs) {
		var thisPerDay = parseInt(perDaySLAs.perDay, 10) || 0,
		freqType = perDaySLAs.type;
		//TAS.debug" at one set of SLAs, freq:" + freqType + " and perday:" + thisPerDay, perDaySLAs);
		setter = _.reduce(perDaySLAs.SLAs, function (memo, SLA) {
			var newRowId, prefix = "repeating_" + section + "_" + newRowId + "_",
			casterAbility, dcTot = 0, dcMod = 0, sdstr = "", charlvl=0,clmisc=0,tempint=0,slmisc=0,
			casterlevel=0;
			try {
				newRowId = generateRowID();
				prefix = "repeating_" + section + "_" + newRowId + "_";
				memo[prefix + "name"] = (SLA.name[0].toUpperCase() + SLA.name.slice(1));
				memo[prefix + "ability_type"] = 'Sp';
				memo[prefix + "rule_category"] = 'spell-like-abilities';
				memo[prefix + 'showinmenu'] = '1';
				if (casterObj.ability ) {
					casterAbility=casterObj.ability;
					memo[prefix + "ability-basis"] = "@{"+casterObj.ability+"-mod}";
				} else {
					casterAbility="CHA";
					memo[prefix + "ability-basis"] = "@{CHA-mod}";
				}
				memo[prefix + "CL-basis"] = "@{npc-hd-num}";
				memo[prefix + "CL-basis-mod"] = setter.level;
				if(setter['race']){
					memo[prefix+"class-name"]=setter['race'];
				}
				//TAS.debug"CREATE SLA casterObj.CL: " + casterObj.CL + ", level:" + setter.level + " when processing "+ SLA );
				if(casterObj.CL){
					tempint = setter.level||0;
					if (tempint > 0){
						memo[prefix+"CL-misc"]= casterObj.CL - tempint  ;
						memo[prefix+"CL-misc-mod"]= casterObj.CL - tempint  ;
					}
					casterlevel  = casterObj.CL;
				} else {
					casterlevel = setter.level||0;
				}

				memo[prefix+'casterlevel']= casterlevel;
				//assume 1/2? or calc based on DC?
				if (SLA.spell_level){
					if (SLA.spell_level === defaultLevel){
						memo[prefix + "spell_level-basis"]="@{casterlevel}";
					} else if (SLA.spell_level === Math.floor(defaultLevel/2)){
						memo[prefix + "spell_level-basis"]="floor(@{casterlevel}/2)";
					} else {
						memo[prefix + "spell_level-basis"]="0";
						memo[prefix+"spell_level-misc"]=SLA.spell_level;
					}
				} else {
					memo[prefix + "spell_level-basis"]="floor(@{casterlevel}/2)";
				}
				//memo[prefix+"classnumber"]=casterObj.pageClassIdx;
				//memo[prefix+"spellclass"]=casterObj.classname;
				switch(freqType){
					case 'day':
						memo[prefix + "frequency"] = 'perday';
						memo[prefix + "used"] = thisPerDay;
						memo[prefix + "used_max"] = thisPerDay;
						memo[prefix + "max-calculation"]=thisPerDay;
						memo[prefix + "hasfrequency"] = '1';
						memo[prefix + "hasuses"] = '1';
						break;
					case 'will':
						memo[prefix + "frequency"] = 'atwill';
						memo[prefix + "hasfrequency"] = '1';
						break;
					case 'constant':
						memo[prefix + "frequency"] = "constant";
						memo[prefix + "hasfrequency"] = '1';
						break;
					case 'month':
						memo[prefix + "frequency"] = "permonth";
						memo[prefix + "used"] = thisPerDay;
						memo[prefix + "used_max"] = thisPerDay;
						memo[prefix + "max-calculation"]=thisPerDay;
						memo[prefix + "hasfrequency"] = '1';
						memo[prefix + "hasuses"] = '1';
						break;
					case 'everyrounds':
						memo[prefix + "frequency"] = "everyrounds";
						memo[prefix + "hasfrequency"] = '1';
						memo[prefix + "rounds_between"] = SLA.used||'';
						break;
					case 'other':
						memo[prefix + "frequency"] = "other";
						memo[prefix + "used"] = thisPerDay;
						memo[prefix + "used_max"] = thisPerDay;
						memo[prefix + "max-calculation"]=thisPerDay;
						memo[prefix + "hasfrequency"] = '1';
						memo[prefix + "hasuses"] = '1';
						if (slaObj.otherPer){
							sdstr = "Frequency per :"+slaObj.otherPer;
						}
						break;
				}
				if (SLA.save){
					memo[prefix + "save"] = SLA.save;
				}
				if (SLA.DC) {
					try {
						if (!SLA.save){
							memo[prefix + "save"]  = "See Text";
						}
						if (casterObj.abilityMod ) {
							tempint=0;
							if (SLA.spell_level){
								tempint = 10+casterObj.abilityMod+SLA.spell_level;
							} else {
								tempint = 10+casterObj.abilityMod + Math.floor( casterlevel /2);
							}
							if (tempint !== SLA.DC){
								memo[prefix+"spell_level-misc"]= (SLA.DC - tempint);
								memo[prefix+"spell_level-misc-mod"]= (SLA.DC - tempint);
							}
						}
					} catch (err3){
						TAS.error("createSLAentries, error trying to calculate DC: "+SLA,err3);
					}
				}
				if (SLA.description){
					memo[prefix+"description"]= SLA.description;
				}
				if (SLA.shortdesc){
					if (sdstr){
						sdstr = SLA.shortdesc +", "+ sdstr;
					} else {
						sdstr = SLA.shortdesc;
					}
				}
				if (sdstr) {
					memo[prefix + "short-description"] = sdstr;
				}
			} catch (err) {
				TAS.error("createSLAEntries error setting SLA :", SLA, err);
			} finally {
				return memo;
			}
		}, setter);
	});
	return setter;
}
/*createAttacks - creates rows in repeating_weapon
 * @attacklist = array of {enh:0,name:"",type:"",countFullBAB:1,plus:"",note:"",iter:[],dmgdice:0,dmgdie:0,crit:20,critmult:2,dmgbonus:0};
 * @setter = the map to pass to setAttrs
 * @returns setterf
 */
function createAttacks (attacklist, setter, attackGrid, abilityScores, importantFeats, defaultReach, exceptionReaches, sizeMap) {
	setter = setter || {};
	if (!attacklist || _.size(attacklist)===0) {
		return setter;
	}
	TAS.debug("##################","create attacks:", attacklist, attackGrid, abilityScores, importantFeats, defaultReach, exceptionReaches);
	setter = _.reduce(attacklist, function (memo, attack) {
		var newRowId = generateRowID(),
		prefix = "repeating_weapon_" + newRowId + "_", dmgAbilityStr=false, specCMB=false,
		i = 0, iterativeNum = 0, basebonus = 0, tempInt = 0, dmgMult = 1, dmgMod = 0, tohitbonus = 0,
		name = "", tempstr = "", basename = "", iterZero = NaN,
		reach, newRowId2, prefix2;
		//TAS.debug"creating attack row id:" + newRowId);
		try {
			//TAS.debug"looking at attack:", attack);
			tohitbonus = Math.max(attack.enh, attack.mwk);
			basename = attack.basename;
			//basename.replace(/^group.*?:\s*/,'');
			name += attack.name;
			if (attack.plus) {
				name += " Plus " + attack.plus;
			}
			memo[prefix + "name"] = name;
			memo[prefix+"default_size"]=sizeMap.size;
			if (attack.atktype === 'ranged') {
				basebonus = attackGrid.ranged;
				memo[prefix + "attack-type"] = "@{attk-ranged}";
				memo[prefix + "attack-type-mod"] = attackGrid.ranged;
				memo[prefix + "isranged"] = 1;
			} else if ( PFDB.cmbPlusStrsrch.test(basename)){
				basebonus = attackGrid.cmb;
				memo[prefix + "attack-type"] = "@{CMB}";
				memo[prefix + "attack-type-mod"] = attackGrid.cmb;
				dmgAbilityStr=true;
				dmgMult = 1.5;
				specCMB=true;
			} else if (attack.atktype === 'cmb') {
				basebonus = attackGrid.cmb;
				memo[prefix + "attack-type"] = "@{CMB}";
				memo[prefix + "attack-type-mod"] = attackGrid.cmb;
			} else if (attack.atktype === 'special') {
				basebonus = 0;
				memo[prefix + "attack-type-mod"] = 0;
				memo[prefix + "total-attack"] = 0;
			} else {
				dmgAbilityStr=true;
				//melee
				if (importantFeats.weaponfinesse) {
					//assume all attacks use weapon finesse
					basebonus = attackGrid.melee2;
					memo[prefix + "attack-type"] = "@{attk-melee2}";
					memo[prefix + "attack-type-mod"] = attackGrid.melee2;
				} else {
					basebonus = attackGrid.melee;
					memo[prefix + "attack-type"] = "@{attk-melee}";
					memo[prefix + "attack-type-mod"] = attackGrid.melee;
				}
				if (attack.type === 'natural') {
					if (attack.naturaltype === 'secondary') {
						dmgMult = 0.5;
					} else if (attack.dmgMult && attack.dmgMult === 1.5) {
						memo[prefix + "damage_ability_mult"] = 1.5;
						dmgMult = 1.5;
					}
				}
			}
			if(specCMB){
				TAS.debug("############ SPEC CMB ###############","dmgAbilityStr:"+dmgAbilityStr+" attackbonus:"+basebonus +", mult:"+ dmgMult);
			}
			if (dmgAbilityStr || specCMB){
				if(specCMB && attack.dmgbonus===0){
					memo[prefix + "damage-ability"] = "0";
					dmgMod=0;
				} else {
					memo[prefix + "damage-ability"] = "@{STR-mod}";
					if (dmgMult !== 1){
						dmgMod = Math.floor(dmgMult * abilityScores.str.mod);
						memo[prefix + "damage_ability_mult"] = dmgMult;
					} else {
						dmgMod = abilityScores.str.mod;
					}
				}
				memo[prefix + "damage-ability-mod"] = dmgMod;
			}			
			if (attack.enh) {
				memo[prefix + "enhance"] = attack.enh;
			}
			if (attack.mwk) {
				memo[prefix + "masterwork"] = "1";
			}
			if (!specCMB && attack.iter && attack.iter.length > 0) {
				iterZero = parseInt(attack.iter[0], 10);
			} else if (specCMB) {
				iterZero = basebonus;
			}
			if (!isNaN(iterZero)) {
				if(specCMB){
					memo[prefix + "attack"] = 0;
					memo[prefix + "attack-mod"] = 0;
					memo[prefix + "total-attack"] = basebonus;
				} else {
					memo[prefix + "attack"] = iterZero - tohitbonus - basebonus;
					memo[prefix + "attack-mod"] = iterZero - tohitbonus - basebonus;
					memo[prefix + "total-attack"] = iterZero;
				}
			} else if (attack.atktype === 'cmb') {
				if ((/swallowwhole|pin/i).test(attack.basename)) {
					//if confirming crit add +5
					memo[prefix + "attack"] = 5;
					memo[prefix + "attack-mod"] = 5;
					memo[prefix + "total-attack"] = attackGrid.cmb + 5;
				} else {
					memo[prefix + "total-attack"] = attackGrid.cmb;
				}
			} else {
				memo[prefix + "total-attack"] = 0;
			}
			if (attack.crit !== 20) {
				memo[prefix + "crit-target"] = attack.crit;
			}
			if (attack.critmult !== 2 && attack.critmult) {
				memo[prefix + "crit-multiplier"] = attack.critmult;
			}
			if (importantFeats.criticalfocus) {
				memo[prefix + "crit_conf_mod"] = 4;
			}
			//somewhere this is getting lost:  just bandaid it:
			if (!memo[prefix + "total-attack"]) {
				memo[prefix + "total-attack"] = 0;
			}
			memo[prefix + "damage-dice-num"] = attack.dmgdice;
			memo[prefix + "default_damage-dice-num"] = attack.dmgdice;
			memo[prefix + "damage-die"] = attack.dmgdie;
			memo[prefix + "default_damage-die"] = attack.dmgdie;
			memo[prefix + "damage"] = attack.dmgbonus - attack.enh - dmgMod;
			memo[prefix + "damage-mod"] = attack.dmgbonus - attack.enh - dmgMod;
			memo[prefix + "total-damage"] = attack.dmgbonus;
			if (attack.note) {
				memo[prefix + "notes"] = "(" + attack.type + ") " + attack.note;
			} else {
				memo[prefix + "notes"] = "(" + attack.type + ")";
			}
			if (attack.iter.length > 1) {
				for (i = 1; i < attack.iter.length; i++) {
					iterativeNum = i + 1;
					//TAS.debug"at iteration " + iterativeNum + ", difference is :" + (attack.iter[i] - attack.iter[0]));
					memo[prefix + "toggle_iterative_attack" + iterativeNum] = "@{var_iterative_attack" + iterativeNum + "_macro}";
					memo[prefix + "iterative_attack" + iterativeNum + "_value"] = (attack.iter[i] - attack.iter[0]);
				}
			} else if (attack.countFullBAB > 1) {
				for (i = 1; i < attack.countFullBAB; i++) {
					iterativeNum = i + 1;
					memo[prefix + "toggle_iterative_attack" + iterativeNum] = "@{var_iterative_attack" + iterativeNum + "_macro}";
					memo[prefix + "iterative_attack" + iterativeNum + "_value"] = 0;
				}
			}
			// plus extra damage  **********************
			if (attack.plusamount) {
				memo[prefix + "precision_dmg_macro"] = "[[" + attack.plusamount + "]]";
				if (attack.plustype) {
					memo[prefix + "precision_dmg_type"] = attack.plustype;
				}
			} else if (attack.plus) {
				memo[prefix + "precision_dmg_type"] =attack.plus;
				memo[prefix + "precision_dmg_macro"] =  "Plus";
			}
			if (attack.dmgtype) {
				memo[prefix + "notes"] = memo[prefix + "notes"] + ", damage type:" + attack.dmgtype;
			}
			//reach **************************
			if (attack.range) {
				tempInt = parseInt(attack.range, 10);
				if (isNaN(tempInt)) {
					memo[prefix + "notes"] = memo[prefix + "notes"] + ", range:" + attack.range;
				}
			} else if ((/tongue/i).test(attack.name)) {
				reach = defaultReach * 3;
				memo[prefix + "range"] = reach;
			} else if (attack.atktype === "melee") {
				if (exceptionReaches && exceptionReaches.length > 0) {
					//TAS.log("looking for match",exceptionReaches);
					reach = _.filter(exceptionReaches, function (reacharray) {
						//TAS.log("matching "+basename+" with "+reacharray[0]);
						if (basename.indexOf(reacharray[0]) >= 0) {
							//TAS.log("it matches!"+reacharray[0]);
							return true;
						}
						return false;
					});
					//TAS.log(reach);
					if (reach && reach[0] && reach[0][1]) {
						memo[prefix + "range"] = reach[0][1];
					} else if (defaultReach) {
						memo[prefix + "range"] = defaultReach;
					}
				} else if (defaultReach) {
					memo[prefix + "range"] = defaultReach;
				}
			}
			if (attack.group) {
				memo[prefix + "group"] = attack.group;
			}
			if (attack.dc) {
				memo[prefix + "notes"] = memo[prefix + "notes"] + " " + attack.dc + attack.dcequation ? (" " + attack.dcequation) : '';
			}
		} catch (err) {
			TAS.error("createattacks error on:", attack, err);
		} finally {
			return memo;
		}
	}, setter);
	//TAS.debug("end of create attacks returning:", setter);
	return setter;
}
function createACEntries (setter, acMap, abilityScores, importantFeats, hpMap, bab) {
	var acAbility = "DEX",
	acDexDef = abilityScores.dex.mod,
	calcCMD=0,
	altbab = 0;
	try {
		//TAS.debug("acMap", acMap);
		if (acMap.altability) {
			//this should no longer happen.
			//TAS.debug("different ability score for AC!");
			acAbility = acMap.altability.toUpperCase();
			if (acAbility !== "DEX") {
				setter["AC-ability"] = "( ((@{XXX-mod} + [[ @{max-dex-source} ]]) - abs(@{XXX-mod} - [[ @{max-dex-source} ]])) / 2 )".replace(/XXX/g, acAbility);
				setter["CMD-ability2"] = "( ((@{XXX-mod} + [[ @{max-dex-source} ]]) - abs(@{XXX-mod} - [[ @{max-dex-source} ]])) / 2 )".replace(/XXX/g, acAbility);
				switch (acMap.altability.toLowerCase()) {
					case 'wis':
						acDexDef = abilityScores.wis.mod;
						break;
					case 'int':
						acDexDef = abilityScores['int'].mod;
						break;
					case 'cha':
						acDexDef = abilityScores.cha.mod;
						break;
					case 'con':
						acDexDef = abilityScores.con.mod;
						break;
					default:
						acDexDef = abilityScores.dex.mod;
						break;
				}
				setter["AC-ability-mod"] = acDexDef;
			}
		}
		//has uncanny dodge
		if (acMap.uncanny) {
			setter["FF-ability"] = "@{XXX-mod}".replace(/XXX/g, acAbility);
			setter["FF-ability-mod"] = acDexDef;
			setter["CMD-ability"] = "( ((@{XXX-mod} + [[ @{max-dex-source} ]]) - abs(@{XXX-mod} - [[ @{max-dex-source} ]])) / 2 )".replace(/XXX/g, acAbility);
			setter["CMD-ability"] = acDexDef;
			setter["uncanny_dodge"] = 1;
			setter["uncanny_cmd_dodge"] = 1;
		}
		altbab=bab;
		if (importantFeats.defensivecombattraining) {
			setter['hd_not_bab']=1;
			if (setter.level){
				altbab = parseInt(setter.level,10);
			} 
			if (!altbab){
				altbab = (hpMap.hdice1||0) + (hpMap.hdice2||0);
			}
		}
		try {
			calcCMD = 10 + altbab + abilityScores.str.mod + acDexDef + (-1 * acMap.size);
			//TAS.debug("bab:"+altbab+"+ str:"+ abilityScores.str.mod + "+ dex" + acDexDef + " - size: " +acMap.size + ", calcCMD:"+calcCMD+", cmdparsed:"+acMap.cmd);
			if (isNaN(acMap.cmd) || calcCMD === acMap.cmd) {
				setter["CMD"]= calcCMD;
			} else {
				setter["CMD"] = acMap.cmd;
				setter["CMD-misc"] = (acMap.cmd - calcCMD);
			}
		} catch (err2){
			TAS.error("createACEntries error trying to calculate CMD",err2);
		}

		setter["AC"] = acMap.ac;
		setter["Touch"] = acMap.touch;
		setter["Flat-Footed"] = acMap.ff;
		setter["AC-deflect"] = acMap.deflect;
		setter["AC-dodge"] = acMap.dodge;
		setter["AC-misc"] = acMap.misc;
		setter["AC-natural"] = acMap.natural;
		if (acMap.armor) {
			setter["armor3-equipped"] = "1";
			setter["armor3-acbonus"] = acMap.armor;
			setter["armor3"]="Armor bonus";
			setter["AC-armor"] = acMap.armor;
		}
		if (acMap.shield) {
			setter["shield3-equipped"] = "1";
			setter["shield3-acbonus"] = acMap.shield;
			setter["shield3"]="Shield bonus";
			setter["AC-shield"] = acMap.shield;
		}
		if (acMap.notes){
			setter['defense-notes']=acMap.notes;
		}
		if (acMap.cmdnotes){
			setter['cmd-notes']=acMap.cmdnotes;
		}
		if (acMap.acbuff) {
			setter = PFBuffs.createTotalBuffEntry("AC adjustment from import", "AC", acMap.acbuff, acMap.acbuff, setter);
		}
	} catch (err) { } finally {
		return setter;
	}
}
function createSkillEntries (setter, skills, racial, abilityScores, importantFeats, classSkills, sizeMap, isUndead) {
	var npcSkillsWithFillInNames = ["Craft", "Perform", "Profession"],
	craftLevel = -1, performLevel = -1, professionLevel = -1, runningTot = 0, counter = 0,
	tempAbilities = PFSkills.coreSkillAbilityDefaults,
	tempstr = "",
	skillfeats = /skillfocus|intimidatingprowess/i;
	try {
		//TAS.debug("PFNPC createSkillEntries sizemap is: ", sizeMap, "skills ", skills , "racial", racial);
		if (racial) {
			if (racial.abilitymods && _.size(racial.abilitymods) > 0) {
				//set default ability for skill and substitute adjustments, make sure to use copy not original
				tempAbilities = _.extend({}, PFSkills.coreSkillAbilityDefaults, racial.abilitymods);
				setter = _.reduce(racial.abilitymods, function (memo, ability, skill) {
					memo[skill + "-ability"] = "@{" + ability.toUpperCase() + "-mod}";
					memo[skill + "-ability-mod"] = abilityScores[ability].mod;
					return memo;
				}, setter);
			}
			if (racial.skillmods && _.size(racial.skillmods) > 0) {
				setter = _.reduce(racial.skillmods, function (memo, mod, skill) {
					memo[skill + "-racial"] = mod;
					return memo;
				}, setter);
			}
			if (racial.skillnotes && racial.skillnotes.length > 0) {
				tempstr = "";
				_.each(racial.skillnotes, function (note) {
					tempstr += note + ", ";
				});
				tempstr.replace(/,\s$/, '');
				if (tempstr) {
					setter["Skill-notes"] = tempstr;
				}
			}
		}
		if (importantFeats && _.size(importantFeats) > 0) {
			setter = _.reduce(importantFeats, function (memo, val, feat) {
				if (/intimidatingprowess/i.test(feat)) {
					memo["Intimidate-misc"] = '@{STR-mod}';
					memo["Intimidate-misc-mod"] = abilityScores.str.mod;
				} else if (/skillfocus/i.test(feat)) {
					_.each(val, function (val2, skill) {
						memo[skill + "-feat"] = 3;
					});
				}
				return memo;
			}, setter);
		}
		if (classSkills && _.size(classSkills) > 0) {
			setter = _.reduce(classSkills, function (memo, skill) {
				try {
					if (skill === "Knowledge") {
						_.each(PFSkills.knowledgeSkills, function (kSkill) {
							memo[kSkill + "-cs"] = 3;
						});
					} else if (_.contains(PFSkills.coreSkillsWithFillInNames, skill)) {
						_.each(PFSkills.allFillInSkillInstances[skill], function (subskill) {
							memo[subskill + '-cs'] = 3;
						});
					} else {
						memo[skill + "-cs"] = 3;
					}
				} catch (err) {
					TAS.error("createSkillEntries", err);
				} finally {
					return memo;
				}
			}, setter);
		}
		setter = _.reduce(skills, function (memo, tot, skill) {
			var ability = "", tempint = 0, abilitymod = 0, ranks = 0;
			try {
				tot = parseInt(tot, 10);
				if (tempAbilities[skill]) {
					ability = tempAbilities[skill];
					abilitymod = abilityScores[ability] ? abilityScores[ability].mod : 0;
					abilitymod = parseInt(abilitymod, 10);
					//TAS.debug("now setting " + skill + ", total:" + tot +", size:",sizeMap);
					memo[skill] = tot;
					ranks = tot;
					ranks -= abilitymod;
					if (skill==='Stealth'){
						ranks -= (2*sizeMap.skillSize);
					} else if (skill === 'Fly'){
						ranks -= sizeMap.skillSize;
					}
					if (racial && racial.skillmods && racial.skillmods[skill]) {
						ranks -= parseInt(racial.skillmods[skill], 10);
					}
					if (parseInt(memo[skill + "-feat"], 10) > 0) {
						ranks -= parseInt(memo[skill + "-feat"], 10);
					}
					if (parseInt(memo[skill + "-cs"], 10) > 0) {
						ranks -= 3;
					}
					memo[skill + "-ranks"] = ranks;
					memo[skill + "-ability-mod"] = abilitymod;
					runningTot++;
				} else {
					TAS.warn("createSkillEntries, skill " + skill + " not found");
				}
			} catch (err) {
				TAS.error("createSkillEntries inner reduce", err);
			} finally {
				return memo;
			}
		}, setter);
	} catch (errouter) {
		TAS.error("at createskillEntries OUTER error", errouter);
	} finally {
		return setter;
	}
}
function createInitEntries (setter, baseInit, abilityScores, importantFeats) {
	var initMisc = 0;
	try {
		initMisc = baseInit - abilityScores.dex.mod;
		setter["init"] = baseInit;
		setter["init-misc"] = initMisc;
		setter["init-misc-mod"] = initMisc;
		setter["init-ability-mod"] = abilityScores.dex.mod;
	} catch (err) {
		TAS.error("createInitEntries", err);
	} finally {
		return setter;
	}
}
function createHPAbilityModEntry (setter, abilityScores, isUndead) {
	try {
		if (isUndead || abilityScores.con.base === "-") {
			setter["HP-ability"] = "@{CHA-mod}";
			setter["HP-ability-mod"] = abilityScores.cha.mod;
		} else {
			setter["HP-ability-mod"] = abilityScores.con.mod;
		}
	} finally {
		return setter;
	}
}
function createHealthEntries (setter, abilityScores, isUndead, hpMap) {
	var currlevel=0;
	try {
		setter["npc-hd-num"] = hpMap.hdice1;
		setter["level"] =hpMap.hdice1;
		setter["npc-hd"] = hpMap.hdie1;
		setter["HP"] = hpMap.hp;
		setter["HP_max"] = hpMap.hp;
		setter["non-lethal-damage_max"] = hpMap.hp;
		setter["auto_calc_hp"] = "1";
		setter["both_whisper_show"] = "1";
		//NPC: add to race row of class/race grid
		if (hpMap.basehp) {
			setter["NPC-HP"] = hpMap.basehp;
		}
		//bonuses
		if (hpMap.misc) {
			setter["HP-formula-macro-text"] = hpMap.misc;
			setter["HP-formula-mod"] = hpMap.misc;
		}
		if (hpMap.heal) {
			setter["npc-heal-conditions"] = hpMap.heal;
		}
	} catch (err) {
		TAS.error("createHealthEntries", err);
	} finally {
		return setter;
	}
}
function createSpeedEntries (setter, speedMap, importantFeats) {
	var tempstr = "";
	try {
		_.each(speedMap, function (speed, stype) {
			switch (stype) {
				case 'land':
					setter["speed-base"] = speed;
					setter["speed-modified"] = speed;
					break;
				case 'fly':
					setter["speed-fly"] = speed;
					break;
				case 'climb':
					setter["speed-climb"] = speed;
					break;
				case 'swim':
					setter["speed-swim"] = speed;
					break;
				case 'flyability':
					tempstr += "Fly (" + speed + ")";
					break;
				default:
					setter["speed-misc"] = speed;
					if (tempstr.length > 0) {
						tempstr += ", ";
					}
					tempstr += stype + " " + speed;
					break;
			}
		});
		if (tempstr) {
			setter["speed-notes"] = tempstr;
		}
		if (importantFeats.run) {
			setter["run-mult"] = 5;
		}
	} catch (err) {
		TAS.error("parseAndSetSpeed error, speedMap", speedMap, err);
	} finally {
		return setter;
	}
}
function createSaveEntries (setter, abilityScores, isUndead, baseSaves, v) {
	var fortMisc,
	refMisc,
	willMisc,
	tempNote = "",
	tempstr = "";
	try {
		fortMisc = baseSaves.baseFort - abilityScores.con.mod;
		refMisc = baseSaves.baseRef - abilityScores.dex.mod;
		willMisc = baseSaves.baseWill - abilityScores.wis.mod;
		if (isUndead || abilityScores.con.base === "-") {
			fortMisc = baseSaves.baseFort - abilityScores.cha.mod;
			setter["Fort-ability"] = "@{CHA-mod}";
			setter["Fort-ability-mod"] = abilityScores.cha.mod;
		} else {
			setter["Fort-ability-mod"] = abilityScores.con.mod;
		}
		setter["npc-Fort"] = fortMisc;
		setter["Fort"] = baseSaves.baseFort;
		tempNote = "";
		tempstr = PFUtils.getNoteAfterNumber(v["fort_compendium"]);
		if (tempstr) {
			tempNote += ("Fortitude " + tempstr);
		}
		setter["npc-Ref"] = refMisc;
		setter["Ref"] = baseSaves.baseRef;
		if (abilityScores.dex.mod !== 0) {
			setter["Ref-ability-mod"] = abilityScores.dex.mod;
		}
		tempstr = PFUtils.getNoteAfterNumber(v["ref_compendium"]);
		if (tempstr) {
			tempNote += ("Reflex " + tempstr);
		}
		setter["npc-Will"] = willMisc;
		setter["Will"] = baseSaves.baseWill;
		if (abilityScores.wis.mod !== 0) {
			setter["Will-ability-mod"] = abilityScores.wis.mod;
		}
		tempstr = PFUtils.getNoteAfterNumber(v["will_compendium"]);
		if (tempstr) {
			tempNote += ("Willpower " + tempstr);
		}
		if (tempNote) {
			setter["saves_notes"] = tempNote;
			setter["toggle_save_notes"] = "1";
		}
	} catch (err) {
		TAS.error("createSaveEntries", err);
	} finally {
		return setter;
	}
}
function createAbilityScoreEntries (setter, abilityScores) {
	try {
		setter["STR-base"] = abilityScores.str.base;
		setter["DEX-base"] = abilityScores.dex.base;
		setter["CON-base"] = abilityScores.con.base;
		setter["WIS-base"] = abilityScores.wis.base;
		setter["INT-base"] = abilityScores['int'].base;
		setter["CHA-base"] = abilityScores.cha.base;
		setter["STR"] = abilityScores.str.base;
		setter["DEX"] = abilityScores.dex.base;
		setter["CON"] = abilityScores.con.base;
		setter["WIS"] = abilityScores.wis.base;
		setter["INT"] = abilityScores['int'].base;
		setter["CHA"] = abilityScores.cha.base;
		setter["STR-mod"] = abilityScores.str.mod;
		setter["DEX-mod"] = abilityScores.dex.mod;
		setter["CON-mod"] = abilityScores.con.mod;
		setter["WIS-mod"] = abilityScores.wis.mod;
		setter["INT-mod"] = abilityScores['int'].mod;
		setter["CHA-mod"] = abilityScores.cha.mod;
	} catch (err) {
		TAS.error("createAbilityScoreEntries", err);
	} finally {
		return setter;
	}
}
function parseAndCreateAttacks (setter, abilityScores, sizeMap, importantFeats, bab, attackGrid, reachObj, v) {
	var attacklist,
	attackArrays,
	matches,
	tempstr='',
	defReach = 5,
	tempCMB,
	miscCMB=0,
	calcCMB=0,
	reachExceptions = [];
	try {
		if (reachObj) {
			if (reachObj.reach) {
				defReach = reachObj.reach;
			}
			if (reachObj.reachExceptions) {
				reachExceptions = reachObj.reachExceptions;
			}
		}
		setter["bab"] = bab;
		setter["npc-bab"] = bab;
		setter["melee-ability-mod"] = abilityScores.str.mod;
		setter["attk-melee"] = abilityScores.str.mod + bab + sizeMap.size;
		attackGrid.melee = abilityScores.str.mod + bab + sizeMap.size;
		setter["ranged-ability-mod"] = abilityScores.dex.mod;
		setter["attk-ranged"] = abilityScores.dex.mod + bab + sizeMap.size;
		attackGrid.ranged = abilityScores.dex.mod + bab + sizeMap.size;
		if (importantFeats.criticalfocus) {
			setter["cmb_crit_conf"] = 4;
			setter["ranged_crit_conf"] = 4;
			setter["melee_crit_conf"] = 4;
		}
		if (importantFeats.weaponfinesse) {
			setter["melee2-ability"] = "@{DEX-mod}";
			setter["melee2-ability-mod"] = abilityScores.dex.mod;
			setter["attk-melee2"] = abilityScores.dex.mod + bab + sizeMap.size;
			attackGrid.melee2 = abilityScores.dex.mod + bab + sizeMap.size;
			setter["attk_melee2_note"] = 'Weapon Finesse';
			if (importantFeats.criticalfocus) {
				setter["melee2_crit_conf"] = 4;
			}
		}
		try {
			if (importantFeats.agilemaneuvers) {
				setter["CMB-ability"] = "@{DEX-mod}";
				setter["CMB-ability-mod"] = abilityScores.dex.mod;
				calcCMB=abilityScores.dex.mod + bab - sizeMap.size;
				setter["cmb_desc"] = 'Agile Maneuvers';
			} else {
				setter["CMB-ability-mod"] = abilityScores.str.mod;
				calcCMB=abilityScores.str.mod + bab - sizeMap.size;
			}
			matches = v.cmb_compendium.match(/\d+/);
			if (matches){
				tempCMB = parseInt(matches[0],10);
				miscCMB = tempCMB - calcCMB;
				setter["CMB"] = tempCMB;
				attackGrid.cmb = tempCMB;
				if(miscCMB){
					setter["attk-CMB-misc"] = miscCMB;
				}
				tempstr = v.cmb_compendium.slice(matches.index+matches[0].length);
				if(tempstr){
					attackGrid.cmbnotes=tempstr;
					setter["CMB-notes"]=tempstr;
				}
			} else {
				setter["CMB"] = calcCMB;
				attackGrid.cmb = calcCMB;
			}
		} catch (errC) {
			TAS.error("parseAndCreateAttacks error creating CMB attack types", errC);
		}
		// Attacks *****************************
		if (v["npc-melee-attacks-text"]) {
			try {
				attacklist = parseAttacks(v["npc-melee-attacks-text"], "melee");
				assignPrimarySecondary(attacklist);
				setter = createAttacks(attacklist, setter, attackGrid, abilityScores, importantFeats, defReach, reachExceptions, sizeMap);
			} catch (errM) {
				TAS.error("parseAndCreateAttacks error creating melee attacks", errM);
			}
		}
		if (v["npc-ranged-attacks-text"]) {
			try {
				attacklist = parseAttacks(v["npc-ranged-attacks-text"], "ranged");
				setter = createAttacks(attacklist, setter, attackGrid, abilityScores, importantFeats, null, null, sizeMap);
			} catch (errR) {
				TAS.error("parseAndCreateAttacks error creating ranged attacks", errR);
			}
		}
	} catch (err) {
		TAS.error("parseAndCreateAttacks", err);
	} finally {
		return setter;
	}
}
/*createFeatEntries
 *@returns setter */
function createFeatEntries (setter, featlist) {
	return _.reduce(featlist, function (memo, feat) {
		var newRowId = generateRowID(),
		prefix="repeating_ability_"+newRowId+"_";
		memo[prefix+"name"] = feat;
		memo[prefix+"rule_category"]="feats";
		memo[prefix+"showinmenu"]="1";
		memo[prefix+"CL-basis"]="@{npc-hd-num}";
		memo[prefix+"CL-basis-mod"]=setter.level||0;
		if (setter["race"]) {
			memo[prefix + 'class-name'] = setter["race"];
		}
		memo[prefix+"row_id"]=newRowId;
		memo[prefix + "frequency"] = 'not-applicable';//'not-applicable';
		memo[prefix + 'ability_type'] = '';//'not-applicable';
		return memo;
	}, setter);
}
/*createFeatureEntries
 *@returns setter */
function createFeatureEntries (setter, abilitylist, abilityScoreMap) {
	var attrs = {}, creatureRace = "", tempint=0,dc=0,abilityMod=0,charlevel=0,calcDC=0;
	try {
		//TAS.debug("at createFeatureEntries:", abilitylist);
		charlevel = Math.floor((parseInt(setter.level,10)||0)/2);
		creatureRace = setter["race"];
		attrs = _.chain(abilitylist).map(function (ability) {
			var match=null,tempstr;
			//copy only settings we want to keep and return them in a new obj.
			//TAS.debug("first iter: ", ability);
			try {
				ability.description = ability.description || '';
				if (ability.note){
					if (ability.description) {
						ability.description += ', ';
					}
					ability.description += ability.note.replace(/,\s$/, '');
				}
				if (ability.other) {
					if (ability.description) {
						ability.description += ', ';
					}
					ability.description += ability.other.replace(/,\s$/, '');
					ability.other = null;
				}
				if(!ability.ability_type){
					if (ability.name){
						tempstr=PFUtils.getSpecialAbilityTypeFromString(ability.name);
						if(tempstr){
							ability.ability_type=tempstr;
							ability.name = ability.name.replace(/\b(Su|Ex|Sp)\b/i,'').replace('()','');
						}
					}
				}
			} catch (err3) {
				TAS.error("createFeatureEntries err3",err3);
			} finally {
				//TAS.debug("this ability is:", ability);
				return ability;
			}
		}).filter(function (ability) {
			if (ability.name) {
				return true;
			}
			return false;
		}).reduce(function (memo, ability) {
			var newRowId, prefix;
			try {
				newRowId = generateRowID();
				prefix = "repeating_ability_" + newRowId + "_";
				memo[prefix + "name"] = ability.name;
				memo[prefix + "row_id"] = newRowId;
				memo[prefix + "showinmenu"]='1';
				if (ability.shortdesc) {
					memo[prefix + 'short-description'] = ability.shortdesc;
				}
				if (ability.description) {
					memo[prefix + 'description'] = ability.description;
				}
				if (ability.used) {
					if(ability.frequency&& ability.frequency==='everyrounds'){
						memo[prefix+"frequency"] = ability.frequency;
						memo[prefix+'rounds_between']=ability.used;
					} else {
						if(ability.frequency){
							memo[prefix + "frequency"] = ability.frequency;
						} else {
							memo[prefix + "frequency"] = 'perday';
						}
						memo[prefix + 'used'] = ability.used;
						memo[prefix + 'used_max'] = ability.used;
						memo[prefix + 'max-calculation'] = ability.used;
					}
				} else {
					memo[prefix + "frequency"] = 'not-applicable';//'not-applicable';
				}
				if (ability.dmgtype) {
					memo[prefix+"damage-type"]= ability.dmgtype;
				}
				if (ability.rule_category){
					memo[prefix+ 'rule_category'] = ability.rule_category;
				}
				if (ability.ability_type) {
					memo[prefix + 'ability_type'] = ability.ability_type;
				} else {
					memo[prefix + 'ability_type'] = '';//'not-applicable';
				}
				memo[prefix+"CL-basis"]="@{npc-hd-num}";
				memo[prefix+"CL-basis-mod"]=setter.level||0;					
				if (creatureRace) {
					memo[prefix + 'class-name'] = creatureRace;
				}
				if(ability.save){
					memo[prefix + 'save'] = ability.save;
				}
				
				if(ability.DCability){
					memo[prefix+'ability-basis']='@{'+ability.DCability.toUpperCase()+'-mod}';
					abilityMod = abilityScoreMap[ability.DCability.toLowerCase()].mod;
				} else if (ability.ability_type==='Sp' || setter.is_undead){
					memo[prefix+'ability-basis']='@{CHA-mod}';
					abilityMod = abilityScoreMap.cha.mod;
				} else {
					memo[prefix+'ability-basis']='@{CON-mod}';
					abilityMod = abilityScoreMap.con.mod;
				}
				if(ability.extraDamage){
					memo[prefix+'damage-macro-text']=ability.extraDamage;
				}
				if(ability.extraDamageType){
					memo[prefix+'damage-type']=ability.extraDamageType;
				}
				memo[prefix + "spell_level-basis"]="floor(@{casterlevel}/2)";
				if (ability.DC){
					dc =parseInt(ability.DC,10)||0;
					calcDC=  abilityMod + charlevel +10;
					tempint = dc - calcDC;
					if (tempint !== 0){
						memo[prefix+"spell_level-misc"]= tempint;
						memo[prefix+"spell_level-misc-mod"]= tempint;
					}
				}
				
			} catch (ierr2) {
				TAS.error("createFeatureEntries", ierr2);
			} finally {
				return memo;
			}
		}, {}).value();
		//TAS.debug"createFeatureAttrs adding " + _.size(attrs) + " to " + _.size(setter), attrs);
		setter = _.extend(setter, attrs);
	} catch (err) {
		TAS.error("createFeatureEntries", err);
	} finally {
		return setter;
	}
}
/** appends values of objects in sa2 to sa1 if name already exists in sa1
 * by reference
 * @param {Array} sa1 Array of {} js objects:list of special abilities maps. Must have 'name' property to compare
 * @param {Array} sa2 Array of {} js objects:list of special abilities maps. Must have 'name' property to compare
 * @returns {Array} sa2 concatenated with sa2, for any duplicates, we add properties from the sa2 version to sa1, but do not overwrite.
 */
function combineSpecialAbilities (sa1, sa2) {
	var combined;
	combined = _.map(sa1, function ( sa) {
		var existingSA;
		try {
			existingSA = _.findWhere(sa2, { 'name': sa.name });
			if (existingSA) {
				_.each(_.keys(existingSA),function(key){
					//TAS.debug("combining abilties: "+sa[key]+ " plus "+ existingSA[key]);
					if (key==='description'){
						sa.description = ((sa.description) ? (sa.description + ", ") : "") + (existingSA.description||"");
					} else if (key === 'shortdesc'){
						sa.shortdesc = ((sa.shortdesc) ? (sa.shortdesc + ", ") : "") + (existingSA.shortdesc||"");
					} else if ( !sa[key] && existingSA[key]){
						sa[key]=existingSA[key];
					}
				});
			}
		} catch (err1) {
			TAS.error("combineSpecialAbilities err1", err1);
		} finally {
			return sa;
		}
	});
	sa2 = _.reject(sa2,function(sa){
			if (_.findWhere(sa1,{'name':sa.name})){
				return true;
			}
			return false;
		});

	combined = _.union(combined, sa2);
	return combined;
}
function createClassEntries (setter, characterClass) {
	var sumlvls =0, currlvls = 0,i=0,startidx=0,alreadyPresent=false;
	try {
		if (characterClass.CL && characterClass.classname){
			for (i=0;i<7;i++){
				if (setter["class-" + i + "-name"] || setter["class-" + i + "-level"]>0 ){
					startidx=i;
					if (setter["class-" + i + "-name"].toLowerCase() === characterClass.classname.toLowerCase()){
						alreadyPresent=true;
						break;
					}
				}
			}
			if (startidx>=6){
				TAS.warning("too many classes, cannot add " + characterClass.classname);
			} else {
				setter["class-" + startidx + "-name"] = characterClass.classname||"";
				setter["class-" + startidx + "-level"] = characterClass.CL||0;
			}
			if(characterClass.CL){
				currlvls = parseInt(setter.level,10)||0;
				currlvls += characterClass.CL||0;
				setter.level = currlvls;
			}
		}
	} catch (err){
		TAS.error("createClassEntries",err);
	} finally {
		return setter;
	}
}

/**************************** THE BIG ONE ***********************/
/*importFromCompendium - imports all stuff*/
export function importFromCompendium (eventInfo, callback, errorCallback) {
	var done = _.once(function(){
		TAS.info("##############################################");
		TAS.info("Leaving importFromCompendium");
		if (typeof callback === "function"){
			callback();
		}
	}),
	errorDone = _.once(function(){
		TAS.info("##############################################");
		TAS.info("Leaving importFromCompendium NOTHING DONE");
		if (typeof errorCallback === "function"){
			errorCallback();
		}
	}),
	fields = npcCompendiumAttributesPlayer.concat(["is_npc", "alignment"]);
	getAttrs(fields, function (v) {
		var setter = {}, abilityScores = {}, sizeMap = {}, speedMap = {}, hpMap = {}, acMap = {},
		importantFeats = {}, reachObj = {}, racialModsMap = {}, skillsMap = {}, attackGrid = {},
		baseFort = parseInt(v.fort_compendium, 10) || 0,
		baseRef = parseInt(v.ref_compendium, 10) || 0,
		baseWill = parseInt(v.will_compendium, 10) || 0,
		bab = parseInt(v["bab_compendium"], 10) || 0,
		reachExceptions = [],
		isUndead = false, specAbilObj = {}, npcdesc = '',
		tempNote = "", tempstr = "",
		tempInt = 0, tempFloat = 0.0, tempobj=null, baseInit = 0, initMisc = 0, spellcastingclass = -1,
		cr, featlist, attacklist, hpMod, tempArray, spellObj, casterObj,
		matches, attackArray, classSkillArray, specialAttacks, SLAs, attackArrays,
		specialAbilities = {},
		specialQualities=[],
		match,
		baseSaves = {};
		//TAS.debug("importFromCompendium", v);
		try {
			//some basics ***************************************************
			setter['level']=0;
			setter["is_npc"] = "1";
			setter['is_v1'] = "1";
			setter['PFSheet_Version'] =String((PFConst.version.toFixed(2)));
			setter=PFMigrate.getAllMigrateFlags(setter);
			if (v.xp_compendium) {
				setter["npc-xp"] = v.xp_compendium;
			}
			if(v.cr_compendium){
				cr = v.cr_compendium.replace(/\s*cr\s*/i,'');
				cr = SWUtils.trimBoth(cr);
				setter["npc-cr"] = cr;
			}
			setter["PC-Whisper"] = "/w gm";
			//Creature Race and Type *****************************************************
			//undead means use CHA instead of CON
			if (v.type_compendium) {
				setter["npc-type"] = v.type_compendium;
			}
			isUndead = ((/undead/i).test(v.type_compendium)||(/undead/i).test(v.character_name));
			if (isUndead) {
				setter["is_undead"] = "1";
				TAS.warn("is undead! ");
			}
			if (v.character_name){
				setter["race"] = v["character_name"];
			}

			/****************** class(es)******************************/
			if (v.class_compendium) {
				setter["add_class"]=1;
				tempInt=0;
				matches = v.class_compendium.split(/\s*,\s*/g);
				_.each(matches,function(classstr){
					var  lvl=0, localmatch = classstr.match(/\d+/),
						newclassstr=classstr;
						tempInt++;
					if (match){
						lvl = parseInt(match[0],10)||0;
						newclassstr = classstr.slice(0,match.index);
						if(( match.index+match[0].length) <= classstr.length){
							newclassstr += classstr.slice(match.index+match[0].length);
						}
					}
					setter = createClassEntries (setter,{'classname':classstr,'CL':lvl});
				});
				if(tempInt>1){
					setter["multiclassed"]=1;
					setter["class1_show"]=1;
				}
				tempInt=0;
			}
			// Ability Scores *****************************************************************
			abilityScores = parseAbilityScores(v);
			setter = createAbilityScoreEntries(setter, abilityScores, isUndead);
			// Size **********************************************************************
			sizeMap = PFSize.getSizeFromText(v.size_compendium);
			if (sizeMap && sizeMap.size !== 0) {
				setter.size = sizeMap.size;
				setter['default_char_size']=sizeMap.size;
				setter['old_size']=sizeMap.size;
				setter.size_skill = sizeMap.skillSize;
				setter["CMD-size"] = (sizeMap.size * -1);
				setter.size_skill_double = (sizeMap.skillSize * 2);
			} else {
				sizeMap = {'size':0,'size_skill':0,'CMD-size':0,'size_skill_double':0};
				setter['size']=0;
				setter['default_char_size']=0;
				setter['old_size']=0;
			}
			// Feats *********************************************************************
			if (v["npc-feats-text"]) {
				try {
					featlist = parseFeats(v["npc-feats-text"]);
					if (featlist && _.size(featlist) > 0) {
						setter = createFeatEntries(setter, featlist);
						importantFeats = buildImportantFeatObj(featlist);
					}
				} catch (featerr) {
					TAS.error("error parsing feats", featerr);
					if (!importantFeats) {
						importantFeats = {};
					}
				}
			}
			// Initiative *****************************************************************
			baseInit = getNPCInit(v.init_compendium);
			createInitEntries(setter, baseInit, abilityScores, importantFeats);
			/********************** Saves and defense ************************/
			baseSaves = {
				'baseFort': baseFort,
				'baseRef': baseRef,
				'baseWill': baseWill
			};
			if (v.dr_compendium) {
				setter["DR"] = v.dr_compendium;
			}
			if (v.sr_compendium) {
				setter["SR"] = v.sr_compendium;
				setter["SR-macro-text"] = v.sr_compendium;
			}
			createSaveEntries(setter, abilityScores, isUndead, baseSaves, v);

			//hit points ****************************
			createHPAbilityModEntry(setter, abilityScores, isUndead);
			hpMod = parseInt(setter["HP-ability-mod"], 10);
			//TAS.debug("calling parse hp with con mod of :" + hpMod);
			hpMap = parseNPChp(v["npc_hp_compendium"], hpMod);
			createHealthEntries(setter, abilityScores, isUndead, hpMap);
			
			//AC ************************************************
			acMap = parseNPCAC(v["ac_compendium"], v.cmd_compendium, abilityScores.dex.mod, sizeMap.size);
			createACEntries(setter, acMap, abilityScores, importantFeats, hpMap, bab);
			// Reach *******************************************
			//TAS.debug("about to find reach: " + v.reach_compendium);
			reachObj = parseReach(v.reach_compendium);
			if (reachObj) {
				setter.reach = reachObj.reach;
				if (reachObj.reachNotes) {
					setter["reach-notes"] = reachObj.reachNotes;
				}
			} else {
				reachObj = {};
				reachObj.reach = 5;
				reachObj.reachExceptions = [];
			}
			// Attacks *********************************************************
			parseAndCreateAttacks(setter, abilityScores, sizeMap, importantFeats, bab, attackGrid, reachObj, v);
			//TAS.debug("after parseAndCreateAttacks attrnum:" + _.size(setter));
			//special Attacks ***************************************************
			specialAttacks = parseSpecialAttacks(setter, v["npc-special-attacks"], attackGrid.cmb);
			if (specialAttacks && specialAttacks.length > 0) {
				attackArrays = _.groupBy(specialAttacks, 'specialtype');
				setter = createAttacks(attackArrays.attack, setter, attackGrid, abilityScores, importantFeats, null, null, sizeMap);
				specialAbilities = attackArrays.ability;
				//TAS.debug("after createSpecialAttackEntries attrnum:" + _.size(setter));
			}
			//spells***************************************************
			//TAS.debug("checking for spells");
			if (v["npc-spells-known-text"]) {
				//advance index
				spellcastingclass = 0;
				setter['use_spells']=1;
				//TAS.debug("has some spells");
				spellObj = parseSpells(v["npc-spells-known-text"]);
				//TAS.debug("the spells are:",spellObj);
				if (spellObj) {
					setter['use_spells']=1;
					casterObj = getCasterObj(spellObj, abilityScores, hpMap);
					//do not add caster levels to hit dice or it gets screwed up
					//setter = createClassEntries (setter,casterObj);
					setter = setCasterFields(setter, casterObj, spellcastingclass);
					setter = createSpellEntries(setter, spellObj, casterObj);
				}
			}
			//Spell-like-abilities***************************************************
			//TAS.debug("checking for SLAs");
			if (v["npc-spellike-ability-text"]) {
				SLAs = parseSLAs(v["npc-spellike-ability-text"]);
				if (SLAs) {
					//TAS.debug("the SLAs are:", SLAs);
					casterObj = getCasterObj(SLAs, abilityScores, hpMap, true);
					setter = createSLAEntries(setter, SLAs, casterObj);
				}
			}
			//TAS.debug("before parsing special abilities are:", specialAbilities);
			// content and special abilities ***************************
			if (v.content_compendium) {
				//TAS.debug("before parseSpecialAbilities attrnum:"+_.size(setter));
				specAbilObj = parseSpecialAbilities(v.content_compendium);
				
				//TAS.debug("returned from parse special ablities with", specAbilObj);
				if (specAbilObj) {
					if (specAbilObj.description && _.size(specAbilObj.description) > 0) {
						npcdesc = _.reduce(specAbilObj.description, function (memo, line) {
							memo += " ";
							memo += line;
							return memo;
						}, "");
						setter["character_description"] = npcdesc;
					}
					if (specAbilObj.specialAbilities) {
						specialAbilities = combineSpecialAbilities(specialAbilities, specAbilObj.specialAbilities);
					}
				} else {
					v['character-description']=v.content_compendium;
				}
				//TAS.debug("now special abilities are:", specialAbilities);
			}
			if (v.SQ_compendium) {
				//TAS.debug("found special qualities");
				specialQualities =  parseSpecialQualities(v.SQ_compendium);
				if (specialQualities){
					specialAbilities = combineSpecialAbilities(specialAbilities, specialQualities);
				}
			}
			if (specialAbilities && _.size(specialAbilities) > 0) {
				setter = createFeatureEntries(setter, specialAbilities, abilityScores);
				//look for sneak attack
				tempobj = _.find(specialAbilities,function(atkobj){return (/sneak.attack/i).test(atkobj.name);});
				if(tempobj){
					setter['global_precision_dmg_macro']='[[[[floor((@{level}+1)/2)]]d6]]';
					setter['global_precision_dmg_type']= tempobj.name;
				}
				
				//TAS.debug("after createFeatureEntries attrnum:" + _.size(setter));
			}

			// Misc *********************************************
			if (v.senses_compendium) {
				match = v.senses_compendium.match(/perception/i);
				if (match){
					setter["vision"] = v.senses_compendium.slice(0,match.index-1);
				} else {
					setter["vision"] = v.senses_compendium;
				}
			}
			if (v.speed_compendium) {
				speedMap = parseSpeed(v.speed_compendium);
				setter = createSpeedEntries(setter, speedMap, importantFeats);
			}
			if (v.alignment) {
				setter["alignment"] = v.alignment.toUpperCase();
			}
			if (v.space_compendium) {
				setter["space"] = parseSpace(v.space_compendium);
			}
			//TAS.debug("before skills attrnum:" + _.size(setter));
			// skills *********************************************************
			if (v.skills_compendium) {
				skillsMap = parseSkills(v.skills_compendium);
				classSkillArray = getCreatureClassSkills(v.type_compendium);
				if (v.racial_mods_compendium) {
					racialModsMap = parseSkillRacialBonuses(v.racial_mods_compendium);
				}
				if (skillsMap && _.size(skillsMap) > 0) {
					setter = createSkillEntries(setter, skillsMap, racialModsMap, abilityScores, importantFeats, classSkillArray, sizeMap, isUndead);
					//TAS.debug("after createSkillEntries attrnum:" + _.size(setter));
				}
			}
		} catch (err2) {
			TAS.error("importFromCompendium outer at end", err2);
		} finally {
			if (_.size(setter) > 0) {
				setter["npc_import_now"]=0;
				setter['npc-compimport-show']=0;
				TAS.info("##############################################","END OF importFromCompendium");
				setAttrs(setter, PFConst.silentParams, done);
			} else {
				setter["npc_import_now"]=0;
				setter['npc-compimport-show']=0;
				setAttrs(setter, PFConst.silentParams, errorDone);
			}
		}
	});
}

PFConsole.log('   NPCParser module loaded        ');
PFLog.modulecount++;
