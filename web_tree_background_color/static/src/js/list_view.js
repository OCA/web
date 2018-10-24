/* Copyright 2018 Leonardo Donelli (donelli@webmonks.it)
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define('web_tree_background_color.stuff', function (require) {
    "use strict";

    var ListView = require('web.ListView');
    var session = require('web.session');

    ListView.include({

        init: function() {
            var res = this._super.apply(this, arguments);
            this.bg_decoration = null;
            return res;
        },

        willStart: function() {
            this.bg_decoration = _.pick(this.fields_view.arch.attrs, function(value, key) {
                return key.lastIndexOf('decoration-bg-') === 0;
            });
            this.bg_decoration = _.mapObject(this.bg_decoration, function(value) {
                return py.parse(py.tokenize(value));
            });
            return this._super.apply(this, arguments);
        },

        load_list: function() {
            var res = this._super.apply(this, arguments);
            if (!_.isEmpty(this.bg_decoration)) {
                this.$('.o_list_view').removeClass('table-striped');
            }
            return res;
        },

        compute_decoration_classnames: function(record) {
            var classnames = this._super.apply(this, arguments);
            var context = _.extend({}, record.attributes, {
                uid: session.uid,
                current_date: moment().format('YYYY-MM-DD')
                // TODO: time, datetime, relativedelta
            });
            _.each(this.bg_decoration, function(expr, decoration) {
                if (py.PY_isTrue(py.evaluate(expr, context))) {
                    classnames += ' ' + decoration.replace('decoration-bg', 'bg');
                }
            });
            return classnames;
        }

    });

});
