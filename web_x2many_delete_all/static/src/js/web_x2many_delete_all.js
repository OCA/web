/* Copyright 2016 Onestein
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

openerp.web_x2many_delete_all = function(instance) {
"use strict";
    var _t = instance.web._t;

    instance.web.form.FieldMany2Many.include({
        events: {
            'click th.oe_list_record_delete': 'btn_delete_all_clicked'
        },
        initialize_content: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.is_loaded.then(function() {
                self.toggle_btn_delete_all();
            });
            return res;
        },
        toggle_btn_delete_all: function() {
            if(this.get('effective_readonly')) {
                this.$('th.oe_list_record_delete > button').addClass('hidden');
            } else {
                this.$('th.oe_list_record_delete > button').removeClass('hidden');
            }
        },
        btn_delete_all_clicked: function() {
            if(this.get('effective_readonly')) return;
            this.delete_all();
        },
        delete_all: function() {
            this.list_view.do_delete(this.dataset.ids);
        }
    });

    instance.web.form.FieldOne2Many.include({
        events: {
            'click th.oe_list_record_delete': 'btn_delete_all_clicked'
        },
        reload_current_view: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            res.then(function() {
                self.toggle_btn_delete_all();
            });
            return res;
        },
        toggle_btn_delete_all: function() {
            if(this.get('effective_readonly')) {
                this.$('th.oe_list_record_delete > button').addClass('hidden');
            } else {
                this.$('th.oe_list_record_delete > button').removeClass('hidden');
            }
        },
        btn_delete_all_clicked: function() {
            if(this.get('effective_readonly')) return;
            this.delete_all();
        },
        delete_all: function() {
            this.viewmanager.views.list.controller.do_delete(this.dataset.ids);
        }
    });
}
