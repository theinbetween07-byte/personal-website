// 在 Node 里跑 index.html 的真实脚本，验证数字分身（规则版）的回答逻辑
// 说明：这是从 index.html 实时提取脚本，不是快照副本 —— 主页一改，测试跟着变。
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('FAIL: 找不到 <script> 块'); process.exit(1); }
let js = m[1];

require('./dom-stub-full.js');

const tests = `
var __r = [];
function chk(name, cond, extra) {
  __r.push((cond ? 'PASS  ' : 'FAIL  ') + name + (extra !== undefined ? '   [' + extra + ']' : ''));
}
function hasZh(s) { return /[\\u4e00-\\u9fa5]/.test(s); }

// --- 规则表本身 ---
chk('规则条数 >= 17', TWIN.rules.length >= 17, TWIN.rules.length);
chk('每条规则都有 关键词/中文/英文',
  TWIN.rules.every(function (r) { return r.k && r.k.length && r.zh && r.en; }));
chk('profile 有名字和邮箱', !!TWIN.profile.name && !!TWIN.profile.email);
chk('fallback 中英文都是多条文案', Array.isArray(TWIN.fallback.zh) && TWIN.fallback.zh.length >= 2 && Array.isArray(TWIN.fallback.en) && TWIN.fallback.en.length >= 2, TWIN.fallback.zh.length + '/' + TWIN.fallback.en.length);

// --- 语言跟随提问，与界面语言无关 ---
chk('中文提问 -> 中文回答', hasZh(answerFor('你叫什么名字')));
chk('英文提问 -> 英文回答', !hasZh(answerFor('what is your name')));

// --- 各话题命中 ---
chk('名字', answerFor('你叫什么名字').indexOf('徐子涵') > -1, answerFor('你叫什么名字'));
chk('年龄', answerFor('你多大了').indexOf('18') > -1);
chk('城市', answerFor('你住在哪').indexOf('深圳') > -1);
chk('学校', answerFor('你在哪个学校').indexOf('天津大学') > -1);
chk('专业', answerFor('你学什么专业').indexOf('计算机') > -1);
chk('年级', answerFor('你大几').indexOf('大一') > -1);
chk('最近在做什么', answerFor('你最近在做什么').indexOf('上课') > -1);
chk('爱好', answerFor('你有什么爱好').indexOf('乒乓球') > -1);
chk('联系方式', answerFor('怎么联系你').indexOf('theinbetween07@gmail.com') > -1);
chk('英文爱好', answerFor('what are your hobbies').indexOf('Table tennis') > -1);

// --- 兜底：答不上来要老实说（V4 起是多条轮换，所以判断「落在列表里」而不是等于某一条）---
chk('无关中文问题 -> 兜底', TWIN.fallback.zh.indexOf(answerFor('今天天气怎么样')) > -1, answerFor('今天天气怎么样'));
chk('无关英文问题 -> 兜底', TWIN.fallback.en.indexOf(answerFor('do you like pineapple pizza')) > -1, answerFor('do you like pineapple pizza'));

// --- 回归 bug（之前修过的两个）---
chk('回归：你会弹什么乐器 -> 命中爱好，不掉兜底', answerFor('你会弹什么乐器').indexOf('中阮') > -1, answerFor('你会弹什么乐器'));
chk('回归：今天深圳天气怎么样 -> 走兜底，不误命中城市', TWIN.fallback.zh.indexOf(answerFor('今天深圳天气怎么样')) > -1, answerFor('今天深圳天气怎么样'));

// --- V4：英文短关键词改成整词匹配，不能再误命中 ---
chk('V4：which school 不能命中 hi 问候语', answerFor('which school do you go to').indexOf('Tianjin University') > -1, answerFor('which school do you go to'));
chk('V4：which city 不能命中 hi 问候语', answerFor('which city do you live in').indexOf('Shenzhen') > -1, answerFor('which city do you live in'));
chk('V4：独立输入的 hi 仍命中问候语', answerFor('hi').indexOf('Hey') > -1, answerFor('hi'));
chk('V4：this page 走主页规则而不是 hi', answerFor('tell me about this page').indexOf('v1 all the way to v4') > -1, answerFor('tell me about this page'));
chk('V4：多词英文短语仍能命中（are you ai）', answerFor('are you ai').indexOf('digital twin') > -1, answerFor('are you ai'));
chk('V4：兜底连续两次文案不同', (function () {
  var a = answerFor('aaa qqq zzz'), b = answerFor('bbb www yyy');
  return a !== b && TWIN.fallback.en.indexOf(a) > -1 && TWIN.fallback.en.indexOf(b) > -1;
})());

console.log(__r.join('\\n'));
var failed = __r.filter(function (line) { return line.indexOf('FAIL') === 0; }).length;
console.log('\\n' + (__r.length - failed) + '/' + __r.length + ' passed');
if (failed) process.exitCode = 1;
`;

js = js + '\n' + tests;
vm.runInThisContext(js);
