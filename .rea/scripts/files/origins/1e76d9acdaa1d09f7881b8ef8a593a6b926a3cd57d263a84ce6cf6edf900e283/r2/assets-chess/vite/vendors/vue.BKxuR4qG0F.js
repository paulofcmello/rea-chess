import { $ as e, $n as t, $t as n, A as r, An as i, At as a, B as o, Bn as s, Bt as c, C as l, Cn as u, Ct as d, D as f, Dn as p, Dt as m, E as ee, En as te, Et as ne, F as re, Fn as h, Ft as ie, G as ae, Gn as oe, Gt as g, H as _, Hn as v, Ht as y, I as se, In as b, It as ce, J as le, Jn as ue, Jt as de, K as fe, Kn as pe, Kt as me, L as he, Ln as ge, Lt as _e, M as ve, Mn as ye, Mt as be, N as xe, Nn as Se, Nt as Ce, O as we, On as Te, Ot as x, P as Ee, Pn as S, Pt as De, Q as Oe, Qn as C, Qt as ke, R as Ae, Rn as w, Rt as je, S as Me, Sn as Ne, St as Pe, T as Fe, Tn as Ie, Tt as Le, U as Re, Un as ze, Ut as Be, V as Ve, Vn as T, Vt as He, W as Ue, Wn as We, Wt as Ge, X as Ke, Xn as qe, Xt as Je, Y as Ye, Yn as E, Yt as Xe, Z as Ze, Zn as D, Zt as Qe, _ as $e, _n as et, _t as tt, a as nt, an as rt, ar as it, at, b as ot, bn as st, bt as ct, c as lt, cn as ut, ct as dt, d as ft, dn as pt, dt as mt, en as ht, er as gt, et as _t, f as vt, fn as yt, ft as bt, g as xt, gn as St, gt as Ct, h as wt, hn as Tt, ht as Et, i as Dt, in as Ot, ir as kt, it as At, j as jt, jn as Mt, jt as Nt, k as Pt, kn as Ft, kt as It, l as Lt, ln as Rt, lt as zt, m as Bt, mn as Vt, mt as Ht, n as Ut, nn as Wt, nr as Gt, nt as Kt, o as qt, on as Jt, or as Yt, ot as Xt, p as Zt, pn as Qt, pt as $t, q as en, qn as O, qt as tn, r as nn, rn, rr as an, rt as on, s as sn, sn as cn, st as ln, t as un, tn as dn, tr as fn, tt as pn, u as mn, un as hn, ut as gn, v as _n, vn, vt as yn, w as bn, wn as xn, wt as Sn, x as Cn, xn as wn, xt as Tn, y as En, yn as Dn, yt as On, z as k, zn as kn, zt as An } from "./runtime-core.esm-bundler.CUagP75OtQ.js";
//#region node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
var A = void 0, jn = typeof window < "u" && window.trustedTypes;
if (jn) try {
	A = /* @__PURE__ */ jn.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Mn = A ? (e) => A.createHTML(e) : (e) => e, Nn = "http://www.w3.org/2000/svg", Pn = "http://www.w3.org/1998/Math/MathML", j = typeof document < "u" ? document : null, Fn = j && /* @__PURE__ */ j.createElement("template"), In = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? j.createElementNS(Nn, e) : t === "mathml" ? j.createElementNS(Pn, e) : n ? j.createElement(e, { is: n }) : j.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => j.createTextNode(e),
	createComment: (e) => j.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => j.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), !(i === a || !(i = i.nextSibling)););
		else {
			Fn.innerHTML = Mn(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Fn.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, M = "transition", N = "animation", P = /* @__PURE__ */ Symbol("_vtc"), Ln = {
	name: String,
	type: String,
	css: {
		type: Boolean,
		default: !0
	},
	duration: [
		String,
		Number,
		Object
	],
	enterFromClass: String,
	enterActiveClass: String,
	enterToClass: String,
	appearFromClass: String,
	appearActiveClass: String,
	appearToClass: String,
	leaveFromClass: String,
	leaveActiveClass: String,
	leaveToClass: String
}, Rn = /* @__PURE__ */ b({}, Ut, Ln), zn = /* @__PURE__ */ ((e) => (e.displayName = "Transition", e.props = Rn, e))((e, { slots: t }) => _(un, Vn(e), t)), F = (e, t = []) => {
	T(e) ? e.forEach((e) => e(...t)) : e && e(...t);
}, Bn = (e) => e ? T(e) ? e.some((e) => e.length > 1) : e.length > 1 : !1;
function Vn(e) {
	let t = {};
	for (let n in e) n in Ln || (t[n] = e[n]);
	if (e.css === !1) return t;
	let { name: n = "v", type: r, duration: i, enterFromClass: a = `${n}-enter-from`, enterActiveClass: o = `${n}-enter-active`, enterToClass: s = `${n}-enter-to`, appearFromClass: c = a, appearActiveClass: l = o, appearToClass: u = s, leaveFromClass: d = `${n}-leave-from`, leaveActiveClass: f = `${n}-leave-active`, leaveToClass: p = `${n}-leave-to` } = e, m = Hn(i), ee = m && m[0], te = m && m[1], { onBeforeEnter: ne, onEnter: re, onEnterCancelled: h, onLeave: ie, onLeaveCancelled: ae, onBeforeAppear: oe = ne, onAppear: g = re, onAppearCancelled: _ = h } = t, v = (e, t, n, r) => {
		e._enterCancelled = r, L(e, t ? u : s), L(e, t ? l : o), n && n();
	}, y = (e, t) => {
		e._isLeaving = !1, L(e, d), L(e, p), L(e, f), t && t();
	}, se = (e) => (t, n) => {
		let i = e ? g : re, o = () => v(t, e, n);
		F(i, [t, o]), Wn(() => {
			L(t, e ? c : a), I(t, e ? u : s), Bn(i) || Kn(t, r, ee, o);
		});
	};
	return b(t, {
		onBeforeEnter(e) {
			F(ne, [e]), I(e, a), I(e, o);
		},
		onBeforeAppear(e) {
			F(oe, [e]), I(e, c), I(e, l);
		},
		onEnter: se(!1),
		onAppear: se(!0),
		onLeave(e, t) {
			e._isLeaving = !0;
			let n = () => y(e, t);
			I(e, d), e._enterCancelled ? (I(e, f), Xn(e)) : (Xn(e), I(e, f)), Wn(() => {
				e._isLeaving && (L(e, d), I(e, p), Bn(ie) || Kn(e, r, te, n));
			}), F(ie, [e, n]);
		},
		onEnterCancelled(e) {
			v(e, !1, void 0, !0), F(h, [e]);
		},
		onAppearCancelled(e) {
			v(e, !0, void 0, !0), F(_, [e]);
		},
		onLeaveCancelled(e) {
			y(e), F(ae, [e]);
		}
	});
}
function Hn(e) {
	if (e == null) return null;
	if (We(e)) return [Un(e.enter), Un(e.leave)];
	{
		let t = Un(e);
		return [t, t];
	}
}
function Un(e) {
	return Yt(e);
}
function I(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.add(t)), (e[P] || (e[P] = /* @__PURE__ */ new Set())).add(t);
}
function L(e, t) {
	t.split(/\s+/).forEach((t) => t && e.classList.remove(t));
	let n = e[P];
	n && (n.delete(t), n.size || (e[P] = void 0));
}
function Wn(e) {
	requestAnimationFrame(() => {
		requestAnimationFrame(e);
	});
}
var Gn = 0;
function Kn(e, t, n, r) {
	let i = e._endId = ++Gn, a = () => {
		i === e._endId && r();
	};
	if (n != null) return setTimeout(a, n);
	let { type: o, timeout: s, propCount: c } = qn(e, t);
	if (!o) return r();
	let l = o + "end", u = 0, d = () => {
		e.removeEventListener(l, f), a();
	}, f = (t) => {
		t.target === e && ++u >= c && d();
	};
	setTimeout(() => {
		u < c && d();
	}, s + 1), e.addEventListener(l, f);
}
function qn(e, t) {
	let n = window.getComputedStyle(e), r = (e) => (n[e] || "").split(", "), i = r(`${M}Delay`), a = r(`${M}Duration`), o = Jn(i, a), s = r(`${N}Delay`), c = r(`${N}Duration`), l = Jn(s, c), u = null, d = 0, f = 0;
	t === M ? o > 0 && (u = M, d = o, f = a.length) : t === N ? l > 0 && (u = N, d = l, f = c.length) : (d = Math.max(o, l), u = d > 0 ? o > l ? M : N : null, f = u ? u === M ? a.length : c.length : 0);
	let p = u === M && /\b(?:transform|all)(?:,|$)/.test(r(`${M}Property`).toString());
	return {
		type: u,
		timeout: d,
		propCount: f,
		hasTransform: p
	};
}
function Jn(e, t) {
	for (; e.length < t.length;) e = e.concat(e);
	return Math.max(...t.map((t, n) => Yn(t) + Yn(e[n])));
}
function Yn(e) {
	return e === "auto" ? 0 : Number(e.slice(0, -1).replace(",", ".")) * 1e3;
}
function Xn(e) {
	return (e ? e.ownerDocument : document).body.offsetHeight;
}
function Zn(e, t, n) {
	let r = e[P];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var R = /* @__PURE__ */ Symbol("_vod"), Qn = /* @__PURE__ */ Symbol("_vsh"), $n = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[R] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : z(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), z(e, !0), r.enter(e)) : r.leave(e, () => {
			z(e, !1);
		}) : z(e, t));
	},
	beforeUnmount(e, { value: t }) {
		z(e, t);
	}
};
function z(e, t) {
	e.style.display = t ? e[R] : "none", e[Qn] = !t;
}
function er() {
	$n.getSSRProps = ({ value: e }) => {
		if (!e) return { style: { display: "none" } };
	};
}
var tr = /* @__PURE__ */ Symbol("");
function nr(e) {
	let t = k();
	if (!t) return;
	let n = t.ut = (n = e(t.proxy)) => {
		Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach((e) => B(e, n));
	}, r = () => {
		let r = e(t.proxy);
		t.ce ? B(t.ce, r) : rr(t.subTree, r), n(r);
	};
	ln(() => {
		ct(r);
	}), gn(() => {
		g(r, Se, { flush: "post" });
		let e = new MutationObserver(r);
		e.observe(t.subTree.el.parentNode, { childList: !0 }), Ht(() => e.disconnect());
	});
}
function rr(e, t) {
	if (e.shapeFlag & 128) {
		let n = e.suspense;
		e = n.activeBranch, n.pendingBranch && !n.isHydrating && n.effects.push(() => {
			rr(n.activeBranch, t);
		});
	}
	for (; e.component;) e = e.component.subTree;
	if (e.shapeFlag & 1 && e.el) B(e.el, t);
	else if (e.type === sn) e.children.forEach((e) => rr(e, t));
	else if (e.type === Lt) {
		let { el: n, anchor: r } = e;
		for (; n && (B(n, t), n !== r);) n = n.nextSibling;
	}
}
function B(e, t) {
	if (e.nodeType === 1) {
		let n = e.style, r = "";
		for (let e in t) {
			let i = fn(t[e]);
			n.setProperty(`--${e}`, i), r += `--${e}: ${i};`;
		}
		n[tr] = r;
	}
}
var ir = /(?:^|;)\s*display\s*:/;
function ar(e, t, n) {
	let r = e.style, i = E(n), a = !1;
	if (n && !i) {
		if (t) if (E(t)) for (let e of t.split(";")) {
			let t = e.slice(0, e.indexOf(":")).trim();
			n[t] ?? H(r, t, "");
		}
		else for (let e in t) n[e] ?? H(r, e, "");
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? H(r, i, "") : lr(e, i, !E(t) && t ? t[i] : void 0, o) || H(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[tr];
			e && (n += ";" + e), r.cssText = n, a = ir.test(n);
		}
	} else t && e.removeAttribute("style");
	R in e && ((!i || t !== n) && (e[R] = a ? r.display : ""), e[Qn] && (r.display = "none"));
}
var V = /\s*!important$/;
function H(e, t, n) {
	if (T(n)) n.forEach((n) => H(e, t, n));
	else if (n ??= "", t.startsWith("--")) V.test(n) ? e.setProperty(t, n.replace(V, ""), "important") : e.setProperty(t, n);
	else {
		let r = cr(e, t);
		V.test(n) ? e.setProperty(w(r), n.replace(V, ""), "important") : e[r] = n;
	}
}
var or = [
	"Webkit",
	"Moz",
	"ms"
], sr = {};
function cr(e, t) {
	let n = sr[t];
	if (n) return n;
	let r = S(t);
	if (r !== "filter" && r in e) return sr[t] = r;
	r = h(r);
	for (let n = 0; n < or.length; n++) {
		let i = or[n] + r;
		if (i in e) return sr[t] = i;
	}
	return t;
}
function lr(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && E(r) && n === r;
}
var ur = "http://www.w3.org/1999/xlink";
function dr(e, t, n, r, i, a = ue(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ur, t.slice(6, t.length)) : e.setAttributeNS(ur, t, n) : n == null || a && !kn(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : qe(n) ? String(n) : n);
}
function fr(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Mn(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		(r !== i || !("_value" in e)) && (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = kn(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function U(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function pr(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var mr = /* @__PURE__ */ Symbol("_vei");
function hr(e, t, n, r, i = null) {
	let a = e[mr] || (e[mr] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = vr(t);
		r ? U(e, n, a[t] = Sr(r, i), s) : o && (pr(e, n, o, s), a[t] = void 0);
	}
}
var gr = /(Once|Passive|Capture)$/, _r = /^on:?(?:Once|Passive|Capture)$/;
function vr(e) {
	let t, n;
	for (; (n = e.match(gr)) && !_r.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : w(e.slice(2)), t];
}
var yr = 0, br = /* @__PURE__ */ Promise.resolve(), xr = () => yr ||= (br.then(() => yr = 0), Date.now());
function Sr(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (T(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && Bt(e, t, 5, a);
			}
		} else Bt(r, t, 5, [e]);
	};
	return n.value = e, n.attached = xr(), n;
}
var Cr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, wr = (e, t, n, r, i, a) => {
	let o = i === "svg";
	t === "class" ? Zn(e, r, o) : t === "style" ? ar(e, n, r) : oe(t) ? ze(t) || hr(e, t, n, r, a) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : Tr(e, t, r, o)) ? (fr(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && dr(e, t, r, o, a, t !== "value")) : e._isVueCE && (Er(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !E(r))) ? fr(e, S(t), r, a, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), dr(e, t, r, o));
};
function Tr(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && Cr(t) && v(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return Cr(t) && E(n) ? !1 : t in e;
}
function Er(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = S(t);
	return Array.isArray(n) ? n.some((e) => S(e) === r) : Object.keys(n).some((e) => S(e) === r);
}
var Dr = {};
// @__NO_SIDE_EFFECTS__
function Or(e, t, n) {
	let r = jt(e, t);
	pe(r) && (r = b({}, r, t));
	class i extends jr {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var kr = /* @__NO_SIDE_EFFECTS__ */ ((e, t) => /* @__PURE__ */ Or(e, t, vi)), Ar = typeof HTMLElement < "u" ? HTMLElement : class {}, jr = class e extends Ar {
	constructor(e, t = {}, n = $) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== $ ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(b({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
	}
	connectedCallback() {
		if (!this.isConnected) return;
		!this.shadowRoot && !this._resolved && this._parseSlots(), this._connected = !0;
		let t = this;
		for (; t &&= t.assignedSlot || t.parentNode || t.host;) if (t instanceof e) {
			this._parent = t;
			break;
		}
		this._instance || (this._resolved ? this._mount(this._def) : t && t._pendingResolve ? this._pendingResolve = t._pendingResolve.then(() => {
			if (this._pendingResolve = void 0, this.isConnected) return this._resolveDef();
		}) : this._resolveDef());
	}
	_setParent(e = this._parent) {
		e && (this._instance.parent = e._instance, this._inheritParentContext(e));
	}
	_inheritParentContext(e = this._parent) {
		e && this._app && Object.setPrototypeOf(this._app._context.provides, e._instance.provides);
	}
	disconnectedCallback() {
		this._connected = !1, on(() => {
			this._connected || (this._ob &&= (this._ob.disconnect(), null), this._app && this._app.unmount(), this._instance && (this._instance.ce = void 0), this._app = this._instance = null, this._teleportTargets &&= (this._teleportTargets.clear(), void 0));
		});
	}
	_processMutations(e) {
		for (let t of e) this._setAttr(t.attributeName);
	}
	_resolveDef() {
		if (this._pendingResolve) return this._pendingResolve;
		for (let e = 0; e < this.attributes.length; e++) this._setAttr(this.attributes[e].name);
		this._ob = new MutationObserver(this._processMutations.bind(this)), this._ob.observe(this, { attributes: !0 });
		let e = (e, t = !1) => {
			this._resolved = !0, this._pendingResolve = void 0;
			let { props: n, styles: r } = e, i;
			if (n && !T(n)) for (let e in n) {
				let t = n[e];
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = Yt(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[S(e)] = !0);
			}
			this._numberProps = i, this._resolveProps(e), this.shadowRoot && this._applyStyles(r), this._connected && this._mount(e);
		}, t = this._def.__asyncLoader;
		if (t) return this._pendingResolve = t().then((t) => {
			t.configureApp = this._def.configureApp, e(this._def = t, !0);
		}), this._pendingResolve;
		e(this._def);
	}
	_mount(e) {
		__VUE_PROD_DEVTOOLS__ && !e.name && (e.name = "VueElement"), this._app = this._createApp(e), this._inheritParentContext(), e.configureApp && e.configureApp(this._app), this._app._ceVNode = this._createVNode(), this._app.mount(this._root);
		let t = this._instance && this._instance.exposed;
		if (t) for (let e in t) ge(this, e) || Object.defineProperty(this, e, { get: () => Mt(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = T(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(S)) Object.defineProperty(this, e, {
			get() {
				return this._getProp(e);
			},
			set(t) {
				this._setProp(e, t, !0, !this._patching);
			}
		});
	}
	_setAttr(e) {
		if (e.startsWith("data-v-")) return;
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : Dr, r = S(e);
		t && this._numberProps && this._numberProps[r] && (n = Yt(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === Dr ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(w(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(w(e), t + "") : t || this.removeAttribute(w(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), gi(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = Pt(this._def, b(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, pe(t[0]) ? b({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), w(e) !== e && t(w(e), n);
			}, this._setParent();
		}), t;
	}
	_applyStyles(e, t, n) {
		if (!e) return;
		if (t) {
			if (t === this._def || this._styleChildren.has(t)) return;
			this._styleChildren.add(t);
		}
		let r = this._nonce, i = this.shadowRoot, a = n ? this._getStyleAnchor(n) || this._getStyleAnchor(this._def) : this._getRootStyleInsertionAnchor(i), o = null;
		for (let s = e.length - 1; s >= 0; s--) {
			let c = document.createElement("style");
			r && c.setAttribute("nonce", r), c.textContent = e[s], i.insertBefore(c, o || a), o = c, s === 0 && (n || this._styleAnchors.set(this._def, c), t && this._styleAnchors.set(t, c));
		}
	}
	_getStyleAnchor(e) {
		if (!e) return null;
		let t = this._styleAnchors.get(e);
		return t && t.parentNode === this.shadowRoot ? t : (t && this._styleAnchors.delete(e), null);
	}
	_getRootStyleInsertionAnchor(e) {
		for (let t = 0; t < e.childNodes.length; t++) {
			let n = e.childNodes[t];
			if (!(n instanceof HTMLStyleElement)) return n;
		}
		return null;
	}
	_parseSlots() {
		let e = this._slots = {}, t;
		for (; t = this.firstChild;) {
			let n = t.nodeType === 1 && t.getAttribute("slot") || "default";
			(e[n] || (e[n] = [])).push(t), this.removeChild(t);
		}
	}
	_renderSlots() {
		let e = this._getSlots(), t = this._instance.type.__scopeId;
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = r.getAttribute("name") || "default", a = this._slots[i], o = r.parentNode;
			if (a) for (let e of a) {
				if (t && e.nodeType === 1) {
					let n = t + "-s", r = document.createTreeWalker(e, 1);
					e.setAttribute(n, "");
					let i;
					for (; i = r.nextNode();) i.setAttribute(n, "");
				}
				o.insertBefore(e, r);
			}
			else for (; r.firstChild;) o.insertBefore(r.firstChild, r);
			o.removeChild(r);
		}
	}
	_getSlots() {
		let e = [this];
		this._teleportTargets && e.push(...this._teleportTargets);
		let t = /* @__PURE__ */ new Set();
		for (let n of e) {
			let e = n.querySelectorAll("slot");
			for (let n = 0; n < e.length; n++) t.add(e[n]);
		}
		return Array.from(t);
	}
	_injectChildStyle(e, t) {
		this._applyStyles(e.styles, e, t);
	}
	_beginPatch() {
		this._patching = !0, this._dirty = !1;
	}
	_endPatch() {
		this._patching = !1, this._dirty && this._instance && this._update();
	}
	_hasShadowRoot() {
		return this._def.shadowRoot !== !1;
	}
	_removeChildStyle(e) {}
};
function Mr(e) {
	let t = k();
	return t && t.ce || null;
}
function Nr() {
	let e = Mr();
	return e && e.shadowRoot;
}
function Pr(e = "$style") {
	{
		let t = k();
		if (!t) return ye;
		let n = t.type.__cssModules;
		return n && n[e] || ye;
	}
}
var Fr = /* @__PURE__ */ new WeakMap(), Ir = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ Symbol("_moveCb"), Lr = /* @__PURE__ */ Symbol("_enterCb"), Rr = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ ((e) => (delete e.props.mode, e))({
	name: "TransitionGroup",
	props: /* @__PURE__ */ b({}, Rn, {
		tag: String,
		moveClass: String
	}),
	setup(e, { slots: t }) {
		let n = k(), r = y(), i, a, s, c, l = () => (c === void 0 && (c = i.length > 0 && qr(i[0].el, n.vnode.el, Vr(e))), c);
		return Et(() => {
			if (Rr.delete(n), !l()) {
				i = [], s = void 0;
				return;
			}
			let t = Vr(e);
			i.forEach(Br);
			let r = s && Kr(s, n.vnode.el);
			s = void 0, i.forEach((e) => Hr(e, r));
			let a = i.filter(Ur);
			Xn(n.vnode.el), a.forEach((e) => {
				let n = e.el, r = n.style;
				I(n, t), r.transform = r.webkitTransform = r.transitionDuration = "";
				let i = n[W] = (e) => {
					e && e.target !== n || (!e || e.propertyName.endsWith("transform")) && (n.removeEventListener("transitionend", i), n[W] = null, L(n, t));
				};
				n.addEventListener("transitionend", i);
			}), i = [];
		}), () => {
			let u = te(e), d = Vn(u), f = u.tag || sn;
			if (i = [], c = void 0, a) for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.el && t.el instanceof Element && !t.el[Qn] && (i.push(t), Nt(t, x(t, d, r, n)), Fr.set(t, G(t.el)));
			}
			a = t.default ? o(t.default()) : [];
			for (let e = 0; e < a.length; e++) {
				let t = a[e];
				t.key != null && Nt(t, x(t, d, r, n));
			}
			return i.length && (s = Wr(n), Rr.set(n, l)), Pt(f, null, a);
		};
	}
});
function Br(e) {
	let t = e.el;
	t[W] && t[W](), t[Lr] && t[Lr]();
}
function Vr(e) {
	return e.moveClass || `${e.name || "v"}-move`;
}
function Hr(e, t) {
	Ir.set(e, G(e.el, t));
}
function Ur(e) {
	let t = Fr.get(e), n = Ir.get(e), r = t.left - n.left, i = t.top - n.top;
	if (r || i) {
		let t = e.el, n = t.style, a = t.getBoundingClientRect(), o = 1, s = 1;
		return t.offsetWidth && (o = a.width / t.offsetWidth), t.offsetHeight && (s = a.height / t.offsetHeight), (!Number.isFinite(o) || o === 0) && (o = 1), (!Number.isFinite(s) || s === 0) && (s = 1), Math.abs(o - 1) < .01 && (o = 1), Math.abs(s - 1) < .01 && (s = 1), n.transform = n.webkitTransform = `translate(${r / o}px,${i / s}px)`, n.transitionDuration = "0s", e;
	}
}
function G(e, t) {
	let n = e.getBoundingClientRect();
	return {
		left: n.left - (t ? t.left : 0),
		top: n.top - (t ? t.top : 0)
	};
}
function Wr(e) {
	let t;
	for (let n = e.parent; n; n = n.parent) {
		let r = Rr.get(n);
		if (r) {
			let i = Gr(n.vnode.el, e.vnode.el);
			i && (t ||= []).push(b(G(i), {
				item: i,
				willMove: r
			}));
		}
	}
	return t;
}
function Gr(e, t) {
	let n = e.nodeType === 1 ? e : e.parentNode;
	for (; t && t.parentNode !== n;) t = t.parentNode;
	if (t && t.nodeType === 1) return t;
}
function Kr(e, t) {
	let n = e.find((e) => e.willMove() && e.item.contains(t));
	return n && G(n.item, n);
}
function qr(e, t, n) {
	let r = e.cloneNode(), i = e[P];
	i && i.forEach((e) => {
		e.split(/\s+/).forEach((e) => e && r.classList.remove(e));
	}), n.split(/\s+/).forEach((e) => e && r.classList.add(e)), r.style.display = "none";
	let a = t.nodeType === 1 ? t : t.parentNode;
	a.appendChild(r);
	let { hasTransform: o } = qn(r);
	return a.removeChild(r), o;
}
var K = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return T(t) ? (e) => s(t, e) : t;
};
function Jr(e) {
	e.target.composing = !0;
}
function Yr(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var q = /* @__PURE__ */ Symbol("_assign"), J = /* @__PURE__ */ Symbol("_initialValue");
function Xr(e, n, r) {
	return n && (e = e.trim()), r && (e = t(e)), e;
}
var Y = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[J] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[J] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[q] = K(i);
		let a = r || i.props && i.props.type === "number";
		U(e, t ? "change" : "input", (t) => {
			t.target.composing || e[q](Xr(e.value, n, a));
		}), (n || a) && U(e, "change", () => {
			e.value = Xr(e.value, n, a);
		}), t || (U(e, "compositionstart", Jr), U(e, "compositionend", Yr), U(e, "change", Yr));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[J];
		delete e[J], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[q](Xr(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: n, oldValue: r, modifiers: { lazy: i, trim: a, number: o } }, s) {
		if (e[q] = K(s), e.composing) return;
		let c = (o || e.type === "number") && !/^0\d/.test(e.value) ? t(e.value) : e.value, l = n ?? "";
		if (c === l) return;
		let u = e.getRootNode();
		(u instanceof Document || u instanceof ShadowRoot) && u.activeElement === e && e.type !== "range" && (i && n === r || a && e.value.trim() === l) || (e.value = l);
	}
}, Zr = {
	deep: !0,
	created(e, t, n) {
		e[q] = K(n), U(e, "change", () => {
			let t = e._modelValue, n = X(e), r = e.checked, i = e[q];
			if (T(t)) {
				let e = C(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (O(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(ri(e, r));
		});
	},
	mounted: Qr,
	beforeUpdate(e, t, n) {
		e[q] = K(n), Qr(e, t, n);
	}
};
function Qr(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (T(t)) i = C(t, r.props.value) > -1;
	else if (O(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = D(t, ri(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var $r = {
	created(e, { value: t }, n) {
		e.checked = D(t, n.props.value), e[q] = K(n), U(e, "change", () => {
			e[q](X(e));
		});
	},
	beforeUpdate(e, { value: t, oldValue: n }, r) {
		e[q] = K(r), t !== n && (e.checked = D(t, r.props.value));
	}
}, ei = {
	deep: !0,
	created(e, { value: n, modifiers: { number: r } }, i) {
		e._modelValue = n, U(e, "change", () => {
			let n = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => r ? t(X(e)) : X(e)), i = e.multiple, a = i ? O(e._modelValue) ? new Set(n) : n : n[0], o = e._pendingValue = [i, i ? T(a) ? n.slice() : n : a];
			try {
				e[q](a);
			} finally {
				on(() => {
					e._pendingValue === o && (e._pendingValue = void 0);
				});
			}
		}), e[q] = K(i);
	},
	mounted(e, { value: t }) {
		ni(e, t);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[q] = K(n);
	},
	updated(e, { value: t }) {
		let n = e._pendingValue;
		e._pendingValue = void 0, (!n || n[0] !== e.multiple || !ti(t, n[1], n[0])) && ni(e, t);
	}
};
function ti(e, t, n) {
	if (!n || T(e)) return D(e, t);
	if (O(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function ni(e, t) {
	let n = e.multiple, r = T(t);
	if (!(n && !r && !O(t))) {
		for (let i = 0, a = e.options.length; i < a; i++) {
			let a = e.options[i], o = X(a);
			if (n) if (r) {
				let e = typeof o;
				e === "string" || e === "number" ? a.selected = t.some((e) => String(e) === String(o)) : a.selected = C(t, o) > -1;
			} else a.selected = t.has(o);
			else if (D(X(a), t)) {
				e.selectedIndex !== i && (e.selectedIndex = i);
				return;
			}
		}
		!n && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function X(e) {
	return "_value" in e ? e._value : e.value;
}
function ri(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var ii = {
	created(e, t, n) {
		Z(e, t, n, null, "created");
	},
	mounted(e, t, n) {
		Z(e, t, n, null, "mounted");
	},
	beforeUpdate(e, t, n, r) {
		Z(e, t, n, r, "beforeUpdate");
	},
	updated(e, t, n, r) {
		Z(e, t, n, r, "updated");
	}
};
function ai(e, t) {
	switch (e) {
		case "SELECT": return ei;
		case "TEXTAREA": return Y;
		default: switch (t) {
			case "checkbox": return Zr;
			case "radio": return $r;
			default: return Y;
		}
	}
}
function Z(e, t, n, r, i) {
	let a = ai(e.tagName, n.props && n.props.type)[i];
	a && a(e, t, n, r);
}
function oi() {
	Y.getSSRProps = ({ value: e }) => ({ value: e }), $r.getSSRProps = ({ value: e }, t) => {
		if (t.props && D(t.props.value, e)) return { checked: !0 };
	}, Zr.getSSRProps = ({ value: e }, t) => {
		if (T(e)) {
			if (t.props && C(e, t.props.value) > -1) return { checked: !0 };
		} else if (O(e)) {
			if (t.props && e.has(t.props.value)) return { checked: !0 };
		} else if (e) return { checked: !0 };
	}, ii.getSSRProps = (e, t) => {
		if (typeof t.type != "string") return;
		let n = ai(t.type.toUpperCase(), t.props && t.props.type);
		if (n.getSSRProps) return n.getSSRProps(e, t);
	};
}
var si = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], ci = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => si.some((n) => e[`${n}Key`] && !t.includes(n))
}, li = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = ci[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, ui = {
	esc: "escape",
	space: " ",
	up: "arrow-up",
	left: "arrow-left",
	right: "arrow-right",
	down: "arrow-down",
	delete: "backspace"
}, di = (e, t) => {
	let n = e._withKeys ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n) => {
		if (!("key" in n)) return;
		let r = w(n.key);
		if (t.some((e) => e === r || ui[e] === r)) return e(n);
	}));
}, fi = /* @__PURE__ */ b({ patchProp: wr }, In), Q, pi = !1;
function mi() {
	return Q ||= Fe(fi);
}
function hi() {
	return Q = pi ? Q : l(fi), pi = !0, Q;
}
var gi = ((...e) => {
	mi().render(...e);
}), _i = ((...e) => {
	hi().hydrate(...e);
}), $ = ((...e) => {
	let t = mi().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = bi(e);
		if (!r) return;
		let i = t._component;
		!v(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, yi(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
}), vi = ((...e) => {
	let t = hi().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let t = bi(e);
		if (t) return n(t, !0, yi(t));
	}, t;
});
function yi(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function bi(e) {
	return E(e) ? document.querySelector(e) : e;
}
var xi = !1, Si = () => {
	xi || (xi = !0, oi(), er());
}, Ci = () => {};
//#endregion
export { un as BaseTransition, Ut as BaseTransitionPropsValidators, nn as Comment, Dt as DeprecationTypes, dn as EffectScope, nt as ErrorCodes, qt as ErrorTypeStrings, sn as Fragment, lt as KeepAlive, Wt as ReactiveEffect, Lt as Static, mn as Suspense, ft as Teleport, vt as Text, rn as TrackOpTypes, zn as Transition, zr as TransitionGroup, Ot as TriggerOpTypes, jr as VueElement, Zt as assertNumber, Bt as callWithAsyncErrorHandling, wt as callWithErrorHandling, S as camelize, h as capitalize, xt as cloneVNode, $e as compatUtils, Ci as compile, _n as computed, $ as createApp, ot as createBlock, Cn as createCommentVNode, Me as createElementBlock, En as createElementVNode, l as createHydrationRenderer, bn as createPropsRestProxy, Fe as createRenderer, vi as createSSRApp, ee as createSlots, f as createStaticVNode, we as createTextVNode, Pt as createVNode, rt as customRef, r as defineAsyncComponent, jt as defineComponent, Or as defineCustomElement, ve as defineEmits, xe as defineExpose, Ee as defineModel, re as defineOptions, se as defineProps, kr as defineSSRCustomElement, he as defineSlots, Ae as devtools, Jt as effect, cn as effectScope, k as getCurrentInstance, ut as getCurrentScope, Rt as getCurrentWatcher, o as getTransitionRawChildren, Ve as guardReactiveProps, _ as h, Re as handleError, Ue as hasInjectionContext, _i as hydrate, ae as hydrateOnIdle, fe as hydrateOnInteraction, en as hydrateOnMediaQuery, le as hydrateOnVisible, Ye as initCustomFormatter, Si as initDirectivesForSSR, Ke as inject, Ze as isMemoSame, hn as isProxy, pt as isReactive, yt as isReadonly, Qt as isRef, Oe as isRuntimeOnly, Vt as isShallow, e as isVNode, Tt as markRaw, _t as mergeDefaults, pn as mergeModels, Kt as mergeProps, on as nextTick, In as nodeOps, gt as normalizeClass, Gt as normalizeProps, an as normalizeStyle, At as onActivated, at as onBeforeMount, Xt as onBeforeUnmount, ln as onBeforeUpdate, dt as onDeactivated, zt as onErrorCaptured, gn as onMounted, mt as onRenderTracked, bt as onRenderTriggered, St as onScopeDispose, $t as onServerPrefetch, Ht as onUnmounted, Et as onUpdated, et as onWatcherCleanup, Ct as openBlock, wr as patchProp, tt as popScopeId, yn as provide, vn as proxyRefs, On as pushScopeId, ct as queuePostFlushCb, Dn as reactive, st as readonly, wn as ref, Tn as registerRuntimeCompiler, gi as render, Pe as renderList, d as renderSlot, Sn as resolveComponent, Le as resolveDirective, ne as resolveDynamicComponent, m as resolveFilter, x as resolveTransitionHooks, It as setBlockTracking, a as setDevtoolsHook, Nt as setTransitionHooks, Ne as shallowReactive, u as shallowReadonly, xn as shallowRef, be as ssrContextKey, Ce as ssrUtils, Ie as stop, kt as toDisplayString, it as toHandlerKey, De as toHandlers, te as toRaw, p as toRef, Te as toRefs, Ft as toValue, ie as transformVNodeArgs, i as triggerRef, Mt as unref, ce as useAttrs, Pr as useCssModule, nr as useCssVars, Mr as useHost, _e as useId, je as useModel, An as useSSRContext, Nr as useShadowRoot, c as useSlots, He as useTemplateRef, y as useTransitionState, Zr as vModelCheckbox, ii as vModelDynamic, $r as vModelRadio, ei as vModelSelect, Y as vModelText, $n as vShow, Be as version, Ge as warn, g as watch, me as watchEffect, tn as watchPostEffect, de as watchSyncEffect, Xe as withAsyncContext, Je as withCtx, Qe as withDefaults, ke as withDirectives, di as withKeys, n as withMemo, li as withModifiers, ht as withScopeId };
