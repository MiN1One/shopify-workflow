const concurrently = require('concurrently');
const yml = require('js-yaml');
const fs = require('fs');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

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
      
      readline.question('Open theme (Y/N)?: ', async (answ) => {
        try {
          const commands = [
            {
              command: `theme watch --env=${themeEnv}`,
              name: 'Shopify',
              prefixColor: '#2ecc71'
            },
            {
              command: `cross-env webpack --mode=development`,
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