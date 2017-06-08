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

export var buffColumns2 = [
	'ac',	'armor',	'attack',	'casterlevel',	'cha',	'cha_skills',	'check',	'check_ability',	'check_skills',
	'cmb',	'cmd',	'con',	'con_skills',	'deflection',	'dex',	'dex_skills',	'dmg',	'dmg_melee',	'dmg_ranged',
	'dodge',	'flatfooted',	'fort',	'hptemp',	'initiative',	'int',	'int_skills',	'melee',	'natural',
	'ranged',	'ref',	'saves',	'shield',	'size',	'speed',	'str',	'str_skills',	'touch',
	'will',	'wis',	'wis_skills'],
buffToTot = {
	'ac':'AC',
	'armor':'armor',
	'attack':'attack',
	'casterlevel':'CasterLevel',
	'cha':'CHA',
	'cha_skills':'CHA_skills',
	'check':'Check',					//change
	'check_ability':'check_ability',
	'check_skills':'check_skills',
	'cmb':'CMB',
	'cmd':'CMD',
	'con':'CON',
	'con_skills':'CON_skills',
	'dex':'DEX',
	'dex_skills':'DEX_skills',
	'dmg':'DMG',			//change
	'dmg_melee':'dmg_melee',
	'dmg_ranged':'DMG_ranged',
	'flatfooted':'flat-footed',
	'hptemp':'HP-temp',
	'initiative':'Initiative',
	'int':'INT',
	'int_skills':'INT_skills',
	'melee':'Melee',
	'natural':'natural',
	'ranged':'Ranged',
	'saves':'saves',
	'shield':'shield',
	'size':'size',
	'speed':'speed',
	'str':'STR',
	'str_skills':'STR_skills',
	'touch':'Touch',
	'wis':'WIS',
	'wis_skills':'WIS_skills'},
otherCharBonuses2 ={
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
	//'natural':{'natural':'AC-natural'},only enhancement to natural this is not on sheet
	},
buffColumns = ['Ranged', 'Melee','CMB', 'DMG', 'DMG_ranged',
	"AC", "Touch", "CMD", "armor","shield","natural","flat-footed",
	"speed", "initiative","size","check_skills",
	"HP-temp", "Fort", "Will", "Ref", "Check", "CasterLevel",
	'STR','DEX','CON','INT','WIS','CHA',
	'STR_skills','DEX_skills','CON_skills','INT_skills','WIS_skills','CHA_skills',
	'deflection','dodge'],
bonusTypes =['untyped','alchemical','circumstance','competence','enhancement','inherent',
	'insight','luck','morale','profane','racial','resistance','sacred','size','trait',
	'deflection','dodge','natural',	'shield','armor'],
//ACCMD = ['untyped','circumstance','deflection','dodge','insight','luck','morale','profane','sacred'],
otherCharBonuses ={
	'STR':{'inherent':'STR-inherent','enhancement':'STR-enhance'},
	'DEX':{'inherent':'DEX-inherent','enhancement':'DEX-enhance'},
	'CON':{'inherent':'CON-inherent','enhancement':'CON-enhance'},
	'INT':{'inherent':'INT-inherent','enhancement':'INT-enhance'},
	'WIS':{'inherent':'WIS-inherent','enhancement':'WIS-enhance'},
	'CHA':{'inherent':'CHA-inherent','enhancement':'CHA-enhance'},
	'initiative':{'trait':'init-trait'},
	'Fort':{'resistance':'Fort-resist','trait':'Fort-trait'},
	'Ref':{'resistance':'Ref-resist','trait':'Ref-trait'},
	'Will':{'resistance':'Will-resist','trait':'Will-trait'},
	'armor':{'enhancement':'armor3-enhance','armor':'armor3-acbonus'},
	'shield':{'enhancement':'shield3-enhance','shield':'shield3-acbonus'},
	'natural':{'natural':'AC-natural'},
	'deflection':{'deflection':'AC-deflect'}
},
addThisToThat = {
	'ac':['cmd'],
	'attack':['melee','ranged','cmb'],
	'check':['check_skills','check_ability'],
	'dmg':['dmg_melee','dmg_ranged'],
	'saves':['fort','ref','will']
},
applyMaxThatToThis = {
	'melee':['attack'],
	'ranged':['attack'],
	'cmb':['attack'],
	'dmg_melee':['dmg'],
	'dmg_ranged':['dmg'],
	'cmd':['ac'],
	'flatfooted':['ac'],
	'fort':['saves'],
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
subtractThisFromThat = {
	'check_skills':['str_skills','dex_skills','con_skills','int_skills','wis_skills','cha_skills']	
},
relatedBuffs2=_.extend({},applyMaxThatToThis,addThisToThat),
armorcols2=['ac','touch','flatfooted','cmd'];

var buffsPerRow=['b1','b2','b3','b4','b5','b6'],
//these aways stack don't need to use max
stackingTypes =['untyped','circumstance','dodge','penalty'],
//these buff columns dont have bonus types they are technically bonus types to other fields (but size is special)
selfTypeOnly=['dodge','deflection','size'],
//these have only their own type (like selfTypeOnly) or 'enhancement'
selfTypeOrEnhance=['armor','shield','natural'],
//all total fields
buffTotFields = _.chain(buffColumns).map(function(buff){
		var isAbility = (PFAbilityScores.abilities.indexOf(buff) >= 0) && buff.indexOf('skill')<1;
		if (!isAbility){
			return ['buff_'+buff+'-total','buff_'+buff+'_exists'];
		} else {
			return ['buff_'+buff+'-total','buff_'+buff+'_exists','buff_'+buff+'-total_penalty', 'buff_'+buff+'_penalty_exists'];
		}
	}).flatten().value(),
//bonus types that are repeated elsewhere on the sheet
charBonusTypes = _.chain(otherCharBonuses).values().map(function(v){return _.keys(v);}).flatten().union().value().sort(),
charBonusTypes2 = _.chain(otherCharBonuses2).values().map(function(v){return _.keys(v);}).flatten().union().value().sort(),
buffsWithCharFields = Object.keys(otherCharBonuses).sort(),
buffsWithCharFields2 = Object.keys(otherCharBonuses2).sort(),
//character bonus/buff fields elsewhere on the sheet that stack with buffs
charBonusFields = _.chain(otherCharBonuses).values().map(function(v){return _.values(v);}).flatten().value().sort(),
charBonusFields2 = _.chain(otherCharBonuses2).values().map(function(v){return _.values(v);}).flatten().value().sort(),
buffRowAttrs2 = ['_b1-show','_b1_val','_b1_bonus','_b1_bonustype',
	'_b2-show','_b2_val','_b2_bonus','_b2_bonustype',
	'_b3-show','_b3_val','_b3_bonus','_b3_bonustype',
	'_b4-show','_b4_val','_b4_bonus','_b4_bonustype',
	'_b5-show','_b5_val','_b5_bonus','_b5_bonustype',
	'_b6-show','_b6_val','_b6_bonus','_b6_bonustype',
	'_enable_toggle'],
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
		"DMG_ranged": [PFAttacks.updateRepeatingWeaponDamages],
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
		"Check": [PFInitiative.updateInitiative],
		"check_skills": [PFSkills.recalculate],
		"initiative": [PFInitiative.updateInitiative],
		"speed": [PFEncumbrance.updateModifiedSpeed],
		"size": [PFSize.updateSizeAsync]
	}
};

export function clearBuffTotals(callback,silently){
	var done=function(){
		if(typeof callback === "function"){
			callback();
		}
	},
	fields;
	fields = SWUtils.cartesianAppend(['buff_'],buffColumns,['-total','_exists']);
	fields = fields.concat(SWUtils.cartesianAppend(['buff_'],PFAbilityScores.abilities,['-total_penalty','_penalty_exists']));
	//TAS.debug("PFBuffs.clearBuffTotals getting fields:",fields);
	getAttrs(fields,function(v){
		var setter={},params={};
		//TAS.debug("PFBuffs.clearBuffTotals we got back the following: ",v);
		setter = _.reduce(v,function(memo,val,attr){
			if ((/exists/).test(attr)){
				if (parseInt(val,10)){
					memo[attr]=0;
				}
			} else if (parseInt(val,10) || typeof val === "undefined"){
				memo[attr]=0;
			}
			return memo;
		},{});
		if (_.size(setter)){
			if(silently){
				params =PFConst.silentParams;
			}
			//TAS.debug("PFBuffs.clearBuffTotals, setting",setter);
			SWUtils.setWrapper(setter,params,done);
		} else {
			done();
		}
	});
}

/** Gets list of buffs from the buff rows for v2, so we don't have to keep looping through the ids.
 * @param {[string]} ids ids for list
 * @param {Map<string,string>} v 
 * @param {string} col  optional, buff to limit on
 * @returns {[{'bonus':string,'bonusType':string,'val':Number}]} array of entries from rows
 */
function assembleRows (ids,v,col){
	var	relatedBuffsL=[];
	if(col && relatedBuffs2[col] ){
		relatedBuffsL=relatedBuffs2[col];
	}
	TAS.debug("assembleRows for "+col);
	var rows = ids.reduce(function(m,id){
		var valArray,prefix='repeating_buff2_'+id+'_';
		try {
			valArray= buffsPerRow.reduce(function(im,n){
				var innerPrefix=prefix+n,
				bonusField=innerPrefix+'_bonus',vals={};
				try{
					//TAS.debug("assembleRows looking at "+ bonusField);
					if(v[innerPrefix+'-show']=='1'){ 
						if (!col || v[bonusField]===col || relatedBuffsL.indexOf(v[bonusField])>=0) {
							//vals={'bonus':col, 'bonusType':'untyped','val':0};
							vals.bonus=v[bonusField];
							vals.val = parseInt(v[innerPrefix+'_val'],10)||0;
							if (selfTypeOnly.indexOf(col)>=0){
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
				TAS.debug("assembleRows this row had these",valArray);
				m=m.concat(valArray);
			}
		} catch (erri3) {
			TAS.error("PFBuffs.assembleRows erri3:",erri3);
		} finally {
			return m;
		}
	},[]);
	TAS.debug("assembleRows returning with ",rows);
	return rows;
}

function updateBuffTotal2 (col,rows,v,setter){
	var isAbility=0,
	bonuses = {},
	sums={'sum':0,'pen':0},
	tempInt=0,
	totaldodge=0,
	totaldeflection=0, 
	totalcol='',
	columns=[col];
	try {
		setter = setter || {};
		isAbility=(PFAbilityScores.abilities.indexOf(col) >= 0) && col.indexOf('skill')<9;
		if (!isAbility && relatedBuffs2[col]){
			columns=columns.concat(relatedBuffs2[col]);
		}
		rows = rows.filter(function(row){
			if(columns.indexOf(row.bonus)>=0){
				return 1;
			}
			return 0;
		});
		if (rows && _.size(rows)){
			TAS.debug("PFBUFFS ROWS NOW:",rows);
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
					if (row.val<0){
						m.penalty = (m.penalty||0) + row.val;
					} else if(stackingTypes.includes(row.bonusType) ) {
						m[row.bonusType] = (m[row.bonusType]||0) + row.val;
					} else {
						m[row.bonusType] = Math.max((m[row.bonusType]||0),row.val);
					}
					return m;
				},{});

				TAS.debug("PFBUFFS BONUSES for "+ col+" NOW:",bonuses);

				//look at bonuses on rest of sheet to see if they overlap and don't stack:
				_.each(otherCharBonuses2[col],function(charField,bonusType){
					if(bonuses[bonusType]){
						tempInt = parseInt(v[charField],10)||0;
						if(bonuses[bonusType] <= tempInt){
							bonuses[bonusType]=0;
						} else {
							bonuses[bonusType] -= tempInt;
						}
					}
				});
				
				TAS.debug("PFBUFFS FINAL BONUSES for "+ col+":",bonuses);
				if (isAbility){
					try {
						sums.pen = bonuses.penalty||0;
					} catch (er2){}
					bonuses.penalty=0;
				}

				if(armorcols2.indexOf(col)<0){
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
					if(col==='ac'){
						//ignore dodge and deflect for any other than ac
						if(totaldodge){
							setter['buff_dodge-total']=totaldodge;
						}
						if(totaldeflection){
							setter['buff_deflection-total']=totaldodge;
						}
					}
				}
			}
		}
		TAS.debug("PFBUFFS NOW totals are: ",sums);
		totalcol=buffToTot[col];
		if ( (parseInt(v['buff_'+totalcol+'-total'],10)||0)!==sums.sum){
			setter['buff_'+totalcol+'-total']=sums.sum;
		}
		if (sums.sum > 0){
			setter['buff_'+totalcol+'_exists']=1;
		} else if ((parseInt(v['buff_'+totalcol+'_exists'],10)||0)===1){
			setter['buff_'+totalcol+'_exists']=0;
		}
		if (isAbility){
			if ( (parseInt(v['buff_'+totalcol+'-total_penalty'],10)||0)!==sums.pen){
				setter['buff_'+totalcol+'-total_penalty']=sums.pen;
			}
			if (sums.pen){
				setter['buff_'+totalcol+'_penalty_exists']=1;
			} else if ((parseInt(v['buff_'+totalcol+'_penalty_exists'],10)||0)===1){
				setter['buff_'+totalcol+'_penalty_exists']=0;
			}
		}
	} catch(err){
		TAS.error("PFBuffs.updateBuffTotal",err);
	} finally {
		return setter;
	}
}

export var updateBuffTotalAsync2  = TAS.callback(function callupdateBuffTotalAsync2(col, callback,silently){
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
			fields = SWUtils.cartesianAppend(['repeating_buff2_'],ids,buffRowAttrs2);
			//columns = concat(addThisToThat[col]||[]).concat(applyMaxThatToThis[col]||[]);
			columnsToGet=[col];
			columnsToUpdate=[col];
			if(addThisToThat[col]){
				columnsToGet=columnsToGet.concat(addThisToThat[col]);
				columnsToUpdate=columnsToUpdate.concat(addThisToThat[col]);
			}
			if(applyMaxThatToThis[col]){
				columnsToGet = columnsToGet.concat(applyMaxThatToThis[col]);
			}

			totals = columnsToUpdate.map(function(b){return buffToTot[b];});

			totfields = totals.map(function(t){return 'buff_'+t+'-total'}).concat(
				totals.map(function(t){return 'buff_'+t+'_exists'}));
			if (isAbility){
				totfields = totfields.concat(['buff_'+buffToTot[col]+'-total_penalty', 'buff_'+buffToTot[col]+'_penalty_exists']);
			}
			fields = fields.concat(totfields);
			//fields.push('use_buff_bonuses');

			otherfields = columnsToGet.reduce(function(m,c){
				if (otherCharBonuses[c]){
					m=m.concat(otherCharBonuses[c]);
				}
				return m;
			},[]);
			if(_.size(otherfields)){
				fields = fields.concat(otherfields);
			}
			
			TAS.debug("updateBuffTotalAsync2 fields ",fields,'#######################################');
			getAttrs(fields,function(v){
				var rows,params={}, setter={};
				try {
					TAS.debug("PFBuffs.totals for "+ col+" v is",v);
					//don't need to put this in different loop but do it for future since when we move to multi column at once will need.
					ids = ids.filter(function(id){
						return (parseInt(v['repeating_buff2_'+id+'_enable_toggle'],10)||0);
					});
					if(_.size(ids)){
						TAS.debug("getting rows");
						rows = assembleRows(ids,v,col);
						TAS.debug("after assembling rows we have ",rows);
						setter = columnsToUpdate.reduce(function(m,c){
							TAS.debug("now calling updatebufftotal on "+c);
							return updateBuffTotal2(c,rows,v,m);
						},{});
					} else {
						TAS.debug("there are no rows!");
						//all have 0!
						clearBuffTotals();
					}
				} catch (errou){
					TAS.error("PFBuffs.updateBuffTotalAsync errrou on col "+col,errou);
				} finally {
					if (_.size(setter)){
						TAS.debug("######################","PFBuffs setting ",setter);
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
});


export var updateAllBuffTotalsAsync2 = TAS.callback(function callupdateAllBuffTotalsAsync2(callback,silently,eventInfo){
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
		fields = SWUtils.cartesianAppend(['repeating_buff2_'],ids,buffRowAttrs2);
		fields = fields.concat(buffTotFields);
		fields = fields.concat(charBonusFields2);
		TAS.debug("############ updateAllBuffTotalsAsync2 BUFF FIELDS ARE:", fields);
		
		getAttrs(fields,function(v){
			var rows=[], params={}, setter={};
			try {
				TAS.debug("PFBuffs.updateAllBuffTotalsAsync2 v is",v);
				ids = ids.filter(function(id){
					return (parseInt(v['repeating_buff2_'+id+'_enable_toggle'],10)||0);
				});
				if(!ids || _.size(ids)===0){
					clearBuffTotals(done,silently);
					return;
				}
				TAS.debug("getting rows");
				rows = assembleRows(ids,v);
				TAS.debug("after assembling rows we have ",rows);
				_.each(buffColumns2,function(col){
					setter=updateBuffTotal2(col,rows,v,setter);
				});
			} catch (errou){
				TAS.error("PFBuffs.updateAllBuffTotalsAsync2 errrou on col ",errou);
			} finally {
				if (_.size(setter)){
					TAS.debug("######################","PFBuffs.updateAllBuffTotalsAsync2 setting ",setter);
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
});

function updateBuffTotal (col,ids,v,setter,useBonuses){
	var isAbility=0,
	bonuses = {},
	sums={'sum':0,'pen':0},
	tempInt=0,
	rows=[];
	try {
		setter = setter || {};
		isAbility=(PFAbilityScores.abilities.indexOf(col) >= 0) && col.indexOf('skill')<9;
		//TAS.debug("PFBuffs.totals for "+ col+" v is",v);
		//don't need to put this in different loop but do it for future since when we move to multi column at once will need.

		//TAS.debug("PFBuffs ids are now ",ids);
		ids = ids.filter(function(id){
				var prefix = 'repeating_buff_'+id+'_buff-';
				return  (parseInt(v[prefix + col + '-show'],10)||0) && (parseInt(v[prefix+col],10)||0);
			});
		//TAS.debug("PFBuffs there are "+ _.size(ids)+" ids which are ",ids);
		if(_.size(ids)>0){
			if (!useBonuses){
				rows = ids.map(function(id){
					var vals={val:0},prefix='';
					try {
						prefix='repeating_buff_'+id+'_buff-'+col;
						vals.val = parseInt(v[prefix],10);
					} catch (er){
					} finally {
						return vals;
					}
				});
			} else {
				rows = ids.map(function(id){
					var vals={'bonusType':'untyped',val:0},prefix='';
					prefix='repeating_buff_'+id+'_buff-'+col;
					try {
						vals.val = parseInt(v[prefix],10)||0;
						if (selfTypeOnly.indexOf(col)>=0){
							vals.bonusType=col;
						} else if (selfTypeOrEnhance.indexOf(col)>=0){
							vals.bonusType = v[prefix+'_type']||col;
						} else {
							vals.bonusType = v[prefix+'_type']||'untyped';
						}
					} catch (erri3){
						TAS.error("PFBuffs.updateTtotals erri3:",erri3);
					}finally {
						return vals;
					}
				});
			}
			//TAS.debug("PFBUFFS ROWS NOW:",rows);
			if(col==='HP-temp'){
				sums.sum = rows.filter(function(row){
					return row.val>0;
				}).reduce(function(m,row){
					m+=row.val;
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
			} else if (useBonuses) {
				bonuses = {
					'alchemical':0,'circumstance':0,'competence':0,'deflection':0,
					'enhancement':0,'equivalent':0,'inherent':0,'insight':0,'luck':0,
					'morale':0,'penalty': 0,'profane':0,'racial':0,'resistance':0,'sacred':0,
					'size':0,'trait':0,'untyped':0,'natural':0,'armor':0,'shield':0,'dodge':0};
				bonuses = rows.reduce(function(m,row){
					if (row.val<0){
						m.penalty += row.val;
					}else if(stackingTypes.includes(row.bonusType) ) {
						m[row.bonusType] += row.val;
					} else{
						m[row.bonusType] = Math.max(m[row.bonusType],row.val);
					}
					return m;
				},bonuses);

				bonuses = _.omit(bonuses,function(val,bonusType){
					if ((!val || val === 0) && bonusType !== 'penalty'){
						return 1;
					}
					return 0;
				});
				//TAS.debug("PFBUFFS BONUSES NOW:",bonuses);
				//look at bonuses on rest of sheet to see if they overlap and don't stack:
				if (otherCharBonuses[col]){
					bonuses = _.mapObject(bonuses,function(val,bonusType){
						var retval=val;
						try{
							if(charBonusTypes.indexOf(bonusType) && otherCharBonuses[col][bonusType]){
								tempInt = parseInt(v[otherCharBonuses[col][bonusType]],10)||0;
								//TAS.debug("looking at "+bonusType+" buff  to "+col+" of "+val+", already existing modifier "+ tempInt+" at "+otherCharBonuses[col][bonusType] );
								if(tempInt>0){
									if (val<= tempInt){
										retval=0;
									}else {
										retval-=tempInt;
									}
								}		
							}
						} catch (erri2){
							TAS.error("error finding other related value on sheet for "+ bonusType+" buff to "+col,erri2);
						} finally {
							return retval;
						}
					});
				}
				//TAS.debug("PFBUFFS FINAL BONUSES:",bonuses);
				if (isAbility){
					try {
						sums.pen = bonuses.penalty||0;
					} catch (er2){}
					bonuses.penalty=0;
				}
				sums.sum = _.reduce(bonuses,function(m,bonus,bonusType){
					m+=bonus;
					return m;
				},0);
			} else if (isAbility) {
				sums = rows.reduce(function(m,row){
					if (row.val<0){
						m.pen += row.val;
					} else{
						m.sum += row.val;
					}
					return m;
				},sums);
			} else {
				sums.sum = rows.reduce(function(m,row){
					m += row.val;
					return m;
				},0);
			}
		}
		//TAS.debug("PFBUFFS NOW totals are: ",sums);
		if ( (parseInt(v['buff_'+col+'-total'],10)||0)!==sums.sum){
			setter['buff_'+col+'-total']=sums.sum;
		}
		if (sums.sum > 0){
			setter['buff_'+col+'_exists']=1;
		} else if ((parseInt(v['buff_'+col+'_exists'],10)||0)===1){
			setter['buff_'+col+'_exists']=0;
		}
		if (isAbility){
			if ( (parseInt(v['buff_'+col+'-total_penalty'],10)||0)!==sums.pen){
				setter['buff_'+col+'-total_penalty']=sums.pen;
			}
			if (sums.pen){
				setter['buff_'+col+'_penalty_exists']=1;
			} else if ((parseInt(v['buff_'+col+'_penalty_exists'],10)||0)===1){
				setter['buff_'+col+'_penalty_exists']=0;
			}
		}
	} catch(err){
		TAS.error("PFBuffs.updateBuffTotal",err);
	} finally {
		return setter;
	}
}

export function updateBuffTotalAsync (col, callback,silently){
	var done = _.once(function () {
		//TAS.debug("leaving PFBuffs.updateBuffTotalAsync for "+col);
		if (typeof callback === "function") {
			callback();
		}
	}),	
	isAbility = (PFAbilityScores.abilities.indexOf(col) >= 0) && col.indexOf('skill')<9;

	getSectionIDs('repeating_buff',function(ids){
		var fields,totfields,otherfields;
		if(ids){
			fields = SWUtils.cartesianAppend(['repeating_buff_'],ids,['_buff-'+col,'_buff-'+col+'-show','_buff-enable_toggle','_buff-'+col+'_type']);
			totfields = ['buff_'+col+'-total', 'buff_'+col+'_exists'];
			if (isAbility){
				totfields = totfields.concat(['buff_'+col+'-total_penalty', 'buff_'+col+'_penalty_exists']);
			}
			fields = fields.concat(totfields);
			fields.push('use_buff_bonuses');
			if (otherCharBonuses[col]){
				otherfields= _.reduce(otherCharBonuses[col],function(m,field,bonusType){
					m.push(field);
					return m;
				},[]);
				if(_.size(otherfields)){
					fields = fields.concat(otherfields);
				}
			}

			getAttrs(fields,function(v){
				var useBonuses=false,
				bonuses = {},
				params={}, setter={};
				try {
					//TAS.debug("PFBuffs.totals for "+ col+" v is",v);
					useBonuses=parseInt(v.use_buff_bonuses,10)||0;
					//don't need to put this in different loop but do it for future since when we move to multi column at once will need.
					ids = ids.filter(function(id){
						var prefix = 'repeating_buff_'+id+'_buff-';
						return  (parseInt(v[prefix+'enable_toggle'],10)||0);
					});
					setter = updateBuffTotal(col,ids,v,setter,useBonuses);
				} catch (errou){
					TAS.error("PFBuffs.updateBuffTotalAsync errrou on col "+col,errou);
				} finally {
					if (_.size(setter)){
						//TAS.debug("######################","PFBuffs setting ",setter);
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
			done();
		}
	});	
}

export function updateAllBuffTotalsAsync (callback,silently){
	var done = _.once(function () {
		//TAS.debug("leaving PFBuffs.updateBuffTotalAsync for "+col);
		if (typeof callback === "function") {
			callback();
		}
	});

	getSectionIDs('repeating_buff',function(ids){
		var fields,buffRepFields;
		if(!ids || _.size(ids)===0){
			clearBuffTotals(done,silently);
			return;
		}
		buffRepFields = buffColumns.map(function(buff){return '_buff-'+buff;});
		buffRepFields = buffRepFields.concat(SWUtils.cartesianAppend(['_buff-'],buffColumns,['-show','_type']));
		fields = SWUtils.cartesianAppend(['repeating_buff_'],ids,buffRepFields);
		fields = fields.concat(buffTotFields);
		fields = fields.concat(charBonusFields);
		fields.push('use_buff_bonuses');
		TAS.debug("############ BUFF FIELDS ARE:", fields);
		
		getAttrs(fields,function(v){
			var useBonuses=false,
			bonuses = {},
			params={}, setter={};
			try {
				//TAS.debug("PFBuffs.updateAllBuffTotalsAsync found:",v);
				useBonuses=parseInt(v.use_buff_bonuses,10)||0;
				ids = ids.filter(function(id){
					return parseInt(v['repeating_buff_'+id+'_buff-enable_toggle'],10);
				});
				if(!ids || _.size(ids)===0){
					clearBuffTotals(done,silently);
					return;
				}				
				_.each(buffColumns,function(col){
					setter=updateBuffTotal(col,ids,v,setter,useBonuses);
				});
			} catch (errou){
				TAS.error("PFBuffs.updateAllBuffTotalsAsync errrou on col ",errou);
			} finally {
				if (_.size(setter)){
					TAS.debug("######################","PFBuffs setting ",setter);
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

export function migrate (outerCallback) {
	var done = _.once(function () {
		//TAS.debug("leaving PFBuffs.migrate");
		if (typeof outerCallback === "function") {
			outerCallback();
		}
	}),
	//if DMG has values and DMG_ranged does not, copy to DMG_ranged
	//if Check has value but check_skills does not, copy to check_skills
	migrateMeleeAndAbilityChecks = function(callback){
		var done= _.once(function(){
			if (typeof callback==="function"){
				callback();
			}
		}),
		migrated = function(){
			SWUtils.setWrapper({'migrated_buffs_rangeddmg_abiilty':1},PFConst.silentParams,done);
		};
		getAttrs(['migrated_buffs_rangeddmg_abiilty'],function(vout){
			var wasmigrated=parseInt(vout.migrated_buffs_rangeddmg_abiilty,10)||0;
			if (!wasmigrated){
				getSectionIDs('repeating_buff',function(ids){
					var fields;
					if (_.size(ids)){
						fields = SWUtils.cartesianAppend(['repeating_buff_'],ids,
							['_buff-DMG_macro-text','_buff-DMG','_buff-DMG-show','_buff-DMG_ranged_macro-text','_buff-DMG_ranged',
							'_buff-Melee_macro-text','_buff-Melee','_buff-Melee-show','_buff-CMB_macro-text','_buff-CMB_ranged',
							'_buff-Check_macro-text','_buff-Check','_buff-Check-show','_buff-check_skills_macro-text','_buff-check_skills']);
						fields = fields.concat(['buff_Check-total','buff_check_skills-total','buff_Melee-total','buff_DMG-total','buff_DMG_ranged-total','buff-CMB-total']);
						getAttrs(fields,function(v){
							var setter={},resetconditions=false,tempInt=0;
							try {
								//TAS.debug("###########","PFBuffs.migrate found ",v);
								ids.forEach(function(id){
									var prefix = 'repeating_buff_'+id+'_buff-';
									//TAS.debug("at id "+id);
									if(v[prefix+'DMG_macro-text']&&!v[prefix+'DMG_ranged_macro-text']){
										setter[prefix+'DMG_ranged_macro-text']=v[prefix+'DMG_macro-text'];
										setter[prefix+'DMG_ranged']=parseInt(v[prefix+'DMG'],10)||0;
										if (parseInt(v[prefix+'DMG-show'],10)){
											setter[prefix+'DMG_ranged-show']=1;
										}									
									}
									if(v[prefix+'Check_macro-text']&&!v[prefix+'check_skills_macro-text']){
										setter[prefix+'check_skills_macro-text']=v[prefix+'Check_macro-text'];
										setter[prefix+'check_skills']=parseInt(v[prefix+'Check'],10)||0;
										resetconditions=true;
										if (parseInt(v[prefix+'Check-show'],10)){
											setter[prefix+'check_skills-show']=1;
										}
									}
									if(v[prefix+'Melee_macro-text']&&!v[prefix+'CMB_macro-text']){
										setter[prefix+'CMB_macro-text']=v[prefix+'Melee_macro-text'];
										setter[prefix+'CMB']=parseInt(v[prefix+'Melee'],10)||0;
										resetconditions=true;
										if (parseInt(v[prefix+'Melee-show'],10)){
											setter[prefix+'CMB-show']=1;
										}
									}
								});
								tempInt = parseInt(v['buff_DMG-total'],10)||0;
								if(tempInt){
									setter['buff_DMG_ranged-total']=tempInt + parseInt(v['buff_DMG_ranged-total'],10)||0;
								}
								tempInt = parseInt(v['buff_Check-total'],10)||0;
								if (tempInt){
									setter['buff_check_skills-total']=tempInt+ parseInt(v['buff_check_skills-total'],10)||0;
								}
								tempInt = parseInt(v['buff_Melee-total'],10)||0;
								if (tempInt){
									setter['buff_CMB-total']=tempInt+ parseInt(v['buff_CMB-total'],10)||0;
								}
							}catch (err){
								TAS.error("PFBuffs.migrateDmgAbility",err);
							}finally {
								if (_.size(setter)){
									//TAS.debug("###########","PFBuffs migrate setting ",setter);
									SWUtils.setWrapper(setter,PFConst.silentParams,migrated);
									if(resetconditions){
										PFChecks.applyConditions();
										PFInitiative.updateInitiative();
									}
								} else {
									migrated();
								}
							}
						});
					} else{
						migrated();
					}
				});
			} else {
				done();
				return;
			}
		});
	};
	migrateMeleeAndAbilityChecks(done);
	getAttrs(["migrated_buffs", "migrated_effects"], function (v) {
		var setter = {};
		try {
			if (parseInt(v.migrated_buffs,10)!==1) {
				setter.migrated_buffs = 1;
			}
			if (parseInt(v.migrated_effects,10)!==1) {
				setter.migrated_effects = 1;
			}
		} catch (err) {
			TAS.error("PFBuffs.migrate", err);
		} finally {
			if (_.size(setter) > 0) {
				SWUtils.setWrapper(setter, PFConst.silentParams);
			}
		}
	});
}

/**Sets 1 or 0 for buffexists in status panel - only called by updateBuffTotalAsync. 
 * @param {function} callback 
 */
function resetStatuspanel (callback) {
	var done = _.once(function () { if (typeof callback === "function") { callback(); } }),
	 fields;

	try {
		fields = SWUtils.cartesianAppend(["buff_"], buffColumns, ["-total", "_exists"]).concat(
			SWUtils.cartesianAppend(["buff_"], PFAbilityScores.abilities, [ "-total_penalty",  "_penalty_exists"])
		);
	} catch (errO) {
		TAS.error("PFBuffs.resetStatuspanel error creating field array, abort:", errO);
		done();
		return;
	}
	getAttrs(fields, function (v) {
		var setter = {},
		getExists= function(pre,post){
			var val,exists;
			post=post||'';
			val = parseInt(v[pre + "-total"+post], 10) || 0; 
			exists = parseInt(v[pre +post+ "_exists"], 10) || 0;
			if (val !== 0 && !exists) {
				return 1;
			} else if (val === 0 && exists) {
				return 0;
			} 
		};
		try {
			setter = _.reduce(buffColumns, function (memo, col) {
				var pre,v;
				try {
					pre="buff_" + col;
					v=getExists(pre,'');
					if (v || v===0){
						memo[pre+'_exists']=v;
					}
				} catch (erri1) { } finally {
					return memo;
				}
			}, setter);
			setter = _.reduce(PFAbilityScores.abilities, function (memo, col) {
				var pre,v;
				try {
					pre="buff_" + col;
					v=getExists(pre,'_penalty');
					if (v || v===0){
						memo[pre+'_penalty_exists']=v;
					}
				} catch (erri1) { } finally {
					return memo;
				}
			}, setter);
		} catch (err) {
			TAS.error("PFBuffs.resetStatuspanel error inside calculate exists", err);
		} finally {
			if (_.size(setter) > 0) {
				SWUtils.setWrapper(setter, { silent: true }, done);
			} else {
				done();
			}
		}
	});
}

function setBuff (id, col, callback, silently) {
	var done = function () {
		if (typeof callback === "function") {
			callback();
		}
	},
	idStr = SWUtils.getRepeatingIDStr(id),
	prefix = "repeating_buff_" + idStr + "buff-" + col;
	if(col==='size'){
		done();
		return;
	}
	SWUtils.evaluateAndSetNumber(prefix + "_macro-text", prefix,0,
		function(a,b,c){
			if (c){
				updateBuffTotalAsync(col,done,silently);
			} else {
				done();
			}
		},true,done);
}


export var recalculate = TAS.callback(function callrecalculate(callback, silently, oldversion) {
	var done = _.once(function () {
		resetStatuspanel();
		//TAS.debug("leaving PFBuffs.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	}),
	numColumns = _.size(buffColumns),
	columnDone = _.after(numColumns, done),
	recalculateBuffColumn = function (ids, col) {
		var rowtotal = _.size(ids),
			totalItUp = _.once(function () {
				updateBuffTotalAsync(col, columnDone,silently);
			}),
			rowDone;
		if (col==='size'){
			totalItUp();
			return;
		}
		rowDone = _.after(rowtotal, function () {
			totalItUp();
		});
		try {
			if(col==='size'){
				totalItUp();
				return;
			}
			_.each(ids, function (id) {
				try {
					getAttrs(['repeating_buff_'+id+'_buff-enable_toggle',
					'repeating_buff_'+id+'_buff-' + col + '-show'],function(v){
						if (parseInt(v['repeating_buff_'+id+'_buff-enable_toggle'],10) && 
							parseInt(v['repeating_buff_'+id+'_buff-' + col + '-show'],10) ) {
								//setBuff(id, col, rowDone, silently);
								SWUtils.evaluateAndSetNumber('repeating_buff_'+id+'_buff-' + col + "_macro-text", 'repeating_buff_'+id+'_buff-' + col,0,rowDone,true);
						} else {
							rowDone();
						}
					});
				} catch (err) {
					TAS.error("PFBuffs.recalculate_recalculateBuffColumn:" + col + ", rowid" + id, err);
					rowDone();
				}
			});
		} catch (err2) {
			TAS.error("PFBuffs.recalculate_recalculateBuffColumn OUTER error:" + col, err2);
			totalItUp();
		}
	},
	recalculateAll = function(){
		getSectionIDs("repeating_buff", function (ids) {
			//TAS.debug("pfbuffsrecalculate there are " + _.size(ids) + " rows and " + numColumns + " columns");
			try {
				if (_.size(ids) > 0) {
					_.each(buffColumns, function (col) {
						recalculateBuffColumn(ids, col);
					});
				} else {
					clearBuffTotals(done);
				}
			} catch (err) {
				TAS.error("PFBuffs.recalculate.recalculateAll", err);
				//what to do? just quit
				done();
			}
		});
	},
	recalculateItAll=function(){
		updateAllBuffTotalsAsync2(done,true);
		//recalculateAll();
		//updateAllBuffTotalsAsync(done);
	};
	migrate(recalculateItAll);
});
function registerEventHandlers () {
	buffsPerRow.forEach(function(b){
		var prefix = "change:repeating_buff2:" + b ;
		on(prefix + "_macro-text", TAS.callback(function eventBuffMacroText(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " for column " + b + ", event: " + eventInfo.sourceType);
			SWUtils.evaluateAndSetNumber('repeating_buff2_'+b+'_macro-text', 'repeating_buff2_'+b+'_val',0);
		}));
		on(prefix + "_bonustype", TAS.callback(function PFBuffs_updateBuffbonustype(eventInfo) {
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff2_'+b+'_val','repeating_buff2_'+b+'-show','repeating_buff2_'+b+'_bonus','repeating_buff2_enable_toggle'],function(v){
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
					if (parseInt(v['repeating_buff2_'+b+'show'],10) && parseInt(v['repeating_buff2_enable_toggle'],10) && 
							parseInt(v['repeating_buff2_'+b+'_val'],10) && v['repeating_buff2_'+b+'_bonus']) {
						updateBuffTotalAsync2(v['repeating_buff2_'+b+'_bonus']);
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
						updateBuffTotalAsync2(v['repeating_buff2_'+b+'_bonus']);
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
						updateBuffTotalAsync2(v['repeating_buff2_'+b+'_bonus']);
					}
				});
			}
		}));
		on(prefix + "_bonus" , TAS.callback(function PFBuffs_updateBuffbonus(eventInfo) {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff2_'+b+'_val','repeating_buff2_'+b+'_bonus','repeating_buff2_enable_toggle'],function(v){
					TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType,v);
					if (parseInt(v['repeating_buff2_enable_toggle'],10) && parseInt(v['repeating_buff2_'+b+'_val'],10)) {
						updateAllBuffTotalsAsync2(null,null,eventInfo);
					}
				});
			}
		}));
	});
	on('change:repeating_buff2:enable_toggle',TAS.callback(function PFBuffs_enabletoggle(eventInfo){
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			updateAllBuffTotalsAsync2(null,null,eventInfo);
		}
	}));
	on("remove:repeating_buff2", TAS.callback(function PFBuffs_removeBuffRow(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			updateAllBuffTotalsAsync2(null,null,eventInfo);
		}
	}));	
	/*
	//BUFFS
	_.each(buffColumns, function (col) {
		//Evaluate macro text upon change
		var prefix = "change:repeating_buff:buff-" + col ;
		if (col!=='size'){
			on(prefix + "_macro-text", TAS.callback(function eventBuffMacroText(eventInfo) {
				TAS.debug("caught " + eventInfo.sourceAttribute + " for column " + col + ", event: " + eventInfo.sourceType);
				setBuff(null, col);
			}));
		}
		on(prefix + "-show", TAS.callback(function PFBuffs_updateBuffRowShowBuff(eventInfo) {
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
				TAS.debug("we updated "+col+"!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
				getAttrs(['repeating_buff_buff-'+col,'repeating_buff_buff-enable_toggle'],function(v){
					if (parseInt(v['repeating_buff_buff-enable_toggle'],10) && parseInt(v['repeating_buff_buff-'+col],10) ) {
						TAS.debug("Show or don't show update "+col);
						updateBuffTotalAsync(col);
					}
				});
			}
		}));
	});
	//size is special users modify it via dropdown - no macro
	on("change:repeating_buff:buff-size", TAS.callback(function PFBuffs_updateBuffSize(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateBuffTotalAsync('size');
		}
	}));
	on("remove:repeating_buff", TAS.callback(function PFBuffs_removeBuffRow(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			updateAllBuffTotalsAsync();
		}
	}));
	on("change:repeating_buff:buff-enable_toggle", TAS.callback(function PFBuffs_enableBuffRow(eventInfo) {
		var fields;
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			fields = buffColumns.map(function(col){return 'repeating_buff_buff-'+col;});
			fields = fields.concat(fields.map(function(row){return row+'-show';}));
			getAttrs(fields,function(v){
				_.each(buffColumns, function (col) {
					if( parseInt(v['repeating_buff_buff-'+col+'-show'],10) && parseInt(v['repeating_buff_buff-'+col],10)){
						updateBuffTotalAsync(col);
					}
				});
			});
		}
	}));
	*/
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
}
registerEventHandlers();
PFConsole.log('   PFBuffs module loaded          ');
PFLog.modulecount++;
