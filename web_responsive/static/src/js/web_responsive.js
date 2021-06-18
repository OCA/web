/* Copyright 2018 Tecnativa - Jairo Llopis
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define("web_responsive", function(require) {
    "use strict";

    const ActionManager = require("web.ActionManager");
    const AbstractWebClient = require("web.AbstractWebClient");
    const AppsMenu = require("web.AppsMenu");
    const BasicController = require("web.BasicController");
    const config = require("web.config");
    const core = require("web.core");
    const FormRenderer = require("web.FormRenderer");
    const Menu = require("web.Menu");
    const RelationalFields = require("web.relational_fields");
    const Chatter = require("mail.Chatter");
    const ListRenderer = require("web.ListRenderer");
    const DocumentViewer = require("mail.DocumentViewer");
    const ControlPanelRenderer = require("web.ControlPanelRenderer");

    /* Hide AppDrawer in desktop and mobile modes.
     * To avoid delays in pages with a lot of DOM nodes we make
     * sub-groups' with 'querySelector' to improve the performance.
     */
    function closeAppDrawer() {
        _.defer(function() {
            // Need close AppDrawer?
            var menu_apps_dropdown = document.querySelector(".o_menu_apps .dropdown");
            $(menu_apps_dropdown)
                .has(".dropdown-menu.show")
                .find("> a")
                .dropdown("toggle");
            // Need close Sections Menu?
            // TODO: Change to 'hide' in modern Bootstrap >4.1
            var menu_sections = document.querySelector(
                ".o_menu_sections li.show .dropdown-toggle"
            );
            $(menu_sections).dropdown("toggle");
            // Need close Mobile?
            var menu_sections_mobile = document.querySelector(".o_menu_sections.show");
            $(menu_sections_mobile).collapse("hide");
        });
    }

    /**
     * Reduce menu data to a searchable format understandable by fuzzy.js
     *
     * `AppsMenu.init()` gets `menuData` in a format similar to this (only
     * relevant data is shown):
     *
     * ```js
     * {
     *  [...],
     *  children: [
     *    // This is a menu entry:
     *    {
     *      action: "ir.actions.client,94", // Or `false`
     *      children: [... similar to above "children" key],
     *      name: "Actions",
     *      parent_id: [146, "Settings/Technical/Actions"], // Or `false`
     *    },
     *    ...
     *  ]
     * }
     * ```
     *
     * This format is very hard to process to search matches, and it would
     * slow down the search algorithm, so we reduce it with this method to be
     * able to later implement a simpler search.
     *
     * @param {Object} memo
     * Reference to current result object, passed on recursive calls.
     *
     * @param {Object} menu
     * A menu entry, as described above.
     *
     * @returns {Object}
     * Reduced object, without entries that have no action, and with a
     * format like this:
     *
     * ```js
     * {
     *  "Discuss": {Menu entry Object},
     *  "Settings": {Menu entry Object},
     *  "Settings/Technical/Actions/Actions": {Menu entry Object},
     *  ...
     * }
     * ```
     */
    function findNames(memo, menu) {
        if (menu.action) {
            var key = menu.parent_id ? menu.parent_id[1] + "/" : "";
            memo[key + menu.name] = menu;
        }
        if (menu.children.length) {
            _.reduce(menu.children, findNames, memo);
        }
        return memo;
    }

    AppsMenu.include({
        events: _.extend(
            {
                "keydown .search-input input": "_searchResultsNavigate",
                "input .search-input input": "_searchMenusSchedule",
                "click .o-menu-search-result": "_searchResultChosen",
                "shown.bs.dropdown": "_searchFocus",
                "hidden.bs.dropdown": "_searchReset",
                "hide.bs.dropdown": "_hideAppsMenu",
            },
            AppsMenu.prototype.events
        ),

        /**
         * Rescue some menu data stripped out in original method.
         *
         * @override
         */
        init: function(parent, menuData) {
            this._super.apply(this, arguments);
            // Keep base64 icon for main menus
            for (const n in this._apps) {
                this._apps[n].web_icon_data = menuData.children[n].web_icon_data;
            }
            // Store menu data in a format searchable by fuzzy.js
            this._searchableMenus = _.reduce(menuData.children, findNames, {});
            // Search only after timeout, for fast typers
            this._search_def = false;
        },

        /**
         * @override
         */
        start: function() {
            this.$search_container = this.$(".search-container");
            this.$search_input = this.$(".search-input input");
            this.$search_results = this.$(".search-results");
            return this._super.apply(this, arguments);
        },

        /**
         * Prevent the menu from being opened twice
         *
         * @override
         */
        _onAppsMenuItemClicked: function(ev) {
            this._super.apply(this, arguments);
            ev.preventDefault();
            ev.stopPropagation();
        },

        /**
         * Get all info for a given menu.
         *
         * @param {String} key
         * Full path to requested menu.
         *
         * @returns {Object}
         * Menu definition, plus extra needed keys.
         */
        _menuInfo: function(key) {
            const original = this._searchableMenus[key];
            return _.extend(
                {
                    action_id: parseInt(original.action.split(",")[1], 10),
                },
                original
            );
        },

        /**
         * Autofocus on search field on big screens.
         */
        _searchFocus: function() {
            if (!config.device.isMobile) {
                // This timeout is necessary since the menu has a 100ms fading animation
                setTimeout(() => this.$search_input.focus(), 100);
            }
        },

        /**
         * Reset search input and results
         */
        _searchReset: function() {
            this.$search_container.removeClass("has-results");
            this.$search_results.empty();
            this.$search_input.val("");
        },

        /**
         * Schedule a search on current menu items.
         */
        _searchMenusSchedule: function() {
            this._search_def = new Promise(resolve => {
                setTimeout(resolve, 50);
            });
            this._search_def.then(this._searchMenus.bind(this));
        },

        /**
         * Search among available menu items, and render that search.
         */
        _searchMenus: function() {
            const query = this.$search_input.val();
            if (query === "") {
                this.$search_container.removeClass("has-results");
                this.$search_results.empty();
                return;
            }
            var results = fuzzy.filter(query, _.keys(this._searchableMenus), {
                pre: "<b>",
                post: "</b>",
            });
            this.$search_container.toggleClass("has-results", Boolean(results.length));
            this.$search_results.html(
                core.qweb.render("web_responsive.MenuSearchResults", {
                    results: results,
                    widget: this,
                })
            );
        },

        /**
         * Use chooses a search result, so we navigate to that menu
         *
         * @param {jQuery.Event} event
         */
        _searchResultChosen: function(event) {
            event.preventDefault();
            event.stopPropagation();
            const $result = $(event.currentTarget),
                text = $result.text().trim(),
                data = $result.data(),
                suffix = ~text.indexOf("/") ? "/" : "";
            // Load the menu view
            this.trigger_up("menu_clicked", {
                action_id: data.actionId,
                id: data.menuId,
                previous_menu_id: data.parentId,
            });
            // Find app that owns the chosen menu
            const app = _.find(this._apps, function(_app) {
                return text.indexOf(_app.name + suffix) === 0;
            });
            // Update navbar menus
            core.bus.trigger("change_menu_section", app.menuID);
        },

        /**
         * Navigate among search results
         *
         * @param {jQuery.Event} event
         */
        _searchResultsNavigate: function(event) {
            // Find current results and active element (1st by default)
            const all = this.$search_results.find(".o-menu-search-result"),
                pre_focused = all.filter(".active") || $(all[0]);
            let offset = all.index(pre_focused),
                key = event.key;
            // Keyboard navigation only supports search results
            if (!all.length) {
                return;
            }
            // Transform tab presses in arrow presses
            if (key === "Tab") {
                event.preventDefault();
                key = event.shiftKey ? "ArrowUp" : "ArrowDown";
            }
            switch (key) {
                // Pressing enter is the same as clicking on the active element
                case "Enter":
                    pre_focused.click();
                    break;
                // Navigate up or down
                case "ArrowUp":
                    offset--;
                    break;
                case "ArrowDown":
                    offset++;
                    break;
                default:
                    // Other keys are useless in this event
                    return;
            }
            // Allow looping on results
            if (offset < 0) {
                offset = all.length + offset;
            } else if (offset >= all.length) {
                offset -= all.length;
            }
            // Switch active element
            const new_focused = $(all[offset]);
            pre_focused.removeClass("active");
            new_focused.addClass("active");
            this.$search_results.scrollTo(new_focused, {
                offset: {
                    top: this.$search_results.height() * -0.5,
                },
            });
        },

        /*
         * Control if AppDrawer can be closed
         */
        _hideAppsMenu: function() {
            return !this.$("input").is(":focus");
        },
    });

    BasicController.include({
        /**
         * Close the AppDrawer if the data set is dirty and a discard dialog
         * is opened
         *
         * @override
         */
        canBeDiscarded: function(recordID) {
            if (this.model.isDirty(recordID || this.handle)) {
                closeAppDrawer();
            }
            return this._super.apply(this, arguments);
        },
    });

    Menu.include({
        events: _.extend(
            {
                // Clicking a hamburger menu item should close the hamburger
                "click .o_menu_sections [role=menuitem]": "_onClickMenuItem",
                // Opening any dropdown in the navbar should hide the hamburger
                "show.bs.dropdown .o_menu_systray, .o_menu_apps": "_hideMobileSubmenus",
            },
            Menu.prototype.events
        ),

        start: function() {
            this.$menu_toggle = this.$(".o-menu-toggle");
            return this._super.apply(this, arguments);
        },

        /**
         * Hide menus for current app if you're in mobile
         */
        _hideMobileSubmenus: function() {
            if (
                config.device.isMobile &&
                this.$menu_toggle.is(":visible") &&
                this.$section_placeholder.is(":visible")
            ) {
                this.$section_placeholder.collapse("hide");
            }
        },

        /**
         * Prevent hide the menu (should be closed when action is loaded)
         *
         * @param {ClickEvent} ev
         */
        _onClickMenuItem: function(ev) {
            ev.stopPropagation();
        },

        /**
         * No menu brand in mobiles
         *
         * @override
         */
        _updateMenuBrand: function() {
            if (!config.device.isMobile) {
                return this._super.apply(this, arguments);
            }
        },
    });

    RelationalFields.FieldStatus.include({
        /**
         * Fold all on mobiles.
         *
         * @override
         */
        _setState: function() {
            this._super.apply(this, arguments);
            if (config.device.isMobile) {
                _.map(this.status_information, value => {
                    value.fold = true;
                });
            }
        },
    });

    // Sticky Column Selector
    ListRenderer.include({
        _renderView: function() {
            const self = this;
            return this._super.apply(this, arguments).then(() => {
                const $col_selector = self.$el.find(
                    ".o_optional_columns_dropdown_toggle"
                );
                if ($col_selector.length !== 0) {
                    const $th = self.$el.find("thead>tr:first>th:last");
                    $col_selector.appendTo($th);
                }
            });
        },

        _onToggleOptionalColumnDropdown: function(ev) {
            // FIXME: For some strange reason the 'stopPropagation' call
            // in the main method don't work. Invoking here the same method
            // does the expected behavior... O_O!
            // This prevents the action of sorting the column from being
            // launched.
            ev.stopPropagation();
            this._super.apply(this, arguments);
        },
    });

    // Responsive view "action" buttons
    FormRenderer.include({
        /**
         * In mobiles, put all statusbar buttons in a dropdown.
         *
         * @override
         */
        _renderHeaderButtons: function() {
            const $buttons = this._super.apply(this, arguments);
            if (
                !config.device.isMobile ||
                !$buttons.is(":has(>:not(.o_invisible_modifier))")
            ) {
                return $buttons;
            }

            // $buttons must be appended by JS because all events are bound
            $buttons.addClass("dropdown-menu");
            const $dropdown = $(
                core.qweb.render("web_responsive.MenuStatusbarButtons")
            );
            $buttons.addClass("dropdown-menu").appendTo($dropdown);
            return $dropdown;
        },
    });

    // Chatter Hide Composer
    Chatter.include({
        _openComposer: function(options) {
            if (
                this._composer &&
                options.isLog === this._composer.options.isLog &&
                this._composer.$el.is(":visible")
            ) {
                this._closeComposer(false);
            } else {
                this._super.apply(this, arguments);
            }
        },
    });

    // Hide AppDrawer or Menu when the action has been completed
    ActionManager.include({
        /**
         * @override
         */
        _appendController: function() {
            this._super.apply(this, arguments);
            closeAppDrawer();
        },
    });

    /**
     * Use ALT+SHIFT instead of ALT as hotkey triggerer.
     *
     * HACK https://github.com/odoo/odoo/issues/30068 - See it to know why.
     *
     * Cannot patch in `KeyboardNavigationMixin` directly because it's a mixin,
     * not a `Class`, and altering a mixin's `prototype` doesn't alter it where
     * it has already been used.
     *
     * Instead, we provide an additional mixin to be used wherever you need to
     * enable this behavior.
     */
    var KeyboardNavigationShiftAltMixin = {
        /**
         * Alter the key event to require pressing Shift.
         *
         * This will produce a mocked event object where it will seem that
         * `Alt` is not pressed if `Shift` is not pressed.
         *
         * The reason for this is that original upstream code, found in
         * `KeyboardNavigationMixin` is very hardcoded against the `Alt` key,
         * so it is more maintainable to mock its input than to rewrite it
         * completely.
         *
         * @param {keyEvent} keyEvent
         * Original event object
         *
         * @returns {keyEvent}
         * Altered event object
         */
        _shiftPressed: function(keyEvent) {
            const alt = keyEvent.altKey || keyEvent.key === "Alt",
                newEvent = _.extend({}, keyEvent),
                shift = keyEvent.shiftKey || keyEvent.key === "Shift";
            // Mock event to make it seem like Alt is not pressed
            if (alt && !shift) {
                newEvent.altKey = false;
                if (newEvent.key === "Alt") {
                    newEvent.key = "Shift";
                }
            }
            // Fix to make `Alt + Shift + A` shortcut working on Google Chrome.
            if (
                alt &&
                shift &&
                newEvent.keyCode == 65 &&
                this.BrowserDetection.isBrowserChrome()
            ) {
                setTimeout(() => $("a.full").click(), 0);
                newEvent.keyCode = 0;
            }
            return newEvent;
        },

        _onKeyDown: function(keyDownEvent) {
            return this._super(this._shiftPressed(keyDownEvent));
        },

        _onKeyUp: function(keyUpEvent) {
            return this._super(this._shiftPressed(keyUpEvent));
        },

        // Tune excluded keys for automatic assignment to buttons
        _getAllUsedAccessKeys: function() {
            var usedAccessKeys = this._super.apply(this, arguments);
            usedAccessKeys.push("I"); // 'Alt + Shift + I' isn't supported on Chrome
            usedAccessKeys.push("T"); // 'Alt + Shift + T' isn't supported on Chrome
            // Keys 'H' and 'J' no more reserved and can be used
            // Remove only first occurrence cause extra module can have self accesskey='h' or 'j' defined
            let index = usedAccessKeys.indexOf("J");
            if (index > -1) {
                usedAccessKeys.splice(index, 1);
            }
            index = usedAccessKeys.indexOf("H");
            if (index > -1) {
                usedAccessKeys.splice(index, 1);
            }
            return usedAccessKeys;
        },
    };

    // Include the SHIFT+ALT mixin wherever
    // `KeyboardNavigationMixin` is used upstream
    AbstractWebClient.include(KeyboardNavigationShiftAltMixin);

    // ControlPanelRenderer: Replace breadcrumbs accesskey to 'Q' cause 'Alt + Shift + B' doesn't work on Chrome
    ControlPanelRenderer.include({
        _renderBreadcrumbsItem: function() {
            var $bc = this._super.apply(this, arguments);
            if ($bc.attr("accessKey")) {
                $bc.attr("accessKey", "q");
            }
            return $bc;
        },
    });

    // DocumentViewer: Add support to maximize/minimize
    DocumentViewer.include({
        // Widget 'keydown' and 'keyup' events are only dispatched when
        // this.$el is active, but now the modal have buttons that can obtain
        // the focus. For this reason we now listen core events, that are
        // dispatched every time.
        events: _.extend(
            _.omit(DocumentViewer.prototype.events, ["keydown", "keyup"]),
            {
                "click .o_maximize_btn": "_onClickMaximize",
                "click .o_minimize_btn": "_onClickMinimize",
                "shown.bs.modal": "_onShownModal",
            }
        ),

        start: function() {
            core.bus.on("keydown", this, this._onKeydown);
            core.bus.on("keyup", this, this._onKeyUp);
            return this._super.apply(this, arguments);
        },

        destroy: function() {
            core.bus.off("keydown", this, this._onKeydown);
            core.bus.off("keyup", this, this._onKeyUp);
            this._super.apply(this, arguments);
        },

        _onShownModal: function() {
            // Disable auto-focus to allow to use controls in edit mode.
            // This only affects the active modal.
            // More info: https://stackoverflow.com/a/14795256
            $(document).off("focusin.modal");
        },
        _onClickMaximize: function() {
            this.$el.removeClass("o_responsive_document_viewer");
        },
        _onClickMinimize: function() {
            this.$el.addClass("o_responsive_document_viewer");
        },
    });
});
