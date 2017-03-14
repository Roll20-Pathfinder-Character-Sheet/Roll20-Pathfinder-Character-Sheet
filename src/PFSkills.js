'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog, PFConsole} from './PFLog';
import PFConst from './PFConst';
import * as SWUtils from './SWUtils';
import * as PFUtils from './PFUtils';
import * as PFMacros from './PFMacros';
import * as PFMigrate from './PFMigrate';
import * as PFUtilsAsync from './PFUtilsAsync';
import * as PFAbilityScores from './PFAbilityScores';

export var regularCoreSkills = ["Appraise", "Acrobatics", "Bluff", "Climb", "Diplomacy", "Disable-Device", "Disguise", "Escape-Artist", "Fly", "Handle-Animal", "Heal", "Intimidate", "Linguistics", "Perception", "Ride", "Sense-Motive", "Sleight-of-Hand", "Spellcraft", "Stealth", "Survival", "Swim", "Use-Magic-Device"],
regularBackgroundSkills = ["Appraise", "Handle-Animal", "Linguistics", "Sleight-of-Hand"],
regularAdventureSkills = ["Acrobatics", "Bluff", "Climb", "Diplomacy", "Disable-Device", "Disguise", "Escape-Artist", "Fly", "Heal", "Intimidate", "Perception", "Ride", "Sense-Motive", "Spellcraft", "Stealth", "Survival", "Swim", "Use-Magic-Device"],
regularBackgroundSkillsPlusKnow = regularBackgroundSkills.concat(["Knowledge-Engineering", "Knowledge-Geography", "Knowledge-History", "Knowledge-Nobility"]).sort(),
regularAdventurePlusKnow = regularAdventureSkills.concat(["Knowledge-Arcana", "Knowledge-Dungeoneering", "Knowledge-Local", "Knowledge-Nature", "Knowledge-Planes", "Knowledge-Religion"]).sort(),
//number that is appended to 10 versions of skills with subskills.
skillAppendNums = ["", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
//same but for misc-skill
miscSkillAppendNums = ["-0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"],
coreSkillsWithFillInNames = ["Craft", "Misc-Skill", "Perform", "Profession"],
backgroundOnlySkillsWithFillinNames = ["Artistry", "Lore"],
skillsWithFillInNames = coreSkillsWithFillInNames.concat(backgroundOnlySkillsWithFillinNames).sort(),
backgroundOnlySkills = SWUtils.cartesianAppend(backgroundOnlySkillsWithFillinNames, skillAppendNums),
knowledgeSubSkills = ["Arcana", "Dungeoneering", "Engineering", "Geography", "History", "Local", "Nature", "Nobility", "Planes", "Religion"],
coreSkillsWithSubSkills = coreSkillsWithFillInNames.concat(["Knowledge"]).sort(),
skillsWithSubSkills = skillsWithFillInNames.concat(["Knowledge"]).sort(),
knowledgeSkillAppends = _.map(knowledgeSubSkills, function (subskill) {
	return "-" + subskill;
}),
//for each skill array of the possible skills {"Craft":["Craft","Craft2"...],"Perform":["Perform","Perform2"...] }
subskillArrays = _.reduce(skillsWithSubSkills, function (memo, skill) {
	var appenders = (skill === "Misc-Skill") ? miscSkillAppendNums : (skill === "Knowledge") ? knowledgeSkillAppends : skillAppendNums;
	memo[skill] = SWUtils.cartesianAppend([skill], skillAppendNums);
	return memo;
}, {}),
backgroundCoreSkills = regularBackgroundSkillsPlusKnow.concat(subskillArrays["Craft"]).concat(subskillArrays["Perform"]).concat(subskillArrays["Profession"]).concat(["Misc-Skill-5", "Misc-Skill-6", "Misc-Skill-7", "Misc-Skill-8", "Misc-Skill-9"]).sort(),
adventureSkills = regularAdventurePlusKnow.concat(["Misc-Skill-0", "Misc-Skill-1", "Misc-Skill-2", "Misc-Skill-3", "Misc-Skill-4"]).sort(),
checkRTArray = ["-ReqTrain", "-ranks"],
baseGenMacro = "/w \"@{character_name}\" &{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} ",
skillHeaderMacro = "{{name=^{REPLACELOWER} ^{skills} }} ",
npcSkillHeaderMacro = "{{name=^{npc} ^{REPLACELOWER} ^{skills} }} ",
//  1 is the normal size modifier in size_skill, 2 is size_skill_double
sizeSkills = {
	"Fly": 1,
	"Stealth": 2,
	"CS-Stealth": 2
},
//these are for building the macros
knowledgeSubSkillsTranslateKeys = _.map(knowledgeSubSkills, function (key) {
	return key.toLowerCase();
}),
skillsWithSpaces = ["disable device", "escape artist", "sense motive", "handle animal", "use magic device", "sleight of hand"],
knowledgeSkills = _.map(knowledgeSubSkills, function (subskill) {
	return "Knowledge-" + subskill;
}),
backgroundSkills = backgroundCoreSkills.concat(backgroundOnlySkills).sort(),
allCoreSkills = adventureSkills.concat(backgroundCoreSkills).sort(),
consolidatedSkills = ["CS-Acrobatics", "CS-Athletics", "CS-Finesse", "CS-Influence", "CS-Nature", "CS-Perception", "CS-Performance", "CS-Religion", "CS-Society", "CS-Spellcraft", "CS-Stealth", "CS-Survival"],
allNonFillInSkills = regularCoreSkills.concat(knowledgeSkills).concat(consolidatedSkills).sort(),
nonMiscFillInSkillsInstances = SWUtils.cartesianAppend(["Craft", "Perform", "Profession", "Artistry", "Lore"], skillAppendNums),
miscFillInSkillsInstances =SWUtils.cartesianAppend(["Misc-Skill"], miscSkillAppendNums),
allFillInSkillInstances = nonMiscFillInSkillsInstances.concat(miscFillInSkillsInstances).sort(),
allTheSkills = allNonFillInSkills.concat(allFillInSkillInstances).sort(),
coreSkillAbilityDefaults = {
	"Acrobatics": "dex",
	"Appraise": "int",
	"Bluff": "cha",
	"Climb": "str",
	"Craft": "int",
	"Diplomacy": "cha",
	"Disable-Device": "dex",
	"Disguise": "cha",
	"Escape-Artist": "dex",
	"Fly": "dex",
	"Handle-Animal": "cha",
	"Heal": "wis",
	"Intimidate": "cha",
	"Knowledge-Arcana": "int",
	"Knowledge-Dungeoneering": "int",
	"Knowledge-Engineering": "int",
	"Knowledge-Geography": "int",
	"Knowledge-History": "int",
	"Knowledge-Local": "int",
	"Knowledge-Nature": "int",
	"Knowledge-Nobility": "int",
	"Knowledge": "int",
	"Knowledge-Planes": "int",
	"Knowledge-Religion": "int",
	"Linguistics": "int",
	"Perception": "wis",
	"Perform": "cha",
	"Profession": "wis",
	"Ride": "dex",
	"Sense-Motive": "wis",
	"Sleight-of-Hand": "dex",
	"Spellcraft": "int",
	"Stealth": "dex",
	"Survival": "wis",
	"Swim": "str",
	"Use-Magic-Device": "cha"
},

defaultSkillMacro='&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{REPLACELOWER}}} {{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}} @{REPLACE-ut} @{skill_options} @{REPLACE-cond-notes} {{generic_note=@{REPLACE-note}}}',
defaultSkillMacroMap = {
	'&{template:':{'current':'pf_generic}'},
	'@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
	'@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
	'{{color=':{'current':'@{rolltemplate_color}}}'},
	'{{header_image=':{'current':'@{header_image-pf_generic-skill}}}','old':['@{header_image-pf_generic}}}']},
	'{{character_name=':{'current':'@{character_name}}}'},
	'{{character_id=':{'current':'@{character_id}}}'},
	'{{subtitle}}':{'current':'{{subtitle}}'},
	'{{name=':{'current':'^{REPLACELOWER}}}','old':['REPLACE}}','@{REPLACE-name}}}','^{REPLACE}}}']},
	'{{Check=':{'current':'[[ @{skill-query} + [[ @{REPLACE} ]] ]]}}','old':['[[ 1d20 + [[ @{REPLACE} ]] ]]}}'],'replacements':[{'from':'1d20','to':'@{skill-query}'}]},
	'@{REPLACE-ut}':{'current':'@{REPLACE-ut}'},
	'@{skill_options}':{'current':'@{skill_options}'},
	'@{REPLACE-cond-notes}':{'current':'@{REPLACE-cond-notes}'},
	'{{generic_note=':{'current':'@{REPLACE-note}}}'}
},
defaultFillInSkillMacro='&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{REPLACELOWERREMOVENUMBER} @{REPLACE-name}}} {{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}} @{REPLACE-ut} @{skill_options} @{REPLACE-cond-notes} {{generic_note=@{REPLACE-note}}}',
defaultFillInSkillMacroMap = _.extend(_.clone(defaultSkillMacroMap),{
	'{{name=':{'current':'^{REPLACELOWERREMOVENUMBER} (@{REPLACE-name})}}','old':['REPLACEREMOVENUMBER (@{REPLACE-name})}}','REPLACE}}','@{REPLACE-name}}}'],'replacements':[{'from':'REPLACEREMOVENUMBER','to':'^{REPLACELOWERREMOVENUMBER}'}]}
}),
defaultMiscSkillMacro='&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{REPLACE}}} {{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}} @{REPLACE-ut} @{skill_options} @{REPLACE-cond-notes} {{generic_note=@{REPLACE-note}}}',
defaultMiscSkillMacroMap = _.extend(_.clone(defaultSkillMacroMap),{
	'{{name=':{'current':'@{REPLACE}}}','old':['Misc-Skill (@{REPLACE-name})}}']}
}),
defaultSkillDeletedMacroAttrs=['{{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}}'],
defaultSkillAttrName='REPLACE-macro',
keysNeedingReplacing = ['@{REPLACE-cond-notes}','@{REPLACE-ut}'],
valsNeedingReplacing = ['@{REPLACE-cond-notes}','@{REPLACE-ut}','{{check=','{{generic_note=','{{name='],
events = {
	skillGlobalEventAuto: "change:checks-cond change:phys-skills-cond change:acp",
	skillEventsAuto: "change:REPLACE-ability-mod change:REPLACE-misc-mod",
	skillEventsPlayer: "change:REPLACE-cs change:REPLACE-ranks change:REPLACE-racial change:REPLACE-trait change:REPLACE-feat change:REPLACE-item change:REPLACE-ReqTrain"
};

function migrateMacros (callback){
	var done = _.once(function(){
		TAS.debug("leaving PFSkills.migrateMacros");
		if (typeof callback === "function"){
			callback();
		}
	}),
	doneOne = _.after(3,function(){
		setAttrs({'migrated_skill_macrosv1':1},PFConst.silentParams,done);
	});
	try {
		TAS.debug("at PFSkills.migrateMacros");
		getAttrs(['migrated_skill_macrosv1'],function(v){
			if(! parseInt(v.migrated_skill_macrosv1,10)) {
				//TAS.debug"migrateMacros, calling migrateStaticMacrosMult on regular skills ");
				PFMacros.migrateStaticMacrosMult(doneOne,defaultSkillAttrName,defaultSkillMacro,defaultSkillMacroMap,null,allNonFillInSkills,keysNeedingReplacing,valsNeedingReplacing,false);
				PFMacros.migrateStaticMacrosMult(doneOne,defaultSkillAttrName,defaultFillInSkillMacro,defaultFillInSkillMacroMap,null,nonMiscFillInSkillsInstances,keysNeedingReplacing,valsNeedingReplacing,true);
				PFMacros.migrateStaticMacrosMult(doneOne,defaultSkillAttrName,defaultMiscSkillMacro,defaultMiscSkillMacroMap,null,miscFillInSkillsInstances,keysNeedingReplacing,valsNeedingReplacing,true);
			} else {
				done();
			}
		});
	} catch (err){
		done();
	}
}

/**appendToSubSkills - util to append the string to all 10 names of one type of skill (perform, craft, knowledge, etc)
 * adds the numbers from 0-9 or 1-10 or knowledge, then appends the string , to generate all 10 versions.
 * @param {string} skilllist The name of the skill in, member of skillsWithSubSkills
 * @param {string} appendToEnd The string to append.
 * @returns {Array[string]} array of skill names
 */
function appendToSubSkills (skilllist, appendToEnd) {
	return _.reduce(skilllist, function (memo, skill) {
		var appendnums = (skill === "Misc-Skill") ? miscSkillAppendNums : (skill === "Knowledge") ? knowledgeSkillAppends : skillAppendNums,
		appendArray = SWUtils.cartesianAppend([skill], appendnums, appendToEnd);
		return memo.concat(appendArray);
	}, []);
}
/* updateMaxSkills Calculates and sets maximum skill ranks. Minimum 1 per level.
 *  divides by 2 if using consolidated skills
 * @param {event} eventInfo - from event 
 * @callback {function} - callback when done
 */
function updateMaxSkills (eventInfo, callback) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	}),
	fields=["total-skill", "total-fcskill", "INT-mod", "level", "Max-Skill-Ranks-mod", "Max-Skill-Ranks", 
	"unchained_skills-show", "BG-Skill-Use","npc-skill","npc-hd-num",
	"class-0-skill","class-1-skill","class-2-skill","class-3-skill","class-4-skill","class-5-skill",
	"class-0-level","class-1-level","class-2-level","class-3-level","class-4-level","class-5-level"
	];
	getAttrs(fields, function (v) {
		var intMod = parseInt(v["INT-mod"], 10) || 0,
		classSkills = parseInt(v["total-skill"], 10) || 0,
		level = parseInt(v.level, 10) || 0,
		fcSkills = parseInt(v["total-fcskill"], 10) || 0,
		extra = parseInt(v["Max-Skill-Ranks-mod"], 10) || 0,
		currSkills = parseInt(v["Max-Skill-Ranks"], 10) || 0,
		totIntMod = 0,
		minSkills=0,
		i=0,
		thislvl=0,
		classPlusInt = 0,
		thisSkill=0,
		totAllSkills = 0,
		setter = {};
		try {
			for(i=0;i<6;i++){
				thislvl=parseInt(v['class-'+i+'-level'],10)||0;
				if (thislvl>0){
					thisSkill=( (parseInt(v['class-'+i+'-skill'],10)||0) * thislvl ) + (intMod * thislvl);
					if (thisSkill < thislvl){
						thisSkill=thislvl;
					}
					classPlusInt += thisSkill;
				}
			}
			thislvl = parseInt(v['npc-hd-num'],10)||0;
			thisSkill = parseInt(v['npc-skill'],10)||0;
			if (thislvl && thisSkill){
				thisSkill = thislvl * thisSkill + intMod * thislvl;
				if (thisSkill < thislvl){
					thisSkill=thislvl;
				}
				classPlusInt +=  thisSkill;
			}
			if (v["unchained_skills-show"] == "1" && (!v["BG-Skill-Use"] || v["BG-Skill-Use"] == "0")) {
				classPlusInt = Math.floor(classPlusInt / 2);
			}
			totAllSkills = classPlusInt + extra;
			if (totAllSkills < level){
				totAllSkills = level;
			}
			totAllSkills += fcSkills;
			if (currSkills !== totAllSkills) {
				setter["Max-Skill-Ranks"] = totAllSkills;
			}
		} catch (err) {
			TAS.error("PFSkills.updateMaxSkills", err);
		} finally {
			if (_.size(setter) > 0) {
				setAttrs(setter, {
					silent: true
				}, done);
			} else {
				done();
			}
		}
	});
}
/** verifyHasSkill - Checks to see if skill is in list of valid skills for this character (consolidated, background, core).
 * @param {string} skill = the skill name
 * @param {function} callback = a function that takes a a boolean as a first parameter.
 *   called with true if skill is part of valid list, or false if not.
 */
export function verifyHasSkill (skill, callback) {
	var first3 = '',
		first4 = '',
		core = false,
		bg = false,
		cs = false,
		isSub = false,
		fields = ["BG-Skill-Use", "unchained_skills-show"];
	try {
		if (skill && typeof callback === "function") {
			first4 = skill.slice(0, 4).toLowerCase();
			first3 = first4.slice(0, 3);
			if (first3 === 'cs-') {
				cs = true;
			} else if (first4 === 'arti' || first4 === 'lore') {
				bg = true;
			} else {
				core = true;
			}
			if (_.contains(allFillInSkillInstances, skill)) {
				isSub = true;
				fields = fields.concat([skill + "-name", skill + "-ranks"]);
			}
			getAttrs(fields, function (v) {
				var retval = false,
				usesBG=parseInt(v["BG-Skill-Use"],10)||0,
				usesUnchained=parseInt(v["unchained_skills-show"],10)||0;
				if (!isSub || v[skill + "-name"] || (parseInt(v[skill+"-ranks"],10)||0)>0) {
					if (core) {
						if (!usesUnchained || usesBG) {
							retval = true;
						}
					} else if (bg) {
						if (usesUnchained && usesBG) {
							retval = true;
						}
					} else {
						if (usesUnchained && !usesBG) {
							retval = true;
						}
					}
				}
				callback(retval);
			});
		}
	} catch (err) {
		TAS.error("PFSkills.verifyHasSkill", err);
		callback(false);
	}
}
/** updates one  skill row
 * @param {string} skill to update, must have same capitalization as on HTML
 * @param {function} callback = callback after done with params newvalue, oldvalue.
 * @param {boolean} silently = whether to update silently or not. ignored, always silent.
 */
export function updateSkill (skill, callback, silently) {
	var done = function (newVal, oldVal) {
		if (typeof callback === "function") {
			callback(newVal, oldVal);
		}
	},
	csNm = skill + "-cs",
	ranksNm = skill + "-ranks",
	classNm = skill + "-class",
	abNm = skill + "-ability",
	modNm = skill + "-ability-mod",
	racialNm = skill + "-racial",
	traitNm = skill + "-trait",
	featNm = skill + "-feat",
	itemNm = skill + "-item",
	miscNm = skill + "-misc-mod",
	utNm = skill + "-ut",
	rtNm = skill + "-ReqTrain";
	getAttrs([skill, csNm, ranksNm, classNm, abNm, modNm, racialNm, traitNm, featNm, itemNm, miscNm, rtNm, utNm, "enforce_requires_training", "size_skill", "size_skill_double", "acp", "checks-cond", "Phys-skills-cond", "Perception-cond"], function (v) {
		var skillSize = 0,
		adj,
		skillTot = 0,
		setter = {},
		params = {},
		mods = "",
		setAny = 0,
		cond = 0,
		cs = parseInt(v[csNm], 10) || 0,
		currSkill = parseInt(v[skill], 10), //no default
		ranks = parseInt(v[ranksNm], 10) || 0,
		rt = parseInt(v[rtNm], 10) || 0,
		allCond = parseInt(v["checks-cond"], 10) || 0,
		abilityName = '',
		physCond = 0,
		perCond = 0,
		watchrt = parseInt(v["enforce_requires_training"], 10) || 0;
		try {
			abilityName = PFUtils.findAbilityInString(v[abNm]);
			if (rt && ranks === 0) {
				if (v[utNm] !== "{{untrained=1}}") {
					setter[utNm] = "{{untrained=1}}";
				}
			} else if (v[utNm] !== "{{untrained=}}") {
				setter[utNm] = "{{untrained=}}"; //cannot set to "" because then it chooses the default which is "{{untrained=1}}"
			}
			if (ranks && cs) {
				skillTot += 3;
				mods = "3/";
			} else {
				mods = "0/";
			}
			if (abilityName === "DEX-mod" || abilityName === "STR-mod") {
				adj = parseInt(v["acp"], 10) || 0;
				skillTot += adj;
				mods += adj + "/";
			} else {
				mods += "0/";
			}
			skillSize = sizeSkills[skill];
			if (skillSize) {
				if (skillSize === 1) {
					adj = parseInt(v["size_skill"], 10) || 0;
					skillTot += adj;
					mods += adj + "/";
				} else if (skillSize === 2) {
					adj = parseInt(v["size_skill_double"], 10) || 0;
					skillTot += adj;
					mods += adj + "/";
				}
			} else {
				mods += "0/";
			}
			if (abilityName === "DEX-mod" || abilityName === "STR-mod") {
				physCond = parseInt(v["Phys-skills-cond"], 10) || 0;
			}
			if (skill === "Perception" || skill === "CS-Perception") {
				perCond = parseInt(v["Perception-cond"], 10) || 0;
			}
			cond = allCond + physCond + perCond;
			mods += cond;
			skillTot += ranks + cond + (parseInt(v[modNm], 10) || 0) + (parseInt(v[racialNm], 10) || 0) + (parseInt(v[traitNm], 10) || 0) + (parseInt(v[featNm], 10) || 0) + (parseInt(v[itemNm], 10) || 0) + (parseInt(v[miscNm], 10) || 0);
			if (currSkill !== skillTot) {
				setter[skill] = skillTot;
			}
			if (v[classNm]  !== mods) {
				setter[classNm] = mods;
			}
		} catch (err) {
			TAS.error(err);
		} finally {
			if (_.size(setter) > 0) {
				setAttrs(setter, {
					silently: true
				}, function () {
					done(skillTot, currSkill);
				});
			} else {
				done(currSkill, currSkill);
			}
		}
	});
}
/**recalculateSkillDropdowns recalculates ability dropdowns for all skills in list silently
 * @param {Array} skills list of skills
 * @param {function} callback callback when done
 * @param {function} errorCallback callback if error encountered creating field list to get.
 */
function recalculateSkillDropdowns (skills, callback, errorCallback) {
	var doneDrop = _.once(function () {
		TAS.debug("Leaving PFSkills.recalculateSkillDropdowns");
		if (typeof callback === "function") {
			callback();
		}
	}),
	fields = ["STR-mod", "DEX-mod", "CON-mod", "INT-mod", "WIS-mod", "CHA-mod"];
	try {
		fields = _.reduce(skills, function (memo, skill) {
			memo.push(skill + "-ability");
			memo.push(skill + "-ability-mod");
			return memo;
		}, fields);
	} catch (err) {
		TAS.error("PFSkills.recalculateSkillDropdowns could not create field list", err);
		if (typeof errorCallback === "function") {
			errorCallback();
		}
		return;
	}
	//first do all dropdowns at once
	getAttrs(fields, function (v) {
		var setter = {},
		abilityMods;
		try {
			//TAS.debug("PFSkills.recalculateSkillDropdowns got attrs",v);
			//create short list of 6 modifiers. 
			abilityMods = _.reduce(PFAbilityScores.abilitymods, function (memo, mod) {
				memo[mod] = parseInt(v[mod], 10) || 0;
				return memo;
			}, {});
			//TAS.debug("at PFSkills.recalculateSkillDropdowns abilities are ",abilityMods);
			setter = _.reduce(skills, function (memo, skill) {
				var ability='' ,newval=0,currVal=0;
				try {
					ability = PFUtils.findAbilityInString(v[skill + "-ability"]);
					if (ability) {
						newval = abilityMods[ability];
						currVal = parseInt(v[skill + "-ability-mod"], 10);
						//TAS.debug("examining skill:"+skill+", ability:"+ability+", currVal:"+currVal+", newval:"+newval);
						if (isNaN(currVal) || newval !== currVal) {
							//TAS.info("setting "+skill + "-ability-mod to "+newval);
							memo[skill + "-ability-mod"] = newval;
						}
					}
				} catch (err) {
					TAS.error("PFSkills.recalculateSkillDropdowns INSIDE REDUCE " + skill, err);
				} finally {
					return memo;
				}
			}, {} );
		} catch (err2) {
			TAS.error("PFSkills.recalculateSkillDropdowns inner", err2);
		} finally {
			try {
				//TAS.debug("PFSkills.recalculateSkillDropdowns about to set ");
				//TAS.debug("PFSkills.recalculateSkillDropdowns setting",setter);
				if (_.size(setter) > 0) {
					setAttrs(setter, PFConst.silentParams, function(){
						//TAS.debug("PFSkills.recalculateSkillDropdowns resturned from setAttrs!");
						doneDrop();
					});
				} else {
					doneDrop();
				}
			} catch (err3){
				TAS.error("PFSkills.recalculateSkillDropdowns err3",err3);
				doneDrop();
			}
		}
	});
}
/** recalculateSkillArray recalculates skills first dropdown, then misc mod, then skill total.
 * calls updateSkill for each. Does all dropdowns at once since they are easy to merge into one.
 * @param {Array} skills array of skills to update.
 * @param {function} callback when done
 * @param {boolean} silently whether to call setAttrs of skill total with silent or not.
 */
function recalculateSkillArray (skills, callback, silently) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	}),
	skillCount = _.size(skills),
	skillsHandled = 0,
	doneMisc = function (skill) {
		//TAS.debug("PFSkills.recalculateSkillArray done with misc skills call updateSkill on "+skill);
		//final: update each skill
		updateSkill(skill, done, silently);
	},
	doneDrop = function () {
		//second do misc one by one (since it is asynchronous)
		_.each(skills, function (skill) {
			SWUtils.evaluateAndSetNumber(skill + "-misc", skill + "-misc-mod", 0, function () {
				doneMisc(skill);
			}, true);
		});
	};
	//TAS.debug("at PFSkills.recalculateSkillArray for ",skills);
	recalculateSkillDropdowns(skills, doneDrop, done);
}
function recalculateSkills (callback, silently) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["unchained_skills-show", "BG-Skill-Use"], function (v) {
		try {
			if (v["unchained_skills-show"] == "1") {
				if (v["BG-Skill-Use"] == "1") {
					TAS.debug("PFSkills.recalculate: has background skills");
					recalculateSkillArray(backgroundOnlySkills, null, silently);
					//return after long one
					recalculateSkillArray(allCoreSkills, done, silently);
				} else {
					TAS.debug("PFSkills.recalculate: has consolidatedSkills skills");
					recalculateSkillArray(consolidatedSkills, done, silently);
				}
			} else {
				TAS.debug("PFSkills.recalculate: has core skills skills");
				recalculateSkillArray(allCoreSkills, done, silently);
			}
		} catch (err) {
			TAS.error("PFSKills.recalculate", err);
			done();
		}
	});
}
/** updates the macros for only the 7 subskill rolltemplates 
 * @param {boolean} background -if background skills turned on
 * @param {boolean} rt - if Enforce Requires Training checked 
 * @param {event} eventInfo ?
 * @param {jsobject_map} currMacros map of parent skill button name to command macro. (knowledge, Perform, etc)
 * @param {boolean} isNPC - if sheet is NPC
 * @param {boolean} showBonus - if skill total should be displayed on button.
 */
function updateSubSkillMacroBook (background, rt, eventInfo, currMacros, isNPC, showBonus) {
	var headerString = isNPC ? npcSkillHeaderMacro : skillHeaderMacro,
	skillPrefix = isNPC ? "NPC-" : "",
	assembleSubSkillButtonArray = function (skill, shouldEnforce, v) {
		var appendnums = (skill === "Misc-Skill") ? miscSkillAppendNums : (skill === "Knowledge") ? knowledgeSkillAppends : skillAppendNums,
		subskills = SWUtils.cartesianAppend([skill], appendnums),
		firstPass = [];
		if (skill === "Knowledge") {
			firstPass = subskills;
			return firstPass; //knowledge rollable even if untrained
		}
		firstPass = _.filter(subskills, function (subskill) {
			if (v[subskill + "-name"]) {
				return true;
			}
			return false;
		});
		if (!shouldEnforce) {
			return firstPass;
		}
		return _.filter(firstPass, function (skill) {
			if ((parseInt(v[skill + "-ReqTrain"], 10) || 0) === 0 || (parseInt(v[skill + "-ranks"], 10) || 0) > 0) {
				return true;
			}
			return false;
		});
	},
	getKnowledgeButtonMacro = function (showBonus) {
		var bonusStr = showBonus ? "+ @{REPLACE}" : "",
		knowledgebutton = "[^{REPLACENAME}" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ";
		return headerString.replace('REPLACELOWER', 'knowledge') + "{{ " + _.reduce(knowledgeSubSkillsTranslateKeys, function (memo, subskill, idx) {
			memo += knowledgebutton.replace(/REPLACENAME/g, subskill).replace(/REPLACE/g, knowledgeSkills[idx]);
			return memo;
		}, "") + " }}";
	},
	getSubSkillButtonMacro = function (skill, skillArray, showBonus,v) {
		var skillTransKey = skill.toLowerCase(),
		bonusStr = showBonus ? "+ @{REPLACE}" : "",
		baseMacro = headerString.replace('REPLACELOWER', skillTransKey),
		singleRowButton = "[REPLACENAME" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ",
		tempstr = "";
		if (skill === "Knowledge") {
			return getKnowledgeButtonMacro();
		}
		tempstr = _.reduce(skillArray, function (memo, subskill, idx) {
			var buttonName = v[subskill+"-name"];
			if (buttonName){
				buttonName = SWUtils.escapeForChatLinkButton(buttonName);
				buttonName = SWUtils.escapeForRollTemplate(buttonName);
			} else {
				buttonName = "@{"+subskill+"-name}";
			}
			memo += singleRowButton.replace(/REPLACENAME/g, buttonName).replace(/REPLACE/g, subskill);
			return memo;
		}, "");
		if (!tempstr) {
			tempstr = "description = ^{no-skills-available}";
		}
		return baseMacro + "{{ " + tempstr + " }}";
	},
	subskillParents = background ? skillsWithFillInNames : coreSkillsWithFillInNames,
	allsubskillFields = appendToSubSkills(subskillParents, ["-name"]);
	if (rt) {
		allsubskillFields = allsubskillFields.concat(
		appendToSubSkills(subskillParents, checkRTArray)
		);
		allsubskillFields = allsubskillFields.sort();
		//allsubskillFields.concat(appendToSubSkills(subskillParents, checkRTArray)).sort();
	}
	//TAS.debug("updateSubSkillMacroBook: allsubskillFields are:", allsubskillFields);
	getAttrs(allsubskillFields, function (v) {
		var setter = {},
		tempKMac = "";
		//TAS.debug("updateSubSkillMacroBook: event and data are:", eventInfo, v);
		_.each(subskillParents, function (skill) {
			var canshowarray = assembleSubSkillButtonArray(skill, rt, v),
			tempMacro = getSubSkillButtonMacro(skill, canshowarray, showBonus,v);
			tempMacro = baseGenMacro + tempMacro;
			if (currMacros[skillPrefix + skill.toLowerCase() + "_skills-macro"] !== tempMacro) {
				setter[skillPrefix + skill.toLowerCase() + "_skills-macro"] = tempMacro;
			}
		});
		if (currMacros[skillPrefix + "knowledge_skills-macro"]) {
			tempKMac = baseGenMacro + getKnowledgeButtonMacro(showBonus);
			if (currMacros[skillPrefix + "knowledge_skills-macro"] !== tempKMac) {
				setter[skillPrefix + "knowledge_skills-macro"] = tempKMac;
			}
		}
		if (_.size(setter) > 0) {
			setAttrs(setter, PFConst.silentParams);
		}
	});
}
function assembleSkillButtonArray (skills, shouldEnforce, sv) {
	if (!shouldEnforce) {
		return skills;
	}
	return _.filter(skills, function (skill) {
		if (/^Knowled|^Linguis|^Sleight/i.test(skill.slice(0, 7)) || (parseInt(sv[skill + "-ReqTrain"],10)||0) !== 1 || (parseInt(sv[skill + "-ranks"], 10) || 0) > 0) {
			return true;
		}
		return false;
	});
}
function getSkillButtonMacro (name, skillArray, showBonus, isNPC) {
	var skillTransKey = name.toLowerCase(),
	skillPrefix = isNPC ? "NPC-" : "",
	bonusStr = showBonus ? " + @{REPLACE}" : "",
	baseMacro = "{{name= ^{" + skillTransKey + "} }} ",
	npcBaseMacro = "{{name= ^{npc} ^{" + skillTransKey + "} }} ",
	rowbutton = "[^{REPLACELOWER}" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ",
	subskillbutton = "[^{REPLACELOWER}](~@{character_id}|" + skillPrefix + "REPLACELOWERMAC_skills_buttons_macro) ",
	baseToSend = isNPC?npcBaseMacro:baseMacro, 
	tempstr="";
	try {
		tempstr = _.reduce(skillArray, function (memo, skill, idx) {
			var thistranskey = skill.toLowerCase(),
			thisbutton = (_.contains(skillsWithSubSkills, skill)) ? subskillbutton : rowbutton;
			thisbutton = thisbutton.replace(/REPLACELOWERMAC/g, thistranskey);
			thisbutton = thisbutton.replace(/REPLACELOWER/g, thistranskey);
			thisbutton = thisbutton.replace(/REPLACE/g, skill);
			memo += thisbutton + " ";
			return memo;
		}, "");
		if (!tempstr) {
			tempstr = "^{no-skills-available} ";
		}
	} finally {
		return baseToSend + "{{ " + tempstr + "}}";
	}
}
function resetOneCommandMacro (callback, eventInfo, isNPC,showBonus,unchained,background,consolidated,rt){
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	}),
	skillPrefix = isNPC ? "NPC-" : "";
	getAttrs([skillPrefix+"skills-macro", skillPrefix+"background_skills-macro", skillPrefix+"adventure_skills-macro", 
			skillPrefix+"artistry_skills-macro", skillPrefix+"lore_skills-macro", skillPrefix+"craft_skills-macro", skillPrefix+"knowledge_skills-macro",
			skillPrefix+"perform_skills-macro", skillPrefix+"profession_skills-macro", skillPrefix+"misc-skill_skills-macro"], function (v) {
		var i = 0,
		setter = {},
		tempSkillArray = [],
		tempMacro = "",
		allskillstitle = "skills",
		coreArray;
		if (!consolidated) {
			updateSubSkillMacroBook(background, rt, eventInfo, v, isNPC, showBonus);
			//skills without sub skills
			if (rt) {
				getAttrs(SWUtils.cartesianAppend(regularCoreSkills, checkRTArray), function (v) {
					var canshowarray = [],
					tempRTMacro = "",
					temparray = [];
					try {
						if (background) {
							canshowarray = assembleSkillButtonArray(regularBackgroundSkills, rt, v) || [];
							temparray = temparray.concat(canshowarray);
							canshowarray = canshowarray.concat(skillsWithSubSkills).sort();
							tempRTMacro = baseGenMacro + getSkillButtonMacro("background-skills", canshowarray, showBonus, isNPC);
							if (v[skillPrefix + "background_skills-macro"] !== tempRTMacro) {
								setter[skillPrefix + "background_skills-macro"] = tempRTMacro;
							}
							canshowarray = assembleSkillButtonArray(regularAdventureSkills, rt, v) || [];
							temparray = temparray.concat(canshowarray);
							canshowarray = canshowarray.concat(["Knowledge","Misc-Skill"]).sort();
							tempRTMacro = baseGenMacro + getSkillButtonMacro("adventure-skills", canshowarray, showBonus, isNPC);
							if (v[skillPrefix + "adventure_skills-macro"] !== tempRTMacro) {
								setter[skillPrefix + "adventure_skills-macro"] = tempRTMacro;
							}
							temparray = temparray.concat(skillsWithSubSkills).sort();
						} else {
							canshowarray = assembleSkillButtonArray(regularCoreSkills, rt, v) || [];
							temparray = temparray.concat(canshowarray).concat(coreSkillsWithSubSkills).sort();
						}
						tempRTMacro = baseGenMacro + getSkillButtonMacro("skills", temparray, showBonus, isNPC);
						if (v[skillPrefix + "skills-macro"] !== tempRTMacro) {
							setter[skillPrefix + "skills-macro"] = tempRTMacro;
						}
					} catch (errRT){
						TAS.error("PFSkills.resetOneCommandMacro errRT",errRT);
					} finally {
						if (_.size(setter) > 0) {
							setAttrs(setter, PFConst.silentParams, done);
						} else {
							done();
						}
					}
				});
			} else {
				try {
					coreArray = regularCoreSkills.concat(coreSkillsWithSubSkills);
					//no require training
					if (background) {
						coreArray = coreArray.concat(["Artistry", "Lore"]).sort();
						allskillstitle = "all-skills";
						tempSkillArray = regularBackgroundSkills.concat(skillsWithSubSkills).sort();
						tempMacro = getSkillButtonMacro("background-skills", tempSkillArray, showBonus, isNPC);
						setter[skillPrefix + "background_skills-macro"] = baseGenMacro + tempMacro;
						tempSkillArray = regularAdventureSkills.concat(["Knowledge"]).sort();
						tempMacro = getSkillButtonMacro("adventure-skills", tempSkillArray, showBonus, isNPC);
						setter[skillPrefix + "adventure_skills-macro"] = baseGenMacro + tempMacro;
					}
					tempMacro = baseGenMacro + getSkillButtonMacro(allskillstitle, coreArray, showBonus, isNPC);
					if (v[skillPrefix + "skills-macro"] !== tempMacro) {
						setter[skillPrefix + "skills-macro"] = tempMacro;
					}
				} catch (errReg){
					TAS.error("PFSkills.resetOneCommandMacro errReg",errReg);
				} finally {
					if (_.size(setter>0)){
						setAttrs(setter,PFConst.silentParams, done);
					} else {
						done();
					}
				}
			}
		} else {
			//consolidated
			if (rt) {
				getAttrs(SWUtils.cartesianAppend(consolidatedSkills, ["-ReqTrain", "-ranks"]), function (sv) {
					var canshowarray, setter = {}, tempMacro ;
					canshowarray = assembleSkillButtonArray(consolidatedSkills, rt, sv);
					tempMacro = getSkillButtonMacro("skills", canshowarray, showBonus);
					setter[skillPrefix + "consolidated_skills-macro"] = baseGenMacro + tempMacro;
					setAttrs(setter,PFConst.silentParams, done);
				});
			} else {
				tempMacro = getSkillButtonMacro("skills", consolidatedSkills, showBonus);
				setter[skillPrefix + "consolidated_skills-macro"] = baseGenMacro + tempMacro;
				setAttrs(setter,PFConst.silentParams, done);
			}
		}
	});
}
export function resetCommandMacro (eventInfo, callback) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["BG-Skill-Use", "unchained_skills-show", "enforce_requires_training", "is_npc", "include_skill_totals"],function(vout){
		var isNPC = parseInt(vout["is_npc"], 10) || 0,
		skillPrefix = isNPC ? "NPC-" : "",
		showBonus = parseInt(vout.include_skill_totals, 10) || 0,
		unchained = parseInt(vout["unchained_skills-show"], 10) || 0,
		background = unchained && (parseInt(vout["BG-Skill-Use"], 10) || 0),
		consolidated = unchained && (!background),
		rt = parseInt(vout["enforce_requires_training"], 10) || 0;
		resetOneCommandMacro(done,eventInfo,isNPC,showBonus,unchained,background,consolidated,rt);
		if (isNPC){
			resetOneCommandMacro(done,eventInfo,false,showBonus,unchained,background,consolidated,rt);
		}
	});
}
export function applyConditions (callback,silently,eventInfo){
	var done = function () {
		if (typeof callback === "function") {
			callback();
		}
	},		
	updateSkillArray  = function(skills){
		_.each(skills,function(skill){
			updateSkill(skill);
		});
	};
	//TAS.debug("at apply conditions");
	getAttrs(["unchained_skills-show", "BG-Skill-Use"], function (v) {
		try {
			if (v["unchained_skills-show"] == "1") {
				if (v["BG-Skill-Use"] == "1") {
					//TAS.debug("PFSkills.recalculate: has background skills");
					updateSkillArray(backgroundOnlySkills);
					//return after long one
					updateSkillArray(allCoreSkills);
				} else {
					//TAS.debug("PFSkills.recalculate: has consolidatedSkills skills");
					updateSkillArray(consolidatedSkills);
				}
			} else {
				//TAS.debug("PFSkills.recalculate: has core skills skills");
				updateSkillArray(allCoreSkills);
			}
		} catch (err) {
			TAS.error("PFSKills.applyConditions", err);
			done();
		}
	});
}
/** migrate skills
 * @param {function} callback callback when done
 * @param {number} oldversion old version , -1 if hit recalc
 */
export function migrate (callback, oldversion) {
	var done = _.once(function () {
		TAS.debug("leaving PFSkills.migrate");
		if (typeof callback === "function") {
			callback();
		}
	}),
	doneOne = _.after(3,done),
	/** migrateOldClassSkillValue - converts class skill checkboxes from old autocalc string to number "" or 3.
	* @param {function} callback ?
	* @param {number} oldversion ?
	*/
	migrateOldClassSkillValue = function (callback, oldversion) {
		var done = _.once(function () {
			if (typeof callback === "function") {
				callback();
			}
		}),
		migrateClassSkill = function (skill) {
			var csNm = skill + "-cs";
			getAttrs([csNm], function (v) {
				var setter = {};
				if (isNaN(parseInt(v[csNm], 10))) {
					if (! (!v[csNm] || v[csNm] == "0") ) {
						//TAS.debug({"function":"migrateClassSkill","raw":v[csNm],"cs":cs});
						setter[csNm] = 3;
						setAttrs(setter, PFConst.silentParams);
					}
				}
			});
		},
		migrateClassSkillArray = function (skills) {
			skills.forEach(function (skill) {
				migrateClassSkill(skill);
			});
		},
		determineArray = function () {
			migrateClassSkillArray(allTheSkills);
			//not bothering to code correctly to wait since this is almost a year old.
			setAttrs({classSkillsMigrated: 1}, PFConst.silentParams,done);
		};
		getAttrs(["classSkillsMigrated"], function (vm) {
			if (!(parseInt(vm.classSkillsMigrated, 10) || 0)) {
				determineArray();
			}
			done();
		});
	},
	/** setAdvancedMacroCheckbox - part of migrate .66 to 1.00 sets checkbox to unhide advanced
	* skillmacro (investigator) if character sheet already using it.)
	* @param {function} callback ?
	*/
	setAdvancedMacroCheckbox = function (callback) {
		var done = _.once(function () {
			if (typeof callback === "function") {
				callback();
			}
		});
		getAttrs(["adv_macro_show", "skill-invest-query"], function (v) {
			var showAdv = parseInt(v.adv_macro_show, 10) || 0;
			if (v["skill-invest-query"] && !showAdv) {
				setAttrs({adv_macro_show: 1}, PFConst.silentParams, done);
			}
		});
	};
	//TAS.debug("at PFSkills.migrate");
	migrateOldClassSkillValue(doneOne);
	migrateMacros(doneOne);
	PFMigrate.migrateMaxSkills(doneOne);
}
/* recalculate - updates ALL skills  - calls PFUtilsAsync.setDropdownValue for ability then updateSkill */
export function recalculate (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.info("leaving PFSkills.recalculate");
		resetCommandMacro();
		if (typeof callback === "function") {
			callback();
		}
	});
	TAS.debug("PFSkills.recalculate");
	migrate(function () {
		//TAS.debug"PFSkills.recalculate back from PFSkills.migrate");
		updateMaxSkills();
		recalculateSkills(done, silently);
	}, oldversion);
}
function registerEventHandlers () {
	//SKILLS************************************************************************
	on("change:total-skill change:total-fcskill change:int-mod change:level change:max-skill-ranks-mod change:unchained_skills-show change:BG-Skill-Use", TAS.callback(function eventUpdateMaxSkills(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "sheetworker") {
			updateMaxSkills(eventInfo);
		}
	}));
	on(events.skillGlobalEventAuto, TAS.callback(function eventGlobalConditionAffectingSkill(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + eventInfo.sourceType);
		if (eventInfo.sourceType === "sheetworker") {
			applyConditions(null,null,eventInfo);
		}
	}));		
	//each skill has a dropdown handler and a skill update handler
	//concat them all up, only happens once so no big deal
	_.each(allTheSkills, function (skill) {
		on((events.skillEventsAuto.replace(/REPLACE/g, skill)), TAS.callback(function eventSkillsAuto(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
			if (eventInfo.sourceType === "sheetworker") {
				verifyHasSkill(skill, function (hasSkill) {
					if (hasSkill) {
						updateSkill(skill, eventInfo);
					}
				});
			}
		}));
		on((events.skillEventsPlayer.replace(/REPLACE/g, skill)), TAS.callback(function eventSkillsPlayer(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
			if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
				verifyHasSkill(skill, function (hasSkill) {
					if (hasSkill) {
						updateSkill(skill, eventInfo);
					}
				});
			}
		}));
		on("change:" + skill + "-ability", TAS.callback(function eventSkillDropdownAbility(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			verifyHasSkill(skill, function (hasSkill) {
				if (hasSkill) {
					PFUtilsAsync.setDropdownValue(skill + "-ability", skill + "-ability-mod");
				}
			});
		}));
		on("change:" + skill + "-misc", TAS.callback(function eventSkillMacroAbility(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			verifyHasSkill(skill, function (hasSkill) {
				if (hasSkill) {
					SWUtils.evaluateAndSetNumber(skill + "-misc", skill + "-misc-mod");
				}
			});
		}));
		//these always displayed if rt or not
		if (skill.slice(0, 9) !== "Knowledge" && skill !== "Linguistics" && skill !== "Sleight-of-Hand") {
			on("change:" + skill + "-ReqTrain change:" + skill + "-ranks", TAS.callback(function eventSkillRequiresTrainingRanks(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
				if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
					verifyHasSkill(skill, function (hasSkill) {
						getAttrs(["enforce_requires_training"], function (v) {
							if (v.enforce_requires_training == "1") {
								resetCommandMacro(eventInfo);
							}
						});
					});
				}
			}));
		}
		//end of skill loop
	});
	//skills affected by size
	_.each(sizeSkills, function (mult, skill) {
		if (mult === 1) {
			on("change:size_skill", TAS.callback(function eventUpdateSizeSkill(eventInfo) {
				if (eventInfo.sourceType === "sheetworker") {
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
					updateSkill(skill, eventInfo);
				}
			}));
		} else if (mult === 2) {
			on("change:size_skill_double", TAS.callback(function eventUpdateSizeSkillDouble(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker") {
					updateSkill(skill, eventInfo);
				}
			}));
		}
	});
	on("change:enforce_requires_training", TAS.callback(function eventRequiresTraining(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			resetCommandMacro(eventInfo);
		}
	}));
	_.each(SWUtils.cartesianAppend(allFillInSkillInstances, ["-name"]), function (skill) {
		on("change:" + skill, TAS.callback(function eventSkillsWithFillInNames(eventInfo) {
			if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				var rt = skill.slice(0, -4) + "ReqTrain",
				r = skill.slice(0, -4) + "ranks";
				//if we changed name on a skill that isn't choosable don't bother.
				getAttrs(["enforce_requires_training", rt, r, "unchained_skills-show", "BG-Skill-Use", "artistry_skills-macro", "lore_skills-macro", "craft_skills-macro", "knowledge_skills-macro", "perform_skills-macro", "profession_skills-macro", "misc-skill_skills-macro", "is_npc", "include_skill_totals", "NPC-craft_skills-macro", "NPC-knowledge_skills-macro", "NPC-perform_skills-macro", "NPC-profession_skills-macro", "NPC-misc-skill_skills-macro"], function (v) {
					var isrt = parseInt(v.enforce_requires_training, 10),
					bg = 0,
					isNPC = parseInt(v.is_npc, 10) || 0,
					showBonus = parseInt(v.include_skill_totals, 10) || 0;
					if (!(isrt && parseInt(v[rt], 10) && isNaN(parseInt(v[r], 10)))) {
						bg = isNPC ? 0 : ((parseInt(v["unchained_skills-show"], 10) || 0) && (parseInt(v["BG-Skill-Use"], 10) || 0));
						//TAS.debug"calling updatesubskillmacro: bg:" + bg + ",isrt:" + isrt);
						updateSubSkillMacroBook(bg, isrt, eventInfo, v, isNPC, showBonus);
					}
				});
			}
		}));
	});
	//reset based on config changes
	on("change:unchained_skills-show change:BG-Skill-Use change:include_skill_totals", TAS.callback(function eventResetUnchainedSkills(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			recalculate(eventInfo, function(){resetCommandMacro(eventInfo);});
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFSkills module loaded         ' );
PFLog.modulecount++;
