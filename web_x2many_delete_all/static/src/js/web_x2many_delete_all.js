odoo.define('web_x2many_delete_all', function (require) {
"use strict";
    var core = require('web.core');
    var _t = core._t;


    var X2ManyListDeleteAllMixin = {
        events: {
            'click th.o_list_record_delete': 'btn_delete_all_clicked'
        },
        start: function() {
            return this._super.apply(this, arguments);
        },
        btn_delete_all_clicked: function() {
            if(!this.get('effective_readonly')) {
                this.delete_all();
            }
        },
        delete_all: function() {
            this.viewmanager.views.list.controller.do_delete(this.dataset.ids);
        }
    }

    var many2many = core.form_widget_registry.get('many2many');
    var one2many = core.form_widget_registry.get('one2many');

    many2many.include(X2ManyListDeleteAllMixin);
    one2many.include(X2ManyListDeleteAllMixin);
});