import chalk from 'chalk';
import { program } from 'commander';
import * as console from 'console';
import * as fs from 'fs';
import path from 'path';
import * as process from 'process';
import { ApiExporter } from './api-exporter/api-exporter.js';
import { getCallerFile } from './utils/get-caller-file.util.js';

const dirname = path.dirname(getCallerFile());
const pkgJson = JSON.parse(fs.readFileSync(path.resolve(dirname, '../package.json'), 'utf-8'));

program
    .version(pkgJson.version)
    .argument('<serviceUrl>', 'OPRA service url')
    .argument('<outDir>', 'Output directory')
    .option('--name <name>', 'Name of the service')
    .option('--ext', 'Adds js extension to imports')
    .option('--no-color', 'Disables colors in logs messages')
    .action(async (serviceUrl, outDir, options) => {
      if (!options.color)
        chalk.level = 0;
      await ApiExporter.execute({
        serviceUrl,
        logger: console,
        outDir,
        name: options.name,
        importExt: options.ext,
        fileHeader:
            '/* Generated by OPRA Service Generator, Version ' + pkgJson.version + '*/\n' +
            '/* eslint-disable */\n'
      }).then(() => console.log(chalk.greenBright('Completed')))
          .catch(e => console.error(e.message));
    });

if (process.argv.length < 3)
  program.help();
else
  program.parse(process.argv);
