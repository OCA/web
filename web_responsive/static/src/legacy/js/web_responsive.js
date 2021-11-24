/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_responsive", function (require) {
    "use strict";

    const config = require("web.config");
    const core = require("web.core");
    const FormRenderer = require("web.FormRenderer");
    const RelationalFields = require("web.relational_fields");
    const ViewDialogs = require("web.view_dialogs");
    const ListRenderer = require("web.ListRenderer");
    const CalendarRenderer = require("web.CalendarRenderer");

    const _t = core._t;

    // Fix for iOS Safari to set correct viewport height
    // https://github.com/Faisal-Manzer/postcss-viewport-height-correction
    function setViewportProperty(doc) {
        function handleResize() {
            requestAnimationFrame(function updateViewportHeight() {
                doc.style.setProperty("--vh100", doc.clientHeight + "px");
            });
        }
        handleResize();
        return handleResize;
    }
    window.addEventListener(
        "resize",
        _.debounce(setViewportProperty(document.documentElement), 100)
    );

    RelationalFields.FieldStatus.include({
        /**
         * Fold all on mobiles.
         *
         * @override
         */
        _setState: function () {
            this._super.apply(this, arguments);
            if (config.device.isMobile) {
                _.map(this.status_information, (value) => {
                    value.fold = true;
                });
            }
        },
    });

    // Sticky Column Selector
    ListRenderer.include({
        _renderView: function () {
            return this._super.apply(this, arguments).then(() => {
                const $col_selector = this.$el.find(
                    ".o_optional_columns_dropdown_toggle"
                );
                if ($col_selector.length !== 0) {
                    const $th = this.$el.find("thead>tr:first>th:last");
                    $col_selector.appendTo($th);
                }
            });
        },

        _onToggleOptionalColumnDropdown: function (ev) {
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
         * @override
         */
        on_attach_callback: function () {
            this._super.apply(this, arguments);
            core.bus.on("UI_CONTEXT:IS_SMALL_CHANGED", this, () => {
                this._applyFormSizeClass();
                this._render();
            });
        },
        /**
         * @override
         */
        on_detach_callback: function () {
            core.bus.off("UI_CONTEXT:IS_SMALL_CHANGED", this);
            this._super.apply(this, arguments);
        },
        /**
         * In mobiles, put all statusbar buttons in a dropdown.
         *
         * @override
         */
        _renderHeaderButtons: function () {
            const $buttons = this._super.apply(this, arguments);
            if (
                !config.device.isMobile ||
                $buttons.children("button:not(.o_invisible_modifier)").length <= 2
            ) {
                return $buttons;
            }

            // $buttons must be appended by JS because all events are bound
            const $dropdown = $(
                core.qweb.render("web_responsive.MenuStatusbarButtons")
            );
            $buttons.addClass("dropdown-menu").appendTo($dropdown);
            return $dropdown;
        },
    });

    /**
     * Directly open popup dialog in mobile for search.
     */
    RelationalFields.FieldMany2One.include({
        start: function () {
            var superRes = this._super.apply(this, arguments);
            if (config.device.isMobile) {
                this.$input.prop("readonly", true);
            }
            return superRes;
        },
        // --------------------------------------------------------------------------
        // Private
        // --------------------------------------------------------------------------

        /**
         * @private
         * @override
         */
        _bindAutoComplete: function () {
            if (!config.device.isMobile) {
                return this._super.apply(this, arguments);
            }
        },

        /**
         * @private
         * @override
         */
        _getSearchCreatePopupOptions: function () {
            const options = this._super.apply(this, arguments);
            _.extend(options, {
                on_clear: () => this.reinitialize(false),
            });
            return options;
        },

        /**
         * @private
         * @override
         */
        _toggleAutoComplete: function () {
            if (config.device.isMobile) {
                this._searchCreatePopup("search");
            } else {
                return this._super.apply(this, arguments);
            }
        },
    });

    /**
     * Support for Clear button in search popup.
     */
    ViewDialogs.SelectCreateDialog.include({
        init: function () {
            this._super.apply(this, arguments);
            this.on_clear =
                this.options.on_clear ||
                function () {
                    return undefined;
                };
        },
        /**
         * @override
         */
        _prepareButtons: function () {
            this._super.apply(this, arguments);
            if (config.device.isMobile && this.options.disable_multiple_selection) {
                this.__buttons.push({
                    text: _t("Clear"),
                    classes: "btn-secondary o_clear_button",
                    close: true,
                    click: function () {
                        this.on_clear();
                    },
                });
            }
        },
    });

    CalendarRenderer.include({
        /**
         * @override
         */
        on_attach_callback: function () {
            this._super.apply(this, arguments);
            core.bus.on("UI_CONTEXT:IS_SMALL_CHANGED", this, () => {
                // Hack to force calendar to reload their options and rerender
                this.calendar.setOption("locale", moment.locale());
            });
        },
        /**
         * @override
         */
        on_detach_callback: function () {
            core.bus.off("UI_CONTEXT:IS_SMALL_CHANGED", this);
            this._super.apply(this, arguments);
        },
        /**
         * @override
         */
        _getFullCalendarOptions: function () {
            const options = this._super.apply(this, arguments);
            Object.defineProperty(options.views.dayGridMonth, "columnHeaderFormat", {
                get() {
                    return config.device.isMobile ? "ddd" : "dddd";
                },
            });
            return options;
        },
    });
});
