'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFAbilityScores from './PFAbilityScores';
import * as PFSaves from './PFSaves';
import * as PFAttackGrid from './PFAttackGrid';
import * as PFAttacks from './PFAttacks';
import * as PFDefense from './PFDefense';
import * as PFHealth from  './PFHealth';
import * as PFChecks from './PFChecks';
import * as PFInitiative from './PFInitiative';
import * as PFEncumbrance from './PFEncumbrance';
import * as PFSize from './PFSize';
import * as PFSkills from './PFSkills';
import * as PFBuffsOld from './PFBuffsOld';

export var
buffColumns = [
	'ac',	'armor',	'attack',	'casterlevel',	'cha',	'cha_skills',	'check',	'check_ability',	'check_skills',
	'cmb',	'cmd',	'con',	'con_skills',		'dex',	'dex_skills',	'dmg',	'dmg_melee',	'dmg_ranged',
	'flatfooted',	'fort',	'hptemp',	'initiative',	'int',	'int_skills',	'melee',	'natural',
	'ranged',	'ref',	'saves',	'shield',	'size',	'speed',	'str',	'str_skills',	'touch',
	'will',	'wis',	'wis_skills'],
buffToTot = {
	'ac':'AC',	'armor':'armor',	'attack':'attack',	'casterlevel':'CasterLevel',
	'cha':'CHA',	'cha_skills':'CHA_skills',
	'check':'Check',	'check_ability':'check_ability',	'check_skills':'check_skills',
	'cmb':'CMB',	'cmd':'CMD',	'con':'CON',	'con_skills':'CON_skills',
	'dex':'DEX',	'dex_skills':'DEX_skills',
	'dmg':'DMG',	'dmg_melee':'dmg_melee',	'dmg_ranged':'dmg_ranged',
	'flatfooted':'flat-footed',	'fort':'Fort',	'hptemp':'HP-temp',	'initiative':'Initiative',
	'int':'INT',	'int_skills':'INT_skills',	'melee':'Melee',
	'natural':'natural',	'ranged':'Ranged',	'ref':'Ref',	'saves':'saves',
	'shield':'shield',	'size':'size',	'speed':'speed',	'str':'STR',	'str_skills':'STR_skills',
	'touch':'Touch',	'will':'Will',	'wis':'WIS',	'wis_skills':'WIS_skills'},
totColumns = _.values(buffToTot).concat(['dodge','deflection']).sort(),
otherCharBonuses ={
	'str':{'inherent':'STR-inherent','enhancement':'STR-enhance'},
	'dex':{'inherent':'DEX-inherent','enhancement':'DEX-enhance'},
	'con':{'inherent':'CON-inherent','enhancement':'CON-enhance'},
	'int':{'inherent':'INT-inherent','enhancement':'INT-enhance'},
	'wis':{'inherent':'WIS-inherent','enhancement':'WIS-enhance'},
	'cha':{'inherent':'CHA-inherent','enhancement':'CHA-enhance'},
	'initiative':{'trait':'init-trait'},
	'fort':{'resistance':'Fort-resist','trait':'Fort-trait'},
	'ref':{'resistance':'Ref-resist','trait':'Ref-trait'},
	'will':{'resistance':'Will-resist','trait':'Will-trait'},
	'ac':{'natural':'AC-natural','deflection':'AC-deflect','armor':'armor3-acbonus','shield':'shield3-acbonus'},
	'armor':{'enhancement':'armor3-enhance'},
	'shield':{'enhancement':'shield3-enhance'}
	},
bonusTypes =['untyped','alchemical','circumstance','competence','enhancement','inherent',
	'insight','luck','morale','profane','racial','resistance','sacred','size','trait',
	'deflection','dodge','natural',	'shield','armor'],
//ACCMD = ['untyped','circumstance','deflection','dodge','insight','luck','morale','profane','sacred'],
buffsAffectingOthers = {
	'ac':['cmd','flatfooted'],
	'attack':['melee','ranged','cmb'],
	'check':['initiative','check_skills','check_ability','str_skills','dex_skills','con_skills','int_skills','wis_skills','cha_skills'],
	'dmg':['dmg_melee','dmg_ranged'],
	'saves':['fort','ref','will'],
	'check_skills':['str_skills','dex_skills','con_skills','int_skills','wis_skills','cha_skills']
},
//this spreads buff out which works but might fill up space
//another way would beto make it subtractThatFromThis
affectedBuffs = {
	'melee':['attack'],
	'ranged':['attack'],
	'cmb':['attack'],
	'dmg_melee':['dmg'],
	'dmg_ranged':['dmg'],
	'cmd':['ac'],
	'flatfooted':['ac'],
	'fort':['saves'],
	'initiative':['check_ability','check'],
	'ref':['saves'],
	'will':['saves'],
	'check_skills':['check'],
	'check_ability':['check'],
	'str_skills':['check_skills','check'],
	'dex_skills':['check_skills','check'],
	'con_skills':['check_skills','check'],
	'int_skills':['check_skills','check'],
	'wis_skills':['check_skills','check'],
	'cha_skills':['check_skills','check']
},
//all total fields
buffTotFields = _.chain(totColumns).map(function(totstr){
		var isAbility = (PFAbilityScores.abilities.indexOf(totstr) >= 0) && totstr.indexOf('skill')<1;
		if (!isAbility){
			return ['buff_'+totstr+'-total','buff_'+totstr+'_exists'];
		} else {
			return ['buff_'+totstr+'-total','buff_'+totstr+'_exists','buff_'+totstr+'-total_penalty', 'buff_'+totstr+'_penalty_exists'];
		}
	}).flatten().value(),
//character bonus/buff fields elsewhere on the sheet that stack with buffs
charBonusFields = _.chain(otherCharBonuses).values().map(function(v){return _.values(v);}).flatten().value().sort();


var buffNoteFields =['buff_attack_notes','buff_save_notes','buff_init_notes','buff_skill_notes'],
armorcols=['ac','touch','flatfooted','cmd'],
buffsPerRow=['b1','b2','b3','b4','b5','b6'],
//these aways stack don't need to use max
stackingTypes =['untyped','circumstance','dodge','penalty'],
//these buff columns dont have bonus types they are technically bonus types to other fields (but size is special)
bonusesWithNoTypes=['size','hptemp'],//rmeove dodge deflection for v2
//these have only their own type (like bonusesWithNoTypes) or 'enhancement'
selfTypeOrEnhance=['armor','shield','natural'],
buffRowAttrs = ['_b1-show','_b1_val','_b1_bonus','_b1_bonustype',
	'_b2-show','_b2_val','_b2_bonus','_b2_bonustype',
	'_b3-show','_b3_val','_b3_bonus','_b3_bonustype',
	'_b4-show','_b4_val','_b4_bonus','_b4_bonustype',
	'_b5-show','_b5_val','_b5_bonus','_b5_bonustype',
	'_b6-show','_b6_val','_b6_bonus','_b6_bonustype',
	'_enable_toggle','_add_note_to_roll'],
events = {
	// events pass in the column updated macro-text is "either", buffs are auto only
	buffTotalNonAbilityEvents: {
		"Fort": [PFSaves.updateSave],
		"Will": [PFSaves.updateSave],
		"Ref": [PFSaves.updateSave],
		"STR_skills":[PFSkills.recalculateAbilityBasedSkills],
		"DEX_skills":[PFSkills.recalculateAbilityBasedSkills],
		"CON_skills":[PFSkills.recalculateAbilityBasedSkills],
		"INT_skills":[PFSkills.recalculateAbilityBasedSkills],
		"WIS_skills":[PFSkills.recalculateAbilityBasedSkills],
		"CHA_skills":[PFSkills.recalculateAbilityBasedSkills],
		"Melee": [PFAttackGrid.updateAttackGrid],
		"Ranged": [PFAttackGrid.updateAttackGrid],
		"CMB": [PFAttackGrid.updateAttackGrid]
	},
	buffTotalAbilityEvents: {
		"STR": [PFAbilityScores.updateAbilityScore],
		"DEX": [PFAbilityScores.updateAbilityScore],
		"CON": [PFAbilityScores.updateAbilityScore],
		"INT": [PFAbilityScores.updateAbilityScore],
		"WIS": [PFAbilityScores.updateAbilityScore],
		"CHA": [PFAbilityScores.updateAbilityScore]
	},
	// events do NOT pass in column updated
	buffTotalEventsNoParam: {
		"DMG": [PFAttacks.updateRepeatingWeaponDamages],
		"dmg_ranged": [PFAttacks.updateRepeatingWeaponDamages],
		"dmg_melee": [PFAttacks.updateRepeatingWeaponDamages],
		"saves": [PFSaves.updateSaves],
		"attack": [PFAttackGrid.updateAttacks],
		"AC": [PFDefense.updateDefenses],
		"Touch": [PFDefense.updateDefenses],
		"armor": [PFDefense.updateDefenses],
		"shield": [PFDefense.updateDefenses],
		"dodge": [PFDefense.updateDefenses],
		"deflection": [PFDefense.updateDefenses],
		"natural": [PFDefense.updateDefenses],
		"flat-footed": [PFDefense.updateDefenses],
		"CMD": [PFDefense.updateDefenses],
		"HP-temp": [PFHealth.updateTempMaxHP],
		"Check": [PFInitiative.updateInitiative], // [PFSkills.applyConditions],
		"check_ability": [PFInitiative.updateInitiative],//		"check_skills": [PFSkills.applyConditions],
		"initiative": [PFInitiative.updateInitiative],
		"speed": [PFEncumbrance.updateModifiedSpeed],
		"size": [PFSize.updateSizeAsync]
	}
};

/** Looks at add_note_to_roll attribute of row and sets notes appropriately.
 * @param {string} id id of row to calculate on
 * @param {Map<string,string>} v from getAttrs
 * @param {Map<string,string>} setter map to write to for setAttrs, optional
 * @returns {Map<string,string>} setter or new map for setAttrs
 */
function getBuffNotes(id,v,setter){
	var idStr = SWUtils.getRepeatingIDStr(id),
	prefix='repeating_buff2_'+idStr,
	notestr='',notefield='',notereg, addNote=0,tempstr='';
	try {
		setter=setter||{};
		if(v[prefix+'add_note_to_roll']){
			notefield = 'buff_'+v[prefix+'add_note_to_roll']+'_notes';
		}
		if (parseInt(v[prefix+'enable_toggle'],10)===1 && notefield){
			addNote=1;
		}
		notestr='@{'+prefix+'notes}';
		notereg = new RegExp (SWUtils.escapeForRegExp(notestr),'i');
		if(notefield){
			tempstr=v[notefield]||'';
			TAS.debug("the note is "+tempstr);
			if(!tempstr){
				if(addNote){
					setter[notefield] = notestr;
				}
			} else if (notereg.test(tempstr)){
				if (!addNote){
					setter[notefield] = tempstr.replace(notereg,'');
				}
			} else if (addNote){
				setter[notefield] = tempstr+notestr;
			}
			buffNoteFields.forEach(function(note){
				if(note!==notefield){
					tempstr=v[note];
					if(tempstr){
						tempstr=tempstr.replace(notereg,'');
						if(tempstr!==v[note]){
							setter[note]=tempstr;
						}
					}
				}
			});
		} else {
			//delete from all
			buffNoteFields.forEach(function(note){
				tempstr=v[note];
				if(tempstr){
					tempstr=tempstr.replace(notereg,'');
					if(tempstr!==v[note]){
						setter[note]=tempstr;
					}
				}
			});
		}
	} catch (er){

	} finally {
		return setter;
	}
}
/**Looks at add_note_to_roll attribute of row and sets notes appropriately.
 * calls getBuffNotes
 * @param {string} id id of row, optional
 * @param {object} eventInfo from on function, either id or this must be populated.
 */
function addNoteAsync(id,eventInfo){
	var idStr,prefix,fields;
	if (!id && !eventInfo){
		return;
	}
	id=id||SWUtils.getRowId(eventInfo.sourceAttribute);
	idStr = SWUtils.getRepeatingIDStr(id);
	prefix = 'repeating_buff2_'+idStr;
	
	fields=buffNoteFields.concat([prefix+'add_note_to_roll',prefix+'enable_toggle']);
	TAS.debug("the fields are ",fields);
	getAttrs(fields,function(v){
		var setter = getBuffNotes(id,v);
		if (_.size(setter)){
			TAS.debug('PFBuffs set notes',setter);
			SWUtils.setWrapper(setter,PFConst.silentParams);
		}
	});
}
/** sets all buff totals to 0, and the buff notes fields to blank.
 * @param {function} callback 
 * @param {boolean} silently 
 */
function clearBuffTotals (callback,silently){
	var done=function(){
		if(typeof callback === "function"){
			callback();
		}
	};
	//TAS.notice("the total fields are ",buffTotFields2);
	getAttrs(buffTotFields,function(v){
		var setter={},params={};
		//TAS.debug("PFBuffs.clearBuffTotals we got back the following: ",v);
		//TAS.notice("now using ",totColumns);
		setter = _.reduce(totColumns,function(memo,col){
			var val = parseInt(v['buff_'+col+'-total'],10)||0,
			exists =parseInt(v['buff_'+col+'_exists'],10)||0;
			if(val ){
				memo['buff_'+col+'-total']=0;
			} 
			if (exists){
				memo['buff_'+col+'_exists']=0;
			}
			return memo;
		},{});
		//zero ability penalties
		setter = _.reduce(PFAbilityScores.abilities,function(memo,col){
			var val = parseInt(v['buff_'+col+'-total_penalty'],10)||0,
			exists =parseInt(v['buff_'+col+'_penalty_exists'],10)||0;
			if(val ){
				memo['buff_'+col+'-total_penalty']=0;
			}
			if (exists){
				memo['buff_'+col+'_penalty_exists']=0;
			}
			return memo;
		},setter);
		//clear notes
		buffNoteFields.forEach(function(attr){
			setter[attr]='';
		});
		if (_.size(setter)){
			if(silently){
				params =PFConst.silentParams;
			}
			SWUtils.setWrapper(setter,params,done);
		} else {
			done();
		}
	});
}

/** Gets list of buffs from the buff rows for  so we don't have to keep looping through the ids.
 * Returns between 0 to 6 "rows" for each id , each correspondes to b1..b6 buffs.
 * only returns buffs where -show is 1 and _val is != 0 (i.e. ones that exist for totalling)
 * @param {[string]} ids ids for list
 * @param {Map<string,string>} v from getAttrs
 * @param {string} col  optional, buff to limit on. If supplied, only returns buffs where bonus =col, plus any related buffs 
 * @returns {[{'bonus':string,'bonusType':string,'val':Number}]} array of entries from rows
 */
function assembleRows (ids,v,col){
	var	relatedBuffsL=[];
	if (col){
		relatedBuffsL=affectedBuffs[col]||[];
		relatedBuffsL=relatedBuffsL.concat(buffsAffectingOthers[col]||[]);
	}
	//TAS.debug("assembleRows for "+col + " includes fields "+ relatedBuffsL);
	var rows = ids.reduce(function(m,id){
		var valArray,prefix='repeating_buff2_'+id+'_';
		try {
			valArray= buffsPerRow.reduce(function(im,n){
				var innerPrefix=prefix+n,
				bonusField=innerPrefix+'_bonus',vals={};
				try{
					//TAS.debug("assembleRows looking at "+ bonusField  +" = " + v[bonusField] + " show is "+ v[innerPrefix+'-show']);
					if(v[bonusField] && parseInt(v[innerPrefix+'-show'],10)===1){ 
						if (!col || v[bonusField]===col || relatedBuffsL.indexOf(v[bonusField])>=0) {
							vals.bonus=v[bonusField];
							vals.val = parseInt(v[innerPrefix+'_val'],10)||0;
							if (bonusesWithNoTypes.indexOf(col)>=0){
								vals.bonusType=col;
							} else if (selfTypeOrEnhance.indexOf(col)>=0){
								if(v[innerPrefix+'_bonustype']==='enhancement') {
									vals.bonusType='enhancement';
								} else {
									vals.bonusType = col;
								}
							} else {
								vals.bonusType = v[innerPrefix+'_bonustype']||'untyped';
							}
							//TAS.debug("adding the set ",vals);
							im.push(vals);
						}
					} 
				} catch(er2){
					TAS.error("PFBuffs.assembleRows col:"+col+", row:"+id+", buff:"+n,er2);
				} finally {
					return im;
				}
			},[]);
			if(valArray && _.size(valArray)) {
				//TAS.debug("assembleRows this row had these",valArray);
				m=m.concat(valArray);
			}
		} catch (erri3) {
			TAS.error("PFBuffs.assembleRows erri3:",erri3);
		} finally {
			return m;
		}
	},[]);
	//TAS.debug("assembleRows returning with ",rows);
	return rows;
}
/** Calculates total for given bonus and returns it in setter map. Synchronous.
 * @param {string} col which bonus we are calculating (val from 'bonus' dropdown)
 * @param {[{'bonus':string,'bonusType':string,'val':Number}]} rows output from assembleRows
 * @param {Map<string,string>} v from getAttrs
 * @param {Map<string,string>} setter map to write to for setAttrs, optional
 * @returns {Map<string,string>} setter or new map for setAttrs
 */
function updateBuffTotal (col,rows,v,setter){
	var isAbility=0,
	bonuses = {},
	sums={'sum':0,'pen':0},
	tempInt=0,
	totaldodge=0,tempdodge=0,
	totaldeflection=0, tempdeflect=0,
	totalcol='',
	columns=[col];
	try {
		setter = setter || {};
		isAbility=(PFAbilityScores.abilities.indexOf(col) >= 0) && col.indexOf('skill')<9;
		if (!isAbility && affectedBuffs[col]){
			columns=columns.concat(affectedBuffs[col]);
		}
		//TAS.debug('updateBuffTotal2 for '+col+' columns are ',columns);
		rows = rows.filter(function(row){
			if(columns.indexOf(row.bonus)>=0){
				return 1;
			}
			return 0;
		});
		if (rows && _.size(rows)){
			//TAS.debug("PFBUFFS ROWS NOW:",rows);
			if(col==='hptemp'){
				sums.sum = rows.filter(function(row){
					return row.val>0;
				}).reduce(function(m,row){
					m = Math.max(row.val,m);
					return m;
				},0);
			} else if (col==='size' ){
				sums = rows.reduce(function(m,row){
					if(row.val>0){
						m.sum = Math.max(m.sum,row.val);
					}  else if (row.val<0){
						m.pen = Math.min(m.pen,row.val);
					}
					return m;
				},sums);
			} else {
				bonuses = rows.reduce(function(m,row){
					if(row.bonus===col){
						if (row.val<0){
							m.penalty = (m.penalty||0) + row.val;
						} else if(stackingTypes.includes(row.bonusType) ) {
							m[row.bonusType] = (m[row.bonusType]||0) + row.val;
						} else {
							m[row.bonusType] = Math.max((m[row.bonusType]||0),row.val);
						}
					}
					return m;
				},{});
				//TAS.debug("Bonuses",bonuses);
				if(_.size(columns)>1){
					//TAS.debug("subtract other bonuses");
					//rest added together so don't stack
					bonuses = rows.reduce(function(m,row){
						if (stackingTypes.indexOf(row.bonusType)<0 && 
							affectedBuffs[col].indexOf(row.bonus)>=0 &&
							row.val >0 && m[row.bonusType]>0){
								if(row.val < m[row.bonusType]){
									m[row.bonusType] -= row.val;
								} else {
									m[row.bonusType]=0;
								}
						}
						return m;
					},bonuses);
					//TAS.debug("PFBUFFS BONUSES before subtraacting  ",bonuses);
				}
				//look at bonuses on rest of sheet to see if they overlap and don't stack:
				_.each(otherCharBonuses[col],function(charField,bonusType){
					//TAS.debug('comparing to val of '+charField+', type is '+bonusType);
					if(bonuses[bonusType]){
						tempInt = parseInt(v[charField],10)||0;
						if(bonuses[bonusType] <= tempInt){
							bonuses[bonusType]=0;
						} else {
							bonuses[bonusType] -= tempInt;
						}
					}
				});
				//TAS.debug("PFBUFFS FINAL BONUSES for "+ col+":",bonuses);
				if (isAbility){
					try {
						sums.pen = bonuses.penalty||0;
					} catch (er2){}
					bonuses.penalty=0;
				}

				if(armorcols.indexOf(col)<0){
					sums.sum = _.reduce(bonuses,function(m,bonus,bonusType){
						m+=bonus;
						return m;
					},0);
				} else {
					//is an armor type, break out dodge and deflection
					sums.sum = _.reduce(bonuses,function(m,bonus,bonusType){
						if(bonusType==='dodge'){
							totaldodge = bonus;
						} else if (bonusType==='deflection'){
							totaldeflection=bonus;
						} else {
							m+=bonus;
						}
						return m;
					},0);
				}
			}
		}

		if(col==='ac'){
			//TAS.debug("column is AC, setting dodge to "+totaldodge+" and deflection to "+ totaldeflection);
			tempdodge=parseInt(v['buff_dodge-total'],10)||0;
			tempdeflect=parseInt(v['buff_deflection-total'],10)||0;
			//ignore dodge and deflect for any other than ac
			if (totaldodge !== tempdodge){
				setter['buff_dodge-total']=totaldodge;
				tempInt = parseInt(v['buff_dodge_exists'],10)||0;
				if(totaldodge && !tempInt){
					setter['buff_dodge_exists']=1;
				} else if (tempInt && !totaldodge) {
					setter['buff_dodge_exists']=0;
				}
			}
			if (totaldeflection!==tempdeflect){
				setter['buff_deflection-total']=totaldodge;
				tempInt = parseInt(v['buff_deflection_exists'],10)||0;
				if(totaldeflection && !tempInt){
					setter['buff_deflection_exists']=1;
				} else if (tempInt && !totaldeflection){
					setter['buff_deflection_exists']=0;
				}
			}
		}

		totalcol=buffToTot[col];
		if(!totalcol){
			TAS.error("######################", "cannot find total column corresponding to "+col);
			return setter;
		}
		if ( parseInt(v['buff_'+totalcol+'-total'],10)!==sums.sum){
			setter['buff_'+totalcol+'-total']=sums.sum;
		}
		tempInt = parseInt(v['buff_'+totalcol+'_exists'],10)||0;
		if (sums.sum !== 0 && tempInt===0){
			setter['buff_'+totalcol+'_exists']=1;
		} else if (sums.sum===0 && tempInt===1){
			setter['buff_'+totalcol+'_exists']=0;
		}
		if (isAbility){
			if ( parseInt(v['buff_'+totalcol+'-total_penalty'],10)!==sums.pen){
				setter['buff_'+totalcol+'-total_penalty']=sums.pen;
			}
			tempInt = parseInt(v['buff_'+totalcol+'_penalty_exists'],10)||0;
			if (sums.pen!==0 && tempInt===0){
				setter['buff_'+totalcol+'_penalty_exists']=1;
			} else if (sums.pen===0 && tempInt === 1){
				setter['buff_'+totalcol+'_penalty_exists']=0;
			}
		}
	} catch(err){
		TAS.error("PFBuffs.updateBuffTotal",err);
	} finally {
		//TAS.debug("######################","PFBuffs setting ",setter);
		return setter;
	}
}
/** update total for given buff. calls assembleRows, updateBuffTotal for the column.
 * @param {string} col the bonus/buff to calculate
 * @param {function} callback when done
 * @param {boolean} silently if set with silent true
 */
function updateBuffTotalAsync (col, callback,silently){
	var done = _.once(function () {
		//TAS.debug("leaving PFBuffs.updateBuffTotalAsync for "+col);
		if (typeof callback === "function") {
			callback();
		}
	}),
	isAbility = (PFAbilityScores.abilities.indexOf(col) >= 0) && col.indexOf('skill')<0;

	getSectionIDs('repeating_buff2',function(ids){
		var fields,totfields,otherfields,totals=[],columnsToGet=[],columnsToUpdate=[];
		if(ids && _.size(ids)){
			try {
				fields = SWUtils.cartesianAppend(['repeating_buff2_'],ids,buffRowAttrs);
				//columns = concat(buffsAffectingOthers[col]||[]).concat(affectedBuffs[col]||[]);
				columnsToGet=[col];
				columnsToUpdate=[col];
				if(buffsAffectingOthers[col]){
					columnsToGet=columnsToGet.concat(buffsAffectingOthers[col]);
					columnsToUpdate=columnsToUpdate.concat(buffsAffectingOthers[col]);
				}
				if(affectedBuffs[col]){
					columnsToGet = columnsToGet.concat(affectedBuffs[col]);
				}

				totals = columnsToUpdate.map(function(b){return buffToTot[b];});
				if (col==='ac'){
					totals.push('dodge')
					totals.push('deflection');
				}
				totfields = totals.map(function(t){return 'buff_'+t+'-total'}).concat(
					totals.map(function(t){return 'buff_'+t+'_exists'}));
				if (isAbility){
					totfields = totfields.concat(['buff_'+buffToTot[col]+'-total_penalty', 'buff_'+buffToTot[col]+'_penalty_exists']);
				}
				fields = fields.concat(totfields);
				fields = fields.concat(buffNoteFields);
		
				otherfields = columnsToGet.reduce(function(m,c){
					if (otherCharBonuses[c]){
						_.each(otherCharBonuses[c],function(bonus,bonustype){
							m.push(bonus);
						});
					}
					return m;
				},[]);
				if(_.size(otherfields)){
					fields = fields.concat(otherfields);
				}
			} catch (outerr){
				TAS.error("PFBUffs.updateBuffTotalAsync2 "+col+" error before getattrs",outerr);
				done();
				return;
			}
			//TAS.debug("updateBuffTotalAsync2 fields ",fields,'#######################################');
			getAttrs(fields,function(v){
				var rows,params={}, setter={};
				try {
					//TAS.debug("PFBuffs.totals for "+ col+" v is",v);
					//don't need to put this in different loop but do it for future since when we move to multi column at once will need.
					ids = ids.filter(function(id){
						return (parseInt(v['repeating_buff2_'+id+'_enable_toggle'],10)||0);
					});
					if(_.size(ids)){
						rows = assembleRows(ids,v,col);
						setter = columnsToUpdate.reduce(function(m,c){
							return updateBuffTotal(c,rows,v,m);
						},setter);
					} else {
						//all have 0!
						clearBuffTotals();
					}
				} catch (errou){
					TAS.error("PFBuffs.updateBuffTotalAsync errrou on col "+col,errou);
				} finally {
					if (_.size(setter)){
						if (silently){
							params = PFConst.silentParams;
						}
						SWUtils.setWrapper(setter,params,done);
					} else {
						done();
					}
				}
			});
		} else {
			clearBuffTotals(callback);
		}
	});	
}

function updateAllBuffTotalsAsync (callback,silently,eventInfo){
	var done = _.once(function () {
		//TAS.debug("leaving PFBuffs.updateBuffTotalAsync for "+col);
		if (typeof callback === "function") {
			callback();
		}
	});

	getSectionIDs('repeating_buff2',function(ids){
		var fields,buffRepFields;
		if(!ids || _.size(ids)===0){
			clearBuffTotals(done,silently);
			return;
		}
		fields = SWUtils.cartesianAppend(['repeating_buff2_'],ids,buffRowAttrs);
		fields = fields.concat(buffTotFields);
		fields = fields.concat(charBonusFields);
		//don't need to get notes since we're forcing a reset
		//fields = fields.concat(buffNoteFields);
		
		getAttrs(fields,function(v){
			var rows=[], params={}, setter={};
			try {
				ids = ids.filter(function(id){
					return (parseInt(v['repeating_buff2_'+id+'_enable_toggle'],10)||0);
				});
				if(!ids || _.size(ids)===0){
					clearBuffTotals(done,silently);
					return;
				}
				//start with blank notes to force reset
				buffNoteFields.forEach(function(attr){
					setter[attr]='';
					v[attr]='';
				});
				//TAS.debug("PFBuffs.updateAllBuffTotalsAsync2 v is",v);
				setter = ids.reduce(function(m,id){
					m = getBuffNotes(id,v,m);
					v = _.extend(v,m); // copy any updates back for next pass
					return m;
				},setter);
				//now calculate totals.
				rows = assembleRows(ids,v);
				_.each(buffColumns,function(col){
					setter=updateBuffTotal(col,rows,v,setter);
				});
			} catch (errou){
				TAS.error("PFBuffs.updateAllBuffTotalsAsync2 errrou on col ",errou);
			} finally {
				if (_.size(setter)){
					//TAS.debug("######################","PFBuffs.updateAllBuffTotalsAsync2 setting ",setter);
					if (silently){
						params = PFConst.silentParams;
					}
					SWUtils.setWrapper(setter,params,done);
				} else {
					done();
				}
			}
		});
	});		
}
/**Sets 1 or 0 for buffexists in status panel (only for recalculate)
 * REFACTOR:  i think this can be deleted
 * @param {function} callback when done
 */
function resetStatuspanel (callback) {
	var done = _.once(function () { if (typeof callback === "function") { callback(); } });
	getAttrs(buffTotFields, function (v) {
		var setter = {},
		getExists= function(pre,post){
			var val,exists;
			post=post||'';
			val = parseInt(v[pre + "-total"+post], 10) || 0; 
			exists = parseInt(v[pre +post+ "_exists"], 10) || 0;
			if (val !== 0 && !exists) {
				return 1;
			}
			if (val === 0 && exists) {
				return 0;
			}
			return -1;
		};
		try {
			setter = _.reduce(totColumns, function (memo, col) {
				var pre,v;
				pre="buff_" + col;
				v=getExists(pre,'');
				if (v===1 || v===0){
					memo[pre+'_exists']=v;
				}
				return memo;
			}, setter);
			setter = _.reduce(PFAbilityScores.abilities, function (memo, col) {
				var pre,v;
				pre="buff_" + col;
				v=getExists(pre,'_penalty');
				if (v===1 || v===0){
					memo[pre+'_penalty_exists']=v;
				}
				return memo;
			}, setter);
		} catch (err) {
			TAS.error("PFBuffs.resetStatuspanel2 error inside calculate exists", err);
		} finally {
			if (_.size(setter) > 0) {
				SWUtils.setWrapper(setter, PFConst.silentParams, done);
			} else {
				done();
			}
		}
	});
}
function reEvaluateCustomMacros(callback,silently){
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	}),
	buffRowMacros2 =['_b1-show','_b1_val','_b1_macro-text',
		'_b2-show','_b2_val','_b2_macro-text',
		'_b3-show','_b3_val','_b3_macro-text',
		'_b4-show','_b4_val','_b4_macro-text',
		'_b5-show','_b5_val','_b5_macro-text',
		'_b6-show','_b6_val','_b6_macro-text',
		'_enable_toggle'],
	recalculateBuffRow = function (callback,id,v) {
		var buffDone = _.after(6, callback);
		try {
			buffsPerRow.forEach(function(b){
				if (parseInt(v['repeating_buff2_'+id+'_enable_toggle'],10) && 
					parseInt(v['repeating_buff2_'+id+'_' + b + '-show'],10) ) {
						SWUtils.evaluateAndSetNumber('repeating_buff2_'+id+'_' +b + "_macro-text", 'repeating_buff2_'+id+'_' + b+'_val',0,buffDone,true);
				} else {
					buffDone();
				}
			});
		} catch (err) {
			TAS.error("PFBuffs.reEvaluateCustomMacros2:  rowid" + id, err);
			buffDone();
		}

	};

	getSectionIDs("repeating_buff", function (ids) {
		//TAS.debug("pfbuffsrecalculate there are " + _.size(ids) + " rows and " + numColumns + " columns");
		var fields;
		try {
			if (_.size(ids) > 0) {
				fields = SWUtils.cartesianAppend(['repeating_buff2_'],ids,buffRowMacros2);
				getAttrs(fields,function(v){
					var numRows = _.size(ids),
					doneRow = _.after(numRows, done);
					ids.forEach(function(id){
						recalculateBuffRow(doneRow,id,v);
					});
				});
			} else {
				clearBuffTotals(done);
			}
		} catch (err) {
			TAS.error("PFBuffs.reEvaluateCustomMacros2", err);
			//what to do? just quit
			done();
		}
	});
}

function getCommonBuffEntries(name){
	var id,prefix='',setter={};
	if(!name){
		return setter;
	}
	id = generateRowID();
	prefix = 'repeating_buff2_'+id+'_';
	setter[prefix+'enable_toggle']='1';
	setter[prefix+'tabcat2']='1';//should be enabled by default?
	switch(name){
		case 'rage':
			setter[prefix+'name']='Rage (Ex)';
			setter[prefix+'bufftype']='class';
			setter[prefix+'tabcat']='class';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='str';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='4+(2*floor((@{level}-1)/10))';
			setter[prefix+'b1_val']=4;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='con';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='4+(2*floor((@{level}-1)/10))';
			setter[prefix+'b2_val']=4;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ac';
			setter[prefix+'b3_bonustype']='untyped';
			setter[prefix+'b3_macro-text']='-3';
			setter[prefix+'b3_val']=-3;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='will';
			setter[prefix+'b4_bonustype']='morale';
			setter[prefix+'b4_val']=2;
			setter[prefix+'b4_macro-text']='2';
			setter[prefix+'add_note_to_roll']='skill';
			setter[prefix+'notes']='While in rage, a barbarian cannot use any Charisma-, Dexterity-, or Intelligence-based skills (except Acrobatics, Fly, Intimidate, and Ride) or any ability that requires patience or concentration.';
			setter[prefix+'description-show']=1;
			break;
		case 'unchainedrage':
			setter[prefix+'name']='Rage (Unchained) (Ex)';
			setter[prefix+'bufftype']='class';
			setter[prefix+'tabcat']='class';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='melee';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='2+(floor((@{level}-1)/10))';
			setter[prefix+'b1_val']=4;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg_melee';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='2+(floor((@{level}-1)/10))';
			setter[prefix+'b2_val']=4;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ac';
			setter[prefix+'b3_bonustype']='untyped';
			setter[prefix+'b3_macro-text']='-3';
			setter[prefix+'b3_val']=-3;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='will';
			setter[prefix+'b4_bonustype']='morale';
			setter[prefix+'b4_macro-text']='2';
			setter[prefix+'b4_val']=2;
			setter[prefix+'b5-show']=1;
			setter[prefix+'b5_bonus']='hptemp';
			setter[prefix+'b5_hide']=1;
			setter[prefix+'b5_macro-text']='2*@{level}';
			setter[prefix+'b5_val']=2;
			setter[prefix+'b5_val_error']=1;
			setter[prefix+'add_note_to_roll']='skill';
			setter[prefix+'notes']='While in rage, a barbarian cannot use any Charisma-, Dexterity-, or Intelligence-based skills (except Acrobatics, Fly, Intimidate, and Ride) or any ability that requires patience or concentration.';
			setter[prefix+'description-show']=1;
			break;
		case 'prayer':
			setter[prefix+'name']='Prayer';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='luck';
			setter[prefix+'b1_macro-text']='1';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_bonustype']='luck';
			setter[prefix+'b2_macro-text']='1';
			setter[prefix+'b2_val']=1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='saves';
			setter[prefix+'b3_bonustype']='luck';
			setter[prefix+'b3_macro-text']='1';
			setter[prefix+'b3_val']=1;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='check_skills';
			setter[prefix+'b4_bonustype']='luck';
			setter[prefix+'b4_macro-text']='1';
			setter[prefix+'b4_val']=1;
			break;
		case 'prayerdebuff':
			setter[prefix+'name']='Prayer (debuff)';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='luck';
			setter[prefix+'b1_macro-text']='-1';
			setter[prefix+'b1_val']=-1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_bonustype']='luck';
			setter[prefix+'b2_macro-text']='-1';
			setter[prefix+'b2_val']=-1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='saves';
			setter[prefix+'b3_bonustype']='luck';
			setter[prefix+'b3_macro-text']='-1';
			setter[prefix+'b3_val']=-1;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='check_skills';
			setter[prefix+'b4_bonustype']='luck';
			setter[prefix+'b4_macro-text']='-1';
			setter[prefix+'b4_val']=-1;
			break;
		case 'bless':
			setter[prefix+'name']='Bless';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='1';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='will';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='1';
			setter[prefix+'b2_val']=1;
			setter[prefix+'add_note_to_roll']='save';
			setter[prefix+'notes']='Will save includes +@{b2_val} morale bonus on saving throws against fear effects. Uncheck buff when not saving vs fear.';
			setter[prefix+'description-show']=1;
			break;
		case 'aid':
			setter[prefix+'name']='Aid';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='1';
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='will';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='2';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3_val']=1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='hptemp';
			setter[prefix+'b3_hide']=1;
			setter[prefix+'b3_val_error']=1;
			setter[prefix+'b3_macro-text']='1d8 + casterlvl';
			setter[prefix+'add_note_to_roll']='save';
			setter[prefix+'notes']='Will save includes +@{b2_val} morale bonus on saving throws against fear effects. Uncheck buff when not saving vs fear.';
			setter[prefix+'description-show']=1;
			break;
		case 'haste':
			setter[prefix+'name']='Haste';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='untyped';
			setter[prefix+'b1_macro-text']='1';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='ac';
			setter[prefix+'b2_bonustype']='dodge';
			setter[prefix+'b2_macro-text']='1';
			setter[prefix+'b2_val']=1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ref';
			setter[prefix+'b3_bonustype']='dodge';
			setter[prefix+'b3_macro-text']='1';
			setter[prefix+'b3_val']=1;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='speed';
			setter[prefix+'b4_bonustype']='enhancement';
			setter[prefix+'b4_macro-text']='min(@{speed-base},30)';
			setter[prefix+'b4_val']=30;
			setter[prefix+'add_note_to_roll']='attack';
			setter[prefix+'notes']='When making a full attack action, a hasted creature may make one extra attack with one natural or manufactured weapon. All modes of movement increase.';
			setter[prefix+'description-show']=1;
			break;
		case 'enlargeperson':
			setter[prefix+'name']='Enlarge Person';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='size';
			setter[prefix+'b1_hide']=1;
			setter[prefix+'b1_macro-text']='1';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='str';
			setter[prefix+'b2_bonustype']='size';
			setter[prefix+'b2_macro-text']='2';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='dex';
			setter[prefix+'b3_bonustype']='size';
			setter[prefix+'b3_macro-text']='-2';
			setter[prefix+'b3_val']=-2;
			setter[prefix+'notes']='Reach increased, height x2, weight x4.';
			break;
		case 'divinefavor':
			setter[prefix+'name']='Divine Favor';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='luck';
			setter[prefix+'b1_macro-text']='min(3,1+floor((@{level}-1)/3))';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_bonustype']='luck';
			setter[prefix+'b2_macro-text']='min(3,1+floor((@{level}-1)/3))';
			setter[prefix+'b2_val']=2;
			break;
		case 'shieldoffaith':
			setter[prefix+'name']='Shield of Faith';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='ac';
			setter[prefix+'b1_bonustype']='deflection';
			setter[prefix+'b1_macro-text']='2+floor((@{level})/6)';
			setter[prefix+'b1_val']=2;
			break;
		case 'shield':
			setter[prefix+'name']='Shield';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='shield';
			setter[prefix+'b1_bonustype']='shield';
			setter[prefix+'b1_macro-text']='4';
			setter[prefix+'b1_val']=4;
			setter[prefix+'notes']='It negates magic missile attacks directed at you. This bonus applies against incorporeal touch attacks, since it is a force effect. The shield has no armor check penalty or arcane spell failure chance.';
			setter[prefix+'description-show']=1;
			break;
		case 'magearmor':
			setter[prefix+'name']='Mage Armor';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='armor';
			setter[prefix+'b1_bonustype']='armor';
			setter[prefix+'b1_macro-text']='4';
			setter[prefix+'b1_val']=4;
			setter[prefix+'notes']='entails no armor check penalty, arcane spell failure chance, or speed reduction. Since mage armor is made of force, incorporeal creatures can\'t bypass it the way they do normal armor.';
			setter[prefix+'description-show']=1;
			break;
		case 'inspirecourage':
			setter[prefix+'name']='Inspire Courage';
			setter[prefix+'bufftype']='song';
			setter[prefix+'tabcat']='song';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='competence';
			setter[prefix+'b1_macro-text']='1+floor((@{level}+1)/6)';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='dmg';
			setter[prefix+'b3_bonustype']='competence';
			setter[prefix+'b3_macro-text']='1+floor((@{level}+1)/6)';
			setter[prefix+'b3_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='will';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='1+floor((@{level}+1)/6)';
			setter[prefix+'b2_val']=1;
			setter[prefix+'add_note_to_roll']='save';
			setter[prefix+'notes']='Will save includes +@{b2_val} morale bonus on saving throws against charm and fear effects. Uncheck buff when not saving vs charm or fear.';
			setter[prefix+'description-show']=1;
			break;
		case 'inspiregreatness':
			setter[prefix+'name']='Inspire Greatness';
			setter[prefix+'bufftype']='song';
			setter[prefix+'tabcat']='song';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='competence';
			setter[prefix+'b1_macro-text']='2';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='fort';
			setter[prefix+'b2_bonustype']='competence';
			setter[prefix+'b2_macro-text']='2';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='hptemp';
			setter[prefix+'b3_hide']=1;
			setter[prefix+'b3_macro-text']='2d10+(2*@{CON-mod})';
			setter[prefix+'b3_val_error']=1;
			break;
		case 'inspiredrage':
			setter[prefix+'name']='Inspired Rage';
			setter[prefix+'bufftype']='song';
			setter[prefix+'tabcat']='song';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='str';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='2+(2*floor((@{level}+1)/8))';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='con';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='2+(2*floor((@{level}+1)/8))';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ac';
			setter[prefix+'b3_bonustype']='untyped';
			setter[prefix+'b3_macro-text']='-1';
			setter[prefix+'b3_val']=-1;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='will';
			setter[prefix+'b4_bonustype']='morale';
			setter[prefix+'b4_macro-text']='1+floor((@{level}+1)/4)';
			setter[prefix+'b4_val']=1;
			setter[prefix+'add_note_to_roll']='skill';
			setter[prefix+'notes']='While under the effects of inspired rage, allies other than the skald cannot use any Charisma-, Dexterity-, or Intelligence-based skills (except Acrobatics, Fly, Intimidate, and Ride) or any ability that requires patience or concentration';
			setter[prefix+'description-show']=1;
			break;
		case 'heroism':
			setter[prefix+'name']='Heroism';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='2';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='saves';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='2';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='check_skills';
			setter[prefix+'b3_bonustype']='morale';
			setter[prefix+'b3_macro-text']='2';
			setter[prefix+'b3_val']=2;
			break;
		case 'blessingoffervor':
			setter[prefix+'name']='Blessing of Fervor';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='untyped';
			setter[prefix+'b1_macro-text']='2';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='ac';
			setter[prefix+'b2_bonustype']='dodge';
			setter[prefix+'b2_macro-text']='2';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ref';
			setter[prefix+'b3_bonustype']='dodge';
			setter[prefix+'b3_macro-text']='2';
			setter[prefix+'b3_val']=2;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='speed';
			setter[prefix+'b4_bonustype']='enhancement';
			setter[prefix+'b4_macro-text']='30';
			setter[prefix+'b4_val']=30;
			setter[prefix+'notes']='Pick speed bonus, or Attack/AC/Reflex bonus, or other bonuses per round.';
			setter[prefix+'description-show']=1;
			break;
		case 'goodhope':
			setter[prefix+'name']='Good Hope';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='2';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='2';
			setter[prefix+'b2_val']=2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='saves';
			setter[prefix+'b3_bonustype']='morale';
			setter[prefix+'b3_macro-text']='2';
			setter[prefix+'b3_val']=2;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='check';
			setter[prefix+'b4_bonustype']='morale';
			setter[prefix+'b4_macro-text']='2';
			setter[prefix+'b4_val']=2;
			break;
		case 'crushingdespair':
			setter[prefix+'name']='Crushing Despair';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_macro-text']='-2';
			setter[prefix+'b1_val']=-2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_macro-text']='-2';
			setter[prefix+'b2_val']=-2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='saves';
			setter[prefix+'b3_macro-text']='-2';
			setter[prefix+'b3_val']=-2;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b4_bonus']='check';
			setter[prefix+'b4_macro-text']='-2';
			setter[prefix+'b4_val']=-2;
			break;
		case 'archonsaura':
			setter[prefix+'name']='Archon\'s Aura';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_macro-text']='-2';
			setter[prefix+'b1_val']=-2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='saves';
			setter[prefix+'b2_macro-text']='-2';
			setter[prefix+'b2_val']=-2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ac';
			setter[prefix+'b3_macro-text']='-2';
			setter[prefix+'b3_val']=-2;
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='until it successfully hits caster with an attack';
			break;
		case 'curse':
			setter[prefix+'name']='Curse';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='str';
			setter[prefix+'b1_macro-text']='-6';
			setter[prefix+'b1_val']=-6;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='attack';
			setter[prefix+'b2_macro-text']='-4';
			setter[prefix+'b2_val']=-4;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='saves';
			setter[prefix+'b2_macro-text']='-4';
			setter[prefix+'b2_val']=-4;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='check';
			setter[prefix+'b2_macro-text']='-4';
			setter[prefix+'b2_val']=-4;
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='Choose -6 to any ability or the other debuffs, or turn all off and on each turn, the target has a 50% chance to act normally; otherwise, it takes no action';
			break;
		case 'desecrate':
			setter[prefix+'name']='Desecrate (If Undead)';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='profane';
			setter[prefix+'b1_macro-text']='1';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_bonustype']='profane';
			setter[prefix+'b2_macro-text']='1';
			setter[prefix+'b2_val']=1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='saves';
			setter[prefix+'b3_bonustype']='profane';
			setter[prefix+'b3_macro-text']='1';
			setter[prefix+'b3_val']=1;
			setter[prefix+'add_note_to_roll']='save'
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='add +3 to save vs channel energy.'
			break;
		case 'consecrate':
			setter[prefix+'name']='Consecrate (If Undead)';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_macro-text']='-1';
			setter[prefix+'b1_val']=-1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_macro-text']='-1';
			setter[prefix+'b2_val']=-1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='saves';
			setter[prefix+'b3_macro-text']='-1';
			setter[prefix+'b3_val']=-1;
			setter[prefix+'add_note_to_roll']='save'
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='Channel energy save DCs increase by 3 (equivalent to -3 penalty)'
			break;
		case 'slow':
			setter[prefix+'name']='Slow';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_macro-text']='-1';
			setter[prefix+'b1_val']=-1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='ac';
			setter[prefix+'b2_macro-text']='-1';
			setter[prefix+'b2_val']=-1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='ref';
			setter[prefix+'b3_macro-text']='-1';
			setter[prefix+'b3_val']=-1;
			setter[prefix+'b4-show']=1;
			setter[prefix+'b3_bonus']='speed';
			setter[prefix+'b3_macro-text']='-ceil(ceil(@{speed-base}/2)/5)*5';
			setter[prefix+'b3_val']=-15;
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='Also apply staggered condition'
			break;
		case 'reduceperson':
			setter[prefix+'name']='Reduce Person';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='size';
			setter[prefix+'b1_hide']=1;
			setter[prefix+'b1_macro-text']='-1';
			setter[prefix+'b1_val']=-1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='str';
			setter[prefix+'b2_bonustype']='size';
			setter[prefix+'b2_macro-text']='-2';
			setter[prefix+'b2_val']=-2;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='dex';
			setter[prefix+'b3_bonustype']='size';
			setter[prefix+'b3_macro-text']='+2';
			setter[prefix+'b3_val']=+2;
			setter[prefix+'notes']='Reach decreased, height /2, weight /4.';
			break;
		case 'bane':
			setter[prefix+'name']='Bane';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_macro-text']='-1';
			setter[prefix+'b1_val']=-1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='will';
			setter[prefix+'b2_macro-text']='-1';
			setter[prefix+'b2_val']=-1;
			setter[prefix+'add_note_to_roll']='save';
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='Will save includes @{b2_val} to save vs fear, reverse if not saving vs fear';
			break;
		case 'deathknell':
			setter[prefix+'name']='Death Knell';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='str';
			setter[prefix+'b1_bonustype']='enhancement';
			setter[prefix+'b1_macro-text']='2';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='casterlevel';
			setter[prefix+'b2_bonustype']='untyped';
			setter[prefix+'b2_macro-text']='1';
			setter[prefix+'b2_val']=1;
			setter[prefix+'b3-show']=1;
			setter[prefix+'b3_bonus']='hptemp';
			setter[prefix+'b3_hide']=1;
			setter[prefix+'b3_macro-text']='1d8';
			setter[prefix+'b3_val']=4;
			setter[prefix+'b3_val_error']=1;			
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='roll 1d8 and place in temp hp macro textbox';
			break;
		case 'magicvestment':
			setter[prefix+'name']='Magic Vestment';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='ac';
			setter[prefix+'b1_bonustype']='enhancement';
			setter[prefix+'b1_macro-text']='1+floor(@{level}/4)';
			setter[prefix+'b1_val']=1;
			break;
		case 'ward':
			setter[prefix+'name']='Ward';
			setter[prefix+'bufftype']='hex';
			setter[prefix+'tabcat']='hex';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='ac';
			setter[prefix+'b1_bonustype']='deflection';
			setter[prefix+'b1_macro-text']='2 + (floor(@{level}/8)';
			setter[prefix+'b1_val']=2;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='saves';
			setter[prefix+'b2_bonustype']='resistance';
			setter[prefix+'b2_macro-text']='2 + (floor(@{level}/8)';
			setter[prefix+'b2_val']=2;
			setter[prefix+'add_note_to_roll']='save';			
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='This ward lasts until the warded creature is hit or fails a saving throw';
			break;
		case 'battlespirit':
			setter[prefix+'name']='Battle Spirit';
			setter[prefix+'bufftype']='aura';
			setter[prefix+'tabcat']='aura';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_bonustype']='morale';
			setter[prefix+'b1_macro-text']='1 + (floor(@{level}/8)';
			setter[prefix+'b1_val']=1;
			setter[prefix+'b2-show']=1;
			setter[prefix+'b2_bonus']='dmg';
			setter[prefix+'b2_bonustype']='morale';
			setter[prefix+'b2_macro-text']='1 + (floor(@{level}/8)';
			setter[prefix+'b2_val']=1;
			break;
		case 'battleward':
			setter[prefix+'name']='Battle Ward';
			setter[prefix+'bufftype']='hex';
			setter[prefix+'tabcat']='hex';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='ac';
			setter[prefix+'b1_bonustype']='deflection';
			setter[prefix+'b1_macro-text']='3 + (floor(@{level}/8)';
			setter[prefix+'b1_val']=3;
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='The next time a foe makes an attack roll against the target, the ward activates and grants a @{b1_val} deflection bonus to the warded creature\'s AC. Each subsequent time the warded creature is attacked, the defection bonus decreases by 1.';
			break;
		case 'hamperinghex':
			setter[prefix+'name']='hampering Hex';
			setter[prefix+'bufftype']='hex';
			setter[prefix+'tabcat']='hex';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='ac';
			setter[prefix+'b1_macro-text']='-2';
			setter[prefix+'b1_val']=-2;
			setter[prefix+'notes']='At 8th level the penalty becomes -4';
			break;
		case 'boneward':
			setter[prefix+'name']='Bone Ward';
			setter[prefix+'bufftype']='hex';
			setter[prefix+'tabcat']='hex';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='ac';
			setter[prefix+'b1_bonustype']='deflection';
			setter[prefix+'b1_macro-text']='2 + (floor(@{level}/8)';
			setter[prefix+'b1_val']=2;
			break;
		case 'stardust':
			setter[prefix+'name']='Stardust';
			setter[prefix+'bufftype']='spell';
			setter[prefix+'tabcat']='spell';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='attack';
			setter[prefix+'b1_macro-text']='-1 - (floor(@{level}/4)';
			setter[prefix+'b1_val']=-1;
			setter[prefix+'add_note_to_roll']='skill';
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='Also apply @{b1_val} penalty to sight based perception checks';
			break;
		case 'airbarrier':
			setter[prefix+'name']='Air Barrier';
			setter[prefix+'bufftype']='hex';
			setter[prefix+'tabcat']='hex';
			setter[prefix+'b1-show']=1;
			setter[prefix+'b1_bonus']='armor';
			setter[prefix+'b1_bonustype']='armor';
			setter[prefix+'b1_macro-text']='4 + ((floor((@{level}-3)/4)';
			setter[prefix+'b1_val']=4;
			setter[prefix+'description-show']='1';
			setter[prefix+'notes']='At 13th level, this barrier causes incoming arrows, rays, and other ranged attacks requiring an attack roll against her to suffer a 50% miss chance.';
			break;
	}
	return setter;
}

export function addCommonBuff(callback){
	var done=function(){
		if (typeof callback === "function"){
			callback();
		}
	}, setter={}, fields;
	fields = ['add_common_buff','common_buff_toadd'];
	getAttrs(fields,function(v){
		TAS.debug("adding common buff:",v);
		if(parseInt(v.add_common_buff,10)){
			if(v['common_buff_toadd'] && v['common_buff_toadd']!='0'){
				setter = getCommonBuffEntries(v['common_buff_toadd']);
				setter.common_buff_toadd='';
				switch(v['common_buff_toadd']){
					case 'slow':
						setter['condition-Staggered']=1;
						break;
				}
			} else if (v['common_buff_toadd']=='0'){
				setter.common_buff_toadd='';
			}
			setter.add_common_buff = 0;
			TAS.debug("common buff setting: ",setter);
			SWUtils.setWrapper(setter,PFConst.silentParams,updateAllBuffTotalsAsync);
		}
	});
}

function mergeOldIntoNewBuffs(callback){
	var done = function(failed){
		//set checkbox
		SWUtils.setWrapper({'merge_buffs_now':0},PFConst.silentParams,function(){
			if(typeof callback === "function"){
				callback();
			}
		});
		//parallel
		if(!failed){
			updateAllBuffTotalsAsync();
		}
	};
	PFBuffsOld.getAllRowAttrs(function(ids,v){
		var setter={};
		if(!ids ||!v){
			done(1);
			return;
		}
		TAS.debug("OLD BUFFS ARE: ", ids, v);
		ids.forEach(function(id){
			var prefix = 'repeating_buff_'+id+'_',
			newId='',
			newprefix='',
			buffCounter=0,
			tempprefix='',
			buffprefix='',
			newBuffName='',
			buffs=[],
			doneAttacks=0,
			doneAC=0,
			doneSaves=0;
			try {
				//filter for attribute/ values from v for this id row:
				//then filter for buffs w macro-text only (to get one val per row, and only where user entered text, cause others there too w/defaults
				//then get the attr name from the macro text attribute (after id_, before _macro-text)
				//then filter for buffs where -show is 1
				buffs = Object.keys(v).filter(function(attr){
					return (attr.indexOf(prefix)===0);
				}).filter (function(attr){
					return (/\macro\-text/i).test(attr);
				}).filter(function(macroattr){
					if(v[macroattr]){
						return true;
					}
					return false;
				}).map(function(attr){
					return SWUtils.getAttributeName(attr).slice(5,-11); //get only the buff name
				}).filter(function(attr){
					return ( parseInt(v['repeating_buff_'+id+'_buff-'+attr+'-show'],10) === 1); //only where -show checked
				});
				//TAS.debug("BUFFS LEFT ON ROW "+id+" are ",buffs);
				//if any left then create new buff2 row
				if (_.size(buffs)) {
					newId=generateRowID();
					newprefix='repeating_buff2_'+newId+'_';
					tempprefix=newprefix+'b';
					setter[newprefix+'enable_toggle']=v[prefix+'buff-enable_toggle']||'0';
					setter[newprefix+'name']=v[prefix+'buff-name']||'';
					if(v[prefix+'buff-notes']){
						setter[newprefix+'notes']=v[prefix+'buff-notes'];
					}
					//check for buffs that should be combined into 1:
					if(buffs.indexOf('CMD')>=0 && buffs.indexOf('AC')>=0){
						if( parseInt(v[prefix+'buff-AC'],10)===parseInt(v[prefix+'buff-CMD'],10)){
							//TAS.debug('both ac and cmd');
							buffCounter++;
							buffprefix = tempprefix + buffCounter ;
							setter[buffprefix+'_macro-text']= v[prefix+'buff-AC_macro-text'];
							setter[buffprefix+'_val']=v[prefix+'buff-AC'];
							setter[buffprefix+'_bonus']='ac';
							if(buffs.indexOf('Touch') ){
								setter[buffprefix+'_bonustype']='deflection';
							} else {
								setter[buffprefix+'_bonustype']='untyped';
							}
							setter[buffprefix+'-show']=1;
							//if flat footed assume uncanny dodge already so will be built in
							buffs = _.without(buffs,'AC','CMD','flat-footed','Touch');
						}
					}
					if(buffs.indexOf('Melee')>=0 && buffs.indexOf('Ranged')>=0){
						//assume they did not add CMB since it is brand new
						if(parseInt(v[prefix+'buff-Melee'],10)===parseInt(v[prefix+'buff-Ranged'],10)){
							//TAS.debug('both melee and ranged');
							buffCounter++;
							buffprefix = tempprefix + buffCounter;
							setter[buffprefix+'_macro-text']= v[prefix+'buff-Melee_macro-text'];
							setter[buffprefix+'_val']=v[prefix+'buff-Melee'];
							setter[buffprefix+'_bonus']='attack';
							setter[buffprefix+'_bonustype']='untyped';
							setter[buffprefix+'-show']=1;
							buffs = _.without(buffs,'Melee','Ranged','CMB');
						}
					}
					if(buffs.indexOf('Fort')>=0 && buffs.indexOf('Will')>=0 && buffs.indexOf('Ref')>=0) {
						if(parseInt(v[prefix+'buff-Fort'],10)===parseInt(v[prefix+'buff-Will'],10)===parseInt(v[prefix+'buff-Ref'],10)){
							//TAS.debug('all saves');
							buffCounter++;
							buffprefix = tempprefix + buffCounter;
							setter[buffprefix+'_macro-text']= v[prefix+'buff-Fort_macro-text'];
							setter[buffprefix+'_val']=v[prefix+'buff-Fort'];
							setter[buffprefix+'_bonus']='saves';
							setter[buffprefix+'_bonustype']='untyped';
							setter[buffprefix+'-show']=1;					
							buffs = _.without(buffs,'Fort','Will','Ref');
						}
					}
					if(buffs.indexOf('Check')>=0 && buffs.indexOf('check_skills')>=0){
						if(parseInt(v[prefix+'buff-Check'],10)===parseInt(v[prefix+'buff-check_skills'],10)){
							//TAS.debug('both Check and check_skills');
							buffCounter++;
							buffprefix = tempprefix + buffCounter ;
							setter[buffprefix+'_macro-text']= v[prefix+'buff-Check_macro-text'];
							setter[buffprefix+'_val']=v[prefix+'buff-Check'];
							setter[buffprefix+'_bonus']='check';
							setter[buffprefix+'_bonustype']='untyped';
							setter[buffprefix+'-show']=1;
							buffs = _.without(buffs,'Check','check_skills');
						}
					}
					if(buffs.indexOf('DMG')>=0 && buffs.indexOf('DMG_ranged')>=0){
						if(parseInt(v[prefix+'buff-DMG'],10)===parseInt(v[prefix+'buff-DMG_ranged'],10)){
							//TAS.debug("found all damage");
							buffCounter++;
							buffprefix = tempprefix + buffCounter ;
							setter[buffprefix+'_macro-text']= v[prefix+'buff-DMG_macro-text'];
							setter[buffprefix+'_val']=v[prefix+'buff-DMG'];
							setter[buffprefix+'_bonus']='dmg';
							setter[buffprefix+'_bonustype']='untyped';
							setter[buffprefix+'-show']=1;
							buffs = _.without(buffs,'DMG','DMG_ranged');						
						}
					}
					//loop through any buffs left
					buffs.forEach(function(buff){
						//TAS.debug("adding buff "+buff+" to setter, macro is "+v[prefix+'buff-'+buff+'_macro-text']);
						buffCounter++;
						if(buffCounter>6){
							buffCounter=1;
							newId=generateRowID();
							newprefix='repeating_buff2_'+newId+'_';
							tempprefix=newprefix+'b';
							setter[newprefix+'enable_toggle']=v[prefix+'buff-enable_toggle'];
							setter[newprefix+'name']=v[prefix+'buff-name'];
						}
						buffprefix = tempprefix + buffCounter;
						setter[buffprefix+'_macro-text']= v[prefix+'buff-'+buff+'_macro-text'];
						setter[buffprefix+'_val']=v[prefix+'buff-'+buff]||0;
						newBuffName=buff.toLowerCase().replace('-','');
						if(newBuffName==='check'){
							newBuffName='check_ability';
						} else if (newBuffName==='dmg'){
							newBuffName='dmg_melee';
						}
						setter[buffprefix+'_bonus']=newBuffName;
						setter[buffprefix+'_bonustype']='untyped';
						setter[buffprefix+'-show']=1;
					});
				}
			} catch (erri){
				TAS.error("Buff copy error for "+id+" "+ (v['repeating_buff_'+id+'_buff-name']||'') ,erri);
			} 
		});
		if(_.size(setter)){
			TAS.debug("##############################", "MERGE BUFFS NEW BUFFS ARE: ",setter);
			SWUtils.setWrapper(setter,PFConst.silentParams,done);
			//done();
		} else {
			done();
		}
	});
}

export function migrate (callback) {
	PFBuffsOld.migrate(callback);
}

export var recalculate = TAS.callback(function recalculateBuffs(callback, silently, oldversion) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	});
	migrate(function(){
		getAttrs(['use_buff_bonuses'],function(v){
			if(parseInt(v.use_buff_bonuses,10)===1){
				reEvaluateCustomMacros(function(){
					updateAllBuffTotalsAsync(function(){
						resetStatuspanel();//no need to wait
						done();
					},silently);
				},silently);
			} else {
				PFBuffsOld.recalculate(done,silently);
			}
		});
	});
});
function registerEventHandlers () {
	on("change:add_common_buff",TAS.callback(function eventAddCommonBuff(eventInfo){
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + ", event: " + eventInfo.sourceType);
			addCommonBuff();
		}
	}));

	_.each(otherCharBonuses,function(charFieldMap,buff){
		_.each(charFieldMap,function(field,bonustype){
			on("change:"+field,TAS.callback(function eventCharFieldUpdatesBuff(eventInfo){
				if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
					TAS.debug("caught " + eventInfo.sourceAttribute + ", event: " + eventInfo.sourceType);
					updateBuffTotalAsync(buff);
				}
			}));
		});
	});

	buffsPerRow.forEach(function(b){
		var prefix = "change:repeating_buff2:" + b ;
		on(prefix + "_macro-text", TAS.callback(function eventBuffMacroText(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " for column " + b + ", event: " + eventInfo.sourceType);
			SWUtils.evaluateAndSetNumber('repeating_buff2_'+b+'_macro-text', 'repeating_buff2_'+b+'_val',0,null,false);
		}));
		on(prefix + "_bonustype", TAS.callback(function PFBuffs_updateBuffbonustype(eventInfo) {
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff2_'+b+'_val','repeating_buff2_'+b+'-show','repeating_buff2_'+b+'_bonus','repeating_buff2_enable_toggle'],function(v){
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
					if (parseInt(v['repeating_buff2_'+b+'-show'],10) && parseInt(v['repeating_buff2_enable_toggle'],10) && 
							parseInt(v['repeating_buff2_'+b+'_val'],10) && v['repeating_buff2_'+b+'_bonus']) {
						updateBuffTotalAsync(v['repeating_buff2_'+b+'_bonus']);
					}
				});
			}
		}));
		on(prefix + "-show ", TAS.callback(function PFBuffs_updateBuffRowShowBuff(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff2_'+b+'_val','repeating_buff2_'+b+'_bonus','repeating_buff2_enable_toggle'],function(v){
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
					if (parseInt(v['repeating_buff2_enable_toggle'],10) && parseInt(v['repeating_buff2_'+b+'_val'],10) && 
							v['repeating_buff2_'+b+'_bonus']) {
						updateBuffTotalAsync(v['repeating_buff2_'+b+'_bonus']);
					}
				});
			}
		}));
		on(prefix + "_val" , TAS.callback(function PFBuffs_updateBuffRowShowBuff(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff2_'+b+'-show','repeating_buff2_'+b+'_bonus','repeating_buff2_enable_toggle'],function(v){
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
					if (parseInt(v['repeating_buff2_enable_toggle'],10) && parseInt(v['repeating_buff2_'+b+'-show'],10) &&
						v['repeating_buff2_'+b+'_bonus']) {
						updateBuffTotalAsync(v['repeating_buff2_'+b+'_bonus']);
					}
				});
			}
		}));
		on(prefix + "_bonus" , TAS.callback(function PFBuffs_updateBuffbonus(eventInfo) {
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff2_'+b+'_val','repeating_buff2_'+b+'_bonus','repeating_buff2_'+b+'_hide','repeating_buff2_enable_toggle'],function(v){
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
					var setter={};
					if (bonusesWithNoTypes.indexOf(v['repeating_buff2_'+b+'_bonus'])>=0){
						setter['repeating_buff2_'+b+'_hide']=1;
						SWUtils.setWrapper(setter,PFConst.silentParams);
					} else if(parseInt(v['repeating_buff2_'+b+'_hide'],10)===1){
						setter['repeating_buff2_'+b+'_hide']=0;
						SWUtils.setWrapper(setter,PFConst.silentParams);
					}
					if (parseInt(v['repeating_buff2_enable_toggle'],10) && parseInt(v['repeating_buff2_'+b+'_val'],10)) {
						updateAllBuffTotalsAsync(null,null,eventInfo);
					}
				});
			}
		}));
	});
	on('change:repeating_buff2:add_note_to_roll',TAS.callback(function PFBuffs_addnote(eventInfo){
		if (eventInfo.sourceType === "player" ){
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			addNoteAsync(null,eventInfo);
		}
	}));
	on('change:repeating_buff2:enable_toggle',TAS.callback(function PFBuffs_enabletoggle(eventInfo){
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			getAttrs(['repeating_buff2_b1_bonus','repeating_buff2_b2_bonus','repeating_buff2_b3_bonus',
				'repeating_buff2_b4_bonus','repeating_buff2_b5_bonus','repeating_buff2_b6_bonus',
				'repeating_buff2_b1-show','repeating_buff2_b2-show','repeating_buff2_b3-show',
				'repeating_buff2_b4-show','repeating_buff2_b5-show','repeating_buff2_b6-show',				
				'repeating_buff2_enable_toggle','repeating_buff2_tabcat2'],function(v){
				var setter={};
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
				buffsPerRow.forEach(function(b){
					if(v['repeating_buff2_'+b+'_bonus'] && parseInt(v['repeating_buff2_'+b+'-show'],10)){
						updateBuffTotalAsync(v['repeating_buff2_'+b+'_bonus']);
					}
				});
				addNoteAsync(null,eventInfo);
				setter['repeating_buff2_tabcat2']=v.repeating_buff2_enable_toggle||'0';
				SWUtils.setWrapper(setter,PFConst.silentParams);
			});
		}
	}));
	on("change:repeating_buff2:bufftype", TAS.callback(function eventBuff2Type(eventInfo){
		var setter={};
		if (eventInfo.sourceType === "player") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			getAttrs(['buffs_tab','repeating_buff2_bufftype','repeating_buff2_tabcat'],function(v){
				setter['buffs_tab'] = v.repeating_buff2_bufftype||'99';
				setter['repeating_buff2_tabcat']=v.repeating_buff2_bufftype||'-1';
				SWUtils.setWrapper(setter,PFConst.silentParams);
			});
		}
	}));	
	on("remove:repeating_buff2", TAS.callback(function PFBuffs_removeBuffRow(eventInfo) {
		TAS.debug("caught remove " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			updateAllBuffTotalsAsync(null,null,eventInfo);
		}
	}));

	//generic easy buff total updates
	_.each(events.buffTotalNonAbilityEvents, function (functions, col) {
		var eventToWatch = "change:buff_" + col + "-total";
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function event_updateBuffNonAbilityEvents(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
					methodToCall(col, eventInfo);
				}
			}));
		});
	});
	_.each(events.buffTotalAbilityEvents, function (functions, col) {
		var eventToWatch = "change:buff_" + col + "-total change:buff_" + col + "-total_penalty";
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function event_updateBuffAbilityEvents(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api") {
					methodToCall(col, eventInfo);
				}
			}));
		});
	});
	_.each(events.buffTotalEventsNoParam, function (functions, col) {
		var eventToWatch = "change:buff_" + col + "-total";
		_.each(functions, function (methodToCall) {
			on(eventToWatch, TAS.callback(function eventBuffTotalNoParam(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				if (eventInfo.sourceType === "sheetworker" || eventInfo.sourceType === "api" || eventInfo.sourceType === "api") {
					methodToCall(null,false, eventInfo);
				}
			}));
		});
	});
	on('change:merge_buffs_now', TAS.callback(function eventMergeBuffs(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player"){
			getAttrs(['merge_buffs_now'],function(v){
				if(parseInt(v.merge_buffs_now),10){
					mergeOldIntoNewBuffs();
				}
			});
		}
		
	}));
}
registerEventHandlers();
//PFConsole.log('   PFBuffs module loaded          ');
//PFLog.modulecount++;
