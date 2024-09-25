/** @odoo-module */

import {addFieldDependencies, archParseBoolean} from "@web/views/utils";
import {Field} from "@web/views/fields/field";
import {XMLParser} from "@web/core/utils/xml";

export class JSGanttArchParser extends XMLParser {
    parseFieldNode(node, models, modelName) {
        return Field.parseFieldNode(node, models, modelName, "jsgantt");
    }

    parse(arch, models, modelName) {
        this.parseXML(arch);
        const fieldNodes = {};
        const activeFields = {};
        let timeFormat = null;
        let showDuration = null;
        let captionType = null;
        this.visitXML(arch, (node) => {
            if (node.tagName === "jsgantt") {
                timeFormat = node.getAttribute("time_format");
                showDuration = archParseBoolean(
                    node.getAttribute("show_duration") || "true"
                );
                captionType = node.getAttribute("caption_type");
            } else if (node.tagName === "field") {
                const fieldInfo = this.parseFieldNode(node, models, modelName);
                fieldNodes[fieldInfo.name] = fieldInfo;
                addFieldDependencies(
                    activeFields,
                    models[modelName],
                    fieldInfo.FieldComponent.fieldDependencies
                );
            }
        });
        for (const [key, field] of Object.entries(fieldNodes)) {
            activeFields[key] = field;
        }
        return {
            fieldNodes,
            activeFields,
            timeFormat,
            showDuration,
            captionType,
        };
    }
}
