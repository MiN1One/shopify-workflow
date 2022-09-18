const concurrently = require('concurrently');
const yml = require('js-yaml');
const fs = require('fs');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const ERROR_ASSET_URL = 'Selected theme does not have asset URL for loading lazy asset files';

const configYmlContent = yml.load(fs.readFileSync('./config.yml', 'utf-8'));

const themesList = Object.keys(configYmlContent || {});
const firstAvailableTheme = themesList[0];
const themesListLog = themesList.reduce(
  (prev, themeName, index, self) => {
    return prev + `# ${index} - ${themeName}${index !== self.length - 1 ? '\n' : ''}`;
  }, ' --- Themes List ---\n'
);

console.log(themesListLog);

const runProcesses = () => {
  readline.question(
    `\x1b[32mEnter theme ID (default=${firstAvailableTheme}): \x1b[32m`, 
    (themeId) => {
      themeId = parseInt(themeId);
      if (themeId && (themeId > themesList.length - 1 || themeId < 0)) {
        return runProcesses();
      }
      const themeEnv = themesList[themeId] || firstAvailableTheme;
      let asset_url = configYmlContent[themeEnv]?.asset_url;
      if (!asset_url) {
        throw new Error(ERROR_ASSET_URL);
      }
      if (!asset_url.endsWith('/')) {
        asset_url += '/';
      }
      readline.question('Open theme (Y/N)?: ', async (answ) => {
        try {
          const commands = [
            {
              command: `theme watch --env=${themeEnv}`,
              name: 'Shopify',
              prefixColor: '#2ecc71'
            },
            {
              command: `cross-env ASSET_URL=${asset_url} webpack --mode=development`,
              name: 'Webpack',
              prefixColor: '#3498db'
            }
          ];
  
          if (answ.toUpperCase() === 'YES' || answ.toUpperCase() === 'Y') {
            commands.push({
              command: `theme open --env=${themeEnv}`,
              name: 'Theme Open',
              prefixColor: '#fbc531'
            });
          }
  
          await concurrently(commands, {
            killOthers: ['failure'],
            pauseInputStreamOnFinish: false,
            maxProcesses: 3,
            handleInput: true
          });
        } catch (er) {
          console.error(er);
          process.exit(1);
        }
      });
    }
  );
};

runProcesses();