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
on("change:header_images_toggle", function() {
    getAttrs(["header_images_toggle"], function(values) {
        var tempToggle = values.header_images_toggle;
        TAS.debug("Header Images Toggle new value = " + tempToggle);
        if (tempToggle > 0) {
            setAttrs({
                ['header_image-pf_spell']: "[default](http://imgur.com/9yjOsAD.png)",
                ['header_image-pf_attack-melee']: "[default](http://i.imgur.com/AGq5VBG.png)",
                ['header_image-pf_attack-dual']: "[default](http://i.imgur.com/Eh243RO.png)",
                ['header_image-pf_attack-ranged']: "[default](http://imgur.com/58j2e8P.png)",
                ['header_image-pf_attack-cmb']: "[default](http://i.imgur.com/Si4vfts.png)",
                ['header_image-pf_defense']: "[default](http://imgur.com/02fV6wh.png)",
                ['header_image-pf_generic']: "[default](http://imgur.com/phw1eFB.png)",
                ['header_image-pf_ability']: "[default](http://i.imgur.com/UxYSva8.png)",
                ['header_image-pf_block']: "[default](http://imgur.com/nBnv4DL.png)",
                ['header_image-pf_generic-skill']: "[default](http://imgur.com/8dCkRtG.png)",
                ['header_image-pf_generic-init']: "[default](http://i.imgur.com/pjS6HVJ.png)",
                ['header_image-pf_block-item']: "[default](http://i.imgur.com/4FgQuqS.png)",
                ['header_image-pf_block-check']: "[default](http://i.imgur.com/a6O3ZGB.png)"
            });
        }
        else {
            setAttrs({
                ['header_image-pf_spell']: '',
                ['header_image-pf_attack-melee']: '',
                ['header_image-pf_attack-dual']: '',
                ['header_image-pf_attack-ranged']: '',
                ['header_image-pf_attack-cmb']: '',
                ['header_image-pf_defense']: '',
                ['header_image-pf_generic']: '',
                ['header_image-pf_ability']: '',
                ['header_image-pf_block']: '',
                ['header_image-pf_generic-skill']: '',
                ['header_image-pf_generic-init']: '',
                ['header_image-pf_block-item']: '',
                ['header_image-pf_block-check']: ''
            });
        }
    });
 });
function newFunction() {
    var header_images_toggle;
    return header_images_toggle;
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
