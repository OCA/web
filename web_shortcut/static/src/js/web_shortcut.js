/*############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2011-2012 OpenERP SA (<http://openerp.com>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
############################################################################*/

odoo.define('web.shortcut', function(require) {
    var widget = require('web.Widget'),
        menu = require('web.UserMenu'),
        client = require('web.WebClient'),
        view_manager = require('web.ViewManager'),
        model = require('web.DataModel');


    var ShortcutMenu = widget.extend({
        template: 'Systray.ShortcutMenu',
        init: function() {
            this._super();
            this.on('load', this, this.load);
            this.on('add', this, this.add);
            this.on('display', this, this.display);
            this.on('remove', this, this.remove);
            this.model = new model('web.shortcut');
        },
        start: function() {
            var self = this;
            this._super();
            this.trigger('load');
            this.$el.on('click', '.oe_systray_shortcut_menu a', function() {
                self.click($(this));
            });
        },
        load: function() {
            var self = this;
            this.$el.find('.oe_systray_shortcut_menu').empty();
            return this.model.call('get_user_shortcuts', [
            ]).done(function(shortcuts) {
                _.each(shortcuts, function(sc) {
                    self.trigger('display', sc);
                });
            });
        },
        add: function (sc) {
            var self = this;
            this.model.call('create', [sc]).then(function(out){
                self.trigger('load');
            });
        },
        display: function(sc) {
            var self = this;
            this.$el.find('.oe_systray_shortcut_menu').append();
            var $sc = $(QWeb.render('Systray.ShortcutMenu.Item', {'shortcut': sc}));
            $sc.appendTo(self.$el.find('.oe_systray_shortcut_menu'));
        },
        remove: function (menu_id) {
            var menu_id = this.session.active_id;
            var $shortcut = this.$el.find('.oe_systray_shortcut_menu li a[data-id=' + menu_id + ']');
            var shortcut_id = $shortcut.data('shortcut-id');
            $shortcut.remove();
            this.model.call('unlink', [shortcut_id]);
        },
        click: function($link) {
            var self = this,
                action_id = $link.data('id');

            new model('ir.ui.menu').query(['action']).filter([['id', '=', id]]).context(null).all().then(function(menu) {
                var action_str = menu[0].action;
                var action_str_parts = action_str.split(',');
                action_id = parseInt(action_str_parts[1]);
                self.trigger('click', action_id);
            });
        },
        has: function(menu_id) {
            return !!this.$el.find('a[data-id=' + menu_id + ']').length;
        }
    });


    menu.include({
        do_update: function() {
            var self = this;
            this._super.apply(this, arguments);
            this.update_promise.done(function() {
                if (self.shortcuts) {
                    self.shortcuts.trigger('load');
                } else {
                    self.shortcuts = new ShortcutMenu(self);
                    self.shortcuts.prependTo(self.$el.parent());
                }
            });
        },
    });


    client.include({
        show_application: function() {
            var self = this;
            this._super.apply(this, arguments);
            this.user_menu.on('click', this, function(action_id) {
                self.do_action(action_id);
            });
        }
    });


    view_manager.include({
        switch_mode: function (view_type, no_store) {
            var self = this;
            this._super.apply(this, arguments).done(function() {
                self.shortcut_check(self.views[view_type]);
            });
        },
        shortcut_check: function(view) {
            var self = this;
            console.log(this);
            var shortcuts_menu = this.action_manager.webclient.user_menu.shortcuts;
            // display shortcuts if on the first view for the action
            var $shortcut_toggle = this.$el.find('.oe_shortcut_toggle');
            if (!this.action.name ||
                    !(view.view_type === this.view_stack[0].view_type
                        && view.view_id === this.view_stack[0].view_id)) {
                $shortcut_toggle.hide();
                return;
            }
            // Anonymous users don't have user_menu
            if (shortcuts_menu) {
                $shortcut_toggle.toggleClass('oe_shortcut_remove', shortcuts_menu.has(self.session.active_id));
                $shortcut_toggle.unbind("click").click(function() {
                    if ($shortcut_toggle.hasClass("oe_shortcut_remove")) {
                        shortcuts_menu.trigger('remove', self.session.active_id);
                    } else {
                        shortcuts_menu.trigger('add', {
                            'user_id': self.session.uid,
                            'menu_id': self.session.active_id,
                            'name': self.action.name
                        });
                    }
                    $shortcut_toggle.toggleClass("oe_shortcut_remove");
                });
            }
        }
    });

    return ShortcutMenu;
});
