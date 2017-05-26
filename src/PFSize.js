'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';
import * as PFMigrate from './PFMigrate';
import * as PFEncumbrance from './PFEncumbrance';
import * as PFAttacks from './PFAttacks';


export var sizeModToEasySizeMap={
	 '0':4,
	 '1':3,
	 '2':2,
	'-8':8,
	 '4':1,
	'-4':7,
	'-2':6,
	'-1':5,
	 '8':0
},
reverseSizeMap={
	 '0':8,
	 '1':4,
	 '2':2,
	 '3':1,
	 '4':0,
	'5':-1,
	'6':-2,
	'7':-4,
	'8':-8
},
skillSizeMap = {
	'0':0,
	'1':2,
	'2':4,
	'8':8,
	'4':6,
	'-8':-8,
	'-4':-6,
	'-2':-4,
	'-1':-2
},
sizeNameMap = {
	'colossal':-8,
	'gargantuan':-4,
	'huge':-2,
	'large':-1,
	 'medium':0,
	 'small':1,
	 'tiny':2,
	 'diminutive':4,
	 'fine':8
},
reverseSizeNameMap = {
'0':'medium',
'1':'small',
'2':'tiny',
'-8':'colossal',
'4':'diminutive',
'-4':'gargantuan',
'-2':'huge',
'-1':'large',
'8':'fine'
};

/** getSizeFromText - returns size mod based on size display name
 * @param {string} sizeDisplay size in english (medium, large, gargantuan, tiny, etc)
 * @returns {jsobj} map of {"size":size mod for AC,"skillSize": size mod for fly}
 */
export function getSizeFromText (sizeDisplay) {
	var sizeMap = {
		"size": 0,
		"skillSize": 0
	};
	try {
		if (sizeDisplay) {
			sizeDisplay = SWUtils.trimBoth(sizeDisplay);
			sizeDisplay = sizeDisplay.toLowerCase();
			sizeMap.size=sizeNameMap[sizeDisplay];
			sizeMap.skillSize = skillSizeMap[String(sizeMap.size)];
		}
	} catch (err) {
		TAS.error("get size from text:" + sizeDisplay, err);
		sizeMap.size = 0;
		sizeMap.skillSize = 0;
	} finally {
		return sizeMap;
	}
}
/**returns number of levels size went up or down
 * ex: Med to Lg is +1, Med to Sm is -1, Md to Tiny is -2, etc
 * @param {int} currSize new size mod , usually value of @{size}
 * @param {int} defaultSize default size mod, for sheet it is value of @{default_char_size}
 * 		  for weapon it is @{repeating_weapon_$X_default_size}
 * @returns {int} difference in sizes (not difference in size mods)
 */
export function getSizeLevelChange (currSize,defaultSize) {
	var newSize,oldSize,levelChange;
	newSize=sizeModToEasySizeMap[String(currSize)];
	oldSize=sizeModToEasySizeMap[String(defaultSize)];
	levelChange = newSize-oldSize;
	return levelChange;
}
/**updateDamageDice returns new dice for weapon/attack damage change due to size
 *@param {int} sizediff difference in LEVELS of size (Medium to Large is 1, Medium to Small is -1)
 *@param {int} defaultSize size modifier, necessary since different rules for small
 *@param {int} currDice num dice from 1 to n
 *@param {int} currDie num sides of die : valid only from 1 to 12
 *@returns {jsobj} {dice:n,die:n}
 */
export function updateDamageDice (sizediff,defaultSize,currDice,currDie){
	var diceSizes = { 1:["1d1"], 2:["1d2"], 3:["1d3"],   
		4:["1d4"],
		5:["1d6"],
		6:["1d8","2d4"],
		7:["1d10"],
		8:["2d6","3d4","1d12"],
		9:["2d8","4d4"],    10:["3d6","5d4"],    11:["3d8","6d4","2d10"],
		12:["4d6","7d4","2d12"],    13:["4d8","8d4","9d4","5d6","3d10"],
		14:["6d6","5d8","10d4","11d4","9d4","3d12"],
		15:["6d8","7d6","12d4","13d4","4d10"],
		16:["8d6","7d8","14d4","15d4","4d12"],
		17:["8d8","16d4","9d6","10d6","11d6","5d10","17d4","18d4","19d4","5d12"],
		18:["12d6","20d4","9d8","7d10","6d12","21d4","22d4","23d4"],
		19:["12d8","24d4","13d6","14d6","15d6","8d10"],
		20:["16d6","13d8","10d10","8d12"]
	},
	currSize=0,
	dicestring="",
	newDice=0,newDie=0,matches,
	rowdiff=0, currow=0, newrow=0, newrowstring="",
	reversedDiceSizes=_.reduce(diceSizes,function(memo,pairs,idx){
		_.each(pairs,function(pair){ memo[pair]=idx;  }); 
		return memo;
	  },{});
	try {
		//TAS.debug("PFSize.updateDamageDice defSize:"+defaultSize+", diff:"+sizediff+", dice:"+currDice+"d"+currDie);
		currDice=parseInt(currDice,10);
		currDie=parseInt(currDie,10);
		if(!(isNaN(currDice)||isNaN(currDie))){
			dicestring=currDice+"d"+currDie;
			currSize=sizeModToEasySizeMap[String(defaultSize)];
			if (currDice<=0 || currDie > 12 ) {return null;}
			if (currDie===4 && currDice >24){ currDice=24;}
			else if (currDie===6 && currDice > 16) {currDice=16;}
			else if (currDie===8 && currDice > 13) {currDice=13;}
			else if (currDie===10 && currDice > 10) {currDice=10;}
			else if (currDie===12 && currDice > 8) {currDice=8;}
			currow=parseInt(reversedDiceSizes[dicestring],10)||0;
			if (!currow){return null;}
			while (sizediff !== 0){
				if (sizediff > 0){
					if  ((currDie<=6 && currDice===1)|| currSize <=3) {
						rowdiff=1;
					} else {
						rowdiff=2;
					}  
				} else if (sizediff<0) {
					if  ((currDie<=8 && currDice===1)||currSize<=4 ) {
						rowdiff=-1;
					} else {
						rowdiff = -2;
					}
				}
				newrow = currow + rowdiff;
				newrow = Math.min(Math.max(newrow,1),20);
				dicestring = diceSizes[newrow][0];
				matches=dicestring.match(/(\d+)d(\d+)/);
				currDice=parseInt(matches[1],10);
				currDie=parseInt(matches[2],10);
				currow =newrow;
				if (sizediff >0 ) {
					sizediff--;
					if (currow===20){break;}
				} else {
					sizediff++;
					if (currow===1) {break;}
				}
			}
		}
	} catch(err){
		TAS.error("updateDamageDice: ",err);
	} finally {
		return {"dice":currDice,"die":currDie};
	}
}

export function updateSize (v,eventInfo,setter) {
	var size =  0,buffSize=0, defaultSize=0,deflevel=0,newlevel=0,
		buffLevels=0, skillSize = 0, tempstr='',sizeDisplay='';
	try {
		setter=setter||{};
		defaultSize = parseInt(v.default_char_size,10)||0;
		size = parseInt(v['size'], 10) || 0;
		buffLevels=parseInt(v['buff_size-total'],10)||0;
		if (buffLevels!==0 ){
			deflevel = sizeModToEasySizeMap[String(defaultSize)];
			newlevel = deflevel+buffLevels;
			buffSize = reverseSizeMap[String(newlevel)];
			if (buffSize!==size){
				setter['size']=buffSize;
				size = buffSize;
			}
		} else if (eventInfo&&eventInfo.sourceAttribute.toLowerCase()==='buff_size-total'){
			if (size!==defaultSize){
				setter['size']=defaultSize;
				size = defaultSize;
			}
		}
		try {
			tempstr=reverseSizeMap[String(size)];
			if (tempstr){
				sizeDisplay = getTranslationByKey(sizeDisplay);
			}
		} catch (err3){
			sizeDisplay = tempstr;
		}
		if (sizeDisplay && (sizeDisplay!== v.size_display || !v.size_display)){
			setter.size_display=sizeDisplay;
		}
		skillSize = skillSizeMap[String(size)];
		setter.size_skill = skillSize;
		setter["CMD-size"] = (size * -1);
		setter.size_skill_double = (2*skillSize);
	} catch (err) {
		TAS.error("PFSize.updateSize", err);
	} finally {
		//TAS.debug("PFSize.updateSize returning with  ",setter);
		return setter;
	}
}

export function updateSizeAsync (callback, silently,eventInfo) {
	var done = _.once(function () {
		if (typeof callback === "function") {
			callback();
		}
	});
	getAttrs(["size", "size_skill","size_skill_double", "default_char_size", "CMD-size", "buff_size-total","size_display"], function (v) {
		var params = {},
		setter = {};
		try {
			updateSize(v,eventInfo,setter);
		} catch (err) {
			TAS.error("PFSize.updateSizeAsync", err);
		} finally {
			if (_.size(setter) > 0) {
				if (silently) {
					params = PFConst.silentParams;
				}
				setAttrs(setter, params, done);
			} else {
				done();
			}
		}
	});
}
function setNewSize(eventInfo){
	updateSizeAsync(function(){
		PFEncumbrance.updateLoadsAndLift();
		PFAttacks.adjustAllDamageDiceAsync(null,eventInfo);	
	},false,eventInfo);
}
function applyNewSizeToSheet(eventInfo){
	PFEncumbrance.updateLoadsAndLift();
	PFAttacks.adjustAllDamageDiceAsync(null,eventInfo);	
}
export function migrate (callback){
	if (typeof callback === "function") {
		callback();
	}
}
export var recalculate = TAS.callback(function callrecalculate(callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("Leaving PFSize.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	});
	TAS.debug("At PFSize.recalculate");
	updateSizeAsync(done, silently,null);
});
function registerEventHandlers () {
	//size
	on("change:size change:default_char_size", TAS.callback(function eventUpdateSize(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
			setNewSize(eventInfo);
		} else {
			applyNewSizeToSheet(eventInfo);
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFSize module loaded           ');
PFLog.modulecount++;
