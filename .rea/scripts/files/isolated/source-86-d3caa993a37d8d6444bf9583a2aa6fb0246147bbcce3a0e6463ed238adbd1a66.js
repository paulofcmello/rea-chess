//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = Object.prototype.toString;
function r(e) {
	switch (n.call(e)) {
		case "[object Error]":
		case "[object Exception]":
		case "[object DOMException]": return !0;
		default: return v(e, Error);
	}
}
function i(e, t) {
	return n.call(e) === `[object ${t}]`;
}
function a(e) {
	return i(e, "ErrorEvent");
}
function o(e) {
	return i(e, "DOMError");
}
function s(e) {
	return i(e, "DOMException");
}
function c(e) {
	return i(e, "String");
}
function l(e) {
	return typeof e == "object" && !!e && "__sentry_template_string__" in e && "__sentry_template_values__" in e;
}
function u(e) {
	return e === null || l(e) || typeof e != "object" && typeof e != "function";
}
function d(e) {
	return i(e, "Object");
}
function f(e) {
	return typeof Event < "u" && v(e, Event);
}
function p(e) {
	return typeof Element < "u" && v(e, Element);
}
function m(e) {
	return i(e, "RegExp");
}
function h(e) {
	return !!(e && e.then && typeof e.then == "function");
}
function g(e) {
	return d(e) && "nativeEvent" in e && "preventDefault" in e && "stopPropagation" in e;
}
function _(e) {
	return typeof e == "number" && e !== e;
}
function v(e, t) {
	try {
		return e instanceof t;
	} catch {
		return !1;
	}
}
function y(e) {
	return !!(typeof e == "object" && e && (e.__isVue || e._isVue));
}
//#endregion
//#region node_modules/@sentry/utils/esm/string.js
function b(e, t = 0) {
	return typeof e != "string" || t === 0 || e.length <= t ? e : `${e.slice(0, t)}...`;
}
function x(e, t) {
	let n = e, r = n.length;
	if (r <= 150) return n;
	t > r && (t = r);
	let i = Math.max(t - 60, 0);
	i < 5 && (i = 0);
	let a = Math.min(i + 140, r);
	return a > r - 5 && (a = r), a === r && (i = Math.max(a - 140, 0)), n = n.slice(i, a), i > 0 && (n = `'{snip} ${n}`), a < r && (n += " {snip}"), n;
}
function S(e, t) {
	if (!Array.isArray(e)) return "";
	let n = [];
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		try {
			y(r) ? n.push("[VueViewModel]") : n.push(String(r));
		} catch {
			n.push("[value cannot be serialized]");
		}
	}
	return n.join(t);
}
function C(e, t, n = !1) {
	return c(e) ? m(t) ? t.test(e) : c(t) ? n ? e === t : e.includes(t) : !1 : !1;
}
function w(e, t = [], n = !1) {
	return t.some((t) => C(e, t, n));
}
//#endregion
//#region node_modules/@sentry/utils/esm/aggregate-errors.js
function ee(e, t, n = 250, r, i, a, o) {
	if (!a.exception || !a.exception.values || !o || !v(o.originalException, Error)) return;
	let s = a.exception.values.length > 0 ? a.exception.values[a.exception.values.length - 1] : void 0;
	s && (a.exception.values = ie(te(e, t, i, o.originalException, r, a.exception.values, s, 0), n));
}
function te(e, t, n, r, i, a, o, s) {
	if (a.length >= n + 1) return a;
	let c = [...a];
	if (v(r[i], Error)) {
		ne(o, s);
		let a = e(t, r[i]), l = c.length;
		re(a, i, l, s), c = te(e, t, n, r[i], i, [a, ...c], a, l);
	}
	return Array.isArray(r.errors) && r.errors.forEach((r, a) => {
		if (v(r, Error)) {
			ne(o, s);
			let l = e(t, r), u = c.length;
			re(l, `errors[${a}]`, u, s), c = te(e, t, n, r, i, [l, ...c], l, u);
		}
	}), c;
}
function ne(e, t) {
	e.mechanism = e.mechanism || {
		type: "generic",
		handled: !0
	}, e.mechanism = {
		...e.mechanism,
		...e.type === "AggregateError" && { is_exception_group: !0 },
		exception_id: t
	};
}
function re(e, t, n, r) {
	e.mechanism = e.mechanism || {
		type: "generic",
		handled: !0
	}, e.mechanism = {
		...e.mechanism,
		type: "chained",
		source: t,
		exception_id: n,
		parent_id: r
	};
}
function ie(e, t) {
	return e.map((e) => (e.value &&= b(e.value, t), e));
}
//#endregion
//#region node_modules/@sentry/utils/esm/worldwide.js
function ae(e) {
	return e && e.Math == Math ? e : void 0;
}
var T = typeof globalThis == "object" && ae(globalThis) || typeof window == "object" && ae(window) || typeof self == "object" && ae(self) || typeof window == "object" && ae(window) || (function() {
	return this;
})() || {};
function E() {
	return T;
}
function oe(e, t, n) {
	let r = n || T, i = r.__SENTRY__ = r.__SENTRY__ || {};
	return i[e] || (i[e] = t());
}
//#endregion
//#region node_modules/@sentry/utils/esm/browser.js
var se = E(), ce = 80;
function le(e, t = {}) {
	if (!e) return "<unknown>";
	try {
		let n = e, r = [], i = 0, a = 0, o, s = Array.isArray(t) ? t : t.keyAttrs, c = !Array.isArray(t) && t.maxStringLength || ce;
		for (; n && i++ < 5 && (o = ue(n, s), !(o === "html" || i > 1 && a + r.length * 3 + o.length >= c));) r.push(o), a += o.length, n = n.parentNode;
		return r.reverse().join(" > ");
	} catch {
		return "<unknown>";
	}
}
function ue(e, t) {
	let n = e, r = [], i, a, o, s, l;
	if (!n || !n.tagName) return "";
	if (se.HTMLElement && n instanceof HTMLElement && n.dataset && n.dataset.sentryComponent) return n.dataset.sentryComponent;
	r.push(n.tagName.toLowerCase());
	let u = t && t.length ? t.filter((e) => n.getAttribute(e)).map((e) => [e, n.getAttribute(e)]) : null;
	if (u && u.length) u.forEach((e) => {
		r.push(`[${e[0]}="${e[1]}"]`);
	});
	else if (n.id && r.push(`#${n.id}`), i = n.className, i && c(i)) for (a = i.split(/\s+/), l = 0; l < a.length; l++) r.push(`.${a[l]}`);
	let d = [
		"aria-label",
		"type",
		"name",
		"title",
		"alt"
	];
	for (l = 0; l < d.length; l++) o = d[l], s = n.getAttribute(o), s && r.push(`[${o}="${s}"]`);
	return r.join("");
}
function de() {
	try {
		return se.document.location.href;
	} catch {
		return "";
	}
}
function fe(e) {
	return se.document && se.document.querySelector ? se.document.querySelector(e) : null;
}
function pe(e) {
	if (!se.HTMLElement) return null;
	let t = e;
	for (let e = 0; e < 5; e++) {
		if (!t) return null;
		if (t instanceof HTMLElement && t.dataset.sentryComponent) return t.dataset.sentryComponent;
		t = t.parentNode;
	}
	return null;
}
//#endregion
//#region node_modules/@sentry/utils/esm/debug-build.js
var me = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, he = "Sentry Logger ", ge = [
	"debug",
	"info",
	"warn",
	"error",
	"log",
	"assert",
	"trace"
], _e = {};
function ve(e) {
	if (!("console" in T)) return e();
	let t = T.console, n = {}, r = Object.keys(_e);
	r.forEach((e) => {
		let r = _e[e];
		n[e] = t[e], t[e] = r;
	});
	try {
		return e();
	} finally {
		r.forEach((e) => {
			t[e] = n[e];
		});
	}
}
function ye() {
	let e = !1, t = {
		enable: () => {
			e = !0;
		},
		disable: () => {
			e = !1;
		},
		isEnabled: () => e
	};
	return me ? ge.forEach((n) => {
		t[n] = (...t) => {
			e && ve(() => {
				T.console[n](`${he}[${n}]:`, ...t);
			});
		};
	}) : ge.forEach((e) => {
		t[e] = () => void 0;
	}), t;
}
var D = ye(), be = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function xe(e) {
	return e === "http" || e === "https";
}
function Se(e, t = !1) {
	let { host: n, path: r, pass: i, port: a, projectId: o, protocol: s, publicKey: c } = e;
	return `${s}://${c}${t && i ? `:${i}` : ""}@${n}${a ? `:${a}` : ""}/${r && `${r}/`}${o}`;
}
function Ce(e) {
	let t = be.exec(e);
	if (!t) {
		ve(() => {
			console.error(`Invalid Sentry Dsn: ${e}`);
		});
		return;
	}
	let [n, r, i = "", a, o = "", s] = t.slice(1), c = "", l = s, u = l.split("/");
	if (u.length > 1 && (c = u.slice(0, -1).join("/"), l = u.pop()), l) {
		let e = l.match(/^\d+/);
		e && (l = e[0]);
	}
	return we({
		host: a,
		pass: i,
		path: c,
		projectId: l,
		port: o,
		protocol: n,
		publicKey: r
	});
}
function we(e) {
	return {
		protocol: e.protocol,
		publicKey: e.publicKey || "",
		pass: e.pass || "",
		host: e.host,
		port: e.port || "",
		path: e.path || "",
		projectId: e.projectId
	};
}
function Te(e) {
	if (!me) return !0;
	let { port: t, projectId: n, protocol: r } = e;
	return [
		"protocol",
		"publicKey",
		"host",
		"projectId"
	].find((t) => e[t] ? !1 : (D.error(`Invalid Sentry Dsn: ${t} missing`), !0)) ? !1 : n.match(/^\d+$/) ? xe(r) ? t && isNaN(parseInt(t, 10)) ? (D.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1) : !0 : (D.error(`Invalid Sentry Dsn: Invalid protocol ${r}`), !1) : (D.error(`Invalid Sentry Dsn: Invalid projectId ${n}`), !1);
}
function Ee(e) {
	let t = typeof e == "string" ? Ce(e) : we(e);
	if (!(!t || !Te(t))) return t;
}
//#endregion
//#region node_modules/@sentry/utils/esm/error.js
var De = class extends Error {
	constructor(e, t = "warn") {
		super(e), this.message = e, this.name = new.target.prototype.constructor.name, Object.setPrototypeOf(this, new.target.prototype), this.logLevel = t;
	}
};
//#endregion
//#region node_modules/@sentry/utils/esm/object.js
function O(e, t, n) {
	if (!(t in e)) return;
	let r = e[t], i = n(r);
	typeof i == "function" && ke(i, r), e[t] = i;
}
function Oe(e, t, n) {
	try {
		Object.defineProperty(e, t, {
			value: n,
			writable: !0,
			configurable: !0
		});
	} catch {
		me && D.log(`Failed to add non-enumerable property "${t}" to object`, e);
	}
}
function ke(e, t) {
	try {
		e.prototype = t.prototype = t.prototype || {}, Oe(e, "__sentry_original__", t);
	} catch {}
}
function Ae(e) {
	return e.__sentry_original__;
}
function je(e) {
	return Object.keys(e).map((t) => `${encodeURIComponent(t)}=${encodeURIComponent(e[t])}`).join("&");
}
function Me(e) {
	if (r(e)) return {
		message: e.message,
		name: e.name,
		stack: e.stack,
		...Pe(e)
	};
	if (f(e)) {
		let t = {
			type: e.type,
			target: Ne(e.target),
			currentTarget: Ne(e.currentTarget),
			...Pe(e)
		};
		return typeof CustomEvent < "u" && v(e, CustomEvent) && (t.detail = e.detail), t;
	} else return e;
}
function Ne(e) {
	try {
		return p(e) ? le(e) : Object.prototype.toString.call(e);
	} catch {
		return "<unknown>";
	}
}
function Pe(e) {
	if (typeof e == "object" && e) {
		let t = {};
		for (let n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
		return t;
	} else return {};
}
function Fe(e, t = 40) {
	let n = Object.keys(Me(e));
	if (n.sort(), !n.length) return "[object has no keys]";
	if (n[0].length >= t) return b(n[0], t);
	for (let e = n.length; e > 0; e--) {
		let r = n.slice(0, e).join(", ");
		if (!(r.length > t)) return e === n.length ? r : b(r, t);
	}
	return "";
}
function k(e) {
	return Ie(e, /* @__PURE__ */ new Map());
}
function Ie(e, t) {
	if (Le(e)) {
		let n = t.get(e);
		if (n !== void 0) return n;
		let r = {};
		t.set(e, r);
		for (let n of Object.keys(e)) e[n] !== void 0 && (r[n] = Ie(e[n], t));
		return r;
	}
	if (Array.isArray(e)) {
		let n = t.get(e);
		if (n !== void 0) return n;
		let r = [];
		return t.set(e, r), e.forEach((e) => {
			r.push(Ie(e, t));
		}), r;
	}
	return e;
}
function Le(e) {
	if (!d(e)) return !1;
	try {
		let t = Object.getPrototypeOf(e).constructor.name;
		return !t || t === "Object";
	} catch {
		return !0;
	}
}
//#endregion
//#region node_modules/@sentry/utils/esm/stacktrace.js
var Re = 50, ze = /\(error: (.*)\)/, Be = /captureMessage|captureException/;
function Ve(...e) {
	let t = e.sort((e, t) => e[0] - t[0]).map((e) => e[1]);
	return (e, n = 0) => {
		let r = [], i = e.split("\n");
		for (let e = n; e < i.length; e++) {
			let n = i[e];
			if (n.length > 1024) continue;
			let a = ze.test(n) ? n.replace(ze, "$1") : n;
			if (!a.match(/\S*Error: /)) {
				for (let e of t) {
					let t = e(a);
					if (t) {
						r.push(t);
						break;
					}
				}
				if (r.length >= Re) break;
			}
		}
		return Ue(r);
	};
}
function He(e) {
	return Array.isArray(e) ? Ve(...e) : e;
}
function Ue(e) {
	if (!e.length) return [];
	let t = Array.from(e);
	return /sentryWrapped/.test(t[t.length - 1].function || "") && t.pop(), t.reverse(), Be.test(t[t.length - 1].function || "") && (t.pop(), Be.test(t[t.length - 1].function || "") && t.pop()), t.slice(0, Re).map((e) => ({
		...e,
		filename: e.filename || t[t.length - 1].filename,
		function: e.function || "?"
	}));
}
var We = "<anonymous>";
function Ge(e) {
	try {
		return !e || typeof e != "function" ? We : e.name || We;
	} catch {
		return We;
	}
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/_handlers.js
var Ke = {}, qe = {};
function Je(e, t) {
	Ke[e] = Ke[e] || [], Ke[e].push(t);
}
function Ye(e, t) {
	qe[e] || (t(), qe[e] = !0);
}
function Xe(e, t) {
	let n = e && Ke[e];
	if (n) for (let r of n) try {
		r(t);
	} catch (t) {
		me && D.error(`Error while triggering instrumentation handler.\nType: ${e}\nName: ${Ge(r)}\nError:`, t);
	}
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/console.js
function Ze(e) {
	let t = "console";
	Je(t, e), Ye(t, Qe);
}
function Qe() {
	"console" in T && ge.forEach(function(e) {
		e in T.console && O(T.console, e, function(t) {
			return _e[e] = t, function(...t) {
				Xe("console", {
					args: t,
					level: e
				});
				let n = _e[e];
				n && n.apply(T.console, t);
			};
		});
	});
}
//#endregion
//#region node_modules/@sentry/utils/esm/misc.js
function A() {
	let e = T, t = e.crypto || e.msCrypto, n = () => Math.random() * 16;
	try {
		if (t && t.randomUUID) return t.randomUUID().replace(/-/g, "");
		t && t.getRandomValues && (n = () => {
			let e = /* @__PURE__ */ new Uint8Array(1);
			return t.getRandomValues(e), e[0];
		});
	} catch {}
	return "10000000100040008000100000000000".replace(/[018]/g, (e) => (e ^ (n() & 15) >> e / 4).toString(16));
}
function $e(e) {
	return e.exception && e.exception.values ? e.exception.values[0] : void 0;
}
function et(e) {
	let { message: t, event_id: n } = e;
	if (t) return t;
	let r = $e(e);
	return r ? r.type && r.value ? `${r.type}: ${r.value}` : r.type || r.value || n || "<unknown>" : n || "<unknown>";
}
function tt(e, t, n) {
	let r = e.exception = e.exception || {}, i = r.values = r.values || [], a = i[0] = i[0] || {};
	a.value ||= t || "", a.type ||= n || "Error";
}
function nt(e, t) {
	let n = $e(e);
	if (!n) return;
	let r = {
		type: "generic",
		handled: !0
	}, i = n.mechanism;
	if (n.mechanism = {
		...r,
		...i,
		...t
	}, t && "data" in t) {
		let e = {
			...i && i.data,
			...t.data
		};
		n.mechanism.data = e;
	}
}
function rt(e, t, n = 5) {
	if (t.lineno === void 0) return;
	let r = e.length, i = Math.max(Math.min(r - 1, t.lineno - 1), 0);
	t.pre_context = e.slice(Math.max(0, i - n), i).map((e) => x(e, 0)), t.context_line = x(e[Math.min(r - 1, i)], t.colno || 0), t.post_context = e.slice(Math.min(i + 1, r), i + 1 + n).map((e) => x(e, 0));
}
function it(e) {
	if (e && e.__sentry_captured__) return !0;
	try {
		Oe(e, "__sentry_captured__", !0);
	} catch {}
	return !1;
}
function at(e) {
	return Array.isArray(e) ? e : [e];
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/dom.js
var ot = T, st = 1e3, ct, lt, ut;
function dt(e) {
	Je("dom", e), Ye("dom", ft);
}
function ft() {
	if (!ot.document) return;
	let e = Xe.bind(null, "dom"), t = ht(e, !0);
	ot.document.addEventListener("click", t, !1), ot.document.addEventListener("keypress", t, !1), ["EventTarget", "Node"].forEach((t) => {
		let n = ot[t] && ot[t].prototype;
		!n || !n.hasOwnProperty || !n.hasOwnProperty("addEventListener") || (O(n, "addEventListener", function(t) {
			return function(n, r, i) {
				if (n === "click" || n == "keypress") try {
					let r = this, a = r.__sentry_instrumentation_handlers__ = r.__sentry_instrumentation_handlers__ || {}, o = a[n] = a[n] || { refCount: 0 };
					if (!o.handler) {
						let r = ht(e);
						o.handler = r, t.call(this, n, r, i);
					}
					o.refCount++;
				} catch {}
				return t.call(this, n, r, i);
			};
		}), O(n, "removeEventListener", function(e) {
			return function(t, n, r) {
				if (t === "click" || t == "keypress") try {
					let n = this, i = n.__sentry_instrumentation_handlers__ || {}, a = i[t];
					a && (a.refCount--, a.refCount <= 0 && (e.call(this, t, a.handler, r), a.handler = void 0, delete i[t]), Object.keys(i).length === 0 && delete n.__sentry_instrumentation_handlers__);
				} catch {}
				return e.call(this, t, n, r);
			};
		}));
	});
}
function pt(e) {
	if (e.type !== lt) return !1;
	try {
		if (!e.target || e.target._sentryId !== ut) return !1;
	} catch {}
	return !0;
}
function mt(e, t) {
	return e === "keypress" ? !t || !t.tagName || !(t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) : !1;
}
function ht(e, t = !1) {
	return (n) => {
		if (!n || n._sentryCaptured) return;
		let r = gt(n);
		if (mt(n.type, r)) return;
		Oe(n, "_sentryCaptured", !0), r && !r._sentryId && Oe(r, "_sentryId", A());
		let i = n.type === "keypress" ? "input" : n.type;
		pt(n) || (e({
			event: n,
			name: i,
			global: t
		}), lt = n.type, ut = r ? r._sentryId : void 0), clearTimeout(ct), ct = ot.setTimeout(() => {
			ut = void 0, lt = void 0;
		}, st);
	};
}
function gt(e) {
	try {
		return e.target;
	} catch {
		return null;
	}
}
//#endregion
//#region node_modules/@sentry/utils/esm/supports.js
var _t = E();
function vt() {
	if (!("fetch" in _t)) return !1;
	try {
		return new Headers(), new Request("http://www.example.com"), new Response(), !0;
	} catch {
		return !1;
	}
}
function yt(e) {
	return e && /^function fetch\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString());
}
function bt() {
	if (typeof EdgeRuntime == "string") return !0;
	if (!vt()) return !1;
	if (yt(_t.fetch)) return !0;
	let e = !1, t = _t.document;
	if (t && typeof t.createElement == "function") try {
		let n = t.createElement("iframe");
		n.hidden = !0, t.head.appendChild(n), n.contentWindow && n.contentWindow.fetch && (e = yt(n.contentWindow.fetch)), t.head.removeChild(n);
	} catch (e) {
		me && D.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", e);
	}
	return e;
}
function xt() {
	return "ReportingObserver" in _t;
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/fetch.js
function St(e) {
	let t = "fetch";
	Je(t, e), Ye(t, Ct);
}
function Ct() {
	bt() && O(T, "fetch", function(e) {
		return function(...t) {
			let { method: n, url: r } = Et(t), i = {
				args: t,
				fetchData: {
					method: n,
					url: r
				},
				startTimestamp: Date.now()
			};
			return Xe("fetch", { ...i }), e.apply(T, t).then((e) => (Xe("fetch", {
				...i,
				endTimestamp: Date.now(),
				response: e
			}), e), (e) => {
				throw Xe("fetch", {
					...i,
					endTimestamp: Date.now(),
					error: e
				}), e;
			});
		};
	});
}
function wt(e, t) {
	return !!e && typeof e == "object" && !!e[t];
}
function Tt(e) {
	return typeof e == "string" ? e : e ? wt(e, "url") ? e.url : e.toString ? e.toString() : "" : "";
}
function Et(e) {
	if (e.length === 0) return {
		method: "GET",
		url: ""
	};
	if (e.length === 2) {
		let [t, n] = e;
		return {
			url: Tt(t),
			method: wt(n, "method") ? String(n.method).toUpperCase() : "GET"
		};
	}
	let t = e[0];
	return {
		url: Tt(t),
		method: wt(t, "method") ? String(t.method).toUpperCase() : "GET"
	};
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/globalError.js
var Dt = null;
function Ot(e) {
	let t = "error";
	Je(t, e), Ye(t, kt);
}
function kt() {
	Dt = T.onerror, T.onerror = function(e, t, n, r, i) {
		return Xe("error", {
			column: r,
			error: i,
			line: n,
			msg: e,
			url: t
		}), Dt && !Dt.__SENTRY_LOADER__ ? Dt.apply(this, arguments) : !1;
	}, T.onerror.__SENTRY_INSTRUMENTED__ = !0;
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/globalUnhandledRejection.js
var At = null;
function jt(e) {
	let t = "unhandledrejection";
	Je(t, e), Ye(t, Mt);
}
function Mt() {
	At = T.onunhandledrejection, T.onunhandledrejection = function(e) {
		return Xe("unhandledrejection", e), At && !At.__SENTRY_LOADER__ ? At.apply(this, arguments) : !0;
	}, T.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0;
}
//#endregion
//#region node_modules/@sentry/utils/esm/vendor/supportsHistory.js
var Nt = E();
function Pt() {
	let e = Nt.chrome, t = e && e.app && e.app.runtime, n = "history" in Nt && !!Nt.history.pushState && !!Nt.history.replaceState;
	return !t && n;
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/history.js
var Ft = T, It;
function Lt(e) {
	let t = "history";
	Je(t, e), Ye(t, Rt);
}
function Rt() {
	if (!Pt()) return;
	let e = Ft.onpopstate;
	Ft.onpopstate = function(...t) {
		let n = Ft.location.href, r = It;
		if (It = n, Xe("history", {
			from: r,
			to: n
		}), e) try {
			return e.apply(this, t);
		} catch {}
	};
	function t(e) {
		return function(...t) {
			let n = t.length > 2 ? t[2] : void 0;
			if (n) {
				let e = It, t = String(n);
				It = t, Xe("history", {
					from: e,
					to: t
				});
			}
			return e.apply(this, t);
		};
	}
	O(Ft.history, "pushState", t), O(Ft.history, "replaceState", t);
}
//#endregion
//#region node_modules/@sentry/utils/esm/instrument/xhr.js
var zt = T, Bt = "__sentry_xhr_v3__";
function Vt(e) {
	Je("xhr", e), Ye("xhr", Ht);
}
function Ht() {
	if (!zt.XMLHttpRequest) return;
	let e = XMLHttpRequest.prototype;
	O(e, "open", function(e) {
		return function(...t) {
			let n = Date.now(), r = c(t[0]) ? t[0].toUpperCase() : void 0, i = Ut(t[1]);
			if (!r || !i) return e.apply(this, t);
			this[Bt] = {
				method: r,
				url: i,
				request_headers: {}
			}, r === "POST" && i.match(/sentry_key/) && (this.__sentry_own_request__ = !0);
			let a = () => {
				let e = this[Bt];
				if (e && this.readyState === 4) {
					try {
						e.status_code = this.status;
					} catch {}
					Xe("xhr", {
						args: [r, i],
						endTimestamp: Date.now(),
						startTimestamp: n,
						xhr: this
					});
				}
			};
			return "onreadystatechange" in this && typeof this.onreadystatechange == "function" ? O(this, "onreadystatechange", function(e) {
				return function(...t) {
					return a(), e.apply(this, t);
				};
			}) : this.addEventListener("readystatechange", a), O(this, "setRequestHeader", function(e) {
				return function(...t) {
					let [n, r] = t, i = this[Bt];
					return i && c(n) && c(r) && (i.request_headers[n.toLowerCase()] = r), e.apply(this, t);
				};
			}), e.apply(this, t);
		};
	}), O(e, "send", function(e) {
		return function(...t) {
			let n = this[Bt];
			return n ? (t[0] !== void 0 && (n.body = t[0]), Xe("xhr", {
				args: [n.method, n.url],
				startTimestamp: Date.now(),
				xhr: this
			}), e.apply(this, t)) : e.apply(this, t);
		};
	});
}
function Ut(e) {
	if (c(e)) return e;
	try {
		return e.toString();
	} catch {}
}
//#endregion
//#region node_modules/@sentry/utils/esm/env.js
function Wt() {
	return typeof __SENTRY_BROWSER_BUNDLE__ < "u" && !!__SENTRY_BROWSER_BUNDLE__;
}
function Gt() {
	return "npm";
}
//#endregion
//#region node_modules/@sentry/utils/esm/node.js
function Kt() {
	return !Wt() && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
}
//#endregion
//#region node_modules/@sentry/utils/esm/isBrowser.js
function qt() {
	return typeof window < "u" && (!Kt() || Jt());
}
function Jt() {
	return T.process !== void 0 && T.process.type === "renderer";
}
//#endregion
//#region node_modules/@sentry/utils/esm/memo.js
function Yt() {
	let e = typeof WeakSet == "function", t = e ? /* @__PURE__ */ new WeakSet() : [];
	function n(n) {
		if (e) return t.has(n) ? !0 : (t.add(n), !1);
		for (let e = 0; e < t.length; e++) if (t[e] === n) return !0;
		return t.push(n), !1;
	}
	function r(n) {
		if (e) t.delete(n);
		else for (let e = 0; e < t.length; e++) if (t[e] === n) {
			t.splice(e, 1);
			break;
		}
	}
	return [n, r];
}
//#endregion
//#region node_modules/@sentry/utils/esm/normalize.js
function Xt(e, t = 100, n = Infinity) {
	try {
		return Qt("", e, t, n);
	} catch (e) {
		return { ERROR: `**non-serializable** (${e})` };
	}
}
function Zt(e, t = 3, n = 100 * 1024) {
	let r = Xt(e, t);
	return nn(r) > n ? Zt(e, t - 1, n) : r;
}
function Qt(e, t, n = Infinity, r = Infinity, i = Yt()) {
	let [a, o] = i;
	if (t == null || [
		"number",
		"boolean",
		"string"
	].includes(typeof t) && !_(t)) return t;
	let s = $t(e, t);
	if (!s.startsWith("[object ")) return s;
	if (t.__sentry_skip_normalization__) return t;
	let c = typeof t.__sentry_override_normalization_depth__ == "number" ? t.__sentry_override_normalization_depth__ : n;
	if (c === 0) return s.replace("object ", "");
	if (a(t)) return "[Circular ~]";
	let l = t;
	if (l && typeof l.toJSON == "function") try {
		return Qt("", l.toJSON(), c - 1, r, i);
	} catch {}
	let u = Array.isArray(t) ? [] : {}, d = 0, f = Me(t);
	for (let e in f) {
		if (!Object.prototype.hasOwnProperty.call(f, e)) continue;
		if (d >= r) {
			u[e] = "[MaxProperties ~]";
			break;
		}
		let t = f[e];
		u[e] = Qt(e, t, c - 1, r, i), d++;
	}
	return o(t), u;
}
function $t(e, t) {
	try {
		if (e === "domain" && t && typeof t == "object" && t._events) return "[Domain]";
		if (e === "domainEmitter") return "[DomainEmitter]";
		if (typeof window < "u" && t === window) return "[Global]";
		if (typeof window < "u" && t === window) return "[Window]";
		if (typeof document < "u" && t === document) return "[Document]";
		if (y(t)) return "[VueViewModel]";
		if (g(t)) return "[SyntheticEvent]";
		if (typeof t == "number" && t !== t) return "[NaN]";
		if (typeof t == "function") return `[Function: ${Ge(t)}]`;
		if (typeof t == "symbol") return `[${String(t)}]`;
		if (typeof t == "bigint") return `[BigInt: ${String(t)}]`;
		let n = en(t);
		return /^HTML(\w*)Element$/.test(n) ? `[HTMLElement: ${n}]` : `[object ${n}]`;
	} catch (e) {
		return `**non-serializable** (${e})`;
	}
}
function en(e) {
	let t = Object.getPrototypeOf(e);
	return t ? t.constructor.name : "null prototype";
}
function tn(e) {
	return ~-encodeURI(e).split(/%..|./).length;
}
function nn(e) {
	return tn(JSON.stringify(e));
}
//#endregion
//#region node_modules/@sentry/utils/esm/path.js
function rn(e, t) {
	let n = 0;
	for (let t = e.length - 1; t >= 0; t--) {
		let r = e[t];
		r === "." ? e.splice(t, 1) : r === ".." ? (e.splice(t, 1), n++) : n && (e.splice(t, 1), n--);
	}
	if (t) for (; n--;) e.unshift("..");
	return e;
}
var an = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
function on(e) {
	let t = e.length > 1024 ? `<truncated>${e.slice(-1024)}` : e, n = an.exec(t);
	return n ? n.slice(1) : [];
}
function sn(...e) {
	let t = "", n = !1;
	for (let r = e.length - 1; r >= -1 && !n; r--) {
		let i = r >= 0 ? e[r] : "/";
		i && (t = `${i}/${t}`, n = i.charAt(0) === "/");
	}
	return t = rn(t.split("/").filter((e) => !!e), !n).join("/"), (n ? "/" : "") + t || ".";
}
function cn(e) {
	let t = 0;
	for (; t < e.length && e[t] === ""; t++);
	let n = e.length - 1;
	for (; n >= 0 && e[n] === ""; n--);
	return t > n ? [] : e.slice(t, n - t + 1);
}
function ln(e, t) {
	e = sn(e).slice(1), t = sn(t).slice(1);
	let n = cn(e.split("/")), r = cn(t.split("/")), i = Math.min(n.length, r.length), a = i;
	for (let e = 0; e < i; e++) if (n[e] !== r[e]) {
		a = e;
		break;
	}
	let o = [];
	for (let e = a; e < n.length; e++) o.push("..");
	return o = o.concat(r.slice(a)), o.join("/");
}
function un(e, t) {
	let n = on(e)[2];
	return t && n.slice(t.length * -1) === t && (n = n.slice(0, n.length - t.length)), n;
}
//#endregion
//#region node_modules/@sentry/utils/esm/syncpromise.js
var dn;
(function(e) {
	e[e.PENDING = 0] = "PENDING", e[e.RESOLVED = 1] = "RESOLVED", e[e.REJECTED = 2] = "REJECTED";
})(dn ||= {});
function fn(e) {
	return new mn((t) => {
		t(e);
	});
}
function pn(e) {
	return new mn((t, n) => {
		n(e);
	});
}
var mn = class e {
	constructor(t) {
		e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this), e.prototype.__init4.call(this), this._state = dn.PENDING, this._handlers = [];
		try {
			t(this._resolve, this._reject);
		} catch (e) {
			this._reject(e);
		}
	}
	then(t, n) {
		return new e((e, r) => {
			this._handlers.push([
				!1,
				(n) => {
					if (!t) e(n);
					else try {
						e(t(n));
					} catch (e) {
						r(e);
					}
				},
				(t) => {
					if (!n) r(t);
					else try {
						e(n(t));
					} catch (e) {
						r(e);
					}
				}
			]), this._executeHandlers();
		});
	}
	catch(e) {
		return this.then((e) => e, e);
	}
	finally(t) {
		return new e((e, n) => {
			let r, i;
			return this.then((e) => {
				i = !1, r = e, t && t();
			}, (e) => {
				i = !0, r = e, t && t();
			}).then(() => {
				if (i) {
					n(r);
					return;
				}
				e(r);
			});
		});
	}
	__init() {
		this._resolve = (e) => {
			this._setResult(dn.RESOLVED, e);
		};
	}
	__init2() {
		this._reject = (e) => {
			this._setResult(dn.REJECTED, e);
		};
	}
	__init3() {
		this._setResult = (e, t) => {
			if (this._state === dn.PENDING) {
				if (h(t)) {
					t.then(this._resolve, this._reject);
					return;
				}
				this._state = e, this._value = t, this._executeHandlers();
			}
		};
	}
	__init4() {
		this._executeHandlers = () => {
			if (this._state === dn.PENDING) return;
			let e = this._handlers.slice();
			this._handlers = [], e.forEach((e) => {
				e[0] ||= (this._state === dn.RESOLVED && e[1](this._value), this._state === dn.REJECTED && e[2](this._value), !0);
			});
		};
	}
};
//#endregion
//#region node_modules/@sentry/utils/esm/promisebuffer.js
function hn(e) {
	let t = [];
	function n() {
		return e === void 0 || t.length < e;
	}
	function r(e) {
		return t.splice(t.indexOf(e), 1)[0];
	}
	function i(e) {
		if (!n()) return pn(new De("Not adding Promise because buffer limit was reached."));
		let i = e();
		return t.indexOf(i) === -1 && t.push(i), i.then(() => r(i)).then(null, () => r(i).then(null, () => {})), i;
	}
	function a(e) {
		return new mn((n, r) => {
			let i = t.length;
			if (!i) return n(!0);
			let a = setTimeout(() => {
				e && e > 0 && n(!1);
			}, e);
			t.forEach((e) => {
				fn(e).then(() => {
					--i || (clearTimeout(a), n(!0));
				}, r);
			});
		});
	}
	return {
		$: t,
		add: i,
		drain: a
	};
}
//#endregion
//#region node_modules/@sentry/utils/esm/url.js
function gn(e) {
	if (!e) return {};
	let t = e.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
	if (!t) return {};
	let n = t[6] || "", r = t[8] || "";
	return {
		host: t[4],
		path: t[5],
		protocol: t[2],
		search: n,
		hash: r,
		relative: t[5] + n + r
	};
}
function _n(e) {
	return e.split(/[\?#]/, 1)[0];
}
//#endregion
//#region node_modules/@sentry/utils/esm/severity.js
var vn = [
	"fatal",
	"error",
	"warning",
	"log",
	"info",
	"debug"
];
function yn(e) {
	return e === "warn" ? "warning" : vn.includes(e) ? e : "log";
}
//#endregion
//#region node_modules/@sentry/utils/esm/time.js
var bn = 1e3;
function xn() {
	return Date.now() / bn;
}
function Sn() {
	let { performance: e } = T;
	if (!e || !e.now) return xn;
	let t = Date.now() - e.now(), n = e.timeOrigin == null ? t : e.timeOrigin;
	return () => (n + e.now()) / bn;
}
var Cn = Sn(), j = (() => {
	let { performance: e } = T;
	if (!e || !e.now) return;
	let t = 3600 * 1e3, n = e.now(), r = Date.now(), i = e.timeOrigin ? Math.abs(e.timeOrigin + n - r) : t, a = i < t, o = e.timing && e.timing.navigationStart, s = typeof o == "number" ? Math.abs(o + n - r) : t;
	return a || s < t ? i <= s ? e.timeOrigin : o : r;
})(), wn = "baggage", Tn = "sentry-", En = /^sentry-/;
function Dn(e) {
	if (!c(e) && !Array.isArray(e)) return;
	let t = {};
	if (Array.isArray(e)) t = e.reduce((e, t) => {
		let n = kn(t);
		for (let t of Object.keys(n)) e[t] = n[t];
		return e;
	}, {});
	else {
		if (!e) return;
		t = kn(e);
	}
	let n = Object.entries(t).reduce((e, [t, n]) => {
		if (t.match(En)) {
			let r = t.slice(7);
			e[r] = n;
		}
		return e;
	}, {});
	if (Object.keys(n).length > 0) return n;
}
function On(e) {
	if (e) return An(Object.entries(e).reduce((e, [t, n]) => (n && (e[`${Tn}${t}`] = n), e), {}));
}
function kn(e) {
	return e.split(",").map((e) => e.split("=").map((e) => decodeURIComponent(e.trim()))).reduce((e, [t, n]) => (e[t] = n, e), {});
}
function An(e) {
	if (Object.keys(e).length !== 0) return Object.entries(e).reduce((e, [t, n], r) => {
		let i = `${encodeURIComponent(t)}=${encodeURIComponent(n)}`, a = r === 0 ? i : `${e},${i}`;
		return a.length > 8192 ? (me && D.warn(`Not adding key: ${t} with val: ${n} to baggage header due to exceeding baggage size limits.`), e) : a;
	}, "");
}
//#endregion
//#region node_modules/@sentry/utils/esm/tracing.js
var jn = /* @__PURE__ */ RegExp("^[ \\t]*([0-9a-f]{32})?-?([0-9a-f]{16})?-?([01])?[ \\t]*$");
function Mn(e) {
	if (!e) return;
	let t = e.match(jn);
	if (!t) return;
	let n;
	return t[3] === "1" ? n = !0 : t[3] === "0" && (n = !1), {
		traceId: t[1],
		parentSampled: n,
		parentSpanId: t[2]
	};
}
function Nn(e, t) {
	let n = Mn(e), r = Dn(t), { traceId: i, parentSpanId: a, parentSampled: o } = n || {};
	return n ? {
		traceparentData: n,
		dynamicSamplingContext: r || {},
		propagationContext: {
			traceId: i || A(),
			parentSpanId: a || A().substring(16),
			spanId: A().substring(16),
			sampled: o,
			dsc: r || {}
		}
	} : {
		traceparentData: n,
		dynamicSamplingContext: void 0,
		propagationContext: {
			traceId: i || A(),
			spanId: A().substring(16)
		}
	};
}
function Pn(e, t) {
	let n = Mn(e), r = Dn(t), { traceId: i, parentSpanId: a, parentSampled: o } = n || {};
	return n ? {
		traceId: i || A(),
		parentSpanId: a || A().substring(16),
		spanId: A().substring(16),
		sampled: o,
		dsc: r || {}
	} : {
		traceId: i || A(),
		spanId: A().substring(16)
	};
}
function Fn(e = A(), t = A().substring(16), n) {
	let r = "";
	return n !== void 0 && (r = n ? "-1" : "-0"), `${e}-${t}${r}`;
}
//#endregion
//#region node_modules/@sentry/utils/esm/envelope.js
function In(e, t = []) {
	return [e, t];
}
function Ln(e, t) {
	let [n, r] = e;
	return [n, [...r, t]];
}
function Rn(e, t) {
	let n = e[1];
	for (let e of n) {
		let n = e[0].type;
		if (t(e, n)) return !0;
	}
	return !1;
}
function zn(e, t) {
	return Rn(e, (e, n) => t.includes(n));
}
function Bn(e, t) {
	return (t || new TextEncoder()).encode(e);
}
function Vn(e, t) {
	let [n, r] = e, i = JSON.stringify(n);
	function a(e) {
		typeof i == "string" ? i = typeof e == "string" ? i + e : [Bn(i, t), e] : i.push(typeof e == "string" ? Bn(e, t) : e);
	}
	for (let e of r) {
		let [t, n] = e;
		if (a(`\n${JSON.stringify(t)}\n`), typeof n == "string" || n instanceof Uint8Array) a(n);
		else {
			let e;
			try {
				e = JSON.stringify(n);
			} catch {
				e = JSON.stringify(Xt(n));
			}
			a(e);
		}
	}
	return typeof i == "string" ? i : Hn(i);
}
function Hn(e) {
	let t = e.reduce((e, t) => e + t.length, 0), n = new Uint8Array(t), r = 0;
	for (let t of e) n.set(t, r), r += t.length;
	return n;
}
function Un(e, t, n) {
	let r = typeof e == "string" ? t.encode(e) : e;
	function i(e) {
		let t = r.subarray(0, e);
		return r = r.subarray(e + 1), t;
	}
	function a() {
		let e = r.indexOf(10);
		return e < 0 && (e = r.length), JSON.parse(n.decode(i(e)));
	}
	let o = a(), s = [];
	for (; r.length;) {
		let e = a(), t = typeof e.length == "number" ? e.length : void 0;
		s.push([e, t ? i(t) : a()]);
	}
	return [o, s];
}
function Wn(e, t) {
	let n = typeof e.data == "string" ? Bn(e.data, t) : e.data;
	return [k({
		type: "attachment",
		length: n.length,
		filename: e.filename,
		content_type: e.contentType,
		attachment_type: e.attachmentType
	}), n];
}
var Gn = {
	session: "session",
	sessions: "session",
	attachment: "attachment",
	transaction: "transaction",
	event: "error",
	client_report: "internal",
	user_report: "default",
	profile: "profile",
	replay_event: "replay",
	replay_recording: "replay",
	check_in: "monitor",
	feedback: "feedback",
	span: "span",
	statsd: "metric_bucket"
};
function Kn(e) {
	return Gn[e];
}
function qn(e) {
	if (!e || !e.sdk) return;
	let { name: t, version: n } = e.sdk;
	return {
		name: t,
		version: n
	};
}
function Jn(e, t, n, r) {
	let i = e.sdkProcessingMetadata && e.sdkProcessingMetadata.dynamicSamplingContext;
	return {
		event_id: e.event_id,
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...t && { sdk: t },
		...!!n && r && { dsn: Se(r) },
		...i && { trace: k({ ...i }) }
	};
}
//#endregion
//#region node_modules/@sentry/utils/esm/clientreport.js
function Yn(e, t, n) {
	let r = [{ type: "client_report" }, {
		timestamp: n || xn(),
		discarded_events: e
	}];
	return In(t ? { dsn: t } : {}, [r]);
}
//#endregion
//#region node_modules/@sentry/utils/esm/ratelimit.js
var Xn = 60 * 1e3;
function Zn(e, t = Date.now()) {
	let n = parseInt(`${e}`, 10);
	if (!isNaN(n)) return n * 1e3;
	let r = Date.parse(`${e}`);
	return isNaN(r) ? Xn : r - t;
}
function Qn(e, t) {
	return e[t] || e.all || 0;
}
function $n(e, t, n = Date.now()) {
	return Qn(e, t) > n;
}
function er(e, { statusCode: t, headers: n }, r = Date.now()) {
	let i = { ...e }, a = n && n["x-sentry-rate-limits"], o = n && n["retry-after"];
	if (a) for (let e of a.trim().split(",")) {
		let [t, n, , , a] = e.split(":", 5), o = parseInt(t, 10), s = (isNaN(o) ? 60 : o) * 1e3;
		if (!n) i.all = r + s;
		else for (let e of n.split(";")) e === "metric_bucket" ? (!a || a.split(";").includes("custom")) && (i[e] = r + s) : i[e] = r + s;
	}
	else o ? i.all = r + Zn(o, r) : t === 429 && (i.all = r + 60 * 1e3);
	return i;
}
//#endregion
//#region node_modules/@sentry/utils/esm/eventbuilder.js
function tr(e, t) {
	return e(t.stack || "", 1);
}
function nr(e, t) {
	let n = {
		type: t.name || t.constructor.name,
		value: t.message
	}, r = tr(e, t);
	return r.length && (n.stacktrace = { frames: r }), n;
}
//#endregion
//#region node_modules/@sentry/utils/esm/buildPolyfills/_nullishCoalesce.js
function rr(e, t) {
	return e ?? t();
}
//#endregion
//#region node_modules/@sentry/utils/esm/buildPolyfills/_optionalChain.js
function ir(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
//#endregion
//#region node_modules/@sentry/core/esm/debug-build.js
var M = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, ar = "production";
//#endregion
//#region node_modules/@sentry/core/esm/eventProcessors.js
function or() {
	return oe("globalEventProcessors", () => []);
}
function sr(e) {
	or().push(e);
}
function cr(e, t, n, r = 0) {
	return new mn((i, a) => {
		let o = e[r];
		if (t === null || typeof o != "function") i(t);
		else {
			let s = o({ ...t }, n);
			M && o.id && s === null && D.log(`Event processor "${o.id}" dropped event`), h(s) ? s.then((t) => cr(e, t, n, r + 1).then(i)).then(null, a) : cr(e, s, n, r + 1).then(i).then(null, a);
		}
	});
}
//#endregion
//#region node_modules/@sentry/core/esm/session.js
function lr(e) {
	let t = Cn(), n = {
		sid: A(),
		init: !0,
		timestamp: t,
		started: t,
		duration: 0,
		status: "ok",
		errors: 0,
		ignoreDuration: !1,
		toJSON: () => fr(n)
	};
	return e && ur(n, e), n;
}
function ur(e, t = {}) {
	if (t.user && (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address), !e.did && !t.did && (e.did = t.user.id || t.user.email || t.user.username)), e.timestamp = t.timestamp || Cn(), t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism), t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration), t.sid && (e.sid = t.sid.length === 32 ? t.sid : A()), t.init !== void 0 && (e.init = t.init), !e.did && t.did && (e.did = `${t.did}`), typeof t.started == "number" && (e.started = t.started), e.ignoreDuration) e.duration = void 0;
	else if (typeof t.duration == "number") e.duration = t.duration;
	else {
		let t = e.timestamp - e.started;
		e.duration = t >= 0 ? t : 0;
	}
	t.release && (e.release = t.release), t.environment && (e.environment = t.environment), !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress), !e.userAgent && t.userAgent && (e.userAgent = t.userAgent), typeof t.errors == "number" && (e.errors = t.errors), t.status && (e.status = t.status);
}
function dr(e, t) {
	let n = {};
	t ? n = { status: t } : e.status === "ok" && (n = { status: "exited" }), ur(e, n);
}
function fr(e) {
	return k({
		sid: `${e.sid}`,
		init: e.init,
		started: (/* @__PURE__ */ new Date(e.started * 1e3)).toISOString(),
		timestamp: (/* @__PURE__ */ new Date(e.timestamp * 1e3)).toISOString(),
		status: e.status,
		errors: e.errors,
		did: typeof e.did == "number" || typeof e.did == "string" ? `${e.did}` : void 0,
		duration: e.duration,
		abnormal_mechanism: e.abnormal_mechanism,
		attrs: {
			release: e.release,
			environment: e.environment,
			ip_address: e.ipAddress,
			user_agent: e.userAgent
		}
	});
}
function pr(e) {
	let { spanId: t, traceId: n } = e.spanContext(), { data: r, op: i, parent_span_id: a, status: o, tags: s, origin: c } = N(e);
	return k({
		data: r,
		op: i,
		parent_span_id: a,
		span_id: t,
		status: o,
		tags: s,
		trace_id: n,
		origin: c
	});
}
function mr(e) {
	let { traceId: t, spanId: n } = e.spanContext();
	return Fn(t, n, vr(e));
}
function hr(e) {
	return typeof e == "number" ? gr(e) : Array.isArray(e) ? e[0] + e[1] / 1e9 : e instanceof Date ? gr(e.getTime()) : Cn();
}
function gr(e) {
	return e > 9999999999 ? e / 1e3 : e;
}
function N(e) {
	return _r(e) ? e.getSpanJSON() : typeof e.toJSON == "function" ? e.toJSON() : {};
}
function _r(e) {
	return typeof e.getSpanJSON == "function";
}
function vr(e) {
	let { traceFlags: t } = e.spanContext();
	return !!(t & 1);
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/prepareEvent.js
function yr(e, t, n, r, i, a) {
	let { normalizeDepth: o = 3, normalizeMaxBreadth: s = 1e3 } = e, c = {
		...t,
		event_id: t.event_id || n.event_id || A(),
		timestamp: t.timestamp || xn()
	}, l = n.integrations || e.integrations.map((e) => e.name);
	br(c, e), wr(c, l), t.type === void 0 && Sr(c, e.stackParser);
	let u = Er(r, n.captureContext);
	n.mechanism && nt(c, n.mechanism);
	let d = i && i.getEventProcessors ? i.getEventProcessors() : [], f = mi().getScopeData();
	a && ii(f, a.getScopeData()), u && ii(f, u.getScopeData());
	let p = [...n.attachments || [], ...f.attachments];
	return p.length && (n.attachments = p), ri(c, f), cr([
		...d,
		...or(),
		...f.eventProcessors
	], c, n).then((e) => (e && Cr(e), typeof o == "number" && o > 0 ? Tr(e, o, s) : e));
}
function br(e, t) {
	let { environment: n, release: r, dist: i, maxValueLength: a = 250 } = t;
	"environment" in e || (e.environment = "environment" in t ? n : ar), e.release === void 0 && r !== void 0 && (e.release = r), e.dist === void 0 && i !== void 0 && (e.dist = i), e.message &&= b(e.message, a);
	let o = e.exception && e.exception.values && e.exception.values[0];
	o && o.value && (o.value = b(o.value, a));
	let s = e.request;
	s && s.url && (s.url = b(s.url, a));
}
var xr = /* @__PURE__ */ new WeakMap();
function Sr(e, t) {
	let n = T._sentryDebugIds;
	if (!n) return;
	let r, i = xr.get(t);
	i ? r = i : (r = /* @__PURE__ */ new Map(), xr.set(t, r));
	let a = Object.keys(n).reduce((e, i) => {
		let a, o = r.get(i);
		o ? a = o : (a = t(i), r.set(i, a));
		for (let t = a.length - 1; t >= 0; t--) {
			let r = a[t];
			if (r.filename) {
				e[r.filename] = n[i];
				break;
			}
		}
		return e;
	}, {});
	try {
		e.exception.values.forEach((e) => {
			e.stacktrace.frames.forEach((e) => {
				e.filename && (e.debug_id = a[e.filename]);
			});
		});
	} catch {}
}
function Cr(e) {
	let t = {};
	try {
		e.exception.values.forEach((e) => {
			e.stacktrace.frames.forEach((e) => {
				e.debug_id && (e.abs_path ? t[e.abs_path] = e.debug_id : e.filename && (t[e.filename] = e.debug_id), delete e.debug_id);
			});
		});
	} catch {}
	if (Object.keys(t).length === 0) return;
	e.debug_meta = e.debug_meta || {}, e.debug_meta.images = e.debug_meta.images || [];
	let n = e.debug_meta.images;
	Object.keys(t).forEach((e) => {
		n.push({
			type: "sourcemap",
			code_file: e,
			debug_id: t[e]
		});
	});
}
function wr(e, t) {
	t.length > 0 && (e.sdk = e.sdk || {}, e.sdk.integrations = [...e.sdk.integrations || [], ...t]);
}
function Tr(e, t, n) {
	if (!e) return null;
	let r = {
		...e,
		...e.breadcrumbs && { breadcrumbs: e.breadcrumbs.map((e) => ({
			...e,
			...e.data && { data: Xt(e.data, t, n) }
		})) },
		...e.user && { user: Xt(e.user, t, n) },
		...e.contexts && { contexts: Xt(e.contexts, t, n) },
		...e.extra && { extra: Xt(e.extra, t, n) }
	};
	return e.contexts && e.contexts.trace && r.contexts && (r.contexts.trace = e.contexts.trace, e.contexts.trace.data && (r.contexts.trace.data = Xt(e.contexts.trace.data, t, n))), e.spans && (r.spans = e.spans.map((e) => {
		let r = N(e).data;
		return r && (e.data = Xt(r, t, n)), e;
	})), r;
}
function Er(e, t) {
	if (!t) return e;
	let n = e ? e.clone() : new pi();
	return n.update(t), n;
}
function Dr(e) {
	if (e) return Or(e) || Ar(e) ? { captureContext: e } : e;
}
function Or(e) {
	return e instanceof pi || typeof e == "function";
}
var kr = [
	"user",
	"level",
	"extra",
	"contexts",
	"tags",
	"fingerprint",
	"requestSession",
	"propagationContext"
];
function Ar(e) {
	return Object.keys(e).some((e) => kr.includes(e));
}
//#endregion
//#region node_modules/@sentry/core/esm/exports.js
function jr(e, t) {
	return I().captureException(e, Dr(t));
}
function Mr(e, t) {
	let n = typeof t == "string" ? t : void 0, r = typeof t == "string" ? void 0 : { captureContext: t };
	return I().captureMessage(e, n, r);
}
function Nr(e, t) {
	return I().captureEvent(e, t);
}
function Pr(e) {
	I().configureScope(e);
}
function Fr(e, t) {
	I().addBreadcrumb(e, t);
}
function Ir(e, t) {
	I().setContext(e, t);
}
function Lr(e) {
	I().setExtras(e);
}
function Rr(e, t) {
	I().setExtra(e, t);
}
function zr(e) {
	I().setTags(e);
}
function Br(e, t) {
	I().setTag(e, t);
}
function Vr(e) {
	I().setUser(e);
}
function Hr(...e) {
	let t = I();
	if (e.length === 2) {
		let [n, r] = e;
		return n ? t.withScope(() => (t.getStackTop().scope = n, r(n))) : t.withScope(r);
	}
	return t.withScope(e[0]);
}
function Ur(e) {
	return wi(() => e(Si()));
}
function Wr(e, t) {
	return Hr((n) => (n.setSpan(e), t(n)));
}
function Gr(e, t) {
	return I().startTransaction({ ...e }, t);
}
async function Kr(e) {
	let t = P();
	return t ? t.flush(e) : (M && D.warn("Cannot flush events. No client defined."), Promise.resolve(!1));
}
async function qr(e) {
	let t = P();
	return t ? t.close(e) : (M && D.warn("Cannot flush events and disable SDK. No client defined."), Promise.resolve(!1));
}
function Jr() {
	return I().lastEventId();
}
function P() {
	return I().getClient();
}
function Yr() {
	return !!P();
}
function F() {
	return I().getScope();
}
function Xr(e) {
	let t = P(), n = Si(), r = F(), { release: i, environment: a = ar } = t && t.getOptions() || {}, { userAgent: o } = T.navigator || {}, s = lr({
		release: i,
		environment: a,
		user: r.getUser() || n.getUser(),
		...o && { userAgent: o },
		...e
	}), c = n.getSession();
	return c && c.status === "ok" && ur(c, { status: "exited" }), Zr(), n.setSession(s), r.setSession(s), s;
}
function Zr() {
	let e = Si(), t = F(), n = t.getSession() || e.getSession();
	n && dr(n), Qr(), e.setSession(), t.setSession();
}
function Qr() {
	let e = Si(), t = F(), n = P(), r = t.getSession() || e.getSession();
	r && n && n.captureSession && n.captureSession(r);
}
function $r(e = !1) {
	if (e) {
		Zr();
		return;
	}
	Qr();
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/getRootSpan.js
function ei(e) {
	return e.transaction;
}
//#endregion
//#region node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js
function ti(e, t, n) {
	let r = t.getOptions(), { publicKey: i } = t.getDsn() || {}, { segment: a } = n && n.getUser() || {}, o = k({
		environment: r.environment || "production",
		release: r.release,
		user_segment: a,
		public_key: i,
		trace_id: e
	});
	return t.emit && t.emit("createDsc", o), o;
}
function ni(e) {
	let t = P();
	if (!t) return {};
	let n = ti(N(e).trace_id || "", t, F()), r = ei(e);
	if (!r) return n;
	let i = r && r._frozenDynamicSamplingContext;
	if (i) return i;
	let { sampleRate: a, source: o } = r.metadata;
	a != null && (n.sample_rate = `${a}`);
	let s = N(r);
	return o && o !== "url" && (n.transaction = s.description), n.sampled = String(vr(r)), t.emit && t.emit("createDsc", n), n;
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js
function ri(e, t) {
	let { fingerprint: n, span: r, breadcrumbs: i, sdkProcessingMetadata: a } = t;
	oi(e, t), r && li(e, r), ui(e, n), si(e, i), ci(e, a);
}
function ii(e, t) {
	let { extra: n, tags: r, user: i, contexts: a, level: o, sdkProcessingMetadata: s, breadcrumbs: c, fingerprint: l, eventProcessors: u, attachments: d, propagationContext: f, transactionName: p, span: m } = t;
	ai(e, "extra", n), ai(e, "tags", r), ai(e, "user", i), ai(e, "contexts", a), ai(e, "sdkProcessingMetadata", s), o && (e.level = o), p && (e.transactionName = p), m && (e.span = m), c.length && (e.breadcrumbs = [...e.breadcrumbs, ...c]), l.length && (e.fingerprint = [...e.fingerprint, ...l]), u.length && (e.eventProcessors = [...e.eventProcessors, ...u]), d.length && (e.attachments = [...e.attachments, ...d]), e.propagationContext = {
		...e.propagationContext,
		...f
	};
}
function ai(e, t, n) {
	if (n && Object.keys(n).length) {
		e[t] = { ...e[t] };
		for (let r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[t][r] = n[r]);
	}
}
function oi(e, t) {
	let { extra: n, tags: r, user: i, contexts: a, level: o, transactionName: s } = t, c = k(n);
	c && Object.keys(c).length && (e.extra = {
		...c,
		...e.extra
	});
	let l = k(r);
	l && Object.keys(l).length && (e.tags = {
		...l,
		...e.tags
	});
	let u = k(i);
	u && Object.keys(u).length && (e.user = {
		...u,
		...e.user
	});
	let d = k(a);
	d && Object.keys(d).length && (e.contexts = {
		...d,
		...e.contexts
	}), o && (e.level = o), s && (e.transaction = s);
}
function si(e, t) {
	let n = [...e.breadcrumbs || [], ...t];
	e.breadcrumbs = n.length ? n : void 0;
}
function ci(e, t) {
	e.sdkProcessingMetadata = {
		...e.sdkProcessingMetadata,
		...t
	};
}
function li(e, t) {
	e.contexts = {
		trace: pr(t),
		...e.contexts
	};
	let n = ei(t);
	if (n) {
		e.sdkProcessingMetadata = {
			dynamicSamplingContext: ni(t),
			...e.sdkProcessingMetadata
		};
		let r = N(n).description;
		r && (e.tags = {
			transaction: r,
			...e.tags
		});
	}
}
function ui(e, t) {
	e.fingerprint = e.fingerprint ? at(e.fingerprint) : [], t && (e.fingerprint = e.fingerprint.concat(t)), e.fingerprint && !e.fingerprint.length && delete e.fingerprint;
}
//#endregion
//#region node_modules/@sentry/core/esm/scope.js
var di = 100, fi, pi = class e {
	constructor() {
		this._notifyingListeners = !1, this._scopeListeners = [], this._eventProcessors = [], this._breadcrumbs = [], this._attachments = [], this._user = {}, this._tags = {}, this._extra = {}, this._contexts = {}, this._sdkProcessingMetadata = {}, this._propagationContext = hi();
	}
	static clone(t) {
		return t ? t.clone() : new e();
	}
	clone() {
		let t = new e();
		return t._breadcrumbs = [...this._breadcrumbs], t._tags = { ...this._tags }, t._extra = { ...this._extra }, t._contexts = { ...this._contexts }, t._user = this._user, t._level = this._level, t._span = this._span, t._session = this._session, t._transactionName = this._transactionName, t._fingerprint = this._fingerprint, t._eventProcessors = [...this._eventProcessors], t._requestSession = this._requestSession, t._attachments = [...this._attachments], t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }, t._propagationContext = { ...this._propagationContext }, t._client = this._client, t;
	}
	setClient(e) {
		this._client = e;
	}
	getClient() {
		return this._client;
	}
	addScopeListener(e) {
		this._scopeListeners.push(e);
	}
	addEventProcessor(e) {
		return this._eventProcessors.push(e), this;
	}
	setUser(e) {
		return this._user = e || {
			email: void 0,
			id: void 0,
			ip_address: void 0,
			segment: void 0,
			username: void 0
		}, this._session && ur(this._session, { user: e }), this._notifyScopeListeners(), this;
	}
	getUser() {
		return this._user;
	}
	getRequestSession() {
		return this._requestSession;
	}
	setRequestSession(e) {
		return this._requestSession = e, this;
	}
	setTags(e) {
		return this._tags = {
			...this._tags,
			...e
		}, this._notifyScopeListeners(), this;
	}
	setTag(e, t) {
		return this._tags = {
			...this._tags,
			[e]: t
		}, this._notifyScopeListeners(), this;
	}
	setExtras(e) {
		return this._extra = {
			...this._extra,
			...e
		}, this._notifyScopeListeners(), this;
	}
	setExtra(e, t) {
		return this._extra = {
			...this._extra,
			[e]: t
		}, this._notifyScopeListeners(), this;
	}
	setFingerprint(e) {
		return this._fingerprint = e, this._notifyScopeListeners(), this;
	}
	setLevel(e) {
		return this._level = e, this._notifyScopeListeners(), this;
	}
	setTransactionName(e) {
		return this._transactionName = e, this._notifyScopeListeners(), this;
	}
	setContext(e, t) {
		return t === null ? delete this._contexts[e] : this._contexts[e] = t, this._notifyScopeListeners(), this;
	}
	setSpan(e) {
		return this._span = e, this._notifyScopeListeners(), this;
	}
	getSpan() {
		return this._span;
	}
	getTransaction() {
		let e = this._span;
		return e && e.transaction;
	}
	setSession(e) {
		return e ? this._session = e : delete this._session, this._notifyScopeListeners(), this;
	}
	getSession() {
		return this._session;
	}
	update(t) {
		if (!t) return this;
		let n = typeof t == "function" ? t(this) : t;
		if (n instanceof e) {
			let e = n.getScopeData();
			this._tags = {
				...this._tags,
				...e.tags
			}, this._extra = {
				...this._extra,
				...e.extra
			}, this._contexts = {
				...this._contexts,
				...e.contexts
			}, e.user && Object.keys(e.user).length && (this._user = e.user), e.level && (this._level = e.level), e.fingerprint.length && (this._fingerprint = e.fingerprint), n.getRequestSession() && (this._requestSession = n.getRequestSession()), e.propagationContext && (this._propagationContext = e.propagationContext);
		} else if (d(n)) {
			let e = t;
			this._tags = {
				...this._tags,
				...e.tags
			}, this._extra = {
				...this._extra,
				...e.extra
			}, this._contexts = {
				...this._contexts,
				...e.contexts
			}, e.user && (this._user = e.user), e.level && (this._level = e.level), e.fingerprint && (this._fingerprint = e.fingerprint), e.requestSession && (this._requestSession = e.requestSession), e.propagationContext && (this._propagationContext = e.propagationContext);
		}
		return this;
	}
	clear() {
		return this._breadcrumbs = [], this._tags = {}, this._extra = {}, this._user = {}, this._contexts = {}, this._level = void 0, this._transactionName = void 0, this._fingerprint = void 0, this._requestSession = void 0, this._span = void 0, this._session = void 0, this._notifyScopeListeners(), this._attachments = [], this._propagationContext = hi(), this;
	}
	addBreadcrumb(e, t) {
		let n = typeof t == "number" ? t : di;
		if (n <= 0) return this;
		let r = {
			timestamp: xn(),
			...e
		}, i = this._breadcrumbs;
		return i.push(r), this._breadcrumbs = i.length > n ? i.slice(-n) : i, this._notifyScopeListeners(), this;
	}
	getLastBreadcrumb() {
		return this._breadcrumbs[this._breadcrumbs.length - 1];
	}
	clearBreadcrumbs() {
		return this._breadcrumbs = [], this._notifyScopeListeners(), this;
	}
	addAttachment(e) {
		return this._attachments.push(e), this;
	}
	getAttachments() {
		return this.getScopeData().attachments;
	}
	clearAttachments() {
		return this._attachments = [], this;
	}
	getScopeData() {
		let { _breadcrumbs: e, _attachments: t, _contexts: n, _tags: r, _extra: i, _user: a, _level: o, _fingerprint: s, _eventProcessors: c, _propagationContext: l, _sdkProcessingMetadata: u, _transactionName: d, _span: f } = this;
		return {
			breadcrumbs: e,
			attachments: t,
			contexts: n,
			tags: r,
			extra: i,
			user: a,
			level: o,
			fingerprint: s || [],
			eventProcessors: c,
			propagationContext: l,
			sdkProcessingMetadata: u,
			transactionName: d,
			span: f
		};
	}
	applyToEvent(e, t = {}, n = []) {
		return ri(e, this.getScopeData()), cr([
			...n,
			...or(),
			...this._eventProcessors
		], e, t);
	}
	setSDKProcessingMetadata(e) {
		return this._sdkProcessingMetadata = {
			...this._sdkProcessingMetadata,
			...e
		}, this;
	}
	setPropagationContext(e) {
		return this._propagationContext = e, this;
	}
	getPropagationContext() {
		return this._propagationContext;
	}
	captureException(e, t) {
		let n = t && t.event_id ? t.event_id : A();
		if (!this._client) return D.warn("No client configured on scope - will not capture exception!"), n;
		let r = /* @__PURE__ */ Error("Sentry syntheticException");
		return this._client.captureException(e, {
			originalException: e,
			syntheticException: r,
			...t,
			event_id: n
		}, this), n;
	}
	captureMessage(e, t, n) {
		let r = n && n.event_id ? n.event_id : A();
		if (!this._client) return D.warn("No client configured on scope - will not capture message!"), r;
		let i = Error(e);
		return this._client.captureMessage(e, t, {
			originalException: e,
			syntheticException: i,
			...n,
			event_id: r
		}, this), r;
	}
	captureEvent(e, t) {
		let n = t && t.event_id ? t.event_id : A();
		return this._client ? (this._client.captureEvent(e, {
			...t,
			event_id: n
		}, this), n) : (D.warn("No client configured on scope - will not capture event!"), n);
	}
	_notifyScopeListeners() {
		this._notifyingListeners ||= (this._notifyingListeners = !0, this._scopeListeners.forEach((e) => {
			e(this);
		}), !1);
	}
};
function mi() {
	return fi ||= new pi(), fi;
}
function hi() {
	return {
		traceId: A(),
		spanId: A().substring(16)
	};
}
//#endregion
//#region node_modules/@sentry/core/esm/version.js
var gi = "7.120.4", _i = parseFloat(gi), vi = 100, yi = class {
	constructor(e, t, n, r = _i) {
		this._version = r;
		let i;
		t ? i = t : (i = new pi(), i.setClient(e));
		let a;
		n ? a = n : (a = new pi(), a.setClient(e)), this._stack = [{ scope: i }], e && this.bindClient(e), this._isolationScope = a;
	}
	isOlderThan(e) {
		return this._version < e;
	}
	bindClient(e) {
		let t = this.getStackTop();
		t.client = e, t.scope.setClient(e), e && e.setupIntegrations && e.setupIntegrations();
	}
	pushScope() {
		let e = this.getScope().clone();
		return this.getStack().push({
			client: this.getClient(),
			scope: e
		}), e;
	}
	popScope() {
		return this.getStack().length <= 1 ? !1 : !!this.getStack().pop();
	}
	withScope(e) {
		let t = this.pushScope(), n;
		try {
			n = e(t);
		} catch (e) {
			throw this.popScope(), e;
		}
		return h(n) ? n.then((e) => (this.popScope(), e), (e) => {
			throw this.popScope(), e;
		}) : (this.popScope(), n);
	}
	getClient() {
		return this.getStackTop().client;
	}
	getScope() {
		return this.getStackTop().scope;
	}
	getIsolationScope() {
		return this._isolationScope;
	}
	getStack() {
		return this._stack;
	}
	getStackTop() {
		return this._stack[this._stack.length - 1];
	}
	captureException(e, t) {
		let n = this._lastEventId = t && t.event_id ? t.event_id : A(), r = /* @__PURE__ */ Error("Sentry syntheticException");
		return this.getScope().captureException(e, {
			originalException: e,
			syntheticException: r,
			...t,
			event_id: n
		}), n;
	}
	captureMessage(e, t, n) {
		let r = this._lastEventId = n && n.event_id ? n.event_id : A(), i = Error(e);
		return this.getScope().captureMessage(e, t, {
			originalException: e,
			syntheticException: i,
			...n,
			event_id: r
		}), r;
	}
	captureEvent(e, t) {
		let n = t && t.event_id ? t.event_id : A();
		return e.type || (this._lastEventId = n), this.getScope().captureEvent(e, {
			...t,
			event_id: n
		}), n;
	}
	lastEventId() {
		return this._lastEventId;
	}
	addBreadcrumb(e, t) {
		let { scope: n, client: r } = this.getStackTop();
		if (!r) return;
		let { beforeBreadcrumb: i = null, maxBreadcrumbs: a = vi } = r.getOptions && r.getOptions() || {};
		if (a <= 0) return;
		let o = {
			timestamp: xn(),
			...e
		}, s = i ? ve(() => i(o, t)) : o;
		s !== null && (r.emit && r.emit("beforeAddBreadcrumb", s, t), n.addBreadcrumb(s, a));
	}
	setUser(e) {
		this.getScope().setUser(e), this.getIsolationScope().setUser(e);
	}
	setTags(e) {
		this.getScope().setTags(e), this.getIsolationScope().setTags(e);
	}
	setExtras(e) {
		this.getScope().setExtras(e), this.getIsolationScope().setExtras(e);
	}
	setTag(e, t) {
		this.getScope().setTag(e, t), this.getIsolationScope().setTag(e, t);
	}
	setExtra(e, t) {
		this.getScope().setExtra(e, t), this.getIsolationScope().setExtra(e, t);
	}
	setContext(e, t) {
		this.getScope().setContext(e, t), this.getIsolationScope().setContext(e, t);
	}
	configureScope(e) {
		let { scope: t, client: n } = this.getStackTop();
		n && e(t);
	}
	run(e) {
		let t = xi(this);
		try {
			e(this);
		} finally {
			xi(t);
		}
	}
	getIntegration(e) {
		let t = this.getClient();
		if (!t) return null;
		try {
			return t.getIntegration(e);
		} catch {
			return M && D.warn(`Cannot retrieve integration ${e.id} from the current Hub`), null;
		}
	}
	startTransaction(e, t) {
		let n = this._callExtensionMethod("startTransaction", e, t);
		return M && !n && (this.getClient() ? D.warn("Tracing extension 'startTransaction' has not been added. Call 'addTracingExtensions' before calling 'init':\nSentry.addTracingExtensions();\nSentry.init({...});\n") : D.warn("Tracing extension 'startTransaction' is missing. You should 'init' the SDK before calling 'startTransaction'")), n;
	}
	traceHeaders() {
		return this._callExtensionMethod("traceHeaders");
	}
	captureSession(e = !1) {
		if (e) return this.endSession();
		this._sendSessionUpdate();
	}
	endSession() {
		let e = this.getStackTop().scope, t = e.getSession();
		t && dr(t), this._sendSessionUpdate(), e.setSession();
	}
	startSession(e) {
		let { scope: t, client: n } = this.getStackTop(), { release: r, environment: i = ar } = n && n.getOptions() || {}, { userAgent: a } = T.navigator || {}, o = lr({
			release: r,
			environment: i,
			user: t.getUser(),
			...a && { userAgent: a },
			...e
		}), s = t.getSession && t.getSession();
		return s && s.status === "ok" && ur(s, { status: "exited" }), this.endSession(), t.setSession(o), o;
	}
	shouldSendDefaultPii() {
		let e = this.getClient(), t = e && e.getOptions();
		return !!(t && t.sendDefaultPii);
	}
	_sendSessionUpdate() {
		let { scope: e, client: t } = this.getStackTop(), n = e.getSession();
		n && t && t.captureSession && t.captureSession(n);
	}
	_callExtensionMethod(e, ...t) {
		let n = bi().__SENTRY__;
		if (n && n.extensions && typeof n.extensions[e] == "function") return n.extensions[e].apply(this, t);
		M && D.warn(`Extension method ${e} couldn't be found, doing nothing.`);
	}
};
function bi() {
	return T.__SENTRY__ = T.__SENTRY__ || {
		extensions: {},
		hub: void 0
	}, T;
}
function xi(e) {
	let t = bi(), n = Ei(t);
	return Di(t, e), n;
}
function I() {
	let e = bi();
	if (e.__SENTRY__ && e.__SENTRY__.acs) {
		let t = e.__SENTRY__.acs.getCurrentHub();
		if (t) return t;
	}
	return Ci(e);
}
function Si() {
	return I().getIsolationScope();
}
function Ci(e = bi()) {
	return (!Ti(e) || Ei(e).isOlderThan(_i)) && Di(e, new yi()), Ei(e);
}
function wi(e, t = {}) {
	let n = bi();
	return n.__SENTRY__ && n.__SENTRY__.acs ? n.__SENTRY__.acs.runWithAsyncContext(e, t) : e();
}
function Ti(e) {
	return !!(e && e.__SENTRY__ && e.__SENTRY__.hub);
}
function Ei(e) {
	return oe("hub", () => new yi(), e);
}
function Di(e, t) {
	if (!e) return !1;
	let n = e.__SENTRY__ = e.__SENTRY__ || {};
	return n.hub = t, !0;
}
//#endregion
//#region node_modules/@sentry/core/esm/tracing/utils.js
function Oi(e) {
	return (e || I()).getScope().getTransaction();
}
var ki = Mn, Ai = !1;
function ji() {
	Ai || (Ai = !0, Ot(Mi), jt(Mi));
}
function Mi() {
	let e = Oi();
	if (e) {
		let t = "internal_error";
		M && D.log(`[Tracing] Transaction: ${t} -> Global error occured`), e.setStatus(t);
	}
}
Mi.tag = "sentry_tracingErrorCallback";
//#endregion
//#region node_modules/@sentry/core/esm/tracing/spanstatus.js
var Ni;
(function(e) {
	e.Ok = "ok", e.DeadlineExceeded = "deadline_exceeded", e.Unauthenticated = "unauthenticated", e.PermissionDenied = "permission_denied", e.NotFound = "not_found", e.ResourceExhausted = "resource_exhausted", e.InvalidArgument = "invalid_argument", e.Unimplemented = "unimplemented", e.Unavailable = "unavailable", e.InternalError = "internal_error", e.UnknownError = "unknown_error", e.Cancelled = "cancelled", e.AlreadyExists = "already_exists", e.FailedPrecondition = "failed_precondition", e.Aborted = "aborted", e.OutOfRange = "out_of_range", e.DataLoss = "data_loss";
})(Ni ||= {});
function Pi(e) {
	if (e < 400 && e >= 100) return "ok";
	if (e >= 400 && e < 500) switch (e) {
		case 401: return "unauthenticated";
		case 403: return "permission_denied";
		case 404: return "not_found";
		case 409: return "already_exists";
		case 413: return "failed_precondition";
		case 429: return "resource_exhausted";
		default: return "invalid_argument";
	}
	if (e >= 500 && e < 600) switch (e) {
		case 501: return "unimplemented";
		case 503: return "unavailable";
		case 504: return "deadline_exceeded";
		default: return "internal_error";
	}
	return "unknown_error";
}
var Fi = Pi;
function Ii(e, t) {
	e.setTag("http.status_code", String(t)), e.setData("http.response.status_code", t);
	let n = Pi(t);
	n !== "unknown_error" && e.setStatus(n);
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/handleCallbackErrors.js
function Li(e, t, n = () => {}) {
	let r;
	try {
		r = e();
	} catch (e) {
		throw t(e), n(), e;
	}
	return Ri(r, t, n);
}
function Ri(e, t, n) {
	return h(e) ? e.then((e) => (n(), e), (e) => {
		throw t(e), n(), e;
	}) : (n(), e);
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/hasTracingEnabled.js
function zi(e) {
	if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__) return !1;
	let t = P(), n = e || t && t.getOptions();
	return !!n && (n.enableTracing || "tracesSampleRate" in n || "tracesSampler" in n);
}
//#endregion
//#region node_modules/@sentry/core/esm/tracing/trace.js
function Bi(e, t, n = () => {}, r = () => {}) {
	let i = I(), a = F(), o = a.getSpan(), s = Ki(i, {
		parentSpan: o,
		spanContext: qi(e),
		forceTransaction: !1,
		scope: a
	});
	return a.setSpan(s), Li(() => t(s), (e) => {
		s && s.setStatus("internal_error"), n(e, s);
	}, () => {
		s && s.end(), a.setSpan(o), r();
	});
}
function Vi(e, t) {
	let n = qi(e);
	return wi(() => Hr(e.scope, (r) => {
		let i = I(), a = r.getSpan(), o = e.onlyIfParent && !a ? void 0 : Ki(i, {
			parentSpan: a,
			spanContext: n,
			forceTransaction: e.forceTransaction,
			scope: r
		});
		return Li(() => t(o), () => {
			if (o) {
				let { status: e } = N(o);
				(!e || e === "ok") && o.setStatus("internal_error");
			}
		}, () => o && o.end());
	}));
}
function Hi(e, t) {
	let n = qi(e);
	return wi(() => Hr(e.scope, (r) => {
		let i = I(), a = r.getSpan(), o = e.onlyIfParent && !a ? void 0 : Ki(i, {
			parentSpan: a,
			spanContext: n,
			forceTransaction: e.forceTransaction,
			scope: r
		});
		function s() {
			o && o.end();
		}
		return Li(() => t(o, s), () => {
			if (o && o.isRecording()) {
				let { status: e } = N(o);
				(!e || e === "ok") && o.setStatus("internal_error");
			}
		});
	}));
}
function Ui(e) {
	if (!zi()) return;
	let t = qi(e), n = I(), r = e.scope ? e.scope.getSpan() : Wi();
	if (e.onlyIfParent && !r) return;
	let i = (e.scope || F()).clone();
	return Ki(n, {
		parentSpan: r,
		spanContext: t,
		forceTransaction: e.forceTransaction,
		scope: i
	});
}
function Wi() {
	return F().getSpan();
}
var Gi = ({ sentryTrace: e, baggage: t }, n) => {
	let r = F(), { traceparentData: i, dynamicSamplingContext: a, propagationContext: o } = Nn(e, t);
	r.setPropagationContext(o), M && i && D.log(`[Tracing] Continuing trace ${i.traceId}.`);
	let s = {
		...i,
		metadata: k({ dynamicSamplingContext: a })
	};
	return n ? wi(() => n(s)) : s;
};
function Ki(e, { parentSpan: t, spanContext: n, forceTransaction: r, scope: i }) {
	if (!zi()) return;
	let a = Si(), o;
	if (t && !r) o = t.startChild(n);
	else if (t) {
		let r = ni(t), { traceId: i, spanId: a } = t.spanContext(), s = vr(t);
		o = e.startTransaction({
			traceId: i,
			parentSpanId: a,
			parentSampled: s,
			...n,
			metadata: {
				dynamicSamplingContext: r,
				...n.metadata
			}
		});
	} else {
		let { traceId: t, dsc: r, parentSpanId: s, sampled: c } = {
			...a.getPropagationContext(),
			...i.getPropagationContext()
		};
		o = e.startTransaction({
			traceId: t,
			parentSpanId: s,
			parentSampled: c,
			...n,
			metadata: {
				dynamicSamplingContext: r,
				...n.metadata
			}
		});
	}
	return i.setSpan(o), Xi(o, i, a), o;
}
function qi(e) {
	if (e.startTime) {
		let t = { ...e };
		return t.startTimestamp = hr(e.startTime), delete t.startTime, t;
	}
	return e;
}
var Ji = "_sentryScope", Yi = "_sentryIsolationScope";
function Xi(e, t, n) {
	e && (Oe(e, Yi, n), Oe(e, Ji, t));
}
function Zi(e) {
	return {
		scope: e[Ji],
		isolationScope: e[Yi]
	};
}
//#endregion
//#region node_modules/@sentry/core/esm/metrics/metric-summary.js
var Qi;
function $i(e) {
	return Qi ? Qi.get(e) : void 0;
}
function ea(e) {
	let t = $i(e);
	if (!t) return;
	let n = {};
	for (let [, [e, r]] of t) n[e] || (n[e] = []), n[e].push(k(r));
	return n;
}
function ta(e, t, n, r, i, a) {
	let o = Wi();
	if (o) {
		let s = $i(o) || /* @__PURE__ */ new Map(), c = `${e}:${t}@${r}`, l = s.get(a);
		if (l) {
			let [, e] = l;
			s.set(a, [c, {
				min: Math.min(e.min, n),
				max: Math.max(e.max, n),
				count: e.count += 1,
				sum: e.sum += n,
				tags: e.tags
			}]);
		} else s.set(a, [c, {
			min: n,
			max: n,
			count: 1,
			sum: n,
			tags: i
		}]);
		Qi ||= /* @__PURE__ */ new WeakMap(), Qi.set(o, s);
	}
}
//#endregion
//#region node_modules/@sentry/core/esm/semanticAttributes.js
var na = "sentry.source", ra = "sentry.sample_rate", ia = "sentry.op", aa = "sentry.origin", oa = "profile_id", sa = class {
	constructor(e = 1e3) {
		this._maxlen = e, this.spans = [];
	}
	add(e) {
		this.spans.length > this._maxlen ? e.spanRecorder = void 0 : this.spans.push(e);
	}
}, ca = class e {
	constructor(e = {}) {
		this._traceId = e.traceId || A(), this._spanId = e.spanId || A().substring(16), this._startTime = e.startTimestamp || Cn(), this.tags = e.tags ? { ...e.tags } : {}, this.data = e.data ? { ...e.data } : {}, this.instrumenter = e.instrumenter || "sentry", this._attributes = {}, this.setAttributes({
			[aa]: e.origin || "manual",
			[ia]: e.op,
			...e.attributes
		}), this._name = e.name || e.description, e.parentSpanId && (this._parentSpanId = e.parentSpanId), "sampled" in e && (this._sampled = e.sampled), e.status && (this._status = e.status), e.endTimestamp && (this._endTime = e.endTimestamp), e.exclusiveTime !== void 0 && (this._exclusiveTime = e.exclusiveTime), this._measurements = e.measurements ? { ...e.measurements } : {};
	}
	get name() {
		return this._name || "";
	}
	set name(e) {
		this.updateName(e);
	}
	get description() {
		return this._name;
	}
	set description(e) {
		this._name = e;
	}
	get traceId() {
		return this._traceId;
	}
	set traceId(e) {
		this._traceId = e;
	}
	get spanId() {
		return this._spanId;
	}
	set spanId(e) {
		this._spanId = e;
	}
	set parentSpanId(e) {
		this._parentSpanId = e;
	}
	get parentSpanId() {
		return this._parentSpanId;
	}
	get sampled() {
		return this._sampled;
	}
	set sampled(e) {
		this._sampled = e;
	}
	get attributes() {
		return this._attributes;
	}
	set attributes(e) {
		this._attributes = e;
	}
	get startTimestamp() {
		return this._startTime;
	}
	set startTimestamp(e) {
		this._startTime = e;
	}
	get endTimestamp() {
		return this._endTime;
	}
	set endTimestamp(e) {
		this._endTime = e;
	}
	get status() {
		return this._status;
	}
	set status(e) {
		this._status = e;
	}
	get op() {
		return this._attributes[ia];
	}
	set op(e) {
		this.setAttribute(ia, e);
	}
	get origin() {
		return this._attributes[aa];
	}
	set origin(e) {
		this.setAttribute(aa, e);
	}
	spanContext() {
		let { _spanId: e, _traceId: t, _sampled: n } = this;
		return {
			spanId: e,
			traceId: t,
			traceFlags: +!!n
		};
	}
	startChild(t) {
		let n = new e({
			...t,
			parentSpanId: this._spanId,
			sampled: this._sampled,
			traceId: this._traceId
		});
		n.spanRecorder = this.spanRecorder, n.spanRecorder && n.spanRecorder.add(n);
		let r = ei(this);
		if (n.transaction = r, M && r) {
			let e = `[Tracing] Starting '${t && t.op || "< unknown op >"}' span on transaction '${N(n).description || "< unknown name >"}' (${r.spanContext().spanId}).`;
			D.log(e), this._logMessage = e;
		}
		return n;
	}
	setTag(e, t) {
		return this.tags = {
			...this.tags,
			[e]: t
		}, this;
	}
	setData(e, t) {
		return this.data = {
			...this.data,
			[e]: t
		}, this;
	}
	setAttribute(e, t) {
		t === void 0 ? delete this._attributes[e] : this._attributes[e] = t;
	}
	setAttributes(e) {
		Object.keys(e).forEach((t) => this.setAttribute(t, e[t]));
	}
	setStatus(e) {
		return this._status = e, this;
	}
	setHttpStatus(e) {
		return Ii(this, e), this;
	}
	setName(e) {
		this.updateName(e);
	}
	updateName(e) {
		return this._name = e, this;
	}
	isSuccess() {
		return this._status === "ok";
	}
	finish(e) {
		return this.end(e);
	}
	end(e) {
		if (this._endTime) return;
		let t = ei(this);
		if (M && t && t.spanContext().spanId !== this._spanId) {
			let e = this._logMessage;
			e && D.log(e.replace("Starting", "Finishing"));
		}
		this._endTime = hr(e);
	}
	toTraceparent() {
		return mr(this);
	}
	toContext() {
		return k({
			data: this._getData(),
			description: this._name,
			endTimestamp: this._endTime,
			op: this.op,
			parentSpanId: this._parentSpanId,
			sampled: this._sampled,
			spanId: this._spanId,
			startTimestamp: this._startTime,
			status: this._status,
			tags: this.tags,
			traceId: this._traceId
		});
	}
	updateWithContext(e) {
		return this.data = e.data || {}, this._name = e.name || e.description, this._endTime = e.endTimestamp, this.op = e.op, this._parentSpanId = e.parentSpanId, this._sampled = e.sampled, this._spanId = e.spanId || this._spanId, this._startTime = e.startTimestamp || this._startTime, this._status = e.status, this.tags = e.tags || {}, this._traceId = e.traceId || this._traceId, this;
	}
	getTraceContext() {
		return pr(this);
	}
	getSpanJSON() {
		return k({
			data: this._getData(),
			description: this._name,
			op: this._attributes[ia],
			parent_span_id: this._parentSpanId,
			span_id: this._spanId,
			start_timestamp: this._startTime,
			status: this._status,
			tags: Object.keys(this.tags).length > 0 ? this.tags : void 0,
			timestamp: this._endTime,
			trace_id: this._traceId,
			origin: this._attributes[aa],
			_metrics_summary: ea(this),
			profile_id: this._attributes[oa],
			exclusive_time: this._exclusiveTime,
			measurements: Object.keys(this._measurements).length > 0 ? this._measurements : void 0
		});
	}
	isRecording() {
		return !this._endTime && !!this._sampled;
	}
	toJSON() {
		return this.getSpanJSON();
	}
	_getData() {
		let { data: e, _attributes: t } = this, n = Object.keys(e).length > 0, r = Object.keys(t).length > 0;
		if (!(!n && !r)) return n && r ? {
			...e,
			...t
		} : n ? e : t;
	}
}, la = class extends ca {
	constructor(e, t) {
		super(e), this._contexts = {}, this._hub = t || I(), this._name = e.name || "", this._metadata = { ...e.metadata }, this._trimEnd = e.trimEnd, this.transaction = this;
		let n = this._metadata.dynamicSamplingContext;
		n && (this._frozenDynamicSamplingContext = { ...n });
	}
	get name() {
		return this._name;
	}
	set name(e) {
		this.setName(e);
	}
	get metadata() {
		return {
			source: "custom",
			spanMetadata: {},
			...this._metadata,
			...this._attributes["sentry.source"] && { source: this._attributes["sentry.source"] },
			...this._attributes["sentry.sample_rate"] && { sampleRate: this._attributes["sentry.sample_rate"] }
		};
	}
	set metadata(e) {
		this._metadata = e;
	}
	setName(e, t = "custom") {
		this._name = e, this.setAttribute(na, t);
	}
	updateName(e) {
		return this._name = e, this;
	}
	initSpanRecorder(e = 1e3) {
		this.spanRecorder ||= new sa(e), this.spanRecorder.add(this);
	}
	setContext(e, t) {
		t === null ? delete this._contexts[e] : this._contexts[e] = t;
	}
	setMeasurement(e, t, n = "") {
		this._measurements[e] = {
			value: t,
			unit: n
		};
	}
	setMetadata(e) {
		this._metadata = {
			...this._metadata,
			...e
		};
	}
	end(e) {
		let t = hr(e), n = this._finishTransaction(t);
		if (n) return this._hub.captureEvent(n);
	}
	toContext() {
		return k({
			...super.toContext(),
			name: this._name,
			trimEnd: this._trimEnd
		});
	}
	updateWithContext(e) {
		return super.updateWithContext(e), this._name = e.name || "", this._trimEnd = e.trimEnd, this;
	}
	getDynamicSamplingContext() {
		return ni(this);
	}
	setHub(e) {
		this._hub = e;
	}
	getProfileId() {
		if (this._contexts !== void 0 && this._contexts.profile !== void 0) return this._contexts.profile.profile_id;
	}
	_finishTransaction(e) {
		if (this._endTime !== void 0) return;
		this._name ||= (M && D.warn("Transaction has no name, falling back to `<unlabeled transaction>`."), "<unlabeled transaction>"), super.end(e);
		let t = this._hub.getClient();
		if (t && t.emit && t.emit("finishTransaction", this), this._sampled !== !0) {
			M && D.log("[Tracing] Discarding transaction because its trace was not chosen to be sampled."), t && t.recordDroppedEvent("sample_rate", "transaction");
			return;
		}
		let n = this.spanRecorder ? this.spanRecorder.spans.filter((e) => e !== this && N(e).timestamp) : [];
		if (this._trimEnd && n.length > 0) {
			let e = n.map((e) => N(e).timestamp).filter(Boolean);
			this._endTime = e.reduce((e, t) => e > t ? e : t);
		}
		let { scope: r, isolationScope: i } = Zi(this), { metadata: a } = this, { source: o } = a, s = {
			contexts: {
				...this._contexts,
				trace: pr(this)
			},
			spans: n,
			start_timestamp: this._startTime,
			tags: this.tags,
			timestamp: this._endTime,
			transaction: this._name,
			type: "transaction",
			sdkProcessingMetadata: {
				...a,
				capturedSpanScope: r,
				capturedSpanIsolationScope: i,
				...k({ dynamicSamplingContext: ni(this) })
			},
			_metrics_summary: ea(this),
			...o && { transaction_info: { source: o } }
		};
		return Object.keys(this._measurements).length > 0 && (M && D.log("[Measurements] Adding measurements to transaction", JSON.stringify(this._measurements, void 0, 2)), s.measurements = this._measurements), M && D.log(`[Tracing] Finishing ${this.op} transaction: ${this._name}.`), s;
	}
}, ua = {
	idleTimeout: 1e3,
	finalTimeout: 3e4,
	heartbeatInterval: 5e3
}, da = "finishReason", fa = [
	"heartbeatFailed",
	"idleTimeout",
	"documentHidden",
	"finalTimeout",
	"externalFinish",
	"cancelled"
], pa = class extends sa {
	constructor(e, t, n, r) {
		super(r), this._pushActivity = e, this._popActivity = t, this.transactionSpanId = n;
	}
	add(e) {
		if (e.spanContext().spanId !== this.transactionSpanId) {
			let t = e.end;
			e.end = (...n) => (this._popActivity(e.spanContext().spanId), t.apply(e, n)), N(e).timestamp === void 0 && this._pushActivity(e.spanContext().spanId);
		}
		super.add(e);
	}
}, ma = class extends la {
	constructor(e, t, n = ua.idleTimeout, r = ua.finalTimeout, i = ua.heartbeatInterval, a = !1, o = !1) {
		super(e, t), this._idleHub = t, this._idleTimeout = n, this._finalTimeout = r, this._heartbeatInterval = i, this._onScope = a, this.activities = {}, this._heartbeatCounter = 0, this._finished = !1, this._idleTimeoutCanceledPermanently = !1, this._beforeFinishCallbacks = [], this._finishReason = fa[4], this._autoFinishAllowed = !o, a && (M && D.log(`Setting idle transaction on scope. Span ID: ${this.spanContext().spanId}`), t.getScope().setSpan(this)), o || this._restartIdleTimeout(), setTimeout(() => {
			this._finished || (this.setStatus("deadline_exceeded"), this._finishReason = fa[3], this.end());
		}, this._finalTimeout);
	}
	end(e) {
		let t = hr(e);
		if (this._finished = !0, this.activities = {}, this.op === "ui.action.click" && this.setAttribute(da, this._finishReason), this.spanRecorder) {
			M && D.log("[Tracing] finishing IdleTransaction", (/* @__PURE__ */ new Date(t * 1e3)).toISOString(), this.op);
			for (let e of this._beforeFinishCallbacks) e(this, t);
			this.spanRecorder.spans = this.spanRecorder.spans.filter((e) => {
				if (e.spanContext().spanId === this.spanContext().spanId) return !0;
				N(e).timestamp || (e.setStatus("cancelled"), e.end(t), M && D.log("[Tracing] cancelling span since transaction ended early", JSON.stringify(e, void 0, 2)));
				let { start_timestamp: n, timestamp: r } = N(e), i = n && n < t, a = (this._finalTimeout + this._idleTimeout) / 1e3, o = r && n && r - n < a;
				if (M) {
					let t = JSON.stringify(e, void 0, 2);
					i ? o || D.log("[Tracing] discarding Span since it finished after Transaction final timeout", t) : D.log("[Tracing] discarding Span since it happened after Transaction was finished", t);
				}
				return i && o;
			}), M && D.log("[Tracing] flushing IdleTransaction");
		} else M && D.log("[Tracing] No active IdleTransaction");
		if (this._onScope) {
			let e = this._idleHub.getScope();
			e.getTransaction() === this && e.setSpan(void 0);
		}
		return super.end(e);
	}
	registerBeforeFinishCallback(e) {
		this._beforeFinishCallbacks.push(e);
	}
	initSpanRecorder(e) {
		if (!this.spanRecorder) {
			let t = (e) => {
				this._finished || this._pushActivity(e);
			}, n = (e) => {
				this._finished || this._popActivity(e);
			};
			this.spanRecorder = new pa(t, n, this.spanContext().spanId, e), M && D.log("Starting heartbeat"), this._pingHeartbeat();
		}
		this.spanRecorder.add(this);
	}
	cancelIdleTimeout(e, { restartOnChildSpanChange: t } = { restartOnChildSpanChange: !0 }) {
		this._idleTimeoutCanceledPermanently = t === !1, this._idleTimeoutID && (clearTimeout(this._idleTimeoutID), this._idleTimeoutID = void 0, Object.keys(this.activities).length === 0 && this._idleTimeoutCanceledPermanently && (this._finishReason = fa[5], this.end(e)));
	}
	setFinishReason(e) {
		this._finishReason = e;
	}
	sendAutoFinishSignal() {
		this._autoFinishAllowed ||= (M && D.log("[Tracing] Received finish signal for idle transaction."), this._restartIdleTimeout(), !0);
	}
	_restartIdleTimeout(e) {
		this.cancelIdleTimeout(), this._idleTimeoutID = setTimeout(() => {
			!this._finished && Object.keys(this.activities).length === 0 && (this._finishReason = fa[1], this.end(e));
		}, this._idleTimeout);
	}
	_pushActivity(e) {
		this.cancelIdleTimeout(void 0, { restartOnChildSpanChange: !this._idleTimeoutCanceledPermanently }), M && D.log(`[Tracing] pushActivity: ${e}`), this.activities[e] = !0, M && D.log("[Tracing] new activities count", Object.keys(this.activities).length);
	}
	_popActivity(e) {
		if (this.activities[e] && (M && D.log(`[Tracing] popActivity ${e}`), delete this.activities[e], M && D.log("[Tracing] new activities count", Object.keys(this.activities).length)), Object.keys(this.activities).length === 0) {
			let e = Cn();
			this._idleTimeoutCanceledPermanently ? this._autoFinishAllowed && (this._finishReason = fa[5], this.end(e)) : this._restartIdleTimeout(e + this._idleTimeout / 1e3);
		}
	}
	_beat() {
		if (this._finished) return;
		let e = Object.keys(this.activities).join("");
		e === this._prevHeartbeatString ? this._heartbeatCounter++ : this._heartbeatCounter = 1, this._prevHeartbeatString = e, this._heartbeatCounter >= 3 ? this._autoFinishAllowed && (M && D.log("[Tracing] Transaction finished because of no change for 3 heart beats"), this.setStatus("deadline_exceeded"), this._finishReason = fa[0], this.end()) : this._pingHeartbeat();
	}
	_pingHeartbeat() {
		M && D.log(`pinging Heartbeat -> current counter: ${this._heartbeatCounter}`), setTimeout(() => {
			this._beat();
		}, this._heartbeatInterval);
	}
};
//#endregion
//#region node_modules/@sentry/core/esm/tracing/sampling.js
function ha(e, t, n) {
	if (!zi(t)) return e.sampled = !1, e;
	if (e.sampled !== void 0) return e.setAttribute(ra, Number(e.sampled)), e;
	let r;
	return typeof t.tracesSampler == "function" ? (r = t.tracesSampler(n), e.setAttribute(ra, Number(r))) : n.parentSampled === void 0 ? t.tracesSampleRate === void 0 ? (r = 1, e.setAttribute(ra, r)) : (r = t.tracesSampleRate, e.setAttribute(ra, Number(r))) : r = n.parentSampled, ga(r) ? r ? (e.sampled = Math.random() < r, e.sampled ? (M && D.log(`[Tracing] starting ${e.op} transaction - ${N(e).description}`), e) : (M && D.log(`[Tracing] Discarding transaction because it's not included in the random sample (sampling rate = ${Number(r)})`), e)) : (M && D.log(`[Tracing] Discarding transaction because ${typeof t.tracesSampler == "function" ? "tracesSampler returned 0 or false" : "a negative sampling decision was inherited or tracesSampleRate is set to 0"}`), e.sampled = !1, e) : (M && D.warn("[Tracing] Discarding transaction because of invalid sample rate."), e.sampled = !1, e);
}
function ga(e) {
	return _(e) || !(typeof e == "number" || typeof e == "boolean") ? (M && D.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e)} of type ${JSON.stringify(typeof e)}.`), !1) : e < 0 || e > 1 ? (M && D.warn(`[Tracing] Given sample rate is invalid. Sample rate must be between 0 and 1. Got ${e}.`), !1) : !0;
}
//#endregion
//#region node_modules/@sentry/core/esm/tracing/hubextensions.js
function _a() {
	let e = this.getScope().getSpan();
	return e ? { "sentry-trace": mr(e) } : {};
}
function va(e, t) {
	let n = this.getClient(), r = n && n.getOptions() || {}, i = r.instrumenter || "sentry", a = e.instrumenter || "sentry";
	i !== a && (M && D.error(`A transaction was started with instrumenter=\`${a}\`, but the SDK is configured with the \`${i}\` instrumenter.
The transaction will not be sampled. Please use the ${i} instrumentation to start transactions.`), e.sampled = !1);
	let o = new la(e, this);
	return o = ha(o, r, {
		name: e.name,
		parentSampled: e.parentSampled,
		transactionContext: e,
		attributes: {
			...e.data,
			...e.attributes
		},
		...t
	}), o.isRecording() && o.initSpanRecorder(r._experiments && r._experiments.maxSpans), n && n.emit && n.emit("startTransaction", o), o;
}
function ya(e, t, n, r, i, a, o, s = !1) {
	let c = e.getClient(), l = c && c.getOptions() || {}, u = new ma(t, e, n, r, o, i, s);
	return u = ha(u, l, {
		name: t.name,
		parentSampled: t.parentSampled,
		transactionContext: t,
		attributes: {
			...t.data,
			...t.attributes
		},
		...a
	}), u.isRecording() && u.initSpanRecorder(l._experiments && l._experiments.maxSpans), c && c.emit && c.emit("startTransaction", u), u;
}
function ba() {
	let e = bi();
	e.__SENTRY__ && (e.__SENTRY__.extensions = e.__SENTRY__.extensions || {}, e.__SENTRY__.extensions.startTransaction || (e.__SENTRY__.extensions.startTransaction = va), e.__SENTRY__.extensions.traceHeaders || (e.__SENTRY__.extensions.traceHeaders = _a), ji());
}
//#endregion
//#region node_modules/@sentry/core/esm/tracing/measurement.js
function xa(e, t, n) {
	let r = Oi();
	r && r.setMeasurement(e, t, n);
}
//#endregion
//#region node_modules/@sentry/core/esm/envelope.js
function Sa(e, t) {
	return t ? (e.sdk = e.sdk || {}, e.sdk.name = e.sdk.name || t.name, e.sdk.version = e.sdk.version || t.version, e.sdk.integrations = [...e.sdk.integrations || [], ...t.integrations || []], e.sdk.packages = [...e.sdk.packages || [], ...t.packages || []], e) : e;
}
function Ca(e, t, n, r) {
	let i = qn(n);
	return In({
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...i && { sdk: i },
		...!!r && t && { dsn: Se(t) }
	}, ["aggregates" in e ? [{ type: "sessions" }, e] : [{ type: "session" }, e.toJSON()]]);
}
function wa(e, t, n, r) {
	let i = qn(n), a = e.type && e.type !== "replay_event" ? e.type : "event";
	Sa(e, n && n.sdk);
	let o = Jn(e, i, r, t);
	return delete e.sdkProcessingMetadata, In(o, [[{ type: a }, e]]);
}
//#endregion
//#region node_modules/@sentry/core/esm/api.js
var Ta = "7";
function Ea(e) {
	let t = e.protocol ? `${e.protocol}:` : "", n = e.port ? `:${e.port}` : "";
	return `${t}//${e.host}${n}${e.path ? `/${e.path}` : ""}/api/`;
}
function Da(e) {
	return `${Ea(e)}${e.projectId}/envelope/`;
}
function Oa(e, t) {
	return je({
		sentry_key: e.publicKey,
		sentry_version: Ta,
		...t && { sentry_client: `${t.name}/${t.version}` }
	});
}
function ka(e, t = {}) {
	let n = typeof t == "string" ? t : t.tunnel, r = typeof t == "string" || !t._metadata ? void 0 : t._metadata.sdk;
	return n || `${Da(e)}?${Oa(e, r)}`;
}
function Aa(e, t) {
	let n = Ee(e);
	if (!n) return "";
	let r = `${Ea(n)}embed/error-page/`, i = `dsn=${Se(n)}`;
	for (let e in t) if (e !== "dsn" && e !== "onClose") if (e === "user") {
		let e = t.user;
		if (!e) continue;
		e.name && (i += `&name=${encodeURIComponent(e.name)}`), e.email && (i += `&email=${encodeURIComponent(e.email)}`);
	} else i += `&${encodeURIComponent(e)}=${encodeURIComponent(t[e])}`;
	return `${r}?${i}`;
}
//#endregion
//#region node_modules/@sentry/core/esm/integration.js
var ja = [];
function Ma(e) {
	let t = {};
	return e.forEach((e) => {
		let { name: n } = e, r = t[n];
		r && !r.isDefaultInstance && e.isDefaultInstance || (t[n] = e);
	}), Object.keys(t).map((e) => t[e]);
}
function Na(e) {
	let t = e.defaultIntegrations || [], n = e.integrations;
	t.forEach((e) => {
		e.isDefaultInstance = !0;
	});
	let r;
	r = Array.isArray(n) ? [...t, ...n] : typeof n == "function" ? at(n(t)) : t;
	let i = Ma(r), a = Ra(i, (e) => e.name === "Debug");
	if (a !== -1) {
		let [e] = i.splice(a, 1);
		i.push(e);
	}
	return i;
}
function Pa(e, t) {
	let n = {};
	return t.forEach((t) => {
		t && Ia(e, t, n);
	}), n;
}
function Fa(e, t) {
	for (let n of t) n && n.afterAllSetup && n.afterAllSetup(e);
}
function Ia(e, t, n) {
	if (n[t.name]) {
		M && D.log(`Integration skipped because it was already installed: ${t.name}`);
		return;
	}
	if (n[t.name] = t, ja.indexOf(t.name) === -1 && (t.setupOnce(sr, I), ja.push(t.name)), t.setup && typeof t.setup == "function" && t.setup(e), e.on && typeof t.preprocessEvent == "function") {
		let n = t.preprocessEvent.bind(t);
		e.on("preprocessEvent", (t, r) => n(t, r, e));
	}
	if (e.addEventProcessor && typeof t.processEvent == "function") {
		let n = t.processEvent.bind(t), r = (t, r) => n(t, r, e);
		r.id = t.name, e.addEventProcessor(r);
	}
	M && D.log(`Integration installed: ${t.name}`);
}
function La(e) {
	let t = P();
	if (!t || !t.addIntegration) {
		M && D.warn(`Cannot add integration "${e.name}" because no SDK Client is available.`);
		return;
	}
	t.addIntegration(e);
}
function Ra(e, t) {
	for (let n = 0; n < e.length; n++) if (t(e[n]) === !0) return n;
	return -1;
}
function L(e, t) {
	let n = function(...e) {
		return t(...e);
	};
	return n.id = e, n;
}
function R(e) {
	return e;
}
//#endregion
//#region node_modules/@sentry/core/esm/metrics/utils.js
function za(e, t, n, r) {
	return `${e}${t}${n}${Object.entries(k(r)).sort((e, t) => e[0].localeCompare(t[0]))}`;
}
function Ba(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		t = (t << 5) - t + r, t &= t;
	}
	return t >>> 0;
}
function Va(e) {
	let t = "";
	for (let n of e) {
		let e = Object.entries(n.tags), r = e.length > 0 ? `|#${e.map(([e, t]) => `${e}:${t}`).join(",")}` : "";
		t += `${n.name}@${n.unit}:${n.metric}|${n.metricType}${r}|T${n.timestamp}\n`;
	}
	return t;
}
function Ha(e) {
	return e.replace(/[^\w]+/gi, "_");
}
function Ua(e) {
	return e.replace(/[^\w\-.]+/gi, "_");
}
function Wa(e) {
	return e.replace(/[^\w\-./]+/gi, "");
}
var Ga = [
	["\n", "\\n"],
	["\r", "\\r"],
	["	", "\\t"],
	["\\", "\\\\"],
	["|", "\\u{7c}"],
	[",", "\\u{2c}"]
];
function Ka(e) {
	for (let [t, n] of Ga) if (e === t) return n;
	return e;
}
function qa(e) {
	return [...e].reduce((e, t) => e + Ka(t), "");
}
function Ja(e) {
	let t = {};
	for (let n in e) if (Object.prototype.hasOwnProperty.call(e, n)) {
		let r = Wa(n);
		t[r] = qa(String(e[n]));
	}
	return t;
}
//#endregion
//#region node_modules/@sentry/core/esm/metrics/envelope.js
function Ya(e, t, n, r) {
	let i = { sent_at: (/* @__PURE__ */ new Date()).toISOString() };
	return n && n.sdk && (i.sdk = {
		name: n.sdk.name,
		version: n.sdk.version
	}), r && t && (i.dsn = Se(t)), In(i, [Xa(e)]);
}
function Xa(e) {
	let t = Va(e);
	return [{
		type: "statsd",
		length: t.length
	}, t];
}
//#endregion
//#region node_modules/@sentry/core/esm/baseclient.js
var Za = "Not capturing exception because it's already been captured.", Qa = class {
	constructor(e) {
		if (this._options = e, this._integrations = {}, this._integrationsInitialized = !1, this._numProcessing = 0, this._outcomes = {}, this._hooks = {}, this._eventProcessors = [], e.dsn ? this._dsn = Ee(e.dsn) : M && D.warn("No DSN provided, client will not send events."), this._dsn) {
			let t = ka(this._dsn, e);
			this._transport = e.transport({
				tunnel: this._options.tunnel,
				recordDroppedEvent: this.recordDroppedEvent.bind(this),
				...e.transportOptions,
				url: t
			});
		}
	}
	captureException(e, t, n) {
		if (it(e)) {
			M && D.log(Za);
			return;
		}
		let r = t && t.event_id;
		return this._process(this.eventFromException(e, t).then((e) => this._captureEvent(e, t, n)).then((e) => {
			r = e;
		})), r;
	}
	captureMessage(e, t, n, r) {
		let i = n && n.event_id, a = l(e) ? e : String(e), o = u(e) ? this.eventFromMessage(a, t, n) : this.eventFromException(e, n);
		return this._process(o.then((e) => this._captureEvent(e, n, r)).then((e) => {
			i = e;
		})), i;
	}
	captureEvent(e, t, n) {
		if (t && t.originalException && it(t.originalException)) {
			M && D.log(Za);
			return;
		}
		let r = t && t.event_id, i = (e.sdkProcessingMetadata || {}).capturedSpanScope;
		return this._process(this._captureEvent(e, t, i || n).then((e) => {
			r = e;
		})), r;
	}
	captureSession(e) {
		typeof e.release == "string" ? (this.sendSession(e), ur(e, { init: !1 })) : M && D.warn("Discarded session because of missing or non-string release");
	}
	getDsn() {
		return this._dsn;
	}
	getOptions() {
		return this._options;
	}
	getSdkMetadata() {
		return this._options._metadata;
	}
	getTransport() {
		return this._transport;
	}
	flush(e) {
		let t = this._transport;
		return t ? (this.metricsAggregator && this.metricsAggregator.flush(), this._isClientDoneProcessing(e).then((n) => t.flush(e).then((e) => n && e))) : fn(!0);
	}
	close(e) {
		return this.flush(e).then((e) => (this.getOptions().enabled = !1, this.metricsAggregator && this.metricsAggregator.close(), e));
	}
	getEventProcessors() {
		return this._eventProcessors;
	}
	addEventProcessor(e) {
		this._eventProcessors.push(e);
	}
	setupIntegrations(e) {
		(e && !this._integrationsInitialized || this._isEnabled() && !this._integrationsInitialized) && this._setupIntegrations();
	}
	init() {
		this._isEnabled() && this._setupIntegrations();
	}
	getIntegrationById(e) {
		return this.getIntegrationByName(e);
	}
	getIntegrationByName(e) {
		return this._integrations[e];
	}
	getIntegration(e) {
		try {
			return this._integrations[e.id] || null;
		} catch {
			return M && D.warn(`Cannot retrieve integration ${e.id} from the current Client`), null;
		}
	}
	addIntegration(e) {
		let t = this._integrations[e.name];
		Ia(this, e, this._integrations), t || Fa(this, [e]);
	}
	sendEvent(e, t = {}) {
		this.emit("beforeSendEvent", e, t);
		let n = wa(e, this._dsn, this._options._metadata, this._options.tunnel);
		for (let e of t.attachments || []) n = Ln(n, Wn(e, this._options.transportOptions && this._options.transportOptions.textEncoder));
		let r = this._sendEnvelope(n);
		r && r.then((t) => this.emit("afterSendEvent", e, t), null);
	}
	sendSession(e) {
		let t = Ca(e, this._dsn, this._options._metadata, this._options.tunnel);
		this._sendEnvelope(t);
	}
	recordDroppedEvent(e, t, n) {
		if (this._options.sendClientReports) {
			let r = typeof n == "number" ? n : 1, i = `${e}:${t}`;
			M && D.log(`Recording outcome: "${i}"${r > 1 ? ` (${r} times)` : ""}`), this._outcomes[i] = (this._outcomes[i] || 0) + r;
		}
	}
	captureAggregateMetrics(e) {
		M && D.log(`Flushing aggregated metrics, number of metrics: ${e.length}`);
		let t = Ya(e, this._dsn, this._options._metadata, this._options.tunnel);
		this._sendEnvelope(t);
	}
	on(e, t) {
		this._hooks[e] || (this._hooks[e] = []), this._hooks[e].push(t);
	}
	emit(e, ...t) {
		this._hooks[e] && this._hooks[e].forEach((e) => e(...t));
	}
	_setupIntegrations() {
		let { integrations: e } = this._options;
		this._integrations = Pa(this, e), Fa(this, e), this._integrationsInitialized = !0;
	}
	_updateSessionFromEvent(e, t) {
		let n = !1, r = !1, i = t.exception && t.exception.values;
		if (i) {
			r = !0;
			for (let e of i) {
				let t = e.mechanism;
				if (t && t.handled === !1) {
					n = !0;
					break;
				}
			}
		}
		let a = e.status === "ok";
		(a && e.errors === 0 || a && n) && (ur(e, {
			...n && { status: "crashed" },
			errors: e.errors || Number(r || n)
		}), this.captureSession(e));
	}
	_isClientDoneProcessing(e) {
		return new mn((t) => {
			let n = 0, r = setInterval(() => {
				this._numProcessing == 0 ? (clearInterval(r), t(!0)) : (n += 1, e && n >= e && (clearInterval(r), t(!1)));
			}, 1);
		});
	}
	_isEnabled() {
		return this.getOptions().enabled !== !1 && this._transport !== void 0;
	}
	_prepareEvent(e, t, n, r = Si()) {
		let i = this.getOptions(), a = Object.keys(this._integrations);
		return !t.integrations && a.length > 0 && (t.integrations = a), this.emit("preprocessEvent", e, t), yr(i, e, t, n, this, r).then((e) => {
			if (e === null) return e;
			let t = {
				...r.getPropagationContext(),
				...n ? n.getPropagationContext() : void 0
			};
			if (!(e.contexts && e.contexts.trace) && t) {
				let { traceId: r, spanId: i, parentSpanId: a, dsc: o } = t;
				e.contexts = {
					trace: {
						trace_id: r,
						span_id: i,
						parent_span_id: a
					},
					...e.contexts
				}, e.sdkProcessingMetadata = {
					dynamicSamplingContext: o || ti(r, this, n),
					...e.sdkProcessingMetadata
				};
			}
			return e;
		});
	}
	_captureEvent(e, t = {}, n) {
		return this._processEvent(e, t, n).then((e) => e.event_id, (e) => {
			if (M) {
				let t = e;
				t.logLevel === "log" ? D.log(t.message) : D.warn(t);
			}
		});
	}
	_processEvent(e, t, n) {
		let r = this.getOptions(), { sampleRate: i } = r, a = no(e), o = to(e), s = e.type || "error", c = `before send for type \`${s}\``;
		if (o && typeof i == "number" && Math.random() > i) return this.recordDroppedEvent("sample_rate", "error", e), pn(new De(`Discarding event because it's not included in the random sample (sampling rate = ${i})`, "log"));
		let l = s === "replay_event" ? "replay" : s, u = (e.sdkProcessingMetadata || {}).capturedSpanIsolationScope;
		return this._prepareEvent(e, t, n, u).then((n) => {
			if (n === null) throw this.recordDroppedEvent("event_processor", l, e), new De("An event processor returned `null`, will not send event.", "log");
			return t.data && t.data.__sentry__ === !0 ? n : $a(eo(r, n, t), c);
		}).then((r) => {
			if (r === null) {
				if (this.recordDroppedEvent("before_send", l, e), a) {
					let t = 1 + (e.spans || []).length;
					this.recordDroppedEvent("before_send", "span", t);
				}
				throw new De(`${c} returned \`null\`, will not send event.`, "log");
			}
			let i = n && n.getSession();
			if (!a && i && this._updateSessionFromEvent(i, r), a) {
				let e = (r.sdkProcessingMetadata && r.sdkProcessingMetadata.spanCountBeforeProcessing || 0) - (r.spans ? r.spans.length : 0);
				e > 0 && this.recordDroppedEvent("before_send", "span", e);
			}
			let o = r.transaction_info;
			return a && o && r.transaction !== e.transaction && (r.transaction_info = {
				...o,
				source: "custom"
			}), this.sendEvent(r, t), r;
		}).then(null, (e) => {
			throw e instanceof De ? e : (this.captureException(e, {
				data: { __sentry__: !0 },
				originalException: e
			}), new De(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${e}`));
		});
	}
	_process(e) {
		this._numProcessing++, e.then((e) => (this._numProcessing--, e), (e) => (this._numProcessing--, e));
	}
	_sendEnvelope(e) {
		if (this.emit("beforeEnvelope", e), this._isEnabled() && this._transport) return this._transport.send(e).then(null, (e) => {
			M && D.error("Error while sending event:", e);
		});
		M && D.error("Transport disabled");
	}
	_clearOutcomes() {
		let e = this._outcomes;
		return this._outcomes = {}, Object.keys(e).map((t) => {
			let [n, r] = t.split(":");
			return {
				reason: n,
				category: r,
				quantity: e[t]
			};
		});
	}
};
function $a(e, t) {
	let n = `${t} must return \`null\` or a valid event.`;
	if (h(e)) return e.then((e) => {
		if (!d(e) && e !== null) throw new De(n);
		return e;
	}, (e) => {
		throw new De(`${t} rejected with ${e}`);
	});
	if (!d(e) && e !== null) throw new De(n);
	return e;
}
function eo(e, t, n) {
	let { beforeSend: r, beforeSendTransaction: i } = e;
	if (to(t) && r) return r(t, n);
	if (no(t) && i) {
		if (t.spans) {
			let e = t.spans.length;
			t.sdkProcessingMetadata = {
				...t.sdkProcessingMetadata,
				spanCountBeforeProcessing: e
			};
		}
		return i(t, n);
	}
	return t;
}
function to(e) {
	return e.type === void 0;
}
function no(e) {
	return e.type === "transaction";
}
function ro(e) {
	let t = P();
	!t || !t.addEventProcessor || t.addEventProcessor(e);
}
//#endregion
//#region node_modules/@sentry/core/esm/metrics/constants.js
var io = 5e3, ao = {
	c: class {
		constructor(e) {
			this._value = e;
		}
		get weight() {
			return 1;
		}
		add(e) {
			this._value += e;
		}
		toString() {
			return `${this._value}`;
		}
	},
	g: class {
		constructor(e) {
			this._last = e, this._min = e, this._max = e, this._sum = e, this._count = 1;
		}
		get weight() {
			return 5;
		}
		add(e) {
			this._last = e, e < this._min && (this._min = e), e > this._max && (this._max = e), this._sum += e, this._count++;
		}
		toString() {
			return `${this._last}:${this._min}:${this._max}:${this._sum}:${this._count}`;
		}
	},
	d: class {
		constructor(e) {
			this._value = [e];
		}
		get weight() {
			return this._value.length;
		}
		add(e) {
			this._value.push(e);
		}
		toString() {
			return this._value.join(":");
		}
	},
	s: class {
		constructor(e) {
			this.first = e, this._value = /* @__PURE__ */ new Set([e]);
		}
		get weight() {
			return this._value.size;
		}
		add(e) {
			this._value.add(e);
		}
		toString() {
			return Array.from(this._value).map((e) => typeof e == "string" ? Ba(e) : e).join(":");
		}
	}
};
//#endregion
//#region node_modules/@sentry/core/esm/sdk.js
function oo(e, t) {
	t.debug === !0 && (M ? D.enable() : ve(() => {
		console.warn("[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.");
	})), F().update(t.initialScope);
	let n = new e(t);
	so(n), co(n);
}
function so(e) {
	let t = I().getStackTop();
	t.client = e, t.scope.setClient(e);
}
function co(e) {
	e.init ? e.init() : e.setupIntegrations && e.setupIntegrations();
}
function lo(e, t, n = hn(e.bufferSize || 30)) {
	let r = {}, i = (e) => n.drain(e);
	function a(i) {
		let a = [];
		if (Rn(i, (t, n) => {
			let i = Kn(n);
			if ($n(r, i)) {
				let r = uo(t, n);
				e.recordDroppedEvent("ratelimit_backoff", i, r);
			} else a.push(t);
		}), a.length === 0) return fn();
		let o = In(i[0], a), s = (t) => {
			Rn(o, (n, r) => {
				let i = uo(n, r);
				e.recordDroppedEvent(t, Kn(r), i);
			});
		};
		return n.add(() => t({ body: Vn(o, e.textEncoder) }).then((e) => (e.statusCode !== void 0 && (e.statusCode < 200 || e.statusCode >= 300) && M && D.warn(`Sentry responded with status code ${e.statusCode} to sent event.`), r = er(r, e), e), (e) => {
			throw s("network_error"), e;
		})).then((e) => e, (e) => {
			if (e instanceof De) return M && D.error("Skipped sending event because buffer is full."), s("queue_overflow"), fn();
			throw e;
		});
	}
	return a.__sentry__baseTransport__ = !0, {
		send: a,
		flush: i
	};
}
function uo(e, t) {
	if (!(t !== "event" && t !== "transaction")) return Array.isArray(e) ? e[1] : void 0;
}
var fo = 5e3, po = 36e5;
function mo(e, t) {
	M && D.info(`[Offline]: ${e}`, t);
}
function ho(e) {
	return (t) => {
		let n = e(t), r = t.createStore ? t.createStore(t) : void 0, i = fo, a;
		function o(e, n, r) {
			return zn(e, [
				"replay_event",
				"replay_recording",
				"client_report"
			]) ? !1 : !t.shouldStore || t.shouldStore(e, n, r);
		}
		function s(e) {
			r && (a && clearTimeout(a), a = setTimeout(async () => {
				a = void 0;
				let e = await r.pop();
				e && (mo("Attempting to send previously queued event"), l(e).catch((e) => {
					mo("Failed to retry sending", e);
				}));
			}, e), typeof a != "number" && a.unref && a.unref());
		}
		function c() {
			a || (s(i), i = Math.min(i * 2, po));
		}
		async function l(e) {
			try {
				let t = await n.send(e), r = 100;
				if (t) {
					if (t.headers && t.headers["retry-after"]) r = Zn(t.headers["retry-after"]);
					else if ((t.statusCode || 0) >= 400) return t;
				}
				return s(r), i = fo, t;
			} catch (t) {
				if (r && await o(e, t, i)) return await r.insert(e), c(), mo("Error sending. Event queued", t), {};
				throw t;
			}
		}
		return t.flushAtStartup && c(), {
			send: l,
			flush: (e) => n.flush(e)
		};
	};
}
//#endregion
//#region node_modules/@sentry/core/esm/transports/multiplexed.js
function go(e, t) {
	let n;
	return Rn(e, (e, r) => (t.includes(r) && (n = Array.isArray(e) ? e[1] : void 0), !!n)), n;
}
function _o(e, t) {
	return (n) => {
		let r = e(n);
		return {
			...r,
			send: async (e) => {
				let n = go(e, [
					"event",
					"transaction",
					"profile",
					"replay_event"
				]);
				return n && (n.release = t), r.send(e);
			}
		};
	};
}
function vo(e, t) {
	return In(t ? {
		...e[0],
		dsn: t
	} : e[0], e[1]);
}
function yo(e, t) {
	return (n) => {
		let r = e(n), i = /* @__PURE__ */ new Map();
		function a(t, r) {
			let a = r ? `${t}:${r}` : t, o = i.get(a);
			if (!o) {
				let s = Ce(t);
				if (!s) return;
				let c = ka(s, n.tunnel);
				o = r ? _o(e, r)({
					...n,
					url: c
				}) : e({
					...n,
					url: c
				}), i.set(a, o);
			}
			return [t, o];
		}
		async function o(e) {
			function n(t) {
				return go(e, t && t.length ? t : ["event"]);
			}
			let i = t({
				envelope: e,
				getEvent: n
			}).map((e) => typeof e == "string" ? a(e, void 0) : a(e.dsn, e.release)).filter((e) => !!e);
			return i.length === 0 && i.push(["", r]), (await Promise.all(i.map(([t, n]) => n.send(vo(e, t)))))[0];
		}
		async function s(e) {
			let t = [await r.flush(e)];
			for (let [, n] of i) t.push(await n.flush(e));
			return t.every((e) => e);
		}
		return {
			send: o,
			flush: s
		};
	};
}
//#endregion
//#region node_modules/@sentry/core/esm/span.js
function bo(e, t) {
	let n = { sent_at: (/* @__PURE__ */ new Date()).toISOString() };
	return t && (n.dsn = Se(t)), In(n, e.map(xo));
}
function xo(e) {
	return [{ type: "span" }, e];
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/isSentryRequestUrl.js
function So(e, t) {
	let n = t && Eo(t) ? t.getClient() : t, r = n && n.getDsn(), i = n && n.getOptions().tunnel;
	return wo(e, r) || Co(e, i);
}
function Co(e, t) {
	return t ? To(e) === To(t) : !1;
}
function wo(e, t) {
	return t ? e.includes(t.host) : !1;
}
function To(e) {
	return e[e.length - 1] === "/" ? e.slice(0, -1) : e;
}
function Eo(e) {
	return e.getClient !== void 0;
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/parameterize.js
function Do(e, ...t) {
	let n = new String(String.raw(e, ...t));
	return n.__sentry_template_string__ = e.join("\0").replace(/%/g, "%%").replace(/\0/g, "%s"), n.__sentry_template_values__ = t, n;
}
//#endregion
//#region node_modules/@sentry/core/esm/utils/sdkMetadata.js
function Oo(e, t, n = [t], r = "npm") {
	let i = e._metadata || {};
	i.sdk ||= {
		name: `sentry.javascript.${t}`,
		packages: n.map((e) => ({
			name: `${r}:@sentry/${e}`,
			version: gi
		})),
		version: gi
	}, e._metadata = i;
}
//#endregion
//#region node_modules/@sentry/core/esm/metadata.js
var ko = /* @__PURE__ */ new Map(), Ao = /* @__PURE__ */ new Set();
function jo(e) {
	if (T._sentryModuleMetadata) for (let t of Object.keys(T._sentryModuleMetadata)) {
		let n = T._sentryModuleMetadata[t];
		if (Ao.has(t)) continue;
		Ao.add(t);
		let r = e(t);
		for (let e of r.reverse()) if (e.filename) {
			ko.set(e.filename, n);
			break;
		}
	}
}
function Mo(e, t) {
	return jo(e), ko.get(t);
}
function No(e, t) {
	try {
		t.exception.values.forEach((t) => {
			if (t.stacktrace) for (let n of t.stacktrace.frames || []) {
				if (!n.filename) continue;
				let t = Mo(e, n.filename);
				t && (n.module_metadata = t);
			}
		});
	} catch {}
}
function Po(e) {
	try {
		e.exception.values.forEach((e) => {
			if (e.stacktrace) for (let t of e.stacktrace.frames || []) delete t.module_metadata;
		});
	} catch {}
}
//#endregion
//#region node_modules/@sentry/core/esm/integrations/metadata.js
var Fo = "ModuleMetadata", Io = R((() => ({
	name: Fo,
	setupOnce() {},
	setup(e) {
		typeof e.on == "function" && e.on("beforeEnvelope", (e) => {
			Rn(e, (e, t) => {
				if (t === "event") {
					let t = Array.isArray(e) ? e[1] : void 0;
					t && (Po(t), e[1] = t);
				}
			});
		});
	},
	processEvent(e, t, n) {
		let r = n.getOptions().stackParser;
		return No(r, e), e;
	}
}))), Lo = L(Fo, Io), Ro = [
	/^Script error\.?$/,
	/^Javascript error: Script error\.? on line 0$/,
	/^ResizeObserver loop completed with undelivered notifications.$/,
	/^Cannot redefine property: googletag$/
], zo = [
	/^.*\/healthcheck$/,
	/^.*\/healthy$/,
	/^.*\/live$/,
	/^.*\/ready$/,
	/^.*\/heartbeat$/,
	/^.*\/health$/,
	/^.*\/healthz$/
], Bo = "InboundFilters", Vo = R(((e = {}) => ({
	name: Bo,
	setupOnce() {},
	processEvent(t, n, r) {
		return Wo(t, Uo(e, r.getOptions())) ? null : t;
	}
}))), Ho = L(Bo, Vo);
function Uo(e = {}, t = {}) {
	return {
		allowUrls: [...e.allowUrls || [], ...t.allowUrls || []],
		denyUrls: [...e.denyUrls || [], ...t.denyUrls || []],
		ignoreErrors: [
			...e.ignoreErrors || [],
			...t.ignoreErrors || [],
			...e.disableErrorDefaults ? [] : Ro
		],
		ignoreTransactions: [
			...e.ignoreTransactions || [],
			...t.ignoreTransactions || [],
			...e.disableTransactionDefaults ? [] : zo
		],
		ignoreInternal: e.ignoreInternal === void 0 || e.ignoreInternal
	};
}
function Wo(e, t) {
	return t.ignoreInternal && Xo(e) ? (M && D.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${et(e)}`), !0) : Go(e, t.ignoreErrors) ? (M && D.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${et(e)}`), !0) : Ko(e, t.ignoreTransactions) ? (M && D.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${et(e)}`), !0) : qo(e, t.denyUrls) ? (M && D.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${et(e)}.\nUrl: ${Qo(e)}`), !0) : Jo(e, t.allowUrls) ? !1 : (M && D.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${et(e)}.\nUrl: ${Qo(e)}`), !0);
}
function Go(e, t) {
	return e.type || !t || !t.length ? !1 : Yo(e).some((e) => w(e, t));
}
function Ko(e, t) {
	if (e.type !== "transaction" || !t || !t.length) return !1;
	let n = e.transaction;
	return n ? w(n, t) : !1;
}
function qo(e, t) {
	if (!t || !t.length) return !1;
	let n = Qo(e);
	return n ? w(n, t) : !1;
}
function Jo(e, t) {
	if (!t || !t.length) return !0;
	let n = Qo(e);
	return !n || w(n, t);
}
function Yo(e) {
	let t = [];
	e.message && t.push(e.message);
	let n;
	try {
		n = e.exception.values[e.exception.values.length - 1];
	} catch {}
	return n && n.value && (t.push(n.value), n.type && t.push(`${n.type}: ${n.value}`)), M && t.length === 0 && D.error(`Could not extract message for event ${et(e)}`), t;
}
function Xo(e) {
	try {
		return e.exception.values[0].type === "SentryError";
	} catch {}
	return !1;
}
function Zo(e = []) {
	for (let t = e.length - 1; t >= 0; t--) {
		let n = e[t];
		if (n && n.filename !== "<anonymous>" && n.filename !== "[native code]") return n.filename || null;
	}
	return null;
}
function Qo(e) {
	try {
		let t;
		try {
			t = e.exception.values[0].stacktrace.frames;
		} catch {}
		return t ? Zo(t) : null;
	} catch {
		return M && D.error(`Cannot extract url for event ${et(e)}`), null;
	}
}
//#endregion
//#region node_modules/@sentry/core/esm/integrations/functiontostring.js
var $o, es = "FunctionToString", ts = /* @__PURE__ */ new WeakMap(), ns = R((() => ({
	name: es,
	setupOnce() {
		$o = Function.prototype.toString;
		try {
			Function.prototype.toString = function(...e) {
				let t = Ae(this), n = ts.has(P()) && t !== void 0 ? t : this;
				return $o.apply(n, e);
			};
		} catch {}
	},
	setup(e) {
		ts.set(e, !0);
	}
}))), rs = L(es, ns), is = "cause", as = 5, os = "LinkedErrors", ss = L(os, R(((e = {}) => {
	let t = e.limit || as, n = e.key || is;
	return {
		name: os,
		setupOnce() {},
		preprocessEvent(e, r, i) {
			let a = i.getOptions();
			ee(nr, a.stackParser, a.maxValueLength, n, t, e, r);
		}
	};
}))), cs = /* @__PURE__ */ t({
	FunctionToString: () => rs,
	InboundFilters: () => Ho,
	LinkedErrors: () => ss
}), ls = class {
	constructor(e) {
		this._client = e, this._buckets = /* @__PURE__ */ new Map(), this._interval = setInterval(() => this.flush(), io);
	}
	add(e, t, n, r = "none", i = {}, a = Cn()) {
		let o = Math.floor(a), s = Ua(t), c = Ja(i), l = Ha(r), u = za(e, s, l, c), d = this._buckets.get(u), f = d && e === "s" ? d.metric.weight : 0;
		d ? (d.metric.add(n), d.timestamp < o && (d.timestamp = o)) : (d = {
			metric: new ao[e](n),
			timestamp: o,
			metricType: e,
			name: s,
			unit: l,
			tags: c
		}, this._buckets.set(u, d)), ta(e, s, typeof n == "string" ? d.metric.weight - f : n, l, i, u);
	}
	flush() {
		if (this._buckets.size !== 0) {
			if (this._client.captureAggregateMetrics) {
				let e = Array.from(this._buckets).map(([, e]) => e);
				this._client.captureAggregateMetrics(e);
			}
			this._buckets.clear();
		}
	}
	close() {
		clearInterval(this._interval), this.flush();
	}
}, us = "MetricsAggregator", ds = R((() => ({
	name: us,
	setupOnce() {},
	setup(e) {
		e.metricsAggregator = new ls(e);
	}
}))), fs = L(us, ds);
//#endregion
//#region node_modules/@sentry/core/esm/metrics/exports.js
function ps(e, t, n, r = {}) {
	let i = P(), a = F();
	if (i) {
		if (!i.metricsAggregator) {
			M && D.warn("No metrics aggregator enabled. Please add the MetricsAggregator integration to use metrics APIs");
			return;
		}
		let { unit: o, tags: s, timestamp: c } = r, { release: l, environment: u } = i.getOptions(), d = a.getTransaction(), f = {};
		l && (f.release = l), u && (f.environment = u), d && (f.transaction = N(d).description || ""), M && D.log(`Adding value of ${n} to ${e} metric ${t}`), i.metricsAggregator.add(e, t, n, o, {
			...f,
			...s
		}, c);
	}
}
function ms(e, t = 1, n) {
	ps("c", e, t, n);
}
function hs(e, t, n) {
	ps("d", e, t, n);
}
function gs(e, t, n) {
	ps("s", e, t, n);
}
function _s(e, t, n) {
	ps("g", e, t, n);
}
var vs = {
	increment: ms,
	distribution: hs,
	set: gs,
	gauge: _s,
	MetricsAggregator: fs,
	metricsAggregatorIntegration: ds
}, ys = cs, z = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, B = T;
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/backgroundtab.js
function bs() {
	B.document ? B.document.addEventListener("visibilitychange", () => {
		let e = Oi();
		if (B.document.hidden && e) {
			let t = "cancelled", { op: n, status: r } = N(e);
			z && D.log(`[Tracing] Transaction: ${t} -> since tab moved to the background, op: ${n}`), r || e.setStatus(t), e.setTag("visibilitychange", "document.hidden"), e.end();
		}
	}) : z && D.warn("[Tracing] Could not set up background tab detection due to lack of global document");
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/web-vitals/lib/bindReporter.js
var xs = (e, t, n) => {
	let r, i;
	return (a) => {
		t.value >= 0 && (a || n) && (i = t.value - (r || 0), (i || r === void 0) && (r = t.value, t.delta = i, e(t)));
	};
}, Ss = () => `v3-${Date.now()}-${Math.floor(Math.random() * 8999999999999) + 0xe8d4a51000}`, Cs = () => {
	let e = B.performance.timing, t = B.performance.navigation.type, n = {
		entryType: "navigation",
		startTime: 0,
		type: t == 2 ? "back_forward" : t === 1 ? "reload" : "navigate"
	};
	for (let t in e) t !== "navigationStart" && t !== "toJSON" && (n[t] = Math.max(e[t] - e.navigationStart, 0));
	return n;
}, ws = () => B.__WEB_VITALS_POLYFILL__ ? B.performance && (performance.getEntriesByType && performance.getEntriesByType("navigation")[0] || Cs()) : B.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0], Ts = () => {
	let e = ws();
	return e && e.activationStart || 0;
}, Es = (e, t) => {
	let n = ws(), r = "navigate";
	return n && (r = B.document && B.document.prerendering || Ts() > 0 ? "prerender" : n.type.replace(/_/g, "-")), {
		name: e,
		value: t === void 0 ? -1 : t,
		rating: "good",
		delta: 0,
		entries: [],
		id: Ss(),
		navigationType: r
	};
}, Ds = (e, t, n) => {
	try {
		if (PerformanceObserver.supportedEntryTypes.includes(e)) {
			let r = new PerformanceObserver((e) => {
				t(e.getEntries());
			});
			return r.observe({
				type: e,
				buffered: !0,
				...n
			}), r;
		}
	} catch {}
}, Os = (e, t) => {
	let n = (r) => {
		(r.type === "pagehide" || B.document.visibilityState === "hidden") && (e(r), t && (removeEventListener("visibilitychange", n, !0), removeEventListener("pagehide", n, !0)));
	};
	B.document && (addEventListener("visibilitychange", n, !0), addEventListener("pagehide", n, !0));
}, ks = (e, t = {}) => {
	let n = Es("CLS", 0), r, i = 0, a = [], o = (e) => {
		e.forEach((e) => {
			if (!e.hadRecentInput) {
				let t = a[0], o = a[a.length - 1];
				i && a.length !== 0 && e.startTime - o.startTime < 1e3 && e.startTime - t.startTime < 5e3 ? (i += e.value, a.push(e)) : (i = e.value, a = [e]), i > n.value && (n.value = i, n.entries = a, r && r());
			}
		});
	}, s = Ds("layout-shift", o);
	if (s) {
		r = xs(e, n, t.reportAllChanges);
		let i = () => {
			o(s.takeRecords()), r(!0);
		};
		return Os(i), i;
	}
}, As = -1, js = () => {
	B.document && B.document.visibilityState && (As = B.document.visibilityState === "hidden" && !B.document.prerendering ? 0 : Infinity);
}, Ms = () => {
	Os(({ timeStamp: e }) => {
		As = e;
	}, !0);
}, Ns = () => (As < 0 && (js(), Ms()), { get firstHiddenTime() {
	return As;
} }), Ps = (e) => {
	let t = Ns(), n = Es("FID"), r, i = (e) => {
		e.startTime < t.firstHiddenTime && (n.value = e.processingStart - e.startTime, n.entries.push(e), r(!0));
	}, a = (e) => {
		e.forEach(i);
	}, o = Ds("first-input", a);
	r = xs(e, n), o && Os(() => {
		a(o.takeRecords()), o.disconnect();
	}, !0);
}, Fs = 0, Is = Infinity, Ls = 0, Rs = (e) => {
	e.forEach((e) => {
		e.interactionId && (Is = Math.min(Is, e.interactionId), Ls = Math.max(Ls, e.interactionId), Fs = Ls ? (Ls - Is) / 7 + 1 : 0);
	});
}, zs, Bs = () => zs ? Fs : performance.interactionCount || 0, Vs = () => {
	"interactionCount" in performance || zs || (zs = Ds("event", Rs, {
		type: "event",
		buffered: !0,
		durationThreshold: 0
	}));
}, Hs = () => Bs(), Us = 10, Ws = [], Gs = {}, Ks = (e) => {
	let t = Ws[Ws.length - 1], n = Gs[e.interactionId];
	if (n || Ws.length < Us || e.duration > t.latency) {
		if (n) n.entries.push(e), n.latency = Math.max(n.latency, e.duration);
		else {
			let t = {
				id: e.interactionId,
				latency: e.duration,
				entries: [e]
			};
			Gs[t.id] = t, Ws.push(t);
		}
		Ws.sort((e, t) => t.latency - e.latency), Ws.splice(Us).forEach((e) => {
			delete Gs[e.id];
		});
	}
}, qs = () => Ws[Math.min(Ws.length - 1, Math.floor(Hs() / 50))], Js = (e, t) => {
	t ||= {}, Vs();
	let n = Es("INP"), r, i = (e) => {
		e.forEach((e) => {
			e.interactionId && Ks(e), e.entryType === "first-input" && (Ws.some((t) => t.entries.some((t) => e.duration === t.duration && e.startTime === t.startTime)) || Ks(e));
		});
		let t = qs();
		t && t.latency !== n.value && (n.value = t.latency, n.entries = t.entries, r());
	}, a = Ds("event", i, { durationThreshold: t.durationThreshold || 40 });
	r = xs(e, n, t.reportAllChanges), a && (a.observe({
		type: "first-input",
		buffered: !0
	}), Os(() => {
		i(a.takeRecords()), n.value < 0 && Hs() > 0 && (n.value = 0, n.entries = []), r(!0);
	}));
}, Ys = {}, Xs = (e) => {
	let t = Ns(), n = Es("LCP"), r, i = (e) => {
		let i = e[e.length - 1];
		if (i) {
			let e = Math.max(i.startTime - Ts(), 0);
			e < t.firstHiddenTime && (n.value = e, n.entries = [i], r());
		}
	}, a = Ds("largest-contentful-paint", i);
	if (a) {
		r = xs(e, n);
		let t = () => {
			Ys[n.id] || (i(a.takeRecords()), a.disconnect(), Ys[n.id] = !0, r(!0));
		};
		return ["keydown", "click"].forEach((e) => {
			B.document && addEventListener(e, t, {
				once: !0,
				capture: !0
			});
		}), Os(t, !0), t;
	}
}, Zs = (e) => {
	B.document && (B.document.prerendering ? addEventListener("prerenderingchange", () => Zs(e), !0) : B.document.readyState === "complete" ? setTimeout(e, 0) : addEventListener("load", () => Zs(e), !0));
}, Qs = (e, t) => {
	t ||= {};
	let n = Es("TTFB"), r = xs(e, n, t.reportAllChanges);
	Zs(() => {
		let e = ws();
		if (e) {
			if (n.value = Math.max(e.responseStart - Ts(), 0), n.value < 0 || n.value > performance.now()) return;
			n.entries = [e], r(!0);
		}
	});
}, $s = {}, ec = {}, tc, nc, rc, ic, ac;
function oc(e, t = !1) {
	return vc("cls", e, pc, tc, t);
}
function sc(e, t = !1) {
	return vc("lcp", e, hc, rc, t);
}
function cc(e) {
	return vc("ttfb", e, gc, ic);
}
function lc(e) {
	return vc("fid", e, mc, nc);
}
function uc(e) {
	return vc("inp", e, _c, ac);
}
function dc(e, t) {
	return bc(e, t), ec[e] || (yc(e), ec[e] = !0), xc(e, t);
}
function fc(e, t) {
	let n = $s[e];
	if (!(!n || !n.length)) for (let r of n) try {
		r(t);
	} catch (t) {
		z && D.error(`Error while triggering instrumentation handler.\nType: ${e}\nName: ${Ge(r)}\nError:`, t);
	}
}
function pc() {
	return ks((e) => {
		fc("cls", { metric: e }), tc = e;
	}, { reportAllChanges: !0 });
}
function mc() {
	return Ps((e) => {
		fc("fid", { metric: e }), nc = e;
	});
}
function hc() {
	return Xs((e) => {
		fc("lcp", { metric: e }), rc = e;
	});
}
function gc() {
	return Qs((e) => {
		fc("ttfb", { metric: e }), ic = e;
	});
}
function _c() {
	return Js((e) => {
		fc("inp", { metric: e }), ac = e;
	});
}
function vc(e, t, n, r, i = !1) {
	bc(e, t);
	let a;
	return ec[e] || (a = n(), ec[e] = !0), r && t({ metric: r }), xc(e, t, i ? a : void 0);
}
function yc(e) {
	let t = {};
	e === "event" && (t.durationThreshold = 0), Ds(e, (t) => {
		fc(e, { entries: t });
	}, t);
}
function bc(e, t) {
	$s[e] = $s[e] || [], $s[e].push(t);
}
function xc(e, t, n) {
	return () => {
		n && n();
		let r = $s[e];
		if (!r) return;
		let i = r.indexOf(t);
		i !== -1 && r.splice(i, 1);
	};
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/metrics/utils.js
function Sc(e) {
	return typeof e == "number" && isFinite(e);
}
function Cc(e, { startTimestamp: t, ...n }) {
	return t && e.startTimestamp > t && (e.startTimestamp = t), e.startChild({
		startTimestamp: t,
		...n
	});
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/metrics/index.js
var wc = 2147483647;
function V(e) {
	return e / 1e3;
}
function Tc() {
	return B && B.addEventListener && B.performance;
}
var Ec = 0, H = {}, Dc, Oc;
function kc() {
	let e = Tc();
	if (e && j) {
		e.mark && B.performance.mark("sentry-tracing-init");
		let t = Fc(), n = Nc(), r = Pc(), i = Ic();
		return () => {
			t(), n(), r(), i();
		};
	}
	return () => void 0;
}
function Ac() {
	dc("longtask", ({ entries: e }) => {
		for (let t of e) {
			let e = Oi();
			if (!e) return;
			let n = V(j + t.startTime), r = V(t.duration);
			e.startChild({
				description: "Main UI thread blocked",
				op: "ui.long-task",
				origin: "auto.ui.browser.metrics",
				startTimestamp: n,
				endTimestamp: n + r
			});
		}
	});
}
function jc() {
	dc("event", ({ entries: e }) => {
		for (let t of e) {
			let e = Oi();
			if (!e) return;
			if (t.name === "click") {
				let n = V(j + t.startTime), r = V(t.duration), i = {
					description: le(t.target),
					op: `ui.interaction.${t.name}`,
					origin: "auto.ui.browser.metrics",
					startTimestamp: n,
					endTimestamp: n + r
				}, a = pe(t.target);
				a && (i.attributes = { "ui.component_name": a }), e.startChild(i);
			}
		}
	});
}
function Mc(e, t) {
	if (Tc() && j) {
		let n = Rc(e, t);
		return () => {
			n();
		};
	}
	return () => void 0;
}
function Nc() {
	return oc(({ metric: e }) => {
		let t = e.entries[e.entries.length - 1];
		t && (z && D.log("[Measurements] Adding CLS"), H.cls = {
			value: e.value,
			unit: ""
		}, Oc = t);
	}, !0);
}
function Pc() {
	return sc(({ metric: e }) => {
		let t = e.entries[e.entries.length - 1];
		t && (z && D.log("[Measurements] Adding LCP"), H.lcp = {
			value: e.value,
			unit: "millisecond"
		}, Dc = t);
	}, !0);
}
function Fc() {
	return lc(({ metric: e }) => {
		let t = e.entries[e.entries.length - 1];
		if (!t) return;
		let n = V(j), r = V(t.startTime);
		z && D.log("[Measurements] Adding FID"), H.fid = {
			value: e.value,
			unit: "millisecond"
		}, H["mark.fid"] = {
			value: n + r,
			unit: "second"
		};
	});
}
function Ic() {
	return cc(({ metric: e }) => {
		e.entries[e.entries.length - 1] && (z && D.log("[Measurements] Adding TTFB"), H.ttfb = {
			value: e.value,
			unit: "millisecond"
		});
	});
}
var Lc = {
	click: "click",
	pointerdown: "click",
	pointerup: "click",
	mousedown: "click",
	mouseup: "click",
	touchstart: "click",
	touchend: "click",
	mouseover: "hover",
	mouseout: "hover",
	mouseenter: "hover",
	mouseleave: "hover",
	pointerover: "hover",
	pointerout: "hover",
	pointerenter: "hover",
	pointerleave: "hover",
	dragstart: "drag",
	dragend: "drag",
	drag: "drag",
	dragenter: "drag",
	dragleave: "drag",
	dragover: "drag",
	drop: "drag",
	keydown: "press",
	keyup: "press",
	keypress: "press",
	input: "press"
};
function Rc(e, t) {
	return uc(({ metric: n }) => {
		if (n.value === void 0) return;
		let r = n.entries.find((e) => e.duration === n.value && Lc[e.name] !== void 0), i = P();
		if (!r || !i) return;
		let a = Lc[r.name], o = i.getOptions(), s = V(j + r.startTime), c = V(n.value), l = r.interactionId === void 0 ? void 0 : e[r.interactionId];
		if (l === void 0) return;
		let { routeName: u, parentContext: d, activeTransaction: f, user: p, replayId: m } = l, h = p === void 0 ? void 0 : p.email || p.id || p.ip_address, g = f === void 0 ? void 0 : f.getProfileId(), _ = new ca({
			startTimestamp: s,
			endTimestamp: s + c,
			op: `ui.interaction.${a}`,
			name: le(r.target),
			attributes: {
				release: o.release,
				environment: o.environment,
				transaction: u,
				...h !== void 0 && h !== "" ? { user: h } : {},
				...g === void 0 ? {} : { profile_id: g },
				...m === void 0 ? {} : { replay_id: m }
			},
			exclusiveTime: n.value,
			measurements: { inp: {
				value: n.value,
				unit: "millisecond"
			} }
		}), v = Yc(d, o, t);
		if (v && Math.random() < v) {
			let e = _ ? bo([_], i.getDsn()) : void 0, t = i && i.getTransport();
			t && e && t.send(e).then(null, (e) => {
				z && D.error("Error while sending interaction:", e);
			});
			return;
		}
	});
}
function zc(e) {
	let t = Tc();
	if (!t || !B.performance.getEntries || !j) return;
	z && D.log("[Tracing] Adding & adjusting spans using Performance API");
	let n = V(j), r = t.getEntries(), { op: i, start_timestamp: a } = N(e);
	if (r.slice(Ec).forEach((t) => {
		let r = V(t.startTime), i = V(t.duration);
		if (!(e.op === "navigation" && a && n + r < a)) switch (t.entryType) {
			case "navigation":
				Vc(e, t, n);
				break;
			case "mark":
			case "paint":
			case "measure": {
				Bc(e, t, r, i, n);
				let a = Ns(), o = t.startTime < a.firstHiddenTime;
				t.name === "first-paint" && o && (z && D.log("[Measurements] Adding FP"), H.fp = {
					value: t.startTime,
					unit: "millisecond"
				}), t.name === "first-contentful-paint" && o && (z && D.log("[Measurements] Adding FCP"), H.fcp = {
					value: t.startTime,
					unit: "millisecond"
				});
				break;
			}
			case "resource":
				Wc(e, t, t.name, r, i, n);
				break;
		}
	}), Ec = Math.max(r.length - 1, 0), Gc(e), i === "pageload") {
		Jc(H), [
			"fcp",
			"fp",
			"lcp"
		].forEach((e) => {
			if (!H[e] || !a || n >= a) return;
			let t = H[e].value, r = n + V(t), i = Math.abs((r - a) * 1e3), o = i - t;
			z && D.log(`[Measurements] Normalized ${e} from ${t} to ${i} (${o})`), H[e].value = i;
		});
		let t = H["mark.fid"];
		t && H.fid && (Cc(e, {
			description: "first input delay",
			endTimestamp: t.value + V(H.fid.value),
			op: "ui.action",
			origin: "auto.ui.browser.metrics",
			startTimestamp: t.value
		}), delete H["mark.fid"]), "fcp" in H || delete H.cls, Object.keys(H).forEach((e) => {
			xa(e, H[e].value, H[e].unit);
		}), Kc(e);
	}
	Dc = void 0, Oc = void 0, H = {};
}
function Bc(e, t, n, r, i) {
	let a = i + n, o = a + r;
	return Cc(e, {
		description: t.name,
		endTimestamp: o,
		op: t.entryType,
		origin: "auto.resource.browser.metrics",
		startTimestamp: a
	}), a;
}
function Vc(e, t, n) {
	[
		"unloadEvent",
		"redirect",
		"domContentLoadedEvent",
		"loadEvent",
		"connect"
	].forEach((r) => {
		Hc(e, t, r, n);
	}), Hc(e, t, "secureConnection", n, "TLS/SSL", "connectEnd"), Hc(e, t, "fetch", n, "cache", "domainLookupStart"), Hc(e, t, "domainLookup", n, "DNS"), Uc(e, t, n);
}
function Hc(e, t, n, r, i, a) {
	let o = a ? t[a] : t[`${n}End`], s = t[`${n}Start`];
	!s || !o || Cc(e, {
		op: "browser",
		origin: "auto.browser.browser.metrics",
		description: i || n,
		startTimestamp: r + V(s),
		endTimestamp: r + V(o)
	});
}
function Uc(e, t, n) {
	t.responseEnd && (Cc(e, {
		op: "browser",
		origin: "auto.browser.browser.metrics",
		description: "request",
		startTimestamp: n + V(t.requestStart),
		endTimestamp: n + V(t.responseEnd)
	}), Cc(e, {
		op: "browser",
		origin: "auto.browser.browser.metrics",
		description: "response",
		startTimestamp: n + V(t.responseStart),
		endTimestamp: n + V(t.responseEnd)
	}));
}
function Wc(e, t, n, r, i, a) {
	if (t.initiatorType === "xmlhttprequest" || t.initiatorType === "fetch") return;
	let o = gn(n), s = {};
	qc(s, t, "transferSize", "http.response_transfer_size"), qc(s, t, "encodedBodySize", "http.response_content_length"), qc(s, t, "decodedBodySize", "http.decoded_response_content_length"), "renderBlockingStatus" in t && (s["resource.render_blocking_status"] = t.renderBlockingStatus), o.protocol && (s["url.scheme"] = o.protocol.split(":").pop()), o.host && (s["server.address"] = o.host), s["url.same_origin"] = n.includes(B.location.origin);
	let c = a + r, l = c + i;
	Cc(e, {
		description: n.replace(B.location.origin, ""),
		endTimestamp: l,
		op: t.initiatorType ? `resource.${t.initiatorType}` : "resource.other",
		origin: "auto.resource.browser.metrics",
		startTimestamp: c,
		data: s
	});
}
function Gc(e) {
	let t = B.navigator;
	if (!t) return;
	let n = t.connection;
	n && (n.effectiveType && e.setTag("effectiveConnectionType", n.effectiveType), n.type && e.setTag("connectionType", n.type), Sc(n.rtt) && (H["connection.rtt"] = {
		value: n.rtt,
		unit: "millisecond"
	})), Sc(t.deviceMemory) && e.setTag("deviceMemory", `${t.deviceMemory} GB`), Sc(t.hardwareConcurrency) && e.setTag("hardwareConcurrency", String(t.hardwareConcurrency));
}
function Kc(e) {
	Dc && (z && D.log("[Measurements] Adding LCP Data"), Dc.element && e.setTag("lcp.element", le(Dc.element)), Dc.id && e.setTag("lcp.id", Dc.id), Dc.url && e.setTag("lcp.url", Dc.url.trim().slice(0, 200)), e.setTag("lcp.size", Dc.size)), Oc && Oc.sources && (z && D.log("[Measurements] Adding CLS Data"), Oc.sources.forEach((t, n) => e.setTag(`cls.source.${n + 1}`, le(t.node))));
}
function qc(e, t, n, r) {
	let i = t[n];
	i != null && i < wc && (e[r] = i);
}
function Jc(e) {
	let t = ws();
	if (!t) return;
	let { responseStart: n, requestStart: r } = t;
	r <= n && (z && D.log("[Measurements] Adding TTFB Request Time"), e["ttfb.requestTime"] = {
		value: n - r,
		unit: "millisecond"
	});
}
function Yc(e, t, n) {
	if (!zi(t)) return !1;
	let r;
	return r = e !== void 0 && typeof t.tracesSampler == "function" ? t.tracesSampler({
		transactionContext: e,
		name: e.name,
		parentSampled: e.parentSampled,
		attributes: {
			...e.data,
			...e.attributes
		},
		location: B.location
	}) : e !== void 0 && e.sampled !== void 0 ? e.sampled : t.tracesSampleRate === void 0 ? 1 : t.tracesSampleRate, ga(r) ? r === !0 ? n : r === !1 ? 0 : r * n : (z && D.warn("[Tracing] Discarding interaction span because of invalid sample rate."), !1);
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/common/fetch.js
function Xc(e, t, n, r, i = "auto.http.browser") {
	if (!zi() || !e.fetchData) return;
	let a = t(e.fetchData.url);
	if (e.endTimestamp && a) {
		let t = e.fetchData.__span;
		if (!t) return;
		let n = r[t];
		n && ($c(n, e), delete r[t]);
		return;
	}
	let o = F(), s = P(), { method: c, url: l } = e.fetchData, u = Qc(l), d = u ? gn(u).host : void 0, f = a ? Ui({
		name: `${c} ${l}`,
		onlyIfParent: !0,
		attributes: {
			url: l,
			type: "fetch",
			"http.method": c,
			"http.url": u,
			"server.address": d,
			[aa]: i
		},
		op: "http.client"
	}) : void 0;
	if (f && (e.fetchData.__span = f.spanContext().spanId, r[f.spanContext().spanId] = f), n(e.fetchData.url) && s) {
		let t = e.args[0];
		e.args[1] = e.args[1] || {};
		let n = e.args[1];
		n.headers = Zc(t, s, o, n, f);
	}
	return f;
}
function Zc(e, t, n, r, i) {
	let a = i || n.getSpan(), { traceId: o, spanId: s, sampled: c, dsc: l } = {
		...Si().getPropagationContext(),
		...n.getPropagationContext()
	}, u = a ? mr(a) : Fn(o, s, c), d = On(l || (a ? ni(a) : ti(o, t, n))), f = r.headers || (typeof Request < "u" && v(e, Request) ? e.headers : void 0);
	if (!f) return {
		"sentry-trace": u,
		baggage: d
	};
	if (typeof Headers < "u" && v(f, Headers)) {
		let e = new Headers(f);
		return e.append("sentry-trace", u), d && e.append(wn, d), e;
	} else if (Array.isArray(f)) {
		let e = [...f, ["sentry-trace", u]];
		return d && e.push([wn, d]), e;
	} else {
		let e = "baggage" in f ? f.baggage : void 0, t = [];
		return Array.isArray(e) ? t.push(...e) : e && t.push(e), d && t.push(d), {
			...f,
			"sentry-trace": u,
			baggage: t.length > 0 ? t.join(",") : void 0
		};
	}
}
function Qc(e) {
	try {
		return new URL(e).href;
	} catch {
		return;
	}
}
function $c(e, t) {
	if (t.response) {
		Ii(e, t.response.status);
		let n = t.response && t.response.headers && t.response.headers.get("content-length");
		if (n) {
			let t = parseInt(n);
			t > 0 && e.setAttribute("http.response_content_length", t);
		}
	} else t.error && e.setStatus("internal_error");
	e.end();
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/request.js
var el = ["localhost", /^\/(?!\/)/], tl = {
	traceFetch: !0,
	traceXHR: !0,
	enableHTTPTimings: !0,
	tracingOrigins: el,
	tracePropagationTargets: el
};
function nl(e) {
	let { traceFetch: t, traceXHR: n, tracePropagationTargets: r, tracingOrigins: i, shouldCreateSpanForRequest: a, enableHTTPTimings: o } = {
		traceFetch: tl.traceFetch,
		traceXHR: tl.traceXHR,
		...e
	}, s = typeof a == "function" ? a : (e) => !0, c = (e) => cl(e, r || i), l = {};
	t && St((e) => {
		let t = Xc(e, s, c, l);
		if (t) {
			let n = dl(e.fetchData.url), r = n ? gn(n).host : void 0;
			t.setAttributes({
				"http.url": n,
				"server.address": r
			});
		}
		o && t && il(t);
	}), n && Vt((e) => {
		let t = ll(e, s, c, l);
		o && t && il(t);
	});
}
function rl(e) {
	return e.entryType === "resource" && "initiatorType" in e && typeof e.nextHopProtocol == "string" && (e.initiatorType === "fetch" || e.initiatorType === "xmlhttprequest");
}
function il(e) {
	let { url: t } = N(e).data || {};
	if (!t || typeof t != "string") return;
	let n = dc("resource", ({ entries: r }) => {
		r.forEach((r) => {
			rl(r) && r.name.endsWith(t) && (sl(r).forEach((t) => e.setAttribute(...t)), setTimeout(n));
		});
	});
}
function al(e) {
	let t = "unknown", n = "unknown", r = "";
	for (let i of e) {
		if (i === "/") {
			[t, n] = e.split("/");
			break;
		}
		if (!isNaN(Number(i))) {
			t = r === "h" ? "http" : r, n = e.split(r)[1];
			break;
		}
		r += i;
	}
	return r === e && (t = r), {
		name: t,
		version: n
	};
}
function ol(e = 0) {
	return ((j || performance.timeOrigin) + e) / 1e3;
}
function sl(e) {
	let { name: t, version: n } = al(e.nextHopProtocol), r = [];
	return r.push(["network.protocol.version", n], ["network.protocol.name", t]), j ? [
		...r,
		["http.request.redirect_start", ol(e.redirectStart)],
		["http.request.fetch_start", ol(e.fetchStart)],
		["http.request.domain_lookup_start", ol(e.domainLookupStart)],
		["http.request.domain_lookup_end", ol(e.domainLookupEnd)],
		["http.request.connect_start", ol(e.connectStart)],
		["http.request.secure_connection_start", ol(e.secureConnectionStart)],
		["http.request.connection_end", ol(e.connectEnd)],
		["http.request.request_start", ol(e.requestStart)],
		["http.request.response_start", ol(e.responseStart)],
		["http.request.response_end", ol(e.responseEnd)]
	] : r;
}
function cl(e, t) {
	return w(e, t || el);
}
function ll(e, t, n, r) {
	let i = e.xhr, a = i && i.__sentry_xhr_v3__;
	if (!zi() || !i || i.__sentry_own_request__ || !a) return;
	let o = t(a.url);
	if (e.endTimestamp && o) {
		let e = i.__sentry_xhr_span_id__;
		if (!e) return;
		let t = r[e];
		t && a.status_code !== void 0 && (Ii(t, a.status_code), t.end(), delete r[e]);
		return;
	}
	let s = F(), c = Si(), l = dl(a.url), u = l ? gn(l).host : void 0, d = o ? Ui({
		name: `${a.method} ${a.url}`,
		onlyIfParent: !0,
		attributes: {
			type: "xhr",
			"http.method": a.method,
			"http.url": l,
			url: a.url,
			"server.address": u,
			[aa]: "auto.http.browser"
		},
		op: "http.client"
	}) : void 0;
	d && (i.__sentry_xhr_span_id__ = d.spanContext().spanId, r[i.__sentry_xhr_span_id__] = d);
	let f = P();
	if (i.setRequestHeader && n(a.url) && f) {
		let { traceId: e, spanId: t, sampled: n, dsc: r } = {
			...c.getPropagationContext(),
			...s.getPropagationContext()
		};
		ul(i, d ? mr(d) : Fn(e, t, n), On(r || (d ? ni(d) : ti(e, f, s))));
	}
	return d;
}
function ul(e, t, n) {
	try {
		e.setRequestHeader("sentry-trace", t), n && e.setRequestHeader(wn, n);
	} catch {}
}
function dl(e) {
	try {
		return new URL(e, B.location.origin).href;
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/router.js
function fl(e, t = !0, n = !0) {
	if (!B || !B.location) {
		z && D.warn("Could not initialize routing instrumentation due to invalid location");
		return;
	}
	let r = B.location.href, i;
	t && (i = e({
		name: B.location.pathname,
		startTimestamp: j ? j / 1e3 : void 0,
		op: "pageload",
		origin: "auto.pageload.browser",
		metadata: { source: "url" }
	})), n && Lt(({ to: t, from: n }) => {
		if (n === void 0 && r && r.indexOf(t) !== -1) {
			r = void 0;
			return;
		}
		n !== t && (r = void 0, i && (z && D.log(`[Tracing] Finishing current transaction with op: ${i.op}`), i.end()), i = e({
			name: B.location.pathname,
			op: "navigation",
			origin: "auto.navigation.browser",
			metadata: { source: "url" }
		}));
	});
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/browsertracing.js
var pl = "BrowserTracing", ml = {
	...ua,
	markBackgroundTransactions: !0,
	routingInstrumentation: fl,
	startTransactionOnLocationChange: !0,
	startTransactionOnPageLoad: !0,
	enableLongTask: !0,
	enableInp: !1,
	interactionsSampleRate: 1,
	_experiments: {},
	...tl
}, hl = 10, gl = class {
	constructor(e) {
		this.name = pl, this._hasSetTracePropagationTargets = !1, ba(), z && (this._hasSetTracePropagationTargets = !!(e && (e.tracePropagationTargets || e.tracingOrigins))), this.options = {
			...ml,
			...e
		}, this.options._experiments.enableLongTask !== void 0 && (this.options.enableLongTask = this.options._experiments.enableLongTask), e && !e.tracePropagationTargets && e.tracingOrigins && (this.options.tracePropagationTargets = e.tracingOrigins), this._collectWebVitals = kc(), this._interactionIdToRouteNameMapping = {}, this.options.enableInp && Mc(this._interactionIdToRouteNameMapping, this.options.interactionsSampleRate), this.options.enableLongTask && Ac(), this.options._experiments.enableInteractions && jc(), this._latestRoute = {
			name: void 0,
			context: void 0
		};
	}
	setupOnce(e, t) {
		this._getCurrentHub = t;
		let n = t().getClient(), r = n && n.getOptions(), { routingInstrumentation: i, startTransactionOnLocationChange: a, startTransactionOnPageLoad: o, markBackgroundTransactions: s, traceFetch: c, traceXHR: l, shouldCreateSpanForRequest: u, enableHTTPTimings: d, _experiments: f } = this.options, p = r && r.tracePropagationTargets, m = p || this.options.tracePropagationTargets;
		z && this._hasSetTracePropagationTargets && p && D.warn("[Tracing] The `tracePropagationTargets` option was set in the BrowserTracing integration and top level `Sentry.init`. The top level `Sentry.init` value is being used."), i((e) => {
			let n = this._createRouteTransaction(e);
			return this.options._experiments.onStartRouteTransaction && this.options._experiments.onStartRouteTransaction(n, e, t), n;
		}, o, a), s && bs(), f.enableInteractions && this._registerInteractionListener(), this.options.enableInp && this._registerInpInteractionListener(), nl({
			traceFetch: c,
			traceXHR: l,
			tracePropagationTargets: m,
			shouldCreateSpanForRequest: u,
			enableHTTPTimings: d
		});
	}
	_createRouteTransaction(e) {
		if (!this._getCurrentHub) {
			z && D.warn(`[Tracing] Did not create ${e.op} transaction because _getCurrentHub is invalid.`);
			return;
		}
		let t = this._getCurrentHub(), { beforeNavigate: n, idleTimeout: r, finalTimeout: i, heartbeatInterval: a } = this.options, o = e.op === "pageload", s;
		if (o) {
			let { traceId: t, dsc: n, parentSpanId: r, sampled: i } = Pn(o ? _l("sentry-trace") : "", o ? _l("baggage") : void 0);
			s = {
				traceId: t,
				parentSpanId: r,
				parentSampled: i,
				...e,
				metadata: {
					...e.metadata,
					dynamicSamplingContext: n
				},
				trimEnd: !0
			};
		} else s = {
			trimEnd: !0,
			...e
		};
		let c = typeof n == "function" ? n(s) : s, l = c === void 0 ? {
			...s,
			sampled: !1
		} : c;
		l.metadata = l.name === s.name ? l.metadata : {
			...l.metadata,
			source: "custom"
		}, this._latestRoute.name = l.name, this._latestRoute.context = l, l.sampled === !1 && z && D.log(`[Tracing] Will not send ${l.op} transaction because of beforeNavigate.`), z && D.log(`[Tracing] Starting ${l.op} transaction on scope`);
		let { location: u } = B, d = ya(t, l, r, i, !0, { location: u }, a, o);
		return o && B.document && (B.document.addEventListener("readystatechange", () => {
			["interactive", "complete"].includes(B.document.readyState) && d.sendAutoFinishSignal();
		}), ["interactive", "complete"].includes(B.document.readyState) && d.sendAutoFinishSignal()), d.registerBeforeFinishCallback((e) => {
			this._collectWebVitals(), zc(e);
		}), d;
	}
	_registerInteractionListener() {
		let e, t = () => {
			let { idleTimeout: t, finalTimeout: n, heartbeatInterval: r } = this.options, i = "ui.action.click", a = Oi();
			if (a && a.op && ["navigation", "pageload"].includes(a.op)) {
				z && D.warn(`[Tracing] Did not create ${i} transaction because a pageload or navigation transaction is in progress.`);
				return;
			}
			if (e &&= (e.setFinishReason("interactionInterrupted"), e.end(), void 0), !this._getCurrentHub) {
				z && D.warn(`[Tracing] Did not create ${i} transaction because _getCurrentHub is invalid.`);
				return;
			}
			if (!this._latestRoute.name) {
				z && D.warn(`[Tracing] Did not create ${i} transaction because _latestRouteName is missing.`);
				return;
			}
			let o = this._getCurrentHub(), { location: s } = B;
			e = ya(o, {
				name: this._latestRoute.name,
				op: i,
				trimEnd: !0,
				data: { [na]: this._latestRoute.context ? vl(this._latestRoute.context) : "url" }
			}, t, n, !0, { location: s }, r);
		};
		["click"].forEach((e) => {
			B.document && addEventListener(e, t, {
				once: !1,
				capture: !0
			});
		});
	}
	_registerInpInteractionListener() {
		let e = ({ entries: e }) => {
			let t = P(), n = t !== void 0 && t.getIntegrationByName !== void 0 ? t.getIntegrationByName("Replay") : void 0, r = n === void 0 ? void 0 : n.getReplayId(), i = Oi(), a = F(), o = a === void 0 ? void 0 : a.getUser();
			e.forEach((e) => {
				if (yl(e)) {
					let t = e.interactionId;
					if (t === void 0) return;
					let n = this._interactionIdToRouteNameMapping[t], a = e.duration, s = e.startTime, c = Object.keys(this._interactionIdToRouteNameMapping), l = c.length > 0 ? c.reduce((e, t) => this._interactionIdToRouteNameMapping[e].duration < this._interactionIdToRouteNameMapping[t].duration ? e : t) : void 0;
					if (e.entryType === "first-input" && c.map((e) => this._interactionIdToRouteNameMapping[e]).some((e) => e.duration === a && e.startTime === s) || !t) return;
					if (n) n.duration = Math.max(n.duration, a);
					else if (c.length < hl || l === void 0 || a > this._interactionIdToRouteNameMapping[l].duration) {
						let e = this._latestRoute.name, n = this._latestRoute.context;
						e && n && (l && Object.keys(this._interactionIdToRouteNameMapping).length >= hl && delete this._interactionIdToRouteNameMapping[l], this._interactionIdToRouteNameMapping[t] = {
							routeName: e,
							duration: a,
							parentContext: n,
							user: o,
							activeTransaction: i,
							replayId: r,
							startTime: s
						});
					}
				}
			});
		};
		dc("event", e), dc("first-input", e);
	}
};
function _l(e) {
	let t = fe(`meta[name=${e}]`);
	return t ? t.getAttribute("content") : void 0;
}
function vl(e) {
	let t = e.attributes && e.attributes["sentry.source"], n = e.data && e.data["sentry.source"], r = e.metadata && e.metadata.source;
	return t || n || r;
}
function yl(e) {
	return "duration" in e;
}
//#endregion
//#region node_modules/@sentry-internal/tracing/esm/browser/browserTracingIntegration.js
var bl = "BrowserTracing", xl = {
	...ua,
	instrumentNavigation: !0,
	instrumentPageLoad: !0,
	markBackgroundSpan: !0,
	enableLongTask: !0,
	enableInp: !1,
	interactionsSampleRate: 1,
	_experiments: {},
	...tl
}, Sl = ((e = {}) => {
	let t = z ? !!(e.tracePropagationTargets || e.tracingOrigins) : !1;
	ba(), !e.tracePropagationTargets && e.tracingOrigins && (e.tracePropagationTargets = e.tracingOrigins);
	let n = {
		...xl,
		...e
	}, r = kc(), i = {};
	n.enableInp && Mc(i, n.interactionsSampleRate), n.enableLongTask && Ac(), n._experiments.enableInteractions && jc();
	let a = {
		name: void 0,
		context: void 0
	};
	function o(e) {
		let t = I(), { beforeStartSpan: i, idleTimeout: o, finalTimeout: s, heartbeatInterval: c } = n, l = e.op === "pageload", u;
		if (l) {
			let { traceId: t, dsc: n, parentSpanId: r, sampled: i } = Pn(l ? Tl("sentry-trace") : "", l ? Tl("baggage") : void 0);
			u = {
				traceId: t,
				parentSpanId: r,
				parentSampled: i,
				...e,
				metadata: {
					...e.metadata,
					dynamicSamplingContext: n
				},
				trimEnd: !0
			};
		} else u = {
			trimEnd: !0,
			...e
		};
		let d = i ? i(u) : u;
		d.metadata = d.name === u.name ? d.metadata : {
			...d.metadata,
			source: "custom"
		}, a.name = d.name, a.context = d, d.sampled === !1 && z && D.log(`[Tracing] Will not send ${d.op} transaction because of beforeNavigate.`), z && D.log(`[Tracing] Starting ${d.op} transaction on scope`);
		let { location: f } = B, p = ya(t, d, o, s, !0, { location: f }, c, l);
		return l && B.document && (B.document.addEventListener("readystatechange", () => {
			["interactive", "complete"].includes(B.document.readyState) && p.sendAutoFinishSignal();
		}), ["interactive", "complete"].includes(B.document.readyState) && p.sendAutoFinishSignal()), p.registerBeforeFinishCallback((e) => {
			r(), zc(e);
		}), p;
	}
	return {
		name: bl,
		setupOnce: () => {},
		afterAllSetup(e) {
			let r = e.getOptions(), { markBackgroundSpan: s, traceFetch: c, traceXHR: l, shouldCreateSpanForRequest: u, enableHTTPTimings: d, _experiments: f } = n, p = r && r.tracePropagationTargets, m = p || n.tracePropagationTargets;
			z && t && p && D.warn("[Tracing] The `tracePropagationTargets` option was set in the BrowserTracing integration and top level `Sentry.init`. The top level `Sentry.init` value is being used.");
			let h, g = B.location && B.location.href;
			e.on && (e.on("startNavigationSpan", (e) => {
				h && (z && D.log(`[Tracing] Finishing current transaction with op: ${N(h).op}`), h.end()), h = o({
					op: "navigation",
					...e
				});
			}), e.on("startPageLoadSpan", (e) => {
				h && (z && D.log(`[Tracing] Finishing current transaction with op: ${N(h).op}`), h.end()), h = o({
					op: "pageload",
					...e
				});
			})), n.instrumentPageLoad && e.emit && B.location && Cl(e, {
				name: B.location.pathname,
				startTimestamp: j ? j / 1e3 : void 0,
				origin: "auto.pageload.browser",
				attributes: { [na]: "url" }
			}), n.instrumentNavigation && e.emit && B.location && Lt(({ to: t, from: n }) => {
				if (n === void 0 && g && g.indexOf(t) !== -1) {
					g = void 0;
					return;
				}
				n !== t && (g = void 0, wl(e, {
					name: B.location.pathname,
					origin: "auto.navigation.browser",
					attributes: { [na]: "url" }
				}));
			}), s && bs(), f.enableInteractions && El(n, a), n.enableInp && kl(i, a), nl({
				traceFetch: c,
				traceXHR: l,
				tracePropagationTargets: m,
				shouldCreateSpanForRequest: u,
				enableHTTPTimings: d
			});
		},
		options: n
	};
});
function Cl(e, t) {
	if (!e.emit) return;
	e.emit("startPageLoadSpan", t);
	let n = Wi();
	return (n && N(n).op) === "pageload" ? n : void 0;
}
function wl(e, t) {
	if (!e.emit) return;
	e.emit("startNavigationSpan", t);
	let n = Wi();
	return (n && N(n).op) === "navigation" ? n : void 0;
}
function Tl(e) {
	let t = fe(`meta[name=${e}]`);
	return t ? t.getAttribute("content") : void 0;
}
function El(e, t) {
	let n, r = () => {
		let { idleTimeout: r, finalTimeout: i, heartbeatInterval: a } = e, o = "ui.action.click", s = Oi();
		if (s && s.op && ["navigation", "pageload"].includes(s.op)) {
			z && D.warn(`[Tracing] Did not create ${o} transaction because a pageload or navigation transaction is in progress.`);
			return;
		}
		if (n &&= (n.setFinishReason("interactionInterrupted"), n.end(), void 0), !t.name) {
			z && D.warn(`[Tracing] Did not create ${o} transaction because _latestRouteName is missing.`);
			return;
		}
		let { location: c } = B, l = {
			name: t.name,
			op: o,
			trimEnd: !0,
			data: { [na]: t.context ? Al(t.context) : "url" }
		};
		n = ya(I(), l, r, i, !0, { location: c }, a);
	};
	["click"].forEach((e) => {
		B.document && addEventListener(e, r, {
			once: !1,
			capture: !0
		});
	});
}
function Dl(e) {
	return "duration" in e;
}
var Ol = 10;
function kl(e, t) {
	let n = ({ entries: n }) => {
		let r = P(), i = r !== void 0 && r.getIntegrationByName !== void 0 ? r.getIntegrationByName("Replay") : void 0, a = i === void 0 ? void 0 : i.getReplayId(), o = Oi(), s = F(), c = s === void 0 ? void 0 : s.getUser();
		n.forEach((n) => {
			if (Dl(n)) {
				let r = n.interactionId;
				if (r === void 0) return;
				let i = e[r], s = n.duration, l = n.startTime, u = Object.keys(e), d = u.length > 0 ? u.reduce((t, n) => e[t].duration < e[n].duration ? t : n) : void 0;
				if (n.entryType === "first-input" && u.map((t) => e[t]).some((e) => e.duration === s && e.startTime === l) || !r) return;
				if (i) i.duration = Math.max(i.duration, s);
				else if (u.length < Ol || d === void 0 || s > e[d].duration) {
					let n = t.name, i = t.context;
					n && i && (d && Object.keys(e).length >= Ol && delete e[d], e[r] = {
						routeName: n,
						duration: s,
						parentContext: i,
						user: c,
						activeTransaction: o,
						replayId: a,
						startTime: l
					});
				}
			}
		});
	};
	dc("event", n), dc("first-input", n);
}
function Al(e) {
	let t = e.attributes && e.attributes["sentry.source"], n = e.data && e.data["sentry.source"], r = e.metadata && e.metadata.source;
	return t || n || r;
}
//#endregion
//#region node_modules/@sentry/browser/esm/helpers.js
var U = T, jl = 0;
function Ml() {
	return jl > 0;
}
function Nl() {
	jl++, setTimeout(() => {
		jl--;
	});
}
function Pl(e, t = {}, n) {
	if (typeof e != "function") return e;
	try {
		let t = e.__sentry_wrapped__;
		if (t) return typeof t == "function" ? t : e;
		if (Ae(e)) return e;
	} catch {
		return e;
	}
	let r = function() {
		let r = Array.prototype.slice.call(arguments);
		try {
			n && typeof n == "function" && n.apply(this, arguments);
			let i = r.map((e) => Pl(e, t));
			return e.apply(this, i);
		} catch (e) {
			throw Nl(), Hr((n) => {
				n.addEventProcessor((e) => (t.mechanism && (tt(e, void 0, void 0), nt(e, t.mechanism)), e.extra = {
					...e.extra,
					arguments: r
				}, e)), jr(e);
			}), e;
		}
	};
	try {
		for (let t in e) Object.prototype.hasOwnProperty.call(e, t) && (r[t] = e[t]);
	} catch {}
	ke(r, e), Oe(e, "__sentry_wrapped__", r);
	try {
		Object.getOwnPropertyDescriptor(r, "name").configurable && Object.defineProperty(r, "name", { get() {
			return e.name;
		} });
	} catch {}
	return r;
}
//#endregion
//#region node_modules/@sentry/browser/esm/debug-build.js
var W = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
//#endregion
//#region node_modules/@sentry/browser/esm/eventbuilder.js
function Fl(e, t) {
	let n = Rl(e, t), r = {
		type: t && t.name,
		value: Vl(t)
	};
	return n.length && (r.stacktrace = { frames: n }), r.type === void 0 && r.value === "" && (r.value = "Unrecoverable error caught"), r;
}
function Il(e, t, n, r) {
	let i = P(), a = i && i.getOptions().normalizeDepth, o = {
		exception: { values: [{
			type: f(t) ? t.constructor.name : r ? "UnhandledRejection" : "Error",
			value: Kl(t, { isUnhandledRejection: r })
		}] },
		extra: { __serialized__: Zt(t, a) }
	};
	if (n) {
		let t = Rl(e, n);
		t.length && (o.exception.values[0].stacktrace = { frames: t });
	}
	return o;
}
function Ll(e, t) {
	return { exception: { values: [Fl(e, t)] } };
}
function Rl(e, t) {
	let n = t.stacktrace || t.stack || "", r = Bl(t);
	try {
		return e(n, r);
	} catch {}
	return [];
}
var zl = /Minified React error #\d+;/i;
function Bl(e) {
	if (e) {
		if (typeof e.framesToPop == "number") return e.framesToPop;
		if (zl.test(e.message)) return 1;
	}
	return 0;
}
function Vl(e) {
	let t = e && e.message;
	return t ? t.error && typeof t.error.message == "string" ? t.error.message : t : "No error message";
}
function Hl(e, t, n, r) {
	let i = Wl(e, t, n && n.syntheticException || void 0, r);
	return nt(i), i.level = "error", n && n.event_id && (i.event_id = n.event_id), fn(i);
}
function Ul(e, t, n = "info", r, i) {
	let a = Gl(e, t, r && r.syntheticException || void 0, i);
	return a.level = n, r && r.event_id && (a.event_id = r.event_id), fn(a);
}
function Wl(e, t, n, i, c) {
	let l;
	if (a(t) && t.error) return Ll(e, t.error);
	if (o(t) || s(t)) {
		let r = t;
		if ("stack" in t) l = Ll(e, t);
		else {
			let t = r.name || (o(r) ? "DOMError" : "DOMException"), a = r.message ? `${t}: ${r.message}` : t;
			l = Gl(e, a, n, i), tt(l, a);
		}
		return "code" in r && (l.tags = {
			...l.tags,
			"DOMException.code": `${r.code}`
		}), l;
	}
	return r(t) ? Ll(e, t) : d(t) || f(t) ? (l = Il(e, t, n, c), nt(l, { synthetic: !0 }), l) : (l = Gl(e, t, n, i), tt(l, `${t}`, void 0), nt(l, { synthetic: !0 }), l);
}
function Gl(e, t, n, r) {
	let i = {};
	if (r && n) {
		let r = Rl(e, n);
		r.length && (i.exception = { values: [{
			value: t,
			stacktrace: { frames: r }
		}] });
	}
	if (l(t)) {
		let { __sentry_template_string__: e, __sentry_template_values__: n } = t;
		return i.logentry = {
			message: e,
			params: n
		}, i;
	}
	return i.message = t, i;
}
function Kl(e, { isUnhandledRejection: t }) {
	let n = Fe(e), r = t ? "promise rejection" : "exception";
	return a(e) ? `Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\`` : f(e) ? `Event \`${ql(e)}\` (type=${e.type}) captured as ${r}` : `Object captured as ${r} with keys: ${n}`;
}
function ql(e) {
	try {
		let t = Object.getPrototypeOf(e);
		return t ? t.constructor.name : void 0;
	} catch {}
}
//#endregion
//#region node_modules/@sentry/browser/esm/userfeedback.js
function Jl(e, { metadata: t, tunnel: n, dsn: r }) {
	return In({
		event_id: e.event_id,
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...t && t.sdk && { sdk: {
			name: t.sdk.name,
			version: t.sdk.version
		} },
		...!!n && !!r && { dsn: Se(r) }
	}, [Yl(e)]);
}
function Yl(e) {
	return [{ type: "user_report" }, e];
}
//#endregion
//#region node_modules/@sentry/browser/esm/client.js
var Xl = class extends Qa {
	constructor(e) {
		Oo(e, "browser", ["browser"], U.SENTRY_SDK_SOURCE || Gt()), super(e), e.sendClientReports && U.document && U.document.addEventListener("visibilitychange", () => {
			U.document.visibilityState === "hidden" && this._flushOutcomes();
		});
	}
	eventFromException(e, t) {
		return Hl(this._options.stackParser, e, t, this._options.attachStacktrace);
	}
	eventFromMessage(e, t = "info", n) {
		return Ul(this._options.stackParser, e, t, n, this._options.attachStacktrace);
	}
	captureUserFeedback(e) {
		if (!this._isEnabled()) {
			W && D.warn("SDK not enabled, will not capture user feedback.");
			return;
		}
		let t = Jl(e, {
			metadata: this.getSdkMetadata(),
			dsn: this.getDsn(),
			tunnel: this.getOptions().tunnel
		});
		this._sendEnvelope(t);
	}
	_prepareEvent(e, t, n) {
		return e.platform = e.platform || "javascript", super._prepareEvent(e, t, n);
	}
	_flushOutcomes() {
		let e = this._clearOutcomes();
		if (e.length === 0) {
			W && D.log("No outcomes to send");
			return;
		}
		if (!this._dsn) {
			W && D.log("No dsn provided, will not send outcomes");
			return;
		}
		W && D.log("Sending outcomes:", e);
		let t = Yn(e, this._options.tunnel && Se(this._dsn));
		this._sendEnvelope(t);
	}
}, Zl = void 0;
function Ql() {
	if (Zl) return Zl;
	if (yt(U.fetch)) return Zl = U.fetch.bind(U);
	let e = U.document, t = U.fetch;
	if (e && typeof e.createElement == "function") try {
		let n = e.createElement("iframe");
		n.hidden = !0, e.head.appendChild(n);
		let r = n.contentWindow;
		r && r.fetch && (t = r.fetch), e.head.removeChild(n);
	} catch (e) {
		W && D.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ", e);
	}
	return Zl = t.bind(U);
}
function $l() {
	Zl = void 0;
}
//#endregion
//#region node_modules/@sentry/browser/esm/transports/fetch.js
function eu(e, t = Ql()) {
	let n = 0, r = 0;
	function i(i) {
		let a = i.body.length;
		n += a, r++;
		let o = {
			body: i.body,
			method: "POST",
			referrerPolicy: "origin",
			headers: e.headers,
			keepalive: n <= 6e4 && r < 15,
			...e.fetchOptions
		};
		try {
			return t(e.url, o).then((e) => (n -= a, r--, {
				statusCode: e.status,
				headers: {
					"x-sentry-rate-limits": e.headers.get("X-Sentry-Rate-Limits"),
					"retry-after": e.headers.get("Retry-After")
				}
			}));
		} catch (e) {
			return $l(), n -= a, r--, pn(e);
		}
	}
	return lo(e, i);
}
//#endregion
//#region node_modules/@sentry/browser/esm/transports/xhr.js
var tu = 4;
function nu(e) {
	function t(t) {
		return new mn((n, r) => {
			let i = new XMLHttpRequest();
			i.onerror = r, i.onreadystatechange = () => {
				i.readyState === tu && n({
					statusCode: i.status,
					headers: {
						"x-sentry-rate-limits": i.getResponseHeader("X-Sentry-Rate-Limits"),
						"retry-after": i.getResponseHeader("Retry-After")
					}
				});
			}, i.open("POST", e.url);
			for (let t in e.headers) Object.prototype.hasOwnProperty.call(e.headers, t) && i.setRequestHeader(t, e.headers[t]);
			i.send(t.body);
		});
	}
	return lo(e, t);
}
//#endregion
//#region node_modules/@sentry/browser/esm/stack-parsers.js
var ru = "?", iu = 10, au = 20, ou = 30, su = 40, cu = 50;
function lu(e, t, n, r) {
	let i = {
		filename: e,
		function: t,
		in_app: !0
	};
	return n !== void 0 && (i.lineno = n), r !== void 0 && (i.colno = r), i;
}
var uu = /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, du = /\((\S*)(?::(\d+))(?::(\d+))\)/, fu = [ou, (e) => {
	let t = uu.exec(e);
	if (t) {
		if (t[2] && t[2].indexOf("eval") === 0) {
			let e = du.exec(t[2]);
			e && (t[2] = e[1], t[3] = e[2], t[4] = e[3]);
		}
		let [e, n] = wu(t[1] || ru, t[2]);
		return lu(n, e, t[3] ? +t[3] : void 0, t[4] ? +t[4] : void 0);
	}
}], pu = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i, mu = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, hu = [cu, (e) => {
	let t = pu.exec(e);
	if (t) {
		if (t[3] && t[3].indexOf(" > eval") > -1) {
			let e = mu.exec(t[3]);
			e && (t[1] = t[1] || "eval", t[3] = e[1], t[4] = e[2], t[5] = "");
		}
		let e = t[3], n = t[1] || ru;
		return [n, e] = wu(n, e), lu(e, n, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0);
	}
}], gu = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:[-a-z]+):.*?):(\d+)(?::(\d+))?\)?\s*$/i, _u = [su, (e) => {
	let t = gu.exec(e);
	return t ? lu(t[2], t[1] || ru, +t[3], t[4] ? +t[4] : void 0) : void 0;
}], vu = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i, yu = [iu, (e) => {
	let t = vu.exec(e);
	return t ? lu(t[2], t[3] || ru, +t[1]) : void 0;
}], bu = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\(.*\))? in (.*):\s*$/i, xu = [au, (e) => {
	let t = bu.exec(e);
	return t ? lu(t[5], t[3] || t[4] || ru, +t[1], +t[2]) : void 0;
}], Su = [
	fu,
	hu,
	_u
], Cu = Ve(...Su), wu = (e, t) => {
	let n = e.indexOf("safari-extension") !== -1, r = e.indexOf("safari-web-extension") !== -1;
	return n || r ? [e.indexOf("@") === -1 ? ru : e.split("@")[0], n ? `safari-extension:${t}` : `safari-web-extension:${t}`] : [e, t];
}, Tu = 1024, Eu = "Breadcrumbs", Du = R(((e = {}) => {
	let t = {
		console: !0,
		dom: !0,
		fetch: !0,
		history: !0,
		sentry: !0,
		xhr: !0,
		...e
	};
	return {
		name: Eu,
		setupOnce() {},
		setup(e) {
			t.console && Ze(ju(e)), t.dom && dt(Au(e, t.dom)), t.xhr && Vt(Mu(e)), t.fetch && St(Nu(e)), t.history && Lt(Pu(e)), t.sentry && e.on && e.on("beforeSendEvent", ku(e));
		}
	};
})), Ou = L(Eu, Du);
function ku(e) {
	return function(t) {
		P() === e && Fr({
			category: `sentry.${t.type === "transaction" ? "transaction" : "event"}`,
			event_id: t.event_id,
			level: t.level,
			message: et(t)
		}, { event: t });
	};
}
function Au(e, t) {
	return function(n) {
		if (P() !== e) return;
		let r, i, a = typeof t == "object" ? t.serializeAttribute : void 0, o = typeof t == "object" && typeof t.maxStringLength == "number" ? t.maxStringLength : void 0;
		o && o > Tu && (W && D.warn(`\`dom.maxStringLength\` cannot exceed ${Tu}, but a value of ${o} was configured. Sentry will use ${Tu} instead.`), o = Tu), typeof a == "string" && (a = [a]);
		try {
			let e = n.event, t = Fu(e) ? e.target : e;
			r = le(t, {
				keyAttrs: a,
				maxStringLength: o
			}), i = pe(t);
		} catch {
			r = "<unknown>";
		}
		if (r.length === 0) return;
		let s = {
			category: `ui.${n.name}`,
			message: r
		};
		i && (s.data = { "ui.component_name": i }), Fr(s, {
			event: n.event,
			name: n.name,
			global: n.global
		});
	};
}
function ju(e) {
	return function(t) {
		if (P() !== e) return;
		let n = {
			category: "console",
			data: {
				arguments: t.args,
				logger: "console"
			},
			level: yn(t.level),
			message: S(t.args, " ")
		};
		if (t.level === "assert") if (t.args[0] === !1) n.message = `Assertion failed: ${S(t.args.slice(1), " ") || "console.assert"}`, n.data.arguments = t.args.slice(1);
		else return;
		Fr(n, {
			input: t.args,
			level: t.level
		});
	};
}
function Mu(e) {
	return function(t) {
		if (P() !== e) return;
		let { startTimestamp: n, endTimestamp: r } = t, i = t.xhr[Bt];
		if (!n || !r || !i) return;
		let { method: a, url: o, status_code: s, body: c } = i, l = {
			method: a,
			url: o,
			status_code: s
		}, u = {
			xhr: t.xhr,
			input: c,
			startTimestamp: n,
			endTimestamp: r
		};
		Fr({
			category: "xhr",
			data: l,
			type: "http"
		}, u);
	};
}
function Nu(e) {
	return function(t) {
		if (P() !== e) return;
		let { startTimestamp: n, endTimestamp: r } = t;
		if (r && !(t.fetchData.url.match(/sentry_key/) && t.fetchData.method === "POST")) if (t.error) {
			let e = t.fetchData, i = {
				data: t.error,
				input: t.args,
				startTimestamp: n,
				endTimestamp: r
			};
			Fr({
				category: "fetch",
				data: e,
				level: "error",
				type: "http"
			}, i);
		} else {
			let e = t.response, i = {
				...t.fetchData,
				status_code: e && e.status
			}, a = {
				input: t.args,
				response: e,
				startTimestamp: n,
				endTimestamp: r
			};
			Fr({
				category: "fetch",
				data: i,
				type: "http"
			}, a);
		}
	};
}
function Pu(e) {
	return function(t) {
		if (P() !== e) return;
		let n = t.from, r = t.to, i = gn(U.location.href), a = n ? gn(n) : void 0, o = gn(r);
		(!a || !a.path) && (a = i), i.protocol === o.protocol && i.host === o.host && (r = o.relative), i.protocol === a.protocol && i.host === a.host && (n = a.relative), Fr({
			category: "navigation",
			data: {
				from: n,
				to: r
			}
		});
	};
}
function Fu(e) {
	return !!e && !!e.target;
}
//#endregion
//#region node_modules/@sentry/browser/esm/integrations/dedupe.js
var Iu = "Dedupe", Lu = R((() => {
	let e;
	return {
		name: Iu,
		setupOnce() {},
		processEvent(t) {
			if (t.type) return t;
			try {
				if (zu(t, e)) return W && D.warn("Event dropped due to being a duplicate of previously captured event."), null;
			} catch {}
			return e = t;
		}
	};
})), Ru = L(Iu, Lu);
function zu(e, t) {
	return t ? !!(Bu(e, t) || Vu(e, t)) : !1;
}
function Bu(e, t) {
	let n = e.message, r = t.message;
	return !(!n && !r || n && !r || !n && r || n !== r || !Uu(e, t) || !Hu(e, t));
}
function Vu(e, t) {
	let n = Wu(t), r = Wu(e);
	return !(!n || !r || n.type !== r.type || n.value !== r.value || !Uu(e, t) || !Hu(e, t));
}
function Hu(e, t) {
	let n = Gu(e), r = Gu(t);
	if (!n && !r) return !0;
	if (n && !r || !n && r || (n = n, r = r, r.length !== n.length)) return !1;
	for (let e = 0; e < r.length; e++) {
		let t = r[e], i = n[e];
		if (t.filename !== i.filename || t.lineno !== i.lineno || t.colno !== i.colno || t.function !== i.function) return !1;
	}
	return !0;
}
function Uu(e, t) {
	let n = e.fingerprint, r = t.fingerprint;
	if (!n && !r) return !0;
	if (n && !r || !n && r) return !1;
	n = n, r = r;
	try {
		return n.join("") === r.join("");
	} catch {
		return !1;
	}
}
function Wu(e) {
	return e.exception && e.exception.values && e.exception.values[0];
}
function Gu(e) {
	let t = e.exception;
	if (t) try {
		return t.values[0].stacktrace.frames;
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/browser/esm/integrations/globalhandlers.js
var Ku = "GlobalHandlers", qu = R(((e = {}) => {
	let t = {
		onerror: !0,
		onunhandledrejection: !0,
		...e
	};
	return {
		name: Ku,
		setupOnce() {
			Error.stackTraceLimit = 50;
		},
		setup(e) {
			t.onerror && (Yu(e), td("onerror")), t.onunhandledrejection && (Xu(e), td("onunhandledrejection"));
		}
	};
})), Ju = L(Ku, qu);
function Yu(e) {
	Ot((t) => {
		let { stackParser: n, attachStacktrace: r } = nd();
		if (P() !== e || Ml()) return;
		let { msg: i, url: a, line: o, column: s, error: l } = t, u = l === void 0 && c(i) ? $u(i, a, o, s) : ed(Wl(n, l || i, void 0, r, !1), a, o, s);
		u.level = "error", Nr(u, {
			originalException: l,
			mechanism: {
				handled: !1,
				type: "onerror"
			}
		});
	});
}
function Xu(e) {
	jt((t) => {
		let { stackParser: n, attachStacktrace: r } = nd();
		if (P() !== e || Ml()) return;
		let i = Zu(t), a = u(i) ? Qu(i) : Wl(n, i, void 0, r, !0);
		a.level = "error", Nr(a, {
			originalException: i,
			mechanism: {
				handled: !1,
				type: "onunhandledrejection"
			}
		});
	});
}
function Zu(e) {
	if (u(e)) return e;
	let t = e;
	try {
		if ("reason" in t) return t.reason;
		if ("detail" in t && "reason" in t.detail) return t.detail.reason;
	} catch {}
	return e;
}
function Qu(e) {
	return { exception: { values: [{
		type: "UnhandledRejection",
		value: `Non-Error promise rejection captured with value: ${String(e)}`
	}] } };
}
function $u(e, t, n, r) {
	let i = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i, o = a(e) ? e.message : e, s = "Error", c = o.match(i);
	return c && (s = c[1], o = c[2]), ed({ exception: { values: [{
		type: s,
		value: o
	}] } }, t, n, r);
}
function ed(e, t, n, r) {
	let i = e.exception = e.exception || {}, a = i.values = i.values || [], o = a[0] = a[0] || {}, s = o.stacktrace = o.stacktrace || {}, l = s.frames = s.frames || [], u = isNaN(parseInt(r, 10)) ? void 0 : r, d = isNaN(parseInt(n, 10)) ? void 0 : n, f = c(t) && t.length > 0 ? t : de();
	return l.length === 0 && l.push({
		colno: u,
		filename: f,
		function: "?",
		in_app: !0,
		lineno: d
	}), e;
}
function td(e) {
	W && D.log(`Global Handler attached: ${e}`);
}
function nd() {
	let e = P();
	return e && e.getOptions() || {
		stackParser: () => [],
		attachStacktrace: !1
	};
}
//#endregion
//#region node_modules/@sentry/browser/esm/integrations/httpcontext.js
var rd = "HttpContext", id = R((() => ({
	name: rd,
	setupOnce() {},
	preprocessEvent(e) {
		if (!U.navigator && !U.location && !U.document) return;
		let t = e.request && e.request.url || U.location && U.location.href, { referrer: n } = U.document || {}, { userAgent: r } = U.navigator || {}, i = {
			...e.request && e.request.headers,
			...n && { Referer: n },
			...r && { "User-Agent": r }
		};
		e.request = {
			...e.request,
			...t && { url: t },
			headers: i
		};
	}
}))), ad = L(rd, id), od = "cause", sd = 5, cd = "LinkedErrors", ld = R(((e = {}) => {
	let t = e.limit || sd, n = e.key || od;
	return {
		name: cd,
		setupOnce() {},
		preprocessEvent(e, r, i) {
			let a = i.getOptions();
			ee(Fl, a.stackParser, a.maxValueLength, n, t, e, r);
		}
	};
})), ud = L(cd, ld), dd = /* @__PURE__ */ "EventTarget.Window.Node.ApplicationCache.AudioTrackList.BroadcastChannel.ChannelMergerNode.CryptoOperation.EventSource.FileReader.HTMLUnknownElement.IDBDatabase.IDBRequest.IDBTransaction.KeyOperation.MediaController.MessagePort.ModalWindow.Notification.SVGElementInstance.Screen.SharedWorker.TextTrack.TextTrackCue.TextTrackList.WebSocket.WebSocketWorker.Worker.XMLHttpRequest.XMLHttpRequestEventTarget.XMLHttpRequestUpload".split("."), fd = "TryCatch", pd = R(((e = {}) => {
	let t = {
		XMLHttpRequest: !0,
		eventTarget: !0,
		requestAnimationFrame: !0,
		setInterval: !0,
		setTimeout: !0,
		...e
	};
	return {
		name: fd,
		setupOnce() {
			t.setTimeout && O(U, "setTimeout", hd), t.setInterval && O(U, "setInterval", hd), t.requestAnimationFrame && O(U, "requestAnimationFrame", gd), t.XMLHttpRequest && "XMLHttpRequest" in U && O(XMLHttpRequest.prototype, "send", _d);
			let e = t.eventTarget;
			e && (Array.isArray(e) ? e : dd).forEach(vd);
		}
	};
})), md = L(fd, pd);
function hd(e) {
	return function(...t) {
		let n = t[0];
		return t[0] = Pl(n, { mechanism: {
			data: { function: Ge(e) },
			handled: !1,
			type: "instrument"
		} }), e.apply(this, t);
	};
}
function gd(e) {
	return function(t) {
		return e.apply(this, [Pl(t, { mechanism: {
			data: {
				function: "requestAnimationFrame",
				handler: Ge(e)
			},
			handled: !1,
			type: "instrument"
		} })]);
	};
}
function _d(e) {
	return function(...t) {
		let n = this;
		return [
			"onload",
			"onerror",
			"onprogress",
			"onreadystatechange"
		].forEach((e) => {
			e in n && typeof n[e] == "function" && O(n, e, function(t) {
				let n = { mechanism: {
					data: {
						function: e,
						handler: Ge(t)
					},
					handled: !1,
					type: "instrument"
				} }, r = Ae(t);
				return r && (n.mechanism.data.handler = Ge(r)), Pl(t, n);
			});
		}), e.apply(this, t);
	};
}
function vd(e) {
	let t = U, n = t[e] && t[e].prototype;
	!n || !n.hasOwnProperty || !n.hasOwnProperty("addEventListener") || (O(n, "addEventListener", function(t) {
		return function(n, r, i) {
			try {
				typeof r.handleEvent == "function" && (r.handleEvent = Pl(r.handleEvent, { mechanism: {
					data: {
						function: "handleEvent",
						handler: Ge(r),
						target: e
					},
					handled: !1,
					type: "instrument"
				} }));
			} catch {}
			return t.apply(this, [
				n,
				Pl(r, { mechanism: {
					data: {
						function: "addEventListener",
						handler: Ge(r),
						target: e
					},
					handled: !1,
					type: "instrument"
				} }),
				i
			]);
		};
	}), O(n, "removeEventListener", function(e) {
		return function(t, n, r) {
			let i = n;
			try {
				let n = i && i.__sentry_wrapped__;
				n && e.call(this, t, n, r);
			} catch {}
			return e.call(this, t, i, r);
		};
	}));
}
//#endregion
//#region node_modules/@sentry/browser/esm/sdk.js
var yd = [
	Vo(),
	ns(),
	pd(),
	Du(),
	qu(),
	ld(),
	Lu(),
	id()
];
function bd(e) {
	return [...yd];
}
function xd(e = {}) {
	e.defaultIntegrations === void 0 && (e.defaultIntegrations = bd()), e.release === void 0 && (typeof __SENTRY_RELEASE__ == "string" && (e.release = __SENTRY_RELEASE__), U.SENTRY_RELEASE && U.SENTRY_RELEASE.id && (e.release = U.SENTRY_RELEASE.id)), e.autoSessionTracking === void 0 && (e.autoSessionTracking = !0), e.sendClientReports === void 0 && (e.sendClientReports = !0), oo(Xl, {
		...e,
		stackParser: He(e.stackParser || Cu),
		integrations: Na(e),
		transport: e.transport || (vt() ? eu : nu)
	}), e.autoSessionTracking && Ed();
}
var Sd = (e = {}, t = I()) => {
	if (!U.document) {
		W && D.error("Global document not defined in showReportDialog call");
		return;
	}
	let { client: n, scope: r } = t.getStackTop(), i = e.dsn || n && n.getDsn();
	if (!i) {
		W && D.error("DSN not configured for showReportDialog call");
		return;
	}
	r && (e.user = {
		...r.getUser(),
		...e.user
	}), e.eventId ||= t.lastEventId();
	let a = U.document.createElement("script");
	a.async = !0, a.crossOrigin = "anonymous", a.src = Aa(i, e), e.onLoad && (a.onload = e.onLoad);
	let { onClose: o } = e;
	if (o) {
		let e = (t) => {
			if (t.data === "__sentry_reportdialog_closed__") try {
				o();
			} finally {
				U.removeEventListener("message", e);
			}
		};
		U.addEventListener("message", e);
	}
	let s = U.document.head || U.document.body;
	s ? s.appendChild(a) : W && D.error("Not injecting report dialog. No injection point found in HTML");
};
function Cd() {}
function wd(e) {
	e();
}
function Td(e) {
	return Pl(e)();
}
function Ed() {
	if (U.document === void 0) {
		W && D.warn("Session tracking in non-browser environment with @sentry/browser is not supported.");
		return;
	}
	Xr({ ignoreDuration: !0 }), $r(), Lt(({ from: e, to: t }) => {
		e !== void 0 && e !== t && (Xr({ ignoreDuration: !0 }), $r());
	});
}
function Dd(e) {
	let t = P();
	t && t.captureUserFeedback(e);
}
//#endregion
//#region node_modules/@sentry/browser/esm/integrations/index.js
var Od = /* @__PURE__ */ t({
	Breadcrumbs: () => Ou,
	Dedupe: () => Ru,
	GlobalHandlers: () => Ju,
	HttpContext: () => ad,
	LinkedErrors: () => ud,
	TryCatch: () => md
}), G = T, kd = "sentryReplaySession", Ad = "replay_event", jd = "Unable to send Replay", Md = 3e5, Nd = 9e5, Pd = 5e3, Fd = 5500, Id = 6e4, Ld = 5e3, Rd = 3, zd = 15e4, Bd = 5e3, Vd = 3e3, Hd = 300, Ud = 2e7, Wd = 4999, Gd = 15e3, Kd = 36e5;
function qd(e, t) {
	return e ?? t();
}
function Jd(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
var K;
(function(e) {
	e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment";
})(K ||= {});
function Yd(e) {
	return e.nodeType === e.ELEMENT_NODE;
}
function Xd(e) {
	return Jd([
		Jd([
			e,
			"optionalAccess",
			(e) => e.host
		]),
		"optionalAccess",
		(e) => e.shadowRoot
	]) === e;
}
function Zd(e) {
	return Object.prototype.toString.call(e) === "[object ShadowRoot]";
}
function Qd(e) {
	return e.includes(" background-clip: text;") && !e.includes(" -webkit-background-clip: text;") && (e = e.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;")), e;
}
function $d(e) {
	let { cssText: t } = e;
	if (t.split("\"").length < 3) return t;
	let n = ["@import", `url(${JSON.stringify(e.href)})`];
	return e.layerName === "" ? n.push("layer") : e.layerName && n.push(`layer(${e.layerName})`), e.supportsText && n.push(`supports(${e.supportsText})`), e.media.length && n.push(e.media.mediaText), n.join(" ") + ";";
}
function ef(e) {
	try {
		let t = e.rules || e.cssRules;
		return t ? Qd(Array.from(t, tf).join("")) : null;
	} catch {
		return null;
	}
}
function tf(e) {
	let t;
	if (rf(e)) try {
		t = ef(e.styleSheet) || $d(e);
	} catch {}
	else if (af(e) && e.selectorText.includes(":")) return nf(e.cssText);
	return t || e.cssText;
}
function nf(e) {
	return e.replace(/(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm, "$1\\$2");
}
function rf(e) {
	return "styleSheet" in e;
}
function af(e) {
	return "selectorText" in e;
}
var of = class {
	constructor() {
		this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
	}
	getId(e) {
		return e ? qd(Jd([
			this,
			"access",
			(e) => e.getMeta,
			"call",
			(t) => t(e),
			"optionalAccess",
			(e) => e.id
		]), () => -1) : -1;
	}
	getNode(e) {
		return this.idNodeMap.get(e) || null;
	}
	getIds() {
		return Array.from(this.idNodeMap.keys());
	}
	getMeta(e) {
		return this.nodeMetaMap.get(e) || null;
	}
	removeNodeFromMap(e) {
		let t = this.getId(e);
		this.idNodeMap.delete(t), e.childNodes && e.childNodes.forEach((e) => this.removeNodeFromMap(e));
	}
	has(e) {
		return this.idNodeMap.has(e);
	}
	hasNode(e) {
		return this.nodeMetaMap.has(e);
	}
	add(e, t) {
		let n = t.id;
		this.idNodeMap.set(n, e), this.nodeMetaMap.set(e, t);
	}
	replace(e, t) {
		let n = this.getNode(e);
		if (n) {
			let e = this.nodeMetaMap.get(n);
			e && this.nodeMetaMap.set(t, e);
		}
		this.idNodeMap.set(e, t);
	}
	reset() {
		this.idNodeMap = /* @__PURE__ */ new Map(), this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
	}
};
function sf() {
	return new of();
}
function cf({ maskInputOptions: e, tagName: t, type: n }) {
	return t === "OPTION" && (t = "SELECT"), !!(e[t.toLowerCase()] || n && e[n] || n === "password" || t === "INPUT" && !n && e.text);
}
function lf({ isMasked: e, element: t, value: n, maskInputFn: r }) {
	let i = n || "";
	return e ? (r && (i = r(i, t)), "*".repeat(i.length)) : i;
}
function uf(e) {
	return e.toLowerCase();
}
function df(e) {
	return e.toUpperCase();
}
var ff = "__rrweb_original__";
function pf(e) {
	let t = e.getContext("2d");
	if (!t) return !0;
	for (let n = 0; n < e.width; n += 50) for (let r = 0; r < e.height; r += 50) {
		let i = t.getImageData, a = ff in i ? i[ff] : i;
		if (new Uint32Array(a.call(t, n, r, Math.min(50, e.width - n), Math.min(50, e.height - r)).data.buffer).some((e) => e !== 0)) return !1;
	}
	return !0;
}
function mf(e) {
	let t = e.type;
	return e.hasAttribute("data-rr-is-password") ? "password" : t ? uf(t) : null;
}
function hf(e, t, n) {
	return t === "INPUT" && (n === "radio" || n === "checkbox") ? e.getAttribute("value") || "" : e.value;
}
var gf = 1, _f = /* @__PURE__ */ RegExp("[^a-z0-9-_:]"), vf = -2;
function yf() {
	return gf++;
}
function bf(e) {
	if (e instanceof HTMLFormElement) return "form";
	let t = uf(e.tagName);
	return _f.test(t) ? "div" : t;
}
function xf(e) {
	let t = "";
	return t = e.indexOf("//") > -1 ? e.split("/").slice(0, 3).join("/") : e.split("/")[0], t = t.split("?")[0], t;
}
var Sf, Cf, wf = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm, Tf = /^(?:[a-z+]+:)?\/\//i, Ef = /^www\..*/i, Df = /^(data:)([^,]*),(.*)/i;
function Of(e, t) {
	return (e || "").replace(wf, (e, n, r, i, a, o) => {
		let s = r || a || o, c = n || i || "";
		if (!s) return e;
		if (Tf.test(s) || Ef.test(s) || Df.test(s)) return `url(${c}${s}${c})`;
		if (s[0] === "/") return `url(${c}${xf(t) + s}${c})`;
		let l = t.split("/"), u = s.split("/");
		l.pop();
		for (let e of u) if (e === ".") continue;
		else e === ".." ? l.pop() : l.push(e);
		return `url(${c}${l.join("/")}${c})`;
	});
}
var kf = /^[^ \t\n\r\u000c]+/, Af = /^[, \t\n\r\u000c]+/;
function jf(e, t) {
	if (t.trim() === "") return t;
	let n = 0;
	function r(e) {
		let r, i = e.exec(t.substring(n));
		return i ? (r = i[0], n += r.length, r) : "";
	}
	let i = [];
	for (; r(Af), !(n >= t.length);) {
		let a = r(kf);
		if (a.slice(-1) === ",") a = Mf(e, a.substring(0, a.length - 1)), i.push(a);
		else {
			let r = "";
			a = Mf(e, a);
			let o = !1;
			for (;;) {
				let e = t.charAt(n);
				if (e === "") {
					i.push((a + r).trim());
					break;
				} else if (o) e === ")" && (o = !1);
				else if (e === ",") {
					n += 1, i.push((a + r).trim());
					break;
				} else e === "(" && (o = !0);
				r += e, n += 1;
			}
		}
	}
	return i.join(", ");
}
function Mf(e, t) {
	if (!t || t.trim() === "") return t;
	let n = e.createElement("a");
	return n.href = t, n.href;
}
function Nf(e) {
	return !!(e.tagName === "svg" || e.ownerSVGElement);
}
function Pf() {
	let e = document.createElement("a");
	return e.href = "", e.href;
}
function Ff(e, t, n, r, i, a) {
	return r && (n === "src" || n === "href" && !(t === "use" && r[0] === "#") || n === "xlink:href" && r[0] !== "#" || n === "background" && (t === "table" || t === "td" || t === "th") ? Mf(e, r) : n === "srcset" ? jf(e, r) : n === "style" ? Of(r, Pf()) : t === "object" && n === "data" ? Mf(e, r) : typeof a == "function" ? a(n, r, i) : r);
}
function If(e, t, n) {
	return (e === "video" || e === "audio") && t === "autoplay";
}
function Lf(e, t, n, r) {
	try {
		if (r && e.matches(r)) return !1;
		if (typeof t == "string") {
			if (e.classList.contains(t)) return !0;
		} else for (let n = e.classList.length; n--;) {
			let r = e.classList[n];
			if (t.test(r)) return !0;
		}
		if (n) return e.matches(n);
	} catch {}
	return !1;
}
function Rf(e, t) {
	for (let n = e.classList.length; n--;) {
		let r = e.classList[n];
		if (t.test(r)) return !0;
	}
	return !1;
}
function zf(e, t, n = Infinity, r = 0) {
	return !e || e.nodeType !== e.ELEMENT_NODE || r > n ? -1 : t(e) ? r : zf(e.parentNode, t, n, r + 1);
}
function Bf(e, t) {
	return (n) => {
		let r = n;
		if (r === null) return !1;
		try {
			if (e) {
				if (typeof e == "string") {
					if (r.matches(`.${e}`)) return !0;
				} else if (Rf(r, e)) return !0;
			}
			return !!(t && r.matches(t));
		} catch {
			return !1;
		}
	};
}
function Vf(e, t, n, r, i, a) {
	try {
		let o = e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
		if (o === null) return !1;
		if (o.tagName === "INPUT") {
			let e = o.getAttribute("autocomplete");
			if ([
				"current-password",
				"new-password",
				"cc-number",
				"cc-exp",
				"cc-exp-month",
				"cc-exp-year",
				"cc-csc"
			].includes(e)) return !0;
		}
		let s = -1, c = -1;
		if (a) {
			if (c = zf(o, Bf(r, i)), c < 0) return !0;
			s = zf(o, Bf(t, n), c >= 0 ? c : Infinity);
		} else {
			if (s = zf(o, Bf(t, n)), s < 0) return !1;
			c = zf(o, Bf(r, i), s >= 0 ? s : Infinity);
		}
		return s >= 0 ? c >= 0 ? s <= c : !0 : c >= 0 ? !1 : !!a;
	} catch {}
	return !!a;
}
function Hf(e, t, n) {
	let r = e.contentWindow;
	if (!r) return;
	let i = !1, a;
	try {
		a = r.document.readyState;
	} catch {
		return;
	}
	if (a !== "complete") {
		let r = setTimeout(() => {
			i ||= (t(), !0);
		}, n);
		e.addEventListener("load", () => {
			clearTimeout(r), i = !0, t();
		});
		return;
	}
	let o = "about:blank";
	if (r.location.href !== o || e.src === o || e.src === "") return setTimeout(t, 0), e.addEventListener("load", t);
	e.addEventListener("load", t);
}
function Uf(e, t, n) {
	let r = !1, i;
	try {
		i = e.sheet;
	} catch {
		return;
	}
	if (i) return;
	let a = setTimeout(() => {
		r ||= (t(), !0);
	}, n);
	e.addEventListener("load", () => {
		clearTimeout(a), r = !0, t();
	});
}
function Wf(e, t) {
	let { doc: n, mirror: r, blockClass: i, blockSelector: a, unblockSelector: o, maskAllText: s, maskAttributeFn: c, maskTextClass: l, unmaskTextClass: u, maskTextSelector: d, unmaskTextSelector: f, inlineStylesheet: p, maskInputOptions: m = {}, maskTextFn: h, maskInputFn: g, dataURLOptions: _ = {}, inlineImages: v, recordCanvas: y, keepIframeSrcFn: b, newlyAddedElement: x = !1 } = t, S = Gf(n, r);
	switch (e.nodeType) {
		case e.DOCUMENT_NODE: return e.compatMode === "CSS1Compat" ? {
			type: K.Document,
			childNodes: []
		} : {
			type: K.Document,
			childNodes: [],
			compatMode: e.compatMode
		};
		case e.DOCUMENT_TYPE_NODE: return {
			type: K.DocumentType,
			name: e.name,
			publicId: e.publicId,
			systemId: e.systemId,
			rootId: S
		};
		case e.ELEMENT_NODE: return qf(e, {
			doc: n,
			blockClass: i,
			blockSelector: a,
			unblockSelector: o,
			inlineStylesheet: p,
			maskAttributeFn: c,
			maskInputOptions: m,
			maskInputFn: g,
			dataURLOptions: _,
			inlineImages: v,
			recordCanvas: y,
			keepIframeSrcFn: b,
			newlyAddedElement: x,
			rootId: S,
			maskAllText: s,
			maskTextClass: l,
			unmaskTextClass: u,
			maskTextSelector: d,
			unmaskTextSelector: f
		});
		case e.TEXT_NODE: return Kf(e, {
			maskAllText: s,
			maskTextClass: l,
			unmaskTextClass: u,
			maskTextSelector: d,
			unmaskTextSelector: f,
			maskTextFn: h,
			maskInputOptions: m,
			maskInputFn: g,
			rootId: S
		});
		case e.CDATA_SECTION_NODE: return {
			type: K.CDATA,
			textContent: "",
			rootId: S
		};
		case e.COMMENT_NODE: return {
			type: K.Comment,
			textContent: e.textContent || "",
			rootId: S
		};
		default: return !1;
	}
}
function Gf(e, t) {
	if (!t.hasNode(e)) return;
	let n = t.getId(e);
	return n === 1 ? void 0 : n;
}
function Kf(e, t) {
	let { maskAllText: n, maskTextClass: r, unmaskTextClass: i, maskTextSelector: a, unmaskTextSelector: o, maskTextFn: s, maskInputOptions: c, maskInputFn: l, rootId: u } = t, d = e.parentNode && e.parentNode.tagName, f = e.textContent, p = d === "STYLE" || void 0, m = d === "SCRIPT" || void 0, h = d === "TEXTAREA" || void 0;
	if (p && f) {
		try {
			e.nextSibling || e.previousSibling || Jd([
				e,
				"access",
				(e) => e.parentNode,
				"access",
				(e) => e.sheet,
				"optionalAccess",
				(e) => e.cssRules
			]) && (f = ef(e.parentNode.sheet));
		} catch (t) {
			console.warn(`Cannot get CSS styles from text's parentNode. Error: ${t}`, e);
		}
		f = Of(f, Pf());
	}
	m && (f = "SCRIPT_PLACEHOLDER");
	let g = Vf(e, r, a, i, o, n);
	return !p && !m && !h && f && g && (f = s ? s(f, e.parentElement) : f.replace(/[\S]/g, "*")), h && f && (c.textarea || g) && (f = l ? l(f, e.parentNode) : f.replace(/[\S]/g, "*")), d === "OPTION" && f && (f = lf({
		isMasked: Vf(e, r, a, i, o, cf({
			type: null,
			tagName: d,
			maskInputOptions: c
		})),
		element: e,
		value: f,
		maskInputFn: l
	})), {
		type: K.Text,
		textContent: f || "",
		isStyle: p,
		rootId: u
	};
}
function qf(e, t) {
	let { doc: n, blockClass: r, blockSelector: i, unblockSelector: a, inlineStylesheet: o, maskInputOptions: s = {}, maskAttributeFn: c, maskInputFn: l, dataURLOptions: u = {}, inlineImages: d, recordCanvas: f, keepIframeSrcFn: p, newlyAddedElement: m = !1, rootId: h, maskAllText: g, maskTextClass: _, unmaskTextClass: v, maskTextSelector: y, unmaskTextSelector: b } = t, x = Lf(e, r, i, a), S = bf(e), C = {}, w = e.attributes.length;
	for (let t = 0; t < w; t++) {
		let r = e.attributes[t];
		r.name && !If(S, r.name, r.value) && (C[r.name] = Ff(n, S, uf(r.name), r.value, e, c));
	}
	if (S === "link" && o) {
		let t = Array.from(n.styleSheets).find((t) => t.href === e.href), r = null;
		t && (r = ef(t)), r && (delete C.rel, delete C.href, C._cssText = Of(r, t.href));
	}
	if (S === "style" && e.sheet && !(e.innerText || e.textContent || "").trim().length) {
		let t = ef(e.sheet);
		t && (C._cssText = Of(t, Pf()));
	}
	if (S === "input" || S === "textarea" || S === "select" || S === "option") {
		let t = e, n = mf(t), r = hf(t, df(S), n), i = t.checked;
		if (n !== "submit" && n !== "button" && r) {
			let e = Vf(t, _, y, v, b, cf({
				type: n,
				tagName: df(S),
				maskInputOptions: s
			}));
			C.value = lf({
				isMasked: e,
				element: t,
				value: r,
				maskInputFn: l
			});
		}
		i && (C.checked = i);
	}
	if (S === "option" && (e.selected && !s.select ? C.selected = !0 : delete C.selected), S === "canvas" && f) {
		if (e.__context === "2d") pf(e) || (C.rr_dataURL = e.toDataURL(u.type, u.quality));
		else if (!("__context" in e)) {
			let t = e.toDataURL(u.type, u.quality), n = document.createElement("canvas");
			n.width = e.width, n.height = e.height, t !== n.toDataURL(u.type, u.quality) && (C.rr_dataURL = t);
		}
	}
	if (S === "img" && d) {
		Sf || (Sf = n.createElement("canvas"), Cf = Sf.getContext("2d"));
		let t = e, r = t.crossOrigin;
		t.crossOrigin = "anonymous";
		let i = () => {
			t.removeEventListener("load", i);
			try {
				Sf.width = t.naturalWidth, Sf.height = t.naturalHeight, Cf.drawImage(t, 0, 0), C.rr_dataURL = Sf.toDataURL(u.type, u.quality);
			} catch (e) {
				console.warn(`Cannot inline img src=${t.currentSrc}! Error: ${e}`);
			}
			r ? C.crossOrigin = r : t.removeAttribute("crossorigin");
		};
		t.complete && t.naturalWidth !== 0 ? i() : t.addEventListener("load", i);
	}
	if ((S === "audio" || S === "video") && (C.rr_mediaState = e.paused ? "paused" : "played", C.rr_mediaCurrentTime = e.currentTime), m || (e.scrollLeft && (C.rr_scrollLeft = e.scrollLeft), e.scrollTop && (C.rr_scrollTop = e.scrollTop)), x) {
		let { width: t, height: n } = e.getBoundingClientRect();
		C = {
			class: C.class,
			rr_width: `${t}px`,
			rr_height: `${n}px`
		};
	}
	S === "iframe" && !p(C.src) && (e.contentDocument || (C.rr_src = C.src), delete C.src);
	let ee;
	try {
		customElements.get(S) && (ee = !0);
	} catch {}
	return {
		type: K.Element,
		tagName: S,
		attributes: C,
		childNodes: [],
		isSVG: Nf(e) || void 0,
		needBlock: x,
		rootId: h,
		isCustom: ee
	};
}
function q(e) {
	return e == null ? "" : e.toLowerCase();
}
function Jf(e, t) {
	return !!(t.comment && e.type === K.Comment || e.type === K.Element && (t.script && (e.tagName === "script" || e.tagName === "link" && (e.attributes.rel === "preload" || e.attributes.rel === "modulepreload") && e.attributes.as === "script" || e.tagName === "link" && e.attributes.rel === "prefetch" && typeof e.attributes.href == "string" && e.attributes.href.endsWith(".js")) || t.headFavicon && (e.tagName === "link" && e.attributes.rel === "shortcut icon" || e.tagName === "meta" && (q(e.attributes.name).match(/^msapplication-tile(image|color)$/) || q(e.attributes.name) === "application-name" || q(e.attributes.rel) === "icon" || q(e.attributes.rel) === "apple-touch-icon" || q(e.attributes.rel) === "shortcut icon")) || e.tagName === "meta" && (t.headMetaDescKeywords && q(e.attributes.name).match(/^description|keywords$/) || t.headMetaSocial && (q(e.attributes.property).match(/^(og|twitter|fb):/) || q(e.attributes.name).match(/^(og|twitter):/) || q(e.attributes.name) === "pinterest") || t.headMetaRobots && (q(e.attributes.name) === "robots" || q(e.attributes.name) === "googlebot" || q(e.attributes.name) === "bingbot") || t.headMetaHttpEquiv && e.attributes["http-equiv"] !== void 0 || t.headMetaAuthorship && (q(e.attributes.name) === "author" || q(e.attributes.name) === "generator" || q(e.attributes.name) === "framework" || q(e.attributes.name) === "publisher" || q(e.attributes.name) === "progid" || q(e.attributes.property).match(/^article:/) || q(e.attributes.property).match(/^product:/)) || t.headMetaVerification && (q(e.attributes.name) === "google-site-verification" || q(e.attributes.name) === "yandex-verification" || q(e.attributes.name) === "csrf-token" || q(e.attributes.name) === "p:domain_verify" || q(e.attributes.name) === "verify-v1" || q(e.attributes.name) === "verification" || q(e.attributes.name) === "shopify-checkout-api-token"))));
}
function Yf(e, t) {
	let { doc: n, mirror: r, blockClass: i, blockSelector: a, unblockSelector: o, maskAllText: s, maskTextClass: c, unmaskTextClass: l, maskTextSelector: u, unmaskTextSelector: d, skipChild: f = !1, inlineStylesheet: p = !0, maskInputOptions: m = {}, maskAttributeFn: h, maskTextFn: g, maskInputFn: _, slimDOMOptions: v, dataURLOptions: y = {}, inlineImages: b = !1, recordCanvas: x = !1, onSerialize: S, onIframeLoad: C, iframeLoadTimeout: w = 5e3, onStylesheetLoad: ee, stylesheetLoadTimeout: te = 5e3, keepIframeSrcFn: ne = () => !1, newlyAddedElement: re = !1 } = t, { preserveWhiteSpace: ie = !0 } = t, ae = Wf(e, {
		doc: n,
		mirror: r,
		blockClass: i,
		blockSelector: a,
		maskAllText: s,
		unblockSelector: o,
		maskTextClass: c,
		unmaskTextClass: l,
		maskTextSelector: u,
		unmaskTextSelector: d,
		inlineStylesheet: p,
		maskInputOptions: m,
		maskAttributeFn: h,
		maskTextFn: g,
		maskInputFn: _,
		dataURLOptions: y,
		inlineImages: b,
		recordCanvas: x,
		keepIframeSrcFn: ne,
		newlyAddedElement: re
	});
	if (!ae) return console.warn(e, "not serialized"), null;
	let T;
	T = r.hasNode(e) ? r.getId(e) : Jf(ae, v) || !ie && ae.type === K.Text && !ae.isStyle && !ae.textContent.replace(/^\s+|\s+$/gm, "").length ? vf : yf();
	let E = Object.assign(ae, { id: T });
	if (r.add(e, E), T === vf) return null;
	S && S(e);
	let oe = !f;
	if (E.type === K.Element) {
		oe &&= !E.needBlock, delete E.needBlock;
		let t = e.shadowRoot;
		t && Zd(t) && (E.isShadowHost = !0);
	}
	if ((E.type === K.Document || E.type === K.Element) && oe) {
		v.headWhitespace && E.type === K.Element && E.tagName === "head" && (ie = !1);
		let t = {
			doc: n,
			mirror: r,
			blockClass: i,
			blockSelector: a,
			maskAllText: s,
			unblockSelector: o,
			maskTextClass: c,
			unmaskTextClass: l,
			maskTextSelector: u,
			unmaskTextSelector: d,
			skipChild: f,
			inlineStylesheet: p,
			maskInputOptions: m,
			maskAttributeFn: h,
			maskTextFn: g,
			maskInputFn: _,
			slimDOMOptions: v,
			dataURLOptions: y,
			inlineImages: b,
			recordCanvas: x,
			preserveWhiteSpace: ie,
			onSerialize: S,
			onIframeLoad: C,
			iframeLoadTimeout: w,
			onStylesheetLoad: ee,
			stylesheetLoadTimeout: te,
			keepIframeSrcFn: ne
		};
		for (let n of Array.from(e.childNodes)) {
			let e = Yf(n, t);
			e && E.childNodes.push(e);
		}
		if (Yd(e) && e.shadowRoot) for (let n of Array.from(e.shadowRoot.childNodes)) {
			let r = Yf(n, t);
			r && (Zd(e.shadowRoot) && (r.isShadow = !0), E.childNodes.push(r));
		}
	}
	return e.parentNode && Xd(e.parentNode) && Zd(e.parentNode) && (E.isShadow = !0), E.type === K.Element && E.tagName === "iframe" && Hf(e, () => {
		let t = e.contentDocument;
		if (t && C) {
			let n = Yf(t, {
				doc: t,
				mirror: r,
				blockClass: i,
				blockSelector: a,
				unblockSelector: o,
				maskAllText: s,
				maskTextClass: c,
				unmaskTextClass: l,
				maskTextSelector: u,
				unmaskTextSelector: d,
				skipChild: !1,
				inlineStylesheet: p,
				maskInputOptions: m,
				maskAttributeFn: h,
				maskTextFn: g,
				maskInputFn: _,
				slimDOMOptions: v,
				dataURLOptions: y,
				inlineImages: b,
				recordCanvas: x,
				preserveWhiteSpace: ie,
				onSerialize: S,
				onIframeLoad: C,
				iframeLoadTimeout: w,
				onStylesheetLoad: ee,
				stylesheetLoadTimeout: te,
				keepIframeSrcFn: ne
			});
			n && C(e, n);
		}
	}, w), E.type === K.Element && E.tagName === "link" && E.attributes.rel === "stylesheet" && Uf(e, () => {
		if (ee) {
			let t = Yf(e, {
				doc: n,
				mirror: r,
				blockClass: i,
				blockSelector: a,
				unblockSelector: o,
				maskAllText: s,
				maskTextClass: c,
				unmaskTextClass: l,
				maskTextSelector: u,
				unmaskTextSelector: d,
				skipChild: !1,
				inlineStylesheet: p,
				maskInputOptions: m,
				maskAttributeFn: h,
				maskTextFn: g,
				maskInputFn: _,
				slimDOMOptions: v,
				dataURLOptions: y,
				inlineImages: b,
				recordCanvas: x,
				preserveWhiteSpace: ie,
				onSerialize: S,
				onIframeLoad: C,
				iframeLoadTimeout: w,
				onStylesheetLoad: ee,
				stylesheetLoadTimeout: te,
				keepIframeSrcFn: ne
			});
			t && ee(e, t);
		}
	}, te), E;
}
function Xf(e, t) {
	let { mirror: n = new of(), blockClass: r = "rr-block", blockSelector: i = null, unblockSelector: a = null, maskAllText: o = !1, maskTextClass: s = "rr-mask", unmaskTextClass: c = null, maskTextSelector: l = null, unmaskTextSelector: u = null, inlineStylesheet: d = !0, inlineImages: f = !1, recordCanvas: p = !1, maskAllInputs: m = !1, maskAttributeFn: h, maskTextFn: g, maskInputFn: _, slimDOM: v = !1, dataURLOptions: y, preserveWhiteSpace: b, onSerialize: x, onIframeLoad: S, iframeLoadTimeout: C, onStylesheetLoad: w, stylesheetLoadTimeout: ee, keepIframeSrcFn: te = () => !1 } = t || {};
	return Yf(e, {
		doc: e,
		mirror: n,
		blockClass: r,
		blockSelector: i,
		unblockSelector: a,
		maskAllText: o,
		maskTextClass: s,
		unmaskTextClass: c,
		maskTextSelector: l,
		unmaskTextSelector: u,
		skipChild: !1,
		inlineStylesheet: d,
		maskInputOptions: m === !0 ? {
			color: !0,
			date: !0,
			"datetime-local": !0,
			email: !0,
			month: !0,
			number: !0,
			range: !0,
			search: !0,
			tel: !0,
			text: !0,
			time: !0,
			url: !0,
			week: !0,
			textarea: !0,
			select: !0
		} : m === !1 ? {} : m,
		maskAttributeFn: h,
		maskTextFn: g,
		maskInputFn: _,
		slimDOMOptions: v === !0 || v === "all" ? {
			script: !0,
			comment: !0,
			headFavicon: !0,
			headWhitespace: !0,
			headMetaDescKeywords: v === "all",
			headMetaSocial: !0,
			headMetaRobots: !0,
			headMetaHttpEquiv: !0,
			headMetaAuthorship: !0,
			headMetaVerification: !0
		} : v === !1 ? {} : v,
		dataURLOptions: y,
		inlineImages: f,
		recordCanvas: p,
		preserveWhiteSpace: b,
		onSerialize: x,
		onIframeLoad: S,
		iframeLoadTimeout: C,
		onStylesheetLoad: w,
		stylesheetLoadTimeout: ee,
		keepIframeSrcFn: te,
		newlyAddedElement: !1
	});
}
function Zf(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
function Qf(e, t, n = document) {
	let r = {
		capture: !0,
		passive: !0
	};
	return n.addEventListener(e, t, r), () => n.removeEventListener(e, t, r);
}
var $f = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.", ep = {
	map: {},
	getId() {
		return console.error($f), -1;
	},
	getNode() {
		return console.error($f), null;
	},
	removeNodeFromMap() {
		console.error($f);
	},
	has() {
		return console.error($f), !1;
	},
	reset() {
		console.error($f);
	}
};
typeof window < "u" && window.Proxy && window.Reflect && (ep = new Proxy(ep, { get(e, t, n) {
	return t === "map" && console.error($f), Reflect.get(e, t, n);
} }));
function tp(e, t, n = {}) {
	let r = null, i = 0;
	return function(...a) {
		let o = Date.now();
		!i && n.leading === !1 && (i = o);
		let s = t - (o - i), c = this;
		s <= 0 || s > t ? (r &&= (Dp(r), null), i = o, e.apply(c, a)) : !r && n.trailing !== !1 && (r = Ep(() => {
			i = n.leading === !1 ? 0 : Date.now(), r = null, e.apply(c, a);
		}, s));
	};
}
function np(e, t, n, r, i = window) {
	let a = i.Object.getOwnPropertyDescriptor(e, t);
	return i.Object.defineProperty(e, t, r ? n : { set(e) {
		Ep(() => {
			n.set.call(this, e);
		}, 0), a && a.set && a.set.call(this, e);
	} }), () => np(e, t, a || {}, !0);
}
function rp(e, t, n) {
	try {
		if (!(t in e)) return () => {};
		let r = e[t], i = n(r);
		return typeof i == "function" && (i.prototype = i.prototype || {}, Object.defineProperties(i, { __rrweb_original__: {
			enumerable: !1,
			value: r
		} })), e[t] = i, () => {
			e[t] = r;
		};
	} catch {
		return () => {};
	}
}
var ip = Date.now;
/[1-9][0-9]{12}/.test(Date.now().toString()) || (ip = () => (/* @__PURE__ */ new Date()).getTime());
function ap(e) {
	let t = e.document;
	return {
		left: t.scrollingElement ? t.scrollingElement.scrollLeft : e.pageXOffset === void 0 ? Zf([
			t,
			"optionalAccess",
			(e) => e.documentElement,
			"access",
			(e) => e.scrollLeft
		]) || Zf([
			t,
			"optionalAccess",
			(e) => e.body,
			"optionalAccess",
			(e) => e.parentElement,
			"optionalAccess",
			(e) => e.scrollLeft
		]) || Zf([
			t,
			"optionalAccess",
			(e) => e.body,
			"optionalAccess",
			(e) => e.scrollLeft
		]) || 0 : e.pageXOffset,
		top: t.scrollingElement ? t.scrollingElement.scrollTop : e.pageYOffset === void 0 ? Zf([
			t,
			"optionalAccess",
			(e) => e.documentElement,
			"access",
			(e) => e.scrollTop
		]) || Zf([
			t,
			"optionalAccess",
			(e) => e.body,
			"optionalAccess",
			(e) => e.parentElement,
			"optionalAccess",
			(e) => e.scrollTop
		]) || Zf([
			t,
			"optionalAccess",
			(e) => e.body,
			"optionalAccess",
			(e) => e.scrollTop
		]) || 0 : e.pageYOffset
	};
}
function op() {
	return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function sp() {
	return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function cp(e) {
	return e ? e.nodeType === e.ELEMENT_NODE ? e : e.parentElement : null;
}
function lp(e, t, n, r, i) {
	if (!e) return !1;
	let a = cp(e);
	if (!a) return !1;
	let o = Bf(t, n);
	if (!i) {
		let e = r && a.matches(r);
		return o(a) && !e;
	}
	let s = zf(a, o), c = -1;
	return s < 0 ? !1 : (r && (c = zf(a, Bf(null, r))), s > -1 && c < 0 || s < c);
}
function up(e, t) {
	return t.getId(e) !== -1;
}
function dp(e, t) {
	return t.getId(e) === vf;
}
function fp(e, t) {
	if (Xd(e)) return !1;
	let n = t.getId(e);
	return t.has(n) ? e.parentNode && e.parentNode.nodeType === e.DOCUMENT_NODE ? !1 : !e.parentNode || fp(e.parentNode, t) : !0;
}
function pp(e) {
	return !!e.changedTouches;
}
function mp(e = window) {
	"NodeList" in e && !e.NodeList.prototype.forEach && (e.NodeList.prototype.forEach = Array.prototype.forEach), "DOMTokenList" in e && !e.DOMTokenList.prototype.forEach && (e.DOMTokenList.prototype.forEach = Array.prototype.forEach), Node.prototype.contains || (Node.prototype.contains = (...e) => {
		let t = e[0];
		if (!(0 in e)) throw TypeError("1 argument is required");
		do
			if (this === t) return !0;
		while (t &&= t.parentNode);
		return !1;
	});
}
function hp(e, t) {
	return !!(e.nodeName === "IFRAME" && t.getMeta(e));
}
function gp(e, t) {
	return !!(e.nodeName === "LINK" && e.nodeType === e.ELEMENT_NODE && e.getAttribute && e.getAttribute("rel") === "stylesheet" && t.getMeta(e));
}
function _p(e) {
	return !!Zf([
		e,
		"optionalAccess",
		(e) => e.shadowRoot
	]);
}
var vp = class {
	constructor() {
		this.id = 1, this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map();
	}
	getId(e) {
		return rr(this.styleIDMap.get(e), () => -1);
	}
	has(e) {
		return this.styleIDMap.has(e);
	}
	add(e, t) {
		if (this.has(e)) return this.getId(e);
		let n;
		return n = t === void 0 ? this.id++ : t, this.styleIDMap.set(e, n), this.idStyleMap.set(n, e), n;
	}
	getStyle(e) {
		return this.idStyleMap.get(e) || null;
	}
	reset() {
		this.styleIDMap = /* @__PURE__ */ new WeakMap(), this.idStyleMap = /* @__PURE__ */ new Map(), this.id = 1;
	}
	generateId() {
		return this.id++;
	}
};
function yp(e) {
	let t = null;
	return Zf([
		e,
		"access",
		(e) => e.getRootNode,
		"optionalCall",
		(e) => e(),
		"optionalAccess",
		(e) => e.nodeType
	]) === Node.DOCUMENT_FRAGMENT_NODE && e.getRootNode().host && (t = e.getRootNode().host), t;
}
function bp(e) {
	let t = e, n;
	for (; n = yp(t);) t = n;
	return t;
}
function xp(e) {
	let t = e.ownerDocument;
	if (!t) return !1;
	let n = bp(e);
	return t.contains(n);
}
function Sp(e) {
	let t = e.ownerDocument;
	return t ? t.contains(e) || xp(e) : !1;
}
var Cp = {};
function wp(e) {
	let t = Cp[e];
	if (t) return t;
	let n = window.document, r = window[e];
	if (n && typeof n.createElement == "function") try {
		let t = n.createElement("iframe");
		t.hidden = !0, n.head.appendChild(t);
		let i = t.contentWindow;
		i && i[e] && (r = i[e]), n.head.removeChild(t);
	} catch {}
	return Cp[e] = r.bind(window);
}
function Tp(...e) {
	return wp("requestAnimationFrame")(...e);
}
function Ep(...e) {
	return wp("setTimeout")(...e);
}
function Dp(...e) {
	return wp("clearTimeout")(...e);
}
var J = /* @__PURE__ */ ((e) => (e[e.DomContentLoaded = 0] = "DomContentLoaded", e[e.Load = 1] = "Load", e[e.FullSnapshot = 2] = "FullSnapshot", e[e.IncrementalSnapshot = 3] = "IncrementalSnapshot", e[e.Meta = 4] = "Meta", e[e.Custom = 5] = "Custom", e[e.Plugin = 6] = "Plugin", e))(J || {}), Y = /* @__PURE__ */ ((e) => (e[e.Mutation = 0] = "Mutation", e[e.MouseMove = 1] = "MouseMove", e[e.MouseInteraction = 2] = "MouseInteraction", e[e.Scroll = 3] = "Scroll", e[e.ViewportResize = 4] = "ViewportResize", e[e.Input = 5] = "Input", e[e.TouchMove = 6] = "TouchMove", e[e.MediaInteraction = 7] = "MediaInteraction", e[e.StyleSheetRule = 8] = "StyleSheetRule", e[e.CanvasMutation = 9] = "CanvasMutation", e[e.Font = 10] = "Font", e[e.Log = 11] = "Log", e[e.Drag = 12] = "Drag", e[e.StyleDeclaration = 13] = "StyleDeclaration", e[e.Selection = 14] = "Selection", e[e.AdoptedStyleSheet = 15] = "AdoptedStyleSheet", e[e.CustomElement = 16] = "CustomElement", e))(Y || {}), Op = /* @__PURE__ */ ((e) => (e[e.MouseUp = 0] = "MouseUp", e[e.MouseDown = 1] = "MouseDown", e[e.Click = 2] = "Click", e[e.ContextMenu = 3] = "ContextMenu", e[e.DblClick = 4] = "DblClick", e[e.Focus = 5] = "Focus", e[e.Blur = 6] = "Blur", e[e.TouchStart = 7] = "TouchStart", e[e.TouchMove_Departed = 8] = "TouchMove_Departed", e[e.TouchEnd = 9] = "TouchEnd", e[e.TouchCancel = 10] = "TouchCancel", e))(Op || {}), kp = /* @__PURE__ */ ((e) => (e[e.Mouse = 0] = "Mouse", e[e.Pen = 1] = "Pen", e[e.Touch = 2] = "Touch", e))(kp || {});
function Ap(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
function jp(e) {
	return "__ln" in e;
}
var Mp = class {
	constructor() {
		this.length = 0, this.head = null, this.tail = null;
	}
	get(e) {
		if (e >= this.length) throw Error("Position outside of list range");
		let t = this.head;
		for (let n = 0; n < e; n++) t = Ap([
			t,
			"optionalAccess",
			(e) => e.next
		]) || null;
		return t;
	}
	addNode(e) {
		let t = {
			value: e,
			previous: null,
			next: null
		};
		if (e.__ln = t, e.previousSibling && jp(e.previousSibling)) {
			let n = e.previousSibling.__ln.next;
			t.next = n, t.previous = e.previousSibling.__ln, e.previousSibling.__ln.next = t, n && (n.previous = t);
		} else if (e.nextSibling && jp(e.nextSibling) && e.nextSibling.__ln.previous) {
			let n = e.nextSibling.__ln.previous;
			t.previous = n, t.next = e.nextSibling.__ln, e.nextSibling.__ln.previous = t, n && (n.next = t);
		} else this.head && (this.head.previous = t), t.next = this.head, this.head = t;
		t.next === null && (this.tail = t), this.length++;
	}
	removeNode(e) {
		let t = e.__ln;
		this.head && (t.previous ? (t.previous.next = t.next, t.next ? t.next.previous = t.previous : this.tail = t.previous) : (this.head = t.next, this.head ? this.head.previous = null : this.tail = null), e.__ln && delete e.__ln, this.length--);
	}
}, Np = (e, t) => `${e}@${t}`, Pp = class {
	constructor() {
		this.frozen = !1, this.locked = !1, this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.mapRemoves = [], this.movedMap = {}, this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.processMutations = (e) => {
			e.forEach(this.processMutation), this.emit();
		}, this.emit = () => {
			if (this.frozen || this.locked) return;
			let e = [], t = /* @__PURE__ */ new Set(), n = new Mp(), r = (e) => {
				let t = e, n = vf;
				for (; n === vf;) t &&= t.nextSibling, n = t && this.mirror.getId(t);
				return n;
			}, i = (i) => {
				if (!i.parentNode || !Sp(i)) return;
				let a = Xd(i.parentNode) ? this.mirror.getId(yp(i)) : this.mirror.getId(i.parentNode), o = r(i);
				if (a === -1 || o === -1) return n.addNode(i);
				let s = Yf(i, {
					doc: this.doc,
					mirror: this.mirror,
					blockClass: this.blockClass,
					blockSelector: this.blockSelector,
					maskAllText: this.maskAllText,
					unblockSelector: this.unblockSelector,
					maskTextClass: this.maskTextClass,
					unmaskTextClass: this.unmaskTextClass,
					maskTextSelector: this.maskTextSelector,
					unmaskTextSelector: this.unmaskTextSelector,
					skipChild: !0,
					newlyAddedElement: !0,
					inlineStylesheet: this.inlineStylesheet,
					maskInputOptions: this.maskInputOptions,
					maskAttributeFn: this.maskAttributeFn,
					maskTextFn: this.maskTextFn,
					maskInputFn: this.maskInputFn,
					slimDOMOptions: this.slimDOMOptions,
					dataURLOptions: this.dataURLOptions,
					recordCanvas: this.recordCanvas,
					inlineImages: this.inlineImages,
					onSerialize: (e) => {
						hp(e, this.mirror) && this.iframeManager.addIframe(e), gp(e, this.mirror) && this.stylesheetManager.trackLinkElement(e), _p(i) && this.shadowDomManager.addShadowRoot(i.shadowRoot, this.doc);
					},
					onIframeLoad: (e, t) => {
						this.iframeManager.attachIframe(e, t), this.shadowDomManager.observeAttachShadow(e);
					},
					onStylesheetLoad: (e, t) => {
						this.stylesheetManager.attachLinkElement(e, t);
					}
				});
				s && (e.push({
					parentId: a,
					nextId: o,
					node: s
				}), t.add(s.id));
			};
			for (; this.mapRemoves.length;) this.mirror.removeNodeFromMap(this.mapRemoves.shift());
			for (let e of this.movedSet) Ip(this.removes, e, this.mirror) && !this.movedSet.has(e.parentNode) || i(e);
			for (let e of this.addedSet) !Rp(this.droppedSet, e) && !Ip(this.removes, e, this.mirror) || Rp(this.movedSet, e) ? i(e) : this.droppedSet.add(e);
			let a = null;
			for (; n.length;) {
				let e = null;
				if (a) {
					let t = this.mirror.getId(a.value.parentNode), n = r(a.value);
					t !== -1 && n !== -1 && (e = a);
				}
				if (!e) {
					let t = n.tail;
					for (; t;) {
						let n = t;
						if (t = t.previous, n) {
							let t = this.mirror.getId(n.value.parentNode);
							if (r(n.value) === -1) continue;
							if (t !== -1) {
								e = n;
								break;
							} else {
								let t = n.value;
								if (t.parentNode && t.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
									let r = t.parentNode.host;
									if (this.mirror.getId(r) !== -1) {
										e = n;
										break;
									}
								}
							}
						}
					}
				}
				if (!e) {
					for (; n.head;) n.removeNode(n.head.value);
					break;
				}
				a = e.previous, n.removeNode(e.value), i(e.value);
			}
			let o = {
				texts: this.texts.map((e) => ({
					id: this.mirror.getId(e.node),
					value: e.value
				})).filter((e) => !t.has(e.id)).filter((e) => this.mirror.has(e.id)),
				attributes: this.attributes.map((e) => {
					let { attributes: t } = e;
					if (typeof t.style == "string") {
						let n = JSON.stringify(e.styleDiff), r = JSON.stringify(e._unchangedStyles);
						n.length < t.style.length && (n + r).split("var(").length === t.style.split("var(").length && (t.style = e.styleDiff);
					}
					return {
						id: this.mirror.getId(e.node),
						attributes: t
					};
				}).filter((e) => !t.has(e.id)).filter((e) => this.mirror.has(e.id)),
				removes: this.removes,
				adds: e
			};
			!o.texts.length && !o.attributes.length && !o.removes.length && !o.adds.length || (this.texts = [], this.attributes = [], this.attributeMap = /* @__PURE__ */ new WeakMap(), this.removes = [], this.addedSet = /* @__PURE__ */ new Set(), this.movedSet = /* @__PURE__ */ new Set(), this.droppedSet = /* @__PURE__ */ new Set(), this.movedMap = {}, this.mutationCb(o));
		}, this.processMutation = (e) => {
			if (!dp(e.target, this.mirror)) switch (e.type) {
				case "characterData": {
					let t = e.target.textContent;
					!lp(e.target, this.blockClass, this.blockSelector, this.unblockSelector, !1) && t !== e.oldValue && this.texts.push({
						value: Vf(e.target, this.maskTextClass, this.maskTextSelector, this.unmaskTextClass, this.unmaskTextSelector, this.maskAllText) && t ? this.maskTextFn ? this.maskTextFn(t, cp(e.target)) : t.replace(/[\S]/g, "*") : t,
						node: e.target
					});
					break;
				}
				case "attributes": {
					let t = e.target, n = e.attributeName, r = e.target.getAttribute(n);
					if (n === "value") {
						let n = mf(t), i = t.tagName;
						r = hf(t, i, n);
						let a = cf({
							maskInputOptions: this.maskInputOptions,
							tagName: i,
							type: n
						});
						r = lf({
							isMasked: Vf(e.target, this.maskTextClass, this.maskTextSelector, this.unmaskTextClass, this.unmaskTextSelector, a),
							element: t,
							value: r,
							maskInputFn: this.maskInputFn
						});
					}
					if (lp(e.target, this.blockClass, this.blockSelector, this.unblockSelector, !1) || r === e.oldValue) return;
					let i = this.attributeMap.get(e.target);
					if (t.tagName === "IFRAME" && n === "src" && !this.keepIframeSrcFn(r)) if (!t.contentDocument) n = "rr_src";
					else return;
					if (i || (i = {
						node: e.target,
						attributes: {},
						styleDiff: {},
						_unchangedStyles: {}
					}, this.attributes.push(i), this.attributeMap.set(e.target, i)), n === "type" && t.tagName === "INPUT" && (e.oldValue || "").toLowerCase() === "password" && t.setAttribute("data-rr-is-password", "true"), !If(t.tagName, n) && (i.attributes[n] = Ff(this.doc, uf(t.tagName), uf(n), r, t, this.maskAttributeFn), n === "style")) {
						if (!this.unattachedDoc) try {
							this.unattachedDoc = document.implementation.createHTMLDocument();
						} catch {
							this.unattachedDoc = this.doc;
						}
						let n = this.unattachedDoc.createElement("span");
						e.oldValue && n.setAttribute("style", e.oldValue);
						for (let e of Array.from(t.style)) {
							let r = t.style.getPropertyValue(e), a = t.style.getPropertyPriority(e);
							r !== n.style.getPropertyValue(e) || a !== n.style.getPropertyPriority(e) ? a === "" ? i.styleDiff[e] = r : i.styleDiff[e] = [r, a] : i._unchangedStyles[e] = [r, a];
						}
						for (let e of Array.from(n.style)) t.style.getPropertyValue(e) === "" && (i.styleDiff[e] = !1);
					}
					break;
				}
				case "childList":
					if (lp(e.target, this.blockClass, this.blockSelector, this.unblockSelector, !0)) return;
					e.addedNodes.forEach((t) => this.genAdds(t, e.target)), e.removedNodes.forEach((t) => {
						let n = this.mirror.getId(t), r = Xd(e.target) ? this.mirror.getId(e.target.host) : this.mirror.getId(e.target);
						lp(e.target, this.blockClass, this.blockSelector, this.unblockSelector, !1) || dp(t, this.mirror) || !up(t, this.mirror) || (this.addedSet.has(t) ? (Fp(this.addedSet, t), this.droppedSet.add(t)) : this.addedSet.has(e.target) && n === -1 || fp(e.target, this.mirror) || (this.movedSet.has(t) && this.movedMap[Np(n, r)] ? Fp(this.movedSet, t) : this.removes.push({
							parentId: r,
							id: n,
							isShadow: Xd(e.target) && Zd(e.target) ? !0 : void 0
						})), this.mapRemoves.push(t));
					});
					break;
			}
		}, this.genAdds = (e, t) => {
			if (!this.processedNodeManager.inOtherBuffer(e, this) && !(this.addedSet.has(e) || this.movedSet.has(e))) {
				if (this.mirror.hasNode(e)) {
					if (dp(e, this.mirror)) return;
					this.movedSet.add(e);
					let n = null;
					t && this.mirror.hasNode(t) && (n = this.mirror.getId(t)), n && n !== -1 && (this.movedMap[Np(this.mirror.getId(e), n)] = !0);
				} else this.addedSet.add(e), this.droppedSet.delete(e);
				lp(e, this.blockClass, this.blockSelector, this.unblockSelector, !1) || (e.childNodes.forEach((e) => this.genAdds(e)), _p(e) && e.shadowRoot.childNodes.forEach((t) => {
					this.processedNodeManager.add(t, this), this.genAdds(t, e);
				}));
			}
		};
	}
	init(e) {
		(/* @__PURE__ */ "mutationCb.blockClass.blockSelector.unblockSelector.maskAllText.maskTextClass.unmaskTextClass.maskTextSelector.unmaskTextSelector.inlineStylesheet.maskInputOptions.maskAttributeFn.maskTextFn.maskInputFn.keepIframeSrcFn.recordCanvas.inlineImages.slimDOMOptions.dataURLOptions.doc.mirror.iframeManager.stylesheetManager.shadowDomManager.canvasManager.processedNodeManager".split(".")).forEach((t) => {
			this[t] = e[t];
		});
	}
	freeze() {
		this.frozen = !0, this.canvasManager.freeze();
	}
	unfreeze() {
		this.frozen = !1, this.canvasManager.unfreeze(), this.emit();
	}
	isFrozen() {
		return this.frozen;
	}
	lock() {
		this.locked = !0, this.canvasManager.lock();
	}
	unlock() {
		this.locked = !1, this.canvasManager.unlock(), this.emit();
	}
	reset() {
		this.shadowDomManager.reset(), this.canvasManager.reset();
	}
};
function Fp(e, t) {
	e.delete(t), t.childNodes.forEach((t) => Fp(e, t));
}
function Ip(e, t, n) {
	return e.length !== 0 && Lp(e, t, n);
}
function Lp(e, t, n) {
	let { parentNode: r } = t;
	if (!r) return !1;
	let i = n.getId(r);
	return e.some((e) => e.id === i) ? !0 : Lp(e, r, n);
}
function Rp(e, t) {
	return e.size !== 0 && zp(e, t);
}
function zp(e, t) {
	let { parentNode: n } = t;
	return n ? e.has(n) ? !0 : zp(e, n) : !1;
}
var Bp;
function Vp(e) {
	Bp = e;
}
function Hp() {
	Bp = void 0;
}
var X = (e) => Bp ? ((...t) => {
	try {
		return e(...t);
	} catch (e) {
		if (Bp && Bp(e) === !0) return () => {};
		throw e;
	}
}) : e;
function Up(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
var Wp = [];
function Gp(e) {
	try {
		if ("composedPath" in e) {
			let t = e.composedPath();
			if (t.length) return t[0];
		} else if ("path" in e && e.path.length) return e.path[0];
	} catch {}
	return e && e.target;
}
function Kp(e, t) {
	let n = new Pp();
	Wp.push(n), n.init(e);
	let r = window.MutationObserver || window.__rrMutationObserver, i = Up([
		window,
		"optionalAccess",
		(e) => e.Zone,
		"optionalAccess",
		(e) => e.__symbol__,
		"optionalCall",
		(e) => e("MutationObserver")
	]);
	i && window[i] && (r = window[i]);
	let a = new r(X((t) => {
		e.onMutation && e.onMutation(t) === !1 || n.processMutations.bind(n)(t);
	}));
	return a.observe(t, {
		attributes: !0,
		attributeOldValue: !0,
		characterData: !0,
		characterDataOldValue: !0,
		childList: !0,
		subtree: !0
	}), a;
}
function qp({ mousemoveCb: e, sampling: t, doc: n, mirror: r }) {
	if (t.mousemove === !1) return () => {};
	let i = typeof t.mousemove == "number" ? t.mousemove : 50, a = typeof t.mousemoveCallback == "number" ? t.mousemoveCallback : 500, o = [], s, c = tp(X((t) => {
		let n = Date.now() - s;
		e(o.map((e) => (e.timeOffset -= n, e)), t), o = [], s = null;
	}), a), l = X(tp(X((e) => {
		let t = Gp(e), { clientX: n, clientY: i } = pp(e) ? e.changedTouches[0] : e;
		s ||= ip(), o.push({
			x: n,
			y: i,
			id: r.getId(t),
			timeOffset: ip() - s
		}), c(typeof DragEvent < "u" && e instanceof DragEvent ? Y.Drag : e instanceof MouseEvent ? Y.MouseMove : Y.TouchMove);
	}), i, { trailing: !1 })), u = [
		Qf("mousemove", l, n),
		Qf("touchmove", l, n),
		Qf("drag", l, n)
	];
	return X(() => {
		u.forEach((e) => e());
	});
}
function Jp({ mouseInteractionCb: e, doc: t, mirror: n, blockClass: r, blockSelector: i, unblockSelector: a, sampling: o }) {
	if (o.mouseInteraction === !1) return () => {};
	let s = o.mouseInteraction === !0 || o.mouseInteraction === void 0 ? {} : o.mouseInteraction, c = [], l = null, u = (t) => (o) => {
		let s = Gp(o);
		if (lp(s, r, i, a, !0)) return;
		let c = null, u = t;
		if ("pointerType" in o) {
			switch (o.pointerType) {
				case "mouse":
					c = kp.Mouse;
					break;
				case "touch":
					c = kp.Touch;
					break;
				case "pen":
					c = kp.Pen;
					break;
			}
			c === kp.Touch ? Op[t] === Op.MouseDown ? u = "TouchStart" : Op[t] === Op.MouseUp && (u = "TouchEnd") : kp.Pen;
		} else pp(o) && (c = kp.Touch);
		c === null ? Op[t] === Op.Click && (c = l, l = null) : (l = c, (u.startsWith("Touch") && c === kp.Touch || u.startsWith("Mouse") && c === kp.Mouse) && (c = null));
		let d = pp(o) ? o.changedTouches[0] : o;
		if (!d) return;
		let f = n.getId(s), { clientX: p, clientY: m } = d;
		X(e)({
			type: Op[u],
			id: f,
			x: p,
			y: m,
			...c !== null && { pointerType: c }
		});
	};
	return Object.keys(Op).filter((e) => Number.isNaN(Number(e)) && !e.endsWith("_Departed") && s[e] !== !1).forEach((e) => {
		let n = uf(e), r = u(e);
		if (window.PointerEvent) switch (Op[e]) {
			case Op.MouseDown:
			case Op.MouseUp:
				n = n.replace("mouse", "pointer");
				break;
			case Op.TouchStart:
			case Op.TouchEnd: return;
		}
		c.push(Qf(n, r, t));
	}), X(() => {
		c.forEach((e) => e());
	});
}
function Yp({ scrollCb: e, doc: t, mirror: n, blockClass: r, blockSelector: i, unblockSelector: a, sampling: o }) {
	return Qf("scroll", X(tp(X((o) => {
		let s = Gp(o);
		if (!s || lp(s, r, i, a, !0)) return;
		let c = n.getId(s);
		if (s === t && t.defaultView) {
			let n = ap(t.defaultView);
			e({
				id: c,
				x: n.left,
				y: n.top
			});
		} else e({
			id: c,
			x: s.scrollLeft,
			y: s.scrollTop
		});
	}), o.scroll || 100)), t);
}
function Xp({ viewportResizeCb: e }, { win: t }) {
	let n = -1, r = -1;
	return Qf("resize", X(tp(X(() => {
		let t = op(), i = sp();
		(n !== t || r !== i) && (e({
			width: Number(i),
			height: Number(t)
		}), n = t, r = i);
	}), 200)), t);
}
var Zp = [
	"INPUT",
	"TEXTAREA",
	"SELECT"
], Qp = /* @__PURE__ */ new WeakMap();
function $p({ inputCb: e, doc: t, mirror: n, blockClass: r, blockSelector: i, unblockSelector: a, ignoreClass: o, ignoreSelector: s, maskInputOptions: c, maskInputFn: l, sampling: u, userTriggeredOnInput: d, maskTextClass: f, unmaskTextClass: p, maskTextSelector: m, unmaskTextSelector: h }) {
	function g(e) {
		let n = Gp(e), u = e.isTrusted, g = n && df(n.tagName);
		if (g === "OPTION" && (n = n.parentElement), !n || !g || Zp.indexOf(g) < 0 || lp(n, r, i, a, !0)) return;
		let v = n;
		if (v.classList.contains(o) || s && v.matches(s)) return;
		let y = mf(n), b = hf(v, g, y), x = !1, S = cf({
			maskInputOptions: c,
			tagName: g,
			type: y
		}), C = Vf(n, f, m, p, h, S);
		(y === "radio" || y === "checkbox") && (x = n.checked), b = lf({
			isMasked: C,
			element: n,
			value: b,
			maskInputFn: l
		}), _(n, d ? {
			text: b,
			isChecked: x,
			userTriggered: u
		} : {
			text: b,
			isChecked: x
		});
		let w = n.name;
		y === "radio" && w && x && t.querySelectorAll(`input[type="radio"][name="${w}"]`).forEach((e) => {
			if (e !== n) {
				let t = lf({
					isMasked: C,
					element: e,
					value: hf(e, g, y),
					maskInputFn: l
				});
				_(e, d ? {
					text: t,
					isChecked: !x,
					userTriggered: !1
				} : {
					text: t,
					isChecked: !x
				});
			}
		});
	}
	function _(t, r) {
		let i = Qp.get(t);
		if (!i || i.text !== r.text || i.isChecked !== r.isChecked) {
			Qp.set(t, r);
			let i = n.getId(t);
			X(e)({
				...r,
				id: i
			});
		}
	}
	let v = (u.input === "last" ? ["change"] : ["input", "change"]).map((e) => Qf(e, X(g), t)), y = t.defaultView;
	if (!y) return () => {
		v.forEach((e) => e());
	};
	let b = y.Object.getOwnPropertyDescriptor(y.HTMLInputElement.prototype, "value"), x = [
		[y.HTMLInputElement.prototype, "value"],
		[y.HTMLInputElement.prototype, "checked"],
		[y.HTMLSelectElement.prototype, "value"],
		[y.HTMLTextAreaElement.prototype, "value"],
		[y.HTMLSelectElement.prototype, "selectedIndex"],
		[y.HTMLOptionElement.prototype, "selected"]
	];
	return b && b.set && v.push(...x.map((e) => np(e[0], e[1], { set() {
		X(g)({
			target: this,
			isTrusted: !1
		});
	} }, !1, y))), X(() => {
		v.forEach((e) => e());
	});
}
function em(e) {
	let t = [];
	function n(e, t) {
		if (um("CSSGroupingRule") && e.parentRule instanceof CSSGroupingRule || um("CSSMediaRule") && e.parentRule instanceof CSSMediaRule || um("CSSSupportsRule") && e.parentRule instanceof CSSSupportsRule || um("CSSConditionRule") && e.parentRule instanceof CSSConditionRule) {
			let n = Array.from(e.parentRule.cssRules).indexOf(e);
			t.unshift(n);
		} else if (e.parentStyleSheet) {
			let n = Array.from(e.parentStyleSheet.cssRules).indexOf(e);
			t.unshift(n);
		}
		return t;
	}
	return n(e, t);
}
function tm(e, t, n) {
	let r, i;
	return e ? (e.ownerNode ? r = t.getId(e.ownerNode) : i = n.getId(e), {
		styleId: i,
		id: r
	}) : {};
}
function nm({ styleSheetRuleCb: e, mirror: t, stylesheetManager: n }, { win: r }) {
	if (!r.CSSStyleSheet || !r.CSSStyleSheet.prototype) return () => {};
	let i = r.CSSStyleSheet.prototype.insertRule;
	r.CSSStyleSheet.prototype.insertRule = new Proxy(i, { apply: X((r, i, a) => {
		let [o, s] = a, { id: c, styleId: l } = tm(i, t, n.styleMirror);
		return (c && c !== -1 || l && l !== -1) && e({
			id: c,
			styleId: l,
			adds: [{
				rule: o,
				index: s
			}]
		}), r.apply(i, a);
	}) });
	let a = r.CSSStyleSheet.prototype.deleteRule;
	r.CSSStyleSheet.prototype.deleteRule = new Proxy(a, { apply: X((r, i, a) => {
		let [o] = a, { id: s, styleId: c } = tm(i, t, n.styleMirror);
		return (s && s !== -1 || c && c !== -1) && e({
			id: s,
			styleId: c,
			removes: [{ index: o }]
		}), r.apply(i, a);
	}) });
	let o;
	r.CSSStyleSheet.prototype.replace && (o = r.CSSStyleSheet.prototype.replace, r.CSSStyleSheet.prototype.replace = new Proxy(o, { apply: X((r, i, a) => {
		let [o] = a, { id: s, styleId: c } = tm(i, t, n.styleMirror);
		return (s && s !== -1 || c && c !== -1) && e({
			id: s,
			styleId: c,
			replace: o
		}), r.apply(i, a);
	}) }));
	let s;
	r.CSSStyleSheet.prototype.replaceSync && (s = r.CSSStyleSheet.prototype.replaceSync, r.CSSStyleSheet.prototype.replaceSync = new Proxy(s, { apply: X((r, i, a) => {
		let [o] = a, { id: s, styleId: c } = tm(i, t, n.styleMirror);
		return (s && s !== -1 || c && c !== -1) && e({
			id: s,
			styleId: c,
			replaceSync: o
		}), r.apply(i, a);
	}) }));
	let c = {};
	dm("CSSGroupingRule") ? c.CSSGroupingRule = r.CSSGroupingRule : (dm("CSSMediaRule") && (c.CSSMediaRule = r.CSSMediaRule), dm("CSSConditionRule") && (c.CSSConditionRule = r.CSSConditionRule), dm("CSSSupportsRule") && (c.CSSSupportsRule = r.CSSSupportsRule));
	let l = {};
	return Object.entries(c).forEach(([r, i]) => {
		l[r] = {
			insertRule: i.prototype.insertRule,
			deleteRule: i.prototype.deleteRule
		}, i.prototype.insertRule = new Proxy(l[r].insertRule, { apply: X((r, i, a) => {
			let [o, s] = a, { id: c, styleId: l } = tm(i.parentStyleSheet, t, n.styleMirror);
			return (c && c !== -1 || l && l !== -1) && e({
				id: c,
				styleId: l,
				adds: [{
					rule: o,
					index: [...em(i), s || 0]
				}]
			}), r.apply(i, a);
		}) }), i.prototype.deleteRule = new Proxy(l[r].deleteRule, { apply: X((r, i, a) => {
			let [o] = a, { id: s, styleId: c } = tm(i.parentStyleSheet, t, n.styleMirror);
			return (s && s !== -1 || c && c !== -1) && e({
				id: s,
				styleId: c,
				removes: [{ index: [...em(i), o] }]
			}), r.apply(i, a);
		}) });
	}), X(() => {
		r.CSSStyleSheet.prototype.insertRule = i, r.CSSStyleSheet.prototype.deleteRule = a, o && (r.CSSStyleSheet.prototype.replace = o), s && (r.CSSStyleSheet.prototype.replaceSync = s), Object.entries(c).forEach(([e, t]) => {
			t.prototype.insertRule = l[e].insertRule, t.prototype.deleteRule = l[e].deleteRule;
		});
	});
}
function rm({ mirror: e, stylesheetManager: t }, n) {
	let r = null;
	r = n.nodeName === "#document" ? e.getId(n) : e.getId(n.host);
	let i = n.nodeName === "#document" ? Up([
		n,
		"access",
		(e) => e.defaultView,
		"optionalAccess",
		(e) => e.Document
	]) : Up([
		n,
		"access",
		(e) => e.ownerDocument,
		"optionalAccess",
		(e) => e.defaultView,
		"optionalAccess",
		(e) => e.ShadowRoot
	]), a = Up([
		i,
		"optionalAccess",
		(e) => e.prototype
	]) ? Object.getOwnPropertyDescriptor(Up([
		i,
		"optionalAccess",
		(e) => e.prototype
	]), "adoptedStyleSheets") : void 0;
	return r === null || r === -1 || !i || !a ? () => {} : (Object.defineProperty(n, "adoptedStyleSheets", {
		configurable: a.configurable,
		enumerable: a.enumerable,
		get() {
			return Up([
				a,
				"access",
				(e) => e.get,
				"optionalAccess",
				(e) => e.call,
				"call",
				(e) => e(this)
			]);
		},
		set(e) {
			let n = Up([
				a,
				"access",
				(e) => e.set,
				"optionalAccess",
				(e) => e.call,
				"call",
				(t) => t(this, e)
			]);
			if (r !== null && r !== -1) try {
				t.adoptStyleSheets(e, r);
			} catch {}
			return n;
		}
	}), X(() => {
		Object.defineProperty(n, "adoptedStyleSheets", {
			configurable: a.configurable,
			enumerable: a.enumerable,
			get: a.get,
			set: a.set
		});
	}));
}
function im({ styleDeclarationCb: e, mirror: t, ignoreCSSAttributes: n, stylesheetManager: r }, { win: i }) {
	let a = i.CSSStyleDeclaration.prototype.setProperty;
	i.CSSStyleDeclaration.prototype.setProperty = new Proxy(a, { apply: X((i, o, s) => {
		let [c, l, u] = s;
		if (n.has(c)) return a.apply(o, [
			c,
			l,
			u
		]);
		let { id: d, styleId: f } = tm(Up([
			o,
			"access",
			(e) => e.parentRule,
			"optionalAccess",
			(e) => e.parentStyleSheet
		]), t, r.styleMirror);
		return (d && d !== -1 || f && f !== -1) && e({
			id: d,
			styleId: f,
			set: {
				property: c,
				value: l,
				priority: u
			},
			index: em(o.parentRule)
		}), i.apply(o, s);
	}) });
	let o = i.CSSStyleDeclaration.prototype.removeProperty;
	return i.CSSStyleDeclaration.prototype.removeProperty = new Proxy(o, { apply: X((i, a, s) => {
		let [c] = s;
		if (n.has(c)) return o.apply(a, [c]);
		let { id: l, styleId: u } = tm(Up([
			a,
			"access",
			(e) => e.parentRule,
			"optionalAccess",
			(e) => e.parentStyleSheet
		]), t, r.styleMirror);
		return (l && l !== -1 || u && u !== -1) && e({
			id: l,
			styleId: u,
			remove: { property: c },
			index: em(a.parentRule)
		}), i.apply(a, s);
	}) }), X(() => {
		i.CSSStyleDeclaration.prototype.setProperty = a, i.CSSStyleDeclaration.prototype.removeProperty = o;
	});
}
function am({ mediaInteractionCb: e, blockClass: t, blockSelector: n, unblockSelector: r, mirror: i, sampling: a, doc: o }) {
	let s = X((o) => tp(X((a) => {
		let s = Gp(a);
		if (!s || lp(s, t, n, r, !0)) return;
		let { currentTime: c, volume: l, muted: u, playbackRate: d } = s;
		e({
			type: o,
			id: i.getId(s),
			currentTime: c,
			volume: l,
			muted: u,
			playbackRate: d
		});
	}), a.media || 500)), c = [
		Qf("play", s(0), o),
		Qf("pause", s(1), o),
		Qf("seeked", s(2), o),
		Qf("volumechange", s(3), o),
		Qf("ratechange", s(4), o)
	];
	return X(() => {
		c.forEach((e) => e());
	});
}
function om({ fontCb: e, doc: t }) {
	let n = t.defaultView;
	if (!n) return () => {};
	let r = [], i = /* @__PURE__ */ new WeakMap(), a = n.FontFace;
	n.FontFace = function(e, t, n) {
		let r = new a(e, t, n);
		return i.set(r, {
			family: e,
			buffer: typeof t != "string",
			descriptors: n,
			fontSource: typeof t == "string" ? t : JSON.stringify(Array.from(new Uint8Array(t)))
		}), r;
	};
	let o = rp(t.fonts, "add", function(t) {
		return function(n) {
			return Ep(X(() => {
				let t = i.get(n);
				t && (e(t), i.delete(n));
			}), 0), t.apply(this, [n]);
		};
	});
	return r.push(() => {
		n.FontFace = a;
	}), r.push(o), X(() => {
		r.forEach((e) => e());
	});
}
function sm(e) {
	let { doc: t, mirror: n, blockClass: r, blockSelector: i, unblockSelector: a, selectionCb: o } = e, s = !0, c = X(() => {
		let e = t.getSelection();
		if (!e || s && Up([
			e,
			"optionalAccess",
			(e) => e.isCollapsed
		])) return;
		s = e.isCollapsed || !1;
		let c = [], l = e.rangeCount || 0;
		for (let t = 0; t < l; t++) {
			let { startContainer: o, startOffset: s, endContainer: l, endOffset: u } = e.getRangeAt(t);
			lp(o, r, i, a, !0) || lp(l, r, i, a, !0) || c.push({
				start: n.getId(o),
				startOffset: s,
				end: n.getId(l),
				endOffset: u
			});
		}
		o({ ranges: c });
	});
	return c(), Qf("selectionchange", c);
}
function cm({ doc: e, customElementCb: t }) {
	let n = e.defaultView;
	return !n || !n.customElements ? () => {} : rp(n.customElements, "define", function(e) {
		return function(n, r, i) {
			try {
				t({ define: { name: n } });
			} catch {}
			return e.apply(this, [
				n,
				r,
				i
			]);
		};
	});
}
function lm(e, t = {}) {
	let n = e.doc.defaultView;
	if (!n) return () => {};
	let r = Kp(e, e.doc), i = qp(e), a = Jp(e), o = Yp(e), s = Xp(e, { win: n }), c = $p(e), l = am(e), u = nm(e, { win: n }), d = rm(e, e.doc), f = im(e, { win: n }), p = e.collectFonts ? om(e) : () => {}, m = sm(e), h = cm(e), g = [];
	for (let t of e.plugins) g.push(t.observer(t.callback, n, t.options));
	return X(() => {
		Wp.forEach((e) => e.reset()), r.disconnect(), i(), a(), o(), s(), c(), l(), u(), d(), f(), p(), m(), h(), g.forEach((e) => e());
	});
}
function um(e) {
	return window[e] !== void 0;
}
function dm(e) {
	return !!(window[e] !== void 0 && window[e].prototype && "insertRule" in window[e].prototype && "deleteRule" in window[e].prototype);
}
var fm = class {
	constructor(e) {
		this.generateIdFn = e, this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
	}
	getId(e, t, n, r) {
		let i = n || this.getIdToRemoteIdMap(e), a = r || this.getRemoteIdToIdMap(e), o = i.get(t);
		return o || (o = this.generateIdFn(), i.set(t, o), a.set(o, t)), o;
	}
	getIds(e, t) {
		let n = this.getIdToRemoteIdMap(e), r = this.getRemoteIdToIdMap(e);
		return t.map((t) => this.getId(e, t, n, r));
	}
	getRemoteId(e, t, n) {
		let r = n || this.getRemoteIdToIdMap(e);
		return typeof t == "number" ? r.get(t) || -1 : t;
	}
	getRemoteIds(e, t) {
		let n = this.getRemoteIdToIdMap(e);
		return t.map((t) => this.getRemoteId(e, t, n));
	}
	reset(e) {
		if (!e) {
			this.iframeIdToRemoteIdMap = /* @__PURE__ */ new WeakMap(), this.iframeRemoteIdToIdMap = /* @__PURE__ */ new WeakMap();
			return;
		}
		this.iframeIdToRemoteIdMap.delete(e), this.iframeRemoteIdToIdMap.delete(e);
	}
	getIdToRemoteIdMap(e) {
		let t = this.iframeIdToRemoteIdMap.get(e);
		return t || (t = /* @__PURE__ */ new Map(), this.iframeIdToRemoteIdMap.set(e, t)), t;
	}
	getRemoteIdToIdMap(e) {
		let t = this.iframeRemoteIdToIdMap.get(e);
		return t || (t = /* @__PURE__ */ new Map(), this.iframeRemoteIdToIdMap.set(e, t)), t;
	}
};
function pm(e) {
	let t, n = e[0], r = 1;
	for (; r < e.length;) {
		let i = e[r], a = e[r + 1];
		if (r += 2, (i === "optionalAccess" || i === "optionalCall") && n == null) return;
		i === "access" || i === "optionalAccess" ? (t = n, n = a(n)) : (i === "call" || i === "optionalCall") && (n = a((...e) => n.call(t, ...e)), t = void 0);
	}
	return n;
}
var mm = class {
	constructor() {
		this.crossOriginIframeMirror = new fm(yf), this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap();
	}
	addIframe() {}
	addLoadListener() {}
	attachIframe() {}
}, hm = class {
	constructor(e) {
		this.iframes = /* @__PURE__ */ new WeakMap(), this.crossOriginIframeMap = /* @__PURE__ */ new WeakMap(), this.crossOriginIframeMirror = new fm(yf), this.crossOriginIframeRootIdMap = /* @__PURE__ */ new WeakMap(), this.mutationCb = e.mutationCb, this.wrappedEmit = e.wrappedEmit, this.stylesheetManager = e.stylesheetManager, this.recordCrossOriginIframes = e.recordCrossOriginIframes, this.crossOriginIframeStyleMirror = new fm(this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror)), this.mirror = e.mirror, this.recordCrossOriginIframes && window.addEventListener("message", this.handleMessage.bind(this));
	}
	addIframe(e) {
		this.iframes.set(e, !0), e.contentWindow && this.crossOriginIframeMap.set(e.contentWindow, e);
	}
	addLoadListener(e) {
		this.loadListener = e;
	}
	attachIframe(e, t) {
		this.mutationCb({
			adds: [{
				parentId: this.mirror.getId(e),
				nextId: null,
				node: t
			}],
			removes: [],
			texts: [],
			attributes: [],
			isAttachIframe: !0
		}), pm([
			this,
			"access",
			(e) => e.loadListener,
			"optionalCall",
			(t) => t(e)
		]), e.contentDocument && e.contentDocument.adoptedStyleSheets && e.contentDocument.adoptedStyleSheets.length > 0 && this.stylesheetManager.adoptStyleSheets(e.contentDocument.adoptedStyleSheets, this.mirror.getId(e.contentDocument));
	}
	handleMessage(e) {
		let t = e;
		if (t.data.type !== "rrweb" || t.origin !== t.data.origin || !e.source) return;
		let n = this.crossOriginIframeMap.get(e.source);
		if (!n) return;
		let r = this.transformCrossOriginEvent(n, t.data.event);
		r && this.wrappedEmit(r, t.data.isCheckout);
	}
	transformCrossOriginEvent(e, t) {
		switch (t.type) {
			case J.FullSnapshot: {
				this.crossOriginIframeMirror.reset(e), this.crossOriginIframeStyleMirror.reset(e), this.replaceIdOnNode(t.data.node, e);
				let n = t.data.node.id;
				return this.crossOriginIframeRootIdMap.set(e, n), this.patchRootIdOnNode(t.data.node, n), {
					timestamp: t.timestamp,
					type: J.IncrementalSnapshot,
					data: {
						source: Y.Mutation,
						adds: [{
							parentId: this.mirror.getId(e),
							nextId: null,
							node: t.data.node
						}],
						removes: [],
						texts: [],
						attributes: [],
						isAttachIframe: !0
					}
				};
			}
			case J.Meta:
			case J.Load:
			case J.DomContentLoaded: return !1;
			case J.Plugin: return t;
			case J.Custom: return this.replaceIds(t.data.payload, e, [
				"id",
				"parentId",
				"previousId",
				"nextId"
			]), t;
			case J.IncrementalSnapshot: switch (t.data.source) {
				case Y.Mutation: return t.data.adds.forEach((t) => {
					this.replaceIds(t, e, [
						"parentId",
						"nextId",
						"previousId"
					]), this.replaceIdOnNode(t.node, e);
					let n = this.crossOriginIframeRootIdMap.get(e);
					n && this.patchRootIdOnNode(t.node, n);
				}), t.data.removes.forEach((t) => {
					this.replaceIds(t, e, ["parentId", "id"]);
				}), t.data.attributes.forEach((t) => {
					this.replaceIds(t, e, ["id"]);
				}), t.data.texts.forEach((t) => {
					this.replaceIds(t, e, ["id"]);
				}), t;
				case Y.Drag:
				case Y.TouchMove:
				case Y.MouseMove: return t.data.positions.forEach((t) => {
					this.replaceIds(t, e, ["id"]);
				}), t;
				case Y.ViewportResize: return !1;
				case Y.MediaInteraction:
				case Y.MouseInteraction:
				case Y.Scroll:
				case Y.CanvasMutation:
				case Y.Input: return this.replaceIds(t.data, e, ["id"]), t;
				case Y.StyleSheetRule:
				case Y.StyleDeclaration: return this.replaceIds(t.data, e, ["id"]), this.replaceStyleIds(t.data, e, ["styleId"]), t;
				case Y.Font: return t;
				case Y.Selection: return t.data.ranges.forEach((t) => {
					this.replaceIds(t, e, ["start", "end"]);
				}), t;
				case Y.AdoptedStyleSheet: return this.replaceIds(t.data, e, ["id"]), this.replaceStyleIds(t.data, e, ["styleIds"]), pm([
					t,
					"access",
					(e) => e.data,
					"access",
					(e) => e.styles,
					"optionalAccess",
					(e) => e.forEach,
					"call",
					(t) => t((t) => {
						this.replaceStyleIds(t, e, ["styleId"]);
					})
				]), t;
			}
		}
		return !1;
	}
	replace(e, t, n, r) {
		for (let i of r) !Array.isArray(t[i]) && typeof t[i] != "number" || (Array.isArray(t[i]) ? t[i] = e.getIds(n, t[i]) : t[i] = e.getId(n, t[i]));
		return t;
	}
	replaceIds(e, t, n) {
		return this.replace(this.crossOriginIframeMirror, e, t, n);
	}
	replaceStyleIds(e, t, n) {
		return this.replace(this.crossOriginIframeStyleMirror, e, t, n);
	}
	replaceIdOnNode(e, t) {
		this.replaceIds(e, t, ["id", "rootId"]), "childNodes" in e && e.childNodes.forEach((e) => {
			this.replaceIdOnNode(e, t);
		});
	}
	patchRootIdOnNode(e, t) {
		e.type !== K.Document && !e.rootId && (e.rootId = t), "childNodes" in e && e.childNodes.forEach((e) => {
			this.patchRootIdOnNode(e, t);
		});
	}
}, gm = class {
	init() {}
	addShadowRoot() {}
	observeAttachShadow() {}
	reset() {}
}, _m = class {
	constructor(e) {
		this.shadowDoms = /* @__PURE__ */ new WeakSet(), this.restoreHandlers = [], this.mutationCb = e.mutationCb, this.scrollCb = e.scrollCb, this.bypassOptions = e.bypassOptions, this.mirror = e.mirror, this.init();
	}
	init() {
		this.reset(), this.patchAttachShadow(Element, document);
	}
	addShadowRoot(e, t) {
		if (!Zd(e) || this.shadowDoms.has(e)) return;
		this.shadowDoms.add(e);
		let n = Kp({
			...this.bypassOptions,
			doc: t,
			mutationCb: this.mutationCb,
			mirror: this.mirror,
			shadowDomManager: this
		}, e);
		this.restoreHandlers.push(() => n.disconnect()), this.restoreHandlers.push(Yp({
			...this.bypassOptions,
			scrollCb: this.scrollCb,
			doc: e,
			mirror: this.mirror
		})), Ep(() => {
			e.adoptedStyleSheets && e.adoptedStyleSheets.length > 0 && this.bypassOptions.stylesheetManager.adoptStyleSheets(e.adoptedStyleSheets, this.mirror.getId(e.host)), this.restoreHandlers.push(rm({
				mirror: this.mirror,
				stylesheetManager: this.bypassOptions.stylesheetManager
			}, e));
		}, 0);
	}
	observeAttachShadow(e) {
		!e.contentWindow || !e.contentDocument || this.patchAttachShadow(e.contentWindow.Element, e.contentDocument);
	}
	patchAttachShadow(e, t) {
		let n = this;
		this.restoreHandlers.push(rp(e.prototype, "attachShadow", function(e) {
			return function(r) {
				let i = e.call(this, r);
				return this.shadowRoot && Sp(this) && n.addShadowRoot(this.shadowRoot, t), i;
			};
		}));
	}
	reset() {
		this.restoreHandlers.forEach((e) => {
			try {
				e();
			} catch {}
		}), this.restoreHandlers = [], this.shadowDoms = /* @__PURE__ */ new WeakSet();
	}
}, vm = class {
	reset() {}
	freeze() {}
	unfreeze() {}
	lock() {}
	unlock() {}
	snapshot() {}
}, ym = class {
	constructor(e) {
		this.trackedLinkElements = /* @__PURE__ */ new WeakSet(), this.styleMirror = new vp(), this.mutationCb = e.mutationCb, this.adoptedStyleSheetCb = e.adoptedStyleSheetCb;
	}
	attachLinkElement(e, t) {
		"_cssText" in t.attributes && this.mutationCb({
			adds: [],
			removes: [],
			texts: [],
			attributes: [{
				id: t.id,
				attributes: t.attributes
			}]
		}), this.trackLinkElement(e);
	}
	trackLinkElement(e) {
		this.trackedLinkElements.has(e) || (this.trackedLinkElements.add(e), this.trackStylesheetInLinkElement(e));
	}
	adoptStyleSheets(e, t) {
		if (e.length === 0) return;
		let n = {
			id: t,
			styleIds: []
		}, r = [];
		for (let t of e) {
			let e;
			this.styleMirror.has(t) ? e = this.styleMirror.getId(t) : (e = this.styleMirror.add(t), r.push({
				styleId: e,
				rules: Array.from(t.rules || CSSRule, (e, t) => ({
					rule: tf(e),
					index: t
				}))
			})), n.styleIds.push(e);
		}
		r.length > 0 && (n.styles = r), this.adoptedStyleSheetCb(n);
	}
	reset() {
		this.styleMirror.reset(), this.trackedLinkElements = /* @__PURE__ */ new WeakSet();
	}
	trackStylesheetInLinkElement(e) {}
}, bm = class {
	constructor() {
		this.nodeMap = /* @__PURE__ */ new WeakMap(), this.loop = !0, this.periodicallyClear();
	}
	periodicallyClear() {
		Tp(() => {
			this.clear(), this.loop && this.periodicallyClear();
		});
	}
	inOtherBuffer(e, t) {
		let n = this.nodeMap.get(e);
		return n && Array.from(n).some((e) => e !== t);
	}
	add(e, t) {
		this.nodeMap.set(e, (this.nodeMap.get(e) || /* @__PURE__ */ new Set()).add(t));
	}
	clear() {
		this.nodeMap = /* @__PURE__ */ new WeakMap();
	}
	destroy() {
		this.loop = !1;
	}
}, Z, xm, Sm = sf();
function Cm(e = {}) {
	let { emit: t, checkoutEveryNms: n, checkoutEveryNth: r, blockClass: i = "rr-block", blockSelector: a = null, unblockSelector: o = null, ignoreClass: s = "rr-ignore", ignoreSelector: c = null, maskAllText: l = !1, maskTextClass: u = "rr-mask", unmaskTextClass: d = null, maskTextSelector: f = null, unmaskTextSelector: p = null, inlineStylesheet: m = !0, maskAllInputs: h, maskInputOptions: g, slimDOMOptions: _, maskAttributeFn: v, maskInputFn: y, maskTextFn: b, maxCanvasSize: x = null, packFn: S, sampling: C = {}, dataURLOptions: w = {}, mousemoveWait: ee, recordCanvas: te = !1, recordCrossOriginIframes: ne = !1, recordAfter: re = e.recordAfter === "DOMContentLoaded" ? e.recordAfter : "load", userTriggeredOnInput: ie = !1, collectFonts: ae = !1, inlineImages: T = !1, plugins: E, keepIframeSrcFn: oe = () => !1, ignoreCSSAttributes: se = /* @__PURE__ */ new Set([]), errorHandler: ce, onMutation: le, getCanvasManager: ue } = e;
	Vp(ce);
	let de = !ne || window.parent === window, fe = !1;
	if (!de) try {
		window.parent.document && (fe = !1);
	} catch {
		fe = !0;
	}
	if (de && !t) throw Error("emit function is required");
	ee !== void 0 && C.mousemove === void 0 && (C.mousemove = ee), Sm.reset();
	let pe = h === !0 ? {
		color: !0,
		date: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0,
		textarea: !0,
		select: !0,
		radio: !0,
		checkbox: !0
	} : g === void 0 ? {} : g, me = _ === !0 || _ === "all" ? {
		script: !0,
		comment: !0,
		headFavicon: !0,
		headWhitespace: !0,
		headMetaSocial: !0,
		headMetaRobots: !0,
		headMetaHttpEquiv: !0,
		headMetaVerification: !0,
		headMetaAuthorship: _ === "all",
		headMetaDescKeywords: _ === "all"
	} : _ || {};
	mp();
	let he, ge = 0, _e = (e) => {
		for (let t of E || []) t.eventProcessor && (e = t.eventProcessor(e));
		return S && !fe && (e = S(e)), e;
	};
	Z = (e, i) => {
		let a = e;
		if (a.timestamp = ip(), ir([
			Wp,
			"access",
			(e) => e[0],
			"optionalAccess",
			(e) => e.isFrozen,
			"call",
			(e) => e()
		]) && a.type !== J.FullSnapshot && !(a.type === J.IncrementalSnapshot && a.data.source === Y.Mutation) && Wp.forEach((e) => e.unfreeze()), de) ir([
			t,
			"optionalCall",
			(e) => e(_e(a), i)
		]);
		else if (fe) {
			let e = {
				type: "rrweb",
				event: _e(a),
				origin: window.location.origin,
				isCheckout: i
			};
			window.parent.postMessage(e, "*");
		}
		if (a.type === J.FullSnapshot) he = a, ge = 0;
		else if (a.type === J.IncrementalSnapshot) {
			if (a.data.source === Y.Mutation && a.data.isAttachIframe) return;
			ge++;
			let e = r && ge >= r, t = n && he && a.timestamp - he.timestamp > n;
			(e || t) && Te(!0);
		}
	};
	let ve = (e) => {
		Z({
			type: J.IncrementalSnapshot,
			data: {
				source: Y.Mutation,
				...e
			}
		});
	}, ye = (e) => Z({
		type: J.IncrementalSnapshot,
		data: {
			source: Y.Scroll,
			...e
		}
	}), D = (e) => Z({
		type: J.IncrementalSnapshot,
		data: {
			source: Y.CanvasMutation,
			...e
		}
	}), be = new ym({
		mutationCb: ve,
		adoptedStyleSheetCb: (e) => Z({
			type: J.IncrementalSnapshot,
			data: {
				source: Y.AdoptedStyleSheet,
				...e
			}
		})
	}), xe = typeof __RRWEB_EXCLUDE_IFRAME__ == "boolean" && __RRWEB_EXCLUDE_IFRAME__ ? new mm() : new hm({
		mirror: Sm,
		mutationCb: ve,
		stylesheetManager: be,
		recordCrossOriginIframes: ne,
		wrappedEmit: Z
	});
	for (let e of E || []) e.getMirror && e.getMirror({
		nodeMirror: Sm,
		crossOriginIframeMirror: xe.crossOriginIframeMirror,
		crossOriginIframeStyleMirror: xe.crossOriginIframeStyleMirror
	});
	let Se = new bm(), Ce = Tm(ue, {
		mirror: Sm,
		win: window,
		mutationCb: (e) => Z({
			type: J.IncrementalSnapshot,
			data: {
				source: Y.CanvasMutation,
				...e
			}
		}),
		recordCanvas: te,
		blockClass: i,
		blockSelector: a,
		unblockSelector: o,
		maxCanvasSize: x,
		sampling: C.canvas,
		dataURLOptions: w,
		errorHandler: ce
	}), we = typeof __RRWEB_EXCLUDE_SHADOW_DOM__ == "boolean" && __RRWEB_EXCLUDE_SHADOW_DOM__ ? new gm() : new _m({
		mutationCb: ve,
		scrollCb: ye,
		bypassOptions: {
			onMutation: le,
			blockClass: i,
			blockSelector: a,
			unblockSelector: o,
			maskAllText: l,
			maskTextClass: u,
			unmaskTextClass: d,
			maskTextSelector: f,
			unmaskTextSelector: p,
			inlineStylesheet: m,
			maskInputOptions: pe,
			dataURLOptions: w,
			maskAttributeFn: v,
			maskTextFn: b,
			maskInputFn: y,
			recordCanvas: te,
			inlineImages: T,
			sampling: C,
			slimDOMOptions: me,
			iframeManager: xe,
			stylesheetManager: be,
			canvasManager: Ce,
			keepIframeSrcFn: oe,
			processedNodeManager: Se
		},
		mirror: Sm
	}), Te = (e = !1) => {
		Z({
			type: J.Meta,
			data: {
				href: window.location.href,
				width: sp(),
				height: op()
			}
		}, e), be.reset(), we.init(), Wp.forEach((e) => e.lock());
		let t = Xf(document, {
			mirror: Sm,
			blockClass: i,
			blockSelector: a,
			unblockSelector: o,
			maskAllText: l,
			maskTextClass: u,
			unmaskTextClass: d,
			maskTextSelector: f,
			unmaskTextSelector: p,
			inlineStylesheet: m,
			maskAllInputs: pe,
			maskAttributeFn: v,
			maskInputFn: y,
			maskTextFn: b,
			slimDOM: me,
			dataURLOptions: w,
			recordCanvas: te,
			inlineImages: T,
			onSerialize: (e) => {
				hp(e, Sm) && xe.addIframe(e), gp(e, Sm) && be.trackLinkElement(e), _p(e) && we.addShadowRoot(e.shadowRoot, document);
			},
			onIframeLoad: (e, t) => {
				xe.attachIframe(e, t), we.observeAttachShadow(e);
			},
			onStylesheetLoad: (e, t) => {
				be.attachLinkElement(e, t);
			},
			keepIframeSrcFn: oe
		});
		if (!t) return console.warn("Failed to snapshot the document");
		Z({
			type: J.FullSnapshot,
			data: {
				node: t,
				initialOffset: ap(window)
			}
		}), Wp.forEach((e) => e.unlock()), document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0 && be.adoptStyleSheets(document.adoptedStyleSheets, Sm.getId(document));
	};
	xm = Te;
	try {
		let e = [], t = (e) => X(lm)({
			onMutation: le,
			mutationCb: ve,
			mousemoveCb: (e, t) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: t,
					positions: e
				}
			}),
			mouseInteractionCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.MouseInteraction,
					...e
				}
			}),
			scrollCb: ye,
			viewportResizeCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.ViewportResize,
					...e
				}
			}),
			inputCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.Input,
					...e
				}
			}),
			mediaInteractionCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.MediaInteraction,
					...e
				}
			}),
			styleSheetRuleCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.StyleSheetRule,
					...e
				}
			}),
			styleDeclarationCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.StyleDeclaration,
					...e
				}
			}),
			canvasMutationCb: D,
			fontCb: (e) => Z({
				type: J.IncrementalSnapshot,
				data: {
					source: Y.Font,
					...e
				}
			}),
			selectionCb: (e) => {
				Z({
					type: J.IncrementalSnapshot,
					data: {
						source: Y.Selection,
						...e
					}
				});
			},
			customElementCb: (e) => {
				Z({
					type: J.IncrementalSnapshot,
					data: {
						source: Y.CustomElement,
						...e
					}
				});
			},
			blockClass: i,
			ignoreClass: s,
			ignoreSelector: c,
			maskAllText: l,
			maskTextClass: u,
			unmaskTextClass: d,
			maskTextSelector: f,
			unmaskTextSelector: p,
			maskInputOptions: pe,
			inlineStylesheet: m,
			sampling: C,
			recordCanvas: te,
			inlineImages: T,
			userTriggeredOnInput: ie,
			collectFonts: ae,
			doc: e,
			maskAttributeFn: v,
			maskInputFn: y,
			maskTextFn: b,
			keepIframeSrcFn: oe,
			blockSelector: a,
			unblockSelector: o,
			slimDOMOptions: me,
			dataURLOptions: w,
			mirror: Sm,
			iframeManager: xe,
			stylesheetManager: be,
			shadowDomManager: we,
			processedNodeManager: Se,
			canvasManager: Ce,
			ignoreCSSAttributes: se,
			plugins: ir([
				E,
				"optionalAccess",
				(e) => e.filter,
				"call",
				(e) => e((e) => e.observer),
				"optionalAccess",
				(e) => e.map,
				"call",
				(e) => e((e) => ({
					observer: e.observer,
					options: e.options,
					callback: (t) => Z({
						type: J.Plugin,
						data: {
							plugin: e.name,
							payload: t
						}
					})
				}))
			]) || []
		}, {});
		xe.addLoadListener((n) => {
			try {
				e.push(t(n.contentDocument));
			} catch (e) {
				console.warn(e);
			}
		});
		let n = () => {
			Te(), e.push(t(document));
		};
		return document.readyState === "interactive" || document.readyState === "complete" ? n() : (e.push(Qf("DOMContentLoaded", () => {
			Z({
				type: J.DomContentLoaded,
				data: {}
			}), re === "DOMContentLoaded" && n();
		})), e.push(Qf("load", () => {
			Z({
				type: J.Load,
				data: {}
			}), re === "load" && n();
		}, window))), () => {
			e.forEach((e) => e()), Se.destroy(), xm = void 0, Hp();
		};
	} catch (e) {
		console.warn(e);
	}
}
function wm(e) {
	if (!xm) throw Error("please take full snapshot after start recording");
	xm(e);
}
Cm.mirror = Sm, Cm.takeFullSnapshot = wm;
function Tm(e, t) {
	try {
		return e ? e(t) : new vm();
	} catch {
		return console.warn("Unable to initialize CanvasManager"), new vm();
	}
}
var Em = 3, Dm = 5;
function Om(e) {
	return e > 9999999999 ? e : e * 1e3;
}
function km(e) {
	return e > 9999999999 ? e / 1e3 : e;
}
function Am(e, t) {
	t.category !== "sentry.transaction" && (["ui.click", "ui.input"].includes(t.category) ? e.triggerUserActivity() : e.checkAndHandleExpiredSession(), e.addUpdate(() => (e.throttledAddEvent({
		type: J.Custom,
		timestamp: (t.timestamp || 0) * 1e3,
		data: {
			tag: "breadcrumb",
			payload: Xt(t, 10, 1e3)
		}
	}), t.category === "console")));
}
var jm = "button,a";
function Mm(e) {
	return e.closest(jm) || e;
}
function Nm(e) {
	let t = Pm(e);
	return !t || !(t instanceof Element) ? t : Mm(t);
}
function Pm(e) {
	return Fm(e) ? e.target : e;
}
function Fm(e) {
	return typeof e == "object" && !!e && "target" in e;
}
var Im;
function Lm(e) {
	return Im || (Im = [], Rm()), Im.push(e), () => {
		let t = Im ? Im.indexOf(e) : -1;
		t > -1 && Im.splice(t, 1);
	};
}
function Rm() {
	O(G, "open", function(e) {
		return function(...t) {
			if (Im) try {
				Im.forEach((e) => e());
			} catch {}
			return e.apply(G, t);
		};
	});
}
function zm(e, t, n) {
	e.handleClick(t, n);
}
var Bm = class {
	constructor(e, t, n = Am) {
		this._lastMutation = 0, this._lastScroll = 0, this._clicks = [], this._timeout = t.timeout / 1e3, this._threshold = t.threshold / 1e3, this._scollTimeout = t.scrollTimeout / 1e3, this._replay = e, this._ignoreSelector = t.ignoreSelector, this._addBreadcrumbEvent = n;
	}
	addListeners() {
		let e = Lm(() => {
			this._lastMutation = Wm();
		});
		this._teardown = () => {
			e(), this._clicks = [], this._lastMutation = 0, this._lastScroll = 0;
		};
	}
	removeListeners() {
		this._teardown && this._teardown(), this._checkClickTimeout && clearTimeout(this._checkClickTimeout);
	}
	handleClick(e, t) {
		if (Hm(t, this._ignoreSelector) || !Um(e)) return;
		let n = {
			timestamp: km(e.timestamp),
			clickBreadcrumb: e,
			clickCount: 0,
			node: t
		};
		this._clicks.some((e) => e.node === n.node && Math.abs(e.timestamp - n.timestamp) < 1) || (this._clicks.push(n), this._clicks.length === 1 && this._scheduleCheckClicks());
	}
	registerMutation(e = Date.now()) {
		this._lastMutation = km(e);
	}
	registerScroll(e = Date.now()) {
		this._lastScroll = km(e);
	}
	registerClick(e) {
		let t = Mm(e);
		this._handleMultiClick(t);
	}
	_handleMultiClick(e) {
		this._getClicks(e).forEach((e) => {
			e.clickCount++;
		});
	}
	_getClicks(e) {
		return this._clicks.filter((t) => t.node === e);
	}
	_checkClicks() {
		let e = [], t = Wm();
		this._clicks.forEach((n) => {
			!n.mutationAfter && this._lastMutation && (n.mutationAfter = n.timestamp <= this._lastMutation ? this._lastMutation - n.timestamp : void 0), !n.scrollAfter && this._lastScroll && (n.scrollAfter = n.timestamp <= this._lastScroll ? this._lastScroll - n.timestamp : void 0), n.timestamp + this._timeout <= t && e.push(n);
		});
		for (let t of e) {
			let e = this._clicks.indexOf(t);
			e > -1 && (this._generateBreadcrumbs(t), this._clicks.splice(e, 1));
		}
		this._clicks.length && this._scheduleCheckClicks();
	}
	_generateBreadcrumbs(e) {
		let t = this._replay, n = e.scrollAfter && e.scrollAfter <= this._scollTimeout, r = e.mutationAfter && e.mutationAfter <= this._threshold, i = !n && !r, { clickCount: a, clickBreadcrumb: o } = e;
		if (i) {
			let n = Math.min(e.mutationAfter || this._timeout, this._timeout) * 1e3, r = n < this._timeout * 1e3 ? "mutation" : "timeout", i = {
				type: "default",
				message: o.message,
				timestamp: o.timestamp,
				category: "ui.slowClickDetected",
				data: {
					...o.data,
					url: G.location.href,
					route: t.getCurrentRoute(),
					timeAfterClickMs: n,
					endReason: r,
					clickCount: a || 1
				}
			};
			this._addBreadcrumbEvent(t, i);
			return;
		}
		if (a > 1) {
			let e = {
				type: "default",
				message: o.message,
				timestamp: o.timestamp,
				category: "ui.multiClick",
				data: {
					...o.data,
					url: G.location.href,
					route: t.getCurrentRoute(),
					clickCount: a,
					metric: !0
				}
			};
			this._addBreadcrumbEvent(t, e);
		}
	}
	_scheduleCheckClicks() {
		this._checkClickTimeout && clearTimeout(this._checkClickTimeout), this._checkClickTimeout = setTimeout(() => this._checkClicks(), 1e3);
	}
}, Vm = [
	"A",
	"BUTTON",
	"INPUT"
];
function Hm(e, t) {
	return !!(!Vm.includes(e.tagName) || e.tagName === "INPUT" && !["submit", "button"].includes(e.getAttribute("type") || "") || e.tagName === "A" && (e.hasAttribute("download") || e.hasAttribute("target") && e.getAttribute("target") !== "_self") || t && e.matches(t));
}
function Um(e) {
	return !!(e.data && typeof e.data.nodeId == "number" && e.timestamp);
}
function Wm() {
	return Date.now() / 1e3;
}
function Gm(e, t) {
	try {
		if (!Km(t)) return;
		let { source: n } = t.data;
		if (n === Y.Mutation && e.registerMutation(t.timestamp), n === Y.Scroll && e.registerScroll(t.timestamp), qm(t)) {
			let { type: n, id: r } = t.data, i = Cm.mirror.getNode(r);
			i instanceof HTMLElement && n === Op.Click && e.registerClick(i);
		}
	} catch {}
}
function Km(e) {
	return e.type === Em;
}
function qm(e) {
	return e.data.source === Y.MouseInteraction;
}
function Jm(e) {
	return {
		timestamp: Date.now() / 1e3,
		type: "default",
		...e
	};
}
var Ym;
(function(e) {
	e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment";
})(Ym ||= {});
var Xm = /* @__PURE__ */ new Set([
	"id",
	"class",
	"aria-label",
	"role",
	"name",
	"alt",
	"title",
	"data-test-id",
	"data-testid",
	"disabled",
	"aria-disabled",
	"data-sentry-component"
]);
function Zm(e) {
	let t = {};
	for (let n in e) if (Xm.has(n)) {
		let r = n;
		(n === "data-testid" || n === "data-test-id") && (r = "testId"), t[r] = e[n];
	}
	return t;
}
var Qm = (e) => (t) => {
	if (!e.isEnabled()) return;
	let n = eh(t);
	if (!n) return;
	let r = t.name === "click", i = r ? t.event : void 0;
	r && e.clickDetector && i && i.target && !i.altKey && !i.metaKey && !i.ctrlKey && !i.shiftKey && zm(e.clickDetector, n, Nm(t.event)), Am(e, n);
};
function $m(e, t) {
	let n = Cm.mirror.getId(e), r = n && Cm.mirror.getNode(n), i = r && Cm.mirror.getMeta(r), a = i && nh(i) ? i : null;
	return {
		message: t,
		data: a ? {
			nodeId: n,
			node: {
				id: n,
				tagName: a.tagName,
				textContent: Array.from(a.childNodes).map((e) => e.type === Ym.Text && e.textContent).filter(Boolean).map((e) => e.trim()).join(""),
				attributes: Zm(a.attributes)
			}
		} : {}
	};
}
function eh(e) {
	let { target: t, message: n } = th(e);
	return Jm({
		category: `ui.${e.name}`,
		...$m(t, n)
	});
}
function th(e) {
	let t = e.name === "click", n, r = null;
	try {
		r = t ? Nm(e.event) : Pm(e.event), n = le(r, { maxStringLength: 200 }) || "<unknown>";
	} catch {
		n = "<unknown>";
	}
	return {
		target: r,
		message: n
	};
}
function nh(e) {
	return e.type === Ym.Element;
}
function rh(e, t) {
	if (!e.isEnabled()) return;
	e.updateUserActivity();
	let n = ih(t);
	n && Am(e, n);
}
function ih(e) {
	let { metaKey: t, shiftKey: n, ctrlKey: r, altKey: i, key: a, target: o } = e;
	if (!o || ah(o) || !a) return null;
	let s = t || r || i, c = a.length === 1;
	if (!s && c) return null;
	let l = le(o, { maxStringLength: 200 }) || "<unknown>";
	return Jm({
		category: "ui.keyDown",
		message: l,
		data: {
			...$m(o, l).data,
			metaKey: t,
			shiftKey: n,
			ctrlKey: r,
			altKey: i,
			key: a
		}
	});
}
function ah(e) {
	return e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable;
}
var oh = {
	resource: fh,
	paint: uh,
	navigation: dh
};
function sh(e) {
	return e.map(ch).filter(Boolean);
}
function ch(e) {
	return oh[e.entryType] ? oh[e.entryType](e) : null;
}
function lh(e) {
	return ((j || G.performance.timeOrigin) + e) / 1e3;
}
function uh(e) {
	let { duration: t, entryType: n, name: r, startTime: i } = e, a = lh(i);
	return {
		type: n,
		name: r,
		start: a,
		end: a + t,
		data: void 0
	};
}
function dh(e) {
	let { entryType: t, name: n, decodedBodySize: r, duration: i, domComplete: a, encodedBodySize: o, domContentLoadedEventStart: s, domContentLoadedEventEnd: c, domInteractive: l, loadEventStart: u, loadEventEnd: d, redirectCount: f, startTime: p, transferSize: m, type: h } = e;
	return i === 0 ? null : {
		type: `${t}.${h}`,
		start: lh(p),
		end: lh(a),
		name: n,
		data: {
			size: m,
			decodedBodySize: r,
			encodedBodySize: o,
			duration: i,
			domInteractive: l,
			domContentLoadedEventStart: s,
			domContentLoadedEventEnd: c,
			loadEventStart: u,
			loadEventEnd: d,
			domComplete: a,
			redirectCount: f
		}
	};
}
function fh(e) {
	let { entryType: t, initiatorType: n, name: r, responseEnd: i, startTime: a, decodedBodySize: o, encodedBodySize: s, responseStatus: c, transferSize: l } = e;
	return ["fetch", "xmlhttprequest"].includes(n) ? null : {
		type: `${t}.${n}`,
		start: lh(a),
		end: lh(i),
		name: r,
		data: {
			size: l,
			statusCode: c,
			decodedBodySize: o,
			encodedBodySize: s
		}
	};
}
function ph(e) {
	let t = e.entries, n = t[t.length - 1], r = n ? n.element : void 0, i = e.value, a = lh(i);
	return {
		type: "largest-contentful-paint",
		name: "largest-contentful-paint",
		start: a,
		end: a,
		data: {
			value: i,
			size: i,
			nodeId: r ? Cm.mirror.getId(r) : void 0
		}
	};
}
function mh(e) {
	function t(t) {
		e.performanceEntries.includes(t) || e.performanceEntries.push(t);
	}
	function n({ entries: e }) {
		e.forEach(t);
	}
	let r = [];
	return [
		"navigation",
		"paint",
		"resource"
	].forEach((e) => {
		r.push(dc(e, n));
	}), r.push(sc(({ metric: t }) => {
		e.replayPerformanceEntries.push(ph(t));
	})), () => {
		r.forEach((e) => e());
	};
}
var Q = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, hh = "var t=Uint8Array,n=Uint16Array,r=Int32Array,e=new t([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),i=new t([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),a=new t([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),s=function(t,e){for(var i=new n(31),a=0;a<31;++a)i[a]=e+=1<<t[a-1];var s=new r(i[30]);for(a=1;a<30;++a)for(var o=i[a];o<i[a+1];++o)s[o]=o-i[a]<<5|a;return{b:i,r:s}},o=s(e,2),f=o.b,h=o.r;f[28]=258,h[258]=28;for(var l=s(i,0).r,u=new n(32768),c=0;c<32768;++c){var v=(43690&c)>>1|(21845&c)<<1;v=(61680&(v=(52428&v)>>2|(13107&v)<<2))>>4|(3855&v)<<4,u[c]=((65280&v)>>8|(255&v)<<8)>>1}var d=function(t,r,e){for(var i=t.length,a=0,s=new n(r);a<i;++a)t[a]&&++s[t[a]-1];var o,f=new n(r);for(a=1;a<r;++a)f[a]=f[a-1]+s[a-1]<<1;if(e){o=new n(1<<r);var h=15-r;for(a=0;a<i;++a)if(t[a])for(var l=a<<4|t[a],c=r-t[a],v=f[t[a]-1]++<<c,d=v|(1<<c)-1;v<=d;++v)o[u[v]>>h]=l}else for(o=new n(i),a=0;a<i;++a)t[a]&&(o[a]=u[f[t[a]-1]++]>>15-t[a]);return o},g=new t(288);for(c=0;c<144;++c)g[c]=8;for(c=144;c<256;++c)g[c]=9;for(c=256;c<280;++c)g[c]=7;for(c=280;c<288;++c)g[c]=8;var w=new t(32);for(c=0;c<32;++c)w[c]=5;var p=d(g,9,0),y=d(w,5,0),m=function(t){return(t+7)/8|0},b=function(n,r,e){return(null==r||r<0)&&(r=0),(null==e||e>n.length)&&(e=n.length),new t(n.subarray(r,e))},M=[\"unexpected EOF\",\"invalid block type\",\"invalid length/literal\",\"invalid distance\",\"stream finished\",\"no stream handler\",,\"no callback\",\"invalid UTF-8 data\",\"extra field too long\",\"date not in range 1980-2099\",\"filename too long\",\"stream finishing\",\"invalid zip data\"],E=function(t,n,r){var e=new Error(n||M[t]);if(e.code=t,Error.captureStackTrace&&Error.captureStackTrace(e,E),!r)throw e;return e},z=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8},A=function(t,n,r){r<<=7&n;var e=n/8|0;t[e]|=r,t[e+1]|=r>>8,t[e+2]|=r>>16},_=function(r,e){for(var i=[],a=0;a<r.length;++a)r[a]&&i.push({s:a,f:r[a]});var s=i.length,o=i.slice();if(!s)return{t:F,l:0};if(1==s){var f=new t(i[0].s+1);return f[i[0].s]=1,{t:f,l:1}}i.sort((function(t,n){return t.f-n.f})),i.push({s:-1,f:25001});var h=i[0],l=i[1],u=0,c=1,v=2;for(i[0]={s:-1,f:h.f+l.f,l:h,r:l};c!=s-1;)h=i[i[u].f<i[v].f?u++:v++],l=i[u!=c&&i[u].f<i[v].f?u++:v++],i[c++]={s:-1,f:h.f+l.f,l:h,r:l};var d=o[0].s;for(a=1;a<s;++a)o[a].s>d&&(d=o[a].s);var g=new n(d+1),w=x(i[c-1],g,0);if(w>e){a=0;var p=0,y=w-e,m=1<<y;for(o.sort((function(t,n){return g[n.s]-g[t.s]||t.f-n.f}));a<s;++a){var b=o[a].s;if(!(g[b]>e))break;p+=m-(1<<w-g[b]),g[b]=e}for(p>>=y;p>0;){var M=o[a].s;g[M]<e?p-=1<<e-g[M]++-1:++a}for(;a>=0&&p;--a){var E=o[a].s;g[E]==e&&(--g[E],++p)}w=e}return{t:new t(g),l:w}},x=function(t,n,r){return-1==t.s?Math.max(x(t.l,n,r+1),x(t.r,n,r+1)):n[t.s]=r},D=function(t){for(var r=t.length;r&&!t[--r];);for(var e=new n(++r),i=0,a=t[0],s=1,o=function(t){e[i++]=t},f=1;f<=r;++f)if(t[f]==a&&f!=r)++s;else{if(!a&&s>2){for(;s>138;s-=138)o(32754);s>2&&(o(s>10?s-11<<5|28690:s-3<<5|12305),s=0)}else if(s>3){for(o(a),--s;s>6;s-=6)o(8304);s>2&&(o(s-3<<5|8208),s=0)}for(;s--;)o(a);s=1,a=t[f]}return{c:e.subarray(0,i),n:r}},T=function(t,n){for(var r=0,e=0;e<n.length;++e)r+=t[e]*n[e];return r},k=function(t,n,r){var e=r.length,i=m(n+2);t[i]=255&e,t[i+1]=e>>8,t[i+2]=255^t[i],t[i+3]=255^t[i+1];for(var a=0;a<e;++a)t[i+a+4]=r[a];return 8*(i+4+e)},C=function(t,r,s,o,f,h,l,u,c,v,m){z(r,m++,s),++f[256];for(var b=_(f,15),M=b.t,E=b.l,x=_(h,15),C=x.t,U=x.l,F=D(M),I=F.c,S=F.n,L=D(C),O=L.c,j=L.n,q=new n(19),B=0;B<I.length;++B)++q[31&I[B]];for(B=0;B<O.length;++B)++q[31&O[B]];for(var G=_(q,7),H=G.t,J=G.l,K=19;K>4&&!H[a[K-1]];--K);var N,P,Q,R,V=v+5<<3,W=T(f,g)+T(h,w)+l,X=T(f,M)+T(h,C)+l+14+3*K+T(q,H)+2*q[16]+3*q[17]+7*q[18];if(c>=0&&V<=W&&V<=X)return k(r,m,t.subarray(c,c+v));if(z(r,m,1+(X<W)),m+=2,X<W){N=d(M,E,0),P=M,Q=d(C,U,0),R=C;var Y=d(H,J,0);z(r,m,S-257),z(r,m+5,j-1),z(r,m+10,K-4),m+=14;for(B=0;B<K;++B)z(r,m+3*B,H[a[B]]);m+=3*K;for(var Z=[I,O],$=0;$<2;++$){var tt=Z[$];for(B=0;B<tt.length;++B){var nt=31&tt[B];z(r,m,Y[nt]),m+=H[nt],nt>15&&(z(r,m,tt[B]>>5&127),m+=tt[B]>>12)}}}else N=p,P=g,Q=y,R=w;for(B=0;B<u;++B){var rt=o[B];if(rt>255){A(r,m,N[(nt=rt>>18&31)+257]),m+=P[nt+257],nt>7&&(z(r,m,rt>>23&31),m+=e[nt]);var et=31&rt;A(r,m,Q[et]),m+=R[et],et>3&&(A(r,m,rt>>5&8191),m+=i[et])}else A(r,m,N[rt]),m+=P[rt]}return A(r,m,N[256]),m+P[256]},U=new r([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),F=new t(0),I=function(){for(var t=new Int32Array(256),n=0;n<256;++n){for(var r=n,e=9;--e;)r=(1&r&&-306674912)^r>>>1;t[n]=r}return t}(),S=function(){var t=1,n=0;return{p:function(r){for(var e=t,i=n,a=0|r.length,s=0;s!=a;){for(var o=Math.min(s+2655,a);s<o;++s)i+=e+=r[s];e=(65535&e)+15*(e>>16),i=(65535&i)+15*(i>>16)}t=e,n=i},d:function(){return(255&(t%=65521))<<24|(65280&t)<<8|(255&(n%=65521))<<8|n>>8}}},L=function(a,s,o,f,u){if(!u&&(u={l:1},s.dictionary)){var c=s.dictionary.subarray(-32768),v=new t(c.length+a.length);v.set(c),v.set(a,c.length),a=v,u.w=c.length}return function(a,s,o,f,u,c){var v=c.z||a.length,d=new t(f+v+5*(1+Math.ceil(v/7e3))+u),g=d.subarray(f,d.length-u),w=c.l,p=7&(c.r||0);if(s){p&&(g[0]=c.r>>3);for(var y=U[s-1],M=y>>13,E=8191&y,z=(1<<o)-1,A=c.p||new n(32768),_=c.h||new n(z+1),x=Math.ceil(o/3),D=2*x,T=function(t){return(a[t]^a[t+1]<<x^a[t+2]<<D)&z},F=new r(25e3),I=new n(288),S=new n(32),L=0,O=0,j=c.i||0,q=0,B=c.w||0,G=0;j+2<v;++j){var H=T(j),J=32767&j,K=_[H];if(A[J]=K,_[H]=J,B<=j){var N=v-j;if((L>7e3||q>24576)&&(N>423||!w)){p=C(a,g,0,F,I,S,O,q,G,j-G,p),q=L=O=0,G=j;for(var P=0;P<286;++P)I[P]=0;for(P=0;P<30;++P)S[P]=0}var Q=2,R=0,V=E,W=J-K&32767;if(N>2&&H==T(j-W))for(var X=Math.min(M,N)-1,Y=Math.min(32767,j),Z=Math.min(258,N);W<=Y&&--V&&J!=K;){if(a[j+Q]==a[j+Q-W]){for(var $=0;$<Z&&a[j+$]==a[j+$-W];++$);if($>Q){if(Q=$,R=W,$>X)break;var tt=Math.min(W,$-2),nt=0;for(P=0;P<tt;++P){var rt=j-W+P&32767,et=rt-A[rt]&32767;et>nt&&(nt=et,K=rt)}}}W+=(J=K)-(K=A[J])&32767}if(R){F[q++]=268435456|h[Q]<<18|l[R];var it=31&h[Q],at=31&l[R];O+=e[it]+i[at],++I[257+it],++S[at],B=j+Q,++L}else F[q++]=a[j],++I[a[j]]}}for(j=Math.max(j,B);j<v;++j)F[q++]=a[j],++I[a[j]];p=C(a,g,w,F,I,S,O,q,G,j-G,p),w||(c.r=7&p|g[p/8|0]<<3,p-=7,c.h=_,c.p=A,c.i=j,c.w=B)}else{for(j=c.w||0;j<v+w;j+=65535){var st=j+65535;st>=v&&(g[p/8|0]=w,st=v),p=k(g,p+1,a.subarray(j,st))}c.i=v}return b(d,0,f+m(p)+u)}(a,null==s.level?6:s.level,null==s.mem?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(a.length)))):12+s.mem,o,f,u)},O=function(t,n,r){for(;r;++n)t[n]=r,r>>>=8},j=function(){function n(n,r){if(\"function\"==typeof n&&(r=n,n={}),this.ondata=r,this.o=n||{},this.s={l:0,i:32768,w:32768,z:32768},this.b=new t(98304),this.o.dictionary){var e=this.o.dictionary.subarray(-32768);this.b.set(e,32768-e.length),this.s.i=32768-e.length}}return n.prototype.p=function(t,n){this.ondata(L(t,this.o,0,0,this.s),n)},n.prototype.push=function(n,r){this.ondata||E(5),this.s.l&&E(4);var e=n.length+this.s.z;if(e>this.b.length){if(e>2*this.b.length-32768){var i=new t(-32768&e);i.set(this.b.subarray(0,this.s.z)),this.b=i}var a=this.b.length-this.s.z;a&&(this.b.set(n.subarray(0,a),this.s.z),this.s.z=this.b.length,this.p(this.b,!1)),this.b.set(this.b.subarray(-32768)),this.b.set(n.subarray(a),32768),this.s.z=n.length-a+32768,this.s.i=32766,this.s.w=32768}else this.b.set(n,this.s.z),this.s.z+=n.length;this.s.l=1&r,(this.s.z>this.s.w+8191||r)&&(this.p(this.b,r||!1),this.s.w=this.s.i,this.s.i-=2)},n}();function q(t,n){n||(n={});var r=function(){var t=-1;return{p:function(n){for(var r=t,e=0;e<n.length;++e)r=I[255&r^n[e]]^r>>>8;t=r},d:function(){return~t}}}(),e=t.length;r.p(t);var i,a=L(t,n,10+((i=n).filename?i.filename.length+1:0),8),s=a.length;return function(t,n){var r=n.filename;if(t[0]=31,t[1]=139,t[2]=8,t[8]=n.level<2?4:9==n.level?2:0,t[9]=3,0!=n.mtime&&O(t,4,Math.floor(new Date(n.mtime||Date.now())/1e3)),r){t[3]=8;for(var e=0;e<=r.length;++e)t[e+10]=r.charCodeAt(e)}}(a,n),O(a,s-8,r.d()),O(a,s-4,e),a}var B=function(){function t(t,n){this.c=S(),this.v=1,j.call(this,t,n)}return t.prototype.push=function(t,n){this.c.p(t),j.prototype.push.call(this,t,n)},t.prototype.p=function(t,n){var r=L(t,this.o,this.v&&(this.o.dictionary?6:2),n&&4,this.s);this.v&&(function(t,n){var r=n.level,e=0==r?0:r<6?1:9==r?3:2;if(t[0]=120,t[1]=e<<6|(n.dictionary&&32),t[1]|=31-(t[0]<<8|t[1])%31,n.dictionary){var i=S();i.p(n.dictionary),O(t,2,i.d())}}(r,this.o),this.v=0),n&&O(r,r.length-4,this.c.d()),this.ondata(r,n)},t}(),G=\"undefined\"!=typeof TextEncoder&&new TextEncoder,H=\"undefined\"!=typeof TextDecoder&&new TextDecoder;try{H.decode(F,{stream:!0})}catch(t){}var J=function(){function t(t){this.ondata=t}return t.prototype.push=function(t,n){this.ondata||E(5),this.d&&E(4),this.ondata(K(t),this.d=n||!1)},t}();function K(n,r){if(r){for(var e=new t(n.length),i=0;i<n.length;++i)e[i]=n.charCodeAt(i);return e}if(G)return G.encode(n);var a=n.length,s=new t(n.length+(n.length>>1)),o=0,f=function(t){s[o++]=t};for(i=0;i<a;++i){if(o+5>s.length){var h=new t(o+8+(a-i<<1));h.set(s),s=h}var l=n.charCodeAt(i);l<128||r?f(l):l<2048?(f(192|l>>6),f(128|63&l)):l>55295&&l<57344?(f(240|(l=65536+(1047552&l)|1023&n.charCodeAt(++i))>>18),f(128|l>>12&63),f(128|l>>6&63),f(128|63&l)):(f(224|l>>12),f(128|l>>6&63),f(128|63&l))}return b(s,0,o)}const N=new class{constructor(){this._init()}clear(){this._init()}addEvent(t){if(!t)throw new Error(\"Adding invalid event\");const n=this._hasEvents?\",\":\"\";this.stream.push(n+t),this._hasEvents=!0}finish(){this.stream.push(\"]\",!0);const t=function(t){let n=0;for(let r=0,e=t.length;r<e;r++)n+=t[r].length;const r=new Uint8Array(n);for(let n=0,e=0,i=t.length;n<i;n++){const i=t[n];r.set(i,e),e+=i.length}return r}(this._deflatedData);return this._init(),t}_init(){this._hasEvents=!1,this._deflatedData=[],this.deflate=new B,this.deflate.ondata=(t,n)=>{this._deflatedData.push(t)},this.stream=new J(((t,n)=>{this.deflate.push(t,n)})),this.stream.push(\"[\")}},P={clear:()=>{N.clear()},addEvent:t=>N.addEvent(t),finish:()=>N.finish(),compress:t=>function(t){return q(K(t))}(t)};addEventListener(\"message\",(function(t){const n=t.data.method,r=t.data.id,e=t.data.arg;if(n in P&&\"function\"==typeof P[n])try{const t=P[n](e);postMessage({id:r,method:n,success:!0,response:t})}catch(t){postMessage({id:r,method:n,success:!1,response:t.message}),console.error(t)}})),postMessage({id:void 0,method:\"init\",success:!0,response:void 0});";
function gh() {
	let e = new Blob([hh]);
	return URL.createObjectURL(e);
}
function _h(e, t) {
	Q && (D.info(e), t && yh(e));
}
function vh(e, t) {
	Q && (D.info(e), t && setTimeout(() => {
		yh(e);
	}, 0));
}
function yh(e) {
	Fr({
		category: "console",
		data: { logger: "replay" },
		level: "info",
		message: e
	}, { level: "info" });
}
var bh = class extends Error {
	constructor() {
		super(`Event buffer exceeded maximum size of ${Ud}.`);
	}
}, xh = class {
	constructor() {
		this.events = [], this._totalSize = 0, this.hasCheckout = !1;
	}
	get hasEvents() {
		return this.events.length > 0;
	}
	get type() {
		return "sync";
	}
	destroy() {
		this.events = [];
	}
	async addEvent(e) {
		let t = JSON.stringify(e).length;
		if (this._totalSize += t, this._totalSize > Ud) throw new bh();
		this.events.push(e);
	}
	finish() {
		return new Promise((e) => {
			let t = this.events;
			this.clear(), e(JSON.stringify(t));
		});
	}
	clear() {
		this.events = [], this._totalSize = 0, this.hasCheckout = !1;
	}
	getEarliestTimestamp() {
		let e = this.events.map((e) => e.timestamp).sort()[0];
		return e ? Om(e) : null;
	}
}, Sh = class {
	constructor(e) {
		this._worker = e, this._id = 0;
	}
	ensureReady() {
		return this._ensureReadyPromise ||= new Promise((e, t) => {
			this._worker.addEventListener("message", ({ data: n }) => {
				n.success ? e() : t();
			}, { once: !0 }), this._worker.addEventListener("error", (e) => {
				t(e);
			}, { once: !0 });
		}), this._ensureReadyPromise;
	}
	destroy() {
		_h("[Replay] Destroying compression worker"), this._worker.terminate();
	}
	postMessage(e, t) {
		let n = this._getAndIncrementId();
		return new Promise((r, i) => {
			let a = ({ data: t }) => {
				let o = t;
				if (o.method === e && o.id === n) {
					if (this._worker.removeEventListener("message", a), !o.success) {
						Q && D.error("[Replay]", o.response), i(/* @__PURE__ */ Error("Error in compression worker"));
						return;
					}
					r(o.response);
				}
			};
			this._worker.addEventListener("message", a), this._worker.postMessage({
				id: n,
				method: e,
				arg: t
			});
		});
	}
	_getAndIncrementId() {
		return this._id++;
	}
}, Ch = class {
	constructor(e) {
		this._worker = new Sh(e), this._earliestTimestamp = null, this._totalSize = 0, this.hasCheckout = !1;
	}
	get hasEvents() {
		return !!this._earliestTimestamp;
	}
	get type() {
		return "worker";
	}
	ensureReady() {
		return this._worker.ensureReady();
	}
	destroy() {
		this._worker.destroy();
	}
	addEvent(e) {
		let t = Om(e.timestamp);
		(!this._earliestTimestamp || t < this._earliestTimestamp) && (this._earliestTimestamp = t);
		let n = JSON.stringify(e);
		return this._totalSize += n.length, this._totalSize > Ud ? Promise.reject(new bh()) : this._sendEventToWorker(n);
	}
	finish() {
		return this._finishRequest();
	}
	clear() {
		this._earliestTimestamp = null, this._totalSize = 0, this.hasCheckout = !1, this._worker.postMessage("clear").then(null, (e) => {
			Q && D.warn("[Replay] Sending \"clear\" message to worker failed", e);
		});
	}
	getEarliestTimestamp() {
		return this._earliestTimestamp;
	}
	_sendEventToWorker(e) {
		return this._worker.postMessage("addEvent", e);
	}
	async _finishRequest() {
		let e = await this._worker.postMessage("finish");
		return this._earliestTimestamp = null, this._totalSize = 0, e;
	}
}, wh = class {
	constructor(e) {
		this._fallback = new xh(), this._compression = new Ch(e), this._used = this._fallback, this._ensureWorkerIsLoadedPromise = this._ensureWorkerIsLoaded();
	}
	get type() {
		return this._used.type;
	}
	get hasEvents() {
		return this._used.hasEvents;
	}
	get hasCheckout() {
		return this._used.hasCheckout;
	}
	set hasCheckout(e) {
		this._used.hasCheckout = e;
	}
	destroy() {
		this._fallback.destroy(), this._compression.destroy();
	}
	clear() {
		return this._used.clear();
	}
	getEarliestTimestamp() {
		return this._used.getEarliestTimestamp();
	}
	addEvent(e) {
		return this._used.addEvent(e);
	}
	async finish() {
		return await this.ensureWorkerIsLoaded(), this._used.finish();
	}
	ensureWorkerIsLoaded() {
		return this._ensureWorkerIsLoadedPromise;
	}
	async _ensureWorkerIsLoaded() {
		try {
			await this._compression.ensureReady();
		} catch {
			_h("[Replay] Failed to load the compression worker, falling back to simple buffer");
			return;
		}
		await this._switchToCompressionWorker();
	}
	async _switchToCompressionWorker() {
		let { events: e, hasCheckout: t } = this._fallback, n = [];
		for (let t of e) n.push(this._compression.addEvent(t));
		this._compression.hasCheckout = t, this._used = this._compression;
		try {
			await Promise.all(n);
		} catch (e) {
			Q && D.warn("[Replay] Failed to add events when switching buffers.", e);
		}
	}
};
function Th({ useCompression: e, workerUrl: t }) {
	if (e && window.Worker) {
		let e = Eh(t);
		if (e) return e;
	}
	return _h("[Replay] Using simple buffer"), new xh();
}
function Eh(e) {
	try {
		let t = e || Dh();
		return t ? (_h(`[Replay] Using compression worker${e ? ` from ${e}` : ""}`), new wh(new Worker(t))) : void 0;
	} catch {
		_h("[Replay] Failed to create compression worker");
	}
}
function Dh() {
	return typeof __SENTRY_EXCLUDE_REPLAY_WORKER__ > "u" || !__SENTRY_EXCLUDE_REPLAY_WORKER__ ? gh() : "";
}
function Oh() {
	try {
		return "sessionStorage" in G && !!G.sessionStorage;
	} catch {
		return !1;
	}
}
function kh(e) {
	Ah(), e.session = void 0;
}
function Ah() {
	if (Oh()) try {
		G.sessionStorage.removeItem(kd);
	} catch {}
}
function jh(e) {
	return e !== void 0 && Math.random() < e;
}
function Mh(e) {
	let t = Date.now();
	return {
		id: e.id || A(),
		started: e.started || t,
		lastActivity: e.lastActivity || t,
		segmentId: e.segmentId || 0,
		sampled: e.sampled,
		previousSessionId: e.previousSessionId
	};
}
function Nh(e) {
	if (Oh()) try {
		G.sessionStorage.setItem(kd, JSON.stringify(e));
	} catch {}
}
function Ph(e, t) {
	return jh(e) ? "session" : t ? "buffer" : !1;
}
function Fh({ sessionSampleRate: e, allowBuffering: t, stickySession: n = !1 }, { previousSessionId: r } = {}) {
	let i = Mh({
		sampled: Ph(e, t),
		previousSessionId: r
	});
	return n && Nh(i), i;
}
function Ih(e) {
	if (!Oh()) return null;
	try {
		let t = G.sessionStorage.getItem(kd);
		if (!t) return null;
		let n = JSON.parse(t);
		return vh("[Replay] Loading existing session", e), Mh(n);
	} catch {
		return null;
	}
}
function Lh(e, t, n = +/* @__PURE__ */ new Date()) {
	return e === null || t === void 0 || t < 0 || t !== 0 && e + t <= n;
}
function Rh(e, { maxReplayDuration: t, sessionIdleExpire: n, targetTime: r = Date.now() }) {
	return Lh(e.started, t, r) || Lh(e.lastActivity, n, r);
}
function zh(e, { sessionIdleExpire: t, maxReplayDuration: n }) {
	return !(!Rh(e, {
		sessionIdleExpire: t,
		maxReplayDuration: n
	}) || e.sampled === "buffer" && e.segmentId === 0);
}
function Bh({ traceInternals: e, sessionIdleExpire: t, maxReplayDuration: n, previousSessionId: r }, i) {
	let a = i.stickySession && Ih(e);
	return a ? zh(a, {
		sessionIdleExpire: t,
		maxReplayDuration: n
	}) ? (vh("[Replay] Session in sessionStorage is expired, creating new one..."), Fh(i, { previousSessionId: a.id })) : a : (vh("[Replay] Creating new session", e), Fh(i, { previousSessionId: r }));
}
function Vh(e) {
	return e.type === J.Custom;
}
function Hh(e, t, n) {
	return Gh(e, t) ? (Wh(e, t, n), !0) : !1;
}
function Uh(e, t, n) {
	return Gh(e, t) ? Wh(e, t, n) : Promise.resolve(null);
}
async function Wh(e, t, n) {
	if (!e.eventBuffer) return null;
	try {
		n && e.recordingMode === "buffer" && e.eventBuffer.clear(), n && (e.eventBuffer.hasCheckout = !0);
		let r = Kh(t, e.getOptions().beforeAddRecordingEvent);
		return r ? await e.eventBuffer.addEvent(r) : void 0;
	} catch (t) {
		let n = t && t instanceof bh ? "addEventSizeExceeded" : "addEvent";
		Q && D.error(t), await e.stop({ reason: n });
		let r = P();
		r && r.recordDroppedEvent("internal_sdk_error", "replay");
	}
}
function Gh(e, t) {
	if (!e.eventBuffer || e.isPaused() || !e.isEnabled()) return !1;
	let n = Om(t.timestamp);
	return n + e.timeouts.sessionIdlePause < Date.now() ? !1 : n > e.getContext().initialTimestamp + e.getOptions().maxReplayDuration ? (_h(`[Replay] Skipping event with timestamp ${n} because it is after maxReplayDuration`, e.getOptions()._experiments.traceInternals), !1) : !0;
}
function Kh(e, t) {
	try {
		if (typeof t == "function" && Vh(e)) return t(e);
	} catch (e) {
		return Q && D.error("[Replay] An error occured in the `beforeAddRecordingEvent` callback, skipping the event...", e), null;
	}
	return e;
}
function qh(e) {
	return !e.type;
}
function Jh(e) {
	return e.type === "transaction";
}
function Yh(e) {
	return e.type === "replay_event";
}
function Xh(e) {
	return e.type === "feedback";
}
function Zh(e) {
	let t = eg();
	return (n, r) => {
		if (!e.isEnabled() || !qh(n) && !Jh(n)) return;
		let i = r && r.statusCode;
		if (!(t && (!i || i < 200 || i >= 300))) {
			if (Jh(n)) {
				Qh(e, n);
				return;
			}
			$h(e, n);
		}
	};
}
function Qh(e, t) {
	let n = e.getContext();
	t.contexts && t.contexts.trace && t.contexts.trace.trace_id && n.traceIds.size < 100 && n.traceIds.add(t.contexts.trace.trace_id);
}
function $h(e, t) {
	let n = e.getContext();
	if (t.event_id && n.errorIds.size < 100 && n.errorIds.add(t.event_id), e.recordingMode !== "buffer" || !t.tags || !t.tags.replayId) return;
	let { beforeErrorSampling: r } = e.getOptions();
	typeof r == "function" && !r(t) || setTimeout(() => {
		e.sendBufferedReplayOrFlush();
	});
}
function eg() {
	let e = P();
	if (!e) return !1;
	let t = e.getTransport();
	return t && t.send.__sentry__baseTransport__ || !1;
}
function tg(e) {
	return (t) => {
		!e.isEnabled() || !qh(t) || ng(e, t);
	};
}
function ng(e, t) {
	let n = t.exception && t.exception.values && t.exception.values[0].value;
	typeof n == "string" && (n.match(/reactjs\.org\/docs\/error-decoder\.html\?invariant=(418|419|422|423|425)/) || n.match(/(does not match server-rendered HTML|Hydration failed because)/i)) && Am(e, Jm({ category: "replay.hydrate-error" }));
}
function rg(e, t) {
	return e.type || !e.exception || !e.exception.values || !e.exception.values.length ? !1 : !!(t.originalException && t.originalException.__rrweb__);
}
function ig(e, t) {
	e.triggerUserActivity(), e.addUpdate(() => t.timestamp ? (e.throttledAddEvent({
		type: J.Custom,
		timestamp: t.timestamp * 1e3,
		data: {
			tag: "breadcrumb",
			payload: {
				timestamp: t.timestamp,
				type: "default",
				category: "sentry.feedback",
				data: { feedbackId: t.event_id }
			}
		}
	}), !1) : !0);
}
function ag(e, t) {
	return e.recordingMode !== "buffer" || t.message === jd || !t.exception || t.type ? !1 : jh(e.getOptions().errorSampleRate);
}
function og(e, t = !1) {
	let n = t ? Zh(e) : void 0;
	return Object.assign((t, r) => e.isEnabled() ? Yh(t) ? (delete t.breadcrumbs, t) : !qh(t) && !Jh(t) && !Xh(t) || !e.checkAndHandleExpiredSession() ? t : Xh(t) ? (e.flush(), t.contexts.feedback.replay_id = e.getSessionId(), ig(e, t), t) : rg(t, r) && !e.getOptions()._experiments.captureExceptions ? (Q && D.log("[Replay] Ignoring error from rrweb internals", t), null) : ((ag(e, t) || e.recordingMode === "session") && (t.tags = {
		...t.tags,
		replayId: e.getSessionId()
	}), n && n(t, { statusCode: 200 }), t) : t, { id: "Replay" });
}
function sg(e, t) {
	return t.map(({ type: t, start: n, end: r, name: i, data: a }) => {
		let o = e.throttledAddEvent({
			type: J.Custom,
			timestamp: n,
			data: {
				tag: "performanceSpan",
				payload: {
					op: t,
					description: i,
					startTimestamp: n,
					endTimestamp: r,
					data: a
				}
			}
		});
		return typeof o == "string" ? Promise.resolve(null) : o;
	});
}
function cg(e) {
	let { from: t, to: n } = e, r = Date.now() / 1e3;
	return {
		type: "navigation.push",
		start: r,
		end: r,
		name: n,
		data: { previous: t }
	};
}
function lg(e) {
	return (t) => {
		if (!e.isEnabled()) return;
		let n = cg(t);
		n !== null && (e.getContext().urls.push(n.name), e.triggerUserActivity(), e.addUpdate(() => (sg(e, [n]), !1)));
	};
}
function ug(e, t) {
	return Q && e.getOptions()._experiments.traceInternals ? !1 : So(t, P());
}
function dg(e, t) {
	e.isEnabled() && t !== null && (ug(e, t.name) || e.addUpdate(() => (sg(e, [t]), !0)));
}
function fg(e) {
	let { startTimestamp: t, endTimestamp: n, fetchData: r, response: i } = e;
	if (!n) return null;
	let { method: a, url: o } = r;
	return {
		type: "resource.fetch",
		start: t / 1e3,
		end: n / 1e3,
		name: o,
		data: {
			method: a,
			statusCode: i ? i.status : void 0
		}
	};
}
function pg(e) {
	return (t) => {
		e.isEnabled() && dg(e, fg(t));
	};
}
function mg(e) {
	let { startTimestamp: t, endTimestamp: n, xhr: r } = e, i = r[Bt];
	if (!t || !n || !i) return null;
	let { method: a, url: o, status_code: s } = i;
	return o === void 0 ? null : {
		type: "resource.xhr",
		name: o,
		start: t / 1e3,
		end: n / 1e3,
		data: {
			method: a,
			statusCode: s
		}
	};
}
function hg(e) {
	return (t) => {
		e.isEnabled() && dg(e, mg(t));
	};
}
function gg(e, t) {
	if (e) try {
		if (typeof e == "string") return t.encode(e).length;
		if (e instanceof URLSearchParams) return t.encode(e.toString()).length;
		if (e instanceof FormData) {
			let n = wg(e);
			return t.encode(n).length;
		}
		if (e instanceof Blob) return e.size;
		if (e instanceof ArrayBuffer) return e.byteLength;
	} catch {}
}
function _g(e) {
	if (!e) return;
	let t = parseInt(e, 10);
	return isNaN(t) ? void 0 : t;
}
function vg(e) {
	try {
		if (typeof e == "string") return [e];
		if (e instanceof URLSearchParams) return [e.toString()];
		if (e instanceof FormData) return [wg(e)];
		if (!e) return [void 0];
	} catch {
		return Q && D.warn("[Replay] Failed to serialize body", e), [void 0, "BODY_PARSE_ERROR"];
	}
	return Q && D.info("[Replay] Skipping network body because of body type", e), [void 0, "UNPARSEABLE_BODY_TYPE"];
}
function yg(e, t) {
	if (!e) return {
		headers: {},
		size: void 0,
		_meta: { warnings: [t] }
	};
	let n = { ...e._meta };
	return n.warnings = [...n.warnings || [], t], e._meta = n, e;
}
function bg(e, t) {
	if (!t) return null;
	let { startTimestamp: n, endTimestamp: r, url: i, method: a, statusCode: o, request: s, response: c } = t;
	return {
		type: e,
		start: n / 1e3,
		end: r / 1e3,
		name: i,
		data: k({
			method: a,
			statusCode: o,
			request: s,
			response: c
		})
	};
}
function xg(e) {
	return {
		headers: {},
		size: e,
		_meta: { warnings: ["URL_SKIPPED"] }
	};
}
function Sg(e, t, n) {
	if (!t && Object.keys(e).length === 0) return;
	if (!t) return { headers: e };
	if (!n) return {
		headers: e,
		size: t
	};
	let r = {
		headers: e,
		size: t
	}, { body: i, warnings: a } = Tg(n);
	return r.body = i, a && a.length > 0 && (r._meta = { warnings: a }), r;
}
function Cg(e, t) {
	return Object.keys(e).reduce((n, r) => {
		let i = r.toLowerCase();
		return t.includes(i) && e[r] && (n[i] = e[r]), n;
	}, {});
}
function wg(e) {
	return new URLSearchParams(e).toString();
}
function Tg(e) {
	if (!e || typeof e != "string") return { body: e };
	let t = e.length > zd, n = Eg(e);
	if (t) {
		let t = e.slice(0, zd);
		return n ? {
			body: t,
			warnings: ["MAYBE_JSON_TRUNCATED"]
		} : {
			body: `${t}…`,
			warnings: ["TEXT_TRUNCATED"]
		};
	}
	if (n) try {
		return { body: JSON.parse(e) };
	} catch {}
	return { body: e };
}
function Eg(e) {
	let t = e[0], n = e[e.length - 1];
	return t === "[" && n === "]" || t === "{" && n === "}";
}
function Dg(e, t) {
	return w(Og(e), t);
}
function Og(e, t = G.document.baseURI) {
	if (e.startsWith("http://") || e.startsWith("https://") || e.startsWith(G.location.origin)) return e;
	let n = new URL(e, t);
	if (n.origin !== new URL(t).origin) return e;
	let r = n.href;
	return !e.endsWith("/") && r.endsWith("/") ? r.slice(0, -1) : r;
}
async function kg(e, t, n) {
	try {
		let r = bg("resource.fetch", await jg(e, t, n));
		dg(n.replay, r);
	} catch (e) {
		Q && D.error("[Replay] Failed to capture fetch breadcrumb", e);
	}
}
function Ag(e, t, n) {
	let { input: r, response: i } = t, a = gg(r ? Ig(r) : void 0, n.textEncoder), o = i ? _g(i.headers.get("content-length")) : void 0;
	a !== void 0 && (e.data.request_body_size = a), o !== void 0 && (e.data.response_body_size = o);
}
async function jg(e, t, n) {
	let r = Date.now(), { startTimestamp: i = r, endTimestamp: a = r } = t, { url: o, method: s, status_code: c = 0, request_body_size: l, response_body_size: u } = e.data, d = Dg(o, n.networkDetailAllowUrls) && !Dg(o, n.networkDetailDenyUrls);
	return {
		startTimestamp: i,
		endTimestamp: a,
		url: o,
		method: s,
		statusCode: c,
		request: d ? Mg(n, t.input, l) : xg(l),
		response: await Ng(d, n, t.response, u)
	};
}
function Mg({ networkCaptureBodies: e, networkRequestHeaders: t }, n, r) {
	let i = n ? Rg(n, t) : {};
	if (!e) return Sg(i, r, void 0);
	let [a, o] = vg(Ig(n)), s = Sg(i, r, a);
	return o ? yg(s, o) : s;
}
async function Ng(e, { networkCaptureBodies: t, textEncoder: n, networkResponseHeaders: r }, i, a) {
	if (!e && a !== void 0) return xg(a);
	let o = i ? Lg(i.headers, r) : {};
	if (!i || !t && a !== void 0) return Sg(o, a, void 0);
	let [s, c] = await Fg(i), l = Pg(s, {
		networkCaptureBodies: t,
		textEncoder: n,
		responseBodySize: a,
		captureDetails: e,
		headers: o
	});
	return c ? yg(l, c) : l;
}
function Pg(e, { networkCaptureBodies: t, textEncoder: n, responseBodySize: r, captureDetails: i, headers: a }) {
	try {
		let o = e && e.length && r === void 0 ? gg(e, n) : r;
		return i ? t ? Sg(a, o, e) : Sg(a, o, void 0) : xg(o);
	} catch (e) {
		return Q && D.warn("[Replay] Failed to serialize response body", e), Sg(a, r, void 0);
	}
}
async function Fg(e) {
	let t = Bg(e);
	if (!t) return [void 0, "BODY_PARSE_ERROR"];
	try {
		return [await Vg(t)];
	} catch (e) {
		return Q && D.warn("[Replay] Failed to get text body from response", e), [void 0, "BODY_PARSE_ERROR"];
	}
}
function Ig(e = []) {
	if (!(e.length !== 2 || typeof e[1] != "object")) return e[1].body;
}
function Lg(e, t) {
	let n = {};
	return t.forEach((t) => {
		e.get(t) && (n[t] = e.get(t));
	}), n;
}
function Rg(e, t) {
	return e.length === 1 && typeof e[0] != "string" ? zg(e[0], t) : e.length === 2 ? zg(e[1], t) : {};
}
function zg(e, t) {
	if (!e) return {};
	let n = e.headers;
	return n ? n instanceof Headers ? Lg(n, t) : Array.isArray(n) ? {} : Cg(n, t) : {};
}
function Bg(e) {
	try {
		return e.clone();
	} catch (e) {
		Q && D.warn("[Replay] Failed to clone response body", e);
	}
}
function Vg(e) {
	return new Promise((t, n) => {
		let r = setTimeout(() => n(/* @__PURE__ */ Error("Timeout while trying to read response body")), 500);
		Hg(e).then((e) => t(e), (e) => n(e)).finally(() => clearTimeout(r));
	});
}
async function Hg(e) {
	return await e.text();
}
async function Ug(e, t, n) {
	try {
		let r = bg("resource.xhr", Gg(e, t, n));
		dg(n.replay, r);
	} catch (e) {
		Q && D.error("[Replay] Failed to capture xhr breadcrumb", e);
	}
}
function Wg(e, t, n) {
	let { xhr: r, input: i } = t;
	if (!r) return;
	let a = gg(i, n.textEncoder), o = r.getResponseHeader("content-length") ? _g(r.getResponseHeader("content-length")) : Yg(r.response, r.responseType, n.textEncoder);
	a !== void 0 && (e.data.request_body_size = a), o !== void 0 && (e.data.response_body_size = o);
}
function Gg(e, t, n) {
	let r = Date.now(), { startTimestamp: i = r, endTimestamp: a = r, input: o, xhr: s } = t, { url: c, method: l, status_code: u = 0, request_body_size: d, response_body_size: f } = e.data;
	if (!c) return null;
	if (!s || !Dg(c, n.networkDetailAllowUrls) || Dg(c, n.networkDetailDenyUrls)) return {
		startTimestamp: i,
		endTimestamp: a,
		url: c,
		method: l,
		statusCode: u,
		request: xg(d),
		response: xg(f)
	};
	let p = s[Bt], m = p ? Cg(p.request_headers, n.networkRequestHeaders) : {}, h = Cg(Kg(s), n.networkResponseHeaders), [g, _] = n.networkCaptureBodies ? vg(o) : [void 0], [v, y] = n.networkCaptureBodies ? qg(s) : [void 0], b = Sg(m, d, g), x = Sg(h, f, v);
	return {
		startTimestamp: i,
		endTimestamp: a,
		url: c,
		method: l,
		statusCode: u,
		request: _ ? yg(b, _) : b,
		response: y ? yg(x, y) : x
	};
}
function Kg(e) {
	let t = e.getAllResponseHeaders();
	return t ? t.split("\r\n").reduce((e, t) => {
		let [n, r] = t.split(": ");
		return e[n.toLowerCase()] = r, e;
	}, {}) : {};
}
function qg(e) {
	let t = [];
	try {
		return [e.responseText];
	} catch (e) {
		t.push(e);
	}
	try {
		return Jg(e.response, e.responseType);
	} catch (e) {
		t.push(e);
	}
	return Q && D.warn("[Replay] Failed to get xhr response body", ...t), [void 0];
}
function Jg(e, t) {
	try {
		if (typeof e == "string") return [e];
		if (e instanceof Document) return [e.body.outerHTML];
		if (t === "json" && e && typeof e == "object") return [JSON.stringify(e)];
		if (!e) return [void 0];
	} catch {
		return Q && D.warn("[Replay] Failed to serialize body", e), [void 0, "BODY_PARSE_ERROR"];
	}
	return Q && D.info("[Replay] Skipping network body because of body type", e), [void 0, "UNPARSEABLE_BODY_TYPE"];
}
function Yg(e, t, n) {
	try {
		return gg(t === "json" && e && typeof e == "object" ? JSON.stringify(e) : e, n);
	} catch {
		return;
	}
}
function Xg(e) {
	let t = P();
	try {
		let n = new TextEncoder(), { networkDetailAllowUrls: r, networkDetailDenyUrls: i, networkCaptureBodies: a, networkRequestHeaders: o, networkResponseHeaders: s } = e.getOptions(), c = {
			replay: e,
			textEncoder: n,
			networkDetailAllowUrls: r,
			networkDetailDenyUrls: i,
			networkCaptureBodies: a,
			networkRequestHeaders: o,
			networkResponseHeaders: s
		};
		t && t.on ? t.on("beforeAddBreadcrumb", (e, t) => Zg(c, e, t)) : (St(pg(e)), Vt(hg(e)));
	} catch {}
}
function Zg(e, t, n) {
	if (t.data) try {
		Qg(t) && e_(n) && (Wg(t, n, e), Ug(t, n, e)), $g(t) && t_(n) && (Ag(t, n, e), kg(t, n, e));
	} catch {
		Q && D.warn("Error when enriching network breadcrumb");
	}
}
function Qg(e) {
	return e.category === "xhr";
}
function $g(e) {
	return e.category === "fetch";
}
function e_(e) {
	return e && e.xhr;
}
function t_(e) {
	return e && e.response;
}
var n_ = null;
function r_(e) {
	return !!e.category;
}
var i_ = (e) => (t) => {
	if (!e.isEnabled()) return;
	let n = a_(t);
	n && Am(e, n);
};
function a_(e) {
	let t = e.getLastBreadcrumb && e.getLastBreadcrumb();
	return n_ === t || !t || (n_ = t, !r_(t) || [
		"fetch",
		"xhr",
		"sentry.event",
		"sentry.transaction"
	].includes(t.category) || t.category.startsWith("ui.")) ? null : t.category === "console" ? o_(t) : Jm(t);
}
function o_(e) {
	let t = e.data && e.data.arguments;
	if (!Array.isArray(t) || t.length === 0) return Jm(e);
	let n = !1, r = t.map((e) => {
		if (!e) return e;
		if (typeof e == "string") return e.length > Bd ? (n = !0, `${e.slice(0, Bd)}…`) : e;
		if (typeof e == "object") try {
			let t = Xt(e, 7);
			return JSON.stringify(t).length > Bd ? (n = !0, `${JSON.stringify(t, null, 2).slice(0, Bd)}…`) : t;
		} catch {}
		return e;
	});
	return Jm({
		...e,
		data: {
			...e.data,
			arguments: r,
			...n ? { _meta: { warnings: ["CONSOLE_ARG_TRUNCATED"] } } : {}
		}
	});
}
function s_(e) {
	let t = F(), n = P();
	t.addScopeListener(i_(e)), dt(Qm(e)), Lt(lg(e)), Xg(e);
	let r = og(e, !c_(n));
	n && n.addEventProcessor ? n.addEventProcessor(r) : ro(r), c_(n) && (n.on("beforeSendEvent", tg(e)), n.on("afterSendEvent", Zh(e)), n.on("createDsc", (t) => {
		let n = e.getSessionId();
		n && e.isEnabled() && e.recordingMode === "session" && e.checkAndHandleExpiredSession() && (t.replay_id = n);
	}), n.on("startTransaction", (t) => {
		e.lastTransaction = t;
	}), n.on("finishTransaction", (t) => {
		e.lastTransaction = t;
	}), n.on("beforeSendFeedback", (t, n) => {
		let r = e.getSessionId();
		n && n.includeReplay && e.isEnabled() && r && t.contexts && t.contexts.feedback && (t.contexts.feedback.replay_id = r);
	}));
}
function c_(e) {
	return !!(e && e.on);
}
async function l_(e) {
	try {
		return Promise.all(sg(e, [u_(G.performance.memory)]));
	} catch {
		return [];
	}
}
function u_(e) {
	let { jsHeapSizeLimit: t, totalJSHeapSize: n, usedJSHeapSize: r } = e, i = Date.now() / 1e3;
	return {
		type: "memory",
		name: "memory",
		start: i,
		end: i,
		data: { memory: {
			jsHeapSizeLimit: t,
			totalJSHeapSize: n,
			usedJSHeapSize: r
		} }
	};
}
function d_(e, t, n) {
	let r, i, a, o = n && n.maxWait ? Math.max(n.maxWait, t) : 0;
	function s() {
		return c(), r = e(), r;
	}
	function c() {
		i !== void 0 && clearTimeout(i), a !== void 0 && clearTimeout(a), i = a = void 0;
	}
	function l() {
		return i !== void 0 || a !== void 0 ? s() : r;
	}
	function u() {
		return i && clearTimeout(i), i = setTimeout(s, t), o && a === void 0 && (a = setTimeout(s, o)), r;
	}
	return u.cancel = c, u.flush = l, u;
}
function f_(e) {
	let t = !1;
	return (n, r) => {
		if (!e.checkAndHandleExpiredSession()) {
			Q && D.warn("[Replay] Received replay event after session expired.");
			return;
		}
		let i = r || !t;
		t = !0, e.clickDetector && Gm(e.clickDetector, n), e.addUpdate(() => {
			if (e.recordingMode === "buffer" && i && e.setInitialState(), !Hh(e, n, i)) return !0;
			if (!i) return !1;
			if (m_(e, i), e.session && e.session.previousSessionId) return !0;
			if (e.recordingMode === "buffer" && e.session && e.eventBuffer) {
				let t = e.eventBuffer.getEarliestTimestamp();
				t && (_h(`[Replay] Updating session start time to earliest event in buffer to ${new Date(t)}`, e.getOptions()._experiments.traceInternals), e.session.started = t, e.getOptions().stickySession && Nh(e.session));
			}
			return e.recordingMode === "session" && e.flush(), !0;
		});
	};
}
function p_(e) {
	let t = e.getOptions();
	return {
		type: J.Custom,
		timestamp: Date.now(),
		data: {
			tag: "options",
			payload: {
				shouldRecordCanvas: e.isRecordingCanvas(),
				sessionSampleRate: t.sessionSampleRate,
				errorSampleRate: t.errorSampleRate,
				useCompressionOption: t.useCompression,
				blockAllMedia: t.blockAllMedia,
				maskAllText: t.maskAllText,
				maskAllInputs: t.maskAllInputs,
				useCompression: e.eventBuffer ? e.eventBuffer.type === "worker" : !1,
				networkDetailHasUrls: t.networkDetailAllowUrls.length > 0,
				networkCaptureBodies: t.networkCaptureBodies,
				networkRequestHasHeaders: t.networkRequestHeaders.length > 0,
				networkResponseHasHeaders: t.networkResponseHeaders.length > 0
			}
		}
	};
}
function m_(e, t) {
	!t || !e.session || e.session.segmentId !== 0 || Hh(e, p_(e), !1);
}
function h_(e, t, n, r) {
	return In(Jn(e, qn(e), r, n), [[{ type: "replay_event" }, e], [{
		type: "replay_recording",
		length: typeof t == "string" ? new TextEncoder().encode(t).length : t.length
	}, t]]);
}
function g_({ recordingData: e, headers: t }) {
	let n, r = `${JSON.stringify(t)}
`;
	if (typeof e == "string") n = `${r}${e}`;
	else {
		let t = new TextEncoder().encode(r);
		n = new Uint8Array(t.length + e.length), n.set(t), n.set(e, t.length);
	}
	return n;
}
async function __({ client: e, scope: t, replayId: n, event: r }) {
	let i = {
		event_id: n,
		integrations: typeof e._integrations == "object" && e._integrations !== null && !Array.isArray(e._integrations) ? Object.keys(e._integrations) : void 0
	};
	e.emit && e.emit("preprocessEvent", r, i);
	let a = await yr(e.getOptions(), r, i, t, e, Si());
	if (!a) return null;
	a.platform = a.platform || "javascript";
	let o = e.getSdkMetadata && e.getSdkMetadata(), { name: s, version: c } = o && o.sdk || {};
	return a.sdk = {
		...a.sdk,
		name: s || "sentry.javascript.unknown",
		version: c || "0.0.0"
	}, a;
}
async function v_({ recordingData: e, replayId: t, segmentId: n, eventContext: r, timestamp: i, session: a }) {
	let o = g_({
		recordingData: e,
		headers: { segment_id: n }
	}), { urls: s, errorIds: c, traceIds: l, initialTimestamp: u } = r, d = P(), f = F(), p = d && d.getTransport(), m = d && d.getDsn();
	if (!d || !p || !m || !a.sampled) return;
	let h = {
		type: Ad,
		replay_start_timestamp: u / 1e3,
		timestamp: i / 1e3,
		error_ids: c,
		trace_ids: l,
		urls: s,
		replay_id: t,
		segment_id: n,
		replay_type: a.sampled
	}, g = await __({
		scope: f,
		client: d,
		replayId: t,
		event: h
	});
	if (!g) {
		d.recordDroppedEvent("event_processor", "replay", h), _h("An event processor returned `null`, will not send event.");
		return;
	}
	delete g.sdkProcessingMetadata;
	let _ = h_(g, o, m, d.getOptions().tunnel), v;
	try {
		v = await p.send(_);
	} catch (e) {
		let t = /* @__PURE__ */ Error(jd);
		try {
			t.cause = e;
		} catch {}
		throw t;
	}
	if (!v) return v;
	if (typeof v.statusCode == "number" && (v.statusCode < 200 || v.statusCode >= 300)) throw new y_(v.statusCode);
	let y = er({}, v);
	if ($n(y, "replay")) throw new b_(y);
	return v;
}
var y_ = class extends Error {
	constructor(e) {
		super(`Transport returned status code ${e}`);
	}
}, b_ = class extends Error {
	constructor(e) {
		super("Rate limit hit"), this.rateLimits = e;
	}
};
async function x_(e, t = {
	count: 0,
	interval: Ld
}) {
	let { recordingData: n, options: r } = e;
	if (n.length) try {
		return await v_(e), !0;
	} catch (n) {
		if (n instanceof y_ || n instanceof b_) throw n;
		if (Ir("Replays", { _retryCount: t.count }), Q && r._experiments && r._experiments.captureExceptions && jr(n), t.count >= Rd) {
			let e = /* @__PURE__ */ Error(`${jd} - max retries exceeded`);
			try {
				e.cause = n;
			} catch {}
			throw e;
		}
		return t.interval *= ++t.count, new Promise((n, r) => {
			setTimeout(async () => {
				try {
					await x_(e, t), n(!0);
				} catch (e) {
					r(e);
				}
			}, t.interval);
		});
	}
}
var S_ = "__THROTTLED", C_ = "__SKIPPED";
function w_(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i = (e) => {
		let t = e - n;
		r.forEach((e, n) => {
			n < t && r.delete(n);
		});
	}, a = () => [...r.values()].reduce((e, t) => e + t, 0), o = !1;
	return (...n) => {
		let s = Math.floor(Date.now() / 1e3);
		if (i(s), a() >= t) {
			let e = o;
			return o = !0, e ? C_ : S_;
		}
		o = !1;
		let c = r.get(s) || 0;
		return r.set(s, c + 1), e(...n);
	};
}
var T_ = class e {
	constructor({ options: t, recordingOptions: n }) {
		e.prototype.__init.call(this), e.prototype.__init2.call(this), e.prototype.__init3.call(this), e.prototype.__init4.call(this), e.prototype.__init5.call(this), e.prototype.__init6.call(this), this.eventBuffer = null, this.performanceEntries = [], this.replayPerformanceEntries = [], this.recordingMode = "session", this.timeouts = {
			sessionIdlePause: Md,
			sessionIdleExpire: Nd
		}, this._lastActivity = Date.now(), this._isEnabled = !1, this._isPaused = !1, this._hasInitializedCoreListeners = !1, this._context = {
			errorIds: /* @__PURE__ */ new Set(),
			traceIds: /* @__PURE__ */ new Set(),
			urls: [],
			initialTimestamp: Date.now(),
			initialUrl: ""
		}, this._recordingOptions = n, this._options = t, this._debouncedFlush = d_(() => this._flush(), this._options.flushMinDelay, { maxWait: this._options.flushMaxDelay }), this._throttledAddEvent = w_((e, t) => Uh(this, e, t), 300, 5);
		let { slowClickTimeout: r, slowClickIgnoreSelectors: i } = this.getOptions(), a = r ? {
			threshold: Math.min(Vd, r),
			timeout: r,
			scrollTimeout: Hd,
			ignoreSelector: i ? i.join(",") : ""
		} : void 0;
		a && (this.clickDetector = new Bm(this, a));
	}
	getContext() {
		return this._context;
	}
	isEnabled() {
		return this._isEnabled;
	}
	isPaused() {
		return this._isPaused;
	}
	isRecordingCanvas() {
		return !!this._canvas;
	}
	getOptions() {
		return this._options;
	}
	initializeSampling(e) {
		let { errorSampleRate: t, sessionSampleRate: n } = this._options;
		if (!(t <= 0 && n <= 0)) {
			if (this._initializeSessionForSampling(e), !this.session) {
				this._handleException(/* @__PURE__ */ Error("Unable to initialize and create session"));
				return;
			}
			this.session.sampled !== !1 && (this.recordingMode = this.session.sampled === "buffer" && this.session.segmentId === 0 ? "buffer" : "session", vh(`[Replay] Starting replay in ${this.recordingMode} mode`, this._options._experiments.traceInternals), this._initializeRecording());
		}
	}
	start() {
		if (this._isEnabled && this.recordingMode === "session") throw Error("Replay recording is already in progress");
		if (this._isEnabled && this.recordingMode === "buffer") throw Error("Replay buffering is in progress, call `flush()` to save the replay");
		vh("[Replay] Starting replay in session mode", this._options._experiments.traceInternals), this._updateUserActivity();
		let e = Bh({
			maxReplayDuration: this._options.maxReplayDuration,
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			traceInternals: this._options._experiments.traceInternals
		}, {
			stickySession: this._options.stickySession,
			sessionSampleRate: 1,
			allowBuffering: !1
		});
		this.session = e, this._initializeRecording();
	}
	startBuffering() {
		if (this._isEnabled) throw Error("Replay recording is already in progress");
		vh("[Replay] Starting replay in buffer mode", this._options._experiments.traceInternals);
		let e = Bh({
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			maxReplayDuration: this._options.maxReplayDuration,
			traceInternals: this._options._experiments.traceInternals
		}, {
			stickySession: this._options.stickySession,
			sessionSampleRate: 0,
			allowBuffering: !0
		});
		this.session = e, this.recordingMode = "buffer", this._initializeRecording();
	}
	startRecording() {
		try {
			let e = this._canvas;
			this._stopRecording = Cm({
				...this._recordingOptions,
				...this.recordingMode === "buffer" && { checkoutEveryNms: Id },
				emit: f_(this),
				onMutation: this._onMutationHandler,
				...e ? {
					recordCanvas: e.recordCanvas,
					getCanvasManager: e.getCanvasManager,
					sampling: e.sampling,
					dataURLOptions: e.dataURLOptions
				} : {}
			});
		} catch (e) {
			this._handleException(e);
		}
	}
	stopRecording() {
		try {
			return this._stopRecording &&= (this._stopRecording(), void 0), !0;
		} catch (e) {
			return this._handleException(e), !1;
		}
	}
	async stop({ forceFlush: e = !1, reason: t } = {}) {
		if (this._isEnabled) {
			this._isEnabled = !1;
			try {
				_h(`[Replay] Stopping Replay${t ? ` triggered by ${t}` : ""}`, this._options._experiments.traceInternals), this._removeListeners(), this.stopRecording(), this._debouncedFlush.cancel(), e && await this._flush({ force: !0 }), this.eventBuffer && this.eventBuffer.destroy(), this.eventBuffer = null, kh(this);
			} catch (e) {
				this._handleException(e);
			}
		}
	}
	pause() {
		this._isPaused || (this._isPaused = !0, this.stopRecording(), _h("[Replay] Pausing replay", this._options._experiments.traceInternals));
	}
	resume() {
		!this._isPaused || !this._checkSession() || (this._isPaused = !1, this.startRecording(), _h("[Replay] Resuming replay", this._options._experiments.traceInternals));
	}
	async sendBufferedReplayOrFlush({ continueRecording: e = !0 } = {}) {
		if (this.recordingMode === "session") return this.flushImmediate();
		let t = Date.now();
		_h("[Replay] Converting buffer to session", this._options._experiments.traceInternals), await this.flushImmediate();
		let n = this.stopRecording();
		!e || !n || this.recordingMode !== "session" && (this.recordingMode = "session", this.session && (this._updateUserActivity(t), this._updateSessionActivity(t), this._maybeSaveSession()), this.startRecording());
	}
	addUpdate(e) {
		let t = e();
		this.recordingMode !== "buffer" && t !== !0 && this._debouncedFlush();
	}
	triggerUserActivity() {
		if (this._updateUserActivity(), !this._stopRecording) {
			if (!this._checkSession()) return;
			this.resume();
			return;
		}
		this.checkAndHandleExpiredSession(), this._updateSessionActivity();
	}
	updateUserActivity() {
		this._updateUserActivity(), this._updateSessionActivity();
	}
	conditionalFlush() {
		return this.recordingMode === "buffer" ? Promise.resolve() : this.flushImmediate();
	}
	flush() {
		return this._debouncedFlush();
	}
	flushImmediate() {
		return this._debouncedFlush(), this._debouncedFlush.flush();
	}
	cancelFlush() {
		this._debouncedFlush.cancel();
	}
	getSessionId() {
		return this.session && this.session.id;
	}
	checkAndHandleExpiredSession() {
		if (this._lastActivity && Lh(this._lastActivity, this.timeouts.sessionIdlePause) && this.session && this.session.sampled === "session") {
			this.pause();
			return;
		}
		return !!this._checkSession();
	}
	setInitialState() {
		let e = `${G.location.pathname}${G.location.hash}${G.location.search}`, t = `${G.location.origin}${e}`;
		this.performanceEntries = [], this.replayPerformanceEntries = [], this._clearContext(), this._context.initialUrl = t, this._context.initialTimestamp = Date.now(), this._context.urls.push(t);
	}
	throttledAddEvent(e, t) {
		let n = this._throttledAddEvent(e, t);
		if (n === S_) {
			let e = Jm({ category: "replay.throttled" });
			this.addUpdate(() => !Hh(this, {
				type: Dm,
				timestamp: e.timestamp || 0,
				data: {
					tag: "breadcrumb",
					payload: e,
					metric: !0
				}
			}));
		}
		return n;
	}
	getCurrentRoute() {
		let e = this.lastTransaction || F().getTransaction(), t = (e && N(e).data || {})[na];
		if (!(!e || !t || !["route", "custom"].includes(t))) return N(e).description;
	}
	_initializeRecording() {
		this.setInitialState(), this._updateSessionActivity(), this.eventBuffer = Th({
			useCompression: this._options.useCompression,
			workerUrl: this._options.workerUrl
		}), this._removeListeners(), this._addListeners(), this._isEnabled = !0, this._isPaused = !1, this.startRecording();
	}
	_handleException(e) {
		Q && D.error("[Replay]", e), Q && this._options._experiments && this._options._experiments.captureExceptions && jr(e);
	}
	_initializeSessionForSampling(e) {
		let t = this._options.errorSampleRate > 0, n = Bh({
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			maxReplayDuration: this._options.maxReplayDuration,
			traceInternals: this._options._experiments.traceInternals,
			previousSessionId: e
		}, {
			stickySession: this._options.stickySession,
			sessionSampleRate: this._options.sessionSampleRate,
			allowBuffering: t
		});
		this.session = n;
	}
	_checkSession() {
		if (!this.session) return !1;
		let e = this.session;
		return zh(e, {
			sessionIdleExpire: this.timeouts.sessionIdleExpire,
			maxReplayDuration: this._options.maxReplayDuration
		}) ? (this._refreshSession(e), !1) : !0;
	}
	async _refreshSession(e) {
		this._isEnabled && (await this.stop({ reason: "refresh session" }), this.initializeSampling(e.id));
	}
	_addListeners() {
		try {
			G.document.addEventListener("visibilitychange", this._handleVisibilityChange), G.addEventListener("blur", this._handleWindowBlur), G.addEventListener("focus", this._handleWindowFocus), G.addEventListener("keydown", this._handleKeyboardEvent), this.clickDetector && this.clickDetector.addListeners(), this._hasInitializedCoreListeners ||= (s_(this), !0);
		} catch (e) {
			this._handleException(e);
		}
		this._performanceCleanupCallback = mh(this);
	}
	_removeListeners() {
		try {
			G.document.removeEventListener("visibilitychange", this._handleVisibilityChange), G.removeEventListener("blur", this._handleWindowBlur), G.removeEventListener("focus", this._handleWindowFocus), G.removeEventListener("keydown", this._handleKeyboardEvent), this.clickDetector && this.clickDetector.removeListeners(), this._performanceCleanupCallback && this._performanceCleanupCallback();
		} catch (e) {
			this._handleException(e);
		}
	}
	__init() {
		this._handleVisibilityChange = () => {
			G.document.visibilityState === "visible" ? this._doChangeToForegroundTasks() : this._doChangeToBackgroundTasks();
		};
	}
	__init2() {
		this._handleWindowBlur = () => {
			let e = Jm({ category: "ui.blur" });
			this._doChangeToBackgroundTasks(e);
		};
	}
	__init3() {
		this._handleWindowFocus = () => {
			let e = Jm({ category: "ui.focus" });
			this._doChangeToForegroundTasks(e);
		};
	}
	__init4() {
		this._handleKeyboardEvent = (e) => {
			rh(this, e);
		};
	}
	_doChangeToBackgroundTasks(e) {
		this.session && (Rh(this.session, {
			maxReplayDuration: this._options.maxReplayDuration,
			sessionIdleExpire: this.timeouts.sessionIdleExpire
		}) || (e && this._createCustomBreadcrumb(e), this.conditionalFlush()));
	}
	_doChangeToForegroundTasks(e) {
		if (this.session) {
			if (!this.checkAndHandleExpiredSession()) {
				_h("[Replay] Document has become active, but session has expired");
				return;
			}
			e && this._createCustomBreadcrumb(e);
		}
	}
	_updateUserActivity(e = Date.now()) {
		this._lastActivity = e;
	}
	_updateSessionActivity(e = Date.now()) {
		this.session && (this.session.lastActivity = e, this._maybeSaveSession());
	}
	_createCustomBreadcrumb(e) {
		this.addUpdate(() => {
			this.throttledAddEvent({
				type: J.Custom,
				timestamp: e.timestamp || 0,
				data: {
					tag: "breadcrumb",
					payload: e
				}
			});
		});
	}
	_addPerformanceEntries() {
		let e = sh(this.performanceEntries).concat(this.replayPerformanceEntries);
		return this.performanceEntries = [], this.replayPerformanceEntries = [], Promise.all(sg(this, e));
	}
	_clearContext() {
		this._context.errorIds.clear(), this._context.traceIds.clear(), this._context.urls = [];
	}
	_updateInitialTimestampFromEventBuffer() {
		let { session: e, eventBuffer: t } = this;
		if (!e || !t || e.segmentId) return;
		let n = t.getEarliestTimestamp();
		n && n < this._context.initialTimestamp && (this._context.initialTimestamp = n);
	}
	_popEventContext() {
		let e = {
			initialTimestamp: this._context.initialTimestamp,
			initialUrl: this._context.initialUrl,
			errorIds: Array.from(this._context.errorIds),
			traceIds: Array.from(this._context.traceIds),
			urls: this._context.urls
		};
		return this._clearContext(), e;
	}
	async _runFlush() {
		let e = this.getSessionId();
		if (!this.session || !this.eventBuffer || !e) {
			Q && D.error("[Replay] No session or eventBuffer found to flush.");
			return;
		}
		if (await this._addPerformanceEntries(), !(!this.eventBuffer || !this.eventBuffer.hasEvents) && (await l_(this), this.eventBuffer && e === this.getSessionId())) try {
			this._updateInitialTimestampFromEventBuffer();
			let t = Date.now();
			if (t - this._context.initialTimestamp > this._options.maxReplayDuration + 3e4) throw Error("Session is too long, not sending replay");
			let n = this._popEventContext(), r = this.session.segmentId++;
			this._maybeSaveSession(), await x_({
				replayId: e,
				recordingData: await this.eventBuffer.finish(),
				segmentId: r,
				eventContext: n,
				session: this.session,
				options: this.getOptions(),
				timestamp: t
			});
		} catch (e) {
			this._handleException(e), this.stop({ reason: "sendReplay" });
			let t = P();
			t && t.recordDroppedEvent("send_error", "replay");
		}
	}
	__init5() {
		this._flush = async ({ force: e = !1 } = {}) => {
			if (!this._isEnabled && !e) return;
			if (!this.checkAndHandleExpiredSession()) {
				Q && D.error("[Replay] Attempting to finish replay event after session expired.");
				return;
			}
			if (!this.session) return;
			let t = this.session.started, n = Date.now() - t;
			this._debouncedFlush.cancel();
			let r = n < this._options.minReplayDuration, i = n > this._options.maxReplayDuration + 5e3;
			if (r || i) {
				_h(`[Replay] Session duration (${Math.floor(n / 1e3)}s) is too ${r ? "short" : "long"}, not sending replay.`, this._options._experiments.traceInternals), r && this._debouncedFlush();
				return;
			}
			let a = this.eventBuffer;
			if (a && this.session.segmentId === 0 && !a.hasCheckout && _h("[Replay] Flushing initial segment without checkout.", this._options._experiments.traceInternals), !this._flushLock) {
				this._flushLock = this._runFlush(), await this._flushLock, this._flushLock = void 0;
				return;
			}
			try {
				await this._flushLock;
			} catch (e) {
				Q && D.error(e);
			} finally {
				this._debouncedFlush();
			}
		};
	}
	_maybeSaveSession() {
		this.session && this._options.stickySession && Nh(this.session);
	}
	__init6() {
		this._onMutationHandler = (e) => {
			let t = e.length, n = this._options.mutationLimit, r = this._options.mutationBreadcrumbLimit, i = n && t > n;
			if (t > r || i) {
				let e = Jm({
					category: "replay.mutations",
					data: {
						count: t,
						limit: i
					}
				});
				this._createCustomBreadcrumb(e);
			}
			return i ? (this.stop({
				reason: "mutationLimit",
				forceFlush: this.recordingMode === "session"
			}), !1) : !0;
		};
	}
};
function E_(e, t, n, r) {
	let i = typeof r == "string" ? r.split(",") : [], a = [
		...e,
		...i,
		...t
	];
	return n !== void 0 && (typeof n == "string" && a.push(`.${n}`), ve(() => {
		console.warn("[Replay] You are using a deprecated configuration item for privacy. Read the documentation on how to use the new privacy configuration.");
	})), a.join(",");
}
function D_({ mask: e, unmask: t, block: n, unblock: r, ignore: i, blockClass: a, blockSelector: o, maskTextClass: s, maskTextSelector: c, ignoreClass: l }) {
	let u = {
		maskTextSelector: E_(e, [".sentry-mask", "[data-sentry-mask]"], s, c),
		unmaskTextSelector: E_(t, [".sentry-unmask", "[data-sentry-unmask]"]),
		blockSelector: E_(n, [
			".sentry-block",
			"[data-sentry-block]",
			"base[href=\"/\"]"
		], a, o),
		unblockSelector: E_(r, [".sentry-unblock", "[data-sentry-unblock]"]),
		ignoreSelector: E_(i, [
			".sentry-ignore",
			"[data-sentry-ignore]",
			"input[type=\"file\"]"
		], l)
	};
	return a instanceof RegExp && (u.blockClass = a), s instanceof RegExp && (u.maskTextClass = s), u;
}
function O_({ el: e, key: t, maskAttributes: n, maskAllText: r, privacyOptions: i, value: a }) {
	return !r || i.unmaskTextSelector && e.matches(i.unmaskTextSelector) ? a : n.includes(t) || t === "value" && e.tagName === "INPUT" && ["submit", "button"].includes(e.getAttribute("type") || "") ? a.replace(/[\S]/g, "*") : a;
}
var k_ = "img,image,svg,video,object,picture,embed,map,audio,link[rel=\"icon\"],link[rel=\"apple-touch-icon\"]", A_ = [
	"content-length",
	"content-type",
	"accept"
], j_ = !1, M_ = ((e) => new N_(e)), N_ = class e {
	static __initStatic() {
		this.id = "Replay";
	}
	constructor({ flushMinDelay: t = Pd, flushMaxDelay: n = Fd, minReplayDuration: r = Wd, maxReplayDuration: i = Kd, stickySession: a = !0, useCompression: o = !0, workerUrl: s, _experiments: c = {}, sessionSampleRate: l, errorSampleRate: u, maskAllText: d = !0, maskAllInputs: f = !0, blockAllMedia: p = !0, mutationBreadcrumbLimit: m = 750, mutationLimit: h = 1e4, slowClickTimeout: g = 7e3, slowClickIgnoreSelectors: _ = [], networkDetailAllowUrls: v = [], networkDetailDenyUrls: y = [], networkCaptureBodies: b = !0, networkRequestHeaders: x = [], networkResponseHeaders: S = [], mask: C = [], maskAttributes: w = ["title", "placeholder"], unmask: ee = [], block: te = [], unblock: ne = [], ignore: re = [], maskFn: ie, beforeAddRecordingEvent: ae, beforeErrorSampling: T, blockClass: E, blockSelector: oe, maskInputOptions: se, maskTextClass: ce, maskTextSelector: le, ignoreClass: ue } = {}) {
		this.name = e.id;
		let de = D_({
			mask: C,
			unmask: ee,
			block: te,
			unblock: ne,
			ignore: re,
			blockClass: E,
			blockSelector: oe,
			maskTextClass: ce,
			maskTextSelector: le,
			ignoreClass: ue
		});
		if (this._recordingOptions = {
			maskAllInputs: f,
			maskAllText: d,
			maskInputOptions: {
				...se || {},
				password: !0
			},
			maskTextFn: ie,
			maskInputFn: ie,
			maskAttributeFn: (e, t, n) => O_({
				maskAttributes: w,
				maskAllText: d,
				privacyOptions: de,
				key: e,
				value: t,
				el: n
			}),
			...de,
			slimDOMOptions: "all",
			inlineStylesheet: !0,
			inlineImages: !1,
			collectFonts: !0,
			errorHandler: (e) => {
				try {
					e.__rrweb__ = !0;
				} catch {}
			}
		}, this._initialOptions = {
			flushMinDelay: t,
			flushMaxDelay: n,
			minReplayDuration: Math.min(r, Gd),
			maxReplayDuration: Math.min(i, Kd),
			stickySession: a,
			sessionSampleRate: l,
			errorSampleRate: u,
			useCompression: o,
			workerUrl: s,
			blockAllMedia: p,
			maskAllInputs: f,
			maskAllText: d,
			mutationBreadcrumbLimit: m,
			mutationLimit: h,
			slowClickTimeout: g,
			slowClickIgnoreSelectors: _,
			networkDetailAllowUrls: v,
			networkDetailDenyUrls: y,
			networkCaptureBodies: b,
			networkRequestHeaders: F_(x),
			networkResponseHeaders: F_(S),
			beforeAddRecordingEvent: ae,
			beforeErrorSampling: T,
			_experiments: c
		}, typeof l == "number" && (console.warn(`[Replay] You are passing \`sessionSampleRate\` to the Replay integration.
This option is deprecated and will be removed soon.
Instead, configure \`replaysSessionSampleRate\` directly in the SDK init options, e.g.:
Sentry.init({ replaysSessionSampleRate: ${l} })`), this._initialOptions.sessionSampleRate = l), typeof u == "number" && (console.warn(`[Replay] You are passing \`errorSampleRate\` to the Replay integration.
This option is deprecated and will be removed soon.
Instead, configure \`replaysOnErrorSampleRate\` directly in the SDK init options, e.g.:
Sentry.init({ replaysOnErrorSampleRate: ${u} })`), this._initialOptions.errorSampleRate = u), this._initialOptions.blockAllMedia && (this._recordingOptions.blockSelector = this._recordingOptions.blockSelector ? `${this._recordingOptions.blockSelector},${k_}` : k_), this._isInitialized && qt()) throw Error("Multiple Sentry Session Replay instances are not supported");
		this._isInitialized = !0;
	}
	get _isInitialized() {
		return j_;
	}
	set _isInitialized(e) {
		j_ = e;
	}
	setupOnce() {
		qt() && (this._setup(), setTimeout(() => this._initialize()));
	}
	start() {
		this._replay && this._replay.start();
	}
	startBuffering() {
		this._replay && this._replay.startBuffering();
	}
	stop() {
		return this._replay ? this._replay.stop({ forceFlush: this._replay.recordingMode === "session" }) : Promise.resolve();
	}
	flush(e) {
		return !this._replay || !this._replay.isEnabled() ? Promise.resolve() : this._replay.sendBufferedReplayOrFlush(e);
	}
	getReplayId() {
		if (!(!this._replay || !this._replay.isEnabled())) return this._replay.getSessionId();
	}
	_initialize() {
		this._replay && (this._maybeLoadFromReplayCanvasIntegration(), this._replay.initializeSampling());
	}
	_setup() {
		let e = P_(this._initialOptions);
		this._replay = new T_({
			options: e,
			recordingOptions: this._recordingOptions
		});
	}
	_maybeLoadFromReplayCanvasIntegration() {
		try {
			let e = P().getIntegrationByName("ReplayCanvas");
			if (!e) return;
			this._replay._canvas = e.getOptions();
		} catch {}
	}
};
N_.__initStatic();
function P_(e) {
	let t = P(), n = t && t.getOptions(), r = {
		sessionSampleRate: 0,
		errorSampleRate: 0,
		...k(e)
	};
	return n ? (e.sessionSampleRate == null && e.errorSampleRate == null && n.replaysSessionSampleRate == null && n.replaysOnErrorSampleRate == null && ve(() => {
		console.warn("Replay is disabled because neither `replaysSessionSampleRate` nor `replaysOnErrorSampleRate` are set.");
	}), typeof n.replaysSessionSampleRate == "number" && (r.sessionSampleRate = n.replaysSessionSampleRate), typeof n.replaysOnErrorSampleRate == "number" && (r.errorSampleRate = n.replaysOnErrorSampleRate), r) : (ve(() => {
		console.warn("SDK client is not available.");
	}), r);
}
function F_(e) {
	return [...A_, ...e.map((e) => e.toLowerCase())];
}
function I_() {
	let e = P();
	return e && e.getIntegrationByName && e.getIntegrationByName("Replay");
}
//#endregion
//#region node_modules/@sentry-internal/replay-canvas/esm/index.js
var L_;
(function(e) {
	e[e.Document = 0] = "Document", e[e.DocumentType = 1] = "DocumentType", e[e.Element = 2] = "Element", e[e.Text = 3] = "Text", e[e.CDATA = 4] = "CDATA", e[e.Comment = 5] = "Comment";
})(L_ ||= {});
function R_(e, t) {
	for (let n = e.classList.length; n--;) {
		let r = e.classList[n];
		if (t.test(r)) return !0;
	}
	return !1;
}
function z_(e, t, n = Infinity, r = 0) {
	return !e || e.nodeType !== e.ELEMENT_NODE || r > n ? -1 : t(e) ? r : z_(e.parentNode, t, n, r + 1);
}
function B_(e, t) {
	return (n) => {
		let r = n;
		if (r === null) return !1;
		try {
			if (e) {
				if (typeof e == "string") {
					if (r.matches(`.${e}`)) return !0;
				} else if (R_(r, e)) return !0;
			}
			return !!(t && r.matches(t));
		} catch {
			return !1;
		}
	};
}
var V_ = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.", H_ = {
	map: {},
	getId() {
		return console.error(V_), -1;
	},
	getNode() {
		return console.error(V_), null;
	},
	removeNodeFromMap() {
		console.error(V_);
	},
	has() {
		return console.error(V_), !1;
	},
	reset() {
		console.error(V_);
	}
};
typeof window < "u" && window.Proxy && window.Reflect && (H_ = new Proxy(H_, { get(e, t, n) {
	return t === "map" && console.error(V_), Reflect.get(e, t, n);
} }));
function U_(e, t, n, r, i = window) {
	let a = i.Object.getOwnPropertyDescriptor(e, t);
	return i.Object.defineProperty(e, t, r ? n : { set(e) {
		X_(() => {
			n.set.call(this, e);
		}, 0), a && a.set && a.set.call(this, e);
	} }), () => U_(e, t, a || {}, !0);
}
function W_(e, t, n) {
	try {
		if (!(t in e)) return () => {};
		let r = e[t], i = n(r);
		return typeof i == "function" && (i.prototype = i.prototype || {}, Object.defineProperties(i, { __rrweb_original__: {
			enumerable: !1,
			value: r
		} })), e[t] = i, () => {
			e[t] = r;
		};
	} catch {
		return () => {};
	}
}
/[1-9][0-9]{12}/.test(Date.now().toString());
function G_(e) {
	return e ? e.nodeType === e.ELEMENT_NODE ? e : e.parentElement : null;
}
function K_(e, t, n, r, i) {
	if (!e) return !1;
	let a = G_(e);
	if (!a) return !1;
	let o = B_(t, n);
	if (!i) {
		let e = r && a.matches(r);
		return o(a) && !e;
	}
	let s = z_(a, o), c = -1;
	return s < 0 ? !1 : (r && (c = z_(a, B_(null, r))), s > -1 && c < 0 || s < c);
}
var q_ = {};
function J_(e) {
	let t = q_[e];
	if (t) return t;
	let n = window.document, r = window[e];
	if (n && typeof n.createElement == "function") try {
		let t = n.createElement("iframe");
		t.hidden = !0, n.head.appendChild(t);
		let i = t.contentWindow;
		i && i[e] && (r = i[e]), n.head.removeChild(t);
	} catch {}
	return q_[e] = r.bind(window);
}
function Y_(...e) {
	return J_("requestAnimationFrame")(...e);
}
function X_(...e) {
	return J_("setTimeout")(...e);
}
var Z_ = /* @__PURE__ */ ((e) => (e[e["2D"] = 0] = "2D", e[e.WebGL = 1] = "WebGL", e[e.WebGL2 = 2] = "WebGL2", e))(Z_ || {}), Q_;
function $_(e) {
	Q_ = e;
}
for (var ev = (e) => Q_ ? ((...t) => {
	try {
		return e(...t);
	} catch (e) {
		if (Q_ && Q_(e) === !0) return () => {};
		throw e;
	}
}) : e, tv = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", nv = typeof Uint8Array > "u" ? [] : /* @__PURE__ */ new Uint8Array(256), rv = 0; rv < tv.length; rv++) nv[tv.charCodeAt(rv)] = rv;
var iv = function(e) {
	var t = new Uint8Array(e), n, r = t.length, i = "";
	for (n = 0; n < r; n += 3) i += tv[t[n] >> 2], i += tv[(t[n] & 3) << 4 | t[n + 1] >> 4], i += tv[(t[n + 1] & 15) << 2 | t[n + 2] >> 6], i += tv[t[n + 2] & 63];
	return r % 3 == 2 ? i = i.substring(0, i.length - 1) + "=" : r % 3 == 1 && (i = i.substring(0, i.length - 2) + "=="), i;
}, av = /* @__PURE__ */ new Map();
function ov(e, t) {
	let n = av.get(e);
	return n || (n = /* @__PURE__ */ new Map(), av.set(e, n)), n.has(t) || n.set(t, []), n.get(t);
}
var sv = (e, t, n) => {
	if (!e || !(uv(e, t) || typeof e == "object")) return;
	let r = e.constructor.name, i = ov(n, r), a = i.indexOf(e);
	return a === -1 && (a = i.length, i.push(e)), a;
};
function cv(e, t, n) {
	if (e instanceof Array) return e.map((e) => cv(e, t, n));
	if (e === null) return e;
	if (e instanceof Float32Array || e instanceof Float64Array || e instanceof Int32Array || e instanceof Uint32Array || e instanceof Uint8Array || e instanceof Uint16Array || e instanceof Int16Array || e instanceof Int8Array || e instanceof Uint8ClampedArray) return {
		rr_type: e.constructor.name,
		args: [Object.values(e)]
	};
	if (e instanceof ArrayBuffer) return {
		rr_type: e.constructor.name,
		base64: iv(e)
	};
	if (e instanceof DataView) return {
		rr_type: e.constructor.name,
		args: [
			cv(e.buffer, t, n),
			e.byteOffset,
			e.byteLength
		]
	};
	if (e instanceof HTMLImageElement) {
		let t = e.constructor.name, { src: n } = e;
		return {
			rr_type: t,
			src: n
		};
	} else if (e instanceof HTMLCanvasElement) return {
		rr_type: "HTMLImageElement",
		src: e.toDataURL()
	};
	else if (e instanceof ImageData) return {
		rr_type: e.constructor.name,
		args: [
			cv(e.data, t, n),
			e.width,
			e.height
		]
	};
	else if (uv(e, t) || typeof e == "object") return {
		rr_type: e.constructor.name,
		index: sv(e, t, n)
	};
	return e;
}
var lv = (e, t, n) => e.map((e) => cv(e, t, n)), uv = (e, t) => !![
	"WebGLActiveInfo",
	"WebGLBuffer",
	"WebGLFramebuffer",
	"WebGLProgram",
	"WebGLRenderbuffer",
	"WebGLShader",
	"WebGLShaderPrecisionFormat",
	"WebGLTexture",
	"WebGLUniformLocation",
	"WebGLVertexArrayObject",
	"WebGLVertexArrayObjectOES"
].filter((e) => typeof t[e] == "function").find((n) => e instanceof t[n]);
function dv(e, t, n, r, i) {
	let a = [], o = Object.getOwnPropertyNames(t.CanvasRenderingContext2D.prototype);
	for (let s of o) try {
		if (typeof t.CanvasRenderingContext2D.prototype[s] != "function") continue;
		let o = W_(t.CanvasRenderingContext2D.prototype, s, function(a) {
			return function(...o) {
				return K_(this.canvas, n, r, i, !0) || X_(() => {
					let n = lv(o, t, this);
					e(this.canvas, {
						type: Z_["2D"],
						property: s,
						args: n
					});
				}, 0), a.apply(this, o);
			};
		});
		a.push(o);
	} catch {
		let n = U_(t.CanvasRenderingContext2D.prototype, s, { set(t) {
			e(this.canvas, {
				type: Z_["2D"],
				property: s,
				args: [t],
				setter: !0
			});
		} });
		a.push(n);
	}
	return () => {
		a.forEach((e) => e());
	};
}
function fv(e) {
	return e === "experimental-webgl" ? "webgl" : e;
}
function pv(e, t, n, r, i) {
	let a = [];
	try {
		let o = W_(e.HTMLCanvasElement.prototype, "getContext", function(e) {
			return function(a, ...o) {
				if (!K_(this, t, n, r, !0)) {
					let e = fv(a);
					if ("__context" in this || (this.__context = e), i && ["webgl", "webgl2"].includes(e)) if (o[0] && typeof o[0] == "object") {
						let e = o[0];
						e.preserveDrawingBuffer ||= !0;
					} else o.splice(0, 1, { preserveDrawingBuffer: !0 });
				}
				return e.apply(this, [a, ...o]);
			};
		});
		a.push(o);
	} catch {
		console.error("failed to patch HTMLCanvasElement.prototype.getContext");
	}
	return () => {
		a.forEach((e) => e());
	};
}
function mv(e, t, n, r, i, a, o, s) {
	let c = [], l = Object.getOwnPropertyNames(e);
	for (let o of l) if (![
		"isContextLost",
		"canvas",
		"drawingBufferWidth",
		"drawingBufferHeight"
	].includes(o)) try {
		if (typeof e[o] != "function") continue;
		let l = W_(e, o, function(e) {
			return function(...c) {
				let l = e.apply(this, c);
				if (sv(l, s, this), "tagName" in this.canvas && !K_(this.canvas, r, i, a, !0)) {
					let e = lv(c, s, this), r = {
						type: t,
						property: o,
						args: e
					};
					n(this.canvas, r);
				}
				return l;
			};
		});
		c.push(l);
	} catch {
		let r = U_(e, o, { set(e) {
			n(this.canvas, {
				type: t,
				property: o,
				args: [e],
				setter: !0
			});
		} });
		c.push(r);
	}
	return c;
}
function hv(e, t, n, r, i, a) {
	let o = [];
	return o.push(...mv(t.WebGLRenderingContext.prototype, Z_.WebGL, e, n, r, i, a, t)), t.WebGL2RenderingContext !== void 0 && o.push(...mv(t.WebGL2RenderingContext.prototype, Z_.WebGL2, e, n, r, i, a, t)), () => {
		o.forEach((e) => e());
	};
}
var gv = "for(var e=\"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\",t=\"undefined\"==typeof Uint8Array?[]:new Uint8Array(256),a=0;a<64;a++)t[e.charCodeAt(a)]=a;var n=function(t){var a,n=new Uint8Array(t),r=n.length,s=\"\";for(a=0;a<r;a+=3)s+=e[n[a]>>2],s+=e[(3&n[a])<<4|n[a+1]>>4],s+=e[(15&n[a+1])<<2|n[a+2]>>6],s+=e[63&n[a+2]];return r%3==2?s=s.substring(0,s.length-1)+\"=\":r%3==1&&(s=s.substring(0,s.length-2)+\"==\"),s};const r=new Map,s=new Map;const i=self;i.onmessage=async function(e){if(!(\"OffscreenCanvas\"in globalThis))return i.postMessage({id:e.data.id});{const{id:t,bitmap:a,width:o,height:f,maxCanvasSize:c,dataURLOptions:g}=e.data,u=async function(e,t,a){const r=e+\"-\"+t;if(\"OffscreenCanvas\"in globalThis){if(s.has(r))return s.get(r);const i=new OffscreenCanvas(e,t);i.getContext(\"2d\");const o=await i.convertToBlob(a),f=await o.arrayBuffer(),c=n(f);return s.set(r,c),c}return\"\"}(o,f,g),[h,d]=function(e,t,a){if(!a)return[e,t];const[n,r]=a;if(e<=n&&t<=r)return[e,t];let s=e,i=t;return s>n&&(i=Math.floor(n*t/e),s=n),i>r&&(s=Math.floor(r*e/t),i=r),[s,i]}(o,f,c),l=new OffscreenCanvas(h,d),w=l.getContext(\"bitmaprenderer\"),p=h===o&&d===f?a:await createImageBitmap(a,{resizeWidth:h,resizeHeight:d,resizeQuality:\"low\"});w.transferFromImageBitmap(p),a.close();const y=await l.convertToBlob(g),v=y.type,b=await y.arrayBuffer(),m=n(b);if(p.close(),!r.has(t)&&await u===m)return r.set(t,m),i.postMessage({id:t});if(r.get(t)===m)return i.postMessage({id:t});i.postMessage({id:t,type:v,base64:m,width:o,height:f}),r.set(t,m)}};";
function _v() {
	let e = new Blob([gv]);
	return URL.createObjectURL(e);
}
var vv = class {
	reset() {
		this.pendingCanvasMutations.clear(), this.resetObservers && this.resetObservers();
	}
	freeze() {
		this.frozen = !0;
	}
	unfreeze() {
		this.frozen = !1;
	}
	lock() {
		this.locked = !0;
	}
	unlock() {
		this.locked = !1;
	}
	constructor(e) {
		this.pendingCanvasMutations = /* @__PURE__ */ new Map(), this.rafStamps = {
			latestId: 0,
			invokeId: null
		}, this.frozen = !1, this.locked = !1, this.processMutation = (e, t) => {
			(this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId || !this.rafStamps.invokeId) && (this.rafStamps.invokeId = this.rafStamps.latestId), this.pendingCanvasMutations.has(e) || this.pendingCanvasMutations.set(e, []), this.pendingCanvasMutations.get(e).push(t);
		};
		let { sampling: t = "all", win: n, blockClass: r, blockSelector: i, unblockSelector: a, maxCanvasSize: o, recordCanvas: s, dataURLOptions: c, errorHandler: l } = e;
		this.mutationCb = e.mutationCb, this.mirror = e.mirror, this.options = e, l && $_(l), !e.enableManualSnapshot && ev(() => {
			s && t === "all" && this.initCanvasMutationObserver(n, r, i, a), s && typeof t == "number" && this.initCanvasFPSObserver(t, n, r, i, a, o, { dataURLOptions: c });
		})();
	}
	initCanvasFPSObserver(e, t, n, r, i, a, o) {
		let s = pv(t, n, r, i, !0), c = this.takeSnapshot(!1, e, t, n, r, i, a, o.dataURLOptions);
		this.resetObservers = () => {
			s(), cancelAnimationFrame(c);
		};
	}
	initCanvasMutationObserver(e, t, n, r) {
		this.startRAFTimestamping(), this.startPendingCanvasMutationFlusher();
		let i = pv(e, t, n, r, !1), a = dv(this.processMutation.bind(this), e, t, n, r), o = hv(this.processMutation.bind(this), e, t, n, r, this.mirror);
		this.resetObservers = () => {
			i(), a(), o();
		};
	}
	snapshot(e) {
		let { options: t } = this, n = this.takeSnapshot(!0, t.sampling === "all" ? 2 : t.sampling || 2, t.win, t.blockClass, t.blockSelector, t.unblockSelector, t.maxCanvasSize, t.dataURLOptions, e);
		this.resetObservers = () => {
			cancelAnimationFrame(n);
		};
	}
	takeSnapshot(e, t, n, r, i, a, o, s, c) {
		let l = /* @__PURE__ */ new Map(), u = new Worker(_v());
		u.onmessage = (e) => {
			let t = e.data, { id: n } = t;
			if (l.set(n, !1), !("base64" in t)) return;
			let { base64: r, type: i, width: a, height: o } = t;
			this.mutationCb({
				id: n,
				type: Z_["2D"],
				commands: [{
					property: "clearRect",
					args: [
						0,
						0,
						a,
						o
					]
				}, {
					property: "drawImage",
					args: [
						{
							rr_type: "ImageBitmap",
							args: [{
								rr_type: "Blob",
								data: [{
									rr_type: "ArrayBuffer",
									base64: r
								}],
								type: i
							}]
						},
						0,
						0,
						a,
						o
					]
				}]
			});
		};
		let d = 1e3 / t, f = 0, p, m = (e) => {
			if (e) return [e];
			let t = [];
			return n.document.querySelectorAll("canvas").forEach((e) => {
				K_(e, r, i, a, !0) || t.push(e);
			}), t;
		}, h = (t) => {
			if (f && t - f < d) {
				p = Y_(h);
				return;
			}
			f = t, m(c).forEach((t) => {
				let n = this.mirror.getId(t);
				if (!l.get(n) && !(!t.width || !t.height)) {
					if (l.set(n, !0), !e && ["webgl", "webgl2"].includes(t.__context)) {
						let e = t.getContext(t.__context);
						ir([
							e,
							"optionalAccess",
							(e) => e.getContextAttributes,
							"call",
							(e) => e(),
							"optionalAccess",
							(e) => e.preserveDrawingBuffer
						]) === !1 && e.clear(e.COLOR_BUFFER_BIT);
					}
					createImageBitmap(t).then((e) => {
						u.postMessage({
							id: n,
							bitmap: e,
							width: t.width,
							height: t.height,
							dataURLOptions: s,
							maxCanvasSize: o
						}, [e]);
					}).catch((e) => {
						ev(() => {
							throw e;
						})();
					});
				}
			}), p = Y_(h);
		};
		return p = Y_(h), p;
	}
	startPendingCanvasMutationFlusher() {
		Y_(() => this.flushPendingCanvasMutations());
	}
	startRAFTimestamping() {
		let e = (t) => {
			this.rafStamps.latestId = t, Y_(e);
		};
		Y_(e);
	}
	flushPendingCanvasMutations() {
		this.pendingCanvasMutations.forEach((e, t) => {
			let n = this.mirror.getId(t);
			this.flushPendingCanvasMutationFor(t, n);
		}), Y_(() => this.flushPendingCanvasMutations());
	}
	flushPendingCanvasMutationFor(e, t) {
		if (this.frozen || this.locked) return;
		let n = this.pendingCanvasMutations.get(e);
		if (!n || t === -1) return;
		let r = n.map((e) => {
			let { type: t, ...n } = e;
			return n;
		}), { type: i } = n[0];
		this.mutationCb({
			id: t,
			type: i,
			commands: r
		}), this.pendingCanvasMutations.delete(e);
	}
}, yv = {
	low: {
		sampling: { canvas: 1 },
		dataURLOptions: {
			type: "image/webp",
			quality: .25
		}
	},
	medium: {
		sampling: { canvas: 2 },
		dataURLOptions: {
			type: "image/webp",
			quality: .4
		}
	},
	high: {
		sampling: { canvas: 4 },
		dataURLOptions: {
			type: "image/webp",
			quality: .5
		}
	}
}, bv = "ReplayCanvas", xv = 1280, Sv = R(((e = {}) => {
	let [t, n] = e.maxCanvasSize || [], r = {
		quality: e.quality || "medium",
		enableManualSnapshot: e.enableManualSnapshot,
		maxCanvasSize: [t ? Math.min(t, xv) : xv, n ? Math.min(n, xv) : xv]
	}, i, a = new Promise((e) => i = e);
	return {
		name: bv,
		setupOnce() {},
		getOptions() {
			let { quality: e, enableManualSnapshot: t, maxCanvasSize: n } = r;
			return {
				enableManualSnapshot: t,
				recordCanvas: !0,
				getCanvasManager: (e) => {
					let r = new vv({
						...e,
						enableManualSnapshot: t,
						maxCanvasSize: n,
						errorHandler: (e) => {
							try {
								typeof e == "object" && (e.__rrweb__ = !0);
							} catch {}
						}
					});
					return i(r), r;
				},
				...yv[e || "medium"] || yv.medium
			};
		},
		async snapshot(e) {
			(await a).snapshot(e);
		}
	};
})), Cv = L(bv, Sv), wv = T, Tv = "#ffffff", Ev = "inherit", Dv = "rgba(108, 95, 199, 1)", Ov = {
	fontFamily: "system-ui, 'Helvetica Neue', Arial, sans-serif",
	fontSize: "14px",
	background: Tv,
	backgroundHover: "#f6f6f7",
	foreground: "#2b2233",
	border: "1.5px solid rgba(41, 35, 47, 0.13)",
	borderRadius: "25px",
	boxShadow: "0px 4px 24px 0px rgba(43, 34, 51, 0.12)",
	success: "#268d75",
	error: "#df3338",
	submitBackground: "rgba(88, 74, 192, 1)",
	submitBackgroundHover: Dv,
	submitBorder: Dv,
	submitOutlineFocus: "#29232f",
	submitForeground: Tv,
	submitForegroundHover: Tv,
	cancelBackground: "transparent",
	cancelBackgroundHover: "var(--background-hover)",
	cancelBorder: "var(--border)",
	cancelOutlineFocus: "var(--input-outline-focus)",
	cancelForeground: "var(--foreground)",
	cancelForegroundHover: "var(--foreground)",
	inputBackground: Ev,
	inputForeground: Ev,
	inputBorder: "var(--border)",
	inputOutlineFocus: Dv,
	formBorderRadius: "20px",
	formContentBorderRadius: "6px"
}, kv = {
	light: Ov,
	dark: {
		...Ov,
		background: "#29232f",
		backgroundHover: "#352f3b",
		foreground: "#ebe6ef",
		border: "1.5px solid rgba(235, 230, 239, 0.15)",
		success: "#2da98c",
		error: "#f55459"
	}
}, Av = "Report a Bug", jv = "Cancel", Mv = "Send Bug Report", Nv = "Report a Bug", Pv = "your.email@example.org", Fv = "Email", Iv = "What's the bug? What did you expect?", Lv = "Description", Rv = "Your Name", zv = "Name", Bv = "(required)", Vv = "Thank you for your report!", Hv = "widget", Uv = "api";
async function Wv({ client: e, scope: t, event: n }) {
	let r = {};
	e.emit && e.emit("preprocessEvent", n, r);
	let i = await yr(e.getOptions(), n, r, t, e, Si());
	return i === null ? (e.recordDroppedEvent("event_processor", "feedback", n), null) : (i.platform = i.platform || "javascript", i);
}
async function Gv({ feedback: { message: e, email: t, name: n, source: r, url: i } }, { includeReplay: a = !0 } = {}) {
	let o = P(), s = o && o.getTransport(), c = o && o.getDsn();
	if (!o || !s || !c) return;
	let l = {
		contexts: { feedback: {
			contact_email: t,
			name: n,
			message: e,
			url: i,
			source: r
		} },
		type: "feedback"
	};
	return Hr(async (e) => {
		e.clearBreadcrumbs(), [Uv, Hv].includes(String(r)) && e.setLevel("info");
		let t = await Wv({
			scope: e,
			client: o,
			event: l
		});
		if (!t) return;
		o.emit && o.emit("beforeSendFeedback", t, { includeReplay: !!a });
		let n = wa(t, c, o.getOptions()._metadata, o.getOptions().tunnel), i;
		try {
			i = await s.send(n);
		} catch (e) {
			let t = /* @__PURE__ */ Error("Unable to send Feedback");
			try {
				t.cause = e;
			} catch {}
			throw t;
		}
		if (i) {
			if (typeof i.statusCode == "number" && (i.statusCode < 200 || i.statusCode >= 300)) throw Error("Unable to send Feedback");
			return i;
		}
	});
}
function Kv({ name: e, email: t, message: n, source: r = Uv, url: i = de() }, a = {}) {
	if (!n) throw Error("Unable to submit feedback with empty message");
	return Gv({ feedback: {
		name: e,
		email: t,
		message: n,
		url: i,
		source: r
	} }, a);
}
var qv = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
function Jv(e, t) {
	return {
		...e,
		...t,
		themeDark: {
			...e.themeDark,
			...t.themeDark
		},
		themeLight: {
			...e.themeLight,
			...t.themeLight
		}
	};
}
function Yv(e) {
	let t = e.createElement("style");
	return t.textContent = "\n.widget__actor {\n  position: fixed;\n  left: var(--left);\n  right: var(--right);\n  bottom: var(--bottom);\n  top: var(--top);\n  z-index: var(--z-index);\n\n  line-height: 16px;\n\n  display: flex;\n  align-items: center;\n  gap: 8px;\n\n  border-radius: var(--border-radius);\n  cursor: pointer;\n  font-family: inherit;\n  font-size: var(--font-size);\n  font-weight: 600;\n  padding: 16px;\n  text-decoration: none;\n  z-index: 9000;\n\n  color: var(--foreground);\n  background-color: var(--background);\n  border: var(--border);\n  box-shadow: var(--box-shadow);\n  opacity: 1;\n  transition: opacity 0.1s ease-in-out;\n}\n\n.widget__actor:hover {\n  background-color: var(--background-hover);\n}\n\n.widget__actor svg {\n  width: 16px;\n  height: 16px;\n}\n\n.widget__actor--hidden {\n  opacity: 0;\n  pointer-events: none;\n  visibility: hidden;\n}\n\n.widget__actor__text {\n}\n\n@media (max-width: 600px) {\n  .widget__actor__text {\n    display: none;\n  }\n}\n\n.feedback-icon path {\n  fill: var(--foreground);\n}\n", t;
}
function Xv(e) {
	let t = e.createElement("style");
	return t.textContent = "\n.dialog {\n  line-height: 25px;\n  background-color: rgba(0, 0, 0, 0.05);\n  border: none;\n  position: fixed;\n  inset: 0;\n  z-index: 10000;\n  width: 100vw;\n  height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 1;\n  transition: opacity 0.2s ease-in-out;\n}\n\n.dialog:not([open]) {\n  opacity: 0;\n  pointer-events: none;\n  visibility: hidden;\n}\n.dialog:not([open]) .dialog__content {\n  transform: translate(0, -16px) scale(0.98);\n}\n\n.dialog__content {\n  position: fixed;\n  left: var(--left);\n  right: var(--right);\n  bottom: var(--bottom);\n  top: var(--top);\n\n  border: var(--border);\n  border-radius: var(--form-border-radius);\n  background-color: var(--background);\n  color: var(--foreground);\n\n  width: 320px;\n  max-width: 100%;\n  max-height: calc(100% - 2rem);\n  display: flex;\n  flex-direction: column;\n  box-shadow: var(--box-shadow);\n  transition: transform 0.2s ease-in-out;\n  transform: translate(0, 0) scale(1);\n}\n\n.dialog__header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 20px;\n  font-weight: 600;\n  padding: 24px 24px 0 24px;\n  margin: 0;\n  margin-bottom: 16px;\n}\n\n.brand-link {\n  display: inline-flex;\n}\n\n.error {\n  color: var(--error);\n  margin-bottom: 16px;\n}\n\n.form {\n  display: grid;\n  overflow: auto;\n  flex-direction: column;\n  gap: 16px;\n  padding: 0 24px 24px;\n}\n\n.form__error-container {\n  color: var(--error);\n}\n\n.form__error-container--hidden {\n  display: none;\n}\n\n.form__label {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  margin: 0px;\n}\n\n.form__label__text {\n  display: grid;\n  gap: 4px;\n  align-items: center;\n  grid-auto-flow: column;\n  grid-auto-columns: max-content;\n}\n\n.form__label__text--required {\n  font-size: 0.85em;\n}\n\n.form__input {\n  line-height: inherit;\n  background-color: var(--input-background);\n  box-sizing: border-box;\n  border: var(--input-border);\n  border-radius: var(--form-content-border-radius);\n  color: var(--input-foreground);\n  font-family: inherit;\n  font-size: var(--font-size);\n  font-weight: 500;\n  padding: 6px 12px;\n}\n\n.form__input::placeholder {\n  color: var(--input-foreground);\n  opacity: 0.65;\n}\n\n.form__input:focus-visible {\n  outline: 1px auto var(--input-outline-focus);\n}\n\n.form__input--textarea {\n  font-family: inherit;\n  resize: vertical;\n}\n\n.btn-group {\n  display: grid;\n  gap: 8px;\n  margin-top: 8px;\n}\n\n.btn {\n  line-height: inherit;\n  border: var(--cancel-border);\n  border-radius: var(--form-content-border-radius);\n  cursor: pointer;\n  font-family: inherit;\n  font-size: var(--font-size);\n  font-weight: 600;\n  padding: 6px 16px;\n}\n.btn[disabled] {\n  opacity: 0.6;\n  pointer-events: none;\n}\n\n.btn--primary {\n  background-color: var(--submit-background);\n  border-color: var(--submit-border);\n  color: var(--submit-foreground);\n}\n.btn--primary:hover {\n  background-color: var(--submit-background-hover);\n  color: var(--submit-foreground-hover);\n}\n.btn--primary:focus-visible {\n  outline: 1px auto var(--submit-outline-focus);\n}\n\n.btn--default {\n  background-color: var(--cancel-background);\n  color: var(--cancel-foreground);\n  font-weight: 500;\n}\n.btn--default:hover {\n  background-color: var(--cancel-background-hover);\n  color: var(--cancel-foreground-hover);\n}\n.btn--default:focus-visible {\n  outline: 1px auto var(--cancel-outline-focus);\n}\n\n.success-message {\n  background-color: var(--background);\n  border: var(--border);\n  border-radius: var(--border-radius);\n  box-shadow: var(--box-shadow);\n  font-weight: 600;\n  color: var(--success);\n  padding: 12px 24px;\n  line-height: 25px;\n  display: grid;\n  align-items: center;\n  grid-auto-flow: column;\n  gap: 6px;\n  cursor: default;\n}\n\n.success-icon path {\n  fill: var(--success);\n}\n", t;
}
function Zv(e) {
	return `
  --background: ${e.background};
  --background-hover: ${e.backgroundHover};
  --foreground: ${e.foreground};
  --error: ${e.error};
  --success: ${e.success};
  --border: ${e.border};
  --border-radius: ${e.borderRadius};
  --box-shadow: ${e.boxShadow};

  --submit-background: ${e.submitBackground};
  --submit-background-hover: ${e.submitBackgroundHover};
  --submit-border: ${e.submitBorder};
  --submit-outline-focus: ${e.submitOutlineFocus};
  --submit-foreground: ${e.submitForeground};
  --submit-foreground-hover: ${e.submitForegroundHover};

  --cancel-background: ${e.cancelBackground};
  --cancel-background-hover: ${e.cancelBackgroundHover};
  --cancel-border: ${e.cancelBorder};
  --cancel-outline-focus: ${e.cancelOutlineFocus};
  --cancel-foreground: ${e.cancelForeground};
  --cancel-foreground-hover: ${e.cancelForegroundHover};

  --input-background: ${e.inputBackground};
  --input-foreground: ${e.inputForeground};
  --input-border: ${e.inputBorder};
  --input-outline-focus: ${e.inputOutlineFocus};

  --form-border-radius: ${e.formBorderRadius};
  --form-content-border-radius: ${e.formContentBorderRadius};
  `;
}
function Qv(e, t, n) {
	let r = e.createElement("style");
	return r.textContent = `
:host {
  --bottom: 1rem;
  --right: 1rem;
  --top: auto;
  --left: auto;
  --z-index: 100000;
  --font-family: ${n.light.fontFamily};
  --font-size: ${n.light.fontSize};

  position: fixed;
  left: var(--left);
  right: var(--right);
  bottom: var(--bottom);
  top: var(--top);
  z-index: var(--z-index);

  font-family: var(--font-family);
  font-size: var(--font-size);

  ${Zv(t === "dark" ? n.dark : n.light)}
}

${t === "system" ? `
@media (prefers-color-scheme: dark) {
  :host {
    ${Zv(n.dark)}
  }
}` : ""}
}`, r;
}
function $v({ id: e, colorScheme: t, themeDark: n, themeLight: r }) {
	try {
		let i = wv.document, a = i.createElement("div");
		a.id = e;
		let o = a.attachShadow({ mode: "open" });
		return o.appendChild(Qv(i, t, {
			dark: n,
			light: r
		})), o.appendChild(Xv(i)), {
			shadow: o,
			host: a
		};
	} catch {
		throw D.warn("[Feedback] Browser does not support shadow DOM API"), Error("Browser does not support shadow DOM API.");
	}
}
async function ey(e, t, n) {
	if (!e) return;
	let r = () => {
		e && e.showError("There was a problem submitting feedback, please wait and try again.");
	};
	e.hideError();
	try {
		return await Kv({
			...t,
			source: Hv
		}, n);
	} catch (e) {
		qv && D.error(e), r();
	}
}
function ty(e, t) {
	return Object.entries(t).forEach(([t, n]) => {
		e.setAttributeNS(null, t, n);
	}), e;
}
var ny = 20, ry = "http://www.w3.org/2000/svg";
function iy() {
	let e = (e) => wv.document.createElementNS(ry, e), t = ty(e("svg"), {
		class: "feedback-icon",
		width: `${ny}`,
		height: `${ny}`,
		viewBox: `0 0 ${ny} ${ny}`,
		fill: "none"
	}), n = ty(e("g"), { clipPath: "url(#clip0_57_80)" }), r = ty(e("path"), {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M15.6622 15H12.3997C12.2129 14.9959 12.031 14.9396 11.8747 14.8375L8.04965 12.2H7.49956V19.1C7.4875 19.3348 7.3888 19.5568 7.22256 19.723C7.05632 19.8892 6.83435 19.9879 6.59956 20H2.04956C1.80193 19.9968 1.56535 19.8969 1.39023 19.7218C1.21511 19.5467 1.1153 19.3101 1.11206 19.0625V12.2H0.949652C0.824431 12.2017 0.700142 12.1783 0.584123 12.1311C0.468104 12.084 0.362708 12.014 0.274155 11.9255C0.185602 11.8369 0.115689 11.7315 0.0685419 11.6155C0.0213952 11.4995 -0.00202913 11.3752 -0.00034808 11.25V3.75C-0.00900498 3.62067 0.0092504 3.49095 0.0532651 3.36904C0.0972798 3.24712 0.166097 3.13566 0.255372 3.04168C0.344646 2.94771 0.452437 2.87327 0.571937 2.82307C0.691437 2.77286 0.82005 2.74798 0.949652 2.75H8.04965L11.8747 0.1625C12.031 0.0603649 12.2129 0.00407221 12.3997 0H15.6622C15.9098 0.00323746 16.1464 0.103049 16.3215 0.278167C16.4966 0.453286 16.5964 0.689866 16.5997 0.9375V3.25269C17.3969 3.42959 18.1345 3.83026 18.7211 4.41679C19.5322 5.22788 19.9878 6.32796 19.9878 7.47502C19.9878 8.62209 19.5322 9.72217 18.7211 10.5333C18.1345 11.1198 17.3969 11.5205 16.5997 11.6974V14.0125C16.6047 14.1393 16.5842 14.2659 16.5395 14.3847C16.4948 14.5035 16.4268 14.6121 16.3394 14.7042C16.252 14.7962 16.147 14.8698 16.0307 14.9206C15.9144 14.9714 15.7891 14.9984 15.6622 15ZM1.89695 10.325H1.88715V4.625H8.33715C8.52423 4.62301 8.70666 4.56654 8.86215 4.4625L12.6872 1.875H14.7247V13.125H12.6872L8.86215 10.4875C8.70666 10.3835 8.52423 10.327 8.33715 10.325H2.20217C2.15205 10.3167 2.10102 10.3125 2.04956 10.3125C1.9981 10.3125 1.94708 10.3167 1.89695 10.325ZM2.98706 12.2V18.1625H5.66206V12.2H2.98706ZM16.5997 9.93612V5.01393C16.6536 5.02355 16.7072 5.03495 16.7605 5.04814C17.1202 5.13709 17.4556 5.30487 17.7425 5.53934C18.0293 5.77381 18.2605 6.06912 18.4192 6.40389C18.578 6.73866 18.6603 7.10452 18.6603 7.47502C18.6603 7.84552 18.578 8.21139 18.4192 8.54616C18.2605 8.88093 18.0293 9.17624 17.7425 9.41071C17.4556 9.64518 17.1202 9.81296 16.7605 9.90191C16.7072 9.91509 16.6536 9.9265 16.5997 9.93612Z"
	});
	t.appendChild(n).appendChild(r);
	let i = e("defs"), a = ty(e("clipPath"), { id: "clip0_57_80" }), o = ty(e("rect"), {
		width: `${ny}`,
		height: `${ny}`,
		fill: "white"
	});
	return a.appendChild(o), i.appendChild(a), t.appendChild(i).appendChild(a).appendChild(o), { get el() {
		return t;
	} };
}
function $(e, t, ...n) {
	let r = wv.document.createElement(e);
	t && Object.entries(t).forEach(([e, t]) => {
		e === "className" && typeof t == "string" ? r.setAttribute("class", t) : typeof t == "boolean" && t ? r.setAttribute(e, "") : typeof t == "string" ? r.setAttribute(e, t) : e.startsWith("on") && typeof t == "function" && r.addEventListener(e.substring(2).toLowerCase(), t);
	});
	for (let e of n) ay(r, e);
	return r;
}
function ay(e, t) {
	let n = wv.document;
	if (t != null) if (Array.isArray(t)) for (let n of t) ay(e, n);
	else t === !1 || (typeof t == "string" ? e.appendChild(n.createTextNode(t)) : t instanceof Node ? e.appendChild(t) : e.appendChild(n.createTextNode(String(t))));
}
function oy({ buttonLabel: e, onClick: t }) {
	function n(e) {
		t && t(e);
	}
	let r = $("button", {
		type: "button",
		className: "widget__actor",
		"aria-label": e,
		"aria-hidden": "false"
	}, iy().el, e ? $("span", { className: "widget__actor__text" }, e) : null);
	return r.addEventListener("click", n), {
		get el() {
			return r;
		},
		show: () => {
			r.classList.remove("widget__actor--hidden"), r.setAttribute("aria-hidden", "false");
		},
		hide: () => {
			r.classList.add("widget__actor--hidden"), r.setAttribute("aria-hidden", "true");
		}
	};
}
function sy({ label: e }) {
	return { el: $("button", {
		type: "submit",
		className: "btn btn--primary",
		"aria-label": e
	}, e) };
}
function cy(e, t) {
	let n = e.get(t);
	return typeof n == "string" ? n.trim() : "";
}
function ly({ nameLabel: e, namePlaceholder: t, emailLabel: n, emailPlaceholder: r, messageLabel: i, messagePlaceholder: a, isRequiredLabel: o, cancelButtonLabel: s, submitButtonLabel: c, showName: l, showEmail: u, isNameRequired: d, isEmailRequired: f, defaultName: p, defaultEmail: m, onCancel: h, onSubmit: g }) {
	let { el: _ } = sy({ label: c });
	function v(e) {
		if (e.preventDefault(), e.target instanceof HTMLFormElement) try {
			if (g) {
				let t = new FormData(e.target);
				g({
					name: cy(t, "name"),
					email: cy(t, "email"),
					message: cy(t, "message")
				});
			}
		} catch {}
	}
	let y = $("div", {
		className: "form__error-container form__error-container--hidden",
		"aria-hidden": "true"
	});
	function b(e) {
		y.textContent = e, y.classList.remove("form__error-container--hidden"), y.setAttribute("aria-hidden", "false");
	}
	function x() {
		y.textContent = "", y.classList.add("form__error-container--hidden"), y.setAttribute("aria-hidden", "true");
	}
	let S = $("input", {
		id: "name",
		type: l ? "text" : "hidden",
		"aria-hidden": l ? "false" : "true",
		name: "name",
		required: d,
		className: "form__input",
		placeholder: t,
		value: p
	}), C = $("input", {
		id: "email",
		type: u ? "text" : "hidden",
		"aria-hidden": u ? "false" : "true",
		name: "email",
		required: f,
		className: "form__input",
		placeholder: r,
		value: m
	}), w = $("textarea", {
		id: "message",
		autoFocus: "true",
		rows: "5",
		name: "message",
		required: !0,
		className: "form__input form__input--textarea",
		placeholder: a
	}), ee = $("button", {
		type: "button",
		className: "btn btn--default",
		"aria-label": s,
		onClick: (e) => {
			h && h(e);
		}
	}, s), te = $("form", {
		className: "form",
		onSubmit: v
	}, [
		y,
		l && $("label", {
			htmlFor: "name",
			className: "form__label"
		}, [$("span", { className: "form__label__text" }, e, d && $("span", { className: "form__label__text--required" }, ` ${o}`)), S]),
		!l && S,
		u && $("label", {
			htmlFor: "email",
			className: "form__label"
		}, [$("span", { className: "form__label__text" }, n, f && $("span", { className: "form__label__text--required" }, ` ${o}`)), C]),
		!u && C,
		$("label", {
			htmlFor: "message",
			className: "form__label"
		}, [$("span", { className: "form__label__text" }, i, $("span", { className: "form__label__text--required" }, ` ${o}`)), w]),
		$("div", { className: "btn-group" }, [_, ee])
	]);
	return {
		get el() {
			return te;
		},
		showError: b,
		hideError: x
	};
}
var uy = "http://www.w3.org/2000/svg";
function dy({ colorScheme: e }) {
	let t = (e) => wv.document.createElementNS(uy, e), n = ty(t("svg"), {
		class: "sentry-logo",
		width: "32",
		height: "30",
		viewBox: "0 0 72 66",
		fill: "none"
	}), r = ty(t("path"), {
		transform: "translate(11, 11)",
		d: "M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z"
	});
	n.append(r);
	let i = t("defs"), a = t("style");
	return a.textContent = `
    path {
      fill: ${e === "dark" ? "#fff" : "#362d59"};
    }`, e === "system" && (a.textContent += "\n    @media (prefers-color-scheme: dark) {\n      path: {\n        fill: '#fff';\n      }\n    }\n    "), i.append(a), n.append(i), { get el() {
		return n;
	} };
}
function fy({ formTitle: e, showBranding: t, showName: n, showEmail: r, isNameRequired: i, isEmailRequired: a, colorScheme: o, defaultName: s, defaultEmail: c, onClosed: l, onCancel: u, onSubmit: d, ...f }) {
	let p = null;
	function m() {
		h(), l && l();
	}
	function h() {
		p && (p.open = !1);
	}
	function g() {
		p && (p.open = !0);
	}
	function _() {
		return p && p.open === !0 || !1;
	}
	let { el: v, showError: y, hideError: b } = ly({
		showEmail: r,
		showName: n,
		isEmailRequired: a,
		isNameRequired: i,
		defaultName: s,
		defaultEmail: c,
		onSubmit: d,
		onCancel: u,
		...f
	});
	return p = $("dialog", {
		className: "dialog",
		open: !0,
		onClick: m
	}, $("div", {
		className: "dialog__content",
		onClick: (e) => {
			e.stopPropagation();
		}
	}, $("h2", { className: "dialog__header" }, e, t && $("a", {
		className: "brand-link",
		target: "_blank",
		href: "https://sentry.io/welcome/",
		title: "Powered by Sentry",
		rel: "noopener noreferrer"
	}, dy({ colorScheme: o }).el)), v)), {
		get el() {
			return p;
		},
		showError: y,
		hideError: b,
		open: g,
		close: h,
		checkIsOpen: _
	};
}
var py = 16, my = 17, hy = "http://www.w3.org/2000/svg";
function gy() {
	let e = (e) => wv.document.createElementNS(hy, e), t = ty(e("svg"), {
		class: "success-icon",
		width: `${py}`,
		height: `${my}`,
		viewBox: `0 0 ${py} ${my}`,
		fill: "none"
	}), n = ty(e("g"), { clipPath: "url(#clip0_57_156)" }), r = ty(e("path"), {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M3.55544 15.1518C4.87103 16.0308 6.41775 16.5 8 16.5C10.1217 16.5 12.1566 15.6571 13.6569 14.1569C15.1571 12.6566 16 10.6217 16 8.5C16 6.91775 15.5308 5.37103 14.6518 4.05544C13.7727 2.73985 12.5233 1.71447 11.0615 1.10897C9.59966 0.503466 7.99113 0.34504 6.43928 0.653721C4.88743 0.962403 3.46197 1.72433 2.34315 2.84315C1.22433 3.96197 0.462403 5.38743 0.153721 6.93928C-0.15496 8.49113 0.00346625 10.0997 0.608967 11.5615C1.21447 13.0233 2.23985 14.2727 3.55544 15.1518ZM4.40546 3.1204C5.46945 2.40946 6.72036 2.03 8 2.03C9.71595 2.03 11.3616 2.71166 12.575 3.92502C13.7883 5.13838 14.47 6.78405 14.47 8.5C14.47 9.77965 14.0905 11.0306 13.3796 12.0945C12.6687 13.1585 11.6582 13.9878 10.476 14.4775C9.29373 14.9672 7.99283 15.0953 6.73777 14.8457C5.48271 14.596 4.32987 13.9798 3.42502 13.075C2.52018 12.1701 1.90397 11.0173 1.65432 9.76224C1.40468 8.50718 1.5328 7.20628 2.0225 6.02404C2.5122 4.8418 3.34148 3.83133 4.40546 3.1204Z"
	}), i = ty(e("path"), { d: "M6.68775 12.4297C6.78586 12.4745 6.89218 12.4984 7 12.5C7.11275 12.4955 7.22315 12.4664 7.32337 12.4145C7.4236 12.3627 7.51121 12.2894 7.58 12.2L12 5.63999C12.0848 5.47724 12.1071 5.28902 12.0625 5.11098C12.0178 4.93294 11.9095 4.77744 11.7579 4.67392C11.6064 4.57041 11.4221 4.52608 11.24 4.54931C11.0579 4.57254 10.8907 4.66173 10.77 4.79999L6.88 10.57L5.13 8.56999C5.06508 8.49566 4.98613 8.43488 4.89768 8.39111C4.80922 8.34735 4.713 8.32148 4.61453 8.31498C4.51605 8.30847 4.41727 8.32147 4.32382 8.35322C4.23038 8.38497 4.14413 8.43484 4.07 8.49999C3.92511 8.63217 3.83692 8.81523 3.82387 9.01092C3.81083 9.2066 3.87393 9.39976 4 9.54999L6.43 12.24C6.50187 12.3204 6.58964 12.385 6.68775 12.4297Z" });
	t.appendChild(n).append(i, r);
	let a = e("defs"), o = ty(e("clipPath"), { id: "clip0_57_156" }), s = ty(e("rect"), {
		width: `${py}`,
		height: `${py}`,
		fill: "white",
		transform: "translate(0 0.5)"
	});
	return o.appendChild(s), a.appendChild(o), t.appendChild(a).appendChild(o).appendChild(s), { get el() {
		return t;
	} };
}
function _y({ message: e, onRemove: t }) {
	function n() {
		r && (r.remove(), t && t());
	}
	let r = $("div", {
		className: "success-message",
		onClick: n
	}, gy().el, e);
	return {
		el: r,
		remove: n
	};
}
function vy({ shadow: e, options: { shouldCreateActor: t = !0, ...n }, attachTo: r }) {
	let i, a, o = !1;
	function s() {
		if (e) try {
			let t = _y({
				message: n.successMessageText,
				onRemove: () => {
					r && clearTimeout(r), u();
				}
			});
			if (!t.el) throw Error("Unable to show success message");
			e.appendChild(t.el);
			let r = setTimeout(() => {
				t && t.remove();
			}, 5e3);
		} catch (e) {
			D.error(e);
		}
	}
	async function c(e) {
		if (!a) return;
		let t = [];
		if (n.isNameRequired && !e.name && t.push(n.nameLabel), n.isEmailRequired && !e.email && t.push(n.emailLabel), e.message || t.push(n.messageLabel), t.length > 0) {
			a.showError(`Please enter in the following required fields: ${t.join(", ")}`);
			return;
		}
		if (!await ey(a, e)) {
			n.onSubmitError && n.onSubmitError();
			return;
		}
		h(), s(), n.onSubmitSuccess && n.onSubmitSuccess();
	}
	function l() {
		let e = P(), t = e && e.getIntegrationByName && e.getIntegrationByName("Replay");
		t && t.flush().catch((e) => {
			qv && D.error(e);
		});
	}
	function u() {
		i && i.show();
	}
	function d() {
		i && i.hide();
	}
	function f() {
		i && i.el && i.el.remove();
	}
	function p() {
		try {
			if (a) {
				a.open(), o = !0, n.onFormOpen && n.onFormOpen(), l();
				return;
			}
			let t = n.useSentryUser, r = F(), i = r && r.getUser();
			if (a = fy({
				colorScheme: n.colorScheme,
				showBranding: n.showBranding,
				showName: n.showName || n.isNameRequired,
				showEmail: n.showEmail || n.isEmailRequired,
				isNameRequired: n.isNameRequired,
				isEmailRequired: n.isEmailRequired,
				formTitle: n.formTitle,
				cancelButtonLabel: n.cancelButtonLabel,
				submitButtonLabel: n.submitButtonLabel,
				emailLabel: n.emailLabel,
				emailPlaceholder: n.emailPlaceholder,
				messageLabel: n.messageLabel,
				messagePlaceholder: n.messagePlaceholder,
				nameLabel: n.nameLabel,
				namePlaceholder: n.namePlaceholder,
				isRequiredLabel: n.isRequiredLabel,
				defaultName: t && i && i[t.name] || "",
				defaultEmail: t && i && i[t.email] || "",
				onClosed: () => {
					u(), o = !1, n.onFormClose && n.onFormClose();
				},
				onCancel: () => {
					m(), u();
				},
				onSubmit: c
			}), !a.el) throw Error("Unable to open Feedback dialog");
			e.appendChild(a.el), d(), n.onFormOpen && n.onFormOpen(), l();
		} catch (e) {
			D.error(e);
		}
	}
	function m() {
		a && (a.close(), o = !1, n.onFormClose && n.onFormClose());
	}
	function h() {
		if (a) {
			m();
			let e = a.el;
			e && e.remove(), a = void 0;
		}
	}
	function g() {
		o || p(), d();
	}
	return r ? r.addEventListener("click", g) : t && (i = oy({
		buttonLabel: n.buttonLabel,
		onClick: g
	}), i.el && e.appendChild(i.el)), {
		get actor() {
			return i;
		},
		get dialog() {
			return a;
		},
		showActor: u,
		hideActor: d,
		removeActor: f,
		openDialog: p,
		closeDialog: m,
		removeDialog: h
	};
}
var yy = wv.document, by = ((e) => new xy(e)), xy = class e {
	static __initStatic() {
		this.id = "Feedback";
	}
	constructor({ autoInject: t = !0, id: n = "sentry-feedback", isEmailRequired: r = !1, isNameRequired: i = !1, showBranding: a = !0, showEmail: o = !0, showName: s = !0, useSentryUser: c = {
		email: "email",
		name: "username"
	}, themeDark: l, themeLight: u, colorScheme: d = "system", buttonLabel: f = Av, cancelButtonLabel: p = jv, submitButtonLabel: m = Mv, formTitle: h = Nv, emailPlaceholder: g = Pv, emailLabel: _ = Fv, messagePlaceholder: v = Iv, messageLabel: y = Lv, namePlaceholder: b = Rv, nameLabel: x = zv, isRequiredLabel: S = Bv, successMessageText: C = Vv, onFormClose: w, onFormOpen: ee, onSubmitError: te, onSubmitSuccess: ne } = {}) {
		this.name = e.id, this._host = null, this._shadow = null, this._widget = null, this._widgets = /* @__PURE__ */ new Set(), this._hasInsertedActorStyles = !1, this.options = {
			autoInject: t,
			showBranding: a,
			id: n,
			isEmailRequired: r,
			isNameRequired: i,
			showEmail: o,
			showName: s,
			useSentryUser: c,
			colorScheme: d,
			themeDark: {
				...kv.dark,
				...l
			},
			themeLight: {
				...kv.light,
				...u
			},
			buttonLabel: f,
			cancelButtonLabel: p,
			submitButtonLabel: m,
			formTitle: h,
			emailLabel: _,
			emailPlaceholder: g,
			messageLabel: y,
			messagePlaceholder: v,
			nameLabel: x,
			namePlaceholder: b,
			isRequiredLabel: S,
			successMessageText: C,
			onFormClose: w,
			onFormOpen: ee,
			onSubmitError: te,
			onSubmitSuccess: ne
		};
	}
	setupOnce() {
		if (qt()) try {
			this._cleanupWidgetIfExists();
			let { autoInject: e } = this.options;
			if (!e) return;
			this._createWidget(this.options);
		} catch (e) {
			qv && D.error(e);
		}
	}
	openDialog() {
		this._widget || this._createWidget({
			...this.options,
			shouldCreateActor: !1
		}), this._widget && this._widget.openDialog();
	}
	closeDialog() {
		this._widget && this._widget.closeDialog();
	}
	attachTo(e, t) {
		try {
			let n = Jv(this.options, t || {});
			return this._ensureShadowHost(n, ({ shadow: t }) => {
				let r = typeof e == "string" ? yy.querySelector(e) : typeof e.addEventListener == "function" ? e : null;
				if (!r) return qv && D.error("[Feedback] Unable to attach to target element"), null;
				let i = vy({
					shadow: t,
					options: n,
					attachTo: r
				});
				return this._widgets.add(i), this._widget ||= i, i;
			});
		} catch (e) {
			return qv && D.error(e), null;
		}
	}
	createWidget(e) {
		try {
			return this._createWidget(Jv(this.options, e || {}));
		} catch (e) {
			return qv && D.error(e), null;
		}
	}
	removeWidget(e) {
		if (!e) return !1;
		try {
			if (this._widgets.has(e)) return e.removeActor(), e.removeDialog(), this._widgets.delete(e), this._widget === e && (this._widget = null), !0;
		} catch (e) {
			qv && D.error(e);
		}
		return !1;
	}
	getWidget() {
		return this._widget;
	}
	remove() {
		this._host && this._host.remove(), this._initialize();
	}
	_initialize() {
		this._host = null, this._shadow = null, this._widget = null, this._widgets = /* @__PURE__ */ new Set(), this._hasInsertedActorStyles = !1;
	}
	_cleanupWidgetIfExists() {
		this._host && this.remove();
		let e = yy.querySelector(`#${this.options.id}`);
		e && e.remove();
	}
	_createWidget(e) {
		return this._ensureShadowHost(e, ({ shadow: t }) => {
			let n = vy({
				shadow: t,
				options: e
			});
			return !this._hasInsertedActorStyles && n.actor && (t.appendChild(Yv(yy)), this._hasInsertedActorStyles = !0), this._widgets.add(n), this._widget ||= n, n;
		});
	}
	_ensureShadowHost(e, t) {
		let n = !1;
		if (!this._shadow || !this._host) {
			let { id: t, colorScheme: r, themeLight: i, themeDark: a } = e, { shadow: o, host: s } = $v({
				id: t,
				colorScheme: r,
				themeLight: i,
				themeDark: a
			});
			this._shadow = o, this._host = s, n = !0;
		}
		this._host.dataset.sentryFeedbackColorscheme = e.colorScheme;
		let r = t({
			shadow: this._shadow,
			host: this._host
		});
		return n && yy.body.appendChild(this._host), r;
	}
};
xy.__initStatic();
//#endregion
//#region node_modules/@sentry/integrations/esm/captureconsole.js
var Sy = "CaptureConsole", Cy = R(((e = {}) => {
	let t = e.levels || ge;
	return {
		name: Sy,
		setupOnce() {},
		setup(e) {
			"console" in T && Ze(({ args: n, level: r }) => {
				P() !== e || !t.includes(r) || wy(n, r);
			});
		}
	};
}));
L(Sy, Cy);
function wy(e, t) {
	let n = {
		level: yn(t),
		extra: { arguments: e }
	};
	Hr((r) => {
		if (r.addEventProcessor((e) => (e.logger = "console", nt(e, {
			handled: !1,
			type: "console"
		}), e)), t === "assert" && e[0] === !1) {
			let t = `Assertion failed: ${S(e.slice(1), " ") || "console.assert"}`;
			r.setExtra("arguments", e.slice(1)), Mr(t, n);
			return;
		}
		let i = e.find((e) => e instanceof Error);
		if (t === "error" && i) {
			jr(i, n);
			return;
		}
		Mr(S(e, " "), n);
	});
}
//#endregion
//#region node_modules/@sentry/integrations/esm/debug.js
var Ty = "Debug", Ey = R(((e = {}) => {
	let t = {
		debugger: !1,
		stringify: !1,
		...e
	};
	return {
		name: Ty,
		setupOnce() {},
		setup(e) {
			e.on && e.on("beforeSendEvent", (e, n) => {
				if (t.debugger) debugger;
				ve(() => {
					t.stringify ? (console.log(JSON.stringify(e, null, 2)), n && Object.keys(n).length && console.log(JSON.stringify(n, null, 2))) : (console.log(e), n && Object.keys(n).length && console.log(n));
				});
			});
		}
	};
}));
L(Ty, Ey);
//#endregion
//#region node_modules/@sentry/integrations/esm/debug-build.js
var Dy = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__, Oy = "Dedupe", ky = R((() => {
	let e;
	return {
		name: Oy,
		setupOnce() {},
		processEvent(t) {
			if (t.type) return t;
			try {
				if (Ay(t, e)) return Dy && D.warn("Event dropped due to being a duplicate of previously captured event."), null;
			} catch {}
			return e = t;
		}
	};
}));
L(Oy, ky);
function Ay(e, t) {
	return t ? !!(jy(e, t) || My(e, t)) : !1;
}
function jy(e, t) {
	let n = e.message, r = t.message;
	return !(!n && !r || n && !r || !n && r || n !== r || !Py(e, t) || !Ny(e, t));
}
function My(e, t) {
	let n = Fy(t), r = Fy(e);
	return !(!n || !r || n.type !== r.type || n.value !== r.value || !Py(e, t) || !Ny(e, t));
}
function Ny(e, t) {
	let n = Iy(e), r = Iy(t);
	if (!n && !r) return !0;
	if (n && !r || !n && r || (n = n, r = r, r.length !== n.length)) return !1;
	for (let e = 0; e < r.length; e++) {
		let t = r[e], i = n[e];
		if (t.filename !== i.filename || t.lineno !== i.lineno || t.colno !== i.colno || t.function !== i.function) return !1;
	}
	return !0;
}
function Py(e, t) {
	let n = e.fingerprint, r = t.fingerprint;
	if (!n && !r) return !0;
	if (n && !r || !n && r) return !1;
	n = n, r = r;
	try {
		return n.join("") === r.join("");
	} catch {
		return !1;
	}
}
function Fy(e) {
	return e.exception && e.exception.values && e.exception.values[0];
}
function Iy(e) {
	let t = e.exception;
	if (t) try {
		return t.values[0].stacktrace.frames;
	} catch {
		return;
	}
}
//#endregion
//#region node_modules/@sentry/integrations/esm/extraerrordata.js
var Ly = "ExtraErrorData", Ry = R(((e = {}) => {
	let t = e.depth || 3, n = e.captureErrorCause || !1;
	return {
		name: Ly,
		setupOnce() {},
		processEvent(e, r) {
			return zy(e, r, t, n);
		}
	};
}));
L(Ly, Ry);
function zy(e, t = {}, n, i) {
	if (!t.originalException || !r(t.originalException)) return e;
	let a = t.originalException.name || t.originalException.constructor.name, o = By(t.originalException, i);
	if (o) {
		let t = { ...e.contexts }, r = Xt(o, n);
		return d(r) && (Oe(r, "__sentry_skip_normalization__", !0), t[a] = r), {
			...e,
			contexts: t
		};
	}
	return e;
}
function By(e, t) {
	try {
		let n = [
			"name",
			"message",
			"stack",
			"line",
			"column",
			"fileName",
			"lineNumber",
			"columnNumber",
			"toJSON"
		], i = {};
		for (let t of Object.keys(e)) {
			if (n.indexOf(t) !== -1) continue;
			let a = e[t];
			i[t] = r(a) ? a.toString() : a;
		}
		if (t && e.cause !== void 0 && (i.cause = r(e.cause) ? e.cause.toString() : e.cause), typeof e.toJSON == "function") {
			let t = e.toJSON();
			for (let e of Object.keys(t)) {
				let n = t[e];
				i[e] = r(n) ? n.toString() : n;
			}
		}
		return i;
	} catch (e) {
		Dy && D.error("Unable to extract extra data from the Error object:", e);
	}
	return null;
}
//#endregion
//#region node_modules/@sentry/integrations/esm/reportingobserver.js
var Vy = T, Hy = "ReportingObserver", Uy = /* @__PURE__ */ new WeakMap(), Wy = R(((e = {}) => {
	let t = e.types || [
		"crash",
		"deprecation",
		"intervention"
	];
	function n(e) {
		if (Uy.has(P())) for (let t of e) Hr((e) => {
			e.setExtra("url", t.url);
			let n = `ReportingObserver [${t.type}]`, r = "No details available";
			if (t.body) {
				let n = {};
				for (let e in t.body) n[e] = t.body[e];
				if (e.setExtra("body", n), t.type === "crash") {
					let e = t.body;
					r = [e.crashId || "", e.reason || ""].join(" ").trim() || r;
				} else r = t.body.message || r;
			}
			Mr(`${n}: ${r}`);
		});
	}
	return {
		name: Hy,
		setupOnce() {
			xt() && new Vy.ReportingObserver(n, {
				buffered: !0,
				types: t
			}).observe();
		},
		setup(e) {
			Uy.set(e, !0);
		}
	};
}));
L(Hy, Wy);
//#endregion
//#region node_modules/@sentry/integrations/esm/rewriteframes.js
var Gy = "RewriteFrames", Ky = R(((e = {}) => {
	let t = e.root, n = e.prefix || "app:///", r = e.iteratee || ((e) => {
		if (!e.filename) return e;
		let r = /^[a-zA-Z]:\\/.test(e.filename) || e.filename.includes("\\") && !e.filename.includes("/"), i = /^\//.test(e.filename);
		if (r || i) {
			let i = r ? e.filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/") : e.filename, a = t ? ln(t, i) : un(i);
			e.filename = `${n}${a}`;
		}
		return e;
	});
	function i(e) {
		try {
			return {
				...e,
				exception: {
					...e.exception,
					values: e.exception.values.map((e) => ({
						...e,
						...e.stacktrace && { stacktrace: a(e.stacktrace) }
					}))
				}
			};
		} catch {
			return e;
		}
	}
	function a(e) {
		return {
			...e,
			frames: e && e.frames && e.frames.map((e) => r(e))
		};
	}
	return {
		name: Gy,
		setupOnce() {},
		processEvent(e) {
			let t = e;
			return e.exception && Array.isArray(e.exception.values) && (t = i(t)), t;
		}
	};
}));
L(Gy, Ky);
//#endregion
//#region node_modules/@sentry/integrations/esm/sessiontiming.js
var qy = "SessionTiming", Jy = R((() => {
	let e = Date.now();
	return {
		name: qy,
		setupOnce() {},
		processEvent(t) {
			let n = Date.now();
			return {
				...t,
				extra: {
					...t.extra,
					"session:start": e,
					"session:duration": n - e,
					"session:end": n
				}
			};
		}
	};
}));
L(qy, Jy);
//#endregion
//#region node_modules/@sentry/integrations/esm/httpclient.js
var Yy = "HttpClient", Xy = R(((e = {}) => {
	let t = {
		failedRequestStatusCodes: [[500, 599]],
		failedRequestTargets: [/.*/],
		...e
	};
	return {
		name: Yy,
		setupOnce() {},
		setup(e) {
			ab(e, t), ob(e, t);
		}
	};
}));
L(Yy, Xy);
function Zy(e, t, n, r) {
	if (sb(e, n.status, n.url)) {
		let e = lb(t, r), i, a, o, s;
		ub() && ([{headers: i, cookies: o}, {headers: a, cookies: s}] = [{
			cookieHeader: "Cookie",
			obj: e
		}, {
			cookieHeader: "Set-Cookie",
			obj: n
		}].map(({ cookieHeader: e, obj: t }) => {
			let n = tb(t.headers), r;
			try {
				let t = n[e] || n[e.toLowerCase()] || void 0;
				t && (r = eb(t));
			} catch {
				Dy && D.log(`Could not extract cookies from header ${e}`);
			}
			return {
				headers: n,
				cookies: r
			};
		})), Nr(cb({
			url: e.url,
			method: e.method,
			status: n.status,
			requestHeaders: i,
			responseHeaders: a,
			requestCookies: o,
			responseCookies: s
		}));
	}
}
function Qy(e, t, n, r) {
	if (sb(e, t.status, t.responseURL)) {
		let e, i, a;
		if (ub()) {
			try {
				let e = t.getResponseHeader("Set-Cookie") || t.getResponseHeader("set-cookie") || void 0;
				e && (i = eb(e));
			} catch {
				Dy && D.log("Could not extract cookies from response headers");
			}
			try {
				a = nb(t);
			} catch {
				Dy && D.log("Could not extract headers from response");
			}
			e = r;
		}
		Nr(cb({
			url: t.responseURL,
			method: n,
			status: t.status,
			requestHeaders: e,
			responseHeaders: a,
			responseCookies: i
		}));
	}
}
function $y(e) {
	if (e) {
		let t = e["Content-Length"] || e["content-length"];
		if (t) return parseInt(t, 10);
	}
}
function eb(e) {
	return e.split("; ").reduce((e, t) => {
		let [n, r] = t.split("=");
		return e[n] = r, e;
	}, {});
}
function tb(e) {
	let t = {};
	return e.forEach((e, n) => {
		t[n] = e;
	}), t;
}
function nb(e) {
	let t = e.getAllResponseHeaders();
	return t ? t.split("\r\n").reduce((e, t) => {
		let [n, r] = t.split(": ");
		return e[n] = r, e;
	}, {}) : {};
}
function rb(e, t) {
	return e.some((e) => typeof e == "string" ? t.includes(e) : e.test(t));
}
function ib(e, t) {
	return e.some((e) => typeof e == "number" ? e === t : t >= e[0] && t <= e[1]);
}
function ab(e, t) {
	bt() && St((n) => {
		if (P() !== e) return;
		let { response: r, args: i } = n, [a, o] = i;
		r && Zy(t, a, r, o);
	});
}
function ob(e, t) {
	"XMLHttpRequest" in T && Vt((n) => {
		if (P() !== e) return;
		let r = n.xhr, i = r[Bt];
		if (!i) return;
		let { method: a, request_headers: o } = i;
		try {
			Qy(t, r, a, o);
		} catch (e) {
			Dy && D.warn("Error while extracting response event form XHR response", e);
		}
	});
}
function sb(e, t, n) {
	return ib(e.failedRequestStatusCodes, t) && rb(e.failedRequestTargets, n) && !So(n, P());
}
function cb(e) {
	let t = `HTTP Client Error with status code: ${e.status}`, n = {
		message: t,
		exception: { values: [{
			type: "Error",
			value: t
		}] },
		request: {
			url: e.url,
			method: e.method,
			headers: e.requestHeaders,
			cookies: e.requestCookies
		},
		contexts: { response: {
			status_code: e.status,
			headers: e.responseHeaders,
			cookies: e.responseCookies,
			body_size: $y(e.responseHeaders)
		} }
	};
	return nt(n, {
		type: "http.client",
		handled: !1
	}), n;
}
function lb(e, t) {
	return !t && e instanceof Request || e instanceof Request && e.bodyUsed ? e : new Request(e, t);
}
function ub() {
	let e = P();
	return e ? !!e.getOptions().sendDefaultPii : !1;
}
//#endregion
//#region node_modules/@sentry/integrations/esm/contextlines.js
var db = T, fb = 7, pb = "ContextLines", mb = R(((e = {}) => {
	let t = e.frameContextLines == null ? fb : e.frameContextLines;
	return {
		name: pb,
		setupOnce() {},
		processEvent(e) {
			return hb(e, t);
		}
	};
}));
L(pb, mb);
function hb(e, t) {
	let n = db.document, r = db.location && _n(db.location.href);
	if (!n || !r) return e;
	let i = e.exception && e.exception.values;
	if (!i || !i.length) return e;
	let a = n.documentElement.innerHTML;
	if (!a) return e;
	let o = [
		"<!DOCTYPE html>",
		"<html>",
		...a.split("\n"),
		"</html>"
	];
	return i.forEach((e) => {
		let n = e.stacktrace;
		n && n.frames && (n.frames = n.frames.map((e) => gb(e, o, r, t)));
	}), e;
}
function gb(e, t, n, r) {
	return e.filename !== n || !e.lineno || !t.length || rt(t, e, r), e;
}
//#endregion
//#region node_modules/@sentry/browser/esm/transports/offline.js
function _b(e) {
	return new Promise((t, n) => {
		e.oncomplete = e.onsuccess = () => t(e.result), e.onabort = e.onerror = () => n(e.error);
	});
}
function vb(e, t) {
	let n = indexedDB.open(e);
	n.onupgradeneeded = () => n.result.createObjectStore(t);
	let r = _b(n);
	return (e) => r.then((n) => e(n.transaction(t, "readwrite").objectStore(t)));
}
function yb(e) {
	return _b(e.getAllKeys());
}
function bb(e, t, n) {
	return e((e) => yb(e).then((r) => {
		if (!(r.length >= n)) return e.put(t, Math.max(...r, 0) + 1), _b(e.transaction);
	}));
}
function xb(e) {
	return e((e) => yb(e).then((t) => {
		if (t.length !== 0) return _b(e.get(t[0])).then((n) => (e.delete(t[0]), _b(e.transaction).then(() => n)));
	}));
}
function Sb(e) {
	let t;
	function n() {
		return t ??= vb(e.dbName || "sentry-offline", e.storeName || "queue"), t;
	}
	return {
		insert: async (t) => {
			try {
				let r = await Vn(t, e.textEncoder);
				await bb(n(), r, e.maxQueueSize || 30);
			} catch {}
		},
		pop: async () => {
			try {
				let t = await xb(n());
				if (t) return Un(t, e.textEncoder || new TextEncoder(), e.textDecoder || new TextDecoder());
			} catch {}
		}
	};
}
function Cb(e) {
	return (t) => e({
		...t,
		createStore: Sb
	});
}
function wb(e) {
	return Cb(ho(e));
}
//#endregion
//#region node_modules/@sentry/browser/esm/profiling/utils.js
var Tb = 1e6, Eb = "0", Db = "main", Ob = "", kb = "", Ab = "", jb = U.navigator && U.navigator.userAgent || "", Mb = "", Nb = U.navigator && U.navigator.language || U.navigator && U.navigator.languages && U.navigator.languages[0] || "";
function Pb(e) {
	return typeof e == "object" && !!e && "getHighEntropyValues" in e;
}
var Fb = U.navigator && U.navigator.userAgentData;
Pb(Fb) && Fb.getHighEntropyValues([
	"architecture",
	"model",
	"platform",
	"platformVersion",
	"fullVersionList"
]).then((e) => {
	if (Ob = e.platform || "", Ab = e.architecture || "", Mb = e.model || "", kb = e.platformVersion || "", e.fullVersionList && e.fullVersionList.length > 0) {
		let t = e.fullVersionList[e.fullVersionList.length - 1];
		jb = `${t.brand} ${t.version}`;
	}
}).catch((e) => void 0);
function Ib(e) {
	return !("thread_metadata" in e);
}
function Lb(e) {
	return Ib(e) ? Vb(e) : e;
}
function Rb(e) {
	let t = e && e.contexts && e.contexts.trace && e.contexts.trace.trace_id;
	return typeof t == "string" && t.length !== 32 && W && D.log(`[Profiling] Invalid traceId: ${t} on profiled event`), typeof t == "string" ? t : "";
}
function zb(e, t, n, r) {
	if (r.type !== "transaction") throw TypeError("Profiling events may only be attached to transactions, this should never occur.");
	if (n == null) throw TypeError(`Cannot construct profiling event envelope without a valid profile. Got ${n} instead.`);
	let i = Rb(r), a = Lb(n), o = t || (typeof r.start_timestamp == "number" ? r.start_timestamp * 1e3 : Date.now()), s = typeof r.timestamp == "number" ? r.timestamp * 1e3 : Date.now();
	return {
		event_id: e,
		timestamp: new Date(o).toISOString(),
		platform: "javascript",
		version: "1",
		release: r.release || "",
		environment: r.environment || "production",
		runtime: {
			name: "javascript",
			version: U.navigator.userAgent
		},
		os: {
			name: Ob,
			version: kb,
			build_number: jb
		},
		device: {
			locale: Nb,
			model: Mb,
			manufacturer: jb,
			architecture: Ab,
			is_emulator: !1
		},
		debug_meta: { images: Gb(n.resources) },
		profile: a,
		transactions: [{
			name: r.transaction || "",
			id: r.event_id || A(),
			trace_id: i,
			active_thread_id: Eb,
			relative_start_ns: "0",
			relative_end_ns: ((s - o) * 1e6).toFixed(0)
		}]
	};
}
function Bb(e) {
	return e.op === "pageload";
}
function Vb(e) {
	let t, n = 0, r = {
		samples: [],
		stacks: [],
		frames: [],
		thread_metadata: { [Eb]: { name: Db } }
	};
	if (!e.samples.length) return r;
	let i = e.samples[0].timestamp, a = typeof performance.timeOrigin == "number" ? performance.timeOrigin : j || 0, o = a - (j || a);
	for (let a = 0; a < e.samples.length; a++) {
		let s = e.samples[a];
		if (s.stackId === void 0) {
			t === void 0 && (t = n, r.stacks[t] = [], n++), r.samples[a] = {
				elapsed_since_start_ns: ((s.timestamp + o - i) * Tb).toFixed(0),
				stack_id: t,
				thread_id: Eb
			};
			continue;
		}
		let c = e.stacks[s.stackId], l = [];
		for (; c;) {
			l.push(c.frameId);
			let t = e.frames[c.frameId];
			r.frames[c.frameId] === void 0 && (r.frames[c.frameId] = {
				function: t.name,
				abs_path: typeof t.resourceId == "number" ? e.resources[t.resourceId] : void 0,
				lineno: t.line,
				colno: t.column
			}), c = c.parentId === void 0 ? void 0 : e.stacks[c.parentId];
		}
		let u = {
			elapsed_since_start_ns: ((s.timestamp + o - i) * Tb).toFixed(0),
			stack_id: n,
			thread_id: Eb
		};
		r.stacks[n] = l, r.samples[a] = u, n++;
	}
	return r;
}
function Hb(e, t) {
	if (!t.length) return e;
	for (let n of t) e[1].push([{ type: "profile" }, n]);
	return e;
}
function Ub(e) {
	let t = [];
	return Rn(e, (e, n) => {
		if (n === "transaction") for (let n = 1; n < e.length; n++) {
			let r = e[n];
			r && r.contexts && r.contexts.profile && r.contexts.profile.profile_id && t.push(e[n]);
		}
	}), t;
}
var Wb = /* @__PURE__ */ new WeakMap();
function Gb(e) {
	let t = T._sentryDebugIds;
	if (!t) return [];
	let n = P(), r = n && n.getOptions(), i = r && r.stackParser;
	if (!i) return [];
	let a, o = Wb.get(i);
	o ? a = o : (a = /* @__PURE__ */ new Map(), Wb.set(i, a));
	let s = Object.keys(t).reduce((e, n) => {
		let r, o = a.get(n);
		o ? r = o : (r = i(n), a.set(n, r));
		for (let i = r.length - 1; i >= 0; i--) {
			let a = r[i], o = a && a.filename;
			if (a && o) {
				e[o] = t[n];
				break;
			}
		}
		return e;
	}, {}), c = [];
	for (let t of e) t && s[t] && c.push({
		type: "sourcemap",
		code_file: t,
		debug_id: s[t]
	});
	return c;
}
function Kb(e) {
	return typeof e != "number" && typeof e != "boolean" || typeof e == "number" && isNaN(e) ? (W && D.warn(`[Profiling] Invalid sample rate. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e)} of type ${JSON.stringify(typeof e)}.`), !1) : e === !0 || e === !1 ? !0 : e < 0 || e > 1 ? (W && D.warn(`[Profiling] Invalid sample rate. Sample rate must be between 0 and 1. Got ${e}.`), !1) : !0;
}
function qb(e) {
	return e.samples.length < 2 ? (W && D.log("[Profiling] Discarding profile because it contains less than 2 samples"), !1) : e.frames.length ? !0 : (W && D.log("[Profiling] Discarding profile because it contains no frames"), !1);
}
var Jb = !1, Yb = 3e4;
function Xb(e) {
	return typeof e == "function";
}
function Zb() {
	let e = U.Profiler;
	if (!Xb(e)) {
		W && D.log("[Profiling] Profiling is not supported by this browser, Profiler interface missing on window object.");
		return;
	}
	let t = Math.floor(Yb / 10);
	try {
		return new e({
			sampleInterval: 10,
			maxBufferSize: t
		});
	} catch {
		W && (D.log("[Profiling] Failed to initialize the Profiling constructor, this is likely due to a missing 'Document-Policy': 'js-profiling' header."), D.log("[Profiling] Disabling profiling for current user session.")), Jb = !0;
	}
}
function Qb(e) {
	if (Jb) return W && D.log("[Profiling] Profiling has been disabled for the duration of the current user session."), !1;
	if (!e.isRecording()) return W && D.log("[Profiling] Discarding profile because transaction was not sampled."), !1;
	let t = P(), n = t && t.getOptions();
	if (!n) return W && D.log("[Profiling] Profiling disabled, no options found."), !1;
	let r = n.profilesSampleRate;
	return Kb(r) ? r ? r === !0 || Math.random() < r ? !0 : (W && D.log(`[Profiling] Discarding profile because it's not included in the random sample (sampling rate = ${Number(r)})`), !1) : (W && D.log("[Profiling] Discarding profile because a negative sampling decision was inherited or profileSampleRate is set to 0"), !1) : (W && D.warn("[Profiling] Discarding profile because of invalid sample rate."), !1);
}
function $b(e, t, n, r) {
	return qb(n) ? zb(e, t, n, r) : null;
}
var ex = /* @__PURE__ */ new Map();
function tx() {
	return ex.size;
}
function nx(e) {
	let t = ex.get(e);
	return t && ex.delete(e), t;
}
function rx(e, t) {
	if (ex.set(e, t), ex.size > 30) {
		let e = ex.keys().next().value;
		ex.delete(e);
	}
}
//#endregion
//#region node_modules/@sentry/browser/esm/profiling/hubextensions.js
function ix(e) {
	return e ? Qb(e) ? ax(e) : e : (W && D.log("[Profiling] Transaction is undefined, skipping profiling"), e);
}
function ax(e) {
	let t;
	Bb(e) && (t = Cn() * 1e3);
	let n = Zb();
	if (!n) return e;
	W && D.log(`[Profiling] started profiling transaction: ${N(e).description}`);
	let r = A();
	async function i() {
		return !e || !n ? null : n.stop().then((t) => (a &&= (U.clearTimeout(a), void 0), W && D.log(`[Profiling] stopped profiling of transaction: ${N(e).description}`), t ? (rx(r, t), null) : (W && D.log(`[Profiling] profiler returned null profile for: ${N(e).description}`, "this may indicate an overlapping transaction or a call to stopProfiling with a profile title that was never started"), null))).catch((e) => (W && D.log("[Profiling] error while stopping profiler:", e), null));
	}
	let a = U.setTimeout(() => {
		W && D.log("[Profiling] max profile duration elapsed, stopping profiling for:", N(e).description), i();
	}, Yb), o = e.end.bind(e);
	function s() {
		return e ? (i().then(() => {
			e.setContext("profile", {
				profile_id: r,
				start_timestamp: t
			}), o();
		}, () => {
			o();
		}), e) : o();
	}
	return e.end = s, e;
}
//#endregion
//#region node_modules/@sentry/browser/esm/profiling/integration.js
var ox = "BrowserProfiling", sx = R((() => ({
	name: ox,
	setupOnce() {},
	setup(e) {
		let t = F().getTransaction();
		if (t && Bb(t) && Qb(t) && ax(t), typeof e.on != "function") {
			D.warn("[Profiling] Client does not support hooks, profiling will be disabled");
			return;
		}
		e.on("startTransaction", (e) => {
			Qb(e) && ax(e);
		}), e.on("beforeEnvelope", (e) => {
			if (!tx()) return;
			let t = Ub(e);
			if (!t.length) return;
			let n = [];
			for (let e of t) {
				let t = e && e.contexts, r = t && t.profile && t.profile.profile_id, i = t && t.profile && t.profile.start_timestamp;
				if (typeof r != "string") {
					W && D.log("[Profiling] cannot find profile for a transaction without a profile context");
					continue;
				}
				if (!r) {
					W && D.log("[Profiling] cannot find profile for a transaction without a profile context");
					continue;
				}
				t && t.profile && delete t.profile;
				let a = nx(r);
				if (!a) {
					W && D.log(`[Profiling] Could not retrieve profile for transaction: ${r}`);
					continue;
				}
				let o = $b(r, i, a, e);
				o && n.push(o);
			}
			Hb(e, n);
		});
	}
}))), cx = L(ox, sx), lx = {};
U.Sentry && U.Sentry.Integrations && (lx = U.Sentry.Integrations);
var ux = {
	...lx,
	...ys,
	...Od
};
//#endregion
export { Ou as Breadcrumbs, Xl as BrowserClient, cx as BrowserProfilingIntegration, gl as BrowserTracing, Ru as Dedupe, xy as Feedback, rs as FunctionToString, Ju as GlobalHandlers, ad as HttpContext, yi as Hub, Ho as InboundFilters, ux as Integrations, ud as LinkedErrors, Lo as ModuleMetadata, N_ as Replay, Cv as ReplayCanvas, gi as SDK_VERSION, ia as SEMANTIC_ATTRIBUTE_SENTRY_OP, aa as SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN, ra as SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE, na as SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, pi as Scope, md as TryCatch, U as WINDOW, Fr as addBreadcrumb, ro as addEventProcessor, sr as addGlobalEventProcessor, La as addIntegration, ba as addTracingExtensions, Du as breadcrumbsIntegration, pd as browserApiErrorsIntegration, sx as browserProfilingIntegration, Sl as browserTracingIntegration, Cy as captureConsoleIntegration, Nr as captureEvent, jr as captureException, Mr as captureMessage, $r as captureSession, Dd as captureUserFeedback, fu as chromeStackLineParser, qr as close, Pr as configureScope, mb as contextLinesIntegration, Gi as continueTrace, lo as createTransport, Jl as createUserFeedbackEnvelope, Ey as debugIntegration, ky as dedupeIntegration, yd as defaultIntegrations, tl as defaultRequestInstrumentationOptions, Su as defaultStackLineParsers, Cu as defaultStackParser, Zr as endSession, Hl as eventFromException, Ul as eventFromMessage, Fl as exceptionFromError, Ry as extraErrorDataIntegration, ki as extractTraceparentData, by as feedbackIntegration, Kr as flush, Cd as forceLoad, ns as functionToStringIntegration, hu as geckoStackLineParser, Wi as getActiveSpan, Oi as getActiveTransaction, P as getClient, I as getCurrentHub, F as getCurrentScope, bd as getDefaultIntegrations, Ei as getHubFromCarrier, I_ as getReplay, Pi as getSpanStatusFromHttpCode, qu as globalHandlersIntegration, Xy as httpClientIntegration, id as httpContextIntegration, Vo as inboundFiltersIntegration, xd as init, nl as instrumentOutgoingRequests, Yr as isInitialized, Jr as lastEventId, ld as linkedErrorsIntegration, wb as makeBrowserOfflineTransport, eu as makeFetchTransport, xi as makeMain, yo as makeMultiplexedTransport, nu as makeXHRTransport, vs as metrics, Io as moduleMetadataIntegration, wd as onLoad, ix as onProfilingStartRouteTransaction, yu as opera10StackLineParser, xu as opera11StackLineParser, Do as parameterize, Sv as replayCanvasIntegration, M_ as replayIntegration, Wy as reportingObserverIntegration, Ky as rewriteFramesIntegration, Kv as sendFeedback, Jy as sessionTimingIntegration, Ir as setContext, so as setCurrentClient, Rr as setExtra, Lr as setExtras, Ii as setHttpStatus, xa as setMeasurement, Br as setTag, zr as setTags, Vr as setUser, Sd as showReportDialog, Fi as spanStatusfromHttpCode, wl as startBrowserTracingNavigationSpan, Cl as startBrowserTracingPageLoadSpan, Ui as startInactiveSpan, Xr as startSession, Vi as startSpan, Hi as startSpanManual, Gr as startTransaction, Bi as trace, _u as winjsStackLineParser, Wr as withActiveSpan, Ur as withIsolationScope, Hr as withScope, Td as wrap };
