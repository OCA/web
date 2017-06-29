/**
 * Copyright 2017 Therp BV <https://therp.nl>
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 *
 * @param instance An object giving access to the rest of the web client.
 */
openerp.web_search_nospace = function (instance) {
    'use strict';
    instance.web.search.InputView.include({

        onPaste : function () {
            this._super();
            setTimeout(function () {
                this.$el.text(this.$el.text().trim());
            }.bind(this), 0);
        },

    });
};
