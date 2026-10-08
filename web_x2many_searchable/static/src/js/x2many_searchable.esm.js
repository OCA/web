/* @odoo-module */
/**
 * X2Many inline quick search (embedded <list> in form views).
 *
 * Activated only when the x2many subview has `searchable="1"` on its `<list>` node.
 *
 * UI:
 * - Search bar is displayed in the x2many subview.
 * - Filter based on the input value and the advanced domain.
 * - Once applied, the input is cleared and facets become the source of truth.
 */

/* eslint-disable sort-imports -- keep @web paths grouped; rule conflicts with @odoo/owl placement */
import {Domain} from "@web/core/domain";
import {DomainSelectorDialog} from "@web/core/domain_selector_dialog/domain_selector_dialog";
import {_t} from "@web/core/l10n/translation";
import {user} from "@web/core/user";
import {useService} from "@web/core/utils/hooks";
import {patch} from "@web/core/utils/patch";
import {getFieldDomain} from "@web/model/relational_model/utils";
import {X2ManyField} from "@web/views/fields/x2many/x2many_field";

import {useState} from "@odoo/owl";
/* eslint-enable sort-imports */

function parseArchBool(value) {
    return value === "1" || value === "true" || value === "True";
}

patch(X2ManyField.prototype, {
    setup() {
        super.setup();
        this.dialogService = useService("dialog");
        this.notificationService = useService("notification");
        this.orm = useService("orm");

        /**
         * - query/advancedDomain: current user input (not necessarily applied).
         * - appliedQuery/appliedAdvancedDomain: currently applied filters, rendered as facets.
         */
        this.x2mSearchState = useState({
            query: "",
            advancedDomain: "[]",
            appliedQuery: "",
            appliedAdvancedDomain: "[]",
            originalStaticIds: null,
            disabled: false,
            disabledReason: _t("Save record to search"),
            placeholder: _t("Search in lines..."),
            clearLabel: _t("Clear"),
            advancedLabel: _t("Advanced"),
            advancedActiveLabel: _t("Advanced domain active"),
            isLoading: false,
        });

        this._x2mSearchRecomputeDisabled();
    },

    get isX2ManySearchable() {
        const xmlDoc = this.archInfo?.xmlDoc;
        if (!xmlDoc) {
            return false;
        }
        return parseArchBool(xmlDoc.getAttribute("searchable"));
    },

    get x2mFacets() {
        const facets = [];
        const query = (this.x2mSearchState.appliedQuery || "").trim();
        if (query) {
            facets.push({
                key: "query",
                type: "filter",
                title: _t("Search"),
                values: [query],
                separator: _t("or"),
                domain: null,
                tooltip: null,
            });
        }
        if (
            this.x2mSearchState.appliedAdvancedDomain &&
            this.x2mSearchState.appliedAdvancedDomain !== "[]"
        ) {
            facets.push({
                key: "advanced",
                type: "filter",
                title: _t("Advanced"),
                values: [_t("Domain")],
                separator: _t("or"),
                domain: this.x2mSearchState.appliedAdvancedDomain,
                tooltip: this.x2mSearchState.appliedAdvancedDomain,
            });
        }
        return facets;
    },

    _x2mSearchRecomputeDisabled() {
        const list = this.list;
        const canSearch = Boolean(
            list && typeof list.load === "function" && list.resModel
        );
        const parentIsNew = Boolean(this.props?.record?.isNew);
        this.x2mSearchState.disabled = !canSearch || parentIsNew;
        if (parentIsNew) {
            this.x2mSearchState.disabledReason = _t("Save the record to search");
        } else if (!canSearch) {
            this.x2mSearchState.disabledReason = _t(
                "Search is not available for this list"
            );
        }
    },

    // eslint-disable-next-line complexity -- name_search + static/dynamic x2many branches
    async _x2mApplySearch({force = false} = {}) {
        this._x2mSearchRecomputeDisabled();
        if (this.x2mSearchState.disabled) {
            return;
        }
        const list = this.list;
        if (!list) {
            return;
        }

        const isStaticList = list.constructor?.type === "StaticList";
        const evalContext = list.evalContext || {
            ...user.context,
            ...this.props.context,
        };
        const rpcContext = list.context || this.props.context || {};

        const baseDomain =
            getFieldDomain(this.props.record, this.props.name, this.props.domain) || [];

        let advancedDomain = [];
        const advanced = this.x2mSearchState.advancedDomain || "[]";
        if (advanced && advanced !== "[]") {
            try {
                advancedDomain = new Domain(advanced).toList(evalContext);
            } catch {
                advancedDomain = [];
            }
        }

        let quickDomain = [];
        const query = (this.x2mSearchState.query || "").trim();
        if (query) {
            this.x2mSearchState.isLoading = true;
            try {
                const lookupDomain = Domain.and([
                    new Domain(baseDomain),
                    new Domain(advancedDomain),
                    ...(isStaticList
                        ? [
                              new Domain([
                                  [
                                      "id",
                                      "in",
                                      this.x2mSearchState.originalStaticIds ||
                                          list.currentIds ||
                                          [],
                                  ],
                              ]),
                          ]
                        : []),
                ]).toList(evalContext);
                const nameGets = await this.orm.call(list.resModel, "name_search", [], {
                    name: query,
                    domain: lookupDomain,
                    operator: "ilike",
                    limit: 200,
                    context: rpcContext,
                });
                const ids = nameGets.map((ng) => ng[0]);
                quickDomain = ids.length ? [["id", "in", ids]] : [["id", "=", 0]];
            } finally {
                this.x2mSearchState.isLoading = false;
            }
        }

        const finalDomain = Domain.and([
            new Domain(baseDomain),
            new Domain(advancedDomain),
            new Domain(quickDomain),
        ]).toList(evalContext);

        const finalKey = JSON.stringify(finalDomain);
        if (!force && this._x2mLastDomainKey === finalKey) {
            return;
        }
        this._x2mLastDomainKey = finalKey;

        try {
            if (isStaticList) {
                if (this.x2mSearchState.originalStaticIds === null) {
                    this.x2mSearchState.originalStaticIds = [
                        ...(list.currentIds || []),
                    ];
                }
                const constrainedDomain = Domain.and([
                    new Domain(finalDomain),
                    new Domain([["id", "in", this.x2mSearchState.originalStaticIds]]),
                ]).toList(evalContext);
                const ids = await this.orm.search(list.resModel, constrainedDomain, {
                    context: rpcContext,
                    limit: 1000,
                });
                await list._replaceWith(ids, {reload: true});
                await list.load({offset: 0});
            } else {
                await list.load({domain: finalDomain, offset: 0});
            }
            this.x2mSearchState.appliedQuery = (this.x2mSearchState.query || "").trim();
            this.x2mSearchState.appliedAdvancedDomain =
                this.x2mSearchState.advancedDomain || "[]";
            this.x2mSearchState.query = "";
            this.render();
        } catch {
            this.x2mSearchState.disabled = true;
            this.notificationService.add(_t("Search is not available for this list"), {
                type: "warning",
            });
        }
    },

    onX2mSearchInput(ev) {
        this.x2mSearchState.query = ev.target.value || "";
    },

    onX2mSearchKeydown(ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            this._x2mApplySearch({force: true});
        }
    },

    onX2mClearSearch() {
        this.x2mSearchState.query = "";
        this.x2mSearchState.advancedDomain = "[]";
        this.x2mSearchState.appliedQuery = "";
        this.x2mSearchState.appliedAdvancedDomain = "[]";
        this._x2mLastDomainKey = null;
        const list = this.list;
        if (
            list &&
            list.constructor?.type === "StaticList" &&
            this.x2mSearchState.originalStaticIds
        ) {
            const ids = this.x2mSearchState.originalStaticIds;
            this.x2mSearchState.originalStaticIds = null;
            return list
                ._replaceWith(ids, {reload: true})
                .then(() => list.load({offset: 0}))
                .then(() => this.render());
        }
        return this._x2mApplySearch({force: true});
    },

    onX2mFacetRemove(facet) {
        if (facet.key === "query") {
            this.x2mSearchState.query = "";
            this.x2mSearchState.appliedQuery = "";
        } else if (facet.key === "advanced") {
            this.x2mSearchState.advancedDomain = "[]";
            this.x2mSearchState.appliedAdvancedDomain = "[]";
        }
        this._x2mLastDomainKey = null;
        return this._x2mApplySearch({force: true});
    },

    onX2mFacetLabelClick(_target, facet) {
        if (facet.key === "advanced") {
            return this.onX2mAdvancedDomain();
        }
    },

    onX2mAdvancedDomain() {
        const resModel = this.list?.resModel;
        if (!resModel) {
            return;
        }
        this.dialogService.add(DomainSelectorDialog, {
            resModel,
            domain: this.x2mSearchState.advancedDomain || "[]",
            context: this.list?.evalContext || this.props.context || {},
            title: _t("Advanced search domain"),
            confirmButtonText: _t("Apply"),
            discardButtonText: _t("Cancel"),
            disableConfirmButton: (domain) => domain === "[]",
            onConfirm: (domain) => {
                this.x2mSearchState.advancedDomain = domain || "[]";
                this._x2mApplySearch({force: true});
            },
        });
    },
});
