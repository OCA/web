/* Copyright 2018 Tecnativa - Jairo Llopis
 * Copyright 2021 ITerra - Sergey Shebanin
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */
odoo.define("web_responsive", function (require) {
    "use strict";

    const config = require("web.config");
    const core = require("web.core");
    const FormRenderer = require("web.FormRenderer");
    const RelationalFields = require("web.relational_fields");
    const ListRenderer = require("web.ListRenderer");
    const CalendarRenderer = require("web.CalendarRenderer");

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
