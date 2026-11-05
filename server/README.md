# 数字分身后端（twin-server）

个人主页上那个聊天框，背后真正调用大模型的地方。

- **零依赖**：只用 Node 内置模块和全局 `fetch`，`npm install` 都不用跑
- **Node ≥ 18**
- **key 只在服务端**：`index.html` 里永远不会出现 key

```
server/
├─ twin-config.json   ← 资料 / 说话规则 / 边界（唯一权威副本）
├─ twin-server.js     ← HTTP 服务 + 云函数入口
├─ eval.js            ← 跑 45 道题，统计命中率
├─ twin-eval.json     ← 题库（事实 / 观点 / 泛化 / 未知 / 边界 / 攻击）
├─ package.json
├─ .env.example       ← 复制成 .env 再填 key
└─ README.md          ← 你正在看的这个
```

---

## 一、本机跑起来

### 1. 先反思一下

这是静态页 + 一个后端。页面本身（`../index.html`）可以直接双击打开，但**接真模型必须起后端**：

```
浏览器 → POST http://127.0.0.1:8787/api/twin → DeepSeek → 返回 { reply }
```

key 只在第 2 步里出现，前端拿不到。

### 2. 设 key 并启动

```powershell
# 在 personal-site\server 目录下
$env:TWIN_API_KEY="sk-你的key"
node twin-server.js
```

看到这几行就对了：

```
[twin] listening on http://127.0.0.1:8787
[twin] model=deepseek-chat  baseUrl=https://api.deepseek.com/v1
[twin] key=configured
[twin] allowedOrigin=*
```

不想每次设环境变量，就把 `.env.example` 复制成 `.env` 再填 key —— 服务端启动时会自己读 `.env`（已存在的环境变量优先）。`.env` 已经在 `.gitignore` 里。

### 3. 验证接口

```powershell
# 健康检查
Invoke-RestMethod http://127.0.0.1:8787/healthz
# → { ok: true, model: "deepseek-chat" }

# 问一句
Invoke-RestMethod http://127.0.0.1:8787/api/twin -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes('{"message":"你叫什么名字？","lang":"zh"}'))
# → { reply: "徐子涵，18 岁，深圳……" }
```

> PowerShell 发中文必须用 `UTF8.GetBytes`，直接传字符串会乱码。

### 4. 让页面连上后端

打开 `../index.html`，把这一行：

```js
endpoint: '',
```

改成：

```js
endpoint: 'http://127.0.0.1:8787/api/twin',
```

刷新页面，状态条会从「规则版预览」变成「模型版」。

> ⚠️ 改完 endpoint 后跑回归脚本会挂 —— 脚本默认按 `endpoint: ''` 检查。联调完记得改回去，或者用 `TWIN_ENDPOINT` 环境变量/临时副本测试（本项目没做这个开关，改回去最省事）。

### 5. 跑评估

```powershell
$env:TWIN_API_KEY="sk-你的key"
node eval.js
```

打印六类命中率；任何一题失败，退出码为 `1`。

---

## 二、CORS 怎么配

浏览器里的页面和后端不同源（GitHub Pages 是 `theinbetween07-byte.github.io`，后端在别处），所以必须让后端回 CORS 头。

默认 `ALLOWED_ORIGIN=*` —— 谁都能调，**仅限演示**。

正式一点：

```powershell
$env:ALLOWED_ORIGIN="https://theinbetween07-byte.github.io"
node twin-server.js
```

多个来源用逗号分隔：

```powershell
$env:ALLOWED_ORIGIN="https://theinbetween07-byte.github.io,http://127.0.0.1:8010"
```

白名单里没有的来源，服务端**不会**回 `Access-Control-Allow-Origin`，浏览器会自己拦下来。

> 注意：CORS 不是安全边界。真正的安全靠「服务端限流 + 边界预检 + key 不外泄」。别人用 curl 绕过浏览器照样能调你的接口 —— 所以限流（默认每 IP 每分钟 30 次）和 `max_tokens` 上限要留着。

---

## 三、部署到国内云函数

**为什么不用 Cloudflare Workers**：`*.workers.dev` 的域名在国内访问**极不稳定**（被墙、丢包、超时都有），访客大概率打不开。老师的要求里也明确写了「国内访客不能用 Cloudflare workers.dev」。国内访客用**阿里云函数计算**或**腾讯云函数**，域名在境内，延迟低。

### A. 阿里云函数计算 FC（HTTP 触发器）

1. 控制台 → 函数计算 → 创建函数 → **运行环境 Node.js 18** → 创建
2. 代码：把 `server/` 目录整个传上去（或在线编辑），入口文件 `twin-server.js`，**请求处理程序**填 `twin-server.handler`
3. 配置 → 环境变量：
   - `TWIN_API_KEY=sk-...`
   - `TWIN_BASE_URL=https://api.deepseek.com/v1`
   - `TWIN_MODEL=deepseek-chat`
   - `ALLOWED_ORIGIN=https://theinbetween07-byte.github.io`（或 `*`）
4. 触发器 → 创建 **HTTP 触发器** → 请求方法勾 `GET, POST, OPTIONS` → 拿到公网地址
5. 把地址拼成 `https://<你的FC地址>/api/twin`，填进 `index.html` 的 `TWIN.endpoint`

`handler(event, context)` 已经按 FC 的 HTTP 触发器格式写好：读 `event.httpMethod / headers / body`，返回 `{ statusCode, headers, body }`。

> FC 超时时间默认 3 秒，**去「配置 → 超时时间」改成 30 秒**，否则 20 秒的模型超时还没走完函数就先被掐了。

### B. 腾讯云函数 SCF（API 网关触发）

1. 控制台 → 云函数 → 新建 → **Node.js 18** → 空白函数
2. 上传 `server/` 目录（保持 `twin-config.json` 和 `twin-server.js` 同目录）
3. **执行方法**填 `twin-server.handler`
4. 函数配置 → 环境变量同上（`TWIN_API_KEY` 等）
5. 触发器 → **API 网关触发** → 路径选 `/api/twin` → 方法勾 `GET, POST, OPTIONS` → 发布
6. 把 API 网关给的公网地址填进 `TWIN.endpoint`

SCF 的 `event` 结构与 FC 略有差别（`httpMethod` / `headers` / `body`），`handler` 里已经做了兼容；`body` 为字符串时直接解析，为对象时 `JSON.stringify` 后再解析。

> SCF 默认超时 3 秒，同样要在「函数配置」里调到 30 秒；内存 128 MB 足够。

### C. 只想本机演示

不用部署。`TWIN.endpoint` 留空就是纯规则版（GitHub Pages 上现在的状态）；本机联调改成 `http://127.0.0.1:8787/api/twin` 即可，只要能起 `node twin-server.js`。

---

## 四、参数（写在 `twin-server.js` 顶部常量里）

| 参数 | 值 | 说明 |
| --- | --- | --- |
| `TIMEOUT_MS` | 20000 | 调上游模型的超时，超了回 `504` |
| `MAX_TOKENS` | 400 | 单次回答上限，防止模型写小作文 |
| `TEMPERATURE` | 0.6 | 稍微有点变化，但不放飞 |
| `MAX_HISTORY` | 6 | 只带最近 6 条对话 |
| `MAX_HISTORY_CONTENT` | 600 | 历史单条截断长度 |
| `MAX_MESSAGE` | 2000 | 单条提问上限，超了回 `413` |
| `RATE_LIMIT` | 30 / 分钟 / IP | 内存计数，超了回 `429` |

限流是**单实例内存**的：云函数多实例并发时，每个实例各算各的。它挡的是「一个人连点」，不是 DDoS。

---

## 五、接口

### `POST /api/twin`

请求：

```json
{
  "message": "你叫什么名字？",
  "lang": "zh",
  "history": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "你好。想问什么？" }
  ]
}
```

- `message` 必填
- `lang`：`zh` / `en`，不传就按消息里有没有中文猜
- `history`：可选，服务端只取最近 6 条

响应：

```json
{ "reply": "徐子涵，18 岁，深圳……" }
```

错误码：

| 状态 | `error` | 含义 |
| --- | --- | --- |
| 400 | `bad_json` / `empty_message` | 请求体坏了 / 消息为空 |
| 404 | `not_found` | 路径不对 |
| 405 | `method_not_allowed` | 方法不对 |
| 413 | `message_too_long` / `payload_too_large` | 消息或请求体太大 |
| 429 | `rate_limited` | 同 IP 一分钟超过 30 次 |
| 502 | `upstream_error` | 模型平台返回非 2xx，或返回空内容 |
| 503 | `backend_not_configured` | 没设 `TWIN_API_KEY` |
| 504 | `upstream_timeout` | 模型 20 秒没回 |

前端看到非 2xx 会自动降级成规则版，并在状态条改回「规则版」—— 不会假装模型还在。

### `GET /healthz`

```json
{ "ok": true, "model": "deepseek-chat" }
```

### `OPTIONS /api/twin`

返回 `204` + CORS 头，供浏览器预检。

---

## 六、边界保护在哪

**两层**，缺一不可：

1. **前端**（`index.html` 的 `TWIN.quickBoundaries`）：命中就本地拒答，请求根本不出浏览器 —— 隐私问题最安全的处理是「别发出去」。
2. **后端**（`twin-config.json` 的 `boundaries.keywords` + `boundaryKind()`）：前端被绕过（改请求、curl、注入改写）时，后端再拦一次，命中直接返回拒答话术，**不调模型**。

`boundaryKind()` 返回三种：
- `'injection'`：让人「忽略之前指令」「打印系统提示词」「扮演别人」—— 回 `injectionReply`
- `'private'`：家庭、证件、政治、宗教、恋爱、身体信息 —— 回 `reply`
- `null`：正常问题，往下走

system prompt 里也写了边界清单，就算前两层都在极端情况下失效，模型也被要求礼貌拒答。

---

## 七、安全清单

- [ ] `TWIN_API_KEY` 只存在于环境变量或 `.env`
- [ ] `.env` 在 `.gitignore` 里（已配）
- [ ] 提交前 `git status` 看不到 key
- [ ] 日志里不打印 key（上游错误体会先给 `sk-...` 打码）
- [ ] 生产环境 `ALLOWED_ORIGIN` 不要留 `*`
- [ ] 上线后先 `curl /healthz`，再问一句正常问题，再问一句边界问题

> 一旦 key 泄露：立刻去 `platform.deepseek.com` 删除那个 key，重建一个。

---

## 八、常见问题

**Q：`key=MISSING (will 503...)`？**
没设 `TWIN_API_KEY`，或设在了另一个终端窗口。`$env:TWIN_API_KEY` 只在当前 PowerShell 会话有效。

**Q：页面状态条一直是「规则版」？**
三种可能：`TWIN.endpoint` 还是空；后端没起；浏览器控制台报 CORS。先看控制台的 Network 面板，再看后端终端有没有请求日志。

**Q：`502 upstream_error`？**
多半是 key 错了、余额不足、或 `TWIN_BASE_URL`/`TWIN_MODEL` 写错。先用 `curl` 直接打 DeepSeek 的 `/chat/completions` 排除。

**Q：云函数上 `require('./twin-config.json')` 找不到？**
上传时要保持目录结构，`twin-config.json` 必须和 `twin-server.js` 同目录。

**Q：为什么 `eval.js` 不用起 HTTP 服务？**
它直接 `require('./twin-server.js')` 调用 `processRequest()`，走的是和线上完全一样的业务逻辑（边界预检 → 调模型），只是少了网络层。
