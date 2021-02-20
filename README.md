# Pathfinder Character Sheet for Roll20.net

## Build
dev: npm run build 
prod: npm run prod

## Editing
In order to edit complete the following sections
### Install Git (If you don't have it already)
#### Windows
Download the latest release from https://git-for-windows.github.io/ and install it

### Install Node 6.9.5 (Any node >6.9 should work)
#### Windows
1. Download and install the latest setup from https://github.com/coreybutler/nvm-windows/releases
2. Open a new git bash (you can not use one which was opened before nvm is installed)
3. Run `nvm install 6.9.5`
4. Run `nvm use node 6.9.5`

#### Linux/Mac
1. Run `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash`
2. Close and reopen your terminal
3. Run `nvm install 6.9.5`
4. Run `nvm alias default 6.9.5`
5. Run `nvm use 6.9.5`

### Install Dependancies
1. Open a shell in the project directory (Windows: Right click -> Open git bash here)
2. Run `npm install`

### Install curl executable (If you don't have it already)
Curl allows us to download The Arron Sheet, instead of maintaining our own copy
1. go to https://curl.haxx.se/dlwiz/?type=bin and pick the correct version (pick 'any' if you are unsure)
2. unzip and save to a directory on your computer
3. add the directory to your computer's PATH variable. https://windowsreport.com/edit-windows-path-environment-variable/

### Build/Compile Commands
Run `npm run build` Builds the project's index.html Use Case: development/testing. Output to "dist" folder.
Run `npm run prod` Turns **debug off** automatically. Builds the project's index.html Use Case: roll20 production. Output to "prod" folder.
Use css, translation.json, and sheet.json included in the "src" folder.

------
## Specific instructions for Windows w/ Visual Studio Code
### git 
1. if you already have Github for windows you do not need to install git separately. If you do not have it, then you must still download it or else download git as above. You can also have both side by side
2. Add Github for windows to the PATH variable(https://windowsreport.com/edit-windows-path-environment-variable/) using these instructions;
(there is only a 'cmd' directory, no bin directory, contrary to what this says): http://www.chambaud.com/2013/07/08/adding-git-to-path-when-using-github-for-windows/

### VS Code and Node.js integration
1. Download and install Visual Studio Code https://code.visualstudio.com/Download
2. You can easily install Node from here at the link titled "Install Nodejs for your platform" which links to an .msi file  https://code.visualstudio.com/Docs/runtimes/nodejs you don't need to use the 'nvm' commands this way. If you need nvm then you probably already know what you are doing and don't need these instructions.

### Extensions
3. Required: In VS Code Extensions, download egamma's npm implementation for VS Code: https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script
4. Optional: npm intellisense extension helps: https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense
5. Optional: The .jshint files are used by jshint for VSCode: https://marketplace.visualstudio.com/items?itemName=dbaeumer.jshint
6. Optional: new CodeLens extentsion for git, js: https://code.visualstudio.com/blogs/2017/02/12/code-lens-roundup
7. To not have to retype the password every time you push to git: 

### curl
8. you must still install curl as above

### opening project.
9. fork project if you haven't already
10. clone project from within VS Code

**CTRL-Shift-P opens a terminal prompt at top** it also has better intellisense than the terminal window due to the picklist it generates as you type.
Much easier to fork from github's web interface first.
Then use the URL of your fork as the url of the repository i think with the git clone command
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

