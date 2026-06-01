/** @odoo-module **/
/* Copyright 2023 Camptocamp - Telmo Santos
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
import {SwitchCompanyMenu} from "@web/webclient/switch_company_menu/switch_company_menu";
import {patch} from "@web/core/utils/patch";

patch(SwitchCompanyMenu.prototype, {
    setup() {
        super.setup();
        // Get all company IDs from allowed companies (includes ancestors/children)
        this.allCompanyIds = Object.keys(
            this.companyService.allowedCompaniesWithAncestors
        ).map(Number);
        // Check if all companies are currently selected
        this.isAllCompaniesSelected = this.allCompanyIds.every((id) =>
            this.companySelector.selectedCompaniesIds.includes(id)
        );
    },

    toggleSelectAllCompanies() {
        if (this.isAllCompaniesSelected) {
            // Deselect all: clear selection and keep only the current company
            this.companySelector.selectedCompaniesIds.splice(
                0,
                this.companySelector.selectedCompaniesIds.length
            );
            this.companySelector.selectedCompaniesIds.push(
                this.companyService.currentCompany.id
            );
            this.isAllCompaniesSelected = false;
        } else {
            // Select all: add every allowed company to the selection
            for (const id of this.allCompanyIds) {
                if (!this.companySelector.selectedCompaniesIds.includes(id)) {
                    this.companySelector.selectedCompaniesIds.push(id);
                }
            }
            this.isAllCompaniesSelected = true;
        }
        // Apply changes immediately via the CompanySelector
        this.companySelector._apply();
    },
});
