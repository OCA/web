/* Copyright 2023 Camptocamp - Telmo Santos
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define(
    "web_select_all_companies/static/src/js/switch_all_company_menu.js",
    function (require) {
        "use strict";
        
        var session = require("web.session");
        var SwitchCompanyMenu = require("web.SwitchCompanyMenu");

        SwitchCompanyMenu.include({
            init() {
                this._super.apply(this, arguments);
                this.allCompanyIds = session.user_companies.allowed_companies.map(
                    (x) => x[0]
                );
                //  Get allowed companies from user context and compare with all companies to check if all companies are selected or not
                // and set flag accordingly
                this.allowed_company_ids = session.user_context.allowed_company_ids;
                this.isAllCompaniesSelected =
                    this.allowed_company_ids.length == this.allCompanyIds.length;
            },

            /**
             * @private
             * @param {MouseEvent|KeyEvent} ev
             */
            _onToggleCompanyClick: function (ev) {
                if (
                    ev.type == "keydown" &&
                    ev.which != $.ui.keyCode.ENTER &&
                    ev.which != $.ui.keyCode.SPACE
                ) {
                    return;
                }
                ev.preventDefault();
                ev.stopPropagation();
                var dropdownItem = $(ev.currentTarget).parent();
                var companyID = dropdownItem.data("company-id");
                var dropdownMenu = dropdownItem.parent();
                var all_items = dropdownMenu.children();
                var toggle_company_div = all_items[0].children[0];
                var toggle_company_i = toggle_company_div.children[0].children[0];
                if (!companyID) {
                    // Calculate length - 1 because one element is the 'toggle all companies' item
                    this.isAllCompaniesSelected =
                        dropdownMenu.find(".fa-check-square").length - 1 ==
                        this.allCompanyIds.length;
                    // Deselect all companies by toggling class on html elements and setting company data in session
                    if (this.isAllCompaniesSelected) {
                        all_items
                            .find(".fa-check-square")
                            .removeClass("fa-check-square")
                            .addClass("fa-square-o");
                        toggle_company_i.classList.replace(
                            "fa-check-square",
                            "fa-square-o"
                        );
                        $(ev.currentTarget).attr("aria-checked", "false");
                        session.setCompanies(this.allowed_company_ids[0], []);
                        session.user_context.allowed_company_ids = [];
                    } else {
                        // Select all companies by toggling class on html elements and setting company data in session
                        var allowed_company_ids = this.allowed_company_ids;
                        var current_company_id = allowed_company_ids[0];
                        _.each(this.allCompanyIds, (company_id) => {
                            if (!allowed_company_ids.includes(company_id)) {
                                allowed_company_ids.push(company_id);
                            }
                        });
                        all_items
                            .find(".fa-check-square")
                            .removeClass("fa-square-o")
                            .addClass("fa-check-square");
                        toggle_company_i.classList.replace(
                            "fa-square-o",
                            "fa-check-square"
                        );
                        $(ev.currentTarget).attr("aria-checked", "true");
                        session.setCompanies(current_company_id, allowed_company_ids);
                    }
                } else {
                    return this._super.apply(this, arguments);
                }
            },
        });
    }
);
