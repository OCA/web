import {Component} from "@odoo/owl";
import {DomainSelectorDialog} from "@web/core/domain_selector_dialog/domain_selector_dialog";
import {DropdownItem} from "@web/core/dropdown/dropdown_item";
import {_t} from "@web/core/l10n/translation";
import {useService} from "@web/core/utils/hooks";

export default class AdvancedFilterItem extends Component {
    static template = "web_advanced_search.AdvancedFilterItem";
    static components = {DropdownItem};
    static props = {};

    setup() {
        this.dialogService = useService("dialog");
    }

    /**
     * Open advanced search dialog, mirroring searchModel.spawnCustomFilterDialog().
     */
    onClick() {
        const searchModel = this.env.searchModel;
        this.dialogService.add(DomainSelectorDialog, {
            resModel: searchModel.resModel,
            defaultConnector: "|",
            domain: "[]",
            context: searchModel.globalContext,
            onConfirm: (domain) => searchModel.splitAndAddDomain(domain),
            disableConfirmButton: (domain) => domain === "[]",
            title: _t("Advanced Filter"),
            confirmButtonText: _t("Search"),
            discardButtonText: _t("Discard"),
            isDebugMode: searchModel.isDebugMode,
        });
    }
}
