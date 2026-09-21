/** @odoo-module **/
// Copyright 2025 Quartile (https://www.quartile.co)
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {patch} from "@web/core/utils/patch";
import {onMounted, onPatched, onWillUnmount} from "@odoo/owl";
import {FormController} from "@web/views/form/form_controller";

const recRoot = (c) => (c && c.model && c.model.root) || null;
const childSpan = (el) => {
    try {
        return (el && el.querySelector(":scope > span")) || null;
    } catch {}
    const f = el && el.firstElementChild;
    return f && f.tagName === "SPAN" ? f : null;
};
const setHtml = (el, html) => {
    const s = childSpan(el);
    (s || el).innerHTML = html;
};
const safe = async (fn, fb) => {
    try {
        return await fn();
    } catch {}
    return fb;
};

function normalizeValue(v) {
    if (v === null || v === undefined) return v; // Null/undefined
    const t = typeof v;
    if (t === "string" || t === "number" || t === "boolean") return v;
    if (Array.isArray(v) && v.length === 2 && typeof v[1] === "string") return v[0]; // M2o [id, name]
    if (t === "object") {
        if (typeof v.res_id === "number") return v.res_id; // M2o snapshot
        if (typeof v.id === "number") return v.id; // M2o env
        if (Array.isArray(v.resIds)) return v.resIds; // M2m
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

const bannersIn = (ctrl) => {
    const r = recRoot(ctrl),
        m = r && r.resModel;
    if (!m) return [];
    return Array.from(document.querySelectorAll(".o_form_view [data-rule-id]")).filter(
        (el) => el.dataset.model === m
    );
};
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
    const seq = (ctrl.__wfbSeq = (ctrl.__wfbSeq || 0) + 1);
    const rec = recRoot(ctrl);
    if (!rec) return;
    await safe(() => rec.askChanges());
    const nodes = bannersIn(ctrl);
    if (!nodes.length) return;
    const snap = {...shrink(rec.data), ...shrink(extraChanges)};
    const names = triggerNames(ctrl);
    const vals = !rec.resId ? snap : names.length ? sliceBy(snap, names) : {};
    const orm = ctrl.env.services.orm;
    for (const el of nodes) {
        const ruleId = parseInt(el.dataset.ruleId, 10);
        const args = [ruleId, el.dataset.model, rec.resId, vals];
        const r = await safe(
            () => orm.call("web.form.banner.rule", "compute_message", args),
            null
        );
        if ((ctrl.__wfbSeq || 0) !== seq) return;
        // Replace only the alert class
        el.classList.remove("alert-info", "alert-warning", "alert-danger");
        el.classList.add("alert-" + r.severity);
        el.classList.toggle("o_invisible_modifier", !(r && r.visible));
        setHtml(el, r.html);
    }
}

function scheduleRefresh(ctrl) {
    if (ctrl.__wfbSched) return;
    ctrl.__wfbSched = true;
    requestAnimationFrame(() => ((ctrl.__wfbSched = false), refreshBanners(ctrl)));
}

function tick(ctrl) {
    clearTimeout(ctrl.__wfbTimer);
    ctrl.__wfbTimer = setTimeout(() => {
        const rec = recRoot(ctrl);
        if (!rec) return;
        const names = triggerNames(ctrl);
        if (!names.length) return;
        console.log("Inside");
        const slice = sliceBy(shrink(rec.data), names),
            prev = ctrl.__wfbPrev || {};
        let changed = null;
        for (const k of names) {
            const a = k in prev ? JSON.stringify(prev[k]) : undefined;
            const b = JSON.stringify(slice[k]);
            if (a !== b) (changed || (changed = {}))[k] = slice[k];
        }
        ctrl.__wfbPrev = slice;
        if (changed) setTimeout(() => refreshBanners(ctrl, changed), 0);
    }, 180);
}

patch(FormController.prototype, "web_form_banner.lean", {
    setup() {
        this._super(...arguments);
        onMounted(() => scheduleRefresh(this));
        onPatched(() => tick(this));
        onWillUnmount(() => clearTimeout(this.__wfbTimer));
    },
    async edit() {
        const r = await this._super(...arguments);
        scheduleRefresh(this);
        return r;
    },
    async discard() {
        const r = await this._super(...arguments);
        scheduleRefresh(this);
        return r;
    },
    async saveButtonClicked(p = {}) {
        const ok = await this._super(p);
        if (ok) scheduleRefresh(this);
        return ok;
    },
});
