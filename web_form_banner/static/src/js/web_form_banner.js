odoo.define("web_form_banner.save_plus_load", function (require) {
    "use strict";
    var rpc = require("web.rpc");
    var FormController = require("web.FormController");

    var root = function (ctrl) {
        return (ctrl && (ctrl.el || (ctrl.$el && ctrl.$el[0]))) || null;
    };
    var alive = function (ctrl) {
        var r = root(ctrl);
        return (
            r && r.isConnected &&
            !(typeof ctrl.isDestroyed === "function" && ctrl.isDestroyed())
        );
    };
    var qsa = function (el, sel) {
        return Array.from(el ? el.querySelectorAll(sel) : []);
    };
    var first = function () {
        for (var i = 0; i < arguments.length; i++) {
            var v = arguments[i];
            if (v != null && v !== "") return v;
        }
        return null;
    };
    var childSpan = function (el) {
        if (!el) return null;
        if (el.querySelector) {
            return el.querySelector(":scope > span") || null;
        }
        var c = el.firstElementChild;
        return c && c.tagName === "SPAN" ? c : null;
    };
    var after = function (p, fn) {
        if (p && typeof p.always === "function") { p.always(fn); return p; }
        return Promise.resolve(p).finally(fn);
    };
    var shrinkDraft = function (d) {
        return Object.entries(d || {}).reduce(function (o, kv) {
            var k = kv[0], v = kv[1], t = typeof v;
            if (v == null || t === "string" || t === "number" || t === "boolean") {
                o[k] = v;
            } else if (v && v.type === "record" && typeof v.res_id === "number") {
                o[k] = v.res_id;
            } else if (Array.isArray(v) || (v && (Array.isArray(v.data) || Array.isArray(v.res_ids)))) {
                // many2many (and possibly other x2many) values; let Python decide
                o[k] = v;
            }
            return o;
        }, {});
    };
    var bannersIn = function (ctrl) {
        return qsa(
            root(ctrl),
            '.o_form_view div[role="alert"][data-rule-id]'
        );
    };
    var hasBanners = function (ctrl) { return bannersIn(ctrl).length > 0; };

    var triggerSet = function (ctrl) {
        var set = Object.create(null);
        var els = bannersIn(ctrl);
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var raw = first(el.dataset.triggerFields, el.dataset.wfbTriggerFields, "");
            (raw || "").split(",").forEach(function (n) {
                if (n) set[n.trim()] = true;
            });
        }
        return set;
    };

    // pick only keys in `set` from `src`
    var pickKeys = function (src, set) {
        var out = {};
        if (!src) return out;
        Object.keys(src).forEach(function (k) { if (set[k]) out[k] = src[k]; });
        return out;
    };

    function refreshBanners(ctrl) {
        if (!alive(ctrl)) return;
        var st = (ctrl.model && ctrl.handle) ? ctrl.model.get(ctrl.handle) : null;
        var resId = st && st.res_id;

        // sanitize snapshots
        var snap = shrinkDraft(st && st.data) || {};
        var diff = resId ? (shrinkDraft(st && st.changes) || {}) : {};

        // for existing: include current values for trigger fields, then overlay diffs
        var tset = triggerSet(ctrl);
        var formVals = !resId
            ? snap
            : (Object.keys(tset).length ? pickKeys(snap, tset) : {});
        Object.keys(diff).forEach(function (k) { formVals[k] = diff[k]; });

        var els = bannersIn(ctrl);
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var ruleId = parseInt(first(el.dataset.ruleId, el.dataset.wfbRuleId), 10);
            var model = first(el.dataset.model, el.dataset.wfbModel, ctrl.modelName);

            (function (elRef) {
                rpc.query({
                    model: "web.form.banner.rule",
                    method: "compute_message",
                    args: [ruleId, model, resId, formVals],
                }).then(function (res) {
                    if (!alive(ctrl)) return;
                    res = res || {};
                    if (!res.visible) {
                        elRef.style.display = "none";
                        var sp0 = childSpan(elRef);
                        if (sp0) sp0.innerHTML = ""; else elRef.innerHTML = "";
                        return;
                    }
                    var sev = first(
                        res.severity, elRef.dataset.defaultSeverity, "danger"
                    );
                    var html = res.html || "";
                    elRef.className = "o_form_banner alert alert-" + sev;
                    var sp = childSpan(elRef);
                    if (sp) sp.innerHTML = html; else elRef.innerHTML = html;
                    elRef.style.display = "";
                });
            })(el);
        }
    }

    function withRefresh(ctrl, superFn, args) {
        var p = superFn.apply(ctrl, args);
        return after(p, function () { refreshBanners(ctrl); });
    }

    FormController.include({
        start: function () {
            var p = this._super.apply(this, arguments);
            if (p && typeof p.always === "function") {
                p.always(() => refreshBanners(this));
            } else {
                Promise.resolve(p).then(() => refreshBanners(this));
            }
            return p; // keep original Deferred/Promise for Odoo callers
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
        // onchange: refresh only when a declared trigger actually changed
        _onFieldChanged: function (ev) {
            var res = this._super.apply(this, arguments);
            if (!alive(this) || !hasBanners(this)) return res;
            var tset = triggerSet(this);
            if (!Object.keys(tset).length) return res;
            var changed = (ev && ev.data && ev.data.changes) || {};
            var names = Object.keys(changed);
            if (!names.some(function (n) { return tset[n]; })) return res;
            after(res, () => refreshBanners(this));
            return res;
        },
        activate: function () {
            var res = this._super.apply(this, arguments);
            if (hasBanners(this)) after(res, () => refreshBanners(this));
            return res;
        },
        on_attach_callback: function () {
            this._super.apply(this, arguments);
            setTimeout(() => refreshBanners(this));
        },
    });
});
