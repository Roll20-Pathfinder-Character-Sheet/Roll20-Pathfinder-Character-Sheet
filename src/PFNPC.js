'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import PFConst from './PFConst';
import * as PFMigrate from './PFMigrate';

/* setToNPC when first setting a sheet , set other default config settings
* also switch to NPC page for when user leaves ocnfig page.
*/
function setToNPC (callback,eventInfo){
	var done = _.once(function(){
		if (typeof callback === "function"){
			callback();
		}
	});
	getAttrs(["npc-hd","PFSheet_Version","npc-hd-num","level","hp","hp_max","is_newsheet"],function(v){
		//determine if this is a new sheet. if so set default config choices:
		if ( parseInt(v.is_newsheet,10) || ( (parseInt(v.PFSheet_Version,10)||0) ===0 && ( !(  parseInt(v['npc-hd'],10)  || parseInt(v['npc-hd-num'],10) || parseInt(v['level'],10) || parseInt(v['hp'],10) || parseInt(v['hp_max'],10)  )))) {
			setAttrs({ 'auto_calc_hp':1, 'autohp_percent':1, 'maxhp_lvl1':0, 'normal_macro_show': 1, 'max-dex-source':3, 
				'use_traits':0 , 'use_racial_traits':0, 'tab':8, 'is_v1':1}, PFConst.silentParams, done);
		} else {
			//should we do something? at least recalc the commandmacros?
			done();
		}
	});
}
export function migrate (callback){
	PFMigrate.migrateNPC(callback,silently);
}
export function recalculate (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.debug("leaving PFNPC.recalculate");
		if (typeof callback === "function") { callback(); }
	});
	migrate(done);
}
function registerEventHandlers () {
	on("change:is_npc", TAS.callback(function eventSetIsNPCFlag(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			getAttrs(['is_npc'],function(v){
				if (parseInt(v.is_npc,10)===1){
					setToNPC(eventInfo);
				}
			});
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFNPC module loaded            ');
PFLog.modulecount++;
