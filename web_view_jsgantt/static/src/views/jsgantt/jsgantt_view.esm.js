/** @odoo-module */

import {JSGanttArchParser} from "./jsgantt_arch_parser.esm";
import {JSGanttController} from "./jsgantt_controller.esm";
import {JSGanttRenderer} from "./jsgantt_renderer.esm";
import {RelationalModel} from "@web/views/relational_model";
import {_lt} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

export const jsGanttView = {
    type: "jsgantt",
    display_name: _lt("Gantt"),
    icon: "fa fa-tasks",
    accessKey: "g",
    multiRecord: true,
    // Remove groupBy, as it is currently not supported.
    searchMenuTypes: ["filter", "favorite"],
    Controller: JSGanttController,
    Renderer: JSGanttRenderer,
    ArchParser: JSGanttArchParser,
    Model: RelationalModel,

    props(genericProps, view) {
        const {ArchParser} = view;
        const {arch, relatedModels, resModel} = genericProps;
        const archInfo = new ArchParser().parse(arch, relatedModels, resModel);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo,
        };
    },
};

registry.category("views").add("jsgantt", jsGanttView);
