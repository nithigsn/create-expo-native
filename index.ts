#!/usr/bin/env node

import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';


import insertImport from './helpers/insertImport';
import { createFolderStructure } from './helpers/createFolderStructure';

(async () => {
  console.log(chalk.green.bold('\n🌀 expo + nativewind Project Generator\n'));

  const { projectName }: { projectName: string } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Enter project name:',
      default: 'myapp',
    },
  ]);

  const run = (cmd: string, opts: object = {}) => execSync(cmd, { stdio: 'inherit', ...opts });

  const hide = (cmd: string, opts: object = {}) =>
    execSync(cmd, {
      stdio: ['inherit', 'ignore', 'inherit'], // stdin, stdout, stderr
      ...opts,
    });

  console.log(chalk.blue('\n🚧 Creating expo project...'));
  hide(`npx create-expo-app@latest ${projectName} `);

  const projectPath = path.resolve(projectName);
  process.chdir(projectPath);

  console.log(chalk.yellow('⚙️ Installing Nativewind CSS...'));
  run(
    `npm install nativewind react-native-reanimated@~3.17.4 react-native-safe-area-context@5.4.0`
  );

  console.log(chalk.yellow('⚙️ Installing Tailwind and Prettier plugin...'));
  run(`npm install -D tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11`);

  console.log(chalk.yellow('⚙️ Setup Tailwind CSS'));
  run(`npx tailwindcss init`);

  console.log(chalk.yellow('🧹 Updating tailwind.config.js ...'));
  const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
  await fs.writeFile(
    tailwindConfigPath,
    `/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
      //  add fonts
      },
      colors: {
      // add custom colors
      },
    },
  },
  plugins: [],
};

`
  );
  console.log(chalk.green('✅ Tailwind config updated.'));

  const cssPath = path.join(projectPath, 'global.css');
  await fs.outputFile(
    cssPath,
    `@tailwind base;
     @tailwind components;
     @tailwind utilities;`
  );
  console.log(chalk.green('✅ Created global.css.'));

  const babelPath = path.join(projectPath, 'babel.config.js');
  await fs.outputFile(
    babelPath,
    `module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
    };
  };`
  );
  console.log(chalk.green('✅ Created babel.config.js.'));

  // add metro config
  const metroPath = path.join(projectPath, 'metro.config.js');
  await fs.outputFile(
    metroPath,
    `const { getDefaultConfig } = require("expo/metro-config");
     const { withNativeWind } = require('nativewind/metro');
     const config = getDefaultConfig(__dirname)
     module.exports = withNativeWind(config, { input: './global.css' })`
  );
  console.log(chalk.green('✅ Created metro.config.js.'));

  // import global.css inside app/_layout.tsx
  const layoutFilePath = path.join(projectPath, 'app', '_layout.tsx');
  const importLine = `import '../global.css';`;
  await insertImport(layoutFilePath, importLine);
  console.log(chalk.green('✅ imported global.css in _layout.tsx'));

  // Typescript Setup
  const tsPath = path.join(projectPath, 'nativewind-env.d.ts');
  await fs.outputFile(tsPath, `/// <reference types="nativewind/types" />`);
  console.log(chalk.green('✅ Added Typescript support.'));

  await createFolderStructure(projectPath)

  console.log(chalk.green('✅ Nativewind setup complete.'));
  console.log(chalk.cyan(`\n🚀 Project "${projectName}" is ready!\n`));
})();
