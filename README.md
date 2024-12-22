# Pathfinder Character Sheet for Roll20.net
## Editing
Unlike most character sheets found on [Roll20's repo](https://github.com/Roll20/roll20-character-sheets), the Pathfinder Community sheet must be edited/developed within a specific environment. Sheetworkers have been separated into various es modules based on their specific sheet sections or by function(s). It is necessary to minimally install git and node/npm. In order to edit the sheet locally, complete the following sections;
### Install Git (If you don't have it already)
Download the latest version and install it.

Windows https://gitforwindows.org/  Linux https://git-scm.com/download/linux

### Install Node.js using NVM
- SKIP these steps if you are going to setup Visual Studio Code. See specific instructions below.
#### Windows
1. Download and install latest version of Node Version Manager(NVM):  https://github.com/coreybutler/nvm-windows/releases
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

### Dependencies
**NPM** is distributed with Node.js - which means that when you download Node.js https://nodejs.org/en/download/package-manager, you automatically get npm installed on your computer.

### Install Curl executable (If you don't have it already)
**Curl** allows us to download The Arron Sheet https://github.com/shdwjk/TheAaronSheet, instead of maintaining our own copy.
1. Go to https://curl.se/download.html and pick the correct version for your os.
2. Unzip and save to a directory on your computer ie on windows; c:\curl and copy curl.exe to c:\windows\system32\
3. You may need to add the Curl install directory or curl.exe to your windows environment PATH variable https://www.computerhope.com/issues/ch000549.htm

### Build/Compile Commands
Run `npm run build` - Builds the project's index.html Use Case: development/testing. Output to "dist" folder.

Run `npm run prod` - Turns **debug off** automatically. Builds the project's index.html Use Case: roll20 production. Output to "prod" folder.

### Viewing in Roll20
**Option 1:** Use the bundled index.html from the ./dist or ./prod folder accordingly and the pathfinder.css, translation.json, and sheet.json as included in the ./src folder.  These files can be copied as raw text directly into a Custom game's, "Game Settings" editor (HTML|CSS|TRANSLATION). Do not rely on the Preview tab. Always view the sheet in-game for an accurate load.

**Option 2:** Sync a Sandbox game to your local files using Scott C's Chrome browser extension "Roll20 API and Sheet Autouploader" https://chromewebstore.google.com/detail/roll20-api-and-sheet-auto/hboggmcfmaakkifgifjbccnpfmnegick You may need to create a symbolic link https://www.howtogeek.com/16226/complete-guide-to-symbolic-links-symlinks-on-windows-or-linux/ for the ./src/pathfinder.css and/or the ./src/translation.json to the ./dist and ./prod folders so the extension can easily detect local changes.


------
## Specific instructions for setting up with Visual Studio Code
#### Install git 
1. If you already have Github for Windows, you do not need to install **git** separately. If you do not have it, you must download/install it or else download git as noted above. You may also have both side-by-side.
2. Add the Github for Windows install directory to your windows environment [PATH](https://windowsreport.com/edit-windows-path-environment-variable/) variable.More specific instructions;
(note: there is only a 'cmd' directory. Not a bin directory, contrary to the directions.): https://www.answerlookup.com/how-add-git-windows-path-environment-variable

#### Visual Studio Code and Node.js integration
1. Download and install Visual Studio Code: https://code.visualstudio.com/download
2. Install Node for your platform: https://nodejs.org/
(note: if you need nvm for version control purposes then you probably already know what you are doing and don't need these instructions. see nvm instructions above.)

#### Reccomended Vscode Extensions
3. "NPM Intellisense" extension: https://marketplace.visualstudio.com/items?itemName=christian-kohlernpm-intellisense
4. "Eslint extension": https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
    (works with included ./eslint.config.mjs)
5. "Prettier Eslint extension": https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint
    (works with included ./.prettierrc.json)
6. "GetLens" extension for VSC: https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens

#### curl
**Curl** is still required. See above.

## Opening Project.
7. fork project if you haven't already.
8. clone project from within VScode or [Github Desktop](https://desktop.github.com/)

**CTRL-Shift-P opens a terminal prompt at top** it also has better intellisense than the terminal window due to the picklist it generates as you type.
Much easier to fork from github's web interface first.
Then use the URL of your fork as the url of the repository. I think this can be done using the git `clone` command
some help: https://www.theregister.co.uk/2015/12/07/visual_studio_code_git_integration/

## Errors/Issues
- Webpack dependencies: update webpack and dev dependencies with caution.

## Module Breakdown
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

