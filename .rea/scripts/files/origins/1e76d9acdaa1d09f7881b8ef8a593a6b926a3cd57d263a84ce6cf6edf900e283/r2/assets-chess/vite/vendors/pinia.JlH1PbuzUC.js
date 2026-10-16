import { Dn as e, En as t, Gt as n, On as r, W as i, X as a, cn as o, dn as s, gn as c, hn as l, jn as u, pn as d, rt as f, sn as ee, v as p, xn as te, yn as m } from "./runtime-core.esm-bundler.CUagP75OtQ.js";
//#region node_modules/@vue/devtools-shared/dist/index.js
var ne = Object.create, h = Object.defineProperty, g = Object.getOwnPropertyDescriptor, _ = Object.getOwnPropertyNames, v = Object.getPrototypeOf, y = Object.prototype.hasOwnProperty, b = (e, t) => function() {
	return e && (t = (0, e[_(e)[0]])(e = 0)), t;
}, x = (e, t) => function() {
	return t || (0, e[_(e)[0]])((t = { exports: {} }).exports, t), t.exports;
}, re = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (let i of _(t)) !y.call(e, i) && i !== n && h(e, i, {
		get: () => t[i],
		enumerable: !(r = g(t, i)) || r.enumerable
	});
	return e;
}, S = (e, t, n) => (n = e == null ? {} : ne(v(e)), re(t || !e || !e.__esModule ? h(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), C = b({ "../../node_modules/.pnpm/tsup@8.4.0_@microsoft+api-extractor@7.51.1_@types+node@22.13.14__jiti@2.4.2_postcss@8.5_96eb05a9d65343021e53791dd83f3773/node_modules/tsup/assets/esm_shims.js"() {} }), w = x({ "../../node_modules/.pnpm/rfdc@1.4.1/node_modules/rfdc/index.js"(e, t) {
	C(), t.exports = r;
	function n(e) {
		return e instanceof Buffer ? Buffer.from(e) : new e.constructor(e.buffer.slice(), e.byteOffset, e.length);
	}
	function r(e) {
		if (e ||= {}, e.circles) return i(e);
		let t = /* @__PURE__ */ new Map();
		if (t.set(Date, (e) => new Date(e)), t.set(Map, (e, t) => new Map(a(Array.from(e), t))), t.set(Set, (e, t) => new Set(a(Array.from(e), t))), e.constructorHandlers) for (let n of e.constructorHandlers) t.set(n[0], n[1]);
		let r = null;
		return e.proto ? s : o;
		function a(e, i) {
			let a = Object.keys(e), o = Array(a.length);
			for (let s = 0; s < a.length; s++) {
				let c = a[s], l = e[c];
				typeof l != "object" || !l ? o[c] = l : l.constructor !== Object && (r = t.get(l.constructor)) ? o[c] = r(l, i) : ArrayBuffer.isView(l) ? o[c] = n(l) : o[c] = i(l);
			}
			return o;
		}
		function o(e) {
			if (typeof e != "object" || !e) return e;
			if (Array.isArray(e)) return a(e, o);
			if (e.constructor !== Object && (r = t.get(e.constructor))) return r(e, o);
			let i = {};
			for (let a in e) {
				if (Object.hasOwnProperty.call(e, a) === !1) continue;
				let s = e[a];
				typeof s != "object" || !s ? i[a] = s : s.constructor !== Object && (r = t.get(s.constructor)) ? i[a] = r(s, o) : ArrayBuffer.isView(s) ? i[a] = n(s) : i[a] = o(s);
			}
			return i;
		}
		function s(e) {
			if (typeof e != "object" || !e) return e;
			if (Array.isArray(e)) return a(e, s);
			if (e.constructor !== Object && (r = t.get(e.constructor))) return r(e, s);
			let i = {};
			for (let a in e) {
				let o = e[a];
				typeof o != "object" || !o ? i[a] = o : o.constructor !== Object && (r = t.get(o.constructor)) ? i[a] = r(o, s) : ArrayBuffer.isView(o) ? i[a] = n(o) : i[a] = s(o);
			}
			return i;
		}
	}
	function i(e) {
		let t = [], r = [], i = /* @__PURE__ */ new Map();
		if (i.set(Date, (e) => new Date(e)), i.set(Map, (e, t) => new Map(o(Array.from(e), t))), i.set(Set, (e, t) => new Set(o(Array.from(e), t))), e.constructorHandlers) for (let t of e.constructorHandlers) i.set(t[0], t[1]);
		let a = null;
		return e.proto ? c : s;
		function o(e, o) {
			let s = Object.keys(e), c = Array(s.length);
			for (let l = 0; l < s.length; l++) {
				let u = s[l], d = e[u];
				if (typeof d != "object" || !d) c[u] = d;
				else if (d.constructor !== Object && (a = i.get(d.constructor))) c[u] = a(d, o);
				else if (ArrayBuffer.isView(d)) c[u] = n(d);
				else {
					let e = t.indexOf(d);
					e === -1 ? c[u] = o(d) : c[u] = r[e];
				}
			}
			return c;
		}
		function s(e) {
			if (typeof e != "object" || !e) return e;
			if (Array.isArray(e)) return o(e, s);
			if (e.constructor !== Object && (a = i.get(e.constructor))) return a(e, s);
			let c = {};
			t.push(e), r.push(c);
			for (let o in e) {
				if (Object.hasOwnProperty.call(e, o) === !1) continue;
				let l = e[o];
				if (typeof l != "object" || !l) c[o] = l;
				else if (l.constructor !== Object && (a = i.get(l.constructor))) c[o] = a(l, s);
				else if (ArrayBuffer.isView(l)) c[o] = n(l);
				else {
					let e = t.indexOf(l);
					e === -1 ? c[o] = s(l) : c[o] = r[e];
				}
			}
			return t.pop(), r.pop(), c;
		}
		function c(e) {
			if (typeof e != "object" || !e) return e;
			if (Array.isArray(e)) return o(e, c);
			if (e.constructor !== Object && (a = i.get(e.constructor))) return a(e, c);
			let s = {};
			t.push(e), r.push(s);
			for (let o in e) {
				let l = e[o];
				if (typeof l != "object" || !l) s[o] = l;
				else if (l.constructor !== Object && (a = i.get(l.constructor))) s[o] = a(l, c);
				else if (ArrayBuffer.isView(l)) s[o] = n(l);
				else {
					let e = t.indexOf(l);
					e === -1 ? s[o] = c(l) : s[o] = r[e];
				}
			}
			return t.pop(), r.pop(), s;
		}
	}
} });
C(), C(), C();
var T = typeof navigator < "u", E = typeof window < "u" ? window : typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
E.chrome !== void 0 && E.chrome.devtools, T && (E.self, E.top), typeof navigator < "u" && navigator.userAgent?.toLowerCase().includes("electron"), typeof window < "u" && window.__NUXT__, C();
var D = S(w(), 1), O = /(?:^|[-_/])(\w)/g;
function ie(e, t) {
	return t ? t.toUpperCase() : "";
}
function ae(e) {
	return e && `${e}`.replace(O, ie);
}
function oe(e, t) {
	let n = e.replace(/^[a-z]:/i, "").replace(/\\/g, "/");
	n.endsWith(`index${t}`) && (n = n.replace(`/index${t}`, t));
	let r = n.lastIndexOf("/"), i = n.substring(r + 1);
	if (t) {
		let e = i.lastIndexOf(t);
		return i.substring(0, e);
	}
	return "";
}
var se = (0, D.default)({ circles: !0 }), ce = { trailing: !0 };
function k(e, t = 25, n = {}) {
	if (n = {
		...ce,
		...n
	}, !Number.isFinite(t)) throw TypeError("Expected `wait` to be a finite number");
	let r, i, a = [], o, s, c = (t, r) => (o = le(e, t, r), o.finally(() => {
		if (o = null, n.trailing && s && !i) {
			let e = c(t, s);
			return s = null, e;
		}
	}), o);
	return function(...e) {
		return o ? (n.trailing && (s = e), o) : new Promise((o) => {
			let s = !i && n.leading;
			clearTimeout(i), i = setTimeout(() => {
				i = null;
				let t = n.leading ? r : c(this, e);
				for (let e of a) e(t);
				a = [];
			}, t), s ? (r = c(this, e), o(r)) : a.push(o);
		});
	};
}
async function le(e, t, n) {
	return await e.apply(t, n);
}
//#endregion
//#region node_modules/hookable/dist/index.mjs
function ue(e, t = {}, n) {
	for (let r in e) {
		let i = e[r], a = n ? `${n}:${r}` : r;
		typeof i == "object" && i ? ue(i, t, a) : typeof i == "function" && (t[a] = i);
	}
	return t;
}
var de = { run: (e) => e() }, fe = console.createTask === void 0 ? () => de : console.createTask;
function pe(e, t) {
	let n = fe(t.shift());
	return e.reduce((e, r) => e.then(() => n.run(() => r(...t))), Promise.resolve());
}
function me(e, t) {
	let n = fe(t.shift());
	return Promise.all(e.map((e) => n.run(() => e(...t))));
}
function he(e, t) {
	for (let n of [...e]) n(t);
}
var ge = class {
	constructor() {
		this._hooks = {}, this._before = void 0, this._after = void 0, this._deprecatedMessages = void 0, this._deprecatedHooks = {}, this.hook = this.hook.bind(this), this.callHook = this.callHook.bind(this), this.callHookWith = this.callHookWith.bind(this);
	}
	hook(e, t, n = {}) {
		if (!e || typeof t != "function") return () => {};
		let r = e, i;
		for (; this._deprecatedHooks[e];) i = this._deprecatedHooks[e], e = i.to;
		if (i && !n.allowDeprecated) {
			let e = i.message;
			e ||= `${r} hook has been deprecated` + (i.to ? `, please use ${i.to}` : ""), this._deprecatedMessages ||= /* @__PURE__ */ new Set(), this._deprecatedMessages.has(e) || (console.warn(e), this._deprecatedMessages.add(e));
		}
		if (!t.name) try {
			Object.defineProperty(t, "name", {
				get: () => "_" + e.replace(/\W+/g, "_") + "_hook_cb",
				configurable: !0
			});
		} catch {}
		return this._hooks[e] = this._hooks[e] || [], this._hooks[e].push(t), () => {
			t &&= (this.removeHook(e, t), void 0);
		};
	}
	hookOnce(e, t) {
		let n, r = (...e) => (typeof n == "function" && n(), n = void 0, r = void 0, t(...e));
		return n = this.hook(e, r), n;
	}
	removeHook(e, t) {
		if (this._hooks[e]) {
			let n = this._hooks[e].indexOf(t);
			n !== -1 && this._hooks[e].splice(n, 1), this._hooks[e].length === 0 && delete this._hooks[e];
		}
	}
	deprecateHook(e, t) {
		this._deprecatedHooks[e] = typeof t == "string" ? { to: t } : t;
		let n = this._hooks[e] || [];
		delete this._hooks[e];
		for (let t of n) this.hook(e, t);
	}
	deprecateHooks(e) {
		Object.assign(this._deprecatedHooks, e);
		for (let t in e) this.deprecateHook(t, e[t]);
	}
	addHooks(e) {
		let t = ue(e), n = Object.keys(t).map((e) => this.hook(e, t[e]));
		return () => {
			for (let e of n.splice(0, n.length)) e();
		};
	}
	removeHooks(e) {
		let t = ue(e);
		for (let e in t) this.removeHook(e, t[e]);
	}
	removeAllHooks() {
		for (let e in this._hooks) delete this._hooks[e];
	}
	callHook(e, ...t) {
		return t.unshift(e), this.callHookWith(pe, e, ...t);
	}
	callHookParallel(e, ...t) {
		return t.unshift(e), this.callHookWith(me, e, ...t);
	}
	callHookWith(e, t, ...n) {
		let r = this._before || this._after ? {
			name: t,
			args: n,
			context: {}
		} : void 0;
		this._before && he(this._before, r);
		let i = e(t in this._hooks ? [...this._hooks[t]] : [], n);
		return i instanceof Promise ? i.finally(() => {
			this._after && r && he(this._after, r);
		}) : (this._after && r && he(this._after, r), i);
	}
	beforeEach(e) {
		return this._before = this._before || [], this._before.push(e), () => {
			if (this._before !== void 0) {
				let t = this._before.indexOf(e);
				t !== -1 && this._before.splice(t, 1);
			}
		};
	}
	afterEach(e) {
		return this._after = this._after || [], this._after.push(e), () => {
			if (this._after !== void 0) {
				let t = this._after.indexOf(e);
				t !== -1 && this._after.splice(t, 1);
			}
		};
	}
};
function _e() {
	return new ge();
}
//#endregion
//#region node_modules/@vue/devtools-kit/dist/index.js
var ve = Object.create, ye = Object.defineProperty, be = Object.getOwnPropertyDescriptor, xe = Object.getOwnPropertyNames, Se = Object.getPrototypeOf, Ce = Object.prototype.hasOwnProperty, we = (e, t) => function() {
	return e && (t = (0, e[xe(e)[0]])(e = 0)), t;
}, Te = (e, t) => function() {
	return t || (0, e[xe(e)[0]])((t = { exports: {} }).exports, t), t.exports;
}, Ee = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (let i of xe(t)) !Ce.call(e, i) && i !== n && ye(e, i, {
		get: () => t[i],
		enumerable: !(r = be(t, i)) || r.enumerable
	});
	return e;
}, De = (e, t, n) => (n = e == null ? {} : ve(Se(e)), Ee(t || !e || !e.__esModule ? ye(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), A = we({ "../../node_modules/.pnpm/tsup@8.4.0_@microsoft+api-extractor@7.51.1_@types+node@22.13.14__jiti@2.4.2_postcss@8.5_96eb05a9d65343021e53791dd83f3773/node_modules/tsup/assets/esm_shims.js"() {} }), Oe = Te({ "../../node_modules/.pnpm/speakingurl@14.0.1/node_modules/speakingurl/lib/speakingurl.js"(e, t) {
	A(), (function(e) {
		var n = {
			À: "A",
			Á: "A",
			Â: "A",
			Ã: "A",
			Ä: "Ae",
			Å: "A",
			Æ: "AE",
			Ç: "C",
			È: "E",
			É: "E",
			Ê: "E",
			Ë: "E",
			Ì: "I",
			Í: "I",
			Î: "I",
			Ï: "I",
			Ð: "D",
			Ñ: "N",
			Ò: "O",
			Ó: "O",
			Ô: "O",
			Õ: "O",
			Ö: "Oe",
			Ő: "O",
			Ø: "O",
			Ù: "U",
			Ú: "U",
			Û: "U",
			Ü: "Ue",
			Ű: "U",
			Ý: "Y",
			Þ: "TH",
			ß: "ss",
			à: "a",
			á: "a",
			â: "a",
			ã: "a",
			ä: "ae",
			å: "a",
			æ: "ae",
			ç: "c",
			è: "e",
			é: "e",
			ê: "e",
			ë: "e",
			ì: "i",
			í: "i",
			î: "i",
			ï: "i",
			ð: "d",
			ñ: "n",
			ò: "o",
			ó: "o",
			ô: "o",
			õ: "o",
			ö: "oe",
			ő: "o",
			ø: "o",
			ù: "u",
			ú: "u",
			û: "u",
			ü: "ue",
			ű: "u",
			ý: "y",
			þ: "th",
			ÿ: "y",
			ẞ: "SS",
			ا: "a",
			أ: "a",
			إ: "i",
			آ: "aa",
			ؤ: "u",
			ئ: "e",
			ء: "a",
			ب: "b",
			ت: "t",
			ث: "th",
			ج: "j",
			ح: "h",
			خ: "kh",
			د: "d",
			ذ: "th",
			ر: "r",
			ز: "z",
			س: "s",
			ش: "sh",
			ص: "s",
			ض: "dh",
			ط: "t",
			ظ: "z",
			ع: "a",
			غ: "gh",
			ف: "f",
			ق: "q",
			ك: "k",
			ل: "l",
			م: "m",
			ن: "n",
			ه: "h",
			و: "w",
			ي: "y",
			ى: "a",
			ة: "h",
			ﻻ: "la",
			ﻷ: "laa",
			ﻹ: "lai",
			ﻵ: "laa",
			گ: "g",
			چ: "ch",
			پ: "p",
			ژ: "zh",
			ک: "k",
			ی: "y",
			"َ": "a",
			"ً": "an",
			"ِ": "e",
			"ٍ": "en",
			"ُ": "u",
			"ٌ": "on",
			"ْ": "",
			"٠": "0",
			"١": "1",
			"٢": "2",
			"٣": "3",
			"٤": "4",
			"٥": "5",
			"٦": "6",
			"٧": "7",
			"٨": "8",
			"٩": "9",
			"۰": "0",
			"۱": "1",
			"۲": "2",
			"۳": "3",
			"۴": "4",
			"۵": "5",
			"۶": "6",
			"۷": "7",
			"۸": "8",
			"۹": "9",
			က: "k",
			ခ: "kh",
			ဂ: "g",
			ဃ: "ga",
			င: "ng",
			စ: "s",
			ဆ: "sa",
			ဇ: "z",
			စျ: "za",
			ည: "ny",
			ဋ: "t",
			ဌ: "ta",
			ဍ: "d",
			ဎ: "da",
			ဏ: "na",
			တ: "t",
			ထ: "ta",
			ဒ: "d",
			ဓ: "da",
			န: "n",
			ပ: "p",
			ဖ: "pa",
			ဗ: "b",
			ဘ: "ba",
			မ: "m",
			ယ: "y",
			ရ: "ya",
			လ: "l",
			ဝ: "w",
			သ: "th",
			ဟ: "h",
			ဠ: "la",
			အ: "a",
			"ြ": "y",
			"ျ": "ya",
			"ွ": "w",
			"ြွ": "yw",
			"ျွ": "ywa",
			"ှ": "h",
			ဧ: "e",
			"၏": "-e",
			ဣ: "i",
			ဤ: "-i",
			ဉ: "u",
			ဦ: "-u",
			ဩ: "aw",
			သြော: "aw",
			ဪ: "aw",
			"၀": "0",
			"၁": "1",
			"၂": "2",
			"၃": "3",
			"၄": "4",
			"၅": "5",
			"၆": "6",
			"၇": "7",
			"၈": "8",
			"၉": "9",
			"္": "",
			"့": "",
			"း": "",
			č: "c",
			ď: "d",
			ě: "e",
			ň: "n",
			ř: "r",
			š: "s",
			ť: "t",
			ů: "u",
			ž: "z",
			Č: "C",
			Ď: "D",
			Ě: "E",
			Ň: "N",
			Ř: "R",
			Š: "S",
			Ť: "T",
			Ů: "U",
			Ž: "Z",
			ހ: "h",
			ށ: "sh",
			ނ: "n",
			ރ: "r",
			ބ: "b",
			ޅ: "lh",
			ކ: "k",
			އ: "a",
			ވ: "v",
			މ: "m",
			ފ: "f",
			ދ: "dh",
			ތ: "th",
			ލ: "l",
			ގ: "g",
			ޏ: "gn",
			ސ: "s",
			ޑ: "d",
			ޒ: "z",
			ޓ: "t",
			ޔ: "y",
			ޕ: "p",
			ޖ: "j",
			ޗ: "ch",
			ޘ: "tt",
			ޙ: "hh",
			ޚ: "kh",
			ޛ: "th",
			ޜ: "z",
			ޝ: "sh",
			ޞ: "s",
			ޟ: "d",
			ޠ: "t",
			ޡ: "z",
			ޢ: "a",
			ޣ: "gh",
			ޤ: "q",
			ޥ: "w",
			"ަ": "a",
			"ާ": "aa",
			"ި": "i",
			"ީ": "ee",
			"ު": "u",
			"ޫ": "oo",
			"ެ": "e",
			"ޭ": "ey",
			"ޮ": "o",
			"ޯ": "oa",
			"ް": "",
			ა: "a",
			ბ: "b",
			გ: "g",
			დ: "d",
			ე: "e",
			ვ: "v",
			ზ: "z",
			თ: "t",
			ი: "i",
			კ: "k",
			ლ: "l",
			მ: "m",
			ნ: "n",
			ო: "o",
			პ: "p",
			ჟ: "zh",
			რ: "r",
			ს: "s",
			ტ: "t",
			უ: "u",
			ფ: "p",
			ქ: "k",
			ღ: "gh",
			ყ: "q",
			შ: "sh",
			ჩ: "ch",
			ც: "ts",
			ძ: "dz",
			წ: "ts",
			ჭ: "ch",
			ხ: "kh",
			ჯ: "j",
			ჰ: "h",
			α: "a",
			β: "v",
			γ: "g",
			δ: "d",
			ε: "e",
			ζ: "z",
			η: "i",
			θ: "th",
			ι: "i",
			κ: "k",
			λ: "l",
			μ: "m",
			ν: "n",
			ξ: "ks",
			ο: "o",
			π: "p",
			ρ: "r",
			σ: "s",
			τ: "t",
			υ: "y",
			φ: "f",
			χ: "x",
			ψ: "ps",
			ω: "o",
			ά: "a",
			έ: "e",
			ί: "i",
			ό: "o",
			ύ: "y",
			ή: "i",
			ώ: "o",
			ς: "s",
			ϊ: "i",
			ΰ: "y",
			ϋ: "y",
			ΐ: "i",
			Α: "A",
			Β: "B",
			Γ: "G",
			Δ: "D",
			Ε: "E",
			Ζ: "Z",
			Η: "I",
			Θ: "TH",
			Ι: "I",
			Κ: "K",
			Λ: "L",
			Μ: "M",
			Ν: "N",
			Ξ: "KS",
			Ο: "O",
			Π: "P",
			Ρ: "R",
			Σ: "S",
			Τ: "T",
			Υ: "Y",
			Φ: "F",
			Χ: "X",
			Ψ: "PS",
			Ω: "O",
			Ά: "A",
			Έ: "E",
			Ί: "I",
			Ό: "O",
			Ύ: "Y",
			Ή: "I",
			Ώ: "O",
			Ϊ: "I",
			Ϋ: "Y",
			ā: "a",
			ē: "e",
			ģ: "g",
			ī: "i",
			ķ: "k",
			ļ: "l",
			ņ: "n",
			ū: "u",
			Ā: "A",
			Ē: "E",
			Ģ: "G",
			Ī: "I",
			Ķ: "k",
			Ļ: "L",
			Ņ: "N",
			Ū: "U",
			Ќ: "Kj",
			ќ: "kj",
			Љ: "Lj",
			љ: "lj",
			Њ: "Nj",
			њ: "nj",
			Тс: "Ts",
			тс: "ts",
			ą: "a",
			ć: "c",
			ę: "e",
			ł: "l",
			ń: "n",
			ś: "s",
			ź: "z",
			ż: "z",
			Ą: "A",
			Ć: "C",
			Ę: "E",
			Ł: "L",
			Ń: "N",
			Ś: "S",
			Ź: "Z",
			Ż: "Z",
			Є: "Ye",
			І: "I",
			Ї: "Yi",
			Ґ: "G",
			є: "ye",
			і: "i",
			ї: "yi",
			ґ: "g",
			ă: "a",
			Ă: "A",
			ș: "s",
			Ș: "S",
			ț: "t",
			Ț: "T",
			ţ: "t",
			Ţ: "T",
			а: "a",
			б: "b",
			в: "v",
			г: "g",
			д: "d",
			е: "e",
			ё: "yo",
			ж: "zh",
			з: "z",
			и: "i",
			й: "i",
			к: "k",
			л: "l",
			м: "m",
			н: "n",
			о: "o",
			п: "p",
			р: "r",
			с: "s",
			т: "t",
			у: "u",
			ф: "f",
			х: "kh",
			ц: "c",
			ч: "ch",
			ш: "sh",
			щ: "sh",
			ъ: "",
			ы: "y",
			ь: "",
			э: "e",
			ю: "yu",
			я: "ya",
			А: "A",
			Б: "B",
			В: "V",
			Г: "G",
			Д: "D",
			Е: "E",
			Ё: "Yo",
			Ж: "Zh",
			З: "Z",
			И: "I",
			Й: "I",
			К: "K",
			Л: "L",
			М: "M",
			Н: "N",
			О: "O",
			П: "P",
			Р: "R",
			С: "S",
			Т: "T",
			У: "U",
			Ф: "F",
			Х: "Kh",
			Ц: "C",
			Ч: "Ch",
			Ш: "Sh",
			Щ: "Sh",
			Ъ: "",
			Ы: "Y",
			Ь: "",
			Э: "E",
			Ю: "Yu",
			Я: "Ya",
			ђ: "dj",
			ј: "j",
			ћ: "c",
			џ: "dz",
			Ђ: "Dj",
			Ј: "j",
			Ћ: "C",
			Џ: "Dz",
			ľ: "l",
			ĺ: "l",
			ŕ: "r",
			Ľ: "L",
			Ĺ: "L",
			Ŕ: "R",
			ş: "s",
			Ş: "S",
			ı: "i",
			İ: "I",
			ğ: "g",
			Ğ: "G",
			ả: "a",
			Ả: "A",
			ẳ: "a",
			Ẳ: "A",
			ẩ: "a",
			Ẩ: "A",
			đ: "d",
			Đ: "D",
			ẹ: "e",
			Ẹ: "E",
			ẽ: "e",
			Ẽ: "E",
			ẻ: "e",
			Ẻ: "E",
			ế: "e",
			Ế: "E",
			ề: "e",
			Ề: "E",
			ệ: "e",
			Ệ: "E",
			ễ: "e",
			Ễ: "E",
			ể: "e",
			Ể: "E",
			ỏ: "o",
			ọ: "o",
			Ọ: "o",
			ố: "o",
			Ố: "O",
			ồ: "o",
			Ồ: "O",
			ổ: "o",
			Ổ: "O",
			ộ: "o",
			Ộ: "O",
			ỗ: "o",
			Ỗ: "O",
			ơ: "o",
			Ơ: "O",
			ớ: "o",
			Ớ: "O",
			ờ: "o",
			Ờ: "O",
			ợ: "o",
			Ợ: "O",
			ỡ: "o",
			Ỡ: "O",
			Ở: "o",
			ở: "o",
			ị: "i",
			Ị: "I",
			ĩ: "i",
			Ĩ: "I",
			ỉ: "i",
			Ỉ: "i",
			ủ: "u",
			Ủ: "U",
			ụ: "u",
			Ụ: "U",
			ũ: "u",
			Ũ: "U",
			ư: "u",
			Ư: "U",
			ứ: "u",
			Ứ: "U",
			ừ: "u",
			Ừ: "U",
			ự: "u",
			Ự: "U",
			ữ: "u",
			Ữ: "U",
			ử: "u",
			Ử: "ư",
			ỷ: "y",
			Ỷ: "y",
			ỳ: "y",
			Ỳ: "Y",
			ỵ: "y",
			Ỵ: "Y",
			ỹ: "y",
			Ỹ: "Y",
			ạ: "a",
			Ạ: "A",
			ấ: "a",
			Ấ: "A",
			ầ: "a",
			Ầ: "A",
			ậ: "a",
			Ậ: "A",
			ẫ: "a",
			Ẫ: "A",
			ắ: "a",
			Ắ: "A",
			ằ: "a",
			Ằ: "A",
			ặ: "a",
			Ặ: "A",
			ẵ: "a",
			Ẵ: "A",
			"⓪": "0",
			"①": "1",
			"②": "2",
			"③": "3",
			"④": "4",
			"⑤": "5",
			"⑥": "6",
			"⑦": "7",
			"⑧": "8",
			"⑨": "9",
			"⑩": "10",
			"⑪": "11",
			"⑫": "12",
			"⑬": "13",
			"⑭": "14",
			"⑮": "15",
			"⑯": "16",
			"⑰": "17",
			"⑱": "18",
			"⑲": "18",
			"⑳": "18",
			"⓵": "1",
			"⓶": "2",
			"⓷": "3",
			"⓸": "4",
			"⓹": "5",
			"⓺": "6",
			"⓻": "7",
			"⓼": "8",
			"⓽": "9",
			"⓾": "10",
			"⓿": "0",
			"⓫": "11",
			"⓬": "12",
			"⓭": "13",
			"⓮": "14",
			"⓯": "15",
			"⓰": "16",
			"⓱": "17",
			"⓲": "18",
			"⓳": "19",
			"⓴": "20",
			"Ⓐ": "A",
			"Ⓑ": "B",
			"Ⓒ": "C",
			"Ⓓ": "D",
			"Ⓔ": "E",
			"Ⓕ": "F",
			"Ⓖ": "G",
			"Ⓗ": "H",
			"Ⓘ": "I",
			"Ⓙ": "J",
			"Ⓚ": "K",
			"Ⓛ": "L",
			"Ⓜ": "M",
			"Ⓝ": "N",
			"Ⓞ": "O",
			"Ⓟ": "P",
			"Ⓠ": "Q",
			"Ⓡ": "R",
			"Ⓢ": "S",
			"Ⓣ": "T",
			"Ⓤ": "U",
			"Ⓥ": "V",
			"Ⓦ": "W",
			"Ⓧ": "X",
			"Ⓨ": "Y",
			"Ⓩ": "Z",
			"ⓐ": "a",
			"ⓑ": "b",
			"ⓒ": "c",
			"ⓓ": "d",
			"ⓔ": "e",
			"ⓕ": "f",
			"ⓖ": "g",
			"ⓗ": "h",
			"ⓘ": "i",
			"ⓙ": "j",
			"ⓚ": "k",
			"ⓛ": "l",
			"ⓜ": "m",
			"ⓝ": "n",
			"ⓞ": "o",
			"ⓟ": "p",
			"ⓠ": "q",
			"ⓡ": "r",
			"ⓢ": "s",
			"ⓣ": "t",
			"ⓤ": "u",
			"ⓦ": "v",
			"ⓥ": "w",
			"ⓧ": "x",
			"ⓨ": "y",
			"ⓩ": "z",
			"“": "\"",
			"”": "\"",
			"‘": "'",
			"’": "'",
			"∂": "d",
			ƒ: "f",
			"™": "(TM)",
			"©": "(C)",
			œ: "oe",
			Œ: "OE",
			"®": "(R)",
			"†": "+",
			"℠": "(SM)",
			"…": "...",
			"˚": "o",
			º: "o",
			ª: "a",
			"•": "*",
			"၊": ",",
			"။": ".",
			$: "USD",
			"€": "EUR",
			"₢": "BRN",
			"₣": "FRF",
			"£": "GBP",
			"₤": "ITL",
			"₦": "NGN",
			"₧": "ESP",
			"₩": "KRW",
			"₪": "ILS",
			"₫": "VND",
			"₭": "LAK",
			"₮": "MNT",
			"₯": "GRD",
			"₱": "ARS",
			"₲": "PYG",
			"₳": "ARA",
			"₴": "UAH",
			"₵": "GHS",
			"¢": "cent",
			"¥": "CNY",
			元: "CNY",
			円: "YEN",
			"﷼": "IRR",
			"₠": "EWE",
			"฿": "THB",
			"₨": "INR",
			"₹": "INR",
			"₰": "PF",
			"₺": "TRY",
			"؋": "AFN",
			"₼": "AZN",
			лв: "BGN",
			"៛": "KHR",
			"₡": "CRC",
			"₸": "KZT",
			ден: "MKD",
			zł: "PLN",
			"₽": "RUB",
			"₾": "GEL"
		}, r = ["်", "ް"], i = {
			"ာ": "a",
			"ါ": "a",
			"ေ": "e",
			"ဲ": "e",
			"ိ": "i",
			"ီ": "i",
			"ို": "o",
			"ု": "u",
			"ူ": "u",
			"ေါင်": "aung",
			"ော": "aw",
			"ော်": "aw",
			"ေါ": "aw",
			"ေါ်": "aw",
			"်": "်",
			က်: "et",
			"ိုက်": "aik",
			"ောက်": "auk",
			င်: "in",
			"ိုင်": "aing",
			"ောင်": "aung",
			စ်: "it",
			ည်: "i",
			တ်: "at",
			"ိတ်": "eik",
			"ုတ်": "ok",
			"ွတ်": "ut",
			"ေတ်": "it",
			ဒ်: "d",
			"ိုဒ်": "ok",
			"ုဒ်": "ait",
			န်: "an",
			"ာန်": "an",
			"ိန်": "ein",
			"ုန်": "on",
			"ွန်": "un",
			ပ်: "at",
			"ိပ်": "eik",
			"ုပ်": "ok",
			"ွပ်": "ut",
			န်ုပ်: "nub",
			မ်: "an",
			"ိမ်": "ein",
			"ုမ်": "on",
			"ွမ်": "un",
			ယ်: "e",
			"ိုလ်": "ol",
			ဉ်: "in",
			"ံ": "an",
			"ိံ": "ein",
			"ုံ": "on",
			"ައް": "ah",
			"ަށް": "ah"
		}, a = {
			en: {},
			az: {
				ç: "c",
				ə: "e",
				ğ: "g",
				ı: "i",
				ö: "o",
				ş: "s",
				ü: "u",
				Ç: "C",
				Ə: "E",
				Ğ: "G",
				İ: "I",
				Ö: "O",
				Ş: "S",
				Ü: "U"
			},
			cs: {
				č: "c",
				ď: "d",
				ě: "e",
				ň: "n",
				ř: "r",
				š: "s",
				ť: "t",
				ů: "u",
				ž: "z",
				Č: "C",
				Ď: "D",
				Ě: "E",
				Ň: "N",
				Ř: "R",
				Š: "S",
				Ť: "T",
				Ů: "U",
				Ž: "Z"
			},
			fi: {
				ä: "a",
				Ä: "A",
				ö: "o",
				Ö: "O"
			},
			hu: {
				ä: "a",
				Ä: "A",
				ö: "o",
				Ö: "O",
				ü: "u",
				Ü: "U",
				ű: "u",
				Ű: "U"
			},
			lt: {
				ą: "a",
				č: "c",
				ę: "e",
				ė: "e",
				į: "i",
				š: "s",
				ų: "u",
				ū: "u",
				ž: "z",
				Ą: "A",
				Č: "C",
				Ę: "E",
				Ė: "E",
				Į: "I",
				Š: "S",
				Ų: "U",
				Ū: "U"
			},
			lv: {
				ā: "a",
				č: "c",
				ē: "e",
				ģ: "g",
				ī: "i",
				ķ: "k",
				ļ: "l",
				ņ: "n",
				š: "s",
				ū: "u",
				ž: "z",
				Ā: "A",
				Č: "C",
				Ē: "E",
				Ģ: "G",
				Ī: "i",
				Ķ: "k",
				Ļ: "L",
				Ņ: "N",
				Š: "S",
				Ū: "u",
				Ž: "Z"
			},
			pl: {
				ą: "a",
				ć: "c",
				ę: "e",
				ł: "l",
				ń: "n",
				ó: "o",
				ś: "s",
				ź: "z",
				ż: "z",
				Ą: "A",
				Ć: "C",
				Ę: "e",
				Ł: "L",
				Ń: "N",
				Ó: "O",
				Ś: "S",
				Ź: "Z",
				Ż: "Z"
			},
			sv: {
				ä: "a",
				Ä: "A",
				ö: "o",
				Ö: "O"
			},
			sk: {
				ä: "a",
				Ä: "A"
			},
			sr: {
				љ: "lj",
				њ: "nj",
				Љ: "Lj",
				Њ: "Nj",
				đ: "dj",
				Đ: "Dj"
			},
			tr: {
				Ü: "U",
				Ö: "O",
				ü: "u",
				ö: "o"
			}
		}, o = {
			ar: {
				"∆": "delta",
				"∞": "la-nihaya",
				"♥": "hob",
				"&": "wa",
				"|": "aw",
				"<": "aqal-men",
				">": "akbar-men",
				"∑": "majmou",
				"¤": "omla"
			},
			az: {},
			ca: {
				"∆": "delta",
				"∞": "infinit",
				"♥": "amor",
				"&": "i",
				"|": "o",
				"<": "menys que",
				">": "mes que",
				"∑": "suma dels",
				"¤": "moneda"
			},
			cs: {
				"∆": "delta",
				"∞": "nekonecno",
				"♥": "laska",
				"&": "a",
				"|": "nebo",
				"<": "mensi nez",
				">": "vetsi nez",
				"∑": "soucet",
				"¤": "mena"
			},
			de: {
				"∆": "delta",
				"∞": "unendlich",
				"♥": "Liebe",
				"&": "und",
				"|": "oder",
				"<": "kleiner als",
				">": "groesser als",
				"∑": "Summe von",
				"¤": "Waehrung"
			},
			dv: {
				"∆": "delta",
				"∞": "kolunulaa",
				"♥": "loabi",
				"&": "aai",
				"|": "noonee",
				"<": "ah vure kuda",
				">": "ah vure bodu",
				"∑": "jumula",
				"¤": "faisaa"
			},
			en: {
				"∆": "delta",
				"∞": "infinity",
				"♥": "love",
				"&": "and",
				"|": "or",
				"<": "less than",
				">": "greater than",
				"∑": "sum",
				"¤": "currency"
			},
			es: {
				"∆": "delta",
				"∞": "infinito",
				"♥": "amor",
				"&": "y",
				"|": "u",
				"<": "menos que",
				">": "mas que",
				"∑": "suma de los",
				"¤": "moneda"
			},
			fa: {
				"∆": "delta",
				"∞": "bi-nahayat",
				"♥": "eshgh",
				"&": "va",
				"|": "ya",
				"<": "kamtar-az",
				">": "bishtar-az",
				"∑": "majmooe",
				"¤": "vahed"
			},
			fi: {
				"∆": "delta",
				"∞": "aarettomyys",
				"♥": "rakkaus",
				"&": "ja",
				"|": "tai",
				"<": "pienempi kuin",
				">": "suurempi kuin",
				"∑": "summa",
				"¤": "valuutta"
			},
			fr: {
				"∆": "delta",
				"∞": "infiniment",
				"♥": "Amour",
				"&": "et",
				"|": "ou",
				"<": "moins que",
				">": "superieure a",
				"∑": "somme des",
				"¤": "monnaie"
			},
			ge: {
				"∆": "delta",
				"∞": "usasruloba",
				"♥": "siqvaruli",
				"&": "da",
				"|": "an",
				"<": "naklebi",
				">": "meti",
				"∑": "jami",
				"¤": "valuta"
			},
			gr: {},
			hu: {
				"∆": "delta",
				"∞": "vegtelen",
				"♥": "szerelem",
				"&": "es",
				"|": "vagy",
				"<": "kisebb mint",
				">": "nagyobb mint",
				"∑": "szumma",
				"¤": "penznem"
			},
			it: {
				"∆": "delta",
				"∞": "infinito",
				"♥": "amore",
				"&": "e",
				"|": "o",
				"<": "minore di",
				">": "maggiore di",
				"∑": "somma",
				"¤": "moneta"
			},
			lt: {
				"∆": "delta",
				"∞": "begalybe",
				"♥": "meile",
				"&": "ir",
				"|": "ar",
				"<": "maziau nei",
				">": "daugiau nei",
				"∑": "suma",
				"¤": "valiuta"
			},
			lv: {
				"∆": "delta",
				"∞": "bezgaliba",
				"♥": "milestiba",
				"&": "un",
				"|": "vai",
				"<": "mazak neka",
				">": "lielaks neka",
				"∑": "summa",
				"¤": "valuta"
			},
			my: {
				"∆": "kwahkhyaet",
				"∞": "asaonasme",
				"♥": "akhyait",
				"&": "nhin",
				"|": "tho",
				"<": "ngethaw",
				">": "kyithaw",
				"∑": "paungld",
				"¤": "ngwekye"
			},
			mk: {},
			nl: {
				"∆": "delta",
				"∞": "oneindig",
				"♥": "liefde",
				"&": "en",
				"|": "of",
				"<": "kleiner dan",
				">": "groter dan",
				"∑": "som",
				"¤": "valuta"
			},
			pl: {
				"∆": "delta",
				"∞": "nieskonczonosc",
				"♥": "milosc",
				"&": "i",
				"|": "lub",
				"<": "mniejsze niz",
				">": "wieksze niz",
				"∑": "suma",
				"¤": "waluta"
			},
			pt: {
				"∆": "delta",
				"∞": "infinito",
				"♥": "amor",
				"&": "e",
				"|": "ou",
				"<": "menor que",
				">": "maior que",
				"∑": "soma",
				"¤": "moeda"
			},
			ro: {
				"∆": "delta",
				"∞": "infinit",
				"♥": "dragoste",
				"&": "si",
				"|": "sau",
				"<": "mai mic ca",
				">": "mai mare ca",
				"∑": "suma",
				"¤": "valuta"
			},
			ru: {
				"∆": "delta",
				"∞": "beskonechno",
				"♥": "lubov",
				"&": "i",
				"|": "ili",
				"<": "menshe",
				">": "bolshe",
				"∑": "summa",
				"¤": "valjuta"
			},
			sk: {
				"∆": "delta",
				"∞": "nekonecno",
				"♥": "laska",
				"&": "a",
				"|": "alebo",
				"<": "menej ako",
				">": "viac ako",
				"∑": "sucet",
				"¤": "mena"
			},
			sr: {},
			tr: {
				"∆": "delta",
				"∞": "sonsuzluk",
				"♥": "ask",
				"&": "ve",
				"|": "veya",
				"<": "kucuktur",
				">": "buyuktur",
				"∑": "toplam",
				"¤": "para birimi"
			},
			uk: {
				"∆": "delta",
				"∞": "bezkinechnist",
				"♥": "lubov",
				"&": "i",
				"|": "abo",
				"<": "menshe",
				">": "bilshe",
				"∑": "suma",
				"¤": "valjuta"
			},
			vn: {
				"∆": "delta",
				"∞": "vo cuc",
				"♥": "yeu",
				"&": "va",
				"|": "hoac",
				"<": "nho hon",
				">": "lon hon",
				"∑": "tong",
				"¤": "tien te"
			}
		}, s = [
			";",
			"?",
			":",
			"@",
			"&",
			"=",
			"+",
			"$",
			",",
			"/"
		].join(""), c = [
			";",
			"?",
			":",
			"@",
			"&",
			"=",
			"+",
			"$",
			","
		].join(""), l = [
			".",
			"!",
			"~",
			"*",
			"'",
			"(",
			")"
		].join(""), u = function(e, t) {
			var u = "-", d = "", p = "", te = !0, m = {}, ne, h, g, _, v, y, b, x, re, S, C, w, T, E, D = "";
			if (typeof e != "string") return "";
			if (typeof t == "string" && (u = t), b = o.en, x = a.en, typeof t == "object") for (C in ne = t.maintainCase || !1, m = t.custom && typeof t.custom == "object" ? t.custom : m, g = +t.truncate > 1 && t.truncate || !1, _ = t.uric || !1, v = t.uricNoSlash || !1, y = t.mark || !1, te = !(t.symbols === !1 || t.lang === !1), u = t.separator || u, _ && (D += s), v && (D += c), y && (D += l), b = t.lang && o[t.lang] && te ? o[t.lang] : te ? o.en : {}, x = t.lang && a[t.lang] ? a[t.lang] : t.lang === !1 || t.lang === !0 ? {} : a.en, t.titleCase && typeof t.titleCase.length == "number" && Array.prototype.toString.call(t.titleCase) ? (t.titleCase.forEach(function(e) {
				m[e + ""] = e + "";
			}), h = !0) : h = !!t.titleCase, t.custom && typeof t.custom.length == "number" && Array.prototype.toString.call(t.custom) && t.custom.forEach(function(e) {
				m[e + ""] = e + "";
			}), Object.keys(m).forEach(function(t) {
				var n = t.length > 1 ? RegExp("\\b" + f(t) + "\\b", "gi") : new RegExp(f(t), "gi");
				e = e.replace(n, m[t]);
			}), m) D += C;
			for (D += u, D = f(D), e = e.replace(/(^\s+|\s+$)/g, ""), T = !1, E = !1, S = 0, w = e.length; S < w; S++) C = e[S], ee(C, m) ? T = !1 : x[C] ? (C = T && x[C].match(/[A-Za-z0-9]/) ? " " + x[C] : x[C], T = !1) : C in n ? (S + 1 < w && r.indexOf(e[S + 1]) >= 0 ? (p += C, C = "") : E === !0 ? (C = i[p] + n[C], p = "") : C = T && n[C].match(/[A-Za-z0-9]/) ? " " + n[C] : n[C], T = !1, E = !1) : C in i ? (p += C, C = "", S === w - 1 && (C = i[p]), E = !0) : b[C] && !(_ && s.indexOf(C) !== -1) && !(v && c.indexOf(C) !== -1) ? (C = T || d.substr(-1).match(/[A-Za-z0-9]/) ? u + b[C] : b[C], C += e[S + 1] !== void 0 && e[S + 1].match(/[A-Za-z0-9]/) ? u : "", T = !0) : (E === !0 ? (C = i[p] + C, p = "", E = !1) : T && (/[A-Za-z0-9]/.test(C) || d.substr(-1).match(/A-Za-z0-9]/)) && (C = " " + C), T = !1), d += C.replace(RegExp("[^\\w\\s" + D + "_-]", "g"), u);
			return h && (d = d.replace(/(\w)(\S*)/g, function(e, t, n) {
				var r = t.toUpperCase() + (n === null ? "" : n);
				return Object.keys(m).indexOf(r.toLowerCase()) < 0 ? r : r.toLowerCase();
			})), d = d.replace(/\s+/g, u).replace(RegExp("\\" + u + "+", "g"), u).replace(RegExp("(^\\" + u + "+|\\" + u + "+$)", "g"), ""), g && d.length > g && (re = d.charAt(g) === u, d = d.slice(0, g), re || (d = d.slice(0, d.lastIndexOf(u)))), !ne && !h && (d = d.toLowerCase()), d;
		}, d = function(e) {
			return function(t) {
				return u(t, e);
			};
		}, f = function(e) {
			return e.replace(/[-\\^$*+?.()|[\]{}\/]/g, "\\$&");
		}, ee = function(e, t) {
			for (var n in t) if (t[n] === e) return !0;
		};
		if (t !== void 0 && t.exports) t.exports = u, t.exports.createSlug = d;
		else if (typeof define < "u" && define.amd) define([], function() {
			return u;
		});
		else try {
			if (e.getSlug || e.createSlug) throw "speakingurl: globals exists /(getSlug|createSlug)/";
			e.getSlug = u, e.createSlug = d;
		} catch {}
	})(e);
} }), ke = Te({ "../../node_modules/.pnpm/speakingurl@14.0.1/node_modules/speakingurl/index.js"(e, t) {
	A(), t.exports = Oe();
} });
A(), A(), A(), A(), A(), A(), A(), A();
function Ae(e) {
	let t = e.name || e._componentTag || e.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ || e.__name;
	return t === "index" && e.__file?.endsWith("index.vue") ? "" : t;
}
function je(e) {
	let t = e.__file;
	if (t) return ae(oe(t, ".vue"));
}
function Me(e, t) {
	return e.type.__VUE_DEVTOOLS_COMPONENT_GUSSED_NAME__ = t, t;
}
function Ne(e) {
	if (e.__VUE_DEVTOOLS_NEXT_APP_RECORD__) return e.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
	if (e.root) return e.appContext.app.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
}
function Pe(e) {
	let t = e.subTree?.type, n = Ne(e);
	return n ? n?.types?.Fragment === t : !1;
}
function Fe(e) {
	let t = Ae(e?.type || {});
	if (t) return t;
	if (e?.root === e) return "Root";
	for (let t in e.parent?.type?.components) if (e.parent.type.components[t] === e?.type) return Me(e, t);
	for (let t in e.appContext?.components) if (e.appContext.components[t] === e?.type) return Me(e, t);
	return je(e?.type || {}) || "Anonymous Component";
}
function Ie(e) {
	return `${e?.appContext?.app?.__VUE_DEVTOOLS_NEXT_APP_RECORD_ID__ ?? 0}:${e === e?.root ? "root" : e.uid}`;
}
function Le(e, t) {
	return t ||= `${e.id}:root`, e.instanceMap.get(t) || e.instanceMap.get(":root");
}
function Re() {
	let e = {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		get width() {
			return e.right - e.left;
		},
		get height() {
			return e.bottom - e.top;
		}
	};
	return e;
}
var ze;
function Be(e) {
	return ze ||= document.createRange(), ze.selectNode(e), ze.getBoundingClientRect();
}
function Ve(e) {
	let t = Re();
	if (!e.children) return t;
	for (let n = 0, r = e.children.length; n < r; n++) {
		let r = e.children[n], i;
		if (r.component) i = j(r.component);
		else if (r.el) {
			let e = r.el;
			e.nodeType === 1 || e.getBoundingClientRect ? i = e.getBoundingClientRect() : e.nodeType === 3 && e.data.trim() && (i = Be(e));
		}
		i && He(t, i);
	}
	return t;
}
function He(e, t) {
	return (!e.top || t.top < e.top) && (e.top = t.top), (!e.bottom || t.bottom > e.bottom) && (e.bottom = t.bottom), (!e.left || t.left < e.left) && (e.left = t.left), (!e.right || t.right > e.right) && (e.right = t.right), e;
}
var Ue = {
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: 0,
	height: 0
};
function j(e) {
	let t = e.subTree.el;
	return typeof window > "u" ? Ue : Pe(e) ? Ve(e.subTree) : t?.nodeType === 1 ? t?.getBoundingClientRect() : e.subTree.component ? j(e.subTree.component) : Ue;
}
A();
function We(e) {
	return Pe(e) ? Ge(e.subTree) : e.subTree ? [e.subTree.el] : [];
}
function Ge(e) {
	if (!e.children) return [];
	let t = [];
	return e.children.forEach((e) => {
		e.component ? t.push(...We(e.component)) : e?.el && t.push(e.el);
	}), t;
}
var Ke = "__vue-devtools-component-inspector__", qe = "__vue-devtools-component-inspector__card__", Je = "__vue-devtools-component-inspector__name__", Ye = "__vue-devtools-component-inspector__indicator__", Xe = {
	display: "block",
	zIndex: 2147483640,
	position: "fixed",
	backgroundColor: "#42b88325",
	border: "1px solid #42b88350",
	borderRadius: "5px",
	transition: "all 0.1s ease-in",
	pointerEvents: "none"
}, Ze = {
	fontFamily: "Arial, Helvetica, sans-serif",
	padding: "5px 8px",
	borderRadius: "4px",
	textAlign: "left",
	position: "absolute",
	left: 0,
	color: "#e9e9e9",
	fontSize: "14px",
	fontWeight: 600,
	lineHeight: "24px",
	backgroundColor: "#42b883",
	boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
}, Qe = {
	display: "inline-block",
	fontWeight: 400,
	fontStyle: "normal",
	fontSize: "12px",
	opacity: .7
};
function M() {
	return document.getElementById(Ke);
}
function $e() {
	return document.getElementById(qe);
}
function et() {
	return document.getElementById(Ye);
}
function tt() {
	return document.getElementById(Je);
}
function nt(e) {
	return {
		left: `${Math.round(e.left * 100) / 100}px`,
		top: `${Math.round(e.top * 100) / 100}px`,
		width: `${Math.round(e.width * 100) / 100}px`,
		height: `${Math.round(e.height * 100) / 100}px`
	};
}
function rt(e) {
	let t = document.createElement("div");
	t.id = e.elementId ?? Ke, Object.assign(t.style, {
		...Xe,
		...nt(e.bounds),
		...e.style
	});
	let n = document.createElement("span");
	n.id = qe, Object.assign(n.style, {
		...Ze,
		top: e.bounds.top < 35 ? 0 : "-35px"
	});
	let r = document.createElement("span");
	r.id = Je, r.innerHTML = `&lt;${e.name}&gt;&nbsp;&nbsp;`;
	let i = document.createElement("i");
	return i.id = Ye, i.innerHTML = `${Math.round(e.bounds.width * 100) / 100} x ${Math.round(e.bounds.height * 100) / 100}`, Object.assign(i.style, Qe), n.appendChild(r), n.appendChild(i), t.appendChild(n), document.body.appendChild(t), t;
}
function it(e) {
	let t = M(), n = $e(), r = tt(), i = et();
	t && (Object.assign(t.style, {
		...Xe,
		...nt(e.bounds)
	}), Object.assign(n.style, { top: e.bounds.top < 35 ? 0 : "-35px" }), r.innerHTML = `&lt;${e.name}&gt;&nbsp;&nbsp;`, i.innerHTML = `${Math.round(e.bounds.width * 100) / 100} x ${Math.round(e.bounds.height * 100) / 100}`);
}
function at(e) {
	let t = j(e);
	if (!t.width && !t.height) return;
	let n = Fe(e);
	M() ? it({
		bounds: t,
		name: n
	}) : rt({
		bounds: t,
		name: n
	});
}
function ot() {
	let e = M();
	e && (e.style.display = "none");
}
var st = null;
function ct(e) {
	let t = e.target;
	if (t) {
		let e = t.__vueParentComponent;
		if (e && (st = e, e.vnode.el)) {
			let t = j(e), n = Fe(e);
			M() ? it({
				bounds: t,
				name: n
			}) : rt({
				bounds: t,
				name: n
			});
		}
	}
}
function lt(e, t) {
	e.preventDefault(), e.stopPropagation(), st && t(Ie(st));
}
var ut = null;
function dt() {
	ot(), window.removeEventListener("mouseover", ct), window.removeEventListener("click", ut, !0), ut = null;
}
function ft() {
	return window.addEventListener("mouseover", ct), new Promise((e) => {
		function t(n) {
			n.preventDefault(), n.stopPropagation(), lt(n, (n) => {
				window.removeEventListener("click", t, !0), ut = null, window.removeEventListener("mouseover", ct);
				let r = M();
				r && (r.style.display = "none"), e(JSON.stringify({ id: n }));
			});
		}
		ut = t, window.addEventListener("click", t, !0);
	});
}
function pt(e) {
	let t = Le(P.value, e.id);
	if (t) {
		let [n] = We(t);
		if (typeof n.scrollIntoView == "function") n.scrollIntoView({ behavior: "smooth" });
		else {
			let e = j(t), n = document.createElement("div"), r = {
				...nt(e),
				position: "absolute"
			};
			Object.assign(n.style, r), document.body.appendChild(n), n.scrollIntoView({ behavior: "smooth" }), setTimeout(() => {
				document.body.removeChild(n);
			}, 2e3);
		}
		setTimeout(() => {
			let n = j(t);
			if (n.width || n.height) {
				let r = Fe(t), i = M();
				i ? it({
					...e,
					name: r,
					bounds: n
				}) : rt({
					...e,
					name: r,
					bounds: n
				}), setTimeout(() => {
					i && (i.style.display = "none");
				}, 1500);
			}
		}, 1200);
	}
}
A();
var mt;
(mt = E).__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__ ?? (mt.__VUE_DEVTOOLS_COMPONENT_INSPECTOR_ENABLED__ = !0);
function ht(e) {
	let t = 0, n = setInterval(() => {
		E.__VUE_INSPECTOR__ && (clearInterval(n), t += 30, e()), t >= 5e3 && clearInterval(n);
	}, 30);
}
function gt() {
	let e = E.__VUE_INSPECTOR__, t = e.openInEditor;
	e.openInEditor = async (...n) => {
		e.disable(), t(...n);
	};
}
function _t() {
	return new Promise((e) => {
		function t() {
			gt(), e(E.__VUE_INSPECTOR__);
		}
		E.__VUE_INSPECTOR__ ? t() : ht(() => {
			t();
		});
	});
}
A(), A();
function vt(e) {
	return !!(e && e.__v_isReadonly);
}
function yt(e) {
	return vt(e) ? yt(e.__v_raw) : !!(e && e.__v_isReactive);
}
function bt(e) {
	return !!(e && e.__v_isRef === !0);
}
function xt(e) {
	let t = e && e.__v_raw;
	return t ? xt(t) : e;
}
var St = class {
	constructor() {
		this.refEditor = new Ct();
	}
	set(e, t, n, r) {
		let i = Array.isArray(t) ? t : t.split(".");
		for (; i.length > 1;) {
			let t = i.shift();
			e = e instanceof Map ? e.get(t) : e instanceof Set ? Array.from(e.values())[t] : e[t], this.refEditor.isRef(e) && (e = this.refEditor.get(e));
		}
		let a = i[0], o = this.refEditor.get(e)[a];
		r ? r(e, a, n) : this.refEditor.isRef(o) ? this.refEditor.set(o, n) : e[a] = n;
	}
	get(e, t) {
		let n = Array.isArray(t) ? t : t.split(".");
		for (let t = 0; t < n.length; t++) if (e = e instanceof Map ? e.get(n[t]) : e[n[t]], this.refEditor.isRef(e) && (e = this.refEditor.get(e)), !e) return;
		return e;
	}
	has(e, t, n = !1) {
		if (e === void 0) return !1;
		let r = Array.isArray(t) ? t.slice() : t.split("."), i = n ? 2 : 1;
		for (; e && r.length > i;) {
			let t = r.shift();
			e = e[t], this.refEditor.isRef(e) && (e = this.refEditor.get(e));
		}
		return e != null && Object.prototype.hasOwnProperty.call(e, r[0]);
	}
	createDefaultSetCallback(e) {
		return (t, n, r) => {
			if ((e.remove || e.newKey) && (Array.isArray(t) ? t.splice(n, 1) : xt(t) instanceof Map ? t.delete(n) : xt(t) instanceof Set ? t.delete(Array.from(t.values())[n]) : Reflect.deleteProperty(t, n)), !e.remove) {
				let i = t[e.newKey || n];
				this.refEditor.isRef(i) ? this.refEditor.set(i, r) : xt(t) instanceof Map ? t.set(e.newKey || n, r) : xt(t) instanceof Set ? t.add(r) : t[e.newKey || n] = r;
			}
		};
	}
}, Ct = class {
	set(e, t) {
		if (bt(e)) e.value = t;
		else {
			if (e instanceof Set && Array.isArray(t)) {
				e.clear(), t.forEach((t) => e.add(t));
				return;
			}
			let n = Object.keys(t);
			if (e instanceof Map) {
				let r = new Set(e.keys());
				n.forEach((n) => {
					e.set(n, Reflect.get(t, n)), r.delete(n);
				}), r.forEach((t) => e.delete(t));
				return;
			}
			let r = new Set(Object.keys(e));
			n.forEach((n) => {
				Reflect.set(e, n, Reflect.get(t, n)), r.delete(n);
			}), r.forEach((t) => Reflect.deleteProperty(e, t));
		}
	}
	get(e) {
		return bt(e) ? e.value : e;
	}
	isRef(e) {
		return bt(e) || yt(e);
	}
};
new St(), A(), A(), A();
var wt = "__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS_STATE__";
function Tt() {
	if (typeof window > "u" || !T || typeof localStorage > "u" || localStorage === null) return {
		recordingState: !1,
		mouseEventEnabled: !1,
		keyboardEventEnabled: !1,
		componentEventEnabled: !1,
		performanceEventEnabled: !1,
		selected: ""
	};
	let e = localStorage.getItem === void 0 ? null : localStorage.getItem(wt);
	return e ? JSON.parse(e) : {
		recordingState: !1,
		mouseEventEnabled: !1,
		keyboardEventEnabled: !1,
		componentEventEnabled: !1,
		performanceEventEnabled: !1,
		selected: ""
	};
}
A(), A(), A();
var Et;
(Et = E).__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS ?? (Et.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS = []);
var Dt = new Proxy(E.__VUE_DEVTOOLS_KIT_TIMELINE_LAYERS, { get(e, t, n) {
	return Reflect.get(e, t, n);
} });
function Ot(e, t) {
	F.timelineLayersState[t.id] = !1, Dt.push({
		...e,
		descriptorId: t.id,
		appRecord: Ne(t.app)
	});
}
var kt;
(kt = E).__VUE_DEVTOOLS_KIT_INSPECTOR__ ?? (kt.__VUE_DEVTOOLS_KIT_INSPECTOR__ = []);
var At = new Proxy(E.__VUE_DEVTOOLS_KIT_INSPECTOR__, { get(e, t, n) {
	return Reflect.get(e, t, n);
} }), jt = k(() => {
	L.hooks.callHook("sendInspectorToClient", Nt());
});
function Mt(e, t) {
	At.push({
		options: e,
		descriptor: t,
		treeFilterPlaceholder: e.treeFilterPlaceholder ?? "Search tree...",
		stateFilterPlaceholder: e.stateFilterPlaceholder ?? "Search state...",
		treeFilter: "",
		selectedNodeId: "",
		appRecord: Ne(t.app)
	}), jt();
}
function Nt() {
	return At.filter((e) => e.descriptor.app === P.value.app).filter((e) => e.descriptor.id !== "components").map((e) => {
		let t = e.descriptor, n = e.options;
		return {
			id: n.id,
			label: n.label,
			logo: t.logo,
			icon: `custom-ic-baseline-${(n?.icon)?.replace(/_/g, "-")}`,
			packageName: t.packageName,
			homepage: t.homepage,
			pluginId: t.id
		};
	});
}
function Pt(e, t) {
	return At.find((n) => n.options.id === e && (!t || n.descriptor.app === t));
}
function Ft() {
	let e = _e();
	e.hook("addInspector", ({ inspector: e, plugin: t }) => {
		Mt(e, t.descriptor);
	});
	let t = k(async ({ inspectorId: t, plugin: n }) => {
		if (!t || !n?.descriptor?.app || F.highPerfModeEnabled) return;
		let r = Pt(t, n.descriptor.app), i = {
			app: n.descriptor.app,
			inspectorId: t,
			filter: r?.treeFilter || "",
			rootNodes: []
		};
		await new Promise((t) => {
			e.callHookWith(async (e) => {
				await Promise.all(e.map((e) => e(i))), t();
			}, "getInspectorTree");
		}), e.callHookWith(async (e) => {
			await Promise.all(e.map((e) => e({
				inspectorId: t,
				rootNodes: i.rootNodes
			})));
		}, "sendInspectorTreeToClient");
	}, 120);
	e.hook("sendInspectorTree", t);
	let n = k(async ({ inspectorId: t, plugin: n }) => {
		if (!t || !n?.descriptor?.app || F.highPerfModeEnabled) return;
		let r = Pt(t, n.descriptor.app), i = {
			app: n.descriptor.app,
			inspectorId: t,
			nodeId: r?.selectedNodeId || "",
			state: null
		}, a = { currentTab: `custom-inspector:${t}` };
		i.nodeId && await new Promise((t) => {
			e.callHookWith(async (e) => {
				await Promise.all(e.map((e) => e(i, a))), t();
			}, "getInspectorState");
		}), e.callHookWith(async (e) => {
			await Promise.all(e.map((e) => e({
				inspectorId: t,
				nodeId: i.nodeId,
				state: i.state
			})));
		}, "sendInspectorStateToClient");
	}, 120);
	return e.hook("sendInspectorState", n), e.hook("customInspectorSelectNode", ({ inspectorId: e, nodeId: t, plugin: n }) => {
		let r = Pt(e, n.descriptor.app);
		r && (r.selectedNodeId = t);
	}), e.hook("timelineLayerAdded", ({ options: e, plugin: t }) => {
		Ot(e, t.descriptor);
	}), e.hook("timelineEventAdded", ({ options: t, plugin: n }) => {
		F.highPerfModeEnabled || !F.timelineLayersState?.[n.descriptor.id] && ![
			"performance",
			"component-event",
			"keyboard",
			"mouse"
		].includes(t.layerId) || e.callHookWith(async (e) => {
			await Promise.all(e.map((e) => e(t)));
		}, "sendTimelineEventToClient");
	}), e.hook("getComponentInstances", async ({ app: e }) => {
		let t = e.__VUE_DEVTOOLS_NEXT_APP_RECORD__;
		if (!t) return null;
		let n = t.id.toString();
		return [...t.instanceMap].filter(([e]) => e.split(":")[0] === n).map(([, e]) => e);
	}), e.hook("getComponentBounds", async ({ instance: e }) => j(e)), e.hook("getComponentName", ({ instance: e }) => Fe(e)), e.hook("componentHighlight", ({ uid: e }) => {
		let t = P.value.instanceMap.get(e);
		t && at(t);
	}), e.hook("componentUnhighlight", () => {
		ot();
	}), e;
}
var It;
(It = E).__VUE_DEVTOOLS_KIT_APP_RECORDS__ ?? (It.__VUE_DEVTOOLS_KIT_APP_RECORDS__ = []);
var Lt;
(Lt = E).__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ ?? (Lt.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = {});
var Rt;
(Rt = E).__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ ?? (Rt.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = "");
var zt;
(zt = E).__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ ?? (zt.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ = []);
var Bt;
(Bt = E).__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ ?? (Bt.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ = []);
var N = "__VUE_DEVTOOLS_KIT_GLOBAL_STATE__";
function Vt() {
	return {
		connected: !1,
		clientConnected: !1,
		vitePluginDetected: !0,
		appRecords: [],
		activeAppRecordId: "",
		tabs: [],
		commands: [],
		highPerfModeEnabled: !0,
		devtoolsClientDetected: {},
		perfUniqueGroupId: 0,
		timelineLayersState: Tt()
	};
}
var Ht;
(Ht = E)[N] ?? (Ht[N] = Vt());
var Ut = k((e) => {
	L.hooks.callHook("devtoolsStateUpdated", { state: e });
});
k((e, t) => {
	L.hooks.callHook("devtoolsConnectedUpdated", {
		state: e,
		oldState: t
	});
});
var Wt = new Proxy(E.__VUE_DEVTOOLS_KIT_APP_RECORDS__, { get(e, t, n) {
	return t === "value" ? E.__VUE_DEVTOOLS_KIT_APP_RECORDS__ : E.__VUE_DEVTOOLS_KIT_APP_RECORDS__[t];
} }), P = new Proxy(E.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__, { get(e, t, n) {
	return t === "value" ? E.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ : t === "id" ? E.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ : E.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__[t];
} });
function Gt() {
	Ut({
		...E[N],
		appRecords: Wt.value,
		activeAppRecordId: P.id,
		tabs: E.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__,
		commands: E.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__
	});
}
function Kt(e) {
	E.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD__ = e, Gt();
}
function qt(e) {
	E.__VUE_DEVTOOLS_KIT_ACTIVE_APP_RECORD_ID__ = e, Gt();
}
var F = new Proxy(E[N], {
	get(e, t) {
		return t === "appRecords" ? Wt : t === "activeAppRecordId" ? P.id : t === "tabs" ? E.__VUE_DEVTOOLS_KIT_CUSTOM_TABS__ : t === "commands" ? E.__VUE_DEVTOOLS_KIT_CUSTOM_COMMANDS__ : E[N][t];
	},
	deleteProperty(e, t) {
		return delete e[t], !0;
	},
	set(e, t, n) {
		return { ...E[N] }, e[t] = n, E[N][t] = n, !0;
	}
});
function Jt(e = {}) {
	let { file: t, host: n, baseUrl: r = window.location.origin, line: i = 0, column: a = 0 } = e;
	if (t) {
		if (n === "chrome-extension") {
			let e = t.replace(/\\/g, "\\\\"), n = window.VUE_DEVTOOLS_CONFIG?.openInEditorHost ?? "/";
			fetch(`${n}__open-in-editor?file=${encodeURI(t)}`).then((t) => {
				if (!t.ok) {
					let t = `Opening component ${e} failed`;
					console.log(`%c${t}`, "color:red");
				}
			});
		} else if (F.vitePluginDetected) {
			let e = E.__VUE_DEVTOOLS_OPEN_IN_EDITOR_BASE_URL__ ?? r;
			E.__VUE_INSPECTOR__.openInEditor(e, t, i, a);
		}
	}
}
A(), A(), A(), A(), A();
var Yt;
(Yt = E).__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__ ?? (Yt.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__ = []);
var Xt = new Proxy(E.__VUE_DEVTOOLS_KIT_PLUGIN_BUFFER__, { get(e, t, n) {
	return Reflect.get(e, t, n);
} });
function Zt(e) {
	let t = {};
	return Object.keys(e).forEach((n) => {
		t[n] = e[n].defaultValue;
	}), t;
}
function Qt(e) {
	return `__VUE_DEVTOOLS_NEXT_PLUGIN_SETTINGS__${e}__`;
}
function $t(e) {
	return (Xt.find((t) => t[0].id === e && !!t[0]?.settings)?.[0] ?? null)?.settings ?? null;
}
function en(e, t) {
	let n = Qt(e);
	if (n) {
		let e = localStorage.getItem(n);
		if (e) return JSON.parse(e);
	}
	return Zt(e ? (Xt.find((t) => t[0].id === e)?.[0] ?? null)?.settings ?? {} : t);
}
function tn(e, t) {
	let n = Qt(e);
	localStorage.getItem(n) || localStorage.setItem(n, JSON.stringify(Zt(t)));
}
function nn(e, t, n) {
	let r = Qt(e), i = localStorage.getItem(r), a = JSON.parse(i || "{}"), o = {
		...a,
		[t]: n
	};
	localStorage.setItem(r, JSON.stringify(o)), L.hooks.callHookWith((r) => {
		r.forEach((r) => r({
			pluginId: e,
			key: t,
			oldValue: a[t],
			newValue: n,
			settings: o
		}));
	}, "setPluginSettings");
}
A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A();
var rn, I = (rn = E).__VUE_DEVTOOLS_HOOK ?? (rn.__VUE_DEVTOOLS_HOOK = _e()), an = {
	on: {
		vueAppInit(e) {
			I.hook("app:init", e);
		},
		vueAppUnmount(e) {
			I.hook("app:unmount", e);
		},
		vueAppConnected(e) {
			I.hook("app:connected", e);
		},
		componentAdded(e) {
			return I.hook("component:added", e);
		},
		componentEmit(e) {
			return I.hook("component:emit", e);
		},
		componentUpdated(e) {
			return I.hook("component:updated", e);
		},
		componentRemoved(e) {
			return I.hook("component:removed", e);
		},
		setupDevtoolsPlugin(e) {
			I.hook("devtools-plugin:setup", e);
		},
		perfStart(e) {
			return I.hook("perf:start", e);
		},
		perfEnd(e) {
			return I.hook("perf:end", e);
		}
	},
	setupDevToolsPlugin(e, t) {
		return I.callHook("devtools-plugin:setup", e, t);
	}
}, on = class {
	constructor({ plugin: e, ctx: t }) {
		this.hooks = t.hooks, this.plugin = e;
	}
	get on() {
		return {
			visitComponentTree: (e) => {
				this.hooks.hook("visitComponentTree", e);
			},
			inspectComponent: (e) => {
				this.hooks.hook("inspectComponent", e);
			},
			editComponentState: (e) => {
				this.hooks.hook("editComponentState", e);
			},
			getInspectorTree: (e) => {
				this.hooks.hook("getInspectorTree", e);
			},
			getInspectorState: (e) => {
				this.hooks.hook("getInspectorState", e);
			},
			editInspectorState: (e) => {
				this.hooks.hook("editInspectorState", e);
			},
			inspectTimelineEvent: (e) => {
				this.hooks.hook("inspectTimelineEvent", e);
			},
			timelineCleared: (e) => {
				this.hooks.hook("timelineCleared", e);
			},
			setPluginSettings: (e) => {
				this.hooks.hook("setPluginSettings", e);
			}
		};
	}
	notifyComponentUpdate(e) {
		if (F.highPerfModeEnabled) return;
		let t = Nt().find((e) => e.packageName === this.plugin.descriptor.packageName);
		if (t?.id) {
			if (e) {
				let t = [
					e.appContext.app,
					e.uid,
					e.parent?.uid,
					e
				];
				I.callHook("component:updated", ...t);
			} else I.callHook("component:updated");
			this.hooks.callHook("sendInspectorState", {
				inspectorId: t.id,
				plugin: this.plugin
			});
		}
	}
	addInspector(e) {
		this.hooks.callHook("addInspector", {
			inspector: e,
			plugin: this.plugin
		}), this.plugin.descriptor.settings && tn(e.id, this.plugin.descriptor.settings);
	}
	sendInspectorTree(e) {
		F.highPerfModeEnabled || this.hooks.callHook("sendInspectorTree", {
			inspectorId: e,
			plugin: this.plugin
		});
	}
	sendInspectorState(e) {
		F.highPerfModeEnabled || this.hooks.callHook("sendInspectorState", {
			inspectorId: e,
			plugin: this.plugin
		});
	}
	selectInspectorNode(e, t) {
		this.hooks.callHook("customInspectorSelectNode", {
			inspectorId: e,
			nodeId: t,
			plugin: this.plugin
		});
	}
	visitComponentTree(e) {
		return this.hooks.callHook("visitComponentTree", e);
	}
	now() {
		return F.highPerfModeEnabled ? 0 : Date.now();
	}
	addTimelineLayer(e) {
		this.hooks.callHook("timelineLayerAdded", {
			options: e,
			plugin: this.plugin
		});
	}
	addTimelineEvent(e) {
		F.highPerfModeEnabled || this.hooks.callHook("timelineEventAdded", {
			options: e,
			plugin: this.plugin
		});
	}
	getSettings(e) {
		return en(e ?? this.plugin.descriptor.id, this.plugin.descriptor.settings);
	}
	getComponentInstances(e) {
		return this.hooks.callHook("getComponentInstances", { app: e });
	}
	getComponentBounds(e) {
		return this.hooks.callHook("getComponentBounds", { instance: e });
	}
	getComponentName(e) {
		return this.hooks.callHook("getComponentName", { instance: e });
	}
	highlightElement(e) {
		let t = e.__VUE_DEVTOOLS_NEXT_UID__;
		return this.hooks.callHook("componentHighlight", { uid: t });
	}
	unhighlightElement() {
		return this.hooks.callHook("componentUnhighlight");
	}
};
A(), A(), A(), A();
var sn = "__vue_devtool_undefined__", cn = "__vue_devtool_infinity__", ln = "__vue_devtool_negative_infinity__", un = "__vue_devtool_nan__";
A(), A(), Object.entries({
	[sn]: "undefined",
	[un]: "NaN",
	[cn]: "Infinity",
	[ln]: "-Infinity"
}).reduce((e, [t, n]) => (e[n] = t, e), {}), A(), A(), A(), A(), A();
var dn;
(dn = E).__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__ ?? (dn.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__ = /* @__PURE__ */ new Set());
function fn(e, t) {
	return an.setupDevToolsPlugin(e, t);
}
function pn(e, t) {
	let [n, r] = e;
	if (n.app !== t) return;
	let i = new on({
		plugin: {
			setupFn: r,
			descriptor: n
		},
		ctx: L
	});
	n.packageName === "vuex" && i.on.editInspectorState((e) => {
		i.sendInspectorState(e.inspectorId);
	}), r(i);
}
function mn(e, t) {
	E.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.has(e) || F.highPerfModeEnabled && !t?.inspectingComponent || (E.__VUE_DEVTOOLS_KIT__REGISTERED_PLUGIN_APPS__.add(e), Xt.forEach((t) => {
		pn(t, e);
	}));
}
A(), A();
var hn = "__VUE_DEVTOOLS_ROUTER__", gn = "__VUE_DEVTOOLS_ROUTER_INFO__", _n;
(_n = E).__VUE_DEVTOOLS_ROUTER_INFO__ ?? (_n.__VUE_DEVTOOLS_ROUTER_INFO__ = {
	currentRoute: null,
	routes: []
});
var vn;
(vn = E).__VUE_DEVTOOLS_ROUTER__ ?? (vn.__VUE_DEVTOOLS_ROUTER__ = {}), new Proxy(E[gn], { get(e, t) {
	return E[gn][t];
} }), new Proxy(E[hn], { get(e, t) {
	if (t === "value") return E[hn];
} });
function yn(e) {
	let t = /* @__PURE__ */ new Map();
	return (e?.getRoutes() || []).filter((e) => !t.has(e.path) && t.set(e.path, 1));
}
function bn(e) {
	return e.map((e) => {
		let { path: t, name: n, children: r, meta: i } = e;
		return r?.length && (r = bn(r)), {
			path: t,
			name: n,
			children: r,
			meta: i
		};
	});
}
function xn(e) {
	if (e) {
		let { fullPath: t, hash: n, href: r, path: i, name: a, matched: o, params: s, query: c } = e;
		return {
			fullPath: t,
			hash: n,
			href: r,
			path: i,
			name: a,
			params: s,
			query: c,
			matched: bn(o)
		};
	}
	return e;
}
function Sn(e, t) {
	function n() {
		let t = e.app?.config.globalProperties.$router, n = xn(t?.currentRoute.value), r = bn(yn(t)), i = console.warn;
		console.warn = () => {}, E[gn] = {
			currentRoute: n ? se(n) : {},
			routes: se(r)
		}, E[hn] = t, console.warn = i;
	}
	n(), an.on.componentUpdated(k(() => {
		t.value?.app === e.app && (n(), !F.highPerfModeEnabled && L.hooks.callHook("routerInfoUpdated", { state: E[gn] }));
	}, 200));
}
function Cn(e) {
	return {
		async getInspectorTree(t) {
			let n = {
				...t,
				app: P.value.app,
				rootNodes: []
			};
			return await new Promise((t) => {
				e.callHookWith(async (e) => {
					await Promise.all(e.map((e) => e(n))), t();
				}, "getInspectorTree");
			}), n.rootNodes;
		},
		async getInspectorState(t) {
			let n = {
				...t,
				app: P.value.app,
				state: null
			}, r = { currentTab: `custom-inspector:${t.inspectorId}` };
			return await new Promise((t) => {
				e.callHookWith(async (e) => {
					await Promise.all(e.map((e) => e(n, r))), t();
				}, "getInspectorState");
			}), n.state;
		},
		editInspectorState(t) {
			let n = new St(), r = {
				...t,
				app: P.value.app,
				set: (e, r = t.path, i = t.state.value, a) => {
					n.set(e, r, i, a || n.createDefaultSetCallback(t.state));
				}
			};
			e.callHookWith((e) => {
				e.forEach((e) => e(r));
			}, "editInspectorState");
		},
		sendInspectorState(t) {
			let n = Pt(t);
			e.callHook("sendInspectorState", {
				inspectorId: t,
				plugin: {
					descriptor: n.descriptor,
					setupFn: () => ({})
				}
			});
		},
		inspectComponentInspector() {
			return ft();
		},
		cancelInspectComponentInspector() {
			return dt();
		},
		getComponentRenderCode(e) {
			let t = Le(P.value, e);
			if (t) return typeof t?.type == "function" ? t.type.toString() : t.render.toString();
		},
		scrollToComponent(e) {
			return pt({ id: e });
		},
		openInEditor: Jt,
		getVueInspector: _t,
		toggleApp(e, t) {
			let n = Wt.value.find((t) => t.id === e);
			n && (qt(e), Kt(n), Sn(n, P), jt(), mn(n.app, t));
		},
		inspectDOM(e) {
			let t = Le(P.value, e);
			if (t) {
				let [e] = We(t);
				e && (E.__VUE_DEVTOOLS_INSPECT_DOM_TARGET__ = e);
			}
		},
		updatePluginSettings(e, t, n) {
			nn(e, t, n);
		},
		getPluginSettings(e) {
			return {
				options: $t(e),
				values: en(e)
			};
		}
	};
}
A();
var wn;
(wn = E).__VUE_DEVTOOLS_ENV__ ?? (wn.__VUE_DEVTOOLS_ENV__ = { vitePluginDetected: !1 });
var Tn = Ft(), En;
(En = E).__VUE_DEVTOOLS_KIT_CONTEXT__ ?? (En.__VUE_DEVTOOLS_KIT_CONTEXT__ = {
	hooks: Tn,
	get state() {
		return {
			...F,
			activeAppRecordId: P.id,
			activeAppRecord: P.value,
			appRecords: Wt.value
		};
	},
	api: Cn(Tn)
});
var L = E.__VUE_DEVTOOLS_KIT_CONTEXT__;
A(), De(ke(), 1);
var Dn;
(Dn = E).__VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__ ?? (Dn.__VUE_DEVTOOLS_NEXT_APP_RECORD_INFO__ = {
	id: 0,
	appIds: /* @__PURE__ */ new Set()
}), A(), A();
function On(e) {
	F.highPerfModeEnabled = e ?? !F.highPerfModeEnabled, !e && P.value && mn(P.value.app);
}
A(), A(), A();
function kn(e) {
	F.devtoolsClientDetected = {
		...F.devtoolsClientDetected,
		...e
	}, On(!Object.values(F.devtoolsClientDetected).some(Boolean));
}
var An;
(An = E).__VUE_DEVTOOLS_UPDATE_CLIENT_DETECTED__ ?? (An.__VUE_DEVTOOLS_UPDATE_CLIENT_DETECTED__ = kn), A(), A(), A(), A(), A(), A(), A();
var jn = class {
	constructor() {
		this.keyToValue = /* @__PURE__ */ new Map(), this.valueToKey = /* @__PURE__ */ new Map();
	}
	set(e, t) {
		this.keyToValue.set(e, t), this.valueToKey.set(t, e);
	}
	getByKey(e) {
		return this.keyToValue.get(e);
	}
	getByValue(e) {
		return this.valueToKey.get(e);
	}
	clear() {
		this.keyToValue.clear(), this.valueToKey.clear();
	}
}, Mn = class {
	constructor(e) {
		this.generateIdentifier = e, this.kv = new jn();
	}
	register(e, t) {
		this.kv.getByValue(e) || (t ||= this.generateIdentifier(e), this.kv.set(t, e));
	}
	clear() {
		this.kv.clear();
	}
	getIdentifier(e) {
		return this.kv.getByValue(e);
	}
	getValue(e) {
		return this.kv.getByKey(e);
	}
}, Nn = class extends Mn {
	constructor() {
		super((e) => e.name), this.classToAllowedProps = /* @__PURE__ */ new Map();
	}
	register(e, t) {
		typeof t == "object" ? (t.allowProps && this.classToAllowedProps.set(e, t.allowProps), super.register(e, t.identifier)) : super.register(e, t);
	}
	getAllowedProps(e) {
		return this.classToAllowedProps.get(e);
	}
};
A(), A();
function Pn(e) {
	if ("values" in Object) return Object.values(e);
	let t = [];
	for (let n in e) e.hasOwnProperty(n) && t.push(e[n]);
	return t;
}
function Fn(e, t) {
	let n = Pn(e);
	if ("find" in n) return n.find(t);
	let r = n;
	for (let e = 0; e < r.length; e++) {
		let n = r[e];
		if (t(n)) return n;
	}
}
function R(e, t) {
	Object.entries(e).forEach(([e, n]) => t(n, e));
}
function In(e, t) {
	return e.indexOf(t) !== -1;
}
function Ln(e, t) {
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		if (t(r)) return r;
	}
}
var Rn = class {
	constructor() {
		this.transfomers = {};
	}
	register(e) {
		this.transfomers[e.name] = e;
	}
	findApplicable(e) {
		return Fn(this.transfomers, (t) => t.isApplicable(e));
	}
	findByName(e) {
		return this.transfomers[e];
	}
};
A(), A();
var zn = (e) => Object.prototype.toString.call(e).slice(8, -1), Bn = (e) => e === void 0, Vn = (e) => e === null, Hn = (e) => typeof e != "object" || !e || e === Object.prototype ? !1 : Object.getPrototypeOf(e) === null || Object.getPrototypeOf(e) === Object.prototype, Un = (e) => Hn(e) && Object.keys(e).length === 0, z = (e) => Array.isArray(e), Wn = (e) => typeof e == "string", Gn = (e) => typeof e == "number" && !isNaN(e), Kn = (e) => typeof e == "boolean", qn = (e) => e instanceof RegExp, Jn = (e) => e instanceof Map, Yn = (e) => e instanceof Set, Xn = (e) => zn(e) === "Symbol", Zn = (e) => e instanceof Date && !isNaN(e.valueOf()), Qn = (e) => e instanceof Error, $n = (e) => typeof e == "number" && isNaN(e), er = (e) => Kn(e) || Vn(e) || Bn(e) || Gn(e) || Wn(e) || Xn(e), tr = (e) => typeof e == "bigint", nr = (e) => e === Infinity || e === -Infinity, rr = (e) => ArrayBuffer.isView(e) && !(e instanceof DataView), ir = (e) => e instanceof URL;
A();
var ar = (e) => e.replace(/\./g, "\\."), or = (e) => e.map(String).map(ar).join("."), sr = (e) => {
	let t = [], n = "";
	for (let r = 0; r < e.length; r++) {
		let i = e.charAt(r);
		if (i === "\\" && e.charAt(r + 1) === ".") {
			n += ".", r++;
			continue;
		}
		if (i === ".") {
			t.push(n), n = "";
			continue;
		}
		n += i;
	}
	let r = n;
	return t.push(r), t;
};
A();
function B(e, t, n, r) {
	return {
		isApplicable: e,
		annotation: t,
		transform: n,
		untransform: r
	};
}
var cr = [
	B(Bn, "undefined", () => null, () => void 0),
	B(tr, "bigint", (e) => e.toString(), (e) => typeof BigInt < "u" ? BigInt(e) : (console.error("Please add a BigInt polyfill."), e)),
	B(Zn, "Date", (e) => e.toISOString(), (e) => new Date(e)),
	B(Qn, "Error", (e, t) => {
		let n = {
			name: e.name,
			message: e.message
		};
		return t.allowedErrorProps.forEach((t) => {
			n[t] = e[t];
		}), n;
	}, (e, t) => {
		let n = Error(e.message);
		return n.name = e.name, n.stack = e.stack, t.allowedErrorProps.forEach((t) => {
			n[t] = e[t];
		}), n;
	}),
	B(qn, "regexp", (e) => "" + e, (e) => {
		let t = e.slice(1, e.lastIndexOf("/")), n = e.slice(e.lastIndexOf("/") + 1);
		return new RegExp(t, n);
	}),
	B(Yn, "set", (e) => [...e.values()], (e) => new Set(e)),
	B(Jn, "map", (e) => [...e.entries()], (e) => new Map(e)),
	B((e) => $n(e) || nr(e), "number", (e) => $n(e) ? "NaN" : e > 0 ? "Infinity" : "-Infinity", Number),
	B((e) => e === 0 && 1 / e == -Infinity, "number", () => "-0", Number),
	B(ir, "URL", (e) => e.toString(), (e) => new URL(e))
];
function lr(e, t, n, r) {
	return {
		isApplicable: e,
		annotation: t,
		transform: n,
		untransform: r
	};
}
var ur = lr((e, t) => Xn(e) ? !!t.symbolRegistry.getIdentifier(e) : !1, (e, t) => ["symbol", t.symbolRegistry.getIdentifier(e)], (e) => e.description, (e, t, n) => {
	let r = n.symbolRegistry.getValue(t[1]);
	if (!r) throw Error("Trying to deserialize unknown symbol");
	return r;
}), dr = [
	Int8Array,
	Uint8Array,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array,
	Uint8ClampedArray
].reduce((e, t) => (e[t.name] = t, e), {}), fr = lr(rr, (e) => ["typed-array", e.constructor.name], (e) => [...e], (e, t) => {
	let n = dr[t[1]];
	if (!n) throw Error("Trying to deserialize unknown typed array");
	return new n(e);
});
function pr(e, t) {
	return e?.constructor ? !!t.classRegistry.getIdentifier(e.constructor) : !1;
}
var mr = lr(pr, (e, t) => ["class", t.classRegistry.getIdentifier(e.constructor)], (e, t) => {
	let n = t.classRegistry.getAllowedProps(e.constructor);
	if (!n) return { ...e };
	let r = {};
	return n.forEach((t) => {
		r[t] = e[t];
	}), r;
}, (e, t, n) => {
	let r = n.classRegistry.getValue(t[1]);
	if (!r) throw Error(`Trying to deserialize unknown class '${t[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
	return Object.assign(Object.create(r.prototype), e);
}), hr = lr((e, t) => !!t.customTransformerRegistry.findApplicable(e), (e, t) => ["custom", t.customTransformerRegistry.findApplicable(e).name], (e, t) => t.customTransformerRegistry.findApplicable(e).serialize(e), (e, t, n) => {
	let r = n.customTransformerRegistry.findByName(t[1]);
	if (!r) throw Error("Trying to deserialize unknown custom value");
	return r.deserialize(e);
}), gr = [
	mr,
	ur,
	hr,
	fr
], _r = (e, t) => {
	let n = Ln(gr, (n) => n.isApplicable(e, t));
	if (n) return {
		value: n.transform(e, t),
		type: n.annotation(e, t)
	};
	let r = Ln(cr, (n) => n.isApplicable(e, t));
	if (r) return {
		value: r.transform(e, t),
		type: r.annotation
	};
}, vr = {};
cr.forEach((e) => {
	vr[e.annotation] = e;
});
var yr = (e, t, n) => {
	if (z(t)) switch (t[0]) {
		case "symbol": return ur.untransform(e, t, n);
		case "class": return mr.untransform(e, t, n);
		case "custom": return hr.untransform(e, t, n);
		case "typed-array": return fr.untransform(e, t, n);
		default: throw Error("Unknown transformation: " + t);
	}
	else {
		let r = vr[t];
		if (!r) throw Error("Unknown transformation: " + t);
		return r.untransform(e, n);
	}
};
A();
var V = (e, t) => {
	if (t > e.size) throw Error("index out of bounds");
	let n = e.keys();
	for (; t > 0;) n.next(), t--;
	return n.next().value;
};
function br(e) {
	if (In(e, "__proto__")) throw Error("__proto__ is not allowed as a property");
	if (In(e, "prototype")) throw Error("prototype is not allowed as a property");
	if (In(e, "constructor")) throw Error("constructor is not allowed as a property");
}
var xr = (e, t) => {
	br(t);
	for (let n = 0; n < t.length; n++) {
		let r = t[n];
		if (Yn(e)) e = V(e, +r);
		else if (Jn(e)) {
			let i = +r, a = +t[++n] == 0 ? "key" : "value", o = V(e, i);
			switch (a) {
				case "key":
					e = o;
					break;
				case "value":
					e = e.get(o);
					break;
			}
		} else e = e[r];
	}
	return e;
}, Sr = (e, t, n) => {
	if (br(t), t.length === 0) return n(e);
	let r = e;
	for (let e = 0; e < t.length - 1; e++) {
		let n = t[e];
		if (z(r)) {
			let e = +n;
			r = r[e];
		} else if (Hn(r)) r = r[n];
		else if (Yn(r)) {
			let e = +n;
			r = V(r, e);
		} else if (Jn(r)) {
			if (e === t.length - 2) break;
			let i = +n, a = +t[++e] == 0 ? "key" : "value", o = V(r, i);
			switch (a) {
				case "key":
					r = o;
					break;
				case "value":
					r = r.get(o);
					break;
			}
		}
	}
	let i = t[t.length - 1];
	if (z(r) ? r[+i] = n(r[+i]) : Hn(r) && (r[i] = n(r[i])), Yn(r)) {
		let e = V(r, +i), t = n(e);
		e !== t && (r.delete(e), r.add(t));
	}
	if (Jn(r)) {
		let e = +t[t.length - 2], a = V(r, e);
		switch (+i == 0 ? "key" : "value") {
			case "key": {
				let e = n(a);
				r.set(e, r.get(a)), e !== a && r.delete(a);
				break;
			}
			case "value":
				r.set(a, n(r.get(a)));
				break;
		}
	}
	return e;
};
function Cr(e, t, n = []) {
	if (!e) return;
	if (!z(e)) {
		R(e, (e, r) => Cr(e, t, [...n, ...sr(r)]));
		return;
	}
	let [r, i] = e;
	i && R(i, (e, r) => {
		Cr(e, t, [...n, ...sr(r)]);
	}), t(r, n);
}
function wr(e, t, n) {
	return Cr(t, (t, r) => {
		e = Sr(e, r, (e) => yr(e, t, n));
	}), e;
}
function Tr(e, t) {
	function n(t, n) {
		let r = xr(e, sr(n));
		t.map(sr).forEach((t) => {
			e = Sr(e, t, () => r);
		});
	}
	if (z(t)) {
		let [r, i] = t;
		r.forEach((t) => {
			e = Sr(e, sr(t), () => e);
		}), i && R(i, n);
	} else R(t, n);
	return e;
}
var Er = (e, t) => Hn(e) || z(e) || Jn(e) || Yn(e) || pr(e, t);
function Dr(e, t, n) {
	let r = n.get(e);
	r ? r.push(t) : n.set(e, [t]);
}
function Or(e, t) {
	let n = {}, r;
	return e.forEach((e) => {
		if (e.length <= 1) return;
		t || (e = e.map((e) => e.map(String)).sort((e, t) => e.length - t.length));
		let [i, ...a] = e;
		i.length === 0 ? r = a.map(or) : n[or(i)] = a.map(or);
	}), r ? Un(n) ? [r] : [r, n] : Un(n) ? void 0 : n;
}
var kr = (e, t, n, r, i = [], a = [], o = /* @__PURE__ */ new Map()) => {
	let s = er(e);
	if (!s) {
		Dr(e, i, t);
		let n = o.get(e);
		if (n) return r ? { transformedValue: null } : n;
	}
	if (!Er(e, n)) {
		let t = _r(e, n), r = t ? {
			transformedValue: t.value,
			annotations: [t.type]
		} : { transformedValue: e };
		return s || o.set(e, r), r;
	}
	if (In(a, e)) return { transformedValue: null };
	let c = _r(e, n), l = c?.value ?? e, u = z(l) ? [] : {}, d = {};
	R(l, (s, c) => {
		if (c === "__proto__" || c === "constructor" || c === "prototype") throw Error(`Detected property ${c}. This is a prototype pollution risk, please remove it from your object.`);
		let l = kr(s, t, n, r, [...i, c], [...a, e], o);
		u[c] = l.transformedValue, z(l.annotations) ? d[c] = l.annotations : Hn(l.annotations) && R(l.annotations, (e, t) => {
			d[ar(c) + "." + t] = e;
		});
	});
	let f = Un(d) ? {
		transformedValue: u,
		annotations: c ? [c.type] : void 0
	} : {
		transformedValue: u,
		annotations: c ? [c.type, d] : d
	};
	return s || o.set(e, f), f;
};
A(), A();
function Ar(e) {
	return Object.prototype.toString.call(e).slice(8, -1);
}
function jr(e) {
	return Ar(e) === "Array";
}
function Mr(e) {
	if (Ar(e) !== "Object") return !1;
	let t = Object.getPrototypeOf(e);
	return !!t && t.constructor === Object && t === Object.prototype;
}
function Nr(e, t, n, r, i) {
	let a = {}.propertyIsEnumerable.call(r, t) ? "enumerable" : "nonenumerable";
	a === "enumerable" && (e[t] = n), i && a === "nonenumerable" && Object.defineProperty(e, t, {
		value: n,
		enumerable: !1,
		writable: !0,
		configurable: !0
	});
}
function Pr(e, t = {}) {
	if (jr(e)) return e.map((e) => Pr(e, t));
	if (!Mr(e)) return e;
	let n = Object.getOwnPropertyNames(e), r = Object.getOwnPropertySymbols(e);
	return [...n, ...r].reduce((n, r) => {
		if (jr(t.props) && !t.props.includes(r)) return n;
		let i = e[r];
		return Nr(n, r, Pr(i, t), e, t.nonenumerable), n;
	}, {});
}
var H = class {
	constructor({ dedupe: e = !1 } = {}) {
		this.classRegistry = new Nn(), this.symbolRegistry = new Mn((e) => e.description ?? ""), this.customTransformerRegistry = new Rn(), this.allowedErrorProps = [], this.dedupe = e;
	}
	serialize(e) {
		let t = /* @__PURE__ */ new Map(), n = kr(e, t, this, this.dedupe), r = { json: n.transformedValue };
		n.annotations && (r.meta = {
			...r.meta,
			values: n.annotations
		});
		let i = Or(t, this.dedupe);
		return i && (r.meta = {
			...r.meta,
			referentialEqualities: i
		}), r;
	}
	deserialize(e) {
		let { json: t, meta: n } = e, r = Pr(t);
		return n?.values && (r = wr(r, n.values, this)), n?.referentialEqualities && (r = Tr(r, n.referentialEqualities)), r;
	}
	stringify(e) {
		return JSON.stringify(this.serialize(e));
	}
	parse(e) {
		return this.deserialize(JSON.parse(e));
	}
	registerClass(e, t) {
		this.classRegistry.register(e, t);
	}
	registerSymbol(e, t) {
		this.symbolRegistry.register(e, t);
	}
	registerCustom(e, t) {
		this.customTransformerRegistry.register({
			name: t,
			...e
		});
	}
	allowErrorProps(...e) {
		this.allowedErrorProps.push(...e);
	}
};
H.defaultInstance = new H(), H.serialize = H.defaultInstance.serialize.bind(H.defaultInstance), H.deserialize = H.defaultInstance.deserialize.bind(H.defaultInstance), H.stringify = H.defaultInstance.stringify.bind(H.defaultInstance), H.parse = H.defaultInstance.parse.bind(H.defaultInstance), H.registerClass = H.defaultInstance.registerClass.bind(H.defaultInstance), H.registerSymbol = H.defaultInstance.registerSymbol.bind(H.defaultInstance), H.registerCustom = H.defaultInstance.registerCustom.bind(H.defaultInstance), H.allowErrorProps = H.defaultInstance.allowErrorProps.bind(H.defaultInstance), H.serialize, H.deserialize, H.stringify, H.parse, H.registerClass, H.registerCustom, H.registerSymbol, H.allowErrorProps, A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A(), A();
var Fr;
(Fr = E).__VUE_DEVTOOLS_KIT_MESSAGE_CHANNELS__ ?? (Fr.__VUE_DEVTOOLS_KIT_MESSAGE_CHANNELS__ = []);
var Ir;
(Ir = E).__VUE_DEVTOOLS_KIT_RPC_CLIENT__ ?? (Ir.__VUE_DEVTOOLS_KIT_RPC_CLIENT__ = null);
var Lr;
(Lr = E).__VUE_DEVTOOLS_KIT_RPC_SERVER__ ?? (Lr.__VUE_DEVTOOLS_KIT_RPC_SERVER__ = null);
var Rr;
(Rr = E).__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ ?? (Rr.__VUE_DEVTOOLS_KIT_VITE_RPC_CLIENT__ = null);
var zr;
(zr = E).__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__ ?? (zr.__VUE_DEVTOOLS_KIT_VITE_RPC_SERVER__ = null);
var Br;
(Br = E).__VUE_DEVTOOLS_KIT_BROADCAST_RPC_SERVER__ ?? (Br.__VUE_DEVTOOLS_KIT_BROADCAST_RPC_SERVER__ = null), A(), A(), A(), A(), A(), A(), A();
//#endregion
//#region node_modules/pinia/dist/pinia.mjs
var U = typeof window < "u", Vr, Hr = (e) => Vr = e, Ur = () => i() && a(Wr) || Vr, Wr = Symbol();
function Gr(e) {
	return e && typeof e == "object" && Object.prototype.toString.call(e) === "[object Object]" && typeof e.toJSON != "function";
}
var W;
(function(e) {
	e.direct = "direct", e.patchObject = "patch object", e.patchFunction = "patch function";
})(W ||= {});
var Kr = typeof window == "object" && window.window === window ? window : typeof self == "object" && self.self === self ? self : typeof window == "object" && window.global === window ? window : typeof globalThis == "object" ? globalThis : { HTMLElement: null };
function qr(e, { autoBom: t = !1 } = {}) {
	return t && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type) ? new Blob(["﻿", e], { type: e.type }) : e;
}
function Jr(e, t, n) {
	let r = new XMLHttpRequest();
	r.open("GET", e), r.responseType = "blob", r.onload = function() {
		$r(r.response, t, n);
	}, r.onerror = function() {
		console.error("could not download file");
	}, r.send();
}
function Yr(e) {
	let t = new XMLHttpRequest();
	t.open("HEAD", e, !1);
	try {
		t.send();
	} catch {}
	return t.status >= 200 && t.status <= 299;
}
function Xr(e) {
	try {
		e.dispatchEvent(new MouseEvent("click"));
	} catch {
		let t = new MouseEvent("click", {
			bubbles: !0,
			cancelable: !0,
			view: window,
			detail: 0,
			screenX: 80,
			screenY: 20,
			clientX: 80,
			clientY: 20,
			ctrlKey: !1,
			altKey: !1,
			shiftKey: !1,
			metaKey: !1,
			button: 0,
			relatedTarget: null
		});
		e.dispatchEvent(t);
	}
}
var Zr = typeof navigator == "object" ? navigator : { userAgent: "" }, Qr = /Macintosh/.test(Zr.userAgent) && /AppleWebKit/.test(Zr.userAgent) && !/Safari/.test(Zr.userAgent), $r = U ? typeof HTMLAnchorElement < "u" && "download" in HTMLAnchorElement.prototype && !Qr ? ei : "msSaveOrOpenBlob" in Zr ? ti : ni : () => {};
function ei(e, t = "download", n) {
	let r = document.createElement("a");
	r.download = t, r.rel = "noopener", typeof e == "string" ? (r.href = e, r.origin === location.origin ? Xr(r) : Yr(r.href) ? Jr(e, t, n) : (r.target = "_blank", Xr(r))) : (r.href = URL.createObjectURL(e), setTimeout(function() {
		URL.revokeObjectURL(r.href);
	}, 4e4), setTimeout(function() {
		Xr(r);
	}, 0));
}
function ti(e, t = "download", n) {
	if (typeof e == "string") if (Yr(e)) Jr(e, t, n);
	else {
		let t = document.createElement("a");
		t.href = e, t.target = "_blank", setTimeout(function() {
			Xr(t);
		});
	}
	else navigator.msSaveOrOpenBlob(qr(e, n), t);
}
function ni(e, t, n, r) {
	if (r ||= open("", "_blank"), r && (r.document.title = r.document.body.innerText = "downloading..."), typeof e == "string") return Jr(e, t, n);
	let i = e.type === "application/octet-stream", a = /constructor/i.test(String(Kr.HTMLElement)) || "safari" in Kr, o = /CriOS\/[\d]+/.test(navigator.userAgent);
	if ((o || i && a || Qr) && typeof FileReader < "u") {
		let t = new FileReader();
		t.onloadend = function() {
			let e = t.result;
			if (typeof e != "string") throw r = null, Error("Wrong reader.result type");
			e = o ? e : e.replace(/^data:[^;]*;/, "data:attachment/file;"), r ? r.location.href = e : location.assign(e), r = null;
		}, t.readAsDataURL(e);
	} else {
		let t = URL.createObjectURL(e);
		r ? r.location.assign(t) : location.href = t, r = null, setTimeout(function() {
			URL.revokeObjectURL(t);
		}, 4e4);
	}
}
function G(e, t) {
	let n = "🍍 " + e;
	typeof __VUE_DEVTOOLS_TOAST__ == "function" ? __VUE_DEVTOOLS_TOAST__(n, t) : t === "error" ? console.error(n) : t === "warn" ? console.warn(n) : console.log(n);
}
function ri(e) {
	return "_a" in e && "install" in e;
}
function ii() {
	if (!("clipboard" in navigator)) return G("Your browser doesn't support the Clipboard API", "error"), !0;
}
function ai(e) {
	return e instanceof Error && e.message.toLowerCase().includes("document is not focused") ? (G("You need to activate the \"Emulate a focused page\" setting in the \"Rendering\" panel of devtools.", "warn"), !0) : !1;
}
async function oi(e) {
	if (!ii()) try {
		await navigator.clipboard.writeText(JSON.stringify(e.state.value)), G("Global state copied to clipboard.");
	} catch (e) {
		if (ai(e)) return;
		G("Failed to serialize the state. Check the console for more details.", "error"), console.error(e);
	}
}
async function si(e) {
	if (!ii()) try {
		di(e, JSON.parse(await navigator.clipboard.readText())), G("Global state pasted from clipboard.");
	} catch (e) {
		if (ai(e)) return;
		G("Failed to deserialize the state from clipboard. Check the console for more details.", "error"), console.error(e);
	}
}
async function ci(e) {
	try {
		$r(new Blob([JSON.stringify(e.state.value)], { type: "text/plain;charset=utf-8" }), "pinia-state.json");
	} catch (e) {
		G("Failed to export the state as JSON. Check the console for more details.", "error"), console.error(e);
	}
}
var K;
function li() {
	K || (K = document.createElement("input"), K.type = "file", K.accept = ".json");
	function e() {
		return new Promise((e, t) => {
			K.onchange = async () => {
				let t = K.files;
				if (!t) return e(null);
				let n = t.item(0);
				return e(n ? {
					text: await n.text(),
					file: n
				} : null);
			}, K.oncancel = () => e(null), K.onerror = t, K.click();
		});
	}
	return e;
}
async function ui(e) {
	try {
		let t = await li()();
		if (!t) return;
		let { text: n, file: r } = t;
		di(e, JSON.parse(n)), G(`Global state imported from "${r.name}".`);
	} catch (e) {
		G("Failed to import the state from JSON. Check the console for more details.", "error"), console.error(e);
	}
}
function di(e, t) {
	for (let n in t) {
		let r = e.state.value[n];
		r ? Object.assign(r, t[n]) : e.state.value[n] = t[n];
	}
}
function q(e) {
	return { _custom: { display: e } };
}
var fi = "🍍 Pinia (root)", pi = "_root";
function mi(e) {
	return ri(e) ? {
		id: pi,
		label: fi
	} : {
		id: e.$id,
		label: e.$id
	};
}
function hi(e) {
	if (ri(e)) {
		let t = Array.from(e._s.keys()), n = e._s;
		return {
			state: t.map((t) => ({
				editable: !0,
				key: t,
				value: e.state.value[t]
			})),
			getters: t.filter((e) => n.get(e)._getters).map((e) => {
				let t = n.get(e);
				return {
					editable: !1,
					key: e,
					value: t._getters.reduce((e, n) => (e[n] = t[n], e), {})
				};
			})
		};
	}
	let t = { state: Object.keys(e.$state).map((t) => ({
		editable: !0,
		key: t,
		value: e.$state[t]
	})) };
	return e._getters && e._getters.length && (t.getters = e._getters.map((t) => ({
		editable: !1,
		key: t,
		value: e[t]
	}))), e._customProperties.size && (t.customProperties = Array.from(e._customProperties).map((t) => ({
		editable: !0,
		key: t,
		value: e[t]
	}))), t;
}
function gi(e) {
	return e ? Array.isArray(e) ? e.reduce((e, t) => (e.keys.push(t.key), e.operations.push(t.type), e.oldValue[t.key] = t.oldValue, e.newValue[t.key] = t.newValue, e), {
		oldValue: {},
		keys: [],
		operations: [],
		newValue: {}
	}) : {
		operation: q(e.type),
		key: q(e.key),
		oldValue: e.oldValue,
		newValue: e.newValue
	} : {};
}
function _i(e) {
	switch (e) {
		case W.direct: return "mutation";
		case W.patchFunction: return "$patch";
		case W.patchObject: return "$patch";
		default: return "unknown";
	}
}
var J = !0, vi = [], Y = "pinia:mutations", X = "pinia", { assign: yi } = Object, bi = (e) => "🍍 " + e;
function xi(e, n) {
	fn({
		id: "dev.esm.pinia",
		label: "Pinia 🍍",
		logo: "https://pinia.vuejs.org/logo.svg",
		packageName: "pinia",
		homepage: "https://pinia.vuejs.org",
		componentStateTypes: vi,
		app: e
	}, (r) => {
		typeof r.now != "function" && G("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html."), r.addTimelineLayer({
			id: Y,
			label: "Pinia 🍍",
			color: 15064968
		}), r.addInspector({
			id: X,
			label: "Pinia 🍍",
			icon: "storage",
			treeFilterPlaceholder: "Search stores",
			actions: [
				{
					icon: "content_copy",
					action: () => {
						oi(n);
					},
					tooltip: "Serialize and copy the state"
				},
				{
					icon: "content_paste",
					action: async () => {
						await si(n), r.sendInspectorTree(X), r.sendInspectorState(X);
					},
					tooltip: "Replace the state with the content of your clipboard"
				},
				{
					icon: "save",
					action: () => {
						ci(n);
					},
					tooltip: "Save the state as a JSON file"
				},
				{
					icon: "folder_open",
					action: async () => {
						await ui(n), r.sendInspectorTree(X), r.sendInspectorState(X);
					},
					tooltip: "Import the state from a JSON file"
				}
			],
			nodeActions: [{
				icon: "restore",
				tooltip: "Reset the state (with \"$reset\")",
				action: (e) => {
					let t = n._s.get(e);
					t ? typeof t.$reset == "function" ? (t.$reset(), G(`Store "${e}" reset.`)) : G(`Cannot reset "${e}" store because it doesn't have a "$reset" method implemented.`, "warn") : G(`Cannot reset "${e}" store because it wasn't found.`, "warn");
				}
			}]
		}), r.on.inspectComponent((e) => {
			let n = e.componentInstance && e.componentInstance.proxy;
			if (n && n._pStores) {
				let n = e.componentInstance.proxy._pStores;
				Object.values(n).forEach((n) => {
					e.instanceData.state.push({
						type: bi(n.$id),
						key: "state",
						editable: !0,
						value: n._isOptionsAPI ? { _custom: {
							value: t(n.$state),
							actions: [{
								icon: "restore",
								tooltip: "Reset the state of this store",
								action: () => n.$reset()
							}]
						} } : Object.keys(n.$state).reduce((e, t) => (e[t] = n.$state[t], e), {})
					}), n._getters && n._getters.length && e.instanceData.state.push({
						type: bi(n.$id),
						key: "getters",
						editable: !1,
						value: n._getters.reduce((e, t) => {
							try {
								e[t] = n[t];
							} catch (n) {
								e[t] = n;
							}
							return e;
						}, {})
					});
				});
			}
		}), r.on.getInspectorTree((t) => {
			if (t.app === e && t.inspectorId === X) {
				let e = [n];
				e = e.concat(Array.from(n._s.values())), t.rootNodes = (t.filter ? e.filter((e) => "$id" in e ? e.$id.toLowerCase().includes(t.filter.toLowerCase()) : fi.toLowerCase().includes(t.filter.toLowerCase())) : e).map(mi);
			}
		}), globalThis.$pinia = n, r.on.getInspectorState((r) => {
			if (r.app === e && r.inspectorId === X) {
				let e = r.nodeId === pi ? n : n._s.get(r.nodeId);
				if (!e) return;
				e && (r.nodeId !== pi && (globalThis.$store = t(e)), r.state = hi(e));
			}
		}), r.on.editInspectorState((t) => {
			if (t.app === e && t.inspectorId === X) {
				let e = t.nodeId === pi ? n : n._s.get(t.nodeId);
				if (!e) return G(`store "${t.nodeId}" not found`, "error");
				let { path: r } = t;
				ri(e) ? r.unshift("state") : (r.length !== 1 || !e._customProperties.has(r[0]) || r[0] in e.$state) && r.unshift("$state"), J = !1, t.set(e, r, t.state.value), J = !0;
			}
		}), r.on.editComponentState((e) => {
			if (e.type.startsWith("🍍")) {
				let t = e.type.replace(/^🍍\s*/, ""), r = n._s.get(t);
				if (!r) return G(`store "${t}" not found`, "error");
				let { path: i } = e;
				if (i[0] !== "state") return G(`Invalid path for store "${t}":\n${i}\nOnly state can be modified.`);
				i[0] = "$state", J = !1, e.set(r, i, e.state.value), J = !0;
			}
		});
	});
}
function Si(e, t) {
	vi.includes(bi(t.$id)) || vi.push(bi(t.$id)), fn({
		id: "dev.esm.pinia",
		label: "Pinia 🍍",
		logo: "https://pinia.vuejs.org/logo.svg",
		packageName: "pinia",
		homepage: "https://pinia.vuejs.org",
		componentStateTypes: vi,
		app: e,
		settings: { logStoreChanges: {
			label: "Notify about new/deleted stores",
			type: "boolean",
			defaultValue: !0
		} }
	}, (e) => {
		let r = typeof e.now == "function" ? e.now.bind(e) : Date.now;
		t.$onAction(({ after: n, onError: i, name: a, args: o }) => {
			let s = Ci++;
			e.addTimelineEvent({
				layerId: Y,
				event: {
					time: r(),
					title: "🛫 " + a,
					subtitle: "start",
					data: {
						store: q(t.$id),
						action: q(a),
						args: o
					},
					groupId: s
				}
			}), n((n) => {
				Z = void 0, e.addTimelineEvent({
					layerId: Y,
					event: {
						time: r(),
						title: "🛬 " + a,
						subtitle: "end",
						data: {
							store: q(t.$id),
							action: q(a),
							args: o,
							result: n
						},
						groupId: s
					}
				});
			}), i((n) => {
				Z = void 0, e.addTimelineEvent({
					layerId: Y,
					event: {
						time: r(),
						logType: "error",
						title: "💥 " + a,
						subtitle: "end",
						data: {
							store: q(t.$id),
							action: q(a),
							args: o,
							error: n
						},
						groupId: s
					}
				});
			});
		}, !0), t._customProperties.forEach((i) => {
			n(() => u(t[i]), (t, n) => {
				e.notifyComponentUpdate(), e.sendInspectorState(X), J && e.addTimelineEvent({
					layerId: Y,
					event: {
						time: r(),
						title: "Change",
						subtitle: i,
						data: {
							newValue: t,
							oldValue: n
						},
						groupId: Z
					}
				});
			}, { deep: !0 });
		}), t.$subscribe(({ events: n, type: i }, a) => {
			if (e.notifyComponentUpdate(), e.sendInspectorState(X), !J) return;
			let o = {
				time: r(),
				title: _i(i),
				data: yi({ store: q(t.$id) }, gi(n)),
				groupId: Z
			};
			i === W.patchFunction ? o.subtitle = "⤵️" : i === W.patchObject ? o.subtitle = "🧩" : n && !Array.isArray(n) && (o.subtitle = n.type), n && (o.data["rawEvent(s)"] = { _custom: {
				display: "DebuggerEvent",
				type: "object",
				tooltip: "raw DebuggerEvent[]",
				value: n
			} }), e.addTimelineEvent({
				layerId: Y,
				event: o
			});
		}, {
			detached: !0,
			flush: "sync"
		});
		let i = t._hotUpdate;
		t._hotUpdate = l((n) => {
			i(n), e.addTimelineEvent({
				layerId: Y,
				event: {
					time: r(),
					title: "🔥 " + t.$id,
					subtitle: "HMR update",
					data: {
						store: q(t.$id),
						info: q("HMR update")
					}
				}
			}), e.notifyComponentUpdate(), e.sendInspectorTree(X), e.sendInspectorState(X);
		});
		let { $dispose: a } = t;
		t.$dispose = () => {
			a(), e.notifyComponentUpdate(), e.sendInspectorTree(X), e.sendInspectorState(X), e.getSettings().logStoreChanges && G(`Disposed "${t.$id}" store 🗑`);
		}, e.notifyComponentUpdate(), e.sendInspectorTree(X), e.sendInspectorState(X), e.getSettings().logStoreChanges && G(`"${t.$id}" store installed 🆕`);
	});
}
var Ci = 0, Z;
function wi(e, n, r) {
	let i = n.reduce((n, r) => (n[r] = t(e)[r], n), {});
	for (let t in i) e[t] = function() {
		let n = Ci, a = r ? new Proxy(e, {
			get(...e) {
				return Z = n, Reflect.get(...e);
			},
			set(...e) {
				return Z = n, Reflect.set(...e);
			}
		}) : e;
		Z = n;
		let o = i[t].apply(a, arguments);
		return Z = void 0, o;
	};
}
function Ti({ app: e, store: n, options: r }) {
	if (!n.$id.startsWith("__hot:")) {
		if (n._isOptionsAPI = !!r.state, !n._p._testing) {
			wi(n, Object.keys(r.actions), n._isOptionsAPI);
			let e = n._hotUpdate;
			t(n)._hotUpdate = function(t) {
				e.apply(this, arguments), wi(n, Object.keys(t._hmrPayload.actions), !!n._isOptionsAPI);
			};
		}
		Si(e, n);
	}
}
function Ei() {
	let e = ee(!0), t = e.run(() => te({})), n = [], r = [], i = l({
		install(e) {
			Hr(i), i._a = e, e.provide(Wr, i), e.config.globalProperties.$pinia = i, typeof __VUE_PROD_DEVTOOLS__ < "u" && __VUE_PROD_DEVTOOLS__ && U && xi(e, i), r.forEach((e) => n.push(e)), r = [];
		},
		use(e) {
			return this._a ? n.push(e) : r.push(e), this;
		},
		_p: n,
		_a: null,
		_e: e,
		_s: /* @__PURE__ */ new Map(),
		state: t
	});
	return typeof __VUE_PROD_DEVTOOLS__ < "u" && __VUE_PROD_DEVTOOLS__ && U && typeof Proxy < "u" && i.use(Ti), i;
}
function Di(e) {
	e._e.stop(), e._s.clear(), e._p.splice(0), e.state.value = {}, e._a = null;
}
function Oi(e, t) {
	return () => {};
}
var ki = () => {};
function Ai(e, t, n, r = ki) {
	e.add(t);
	let i = () => {
		e.delete(t) && r();
	};
	return !n && o() && c(i), i;
}
function Q(e, ...t) {
	e.forEach((e) => {
		e(...t);
	});
}
var ji = (e) => e(), Mi = Symbol(), Ni = Symbol();
function Pi(e, t) {
	e instanceof Map && t instanceof Map ? t.forEach((t, n) => e.set(n, t)) : e instanceof Set && t instanceof Set && t.forEach(e.add, e);
	for (let n in t) {
		if (!t.hasOwnProperty(n)) continue;
		let r = t[n], i = e[n];
		Gr(i) && Gr(r) && e.hasOwnProperty(n) && !d(r) && !s(r) ? e[n] = Pi(i, r) : e[n] = r;
	}
	return e;
}
var Fi = Symbol();
function Ii(e) {
	return Object.defineProperty(e, Fi, {});
}
function Li(e) {
	return !Gr(e) || !Object.prototype.hasOwnProperty.call(e, Fi);
}
var { assign: $ } = Object;
function Ri(e) {
	return !!(d(e) && e.effect);
}
function zi(e, t, n, i) {
	let { state: a, actions: o, getters: s } = t, c = n.state.value[e], u;
	function d() {
		return c || (n.state.value[e] = a ? a() : {}), $(r(n.state.value[e]), o, Object.keys(s || {}).reduce((t, r) => (t[r] = l(p(() => {
			Hr(n);
			let t = n._s.get(e);
			return s[r].call(t, t);
		})), t), {}));
	}
	return u = Bi(e, d, t, n, i, !0), u;
}
function Bi(e, r, i = {}, a, o, c) {
	let u, p = $({ actions: {} }, i), ne = { deep: !0 }, h, g, _ = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set(), y = a.state.value[e];
	!c && !y && (a.state.value[e] = {});
	let b = te({}), x;
	function re(t) {
		let n;
		h = g = !1, typeof t == "function" ? (t(a.state.value[e]), n = {
			type: W.patchFunction,
			storeId: e,
			events: void 0
		}) : (Pi(a.state.value[e], t), n = {
			type: W.patchObject,
			payload: t,
			storeId: e,
			events: void 0
		});
		let r = x = Symbol();
		f().then(() => {
			x === r && (h = !0);
		}), g = !0, Q(_, n, a.state.value[e]);
	}
	let S = c ? function() {
		let { state: e } = i, t = e ? e() : {};
		this.$patch((e) => {
			$(e, t);
		});
	} : ki;
	function C() {
		u.stop(), _.clear(), v.clear(), a._s.delete(e);
	}
	let w = (t, n = "") => {
		if (Mi in t) return t[Ni] = n, t;
		let r = function() {
			Hr(a);
			let n = Array.from(arguments), i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set();
			function s(e) {
				i.add(e);
			}
			function c(e) {
				o.add(e);
			}
			Q(v, {
				args: n,
				name: r[Ni],
				store: D,
				after: s,
				onError: c
			});
			let l;
			try {
				l = t.apply(this && this.$id === e ? this : D, n);
			} catch (e) {
				throw Q(o, e), e;
			}
			return l instanceof Promise ? l.then((e) => (Q(i, e), e)).catch((e) => (Q(o, e), Promise.reject(e))) : (Q(i, l), l);
		};
		return r[Mi] = !0, r[Ni] = n, r;
	}, T = /*#__PURE__*/ l({
		actions: {},
		getters: {},
		state: [],
		hotState: b
	}), E = {
		_p: a,
		$id: e,
		$onAction: Ai.bind(null, v),
		$patch: re,
		$reset: S,
		$subscribe(t, r = {}) {
			let i = Ai(_, t, r.detached, () => o()), o = u.run(() => n(() => a.state.value[e], (n) => {
				(r.flush === "sync" ? g : h) && t({
					storeId: e,
					type: W.direct,
					events: void 0
				}, n);
			}, $({}, ne, r)));
			return i;
		},
		$dispose: C
	}, D = m(typeof __VUE_PROD_DEVTOOLS__ < "u" && __VUE_PROD_DEVTOOLS__ && U ? $({
		_hmrPayload: T,
		_customProperties: l(/* @__PURE__ */ new Set())
	}, E) : E);
	a._s.set(e, D);
	let O = (a._a && a._a.runWithContext || ji)(() => a._e.run(() => (u = ee()).run(() => r({ action: w }))));
	for (let t in O) {
		let n = O[t];
		d(n) && !Ri(n) || s(n) ? c || (y && Li(n) && (d(n) ? n.value = y[t] : Pi(n, y[t])), a.state.value[e][t] = n) : typeof n == "function" && (O[t] = w(n, t), p.actions[t] = n);
	}
	if ($(D, O), $(t(D), O), Object.defineProperty(D, "$state", {
		get: () => a.state.value[e],
		set: (e) => {
			re((t) => {
				$(t, e);
			});
		}
	}), typeof __VUE_PROD_DEVTOOLS__ < "u" && __VUE_PROD_DEVTOOLS__ && U) {
		let e = {
			writable: !0,
			configurable: !0,
			enumerable: !1
		};
		[
			"_p",
			"_hmrPayload",
			"_getters",
			"_customProperties"
		].forEach((t) => {
			Object.defineProperty(D, t, $({ value: D[t] }, e));
		});
	}
	return a._p.forEach((e) => {
		/* istanbul ignore else */
		if (typeof __VUE_PROD_DEVTOOLS__ < "u" && __VUE_PROD_DEVTOOLS__ && U) {
			let t = u.run(() => e({
				store: D,
				app: a._a,
				pinia: a,
				options: p
			}));
			Object.keys(t || {}).forEach((e) => D._customProperties.add(e)), $(D, t);
		} else $(D, u.run(() => e({
			store: D,
			app: a._a,
			pinia: a,
			options: p
		})));
	}), y && c && i.hydrate && i.hydrate(D.$state, y), h = !0, g = !0, D;
}
function Vi(e, t, n) {
	let r, o = typeof t == "function";
	r = o ? n : t;
	function s(n, s) {
		let c = i();
		return n ||= c ? a(Wr, null) : null, n && Hr(n), n = Vr, n._s.has(e) || (o ? Bi(e, t, r, n) : zi(e, r, n)), n._s.get(e);
	}
	return s.$id = e, s;
}
var Hi = "Store";
function Ui(e) {
	Hi = e;
}
function Wi(...e) {
	return e.reduce((e, t) => (e[t.$id + Hi] = function() {
		return t(this.$pinia);
	}, e), {});
}
function Gi(e, t) {
	return Array.isArray(t) ? t.reduce((t, n) => (t[n] = function() {
		return e(this.$pinia)[n];
	}, t), {}) : Object.keys(t).reduce((n, r) => (n[r] = function() {
		let n = e(this.$pinia), i = t[r];
		return typeof i == "function" ? i.call(this, n) : n[i];
	}, n), {});
}
var Ki = Gi;
function qi(e, t) {
	return Array.isArray(t) ? t.reduce((t, n) => (t[n] = function(...t) {
		return e(this.$pinia)[n](...t);
	}, t), {}) : Object.keys(t).reduce((n, r) => (n[r] = function(...n) {
		return e(this.$pinia)[t[r]](...n);
	}, n), {});
}
function Ji(e, t) {
	return Array.isArray(t) ? t.reduce((t, n) => (t[n] = {
		get() {
			return e(this.$pinia)[n];
		},
		set(t) {
			return e(this.$pinia)[n] = t;
		}
	}, t), {}) : Object.keys(t).reduce((n, r) => (n[r] = {
		get() {
			return e(this.$pinia)[t[r]];
		},
		set(n) {
			return e(this.$pinia)[t[r]] = n;
		}
	}, n), {});
}
function Yi(n) {
	let r = t(n), i = {};
	for (let t in r) {
		let a = r[t];
		a.effect ? i[t] = p({
			get: () => n[t],
			set(e) {
				n[t] = e;
			}
		}) : (d(a) || s(a)) && (i[t] = e(n, t));
	}
	return i;
}
//#endregion
export { W as MutationType, Oi as acceptHMRUpdate, Ei as createPinia, Vi as defineStore, Di as disposePinia, Ur as getActivePinia, qi as mapActions, Ki as mapGetters, Gi as mapState, Wi as mapStores, Ji as mapWritableState, Hr as setActivePinia, Ui as setMapStoreSuffix, Li as shouldHydrate, Ii as skipHydrate, Yi as storeToRefs };
