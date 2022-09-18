const concurrently = require('concurrently');
const { promisify } = require('util');
const yml = require('js-yaml');
const fs = require('fs');

const ERROR_ASSET_URL = 'Selected theme does not have asset URL for loading lazy asset files';

const execute = promisify(require('child_process').exec);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const configYmlContent = yml.load(fs.readFileSync('./config.yml', 'utf-8'));
const themesList = Object.keys(configYmlContent || {});
const themesListLog = themesList.reduce(
  (prev, themeName, index, self) => {
    return prev + `# ${index} - ${themeName}${index !== self.length - 1 ? '\n' : ''}`;
  }, ' --- Themes List ---\n'
);

console.log(themesListLog);

const executeShellCommand = async (command) => {
  try {
    await execute(command);
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
};

const openTheme = (themeEnv) => {
  readline.question(
    '\x1b[31mOpen theme for testing (Y/N)?: \x1b[31m',
    async (answ) => {
      if (answ.toUpperCase() === 'YES' || answ.toUpperCase() === 'Y') {
        await executeShellCommand(`theme open --env=${themeEnv}`);
      }
      process.exit(0);
    }
  );
};

const deploy = async (themeEnv) => {
  console.log(`\x1b[32m- Deploying to ${themeEnv.toUpperCase()}\x1b[32m`);
  const { result } = await concurrently(
    [ `theme deploy --env=${themeEnv}` ],
    { killOthers: ['success'] }
  );
  const succeededCommands = await result;
  if (succeededCommands.length) {
    openTheme(themeEnv);
  }
};

const getThemeEnv = () => {
  readline.question(
    '\x1b[31mEnter theme ID to deploy: \x1b[31m', 
    async (themeId) => {
      themeId = parseInt(themeId);
      const themeEnv = themesList[themeId];
      if (!themeEnv || isNaN(themeId)) {
        return getThemeEnv();
      }
      let { asset_url } = configYmlContent[themeEnv];
      if (!asset_url) {
        throw new Error(ERROR_ASSET_URL);
      }
      if (!asset_url.endsWith('/')) {
        asset_url += '/';
      }
      console.log(`\x1b[32m- Building source files\x1b[32m`);
      await executeShellCommand(`cross-env ASSET_URL=${asset_url} webpack --mode=production`);
      deploy(themeEnv);
    }
  );
};

getThemeEnv();