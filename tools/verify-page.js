// 主页结构校验：标签配平 / 重复 id / 区块顺序 / 导航顺序 / getElementById 引用存在性
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const out = [];
let bad = 0;
function chk(name, ok, extra) {
  out.push((ok ? 'PASS  ' : 'FAIL  ') + name + (extra !== undefined ? '   [' + extra + ']' : ''));
  if (!ok) bad++;
}

// ---- 1. 提取内联 JS（给 node --check 用）----
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const js = scripts.join('\n;\n');
// 提取的 JS 写到工作区外的临时目录，跑完不留在工作区里
const jsPath = 'C:/Users/thein/AppData/Local/Temp/opencode/page-check.js';
fs.writeFileSync(jsPath, js, 'utf8');
chk('提取到内联 script 段', scripts.length === 1, scripts.length + ' 段');

// ---- 2. 标签配平 ----
const tags = ['div', 'section', 'ul', 'li', 'span', 'form', 'button', 'h3', 'p', 'nav', 'header', 'footer', 'style', 'script', 'svg', 'iframe', 'select', 'textarea'];
tags.forEach((t) => {
  const open = (html.match(new RegExp('<' + t + '(?=[\\s>])', 'g')) || []).length;
  const close = (html.match(new RegExp('</' + t + '>', 'g')) || []).length;
  chk('<' + t + '> 配平', open === close, open + '/' + close);
});

// ---- 3. CSS 大括号 ----
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const co = (css.match(/\{/g) || []).length;
const cc = (css.match(/\}/g) || []).length;
chk('CSS 大括号配平', co === cc, co + '/' + cc);

// ---- 4. 重复 id ----
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const seen = new Set(), dup = [];
ids.forEach((i) => { if (seen.has(i)) dup.push(i); seen.add(i); });
chk('无重复 id', dup.length === 0, dup.length ? dup.join(',') : ids.length + ' 个 id');

// ---- 5. 区块顺序：share 必须在 twin 之前 ----
const iShare = html.indexOf('<section id="share">');
const iTwin = html.indexOf('<section id="twin">');
const iLog = html.indexOf('<section id="log">');
const iContact = html.indexOf('<section id="contact">');
chk('分享区存在', iShare > -1);
chk('分享区在数字分身【前面】', iShare > -1 && iTwin > -1 && iShare < iTwin, iShare + ' < ' + iTwin);
chk('数字分身在日志区前面', iTwin < iLog);
chk('联系区在分享区前面', iContact < iShare);
const order = ['about', 'interests', 'experience', 'about-site', 'contact', 'share', 'twin', 'log']
  .map((id) => html.indexOf('id="' + id + '"'));
chk('整体区块顺序正确（about 是 header.hero，不是 section）', order.every((v, i) => v > -1 && (i === 0 || v > order[i - 1])), order.join(','));

// ---- 6. 导航顺序 ----
const navBlock = html.slice(html.indexOf('<nav'), html.indexOf('</nav>'));
const navOrder = [...navBlock.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
chk('导航顺序 = 关于/兴趣/经历/联系/分享/分身/日志',
  navOrder.join(',') === 'about,interests,experience,contact,share,twin,log', navOrder.join(','));

// ---- 7. 锚点 vs id ----
const allHrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const idSet = new Set(ids);
const broken = allHrefs.filter((h) => !idSet.has(h));
chk('所有 #锚点都有对应 id', broken.length === 0, broken.length ? broken.join(',') : allHrefs.length + ' 个');

// ---- 8. JS 里 getElementById 引用的 id 都存在 ----
const used = [...js.matchAll(/getElementById\('([^']+)'\)/g)].map((m) => m[1]);
const missing = [...new Set(used)].filter((i) => !idSet.has(i));
chk('JS 引用的 id 都在 HTML 里', missing.length === 0, missing.length ? missing.join(',') : new Set(used).size + ' 个');

// ---- 9. 弹窗关键结构 ----
chk('弹窗有 aria-modal', /id="shareModal"[^>]*aria-modal="true"/.test(html) || /aria-modal="true"[^>]*id="shareModal"/.test(html));
chk('弹窗标题有 aria-labelledby 指向', html.includes('aria-labelledby="shareModalTitle"') && html.includes('id="shareModalTitle"'));
chk('弹窗有 × 关闭按钮', html.includes('id="shareClose"'));
chk('自绘播放器已完全移除', !html.includes('id="audio"') && !js.includes('PLAYLIST') && !html.includes('.track-idx'));

// ---- 10. 兴趣爱好里没有占位卡 ----
const interestsBlock = html.slice(html.indexOf('<section id="interests">'), html.indexOf('</section>', html.indexOf('<section id="interests">')));
chk('兴趣爱好里没有「新的兴趣（待补充）」占位卡', !interestsBlock.includes('新的兴趣'));
chk('CSS 里没有残留 .interest.empty', !html.includes('.interest.empty'));

// ---- 11. 日志最新条目 ----
const v = [...js.matchAll(/ver:\s*'([^']+)'/g)].map((m) => m[1]);
chk('日志最新一条属于 V4 阶段', v[0] === 'V4' || v[0].startsWith('V4.'), v.slice(0, 2).join(' -> '));

// ---- 12. 在线收听：网易云官方嵌入 ----
chk('在线收听卡片存在', html.includes('class="online-card"'));
chk('网易云播放器指向 outchain 单曲', /outchain\/player\?type=2&amp;id=17417072/.test(html));
chk('播放器不自动播放（auto=0）', html.includes('auto=0'));
chk('播放器样式存在', html.includes('.online-player'));

// ---- 13. 配色：米色 + 浅绿（V2.9）----
chk('强调色已换成抹茶绿', html.includes('--accent: #5d8a6d'));
chk('背景已换成米色', html.includes('--bg: #f7f3ea'));
chk('没有残留的旧蓝色', !html.includes('#4f6df5') && !html.includes('#7aa2ff') && !html.includes('rgba(79, 109, 245'));
chk('导航毛玻璃保持原样', html.includes('background: rgba(255, 255, 255, .22);') && html.includes('background: rgba(255, 255, 255, .45);'));
chk('背景遮罩已转暖白（V4）', html.includes('rgba(250, 247, 240, .26)') && html.includes('rgba(250, 247, 240, .40)'));
chk('遮罩里没有残留的冷白', !html.includes('rgba(246, 247, 251'));

// ---- 14. 反馈功能（V3）----
chk('右下角反馈入口存在', html.includes('id="fbFab"'));
chk('入口固定在页面角落', /\.fb-fab\s*\{[\s\S]*?position:\s*fixed/.test(html));
chk('反馈弹窗存在且有 aria-modal', /id="fbModal"[^>]*aria-modal="true"/.test(html));
chk('弹窗标题 aria-labelledby 指向 fbTitle', html.includes('aria-labelledby="fbTitle"') && html.includes('id="fbTitle"'));
chk('明确写了「反馈不会公开」', html.includes('反馈不会公开，只有我能看到'));
chk('关系字段含课件要求的 7 个选项', ['同学', '老师', '家人', '朋友', '同事', '其他', '不便透露'].every((r) => js.includes("'" + r + "'")));
chk('设备字段含课件要求的 4 个选项', ['电脑', '手机', '平板', '其他'].every((d) => js.includes("'" + d + "'")));
chk('提交指向 Supabase 的 feedback 表', js.includes("'/rest/v1/feedback'"));
chk('只用 publishable 级 header（apikey / Bearer）', js.includes('apikey: SUPABASE.publishableKey'));
chk('没把 secret / service_role 密钥写进页面', !/sb_secret_[A-Za-z0-9_-]{8,}/.test(html));
chk('SUPABASE 配置块存在', js.includes('const SUPABASE'));
chk('Supabase Project URL 已填', /url:\s*'https:\/\/[a-z0-9]+\.supabase\.co'/.test(js));
chk('Supabase publishable key 已填', /publishableKey:\s*'sb_publishable_[A-Za-z0-9_-]+'/.test(js));
chk('SITE_VERSION 存在', js.includes('const SITE_VERSION'));
chk('未接后台时不假装成功', js.includes('fbConfigured()'));
chk('提交中会禁用按钮（防重复）', js.includes('fb.submitBtn.disabled = true'));
chk('失败时保留内容并可重试', js.includes('内容还在，可以再试一次'));
chk('随机附带的版本号字段名是 version', /version:\s*SITE_VERSION/.test(js));
chk('页脚版本号已更新到 V4', html.includes('徐子涵 · V4'));
chk('SITE_VERSION 同步到 V4', /const SITE_VERSION = 'V4'/.test(js));

// ---- 15. V4：分享预览与元信息 ----
chk('og 分享预览标签齐全', ['og:type', 'og:title', 'og:description', 'og:url', 'og:image'].every((p) => html.includes('property="' + p + '"')));
chk('og:image 用绝对地址（社交平台才抓得到图）', /property="og:image"\s+content="https:\/\//.test(html));
chk('twitter 卡片标签存在', html.includes('name="twitter:card"'));
chk('favicon 已引用', html.includes('rel="icon"') && html.includes('assets/favicon.svg'));
chk('favicon 素材文件存在', fs.existsSync(path.join(root, 'assets', 'favicon.svg')));
const descTag = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
chk('description 与页面真实区块一致（不提技能/项目）', descTag.indexOf('技能') === -1 && descTag.indexOf('项目') === -1, descTag);
chk('联系区不再提「合作」', !html.includes('想聊聊合作'));
chk('手机端播放器残留样式已删除', !css.includes('.track-note') && !/\.play-btn\s*\{/.test(css));

// ---- 16. V4：数字分身匹配与兜底 ----
chk('英文关键词走整词匹配（wordify）', js.includes('const wordify') && js.includes('hasCJK'));
chk('兜底文案是多条轮换', /fallback:\s*\{[\s\S]*?zh:\s*\[/.test(js) && js.includes('function nextFallback'));
chk('兜底不再用单条字符串赋值', !/fallback:\s*\{\s*zh:\s*'/.test(js));

// ---- 17. V4：简单修改（占位卡 / 首屏 / 导航提示 / 手机字号）----
chk('分享弹窗里不再有「待补充」占位卡', !/<div class="rec">/.test(html) && !html.includes('其他推荐</h3>'));
chk('推荐位 CSS 仍保留（想填内容时能直接用）', html.includes('.rec-grid') && html.includes('.rec {'));
chk('首屏补上了 tagline 自我介绍', /<p class="tagline">[^<]{10,}<\/p>/.test(html));
chk('导航溢出时有右侧渐隐提示', html.includes('mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 24px)'));
chk('手机端正文字号提升（家人反馈）', html.includes('.log-gain { font-size: 14.5px; }') && html.includes('.msg { max-width: 90%; font-size: 15px; }'));
chk('固定按钮避开底部安全区', html.includes('env(safe-area-inset-bottom'));

// ---- 18. V4(F6)：弹窗规矩（一次只开一个 / 焦点陷阱 / Esc 只关最上层）----
chk('有弹窗栈与「最上层」判定', js.includes('const modalStack') && js.includes('function currentModal'));
chk('Esc 与 Tab 只在统一的一处处理', (js.match(/document\.addEventListener\('keydown'/g) || []).length === 1,
  (js.match(/document\.addEventListener\('keydown'/g) || []).length);
chk('Tab 焦点陷阱：首尾循环', js.includes("e.key !== 'Tab'") && js.includes('function focusablesIn') && js.includes('shiftKey ? last : first'));
chk('打开某个弹窗会先关掉另一个（不叠开）', js.includes('if (fbIsOpen()) fbClose()') && js.includes('if (isShareOpen()) closeShare()'));
chk('另一个入口会被禁用', js.includes('function setEntryEnabled') && js.includes('setEntryEnabled(fb.fab, false)') && js.includes('setEntryEnabled(shareEntry, false)'));
chk('禁用态有样式兜底', html.includes('.share-entry.is-disabled') && html.includes('.fb-fab:disabled'));
chk('Esc 只关栈顶那个', /if \(e\.key === 'Escape'\) \{\s*top\.onEscape\(\)/.test(js));

console.log(out.join('\n'));
console.log('\n' + out.filter((l) => l.startsWith('PASS')).length + '/' + out.length + ' passed');
if (bad) process.exitCode = 1;
