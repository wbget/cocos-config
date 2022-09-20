#!/usr/bin/env node

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Transform } = require('stream');
const pako = require('pako');
require('colors');

const configPath = process.argv[2];
if (!configPath) {
  console.error('ERROR: 需要指定配置');
  process.exit(-1);
}
const from = path.resolve(process.cwd(), configPath);
console.log(`配置：${from.green}`);
const config = JSON.parse(fs.readFileSync(from).toString('utf8'));

const root = path.dirname(from);
const filePath = config.dist;
const outPath = path.join(root, filePath);

const out = (f, s, o) => {
  const file = path.resolve(root, f) + `.xlsx`;
  const output = path.join(outPath, `${o}.bin`);

  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets[s];
  if (!sheet) throw Error(`错误的配置表 ${file}/${s} `);
  const pakoSteam = new Transform({
    transform(chunk, encoding, callback) {
      this.push(pako.deflate(chunk));
      callback();
    },
  });
  const stream = XLSX.stream.to_csv(sheet, {
    blankrows: false,
    RS: '|',
  });
  stream.pipe(pakoSteam).pipe(fs.createWriteStream(output));
  console.log(
    `${f}`.green + `(${s})`.yellow,
    '==>',
    `${o}`.cyan,
    `path: ${output}`.yellow
  );
};

config.list.forEach(v => {
  out(v.path, v.sheet, v.name);
});
console.log(`收集时间：${new Date().toLocaleString()}`.dim.bgBlack);
