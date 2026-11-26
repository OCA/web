export class GridArchParser {
    parse(xmlDoc) {
        const root = xmlDoc;
        const editable = root.getAttribute("editable") === "1";
        const hideColumnTotal = root.getAttribute("hide_column_total") === "1";
        const hideLineTotal = root.getAttribute("hide_line_total") === "1";
        const hasBarchartTotal = root.getAttribute("barchart_total") === "1";
        const createInline = root.getAttribute("create_inline") === "1";
        const displayEmpty = root.getAttribute("display_empty") === "1";
        const jsClass = root.getAttribute("js_class") || null;
        const formViewId = root.getAttribute("form_view_id");
        const sample = root.getAttribute("sample") === "1";

        const rowFields = [];
        let sectionField = null;
        let columnField = {};
        let measureField = {};
        let readonlyField = null;
        const ranges = [];
        const buttons = [];
        const widgetPerFieldName = {};

        const fieldElements = root.querySelectorAll(":scope > field");
        for (const fieldEl of fieldElements) {
            const name = fieldEl.getAttribute("name");
            const type = fieldEl.getAttribute("type") || "";
            const widget = fieldEl.getAttribute("widget");
            const string = fieldEl.getAttribute("string");
            const operator =
                fieldEl.getAttribute("operator") ||
                (type === "measure" ? "sum" : undefined);

            if (widget) {
                widgetPerFieldName[name] = widget;
            }

            switch (type) {
                case "row": {
                    const fieldInfo = {name, string, widget};
                    if (fieldEl.getAttribute("section") === "1") {
                        fieldInfo.section = true;
                        sectionField = fieldInfo;
                    }
                    rowFields.push(fieldInfo);
                    break;
                }
                case "col": {
                    columnField = {name, string, operator};
                    const rangeElements = fieldEl.querySelectorAll(":scope > range");
                    for (const rng of rangeElements) {
                        ranges.push({
                            name: rng.getAttribute("name"),
                            string: rng.getAttribute("string"),
                            span: rng.getAttribute("span"),
                            step: rng.getAttribute("step"),
                            isDefault: rng.getAttribute("default") === "1",
                            hotkey: rng.getAttribute("hotkey"),
                        });
                    }
                    break;
                }
                case "measure": {
                    measureField = {name, string, operator, widget};
                    break;
                }
                case "readonly": {
                    readonlyField = {name, operator};
                    break;
                }
            }
        }

        if (ranges.length === 0 && !columnField.name) {
            columnField = null;
        }

        let activeRangeName = null;
        if (ranges.length) {
            const defaultRange = ranges.find((r) => r.isDefault) || ranges[0];
            activeRangeName = defaultRange.name;
        }

        const buttonElements = root.querySelectorAll(":scope > button");
        for (const btn of buttonElements) {
            buttons.push({
                string: btn.getAttribute("string"),
                type: btn.getAttribute("type"),
                name: btn.getAttribute("name"),
                context: btn.getAttribute("context"),
                className: btn.getAttribute("class"),
                hotkey: btn.getAttribute("data-hotkey"),
            });
        }

        const activeActions = {
            create: root.getAttribute("create") !== "false",
            edit: root.getAttribute("edit") !== "false",
            delete: root.getAttribute("delete") !== "false",
        };

        const actionEl = root.getAttribute("action");
        const actionType = root.getAttribute("type");
        let openAction = null;
        if (actionEl && actionType) {
            openAction = {action: actionEl, type: actionType};
        }

        return {
            activeActions,
            hideColumnTotal,
            hideLineTotal,
            hasBarchartTotal,
            createInline,
            displayEmpty,
            jsClass,
            formViewId: formViewId ? parseInt(formViewId, 10) : null,
            sample,
            sectionField,
            rowFields,
            columnField,
            measureField,
            readonlyField,
            ranges,
            activeRangeName,
            buttons,
            openAction,
            widgetPerFieldName,
            editable: editable && measureField.operator === "sum",
        };
    }
}
