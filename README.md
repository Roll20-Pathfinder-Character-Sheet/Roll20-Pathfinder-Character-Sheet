#Pathfinder Character Sheet for Roll20.net

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
3. add the directory to your computer's PATH variable. 

### Building
Run `npm run build` to build the project, the output will show up in a new folder called dist

###Specific instructions for Windows w/ Visual Studio Code
####git 
1. if you already have Github for windows you do not need to install git separately, VS Code will find the github for windows binaries and use that for it's git processing. If you do not have it, then you must still download it or else download git as above. You can also have both side by side

####VS Code and Node.js integration
2. Download and install Visual Studio Code https://code.visualstudio.com/Download
3. You can easily install Node from here at the link titled "Install Nodejs for your platform" which links to an .msi file  https://code.visualstudio.com/Docs/runtimes/nodejs you don't need to use the 'nvm' commands this way

####Extensions
4. Required: In VS Code Extensions, download egamma's npm implementation for VS Code: https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script
5. Optional: npm intellisense extension helps: https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense
6. Optional: The .jshint files are used by jshint for VSCode: https://marketplace.visualstudio.com/items?itemName=dbaeumer.jshint
7. Optional: new CodeLens extentsion for git, js: https://code.visualstudio.com/blogs/2017/02/12/code-lens-roundup

####curl
8. you must still install curl as above

####opening project.
9. fork project if you haven't already
10. clone project from within VS Code

**CTRL-Shift-P opens a terminal prompt at top** it also has better intellisense than the terminal window due to the picklist it generates as you type.
Much easier to fork from github's web interface first.
Then use the URL of your fork as the url of the repository i think with the git clone command
some help: https://www.theregister.co.uk/2015/12/07/visual_studio_code_git_integration/

