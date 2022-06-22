/*
    Copyright 2022 Camptocamp SA (https://www.camptocamp.com).
    @author Iván Todorovich <ivan.todorovich@camptocamp.com>
    License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
*/
odoo.define("web_widget_domain_dynamic.basic_fields", function (require) {
    "use strict";

    const basic_fields = require("web.basic_fields");

    basic_fields.FieldDomain.include({
        /**
         * @override completely to set the string, unparsed, value.
         */
        _onDomainSelectorValueChange: function () {
            if (this.inDialog) return;
            this._setValue(this.domainSelector.rawDomain);
        },
    });

    return basic_fields;
});
