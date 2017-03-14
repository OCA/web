/* Copyright 2004-today Odoo SA (<http://www.odoo.com>)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web.shortcut', function(require) {
    var Widget = require('web.Widget'),
        UserMenu = require('web.UserMenu'),
        WebClient = require('web.WebClient'),
        ViewManager = require('web.ViewManager'),
        ActionManager = require('web.ActionManager'),
        core = require('web.core'),
        qweb = core.qweb,
        DataModel = require('web.DataModel'),
        session = require('web.session');


    var ShortcutMenu = Widget.extend({
        template: 'Systray.ShortcutMenu',
        init: function() {
            this._super();
            this.on('load', this, this.load);
            this.on('add', this, this.add);
            this.on('display', this, this.display);
            this.on('remove', this, this.remove);
            this.model = new DataModel('web.shortcut');
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
            var $sc = $(qweb.render('Systray.ShortcutMenu.Item', {shortcut: sc}));
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

            new DataModel('ir.ui.menu').query(['action']).filter([['id', '=', action_id]]).context(null).all().then(function(menu) {
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


    UserMenu.include({
        start: function() {
            this.shortcuts = new ShortcutMenu(self);
            this.shortcuts.prependTo(this.$el.parent());
            return this._super.apply(this, arguments);
        },
        do_update: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.shortcuts.trigger('load');
            return res;
        },
    });


    WebClient.include({
        show_application: function() {
            var self = this;
            var res = this._super.apply(this, arguments);
            this.user_menu.shortcuts.on('click', this, function(action_id) {
                self.do_action(action_id, {
                    clear_breadcrumbs: true,
                    replace_breadcrumb: true
                });
            });
            return res;
        }
    });


    ViewManager.include({
        switch_mode: function (view_type, no_store) {
            var self = this;
            return this._super.apply(this, arguments).done(function() {
                self.shortcut_check(self.views[view_type]);
            });
        },
        shortcut_check: function(view) {
            var self = this;

            // Child view managers
            if (!this.action_manager) {
                return;
            }

            // display shortcuts if on the first view for the action
            var $shortcut_toggle = this.action_manager.main_control_panel.$el.find('.oe_shortcut_toggle');
            if (!this.action.name ||
                !(view.view_type === this.view_stack[0].view_type &&
                view.view_id === this.view_stack[0].view_id)
                ) {
                $shortcut_toggle.addClass('hidden');
                return;
            }
            $shortcut_toggle.removeClass('hidden');

            // Anonymous users don't have user_menu
            var shortcuts_menu = this.action_manager.webclient.user_menu.shortcuts;
            if (shortcuts_menu) {
                $shortcut_toggle.toggleClass('oe_shortcut_remove', shortcuts_menu.has(self.session.active_id));
                $shortcut_toggle.unbind("click").click(function() {
                    if ($shortcut_toggle.hasClass("oe_shortcut_remove")) {
                        shortcuts_menu.trigger('remove', self.session.active_id);
                    } else {
                        shortcuts_menu.trigger('add', {
                            'user_id': session.uid,
                            'menu_id': session.active_id,
                            'name': session.name
                        });
                    }
                    $shortcut_toggle.toggleClass("oe_shortcut_remove");
                });
            }
        }
    });


    ActionManager.include({
        do_action: function() {
            this.main_control_panel.$el.find('.oe_shortcut_toggle').addClass('hidden');
            return this._super.apply(this, arguments);
        }
    });

    return ShortcutMenu;
});
