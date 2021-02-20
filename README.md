# Pathfinder Character Sheet for Roll20.net
## Editing
Unlike most character sheets found on the Roll20's repo (https://github.com/Roll20/roll20-character-sheets), the Pathfinder Community sheet must be edited/developed within a specific environment. Sheetworkers have been separated into various modules of js based on their specific sheet sections or by function(s). It is necessary to minimally install git, node.js, and npm. In order to edit complete the following sections;
### Install Git (If you don't have it already)
Download the latest version and install it.
#### Windows
 https://gitforwindows.org/
#### Linux
https://git-scm.com/download/linux

### Install Node.js using NVM
(SKIP these steps you are going to setup Visual Studio Code. 'NVM' commands will not be necessary.  See specific instructions below.)
#### Windows
1. Download and install latest version of Node Version Manager(NVM): https://github.com/coreybutler/nvm-windows/releases
2. Open a **NEW** shell (Right click -> Open Git Bash Here/Git GUI Here) You can not use one which was opened before NVM is installed.
3. Run `nvm install latest` to install the latest version of node.js
4. Run `nvm list available` and note the version you want to use. The latest version should be fine. 
4. Run `nvm use node <version#>` include the proper version number as noted above.

#### Linux/Mac (adjust node version as needed)
1. Run `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash`
2. Close and reopen your terminal
3. Run `nvm install 6.9.5`
4. Run `nvm alias default 6.9.5`
5. Run `nvm use 6.9.5`

### Dependancies
**NPM** (https://www.npmjs.com/get-npm) is distributed with Node.js - which means that when you download Node.js, you automatically get npm installed on your computer.

### Install curl executable (If you don't have it already)
**Curl** allows us to download The Arron Sheet (https://github.com/shdwjk/TheAaronSheet), instead of maintaining our own copy.
1. Go to https://curl.haxx.se/dlwiz/?type=bin and pick the correct version.
2. Unzip and save to a directory on your computer
3. Add the Curl install directory to your windows environment [PATH](https://windowsreport.com/edit-windows-path-environment-variable/) variable.
### Build/Compile Commands
Run `npm run build` - Builds the project's index.html Use Case: development/testing. Output to "dist" folder.

Run `npm run prod` - Turns **debug off** automatically. Builds the project's index.html Use Case: roll20 production. Output to "prod" folder.

Use css, translation.json, and sheet.json included in the "src" folder.

------
## Specific instructions for setting up with Visual Studio Code
### Install git 
1. If you already have Github for Windows, you do not need to install **git** separately. If you do not have it, you must download/install it or else download git as noted above. You may also have both side by side.
2. Add the Github for Windows install directory to your windows environment [PATH](https://windowsreport.com/edit-windows-path-environment-variable/) variable.More specefic instructions;
(note: there is only a 'cmd' directory. Not a bin directory, contrary to the directions.): https://www.answerlookup.com/how-add-git-windows-path-environment-variable

### Visual Studio Code and Node.js integration
1. Download and install [Visual Studio Code](https://code.visualstudio.com/Download)
2. Install Node for your platform: https://code.visualstudio.com/Docs/runtimes/nodejs 
(note: if you need nvm then you probably already know what you are doing and don't need these instructions. see nvm instructions above.)

### Extensions
3. Required: In VS Code Extensions, download the "Egamma NPM" extension for VSC: https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script
4. Optional: "NPM Intellisense" extension: https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense
5. Optional: "VS Code JSHint extension" for VSC: https://marketplace.visualstudio.com/items?itemName=dbaeumer.jshint
6. Optional: "GetLens" extension for VSC: https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens

### curl
**Curl** is still required. See above.

### Opening Project.
8. fork project if you haven't already.
9. clone project from within VSC or [Github Desktop](https://desktop.github.com/)

**CTRL-Shift-P opens a terminal prompt at top** it also has better intellisense than the terminal window due to the picklist it generates as you type.
Much easier to fork from github's web interface first.
Then use the URL of your fork as the url of the repository. I think this can be done using the git `clone` command
some help: https://www.theregister.co.uk/2015/12/07/visual_studio_code_git_integration/

# Module Breakdown
Each "page" or section of the Pathfinder sheet has one or more modules associated with it. For instance, the core page has PFAbilityScores, PFInitiative, PFClassRaceGrid etc. The Defense page has PFDefense, PFSaves. The Attacks page has PFAttacks, spells page PFSpells, etc.

## Repeating sections
Pages with repeating sections will have a module for the repeating list, another module for the page-level variables (usually above it on the page), and a 3rd module for "roll options" the user has selected. For the attacks page it is :
* **PFAttacks:** the repeating_weapon list
* **PFAttackGrid:** the melee,ranged,cmb grid at the top
* **PFAttackOptions: ** the options checkboxes and how they affect macros

spells:
* **PFSpells:** the repeating_spells list
* **PFSpellCasterClasses:** The spell caster section, spells per day, spell points, etc
* **PFSpellOptions:** the spell options and updating of macros

