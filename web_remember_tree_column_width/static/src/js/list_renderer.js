odoo.define("remember_tree_column_width.ListRenderer", function (require) {
    "use strict";

    const ListRenderer = require("web.ListRenderer");
    ListRenderer.include({
        events: Object.assign({}, ListRenderer.prototype.events, {
            "pointerdown th .o_resize": "_onMouseDownResize",
            mouseup: "_onMouseUpResize",
        }),
        _onMouseDownResize: function () {
            this.resizeInProgress = true;
        },
        _getLocalStorageWidthColumnName: function (model, field) {
            return "odoo.columnWidth." + model + "." + field;
        },
        _onMouseUpResize: function (ev) {
            if (this.resizeInProgress) {
                this.resizeInProgress = false;
                const target = $(ev.target);
                const $th = target.is("th") ? target : target.parent("th");
                const fieldName = $th.length ? $th.data("name") : undefined;
                if (
                    this.state &&
                    this.state.model &&
                    fieldName &&
                    window.localStorage
                ) {
                    window.localStorage.setItem(
                        this._getLocalStorageWidthColumnName(
                            this.state.model,
                            fieldName
                        ),
                        parseInt(($th[0].style.width || "0").replace("px", "")) || 0
                    );
                }
            }
        },
        _squeezeTable: function () {
            const columnWidths = this._super.apply(this, arguments);

            const table = this.el.getElementsByTagName("table")[0];
            const thead = table.getElementsByTagName("thead")[0];
            const thElements = [...thead.getElementsByTagName("th")];

            const self = this;
            thElements.forEach(function (el, elIndex) {
                const fieldName = $(el).data("name");
                if (
                    self.state &&
                    self.state.model &&
                    fieldName &&
                    window.localStorage
                ) {
                    const storedWidth = window.localStorage.getItem(
                        self._getLocalStorageWidthColumnName(
                            self.state.model,
                            fieldName
                        )
                    );
                    if (storedWidth) {
                        columnWidths[elIndex] = parseInt(storedWidth);
                    }
                }
            });

            return columnWidths;
        },
    });
});
