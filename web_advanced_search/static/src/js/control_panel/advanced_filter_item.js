odoo.define("web_advanced_search.AdvancedFilterItem", function (require) {
    "use strict";

    const config = require("web.config");
    const DropdownMenuItem = require("web.DropdownMenuItem");
    const patchMixin = require("web.patchMixin");
    const DomainSelectorDialog = require("web.DomainSelectorDialog");
    const Domain = require("web.Domain");
    const human_domain = require("web_advanced_search.human_domain");
    const {useModel} = require("web/static/src/js/model.js");

    class AdvancedFilterItem extends DropdownMenuItem {
        constructor() {
            super(...arguments);
            this.model = useModel("searchModel");
            this._modelName = this.model.config.modelName;
        }
        /**
         * Open advanced search dialog
         *
         * @returns {DomainSelectorDialog} The opened dialog itself.
         */
        advanced_search_open() {
            const domain_selector_dialog = new DomainSelectorDialog(
                this,
                this._modelName,
                "[]",
                {
                    debugMode: config.isDebug(),
                    readonly: false,
                }
            );
            domain_selector_dialog.opened(() => {
                // Add 1st domain node by default
                domain_selector_dialog.domainSelector._onAddFirstButtonClick();
            });
            domain_selector_dialog.on("domain_selected", this, function (e) {
                const preFilter = {
                    description: human_domain.getHumanDomain(
                        domain_selector_dialog.domainSelector
                    ),
                    domain: Domain.prototype.arrayToString(e.data.domain),
                    type: "filter",
                };
                this.model.dispatch("createNewFilters", [preFilter]);
            });
            return domain_selector_dialog.open();
        }
        /**
         * Mocks _trigger_up to redirect Odoo legacy events to OWL events.
         *
         * @private
         * @param {OdooEvent} ev
         */
        _trigger_up(ev) {
            const evType = ev.name;
            const payload = ev.data;
            payload.__targetWidget = ev.target;
            this.trigger(evType.replace(/_/g, "-"), payload);
        }
    }

    AdvancedFilterItem.template = "web_advanced_search.AdvancedFilterItem";

    return patchMixin(AdvancedFilterItem);
});
