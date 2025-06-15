import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

/**
 * Prompts the user and creates a folder structure inside the project path
 * @param projectPath - Absolute path to the project root
 */
export async function createFolderStructure(projectPath: string): Promise<void> {
  const { createStructure }: { createStructure: boolean } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createStructure',
      message: 'Do you want to create a base folder structure (hooks, components, context, etc)?',
      default: true,
    },
  ]);

  if (createStructure) {
    const folders: string[] = ['context', 'services', 'utils'];

    for (const folder of folders) {
      await fs.ensureDir(path.join(projectPath, folder));
      console.log(chalk.green(`📁 Created ${folder}`));
    }

    console.log(chalk.blue('\n✅ Folder structure created.\n'));
  }
}
