'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';

/* updateInitiative * updates the init*/
function updateInitiative (callback, silently) {
	getAttrs(['nodex-toggle'],function(v){
		if (parseInt(v['nodex-toggle'],10)) {
			//if lose dex then lose ability mod no matter what ability it is, since init is a dex check:
			//http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9tga
			SWUtils.updateRowTotal(["init", "init-trait", "init-misc-mod","checks-cond"], 0, ["condition-Deafened"], false, callback, silently);
		} else {
			SWUtils.updateRowTotal(["init", "init-ability-mod", "init-trait", "init-misc-mod","checks-cond"], 0, ["condition-Deafened"], false, callback, silently);
		}
	});
}
export function recalculate (callback, silently, oldversion) {
	var done = _.once(function () {
		TAS.info("Leaving PFInitiative.recalculate");
		if (typeof callback === "function") {
			callback();
		}
	});
	updateInitiative(done, silently);
}
function registerEventHandlers () {
	on("change:init-trait change:condition-Deafened ", TAS.callback(function eventUpdateInitPlayer(eventInfo) {
		TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
		if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
			updateInitiative();
		}
	}));
	on("change:init-ability-mod change:init-misc-mod change:checks-cond change:nodex-toggle", TAS.callback(function eventUpdateInitSheet(eventInfo) {
		if (eventInfo.sourceType === "sheetworker") {
			TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
			updateInitiative();
		}
	}));
}
registerEventHandlers();
PFConsole.log('   PFInitiative module loaded     ');
PFLog.modulecount++;
