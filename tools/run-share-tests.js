// 在 Node 里跑 index.html 的真实脚本，验证分享弹窗 + 日志区的渲染与互动逻辑
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

// 桩不解析 HTML 的 class 属性，手动补上页面里本来就有的 class
document.getElementById('shareModal').classList.add('modal');
document.getElementById('fbModal').classList.add('modal');

// --- 分享区：自绘播放器已彻底移除（V2.9）---
chk('PLAYLIST 已删除', typeof PLAYLIST === 'undefined');
chk('renderTracks 已删除', typeof renderTracks === 'undefined');
chk('togglePlay 已删除', typeof togglePlay === 'undefined');
chk('fmtTime 已删除', typeof fmtTime === 'undefined');
chk('trackList 已删除', typeof trackList === 'undefined');
chk('audio 变量已删除', typeof audio === 'undefined');

// --- 分享弹窗 ---
chk('初始：弹窗是关的', !isShareOpen());
chk('初始：背景没被锁', !document.body.style.overflow, document.body.style.overflow);
openShare();
chk('打开后：is-open', isShareOpen());
chk('打开后：锁住背景滚动', document.body.style.overflow === 'hidden', document.body.style.overflow);
openShare(); // 重复点不应出错
chk('重复打开仍是开的', isShareOpen());
closeShare();
chk('关闭后：不再 is-open', !isShareOpen());
chk('关闭后：解锁背景', document.body.style.overflow === '', document.body.style.overflow);

openShare();
document.dispatch('keydown', { key: 'Escape' });
chk('Esc 能关闭', !isShareOpen());
chk('Esc 关闭后也解锁', document.body.style.overflow === '', document.body.style.overflow);

openShare();
shareWrap.dispatch('click', { target: shareWrap });           // 点空白处
chk('点弹窗外空白关闭', !isShareOpen());
openShare();
shareWrap.dispatch('click', { target: shareModal });          // 点面板内部
chk('点面板内部不关闭', isShareOpen());
closeShare();

// --- V4(F6)：焦点陷阱 + 入口互斥 + Esc 只关最上层 ---
openShare();
chk('分享开着：反馈入口被禁用', fb.fab.classList.contains('is-disabled'));
chk('分享开着：反馈入口 Tab 也进不去', fb.fab.tabIndex === -1, fb.fab.tabIndex);
var tabPrevented = 0;
document.dispatch('keydown', { key: 'Tab', shiftKey: false, preventDefault: function () { tabPrevented++; } });
chk('分享开着：Tab 被陷阱接管（不会漏回背景）', tabPrevented === 1, tabPrevented);
var shiftPrevented = 0;
document.dispatch('keydown', { key: 'Tab', shiftKey: true, preventDefault: function () { shiftPrevented++; } });
chk('分享开着：Shift+Tab 同样被接管', shiftPrevented === 1, shiftPrevented);
closeShare();
var freeTab = 0;
document.dispatch('keydown', { key: 'Tab', shiftKey: false, preventDefault: function () { freeTab++; } });
chk('都关了：Tab 不再被拦（页面恢复正常）', freeTab === 0, freeTab);

// 真叠开时，一次 Esc 只关最上面那层
openShare();
document.getElementById('fbModal').classList.add('is-open');   // 绕过入口互斥，强行叠开
trackOpen(document.getElementById('fbModal'), null, fbClose);
document.dispatch('keydown', { key: 'Escape' });
chk('Esc 只关最上层：反馈关了、分享还在', !fbIsOpen() && isShareOpen());
chk('关掉上层后背景仍锁着', document.body.style.overflow === 'hidden', document.body.style.overflow);
document.dispatch('keydown', { key: 'Escape' });
chk('再按一次 Esc 才轮到分享', !isShareOpen());
chk('两个都关了才解锁背景', document.body.style.overflow === '', document.body.style.overflow);

// --- 日志区 ---
var logList = document.getElementById('logList');
chk('日志渲染 ' + VIBE_LOG.length + ' 条', logList.children.length === VIBE_LOG.length, logList.children.length);
chk('最新一条在最上面 = ' + VIBE_LOG[0].ver, logList.children[0].children[0].children[0].textContent === VIBE_LOG[0].ver,
    logList.children[0].children[0].children[0].textContent);
chk('最新一条属于 V4 阶段', VIBE_LOG[0].ver === 'V4' || VIBE_LOG[0].ver.startsWith('V4.'), VIBE_LOG[0].ver);
chk('日志有标题', !!logList.children[0].children[1].textContent);
chk('增益文案非空', !VIBE_LOG.some(function (i) { return !i.ver || !i.date || !i.title || !i.gain; }));
chk('版本号唯一', (function () {
  var s = {}; var dup = false;
  VIBE_LOG.forEach(function (i) { if (s[i.ver]) dup = true; s[i.ver] = 1; });
  return !dup;
})());

console.log(__r.join('\\n'));
var failed = __r.filter(function (line) { return line.indexOf('FAIL') === 0; }).length;
console.log('\\n' + (__r.length - failed) + '/' + __r.length + ' passed');
if (failed) process.exitCode = 1;
`;

js = js + '\n' + tests;

// --- 导航锚点 vs section id（用原始 HTML 检查）---
const linkHrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((x) => x[1]);
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((x) => x[1]));
const broken = linkHrefs.filter((h) => !ids.has(h));
console.log('=== 导航锚点检查 ===');
console.log(broken.length ? '  FAIL 悬空锚点: ' + broken.join(', ') : '  PASS 所有 ' + linkHrefs.length + ' 个 #锚点都有对应 id');
console.log('');

vm.runInThisContext(js);
