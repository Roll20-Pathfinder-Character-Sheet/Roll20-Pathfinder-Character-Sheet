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
