/** @odoo-module **/
/* Copyright 2023 Camptocamp - Telmo Santos
 * Copyright 2024 Gumbys - Yannick Olivier
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */
import {SwitchCompanyMenu} from "@web/webclient/switch_company_menu/switch_company_menu";
import {patch} from "@web/core/utils/patch";

patch(SwitchCompanyMenu.prototype, {
    setup() {
        super.setup(...arguments);
        this.allCompanyIds = Object.values(this.companyService.allowedCompanies).map(
            (x) => x.id
        );
        this.isAllCompaniesSelected = this.allCompanyIds.every((elem) =>
            this.companySelector.selectedCompaniesIds.includes(elem)
        );
    },

    toggleSelectAllCompanies() {
        var allCompanyIds = this.allCompanyIds;
        if (this.isAllCompaniesSelected) {
            // Deselect
            allCompanyIds = this.companyService.currentCompany.id;
        }
        this.companyService.setCompanies(allCompanyIds, false);
    },
});
