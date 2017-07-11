'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFMigrate from './PFMigrate';
import * as PFDefense from './PFDefense';
import * as PFSize from './PFSize';
import * as PFUtilsAsync  from './PFUtilsAsync';
import * as PFInitiative from './PFInitiative';
import * as PFSkills from './PFSkills';
import * as PFEncumbrance from './PFEncumbrance';
import * as PFInventory from './PFInventory';
import * as PFAbilityScores from './PFAbilityScores';
import * as PFBuffs from './PFBuffs';
import * as PFSaves from './PFSaves';
import * as PFHealth from  './PFHealth';
import * as PFChecks from './PFChecks';
import * as PFAbility from './PFAbility';
import * as PFNPC from './PFNPC';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFAttackOptions from './PFAttackOptions';
import * as PFAttacks from './PFAttacks';
import * as PFFeatures from './PFFeatures';
import * as PFSpells from './PFSpells';
import * as PFSpellCasterClasses from './PFSpellCasterClasses';
import * as PFPsionic from './PFPsionic';
import * as PFMythic from './PFMythic';
import * as PFClassRaceGrid from './PFClassRaceGrid';
import * as PFConditions from './PFConditions';
import * as PFNPCParser from './PFNPCParser';
import * as PFHorror from './PFHorror';

function expandAll  () {
	getAttrs(["expandall"], function (v) {
		var skilltab = "4",
		setter = {};
		if (parseInt(v["expandall"],10)) {
			//set expandall to 0
			//set tabs to "all"
			//set conditions and buffs to "show"
			//set all others to default (which is "show")
			SWUtils.setWrapper({
				"expandall": "0",
				pagetab: "99",
				abilities_tab: "99",
				"npc-abilities_tab": "99",
				skills_tab: "99",
				spellclass_tab: "99",
				spells_tab: "99",
				npc_spellclass_tab: "99",
				equipment_tab: "99",
				'sheet-conditions-show':0,
				'buffstop-show':0,
				'command-buttons-show':0,
				'NPC-command-buttons-show':0,
				'character-details-show':0,
				'ability-scores-show':0,
				'class-info-show':0,
				'class1_show':0,
				'class2_show':0,
				'class3_show':0,
				'health-and-wounds-show':0,
				'initiative-show':0,
				'macro-text-show':0,
				'notes-show':0,
				'saves-show':0,
				'extra_fields_saves_show':1,
				'extra_fields_spells_show':1,
				'extra_fields_caster_show':1,
				'defense-values-show':0,
				'armor-shield-show':0,
				'sanity-show':0,
				'defense-notes-show':0,
				'attack-bonuses-show':0,
				'atkm2_show':0,
				'attack-notes-show':0,
				'attack-options-show':0,
				'two-weapon-show':0,
				'attacks-show':0,
				'skill-ranks-show':0,
				'skill_options-show':0,
				'skills-show':0,
				'artistry-show':0,
				'craft-show':0,
				'knowledge-show':0,
				'lore-show':0,
				'perform-show':0,
				'profession-show':0,
				'misc-show':0,
				'skill-notes-show':0,
				'ability-command-buttons-show':0,
				'NPC-ability-command-buttons-show':0,
				'feats-show':0,
				'mythic-info-show':0,
				'psionic-info-show':0,
				'abilities-show':0,
				'spellclasses-show':0,
				'spellclass-0-show':0,
				'spellclass-0-spellpoints-show':0,
				'spellclass-0-spells-notes-show':0,
				'spellclass-0-perday-show':0,
				'spellclass-0-domains-show':0,
				'domain02_show':0,
				'domain03_show':0,
				'spellclass-1-show':0,
				'spellclass-1-spellpoints-show':0,
				'spellclass-1-spells-notes-show':0,
				'spellclass-1-perday-show':0,
				'spellclass-1-domains-show':0,
				'spellclass-2-show':0,
				'spellclass-2-spellpoints-show':0,
				'spellclass-2-spells-notes-show':0,
				'spellclass-2-perday-show':0,
				'spellclass-2-domains-show':0,
				'spelloptions-show':0,
				'spell-lists-show':0,
				'currency-show':0,
				'carried-weight-show':0,
				'loads-show':0,
				'worn-items-show':0,
				'other-items-show':0,
				'equipment-show':0,
				'npc-compimport-show':0,
				'npc-details-show':0,
				'npc-defense-show':0,
				'npc-offense-show':0,
				'npc-speed-show':0,
				'npc-repeating-weapons-show':0,
				'npc-spell-like-abilities-show':0,
				'npc-tactics-show':0,
				'npc-statistics-show':0,
				'npc-feats-show':0,
				'npc-mythic-feats-show':0,
				'npc-skills-show':0,
				'npc-ecology-show':0,
				'npc-special-abilities-show':0,
				'custom-attr-sect-a-show':0,
				'custom-attr-sect-c-show':0,
				'custom-attr-sect-b-show':0,
				'custom-attr-sect-d-show':0,
				'custom-attr-sect-n-show':0,
				'header-image-show':0,
				'sheet-import-show':0,
				'roll-template-info-show':1,
				'macros-show':1,
				'migrations-show':0,
				'cleanup-show':0,
				'buff-min-show':0,
				'buff-expand-show':0,
				'buff-column-show':0,
				'weapon-min-show':0,
				'weapon-expand-show':0,
				'weapon-column-show':0,
				'abilities-min-show':0,
				'abilities-expand-show':0,
				'abilities-column-show':0,
				'class-ability-min-show':0,
				'class-ability-expand-show':0,
				'class-ability-column-show':0,
				'feat-min-show':0,
				'feat-expand-show':0,
				'feat-column-show':0,
				'mythic-feats-min-show':0,
				'mythic-feats-expand-show':0,
				'mythic-feats-column-show':0,
				'racial-trait-min-show':0,
				'racial-trait-expand-show':0,
				'racial-trait-column-show':0,
				'traits-min-show':0,
				'traits-expand-show':0,
				'traits-column-show':0,
				'npc-spell-like-abilities-min-show':0,
				'npc-spell-like-abilities-expand-show':0,
				'npc-spell-like-abilities-column-show':0,
				'mythic-min-show':0,
				'mythic-expand-show':0,
				'mythic-column-show':0,
				'newspells-min-show':0,
				'newspells-expand-show':0,
				'newspells-column-show':0,
				'item-min-show':0,
				'item-expand-show':0,
				'item-column-show':0,
				'npcweapon-min-show':0,
				'npcweapon-expand-show':0,
				'npcweapon-column-show':0,
				'npcnewspells-min-show':0,
				'npcnewspells-expand-show':0,
				'npcnewspells-column-show':0,
				'npcfeat-min-show':0,
				'npcfeat-expand-show':0,
				'npcfeat-column-show':0,
				'npcmythic-feats-min-show':0,
				'npcmythic-feats-expand-show':0,
				'npcmythic-feats-column-show':0,
				'npc-abilities-min-show':0,
				'npc-abilities-expand-show':0,
				'npc-abilities-column-show':0,
				'npc-special-abilities-min-show':0,
				'npc-special-abilities-expand-show':0,
				'npc-special-abilities-column-show':0
			});
			//now go through repeating sections and expand those to be sure users can see them.
			_.each(PFConst.repeatingSections, function (section) {
				var rsection = "repeating_" + section;
				getSectionIDs(rsection, function (ids) {
					var setter = _.reduce(ids, function (memo, id) {
						var prefix = rsection + "_" + id + "_";
						switch (section) {
							case 'weapon':
								memo[prefix + "add-damage-show"] = 0;
								memo[prefix + "iterative-attacks-show"] = 0;
								memo[prefix + "advmacro-text-show"] = 0;
								break;
							case 'buff':
								memo[prefix + "options-show"] = 0;
								memo[prefix + "description-show"] = 0;
								break;
							case 'spells':
								memo[prefix + "spell-misc-show"] = 0;
								memo[prefix + "description-show"] = 0;
								break;
							case 'class-ability':
							case 'feat':
							case 'racial-trait':
							case 'trait':
							case 'mythic-ability':
							case 'mythic-feat':
							case 'item':
								memo[prefix + "description-show"] = 0;
								memo[prefix + "armor-attributes-show"] = 0;
								memo[prefix + "weapon-attributes-show"] = 0;
								break;
							case 'npc-spell-like-abilities':
								memo[prefix + "attack-show"] = 0;
								break;
							case 'ability':
								memo[prefix + "options-show"] = 0;
								memo[prefix + "description-show"] = 0;
								memo[prefix + "misc-show"] = 0;
								memo[prefix + "showextrafields"] = 0;
								memo[prefix + "range-show"] = 0;
								break;
						}
						memo[prefix + "row-show"] = 0;
						memo[prefix + "ids-show"] = 0;
						if (section !== 'buff'){
							memo[prefix + "macro-text-show"] = 0;
						}
						return memo;
					}, {});
					SWUtils.setWrapper(setter, {
						silent: true
					});
				});
			});
		}
	});
}

/** Sets any values if sheet created brand new. Makes sure all migrations up to date.
 * makes sure NPC value set. 
 */
function setupNewSheet (callback){
	var done = _.once(function(){
		SWUtils.setWrapper({'is_newsheet':0, 'is_v1':1, 'use_advanced_options':0, 'PFSheet_Version': String((PFConst.version.toFixed(2))),
			'attentionv161-show':1 },PFConst.silentParams,function(){
			if (typeof callback === "function"){
				callback();
			}
		});
	});
	getAttrs(['is_npc', 'set_pfs'],function(v){
		var isNPC = parseInt(v.is_npc,10)||0,
		isPFS = parseInt(v.set_pfs,10)||0;
		PFMigrate.setAllMigrateFlags(function(){
			if (isNPC){
				PFNPC.setToNPC(done);
			} else if (isPFS){
				PFHealth.setToPFS(done);
			} else {
				done();
			}
		});
	});
}

function updateAllCustomMenu (callback, eventInfo){
    getAttrs(['customd1','customd2','customd3','customd4','customd5','customd6',
        	'customd1-name','customd2-name','customd3-name','customd4-name','customd5-name','customd6-name',
			'allcustom_macro','NPC-allcustom_macro'],function(v){
        var macroStr='',npcMacroStr='',tempStr='';

        if(v['customd1'] ){
            tempStr = "[" + (SWUtils.escapeForChatLinkButton(v['customd1-name'])||'customd1') + "](~@{character_id}|";
			macroStr+=tempStr + "customd1_roll) ";
			npcMacroStr+=tempStr + "NPC-customd1_roll) ";
        }
        if(v['customd2'] ){
            tempStr = "[" + (SWUtils.escapeForChatLinkButton(v['customd2-name'])||'customd2') + "](~@{character_id}|";
			macroStr+=tempStr + "customd2_roll) ";
			npcMacroStr+=tempStr + "NPC-customd2_roll) ";
        }
        if(v['customd3'] ){
            tempStr = "[" + (SWUtils.escapeForChatLinkButton(v['customd3-name'])||'customd3') + "](~@{character_id}|";
			macroStr+=tempStr + "customd3_roll) ";
			npcMacroStr+=tempStr + "NPC-customd3_roll) ";
        }
        if(v['customd4'] ){
            tempStr = "[" + (SWUtils.escapeForChatLinkButton(v['customd4-name'])||'customd4') + "](~@{character_id}|";
			macroStr+=tempStr + "customd4_roll) ";
			npcMacroStr+=tempStr + "NPC-customd4_roll) ";
        }
        if(v['customd5'] ){
            tempStr = "[" + (SWUtils.escapeForChatLinkButton(v['customd5-name'])||'customd5') + "](~@{character_id}|";
			macroStr+=tempStr + "customd5_roll) ";
			npcMacroStr+=tempStr + "NPC-customd5_roll) ";
        }
        if(v['customd6'] ){
            tempStr = "[" + (SWUtils.escapeForChatLinkButton(v['customd6-name'])||'customd6') + "](~@{character_id}|";
			macroStr+=tempStr + "customd6_roll) ";
			npcMacroStr+=tempStr + "NPC-customd6_roll) ";
        }
		if(macroStr || npcMacroStr){
			macroStr = "{{roll20=^{custom}}} {{roll21="+macroStr+" }}";
			npcMacroStr = "{{roll20=^{custom}}} {{roll21="+npcMacroStr+" }}";
		}
        if(macroStr !== v.allcustom_macro || npcMacroStr !== v['NPC-allcustom_macro']){
            SWUtils.setWrapper({'allcustom_macro':macroStr,
				'NPC-allcustom_macro':npcMacroStr},PFConst.silentParams,callback);
        } else if (typeof callback === "function") {
			callback();
		}
    });
}

function recalcCustomExpressions (callback, silently, oldversion) {
	var countEqs = _.size(PFConst.customEquationMacros),
	fields,
	done = _.once(function () {
		//TAS.debug("leaving PFSheet.recalcExpressions");
		if (typeof callback === "function") {
			callback();
		}
	}),
	doneOne = _.after(countEqs, done);
	try {
		fields = _.reduce(PFConst.customEquationMacros,function(m,writeField,readField){
			m = m.concat( [readField,writeField,'buff_'+PFBuffs.buffToTot[readField]+'-total'] );
			return m;
		},[]);
		getAttrs(fields,function(v){
			_.each(PFConst.customEquationMacros, function (writeField, readField) {
				SWUtils.evaluateAndAdd(doneOne,silently,v[readField],writeField,v[writeField],v['buff_'+PFBuffs.buffToTot[readField]+'-total']);
			});
		});
	} catch (err2) {
		TAS.error("PFSheet.recalcCustomExpressions OUTER wtf how did this happen?", err2);
	} finally {
		done();
	}
}

function recalcExpressions (callback, silently, oldversion) {
	var countEqs = _.size(PFConst.equationMacros),
	done = _.once(function () {
		//TAS.debug("leaving PFSheet.recalcExpressions");
		if (typeof callback === "function") {
			callback();
		}
	}),
	doneOne = _.after(countEqs, done);
	try {
		_.each(PFConst.equationMacros, function (writeField, readField) {
			try {
				SWUtils.evaluateAndSetNumber(readField, writeField, 0, doneOne, silently);
			} catch (err) {
				TAS.error("PFSheet.recalcExpressions", err);
				doneOne();
			}
		});
	} catch (err2) {
		TAS.error("PFSheet.recalcExpressions OUTER wtf how did this happen?", err2);
	} finally {
		done();
	}
}
function recalcDropdowns (callback, silently, oldversion) {
	var countEqs = _.size(PFConst.abilityScoreManualDropdowns),
	countDD2 = _.size(PFConst.levelPlusBABManualDropdowns),
	done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	}),
	donetwo = _.after(2,done),
	doneOne = _.after(countEqs, donetwo),
	doneOther = _.after(countDD2,donetwo);
	try {
		_.each(PFConst.abilityScoreManualDropdowns, function (writeField, readField) {
			try {
				PFUtilsAsync.setDropdownValue(readField, writeField, doneOne, silently);
			} catch (err) {
				TAS.error("PFSheet.recalcDropdowns", err);
				doneOne();
			}
		});
		_.each(PFConst.levelPlusBABManualDropdowns,function(readField){
			try {
				PFUtilsAsync.setDropdownValue(readField, readField+'-mod', doneOther, silently);
			} catch (err) {
				TAS.error("PFSheet.recalcDropdowns", err);
				doneOther();
			}			
		});
	} catch (err2) {
		TAS.error("PFSheet.recalcDropdowns OUTER wtf how did this happen?", err2);
	} finally {
		done();
	}
}

var migrateDropdowns = TAS.callback(function callmigrateAbilityDropdownsToManual(callback,oldversion){
    var done = _.once(function(){
        if (typeof callback === "function"){
            callback();
        }
    }),
    updatedGroup = _.after(4,function(){
        setAttrs({'migrated_ability_dropdowns2':1},PFConst.silentParams,done);
    }),
	updateRepeatingAttackTypes = function(){
		var sections,doneOneSection;
		sections  = Object.keys(PFConst.repeatingAttackTypeManualDropdowns);
		if(!_.size(sections)){
			updatedGroup();
			return;
		}
		doneOneSection = _.after(_.size(sections),updatedGroup);
		//TAS.debug("the sections are ",sections);
		sections.forEach(function(section){
			getSectionIDs('repeating_'+section,function(ids){
				var fields, attr='';
				if(!ids || _.size(ids)===0){
					TAS.warn("migrate repeating attacktype Dropdowns, there are no rows for "+ section);
					doneOneSection();
					return;
				}
				attr='_'+PFConst.repeatingAttackTypeManualDropdowns[section];
				fields = ids.map(function(id){return 'repeating_'+section+'_'+id+attr; });
				getAttrs(fields,function(v){
					var setter, tempstr='';
					//TAS.debug("migrate repeating attackDropdowns for "+section+", getting:",v);						
					setter = Object.keys(v).reduce(function(m,a){
						try{
							if (v[a] && v[a][0]!=="0"){
								tempstr=v[a].replace('@{','').replace('}','');
								if (tempstr!==v[a]){
									m[a]=tempstr;
								}
							}
						} catch (err){
							TAS.error("PFSheet.migrate repeating attacktype dropdowns for: "+section,err);
						} finally {
							return m;
						}
					},{});
					if (_.size(setter)>0){
						TAS.debug("Migrate attack dropdowns setting:",setter);
						setAttrs(setter,PFConst.silentParams,doneOneSection);
					} else {
						doneOneSection();
					}
				});
			});
		});
	},
    updateRepeating= function(){
        getSectionIDs("repeating_weapon",function(ids){
            var fields;
            if (!ids || _.size(ids)===0){
                updatedGroup();
                return;
            }
            fields =SWUtils.cartesianAppend(['repeating_weapon_'],ids,['damage-ability']);
            getAttrs(fields,function(v){
                var setter;
				try {
					//TAS.debug("migrate repeatingweapon AbilityDropdowns getting:",v);					
					setter = Object.keys(v).reduce(function(m,a){
						var tempstr='';
						if (v[a] && v[a]!=="0"){
							tempstr=v[a].replace('@{','').replace('}','');
							if (tempstr!==v[a]){
								m[a]=tempstr;
							}
						}
						return m;
					},{});
				} catch (err){
					TAS.error("PFSheet.migrate repeating ability dropdowns ",err);
				} finally {
					if (_.size(setter)){
						TAS.debug("Migrate repeatingweapon ability dropdowns setting:",setter);
						setAttrs(setter,PFConst.silentParams,updatedGroup);
					} else {
						updatedGroup();
					}
				}
            });
        });
    },
    updateNonRepeating = function(){
        var fields = Object.keys(PFConst.abilityScoreManualDropdowns);
        getAttrs(fields,function(v){
            var setter={};
			try{
				//TAS.debug("migrateAbilityDropdowns getting:",v);
				setter =fields.reduce(function(m,a){
					var tempstr='';
					if (v[a]){
						switch(a){
							case 'concentration-0-ability':
							case 'concentration-1-ability':
							case 'concentration-2-ability':
							case 'FF-ability':
							case 'CMD-ability':
							case 'sanity-ability':
							case 'selected-ability-psionic-power':
							case 'melee2-ability':
							case 'ranged2-ability':
							case 'cmb2-ability':
								tempstr=PFUtils.findAbilityInString(v[a])||"0";
								break;
							default:
								tempstr=PFUtils.findAbilityInString(v[a]);
								break;
						}
					}
					if (!tempstr && PFConst.manualDropdownDefaults[a]){
						tempstr=PFConst.manualDropdownDefaults[a];
					}
					if (tempstr && tempstr!==v[a]){
						m[a]=tempstr;
					}
					return m;
				},{});
			} catch (err){
				TAS.error("PFSheet.migrate AbilityModDropdowns ",err);
			} finally {
				if (_.size(setter)){
					TAS.debug("Migrate ability dropdowns setting:",setter);
					setAttrs(setter,PFConst.silentParams,updatedGroup);
				} else {
					updatedGroup();
				}
			}
        });
    },
    updateSkills = function(){
        var fields = PFSkills.allTheSkills.map(function(s){return s+"-ability";});
        getAttrs(fields,function(v){
            var setter={};
			try{
				//TAS.debug("updateSkills getting:",fields,v);
				setter = fields.reduce(function(m,a){
					var tempstr='',tempskill='',matches,tempmatch='';
					try {
						if (v[a] && v[a].indexOf('@{')>=0){
							tempstr=v[a].replace('@{','').replace('}','');
						} else if ( !(/misc/i).test(a) && ( !v[a] ||  PFAbilityScores.abilitymods.indexOf(v[a])<0)){
							matches = a.match(/Perform|Profession|Craft|Lore|Artistry|Knowledge/i);
							if(matches){
								switch(matches[0]){
									case 'Perform':
										tempstr='CHA-mod';
										break;
									case 'Craft':
									case 'Knowledge':
									case 'Profession':
									case 'Artistry':
									case 'Lore':
										tempstr='INT-mod';
										break;
								}
							}
							if (!tempstr){
								tempskill=a.slice(0,-8);
								tempstr=PFSkills.coreSkillAbilityDefaults[tempskill];
								if (!tempstr) {
									tempstr = PFSkills.consolidatedSkillAbilityDefaults[tempskill];
								}
								if(tempstr){
									tempstr=tempstr.toUpperCase()+'-mod';
								}
							}
						}
						if (tempstr && tempstr!==v[a]){
							m[a]=tempstr;
						}
					} catch (skillerri) {
						TAS.error("Migrate Skill dropdowns error skillerri on "+a,skillerri);
					} finally {
						return m;
					}
				},{});
			} catch (err){
				TAS.error("PFSheet.migrate Skills dropdowns ",err);
			} finally {
				if (_.size(setter)){
					TAS.debug("Migrate skill dropdowns setting:",setter);
					setAttrs(setter,PFConst.silentParams,updatedGroup);
				} else {
					TAS.error("Migrate skill dropdowns, there was nothing to set!");
					updatedGroup();
				}
			}
        });
    };
    getAttrs(['migrated_ability_dropdowns2'],function(v){
        var setter={};
		//TAS.notice("PFSheet.migrateDropdowns START","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",v);
        if(!parseInt(v.migrated_ability_dropdowns2,10)){
            updateRepeating();
            updateNonRepeating();
			updateRepeatingAttackTypes();
			updateSkills();
        } else {
            done();
        }
    });
});

export var migrate = TAS.callback(function callSheetMigrate(callback,oldversion){
	migrateDropdowns(callback,oldversion);
});

function upgrade (oldversion, callback, errorCallback) {
	var done = _.once(function () {
		//TAS.debug("leaving PFSheet.migrate");
		if (typeof callback === "function") {
			callback();
		}
	}),
	errorDone = _.once(function (){
		TAS.warn("leaving migrate ERROR UPGRADE NOT FINISHED");
		if (typeof errorCallback === "function") {
			errorCallback();
		} else {
			done();
		}
	}),
	doneOne;
	try {
		//don't need to check if oldversion > 0 since this is only called if it is.
		//TAS.debug("At PFSheet.migrate from oldversion:"+oldversion);
		if (oldversion < 1.0) {
			doneOne=_.after(7,function(){
				TAS.info("we finished calling all the migrates");
				done();
			});
			PFMigrate.migrateConfigFlags(TAS.callback( function (){
				PFInventory.migrate(doneOne,oldversion);
				PFSkills.migrate(doneOne,oldversion);
				PFHealth.migrate(doneOne,oldversion);
				PFAttacks.migrate(doneOne,oldversion);
				PFAbility.migrate(doneOne,oldversion);
				PFFeatures.migrate(doneOne,oldversion);
				PFSpells.migrate(doneOne,oldversion);
			}),oldversion);
		} else if (oldversion < 1.17) {
			if (oldversion < 1.02) {
				PFAbility.migrate(null,oldversion);
				PFFeatures.migrate(null,oldversion);
			}
			if (oldversion < 1.05){
				PFAttackOptions.resetOptions();
			}
			if (oldversion < 1.07){
				PFInventory.migrate(null,oldversion);
			}
			if (oldversion < 1.10){
				PFMigrate.migrateAbilityListFlags();
				PFFeatures.migrate(null,oldversion);
			}
			if (oldversion < 1.12){
				PFAbility.migrate(null,oldversion);
			}
			if (oldversion < 1.17){
				PFInventory.migrate(function(){PFInventory.resetCommandMacro();});
			}
		} else {
			if (oldversion < 1.18){
				//future updates here. any above will recalc whole sheet after callback
				PFInitiative.recalculate(null,false,oldversion);
				PFHealth.recalculate(null,false,oldversion);
				PFMigrate.migrateSpellPointFlag(null,oldversion);
			}
			if (oldversion < 1.19){
				PFAttackGrid.setTopMacros();
			}
			if (oldversion < 1.20){
				PFHealth.recalculate();
			}
			if (oldversion < 1.40){
				PFMigrate.migrateWhisperDropdowns();
				PFInventory.resetCommandMacro();
				PFAttackGrid.resetCommandMacro();
				PFAbility.resetCommandMacro();
				PFFeatures.resetCommandMacro();
				PFAttacks.recalculate();
				PFClassRaceGrid.setHitPoints();
		    }
			if (oldversion < 1.43){
				PFSpells.recalculate();
				PFSkills.resetCommandMacro();
			}
			if (oldversion < 1.5){
				PFSpells.resetSpellsTotals(null,null,null,true);
				PFInventory.updateRepeatingItems();
				PFAttacks.migrateLinkedAttacks(null,oldversion);
			}
			if (oldversion < 1.53){
				PFSkills.migrate(null,oldversion);
				PFSize.recalculate(function(){
					PFEncumbrance.migrate();
				});
			}
			if (oldversion < 1.54){
				PFBuffs.recalculate();
			}

			if (oldversion < 1.55){
				PFAttacks.recalculate();
				PFSkills.migrate();
			}
			if (oldversion < 1.56){
				PFAttacks.updateRepeatingWeaponDamages();
			}
			if (oldversion < 1.57){
				PFDefense.updateDefenses();
			}
			if (oldversion < 1.63){
				migrateDropdowns(function(){
					PFBuffs.migrate(null,oldversion);
					PFSkills.migrate(function(){
						PFSkills.recalculateSkills();
					});
				});
			}
			if (oldversion===1.63){
				recalcExpressions(function(){
					PFAbility.setRuleTabs();
					PFInventory.updateLocations();
					PFAttacks.adjustAllDamageDiceAsync();
					PFAttacks.updateDualWieldAttacks();
					PFAttacks.recalculateRepeatingWeapons();
				});
			}
		}
	} catch (err) {
		TAS.error("PFSheet.migrate", err);
		errorDone();
	} finally {
		done();
	}
}
function recalculateParallelModules (callback, silently, oldversion) {
	var done = _.once(function () {
		//TAS.debug("leaving PFSheet.recalculateParallelModules");
		if (typeof callback === "function") {
			callback();
		}
	}),
	parallelRecalcFuncs = [
		PFSpellCasterClasses.recalculate, 
		PFSaves.recalculate,
		PFFeatures.recalculate,
		PFPsionic.recalculate,
		PFSkills.recalculate,
		PFAbility.recalculate,
		PFInitiative.recalculate,
		PFAttacks.recalculate,
		PFHorror.recalculate
	],		
	numberModules = _.size(parallelRecalcFuncs),
	doneOneModuleInner = _.after(numberModules, done),
	curr = 0,
	currstarted = 0,

	doneOneModule = function () {
		curr++;
		TAS.info("PFSheet.recalculateParallelModules, finished " + curr + " modules");
		doneOneModuleInner();
	};

	//TAS.debug("at recalculateParallelModules! there are "+numberModules +" modules");
	try {
		_.each(parallelRecalcFuncs, function (methodToCall) {
			try {
				currstarted++;
				TAS.info("starting " + currstarted + " parallel modules");
				methodToCall(doneOneModule, silently, oldversion);
			} catch (err) {
				TAS.error("PFSheet.recalculateParallelModules", err);
				doneOneModule();
			}
		});
	} catch (err2) {
		TAS.error("PFSheet.recalculateParallelModules OUTER error!", err2);
		done();
	}
}
function recalculateDefenseAndEncumbrance (callback, silently, oldversion) {
	var done = _.once(function () {
		//TAS.debug("leaving PFSheet.recalculateDefenseAndEncumbrance");
		if (typeof callback === "function") {
			callback();
		}
	}),
	callEncumbrance = function(){
		PFEncumbrance.recalculate(done, silently, oldversion);
	},
	doneBeforeEncumbrance = _.after(2, callEncumbrance);
	try {
		PFInventory.recalculate(doneBeforeEncumbrance, silently, oldversion);
		PFDefense.recalculate(doneBeforeEncumbrance, silently, oldversion);
	} catch (err){
		TAS.error("pfsheet.recalculateDefenseAndEncumbrance",err);
		callEncumbrance();
	}
}
function recalculateCore (callback, silently, oldversion) {
	var done = _.once(function () {
		//TAS.debug("leaving PFSheet.recalculateCore");
		if (typeof callback === "function") {
			callback();
		}
	}),
	sizeOnce = _.once(function(){
		PFSize.recalculate(done,silently,oldversion);
	}),
	healthOnce = _.once (function(){
		PFHealth.recalculate(sizeOnce,silently,oldversion);
	}),
	npcOnce = _.once(function(){
		PFNPC.recalculate(healthOnce,silently,oldversion);
	}),
	mythicOnce = _.once(function(){
		PFMythic.recalculate(npcOnce, silently, oldversion);
	}),
	customExpressionsOnce = _.once(function () {
		recalcCustomExpressions(mythicOnce, silently, oldversion);
	}),
	expressionsOnce = _.once(function () {
		recalcExpressions(customExpressionsOnce, silently, oldversion);
	}),
	dropdownsOnce = _.once(function () {
		recalcDropdowns(expressionsOnce, silently, oldversion);
	}),
	conditioncheckOnce = _.once(function () {
		PFChecks.applyConditions(dropdownsOnce, silently, oldversion);
	}),
	classOnce = _.once(function () {
		PFClassRaceGrid.recalculate(conditioncheckOnce, silently, oldversion);
	}),
	abilityScoresOnce = _.once(function () {
		PFAbilityScores.recalculate(classOnce, silently, oldversion);
	}),
	abilityAffectingConditionsOnce = _.once(function () {
		PFConditions.recalculate(abilityScoresOnce, silently, oldversion);
	}),
	buffsOnce = _.once(function () {
		PFBuffs.recalculate(abilityAffectingConditionsOnce, silently, oldversion);
	});

	PFMigrate.migrateConfigFlags(buffsOnce,oldversion);
	
	//TAS.debug("at recalculateCore!!!!");

}
/** recalculate - all pages in sheet!  
 *@param {number} oldversion the current version attribute
 *@param {function} callback when done if no errors
 *@param {function} errorCallback  call this if we get an error
 */
export var recalculate = TAS.callback(function callrecalculate(oldversion, callback, silently) {
	var done = function () {
		updateAllCustomMenu();
		TAS.info("leaving PFSheet.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	},
	callParallel = TAS.callback(function callRecalculateParallelModules() {
		recalculateParallelModules(done, silently, oldversion);
	}),
	callEncumbrance = TAS.callback(function callRecalculateDefenseAndEncumbrance() {
		recalculateDefenseAndEncumbrance(callParallel, silently, oldversion);
	}),
	callRecalcCore = TAS.callback(function callRecalculateCore(){
		recalculateCore(callEncumbrance, silently, oldversion);
	});
	silently=true;
	migrate(callRecalcCore,oldversion);
});
/* checkForUpdate looks at current version of page in PFSheet_Version and compares to code PFConst.version
 *  calls recalulateSheet if versions don't match or if recalculate button was pressed.
 * */
function checkForUpdate () {
	var done = function () {
		SWUtils.setWrapper({ recalc1: 0, migrate1: 0, is_newsheet: 0}, PFConst.silentParams);
	},
	errorDone = _.once(function (){
		TAS.warn("leaving checkForUpdate ERROR UPGRADE NOT FINISHED DO NOT RESET VERSION");
		SWUtils.setWrapper({ recalc1: 0, migrate1: 0 }, { silent: true });
	});
	getAttrs(['PFSheet_Version', 'migrate1', 'recalc1', 'is_newsheet', 'is_v1', 'hp', 'hp_max', 'npc-hd', 'npc-hd-num',
	'race', 'class-0-name', 'npc-type', 'level'], function (v) {
		var setter = {},
		setAny = 0,
		migrateSheet=false,
		newSheet= false,
		recalc = false,
		currVer = parseFloat(v.PFSheet_Version, 10) || 0,
		setUpgradeFinished = function() {
			SWUtils.setWrapper({ recalc1: 0, migrate1: 0, is_newsheet: 0, 
			character_sheet: 'Pathinder_Neceros v'+String(PFConst.version),
			PFSheet_Version: String((PFConst.version.toFixed(2))) }, PFConst.silentParams, function() {
				if (currVer < 1.17) {
					recalculate(currVer, null, false);
				}
			});
		};
		TAS.notice("Attributes at version: " + currVer);
		if (parseInt(v["recalc1"],10) ){
			//HIT RECALC
			recalc = true;
		} 
		if (parseInt(v["migrate1"],10)) {
			migrateSheet =true;
		}
		if  ( parseInt(v["is_newsheet"],10) || (currVer === 0 &&  (parseInt(v.is_v1,10) || (  !(parseInt(v.hp, 10) || parseInt(v.hp_max, 10) || parseInt(v['npc-hd'], 10) || parseInt(v['npc-hd-num'], 10) ||
			v.race || v['class-0-name'] || v['npc-type'] || parseInt(v['level'], 10))))) ) {
			//NEW SHEET:
			newSheet=true;
		}
		//force this on sheet open, not sure wtf is wrong
		if (currVer !== PFConst.version) {
			migrateSheet = true;
		}
		if (newSheet) {
			PFSkills.migrate();
			setupNewSheet(done);
		} else if (migrateSheet){
			upgrade(currVer, setUpgradeFinished, errorDone);
		} else if (recalc) {
			currVer = -1;
			recalculate(currVer, done, true);
		} else  {
			done();
		}
	});
}

function applyTemplate(name){
	if (name==='giant'){
		getAttrs(['npc-type','size','AC-natural','is_undead','npc-cr',
		'STR-base','STR','STR-mod','CON-base','CON','CON-mod','DEX-base','DEX','DEX-mod'],function(v){
			var setter={},tempstr='',tempint=0;
			tempstr = SWUtils.getTranslated('giant');
			setter['npc-type'] = tempstr+' '+v['npc-type'];

			setter = PFAbilityScores.modifyAbility('STR',4,v,setter);
			setter = PFAbilityScores.modifyAbility('DEX',-2,v,setter);
			if(!parseInt(v.is_undead,10)){
				setter = PFAbilityScores.modifyAbility('CON',4,v,setter);
			} else {
				setter = PFAbilityScores.modifyAbility('CHA',4,v,setter);
			}

			tempint = parseInt(v['AC-natural'],10)||0;
			tempint+=3;
			setter['AC-natural']=tempint;

			tempint = parseInt(v['npc-cr'],10)||0;
			tempint++;
			setter['npc-cr']=tempint;

			setter = PFSize.updateSize(1,v,null,setter);
			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	} else 	if (name==='giantremove'){
		getAttrs(['npc-type','size','AC-natural','is_undead','npc-cr',
		'STR-base','STR','STR-mod','CON-base','CON','CON-mod','DEX-base','DEX','DEX-mod'],function(v){
			var setter={},tempstr='',tempint=0;
			tempstr = SWUtils.getTranslated('giant') + ' ';
			if(v['npc-type']){
				setter['npc-type'] = v['npc-type'].replace(tempstr,'');
			}

			setter = PFAbilityScores.modifyAbility('STR',-4,v,setter);
			setter = PFAbilityScores.modifyAbility('DEX',2,v,setter);
			if(!parseInt(v.is_undead,10)){
				setter = PFAbilityScores.modifyAbility('CON',-4,v,setter);
			} else {
				setter = PFAbilityScores.modifyAbility('CHA',-4,v,setter);
			}
			tempint = parseInt(v['AC-natural'],10)||0;
			tempint-=3;
			setter['AC-natural']=tempint;

			tempint = parseInt(v['npc-cr'],10)||0;
			tempint--;
			setter['npc-cr']=tempint;

			setter = PFSize.updateSize(-1,v,null,setter);
			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	} else if (name==='young') {
		getAttrs(['npc-type','size','AC-natural','is_undead','npc-cr',
		'STR-base','STR','STR-mod', 'CON-base','CON','CON-mod','DEX-base','DEX','DEX-mod'],function(v){
			var setter={},tempstr='',tempint=0;
			tempstr = SWUtils.getTranslated('young');
			setter['npc-type'] = tempstr+' '+v['npc-type'];

			setter = PFAbilityScores.modifyAbility('STR',-4,v,setter);
			setter = PFAbilityScores.modifyAbility('DEX',4,v,setter);
			if(!parseInt(v.is_undead,10)){
				setter = PFAbilityScores.modifyAbility('CON',-4,v,setter);
			} else {
				setter = PFAbilityScores.modifyAbility('CHA',-4,v,setter);
			}

			tempint = parseInt(v['AC-natural'],10)||0;
			tempint = Math.max(0, (tempint-2));
			setter['AC-natural']=tempint;
			tempint = parseInt(v['npc-cr'],10)||0;
			tempint--;
			if(tempint<=0){
				tempint='.5';
			}
			setter['npc-cr']=tempint;

			setter = PFSize.updateSize(-1,v,null,setter);
			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	} else if (name==='youngremove') {
		getAttrs(['npc-type','size','AC-natural','is_undead','npc-cr',
		'STR-base','STR','STR-mod', 'CON-base','CON','CON-mod','DEX-base','DEX','DEX-mod'],function(v){
			var setter={},tempstr='',tempint=0;
			tempstr = SWUtils.getTranslated('young')+' ';
			if (v['npc-type']){
				setter['npc-type'] = v['npc-type'].replace(tempstr,'');
			}
			setter = PFAbilityScores.modifyAbility('STR',4,v,setter);
			setter = PFAbilityScores.modifyAbility('DEX',-4,v,setter);
			if(!parseInt(v.is_undead,10)){
				setter = PFAbilityScores.modifyAbility('CON',4,v,setter);
			} else {
				setter = PFAbilityScores.modifyAbility('CHA',4,v,setter);
			}

			tempint = parseInt(v['AC-natural'],10)||0;
			tempint += 2;
			setter['AC-natural']=tempint;
			tempint = parseInt(v['npc-cr'],10)||0;
			tempint++;
			setter['npc-cr']=tempint;
			setter = PFSize.updateSize(1,v,null,setter);
			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	} else if (name==='advanced'){
		getAttrs(['npc-type','size','is_undead','AC-natural','npc-cr',
		'STR-base','STR','STR-mod',	'CON-base','CON','CON-mod','DEX-base','DEX','DEX-mod',
		'INT-base','INT','INT-mod',	'WIS-base','WIS','WIS-mod','CHA-base','CHA','CHA-mod'],function(v){
			var setter={},tempstr='',tempint=0;
			tempstr = SWUtils.getTranslated('advanced');
			setter['npc-type'] = tempstr+' '+v['npc-type'];

			setter = PFAbilityScores.modifyAbility('STR',4,v,setter);
			if(!parseInt(v.is_undead,10)){
				setter = PFAbilityScores.modifyAbility('CON',4,v,setter);
			}
			setter = PFAbilityScores.modifyAbility('DEX',4,v,setter);
			if(parseInt(v['INT-base'])>2){
				setter = PFAbilityScores.modifyAbility('INT',4,v,setter);
			}
			setter = PFAbilityScores.modifyAbility('WIS',4,v,setter);
			setter = PFAbilityScores.modifyAbility('CHA',4,v,setter);

			tempint = parseInt(v['AC-natural'],10)||0;
			tempint+=2;
			setter['AC-natural']=tempint;
			tempint = parseInt(v['npc-cr'],10)||0;
			tempint++;
			setter['npc-cr']=tempint;

			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	} else if (name==='degenerate'){
		getAttrs(['npc-type','size','is_undead','AC-natural','npc-cr',
		'STR-base','STR','STR-mod',	'CON-base','CON','CON-mod','DEX-base','DEX','DEX-mod',
		'INT-base','INT','INT-mod',	'WIS-base','WIS','WIS-mod','CHA-base','CHA','CHA-mod'],function(v){
			var setter={},tempstr='',tempint=0;
			tempstr = SWUtils.getTranslated('degenerate');
			setter['npc-type'] = tempstr+' '+v['npc-type'];
			setter = PFAbilityScores.modifyAbility('STR',-4,v,setter);
			if(!parseInt(v.is_undead,10)){
				setter = PFAbilityScores.modifyAbility('CON',-4,v,setter);
			}
			setter = PFAbilityScores.modifyAbility('DEX',-4,v,setter);
			setter = PFAbilityScores.modifyAbility('INT',-4,v,setter);
			setter = PFAbilityScores.modifyAbility('WIS',-4,v,setter);
			setter = PFAbilityScores.modifyAbility('CHA',-4,v,setter);
			tempint = parseInt(v['AC-natural'],10)||0;
			tempint-=2;
			setter['AC-natural']=tempint;
			tempint = parseInt(v['npc-cr'],10)||0;
			tempint--;
			if(tempint<=0){
				tempint='.5';
			}
			setter['npc-cr']=tempint;
			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	} else if (name==='celestial'||name==='fiendish'||name==='entropic'||name==='resolute' ){
		getAttrs(['npc-type','npc-cr','npc-hd','DR','SR-macro-text','SR','resistances','vision','CHA-mod'],function(v){
			var setter={},tempstr='',samestr='',opstr='',tempcr=0,temphd=0,tempint=0,newId='',prefix='';

			tempstr = SWUtils.getTranslated(name);
			setter['npc-type'] = tempstr+' '+v['npc-type'];

			temphd=parseInt(v['npc-hd'],10)||0;
			if(!(/darkvision/i).test(v.vision)){
				tempstr = SWUtils.getTranslated('darkvision');
				tempstr = tempstr+' 60' + getTranslationByKey('feet-abbrv');
				if(v.vision){
					tempstr = tempstr + ' ' + v.vision;
				}
				setter.vision=tempstr;
			}

			if(name==='celestial'){
				opstr='Evil';
				samestr='good';
				tempstr='Resist Cold, Acid, Electricity ';
			} else if (name==='fiendish'){
				opstr='Good';
				samestr='evil';
				tempstr='Resist Cold and Fire ';
			} else if (name==='entropic'){
				opstr='Lawful';
				samestr='chaos';
				tempstr='Resist Acid and Fire ';
			} else if (name==='resolute'){
				opstr='chaotic';
				samestr='law';
				tempstr='Resist Acid, Cold, and Fire ';
			}
			
			if(temphd<5){
				tempstr+=' 5;';
			} else if (temphd >=5 && temphd <=10){
				tempstr+=' 10;';
			} else {
				tempstr+=' 15;';
			}
			setter.resistances= tempstr + (v.resistances||'');

			tempstr='';
			if(temphd >=5 && temphd <=10){
				tempstr='5/'+opstr+';';
			} else if (temphd > 10){
				tempstr='10/'+opstr+';';
			}
			if(tempstr){
				setter.DR = tempstr+(v.DR||'');
			}
			tempcr = parseInt(v['npc-cr'],10)||0;
			if(temphd>=5){
				tempcr++;
				setter['npc-cr']=tempint;
			}
			tempint = parseInt(v.SR,10)||0;
			if(tempint < (tempcr+5)){
				tempstr=(v['SR-macro-text']||'')+'+5';
				setter['SR-macro-text']= '@{npc-cr}+5';
				setter.SR= (tempcr+5);
			}
			newId=generateRowID();
			prefix='repeating_ability_'+newId+'_';
			setter[prefix+'name']='Smite '+opstr;
			setter[prefix + "ability_type"] = 'Su';
			setter[prefix + "rule_category"] = 'monster-rule';
			setter[prefix + 'showinmenu'] = '1';
			setter[prefix + 'description']='smite '+opstr+' 1/day as a swift action (adds Cha bonus to attack rolls and damage bonus equal to HD against '+opstr+' foes; smite persists until target is dead or the celestial creature rests).';
			setter[prefix + 'short-description']='Enable in buff list against 1 evil creature';
			setter[prefix + 'frequency']='perday';
			setter[prefix + 'max-calculation']='1';
			setter[prefix + 'used_max']=1;

			newId=generateRowID();
			prefix='repeating_buff2_'+newId+'_';
			setter[prefix+'name']='Smite '+opstr+' (Su) 1/day';
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='untyped';
			setter[prefix+'b1_macro-text']='@{CHA-mod}';
			setter[prefix+'b1_val']=parseInt(v['CHA-mod'],10);
			setter[prefix+'b2_bonus']='attack';
			setter[prefix+'b2_bonustype']='untyped';
			setter[prefix+'b2_macro-text']='@{npc-hd}';
			setter[prefix+'b2_val']=parseInt(v['npc-hd'],10);
			setter[prefix+'notes'] = 'vs one '+opstr+' creature';
			
			SWUtils.setWrapper(setter,PFConst.silentParams,recalculate);
		});
	}
	SWUtils.setWrapper({'template_to_add':'','add_template':0},PFConst.silentParams);
}

function registerEventHandlers () {
	var eventToWatch='';
	on("change:add_template",TAS.callback(function eventAddTemplate(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			getAttrs(['template_to_add','add_template'],function(v){
				if(parseInt(v.add_template,10)){
					applyTemplate(v.template_to_add);
				}
			});
		}
	}));
	on("sheet:opened", TAS.callback(function eventSheetOpened() {
		//eventInfo has undefined values for this event.
		checkForUpdate();
	}));
	on("change:recalc1 change:migrate1", TAS.callback(function eventRecaluateSheet(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			checkForUpdate();
		}
	}));
	on("change:expandall", function (eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			expandAll();
		}
	});
	//GENERIC DROPDOWNS
	_.each(PFConst.abilityScoreManualDropdowns, function (write, read) {
		on("change:" + read, TAS.callback(function eventManualDropdown(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType==="player" || eventInfo.sourceType==="api"){
				//user changed the SELECTION
				PFUtilsAsync.setDropdownValue(read, write);
			}
		}));
	});

	//GENERIC EQUATIONS
	_.each(PFConst.equationMacros, function (write, read) {
		on("change:" + read, TAS.callback(function eventGenericEquationMacro(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			SWUtils.evaluateAndSetNumber(read, write);
		}));
	});

	_.each(PFConst.customEquationMacros,function(writeField,custField){
		on('change:'+custField,TAS.callback(function customEquationMacro(eventInfo){
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);		
			SWUtils.evaluateAndAddAsync(null,null,custField,writeField,'buff_'+custField+'-total');		
		}));
	});

	on("change:repeating_weapon:source-item", TAS.callback(function eventUpdateAttackSourceItem(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs([eventInfo.sourceAttribute],function(v){
				var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
				sourceId = v[eventInfo.sourceAttribute];
				//TAS.debug("PFSheet new item id: " + sourceId + " this row weapon id: "+weaponId, v);
				if (sourceId){
					sourceId = 'repeating_item_'+sourceId+'_create-attack-entry';
					PFInventory.createAttackEntryFromRow(sourceId,null,false,weaponId);
				}
			});
		}
	}));
	on("change:repeating_weapon:source-ability", TAS.callback(function eventUpdateAttackSourceAbility(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs([eventInfo.sourceAttribute],function(v){
				var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
				sourceId = v[eventInfo.sourceAttribute];
				if (sourceId){
					PFAbility.createAttackEntryFromRow(sourceId,null,false,null,weaponId);
				}
			});
		}
	}));
	on("change:repeating_weapon:source-spell", TAS.callback(function eventUpdateAttackSourceSpell(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs([eventInfo.sourceAttribute],function(v){
				var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
				sourceId = v[eventInfo.sourceAttribute];
				if (sourceId){
					PFSpells.createAttackEntryFromRow(sourceId,null,false,null,weaponId);
				}
			});
		}
	}));
	
	// PARSE CREATE NPC MONSTER
	on("change:npc_import_now", TAS.callback(function eventParseMonsterImport(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			getAttrs(['npc_import_now'], function (v) {
				if ((parseInt(v.npc_import_now, 10) || 0) === 1) {
					PFNPCParser.importFromCompendium(eventInfo, function(){
						//instead of just calling recalculate set recalc button and call checkforupdate
						//so users sees something is happening.
						SWUtils.setWrapper({recalc1:1},PFConst.silentParams,function(){
							checkForUpdate();
						});
					});
				}
			});
		}
	}));
	on("change:delete_repeating_spells change:delete_repeating_weapon change:delete_repeating_item change:delete_repeating_ability change:delete_repeating_mythic-feat change:delete_repeating_mythic-ability change:delete_repeating_buff change:delete_repeating_buff2 change:delete_repeating_trait change:delete_repeating_racial-trait change:delete_repeating_feat change:delete_repeating_class-ability change:delete_repeating_npc-spell-like-abilities",
	TAS.callback(function eventDeleteOldList(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
			getAttrs([eventInfo.sourceAttribute],function(v){
				var section="";
				if (parseInt(v[eventInfo.sourceAttribute],10)){
					section = eventInfo.sourceAttribute.replace('delete_repeating_','');
					SWUtils.deleteRepeating(
						function(){
							var setter;
							setter={};
							setter[eventInfo.sourceAttribute]=0;
							setter[eventInfo.sourceAttribute+'_btn']=0;
							SWUtils.setWrapper(setter,{silent:true});
							if ((/buff/i).test(eventInfo.sourceAttribute)){
								PFBuffs.clearBuffTotals();
							}
						},section);
				}
			});
		}
	}));
	on("change:customd1 change:customd2 change:customd3 change:customd4 change:customd5 change:customd6 change:customd1-name change:customd2-name change:customd3-name change:customd4-name change:customd5-name change:customd6-name",
		TAS.callback(function customRollUpdate(eventInfo){
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if(eventInfo.sourceType==='player'){
				updateAllCustomMenu(eventInfo);
			}
	}));
}
registerEventHandlers();

