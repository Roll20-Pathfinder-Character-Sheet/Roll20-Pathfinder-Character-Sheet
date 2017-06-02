'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as PFUtils from './PFUtils';
import * as SWUtils from './SWUtils';
/* PFChecks.applyConditions - handles changes to skill and ability checks due to conditions AND buffs.
 * Reads in condition that affect Ability and Skill checks and updates condition fields.
 * checks-cond, Phys-skills-cond, Perception-cond.
 */
export function applyConditions (callback, silently) {
	var done = function () {
		if (typeof callback === "function") {
			callback();
		}
	};
	getAttrs(["condition-Blinded", "condition-Fear", "condition-Drained", "condition-Sickened", "condition-Wounds", "has_endurance_feat", "wounds_gritty_mode", "checks-cond", "Phys-skills-cond", "Perception-cond", "wound_threshold-show", "CasterLevel-Penalty"], function (v) {
		//there is no Fascinated, if we add it then:
		//,"condition-Fascinated" -4 to perception
		var setter = {},
		params = {}, drained = 0, fear = 0, sick = 0, woundPenalty = 0, wounds = 0, allSkillsMod = 0, casterlevel = 0, blindedMod = 0, currAllSkills = 0, currPhysSkills = 0, currPerSkills = 0, currCaster = 0;
		try {
			drained = parseInt(v["condition-Drained"], 10) || 0;
			fear = -1 * (parseInt(v["condition-Fear"], 10) || 0);
			sick = -1 * (parseInt(v["condition-Sickened"], 10) || 0);
			woundPenalty = PFUtils.getWoundPenalty((parseInt(v["condition-Wounds"], 10) || 0), (parseInt(v.has_endurance_feat, 10) || 0), (parseInt(v.wounds_gritty_mode, 10) || 0));
			wounds = (parseInt(v["wound_threshold-show"], 10) || 0) * woundPenalty;
			allSkillsMod =  drained + fear + sick + wounds;
			casterlevel = drained + wounds;
			blindedMod = -2 * (parseInt(v["condition-Blinded"], 10) || 0);
			currAllSkills = parseInt(v["checks-cond"], 10) || 0;
			currPhysSkills = parseInt(v["Phys-skills-cond"], 10) || 0;
			currPerSkills = parseInt(v["Perception-cond"], 10) || 0;
			currCaster = parseInt(v["CasterLevel-Penalty"], 10) || 0;
			if (allSkillsMod !== currAllSkills || isNaN(currAllSkills)) {
				setter["checks-cond"] = allSkillsMod;
			}
			if (blindedMod !== currPhysSkills || isNaN(currPhysSkills)) {
				setter["Phys-skills-cond"] = blindedMod;
			}
			if (blindedMod !== currPerSkills || isNaN(currPerSkills)) {
				setter["Perception-cond"] = blindedMod;
			}
			if (casterlevel !== currCaster || isNaN(currCaster)) {
				setter["CasterLevel-Penalty"] = casterlevel;
			}
		} catch (err) {
			TAS.error("PFChecks.applyConditions", err);
		} finally {
			if (_.size(setter) > 0) {
				SWUtils.setWrapper(setter, {}, done);
			} else {
				done();
			}
		}
	});
}
PFConsole.log('   PFChecks module loaded         ');
PFLog.modulecount++;
