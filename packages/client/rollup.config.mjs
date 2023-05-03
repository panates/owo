import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';
import {fileURLToPath} from 'node:url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import inject from '@rollup/plugin-inject';
import nodeResolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import filesize from 'rollup-plugin-filesize';
import command from 'rollup-plugin-command';
import clean from '@rollup-extras/plugin-clean';
import json from '@rollup/plugin-json';
import {manualChunksResolver} from '../../support/manual-chunks-resolver.mjs';
import {filterDependencies} from '../../support/filter-dependencies.js';
import {copyFiles} from '../../support/copy-files.mjs';
import pkgJson from './package.json' assert {type: 'json'};

const dirname = path.dirname(fileURLToPath(import.meta.url));
const buildPath = path.resolve(dirname, '../../build');
const targetPath = path.resolve(buildPath, 'client');

const typingOverwrite = /['"]@opra\/(common)(\/?.*)['"]/g;

const external = [...Object.keys(pkgJson.dependencies), 'tslib'];

export default {
  input: ['../../build/node-client/esm/index.js'],
  output: [{
    dir: path.resolve(targetPath, 'esm'),
    entryFileNames: '[name].min.mjs',
    format: 'esm',
    name: 'Stream',
    manualChunks: manualChunksResolver({
      external,
      exclude: ['@opra/node-client', '@opra/common']
    })
  }, {
    dir: path.resolve(targetPath, 'cjs'),
    entryFileNames: '[name].min.mjs',
    format: 'cjs',
    name: 'Stream',
    manualChunks: manualChunksResolver({
      external,
      exclude: ['@opra/node-client', '@opra/common']
    })
  }
  ],
  external,
  plugins: [
    {
      name: 'transform-code',
      transform(code, id) {
        if (id === path.join(buildPath, 'node-client/esm/index.js')) {
          code += `\nexport * from '@opra/common'\n`;
          return code;
        }
      }
    },
    alias({
      entries: [
        {
          find: '@opra/common',
          replacement: path.resolve(buildPath, 'common/esm/index.js')
        },
        {find: 'fs', replacement: '@browsery/fs'},
        {find: 'highland', replacement: '@browsery/highland'},
        {find: 'http-parser-js', replacement: '@browsery/http-parser'},
        {find: 'i18next', replacement: '@browsery/i18next'},
        {find: 'stream', replacement: '@browsery/stream'},
        {find: 'node:stream', replacement: '@browsery/stream'},
        {find: 'path', replacement: 'path-browserify'},
        {find: 'crypto', replacement: 'crypto-browserify'}
      ]
    }),
    clean(targetPath),
    json(),
    commonjs(),
    strip(),
    filesize(),
    inject({process: 'process', Buffer: ['buffer', 'Buffer']}),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    runCommands()
  ],
  onwarn: (warning) => {
    if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code ===
        'THIS_IS_UNDEFINED' ||
        warning.code === 'SOURCEMAP_ERROR')
      return;
    console.warn(chalk.yellow(`(!) ${warning.message}`));
  }
};

function runCommands() {
  return command([
    // Copy package.json
    async () => {
      const json = filterDependencies(pkgJson, external);
      await fs.writeFile(path.join(targetPath, 'package.json'), JSON.stringify(json, undefined, 2), 'utf-8');
    },
    () => copyFiles(dirname, ['README.md'], targetPath),
    () => copyFiles(path.resolve(buildPath, '..'), ['LICENSE'], targetPath),
    // Copy typings from types
    () => copyFiles(
        path.resolve(buildPath, 'common/types'),
        ['**/*.d.ts', '!node_modules/**'],
        path.join(targetPath, 'types', 'common'),
        async (src, dst, next) => {
          if (!src.endsWith('.d.ts'))
            return next();
          let content = await fs.readFile(src, 'utf-8');
          let overwritten = false;
          content = content.replace(/'i18next'/g, () => {
            overwritten = true;
            return `'@browsery/i18next'`;
          }).replace(/['"]antlr4['"]/g, () => {
            overwritten = true;
            return `'@browsery/antlr4'`;
          }).replace(/['"]antlr4\/src\/antlr4\/(.*)['"]/g, (v, g1) => {
            overwritten = true;
            return `'@browsery/antlr4/typings/${g1}'`;
          });
          if (overwritten)
            return fs.writeFile(dst, content, 'utf-8');
          return next();
        }
    ),
    // Copy node-client typings
    () => copyFiles(
        path.resolve(buildPath, 'node-client/types'),
        ['**/*.d.ts', '!node_modules/**'],
        path.join(targetPath, 'types'),
        async (src, dst, next) => {
          if (!src.endsWith('.d.ts'))
            return next();
          const rel = path.relative(path.dirname(dst), path.resolve(targetPath, 'types'));
          let content = await fs.readFile(src, 'utf-8');
          let overwritten = false;

          if (!rel && path.basename(dst) === 'index.d.ts') {
            content += '\n' +
                `export * from './common/filter/index.js';\n` +
                `export * from './common/url/index.js';\n` +
                `export * from './common/schema/index.js';\n` +
                `export * from './common/i18n/index.js';\n` +
                `export * from './common/utils/index.js';\n`;
            overwritten = true;
          }
          content = content.replaceAll(typingOverwrite, (v, m1, m2) => {
            v = './' + m1 + (m2 || '');
            const newPath = (rel ? path.join(rel, v) : v);
            overwritten = true;
            return `'${newPath}'`;
          });
          if (overwritten)
            return fs.writeFile(dst, content, 'utf-8');
          return next();
        })
  ], {once: true, exitOnFail: true});
}