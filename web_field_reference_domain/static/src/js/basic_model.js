// Copyright 2024 Alexandre D. Díaz - Grupo Isonor
odoo.define("web_field_reference_domain.BasicModel", function (require) {
    "use strict";

    var BasicModel = require("web.BasicModel");

    BasicModel.include({
        /**
         * This is donde in this way to avoid do extra searchs.
         * FIXME: If someday Odoo changes the implementation of the
         * '_search' method in the 'Many2One', see if you can avoid
         * doing this.
         *
         * @override
         */
        _getDomain: function (element, options) {
            if (options && options.referenceDomain) {
                return options.referenceDomain;
            }
            return this._super(...arguments);
        },
    });
});
