/* Copyright 2023 Camptocamp - Telmo Santos
   Copyright 2026 Simone Rubino - PyTech
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */
import {SwitchCompanyMenu} from "@web/webclient/switch_company_menu/switch_company_menu";
import {patch} from "@web/core/utils/patch";

patch(SwitchCompanyMenu.prototype, {
    get hasLotsOfCompanies() {
        // Just change threshold from 9 to 1
        return (
            Object.values(this.companyService.allowedCompaniesWithAncestors).length > 1
        );
    },
});
