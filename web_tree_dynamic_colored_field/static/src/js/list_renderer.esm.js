import {ListRenderer} from "@web/views/list/list_renderer";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        this.assignDefaultColorFields();
    },

    /**
     * Look up for a `fg_color_field` or `bg_color_field` parameter in list `colors` attribute
     */
    assignDefaultColorFields() {
        this.fgColorField = null;
        this.bgColorField = null;
        if ("colors" in this.props.archInfo.xmlDoc.attributes) {
            // Colors attribute is present in the view definition
            const colorAttr =
                this.props.archInfo.xmlDoc.attributes.colors.value.split(";");
            for (var i = 0, len = colorAttr.length; i < len; i++) {
                var attr = colorAttr[i].split(":");
                if (attr.length == 2) {
                    var colorType = attr[0].trim();
                    var colorField = attr[1].trim();
                    if (colorType && colorField) {
                        if (colorType === "fg_color_field") {
                            this.fgColorField = colorField;
                        } else if (colorType === "bg_color_field") {
                            this.bgColorField = colorField;
                        }
                    }
                } else {
                    console.warn("Invalid colors attribute:", attr);
                }
            }
        }
    },

    /**
     * @param {Object} column represents field
     * @param {Record} record
     * @returns {String} style code for the html element
     */
    getDynamicColoredStyle(column, record) {
        let style = "";

        // 1. Get dynamic colors from column options
        let backgroundColor = this.getDynamicColor(column, record, "bg_color");
        let foregroundColor = this.getDynamicColor(column, record, "fg_color");

        // 2. Get colors from specified fields in record data only if not set dynamically
        if (!backgroundColor && this.bgColorField) {
            if (this.bgColorField in record.data) {
                backgroundColor = record.data[this.bgColorField];
            } else {
                console.warn(`No field named "${this.bgColorField}" present in view.`);
            }
        }
        if (!foregroundColor && this.fgColorField) {
            if (this.fgColorField in record.data) {
                foregroundColor = record.data[this.fgColorField];
            } else {
                console.warn(`No field named "${this.fgColorField}" present in view.`);
            }
        }

        // Apply styles
        if (backgroundColor !== undefined) {
            style += `background-color: ${backgroundColor};`;
        }
        if (foregroundColor !== undefined) {
            style += `color: ${foregroundColor};`;
        }
        return style;
    },

    /**
     * Return the `color` that has truthfull expresssion
     *
     * @param {Object} column represents field
     * @param {Record} record
     * @param {String} color_target 'bg_color' or 'fg_color'
     * @returns {String | undefined} color
     */
    getDynamicColor(column, record, color_target) {
        if (color_target in column.options) {
            const definition = column.options[color_target];
            let result = "";
            for (const color_def of definition.split(";")) {
                const color_to_expression = this.pairColorParse(color_def);
                if (color_to_expression !== undefined) {
                    var [color, expression] = color_to_expression;
                    // Check if color is a named field in record
                    // and if so, get its value
                    if (color in record.data) {
                        color = record.data[color];
                    }
                    if (
                        evaluateBooleanExpr(
                            expression,
                            record.evalContextWithVirtualIds
                        )
                    ) {
                        // We don't return first match,
                        // as it can be default color (with "True" expression),
                        // and later more precise condition may be found.
                        result = color;
                    }
                }
            }
            return result || undefined;
        }
    },

    /**
     * @param {String} pairColor `color: expression` pair
     * @returns {Array} undefined or array of color, expression
     */
    pairColorParse: function (pairColor) {
        if (pairColor !== "") {
            var pairList = pairColor.split(":"),
                color = pairList[0],
                // If one passes a bare color instead of an expression,
                // then we consider that color is to be shown in any case
                expression = pairList[1] ? pairList[1] : "True";
            return [color.trim(), expression.trim()];
        }
        return undefined;
    },
});
