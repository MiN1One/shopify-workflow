const concurrently = require('concurrently');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout 
});

readline.question(
  `\x1b[32mEnter theme name (default=development): \x1b[32m`, 
  (themeEnv) => {
    readline.question('Open theme (Y/N)?: ', async (answ) => {
      const commands = [
        {
          command: `theme watch --env=${themeEnv}`,
          name: 'ThemeKit',
          prefixColor: '#2ecc71'
        },
        {
          command: `webpack --mode=development`,
          name: 'Webpack',
          prefixColor: '#3498db'
        }
      ];

      if (answ.toUpperCase() === 'YES' || answ.toUpperCase() === 'Y') {
        commands.push({
          command: `theme open --env=${themeEnv}`,
          name: 'ThemeKit Open',
          prefixColor: '#fbc531'
        });
      }

      await concurrently(commands, {
        killOthers: ['failure'],
        pauseInputStreamOnFinish: false,
      });
    });
  }
);