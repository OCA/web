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

const setHtml = (el, html) => {
    const s = childSpan(el);
    (s || el).innerHTML = html;
};

function normalizeValue(v) {
    if (v === null || v === undefined) return v; // Null/undefined
    const t = typeof v;
    if (t === "string" || t === "number" || t === "boolean") return v;
    if (Array.isArray(v) && v.length === 2 && typeof v[1] === "string") return v[0]; // M2o [id, name]
    if (t === "object") {
        if (typeof v.res_id === "number") return v.res_id; // M2o snapshot
        if (typeof v.id === "number") return v.id; // M2o env
        if (Array.isArray(v.res_ids)) return v.res_ids; // M2m
    }
    return undefined; // Ignore others (e.g., command lists)
}

function shrink(data) {
    const out = {};
    for (const [k, v] of Object.entries(data || {})) {
        const nv = normalizeValue(v);
        if (nv !== undefined) out[k] = nv;
    }
    return out;
}

const sliceBy = (obj, keys) =>
    keys.reduce((o, k) => (k in obj ? ((o[k] = obj[k]), o) : o), {});

const qsa = (el, sel) => Array.from(el ? el.querySelectorAll(sel) : []);

const bannersIn = (ctrl) =>
    qsa(root(ctrl), '.o_form_view div[role="status"][data-rule-id]');

const hasBanners = (ctrl) => bannersIn(ctrl).length > 0;

const triggerNames = (ctrl) => {
    const s = new Set();
    for (const el of bannersIn(ctrl))
        for (const p of el.dataset.triggerFields.split(",")) {
            const k = p.trim();
            if (k) s.add(k);
        }
    return Array.from(s);
};

async function refreshBanners(ctrl, extraChanges) {
    if (!alive(ctrl)) return;
    const st = ctrl.model && ctrl.handle ? ctrl.model.get(ctrl.handle) : null;
    const resId = st && st.res_id;
    const nodes = bannersIn(ctrl);
    if (!nodes.length) return;
    const snap = {...shrink(st && st.data), ...shrink(extraChanges)};
    const names = triggerNames(ctrl);
    const vals = !resId ? snap : names.length ? sliceBy(snap, names) : {};
    for (const el of nodes) {
        const ruleId = parseInt(el.dataset.ruleId, 10);
        const args = [ruleId, el.dataset.model, resId, vals];
        const r =
            (await rpc.query({
                model: "web.form.banner.rule",
                method: "compute_message",
                args: args,
            })) || {};
        if (!alive(ctrl)) return;
        // Replace only the alert class
        el.classList.remove("alert-info", "alert-warning", "alert-danger");
        el.classList.add("alert-" + r.severity);
        el.classList.toggle("o_invisible_modifier", !(r && r.visible));
        setHtml(el, r.html);
    }
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
        const names = triggerNames(this);
        const changed = (ev && ev.data && ev.data.changes) || {};
        const change_names = Object.keys(changed);
        if (!change_names.some((n) => names.includes(n))) return res;
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
