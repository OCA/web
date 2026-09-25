import {GridArchParser} from "./grid_arch_parser.esm";
import {GridController} from "./grid_controller.esm";
import {GridModel} from "./grid_model.esm";
import {GridRenderer} from "./grid_renderer.esm";
import {registry} from "@web/core/registry";

const viewRegistry = registry.category("views");

export const gridView = {
    type: "grid_view",
    display_name: "Grid",
    icon: "fa fa-th",
    multiRecord: true,
    ArchParser: GridArchParser,
    Controller: GridController,
    Renderer: GridRenderer,
    Model: GridModel,

    props: (genericProps, view) => {
        const {arch, fields, resModel} = genericProps;
        const parser = new view.ArchParser();
        const archInfo = parser.parse(arch, fields);
        const modelParams = {
            archInfo,
            resModel,
            fields,
        };
        return {
            ...genericProps,
            archInfo,
            modelParams,
            Model: view.Model,
            Renderer: view.Renderer,
        };
    },
};

viewRegistry.add("grid_view", gridView);
