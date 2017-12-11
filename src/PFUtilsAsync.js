'use strict';
import _ from 'underscore';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';

/****************************ASYNCRHOUNOUS UTILITIES ***********************************
 ***************************************************************************************/
/** Looks at a dropdown selected value, finds the matching attribute value #, and then
 * sets the writeFields with that number.
 *
 * @param {string} from the dropdpown fieldname
 * @param {string} to fielname to which we write the numeric value of the 'from' dropdown selection
 * @param {function(new,old,changed)} callback - the function to call when done with the numeric value of the dropdown setting
 * @param {boolean} silently if quiet or not
 * @param {string} useFindAbility true if @{} around values in the dropdown
 */
export function setDropdownValue (readField, writeFields, callback, silently,useFindAbility) {
    var functionToPass = null;
    if(useFindAbility){
        functionToPass=PFUtils.findAbilityInString;
    }
    SWUtils.setDropdownValue(readField, writeFields, functionToPass, callback, silently);
}
/** calls setDropdownValue for a dropdown in a repeating section
 * @param {string} section the string between "repeating_" and "_<id>"
 * @param {string} id optional- the id of this row, blank if in context of the current row 
 * @param {string} from the attribute name of the dropdown , string after "repeating_section_id_"
 * @param {string} to the attribute to write to, string after "repeating_section_id_"
 * @param {function(new,old,changed)} callback - the function to call when done with the numeric value of the dropdown setting
 * @param {boolean} silently if quiet or not
 * @param {string} useFindAbility true if @{} around values in the dropdown
 */
export function setRepeatingDropdownValue (section, id, from, to, callback,silently,useFindAbility) {
    var idStr = SWUtils.getRepeatingIDStr(id),
    prefix = "repeating_" + section + "_" + idStr,
    functionToPass = null;
    if(useFindAbility){
        functionToPass=PFUtils.findAbilityInString;
    }
    //setDropdownValue(prefix + from, prefix + to, callback,silently);
    SWUtils.setDropdownValue(prefix + from,  prefix + to, functionToPass, callback, silently);
}
/** sets the _row_id fields for all rows in the section
 * @param {string} section the fieldset (name after "section_")
 */
export function setRowIds (section) {
    getSectionIDs("repeating_" + section, function (ids) {
        var setter = {};
        _.each(ids, function (id) {
            setter["repeating_" + section + "_" + id + "_row_id"] = id;
        });
        SWUtils.setWrapper(setter);
    });
}
export function registerEventHandlers() {
    //REPEATING SECTIONS set IDs
    _.each(PFConst.repeatingSections, function (section) {
        var eventToWatch = "change:repeating_" + section + ":ids-show";
        on(eventToWatch, TAS.callback(function eventCheckIsNewRow(eventInfo) {
            var setter={},id;
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                id = SWUtils.getRowId(eventInfo.sourceAttribute);
                setter["repeating_" + section + "_"+id+"_row_id"]=id;
                SWUtils.setWrapper(setter,PFConst.silentParams);
            }
        }));
    });
}
registerEventHandlers();
