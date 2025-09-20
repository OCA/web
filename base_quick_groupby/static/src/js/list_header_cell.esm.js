/** @odoo-module */
import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

patch(ListRenderer.prototype, {
    /**
     * Check whether a column can be used for grouping.
     * Excludes relational fields (one2many, many2many) and non-stored fields.
     */
    isColumnGroupable(column) {
        if (!column || column.type !== "field" || !column.field) {
            return false;
        }

        const field = this.props.list.model.config.fields[column.name];
        if (
            !field ||
            field.type === "one2many" ||
            field.type === "many2many" ||
            field.store === false
        ) {
            return false;
        }

        return true;
    },

    getButtonStyle(column) {
        const isGrouped = this.isColumnCurrentlyGrouped(column);
        return isGrouped
            ? "color: #d32f2f; font-weight: 500;"
            : "color: #6c757d; font-weight: normal;";
    },

    /**
     * Verify if the given column is currently used as the group-by key.
     * Only one group-by level is supported in this implementation.
     */
    isColumnCurrentlyGrouped(column) {
        const {model} = this.props.list;
        const currentGroupBy = model.root.groupBy || [];
        return currentGroupBy.length === 1 && currentGroupBy[0] === column.name;
    },

    /**
     * Handle group-by button click:
     *  - Toggle grouping on the given field
     *  - Reload the list model
     *  - Apply visual feedback (color, icon, animation, hover styles)
     */
    onGroupByColumn(ev) {
        const button = ev.currentTarget;
        const fieldName = button.dataset.field;

        if (!fieldName) {
            return;
        }

        const {model} = this.props.list;
        const field = model.config.fields[fieldName];

        if (
            !field ||
            field.type === "one2many" ||
            field.type === "many2many" ||
            field.store === false
        ) {
            return;
        }

        const currentGroupBy = model.root.groupBy || [];

        if (currentGroupBy.length === 1 && currentGroupBy[0] === fieldName) {
            model.load({groupBy: []});
        } else {
            model.load({groupBy: [fieldName]});
        }

        model.notify();

        setTimeout(() => {
            const buttons = this.el?.querySelectorAll("button[data-field]");
            if (!buttons) return;

            buttons.forEach((btn) => {
                const field = btn.dataset.field;
                const isNowGrouped = model.root.groupBy?.[0] === field;
                const color = isNowGrouped ? "#d32f2f" : "#6c757d";
                const fontWeight = isNowGrouped ? "500" : "normal";

                btn.style.color = color;
                btn.style.fontWeight = fontWeight;

                const openIcon = btn.querySelector(".fa-folder-open");
                const closedIcon = btn.querySelector(".fa-folder");

                if (openIcon)
                    openIcon.style.display = isNowGrouped ? "inline-block" : "none";
                if (closedIcon)
                    closedIcon.style.display = isNowGrouped ? "none" : "inline-block";

                btn.style.transform = "scale(1.1)";
                setTimeout(() => {
                    btn.style.transform = "scale(1)";
                }, 100);

                const hoverColor = isNowGrouped ? "#b71c1c" : "#495057";
                const resetStyle = () => {
                    btn.style.color = color;
                    if (openIcon) openIcon.style.color = color;
                    if (closedIcon) closedIcon.style.color = color;
                };
                const hoverStyle = () => {
                    btn.style.color = hoverColor;
                    if (openIcon) openIcon.style.color = hoverColor;
                    if (closedIcon) closedIcon.style.color = hoverColor;
                };

                btn.removeEventListener("mouseenter", hoverStyle);
                btn.removeEventListener("mouseleave", resetStyle);

                btn.addEventListener("mouseenter", hoverStyle);
                btn.addEventListener("mouseleave", resetStyle);
            });
        }, 10);

        ev.stopPropagation();
    },
});
