/*
    Copyright (C) 2021 - Today: GRAP (http://www.grap.coop)
    Copyright Tecnativa - Jairo Llopis
    Copyright Tecnativa - Alexandre Díaz
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

    Part of the code comes from web_responsive module. (same repository)
*/

odoo.define('web_responsive_company', function (require) {
    'use strict';

    var SwitchCompanyMenu = require("web.SwitchCompanyMenu");
    var session = require('web.session');
    var config = require("web.config");
    var core = require("web.core");


    function findNames (memo, company) {
        memo[company.complete_name] = company;
        return memo;
    }


    SwitchCompanyMenu.include({
        events: _.extend({
            "keydown .search-input input": "_searchResultsNavigate",
            "input .search-input input": "_searchCompaniesSchedule",
            "click .o-menu-search-result": "_searchResultChosen",
            "shown.bs.dropdown": "_searchFocus",
            "hidden.bs.dropdown": "_searchReset",
            "hide.bs.dropdown": "_hideCompaniesMenu",
        }, SwitchCompanyMenu.prototype.events),


        /**
         * Load complete companies.
         *
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this._companies = session.complete_companies;
            this._searchableCompanies = _.reduce(
                this._companies,
                findNames,
                {}
            );
            this._search_def = $.Deferred();
        },

        /**
         * @override
         */
        start: function () {
            this._super.apply(this, arguments);
            // rerender element to remove html that is hard inserted in the odoo Core function
            // and so read the name of the company
            this.renderElement();
            if (!this.isMobile) {
                this.$('.oe_topbar_name').text(session.user_companies.current_company[1]);
            }
            this.$search_container = this.$(".search-container");
            this.$search_input = this.$(".search-input input");
            this.$search_results = this.$(".search-results");
        },

        /**
         * Autofocus on search field on big screens.
         */
        _searchFocus: function () {
            if (!config.device.isMobile) {
                this.$search_input.focus();
            }
        },

        /**
         * Reset search input and results
         */
        _searchReset: function () {
            this.$search_container.removeClass("has-results");
            this.$search_results.empty();
            this.$search_input.val("");
        },

        /**
         * Navigate among search results
         *
         * @param {jQuery.Event} event
         */
        _searchResultsNavigate: function (event) {
            // Find current results and active element (1st by default)
            var all = this.$search_results.find(".o-menu-search-result"),
                pre_focused = all.filter(".active") || $(all[0]),
                offset = all.index(pre_focused),
                key = event.key;
            // Keyboard navigation only supports search results
            if (!all.length) {
                return;
            }
            // Transform tab presses in arrow presses
            if (key === "Tab") {
                event.preventDefault();
                key = event.shiftKey ? "ArrowUp" : "ArrowDown";
            }
            switch (key) {
            // Pressing enter is the same as clicking on the active element
            case "Enter":
                pre_focused.click();
                break;
            // Navigate up or down
            case "ArrowUp":
                offset--;
                break;
            case "ArrowDown":
                offset++;
                break;
            default:
                // Other keys are useless in this event
                return;
            }
            // Allow looping on results
            if (offset < 0) {
                offset = all.length + offset;
            } else if (offset >= all.length) {
                offset -= all.length;
            }
            // Switch active element
            var new_focused = $(all[offset]);
            pre_focused.removeClass("active");
            new_focused.addClass("active");
            this.$search_results.scrollTo(new_focused, {
                offset: {
                    top: this.$search_results.height() * -0.5,
                },
            });
        },

        /*
        * Control if AppDrawer can be closed
        */
        _hideCompaniesMenu: function () {
            return !this.$('input').is(':focus');
        },

        _companyInfo: function (key) {
            var company = this._searchableCompanies[key];
            return company;
        },

        /**
         * Schedule a search on current menu items.
         */
        _searchCompaniesSchedule: function () {
            this._search_def.reject();
            this._search_def = $.Deferred();
            setTimeout(this._search_def.resolve.bind(this._search_def), 50);
            this._search_def.done(this._searchCompanies.bind(this));
        },

        /**
         * Search among available menu items, and render that search.
         */
        _searchCompanies: function () {
            var query = this.$search_input.val();
            if (query === "") {
                this.$search_container.removeClass("has-results");
                this.$search_results.empty();
                return;
            }
            var results = fuzzy.filter(
                query,
                _.keys(this._searchableCompanies),
                {
                    pre: "<b>",
                    post: "</b>",
                }
            );
            this.$search_container.toggleClass(
                "has-results",
                Boolean(results.length)
            );
            this.$search_results.html(
                core.qweb.render(
                    "web_responsive_company.CompanySearchResults",
                    {
                        results: results,
                        widget: this,
                    }
                )
            );
        },

        /**
         * Use chooses a search result, so we navigate to that menu
         *
         * @param {jQuery.Event} event
         */
        _searchResultChosen: function (event) {
            this._onClick(event);
        },

        getCompanies: function () {
            return this._companies;
        },

        isCurrentCompany: function(company) {
            return session.company_id === company.id;
        },

    });

});
