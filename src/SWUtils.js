'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as ExExp from './ExExp';

export var setWrapper = TAS.callback(function callSetAttrs(a,b,c){
	var bad=false;
	TAS.debug("setting "+_.size(a)+" values:",a);
	TAS.callstack();
	_.each(a,function(v,k){
		if (!v && isNaN(v)){
			TAS.error("Setting NaN! at "+k);
			bad=true;
		}
	});
	if (bad){
		TAS.callstack();
	}
	setAttrs(a,b,c);
});

export var getWrapper = TAS.callback(function callGetAttrs(a,cb){
	getAttrs(a,function(vals){
		cb(vals);
	});
});

/* for interaction with ExExp, and some basic utils that have nothing to do with Pathfinder rules. */
/** Determines if string can be evaluated to a number
 * ensures:  no macro calls, dropdowns, or keep highest/lowest more than 1
 * allows: floor, abs, kh1, kl1,  ceil, round, max, min
 *@param {string} preeval string to examine
 *@returns {boolean} true if string will evaluate to a number.
 */
function validNumericStr (preeval) {
	var anyIllegal = preeval.match(/\||\?|&|\{|\}|k[h,l][^1]/);
	if (anyIllegal) {
		return false;
	}
	anyIllegal = preeval.replace(/floor|ceil|round|abs|max|min|kh1|kl1/g, '');
	anyIllegal = anyIllegal.match(/[a-zA-Z]/);
	if (anyIllegal) {
		return false;
	}
	return true;
}
/** searches a string for @{attribute} and replaces those with their values, passes result to the callback
 * if error then passes null
 * @param {string} stringToSearch = string containing one or more @{fieldname}
 * @param {function(string)} callback when done passes resultant string to callback
 */
export function findAndReplaceFields (stringToSearch, callback) {
	var fieldnames ;
	if (typeof callback !== "function") {
		return;
	}
	if (!stringToSearch) {
		callback(null);
		return;
	}
	try {
		stringToSearch = stringToSearch.split("selected|").join("");
		stringToSearch = stringToSearch.split("target|").join("");
		stringToSearch = stringToSearch.replace(/\|max\}/g,'_max}');
		fieldnames = stringToSearch.match(/\@\{[^}]+\}/g);
		if (!fieldnames) {
			callback(stringToSearch);
			return;
		}
		fieldnames=fieldnames.sort();
		fieldnames = _.uniq(fieldnames,true);
		fieldnames = _.map(fieldnames,function(field){
			return field.slice(2,-1);
		});
		getAttrs(fieldnames, function (values) {
			var evalstr = stringToSearch, innermatches=null,initialsplit;
			try {
				_.each(fieldnames,function(field){
					//evalstr = evalstr.replace(  new RegExp(escapeForRegExp('@{'+field+'}'),'g'), values[field]);
					initialsplit = evalstr.split('@{'+field+'}');
					evalstr = initialsplit.join(values[field]);
				});
				innermatches=evalstr.match(/\@\{[^}]+\}/g);
			} catch (err2) {
				TAS.error("SWUtils.findAndReplaceFields err2", err2);
				evalstr = null;
			} finally {
				if (innermatches) {
					findAndReplaceFields(evalstr,callback);
				} else {
					callback(evalstr);
				}
			}
		});
	} catch (err) {
		TAS.error("SWUtils.findAndReplaceFields", err);
		callback(null);
	}
}
/** Replaces kl1 and kh1 with min and max
 * example: replaces {x,y}kh1 with min(x,y)
 * @param {string} str the string to search
 * @returns {string} the resultant string after performing the replace
 */
function convertKL1KH1toMinMax  (str) {
	var matches;
	//TAS.debug("at convertKL1KH1toMinMax for "+str) ;
	if (str) {
		matches = str.match(/(\{[^}]+\})(kh1|kl1)(?!.*\1)/g);
		//TAS.debug("matches are:",matches);
		if (matches && matches.length > 0) {
			str = _.reduce(matches, function (memo, match) {
				var isMin = /kl1$/.test(match),
				isMax = /kh1$/.test(match),
				newFunc = isMin ? "min" : (isMax ? "max" : ""),
				newMatch = match.slice(1, match.length - 4),
				replaceStr = newFunc + "(" + newMatch + ")";
				return memo.replace(match, replaceStr);
			}, str);
		}
	}
	return str;
}
/** Reads in the string, evaluates it to a single number, passes that number to a callback
 * calls callback with: the number, 0 (if exprStr empty), or null if an error is encountered
 *@param {string} exprStr A string containing a mathematical expression, possibly containing references to fields such as @{myfield}
 *@param {function(Number)} callback a function taking one parameter - could be int or float
 */
export var evaluateExpression = TAS.callback(function callevaluateExpression(exprStr, callback) {
	var bmatches1 = 0, bmatches2 = 0, pmatches1 = 0, pmatches2 = 0, smatches1 = 0, smatches2 = 0;
	if (typeof callback !== "function") {
		return;
	}
	if (exprStr === "" || exprStr === null || exprStr === undefined) {
		callback(0);
		return;
	}
	//verify that same number of parenthesis exists
	bmatches1 = (exprStr.match(/\(/g) || []).length;
	bmatches2 = (exprStr.match(/\)/g) || []).length;
	pmatches1 = (exprStr.match(/\{/g) || []).length;
	pmatches2 = (exprStr.match(/\}/g) || []).length;
	smatches1 = (exprStr.match(/\[/g) || []).length;
	smatches2 = (exprStr.match(/\]/g) || []).length;
	if (bmatches1 !== bmatches2 || pmatches1 !== pmatches2 || smatches1 !== smatches2) {
		TAS.warn("evaluateExpression: Mismatched brackets, cannot evaluate:" + exprStr);
		callback(null);
		return;
	}

	findAndReplaceFields(exprStr, function (replacedStr) {
		var evaluated,
		newexprStr;
		//TAS.debug("search and replace of " + exprStr + " resulted in " + replacedStr);
		if (replacedStr === null || replacedStr === undefined) {
			callback(null);
			return;
		}
		try {
			replacedStr = replacedStr.replace(/\s+/g, '').replace(/\[\[/g, "(").replace(/\]\]/g, ")").replace(/\[/g, "(").replace(/\]/g, ")");
			newexprStr = convertKL1KH1toMinMax(replacedStr);
			//TAS.debug("replacedStr is now "+newexprStr);
			if (newexprStr !== replacedStr) {
				replacedStr = newexprStr;
			}
			if (!isNaN(Number(replacedStr)) && isFinite(replacedStr)) {
				evaluated = parseFloat(replacedStr);
				//evaluated = parseInt(replacedStr,10);
				if (!isNaN(evaluated)) {
					callback(evaluated);
					return;
				}
			}
			if (typeof replacedStr !== "undefined" && replacedStr !== null && validNumericStr(replacedStr)) {
				evaluated = ExExp.handleExpression(replacedStr);
				if (!isNaN(evaluated)) {
					callback(evaluated);
				} else {
					TAS.warn("cannot evaluate this to number: " + exprStr +" came back with " + replacedStr);
					callback(null);
				}
			} else {
				TAS.warn("cannot evaluate this to number: " + exprStr+" came back with " + replacedStr);
				callback(null);
			}
		} catch (err3) {
			TAS.error("error trying to convert to number:" + err3);
			callback(null);
		}
	});
});
/** evaluateAndSetNumber
 * Examines the string in readField, and tests to see if it is a number
 * if it's a number immediately write it to writeField.
 * if not, then replace any @{field} references with numbers, and then evaluate it
 * as a mathematical expression till we find a number.
 *
 * @param {string} readField= field to read containing string to parse
 * @param {string} writeField= field to write to
 * @param {number} defaultVal= optional, default to set if we cannot evaluate the field. If not supplied assume 0
 * @param {function} callback - function(newval, oldval, ischanged)
 * @param {boolean} silently if true set new val with {silent:true}
 * @param {boolean} dontSetErrorFlag if true and we could not evaluate, then set attribute named writeField+"_error" to 1
 * @param {function} errcallback  call if there was an error parsing string function(newval, oldval, ischanged)
 */
export var evaluateAndSetNumber = TAS.callback(function callevaluateAndSetNumber(readField, writeField, defaultVal, callback, silently, errcallback) {
	var done = function (a, b, c,currError) {
		var donesetter={};
		if (currError){
			donesetter[writeField+'_error']=0;
			setWrapper(donesetter,{silent:true});
		}
		if (typeof callback === "function") {
			callback(a, b, c);
		}
	},
	errordone = function(a,b,c,currError){
		var donesetter={};
		//TAS.debug("leaving set of "+ writeField+" with old:"+b+", new:"+c+" is changed:"+ c+" and curreerror:"+currError);
		if (!currError){
			donesetter[writeField+'_error']=1;
			setWrapper(donesetter,{silent:true});				
		}
		if (typeof errcallback === "function") {
			errcallback(a, b, c);
		} else if (typeof callback === "function") {
			callback(a, b, c);
		}
	};
	getAttrs([readField, writeField, writeField+"_error"], function (values) {
		var setter = {},
		params = {},
		trueDefault=0, 
		currVal=0,
		isError=0,
		currError=0,
		isChanged=false,
		value=0;	
		try {
			if (silently){params.silent=true;}
			currError= parseInt(values[writeField+"_error"],10)||0;
			trueDefault = defaultVal || 0;
			currVal = parseInt(values[writeField], 10);
			value = Number(values[readField]);
			//check for blank
			if (typeof values[readField] === "undefined" || !values[readField] || values[readField]===null || values[readField]==="" ) {
				//if value of readField is blank then set to defaultval.
				value = trueDefault;
				if (currVal !== value || isNaN(currVal)) {
					setter[writeField] = value;
					setWrapper(setter, params, function () {
						done(value, currVal, true,currError);
					});
				} else {
					done(value, currVal, false,currError);
				}
			} else if (!isNaN(value)) {
				//check for number
				if (!(currVal === value || currVal === Number(values[writeField]))) {
					setter[writeField] = value;
					setWrapper(setter, params, function () {
						done(value, currVal, true,currError);
					});
				} else {
					done(value, currVal, false,currError);
				}
			} else {
				//pass to evaluateExpression 
				evaluateExpression(values[readField], function (value2) {
					try {
						if (value2 === null || value2===undefined || isNaN(value2)) {
							isError=1;
							value2=trueDefault;
							//TAS.debug("setting "+ writeField+" to " +value2);
						}
						//changedto only 2 equals and flip
						if (isNaN(currVal) || value2 != currVal) {
							setter[writeField] = value2;
						} 
						if (_.size(setter)>0){
							isChanged=true;
						}
					} catch (err2) {
						TAS.error("SWUtils.evaluateAndSetNumber error after call to evaluateExpression ", err2);
						isError=1;
					} finally {
						if(isChanged){
							setWrapper(setter, params, function () {
								if (!isError){
									done(value2, currVal, isChanged,currError);
								} else {
									errordone(value2,currVal,isChanged,currError);
								}
							});
						} else {
							done(value2,currVal,false,currError);
						}

					}
				});
			}
		} catch (err) {
			TAS.error("SWUtils.evaluateAndSetNumber", err);
			errordone(0,0,0,0);
		}
	});
});
/** Reads dropdown value
 * determines attribute referenced, gets that attribute value, passes it to callback.
 * similar to evaluateAndSetNumber but uses a synchronus function to perform search and replace, and assumes the string is only one value not an expression.
 * necessary because some dropdowns have other text in the dropdowns, so we can't use the dropdown value exactly as is.
 * called by setDropdownValue
 * @param {string} readField the attribute name of dropdown we are looking at
 * @param {function} synchrousFindAttributeFunc reads in the value of the dropdown field, and returns the exact name of the attribute to look up (since some dropdowns have other text in value)
 * @param {function(int)} callback pass the value the dropdown selection represents
 *   exceptions: if readField is not found pass in "", if readField is 0 or starts with 0 pass in 0.
 */
export var getDropdownValue = TAS.callback(function callgetDropdownValue (readField, synchrousFindAttributeFunc, callback) {
	if (!readField || (callback && typeof callback !== "function") || typeof synchrousFindAttributeFunc !== "function") {
		return;
	}
	getAttrs([readField], function (values) {
		var fieldToFind = values[readField],
		foundField = "";
		if (typeof fieldToFind === "undefined" || fieldToFind === null) {
			callback("");
		} else if (fieldToFind === "0" || fieldToFind === 0 || fieldToFind.indexOf("0") === 0) {
			//select = none
			callback(0);
		} else {
			foundField = synchrousFindAttributeFunc(fieldToFind);
			getAttrs([foundField], function (v) {
				var valueOf = parseInt(v[foundField], 10) || 0;
				callback(valueOf, foundField);
			});
		}
	});
});
/** Looks at a dropdown value, and sets writeField(s) with the number to which selected option refers.
 * calls getDropdownValue
 * @param {string} readField the dropdown field
 * @param {string_or_Array} writeFields Field(s) to write the value to
 * @param {function} synchrousFindAttributeFunc takes value of @readField and says what the lookup field is.
 * @param {function(int)} callback (optional) if we need to update the field, call this function
 *         with the value we set as the only parameter.
 * @param {boolean} silently if true call setWrapper with {silent:true}
 */
export var setDropdownValue = TAS.callback(function callsetDropdownValue(readField, writeFields, synchrousFindAttributeFunc, callback, silently) {
	var done = function (newval, currval, changed) {
		if (typeof callback === "function") {
			callback(newval, currval, changed);
		}
	};
	getDropdownValue(readField, synchrousFindAttributeFunc, function (valueOf) {
		var params = {};
		if (silently) {params.silent=true;}
		if (Array.isArray(writeFields) && writeFields.length === 1) {
			writeFields = writeFields[0];
		}
		if (typeof writeFields === "string") {
			getAttrs([writeFields], function (v) {
				var currValue = parseInt(v[writeFields], 10),
				setter = {};
				//TAS.debug("setDropdownValue, readField:" + readField + ", currValue:" + currValue + ", newValue:" + valueOf);
				if (currValue !== valueOf || isNaN(currValue)) {
					setter[writeFields] = valueOf;
					setWrapper(setter, params, function () {
						done(valueOf, currValue, true);
					});
				} else {
					done(valueOf, currValue, false);
				}
			});
		} else if (Array.isArray(writeFields)) {
			getAttrs(writeFields, function (v) {
				var i = 0,
				setter = {};
				for (i = 0; i < writeFields.length; i++) {
					if (parseInt(v[writeFields[i]], 10) !== valueOf) {
						setter[writeFields[i]] = valueOf;
					}
				}
				if (_.size(setter) > 0) {
					setWrapper(setter, params, function () {
						done(valueOf, 0, true);
					});
				} else {
					done(valueOf, 0, false);
				}
			});
		}
	});
});
/** getRowTotal return newvalue, currentvalue, allvalues in callback. Summed up floats and round total to int. 
 * THIS IS PROBABLY SLOWER THAN DOING IT YOURSELF, just wrote to make things simpler.
 * @param {Array} fields array of field names to be added up, EXCEPT the first field which is ignored (at index 0) which is the total current value
 * @param {number} bonus a number that is added to the other fields.
 * @param {Array} penalties array of fieldnames whose values are to be subtracted from the total
 * @param {boolean} totalIsFloat true if we should not round the total to int.
 * @param {function(number,number)} callback call this with: new total, current total
 * @param {function} errorCallback call if error attempting to add.
 */
export function getRowTotal  (fields, bonus, penalties, totalIsFloat, callback, errorCallback) {
	var readFields;
	if (typeof callback !== "function" || typeof errorCallback !== "function") {
		return;
	}
	try {
		if (!fields || (!Array.isArray(fields)) || fields.length === 0) {
			return;
		}
		if (penalties && Array.isArray(penalties) && penalties.length > 0) {
			readFields = fields.concat(penalties);
		} else {
			readFields = fields;
		}
	} catch (err2) {
		TAS.error("SWUtils.getRowTotal catastrophic error: ", err2);
		errorCallback();
		return;
	}
	getAttrs(readFields, function (v) {
		var currValue = totalIsFloat ? parseFloat(v[fields[0]]) : parseInt(v[fields[0]], 10),
		newValue = 0,
		penalty = 0,
		i; //, setter = {}
		try {
			//remember start at 1
			for (i = 1; i < fields.length; i++) {
				newValue += parseFloat(v[fields[i]]) || 0;
			}
			if (bonus && !isNaN(parseInt(bonus, 10))) {
				newValue += parseFloat(bonus);
			}
			if (penalties) {
				for (i = 0; i < penalties.length; i++) {
					penalty += parseFloat(v[penalties[i]]) || 0;
				}
				newValue -= penalty;
			}
			if (!totalIsFloat) {
				newValue = Math.floor(newValue);
			}
			callback(newValue, currValue);
		} catch (err) {
			TAS.error("SWUtils.getRowTotal", err);
			errorCallback();
		}
	});
}
/** Adds up numbers and puts it in the first field of the fields array.
 * All numbers are added up as FLOATS, and then FLOOR is used to round the sum down
 * @param {Array} fields array of field names to be added up, EXCEPT the first field. fields[0] MUST be the total field
 * @param {number} bonus a number that is added to the other fields.
 * @param {Array} penalties array of fieldnames whose values are to be subtracted from the total
 * @param {boolean} totalIsFloat true if we should not round the total to int.
 * @param {function(number,number)} callback optional call this with two values: the new total, old total
 * @param {boolean} silently if true call setWrapper with {silent:true}
 */
export function updateRowTotal (fields, bonus, penalties, totalIsFloat, callback, silently, force) {
	var done = function () {
		if (typeof callback === "function") {
			callback();
		}
	};
	getRowTotal(fields, bonus, penalties, totalIsFloat, function (newValue, currValue) {
		var setter = {},
		params = {};
		if (force || newValue !== currValue) {
			setter[fields[0]] = newValue;
		}
		if (_.size(setter) > 0) {
			if (silently) {
				params.silent=true;
			}
			setWrapper(setter, params, done);
		} else {
			done();
		}
	}, done);
}
/** Escapes special chars for regex
 *@param {string} str the string to examine
 *@param {boolean} escapeSpaces if we should replace any space with \s* (caller can use it for matching purposes)
 *@returns {string} resultant string after search and replace
 */
export function escapeForRegExp  (str, escapeSpaces) {
	var regexEscapes = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\~\!\@\#]/g,
	tempstr ='';
	if (str) {
		tempstr = str.replace(regexEscapes, "\\$&");
		if (escapeSpaces){
			//replace space plus multiple spaces with non escaped 0 or * space.
			tempstr = tempstr.replace(/\t+|\s+/g,'\\s*');
		}
	}
	return tempstr;
}
/** Escapes special chars for macros - to create sub queries - this is not used currently
 *@param {string} str the string to examine
 *@returns {string} resultant string after search and replace
 */
export function escapeForMacroCall  (str) {
	var macroCallEscapes = [ [/\{\{/g, '&#123;&#123;'],
		[/\}\}/g, '&#125;&#125;'],
		[/\(/g, '&#40;'],
		[/\)/g, '&#41;'],
		[/\,/g, '&#44;'],
		[/\?/g, '&#63;'],
		[/'/g, '&#39;'],
		[/"/g, '&#34;'],
		[/\=/g, '&#61;'] ];
	if (str) {
		return _.reduce(macroCallEscapes, function (currStr, pair) {
			return currStr.replace(pair[0], pair[1]);
		}, str);
	}
	return "";
}
/** Escapes '{{' for passing to a rolltemplate
 *@param {string} str the string to examine
 *@returns {string} resultant string after search and replace
 */
export function escapeForRollTemplate  (str) {
	if (!str){return str;}
	return str.replace(/\{\{/g, '&#123;&#123;');
}
/** escapes string so it can be used in the name section of another link button
 *if it finds [name](link) in a string it will remove the [ and ] and the (link)
 * replaces [ and ] with escaped versions everywhere else.
 *@param {string} str the string we want to use inside a link button
 *@returns {string} safe to use new name for button
 */
export function escapeForChatLinkButton (str){
	var markdownLinkreg=/^([^\[]*?)\[([^\]]*?)\]\(([^\)]*?)\)(.*)$/,
		retstr="", matches;
	if (!str){return str;}
	matches = markdownLinkreg.exec(str);
	if(matches){
		if (matches[1]){
			retstr+=matches[1];
		}
		if(matches[2]){
			retstr += matches[2];
		}
		if (matches[4]){
			retstr += matches[4];
		}
	} else {
		retstr = str;
	}
	retstr = retstr.replace(/\[/g,'&#91;').replace(/\]/g,'&#93;');
	return retstr;
}
/** returns id portion of a source Attribute or repeating row attribute name
 * @param {string} sourceAttribute from eventInfo object
 * @returns {string} the id portion of string, or blank.
 */
export function getRowId  (sourceAttribute) {
	if (!sourceAttribute) { return ""; }
	var strs = sourceAttribute.split('_');
	//only 3 if is is from remove:repeating_section, 4 otherwise
	if (strs && _.size(strs) >= 3) {
		return strs[2];
	}
	return "";
}
export function getAttributeName  (source) {
	if (!source) { return ""; }
	var itemId = getRowId(source), attrib = "";
	if (itemId) {
		attrib = source.substring(source.indexOf(itemId) + itemId.length + 1, source.length);
	}
	return attrib;
}
/** getRepeatingIDStr - if id is not empty, then returns the ID with an underscore on the right. else returns empty string
 * this is used so the same function can be written for loops from getIDs or direct from the event with no ID
 *@param {string} id the id of the row or blank
 *@returns {string} id_  or blank
 */
export function getRepeatingIDStr  (id) {
	var idStr = "";
	if (!(id === null || id === undefined)) {
		idStr = id + "_";
	}
	return idStr;
}
/** Append values of multiple arrays of strings together to return one NEW array of strings that is the cartesian product.
 * @example cartesianAppend(["a","b"],["c","d"], ["e","f"]);
 * // returns ["ace","acf","ade","adf","bce","bcf","bde","bdf"]
 * @example cartesianAppend(["pre_"] , ["a","b","c"], ["_post"] );
 * //returns ["pre_a_post","pre_b_post","pre_c_post"]
 * @param {Array} [...] Arrays of strings
 * @returns {Array} of all values in other arrays
 */
export function cartesianAppend () {
	return _.reduce(arguments, function (a, b) {
		return _.flatten(_.map(a, function (x) {
			return _.map(b, function (y) {
				return String(x) + String(y);
			});
		}), true);
	}, [[]]);
}
/** Concatenates cartesian product of all arrays together returns one flattened NEW array.
 * @param {Array} [...] Arrays
 * @returns {Array} cartesian product of all arrays (concatenated nothing else)
 */
export function cartesianProduct  () {
	return _.reduce(arguments, function (a, b) {
		return _.flatten(_.map(a, function (x) {
			return _.map(b, function (y) {
				return x.concat([y]);
			});
		}), true);
	}, [[]]);
}
/** trimBoth removes spaces at beginning and end of string, or of each string in an array.
 * performs a deep match, so if array is of arrays, will call trim on every string. 
 * if object is not an array or string, just return object.
 * therefore, non immutable objects are not cloned and array will contain links to them.
 *@param {Array or string} val string or array of strings
 *@returns {Array or string} same object type as passed in 
 */
export function trimBoth (val){
	if (Array.isArray(val)){
		return _.map(val,trimBoth);
	}
	if (typeof val === 'string') {
		return val.replace(/^\s*|\s*$/g,'');
	}
	return val;
}
/** Splits string into array, based on commas (ignoring commas between parenthesis) 
 * @param {string} str 
 * @returns {[string]} array of items
 */
export function splitByCommaIgnoreParens(str){
	var ret=[];
	if (!str) {return [];}
	ret = str.match(/((?:[^(),]|\([^()]*\))+)/g);
	ret = trimBoth(ret);
	return ret;
}
export function deleteRepeating(callback,section){
	var done = _.once(function(){
		if (typeof callback === "function"){
			callback();
		}
	});
	if(!section){
		done();
		return;
	}
	TAS.debug("SWUtils.deleteFeatures",section);
	getSectionIDs(section,function(ids){
		var prefix="repeating_"+section+"_";
		if(ids && _.size(ids)){
			ids.forEach(function(id) {
				TAS.debug("deleting "+prefix+id);
				removeRepeatingRow(prefix+id);
			});
			done();
		} else {
			done();
		}
	});
}


PFConsole.log( '   SWUtils module loaded          ' );
PFLog.modulecount++;
