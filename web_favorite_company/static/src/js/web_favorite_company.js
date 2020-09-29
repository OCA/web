/*
    Copyright (C) 2020 - Today: GRAP (http://www.grap.coop)
    @author: Sylvain LE GAL (https://twitter.com/legalsylvain)
    License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
*/

odoo.define('web_favorite_company', function (require) {
    'use strict';

    var SwitchCompanyMenu = require("web.SwitchCompanyMenu");
    var session = require('web.session');


    SwitchCompanyMenu.include({
        /**
         * Load ordered companies.
         *
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this._companies = session.ordered_companies;
        },

        /**
         * @override
         */
        start: function () {
            this._super.apply(this, arguments);
            // rerender element to remove html that is hard inserted in the odoo Core function
            // and so readd the name of the company
            this.renderElement();
            if (!this.isMobile) {
                this.$('.oe_topbar_name').text(session.user_companies.current_company[1]);
            }
        },

        getCompanies: function () {
            return this._companies;
        },

        isCurrentCompany: function(company) {
            return session.company_id === company.id;
        },

    });

});
