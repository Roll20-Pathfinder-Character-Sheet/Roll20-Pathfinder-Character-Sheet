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

export var buffColumns = ['Ranged', 'Melee','CMB', 'DMG', 'DMG_ranged',
	"AC", "Touch", "CMD", "armor","shield","natural","flat-footed",
	"speed", "initiative","size","check_skills",
	"HP-temp", "Fort", "Will", "Ref", "Check", "CasterLevel",
	'STR','DEX','CON','INT','WIS','CHA',
	'STR_skills','DEX_skills','CON_skills','INT_skills','WIS_skills','CHA_skills',
	'deflection','dodge'],
bonusTypes =['untyped','alchemical','circumstance','competence','enhancement','inherent',
	'deflection','dodge','armor','natural','shield',
	'insight','luck','morale','profane','racial','resistance','sacred','size','trait'],
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
};


	//these aways stack don't need to use max
var stackingTypes =['untyped','circumstance','dodge','penalty'],
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
//bonus types that are repated elsewhere on the sheet
charBonusTypes = _.chain(otherCharBonuses).values().map(function(v){return _.keys(v);}).flatten().union().value(),
//character bonus/buff fields elsewhere on the sheet that stack with buffs
charBonusFields = _.chain(otherCharBonuses).values().map(function(v){return _.values(v);}).flatten().value(),
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
		"DMG": [PFAttackGrid.updateRepeatingWeaponDamages],
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
			getAttrs(setter,params,done);
		} else {
			done();
		}
	});
}
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
		if(_.size(ids)===0){
			return setter;
		}
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
				'ability':0,'alchemical':0,'circumstance':0,'competence':0,
				'deflection':0,'enhancement':0,'equivalent':0,'inherent':0,
				'insight':0,'luck':0,'morale':0,'penalty': 0,'profane':0,'racial':0,'sacred':0,
				'size':0,'trait':0,'untyped':0,'natural':0,'armor':0,'shield':0,'dodge':0};
			//bonuses = {};
			
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

export function updateBuffTotalsAsync (callback,silently){
	var done = _.once(function () {
		//TAS.debug("leaving PFBuffs.updateBuffTotalAsync for "+col);
		if (typeof callback === "function") {
			callback();
		}
	})

	getSectionIDs('repeating_buff',function(ids){
		var fields,buffRepFields;
		if(!ids || _.size(ids)===0){
			clearBuffTotals(done);
			return;
		}
		buffRepFields = buffColumns.map(function(buff){return '_buff-'+buff;});
		buffRepFields = buffRepFields.concat(SWUtils.cartesianAppend(['_buff-'],buffColumns,['-show','_type']));
		fields = SWUtils.cartesianAppend(['repeating_buff_'],ids,buffRepFields);
		fields = fields.concat(buffTotFields);
		fields = fields.concat(charBonusFields);
		fields.push('use_buff_bonuses');
		//TAS.debug("############ BUFF FIELDS ARE:", fields);
		
		getAttrs(fields,function(v){
			var useBonuses=false,
			bonuses = {},
			params={}, setter={};
			try {
				//TAS.debug("PFBuffs.updateBuffTotalsAsync found:",v);
				useBonuses=parseInt(v.use_buff_bonuses,10)||0;
				ids = ids.filter(function(id){
					var prefix = 'repeating_buff_'+id+'_buff-';
					return  (parseInt(v[prefix+'enable_toggle'],10)||0);
				});
				_.each(buffColumns,function(col){
					updateBuffTotal(col,ids,v,setter,useBonuses);
				});
				
			} catch (errou){
				TAS.error("PFBuffs.updateBuffTotalAsync errrou on col ",errou);
			} finally {
				if (_.size(setter)){
					//TAS.debug("######################","PFBuffs setting ",setter);
					if (silently){
						params = PFConst.silentParams;
					}
					getAttrs(setter,params,done);
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
/** createTotalBuffEntry - used by parseNPC
 * adds enabled buff for a new sheet where this is the only buff so sets total as well.
 * adds attributes to array passed in
 * @param {string} name name of buff row  for buff-name
 * @param {string} bufftype  -string from buffColumns
 * @param {string} buffmacro ?
 * @param {number} modamount - value for the buff
 * @param {map} newRowAttrs - object of {name:value} to pass to SWUtils.setWrapper
 * @returns {map} return newRowAttrs after adding maps to it.
 */
export function createTotalBuffEntry (name, bufftype, buffmacro, modamount, newRowAttrs) {
	var newRowId = generateRowID();
	newRowAttrs = newRowAttrs||{};
	newRowAttrs["repeating_buff_" + newRowId + "_buff-name"] = name;
	newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype + "_macro-text"] = buffmacro;
	newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype] = modamount;
	newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype + "-show"] = "1";
	newRowAttrs["repeating_buff_" + newRowId + "_buff-enable_toggle"] = "1";
	newRowAttrs["buff_" + bufftype + "-total"] = modamount;
	return newRowAttrs;
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
		updateBuffTotalsAsync(done);
	};
	migrate(recalculateItAll);
});
function registerEventHandlers () {

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
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
				getAttrs(['repeating_buff_buff-'+col,'repeating_buff_buff-enable_toggle'],function(v){
					if ( parseInt(v['repeating_buff_buff-enable_toggle'],10) && parseInt(v['repeating_buff_buff-'+col],10)){
						updateBuffTotalAsync(col);
					}
				});
			}
		}));
	});
	//size is special users modify it via dropdown
	on("change:repeating_buff:buff-size", TAS.callback(function PFBuffs_updateBuffSize(eventInfo) {
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateBuffTotalAsync('size');
		}
	}));
	on("remove:repeating_buff", TAS.callback(function PFBuffs_removeBuffRow(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			_.each(buffColumns, function (col) {
					updateBuffTotalAsync(col);
			});
		}
	}));	
	on("change:repeating_buff:buff-enable_toggle", TAS.callback(function PFBuffs_enableBuffRow(eventInfo) {
		var fields;
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType ==="api") {
			fields = SWUtils.cartesianAppend(['repeating_buff_buff-'],buffColumns,['-show','']);
			getAttrs(fields,function(v){
				_.each(buffColumns, function (col) {
					if( parseInt(v['repeating_buff_buff-'+col+'-show'],10) && parseInt(v['repeating_buff_buff-'+col],10)){
						updateBuffTotalAsync(col);
					}
				});
			});
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
}
registerEventHandlers();
PFConsole.log('   PFBuffs module loaded          ');
PFLog.modulecount++;
