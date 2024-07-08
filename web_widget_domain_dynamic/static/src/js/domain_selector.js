/*
    Copyright 2022 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("web_widget_domain_dynamic.DomainSelector", function (require) {
    "use strict";

    const DomainSelector = require("web.DomainSelector");
    const Domain = require("web.Domain");

    DomainSelector.include({
        /**
         * @override
         */
        init(parent, model, domain) {
            this._super.apply(this, arguments);
            this.rawDomain = domain;
        },
        /**
         * @override
         */
        _postRender: function () {
            this._super.apply(this, arguments);
            // Replace technical domain if in debug mode
            if (this.$debugInput.length) {
                this.$debugInput.val(this.rawDomain);
                // Original method would do this instead:
                // this.$debugInput.val(Domain.prototype.arrayToString(this.getDomain()));
            }
        },
        /**
         * @override
         */
        _onDebugInputChange: function (e) {
            this.rawDomain = e.currentTarget.value;
            return this._super.apply(this, arguments);
        },
        /**
         * @override
         */
        _onDomainChange: function (e) {
            if (!e.data.alreadyRedrawn) {
                this.rawDomain = Domain.prototype.arrayToString(this.getDomain());
            }
            return this._super.apply(this, arguments);
        },
    });

    return DomainSelector;
});
