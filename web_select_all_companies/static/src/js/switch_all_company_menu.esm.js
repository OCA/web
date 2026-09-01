/* Copyright 2023 Camptocamp - Telmo Santos
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {
    CompanySelector,
    SwitchCompanyMenu,
} from "@web/webclient/switch_company_menu/switch_company_menu";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {user} from "@web/core/user";

patch(CompanySelector.prototype, {
    // Load user's default companies if none are selected
    async apply(orm) {
        let selectedIds = [...this.selectedCompaniesIds];

        if (!selectedIds || selectedIds.length === 0) {
            try {
                const userData = await orm.call("res.users", "read", [[user.userId]], {
                    fields: ["default_company_ids"],
                });

                const defaultCompanyIds = userData[0]?.default_company_ids || [];

                if (defaultCompanyIds.length > 0) {
                    selectedIds = defaultCompanyIds;
                }
            } catch (error) {
                console.error("Error loading default companies:", error);
            }
        }

        this.companyService.setCompanies(selectedIds, false);
    },
});

patch(SwitchCompanyMenu.prototype, {
    setup() {
        super.setup(...arguments);
        this.orm = useService("orm");
    },

    // Change threshold from 9 to 1 for showing search filter
    get hasLotsOfCompanies() {
        return (
            Object.values(this.companyService.allowedCompaniesWithAncestors).length > 1
        );
    },

    async confirm() {
        this.dropdown.close();
        await this.companySelector.apply(this.orm);
    },
});
