const _ = require('underscore');
const on = require('../stubs/on');
/* //UNCOMMENT FOR JS LINT
console.log('%c•!!!!!!!!!!!!!!!!!!IF YOU SEE THIS YOU FORGOT TO UNCOMMENT THE TEST CODE FOR JS LINT!!!!!!!•', 'background: linear-gradient(to right,red,white,white,red); color:black;text-shadow: 0 0 8px white;');
var randomInteger = function () {'use strict';};
var getSectionIDs = function () {'use strict';};
var getTranslationByKey = function () {'use strict';};
var getAttrs = function () {'use strict';};
var setAttrs = function () {'use strict';};
var on = function () {'use strict';};
var removeRepeatingRow = function () {'use strict';};
var generateRowID = function () {'use strict';};
var _ = _ || (function () {'use strict';
return { dummy  : 0};
}());
/* ---- BEGIN: TheAaronSheet.js ---- */
// Github:   https://github.com/shdwjk/TheAaronSheet/blob/master/TheAaronSheet.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var performance = performance || {now:_.now};
var TAS = TAS || (function () {
 'use strict';
 var version = '0.2.4',
 lastUpdate = 1457098091,
 loggingSettings = {
   debug: {
     key: 'debug',
     title: 'DEBUG',
     color: {
       bgLabel: '#7732A2',
       label: '#F2EF40',
       bgText: '#FFFEB7',
       text: '#7732A2'
     }
   },
   error: {
     key: 'error',
     title: 'Error',
     color: {
       bgLabel: '#C11713',
       label: 'white',
       bgText: '#C11713',
       text: 'white'
     }
   },
   warn: {
     key: 'warn',
     title: 'Warning',
     color: {
       bgLabel: '#F29140',
       label: 'white',
       bgText: '#FFD8B7',
       text: 'black'
     }
   },
   info: {
     key: 'info',
     title: 'Info',
     color: {
       bgLabel: '#413FA9',
       label: 'white',
       bgText: '#B3B2EB',
       text: 'black'
     }
   },
   notice: {
     key: 'notice',
     title: 'Notice',
     color: {
       bgLabel: '#33C133',
       label: 'white',
       bgText: '#ADF1AD',
       text: 'black'
     }
   },
   log: {
     key: 'log',
     title: 'Log',
     color: {
       bgLabel: '#f2f240',
       label: 'black',
       bgText: '#ffff90',
       text: 'black'
     }
   },
   callstack: {
     key: 'TAS',
     title: 'function',
     color: {
       bgLabel: '#413FA9',
       label: 'white',
       bgText: '#B3B2EB',
       text: 'black'
     }
   },
   callstack_async: {
     key: 'TAS',
     title: 'ASYNC CALL',
     color: {
       bgLabel: '#413FA9',
       label: 'white',
       bgText: '#413FA9',
       text: 'white'
     }
   },
   TAS: {
     key: 'TAS',
     title: 'TAS',
     color: {
       bgLabel: 'grey',
       label: 'black;background:linear-gradient(#304352,#d7d2cc,#d7d2cc,#d7d2cc,#304352)',
       bgText: 'grey',
       text: 'black;background:linear-gradient(#304352,#d7d2cc,#d7d2cc,#d7d2cc,#304352)'
     }
   }
 },
 config = {
   debugMode: false,
   logging: {
     log: true,
     notice: true,
     info: true,
     warn: true,
     error: true,
     debug: false
   }
 },
 callstackRegistry = [],
 queuedUpdates = {}, //< Used for delaying saves till the last moment.
 complexType = function (o) {
   switch (typeof o) {
     case 'string':
       return 'string';
     case 'boolean':
       return 'boolean';
     case 'number':
       return (_.isNaN(o) ? 'NaN' : (o.toString().match(/\./) ? 'decimal' : 'integer'));
     case 'function':
       return 'function: ' + (o.name ? o.name + '()' : '(anonymous)');
     case 'object':
       return (_.isArray(o) ? 'array' : (_.isArguments(o) ? 'arguments' : (_.isNull(o) ? 'null' : 'object')));
     default:
       return typeof o;
   }
 },
 dataLogger = function (primaryLogger, secondaryLogger, data) {
   _.each(data, function (m) {
     var type = complexType(m);
     switch (type) {
       case 'string':
         primaryLogger(m);
         break;
       case 'undefined':
       case 'null':
       case 'NaN':
         primaryLogger('[' + type + ']');
         break;
       case 'number':
       case 'not a number':
       case 'integer':
       case 'decimal':
       case 'boolean':
         primaryLogger('[' + type + ']: ' + m);
         break;
       default:
         primaryLogger('[' + type + ']:=========================================');
         secondaryLogger(m);
         primaryLogger('=========================================================');
         break;
     }
   });
 },
 colorLog = function (options) {
   var coloredLoggerFunction,
   key = options.key,
   label = options.title || 'TAS',
   lBGColor = (options.color && options.color.bgLabel) || 'blue',
   lTxtColor = (options.color && options.color.label) || 'white',
   mBGColor = (options.color && options.color.bgText) || 'blue',
   mTxtColor = (options.color && options.color.text) || 'white';
   coloredLoggerFunction = function (message) {
     console.log('%c ' + label + ': %c ' + message + ' ', 'background-color: ' + lBGColor + ';color: ' + lTxtColor + '; font-weight:bold;', 'background-color: ' + mBGColor + ';color: ' + mTxtColor + ';');
   };
   return function () {
     if ('TAS' === key || config.logging[key]) {
       dataLogger(coloredLoggerFunction, function (m) {
         console.log(m);
       }, _.toArray(arguments));
     }
   };
 },
 logDebug = colorLog(loggingSettings.debug),
 logError = colorLog(loggingSettings.error),
 logWarn = colorLog(loggingSettings.warn),
 logInfo = colorLog(loggingSettings.info),
 logNotice = colorLog(loggingSettings.notice),
 logLog = colorLog(loggingSettings.log),
 log = colorLog(loggingSettings.TAS),
 logCS = colorLog(loggingSettings.callstack),
 logCSA = colorLog(loggingSettings.callstack_async),
 registerCallstack = function (callstack, label) {
   var idx = _.findIndex(callstackRegistry, function (o) {
     return (_.difference(o.stack, callstack).length === _.difference(callstack, o.stack).length) && _.difference(o.stack, callstack).length === 0 && o.label === label;
   });
   if (-1 === idx) {
     idx = callstackRegistry.length;
     callstackRegistry.push({
       stack: callstack,
       label: label
     });
   }
   return idx;
 },
 setConfigOption = function (options) {
   var newconf = _.defaults(options, config);
   newconf.logging = _.defaults(
   (options && options.logging) || {}, config.logging);
   config = newconf;
 },
 debugMode = function () {
   config.logging.debug = true;
   config.debugMode = true;
 },
 getCallstack = function () {
   var e = new Error('dummy'),
   stack = _.map(_.rest(e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n')), function (l) {
     return l.replace(/\s+.*$/, '');
   });
   return stack;
 },
 logCallstackSub = function (cs) {
   var matches,
   csa;
   _.find(cs, function (line) {
     matches = line.match(/TAS_CALLSTACK_(\d+)/);
     if (matches) {
       csa = callstackRegistry[matches[1]];
       logCSA('====================' + (csa.label ? '> ' + csa.label + ' <' : '') + '====================');
       logCallstackSub(csa.stack);
       return true;
     }
     logCS(line);
     return false;
   });
 },
 logCallstack = function () {
   var cs;
   if (config.debugMode) {
     cs = getCallstack();
     cs.shift();
     log('==============================> CALLSTACK <==============================');
     logCallstackSub(cs);
     log('=========================================================================');
   }
 },
 wrapCallback = function (label, callback, context) {
   var callstack;
   if ('function' === typeof label) {
     context = callback;
     callback = label;
     label = undefined;
   }
   if (!config.debugMode) {
     return (function (cb, ctx) {
       return function () {
         cb.apply(ctx || {}, arguments);
       };
     }
     (callback, context));
   }
   callstack = getCallstack();
   callstack.shift();
   return (function (cb, ctx, cs, lbl) {
     var ctxref = registerCallstack(cs, lbl);
     /*jshint -W054 */
     return new Function('cb', 'ctx', 'TASlog', "return function TAS_CALLSTACK_" + ctxref + "(){" + "TASlog('Entering: '+(cb.name||'(anonymous function)'));" + "var t0 = performance.now();cb.apply(ctx||{},arguments);var t1 = performance.now();" + "TASlog('Exiting: '+(cb.name||'(anonymous function)')+' (took '+Number(Math.round((t1-t0)+'e3')+'e-3')+' ms)');" + "};")(cb, ctx, log);
     /*jshint +W054 */
   }
   (callback, context, callstack, label));
 },
 prepareUpdate = function (attribute, value) {
   queuedUpdates[attribute] = value;
 },
 applyQueuedUpdates = function () {
   setAttrs(queuedUpdates);
   queuedUpdates = {};
 },
 namesFromArgs = function (args, base) {
   return _.chain(args).reduce(function (memo, attr) {
     if ('string' === typeof attr) {
       memo.push(attr);
     } else if (_.isArray(args) || _.isArguments(args)) {
       memo = namesFromArgs(attr, memo);
     }
     return memo;
   }, (_.isArray(base) && base) || []).uniq().value();
 },
 addId = function (obj, value) {
   Object.defineProperty(obj, 'id', {
     value: value,
     writeable: false,
     enumerable: false
   });
 },
 addProp = function (obj, prop, value, fullname) {
   (function () {
     var pname = (_.contains(['S', 'F', 'I', 'D'], prop) ? '_' + prop : prop),
     full_pname = fullname || prop,
     pvalue = value;
     _.each(['S', 'I', 'F'], function (p) {
       if (!_.has(obj, p)) {
         Object.defineProperty(obj, p, {
           value: {},
           enumerable: false,
           readonly: true
         });
       }
     });
     if (!_.has(obj, 'D')) {
       Object.defineProperty(obj, 'D', {
         value: _.reduce(_.range(10), function (m, d) {
           Object.defineProperty(m, d, {
             value: {},
             enumerable: true,
             readonly: true
           });
           return m;
         }, {}),
         enumerable: false,
         readonly: true
       });
     }
     // Raw value
     Object.defineProperty(obj, pname, {
       enumerable: true,
       set: function (v) {
         if (v !== pvalue) {
           pvalue = v;
           prepareUpdate(full_pname, v);
         }
       },
       get: function () {
         return pvalue;
       }
     });
     // string value
     Object.defineProperty(obj.S, pname, {
       enumerable: true,
       set: function (v) {
         var val = v.toString();
         if (val !== pvalue) {
           pvalue = val;
           prepareUpdate(full_pname, val);
         }
       },
       get: function () {
         return pvalue.toString();
       }
     });
     // int value
     Object.defineProperty(obj.I, pname, {
       enumerable: true,
       set: function (v) {
         var val = parseInt(v, 10) || 0;
         if (val !== pvalue) {
           pvalue = val;
           prepareUpdate(full_pname, val);
         }
       },
       get: function () {
         return parseInt(pvalue, 10) || 0;
       }
     });
     // float value
     Object.defineProperty(obj.F, pname, {
       enumerable: true,
       set: function (v) {
         var val = parseFloat(v) || 0;
         if (val !== pvalue) {
           pvalue = val;
           prepareUpdate(full_pname, val);
         }
       },
       get: function () {
         return parseFloat(pvalue) || 0;
       }
     });
     _.each(_.range(10), function (d) {
       Object.defineProperty(obj.D[d], pname, {
         enumerable: true,
         set: function (v) {
           var val = (parseFloat(v) || 0).toFixed(d);
           if (val !== pvalue) {
             pvalue = val;
             prepareUpdate(full_pname, val);
           }
         },
         get: function () {
           return (parseFloat(pvalue) || 0).toFixed(d);
         }
       });
     });
   }
   ());
 },
 repeating = function (section) {
   return (function (s) {
     var sectionName = s,
     attrNames = [],
     fieldNames = [],
     operations = [],
     after = [],
     repAttrs = function TAS_Repeating_Attrs() {
       attrNames = namesFromArgs(arguments, attrNames);
       return this;
     },
     repFields = function TAS_Repeating_Fields() {
       fieldNames = namesFromArgs(arguments, fieldNames);
       return this;
     },
     repReduce = function TAS_Repeating_Reduce(func, initial, final, context) {
       operations.push({
         type: 'reduce',
         func: (func && _.isFunction(func) && func) || _.noop,
         memo: (_.isUndefined(initial) && 0) || initial,
         final: (final && _.isFunction(final) && final) || _.noop,
         context: context || {}
       });
       return this;
     },
     repMap = function TAS_Repeating_Map(func, final, context) {
       operations.push({
         type: 'map',
         func: (func && _.isFunction(func) && func) || _.noop,
         final: (final && _.isFunction(final) && final) || _.noop,
         context: context || {}
       });
       return this;
     },
     repEach = function TAS_Repeating_Each(func, final, context) {
       operations.push({
         type: 'each',
         func: (func && _.isFunction(func) && func) || _.noop,
         final: (final && _.isFunction(final) && final) || _.noop,
         context: context || {}
       });
       return this;
     },
     repTap = function TAS_Repeating_Tap(final, context) {
       operations.push({
         type: 'tap',
         final: (final && _.isFunction(final) && final) || _.noop,
         context: context || {}
       });
       return this;
     },
     repAfter = function TAS_Repeating_After(callback, context) {
       after.push({
         callback: (callback && _.isFunction(callback) && callback) || _.noop,
         context: context || {}
       });
       return this;
     },
     repExecute = function TAS_Repeating_Execute(callback, context) {
       var rowSet = {},
       attrSet = {},
       fieldIds = [],
       fullFieldNames = [];
       repAfter(callback, context);
       // call each operation per row.
       // call each operation's final
       getSectionIDs("repeating_" + sectionName, function (ids) {
         fieldIds = ids;
         fullFieldNames = _.reduce(fieldIds, function (memo, id) {
           return memo.concat(_.map(fieldNames, function (name) {
             return 'repeating_' + sectionName + '_' + id + '_' + name;
           }));
         }, []);
         getAttrs(_.uniq(attrNames.concat(fullFieldNames)), function (values) {
           _.each(attrNames, function (aname) {
             if (values.hasOwnProperty(aname)) {
               addProp(attrSet, aname, values[aname]);
             }
           });
           rowSet = _.reduce(fieldIds, function (memo, id) {
             var r = {};
             addId(r, id);
             _.each(fieldNames, function (name) {
               var fn = 'repeating_' + sectionName + '_' + id + '_' + name;
               addProp(r, name, values[fn], fn);
             });
             memo[id] = r;
             return memo;
           }, {});
           _.each(operations, function (op) {
             var res;
             switch (op.type) {
               case 'tap':
                 _.bind(op.final, op.context, rowSet, attrSet)();
                 break;
               case 'each':
                 _.each(rowSet, function (r) {
                   _.bind(op.func, op.context, r, attrSet, r.id, rowSet)();
                 });
                 _.bind(op.final, op.context, rowSet, attrSet)();
                 break;
               case 'map':
                 res = _.map(rowSet, function (r) {
                   return _.bind(op.func, op.context, r, attrSet, r.id, rowSet)();
                 });
                 _.bind(op.final, op.context, res, rowSet, attrSet)();
                 break;
               case 'reduce':
                 res = op.memo;
                 _.each(rowSet, function (r) {
                   res = _.bind(op.func, op.context, res, r, attrSet, r.id, rowSet)();
                 });
                 _.bind(op.final, op.context, res, rowSet, attrSet)();
                 break;
             }
           });
           // finalize attrs
           applyQueuedUpdates();
           _.each(after, function (op) {
             _.bind(op.callback, op.context)();
           });
         });
       });
     };
     return {
       attrs: repAttrs,
       attr: repAttrs,
       column: repFields,
       columns: repFields,
       field: repFields,
       fields: repFields,
       reduce: repReduce,
       inject: repReduce,
       foldl: repReduce,
       map: repMap,
       collect: repMap,
       each: repEach,
       forEach: repEach,
       tap: repTap,
       'do': repTap,
       after: repAfter,
       last: repAfter,
       done: repAfter,
       execute: repExecute,
       go: repExecute,
       run: repExecute
     };
   }
   (section));
 },
 repeatingSimpleSum = function (section, field, destination) {
   repeating(section).attr(destination).field(field).reduce(function (m, r) {
     return m + (r.F[field]);
   }, 0, function (t, r, a) {
     a.S[destination] = t;
   }).execute();
 };
 console.log('%c•.¸¸.•*´¨`*•.¸¸.•*´¨`*•.¸  The Aaron Sheet  v' + version + '  ¸.•*´¨`*•.¸¸.•*´¨`*•.¸¸.•', 'background: linear-gradient(to right,green,white,white,green); color:black;text-shadow: 0 0 8px white;');
 console.log('%c•.¸¸.•*´¨`*•.¸¸.•*´¨`*•.¸  Last update: ' + (new Date(lastUpdate * 1000)) + '  ¸.•*´¨`*•.¸¸.•*´¨`*•.¸¸.•', 'background: linear-gradient(to right,green,white,white,green); color:black;text-shadow: 0 0 8px white;');
 return {
   /* Repeating Sections */
   repeatingSimpleSum: repeatingSimpleSum,
   repeating: repeating,
   /* Configuration */
   config: setConfigOption,
   /* Debugging */
   callback: wrapCallback,
   callstack: logCallstack,
   debugMode: debugMode,
   _fn: wrapCallback,
   /* Logging */
   debug: logDebug,
   error: logError,
   warn: logWarn,
   info: logInfo,
   notice: logNotice,
   log: logLog
 };
}());
/* ---- END: TheAaronSheet.js ---- */
TAS.config({
 logging: {
   info: true,
   debug: true
 }
});
TAS.debugMode();
var PFLog = {
 // PFLog just a little helper to write to console using fancy type
 l: '%cס§₪₪₪₪§|(Ξ≥≤≥≤≥≤ΞΞΞΞΞΞΞΞΞΞ>    ',
 r: '    <ΞΞΞΞΞΞΞΞΞΞ≥≤≥≤≥≤Ξ)|§₪₪₪₪§ס',
 bg: 'background: linear-gradient(to right,green,white,white,green); color:black;text-shadow: 0 0 8px white;',
 modulecount: 0
};
var ExExp = ExExp || (function () {
 'use strict';
 var rollOperator,
 parseExpression = function (s, until) {
   var untilCb = (typeof until === "function" ? until : function (tok) {
     return (tok == until);
   })
   // constants
   ,
   ARG_COUNTS = {
     'abs': 1,
     'ceil': 1,
     'floor': 1,
     'round': 1,
     'max': [1],
     'min': [1]
   },
   BINARY_PRECEDENCE = {
     '?': 1,
     ':': 2,
     '||': 3,
     '&&': 4,
     '|': 5,
     '^': 6,
     '&': 7,
     '=': 8,
     '==': 8,
     '!=': 8,
     '>=': 9,
     '>': 9,
     '<': 9,
     '<=': 9,
     '<<': 10,
     '>>': 10,
     '+': 11,
     '-': 11,
     '*': 12,
     '/': 12,
     '%': 12,
     '**': 14,
     't': 98,
     'd': 99
   },
   UNARY_PRECEDENCE = {
     '!': 13,
     '~': 13,
     '-': 13
   },
   CLOSERS = {
     '(': ")",
     '{': "}"
   }
   // local variables
   ,
   operators = [{
     'precedence': 0
   }],
   operands = [],
   tableExp,
   m,
   err,
   operand;
   // helper functions
   function getToken(s) {
     var m;
     if (!s) {
       return s;
     }

     function retVal(tokType, matchObj) {
       return {
         'type': tokType,
         'text': matchObj[0],
         'match': matchObj
       };
     }
     m = s.match(/^\s+/);
     if (m) {
       return retVal("whitespace", m);
     }
     m = s.match(/^(abs|ceil|floor|round|max|min)[(]/);
     if (m) {
       return retVal("function", m);
     }
     m = s.match(/^[({]/);
     if (m) {
       return retVal("opengroup", m);
     }
     m = s.match(/^[)}]/);
     if (m) {
       return retVal("closegroup", m);
     }
     m = s.match(/^((\d+(\.\d+)?)|(\.\d+))/);
     if (m) {
       return retVal("number", m);
     }
     m = s.match(/^['"]/);
     if (m) {
       return retVal("quote", m);
     }
     m = s.match(/^((\|\|)|(&&)|(==)|(!=)|(>=)|(<=)|(<<)|(>>)|(\*\*)|[?:|\^&=><%!~])/);
     if (m) {
       return retVal("extoperator", m);
     }
     m = s.match(/^[\-+*\/td]/);
     if (m) {
       return retVal("baseoperator", m);
     }
     m = s.match(/^\[([^\]]+)\]/);
     if (m) {
       return retVal("label", m);
     }
     m = s.match(/^\$\{([^'"\($\}][^}]*)\}/);
     if (m) {
       return retVal("variable", m);
     }
     m = s.match(/^\$\{/);
     if (m) {
       return retVal("openvariable", m);
     }
     return {
       'type': "raw",
       'text': s.charAt(0)
     };
   }

   function popToken(state) {
     state.tok = getToken(state.s);
     if (state.tok) {
       state.s = state.s.substring(state.tok.text.length);
     }
     return state;
   }

   function popString(state, delim) {
     var i = -1,
     j = i,
     retval;
     // find first index of delim not preceded by an odd number of backslashes
     while (((i - j) & 1) === 0) {
       i = state.s.indexOf(delim, i + 1);
       if (i < 0) {
         return;
       }
       j = i - 1;
       while ((j >= 0) && (state.s.charAt(j) === '\\')) {
         j--;
       }
     }
     // unescape string to be returned
     function replaceEscapes(s) {
       return s.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\/g, "");
     }
     retval = state.s.substring(0, i).split("\\\\").map(replaceEscapes).join("\\");
     // point state delim, then pop off the delimiter token
     state.s = state.s.substring(i);
     popToken(state);
     return retval;
   }

   function popOperator() {
     var op = operators.pop(),
     right = operands.pop(),
     left,
     cond,
     datatype;
     if (op.unary) {
       operands.push({
         'type': (op.type === "baseoperator" ? "unop" : "unopex"),
         'datatype': right.datatype,
         'operator': op.text,
         'operand': right
       });
       return;
     }
     left = operands.pop();
     if (op.text !== ":") {
       if (op.text === "d" || op.text === "t") {
         datatype = "number";
       } else if (left.datatype === right.datatype) {
         datatype = left.datatype;
       } else if ((left.datatype === "string") || (right.datatype === "string")) {
         datatype = "string";
       }
       operands.push({
         'type': (op.type === "baseoperator" ? "binop" : "binopex"),
         'datatype': datatype,
         'operator': op.text,
         'left': left,
         'right': right,
         'mods': op.mods,
         'label': op.label
       });
       return;
     }
     op = operators.pop();
     if (op.text !== "?") {
       return "Error: Expected ? but got " + op.text;
     }
     cond = operands.pop();
     operands.push({
       'type': "cond",
       'cond': cond,
       'left': left,
       'right': right,
       'datatype': (left.datatype === right.datatype ? left.datatype : undefined)
     });
   }

   function pushOperator(op) {
     var err;
     op.precedence = (op.unary ? UNARY_PRECEDENCE[op.text] : BINARY_PRECEDENCE[op.text]) || 0;
     while (operators[operators.length - 1].precedence >= op.precedence) {
       err = popOperator();
       if (err) {
         return err;
       }
     }
     operators.push(op);
   }

   function argListUntil(tok) {
     return (tok === ',') || (tok === ')');
   }

   function parseHelper() {
     var err,
     func,
     argCounts,
     minArgs,
     maxArgs,
     str,
     args,
     argTree,
     opener,
     closer,
     operand,
     varExp;
     popToken(s);
     if (!s.tok) {
       return "Error: Unrecognized token: " + s.s.split(" ", 1)[0];
     }
     while (s.tok.type === "whitespace") {
       popToken(s);
       if (!s.tok) {
         return "Error: Unrecognized token: " + s.s.split(" ", 1)[0];
       }
     }
     switch (s.tok.type) {
       case "function":
         func = s.tok.match[1];
         argCounts = ARG_COUNTS[func];
         if (argCounts === undefined) {
           return "Error: Unrecognized function: " + func;
         }
         if (Array.isArray(argCounts)) {
           minArgs = argCounts[0];
           maxArgs = argCounts[1];
         } else {
           minArgs = argCounts;
           maxArgs = argCounts;
         }
         args = [];
         while ((s.tok) && (s.tok.text !== ')')) {
           argTree = parseExpression(s, argListUntil);
           if (typeof (argTree) === "string") {
             return argTree;
           } // error
           args.push(argTree);
           if (!s.tok) {
             return "Error: Unterminated function: " + func;
           }
           if (!argListUntil(s.tok.text)) {
             return "Error: Expected ',' or ')' to continue/close '" + func + "(', but got '" + s.tok.text + "'";
           }
         }
         if (minArgs < 0) {
           minArgs = args.length;
         }
         if (isNaN(maxArgs) || maxArgs < 0) {
           maxArgs = args.length;
         }
         if (args.length < minArgs) {
           return "Error: Function '" + func + "' requires at least " + minArgs + " argument(s)";
         }
         if (args.length > maxArgs) {
           return "Error: Function '" + func + "' requires at most " + maxArgs + " argument(s)";
         }
         operands.push({
           'type': "function",
           'datatype': "number",
           'function': func,
           'args': args
         });
         return;
       case "number":
         operands.push({
           'type': "number",
           'datatype': "number",
           'value': parseFloat(s.tok.text)
         });
         return;
       case "variable":
         operands.push({
           'type': "variable",
           'value': s.tok.match[1]
         });
         return;
       case "quote":
         str = popString(s, s.tok.text);
         if (typeof (str) !== "string") {
           return "Error: Unterminated string";
         }
         operands.push({
           'type': "string",
           'datatype': "string",
           'value': str
         });
         return;
       case "opengroup":
         opener = s.tok.text;
         closer = CLOSERS[opener];
         operand = parseExpression(s, closer);
         if (typeof (operand) === "string") {
           return operand;
         } // error
         operands.push(operand);
         if (s.tok.text !== closer) {
           return "Error: Expected '" + closer + "' to close '" + opener + "', but got '" + s.tok.text + "'";
         }
         return;
       case "openvariable":
         varExp = parseExpression(s, "}");
         if (typeof (varExp) === "string") {
           return varExp;
         } // error
         if (s.tok.text !== "}") {
           return "Error: Expected '}' to close '${', but got '" + s.tok.text + "'";
         }
         operands.push({
           'type': "variable",
           'value': varExp
         });
         return;
       case "extoperator":
       case "baseoperator":
         if (!UNARY_PRECEDENCE[s.tok.text]) {
           return "Error: " + s.tok.text + " is not a unary operator";
         }
         s.tok.unary = true;
         err = pushOperator(s.tok);
         if (err) {
           return err;
         }
         return parseHelper();
     }
     return "Error: Unrecognized token: " + s.tok.text + (s.tok.type === "raw" ? s.s.split(" ", 1)[0] : "");
   }
   // if we were given a string, construct a state object
   if (typeof (s) === "string") {
     s = {
       's': s
     };
   }
   // push operators and operands to their respective stacks, building sub-ASTs in the operand stack as needed
   err = parseHelper();
   if (err) {
     return err;
   }
   for (popToken(s) ;
   (s.tok) && (!untilCb(s.tok.text)) && ((until) || (s.tok.type !== "raw")) ; popToken(s)) {
     switch (s.tok.type) {
       case "extoperator":
       case "baseoperator":
         rollOperator = (s.tok.text === "d" ? s.tok : null);
         err = pushOperator(s.tok);
         if (err) {
           return err;
         }
         if ((rollOperator) && (s.s.charAt(0) === 'F')) {
           operands.push({
             'type': "rollspec",
             'value': "F"
           });
           s.s = s.s.substring(1);
         } else if (s.tok.text === "t") {
           if (s.s.charAt(0) !== '[') {
             return "Error: 't' operator requires '[table]' argument";
           }
           m = s.s.match(/^\[([^'"$(\]][^\]]*)\]/);
           if (m) {
             tableExp = m[1];
             s.s = s.s.substring(m[0].length);
           } else {
             s.s = s.s.substring(1);
             tableExp = parseExpression(s, "]");
             if (typeof (tableExp) === "string") {
               return tableExp;
             } // error
             if (s.tok.text !== "]") {
               return "Error: Expected ']' to close 't[', but got '" + s.tok.text + "'";
             }
           }
           operands.push({
             'type': "tablename",
             'value': tableExp
           });
         } else {
           err = parseHelper();
           if (err) {
             return err;
           }
         }
         if (rollOperator) {
           m = s.s.match(/^[acdfhkloprs0-9<=>!]+/);
           if (m) {
             rollOperator.mods = m[0];
             s.s = s.s.substring(m[0].length);
           }
         }
         break;
       case "label":
         if ((operators.length > 0) && (operators[operators.length - 1].text === "d")) {
           // set label on "d" operator instead of operand (e.g. "1d6[foo]" is "(1d6)[foo]", not "1d(6[foo])")
           operators[operators.length - 1].label = s.tok.match[1];
           break;
         }
         operand = operands.pop();
         if (operand) {
           operand.label = s.tok.match[1];
           operands.push(operand);
         }
         break;
     }
   }
   // no more input; collapse remaining operators and operands into a single AST
   while (operators.length > 1) {
     err = popOperator();
     if (err) {
       return err;
     }
   }
   return operands.pop();
 },
 write = function (s) {
   TAS.debug("EXEXP:" + s);
 },
 sendCommand = function (chunks, asts, evalResults, labels) {
   //infinite loop
   //TAS.debug("at sendCommand");
   //TAS.debug(chunks, asts, evalResults, labels);
   // constants
   var FUNCTION_FUNCTIONS = {
     'abs': Math.abs,
     'ceil': Math.ceil,
     'floor': Math.floor,
     'round': Math.round,
     'max': Math.max,
     'min': Math.min
   },
   BINARY_FUNCTIONS = {
     '||': function (x, y) {
       return x || y;
     },
     '&&': function (x, y) {
       return x && y;
     },
     '|': function (x, y) {
       return x | y;
     },
     '^': function (x, y) {
       return x ^ y;
     },
     '&': function (x, y) {
       return x & y;
     },
     '=': function (x, y) {
       return x == y;
     },
     '==': function (x, y) {
       return x == y;
     },
     '!=': function (x, y) {
       return x != y;
     },
     '>=': function (x, y) {
       return x >= y;
     },
     '>': function (x, y) {
       return x > y;
     },
     '<': function (x, y) {
       return x < y;
     },
     '<=': function (x, y) {
       return x <= y;
     },
     '<<': function (x, y) {
       return x << y;
     },
     '>>': function (x, y) {
       return x >> y;
     },
     '+': function (x, y) {
       return x + y;
     },
     '-': function (x, y) {
       return x - y;
     },
     '*': function (x, y) {
       return x * y;
     },
     '/': function (x, y) {
       return x / y;
     },
     '%': function (x, y) {
       return x % y;
     },
     '**': Math.pow,
     'd': function (x, y) {
       var retval = 0,
       i = 0;
       for (i = 0; i < x; i++) {
         retval += randomInteger(y);
       }
       return retval;
     }
   },
   UNARY_FUNCTIONS = {
     '!': function (x) {
       return !x;
     },
     '~': function (x) {
       return ~x;
     },
     '-': function (x) {
       return -x;
     }
   }
   // local variables
   ,
   references = {},
   unevalRefs = [],
   evalReqs = [],
   i = 0,
   t,
   err,
   doSubstitution = false,
   label,
   newUneval = [],
   r,
   retval;
   // helper functions
   function lazyEval(t, labels, references, unevalRefs, evalReqs, force) {
     //alert(' at lazyEval, t: ' + t + ', t.type:'+t.type);
     var x,
     y,
     args = [],
     i = 0,
     forceSubtrees;
     if (t.label) {
       labels[t.label] = t;
     }
     switch (t.type) {
       case "number":
       case "rollspec":
         t.baseValid = true;
         return t;
       case "string":
         return t;
       case "tablename":
         if (typeof (t.value) !== "string") {
           x = lazyEval(t.value, labels, references, unevalRefs, evalReqs, true);
           if (typeof (x) === "string") {
             return x;
           } // error
           if (x.type === "number") {
             // number node; coerce to string
             x.value = String(x.value);
             x.type = "string";
           }
           if (x.type !== "string") {
             // unable to fully evaluate table name
             if (t.baseValid) {
               t.baseValid = false;
             }
             unevalRefs.push(t.value);
             return t;
           }
           // successfully evaluated table name
           t.value = x.value;
         }
         // if we got here, t.value is the name of a rollable table
         t.baseValid = true;
         return t;
       case "function":
         for (i = 0; i < t.args.length; i++) {
           x = lazyEval(t.args[i], labels, references, unevalRefs, evalReqs, true);
           if (typeof (x) === "string") {
             return x;
           } // error
           if (x.type === "string") {
             x.value = parseFloat(x.value);
             x.type = "number";
           }
           if (x.type !== "number") {
             // unable to fully evaluate argument
             if (t.baseValid) {
               t.baseValid = false;
             }
             return t;
           }
           args.push(x.value);
         }
         // successfully evaluated all arguments
         t.type = "number";
         t.datatype = "number";
         t.value = FUNCTION_FUNCTIONS[t["function"]].apply(args, args);
         for (i = 0; i < t.args.length; i++) {
           if (t.args[i].label) {
             labels[t.args[i].label] = t.args[i];
           }
         }
         delete t["function"];
         delete t.args;
         t.baseValid = true;
         return t;
       case "unop":
       case "unopex":
         force = force || (t.type !== "unop");
         x = lazyEval(t.operand, labels, references, unevalRefs, evalReqs, force);
         if (typeof (x) === "string") {
           return x;
         } // error
         if (force) {
           if (x.type !== "number") {
             // unable to fully evaluate operand
             if (t.baseValid) {
               t.baseValid = false;
             }
             return t;
           }
           // successfully evaluated operand
           t.type = "number";
           t.datatype = "number";
           t.value = UNARY_FUNCTIONS[t.operator](x.value);
           delete t.operator;
           if (t.operand.label) {
             labels[t.operand.label] = x;
           }
           delete t.operand;
           t.baseValid = true;
         } else {
           t.baseValid = x.baseValid;
         }
         return t;
       case "binop":
       case "binopex":
         force = force || (t.type !== "binop") || (t.left.datatype === "string") || (t.right.datatype === "string");
         forceSubtrees = force || (t.operator === "d") || (t.operator === "t");
         //TAS.debug('left is: ' + t.left + ', right is:' + t.right);
         x = lazyEval(t.left, labels, references, unevalRefs, evalReqs, forceSubtrees);
         y = lazyEval(t.right, labels, references, unevalRefs, evalReqs, forceSubtrees);
         //TAS.debug(x);
         //TAS.debug(y);
         force = true;
         /*********************didn't work until i commented out, now seems to have no effect ********************************/
         if (typeof x === "string") {
           //TAS.debug(x);
           return x;
         } // error
         if (typeof y === "string") {
           //TAS.debug(y);
           return y;
         } // error
         /****************************************************/
         if (force) {
           if ((x.type !== "number") && (x.type !== "string")) {
             // unable to fully evaluate left operand
             if (t.baseValid) {
               t.baseValid = false;
             }
             return t;
           }
           if ((y.type !== "number") && (y.type !== "string") && (y.type !== "rollspec") && (y.type !== "tablename")) {
             // unable to fully evaluate right operand
             if (t.baseValid) {
               t.baseValid = false;
             }
             return t;
           }
           if ((y.type === "rollspec") && (t.operator !== "d")) {
             return "Rollspec operand is only compatible with 'd' operator";
           }
           if ((t.operator === "t") && (y.type !== "tablename")) {
             return "'t' operator requires tablename operand";
           }
           // successfully evaluated both operands
           if ((t.operator === "t") || ((t.operator === "d") && (t.mods))) {
             // operator is rollable table or is roll with mods; must submit to base system for evaluation
             evalReqs.push(t);
             return t;
           }
           //TAS.debug('about to call binary');
           t.value = BINARY_FUNCTIONS[t.operator](x.value, y.value);
           delete t.operator;
           if (t.left.label) {
             labels[t.left.label] = x;
           }
           delete t.left;
           if (t.right.label) {
             labels[t.right.label] = y;
           }
           delete t.right;
           t.type = (typeof (t.value) === "string" ? "string" : "number");
           t.datatype = t.type;
           t.baseValid = (t.datatype === "number");
         } else if ((x.datatype === "number") && (y.datatype === "number")) {
           t.datatype = "number";
           t.baseValid = true;
         }
         return t;
       case "cond":
         x = lazyEval(t.cond, labels, references, unevalRefs, evalReqs, true);
         if (typeof (x) === "string") {
           return x;
         } // error
         if ((x.type !== "number") && (x.type !== "string")) {
           // unable to fully evaluate condition
           t.baseValid = false;
           return t;
         }
         // successfully evaluated condition; replace t with t.left or t.right as appropriate
         y = (x.value ? t.left : t.right);
         if (t.cond.label) {
           labels[t.cond.label] = x;
         }
         delete t.cond;
         delete t.left;
         delete t.right;
         _.each(y, function (k) {
           t[k] = y[k];
         });
         return lazyEval(t, labels, references, unevalRefs, evalReqs, force);
       case "variable":
         if (typeof (t.value) !== "string") {
           x = lazyEval(t.value, labels, references, unevalRefs, evalReqs, true);
           if (typeof (x) === "string") {
             return x;
           } // error
           if (x.type === "number") {
             // number node; coerce to string
             x.value = String(x.value);
             x.type = "string";
           }
           if (x.type !== "string") {
             // unable to fully evaluate variable name
             if (t.baseValid) {
               t.baseValid = false;
             }
             unevalRefs.push(t.value);
             return t;
           }
           // successfully evaluated variable name
           t.value = x.value;
         }
         // if we got here, t.value is the name of a variable
         if ((labels[t.value]) && ((labels[t.value].type === "string") || (labels[t.value].type === "number"))) {
           // variable exists and has been fully evaluated
           t.type = labels[t.value].type;
           t.datatype = labels[t.value].datatype;
           t.baseValid = labels[t.value].baseValid;
           t.value = labels[t.value].value;
         } else {
           // variable not yet defined or not yet fully evaluated
           if (!references[t.value]) {
             references[t.value] = [];
           }
           references[t.value].push(t);
           if (t.baseValid) {
             t.baseValid = false;
           }
         }
         return t;
       default:
         return "Unknown node type: " + t.type;
     }
   }

   function hasUnevaluatedLabels(t) {
     var i = 0;
     // base types: fully evaluated
     if ((t.type === "number") || (t.type === "string") || (t.type === "rollspec")) {
       return false;
     }
     // if we got here, node is unevaluated
     if (t.label) {
       return true;
     }
     // node has no label; check children
     switch (t.type) {
       case "function":
         for (i = 0; i < t.args.length; i++) {
           if (hasUnevaluatedLabels(t.args[i])) {
             return true;
           }
         }
         return false;
       case "tablename":
       case "variable":
         if (typeof (t.value) === "string") {
           return false;
         }
         return hasUnevaluatedLabels(t.value);
       case "unop":
       case "unopex":
         return hasUnevaluatedLabels(t.operand);
       case "cond":
         if (hasUnevaluatedLabels(t.cond)) {
           return true;
         }
         //don't fall through
         if (hasUnevaluatedLabels(t.left)) {
           return true;
         }
         return hasUnevaluatedLabels(t.right);
       case "binop":
       case "binopex":
         if (hasUnevaluatedLabels(t.left)) {
           return true;
         }
         return hasUnevaluatedLabels(t.right);
     }
   }

   function flattenAST(t) {
     var retval;
     switch (t.type) {
       case "number":
       case "rollspec":
         retval = t.value || 0;
         break;
       case "tablename":
         retval = "[" + t.value + "]";
         break;
       case "unop":
         retval = "(" + t.operator + flattenAST(t.operand) + ")";
         break;
       case "binop":
         retval = "(" + flattenAST(t.left) + t.operator + flattenAST(t.right) + (t.mods || "") + ")";
         if ((t.label) && (t.operator === "d")) {
           retval += "[" + t.label + "]";
         }
         break;
       default:
         return "Unknown node type: " + t.type;
     }
     return retval;
   }

   function astToCmd(t) {
     if (t.type === "string") {
       return t.value;
     }
     var retval = flattenAST(t);
     return retval;
   }

   function reportError(err) {
     ExExp.write("Error: " + err);
     return "";
   }
   //BEGIN
   // substitute in results of base evaluation
   for (i = 0; i < evalResults.length; i++) {
     t = evalResults[i][0];
     delete t.operator;
     delete t.left;
     delete t.right;
     t.type = "number";
     t.datatype = "number";
     t.value = evalResults[i][1];
     t.baseValid = true;
   }
   // traverse ASTs, collapsing as much as possible
   for (i = 0; i < asts.length; i++) {
     if (asts[i].baseValid) {
       continue;
     } // can be handled by base expression evaluator
     if ((asts[i].type === "string") || (asts[i].type === "number")) {
       continue;
     } // tree is fully evaluated
     err = lazyEval(asts[i], labels, references, unevalRefs, evalReqs, false);
     if (typeof (err) === "string") {
       return reportError(err);
     }
   }
   // do variable substitution; repeat until we don't make any more progress
   doSubstitution = true;
   while (doSubstitution) {
     doSubstitution = false;
     // substitute in values for variables for which we already have names
     for (label in references) {
       if (references.hasOwnProperty(label)) {
         if (!labels[label]) {
           return reportError("Variable '" + label + "' not defined");
         }
         if ((labels[label].type !== "string") && (labels[label].type !== "number")) {
           // variable exists but not yet evaluated; try to evaluate
           err = lazyEval(labels[label], labels, references, unevalRefs, evalReqs, true);
           if (typeof (err) === "string") {
             return reportError(err);
           }
         } else if ((labels[label].type === "string") || (labels[label].type === "number")) {
           // variable fully evaluated; substitute it in
           for (i = 0; i < references[label].length; i++) {
             references[label][i].type = labels[label].type;
             references[label][i].datatype = labels[label].datatype;
             references[label][i].value = labels[label].value;
             references[label][i].baseValid = labels[label].baseValid;
           }
           delete references[label];
           doSubstitution = true;
         }
       }
     }
     // try to get names for variables and tables with unevaluated names
     while (unevalRefs.length > 0) {
       r = lazyEval(unevalRefs.shift(), labels, references, unevalRefs, evalReqs, true);
       if (typeof (r) === "string") {
         return reportError(err);
       }
       if ((r.type === "string") || (r.type === "number")) {
         doSubstitution = true;
       } else {
         newUneval.push(r);
       }
     }
     unevalRefs = newUneval;
   }
   // flatten fully evaluated ASTs into strings and splice into chunks
   for (i = asts.length - 1; i >= 0; i--) {
     if ((!asts[i].baseValid) && (asts[i].type !== "number") && (asts[i].type !== "string")) {
       continue;
     }
     if ((unevalRefs.length > 0) & (hasUnevaluatedLabels(asts[i]))) {
       continue;
     }
     chunks.splice(i, 2, (chunks[i] || "") + astToCmd(asts.splice(i, 1)[0]) + (chunks[i + 1] || ""));
   }
   if (evalReqs.length > 0) {
     TAS.error("Cannot evaluate");
     return "";
   }
   if (asts.length > 0) {
     // need to finish evaluating some ASTs; recurse directly
     //TAS.debug("sendCommand (recurse), asts.length=" + asts.length + ", asts[0].baseValid=" + asts[0].baseValid + ", asts[0].type=" + asts[0].type);
     if (!(asts.length === 1 && asts[0].type === "binop")) {
       // HACK! minus (probably) in front; no math needed
       return sendCommand(chunks, asts, [], labels);
     }
   }
   // if we got here, we're done evaluating everything; submit results
   retval = chunks.join("");
   return retval;
 },
 handleExpression = function (msg) {
   //replace spaces. replace "-" in front with "0-", replace "(-" with "(0-"
   //also replace leading + with '', and replace (+  with (0+
   var chunks = [],
   asts = [],
   cmd,
   state,
   ast;
   msg = msg.replace(/\s/g, '').replace(/^-/, '0-').replace(/\(-/g, '(0-').replace(/^\+/, '').replace(/\(\+/g, '(0+');
   cmd = msg;
   state = {
     's': cmd
   };
   //TAS.debug(msg);
   ast = parseExpression(state, null);
   //TAS.debug(ast);
   if (typeof (ast) === "string") {
     ExExp.write("could not parse" + msg);
     return "";
   }
   asts.push(ast);
   state.s = (state.tok) ? (state.tok.text + state.s) : state.s;
   //  ((state.tok || {'text': ""}).text || "") + state.s;
   chunks.push(state.s);
   return sendCommand(chunks, asts, [], {});
 };
 console.log(PFLog.l + '   ExExp module loaded            ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   write: write,
   handleExpression: handleExpression
 };
}());
var SWUtils = SWUtils || (function () {
 'use strict';
 /* for interaction with ExExp, and some basic utils that have nothing to do with Pathfinder rules. */
 /** Determines if string can be evaluated to a number
 * ensures:  no macro calls, dropdowns, or keep highest/lowest more than 1
 * allows: floor, abs, kh1, kl1,  ceil, round, max, min
 *@param {string} preeval string to examine
 *@returns {bool} true if string will evaluate to a number.
 */
 var validNumericStr = function (preeval) {
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
 },
 /** searches a string for @{attribute} and replaces those with their values, passes result to the callback
 * if error then passes null
 * @param {string} stringToSearch = string containing one or more @{fieldname}
 * @param {function(string)} callback when done passes resultant string to callback
 */
 findAndReplaceFields = function (stringToSearch, callback) {
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
         TAS.error("findAndReplaceFields", err2);
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
     TAS.error("findAndReplaceFields", err);
     callback(null);
   }
 },
 /** Replaces kl1 and kh1 with min and max
 * example: replaces {x,y}kh1 with min(x,y)
 * @param {string} str the string to search
 * @returns {string} the resultant string after performing the replace
 */
 convertKL1KH1toMinMax = function (str) {
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
 },
 /** Reads in the string, evaluates it to a single number, passes that number to a callback
 * calls callback with: the number, 0 (if exprStr empty), or null if an error is encountered
 *@param {string} exprStr A string containing a mathematical expression, possibly containing references to fields such as @{myfield}
 *@param {function(Number)} callback a function taking one parameter - could be int or float
 */
 evaluateExpression = function (exprStr, callback) {
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
 },
 /** evaluateAndSetNumber
  * Examines the string in readField, and tests to see if it is a number
  * if it's a number immediately write it to writeField.
  * if not, then replace any @{field} references with numbers, and then evaluate it
  * as a mathematical expression till we find a number.
  *
  * note this is NOT recursive, you can't point one field of
  *
  * @param {string} readField= field to read containing string to parse
  * @param {string} writeField= field to write to
  * @param {number} defaultVal= optional, default to set if we cannot evaluate the field. If not supplied assume 0
  * @param {function} callback - function(newval, oldval, ischanged)
  * @param {bool} silently if true set new val with {silent:true}
  * @param {bool} dontSetErrorFlag if true and we could not evaluate, then set attribute named writeField+"_error" to 1
  * @param {function} errcallback  call if there was an error parsing string function(newval, oldval, ischanged)
  */
 evaluateAndSetNumber = function (readField, writeField, defaultVal, callback, silently, errcallback) {
   var
   done = function (a, b, c,currError) {
     var donesetter={};
     if (currError){
       donesetter[writeField+'_error']=0;
       setAttrs(donesetter,{silent:true});
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
       setAttrs(donesetter,{silent:true});
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
           setAttrs(setter, params, function () {
             done(value, currVal, true,currError);
           });
         } else {
           done(value, currVal, false,currError);
         }
       } else if (!isNaN(value)) {
         //check for number
         if (currVal !== value) {
           setter[writeField] = value;
           setAttrs(setter, params, function () {
             done(value, currVal, true);
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
             if (isNaN(currVal) || currVal !== value2) {
               setter[writeField] = value2;
             }
             if (_.size(setter)>0){
               isChanged=true;
             }
           } catch (err2) {
             TAS.error("SWUtils.evaluateAndSetNumber error after call to evaluateExpression ", err2);
             isError=1;
           } finally {
             setAttrs(setter, params, function () {
               if (!isError){
                 done(value2, currVal, isChanged,currError);
               } else {
                 errordone(value2,currVal,isChanged,currError);
               }
             });

           }
         });
       }
     } catch (err) {
       TAS.error("SWUtils.evaluateAndSetNumber", err);
       setter[writeField+'_error']=1;
       setAttrs(setter,{silent:true},function(){errordone(value, currVal, false,currError);});
     }
   });
 },
 /** Reads dropdown value, determines attribute referenced, gets that attribute value, passes it to callback.
 * similar to evaluateAndSetNumber but uses a synchronus function to perform search and replace, and assumes the string is only one value not an expression.
 * necessary because some dropdowns have other text in the dropdowns, so we can't use the dropdown value exactly as is.
 * called by setDropdownValue
 * @param {string} readField the attribute name of dropdown we are looking at
 * @param {function} synchrousFindAttributeFunc reads in the value of the dropdown field, and returns the exact name of the attribute to look up (since some dropdowns have other text in value)
 * @param {function(int)} callback pass the value the dropdown selection represents
 *   exceptions: if readField is not found pass in "", if readField is 0 or starts with 0 pass in 0.
 */
 getDropdownValue = function (readField, synchrousFindAttributeFunc, callback) {
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
 },
 /** Looks at a dropdown value, and sets writeField(s) with the number to which selected option refers.
 * calls getDropdownValue
 * @param {string} readField the dropdown field
 * @param {string_or_Array} writeFields Field(s) to write the value to
 * @param {function} synchrousFindAttributeFunc takes value of @readField and says what the lookup field is.
 * @param {function(int)} callback (optional) if we need to update the field, call this function
 *         with the value we set as the only parameter.
 * @param {bool} silently if true call setAttrs with {silent:true}
 */
 setDropdownValue = function (readField, writeFields, synchrousFindAttributeFunc, callback, silently) {
   var done = function (newval, currval, changed) {
     if (typeof callback === "function") {
       callback(newval, currval, changed);
     }
   };
   SWUtils.getDropdownValue(readField, synchrousFindAttributeFunc, function (valueOf) {
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
           setAttrs(setter, params, function () {
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
           setAttrs(setter, params, function () {
             done(valueOf, 0, true);
           });
         } else {
           done(valueOf, 0, false);
         }
       });
     }
   });
 },
 /** getRowTotal return newvalue, currentvalue, allvalues in callback. Summed up floats and round total to int.
 * THIS IS PROBABLY SLOWER THAN DOING IT YOURSELF, just wrote to make things simpler.
 * @param {Array} fields array of field names to be added up, EXCEPT the first field which is ignored (at index 0) which is the total current value
 * @param {number} bonus a number that is added to the other fields.
 * @param {Array} penalties array of fieldnames whose values are to be subtracted from the total
 * @param {boolean} totalIsFloat true if we should not round the total to int.
 * @param {function(number,number)} callback call this with: new total, current total
 * @param {function} errorCallback call if error attempting to add.
 */
 getRowTotal = function (fields, bonus, penalties, totalIsFloat, callback, errorCallback) {
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
 },
 /** Adds up numbers and puts it in the first field of the fields array.
 * All numbers are added up as FLOATS, and then FLOOR is used to round the sum down
 * @param {Array} fields array of field names to be added up, EXCEPT the first field. fields[0] MUST be the total field
 * @param {number} bonus a number that is added to the other fields.
 * @param {Array} penalties array of fieldnames whose values are to be subtracted from the total
 * @param {boolean} totalIsFloat true if we should not round the total to int.
 * @param {function(number,number)} callback optional call this with two values: the new total, old total
 * @param {bool} silently if true call setAttrs with {silent:true}
 */
 updateRowTotal = function (fields, bonus, penalties, totalIsFloat, callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getRowTotal(fields, bonus, penalties, totalIsFloat, function (newValue, currValue) {
     var setter = {},
     params = {};
     try {
       if (newValue !== currValue) {
         setter[fields[0]] = newValue;
       }
     } catch (err) {
       TAS.error("PFUtilsAsync.updateRowTotal", err);
     } finally {
       if (_.size(setter) > 0) {
         if (silently) {
           params.silent=true;
         }
         setAttrs(setter, params, done);
       } else {
         done();
       }
     }
   }, done);
 },
 /** Escapes special chars for regex
 *@param {string} str the string to examine
 *@param {boolean} escapeSpaces if we should replace any space with \s* (caller can use it for matching purposes)
 *@returns {string} resultant string after search and replace
 */
 escapeForRegExp = function (str, escapeSpaces) {
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
 },
 /** Escapes special chars for macros - to create sub queries - this is not used currently
 *@param {string} str the string to examine
 *@returns {string} resultant string after search and replace
 */
 escapeForMacroCall = function (str) {
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
 },
 /** Escapes '{{' for passing to a rolltemplate
 *@param {string} str the string to examine
 *@returns {string} resultant string after search and replace
 */
 escapeForRollTemplate = function (str) {
   if (!str){return str;}
   return str.replace(/\{\{/g, '&#123;&#123;');
 },
 /** escapes string so it can be used in the name section of another link button
 *if it finds [name](link) in a string it will remove the [ and ] and the (link)
 * replaces [ and ] with escaped versions everywhere else.
 *@param {string] str the string we want to use inside a link button
 *@returns {string} safe to use new name for button
 */
 escapeForChatLinkButton = function(str){
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
 },
 /** returns id portion of a source Attribute or repeating row attribute name
 * @param {string} sourceAttribute from eventInfo object
 * @returns {string} the id portion of string, or blank.
 */
 getRowId = function (sourceAttribute) {
   if (!sourceAttribute) { return ""; }
   var strs = sourceAttribute.split('_');
   if (strs && _.size(strs) >= 4) {
     return strs[2];
   }
   return "";
 },
 getAttributeName = function (source) {
   if (!source) { return ""; }
   var itemId = getRowId(source), attrib = "";
   if (itemId) {
     attrib = source.substring(source.indexOf(itemId) + itemId.length + 1, source.length);
   }
   return attrib;
 },
 /** getRepeatingIDStr - if id is not empty, then returns the ID with an underscore on the right. else returns empty string
 * this is used so the same function can be written for loops from getIDs or direct from the event with no ID
 *@param {string} id the id of the row or blank
 *@returns {string} id_  or blank
 */
 getRepeatingIDStr = function (id) {
   var idStr = "";
   if (!(id === null || id === undefined)) {
     idStr = id + "_";
   }
   return idStr;
 },
 /** Append values of multiple arrays of strings together to return one NEW array of strings that is the cartesian product.
 * @example cartesianAppend(["a","b"],["c","d"], ["e","f"]);
 * // returns ["ace","acf","ade","adf","bce","bcf","bde","bdf"]
 * @example cartesianAppend(["pre_"] , ["a","b","c"], ["_post"] );
 * //returns ["pre_a_post","pre_b_post","pre_c_post"]
 * @param {Array} [...] Arrays of strings
 * @returns {Array} of all values in other arrays
 */
 cartesianAppend = function () {
   return _.reduce(arguments, function (a, b) {
     return _.flatten(_.map(a, function (x) {
       return _.map(b, function (y) {
         return String(x) + String(y);
       });
     }), true);
   }, [[]]);
 },
 /** Concatenates cartesian product of all arrays together returns one flattened NEW array.
 * @param {Array} [...] Arrays
 * @returns {Array} cartesian product of all arrays (concatenated nothing else)
 */
 cartesianProduct = function () {
   return _.reduce(arguments, function (a, b) {
     return _.flatten(_.map(a, function (x) {
       return _.map(b, function (y) {
         return x.concat([y]);
       });
     }), true);
   }, [[]]);
 },
 /** trimBoth removes spaces at beginning and end of string, or of each string in an array.
 * performs a deep match, so if array is of arrays, will call trim on every string.
 * if object is not an array or string, just return object.
 * therefore, non immutable objects are not cloned and array will contain links to them.
 *@param {Array or string} val string or array of strings
 *@returns {Array or string} same object type as passed in
 */
 trimBoth = function(val){
   if (Array.isArray(val)){
     return _.map(val,trimBoth);
   }
   if (typeof val === 'string') {
     return val.replace(/^\s*|\s*$/g,'');
   }
   return val;
 }
 ;
 console.log(PFLog.l + '   SWUtils module loaded          ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   cartesianAppend: cartesianAppend,
   cartesianProduct: cartesianProduct,
   convertKL1KH1toMinMax: convertKL1KH1toMinMax,
   escapeForRegExp: escapeForRegExp,
   escapeForRollTemplate: escapeForRollTemplate,
   findAndReplaceFields: findAndReplaceFields,
   evaluateExpression: evaluateExpression,
   getRowId: getRowId,
   getAttributeName: getAttributeName,
   evaluateAndSetNumber: evaluateAndSetNumber,
   escapeForChatLinkButton: escapeForChatLinkButton,
   getDropdownValue: getDropdownValue,
   setDropdownValue: setDropdownValue,
   getRowTotal: getRowTotal,
   updateRowTotal: updateRowTotal,
   getRepeatingIDStr: getRepeatingIDStr,
   validNumericStr: validNumericStr,
   trimBoth: trimBoth
 };
}());
var PFConst = {
 /* Pathfinder SHEET constants */
 version: 1.15,
 /***************************************Lists of Fields ************************************************************/
 //add any new repeating sections here. This is the word after "repeating_"
 repeatingSections: ["weapon", "ability", "class-ability", "feat", "racial-trait", "trait", "item", "npc-spell-like-abilities", "mythic-ability", "mythic-feat", "buff", "spells"],
 //repeating sections that have used and used|max and max-calculation fields
 repeatingMaxUseSections: ["class-ability", "feat", "racial-trait", "trait", "mythic-ability", "mythic-feat", "ability"],

 //attribute of a dropdown mapped to attribute to write evaluated number to.
 //all simple dropdowns that do not need to call any other function when evaluating besides setDropdownValue and findAbilityInString
 dropdowns: {
   "HP-ability": "HP-ability-mod",
   "init-ability": "init-ability-mod",
   "Fort-ability": "Fort-ability-mod",
   "Ref-ability": "Ref-ability-mod",
   "Will-ability": "Will-ability-mod",
   "melee-ability": "melee-ability-mod",
   "melee2-ability": "melee2-ability-mod",
   "ranged-ability": "ranged-ability-mod",
   "ranged2-ability": "ranged2-ability-mod",
   "CMB-ability": "CMB-ability-mod",
   "CMB2-ability": "CMB2-ability-mod"
 },
 //attribute of a macro, mapped to attribute to write evaluation to
 //all simple macros that do not need to call other functions besides evaluateAndSetNumber
 equationMacros: {
   "init-misc": "init-misc-mod",
   "HP-formula-macro-text": "HP-formula-mod",
   "Max-Skill-Ranks-Misc": "Max-Skill-Ranks-mod",
   "SR-macro-text": "SR",
   "spellclass-0-SP_misc": "spellclass-0-SP-mod",
   "spellclass-1-SP_misc": "spellclass-1-SP-mod",
   "spellclass-2-SP_misc": "spellclass-2-SP-mod"
 },
 //the 3 spell classes at top of spells page
 spellClassIndexes: ["0", "1", "2"],
 silentParams : {silent:true},
 minusreg : /\-|\u2013|\u2014|\u2212|\u02d7/,
 critreg : /(\d+)[\-|\u2013|\u2014|\u2212|\u02d7]20\/[x\u00d7](\d+)/,
 diceDiereg : /(\d+)d(\d+)\s*([\+|\-|\u2013|\u2014|\u2212|\u02d7]{0,1})\s*(\d*)/
};
var PFDB = {
 /* Pathfinder RULE constants for parsing */
 unarmedAttacksRegExp : /unarmed|strike|punch|palm|flurry|blow|touch/i,
 combatManeuversRegExp : /bull\s*rush|trip|disarm|dirty\s*trick|drag|grapple|overrun|reposition|steal|sunder|trip/i,
 primaryNaturalAttacksRegExp : /bite|claw|gore|slam|sting|talon/i,
 importantFeatRegExp : /Weapon Fine|^Run$|Enduran|Defensive Combat Train|Agile Maneuv|Arcane Arm|Combat Cast|Critical Focus|Skill Focus|Critical|Intimidating Prow/i,
 spAttackAttacks : /blooddrain|touch|energydrain|bleed|burn|constrict|trample|engulf|heat|powerfulcharge|swallowwhole/i,
 spAttackAttacksPreProcess : /rake|rend|web/i,
 abilitySrch : /str|dex|con|int|wis|cha/i,
 cmbMonsterSrch : /swallowwhole|tongue|pull|drag|grab|push/i,
 casterDefaultAbility : {
   sorcerer: 'cha',
   wizard: 'int',
   cleric: 'wis',
   bard: 'cha',
   druid: 'wis',
   paladin: 'cha',
   ranger: 'wis',
   oracle: 'cha',
   witch: 'int',
   alchemist: 'int',
   summoner: 'cha',
   inquisitor: 'wis',
   magus: 'int'
 },
 creatureTypeClassSkills : {
   aberration: ['Acrobatics', 'Climb', 'Escape-Artist', 'Fly', 'Intimidate', 'Knowledge', 'Perception', 'Spellcraft', 'Stealth', 'Survival', 'Swim'],
   animal: ['Acrobatics', 'Climb', 'Fly', 'Perception', 'Stealth', 'Swim'],
   dragon: ['Appraise', 'Bluff', 'Climb', 'Craft', 'Diplomacy', 'Fly', 'Heal', 'Intimidate', 'Linguistics', 'Knowledge', 'Perception', 'Sense-Motive', 'Spellcraft', 'Stealth', 'Survival', 'Swim', 'Use-Magic-Device'],
   fey: ['Appraise', 'Bluff', 'Climb', 'Craft', 'Diplomacy', 'Disguise', 'Escape-Artist', 'Fly', 'Knowledge-Geography', 'Knowledge-Local', 'Knowledge-Nature', 'Perception', 'Perform', 'Sense-Motive', 'Sleight-of-Hand', 'Stealth', 'Swim', 'Use-Magic-Device'],
   monstrous: ['Climb', 'Craft', 'Fly', 'Intimidate', 'Perception', 'Ride', 'Stealth', 'Survival', 'Swim'],
   humanoid: ['Climb', 'Craft', 'Handle-Animal', 'Heal', 'Profession', 'Ride', 'Survival'],
   magicalbeast: ['Acrobatics', 'Climb', 'Fly', 'Perception', 'Steatlh', 'Swim'],
   outsider: ['Bluff', 'Craft', 'Knowledge-Planes', 'Perception', 'Sense-Motive', 'Stealth'],
   plant: ['Perception', 'Stealth'],
   undead: ['Climb', 'Disguise', 'Fly', 'Intimidate', 'Knowledge-Arcana', 'Knowledge-Religion', 'Perception', 'Sense-Motive', 'Spellcraft', 'Stealth']
 },
 creatureSubtypeClassSkills :{
   air: ['Fly'],
   giant: ['Intimidate', 'Perception'],
   goblinoid: ['Stealth'],
   inevitable: ['Acrobatics', 'Diplomacy', 'Intimidate', 'Survival'],
   water: ['Swim'],
   robot: ['Climb', 'Disable-Device', 'Fly', 'Knowledge', 'Linguistics', 'Perception', 'Sense-Motive']
 },
 specialAttackDCAbilityBase : {
   'breathweapon': 'CON',
   'burn': 'CON',
   'curse': 'CHA',
   'disease': 'CON',
   'distraction': 'CON',
   'emotionaura': 'CHA',
   'energydrain': 'CHA',
   'entrap': 'CON',
   'fear': 'CHA',
   'fearaura': 'CHA',
   'fearcone': 'CHA',
   'fearray': 'CHA',
   'frightfulpresence': 'CHA',
   'gaze': 'CHA',
   'mentalstaticaura': 'CHA',
   'paralysis': 'CON',
   'poison': 'CON',
   'stench': 'CON',
   'trample': 'STR',
   'web': 'CON',
   'whirlwind': 'STR'
 },
 monsterRulesPlusAttacks : ['grab', 'trip', 'engulf', 'swallow whole'],
 naturalAttackRegExp : /arm|bite|claw|foreclaw|gore|hoof|kick|leg|pincer|quill|root|slam|slap|snake\s*bite|spike|spine|splinter|sting|tail|tail\s*slap|talon|tendril|tentacle|thorn|tongue|vine|wing|buffet/i,
 skillBonusFeatRegExp : /Acrobatic|Uncanny Alertness|Alertness|Animal Affinity|Athletic|Breadth of Experience|Brewmaster|Deceitful|Deft Hands|Deny the Reaper|Forgotten Past|Innocent Blood|Monkey Moves|Monkey Style|Monument Builder|No Name|Persuasive|Scavenger.s Eye|Sea Legs|Self.Sufficient|Sharp Senses|Stealthy|Sure and Fleet|Voice of the Sibyl/i,
 lessImportantCombatFeatRegExp : /Power Attack|Double Slice|Greater Weapon of the Chosen|Spell Focus|Toughness/i,
 monsterRules : /spells|damage reduction/i
};
var PFUtils = PFUtils || (function () {
 'use strict';
 /****************************SYNCHRONOUS UTILITIES ***********************************
 NO asynchronous FUNCTIONS SHOULD GO HERE
 ************************************************************************************** */
 /** findAbilityInString - returns the attribute referenced by a dropdown option value.
 * Looks at a string for instances of an ability modifier DEX-mod, STR-mod,  etc and returns the modifier it finds.
 * if none are found, or if the first character is "0", return ""
 * NOTE: YOU MUST PUT ANY NEW DROPDOWN VALUES HERE!
 * (if they are references to other fields. obviously, dropdowns with 0, 1, 2 as values are not needed here)
 *@param {string} stringToSearch the value of the dropdown option selected
 *@returns {string} the attribute referenced by a dropdown option value.
 */
 var findAbilityInString = function (stringToSearch) {
   if (!stringToSearch) {
     return "";
   }
   if (stringToSearch.slice(0, 1) === "0") {
     return "";
   }
   if (/str.mod/i.test(stringToSearch)) {
     return "STR-mod";
   }
   if (/dex.mod/i.test(stringToSearch)) {
     return "DEX-mod";
   }
   if (/con.mod/i.test(stringToSearch)) {
     return "CON-mod";
   }
   if (/int.mod/i.test(stringToSearch)) {
     return "INT-mod";
   }
   if (/wis.mod/i.test(stringToSearch)) {
     return "WIS-mod";
   }
   if (/cha.mod/i.test(stringToSearch)) {
     return "CHA-mod";
   }
   if (/melee2/i.test(stringToSearch)) {
     return "attk-melee2";
   }
   if (/melee/i.test(stringToSearch)) {
     return "attk-melee";
   }
   if (/ranged2/i.test(stringToSearch)) {
     return "attk-ranged2";
   }
   if (/ranged/i.test(stringToSearch)) {
     return "attk-ranged";
   }
   if (/cmb2/i.test(stringToSearch)) {
     return "CMB2";
   }
   if (/cmb/i.test(stringToSearch)) {
     return "CMB";
   }
   if (/str/i.test(stringToSearch)) {
     return "STR";
   }
   if (/dex/i.test(stringToSearch)) {
     return "DEX";
   }
   if (/con/i.test(stringToSearch)) {
     return "CON";
   }
   if (/int/i.test(stringToSearch)) {
     return "INT";
   }
   if (/wis/i.test(stringToSearch)) {
     return "WIS";
   }
   if (/cha/i.test(stringToSearch)) {
     return "CHA";
   }
   if (/npc.type/i.test(stringToSearch)) {
     return "npc-type";
   }
   if (/race/i.test(stringToSearch)) {
     return "race";
   }
   if (/class.0.level/i.test(stringToSearch)) {
     return "class-0-level";
   }
   if (/\{level\}/i.test(stringToSearch)) {
     return "level";
   }
   if (/npc.hd.num/i.test(stringToSearch)) {
     return "npc-hd-num";
   }
   if (/class.1.level/i.test(stringToSearch)) {
     return "class-1-level";
   }
   if (/class.2.level/i.test(stringToSearch)) {
     return "class-2-level";
   }
   if (/class.3.level/i.test(stringToSearch)) {
     return "class-3-level";
   }
   if (/class.4.level/i.test(stringToSearch)) {
     return "class-4-level";
   }
   if (/class.5.level/i.test(stringToSearch)) {
     return "class-5-level";
   }
 },
 /** calculateSpellRanges - returns {close:x, medium:y , long:z} for casterlevel
 *@param {int} casterlevel level of caster
 *@returns {jsobject} mapping like this: {close:int,medium:int,long:int}
 */
 calculateSpellRanges = function (casterlevel) {
   casterlevel = casterlevel || 0;
   return {
     close: 25 + (5 * (Math.floor(casterlevel / 2))),
     medium: 100 + (10 * casterlevel),
     "long": 400 + (40 * casterlevel)
   };
 },
 /**findSpellRange -  calculates range number based on spell settings
 * @param {int} customRangeVal value that is in the custom range field, for "per level" or "custom" choices
 * @param {string} rangeDropdown selected value from spell range dropdown
 * @param {int} casterlevel the level of caster
 * @returns {int_or_""} the spell range
 */
 findSpellRange = function (customRangeVal, rangeDropdown, casterlevel) {
   var newRange = 0,
   ranges = PFUtils.calculateSpellRanges(casterlevel);
   casterlevel = casterlevel || 0;
   rangeDropdown=rangeDropdown||'blank';
   if (rangeDropdown[0] === "{") {
     rangeDropdown = rangeDropdown.slice(2, rangeDropdown.indexOf("="));
   }
   //TAS.debug("at find SpellRange. rangetext:"+customRangeVal +", rangeDropdown:"+rangeDropdown+", area:"+area+", casterlevel:"+casterlevel);
   switch (rangeDropdown) {
     case 'number':
     case 'custom':
       newRange = parseInt(customRangeVal, 10) || 0;
       break;
     case 'perlevel':
       newRange = (parseInt(customRangeVal, 10) || 0) * casterlevel;
       break;
     case 'close':
       newRange = ranges.close;
       break;
     case 'medium':
       newRange = ranges.medium;
       break;
     case 'long':
       newRange = ranges["long"];
       break;
     case 'see text':
     case 'touch':
     case 'personal':
     case 'blank':
     default:
       newRange = 0;
       break;
   }
   //TAS.debug("returning customRangeVal "+newRange+" for "+rangeDropdown);
   return newRange;
 },
 /** getWoundPenalty - applies Endurance feat or Gritty Mode to wound level.
 *@param {int} woundLevel value of wounds attribute
 *@param {bool} hasEndurance if char has Endurance feat (lessens penalty by 1)
 *@param {bool} grittyMode if using grittyMode (doubles penalty, applied before hasEndurance)
 *@returns {int} value to apply.
 */
 getWoundPenalty = function (woundLevel, hasEndurance, grittyMode) {
   return (woundLevel !== 0) ? (-1 * ((woundLevel * (grittyMode + 1)) - hasEndurance)) : 0;
 },
 /** getRepeatingIDStr - if id is not empty, then returns the ID with an underscore on the right. else returns empty string
 * this is used so the same function can be written for loops from getIDs or direct from the event with no ID
 *@param {string} id the id of the row or blank
 *@returns {string} id_  or blank
 */
 getRepeatingIDStr = function (id) {
   return SWUtils.getRepeatingIDStr(id);
 },
 isOptionTemplateReversed = function (spellOptionKey) {
   return spellOptionKey === "range_pick";
 },
 /** getOptionsCompiledRegexMap - finds {{key=*}} in a string to search rolltemplate macros
 * uses lookahead and lookbehind  to ensure must be preceeded by start or }} , followed by end or {{
 * @param {jsobj map} options map {} of key , only key looked at.
 * @returns {jsobj map} of key to "{{key=*}}" but as a compiled regex
 */
 getOptionsCompiledRegexMap = function (options) {
   return _.mapObject(options, function (outputstr, key) {
     if (!isOptionTemplateReversed(key)) {
       return new RegExp("\\s*((?=\\{\\{)|(?=^))\\{\\{" + key + "\\=.*?\\}\\}\\s*((?=\\{\\{)|(?=$))");
     }
     return new RegExp("((?=\\{\\{)|(?=^))\\s*\\{\\{\\.*?\\=" + key + "\\}\\}\\s*((?=\\{\\{)|(?=$))");
   });
 },
 /** shouldNotDisplayOption- returns true if the value is the default so we know not to bother displaying in roll.
 * @param {string} attr: can pass either the attribute or the option name it will be sent to
 * @param {string} val : the value of the attribute
 * @returns {boolean}
 */
 shouldNotDisplayOption = function (attr, val) {
   if (!val) {
     return true;
   }
   switch (attr) {
     case 'sr':
       return (!(/^y/i.test(val)));
     case 'save':
     case 'saving_throw':
       return ((/^n/i.test(val) || /harmless/i.test(val)) && !(/and|or/i.test(val)));
     case 'spell_fail':
       return (! ( (parseInt(val,10)||0) === 0));
     default:
       return false;
   }
 },
 /** deleteOption - removes option text from string and adds {{optionKey=}}
 * @param {string} optionText the string of a rolltemplate macro
 * @param {string} optionKey the key from rolltemplate setting, as in: {{optionKey=xxxx}}
 * @param {string} regexMap output of keys, what to search for from getOptionsCompiledRegexMap()
 * @returns {string} optionText with the optionKey portion of macro replaced with empty value
 */
 deleteOption = function (optionText, optionKey, regexMap) {
   var repStr = PFUtils.isOptionTemplateReversed(optionKey) ? "{{=" + optionKey + "}}" : "{{" + optionKey + "=}}";
   //TAS.debug("deleteOption optionKey"+optionKey+", regexMap[optionKey]:"+regexMap[optionKey]+", repStr:"+repStr);
   if (optionKey && optionText && regexMap[optionKey]) {
     optionText = optionText.replace(regexMap[optionKey], repStr);
   }
   return optionText;
 },
 /**getAvgHP returns average hp for given hit dice and die
 * also can return 75% or 100% of max hp
 * @param {int} hdice # of dice
 * @param {int} hdie # of sides (4,6,8,10,12,etc)
 * @param {float} mult optional percent of max to average, must be .5 (average), .75, or 1. If null then assume .5
 * @param {bool} firstMax if true then 1st level gets 100% hp
 * @param {bool} ispfs if true then round up EVERY level.
 * @returns {int} hit point average.
 */
 getAvgHP = function (hdice, hdie, mult, firstMax, ispfs) {
   var hp=0, bonus=1;
   //TAS.debug("PFUtils.getAvgHP called with hdice:"+hdice+", hdie:"+hdie+", mult:"+mult+", firstMax:"+firstMax);
   if (!(mult === 0.5 || mult === 0.75 || mult === 1)) {
     mult = 0.5;
   }
   if (ispfs) {
     bonus = 2;
     mult = 0.5;
   }
   if (mult === 1) {
     hp = hdie * hdice;
   } else {
     if (firstMax) {
       hdice --;
     }
     hp= Math.floor( (100*(hdie + bonus) * mult * hdice)/100);
     if (firstMax){
       hp+=hdie;
     }
   }
   return hp;
 },
 /** takes value of auto hit point radio and returns percent it represents 50,75,100.
 *@param {int} autohp_percent the value of attr_autohp_percent
 *@returns {decimal} either 0.5, 0.75,  or 1.00
 */
 getAutoHPPercentMultiplier = function (autohp_percent) {
   var  newhealth=0;
   autohp_percent = parseInt(autohp_percent,10)||0;
   switch (autohp_percent){
     case 1: newhealth=0.5;  break;
     case 2: newhealth=0.75; break;
     case 3: newhealth=1;   break;
     default: newhealth=0.5; break;
   }
   //TAS.debug("at getAutoHPPercentMultiplier called with "+autohp_percent+", returning with :" + newhealth);
   return newhealth;
 },
 /** parseSpellRangeText - Initial parse of a string from spell , it returns the value to set in the dropdown,
 * plus whether to run the range text through a secondary parse for numbers.
 * returns object with keys: dropdown, useorig, number, rangetext
 * (number only returned if number is a flat number)
 * @param {string} range the range string from a spell
 * @param {string} area the area or target string from a spell (whichever filled in, only 1 will be)
 * @returns {jsobj} map format: {"dropdown":newRangeDropdown,"useorig":useOrigRangeText if special,"number":flatRange,"rangetext":newRangeText if we need to fill in text}
 */
 parseSpellRangeText = function (range, area) {
   var newRangeDropdown = "",
   tempRange = 0,
   tempMatches,
   tempMatches2,
   useOrigRangeText = false,
   flatRange = -1,
   areaRange,
   newRangeText = "";
   //TAS.debug("at parseSpellRangeText: range:"+range+", area:"+area);
   try {
     if (!range) {
       //if range is blank, use the number in area/effect/targets since it will be "30ft emanation" or something similar
       if (!area) {
         return {
           "dropdown": "blank",
           "useorig": false,
           "rangetext": "",
           "number": 0
         };
       }
       areaRange = parseSpellRangeText(area, null);
       if (areaRange.dropdown === "unknownrange") {
         areaRange.dropdown = "blank";
       }
       if (!(areaRange.dropdown === "number" || areaRange.dropdown === "perlevel")) {
         areaRange.useorig = false;
         areaRange.rangetext = "";
       }
       return areaRange;
     }
     //begin
     range = range.toLowerCase();
     //if unlimited use area/target field
     if (!newRangeDropdown && range === "unlimited") {
       areaRange = parseSpellRangeText(area, null);
       if (areaRange.dropdown === "unknownrange") {
         newRangeDropdown = "blank";
       } else {
         newRangeDropdown = areaRange.dropdown;
         if (!/short|medium|long/.test(newRangeDropdown)) {
           useOrigRangeText = areaRange.useorig;
           if (useOrigRangeText && areaRange.rangetext) {
             range = areaRange.rangetext;
           }
         }
       }
     }
     if (!newRangeDropdown) {
       //and or or - use the value after and/or if there is one, and keep rangetext
       tempMatches = range.match(/(.*?)\s+(or|and)\s+/);
       if (tempMatches && tempMatches[1]) {
         areaRange = parseSpellRangeText(range.substring(tempMatches[0].length), null);
         if (areaRange && (!(areaRange.dropdown === "unknownrange" || areaRange.dropdown === "blank"))) {
           newRangeDropdown = areaRange.dropdown;
           if (areaRange.rangetext) {
             //If second value is a flat number or per level
             // then move it BEFORE the and/or so parseInt on rangetext works.
             if (newRangeDropdown === "number") {
               if (areaRange.rangetext) {
                 range = areaRange.rangetext + " " + tempMatches[2] + " " + tempMatches[1];
               } else {
                 range = areaRange.number + " ft. " + tempMatches[2] + " " + tempMatches[1];
               }
             } else if (newRangeDropdown === "perlevel") {
               //must add /level when it is and/or but otherwise not.
               if (areaRange.rangetext) {
                 range = areaRange.rangetext + "/level " + tempMatches[2] + " " + tempMatches[1];
               } else {
                 range = areaRange.number + "ft. /level  " + tempMatches[2] + " " + tempMatches[1];
               }
             } else {
               range = tempMatches[1] + " " + tempMatches[2] + " " + areaRange.rangetext;
             }
           }
           useOrigRangeText = true;
         }
       }
     }
     if (!newRangeDropdown) {
       if (range === "you") {
         newRangeDropdown = "personal";
       } else {
         tempMatches = range.match(/close|short|medium|long|touch|see text|personal|special|\/level/);
         if (tempMatches && tempMatches[0]) {
           switch (tempMatches[0]) {
             case 'close':
             case 'medium':
             case 'long':
             case 'personal':
             case 'touch':
             case 'see text':
               newRangeDropdown = tempMatches[0];
               break;
             case 'short':
               newRangeDropdown = "close";
               break;
             case 'special':
               newRangeDropdown = "see_text";
               break;
             case '/level':
               tempMatches2 = range.match(/(\d+)(\D*)\/level/);
               if (tempMatches2 && tempMatches2[1]) {
                 tempRange = parseInt(tempMatches2[1], 10) || 0;
                 range = tempMatches2[1] + (tempMatches2[2] || "");
                 useOrigRangeText = true;
                 newRangeDropdown = "perlevel";
                 flatRange = tempRange;
               }
               break;
           }
         }
       }
     }
     if (!newRangeDropdown) {
       //number in front usually emanation, line, cone, etc
       tempRange = parseInt(range, 10);
       if (!isNaN(tempRange) && tempRange > 0) {
         newRangeDropdown = "number";
         flatRange = tempRange;
         useOrigRangeText = true;
       } else {
         //number in middle after "more than" or "within"
         tempMatches2 = range.match(/within\s|more\sthan\s/);
         if (tempMatches2 && tempMatches2[0]) {
           range = range.substring(tempMatches2[0].index + tempMatches2[0].length);
           tempRange = parseInt(range, 10);
           if (!isNaN(tempRange) && tempRange > 0) {
             newRangeDropdown = "number";
             flatRange = tempRange;
             useOrigRangeText = true;
           }
         }
       }
     }
     if (!newRangeDropdown && area) {
       //give up , retry using the text in area/target/effect
       areaRange = parseSpellRangeText(area, null);
       newRangeDropdown = areaRange.dropdown;
       if (newRangeDropdown === "number" || newRangeDropdown === "perlevel") {
         useOrigRangeText = true;
         range = areaRange.rangetext;
       }
     }
   } catch (errorParsing) {
     TAS.error("parseSpellRangeText, error", errorParsing);
     newRangeDropdown = "unknownrange";
     useOrigRangeText = true;
   }
   if (!newRangeDropdown) {
     newRangeDropdown = "unknownrange";
     useOrigRangeText = true;
   }
   if (useOrigRangeText === true) {
     if (newRangeDropdown !== "unknownrange") {
       //erase everything in parenthesis - also ltrim and rtrim
       newRangeText = range.replace(/\s*\(.*?\)/, '').replace(/^\s+/, '').replace(/\s+$/, '').replace('feet', 'ft.');
     } else {
       newRangeText = range;
     }
   }
   return {
     "dropdown": newRangeDropdown,
     "useorig": useOrigRangeText,
     "number": flatRange,
     "rangetext": newRangeText
   };
 },
 /** parseCost gets cost in gp
 *@param {string} str the string containing the cost: 35gp, 20sp, etc
 *@returns {int} cost in gp.
 */
 getCostInGP = function (str){
   var temp=0,
   matches = str.match(/(\d+)/);
   if (matches) {
     temp = parseInt(matches[1],10)||0;
     matches = str.match(/(gp|cp|sp|pp)/i);
     if (matches){
       switch(matches[1]){
         case 'pp':
           temp = temp*10;
           break;
         case 'sp':
           temp = temp / 10;
           break;
         case 'cp':
           temp = temp / 100;
           break;
       }
     }
   }
   return temp;
 },
 getIntFromString= function(str){
   var temp=0, sign=1, matches;
   matches = PFConst.minusreg.exec(str);
   if(matches){
     sign=-1;
     str = str.replace(matches[0],'');
   }
   matches = str.match(/(\d+)/);
   if (matches) {
     temp = sign * (parseInt(matches[1],10)||0);
   }
   return temp;
 },
 getCritFromString =function(str){
   var ret={'crit':20,'critmult':2},matches;
   matches = PFConst.critreg.exec(str);
   //TAS.debug("at getCritFromString:"+str+", matches:",matches);
   if (matches){
     ret.crit = matches[1];
     ret.critmult=matches[2];
   }
   return ret;
 },
 getDiceDieFromString = function(str){
   var matches,ret={'dice':0,'die':0,'plus':0},sign=1;
   matches = PFConst.diceDiereg.exec(str);
   if (matches){
     ret.dice=parseInt(matches[1],10)||0;
     ret.die=parseInt(matches[2],10)||0;
     try {
       if (matches[3] && PFConst.minusreg.test(matches[3])){
         sign=-1;
       }
       if (matches[4]){
         ret.plus = sign * (parseInt(matches[4],10)||0);
       }
     } catch (err){
       TAS.error("getDiceDieFromString error finding plus ",err);
     }
   }
   //TAS.debug("at getDiceDieFromString parsing "+str,matches);
   return ret;
 },
 getSpecialAbilityTypeFromString = function(str){
   var ret='',matches;
   if(!str){return '';}
   matches = (/\b(Su|Ex|Sp)\b/i).exec(str);
   if (matches){
     return matches[1][0].toUpperCase()+matches[1][2].toLowerCase();
   }
   return '';
 },
 /** returns string after first comma ( that is after an opening parenthesis )
 * or after first comma if there is no opening parenthesis
 * @param {string} str the string to split
 * @param {bool} putOutside if true then return whateever is before first comma and after opening paren.
 *      if false, then return everything up to first paren then between 1st and 2nd comma. why? who the hell knows?
 * @returns {?} ?
 */
 removeUptoFirstComma = function (str, putOutside) {
   var parensplit,
   commasplit,
   retstr,
   i;
   if (str.indexOf('(') < 0 || str.indexOf(',') < 0) {
     return str;
   }
   parensplit = str.split(/\s*\(\s*/);
   if (parensplit.length>1){
     commasplit = parensplit[1].split(/,\s*/);
   } else {
     commasplit = str.split(/,\s*/);
   }
   retstr = putOutside ? commasplit[0] : parensplit[0] + '(' + commasplit[1];
   //rejoin rest of string this is really slow, why bother doing it this way?
   if (commasplit.length > 2) {
     for (i = 2; i < commasplit.length; i++) {
       retstr += ',' + commasplit[i];
     }
   }
   return retstr;
 },
 /**replaceDiceDieString puts inline roll brackets [[ ]] around 'xdy +z' dice strings (z exists or not)
 *@param {string} str a string which includes a diceroll substring xdy or xdy +/-z
 *@returns {string} same string with brackets around dice roll
 */
 replaceDiceDieString = function (str) {
   var tempstr = "",
   tempstrs = str.split(/(\d+d\d+\s*[+\-]??\d*)/i);
   tempstr = _.reduce(tempstrs, function (memo, splitted) {
     //TAS.debug('at ' + splitted);
     if ((/(\d+d\d+\s*[+\-]??\d*)/i).test(splitted)) {
       return memo + "(" + splitted + "): [[" + splitted + "]] ";
     }
     return memo + splitted;
   }, "");
   return tempstr;
 },
 getDiceDieString = function(str){
   var reg=/(\d+d\d+\s*[+\-]??\d*)/i,
   matches;
   matches=reg.exec(str);
   if(matches){
     return "[["+ matches[0] + "]]";
   }
   return "";
 },
 /**getDCString - gets macro formula for special ability calculating DC using ability score, what the level attribute is, and
 * whether to divide that level by 2 or not.
 * @param {string} ability the ability score string the DC is based on. Usually CON for special abilities.
 * @param {string} levelAttr optional the level attribute , either "level" or "class-0-level" or "npc-hd-num" etc
 * @param {bool} isUndead flag if undead, if true, then if ability is 'CON' change to 'CHA'
 * @param {int} miscBonus a flat number to add in
 * @param {bool} doNotDivideByTwo if true then do not divide level attr value by 2
 * @returns {string} default is: "DC [[ 10 + @{" + ability + "-mod} + floor(@{"+levelAttr+"}/2) ]]";
 */
 getDCString = function (ability, levelAttr, isUndead, miscBonus, doNotDivideByTwo) {
   var tempstr = '', pre = 'floor(', post = '/2)';

   tempstr = "DC [[ 10 ";
   if (ability) {
     if (isUndead && ability === 'CON') {
       ability = 'CHA';
     }
     tempstr += "+ @{" + ability + "-mod} ";
   }
   if (levelAttr) {
     if (doNotDivideByTwo) {
       pre = ''; post = '';
     } else {
       tempstr += "+ " + pre + "@{" + levelAttr + "}" + post + " ";
     }
   }
   if(miscBonus) {
     tempstr +=  "+ " + miscBonus ;
   }
   tempstr += " ]]";

   return tempstr;
 },
 /**replaceDCString looks for DC n, and replaces "n" with the [[ calculated DC  ]] by calling getDCString
 * @param {string} str the string to search and replace
 * @param {string} ability the ability score string the DC is based on. Usually CON for special abilities.
 * @param {string} levelAttr optional the level attribute , either "level" or "class-0-level" or "npc-hd" etc
 * @param {bool} isUndead flag if undead, if true, then if ability is 'CON' change to 'CHA'
 * @param {int} levelFlatNum optional the level, if levelAttr is blank, this must be filled in, or vice versa
 * @param {bool} doNotDivideByTwo if true then do not divide level by 2 to calculate DC
 * @returns {string} default is: "DC [[ 10 + @{" + ability + "-mod} + floor(@{"+levelAttr+"}/2) ]]"
 */
 replaceDCString = function (str, ability, levelAttr, isUndead, levelFlatNum, doNotDivideByTwo) {
   var tempstr = '', matches,pre='',post='', retstr=str,rawDC=10;
   try {
     matches = str.match(/D[Cc]\s*\d+/);
     if (matches){
       tempstr =matches[0].match(/\d+/);
       rawDC=parseInt(tempstr,10)||0;
       tempstr = getDCString(ability, levelAttr, isUndead, levelFlatNum, doNotDivideByTwo);
       pre= str.slice(0, matches.index)||'';
       post = str.slice(matches.index + matches[0].length)||'';
       retstr=pre + tempstr + post;
     }
   } catch(er) {
     TAS.error("at replaceDCString, cannot find DC string in "+ str,er);
   } finally {
     return retstr;
   }
 },
 /** returns rest of string after number
 *@param {string} str the string
 *@returns {string} rest of string after finding a number.
 */
 getNoteAfterNumber = function (str) {
   str = str.slice(str.indexOf(/\d+/));
   return str;
 },
 /**gets value 'field_compendium' from v,passes it to synchronous methodToCall mapping function, then sets in 'field'
 *@param {string} prefix the repeating_section_id_  string
 *@param {string} field the name of compendium field , must have _compendium at end. Without '_compendium' this is the write field
 *@param {function} methodToCall synchronous function that maps value of field_compendium to another val to set
 *@param {jsmap} v the values returned from getAttrs
 *@param {jsmap} setter to pass to setAttrs
 *@param {string} setField optional if the attr to write to is not 'field' it will be prefix+setField
 */
 getCompendiumFunctionSet = function (prefix,field,methodToCall,v,setter,setField){
   var temp=0,
     attr=v[prefix+field+'_compendium'];
   if (attr){
     temp= methodToCall(attr);
     if (temp) {
       setField=setField||field;
       setter[prefix+field]= temp;
     }
   }
   return setter;
 },
 /**gets int value 'field_compendium' from v, then sets in 'field'
 *@param {string} prefix the repeating_section_id_  string
 *@param {string} field the name of compendium field , must have _compendium at end. Without '_compendium' this is the write field
 *@param {jsmap} v the values returned from getAttrs
 *@param {jsmap} setter to pass to setAttrs
 *@param {string} setField optional if the attr to write to is not 'field' it will be prefix+setField
 */
 getCompendiumIntSet = function (prefix,field,v,setter,setField){
   var tempInt=0,attr;
   try {
     attr=v[prefix+field+'_compendium'];
     if (attr){
       tempInt= getIntFromString(attr);
       //TAS.debug("get int field:"+field+", val="+attr+", int:"+tempInt);
       if (tempInt) {
         setField=setField||field;
         setter[prefix+field]= tempInt;
       }
     }
   } catch (err){
     TAS.error("getCompendiumIntSet error on :"+prefix+", field:" +field + ", setField:"+setField,err);
   } finally {
     return setter;
   }
 },
 getRowId = function(sourceAttribute){
   return SWUtils.getRowId(sourceAttribute);
 },
 getAttributeName = function(source){
   return SWUtils.getAttributeName(source);
 },
 removeWhisperFromMacro = function(macrostr){
   var matches;
   if(!macrostr) {return macrostr;}
   //use hisper since some have capital W others not
   matches = macrostr.match(/whisper\}/i);
   if(matches){
     return SWUtils.trimBoth(macrostr.slice(matches.index+matches[0].length));
   }
   return macrostr;
 }
 ;
 console.log(PFLog.l + '   PFUtils module loaded          ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   shouldNotDisplayOption: shouldNotDisplayOption,
   deleteOption: deleteOption,
   isOptionTemplateReversed: isOptionTemplateReversed,
   getOptionsCompiledRegexMap: getOptionsCompiledRegexMap,
   findAbilityInString: findAbilityInString,
   getRepeatingIDStr: getRepeatingIDStr,
   calculateSpellRanges: calculateSpellRanges,
   findSpellRange: findSpellRange,
   parseSpellRangeText: parseSpellRangeText,
   removeUptoFirstComma: removeUptoFirstComma,
   replaceDiceDieString: replaceDiceDieString,
   getDiceDieString: getDiceDieString,
   getDCString: getDCString,
   replaceDCString: replaceDCString,
   getNoteAfterNumber: getNoteAfterNumber,
   getWoundPenalty: getWoundPenalty,
   getAutoHPPercentMultiplier: getAutoHPPercentMultiplier,
   getAvgHP: getAvgHP,
   getCostInGP: getCostInGP,
   getCompendiumFunctionSet: getCompendiumFunctionSet,
   getCompendiumIntSet: getCompendiumIntSet,
   getIntFromString: getIntFromString,
   getCritFromString: getCritFromString,
   getSpecialAbilityTypeFromString: getSpecialAbilityTypeFromString,
   getDiceDieFromString: getDiceDieFromString,
   getRowId: getRowId,
   getAttributeName: getAttributeName,
   removeWhisperFromMacro: removeWhisperFromMacro
 };
}());
var PFUtilsAsync = PFUtilsAsync || (function () {
 'use strict';
 /****************************ASYNCRHOUNOUS UTILITIES ***********************************
 ***************************************************************************************/
 /* setDropdownValue
 * Looks at a dropdown selected value, finds the matching attribute value, and then
 * sets the writeFields with that number.
 *
 * @readField {string} = the dropdpown field
 * @writeFields {string or Array} = One string or an array of strings that are fields to write the value to
 * @callback {function} optional = if we need to update the field, call this function
 *       callback(newvalue,oldvalue,ischanged)
 *  If writeField is a string not an Array, then set old value as 2nd param (could be NaN)
 */
 var setDropdownValue = function (readField, writeFields, callback, silently) {
   SWUtils.setDropdownValue(readField, writeFields, PFUtils.findAbilityInString, callback, silently);
 },
 /** calls setDropdownValue for a dropdown in a repeating section
 *@param {string} section the string between "repeating_" and "_<id>"
 *@param {string} id optional- the id of this row, blank if in context of the current row
 *@param {string} from the attribute name of the dropdown , string after "repeating_section_id_"
 *@param {string} to the attribute to write to, string after "repeating_section_id_"
 *@param {function} callback - the function passed to setDropdownValue as its callback, that function calls it
 */
 setRepeatingDropdownValue = function (section, id, from, to, callback,silently) {
   var idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_" + section + "_" + idStr;
   setDropdownValue(prefix + from, prefix + to, callback,silently);
 },
 /** setRowIds
 * sets the ID fields and new_flag fields for all rows in the section
 * @param {string} section  = the fieldset name after "section_"
 */
 setRowIds = function (section) {
   getSectionIDs("repeating_" + section, function (ids) {
     var setter = {};
     _.each(ids, function (id) {
       setter["repeating_" + section + "_" + id + "_row_id"] = id;
     });
     setAttrs(setter);
   });
 },
 registerEventHandlers = function() {
   //REPEATING SECTIONS set IDs
   _.each(PFConst.repeatingSections, function (section) {
     var eventToWatch = "change:repeating_" + section + ":ids-show";
     on(eventToWatch, TAS.callback(function eventCheckIsNewRow(eventInfo) {
       var setter={},id;
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         id = SWUtils.getRowId(eventInfo.sourceAttribute);
         setter["repeating_" + section + "_"+id+"_row_id"]=id;
         setAttrs(setter,PFConst.silentParams);
       }
     }));
   });
 }
 ;
 registerEventHandlers();
 console.log(PFLog.l + '   PFUtilsAsync module loaded     ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   setDropdownValue: setDropdownValue,
   setRepeatingDropdownValue: setRepeatingDropdownValue,
   setRowIds: setRowIds
 };
}());
var PFMacros = PFMacros || (function () {
 'use strict';
 var
 /** splitMacro Splits macro into {{x=y}} components
  * and @{attr} if at top level (not inside a {{x=@{attr}}})
  *@param {string} macrostr the macro-text from a repeating row
  *@returns {Array} of strings comprising macro
  */
 splitMacro = function(macrostr){
   var splitted,newsplit,lastclosing;
   if (!macrostr) {return "";}
   splitted = macrostr.split(/(?=\{\{)/);
   splitted = SWUtils.trimBoth(splitted);
   newsplit = _.reduce(splitted,function(memo,val){
     try {
       if (val.slice(0,2)==='{{') {
         if (val.slice(-2)==='}}'){
           memo.push(val);
         } else {
           lastclosing= val.lastIndexOf('}}');
           if (lastclosing <0){
             TAS.error ("error! no closing brackets for ",val);
             //just fix it
             val += '}}';
             lastclosing= val.lastIndexOf('}}');
             memo.push(val);
           } else {
             memo.push(SWUtils.trimBoth(val.slice(0,lastclosing+2)));
             memo=memo.concat(SWUtils.trimBoth(SWUtils.trimBoth(val.slice(lastclosing+2)).replace('&amp;','&').split(/(?=[\@\&]\{)/)));
           }
         }
       } else {
         val=val.replace('&amp;','&');
         memo=memo.concat(SWUtils.trimBoth(val.split(/(?=[\@\&]\{)/)));
       }
     } catch (err){
       TAS.error("splitmacro",err);
     } finally {
       return memo;
     }
   },[]);
   return newsplit;
 },
 /** arrayToMap Splits array of {{x=y}} to mapping of '{{x=': 'y}}'
 * and splits &{template:templatename} on the :
 * unless the item has no equals sign then the value = map.
 *    e.g. @{option}  is returned as @{option}=@{option}
 *@param {Array} currArray of strings for rolltemplate {{key=value}}
 *@returns {jsobj} of each array entry split in half
 */
 arrayToMap = function(currArray,removeWhisper){
   return _.reduce(currArray,function(memo,val){
     var spliteq=val.split('=');
     if (val){
       if(spliteq.length===2){
         memo[spliteq[0]+'=']=spliteq[1];
       } else if(spliteq.length>2){
         memo[spliteq[0]+'=']= _.rest(spliteq,1).join('=');
       } else if ((/template:/).test(val)){
         memo['&{template:']=val.slice(val.indexOf(':')+1);
       } else if (!(removeWhisper && (/whisper/i).test(val))){
         memo[val]=val;
       }
     }
     return memo;
   },{});
 },
 /**mergeMacroMaps merges currMap into defaultMap
 *@param {jsobj} currMap map of the current macro text on a sheet created by arrayToMap:
               {rollqueryleft: rollqueryright}
 *@param {jsobj} defaultMap {rollqueryleft : {
               current:rollqueryright,
               old:[  oldrollqueryright1, oldrollqueryright2 ],
               replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}]
               }
             }
 *@param {Array} sameAsKeys array of strings of keys in defaultMap where value.current is the same string as the key
 *@returns {Array} of strings for macro entries.
 */
 mergeMacroMaps = function(currMap,defaultMap,sameAsKeys){
   var currKeys=[],newKeys=[],customKeys=[], newArray=[] , customizedMap={}, userDefinedMap={};
   try {
     currKeys = _.keys(currMap).sort();
     customKeys = _.difference(currKeys,_.keys(defaultMap)).sort();
     if (!sameAsKeys || _.size(sameAsKeys)===0 ){
       sameAsKeys = _.reduce(defaultMap,function(memo,val,key){
         if (val.current===key){
           memo.push(key);
         }
         return memo;
       },[]).sort();
     }
     //TAS.debug("at mergeMacroMaps comparing: ",currMap,defaultMap,sameAsKeys);
     customizedMap = _.chain(defaultMap)
       .pick(function(compareobj,defaultKey){
         //intersection
         return (_.indexOf(currKeys,defaultKey,true) >=0 );
       })
       .omit(function(compareobj,defaultKey){
         //difference
         return (_.indexOf(sameAsKeys,defaultKey,true)>=0);
       })
       .omit(function(compareobj,defaultKey){
         //user val = new
         return (compareobj.current === currMap[defaultKey]);
       })
       .omit(function(compareobj,defaultKey){
         //user val = one of old vals
         return ( !(compareobj.old) || (_.indexOf(compareobj.old,currMap[defaultKey]) >=0)  );
       })
       .mapObject(function(compareobj,defaultKey){
         //only customized values left, if any
         var newString='';
         try {
           newString = currMap[defaultKey];
           if (newString){
             if (compareobj.replacements){
               newString = _.reduce(compareobj.replacements,function(memo,replacer){
                 return memo.replace(replacer.from,replacer.to);
                 },newString);
             }
             newString = defaultKey + newString;
           }
         } catch (erri) {
           TAS.error('mergeMacroMaps  erri on '+defaultKey,erri);
         } finally {
           return newString;
         }
       }).value();

     //extra stuff from user.
     userDefinedMap = _.reduce (customKeys,function(memo,currKey){
         if( currKey !== currMap[currKey] ){
           memo[currKey] = currKey+currMap[currKey];
         } else {
           memo[currKey] = currKey;
         }
         return memo;
       },{});

     //TAS.info("joining ",defaultMap,customizedMap,userDefinedMap);
     //array in order of defaultMap, add in custom values, then turn to array
     newArray = _.chain(defaultMap)
       .mapObject(function(compareobj,defaultKey){
         if (_.indexOf(sameAsKeys,defaultKey)>=0){

           return defaultKey;
         }
         return defaultKey + compareobj.current;
       })
       .extend(customizedMap)
       .extend(userDefinedMap)
       .values()
       .value();

   } catch(err3) {
     TAS.error("getNewArray outer error",err3);
   } finally {
     return newArray;
   }
 },
 /**migrateMacro makes sure one macro is up to date, synchronous.
 *@param {string} currMacro current macro from sheet
 *@param {string} defaultMacro default / new correct macro string
 *@param {jsobj} defaultMap {rollqueryleft : {
               current:rollqueryright,
               old:[  oldrollqueryright1, oldrollqueryright2 ],
               replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}]
               }
             }
 *@param {Array} deleteArray array of strings to just delete from the currMacro.
 *@param {Array} sameAsKeys array of strings of keys in defaultMap where value.current is the same string as the key
 *@returns {string} one of 3 values:
       null if caller should NOT update macro,
       "BLANK" if caller should update macro attribute with "" to reset it.
       any other string: the new macro (if the user customized it, then this is the new one with updates)
 */
 migrateMacro = function (currMacro,defaultMacro,defaultMap,deleteArray,sameAsKeys) {
   var currMacroArray, currMacroMap,newMacroArray,newMacroString=null;
   try {
     if (currMacro !== defaultMacro){
       if (deleteArray && Array.isArray(deleteArray)){
         _.each(deleteArray,function(strToDelete){
           currMacro = currMacro.replace(strToDelete,'');
         });
       }
       if (currMacro===defaultMacro){
         newMacroString=null;
       } else {
         currMacroArray = splitMacro(currMacro);
         currMacroArray = _.reject(currMacroArray,function(val){
           return (!val || val==="0" || val==="1" || val.indexOf("undefined")>=0);
         });
         currMacroMap = arrayToMap(currMacroArray,true);
         //TAS.info("migrateMacro calling map with ",currMacroMap,defaultMap,sameAsKeys);
         newMacroArray = mergeMacroMaps (currMacroMap,defaultMap,sameAsKeys);
         //TAS.debug("migrateMacro received back ",newMacroArray);
         newMacroArray = _.reject(newMacroArray,function(val){
           return (!val || val==="0" || val==="1" || val.indexOf("undefined")>=0);
         });
         newMacroString = newMacroArray.join(' ');
         if (newMacroString === defaultMacro){
           newMacroString= 'BLANK';
         }
       }
     }
   } catch (err){
     TAS.error("PFMacros.migrateMacro error on "+currMacro,err);
   } finally {
     return newMacroString;
   }
 },
 /**migrateRepeatingMacros updates all macros in the section
 *@param {function} callback after calling setAttrs with the new macros
 *@param {string} section  name after "repeating_"
 *@param {string} fieldname  the attribute name containing the macro after "id_"
 *@param {string} defaultMacro the current Macro in the page
 *@param {jsobj} defaultMap map of "{{rolltemplatekey=" to right side "var}}"
     {rollqueryleft : {
       current:rollqueryright,
       old:[  oldrollqueryright1, oldrollqueryright2 ],
       replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}]
       }
     }
 *@param {Array} deleteArray  array of strings of old rolltemplate entries that are not used (entire entry not just left side )
 */
 migrateRepeatingMacros = function (callback,section,fieldname,defaultMacro,defaultMap,deleteArray, whisper){
   var done = _.once(function(){
     TAS.debug("leaving migrateRepeatingMacros for "+ section + ", "+fieldname);
     if (typeof callback === "function") {
       callback();
     }
   });
   whisper=whisper||'';
   if (whisper) {whisper+=' ';}
   getSectionIDs('repeating_'+section,function(ids){
     var fields=[],prefix='repeating_'+section+'_';
     if (!ids || _.size(ids)===0){
       done();
       return;
     }
     _.each(ids,function(id){
       fields.push(prefix+id+'_'+fieldname);
     });
     getAttrs(fields,function(v){
       var setter={},sameAsKeys=[];
       sameAsKeys = _.reduce(defaultMap,function(memo,val,key){
         if (val.current===key){
           memo.push(key);
         }
         return memo;
       },[]).sort();
       setter=_.reduce(v,function(memo,currMacro,key){
         var newMacro="";
         try {
           if (!currMacro){
             //setting to blank does not seem to work, it keeps coming back as undefined, so set to default.
             memo[key]=whisper +defaultMacro;
           } else {
             currMacro=PFUtils.removeWhisperFromMacro(currMacro);
             newMacro = migrateMacro(currMacro,defaultMacro,defaultMap,deleteArray,sameAsKeys);
             if (newMacro==="BLANK") {
               memo[key]="";
             } else if (newMacro){
               memo[key]=whisper + newMacro;
             }
           }
         } catch (innererr){
           TAS.error("migrateRepeatingMacros error migrating "+ key,innererr);
         } finally {
           return memo;
         }
       },{});
       if (_.size(setter)>0){
         setAttrs(setter,{},done);
       } else {
         done();
       }
     });
   });
 },
 /**Calls migrateRepeatingMacros once for each version of the parameters in replaceArray
 * each parameter below potentially has the word 'REPLACE' in it, for each element in replaceArray,
 * replace the word REPLACE with that element.
 * This is not the most efficient, but it was alot easier than rewriting migrateRepeatingMacros
 *@param {function} callback after calling setAttrs with the new macros
 *@param {string} section  name after "repeating_"
 *@param {string} fieldname  the attribute name containing the macro after "id_"
 *@param {string} defaultMacro the current Macro in the page
 *@param {jsobj} defaultMap map of "{{rolltemplatekey=" to right side "var}}"
     {rollqueryleft : {
       current:rollqueryright,
       old:[  oldrollqueryright1, oldrollqueryright2 ],
       replacements:[  { from: fromstring, to:tostring}, {from:fromstring, to:tostring}]
       }
     }
 *@param {Array} deleteArray array of strings of old rolltemplate entries that are not used (entire entry not just left side )
 *@param {Array} replaceArray array of strings to replace the word 'REPLACE' with that are found in the other params.
 */
 migrateRepeatingMacrosMult = function (callback,section,fieldname,defaultMacro,defaultMap,deleteArray,replaceArray, whisper){
   var done=_.once(function(){
     TAS.debug("leaving migrateRepeatingMacrosMult for "+section+"_"+fieldname);
     if (typeof callback === "function"){
       callback();
     }
   }),
   fieldnames={}, defaultMacros={}, defaultMaps={}, deleteArrays={}, numTimes, doneOnce;
   try {
     if(!( replaceArray && Array.isArray(replaceArray) && _.size(replaceArray)>0)){
       TAS.warn("migrateRepeatingMacrosMult no replace array for "+section+", "+fieldname);
       done();
       return;
     }
     numTimes = _.size(replaceArray);
     doneOnce = _.after(numTimes,done);
     //create new mappings of fieldname, defaultMacro, defaultMap, deleteArray
     //one new version of each per element in replaceArray.
     fieldnames = _.reduce(replaceArray,function(m,val){
       m[val]=fieldname.replace(/REPLACE/g,val);
       return m;
     },{});
     defaultMacros = _.reduce(replaceArray,function(m,val){
       m[val]=defaultMacro.replace(/REPLACE/g,val);
       return m;
     },{});
     defaultMaps =_.reduce(replaceArray,function(replaceMemo,val){
       var newMap ={};
       try {
         newMap =_.reduce(defaultMap,function(m,currobj,key){
           var newkey, newobj={};
           try {
             newkey = key.replace(/REPLACE/g,val);
             newobj.current = currobj.current.replace(/REPLACE/g,val);
             if(currobj.old){
               newobj.old = _.map(currobj.old,function(oldmacro){
                 return oldmacro.replace(/REPLACE/g,val);
               });
             }
             if (currobj.replacements){
               newobj.replacements= _.map(currobj.replacements,function(replacementobj){
                 var newreplacement = {};
                 newreplacement.from = replacementobj.from.replace(/REPLACE/g,val);
                 newreplacement.to = replacementobj.to.replace(/REPLACE/g,val);
                 return newreplacement;
               });
             }
             m[newkey]=newobj;
           } catch (innererr){
             TAS.error("migrateRepeatingMacrosMult, error creating defaultMaps: replaceval"+val+", key="+key+", matching obj:",currobj);
           } finally {
             return m;
           }
         },{});
         replaceMemo[val]=newMap;
       } catch (errineer2){
         TAS.error("error building map of defaultMap : replaceval:"+val);
       } finally {
         return replaceMemo;
       }
     },{});
     if(deleteArray){
       deleteArrays = _.reduce(replaceArray,function(m,val){
         m[val] = _.map(deleteArray,function(delstr){
             return delstr.replace(/REPLACE/g,val);
           });
         return m;
       },{});
     }
     _.each(replaceArray,function(val){
       var delArray;
       try {
         if(fieldnames[val] && defaultMacros[val] && defaultMaps[val] ){
           delArray= deleteArrays[val]||null;
           migrateRepeatingMacros(doneOnce,section,fieldnames[val],defaultMacros[val],defaultMaps[val],delArray,whisper);
         } else {
           doneOnce();
         }
       } catch(err){
         TAS.error("migrateRepeatingMacrosMult error calling migrateRepeatingMacros for "+val,err);
         doneOnce();
       }
     });
   } catch (outererr){
     TAS.ERROR("migrateRepeatingMacrosMult error in outermost section SHOULD NOT HAPPEN ",outererr);
     done();
   }
 },
 migrateStaticMacro = function(callback, fieldname, defaultMacro, defaultMap, deleteArray, sameAsKeys, whisper){
   var done = _.once(function(){
     TAS.debug("leaving migrateRepeatingMacros for "+ fieldname);
     if (typeof callback === "function") {
       callback();
     }
   });
   whisper=whisper||'';
   if (whisper) {whisper+=' ';}
   //TAS.debug("at PFMacros.migrateStaticMacro for repeating_"+ fieldname);
   getAttrs([fieldname],function(v){
     var setter={}, newMacro='', currMacro='';
     try {
       if (!sameAsKeys){
         sameAsKeys = _.reduce(defaultMap,function(memo,val,key){
           if (val.current===key){
             memo.push(key);
           }
           return memo;
         },[]).sort();
       }
       currMacro = v[fieldname];
       if(!currMacro){
         setter[fieldname]=whisper + defaultMacro;
       } else {
         currMacro=PFUtils.removeWhisperFromMacro(currMacro);
         newMacro = migrateMacro(currMacro,defaultMacro,defaultMap,deleteArray,sameAsKeys);
         if(newMacro){
           if (newMacro === 'BLANK'){
             setter[fieldname]="";
           } else {
             setter[fieldname]=whisper + newMacro;
           }
         }
       }
     } catch (innererr){
       TAS.error("migrateRepeatingMacros error migrating "+fieldname+", "+currMacro,innererr);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter,{},done);
       } else {
         done();
       }
     }
   });
 },
 migrateStaticMacros = function (callback,fieldnames,defaultMacros,defaultMaps,deleteArrays, sameAsKeys, whisper){
   var done = _.once(function(){
     TAS.debug("leaving migrateStaticMacros ");
     if (typeof callback === "function") {
       callback();
     }
   }), fields =[], keys=[];
   whisper=whisper||'';
   if (whisper) {whisper+=' ';}
   fields =_.values(fieldnames);
   keys = _.keys(fieldnames);
   getAttrs(fields,function(v){
     var setter={};
     if (!sameAsKeys || !Array.isArray(sameAsKeys) || _.size(sameAsKeys)===0){
       sameAsKeys = _.reduce(defaultMaps[0],function(memo,val,key){
         if (val.current===key){
           memo.push(key);
         }
         return memo;
       },[]).sort();
     }
     setter=_.reduce(keys,function(memo,key){
       var newMacro="", currMacro="", delArray=null, field='';
       try {
         field=fieldnames[key];
         currMacro = v[field];
         if(!currMacro){
           memo[field]=defaultMacros[key];
         } else {
           if(deleteArrays && deleteArrays[key]){
             delArray = deleteArrays[key];
           }
           if (currMacro){
             newMacro = migrateMacro(currMacro,defaultMacros[key],defaultMaps[key],delArray,sameAsKeys);
             if (newMacro==="BLANK") {
               memo[field]="";
             } else if (newMacro){
               memo[field]=newMacro;
             }
           }
         }
       } catch (innererr){
         TAS.error("migrateStaticMacros error migrating "+ key,innererr);
       } finally {
         return memo;
       }
     },{});
     //TAS.debug("migrateStaticMacros setting ", setter);
     if (_.size(setter)>0){
       setAttrs(setter,{},done);
     } else {
       done();
     }
   });
 },
 migrateStaticMacrosMult = function(callback, fieldname, defaultMacro, defaultMap, deleteArray, replaceArray, keysToReplaceShortcut, valsToReplaceShortcut, useNoNumber, whisper){
   var done=_.once(function(){
     TAS.debug("leaving migrateRepeatingMacrosMult for "+fieldname);
     if (typeof callback === "function"){
       callback();
     }
   }),
   fieldnames={}, replacers = {},defaultMacros={}, defaultMaps={}, deleteArrays={}, numTimes, doneOnce, sameAsKeys,
   replaceStrings = function(str,val){
     var fromAndTos=[];
     try {
       fromAndTos =replacers[val];
       //TAS.debug("now using replacer to replace :"+val+" in "+str,fromAndTos);
       if (fromAndTos){
         _.each(fromAndTos,function(replacer){
           str = str.replace(replacer.from,replacer.to);
         });
       }
     } catch (err){
       TAS.error("PFMacros migrateStaticMacrosMult replaceStrings error replacing  "+val+" in "+str,replacers[val],err);
     } finally {
       return str;
     }
   };
   try {
     whisper=whisper||'';
     if (whisper) {whisper+=' ';}
     if(!( replaceArray && Array.isArray(replaceArray) )){
       TAS.warn("migrateStaticMacrosMult no replace array for  "+fieldname);
       done();
       return;
     }
     numTimes = _.size(replaceArray);
     doneOnce = _.after(numTimes,done);
     //create new mappings of fieldname, defaultMacro, defaultMap, deleteArray
     //one new version of each per element in replaceArray.
     if (useNoNumber){
       replacers = _.reduce(replaceArray,function(m,val){
         var valNoNum = val.replace(/\d+/g,'').replace(/\-+$/,'');
           m[val] = [{ 'from':/REPLACELOWERREMOVENUMBER/g, 'to': valNoNum.toLowerCase()},
             {'from':/REPLACELOWER/g, 'to': val.toLowerCase()},
             {'from':/REPLACEREMOVENUMBER/g, 'to': valNoNum},
             {'from':/REPLACE/g, 'to': val}];
           return m;
       },{});
     } else {
       replacers = _.reduce(replaceArray,function(m,val){
         m[val] = [{'from':/REPLACELOWER/g, 'to': val.toLowerCase()},
           {'from':/REPLACE/g, 'to': val}];
         return m;
       },{});
     }
     fieldnames = _.reduce(replaceArray,function(m,val){
       m[val]=fieldname.replace(/REPLACE/g,val);
       return m;
     },{});
     sameAsKeys = _.reduce(defaultMap,function(memo,compObj,key){
       var replacedKeys=[];
       if (compObj.current===key){
         //see if this needs replacing.
         if (_.indexOf(keysToReplaceShortcut,key,true)>=0){
           replacedKeys = _.map(replaceArray,function(replaceKey){
             return key.replace(/REPLACE/g, replaceKey);
           });
           memo = memo.concat(replacedKeys);
         } else {
           memo.push(key);
         }
       }
       return memo;
     },[]).sort();

     defaultMacros = _.reduce(replaceArray,function(m,val){
       var newMacro = replaceStrings(defaultMacro, val);
       m[val]=newMacro;
       return m;
     },{});
     defaultMaps =_.reduce(replaceArray,function(replaceMemo,val){
       var newMap ={};
       try {
         newMap =_.reduce(defaultMap,function(memo,currobj,key){
           var newkey, newobj={};
           try {
             if (_.indexOf(keysToReplaceShortcut,key,true)>=0){
               newkey = key.replace(/REPLACE/g,val);
             } else {
               newkey = key;
             }
             if (_.indexOf(valsToReplaceShortcut,key,true)>=0){
               newobj.current = replaceStrings(currobj.current, val);
               if(currobj.old){
                 newobj.old = _.map(currobj.old,function(oldmacro){
                   return replaceStrings(oldmacro, val);
                 });
               }
             } else {
               newobj.current = currobj.current;
               if (currobj.old){
                 newobj.old = currobj.old;
               }
             }
             if (currobj.replacements){
               newobj.replacements = currobj.replacements;
             }
             memo[newkey]=newobj;
           } catch (innererr) {
             TAS.error("migrateStaticMacrosMult error creating defaultMaps: replaceval"+val+", key="+key+", matching obj:",currobj);
           } finally {
             return memo;
           }
         },{});
         replaceMemo[val]=newMap;
       } catch (errineer2){
         TAS.error("migrateStaticMacrosMult error building map of defaultMap : replaceval:"+val);
       } finally {
         return replaceMemo;
       }
     },{});

     if(deleteArray){
       deleteArrays = _.reduce(replaceArray,function(m,val){
         m[val] = _.map(deleteArray,function(delstr){
             return replaceStrings(delstr,val);
           });
         return m;
       },{});
     }
     migrateStaticMacros(done,fieldnames,defaultMacros,defaultMaps,deleteArrays,sameAsKeys,whisper);
   } catch (outererr){
     TAS.ERROR("migrateStaticMacrosMult error in outermost section SHOULD NOT HAPPEN ",outererr);
     done();
   }
 };
 console.log(PFLog.l + '   PFMacros module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrateMacro:migrateMacro,
   migrateRepeatingMacros:migrateRepeatingMacros,
   migrateRepeatingMacrosMult: migrateRepeatingMacrosMult,
   migrateStaticMacro: migrateStaticMacro,
   migrateStaticMacros: migrateStaticMacros,
   migrateStaticMacrosMult: migrateStaticMacrosMult
 };
}());
var PFMenus = PFMenus || (function () {
 'use strict';
 /** creates a command macro button for a repeating section
 * it also extends to add old lists using "extendbysections"
 * @param {jsmap} baseAttribs object of schema:
 *  name:string ex:'abilities',
 *  template:string ex:'pf_generic',
 *  header:string ex:'header_image-pf_generic',
 *  section:string the name after 'repeating_' e.g. weapon,item, spells, etc
 *  bonusField:string bonus attr to add at the end of the name attr of each row, put into parenthesis, such as Burning Hands (Sp),
 *  usesField:string used or attr name with |max if instead to print uses/max,
 *  nameField:string name of header of menu written to {{#name}}
 *  linkField:string the attr of the roll button 'roll'
 *  npclinkField:string if necessary, different link field to use if the char is an NPC
 *  filterField:string optional attr to pass to _.filter or _.pick , if 1 then display, if 0 then don't , ex:'showinmenu'
 *  filterValue:string if filter should be custom (not 1/0) then fill in value ex: 'Sp', cannot be '0' (zero)
 *  groupByField:string optional name of attr to group by
 *  translateGroup: if ^{} should be placed around groupby field value
 *  translateBonus: if ^{} should be placed around bonus field value
 *  groupMap:{key:string,key:string} if instead of grouping by the groupField itself, pass the value to a map and group by the result.
 * @param {function(string)} callback Pass string for command macro as first param, or ""
 */
 var
 menuMap={
   'class-ability':{'name':'original-class-features-list','section':'class-ability'},
   'feat':{'npcMacroName':'NPC-feat','name':'original-feats-list','section':'feat','npcLinkField':'npc-roll'},
   'racial-trait':{'npcMacroName':'NPC-racial-trait','name':'original-racial-traits-list','section':'racial-trait','npcLinkField':'npc-roll'},
   'trait':{'name':'original-traits-list','section':'trait'},
   'mythic-ability':{'name':'mythic-abilities','section':'mythic-ability'},
   'mythic-feat':{'name':'mythic-feats','section':'mythic-feat'},
   'npc-spell-like-abilities':{'name':'original-spell-like-abilities-list','section':'npc-spell-like-abilities'},
   'ability':{'npcMacroName':'NPC-ability','name':'abilities','section':'ability','groupBy':'rule_category','translateGroup':1,'npcLinkField':'npc-roll'},
   'ex':{'npcMacroName':'NPC-ex','name':'extraordinary-abilities-menu','section':'ability','filterField':'ability_type','filterValue':'Ex','groupBy':'frequency','translateGroup':1,'altUsesField':'rounds_between','npcLinkField':'npc-roll'},
   'sp':{'npcMacroName':'NPC-sp','name':'spell-like-abilities-menu','section':'ability','filterField':'ability_type','filterValue':'Sp','groupBy':'frequency','translateGroup':1,'altUsesField':'rounds_between','npcLinkField':'npc-roll'},
   'su':{'npcMacroName':'NPC-su','name':'supernatural-abilities-menu','section':'ability','filterField':'ability_type','filterValue':'Su','groupBy':'frequency','translateGroup':1,'altUsesField':'rounds_between','npcLinkField':'npc-roll'},
   'item':{'npcMacroName':'NPC-item','name':'items','section':'item','usesField':'qty','bonusField':'','groupBy':'equip-type','translateGroup':1,'npcLinkField':'npc-roll'}
 },

 getRepeatingCommandMacro = function(baseAttribs,callback,header){
   var done = function (macro) {
       TAS.debug("Leaving PFMenus.getRepeatingCommandMacro");
       //TAS.debug("returning with ",macro);
       if (typeof callback === "function") { callback(macro); }
     },
     defaultTemplate = "pf_block",
     defaultHeader="header_image-pf_block",
     defaultName="ability-menus",
     nameField = "name",
     bonusField ="",
     usesField="",
     altUsesField="",
     groupByField="",
     linkField="roll",
     filterField="",
     filterValue="",
     baseMacro = "/w \"@{character_name}\" &{template:REPLACETEMPLATE} @{toggle_attack_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{REPLACEHEADER}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle=REPLACESUBTITLE}} {{name=REPLACENPC^{REPLACENAME}}}",
     baseCommand = " [ REPLACEBUTTON ](~@{character_id}|REPLACELINK)",
     noRows = " {{description=^{none-available} }}";
   if (!baseAttribs || !baseAttribs.section || !baseAttribs.linkField){
     done("");
     return;
   }
   try {
     header=header||"";
     baseMacro = baseMacro.replace('REPLACETEMPLATE',baseAttribs.template||defaultTemplate);
     baseMacro = baseMacro.replace('REPLACEHEADER',baseAttribs.header||defaultHeader);
     baseMacro = baseMacro.replace('REPLACENAME',baseAttribs.name||defaultName);
     baseMacro = baseMacro.replace('REPLACESUBTITLE','');
     baseMacro = baseMacro.replace(/REPLACENPC/g,baseAttribs.npcName||'');
     baseMacro += header;
     nameField=baseAttribs.nameField||nameField;
     bonusField=baseAttribs.bonusField||bonusField;
     usesField=baseAttribs.usesField||usesField;
     linkField=baseAttribs.linkField||linkField;
     groupByField=baseAttribs.groupBy||groupByField;
     filterField=baseAttribs.filterField||filterField;
     altUsesField=baseAttribs.altUsesField||altUsesField;
     //TAS.debug("PFMenus.getRepeatingCommandMacro attribs, menu so far:",baseAttribs,baseMacro);
   } catch (outerErr){
     TAS.error("PFMenus.getRepeatingCommandMacro outererror for "+ baseAttribs.section, outerErr);
     done("");
     return;
   }
   getSectionIDs("repeating_"+baseAttribs.section,function(ids){
     var fields=[],prefix="repeating_"+baseAttribs.section+"_";
     try {
       if (_.size(ids)<0){
         TAS.error("It says "+baseAttribs.section+" has no rows!");
         done(baseMacro+ noRows);
         return;
       }
       _.each(ids,function(id){
         var linePrefix=prefix+id+"_";
         fields.push(linePrefix+nameField);
         fields.push(linePrefix+'showinmenu');
         if (bonusField){
           fields.push(linePrefix+bonusField);
         }
         if (usesField){
           fields.push(linePrefix+usesField);
           fields.push(linePrefix+usesField+"_max");
         }
         if (filterField){
           fields.push(linePrefix+filterField);
         }
         if (groupByField){
           fields.push(linePrefix+groupByField);
         }
         if (altUsesField){
           fields.push(linePrefix+altUsesField);
         }
       });
     } catch (outerError2){
       TAS.error("PFMenus.getRepeatingCommandMacro outererror 2 assembling all attrs in rows for "+ baseAttribs.section, outerError2);
       done("");
       return;
     }
     fields.push( '_reporder_repeating_'+baseAttribs.section);
     getAttrs(fields,function(v){
       var restOfMacro="", totalMacro="",orderedList,repList,customSorted=0, rowCounter=20;
       try {
         if (v['_reporder_repeating_'+baseAttribs.section]) {
           repList = v['_reporder_repeating_'+baseAttribs.section].split(",");
           repList = _.map(repList, function (ID) {
             return ID.toLowerCase();
           });
           orderedList = _.intersection(_.union(repList, ids), ids);
           customSorted = 1;
         } else {
           orderedList = ids;
         }
         restOfMacro=_.chain(orderedList)
           .map(function(id){
             var linePrefix=prefix+id+'_',buttonName='',bonus='',uses='',max='',usesStr='',tempshow=0,
             retObj= {
               'id': id,
               'name': (v[linePrefix+'name']||id),
               'showinmenu':1
             };
             try {
               if (usesField){
                 uses = v[linePrefix+usesField]||'';
                 max = v[linePrefix+usesField+"_max"]||'';
               }
               if (groupByField && v[linePrefix+groupByField]){
                 if (baseAttribs.groupMap){
                   if (baseAttribs.groupMap[v[linePrefix+groupByField]]){
                     retObj.group = baseAttribs.groupMap[v[linePrefix+groupByField]];
                   } else {
                     retObj.group='AAAAAA';
                   }
                 } else if (groupByField==='frequency' ){
                   switch(v[linePrefix+groupByField]){
                     case 'perday':
                       retObj.group='';
                       if (max) {
                         retObj.group = max + ' ';
                       }
                       retObj.group += (baseAttribs.translateGroup?'^{':'') + v[linePrefix+groupByField] + (baseAttribs.translateGroup?'}':'');
                       retObj.doNotTranslate=1;
                       break;
                     case 'not-applicable':
                       retObj.group='AAAAAA';
                       uses=0;
                       max=0;
                       break;
                     case 'constant':
                     case 'atwill':
                       retObj.group=v[linePrefix+groupByField];
                       uses=0;
                       max=0;
                       break;
                     case 'hexfreq':
                     case 'other':
                       retObj.group=v[linePrefix+groupByField];
                       break;
                     case 'everyrounds':
                       retObj.group=v[linePrefix+groupByField];
                       if(v[linePrefix+altUsesField]){
                         uses= v[linePrefix+altUsesField];
                         max=0;
                       }
                       break;
                     default:
                       retObj.group=v[linePrefix+groupByField];
                       break;
                   }
                 } else {
                   retObj.group =  v[linePrefix+groupByField];
                 }
               } else {
                 retObj.group='AAAAAA';
               }
               if (retObj.group!=='AAAAAA' && baseAttribs.translateGroup && !retObj.doNotTranslate){
                 retObj.group = '^{'+retObj.group+'}';
               }
               if (usesField){
                 if(uses&&max){
                   usesStr = ' ('+uses+'/'+max+')';
                 } else if (uses){
                   usesStr = ' ('+uses+')';
                 }
               }
               if (filterField){
                 if(baseAttribs.filterValue){
                   if(String(v[linePrefix+filterField]) === String(baseAttribs.filterValue)){
                     retObj.showinmenu = 1;
                   } else {
                     retObj.showinmenu = 0;
                   }
                 } else {
                   retObj.showinmenu = parseInt(v[linePrefix+filterField],10)||0;
                 }
               } else {
                 retObj.showinmenu = 1;
               }
               if(retObj.showinmenu){
                 tempshow=parseInt(v[linePrefix+'showinmenu'],10)||0;
                 retObj.showinmenu = retObj.showinmenu && tempshow;
               }
               if (bonusField && v[linePrefix+bonusField] && v[linePrefix+bonusField]!=='not-applicable'){
                 bonus = ' (' + (baseAttribs.translateBonus?'^{':'') + v[linePrefix+bonusField] + (baseAttribs.translateBonus?'}':'') +')';
               }
               buttonName  = retObj.name + bonus + usesStr;
               retObj.chatLink='['+SWUtils.escapeForRollTemplate(SWUtils.escapeForChatLinkButton(buttonName))+'](~@{character_id}|'+ linePrefix + linkField + ')';
             } catch (builderr){
               TAS.error("PFMenus.getRepeatingCommandMacro builderr object for id "+id,builderr);
             } finally {
               return retObj;
             }
           })
           .filter(function(o){return o.showinmenu;})
           .sortBy('group');
           if(groupByField==='frequency'){
             restOfMacro = restOfMacro.reverse();
           }
           restOfMacro=restOfMacro.groupBy('group')
           .reduce(function(m,rowList,groupName){
             var restOflink='';
             try {
               if(groupName !== 'AAAAAA' && _.size(rowList)>0){
                 m += ' {{row'+ String(rowCounter) + '=' + SWUtils.escapeForRollTemplate(groupName) + '}}';
                 rowCounter++;
               }
               restOflink=_.reduce(rowList,function(mi,o){
                 mi+= ' '+ o.chatLink;
                 return mi;
               },' {{row' + String(rowCounter)+ '=' );
               m  += restOflink + '}}';
               rowCounter++;
             } catch (strerror) {
               TAS.error("PFMenus.getRepeatingCommandMacro strerror creating string for group "+groupName,strerror);
             } finally {
               return m;
             }
           },"")
           .value();
       } catch (innererror2){
         TAS.error("PFMenus.getRepeatingCommandMacro innererror2 for "+ baseAttribs.section, innererror2);
       } finally {
         if (restOfMacro){
           totalMacro = baseMacro + restOfMacro;
         } else {
           totalMacro=baseMacro + noRows;
         }
         done(totalMacro);
       }
     });
   });
 },
 /**resetOneCommandMacro sets command button macro with all rows from one ability list.
 * calls PFMenus.getRepeatingCommandMacro
 * sets the returned string to macro with attribute name: section+"_buttons_macro"
 *@param {string} section name after "repeating_"
 *@param {boolean} isNPC  true if npc false or not needed otherwise.
 *@param {function} callback  when done
 */
 resetOneCommandMacro=function(menuName,isNPC,callback,header,groupMap){
   var done = _.once(function () {
       TAS.debug("leaving PFMenus.resetOneCommandMacro: " + menuName);
       if (typeof callback === "function") {
         callback();
       }
     }),
     params={},
     macroName=menuName;
   params ={
     'usesField': 'used',
     'linkField': 'roll',
     'nameField': 'name',
     'bonusField':'ability_type',
     'translateBonus':1
     };
   if (menuMap[menuName]) {
     params = _.extend(params,menuMap[menuName]);
     if(isNPC){
       if (menuMap[menuName].npcLinkField){
         params.linkField=menuMap[menuName].npcLinkField;
       }
       if(menuMap[menuName].npcMacroName){
         macroName = menuMap[menuName].npcMacroName;
         params.npcName = ' ^{npc} ';
       }
     }
   } else {
     TAS.warn("Could not find parameters for menu "+menuName);
   }
   if (groupMap && params.groupBy){
     params.groupMap = groupMap;
   }
   //TAS.debug("PFMenus.resetOneCommandMacro getting rollmenu for "+menuName,params);
   getRepeatingCommandMacro( params,function(newMacro){
     var setter={};
     //TAS.debug("PFMenus.resetOneCommandMacro returned for "+menuName,newMacro);
     setter[macroName+"_buttons_macro"]=newMacro||"";
     setAttrs(setter,PFConst.silentParams,done);
   },header);
 },
 /** same as resetOneCommandMacro if you do not know the npc status
 *@param {string} section name after "repeating_"
 *@param {function} callback  when done
 */
 resetOneCommandMacroNoNPC = function(section,callback,header){
   getAttrs(['is_npc'],function(v){
     resetOneCommandMacro(section, (parseInt(v.is_npc,10)||0), callback,header);
   });
 };

 console.log(PFLog.l + '   PFMenus module loaded          ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   resetOneCommandMacro: resetOneCommandMacro,
   resetOneCommandMacroNoNPC: resetOneCommandMacroNoNPC,
   getRepeatingCommandMacro: getRepeatingCommandMacro
 };
} ());
var PFAbilityScores = PFAbilityScores || (function () {
 'use strict';
 var abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
 abilitymods = ["STR-mod", "DEX-mod", "CON-mod", "INT-mod", "WIS-mod", "CHA-mod"],
 /** updateAbilityScore - Updates the final ability score, ability modifier, condition column based on entries in ability grid plus conditions and buffs.
 * Note: Ability value is not affected by damage and penalties, instead only modifier is affected.
 *@param {string} ability 3 letter abbreviation for one of the 6 ability scores, member of PFAbilityScores.abilities
 *@param {eventInfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateAbilityScore = function (ability, eventInfo, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   //TAS.debug("at updateAbilityScore:" + ability);
   getAttrs([ability + "-base", ability + "-enhance", ability + "-inherent", ability + "-misc", ability + "-damage", ability + "-penalty", ability + "-drain", ability, ability + "-mod", ability + "-cond", ability + "-modded", "buff_" + ability + "-total", "buff_" + ability + "-total_penalty", "condition-Helpless"], function (values) {
     var setter = {},
     params = {
       silent: false
     },
     base = 0,
     newVal = 0,
     rawDmg = 0,
     rawPen = 0,
     dmgAndPen = 0,
     rawCond = 0,
     penalized = 0,
     currAbility = 0,
     currMod = 0,
     currPenalized = 0,
     mod = 0;
     try {
       base = parseInt(values[ability + "-base"], 10);
       newVal = (isNaN(base) ? 10 : base) + (parseInt(values[ability + "-enhance"], 10) || 0) + (parseInt(values[ability + "-inherent"], 10) || 0) + (parseInt(values[ability + "-misc"], 10) || 0) + (parseInt(values[ability + "-drain"], 10) || 0) + (parseInt(values["buff_" + ability + "-total"], 10) || 0);
       rawDmg = Math.abs(parseInt(values[ability + "-damage"], 10) || 0);
       rawPen = Math.abs(parseInt(values[ability + "-penalty"], 10) || 0) + Math.abs(parseInt(values["buff_" + ability + "-total_penalty"], 10) || 0);
       dmgAndPen = Math.floor((Math.abs(parseInt(values[ability + "-damage"], 10) || 0) + Math.abs(parseInt(values[ability + "-penalty"], 10) || 0) +
       (Math.abs(parseInt(values["buff_" + ability + "-total_penalty"], 10) || 0)) + Math.abs(parseInt(values[ability + "-cond"], 10) || 0)) / 2);
       rawCond = Math.abs(parseInt(values[ability + "-cond"], 10) || 0);
       currAbility = parseInt(values[ability], 10);
       currPenalized = parseInt(values[ability+"-modded"],10)||0;
       currMod = parseInt(values[ability + "-mod"], 10);
       mod = Math.floor((newVal - 10) / 2) - dmgAndPen;
       //TAS.debug(values);
       if (ability === "DEX" && (parseInt(values["condition-Helpless"], 10) || 0) === 1) {
         newVal = 0;
         mod = -5;
         penalized = 1;
       } else if (rawDmg >= newVal) {
         newVal = 0;
         mod = -5;
         penalized = 1;
       } else if ((rawPen + rawDmg + rawCond) >= (newVal - 1)) {
         //min of 1
         mod = -5;
         penalized = 1;
       } else if (dmgAndPen !== 0) {
         penalized = 1;
       }
       //TAS.debug("base:" + base + ", newval:" + newVal + ", mod:" + mod);
       if (isNaN(base)) {
         setter[ability] = "-";
         setter[ability + "-mod"] = 0;
       } else {
         if (currAbility !== newVal || isNaN(currAbility)) {
           setter[ability] = newVal;
         }
         if (currMod !== mod || isNaN(currMod)) {
           setter[ability + "-mod"] = mod;
         }
       }
       if (penalized && !currPenalized){
         setter[ability+"-modded"]=1;
       } else if (!penalized && currPenalized){
         setter[ability+"-modded"]=0;
       }
     } catch (err) {
       TAS.error("updateAbilityScore:" + ability, err);
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
 },
 /** updateAbilityScores - update all 6 scores then calls callback
 *@param {function(bool)} callback to call when done, pass in true if any changes were made.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateAbilityScores = function (callback, silently) {
   //TAS.debug("at updateAbilityScores");
   var callatend = _.after(6, function (changed) {
     if (typeof callback === "function") {
       callback(changed);
     }
   }),
   anychanged = false,
   thecount = 0,
   calleach = function (newval, currval, changed) {
     anychanged = anychanged || changed;
     thecount++;
     callatend(anychanged);
   };
   _.each(PFAbilityScores.abilities, function (ability) {
     updateAbilityScore(ability, null, calleach, silently);
   });
 },
 /** Sets ability penalties, not "ability check" penalties
 * Sets DEX-cond and STR-cond for fatigued, entangled, and grappled
 *@param {function()} callback to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 applyConditions = function (callback, silently) {
   //TAS.debug("at PFAbilityScores.applyConditions");
   getAttrs(["STR-cond", "DEX-cond", "condition-Fatigued", "condition-Entangled", "condition-Grappled", "condition-Helpless"], function (v) {
     var done = function () {
       if (typeof callback === "function") {
         callback();
       }
     },
     setter = {},
     params = {},
     helpless = parseInt(v["condition-Helpless"], 10) || 0,
     strMod = parseInt(v["condition-Fatigued"], 10) || 0,
     dexMod = 0,
     dexAbMod = 0,
     strAbMod = 0;
     try {
       dexMod = strMod + (parseInt(v["condition-Entangled"], 10) || 0) + (parseInt(v["condition-Grappled"], 10) || 0);
       dexAbMod = dexMod * -2;
       strAbMod = strMod * -2;
       if (!helpless) {
         if (dexAbMod !== (parseInt(v["DEX-cond"], 10) || 0)) {
           setter["DEX-cond"] = dexAbMod;
         }
         if (strAbMod !== (parseInt(v["STR-cond"], 10) || 0)) {
           setter["STR-cond"] = strAbMod;
         }
       } else {
         setter["DEX"] = 0;
         setter["DEX-mod"] = -5;
       }
     } catch (err) {
       TAS.error("PFAbilityScores.applyConditions", err);
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
 },
 /** recalculates all attributes written to by this module.
 *@param {function()} callback to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 *@param {float} oldversion the current @{PFVersion} in the attributes
 */
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFAbilityScores.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   updateScoresOnce = _.once(function () {
     updateAbilityScores(done, silently);
   });
   applyConditions(updateScoresOnce, silently);
 },
 /** map of event types to event string for 'on' function to look for */
 events = {
   abilityEventsAuto: "change:REPLACE-cond",
   abilityEventsPlayer: "change:REPLACE-base change:REPLACE-enhance change:REPLACE-inherent change:REPLACE-misc change:REPLACE-temp change:REPLACE-damage change:REPLACE-penalty change:REPLACE-drain"
 },
 /** Calls 'on' function for everything related to this module */
 registerEventHandlers = function () {
   //register event handlers **********************************************
   _.each(abilities, function (ability) {
     on((events.abilityEventsAuto.replace(/REPLACE/g, ability)), TAS.callback(function eventUpdateAbility(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "sheetworker") {
         updateAbilityScore(ability, eventInfo);
       }
     }));
     on((events.abilityEventsPlayer.replace(/REPLACE/g, ability)), TAS.callback(function eventUpdateAbilityPlayerUpdated(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         updateAbilityScore(ability, eventInfo);
       }
     }));
   });
   on("change:condition-Helpless", TAS.callback(function eventUpdateAbilityHelpless(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateAbilityScore("DEX", eventInfo);
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFAbilityScores module loaded  ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   abilities: abilities,
   abilitymods: abilitymods,
   updateAbilityScore: updateAbilityScore,
   updateAbilityScores: updateAbilityScores,
   applyConditions: applyConditions
 };
}());
var PFMigrate = PFMigrate || (function () {
 'use strict';
 /* default repeating_weapon macro texts and iteratives. old = .56, new = .60 */
 var
 //all user editable fields at the time
 oldSpellUserFieldDefaults = {
   "spellclass_number": {
     "type": "int",
     "val": 0
   },
   "used": {
     "type": "int",
     "val": 0
   },
   "spell_level": {
     "type": "int",
     "val": -1
   },
   "CL_misc": {
     "type": "int",
     "val": 0
   },
   "SP_misc": {
     "type": "int",
     "val": 0
   },
   "Concentration_misc": {
     "type": "int",
     "val": 0
   },
   "range": {
     "type": "text",
     "val": ""
   },
   "name": {
     "type": "text",
     "val": ""
   },
   "school": {
     "type": "text",
     "val": ""
   },
   "cast-time": {
     "type": "text",
     "val": ""
   },
   "components": {
     "type": "text",
     "val": ""
   },
   "targets": {
     "type": "text",
     "val": ""
   },
   "duration": {
     "type": "text",
     "val": ""
   },
   "save": {
     "type": "text",
     "val": ""
   },
   "sr": {
     "type": "text",
     "val": ""
   },
   "description": {
     "type": "text",
     "val": ""
   },
   "macro-text": {
     "type": "text",
     "val": "@{PC-whisper} &{template:pf_spell} {{color}} {{header_image=@{header_image-pf_spell}}} {{name=@{name}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} @{spell_options}"
   },
   "npc-macro-text": {
     "type": "text",
     "val": "@{NPC-whisper} &{template:pf_spell} {{color}} {{header_image=@{header_image-pf_spell}}} {{name=@{name}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} @{spell_options}"
   },
   "isDomain": {
     "type": "checkbox",
     "val": "0"
   }
 },
 /** breaks the damage dropdown into 2 dropdowns, one for the multiplier and one for the attribute
 * done as part of migration to .60
 *@param {Array} ids array of strings which are the row ids
 *@param {function} callback when done
 */
 migrateRepeatingDamage = function (ids,callback) {
   var done=_.once(function(){
     if (typeof callback === "function") {
       callback();
     }
   }),
   setter = {},
   fields = [],
   /** findMultiplier - OLD not used anymore  - returns old damage multiplier when it was in the dropdown.
   * @param {string} str = the value of the damage ability
   * @returns {float} a number indicating the multiplier for the ability mod. Must be 1, .5, 1.5, 2.
   */
   findMultiplier = function (str) {
     var retNum;
     if (!str) {
       return 0;
     }
     if (str.indexOf("1.5") >= 0) {
       retNum = 1.5;
     } else if (str.indexOf(".5") >= 0) {
       retNum = 0.5;
     } else if (str.indexOf("1/2") >= 0) {
       retNum = 0.5;
     } else if (str.indexOf("3/2") >= 0) {
       retNum = 1.5;
     } else if (str.indexOf("1 1/2") >= 0) {
       retNum = 1.5;
     } else if (str.indexOf("2") >= 0) {
       retNum = 2;
     } else {
       retNum = 1;
     }
     return retNum;
   };
   _.each(ids, function (id) {
     var dmgDropdownField = "repeating_weapon_" + id + "_damage-ability",
     abilityMultField = "repeating_weapon_" + id + "_damage_ability_mult";
     fields.push(dmgDropdownField);
     fields.push(abilityMultField);
   });
   getAttrs(fields, function (v) {
     var setter = {};
     try {
       //TAS.debug("migrateRepeatingDamage", "values", v);
       _.each(ids, function (id) {
         var dmgDropdownField = "repeating_weapon_" + id + "_damage-ability",
         abilityMultField = "repeating_weapon_" + id + "_damage_ability_mult",
         ability, multStr, strToSet, multval;
         try {
           ability = PFUtils.findAbilityInString(v[dmgDropdownField]);
           multStr = findMultiplier(v[dmgDropdownField]);
           strToSet = "@{" + ability + "}";
           multval = parseFloat(multStr, 10);
           //multfield is blank but multstr is not.
           if (!(v[abilityMultField]) && multStr && ability) {
             if (!isNaN(multval)) {
               if (multval !== 1.0) {
                 setter[abilityMultField] = multStr;
               }
             }
             if (ability) {
               setter[dmgDropdownField] = strToSet;
             }
           }
         } catch (errinner) {
           TAS.error("migrateRepeatingDamage dropdown to mult: could not migrate str " + v[dmgDropdownField] + " in attack row " + id, errinner);
         }
       });
       setter["migrated_damage-multiplier"] = "1";
     } catch (err) {
       TAS.error("migrateRepeatingDamage outer error!? SHOULD NOT HAPPEN", err);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter, PFConst.silentParams, done);
       } else {
         done();
       }
     }
   });
 },
 /** sets old dropdown  max dex and acp values to new ones for Magik's updates.
 * because old values were so different, new values are set to either "none" or "armor and load"
 */
 migrateMaxDexAndACP = function () {
   getAttrs(["max-dex-source"], function (v) {
     var newMaxDex = 0,
     currMaxDex = parseInt(v["max-dex-source"],10) || 0,
     setter = {};
     if (currMaxDex >= 99) {
       setAttrs(setter, { silent: true });
     }
   });
 },
 /** updates repeating_spells ranges from text to dropdown and custom text field, and range number
 * @param {function} callback call after finishing */
 migrateSpellRanges = function (callback) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getAttrs(["spellranges_migrated"], function (m) {
     var rangeFields = ["casterlevel", "range", "range_numeric", "range_pick", "targets", "name"];
     if (m["spellranges_migrated"] == "1") {
       done();
       return;
     }
     getSectionIDs("repeating_spells", function (ids) {
       var fields = [];
       fields = _.reduce(ids, function (memo, id) {
         var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
         row = _.map(rangeFields, function (field) {
           return prefix + field;
         });
         return memo.concat(row);
       }, []);
       getAttrs(fields, function (v) {
         var setter = {};
         _.each(ids, function (id) {
           var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
           casterlevel = parseInt(v[prefix + "casterlevel"], 10) || 1,
           chosenRange = v[prefix + "range_pick"],
           rangeText = v[prefix + "range"] || "",
           areaEffect = v[prefix + "targets"] || "",
           name = v[prefix + "name"],
           newRange = 0,
           rangeUpdates,
           resetDropdown = false;
           //if dropdown is blank but text filled in try to migrate
           if (!chosenRange && !rangeText) {
             setter[prefix + "range"] = "";
             setter[prefix + "range_numeric"] = 0;
             setter[prefix + "range_pick"] = "blank";
           } else if (((!chosenRange) || chosenRange === "blank") && rangeText) {
             rangeUpdates = PFUtils.parseSpellRangeText(rangeText, areaEffect);
             chosenRange = rangeUpdates.dropdown;
             if (chosenRange === "number" || chosenRange === "perlevel" || rangeUpdates.useorig) {
               rangeText = rangeUpdates.rangeText;
             }
             //otherwise leave it in case user had something they wanted.
             newRange = PFUtils.findSpellRange(rangeText, chosenRange, casterlevel) || 0;
             setter[prefix + "range"] = rangeText;
             setter[prefix + "range_numeric"] = newRange;
             setter[prefix + "range_pick"] = chosenRange;
           } else if (resetDropdown) {
             newRange = PFUtils.findSpellRange(rangeText, chosenRange, casterlevel) || 0;
             setter[prefix + "range_numeric"] = newRange;
             setter[prefix + "range_pick"] = chosenRange;
           }
         });
         setter["spellranges_migrated"] = "1";
         if (_.size(setter) > 0) {
           setAttrs(setter, {
             silent: true
           }, callback);
         } else {
           done();
         }
       });
     });
   });
 },
 /** copies spells from repeating-lvl-*-spells and npc spells to repeating_spells
 * there are bugs in this, but it's so old we never were able to find them all and fix them.
 * @param {function} callback call when done
 * @param {bool} silently if true call setAttrs with PFConst.silentParams
 */
 migrateSpells = function (callback) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   },
   /* determines spell class from class dropdown in the spell repeating row
   * this is not a migrate function, just an old utility function  called by migrate
   */
   handleOldSpellClassDropdown = function (selected, class0name, class1name, class2name) {
     if (!selected) {
       return 0;
     } //it is undefined if it is default set to the first one
     if (selected.indexOf("0") >= 0) {
       return 0;
     }
     if (selected.indexOf("1") >= 0) {
       return 1;
     }
     if (selected.indexOf("2") >= 0) {
       return 2;
     }
     if (selected === class0name) {
       return 0;
     }
     if (selected === class1name) {
       return 1;
     }
     if (selected === class2name) {
       return 2;
     }
     return 0;
   },
   /** this is the old version of updateSpell. This also is not a migrate function but called by migrate
   * @param {string} section the repeating_*** name since old spells had 10 different repeating lists
   * @param {string} id the id of row to update
   * @param {eventInfo} eventInfo object from on method, not used in this.
   * @param {bool} forceRange if true recalculate range
   * @param {function} callback call when done
   */
   updateOldSpell = function (section, id, eventInfo, forceRange, callback) {
     if (section.indexOf("lvl") !== 0 && section.indexOf("npc") !== 0) {
       return;
     }
     var idStr = PFUtils.getRepeatingIDStr(id),
     isNPC = section.indexOf("npc") >= 0 ? 1 : 0,
     prefix = "repeating_" + section + "_" + idStr,
     spellclassField = prefix + "spellclass",
     spellLevelField = isNPC ? (prefix + "level") : (prefix + "spell_level");
     getAttrs([spellLevelField, spellclassField, "spellclass-0-name", "spellclass-1-name", "spellclass-2-name"], function (va) {
       var currSpellLevel = parseInt(va[spellLevelField], 10),
       spellLevel = isNPC ? (isNaN(currSpellLevel) ? 0 : currSpellLevel) : (isNaN(currSpellLevel) ? parseInt(section.substring(4), 10) : currSpellLevel),
       classNum = isNPC ? (section.indexOf("1") >= 0 ? 0 : (section.indexOf("2") >= 0 ? 1 : 0)) : (handleOldSpellClassDropdown(va[spellclassField], va["spellclass-0-name"], va["spellclass-1-name"], va["spellclass-2-name"]) || 0),
       hiddenclassNumField = prefix + "spellclass_number",
       spellDefCastDCField = prefix + "cast_def_dc",
       spellDefConField = prefix + "cast_def-mod",
       spellDCField = prefix + "savedc",
       spellDCUserField = prefix + "DC_misc",
       spellCLField = prefix + "casterlevel",
       spellCLUserField = prefix + "CL_misc",
       spellConField = prefix + "Concentration-mod",
       spellConUserField = prefix + "Concentration_misc",
       spellSpellPenField = prefix + "SP-mod",
       spellSpellPenUserField = prefix + "SP_misc",
       classCLField = "spellclass-" + classNum + "-level-total",
       classDCField = "spellclass-" + classNum + "-level-" + spellLevel + "-savedc",
       classConField = "Concentration-" + classNum,
       classDefConField = "Concentration-" + classNum + "-def",
       classSpellPenField = "spellclass-" + classNum + "-SP-mod",
       spellRangeText = prefix + "range",
       spellRangeNum = prefix + "range_numeric",
       spellRangeTarget = prefix + "targets";
       getAttrs([hiddenclassNumField, spellDCField, spellDCUserField, spellCLField, spellCLUserField, spellConField, spellConUserField, spellDefConField, spellDefCastDCField, spellSpellPenField, spellSpellPenUserField, classDCField, classCLField, classConField, classDefConField, classSpellPenField, spellRangeText, spellRangeNum, spellRangeTarget], function (v) {
         var newDC,
         newCL,
         newCon,
         newDefCon,
         newSpellPen,
         currDC = parseInt(v[spellDCField], 10),
         currCL = parseInt(v[spellCLField], 10),
         currCon = parseInt(v[spellConField], 10),
         currDefCon = parseInt(v[spellDefConField], 10),
         currdefDC = parseInt(v[spellDefCastDCField], 10),
         currSpellPen = parseInt(v[spellSpellPenField], 10),
         classDC = (parseInt(v[classDCField], 10) || 0),
         classCL = (parseInt(v[classCLField], 10) || 0),
         classCon = (parseInt(v[classConField], 10) || 0),
         classDefConMod = (parseInt(v[classDefConField], 10) || 0),
         classSpellPen = classCL + (parseInt(v[classSpellPenField], 10) || 0),
         defDC = 15 + (spellLevel * 2),
         currClassNum = parseInt(v[hiddenclassNumField], 10),
         currRange = parseInt(v[spellRangeNum], 10),
         newRange = 0,
         setter = {},
         setAny = 0,
         classLevelDelta = 0,
         updateRange = false;
         if (classNum !== currClassNum || isNaN(currClassNum)) {
           setter[hiddenclassNumField] = classNum;
           setAny = 1;
           //updateRange = true;
         }
         //prepare for migration of npc spells
         if (isNPC) {
           if (classNum === 0) {
             //set dropdown
             setter["spellclass"] = "@{spellclass-0-name}";
             if (!va["spellclass-0-name"]) {
               setter["spellclass-0-name"] = "NPC 1";
             }
             setAny = 1;
           } else if (classNum === 1) {
             setter["spellclass"] = "@{spellclass-1-name}";
             if (!va["spellclass-1-name"]) {
               setter["spellclass-1-name"] = "NPC 2";
             }
             setAny = 1;
           }
         }
         if (!isNaN(spellLevel) && (currSpellLevel !== spellLevel || isNaN(currSpellLevel))) {
           setter[spellLevelField] = spellLevel;
           setAny = 1;
         }
         newCL = (parseInt(v[spellCLUserField], 10) || 0) + classCL;
         if (newCL !== currCL || isNaN(currCL)) {
           setter[spellCLField] = newCL;
           setAny = 1;
           updateRange = true;
         }
         if (defDC !== currdefDC || isNaN(currdefDC)) {
           setter[spellDefCastDCField] = defDC;
           setAny = 1;
         }
         classLevelDelta = newCL - classCL;
         newDC = (parseInt(v[spellDCUserField], 10) || 0) + classDC;
         if (newDC !== currDC || isNaN(currDC)) {
           setter[spellDCField] = newDC;
           setAny = 1;
         }
         newCon = (parseInt(v[spellConUserField], 10) || 0) + classCon + classLevelDelta;
         if (newCon !== currCon || isNaN(currCon)) {
           setter[spellConField] = newCon;
           setAny = 1;
         }
         newDefCon = newCon + classDefConMod;
         if (newDefCon !== currDefCon || isNaN(currDefCon)) {
           setter[spellDefConField] = newDefCon;
           setAny = 1;
         }
         newSpellPen = classSpellPen + (parseInt(v[spellSpellPenUserField], 10) || 0) + classLevelDelta;
         if (newSpellPen !== currSpellPen || isNaN(currSpellPen)) {
           setter[spellSpellPenField] = newSpellPen;
           setAny = 1;
         }
         if (updateRange || forceRange || isNaN(currRange)) {
           newRange = PFUtils.findSpellRange(v[spellRangeText], newCL);
           if (isNaN(newRange)) {
             if (isNaN(currRange)) {
               newRange = -1;
             } else {
               newRange = currRange;
               currRange--;
             }
           }
           if (newRange !== currRange || isNaN(currRange)) {
             setter[spellRangeNum] = newRange;
             setAny = 1;
           }
         }
         if (setAny) {
           setAttrs(setter, {
             silent: true
           });
         }
         //cannot wait for callback of setAttrs since it will not call if there were no changes.
         if (typeof callback === "function") {
           callback();
         }
       });
     });
   },

   migrateCheckedSpells = function () {
     var countofSpells = 0,
     spellsUpdated = 0,
     spellUserFields = [],
     countofSections = 12,
     sectionsCounted = 0,
     idmap = {},
     sectionsToMigrate = ["lvl-0-spells", "lvl-1-spells", "lvl-2-spells", "lvl-3-spells", "lvl-4-spells", "lvl-5-spells", "lvl-6-spells", "lvl-7-spells", "lvl-8-spells", "lvl-9-spells", "npc-spells1", "npc-spells2"],
     finishUp = function () {
       var params = {};
       setAttrs({
         "spellmap": JSON.stringify(idmap),
         "migrated_spells": "1"
       }, PFConst.silentParams, done);
     },
     updateAtEnd,
     migrateSpell = function (section, id, callback) {
       var prefix = "",
       prefixLen = 0,
       oldAttribList = [];
       if (id === undefined || id === null || section === undefined || section === null) {
         callback();
         return;
       }
       prefix = "repeating_" + section + "_" + id + "_";
       prefixLen = prefix.length;
       _.each(spellUserFields, function (field) {
         oldAttribList.push(prefix + field);
       });
       //TAS.debug(oldAttribList);
       getAttrs(oldAttribList, function (v) {
         var spellLevel = 0,
         newId = "",
         newPrefix = "",
         setter = {},
         allNonBlank = true;
         //undefined for any attribute indicates it is outlined in red
         //for some reason checking name and === works better than checking typeof
         if (v[prefix + "name"] === undefined) {
           TAS.error("cannot migrate " + id);
           updateAtEnd();
           return;
         }
         //if any are null or undefined skip this row,
         _.each(v, function (val) {
           //saw some that were undefined but typeof came back something else? how?
           if (val === undefined || val === null || typeof val === "undefined") {
             TAS.error("cannot migrate " + id);
             updateAtEnd();
             return;
           }
           if (val !== "" || (parseInt(val, 10) || 0) !== 0) {
             allNonBlank = false;
           }
         });
         //if all are blank or zero then skip this row
         if (allNonBlank) {
           TAS.error("cannot migrate " + id);
           updateAtEnd();
           return;
         }
         //passed check, so generate new id and attribute list
         newId = generateRowID();
         //TAS.debug("Passed test, migrating " + id +" to new "+newId);
         newPrefix = "repeating_spells_" + newId + "_";
         idmap["repeating_" + section + "_" + id + "_"] = "repeating_spells_" + newId + "_";
         _.each(v, function (val, field) {
           var col = field.substring(prefixLen);
           switch (oldSpellUserFieldDefaults[col].type) {
             case 'int':
               setter[newPrefix + col] = parseInt(val, 10) || 0;
               break;
             case 'text':
               if (col !== "macro-text" && col !== "npc-macro-text") {
                 setter[newPrefix + col] = val;
               } else {
                 try {
                   if (val !== oldSpellUserFieldDefaults[col].val) {
                     setter[newPrefix + col] = val;
                   }
                 } catch (errrrr) { }
               }
               break;
             case 'checkbox':
               setter[newPrefix + col] = val;
               break;
             default:
               setter[newPrefix + col] = val;
           }
         });
         spellLevel = parseInt(v[prefix + "spell_level"], 10);
         //redo spell level since default is -1 instead of 0
         if (isNaN(spellLevel)) {
           setter[newPrefix + "spell_level"] = "";
           setter[newPrefix + "spell_level_r"] = -1;
         } else {
           setter[newPrefix + "spell_level"] = spellLevel;
           setter[newPrefix + "spell_level_r"] = spellLevel;
         }
         setter[newPrefix + "spell_class_r"] = parseInt(v[prefix + "spellclass_number"], 10) || 0;
         //TAS.debug("Setting "+newPrefix+"spellclass_number:"+ setter[newPrefix+"spellclass_number"] +", spell_level_r:"+setter[newPrefix+"spell_level"]+" and ensure undefined old level "+ setter[prefix+"spell_level"]+" for spell new "+setter[newPrefix+"name"]+", old:" + v[prefix+"name"]);
         //TAS.log(setter);
         setAttrs(setter, {
           silent: true
         }, function () {
           updateAtEnd();
           return;
         });
       });
     },
     migrateUpdatedSpells = function () {
       _.each(sectionsToMigrate, function (section) {
         var repeatingsection = "repeating_" + section;
         getSectionIDs(repeatingsection, function (ids) {
           _.each(ids, function (id) {
             migrateSpell(section, id);
           });
         });
       });
     },
     updateOldSpells = function () {
       //re-update each spell before migrating, in case some are very old.
       _.each(sectionsToMigrate, function (section) {
         var repeatingsection = "repeating_" + section;
         getSectionIDs(repeatingsection, function (ids) {
           _.each(ids, function (id) {
             updateOldSpell(section, id, null, true, function () {
               spellsUpdated++;
               if (spellsUpdated === countofSpells) {
                 migrateUpdatedSpells();
               }
             });
           });
         });
       });
     };
     //create array from keys from oldSpellUserFieldDefaults
     _.each(oldSpellUserFieldDefaults, function (defMap, field) {
       spellUserFields.push(field);
     });
     //get total count of spells to migrate
     _.each(sectionsToMigrate, function (section) {
       getSectionIDs("repeating_" + section, function (ids) {
         countofSpells += ids.length;
         sectionsCounted++;
         if (sectionsCounted === countofSections) {
           updateAtEnd = _.after(countofSpells, function () {
             finishUp();
           });
           updateOldSpells();
         }
       });
     });
   };
   getAttrs(["migrated_spells"], function (vm) {
     if (vm["migrated_spells"] == "1") {
       done();
     } else {
       migrateCheckedSpells();
     }
   });
 },
 /* fixes rolltemplate image urls in dropdown to update urls from solid bkg to transparent. (from old to new val) */
 migrateRollTemplateImages = function () {
   getAttrs(['migrated_rolltemplateimages','header_image-pf_spell', 'header_image-pf_attack-melee', 'header_image-pf_attack-ranged', 'header_image-pf_attack-cmb', 'header_image-pf_defense'], function (v) {
     var isMigrated=parseInt(v.migrated_rolltemplateimages,10)||0,
     setter={};
     try {
       if (!isMigrated){
         setter = _.chain(v).filter(function (val, attr) {
           return (/\[default\]/).test(val);
         }).reduce(function (memo, val, attr) {
           var newval = "";
           try {
             switch (attr) {
               case 'header_image-pf_spell':
                 if (val !== "[default](http://imgur.com/9yjOsAD.png)") {
                   newval = "[default](http://imgur.com/9yjOsAD.png)";
                 }
                 break;
               case 'header_image-pf_attack-melee':
                 if (val !== "[default](http://i.imgur.com/AGq5VBG.png)") {
                   newval = "[default](http://i.imgur.com/AGq5VBG.png)";
                 }
                 break;
               case 'header_image-pf_attack-ranged':
                 if (val !== "[default](http://imgur.com/58j2e8P.png)") {
                   newval = "[default](http://imgur.com/58j2e8P.png)";
                 }
                 break;
               case 'header_image-pf_attack-cmb':
                 if (val !== "[default](http://imgur.com/RUJfMGe.png)") {
                   newval = "[default](http://imgur.com/RUJfMGe.png)";
                 }
                 break;
               case 'header_image-pf_defense':
                 if (val !== "[default](http://imgur.com/02fV6wh.png)") {
                   newval = "[default](http://imgur.com/02fV6wh.png)";
                 }
                 break;
             }
             if (newval) {
               memo[attr] = newval;
             }
           } catch (err) {
             TAS.error("migrateRollTemplateImages: inner error on " + attr, err);
           }
           return memo;
         }, {}).value();
       }
     } catch (erro){
       TAS.error("migrateRollTemplateImages outer error",erro);
     } finally {
       setter['migrated_rolltemplateimages']=1;
       if (_.size(setter) > 0) {
         setAttrs(setter, PFConst.silentParams);
       }
     }
   });
 },
 /**addNumberToMacro adds the value to the end of the macro string.
 * so the evaluated value of the returned string equals macroVal + miscVal
 * either "macroText + miscVal" or "macroText - miscVal"
 * This is for conversions only, if we are removing the miscfield. it is pretty useless otherwise.
 *@param {string} macroText the text of the macro to add to. if it is wrapped in [[ ]] make sure to remove that before passing macro in or it will be added outside of the brackets!
 *@param {int} macroVal the value the macro currently evaluates to.
 *@param {string} miscMacroText text of 2nd macro to add to macroText if there is one
 *@param {int} miscVal the value we are adding to macroText , it is value of miscMacroText if there is a macro
 *@returns {string} the resulting new macro text
 */
 addNumberToMacro = function(macroText, macroVal, miscMacroText, miscVal){
   //TAS.debug("at addNumberToMacro:" );
   macroText=macroText||"";
   miscMacroText=miscMacroText||"";
   if (macroText || macroVal){
     macroVal += miscVal;
     if (miscMacroText){
       macroText += " "+miscMacroText;
     } else if (miscVal){
       if (miscVal>0){
         macroText+=" + ";
       } else {
         macroText+= " - ";
       }
       macroText += String(Math.abs(miscVal));
     }
   } else if (miscVal){
     macroText = String(miscVal);
     macroVal = miscVal;
   } else {
     macroText="";
     macroVal = 0;
   }
   return {  'macroText':macroText, 'macroVal':macroVal};
 },
 /** adds the value to the end of the macro string. either "macro + miscVal" or "macro - miscVal"
 * saves new macro to the sheet
 *@param {function} callback call when done
 *@param {migrateFlag} the sheet attribute to check, if 1 do nothing, if 1 then perform migration then set to 1
 *@param {string} macroAttr the attribute name of macro we will update
 *@param {string} modAttr the attribute name containing the # evaluated from macroAttr
 *@param {string} miscMacroAttr the attribute name of macro to remove and whose value to add to macroAttr
 *@param {string} miscAttr the attribute name of a number field, standalone if macroAttr is null, or it is the
           field containing evaluted number of miscMacroAttr
 */
 migrateMoveIntIntoMacro = function(callback,migrateFlag,macroAttr,modAttr,miscMacroAttr,miscAttr) {
   var done=_.once(function(){
     TAS.debug("leaving PFMigrate.migrateMoveIntIntoMacro: "+ macroAttr);
     if (typeof callback === "function"){
       callback();
     }
   }),
   fields = [macroAttr,modAttr,miscAttr, migrateFlag];
   if (miscMacroAttr){
     fields.push(miscMacroAttr);
   }
   getAttrs(fields,function(v){
     var miscVal=0,formVal=0,newFormula={},setter={},miscFormula="";
     try {
       //TAS.debug("PFMigrate.migrateMoveIntIntoMacro: ",v);
       if (!parseInt(v[migrateFlag],10)){
         miscVal = parseInt(v[miscAttr],10)||0;
         formVal = parseInt(v[modAttr], 10) || 0 ;
         if (miscMacroAttr){
           miscFormula=v[miscMacroAttr];
         }
         newFormula = addNumberToMacro(v[macroAttr], formVal, miscFormula, miscVal);
         if (newFormula.macroText && newFormula.macroText !== v[macroAttr]){
           setter[macroAttr]=newFormula.macroText;
           setter[modAttr]=newFormula.macroVal;
         }
         setter[migrateFlag] = 1;
         setter[miscAttr]="";
         if (miscMacroAttr){
           setter[miscMacroAttr]="";
         }
       }
     } catch (err){
       TAS.error("PFMigrate.migrateMoveIntIntoMacro:" + migrateFlag,err);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     }
   });
 },
 /**migrateHPMisc copies HP-misc into HP-formula-macro-text and HP-formula-mod
 * This modifies the same fields aas migrateNPC so make sure to call them in sequence not at the same time!
 *@param {function} callback when done.
 */
 migrateHPMisc=function(callback){
   //TAS.debug("at migrateHPMisc");
   migrateMoveIntIntoMacro(callback,"migrated_hp_misc","HP-formula-macro-text","HP-formula-mod","", "HP-misc");
 },
 /**migrateHPMisc copies Max-Skill-Ranks-Misc2 into Max-Skill-Ranks-Misc
 *@param {function} callback when done.
 */
 migrateMaxSkills = function(callback){
   //TAS.debug("at migrateMaxSkills");
   migrateMoveIntIntoMacro(callback,"migrated_maxskill_misc","Max-Skill-Ranks-Misc","Max-Skill-Ranks-mod","","Max-Skill-Ranks-Misc2");
 },
 /** updates NPC from pre v 1.00 to version 1.00
 * @param {function} callback call when done
 * @param {number} oldversion the sheet attribute PFVersion.
 */
 migrateNPC = function (callback, oldversion) {
   var done = _.once(function () {
     TAS.debug("Leaving migrateNPC");
     if (typeof callback === "function") {
       callback();
     }
   }),
   migrateNPCConfig = function(callback){
       setAttrs({ 'auto_calc_hp':1, 'normal_macro_show': 1,
         'use_traits':0 , 'use_racial_traits':0, 'npc-compimport-show':0 },
         PFConst.silentParams,callback);
   },
   /* updates hp and hp|max, resets npc-hp as avg of hit dice only (npc-hd and npc-hd-num) ,
   * sets class-0-hd and class-0-level to values of  npc-hd2 and npc-hd-num2
   * if undead then sets ability to CHA */
   migrateNPCHP = function (callback) {
     var done=_.once(function(){
       TAS.debug("Leaving PFMigrate.migrateNPCHP");
       if(typeof callback === "function"){
         callback();
       }
     });
     getAttrs(["HP-ability", "HP-ability-mod", "npc-type", "CON-mod", "CHA-mod", "total-hp","level","bab", "HP-formula-macro-text", "HP-formula-mod",
       "class-0-level","class-1-level","class-2-level","class-3-level","class-4-level","class-5-level",
       "is_undead",
       "npc-hd-misc", "npc-hd-misc-mod","npc-hd", "npc-hd-num", "npc-hd2", "npc-hd-num2", 'npc-bab'], function (v) {
       var isUndead=0,abilityMod=0,ability='',classLevels=0,classhd=0,level=0,totalhp=0,hitdice=0,hitdie=0,basehp=0,
         tempInt=0,classhp=0,classNum=0,abilityModTot=0,
         currLevel=0,currHP=0,setter={},bab=0,npcbab=0,newbab=0,newFormula={},hdMiscVal=0,currhpFormVal=0;
       try {
         setter["auto_calc_hp"]= "1";
         hitdice=parseInt(v['npc-hd-num'],10)||0;
         hitdie=parseInt(v["npc-hd"], 10) || 0;
         classLevels=parseInt(v['npc-hd-num2'],10)||0;
         classhd=parseInt(v['npc-hd2'],10)||0;

         //get basic numbers
         isUndead = ((/undead/i).test(v["npc-type"])||parseInt(v.is_undead,10))||0;
         setter["is_undead"]= isUndead;

         currLevel=parseInt(v.level,10)||0;
         currHP = parseInt(v.HP,10)||0;

         bab = parseInt(v.bab,10)||0;
         npcbab = parseInt(v['npc-bab'],10)||0;
         newbab = bab + npcbab;
         if (newbab !== bab){
           setter["bab"]=newbab;
         }

         abilityMod = isUndead ? (parseInt(v["CHA-mod"], 10) || 0) : (parseInt(v["HP-ability-mod"], 10) || 0);
         abilityModTot = abilityMod * (currLevel||hitdice);
         ability=isUndead ? '@{CHA-mod}' : '@{CON-mod}';
         setter["HP-ability"]= ability;
         setter["HP-ability-mod"]= abilityMod;

         //get the +xx portion and move to correct field.
         hdMiscVal = parseInt(v["npc-hd-misc-mod"], 10) || 0;
         currhpFormVal = parseInt(v["HP-formula-mod"],10)||0;
         if (hdMiscVal || v["HP-formula-macro-text"] ){
           setter["npc-hd-misc"]= "";
           setter["npc-hd-misc-mod"]= "";
         }
         if (hdMiscVal ){
           hdMiscVal -= abilityModTot;
         }
         newFormula = addNumberToMacro(v["HP-formula-macro-text"],currhpFormVal,v["npc-hd-misc"],hdMiscVal);
         if (newFormula.macroText && newFormula.macroText !== v["HP-formula-macro-text"]){
           setter["HP-formula-macro-text"]= newFormula.macroText;
           setter["HP-formula-mod"]= newFormula.macroVal;
         }
         basehp=PFUtils.getAvgHP(hitdice,hitdie );
         setter["NPC-HP"]=basehp;

         if (classLevels>0 ){
           //should be class-0-name, if not, something is really wrong.
           for (classNum=0;classNum<6;classNum++){
             tempInt=  parseInt(v['class-'+classNum+'-level'],10);
             if(  tempInt === 0 ||  tempInt === classLevels  ){
               break;
             }
           }
           if (classNum<6){
             classhp=PFUtils.getAvgHP(classLevels,classhd);
             setter['class-'+classNum+'-hp']=classhp;
             setter['class-'+classNum+'-level']=classLevels;
             setter['class-'+classNum+'-hd']=classhd;
           } else {
             TAS.error("Cannot convert npc class hit dice, the class grid is full! class levels:"+classLevels +", class hit die:"+classhd);
             classLevels=0;
           }
         }
         totalhp=currHP+basehp+classhp;
         level=currLevel+classLevels+hitdice;
         if (totalhp !== currHP){
           setter['total-hp']=totalhp;
         }
         if (level !== currLevel){
           setter['level']=level;
         }
       } catch(err) {
         TAS.error("PFMigrate.MigrateNPC",err);
       } finally {
         setter["migrated_npc"]= 1;
         if(_.size(setter)>0){
           setAttrs(setter, PFConst.silentParams,done);
         } else {
           done();
         }
       }
     });
   },
   /* copies or appends sense to vision */
   migrateNPCSenses = function (callback) {
     var done = function(){
       if(typeof callback === "function"){
         callback();
       }
     };
     getAttrs([ "senses", "vision",  "character-description"], function (v) {
       var a = '', b= '', c ='', setter={};
       try {
         a = v.senses || '';
         b = v.vision || '';
         if (a && b){
           c=a+', '+b;
         } else {
           c=a||b;
         }
         if (c) {
           setter.vision=c;
         }
         if (a) {
           setter.senses='';
         }
       } catch(err){
         TAS.error("migrateNPCSenses",err);
       } finally {
         if (_.size(setter)>0){
           setAttrs(setter, PFConst.silentParams, done);
         } else {
           done();
         }
       }
     });
   };

   getAttrs(["migrated_npc", "is_npc"], function (v) {
     var isNPC = 0, isMigrated=0,
     doneSub=_.after(3,done);
     try {
       isNPC=parseInt(v["is_npc"], 10) || 0;
       isMigrated = parseInt(v["migrated_npc"], 10) || 0;
       if (!isNPC ){
         setAttrs({"migrated_npc": 1}, PFConst.silentParams);
       }
       if (!isMigrated){
         migrateNPCSenses(doneSub);
         migrateNPCConfig(doneSub);
         migrateNPCHP(doneSub);
       } else {
         done();
       }
     } catch (err){
       TAS.error("PFMigrate.migrateNPC",err);
       done();
     }
   });
 },
 /** looks at dropdowns for cmb2 and ranged2 and if they are set to anything then check the 'show' checkboxes on config
 * @param {function} callback call when done */
 migrateAltAttackGridrowFlags = function (callback) {
   var done = function () { if (typeof callback === "function") { callback(); } };
   getAttrs(["ranged_2_show", "cmb_2_show", "ranged2-ability", "CMB2-ability","migratedAttack2row"], function (v) {
     var setter = {};
     try{
       if((parseInt(v['migratedAttack2row'],10)||0) === 0){
         if (PFUtils.findAbilityInString(v["ranged2-ability"]) && parseInt(v.ranged_2_show ,10)!== 1) {
           setter.ranged_2_show = 1;
         }
         if (PFUtils.findAbilityInString(v["CMB2-ability"]) && parseInt(v.cmb_2_show,10) !== 1) {
           setter.cmb_2_show = 1;
         }
         setter["migratedAttack2row"]=1;
       }
     } catch(err){
       TAS.error("PFMigrate.migrateAltAttackGridrowFlags",err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, { silent: true }, done);
       } else {
         done();
       }
     }
   });
 },
 migrateExperience = function (callback) {
   var done = _.once(function () {
     TAS.debug("leaving migrateExperience");
     if (typeof callback === "function") { callback(); }
   });
   getAttrs(['migrated_experience', 'use_prestige_fame', 'use_hero_points', 'prestige', 'fame', 'hero-points', 'faction_notes'], function (v) {
     var mig = parseInt(v.migrated_experience, 10) || 0, setter = {};
     if (mig) {
       done();
       return;
     }
     if (((parseInt(v.prestige, 10) || 0) || (parseInt(v.fame, 10) || 0) || v.faction_notes) && !parseInt(v.use_prestige_fame, 10)) {
       setter.use_prestige_fame = 1;
     }
     if ((parseInt(v['hero-points'], 10) || 0) && !parseInt(v.use_hero_points, 10)) {
       setter.use_hero_points = 1;
     }
     setter.skill_onetimecolumns_show = 1;
     setter.misc_skill_num_show = 1;
     setter.migrated_experience = 1;
     setter.custom_skill_num_show = 1;
     setAttrs(setter, { silent: true }, done);
   });
 },
 migrateUsesSpellFlag = function(callback){
   var done = _.once(function () {
     TAS.debug("leaving migrateUsesSpellFlag");
     if (typeof callback === "function") { callback(); }
   }),
   setFlag= function(){
     setAttrs( {'migrated_spellflag':1},PFConst.silentParams,done );
   },
   tryTwoJustCountRows = function(){
     getSectionIDs('repeating_spells',function(ids){
       if(ids && _.size(ids)>0){
         setAttrs( {'use_spells':1},PFConst.silentParams,setFlag );
       } else {
         setAttrs( {'use_spells':0},PFConst.silentParams,setFlag );
       }
     });
   };
   getAttrs(['spellclass-0-level','spellclass-1-level','spellclass-2-level','use_spells','migrated_spellflag'],function(v){
     var lvl1=0,lvl2=0,lvl3=0,usesSpells=0,setter={};
     try {
       usesSpells = parseInt(v.use_spells,10)||0;
       if ((parseInt(v.migrated_spellflag,10)||0)!==1 && !usesSpells){
         lvl1=parseInt(v['spellclass-0-level'],10)||0;
         lvl2=parseInt(v['spellclass-1-level'],10)||0;
         lvl3=parseInt(v['spellclass-3-level'],10)||0;
         if (lvl1||lvl2||lvl3){
           usesSpells=1;
           setter['use_spells'] = 1;
         }
         if ((lvl1&&lvl2) || (lvl2&&lvl3) || (lvl1&&lvl3)){
           setter['spellclasses_multiclassed']=1;
         }
       }
     } catch (err){
       TAS.error("FMigrate.migrateUsesSpellFlag",err);
     } finally {
       if (usesSpells){
         setAttrs(setter,PFConst.silentParams,setFlag);
       } else {
         tryTwoJustCountRows();
       }
     }
   });
 },
 migrateSize = function(callback){
   getAttrs(['size','old_size','default_char_size'],function(v){
     var size = parseInt(v.size,10)||0;
     if (v.old_size==='x'){
       setAttrs({'old_size':size, 'default_char_size':size});
     }
   });
 },
 /** migrates repeating_item name, short-description, type, and weight to have item- prefix to avoid duplicate attributes
 * @param {function} callback call after finishing */
 migrateRepeatingItemAttributes = function (callback) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getAttrs(["migrated_repeating_item_attributes"], function (m) {
     var duplicateFields = ["weight", "hp", "hp_max"], // repeating fields can have duplicate attrbitues with other repeating lists, but not non-repeating list attrbiutes
     resetFields=["qty","qty_max"];
     if (parseInt(m["repeating-item-attributes_migrated"],10)) {
       //TAS.debug"Duplicate repeating_item attributes already migrated; exiting");
       done();
       return;
     }
     getSectionIDs("repeating_item", function (ids) {
       var fields = [];
       if(ids && _.size(ids)>0){
         setAttrs({'migrated_repeating_item_attributes':1},PFConst.silentParams,done);
         return;
       }
       fields = _.reduce(ids, function (memo, id) {
         var prefix = "repeating_item_" + PFUtils.getRepeatingIDStr(id),
         row = [];
         _.each(duplicateFields,function(field){
           row.push(prefix+field);
         });
         _.each(resetFields,function(field){
           row.push(prefix+field);
         });
         return memo.concat(row);
       }, []);

       getAttrs(fields, function (v) {
         var setter = {};
         try {
           _.each(ids, function (id) {
             var prefix = "repeating_item_" + PFUtils.getRepeatingIDStr(id);
             duplicateFields.forEach(function (attr) {
               var newInt= parseInt(v[prefix+attr],10)||0;
               if (v[prefix + attr] && newInt!==0 ) {
                 setter[prefix + "item-" + attr] = newInt;
                 setter[prefix+attr]="";
               }
             });
             _.each(resetFields,function(attr){
               var tempInt=parseInt(v[prefix+attr],10);
               //new default is 1, old was undefined
               if (isNaN(tempInt)){
                 setter[prefix+attr]=1;
               }
             });
           });
           setter["migrated_repeating_item_attributes"] = "1";
         } catch (err){
           TAS.error("migrateRepeatingItemAttributes",err);
         } finally {
           if (_.size(setter) > 0) {
             setAttrs(setter, PFUtils.silentParams, done);
           } else {
             done();
           }
         }
       });
     });
   });
 },

 migrateAbilityListFlags = function(callback){
   var done=_.once(function(){
     TAS.debug("leaving migrateAbilityListFlags");
     if (typeof callback === "function"){
       callback();
     }
   }),
   setFlag = _.after(5,function(){
     setAttrs({'migrated_abilityflags109':1},PFConst.silentParams,done);
   });
   getAttrs(['migrated_abilityflags109','uses_feats','uses_traits','use_racial_traits','use_class_features','use_npc-spell-like-abilities'],function(vm){
     if (! parseInt(vm['migrated_abilityflags109'],10)){
       getSectionIDs('repeating_npc-spell-like-abilities',function(ids){
         if(ids && _.size(ids)>0){
           setAttrs( {'use_npc-spell-like-abilities':1},PFConst.silentParams,setFlag );
         } else {
           setAttrs( {'use_npc-spell-like-abilities':0},PFConst.silentParams,setFlag );
         }
       });
       getSectionIDs('repeating_feat',function(ids){
         if(ids && _.size(ids)>0){
           setAttrs( {'use_feats':1},PFConst.silentParams,setFlag );
         } else {
           setAttrs( {'use_feats':0},PFConst.silentParams,setFlag );
         }
       });
       getSectionIDs('repeating_class-ability',function(ids){
         if(ids && _.size(ids)>0){
           setAttrs( {'use_class_features':1},PFConst.silentParams,setFlag );
         } else {
           setAttrs( {'use_class_features':0},PFConst.silentParams,setFlag );
         }
       });
       getSectionIDs('repeating_trait',function(ids){
         if(ids && _.size(ids)>0){
           setAttrs( {'use_traits':1},PFConst.silentParams,setFlag );
         } else {
           setAttrs( {'use_traits':0},PFConst.silentParams,setFlag );
         }
       });
       getSectionIDs('repeating_racial-trait',function(ids){
         if(ids && _.size(ids)>0){
           setAttrs( {'use_racial_traits':1},PFConst.silentParams,setFlag );
         } else {
           setAttrs( {'use_racial_traits':0},PFConst.silentParams,setFlag );
         }
       });
     } else {
       done();
     }
   });
 },
 migrateConfigFlags = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFMigrate migrateConfigFlags");
     if (typeof callback === "function") { callback(); }
   });
   migrateNPC(function(){migrateHPMisc(done);});
   migrateRollTemplateImages();
   migrateAltAttackGridrowFlags();
   migrateSize();
   migrateUsesSpellFlag();
   migrateAbilityListFlags();
   migrateExperience();
 },
 getAllMigrateFlags = function(v){
   v=v||{};
   v['migrated_buffs']=1;
   v['migrated_effects']=1;
   v['classSkillsMigrated']=1;
   v['migrated_spells']=1;
   v['spellranges_migrated']=1;
   v['migrated_damage-multiplier']=1;
   v['migrated_experience']=1;
   v['migrated_spellflag']=1;
   v['migratedAttack2row']=1;
   v['migrated_npc']=1;
   v['migrated_worn_equipment']=1;
   v['migrated_repeating_item_attributes']=1;
   v['migrated_skill_macrosv1']=1;
   v['migrated_attack_macrosv1']=1;
   v['migrated_spells_macrosv1']=1;
   v['migrated_feature_macrosv109']=1;
   v['migrated_ability_macrosv112']=1;
   v['migrated_hp_misc']=1;
   v['migrated_maxskill_misc']=1;
   v['migrated_featurelists_defaults']=1;
   v['migrated_attacklist_defaults111']=1;
   v['migrated_itemlist_defaults']=1;
   v['migrated_abilityflags109']=1;
   return v;
 },
 setAllMigrateFlags = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFMigrate setAllMigrateFlags");
     if (typeof callback === "function") { callback(); }
   });
   setAttrs(getAllMigrateFlags(), PFConst.silentParams, done);
 }
 ;
 console.log(PFLog.l + '   PFMigrate module loaded        ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrateRepeatingDamage: migrateRepeatingDamage,
   migrateMaxDexAndACP: migrateMaxDexAndACP,
   migrateSpellRanges: migrateSpellRanges,
   migrateSpells: migrateSpells,
   migrateRollTemplateImages: migrateRollTemplateImages,
   migrateNPC: migrateNPC,
   migrateExperience: migrateExperience,
   migrateUsesSpellFlag: migrateUsesSpellFlag,
   migrateAltAttackGridrowFlags: migrateAltAttackGridrowFlags,
   migrateConfigFlags: migrateConfigFlags,
   migrateSize: migrateSize,
   migrateAbilityListFlags: migrateAbilityListFlags,
   migrateHPMisc: migrateHPMisc,
   migrateMaxSkills: migrateMaxSkills,
   migrateRepeatingItemAttributes: migrateRepeatingItemAttributes,
   getAllMigrateFlags: getAllMigrateFlags,
   setAllMigrateFlags: setAllMigrateFlags
 };
}());
var PFDefense = PFDefense || (function () {
 /** module for attack grid on top of attack page */
 'use strict';
 /* **********************************DEFENSE PAGE ********************************** */
 var defenseDropdowns = {
   "AC-ability": "AC-ability-mod",
   "FF-ability": "FF-DEX",
   "CMD-ability1": "CMD-STR",
   "CMD-ability2": "CMD-DEX",
   "CMD-ability": "FF-CMD-DEX"
 },
 defenseLowerToMixed = {
   "ac-ability": "AC-ability",
   "ff-ability": "FF-ability",
   "cmd-ability1": "CMD-ability1",
   "cmd-ability2": "CMD-ability2",
   "cmd-ability": "CMD-ability"
 },
 //reverse order to do worn first:
 defenseArmorShieldRowsOld = ["armor3", "armor2", "armor", "shield3", "shield2", "shield"],
 defenseArmorShieldRows = ["armor3", "shield3"],
 defenseArmorShieldColumns = ["equipped", "acbonus", "enhance", "max-dex", "acp", "spell-fail", "proficiency", "type"],
 defenseFieldTotals = ["acp", "max-dex", "AC-armor", "AC-shield", "spell-fail", "acp-attack-mod", "max-dex-source", "current-load"],
 defenseArmorFields = SWUtils.cartesianAppend(defenseArmorShieldRows, ['-'], defenseArmorShieldColumns).concat(defenseFieldTotals),
 /** updateDefenses updates the top grid of AC, Touch AC, Flat Footed AC, CMD, Flat Footed CMD
 * http://paizo.com/pathfinderRPG/prd/coreRulebook/combat.html#combat-maneuver-defense
 * Any penalties to a creature's AC also apply to its CMD
 *@param {function} callback optional call when done
 *@param {bool} silently optional if true call setAttrs with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
 updateDefenses = function ( callback, silently, eventInfo) {
   var done = _.once(function () {
     TAS.debug("leaving PFDefense.updateDefenses");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["AC-ability-mod", "FF-DEX", "AC-penalty", "CMD-penalty", "size", "max-dex", "AC-dodge",
   "AC-natural", "AC-deflect", "AC-misc", "buff_AC-total", "buff_Touch-total", "buff_CMD-total",
   "CMD-DEX", "FF-CMD-DEX", "CMD-STR", "bab", "CMD-misc", "AC", "Touch", "Flat-Footed", "CMD", "FF-CMD",
   "AC-ability", "FF-ability", "CMD-ability", "CMD-ability1", "CMD-ability2", "AC-armor", "AC-shield",
   "condition-Blinded", "condition-Pinned", "condition-Stunned", "condition-Cowering", "condition-Drained",
   "condition-Flat-Footed", "AC-ability-display", "FF-DEX-display", "CMD-DEX-display", "FF-CMD-DEX-display",
   "maxdex-toggle", "nodex-toggle", "uncanny_dodge", "unlock_def_ability", "hd_not_bab", "level",
   "current-load", "max-dex-source"], function (v) {
     var size = parseInt(v["size"], 10) || 0,
     dodge = parseInt(v["AC-dodge"], 10) || 0,
     deflect = parseInt(v["AC-deflect"], 10) || 0,
     miscAC = parseInt(v["AC-misc"], 10) || 0,
     condPenalty = parseInt(v["AC-penalty"], 10) || 0,
     buffs = parseInt(v["buff_AC-total"], 10) || 0,
     buffsTouch = parseInt(v["buff_Touch-total"], 10) || 0,
     buffsCMD = parseInt(v["buff_CMD-total"], 10) || 0,
     armor = parseInt(v["AC-armor"], 10) || 0,
     shield = parseInt(v["AC-shield"], 10) || 0,
     natural = parseInt(v["AC-natural"], 10) || 0,
     bab = parseInt(v["bab"], 10) || 0,
     miscCMD = parseInt(v["CMD-misc"], 10) || 0,
     maxDex = parseInt(v["max-dex"], 10),
     cmdPenalty = parseInt(v["CMD-penalty"], 10) || 0,
     blinded = (parseInt(v["condition-Blinded"], 10) || 0) ? 1 : 0,
     pinned = (parseInt(v["condition-Pinned"], 10) || 0) ? 1 : 0,
     stunned = (parseInt(v["condition-Stunned"], 10) || 0) ? 1 : 0,
     ffed = (parseInt(v["condition-Flat-Footed"], 10) || 0) ? 1 : 0,
     cowering = (parseInt(v["condition-Cowering"], 10) || 0) ? 1 : 0,
     maxDexSource = parseInt(v["max-dex-source"],10)||0,
     currload = parseInt(v["current-load"],10)||0,
     dexModShowLimit = 0,
     currDexModLimit = parseInt(v["maxdex-toggle"], 10) || 0,
     noDexShowLimit = 0,
     currNoDexLimit = parseInt(v["nodex-toggle"], 10) || 0,
     unlockDefAbility = parseInt(v.unlock_def_ability,10)||0,
     lockDefAbility = unlockDefAbility?0:1,
     ac = 10,
     touch = 10,
     ff = 10,
     cmd = 10,
     cmdFF = 10,
     currAC = parseInt(v["AC"], 10),
     currTouch = parseInt(v["Touch"], 10),
     currFF = parseInt(v["Flat-Footed"], 10),
     currCMD = parseInt(v["CMD"], 10),
     currCMDFF = parseInt(v["FF-CMD"], 10),
     currUncanny = parseInt(v["uncanny_dodge"], 10) || 0,
     currCMDUncanny = lockDefAbility?currUncanny:(parseInt(v["uncanny_cmd_dodge"], 10) || 0),
     acAbilityName = PFUtils.findAbilityInString(v["AC-ability"]),
     uncannyAbilityName = currUncanny?acAbilityName:PFUtils.findAbilityInString(v["FF-ability"]),
     uncannyCMDabilityName = lockDefAbility?uncannyAbilityName:PFUtils.findAbilityInString(v["CMD-ability"]),
     cmdAbilityDDvalName = lockDefAbility?acAbilityName:PFUtils.findAbilityInString(v["CMD-ability2"]),
     ability = parseInt(v["AC-ability-mod"], 10) || 0,
     ffAbility = (currUncanny&&lockDefAbility)?ability:(parseInt(v["FF-DEX"], 10) || 0),
     cmdAbility1 = parseInt(v["CMD-STR"], 10) || 0,
     cmdAbility2 = lockDefAbility?ability:(parseInt(v["CMD-DEX"], 10) || 0),
     cmdFFAbility2 = lockDefAbility?ffAbility:(parseInt(v["FF-CMD-DEX"], 10) || 0),
     setter = {},
     params = {},
     loseDex = 0,
     immobilized = 0,
     setAny = 0;
     try {
       //TAS.debug(v);
       maxDex = isNaN(maxDex) ? 99 : maxDex; //cannot do "||0" since 0 is falsy but a valid number
       if ((maxDex) < ability) {
         //assume ability, FF-ability, CMD-ability2 all set the same (or to "none" for ff)
         dexModShowLimit = 1;
       }
       if (acAbilityName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
         ability = Math.min(ability, maxDex);
       }
       if (uncannyAbilityName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
         ffAbility = Math.min(ffAbility, maxDex);
       }
       if (cmdAbilityDDvalName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
         cmdAbility2 = Math.min(cmdAbility2, maxDex);
       }
       if (uncannyCMDabilityName === "DEX-mod" && maxDex < 99 && maxDex >= 0) {
         cmdFFAbility2 = Math.min(cmdFFAbility2, maxDex);
       }

       //if ability is below zero, FF dex adj must be set to negative too
       //assume ffability dropdown should be None or the same as dex ability
       //because if not then it doesn't make sense
       if (ability < 0 && ffAbility > ability) {
         ffAbility = ability;
       }
       if (cmdAbility2 < 0 && cmdFFAbility2 > cmdAbility2) {
         cmdFFAbility2 = cmdAbility2;
       }
       if (unlockDefAbility ){
         if (uncannyAbilityName && currUncanny === 0) {
           //TAS.debug("switching to uncanny");
           setter["uncanny_dodge"] = "1";
           setAny = 1;
           currUncanny = 1;
         } else if (!uncannyAbilityName && currUncanny === 1) {
           //TAS.debug("switching from uncanny");
           setter["uncanny_dodge"] = "0";
           setAny = 1;
           currUncanny = 0;
         }
         if (uncannyCMDabilityName && currCMDUncanny === 0) {
           //TAS.debug("switching to cmd uncanny");
           setter["uncanny_cmd_dodge"] = "1";
           setAny = 1;
           currCMDUncanny = 1;
         } else if (!uncannyCMDabilityName && currCMDUncanny === 1) {
           //TAS.debug("switching from cmd uncanny");
           setter["uncanny_cmd_dodge"] = "0";
           setAny = 1;
           currCMDUncanny = 0;
         }
       }
       //lose Dex: you lose your bonus (and dodge) - not the same as flat footed
       //Must be applied even if your bonus is not dex :
       //http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9qdi
       //flat footed : lose dex unless uncanny
       //blinded: lose dex unless uncanny
       //pinned, cowering, stunned : always lose dex
       if (pinned || cowering || stunned || (currload===4&& (maxDexSource===0 || maxDexSource===2))) {
         immobilized=1;
       } else if (blinded || ffed || (currload===3 && (maxDexSource===0 || maxDexSource===2))) {
         loseDex=1;
       }

       if (immobilized ) {
         if (currUncanny) {
           ffAbility = Math.min(0, ffAbility);
         }
         if (currCMDUncanny){
           cmdFFAbility2 = Math.min(0, cmdFFAbility2);
         }
         //dexModShowLimit=1;
         ability = Math.min(0, ability);
         cmdAbility2 = Math.min(0, cmdAbility2);
         dodge = 0;
         noDexShowLimit = 1;
       } else if (loseDex) {
         //TAS.debug("we are blinded or flat footed uncanny:"+currUncanny+", cmd uncan:"+currCMDUncanny);
         if (!currUncanny || !currCMDUncanny) {
           //dexModShowLimit=1;
           dodge = 0;
           noDexShowLimit = 1;
         }
         //set to same as flat footed (probably 0) or less than if ability already under 10.
         ability = Math.min(ability,ffAbility);
         cmdAbility2 = Math.min(cmdAbility2,cmdFFAbility2);
       }
       if (parseInt(v.hd_not_bab,10)){
         bab = parseInt(v.level,10)||0;
       }
       ac = 10 + armor + shield + natural + size + dodge + ability + deflect + miscAC + condPenalty + buffs;
       touch = 10 + size + dodge + ability + deflect + miscAC + condPenalty + buffsTouch;
       ff = 10 + armor + shield + natural + size + ffAbility + deflect + miscAC + condPenalty + buffs + (currUncanny ? dodge : 0);
       cmd = 10 + bab + cmdAbility1 + cmdAbility2 + (-1 * size) + dodge + deflect + miscCMD + cmdPenalty + buffsCMD;
       cmdFF = 10 + bab + cmdAbility1 + cmdFFAbility2 + (-1 * size) + deflect + miscCMD + cmdPenalty + buffsCMD + (currCMDUncanny ? dodge : 0);
       if (ac !== currAC || isNaN(currAC)) {
         setter["AC"] = ac;
         setAny += 1;
       }
       if (touch !== currTouch || isNaN(currTouch)) {
         setter["Touch"] = touch;
         setAny += 1;
       }
       if (ff !== currFF || isNaN(currFF)) {
         setter["Flat-Footed"] = ff;
         setAny += 1;
       }
       //TAS.debug("PFDefense.updateDefenses currcmd is :"+ currCMD +", new cmd is:"+ cmd);
       if (cmd !== currCMD || isNaN(currCMD)) {
         setter["CMD"] = cmd;
         setAny += 1;
       }
       if (cmdFF !== currCMDFF || isNaN(currCMDFF)) {
         setter["FF-CMD"] = cmdFF;
         setAny += 1;
       }
       if (ability !== (parseInt(v["AC-ability-display"], 10))) {
         setter["AC-ability-display"] = ability;
       }
       if (ffAbility !== (parseInt(v["FF-DEX-display"], 10))) {
         setter["FF-DEX-display"] = ffAbility;
       }
       if (cmdAbility2 !== (parseInt(v["CMD-DEX-display"], 10))) {
         setter["CMD-DEX-display"] = cmdAbility2;
       }
       if (cmdFFAbility2 !== (parseInt(v["FF-CMD-DEX-display"], 10))) {
         setter["FF-CMD-DEX-display"] = cmdFFAbility2;
       }
       if (dexModShowLimit !== currDexModLimit) {
         setter["maxdex-toggle"] = dexModShowLimit;
       }
       if (noDexShowLimit !== currNoDexLimit) {
         setter["nodex-toggle"] = noDexShowLimit;
       }
     } catch (err) {
       TAS.error("PFDefense.updateDefenses:", err);
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
 },
 /** setDefenseDropdownMod
 * All dropdowns in the defense grid: AC, flat footed AC, touch, CMD, flat footed CMD.
 * calls handledropdown then calls updateDefenses.
 *
 * NOTE: due to the way eventInfo.sourceAttribute is populated if the change comes from the autocalc code, the value is
 * lower case, so you must check either BOTH the regular and all lowercase, or just change it to lower case before comparing to be sure
 *
 *@param {string} dropdownField fieldname of dropdown to set
 *@param {function} callback callback
 *@param {bool} silently if true set silently make sure to call updateDefenses after!
 *@param {object} the eventInfo object USED, this is checked for uncanny_dodge flag
 *@param {bool} doNotCallUpdateDefenseAfter if not set call updateDefenses after updating dropdown mod.
 */
 setDefenseDropdownMod = function (dropdownField, callback, silently, eventInfo, doNotCallUpdateDefenseAfter) {
   var done = _.once(function () {
     TAS.debug("leaving PFDefense.setDefenseDropdownMod");
     if (typeof callback === "function") {
       callback();
     }
   }),
   updateAndDone = _.once(function(){
     if (!doNotCallUpdateDefenseAfter) {
       updateDefenses(done, silently);
     } else {
       done();
     }
   }),
   dropdownLower="",
   dropdownMixed="";
   //TAS.debug"PFDefense.setDefenseDropdownMod called with "+dropdownField +", lower:"+ dropdownLower);
   try {
     if (dropdownField){
       dropdownLower = dropdownField.toLowerCase();
       dropdownMixed = defenseLowerToMixed[dropdownLower];
       if (dropdownMixed){
         getAttrs(['unlock_def_ability','uncanny_dodge'],function(v){
           if(parseInt(v['unlock_def_ability'],10) || ( dropdownLower==='ac-ability' || dropdownLower==='cmd-ability1') ){
             PFUtilsAsync.setDropdownValue(dropdownMixed, defenseDropdowns[dropdownMixed], function (newv, oldv) {
               if (newv !== oldv || newv < 0 || oldv < 0 || dropdownLower==="ff-ability" || dropdownLower=== "cmd-ability") {
                 updateAndDone();
               } else {
                 done();
               }
             }, silently);
           } else {
             done();
           }
         });
       } else {
         TAS.warn("PFDefense.updateDefenses, called with invalid dropdown: "+dropdownField);
         done();
       }
     } else if (eventInfo && eventInfo.sourceAttribute==='uncanny_dodge') {
       getAttrs(['unlock_def_ability','uncanny_dodge','AC-ability',defenseDropdowns['AC-ability']],function(v){
         var unlockAbilityDD = 0,
           currACmod =  0,
           setter={};
         try {
           unlockAbilityDD = parseInt(v.unlock_def_ability,10)||0;
           if (unlockAbilityDD){
             //TAS.debug("at PFDefense.setDefenseDropdownMod",v);
             currACmod=parseInt(v['AC-ability'],10)||0;
             //we came here because uncanny dodge was checked
             if (!parseInt(v.uncanny_dodge,10)) {
               //turn uncanny off
               setter["FF-ability"]="0";
               setter[defenseDropdowns["FF-ability"]]=0;
               setter["CMD-ability"]="0";
               setter[defenseDropdowns["CMD-ability"]]=0;
             } else {
               //turned uncanny on
               //TAS.debug("set FF_ability to " +v['AC-ability'] );
               setter["FF-ability"]=v['AC-ability'];
               setter[defenseDropdowns["FF-ability"]]=currACmod;
               setter["CMD-ability"]=v['AC-ability'];
               setter[defenseDropdowns["CMD-ability"]]=currACmod;
             }
             setAttrs(setter,PFConst.silentParams,updateAndDone);
           } else {
             updateAndDone();
           }
         } catch (err2) {
           TAS.error("PFDefense.setDefenseDropdownMod inner error for : "+dropdownField, err2);
           done();
         }
       });
     }
   } catch (err) {
     TAS.error("PFDefense.setDefenseDropdownMod error for: "+dropdownField, err);
     done();
   }
 },
 /** updates total AC and penalty and max dex
 * if not proficient sets attack penalty
 * for backward compatibility, proficiency is string and 0 is proficient, anything else non proficient
 *@param {function} callback optional call when done
 *@param {bool} silently optional if true call setAttrs with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
 updateArmor = function (callback, silently, eventInfo) {
   var done = function () { if (typeof callback === "function") { callback(); } },
   params = {};
   getAttrs(defenseArmorFields, function (v) {
     var acp = 0, minAcp = 0, acA = 0, acS = 0, sp = 0, atk = 0, subAC = 0, subD = 0,
     subAcp = 0, nonProf = 0, subsp = 0, maxDex = 99, subE = 0,
     currACP = 0, currMaxDex = 99, currACArmor = 0, currACShield = 0, currSpellFail = 0,
     currAtkMod = 0,
     encumbranceDD = parseInt(v["max-dex-source"], 10) || 0,
     currentLoad = parseInt(v["current-load"], 10) || 0,
     setter = {};
     try {
       //TAS.debug("at updateArmor ",v);
       defenseArmorShieldRows.forEach(function (row) {
         if (v[row + "-equipped"] == "1") {
           subAC = parseInt(v[row + "-acbonus"], 10) || 0;
           subE = parseInt(v[row+"-enhance"],10)||0;
           subsp = parseInt(v[row + "-spell-fail"], 10) || 0;
           sp += subsp;
           if (row.indexOf("armor") >= 0) {
             acA += subAC + subE;
           } else {
             acS += subAC + subE;
           }
           subAcp = parseInt(v[row + "-acp"], 10) || 0;
           if (encumbranceDD < 2) {
             subD = parseInt(v[row + "-max-dex"], 10);
             if (v[row + "-max-dex"]==="-" || isNaN(subD)){
               subD=99;
             }
             maxDex = Math.min(subD, maxDex);
             acp += subAcp;
           }
           nonProf = parseInt(v[row + "-proficiency"], 10) || 0;
           if (nonProf) {
             atk += subAcp;
           }
           if ((/tower/i).test(v[row+"-type"])){
             atk -= 2;
           }
           //TAS.debug("row=" + row + ", subAC=" + subAC + ", subD=" + subD + ", subAcp=" + subAcp + ", nonProf=" + nonProf + ", subsp=" + subsp + ", acA=" + acA + ", maxDex=" + maxDex + ", acp=" + acp + ", sp=" + sp + ", atk=" + atk);
         }
       });
       minAcp = acp;
       // #0: Armor, Shield & Load
       // #1: Armor & Shield only
       // #2: Load only
       // #3: None
       if (encumbranceDD === 0 || encumbranceDD === 2) {
         if (currentLoad === 1) { // under medium encumbrance load
           maxDex = Math.min(maxDex, 3);
           minAcp = Math.min(minAcp, -3);
         } else if (currentLoad === 2) { // under heavy encumbrance load
           maxDex = Math.min(maxDex, 1);
           minAcp = Math.min(minAcp, -6);
         } else if (currentLoad > 2){
           maxDex = 0;
           minAcp = Math.min(minAcp, -6);
         }
       }


       currACP = parseInt(v.acp, 10) || 0;
       currMaxDex = parseInt(v["max-dex"], 10); //cannot do "||0" since 0 is valid but falsy
       currMaxDex = isNaN(currMaxDex) ? 99 : currMaxDex;
       currACArmor = parseInt(v["AC-armor"], 10) || 0;
       currACShield = parseInt(v["AC-shield"], 10) || 0;
       currSpellFail = parseInt(v["spell-fail"], 10) || 0;
       currAtkMod = parseInt(v["acp-attack-mod"], 10) || 0;
       if (currACP !== minAcp) {
         setter["acp"] = minAcp;
       }
       if (currMaxDex !== maxDex) {
         setter["max-dex"] = maxDex;
       }
       if (currACArmor !== acA) {
         setter["AC-armor"] = acA;
       }
       if (currACShield !== acS) {
         setter["AC-shield"] = acS;
       }
       if (currSpellFail !== sp) {
         setter["spell-fail"] = sp;
       }
       if (currAtkMod !== atk) {
         setter["acp-attack-mod"] = atk;
       }
     } catch (err) {
       TAS.error("PFDefense.updateArmor", err);
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
 },
 /** applyConditions Updates the AC-penalty and CMD-penalty field based on conditions
 *only difference is CMD penalty affected by energy drain for some reason
 *@param {function} callback optional call when done
 *@param {bool} silently optional if true call setAttrs with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
 applyConditions = function (callback, silently,eventInfo) {
   var done = _.once(function () {
     TAS.debug("leaving PFDefense.applyConditions");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["AC-penalty", "CMD-penalty", "condition-Blinded", "condition-Cowering", "condition-Stunned", "condition-Pinned", "condition-Wounds", "condition-Drained", "has_endurance_feat", "wounds_gritty_mode"], function (v) {
     var subTotPenalty = 0,
     drained = 0,
     woundLevel = 0,
     AC = 0,
     CMD = 0,
     newCMD = 0,
     woundPenalty = 0,
     hasEndurance = 0,
     grittyMode = 0,
     setter = {},
     params = {};
     try {
       drained = parseInt(v["condition-Drained"], 10) || 0;
       woundLevel = parseInt(v["condition-Wounds"], 10) || 0;
       AC = parseInt(v["AC-penalty"], 10) || 0;
       CMD = parseInt(v["CMD-penalty"], 10) || 0;
       hasEndurance = parseInt(v.has_endurance_feat, 10) || 0;
       grittyMode = parseInt(v.wounds_gritty_mode, 10) || 0;
       woundPenalty = PFUtils.getWoundPenalty(woundLevel, hasEndurance, grittyMode);
       subTotPenalty = -1 * ((parseInt(v["condition-Blinded"], 10) || 0) + (parseInt(v["condition-Cowering"], 10) || 0) + (parseInt(v["condition-Stunned"], 10) || 0));
       subTotPenalty += (parseInt(v["condition-Pinned"], 10) || 0);
       subTotPenalty += woundPenalty;
       newCMD = drained + subTotPenalty;
       if (AC !== subTotPenalty) {
         setter["AC-penalty"] = subTotPenalty;
       }
       if (CMD !== newCMD) {
         setter["CMD-penalty"] = newCMD;
       }
     } catch (err) {
       TAS.error("PFDefense.applyConditions:", err);
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
 },

 migrate = function(callback,oldversion){
   var done = _.once(function () {
     TAS.debug("leaving PFDefense.migrate");
     if (typeof callback === "function") {
       callback();
     }
   });
   if (oldversion > 0 && oldversion < 0.50) {
     PFMigrate.migrateMaxDexAndACP();
   }
   getAttrs(['CMD-ability2','unlock_def_ability','AC-ability'],function(v){
     var ac='',cmd='',configflag=0, setter={};
     try {
       ac = PFUtils.findAbilityInString(v['AC-ability']);
       cmd = PFUtils.findAbilityInString(v['CMD-ability2']);
       configflag = parseInt(v.unlock_def_ability,10)||0;
       if (ac && cmd && ac !== cmd && !configflag){
         setter.unlock_def_ability=1;
       } else if (configflag){
         setter.unlock_def_ability=0;
       }
     } catch (err){
       TAS.error("PFDefense.migrate",err);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     }
   });
 },

 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFDefense.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   numDropdowns = _.size(defenseDropdowns),
   doneOneDefenseDropdown= _.after(numDropdowns, function(){
     updateDefenses(done, true);
   });

   migrate(function() {
     applyConditions(function () {
       updateArmor(function () {
         _.each(defenseDropdowns, function (value, key) {
           setDefenseDropdownMod(key, doneOneDefenseDropdown,true,null,true);
         });
       }, silently);
     }, silently);
   },silently);
 },
 events = {
   defenseEventsAuto: "change:bab change:ac-penalty change:cmd-penalty change:size change:ac-shield change:ac-armor change:ac-ability-mod change:ff-dex change:cmd-dex change:ff-cmd-dex change:cmd-str change:max-dex",
   defenseEventsPlayer: "change:ff-dex change:ac-penalty change:cmd-penalty change:size change:ac-dodge change:ac-natural change:ac-deflect change:ac-misc change:cmd-misc",
   defenseEventsEither: "change:size change:AC-ability change:FF-ability change:CMD-ability1 change:CMD-ability2 change:CMD-ability"
 },
 registerEventHandlers = function () {
   _.each(defenseDropdowns, function (write, read) {
     on("change:" + read, TAS.callback(function eventsetDefenseDropdownMod(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       setDefenseDropdownMod(read,null,null,eventInfo);
     }));
   });
   on("change:uncanny_dodge" , TAS.callback(function eventUncannyDodgeUpdate(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       setDefenseDropdownMod(null,null,null,eventInfo);
     }
   }));
   on("change:hd_not_bab" , TAS.callback(function eventCMDSwitchHDandBAB(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateDefenses(null,null,eventInfo);
     }
   }));
   on(events.defenseEventsAuto, TAS.callback(function eventUpdateDefensesAuto(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker") {
       updateDefenses(null,null,eventInfo);
     }
   }));
   on(events.defenseEventsPlayer, TAS.callback(function eventUpdateDefensesPlayer(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateDefenses(null,null,eventInfo);
     }
   }));
   on(events.defenseEventsEither, TAS.callback(function eventUpdateDefensesEither(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateDefenses(null,null,eventInfo);
   }));
   on("change:max-dex-source change:current-load", TAS.callback(function eventUpdateArmor(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateArmor(null,null,eventInfo);
   }));
   _.each(defenseArmorShieldRows, function (row) {
     _.each(defenseArmorShieldColumns, function (column) {
       var eventToWatch = "change:" + row + "-" + column;
       on(eventToWatch, TAS.callback(function eventUpdateDefenseArmorShield(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         updateArmor(null,null,eventInfo);
       }));
     });
   });
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFDefense module loaded        ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   migrate: migrate,
   defenseDropdowns: defenseDropdowns,
   defenseArmorShieldRows: defenseArmorShieldRows,
   defenseArmorShieldRowsOld: defenseArmorShieldRowsOld,
   defenseArmorShieldColumns: defenseArmorShieldColumns,
   applyConditions: applyConditions,
   updateDefenses: updateDefenses,
   setDefenseDropdownMod: setDefenseDropdownMod,
   updateArmor: updateArmor
 };
}());
var PFAttackGrid = PFAttackGrid || (function () {
 'use strict';
 var attackGridFields = {
   "melee": {
     "size": "size",
     "atk": "attk-melee",
     "buff": "buff_Melee-total",
     "abilityMod": "melee-ability-mod",
     "misc": "attk-melee-misc",
     "crit": "attk_melee_crit_conf",
     "attackmacro": "@{toggle_global_melee_macro_insert}",
     "damagemacro": "@{toggle_global_melee_damage_macro_insert}"
   },
   "melee2": {
     "size": "size",
     "atk": "attk-melee2",
     "buff": "buff_Melee-total",
     "abilityMod": "melee2-ability-mod",
     "misc": "attk-melee2-misc",
     "crit": "attk_melee2_crit_conf",
     "attackmacro": "@{toggle_global_melee_macro_insert}",
     "damagemacro": "@{toggle_global_melee_damage_macro_insert}"
   },
   "ranged": {
     "size": "size",
     "atk": "attk-ranged",
     "buff": "buff_Ranged-total",
     "abilityMod": "ranged-ability-mod",
     "misc": "attk-ranged-misc",
     "crit": "attk_ranged_crit_conf",
     "attackmacro": "@{toggle_global_ranged_macro_insert}",
     "damagemacro": "@{toggle_global_ranged_damage_macro_insert}"
   },
   "ranged2": {
     "size": "size",
     "atk": "attk-ranged2",
     "buff": "buff_Ranged-total",
     "abilityMod": "ranged2-ability-mod",
     "misc": "attk-ranged2-misc",
     "crit": "attk_ranged2_crit_conf",
     "attackmacro": "@{toggle_global_ranged_macro_insert}",
     "damagemacro": "@{toggle_global_ranged_damage_macro_insert}"
   },
   "CMB": {
     "size": "CMD-size",
     "atk": "CMB",
     "buff": "buff_Melee-total",
     "abilityMod": "CMB-ability-mod",
     "misc": "attk-CMB-misc",
     "crit": "attk_cmb_crit_conf",
     "attackmacro": "@{toggle_global_cmb_macro_insert}",
     "damagemacro": "@{toggle_global_cmb_damage_macro_insert}"
   },
   "CMB2": {
     "size": "CMD-size",
     "atk": "CMB2",
     "buff": "buff_Melee-total",
     "abilityMod": "CMB2-ability-mod",
     "misc": "attk-CMB2-misc",
     "crit": "attk_cmb2_crit_conf",
     "attackmacro": "@{toggle_global_cmb_macro_insert}",
     "damagemacro": "@{toggle_global_cmb_damage_macro_insert}"
   }
 },
 attkpenaltyAddToFields = ["condition-Invisible", "acp-attack-mod", "condition-Drained"],
 attkpenaltySubtractFromFields = ["condition-Dazzled", "condition-Entangled", "condition-Grappled", "condition-Fear", "condition-Prone", "condition-Sickened", "condition-Wounds"],
 attkpenaltySumRow = ["attk-penalty"].concat(attkpenaltyAddToFields),
 updateDamage = function (callback, silently) {
   SWUtils.updateRowTotal(["DMG-mod", "buff_DMG-total"], 0, ["condition-Sickened"], false, callback, silently);
 },
 /** updates the attk-penalty for attacks based on conditions including wearing armor you are not proficient in
 *@param {function} callback optional call when done
 *@param {bool} silently optional if true call setAttrs with PFConst.silentParams
 *@param {eventInfo} eventInfo unused eventInfo from on method
 */
 applyConditions = function (callback, silently, eventInfo) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   SWUtils.updateRowTotal(attkpenaltySumRow, 0, attkpenaltySubtractFromFields, false, done, silently);
 },
 /** updateAttack - updates one row of attack grid (left most column in grid)
 * Updates the attack type totals at top of attack page for one row of grid
 * @param {string} attype = key for attackGridFields to indicate which row from attack grid
 * @param {eventInfo } eventInfo unused
 * @param {function} callback optional call when done
 * @param {bool} silently optional if true call setAttrs with PFConst.silentParams
 */
 updateAttack = function (attype, eventInfo, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   if (attackGridFields[attype]) {
     SWUtils.updateRowTotal([attackGridFields[attype].atk, "bab", "attk-penalty", attackGridFields[attype].abilityMod,
       attackGridFields[attype].misc, attackGridFields[attype].size, attackGridFields[attype].buff
       ], 0, [], false, done, silently);
   } else {
     TAS.error("PFAttackGrid.updateAttack attack grid fields do not exist for: " + attype);
     done();
   }
 },

 resetCommandMacro = function (eventInfo, callback) {
   var done = _.once(function () { if (typeof callback === "function") { callback(); } }),
   baseAttacks = "{{row01= **^{base-attacks}** }} {{row02=[^{melee}](~@{character_id}|REPLACENPCMelee-Attack-Roll) [^{ranged}](~@{character_id}|REPLACENPCRanged-Attack-Roll) [^{combat-maneuver-bonus-abbrv}](~@{character_id}|REPLACENPCCMB-Check) [^{melee2}](~@{character_id}|REPLACENPCMelee2-Attack-Roll) REPLACE}}",
   ranged2BaseAttacks = "[^{ranged2}](~@{character_id}|REPLACENPCRanged2-Attack-Roll)",
   cmb2BaseAttacks = "[^{combat-maneuver-bonus-abbrv2}](~@{character_id}|REPLACENPCCMB2-Check)",
   //           012 345678901234567890 23
   baseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_attack_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_attack-melee}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{attacks}}}",
   npcBaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_attack_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_attack-melee}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} ^{attacks}}}";
   getAttrs(["is_npc", "attacks-macro", "attacks-macro-npc", "include_attack_totals", "ranged_2_show", "cmb_2_show"], function (currMacros) {
     var showBonus = parseInt(currMacros["include_attack_totals"], 10) || 0,
     isNPC = parseInt(currMacros.is_npc, 10) || 0,
     npcStr = isNPC ? "npc-" : "";
     baseAttacks = baseAttacks.replace(/REPLACENPC/g, npcStr);
     if (parseInt(currMacros.ranged_2_show, 10)) {
       ranged2BaseAttacks = ranged2BaseAttacks.replace(/REPLACENPC/g, npcStr)||"";
     } else {
       ranged2BaseAttacks = "";
     }
     if (parseInt(currMacros.cmb_2_show, 10)) {
       cmb2BaseAttacks = cmb2BaseAttacks.replace(/REPLACENPC/g, npcStr)||"";
     } else {
       cmb2BaseAttacks = "";
     }
     baseAttacks = baseAttacks.replace(/REPLACE/, (ranged2BaseAttacks + ' ' + cmb2BaseAttacks))||"";
     if (isNPC){
       baseMacro = npcBaseMacro + baseAttacks;
     } else {
       baseMacro += baseAttacks;
     }

     //TAS.debug("PFAttackGrid.resetCommandMacro baseMacro: " + baseMacro);
     getSectionIDs("repeating_weapon", function (idarray) {
       //if no attacks just set the base melee, ranged, cmb attacks
       if (!idarray || idarray.length === 0) {
         var attrs = {};
         if (!isNPC && currMacros["attacks-macro"].slice(13) !== baseMacro.slice(13)) {
           attrs["attacks-macro"] = baseMacro;
         } else if (isNPC && currMacros["attacks-macro-npc"].slice(13) !== baseMacro.slice(13)) {
           attrs["attacks-macro-npc"] = baseMacro;
         }
         if (_.size(attrs)) {
           setAttrs(attrs, {
             silent: true
           }, done);
         } else {
           done();
         }
         return;
       }
       getAttrs(["_reporder_repeating_weapon"], function (repValues) {
         var atkattrs = [];
         //TAS.debug("PFAttackGrid.resetCommandMacro values:", repValues);
         _.each(idarray, function (id) {
           atkattrs.push("repeating_weapon_" + id + "_attack-type");
           atkattrs.push("repeating_weapon_" + id + "_name");
           atkattrs.push("repeating_weapon_" + id + "_group");
           if (showBonus) {
             atkattrs.push("repeating_weapon_" + id + "_total-attack");
           }
         });
         getAttrs(atkattrs, function (values) {
           var repList,
           orderedList,
           attackIDList,
           melee = "",
           ranged = "",
           cmb = "",
           misc = "",
           attrs = {},
           otherGroups = {},
           other = "",
           tempstr="",
           rowcounter=10,
           newMacro="";
           try {
             if (!_.isUndefined(repValues._reporder_repeating_weapon) && repValues._reporder_repeating_weapon !== "") {
               repList = repValues._reporder_repeating_weapon.split(",");
               repList = _.map(repList, function (ID) {
                 return ID.toLowerCase();
               });
             }
             orderedList = _.union(repList, idarray);
             attackIDList = _.object(_.map(orderedList, function (id) {
               return [id, values["repeating_weapon_" + id + "_attack-type"]];
             }));
             orderedList = _.filter(orderedList, function (ID) {
               if (typeof values["repeating_weapon_" + ID + "_name"] === "undefined" || typeof values["repeating_weapon_" + ID + "_attack-type"] === "undefined") {
                 return false;
               }
               return true;
             });
             _.each(orderedList, function (ID) {
               var temproll = "",
               NPCtemproll = "",
               value = "",
               buttonName = "",
               bonusStr = showBonus ? (" + @{repeating_weapon_" + ID + "_total-attack}") : "",
               attackName = values["repeating_weapon_" + ID + "_name"],
               groupName = values["repeating_weapon_" + ID + "_group"];
               buttonName = attackName + bonusStr;
               buttonName = SWUtils.escapeForChatLinkButton(buttonName);
               buttonName = SWUtils.escapeForRollTemplate(buttonName);

               temproll = " [" + buttonName + "](~@{character_id}|repeating_weapon_" + ID + "_attack-" + npcStr + "roll)";

               if (attackIDList[ID]) {
                 if (groupName) {
                   if (!otherGroups[groupName]) {
                     otherGroups[groupName] = "";
                   }
                   otherGroups[groupName] += temproll;
                 } else {
                   value = PFUtils.findAbilityInString(attackIDList[ID]);
                   switch (value) {
                     case 'attk-melee':
                     case 'attk-melee2':
                       melee += temproll;
                       break;
                     case 'attk-ranged':
                     case 'attk-ranged2':
                       ranged += temproll;
                       break;
                     case 'CMB':
                     case 'CMB2':
                       cmb += temproll;
                       break;
                     default:
                       misc += temproll;
                       break;
                   }
                 }
               }
             });
             if (otherGroups && _.size(otherGroups) > 0) {
               other = _.reduce(otherGroups, function (memo, str, loopgroup) {
                 memo += " {{row"+rowcounter +"=**"+ loopgroup + "**}}" ;
                 rowcounter++;
                 memo += " {{row"+rowcounter +"="+ str.trim() + "}}";
                 rowcounter++;
                 return memo;
               }, other);
             }
             other = other||"";
             if (melee) {
               tempstr = " {{row"+rowcounter +"=**^{melee}**}}";
               rowcounter++;
               tempstr += " {{row"+rowcounter +"="+ melee.trim() + "}}";
               rowcounter++;
               melee = tempstr;
             }
             if (ranged) {
               tempstr = " {{row"+rowcounter +"=**^{ranged}**}}";
               rowcounter++;
               tempstr += " {{row"+rowcounter +"=" + ranged.trim() + "}}";
               rowcounter++;
               ranged = tempstr;
             }
             if (cmb) {
               tempstr = " {{row"+rowcounter +"=**^{combat-maneuver-bonus-abbrv}**}}";
               rowcounter++;
               tempstr += " {{row"+rowcounter +"=" + cmb.trim() + "}}";
               rowcounter++;
               cmb = tempstr;
             }
             if (misc) {
               tempstr = " {{row"+rowcounter +"=**^{miscellaneous-abbrv}**}}";
               rowcounter++;
               tempstr += " {{row"+rowcounter +"=" + cmb.trim() + "}}";
               rowcounter++;
               misc = tempstr;
             }

             newMacro = baseMacro + other + melee + ranged + cmb + misc;
             if (newMacro){
               if (!isNPC && currMacros["attacks-macro"].slice(13) !== newMacro.slice(13)) {
                 attrs["attacks-macro"] = newMacro;
               } else if (isNPC && currMacros["attacks-macro-npc"].slice(13) !== newMacro.slice(13)) {
                 attrs["attacks-macro-npc"] = newMacro;
               }
             }
           } catch (err) {
             TAS.error("PFAttackGrid.resetCommandMacro", err);
           } finally {
             if (_.size(attrs) > 0) {
               setAttrs(attrs, { silent: true }, done);
             } else {
               done();
             }
           }
         });
       });
     });
   });
 },

 migrate = function(callback, oldversion){
   var done = function () {
     TAS.debug("leaving PFAttackGrid.migrate");
     if (typeof callback === "function") {
       callback();
     }
   };
   PFMigrate.migrateAltAttackGridrowFlags();
   done();
 },
 /** recalculates all write-to fields in module
 * @param {function} callback optional call when done
 * @param {bool} silently optional if true call setAttrs with PFConst.silentParams
 * @param {number} oldversion the version upgrading from
 */
 recalculate = function (callback, silently, oldversion) {
   var done = function () {
     TAS.debug("leaving PFAttackGrid.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   },
   doneAttack=_.after(7,done),
   callUpdateAttacksAndDamage = _.once(function(){
     _.each(attackGridFields, function (attrMap, attack) {
       updateAttack(attack,null,doneAttack,silently);
     });
     updateDamage(doneAttack,silently);
   }),
   callApplyConditions = _.once(function(){
     applyConditions(callUpdateAttacksAndDamage,silently);
   });
   //TAS.debug"At PFAttackGrid.recalculate");
   migrate(callApplyConditions,oldversion);
 },
 registerEventHandlers = function () {
   _.each(attackGridFields, function (attackFields, attack) {
     on("change:bab change:" + attackFields.size, TAS.callback(function eventBABSizeAbilityModchange(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateAttack(attack);
     }));
     on("change:" + attackFields.misc, TAS.callback(function eventAttackMisc(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         updateAttack(attack);
       }
     }));
     on("change:attk-penalty change:" + attackFields.abilityMod + " change:" + attackFields.buff, TAS.callback(function eventAttackPenalty(eventInfo) {
       if (eventInfo.sourceType === "sheetworker") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         updateAttack(attack);
       }
     }));
   });
   on("change:buff_Melee-total", TAS.callback(function meleebuffEventMelee(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker") {
       updateAttack('melee', eventInfo);
       updateAttack('melee2', eventInfo);
       updateAttack('CMB', eventInfo);
       updateAttack('CMB2', eventInfo);
     }
   }));
   on("change:buff_Ranged-total", TAS.callback(function meleebuffEventRanged(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker") {
       updateAttack('ranged', eventInfo);
       updateAttack('ranged2', eventInfo);
     }
   }));
   on("change:acp-attack-mod", TAS.callback(function PFAttackGrid_applyConditions(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     applyConditions();
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFAttackGrid module loaded     ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate: migrate,
   recalculate: recalculate,
   resetCommandMacro: resetCommandMacro,
   attackGridFields: attackGridFields,
   updateDamage: updateDamage,
   applyConditions: applyConditions,
   updateAttack: updateAttack
 };
}());
var PFAttackOptions = PFAttackOptions || (function () {
 'use strict';
 var optionTemplates = {
   melee_notes: "{{melee_notes=REPLACE}}",
   ranged_notes: "{{ranged_notes=REPLACE}}",
   CMB_notes: "{{CMB_notes=REPLACE}}",
   attack_notes: "{{attack_notes=REPLACE}}",
   header_image: "{{header_image=REPLACE}}"
 },
 optionDefaults = {
   notes: {
     melee: "@{melee-attack-notes}",
     ranged: "@{ranged-attack-notes}",
     CMB: "@{CMB-notes}",
     attack: "@{attack-notes}"
   },
   image: {
     melee: "@{header_image-pf_attack-melee}",
     ranged: "@{header_image-pf_attack-ranged}",
     CMB: "@{header_image-pf_attack-cmb}"
   }
 },
 //not used since melee options field actually look at the text..
 //optionAttrs = ["melee-attack-notes", "ranged-attack-notes", "CMB-notes", "attack-notes", "header_image-pf_attack-melee", "header_image-pf_attack-ranged", "header_image-pf_attack-cmb"],
 optionToggles = ["toggle_attack_melee_notes", "toggle_attack_ranged_notes", "toggle_attack_CMB_notes", "toggle_attack_attack_notes", "toggle_attack_header_image"],
 //attackOptionRegex = PFUtils.getOptionsCompiledRegexMap(optionTemplates),
 repeatingOptionAttrs = ["attack-type", "damage-ability", "damage-dice-num","damage-die","damage","attack"],
 repeatingOptionHelperAttrs = [""],// ["damage-mod", "attack-mod"],
 repeatingOptionGetAttrs = repeatingOptionAttrs.concat(repeatingOptionHelperAttrs),
 repeatingOptionGetAttrsLU = _.map(repeatingOptionGetAttrs,function(field){return '_'+field;}),
 /********* REPEATING WEAPON FIELDSET *********/
 /** getOptionText - resets entire macro options text for a repeating_weapon row
 *@param {string} prefix repeating_weapon_id_
 *@param {map} toggleValues map of ".showxxxx" where xxxx is what to display, already calculated for us
 *@param {map} rowValues output from getAttrs
 */
 getOptionText = function (prefix, toggleValues, rowValues) {
   var
   attackType = PFUtils.findAbilityInString(rowValues[prefix + "attack-type"]),
   damageAbility = PFUtils.findAbilityInString(rowValues[prefix + "damage-ability"]),
   optionText = "";
   if (!(attackType || rowValues[prefix + "attack"] )) {
     optionText += "{{no_attack_roll=1}}";
   } else if (attackType){
     attackType = attackType.replace('attk-','').replace('2', '')||"";
     if(toggleValues['show'+attackType.toLowerCase()]){
       optionText += optionTemplates[attackType + "_notes"].replace("REPLACE", optionDefaults.notes[attackType])||"";
     }
   }
   if (toggleValues.showheader_image) {
     optionText += optionTemplates.header_image.replace("REPLACE", optionDefaults.image[attackType||'melee'])||"";
   }
   if (!(damageAbility || rowValues[prefix + "damage"] ||
     (parseInt(rowValues[prefix + "damage-dice-num"], 10) && parseInt(rowValues[prefix + "damage-die"], 10)))) {
     optionText += "{{no_damage=1}}";
   }
   if (toggleValues.showattack) {
     optionText += optionTemplates.attack_notes.replace("REPLACE", optionDefaults.notes.attack)||"";
   }
   return optionText;
 },
 /* resets one row of repeating_weapons
 * note this is almost exactly like resetOption suggesting there is a way to refactor these*/
 resetOption = function (id, eventInfo, callback) {
   var done = _.once(function(){
     TAS.debug("leaving PFAttackOptions.resetOption, rowid: "+ id);
     if (typeof callback === "function"){
       callback();
     }
   }),
   prefix = "repeating_weapon_" + PFUtils.getRepeatingIDStr(id),
   rowfields = _.map(repeatingOptionGetAttrs, function (attr) {
     return prefix + attr;
   }),
   allFields = optionToggles;
   allFields = allFields.concat(rowfields);
   //TAS.log("resetOption, fields to get",allFields);
   getAttrs(allFields, function (v) {
     var toggleValues = _.reduce(optionToggles, function (memo, attr) {
       memo['show' + attr.toLowerCase().slice(14).replace('_notes', '')] = (parseInt(v[attr], 10) || 0);
       return memo;
     }, {}),
     optionText = "",
     setter = {};
     optionText = getOptionText(prefix, toggleValues, v)||"";
     if (typeof optionText !== "undefined" && optionText !== null) {
       setter[prefix + "macro_options"] = optionText;
     }
     if (_.size(setter) > 0) {
       setAttrs(setter, PFConst.silentParams, done);
     } else {
       done();
     }
   });
 },
 resetSomeOptions = function(ids,eventInfo,callback){
   var done=_.once(function(){
     if (typeof callback === 'function'){
       callback();
     }
   });
   if(!(ids && _.size(ids))){
     done();
     return;
   }
   getAttrs(optionToggles,function(vout){
     var fields,
     toggleValues = _.reduce(optionToggles, function (memo, attr) {
       memo['show' + attr.toLowerCase().slice(14).replace('_notes', '')] = (parseInt(vout[attr], 10) || 0);
       return memo;
     }, {});
     fields = SWUtils.cartesianAppend(["repeating_weapon_"],ids,repeatingOptionGetAttrsLU);
     getAttrs(fields,function(v){
       var setter = _.reduce(ids,function(memo,id){
         var prefix='repeating_weapon_'+id+'_',tempstr='';
         try{
           tempstr = getOptionText(prefix,toggleValues,v);
           //tempstr= getOptionTextNew(prefix,toggleValues,v)||'';
           if(tempstr!== v[prefix+'macro_options']){
             memo[prefix+'macro_options']=tempstr;
           }
         } finally {
           return memo;
         }
       },{});
       if(_.size(setter)){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     });
   });
 },
 /*resetOptions - updates repeating_weapon_ attack _options for all attacks.*/
 resetOptions = function (callback,eventInfo) {
   getSectionIDs("repeating_weapon", function (ids) {
     resetSomeOptions(ids,eventInfo,callback);
   });
 },
 recalculate = function (callback) {
   resetOptions(callback);
 },
 events = {
   attackOptionEventsPlayer: repeatingOptionAttrs,
   attackOptionEventsAuto: repeatingOptionHelperAttrs
 },
 registerEventHandlers = function () {
   _.each(optionToggles, function (toggleField) {
     on("change:" + toggleField, TAS.callback(function toggleAttackNoteOption(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         resetOptions(null,eventInfo);
       }
     }));
   });
   //attack options for one row
   _.each(events.attackOptionEventsAuto, function (fieldToWatch) {
     var eventToWatch = "change:repeating_weapon:" + fieldToWatch;
     on(eventToWatch, TAS.callback(function eventUpdateAttackTypeOptionSheet(eventInfo) {
       if (eventInfo.sourceType === "sheetworker") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         resetOption(null, eventInfo);
       }
     }));
   });
   _.each(events.attackOptionEventsPlayer, function (fieldToWatch) {
     var eventToWatch = "change:repeating_weapon:" + fieldToWatch;
     on(eventToWatch, TAS.callback(function eventUpdateAttackTypeOptionPlayer(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         resetOption(null, eventInfo);
       }
     }));
   });
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFAttackOptions module loaded  ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   getOptionText: getOptionText,
   resetOption: resetOption,
   resetOptions: resetOptions,
   resetSomeOptions: resetSomeOptions
 };
}());
var PFEncumbrance = PFEncumbrance || (function () {
 'use strict';
 var
 // Returns the carrying capacity for a given strength score and load type
 // Will recursively calculate for strength scores over 29
 getCarryingCapacity = function (str, load) {
   var l,
   m,
   h,
   r;
   switch (str) {
     case 0:
       l = 0;
       m = 0;
       h = 0;
       break;
     case 1:
       l = 3;
       m = 6;
       h = 10;
       break;
     case 2:
       l = 6;
       m = 13;
       h = 20;
       break;
     case 3:
       l = 10;
       m = 20;
       h = 30;
       break;
     case 4:
       l = 13;
       m = 26;
       h = 40;
       break;
     case 5:
       l = 16;
       m = 33;
       h = 50;
       break;
     case 6:
       l = 20;
       m = 40;
       h = 60;
       break;
     case 7:
       l = 23;
       m = 46;
       h = 70;
       break;
     case 8:
       l = 26;
       m = 53;
       h = 80;
       break;
     case 9:
       l = 30;
       m = 60;
       h = 90;
       break;
     case 10:
       l = 33;
       m = 66;
       h = 100;
       break;
     case 11:
       l = 38;
       m = 76;
       h = 115;
       break;
     case 12:
       l = 43;
       m = 86;
       h = 130;
       break;
     case 13:
       l = 50;
       m = 100;
       h = 150;
       break;
     case 14:
       l = 58;
       m = 116;
       h = 175;
       break;
     case 15:
       l = 66;
       m = 133;
       h = 200;
       break;
     case 16:
       l = 76;
       m = 153;
       h = 230;
       break;
     case 17:
       l = 86;
       m = 173;
       h = 260;
       break;
     case 18:
       l = 100;
       m = 200;
       h = 300;
       break;
     case 19:
       l = 116;
       m = 233;
       h = 350;
       break;
     case 20:
       l = 133;
       m = 266;
       h = 400;
       break;
     case 21:
       l = 153;
       m = 306;
       h = 460;
       break;
     case 22:
       l = 173;
       m = 346;
       h = 520;
       break;
     case 23:
       l = 200;
       m = 400;
       h = 600;
       break;
     case 24:
       l = 233;
       m = 466;
       h = 700;
       break;
     case 25:
       l = 266;
       m = 533;
       h = 800;
       break;
     case 26:
       l = 306;
       m = 613;
       h = 920;
       break;
     case 27:
       l = 346;
       m = 693;
       h = 1040;
       break;
     case 28:
       l = 400;
       m = 800;
       h = 1200;
       break;
     case 29:
       l = 466;
       m = 933;
       h = 1400;
       break;
     default:
       l = getCarryingCapacity(str - 10, "light") * 4;
       m = getCarryingCapacity(str - 10, "medium") * 4;
       h = getCarryingCapacity(str - 10, "heavy") * 4;
       break;
   }
   switch (load) {
     case "light":
       r = l;
       break;
     case "medium":
       r = m;
       break;
     case "heavy":
       r = h;
       break;
   }
   return r;
 },
 /* updateCurrentLoad-updates the current load radio button */
 updateCurrentLoad = function (callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getAttrs(["load-light", "load-medium", "load-heavy", "load-max", "current-load", "carried-total","max-dex-source"], function (v) {
     var curr = 0,
     carried = 0,
     light = 0,
     medium = 0,
     heavy = 0,
     max = 0,
     maxDexSource = 0,
     ignoreEncumbrance = 0,
     newLoad = 0,
     setter = {},
     params = {};
     try {
       //TAS.debug("at updateCurrentLoad",v);
       maxDexSource=parseInt(v["max-dex-source"],10)||0;
       ignoreEncumbrance =  (maxDexSource===1 || maxDexSource===3)?1:0;
       curr = parseInt(v["current-load"], 10) || 0;
       if (ignoreEncumbrance){
         newLoad=0;
       } else {

         carried = parseInt(v["carried-total"], 10) || 0;
         light = parseInt(v["load-light"], 10) || 0;
         medium = parseInt(v["load-medium"], 10) || 0;
         heavy = parseInt(v["load-heavy"], 10) || 0;
         max = heavy * 2;

         //TAS.debug"current-load=" + curr + ", carried-total=" + carried + ", load-light=" + light + ", load-medium=" + medium);
         if (carried <= light) {
           //TAS.debug("light load");
           newLoad = 0;
         } else if (carried <= medium) {
           //TAS.debug("medium load");
           newLoad = 1;
         } else if (carried <= heavy) {
           //TAS.debug("heavy load");
           newLoad = 2;
         } else if (carried <= max) {
           //TAS.debug"over heavy but under max");
           newLoad = 3;
         } else if (carried > max) {
           //TAS.debug"maximum load");
           newLoad = 4;
         }
       }
       if (curr !== newLoad){
         setter["current-load"] = newLoad;
       }
     } catch (err) {
       TAS.error("PFEncumbrance.updateCurrentLoad", err);
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
 },
 /* updateLoadsAndLift
 * updates the load and lift numbers
 */
 updateLoadsAndLift = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["STR", "size", "size-multiplier", "legs", "load-light", "load-medium", "load-heavy", "load-max",
   "lift-above-head", "lift-off-ground", "lift-drag-and-push", "load-str-bonus", "load-multiplier",
   "total-load-multiplier", "load-misc"], function (v) {
     var str = 10,
     size = 1,
     sizeMult = 1,
     currSizeMult = 1,
     currTotalLoadMult = 1,
     legs = 2,
     light = 0,
     medium = 0,
     heavy = 0,
     max = 0,
     aboveHead = 0,
     offGround = 0,
     drag = 0,
     strMod = 0,
     loadMult = 1,
     mult = 1,
     misc = 0,
     l = 0,
     m = 0,
     h = 0,
     a = 0,
     o = 0,
     d = 0,
     setter = {},
     params = {};
     try {
       str = parseInt(v["STR"], 10) || 0;
       size = parseInt(v["size"], 10) || 0;
       sizeMult = parseInt(v["size-multiplier"], 10) || 0;
       currSizeMult = sizeMult;
       currTotalLoadMult = parseInt(v["total-load-multiplier"], 10) || 0;
       legs = parseInt(v["legs"], 10) || 0;
       if (legs!==4){legs=2;}
       light = parseInt(v["load-light"], 10) || 0;
       medium = parseInt(v["load-medium"], 10) || 0;
       heavy = parseInt(v["load-heavy"], 10) || 0;
       max = parseInt(v["load-max"], 10) || 0;
       aboveHead = parseInt(v["lift-above-head"], 10) || 0;
       offGround = parseInt(v["lift-off-ground"], 10) || 0;
       drag = parseInt(v["lift-drag-and-push"], 10) || 0;
       strMod = parseInt(v["load-str-bonus"], 10) || 0;
       loadMult = parseInt(v["load-multiplier"], 10) || 0;
       mult = 1;
       misc = parseInt(v["load-misc"], 10) || 0;
       l = getCarryingCapacity(str + strMod, "light") + misc;
       m = getCarryingCapacity(str + strMod, "medium") + misc;
       h = getCarryingCapacity(str + strMod, "heavy") + misc;
       if (loadMult < 1) {
         loadMult = 1;
       }
       loadMult--;
       //TAS.debug("STR=" + str + ", legs=" + legs + ", load-light=" + light + ", load-medium=" + medium + ", load-heavy=" + heavy + ", lift-above-head=" + aboveHead + ", lift-off-ground=" + offGround + ", lift-drag-and-push=" + drag + ", load-str-bonus=" + strMod + ", load-multiplier=" + loadMult + ", load-misc=" + misc);
       if (legs !== 4 ) {
         switch (size) {
           case -8:
             sizeMult = 16;
             break;
           case -4:
             sizeMult = 8;
             break;
           case -2:
             sizeMult = 4;
             break;
           case -1:
             sizeMult = 2;
             break;
           case 1:
             sizeMult = 3 / 4;
             break;
           case 2:
             sizeMult = 1 / 2;
             break;
           case 4:
             sizeMult = 1 / 4;
             break;
           case 8:
             sizeMult = 1 / 8;
             break;
           default:
             sizeMult = 1;
         }
       } else if (legs === 4) {
         switch (size) {
           case -8:
             sizeMult = 24;
             break;
           case -4:
             sizeMult = 12;
             break;
           case -2:
             sizeMult = 6;
             break;
           case -1:
             sizeMult = 3;
             break;
           case 0:
             sizeMult = 1.5;
             break;
           case 1:
             sizeMult = 1;
             break;
           case 2:
             sizeMult = 3 / 4;
             break;
           case 4:
             sizeMult = 1 / 2;
             break;
           case 8:
             sizeMult = 1 / 4;
             break;
           default:
             sizeMult = 1.5;
         }
       }
       mult += loadMult;
       mult *= sizeMult;
       l *= mult;
       m *= mult;
       h *= mult;
       a = h;
       o = h * 2;
       d = h * 5;
       //TAS.debug("new light load=" + l + ", new medium load=" + m + ", new heavy load=" + h + ", new above head=" + a + ", new off ground=" + o + ", new drag=" + d);
       if (currSizeMult !== sizeMult) {
         setter["size-multiplier"] = sizeMult;
       }
       if (currTotalLoadMult !== mult) {
         setter["total-load-multiplier"] = mult;
       }
       if (light !== l) {
         setter["load-light"] = l;
       }
       if (medium !== m) {
         setter["load-medium"] = m;
       }
       if (heavy !== h) {
         setter["load-heavy"] = h;
       }
       if (max !== (h*2)){
         setter["load-max"] = (h*2);
       }
       if (aboveHead !== a) {
         setter["lift-above-head"] = a;
       }
       if (offGround !== o) {
         setter["lift-off-ground"] = o;
       }
       if (drag !== d) {
         setter["lift-drag-and-push"] = d;
       }
     } catch (err) {
       TAS.error("updateLoadsAndLift", err);
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
 },
 /* updateModifiedSpeed
 * updates the modified speed and run values  */
 updateModifiedSpeed = function (callback) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   attribList = ["current-load", "speed-base", "speed-modified", "speed-run",  "race", "is_dwarf", "max-dex-source", "run-mult"];
   _.each(PFDefense.defenseArmorShieldRows, function (row) {
     attribList.push(row + "-equipped");
     attribList.push(row + "-type");
   });
   getAttrs(attribList, function (v) {
     var currSpeed = parseInt(v["speed-modified"], 10) || 0,
     currRun = parseInt(v["speed-run"], 10) || 0,
     currLoad = parseInt(v["current-load"], 10) || 0,
     base = parseInt(v["speed-base"], 10) || 0,
     speedDropdown = parseInt(v["max-dex-source"], 10) || 0,
     origRunMult = isNaN(parseInt(v["run-mult"], 10)) ? 4 : parseInt(v["run-mult"], 10),
     newSpeed = base,
     runMult = origRunMult,
     newRun = base * runMult,
     combinedLoad = 0,
     isDwarf = false,
     inHeavy = false,
     inMedium = false,
     armorLoad = 0,
     setter = {};
     try {
       //TAS.debug("speed-modified=" + currSpeed + ", speed-run=" + currRun + ", current-load=" + currLoad + ", speed-base=" + base + ", load-heavy=" + heavy + ", carried-total=" + carried);
       // #0: Armor, Shield & Load
       // #1: Armor & Shield only
       // #2: Load only
       // #3: None
       if (speedDropdown !== 3) {
         //dwarf base speed not lowered but run multiplier can be.
         isDwarf = parseInt(v.is_dwarf,10)||0;
         if (!isDwarf){
           isDwarf = typeof v.race === "undefined" ? false : v.race.toLowerCase().indexOf("dwarf") >= 0;
           if (isDwarf){
             setter["is_dwarf"]=1;
           }
         }
         if (speedDropdown === 0 || speedDropdown === 1) {
           inHeavy = (v["armor3-type"] === "Heavy" && (v["armor3-equipped"] == "1" || typeof v["armor3-equipped"] === "undefined"));
           inMedium = (v["armor3-type"] === "Medium" && (v["armor3-equipped"] == "1" || typeof v["armor3-equipped"] === "undefined"));
           if (inMedium){ armorLoad = 1;}
           else if (inHeavy) {armorLoad = 2;}
         }
         combinedLoad = Math.max(armorLoad,currLoad);
         if (combinedLoad===4){
           newSpeed = 0;
           newRun=0;
           runMult=0;
         } else if (combinedLoad === 3){
           newSpeed = 5;
           newRun=0;
           runMult=0;
         } else if (combinedLoad === 2 || combinedLoad === 1) {
           if (!isDwarf){
             if (base <= 5) {
               newSpeed = 5;
             } else if (base % 15 === 0) {
               newSpeed = base * 2 / 3;
             } else if ((base + 5) % 15 === 0) {
               newSpeed = (base + 5) * 2 / 3;
             } else {
               newSpeed = ((base + 10) * 2 / 3) - 5;
             }
           }
           runMult--;
         } else {
           newSpeed = base;
         }
       }
       newRun = newSpeed * runMult;
       if (currSpeed !== newSpeed) {
         setter["speed-modified"] = newSpeed;
       }
       if (currRun !== newRun) {
         setter["speed-run"] = newRun;
       }
     } catch (err) {
       TAS.error("PFEncumbrance.updateModifiedSpeed", err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, {}, done);
       } else {
         done();
       }
     }
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFEncumbrance.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   setSpeedWhenDone = _.once(function () {
     updateModifiedSpeed(done);
   }),
   setEncumbrance = _.once(function () {
     updateCurrentLoad(setSpeedWhenDone);
   }),
   setLoadCapability = _.once(function () {
     updateLoadsAndLift(setEncumbrance, silently);
   });
   try {
     setLoadCapability();
   } catch (err) {
     TAS.error("PFEncumbrance.recalculate", err);
     done();
   }
 },
 registerEventHandlers = function () {
   on("change:current-load change:speed-base change:race change:armor3-equipped change:armor3-type change:max-dex-source change:run-mult", TAS.callback(function eventUpdateModifiedSpeed(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateModifiedSpeed();
   }));
   on('change:load-light change:carried-total', TAS.callback(function eventUpdateCurrentLoad(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker"){
       updateCurrentLoad();
     }
   }));
   on("change:STR change:legs change:load-str-bonus change:load-multiplier change:load-misc", TAS.callback(function eventUpdateLoadsAndLift(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateLoadsAndLift();
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFEncumbrance module loaded    ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   getCarryingCapacity: getCarryingCapacity,
   updateCurrentLoad: updateCurrentLoad,
   updateLoadsAndLift: updateLoadsAndLift,
   updateModifiedSpeed: updateModifiedSpeed
 };
}());
var PFInventory = PFInventory || (function () {
 'use strict';
 var wornEquipmentRowsOld = ["Belt", "Body", "Chest", "Eyes", "Feet", "Hands", "Head", "Headband", "Neck", "Ring1", "Ring2", "Shoulders", "Wrist"],
 wornEquipmentRowsNew = ["Armor", "Belt", "Body", "Chest", "Eyes", "Feet", "Hands", "Head", "Headband", "Neck", "Ring1", "Ring2", "Shield", "Shoulders", "Wrist"],
 wornEquipmentRowsPlusCarried=["Carried","NotCarried"].concat(wornEquipmentRowsNew),
 locationMap = {'Carried':0,'NotCarried':1,'Armor':2,'Belt':3,'Body':4,'Chest':5,'Eyes':6,'Feet':7,'Hands':8,
   'Head':9,'Headband':10,'Neck':11,'Ring1':12,'Ring2':13,'Shield':14,'Shoulders':15,'Wrist':16},
 equipMap = {'noEquipType':0,'Weapon':1,'Armor':2,'Ammo':3,'Consumables':4,'OtherMagic':5,'Gear':6,'Other':7},
 groupMapForMenu = {0:'',1:'weapons',2:'armor-shield',3:'ammunition',4:'consumables',5:'other-magic-items',6:'gear-tool',7:'other-items'},
 wornEquipmentColumns = ["charges", "weight", "hp", "hp_max", "value"],
 commonLinkedAttributes = ["attack-type", "range", "masterwork", "crit-target", "crit-multiplier", "damage-dice-num", "damage-die", "damage",
   "precision_dmg_macro", "precision_dmg_type", "critical_dmg_macro", "critical_dmg_type"],
 /** resetCommandMacro sets command button macro with all rows from one ability list.
 * calls PFMenus.getRepeatingCommandMacro
 * sets the returned string to macro with attribute name: section+"_buttons_macro"
 *@param {function} callback  when done
 */
 resetCommandMacro=function(callback){
   var done = _.once(function () {
       TAS.debug("leaving PFInventory.resetCommandMacro: ");
       if (typeof callback === "function") {
         callback();
       }
     }),
     params={};
   //TAS.debug"PFInventory.resetCommandMacro getting rollmenu  ");
   params={
     'section': 'item',
     'name': 'items',
     'usesField': 'qty',
     'linkField': 'roll',
     'nameField': 'name',
     'filterField': 'showinmenu',
     'npcLinkField': 'npc-roll',
     'groupBy':'equip-type',
     'translateGroup':1,
     'groupMap': groupMapForMenu
   };
   getAttrs(['is_npc'],function(v){
     var isNPC=parseInt(v.is_npc,10)||0,
     numToDo=isNPC?2:1,
     doneOne=_.after(numToDo,done);
     PFMenus.resetOneCommandMacro('item',isNPC,doneOne,'',groupMapForMenu);
     if (isNPC){
       PFMenus.resetOneCommandMacro('item',false,doneOne,'',groupMapForMenu);
     }
   /*	if (isNPC){
       params.linkField = 'npc-roll';
     }
     PFMenus.getRepeatingCommandMacro( params,function(newMacro){
       var setter={};
       setter["item_buttons_macro"]=newMacro||"";
       setAttrs(setter,PFConst.silentParams,done);
     });
     */
   });
 },
 /** Gets the worn item grid row name corresponding to location number in dropdown
 *@param {int} location a value from repeating_item_$X_location
 *@returns {string} name of "worn-space" to set
 */
 getWornItemNameField = function (location) {
   var wornSlot = "";
   if (location > 1 && wornEquipmentRowsPlusCarried[location]) {
     //TAS.debug("getWornItemNameField at location:" + wornEquipmentRowsPlusCarried[location]);
     if (location !== locationMap.Armor && location !== locationMap.Shield) {
       wornSlot = "worn-" + wornEquipmentRowsPlusCarried[location];
     } else if (location === locationMap.Armor) {
       wornSlot = "armor3";
     } else if (location === locationMap.Shield) {
       wornSlot = "shield3";
     }
   }
   return wornSlot;
 },
 /** updateRepeatingItems totals columns
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
 updateRepeatingItems = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   try {
     //TAS.debug("at updateRepeatingItems");
     TAS.repeating('item').attrs('item_total_weight', 'item-total-hp', 'item-total-hp_max', 'item-total-value').fields('item-weight', 'qty', 'qty_max', 'location', 'item-hp', 'item-hp_max', 'value').reduce(function (m, r) {
       try {
         //TAS.debug("in weight add row, variables: weight: "+r.F['item-weight']+", qty:"+r.I.qty+", max:"+r.I.qty_max +", loc:"+ r.I.location);
         if (r.I.qty > 0 && (r.I.location !== locationMap.NotCarried)) {
           if (r.I.qty_max === 0 || r.I.qty_max===1) {
             m['item-weight'] += r.F['item-weight'] * r.I.qty;
           } else {
             m['item-weight'] += r.F['item-weight'];
           }
         }
         m['item-hp'] += r.I['item-hp'];
         m['item-hp_max'] += r.I['item-hp_max'];
         m.value += r.I.value * r.I.qty;
       } catch (errinner) {
         TAS.error("PFInventory.updateRepeatingItems inner error", errinner);
       } finally {
         return m;
       }
     }, {
       'item-weight': 0,
       'item-hp': 0,
       'item-hp_max': 0,
       value: 0
     }, function (m, r, a) {
       a.S['item_total_weight'] = m['item-weight'];
       a.S['item-total-hp'] = m['item-hp'];
       a.S['item-total-hp_max'] = m['item-hp_max'];
       a.S['item-total-value'] = m.value;
     }).execute(done);
   } catch (err) {
     TAS.error("PFInventory.updateRepeatingItems", err);
     done();
   }
 },
 /** updateCarriedCurrency  totals weight for carried currency
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
 updateCarriedCurrency = function (callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getAttrs(["CP", "SP", "GP", "PP", "carried-currency"], function (v) {
     var curr = parseInt(v["carried-currency"], 10) || 0,
     params = {},
     carried = 0;
     try {
       carried = ((parseInt(v["CP"], 10) || 0) + (parseInt(v["SP"], 10) || 0) + (parseInt(v["GP"], 10) || 0) + (parseInt(v["PP"], 10) || 0)) / 50;
       //TAS.debug("curr=" + curr + ", carried=" + carried);
       if (curr !== carried) {
         if (silently) {
           params = PFConst.silentParams;
         }
         setAttrs({
           "carried-currency": carried
         }, params, done);
       } else {
         done();
       }
     } catch (err) {
       TAS.error("PFInventory.updateCarriedCurrency", err);
       done();
     }
   });
 },
 /** updateCarriedTotal- updates the total for carried weight
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
 updateCarriedTotal = function (callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getAttrs(["carried-currency", "item_total_weight", "carried-misc", "carried-total"], function (v) {
     var curr,
     carried,
     params = {};
     try {
       curr = parseFloat(v["carried-total"], 10) || 0;
       carried = ((parseFloat(v["carried-currency"], 10) || 0) * 100 + (parseFloat(v["item_total_weight"], 10) || 0) * 100 + (parseFloat(v["carried-misc"], 10) || 0) * 100) / 100; // Fix bad javascript math
       //TAS.debug("curr=" + curr + ", carried=" + carried);
       if (curr !== carried) {
         setAttrs({
           "carried-total": carried
         }, params, done);
       } else {
         done();
       }
     } catch (err) {
       TAS.error("PFInventory.updateCarriedTotal", err);
       done();
     }
   });
 },
 /** Got rid of the Worn Equipment section, so migrate any values to the Equipment as repeating entries.
 * Worn Armor & Worn Shield are now disabled and controlled by the Equipment section in the Inventory tab.
 *@param {function} callback to call when done
 *@param {bool} silently if true send PFConst.silentParams to setAttrs
 */
 migrateWornEquipment = function (callback) {
   var copyWornEquipmentToNewItem = function (attribList, i, callback) {
     var done = _.once(function () {
       TAS.debug("leaving PFInventory.copyWornEquipmentToNewItem");
       if (typeof callback === "function") {
         callback();
       }
     });
     getAttrs(attribList, function (v) {
       var row
       , newRowId = ''
       , newRowAttrs = {}
       , setters = {}
       , attrib = ""
       , newLocation = 0
       , newEquipType = equipMap.noEquipType
       , j = 0;
       // Migrate the worn equipment entry to equipment if the name is populated
       try {
         row = wornEquipmentRowsOld[i];
         if (v["worn-" + row]) {
           newRowId = generateRowID();
           /* Assign defined worn equipment values to new repeating_item entry */
           newRowAttrs["repeating_item_" + newRowId + "_name"] = v["worn-" + row];
           newRowAttrs["repeating_item_" + newRowId + "_row_id"] = newRowId;
           attrib = v["worn-" + row + "-description"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_short-description"] = attrib;
           }
           attrib = v["worn-" + row + "-charges"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_qty"] = attrib;
             newRowAttrs["repeating_item_" + newRowId + "_qty_max"] = v["worn-" + row + "-charges_max"]||50;
           } else {
             newRowAttrs["repeating_item_" + newRowId + "_qty"] = 1;
             newRowAttrs["repeating_item_" + newRowId + "_qty_max"] = 1;
           }
           attrib = v["worn-" + row + "-weight"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_item-weight"] = attrib;
           }
           attrib = v["worn-" + row + "-hardness"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_hardness"] = attrib;
           }
           attrib = v["worn-" + row + "-hp"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_item-hp"] = attrib;
           }
           attrib = v["worn-" + row + "-hp_max"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_item-hp_max"] = attrib;
           }
           attrib = v["worn-" + row + "-value"];
           if (attrib) {
             newRowAttrs["repeating_item_" + newRowId + "_value"] = attrib;
           }

           newRowAttrs["worn-" + row + "-roll"] = "@{repeating_item_" + newRowId + "_macro-text}";

           // Location
           newLocation = locationMap[row];
           //wornEquipmentRowsPlusCarried.indexOf(row);
           newRowAttrs["repeating_item_" + newRowId + "_location"] = newLocation;
           newRowAttrs["repeating_item_" + newRowId + "_old_location"] = newLocation;
           newEquipType = equipMap.OtherMagic;
           newRowAttrs["repeating_item_" + newRowId + "_equip-type"] = newEquipType;
           newRowAttrs["repeating_item_" + newRowId + "_equiptype-tab"] = newEquipType;
         }
       } catch (err) {
         TAS.error("PFInventory.copyWornEquipmentToNewItem", err);
       } finally {
         //TAS.debug("PFInventory.migrateWornEquipment.copyWornEquipmentToNewItem setting:",newRowAttrs);
         if (_.size(newRowAttrs)>0){
           setAttrs(newRowAttrs, { silent: false }, done);
         } else {
           done();
         }
       }
     });
   },
   // Migrate the armor & worn shield entries to equipment if the name is populated
   //item: value from PFDefense.defenseArmorShieldRowsOld
   copyWornDefenseToNewItem = function (item, callback) {
     var done = _.once(function () {
       TAS.debug("leaving PFInventory.copyWornDefenseToNewItem");
       if (typeof callback === "function") {
         callback();
       }
     }),
     attribList = [item, item + "-type"],
     defenseName = "",
     isArmor = 0,
     isShield = 0;

     //armor or shield?
     if ((/armor/i).test(item)) {
       isArmor = 1;
     } else if ((/shield/i).test(item)) {
       isShield = 1;
     } else {
       done();
       return;
     }
     _.each(PFDefense.defenseArmorShieldColumns, function (column) {
       attribList.push(item + "-" + column);
     });
     //TAS.debug("copyWornDefenseToNewItem attribList=" + attribList);

     // Search for pre-existing matching entry in equipment
     getAttrs([item], function (vi) {
       //TAS.debug("vi[item]=" + vi[item]);
       if (!vi[item]){
         done();
         return;
       }
       defenseName = vi[item];
       getSectionIDs("repeating_item", function (ids) {
         //TAS.debug("ids=" + ids);
         var fields = [];
         fields = _.map(ids, function (memo, id) {
           return "repeating_item_" + id + "_name";
         });
         attribList = attribList.concat(fields);
         getAttrs(attribList, function (v) {
           var prefix, matchingField, newRowId = '', newRowAttrs = {}, locationAttrs={}, attrib = "", isNewRow = true, i=0;
           try {
             matchingField = _.find(fields, function (field) { return defenseName === v[field]; });
             //TAS.debug("matchingField=" + matchingField);
             if (matchingField) {
               isNewRow = false;
               newRowId = SWUtils.getRowId(matchingField);//.replace("repeating_item_", "").replace("_name", "");
             } else {
               newRowId = generateRowID();
             }
             /* Assign defined worn equipment values to new repeating_item entry */
             if (isNewRow) {
               newRowAttrs["repeating_item_" + newRowId + "_name"] = defenseName;
             }
             newRowAttrs["repeating_item_" + newRowId + "_qty"] = 1;
             newRowAttrs["repeating_item_" + newRowId + "_qty_max"] = 1;
             if (v[item + "-equipped"] === "1") {
               if (isArmor) {
                 locationAttrs["repeating_item_" + newRowId + "_location"] = locationMap.Armor;
                 locationAttrs["repeating_item_" + newRowId + "_old_location"] = locationMap.Armor;
                 newRowAttrs["armor3-roll"] = "@{repeating_item_" + newRowId + "_macro-text}";
                 newRowAttrs["armor3"] = v[item];
               } else {
                 locationAttrs["repeating_item_" + newRowId + "_location"] = locationMap.Shield;
                 locationAttrs["repeating_item_" + newRowId + "_old_location"] = locationMap.Shield;
                 newRowAttrs["shield3-roll"] = "@{repeating_item_" + newRowId + "_macro-text}";
                 newRowAttrs["shield3"] = v[item];
               }
             } else {
               newRowAttrs["repeating_item_" + newRowId + "_location"] = locationMap.NotCarried; // not Carried
               newRowAttrs["repeating_item_" + newRowId + "_old_location"] = locationMap.NotCarried;
               // Leave the entry there. The player can manage the entry from inventory and equip it on Defenses tab
             }
             for (i = 1; i < PFDefense.defenseArmorShieldColumns.length; i++) { // i = 1 to skip equipped
               attrib = v[item + "-" + PFDefense.defenseArmorShieldColumns[i]];
               if (attrib) {
                 newRowAttrs["repeating_item_" + newRowId + "_item-" + PFDefense.defenseArmorShieldColumns[i]] = attrib;
               }
             }
             attrib = v[item + "-type"];
             if (attrib) {
               newRowAttrs["repeating_item_" + newRowId + "_item-defense-type"] = attrib;
             }
             newRowAttrs["repeating_item_" + newRowId + "_equip-type"] = equipMap.Armor;
             newRowAttrs["repeating_item_" + newRowId + "_equiptype_tab"] = equipMap.Armor;
           } catch (err) {
             TAS.error("PFInventory.copyWornDefenseToNewItem", err);
           } finally {
             if (_.size(newRowAttrs)>0){
               setAttrs(newRowAttrs,PFConst.silentParams, done);
             } else {
               done();
             }
             if (_.size(locationAttrs)>0){
               setAttrs(locationAttrs);
             }
           }
         });
       });
     });

   },
   doneMigrating = _.once(function () {
     TAS.debug("leaving PFInventory.migrateWornEquipment");
     if (typeof callback === "function") {
       callback();
     }
   });
   //TAS.debug("at PFInventory.migrateWornEquipment ");
   getAttrs(["migrated_worn_equipment"], function (v) {
     var i = 0,
     j = 0,
     attribList = [];
     try {
       //TAS.debug("migrated_worn_equipment=" + v.migrated_worn_equipment);
       if (v.migrated_worn_equipment === "1") {
         doneMigrating();
         return;
       }
       //TAS.debug"Migrating worn equipment...");
       for (i = 0; i < wornEquipmentRowsOld.length; i++) {
         attribList = ["worn-" + wornEquipmentRowsOld[i]];
         for (j = 0; j < wornEquipmentColumns.length; j++) {
           attribList.push("worn-" + wornEquipmentRowsOld[i] + "-" + wornEquipmentColumns[j]);
         }
         attribList.push("worn-" + wornEquipmentRowsOld[i] + "-description");
         attribList.push("worn-" + wornEquipmentRowsOld[i] + "-hardness");
         //TAS.debug("attribList=" + attribList);
         copyWornEquipmentToNewItem(attribList, i);
       }
       _.each(PFDefense.defenseArmorShieldRowsOld, function (itemRow) {
         copyWornDefenseToNewItem(itemRow);
       });
       setAttrs({
         "migrated_worn_equipment": "1"
       }, {}, doneMigrating);
       // Orphaned attributes:
       // worn-equipment-show
       // worn-total-charges
       // worn-total-weight
       // worn-total-hp
       // worn-total-hp_max
       // worn-total-value
       // carried-worn-equipment
       // For each wornEquipmentRowsOld, worn-{row}-{column}, where columns are: "charges", "weight", "hp", "hp_max", "value", "description", "hardness", "roll"
       // For each wornEquipmentRowsOld, worn-{row}
     } catch (err) {
       TAS.error("PFInventory.migrateWornEquipment", err);
       doneMigrating();
     }
   });
 },
 /** updateEquipmentLocation updates a row for repeating item when location dropdown changed.
 * when done set old location to the new location
 * Handle equipment location change
 *@param {string} id id of row updated, or null
 *@param {function} callback to call when done
 *@param {boolean} silently if true call setAttrs with {silent:true}
 *@param {object} eventInfo USED - from event, to get id from sourceAttribute
 */
 updateEquipmentLocation = function (id, callback, silently, eventInfo) {
   var done = _.once(function () {
     TAS.debug("leaving PFInventory.updateEquipmentLocation");
     if (typeof callback === "function") {
       callback();
     }
   }),
   /* unsetOtherItems makes sure any other row than id is not in location */
   unsetOtherItems = function (location, id) {
     if (!id || location < 2 || !location) {
       done();
       return;
     }
     /*
     * The player has now changed the location to a worn slot, so check for other repeating items that have the same
     * slot and set them to 'carried'.
     */
     getSectionIDs("repeating_item", function (idarray) { // get the repeating set
       var attribs = [];
       if (_.size(idarray) <= 1) {
         done();
         return;
       }
       _.each(idarray, function (currentID, i) { // loop through the set
         if (currentID !== id) {
           attribs.push("repeating_item_" + currentID + "_location");
         }
       });
       getAttrs(attribs, function (w) {
         var setter = {};
         _.each(idarray, function (currentID, i) { // loop through the set
           if ((parseInt(w["repeating_item_" + currentID + "_location"], 10) || 0) === location) {
             setter["repeating_item_" + currentID + "_location"] = 0;
             setter["repeating_item_" + currentID + "_old_location"] = 0;
           }
         });
         if (_.size(setter) > 0) {
           setAttrs(setter, { silent: true }, done);
         } else {
           done();
         }
       });
     });
   },
   idStr = PFUtils.getRepeatingIDStr(id),
   item_entry = 'repeating_item_' + idStr,
   realItemID = id || (eventInfo ? (SWUtils.getRowId(eventInfo.sourceAttribute) || "") : ""),
   prefix = 'repeating_item_' + realItemID + "_",
   locationField = prefix + "location",
   nameField = prefix + "name",
   oldLocationField = prefix + "old_location",
   rollField = prefix + "macro-text"
   ;

   try {
     //TAS.debug("updateEquipmentLocation: called for ID "+ realItemID);
     //sample source: repeating_item_-kbkc95wvqw1n4rbgs1c_location
     // note that the source is always lowercase, but the actual ID is both cases
     //check value of 'location' to see if it is being worn; if not check to see if the player is removing it from 'worn'
     //TAS.debug("updateEquipmentLocation source=" + source);
     getAttrs([locationField, oldLocationField, nameField], function (v) {
       var location = 0,
         oldlocation = 0,
         wornItemAttrs = {},
         wornSlot = "",
         itemName = "";
       //TAS.debug("updateEquipmentLocation: ", v);
       try {
         location = parseInt(v[locationField], 10);
         if(!isNaN(location)){
           oldlocation = parseInt(v[oldLocationField], 10) ;
           if (isNaN(oldlocation)){
             oldlocation=location;
           }
           wornItemAttrs[oldLocationField] = location;
           if (location ===  locationMap.Carried && oldlocation !== locationMap.NotCarried && oldlocation !== location) {
               wornSlot = getWornItemNameField(oldlocation);
               if (wornSlot) {
                 wornItemAttrs[wornSlot] = "";
                 wornItemAttrs[wornSlot + "-roll"] = "";
               }
           } else if (location > locationMap.NotCarried) {
             wornSlot = getWornItemNameField(location);
             if (wornSlot) {
               itemName = v[nameField] || "";
               if (itemName){
                 wornItemAttrs[wornSlot] = itemName;
               } else {
                 wornItemAttrs[wornSlot] = "Row "+ realItemID;
               }
               wornItemAttrs[wornSlot + "-roll"] = "@{" + rollField + "}";
             }
             if (oldlocation > 1 && oldlocation !== location) {
               wornSlot = getWornItemNameField(oldlocation);
               if (wornSlot) {
                 wornItemAttrs[wornSlot] = "";
                 wornItemAttrs[wornSlot + "-roll"] = "";
               }
             }
           }
         }
       } catch (err2) {
         TAS.error("updateEquipmentLocation update location error:", err2);
       } finally {
         if (_.size(wornItemAttrs) > 0) {
           //TAS.debug("updateEquipmentLocation, setting slot ", wornItemAttrs);
           setAttrs(wornItemAttrs, { silent: true }, function () {
             if (location > locationMap.NotCarried){
               unsetOtherItems(location, id);
             }
           });
         } else {
           done();
         }
       }
     });
   } catch (err) {
     TAS.error("PFInventory.updateEquipmentLocation", err);
   }
 },
 /** replace the values on the Defenses tab in disabled fields with this row's values
 * from the equipment. Some fields like Armor Bonus, ACP, and Max Dex are not available in the equipment, so they
 * will need to be edited manually after making this change.
 *@param {int} location the value of location attribute in repeating_item
 *@param {string} sourceAttribute eventInfo sourceAttribute of change user made that called this
 *@param {function} callback call when done
 */
 updateWornArmorAndShield = function (location, sourceAttribute, callback) {
   var done = _.once(function () {
     TAS.debug("leaving PFInventory.updateWornArmorAndShield");
     if (typeof callback === "function") {
       callback();
     }
   })
   , defenseItem = ""
   , attribUpdated = ""
   , itemFullPrefix = ""
   , attribList = []
   , id =""
   , item_entry=""
   , itemFields = ["item-acbonus","item-acenhance","item-max-dex","item-acp","item-spell-fail","item-defense-type","item-proficiency",
     "name","set-as-armor","set-as-shield","location","old_location","equip-type","acenhance"];
   try {
     attribUpdated = SWUtils.getAttributeName(sourceAttribute);
     id = SWUtils.getRowId(sourceAttribute);
     item_entry = "repeating_item_" + id + "_";
     if (item_entry.slice(-1) !== "_") {
       item_entry += "_";
     }
     itemFullPrefix = item_entry + "item-";
     defenseItem = (location === locationMap.Armor ? "armor3" : "shield3");
     //TAS.debug"at update worn armor, defenseItem=" + defenseItem);

     attribList =_.map(itemFields,function(attr){
       return item_entry + attr;
     });

     attribList = _.reduce(PFDefense.defenseArmorShieldColumns, function (memo, col) {
       memo.push(defenseItem + "-" + col);
       return memo;
     }, attribList);

     attribList.push(defenseItem);

     //TAS.debug("PFInventory.updateWornArmorAndShield fields ", attribList);
   } catch (err) {
     TAS.error("PFInventory.updateWornArmorAndShield error before getattrs", err);
     done();
     return;
   }
   //TAS.debug("attribList=" + attribList);
   getAttrs(attribList, function (w) {
     var i=0, setter={}, silentSetter={}, equipType=0,actualLocation=0, attrib="";
     try {
       //if we are setting new, or updating an item in the location, or updating an item in a diffrent location
       //so we can set a new ring of shield, but not update it. but we can update armor and shields.
       if (attribUpdated==='set-as-armor' || attribUpdated==='set-as-shield' || location === locationMap.Armor || location === locationMap.Shield  ) {
         //TAS.debug("updateWornArmorAndShield ", w);
         for (i = 0; i < PFDefense.defenseArmorShieldColumns.length; i++) {
           if (PFDefense.defenseArmorShieldColumns[i] !== "max-dex" &&
               PFDefense.defenseArmorShieldColumns[i] !== "equipped" &&
               PFDefense.defenseArmorShieldColumns[i] !== "type" &&
               PFDefense.defenseArmorShieldColumns[i] !== "enhance" ) {
             attrib = parseInt(w[itemFullPrefix + PFDefense.defenseArmorShieldColumns[i]], 10) || 0;
             if (parseInt(w[defenseItem + "-" + PFDefense.defenseArmorShieldColumns[i]], 10) !== attrib) {
               setter[defenseItem + "-" + PFDefense.defenseArmorShieldColumns[i]] = attrib;
             }
           }
         }
         attrib = w[item_entry + "name"];
         if (attrib) {
           if (w[defenseItem] !== attrib) {
             setter[defenseItem] = attrib;
           }
         } else {
           setter[defenseItem] = "";
         }
         attrib = w[itemFullPrefix + "acenhance"];
         if (attrib){
           setter[defenseItem + "-enhance"] = attrib;
         }

         attrib = w[itemFullPrefix + "defense-type"];
         if (attrib) {
           if (defenseItem === "shield3" && attrib === "Medium") {
             //invalid choice, prob meant heavy shield
             attrib = "Heavy";
           } else if (defenseItem === "armor3" && attrib === "Tower Shield") {
             //invalid
             attrib = "Heavy";
           }
           if (w[defenseItem + "-type"] !== attrib) {
             setter[defenseItem + "-type"] = attrib;
           }
         }
         attrib = parseInt(w[itemFullPrefix + "max-dex"], 10);
         if (w[itemFullPrefix + "max-dex"] === "-" || isNaN(attrib)) {
           setter[defenseItem + "-max-dex"] = "-";
         } else {
           setter[defenseItem + "-max-dex"] = attrib;
         }
         if (w[defenseItem + "-equipped"] !== "1") {
           setter[defenseItem + "-equipped"] = 1;
         }

         //reset the buttons silently so we don't loop.
         attrib = parseInt(w[item_entry + "set-as-armor"], 10);
         if (attrib) {
           silentSetter[item_entry + "set-as-armor"] = "0";
         }
         attrib = parseInt(w[item_entry + "set-as-shield"], 10);
         if (attrib) {
           silentSetter[item_entry + "set-as-shield"] = "0";
         }
         //if we hit "set as armor or shield" on a peice of armor / shield equipment, make sure to slot it.
         //do it silently so we don't loop
         equipType = parseInt(w[item_entry + "equip-type"],10);
         actualLocation= parseInt(w[item_entry+"location"],10);
         if ((!isNaN(equipType)) && actualLocation!== locationMap.Armor && actualLocation !== locationMap.Shield && equipType === equipMap.Armor &&
           (attribUpdated==='set-as-armor' || attribUpdated==='set-as-shield')  ){
             silentSetter[item_entry + "old_location"] = actualLocation;
             silentSetter[item_entry+"location"] = location;
         }
       } else {
         TAS.warning("no reason to update armor or shield for " + sourceAttribute + " in location " + wornEquipmentRowsPlusCarried[location]);
       }
     } catch (errinner) {
       TAS.error("PFInventory.updateWornArmorAndShield INNER error", errinner);
     } finally {
       if (_.size(silentSetter)>0){
         setAttrs(silentSetter,PFConst.silentParams,function(){
           if (actualLocation !== location){
             updateEquipmentLocation(id,null,true,null);
           }
         });
       }
       if (_.size(setter) > 0) {
         //TAS.debug("updating defenses tab for " + defenseItem, setter);
         setAttrs(setter, {}, done);
       } else {
         done();
       }
     }
   });
 },
 /**  calls updateEquipmentLocation for all items
 */
 updateLocations = function(){
   getSectionIDs('repeating_item',function(ids){
     _.each(ids,function(id){
       updateEquipmentLocation(id,null,null,null);
     });
   });
 },
 /** Triggered from a button in repeating_items, it will create a repeating attack entry from the item entry
 * @param {string} source the eventItem.sourceAttribute
 * @param {string} weaponId if the row already exists, overwrite all fields but 'name'
 */
 createAttackEntryFromRow = function (source, callback, silently, weaponId) {
   var done = _.once(function () {
     //TAS.debug("leaving PFInventory.createAttackEntryFromRow");
     if (typeof callback === "function") {
       callback();
     }
   })
   , attribList = []
   , itemId = SWUtils.getRowId(source)
   , idStr = PFUtils.getRepeatingIDStr(itemId)
   , item_entry = 'repeating_item_' + idStr;

   //TAS.debug("PFInventory.createAttackEntryFromRow: item_entry=" + item_entry + " , weapon:"+weaponId);
   attribList.push(item_entry + "name");
   commonLinkedAttributes.forEach(function (attr) {
     attribList.push(item_entry + "item-" + attr);
   });
   attribList.push(item_entry + "item-wpenhance");
   attribList.push(item_entry + "item-dmg-type");
   attribList.push(item_entry + "default_size");
   //TAS.debug("attribList=" + attribList);
   getAttrs(attribList, function (v) {
     var newRowId
     , setter = {}
     , silentSetter={}
     , enhance = 0
     , prof = 0
     , params = silently?PFUtils.silentParams:{};
     try {
       //TAS.debug("weaponId is :"+weaponId);
       if (!weaponId){
         newRowId = generateRowID();
       } else {
         newRowId = weaponId;
       }
       //TAS.debug("the new row id is: "+newRowId);
       //TAS.debug("v[" + item_entry + "name]=" + v[item_entry + "name"]);
       if (v[item_entry + "name"]) {
         if (!weaponId){
           setter["repeating_weapon_" + newRowId + "_name"] = v[item_entry + "name"];
         }
         silentSetter["repeating_weapon_" + newRowId + "_source-item-name"] = v[item_entry + "name"];
       }
       commonLinkedAttributes.forEach(function (attr) {
         //TAS.debug("v[" + item_entry + "item-" + attr + "]=" + v[item_entry + "item-" + attr]);
         if (v[item_entry + "item-" + attr]) {
           setter["repeating_weapon_" + newRowId + "_" + attr] = v[item_entry + "item-" + attr];
         }
       });
       if ( (/melee/i).test(v[item_entry + "item-attack_type"])) {
         setter["repeating_weapon_" + newRowId + "_damage-ability"] = "@{STR-mod}";
       }
       enhance = parseInt(v[item_entry + "item-wpenhance"],10)||0;
       if(enhance){
         setter["repeating_weapon_" + newRowId + "_enhance"] = enhance;
       }
       //TAS.debug("v[" + item_entry + "item-defense-type]=" + v[item_entry + "item-defense-type"]);
       if (v[item_entry + "item-dmg-type"]) {
         setter["repeating_weapon_" + newRowId + "_type"] = v[item_entry + "item-dmg-type"];
       }
       //TAS.debug("v[" + item_entry + "item-proficiency]=" + v[item_entry + "item-proficiency"]);
       prof = parseInt(v[item_entry + "item-proficiency"], 10) || 0;
       if (prof !== 0) {
         prof = -4;
         setter["repeating_weapon_" + newRowId + "_proficiency"] = prof;
       }
       if (v[item_entry + "default_size"]) {
         setter["repeating_weapon_" + newRowId + "_default_size"] = v[item_entry + "default_size"];
       }
       setter["repeating_weapon_" + newRowId + "_default_damage-dice-num"] = v[item_entry + "damage-dice-num"]||0;
       setter["repeating_weapon_" + newRowId + "_default_damage-die"] = v[item_entry + "damage-die"]||0;
       silentSetter["repeating_weapon_" + newRowId + "_source-item"] = itemId;
       //TAS.debug("creating new attack", setter);
     } catch (err) {
       TAS.error("PFInventory.createAttackEntryFromRow", err);
     } finally {
       if (_.size(setter)>0){
         setter[item_entry + "create-attack-entry"] = 0;
         setAttrs(setter, params, function(){
           //can do these in parallel
           PFAttackOptions.resetOption(newRowId);
           PFAttackGrid.resetCommandMacro();
           done();
         });
         if (_.size(silentSetter)){
           setAttrs(silentSetter,PFConst.silentParams);
         }
       } else {
         setter[item_entry + "create-attack-entry"] = 0;
         setAttrs(setter,PFConst.silentParams,done);
       }
     }
   });
 },
 updateAssociatedAttack = function (source, callback) {
   var done = _.once(function () {
     TAS.debug("leaving PFInventory.updateAssociatedAttack");
     if (typeof callback === "function") {
       callback();
     }
   })
   , attrib = "", weaponAttrib = "", sourceVal = "", itemId = "", sectionName = ""
   , fields = [], setter = {}, attribList = [];
   try {
     if (!source) {
       done();
       return;
     }
     itemId = SWUtils.getRowId(source);
     attrib = SWUtils.getAttributeName(source);
     //TAS.debug("attrib=" + attrib);
     if (source.indexOf("repeating_weapon_") === 0) {
       // source is an attack, so pull all data from the source (item/spell/spell-like ability) to update the attack
       // attrib will be source-item, source-spell, or source-ability
       TAS.error("PFInventory.updateAssociatedAttack, called on weapon event, no longer supported!");
       done();
       return;
     }
     // source is an item, so update all linked attacks with the changed attribute
     weaponAttrib = attrib.replace("item-", "");
     if (attrib === 'name') { weaponAttrib = 'source-item-name'; }
     else if (attrib === 'item-dmg-type') { weaponAttrib = 'type'; }
     else if (attrib === 'wpenhance') {weaponAttrib = 'enhance'; }
   } catch (outererror1) {
     TAS.error("PFInventory.updateAssociatedAttack outer1", outererror1);
     done();
     return;
   }
   getAttrs([source], function (srcv) {
     var sourceAttr='';
     sourceVal = srcv[source];
     if (typeof sourceVal === "undefined"){
       sourceVal = "";
     }
     //TAS.debug"sourceVal=" + sourceVal);
     if (attrib === "proficiency") {
       sourceVal = parseInt(sourceVal, 10) || 0;
       if (sourceVal !== 0) {
         sourceVal = -4;
       }
     }
     sourceVal = String(sourceVal);
     //TAS.debug("itemId=" + itemId, "attrib=" + attrib, "weaponAttrib=" + weaponAttrib);
     getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
       fields = _.reduce(idarray, function (memo, currentID) {
         memo = memo.concat(["repeating_weapon_" + currentID + "_source-item", "repeating_weapon_" + currentID + "_" + weaponAttrib]);
         return memo;
       }, []);
       //TAS.debug("processing currentID=" + currentID);
       getAttrs(fields, function (w) {
         setter = {}; // start with a blank in this loop
         try {
           //TAS.debug"PFInventory.updateAssociatedAttack ", w);
           _.each(idarray, function (currentID) { // loop through the set
             var targetVal = "", wField = ""; // start with blank in this loop
             //TAS.debug("source=" + source, "v[repeating_weapon_" + currentID + "_source-item]=" + v["repeating_weapon_" + currentID + "_source-item"]);
             //TAS.debug("itemId=" + itemId)
             //TAS.debug"comparing " + itemId + " with " + w["repeating_weapon_" + currentID + "_source-item"]);
             if (itemId === w["repeating_weapon_" + currentID + "_source-item"]) {
               wField = "repeating_weapon_" + currentID + "_" + weaponAttrib;
               targetVal = w[wField];
               if (attrib === "proficiency" ) {
                 targetVal = parseInt(targetVal, 10) || 0;
               }
               targetVal= String(targetVal);
               if (targetVal !== sourceVal) {
                 setter[wField] = sourceVal;
                 if (sourceAttr === 'damage-die' || sourceAttr === 'damage-dice-num'){
                   setter["repeating_weapon_" + currentID + "_default_"+ sourceAttr]=sourceVal;
                 }
               }
             }
           });
         } catch (innererror) {
           TAS.error("PFInventory.updateAssociatedAttack inner1", innererror);
         } finally {
           if (_.size(setter) > 0) {
             //TAS.debug"updating attack", setter);
             setAttrs(setter);
           }
         }
       });
     });
   });
 },
 /** Determines the equipment type from looking at the name.
 * DOES NOT WORK for armor or weapons, this is for after you have already determined it is not an armor or weapon type.
 *@param {string} name the name field
 */
 getEquipmentTypeFromName = function(name){
   var tempstr, currType=equipMap.noEquipType, matches;
   if(!name){return currType;}
   tempstr=name.toLowerCase();
   matches=tempstr.match(/(?:\bwand\b|\bring\b|\brod\b|potion|spellbook|smokestick|incense|scroll|alchemist|antitoxin|antidote|elixir|staff|acid|\boil\b|water|component pouch|arrow|bolt|bullet|sunrod|flask|ration|armor spike|kit|saddle|tool|spike|pole|ladder|lantern|candle|torch|rope|chain|crowbar|\bnet\b|\bram\b|tanglefoot|tinder|flint|vial)/i);
   if (matches){
     switch (matches[0]){
       case 'armor spike':
       case 'net':
         currType=equipMap.Weapon;
         break;
       case 'vial':
       case 'flint':
       case 'kit':
       case 'tool':
       case 'spike':
       case 'crowbar':
       case 'ram':
       case 'lantern':
       case 'candle':
       case 'torch':
       case 'rope':
       case 'chain':
       case 'saddle':
       case 'spyglass':
       case 'spellbook':
       case 'tinder':
       case 'component pouch':
         currType=equipMap.Gear;
         break;
       case 'ring':
         currType=equipMap.OtherMagic;
         break;
       case 'tanglefoot':
       case 'incense':
       case 'smokestick':
       case 'sunrod':
       case 'ration':
       case 'water':
       case 'alchemist':
       case 'oil':
       case 'flask':
       case 'acid':
       case 'rod':
       case 'wand':
       case 'potion':
       case 'elixir':
       case 'scroll':
       case 'staff':
       case 'antitoxin':
       case 'antidote':
         currType=equipMap.Consumables;
         break;
       case 'arrow':
       case 'bolt':
       case 'bullet':
       case 'stone':
         currType=equipMap.Ammo;
         break;
     }
   }
   return currType;
 },
 importFromCompendium = function(eventInfo){
   var id=SWUtils.getRowId(eventInfo.sourceAttribute),
   prefix='repeating_item_'+id+'_',
   itemprefix = prefix+'item-',
   fields=['default_char_size','equipment_tab',
     itemprefix+'category_compendium',
     itemprefix+'value_compendium',
     itemprefix+'range_compendium',
     itemprefix+'critical_compendium',
     itemprefix+'smalldamage_compendium',
     itemprefix+'meddamage_compendium',
     itemprefix+'specialtype_compendium',
     itemprefix+'speed20_compendium',
     itemprefix+'speed30_compendium',
     itemprefix+'weight_compendium',
     itemprefix+'spell-fail_compendium',
     itemprefix+'acbonus_compendium',
     itemprefix+'acp_compendium',
     itemprefix+'dmg-type',
     prefix+'description',
     itemprefix+'max-dex',
     prefix+'name'];
   TAS.debug('at importFromCompendium getting fields', fields);
   getAttrs(fields,function(v){
     var setter={},size=0,tempInt=0,temp,name,matches,attr='',tempstr='',
       isWeapon=0,isArmor=0,isOther=0,currTab=99,currType=equipMap.noEquipType,
       speed30=0,speed20=0;
     try {
       //TAS.debug("importFromCompendium values are",v);
       if (v[itemprefix+'category_compendium']!=='Items'){
         TAS.warn("compendium item is " +v['repeating_item_item-category_compendium'] + ', INVALID' );
         return;
       }
       setter[prefix+'row_id']=id;
       name= v[prefix+'name'];
       PFUtils.getCompendiumIntSet(itemprefix,'range',v,setter);
       PFUtils.getCompendiumFunctionSet(itemprefix,'value',PFUtils.getCostInGP,v,setter);
       PFUtils.getCompendiumIntSet(itemprefix,'spell-fail',v,setter);
       PFUtils.getCompendiumIntSet(itemprefix,'acbonus',v,setter);
       PFUtils.getCompendiumIntSet(itemprefix,'acp',v,setter);
       if(v[itemprefix+'acbonus_compendium']){
         isArmor=1;
       }

       speed30 = parseInt(v[itemprefix+'speed20_compendium'],10)||0;
       speed20 = parseInt(v[itemprefix+'speed30_compendium'],10)||0;

       if (v[itemprefix+'max-dex']){
         temp=v[itemprefix+'max-dex'];
         temp=temp.replace(/\u2013|\u2014|-|\\u2013|\\u2014/,'-');
         if (temp!==v[itemprefix+'max-dex']){
           setter[itemprefix+'max-dex']=temp;
         }
       }
       if (v[itemprefix+'specialtype_compendium']){
         temp = v[itemprefix+'specialtype_compendium'];
         temp=temp.replace(/\u2013|\u2014|-|\\u2013|\\u2014/,'');
         if (temp){
           if(v[itemprefix+'item-dmg-type']){
             temp = v[itemprefix+'item-dmg-type'] + ' ' + v[itemprefix+'specialtype_compendium'];
           } else {
             temp = v[itemprefix+'specialtype_compendium'];
           }
           setter[itemprefix+'item-dmg-type']=temp;
         }
       }
       if(v[itemprefix+'critical_compendium']){
         isWeapon=1;
         temp = PFUtils.getCritFromString(v[itemprefix+'critical_compendium']);
         if(temp){
           if(temp.crit!==20){
             setter[itemprefix+'crit-target']=temp.crit;
           }
           if(temp.critmult!==2){
             setter[itemprefix+'crit-multiplier']=temp.critmult;
           }
         }
       }
       size=parseInt(v['default_char_size'],10)||0;
       tempstr='meddamage_compendium';
       tempInt=0;
       if (size>=1){
         tempInt=1;
         tempstr='smalldamage_compendium';
       }
       if (size !== 0){
         //set  default size of item to small or medium, not other, let user do that for now
         setter[prefix+'default_size']=tempInt;
       }
       PFUtils.getCompendiumIntSet(itemprefix,'weight',v,setter);
       //small size, weight is 1/2
       if(size >= 1){
         tempInt=parseInt(setter[itemprefix+'weight'],10)||0;
         if (tempInt){
           tempInt = (tempInt / 2)*100/100;
           setter[itemprefix+'weight']=tempInt;
         }
       }
       if (v[itemprefix+tempstr]){
         isWeapon=1;
         temp = PFUtils.getDiceDieFromString(v[itemprefix+tempstr]);
         if (temp){
           if (temp.dice && temp.die){
             setter[itemprefix+'damage-dice-num']=temp.dice;
             setter[itemprefix+'damage-die']=temp.die;
           }
           if (temp.plus){
             setter[itemprefix+'damage']=temp.plus;
           }
         }
       }

       if (isWeapon){
         currType=equipMap.Weapon;
         if(v[itemprefix+'range_compendium']&& parseInt(v[itemprefix+'range_compendium'],10)>0){
           setter[itemprefix+'attack-type']='@{attk-ranged}';
         } else {
           setter[itemprefix+'attack-type']='@{attk-melee}';
         }
       } else if (isArmor){
         currType=equipMap.Armor;
         //set encumbrance
         //mUST LOOK AT name string and determine armor, then set heavy, medium, or light.
         //for shields it is easy
         //we can probably look at the change in speed to determine this.
         if (name) {
           if ((/tower/i).test(name)){
             tempstr="Tower Shield";
           } else if (speed30===30 && speed20 === 20){
             tempstr="Light";
           } else if ((/heavy|stone|full|half.plate|splint|banded|iron|tatami|kusari/i).test(tempstr)){
             tempstr="Heavy";
           } else if ((/medium|mountain|chainmail|breastplate|scale|kikko|steel|horn|mirror|hide|maru|armored coat/i).test(tempstr)){
             tempstr="Medium";
           } else {
             tempstr="Light";
           }
           setter[itemprefix+"defense-type"]=tempstr;
         }

       } else  {
         currType=getEquipmentTypeFromName(name);
       }
       if (currType<0){
         currType=equipMap.Other;
       } else if (currType===equipMap.Weapon){
         setter[prefix+'weapon-attributes-show']=1;
       } else if (currType===equipMap.Armor){
         setter[prefix+'armor-attributes-show']=1;
       }
       //it just ignores it! why!? so don't change tab cause it won't be on the new tab.
       if(currType){setter['equipment_tab']=currType;}
       setter[prefix+'equip-type']=currType;
       setter[prefix+'equiptype-tab']=currType;
       setter[prefix+'qty']=1;
       setter[prefix+'qty_max']=1;
       setter[prefix+'location']=0;
       setter[prefix+'old_location']=0;

       setter[itemprefix+'category_compendium']="";
       setter[itemprefix+'value_compendium']="";
       setter[itemprefix+'range_compendium']="";
       setter[itemprefix+'critical_compendium']="";
       setter[itemprefix+'smalldamage_compendium']="";
       setter[itemprefix+'meddamage_compendium']="";
       setter[itemprefix+'specialtype_compendium']="";
       setter[itemprefix+'speed20_compendium']="";
       setter[itemprefix+'speed30_compendium']="";
       setter[itemprefix+'weight_compendium']="";
       setter[itemprefix+'spell-fail_compendium']="";
       setter[itemprefix+'acbonus_compendium']="";
       setter[itemprefix+'acp_compendium']="";


     } catch (err){
       TAS.error("importFromCompendium",err);
     } finally {
       //TAS.debug"importFromCompendium setting",setter);
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams, updateRepeatingItems);
       }
     }
   });
 },
 setNewDefaults = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFInventory.setNewDefaults");
     if(typeof callback === "function"){
       callback();
     }
   });
   //TAS.debug("at PFInventory.setNewDefaults");
   getAttrs(['migrated_itemlist_defaults'],function(v){
     //TAS.debug("PFInventory.setNewDefaults ",v);
     if(parseInt(v.migrated_itemlist_defaults,10)===1){
       done();
       return;
     }
     getSectionIDs('repeating_item',function(ids){
       var fields=[];
       if (!ids || !_.size(ids)){
         done();
         return;
       }

       fields = _.map(ids,function(id){
         return 'repeating_item_'+id+'_name';
       });
       getAttrs(fields,function(v){
         var setter={};
         try {
           setter = _.reduce(ids,function(m,id){
             var prefix = 'repeating_item_'+id+'_',
             nameField=prefix+'name',guess=0;
             try {
               if(v[nameField]){
                 guess=getEquipmentTypeFromName(v[nameField]);
               }
               if (guess){
                 m[prefix+'equip-type']=guess;
                 m[prefix+'equiptype-tab']=guess;
               } else {
                 m[prefix+'equip-type']=equipMap.noEquipType;
                 m[prefix+'equiptype-tab']=equipMap.noEquipType;
               }
               m[prefix+'showinmenu']=0;
             } catch (errin){
               TAS.error("PFInventory.setNewDefaults error repeating_item  id "+id,errin);
             } finally {
               return m;
             }
           },{});
           setter['migrated_itemlist_defaults']=1;
         } catch (err){
           TAS.error("PFInventory.setNewDefaults error setting defaults ",err);
         } finally {
           if (_.size(setter)>0){
             setAttrs(setter,PFConst.silentParams,done);
           } else {
             done();
           }
         }
       });
     });
   });
 },
 migrate = function (callback, oldversion) {
   PFMigrate.migrateRepeatingItemAttributes(function(){
     setNewDefaults(function(){
       migrateWornEquipment(callback);
     });
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFInventory.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   setTotals = _.after(2, function () {
     updateLocations();
     resetCommandMacro();
     updateCarriedTotal(done);
   });
   try {
     TAS.debug("at PFInventory.recalculate");
     migrate(function(){
       updateCarriedCurrency(setTotals, silently);
       updateRepeatingItems(setTotals, silently);
     });
   } catch (err) {
     TAS.error("PFInventory.recalculate", err);
     done();
   }
 },
 registerEventHandlers = function () {
   var tempstr="";
   on('change:repeating_item:item-category_compendium', TAS.callback(function EventItemCompendium(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       importFromCompendium(eventInfo);
     }
   }));

   on('change:repeating_item:location', TAS.callback(function eventUpdateItemLocation(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateEquipmentLocation(null,null,null,eventInfo);
     }
   }));
   on('change:repeating_item:item-weight change:repeating_item:qty change:repeating_item:qty_max change:repeating_item:location', TAS.callback(function eventUpdateItemTotalWeight(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       getAttrs(['repeating_item_location','repeating_item_old_location','repeating_item_item-weight','repeating_item_qty'],function(v){
         var newloc = parseInt(v.repeating_item_location,10)||0,
         oldloc = parseInt(v.repeating_item_old_location,10)||0;
           TAS.repeating('item').attrs('item_total_weight').fields('item-weight', 'qty', 'qty_max', 'location').reduce(function (m, r) {
             //TAS.debug"in weight add row, variables: weight: "+r.F['item-weight']+", qty:"+r.I.qty+", max:"+r.I.qty_max +", loc:"+ r.I.location);
             if (r.I.qty > 0 && (r.I.location !== locationMap.NotCarried)) {
               //TAS.debug("adding "+r.F['item-weight']);
               if (r.I.qty_max === 0 || r.I.qty_max===1) {
                 m['item-weight'] += r.F['item-weight'] * r.I.qty;
               } else {
                 m['item-weight'] += r.F['item-weight'];
               }
             }
             return m;
           }, {
             'item-weight': 0
           }, function (m, r, a) {
             a.S['item_total_weight'] = m['item-weight'];
           }).execute();
       });
     }
   }));
   on('change:repeating_item:item-hp change:repeating_item:item-hp_max', TAS.callback(function eventUpdateItemTotalHp(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     TAS.repeating('item').attrs('item-total-hp', 'item-total-hp_max').fields('item-hp', 'item-hp_max').reduce(function (m, r) {
       m['item-hp'] += r.I['item-hp'];
       m['item-hp_max'] += r.I['item-hp_max'];
       return m;
     }, {
       'item-hp': 0,
       'item-hp_max': 0
     }, function (m, r, a) {
       a.S['item-total-hp'] = m['item-hp'];
       a.S['item-total-hp_max'] = m['item-hp_max'];
     }).execute();
   }));
   on('change:repeating_item:value', TAS.callback(function eventUpdateItemTotalValue(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     TAS.repeating('item').attrs('item-total-value').fields('value', 'qty').reduce(function (m, r) {
       m.value += r.I.value * r.I.qty;
       return m;
     }, {
       value: 0
     }, function (m, r, a) {
       a.S['item-total-value'] = m.value;
     }).execute();
   }));
   on('remove:repeating_item', TAS.callback(function eventRemoveItem(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateRepeatingItems();
     }
     // Find matching source-item in repeating_weapon then clear the source-item and source-item-name attributes for each
     var setter = {}, itemId = eventInfo.sourceAttribute.replace("repeating_item_", "");
     getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
       _.each(idarray, function (currentID) { // loop through the set
         getAttrs(["repeating_weapon_" + currentID + "_source-item"], function (v) {
           if (itemId === v["repeating_weapon_" + currentID + "_source-item"]) {
             setter["repeating_weapon_" + currentID + "_source-item"] = "";
             setter["repeating_weapon_" + currentID + "_source-item-name"] = "";
             //TAS.debug"clearing source-item for attack entry " + currentID, setter);
             setAttrs(setter, PFConst.silentParams);
           }
         });
       });
     });
   }));
   on('change:CP change:SP change:GP change:PP', TAS.callback(function eventUpdateCarriedCurrency(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateCarriedCurrency();
   }));
   on('change:carried-currency change:item_total_weight change:carried-misc', TAS.callback(function eventUpdateCarriedTotal(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateCarriedTotal();
   }));
   //change item worn in shield or armor location
   on('change:repeating_item:location change:repeating_item:item-defense-type change:repeating_item:item-acbonus change:repeating_item:item-max-dex change:repeating_item:item-acp change:repeating_item:item-spell-fail change:repeating_item:item-proficiency change:repeating_item:acenhance',
     TAS.callback(function eventUpdateWornArmorAndShield(eventInfo) {
       var location = 0;
       TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
       getAttrs(["repeating_item_location"], function (v) {
         var location = parseInt(v["repeating_item_location"], 10) || 0;
         if (location === locationMap.Armor || location === locationMap.Shield){
           updateWornArmorAndShield(location, eventInfo.sourceAttribute);
         }
       });
   }));
   _.each(commonLinkedAttributes, function (fieldToWatch) {
     var eventToWatch = "change:repeating_item:item-" + fieldToWatch;
     on(eventToWatch, TAS.callback(function eventupdateAssociatedAttackLoop(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         updateAssociatedAttack(eventInfo.sourceAttribute);
       }
     }));
   });
   on('change:repeating_item:name change:repeating_item:item-dmg-type change:repeating_item:item-proficiency change:repeating_item:default_size change:repeating_item:wpenhance',
     TAS.callback(function eventupdateAssociatedAttack(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateAssociatedAttack(eventInfo.sourceAttribute);
     }
   }));
   on("change:repeating_item:create-attack-entry", TAS.callback(function eventcreateAttackEntryFromRow(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       createAttackEntryFromRow(eventInfo.sourceAttribute);
     }
   }));
   on("change:repeating_item:set-as-armor", TAS.callback(function eventcreateArmorEntryFromRow(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateWornArmorAndShield(locationMap.Armor, eventInfo.sourceAttribute,null );
     }
   }));
   on("change:repeating_item:set-as-shield", TAS.callback(function eventcreateShieldEntryFromRow(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateWornArmorAndShield(locationMap.Shield, eventInfo.sourceAttribute,null );
     }
   }));
   on("change:repeating_item:showinmenu", TAS.callback(function eventShowItemInMenu(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       resetCommandMacro(eventInfo );
     }
   }));
   on("change:repeating_item:equip-type", TAS.callback(function eventItemEquipTypeChange(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       getAttrs(['repeating_item_equip-type','repeating_item_equiptype-tab'],function(v){
         var newtype=parseInt(v['repeating_item_equip-type'],10)||0,
         oldtype=parseInt(v['repeating_item_equiptype-tab'],10)||0;
         if (newtype !== oldtype){
           setAttrs({'repeating_item_equiptype-tab':newtype},PFConst.silentParams);
         }
       });
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFInventory module loaded      ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate: migrate,
   recalculate: recalculate,
   createAttackEntryFromRow: createAttackEntryFromRow,
   resetCommandMacro: resetCommandMacro,
   setNewDefaults: setNewDefaults,
   wornEquipmentRowsOld: wornEquipmentRowsOld,
   updateLocations: updateLocations,
   wornEquipmentRowsNew: wornEquipmentRowsNew,
   wornEquipmentColumns: wornEquipmentColumns,
   commonLinkedAttributes: commonLinkedAttributes,
   updateRepeatingItems: updateRepeatingItems,
   updateCarriedCurrency: updateCarriedCurrency,
   updateCarriedTotal: updateCarriedTotal,
   migrateWornEquipment: migrateWornEquipment,
   updateWornArmorAndShield: updateWornArmorAndShield,
   updateEquipmentLocation: updateEquipmentLocation,
   updateAssociatedAttack: updateAssociatedAttack
 };
}());
var PFSpellOptions = PFSpellOptions || (function () {
 'use strict';
 var optionToggles = ["toggle_spell_school_notes", "toggle_spell_casting_time_notes", "toggle_spell_duration_notes",
   "toggle_spell_saving_throw_notes", "toggle_spell_sr_notes", "toggle_spell_range_notes", "toggle_spell_targets_notes",
   "toggle_spell_description_notes", "toggle_spell_concentration_notes", "toggle_spell_concentration_check",
   "toggle_spell_casterlevel_notes", "toggle_spell_casterlevel_check", "toggle_spell_level_notes", "toggle_spell_components_notes",
   "toggle_spell_spellnotes_notes", "toggle_spell_spell_fail_check", "toggle_spell_damage_notes"],
 optionTemplates = {
   school: "{{school=REPLACE}}",
   casting_time: "{{casting_time=REPLACE}}",
   components: "{{components=REPLACE}}",
   duration: "{{duration=REPLACE}}",
   saving_throw: "{{saving_throw=REPLACE}}",
   sr: "{{sr=REPLACE}}",
   casterlevel: "{{casterlevel=[[ REPLACE ]]}}",
   range: "{{range=REPLACE}}",
   targets: "{{targets=REPLACE}}",
   Concentration: "{{Concentration=[[ REPLACE ]]}}",
   description: "{{description=REPLACE}}",
   dc: "{{dc=[[ REPLACE ]]}}",
   spellPen: "{{spellPen=[[ REPLACE ]]}}",
   range_pick: "{{REPLACE=Range_pick}}",
   rangetext: "{{rangetext=REPLACE}}",
   level: "{{level=REPLACE}}",
   spellclass: "{{spellclass=REPLACE}}",
   cast_def: "{{cast_def=[[ REPLACE ]]}}",
   cast_defDC: "{{cast_defDC=[[ REPLACE ]]}}",
   concentrationNote: "{{concentrationNote=REPLACE}}",
   spellPenNote: "{{spellPenNote=REPLACE}}",
   casterlevel_chk: "{{casterlevel_chk=[[ 1d20 + REPLACE ]]}}",
   Concentration_chk: "{{Concentration_chk=[[ 1d20 + REPLACE ]]}}",
   spellnotes: "{{spells_notes=REPLACE}}",
   spell_fail_check: "{{spell_fail_check=[[ 1d100cf<[[ @{spell-fail} ]]cs>[[ @{spell-fail}+1 ]] ]]}}",
   spell_fail: "{{spell_fail=@{spell-fail}}}",
   spelldamage: "{{spelldamage=REPLACE}}",
   spelldamagetype: "{{spelldamagetype=REPLACE}}"

 },
 /* non repeating */
 optionAttrs = ["Concentration-0-def", "Concentration-1-def", "Concentration-2-def","spell-fail"],
 optionTogglesPlusOptionAttrs = optionToggles.concat(optionAttrs),
 /* repeating*/
 repeatingOptionAttrs = ["school", "cast-time", "duration", "save", "sr", "range_numeric", "targets", "description", "Concentration-mod",
   "savedc", "SP-mod", "range_pick", "range", "spell_level", "spellclass", "casterlevel", "components", "spellclass_number",
   "damage-macro-text", "damage-type"],
 repeatingOptionHelperAttrs = ["spellclass_number", "SP_misc", "CL_misc", "Concentration_misc", "slot", "spell-attack-type"],
 repeatingOptionAttrsToGet = repeatingOptionAttrs.concat(repeatingOptionHelperAttrs),
 rowattrToOptionToggleMap = {
   school: "toggle_spell_school_notes",
   "cast-time": "toggle_spell_casting_time_notes",
   components: "toggle_spell_components_notes",
   duration: "toggle_spell_duration_notes",
   save: "toggle_spell_saving_throw_notes",
   sr: "toggle_spell_sr_notes",
   range: "toggle_spell_range_notes",
   targets: "toggle_spell_targets_notes",
   description: "toggle_spell_description_notes",
   spellnotes:"toggle_spells_notes",
   spell_fail_check: "toggle_spell_spell_fail_check",
   "damage-macro-text": "toggle_spell_damage_notes",
   "damage-type": "toggle_spell_damage_notes"
 },
 optionTemplateRegexes = PFUtils.getOptionsCompiledRegexMap(optionTemplates),
 /* updateSpellOption - updates an existing @{spell_options} text for a row depending on the field updated on existing row
 */
 updateSpellOption = function (eventInfo, fieldUpdated) {
   var fieldName = "repeating_spells_" + fieldUpdated,
   toggleField = rowattrToOptionToggleMap[fieldUpdated];
   getAttrs([fieldName, "repeating_spells_spell_options", "repeating_spells_spell_lvlstr", toggleField, "repeating_spells_SP-mod", "repeating_spells_savedc"], function (v) {
     var optionText = v["repeating_spells_spell_options"],
     newValue = "",
     setter = {};
     //make sure we are not updating from compendium
     //this works it is just fast enough that it will not do anything since importFromCompendium is not done.
     if ((!v["repeating_spells_spell_lvlstr"]) && optionText) {
       try {
         //TAS.debug("PFSpellOptions.updateSpellOption, field: "+ fieldUpdated,v);
         newValue = v[fieldName] || "";
         if (parseInt(v[toggleField],10) === 1) {
           //TAS.debug"made it inside toggleField");
           switch (fieldUpdated) {
             case 'school':
               optionText = optionText.replace(optionTemplateRegexes.school, optionTemplates.school.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               break;
             case 'cast-time':
               optionText = optionText.replace(optionTemplateRegexes.casting_time, optionTemplates.casting_time.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               break;
             case 'components':
               optionText = optionText.replace(optionTemplateRegexes.components, optionTemplates.components.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               break;
             case 'duration':
               optionText = optionText.replace(optionTemplateRegexes.duration, optionTemplates.duration.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               break;
             case 'range':
               optionText = optionText.replace(optionTemplateRegexes.range, optionTemplates.range.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               break;
             case 'targets':
               optionText = optionText.replace(optionTemplateRegexes.targets, optionTemplates.targets.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               break;
             case 'save':
               if (PFUtils.shouldNotDisplayOption('saving_throw', newValue)) {
                 optionText = PFUtils.deleteOption(optionText, "saving_throw", optionTemplateRegexes);
               } else {
                 optionText = optionText.replace(optionTemplateRegexes.saving_throw, optionTemplates.saving_throw.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)));
               }
               break;
             case 'sr':
               if (PFUtils.shouldNotDisplayOption('sr', newValue)) {
                 optionText = PFUtils.deleteOption(optionText, "sr", optionTemplateRegexes);
               } else {
                 optionText = optionText.replace(optionTemplateRegexes.sr, optionTemplates.sr.replace("REPLACE", newValue));
               }
               break;
             case 'damage-macro-text':
               //TAS.debug"found damage macro-text="+newValue);
               if (PFUtils.shouldNotDisplayOption('damage-macro-text', newValue)) {
                 optionText = PFUtils.deleteOption(optionText, "spelldamage", optionTemplateRegexes);
               } else {
                 optionText = optionText.replace(optionTemplateRegexes.spelldamage, optionTemplates.spelldamage.replace("REPLACE", newValue));
               }
               break;
             case 'damage-type':
               //TAS.debug"found damage type"+newValue);
               if (PFUtils.shouldNotDisplayOption('damage-type', newValue)) {
                 optionText = PFUtils.deleteOption(optionText, "spelldamagetype", optionTemplateRegexes);
               } else {
                 optionText = optionText.replace(optionTemplateRegexes.spelldamagetype, optionTemplates.spelldamagetype.replace("REPLACE", newValue));
               }
               break;
           }
           setter["repeating_spells_spell_options"] = optionText;
           setAttrs(setter, {
             silent: true
           });
         }
       } catch (err){
         TAS.error("PFSpellOptions.updateSpellOption",err);
       }
     }
   });
 },
 /** getOptionText - resets entire @{spell_options} text for a spell row
 * if the field to update is one that is set by updateSpellOption, then need to set {{key=}} so it can find correct one to replace.
 *@param {string} id of row or null
 *@param {jsobj} eventInfo NOT USED
 *@param {object} toggleValues values from getAttrs of spell toggle option fields
 *@param {object} rowValues values from getAttrs of row attributes
 *@returns {string}
 */
 getOptionText = function (id, eventInfo, toggleValues, rowValues) {
   var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
   customConcentration = parseInt(rowValues[prefix + "Concentration_misc"], 10) || 0,
   customCasterlevel = parseInt(rowValues[prefix + "CL_misc"], 10) || 0,
   classNum = parseInt(rowValues[prefix + "spellclass_number"], 10),
   spellLevel = parseInt(rowValues[prefix + "spell_level"], 10),
   spellSlot = parseInt(rowValues[prefix + "slot"], 10),
   casterlevel = parseInt(rowValues[prefix + "casterlevel"], 10),
   concentrationMod = parseInt(rowValues[prefix + "Concentration-mod"], 10),
   levelForConcentrate = (isNaN(spellSlot) || spellSlot === spellLevel) ? spellLevel : spellSlot,
   defDC = 15 + (levelForConcentrate * 2),
   defMod = parseInt(rowValues["Concentration-" + classNum + "-def"], 10) || 0,
   optionText = "",
   newValue = "";
   //TAS.debug("getOptionText, defMod: " + defMod);
   if (isNaN(classNum) || isNaN(spellLevel)) {
     TAS.warn("cannot set options for spell! id:" + id + "  class or level are not numbers");
     return "";
   }
   if (toggleValues.showschool) {
     optionText += optionTemplates.school.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "school"]))||"";
   }
   if (toggleValues.showlevel) {
     optionText += optionTemplates.spellclass.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "spellclass"]))||"";
     optionText += optionTemplates.level.replace("REPLACE", spellLevel);
   }
   if (toggleValues.showcasting_time) {
     optionText += optionTemplates.casting_time.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "cast-time"]))||"";
   }
   if (toggleValues.showcomponents) {
     optionText += optionTemplates.components.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "components"]))||"";
   }
   if (toggleValues.showsaving_throw) {
     newValue = rowValues[prefix + "save"] || "";
     if (PFUtils.shouldNotDisplayOption('saving_throw', newValue)) {
       optionText += "{{saving_throw=}}";
     } else {
       optionText += optionTemplates.saving_throw.replace("REPLACE", SWUtils.escapeForRollTemplate(newValue)||"");
     }
     optionText += optionTemplates.dc.replace("REPLACE", parseInt(rowValues[prefix + "savedc"], 10) || 0);
   }
   if (toggleValues.showrange) {
     optionText += optionTemplates.range_pick.replace("REPLACE", rowValues[prefix + "range_pick"] || "blank")||"";
     optionText += optionTemplates.range.replace("REPLACE", parseInt(rowValues[prefix + "range_numeric"], 10) || 0)||"";
     optionText += optionTemplates.rangetext.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "range"] || "")||"");
   }
   if (toggleValues.showtargets) {
     optionText += optionTemplates.targets.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "targets"])||"");
   }
   if (toggleValues.showduration) {
     optionText += optionTemplates.duration.replace("REPLACE", SWUtils.escapeForRollTemplate(rowValues[prefix + "duration"])||"");
   }
   if (toggleValues.showsr) {
     newValue = rowValues[prefix + "sr"] || "";
     if (PFUtils.shouldNotDisplayOption('sr', newValue)) {
       optionText += "{{sr=}}";
     } else {
       optionText += optionTemplates.sr.replace("REPLACE", newValue)||"";
     }
   }
   if (toggleValues.showcasterlevel && customCasterlevel) {
     optionText += optionTemplates.casterlevel.replace("REPLACE", casterlevel)||"";
   } else {
     optionText += "{{casterlevel=}}";
   }
   if (toggleValues.showcasterlevel_check) {
     optionText += optionTemplates.casterlevel_chk.replace("REPLACE", casterlevel)||"";
   }
   if (toggleValues.showcasterlevel || toggleValues.showcasterlevel_check) {
     newValue = parseInt(rowValues[prefix + "SP-mod"], 10) || 0;
     if (newValue === 0) {
       optionText += "{{spellPen=}}";
     } else {
       optionText += optionTemplates.spellPen.replace("REPLACE", newValue)||"";
     }
   }
   if (toggleValues.showconcentration && customConcentration) {
     optionText += optionTemplates.Concentration.replace("REPLACE", concentrationMod)||"";
   } else {
     optionText += "{{Concentration=}}";
   }
   if (toggleValues.showconcentration_check) {
     optionText += optionTemplates.Concentration_chk.replace("REPLACE", concentrationMod)||"";
   }
   if (toggleValues.showconcentration || toggleValues.showconcentration_check) {
     if (defMod > 0) {
       optionText += optionTemplates.cast_def.replace("REPLACE", defMod)||"";
     } else {
       optionText += "{{cast_def=}}";
     }
     optionText += optionTemplates.cast_defDC.replace("REPLACE", defDC)||"";
   }
   if (toggleValues.showdescription) {
     optionText += optionTemplates.description.replace("REPLACE", "@{description}")||"";
   }
   if (toggleValues.showspellnotes) {
     optionText += optionTemplates.spellnotes.replace("REPLACE", "@{spell-class-"+classNum+"-spells-notes}")||"";
   }
   if (toggleValues.showspell_fail_check && parseInt(rowValues['spell-fail'],10) > 0) {
     //TAS.debug("adding spellfailure "+optionTemplates.spell_fail_check +" for id "+ id);
     optionText += optionTemplates.spell_fail_check||"";
     optionText += optionTemplates.spell_fail||"";
   }

   if (toggleValues.showdamage ){
     if(!PFUtils.findAbilityInString(rowValues[prefix+"spell-attack-type"])){
       optionText += optionTemplates.spelldamage.replace("REPLACE",(rowValues[prefix+"damage-macro-text"])||"");
     } else {
       optionText += "{{spelldamage=}}";
     }
     if (rowValues["damage-type"]){
       optionText += optionTemplates.spelldamagetype.replace("REPLACE", rowValues["damage-type"]||"");
     } else {
       optionText += "{{spelldamagetype=}}";
     }
   } else {
     optionText += "{{spelldamage=}}{{spelldamagetype=}}";
   }
   //TAS.debug("PFSpell.resetOption returning "+optionText);
   return optionText;
 },
 /** resetOption updates repeating_spells_$X_spell_options
 *@param {string} id id of row or null
 *@param {jsobj} eventInfo NOT USED
 */
 resetOption = function (id, eventInfo) {
   var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
   allFields;
   allFields = _.map(repeatingOptionAttrsToGet, function (field) {
     return prefix + field;
   }).concat(optionTogglesPlusOptionAttrs);
   getAttrs(allFields, function (v) {
     var toggleValues = _.chain(optionToggles).reduce(function (memo, attr) {
       memo['show' + attr.toLowerCase().slice(13).replace('_notes', '')] = (parseInt(v[attr], 10) || 0);
       return memo;
     }, {}).extend({
       "Concentration-0-def": (parseInt(v["Concentration-0-def"], 10) || 0),
       "Concentration-1-def": (parseInt(v["Concentration-1-def"], 10) || 0),
       "Concentration-2-def": (parseInt(v["Concentration-2-def"], 10) || 0)
     }).value(),
     optionText = "",
     setter = {};
     optionText = getOptionText(id, eventInfo, toggleValues, v)||"";
     //TAS.debug("resetOption","About to set",setter);
     if (typeof optionText !== "undefined" && optionText != null){
       setter["repeating_spells_" + PFUtils.getRepeatingIDStr(id) + "spell_options"] = optionText;
     }
     setAttrs(setter, {
       silent: true
     });
   });
 },
 /*resetOptions - updates repeating_spells_spell_options for all spells.
 *@param {jsobj} eventInfo NOT USED
 */
 resetOptions = function (callback, eventInfo) {
   getAttrs(optionTogglesPlusOptionAttrs, function (tv) {
     var optionFields = repeatingOptionAttrs.concat(repeatingOptionHelperAttrs),
     toggleValues = _.chain(optionToggles).reduce(function (memo, attr) {
       //get word between toggle_spell_ and _notes
       memo['show' + attr.toLowerCase().slice(13).replace('_notes', '')] = (parseInt(tv[attr], 10) || 0);
       return memo;
     }, {}).extend({
       "Concentration-0-def": (parseInt(tv["Concentration-0-def"], 10) || 0),
       "Concentration-1-def": (parseInt(tv["Concentration-1-def"], 10) || 0),
       "Concentration-2-def": (parseInt(tv["Concentration-2-def"], 10) || 0)
     }).value();
     getSectionIDs("repeating_spells", function (ids) {
       var fields = _.map(ids, function (id) {
         var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
         rowFields = _.map(optionFields, function (field) {
           return prefix + field;
         });
         return rowFields;
       });
       if (ids || _.size(ids)===0){
         if (typeof callback==="function"){callback();}
         return;
       }
       fields = _.flatten(fields, true);
       getAttrs(fields, function (v) {
         var setter = {};
         _.each(ids, function (id) {
           var optionText = getOptionText(id, eventInfo, toggleValues, v)||"";
           if (typeof optionText !== "undefined" && optionText != null){
             setter["repeating_spells_" + PFUtils.getRepeatingIDStr(id) + "spell_options"] = optionText;
           }
         });
         if (typeof callback === "function") {
           setAttrs(setter, {
             silent: true
           }, callback);
         } else {
           setAttrs(setter, {
             silent: true
           });
         }
       });
     });
   });
 },
 recalculate = function (callback) {
   resetOptions(null, callback);
 },
 events = {
   spellOptionEventsPlayer: ["school", "cast-time", "components", "duration", "save", "sr", "range", "targets", "damage-macro-text", "damage-type"]
 },
 registerEventHandlers = function () {
   //spell options for one row
   _.each(events.spellOptionEventsPlayer, function (fieldToWatch) {
     var eventToWatch = "change:repeating_spells:" + fieldToWatch;
     on(eventToWatch, TAS.callback(function eventOptionsRepeatingSpellsPlayer(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         updateSpellOption(eventInfo, fieldToWatch);
       }
     }));
   });
   //update the spell options
   _.each(optionToggles, function (toggleField) {
     on("change:" + toggleField, TAS.callback(function toggleField(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         resetOptions(null, eventInfo);
       }
     }));
   });
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFSpellOptions module loaded   ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   optionTemplates: optionTemplates,
   optionTemplateRegexes: optionTemplateRegexes,
   resetOption: resetOption,
   resetOptions: resetOptions
 };
}());
var PFSpells = PFSpells || (function () {
 'use strict';
 var
 //spell levels for repeating spell sections
 spellLevels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
 //for parsing: classes without their own spell lists plus bloodrager as sorcerer, whose list is not in compendium - hunter handled special
 classesUsingOtherSpellLists = {
   "arcanist": "wizard",
   "investigator": "alchemist",
   "warpriest": "cleric",
   "skald": "bard",
   "bloodrager": "sorcerer"
 },
 defaultRepeatingMacro='&{template:pf_spell} @{toggle_spell_accessible} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_spell}}} {{name=@{name}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{deafened_note=@{SpellFailureNote}}} @{spell_options}',
 defaultRepeatingMacroMap = {
   '&{template:':{'current':'pf_spell}',old:['pf_generic}','pf_block}']},
   '@{toggle_spell_accessible}':{'current':'@{toggle_spell_accessible}'},
   '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
   '{{color=':{'current':'@{rolltemplate_color}}}'},
   '{{header_image=':{'current':'@{header_image-pf_spell}}}'},
   '{{name=':{'current':'@{name}}}'},
   '{{character_name=':{'current':'@{character_name}}}'},
   '{{character_id=':{'current':'@{character_id}}}'},
   '{{subtitle}}':{'current':'{{subtitle}}'},
   '{{deafened_note=':{'current':'@{SpellFailureNote}}}'},
   '@{spell_options}':{'current':'@{spell_options}'}},
 defaultDeletedMacroAttrs=['@{toggle_accessible_flag}'],
 getSpellTotals = function (ids, v, setter) {
   var totalListed,
   totalPrepped;
   try {
     totalPrepped = _.reduce(PFConst.spellClassIndexes, function (memo, classidx) {
       memo[classidx] = _.reduce(spellLevels, function (imemo, spelllevel) {
         imemo[spelllevel] = 0;
         return imemo;
       }, {});
       return memo;
     }, {});
     totalListed = _.mapObject(totalPrepped, _.clone);
     _.each(ids, function (id) {
       var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
       spellLevel = parseInt(v[prefix + "spell_level"], 10),
       classNum = parseInt(v[prefix + "spellclass_number"], 10),
       metamagic = parseInt(v[prefix + "metamagic"], 10) || 0,
       slot = isNaN(parseInt(v[prefix + "slot"], 10)) ? spellLevel : parseInt(v[prefix + "slot"], 10),
       truelevel = metamagic ? slot : spellLevel,
       uses = parseInt(v[prefix + "used"], 10) || 0;
       if (!(isNaN(spellLevel) || isNaN(classNum))) {
         //TAS.debug("resetSpellsTotals", "spellLevel", spellLevel, "classNum", classNum, "metamagic", metamagic, "slot", slot, truelevel, "truelevel", uses, "uses");
         totalPrepped[classNum][truelevel] += uses;
         totalListed[classNum][truelevel] += 1;
       } else {
         TAS.warn("at resetSpellsTotals, ONE OF THESE IS NAN: spellLevel:"+ spellLevel+ ", classNum:"+ classNum);
       }
     });
     _.each(PFConst.spellClassIndexes, function (classidx) {
       _.each(spellLevels, function (spellLevel) {
         if ((parseInt(v["spellclass-" + classidx + "-level-" + spellLevel + "-total-listed"], 10) || 0) !== totalListed[classidx][spellLevel]) {
           setter["spellclass-" + classidx + "-level-" + spellLevel + "-total-listed"] = totalListed[classidx][spellLevel];
         }
         if ((parseInt(v["spellclass-" + classidx + "-level-" + spellLevel + "-spells-prepared"], 10) || 0) !== totalPrepped[classidx][spellLevel]) {
           setter["spellclass-" + classidx + "-level-" + spellLevel + "-spells-prepared"] = totalPrepped[classidx][spellLevel];
           setter["spellclass-" + classidx + "-level-" + spellLevel + "-spells-per-day"] = totalPrepped[classidx][spellLevel];
         }
       });
     });
   } catch (err) {
     TAS.error("PFSpells.updateSpellTotals", err);
   } finally {
     return setter;
   }
 },
 resetSpellsTotals = function (dummy, eventInfo, callback, silently) {
   var done = _.once(function () {
     TAS.debug("leaving PFSpells.resetSpellsTotals");
     if (typeof callback === "function") {
       callback();
     }
   });
   getSectionIDs("repeating_spells", function (ids) {
     var fields = [],
     rowattrs = ['spellclass_number', 'spell_level', 'slot', 'metamagic', 'used'];
     try {
       _.each(ids, function (id) {
         var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id);
         _.each(rowattrs, function (attr) {
           fields.push(prefix + attr);
         });
       });
       _.each(PFConst.spellClassIndexes, function (classidx) {
         _.each(spellLevels, function (spellLevel) {
           fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-total-listed");
           fields.push("spellclass-" + classidx + "-level-" + spellLevel + "-spells-prepared");
         });
       });
       getAttrs(fields, function (v) {
         var setter = {};
         try {
           setter = getSpellTotals(ids, v, setter);
           if (_.size(setter)) {
             setAttrs(setter, {
               silent: true
             }, done);
           } else {
             done();
           }
         } catch (innererr) {
           TAS.error("PFSpells.resetSpellsTotals innererror:", innererr);
           done();
         }
       });
     } catch (err) {
       TAS.error("PFSpells.resetSpellsTotals:", err);
       done();
     }
   });
 },
 /* ******************************** REPEATING SPELL FUNCTIONS ********************************** */
 setAttackEntryVals = function(spellPrefix,weaponPrefix,v,setter,noName){
   var notes="",attackType="";
   setter = setter||{};
   try {
     attackType=PFUtils.findAbilityInString(v[spellPrefix + "spell-attack-type"]);
     if (v[spellPrefix + "name"]) {
       if(!noName){
         setter[weaponPrefix + "name"] = v[spellPrefix + "name"];
       }
       setter[weaponPrefix + "source-spell-name"] = v[spellPrefix + "name"];
     }
     if (attackType) {
       setter[weaponPrefix + "attack-type"] = v[spellPrefix + "spell-attack-type"];
       if ((/CMB/i).test(attackType)) {
         setter[weaponPrefix + "vs"] = "cmd";
       } else {
         setter[weaponPrefix + "vs"] = "touch";
       }
     }
     if (v[spellPrefix+"range_numeric"]){
       setter[weaponPrefix + "range"]=v[spellPrefix+"range_numeric"];
     }
     if (v[spellPrefix+"range"] && v[spellPrefix+"range_pick"]==="see_text" ){
       notes += "Range:" + v[spellPrefix+"range"];
     }

     if (v[spellPrefix +"damage-macro-text"]){
       setter[weaponPrefix+"precision_dmg_macro"] = v[spellPrefix+"damage-macro-text"];
       if(attackType){
         setter[weaponPrefix+"critical_dmg_macro"] = v[spellPrefix+"damage-macro-text"];
       }
     }
     if (v[spellPrefix+ "damage-type"]){
       setter[weaponPrefix+"precision_dmg_type"] = v[spellPrefix+"damage-type"];
       if(attackType){
         setter[weaponPrefix+"critical_dmg_type"] = v[spellPrefix+"damage-type"];
       }
     }
     if (v[spellPrefix+"save"]){
       notes += "Save: "+ v[spellPrefix+"save"] + " DC: " + v[spellPrefix+"savedc"];
     }
     if ( v[spellPrefix+"sr"]){
       if (notes) { notes += ", ";}
       notes += "Spell resist:"+ v[spellPrefix+"sr"];
     }
     if (notes){
       setter[weaponPrefix+"notes"]=notes;
     }
   } catch (err){
     TAS.error("PFSpells.setAttackEntryVals",err);
   } finally {
     return setter;
   }
 },
 /*Triggered from a button in repeating spells */
 createAttackEntryFromRow = function (id, callback, silently, eventInfo, weaponId) {
   var done = _.once(function () {
     TAS.debug("leaving PFSpells.createAttackEntryFromRow");
     if (typeof callback === "function") {
       callback();
     }
   }),
   attribList = [],
   itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : ""),
   idStr = PFUtils.getRepeatingIDStr(id),
   item_entry = 'repeating_spells_' + idStr,
   attributes = ["range_pick","range","range_numeric","damage-macro-text","damage-type","sr","savedc","save"],
   commonAttributes = ["spell-attack-type","name"];

   //TAS.debug("at PFSpells creatattack entry ");
   attributes.forEach(function(attr){
     attribList.push(item_entry +  attr);
   });
   commonAttributes.forEach(function (attr) {
     attribList.push(item_entry +  attr);
   });
   //TAS.debug("attribList=" + attribList);
   getAttrs(attribList, function (v) {
     var newRowId="",
     setter = {},
     prefix = "repeating_weapon_",
     idStr="",
     params = {};
     try {
       //TAS.debug("at PFSpells.createAttackEntryFromRow",v);
       if (!PFUtils.findAbilityInString(v[item_entry + "spell-attack-type"]) && !v[item_entry + "damage-macro-text"]) {
         TAS.warn("no attack to create for spell "+ v[item_entry+"name"] +", "+ itemId );
       } else {
         if (! weaponId ){
           newRowId = generateRowID();
         } else {
           newRowId = weaponId;
         }
         idStr = newRowId+"_";
         prefix += idStr;
         setter = setAttackEntryVals(item_entry, prefix,v,setter,weaponId);
         setter[prefix + "source-spell"] = itemId;
         setter[prefix+"group"]="Spell";
       }
     } catch (err) {
       TAS.error("PFSpells.createAttackEntryFromRow", err);
     } finally {
       if (_.size(setter)>0){
         setter[item_entry + "create-attack-entry"] = 0;
         if (silently) {
           params = PFConst.silentParams;
         }
         setAttrs(setter, {}, function(){
           //can do these in parallel
           PFAttackOptions.resetOption(newRowId);
           PFAttackGrid.resetCommandMacro();
           done();
         });
       } else {
         setter[item_entry + "create-attack-entry"] = 0;
         setAttrs(setter,PFConst.silentParams,done);
       }
     }
   });
 },
 updateAssociatedAttack = function (id, callback, silently, eventInfo) {
   var done = _.once(function () {
     //TAS.debug("leaving PFSpells.updateAssociatedAttack");
     if (typeof callback === "function") {
       callback();
     }
   }),
   itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : ""),
   item_entry = 'repeating_spells_' + PFUtils.getRepeatingIDStr(itemId),
   attrib = (eventInfo ? SWUtils.getAttributeName(eventInfo.sourceAttribute) : ""),
   attributes=[];
   if (attrib){
     attributes = [item_entry+attrib];
     if ((/range/i).test(attrib)){
       attributes =[item_entry+'range_pick',item_entry+'range',item_entry+'range_numeric'];
     }
   } else {
     attributes = ["range_pick", "range", "range_numeric", "damage-macro-text", "damage-type", "sr", "savedc", "save", "spell-attack-type", "name"];
   }
   getAttrs(attributes,function(spellVal){
     getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
       var spellsourcesFields=[];
       spellsourcesFields = _.reduce(idarray,function(memo,currentID){
         memo.push("repeating_weapon_"+currentID+"_source-spell");
         return memo;
       },[]);
       getAttrs(spellsourcesFields,function(v){
         var setter={}, params={},idlist=[];
         try {
           _.each(idarray,function(currentID){
             var prefix = "repeating_weapon_"+currentID+"_";
             if (v[prefix+"source-spell"]===itemId){
               idlist.push(currentID);
               setter= setAttackEntryVals(item_entry, prefix,spellVal,setter);
             }
           });
           if (silently) {
             params = PFConst.silentParams;
           }
         } catch (err){
           TAS.error("PFSpells.updateAssociatedAttack",err);
         } finally {
           if (_.size(setter)>0){
             setAttrs(setter, params, function(){
               PFAttackOptions.resetSomeOptions(idlist);
             });
           } else {
             done();
           }
         }

       });
     });
   });
 },
 updatePreparedSpellState = function (id, eventInfo) {
   getAttrs(["repeating_spells_used", "repeating_spells_spellclass_number", "repeating_spells_prepared_state", "spellclass-0-hide_unprepared", "spellclass-1-hide_unprepared", "spellclass-2-hide_unprepared"], function (values) {
     var uses = parseInt(values.repeating_spells_used, 10) || 0,
     preparedState = parseInt(values.repeating_spells_prepared_state, 10) || 0,
     classnum = values["repeating_spells_spellclass_number"],
     isPrepared = (parseInt(values["spellclass-" + classnum + "-casting_type"], 10) || 0) === 2 ? 1 : 0,
     hideUnprepared = isPrepared * (parseInt(values["spellclass-" + classnum + "-hide_unprepared"], 10) || 0),
     setter = {};
     if (uses > 0 && preparedState === 0) {
       setter["repeating_spells_prepared_state"] = "1";
     } else if (uses < 1 && preparedState !== 0) {
       setter["repeating_spells_prepared_state"] = "0";
     }
     if (_.size(setter)) {
       if (hideUnprepared) {
         setAttrs(setter, {
           silent: true
         }, PFSpells.resetCommandMacro());
       } else {
         setAttrs(setter, {
           silent: true
         });
       }
     }
   });
 },
 /** - sets prepared_state to 1 if used has a value > 0 */
 resetSpellsPrepared = function () {
   getSectionIDs("repeating_spells", function (ids) {
     var fieldarray = [];
     _.each(ids, function (id) {
       var idStr = PFUtils.getRepeatingIDStr(id),
       prefix = "repeating_spells_" + idStr;
       fieldarray.push(prefix + "used");
       fieldarray.push(prefix + "prepared_state");
     });
     getAttrs(fieldarray, function (v) {
       var setter = {};
       _.each(ids, function (id) {
         var idStr = PFUtils.getRepeatingIDStr(id),
         prefix = "repeating_spells_" + idStr,
         uses = parseInt(v[prefix + "used"], 10) || 0,
         preparedState = parseInt(v[prefix + "prepared_state"], 10) || 0,
         setter = {};
         if (uses > 0 && preparedState === 0) {
           setter[prefix + "prepared_state"] = "1";
           //TAS.debug("resetSpellsPrepared, setting to 1:" + prefix);
         } else if (uses < 1 && preparedState !== 0) {
           setter[prefix + "prepared_state"] = "0";
         }
       });
       if (_.size(setter)) {
         setAttrs(setter, {
           silent: true
         });
       }
     });
   });
 },
 /************* SPELL OPTIONS *********************/
 /** updates all spells when level or concentration or spell penetration is updated
 *@param {int} classIdx 0..2
 *@param {object} eventInfo from on event
 *@param {function} callback when done
 */
 updateSpellsCasterLevelRelated = function (classIdx, eventInfo, callback) {
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   });
   //TAS.debug("updateSpellsCasterLevelRelated", eventInfo);
   if (!(classIdx >= 0 && classIdx <= 2) || isNaN(parseInt(classIdx, 10))) {
     done();
     return;
   }
   getAttrs(["spellclass-" + classIdx + "-level-total", "spellclasses_multiclassed", "Concentration-" + classIdx + "-misc", "spellclass-" + classIdx + "-name",
     "spellclass-" + classIdx + "-SP-mod", "Concentration-" + classIdx + "-def", "Concentration-" + classIdx + "-mod"],function(vout){
     var classLevel = parseInt(vout["spellclass-" + classIdx + "-level-total"], 10) || 0,
       abilityMod = parseInt(vout["Concentration-" + classIdx + "-mod"], 10) || 0,
       multiclassed = parseInt(vout["spellclasses_multiclassed"], 10) || 0,
       defMod = parseInt(vout["Concentration-" + classIdx + "-def"], 10),
       classConcentrationMisc = parseInt(vout["Concentration-" + classIdx + "-misc"], 10) || 0,
       classSPMisc = parseInt(vout["spellclass-" + classIdx + "-SP-mod"], 10) || 0,
       newClassName = vout["spellclass-" + classIdx + "-name"],
       updateDefensiveCasting = eventInfo ? (/\-def$/i.test(eventInfo.sourceAttribute)) : false;
     if (classLevel <= 0) {
       done();
       return;
     }
     //TAS.debug("updateSpellsCasterLevelRelated,class:"+classIdx+", class values:",vout);
     getSectionIDs("repeating_spells", function (ids) {
       var rowFieldAppnd = ['casterlevel', 'CL_misc', 'spell_class_r', 'spellclass_number', 'spellclass', 'range', 'range_numeric', 'range_pick', 'SP-mod', 'SP_misc', 'Concentration_misc', 'Concentration-mod', 'spell_options'],
       fields = _.reduce(ids, function (memo, id) {
         var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id), row;
         row = _.map(rowFieldAppnd, function (field) {
           return prefix + field;
         });
         return memo.concat(row);
       }, []);
       getAttrs(fields, function (v) {
         var doneOneRow = _.after(_.size(ids),done),
         classNumSetter = {},
         setter = {};
         try {
           //TAS.debug("updateSpellsCasterLevelRelated,class:"+classIdx+", spells:",v);
           _.each(ids, function (id) {
             var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
             classNum = parseInt(v[prefix + "spellclass_number"], 10),
             classRadio = parseInt(v[prefix + "spell_class_r"], 10),
             chosenRange = v[prefix + "range_pick"] || "",
             currRange = parseInt(v[prefix + "range_numeric"], 10) || 0,
             spellConcentrationMisc = parseInt(v[prefix + "Concentration_misc"], 10) || 0,
             optionText = v[prefix + "spell_options"],
             setOption = 0,
             tempstr = "",
             casterlevel = 0,
             newcasterlevel = 0,
             newConcentration = 0,
             newSP = 0,
             newClassName = "",
             newRange = 0;
             try {
               if (isNaN(classNum)) {
                 TAS.warn("class is blank, set to class 0");
                 classNum = 0;
                 classNumSetter[prefix + "spellclass_number"] = 0;
               } else if (!multiclassed || classNum === classIdx) {
                 if (classNum !== classRadio || isNaN(classRadio)) {
                   setter[prefix + "spell_class_r"] = classNum;
                 }

                 if (newClassName !== v[prefix + "spellclass"]) {
                   setter[prefix + "spellclass"] = newClassName;
                   if (optionText) {
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.spellclass, PFSpellOptions.optionTemplates.spellclass.replace("REPLACE", SWUtils.escapeForRollTemplate(v[prefix + "spellclass"])));
                     setOption = 1;
                   }
                 }
                 casterlevel = parseInt(v[prefix + "casterlevel"], 10);
                 newcasterlevel = classLevel + (parseInt(v[prefix + "CL_misc"], 10) || 0);
                 if (newcasterlevel < 1) {
                   newcasterlevel = 1;
                 }
                 if (newcasterlevel !== casterlevel || isNaN(casterlevel)) {
                   casterlevel = newcasterlevel;
                   setter[prefix + "casterlevel"] = newcasterlevel;
                   if (optionText) {
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.casterlevel, PFSpellOptions.optionTemplates.casterlevel.replace("REPLACE", newcasterlevel));
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.casterlevel_chk, PFSpellOptions.optionTemplates.casterlevel_chk.replace("REPLACE", newcasterlevel));
                     setOption = 1;
                   }
                 }
                 newRange = PFUtils.findSpellRange(v[prefix + "range"], chosenRange, casterlevel) || 0;
                 if (newRange !== currRange) {
                   setter[prefix + "range_numeric"] = newRange;
                   if (optionText) {
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.range, PFSpellOptions.optionTemplates.range.replace("REPLACE", newRange));
                     setOption = 1;
                   }
                 }
                 if (updateDefensiveCasting && optionText) {
                   if (defMod > 0) {
                     tempstr = PFSpellOptions.optionTemplates.cast_def.replace("REPLACE", defMod);
                   } else {
                     tempstr = "{{cast_def=}}";
                   }
                   if (optionText.indexOf("{{cast_def=") >= 0) {
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.cast_def, tempstr);
                   } else {
                     optionText += tempstr;
                   }
                   setOption = 1;
                 }
                 newConcentration = newcasterlevel + abilityMod + classConcentrationMisc + spellConcentrationMisc;
                 if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                   setter[prefix + "Concentration-mod"] = newConcentration;
                   if (optionText) {
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration, PFSpellOptions.optionTemplates.Concentration.replace("REPLACE", newConcentration));
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration_chk, PFSpellOptions.optionTemplates.Concentration_chk.replace("REPLACE", newConcentration));
                     setOption = 1;
                   }
                 }
                 newSP = classSPMisc + (parseInt(v[prefix + "SP_misc"], 10) || 0);
                 if (newSP !== (parseInt(v[prefix + "SP-mod"], 10) || 0)) {
                   setter[prefix + "SP-mod"] = newSP;
                   if (optionText) {
                     optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.spellPen, PFSpellOptions.optionTemplates.spellPen.replace("REPLACE", newSP));
                     setOption = 1;
                   }
                 }
                 if (setOption) {
                   setter[prefix + "spell_options"] = optionText;
                 }
               }
             } catch (innererror) {
               TAS.error("updateSpellsCasterLevelRelated innererror on id: "+id,innererror);
             }
           });

         } catch (err){
           TAS.error("updateSpellsCasterLevelRelated error:",err);
         } finally {
           if (_.size(setter) > 0 || _.size(classNumSetter) > 0) {
             //TAS.debug"updateSpellsCasterLevelRelated, setting:",classNumSetter,setter);
             if (_.size(classNumSetter) > 0) {
               setAttrs(classNumSetter,{},done);
             }
             if (_.size(setter) > 0) {
               setAttrs(setter, PFConst.silentParams, done);
             }
           } else {
             done();
           }
         }
       });
     });
   });
 },
 /** updates all spells when caster ability or DCs are updated
 *@param {int} classIdx 0..2
 *@param {object} eventInfo from on event
 *@param {function} callback when done
 */
 updateSpellsCasterAbilityRelated = function (classIdx, eventInfo, callback) {
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   });
   //TAS.debug("updateSpellsCasterLevelRelated", eventInfo);
   if (!(classIdx >= 0 && classIdx <= 2) || isNaN(parseInt(classIdx, 10))) {
     done();
     return;
   }
   getAttrs(["spellclass-" + classIdx + "-level-total", "Concentration-" + classIdx + "-mod", "Concentration-" + classIdx + "-misc", "spellclasses_multiclassed"],function(vout){
     var abilityMod, classConcentrationMisc,multiclassed,setter = {};
     try {
       abilityMod = parseInt(vout["Concentration-" + classIdx + "-mod"], 10) || 0;
       classConcentrationMisc = parseInt(vout["Concentration-" + classIdx + "-misc"], 10) || 0;
       multiclassed = parseInt(vout["spellclasses_multiclassed"], 10) || 0;
       if (!parseInt(vout["spellclass-" + classIdx + "-level-total"],10)){
         done();
         return;
       }
       //var updateAbilityScore = eventInfo?(/concentration\-[012]\-mod/i.test(eventInfo.sourceAttribute)):true;
       getSectionIDs("repeating_spells", function (ids) {
         var fields=[];
         //TAS.debug("updateSpellsCasterAbilityRelated",classIdx,eventInfo);
         //TAS.debug(ids);
         _.each(ids, function (id) {
           var prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id);
           fields = fields.concat([prefix + "spellclass_number", prefix + "spell_level", prefix + "spell_level_r", prefix + "spellclass_number",
           prefix + "casterlevel", prefix + "DC_misc", prefix + "savedc", prefix + "Concentration-mod", prefix + "Concentration_misc", prefix + "spell_options"]);
         });
         getAttrs(fields, function (v) {
           var newConcentration = 0,
           casterlevel = 0;
           //TAS.debug("updateSpellsCasterAbilityRelated,class:"+classIdx+", spells:",v);
           _.each(ids, function (id) {
             var spellLevel = 0, spellLevelRadio = 0, newDC = 0, setOption = 0,
             prefix = "repeating_spells_" + PFUtils.getRepeatingIDStr(id),
             optionText = v[prefix + "spell_options"],
             spellConcentrationMisc = parseInt(v[prefix + "Concentration_misc"], 10) || 0;
             try {
               if (!multiclassed || parseInt(v[prefix + "spellclass_number"], 10) === classIdx) {
                 spellLevel = parseInt(v[prefix + "spell_level"], 10);
                 spellLevelRadio = parseInt(v[prefix + "spell_level_r"], 10);
                 if (isNaN(spellLevel)) {
                   TAS.warn("spell level is NaN for " + prefix);
                   if (spellLevelRadio !== -1 || isNaN(spellLevelRadio)) {
                     setter[prefix + "spell_level_r"] = "-1";
                     setter[prefix + "savedc"] = "";
                   }
                 } else {
                   if (spellLevel !== spellLevelRadio || isNaN(spellLevelRadio)) {
                     setter[prefix + "spell_level_r"] = spellLevel;
                   }
                   newDC = 10 + spellLevel + abilityMod + (parseInt(v[prefix + "DC_misc"], 10) || 0);
                   if (newDC !== (parseInt(v[prefix + "savedc"], 10) || 0)) {
                     setter[prefix + "savedc"] = newDC;
                     if (optionText) {
                       optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.dc, PFSpellOptions.optionTemplates.dc.replace("REPLACE", newDC));
                       setOption = 1;
                     }
                   }
                   casterlevel = parseInt(v[prefix + "casterlevel"], 10) || 0;
                   if (!isNaN(casterlevel)) {
                     newConcentration = casterlevel + abilityMod + classConcentrationMisc + spellConcentrationMisc;
                     if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
                       setter[prefix + "Concentration-mod"] = newConcentration;
                       if (optionText) {
                         optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration, PFSpellOptions.optionTemplates.Concentration.replace("REPLACE", newConcentration));
                         optionText = optionText.replace(PFSpellOptions.optionTemplateRegexes.Concentration_chk, PFSpellOptions.optionTemplates.Concentration_chk.replace("REPLACE", newConcentration));
                         setOption = 1;
                       }
                     }
                   } else {
                     TAS.warn("spell casterlevel is NaN for " + prefix);
                     if ((parseInt(v[prefix + "Concentration-mod"], 10) || 0) !== 0) {
                       setter[prefix + "Concentration-mod"] = "";
                     }
                   }
                 }
                 if (setOption) {
                   //TAS.debug("setting option for id "+ id +" to "+optionText);
                   setter[prefix + "spell_options"] = optionText;
                 }
               }
             } catch (innererror){
               TAS.error("updateSpellsCasterAbilityRelated innererror on id:"+id,innererror);
             }
           });
         });
       });
     } catch(err){
       TAS.error("updateSpellsCasterAbilityRelated outer error:",err);
     }finally {
       if (_.size(setter) > 0) {
         //TAS.debug("updateSpellsCasterAbilityRelated setting:",setter);
         setAttrs(setter, PFConst.silentParams, done());
       } else if (typeof callback === "function") {
         done();
       }
     }
   });

 },
 resetCommandMacro = function (eventInfo, callback) {
   //TAS.debug("at PFSpells.resetCommandMacro");
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   repeatingSpellAttrs = ["spell_level","spellclass_number","name","school",
     "slot","metamagic","used","isDomain","isMythic"],
   class0BaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-0-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-0-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-0) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
   class1BaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-1-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-1-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-1) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
   class2BaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{spellclass-2-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-2-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-2) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
   npcClass0BaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-0-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-0-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-0) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
   npcClass1BaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-1-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-1-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-1) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
   npcClass2BaseMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_spell_accessible} @{toggle_rounded_flag}{{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{npc} @{spellclass-2-name} ^{spells}}} {{row01=**^{checks}**}} {{row02=[^{caster-level-check}](~@{character_id}|Spell-Class-2-CL-Check) [^{concentration-check}](~@{character_id}|Concentration-Check-2) [^{spell-failure}](~@{character_id}|Spell-Fail-Check)}}",
   pcBaseMacro=[class0BaseMacro,class1BaseMacro,class2BaseMacro],
   npcBaseMacro=[npcClass0BaseMacro,npcClass1BaseMacro,npcClass2BaseMacro],
   resetToDefault = function(configV){
     var attrs = [],i=0;
     for(i=0;i<3;i++){
       if(configV["spellclass-"+i+"-book"].slice(13) !== pcBaseMacro[i].slice(13)){
         attrs["spellclass-"+i+"-book"]=pcBaseMacro[i];
       }
       if(configV["spellclass-"+i+"-book-npc"].slice(13) !== npcBaseMacro[i].slice(13)){
         attrs["spellclass-"+i+"-book-npc"]=npcBaseMacro[i];
       }
     }
     if (_.size(attrs) > 0) {
       setAttrs(attrs, {
         silent: true
       }, done);
     } else {
       done();
     }
   };
   getAttrs(["spellclass-0-casting_type", "spellclass-1-casting_type", "spellclass-2-casting_type", "spellclass-0-hide_unprepared",
       "spellclass-1-hide_unprepared", "spellclass-2-hide_unprepared", "spellclass-0-book", "spellclass-1-book", "spellclass-2-book",
       "spellclass-0-book-npc", "spellclass-1-book-npc", "spellclass-2-book-npc",
       "spellclass-0-show_domain_spells", "spellclass-1-show_domain_spells", "spellclass-2-show_domain_spells",
       "spellmenu_groupby_school", "spellmenu_show_uses", "mythic-adventures-show"], function (configV) {
     var isPrepared = [], showDomain = [], hideUnprepared = [], groupBySchool=0, showUses=0, usesMythic=0;
     try{
       isPrepared = [
         (parseInt(configV["spellclass-0-casting_type"], 10) === 2),
         (parseInt(configV["spellclass-1-casting_type"], 10) === 2),
         (parseInt(configV["spellclass-2-casting_type"], 10) === 2)];
       showDomain = [
         (parseInt(configV["spellclass-0-show_domain_spells"],10)||0),
         (parseInt(configV["spellclass-1-show_domain_spells"],10)||0),
         (parseInt(configV["spellclass-2-show_domain_spells"],10)||0)];
       hideUnprepared = [
         (parseInt(configV["spellclass-0-hide_unprepared"], 10) || 0),
         (parseInt(configV["spellclass-1-hide_unprepared"], 10) || 0),
         (parseInt(configV["spellclass-2-hide_unprepared"], 10) || 0)];
       groupBySchool = parseInt(configV["spellmenu_groupby_school"],10)||0;
       showUses = parseInt(configV["spellmenu_show_uses"],10)||0;
       usesMythic = parseInt(configV["mythic-adventures-show"],10)||0;
     } catch(outererr){
       TAS.error("PFSpells.resetCommandMacro, error assembling global vars",outererr);
       done();
       return;
     }
     getSectionIDs("repeating_spells", function (idarray) {
       var attrs = {};
       //TAS.debug(idarray);
       if (!idarray || idarray.length === 0) {
         resetToDefault(configV);
         return;
       }
       getAttrs(["_reporder_repeating_spells"], function (repValues) {
         //TAS.debug("PFSpells.resetCommandMacro order repValues:",repValues);
         var spellAttrs = _.chain(idarray)
           .map(function(id){
             var prefix = 'repeating_spells_'+PFUtils.getRepeatingIDStr(id),
             retVal = [];
             _.each(repeatingSpellAttrs,function(attr){
               retVal.push(prefix + attr);
             });
             return retVal;
           })
           .flatten()
           .value();
         getAttrs(spellAttrs, function (values) {
           //TAS.debug(values);
           var orderedList, repList, filteredIds, spellsByClass, npcSpellsArray, customSorted=0,
           spellsPC, spellsNPC, i,groups = [],
           spellSchoolReg = /[^\(\[]*/,
           attrs = {},rollTemplateCounter=0,
           tempstr;
           try {
             if (!_.isUndefined(repValues._reporder_repeating_spells) && repValues._reporder_repeating_spells !== "") {
               repList = repValues._reporder_repeating_spells.split(",");
               repList = _.map(repList, function (ID) {
                 return ID.toLowerCase();
               });
               orderedList = _.intersection(_.union(repList, idarray), idarray);
               customSorted = 1;
             } else {
               orderedList = idarray;
             }
             spellsByClass = _.chain(orderedList)
             .map(function(id){
               var prefix = "repeating_spells_"+ SWUtils.getRepeatingIDStr(id),
               metaMagic = parseInt(values[prefix + "metamagic"], 10)||0,
               spellSlot = (metaMagic) ? values[prefix + "slot"] : values[prefix + "spell_level"],
               matches,
               schoolForGroup=values[prefix + "school"]||"";
               matches = spellSchoolReg.exec(values[prefix + "school"]||"");
               if (matches && matches[0]){
                 schoolForGroup = SWUtils.trimBoth(matches[0]);
                 schoolForGroup = schoolForGroup[0].toUpperCase() + schoolForGroup.slice(1).toLowerCase();
               }
               return { id: id,
                 level: spellSlot,
                 levelstr: "^{level} "+String(spellSlot),
                 rawlevel : parseInt(values[prefix + "spell_level"],10),
                 school: schoolForGroup,
                 spellClass: (parseInt(values[prefix + "spellclass_number"],10)),
                 spellClassstr: "class"+values[prefix + "spellclass_number"],
                 isDomain: (parseInt(values[prefix + "isDomain"],10)||0),
                 isMythic: (usesMythic * parseInt(values[prefix+"isMythic"],10)||0),
                 uses: (parseInt(values[prefix + "used"],10)||0),
                 name: (values[prefix+"name"]||"")
               };
             })
             .omit(function(spellObj){
               return isNaN(spellObj.rawlevel) || isNaN(spellObj.spellClass) ||
                 (hideUnprepared[spellObj.spellClass] && spellObj.uses===0 &&
                   (!( showDomain[spellObj.spellClass] && spellObj.isDomain )));
             })
             .map(function(spellObj){
               var spellName = spellObj.name, usesStr="",dstr="",mystr="",lvlstr="", spacestr="";
               try {
                 spellName = SWUtils.escapeForChatLinkButton(spellName);
                 spellName = SWUtils.escapeForRollTemplate(spellName);
                 spellName = SWUtils.trimBoth(spellName);
                 usesStr = showUses?("("+spellObj.uses+")"):"";
                 if(showUses&&isPrepared[spellObj.spellClass]&&spellObj.isDomain){
                   usesStr="";
                 }
                 mystr=spellObj.isMythic?"&#x1f11c;":""; //   // "&#x24A8;":"";//"(m)":"";//
                 dstr= spellObj.isDomain?"&#x1f113;":""; // "";  //"&#x249F;":"";//"(d)":"";//
                 lvlstr=groupBySchool?(spellObj.level+":"):"";
                 spacestr= (usesStr||mystr||dstr)?" ":"";
                 spellName = " ["+lvlstr + spellName + spacestr + dstr + mystr + usesStr + "]";
               } catch (maperr){
                 TAS.error("PFSpells.resetCommandMacro error creating link name:",maperr);
               } finally {
                 spellObj.pcChatLink = spellName+"(~@{character_id}|repeating_spells_" + spellObj.id + "_roll)";
                 spellObj.npcChatLink = spellName+"(~@{character_id}|repeating_spells_" + spellObj.id + "_npc-roll)";
                 return spellObj;
               }
             })
             .sortBy('level')
             .groupBy('spellClassstr')
             .mapObject(function(classArray){
               return _.chain(classArray)
               .sortBy(groupBySchool?'school':'levelstr')
               .groupBy(groupBySchool?'school':'levelstr')
               .value();
             })
             .value();


             //TAS.debug("#############################");
             //TAS.debug(spellsByClass);
             //TAS.debug("#############################");

             //was 2 sets of 3 reduces but can do this faster with 3 each loops and populating both at once
             spellsPC={};
             spellsNPC={};
             rollTemplateCounter=10;
             _.each(spellsByClass, function(groupList,classGroup){
               var pcstr="",npcstr="";
               _.each(groupList,function(spellList,groupName){
                 rollTemplateCounter++;
                 pcstr += " {{row"+rollTemplateCounter+"=**" + groupName+"**}}" ;
                 npcstr += " {{row"+rollTemplateCounter+"=**" + groupName+"**}}" ;
                 rollTemplateCounter++;
                 pcstr += " {{row"+rollTemplateCounter+"=";
                 npcstr += " {{row"+rollTemplateCounter+"=";
                 _.each(spellList,function(spellObj){
                   pcstr += spellObj.pcChatLink;
                   npcstr += spellObj.npcChatLink;
                 });
                 pcstr += "}}";
                 npcstr += "}}";
               });
               spellsPC[classGroup]=pcstr;
               spellsNPC[classGroup]=npcstr;
             });
             //TAS.debug("#############################");
             //TAS.debug(spellsPC,spellsNPC);
             //TAS.debug("#############################");

             for (i=0;i<3;i++){
               tempstr = pcBaseMacro[i] + spellsPC['class'+i];
               if (tempstr && configV["spellclass-"+i+"-book"].slice(13) !== tempstr.slice(13)) {
                 attrs["spellclass-"+i+"-book"]=tempstr;
               } else if (!tempstr && configV["spellclass-"+i+"-book"].slice(13) !== pcBaseMacro[i].slice(13)){
                 attrs["spellclass-"+i+"-book"]="";
               }
               tempstr = npcBaseMacro[i] + spellsNPC['class'+i];
               if (tempstr && configV["spellclass-"+i+"-book-npc"].slice(13) !== tempstr.slice(13)) {
                 attrs["spellclass-"+i+"-book-npc"]=tempstr;
               } else if (!tempstr && configV["spellclass-"+i+"-book-npc"].slice(13) !== npcBaseMacro[i].slice(13)){
                 attrs["spellclass-"+i+"-book-npc"]="";
               }
             }
             if (_.size(attrs) > 0) {
               setAttrs(attrs, {
                 silent: true
               }, done);
             } else {
               done();
             }
           } catch (err) {
             TAS.error("PFSpells.resetCommandMacro", err);
             done();
           }
         });
       });
     });
   });
 },
 //faster smaller than updateSpell
 updateSpellSlot = function (id, eventInfo, callback) {
   var outerdone = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   done = _.once(function () {
     resetCommandMacro(eventInfo, outerdone);
   }),
   idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_spells_" + idStr,
   spellLevelRadioField = prefix + "spell_level_r",
   spellSlotField = prefix + "slot",
   spellLevelField = prefix + "spell_level",
   metamagicField = prefix + "metamagic";
   //TAS.debug("updateSpellSlot", eventInfo, id);
   getAttrs([spellSlotField, spellLevelField, spellLevelRadioField], function (v) {
     var slot = parseInt(v[spellSlotField], 10),
     level = parseInt(v[spellLevelField], 10),
     metamagic = parseInt(v[metamagicField], 10) || 0,
     spellLevelRadio = parseInt(v[spellLevelRadioField],10)||0,
     setter = {};
     try {
       //TAS.debug("updateSpellSlot", v);
       if (metamagic) {
         if (isNaN(level)) {
           slot = -1;
         }
         if (isNaN(slot)) {
           slot = level;
           setter[spellSlotField] = level;
           setAttrs(setter, {
             silent: true
           }, done);
           return;
         }
         if (slot !== spellLevelRadio) {
           //TAS.debug("updating slot to " + slot);
           setter[spellLevelRadioField] = slot;
           if (spellLevelRadio===-1){
             setter["spells_tab"] = slot;
           }
           setAttrs(setter, {
             silent: true
           }, done);
           return;
         }
       }
       outerdone();
     } catch (err) {
       TAS.error("updateSpellSlot", err);
       outerdone();
     }
   });
 },
 /** updates a spell
 *@param {string} id optional, pass id if looping through list of IDs. Null if context is row itself.
 *@param {eventInfo} eventInfo ACTUALLY USED : if not present forces recalc of everything
 *@param {function} callback - to call when done.
 *@param {bool} doNotUpdateTotals - if true do NOT call resetSpellsTotals() and resetCommandMacro() at end, otherwise do.
 */
 updateSpell = function (id, eventInfo, callback, doNotUpdateTotals) {
   var spellLevelUndefined = false,
   done = function () {
     //TAS.debug("leaving PFSpells.updateSpell: id:" + id + " spelllevelundefined=" + spellLevelUndefined);
     //these asynchronous functions can be called at same time as callback.
     if (!spellLevelUndefined) {
       PFSpellOptions.resetOption(id, eventInfo);
       if (!doNotUpdateTotals) {
         resetSpellsTotals();
         resetCommandMacro();
       }
     }
     if (typeof callback === "function") {
       callback();
     }
   },
   idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_spells_" + idStr,
   classNameField = prefix + "spellclass",
   classRadioField = prefix + "spell_class_r",
   classNumberField = prefix + "spellclass_number",
   casterlevelField = prefix + "casterlevel",
   spellLevelField = prefix + "spell_level",
   spellLevelRadioField = prefix + "spell_level_r",
   dcMiscField = prefix + "DC_misc",
   currDCField = prefix + "savedc",
   fields = [classNumberField, classRadioField, classNameField, casterlevelField, prefix + "CL_misc", prefix + "spellclass_number", prefix + "range_pick", prefix + "range", prefix + "range_numeric", prefix + "SP-mod", prefix + "SP_misc", prefix + "Concentration_misc", prefix + "Concentration-mod", prefix + "spell_options", prefix + "used", prefix + "slot", prefix + "metamagic", spellLevelField, spellLevelRadioField, dcMiscField, currDCField, "spellclass-0-level-total", "spellclass-1-level-total", "spellclass-2-level-total", "spellclass-0-SP-mod", "spellclass-1-SP-mod", "spellclass-2-SP-mod", "Concentration-0-mod", "Concentration-1-mod", "Concentration-2-mod", "Concentration-0-misc", "Concentration-1-misc", "Concentration-2-misc", "Concentration-0-def", "Concentration-1-def", "Concentration-2-def", "spellclass-0-name", "spellclass-1-name", "spellclass-2-name"];
   getAttrs(fields, function (v) {
     var setter = {},
     baseClassNum,
     classNum = 0,
     classRadio,
     currClassName = "",
     className = "",
     baseSpellLevel,
     spellLevel,
     spellSlot,
     metaMagic,
     spellLevelRadio,
     currCasterLevel,
     casterlevel,
     spellAbilityMod,
     newDC = 10,
     levelSlot,
     currRange,
     currChosenRange,
     newSP = 0,
     newConcentration = 0,
     updateClass = false,
     updateClassLevel = false,
     updateRange = false,
     updateSP = false,
     updateConcentration = false,
     updateSpellLevel = false,
     updateDC = false,
     updateSlot = false,
     updateStr = "",
     tempMatches,
     hadToSetClass = false,
     newRange = 0;
     try {
       baseClassNum = parseInt(v[classNumberField], 10);
       classNum = baseClassNum || 0;
       classRadio = parseInt(v[classRadioField], 10);
       baseSpellLevel = parseInt(v[spellLevelField], 10);
       spellLevel = baseSpellLevel || 0;
       spellSlot = parseInt(v[prefix + "slot"], 10);
       metaMagic = parseInt(v[prefix + "metamagic"], 10) || 0;
       spellLevelRadio = parseInt(v[spellLevelRadioField], 10);
       currCasterLevel = parseInt(v[casterlevelField], 10);
       casterlevel = currCasterLevel || 0;
       spellAbilityMod = parseInt(v["Concentration-" + classNum + "-mod"], 10) || 0;
       levelSlot = (metaMagic ? spellSlot : spellLevel);
       currRange = parseInt(v[prefix + "range_numeric"], 10) || 0;
       currChosenRange = v[prefix + "range_pick"] || "blank";
       //cannot perform calculations
       if (isNaN(baseClassNum) && isNaN(baseSpellLevel)) {
         TAS.warn("cannot update spell! id:" + id + " both class and level are not numbers", v);
         return;
       }
       //TAS.debug("spell slot:" + spellSlot + ", metamagic:" + metaMagic + ", spelllevel:" + spellLevel + ", radio:" + spellLevelRadio);
       //if looping through with id then force update of all fields.
       if (!eventInfo) {
         updateClass = true;
       }
       //if class is not set, then set to default class 0
       if (isNaN(baseClassNum)) {
         //force to zero?
         setter[classNumberField] = classNum;
         updateClass = true;
         hadToSetClass = true;
       }
       if (classNum !== classRadio) {
         setter[classRadioField] = classNum;
         updateClass = true;
       }
       if (!updateClass && eventInfo && eventInfo.sourceAttribute) {
         updateStr = eventInfo.sourceAttribute.toLowerCase();
         tempMatches = updateStr.match(/lvlstr|range_pick|range|sp_misc|cl_misc|spellclass_number|spell_level|dc_misc|concen|slot/);
         if (tempMatches && tempMatches[0]) {
           switch (tempMatches[0]) {
             case 'range_pick':
             case 'range':
               updateRange = true;
               break;
             case 'sp_misc':
               updateSP = true;
               break;
             case 'cl_misc':
               updateClassLevel = true;
               break;
             case 'spellclass_number':
               updateClass = true;
               break;
             case 'concen':
               updateConcentration = true;
               break;
             case 'spell_level':
               updateSpellLevel = true;
               break;
             case 'dc_misc':
               updateDC = true;
               break;
             case 'slot':
               updateSlot = true;
               break;
             case 'lvlstr':
               updateClass = true;
               updateClassLevel = true;
               updateConcentration = true;
               updateSP = true;
               updateDC = true;
               updateRange = true;
               break;
             default:
               updateClass = true; //unknown just update all
           }
         } else {
           //if we called from importFromCompendium then it's lvlstr
           TAS.warn("Unimportant field updated, do not update row: " + eventInfo.sourceAttribute);
           done();
           return;
         }
       }
       if (isNaN(baseSpellLevel)) {
         if (spellLevelRadio !== -1) {
           setter[spellLevelRadioField] = "-1";
           setter[prefix + "slot"] = "";
         }
         spellLevelUndefined = true;
       } else if (!metaMagic && (updateSpellLevel || spellLevel !== spellLevelRadio)) {
         //TAS.debug("reset radio field after spell update");
         setter[spellLevelRadioField] = spellLevel;
         if (spellLevelRadio===-1){
           setter["spells_tab"] = spellLevel;
         }
         updateSpellLevel = true;
       } else if (metaMagic && !isNaN(spellSlot) && (updateSlot || spellSlot !== spellLevelRadio)) {
         //TAS.debug("reset radio field after spell SLOT update");
         setter[spellLevelRadioField] = spellSlot;
         if (spellLevelRadio===-1){
           setter["spells_tab"] = spellSlot;
         }
       }
       //keep slot in sync
       if (!spellLevelUndefined) {
         if (isNaN(spellSlot)) {
           setter[prefix + "slot"] = spellLevel;
           spellSlot = spellLevel;
           updateSlot = true;
         } else if (!metaMagic && (updateSpellLevel || spellSlot !== spellLevel)) {
           setter[prefix + "slot"] = spellLevel;
         }
       }
       //classname
       className = v["spellclass-" + classNum + "-name"];
       if (updateClass) {
         currClassName = v[classNameField];
         if (currClassName !== className) {
           setter[classNameField] = className;
         }
       }
       if (isNaN(currCasterLevel)) {
         updateClassLevel = true;
       }
       //set caster level
       if (updateClass || updateClassLevel) {
         casterlevel = (parseInt(v["spellclass-" + classNum + "-level-total"], 10) || 0) + (parseInt(v[prefix + "CL_misc"], 10) || 0);
         if (casterlevel < 1) {
           casterlevel = 1;
         }
         if (currCasterLevel !== casterlevel || isNaN(currCasterLevel)) {
           setter[prefix + "casterlevel"] = casterlevel;
           updateClassLevel = true;
         }
       }
       if (!(spellLevelUndefined) && (updateClass || updateSpellLevel || updateDC)) {
         newDC = 10 + spellLevel + spellAbilityMod + (parseInt(v[dcMiscField], 10) || 0);
         if (newDC !== (parseInt(v[currDCField], 10) || 0)) {
           setter[currDCField] = newDC;
         }
       }
       if (updateClass || updateClassLevel || updateConcentration) {
         newConcentration = casterlevel + spellAbilityMod + (parseInt(v["Concentration-" + classNum + "-misc"], 10) || 0) + (parseInt(v[prefix + "Concentration_misc"], 10) || 0);
         if (newConcentration !== (parseInt(v[prefix + "Concentration-mod"], 10) || 0)) {
           setter[prefix + "Concentration-mod"] = newConcentration;
         }
       }
       if (updateClass || updateRange || updateClassLevel) {
         newRange = PFUtils.findSpellRange(v[prefix + "range"], currChosenRange, casterlevel) || 0;
         if (newRange !== currRange) {
           setter[prefix + "range_numeric"] = newRange;
         }
       }
       if (updateClass || updateSP || updateClassLevel) {
         newSP = (parseInt(v["spellclass-" + classNum + "-SP-mod"], 10) || 0) + (parseInt(v[prefix + "SP_misc"], 10) || 0);
         if (newSP !== (parseInt(v[prefix + "SP-mod"], 10) || 0)) {
           setter[prefix + "SP-mod"] = newSP;
         }
       }
     } catch (err) {
       TAS.error("PFSpells.updateSpell:" + id, err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, {
           silent: true
         }, done);
       } else {
         done();
       }
     }
   });
 },
 /** - updates all spells
 *@param {function} callback when done
 *@param {silently} if should call setAttrs with {silent:true}
 *@param {object} eventInfo not used
 */
 updateSpells = function (callback, silently, eventInfo) {
   var done = _.once(function () {
     TAS.debug("leaving PFSpells.updateSpells");
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneOne = _.after(3,done);
   getAttrs(['use_spells','spellclass-0-exists','spellclass-1-exists','spellclass-2-exists'],function(v){
     //TAS.debug"at PFSpells.updateSpells. Existing classes:",v);
     if(parseInt(v.use_spells,10)){
       _.times(3,function(n){
         if (parseInt(v['spellclass-'+n+'-exists'],10)){
           updateSpellsCasterAbilityRelated (n,null,function(){
             updateSpellsCasterLevelRelated(n,null,doneOne);
           });
         } else {
           doneOne();
         }
       });
     } else {
       done();
     }
   });
 },
 /* gets level and class from repeating_spells_spell_lvlstr then updates spell
 * matches class name in compendium against current spell classes in this order:
 * spell class already selected by spell dropdown, spellclass0, spellclass1, spellclass2
 * then sets spell level to the matching level for that class
 * if it cannot find then sets class name to the class level string and updates silently.
 *@param {string} id the id of the row
 *@param {object} eventInfo used to find row id since id param will be null
 */
 importFromCompendium = function (id, eventInfo) {
   var trueId = "";

   trueId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");

   getAttrs(["repeating_spells_compendium_category","repeating_spells_spell_lvlstr", "spellclass-0-name", "spellclass-1-name", "spellclass-2-name", "repeating_spells_range_from_compendium", "repeating_spells_target_from_compendium", "repeating_spells_area_from_compendium", "repeating_spells_effect_from_compendium","repeating_spells_description"], function (v) {
     var levelStrBase = v["repeating_spells_spell_lvlstr"],
     rangeText = v["repeating_spells_range_from_compendium"],
     areaEffectText = (v["repeating_spells_target_from_compendium"] || "") + (v["repeating_spells_area_from_compendium"] || "") + (v["repeating_spells_effect_from_compendium"] || ""),
     classesInital = [],
     classes = [],
     originalClasses = ["", "", ""],
     classMatch = "",
     level = 0,
     idx = -1,
     foundMatch = false,
     setSilent = {},
     i = 0,
     classesToMatch = {},
     tempclassname = "",
     newRangeSettings,
     hasHunter = false,
     hasDruid = false,
     hasRanger = false,
     minHunterSpellLevel = 99,
     hunterIdx = 99,
     isAttack = false,
     allSame=1,
     modeLevel=-1,
     counter = 0,
     callUpdateSpell = true;
     //TAS.debug("at pfspells.importFromCompendium",v);
     if (levelStrBase) {
       try {
         levelStrBase = levelStrBase.toLowerCase();
         //get first word in names of classes (since users may put archetypes or other variables in)
         //if (currClass) {classesToMatch[0]=currClass.toLowerCase().replace(/^\s+/,"").match(/\w[^\d]+/)[0];}
         if (v["spellclass-0-name"]) {
           tempclassname = v["spellclass-0-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
           classesToMatch[tempclassname] = 0;
           originalClasses[0] = tempclassname;
           if (/hunter/.test(tempclassname)) {
             hasHunter = true;
             hunterIdx = 0;
           } else if (/druid/.test(tempclassname)) {
             hasDruid = true;
           } else if (/ranger/.test(tempclassname)) {
             hasRanger = true;
           }
         }
         if (v["spellclass-1-name"]) {
           tempclassname = v["spellclass-1-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
           classesToMatch[tempclassname] = 1;
           originalClasses[1] = tempclassname;
           if (/hunter/.test(tempclassname)) {
             hasHunter = true;
             hunterIdx = 1;
           } else if (/druid/.test(tempclassname)) {
             hasDruid = true;
           } else if (/ranger/.test(tempclassname)) {
             hasRanger = true;
           }
         }
         if (v["spellclass-2-name"]) {
           tempclassname = v["spellclass-2-name"].toLowerCase().replace(/^\s+/, "").match(/\w+/)[0];
           classesToMatch[tempclassname] = 2;
           originalClasses[2] = tempclassname;
           if (/hunter/.test(tempclassname)) {
             hasHunter = true;
             hunterIdx = 2;
           } else if (/druid/.test(tempclassname)) {
             hasDruid = true;
           } else if (/ranger/.test(tempclassname)) {
             hasRanger = true;
           }
         }
         if (!(hasHunter && (hasDruid || hasRanger))) {
           //if user is hunter AND other class it's based on then can't tell.
           if (_.size(classesToMatch) > 0) {
             //add the translated classes from classesUsingOtherSpellLists
             _.each(classesToMatch, function (classindex, classname) {
               _.each(classesUsingOtherSpellLists, function (toclass, fromclass) {
                 if (classname.indexOf(fromclass) >= 0) {
                   classesToMatch[toclass] = classindex;
                 }
               });
             });
             //from spell: first split on comma between classes, then on spaces between classname and level
             classesInital = levelStrBase.split(/\s*,\s*/);
             classes = _.map(classesInital, function (a) {
               return a.split(/\s+/);
             });
             for (i = 0; i < classes.length; i++) {
               classes[i][1] = (parseInt(classes[i][1], 10) || 0);
               if (i===0){
                 modeLevel=classes[i][1];
               } else {
                 if (modeLevel !== classes[i][1]){
                   allSame=0;
                 }

               }
             }
             //classes example: [["sorcerer/wizard","2"],["summoner","1"],["inquisitor","3"],["magus","2"]]
             if (hasHunter) {
               for (i = 0; i < classes.length; i++) {
                 if (/druid|ranger/.test(classes[i][0]) && classes[i][1] < minHunterSpellLevel) {
                   minHunterSpellLevel = classes[i][1];
                   classMatch = classes[i][0];
                 }
               }
               if (minHunterSpellLevel < 99) {
                 counter++;
                 foundMatch = true;
                 level = minHunterSpellLevel;
                 idx = hunterIdx;
               }
             }
             _.each(classesToMatch, function (classindex, classname) {
               for (i = 0; i < classes.length; i++) {
                 //classes on left because it can be longer and have multiple class names such as cleric/druid
                 if (classes[i][0].indexOf(classname) >= 0) {
                   counter++;
                   if (!foundMatch) {
                     classMatch = originalClasses[classindex];
                     level = classes[i][1];
                     idx = classindex;
                     foundMatch = true;
                   }
                 }
               }
             });
           }
         }
       } catch (err) {
         classMatch = "";
       }
       if (counter > 1 || !foundMatch) {
         TAS.warn("importFromCompendium: did not find class match");
         //leave at current choice if there is one
         setSilent["repeating_spells_spell_level"] = "";
         setSilent["repeating_spells_spell_level_r"] = -1;
         setSilent["repeating_spells_spell_class_r"] = -1;
         setSilent["repeating_spells_spellclass_number"] = "";
         setSilent["repeating_spells_spellclass"] = levelStrBase;
         callUpdateSpell = false;
       } else {
         setSilent["repeating_spells_spellclass_number"] = idx;
         setSilent["repeating_spells_spell_level"] = level;
         setSilent["repeating_spells_spell_level_r"] = level;
         setSilent["repeating_spells_spellclass"] = classMatch;
         setSilent["repeating_spells_spell_class_r"] = idx;
         //change tab so spell doesn't disappear.
         setSilent["spells_tab"] = level;
       }
     }
     if (rangeText) {
       try {
         newRangeSettings = PFUtils.parseSpellRangeText(rangeText, areaEffectText);
         setSilent["repeating_spells_range_pick"] = newRangeSettings.dropdown;
         setSilent["repeating_spells_range"] = newRangeSettings.rangetext;
         if (newRangeSettings.dropdown==='touch' ) {
           isAttack=true;
           setSilent["repeating_spells_attack-type"]='attk-melee';
         } else if ( (/ranged touch|ray\s/i).test(v["repeating_spells_description"])  ) {
           isAttack=true;
           setSilent["repeating_spells_attack-type"]='attk-ranged';
         }
       } catch (err2) {
         TAS.error(err2);
         setSilent["repeating_spells_range"] = rangeText.replace(/\s*\(..*/, '');
         setSilent["repeating_spells_range_pick"] = "unknownrange";
       }
     }
     if (areaEffectText) {
       setSilent["repeating_spells_targets"] = areaEffectText;
     }
     setSilent["repeating_spells_spell_lvlstr"] = "";
     setSilent["repeating_spells_range_from_compendium"] = "";
     setSilent["repeating_spells_target_from_compendium"] = "";
     setSilent["repeating_spells_area_from_compendium"] = "";
     setSilent["repeating_spells_effect_from_compendium"] = "";
     if (_.size(setSilent) > 0) {
       setAttrs(setSilent, PFConst.silentParams, function () {
         if (callUpdateSpell) {
           updateSpell(null, eventInfo);
         }
       });
     }
   });
 },
 migrateRepeatingMacros = function (callback){
   var done = _.once(function(){
     TAS.debug("leaving PFSpells.migrateRepeatingMacros");
     if(typeof callback === "function"){
       callback();
     }
   }),
   migrated = _.after(2,function(){
     resetCommandMacro();
     setAttrs({'migrated_spells_macrosv1':1},PFConst.silentParams,done);
   });
   //TAS.debug("at PFSpells.migrateRepeatingMacros");
   getAttrs(['migrated_spells_macrosv1'],function(v){
     if (parseInt(v.migrated_spells_macrosv1,10)!==1){
       PFMacros.migrateRepeatingMacros(migrated,'spells','npc-macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{NPC-Whisper}');
       PFMacros.migrateRepeatingMacros(migrated,'spells','macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{PC-Whisper}');
     } else {
       done();
     }
   });
 },
 migrate = function (callback) {
   PFMigrate.migrateSpells(function () {
     PFMigrate.migrateSpellRanges(function () {
       migrateRepeatingMacros (function() {
         if (typeof callback === "function") {
           callback();
         }
       });
     });
   });
 },

 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFSpells.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   recalcTotals = _.once(function () {
     //TAS.debug("at PFSpells.recalculate.recalcTotals");
     resetSpellsPrepared();
     resetSpellsTotals(null, null, null, silently);
     resetCommandMacro();
     //do not call because updateSpells already calls update options
     done();
   }),
   callUpdateSpells = _.once(function(){
     getAttrs(["use_spells"],function(v){
       if (parseInt(v.use_spells,10)){
         updateSpells(recalcTotals,silently);
       } else {
         done();
       }
     });
   });
   migrate(callUpdateSpells);
 },
 events = {
   //events for spell repeating rows
   repeatingSpellEventsPlayer: {
     "change:repeating_spells:DC_misc change:repeating_spells:slot change:repeating_spells:Concentration_misc change:repeating_spells:range change:repeating_spells:range_pick change:repeating_spells:CL_misc change:repeating_spells:SP_misc": [updateSpell],
     "change:repeating_spells:spell_lvlstr": [importFromCompendium],
     "change:repeating_spells:used": [resetSpellsTotals, updatePreparedSpellState],
     "change:repeating_spells:slot": [updateSpellSlot]
   },
   repeatingSpellEventsEither: {
     "change:repeating_spells:spellclass_number change:repeating_spells:spell_level": [updateSpell]
   },
   repeatingSpellAttackEvents: ["range_pick", "range", "range_numeric", "damage-macro-text", "damage-type", "sr", "savedc", "save", "spell-attack-type", "name"]

 },
 registerEventHandlers = function () {
   //SPELLS
   //all repeating spell updates
   var tempstr="";
   _.each(events.repeatingSpellEventsPlayer, function (functions, eventToWatch) {
     _.each(functions, function (methodToCall) {
       on(eventToWatch, TAS.callback(function eventRepeatingSpellsPlayer(eventInfo) {
         if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
           TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
           methodToCall(null, eventInfo);
         }
       }));
     });
   });
   _.each(events.repeatingSpellEventsEither, function (functions, eventToWatch) {
     _.each(functions, function (methodToCall) {
       on(eventToWatch, TAS.callback(function eventRepeatingSpellsEither(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         methodToCall(null, eventInfo);
       }));
     });
   });
   on("change:spellmenu_groupby_school change:spellmenu_show_uses change:spellclass-0-hide_unprepared change:spellclass-1-hide_unprepared change:spellclass-2-hide_unprepared change:spellclass-0-show_domain_spells change:spellclass-1-show_domain_spells change:spellclass-2-show_domain_spells", TAS.callback(function eventUnpreparedSpellCommandChange(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       resetCommandMacro();
     }
   }));
   on("remove:repeating_spells change:repeating_spells:spellclass_number change:repeating_spells:spell_level change:repeating_spells:slot change:repeating_spells:used change:repeating_spells:school change:repeating_spells:metamagic change:repeating_spells:isDomain change:repeating_spells:isMythic change:_reporder_repeating_spells", TAS.callback(function eventRepeatingSpellAffectingMenu(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       resetCommandMacro();
     }
   }));
   on("remove:repeating_spells change:repeating_spells:spellclass_number change:repeating_spells:spell_level", TAS.callback(function eventRepeatingSpellsTotals(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       resetSpellsTotals();
     }
   }));
   on("change:repeating_spells:create-attack-entry", TAS.callback(function eventcreateAttackEntryFromSpell(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       createAttackEntryFromRow(null,null,false,eventInfo);
     }
   }));
   tempstr = _.reduce(events.repeatingSpellAttackEvents,function(memo,attr){
     memo+="change:repeating_spells:"+attr+" ";
     return memo;
   },"");
   on(tempstr,	TAS.callback(function eventupdateAssociatedSpellAttack(eventInfo) {
     var attr;
     TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
     attr = SWUtils.getAttributeName(eventInfo.sourceAttribute);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (attr === 'attack-type')){
       updateAssociatedAttack(null,null,null,eventInfo);
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFSpells module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate: migrate,
   recalculate: recalculate,
   spellLevels: spellLevels,
   importFromCompendium: importFromCompendium,
   resetSpellsTotals: resetSpellsTotals,
   resetCommandMacro: resetCommandMacro,
   updatePreparedSpellState: updatePreparedSpellState,
   updateSpell: updateSpell,
   updateSpellSlot: updateSpellSlot,
   updateSpells: updateSpells,
   createAttackEntryFromRow: createAttackEntryFromRow,
   updateSpellsCasterAbilityRelated: updateSpellsCasterAbilityRelated,
   updateSpellsCasterLevelRelated: updateSpellsCasterLevelRelated
 };
}());
var PFSpellCasterClasses = PFSpellCasterClasses || (function () {
 'use strict';
 //the 3 spell classes at top of spells page
 var
 /**  returns whether a base spell level is filled in or not
 *@param {int} spellclassidx 0,1,2 sellcasting class
 *@param {function} callback - to call if exists
 *@param {function} noExistCallback - to call if not exists
 */
 ifSpellClassExists = function (spellclassidx, callback, noExistCallback) {
   getAttrs(["use_spells","spellclass-" + spellclassidx + "-exists"], function (v) {
     try {
       if (! parseInt(v.use_spells,10)){
         if (typeof noExistCallback === "function") {
           noExistCallback();
         }
       } else if (parseInt(v["spellclass-" + spellclassidx + "-exists"],10)) {
         if (typeof callback === "function") {
           callback();
         }
       } else {
         if (typeof noExistCallback === "function") {
           noExistCallback();
         }
       }
     } catch (err) {
       TAS.error("PFSpellCasterClasses.ifSpellClassExists", err);
       if (typeof noExistCallback === "function") {
         noExistCallback();
       }
     }
   });
 },
 /**  sets {spellclasses_multiclassed} to 1 if more than one spellclass-X-exists is 1
 *@param {nothing} dummy - only here so eventhandlers can call it, since spellclass index is in this position.
 *@param {eventinfo} eventInfo  unused eventinfo from 'on' method
 */
 updateMultiClassedCasterFlag = function (dummy, eventInfo, callback) {
   var done=_.once(function(){
     TAS.debug("leaving updateMultiClassedCasterFlag");
     if (typeof callback === "function"){
       callback();
     }
   });
   getAttrs(["spellclass-0-exists", "spellclass-1-exists", "spellclass-2-exists"], function (v) {
     var multiclassed = parseInt(v["spellclasses_multiclassed"], 10) || 0, setter={};
     if (((parseInt(v["spellclass-0-exists"], 10) || 0) + (parseInt(v["spellclass-1-exists"], 10) || 0) + (parseInt(v["spellclass-2-exists"], 10) || 0)) > 1) {
       if (!multiclassed) {
         setter.spellclasses_multiclassed= 1;
       }
     } else if (multiclassed) {
       setter.spellclasses_multiclassed= 0;
     }
     if(_.size(setter)>0){
       setAttrs(setter,PFConst.silentParams,done);
     } else {
       done();
     }
   });
 },
 /** updates the ranges at the top for this spellcasting class
 *@param {int} spellclassidx 0,1,2 the spell casting tab
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {bool} force if true update no matter if new ranges are same or not.
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateCasterRanges = function (spellclassidx, eventInfo, force, callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   },
   prefix = "spellclass-" + spellclassidx,
   lvlField = prefix + "-level-total",
   closeField = prefix + "-close",
   medField = prefix + "-medium",
   longField = prefix + "-long";
   getAttrs([lvlField, closeField, medField, longField], function (v) {
     var level = (parseInt(v[lvlField], 10) || 0),
     closeRng = parseInt(v[closeField], 10) || 0,
     medRng = parseInt(v[medField], 10) || 0,
     longRng = parseInt(v[longField], 10) || 0,
     ranges = {},
     setter = {},
     params = {};
     try {
       ranges = PFUtils.calculateSpellRanges(level);
       if (force || ranges.close !== closeRng || ranges.medium !== medRng || ranges["long"] !== longRng) {
         setter[closeField] = ranges.close;
         setter[medField] = ranges.medium;
         setter[longField] = ranges["long"];
       }
     } catch (err) {
       TAS.error("PFSpellCasterClasses.updateCasterRanges", err);
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
 },
 /** updateConcentration - updates concentration for spellclass
 *@param {int} classidx 0,1,2 the spellclass
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateConcentration = function (classidx, eventInfo, callback, silently) {
   //TAS.debug("at PFSpellCasterClasses.updateConcentration");
   SWUtils.updateRowTotal(["Concentration-" + classidx, "spellclass-" + classidx + "-level-total", "Concentration-" + classidx + "-mod", "Concentration-" + classidx + "-misc"], 0, null, false, callback, silently);
 },
 /*********************************** SPELLS PER DAY section *************************************/
 /** updateSaveDCs - update save DCs on left  column of Spells Per Day grid
 *@param {int} classidx 0,1,2 the spellclass
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateSaveDCs = function (classidx, eventInfo, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["Concentration-" + classidx + "-mod", "spellclass-" + classidx + "-level-0-savedc"], function (v) {
     var mod = parseInt(v["Concentration-" + classidx + "-mod"], 10) || 0,
     dcLvlZero = 10 + mod,
     currDC = parseInt(v["spellclass-" + classidx + "-level-0-savedc"], 10),
     setter = {},
     params = {},
     i;
     try {
       //if 0 is different then rest are different. if 0 is same, rest are same.
       if (currDC !== dcLvlZero || isNaN(currDC)) {
         setter["spellclass-" + classidx + "-level-0-savedc"] = dcLvlZero;
         for (i = 1; i < 10; i++) {
           setter["spellclass-" + classidx + "-level-" + i + "-savedc"] = dcLvlZero + i;
         }
       }
     } catch (err) {
       TAS.error("PFSpellCasterClasses.updateSaveDCs", err);
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
 },
 /** updateBonusSpells - updates Bonus Spells for the class
 * Uses attribute, not the attribute-mod. So it does not change with ability damage or penalties.
 *@param {number} classidx 0,1,2 the spellclass
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateBonusSpells = function (classidx, eventInfo, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   conAbility = "Concentration-" + classidx + "-ability";
   getAttrs([conAbility, "INT", "WIS", "CHA", "STR", "DEX", "CON"], function (v) {
     //eliminate the modifier, we just want @{INT} not @{INT-mod}
     var abilityName = PFUtils.findAbilityInString(v[conAbility]).replace("-mod", ""),
     abilityVal = parseInt(v[abilityName], 10),
     setter = {},
     params = {
       silent: true
     },
     bonusSpells,
     bonusName,
     i,
     prefix = "spellclass-" + classidx + "-level-";
     try {
       if (!isNaN(abilityVal)) {
         if (abilityVal >= 12) {
           for (i = 1; i < 10; i++) {
             bonusSpells = Math.floor(Math.max(Math.floor((abilityVal - 10) / 2) + 4 - i, 0) / 4);
             bonusName = prefix + i + "-bonus";
             setter[bonusName] = bonusSpells;
           }
         } else {
           for (i = 1; i < 10; i++) {
             bonusName = prefix + i + "-bonus";
             setter[bonusName] = 0;
           }
         }
       }
     } catch (err) {
       TAS.error("PFSpellCasterClasses.updateBonusSpells", err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, params, done);
       } else {
         done();
       }
     }
   });
 },
 /* updateMaxSpellsPerDay */
 updateMaxSpellsPerDay = function (classidx, spelllvl, callback, silently) {
   SWUtils.updateRowTotal(["spellclass-" + classidx + "-level-" + spelllvl + "-spells-per-day_max", "spellclass-" + classidx + "-level-" + spelllvl + "-class", "spellclass-" + classidx + "-level-" + spelllvl + "-bonus", "spellclass-" + classidx + "-level-" + spelllvl + "-misc"], 0, [], false, callback, silently);
 },
 /**  applyConditions - for condition deafened update {SpellFailureNote} on DEFENSE PAGE
 * note drain should have already been applied
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 applyConditions = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   //TAS.debug("at PFSpellCasterClasses.applyConditions");
   getAttrs(["condition-Deafened", "SpellFailureNote"], function (v) {
     var setter = {},
     params = {};
     try {
       if (v["condition-Deafened"] == "4") {
         if (!v["SpellFailureNote"]) {
           setter["SpellFailureNote"] = "Yes";
         }
       } else {
         if (v["SpellFailureNote"]) {
           setter["SpellFailureNote"] = "";
         }
       }
     } catch (err) {
       TAS.error("PFSpellCasterClasses.applyConditions", err);
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
 },
 recalcOneClass = function (spellClassIdx, callback, silently) {
   var done = _.once(function () {
     TAS.debug("leaving PFSpells.recalculate.recalcOneClass");
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneOne = _.after(4, done);
   //TAS.debug("at PFSpellCasterClasses.recalcOneClass");
   updateConcentration(spellClassIdx, null, doneOne, silently);
   updateSaveDCs(spellClassIdx, null, doneOne, silently);
   updateCasterRanges(spellClassIdx, null, true, doneOne, silently);
   updateBonusSpells(spellClassIdx, null, doneOne, silently);
 },
 /** updates {spellclass-X-level-total}, sets minimum of 1 if {spellclass-X-level} is > 0
 *@param {int} spellclassidx 0,1,2 the spell casting tab
 *@param {eventInfo} eventInfo unused eventinfo from 'on' method
 *@param {int} classlevel optional override for class level, use this if you know it and sheet attribute might not be updated yet.
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateCasterLevel = function (spellclassidx, eventInfo, classlevel, callback, silently) {
   var done = _.once(function () {
     TAS.debug("leaving updateCasterLevel " + spellclassidx);
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["spellclass-" + spellclassidx + "-level", "spellclass-" + spellclassidx + "-level-total", "spellclass-" + spellclassidx + "-level-misc", "buff_CasterLevel-total", "CasterLevel-Penalty", "spellclass-" + spellclassidx + "-exists"], function (v) {
     var baseLevel = classlevel || parseInt(v["spellclass-" + spellclassidx + "-level"], 10) || 0,
     totalLevel = parseInt(v["spellclass-" + spellclassidx + "-level-total"], 10) || 0,
     spellClassExists = parseInt(v["spellclass-" + spellclassidx + "-exists"], 10) || 0,
     casterlevel = 0,
     setter = {},
     recalcAfter=0,
     params = {};
     try {
       casterlevel = baseLevel + (parseInt(v["spellclass-" + spellclassidx + "-level-misc"], 10) || 0) + (parseInt(v["buff_CasterLevel-total"], 10) || 0) + (parseInt(v["CasterLevel-Penalty"], 10) || 0);
       //if has spells then minimum level is 1 no matter what minuses apply
       if (casterlevel <= 0) {
         if (baseLevel > 0) {
           casterlevel = 1;
         } else {
           casterlevel = 0;
         }
       }
       if (casterlevel !== totalLevel) {
         setter["spellclass-" + spellclassidx + "-level-total"] = casterlevel;
         if (totalLevel===0 && eventInfo){
           recalcAfter=1;
         }
       }
       if (baseLevel > 0) {
         if (spellClassExists === 0) {
           setter["spellclass-" + spellclassidx + "-exists"] = "1";
           recalcAfter=1;
         }
       } else if (spellClassExists === 1) {
         setter["spellclass-" + spellclassidx + "-exists"] = "0";
       }
     } catch (err) {
       TAS.error("PFSpellCasterClasses.updateCasterLevel", err);
     } finally {
       if (_.size(setter) > 0) {
         if (silently) {
           params = PFConst.silentParams;
         }
         setAttrs(setter, params, function(){
           if (recalcAfter){
             recalcOneClass(spellclassidx,done,silently);
           } else {
             done();
           }
         });
       } else {
         done();
       }
     }
   });
 },
 /** updates all 3 caster class levels, usually due to change in buffs or debuffs
 *@param {nothing} dummy - only here so eventhandlers can call it, since spellclass index is in this position.
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateCasterLevels = function (dummy, eventInfo, callback, silently) {
   updateCasterLevel(0, eventInfo, 0, callback, silently);
   updateCasterLevel(1, eventInfo, 0, callback, silently);
   updateCasterLevel(2, eventInfo, 0, callback, silently);
 },
 /** sets {spellclass-X-name} and {spellclass-X-level} from the class dropdown {spellclass-X}
 * called when the class dropdown is changed.
 *@param {int} spellclassidx 0,1,2 the spell casting tab
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 setCasterClassFromDropdown = function (spellclassidx, eventInfo, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   spellclassdropdown = "spellclass-" + spellclassidx,
   spellclasslevel = "spellclass-" + spellclassidx + "-level";
   getAttrs([spellclassdropdown, spellclasslevel], function (va) {
     var classidx = parseInt(va[spellclassdropdown], 10),
     currClassLevel = parseInt(va[spellclasslevel], 10),
     spellclassname,
     classname,
     classlevel;
     try {
       if (isNaN(classidx) || !va[spellclassdropdown] || va[spellclassdropdown] == "-1") {
         done();
         return;
       }
       spellclassname = "spellclass-" + spellclassidx + "-name";
       classname = "class-" + classidx + "-name";
       classlevel = "class-" + classidx + "-level";
       //if race indicated: use race and HD
       if (classidx === 6) {
         classname = "race";
         classlevel = "npc-hd-num";
       }
       getAttrs([classname, classlevel, spellclassname], function (v) {
         var setter = {},
         setAny = 0,
         updateLevel = 0,
         newClassLevel = parseInt(v[classlevel], 10) || 0;
         try {
           if (currClassLevel !== newClassLevel || isNaN(currClassLevel)) {
             setter[spellclasslevel] = newClassLevel;
             updateLevel = 1;
           }
           if (v[classname] && v[classname] !== v[spellclassname]) {
             setter[spellclassname] = v[classname];
           }

         } catch (err) {
           TAS.error("PFSpellCasterClasses.setCasterClassFromDropdown", err);
         } finally {
           if (_.size(setter) > 0) {
             setAttrs(setter, {
               silent: true
             }, done);
             if (updateLevel) {
               updateCasterLevel(spellclassidx, eventInfo, newClassLevel);
             }
           } else {
             done();
           }
         }
       });
     } catch (errOuter) {
       TAS.error("PFSpellCasterClasses.setCasterClassFromDropdown outer", errOuter);
       done();
     }
   });
 },
 /** update level on SPELL page when updated on CLASS page, but not vice versa
 *@param {int} classidx 0..6 the row on the CLASS GRID starting with 0 to grab level from, or 6 if {npc-hd-num}
 *@param {eventinfo} eventInfo unused eventinfo from 'on' method
 *@param {bool} force if true update no matter if new ranges are same or not.
 *@param {function} callback - to call when done.
 *@param {bool} silently if true update with PFConst.silentParams
 */
 updateCasterFromClassLevel = function (classidx, eventInfo, force, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   spellclassdropdown0 = "spellclass-0",
   spellclassdropdown1 = "spellclass-1",
   spellclassdropdown2 = "spellclass-2";
   if (classidx === "npc-hd-num") {
     classidx = 6;
   } else {
     classidx = parseInt(classidx, 10) || 0;
   }
   getAttrs([spellclassdropdown0, spellclassdropdown1, spellclassdropdown2], function (va) {
     var spellclassidx,
     spellclasslevelField,
     classlevelField,
     prefix,
     classNameField;
     if (parseInt(va[spellclassdropdown0], 10) === classidx) {
       spellclassidx = 0;
     } else if (parseInt(va[spellclassdropdown1], 10) === classidx) {
       spellclassidx = 1;
     } else if (parseInt(va[spellclassdropdown2], 10) === classidx) {
       spellclassidx = 2;
     } else {
       return;
     }
     prefix = "spellclass-" + spellclassidx;
     spellclasslevelField = prefix + "-level";
     classlevelField = "class-" + classidx + "-level";
     classNameField = "class-" + classidx + "-name";
     getAttrs([spellclasslevelField, classlevelField, classNameField], function (v) {
       var setter = {},
       newCasterLevel = parseInt(v[classlevelField], 10) || 0,
       currCasterLevel = parseInt(v[spellclasslevelField], 10);
       if (newCasterLevel !== currCasterLevel || isNaN(currCasterLevel) || force) {
         setter[spellclasslevelField] = newCasterLevel;
         setter[prefix + "-name"] = v[classNameField];
         setAttrs(setter, {
           silent: true
         });
         updateCasterLevel(classidx, eventInfo, newCasterLevel);
       }
     });
   });
 },
 migrate = function(callback,oldversion){
   //TAS.debug("At PFSpellCasterClasses.migrate");
   PFMigrate.migrateUsesSpellFlag(callback);
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("leaving PFSpellCasterClasses.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   recalcTopSection = function (callback, silently) {
     var done = _.once(function () {
       TAS.debug("leaving PFSpellCasterClasses.recalculate.recalcTopSection");
       if (typeof callback === "function") {
         callback();
       }
     }),
     doneOne = _.after(3, done);
     //TAS.debug("at PFSpellCasterClasses.recalculate.recalcTopSection");
     _.each(PFConst.spellClassIndexes, function (spellClassIdx) {
       try {
         setCasterClassFromDropdown(spellClassIdx, null, function () {
           updateCasterLevel(spellClassIdx, null, 0, function () {
             ifSpellClassExists(spellClassIdx, function () {
               recalcOneClass(spellClassIdx,doneOne,silently);
             }, doneOne);
           }, silently);
         }, silently);
       } catch (err) {
         TAS.error("PFSpellCasterClasses.recalculate_recalcTopSection", err);
         doneOne();
       }
     });
   },
   finishAndLeave = _.once(function () {
     updateMultiClassedCasterFlag(null,null,function(){
       PFSpells.recalculate(done, silently, oldversion);
     });
   }),
   callTopSection = _.once(function () {
     recalcTopSection(finishAndLeave, silently);
   }),
   callApplyConditions = _.once(function () {
     applyConditions(callTopSection, silently);
   });
   migrate(function(){
     callApplyConditions();
   },oldversion);
 },
 events = {
   // events for updates to top of class page, each one calls isSpellClassExists
   spellcastingClassEventsAuto: {
     "change:concentration-REPLACE-mod": [updateBonusSpells, updateSaveDCs, updateConcentration, PFSpells.updateSpellsCasterAbilityRelated],
     "change:spellclass-REPLACE-level-total": [updateConcentration, updateCasterRanges, PFSpells.updateSpellsCasterLevelRelated],
     "change:spellclass-REPLACE-SP-mod": [PFSpells.updateSpellsCasterLevelRelated]
   },
   spellcastingClassEventsPlayer: {
     "change:concentration-REPLACE-misc": [updateConcentration, PFSpells.updateSpellsCasterLevelRelated],
     "change:concentration-REPLACE-def": [PFSpells.updateSpellsCasterLevelRelated]
   },
   // events for updates to top of class page even if no spellcasting class exists
   spellcastingClassEventsIgnoreLevel: {
     "change:spellclass-REPLACE-level-misc": [updateCasterLevel],
     "change:spellclass-REPLACE": [setCasterClassFromDropdown],
     "change:spellclass-REPLACE-level": [updateCasterLevel, updateMultiClassedCasterFlag],
     "change:buff_CasterLevel-total change:condition-Drained change:CasterLevel-Penalty": [updateCasterLevels]
   },
   //events for updateBonusSpells section CLASSIDX is the 0-2 classes, SPELLLEVEL is 0-9
   spellcastingClassEventsPerSpellLevel: "change:spellclass-CLASSIDX-level-SPELLLEVEL-class change:spellclass-CLASSIDX-level-SPELLLEVEL-bonus change:spellclass-CLASSIDX-level-SPELLLEVEL-misc"
 },
 registerEventHandlers = function () {
   //spellclass section (3 tabs at top of spell page)
   _.each(PFConst.spellClassIndexes, function (spellClassIdx) {
     var numberIdx = parseInt(spellClassIdx, 10) || 0;
     on("change:Concentration-" + numberIdx + "-ability", TAS.callback(function eventChangeSpellDropdown(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       PFUtilsAsync.setDropdownValue("Concentration-" + numberIdx + "-ability", "Concentration-" + numberIdx + "-mod");
     }));
     _.each(events.spellcastingClassEventsPlayer, function (functions, event) {
       var eventToWatch = event.replace(/REPLACE/g, numberIdx);
       _.each(functions, function (methodToCall) {
         on(eventToWatch, TAS.callback(function eventSpellcasterClassSpecificUpdatePlayerOnly(eventInfo) {
           if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
             TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
             ifSpellClassExists(numberIdx, function () {
               methodToCall(numberIdx, eventInfo);
             });
           }
         }));
       });
     });
     _.each(events.spellcastingClassEventsAuto, function (functions, event) {
       var eventToWatch = event.replace(/REPLACE/g, numberIdx);
       _.each(functions, function (methodToCall) {
         on(eventToWatch, TAS.callback(function eventSpellcasterClassSpecificUpdateAuto(eventInfo) {
           if (eventInfo.sourceType === "sheetworker") {
             TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
             ifSpellClassExists(numberIdx, function () {
               methodToCall(numberIdx, eventInfo);
             });
           }
         }));
       });
     });
     //ignore level means do not call "ifSpellClassExists" first
     _.each(events.spellcastingClassEventsIgnoreLevel, function (functions, event) {
       var eventToWatch = event.replace(/REPLACE/g, numberIdx);
       _.each(functions, function (methodToCall) {
         on(eventToWatch, TAS.callback(function eventSpellcasterClassUpdate(eventInfo) {
           TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
           methodToCall(numberIdx, eventInfo);
         }));
       });
     });
     //spells per day
     _.each(PFSpells.spellLevels, function (spellLevel) {
       var spellNumber = parseInt(spellLevel, 10),
       eventToWatch = events.spellcastingClassEventsPerSpellLevel.replace(/CLASSIDX/g, numberIdx).replace(/SPELLLEVEL/g, spellNumber);
       on(eventToWatch, TAS.callback(function eventSpellsPerDay(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         ifSpellClassExists(numberIdx, function () {
           updateMaxSpellsPerDay(numberIdx, spellNumber);
         });
       }));
     });
   }); //end of spell classes
 };
 registerEventHandlers();
 console.log(PFLog.l + 'PFSpellCasterClasses module loaded' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   ifSpellClassExists: ifSpellClassExists,
   applyConditions: applyConditions,
   setCasterClassFromDropdown: setCasterClassFromDropdown,
   updateBonusSpells: updateBonusSpells,
   updateCasterFromClassLevel: updateCasterFromClassLevel,
   updateCasterLevel: updateCasterLevel,
   updateCasterLevels: updateCasterLevels,
   updateCasterRanges: updateCasterRanges,
   updateConcentration: updateConcentration,
   updateMaxSpellsPerDay: updateMaxSpellsPerDay,
   updateMultiClassedCasterFlag: updateMultiClassedCasterFlag,
   updateSaveDCs: updateSaveDCs,
   recalculate: recalculate
 };
}());
var PFClassRaceGrid = PFClassRaceGrid || (function () {
 'use strict';
 var classColumns = ["hp", "fchp", "skill", "fcskill", "fcalt", "bab", "Fort", "Ref", "Will", "level"],
 raceColumns = ['hp', 'bab', 'Fort', 'Ref', 'Will', 'hd-num'],
 classRows = ["0", "1", "2", "3", "4", "5"],

 setMulticlassed =function(){
   var fields =['multiclassed','class-0-level','class-1-level','class-2-level','class-3-level','class-4-level','class-5-level','npc-hd-num'];
   //TAS.debug("at PFClassRaceGrid.setMulticlassed");
   getAttrs(fields,function(v){
     var isMulti=parseInt(v.multiclassed,10)||0,
     totalWLevels=Math.min(1,parseInt(v['class-0-level'],10)||0) + Math.min(1,parseInt(v['class-1-level'],10)||0) +
      Math.min(1,parseInt(v['class-2-level'],10)||0) + Math.min(1,parseInt(v['class-3-level'],10)||0) +
      Math.min(1,parseInt(v['class-4-level'],10)||0) + Math.min(1,parseInt(v['class-5-level'],10)||0) +
      Math.min(1,parseInt(v['hd-num'],10)||0);
     //TAS.debug("PFClassRaceGrid.setMulticlassed, "+ totalWLevels +" rows have levels");
     if (totalWLevels > 1){
       if (!isMulti){
         setAttrs({multiclassed:1});
       }
     } else if (isMulti){
       setAttrs({multiclassed:0});
     }
   });
 },
 /** PFClassRaceGrid.updateClassInformation Updates totals at bottom of Class Information grid
 *@param {string} col end of name of attribute that references column, must be in classColumns or raceColumns
 *@param {function} callback optional call when finished updating
 *@param {bool} silently if true then call setAttrs with PFConst.silentParams
 */
 updateClassInformation = function (col, callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   },
   updateClassInformationInner = function (col, callback, silently) {
     var getFields = [],
     totalColName, col0Name, col1Name, col2Name, col3Name, col4Name, col5Name,
     col0NameTwo,
     col1NameTwo,
     col2NameTwo,
     col3NameTwo,
     col4NameTwo,
     col5NameTwo;

     if (col === "fchp") {
       col = "hp";
     } else if (col === "hd-num") {
       col = "level";
     }

     col0Name = "class-0-" + col;
     col1Name = "class-1-" + col;
     col2Name = "class-2-" + col;
     col3Name = "class-3-" + col;
     col4Name = "class-4-" + col;
     col5Name = "class-5-" + col;

     totalColName = (col === "bab" || col === "level") ? col : "total-" + col;
     getFields = [totalColName, col0Name, col1Name, col2Name, col3Name, col4Name, col5Name];
     if (col !== "skill") {
       if (col === "hp") {
         col0NameTwo = "class-0-fc" + col;
         col1NameTwo = "class-1-fc" + col;
         col2NameTwo = "class-2-fc" + col;
         col3NameTwo = "class-3-fc" + col;
         col4NameTwo = "class-4-fc" + col;
         col5NameTwo = "class-5-fc" + col;
         getFields = getFields.concat([col0NameTwo, col1NameTwo, col2NameTwo, col3NameTwo, col4NameTwo, col5NameTwo]);
       }
       //add npc values
       switch (col) {
         case 'bab':
         case 'Fort':
         case 'Will':
         case 'Ref':
           getFields = getFields.concat(["npc-" + col]);
           break;
         case 'hp':
           getFields = getFields.concat(["NPC-HP"]);
           break;
         case 'level':
           getFields = getFields.concat(["npc-hd-num"]);
           break;
       }
       //TAS.debug(getFields);
       SWUtils.updateRowTotal(getFields, 0, [], 0, done, silently);
     } else {
       col0NameTwo = "class-0-level";
       col1NameTwo = "class-1-level";
       col2NameTwo = "class-2-level";
       col3NameTwo = "class-3-level";
       col4NameTwo = "class-4-level";
       col5NameTwo = "class-5-level";
       getFields = getFields.concat([col0NameTwo, col1NameTwo, col2NameTwo, col3NameTwo, col4NameTwo, col5NameTwo]);
       //TAS.debug(getFields);
       getAttrs(getFields, function (v) {
         var setter = {},
         currTot=0,
         params = {},
         tot=0;
         tot = Math.floor((parseFloat(v[col0Name], 10) || 0) * (parseInt(v[col0NameTwo], 10) || 0) + (parseFloat(v[col1Name], 10) || 0) * (parseInt(v[col1NameTwo], 10) || 0) + (parseFloat(v[col2Name], 10) || 0) * (parseInt(v[col2NameTwo], 10) || 0) + (parseFloat(v[col3Name], 10) || 0) * (parseInt(v[col3NameTwo], 10) || 0) + (parseFloat(v[col4Name], 10) || 0) * (parseInt(v[col4NameTwo], 10) || 0) + (parseFloat(v[col5Name], 10) || 0) * (parseInt(v[col5NameTwo], 10) || 0));
         currTot = parseInt(v[totalColName], 10);
         if (isNaN(currTot) || tot !== currTot) {
           setter[totalColName] = tot;
           if (silently) {
             params = PFConst.silentParams;
           }
           setAttrs(setter, params, done);
         } else {
           done();
         }
       });
     }
   };
   //TAS.debug("at PFClassRaceGrid.updateClassInformation: " + col);
   //no sum for hd
   if (!col || col === "hd") {
     TAS.warn("at updateClassInformation called with bad column:"+col);
     done();
     return;
   }
   if ((/^npc/i).test(col)) {
     col = col.slice(4);
   }
   if(col==="hp"){
     getAttrs(["auto_calc_hp"],function(v){
       if (parseInt(v["auto_calc_hp"],10)){
         done();
       } else {
         updateClassInformationInner(col,done,silently);
       }
     });
   } else {
     updateClassInformationInner(col,done,silently);
   }

 },
 autoCalcClassHpGrid = function(callback,silently,eventInfo){
   var done = _.once(function(){ if (typeof callback === "function") {
     TAS.debug("Leaving updateClassHpGrid");
     callback();}
   }),
   fields=["auto_calc_hp", "autohp_percent","maxhp_lvl1","is_npc","set_pfs",
     "total-hp", "NPC-HP", "npc-hd-num","npc-hd",
     "class-0-hp","class-0-level","class-0-hd","class-0-fchp",
     "class-1-hp","class-1-level","class-1-hd","class-1-fchp",
     "class-2-hp","class-2-level","class-2-hd","class-2-fchp",
     "class-3-hp","class-3-level","class-3-hd","class-3-fchp",
     "class-4-hp","class-4-level","class-4-hd","class-4-fchp",
     "class-5-hp","class-5-level","class-5-hd","class-5-fchp"
     ];
   getAttrs(fields,function(v){
     var maxFirst =0, mult=1, isPFS=0, setter={}, isNPC=0, loudSetter={}, currrowhp=0, rowhp=0, level=0, hd=0, totalhp=0, rowUpdated = -1, matches;
     try {
       //TAS.debug("at autocalc hp",v);
       if (parseInt(v.auto_calc_hp,10)){
         isPFS = parseInt(v.set_pfs,10)||0;
         isNPC = parseInt(v.is_npc,10)||0;
         isPFS = isPFS && (!isNPC);
         mult= PFUtils.getAutoHPPercentMultiplier(v.autohp_percent);
         maxFirst=parseInt(v.maxhp_lvl1,10)||0;
         if (eventInfo && eventInfo.sourceAttribute){
           matches = eventInfo.sourceAttribute.match(/(\d)/);
           if (matches && matches[1]) {
             rowUpdated = parseInt(matches[1],10)||0;
           } else if ((/NPC/i).test(eventInfo.sourceAttribute)){
             rowUpdated = 6;
           }
         }
         //TAS.debug("at autocalc hp, rowupdated is:" + rowUpdated);
         level = parseInt(v['npc-hd-num'],10)||0;
         hd = parseInt(v['npc-hd'],10)||0;
         currrowhp = parseInt(v['NPC-HP'],10)||0;
         if ((level >0 && hd > 0) || !((maxFirst===0 && rowUpdated!==-1 && rowUpdated !== 6))){
           //first do NPC.
           rowhp = PFUtils.getAvgHP(level,hd,mult,maxFirst,isPFS);
           totalhp += rowhp;
           //TAS.debug("adding: "+rowhp);
           if (rowhp !== currrowhp){
             setter['NPC-HP']=rowhp;
           }
           if (maxFirst){ maxFirst = 0;}
         } else {
           totalhp += currrowhp;
           //TAS.debug("adding "+currrowhp);
         }
         _.each(PFClassRaceGrid.classRows,function(rowindex){
           var fchp=0;
           rowhp=0;
           level = parseInt(v["class-"+rowindex+"-level"],10)||0;
           hd = parseInt(v["class-"+rowindex+"-hd"],10)||0;
           currrowhp = parseInt(v["class-"+rowindex+"-hp"],10)||0;
           fchp =  parseInt(v["class-"+rowindex+"-fchp"],10)||0;
           if ((level >0 && hd > 0)||(maxFirst===0 && rowUpdated!==-1 && rowUpdated !== parseInt(rowindex,10))){
             rowhp = PFUtils.getAvgHP(level,hd,mult,maxFirst) ;
             //TAS.debug("adding "+rowhp +" + " + fchp);
             totalhp += rowhp + fchp;
             if (rowhp !== currrowhp){
               setter["class-"+rowindex+"-hp"]=rowhp;
             }
             if (maxFirst){ maxFirst = 0;}
           } else {
             totalhp += currrowhp + fchp;
             //TAS.debug"adding "+currrowhp +" + " + fchp);
           }
         });
         if (totalhp !== parseInt(v['total-hp'],10)){
           loudSetter["total-hp"]= totalhp;
         }
       }
     } catch (err){
       TAS.error("autoCalcClassHpGrid",err);
     } finally {
       if (_.size(loudSetter)>0){
         setAttrs(loudSetter);
       }
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     }
   });

 },
 migrate = function (callback){
   callback();
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFClassRaceGrid.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   numcols = classColumns.length,
   columnDone = _.after(numcols, function(){
     autoCalcClassHpGrid(done,silently);
   });
   _.each(classColumns, function (col) {
     PFClassRaceGrid.updateClassInformation(col, columnDone, silently);
   });
   setMulticlassed();
 },
 events = {
   basehp: "change:auto_calc_hp change:autohp_percent change:maxhp_lvl1 ",
   racialhp: "change:npc-hd-num change:npc-hd ",
   perClassRowhp: "change:class-REPLACE-level change:class-REPLACE-hd "
 },
 registerEventHandlers = function () {
   var tempString="";
   _.each(classColumns, function (col) {
     var eventsToWatch = _.map(classRows, function (row) {
       return "change:class-" + row + "-" + col;
     }).join(" ");
     on(eventsToWatch, TAS.callback(function eventTotalClassInformation(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && eventInfo.sourceAttribute.slice(-2)==='hp'  )) {
         updateClassInformation(col, eventInfo);
       }
     }));
     if (col === "level") {
       on(eventsToWatch, TAS.callback(function eventTotalClassInformationLevel(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
           updateClassInformation("skill", eventInfo);
           setMulticlassed();
         }
       }));
     }
   });
   _.each(raceColumns, function (col) {
     on("change:npc-" + col, TAS.callback(function eventUpdateRacialRow(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && eventInfo.sourceAttribute.slice(-2)==='hp')) {
         if (col === 'hd-num') {
           updateClassInformation('level', eventInfo);
         } else {
           updateClassInformation(col, eventInfo);
         }
       }
     }));
   });
   _.each(classRows,function(row){
     tempString = events.perClassRowhp.replace(/REPLACE/g,row);
     on(tempString,TAS.callback(function eventUpdateClassHitPoints(eventInfo){
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         autoCalcClassHpGrid(null,null,eventInfo);
         if ( (/level/i).test(eventInfo.sourceAttribute) ) {
           PFSpells.updateCasterFromClassLevel(parseInt(row, 10), eventInfo);
         }
       }
     }));
   });
   on(events.racialhp,TAS.callback(function eventUpdateRacialHitPoints(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       autoCalcClassHpGrid(null,null,eventInfo);
       if (eventInfo.sourceAttribute === "npc-hd-num"){
         PFSpells.updateCasterFromClassLevel(6, eventInfo);
       }
     }
   }));
   on(events.basehp,TAS.callback(function eventHPAutoCalcSwitches(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       autoCalcClassHpGrid();
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFClassRaceGrid module loaded  ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   events: events,
   migrate: migrate,
   recalculate: recalculate,
   classColumns: classColumns,
   classRows: classRows,
   autoCalcClassHpGrid: autoCalcClassHpGrid,
   updateClassInformation: updateClassInformation
 };
}());
var PFSkills = PFSkills || (function () {
 'use strict';
 var regularCoreSkills = ["Appraise", "Acrobatics", "Bluff", "Climb", "Diplomacy", "Disable-Device", "Disguise", "Escape-Artist", "Fly", "Handle-Animal", "Heal", "Intimidate", "Linguistics", "Perception", "Ride", "Sense-Motive", "Sleight-of-Hand", "Spellcraft", "Stealth", "Survival", "Swim", "Use-Magic-Device"],
 regularBackgroundSkills = ["Appraise", "Handle-Animal", "Linguistics", "Sleight-of-Hand"],
 regularAdventureSkills = ["Acrobatics", "Bluff", "Climb", "Diplomacy", "Disable-Device", "Disguise", "Escape-Artist", "Fly", "Heal", "Intimidate", "Perception", "Ride", "Sense-Motive", "Sleight-of-Hand", "Spellcraft", "Stealth", "Survival", "Swim", "Use-Magic-Device"],
 regularBackgroundSkillsPlusKnow = regularBackgroundSkills.concat(["Knowledge-Engineering", "Knowledge-Geography", "Knowledge-History", "Knowledge-Nobility"]).sort(),
 regularAdventurePlusKnow = regularAdventureSkills.concat(["Knowledge-Arcana", "Knowledge-Dungeoneering", "Knowledge-Local", "Knowledge-Nature", "Knowledge-Planes", "Knowledge-Religion"]).sort(),
 //number that is appended to 10 versions of skills with subskills.
 skillAppendNums = ["", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
 //same but for misc-skill
 miscSkillAppendNums = ["-0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"],
 coreSkillsWithFillInNames = ["Craft", "Misc-Skill", "Perform", "Profession"],
 backgroundOnlySkillsWithFillinNames = ["Artistry", "Lore"],
 skillsWithFillInNames = coreSkillsWithFillInNames.concat(backgroundOnlySkillsWithFillinNames).sort(),
 backgroundOnlySkills = SWUtils.cartesianAppend(backgroundOnlySkillsWithFillinNames, skillAppendNums),
 knowledgeSubSkills = ["Arcana", "Dungeoneering", "Engineering", "Geography", "History", "Local", "Nature", "Nobility", "Planes", "Religion"],
 coreSkillsWithSubSkills = coreSkillsWithFillInNames.concat(["Knowledge"]).sort(),
 skillsWithSubSkills = skillsWithFillInNames.concat(["Knowledge"]).sort(),
 knowledgeSkillAppends = _.map(knowledgeSubSkills, function (subskill) {
   return "-" + subskill;
 }),
 //for each skill array of the possible skills {"Craft":["Craft","Craft2"...],"Perform":["Perform","Perform2"...] }
 subskillArrays = _.reduce(skillsWithSubSkills, function (memo, skill) {
   var appenders = (skill === "Misc-Skill") ? miscSkillAppendNums : (skill === "Knowledge") ? knowledgeSkillAppends : skillAppendNums;
   memo[skill] = SWUtils.cartesianAppend([skill], skillAppendNums);
   return memo;
 }, {}),
 backgroundCoreSkills = regularBackgroundSkillsPlusKnow.concat(subskillArrays["Craft"]).concat(subskillArrays["Perform"]).concat(subskillArrays["Profession"]).concat(["Misc-Skill-5", "Misc-Skill-6", "Misc-Skill-7", "Misc-Skill-8", "Misc-Skill-9"]).sort(),
 adventureSkills = regularAdventurePlusKnow.concat(["Misc-Skill-0", "Misc-Skill-1", "Misc-Skill-2", "Misc-Skill-3", "Misc-Skill-4"]).sort(),

 checkRTArray = ["-ReqTrain", "-ranks"],
 baseGenMacro = "/w \"@{character_name}\" &{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} ",
 skillHeaderMacro = "{{name=^{REPLACELOWER} ^{skills} }} ",
 npcSkillHeaderMacro = "{{name=^{npc} ^{REPLACELOWER} ^{skills} }} ",
 //  1 is the normal size modifier in size_skill, 2 is size_skill_double
 sizeSkills = {
   "Fly": 1,
   "Stealth": 2,
   "CS-Stealth": 2
 },
 //these are for building the macros
 knowledgeSubSkillsTranslateKeys = _.map(knowledgeSubSkills, function (key) {
   return key.toLowerCase();
 }),
 skillsWithSpaces = ["disable device", "escape artist", "sense motive", "handle animal", "use magic device", "sleight of hand"],
 knowledgeSkills = _.map(knowledgeSubSkills, function (subskill) {
   return "Knowledge-" + subskill;
 }),
 backgroundSkills = backgroundCoreSkills.concat(backgroundOnlySkills).sort(),
 allCoreSkills = adventureSkills.concat(backgroundCoreSkills).sort(),
 consolidatedSkills = ["CS-Acrobatics", "CS-Athletics", "CS-Finesse", "CS-Influence", "CS-Nature", "CS-Perception", "CS-Performance", "CS-Religion", "CS-Society", "CS-Spellcraft", "CS-Stealth", "CS-Survival"],
 allNonFillInSkills = regularCoreSkills.concat(knowledgeSkills).concat(consolidatedSkills).sort(),
 nonMiscFillInSkillsInstances = SWUtils.cartesianAppend(["Craft", "Perform", "Profession", "Artistry", "Lore"], skillAppendNums),
 miscFillInSkillsInstances =SWUtils.cartesianAppend(["Misc-Skill"], miscSkillAppendNums),
 allFillInSkillInstances = nonMiscFillInSkillsInstances.concat(miscFillInSkillsInstances).sort(),
 allTheSkills = allNonFillInSkills.concat(allFillInSkillInstances).sort(),
 coreSkillAbilityDefaults = {
   "Acrobatics": "dex",
   "Appraise": "int",
   "Bluff": "cha",
   "Climb": "str",
   "Craft": "int",
   "Diplomacy": "cha",
   "Disable-Device": "dex",
   "Disguise": "cha",
   "Escape-Artist": "dex",
   "Fly": "dex",
   "Handle-Animal": "cha",
   "Heal": "wis",
   "Intimidate": "cha",
   "Knowledge-Arcana": "int",
   "Knowledge-Dungeoneering": "int",
   "Knowledge-Engineering": "int",
   "Knowledge-Geography": "int",
   "Knowledge-History": "int",
   "Knowledge-Local": "int",
   "Knowledge-Nature": "int",
   "Knowledge-Nobility": "int",
   "Knowledge": "int",
   "Knowledge-Planes": "int",
   "Knowledge-Religion": "int",
   "Linguistics": "int",
   "Perception": "wis",
   "Perform": "cha",
   "Profession": "wis",
   "Ride": "dex",
   "Sense-Motive": "wis",
   "Sleight-of-Hand": "dex",
   "Spellcraft": "int",
   "Stealth": "dex",
   "Survival": "wis",
   "Swim": "str",
   "Use-Magic-Device": "cha"
 },

 defaultSkillMacro='&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{REPLACELOWER}}} {{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}} @{REPLACE-ut} @{skill_options} @{REPLACE-cond-notes} {{generic_note=@{REPLACE-note}}}',
 defaultSkillMacroMap = {
   '&{template:':{'current':'pf_generic}'},
   '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
   '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
   '{{color=':{'current':'@{rolltemplate_color}}}'},
   '{{header_image=':{'current':'@{header_image-pf_generic-skill}}}','old':['@{header_image-pf_generic}}}']},
   '{{character_name=':{'current':'@{character_name}}}'},
   '{{character_id=':{'current':'@{character_id}}}'},
   '{{subtitle}}':{'current':'{{subtitle}}'},
   '{{name=':{'current':'^{REPLACELOWER}}}','old':['REPLACE}}','@{REPLACE-name}}}','^{REPLACE}}}']},
   '{{Check=':{'current':'[[ @{skill-query} + [[ @{REPLACE} ]] ]]}}','old':['[[ 1d20 + [[ @{REPLACE} ]] ]]}}'],'replacements':[{'from':'1d20','to':'@{skill-query}'}]},
   '@{REPLACE-ut}':{'current':'@{REPLACE-ut}'},
   '@{skill_options}':{'current':'@{skill_options}'},
   '@{REPLACE-cond-notes}':{'current':'@{REPLACE-cond-notes}'},
   '{{generic_note=':{'current':'@{REPLACE-note}}}'}
 },
 defaultFillInSkillMacro='&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{REPLACELOWERREMOVENUMBER} @{REPLACE-name}}} {{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}} @{REPLACE-ut} @{skill_options} @{REPLACE-cond-notes} {{generic_note=@{REPLACE-note}}}',
 defaultFillInSkillMacroMap = _.extend(_.clone(defaultSkillMacroMap),{
   '{{name=':{'current':'^{REPLACELOWERREMOVENUMBER} (@{REPLACE-name})}}','old':['REPLACEREMOVENUMBER (@{REPLACE-name})}}','REPLACE}}','@{REPLACE-name}}}'],'replacements':[{'from':'REPLACEREMOVENUMBER','to':'^{REPLACELOWERREMOVENUMBER}'}]}
 }),
 defaultMiscSkillMacro='&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{REPLACE}}} {{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}} @{REPLACE-ut} @{skill_options} @{REPLACE-cond-notes} {{generic_note=@{REPLACE-note}}}',
 defaultMiscSkillMacroMap = _.extend(_.clone(defaultSkillMacroMap),{
   '{{name=':{'current':'@{REPLACE}}}','old':['Misc-Skill (@{REPLACE-name})}}']}
 }),
 defaultSkillDeletedMacroAttrs=['{{check=[[ @{skill-query} + [[ @{REPLACE} ]] ]]}}'],
 defaultSkillAttrName='REPLACE-macro',
 keysNeedingReplacing = ['@{REPLACE-cond-notes}','@{REPLACE-ut}'],
 valsNeedingReplacing = ['@{REPLACE-cond-notes}','@{REPLACE-ut}','{{check=','{{generic_note=','{{name='],
 migrateMacros =function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFSkills.migrateMacros");
     if (typeof callback === "function"){
       callback();
     }
   }),
   doneOne = _.after(3,function(){
     setAttrs({'migrated_skill_macrosv1':1},PFConst.silentParams,done);
   });
   try {
     TAS.debug("at PFSkills.migrateMacros");
     getAttrs(['migrated_skill_macrosv1'],function(v){
       if(! parseInt(v.migrated_skill_macrosv1,10)) {
         //TAS.debug"migrateMacros, calling migrateStaticMacrosMult on regular skills ");
         PFMacros.migrateStaticMacrosMult(doneOne,defaultSkillAttrName,defaultSkillMacro,defaultSkillMacroMap,null,allNonFillInSkills,keysNeedingReplacing,valsNeedingReplacing,false);
         PFMacros.migrateStaticMacrosMult(doneOne,defaultSkillAttrName,defaultFillInSkillMacro,defaultFillInSkillMacroMap,null,nonMiscFillInSkillsInstances,keysNeedingReplacing,valsNeedingReplacing,true);
         PFMacros.migrateStaticMacrosMult(doneOne,defaultSkillAttrName,defaultMiscSkillMacro,defaultMiscSkillMacroMap,null,miscFillInSkillsInstances,keysNeedingReplacing,valsNeedingReplacing,true);
       } else {
         done();
       }
     });
   } catch (err){
     done();
   }
 },

 /**appendToSubSkills - util to append the string to all 10 names of one type of skill (perform, craft, knowledge, etc)
 * adds the numbers from 0-9 or 1-10 or knowledge, then appends the string , to generate all 10 versions.
 * @param {string} skilllist The name of the skill in, member of skillsWithSubSkills
 * @param {string} appendToEnd The string to append.
 * @returns {Array[string]} array of skill names
 */
 appendToSubSkills = function (skilllist, appendToEnd) {
   return _.reduce(skilllist, function (memo, skill) {
     var appendnums = (skill === "Misc-Skill") ? miscSkillAppendNums : (skill === "Knowledge") ? knowledgeSkillAppends : skillAppendNums,
     appendArray = SWUtils.cartesianAppend([skill], appendnums, appendToEnd);
     return memo.concat(appendArray);
   }, []);
 },
 /* updateMaxSkills Calculates and sets maximum skill ranks. Minimum 1 per level.
 *  divides by 2 if using consolidated skills
 * @param {event} eventInfo - from event
 * @callback {function} - callback when done
 */
 updateMaxSkills = function (eventInfo, callback) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   fields=["total-skill", "total-fcskill", "INT-mod", "level", "Max-Skill-Ranks-mod", "Max-Skill-Ranks",
   "unchained_skills-show", "BG-Skill-Use","npc-skill","npc-hd-num",
   "class-0-skill","class-1-skill","class-2-skill","class-3-skill","class-4-skill","class-5-skill",
   "class-0-level","class-1-level","class-2-level","class-3-level","class-4-level","class-5-level"
   ];
   getAttrs(fields, function (v) {
     var intMod = parseInt(v["INT-mod"], 10) || 0,
     classSkills = parseInt(v["total-skill"], 10) || 0,
     level = parseInt(v.level, 10) || 0,
     fcSkills = parseInt(v["total-fcskill"], 10) || 0,
     extra = parseInt(v["Max-Skill-Ranks-mod"], 10) || 0,
     currSkills = parseInt(v["Max-Skill-Ranks"], 10) || 0,
     totIntMod = 0,
     minSkills=0,
     i=0,
     thislvl=0,
     classPlusInt = 0,
     thisSkill=0,
     totAllSkills = 0,
     setter = {};
     try {
       for(i=0;i<6;i++){
         thislvl=parseInt(v['class-'+i+'-level'],10)||0;
         if (thislvl>0){
           thisSkill=( (parseInt(v['class-'+i+'-skill'],10)||0) * thislvl ) + (intMod * thislvl);
           if (thisSkill < thislvl){
             thisSkill=thislvl;
           }
           classPlusInt += thisSkill;
         }
       }
       thislvl = parseInt(v['npc-hd-num'],10)||0;
       thisSkill = parseInt(v['npc-skill'],10)||0;
       if (thislvl && thisSkill){
         thisSkill = thislvl * thisSkill + intMod * thislvl;
         if (thisSkill < thislvl){
           thisSkill=thislvl;
         }
         classPlusInt +=  thisSkill;
       }
       if (v["unchained_skills-show"] == "1" && (!v["BG-Skill-Use"] || v["BG-Skill-Use"] == "0")) {
         classPlusInt = Math.floor(classPlusInt / 2);
       }
       totAllSkills = classPlusInt + extra;
       if (totAllSkills < level){
         totAllSkills = level;
       }
       totAllSkills += fcSkills;
       if (currSkills !== totAllSkills) {
         setter["Max-Skill-Ranks"] = totAllSkills;
       }
     } catch (err) {
       TAS.error("PFSkills.updateMaxSkills", err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, {
           silent: true
         }, done);
       } else {
         done();
       }
     }
   });
 },
 /** verifyHasSkill - Checks to see if skill is in list of valid skills for this character (consolidated, background, core).
 * @param {string} skill = the skill name
 * @param {function} callback = a function that takes a a boolean as a first parameter.
 *   called with true if skill is part of valid list, or false if not.
 */
 verifyHasSkill = function (skill, callback) {
   var first3 = '',
     first4 = '',
     core = false,
     bg = false,
     cs = false,
     isSub = false,
     fields = ["BG-Skill-Use", "unchained_skills-show"];
   try {
     if (skill && typeof callback === "function") {
       first4 = skill.slice(0, 4).toLowerCase();
       first3 = first4.slice(0, 3);
       if (first3 === 'cs-') {
         cs = true;
       } else if (first4 === 'arti' || first4 === 'lore') {
         bg = true;
       } else {
         core = true;
       }
       if (_.contains(allFillInSkillInstances, skill)) {
         isSub = true;
         fields = fields.concat([skill + "-name", skill + "-ranks"]);
       }
       getAttrs(fields, function (v) {
         var retval = false,
         usesBG=parseInt(v["BG-Skill-Use"],10)||0,
         usesUnchained=parseInt(v["unchained_skills-show"],10)||0;
         if (!isSub || v[skill + "-name"] || (parseInt(v[skill+"-ranks"],10)||0)>0) {
           if (core) {
             if (!usesUnchained || usesBG) {
               retval = true;
             }
           } else if (bg) {
             if (usesUnchained && usesBG) {
               retval = true;
             }
           } else {
             if (usesUnchained && !usesBG) {
               retval = true;
             }
           }
         }
         callback(retval);
       });
     }
   } catch (err) {
     TAS.error("PFSkills.verifyHasSkill", err);
     callback(false);
   }
 },
 /** updates one  skill row
 * @param {string} skill to update, must have same capitalization as on HTML
 * @param {function} callback = callback after done with params newvalue, oldvalue.
 * @param {boolean} silently = whether to update silently or not. ignored, always silent.
 */
 updateSkill = function (skill, callback, silently) {
   var done = function (newVal, oldVal) {
     if (typeof callback === "function") {
       callback(newVal, oldVal);
     }
   },
   csNm = skill + "-cs",
   ranksNm = skill + "-ranks",
   classNm = skill + "-class",
   abNm = skill + "-ability",
   modNm = skill + "-ability-mod",
   racialNm = skill + "-racial",
   traitNm = skill + "-trait",
   featNm = skill + "-feat",
   itemNm = skill + "-item",
   miscNm = skill + "-misc-mod",
   utNm = skill + "-ut",
   rtNm = skill + "-ReqTrain";
   getAttrs([skill, csNm, ranksNm, classNm, abNm, modNm, racialNm, traitNm, featNm, itemNm, miscNm, rtNm, utNm, "enforce_requires_training", "size_skill", "size_skill_double", "acp", "checks-cond", "Phys-skills-cond", "Perception-cond"], function (v) {
     var skillSize = 0,
     adj,
     skillTot = 0,
     setter = {},
     params = {},
     mods = "",
     setAny = 0,
     cond = 0,
     cs = parseInt(v[csNm], 10) || 0,
     currSkill = parseInt(v[skill], 10), //no default
     ranks = parseInt(v[ranksNm], 10) || 0,
     rt = parseInt(v[rtNm], 10) || 0,
     allCond = parseInt(v["checks-cond"], 10) || 0,
     abilityName = '',
     physCond = 0,
     perCond = 0,
     watchrt = parseInt(v["enforce_requires_training"], 10) || 0;
     try {
       abilityName = PFUtils.findAbilityInString(v[abNm]);
       if (rt && ranks === 0) {
         if (v[utNm] !== "{{untrained=1}}") {
           setter[utNm] = "{{untrained=1}}";
         }
       } else if (v[utNm] !== "{{untrained=}}") {
         setter[utNm] = "{{untrained=}}"; //cannot set to "" because then it chooses the default which is "{{untrained=1}}"
       }
       if (ranks && cs) {
         skillTot += 3;
         mods = "3/";
       } else {
         mods = "0/";
       }
       if (abilityName === "DEX-mod" || abilityName === "STR-mod") {
         adj = parseInt(v["acp"], 10) || 0;
         skillTot += adj;
         mods += adj + "/";
       } else {
         mods += "0/";
       }
       skillSize = sizeSkills[skill];
       if (skillSize) {
         if (skillSize === 1) {
           adj = parseInt(v["size_skill"], 10) || 0;
           skillTot += adj;
           mods += adj + "/";
         } else if (skillSize === 2) {
           adj = parseInt(v["size_skill_double"], 10) || 0;
           skillTot += adj;
           mods += adj + "/";
         }
       } else {
         mods += "0/";
       }
       if (abilityName === "DEX-mod" || abilityName === "STR-mod") {
         physCond = parseInt(v["Phys-skills-cond"], 10) || 0;
       }
       if (skill === "Perception" || skill === "CS-Perception") {
         perCond = parseInt(v["Perception-cond"], 10) || 0;
       }
       cond = allCond + physCond + perCond;
       mods += cond;
       skillTot += ranks + cond + (parseInt(v[modNm], 10) || 0) + (parseInt(v[racialNm], 10) || 0) + (parseInt(v[traitNm], 10) || 0) + (parseInt(v[featNm], 10) || 0) + (parseInt(v[itemNm], 10) || 0) + (parseInt(v[miscNm], 10) || 0);
       if (currSkill !== skillTot) {
         setter[skill] = skillTot;
       }
       if (v[classNm]  !== mods) {
         setter[classNm] = mods;
       }
     } catch (err) {
       TAS.error(err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, {
           silently: true
         }, function () {
           done(skillTot, currSkill);
         });
       } else {
         done(currSkill, currSkill);
       }
     }
   });
 },
 /**recalculateSkillDropdowns recalculates ability dropdowns for all skills in list silently
 * @param {Array} skills list of skills
 * @param {function} callback callback when done
 * @param {function} errorCallback callback if error encountered creating field list to get.
 */
 recalculateSkillDropdowns = function (skills, callback, errorCallback) {
   var doneDrop = _.once(function () {
     TAS.debug("Leaving PFSkills.recalculateSkillDropdowns");
     if (typeof callback === "function") {
       callback();
     }
   }),
   fields = ["STR-mod", "DEX-mod", "CON-mod", "INT-mod", "WIS-mod", "CHA-mod"];
   try {
     fields = _.reduce(skills, function (memo, skill) {
       memo.push(skill + "-ability");
       memo.push(skill + "-ability-mod");
       return memo;
     }, fields);
   } catch (err) {
     TAS.error("PFSkills.recalculateSkillDropdowns could not create field list", err);
     if (typeof errorCallback === "function") {
       errorCallback();
     }
     return;
   }
   //first do all dropdowns at once
   getAttrs(fields, function (v) {
     var setter = {},
     abilityMods;
     try {
       //create short list of 6 modifiers.
       abilityMods = _.reduce(PFAbilityScores.abilitymods, function (memo, mod) {
         memo[mod] = parseInt(v[mod], 10) || 0;
         return memo;
       }, {});
       setter = _.reduce(skills, function (memo, skill) {
         try {
           var ability = PFUtils.findAbilityInString(v[skill + "-ability"]),
           newval = abilityMods[ability];
           if (!(newval === undefined || newval === null || ability !== "") && (newval !== parseInt(v[skill + "-ability-mod"], 10) || 0)) {
             memo[skill + "-ability-mod"] = newval;
           }
         } catch (err) {
           TAS.error("PFSkills.recalculateSkillDropdowns INSIDE REDUCE " + skill, err);
         } finally {
           return memo;
         }
       }, setter);
     } catch (err2) {
       TAS.error("PFSkills.recalculateSkillDropdowns inner", err2);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, {
           silent: true
         }, doneDrop);
       } else {
         doneDrop();
       }
     }
   });
 },
 /** recalculateSkillArray recalculates skills first dropdown, then misc mod, then skill total.
 * calls updateSkill for each. Does all dropdowns at once since they are easy to merge into one.
 * @param {Array} skills array of skills to update.
 * @param {function} callback when done
 * @param {boolean} silently whether to call setAttrs of skill total with silent or not.
 */
 recalculateSkillArray = function (skills, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   skillCount = _.size(skills),
   skillsHandled = 0,
   doneMisc = function (skill) {
     //TAS.debug("PFSkills.recalculateSkillArray done with misc skills call updateSkill on "+skill);
     //final: update each skill
     updateSkill(skill, done, silently);
   },
   doneDrop = function () {
     //second do misc one by one (since it is asynchronous)
     _.each(skills, function (skill) {
       SWUtils.evaluateAndSetNumber(skill + "-misc", skill + "-misc-mod", 0, function () {
         doneMisc(skill);
       }, true);
     });
   };
   recalculateSkillDropdowns(skills, doneDrop, done);
 },
 recalculateSkills = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["unchained_skills-show", "BG-Skill-Use"], function (v) {
     try {
       if (v["unchained_skills-show"] == "1") {
         if (v["BG-Skill-Use"] == "1") {
           //TAS.debug"PFSkills.recalculate: has background skills");
           recalculateSkillArray(backgroundOnlySkills, null, silently);
           //return after long one
           recalculateSkillArray(allCoreSkills, done, silently);
         } else {
           //TAS.debug"PFSkills.recalculate: has consolidatedSkills skills");
           recalculateSkillArray(consolidatedSkills, done, silently);
         }
       } else {
         //TAS.debug"PFSkills.recalculate: has core skills skills");
         recalculateSkillArray(allCoreSkills, done, silently);
       }
     } catch (err) {
       TAS.error("PFSKills.recalculate", err);
       done();
     }
   });
 },
 /** updates the macros for only the 7 subskill rolltemplates
 * @param {boolean} background -if background skills turned on
 * @param {boolean} rt - if Enforce Requires Training checked
 * @param {event} eventInfo ?
 * @param {jsobject_map} currMacros map of parent skill button name to command macro. (knowledge, Perform, etc)
 * @param {boolean} isNPC - if sheet is NPC
 * @param {boolean} showBonus - if skill total should be displayed on button.
 */
 updateSubSkillMacroBook = function (background, rt, eventInfo, currMacros, isNPC, showBonus) {
   var headerString = isNPC ? npcSkillHeaderMacro : skillHeaderMacro,
   skillPrefix = isNPC ? "NPC-" : "",
   assembleSubSkillButtonArray = function (skill, shouldEnforce, v) {
     var appendnums = (skill === "Misc-Skill") ? miscSkillAppendNums : (skill === "Knowledge") ? knowledgeSkillAppends : skillAppendNums,
     subskills = SWUtils.cartesianAppend([skill], appendnums),
     firstPass = [];
     if (skill === "Knowledge") {
       firstPass = subskills;
       return firstPass; //knowledge rollable even if untrained
     }
     firstPass = _.filter(subskills, function (subskill) {
       if (v[subskill + "-name"]) {
         return true;
       }
       return false;
     });
     if (!shouldEnforce) {
       return firstPass;
     }
     return _.filter(firstPass, function (skill) {
       if ((parseInt(v[skill + "-ReqTrain"], 10) || 0) === 0 || (parseInt(v[skill + "-ranks"], 10) || 0) > 0) {
         return true;
       }
       return false;
     });
   },
   getKnowledgeButtonMacro = function (showBonus) {
     var bonusStr = showBonus ? "+ @{REPLACE}" : "",
     knowledgebutton = "[^{REPLACENAME}" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ";
     return headerString.replace('REPLACELOWER', 'knowledge') + "{{ " + _.reduce(knowledgeSubSkillsTranslateKeys, function (memo, subskill, idx) {
       memo += knowledgebutton.replace(/REPLACENAME/g, subskill).replace(/REPLACE/g, knowledgeSkills[idx]);
       return memo;
     }, "") + " }}";
   },
   getSubSkillButtonMacro = function (skill, skillArray, showBonus,v) {
     var skillTransKey = skill.toLowerCase(),
     bonusStr = showBonus ? "+ @{REPLACE}" : "",
     baseMacro = headerString.replace('REPLACELOWER', skillTransKey),
     singleRowButton = "[REPLACENAME" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ",
     tempstr = "";
     if (skill === "Knowledge") {
       return getKnowledgeButtonMacro();
     }
     tempstr = _.reduce(skillArray, function (memo, subskill, idx) {
       var buttonName = v[subskill+"-name"];
       if (buttonName){
         buttonName = SWUtils.escapeForChatLinkButton(buttonName);
         buttonName = SWUtils.escapeForRollTemplate(buttonName);
       } else {
         buttonName = "@{"+subskill+"-name}";
       }
       memo += singleRowButton.replace(/REPLACENAME/g, buttonName).replace(/REPLACE/g, subskill);
       return memo;
     }, "");
     if (!tempstr) {
       tempstr = "description = ^{no-skills-available}";
     }
     return baseMacro + "{{ " + tempstr + " }}";
   },
   subskillParents = background ? skillsWithFillInNames : coreSkillsWithFillInNames,
   allsubskillFields = appendToSubSkills(subskillParents, ["-name"]);
   if (rt) {
     allsubskillFields = allsubskillFields.concat(
     appendToSubSkills(subskillParents, checkRTArray)
     );
     allsubskillFields = allsubskillFields.sort();
     //allsubskillFields.concat(appendToSubSkills(subskillParents, checkRTArray)).sort();
   }
   //TAS.debug("updateSubSkillMacroBook: allsubskillFields are:", allsubskillFields);
   getAttrs(allsubskillFields, function (v) {
     var setter = {},
     tempKMac = "";
     //TAS.debug("updateSubSkillMacroBook: event and data are:", eventInfo, v);
     _.each(subskillParents, function (skill) {
       var canshowarray = assembleSubSkillButtonArray(skill, rt, v),
       tempMacro = getSubSkillButtonMacro(skill, canshowarray, showBonus,v);
       tempMacro = baseGenMacro + tempMacro;
       if (currMacros[skillPrefix + skill.toLowerCase() + "_skills-macro"] !== tempMacro) {
         setter[skillPrefix + skill.toLowerCase() + "_skills-macro"] = tempMacro;
       }
     });
     if (currMacros[skillPrefix + "knowledge_skills-macro"]) {
       tempKMac = baseGenMacro + getKnowledgeButtonMacro(showBonus);
       if (currMacros[skillPrefix + "knowledge_skills-macro"] !== tempKMac) {
         setter[skillPrefix + "knowledge_skills-macro"] = tempKMac;
       }
     }
     if (_.size(setter) > 0) {
       setAttrs(setter, PFConst.silentParams);
     }
   });
 },
 assembleSkillButtonArray = function (skills, shouldEnforce, sv) {
   if (!shouldEnforce) {
     return skills;
   }
   return _.filter(skills, function (skill) {
     if (/^Knowled|^Linguis|^Sleight/i.test(skill.slice(0, 7)) || (parseInt(sv[skill + "-ReqTrain"],10)||0) !== 1 || (parseInt(sv[skill + "-ranks"], 10) || 0) > 0) {
       return true;
     }
     return false;
   });
 },
 getSkillButtonMacro = function (name, skillArray, showBonus, isNPC) {
   var skillTransKey = name.toLowerCase(),
   skillPrefix = isNPC ? "NPC-" : "",
   bonusStr = showBonus ? " + @{REPLACE}" : "",
   baseMacro = "{{name= ^{" + skillTransKey + "} }} ",
   npcBaseMacro = "{{name= ^{npc} ^{" + skillTransKey + "} }} ",
   rowbutton = "[^{REPLACELOWER}" + bonusStr + "](~@{character_id}|" + skillPrefix + "REPLACE-check) ",
   subskillbutton = "[^{REPLACELOWER}](~@{character_id}|" + skillPrefix + "REPLACELOWERMAC_skills_buttons_macro) ",
   baseToSend = isNPC?npcBaseMacro:baseMacro,
   tempstr="";
   try {
     tempstr = _.reduce(skillArray, function (memo, skill, idx) {
       var thistranskey = skill.toLowerCase(),
       thisbutton = (_.contains(skillsWithSubSkills, skill)) ? subskillbutton : rowbutton;
       thisbutton = thisbutton.replace(/REPLACELOWERMAC/g, thistranskey);
       thisbutton = thisbutton.replace(/REPLACELOWER/g, thistranskey);
       thisbutton = thisbutton.replace(/REPLACE/g, skill);
       memo += thisbutton + " ";
       return memo;
     }, "");
     if (!tempstr) {
       tempstr = "^{no-skills-available} ";
     }
   } finally {
     return baseToSend + "{{ " + tempstr + "}}";
   }
 },
 resetOneCommandMacro = function(callback, eventInfo, isNPC,showBonus,unchained,background,consolidated,rt){
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   skillPrefix = isNPC ? "NPC-" : "";
   getAttrs([skillPrefix+"skills-macro", skillPrefix+"background_skills-macro", skillPrefix+"adventure_skills-macro",
       skillPrefix+"artistry_skills-macro", skillPrefix+"lore_skills-macro", skillPrefix+"craft_skills-macro", skillPrefix+"knowledge_skills-macro",
       skillPrefix+"perform_skills-macro", skillPrefix+"profession_skills-macro", skillPrefix+"misc-skill_skills-macro"], function (v) {
     var i = 0,
     setter = {},
     tempSkillArray = [],
     tempMacro = "",
     allskillstitle = "skills",
     coreArray;
     if (!consolidated) {
       updateSubSkillMacroBook(background, rt, eventInfo, v, isNPC, showBonus);
       //skills without sub skills
       if (rt) {
         getAttrs(SWUtils.cartesianAppend(regularCoreSkills, checkRTArray), function (v) {
           var canshowarray = [],
           tempRTMacro = "",
           temparray = [];
           try {
             if (background) {
               canshowarray = assembleSkillButtonArray(regularBackgroundSkills, rt, v) || [];
               temparray = temparray.concat(canshowarray);
               canshowarray = canshowarray.concat(skillsWithSubSkills).sort();
               tempRTMacro = baseGenMacro + getSkillButtonMacro("background-skills", canshowarray, showBonus, isNPC);
               if (v[skillPrefix + "background_skills-macro"] !== tempRTMacro) {
                 setter[skillPrefix + "background_skills-macro"] = tempRTMacro;
               }
               canshowarray = assembleSkillButtonArray(regularAdventureSkills, rt, v) || [];
               temparray = temparray.concat(canshowarray);
               canshowarray = canshowarray.concat(["Knowledge","Misc-Skill"]).sort();
               tempRTMacro = baseGenMacro + getSkillButtonMacro("adventure-skills", canshowarray, showBonus, isNPC);
               if (v[skillPrefix + "adventure_skills-macro"] !== tempRTMacro) {
                 setter[skillPrefix + "adventure_skills-macro"] = tempRTMacro;
               }
               temparray = temparray.concat(skillsWithSubSkills).sort();
             } else {
               canshowarray = assembleSkillButtonArray(regularCoreSkills, rt, v) || [];
               temparray = temparray.concat(canshowarray).concat(coreSkillsWithSubSkills).sort();
             }
             tempRTMacro = baseGenMacro + getSkillButtonMacro("skills", temparray, showBonus, isNPC);
             if (v[skillPrefix + "skills-macro"] !== tempRTMacro) {
               setter[skillPrefix + "skills-macro"] = tempRTMacro;
             }
           } catch (errRT){
             TAS.error("PFSkills.resetOneCommandMacro errRT",errRT);
           } finally {
             if (_.size(setter) > 0) {
               setAttrs(setter, PFConst.silentParams, done);
             } else {
               done();
             }
           }
         });
       } else {
         try {
           coreArray = regularCoreSkills.concat(coreSkillsWithSubSkills);
           //no require training
           if (background) {
             coreArray = coreArray.concat(["Artistry", "Lore"]).sort();
             allskillstitle = "all-skills";
             tempSkillArray = regularBackgroundSkills.concat(skillsWithSubSkills).sort();
             tempMacro = getSkillButtonMacro("background-skills", tempSkillArray, showBonus, isNPC);
             setter[skillPrefix + "background_skills-macro"] = baseGenMacro + tempMacro;
             tempSkillArray = regularAdventureSkills.concat(["Knowledge"]).sort();
             tempMacro = getSkillButtonMacro("adventure-skills", tempSkillArray, showBonus, isNPC);
             setter[skillPrefix + "adventure_skills-macro"] = baseGenMacro + tempMacro;
           }
           tempMacro = baseGenMacro + getSkillButtonMacro(allskillstitle, coreArray, showBonus, isNPC);
           if (v[skillPrefix + "skills-macro"] !== tempMacro) {
             setter[skillPrefix + "skills-macro"] = tempMacro;
           }
         } catch (errReg){
           TAS.error("PFSkills.resetOneCommandMacro errReg",errReg);
         } finally {
           if (_.size(setter>0)){
             setAttrs(setter,PFConst.silentParams, done);
           } else {
             done();
           }
         }
       }
     } else {
       //consolidated
       if (rt) {
         getAttrs(SWUtils.cartesianAppend(consolidatedSkills, ["-ReqTrain", "-ranks"]), function (sv) {
           var canshowarray, setter = {}, tempMacro ;
           canshowarray = assembleSkillButtonArray(consolidatedSkills, rt, sv);
           tempMacro = getSkillButtonMacro("skills", canshowarray, showBonus);
           setter[skillPrefix + "consolidated_skills-macro"] = baseGenMacro + tempMacro;
           setAttrs(setter,PFConst.silentParams, done);
         });
       } else {
         tempMacro = getSkillButtonMacro("skills", consolidatedSkills, showBonus);
         setter[skillPrefix + "consolidated_skills-macro"] = baseGenMacro + tempMacro;
         setAttrs(setter,PFConst.silentParams, done);
       }
     }
   });
 },
 resetCommandMacro = function (eventInfo, callback) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["BG-Skill-Use", "unchained_skills-show", "enforce_requires_training", "is_npc", "include_skill_totals"],function(vout){
     var isNPC = parseInt(vout["is_npc"], 10) || 0,
     skillPrefix = isNPC ? "NPC-" : "",
     showBonus = parseInt(vout.include_skill_totals, 10) || 0,
     unchained = parseInt(vout["unchained_skills-show"], 10) || 0,
     background = unchained && (parseInt(vout["BG-Skill-Use"], 10) || 0),
     consolidated = unchained && (!background),
     rt = parseInt(vout["enforce_requires_training"], 10) || 0;
     resetOneCommandMacro(done,eventInfo,isNPC,showBonus,unchained,background,consolidated,rt);
     if (isNPC){
       resetOneCommandMacro(done,eventInfo,false,showBonus,unchained,background,consolidated,rt);
     }
   });
 },
 applyConditions = function (callback,silently,eventInfo){
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   },
   updateSkillArray  = function(skills){
     _.each(skills,function(skill){
       updateSkill(skill);
     });
   };
   //TAS.debug("at apply conditions");
   getAttrs(["unchained_skills-show", "BG-Skill-Use"], function (v) {
     try {
       if (v["unchained_skills-show"] == "1") {
         if (v["BG-Skill-Use"] == "1") {
           //TAS.debug("PFSkills.recalculate: has background skills");
           updateSkillArray(backgroundOnlySkills);
           //return after long one
           updateSkillArray(allCoreSkills);
         } else {
           //TAS.debug("PFSkills.recalculate: has consolidatedSkills skills");
           updateSkillArray(consolidatedSkills);
         }
       } else {
         //TAS.debug("PFSkills.recalculate: has core skills skills");
         updateSkillArray(allCoreSkills);
       }
     } catch (err) {
       TAS.error("PFSKills.applyConditions", err);
       done();
     }
   });
 },
 /** migrate skills
 * @param {function} callback callback when done
 * @param {number} oldversion old version , -1 if hit recalc
 */
 migrate = function (callback, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFSkills.migrate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneOne = _.after(3,done),
   /** migrateOldClassSkillValue - converts class skill checkboxes from old autocalc string to number "" or 3.
   * @param {function} callback ?
   * @param {number} oldversion ?
   */
   migrateOldClassSkillValue = function (callback, oldversion) {
     var done = _.once(function () {
       if (typeof callback === "function") {
         callback();
       }
     }),
     migrateClassSkill = function (skill) {
       var csNm = skill + "-cs";
       getAttrs([csNm], function (v) {
         var cs = 0,
         setter = {};
         cs = parseInt(v[csNm], 10);
         if (isNaN(cs)) {
           if (v[csNm] == "0") {
             cs = 0;
           } else if (v[csNm] && (parseInt(v[csNm], 10) || 0) !== 3) {
             cs = 3;
           } else if (!v[csNm]) {
             cs = 0;
           }
           if (cs === 3) {
             //TAS.debug({"function":"migrateClassSkill","raw":v[csNm],"cs":cs});
             setter[csNm] = cs;
             setAttrs(setter, PFConst.silentParams);
           }
         }
       });
     },
     migrateClassSkillArray = function (skills) {
       skills.forEach(function (skill) {
         migrateClassSkill(skill);
       });
     },
     determineArray = function () {
       migrateClassSkillArray(allTheSkills);
       //not bothering to code correctly to wait since this is almost a year old.
       setAttrs({classSkillsMigrated: 1}, PFConst.silentParams,done);
     };
     getAttrs(["classSkillsMigrated"], function (vm) {
       if (!(parseInt(vm.classSkillsMigrated, 10) || 0)) {
         determineArray();
       }
       done();
     });
   },
   /** setAdvancedMacroCheckbox - part of migrate .66 to 1.00 sets checkbox to unhide advanced
   * skillmacro (investigator) if character sheet already using it.)
   * @param {function} callback ?
   */
   setAdvancedMacroCheckbox = function (callback) {
     var done = _.once(function () {
       if (typeof callback === "function") {
         callback();
       }
     });
     getAttrs(["adv_macro_show", "skill-invest-query"], function (v) {
       var showAdv = parseInt(v.adv_macro_show, 10) || 0;
       if (v["skill-invest-query"] && !showAdv) {
         setAttrs({adv_macro_show: 1}, PFConst.silentParams, done);
       }
     });
   };
   TAS.debug("at PFSkills.migrate");
   migrateOldClassSkillValue(doneOne);
   migrateMacros(doneOne);
   PFMigrate.migrateMaxSkills(doneOne);
 },
 /* recalculate - updates ALL skills  - calls PFUtilsAsync.setDropdownValue for ability then updateSkill */
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("leaving PFSkills.recalculate");
     resetCommandMacro();
     if (typeof callback === "function") {
       callback();
     }
   });
   TAS.debug("PFSkills.recalculate");
   migrate(function () {
     //TAS.debug"PFSkills.recalculate back from PFSkills.migrate");
     updateMaxSkills();
     recalculateSkills(done, silently);
   }, oldversion);
 },
 events = {
   skillGlobalEventAuto: "change:checks-cond change:phys-skills-cond change:acp",
   skillEventsAuto: "change:REPLACE-ability-mod change:REPLACE-misc-mod",
   skillEventsPlayer: "change:REPLACE-cs change:REPLACE-ranks change:REPLACE-racial change:REPLACE-trait change:REPLACE-feat change:REPLACE-item change:REPLACE-ReqTrain"
 },
 registerEventHandlers = function () {
   //SKILLS************************************************************************
   on("change:total-skill change:total-fcskill change:int-mod change:level change:max-skill-ranks-mod change:unchained_skills-show change:BG-Skill-Use", TAS.callback(function eventUpdateMaxSkills(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker") {
       updateMaxSkills(eventInfo);
     }
   }));
   on(events.skillGlobalEventAuto, TAS.callback(function eventGlobalConditionAffectingSkill(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker") {
       applyConditions(null,null,eventInfo);
     }
   }));
   //each skill has a dropdown handler and a skill update handler
   //concat them all up, only happens once so no big deal
   _.each(allTheSkills, function (skill) {
     on((events.skillEventsAuto.replace(/REPLACE/g, skill)), TAS.callback(function eventSkillsAuto(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
       if (eventInfo.sourceType === "sheetworker") {
         verifyHasSkill(skill, function (hasSkill) {
           if (hasSkill) {
             updateSkill(skill, eventInfo);
           }
         });
       }
     }));
     on((events.skillEventsPlayer.replace(/REPLACE/g, skill)), TAS.callback(function eventSkillsPlayer(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         verifyHasSkill(skill, function (hasSkill) {
           if (hasSkill) {
             updateSkill(skill, eventInfo);
           }
         });
       }
     }));
     on("change:" + skill + "-ability", TAS.callback(function eventSkillDropdownAbility(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       verifyHasSkill(skill, function (hasSkill) {
         if (hasSkill) {
           PFUtilsAsync.setDropdownValue(skill + "-ability", skill + "-ability-mod");
         }
       });
     }));
     on("change:" + skill + "-misc", TAS.callback(function eventSkillMacroAbility(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       verifyHasSkill(skill, function (hasSkill) {
         if (hasSkill) {
           SWUtils.evaluateAndSetNumber(skill + "-misc", skill + "-misc-mod");
         }
       });
     }));
     //these always displayed if rt or not
     if (skill.slice(0, 9) !== "Knowledge" && skill !== "Linguistics" && skill !== "Sleight-of-Hand") {
       on("change:" + skill + "-ReqTrain change:" + skill + "-ranks", TAS.callback(function eventSkillRequiresTrainingRanks(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + skill + ", " + eventInfo.sourceType);
         if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
           verifyHasSkill(skill, function (hasSkill) {
             getAttrs(["enforce_requires_training"], function (v) {
               if (v.enforce_requires_training == "1") {
                 resetCommandMacro(eventInfo);
               }
             });
           });
         }
       }));
     }
     //end of skill loop
   });
   //skills affected by size
   _.each(sizeSkills, function (mult, skill) {
     if (mult === 1) {
       on("change:size_skill", TAS.callback(function eventUpdateSizeSkill(eventInfo) {
         if (eventInfo.sourceType === "sheetworker") {
           TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
           updateSkill(skill, eventInfo);
         }
       }));
     } else if (mult === 2) {
       on("change:size_skill_double", TAS.callback(function eventUpdateSizeSkillDouble(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         if (eventInfo.sourceType === "sheetworker") {
           updateSkill(skill, eventInfo);
         }
       }));
     }
   });
   on("change:enforce_requires_training", TAS.callback(function eventRequiresTraining(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       resetCommandMacro(eventInfo);
     }
   }));
   _.each(SWUtils.cartesianAppend(allFillInSkillInstances, ["-name"]), function (skill) {
     on("change:" + skill, TAS.callback(function eventSkillsWithFillInNames(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         var rt = skill.slice(0, -4) + "ReqTrain",
         r = skill.slice(0, -4) + "ranks";
         //if we changed name on a skill that isn't choosable don't bother.
         getAttrs(["enforce_requires_training", rt, r, "unchained_skills-show", "BG-Skill-Use", "artistry_skills-macro", "lore_skills-macro", "craft_skills-macro", "knowledge_skills-macro", "perform_skills-macro", "profession_skills-macro", "misc-skill_skills-macro", "is_npc", "include_skill_totals", "NPC-craft_skills-macro", "NPC-knowledge_skills-macro", "NPC-perform_skills-macro", "NPC-profession_skills-macro", "NPC-misc-skill_skills-macro"], function (v) {
           var isrt = parseInt(v.enforce_requires_training, 10),
           bg = 0,
           isNPC = parseInt(v.is_npc, 10) || 0,
           showBonus = parseInt(v.include_skill_totals, 10) || 0;
           if (!(isrt && parseInt(v[rt], 10) && isNaN(parseInt(v[r], 10)))) {
             bg = isNPC ? 0 : ((parseInt(v["unchained_skills-show"], 10) || 0) && (parseInt(v["BG-Skill-Use"], 10) || 0));
             //TAS.debug"calling updatesubskillmacro: bg:" + bg + ",isrt:" + isrt);
             updateSubSkillMacroBook(bg, isrt, eventInfo, v, isNPC, showBonus);
           }
         });
       }
     }));
   });
   //reset based on config changes
   on("change:unchained_skills-show change:BG-Skill-Use change:include_skill_totals", TAS.callback(function eventResetUnchainedSkills(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       recalculate(eventInfo, function(){resetCommandMacro(eventInfo);});
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFSkills module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   migrate: migrate,
   applyConditions:applyConditions,
   backgroundOnlySkills: backgroundOnlySkills,
   allCoreSkills: allCoreSkills,
   skillsWithSpaces: skillsWithSpaces,
   consolidatedSkills: consolidatedSkills,
   coreSkillAbilityDefaults: coreSkillAbilityDefaults,
   allFillInSkillInstances: allFillInSkillInstances,
   sizeSkills: sizeSkills,
   skillsWithSubSkills: skillsWithSubSkills,
   appendToSubSkills: appendToSubSkills,
   resetCommandMacro: resetCommandMacro,
   updateMaxSkills: updateMaxSkills,
   updateSkill: updateSkill,
   updateSubSkillMacroBook: updateSubSkillMacroBook,
   verifyHasSkill: verifyHasSkill
 };
}());
var PFFeatures = PFFeatures || (function () {
 'use strict';
 var
 featureLists = ["class-ability", "feat", "racial-trait", "trait", "mythic-ability", "mythic-feat",'npc-spell-like-abilities'],
 baseCommandMacro = "/w \"@{character_name}\" &{template:pf_block} @{toggle_attack_accessible} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=^{all-abilities}}} ",
 otherCommandMacros = {
   'class-ability':" [^{original-class-features-list}](~@{character_id}|class-ability_button)",
   'mythic':" [^{mythic-abilities}](~@{character_id}|mythic-ability_button) [^{mythic-feats}](~@{character_id}|mythic-feat_button)",
   'feat':" [^{original-feats-list}](~@{character_id}|REPLACENPCfeat_button)",
   'racial-trait':" [^{original-racial-traits-list}](~@{character_id}|REPLACENPCracial-trait_button)",
   'trait':" [^{original-traits-list}](~@{character_id}|trait_button)",
   'npc-spell-like-abilities': " [^{original-spell-like-abilities-list}](~@{character_id}|npc-spell-like-abilities_button)"
 },
 defaultMacroMap ={
   'feat': 'default',
   'trait': 'default',
   'racial-trait': 'default',
   'class-ability': 'class-ability',
   'mythic-ability': 'mythic-ability',
   'mythic-feat': 'default'
 },
 defaultMacros={
   'default': {
     defaultRepeatingMacro: "&{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{name}}} {{description=@{short-description}}}",
     defaultRepeatingMacroMap:{
       '&{template:':{'current':'pf_generic}','old':['pf_block}']},
       '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
       '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
       '{{color=':{'current':'@{rolltemplate_color}}}'},
       '{{header_image=':{'current':'@{header_image-pf_block}}}'},
       '{{character_name=':{'current':'@{character_name}}}'},
       '{{character_id=':{'current':'@{character_id}}}'},
       '{{subtitle}}':{'current':'{{subtitle}}'},
       '{{name=':{'current':'@{name}}}'},
       '{{description=':{'current':'@{short-description}}}','old':[' @{short-description}}}']}},
     defaultDeletedArray: null
   },
   'class-ability': {
     defaultRepeatingMacro: "&{template:pf_block} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{class=**^{class}**: @{class-number}}} {{name=@{name}}} {{description=@{short-description}}}",
     defaultRepeatingMacroMap:{
       '&{template:':{'current':'pf_generic}','old':['pf_block}']},
       '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
       '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
       '{{color=':{'current':'@{rolltemplate_color}}}'},
       '{{header_image=':{'current':'@{header_image-pf_generic}}}'},
       '{{character_name=':{'current':'@{character_name}}}'},
       '{{character_id=':{'current':'@{character_id}}}'},
       '{{subtitle=':{'current':'{{subtitle}}','old':['^{@{rule_category}}}}','Class Ability}}']},
       '{{class=':{'current':'**^{class}**: @{class-number}}}','old':['**Class**: @{class-number}}}'],replacements:[{'from':'Class','to':'class'}]},
       '{{name=':{'current':'@{name}}}'},
       '{{description=':{'current':'@{short-description}}}','old':[' @{short-description}}}']}},
     defaultDeletedArray:['{{Class=**Class**: @{class-number}}}','{{subtitle=^{@{rule_category}}}}']
   },
   'mythic-ability': {
     defaultRepeatingMacro: "&{template:pf_block} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_block}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{class=**^{path}**: @{mythic-number}}} {{name=@{name}}} {{description=@{short-description}}}",
     defaultRepeatingMacroMap:{
       '&{template:':{'current':'pf_generic}','old':['pf_block}']},
       '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
       '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
       '{{color=':{'current':'@{rolltemplate_color}}}'},
       '{{header_image=':{'current':'@{header_image-pf_block}}}'},
       '{{character_name=':{'current':'@{character_name}}}'},
       '{{character_id=':{'current':'@{character_id}}}'},
       '{{subtitle=':{'current':'{{subtitle}}'},
       '{{class=':{'current':'**^{path}**: @{mythic-number}}}','old':['**Path**: @{mythic-number}}}'],replacements:[{'from':'Path','to':'path'}]},
       '{{name=':{'current':'@{name}}}'},
       '{{description=':{'current':'@{short-description}}}','old':[' @{short-description}}}']}},
     defaultDeletedArray: ['{{subtitle}}','{{Class=**Class**: @{class-number}}}']
   },
   'spell-like-ability': {
     defaultRepeatingMacro: '@{NPC-whisper} &{template:pf_generic} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{name}}} {{^{level}=[[@{level}]]}} {{^{range}=@{range}}} {{^{duration}=@{duration}}} {{^{save}=@{save}, ^{difficulty-class-abbrv} [[@{savedc}]]}} {{^{spell-resistance-abbrv}=@{abil-sr}}} {{description=@{short-description}}}',
     defaultRepeatingMacroMap:{'@{NPC-whisper}':{'current':'@{NPC-whisper}'},
       '&{template:':{'current':'pf_generic}'},
       '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
       '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
       '{{color=':{'current':'@{rolltemplate_color}}}'},
       '{{header_image=':{'current':'@{header_image-pf_block}}}'},
       '{{character_name=':{'current':'@{character_name}}}'},
       '{{character_id=':{'current':'@{character_id}}}'},
       '{{name=':{'current':'@{name}}}'},
       '{{subtitle=':{'current':'{{subtitle}}','old':['^{@{rule_category}}}}','Class Ability}}']},
       '{{^{level}=':{'current':'@{level}}}','old':['[[@{spell_level}]]}}']},
       '{{^{range}=':{'current':'@{range}}}','old':['^{@{range_pick}} [[@{range_numeric}]]}}']},
       '{{^{duration}=':{'current':'@{duration}}}'},
       '{{^{save}=':{'current':'@{save}}}','old':['@{save}, ^{difficulty-class-abbrv} [[@{savedc}]]}}']},
       '{{^{spell-resistance-abbrv}=':{'current':'@{sr}}}','old':['^{@{abil-sr}}}}']},
       '{{description=':{'current':'@{short-description}}}','old':[' @{short-description}}}']}},
     defaultDeletedArray: ['{{Level=@{level}}}','{{Range=@{range}}}','{{Duration=@{duration}}}','{{Save=@{save}}}','{{SR=@{sr}}}',
         '{{^{frequency}=@{used}/@{used|max} ^{@{frequency}} @{rounds_between}}}','{{^{frequency}=@{used}/@{used|max} ^{@{frequency}}}}','{{subtitle=^{@{rule_category}}}}']
   }
 },
 /** resetTopCommandMacro sets orig_ability_header_macro  (macro to plug into pf_block, read by PFAbility.resetCommandMacro)
 *@param {function} callback call when done
 */
 resetTopCommandMacro=function(callback){
   var done = _.once(function () {
     TAS.debug("leaving PFFeatures.resetTopCommandMacro");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["is_npc","NPC-orig_ability_header_macro","orig_ability_header_macro","mythic-adventures-show","use_traits","use_racial_traits","use_feats","use_class_features","use_spell-like-abilities"],function(v){
     var isMythic = 0,
     usesTraits=0,
     usesRacialTraits=0,
     hasMythicMacro=0,
     usesFeats=0,
     usesClass=0,
     usesSLAs=0,
     newMacro="",
     isNPC=0,
     prefix="",
     setter={}
     ;
     try {
       isNPC=parseInt(v.is_npc,10)||0;
       prefix=isNPC?"NPC-":"";
       isMythic = parseInt(v["mythic-adventures-show"],10)||0;
       usesFeats = parseInt(v["use_feats"],10)||0;
       usesClass = parseInt(v["use_class_features"],10)||0;
       usesTraits = parseInt(v.use_traits,10)||0;
       usesRacialTraits=parseInt(v.use_racial_traits,10)||0;
       usesSLAs = parseInt(v["use_spell-like-abilities"],10)||0;

       newMacro =
         (usesClass?otherCommandMacros['class-ability']:"") +
         (usesFeats?otherCommandMacros['feat'].replace(/REPLACENPC/g,prefix):"") +
         (usesSLAs?otherCommandMacros['npc-spell-like-abilities']:"") +
         (usesTraits?otherCommandMacros['trait']:"") +
         (usesRacialTraits?otherCommandMacros['racial-trait'].replace(/REPLACENPC/g,prefix):"") +
         (isMythic?otherCommandMacros['mythic']:"") ;
       if (newMacro) {
         //no space in front needed for this one
         newMacro = "{{row01=^{original-abilities-menus}}} {{row02=" + newMacro + "}}";
       }
       if (newMacro!==v[prefix+'orig_ability_header_macro']){
         setter[prefix+'orig_ability_header_macro']=newMacro;
       }
       if (isNPC){
         newMacro =
           (usesClass?otherCommandMacros['class-ability']:"") +
           (usesFeats?otherCommandMacros['feat'].replace(/REPLACENPC/g,''):"") +
           (usesSLAs?otherCommandMacros['npc-spell-like-abilities']:"") +
           (usesTraits?otherCommandMacros['trait']:"") +
           (usesRacialTraits?otherCommandMacros['racial-trait'].replace(/REPLACENPC/g,''):"") +
           (isMythic?otherCommandMacros['mythic']:"") ;
         if (newMacro) {
           //no space in front needed for this one
           newMacro = "{{row01=^{original-abilities-menus}}} {{row02=" + newMacro + "}}";
         }
         if (newMacro!==v.orig_ability_header_macro){
           setter['orig_ability_header_macro']=newMacro;
         }
       }
     } catch(err) {
       TAS.error("PFFeatures.resetTopCommandMacro",err);
     }finally {
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     }
   });
 },
 /** resets the chat menu macro for all repeating lists in abilities tab
 *@param {function} callback call when done
 */
 resetCommandMacro=function(callback){
   var done = _.once(function () {
     TAS.debug("leaving PFFeatures.resetCommandMacro");
     if (typeof callback === "function") {
       callback();
     }
   });

   getAttrs(["is_npc","mythic-adventures-show","use_traits","use_racial_traits","use_class_features","use_feats","use_spell-like-abilities"],function(v){
     var isNPC = parseInt(v.is_npc,10)||0,
     featureList = [],
     doneWithOneButton,
     isMythic = 0,
     usesTraits=0,
     usesRacialTraits=0,
     usesFeats=0,
     usesClass=0,
     usesSLAs=0,
     newMacro="",
     numberLists=0,
     setter={};
     try {
       isMythic = parseInt(v["mythic-adventures-show"],10)||0;
       usesFeats = parseInt(v["use_feats"],10)||0;
       usesClass = parseInt(v["use_class_features"],10)||0;
       usesTraits = parseInt(v.use_traits,10)||0;
       usesRacialTraits=parseInt(v.use_racial_traits,10)||0;
       usesSLAs = parseInt(v["use_spell-like-abilities"],10)||0;
       //TAS.debug("at PFFeatures.resetCommandMacro",v);
       if (usesFeats){
         featureList.push('feat');
       }
       if (usesTraits){
         featureList.push('trait');
       }
       if (usesRacialTraits){
         featureList.push('racial-trait');
       }
       if (isMythic){
         featureList = featureList.concat(['mythic-ability','mythic-feat']);
       }
       if (usesClass){
         featureList.push('class-ability');
       }
       if (usesSLAs){
         featureList.push('npc-spell-like-abilities');
       }
       numberLists = _.size(featureList);
       if (numberLists > 0){
         doneWithOneButton = _.after(numberLists,done);
         _.each(featureList,function(section){
           //TAS.debug"PFFeatures.resetCommandMacros calling resetOne for :"+section);
           PFMenus.resetOneCommandMacro(section,isNPC,doneWithOneButton);
           if (isNPC && (section==='racial-trait' || section==='feat'||section==='ability'||section==='item'||
             section==='ex'||section==='sp'||section==='su') ){
             PFMenus.resetOneCommandMacro(section);
           }
         });
       } else {
         done();
       }
     }catch (err){
       TAS.error("PFFeatures.resetCommandMacro",err);
       done();
     } finally {
       resetTopCommandMacro();
     }
   });
 },
 /** recalculateRepeatingMaxUsed - Parses the macro text "...max-calculation" in the repeating items
 * (such as class-abilities, feats, traits, racial-traits)
 * and sets the used|max value.
 * Loops through all rows in the given repeating section.
 * @param {string} section= the name of the section after the word "repeating_"
 * @param {function} callback when done
 * @param {boolean} silently if T then call setAttrs with {silent:true}
 */
 recalculateRepeatingMaxUsed = function (section, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getSectionIDs("repeating_" + section, function (ids) {
     var totrows = _.size(ids),
     rowdone = _.after(totrows, done);
     if (totrows > 0) {
       _.each(ids, function (id, index) {
         var prefix = "repeating_" + section + "_" + id;
         SWUtils.evaluateAndSetNumber(prefix + "_max-calculation", prefix + "_used_max", 0, rowdone, silently);
       });
     } else {
       done();
     }
   });
 },
 setNewDefaults = function(callback,section){
   var done = _.once(function(){
     TAS.debug("leaving PFFeatures.setNewDefaults");
     if(typeof callback === "function"){
       callback();
     }
   }),
   sectionToDefaultRuleCategoryMap={
     'feat':'feats',
     'trait':'traits',
     'racial-trait':'racial-traits',
     'mythic-ability':'mythic-abilities',
     'mythic-feat':'mythic-feats',
     'class-ability':'class-features',
     'npc-spell-like-abilities': 'spell-like-abilities'
   },
   defaultabilitytype,defaultrulecategory,defaultshow;
   defaultshow = (section==='class-abilities'||section==='npc-spell-like-abilities')?'1':'0';
   defaultabilitytype= (section==='npc-spell-like-abilities')?'Sp':'not-applicable';
   defaultrulecategory = sectionToDefaultRuleCategoryMap[section]||'';
   getSectionIDs('repeating_'+section,function(ids){
     var setter={};
     try {
       setter = _.reduce(ids,function(m,id){
         var prefix = 'repeating_'+section+'_'+id+'_';
         try {
           m[prefix+'showinmenu']=defaultshow;
           m[prefix+'ability_type']=defaultabilitytype;
           m[prefix+'rule_category']=defaultrulecategory;
         } catch (errin){
           TAS.error("PFFeatures.setNewDefaults error "+section+" id "+id,errin);
         } finally {
           return m;
         }
       },{});
       setter['migrated_featurelists_defaults']=1;
     } catch (err){
       TAS.error("PFFeatures.setNewDefaults error setting defaults for "+section,err);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     }
   });
 },
 migrateRepeatingMacros = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFFeatures.migrateRepeatingMacros");
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneOne = _.after(_.size(featureLists),function(){
     setAttrs({'migrated_feature_macrosv109':1},PFConst.silentParams,done);
   });
   _.each(featureLists,function(section){
     var defaultName = '',defaultMacro='';
     try {
       defaultName = defaultMacroMap[section]||'default';
       defaultMacro=defaultMacros[defaultName];
       if (!defaultMacro){
         TAS.error("cannot find default macro for section "+section);
         doneOne();
         return;
       }
       PFMacros.migrateRepeatingMacros(doneOne,section,'macro-text',defaultMacro.defaultRepeatingMacro,defaultMacro.defaultRepeatingMacroMap,defaultMacro.defaultDeletedArray,'@{PC-Whisper}');
       if(section==='feat'||section==='racial-trait'){
         PFMacros.migrateRepeatingMacros(null,section,'npc-macro-text',defaultMacro.defaultRepeatingMacro,defaultMacro.defaultRepeatingMacroMap,defaultMacro.defaultDeletedArray,'@{NPC-Whisper}');
       }
     } catch (err){
       TAS.error("PFFeatures.migrateRepeatingMacros error setting up "+section,err);
       doneOne();
     }
   });
 },
 migrate = function (callback,oldversion){
   var done = function(){
     TAS.debug("leaving PFFeatures.migrate");
     if (typeof callback === "function"){
       callback();
     }
   },
   afterNewDefaults = function(){
     getAttrs(['migrated_feature_macrosv109'],function(v){
       if(! parseInt(v.migrated_feature_macrosv109,10)){
         migrateRepeatingMacros(done);
       } else {
         done();
       }
     });
   },
   numLists = _.size(featureLists),
   doneOne = _.after(numLists,afterNewDefaults);
   //TAS.debug"at PFFeatures.migrate");
   getAttrs(['migrated_featurelists_defaults'],function(vm){
     var featuremigrated=0,abilitymigrated=0;
     featuremigrated=parseInt(vm['migrated_featurelists_defaults'],10)||0;
     //so current beta is not screwed up:
     if (!featuremigrated) {
       _.each(featureLists,function(section){
         setNewDefaults(doneOne,section);
       });
     } else {
       afterNewDefaults();
     }
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("leaving PFFeatures.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }), numLists, doneWithList, calculateMaxUses, callRecalcSLAs;
   try {
     //TAS.debug("at PFFeatures.recalculate");
     numLists = _.size(PFConst.repeatingMaxUseSections);
     doneWithList = _.after(numLists, function(){
       resetCommandMacro(done);
     });
     calculateMaxUses = function(){
       _.each(PFConst.repeatingMaxUseSections, function (section) {
         recalculateRepeatingMaxUsed(section, TAS.callback(doneWithList), silently);
       });
     };
     migrate(TAS.callback(calculateMaxUses),oldversion);
   } catch (err) {
     TAS.error("PFFeatures.recalculate, ", err);
     done();
   }
 },
 events = {
   commandMacroFields:["name","used","used_max","showinmenu"]
 },
 registerEventHandlers = function () {
   var tempstr="";
   //GENERIC REPEATING LISTS USED MAX

   _.each(PFConst.repeatingMaxUseSections, function (section) {
     var maxEvent = "change:repeating_" + section + ":max-calculation";
     on(maxEvent, TAS.callback(function eventRepeatingMaxUseSections(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       SWUtils.evaluateAndSetNumber("repeating_" + section + "_max-calculation", "repeating_" + section + "_used_max");
     }));
   });

   on("change:mythic-adventures-show change:use_traits change:use_racial_traits change:use_class_features change:use_feats change:use_spell-like-abilities", TAS.callback(function eventEnableMythicConfig(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
       resetTopCommandMacro(null,eventInfo);
     }
   }));

   _.each(featureLists, function (section) {
     var macroEvent = "remove:repeating_"+section+" ",
       singleEvent = "change:repeating_" + section + ":";

     macroEvent = _.reduce(events.commandMacroFields,function(m,a){
       m+= singleEvent + a + " ";
       return m;
     },macroEvent);
     on (macroEvent, TAS.callback(function eventRepeatingCommandMacroUpdate(eventInfo){
       var attr;
       attr = SWUtils.getAttributeName(eventInfo.sourceAttribute);
       if ( eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && attr==='used_max')) {
         attr='repeating_'+section+'_showinmenu';
         getAttrs([attr,'is_npc'],function(v){
           var isNPC=parseInt(v.is_npc,10)||0;
           if (parseInt(v[attr],10)===1){
             PFMenus.resetOneCommandMacro(section,isNPC);
           }
         });
       }
     }));
   });

 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFFeatures module loaded       ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   migrate: migrate,
   recalculateRepeatingMaxUsed: recalculateRepeatingMaxUsed,
   resetCommandMacro:resetCommandMacro,
   resetTopCommandMacro:resetTopCommandMacro
 };
}());
var PFAbility = PFAbility || (function () {
 'use strict';
 var
 optionFields= ['is_sp','hasposrange','hasuses','hasattack','abil-attacktypestr'],
 optionRepeatingHelperFields =['ability_type','range_numeric','frequency','abil-attack-type'],
 allOptionRepeatingFields=optionFields.concat(optionRepeatingHelperFields),
 tabRuleSorted ={
   'class-features':0,
   'feats':1,
   'monster-rule':8,
   'mythic-abilities':3,
   'mythic-feats':1,
   'other':8,
   'racial-traits':2,
   'special-abilities':5,
   'special-attacks':4,
   'special-qualities':7,
   'spell-like-abilities':6,
   'traits':2
 },
 tabTypeSorted = {
   'Ex':9,
   'Sp':10,
   'Su':11
 },
 categoryAttrs = ['tabcat-1','tabcat0','tabcat1','tabcat2','tabcat3','tabcat4','tabcat5','tabcat6','tabcat7','tabcat8','tabcat9','tabcat10','tabcat11'],
 /** sets tab for an ability. these have multiple checkboxes, not a radio
 *@param {string} id optional id of row
 *@param {function} callback call when done
 *@param {obj} eventInfo from 'on' event change:rule_category
 */
 setRuleTab = function(id,callback, eventInfo){
   var idStr = SWUtils.getRepeatingIDStr(id),
   prefix = "repeating_ability_" + idStr,
   catfields=[],
   ruleCategoryField=prefix+"rule_category",
   abilityTypeField=prefix+'ability_type',
   fields=[ruleCategoryField,abilityTypeField];
   catfields=_.map(categoryAttrs,function(attr){
     return prefix+attr;
   });
   fields = fields.concat(catfields);
   getAttrs(fields,function(v){
     var setter, ruleType=0,abilityType=0;
     setter = _.reduce(catfields,function(m,attr){
       m[attr]=0;
       return m;
     },{});
     if (v[abilityTypeField] ){
       abilityType= tabTypeSorted[v[abilityTypeField]];
       setter[prefix+'tabcat'+abilityType]=1;
     }
     if (v[ruleCategoryField]) {
       ruleType=tabRuleSorted[v[ruleCategoryField]];
       setter[prefix+'tabcat'+ruleType]=1;
     }
     if (!(ruleType || abilityType)){
       setter[prefix+'tabcat-1']=1;
     }
     //TAS.debug("PFAbility.setRuleTab, setting",setter);
     setAttrs(setter,PFConst.silentParams);
   });
 },
 setRuleTabs = function(){
   getSectionIDs("repeating_ability",function(ids){
     _.each(ids,function(id){
       setRuleTab(id);
     });
   });
 },
 otherCommandMacros = {
   'ex':" [^{extraordinary-abilities-menu}](~@{character_id}|NPCPREFIXex_button)",
   'sp':" [^{spell-like-abilities-menu}](~@{character_id}|NPCPREFIXsp_button)",
   'su':" [^{supernatural-abilities-menu}](~@{character_id}|NPCPREFIXsu_button)"
 },
 /** returns all rule_category and ability_type used
 * @returns {jsobj} {'rules':[values of rule_category], 'types':[valuesof ability_type]}
 */
 getAbilityTypes = function(callback){
   var done= function(typeObj){
     //TAS.debug('PFFeatures.getAbilityTypes returning with ',typeObj);
     if (typeof callback === "function"){
       callback(typeObj);
     }
   };
   getSectionIDs('repeating_ability',function(ids){
     var fields=[];
     if(!ids || _.size(ids)===0){
       done({'rules':[],'types':[]});
       return;
     }
     _.each(ids,function(id){
       var prefix='repeating_ability_'+id+'_';
       fields.push(prefix+'rule_category');
       fields.push(prefix+'showinmenu');
       fields.push(prefix+'ability_type');
     });
     getAttrs(fields,function(v){
       var basearray=[], rulearray = [], typearray=[];
       basearray = _.chain(ids)
         .map(function(id){
           var retObj={},prefix='repeating_ability_'+id+'_';
           retObj.id =id;
           retObj.showinmenu=parseInt(v[prefix+'showinmenu'],10)||0;
           retObj.rule_category = v[prefix+'rule_category']||'';
           retObj.ability_type=(v[prefix+'ability_type']||'').toLowerCase();
           //TAS.debug("row "+id+" is ",retObj);
           return retObj;
         })
         .filter(function(o){return o.showinmenu;})
         .value();

       if (basearray){
         rulearray = _.chain(basearray)
           .groupBy('rule_category')
           .keys()
           .compact()
           .value();
         typearray= _.chain(basearray)
           .groupBy('ability_type')
           .keys()
           .compact()
           .value();
       }
       if (!rulearray){rulearray=[];}
       if (!typearray){typearray=[];}
       done({'rules':rulearray,'types':typearray});
     });
   });
 },
 /** resetTopCommandMacro sets all-abilities_buttons_macro (menu of ability menus)
 *@param {function} callback call when done
 */
 getTopOfMenu=function(callback,isNPC){
   var done = function (str) {
     TAS.debug("leaving PFAbility.getTopOfMenu");
     if (typeof callback === "function") {
       callback(str);
     }
   },
   newMacro="",setter={};
   try {
     newMacro = " @{orig_ability_header_macro}";
     getAbilityTypes(function(used){
       var addlMacros="",
       prefix="";
       try {
         if (isNPC){
           prefix="NPC-";
         }
         if(used.types ){
           _.each(used.types,function(type){
             if(otherCommandMacros[type]){
               addlMacros += otherCommandMacros[type].replace("NPCPREFIX",prefix);
             } else if (type) {
               TAS.warn("cound not find top macro for "+type);
             }
           });
         }
         if(addlMacros){
           newMacro += " {{row03=^{ability-menus}}} {{row04=" + addlMacros + "}}";
         }
         //TAS.debug("PFAbility.getTopOfMenu: done building top macro it is :",newMacro);
       } catch (innererr){
         TAS.error("PFAbility.getTopOfMenu innererr",innererr);
       } finally {
         done(newMacro);
       }
     });
   } catch(err) {
     TAS.error("PFAbility.getTopOfMenu",err);
     done(newMacro);
   }
 },
 resetCommandMacro = function(callback){
   getAttrs(['is_npc'],function(v){
     var isNPC = parseInt(v.is_npc,10)||0;
     getTopOfMenu ( function(header){
       PFMenus.resetOneCommandMacro('ability',isNPC,null,header);
     }, isNPC);
     PFMenus.resetOneCommandMacro('ex',isNPC);
     PFMenus.resetOneCommandMacro('sp',isNPC);
     PFMenus.resetOneCommandMacro('su',isNPC);
     if (isNPC){
       getTopOfMenu ( function(header){
         PFMenus.resetOneCommandMacro('ability',false,null,header);
       });
       PFMenus.resetOneCommandMacro('ex');
       PFMenus.resetOneCommandMacro('sp');
       PFMenus.resetOneCommandMacro('su');
     }
     if (typeof callback === "function"){
       callback();
     }
   });
 },
 defaultMacroMap ={
   'abilities': 'default'
 },
 defaultMacros={
   'default': {
     defaultRepeatingMacro: '&{template:pf_ability} @{toggle_accessible_flag} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_ability}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle=^{@{rule_category}}}} {{name=@{name}}} {{rule_category=@{rule_category}}} {{source=@{class-name}}} {{is_sp=@{is_sp}}} {{hasspellrange=@{range_pick}}} {{spell_range=^{@{range_pick}}}} {{casterlevel=[[@{casterlevel}]]}} {{spell_level=[[@{spell_level}]]}} {{hasposrange=@{hasposrange}}} {{custrange=@{range}}} {{range=[[@{range_numeric}]]}} {{save=@{save}}} {{savedc=[[@{savedc}]]}} {{hassr=@{abil-sr}}} {{sr=^{@{abil-sr}}}} {{hasfrequency=@{hasfrequency}}} {{frequency=^{@{frequency}}}} {{next_cast=@{rounds_between}}} {{hasuses=@{hasuses}}} {{uses=@{used}}} {{uses_max=@{used|max}}} {{cust_category=@{cust-category}}} {{concentration=[[@{Concentration-mod}]]}} {{damage=@{damage-macro-text}}} {{damagetype=@{damage-type}}} {{hasattack=@{hasattack}}} {{attacktype=^{@{abil-attacktypestr}}}} {{targetarea=@{targets}}} {{duration=@{duration}}} {{shortdesc=@{short-description}}} {{description=@{description}}} {{deafened_note=@{SpellFailureNote}}}',
     defaultRepeatingMacroMap:{
       '&{template:':{'current':'pf_ability}'},
       '@{toggle_accessible_flag}':{'current':'@{toggle_accessible_flag}'},
       '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
       '{{color=':{'current':'@{rolltemplate_color}}}'},
       '{{header_image=':{'current':'@{header_image-pf_ability}}}','old':['@{header_image-pf_block}}}']},
       '{{character_name=':{'current':'@{character_name}}}'},
       '{{character_id=':{'current':'@{character_id}}}'},
       '{{subtitle=':{'current':'^{@{rule_category}}}}'},
       '{{name=':{'current':'@{name}}}'},
       '{{rule_category=':{'current':'@{rule_category}}}'},
       '{{source=':{'current':'@{class-name}}}'},
       '{{is_sp=':{'current':'=@{is_sp}}}'},
       '{{hasspellrange=':{'current':'@{range_pick}}}'},
       '{{hassave=':{'current':'@{save}}}'},
       '{{spell_range=':{'current':'^{@{range_pick}}}}'},
       '{{hasposrange=':{'current':'@{hasposrange}}}'},
       '{{custrange=':{'current':'@{range}}}'},
       '{{range=':{'current':'[[@{range_numeric}]]}}'},
       '{{save=':{'current':'@{save}}}'},
       '{{savedc=':{'current':'[[@{savedc}]]}}','old':['@{savedc}}}']},
       '{{casterlevel=':{'current':'[[@{casterlevel}]]}}'},
       '{{spell_level=':{'current':'[[@{spell_level}]]}}'},
       '{{hassr=':{'current':'@{abil-sr}}}'},
       '{{sr=':{'current':'^{@{abil-sr}}}}'},
       '{{^{duration}=':{'current':'@{duration}}}'},
       '{{hasfrequency=':{'current':'@{frequency}}}'},
       '{{frequency=':{'current':'^{@{frequency}}}}'},
       '{{next_cast=':{'current':'@{rounds_between}}}'},
       '{{hasuses=':{'current':'@{hasuses}}}'},
       '{{uses=':{'current':'@{used}}}'},
       '{{uses_max=':{'current':'@{used|max}}}'},
       '{{cust_category=':{'current':'@{cust-category}}}'},
       '{{concentration=':{'current':'[[@{Concentration-mod}]]}}','old':['@{Concentration-mod}}','@{Concentration-mod}}}']},
       '{{damage=':{'current':'@{damage-macro-text}}}'},
       '{{damagetype=':{'current':'@{damage-type}}}'},
       '{{hasattack=':{'current':'@{hasattack}}}'},
       '{{attacktype=':{'current':'^{@{abil-attacktypestr}}}}'},
       '{{targetarea=':{'current':'@{targets}}}'},
       '{{shortdesc=':{'current':'@{short-description}}}'},
       '{{description=':{'current':'@{description}}}'},
       '{{deafened_note=':{'current':'@{SpellFailureNote}}}'}
       },
     defaultDeletedArray: null
   }
 },
 importFromCompendium = function(callback,eventInfo){
   var done=_.once(function(){
     resetCommandMacro();
     TAS.debug("leaving PFAbility.importFromCompendium");
     if(typeof callback === "function"){
       callback();
     }
   }),
   id = SWUtils.getRowId(eventInfo.sourceAttribute), //row doesn't really exist yet so get id from event
   prefix='repeating_ability_'+id+'_';
   //TAS.debug"at PFAbility.importFromCompendium for "+ prefix);
   getAttrs(['is_undead',prefix+'name',prefix+'compendium_category',prefix+'rule_category', prefix+'ability_type_compendium',prefix+'ability_type',prefix+'description',
   prefix+'range_from_compendium',prefix+'target_from_compendium',prefix+'area_from_compendium',prefix+'effect_from_compendium'],function(v){
     var compcat='' , abilitytype='',ability_basis='',location='',setter={},newcat='', abilname ='',silentSetter={}, match, note='',areaEffectText='',newRangeSettings;
     try {
       //TAS.debug("PFAbility.importFromCompendium got values: ",v);
       if(v[prefix+'ability_type_compendium']){
         abilitytype=v[prefix+'ability_type_compendium'];
         setter[prefix+'ability_type']=abilitytype;
         silentSetter[prefix+'ability_type_compendium']="";
       }
       compcat = v[prefix+'compendium_category'];
       silentSetter[prefix+'compendium_category']="";
       if (compcat){
         compcat=compcat.toLowerCase();
         if (compcat==='feats') {
           newcat='feats';
         } else if (compcat==='monster rule'){
           newcat='monster-rule';
         } else if (compcat==='spell'){
           newcat='spell-like-abilities';
         }
         if (newcat === 'monster-rule'){
           if( v[prefix+'description']){
             match=v[prefix+'description'].match(/Location\:\s*(.*)$/i);
             //TAS.debug"matching "+match);
             if(match && match[1]){
               location=SWUtils.trimBoth(match[1].toLowerCase());
               match = location.match(/special qual|sq|special att|special abil|defens|spell/i);
               if (match){
                 switch(match[0]){
                   case 'special qual':
                   case 'sq':
                     newcat='special-qualities';break;
                   case 'special att':
                     newcat='special-attacks';break;
                   case 'special abil':
                     newcat='special-abilities';break;
                   case 'defens':
                     newcat='defensive-abilities';break;
                   case 'spell':
                     newcat='spell-like-abilities';break;
                 }
               }
             }
           }
         }
         if(abilitytype==='Sp'  && !newcat){
           newcat='spell-like-abilities';
         }
         if(!abilitytype && newcat==='spell-like-abilities'){
           abilitytype='Sp';
           setter[prefix+'ability_type']='Sp';
         } else if (abilitytype === 'Sp' && !newcat){
           newcat='spell-like-abilities';
         }

         if (newcat){
           setter[prefix+'rule_category']=newcat;
         } else {
           note+=compcat;
         }
         if (abilitytype==='Sp'){
           areaEffectText = v[prefix+'target_from_compendium']||
             v[prefix+'area_from_compendium']|| v[prefix+'effect_from_compendium']|| "";
           setter[prefix+'targets'] = areaEffectText;
           if(v[prefix+'range_from_compendium']){
             newRangeSettings = PFUtils.parseSpellRangeText(v[prefix+'range_from_compendium'], areaEffectText);
             setter[prefix+"range_pick"] = newRangeSettings.dropdown;
             setter[prefix+"range"] = newRangeSettings.rangetext;
           }
           setter[prefix+'ability-basis']= '@{CHA-mod}';

         } else if ( v[prefix+'name']){
           abilname = v[prefix+'name'].tolowercase();
           abilname = abilname.match(/^[^(]+/);
           if(PFDB.specialAttackDCAbilityBase[abilname]){
             ability_basis= PFDB.specialAttackDCAbilityBase[abilname];
           } else {
             ability_basis = 'CON';
           }
           if (ability_basis === 'CON' && parseInt(v.is_undead,10)){
             ability_basis = 'CHA';
           }
           ability_basis ='@{'+ability_basis+'}';
           setter[prefix+'ability-basis']= ability_basis;
         }
       }
     } catch (err){
       TAS.error("PFAbility.importFromCompendium",err);
     } finally {
       if(_.size(silentSetter)>0){
         setAttrs(silentSetter,PFConst.silentParams);
       }
       //TAS.debug"PFAbility.importFromCompendium, setting",setter);
       if (_.size(setter)>0){
         setAttrs(setter,{},done);
       } else {
         done();
       }
     }

   });
 },
 setClassName = function(id,callback,eventInfo){
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   }),
   idStr = SWUtils.getRepeatingIDStr(id),
   prefix="repeating_ability_"+idStr,
   clbasisField=prefix+"CL-basis";
   getAttrs([prefix+'CL-basis',prefix+'class-name',"race","class-0-name","class-1-name","class-2-name","class-3-name","class-4-name","class-5-name"],function(v){
     var clBase='',setter={},match;
     try {
       if (v[clbasisField]){
         if (v[clbasisField]==="@{level}"){
           clBase =v["race"];
         } else if (v[clbasisField]==="@{npc-hd-num}"){
           clBase = v["race"];
         } else if (parseInt(v[clbasisField],10)===0){
           clBase ="";
         } else {
           match = v[prefix+"CL-basis"].match(/\d+/);
           if (match){
             clBase=v["class-"+match[0]+"-name"];
           }
         }
         if(v[prefix+'class-name']!==clBase){
           setter[prefix+'class-name']=clBase;
         }
       }
     } catch(err) {
       TAS.error("PFAbility.setClassName",err);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter,PFConst.silentParams,done);
       } else {
         done();
       }
     }
   });
 },
 setAttackEntryVals = function(spellPrefix,weaponPrefix,v,setter,noName){
   var notes="",attackType="";
   setter = setter||{};
   try {
     attackType=PFUtils.findAbilityInString(v[spellPrefix + "abil-attack-type"]);
     if (v[spellPrefix + "name"]) {
       if(!noName){
         setter[weaponPrefix + "name"] = v[spellPrefix + "name"];
       }
       setter[weaponPrefix + "source-spell-name"] = v[spellPrefix + "name"];
     }
     if (attackType) {
       setter[weaponPrefix + "attack-type"] = v[spellPrefix + "abil-attack-type"];
       if ((/CMB/i).test(attackType)) {
         setter[weaponPrefix + "vs"] = "cmd";
       } else if ((/ranged/i).test(attackType)) {
         setter[weaponPrefix + "vs"] = "touch";
         setter[weaponPrefix + "isranged"] = 1;
         setter[weaponPrefix+"range"] = v[spellPrefix+"range_numeric"];
       } else {
         setter[weaponPrefix + "vs"] = "touch";
       }
     }

     if (v[spellPrefix +"damage-macro-text"]){
       setter[weaponPrefix+"precision_dmg_macro"] = v[spellPrefix+"damage-macro-text"];
       if(attackType){
         setter[weaponPrefix+"critical_dmg_macro"] = v[spellPrefix+"damage-macro-text"];
       } else {
         setter[weaponPrefix+"critical_dmg_macro"]="";
       }
     }
     if (v[spellPrefix+ "damage-type"]){
       setter[weaponPrefix+"precision_dmg_type"] = v[spellPrefix+"damage-type"];
       if(attackType){
         setter[weaponPrefix+"critical_dmg_type"] = v[spellPrefix+"damage-type"];
       }else {
         setter[weaponPrefix+"critical_dmg_type"]="";
       }
     }

     if (v[spellPrefix+"save"]){
       if (notes) { notes += ", ";}
       notes += "Save: "+ v[spellPrefix+"save"] + " DC: [[@{" + spellPrefix + "savedc}]]";
     }
     if ( v[spellPrefix+"sr"]){
       if (notes) { notes += ", ";}
       notes += "Spell resist:"+ v[spellPrefix+"abil-sr"];
     }
     if (notes){
       setter[weaponPrefix+"notes"]=notes;
     }
   } catch (err){
     TAS.error("PFAbility.setAttackEntryVals",err);
   } finally {
     return setter;
   }
 },
 /**Triggered from a button in repeating spells
 *@param {string} id the row id or null
 *@param {function} callback when done
 *@param {boolean} silently setattrs silent:true
 *@param {object} eventInfo if id is null get id from here.
 */
 createAttackEntryFromRow = function (id, callback, silently, eventInfo, weaponId) {
   var done = _.once(function () {
     TAS.debug("leaving PFAbility.createAttackEntryFromRow");
     if (typeof callback === "function") {
       callback();
     }
   }),
   attribList = [],
   itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : ""),
   //idStr = PFUtils.getRepeatingIDStr(itemId),
   item_entry = 'repeating_ability_' + itemId + '_',
   slaPrefix = item_entry , //'repeating_ability_' + idStr,
   attributes = ["range_numeric","damage-macro-text","damage-type","abil-sr","savedc","save","abil-attack-type", "name"]
   ;
   //the disabled ones never show up
//		TAS.debug("at PFAbility creatattack entry ");
   if(!itemId){
     TAS.warn("Cannot create usable attack entry from SLA since we cannot identify the row id");
   }
   attributes.forEach(function(attr){
     attribList.push(slaPrefix +  attr);
   });

   //TAS.debug("PFAbility.createAttackEntryFromRow: attribList=" + attribList);
   getAttrs(attribList, function (v) {
     var newRowId="",
     setter = {},
     prefix = "repeating_weapon_",
     idStr="",
     params = {};
     try {
       //TAS.debug("at PFAbility.createAttackEntryFromRow",v);
       if (!PFUtils.findAbilityInString(v[slaPrefix + "abil-attack-type"]) && !v[slaPrefix+"damage-macro-text"]){
         TAS.warn("no attack to create for ability "+ v[slaPrefix+"name"] +", "+ itemId );
       } else {
         if (!weaponId){
           newRowId = generateRowID();
         } else {
           newRowId = weaponId;
         }
         idStr = newRowId+"_";
         prefix += idStr;
         setter = setAttackEntryVals(item_entry, prefix,v,setter,weaponId);
         setter[prefix + "source-ability"] = itemId;
         setter[prefix+"group"]="Special";
       }
     } catch (err) {
       TAS.error("PFAbility.createAttackEntryFromRow", err);
     } finally {
       if (_.size(setter)>0){
         setter[slaPrefix + "create-attack-entry"] = 0;
         if (silently) {
           params = PFConst.silentParams;
         }
         //TAS.debug("PFAbility.createAttackEntryFromRow setting:",setter);
         setAttrs(setter, {}, function(){
           //can do these in parallel
           //TAS.debug("PFAbility.createAttackEntryFromRow came back from setter ");
           PFAttackOptions.resetOption(newRowId);
           PFAttackGrid.resetCommandMacro();
           done();
         });
       } else {
         setter[slaPrefix + "create-attack-entry"] = 0;
         setAttrs(setter,PFConst.silentParams,done);
       }
     }
   });
 },
 updateAssociatedAttack = function (id, callback, silently, eventInfo) {
   var done = _.once(function () {
     TAS.debug("leaving PFAbility.updateAssociatedAttack");
     if (typeof callback === "function") {
       callback();
     }
   }),
   itemId = "", item_entry = "",attrib = "", attributes=[];
   itemId = id || (eventInfo ? SWUtils.getRowId(eventInfo.sourceAttribute) : "");
   item_entry = 'repeating_spells_' + PFUtils.getRepeatingIDStr(itemId);
   attrib = (eventInfo ? SWUtils.getAttributeName(eventInfo.sourceAttribute) : "");
   attributes=[];
   //TAS.debug("at PF Spell like abilities updateAssociatedAttack: for row" + id   );
   if (attrib){
     attributes = [item_entry+attrib];
     if ((/range/i).test(attrib)){
       attributes =[item_entry+'range_pick',item_entry+'range',item_entry+'range_numeric'];
     }
   } else {
     attributes = ["range_pick","range","range_numeric","damage-macro-text","damage-type","sr","savedc","save","abil-attack-type","name"];
   }
   getAttrs(attributes,function(spellVal){
     getSectionIDs("repeating_weapon", function (idarray) { // get the repeating set
       var spellsourcesFields=[];
       spellsourcesFields = _.reduce(idarray,function(memo,currentID){
         memo.push("repeating_weapon_"+currentID+"_source-ability");
         return memo;
       },[]);
       getAttrs(spellsourcesFields,function(v){
         var setter={}, params={},idlist=[];
         try {
           _.each(idarray,function(currentID){
             var prefix = "repeating_weapon_"+currentID+"_";
             if (v[prefix+"source-ability"]===itemId){
               idlist.push(currentID);
               setter= setAttackEntryVals(item_entry, prefix,spellVal,setter);
             }
           });
         } catch (err){
           TAS.error("PFAbility.updateAssociatedAttack",err);
         } finally {
           if (_.size(setter)>0){
             if (silently) {
               params = PFConst.silentParams;
             }
             setAttrs(setter, params, function(){
               PFAttackOptions.resetSomeOptions(idlist);
             });
           } else {
             done();
           }
         }
       });
     });
   });
 },
 updateCharLevel = function(id,callback,eventInfo){
   var done=_.once(function(){
     TAS.debug("leaving updateCharLevel");
     if (typeof callback === "function"){
       callback();
     }
   }),
   idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_ability_"+idStr;
   getAttrs([prefix+"CL-misc-mod",prefix+"CL-basis-mod",prefix+"casterlevel",prefix+"ability_type","buff_CasterLevel-total", "CasterLevel-Penalty"],function(v){
     var clBase=0,cl=0,misc=0,pen=0,isSP=0,setter={};
     try {
       isSP=parseInt(v[prefix+"ability_type"],10)||0;
       clBase = parseInt(v[prefix+"CL-basis-mod"],10)||0;
       misc= parseInt(v[prefix+"CL-misc-mod"],10)||0;
       pen = parseInt(v["CasterLevel-Penalty"],10)||0;
       cl= clBase+misc+pen;
       if (isSP){
         cl+=parseInt(v["buff_CasterLevel-total"],10)||0;
       }
       if (cl !== parseInt(v[prefix+'casterlevel'],10)){
         setter[prefix+'casterlevel']=cl;
       }
     } catch (err){
       TAS.error("PFAbility.updateCharLevel",err);
     } finally {
       if (_.size(setter)){
         setAttrs(setter,{},done);
       } else {
         done();
       }
     }
   });
 },
 updateAbilityRange = function(id, callback, silently, eventInfo){
   var done=_.once(function(){
     TAS.debug("leaving updateAbilityRange");
     if (typeof callback === "function"){
       callback();
     }
   }),
   idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_ability_"+idStr;
   getAttrs([prefix+"range_pick",prefix+"range",prefix+"range_numeric",prefix+"casterlevel",prefix+"ability_type"], function(v){
     var  newRange=0,currRange=0,cl=0,setter={},isSP=0,currPosRange=0;
     try {
       isSP=(v[prefix+'ability_type']==='Sp')?1:0;
       currRange = parseInt(v[prefix+"range_numeric"],10)||0;
       if(isSP){
         cl=parseInt(v[prefix+'casterlevel'],10)||0;
         newRange = PFUtils.findSpellRange(v[prefix+"range"], v[prefix+"range_pick"], cl)||0;
       } else {
         newRange = parseInt(SWUtils.trimBoth(v[prefix+'range']),10)||0;
       }
       if (newRange!== currRange){
         //TAS.debug("updating range");
         setter[prefix+"range_numeric"]=newRange;
       }
       currPosRange = parseInt(v[prefix+'hasposrange'],10)||0;
       if (newRange > 0 && !currPosRange) {
         setter[prefix+'hasposrange']=1;
       } else if (currPosRange) {
         setter[prefix+'hasposrange']=0;
       }
     } catch (err){
       TAS.error("updateAbilityRange",err);
     } finally {
       if (_.size(setter)){
         setAttrs(setter,{},done);
       } else {
         done();
       }
     }
   });
 },
 /** to use in calls to _.invoke or otherwise, sets switch variables to setter for given row
 * @param {jsobj} setter to pass in first var of setAttrs
 * @param {string} id the id of this row, or null if we are within the row context already
 * @param {jsobj} v the values needed returned by getAttrs
 */
 resetOption = function (setter, id, v, eventInfo){
   var idStr=SWUtils.getRepeatingIDStr(id),
   prefix='repeating_ability_'+idStr,
   isSP='', posRange='', hasUses='', hasFrequency='', hasAttack='', atkstr='', attackStrForDisplay='';
   setter= setter||{};
   try {
     if(!v){return setter;}
     isSP= (v[prefix+'ability_type']==='Sp')?'1':'';

     if(isSP !== v[prefix+'is_sp']){
       setter[prefix+'is_sp']=isSP;
     }
     posRange=(parseInt(v[prefix+'range_numeric'],10)||0)>0?'1':'';
     if (posRange !== v[prefix+'hasposrange']) {
       setter[prefix+'hasposrange']=posRange;
     }
     if(v[prefix+'frequency'] && v[prefix+'frequency']!=='not-applicable'){
       hasFrequency='1';
       switch(v[prefix+'frequency']){
         case 'perday':
         case 'permonth':
         case 'hexfreq':
         case 'other':
           hasUses='1';
           break;
       }
     }
     if(hasFrequency !== v[prefix+'hasfrequency']){
       setter[prefix+'hasfrequency']=hasFrequency;
     }
     if (hasUses !== v[prefix+'hasuses']){
       setter[prefix+'hasuses']=hasUses;
     }
     if(PFUtils.findAbilityInString(v[prefix+'abil-attack-type'])){
       hasAttack='1';
     }
     if (hasAttack !== v[prefix+'hasattack']){
       setter[prefix+'hasattack']=hasAttack;
     }
     if(hasAttack){
       atkstr=v[prefix+'abil-attack-type'].toLowerCase();
       if(atkstr.indexOf('melee')>=0){
         attackStrForDisplay='touch';
       } else if (atkstr.indexOf('range')>=0){
         attackStrForDisplay='ranged-touch-ray';
       } else if (atkstr.indexOf('cmb')>=0){
         attackStrForDisplay='combat-maneuver-bonus-abbrv';
       }
     }
     if (attackStrForDisplay !== v[prefix+'abil-attacktypestr']){
       setter[prefix+'abil-attacktypestr']=attackStrForDisplay;
     }
   } catch (err){
     TAS.error("PFAbility.recalcAbilities",err);
   } finally {
     return setter;
   }
 },
 resetOptionAsync = function (id, callback , eventInfo){
   var done = _.once(function(){
     TAS.debug("leaving PFAbility.resetOption");
     if (typeof callback === "function"){
       callback();
     }
   }),
   idStr=SWUtils.getRepeatingIDStr(id),
   prefix='repeating_ability_'+idStr,
   fields=[];
   fields = _.map(allOptionRepeatingFields,function(attr){
     return prefix + attr;
   });
   getAttrs(fields,function(v){
     var setter={};
     try {
       setter = resetOption(setter,id,v);
     } catch (err){
       TAS.error("PFAbility.recalcAbilities",err);
     } finally {
       if (_.size(setter)){
         setAttrs(setter,PFConst.silentParams,done,eventInfo);
       } else {
         done();
       }
     }
   });
 },
 recalcAbilities = function(callback,silently, eventInfo,levelOnly){
   var done = _.once(function(){
     TAS.debug("leaving PFAbility.recalcAbilities");
     if (typeof callback === "function"){
       callback();
     }
   });
   getSectionIDs('repeating_ability',function(ids){
     var numids = _.size(ids),
       doneOne, calllevel;
     if(numids===0){
       done();
       return;
     }
     //TAS.debug("there are "+ numids+" rows to recalc");
     doneOne	= _.after(numids,done);
     //refactor to do all rows at once
     calllevel= function(id){
       PFUtilsAsync.setRepeatingDropdownValue('ability',id,'CL-basis','CL-basis-mod',function(){
         //TAS.debug("PFAbility.recalcAbilities calling updateCharLevel for "+id);
         updateCharLevel(id,function(){
           TAS.debug("PFAbility.recalcAbilities calling updateAbilityRange for "+id);
           updateAbilityRange(id,function(){
           //	TAS.debug("PFAbility.recalcAbilities calling updateAssociatedAttack for "+id);
           //	updateAssociatedAttack(id,null,false,null);
             doneOne();
           });
         });
       });
     };
     _.each(ids,function(id){
       calllevel(id);
       if (!levelOnly){
         resetOptionAsync(id);
       }
     });
   });
 },
 migrateRepeatingMacros = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFAbility.migrateRepeatingMacros");
     if (typeof callback === "function") {
       callback();
     }
   }),
   migrated = _.once(function(){
     setAttrs({'migrated_ability_macrosv112':1},PFConst.silentParams);
     done();
   }),
   defaultName = '',defaultMacro='',
   section = 'ability';
   getAttrs(['migrated_ability_macrosv112'],function(v){
     try {
       if(!parseInt(v.migrated_ability_macrosv112,10)){

         defaultName = defaultMacroMap[section]||'default';
         defaultMacro=defaultMacros[defaultName];
         if (!defaultMacro){
           TAS.error("cannot find default macro for section "+section);
           done();
           return;
         }
         //TAS.debug("PFAbility.migrateRepeatingMacros about to call PFMacros",defaultMacro);
         PFMacros.migrateRepeatingMacros(migrated,section,'macro-text',defaultMacro.defaultRepeatingMacro,defaultMacro.defaultRepeatingMacroMap,defaultMacro.defaultDeletedArray,'@{NPC-whisper}');
       } else {
         migrated();
       }
     } catch (err){
       TAS.error("PFAbility.migrateRepeatingMacros error setting up "+section,err);
       done();
     }
   });
 },
 migrate = function (callback,silently){
   var done = function(){
     TAS.debug("leaving PFAbility.migrate");
     if (typeof callback === "function"){
       callback();
     }
   };
   migrateRepeatingMacros(done);
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("leaving PFAbility.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneWithList = function(){
     //TAS.debug("now calling resetcommandmacro");
     resetCommandMacro();
     done();
   },
   callRecalcAbilities = function(){
     //TAS.debug("PF1 calling recalcAbilities");
     recalcAbilities(TAS.callback(doneWithList));
     setRuleTabs();
   };
   try {
     //TAS.debug("at PFAbility.recalculate");
     migrate(TAS.callback(callRecalcAbilities));
   } catch (err) {
     TAS.error("PFAbility.recalculate, ", err);
     done();
   }
 },
 events = {
   attackEventsSLA:["damage-macro-text","damage-type","abil-sr","save","abil-attack-type","name","range_numeric"],
   commandMacroFields:["name","used","used_max","showinmenu","ability_type","frequency","rule_category"]
 },
 registerEventHandlers = function () {
   var eventToWatch="",
   macroEvent = "remove:repeating_ability ",
   singleEvent = "change:repeating_ability:";

   macroEvent = _.reduce(events.commandMacroFields,function(m,a){
     m+= singleEvent + a + " ";
     return m;
   },macroEvent);
   on (macroEvent, TAS.callback(function eventRepeatingCommandMacroUpdate(eventInfo){
     var attr;
     attr = SWUtils.getAttributeName(eventInfo.sourceAttribute);
     if ( eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && attr==='used_max')) {
       PFFeatures.resetTopCommandMacro(null,eventInfo);
       resetCommandMacro();
     }
   }));
   on("change:repeating_ability:CL-basis", TAS.callback(function eventAbilityClassDropdown(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     SWUtils.evaluateAndSetNumber('repeating_ability_CL-basis','repeating_ability_CL-basis-mod');
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" ) {
       setClassName(null,null,eventInfo);
     }
   }));
   eventToWatch = _.reduce(optionRepeatingHelperFields,function(m,a){
     m+= 'change:repeating_ability:'+a+' ';
     return m;
   },"");
   on(eventToWatch,	TAS.callback(function eventChangeAbilityTypeFrequencyOrRange(eventInfo){
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || eventInfo.sourceAttribute.indexOf('range')>0 ) {
         resetOptionAsync();
       }
   }));
   on("change:repeating_ability:CL-misc change:repeating_ability:spell_level-misc",
     TAS.callback(function eventSLAEquationMacro(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     SWUtils.evaluateAndSetNumber(eventInfo.sourceAttribute, eventInfo.sourceAttribute+"-mod");
   }));
   on("change:buff_CasterLevel-total change:CasterLevel-Penalty",
     TAS.callback(function eventAbilityLevelChange(eventInfo){
     if (eventInfo.sourceType === "sheetworker"  ) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       recalcAbilities(null,null,eventInfo,true);
     }
   }));
   on("change:repeating_ability:CL-basis-mod change:repeating_ability:CL-misc-mod",
     TAS.callback(function eventAbilityLevelChange(eventInfo){
     if (eventInfo.sourceType === "sheetworker"  ) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateCharLevel(null,null,eventInfo);
     }
   }));
   on("change:repeating_ability:compendium_category", TAS.callback(function eventAbilityCompendium(eventInfo){
     if (eventInfo.sourceAttribute !== "sheetworker"){
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       importFromCompendium(null,eventInfo);
     }
   }));
   on("change:repeating_ability:create-attack-entry", TAS.callback(function eventcreateAttackEntryFromSLA(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       createAttackEntryFromRow(null,null,false,eventInfo);
     }
   }));
   on("change:repeating_ability:CL-misc-mod change:repeating_ability:CL-basis-mod change:repeating_ability:range_pick change:repeating_ability:range",
     TAS.callback(function eventClassRangeMod(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     //cl-misc-mod, cl-basis-mod  is sheetworker, range_pick and range must be player
     if ( ((/range/i).test(eventInfo.sourceAttribute) && (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" )) ||
       ((/CL/i).test(eventInfo.sourceAttribute) && eventInfo.sourceType === "sheetworker") ) {
         updateAbilityRange(null,null,false,eventInfo);
       }
   }));
   eventToWatch = _.reduce(events.attackEventsSLA,function(memo,attr){
     memo+="change:repeating_ability:"+attr+" ";
     return memo;
   },"");
   on(eventToWatch,	TAS.callback(function eventupdateAssociatedSLAttackAttack(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && !((/attack\-type/i).test(eventInfo.sourceAttribute) ))) {
       updateAssociatedAttack(null,null,null,eventInfo);
     }
   }));
   on("change:repeating_ability:rule_category change:repeating_ability:ability_type", TAS.callback(function eventUpdateSLARuleCat(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event" + eventInfo.sourceType);
     setRuleTab(null,null,eventInfo);
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFAbility module loaded        ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate: migrate,
   migrateRepeatingMacros: migrateRepeatingMacros,
   createAttackEntryFromRow: createAttackEntryFromRow,
   recalcAbilities: recalcAbilities,
   recalculate: recalculate,
   resetCommandMacro: resetCommandMacro
 };
}());
var PFAttacks = PFAttacks || (function () {
 'use strict';
 /** module for repeating_weapon section  */
 /* **********************************ATTACKS PAGE ********************************** */
 var damageRowAttrs=["damage-ability-max","damage-ability-mod","damage-mod","damage_ability_mult","enhance","total-damage"],
 damageRowAttrsLU=_.map(damageRowAttrs,function(a){return '_'+a;}),
 updateRowAttrs=["attack-mod","attack-type","attack-type-mod","crit_conf_mod","crit_confirm",
   "isranged","masterwork","proficiency","total-attack",
   "attack-type_macro_insert","damage-type_macro_insert"].concat(damageRowAttrs),
 updateRowAttrsLU = _.map(updateRowAttrs,function(a){return '_'+a;}),
 updateCharAttrs=["attk_ranged_crit_conf", "attk_ranged2_crit_conf", "attk_melee_crit_conf",
   "attk_melee2_crit_conf", "attk_cmb_crit_conf", "attk_cmb2_crit_conf","DMG-mod"],

 defaultRepeatingMacro = '&{template:pf_attack} @{toggle_attack_accessible} @{toggle_rounded_flag} {{color=@{rolltemplate_color}}} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name=@{name}}} {{attack=[[ 1d20cs>[[ @{crit-target} ]] + @{attack_macro} ]]}} {{damage=[[@{damage-dice-num}d@{damage-die} + @{damage_macro}]]}} {{crit_confirm=[[ 1d20 + @{attack_macro} + [[ @{crit_conf_mod} ]] ]]}} {{crit_damage=[[ [[ @{damage-dice-num} * (@{crit-multiplier} - 1) ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}} {{type=@{type}}} {{weapon_notes=@{notes}}} @{iterative_attacks} @{macro_options} {{vs=@{vs}}} {{vs@{vs}=@{vs}}} {{precision_dmg1=@{precision_dmg_macro}}} {{precision_dmg1_type=@{precision_dmg_type}}} {{precision_dmg2=@{global_precision_dmg_macro}}} {{precision_dmg2_type=@{global_precision_dmg_type}}} {{critical_dmg1=@{critical_dmg_macro}}} {{critical_dmg1_type=@{critical_dmg_type}}} {{critical_dmg2=@{global_critical_dmg_macro}}} {{critical_dmg2_type=@{global_critical_dmg_type}}} {{attack1name=@{iterative_attack1_name}}}',
 defaultRepeatingMacroMap={
   '&{template:':{'current':'pf_attack}',old:['pf_generic}','pf_block}']},
   '@{toggle_attack_accessible}':{'current':'@{toggle_attack_accessible}'},
   '@{toggle_rounded_flag}':{'current':'@{toggle_rounded_flag}'},
   '{{color=':{'current':'@{rolltemplate_color}}}'},
   '{{character_name=':{'current':'@{character_name}}}'},
   '{{character_id=':{'current':'@{character_id}}}'},
   '{{subtitle}}':{'current':'{{subtitle}}'},
   '{{name=':{'current':'@{name}}}'},
   '{{attack=':{'current':'[[ 1d20cs>[[ @{crit-target} ]] + @{attack_macro} ]]}}','old':['{{attack=[[ 1d20cs>[[ @{crit-target} ]] + [[ @{total-attack} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} ]]','to':'@{attack_macro}'},{'from':'@{total-attack}','to':'@{attack_macro}'}]},
   '{{damage=':{'current':'[[@{damage-dice-num}d@{damage-die} + @{damage_macro}]]}}','old':['[[ @{damage-dice-num}d@{damage-die} + [[ @{total-damage} ]] ]]}}'],'replacements':[{'from':'[[ @{total-damage} ]]','to':'@{damage_macro}'},{'from':'@{total-damage}','to':'@{damage_macro}'}]},
   '{{crit_confirm=':{'current':'[[ 1d20 + @{attack_macro} + [[ @{crit_conf_mod} ]] ]]}}','old':['[[ 1d20 + [[ @{total-attack} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} ]]','to':'@{attack_macro} + [[ @{crit_conf_mod} ]]'},{'from':'@{total-attack}','to':'@{attack_macro} + [[ @{crit_conf_mod} ]]'}]},
   '{{crit_damage=':{'current':'[[ [[ @{damage-dice-num} * (@{crit-multiplier} - 1) ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}}','old':['[[ [[ (@{damage-dice-num} * (@{crit-multiplier} - 1)) ]]d@{damage-die} + [[ (@{total-damage} * (@{crit-multiplier} - 1)) ]] ]]}}'],'replacements':[{'from':'@{total-damage}','to':'(@{damage_macro})'}]},
   '{{type=':{'current':'@{type}}}'},
   '{{weapon_notes=':{'current':'@{notes}}}'},
   '@{iterative_attacks}':{'current':'@{iterative_attacks}'},
   '@{macro_options}':{'current':'@{macro_options}'},
   '{{vs=':{'current':'@{vs}}}'},
   '{{vs@{vs}=':{'current':'@{vs}}}'},
   '{{precision_dmg1=':{'current':'@{precision_dmg_macro}}}'},
   '{{precision_dmg1_type=':{'current':'@{precision_dmg_type}}}'},
   '{{precision_dmg2=':{'current':'@{global_precision_dmg_macro}}}'},
   '{{precision_dmg2_type=':{'current':'@{global_precision_dmg_type}}}'},
   '{{critical_dmg1=':{'current':'@{critical_dmg_macro}}}'},
   '{{critical_dmg1_type=':{'current':'@{critical_dmg_type}}}'},
   '{{critical_dmg2=':{'current':'@{global_critical_dmg_macro}}}'},
   '{{critical_dmg2_type=':{'current':'@{global_critical_dmg_type}}}'},
   '{{attack1name=':{'current':'@{iterative_attack1_name}}}'}
   },
 defaultDeletedMacroAttrs = ['{{description=@{notes}}}','@{toggle_accessible_flag}'],
 defaultIterativeRepeatingMacro='{{attackREPLACE=[[ 1d20cs>[[ @{crit-target} ]] + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] ]]}} {{damageREPLACE=[[ @{damage-dice-num}d@{damage-die} + @{damage_macro} ]]}} {{crit_confirmREPLACE=[[ 1d20 + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] + [[ @{crit_conf_mod} ]] ]]}} {{crit_damageREPLACE=[[ [[ @{damage-dice-num} * [[ @{crit-multiplier} - 1 ]] ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}} {{precision_dmgREPLACE1=@{precision_dmg_macro}}} {{precision_dmgREPLACE2=@{global_precision_dmg_macro}}} {{critical_dmgREPLACE1=@{critical_dmg_macro}}} {{critical_dmgREPLACE2=@{global_critical_dmg_macro}}} {{attackREPLACEname=@{iterative_attackREPLACE_name}}}',
 defaultIterativeRepeatingMacroMap = {
   '{{attackREPLACE=':{'current':'[[ 1d20cs>[[ @{crit-target} ]] + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] ]]}}', 'old':['[[ 1d20cs>[[ @{crit-target} ]] + [[ @{total-attack} + @{iterative_attackREPLACE_value} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} ]]','to':'@{attack_macro}'},{'from':'@{total-attack}','to':'@{attack_macro}'}]},
   '{{damageREPLACE=':{'current':'[[ @{damage-dice-num}d@{damage-die} + @{damage_macro} ]]}}', 'old':['[[ @{damage-dice-num}d@{damage-die} + [[ @{total-damage} ]] ]]}}'],'replacements':[{'from':'[[ @{total-damage} ]]','to':'@{damage_macro}'},{'from':'@{total-damage}','to':'@{damage_macro}'}]},
   '{{crit_confirmREPLACE=':{'current':'[[ 1d20 + [[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] + [[ @{crit_conf_mod} ]] ]]}}', 'old':['[[ 1d20 + [[ @{total-attack} + @{iterative_attackREPLACE_value} ]] ]]}}'],'replacements':[{'from':'[[ @{total-attack} + @{iterative_attackREPLACE_value} ]]','to':'[[ @{attack_macro} + @{iterative_attackREPLACE_value} ]] [iterative] + [[ @{crit_conf_mod} ]]'},{'from':'@{total-attack} + @{iterative_attackREPLACE_value}','to':'@{attack_macro} + @{iterative_attackREPLACE_value} + @{crit_conf_mod}'}]},
   '{{crit_damageREPLACE=':{'current':'[[ [[ @{damage-dice-num} * [[ @{crit-multiplier} - 1 ]] ]]d@{damage-die} + ((@{damage_macro}) * [[ @{crit-multiplier} - 1 ]]) ]]}}', 'old':['[[ [[ (@{damage-dice-num} * (@{crit-multiplier} - 1)) ]]d@{damage-die} + [[ (@{total-damage} * (@{crit-multiplier} - 1)) ]] ]]}}'],'replacements':[{'from':'@{total-damage}','to':'(@{damage_macro})'}]},
   '{{precision_dmgREPLACE1=':{'current':'@{precision_dmg_macro}}}'},
   '{{precision_dmgREPLACE2=':{'current':'@{global_precision_dmg_macro}}}'},
   '{{critical_dmgREPLACE1=':{'current':'@{critical_dmg_macro}}}'},
   '{{critical_dmgREPLACE2=':{'current':'@{global_critical_dmg_macro}}}'},
   '{{attackREPLACEname=':{'current':'@{iterative_attackREPLACE_name}}}'}
 },
 defaultIterativeDeletedMacroAttrs=null,
 defaultIterativeAttrName='var_iterative_attackREPLACE_macro',
 defaultIterativeReplaceArray=['2','3','4','5','6','7','8'],

 getRepeatingAddInMacroPortion = function (macro, toggle, portion) {
   if (!(macro === "" || macro === "0" || macro === undefined || macro === null || toggle === "" || toggle === "0" || toggle === undefined || toggle === null)) {
     return " " + portion;
   }
   return "";
 },
 updateRepeatingAddInMacro = function (id, eventInfo) {
   var idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_weapon_" + idStr,
   attackType = prefix + "attack-type",
   tattackPlusNm = prefix + "toggle_attack_macro_insert",
   tdamagePlusNm = prefix + "toggle_damage_macro_insert",
   attackPlusNm = prefix + "attack_macro_insert",
   damagePlusNm = prefix + "damage_macro_insert",
   tattackGlobalNm = "toggle_global_attack_macro_insert",
   tdamageGlobalNm = "toggle_global_damage_macro_insert",
   attackGlobalNm = "global_attack_macro_insert",
   damageGlobalNm = "global_damage_macro_insert",
   attackMacroNm = prefix + "attack_macro",
   damageMacroNm = prefix + "damage_macro",
   fields = ["adv_macro_show", attackType, attackGlobalNm, damageGlobalNm, attackPlusNm, damagePlusNm, attackMacroNm, damageMacroNm];
   getAttrs(fields, function (v) {
     var showMacros = parseInt(v.adv_macro_show, 10) || 0,
     newAtkMacro = "[[ @{total-attack} ]]",
     newDmgMacro = "[[ @{total-damage} ]]",
     setter = {};
     if (showMacros) {
       newAtkMacro += getRepeatingAddInMacroPortion(v[attackPlusNm], v[tattackPlusNm], "@{toggle_attack_macro_insert}");
       newAtkMacro += " @{attack-type_macro_insert}";
       newAtkMacro += getRepeatingAddInMacroPortion(v[attackGlobalNm], v[tattackGlobalNm], "@{toggle_global_attack_macro_insert}");
       newDmgMacro += " @{damage-type_macro_insert}";
       newDmgMacro += getRepeatingAddInMacroPortion(v[damagePlusNm], v[tdamagePlusNm], "@{toggle_damage_macro_insert}");
       newDmgMacro += getRepeatingAddInMacroPortion(v[damageGlobalNm], v[tdamageGlobalNm], "@{toggle_global_damage_macro_insert}");
     }
     if (newAtkMacro !== v[attackMacroNm]) {
       setter[attackMacroNm] = newAtkMacro;
     }
     if (newDmgMacro !== v[damageMacroNm]) {
       setter[damageMacroNm] = newDmgMacro;
     }
     if (_.size(setter)) {
       setAttrs(setter);
     }
   });
 },
 setAdvancedMacroCheckbox = function () {
   getAttrs(["adv_macro_show", "global_melee_macro_insert", "global_ranged_macro_insert", "global_cmb_macro_insert", "global_attack_macro_insert", "global_melee_damage_macro_insert", "global_ranged_damage_macro_insert", "global_cmb_damage_macro_insert", "global_damage_macro_insert"], function (v) {
     var showAdv = parseInt(v.adv_macro_show, 10) || 0,
     hasAnyMacros = _.reduce(v, function (tot, value, fieldname) {
       if (fieldname !== "adv_macro_show" && !(value === "" || value === "0" || value === undefined || value === null)) {
         tot += 1;
       }
       return tot;
     }, 0);
     //TAS.debug("setAdvancedMacroCheckbox, checked:" + showAdv + " , has macros:" + hasAnyMacros);
     if (hasAnyMacros && !showAdv) {
       setAttrs({
         adv_macro_show: 1
       }, PFConst.silentParams);
     }
   });
 },
 /********* REPEATING WEAPON FIELDSET *********/
 setRepeatingWeaponInsertMacro = function (id, eventInfo) {
   var done = function () { }, //updateRepeatingAddInMacro(id,eventInfo);},
   idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_weapon_" + idStr,
   attkTypeField = prefix + "attack-type";
   getAttrs([attkTypeField], function (v) {
     var attkType = PFUtils.findAbilityInString(v[attkTypeField]),
     setter = {};
     if (attkType) {
       attkType = attkType.replace('attk-', '');
       setter[prefix + "attack-type_macro_insert"] = PFAttackGrid.attackGridFields[attkType].attackmacro;
       setter[prefix + "damage-type_macro_insert"] = PFAttackGrid.attackGridFields[attkType].damagemacro;
     } else {
       setter[prefix + "attack-type_macro_insert"] = "0";
     }
     //TAS.debug("setRepeatingWeaponInsertMacro",setter);
     setAttrs(setter, {
       silent: true
     }, done);
   });
 },
 /* updateRepeatingWeaponAttack - calculates total-attack
 * also updates attk-effect-total-copy
 * @id {string} optional = id of row, if blank we are within the context of the row
 * @overrideAttr {string} optional = if we are passing in a value this is the fieldname after "repeating_weapon_"
 * @overrideValue {number} optional = if overrideAttr then this should be a number usually int but it won't check
 */
 updateRepeatingWeaponAttack = function (id, eventInfo) {
   //is it faster to not do the idstr each time? try it with ?:
   var resetOptionsWhenDone = function () {
     PFAttackOptions.resetOption(id, eventInfo);
   },
   idStr = PFUtils.getRepeatingIDStr(id),
   enhanceField = "repeating_weapon_" + idStr + "enhance",
   mwkField = "repeating_weapon_" + idStr + "masterwork",
   attkTypeModField = "repeating_weapon_" + idStr + "attack-type-mod",
   profField = "repeating_weapon_" + idStr + "proficiency",
   attkMacroModField = "repeating_weapon_" + idStr + "attack-mod",
   totalAttackField = "repeating_weapon_" + idStr + "total-attack";
   getAttrs([enhanceField, mwkField, attkTypeModField, profField, attkMacroModField, totalAttackField], function (v) {
     var enhance = (parseInt(v[enhanceField], 10) || 0),
     masterwork = (parseInt(v[mwkField], 10) || 0),
     attkTypeMod = (parseInt(v[attkTypeModField], 10) || 0),
     prof = (parseInt(v[profField], 10) || 0),
     attkMacroMod = (parseInt(v[attkMacroModField], 10) || 0),
     currTotalAttack = (parseInt(v[totalAttackField], 10) || 0),
     newTotalAttack = 0,
     setter = {};
     newTotalAttack = Math.max(enhance, masterwork) + attkTypeMod + prof + attkMacroMod;
     if (newTotalAttack !== currTotalAttack || isNaN(currTotalAttack)) {
       setter[totalAttackField] = newTotalAttack;
       setAttrs(setter, PFConst.silentParams, resetOptionsWhenDone);
     }
   });
 },
 /* updateRepeatingWeaponDamage - updates total-damage*/
 updateRepeatingWeaponDamage = function (id, eventInfo) {
   var resetOptionsWhenDone = function () {
     PFAttackOptions.resetOption(id, eventInfo);
   },
   idStr = PFUtils.getRepeatingIDStr(id),
   maxname = "repeating_weapon_" + idStr + "damage-ability-max",
   modname = "repeating_weapon_" + idStr + "damage-ability-mod",
   totalDamageField = "repeating_weapon_" + idStr + "total-damage",
   enhanceField = "repeating_weapon_" + idStr + "enhance",
   miscDmgField = "repeating_weapon_" + idStr + "damage-mod",
   abilityMultField = "repeating_weapon_" + idStr + "damage_ability_mult";
   getAttrs([maxname, modname, "DMG-mod", totalDamageField, enhanceField, miscDmgField, abilityMultField], function (v) {
     var maxA ,
     ability = parseInt(v[modname], 10) || 0,
     abilityMult = parseFloat(v[abilityMultField], 10) || 1,
     abilityTot,
     globalBuffConds = parseInt(v["DMG-mod"], 10) || 0,
     currTotalDmg = parseInt(v[totalDamageField], 10),
     miscDmg = parseInt(v[miscDmgField], 10) || 0,
     enhance = parseInt(v[enhanceField], 10) || 0,
     totalDamage,
     setter = {};
     maxA = parseInt(v[maxname], 10);
     if(isNaN(maxA)) {
       maxA=99;
     }
     abilityTot = Math.floor(Math.min(abilityMult * ability, maxA));
     totalDamage = abilityTot + globalBuffConds + miscDmg + enhance;

     if (totalDamage !== currTotalDmg || isNaN(currTotalDmg)) {
       //TAS.debug("setting damage to "+totalDamage);
       setter[totalDamageField] = totalDamage;
     }
     if (_.size(setter)) {
       setAttrs(setter, PFConst.silentParams, resetOptionsWhenDone);
     }
   });
 },
 updateRepeatingWeaponCrit = function (id, eventInfo) {
   var idStr = PFUtils.getRepeatingIDStr(id),
   critConfirmTotalField = "repeating_weapon_" + idStr + "crit_conf_mod",
   critConfirmField = "repeating_weapon_" + idStr + "crit_confirm",
   attkTypeField = "repeating_weapon_" + idStr + "attack-type",
   attrs = ["attk_ranged_crit_conf", "attk_ranged2_crit_conf", "attk_melee_crit_conf", "attk_melee2_crit_conf", "attk_cmb_crit_conf", "attk_cmb2_crit_conf", critConfirmTotalField, critConfirmField, attkTypeField];
   getAttrs(attrs, function (v) {
     try {
       var currCritBonus = (parseInt(v[critConfirmTotalField], 10) || 0),
       critConfirmBonus = (parseInt(v[critConfirmField], 10) || 0),
       attkType = PFUtils.findAbilityInString(v[attkTypeField]),
       attkTypeForGrid = (!attkType) ? "" : (attkType.replace('attk-', '')),
       attackTypeBonusField = (!attkTypeForGrid) ? "" : (PFAttackGrid.attackGridFields[attkTypeForGrid].crit),
       attackTypeBonus = (!attackTypeBonusField) ? 0 : (parseInt(v[attackTypeBonusField], 10) || 0),
       newBonus = critConfirmBonus + attackTypeBonus,
       setter = {};
       if (newBonus !== currCritBonus) {
         setter[critConfirmTotalField] = newBonus;
         setAttrs(setter, {
           silent: true
         });
       }
     } catch (err) {
       TAS.error("updateRepeatingWeaponCrit:cannot find " + v[attkTypeField] + " in grid");
     }
   });
 },
 updateRepeatingWeaponsFromCrit = function (attacktype, eventInfo) {
   var globalCritBonusField = PFAttackGrid.attackGridFields[attacktype].crit;
   getSectionIDs("repeating_weapon", function (ids) {
     var attrs = [globalCritBonusField];
     _.each(ids, function (id) {
       var idStr = PFUtils.getRepeatingIDStr(id);
       attrs.push("repeating_weapon_" + idStr + "crit_conf_mod");
       attrs.push("repeating_weapon_" + idStr + "crit_confirm");
       attrs.push("repeating_weapon_" + idStr + "attack-type");
     });
     //TAS.debug("about to get ",attrs);
     getAttrs(attrs, function (v) {
       var globalCritBonus = parseInt(v[globalCritBonusField], 10) || 0,
       setter = {};
       _.each(ids, function (id) {
         var idStr = PFUtils.getRepeatingIDStr(id),
         attackTypeField = "repeating_weapon_" + idStr + "attack-type",
         rowCritTotField = "",
         rowCrit = 0,
         rowTot = 0,
         currRowTot = 0;
         //TAS.debug("row:"+id+" attacktypefield:"+v[attackTypeField]+", ability:"+ PFUtils.findAbilityInString(v[attackTypeField]) +", type is:"+attacktype);
         if (PFUtils.findAbilityInString(v[attackTypeField]) === ("attk-" + attacktype)) {
           //TAS.debug("this row equal");
           rowCritTotField = "repeating_weapon_" + idStr + "crit_conf_mod";
           currRowTot = parseInt(v[rowCritTotField], 10) || 0;
           rowTot = globalCritBonus + (parseInt(v["repeating_weapon_" + idStr + "crit_confirm"], 10) || 0);
           //TAS.debug("global:"+globalCritBonus+", this row:"+currRowTot+", plus "+v["repeating_weapon_" + idStr + "crit_confirm"] );
           if (rowTot !== currRowTot) {
             setter[rowCritTotField] = rowTot;
           }
         }
       });
       if (_.size(setter) > 0) {
         setAttrs(setter, {
           silent: true
         });
       }
     });
   });
 },
 setRepeatingWeaponRangedFlag = function(id){
   var idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_weapon_" + idStr,
   attypeAttr=prefix+"attack-type",
   isRangedAttr=prefix+"isranged";
   getAttrs([attypeAttr,isRangedAttr],function(v){
     var setter={},
     newIsRanged=0,
     attackType="";
     attackType=PFUtils.findAbilityInString(v[attypeAttr]);
     if ((/ranged/i).test(attackType)) {
       newIsRanged=1;
     }
     if ((parseInt(v[isRangedAttr],10)||0) !== newIsRanged){
       setter[isRangedAttr]=newIsRanged;
       setAttrs(setter,PFConst.silentParams);
     }
   });

 },
 getRecalculatedDamageOnly=function(id,v){
   var prefix = 'repeating_weapon_' + SWUtils.getRepeatingIDStr(id),
     enhance = (parseInt(v[prefix+ "enhance"], 10) || 0),
     abilitydmg = parseInt(v[prefix+ "damage-ability-mod"], 10) || 0,
     abilityMult = parseFloat(v[prefix+ "damage_ability_mult"], 10) || 1,
     currTotalDmg = parseInt(v[prefix+ "total-damage"], 10),
     dmgMacroMod = parseInt(v[prefix+ "damage-mod"], 10) || 0,
     maxAbility = parseInt(v[prefix+ "damage-ability-max"], 10),
     globalBuffConds = v["DMG-mod"],
     abilityTotDmg=0,
     newTotalDamage=0,
     localsetter={};
   try {
     if(isNaN(maxAbility)) {
       maxAbility=99;
     }
     abilityTotDmg = Math.floor(Math.min(abilityMult * abilitydmg, maxAbility));
     newTotalDamage = abilityTotDmg + globalBuffConds + dmgMacroMod + enhance;
     if (newTotalDamage !== currTotalDmg || isNaN(currTotalDmg)) {
       localsetter[prefix+ "total-damage"] = newTotalDamage;
     }
   } catch (err){
     TAS.error("PFAttacks.recalculateAttack for id " + id,err);
   } finally {
     return localsetter;
   }
 },
 /* updateRepeatingWeaponDamages - updates all attacks when DMG-mod changes */
 updateRepeatingWeaponDamages = function (callback) {
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   });
   getSectionIDs("repeating_weapon", function (ids) {
     var fields = SWUtils.cartesianAppend(['repeating_weapon_'],ids,damageRowAttrsLU);
     fields.push("DMG-mod");
     getAttrs(fields,function(v){
       var setter;
       v["DMG-mod"]= parseInt(v["DMG-mod"],10)||0;
       setter = _.reduce(ids,function(m,id){
         var xtra=getRecalculatedDamageOnly(id,v);
         _.extend(m,xtra);
         return m;
       },{});
       if(_.size(setter)){
         setAttrs(setter,{},done);
       } else {
         done();
       }
     });
   });
 },

 /* this is faster than looping through the 3 parent lists */
 updateAssociatedAttacksFromParents = function(callback){
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   });
   getSectionIDs('repeating_weapon',function(ids){
     var doneOne = _.after(_.size(ids),function(){
       done();
     }),
     attrs = _.map(ids,function(id){
       return ['repeating_weapon_'+id+'_source-item','repeating_weapon_'+id+'_source-spell','repeating_weapon_'+id+'_source-ability'];
     });
     attrs = _.flatten(attrs);
     getAttrs(attrs,function(v){
       _.each(ids,function(id){
         doneOne();
         if(v['repeating_weapon_'+id+'_source-spell']) {
           PFInventory.createAttackEntryFromRow('repeating_item_'+v['repeating_weapon_'+id+'_source-item']+'_create-attack-entry',doneOne,true,id);
         } else if (v['repeating_weapon_'+id+'_source-item']) {
           PFSpells.createAttackEntryFromRow('repeating_spells_'+v['repeating_weapon_'+id+'_source-spell']+'_create-attack-entry',doneOne,true,id);
         } else if (v['repeating_weapon_'+id+'_source-item']) {
           PFAbility.createAttackEntryFromRow('repeating_ability_'+v['repeating_weapon_'+id+'_source-ability']+'_create-attack-entry',doneOne,true,id);
         } else {
           doneOne();
         }
       });
     });
   });
 },

 getRecalculatedAttack = function(id,v){
   var prefix = 'repeating_weapon_'+id+'_',
     isRanged=parseInt(v[prefix+"isranged"],10)||0,
     enhance = (parseInt(v[prefix+ "enhance"], 10) || 0),
     masterwork = (parseInt(v[prefix+ "masterwork"], 10) || 0),
     attkTypeMod = (parseInt(v[prefix+ "attack-type-mod"], 10) || 0),
     prof = (parseInt(v[prefix+ "proficiency"], 10) || 0),
     attkMacroMod = (parseInt(v[prefix+ "attack-mod"], 10) || 0),
     currTotalAttack = parseInt(v[prefix+ "total-attack"], 10),
     abilitydmg = parseInt(v[prefix+ "damage-ability-mod"], 10) || 0,
     abilityMult = parseFloat(v[prefix+ "damage_ability_mult"], 10) || 1,
     currTotalDmg = parseInt(v[prefix+ "total-damage"], 10),
     dmgMacroMod = parseInt(v[prefix+ "damage-mod"], 10) || 0,
     maxAbility = parseInt(v[prefix+ "damage-ability-max"], 10),
     currCritBonus = (parseInt(v[prefix+ "crit_conf_mod"], 10) || 0),
     critConfirmBonus = (parseInt(v[prefix+ "crit_confirm"], 10) || 0),
     attkType = PFUtils.findAbilityInString(v[prefix+ "attack-type"]),
     globalBuffConds = v["DMG-mod"],
     attkTypeForGrid='',
     attackTypeCritBonusField='',
     attackTypeCritBonus =0,
     newCritBonus=0,
     abilityTotDmg=0,
     newTotalDamage=0,
     newTotalAttack=0,
     localsetter={};
   try{
     newTotalAttack = Math.max(enhance, masterwork) + attkTypeMod + prof + attkMacroMod;
     if (newTotalAttack !== currTotalAttack || isNaN(currTotalAttack)) {
       localsetter[prefix+ "total-attack"] = newTotalAttack;
     }
     if(isNaN(maxAbility)) {
       maxAbility=99;
     }
     abilityTotDmg = Math.floor(Math.min(abilityMult * abilitydmg, maxAbility));
     newTotalDamage = abilityTotDmg + globalBuffConds + dmgMacroMod + enhance;
     if (newTotalDamage !== currTotalDmg || isNaN(currTotalDmg)) {
       //TAS.debug("setting damage to "+newTotalDamage);
       localsetter[prefix+ "total-damage"] = newTotalDamage;
     }
     if(attkType){
       if((/range/i).test(attkType)){
         if(!isRanged){
           localsetter[prefix+"isranged"]=1;
         }
       } else if (isRanged){
         localsetter[prefix+"isranged"]=0;
       }
       attkTypeForGrid = attkType.replace('attk-','');
       //TAS.debug("at update attack attkTypeForGrid="+attkTypeForGrid+", comparing to:",PFAttackGrid.attackGridFields);
       if(attkTypeForGrid){
         attackTypeCritBonusField = PFAttackGrid.attackGridFields[attkTypeForGrid].crit;
         attackTypeCritBonus = (!attackTypeCritBonusField) ? 0 : v[attackTypeCritBonusField];
         if(v[prefix + "attack-type_macro_insert"] !== PFAttackGrid.attackGridFields[attkTypeForGrid].attackmacro){
           localsetter[prefix + "attack-type_macro_insert"] = PFAttackGrid.attackGridFields[attkTypeForGrid].attackmacro;
         }
         if (v[prefix + "damage-type_macro_insert"]!==PFAttackGrid.attackGridFields[attkTypeForGrid].damagemacro){
           localsetter[prefix + "damage-type_macro_insert"] = PFAttackGrid.attackGridFields[attkTypeForGrid].damagemacro;
         }
       }
     }
     newCritBonus = critConfirmBonus + attackTypeCritBonus;
     if (newCritBonus !== currCritBonus) {
       localsetter[prefix+ "crit_conf_mod"] = newCritBonus;
     }
     if (!attkTypeForGrid) {
       if (v[prefix + "attack-type_macro_insert"]!=="0"){
         localsetter[prefix + "attack-type_macro_insert"] = "0";
       }
       if (v[prefix + "damage-type_macro_insert"]!=="0"){
         localsetter[prefix + "damage-type_macro_insert"] = "0";
       }
     }
   } catch (err){
     TAS.error("PFAttacks.recalculateAttack for id " + id,err);
   } finally {
     return localsetter;
   }
 },
 updateAllRowsNonCalcFields = function(ids,callback){
   var done = function(){
     if(typeof callback ==="function"){
       callback();
     }
   },
   doneWithAllRows = _.after(_.size(ids),done),
   fields;
   fields = SWUtils.cartesianAppend(['repeating_weapon_'],ids,updateRowAttrsLU);
   fields=fields.concat(updateCharAttrs);
   getAttrs(fields,function(v){
     var charAttMap={},	setter;
     //set global values to int so we don't have to do it over and over per row.
     charAttMap = _.object(_.map(updateCharAttrs,function(attr){
       return [attr, parseInt(v[attr],10)||0];
     }));
     _.extend(v,charAttMap);
     setter = _.reduce(ids,function(m,id){
       var xtra=getRecalculatedAttack(id,v);
       _.extend(m,xtra);
       return m;
     },{});
     if(_.size(setter)){
       setAttrs(setter,{},done);
     } else {
       done();
     }
   });
 },
 recalcCalculatedFields = function(ids,callback){
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   }),
   doneWithCalculatedFields = _.after(_.size(ids),done),
   fields;
   fields =_.chain(ids)
     .map(function(id){
       var prefix = "repeating_weapon_" + id + "_";
       return [prefix + "damage",prefix + "attack",prefix + "damage-mod",prefix + "attack-mod"];
     })
     .flatten()
     .value();
   getAttrs(fields,function(v){
     try{
       _.each(ids,function (id) {
         var doneWithField =_.after(4,doneWithCalculatedFields),
         prefix = "repeating_weapon_" + id + "_";
         if((!v[prefix + "damage"] || v[prefix + "damage"]==="0"|| v[prefix + "damage"]==="+0") && parseInt(v[prefix+"damage-mod"],10)===0){
           doneWithField();
         } else {
           SWUtils.evaluateAndSetNumber(prefix + "damage", prefix + "damage-mod",0,doneWithField,true);
         }
         if((!v[prefix + "attack"] || v[prefix + "attack"]==="0" || v[prefix + "attack"]==="+0") && parseInt(v[prefix+"attack-mod"],10)===0){
           doneWithField();
         } else {
           SWUtils.evaluateAndSetNumber(prefix + "attack", prefix + "attack-mod",0,doneWithField,true);
         }
         SWUtils.setDropdownValue(prefix + "attack-type",prefix +"attack-type-mod",PFUtils.findAbilityInString,doneWithField,true);
         SWUtils.setDropdownValue(prefix + "damage-ability",prefix +"damage-ability-mod",PFUtils.findAbilityInString,doneWithField,true);
       });
     }catch(err){
       TAS.error("recalcCalculatedFIelds",err);
       done();
     }
   });
 },
 recalculateRepeatingWeapons = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFAttacks.recalculateRepeatingWeapons");
     if (typeof callback === "function"){
       callback();
     }
   });
   getSectionIDs("repeating_weapon", function (ids) {
     recalcCalculatedFields(ids,function(){
       updateAllRowsNonCalcFields(ids,done);
     });
   });
 },
 setNewDefaults = function(callback){
   var done = _.once(function(){
     TAS.debug("leaving PFAttacks.setNewDefaults");
     if(typeof callback === "function"){
       callback();
     }
   }),
   finishedMigrating=_.once(function(){
     setAttrs({'migrated_attacklist_defaults111':1},PFConst.silentParams,done);
   });
   //TAS.debug("At PFAttacks.setNewDefaults");
   getAttrs(['size','migrated_attacklist_defaults111'],function(vsize){
     var defaultSize = 0;
     if(parseInt(vsize['migrated_attacklist_defaults111'],10)){
       done();
       return;
     }
     defaultSize = parseInt(vsize['size'],10)||0;
     getSectionIDs('repeating_weapon',function(ids){
       var fields;
       if (!(ids || _.size(ids))){
         finishedMigrating();
         return;
       }
       fields= SWUtils.cartesianAppend(['repeating_weapon_'],ids,['_damage-dice-num','_damage-die']);
       getAttrs(fields,function(v){
         var setter={};
         try {
           setter = _.reduce(ids,function(m,id){
             var prefix = 'repeating_weapon_'+id+'_';
             try {
               m[prefix+'default_size']=defaultSize;
               if(v[prefix+'damage-dice-num']){
                 m[prefix+'default_damage-dice-num']=v[prefix+'damage-dice-num'];
               } else {
                 m[prefix+'default_damage-dice-num']=0;
                 m[prefix+'damage-dice-num']=0;
               }
               if(v[prefix+'damage-die']){
                 m[prefix+'default_damage-die']=v[prefix+'damage-die'];
               } else {
                 m[prefix+'default_damage-die']=0;
                 m[prefix+'damage-die']=0;
               }
             } catch (errin){
               TAS.error("PFAttacks.setNewDefaults errin id "+id,errin);
             } finally {
               return m;
             }
           },{});
         } catch (errout){
           TAS.error("PFAttacks.setNewDefaults errout ",errout);
         } finally {
           if (_.size(setter)){
             setAttrs(setter,PFConst.silentParams,finishedMigrating);
           } else {
             done();
           }
         }
       });
     });
   });
 },
 migrateRepeatingMacros = function (callback){
   var done = _.once(function(){
     if(typeof callback === "function"){
       callback();
     }
   }),
   migratedIteratives = function(){
     setAttrs({'migrated_attack_macrosv1':1},PFConst.silentParams,done);
   },
   migrated = _.after(2,function(){
     PFMacros.migrateRepeatingMacrosMult(migratedIteratives,'weapon',defaultIterativeAttrName,defaultIterativeRepeatingMacro,defaultIterativeRepeatingMacroMap,defaultIterativeDeletedMacroAttrs,defaultIterativeReplaceArray);
   });
   PFMacros.migrateRepeatingMacros(migrated,'weapon','macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{PC-Whisper}');
   PFMacros.migrateRepeatingMacros(migrated,'weapon','npc-macro-text',defaultRepeatingMacro,defaultRepeatingMacroMap,defaultDeletedMacroAttrs,'@{NPC-Whisper}');
 },
 migrate = function(callback, oldversion){
   var done=_.once(function(){
     TAS.debug("leaving PFAttacks.migrate");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs([ "migrated_damage-multiplier","migrated_attack_macrosv1"],function(v){
     var migrateDamage = 0, migrateMacrosv1=0,migrateIteratives=0;
     migrateDamage = parseInt(v["migrated_damage-multiplier"], 10) || 0;
     migrateMacrosv1 = parseInt(v["migrated_attack_macrosv1"], 10) || 0;
     getSectionIDs('repeating_weapon',function(ids){
       var callmigrateMacrostov1,callmigrateMacrostov64,callmigrateRepeatingDamage,callSetDefaults;
       try{
         if (!ids || _.size(ids)<=0){
           setAttrs({"migrated_damage-multiplier":1,'migrated_attack_macrosv1':1,'migrated_attacklist_defaults111':1},
             PFConst.silentParams,done);
           return;
         }
         callSetDefaults = function(){
           setNewDefaults(done);
         };
         callmigrateMacrostov1=function(){
           if(!migrateMacrosv1){migrateRepeatingMacros(callSetDefaults);}
           else { callSetDefaults();}
         };
         callmigrateRepeatingDamage =function(){
           if(!migrateDamage){PFMigrate.migrateRepeatingDamage(ids,callmigrateMacrostov1);}
           else {callmigrateMacrostov1();}
         };
         callmigrateRepeatingDamage();
       } catch (err){
         TAS.error("PFAttacks.migrate",err);
         done();
       } finally {
       }
     });
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = function () {
     TAS.info("leaving PFAttacks.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   };
   TAS.debug("at PFAttacks.recalculate");
   PFAttackGrid.recalculate( function(){
     migrate(function(){
       setAdvancedMacroCheckbox();
       recalculateRepeatingWeapons();
       PFAttackGrid.resetCommandMacro();
       PFAttackOptions.recalculate();
       updateAssociatedAttacksFromParents();
       done();
     },oldversion);
   }  ,silently,oldversion);
 },
 registerEventHandlers = function () {
   _.each(PFAttackGrid.attackGridFields, function (attackFields, attack) {
     on("change:" + attackFields.crit, TAS.callback(function eventAttackCrit(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         PFAttacks.updateRepeatingWeaponsFromCrit(attack, eventInfo);
       }
     }));
   });
   on("change:repeating_weapon:attack-type-mod change:repeating_weapon:attack-mod", TAS.callback(function eventUpdateRepeatingWeaponAttackSheet(eventInfo) {
     if (eventInfo.sourceType === "sheetworker") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateRepeatingWeaponAttack(null, eventInfo);
     }
   }));
   on("change:repeating_weapon:masterwork change:repeating_weapon:proficiency", TAS.callback(function eventUpdateRepeatingWeaponAttackPlayer(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateRepeatingWeaponAttack(null, eventInfo);
     }
   }));
   on("change:repeating_weapon:damage-ability-mod change:repeating_weapon:damage-mod", TAS.callback(function eventUpdateRepeatingWeaponDamageSheet(eventInfo) {
     if (eventInfo.sourceType === "sheetworker") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateRepeatingWeaponDamage(null, eventInfo);
     }
   }));
   on("change:repeating_weapon:damage_ability_mult change:repeating_weapon:damage-ability-max", TAS.callback(function eventUpdateRepeatingWeaponDamagePlayer(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateRepeatingWeaponDamage(null, eventInfo);
     }
   }));
   on("change:repeating_weapon:attack-type", TAS.callback(function eventHandleRepeatingAttackDropdown(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     PFUtilsAsync.setRepeatingDropdownValue("weapon", null, "attack-type", "attack-type-mod");
     updateRepeatingWeaponCrit(null, eventInfo);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       setRepeatingWeaponInsertMacro(null, eventInfo);
       setRepeatingWeaponRangedFlag();
     }
   }));
   on("change:repeating_weapon:damage-ability", TAS.callback(function eventHandleRepeatingDamageDropdown(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     PFUtilsAsync.setRepeatingDropdownValue("weapon", null, "damage-ability", "damage-ability-mod");
   }));
   on("change:repeating_weapon:damage", TAS.callback(function eventRepeatingWeaponDamage(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     SWUtils.evaluateAndSetNumber("repeating_weapon_damage", "repeating_weapon_damage-mod");
   }));
   on("change:repeating_weapon:attack", TAS.callback(function eventRepeatingWeaponAttack(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     SWUtils.evaluateAndSetNumber("repeating_weapon_attack", "repeating_weapon_attack-mod");
   }));
   on("change:repeating_weapon:enhance", TAS.callback(function eventUpdateRepeatingWeaponAttackAndDamage(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateRepeatingWeaponAttack(null, eventInfo);
       updateRepeatingWeaponDamage();
     }
   }));
   on("change:repeating_weapon:crit_confirm", TAS.callback(function eventWeaponCritConfirmBonus(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateRepeatingWeaponCrit(null, eventInfo);
     }
   }));
   on("change:repeating_weapon:damage-dice-num change:repeating_weapon:damage-die", TAS.callback(function eventWeaponDice(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       getAttrs([eventInfo.sourceAttribute,'size','repeating_weapon_default_size'],function(v){
         var attr=SWUtils.getAttributeName(eventInfo.sourceAttribute),
         newname='repeating_weapon_default_'+attr,
         currSize =parseInt(v.size,10)||0,
         defSize=parseInt(v.repeating_weapon_default_size,10)||0,
         setter={};
         if(defSize===currSize){
           setter[newname]=v[eventInfo.sourceAttribute];
           setAttrs(setter,PFConst.silentParams);
         }
       });
     }
   }));
   on("remove:repeating_weapon change:repeating_weapon:attack-type change:_reporder_repeating_weapon change:repeating_weapon:group change:repeating_weapon:name change:include_attack_totals", TAS.callback(function eventRepeatingWeaponChange(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       PFAttackGrid.resetCommandMacro(eventInfo);
     }
   }));

   on("change:dmg-mod", TAS.callback(function eventUpdateRepeatingWeaponDamageTotal(eventInfo) {
     if (eventInfo.sourceType === "sheetworker") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateRepeatingWeaponDamages(eventInfo);
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFAttacks module loaded        ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate: migrate,
   recalculate: recalculate,
   setAdvancedMacroCheckbox: setAdvancedMacroCheckbox,
   recalculateRepeatingWeapons: recalculateRepeatingWeapons,
   setRepeatingWeaponInsertMacro: setRepeatingWeaponInsertMacro,
   setRepeatingWeaponRangedFlag: setRepeatingWeaponRangedFlag,
   updateRepeatingWeaponAttack: updateRepeatingWeaponAttack,
   updateRepeatingWeaponCrit: updateRepeatingWeaponCrit,
   updateRepeatingWeaponDamage: updateRepeatingWeaponDamage,
   updateRepeatingWeaponDamages: updateRepeatingWeaponDamages,
   updateRepeatingWeaponsFromCrit: updateRepeatingWeaponsFromCrit
 };
}());
var PFPsionic = PFPsionic || (function () {
 'use strict';
 var
 /* **************PSIONIC************** */
 updatePsionicBonusPower = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["selected-ability-psionic-power", "psionic-level-total", "ability-psionic-power"], function (v) {
     SWUtils.evaluateExpression(v["selected-ability-psionic-power"], function (value) {
       var ability = 0,
       currentTotal = 0,
       newTotal = 0,
       params = {},
       finished = false;
       try {
         ability = parseInt(value, 10) || 0;
         currentTotal = parseInt(v["ability-psionic-power"], 10) || 0;
         newTotal = Math.floor(ability * (parseInt(v["psionic-level-total"], 10) || 0) * 0.5);
         //TAS.debug("ability=" + ability, "newTotal=" + newTotal, "currentTotal=" + currentTotal);
         if (currentTotal !== newTotal) {
           if (silently) {
             params = PFConst.silentParams;
           }
           finished = true;
           setAttrs({
             "ability-psionic-power": newTotal
           }, params, done);
         }
       } catch (err) {
         TAS.error("PFPsionic.updatePsionicBonusPower", err);
       } finally {
         if (!finished) {
           done();
         }
       }
     });
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("Leaving PFPsionic.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["psionics-show"], function (v) {
     try {
       if (v["psionics-show"] == "1") {
         updatePsionicBonusPower(done, silently);
       } else {
         done();
       }
     } catch (err2) {
       TAS.error("PFPsionic.recalculate", err2);
       done();
     }
   });
 },
 registerEventHandlers = function () {
   on("change:psionic-level change:psionic-level-misc", TAS.callback(function eventUpdatePsionicLevel(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       SWUtils.updateRowTotal(["psionic-level-total", "psionic-level", "psionic-level-misc"]);
     }
   }));
   on("change:class-psionic-power change:ability-psionic-power change:misc-psionic-power", TAS.callback(function eventUpdatePsionicPower(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && eventInfo.sourceAttribute==='ability-psionic-power')) {
       SWUtils.updateRowTotal(["psionic-power_max", "class-psionic-power", "ability-psionic-power", "misc-psionic-power"]);
     }
   }));
   on("change:selected-ability-psionic-power change:psionic-level-total", TAS.callback(function eventUpdatePsionicBonusPower(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updatePsionicBonusPower();
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFPsionic module loaded        ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   updatePsionicBonusPower: updatePsionicBonusPower
 };
}());
var PFMythic = PFMythic || (function () {
 'use strict';
 var
 /* updateMythicPathHP
 * Updates total at bottom of Mythic Path Information grid */
 updateMythicPathHP = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["mythic-tier", "mythic-hp", "total-mythic-hp"], function (values) {
     var tot = 0,
     currTot = 0,
     setter = {},
     params = {};
     try {
       tot = (parseInt(values["mythic-tier"], 10) || 0) * (parseInt(values["mythic-hp"], 10) || 0);
       currTot = parseInt(values["total-mythic-hp"], 10) || 0;
       //TAS.debug("tot=" + tot + ", currTot=" + currTot);
       if (currTot !== tot) {
         setter["total-mythic-hp"] = tot;
       }
     } catch (err) {
       TAS.error("PFMythic.updateTierMythicPower error", err);
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
 },
 /* updateTierMythicPower sets tier mp*/
 updateTierMythicPower = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   //TAS.debug("entered updateTierMythicPower");
   getAttrs(["tier-mythic-power", "mythic-tier"], function (values) {
     var totalTier,
     curr,
     setter = {},
     params = {},
     finished = false;
     try {
       totalTier = 3 + 2 * (parseInt(values["mythic-tier"], 10) || 0);
       curr = parseInt(values["tier-mythic-power"], 10) || 0;
       //TAS.debug("totalTier=" + totalTier + ", curr=" + curr);
       if (curr !== totalTier) {
         setter["tier-mythic-power"] = totalTier;
       }
     } catch (err) {
       TAS.error("PFMythic.updateTierMythicPower error", err);
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
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("Leaving PFMythic.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["mythic-adventures-show"], function (v) {
     try {
       if (v["mythic-adventures-show"] == "1") {
         updateMythicPathHP(done,silently);
         updateTierMythicPower();
       } else {
         done();
       }
     } catch (err2) {
       TAS.error("PFMythic.recalculate", err2);
       done();
     }
   });
 },
 registerEventHandlers = function () {
   //mythic path and power
   on("change:mythic-tier change:mythic-hp", TAS.callback(function eventupdateMythicPathHP(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateMythicPathHP();
       updateTierMythicPower();
     }
   }));
   //mythic path
   on("change:mythic-hp", TAS.callback(function eventUpdateTierMythicPower(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateMythicPathHP();
     }
   }));
   on("change:misc-mythic-power change:tier-mythic-power", TAS.callback(function eventUpdateMythicPower(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && eventInfo.sourceAttribute==='tier-mythic-power')) {
       SWUtils.updateRowTotal(["mythic-power_max", "tier-mythic-power", "misc-mythic-power"]);
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFMythic module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   updateTierMythicPower: updateTierMythicPower,
   updateMythicPathHP: updateMythicPathHP
 };
}());
var PFHealth = PFHealth || (function () {
 'use strict';
 var
 /*setWoundLevel sets would level based on current HP when you already have all fields.
 * sets  @{condition-Wounds} based on :
 *@hp current hp
 *@grazed {int} hp  value for grazed level
 *@wounded {int} hp value for wounded level
 *@critical {int} hp value for critical level
 *@currWounds {int}  value of @{condition-Wounds}
 */
 setWoundLevel = function (hp, grazed, wounded, critical, currWounds) {
   var setWounds = 0;
   if (hp <= grazed) {
     if (hp > wounded) {
       setWounds = 1;
     } else if (hp > critical) {
       setWounds = 2;
     } else {
       setWounds = 3;
     }
   }
   //TAS.debug("PFHealth.setWoundLevel, hp:"+hp+", currWounds:"+currWounds+", setWounds:"+setWounds);
   if (setWounds !== currWounds) {
     setAttrs({
       "condition-Wounds": setWounds
     });
   }
 },
 /*setWoundLevelLookup - looks up data needed to set current would level.
 * calls setWoundLevel
 * @hp {int} the current hit points. will look up if this is not set.
 */
 setWoundLevelLookup = function (hp) {
   //TAS.debug"PFHealth.setWoundLevelLookup, hp passed in is:" + hp);
   getAttrs(["HP", "HP_grazed", "HP_wounded", "HP_critical", "condition-Wounds"], function (v) {
     if (isNaN(parseInt(hp, 10))) {
       hp = parseInt(v["HP"], 10) || 0;
     }
     //TAS.debug("PFHealth.setWoundLevelLookup",v);
     setWoundLevel(hp, parseInt(v["HP_grazed"], 10) || 0, parseInt(v["HP_wounded"], 10) || 0, parseInt(v["HP_critical"], 10) || 0, parseInt(v["condition-Wounds"], 10) || 0);
   });
 },
 /*setWoundThreshholds - sets wound thresholds when you already have hp data.
 * Also calls setWoundLevel
 * @hp {int} = current hit points @{HP}
 * @maxHP {int} = max hp @{HP|max}
 * @currWoundLevel {int} = @{condition-Wounds}
 * @abilityMod {int} = usually @{CON-mod} or mod of whataver ability is used. 0 if no ability (like undead)
 */
 setWoundThreshholds = function (hp, maxHP, currWoundLevel, abilityMod) {
   var grazed = Math.floor(maxHP * 0.75),
   wounded = Math.floor(maxHP * 0.5),
   critical = Math.floor(maxHP * 0.25),
   disabled = ((abilityMod > 0 ? abilityMod : 0) * -1);
   getAttrs(["HP_grazed", "HP_wounded", "HP_critical", "HP_disabled"], function (v) {
     var setter = {};
     if ((parseInt(v["HP_grazed"], 10) || 0) !== grazed) {
       setter["HP_grazed"] = grazed;
     }
     if ((parseInt(v["HP_wounded"], 10) || 0) !== wounded) {
       setter["HP_wounded"] = wounded;
     }
     if ((parseInt(v["HP_critical"], 10) || 0) !== critical) {
       setter["HP_critical"] = critical;
     }
     if ((parseInt(v["HP_disabled"], 10) || 0) !== disabled) {
       setter["HP_disabled"] = disabled;
     }
     if (_.size(setter) > 0) {
       setAttrs(setter, PFConst.silentParams);
     }
   });
   setWoundLevel(hp, grazed, wounded, critical, currWoundLevel);
 },
 /*setWoundThreshholdsLookup
 * Sets wound thresholds by looking up values for "are we even useing wound threshold rules?" and the max hit points.
 * Calls the other setWoundThresholds
 * If Wound Threshholds are not used, makes sure that condition-Wounds is set to 0.
 */
 setWoundThreshholdsLookup = function (eventInfo) {
   getAttrs(["HP", "HP_max", "wound_threshold-show", "condition-Wounds", "HP-ability-mod"], function (v) {
     if (v["wound_threshold-show"] == "1") {
       setWoundThreshholds(parseInt(v["HP"], 10) || 0, parseInt(v["HP_max"], 10) || 0, parseInt(v["condition-Wounds"], 10) || 0, parseInt(v["HP-ability-mod"], 10) || 0);
     } else if ((parseInt(v["condition-Wounds"], 10) || 0) > 0) {
       setAttrs({
         "condition-Wounds": "0"
       });
     }
   });
 },
 /* updateCurrHP- when updating hp, check nonLethalDmg level and wound threshold levels*/
 updateCurrHP = function (hp, temphp, nonLethalDmg, usesWounds, hpAbility, hpAbilityMod, staggered) {
   if (hpAbility != "0") {
     if (nonLethalDmg >= (hp + temphp + (usesWounds ? (1 + hpAbilityMod) : 0))) {
       setAttrs({
         "condition-Staggered": "1"
       });
     } else if (staggered == "1") {
       setAttrs({
         "condition-Staggered": "0"
       });
     }
   }
   if (usesWounds) {
     setWoundLevelLookup(hp);
   }
 },
 /* updateCurrHPLookup - looks up data and calls updateCurrHP */
 updateCurrHPLookup = function () {
   getAttrs(["HP", "HP-temp", "non-lethal-damage", "wound_threshold-show", "HP-ability", "HP-ability-mod", "condition-Staggered"], function (v) {
     //TAS.debug("PFHealth.updateCurrHPLookup",v);
     updateCurrHP(parseInt(v["HP"], 10) || 0, parseInt(v["HP-temp"], 10) || 0, parseInt(v["non-lethal-damage"], 10) || 0, v["wound_threshold-show"] == "1" ? 1 : 0, v["HP-ability"], parseInt(v["HP-ability-mod"], 10) || 0, v["condition-Staggered"]);
   });
 },
 /** updateMaxHPLookup
 * sets max HP
 * @param {function} callback when done
 * @param {boolean} silently if T then call setAttrs with {silent:True}
 * @param {boolean} forceReset recalculates max HP and sets HP to it.
 * @param {object} eventInfo unused
 */
 updateMaxHPLookup = function (callback, silently,forceReset,eventInfo) {
   var done = _.once(function () {
     TAS.debug("leaving updateMaxHPLookup");
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["HP", "HP_max", "HP-ability", "HP-ability-mod", "level", "total-hp", "total-mythic-hp", "condition-Drained", "HP-formula-mod", "HP-temp", "mythic-adventures-show", "wound_threshold-show",
     "condition-Wounds", "non-lethal-damage", "condition-Staggered", "hp_ability_bonus"], function (v) {
     var abilityMod = parseInt(v["HP-ability-mod"], 10) || 0,
     abilityBonus = (abilityMod * (parseInt(v["level"], 10) || 0)),
     currHPMax = parseInt(v["HP_max"], 10) || 0,
     currHP = parseInt(v["HP"], 10) || 0,
     tempHP = parseInt(v["HP-temp"], 10) || 0,
     nonLethal = parseInt(v["non-lethal-damage"], 10) || 0,
     newHPMax = 0,
     currWoundLevel = 0,
     usesWounds = 0,
     setter={};
     try {
       //TAS.debug("at updateMaxHPLookup",v);
       newHPMax = (abilityBonus + (parseInt(v["total-hp"], 10) || 0) + (parseInt(v["HP-formula-mod"], 10) || 0) + (5 * (parseInt(v["condition-Drained"], 10) || 0))) + (v["mythic-adventures-show"] == "1" ? (parseInt(v["total-mythic-hp"], 10) || 0) : 0);
       if (forceReset || currHPMax !== newHPMax) {
         setter = {
           "HP_max": newHPMax,
           "non-lethal-damage_max": newHPMax,
           "hp_ability_bonus": abilityBonus
         };
         if (forceReset) {
           setter["HP"]=newHPMax;
           currHP=newHPMax;
           if (nonLethal !== 0){
             nonLethal=0;
             setter["condition-Staggered"] = 0;
             setter["non-lethal-damage"] = 0;
           }
         }
         usesWounds= parseInt(v["wound_threshold-show"],10)||0;
         if (usesWounds) {
           if (forceReset){
             setter["condition-Wounds"] = 0;
             currWoundLevel = 0;
           } else {
             currWoundLevel = (parseInt(v["condition-Wounds"], 10) || 0);
           }
           if (currHPMax !== newHPMax){
             setWoundThreshholds(currHP + tempHP, newHPMax, currWoundLevel, abilityMod);
           }
         }
       }
     } catch (err) {
       TAS.error("PFHealth.updateMaxHPLookup", err);
     } finally {
       if (_.size(setter)>0){
         setAttrs(setter, PFConst.silentParams, done);
       } else {
         done();
       }
     }
   });
 },
 /* updateTempMaxHP
 * sets temp hp
 */
 updateTempMaxHP = function (callback, silently,forceReset) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["HP-temp", "HP-temp_max", "HP-temp-misc", "buff_HP-temp-total"], function (v) {
     var newHPTempMax,
     currHPTemp,
     newHPTemp,
     params = {};
     try {
       //TAS.debug("at updateTempMaxHP",v);
       newHPTempMax = (parseInt(v["HP-temp-misc"], 10) || 0) + (parseInt(v["buff_HP-temp-total"], 10) || 0);
       currHPTemp = parseInt(v["HP-temp"], 10) || 0;
       newHPTemp = forceReset ? newHPTempMax : (currHPTemp + newHPTempMax - currHPTemp);
       if (forceReset || newHPTemp !== currHPTemp) {
         if (silently) {
           params = PFConst.silentParams;
         }
         setAttrs({
           "HP-temp": newHPTemp,
           "HP-temp_max": newHPTempMax
         }, params, function () {
           updateCurrHPLookup(); //check for change due to non lethal
           done();
         });
       } else {
         done();
       }
     } catch (err) {
       TAS.error("updateTempMaxHP", err);
       done();
     }
   });
 },
 setToPFS = function (callback,eventInfo){
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   });
   setAttrs({'use_prestige_fame':1, 'auto_calc_hp':1, 'autohp_percent':1,'maxhp_lvl1':1},
   PFConst.silentParams, function (){
     if (eventInfo){
       PFClassRaceGrid.autoCalcClassHpGrid(done,false,eventInfo);
     }
   });
 },
 migrate = function(callback,  oldversion){
   var done = _.once(function(){
     TAS.debug("leaving PFHealth.migrate 2");
     if (typeof callback === "function"){
       callback();
     }
   });
   PFMigrate.migrateHPMisc(done);
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFHealth.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   callUpdateMaxHPLookup = _.once(function () {
     updateMaxHPLookup(done, silently);
   }),
   callUpdateTempHP = _.once(function () {
     updateTempMaxHP(callUpdateMaxHPLookup);
   });
   TAS.debug("at PFHealth.recalculate");
   migrate(callUpdateTempHP,oldversion);
 },
 registerEventHandlers = function () {
   on("change:set_pfs",TAS.callback(function eventsetPFSFlag(eventInfo){
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if(eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       getAttrs(["set_pfs"],function(v){
         if (parseInt(v.set_pfs,10)){
           setToPFS(null,eventInfo);
         }
       });
     }
   }));
   //hp************************************************************************
   on("change:hp-ability-mod change:level change:total-hp change:total-mythic-hp change:hp-formula-mod change:HP-misc", TAS.callback(function eventUpdateHPPlayerMisc(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api" || (eventInfo.sourceType === "sheetworker" && eventInfo.sourceAttribute !== "hp-misc")) {
       updateMaxHPLookup();
     }
   }));
   on("change:mythic-adventures-show", TAS.callback(function eventUpdateHPPlayer(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       getAttrs(["total-mythic-hp"], function (v) {
         if ((parseInt(v["total-mythic-hp"], 10) || 0) > 0) {
           updateMaxHPLookup();
         }
       });
     }
   }));
   on("change:hp-temp-misc", TAS.callback(function eventUpdateTempHP(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateTempMaxHP();
     }
   }));
   on("change:HP_reset", TAS.callback(function eventResetHP(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       updateMaxHPLookup(null,null,true);
       updateTempMaxHP(null,null,true);
       setAttrs({
         "HP_reset": "0"
       }, PFConst.silentParams);
     }
   }));
   on("change:HP change:non-lethal-damage", TAS.callback(function eventUpdateHPCurr(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       updateCurrHPLookup(eventInfo);
     }
   }));
   on("change:wound_threshold-show", TAS.callback(function eventResetConditionWounds(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       setWoundThreshholdsLookup(eventInfo);
     }
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFHealth module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate:migrate,
   recalculate: recalculate,
   setWoundLevel: setWoundLevel,
   setWoundLevelLookup: setWoundLevelLookup,
   setWoundThreshholds: setWoundThreshholds,
   setWoundThreshholdsLookup: setWoundThreshholdsLookup,
   updateCurrHP: updateCurrHP,
   updateCurrHPLookup: updateCurrHPLookup,
   updateMaxHPLookup: updateMaxHPLookup,
   updateTempMaxHP: updateTempMaxHP,
   setToPFS: setToPFS
 };
}());
var PFSaves = PFSaves || (function () {
 'use strict';
 var saveTypes = ["Fort", "Ref", "Will"],
 applyConditions = function (callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["condition-Fear", "condition-Sickened", "condition-Drained", "condition-Wounds", "saves-cond", "has_endurance_feat", "wounds_gritty_mode", "wound_threshold-show"], function (v) {
     var fear = 0,
     sickened = 0,
     drained = 0,
     wounds = 0,
     currCond = 0,
     newCond = 0,
     params = {},
     setter = {};
     try {
       fear = parseInt(v["condition-Fear"], 10) || 0;
       sickened = parseInt(v["condition-Sickened"], 10) || 0;
       drained = parseInt(v["condition-Drained"], 10) || 0;
       wounds = (parseInt(v["wound_threshold-show"], 10) || 0) * PFUtils.getWoundPenalty((parseInt(v["condition-Wounds"], 10) || 0), (parseInt(v.has_endurance_feat, 10) || 0), (parseInt(v.wounds_gritty_mode, 10) || 0));
       currCond = parseInt(v["saves-cond"], 10) || 0;
       newCond = drained - fear - sickened - wounds;
       if (currCond !== newCond) {
         setter["saves-cond"] = newCond;
       }
     } catch (err) {
       TAS.error("PFSaves.applyConditions", err);
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
 },
 /* updateSave - updates the saves for a character
 * @save = type of save: Fort, Ref, Will  (first character capitalized)
 */
 updateSave = function (save, callback, silently) {
   var fields = [save, "total-" + save, save + "-ability-mod", save + "-trait", save + "-enhance", save + "-resist", save + "-misc", "saves-cond", "buff_" + save + "-total"];
   SWUtils.updateRowTotal(fields, 0, [], false, callback, silently);
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("leaving PFSaves.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   saved = _.after(3, function () {
     //TAS.debug"finished 3 saves");
     done();
   });
   TAS.debug("at PFSaves.recalculate");
   try {
     applyConditions(function () {
       try {
         updateSave("Fort", saved, silently);
         updateSave("Ref", saved, silently);
         updateSave("Will", saved, silently);
       } catch (err2) {
         TAS.error("PFSaves.recalculate inner saves", err2);
         done();
       }
     }, silently);
   } catch (err) {
     TAS.error("PFSaves.recalculate OUTER", err);
     done();
   }
 },
 events = {
   saveEventsAuto: "change:saves-cond change:total-REPLACE change:REPLACE-ability-mod",
   saveEventsPlayer: "change:REPLACE-trait change:REPLACE-enhance change:REPLACE-resist change:REPLACE-misc"
 },
 registerEventHandlers = function () {
   _.each(saveTypes, function (save) {
     var eventToWatch = events.saveEventsAuto.replace(/REPLACE/g, save);
     on(eventToWatch, TAS.callback(function eventUpdateSaveAuto(eventInfo) {
       if (eventInfo.sourceType === "sheetworker") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + save + ": " + eventInfo.sourceType);
         updateSave(save, eventInfo);
       }
     }));
   });
   _.each(saveTypes, function (save) {
     var eventToWatch = events.saveEventsPlayer.replace(/REPLACE/g, save);
     on(eventToWatch, TAS.callback(function eventUpdateSavePlayer(eventInfo) {
       if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event for " + save + ": " + eventInfo.sourceType);
         updateSave(save, eventInfo);
       }
     }));
   });
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFSaves module loaded          ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   saveTypes: saveTypes,
   applyConditions: applyConditions,
   updateSave: updateSave
 };
}());
var PFSize = PFSize || (function () {
 'use strict';
 var
 sizeModToEasySizeMap={
   '-8':8,
   '-4':7,
   '-2':6,
   '-1':5,
    '0':4,
    '1':3,
    '2':2,
    '4':1,
    '8':0
 },
 /** getSizeFromText - returns size mod based on size display name
 * @param {string} sizeDisplay size in english (medium, large, gargantuan, tiny, etc)
 * @returns {jsobj} map of {"size":size mod for AC,"skillSize": size mod for fly}
 */
 getSizeFromText = function (sizeDisplay) {
   var sizeMap = {
     "size": 0,
     "skillSize": 0
   };
   try {
     if (sizeDisplay) {
       sizeDisplay = sizeDisplay.toLowerCase();
       switch (sizeDisplay) {
         case "medium":
           break;
         case "colossal":
           sizeMap.size = -8;
           sizeMap.skillSize = -8;
           break;
         case "gargantuan":
           sizeMap.size = -4;
           sizeMap.skillSize = -6;
           break;
         case "huge":
           sizeMap.size = -2;
           sizeMap.skillSize = -4;
           break;
         case "large":
           sizeMap.size = -1;
           sizeMap.skillSize = -2;
           break;
         case "small":
           sizeMap.size = 1;
           sizeMap.skillSize = 2;
           break;
         case "tiny":
           sizeMap.size = 2;
           sizeMap.skillSize = 4;
           break;
         case "diminutive":
           sizeMap.size = 4;
           sizeMap.skillSize = 6;
           break;
         case "fine":
           sizeMap.size = 8;
           sizeMap.skillSize = 8;
           break;
         default:
           break;
       }
     }
   } catch (err) {
     TAS.error("get size from text:" + sizeDisplay, err);
     sizeMap.size = 0;
     sizeMap.skillSize = 0;
   } finally {
     return sizeMap;
   }
 },
 /**returns number of levels size went up or down
 * ex: Med to Lg is +1, Med to Sm is -1, Md to Tiny is -2, etc
 @param {int} currSize new size mod , usually value of @{size}
 @param {int} defaultSize default size mod, for sheet it is value of @{default_char_size}
           for weapon it is @{repeating_weapon_$X_default_size}
 @returns {int} difference in sizes (not difference in size mods)
 */
 getSizeLevelChange = function (currSize,defaultSize) {
   var newSize,oldSize,levelChange;
   newSize=sizeModToEasySizeMap[String(currSize)];
   oldSize=sizeModToEasySizeMap[String(defaultSize)];
   levelChange = newSize-oldSize;
   return levelChange;
 },
 /**updateDamageDice returns new dice for weapon/attack damage change due to size
 *@param {int} sizediff difference in LEVELS of size (Medium to Large is 1, Medium to Small is -1)
 *@param {int} defaultSize size modifier, necessary since different rules for small
 *@param {int} currDice num dice from 1 to n
 *@param {int} currDie num sides of die : valid only from 1 to 12
 *@returns {jsobj} {dice:n,die:n}
 */
 updateDamageDice=function(sizediff,defaultSize,currDice,currDie){
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
         TAS.debug("updateDamageDice: currow is now"+currow+", diff still:"+sizediff);
       }
     }
   } catch(err){
     TAS.error("updateDamageDice: ",err);
   } finally {
     return {"dice":currDice,"die":currDie};
   }
 },
 updateSize = function (eventInfo, callback, silently) {
   var done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   });
   getAttrs(["size", "old_size", "default_char_size", "CMD-size", "size_display"], function (v) {
     var size =  0,
     oldSize=0,
     defaultSize=0,
     currSize = 0,
     cmbsize = 0,
     levelChange = 0,
     skillSize = 0,
     doubleSkill = 0,
     sizeDisplay = "Medium",
     forceCurr=0,
     params = {},
     setter = {};
     try {
       //TAS.debug("At PFSize.updateSize",v);
       size = parseInt(v.size, 10) || 0;
       if(v.old_size==='x' ){
         forceCurr=true;
         currSize=(parseInt(v["CMD-size"], 10) || 0) * -1;
         defaultSize=currSize;
       } else {
         currSize = parseInt(v.old_size,10)||0;
         defaultSize = parseInt(v.default_char_size,10)||0;
       }

       switch (size) {
         case 0:
           break;
         case -8:
           skillSize = -8;
           sizeDisplay = "Colossal";
           break;
         case -4:
           skillSize = -6;
           sizeDisplay = "Gargantuan";
           break;
         case -2:
           skillSize = -4;
           sizeDisplay = "Huge";
           break;
         case -1:
           skillSize = -2;
           sizeDisplay = "Large";
           break;
         case 1:
           skillSize = 2;
           sizeDisplay = "Small";
           break;
         case 2:
           skillSize = 4;
           sizeDisplay = "Tiny";
           break;
         case 4:
           skillSize = 6;
           sizeDisplay = "Diminutive";
           break;
         case 8:
           skillSize = 8;
           sizeDisplay = "Fine";
           break;
       }
       doubleSkill = 2 * skillSize;
       cmbsize = size * -1;
       //here is where we tell attacks damage dice to change.
       levelChange = getSizeLevelChange(currSize,defaultSize);
       if (size !== currSize) {
         setter.size_skill = skillSize;
         setter.old_size = size;
         setter["CMD-size"] = cmbsize;
         setter.size_skill_double = doubleSkill;
         setter.size_display = sizeDisplay;
       } else if (forceCurr){
         setter.old_size= size;
         setter.default_char_size = size;
       } else if (v["size_display"] !== sizeDisplay) {
         setter.size_display = sizeDisplay;
       }
     } catch (err) {
       TAS.error("PFSize.updateSize", err);
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
 },
 migrate = function (callback){
   PFMigrate.migrateSize(callback);
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("Leaving PFSize.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   });
   TAS.debug("At PFSize.recalculate");
   updateSize(null, done, silently);
 },
 registerEventHandlers = function () {
   //size
   on("change:size", TAS.callback(function eventUpdateSize(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     updateSize();
     PFEncumbrance.updateLoadsAndLift();
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFSize module loaded           ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   migrate: migrate,
   recalculate: recalculate,
   updateDamageDice: updateDamageDice,
   updateSize: updateSize,
   getSizeFromText: getSizeFromText
 };
}());
var PFInitiative = PFInitiative || (function () {
 'use strict';
 /* updateInitiative * updates the init*/
 var updateInitiative = function (callback, silently) {
   getAttrs(['nodex-toggle'],function(v){
     if (parseInt(v['nodex-toggle'],10)) {
       //if lose dex then lose ability mod no matter what ability it is, since init is a dex check:
       //http://paizo.com/paizo/faq/v5748nruor1fm#v5748eaic9tga
       SWUtils.updateRowTotal(["init", "init-trait", "init-misc-mod","checks-cond"], 0, ["condition-Deafened"], false, callback, silently);
     } else {
       SWUtils.updateRowTotal(["init", "init-ability-mod", "init-trait", "init-misc-mod","checks-cond"], 0, ["condition-Deafened"], false, callback, silently);
     }
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.info("Leaving PFInitiative.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   });
   updateInitiative(done, silently);
 },
 registerEventHandlers = function () {
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
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFInitiative module loaded     ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   updateInitiative: updateInitiative
 };
}());
var PFChecks = PFChecks || (function () {
 'use strict';
 var
 /* PFChecks.applyConditions - handles changes to skill and ability checks due to conditions AND buffs.
 * Reads in condition that affect Ability and Skill checks and updates condition fields.
 * checks-cond, Phys-skills-cond, Perception-cond.
 */
 applyConditions = function (callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   };
   getAttrs(["condition-Blinded", "condition-Fear", "condition-Drained", "condition-Sickened", "condition-Wounds", "has_endurance_feat", "wounds_gritty_mode", "checks-cond", "Phys-skills-cond", "Perception-cond", "buff_Check-total", "wound_threshold-show", "CasterLevel-Penalty"], function (v) {
     //there is no Fascinated, if we add it then:
     //,"condition-Fascinated" -4 to perception
     var setter = {},
     params = {}, buffCheck = 0, drained = 0, fear = 0, sick = 0, woundPenalty = 0, wounds = 0, allSkillsMod = 0, casterlevel = 0, blindedMod = 0, currAllSkills = 0, currPhysSkills = 0, currPerSkills = 0, currCaster = 0;
     try {
       buffCheck = parseInt(v["buff_Check-total"], 10) || 0;
       drained = parseInt(v["condition-Drained"], 10) || 0;
       fear = -1 * (parseInt(v["condition-Fear"], 10) || 0);
       sick = -1 * (parseInt(v["condition-Sickened"], 10) || 0);
       woundPenalty = PFUtils.getWoundPenalty((parseInt(v["condition-Wounds"], 10) || 0), (parseInt(v.has_endurance_feat, 10) || 0), (parseInt(v.wounds_gritty_mode, 10) || 0));
       wounds = (parseInt(v["wound_threshold-show"], 10) || 0) * woundPenalty;
       allSkillsMod = buffCheck + drained + fear + sick + wounds;
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
         setAttrs(setter, {}, done);
       } else {
         done();
       }
     }
   });
 };
 console.log(PFLog.l + '   PFChecks module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   applyConditions: applyConditions
 };
}());
var PFConditions = PFConditions || (function () {
 'use strict';
 var
 /* updateGrapple Ensures Grapple and Pin are mutually exclusive */
 updateGrapple = function () {
   getAttrs(["condition-Pinned", "condition-Grappled"], function (values) {
     if (values["condition-Pinned"] !== "0" && values["condition-Grappled"] !== "0") {
       setAttrs({
         "condition-Pinned": "0"
       });
     } else {
       //user hit either pinned and it undid grapple, or hit grapple first time.
       PFAbilityScores.applyConditions();
     }
   });
 },
 /* updatePin Ensures Grapple and Pin are mutually exclusive */
 updatePin = function () {
   getAttrs(["condition-Pinned", "condition-Grappled"], function (values) {
     if (values["condition-Pinned"] !== "0" && values["condition-Grappled"] !== "0") {
       setAttrs({
         "condition-Grappled": "0"
       });
     } else {
       //user hit grapple and it  undid pinned, or hit pinned first time.
       PFAbilityScores.applyConditions();
     }
   });
 },
 /* updates drain for condition status panel */
 updateDrainCheckbox = function (callback,silently,eventInfo) {
   getAttrs(["condition-Drained", "condition_is_drained"], function (v) {
     var levels = parseInt(v["condition-Drained"], 10) || 0,
     drained = parseInt(v["condition_is_drained"], 10) || 0;
     if (levels !== 0 && drained === 0) {
       setAttrs({
         "condition_is_drained": "1"
       }, PFConst.silentParams);
     } else if (levels === 0 && drained !== 0) {
       setAttrs({
         "condition_is_drained": "0"
       }, PFConst.silentParams);
     }
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("Leaving PFConditions.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   });
   updateDrainCheckbox();
   PFAbilityScores.applyConditions(done);
 },
 events = {
   conditionEventsEither: {
     "change:condition-grappled": [updateGrapple, PFAttackGrid.applyConditions],
     "change:condition-pinned": [updatePin, PFDefense.applyConditions],
     "change:condition-wounds change:has_endurance_feat change:wounds_gritty_mode": [PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions, PFDefense.applyConditions]
   },
   conditionEventsPlayer: {
     "change:condition-Sickened": [PFAttackGrid.updateDamage, PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions],
     "change:condition-stunned": [PFDefense.updateDefenses, PFDefense.applyConditions],
     "change:condition-Flat-Footed": [PFDefense.updateDefenses],
     "change:condition-deafened": [PFInitiative.updateInitiative, PFSpellCasterClasses.applyConditions],
     "change:condition-fatigued": [PFAbilityScores.applyConditions],
     "change:condition-entangled": [PFAbilityScores.applyConditions, PFAttackGrid.applyConditions],
     "change:condition-drained": [updateDrainCheckbox, PFHealth.updateMaxHPLookup, PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions, PFDefense.applyConditions],
     "change:condition-fear": [PFChecks.applyConditions, PFSaves.applyConditions, PFAttackGrid.applyConditions],
     "change:condition-blinded": [PFChecks.applyConditions, PFDefense.applyConditions],
     "change:condition-cowering": [PFDefense.applyConditions],
     "change:condition-invisible": [PFDefense.updateDefenses, PFDefense.applyConditions, PFAttackGrid.applyConditions],
     "change:condition-dazzled": [PFAttackGrid.applyConditions],
     "change:condition-prone": [PFAttackGrid.applyConditions],
     "change:condition-Helpless": [PFAbilityScores.applyConditions]
   }
 },
 registerEventHandlers = function () {
   _.each(events.conditionEventsPlayer, function (functions, eventToWatch) {
     _.each(functions, function (methodToCall) {
       on(eventToWatch, TAS.callback(function eventConditionEventsPlayer(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
           methodToCall(null,null,eventInfo);
         }
       }));
     });
   });
   _.each(events.conditionEventsEither, function (functions, eventToWatch) {
     _.each(functions, function (methodToCall) {
       on(eventToWatch, TAS.callback(function eventConditionEventsEither(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         methodToCall(null,null,eventInfo);
       }));
     });
   });
   on("change:Perception-cond", TAS.callback(function eventUpdateSkillPerceptionCond(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     PFSkills.verifyHasSkill("Perception",function(hasSkill){
       if (hasSkill){
         PFSkills.updateSkill("Perception", eventInfo);
       } else {
         PFSkills.updateSkill("CS-Perception", eventInfo);
       }
     });
   }));
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFConditions module loaded     ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   updateGrapple: updateGrapple,
   updatePin: updatePin,
   updateDrainCheckbox: updateDrainCheckbox
 };
}());
var PFBuffs = PFBuffs || (function () {
 'use strict';
 var buffColumns = PFAbilityScores.abilities.concat(["Ranged", "Melee", "DMG", "AC", "Touch", "CMD", "HP-temp", "Fort", "Will", "Ref", "Check", "CasterLevel"]),
 //why did i make this? it just repeats the ability scores
 allBuffColumns = buffColumns, //buffColumns.concat(PFAbilityScores.abilities),
 /* this is so old no one will be using it*/
 migrate = function (outerCallback) {
   var done = _.once(function () {
     TAS.debug("leaving PFBuffs.migrate");
     if (typeof outerCallback === "function") {
       outerCallback();
     }
   });
   getAttrs(["migrated_buffs", "migrated_effects"], function (v) {
     var setter = {};
     try {
       if (v.migrated_buffs != "1") {
         setter.migrated_buffs = 1;
       }
       if (v.migrated_effects != "1") {
         setter.migrated_effects = 1;
       }
     } catch (err) {
       TAS.error("PFBuffs.migrate", err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, {
           silent: true
         }, done);
       } else {
         done();
       }
     }
   });
 },
 /** createTotalBuffEntry - used by parseNPC
  * adds enabled buff for a new sheet where this is the only buff so sets total as well.
  * adds attributes to array passed in
  * @param {string} name name of buff row  for buff-name
  * @param {string} bufftype  -string from buffColumns
  * @param {string} buffmacro ?
  * @param {number} modamount - value for the buff
  * @param {jsobjectmap} newRowAttrs - object of {name:value} to pass to setAttrs
  * @return {jsobjectmap} return newRowAttrs after adding maps to it.
  */
 createTotalBuffEntry = function (name, bufftype, buffmacro, modamount, newRowAttrs) {
   var newRowId = generateRowID();
   newRowAttrs = newRowAttrs||{};
   newRowAttrs["repeating_buff_" + newRowId + "_buff-name"] = name;
   newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype + "_macro-text"] = buffmacro;
   newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype] = modamount;
   newRowAttrs["repeating_buff_" + newRowId + "_buff-" + bufftype + "-show"] = "1";
   newRowAttrs["repeating_buff_" + newRowId + "_buff-enable_toggle"] = "1";
   newRowAttrs["buff_" + bufftype + "-total"] = modamount;
   return newRowAttrs;
 },
 resetStatuspanel = function (callback) {
   var done = _.once(function () { if (typeof callback === "function") { callback(); } }),
   buffTotalsColumns, fields;
   try {
     buffTotalsColumns = _.extend(
     _.map(allBuffColumns, function (col) {
       return "buff_" + col + "-total";
     }),
     _.map(PFAbilityScores.abilities, function (col) {
       return "buff_" + col + "-total_penalty";
     })
     );
     fields = SWUtils.cartesianAppend(["buff_"], buffColumns, ["-total", "_exists"]).concat(
       SWUtils.cartesianAppend(["buff_"], PFAbilityScores.abilities, ["-total", "-total_penalty", "_exists", "_penalty_exists"])
     );
     getAttrs(fields, function (v) {
       var setter = {};
       try {
         setter = _.reduce(allBuffColumns, function (memo, col) {
           var val, field, exists;
           try {
             val = parseInt(v["buff_" + col + "-total"], 10) || 0; field = "buff_" + col + "_exists"; exists = parseInt(v[field], 10) || 0;
             if (val !== 0 && !exists) {
               memo[field] = "1";
             } else if (val === 0 && exists) {
               memo[field] = "";
             }
           } catch (erri1) { } finally {
             return memo;
           }
         }, setter);
         setter = _.reduce(PFAbilityScores.abilities, function (memo, col) {
           var val, field, exists;
           try {
             val = parseInt(v["buff_" + col + "-total_penalty"], 10) || 0; field = "buff_" + col + "_penalty_exists"; exists = parseInt(v[field], 10) || 0;
             if (val !== 0 && !exists) {
               memo[field] = "1";
             } else if (val === 0 && exists) {
               memo[field] = "";
             }
           } catch (erri1) { } finally {
             return memo;
           }
         }, setter);
       } catch (err) {
         TAS.error("PFBuffs.resetStatuspanel error inside calculate exists", err);
       } finally {
         if (_.size(setter) > 0) {
           setAttrs(setter, { silent: true }, done);
         } else {
           done();
         }
       }
     });
   } catch (errO) {
     TAS.error("PFBuffs.resetStatuspanel error creating field array, abort:", errO);
     done();
   }
 },
 /* Sets 1 or 0 for buffexists in status panel - only called by updateBuffTotals. */
 toggleBuffStatusPanel = function (col, val) {
   var field = "buff_" + col + "_exists";
   getAttrs([field], function (v) {
     var setter = {};
     try {
       if (val !== 0 && v[field] != "1") {
         setter[field] = "1";
       } else if (val === 0 && v[field] == "1") {
         setter[field] = "";
       }
     } catch (err) {
       TAS.error("PFBuffs.toggleBuffStatusPanel", err);
     } finally {
       if (_.size(setter) > 0) {
         setAttrs(setter, { silent: true });
       }
     }
   });
 },
 setBuff = function (id, col, callback, silently) {
   var done = function () {
     if (typeof callback === "function") {
       callback();
     }
   },
   idStr = PFUtils.getRepeatingIDStr(id),
   prefix = "repeating_buff_" + idStr + "buff-" + col;
   SWUtils.evaluateAndSetNumber(prefix + "_macro-text", prefix,0,done);
 },
 updateBuffTotals = function (col, callback) {
   var done = _.once(function () {
     TAS.debug("leaving PFBuffs.updateBuffTotals");
     if (typeof callback === "function") {
       callback();
     }
   }),
   isAbility = (PFAbilityScores.abilities.indexOf(col) >= 0);
   try {
     TAS.repeating('buff').attrs('buff_' + col + '-total', 'buff_' + col + '-total_penalty').fields('buff-' + col, 'buff-enable_toggle', 'buff-' + col + '-show').reduce(function (m, r) {
       try {
         var tempM = (r.I['buff-' + col] * ((r.I['buff-enable_toggle']||0) & (r.I['buff-' + col + '-show']||0)));
         tempM=tempM||0;
         if (!(isAbility && tempM < 0)) {
           m.mod += tempM;
         } else {
           m.pen += tempM;
         }
       } catch (err) {
         TAS.error("PFBuffs.updateBuffTotals error:" + col, err);
       } finally {
         return m;
       }
     }, {
       mod: 0,
       pen: 0
     }, function (m, r, a) {
       try {
         //TAS.debug('setting buff_' + col + '-total to '+ (m.mod||0));
         a.S['buff_' + col + '-total'] = m.mod||0;
         toggleBuffStatusPanel(col, m.mod);
         if (isAbility) {
           a.S['buff_' + col + '-total_penalty'] = m.pen||0;
           //TAS.debug("now also check ability penalty status");
           toggleBuffStatusPanel(col + "_penalty", m.pen);
         }
       } catch (errfinalset){
         TAS.error("error setting buff_" + col + "-total");
       }
     }).execute(done);
   } catch (err2) {
     TAS.error("PFBuffs.updateBuffTotals error:" + col, err2);
     done();
   }
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     resetStatuspanel();
     TAS.debug("Leaving PFBuffs.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   numColumns = _.size(allBuffColumns),
   columnDone = _.after(numColumns, done),
   colsDoneCount = 0,
   recalculateBuffColumn = function (ids, col) {
     var rowtotal = _.size(ids),
       totalItUp = _.once(function () {
         colsDoneCount++;
         updateBuffTotals(col, columnDone);
       }),
       rowDone;
     if (rowtotal <=0){
       totalItUp();
       return;
     }
     rowDone = _.after(rowtotal, function () {
       totalItUp();
     });
     try {
       _.each(ids, function (id) {
         try {
           getAttrs(['repeating_buff_'+id+'_buff-enable_toggle',
           'repeating_buff_'+id+'_buff-' + col + '-show'],function(v){
             if (parseInt(v['repeating_buff_'+id+'_buff-enable_toggle'],10) &&
               parseInt(v['repeating_buff_'+id+'_buff-' + col + '-show'],10) ) {
                 setBuff(id, col, rowDone, silently);
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
   };
   getSectionIDs("repeating_buff", function (ids) {
     //TAS.debug("pfbuffsrecalculate there are " + _.size(ids) + " rows and " + numColumns + " columns");
     try {
       if (_.size(ids) > 0) {
         _.each(allBuffColumns, function (col) {
           recalculateBuffColumn(ids, col);
         });
       } else {
         _.each(allBuffColumns, function (col) {
           updateBuffTotals(col, columnDone, silently);
         });
       }
     } catch (err) {
       TAS.error("PFBuffs.recalculate_recalcbuffs", err);
       //what to do? just quit
       done();
     }
   });
 },
 events = {
   // events pass in the column updated macro-text is "either", buffs are auto only
   buffTotalNonAbilityEvents: {
     //ranged and attack are in the PFAttackGrid module
     "Fort": [PFSaves.updateSave],
     "Will": [PFSaves.updateSave],
     "Ref": [PFSaves.updateSave]
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
     "DMG": [PFAttackGrid.updateDamage],
     "AC": [PFDefense.updateDefenses],
     "Touch": [PFDefense.updateDefenses],
     "CMD": [PFDefense.updateDefenses],
     "HP-temp": [PFHealth.updateTempMaxHP],
     "Check": [PFChecks.applyConditions]
   }
 },
 registerEventHandlers = function () {
   //BUFFS
   _.each(buffColumns, function (col) {
     //Evaluate macro text upon change
     var eventToWatch = "change:repeating_buff:buff-" + col + "_macro-text";
     on(eventToWatch, TAS.callback(function eventBuffMacroText(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " for column " + col + ", event: " + eventInfo.sourceType);
       setBuff(null, col);
     }));
     //Update total for a buff upon Mod change
     eventToWatch = "change:repeating_buff:buff-" + col + " change:repeating_buff:buff-" + col + "-show";
     on(eventToWatch, TAS.callback(function PFBuffs_updateBuffTotalsShow(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       if (eventInfo.sourceType === "sheetworker" || /show/i.test(eventInfo.sourceAttribute)) {
         updateBuffTotals(col);
       }
     }));
   });
   on("change:repeating_buff:buff-enable_toggle remove:repeating_buff", TAS.callback(function PFBuffs_updateBuffTotalsToggle(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "sheetworker" || /toggle/i.test(eventInfo.sourceAttribute)) {
       _.each(buffColumns, function (col) {
         updateBuffTotals(col);
       });
     }
   }));
   //generic easy buff total updates
   _.each(events.buffTotalNonAbilityEvents, function (functions, col) {
     var eventToWatch = "change:buff_" + col + "-total";
     _.each(functions, function (methodToCall) {
       on(eventToWatch, TAS.callback(function event_updateBuffNonAbilityEvents(eventInfo) {
         TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
         if (eventInfo.sourceType === "sheetworker") {
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
         if (eventInfo.sourceType === "sheetworker") {
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
         if (eventInfo.sourceType === "sheetworker") {
           methodToCall(null,false, eventInfo);
         }
       }));
     });
   });
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFBuffs module loaded          ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   recalculate: recalculate,
   createTotalBuffEntry: createTotalBuffEntry,
   buffColumns: buffColumns,
   migrate: migrate,
   setBuff: setBuff,
   resetStatuspanel: resetStatuspanel,
   updateBuffTotals: updateBuffTotals
 };
}());
var PFNPC = PFNPC || (function () {
 'use strict';
 var
 /* setToNPC when first setting a sheet , set other default config settings
 * also switch to NPC page for when user leaves ocnfig page.
 */
 setToNPC = function (callback,eventInfo){
   var done = _.once(function(){
     if (typeof callback === "function"){
       callback();
     }
   });
   getAttrs(["npc-hd","npc-hd-num","level","npc-cr","is_newsheet"],function(v){
     //determine if this is a new sheet. if so set default config choices:
     if ( parseInt(v.is_newsheet,10) || (  !(  parseInt(v['npc-hd'],10)  || parseInt(v['npc-hd-num'],10) || parseInt(v['level'],10) || parseInt(v['npc-cr'],10) ))) {
       setAttrs({ 'auto_calc_hp':1, 'autohp_percent':1, 'maxhp_lvl1':0, 'normal_macro_show': 1, 'max-dex-source':3,
         'use_traits':0 , 'use_racial_traits':0, 'tab':8, 'is_v1':1}, PFConst.silentParams, done);
     } else {
       //should we do something? at least recalc the commandmacros?
       done();
     }
   });
 },
 recalculate = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFNPC.recalculate");
     if (typeof callback === "function") { callback(); }
   });
   PFMigrate.migrateNPC(done,silently);
 },
 registerEventHandlers = function () {
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
 };
 registerEventHandlers();
 console.log(PFLog.l + '   PFNPC module loaded            ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   setToNPC: setToNPC,
   recalculate: recalculate
 };
}());
var PFNPCParser = PFNPCParser || (function () {
 'use strict';
 var
 npcCompendiumAttributesPlayer = ["character_name", "type_compendium", "dr_compendium", "sr_compendium", "xp_compendium", "bab_compendium",
   "init_compendium", "npc_hp_compendium", "ac_compendium", "fort_compendium", "ref_compendium", "will_compendium", "senses_compendium",
   "size_compendium", "str_compendium", "dex_compendium", "con_compendium", "int_compendium", "wis_compendium", "cha_compendium",
   "speed_compendium", "space_compendium", "reach_compendium", "npc-special-attacks", "npc-spellike-ability-text", "npc-melee-attacks-text",
   "npc-ranged-attacks-text", "npc-spells-known-text", "npc-feats-text", "cr_compendium", "npc-feats-text", "skills_compendium",
   "racial_mods_compendium", "SQ_compendium", "content_compendium"],

 /* ******************************** PARSING ******************************** */

 /** returns number from a string, first looks at end of string, then beginning, then anywhere in middle
 * so it works with both compendium (number at end) and SRD ("init " number at beginning) or just a string number
 *@param {string} initstring from the compendium entry
 *@returns {int} the initiative modifier
 */
 getNPCInit = function (initstring) {
   var numberInit;
   if ((/[\-\+]{0,1}\d+$/).test(initstring)) {
     numberInit = parseInt(initstring.match(/[\-\+]{0,1}\d+$/), 10);
   } else if ((/^(Init\s){0,1}[\-\+]{0,1}\d+/i).test(initstring)) {
     numberInit = parseInt(initstring.match(/[\-\+]{0,1}\d+$/), 10);
   } else if ((/^[\-\+]{0,1}\d+$/).test(initstring)) {
     numberInit = parseInt(initstring.match(/^[\-\+]{0,1}\d+$/), 10);
   } else if ((/[\-\+]{0,1}\d+/).test(initstring)) {
     numberInit = parseInt(initstring.match(/[\-\+]{0,1}\d+/), 10);
   }
   if (!isNaN(numberInit)) {
     return numberInit;
   }
   return 0;
 },
 /**getAbilityAndMod- returns the number and mod for an ability
 * @param {string} numberAsString the ability score -a number in string form
 * @returns {base: number or '-', mod:number}
 */
 getAbilityAndMod = function (numberAsString) {
   var base = parseInt(numberAsString, 10),
   mod = 0;
   if (!isNaN(base)) {
     mod = Math.floor((base - 10) / 2);
     return {
       "base": base,
       "mod": mod
     };
   }
   if (/dash|\-|8212|—/i.test(numberAsString)) {
     return {
       "base": "-",
       "mod": 0
     };
   }
   return {
     "base": 10,
     "mod": 0
   };
 },
 /** parseNPChp - parses statblock hp string such as 203 (14d10+126)
 * @param {string} hpstring - string format: "15 (3d8 + 2d8 + 4) Fast Healing 5"  can have multiple xdy, and any string left after ) is considered healing note.
 * @param {int} abilityMod: number representing ability score mod (normally CON-mod)
 * @returns {object} {hp:0,hdie1:0,hdice1:0,hdie2:0,hdice2:0,misc:0,heal:""}
 *  where hdie1 d hdice1 is racial, and 2 is class, can go up to n classes
 */
 parseNPChp = function (hpstring, abilityMod) {
   var newHP = 0,
   plus = 0,
   matches,
   hparray = {
     hp: 0,
     hdie1: 0,
     hdice1: 0,
     basehp: 0,
     misc: 0,
     heal: ""
   },
   totalAbility = 0,
   matchessub,
   i = 0,
   tempstr = "",
   tempHD = 0,
   tempHdn = 0,
   tempmisc = 0,
   calcHP = 0;
   abilityMod = abilityMod || 0;
   if ((/^hp\s/i).test(hpstring)){
     hpstring = hpstring.slice(3);
   }
   //TAS.debug"parseNPChp", hpstring, abilityMod);
   newHP = parseInt(hpstring, 10);
   if (!isNaN(newHP)) {
     hparray.hp = newHP;
     if (hpstring.indexOf("(") > 0) {
       hpstring = hpstring.slice(hpstring.indexOf("(") + 1);
     }
     matches = hpstring.match(/\d+d\d+/ig);
     if (matches) {
       for (i = 0; i < matches.length; i++) {
         tempstr = matches[i];
         matchessub = tempstr.match(/(\d+)d(\d+)/i);
         if (matchessub && matchessub[1] && matchessub[2]) {
           tempHdn = parseInt(matchessub[1], 10) || 0;
           tempHD = parseInt(matchessub[2], 10) || 0;
           if (i > 0 && tempHD === 8 && hparray.hdie1 !== 8) {
             hparray["hdice" + (i + 1)] = hparray.hdice1;
             hparray["hdie" + (i + 1)] = hparray.hdie1;
             hparray.hdice1 = tempHdn;
             hparray.hdie1 = tempHD;
           } else {
             hparray["hdice" + (i + 1)] = tempHdn;
             hparray["hdie" + (i + 1)] = tempHD;
           }
         }
       }
     }
     //skip to next
     if (i > 0) {
       i--;
       hpstring = hpstring.slice(hpstring.indexOf(matches[i]) + matches[i].length);
     }
     // some entries have "plus" instead of "+"
     matches = hpstring.match(/\s*?([+\-]\s*\d+)\s*?|\s*?plus\s(\d+)\s*?/);
     if (matches) {
       hpstring = hpstring.slice(matches.index + matches[0].length);
       if (matches[1]) {
         plus = parseInt(matches[1].replace(/\s/g, ''), 10) || 0;
       } else if (matches[2]) {
         plus = parseInt(matches[2], 10) || 0;
       }
     }
     //bug in compendium: no minus sign, so adds mod to end of die:
     //  instead of 1d8-1 it's 1d81, 1 dee 81 !
     // see Flying Squirrel
     if (!matches && hparray.hdie1 > 10 && (abilityMod < 0 || (hparray.hdie1 !== 12 && hparray.hdie1 !== 20))) {
       plus = hparray.hdie1 % 10;
       plus = -1 * plus;
       hparray.hdie1 = Math.floor(hparray.hdie1 / 10);
       TAS.warn("negative in compendium: plus is -1 * hit die mod 10");
     }
     totalAbility = abilityMod * hparray.hdice1;
     tempmisc = plus - totalAbility;
     //TAS.debug"plus "+plus +" minus con:"+totalAbility+" = "+ tempmisc);
     //misc is any bonus to the dice that is not due to CON modifier
     hparray.misc = tempmisc;
     if (hpstring.indexOf(")") >= 0) {
       hpstring = hpstring.slice(hpstring.indexOf(")") + 1);
     }
     if (hpstring.indexOf(";") === 0) {
       hpstring = hpstring.slice(1);
     }
     if (hpstring.length > 0) {
       hparray.heal = hpstring;
     }
   }
   //set the base hp to only the hd average, so will be less than what is in statblock
   hparray.basehp = PFUtils.getAvgHP(hparray.hdice1, hparray.hdie1);
   //check total, if does not match, add more
   calcHP = PFUtils.getAvgHP(hparray.hdice1, hparray.hdie1) + tempmisc+ (abilityMod *hparray.hdice1);
   if (calcHP && calcHP !== newHP) {
     //wtf?
     TAS.warn("parseNPChp, hp not adding right, should be:" + newHP + " but getNPCHP returns " + calcHP,hparray);
     hparray.misc += (newHP - calcHP);
   }

   //check:
   //basehp=newHP-abilityMod
   return hparray;
 },
 /** parseNPCAC - parses AC string from statblock
 * @param {string} acstring - format: "24, Touch 24, Flat-footed 16 (+6 Deflection, +7 Dex, +1 Dodge, +1 Armor, +1 Shield, +1 Size, +6 Natural) some note can go here"
 * can start with "AC " or not.
 * if it doesn't add up then the bonus will be added to misc.
 * (others include: Luck, Sacred/Profane, Circumstance, Enhancement, Insight, Morale) - these ALL go to CMD too (and dodge, deflection).
 * @param {string} cmdStr string for cmd , just checks for a number in the string
 * @param {int} abilityMod - to apply, usually dex.
 * @param {int} sizeMod - ac mod due to size.
 * @returns {ac:10,touch:10,ff:10,armor:0,shield:0,deflect:0,dex:0,dodge:0,natural:0,misc:0,note:,size:0,acbuff:0,altability:""}
 */
 parseNPCAC = function (acstring, cmdStr, abilityMod, sizeMod) {
   var matches,
   tempnum = 0,
   tempstr='',
   acMap = {
     ac: 10,
     touch: 10,
     ff: 10,
     armor: 0,
     shield: 0,
     deflect: 0,
     dex: 0,
     dodge: 0,
     natural: 0,
     misc: 0,
     note: "",
     size: 0,
     altability: "",
     acbuff: 0,
     uncanny: 0 ,
     cmd: 10,
     notes:''
   };
   abilityMod = abilityMod || 0;
   sizeMod = sizeMod || 0;
   //TAS.debug"parseNPCAC: string:" + acstring + ", ability:" + abilityMod + ", size:" + sizeMod);
   try {
     if ((/^ac\s/i).test(acstring)){
       acstring = acstring.slice(3);
     }
     acMap.ac = parseInt(acstring,10)||0;
     if ((/[\-\+]{0,1}\d+/).test(cmdStr)){
       matches=cmdStr.match(/[\-\+]{0,1}\d+/);
       acMap.cmd = parseInt(matches,10)||0;
       tempstr=cmdStr.slice(matches.index+matches[0].length);
       if(tempstr){
         acMap.notes=tempstr;
       }
     }
     //get other AC totals
     matches = acstring.match(/Touch\s*?(\d+)/i);
     if (matches && matches[1]) {
       acMap.touch = parseInt(matches[1], 10);
     }
     matches = acstring.match(/Flat\-footed\s*?(\d+)/i);
     if (matches && matches[1]) {
       acMap.ff = parseInt(matches[1], 10);
     }
     //get modifiers compendium has all negatives as "1" intead of "-1"
     matches = acstring.match(/([+\-]??\d+)\s*?Deflect[,\i\s]/i);
     if (matches && matches[1]) {
       acMap.deflect = parseInt(matches[1], 10);
     }
     matches = acstring.match(/([+\-]??\d+)\s*?Nat[,u\s]/i);
     if (matches && matches[1]) {
       acMap.natural = parseInt(matches[1], 10);
     }
     matches = acstring.match(/([+\-]??\d+)\s*?Dodge/i);
     if (matches && matches[1]) {
       acMap.dodge = parseInt(matches[1], 10);
     }
     matches = acstring.match(/([+\-]??\d+)\s*?Size/i);
     if (matches && matches[1]) {
       acMap.size = parseInt(matches[1], 10);
     }
     //compendium size wrong: missing minus sign.
     // see Marilith
     if (acMap.size !== sizeMod) {
       acMap.size = sizeMod;
     }
     matches = acstring.match(/([+\-]??\d+)\s*?armor/i);
     if (matches && matches[1]) {
       acMap.armor = parseInt(matches[1], 10);
     }
     matches = acstring.match(/([+\-]??\d+)\s*?shield/i);
     if (matches && matches[1]) {
       acMap.shield = parseInt(matches[1], 10);
     }
     matches = acstring.match(/\)\s*?(.*)/);
     if (matches && matches[1]) {
       acMap.note = matches[1];
     }
     //get ability modifier, should be Dex by default.
     matches = acstring.match(/([+\-]??\d+)\s*?Dex/i);
     if (matches && matches[1]) {
       acMap.dex = parseInt(matches[1],10)||0;
       //if different then set, compendium error no minus
       // see Fire Giant.
       if (abilityMod !== acMap.dex) {
         acMap.dex = abilityMod;
       }
     } else {
       matches = acstring.match(/([+\-]??\d+)\s*?(Wis|Int|Str|Con|Cha)/i);
       if (matches && matches[1] && matches[2]) {
         acMap.dex = parseInt(matches[1], 10) || 0;
         //should not happen anymore since 6th printing of PRD they removed abilities that change ability to AC, now
         // just add dodge instead.
         acMap.altability = matches[2].toUppercase();
       }
     }
     //check total for any other (untyped, Luck, Sacred/Profane, Circumstance, Enhancement, Insight, Morale)
     //touch - if touch does not add up put difference in misc. (AC not match we'll put in a buff row)
     // we need to track a seperate ac misc buff/penalty. we can put it in buffs.
     tempnum = acMap.dodge + acMap.dex + acMap.deflect + acMap.size + 10;
     if (acMap.touch !== tempnum) {
       acMap.misc = (acMap.touch - tempnum);
     }
     //if AC does not add up, even including misc found above, then put it in ac buff row.
     tempnum = acMap.armor + acMap.shield + acMap.dodge + acMap.dex + acMap.natural + acMap.deflect + acMap.size + acMap.misc + 10;
     if (acMap.ac !== tempnum) {
       acMap.acbuff = (acMap.ac - tempnum);
     }
     //check for not caught flat footed
     if (acMap.ac === acMap.ff && (acMap.dex > 0 || acMap.dodge > 0)) {
       acMap.uncanny = 1;
     }
   } catch (err){
     TAS.error("parseNPCAC",err);
   } finally {
     return acMap;
   }
 },
 /* parseSpeed -returns object with speeds {land:base,fly:xx,swim:xx} etc*/
 parseSpeed = function (speedstr) {
   var speeds = speedstr.split(/,\s*/),
   retobj;
   retobj = _.reduce(speeds, function (memo, speedComponent, idx) {
     var matches,
     speedNum = 0;
     try {
       if (idx === 0) {
         speedNum = parseInt(speedComponent.match(/(\d+)/)[1], 10) || 0;
         if (speedNum) {
           memo["land"] = speedNum;
         }
       } else {
         matches = speedComponent.match(/([\w]+)\s*(\d+)/);
         if (matches) {
           speedNum = parseInt(matches[2], 10) || 0;
           if (speedNum) {
             memo[matches[1].toLowerCase()] = speedNum;
             if (/fly/i.test(matches[1])) {
               matches = speedComponent.match(/\(([\w]+)\)/);
               if (matches && matches[1].length > 0) {
                 memo["flyability"] = matches[1];
               }
             }
           }
         }
       }
     } catch (err) {
       TAS.error("parseSped", err);
     } finally {
       return memo;
     }
   }, {});
   return retobj;
 },
 /* getAtkNameFromStr get names of an attack or special attack
 * { Name :(full str up to first parens) , abilityName (without pluses the base ability ), basename (ability name lower case no spces)}
 * for instance: Mwk Longsword +6/+1 would be : {name:Mwk longsword +6/+1, abilityName:Longsword, basename: longsword}
 */
 getAtkNameFromStr = function (abilitystr) {
   var matches = abilitystr.match(/^\s*([^\(]+)/),
   name = '',
   abilityName = '',
   basename = '';
   if (matches && matches[1]) {
     name = (matches[1]);
     name = SWUtils.trimBoth(name);
     abilityName = name.replace(/\d+d\d+|\-\d+|\+|\d+|\//g, '');
     abilityName = SWUtils.trimBoth(abilityName);
     abilityName = abilityName[0].toUpperCase() + abilityName.slice(1);
     basename = abilityName.toLowerCase();
     basename = basename.replace(/ray|cone|aura|mwk/ig, '');
     basename = basename.replace(/\s+/g, '');
   }
   return {
     'name': name,
     'basename': basename,
     'abilityName': abilityName
   };
 },
 /*parseReach - parses reach string from compendium or statblock
 * returns the default reach, rest of the string (if any), and an array of exceptions and reaches if any.
 *  (for instance, diplodacus
 * @returns = {reach:number (5,10,15 etc), reachNotes:"rest of string", reachExceptions:[['Bite':10],['Claw':5]]}
 */
 parseReach = function (reachStr) {
   var numerator = 0,
   denominator = 1,
   tempInt = 0,
   tempFloat = 0.0,
   tempstr,
   restOf = "",
   matches,
   exceptionstr = "",
   tempArray = [],
   reachExceptions = [],
   retobj = {
     reach: 5,
     reachNotes: "",
     reachExceptions: []
   };
   if (!reachStr) {
     return null;
   }
   reachStr = reachStr.replace(/^\s+|\s+$/g, '');
   if (reachStr.slice(0, 5) === "2-1/2" || reachStr.slice(0, 4) === "21/2") {
     retobj.reach = 2.5;
     exceptionstr = reachStr.slice(5);
   } else {
     matches = reachStr.match(/^\s*(\d*\.?\d*)?\s*(.*)\s*$/);
     if (matches) {
       tempFloat = parseFloat(matches[1]);
       restOf = matches[2];
       if (!/\(|;/.test(reachStr) && /with/i.test(reachStr)) {
         retobj.reach = 5;
         exceptionstr = reachStr;
       } else {
         retobj.reach = tempFloat;
       }
       if (restOf && restOf.length > 0) {
         exceptionstr = restOf;
       }
     } else {
       exceptionstr = reachStr;
     }
   }
   if (exceptionstr) {
     exceptionstr = exceptionstr.replace('(', '').replace(')', '').replace(';', '').replace(/ft\./ig, '').replace(/ft/ig, '').replace(/^\s+|\s+$/g, '');
   }
   if (exceptionstr) {
     retobj.reachNotes = exceptionstr;
     tempstr = exceptionstr.toLowerCase().replace(/with\s/ig, '');
     tempArray = tempstr.split(/,\s*/);
     reachExceptions = _.reduce(tempArray, function (memo, exceptioninstance) {
       var reachExceptions = [],
       matches;
       if (!exceptioninstance) {
         return memo;
       }
       //not necessary since changed split(',') to split(/,\s*/)
       //exceptioninstance = exceptioninstance.replace(/^\s+|\s+$/g, '');
       if (exceptioninstance.slice(0, 5) === "2-1/2" || exceptioninstance.slice(0, 4) === "21/2") {
         tempstr = exceptioninstance.slice(5);
         if (tempstr) {
           reachExceptions.push(tempstr.replace(/^\s+|\s+$/g, ''));
           reachExceptions.push(2.5);
           memo.push(reachExceptions);
         }
       } else {
         matches = exceptioninstance.match(/(\d+)\s*(.*)/);
         if (matches) {
           reachExceptions.push(matches[2].replace(/^\s+|\s+$/g, ''));
           reachExceptions.push(matches[1]);
           memo.push(reachExceptions);
         }
       }
       return memo;
     }, []);
     if (reachExceptions && reachExceptions.length > 0) {
       retobj.reachExceptions = reachExceptions;
     }
   }
   return retobj;
 },
 getCreatureClassSkills = function (creatureType) {
   var typeToCheck = creatureType.toLowerCase().replace(/\s/g, ''),
   classSkills,
   subSkills;
   try {
     subSkills = _.find(PFDB.creatureTypeClassSkills, function (skills, mainType) {
       var reg = new RegExp(mainType);
       return reg.test(typeToCheck);
     });
     if (subSkills && subSkills.length > 0) {
       classSkills = subSkills;
     }
     subSkills = _.find(PFDB.creatureSubtypeClassSkills, function (skills, mainType) {
       var reg = new RegExp(mainType);
       return reg.test(typeToCheck);
     });
     if (subSkills) {
       if (classSkills) {
         classSkills = classSkills.concat(subSkills);
       } else {
         classSkills = subSkills;
       }
     }
   } catch (err) {
     TAS.error("parseCreatureClassSkills", err);
   } finally {
     if (classSkills) {
       return classSkills;
     }
     return [];
   }
 },
 /*assignPrimarySecondary
 * to each attack in array, assigns attack.naturaltype='primary|secondary' and sometimes attack.dmgMult=1.5
 * returns attacks for chaining.
 */
 assignPrimarySecondary = function (attacks) {
   var attackGroups,
   attacksToCheck = _.filter(attacks, function (attack) {
     return (attack.type === 'natural');
   });
   if (_.size(attacksToCheck) <= 0) {
     return attacks;
   }
   if (_.size(attacksToCheck) === 1) {
     attacksToCheck[0].naturaltype = 'primary';
     if((attacksToCheck[0].iter && attacksToCheck[0].iter.length ===1) || isNaN(parseInt(attacksToCheck[0].iter,10))){
       attacksToCheck[0].dmgMult = 1.5;
     }
   } else {
     attackGroups = _.groupBy(attacksToCheck, function (attack) {
       return PFDB.primaryNaturalAttacksRegExp.exec(attack.name);
     });
     if (_.size(attackGroups) === 1) {
       _.each(attacksToCheck, function (attack) {
         attack.naturaltype = 'primary';
       });
     } else {
       _.each(attacksToCheck, function (attack) {
         if (PFDB.primaryNaturalAttacksRegExp.test(attack.name)) {
           attack.naturaltype = 'primary';
         } else {
           attack.naturaltype = 'secondary';
         }
       });
     }
   }
   return attacks;
 },
 /*buildImportantFeatObj - saves feats that require updates to the sheet in an object, no spaces and all lowercase.
 * returns sub objects for feats that only apply to certain attacks, and a criticaldamage subobject.
 * for instance:::  obj.weaponfinesse=1 obj.criticaldamage.bleedingcritical:1 obj.longsword.weaponfocus:1
 * @returns object of feats   as  {featname:1,feat2name:1, attacks:{attack1name:{featname:1}}, criticaldamage:{featname:1}}
 */
 buildImportantFeatObj = function (featlist) {
   return _.chain(featlist)
   .filter( function(feat){if (!feat) {return false;} return true;})
   .filter( function (feat) {
     return PFDB.importantFeatRegExp.test(feat);
   })
   .map(function(feat){

     TAS.debug("checking <" + feat + "> for ending letter");
     //if there is an "endnote" letter indicator at the end then remove it
     feat = SWUtils.trimBoth(feat);
     if ((/\b[A-Z]$/i).test(feat)) {
       feat = feat.slice(0,-2);
       feat=SWUtils.trimBoth(feat);
     }
     return feat;
   })
   .reduce(function (memo, feat) {
     var origfeat = feat,
     atktype = "",
     matches,
     attacks = {},
     attack = {},
     crits = {},
     skills = {},
     skill = "";
     try {
       if (feat.indexOf('(') >= 0) {
         matches = /(.*?)\((.*)\)/.exec(feat);
         feat = matches[1];
         atktype = matches[2];
         feat = SWUtils.trimBoth(feat);
         atktype = SWUtils.trimBoth(atktype);
       }
       feat = feat.replace(/\s/g, '').toLowerCase();
       if (feat === 'improvedcritical' || feat === 'criticalmastery') {
         return memo;
       }
       if (feat.indexOf('critical') > 0) {
         atktype = feat;
         feat = "criticaldamage";
       } else if (feat.indexOf('skillfocus') >= 0) {
         skill = atktype.replace(' ', '-');
         skill = skill[0].toUpperCase() + skill.slice(1);
       }
       memo[feat] = 1;
       switch (feat) {
         case 'weaponfinesse':
         case 'improvedcritical':
           if (memo.attacks) {
             attacks = memo.attacks;
           }
           if (attacks[atktype]) {
             attack = attacks[atktype];
           }
           attack[feat] = 1;
           attacks[atktype] = attack;
           memo.attacks = attacks;
           break;
         case 'criticaldamage':
           if (memo.criticaldamage) {
             crits = memo.criticaldamage;
           }
           crits[atktype] = 1; //or put sickening?
           memo.criticaldamage = crits;
           break;
         case 'skillfocus':
           if (memo.skillfocuses) {
             skills = memo.skillfocuses;
           }
           if (skill) {
             skills[skill] = 1;
             memo.skillfocuses = skills;
           }
           break;
       }
     } catch (err) {
       TAS.error("buildImportantFeatObj error:", err);
       memo[feat] = 1;
     } finally {
       return memo;
     }
   }, {}).value();
 },
 /* parseAttacks -parse atttack string one at a time, returns arrays grouped by full attacks
 * the name of the attack starts with Group 0, Group 1, etc.
 * @atktypestr "melee" or "ranged"
 * @returns array of {enh:0,mwk:0,name:"",atktype:"melee",type:"",countFullBAB:1,plus:"",plusamount:"",plustype:"",note:"",iter:[],dmgdice:0,dmgdie:0,crit:20,critmult:2,dmgbonus:0}
 */
 parseAttack = function (atkstr, atktypestr, addgroups, groupidx, isUndead) {
   var matches, currpos = 0, name = "", iteratives, i = 0, tempInt = 0,
     beforeBetweenAfterParens, bonus = "", origStr = atkstr, countspaces = 0,
     abilityBaseName = '', tempstr = "", tempidx = 0, names, attackdescs,
   retobj = {
     enh: 0,
     mwk: 0,
     name: "",
     basename: "",
     atktype: "melee",
     type: "",
     range: "",
     countFullBAB: 1,
     iter: [],
     dmgdice: 0,
     dmgdie: 0,
     dmgtype: "",
     crit: 20,
     critmult: 2,
     dmgbonus: 0,
     plus: "",
     plusamount: "",
     plustype: "",
     note: ""
   };
   try {
     //TAS.debug"parseAttack: "+atkstr);
     if (addgroups) {
       //retobj.name += "Group " + groupidx + ": ";
       retobj.group = 'Full attack ' + groupidx;
     }
     names = getAtkNameFromStr(atkstr);
     retobj.name += names.name;
     retobj.basename = names.basename;
     atkstr = SWUtils.trimBoth(atkstr);
     //if stars with #, it means number of attacks
     matches = atkstr.match(/^(\d+)\s*/);
     if (matches && matches[1]) {
       retobj.countFullBAB = parseInt(matches[1], 10) || 1;
       atkstr = atkstr.slice(matches[0].length);
       //retobj.name += (matches[1] + " ");
     }
     //starts with +number(enh) or mwk
     matches = atkstr.match(/^([+\-]\d+)\s*|^(mwk)\s*/i);
     if (matches) {
       //starts with +n, is weapon
       //retobj.name += matches[0];
       if (matches[1]) {
         retobj.enh = parseInt(matches[1], 10) || 0;
       } else if (matches[2] && (/mwk/i).test(matches[2])) {
         retobj.mwk = 1;
       }
       retobj.type = "weapon";
       atkstr = atkstr.slice(matches[0].length);
     }
     //TAS.debug("############################","PFNPCParser.parseAttacks the regex is: "+PFDB.combatManeuversRegExp);
     if (atktypestr === 'melee' && PFDB.combatManeuversRegExp.test(retobj.basename)) {
       retobj.atktype = 'cmb';
       retobj.vs = 'cmd';
     } else if (PFDB.cmbMonsterSrch.test(retobj.basename)) {
       retobj.atktype = 'cmb';
       retobj.type = 'natural';
       retobj.vs = 'cmd';
     } else if ((/web/i).test(retobj.basename)) {
       retobj.atktype = 'ranged';
       retobj.type = 'special';
       retobj.vs = 'touch';
       retobj.range = 10;
     } else if ((/touch/i).test(retobj.basename)) {
       if ((/ranged/i).test(retobj.basename)) {
         retobj.atktype = 'ranged';
       } else {
         retobj.atktype = 'melee';
       }
       retobj.vs = 'touch';
     } else if ((/special/i).test(atktypestr)) {
       retobj.atktype = 'special';
       retobj.type = 'special';
     } else {
       retobj.atktype = atktypestr;
     }
     if (!retobj.type) {
       if (PFDB.naturalAttackRegExp.test(retobj.basename)) {
         retobj.type = "natural";
       } else if (PFDB.unarmedAttacksRegExp.test(name)) {
         retobj.type = "unarmed";
       } else {
         retobj.type = "weapon";
       }
     }
     if (!retobj.vs) {
       if ((/touch|web/i).test(retobj.name)) {
         retobj.vs = 'touch';
         if ((/ranged|web/i).test(retobj.name)) {
           retobj.atktype = 'ranged';
           if ((/web/i).test(retobj.basename)) {
             retobj.range = 10;
           }
         }
       }
     }
     //skip past name
     //if the attack value is -n, then it may skip past the- and go to n
     // for compendium treated as -n, for statblock results in +n
     matches = atkstr.match(/\s*([^0-9+\/\+\(]+)/);
     if (matches && matches[0]) {
       if (matches.index) {
         tempidx = matches.index;
       }
       atkstr = atkstr.slice(tempidx + matches[0].length);
     }
     if (atkstr) {
       //after name split rest by parenthesis
       // format: name   attack bonus ( damage ) plus additional
       beforeBetweenAfterParens = atkstr.split(/\(|\)/);
       //attack amounts before paren
       iteratives = beforeBetweenAfterParens[0].split(/\//);
       if ((/\d/).test(iteratives[0])) {
         retobj.iter = _.map(iteratives, function (iter, index) {
           if (/^[+\-]/.test(iter)) {
             return parseInt(iter, 10) || 0;
           }
           //minus missing assume minus
           return -1 * (parseInt(iter, 10) || 0);
         });
       } else if (retobj.atktype === 'cmb') {
         retobj.iter[0] = 0;
       }
       //damage between parens
       if (beforeBetweenAfterParens[1]) {
         attackdescs = beforeBetweenAfterParens[1].split(/,\s*/);
         //split on commas and strip out non damage, put damage in tempstr
         tempstr = _.reduce(attackdescs, function (memo, subattack) {
           if ((/ft\./i).test(subattack)) {
             retobj.range = subattack;
           } else if (/D[Cc]\s\d+/.test(subattack)) {
             matches = subattack.match(/(D[Cc]\s\d+)/);
             retobj.DC = matches[1].toUpperCase();
             retobj.DCability= PFDB.specialAttackDCAbilityBase[retobj.basename]||'CON';
             if (isUndead && retobj.DCability === 'CON'){
               retobj.DCability='CHA';
             }
             retobj.dcequation = PFUtils.getDCString(retobj.DCability, 'npc-hd-num', isUndead);
           } else if ((/freq|day|constant|at.will/i).test(subattack)) {
             retobj.frequency = subattack;
           } else if ((/AC|hp/).test(subattack) || !(/\d|plus/).test(subattack)) {
             //if no number or 'plus' don't know what to do so stick it in note.
             retobj.note += subattack + ', ';
           } else {
             memo += subattack + ' ';
           }
           return memo;
         }, "");
         //TAS.debug"now left with :"+tempstr);
         // find damage
         //damage dice and die
         matches = tempstr.match(/^(\d+)d(\d+)\s*/i);
         if (matches && matches[1]) {
           retobj.dmgdice = parseInt(matches[1], 10) || 0;
           tempInt = parseInt(matches[2], 10) || 0;
           //compendium bug no minus:
           if ( (tempInt!==3 && tempInt % 2) || tempInt > 12) {
             retobj.dmgdie = Math.floor(tempInt / 10);
             retobj.dmgbonus = -1 * (tempInt % 10);
           } else {
             retobj.dmgdie = tempInt;
           }
           bonus = tempstr.slice(matches[0].length);
         } else {
           //flat damage
           matches = tempstr.match(/^([+\-]??\d+)\s*/);
           if (matches) {
             //flat number
             retobj.dmgbonus = parseInt(matches[1], 10) || 0;
             bonus = beforeBetweenAfterParens[1].slice(matches[1].length);
           }
         }
         //any text after damage is 'plus' or damage type
         if (bonus) {
           //look for plus
           matches = bonus.match(/plus(.*)/i);
           if (matches) {
             tempstr = matches[1].replace(/^\s+|\s+$/g, '');
             bonus = bonus.slice(0, matches.index).replace(/^\s+|\s+$/g, '');
             if (/\d+d\d+/i.test(tempstr)) {
               matches = tempstr.match(/(\d+d\d+)\s*([\w\s]*)/);
               retobj.plusamount = matches[1];
               if (matches[2]) {
                 retobj.plustype = matches[2].replace(/^\s+|\s+$/g, '');
               }
             } else {
               retobj.plus = tempstr;
             }
           }
           bonus = bonus.replace(/^\s+|\s+$/g, '');
           matches = bonus.match(/\s|\//g);
           if (matches) {
             countspaces = matches.length - 1;
           }
           if (retobj.dmgbonus === 0) {
             matches = bonus.match(/\s|\//g);
             if (matches) {
               countspaces = matches.length - 1;
             }
             matches = bonus.match(/(x\d+)|(\/\d+\-??20)|([+\-]??\d+)/ig);
             _.each(matches, function (match, index) {
               bonus = bonus.slice(match.length);
               if (/^[+\-]/.test(match)) {
                 retobj.dmgbonus = (parseInt(match, 10) || 0);
               } else if (/^[x\u00d7]\d+/.test(match)) {
                 match = match.slice(1);
                 retobj.critmult = parseInt(match, 10) || 2;
               } else if (/^\d+/.test(match)) {
                 //minus missing
                 retobj.dmgbonus = ((-1) * (parseInt(match, 10) || 0));
               } else if (match.indexOf('20') >= 0) {
                 match = match.replace('20', '').replace('-', '').replace('/', '');
                 if (match && match.length > 0) {
                   retobj.crit = parseInt(match, 10) || 20;
                 }
               }
             });
           }
           bonus = bonus.slice(countspaces);
           if (bonus && bonus.length > 0) {
             retobj.dmgtype += bonus;
           }
         }
         if (retobj.atktype !== 'cmb' && !retobj.iter[0] && retobj.dmgtype && retobj.dmgdice && retobj.dmgdie && !retobj.plusamount && !retobj.plustype && (!(/bludg|slash|pierc/i).test(retobj.dmgtype))) {
           retobj.plustype = retobj.dmgtype;
           tempstr = String(retobj.dmgdice) + "d" + String(retobj.dmgdie);
           if (retobj.dmgbonus) {
             if (retobj.dmgbonus > 0) {
               tempstr += "+" + retobj.dmgbonus;
             } else {
               tempstr += "-" + Math.abs(retobj.dmgbonus);
             }
           }
           retobj.plusamount = tempstr;
           retobj.dmgtype = "";
           retobj.dmgdice = 0;
           retobj.dmgdie = 0;
         }
       }
       //any notes at end
       i = 2;
       while (i < beforeBetweenAfterParens.length) {
         //can use filter then reduce, or use each, or use easy for loop.
         retobj.note += beforeBetweenAfterParens[i].replace(/^\s+|\s+$/g, '');
         i++;
       }
     }
     if (retobj.note) {
       retobj.note = retobj.note.replace(/^\s+|\s+$/g, '');
     }
   } catch (err) {
     TAS.error("parseAttack: error parsing:" + atkstr, err);
     if (retobj.name) {
       retobj.name += " ";
     }
     retobj.name += "Could not parse attack!";
     retobj.note = origStr + " , error: ";
     retobj.note += err;
   } finally {
     return retobj;
   }
 },
 parseAttacks = function (atkstr, atktypestr, cmbval) {
   var atkarrayout,
   atkarraysub,
   attacksouter,
   addgroups = false;
   atkarrayout = atkstr.split(/\sor\s/i);
   if (atkarrayout.length > 1) {
     addgroups = true;
   }
   attacksouter = _.reduce(atkarrayout, function (memoout, atkstrout, groupidx) {
     var atkarray = atkstrout.split(/,\s*(?![^\(\)]*\))/),
     attacks;
     if (atkarray.length > 1) {
       addgroups = true;
     }
     TAS.debug('parseattacks outer group: ' + groupidx);
     attacks = _.reduce(atkarray, function (memo, atkstr) {
       var retobj;
       TAS.debug('parseattacks: ' + atkstr);
       retobj = parseAttack(atkstr, atktypestr, addgroups, groupidx, cmbval);
       if (retobj) {
         memo.push(retobj);
       }
       return memo;
     }, []);
     return memoout.concat(attacks);
   }, []);
   return attacksouter;
 },
 parseFeats = function (featstring) {
   var feats=[];
   if (!featstring) {return [];}
   feats = featstring.match(/((?:[^(),]|\([^()]*\))+)/g);
   feats = SWUtils.trimBoth(feats);
   return feats;
 },
 parseSkillRacialBonuses = function (racialstr) {
   //abilitymods = modify default ability score for a skill
   var abilitieslower = _.map(PFAbilityScores.abilities, function (ab) {
     return ab.toLowerCase();
   }),
   allCoreSkillsLower = _.map(PFSkills.allCoreSkills, function (skill) {
     return skill.toLowerCase();
   }),
   skillsWithSubSkillsLower = _.map(PFSkills.skillsWithSubSkills, function (skill) {
     return skill.toLowerCase();
   }),
   skillsWithSpaces = PFSkills.skillsWithSpaces,
   temparray,
   modifiers = [],
   abilitymodstr = "",
   abilitymodlower = "",
   ability = "",
   setability = false,
   tempskill = "",
   matches,
   skillmods = {},
   skillnotes = [],
   abilitymods = {},
   retobj = {
     "skillmods": skillmods,
     "skillnotes": skillnotes,
     "abilitymods": abilitymods
   };
   if (!racialstr) {
     return retobj;
   }
   temparray = racialstr.split(';');
   if (temparray.length > 1) {
     racialstr = temparray[0];
     abilitymodstr = temparray[1];
   }
   if (abilitymodstr) {
     try {
       abilitymodlower = abilitymodstr.toLowerCase();
       ability = _.find(abilitieslower, function (ab) {
         return abilitymodlower.indexOf(ab) >= 0;
       });
       if (ability) {
         tempskill = _.find(allCoreSkillsLower, function (skill) {
           return abilitymodlower.indexOf(skill) >= 0;
         });
         if (tempskill) {
           abilitymods[tempskill[0].toUpperCase() + tempskill.slice(1)] = ability.toLowerCase();
           setability = true;
         }
       }
     } catch (err1) {
       TAS.error("parseSkillRacialBonuses inner", err1);
     }
     if (!setability) {
       skillnotes.push(abilitymodstr);
     }
   }
   modifiers = racialstr.split(/,\s*/);
   _.each(modifiers, function (modstr) {
     var modstrlower = modstr.toLowerCase(),
     mod = 0,
     moddedTitle,
     modded = "",
     tempstr = "",
     exceptionstr = "",
     conditionmod = 0,
     conditionstr = "",
     hasSubSkill = false,
     matches;
     try {
       matches = modstr.match(/\s*([+\-]\d+)\s*(?:on|to)?\s*([\w]+)\s*([\w\s]+)?\s*(\([^)]*\))?/);
       if (!matches) {
         //is an exception or note
         tempskill = _.find(allCoreSkillsLower, function (skill) {
           return modstrlower.indexOf(skill) >= 0;
         });
         if (tempskill) {
           ability = _.find(abilitieslower, function (ab) {
             return modstrlower.indexOf(ab) >= 0;
           });
           if (ability) {
             abilitymods[tempskill.toLowerCase()] = ability;
           } else {
             skillnotes.push(modstr);
           }
         } else {
           skillnotes.push(modstr);
         }
         return;
       }
       exceptionstr = matches[3];
       mod = parseInt(matches[1], 10) || 0;
       modded = matches[2];
       if (!_.contains(allCoreSkillsLower, modded.toLowerCase())) {
         TAS.warn("does not match " + modded);
         // +8 Sleight of Hand
         tempskill = _.find(skillsWithSpaces, function (skill) {
           return modstrlower.indexOf(skill) >= 0;
         });
         if (!tempskill || tempskill.length < 1) {
           //not sure what this is
           skillnotes.push(modstr);
           return;
         }
         temparray = tempskill.split(/\s/);
         temparray = _.map(temparray, function (part) {
           if (part === "of") {
             return "of";
           }
           return part[0].toUpperCase() + part.slice(1);
         });
         modded = temparray.join('-');
         exceptionstr = exceptionstr.slice(tempskill.length - tempskill.indexOf(' ') + 1);
       }
       if (exceptionstr) {
         //entire thing is a "when" exception
         skillnotes.push(modstr);
         return;
       }
       moddedTitle = modded[0].toUpperCase() + modded.slice(1);
       if (!matches[4]) {
         skillmods[moddedTitle] = mod;
         return;
       }
       //if craft, knowledge, etc
       exceptionstr = matches[4].replace(/^\s+|\(|\)|\s+$/g, '');
       if (_.contains(skillsWithSubSkillsLower, modded.toLowerCase())) {
         exceptionstr = exceptionstr[0].toUpperCase() + exceptionstr.slice(1);
         if (modded.toLowerCase() === "knowledge") {
           moddedTitle += "-" + exceptionstr;
         } else {
           moddedTitle += "[" + exceptionstr + "]";
         }
         skillmods[moddedTitle] = mod;
       } else {
         //has bonus
         matches = exceptionstr.match(/([+\-]\d+)\s(.*)$/);
         if (matches && matches[1]) {
           conditionmod = parseInt(matches[1], 10) || 0;
           if (matches[2]) {
             conditionstr = matches[2];
           }
           conditionmod = conditionmod - mod;
           skillmods[moddedTitle] = mod;
           tempstr = ((conditionmod > 0) ? "+" : "") + conditionmod + " " + moddedTitle + " " + conditionstr;
           skillnotes.push(tempstr);
         } else {
           skillnotes.push(modstr);
         }
       }
     } catch (err) {
       TAS.error("parseSkillRacialBonuses outer error", err);
       skillnotes.push(modstr);
     }
   });
   return retobj;
 },
 parseSkills = function (skillstr) {
   var rawSkills = skillstr.match(/[\w][\w\s]+\s*(?:\([\w\s,]+\))?\s*[+\-]\d+[,]??/g),
   skills = _.reduce(rawSkills, function (memo, skill) {
     var matches = skill.match(/^([\w][\w\s]+[\w])\s*(\([\w\s,]+\))??([+\s]+\d+)$/),
     tempskill = "",
     tempval = 0,
     tempskill2 = "",
     subskills;
     if (matches) {
       tempval = parseInt(matches[3], 10) || 0;
       tempskill = matches[1].replace(/^\s+|\s+$/g, '');
       tempskill = tempskill[0].toUpperCase() + tempskill.slice(1);
       tempskill = tempskill.replace(/\s/g, '-');
       if (matches[2]) {
         subskills = matches[2].split(/,\s*/);
         _.each(subskills, function (subskill) {
           subskill = subskill.replace(/^\s+|,|\(|\)|\s+$/g, '');
           subskill = subskill[0].toUpperCase() + subskill.slice(1);
           if (tempskill === "Knowledge") {
             subskill = "-" + subskill;
           } else {
             subskill = "[" + subskill + "]";
           }
           memo[tempskill + subskill] = tempval;
         });
       } else {
         memo[tempskill] = tempval;
       }
     }
     return memo;
   }, {});
   return skills || {};
 },
 parseAbilityScores = function (v) {
   var aS = {};
   aS.str = getAbilityAndMod(v["str_compendium"]);
   aS.dex = getAbilityAndMod(v["dex_compendium"]);
   aS.con = getAbilityAndMod(v["con_compendium"]);
   aS.wis = getAbilityAndMod(v["wis_compendium"]);
   aS['int'] = getAbilityAndMod(v["int_compendium"]);
   aS.cha = getAbilityAndMod(v["cha_compendium"]);
   return aS;
 },
 parseSpecialAttack = function (setter,sastr) {
   var origsastr, names, tempstr, tempstr2, match, matches, parensplit,
   atktyp = 'special',baseability="",
   abilitytype="",
   isAttack = false,
   retobj = {};
   try {
     origsastr = sastr;
     names = getAtkNameFromStr(sastr);
     if (sastr.indexOf('(') >= 0) {
       if (PFDB.spAttackAttacksPreProcess.test(names.basename)) {
         //preprocess
         if ((/rake/i).test(names.basename)) {
           sastr = PFUtils.removeUptoFirstComma(sastr, true);
         } else if ((/rend/i).test(names.basename)) {
           sastr = PFUtils.removeUptoFirstComma(sastr);
         } else if ((/web/i).test(names.basename)) {
           sastr = PFUtils.removeUptoFirstComma(sastr, true);
           sastr = 'web ' + sastr;
           atktyp = 'ranged';
         }
         isAttack = true;
       } else if (PFDB.spAttackAttacks.test(names.basename)) {
         isAttack = true;
       }
     } else if ((/damage|drain|dmg/i).test(names.basename) && !(/blood|energy/i).test(names.basename) && PFDB.abilitySrch.test(names.basename)) {
       match = names.basename.match(/damage|drain/i);
       names.AbilityName = 'Ability ' + match[0];
       sastr = names.AbilityName + ' (' + sastr + ')';
       isAttack = true;
     }

     if (isAttack) {
       retobj = parseAttack(sastr, atktyp, false, 0);
       retobj.specialtype = 'attack';
       retobj.group = 'Special';
       retobj.name = (names.AbilityName && names.AbilityName.slice(0,7)==='Ability')?names.AbilityName:names.name;
       retobj.basename = names.basename;
     }
     if (!isAttack) {
       retobj.name = names.abilityName || names.name;
       retobj.basename = names.basename;
       retobj.specialtype = 'ability';
       retobj.rule_category="special-attacks";
       matches= (/usable\severy/i).exec(origsastr);
       if (matches){
         retobj.frequency='everyrounds';
         tempstr = origsastr.slice(matches.index+matches[0].length);
         tempstr2= PFUtils.getDiceDieString(tempstr);
         if (tempstr2){
           retobj.used=tempstr2;
           matches= tempstr.match(/rounds|days|minutes/i);
           if (matches){
             retobj.used += " "+ matches[0];
           }
         }
       }
       if(PFDB.specialAttackDCAbilityBase[retobj.basename]){
         retobj.DCability= PFDB.specialAttackDCAbilityBase[retobj.basename];
         if (parseInt(setter['is_undead'],10)===1 && retobj.DCability === 'CON'){
           retobj.DCability='CHA';
         }
       }
       retobj.shortdesc = PFUtils.replaceDCString(PFUtils.replaceDiceDieString(origsastr),
             retobj.DCability, 'npc-hd-num', setter.is_undead);
     }
     abilitytype=PFUtils.getSpecialAbilityTypeFromString(sastr);
     if (abilitytype) {
       retobj.ability_type=abilitytype;
     }
   } catch (err) {
     TAS.error("parseSpecialAttack", err);
   } finally {
     return retobj;
   }
 },
 parseSpecialAttacks = function (setter,saString,cmb) {
   var retarray ;
   if (!saString) {
     return {};
   }
   retarray = saString.split(/,\s*(?![^\(\)]*\))/);
   return _.reduce(retarray, function (memo, sa) {
     var retobj,
     tempstr,
     names;
     try {
       retobj = parseSpecialAttack(setter,sa);
     } catch (err) {
       TAS.error("parseSpecialAttacks", err);
       retobj = {};
       retobj.name = sa;
       retobj.specialtype = 'ability';
       retobj.rule_category="special-attacks";
     } finally {
       memo.push(retobj);
       return memo;
     }
   }, []);
 },
 parseSpecialAbilities = function (str) {
   var saObj = {}, initiallines, lines, extralines, contentstr,tempstr, lastLineIndex=0;
   saObj.description = [];
   saObj.specialAbilities = [];
   //We break on last period, 3 spaces, or newline that is before an (Su), (Ex), or (Sp) this because sometimes special abilities
   // do not have newlines between them. (also go back to beginning of string if it's the first one)
   //also looks for  "words:" as first word after newline or period since some abilities are like that (dragons). (and sometimes spells does not have colon at end as in faerie dragon.)
   initiallines = str.split(/(?:\s\s\s|\r\n|^|[\.\n\v\f\r\x85\u2028\u2029])(?=\s*spells[:\s]|\s*[\w\s]+:|[^\.\v\r\n\x85\u2028\u2029]+(?:\(Su\):??|\(Ex\):??|\(Sp\):??))/i);
   //split the last one by newlines:
   if (_.size(initiallines>1)) {
     lastLineIndex = _.size(lines)-1 ;
     extralines = initiallines[lastLineIndex].split(/\s\s\s|\r\n|[\n\v\f\r\x85\u2028\u2029]/);
     if (_.size(extralines)>1){
       lines = initiallines.slice(0,lastLineIndex).concat(extralines);
     }
   }
   if (!lines) {
     lines = initiallines;
   }
   lines = _.filter(lines,function(line){
     if(!line) {return false;}
     return true;
   });
   saObj = _.reduce(lines, function (memo, line) {
     var spObj = {}, trimmedline = '', splitter = '',tempstr='', startIdx, endIdx = -1, matches, abilitytype='',foundSpecialNoType=false;
     try {
       trimmedline = line.replace(/^[^\w]+|[^\w]+$/g, '');
       if (trimmedline) {
         matches = trimmedline.match(/\(Su\):??|\(Ex\):??|\(Sp\):??/i);
         if (!matches || matches === null){
           matches = trimmedline.match(/^Spells[:\s]|^[\w\s]+:/i);//first one only
           if (matches && matches[0].length<20 && PFDB.monsterRules.test(matches[0]) ) {
             foundSpecialNoType=true;
             spObj.name = SWUtils.trimBoth(matches[0].replace(':',''));
             startIdx =  matches[0].length+1;
             spObj.description = SWUtils.trimBoth(trimmedline.slice(startIdx));
             memo.specialAbilities.push(spObj);
           }
           if (!foundSpecialNoType && trimmedline.toLowerCase() !== 'special abilities') {
             //this is just part of the description
             memo.description.push(trimmedline);
           }

         } else if (matches && matches.index>0 ) {
           tempstr=trimmedline.slice(0,matches.index);
           spObj.name = SWUtils.trimBoth(tempstr);
           spObj.basename = spObj.name.replace(/\s/g,'').toLowerCase();
           spObj.rule_category='special-abilities';
           spObj.ability_type=matches[0][1].toUpperCase()+matches[0][2].toLowerCase();
           startIdx = matches.index + matches[0].length + 1;
           spObj.description = SWUtils.trimBoth(trimmedline.slice(startIdx));
           matches=spObj.description.match(/(\d+d\d+) (?:points of){0,1}(.*?) damage/i);
           if(matches){
             if(matches[1]){
               spObj.extraDamage = '[['+matches[1]+']]';
             }
             if (matches[2]){
               spObj.extraDamageType = matches[2];
             }
           } else {
             matches=spObj.description.match(/([a-z]) for (\d+d\d+) (rounds|minutes|hours|days)/i);
             if(matches){
               if(matches[2]){
                 spObj.extraDamage = '[['+matches[2]+']] '+matches[3]||'';
               }
               if(matches[1]){
                 spObj.extraDamageType = matches[1];
               }
             }
           }
//				retobj.shortdesc = PFUtils.replaceDCString(PFUtils.replaceDiceDieString(origsastr),
 //						retobj.DCability, 'npc-hd-num', setter.is_undead);

           //before dc is usually 'the save'
           matches = spObj.description.match(/dc is (cha|con|wis|int|str|dex)[a-zA-Z]*.based/i);
           //TAS.debug"parseSpecialAbilities looking for DC ability it is: ",matches);
           if(matches && matches[1]){
             tempstr=matches[1].toUpperCase();
             spObj.DCability = tempstr;
             //TAS.debug"parseSpecialAbilities setting DC ability to "+tempstr);
           } else if(PFDB.specialAttackDCAbilityBase[spObj.basename]){
             spObj.DCability= PFDB.specialAttackDCAbilityBase[spObj.basename];
             //TAS.debug"parseSpecialAbilities setting DC ability to "+spObj.DCability+" based on "+ spObj.basename);
           }
           //bfore dc could be 'must make a', 'fails a'
           matches = spObj.description.match(/DC (\d+) (Will|Fort|Ref)[a-zA-Z]* save/i);
           if (matches){
             if(matches[1]){
               spObj.DC= matches[1];
             }
             if(matches[2]){
               tempstr=matches[2][0].toUpperCase()+ matches[2].slice(1).toLowerCase();
               spObj.save=tempstr;
             }
           } else {
             matches = spObj.description.match(/(Will|Fort|Ref)[a-zA-Z]* DC (\d+) ([^),.])/i);
             if (matches){
               if(matches[1]){
                 tempstr=matches[1][0].toUpperCase()+ matches[1].slice(1).toLowerCase();
                 spObj.save=tempstr;
                 if (matches[3]){
                   spObj.save += ' '+matches[3];
                 }
               }
               if(matches[2]){
                 spObj.DC=matches[2];
               }
             }
           }
           memo.specialAbilities.push(spObj);
         }
       }
     } catch (err) {
       TAS.error('parseSpecialAbilities error parsing: ' + line + ' error is' + err);
     } finally {
       return memo;
     }
   }, saObj);
   //TAS.debug("parseSpecialAbilities returning",saObj);
   return saObj;
 },
 parseSpecialQualities = function (str){
   var matches, rawAbilities, saObjs=[];
   if (str){
     //TAS.debug("PFNPCParser.parseSpecialQualities: "+str);
     //skip over "SQ" in front
     matches = str.match(/^SQ[\s:]*/i);
     if (matches){
       str = str.slice(matches[0].length);
     }
     rawAbilities = str.split(/,\s*/);
     //TAS.debug("found the following:", rawAbilities);
     _.each(rawAbilities,function(ability){
       var saAb={},type="";
       saAb.name=ability;
       type=PFUtils.getSpecialAbilityTypeFromString(ability);
       if(type){
         saAb.ability_type=type;
       }
       saAb.rule_category='special-qualities';
       saObjs.push(saAb);
     });
     //TAS.debug"returning ", saObjs);
     return saObjs;
   }
   return null;
 },
 parseSLAs = function (spLAstr) {
   var lines, clname = '', lastFreq = '', tempstr='', lastPerDay = 0, slas = {};
   try {
     slas.spellLikeAbilities = [];
     slas.CL = 0;
     slas.concentration = 0;
     slas.classname = "";
     lines = spLAstr.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
     _.each(lines, function (line) {
       var matches, slatdivider, SLAArray, freqStr = "", slaofTypeStr = "", thisSlaObj = {},rawDC=0, tempstr2='',
       slatype = "", numPerDay = 0, slasOfType, header=0, row=0, hasSpellLevel=0, freqIsPer=0, tempsplit;
       try {
         //TAS.debug"parsing "+line);
         if ((/CL\s*\d+/i).test(line) || (/concentrat/i).test(line) ||
         (/psychic\smagic/i).test(line) || (/spell.like.abilit/i).test(line)) {
           header=1;
         } else if ((/\u2013|\u2014|-/).test(line)) {
           row = 1;
         }
         if (header){
           if ((/CL\s*\d+/i).test(line)) {
             matches = line.match(/CL\s*(\d+)/i);
             if (matches[1]) {
               slas.CL = parseInt(matches[1], 10) || 0;
             }
           }
           if ((/concentrat/i).test(line)) {
             matches = line.match(/concentrat[\w]*\s*[+\-]??(\d+)/i);
             if (matches[1]) {
               slas.concentration = parseInt(matches[1], 10) || 0;
             }
           }
           if ((/psychic\smagic/i).test(line)) {
             slas.classname = 'Psychic Magic';
           } else {
             slas.classname = 'Spell-like abilities';
           }
         } else if (row) {
           //TAS.debug"splitting line "+line);
           matches = line.match(/\u2013|\u2014|\-/);
           slaofTypeStr = line.slice(matches.index+1);
           freqStr = SWUtils.trimBoth(line.slice(0,matches.index)).toLowerCase();
           matches = freqStr.match(/constant|will|day|month/i);
           if (matches && matches[0]) {
             slatype = matches[0].toLowerCase();
             thisSlaObj.type = slatype;
             if (slatype === 'day' || slatype==='month') {
               freqIsPer=1;
               matches = freqStr.match(/\d+/);
               if (matches && matches[0]) {
                 numPerDay = parseInt(matches[0], 10) || 0;
                 thisSlaObj.perDay = numPerDay;
               }
             }
           } else {
             tempsplit = freqStr.split('/');
             if (tempsplit.length>=2){
               freqIsPer=1;
               matches = tempsplit[0].match(/\d+/);
               if (matches && matches[0]) {
                 numPerDay = parseInt(matches[0], 10) || 0;
                 thisSlaObj.perDay = numPerDay;
               }
               slatype='other';
               thisSlaObj.type = slatype;
               thisSlaObj.otherPer=tempsplit[1];
             }
           }
           //TAS.debug"the frequency is " + slatype + " and are " + numPerDay + " per that");
           slasOfType = slaofTypeStr.split(/,\s*(?![^\(\)]*\))/);
           SLAArray = _.reduce(slasOfType, function (memo, sla) {
             var thissla = {}, dcstr = '';
             try {
               thissla.type = slatype;
               if (freqIsPer && numPerDay > 0) {
                 thissla.perDay = numPerDay;
               }
               //look for spell level.
               matches = sla.match(/level\s*(\d+)/i);
               if (matches){
                 if (matches[1]){
                   //TAS.debug"spell level match on "+ sla+ " Is " + matches[1]);
                   thissla.spell_level = parseInt(matches[1],10)||0;
                   hasSpellLevel=1;
                 }
                 sla = sla.replace(matches[0],'');
               }

               matches = sla.match(/D[Cc]\s*\d+/);
               if (matches){
                 tempstr2 = sla.replace(matches[0],'');
                 tempstr =matches[0].match(/\d+/);
                 rawDC=parseInt(tempstr,10)||0;
                 thissla.DC = rawDC;
                 matches = tempstr2.match(/\b(fortitude|willpower|reflex|fort|will|ref)\b([^,]+,)/i);
                 if(matches){
                   thissla.save=matches[0]; //type of save up to first comma after it
                 }

               }
               //if parenthesis, name should be only what is in parens,
               if (sla.indexOf('(')>0){
                 thissla.name= sla.slice(0,sla.indexOf('(')-1);
                 tempstr = sla.slice(sla.indexOf('(')-1);
                 //sla= tempstr;
                 //summon spells have levels
                 thissla.shortdesc = tempstr;
               } else {
                 thissla.name = sla;
               }
               if (thissla.spell_level && (/^summon/i).test(thissla.name )){
                 thissla.name += " Level "+ String(thissla.spell_level);
               }
               memo.push(thissla);
             } catch(errslain){
               TAS.error("parseSLAs, error reducing to SLAArray for: "+sla ,errslain);
               if(!thissla.name){
                 thissla.name= sla;
               } else {
                 thissla.description=sla;
               }
               memo.push(thissla);
             } finally {
               return memo;
             }
           }, []);
           if (SLAArray && _.size(SLAArray) > 0) {
             thisSlaObj.type = slatype;
             if (freqIsPer && numPerDay > 0) {
               thisSlaObj.perDay = numPerDay;
             }
             thisSlaObj.SLAs = SLAArray;
             slas.spellLikeAbilities.push(thisSlaObj);
           }
         } else {
           TAS.warn("Cannot parse " + line);
           return;
         }
       } catch (ierr) {
         TAS.error("parseSLAs error parsing" + line, ierr);
       }
     });
   } catch (err) {
     TAS.error("parseSLAs", err);
   } finally {
     if (slas.spellLikeAbilities && _.size(slas.spellLikeAbilities) > 0) {
       return slas;
     }
     return null;
   }
 },
 /** parseSpells - parses spell string from compendium and returns js object
 *@param {string} spellstr the block of spells known text ex: "Sorcerer Spells Known (CL 8th)\r\n3rd (3/day)-Fireball (DC12)," etc
 *@returns {jsobject} {classname:"name",CL:#,concentration:#,
 * spells:{
 *	0:[{name:spellname,DC:#}],
 *   1:[{name:spellname},{name:spellname}]
 * }}
 */
 parseSpells = function (spellstr) {
   var lines, spells = {};
   spells.classLevel = -1;
   spells.concentration = -1;
   spells.classname = "";
   spells.spellsByLevel = [];

   if (!spellstr) {
     return null;
   }
   lines = spellstr.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
   spells = _.reduce(lines, function (omemo, line) {
     var matches,
     spellarray,
     slatdivider,
     splittedSpells,
     dcstr,
     tempstr,
     temparray=[],
     match,
     thislvl = {},
     slasOfType;
     thislvl.perDay = -1;
     thislvl.spellLevel = -1;
     try {
       if (spells.classLevel === -1 && (/C[Ll]\s*\d+/i).test(line)) {
         matches = line.match(/C[Ll]\s*(\d+)/i);
         if (matches && matches[1]) {
           spells.classLevel = parseInt(matches[1], 10) || 0;
         }
         matches = line.match(/concentrat[\w]*\s*[+\-]??(\d+)/i);
         if (matches && matches[1]) {
           spells.concentration = parseInt(matches[1], 10) || 0;
         }
         matches = line.match(/([\w\s]*)spells\sknown/i);
         if (matches && matches[1]) {
           spells.classname = matches[1].replace(/^\s|\s$/g, '');
           spells.classname = spells.classname[0].toUpperCase() + spells.classname[1];
         }
       } else {
         //look for endash, emdash, or dash
         slatdivider = line.split(/\u2013|\u2014|-/);
         if (slatdivider && slatdivider[0]) {
           matches = slatdivider[0].match(/^(\d+)/);
           if (matches && matches[1]) {
             thislvl.spellLevel = parseInt(matches[1], 10) || 0;
             matches = slatdivider[0].match(/(\d+)\/day/i);
             if (matches && matches[1]) {
               thislvl.perDay = parseInt(matches[1], 10) || 0;
             }
           } else {
             match = slatdivider[0].match(/opposition schools\s*/i);
             if (match) {
               tempstr = slatdivider[0].slice(match.index + match[0].length);
               spells.oppositionschools = tempstr;
             } else {
               //stuff is here but what? add to notes
               spells.spellnotes = slatdivider[0];
             }
           }
         }
         if (slatdivider && slatdivider[1]) {
           splittedSpells = slatdivider[1].split(',');
           spellarray = _.reduce(splittedSpells, function (memo, spell) {
             var thisspell = {};
             try {
               matches = spell.split(/\(dc/i);
               thisspell.name = matches[0].replace(/^\s|\s$/g, '');
               if (matches[1]) {
                 dcstr = matches[1];
                 matches = dcstr.match(/\d+/);
                 if (matches && matches[0]) {
                   thisspell.DC = parseInt(matches[0], 10) || 0;
                 }
               }
               memo.push(thisspell);
             } catch (errinner) {
               TAS.error("PFNPCParser.parseSpells errinner:",errinner);
             }
             finally {
               return memo;
             }
           }, []);
           if (thislvl.spellLevel >= 0 && spellarray && spellarray.length > 0) {
             thislvl.spells = spellarray;
             omemo.spellsByLevel.push(thislvl);
           }
         }
       }
     } catch (err) {
       TAS.error("PFNPCParser.parseSpells",err);
     }
     finally {
       return omemo;
     }
   }, spells);
   return spells;
 },
 parseSpace = function (spaceStr) {
   var retstr = spaceStr,
   matches,
   tempFloat;
   try {
     matches = spaceStr.match(/\s*(\d*\.?\d*)?/);
     if (matches) {
       tempFloat = parseFloat(matches[1]);
       if (!isNaN) {
         retstr = String(tempFloat);
       }
     }
   } finally {
     return retstr;
   }
 },
 getCasterObj = function (spellObj, abilityScores, healthObj, isSLA) {
   var caster = {};
   if (!spellObj || !abilityScores || !healthObj) { return null; }
   try {
     //TAS.debug"getCasterObj spellObj,abilities,health are:", spellObj, abilityScores, healthObj);
     caster.abilityMod = 0;
     caster.CL = 0;
     caster.concentrationBonus = 0;
     if (isSLA) {
       caster.classname = "Spell-like abilities";
       caster.ability = 'CHA';
       caster.abilityMod = abilityScores.cha.mod;
     } else {
       if (spellObj.classname) {
         caster.classname = spellObj.classname;
         if (PFDB.casterDefaultAbility[spellObj.classname] && abilityScores[PFDB.casterDefaultAbility[spellObj.classname]]) {
           caster.ability = PFDB.casterDefaultAbility[spellObj.classname].toUpperCase();
           caster.abilityMod = abilityScores[PFDB.casterDefaultAbility[spellObj.classname]].mod;
         }
       } else {
         //assume sorcerer
         caster.classname = 'Sorcerer';
         caster.ability = 'CHA';
         caster.abilityMod = abilityScores.cha.mod;
       }
     }
     if (spellObj.CL) {
       caster.CL = spellObj.CL;
     } else {
       //assume HD
       caster.CL = healthObj.hdice1;
     }
     if (spellObj.concentration) {
       caster.concentrationBonus = parseInt(spellObj.concentration, 10) - parseInt(caster.abilityMod, 10) - parseInt(caster.CL, 10);
     }
     if (spellObj.oppositionschools){
       caster.oppositionschools = spellObj.oppositionschools;
       spellObj.oppositionschools = null;
     }
     if (spellObj.spellnotes){
       caster.spellnotes = spellObj.spellnotes;
       spellObj.spellnotes = null;
     }

   } catch (err) {
     TAS.error("getCasterObj error trying to create obj returning null", err);
     caster = null;
   } finally {
     //TAS.debug"returning ", caster);
     return caster;
   }
 },
 setCasterFields = function (setter, casterObj, classidx) {
   var alreadyPresent = false;
   try {
     //TAS.debug"setCasterFields");
     classidx = classidx || 0;
     if (classidx < 0) { classidx = 0; }
     if (setter["spellclass-" + classidx + "-name"] || setter["spellclass-" + classidx + "-level"]) {
       if (!(parseInt(setter["spellclass-" + classidx + "-level"], 10) === parseInt(casterObj.CL, 10) &&
         PFUtils.findAbilityInString(setter["Concentration-" + classidx + "-ability"]) === casterObj.ability.toUpperCase())) {
         classidx++;
       } else {
         alreadyPresent = true;
       }
     }
     if (classidx > 2) {
       TAS.error("Could not setCasterFields, 0,1,2 spellclasses already defined:" +
       setter["spellclass-0-name"] + ", " + setter["spellclass-1-name"] + ", " + setter["spellclass-2-name"], classidx);
       casterObj.pageClassIdx = -1;
     } else if (alreadyPresent) {
       setter["spellclass-" + classidx + "-name"] = setter["spellclass-" + classidx + "-name"] + " and " + casterObj.classname;
       casterObj.pageClassIdx = classidx;
     } else {
       setter["spellclass-" + classidx + "-name"] = casterObj.classname;
       //should add class here ? setter['class-'+what+'-name']
       setter["spellclass-" + classidx + "-level"] = casterObj.CL;//if they have hit dice, this will make it increase? not if we don'tdo class-x-level
       setter["spellclass-" + classidx + "-level-total"] = casterObj.CL;
       if ((/wizard|cleric|druid|paladin|ranger|investigator|shaman|witch|alchemist|warpriest/i).test(casterObj.classname)){
         setter["spellclass-" + classidx + "-casting_type"] =2;//prepared
       } else {
         setter["spellclass-" + classidx + "-casting_type"] = 1;//spontaneous
       }
       if (casterObj.ability) {
         setter["Concentration-" + classidx + "-ability"] = "@{" + casterObj.ability + "-mod}";
       }
       setter["Concentration-" + classidx + "-mod"] = casterObj.abilityMod;
       if (casterObj.concentrationBonus) {
         setter["Concentration-" + classidx + "-misc"] = casterObj.concentrationBonus;
       }
       casterObj.pageClassIdx = classidx;
       if (casterObj.oppositionschools){
         setter["spellclass-" + classidx + "-oppositionschool-0"]=casterObj.oppositionschools;
       }
       if (casterObj.spellnotes){
         setter["spellclass-" + classidx + "-notes"]=casterObj.spellnotes;
       }
     }
   } catch (err) {
     TAS.error("setSLACasterFields", err);
   } finally {
     return setter;
   }
 },
 /** createSpellEntries
 *@param {jsobject} setter - map to pass to setAttrs
 *@param {jsobject} spellObj obj like: {classname:"name",CL:#,concentration:#,
 *	spells:{
 *		0:[{name:spellname,DC:#}],
 *		1:[{name:spellname},{name:spellname}]
 *	}}
 *@param {?} casterObj ?
 *@param {?} section ?
 *@returns {jsobject} setter
 */
 createSpellEntries = function (setter, spellObj, casterObj, section) {
   section = section || 'spells';
   setter = setter || {};
   if (!spellObj || !casterObj) {
     return setter;
   }
   _.each(spellObj.spellsByLevel, function (spellLevel) {
     var thisSpellLevel = parseInt(spellLevel.spellLevel, 10) || 0, baseDC = 0, perdayPrefix = "";
     try {
       //TAS.debug"now look at level " + thisSpellLevel + " spells", spellLevel);
       perdayPrefix = "spellclass-" + casterObj.pageClassIdx + "-level-" + thisSpellLevel;
       if (spellLevel.perDay) {
         setter[perdayPrefix + "-class"] = spellLevel.perDay;
         setter[perdayPrefix + "-spells-per-day_max"] = spellLevel.perDay;
         setter[perdayPrefix + "-spells-per-day"] = spellLevel.perDay;
       }
       baseDC = 10 + thisSpellLevel + (parseInt(casterObj.abilityMod, 10) || 0);
     } catch (errlvl) {
       TAS.error("createSpellEntries error setting spells per day", errlvl);
     }
     setter = _.reduce(spellLevel.spells, function (memo, spell) {
       var newRowId = generateRowID(), thisDC = 0,
       prefix = "repeating_" + section + "_" + newRowId + "_";
       try {
         setter[prefix + "name"] = (spell.name[0].toUpperCase() + spell.name.slice(1));
         setter[prefix + "classnumber"] = casterObj.pageClassIdx;
         setter[prefix + "spellclass"] = casterObj.classname;
         setter[prefix + "spell_level"] = thisSpellLevel;
         if (spell.DC) {
           thisDC = parseInt(spell.DC, 10) || 0;
           if (thisDC !== baseDC) {
             setter[prefix + "DC_misc"] = thisDC - baseDC;
           }
           setter[prefix + "savedc"] = thisDC;
         }
         if (casterObj.concentration) {
           setter[prefix + "Concentration-mod"] = casterObj.concentration;
         }
       } catch (err) {
         TAS.error("createSpellEntries error setting spell :", spell, err);
       } finally {
         return setter;
       }
     }, setter);
   });
   return setter;
 },
 createSLAEntries = function (setter, slaObj, casterObj, section) {
   var defaultLevel=0;
   section = section || 'ability';
   setter = setter || {};
   if (!slaObj || !casterObj) {
     return setter;
   }
   defaultLevel = parseInt(setter.level,10)||0;

   _.each(slaObj.spellLikeAbilities, function (perDaySLAs) {
     var thisPerDay = parseInt(perDaySLAs.perDay, 10) || 0,
     freqType = perDaySLAs.type;
     //TAS.debug" at one set of SLAs, freq:" + freqType + " and perday:" + thisPerDay, perDaySLAs);
     setter = _.reduce(perDaySLAs.SLAs, function (memo, SLA) {
       var newRowId, prefix = "repeating_" + section + "_" + newRowId + "_",
       casterAbility, dcTot = 0, dcMod = 0, sdstr = "", charlvl=0,clmisc=0,tempint=0,slmisc=0,
       casterlevel=0;
       try {
         newRowId = generateRowID();
         prefix = "repeating_" + section + "_" + newRowId + "_";
         memo[prefix + "name"] = (SLA.name[0].toUpperCase() + SLA.name.slice(1));
         memo[prefix + "ability_type"] = 'Sp';
         memo[prefix + "rule_category"] = 'spell-like-abilities';
         memo[prefix + 'showinmenu'] = '1';
         if (casterObj.ability ) {
           casterAbility=casterObj.ability;
           memo[prefix + "ability-basis"] = "@{"+casterObj.ability+"-mod}";
         } else {
           casterAbility="CHA";
           memo[prefix + "ability-basis"] = "@{CHA-mod}";
         }
         memo[prefix + "CL-basis"] = "@{npc-hd-num}";
         memo[prefix + "CL-basis-mod"] = setter.level;
         if(setter['race']){
           memo[prefix+"class-name"]=setter['race'];
         }
//					//TAS.debug"CREATE SLA casterObj.CL: " + casterObj.CL + ", level:" + setter.level + " when processing "+ SLA );
         if(casterObj.CL){
           tempint = setter.level||0;
           if (tempint > 0){
             memo[prefix+"CL-misc"]= casterObj.CL - tempint  ;
             memo[prefix+"CL-misc-mod"]= casterObj.CL - tempint  ;
           }
           casterlevel  = casterObj.CL;
         } else {
           casterlevel = setter.level||0;
         }

         memo[prefix+'casterlevel']= casterlevel;
         //assume 1/2? or calc based on DC?
         if (SLA.spell_level){
           if (SLA.spell_level === defaultLevel){
             memo[prefix + "spell_level-basis"]="@{casterlevel}";
           } else if (SLA.spell_level === Math.floor(defaultLevel/2)){
             memo[prefix + "spell_level-basis"]="floor(@{casterlevel}/2)";
           } else {
             memo[prefix + "spell_level-basis"]="0";
             memo[prefix+"spell_level-misc"]=SLA.spell_level;
           }
         } else {
           memo[prefix + "spell_level-basis"]="floor(@{casterlevel}/2)";
         }
         //memo[prefix+"classnumber"]=casterObj.pageClassIdx;
         //memo[prefix+"spellclass"]=casterObj.classname;
         switch(freqType){
           case 'day':
             memo[prefix + "frequency"] = 'perday';
             memo[prefix + "used"] = thisPerDay;
             memo[prefix + "used_max"] = thisPerDay;
             memo[prefix + "max-calculation"]=thisPerDay;
             memo[prefix + "hasfrequency"] = '1';
             memo[prefix + "hasuses"] = '1';
             break;
           case 'will':
             memo[prefix + "frequency"] = 'atwill';
             memo[prefix + "hasfrequency"] = '1';
             break;
           case 'constant':
             memo[prefix + "frequency"] = "constant";
             memo[prefix + "hasfrequency"] = '1';
             break;
           case 'month':
             memo[prefix + "frequency"] = "permonth";
             memo[prefix + "used"] = thisPerDay;
             memo[prefix + "used_max"] = thisPerDay;
             memo[prefix + "max-calculation"]=thisPerDay;
             memo[prefix + "hasfrequency"] = '1';
             memo[prefix + "hasuses"] = '1';
             break;
           case 'everyrounds':
             memo[prefix + "frequency"] = "everyrounds";
             memo[prefix + "hasfrequency"] = '1';
             memo[prefix + "rounds_between"] = SLA.used||'';
             break;
           case 'other':
             memo[prefix + "frequency"] = "other";
             memo[prefix + "used"] = thisPerDay;
             memo[prefix + "used_max"] = thisPerDay;
             memo[prefix + "max-calculation"]=thisPerDay;
             memo[prefix + "hasfrequency"] = '1';
             memo[prefix + "hasuses"] = '1';
             if (slaObj.otherPer){
               sdstr = "Frequency per :"+slaObj.otherPer;
             }
             break;
         }
         if (SLA.save){
           memo[prefix + "save"] = SLA.save;
         }
         if (SLA.DC) {
           try {
             if (!SLA.save){
               memo[prefix + "save"]  = "See Text";
             }
             if (casterObj.abilityMod ) {
               tempint=0;
               if (SLA.spell_level){
                 tempint = 10+casterObj.abilityMod+SLA.spell_level;
               } else {
                 tempint = 10+casterObj.abilityMod + Math.floor( casterlevel /2);
               }
               if (tempint !== SLA.DC){
                 memo[prefix+"spell_level-misc"]= (SLA.DC - tempint);
                 memo[prefix+"spell_level-misc-mod"]= (SLA.DC - tempint);
               }
             }
           } catch (err3){
             TAS.error("createSLAentries, error trying to calculate DC: "+SLA,err3);
           }
         }
         if (SLA.description){
           memo[prefix+"description"]= SLA.description;
         }
         if (SLA.shortdesc){
           if (sdstr){
             sdstr = SLA.shortdesc +", "+ sdstr;
           } else {
             sdstr = SLA.shortdesc;
           }
         }
         if (sdstr) {
           memo[prefix + "short-description"] = sdstr;
         }
       } catch (err) {
         TAS.error("createSLAEntries error setting SLA :", SLA, err);
       } finally {
         return memo;
       }
     }, setter);
   });
   return setter;
 },
 /*createAttacks - creates rows in repeating_weapon
 * @attacklist = array of {enh:0,name:"",type:"",countFullBAB:1,plus:"",note:"",iter:[],dmgdice:0,dmgdie:0,crit:20,critmult:2,dmgbonus:0};
 * @setter = the map to pass to setAttrs
 * @returns setterf
 */
 createAttacks = function (attacklist, setter, attackGrid, abilityScores, importantFeats, defaultReach, exceptionReaches, sizeMap) {
   setter = setter || {};
   if (!attacklist || _.size(attacklist)===0) {
     return setter;
   }
   //TAS.debug"create attacks:", attacklist, attackGrid, abilityScores, importantFeats, defaultReach, exceptionReaches);
   setter = _.reduce(attacklist, function (memo, attack) {
     var newRowId = generateRowID(),
     prefix = "repeating_weapon_" + newRowId + "_",
     i = 0, iterativeNum = 0, basebonus = 0, tempInt = 0, dmgmult = 1, dmgmod = 0, tohitbonus = 0,
     name = "", tempstr = "", basename = "", iterZero = NaN,
     reach, newRowId2, prefix2;
     //TAS.debug"creating attack row id:" + newRowId);
     try {
       //TAS.debug"looking at attack:", attack);
       tohitbonus = Math.max(attack.enh, attack.mwk);
       basename = attack.basename;
       //basename.replace(/^group.*?:\s*/,'');
       name += attack.name;
       if (attack.plus) {
         name += " Plus " + attack.plus;
       }
       memo[prefix + "name"] = name;
       memo[prefix+"default_size"]=sizeMap.size;
       if (attack.atktype === 'ranged') {
         basebonus = attackGrid.ranged;
         memo[prefix + "attack-type"] = "@{attk-ranged}";
         memo[prefix + "attack-type-mod"] = attackGrid.ranged;
         memo[prefix + "isranged"] = 1;
       } else if (attack.atktype === 'cmb') {
         basebonus = attackGrid.cmb;
         memo[prefix + "attack-type"] = "@{CMB}";
         memo[prefix + "attack-type-mod"] = attackGrid.cmb;
         basebonus = 0;
       } else if (attack.atktype === 'special') {
         basebonus = 0;
         memo[prefix + "attack-type-mod"] = 0;
         memo[prefix + "total-attack"] = 0;
       } else {
         //assume all attacks use weapon finesse
         if (importantFeats.weaponfinesse) {
           basebonus = attackGrid.melee2;
           memo[prefix + "attack-type"] = "@{attk-melee2}";
           memo[prefix + "attack-type-mod"] = attackGrid.melee2;
         } else {
           basebonus = attackGrid.melee;
           memo[prefix + "attack-type"] = "@{attk-melee}";
           memo[prefix + "attack-type-mod"] = attackGrid.melee;
         }
         memo[prefix + "damage-ability"] = "@{STR-mod}";
         if (attack.type === 'natural') {
           if (attack.naturaltype === 'secondary') {
             dmgmult = 0.5;
             memo[prefix + "damage_ability_mult"] = 0.5;
           } else if (attack.dmgMult && attack.dmgMult === 1.5) {
             memo[prefix + "damage_ability_mult"] = 1.5;
             dmgmult = 1.5;
           }
         }
         if (dmgmult === 1) {
           dmgmod = abilityScores.str.mod;
         } else {
           dmgmod = Math.floor(dmgmult * abilityScores.str.mod);
         }
         memo[prefix + "damage-ability-mod"] = dmgmod;
       }
       if (attack.enh) {
         memo[prefix + "enhance"] = attack.enh;
       }
       if (attack.mwk) {
         memo[prefix + "masterwork"] = "1";
       }
       if (attack.iter && attack.iter.length > 0) {
         iterZero = parseInt(attack.iter[0], 10);
       }
       if (!isNaN(iterZero)) {
         memo[prefix + "attack"] = iterZero - tohitbonus - basebonus;
         memo[prefix + "attack-mod"] = iterZero - tohitbonus - basebonus;
         memo[prefix + "total-attack"] = iterZero;
       } else if (attack.atktype === 'cmb') {
         if ((/swallowwhole|pin/i).test(attack.basename)) {
           //if confirming crit add +5
           memo[prefix + "attack"] = 5;
           memo[prefix + "attack-mod"] = 5;
           memo[prefix + "total-attack"] = attackGrid.cmb + 5;
         } else {
           memo[prefix + "total-attack"] = attackGrid.cmb;
         }
       } else {
         memo[prefix + "total-attack"] = 0;
       }
       if (attack.crit !== 20) {
         memo[prefix + "crit-target"] = attack.crit;
       }
       if (attack.critmult !== 2 && attack.critmult) {
         memo[prefix + "crit-multiplier"] = attack.critmult;
       }
       if (importantFeats.criticalfocus) {
         memo[prefix + "crit_conf_mod"] = 4;
       }
       //somewhere this is getting lost:  just bandaid it:
       if (!memo[prefix + "total-attack"]) {
         memo[prefix + "total-attack"] = 0;
       }
       memo[prefix + "damage-dice-num"] = attack.dmgdice;
       memo[prefix + "default_damage-dice-num"] = attack.dmgdice;
       memo[prefix + "damage-die"] = attack.dmgdie;
       memo[prefix + "default_damage-die"] = attack.dmgdie;
       memo[prefix + "damage"] = attack.dmgbonus - attack.enh - dmgmod;
       memo[prefix + "damage-mod"] = attack.dmgbonus - attack.enh - dmgmod;
       memo[prefix + "total-damage"] = attack.dmgbonus;
       if (attack.note) {
         memo[prefix + "notes"] = "(" + attack.type + ") " + attack.note;
       } else {
         memo[prefix + "notes"] = "(" + attack.type + ")";
       }
       if (attack.iter.length > 1) {
         for (i = 1; i < attack.iter.length; i++) {
           iterativeNum = i + 1;
           //TAS.debug"at iteration " + iterativeNum + ", difference is :" + (attack.iter[i] - attack.iter[0]));
           memo[prefix + "toggle_iterative_attack" + iterativeNum] = "@{var_iterative_attack" + iterativeNum + "_macro}";
           memo[prefix + "iterative_attack" + iterativeNum + "_value"] = (attack.iter[i] - attack.iter[0]);
         }
       } else if (attack.countFullBAB > 1) {
         for (i = 1; i < attack.countFullBAB; i++) {
           iterativeNum = i + 1;
           memo[prefix + "toggle_iterative_attack" + iterativeNum] = "@{var_iterative_attack" + iterativeNum + "_macro}";
           memo[prefix + "iterative_attack" + iterativeNum + "_value"] = 0;
         }
       }
       // plus extra damage  **********************
       if (attack.plusamount) {
         memo[prefix + "precision_dmg_macro"] = "[[" + attack.plusamount + "]]";
         if (attack.plustype) {
           memo[prefix + "precision_dmg_type"] = attack.plustype;
         }
       } else if (attack.plus) {
         memo[prefix + "precision_dmg_type"] =attack.plus;
         memo[prefix + "precision_dmg_macro"] =  "Plus";
       }
       if (attack.dmgtype) {
         memo[prefix + "notes"] = memo[prefix + "notes"] + ", damage type:" + attack.dmgtype;
       }
       //reach **************************
       if (attack.range) {
         tempInt = parseInt(attack.range, 10);
         if (isNaN(tempInt)) {
           memo[prefix + "notes"] = memo[prefix + "notes"] + ", range:" + attack.range;
         }
       } else if ((/tongue/i).test(attack.name)) {
         reach = defaultReach * 3;
         memo[prefix + "range"] = reach;
       } else if (attack.atktype === "melee") {
         if (exceptionReaches && exceptionReaches.length > 0) {
           //TAS.log("looking for match",exceptionReaches);
           reach = _.filter(exceptionReaches, function (reacharray) {
             //TAS.log("matching "+basename+" with "+reacharray[0]);
             if (basename.indexOf(reacharray[0]) >= 0) {
               //TAS.log("it matches!"+reacharray[0]);
               return true;
             }
             return false;
           });
           //TAS.log(reach);
           if (reach && reach[0] && reach[0][1]) {
             memo[prefix + "range"] = reach[0][1];
           } else if (defaultReach) {
             memo[prefix + "range"] = defaultReach;
           }
         } else if (defaultReach) {
           memo[prefix + "range"] = defaultReach;
         }
       }
       if (attack.group) {
         memo[prefix + "group"] = attack.group;
       }
       if (attack.dc) {
         memo[prefix + "notes"] = memo[prefix + "notes"] + " " + attack.dc + attack.dcequation ? (" " + attack.dcequation) : '';
       }
     } catch (err) {
       TAS.error("createattacks error on:", attack, err);
     } finally {
       return memo;
     }
   }, setter);
   //TAS.debug("end of create attacks returning:", setter);
   return setter;
 },
 createACEntries = function (setter, acMap, abilityScores, importantFeats, hpMap, bab) {
   var acAbility = "DEX",
   acDexDef = abilityScores.dex.mod,
   calcCMD=0,
   altbab = 0;
   try {
     //TAS.debug("acMap", acMap);
     if (acMap.altability) {
       //this should no longer happen.
       //TAS.debug("different ability score for AC!");
       acAbility = acMap.altability.toUpperCase();
       if (acAbility !== "DEX") {
         setter["AC-ability"] = "( ((@{XXX-mod} + [[ @{max-dex-source} ]]) - abs(@{XXX-mod} - [[ @{max-dex-source} ]])) / 2 )".replace(/XXX/g, acAbility);
         setter["CMD-ability2"] = "( ((@{XXX-mod} + [[ @{max-dex-source} ]]) - abs(@{XXX-mod} - [[ @{max-dex-source} ]])) / 2 )".replace(/XXX/g, acAbility);
         switch (acMap.altability.toLowerCase()) {
           case 'wis':
             acDexDef = abilityScores.wis.mod;
             break;
           case 'int':
             acDexDef = abilityScores['int'].mod;
             break;
           case 'cha':
             acDexDef = abilityScores.cha.mod;
             break;
           case 'con':
             acDexDef = abilityScores.con.mod;
             break;
           default:
             acDexDef = abilityScores.dex.mod;
             break;
         }
         setter["AC-ability-mod"] = acDexDef;
       }
     }
     //has uncanny dodge
     if (acMap.uncanny) {
       setter["FF-ability"] = "@{XXX-mod}".replace(/XXX/g, acAbility);
       setter["FF-ability-mod"] = acDexDef;
       setter["CMD-ability"] = "( ((@{XXX-mod} + [[ @{max-dex-source} ]]) - abs(@{XXX-mod} - [[ @{max-dex-source} ]])) / 2 )".replace(/XXX/g, acAbility);
       setter["CMD-ability"] = acDexDef;
       setter["uncanny_dodge"] = 1;
       setter["uncanny_cmd_dodge"] = 1;
     }
     altbab=bab;
     if (importantFeats.defensivecombattraining) {
       setter['hd_not_bab']=1;
       altbab = (hpMap.hdice1||0) + (hpMap.hdice2||0);
     }
     try {
       calcCMD = altbab + abilityScores.str.mod + acDexDef + (-1 * acMap.size);
       if (isNaN(acMap.cmd) || calcCMD === acMap.cmd) {
         setter["CMD"]= calcCMD;
       } else {
         setter["CMD"] = acMap.cmd;
         setter["CMD-misc"] = (acMap.cmd - calcCMD);
       }
     } catch (err2){
       TAS.error("createACEntries error trying to calculate CMD",err2);
     }

     setter["AC"] = acMap.ac;
     setter["Touch"] = acMap.touch;
     setter["Flat-Footed"] = acMap.ff;
     setter["AC-deflect"] = acMap.deflect;
     setter["AC-dodge"] = acMap.dodge;
     setter["AC-misc"] = acMap.misc;
     setter["AC-natural"] = acMap.natural;
     if (acMap.armor) {
       setter["armor3-equipped"] = "1";
       setter["armor3-acbonus"] = acMap.armor;
       setter["armor3"]="Armor bonus";
       setter["AC-armor"] = acMap.armor;
     }
     if (acMap.shield) {
       setter["shield3-equipped"] = "1";
       setter["shield3-acbonus"] = acMap.shield;
       setter["shield3"]="Shield bonus";
       setter["AC-shield"] = acMap.shield;
     }
     if (acMap.notes){
       setter['defense-notes']=acMap.notes;
     }
     if (acMap.acbuff) {
       setter = PFBuffs.createTotalBuffEntry("AC adjustment from import", "AC", acMap.acbuff, acMap.acbuff, setter);
     }
   } catch (err) { } finally {
     return setter;
   }
 },
 createSkillEntries = function (setter, skills, racial, abilityScores, importantFeats, classSkills, isUndead) {
   var npcSkillsWithFillInNames = ["Craft", "Perform", "Profession"],
   craftLevel = -1, performLevel = -1, professionLevel = -1, runningTot = 0, counter = 0,
   tempAbilities = PFSkills.coreSkillAbilityDefaults,
   tempstr = "",
   skillfeats = /skillfocus|intimidatingprowess/i;
   try {
     if (racial) {
       if (racial.abilitymods && _.size(racial.abilitymods) > 0) {
         //set default ability for skill and substitute adjustments, make sure to use copy not original
         tempAbilities = _.extend({}, PFSkills.coreSkillAbilityDefaults, racial.abilitymods);
         setter = _.reduce(racial.abilitymods, function (memo, ability, skill) {
           memo[skill + "-ability"] = "@{" + ability.toUpperCase() + "-mod}";
           memo[skill + "-ability-mod"] = abilityScores[ability].mod;
           return memo;
         }, setter);
       }
       if (racial.skillmods && _.size(racial.skillmods) > 0) {
         setter = _.reduce(racial.skillmods, function (memo, mod, skill) {
           memo[skill + "-racial"] = mod;
           return memo;
         }, setter);
       }
       if (racial.skillnotes && racial.skillnotes.length > 0) {
         tempstr = "";
         _.each(racial.skillnotes, function (note) {
           tempstr += note + ", ";
         });
         tempstr.replace(/,\s$/, '');
         if (tempstr) {
           setter["Skill-notes"] = tempstr;
         }
       }
     }
     if (importantFeats && _.size(importantFeats) > 0) {
       setter = _.reduce(importantFeats, function (memo, val, feat) {
         if (/intimidatingprowess/i.test(feat)) {
           memo["Intimidate-misc"] = '@{STR-mod}';
           memo["Intimidate-misc-mod"] = abilityScores.str.mod;
         } else if (/skillfocus/i.test(feat)) {
           _.each(val, function (val2, skill) {
             memo[skill + "-feat"] = 3;
           });
         }
         return memo;
       }, setter);
     }
     if (classSkills && _.size(classSkills) > 0) {
       setter = _.reduce(classSkills, function (memo, skill) {
         try {
           if (skill === "Knowledge") {
             _.each(PFSkills.knowledgeSkills, function (kSkill) {
               memo[kSkill + "-cs"] = 3;
             });
           } else if (_.contains(PFSkills.coreSkillsWithFillInNames, skill)) {
             _.each(PFSkills.allFillInSkillInstances[skill], function (subskill) {
               memo[subskill + '-cs'] = 3;
             });
           } else {
             memo[skill + "-cs"] = 3;
           }
         } catch (err) {
           TAS.error("createSkillEntries", err);
         } finally {
           return memo;
         }
       }, setter);
     }
     setter = _.reduce(skills, function (memo, tot, skill) {
       var ability = "", tempint = 0, abilitymod = 0, ranks = 0;
       try {
         tot = parseInt(tot, 10);
         if (tempAbilities[skill]) {
           ability = tempAbilities[skill];
           abilitymod = abilityScores[ability] ? abilityScores[ability].mod : 0;
           abilitymod = parseInt(abilitymod, 10);
           //TAS.debug("now setting " + skill + ", total:" + tot);
           memo[skill] = tot;
           ranks = tot;
           ranks -= abilitymod;
           if (racial && racial.skillmods && racial.skillmods[skill]) {
             ranks -= parseInt(racial.skillmods[skill], 10);
           }
           if (parseInt(memo[skill + "-feat"], 10) > 0) {
             ranks -= parseInt(memo[skill + "-feat"], 10);
           }
           if (parseInt(memo[skill + "-cs"], 10) > 0) {
             ranks -= 3;
           }
           memo[skill + "-ranks"] = ranks;
           memo[skill + "-ability-mod"] = abilitymod;
           runningTot++;
         } else {
           TAS.warn("createSkillEntries, skill " + skill + " not found");
         }
       } catch (err) {
         TAS.error("createSkillEntries inner reduce", err);
       } finally {
         return memo;
       }
     }, setter);
   } catch (errouter) {
     TAS.error("at createskillEntries OUTER error", errouter);
   } finally {
     return setter;
   }
 },
 createInitEntries = function (setter, baseInit, abilityScores, importantFeats) {
   var initMisc = 0;
   try {
     initMisc = baseInit - abilityScores.dex.mod;
     setter["init"] = baseInit;
     setter["init-misc"] = initMisc;
     setter["init-misc-mod"] = initMisc;
     setter["init-ability-mod"] = abilityScores.dex.mod;
   } catch (err) {
     TAS.error("createInitEntries", err);
   } finally {
     return setter;
   }
 },
 createHPAbilityModEntry = function (setter, abilityScores, isUndead) {
   try {
     if (isUndead || abilityScores.con.base === "-") {
       setter["HP-ability"] = "@{CHA-mod}";
       setter["HP-ability-mod"] = abilityScores.cha.mod;
     } else {
       setter["HP-ability-mod"] = abilityScores.con.mod;
     }
   } finally {
     return setter;
   }
 },
 createHealthEntries = function (setter, abilityScores, isUndead, hpMap) {
   var currlevel=0;
   try {
     setter["npc-hd-num"] = hpMap.hdice1;
     setter["level"] =hpMap.hdice1;
     setter["npc-hd"] = hpMap.hdie1;
     setter["HP"] = hpMap.hp;
     setter["HP_max"] = hpMap.hp;
     setter["non-lethal-damage_max"] = hpMap.hp;
     setter["auto_calc_hp"] = "1";
     //NPC: add to race row of class/race grid
     if (hpMap.basehp) {
       setter["NPC-HP"] = hpMap.basehp;
     }
     //bonuses
     if (hpMap.misc) {
       setter["HP-formula-macro-text"] = hpMap.misc;
       setter["HP-formula-mod"] = hpMap.misc;
     }
     if (hpMap.heal) {
       setter["npc-heal-conditions"] = hpMap.heal;
     }
   } catch (err) {
     TAS.error("createHealthEntries", err);
   } finally {
     return setter;
   }
 },
 createSpeedEntries = function (setter, speedMap, importantFeats) {
   var tempstr = "";
   try {
     _.each(speedMap, function (speed, stype) {
       switch (stype) {
         case 'land':
           setter["speed-base"] = speed;
           setter["speed-modified"] = speed;
           break;
         case 'fly':
           setter["speed-fly"] = speed;
           break;
         case 'climb':
           setter["speed-climb"] = speed;
           break;
         case 'swim':
           setter["speed-swim"] = speed;
           break;
         case 'flyability':
           tempstr += "Fly (" + speed + ")";
           break;
         default:
           setter["speed-misc"] = speed;
           if (tempstr.length > 0) {
             tempstr += ", ";
           }
           tempstr += stype + " " + speed;
           break;
       }
     });
     if (tempstr) {
       setter["speed-notes"] = tempstr;
     }
     if (importantFeats.run) {
       setter["run-mult"] = 5;
     }
   } catch (err) {
     TAS.error("parseAndSetSpeed error, speedMap", speedMap, err);
   } finally {
     return setter;
   }
 },
 createSaveEntries = function (setter, abilityScores, isUndead, baseSaves, v) {
   var fortMisc,
   refMisc,
   willMisc,
   tempNote = "",
   tempstr = "";
   try {
     fortMisc = baseSaves.baseFort - abilityScores.con.mod;
     refMisc = baseSaves.baseRef - abilityScores.dex.mod;
     willMisc = baseSaves.baseWill - abilityScores.wis.mod;
     if (isUndead || abilityScores.con.base === "-") {
       fortMisc = baseSaves.baseFort - abilityScores.cha.mod;
       setter["Fort-ability"] = "@{CHA-mod}";
       setter["Fort-ability-mod"] = abilityScores.cha.mod;
     } else {
       setter["Fort-ability-mod"] = abilityScores.con.mod;
     }
     setter["npc-Fort"] = fortMisc;
     setter["Fort"] = baseSaves.baseFort;
     tempNote = "";
     tempstr = PFUtils.getNoteAfterNumber(v["fort_compendium"]);
     if (tempstr) {
       tempNote += ("Fortitude " + tempstr);
     }
     setter["npc-Ref"] = refMisc;
     setter["Ref"] = baseSaves.baseRef;
     if (abilityScores.dex.mod !== 0) {
       setter["Ref-ability-mod"] = abilityScores.dex.mod;
     }
     tempstr = PFUtils.getNoteAfterNumber(v["ref_compendium"]);
     if (tempstr) {
       tempNote += ("Reflex " + tempstr);
     }
     setter["npc-Will"] = willMisc;
     setter["Will"] = baseSaves.baseWill;
     if (abilityScores.wis.mod !== 0) {
       setter["Will-ability-mod"] = abilityScores.wis.mod;
     }
     tempstr = PFUtils.getNoteAfterNumber(v["will_compendium"]);
     if (tempstr) {
       tempNote += ("Willpower " + tempstr);
     }
     if (tempNote) {
       setter["saves_notes"] = tempNote;
       setter["toggle_save_notes"] = "1";
     }
   } catch (err) {
     TAS.error("createSaveEntries", err);
   } finally {
     return setter;
   }
 },
 createAbilityScoreEntries = function (setter, abilityScores) {
   try {
     setter["STR-base"] = abilityScores.str.base;
     setter["DEX-base"] = abilityScores.dex.base;
     setter["CON-base"] = abilityScores.con.base;
     setter["WIS-base"] = abilityScores.wis.base;
     setter["INT-base"] = abilityScores['int'].base;
     setter["CHA-base"] = abilityScores.cha.base;
     setter["STR"] = abilityScores.str.base;
     setter["DEX"] = abilityScores.dex.base;
     setter["CON"] = abilityScores.con.base;
     setter["WIS"] = abilityScores.wis.base;
     setter["INT"] = abilityScores['int'].base;
     setter["CHA"] = abilityScores.cha.base;
     setter["STR-mod"] = abilityScores.str.mod;
     setter["DEX-mod"] = abilityScores.dex.mod;
     setter["CON-mod"] = abilityScores.con.mod;
     setter["WIS-mod"] = abilityScores.wis.mod;
     setter["INT-mod"] = abilityScores['int'].mod;
     setter["CHA-mod"] = abilityScores.cha.mod;
   } catch (err) {
     TAS.error("createAbilityScoreEntries", err);
   } finally {
     return setter;
   }
 },
 parseAndCreateAttacks = function (setter, abilityScores, sizeMap, importantFeats, bab, attackGrid, reachObj, v) {
   var attacklist,
   attackArrays,
   defReach = 5,
   tempCMB=0,
   miscCMB=0,
   newCMB=0,
   reachExceptions = [];
   try {
     if (reachObj) {
       if (reachObj.reach) {
         defReach = reachObj.reach;
       }
       if (reachObj.reachExceptions) {
         reachExceptions = reachObj.reachExceptions;
       }
     }
     setter["bab"] = bab;
     setter["npc-bab"] = bab;
     setter["melee-ability-mod"] = abilityScores.str.mod;
     setter["attk-melee"] = abilityScores.str.mod + bab + sizeMap.size;
     attackGrid.melee = abilityScores.str.mod + bab + sizeMap.size;
     setter["ranged-ability-mod"] = abilityScores.dex.mod;
     setter["attk-ranged"] = abilityScores.dex.mod + bab + sizeMap.size;
     attackGrid.ranged = abilityScores.dex.mod + bab + sizeMap.size;
     if (importantFeats.criticalfocus) {
       setter["cmb_crit_conf"] = 4;
       setter["ranged_crit_conf"] = 4;
       setter["melee_crit_conf"] = 4;
     }
     if (importantFeats.weaponfinesse) {
       setter["melee2-ability"] = "@{DEX-mod}";
       setter["melee2-ability-mod"] = abilityScores.dex.mod;
       setter["attk-melee2"] = abilityScores.dex.mod + bab + sizeMap.size;
       attackGrid.melee2 = abilityScores.dex.mod + bab + sizeMap.size;
       setter["attk_melee2_note"] = 'Weapon Finesse';
       if (importantFeats.criticalfocus) {
         setter["melee2_crit_conf"] = 4;
       }
     }
     try {
       if (importantFeats.agilemaneuvers) {
         setter["CMB-ability"] = "@{DEX-mod}";
         setter["CMB-ability-mod"] = abilityScores.dex.mod;
         newCMB=abilityScores.dex.mod + bab - sizeMap.size;
         setter["cmb_desc"] = 'Agile Maneuvers';
       } else {
         setter["CMB-ability-mod"] = abilityScores.str.mod;
         newCMB=abilityScores.str.mod + bab - sizeMap.size;
       }
       tempCMB = parseInt(v.CMB,10);
       if (newCMB === tempCMB || isNaN(tempCMB)){
         setter["CMB"] = newCMB;
         attackGrid.cmb = newCMB;
       } else {
         miscCMB = tempCMB - newCMB;
         setter["CMB"] = tempCMB;
         attackGrid.cmb = tempCMB;
         setter["attk-CMB-misc"] = miscCMB;
       }

     } catch (errC) {
       TAS.error("parseAndCreateAttacks error creating CMB attack types", errC);
     }
     // Attacks *****************************
     if (v["npc-melee-attacks-text"]) {
       try {
         attacklist = parseAttacks(v["npc-melee-attacks-text"], "melee");
         assignPrimarySecondary(attacklist);
         setter = createAttacks(attacklist, setter, attackGrid, abilityScores, importantFeats, defReach, reachExceptions, sizeMap);
       } catch (errM) {
         TAS.error("parseAndCreateAttacks error creating melee attacks", errM);
       }
     }
     if (v["npc-ranged-attacks-text"]) {
       try {
         attacklist = parseAttacks(v["npc-ranged-attacks-text"], "ranged");
         setter = createAttacks(attacklist, setter, attackGrid, abilityScores, importantFeats, null, null, sizeMap);
       } catch (errR) {
         TAS.error("parseAndCreateAttacks error creating ranged attacks", errR);
       }
     }
   } catch (err) {
     TAS.error("parseAndCreateAttacks", err);
   } finally {
     return setter;
   }
 },
 /*createFeatEntries
 *@returns setter */
 createFeatEntries = function (setter, featlist) {
   return _.reduce(featlist, function (memo, feat) {
     var newRowId = generateRowID(),
     prefix="repeating_ability_"+newRowId+"_";
     memo[prefix+"name"] = feat;
     memo[prefix+"rule_category"]="feats";
     memo[prefix+"showinmenu"]="1";
     memo[prefix+"CL-basis"]="@{npc-hd-num}";
     memo[prefix+"CL-basis-mod"]=setter.level||0;
     if (setter["race"]) {
       memo[prefix + 'class-name'] = setter["race"];
     }
     memo[prefix+"row_id"]=newRowId;
     memo[prefix + "frequency"] = 'not-applicable';//'not-applicable';
     memo[prefix + 'ability_type'] = '';//'not-applicable';
     return memo;
   }, setter);
 },
 /*createFeatureEntries
 *@returns setter */
 createFeatureEntries = function (setter, abilitylist, abilityScoreMap) {
   var attrs = {}, creatureRace = "", tempint=0,dc=0,abilityMod=0,charlevel=0,calcDC=0;
   try {
     //TAS.debug("at createFeatureEntries:", abilitylist);
     charlevel = Math.floor((parseInt(setter.level,10)||0)/2);
     creatureRace = setter["race"];
     attrs = _.chain(abilitylist).map(function (ability) {
       var match=null,tempstr;
       //copy only settings we want to keep and return them in a new obj.
       //TAS.debug("first iter: ", ability);
       try {
         ability.description = ability.description || '';
         if (ability.note){
           if (ability.description) {
             ability.description += ', ';
           }
           ability.description += ability.note.replace(/,\s$/, '');
         }
         if (ability.other) {
           if (ability.description) {
             ability.description += ', ';
           }
           ability.description += ability.other.replace(/,\s$/, '');
           ability.other = null;
         }
         if(!ability.ability_type){
           if (ability.name){
             tempstr=PFUtils.getSpecialAbilityTypeFromString(ability.name);
             if(tempstr){
               ability.ability_type=tempstr;
               ability.name = ability.name.replace(/\b(Su|Ex|Sp)\b/i,'').replace('()','');
             }
           }
         }
       } catch (err3) {
         TAS.error("createFeatureEntries err3",err3);
       } finally {
         //TAS.debug("this ability is:", ability);
         return ability;
       }
     }).filter(function (ability) {
       if (ability.name) {
         return true;
       }
       return false;
     }).reduce(function (memo, ability) {
       var newRowId, prefix;
       try {
         newRowId = generateRowID();
         prefix = "repeating_ability_" + newRowId + "_";
         memo[prefix + "name"] = ability.name;
         memo[prefix + "row_id"] = newRowId;
         memo[prefix + "showinmenu"]='1';
         if (ability.shortdesc) {
           memo[prefix + 'short-description'] = ability.shortdesc;
         }
         if (ability.description) {
           memo[prefix + 'description'] = ability.description;
         }
         if (ability.used) {
           if(ability.frequency&& ability.frequency==='everyrounds'){
             memo[prefix+"frequency"] = ability.frequency;
             memo[prefix+'rounds_between']=ability.used;
           } else {
             if(ability.frequency){
               memo[prefix + "frequency"] = ability.frequency;
             } else {
               memo[prefix + "frequency"] = 'perday';
             }
             memo[prefix + 'used'] = ability.used;
             memo[prefix + 'used_max'] = ability.used;
             memo[prefix + 'max-calculation'] = ability.used;
           }
         } else {
           memo[prefix + "frequency"] = 'not-applicable';//'not-applicable';
         }
         if (ability.dmgtype) {
           memo[prefix+"damage-type"]= ability.dmgtype;
         }
         if (ability.rule_category){
           memo[prefix+ 'rule_category'] = ability.rule_category;
         }
         if (ability.ability_type) {
           memo[prefix + 'ability_type'] = ability.ability_type;
         } else {
           memo[prefix + 'ability_type'] = '';//'not-applicable';
         }
         memo[prefix+"CL-basis"]="@{npc-hd-num}";
         memo[prefix+"CL-basis-mod"]=setter.level||0;
         if (creatureRace) {
           memo[prefix + 'class-name'] = creatureRace;
         }
         if(ability.save){
           memo[prefix + 'save'] = ability.save;
         }

         if(ability.DCability){
           memo[prefix+'ability-basis']='@{'+ability.DCability.toUpperCase()+'-mod}';
           abilityMod = abilityScoreMap[ability.DCability.toLowerCase()].mod;
         } else if (ability.ability_type==='Sp' || setter.is_undead){
           memo[prefix+'ability-basis']='@{CHA-mod}';
           abilityMod = abilityScoreMap.cha.mod;
         } else {
           memo[prefix+'ability-basis']='@{CON-mod}';
           abilityMod = abilityScoreMap.con.mod;
         }
         if(ability.extraDamage){
           memo[prefix+'damage-macro-text']=ability.extraDamage;
         }
         if(ability.extraDamageType){
           memo[prefix+'damage-type']=ability.extraDamageType;
         }
         memo[prefix + "spell_level-basis"]="floor(@{casterlevel}/2)";
         if (ability.DC){
           dc =parseInt(ability.DC,10)||0;
           calcDC=  abilityMod + charlevel +10;
           tempint = dc - calcDC;
           if (tempint !== 0){
             memo[prefix+"spell_level-misc"]= tempint;
             memo[prefix+"spell_level-misc-mod"]= tempint;
           }
         }

       } catch (ierr2) {
         TAS.error("createFeatureEntries", ierr2);
       } finally {
         return memo;
       }
     }, {}).value();
     //TAS.debug"createFeatureAttrs adding " + _.size(attrs) + " to " + _.size(setter), attrs);
     setter = _.extend(setter, attrs);
   } catch (err) {
     TAS.error("createFeatureEntries", err);
   } finally {
     return setter;
   }
 },
 /** appends values of objects in sa2 to sa1 if name already exists in sa1
 * by reference
 * @param {Array} sa1 Array of {} js objects:list of special abilities maps. Must have 'name' property to compare
 * @param {Array} sa2 Array of {} js objects:list of special abilities maps. Must have 'name' property to compare
 * @returns {Array} sa2 concatenated with sa2, for any duplicates, we add properties from the sa2 version to sa1, but do not overwrite.
 */
 combineSpecialAbilities = function (sa1, sa2) {
   var combined;
   combined = _.map(sa1, function ( sa) {
     var existingSA;
     try {
       existingSA = _.findWhere(sa2, { 'name': sa.name });
       if (existingSA) {
         _.each(_.keys(existingSA),function(key){
           //TAS.debug("combining abilties: "+sa[key]+ " plus "+ existingSA[key]);
           if (key==='description'){
             sa.description = ((sa.description) ? (sa.description + ", ") : "") + (existingSA.description||"");
           } else if (key === 'shortdesc'){
             sa.shortdesc = ((sa.shortdesc) ? (sa.shortdesc + ", ") : "") + (existingSA.shortdesc||"");
           } else if ( !sa[key] && existingSA[key]){
             sa[key]=existingSA[key];
           }
         });
       }
     } catch (err1) {
       TAS.error("combineSpecialAbilities err1", err1);
     } finally {
       return sa;
     }
   });
   sa2 = _.reject(sa2,function(sa){
       if (_.findWhere(sa1,{'name':sa.name})){
         return true;
       }
       return false;
     });

   combined = _.union(combined, sa2);
   return combined;
 },
 createClassEntries = function (setter, characterClass) {
   var sumlvls =0, currlvls = 0,i=0,startidx=0,alreadyPresent=false;
   try {
     if (characterClass.CL && characterClass.classname){
       for (i=0;i<7;i++){
         if (setter["class-" + i + "-name"] || setter["class-" + i + "-level"]>0 ){
           startidx=i;
           if (setter["class-" + i + "-name"].toLowerCase() === characterClass.classname.toLowerCase()){
             alreadyPresent=true;
             break;
           }
         }
       }
       if (startidx>=6){
         TAS.warning("too many classes, cannot add " + characterClass.classname);
       } else {
         setter["class-" + startidx + "-name"] = characterClass.classname||"";
         setter["class-" + startidx + "-level"] = characterClass.CL||0;
       }
       if(characterClass.CL){
         currlvls = parseInt(setter.level,10)||0;
         currlvls += characterClass.CL||0;
         setter.level = currlvls;
       }
     }
   } catch (err){
     TAS.error("createClassEntries",err);
   } finally {
     return setter;
   }
 },

 /**************************** THE BIG ONE ***********************/
 /*importFromCompendium - imports all stuff*/
 importFromCompendium = function (eventInfo, callback, errorCallback) {
   var done = _.once(function(){
     TAS.info("##############################################");
     TAS.info("Leaving importFromCompendium");
     if (typeof callback === "function"){
       callback();
     }
   }),
   errorDone = _.once(function(){
     TAS.info("##############################################");
     TAS.info("Leaving importFromCompendium NOTHING DONE");
     if (typeof errorCallback === "function"){
       errorCallback();
     }
   }),
   fields = npcCompendiumAttributesPlayer.concat(["is_npc", "alignment"]);
   getAttrs(fields, function (v) {
     var setter = {}, abilityScores = {}, sizeMap = {}, speedMap = {}, hpMap = {}, acMap = {},
     importantFeats = {}, reachObj = {}, racialModsMap = {}, skillsMap = {}, attackGrid = {},
     baseFort = parseInt(v.fort_compendium, 10) || 0,
     baseRef = parseInt(v.ref_compendium, 10) || 0,
     baseWill = parseInt(v.will_compendium, 10) || 0,
     bab = parseInt(v["bab_compendium"], 10) || 0,
     reachExceptions = [],
     isUndead = false, specAbilObj = {}, npcdesc = '',
     tempNote = "", tempstr = "",
     tempInt = 0, tempFloat = 0.0, tempobj=null, baseInit = 0, initMisc = 0, spellcastingclass = -1,
     cr, featlist, attacklist, hpMod, tempArray, spellObj, casterObj,
     matches, attackArray, classSkillArray, specialAttacks, SLAs, attackArrays,
     specialAbilities = {},
     specialQualities=[],
     match,
     baseSaves = {};
     //TAS.debug("importFromCompendium", v);
     try {
       //some basics ***************************************************
       setter['level']=0;
       setter["is_npc"] = "1";
       setter['is_v1'] = "1";
       setter['PFSheet_Version'] =String((PFConst.version.toFixed(2)));
       setter=PFMigrate.getAllMigrateFlags(setter);
       if (v.xp_compendium) {
         setter["npc-xp"] = v.xp_compendium;
       }
       if(v.cr_compendium){
         cr = v.cr_compendium.replace(/\s*cr\s*/i,'');
         cr = SWUtils.trimBoth(cr);
         setter["npc-cr"] = cr;
       }
       setter["PC-Whisper"] = "/w gm";
       //Creature Race and Type *****************************************************
       //undead means use CHA instead of CON
       if (v.type_compendium) {
         setter["npc-type"] = v.type_compendium;
       }
       isUndead = ((/undead/i).test(v.type_compendium)||(/undead/i).test(v.character_name));
       if (isUndead) {
         setter["is_undead"] = "1";
         TAS.warn("is undead! ");
       }
       if (v.character_name){
         setter["race"] = v["character_name"];
       }

       /****************** class(es)******************************/
       if (v.class_compendium) {
         setter["add_class"]=1;
         tempInt=0;
         matches = v.class_compendium.split(/\s*,\s*/g);
         _.each(matches,function(classstr){
           var  lvl=0, localmatch = classstr.match(/\d+/),
             newclassstr=classstr;
             tempInt++;
           if (match){
             lvl = parseInt(match[0],10)||0;
             newclassstr = classstr.slice(0,match.index);
             if(( match.index+match[0].length) <= classstr.length){
               newclassstr += classstr.slice(match.index+match[0].length);
             }
           }
           setter = createClassEntries (setter,{'classname':classstr,'CL':lvl});
         });
         if(tempInt>1){
           setter["multiclassed"]=1;
           setter["class1_show"]=1;
         }
         tempInt=0;
       }
       // Ability Scores *****************************************************************
       abilityScores = parseAbilityScores(v);
       setter = createAbilityScoreEntries(setter, abilityScores, isUndead);
       // Size **********************************************************************
       sizeMap = PFSize.getSizeFromText(v.size_compendium);
       if (sizeMap && sizeMap.size !== 0) {
         setter.size = sizeMap.size;
         setter['default_char_size']=sizeMap.size;
         setter['old_size']=sizeMap.size;
         setter.size_skill = sizeMap.skillSize;
         setter["CMD-size"] = (sizeMap.size * -1);
         setter.size_skill_double = (sizeMap.skillSize * 2);
       } else {
         sizeMap = {'size':0,'size_skill':0,'CMD-size':0,'size_skill_double':0};
         setter['size']=0;
         setter['default_char_size']=0;
         setter['old_size']=0;
       }
       // Feats *********************************************************************
       if (v["npc-feats-text"]) {
         try {
           featlist = parseFeats(v["npc-feats-text"]);
           if (featlist && _.size(featlist) > 0) {
             setter = createFeatEntries(setter, featlist);
             importantFeats = buildImportantFeatObj(featlist);
           }
         } catch (featerr) {
           TAS.error("error parsing feats", featerr);
           if (!importantFeats) {
             importantFeats = {};
           }
         }
       }
       // Initiative *****************************************************************
       baseInit = getNPCInit(v.init_compendium);
       createInitEntries(setter, baseInit, abilityScores, importantFeats);
       /********************** Saves and defense ************************/
       baseSaves = {
         'baseFort': baseFort,
         'baseRef': baseRef,
         'baseWill': baseWill
       };
       if (v.dr_compendium) {
         setter["DR"] = v.dr_compendium;
       }
       if (v.sr_compendium) {
         setter["SR"] = v.sr_compendium;
         setter["SR-macro-text"] = v.sr_compendium;
       }
       createSaveEntries(setter, abilityScores, isUndead, baseSaves, v);

       //hit points ****************************
       createHPAbilityModEntry(setter, abilityScores, isUndead);
       hpMod = parseInt(setter["HP-ability-mod"], 10);
       //TAS.debug("calling parse hp with con mod of :" + hpMod);
       hpMap = parseNPChp(v["npc_hp_compendium"], hpMod);
       createHealthEntries(setter, abilityScores, isUndead, hpMap);

       //AC ************************************************
       acMap = parseNPCAC(v["ac_compendium"], v.CMD, abilityScores.dex.mod, sizeMap.size);
       createACEntries(setter, acMap, abilityScores, importantFeats, hpMap, bab);
       // Reach *******************************************
       //TAS.debug("about to find reach: " + v.reach_compendium);
       reachObj = parseReach(v.reach_compendium);
       if (reachObj) {
         setter.reach = reachObj.reach;
         if (reachObj.reachNotes) {
           setter["reach-notes"] = reachObj.reachNotes;
         }
       } else {
         reachObj = {};
         reachObj.reach = 5;
         reachObj.reachExceptions = [];
       }
       // Attacks *********************************************************
       parseAndCreateAttacks(setter, abilityScores, sizeMap, importantFeats, bab, attackGrid, reachObj, v);
       //TAS.debug("after parseAndCreateAttacks attrnum:" + _.size(setter));
       //special Attacks ***************************************************
       specialAttacks = parseSpecialAttacks(setter, v["npc-special-attacks"], attackGrid.cmb);
       if (specialAttacks && specialAttacks.length > 0) {
         attackArrays = _.groupBy(specialAttacks, 'specialtype');
         setter = createAttacks(attackArrays.attack, setter, attackGrid, abilityScores, importantFeats, null, null, sizeMap);
         specialAbilities = attackArrays.ability;
         //TAS.debug("after createSpecialAttackEntries attrnum:" + _.size(setter));
       }
       //spells***************************************************
       //TAS.debug("checking for spells");
       if (v["npc-spells-known-text"]) {
         //advance index
         spellcastingclass = 0;
         setter['use_spells']=1;
         //TAS.debug("has some spells");
         spellObj = parseSpells(v["npc-spells-known-text"]);
         //TAS.debug("the spells are:",spellObj);
         if (spellObj) {
           setter['use_spells']=1;
           casterObj = getCasterObj(spellObj, abilityScores, hpMap);
           //do not add caster levels to hit dice or it gets screwed up
           //setter = createClassEntries (setter,casterObj);
           setter = setCasterFields(setter, casterObj, spellcastingclass);
           setter = createSpellEntries(setter, spellObj, casterObj);
         }
       }
       //Spell-like-abilities***************************************************
       //TAS.debug("checking for SLAs");
       if (v["npc-spellike-ability-text"]) {
         SLAs = parseSLAs(v["npc-spellike-ability-text"]);
         if (SLAs) {
           //TAS.debug("the SLAs are:", SLAs);
           casterObj = getCasterObj(SLAs, abilityScores, hpMap, true);
           setter = createSLAEntries(setter, SLAs, casterObj);
         }
       }
 //TAS.debug("before parsing special abilities are:", specialAbilities);
       // content and special abilities ***************************
       if (v.content_compendium) {
         //TAS.debug("before parseSpecialAbilities attrnum:"+_.size(setter));
         specAbilObj = parseSpecialAbilities(v.content_compendium);

         //TAS.debug("returned from parse special ablities with", specAbilObj);
         if (specAbilObj) {
           if (specAbilObj.description && _.size(specAbilObj.description) > 0) {
             npcdesc = _.reduce(specAbilObj.description, function (memo, line) {
               memo += " ";
               memo += line;
               return memo;
             }, "");
             setter["character_description"] = npcdesc;
           }
           if (specAbilObj.specialAbilities) {
             specialAbilities = combineSpecialAbilities(specialAbilities, specAbilObj.specialAbilities);
           }
         } else {
           v['character-description']=v.content_compendium;
         }
         //TAS.debug("now special abilities are:", specialAbilities);
       }
       if (v.SQ_compendium) {
         //TAS.debug("found special qualities");
         specialQualities =  parseSpecialQualities(v.SQ_compendium);
         if (specialQualities){
           specialAbilities = combineSpecialAbilities(specialAbilities, specialQualities);
         }
       }
       if (specialAbilities && _.size(specialAbilities) > 0) {
         setter = createFeatureEntries(setter, specialAbilities, abilityScores);
         //look for sneak attack
         tempobj = _.find(specialAbilities,function(atkobj){return (/sneak.attack/i).test(atkobj.name);});
         if(tempobj){
           setter['global_precision_dmg_macro']='[[[[floor((@{level}+1)/2)]]d6]]';
           setter['global_precision_dmg_type']= tempobj.name;
         }

         //TAS.debug("after createFeatureEntries attrnum:" + _.size(setter));
       }

       // Misc *********************************************
       if (v.senses_compendium) {
         match = v.senses_compendium.match(/perception/i);
         if (match){
           setter["vision"] = v.senses_compendium.slice(0,match.index-1);
         } else {
           setter["vision"] = v.senses_compendium;
         }
       }
       if (v.speed_compendium) {
         speedMap = parseSpeed(v.speed_compendium);
         setter = createSpeedEntries(setter, speedMap, importantFeats);
       }
       if (v.alignment) {
         setter["alignment"] = v.alignment.toUpperCase();
       }
       if (v.space_compendium) {
         setter["space"] = parseSpace(v.space_compendium);
       }
       //TAS.debug("before skills attrnum:" + _.size(setter));
       // skills *********************************************************
       if (v.skills_compendium) {
         skillsMap = parseSkills(v.skills_compendium);
         classSkillArray = getCreatureClassSkills(v.type_compendium);
         if (v.racial_mods_compendium) {
           racialModsMap = parseSkillRacialBonuses(v.racial_mods_compendium);
         }
         if (skillsMap && _.size(skillsMap) > 0) {
           setter = createSkillEntries(setter, skillsMap, racialModsMap, abilityScores, importantFeats, classSkillArray, isUndead);
           //TAS.debug("after createSkillEntries attrnum:" + _.size(setter));
         }
       }
     } catch (err2) {
       TAS.error("importFromCompendium outer at end", err2);
     } finally {
       if (_.size(setter) > 0) {
         setter["npc_import_now"]=0;
         setter['npc-compimport-show']=0;
         TAS.info("##############################################","END OF importFromCompendium");
         TAS.debug("END OF importFromCompendium",setter);
         setAttrs(setter, PFConst.silentParams, done);
       } else {
         setter["npc_import_now"]=0;
         setter['npc-compimport-show']=0;
         setAttrs(setter, PFConst.silentParams, errorDone);
       }
     }
   });
 },
 registerEventHandlers = function () {
 };
 registerEventHandlers();
 console.log(PFLog.l + '   NPCParser module loaded        ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   importFromCompendium: importFromCompendium,
   importNPC: importFromCompendium
 };
}());
var HLImport = HLImport || (function() {
 'use strict';

 var parseNum = function(num)
 {
   if (_.isUndefined(num) || num === "")
     return 0;
   return (parseInt(num) || 0);
 },

 buildList = function(objArray, propName) { return _.map(objArray, function (item) { return item[propName]; }).join(", "); },

 getSizeMod = function(size)
 {
   switch(size.toLowerCase())
   {
     case "colossal":
       return -8;
       break;
     case "gargantuan":
       return -4;
       break
     case "huge":
       return -2;
       break;
     case "large":
       return -1;
       break;
     case "small":
       return 1;
       break;
     case "tiny":
       return 2;
       break;
     case "diminutive":
       return 4;
       break;
     case "fine":
       return 8;
       break;
     default:
       return 0;
   }
 },

 // Make sure "stuff" is an array
 arrayify = function(stuff)
 {
   if (_.isUndefined(stuff))
     return [];
   if (Array.isArray(stuff))
     return stuff;
   return new Array(stuff);
 },

 importInit = function(attrs,initObj)
 {
   attrs["init-misc"] = parseNum(initObj._total)-parseNum(initObj._attrtext);
   attrs["init-ability"] = "@{"+initObj._attrname.substr(0,3).toUpperCase()+"-mod}";
   attrs["init_notes"] = initObj.situationalmodifiers._text;
 },

 importAbilityScores = function(attrs,attributes)
 {
   attributes.forEach(function(abScore) {
     var abName = abScore._name.substr(0,3).toUpperCase();
     var base = parseNum(abScore.attrvalue._base);
     var modifier = parseNum(abScore.attrvalue._modified) - base;  // Modifier is the total difference between what HL is reporting as the character's base ability score and the final modified ability score
     attrs[abName+"-base"] = base;
     // If the modifier is positive, assume it's an enhancement bonus; otherwise, assume it's a penalty
     if (modifier > 0)
       attrs[abName+"-enhance"] = modifier;
     else
       attrs[abName+"-penalty"] = modifier;
   });
 },

 importSaves = function(attrs,saves)
 {
   // Since the XML doesn't break this down by class, add it all to class 0
   var i = 0;
   var saveNotes = saves.allsaves.situationalmodifiers._text;
   for (i = 0; i < saves.save.length; i++)
   {
     var save = saves.save[i];
     var abbr = save._abbr;

     attrs["class-0-"+abbr] = parseNum(save._base);
     attrs[abbr+"-resist"] = parseNum(save._fromresist);
     attrs[abbr+"-misc"] = parseNum(save._save)-parseNum(save._base)-parseNum(save._fromresist)-parseNum(save._fromattr);

     if (save.situationalmodifiers._text !== "" && saveNotes.indexOf(save.situationalmodifiers._text) === -1)
       saveNotes = saveNotes + "\n**"+abbr+":** " + save.situationalmodifiers._text;

   }
   attrs["Save-notes"] = saveNotes.trim();
 },

 // Find an existing repeatable item with the same name, or generate new row ID
 getOrMakeRowID = function(featIDList,name)
 {
   var attrNames = Object.values(featIDList);
   var rows = Object.keys(featIDList);

   var attrMatch = _.find(attrNames, function(currentAttrName)
   {
     var attrName = currentAttrName;
     // Eliminate anything in parentheses, dice expressions, and "x#" (we use that to indicate we've taken a feat more than once) before comparing names
     attrName = attrName.replace(/ x[0-9]+$/,"").trim();

     if (attrName === name)
     {
       var ID = rows[_.indexOf(attrNames,currentAttrName)];
       if (!_.isUndefined(ID))
         return true;
     }
     return false;
   });
   if (!_.isUndefined(attrMatch))
     return rows[_.indexOf(attrNames,attrMatch)];
   return generateRowID();
 },

 // Find an existing repeatable item with the same name, or generate new row ID; extra processing for items
 getOrMakeItemRowID = function(featIDList,name)
 {
   var attrNames = Object.values(featIDList);
   var rows = Object.keys(featIDList);

   var compareName = name.replace(/\(.*\)/,"").replace(/\+\d+/,"").toLowerCase().replace("masterwork","").trim();
   var attrMatch = _.find(attrNames, function(currentAttrName)
   {
     var attrName = currentAttrName;
     // Eliminate anything in parentheses, dice expressions, and "x#" (we use that to indicate we've taken a feat more than once) before comparing names
     attrName = attrName.replace(/\(.*\)/,"").replace(/\+\d+/,"").toLowerCase().replace("masterwork","").trim();

     if (attrName === compareName)
     {
       var ID = rows[_.indexOf(attrNames,currentAttrName)];
       if (!_.isUndefined(ID))
         return true;
     }
     return false;
   });
   if (!_.isUndefined(attrMatch))
     return rows[_.indexOf(attrNames,attrMatch)];
   return generateRowID();
 },

 // Find an existing repeatable item with the same name and spellclass, or generate new row ID
 getOrMakeSpellRowID = function(featIDList,name,spellclass)
 {
   var attrMatch = _.find(featIDList, function(currentFeat)
   {
     if (currentFeat.name === name && currentFeat.spellclass === spellclass)
       return true;
     return false;
   });
   if (!_.isUndefined(attrMatch))
     return attrMatch.rowID;
   return generateRowID();
 },

 getOrMakeClassRowID = function(featIDList,name)
 {
   var attrObjs = Object.values(featIDList);
   var rows = Object.keys(featIDList);

   var attrMatch = _.find(attrObjs, function(currentAttrObj)
   {
     var attrName = currentAttrObj.name;
     // Eliminate anything in parentheses, dice expressions, and "x#" (we use that to indicate we've taken a feat more than once) before comparing names
     name = name.replace(/\(.+\)/g,"").replace(/\d+d\d+(\+\d*)*/g,"").replace(/\+\d+/g,"").trim();
     attrName = attrName.replace(/\(.+\)/g,"").replace(/\d+d\d+(\+\d*)*/g,"").replace(/\+\d+/g,"").trim();

     if (attrName === name)
       return true;
     return false;
   });
   if (!_.isUndefined(attrMatch))
     return attrMatch.rowID;
   return generateRowID();
 },

 importFeats = function(attrs,feats,featIDList,resources)
 {
   var repeatPrefix = "repeating_ability";
   var skipList = [];
   var featNames = _.map(feats, function(feat) { return feat._name; } );
   _.each(feats, function(feat)
   {
     // Early exit if we already dealt with another copy of this feat
     if (_.contains(skipList,feat._name))
       return;

     // Count the number of times the feat is listed, so we can indicate that in the feat name
     var taken = _.filter(featNames,function(featName) { return featName === feat._name; } ).length;

     var row = getOrMakeRowID(featIDList,feat._name);
     if (!_.isUndefined(featIDList[row]))
       delete featIDList[row];

     if (taken > 1)
       attrs[repeatPrefix+"_"+row+"_name"] = feat._name + " x" + taken;
     else
       attrs[repeatPrefix+"_"+row+"_name"] = feat._name;
     attrs[repeatPrefix+"_"+row+"_description"] = feat.description;
     attrs[repeatPrefix+"_"+row+"_rule_category"] = "feats";
     skipList.push(feat._name);
     if (_.contains(Object.keys(resources),feat._name))
       attrs[repeatPrefix+"_"+row+"_max-calculation"] = resources[feat._name]._max;
   });
 },

 // Hero Lab stores armor and shields identically, so so assume anything with "shield" or "klar" in the name is a shield
 nameIsShield = function(name)
 {
   if (name.toLowerCase().indexOf("shield") !== -1 || name.toLowerCase().indexOf("klar") !== -1)
     return true;
   return false;
 },

 importItems = function(items,resources,armorPenalties,armor,weapons)
 {
   var repeatPrefix = "repeating_item";
   getSectionIDs(repeatPrefix, function(idarray) {
     var itemNameAttrs = _.union(_.map(idarray,function(id) { return repeatPrefix+"_"+id+"_name"; 		}),["shield3-acp","shield3-spell-fail"]);
     getAttrs(itemNameAttrs, function(names) {

       // Pull out the shield attributes before we build the ID list
       var shieldACP = parseNum(names["shield3-acp"]);
       var shieldASF = parseNum(names["shield3-spell-fail"]);
       if (!_.isUndefined(names["shield3-acp"]))
         delete names["shield3-acp"];
       if (!_.isUndefined(names["shield3-spell-fail"]))
         delete names["shield3-spell-fail"];

       var itemIDList = _.object(_.map(names,function(name,attr) {
         return [attr.substring(repeatPrefix.length+1,(attr.indexOf("_name"))),name];
       }));
       var itemsList = [];
       var attrs = {};
       var armorNames = _.map(armor, function(obj) { return obj._name; });
       var weaponNames = _.map(weapons, function(obj) { return obj._name; });

       // List of words that indicate an item is masterwork
       var masterworkWords = ["mithral","adamantine","angelskin","darkleaf","darkwood","dragonhide","eel","fire-forged","frost-forged","greenwood","paueliel"]
       _.each(items,function(item)
       {
         var row = getOrMakeItemRowID(itemIDList,item._name);
         if (!_.isUndefined(itemIDList[row]))
           delete itemIDList[row];
         itemsList.push(item._name);

         repeatPrefix = "repeating_item_" + row;
         attrs[repeatPrefix+"_name"] = item._name;
         attrs[repeatPrefix+"_item-weight"] = item.weight._value;
         attrs[repeatPrefix+"_value"] = (parseFloat(item.cost._value) / parseInt(item._quantity) );
         attrs[repeatPrefix+"_description"] = item.description;

         if (_.contains(Object.keys(resources),item._name) && item._quantity === "1" && resources[item._name]._max !== "1")
         {
           attrs[repeatPrefix+"_qty"] = resources[item._name]._left;
           attrs[repeatPrefix+"_qty_max"] = resources[item._name]._max;
         }
         else
           attrs[repeatPrefix+"_qty"] = item._quantity;

         if (!_.isUndefined(item.itempower))
           _.each(arrayify(item.itempower), function(itemPower) { itemsList.push(itemPower._name); });

         // check if this is a weapon
         var weaponCompareName = item._name;
         // If this is a shield (but not a klar), the attack name will be "Heavy/light shield bash"
         if (item._name.toLowerCase().indexOf("shield") !== -1)
         {
           var attackName;
           if (item._name.toLowerCase().indexOf("heavy" !== -1))
             attackName = "heavy shield bash";
           else
             attackName = "light shield bash";
           weaponCompareName = (_.find(weaponNames,function(name) { if (name.toLowerCase().indexOf(attackName) !== -1) return true; return false;}) || item._name);
         }
         if (_.contains(weaponNames, weaponCompareName))
         {
           var weaponObj = weapons[_.indexOf(weaponNames,weaponCompareName)];
           attrs[repeatPrefix+"_item-wpenhance"] = parseNum(weaponObj._name.match(/\+\d+/));

           if (!_.isUndefined(weaponObj._typetext))
             attrs[repeatPrefix+"_item-dmg-type"] = weaponObj._typetext;

           // Check to see if item name includes any words that indicate this is a masterwork item
           if ((weaponCompareName.toLowerCase().indexOf("masterwork") !== -1) || _.intersection(masterworkWords,item._name.toLowerCase().split(" ")).length > 0)
             attrs[repeatPrefix+"_item-masterwork"] = 1;

           if (!_.isUndefined(weaponObj._damage))
           {
             var weaponDice = weaponObj._damage.match(/\d+d\d+/);
             if (weaponDice.length > 0)
             {
               attrs[repeatPrefix+"_item-damage-dice-num"] = parseNum(weaponDice[0].split("d")[0]);
               attrs[repeatPrefix+"_item-damage-die"] = parseNum(weaponDice[0].split("d")[1]);
             }
           }

           if (!_.isUndefined(weaponObj._crit))
           {
             var critArray = weaponObj._crit.split("/");
             if (critArray.length > 1)
               attrs[repeatPrefix+"_item-crit-target"] = parseNum(critArray[0].match(/\d+/)[0]);
             else
               attrs[repeatPrefix+"_item-crit-target"] = 20;
             attrs[repeatPrefix+"_item-crit-multiplier"] = parseNum(critArray[critArray.length-1].replace(/\D/g,""));
           }

           if (!_.isUndefined(weaponObj.rangedattack) && !_.isUndefined(weaponObj.rangedattack._rangeincvalue))
             attrs[repeatPrefix+"_item-range"] = parseNum(weaponObj.rangedattack._rangeincvalue);
         }

         // check if this is armor
         // If this is a klar, the armor name will be different
         var armorCompareName = item._name;
         if (item._name.toLowerCase().indexOf("klar") !== -1)
         {
           armorCompareName = (_.find(armorNames,function(name) { if (name.toLowerCase().indexOf("klar") !== -1) return true; return false;}) || item._name);
         }
         if (_.contains(armorNames, armorCompareName))
         {
           var armorObj = armor[_.indexOf(armorNames,armorCompareName)];

           // Item is a shield
           if (nameIsShield(item._name))
           {
             var enhancement = parseNum(armorCompareName.match(/\+\d+/));
             var ACbonus  = parseNum(armorObj._ac) - enhancement;
             attrs[repeatPrefix+"_item-acbonus"] = ACbonus;
             attrs[repeatPrefix+"_item-acenhance"] = enhancement;
             if (!_.isUndefined(armorObj._equipped) && armorObj._equipped === "yes")
             {
               attrs[repeatPrefix+"_item-acp"] = shieldACP;
               attrs[repeatPrefix+"_item-spell-fail"] = shieldASF;
               attrs["shield3"] = item._name;
               attrs["shield3-acbonus"] = ACbonus;
               attrs["shield3-enhance"] = enhancement;
             }
           }
           else
           {
             var enhancement = parseNum(item._name.match(/\+\d+/));
             var ACbonus  = parseNum(armorObj._ac) - enhancement;
             attrs[repeatPrefix+"_item-acbonus"] = ACbonus;
             attrs[repeatPrefix+"_item-acenhance"] = enhancement;
             if (!_.isUndefined(armorObj._equipped) && armorObj._equipped === "yes")
             {
               attrs["armor3-acp"] = attrs[repeatPrefix+"_item-acp"] = armorPenalties.ACP - shieldACP;
               attrs["armor3-spell-fail"] = attrs[repeatPrefix+"_item-spell-fail"] = armorPenalties.spellfail - shieldASF;
               if (armorPenalties.maxDex == 99)
                 attrs["armor3-max-dex"] = attrs[repeatPrefix+"_item-max-dex"] = "";
               else
                 attrs["armor3-max-dex"] = attrs[repeatPrefix+"_item-max-dex"] = armorPenalties.maxDex;
               attrs["armor3"] = item._name;
               attrs["armor3-acbonus"] = ACbonus;
               attrs["armor3-enhance"] = enhancement;
             }
           }
         }
       });
       setAttrs(attrs);
     });
   });
 },

 importTraits = function(attrs,traits,traitIDList,resources)
 {
   var repeatPrefix = "repeating_ability";
   traits.forEach(function(trait)
   {
     var row = getOrMakeRowID(traitIDList,trait._name);
     if (!_.isUndefined(traitIDList[row]))
       delete traitIDList[row];
     attrs[repeatPrefix+"_"+row+"_name"] = trait._name;
     attrs[repeatPrefix+"_"+row+"_description"] = trait.description;
     attrs[repeatPrefix+"_"+row+"_rule_category"] = "traits";
     if (_.contains(Object.keys(resources),trait._name))
       attrs[repeatPrefix+"_"+row+"_max-calculation"] = resources[trait._name]._max;
   });
 },

 importSLAs = function(attrs,SLAs,SLAsIDList,resources)
 {
   var repeatPrefix = "repeating_ability";
   SLAs.forEach(function(SLA)
   {
     var row = getOrMakeRowID(SLAsIDList,SLA._name);
     if (!_.isUndefined(SLAsIDList[row]))
       delete SLAsIDList[row];
     attrs[repeatPrefix+"_"+row+"_name"] = SLA._name;
     attrs[repeatPrefix+"_"+row+"_description"] = SLA.description;
     attrs[repeatPrefix+"_"+row+"_rule_category"] = "spell-like-abilities";
     attrs[repeatPrefix+"_"+row+"_ability_type"] = "Sp";
     if (_.contains(Object.keys(resources),SLA._name))
       attrs[repeatPrefix+"_"+row+"_max-calculation"] = resources[SLA._name]._max;
   });
 },

 importFeatures = function(attrs,featureList,specials,archetypes,resources)
 {
   var specNameList = _.map(specials,function(special) { return special._name;});
   var skipList = [];
   _.each(specials, function(special)
   {
     var name = special._name;
     var repeatPrefix = "repeating_ability",row,classSource = -1;
     var cleanName = name.replace(/ x[0-9]+$/,"").replace(/\(([^\)]+)\)/g,"").trim();
     if (_.contains(skipList,cleanName))
       return;
     var multiList = _.filter(specNameList, function(spec) { return (spec.replace(/\(([^\)]+)\)/g,"").trim() === cleanName); });
     if (multiList.length > 1)
     {
       skipList.push(cleanName);
       var parenList = _.map(multiList, function(item) { return item.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")",""); });
       name = name.replace(/\(([^\)]+)\)/,"("+_.uniq(parenList).join(", ")+")");
     }
     row = getOrMakeClassRowID(featureList, name);
     repeatPrefix = "repeating_ability_" + row;
     if (!_.isUndefined(featureList[row]))
       delete featureList[row];
     else	// If we created a new row for this, set rule category
     {
       // Import if it has a "specsource", assume it's a class feature
       if (special.specsource)
         attrs[repeatPrefix+"_rule_category"] = "class-features";
       else
         attrs[repeatPrefix+"_rule_category"] = "racial-traits";
     }
     classSource = getClassSource(arrayify(special.specsource),archetypes);
     attrs[repeatPrefix+"_name"] = name;
     attrs[repeatPrefix+"_description"] = special.description;

     if (classSource !== -1)
     {
       attrs[repeatPrefix+"_CL-basis"] = "@{class-"+classSource+"-level}";
       attrs[repeatPrefix+"_class-name"] = Object.keys(archetypes)[classSource];
     }

     if (_.contains(Object.keys(resources),special._name))
       attrs[repeatPrefix+"_max-calculation"] = resources[special._name]._max;

     if (!_.isUndefined(special._type))
       attrs[repeatPrefix+"_ability_type"] = special._type.substr(0,2);
   });
 },

 importClasses = function(attrs, classes)
 {
   var classList = new Object();

   var i = 0;
   var classObj;
   while (i < classes.length)
   {
     classObj = classes[i];

     // We can only handle 5 classes
     if (i >= 5)
       return;
     classList[classObj._name.replace(/\(([^\)]+)\)/g,"").replace("(","").replace(")","").trim()] = classObj;
     attrs["class-"+i+"-name"] = classObj._name;
     attrs["class-"+i+"-level"] = classObj._level;

     i++;
   }

   return classList;
 },

 // Import spellclasses; presence in spellclasses node means it's a spellcaster, but some of the data is in the classes node
 importSpellClasses = function(attrs, spellclasses,classes,abScores)
 {
   var spellClassesList = new Object();

   var i, j, abMod = 0, currentAbMod, spellslots, spelllevel, casterlevel, concmod, spellpenmod;
   var spellClassIndex = 0;
   for (i = 0; i < spellclasses.length; i++)
   {
     var spellClass = spellclasses[i];
     // Only 3 spellclasses on character sheet, so if they somehow have more...
     if (spellClassIndex >= 3)
       return spellClassesList;

     var spellClassName = spellClass._name.replace(/\(([^\)]+)\)/g,"").replace("(","").replace(")","").trim();
     var classIndex = _.indexOf(Object.keys(classes),_.find(Object.keys(classes),function(className)
     {
       if (className.toLowerCase().indexOf(spellClassName.toLowerCase()) !== -1)
         return true;
       return false;
     }));

     if (classIndex !== -1)
     {
       casterlevel = parseNum(classes[spellClassName]._casterlevel);
       attrs["spellclass-"+spellClassIndex] = classIndex;
       attrs["spellclass-"+spellClassIndex+"-level-misc"] = casterlevel - parseNum(classes[spellClassName]._level);

       if (!_.isUndefined(classes[spellClassName].arcanespellfailure))
         attrs["armor3-spell-fail"] = parseNum(classes[spellClassName].arcanespellfailure._value);

       // Make a guess at which ability modifier is used for this class
       if (!_.isUndefined(classes[spellClassName]._basespelldc))
         abMod = parseNum(classes[spellClassName]._basespelldc) - 10;
       if (!_.isUndefined(classes[spellClassName]._basespelldc))
       {
         // Start at the fourth ability score (Intelligence), so we skip the physical abilities
         for (j = 3; j < abScores.length; j++)
         {
           if (parseNum(abScores[j].attrbonus._modified) === abMod)
           {
             var attr = {}
             attr["Concentration-"+spellClassIndex+"-ability"] = "@{"+abScores[j]._name.substr(0,3).toUpperCase()+"-mod}";
             setAttrs(attr);
             break;
           }
         }
       }

       if (abMod !== 0)
       {
         // Calculate misc mods to concentration
         if (!_.isUndefined(classes[spellClassName]._concentrationcheck))
         {
           concmod = parseNum(classes[spellClassName]._concentrationcheck) - casterlevel - abMod;
           attrs["Concentration-"+spellClassIndex+"-misc"] = concmod;
         }

         // Calculate misc mods to spell penetration
         if (!_.isUndefined(classes[spellClassName].overcomespellresistance))
         {
           spellpenmod = parseNum(classes[spellClassName].overcomespellresistance) - casterlevel;
           attrs["spellclass-"+spellClassIndex+"-SP_misc"] = spellpenmod;
         }

         // Populate spells / day; Hero Lab includes bonus slots, so remove those
         if (!_.isUndefined(spellclasses[i].spelllevel))
         {
           spellclasses[i].spelllevel = arrayify(spellclasses[i].spelllevel);
           for (j = 0; j < spellclasses[i].spelllevel.length; j++)
           {
             spellslots = parseNum(spellclasses[i].spelllevel[j]._maxcasts);
             spelllevel = parseNum(spellclasses[i].spelllevel[j]._level);
             if (spelllevel > 0)
               spellslots = spellslots - bonusSpellSlots(abMod,spelllevel);
             attrs["spellclass-"+spellClassIndex+"-level-"+spelllevel+"-class"] = spellslots;
           }
         }
       }
       spellClassesList[spellClassName] = classes[Object.keys(classes)[classIndex]];
       spellClassIndex++;
     }
   }

   return spellClassesList;
 },

 importSpells = function(spells,spellclasses)
 {
   console.log("Import spells");
   var repeatPrefix = "repeating_spells";
   getSectionIDs(repeatPrefix, function(idarray) {
     var spellNameAttrs = _.union(_.map(idarray,function(id) { return repeatPrefix+"_"+id+"_name"; 		}),_.map(idarray,function(id) { return repeatPrefix+"_"+id+"_spellclass_number"; 		}));
     getAttrs(spellNameAttrs, function(spellAttrs) {
       var spellObjList = {};
       var spellKeys = Object.keys(spellAttrs);
       _.each(spellKeys,function(spellKey) {
         var rowID;
         if (spellKey.indexOf("_name") !== -1)
         {
           rowID = spellKey.substring(repeatPrefix.length+1,(spellKey.indexOf("_name")));
           if (_.isUndefined(spellObjList[rowID]))
             spellObjList[rowID] = {rowID: rowID};
           spellObjList[rowID].name = spellAttrs[spellKey];
         }
         if (spellKey.indexOf("_spellclass_number") !== -1)
         {
           rowID = spellKey.substring(repeatPrefix.length+1,(spellKey.indexOf("_spellclass_number")));
           if (_.isUndefined(spellObjList[rowID]))
             spellObjList[rowID] = {rowID: rowID};
           spellObjList[rowID].spellclass = spellAttrs[spellKey];
         }
       });

       var spellClassesKeys = Object.keys(spellclasses);
       var attrs = {};
       _.each(spells, function(spell) {
         var rowID, spellClass, spellName, school, level;

         // Search for a repeating spell with the same name and spellclass; if not found, make new row
         level = parseNum(spell._level);
         repeatPrefix = "repeating_spells_";
         spellClass = _.indexOf(spellClassesKeys,spell._class);
         spellName = spell._name.replace(/\(x\d+\)/,"").trim();
         rowID = getOrMakeSpellRowID(spellObjList,spellName,spellClass);
         if (_.isUndefined(rowID))
         {
           console.log("Undefined spell row ID!");
           console.log(spell);
         }
         // Update prefix with ID
         repeatPrefix = repeatPrefix + rowID;

         attrs[repeatPrefix+"_name"] = spellName;
         attrs[repeatPrefix+"_spell_level"] = level;
         attrs[repeatPrefix+"_spellclass_number"] = spellClass;
         attrs[repeatPrefix+"_components"] = spell._componenttext.replace("Divine Focus", "DF").replace("Focus","F").replace("Material","M").replace("Verbal","V").replace("Somatic","S").replace(" or ","/");
         attrs[repeatPrefix+"_range"] = spell._range;
         attrs[repeatPrefix+"_duration"] = spell._duration;
         attrs[repeatPrefix+"_save"] = spell._save.replace(/DC \d+/,"").trim();
         attrs[repeatPrefix+"_cast-time"] = spell._casttime;
         attrs[repeatPrefix+"_sr"] = spell._resist.replace("harmless","Harmless");
         attrs[repeatPrefix+"_DC_misc"] = parseNum(spell._dc) - parseNum(spellclasses[(spell._class !== "") ? spell._class:Object.keys(spellclasses)[0]]._basespelldc) - level;

         if (spell._area !== "")
           attrs[repeatPrefix+"_targets"] = spell._area;
         else if (spell._effect !== "")
           attrs[repeatPrefix+"_targets"] = spell._effect;
         else
           attrs[repeatPrefix+"_targets"] = spell._target;

         school = spell._schooltext;
         if (spell._subschooltext !== "")
           school = school + " (" + spell._subschooltext + ")";
         if (spell._descriptortext !== "")
           school = school + " [" + spell._descriptortext + "]";
         attrs[repeatPrefix+"_school"] = school;

         attrs[repeatPrefix+"_description"] = spell.description;
       });
       setAttrs(attrs);
     });
   });
 },

 calcHitDice = function(hitdice)
 {
   var dice = hitdice.match(/\d+d\d/g);
   var numDice = 0;
   var i = 0;
   while (i < dice.length)
   {
     numDice += parseInt(dice[i].split("d")[0]);
     i++;
   }
   return numDice;
 },

 // Builds an object collection of archetypes, with the appropriate classes as the keys, in the order they're entered in the character sheet; use this to determine class specials come from
 buildArchetypeArray = function(classes)
 {
   var archetypes = new Object();

   _.each(classes, function (classObj, className) {
     if (classObj._name.indexOf("(") === -1)
     {
       archetypes[className] = [];
       return;
     }
     var archeString = classObj._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
     var archeList = archeString.split(",");
     archeList = _.map(archeList,function(arche) { return arche.trim(); });
     archetypes[className] = archeList;
   });
   return archetypes;
 },

 // Returns the array number of the class that grants a feature; returns -1 if we can't find the class
 getClassSource = function(sources,archetypes)
 {
   // If there's no listed source, it isn't from a class
   if (!sources.length)
     return -1;

   // Grab an array of class names from the archetypes object
   var classes = Object.keys(archetypes);

   // Check if source is a class, first
   var intersect = _.intersection(sources,classes);
   if (intersect.length)
     return classes.indexOf(intersect[0]);

   // If not a class, check for an archetype as a source, and return the associated class
   var className = _.find(classes, function(item) { return (_.intersection(archetypes[item],sources).length); });
   if (className)
     return classes.indexOf(className);

   return -1;
 },

 bonusSpellSlots = function(abilMod,spellLevel) { return Math.max(0, Math.floor((abilMod + 4 - spellLevel) / 4)); },

 importSkills = function(attrs,skills,size,ACP)
 {
   // Ripped from the PF character sheet JS
   var skillSize;
   switch (Math.abs(size)){
     case 0: skillSize=0;break;
     case 1: skillSize=2;break;
     case 2: skillSize=4;break;
     case 4: skillSize=6;break;
     case 8: skillSize=8;break;
     case 16: skillSize=10;break;
     default: skillSize=0;
   }
   if(size<0) {skillSize=skillSize*-1;}

   // Clear out all existing skills data
   _.extend(attrs, { "acrobatics-ability":"", "acrobatics-cs":"", "acrobatics-ranks":"", "acrobatics-class":"", "acrobatics-ability-mod":"", "acrobatics-racial":"", "acrobatics-feat":"", "acrobatics-item":"", "acrobatics-size":"", "acrobatics-acp":"", "acrobatics-misc":"", "acrobatics-reqtrain":"", "artistry-ability":"", "artistry-cs":"", "artistry-ranks":"", "artistry-class":"", "artistry-ability-mod":"", "artistry-racial":"", "artistry-feat":"", "artistry-item":"", "artistry-size":"", "artistry-acp":"", "artistry-misc":"", "artistry-reqtrain":"", "artistry2-ability":"", "artistry2-cs":"", "artistry2-ranks":"", "artistry2-class":"", "artistry2-ability-mod":"", "artistry2-racial":"", "artistry2-feat":"", "artistry2-item":"", "artistry2-size":"", "artistry2-acp":"", "artistry2-misc":"", "artistry2-reqtrain":"", "artistry3-ability":"", "artistry3-cs":"", "artistry3-ranks":"", "artistry3-class":"", "artistry3-ability-mod":"", "artistry3-racial":"", "artistry3-feat":"", "artistry3-item":"", "artistry3-size":"", "artistry3-acp":"", "artistry3-misc":"", "artistry3-reqtrain":"", "appraise-ability":"", "appraise-cs":"", "appraise-ranks":"", "appraise-class":"", "appraise-ability-mod":"", "appraise-racial":"", "appraise-feat":"", "appraise-item":"", "appraise-size":"", "appraise-acp":"", "appraise-misc":"", "appraise-reqtrain":"", "bluff-ability":"", "bluff-cs":"", "bluff-ranks":"", "bluff-class":"", "bluff-ability-mod":"", "bluff-racial":"", "bluff-feat":"", "bluff-item":"", "bluff-size":"", "bluff-acp":"", "bluff-misc":"", "bluff-reqtrain":"", "climb-ability":"", "climb-cs":"", "climb-ranks":"", "climb-class":"", "climb-ability-mod":"", "climb-racial":"", "climb-feat":"", "climb-item":"", "climb-size":"", "climb-acp":"", "climb-misc":"", "climb-reqtrain":"", "craft-ability":"", "craft-cs":"", "craft-ranks":"", "craft-class":"", "craft-ability-mod":"", "craft-racial":"", "craft-feat":"", "craft-item":"", "craft-size":"", "craft-acp":"", "craft-misc":"", "craft-reqtrain":"", "craft2-ability":"", "craft2-cs":"", "craft2-ranks":"", "craft2-class":"", "craft2-ability-mod":"", "craft2-racial":"", "craft2-feat":"", "craft2-item":"", "craft2-size":"", "craft2-acp":"", "craft2-misc":"", "craft2-reqtrain":"", "craft3-ability":"", "craft3-cs":"", "craft3-ranks":"", "craft3-class":"", "craft3-ability-mod":"", "craft3-racial":"", "craft3-feat":"", "craft3-item":"", "craft3-size":"", "craft3-acp":"", "craft3-misc":"", "craft3-reqtrain":"", "diplomacy-ability":"", "diplomacy-cs":"", "diplomacy-ranks":"", "diplomacy-class":"", "diplomacy-ability-mod":"", "diplomacy-racial":"", "diplomacy-feat":"", "diplomacy-item":"", "diplomacy-size":"", "diplomacy-acp":"", "diplomacy-misc":"", "diplomacy-reqtrain":"", "disable-device-ability":"", "disable-device-cs":"", "disable-device-ranks":"", "disable-device-class":"", "disable-device-ability-mod":"", "disable-device-racial":"", "disable-device-feat":"", "disable-device-item":"", "disable-device-size":"", "disable-device-acp":"", "disable-device-misc":"", "disable-device-reqtrain":"", "disguise-ability":"", "disguise-cs":"", "disguise-ranks":"", "disguise-class":"", "disguise-ability-mod":"", "disguise-racial":"", "disguise-feat":"", "disguise-item":"", "disguise-size":"", "disguise-acp":"", "disguise-misc":"", "disguise-reqtrain":"", "escape-artist-ability":"", "escape-artist-cs":"", "escape-artist-ranks":"", "escape-artist-class":"", "escape-artist-ability-mod":"", "escape-artist-racial":"", "escape-artist-feat":"", "escape-artist-item":"", "escape-artist-size":"", "escape-artist-acp":"", "escape-artist-misc":"", "escape-artist-reqtrain":"", "fly-ability":"", "fly-cs":"", "fly-ranks":"", "fly-class":"", "fly-ability-mod":"", "fly-racial":"", "fly-feat":"", "fly-item":"", "fly-size":"", "fly-acp":"", "fly-misc":"", "fly-reqtrain":"", "handle-animal-ability":"", "handle-animal-cs":"", "handle-animal-ranks":"", "handle-animal-class":"", "handle-animal-ability-mod":"", "handle-animal-racial":"", "handle-animal-feat":"", "handle-animal-item":"", "handle-animal-size":"", "handle-animal-acp":"", "handle-animal-misc":"", "handle-animal-reqtrain":"", "heal-ability":"", "heal-cs":"", "heal-ranks":"", "heal-class":"", "heal-ability-mod":"", "heal-racial":"", "heal-feat":"", "heal-item":"", "heal-size":"", "heal-acp":"", "heal-misc":"", "heal-reqtrain":"", "intimidate-ability":"", "intimidate-cs":"", "intimidate-ranks":"", "intimidate-class":"", "intimidate-ability-mod":"", "intimidate-racial":"", "intimidate-feat":"", "intimidate-item":"", "intimidate-size":"", "intimidate-acp":"", "intimidate-misc":"", "intimidate-reqtrain":"", "linguistics-ability":"", "linguistics-cs":"", "linguistics-ranks":"", "linguistics-class":"", "linguistics-ability-mod":"", "linguistics-racial":"", "linguistics-feat":"", "linguistics-item":"", "linguistics-size":"", "linguistics-acp":"", "linguistics-misc":"", "linguistics-reqtrain":"", "lore-ability":"", "lore-cs":"", "lore-ranks":"", "lore-class":"", "lore-ability-mod":"", "lore-racial":"", "lore-feat":"", "lore-item":"", "lore-size":"", "lore-acp":"", "lore-misc":"", "lore-reqtrain":"", "lore2-ability":"", "lore2-cs":"", "lore2-ranks":"", "lore2-class":"", "lore2-ability-mod":"", "lore2-racial":"", "lore2-feat":"", "lore2-item":"", "lore2-size":"", "lore2-acp":"", "lore2-misc":"", "lore2-reqtrain":"", "lore3-ability":"", "lore3-cs":"", "lore3-ranks":"", "lore3-class":"", "lore3-ability-mod":"", "lore3-racial":"", "lore3-feat":"", "lore3-item":"", "lore3-size":"", "lore3-acp":"", "lore3-misc":"", "lore3-reqtrain":"", "knowledge-arcana-ability":"", "knowledge-arcana-cs":"", "knowledge-arcana-ranks":"", "knowledge-arcana-class":"", "knowledge-arcana-ability-mod":"", "knowledge-arcana-racial":"", "knowledge-arcana-feat":"", "knowledge-arcana-item":"", "knowledge-arcana-size":"", "knowledge-arcana-acp":"", "knowledge-arcana-misc":"", "knowledge-arcana-reqtrain":"", "knowledge-dungeoneering-ability":"", "knowledge-dungeoneering-cs":"", "knowledge-dungeoneering-ranks":"", "knowledge-dungeoneering-class":"", "knowledge-dungeoneering-ability-mod":"", "knowledge-dungeoneering-racial":"", "knowledge-dungeoneering-feat":"", "knowledge-dungeoneering-item":"", "knowledge-dungeoneering-size":"", "knowledge-dungeoneering-acp":"", "knowledge-dungeoneering-misc":"", "knowledge-dungeoneering-reqtrain":"", "knowledge-engineering-ability":"", "knowledge-engineering-cs":"", "knowledge-engineering-ranks":"", "knowledge-engineering-class":"", "knowledge-engineering-ability-mod":"", "knowledge-engineering-racial":"", "knowledge-engineering-feat":"", "knowledge-engineering-item":"", "knowledge-engineering-size":"", "knowledge-engineering-acp":"", "knowledge-engineering-misc":"", "knowledge-engineering-reqtrain":"", "knowledge-geography-ability":"", "knowledge-geography-cs":"", "knowledge-geography-ranks":"", "knowledge-geography-class":"", "knowledge-geography-ability-mod":"", "knowledge-geography-racial":"", "knowledge-geography-feat":"", "knowledge-geography-item":"", "knowledge-geography-size":"", "knowledge-geography-acp":"", "knowledge-geography-misc":"", "knowledge-geography-reqtrain":"", "knowledge-history-ability":"", "knowledge-history-cs":"", "knowledge-history-ranks":"", "knowledge-history-class":"", "knowledge-history-ability-mod":"", "knowledge-history-racial":"", "knowledge-history-feat":"", "knowledge-history-item":"", "knowledge-history-size":"", "knowledge-history-acp":"", "knowledge-history-misc":"", "knowledge-history-reqtrain":"", "knowledge-local-ability":"", "knowledge-local-cs":"", "knowledge-local-ranks":"", "knowledge-local-class":"", "knowledge-local-ability-mod":"", "knowledge-local-racial":"", "knowledge-local-feat":"", "knowledge-local-item":"", "knowledge-local-size":"", "knowledge-local-acp":"", "knowledge-local-misc":"", "knowledge-local-reqtrain":"", "knowledge-nature-ability":"", "knowledge-nature-cs":"", "knowledge-nature-ranks":"", "knowledge-nature-class":"", "knowledge-nature-ability-mod":"", "knowledge-nature-racial":"", "knowledge-nature-feat":"", "knowledge-nature-item":"", "knowledge-nature-size":"", "knowledge-nature-acp":"", "knowledge-nature-misc":"", "knowledge-nature-reqtrain":"", "knowledge-nobility-ability":"", "knowledge-nobility-cs":"", "knowledge-nobility-ranks":"", "knowledge-nobility-class":"", "knowledge-nobility-ability-mod":"", "knowledge-nobility-racial":"", "knowledge-nobility-feat":"", "knowledge-nobility-item":"", "knowledge-nobility-size":"", "knowledge-nobility-acp":"", "knowledge-nobility-misc":"", "knowledge-nobility-reqtrain":"", "knowledge-planes-ability":"", "knowledge-planes-cs":"", "knowledge-planes-ranks":"", "knowledge-planes-class":"", "knowledge-planes-ability-mod":"", "knowledge-planes-racial":"", "knowledge-planes-feat":"", "knowledge-planes-item":"", "knowledge-planes-size":"", "knowledge-planes-acp":"", "knowledge-planes-misc":"", "knowledge-planes-reqtrain":"", "knowledge-religion-ability":"", "knowledge-religion-cs":"", "knowledge-religion-ranks":"", "knowledge-religion-class":"", "knowledge-religion-ability-mod":"", "knowledge-religion-racial":"", "knowledge-religion-feat":"", "knowledge-religion-item":"", "knowledge-religion-size":"", "knowledge-religion-acp":"", "knowledge-religion-misc":"", "knowledge-religion-reqtrain":"", "perception-ability":"", "perception-cs":"", "perception-ranks":"", "perception-class":"", "perception-ability-mod":"", "perception-racial":"", "perception-feat":"", "perception-item":"", "perception-size":"", "perception-acp":"", "perception-misc":"", "perception-reqtrain":"", "perform-ability":"", "perform-cs":"", "perform-ranks":"", "perform-class":"", "perform-ability-mod":"", "perform-racial":"", "perform-feat":"", "perform-item":"", "perform-size":"", "perform-acp":"", "perform-misc":"", "perform-reqtrain":"", "perform2-ability":"", "perform2-cs":"", "perform2-ranks":"", "perform2-class":"", "perform2-ability-mod":"", "perform2-racial":"", "perform2-feat":"", "perform2-item":"", "perform2-size":"", "perform2-acp":"", "perform2-misc":"", "perform2-reqtrain":"", "perform3-ability":"", "perform3-cs":"", "perform3-ranks":"", "perform3-class":"", "perform3-ability-mod":"", "perform3-racial":"", "perform3-feat":"", "perform3-item":"", "perform3-size":"", "perform3-acp":"", "perform3-misc":"", "perform3-reqtrain":"", "profession-ability":"", "profession-cs":"", "profession-ranks":"", "profession-class":"", "profession-ability-mod":"", "profession-racial":"", "profession-feat":"", "profession-item":"", "profession-size":"", "profession-acp":"", "profession-misc":"", "profession-reqtrain":"", "profession2-ability":"", "profession2-cs":"", "profession2-ranks":"", "profession2-class":"", "profession2-ability-mod":"", "profession2-racial":"", "profession2-feat":"", "profession2-item":"", "profession2-size":"", "profession2-acp":"", "profession2-misc":"", "profession2-reqtrain":"", "profession3-ability":"", "profession3-cs":"", "profession3-ranks":"", "profession3-class":"", "profession3-ability-mod":"", "profession3-racial":"", "profession3-feat":"", "profession3-item":"", "profession3-size":"", "profession3-acp":"", "profession3-misc":"", "profession3-reqtrain":"", "ride-ability":"", "ride-cs":"", "ride-ranks":"", "ride-class":"", "ride-ability-mod":"", "ride-racial":"", "ride-feat":"", "ride-item":"", "ride-size":"", "ride-acp":"", "ride-misc":"", "ride-reqtrain":"", "sense-motive-ability":"", "sense-motive-cs":"", "sense-motive-ranks":"", "sense-motive-class":"", "sense-motive-ability-mod":"", "sense-motive-racial":"", "sense-motive-feat":"", "sense-motive-item":"", "sense-motive-size":"", "sense-motive-acp":"", "sense-motive-misc":"", "sense-motive-reqtrain":"", "sleight-of-hand-ability":"", "sleight-of-hand-cs":"", "sleight-of-hand-ranks":"", "sleight-of-hand-class":"", "sleight-of-hand-ability-mod":"", "sleight-of-hand-racial":"", "sleight-of-hand-feat":"", "sleight-of-hand-item":"", "sleight-of-hand-size":"", "sleight-of-hand-acp":"", "sleight-of-hand-misc":"", "sleight-of-hand-reqtrain":"", "spellcraft-ability":"", "spellcraft-cs":"", "spellcraft-ranks":"", "spellcraft-class":"", "spellcraft-ability-mod":"", "spellcraft-racial":"", "spellcraft-feat":"", "spellcraft-item":"", "spellcraft-size":"", "spellcraft-acp":"", "spellcraft-misc":"", "spellcraft-reqtrain":"", "stealth-ability":"", " stealth-cs":"", "stealth-ranks":"", "stealth-class":"", "stealth-ability-mod":"", "stealth-racial":"", "stealth-feat":"", "stealth-item":"", "stealth-size":"", "stealth-acp":"", "stealth-misc":"", "stealth-reqtrain":"", "survival-ability":"", "survival-cs":"", "survival-ranks":"", "survival-class":"", "survival-ability-mod":"", "survival-racial":"", "survival-feat":"", "survival-item":"", "survival-size":"", "survival-acp":"", "survival-misc":"", "survival-reqtrain":"", "swim-ability":"", "swim-cs":"", "swim-ranks":"", "swim-class":"", "swim-ability-mod":"", "swim-racial":"", "swim-feat":"", "swim-item":"", "swim-size":"", "swim-acp":"", "swim-misc":"", "swim-reqtrain":"", "use-magic-device-ability":"", "use-magic-device-cs":"", "use-magic-device-ranks":"", "use-magic-device-class":"", "use-magic-device-ability-mod":"", "use-magic-device-racial":"", "use-magic-device-feat":"", "use-magic-device-item":"", "use-magic-device-size":"", "use-magic-device-acp":"", "use-magic-device-misc":"", "use-magic-device-reqtrain":"", "misc-skill-0-ability":"", "misc-skill-0-cs":"", "misc-skill-0-ranks":"", "misc-skill-0-class":"", "misc-skill-0-ability-mod":"", "misc-skill-0-racial":"", "misc-skill-0-feat":"", "misc-skill-0-item":"", "misc-skill-0-size":"", "misc-skill-0-acp":"", "misc-skill-0-misc":"", "misc-skill-0-reqtrain":"", "misc-skill-1-ability":"", "misc-skill-1-cs":"", "misc-skill-1-ranks":"", "misc-skill-1-class":"", "misc-skill-1-ability-mod":"", "misc-skill-1-racial":"", "misc-skill-1-feat":"", "misc-skill-1-item":"", "misc-skill-1-size":"", "misc-skill-1-acp":"", "misc-skill-1-misc":"", "misc-skill-1-reqtrain":"", "misc-skill-2-ability":"", "misc-skill-2-cs":"", "misc-skill-2-ranks":"", "misc-skill-2-class":"", "misc-skill-2-ability-mod":"", "misc-skill-2-racial":"", "misc-skill-2-feat":"", "misc-skill-2-item":"", "misc-skill-2-size":"", "misc-skill-2-acp":"", "misc-skill-2-misc":"", "misc-skill-2-reqtrain":"", "misc-skill-3-ability":"", "misc-skill-3-cs":"", "misc-skill-3-ranks":"", "misc-skill-3-class":"", "misc-skill-3-ability-mod":"", "misc-skill-3-racial":"", "misc-skill-3-feat":"", "misc-skill-3-item":"", "misc-skill-3-size":"", "misc-skill-3-acp":"", "misc-skill-3-misc":"", "misc-skill-3-reqtrain":"", "misc-skill-4-ability":"", "misc-skill-4-cs":"", "misc-skill-4-ranks":"", "misc-skill-4-class":"", "misc-skill-4-ability-mod":"", "misc-skill-4-racial":"", "misc-skill-4-feat":"", "misc-skill-4-item":"", "misc-skill-4-size":"", "misc-skill-4-acp":"", "misc-skill-4-misc":"", "misc-skill-4-reqtrain":"", "misc-skill-5-ability":"", "misc-skill-5-cs":"", "misc-skill-5-ranks":"", "misc-skill-5-class":"", "misc-skill-5-ability-mod":"", "misc-skill-5-racial":"", "misc-skill-5-feat":"", "misc-skill-5-item":"", "misc-skill-5-size":"", "misc-skill-5-acp":"", "misc-skill-5-misc":"", "misc-skill-5-reqtrain":"", "craft-name":"", "craft2-name":"", "craft3-name":"", "lore-name":"", "perform-name":"", "perform2-name":"", "perform3-name":"", "profession-name":"", "profession2-name":"", "profession3-name":"", "misc-skill-0-name":"", "misc-skill-1-name":"", "misc-skill-2-name":"", "misc-skill-3-name":"", "misc-skill-4-name":"", "misc-skill-5-name":"" });

   // Keep track of which of these skills we're on
   var craft = 1;
   var perform = 1;
   var profession = 1;
   var artistry = 1;
   var lore = 1;
   var misc = 0;

   var i = 0;
   var skill;
   var skillMisc;
   var skillAttrPrefix;
   for (i = 0; i < skills.length; i++)
   {
     /*if (_.isUndefined(skill._name))
     {
       continue;
     }*/
     skill = skills[i];
     console.log(skill._name);
     // Figure out where we're putting this skill on the character sheet
     if (skill._name.indexOf("Craft") !== -1)
     {
       if (craft === 1)
       {
         skillAttrPrefix = "craft";
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
           attrs["craft-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         craft++;
       }
       else if (craft <= 3)
       {
         skillAttrPrefix = "craft" + craft;
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
           attrs["craft"+craft+"-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         craft++;
       }
       else
       {
         if (misc <= 5)
         {
           skillAttrPrefix = "misc-skill-" + misc;
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
             attrs[skillAttrPrefix+"-name"] = skill._name;
           misc++;
         }
         else
           console.log("Ran out of misc skills for " + skill._name + "!");
       }
     }
     else if (skill._name.indexOf("Perform") !== -1)
     {
       if (perform === 1)
       {
         skillAttrPrefix = "perform";
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
           attrs["perform-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         perform++;
       }
       else if (perform <= 3)
       {
         skillAttrPrefix = "perform" + perform;
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
           attrs["perform"+perform+"-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         perform++;
       }
       else
       {
         if (misc <= 5)
         {
           skillAttrPrefix = "misc-skill-" + misc;
           if (skill._name.match(/\(([^\)]+)\)/) !== null)
             attrs[skillAttrPrefix+"-name"] = skill._name;
           misc++;
         }
         else
           console.log("Ran out of misc skills for " + skill._name + "!");
       }
     }
     else if (skill._name.indexOf("Profession") !== -1)
     {
       if (profession === 1)
       {
         skillAttrPrefix = "profession";
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
           attrs["profession-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         profession++;
       }
       else if (profession <= 3)
       {
         skillAttrPrefix = "profession" + profession;
         if (skill._name.match(/\(([^\)]+)\)/) !== null)
           attrs["profession"+profession+"-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         profession++;
       }
       else
       {
         if (misc <= 5)
         {
           skillAttrPrefix = "misc-skill-" + misc;
           if (skill._name.match(/\(([^\)]+)\)/) !== null)
             attrs[skillAttrPrefix+"-name"] = skill._name;
           misc++;
         }
         else
           console.log("Ran out of misc skills for " + skill._name + "!");
       }
     }
     else if (skill._name.indexOf("Knowledge") !== -1)
     {
       switch(skill._name.match(/\(([^\)]+)\)/g)[0])
       {
         case "(arcana)":
         case "(dungeoneering)":
         case "(engineering)":
         case "(geography)":
         case "(history)":
         case "(local)":
         case "(nature)":
         case "(nobility)":
         case "(planes)":
         case "(religion)":
           skillAttrPrefix = skill._name.toLowerCase().replace(/\s/g,"-").replace("(","").replace(")","");
           break;
         default:
           skillAttrPrefix = "misc-skill-" + misc;
           attrs[skillAttrPrefix+"-name"] = skill._name;
           misc++;
       }
     }
     else if (skill._name.indexOf("Artistry") !== -1)
     {
       if (artistry === 1)
       {
         skillAttrPrefix = "artistry";
         attrs["artistry-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         artistry++;
       }
       else if (artistry <= 3)
       {
         skillAttrPrefix = "artistry" + artistry;
         attrs["artistry"+artistry+"-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         artistry++;
       }
       else
       {
         if (misc <= 5)
         {
           skillAttrPrefix = "misc-skill-" + misc;
           attrs[skillAttrPrefix+"-name"] = skill._name;
           misc++;
         }
         else
           console.log("Ran out of misc skills for " + skill._name + "!");
       }
     }
     else if (skill._name.indexOf("Lore") !== -1)
     {
       if (lore === 1)
       {
         skillAttrPrefix = "lore";
         attrs["lore-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         lore++;
       }
       else if (lore <= 3)
       {
         skillAttrPrefix = "lore" + lore;
         attrs["lore"+lore+"-name"] = skill._name.match(/\(([^\)]+)\)/)[0].replace("(","").replace(")","");
         lore++;
       }
       else
       {
         if (misc <= 5)
         {
           skillAttrPrefix = "misc-skill-" + misc;
           attrs[skillAttrPrefix+"-name"] = skill._name;
           misc++;
         }
         else
           console.log("Ran out of misc skills for " + skill._name + "!");
       }
     }
     else
       skillAttrPrefix = skill._name.toLowerCase().replace(/\s/g,"-").replace("(","").replace(")","").replace("-hand","-Hand").replace("e-device","e-Device").replace("-artist","-Artist").replace("-animal","-Animal");

     attrs[skillAttrPrefix+"-ranks"] = parseNum(skill._ranks);
     attrs[skillAttrPrefix+"-ability"] = "@{"+skill._attrname+"-mod}";

     if (skill._classskill === "yes") attrs[skillAttrPrefix+"-cs"] = 3;

     skillMisc = parseNum(skill._value) - parseNum(skill._ranks)- parseNum(skill._attrbonus);
     if (parseNum(skill._ranks) != 0 && skill._classskill === "yes")
       skillMisc -= 3;
     if (skill._armorcheck === "yes")
       skillMisc -= ACP;
     if (skill._name === "Fly")
       skillMisc -= skillSize;
     if (skill._name === "Stealth")
       skillMisc -= (2 * skillSize);
     attrs[skillAttrPrefix+"-misc"] = skillMisc;

     if (skill._trainedonly === "yes") attrs[skillAttrPrefix+"-ReqTrain"] = 1;

     // Add situation modifiers to the macro
     if (!_.isUndefined(skill.situationalmodifiers.situationalmodifier))
     {
       var macro = "@{PC-whisper} &{template:pf_generic} {{color=@{rolltemplate_color}}} {{header_image=@{header_image-pf_generic-skill}}} @{toggle_rounded_flag} {{character_name=@{character_name}}} {{character_id=@{character_id}}} {{subtitle}} {{name="+skill._name+"}} {{Check=[[ @{skill-query} + [[ @{"+skillAttrPrefix+"} ]] ]]}}";
       skill.situationalmodifiers.situationalmodifier = arrayify(skill.situationalmodifiers.situationalmodifier);
       var j = 0;
       while (j < skill.situationalmodifiers.situationalmodifier.length)
       {
         macro = macro + " {{" + skill.situationalmodifiers.situationalmodifier[j]._source + "=" + skill.situationalmodifiers.situationalmodifier[j]._text+"}}"
         j++;
       }
       attrs[skillAttrPrefix+"-macro"] = macro;
     }
   }
 },

 // Import ACP and Max Dex; these aren't included under items, but the final values are listed in penalties
 importPenalties = function(attrs,penalties)
 {
   var ACP = 0;
   var i = 0;
   while (i < penalties.length)
   {
     if (penalties[i]._name === "Armor Check Penalty")
     {
       ACP = parseNum(penalties[i]._value);
       attrs["armor3-acp"] = ACP;
     }
     else if (penalties[i]._name === "Max Dex Bonus")
       attrs["armor3-max-dex"] = Math.min(99, parseNum(penalties[i]._value));	// Hero Lab uses 1000 for Max Dex when player doesn't have one; cap it at 99 to match sheet default
     i++;
   }
   return ACP;
 },

 importAC = function(attrs,acObj)
 {
   attrs["AC-natural"] = parseNum(acObj._fromnatural);
   attrs["AC-deflect"] = parseNum(acObj._fromdeflect);
   attrs["AC-dodge"] = parseNum(acObj._fromdodge);

   // Are we replacing Dex to AC with something else?
   if (acObj._fromdexterity === "")
   {
     if (acObj._fromcharisma !== "")
     {
       attrs["AC-ability"] = "( ((@{CHA-mod} + [[ @{max-dex-source} ]]) - abs(@{CHA-mod} - [[ @{max-dex-source} ]])) / 2 )";
       attrs["AC-misc"] = parseNum(acObj._ac) - 10 - parseNum(acObj._fromarmor) - parseNum(acObj._fromshield) - parseNum(acObj._fromcharisma) - parseNum(acObj._fromsize) - parseNum(acObj._fromnatural) - parseNum(acObj._fromdeflect) - parseNum(acObj._fromdodge);
     }
     else if (acObj._fromwisdom !== "")
     {
       attrs["AC-ability"] = "( ((@{WIS-mod} + [[ @{max-dex-source} ]]) - abs(@{WIS-mod} - [[ @{max-dex-source} ]])) / 2 )";
       attrs["AC-misc"] = parseNum(acObj._ac) - 10 - parseNum(acObj._fromarmor) - parseNum(acObj._fromshield) - parseNum(acObj._fromwisdom) - parseNum(acObj._fromsize) - parseNum(acObj._fromnatural) - parseNum(acObj._fromdeflect) - parseNum(acObj._fromdodge);
     }
     else
       attrs["AC-misc"] = parseNum(acObj._ac) - 10 - parseNum(acObj._fromarmor) - parseNum(acObj._fromshield) - parseNum(acObj._fromdexterity) - parseNum(acObj._fromsize) - parseNum(acObj._fromnatural) - parseNum(acObj._fromdeflect) - parseNum(acObj._fromdodge);
   }
 },

 importCharacter = function(characterObj)
 {
   var attrs = {};

   importAbilityScores(attrs,characterObj.attributes.attribute);
   importSaves(attrs,characterObj.saves);
   var classes, spellClasses, archetypes = {};
   // Class objects won't exist for creatures w/o class levels, such as animals
   if (!_.isUndefined(characterObj.classes.class))
   {
     // Class will be an array if multiclassed, but a single object if single-classed; make it an array, just to be safe
     characterObj.classes.class = arrayify(characterObj.classes.class);

     classes = importClasses(attrs, characterObj.classes.class);

     // If any of the character's classes is a spellcaster, it'll be listed here, too
     if (!_.isUndefined(characterObj.spellclasses.spellclass))
     {
       characterObj.spellclasses.spellclass = arrayify(characterObj.spellclasses.spellclass);
       spellClasses = importSpellClasses(attrs, characterObj.spellclasses.spellclass,classes,characterObj.attributes.attribute);

       // Well, it's a spellcaster, so let's import those spells, too!
       var spellsArray = arrayify(characterObj.spellsknown.spell).concat(arrayify(characterObj.spellbook.spell)).concat(arrayify(characterObj.spellsmemorized.spell));
       var spellNames = [];
       spellsArray = _.reject(spellsArray,function(spell) { if (_.contains(spellNames,spell._name)) return true; spellNames.concat(spell._name); return false; });
       importSpells(spellsArray,spellClasses);
       /*if (!_.isUndefined(characterObj.spellsknown.spell))
       {
         characterObj.spellsknown.spell = arrayify(characterObj.spellsknown.spell);
         importSpells(characterObj.spellsknown.spell,spellClasses);
       }
       if (!_.isUndefined(characterObj.spellbook.spell))
       {
         characterObj.spellbook.spell = arrayify(characterObj.spellbook.spell);
         importSpells(characterObj.spellbook.spell,spellClasses);
       }
       if (!_.isUndefined(characterObj.spellsmemorized.spell))
       {
         characterObj.spellsmemorized.spell = arrayify(characterObj.spellsmemorized.spell);
         importSpells(characterObj.spellsmemorized.spell,spellClasses);
       }*/
     }

     // Need to keep track of what archetypes the character has, since class feature source could be an archetype
     archetypes = buildArchetypeArray(classes);
   }

   importAC(attrs,characterObj.armorclass);
   characterObj.penalties.penalty = arrayify(characterObj.penalties.penalty);
   var ACP = importPenalties(attrs,characterObj.penalties.penalty);

   // Build an object we can pass to the item importing, so we can attach this to the inventory item
   var armorPenalties = {};
   armorPenalties.ACP = parseNum(attrs["armor3-acp"]);
   armorPenalties.maxDex = parseNum(attrs["armor3-max-dex"]);
   armorPenalties.spellfail = parseNum(attrs["armor3-spell-fail"]);

   // We might change these values if we're using a shield, so don't set them outside of item import
   if (!_.isUndefined(attrs["armor3-acp"]))
     delete attrs["armor3-acp"];
   if (!_.isUndefined(attrs["armor3-spell-fail"]))
     delete attrs["armor3-spell-fail"];

   var armor = _.reject(arrayify(characterObj.defenses.armor || {}),function(item) { return _.isUndefined(item._name); });
   var weapons = _.reject(arrayify(characterObj.melee.weapon || {}).concat(arrayify(characterObj.ranged.weapon || {})),function(item) { return _.isUndefined(item._name); });

   // "Tracked Resources" is a list of uses, either a quantity of items, charges, or uses per day
   var resources = _.object(_.map(characterObj.trackedresources.trackedresource, function (resource) { return [resource._name,resource];}));

   // Make an array of items, both magic and mundane
   var items = _.reject(arrayify(characterObj.magicitems.item || {}).concat(arrayify(characterObj.gear.item || {})),function(item) { return _.isUndefined(item._name); });

   // "Specials" could include items, so we need to filter them out
   var itemNames = _.map(items, function(obj) { return obj._name; });
   var specials = _.reject(arrayify(characterObj.attack.special).concat(arrayify(characterObj.defenses.special),arrayify(characterObj.otherspecials.special),arrayify(characterObj.movement.special)), function(obj) { return _.contains(itemNames, obj._name); });

   importItems(items,resources,armorPenalties,armor,weapons);

   getSectionIDs("repeating_ability", function(idarray) {
     var abilityNameAttrs = _.union(_.map(idarray,function(id) { return "repeating_ability_"+id+"_name"; 		}),_.map(idarray,function(id) { return "repeating_ability_"+id+"_rule_category"; }));
     getAttrs(abilityNameAttrs, function(abilityAttrs) {
       var abilityObjList = {};
       var abilityKeys = Object.keys(abilityAttrs);
       var asyncAttrs = {};
       _.each(abilityKeys,function(abilityKey) {
         var rowID;
         if (abilityKey.indexOf("_name") !== -1)
         {
           rowID = abilityKey.substring("repeating_ability_".length,(abilityKey.indexOf("_name")));
           if (_.isUndefined(abilityObjList[rowID]))
             abilityObjList[rowID] = {rowID: rowID};
           abilityObjList[rowID].name = abilityAttrs[abilityKey];
         }
         if (abilityKey.indexOf("_rule_category") !== -1)
         {
           rowID = abilityKey.substring("repeating_ability_".length,(abilityKey.indexOf("_rule_category")));
           if (_.isUndefined(abilityObjList[rowID]))
             abilityObjList[rowID] = {rowID: rowID};
           abilityObjList[rowID].rulecategory = abilityAttrs[abilityKey];
         }
       });

       if (!_.isUndefined(characterObj.feats.feat))
       {
         var featsArray = _.filter(abilityObjList,_.matcher({rulecategory:"feats"}));
         var featsList = {};
         _.each(featsArray, function(obj){ featsList[obj.rowID] = obj.name; });
         characterObj.feats.feat = arrayify(characterObj.feats.feat);
         importFeats(asyncAttrs, characterObj.feats.feat, featsList, resources);
       }

       if (!_.isUndefined(characterObj.traits.trait))
       {
         var traitsArray = _.filter(abilityObjList,_.matcher({rulecategory:"traits"}));
         var traitsList = {};
         _.each(traitsArray, function(obj){ traitsList[obj.rowID] = obj.name; });
         characterObj.traits.trait = arrayify(characterObj.traits.trait);
         importTraits(asyncAttrs, characterObj.traits.trait, traitsList, resources);
       }

       if (!_.isUndefined(characterObj.spelllike.special))
       {
         var SLAsArray = _.filter(abilityObjList,_.matcher({rulecategory:"spell-like-abilities"}));
         var SLAsList = {};
         _.each(SLAsArray, function(obj){ SLAsList[obj.rowID] = obj.name; });
         characterObj.spelllike.special = arrayify(characterObj.spelllike.special);
         importSLAs(asyncAttrs, characterObj.spelllike.special, SLAsList, resources);
       }

       var featuresArray = _.filter(abilityObjList, function (obj) { if (obj.rulecategory === "traits" || obj.rulecategory === "feats") return false; return true; });
       var featuresList = {};
       _.each(featuresArray, function(obj){ featuresList[obj.rowID] = obj; });
       importFeatures(asyncAttrs, featuresList, specials, archetypes, resources);

       setAttrs(asyncAttrs);
     });
   });

   attrs["experience"] = parseFloat(characterObj.xp._total);

   attrs["class-0-bab"] = parseNum(characterObj.attack._baseattack);

   // Set max hp; remove Con mod from hp first, since the sheet will add that in
   // Since the XML doesn't break this down by class, add it all to class 0
   var level = calcHitDice(characterObj.health._hitdice);
   attrs["class-0-hp"] = (parseNum(characterObj.health._hitpoints) - (level * parseNum(characterObj.attributes.attribute[2].attrbonus._modified)));
   importInit(attrs,characterObj.initiative);
   var racialHD = level - parseNum(characterObj.classes._level);
   if (racialHD > 0)
     attrs["npc-hd-num"] = racialHD;

   var size = getSizeMod(characterObj.size._name);
   attrs["size"] = size;
   attrs["default_char_size"] = size;

   characterObj.skills.skill = arrayify(characterObj.skills.skill);
   importSkills(attrs,characterObj.skills.skill,size,ACP);

   if (!_.isUndefined(characterObj.senses.special))
   {
     characterObj.senses.special = arrayify(characterObj.senses.special);
     attrs["vision"] = buildList(characterObj.senses.special, "_shortname");
   }

   if (!_.isUndefined(characterObj.damagereduction.special))
   {
     characterObj.damagereduction.special = arrayify(characterObj.damagereduction.special);
     attrs["DR"] = buildList(characterObj.damagereduction.special, "_shortname");
   }

   if (!_.isUndefined(characterObj.resistances.special))
   {
     characterObj.resistances.special = arrayify(characterObj.resistances.special);
     attrs["resistances"] = buildList(characterObj.resistances.special, "_shortname");
   }

   if (!_.isUndefined(characterObj.immunities.special))
   {
     characterObj.immunities.special = arrayify(characterObj.immunities.special);
     attrs["immunities"] = buildList(characterObj.immunities.special, "_shortname");
   }

   if (!_.isUndefined(characterObj.weaknesses.special))
   {
     characterObj.weaknesses.special = arrayify(characterObj.weaknesses.special);
     attrs["weaknesses"] = buildList(characterObj.weaknesses.special, "_shortname");
   }
   if (!_.isUndefined(characterObj.languages.language))
   {
     characterObj.languages.language = arrayify(characterObj.languages.language);
     attrs["languages"] = buildList(characterObj.languages.language, "_name");
   }

   attrs["character_name"] = characterObj._name;
   attrs["player-name"] = characterObj._playername;
   attrs["deity"] = characterObj.deity._name;
   attrs["race"] = characterObj.race._racetext.substr(0,1).toUpperCase()+characterObj.race._racetext.substr(1,1000);
   attrs["alignment"] = characterObj.alignment._name;
   attrs["gender"] = characterObj.personal._gender;
   attrs["age"] = characterObj.personal._age;
   attrs["height"] = characterObj.personal.charheight._text;
   attrs["weight"] = characterObj.personal.charweight._text;
   attrs["hair"] = characterObj.personal._hair;
   attrs["eyes"] = characterObj.personal._eyes;
   attrs["skin"] = characterObj.personal._skin;

   attrs["npc-cr"] = characterObj.challengerating._text.replace("CR ","");
   attrs["npc-xp"] = characterObj.xpaward._value;

   if (!_.isUndefined(characterObj.favoredclasses.favoredclass))
   {
     characterObj.favoredclasses.favoredclass = arrayify(characterObj.favoredclasses.favoredclass);
     attrs["class-favored"] = buildList(characterObj.favoredclasses.favoredclass, "_name");
   }
   setAttrs(attrs,{},function() { PFSheet.recalculateCore(); });
 },
 registerEventHandlers = function() {
   on("change:herolab_import", function(eventInfo) {
     getAttrs(["herolab_import"], function(values) {
       var xmlObj;
       if (_.isUndefined(values.herolab_import))
         return;
       try {
         xmlObj = JSON.parse(values.herolab_import);
         if (_.isArray(xmlObj.document.public.character))
           importCharacter(xmlObj.document.public.character[0]);
         else
           importCharacter(xmlObj.document.public.character);
         setAttrs({herolab_import:""},{silent: true});
       }
       catch(err) {console.log(err);setAttrs({herolab_import: err.message},{silent: true});}
     });
   });
 };
 registerEventHandlers();
 console.log(PFLog.l + '   HLImport module loaded         ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 return {
   importCharacter: importCharacter
 };
}());
var PFSheet = PFSheet || (function () {
 'use strict';
 var expandAll = function () {
   getAttrs(["expandall"], function (v) {
     var skilltab = "4",
     setter = {};
     if (v["expandall"] == "1") {
       //set expandall to 0
       //set tabs to "all"
       //set conditions and buffs to "show"
       //set all others to default (which is "show")
       setAttrs({
         "expandall": "0",
         pagetab: "99",
         abilities_tab: "99",
         skills_tab: "99",
         spellclass_tab: "99",
         spells_tab: "99",
         npc_spellclass_tab: "0",
         equipment_tab: "99",
         "conditions-show": "1",
         "buffstop-show": "1",
         "character-details-show": "",
         "ability-scores-show": "",
         "health-and-wounds-show": "",
         "initiative-and-speeds-show": "",
         "experience-and-hero-points-show": "",
         "class-info-show": "",
         "mythic-info-show": "",
         "psionic-info-show": "",
         "abilities-show": "",
         "defense-values-show": "",
         "special-defenses-show": "",
         "armor-penalties-show": "",
         "saves-show": "",
         "armor-shield-show": "",
         "defense-notes-show": "",
         "attack-bonuses-show": "",
         "attack-notes-show": "",
         "attack-options-show": "",
         "attacks-show": "",
         "skills-show": "",
         "skill_options-show": "",
         "skill-ranks-show": "",
         "skill-notes-show": "",
         "artistry-show": "",
         "craft-show": "",
         "knowledge-show": "",
         "lore-show": "",
         "perform-show": "",
         "profession-show": "",
         "misc-show": "",
         "currency-show": "",
         "inventory-show": "",
         "carried-weight-show": "",
         "loads-show": "",
         "domains0-show": "",
         "spellsPerDay0-show": "",
         "spell_ranges0-show": "",
         "domains1-show": "",
         "spellsPerDay1-show": "",
         "spell_ranges1-show": "",
         "domains2-show": "",
         "spellsPerDay2-show": "",
         "spell_ranges2-show": "",
         "spelloptions-show": "",
         "newspells-show": "",
         "npc-quick_stats-show": "",
         "npc-defense-show": "",
         "options_defense_options-show": "",
         "npc-offense-show": "",
         "npc-speed-show": "",
         "npc-space-show": "",
         "npc-special-attacks-show": "",
         "npc-repeating_weapons-show": "",
         "npc-spell-like-abilities-show": "",
         "npc-spells-show": "",
         "npc-tactics-show": "",
         "npc-before-combat-show": "",
         "npc-during-combat-show": "",
         "npc-morale-show": "",
         "npc-base-statistics-show": "",
         "npc-statistics-show": "",
         "npc-feats-show": "",
         "npc-mythic-feats-show": "",
         "npc-skills-show": "",
         "npc-cgear-show": "",
         "npc-ogear-show": "",
         "npc-special-abilities-show": "",
         "header-image-show": "",
         "pathfinder-unchained-show": "",
         "pathfinder-mythic-adventures-show": "",
         "pathfinder-psionics-show": "",
         "roll-template-info-show": "",
         "sheet-config-show": "",
         "sheetcleanup-show": "",
         "buff-min-show": "",
         "buff-expand-show": "",
         "buff-column-show": "",
         "class-ability-min-show": "",
         "class-ability-expand-show": "",
         "class-ability-column-show": "",
         "feat-min-show": "",
         "feat-expand-show": "",
         "feat-column-show": "",
         "racial-trait-min-show": "0",
         "racial-trait-expand-show": "",
         "racial-trait-column-show": "",
         "traits-min-show": "0",
         "traits-expand-show": "",
         "traits-column-show": "",
         "mythic-min-show": "0",
         "mythic-expand-show": "",
         "mythic-column-show": "",
         "mythic-feats-min-show": "",
         "mythic-feats-expand-show": "",
         "mythic-feats-column-show": "",
         "weapon-min-show": "",
         "weapon-expand-show": "",
         "weapon-column-show": "",
         "item-min-show": "",
         "item-expand-show": "",
         "item-column-show": "",
         "newspells-min-show": "",
         "newspells-expand-show": "",
         "newspells-column-show": "",
         "npcweapon-min-show": "",
         "npcweapon-expand-show": "",
         "npcweapon-column-show": "",
         "npc-spell-like-abilities-min-show": "",
         "npc-spell-like-abilities-expand-show": "",
         "npc-spell-like-abilities-column-show": "",
         "npcnewspells-min-show": "",
         "npcnewspells-expand-show": "",
         "npcnewspells-column-show": "",
         "npcfeat-min-show": "",
         "npcfeat-expand-show": "",
         "npcfeat-column-show": "",
         "npcmythic-feats-min-show": "",
         "npcmythic-feats-expand-show": "",
         "npcmythic-feats-column-show": "",
         "npc-special-abilities-min-show": "",
         "npc-special-abilities-expand-show": "",
         "npc-special-abilities-column-show": ""
       });
       //now go through repeating sections and expand those to be sure users can see them.
       _.each(PFConst.repeatingSections, function (section) {
         var rsection = "repeating_" + section;
         getSectionIDs(rsection, function (ids) {
           var setter = _.reduce(ids, function (memo, id) {
             var prefix = rsection + "_" + id + "_";
             switch (section) {
               case 'weapon':
                 memo[prefix + "add-damage-show"] = "";
                 memo[prefix + "iterative-attacks-show"] = "";
                 memo[prefix + "macro-text-show"] = "";
                 break;
               case 'buff':
                 memo[prefix + "options-show"] = "";
                 memo[prefix + "description-show"] = "";
                 break;
               case 'spells':
                 memo[prefix + "spell-misc-show"] = "";
                 memo[prefix + "description-show"] = "";
                 memo[prefix + "macro-text-show"] = "";
                 break;
               case 'class-ability':
               case 'feat':
               case 'racial-trait':
               case 'trait':
               case 'mythic-ability':
               case 'mythic-feat':
               case 'item':
                 memo[prefix + "description-show"] = "";
                 memo[prefix + "macro-text-show"] = "";
                 break;
               case 'npc-spell-like-abilities':
                 memo[prefix + "macro-text-show"] = "";
                 break;
             }
             memo[prefix + "row-show"] = "";
             memo[prefix + "ids-show"] = "";
             return memo;
           }, {});
           setAttrs(setter, {
             silent: true
           });
         });
       });
     }
   });
 },

 /** Sets any values if sheet created brand new. Makes sure all migrations up to date.
 * makes sure NPC value set.
 */
 setupNewSheet = function(callback){
   var done = _.once(function(){
     setAttrs({'is_newsheet':0, 'is_v1':1, 'PFSheet_Version': String((PFConst.version.toFixed(2))) },PFConst.silentParams,function(){
       if (typeof callback === "function"){
         callback();
       }
     });
   });

   getAttrs(['is_npc', 'set_pfs'],function(v){
     var isNPC = parseInt(v.is_npc,10)||0,
     isPFS = parseInt(v.set_pfs,10)||0;
     PFMigrate.setAllMigrateFlags(function(){
       if (isNPC){
         PFNPC.setToNPC(done);
       } else if (isPFS){
         PFHealth.setToPFS(done);
       } else {
         done();
       }
     });
   });
 },
 recalcExpressions = function (callback, silently, oldversion) {
   var countEqs = _.size(PFConst.equationMacros),
   done = _.once(function () {
     TAS.debug("leaving PFSheet.recalcExpressions");
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneOne = _.after(countEqs, done);
   try {
     _.each(PFConst.equationMacros, function (writeField, readField) {
       try {
         SWUtils.evaluateAndSetNumber(readField, writeField, 0, doneOne, silently);
       } catch (err) {
         TAS.error("PFSheet.recalcExpressions", err);
         doneOne();
       }
     });
   } catch (err2) {
     TAS.error("PFSheet.recalcExpressions OUTER wtf how did this happen?", err2);
   } finally {
     done();
   }
 },
 recalcDropdowns = function (callback, silently, oldversion) {
   var countEqs = _.size(PFConst.dropdowns),
   done = _.once(function () {
     if (typeof callback === "function") {
       callback();
     }
   }),
   doneOne = _.after(countEqs, done);
   try {
     _.each(PFConst.dropdowns, function (writeField, readField) {
       try {
         PFUtilsAsync.setDropdownValue(readField, writeField, doneOne, silently);
       } catch (err) {
         TAS.error("PFSheet.recalcDropdowns", err);
         doneOne();
       }
     });
   } catch (err2) {
     TAS.error("PFSheet.recalcDropdowns OUTER wtf how did this happen?", err2);
   } finally {
     done();
   }
 },
 migrate = function (oldversion, callback, errorCallback) {
   var done = _.once(function () {
     TAS.debug("leaving PFSheet.migrate");
     if (typeof callback === "function") {
       callback();
     }
   }),
   errorDone = _.once(function (){
     TAS.warn("leaving migrate ERROR UPGRADE NOT FINISHED");
     if (typeof errorCallback === "function") {
       errorCallback();
     } else {
       done();
     }
   }),
   doneOne;
   try {
     //don't need to check if oldversion > 0 since this is only called if it is.
     //TAS.debug("At PFSheet.migrate from oldversion:"+oldversion);
     if (oldversion < 1.0) {
       doneOne=_.after(7,function(){
         done();
       });
       PFMigrate.migrateConfigFlags(TAS.callback( function (){
         PFInventory.migrate(doneOne,oldversion);
         PFSkills.migrate(doneOne,oldversion);
         PFHealth.migrate(doneOne,oldversion);
         PFAttacks.migrate(doneOne,oldversion);
         PFAbility.migrate(doneOne,oldversion);
         PFFeatures.migrate(doneOne,oldversion);
         PFSpells.migrate(doneOne,oldversion);
       }));
     } else {
       if (oldversion < 1.02) {
         PFAbility.migrate(null,oldversion);
         PFFeatures.migrate(null,oldversion);
       }
       if (oldversion < 1.05){
         PFAttackGrid.resetCommandMacro();
         PFSpells.resetCommandMacro();
         PFInventory.resetCommandMacro();
         PFAttackOptions.resetOptions();
       }
       if (oldversion < 1.07){
         PFInventory.migrate(null,oldversion);
       }
       if (oldversion < 1.10){
         PFMigrate.migrateAbilityListFlags();
         PFFeatures.migrate(null,oldversion);
       }
       if (oldversion < 1.12){
         PFAbility.migrate(null,oldversion);
         PFFeatures.resetCommandMacro();
         PFAttacks.recalculate();
         PFAbility.resetCommandMacro();
       }
       if (oldversion < 1.13){
         PFAbility.recalculate();
       }
       if (oldversion < 1.15){
         PFInventory.resetCommandMacro();
         PFSkills.resetCommandMacro();
         PFAbility.resetCommandMacro();
       }
     }
   } catch (err) {
     TAS.error("PFSheet.migrate", err);
     //errorDone();
   } finally {
     done();
   }
 },
 recalculateParallelModules = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFSheet.recalculateParallelModules");
     if (typeof callback === "function") {
       callback();
     }
   }),
   parallelRecalcFuncs = [
     PFSpellCasterClasses.recalculate,
     PFSaves.recalculate,
     PFFeatures.recalculate,
     PFPsionic.recalculate,
     PFSkills.recalculate,
     PFAbility.recalculate,
     PFInitiative.recalculate,
     PFAttacks.recalculate
   ],
   numberModules = _.size(parallelRecalcFuncs),
   doneOneModuleInner = _.after(numberModules, done),
   curr = 0,
   currstarted = 0,

   doneOneModule = function () {
     curr++;
     TAS.info("PFSheet.recalculateParallelModules, finished " + curr + " modules");
     doneOneModuleInner();
   };

   TAS.debug("at recalculateParallelModules! there are "+numberModules +" modules");
   try {
     _.each(parallelRecalcFuncs, function (methodToCall) {
       try {
         currstarted++;
         TAS.info("starting " + currstarted + " parallel modules");
         methodToCall(doneOneModule, silently, oldversion);
       } catch (err) {
         TAS.error("PFSheet.recalculateParallelModules", err);
         doneOneModule();
       }
     });
   } catch (err2) {
     TAS.error("PFSheet.recalculateParallelModules OUTER error!", err2);
     done();
   }
 },
 recalculateDefenseAndEncumbrance = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFSheet.recalculateDefenseAndEncumbrance");
     if (typeof callback === "function") {
       callback();
     }
   }),
   callEncumbrance = _.after(2, function () {
     PFEncumbrance.recalculate(done, silently, oldversion);
   });
   PFInventory.recalculate(callEncumbrance, silently, oldversion);
   PFDefense.recalculate(callEncumbrance, silently, oldversion);
 },
 recalculateCore = function (callback, silently, oldversion) {
   var done = _.once(function () {
     TAS.debug("leaving PFSheet.recalculateCore");
     if (typeof callback === "function") {
       callback();
     }
   }),
   sizeOnce = _.once(function(){
     PFSize.recalculate(done,silently,oldversion);
   }),
   healthOnce = _.once (function(){
     PFHealth.recalculate(sizeOnce,silently,oldversion);
   }),
   npcOnce = _.once(function(){
     PFNPC.recalculate(healthOnce,silently,oldversion);
   }),
   mythicOnce = _.once(function(){
     PFMythic.recalculate(npcOnce, silently, oldversion);
   }),
   expressionsOnce = _.once(function () {
     recalcExpressions(mythicOnce, silently, oldversion);
   }),
   dropdownsOnce = _.once(function () {
     recalcDropdowns(expressionsOnce, silently, oldversion);
   }),
   conditioncheckOnce = _.once(function () {
     PFChecks.applyConditions(dropdownsOnce, silently, oldversion);
   }),
   classOnce = _.once(function () {
     PFClassRaceGrid.recalculate(conditioncheckOnce, silently, oldversion);
   }),
   abilityScoresOnce = _.once(function () {
     PFAbilityScores.recalculate(classOnce, silently, oldversion);
   }),
   abilityAffectingConditionsOnce = _.once(function () {
     PFConditions.recalculate(abilityScoresOnce, silently, oldversion);
   }),
   buffsOnce = _.once(function () {
     PFBuffs.recalculate(abilityAffectingConditionsOnce, silently, oldversion);
   });

   PFMigrate.migrateConfigFlags(buffsOnce);

   //TAS.debug("at recalculateCore!!!!");

 },
 /** recalculate - all pages in sheet!
 *@param {number} oldversion the current version attribute
 *@param {function} callback when done if no errors
 *@param {function} errorCallback  call this if we get an error
 */
 recalculate = function (oldversion, callback, silently) {
   var done = function () {
     TAS.info("leaving PFSheet.recalculate");
     if (typeof callback === "function") {
       callback();
     }
   },
   callParallel = TAS.callback(function callRecalculateParallelModules() {
     recalculateParallelModules(TAS.callback(done), silently, oldversion);
   }),
   callEncumbrance = TAS.callback(function callRecalculateDefenseAndEncumbrance() {
     recalculateDefenseAndEncumbrance(TAS.callback(callParallel), silently, oldversion);
   });
   recalculateCore(callEncumbrance, silently, oldversion);

 },
 /* checkForUpdate looks at current version of page in PFSheet_Version and compares to code PFConst.version
 *  calls recalulateSheet if versions don't match or if recalculate button was pressed.*/
 checkForUpdate = function () {
   var done = function () {
     setAttrs({ recalc1: 0, migrate1: 0, is_newsheet: 0}, PFConst.silentParams);
   },
   errorDone = _.once(function (){
     TAS.warn("leaving checkForUpdate ERROR UPGRADE NOT FINISHED DO NOT RESET VERSION");
     setAttrs({ recalc1: 0, PFSheet_forcesync: 0 }, { silent: true });
   });
   getAttrs(['PFSheet_Version', 'migrate1', 'recalc1', 'is_newsheet', 'is_v1', 'hp', 'hp_max', 'npc-hd', 'npc-hd-num',
   'race', 'class-0-name', 'npc-type', 'level'], function (v) {
     var setter = {},
     setAny = 0,
     migrateSheet=false,
     newSheet= false,
     recalc = false,
     currVer = parseFloat(v.PFSheet_Version, 10) || 0,
     setUpgradeFinished = function() {
       setAttrs({ recalc1: 0, migrate1: 0, is_newsheet: 0, PFSheet_Version: String((PFConst.version.toFixed(2))) }, PFConst.silentParams, function() {
         if (currVer < 1.0) {
           recalculate(currVer, null, false);
         }
       });
     };
     TAS.notice("Attributes at version: " + currVer);
     if (parseInt(v["recalc1"],10) ){
       //HIT RECALC
       currVer = -1;
       recalc = true;
     } else if (parseInt(v["migrate1"],10)) {
       migrateSheet =true;
     } else if  ( parseInt(v["is_newsheet"],10) || (currVer === 0 &&  (parseInt(v.is_v1,10) || (  !(parseInt(v.hp, 10) || parseInt(v.hp_max, 10) || parseInt(v['npc-hd'], 10) || parseInt(v['npc-hd-num'], 10) ||
       v.race || v['class-0-name'] || v['npc-type'] || parseInt(v['level'], 10))))) ) {
       //NEW SHEET:
       newSheet=true;
     } else if (currVer !== PFConst.version) {
       migrateSheet = true;
     }
     if (newSheet) {
       setupNewSheet(setUpgradeFinished);
     } else if (migrateSheet){
       migrate(currVer, setUpgradeFinished, errorDone);
     } else if (recalc) {
       recalculate(currVer, done, false);
     } else  {
       done();
     }
   });
 },
 registerEventHandlers = function () {
   on("sheet:opened", TAS.callback(function eventSheetOpened() {
     //eventInfo has undefined values for this event.
     checkForUpdate();
   }));
   on("change:recalc1 change:migrate1", TAS.callback(function eventRecaluateSheet(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       checkForUpdate();
     }
   }));
   on("change:expandall", function (eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       expandAll();
     }
   });
   //GENERIC DROPDOWNS
   _.each(PFConst.dropdowns, function (write, read) {
     on("change:" + read, TAS.callback(function eventGenericDropdowns(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       PFUtilsAsync.setDropdownValue(read, write);
     }));
   });
   //GENERIC EQUATIONS
   _.each(PFConst.equationMacros, function (write, read) {
     on("change:" + read, TAS.callback(function eventGenericEquationMacro(eventInfo) {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       SWUtils.evaluateAndSetNumber(read, write);
     }));
   });

   on("change:repeating_weapon:source-item", TAS.callback(function eventUpdateAttackSourceItem(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       getAttrs([eventInfo.sourceAttribute],function(v){
         var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
         sourceId = v[eventInfo.sourceAttribute];
         //TAS.debug("PFSheet new item id: " + sourceId + " this row weapon id: "+weaponId, v);
         if (sourceId){
           sourceId = 'repeating_item_'+sourceId+'_create-attack-entry';
           PFInventory.createAttackEntryFromRow(sourceId,null,false,weaponId);
         }
       });
     }
   }));
   on("change:repeating_weapon:source-ability", TAS.callback(function eventUpdateAttackSourceAbility(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       getAttrs([eventInfo.sourceAttribute],function(v){
         var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
         sourceId = v[eventInfo.sourceAttribute];
         if (sourceId){
           PFAbility.createAttackEntryFromRow(sourceId,null,false,null,weaponId);
         }
       });
     }
   }));
   on("change:repeating_weapon:source-spell", TAS.callback(function eventUpdateAttackSourceSpell(eventInfo) {
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
       getAttrs([eventInfo.sourceAttribute],function(v){
         var weaponId = SWUtils.getRowId(eventInfo.sourceAttribute),
         sourceId = v[eventInfo.sourceAttribute];
         if (sourceId){
           PFSpells.createAttackEntryFromRow(sourceId,null,false,null,weaponId);
         }
       });
     }
   }));

   // PARSE CREATE NPC MONSTER
   on("change:npc_import_now", TAS.callback(function eventParseMonsterImport(eventInfo) {
     TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
     if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
       getAttrs(['npc_import_now'], function (v) {
         if ((parseInt(v.npc_import_now, 10) || 0) === 1) {
           PFNPCParser.importNPC(eventInfo, function(){
             //instead of just calling recalculate set recalc button and call checkforupdate
             //so users sees something is happening.
             setAttrs({recalc1:1},PFConst.silentParams,function(){
               checkForUpdate();
             });
           });
         }
       });
     }
   }));

 };
 registerEventHandlers();
 console.log(PFLog.l + '       ,## /##                    ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '      /#/ /  ##                   ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '     / / /    ##                  ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '      | ##___#/                   ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '      | ##       athfinder        ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '   #  | ##    sheet version       ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '    ### /           ' + ("0000" + PFConst.version.toFixed(2)).slice(-5) + '         ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '                                  ' + PFLog.r, PFLog.bg);
 console.log(PFLog.l + '   PFSheet module loaded          ' + PFLog.r, PFLog.bg);
 PFLog.modulecount++;
 if (PFLog.modulecount === 34) {
   console.log(PFLog.l + '   All ' + PFLog.modulecount + ' Modules Loaded          ' + PFLog.r, PFLog.bg);
 } else {
   console.log(PFLog.l + '   ONLY ' + PFLog.modulecount + ' Modules Loaded!        ' + PFLog.r, 'background: linear-gradient(to right,yellow,white,white,yellow); color:black;text-shadow: 0 0 8px white;');
 }
 return {
   recalculateCore: recalculateCore,
   checkForUpdate: checkForUpdate,
   expandAll: expandAll
 };
}());
