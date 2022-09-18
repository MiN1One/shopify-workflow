const concurrently = require('concurrently');
const { promisify } = require('util');

const execute = promisify(require('child_process').exec);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    '\x1b[31mEnter theme name to deploy: \x1b[31m', 
    async (themeEnv) => {
      if (!themeEnv.trim().length) {
        return getThemeEnv();
      }
      console.log(`\x1b[32m- Building source files\x1b[32m`);
      await executeShellCommand('yarn build');
      await deploy(themeEnv);
    }
  );
};

getThemeEnv();