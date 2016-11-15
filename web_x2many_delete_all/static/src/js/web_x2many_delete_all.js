/* Copyright 2016 Onestein
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web_x2many_delete_all', function (require) {
"use strict";
    var core = require('web.core'),
        _t = core._t;

    var X2ManyListDeleteAllMixin = {
        events: {
            'click th.oe_list_record_delete': 'btn_delete_all_clicked'
        },
        reload_current_view: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            res.then(function() {
                self.toggle_btn_delete_all();
            });
            return res
        },
        toggle_btn_delete_all: function() {
            if(this.get('effective_readonly')) {
                this.$('th.oe_list_record_delete > .fa-trash-o').addClass('hidden');
            } else {
                this.$('th.oe_list_record_delete > .fa-trash-o').removeClass('hidden');
            }
        },
        btn_delete_all_clicked: function() {
            if(this.get('effective_readonly')) return;
            this.delete_all();
        },
        delete_all: function() {
            this.viewmanager.views.list.controller.do_delete(this.dataset.ids);
        }
    }

    core.form_widget_registry.get('many2many').include(X2ManyListDeleteAllMixin);
    core.form_widget_registry.get('one2many').include(X2ManyListDeleteAllMixin);
});
