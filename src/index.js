'use strict';
import TAS from 'exports-loader?TAS!TheAaronSheet';

TAS.config({
 logging: {
   info: process.env.NODE_ENV !== 'production',
   debug: process.env.NODE_ENV !== 'production'
 }
});
if (process.env.NODE_ENV !== 'production') {
  TAS.debugMode();
}

import {PFLog, PFConsole} from './PFLog';
import PFConst from './PFConst';
//importing PFSheet imports everything else
import * as PFSheet from './PFSheet';
import * as HLImport from './HLImport';


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
if (PFLog.modulecount === 35) {
	PFConsole.log('   All ' + PFLog.modulecount + ' Modules Loaded          ');
} else {
	PFConsole.log('   ONLY ' + PFLog.modulecount + ' Modules Loaded!        ' + PFLog.r, 'background: linear-gradient(to right,yellow,white,white,yellow); color:black;text-shadow: 0 0 8px white;');
}
