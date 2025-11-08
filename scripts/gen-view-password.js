#!/usr/bin/env node
const bcrypt = require('bcryptjs');

async function main() {
  const plain = process.argv[2] || process.env.VIEW_PASSWORD || '';
  if (!plain) {
    console.error('用法：npm run pw:hash -- <明文密码>  或  设置环境变量 VIEW_PASSWORD');
    process.exit(1);
  }
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);
  console.log('明文密码:', plain);
  console.log('bcrypt 哈希:', hash);
  console.log('\n将哈希填入 Airtable Requirements 表的 ViewPasswordHash 字段即可。');
}

main().catch((e) => { console.error(e); process.exit(1); });