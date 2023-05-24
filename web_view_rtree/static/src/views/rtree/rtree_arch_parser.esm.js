/** @odoo-module */

import {archParseBoolean, getActiveActions, getDecoration} from "@web/views/utils";
import {Domain} from "@web/core/domain";
import {ListArchParser} from "@web/views/list/list_arch_parser";

export class RTreeArchParser extends ListArchParser {
    parse(arch, models, modelName) {
        const xmlDoc = this.parseXML(arch);
        const treeAttr = {};
        const parentDefs = [];
        const result = super.parse(arch, models, modelName);
        this.visitXML(arch, (node) => {
            if (node.tagName === "rtree") {
                // This is a copy of
                // web/static/src/views/list/list_arch_parser.js:188
                // to handle the rtree tag in the same way as the tree (or
                // list) tag.
                const activeActions = {
                    ...getActiveActions(xmlDoc),
                    exportXlsx: archParseBoolean(
                        xmlDoc.getAttribute("export_xlsx"),
                        true
                    ),
                };
                treeAttr.activeActions = activeActions;

                treeAttr.className = xmlDoc.getAttribute("class") || null;
                treeAttr.editable = activeActions.edit
                    ? xmlDoc.getAttribute("editable")
                    : false;
                treeAttr.multiEdit = activeActions.edit
                    ? archParseBoolean(node.getAttribute("multi_edit") || "")
                    : false;

                const limitAttr = node.getAttribute("limit");
                treeAttr.limit = limitAttr && parseInt(limitAttr, 10);

                const groupsLimitAttr = node.getAttribute("groups_limit");
                treeAttr.groupsLimit = groupsLimitAttr && parseInt(groupsLimitAttr, 10);

                treeAttr.noOpen = archParseBoolean(node.getAttribute("no_open") || "");
                treeAttr.expand = archParseBoolean(xmlDoc.getAttribute("expand") || "");
                treeAttr.decorations = getDecoration(xmlDoc);

                // Custom open action when clicking on record row
                const action = xmlDoc.getAttribute("action");
                const type = xmlDoc.getAttribute("type");
                treeAttr.openAction = action && type ? {action, type} : null;
            } else if (node.tagName === "parent") {
                let domain = node.getAttribute("domain");
                if (domain !== null) {
                    domain = new Domain(domain).toList();
                }
                parentDefs.push({
                    parent: node.getAttribute("parent"),
                    child: node.getAttribute("child"),
                    field: node.getAttribute("field"),
                    domain,
                });
            }
        });

        return {
            ...result,
            ...treeAttr,
            parentDefs,
        };
    }
}
