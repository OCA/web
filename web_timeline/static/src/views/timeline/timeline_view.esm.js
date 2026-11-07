/* Odoo web_timeline
 * Copyright 2015 ACSONE SA/NV
 * Copyright 2016 Pedro M. Baeza <pedro.baeza@tecnativa.com>
 * Copyright 2023 Onestein - Anjeel Haria
 * Copyright 2024 Tecnativa - Carlos López
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {TimelineArchParser} from "./timeline_arch_parser.esm";
import {TimelineController} from "./timeline_controller.esm";
import {TimelineModel} from "./timeline_model.esm";
import {TimelineRenderer} from "./timeline_renderer.esm";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";

const viewRegistry = registry.category("views");

export const TimelineView = {
    display_name: _t("Timeline"),
    icon: "fa fa-tasks",
    multiRecord: true,
    ArchParser: TimelineArchParser,
    Controller: TimelineController,
    Renderer: TimelineRenderer,
    Model: TimelineModel,
    jsLibs: ["/web_timeline/static/lib/vis-timeline/vis-timeline-graph2d.js"],
    cssLibs: ["/web_timeline/static/lib/vis-timeline/vis-timeline-graph2d.css"],
    type: "timeline",

    props: (genericProps, view) => {
        const {arch, fields, resModel} = genericProps;
        const parser = new view.ArchParser();
        const archInfo = parser.parse(arch, fields);
        const modelParams = {
            ...archInfo,
            resModel: resModel,
            fields: fields,
        };

        return {
            ...genericProps,
            modelParams,
            Model: view.Model,
            Renderer: view.Renderer,
        };
    },
};
viewRegistry.add("timeline", TimelineView);
