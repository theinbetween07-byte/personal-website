// 在 Node 里跑 index.html 的真实脚本，验证「反馈表单」的逻辑（V3）
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('FAIL: 找不到 <script> 块'); process.exit(1); }
const js = m[1];

require('./dom-stub-full.js');

const tests = `
var __r = [];
function chk(name, cond, extra) {
  __r.push((cond ? 'PASS  ' : 'FAIL  ') + name + (extra !== undefined ? '   [' + extra + ']' : ''));
}

var calls = [];
// 桩不解析 HTML 的 class 属性，手动补上页面里本来就有的 class
document.getElementById('shareModal').classList.add('modal');
document.getElementById('fbModal').classList.add('modal');
function okFetch(status, body) {
  return function (url, opt) {
    calls.push({ url: url, opt: opt });
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status: status,
      text: function () { return Promise.resolve(body || ''); }
    });
  };
}
function goodFetch() { return { ok: true, status: 201, text: function () { return Promise.resolve(''); } }; }

(async function () {
  // ---------- 结构 ----------
  chk('右下角入口存在', !!document.getElementById('fbFab'));
  chk('反馈弹窗存在', !!document.getElementById('fbModal'));
  chk('初始：弹窗是关的', !fbIsOpen());
  chk('初始：背景没被锁', !document.body.style.overflow);

  chk('关系选项 = 7 + 占位', fb.relation.children.length === FB_RELATIONS.length + 1, fb.relation.children.length);
  chk('设备选项 = 4 + 占位', fb.device.children.length === FB_DEVICES.length + 1, fb.device.children.length);
  chk('第一项是「请选择」', fb.relation.children[0].textContent === '请选择', fb.relation.children[0].textContent);
  chk('关系含「不便透露」', FB_RELATIONS.indexOf('不便透露') > -1);
  chk('设备按桌面 UA 预选「电脑」', fb.device.value === '电脑', fb.device.value);
  chk('SITE_VERSION = V4 系列', SITE_VERSION.indexOf('V4') === 0, SITE_VERSION);
  chk('已填好 Supabase 配置', fbConfigured() === true, SUPABASE.url);

  // ---------- 未配置：不要假装成功 ----------
  // 先把真实配置存起来，临时清空来模拟「还没接后台」的情况
  var savedUrl = SUPABASE.url;
  var savedKey = SUPABASE.publishableKey;
  SUPABASE.url = '';
  SUPABASE.publishableKey = '';
  global.fetch = okFetch(201, '');
  calls.length = 0;
  fb.message.value = '这是一条测试反馈';
  fb.relation.value = '同学';
  fb.device.value = '手机';
  await fbSubmit({ preventDefault: function () {} });
  chk('未配置时不发请求', calls.length === 0, calls.length);
  chk('未配置时给出真实提示', fb.state.textContent.indexOf('后台还没接上') > -1, fb.state.textContent);
  chk('未配置时标成错误态', fb.state.classList.contains('is-err'));

  // ---------- 恢复真实配置 ----------
  SUPABASE.url = savedUrl;
  SUPABASE.publishableKey = savedKey;
  chk('恢复真实配置后 fbConfigured() = true', fbConfigured() === true);

  // ---------- 校验：缺关系 ----------
  calls.length = 0;
  fb.relation.value = '';
  await fbSubmit({ preventDefault: function () {} });
  chk('缺关系：不发请求', calls.length === 0);
  chk('缺关系：提示选关系', fb.state.textContent.indexOf('关系') > -1, fb.state.textContent);

  // ---------- 校验：缺设备 ----------
  fb.relation.value = '同学';
  fb.device.value = '';
  await fbSubmit({ preventDefault: function () {} });
  chk('缺设备：不发请求', calls.length === 0);
  chk('缺设备：提示选设备', fb.state.textContent.indexOf('设备') > -1, fb.state.textContent);

  // ---------- 校验：内容太短 ----------
  fb.device.value = '手机';
  fb.message.value = '啊';
  await fbSubmit({ preventDefault: function () {} });
  chk('内容太短：不发请求', calls.length === 0);
  chk('内容太短：给出提示', fb.state.textContent.length > 0, fb.state.textContent);

  // ---------- 正常提交 ----------
  global.fetch = okFetch(201, '');
  calls.length = 0;
  fb.name.value = '  小王  ';
  fb.relation.value = '同学';
  fb.device.value = '手机';
  fb.message.value = '  手机上导航要横向滑，一开始没发现  ';
  await fbSubmit({ preventDefault: function () {} });

  chk('正常提交：发了一次请求', calls.length === 1, calls.length);
  var c = calls[0] || { url: '', opt: {} };
  chk('请求地址 = {ProjectURL}/rest/v1/feedback', c.url === SUPABASE.url + '/rest/v1/feedback', c.url);
  chk('请求方法 = POST', c.opt.method === 'POST', c.opt.method);
  chk('带上 apikey', c.opt.headers && c.opt.headers.apikey === SUPABASE.publishableKey);
  chk('带上 Authorization Bearer', c.opt.headers && c.opt.headers.Authorization === 'Bearer ' + SUPABASE.publishableKey);
  var row = JSON.parse(c.opt.body);
  chk('自动附带 version = V4 系列', row.version.indexOf('V4') === 0, row.version);
  chk('昵称去掉首尾空格', row.name === '小王', row.name);
  chk('内容去掉首尾空格', row.message === '手机上导航要横向滑，一开始没发现', row.message);
  chk('关系和设备随表单一起提交', row.relation === '同学' && row.device === '手机');
  chk('成功后提示「收到了」', fb.state.textContent.indexOf('收到了') > -1, fb.state.textContent);
  chk('成功后标成成功态', fb.state.classList.contains('is-ok'));
  chk('成功后调用了表单 reset', typeof fb.form.reset === 'function');

  // ---------- 昵称留空 -> null ----------
  calls.length = 0;
  fb.name.value = '';
  fb.relation.value = '朋友';
  fb.device.value = '电脑';
  fb.message.value = '再来一条反馈';
  await fbSubmit({ preventDefault: function () {} });
  var row2 = JSON.parse(calls[0].opt.body);
  chk('昵称留空提交 null（不是空字符串）', row2.name === null, String(row2.name));

  // ---------- 失败：保留内容 + 可重试 ----------
  global.fetch = okFetch(403, 'new row violates row-level security policy');
  calls.length = 0;
  fb.message.value = '这条会失败，内容要留着';
  var before = fb.message.value;
  await fbSubmit({ preventDefault: function () {} });
  chk('失败：发过请求', calls.length === 1);
  chk('失败：提示没成功', fb.state.textContent.indexOf('没提交成功') > -1, fb.state.textContent);
  chk('失败：标成错误态', fb.state.classList.contains('is-err'));
  chk('失败：内容原样保留', fb.message.value === before, fb.message.value);
  chk('失败：按钮恢复可点', fb.submitBtn.disabled === false);
  chk('失败：状态码写进提示', fb.state.textContent.indexOf('403') > -1, fb.state.textContent);

  // ---------- 防重复提交 ----------
  var resolvers = [];
  global.fetch = function (url, opt) {
    calls.push({ url: url, opt: opt });
    return new Promise(function (res) { resolvers.push(res); });
  };
  calls.length = 0;
  fb.relation.value = '同学';
  fb.device.value = '手机';
  fb.message.value = '防重复提交测试';
  var p1 = fbSubmit({ preventDefault: function () {} });
  chk('提交中：按钮被禁用', fb.submitBtn.disabled === true);
  chk('提交中：按钮文案是「提交中…」', fb.submitBtn.textContent === '提交中…', fb.submitBtn.textContent);
  await fbSubmit({ preventDefault: function () {} });
  chk('提交中再点：不会发第二个请求', calls.length === 1, calls.length);
  resolvers.forEach(function (res) { res(goodFetch()); });
  await p1;
  chk('提交完：按钮恢复可点', fb.submitBtn.disabled === false);
  chk('提交完：按钮文案回到「提交」', fb.submitBtn.textContent === '提交', fb.submitBtn.textContent);

  // ---------- 弹窗开关 ----------
  fbOpen();
  chk('打开：弹窗 is-open', fbIsOpen());
  chk('打开：锁住背景滚动', document.body.style.overflow === 'hidden', document.body.style.overflow);
  fbOpen();
  chk('重复打开仍是开的', fbIsOpen());
  document.dispatch('keydown', { key: 'Escape' });
  chk('Esc 能关闭', !fbIsOpen());
  chk('Esc 关闭后解锁背景', document.body.style.overflow === '', document.body.style.overflow);

  fbOpen();
  fb.wrap.dispatch('click', { target: fb.wrap });
  chk('点弹窗外空白关闭', !fbIsOpen());
  fbOpen();
  fb.wrap.dispatch('click', { target: fb.modal });
  chk('点面板内部不关闭', fbIsOpen());
  fbClose();

  // ---------- V4(F6)：一次只开一个 + 入口互相禁用 ----------
  openShare();
  chk('分享开着：反馈入口被禁用', fb.fab.classList.contains('is-disabled'));
  chk('分享开着：反馈入口 Tab 也进不去', fb.fab.tabIndex === -1, fb.fab.tabIndex);
  fbOpen();
  chk('打开反馈会先关掉分享（不叠开）', !isShareOpen() && fbIsOpen());
  chk('反馈开着：分享入口被禁用', shareEntry.classList.contains('is-disabled'));
  chk('反馈开着：背景仍然锁着', document.body.style.overflow === 'hidden', document.body.style.overflow);
  openShare();
  chk('打开分享会先关掉反馈（不叠开）', !fbIsOpen() && isShareOpen());
  closeShare();
  chk('都关了：两个入口都恢复可用', !fb.fab.classList.contains('is-disabled') && !shareEntry.classList.contains('is-disabled'));
  chk('都关了：解锁背景', document.body.style.overflow === '', document.body.style.overflow);

  // ---------- 回归：真出现「两个都开」的异常状态时，close 不会误解锁 ----------
  openShare();
  fb.modal.classList.add('is-open');   // 绕过入口互斥，强行叠开
  trackOpen(fb.modal, null, fbClose);
  fbClose();
  chk('异常叠开时：关掉上层后背景仍锁着', document.body.style.overflow === 'hidden', document.body.style.overflow);
  chk('异常叠开时：分享还开着', isShareOpen());
  closeShare();
  chk('两个都关了才解锁背景', document.body.style.overflow === '', document.body.style.overflow);

  // ---------- 回归：分享 / 日志没被破坏 ----------
  chk('分享弹窗逻辑仍在', typeof openShare === 'function' && typeof closeShare === 'function');
    chk('日志第一条属于 V4 阶段', VIBE_LOG[0].ver === 'V4' || VIBE_LOG[0].ver.startsWith('V4.'), VIBE_LOG[0].ver);
  chk('日志条数随迭代增长（≥11）', VIBE_LOG.length >= 11, VIBE_LOG.length);
  chk('日志 V4 那条有 gain', !!VIBE_LOG[0].gain && VIBE_LOG[0].gain.length > 20);

  console.log(__r.join('\\n'));
  var failed = __r.filter(function (line) { return line.indexOf('FAIL') === 0; }).length;
  console.log('\\n' + (__r.length - failed) + '/' + __r.length + ' passed');
  if (failed) process.exitCode = 1;
})();
`;

vm.runInThisContext(js + '\n' + tests);
