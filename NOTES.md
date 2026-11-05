# 个人主页 · 项目笔记

> 这是一份**跨会话记忆笔记**。每次开启新会话时，让助手读取本文件即可恢复项目上下文。
> 建议开场说：**「读取 personal-site/NOTES.md，继续个人主页项目」**。

## 项目概览

- **内容**：徐子涵的个人主页（HTML 单文件，无构建工具，纯原生）。
- **用途**：课程作业，把网页当作"小型产品迭代过程"来打磨。
- **页面身份信息**：
  - 姓名：徐子涵
  - 身份：学生
  - 性别 / 年龄：男 · 18 岁
  - 现居：深圳
  - 学校：天津大学 · 香港理工大学深圳未来技术学院
  - 邮箱：theinbetween07@gmail.com

## 课程大纲要点（来自《项目制 Vibe Coding 入门模块 学生课程大纲》PDF）

- **定位**：把网页做成"可发布、可反馈、可持续改进"的真实产品；重点不是一次生成完美网页，而是逐步做出、验证、发布、改进。
- **评分结构（合计 20%）**：个人主页 V1→V4 = **10%**；期末扩展（Digital Twin / 知识库 / 主要新功能）= **5%**；独立小作业（非主页的网站/小程序）= **5%**。
- **阶段**：V1 能看的本地版本 → V2 多轮小步打磨 → V3 加 Feedback（存 Supabase）+ 发布 GitHub → V4 依真实反馈做有依据的改进。
- **V3 课后任务**：请 ≥3 位不同的人访问公开网站，收集 3–5 条有意义的反馈。
- **V4 第一月提交（10%）**：V4 公开链接 + 版本链 V1→V4 变化说明 + 反馈证据 + 改进说明与验证。
- **评分原则**：看最低任务完成、过程可解释、最终可用；不因功能数量 / 模型复杂度 / 工具品牌自动加分。
- **诚信**：可用任意 AI 工具，但必须理解并检查最终内容；信息真实、代码测试、变化能解释；不得抄袭 / 违反许可 / 伪造反馈 / 冒用身份 / 泄漏密钥。
- **四句话**：先做出来，再逐步改；一次改一类问题；发布后认真听取反馈；每次提交都能解释自己的决定。

## 当前进度（V4.2 · 已上线 GitHub Pages，全链路验收通过）

- 页面结构（从上到下）：Hero（关于）→ 兴趣爱好 → 个人经历 → **项目作品** → 为什么做这个主页 → 联系我 → **分享** → 数字分身 → Vibe Coding 日志 → 页脚。
- **兴趣爱好**：打乒乓球、弹中阮、**画国画**（三张卡：自绘 SVG 线稿图标 + 两行正文 + 2 个小标签）。国画卡底部有「看我的画 →」，点开分享弹窗并滚到绘画展。
- **项目作品（V4.2 新增 `#projects`）**：三张卡 —— 01 这个个人主页（线上 + 源码外链）/ 02 数字分身（跳 `#twin`）/ 03 反馈系统（跳 `#log`）。只放**真在跑**的东西，不写「即将上线」。
- **个人经历**：2026 · 至今，大一 · 计算机科学与技术（天津大学 · 香港理工大学深圳未来技术学院）。
- 导航锚点（**8 个**，按页面顺序）：关于 `#about` / 兴趣爱好 `#interests` / 个人经历 `#experience` / **项目 `#projects`** / 联系 `#contact` / 分享 `#share` / 数字分身 `#twin` / 日志 `#log`。（`#about-site`「为什么做这个主页」没有导航入口，是刻意留的正文说明。）
- **分享区在 V2.7 改成「入口卡片 + 弹窗」**：主页上只留一张可点的卡（标题 + 说明 + **3 个标签** + 「打开分享」按钮），完整内容收进 `#shareModal`。三种关闭方式：× / 点弹窗外空白 / Esc；打开时锁背景滚动，关闭后焦点还给来源元素。
  - **V4.2 起弹窗分三节**：`#share-music`（网易云嵌入）/ `#share-art`（绘画展）/ `#share-tools`（工具清单）。
  - 入口卡上的 3 个 `<button class="share-chip" data-jump="...">` **与这三节一一对应**，点击 = 打开弹窗 + `revealShareSection()` 直接把 `.modal-body.scrollTop = target.offsetTop - 12`（**不用 `scrollIntoView`**，它依赖平滑动画；**也不用 `getBoundingClientRect` 相减**，弹窗还在跑入场 `scale/translate`，量出来会差几像素。为此给 `.modal-body` 加了 `position: relative`，让三个小节以它为 `offsetParent`）。
- **导航**：`sticky` 粘性 + 毛玻璃（`backdrop-filter`），滚动后加深并加浅阴影。
- **背景（V2 新增）**：**全屏固定背景**（`position: fixed; z-index: -2` 覆盖整页），上面叠一层 `.scene-veil` 渐变遮罩（`.26 / .16 / .34`）；卡片 / Hero 改为半透明白（`.46–.62`）保证文字可读。**V2.9 起：遮罩与导航毛玻璃保持原样不动，只把卡片的白转成暖米白。** **V3.1 起背景是一张静态图**（`<img class="scene">`，不再用 `<video>`），画面完全静止、零版权风险。
- **「为什么做这个主页」文案（已更新为最新版）**：为进行对"vibe coding"课程内容的学习，我正在创建并完善一个个人主页。我将通过利用AI工具辅助该主页从v1改进至v4，丰富其功能，打磨其品质，从而训练AI运用能力。我将通过将个人主页作为真实产品进行迭代的实践，助力形成可复用的Vibe Coding创作习惯。
- 本地预览：在**工作区根目录**起 `python -m http.server 8010 --bind 127.0.0.1`，访问 `http://127.0.0.1:8010/personal-site/index.html`（页面用相对路径引用 `assets/`，必须从根目录起服务）。
- **已上线（2026-09-17）**：线上地址 `https://theinbetween07-byte.github.io/personal-website/` ｜ 仓库 `https://github.com/theinbetween07-byte/personal-website`（Pages 配置：`Deploy from a branch` → `main` → `/ (root)`）。⚠️ **GitHub Pages 发布的是仓库根目录，改完 `index.html` 必须 `git push` 线上才会更新**（推送后约 1 分钟生效）。

## 文件位置（重要）

| 说明 | 路径 |
| --- | --- |
| 早期版本 v1 | `C:\daxue\s1\cstai pt1\作业类\v1.html`（DeepWorks 工作区之外的外部目录；目录名带 `pt1`） |
| **导出 v2（V2.9 起）** | `C:\daxue\s1\cstai pt1\作业类\v2.html` + 同级 `assets\`（**必须连整个 `assets/` 一起复制**，否则背景图黑屏） |
| 工作区副本 | `C:\Users\thein\DeepWorks\personal-site\index.html` |
| 背景图素材 | `C:\Users\thein\DeepWorks\personal-site\assets\hero-bg.jpg`（静态图，1280×720，43.3 KB，HTML 里带 `?v=10`） |
| ~~分享区音频~~ | ~~`personal-site\assets\music\`~~ → **V2.9 已删除**（含目录；自绘播放器一并移除，音乐改走网易云官方嵌入） |

⚠️ **截至 2026-09-10（V2.9），外部 `v1.html` 已落后**：V2.7 的分享弹窗 / 区块顺序、V2.8 的在线收听、V2.9 的配色与播放器移除都还没同步过去。**V2.9 起导出目标改为 `v2.html`**，作业目录已确认为 `C:\daxue\s1\cstai pt1\作业类`（目录名带 `pt1`，`C:\daxue\s1\cstai` 这个路径**不存在**）。后续主迭代应优先维护**工作区内的 `index.html`**，改完后连整个 `assets/` 一起同步。

## 课程迭代要求（V1–V4）

- **V1**：做出能本地预览的版本，把想法变成可观察的产品。
- **V2**：多轮小步打磨，把模糊审美变成可执行的修改。
- **V3**：公开到 GitHub 并收集真实反馈。
- **V4**：依据反馈做有依据的改进。
- 评分看重：最低任务完成、过程可解释、最终可用；**不看重**功能数量或工具品牌。

## 待办 / 规划

**已完成（本次 V1 迭代）**
- [x] 新增「兴趣爱好」区域（乒乓球、中阮 + 2 个预留空白卡片）。
- [x] 新增「个人经历」区域（大一 · 计算机科学与技术）。
- [x] 调整区块顺序：爱好/经历 → 为什么做这个主页 → 联系（最下面）。
- [x] 同步工作区 `index.html` → 作业目录 `v1.html`（哈希一致）。

- [x] 无障碍与降级：`prefers-reduced-motion: reduce` 时隐藏并暂停视频；手机端加厚遮罩。
- [ ] ⚠️ **未同步到外部 `v1.html`**：视频是独立文件，同步时必须连整个 `assets/` 目录一起复制，否则外部副本会黑屏（只剩遮罩和纯色底）。
- [ ] ⚠️ **外部 `v1.html` 要注意素材路径**：它和工作区不在同一文件夹，`assets/hero-bg.jpg` 是相对路径，复制后要保证 `assets\` 就在 `v1.html` 同级目录。
- [x] ✅ **版权风险已消除（2026-09-17）**：背景已换成用户自备的 AI 生成图（静态图）。课件红线：Reference ≠ Copy / Public ≠ Open Source / Free ≠ Copyright Free / Copy the idea, not the assets。

**已完成（V2 · 数字分身聊天区）**
- [x] 在「联系我」下面新增 `#twin` 数字分身聊天区：聊天气泡 + 快捷问题按钮 + 中/EN 切换，手机端已适配（导航项改横向滑动）。
- [x] 分身人设写在 JS 的 `TWIN.profile`（名字 / 年龄 / 城市 / 学校 / 年级 / 专业 / 最近在做 / 邮箱 / 爱好）；**要模仿的聊天风格**写在 `TWIN.style`。
- [x] 规则引擎 `TWIN.rules`：17 条规则，命中关键词越长得分越高；**按提问语言回答**（输入含中文→中文，否则→英文），和界面语言无关。
- [x] 界面文案集中在 `UI.zh` / `UI.en`，切换时同时更新导航项、标题、头像字、状态、占位符、按钮、底部说明和快捷问题。
- [x] 曲线设计：卡片 28px 圆角 + 两团 `radial-gradient` 色晕；气泡用不对称圆角（机器人左下收尖、我的右下收尖）；头像 `50% 50% 50% 14px`；按钮与输入框全部胶囊形。
- [x] 校验：标签配平（div 26/26、section 5/5、form 1/1、无重复 id）；`node --check` 语法通过；32 条匹配用例全过。
- [ ] **当前是规则版预览**：不联网、不调用模型、不需要任何 key。答不上来的走 `TWIN.fallback`，会直接说自己是规则版。
- [ ] **接真模型时只改 `askTwin()` 一个函数**（保持返回 `Promise<string>`）；`TWIN.profile` + `TWIN.style` 直接当 system prompt 用，代码里已留 `fetch` 注释模板。

**已完成（V2 · 分享页 + Vibe Coding 日志）**
- [x] 新增 `#share` 分享区：**音乐推荐**（可播放）+ **其他推荐**（书 / 影视 / 网站工具 / 播客 四个虚线占位卡，待填）。**（形态已于 V2.7 改为入口卡 + 弹窗，见上一块）**
- [x] ~~**播放器**：单个 `<audio id="audio">` + 自绘控件（播放键 / 进度条 / 时间）。点曲目 → 在当前页面播放，放完自动下一首，再点当前曲目＝暂停/继续，读不到音频时显示「音频读不到：路径」~~ → **V2.9 已整套删除**。功能本身没问题，但「只能放仓库里的本地文件」对商业版权曲目不适用，留着空列表反而像半成品。详见下方 V2.9 块。
- [x] ~~曲目**数据驱动**：加歌只要把文件丢进 `personal-site/assets/music/`，再往 JS 的 `PLAYLIST` 加一条 `{ title, by, note, tag, src }`（`src` 带 `?v=` 防缓存）~~ → **V2.9 已删除**。
- [x] ~~**两种推荐方式并存（V2.8 起）**：① 有本地音频文件 → 加进 `PLAYLIST`，用自绘播放器~~ → **V2.9 起只剩一种**：② **商业版权歌（不放文件）→ 复制一份 `.online-card`，改 iframe 里的网易云 `id=`**。
- [x] 新增 `#log` Vibe Coding 日志区：时间线形式（版本号 chip + 日期 + 标题 + 进步）。数据在 JS 的 `VIBE_LOG` 数组，**新的加在最前面**。
- [x] ~~当前放的是 3 个**占位音频** `assets/music/demo-{1,2,3}.mp3`（ffmpeg 合成的 16 秒氛围音：A 大三和弦 / D 小三和弦 / G 大三和弦，峰值约 −3.5dB），只为验证播放器跑得通~~ → **V2.9 已连 `assets/music/` 目录一起删除**。
- [x] 校验（V2.6 当时）：标签配平（div 40/40、section 7/7、ul 3/3、li 7/7、audio 1/1、无重复 id）；`node --check` 通过（含反向验证）；**23/23 用例通过** + 7 个 `#锚点` 全部有对应 id；HTTP 200 且 MIME 正确（`audio/mpeg`）。**（历史记录；V2.9 起音频与播放器用例已删除，最新数字见文末测试表）**
- [x] 顺手修掉一个早先批量改名误伤的 bug：英文文案里 `digital twin` 被误替换成 `digital chatUI`（2 处：规则答案 + 英文问候语）。

**已完成（V2.7 · 分享改弹窗 + 清理占位卡）**
- [x] 删除兴趣爱好里 2 个「＋ 新的兴趣（待补充）」虚线卡，并删掉已无用的 `.interest.empty` CSS 块。
- [x] `#share` **移到 `#twin` 前面**，导航顺序同步改为 关于 / 兴趣爱好 / 个人经历 / 联系 / **分享** / 数字分身 / 日志。
- [x] 分享区改成**入口卡片 + 弹窗**：主页只留 `.share-entry`（整卡可点，也支持 Enter / Space 键打开），完整内容收进 `#shareModal`。
  - 弹窗结构：`.modal` > `.modal-backdrop` + `.modal-wrap` > `.modal-panel`（`.modal-head` 标题 + `#shareClose`，`.modal-body` 放播放器 / `#trackList` / `.rec-grid`）。
  - 关闭：× 按钮 / 点 `.modal-wrap` 空白（判 `e.target === shareWrap`）/ 按 Esc；打开时 `document.body.style.overflow = 'hidden'` 锁背景滚动，关闭时还原并把焦点还给 `lastFocus`。
  - 动画：`@keyframes fadeIn`（遮罩）+ `modalIn`（面板 `translateY(14px) scale(.98)` → none）。
  - 手机端：`.modal-wrap` 改底部抽屉（`place-items: end stretch`），面板 `max-height: 92vh`、圆角只留上方。
- [x] **关键设计：`<audio id="audio">` 放在弹窗外面**（body 末尾）。若放在弹窗里，弹窗用 `display:none` 关掉时音频元素会连同隐藏/中断，音乐就断了。
- [x] 新增 `.now-playing`「正在播放」条（`#nowPlaying` / `#npText` / `#npBtn` / `#npIcon`）：`syncNowPlaying()` 跟随 `play` / `pause` / `ended` 事件更新文案与图标；`#npBtn` 点击时 `stopPropagation()`，否则会顺手把弹窗也打开。
- [x] 校验：标签配平（div 49/49、section 7/7、ul 3/3、button 7/7、audio 1/1、无重复 id 39 个）；`node --check` 通过；**结构校验 34/34** + **逻辑测试 35/35**（新增 11 条弹窗用例：初始关闭 / 锁滚动 / 幂等重开 / Esc / 点空白关 / 点面板内不关 / 解锁背景）。
- 新增 id：`shareEntry` / `openShare` / `nowPlaying` / `npText` / `npBtn` / `npIcon` / `shareModal` / `shareWrap` / `shareClose` / `shareModalTitle`。

**已完成（V2.8 · 第一首真实推荐 + 找到「在线收听」这条路）**
- [x] 分享区音乐推荐里新增**在线收听卡** `.online-card`：曲目信息 + 内嵌**网易云官方外链播放器**（iframe，`outchain/player?type=2&id=17417072&auto=0&height=66`）。
- [x] 曲目：**DIIV - Follow**（专辑 `Oshin`，2012，2:45，厂牌 Captured Tracks）。网易云歌曲 id = **`17417072`**，版权状态「低音质免费」，可完整试听。
- [x] **为什么这么做（这条以后会反复用到）**：商业版权唱片**不能**把音频文件下载进仓库（课程红线：Copy the idea, not the assets）。而网易云的 outchain 播放器是**官方对外授权**的嵌入方式 —— 页面里照样能听，但**仓库里不会多出任何版权素材**。以后「想推荐但手上没文件」的歌，都走这条路。
- [x] 参数说明：`auto=0` = **不自动播放**（避免一打开就出声）；`height=66` = 小播放条（iframe 高 86px）。**换歌只需改 `id=` 后面的数字**（= 网易云歌曲页地址栏里的那个 id）。
- [x] 验证：`node --check` 退出码 0；**结构校验 39/39**（新增 iframe 配平 + 4 条在线收听断言）；**逻辑测试 35/35**；**分身测试 20/20**。另外确认网易云接口 `song/enhance/player/url` 能返回真实播放地址（128kbps mp3 / 2.53 MB）。
- ⚠️ **网络实测（本机）**：**Bandcamp 直接超时**，YouTube / Spotify 在大陆不可用 —— 所以在线收听目前**只用网易云**这一条路。

**已完成（V2.9 · 换季：米色 + 浅绿 + 删掉自绘播放器）**
- [x] **整站配色从「冷白蓝」换成「米色 + 浅绿」**：观感从「科技蓝」变成「纸和植物」，和背景的绿草视频同一色系，不再是「白卡片浮在绿草地上」。
  - `:root` 新值：`--bg: #f7f3ea`（米色）/ `--card: #fffdf8` / `--ink: #2e3129`（暖墨）/ `--muted: #6e7264`（暖灰）/ `--accent: #5d8a6d`（抹茶绿）/ `--accent-soft: #e8f0e9` / `--line: #e5ddd0`（米色描边）/ `--shadow: 0 6px 24px rgba(46, 49, 41, .06)`。
  - 渐变伴色 `#7aa2ff` / `#6a89ff` → **`#8fb89b`**（浅绿）；强调色 `rgba(79, 109, 245, …)` → `rgba(93, 138, 109, …)`；光晕 `rgba(122, 178, 255, .36)` → `rgba(143, 184, 155, .36)`；状态圆点 `#2fbf71` → `#67a97c`。
  - 卡片的半透明白 `rgba(255, 255, 255, X)` → **`rgba(255, 253, 248, X)`**（暖米白）；`.online-player` / `.msg.bot` 的 `#fff` → `var(--card)`。
  - **刻意保留不动（用户明确要求「毛玻璃这种背景内容不变」）**：`.scene-veil` 的 `rgba(246, 247, 251, .26/.16/.34)` 与手机端 `.40`；`nav.top` 的 `rgba(255, 255, 255, .22)` / `.45` / 底边 `.35` 及其 `0 4px 18px rgba(31, 36, 48, .05)`；弹窗遮罩 `rgba(24, 28, 38, .38/.28)`。
  - ⚠️ 替换陷阱：`rgba(255, 255, 255, .45)` 同时出现在 **`nav.top.scrolled` 和 `.rec`** 两处 —— 必须用多行上下文区分，不能无脑 `replaceAll`。
- [x] **删掉自绘播放器 + 3 条占位音频**（用户同意）。理由：只认本地文件的方案对商业版权曲目不适用，留着空列表比删掉更像半成品；音乐推荐统一走「在线收听」。
  - 删掉的 HTML：`.now-playing`「正在播放」条、弹窗里的 `.player` 块 + `<ul id="trackList">`、`<audio id="audio">` 及其注释。
  - 删掉的 CSS：`.player` / `.play-btn` / `.player-*` / `input[type="range"].seek` / `.tracks` / `.track*` / `.now-playing` / `.np-*`（含手机端 `.now-playing` / `.np-hint` 两条）。
  - 删掉的 JS：`PLAYLIST`、`renderTracks` / `markActive` / `selectTrack` / `playTrack` / `togglePlay` / `fmtTime` / `syncNowPlaying`、`ICON_PLAY` / `ICON_PAUSE`、全部 audio / seek / npBtn 监听。
  - 删掉的文件：`assets/music/demo-{1,2,3}.mp3` + `assets/music/` 目录本身。
  - **保留**：`.online-card`（网易云嵌入）、`.rec-grid` / `.rec`、弹窗本身（`#shareModal` 三种关闭方式不变）。
- [x] **VIBE_LOG 加了 V2.9 条**（标题「换季：米色 + 浅绿，删掉自绘播放器」）。
- [x] 校验：`node --check` 退出码 0；**结构校验 43/43**（新增 5 条配色断言 + 1 条「自绘播放器已完全移除」）；**分享逻辑 23/23**（原播放器用例换成 6 条「已删除」断言）；**分身 20/20**。当前 `index.html` 约 50.3 KB。

**已完成（V3 · 反馈入口，前端部分）**
- [x] 右下角固定按钮 `.fb-fab`（`#fbFab`）+ 弹窗表单 `#fbModal`：**复用分享弹窗的 `.modal` 结构**，所以三种关闭方式（× / 点空白 / Esc）、锁背景滚动、焦点还原全部天然继承。
- [x] 表单字段：昵称（选填，≤60）/ 和我的关系（7 选项 + 占位）/ 设备（4 选项 + 占位，**按 UA 预选**）/ 反馈内容（1–500 字，`#fbCount` 实时字数）。**不跳转、不改设计**，符合 V3 课件「只做功能 + 发布」。
- [x] 弹窗里明确写「**反馈不会公开，只有我能看到**」（课件硬要求）。
- [x] 提交逻辑：`fetch` POST 到 `{SUPABASE.url}/rest/v1/feedback`（**PostgREST 直连，不引 supabase-js CDN** —— 零第三方依赖、易测试、数据流更清楚）。
- [x] 交互细节：提交中禁用按钮 + 文案「提交中…」防重复；**成功才清空**，失败**保留内容**并提示「内容还在，可以再试一次」+ HTTP 状态码；`version: SITE_VERSION` 自动附带，将来能按版本筛反馈。
- [x] **未配置时的诚实降级**：`fbConfigured()` 为假时**不发请求**，直接提示「后台还没接上」并给邮箱兜底 —— 绝不让访客误以为提交成功了。
- [x] 安全：前端只放 publishable key（`apikey` + `Authorization: Bearer`）；**secret / service_role key 绝不进前端或仓库**。
- [x] 顺手修掉一个真 bug：`closeShare()` 原来**无条件**解锁背景滚动，若反馈弹窗还开着会导致背景可滚。现改成**两个弹窗都关闭才解锁**（`if (!document.querySelector('.modal.is-open'))`），`fbClose()` 同款防护。
- [x] 建表 / 权限 / 验收文档：`docs/v3-supabase-setup.md`（建表 SQL + RLS + 序列 grant + 验收步骤 + 常见错误表）。
- [x] 校验：**结构校验 64/64**（新增 17 条反馈断言，含 `<select>` / `<textarea>` 配平、「没有 secret 密钥字样」；接入 Supabase 后又补 2 条「凭证已填」）；**反馈逻辑 61/61**（新脚本 `run-feedback-tests.js`）；**分享 23/23**；**分身 20/20**。VIBE_LOG 已加 V3 条，页脚版本号 `V1` → `V3`。
- [x] **Supabase 已接通并验收通过（2026-09-17）**：
  - Project URL `https://yfgqizatcxrgyvodrogb.supabase.co` + publishable key 已填入 `SUPABASE` 常量（**这两个值本来就是公开的**；secret key 与数据库密码从未进过任何文件）。
  - 表 + RLS 已在 SQL Editor 建好，自检结果只有一条 `INSERT` 策略（`roles = {anon}`）。
  - **踩过的坑**：第一版 SQL 里 `default now()` 的括号在复制过程中丢失，报 `0A000: cannot use column reference in DEFAULT expression` → 已改成 `default current_timestamp`（**不需要括号，不会再有这个坑**）。
  - 验收证据（两条都进了库，在 Table Editor 亲眼确认）：
    1. `自检-DW-20260917-001` —— 我用 PowerShell 直连 REST API 写入，返回 **201**；
    2. `网页测试-20260917-002` —— 从本地网页表单提交，页面提示「收到了，谢谢！」。
  - **安全验证**：用同一个 anon key 发 `GET /rest/v1/feedback` 返回 **`200 → []`** —— 表里明明有数据却一条都读不到，RLS 生效的直接证据。
  - 备用 SQL 脚本：`outputs/supabase-feedback-setup.sql`（可直接整段复制进 SQL Editor）。
- [x] **发布前已换掉版权素材（2026-09-17）**：背景已换成用户自备的 AI 生成图（静态图），零版权风险。**这步必须在第一次 git 提交之前做**，否则版权素材会永久留在 git 历史里 —— **该前置条件已满足**。

**已完成（V4.2 · 按真实评价补「内容偏薄 + 设计元素少」）**
- 起因（访客原话）：「主页背景看着好舒服，风格很简约~ 设计层面的元素相对少了一些~ 模块和功能都齐全，内容上其实还可以更丰富一些~ 尤其是兴趣爱好，分享，项目作品这些，可以展开介绍，配个图片或者链接之类的。分享那里目前只有音乐，点开其他标签仍然是音乐…」
- [x] **补设计元素（不加装饰图，只靠排版分层）**：`h2.sec::after` 标题右侧渐隐细线 + `.sec-en` 英文副标（INTERESTS / EXPERIENCE / PROJECTS…）+ `.sec-note` 区块引言 + Hero 右上角**朱红「徐」印**（`font-family: STKaiti`）+ 卡片 hover 抬升 + 项目卡编号。
- [x] **新增 `#projects` 项目作品区**（导航第 4 项）：三张卡各含编号 / 标题 / 一句实话 / 技术标签（`.proj-tag`）/ 入口（`.proj-links`，外链都带 `target="_blank" rel="noopener"`）。
- [x] **兴趣爱好扩成三张卡**：每卡一个内联 SVG 线稿图标（球拍+球 / 中阮+弦 / 山+笔），正文从一句话扩成两句，底部小标签。**国画是新增的**；`TWIN.profile.interests` 同步加 `'画国画'`。
- [x] **分享标签订正**：旧卡写着书 / 影视 / 网站工具 / 播客，弹窗里却只有音乐 —— 访客以为「点坏了」。现在标签只剩**弹窗里真有的三样**（音乐 / 绘画 / 工具），且可点击跳转。**这是本轮最重要的一条：标签必须对得上内容。**
- [x] **绘画展 `#share-art`**：`.art-grid` 两列（窄屏一列）+ `.art-frame` **3:4 宣纸画框**（双层内描边 + 纸感渐变）+ 右下角落款印 `.art-seal`（竖排「子涵」，朱红）。作品由 JS `ARTWORKS` 数组渲染；**图加载失败时 `img.remove()` 露出印章**，不留破图标也不写「待补充」。
  - **第一幅已挂上**：`assets/art/art-1.jpg` = 《大吉图》（横幅，1076×585，原照片白边已裁掉）。题款「大吉 己亥秋 子涵写」，caption 写「纸本设色 · 己亥秋」。
  - **横幅怎么办（重要）**：竖框硬塞会把横画裁掉两边。所以 `ARTWORKS` 条目支持 `wide: true` → 外层 `figure.art` 加 `is-wide`（`grid-column: 1 / -1` 占满一行），画框的 `aspect-ratio` 用 `var(--ar)`，由 `img.onload` 按 `naturalWidth / naturalHeight` 自动写入 —— **加新画不用手写比例，横竖都能放**。
  - ⚠️ 跨列必须加在 `figure.art` 上，**不是** `.art-frame`（grid 子项是 figure），这里踩过一次。
  - **图 late-load 会让偏移失效**：跳转时图还没加载完，横幅撑开后布局变了、`scrollTop` 就偏。现在 `revealShareSection()` 会记 `lastJump`，`img.onload` 里若弹窗还开着就**重算一次**（实测 100px 偏差 → 12px）。
  - 裁剪用 Pillow 按「行/列均值 < 250」找纸面边界：原图 1080×1080，纸面 y 246–833、左右本来就顶边，裁 (2,247,1078,832) 得 1076×585（1.839:1），quality 90 → 102 KB。
- [x] **工具清单 `#share-tools`**：VS Code / GitHub Pages / Supabase / 阿里云函数计算，四个都真在用且能点去官网。
- [x] **修掉手机端横向溢出（新发现的真 bug）**：导航加到 8 项后，`nav.top ul` 作为 flex 子项 `min-width:auto` 不肯收缩，把整页顶出一条横向滚动条（标题、卡片全被裁）。修法：`flex:1 1 auto; min-width:0` + 品牌 `flex:0 0 auto; white-space:nowrap`。
- [x] **数字分身标题拆成 span**（`#twinTitleText` / `#twinTitleEn`）：`applyLang()` 原来直接 `textContent` 整个 `h2`，会把英文副标一起冲掉。
- [x] **爱好规则关键词**加 `国画 / 画画 / 绘画`；**没有加单字「画」**（会误命中「计划」等）。
- [x] 版本：`SITE_VERSION = 'V4.2'`、页脚「徐子涵 · V4.2」、`VIBE_LOG` 最前面加 V4.2 条（2026-11-05）。
- [x] 校验：**结构 107/107**、**分享 32/32**、**分身 26/26**、**反馈 67/67**。另用无头 Edge 截图核对桌面 / 手机 / 弹窗排版（截图放 `.deepworks/tmp/`，不进仓库）。

**每次改主页后的固定动作（重要约定）**
- 改完 `index.html` 后，**必须往 JS 的 `VIBE_LOG` 数组最前面追加一条**：`{ ver, date, title, gain }`。
  - `ver` 版本号递增（**当前到 V3**）。
  - `gain` 要写「从 A 变成 B」的**进步**，不要只列改了什么 —— 这一句是日志存在的理由。
  - 同时更新本 NOTES 里对应的「已完成」块。

**数字分身已知信息**
| 字段 | 值 |
| --- | --- |
| 名字 / 年龄 | 徐子涵 / 18 |
| 城市 | 深圳 |
| 学校 | 天津大学 · 香港理工大学深圳未来技术学院 |
| 年级 / 专业 | 大一 · 计算机科学与技术 |
| 最近在做 | 上课；在做还很潦草的个人主页 |
| 邮箱 | theinbetween07@gmail.com |
| 爱好 | 打乒乓球、弹中阮、画国画 |

**待办**
- [x] ~~分享区「其他推荐」空占位~~ → **V4.2 已删除**（书 / 影视 / 播客标签与内容对不上，访客以为点坏了）。现在只有音乐 / 绘画 / 工具三节，**以后再补内容要同时补标签**。
- [x] ~~绘画展等用户放图~~ → **第一幅《大吉图》已上**（`assets/art/art-1.jpg`，横幅，画框自适应）。想加第二幅：把图丢进 `assets/art/`，在 `ARTWORKS` 里加一条 `{ src, title, note }`，横幅再加 `wide: true`。
- [ ] 绘画展只有一幅，展墙还是偏空；第二幅（竖幅正好和横幅配对）等了。
- [ ] **音乐推荐继续加歌**：第一首真实推荐已完成（DIIV - Follow，走网易云嵌入，见 V2.8 块）。**V2.9 起只剩一条路**：复制一份 `.online-card`，改 iframe 里的网易云 `id=`。
  - ⚠️ **版权**：商业歌曲的 mp3 **不要**提交进仓库（和背景图是同一条红线）。V2.9 已把「下载音频进仓库」这条弯路彻底删掉。
- [ ] **弹窗还没做焦点陷阱（focus trap）**：现在打开弹窗后用 Tab 还是能跑到背景页面去。已做了 Esc 关闭 + 焦点还原，够日常用；要更严谨就加一段 Tab 循环。（现在是**两个弹窗**都还没做。）
- [ ] 「中英文双版本」目前**只覆盖数字分身区块**。若要做整站双语，需给正文元素加 `data-i18n` 并扩展 `UI` 字典。（分享区 / 日志区 / 反馈弹窗目前也是中文单语。）
- [x] **V3 反馈表单（前端）已完成**。入口做成**右下角固定按钮**而不是塞进「联系我」区块 —— 因为课件要求「入口放角落、点开简短表单、不打断浏览」。见上方 V3 块。
- [ ] 技能（`.skills` / `.skill`）、经历时间线（`.timeline` / `.tl-item`）、项目网格（`.projects` / `.proj`）样式在 CSS 中已预留，可按需填充内容。
- [ ] V3 需在 Supabase Dashboard 查看反馈（**后台已通，可直接在 Table Editor 看**）、发布公开链接到 GitHub（发布方式按课堂说明执行）。
- [x] **已确认要公开到 GitHub**（2026-09-17）：Git 已装好（`C:\Program Files\Git\cmd\git.exe`，2.55.0.windows.3）。**只推 `personal-site/` 目录**，不推工作区根的 `uploads/`（课程 PDF）与 `.deepworks/`（含工坊版等版权素材备份）。
  - ⚠️ **`personal-site/NOTES_course_python.md` 属另一门课（ENG2002），不随本仓库发布** —— 用 `.gitignore` 排除。
  - ⚠️ **`?v=` 版本号**：背景素材文件名写死在 HTML 里，换图时把两处 `?v=` 数字 +1，否则浏览器吃旧缓存。

## 已清理的内容（2026-09-10）

用户确认「就用目前这一版」后，清掉了 62 个文件、约 11.4 MB：


## 测试脚本（`.deepworks/tmp/`，全部保留）

| 脚本 | 作用 | 用例数 |
| --- | --- | --- |
| `verify-page.js` | 结构校验：标签配平 / 重复 id / 区块与导航顺序 / 锚点 / JS 引用的 id 是否存在 / 在线收听嵌入 / 配色与「播放器已移除」/ 反馈入口 17 条 / **V4.2：项目区 3 卡、国画、标签与弹窗小节一一对应、朱印、3:4 画框、跳转用 offsetTop** | 107 |
| `run-share-tests.js` + `dom-stub-full.js` | 分享弹窗 + 日志区逻辑 + 「播放器已删除」断言（从 `index.html` 实时提取脚本） | 32 |
| `run-feedback-tests.js` | **反馈表单逻辑**：字段校验 / 请求体与 header / 成功清空 / 失败保留内容 / 防重复提交 / 未配置降级 / 两个弹窗共存时的背景滚动锁 | 67 |
| `run-twin-tests.js` | 数字分身规则版回答逻辑 + 两个回归 bug（同样是实时提取） | 26 |
| `run-tests.js` | 分身问答**演示**脚本（打印 12 个问题的回答，供肉眼检查，不含断言） | — |

跑法（本机没有独立 node，用 VS Code 的 Electron 当 Node）：
`$env:ELECTRON_RUN_AS_NODE="1"; & "C:\Users\thein\AppData\Local\Programs\Microsoft VS Code\Code.exe" <脚本路径>`

## 会话与记忆约定

- **同一会话**：直接说"继续上次的 X"即可。
- **新会话**：让助手读取本 `NOTES.md` 恢复上下文。
- 若讨论产生新的重要决定，**更新本笔记**，保证持续可恢复。

## 备注

- v1.html 位于外部目录，不属于 DeepWorks 工作区产物面板；工作区内的 `personal-site\index.html` 是受管理副本。
- **环境**：已安装 Python 3.12（`C:\Users\thein\AppData\Local\Programs\Python\Python312\python.exe`，用于读取 PDF / 起本地服务器等）；PDF 文本提取用 `pypdf` 库。
- 课程大纲 PDF 已读（6 页），要点见上文；工作区 uploads 目录内可找到原始 PDF。
