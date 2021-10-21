/* Copyright 2019 Odoo S.A.
 * Copyright 2021 ITerra - Sergey Shebanin
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_responsive.KanbanRendererMobile", function (require) {
    "use strict";

    /**
     * The purpose of this file is to improve the UX of grouped kanban views in
     * mobile. It includes the KanbanRenderer (in mobile only) to only display one
     * column full width, and enables the swipe to browse to the other columns.
     * Moreover, records in columns are lazy-loaded.
     */

    const config = require("web.config");
    const core = require("web.core");
    const KanbanRenderer = require("web.KanbanRenderer");
    const KanbanView = require("web.KanbanView");
    const KanbanQuickCreate = require("web.kanban_column_quick_create");

    const _t = core._t;
    const qweb = core.qweb;

    KanbanQuickCreate.include({
        init() {
            this._super.apply(this, arguments);
            this.isMobile = config.device.isMobile;
        },
        /**
         * KanbanRenderer will decide can we close quick create or not
         * @private
         * @override
         */
        _cancel: function () {
            if (config.device.isMobile) {
                this.trigger_up("close_quick_create");
            }
        },
        /**
         * Clear input when showed
         * @override
         */
        toggleFold: function () {
            this._super.apply(this, arguments);
            if (config.device.isMobile && !this.folded) {
                this.$input.val("");
            }
        },
    });

    KanbanView.include({
        init() {
            this._super.apply(this, arguments);
            this.jsLibs.push("/web/static/lib/jquery.touchSwipe/jquery.touchSwipe.js");
        },
    });

    KanbanRenderer.include({
        custom_events: _.extend({}, KanbanRenderer.prototype.custom_events || {}, {
            quick_create_column_created: "_onColumnAdded",
        }),
        events: _.extend({}, KanbanRenderer.prototype.events, {
            "click .o_kanban_mobile_tab": "_onMobileTabClicked",
            "click .o_kanban_mobile_add_column": "_onMobileQuickCreateClicked",
        }),
        ANIMATE: true, // Allows to disable animations for the tests
        /**
         * @override
         */
        init: function () {
            this._super.apply(this, arguments);
            this.activeColumnIndex = 0; // Index of the currently displayed column
            this._scrollPosition = null;
        },
        /**
         * As this renderer defines its own scrolling area (the column in grouped
         * mode), we override this hook to restore the scroll position like it was
         * when the renderer has been last detached.
         *
         * @override
         */
        on_attach_callback: function () {
            if (config.device.isMobile) {
                if (
                    this._scrollPosition &&
                    this.state.groupedBy.length &&
                    this.widgets.length
                ) {
                    const $column = this.widgets[this.activeColumnIndex].$el;
                    $column.scrollLeft(this._scrollPosition.left);
                    $column.scrollTop(this._scrollPosition.top);
                }
                this._computeTabPosition();
            }
            this._super.apply(this, arguments);
            core.bus.on("UI_CONTEXT:IS_SMALL_CHANGED", this, () => {
                this.widgets = [];
                this.columnOptions.recordsDraggable = !config.device.isMobile;
                this._renderView();
            });
        },
        /**
         * As this renderer defines its own scrolling area (the column in grouped
         * mode), we override this hook to store the scroll position, so that we can
         * restore it if the renderer is re-attached to the DOM later.
         *
         * @override
         */
        on_detach_callback: function () {
            if (this.state.groupedBy.length && this.widgets.length) {
                const $column = this.widgets[this.activeColumnIndex].$el;
                this._scrollPosition = {
                    left: $column.scrollLeft(),
                    top: $column.scrollTop(),
                };
            } else {
                this._scrollPosition = null;
            }
            core.bus.off("UI_CONTEXT:IS_SMALL_CHANGED", this);
            this._super.apply(this, arguments);
        },

        // --------------------------------------------------------------------------
        // Public
        // --------------------------------------------------------------------------

        /**
         * Displays the quick create record in the active column
         * override to open quick create record in current active column
         *
         * @override
         * @returns {Promise}
         */
        addQuickCreate: function () {
            if (config.device.isMobile) {
                if (
                    this._canCreateColumn() &&
                    this.quickCreate &&
                    !this.quickCreate.folded
                ) {
                    this._onMobileQuickCreateClicked();
                }
                return this.widgets[this.activeColumnIndex].addQuickCreate();
            }
            return this._super.apply(this, arguments);
        },

        /**
         * Overrides to restore the left property and the scrollTop on the updated
         * column, and to enable the swipe handlers
         *
         * @override
         */
        updateColumn: function (localID) {
            if (config.device.isMobile) {
                const index = _.findIndex(this.widgets, {db_id: localID});
                const $column = this.widgets[index].$el;
                const scrollTop = $column.scrollTop();
                return (
                    this._super
                        .apply(this, arguments)
                        .then(() => this._layoutUpdate(false))
                        // Required when clicking on 'Load More'
                        .then(() => $column.scrollTop(scrollTop))
                        .then(() => this._enableSwipe())
                );
            }
            return this._super.apply(this, arguments);
        },

        // --------------------------------------------------------------------------
        // Private
        // --------------------------------------------------------------------------
        /**
         * Avoid drag'n'drop of kanban records on mobile and let the way to swipe
         * @private
         */
        _setState: function () {
            const res = this._super.apply(this, arguments);
            this.columnOptions.recordsDraggable = !config.device.isMobile;
            return res;
        },
        /**
         * Check if we use the quick create on mobile
         * @returns {Boolean}
         * @private
         */
        _canCreateColumn: function () {
            return this.quickCreateEnabled && this.quickCreate && this.widgets.length;
        },

        /**
         * Update the columns positions
         *
         * @private
         * @param {Boolean} [animate=false] set to true to animate
         */
        _computeColumnPosition: function (animate) {
            if (this.widgets.length) {
                // Check rtl to compute correct css value
                const rtl = _t.database.parameters.direction === "rtl";

                // Display all o_kanban_group
                this.$(".o_kanban_group").show();

                const $columnAfter = this._toNode(
                    this.widgets.filter(
                        (widget, index) => index > this.activeColumnIndex
                    )
                );
                const promiseAfter = this._updateColumnCss(
                    $columnAfter,
                    rtl ? {right: "100%"} : {left: "100%"},
                    animate
                );

                const $columnBefore = this._toNode(
                    this.widgets.filter(
                        (widget, index) => index < this.activeColumnIndex
                    )
                );
                const promiseBefore = this._updateColumnCss(
                    $columnBefore,
                    rtl ? {right: "-100%"} : {left: "-100%"},
                    animate
                );

                const $columnCurrent = this._toNode(
                    this.widgets.filter(
                        (widget, index) => index === this.activeColumnIndex
                    )
                );
                const promiseCurrent = this._updateColumnCss(
                    $columnCurrent,
                    rtl ? {right: "0%"} : {left: "0%"},
                    animate
                );

                promiseAfter
                    .then(promiseBefore)
                    .then(promiseCurrent)
                    .then(() => {
                        $columnAfter.hide();
                        $columnBefore.hide();
                    });
            }
        },

        /**
         * Define the o_current class to the current selected kanban (column & tab)
         *
         * @private
         */
        _computeCurrentColumn: function () {
            if (this.widgets.length) {
                const column = this.widgets[this.activeColumnIndex];
                if (!column) {
                    return;
                }
                const columnID = column.id || column.db_id;
                this.$(
                    ".o_kanban_mobile_tab.o_current, .o_kanban_group.o_current"
                ).removeClass("o_current");
                this.$(
                    '.o_kanban_group[data-id="' +
                        columnID +
                        '"], ' +
                        '.o_kanban_mobile_tab[data-id="' +
                        columnID +
                        '"]'
                ).addClass("o_current");
            }
        },

        /**
         * Update the tabs positions
         *
         * @private
         */
        _computeTabPosition: function () {
            this._computeTabJustification();
            this._computeTabScrollPosition();
        },

        /**
         * Update the tabs positions
         *
         * @private
         */
        _computeTabScrollPosition: function () {
            if (this.widgets.length) {
                const lastItemIndex = this.widgets.length - 1;
                const moveToIndex = this.activeColumnIndex;
                let scrollToLeft = 0;
                for (let i = 0; i < moveToIndex; i++) {
                    const columnWidth = this._getTabWidth(this.widgets[i]);
                    // Apply
                    if (moveToIndex !== lastItemIndex && i === moveToIndex - 1) {
                        const partialWidth = 0.75;
                        scrollToLeft += columnWidth * partialWidth;
                    } else {
                        scrollToLeft += columnWidth;
                    }
                }
                // Apply the scroll x on the tabs
                // XXX in case of RTL, should we use scrollRight?
                this.$(".o_kanban_mobile_tabs").scrollLeft(scrollToLeft);
            }
        },

        /**
         * Compute the justify content of the kanban tab headers
         *
         * @private
         */
        _computeTabJustification: function () {
            if (this.widgets.length) {
                // Use to compute the sum of the width of all tab
                const widthChilds = this.widgets.reduce((total, column) => {
                    return total + this._getTabWidth(column);
                }, 0);
                // Apply a space around between child if the parent length is higher then the sum of the child width
                const $tabs = this.$(".o_kanban_mobile_tabs");
                $tabs.toggleClass(
                    "justify-content-between",
                    $tabs.outerWidth() >= widthChilds
                );
            }
        },

        /**
         * Enables swipe event on the current column
         *
         * @private
         */
        _enableSwipe: function () {
            const step = _t.database.parameters.direction === "rtl" ? -1 : 1;
            this.$el.swipe({
                excludedElements: ".o_kanban_mobile_tabs",
                swipeLeft: () => {
                    if (!config.device.isMobile) {
                        return;
                    }
                    const moveToIndex = this.activeColumnIndex + step;
                    if (moveToIndex < this.widgets.length) {
                        this._moveToGroup(moveToIndex, this.ANIMATE);
                    }
                },
                swipeRight: () => {
                    if (!config.device.isMobile) {
                        return;
                    }
                    const moveToIndex = this.activeColumnIndex - step;
                    if (moveToIndex > -1) {
                        this._moveToGroup(moveToIndex, this.ANIMATE);
                    }
                },
            });
        },

        /**
         * Retrieve the outerWidth of a given widget column
         *
         * @param {KanbanColumn} column
         * @returns {integer} outerWidth of the found column
         * @private
         */
        _getTabWidth: function (column) {
            const columnID = column.id || column.db_id;
            return this.$(
                '.o_kanban_mobile_tab[data-id="' + columnID + '"]'
            ).outerWidth();
        },

        /**
         * Update the kanban layout
         *
         * @private
         * @param {Boolean} [animate=false] set to true to animate
         */
        _layoutUpdate: function (animate) {
            this._computeCurrentColumn();
            this._computeTabPosition();
            this._computeColumnPosition(animate);
            this._enableSwipe();
        },

        /**
         * Moves to the given kanban column
         *
         * @private
         * @param {integer} moveToIndex index of the column to move to
         * @param {Boolean} [animate=false] set to true to animate
         * @returns {Promise} resolved when the new current group has been loaded
         *   and displayed
         */
        _moveToGroup: function (moveToIndex, animate) {
            if (this.widgets.length === 0) {
                return Promise.resolve();
            }
            if (moveToIndex >= 0 && moveToIndex < this.widgets.length) {
                this.activeColumnIndex = moveToIndex;
            }
            const column = this.widgets[this.activeColumnIndex];
            this._enableSwipe();
            if (!column.data.isOpen) {
                this.trigger_up("column_toggle_fold", {
                    db_id: column.db_id,
                    onSuccess: () => this._layoutUpdate(animate),
                });
            } else {
                this._layoutUpdate(animate);
            }
            return Promise.resolve();
        },
        /**
         * @override
         * @private
         */
        _renderExampleBackground: function () {
            // Override to avoid display of example background
            if (!config.device.isMobile) {
                this._super.apply(this, arguments);
            }
        },
        /**
         * @override
         * @private
         */
        _renderGrouped: function (fragment) {
            if (config.device.isMobile) {
                const newFragment = document.createDocumentFragment();
                this._super.apply(this, [newFragment]);
                this.defs.push(
                    Promise.all(this.defs).then(() => {
                        const data = [];
                        _.each(this.state.data, function (group) {
                            if (!group.value) {
                                group = _.extend({}, group, {value: _t("Undefined")});
                                data.unshift(group);
                            } else {
                                data.push(group);
                            }
                        });

                        const kanbanColumnContainer = document.createElement("div");
                        kanbanColumnContainer.classList.add("o_kanban_columns_content");
                        kanbanColumnContainer.appendChild(newFragment);
                        fragment.appendChild(kanbanColumnContainer);
                        $(
                            qweb.render("KanbanView.MobileTabs", {
                                data: data,
                                quickCreateEnabled: this._canCreateColumn(),
                            })
                        ).prependTo(fragment);
                    })
                );
            } else {
                this._super.apply(this, arguments);
            }
        },

        /**
         * @override
         * @private
         */
        _renderView: function () {
            const def = this._super.apply(this, arguments);
            if (!config.device.isMobile) {
                return def;
            }
            return def.then(() => {
                if (this.state.groupedBy.length) {
                    // Force first column for kanban view, because the groupedBy can be changed
                    return this._moveToGroup(0);
                }
                if (this._canCreateColumn()) {
                    this._onMobileQuickCreateClicked();
                }
                return Promise.resolve();
            });
        },

        /**
         * Retrieve the Jquery node (.o_kanban_group) for a list of a given widgets
         *
         * @private
         * @param widgets
         * @returns {jQuery} the matching .o_kanban_group widgets
         */
        _toNode: function (widgets) {
            const selectorCss = widgets
                .map(
                    (widget) =>
                        '.o_kanban_group[data-id="' + (widget.id || widget.db_id) + '"]'
                )
                .join(", ");
            return this.$(selectorCss);
        },

        /**
         * Update the given column to the updated positions
         *
         * @private
         * @param $column The jquery column
         * @param cssProperties Use to update column
         * @param {Boolean} [animate=false] set to true to animate
         * @returns {Promise}
         */
        _updateColumnCss: function ($column, cssProperties, animate) {
            if (animate) {
                return new Promise((resolve) =>
                    $column.animate(cssProperties, "fast", resolve)
                );
            }
            $column.css(cssProperties);
            return Promise.resolve();
        },

        // --------------------------------------------------------------------------
        // Handlers
        // --------------------------------------------------------------------------

        /**
         * @private
         */
        _onColumnAdded: function () {
            this._computeTabPosition();
            if (this._canCreateColumn() && !this.quickCreate.folded) {
                this.quickCreate.toggleFold();
            }
        },

        /**
         * @private
         */
        _onMobileQuickCreateClicked: function (event) {
            if (event) {
                event.stopPropagation();
            }
            this.quickCreate.toggleFold();
            this.$(".o_kanban_group").toggle(this.quickCreate.folded);
        },
        /**
         * @private
         * @param {MouseEvent} event
         */
        _onMobileTabClicked: function (event) {
            if (this._canCreateColumn() && !this.quickCreate.folded) {
                this.quickCreate.toggleFold();
            }
            this._moveToGroup($(event.currentTarget).index(), true);
        },
        /**
         * @private
         * @override
         */
        _onCloseQuickCreate: function () {
            if (this.widgets.length && this.quickCreate && !this.quickCreate.folded) {
                this.$(".o_kanban_group").toggle(true);
                this.quickCreate.toggleFold();
            }
        },
    });
});
