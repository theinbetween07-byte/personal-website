// ---- 扩展版 DOM 桩：支持 classList 真实状态、append、querySelector(class)、focus 记录 ----
const __all = [];

function makeEl(tag) {
  const classes = new Set();
  const el = {
    tagName: tag || 'div',
    textContent: '', innerHTML: '', value: '', placeholder: '',
    src: '', currentTime: 0, duration: 0, disabled: false, tabIndex: 0,
    scrollTop: 0, scrollHeight: 0, className: '', dataset: {}, children: [],
    paused: true,
    classList: {
      add(c) { classes.add(c); },
      remove(c) { classes.delete(c); },
      contains(c) { return classes.has(c); },
      toggle(c, force) {
        const on = force === undefined ? !classes.has(c) : !!force;
        if (on) classes.add(c); else classes.delete(c);
        return on;
      },
    },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener(type, fn) { (this._h || (this._h = {}))[type] = fn; },
    dispatch(type, ev) { if (this._h && this._h[type]) this._h[type](ev || {}); },
    appendChild(c) { this.children.push(c); return c; },
    append(...cs) { cs.forEach((c) => this.children.push(c)); },
    remove() {},
    removeAttribute() {},
    reset() { if (this._resetHook) this._resetHook(); },
    play() { this.paused = false; return Promise.resolve(); },
    pause() { this.paused = true; },
    focus() { document.activeElement = this; },
    querySelector() { return makeEl(); },
  };
  __all.push(el);
  return el;
}

const __els = {};
const __docH = {};
global.document = {
  _els: __els,
  body: { style: {} },
  activeElement: null,
  getElementById(id) { if (!__els[id]) __els[id] = makeEl(); return __els[id]; },
  // 纯 class 选择器（如 .modal.is-open）在已建元素里真实匹配，其余保持宽松
  querySelector(sel) {
    const s = String(sel);
    if (s.charAt(0) === '.') {
      const parts = s.split('.').filter(Boolean);
      return __all.find((e) => parts.every((c) => e.classList.contains(c))) || null;
    }
    return makeEl(s.split('.')[0]);
  },
  querySelectorAll() { return []; },
  createElement(tag) { return makeEl(tag); },
  addEventListener(type, fn) { (__docH[type] || (__docH[type] = [])).push(fn); },
  dispatch(type, ev) { (__docH[type] || []).forEach((fn) => fn(ev || {})); },
  documentElement: { lang: '' },
};
global.window = {
  matchMedia: () => ({ matches: false }),
  scrollY: 0,
  addEventListener() {},
};

// 固定一个桌面 UA，让 fbGuessDevice() 的结果可预期
try {
  Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    configurable: true,
    writable: true,
  });
} catch (e) { /* 宿主已有 navigator 就沿用 */ }
