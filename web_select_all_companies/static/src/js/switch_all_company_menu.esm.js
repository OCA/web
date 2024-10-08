/** @odoo-module **/
/*
    Copyright 2023 Camptocamp - Telmo Santos
    Copyright 2024 Alitec Pte Ltd (https://www.alitec.sg) - Jay Patel
    * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
import {SwitchCompanyMenu} from "@web/webclient/switch_company_menu/switch_company_menu";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";

patch(SwitchCompanyMenu.prototype, {
    setup() {
        super.setup();
        this.allCompanyIds = Object.values(this.companyService.allowedCompanies).map(
            (x) => x.id
        );
        this.isAllCompaniesSelected = this.allCompanyIds.every((elem) =>
            this.companySelector.selectedCompaniesIds.includes(elem)
        );
    },

    toggleSelectAllCompanies() {
        if (this.isAllCompaniesSelected) {
            // Deselect all
            this.companySelector.switchCompany(
                "loginto",
                this.companyService.currentCompany.id
            );
        } else {
            // Select all
            const companiesToToggle = this.allCompanyIds;
            this.isAllCompaniesSelected = true;
            browser.clearTimeout(this.toggleTimer);
            this.toggleTimer = browser.setTimeout(() => {
                this.companyService.setCompanies(companiesToToggle);
            }, this.constructor.toggleDelay);
        }
    },
});
