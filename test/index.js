const fs = require('fs');
const pako = require('pako');
const f = fs.readFileSync('./test/test.bin');
const a = pako.inflate(f, { to: 'string' });

console.log(`测试: ${a === 'id,名称|m1,测试名字ab!'}`);
