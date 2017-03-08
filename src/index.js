'use strict';
//import {on,randomInteger,getsectionIDs,getTranslationByKey,getAttrs,setAttrs,removeRepeatingRow,generateRowID} from '../stubs/on';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import {PFLog,PFConsole} from './PFLog';
import PFConst from './PFConst';
//importing PFSheet imports everything else
import * as PFSheet from './PFSheet';
TAS.config({
 logging: {
   info: true,
   debug: true
 }
});
TAS.debugMode();
PFConsole.log('       ,## /##                    ');
PFConsole.log('      /#/ /  ##                   ');
PFConsole.log('     / / /    ##                  ');
PFConsole.log('      | ##___#/                   ');
PFConsole.log('      | ##       athfinder        ');
PFConsole.log('   #  | ##    sheet version       ');
PFConsole.log('    ### /           ' + ("0000" + PFConst.version.toFixed(2)).slice(-5) + '         ');
PFConsole.log('                                  ');
PFConsole.log('   PFSheet module loaded          ');
PFLog.modulecount++;
if (PFLog.modulecount === 34) {
	PFConsole.log('   All ' + PFLog.modulecount + ' Modules Loaded          ');
} else {
	PFConsole.log('   ONLY ' + PFLog.modulecount + ' Modules Loaded!        ' + PFLog.r, 'background: linear-gradient(to right,yellow,white,white,yellow); color:black;text-shadow: 0 0 8px white;');
}