const isParentFieldOptionsName = "isParentField";
const isChildrenFieldOptionsName = "isChildrenField";
const isNameFieldOptionsName = "isNameField";

function _handleIsParentFieldOption(archInfo, modelName, fields, column) {
    if (archInfo.parentFieldColumn) {
        throw new Error(
            `The ${isParentFieldOptionsName} field option is already present in the view definition.`
        );
    }
    if (fields[column.name].type !== "many2one") {
        throw new Error(
            `Invalid field for ${isParentFieldOptionsName} field option, it should be a Many2One field.`
        );
    } else if (fields[column.name].relation !== modelName) {
        throw new Error(
            `Invalid field for ${isParentFieldOptionsName} field option, the co-model should be same model than the current one (expected: ${modelName}).`
        );
    }
    if ("drillDownCondition" in column.options) {
        archInfo.drillDownCondition = column.options.drillDownCondition;
    }
    if ("drillDownIcon" in column.options) {
        archInfo.drillDownIcon = column.options.drillDownIcon;
    }
    archInfo.parentFieldColumn = column;
}

function _handleIsChildrenFieldOption(archInfo, modelName, fields, column) {
    if (archInfo.childrenFieldColumn) {
        throw new Error(
            `The ${isChildrenFieldOptionsName} field option is already present in the view definition.`
        );
    }
    if (fields[column.name].type !== "one2many") {
        throw new Error(
            `Invalid field for ${isChildrenFieldOptionsName} field option, it should be a One2Many field.`
        );
    } else if (fields[column.name].relation !== modelName) {
        throw new Error(
            `Invalid field for ${isChildrenFieldOptionsName} field option, the co-model should be same model than the current one (expected: ${modelName}).`
        );
    }
    archInfo.childrenFieldColumn = column;
}

function _handleIsNameFieldOption(archInfo, modelName, fields, column) {
    if (archInfo.nameFieldColumn) {
        throw new Error(
            `The ${isNameFieldOptionsName} field option is already present in the view definition.`
        );
    }
    archInfo.nameFieldColumn = column;
}

function _handleParentFieldColumnFallback(archInfo, modelName, fields, columnDict) {
    const parentIdFieldName = "parent_id";
    if (!archInfo.parentFieldColumn) {
        if (
            parentIdFieldName in fields &&
            fields[parentIdFieldName].type === "many2one" &&
            fields[parentIdFieldName].relation === modelName
        ) {
            archInfo.parentFieldColumn = columnDict[parentIdFieldName];
        } else {
            throw new Error(
                `Neither ${parentIdFieldName} field is present in the view fields, nor is ${isParentFieldOptionsName} field option defined on a field.`
            );
        }
    }
}

function _handleChildrenFieldColumnFallback(archInfo, modelName, fields, columnDict) {
    const childIdsFieldName = "child_ids";
    if (!archInfo.childrenFieldColumn) {
        if (
            childIdsFieldName in fields &&
            fields[childIdsFieldName].type === "one2many" &&
            fields[childIdsFieldName].relation === modelName
        ) {
            archInfo.childrenFieldColumn = columnDict[childIdsFieldName];
        }
    }
}

function _handleNameFieldColumnFallback(archInfo, modelName, fields, columnDict) {
    const displayNameFieldName = "display_name";
    if (!archInfo.nameFieldColumn) {
        if (displayNameFieldName in fields) {
            archInfo.nameFieldColumn = columnDict[displayNameFieldName];
        } else {
            throw new Error(
                `Neither ${displayNameFieldName} field is present in the view fields, nor is ${isNameFieldOptionsName} field option defined on a field.`
            );
        }
    }
}

function _handleDrillDownConditionFallback(archInfo) {
    if (!archInfo.drillDownCondition && archInfo.childrenFieldColumn) {
        archInfo.drillDownCondition = `${archInfo.childrenFieldColumn.name}.length > 0`;
    }
}

function _handleParentFieldColumnVisibility(archInfo) {
    if (archInfo.parentFieldColumn) {
        // The column tagged as parent field is made invisible, except id explicitly set otherwise.
        if (
            !["invisible", "column_invisible"].some(
                (value) =>
                    ![null, undefined].includes(archInfo.parentFieldColumn[value])
            )
        ) {
            archInfo.parentFieldColumn.column_invisible = "1";
        }
    }
}

function _handleChildrenFieldColumnVisibility(archInfo) {
    if (archInfo.childrenFieldColumn) {
        // The column tagged as children field is made invisible, except id explicitly set otherwise.
        if (
            !["invisible", "column_invisible"].some(
                (value) =>
                    ![null, undefined].includes(archInfo.childrenFieldColumn[value])
            )
        ) {
            archInfo.childrenFieldColumn.column_invisible = "1";
        }
    }
}

export function treatHierarchyListArch(archInfo, modelName, fields) {
    const columnDict = {};

    for (const column of archInfo.columns) {
        columnDict[column.name] = column;
        if (column.options) {
            if (column.options[isParentFieldOptionsName]) {
                _handleIsParentFieldOption(archInfo, modelName, fields, column);
            }
            if (column.options[isChildrenFieldOptionsName]) {
                _handleIsChildrenFieldOption(archInfo, modelName, fields, column);
            }
            if (column.options[isNameFieldOptionsName]) {
                _handleIsNameFieldOption(archInfo, modelName, fields, column);
            }
        }
    }
    _handleParentFieldColumnFallback(archInfo, modelName, fields, columnDict);
    _handleChildrenFieldColumnFallback(archInfo, modelName, fields, columnDict);
    _handleNameFieldColumnFallback(archInfo, modelName, fields, columnDict);
    _handleDrillDownConditionFallback(archInfo);
    _handleParentFieldColumnVisibility(archInfo);
    _handleChildrenFieldColumnVisibility(archInfo);
    // Inline Edition is not supported (yet?)
    archInfo.activeActions.edit = false;
}
