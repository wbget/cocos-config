#!/usr/bin/env node

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Transform } = require('stream');
const pako = require('pako');
const color = require('colorette');

const configPath = process.argv[2];
if (!configPath) {
  console.error('ERROR: 需要指定配置');
  process.exit(-1);
}
const from = path.resolve(process.cwd(), configPath);
console.log(color.bgBlack(color.dim(`工具版本：1.0.1`)));
console.log(`配置：${color.green(from)}`);
const config = JSON.parse(fs.readFileSync(from).toString('utf8'));

const root = path.dirname(from);
const filePath = config.dist;
const outPath = path.join(root, filePath);

const out = (f, s, o) => {
  const file = path.resolve(root, f) + `.xlsx`;
  const output = path.join(outPath, `${o}.bin`);

  const workbook = XLSX.readFile(file, { dense: true });
  const sheet = workbook.Sheets[s];
  if (!sheet) throw Error(`错误的配置表 ${file}/${s} `);
  const pakoSteam = new Transform({
    transform(chunk, encoding, callback) {
      this.push(pako.deflate(chunk));
      callback();
    },
  });
  for (const row of sheet) {
    row.splice(0, 2);
  }
  delete sheet[0];
  const stream = XLSX.stream.to_csv(sheet, {
    blankrows: false,
    RS: '|',
  });
  stream.pipe(pakoSteam).pipe(fs.createWriteStream(output));
  console.log(
    `${color.green(f)}` + color.yellow(`(${s})`),
    '==>',
    color.cyan(`${o}`),
    color.yellow(`path: ${output}`)
  );
};

config.list.forEach(v => {
  out(v.path, v.sheet, v.name);
});
console.log(
  color.dim(color.bgBlack(`收集时间：${new Date().toLocaleString()}`))
);
