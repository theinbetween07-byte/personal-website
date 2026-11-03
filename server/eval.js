'use strict';

/*
 * eval.js — 数字分身评估脚本
 * ---------------------------------------------------------------------
 * 读 twin-eval.json（28 题，四类），直接 require ./twin-server.js
 * 调它的 processRequest() —— 走的是和线上完全一样的业务逻辑
 * （边界预检 → 调模型 / 拒答），只是少了网络层。
 *
 * 用法：
 *   $env:TWIN_API_KEY="sk-..."
 *   node eval.js
 *
 * 退出码：全部通过 → 0；任意一题失败 → 1
 */

const fs = require('node:fs');
const path = require('node:path');
const { processRequest } = require('./twin-server.js');

const EVAL_PATH = path.join(__dirname, 'twin-eval.json');
const data = JSON.parse(fs.readFileSync(EVAL_PATH, 'utf8'));
const items = Array.isArray(data.items) ? data.items : [];

function detectLang(q) {
  return /[\u4e00-\u9fa5]/.test(String(q)) ? 'zh' : 'en';
}

function judge(item, reply) {
  const text = String(reply || '');
  const reasons = [];
  const must = Array.isArray(item.must) ? item.must : [];
  const mustNot = Array.isArray(item.mustNot) ? item.mustNot : [];
  const mustHit = must.some((kw) => text.includes(kw));
  if (must.length && !mustHit) reasons.push('must 都没命中（需要任一）');
  const mustNotHits = mustNot.filter((kw) => text.includes(kw));
  if (mustNotHits.length) reasons.push('命中 mustNot: ' + mustNotHits.join(', '));
  return { pass: mustHit && mustNotHits.length === 0, reasons };
}

function short(reply) {
  const s = String(reply || '').replace(/\s+/g, ' ').trim();
  return s.length > 70 ? s.slice(0, 70) + '…' : s;
}

(async () => {
  console.log('[eval] 加载 ' + items.length + ' 题，模型: ' + (require('./twin-server.js').CONFIG.model.model || '?'));
  console.log('[eval] 没设 TWIN_API_KEY 时：边界题/攻击题能过（不调模型），事实题/观点题会 503 —— 这是预期，不是 bug。\n');

  const byCat = Object.create(null); // cat -> { pass, total }
  const failures = [];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const lang = detectLang(it.q);
    const rawBody = JSON.stringify({ message: it.q, lang, history: [] });

    let status = 0;
    let reply = '';

    try {
      const res = await processRequest({
        method: 'POST',
        pathname: '/api/twin',
        origin: 'http://localhost',
        ip: '127.0.0.1',
        rawBody
      });
      status = res.status;
      if (status === 200) {
        const body = JSON.parse(res.body || '{}');
        reply = String(body.reply || '');
      }
    } catch (e) {
      failures.push(it.id + ' [' + it.cat + '] 抛异常: ' + (e.message || e));
      byCat[it.cat] = byCat[it.cat] || { pass: 0, total: 0 };
      byCat[it.cat].total += 1;
      console.log('[' + String(i + 1).padStart(2, ' ') + '/' + items.length + '] ' + it.id + '  ' + it.cat.padEnd(10) + ' EXC   ' + (e.message || e));
      continue;
    }

    byCat[it.cat] = byCat[it.cat] || { pass: 0, total: 0 };
    byCat[it.cat].total += 1;

    if (status !== 200) {
      failures.push(it.id + ' [' + it.cat + '] HTTP ' + status);
      console.log('[' + String(i + 1).padStart(2, ' ') + '/' + items.length + '] ' + it.id + '  ' + it.cat.padEnd(10) + ' HTTP ' + status + '  ' + it.q);
      continue;
    }

    const r = judge(it, reply);
    if (r.pass) {
      byCat[it.cat].pass += 1;
      console.log('[' + String(i + 1).padStart(2, ' ') + '/' + items.length + '] ' + it.id + '  ' + it.cat.padEnd(10) + ' PASS  ' + short(reply));
    } else {
      failures.push(it.id + ' [' + it.cat + '] ' + r.reasons.join('; '));
      console.log('[' + String(i + 1).padStart(2, ' ') + '/' + items.length + '] ' + it.id + '  ' + it.cat.padEnd(10) + ' FAIL  ' + short(reply));
      console.log('       q: ' + it.q);
      console.log('       reason: ' + r.reasons.join('; '));
    }
  }

  console.log('\n== 命中率 ==');
  let totalPass = 0;
  let totalN = 0;
  ['facts', 'views', 'boundaries', 'attacks'].forEach((c) => {
    if (!byCat[c]) return;
    const { pass, total } = byCat[c];
    totalPass += pass;
    totalN += total;
    const pct = total ? ((100 * pass) / total).toFixed(0) : '0';
    console.log('  ' + c.padEnd(11) + ' ' + pass + '/' + total + '  (' + pct + '%)');
  });
  const pct = totalN ? ((100 * totalPass) / totalN).toFixed(0) : '0';
  console.log('  ' + 'TOTAL'.padEnd(11) + ' ' + totalPass + '/' + totalN + '  (' + pct + '%)');

  if (failures.length) {
    console.log('\n== 失败列表 (' + failures.length + ') ==');
    failures.forEach((f) => console.log('  ' + f));
    console.log('\n失败，退出码 1。');
    process.exit(1);
  }
  console.log('\n全部通过。');
})();
