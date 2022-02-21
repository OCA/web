/** @odoo-module **/

import {getHumanDomain} from "./utils.esm";

import config from "web.config";
import DomainSelectorDialog from "web.DomainSelectorDialog";
import Domain from "web.Domain";
import {useModel} from "web.Model";

const {Component, hooks} = owl;
const {useRef} = hooks;

export default class AdvancedFilterItem extends Component {
    setup() {
        this.itemRef = useRef("dropdown-item");
        this.model = useModel("searchModel");
    }
    /**
     * Prevent propagation of dropdown-item-selected event, so that it
     * doesn't reaches the FilterMenu onFilterSelected event handler.
     */
    mounted() {
        $(this.itemRef.el).on("dropdown-item-selected", (event) =>
            event.stopPropagation()
        );
    }
    /**
     * Open advanced search dialog
     *
     * @returns {DomainSelectorDialog} The opened dialog itself.
     */
    onClick() {
        const dialog = new DomainSelectorDialog(
            this,
            this.model.config.modelName,
            "[]",
            {
                debugMode: config.isDebug(),
                readonly: false,
            }
        );
        // Add 1st domain node by default
        dialog.opened(() => dialog.domainSelector._onAddFirstButtonClick());
        // Configure handler
        dialog.on("domain_selected", this, function (e) {
            const preFilter = {
                description: getHumanDomain(dialog.domainSelector),
                domain: Domain.prototype.arrayToString(e.data.domain),
                type: "filter",
            };
            this.model.dispatch("createNewFilters", [preFilter]);
        });
        return dialog.open();
    }
    /**
     * Mocks _trigger_up to redirect Odoo legacy events to OWL events.
     *
     * @private
     * @param {OdooEvent} event
     */
    _trigger_up(event) {
        const {name, data} = event;
        data.__targetWidget = event.target;
        this.trigger(name.replace(/_/g, "-"), data);
    }
}

AdvancedFilterItem.template = "web_advanced_search.AdvancedFilterItem";
