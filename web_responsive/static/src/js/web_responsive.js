/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

odoo.define('web_responsive', function(require) {
    'use strict';

    var Menu = require('web.Menu');
    var Class = require('web.Class');
    var DataModel = require('web.DataModel');
    var SearchView = require('web.SearchView');
    var core = require('web.core');
    var config = require('web.config');
    var FieldOne2Many = core.form_widget_registry.get('one2many');
    var ViewManager = require('web.ViewManager');

    Menu.include({

        // Force all_outside to prevent app icons from going into more menu
        reflow: function() {
            this._super('all_outside');
        },

        /* Overload to collapse unwanted visible submenus
         * @param allow_open bool Switch to allow submenus to be opened
         */
        open_menu: function(id, allowOpen) {
            this._super(id);
            if (allowOpen) return;
            var $clicked_menu = this.$secondary_menus.find('a[data-menu=' + id + ']');
            $clicked_menu.parents('.oe_secondary_submenu').css('display', '');
        },

    });

    SearchView.include({

        // Prevent focus of search field on mobile devices
        toggle_visibility: function (is_visible) {
            $('div.oe_searchview_input').last()
                .one('focus', $.proxy(this.preventMobileFocus, this));
            return this._super(is_visible);
        },

        // It prevents focusing of search el on mobile
        preventMobileFocus: function(event) {
            if (this.isMobile()) {
                event.preventDefault();
            }
        },

        // For lack of Modernizr, TouchEvent will do
        isMobile: function () {
            try{
                document.createEvent('TouchEvent');
                return true;
            } catch (ex) {
                return false;
            }
        },

    });

    var AppDrawer = Class.extend({

        /* Provides all features inside of the application drawer navigation.

        Attributes:
            directionCodes (str): Canonical key name to direction mappings.
            deleteCodes
         */

        LEFT: 'left',
        RIGHT: 'right',
        UP: 'up',
        DOWN: 'down',

        // These keys are ignored when presented as single input
        MODIFIERS: [
            'Alt',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'Control',
            'Enter',
            'Escape',
            'Meta',
            'Shift',
            'Tab',
        ],

        isOpen: false,
        keyBuffer: '',
        keyBufferTime: 500,
        keyBufferTimeoutEvent: false,
        dropdownHeightFactor: 0.90,
        initialized: false,
        searching: false,

        init: function() {

            this.directionCodes = {
                'left': this.LEFT,
                'right': this.RIGHT,
                'up': this.UP,
                'pageup': this.UP,
                'down': this.DOWN,
                'pagedown': this.DOWN,
                '+': this.RIGHT,
                '-': this.LEFT,
            };
            this.$searchAction = $('.app-drawer-search-action');
            this.$searchAction.hide();
            this.$searchResultsContainer = $('#appDrawerSearchResults');
            this.$searchInput = $('#appDrawerSearchInput');
            this.initDrawer();
            this.handleWindowResize();
            var $clickZones = $('.odoo_webclient_container, ' +
                                'a.oe_menu_leaf, ' +
                                'a.oe_menu_toggler, ' +
                                'a.oe_logo, ' +
                                'i.oe_logo_edit'
                                );

            $clickZones.click($.proxy(this.handleClickZones, this));

            this.$searchResultsContainer.click($.proxy(this.searchMenus, this));

            this.$el.find('.drawer-search-open').click(
                $.proxy(this.searchMenus, this)
            );
            this.$el.find('.drawer-search-close').hide().click(
                $.proxy(this.closeSearchMenus, this)
            );

            core.bus.on('resize', this, this.handleWindowResize);
            core.bus.on('keydown', this, this.handleKeyDown);
            core.bus.on('keyup', this, this.redirectKeyPresses);
            core.bus.on('keypress', this, this.redirectKeyPresses);
        },

        // Provides initialization handlers for Drawer
        initDrawer: function() {
            this.$el = $('.drawer');
            this.$el.drawer();
            this.$el.one('drawer.opened', $.proxy(this.onDrawerOpen, this));
            // Setup the iScroll options.
            // You should be able to pass these to ``.drawer``, but scroll freezes.
            this.$el.on(
                'drawer.opened',
                function setIScrollProbes(){
                    var onIScroll = $.proxy(
                        function() {
                            this.iScroll.refresh();
                        },
                        this
                    );
                    // Scroll probe aggressiveness level
                    // 2 == always executes the scroll event except during momentum and bounce.
                    this.iScroll.options.probeType = 2;
                    this.iScroll.on('scroll', onIScroll);
                    // Initialize Scrollbars manually
                    this.iScroll.options.scrollbars = true;
                    this.iScroll.options.fadeScrollbars = true;
                    this.iScroll._initIndicators();
                }
            );
            this.initialized = true;
        },

        // Provides handlers to hide drawer when "unfocused"
        handleClickZones: function() {
            this.$el.drawer('close');
            $('.o_sub_menu_content')
                .parent()
                .collapse('hide');
            $('.navbar-collapse').collapse('hide');
        },

        // Resizes bootstrap dropdowns for screen
        handleWindowResize: function() {
            $('.dropdown-scrollable').css(
                'max-height', $(window).height() * this.dropdownHeightFactor
            );
        },

        /* Provide keyboard shortcuts for app drawer nav.
         *
         * It is required to perform this functionality only on the ``keydown``
         * event in order to prevent duplication of the arrow events.
         *
         * @param e The ``keydown`` event triggered by ``core.bus``.
         */
        handleKeyDown: function(e) {
            if (!this.isOpen){
                return;
            }
            var directionCode = $.hotkeys.specialKeys[e.keyCode.toString()];
            if (Object.keys(this.directionCodes).indexOf(directionCode) !== -1) {

                if (this.searching) {
                    var $collection = this.$el.find('#appDrawerMenuSearch a');
                    var $link = this.findAdjacentLink(
                        this.$el.find('#appDrawerMenuSearch a:first, #appDrawerMenuSearch a.web-responsive-focus').last(),
                        this.directionCodes[directionCode],
                        $collection,
                        true
                    );
                } else {
                    var $link = this.findAdjacentLink(
                        this.$el.find('#appDrawerApps a:first, #appDrawerApps a.web-responsive-focus').last(),
                        this.directionCodes[directionCode]
                    );
                }
                this.selectLink($link);
            } else if ($.hotkeys.specialKeys[e.keyCode.toString()] == 'esc') {
                // We either back out of the search, or close the app drawer.
                if (this.searching) {
                    this.closeSearchMenus();
                } else {
                    this.handleClickZones();
                }
            } else {
                this.redirectKeyPresses(e);
            }
        },

        /* Provide centralized key event redirects for the App Drawer.
         *
         * This method is for all key events not related to arrow navigation.
         *
         * @param e The key event that was triggered by ``core.bus``.
         */
        redirectKeyPresses: function(e) {

            if ( !this.isOpen ) {
                // Drawer isn't open; Ignore.
                return;
            }

            // Trigger navigation to pseudo-focused link
            // & fake a click (in case of anchor link).
            if (e.key === 'Enter') {
                window.location.href = $('.web-responsive-focus').attr('href');
                this.handleClickZones();
                return;
            }

            // Ignore any other modifier keys.
            if (this.MODIFIERS.indexOf(e.key) !== -1) {
                return;
            }

            // Event is already targeting the search input.
            // Perform search, then stop processing.
            if ( e.target === this.$searchInput[0] ) {
                this.searchMenus();
                return;
            }

            // Prevent default event,
            // redirect it to the search input,
            // and search.
            e.preventDefault();
            this.$searchInput.trigger({
                type: e.type,
                key: e.key,
                keyCode: e.keyCode,
                which: e.which,
            });
            this.searchMenus();

        },

        /* Performs close actions
         * @fires ``drawer.closed`` to the ``core.bus``
         * @listens ``drawer.opened`` and sends to onDrawerOpen
         */
        onDrawerClose: function() {
            this.closeSearchMenus();
            this.$searchAction.hide();
            core.bus.trigger('drawer.closed');
            this.$el.one('drawer.opened', $.proxy(this.onDrawerOpen, this));
            this.isOpen = false;
            // Remove inline style inserted by drawer.js
            this.$el.css("overflow", "");
        },

        /* Finds app links and register event handlers
         * @fires ``drawer.opened`` to the ``core.bus``
         * @listens ``drawer.closed`` and sends to :meth:``onDrawerClose``
         */
        onDrawerOpen: function() {
            this.$appLinks = $('.app-drawer-icon-app').parent();
            this.selectLink($(this.$appLinks[0]));
            this.$el.one('drawer.closed', $.proxy(this.onDrawerClose, this));
            core.bus.trigger('drawer.opened');
            this.isOpen = true;
        },

        // Selects a link visibly & deselects others.
        selectLink: function($link) {
            $('.web-responsive-focus').removeClass('web-responsive-focus');
            if ($link) {
                $link.addClass('web-responsive-focus');
            }
        },

        /* Searches for menus by name, then triggers showFoundMenus
         * @param query str to search
         * @return jQuery obj
         */
        searchMenus: function() {
            this.$searchInput = $('#appDrawerSearchInput').focus();
            var Menus = new DataModel('ir.ui.menu');
            Menus.query(['action', 'display_name', 'id'])
                .filter([['name', 'ilike', this.$searchInput.val()],
                         ['action', '!=', false]
                         ])
                .all()
                .then($.proxy(this.showFoundMenus, this));
        },

        /* Display the menus that are provided as input.
         */
        showFoundMenus: function(menus) {
            this.searching = true;
            this.$el.find('#appDrawerApps').hide();
            this.$searchAction.hide();
            this.$el.find('.drawer-search-close').show();
            this.$el.find('.drawer-search-open').hide();
            this.$searchResultsContainer
                // Render the results
                .html(
                    core.qweb.render(
                        'AppDrawerMenuSearchResults',
                        {menus: menus}
                    )
                )
                // Get the parent container and show it.
                .closest('#appDrawerMenuSearch')
                .show()
                // Find the input, set focus.
                .find('.menu-search-query')
                .focus()
            ;
            var $menuLinks = this.$searchResultsContainer.find('a');
            $menuLinks.click($.proxy(this.handleClickZones, this));
            this.selectLink($menuLinks.first());
        },

        /* Close search menu and switch back to app menu.
         */
        closeSearchMenus: function() {
            this.searching = false;
            this.$el.find('#appDrawerApps').show();
            this.$el.find('.drawer-search-close').hide();
            this.$el.find('.drawer-search-open').show();
            this.$searchResultsContainer.closest('#appDrawerMenuSearch').hide();
            this.$searchAction.show();
            $('#appDrawerSearchInput').val('');
        },

        /* Returns the link adjacent to $link in provided direction.
         * It also handles edge cases in the following ways:
         *   * Moves to last link if LEFT on first
         *   * Moves to first link if PREV on last
         *   * Moves to first link of following row if RIGHT on last in row
         *   * Moves to last link of previous row if LEFT on first in row
         *   * Moves to top link in same column if DOWN on bottom row
         *   * Moves to bottom link in same column if UP on top row
         * @param $link jQuery obj of App icon link
         * @param direction str of direction to go (constants LEFT, UP, etc.)
         * @param $objs jQuery obj representing the collection of links. Defaults
         *  to `this.$appLinks`.
         * @param restrictHorizontal bool Set to true if the collection consists
         *  only of vertical elements.
         * @return jQuery obj for adjacent link
         */
        findAdjacentLink: function($link, direction, $objs, restrictHorizontal) {

            if ($objs === undefined) {
                $objs = this.$appLinks;
            }

            var obj = [];
            var $rows = (restrictHorizontal) ? $objs : this.getRowObjs($link, this.$appLinks);

            switch(direction){
                case this.LEFT:
                    obj = $objs[$objs.index($link) - 1];
                    if (!obj) {
                        obj = $objs[$objs.length - 1];
                    }
                    break;
                case this.RIGHT:
                    obj = $objs[$objs.index($link) + 1];
                    if (!obj) {
                        obj = $objs[0];
                    }
                    break;
                case this.UP:
                    obj = $rows[$rows.index($link) - 1];
                    if (!obj) {
                        obj = $rows[$rows.length - 1];
                    }
                    break;
                case this.DOWN:
                    obj = $rows[$rows.index($link) + 1];
                    if (!obj) {
                        obj = $rows[0];
                    }
                    break;
            }

            if (obj.length) {
                event.preventDefault();
            }

            return $(obj);

        },

        /* Returns els in the same row
         * @param @obj jQuery object to get row for
         * @param $grid jQuery objects representing grid
         * @return $objs jQuery objects of row
         */
        getRowObjs: function($obj, $grid) {
            // Filter by object which middle lies within left/right bounds
            function filterWithin(left, right) {
                return function() {
                    var $this = $(this),
                        thisMiddle = $this.offset().left + ($this.width() / 2);
                    return thisMiddle >= left && thisMiddle <= right;
                };
            }
            var left = $obj.offset().left,
                right = left + $obj.outerWidth();
            return $grid.filter(filterWithin(left, right));
        },

    });

    // Init a new AppDrawer when the web client is ready
    core.bus.on('web_client_ready', null, function () {
        new AppDrawer();
    });

    // if we are in small screen change default view to kanban if exists
    ViewManager.include({
        get_default_view: function() {
            var default_view = this._super()
            if (config.device.size_class <= config.device.SIZES.XS &&
                default_view.type != 'kanban' &&
                this.views['kanban'])
                {
                    default_view.type = 'kanban';
                };
            return default_view;
        },
    });

    return {
        'AppDrawer': AppDrawer,
        'SearchView': SearchView,
        'Menu': Menu,
        'ViewManager': ViewManager,
    };

});
