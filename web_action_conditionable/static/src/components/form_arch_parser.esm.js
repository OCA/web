/** @odoo-module **/
import {FormArchParser} from "@web/views/form/form_arch_parser";
import {patch} from "@web/core/utils/patch";

patch(FormArchParser.prototype, "web_action_conditionable", {
    parse(arch) {
        const result = this._super(...arguments);
        const parsedArch = this.parseXML(arch);
        for (const action of ["create", "delete", "duplicate", "edit"]) {
            result.activeActions[action + "_expression"] =
                parsedArch.getAttribute(action);
        }
        return result;
    },
});
