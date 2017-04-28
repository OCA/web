/* Copyright 2004-today Odoo SA (<http://www.odoo.com>)
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

odoo.define('web.shortcut', function (require) {
    var Widget = require('web.Widget'),
        WebClient = require('web.WebClient'),
        ViewManager = require('web.ViewManager'),
        ActionManager = require('web.ActionManager'),
        Menu = require('web.Menu'),
        core = require('web.core'),
        qweb = core.qweb,
        DataModel = require('web.DataModel'),
        session = require('web.session'),
        SystrayMenu = require('web.SystrayMenu');

    var ShortcutMenu = Widget.extend({
        template: 'Systray.ShortcutMenu',
        init: function () {
            this._super();
            this.on('load', this, this.load);
            this.on('add', this, this.add);
            this.on('display', this, this.display);
            this.on('remove', this, this.remove);
            this.model = new DataModel('web.shortcut');
        },
        start: function () {
            var self = this;
            this._super();
            this.trigger('load');
            this.$el.on('click', '.oe_systray_shortcut_menu a', function () {
                self.click($(this));
            });
        },
        load: function () {
            var self = this;
            return this.model.call('get_user_shortcuts', []).done(function (shortcuts) {
                self.$el.find('.oe_systray_shortcut_menu').empty();
                _.each(shortcuts, function (sc) {
                    self.trigger('display', sc);
                });
            });
        },
        add: function (sc) {
            var self = this;
            this.model.call('create', [sc]).then(function (out) {
                self.trigger('load');
            });
        },
        display: function (sc) {
            var self = this;
            this.$el.find('.oe_systray_shortcut_menu').append();
            var $sc = $(qweb.render('Systray.ShortcutMenu.Item', {shortcut: sc}));
            $sc.appendTo(self.$el.find('.oe_systray_shortcut_menu'));
        },
        remove: function (menu_id) {
            var $shortcut = this.$el.find('.oe_systray_shortcut_menu li a[data-id=' + menu_id + ']');
            var shortcut_id = $shortcut.data('shortcut-id');
            $shortcut.remove();
            this.model.call('unlink', [shortcut_id]);
        },
        click: function ($link) {
            var self = this,
                menu_id = $link.data('id');
            new DataModel('ir.ui.menu').query(['action']).filter([['id', '=', menu_id]]).context(null).all().then(function (menu) {
                var action_str = menu[0].action;
                var action_str_parts = action_str.split(',');
                var action_id = parseInt(action_str_parts[1]);
                self.trigger('click', action_id, menu_id);
            });
        },
        has: function (menu_id) {
            return !!this.$el.find('a[data-id=' + menu_id + ']').length;
        }
    });


    SystrayMenu.Items.push(ShortcutMenu);


    WebClient.include({
        current_action_updated: function (action) {
            this.shortcut_menu = _.find(this.systray_menu.widgets, function (item) {
                return item instanceof ShortcutMenu;
            });
        },
        show_application: function () {
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self.shortcut_menu = _.find(self.systray_menu.widgets, function (item) {
                    return item instanceof ShortcutMenu;
                });
                self.shortcut_menu.on('click', self, function (action_id, menu_id) {
                    self.do_action(action_id, {
                        clear_breadcrumbs: true,
                        replace_breadcrumb: true,
                        action_menu_id: menu_id,
                        shortcut: true
                    });
                });
            });
        }
    });


    ViewManager.include({
        init: function() {
            var self = this;
            var res = this._super.apply(this, arguments);

            if (this.action_manager) {
                // Anonymous users don't have user_menu
                // Check whether it's the 'main' action_manager
                this.shortcut_menu = this.action_manager.webclient && this.action_manager.webclient.shortcut_menu;
            }
            return res;
        },
        switch_mode: function (view_type, no_store) {
            var self = this;
            return this._super.apply(this, arguments).done(function () {
                if (!self.action_manager) return;
                self.$shortcut_toggle = self.action_manager.main_control_panel.$el.find('.oe_shortcut_toggle');
                self.shortcut_toggle_bind();
                var visible = self.shortcut_toggle_visibility(self.views[view_type]);
                if (visible) {
                    $.when(self.action_manager.webclient.menu.initial_menu_open).then(function() {
                        self.shortcut_toggle_state();
                    });
                }
            });
        },
        shortcut_toggle_visibility: function(view) {
            // display shortcuts if on the first view for the action
            if ((!this.action.name || !(view.view_type === this.view_stack[0].view_type &&
                view.view_id === this.view_stack[0].view_id)
            ) || !this.action_manager.webclient) {
                this.$shortcut_toggle.addClass('hidden');
                return false;
            }
            this.$shortcut_toggle.removeClass('hidden');
            return true;
        },
        shortcut_toggle_state: function(menu_id) {
            this.$shortcut_toggle.toggleClass('oe_shortcut_remove', this.shortcut_menu.has(menu_id || this.session.active_id));
        },
        shortcut_toggle_bind: function() {
            var self = this;
            this.$shortcut_toggle.unbind('click').click(function () {
                self.shortcut_toggle_click();
            });
        },
        shortcut_get_menu_id: function() {
            var menu_id = session.active_id;
            // In the case we come from a parent menu, no action is linked to the menu
            // We must take the first child menu
            if (this.action_manager.webclient.menu_data) {
                for (var i = 0; i < this.action_manager.webclient.menu_data.children.length; i++) {
                    if (this.action_manager.webclient.menu_data.children[i].id === session.active_id) {
                        menu_id = this.action_manager.webclient.menu_data.children[i].children[0].id;
                        break;
                    }
                }
            }
            return menu_id;
        },
        shortcut_toggle_click: function() {
            var menu_id = this.shortcut_get_menu_id();
            //Add / update
            if (this.$shortcut_toggle.hasClass("oe_shortcut_remove")) {
                this.shortcut_menu.trigger('remove', menu_id);
            } else {
                this.shortcut_menu.trigger('add', {
                    'user_id': session.uid,
                    'menu_id': menu_id,
                    'name': session.name
                });
            }
            this.$shortcut_toggle.toggleClass("oe_shortcut_remove");
        }
    });

    ActionManager.include({
        do_action: function (action, options) {
            var self = this;
            return this._super(action, options).done(function(e) {
                if (!self.inner_widget.shortcut_menu) {
                    var toggle = self.main_control_panel.$el.find('.oe_shortcut_toggle');
                    toggle.addClass('hidden');
                    return;
                }
                if (!options.shortcut)
                    self.inner_widget.shortcut_toggle_state();
                else
                    self.inner_widget.shortcut_toggle_state(e.menu_id);
            });
        }
    });


    Menu.include({
        init: function() {
            var res = this._super.apply(this, arguments);
            this.initial_menu_open = $.Deferred();
            return res;
        },
        open_menu: function() {
            var initial = !session.active_id;
            var res = this._super.apply(this, arguments);
            if (initial)
                this.initial_menu_open.resolve();
            return res;
        }
    });

    return ShortcutMenu;
});
