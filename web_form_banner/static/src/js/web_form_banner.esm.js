/** @odoo-module **/

// Copyright 2025 Quartile (https://www.quartile.co)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import FormController from "web.FormController";
import rpc from "web.rpc";

const root = (ctrl) => (ctrl && (ctrl.el || (ctrl.$el && ctrl.$el[0]))) || null;

const alive = (ctrl) => {
    const r = root(ctrl);
    return (
        r &&
        r.isConnected &&
        !(typeof ctrl.isDestroyed === "function" && ctrl.isDestroyed())
    );
};

const qsa = (el, sel) => Array.from(el ? el.querySelectorAll(sel) : []);

const first = (...args) => {
    for (let i = 0; i < args.length; i++) {
        const v = args[i];
        if (v !== null && v !== undefined && v !== "") return v;
    }
    return null;
};

const childSpan = (el) => {
    if (!el) return null;
    if (el.querySelector) {
        return el.querySelector(":scope > span") || null;
    }
    const c = el.firstElementChild;
    return c && c.tagName === "SPAN" ? c : null;
};

const after = (p, fn) => {
    if (p && typeof p.always === "function") {
        p.always(fn);
        return p;
    }
    return Promise.resolve(p).finally(fn);
};

const shrinkDraft = (d) =>
    Object.entries(d || {}).reduce((o, [k, v]) => {
        const t = typeof v;
        const isNullish = (x) => x === null || x === undefined;
        if (isNullish(v) || t === "string" || t === "number" || t === "boolean") {
            o[k] = v;
        } else if (
            (v && v.type === "record" && typeof v.res_id === "number") ||
            (v && typeof v.res_id === "number")
        ) {
            // Many2one (data snapshot shape)
            o[k] = v.res_id;
        } else if (v && typeof v === "object" && typeof v.id === "number") {
            // Many2one (pending change as {id, display_name})
            o[k] = v.id;
        } else if (Array.isArray(v) && v.length === 2 && typeof v[0] === "number") {
            // Many2one (pending change as [id, name])
            o[k] = v[0];
        } else if (
            Array.isArray(v) ||
            (v && (Array.isArray(v.data) || Array.isArray(v.res_ids)))
        ) {
            // Many2many (and possibly other x2many) values; let Python decide
            o[k] = v;
        }
        return o;
    }, {});

const bannersIn = (ctrl) =>
    qsa(root(ctrl), '.o_form_view div[role="alert"][data-rule-id]');

const hasBanners = (ctrl) => bannersIn(ctrl).length > 0;

const triggerSet = (ctrl) => {
    const set = Object.create(null);
    const els = bannersIn(ctrl);
    for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const raw = first(el.dataset.triggerFields, "");
        (raw || "").split(",").forEach((n) => {
            if (n) set[n.trim()] = true;
        });
    }
    return set;
};

// Pick only keys in `set` from `src`
const pickKeys = (src, set) => {
    const out = {};
    if (!src) return out;
    Object.keys(src).forEach((k) => {
        if (set[k]) out[k] = src[k];
    });
    return out;
};

async function refreshBanners(ctrl, extraChanges) {
    if (!alive(ctrl)) return;
    const st = ctrl.model && ctrl.handle ? ctrl.model.get(ctrl.handle) : null;
    const resId = st && st.res_id;
    const base = shrinkDraft(st && st.data) || {};
    const latest = shrinkDraft(extraChanges || {});
    const snap = Object.assign({}, base, latest);
    const tset = triggerSet(ctrl);
    const hasTriggers = Object.keys(tset).length > 0;
    const formVals = resId ? (hasTriggers ? pickKeys(snap, tset) : {}) : snap;

    const hideBanner = (el) => {
        el.style.display = "none";
        const sp = childSpan(el);
        if (sp) sp.innerHTML = "";
        else el.innerHTML = "";
    };

    const showBanner = (el, res) => {
        const sev = first(res.severity, el.dataset.defaultSeverity, "danger");
        const html = res.html || "";
        el.className = "o_form_banner alert alert-" + sev;
        const sp = childSpan(el);
        if (sp) sp.innerHTML = html;
        else el.innerHTML = html;
        el.style.display = "";
    };

    const updateEl = async (el) => {
        const ruleId = parseInt(first(el.dataset.ruleId, el.dataset.wfbRuleId), 10);
        const model = first(el.dataset.model, el.dataset.wfbModel, ctrl.modelName);
        const res =
            (await rpc.query({
                model: "web.form.banner.rule",
                method: "compute_message",
                args: [ruleId, model, resId, formVals],
            })) || {};
        if (!alive(ctrl)) return;
        if (!res.visible) return hideBanner(el);
        showBanner(el, res);
    };

    // Fire requests in parallel; resolve when all done
    await Promise.all(bannersIn(ctrl).map(updateEl));
}

function withRefresh(ctrl, superFn, args) {
    const p = superFn.apply(ctrl, args);
    return after(p, function () {
        refreshBanners(ctrl);
    });
}

FormController.include({
    start: function () {
        const p = this._super.apply(this, arguments);
        // Keep original Deferred/Promise for Odoo callers
        if (p && typeof p.always === "function") {
            p.always(() => refreshBanners(this));
        } else {
            Promise.resolve(p).then(() => refreshBanners(this));
        }
        return p;
    },
    reload: function () {
        return withRefresh(this, this._super, arguments);
    },
    saveRecord: function () {
        return withRefresh(this, this._super, arguments);
    },
    update: function () {
        return withRefresh(this, this._super, arguments);
    },
    // Onchange: refresh only when a declared trigger actually changed
    _onFieldChanged: function (ev) {
        const res = this._super.apply(this, arguments);
        if (!alive(this) || !hasBanners(this)) return res;
        const tset = triggerSet(this);
        if (!Object.keys(tset).length) return res;
        const changed = (ev && ev.data && ev.data.changes) || {};
        const names = Object.keys(changed);
        if (!names.some((n) => tset[n])) return res;
        // Defer one tick so x2many widgets commit their in-memory value first
        after(res, () => setTimeout(() => refreshBanners(this, changed), 0));
        return res;
    },
    activate: function () {
        const res = this._super.apply(this, arguments);
        if (hasBanners(this)) after(res, () => refreshBanners(this));
        return res;
    },
    on_attach_callback: function () {
        this._super.apply(this, arguments);
        setTimeout(() => refreshBanners(this));
    },
});
