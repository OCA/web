import {DayPilotArchParser} from "./daypilot_arch_parser.esm";
import {DayPilotController} from "./daypilot_controller.esm";
import {DayPilotModel} from "./daypilot_model.esm";
import {DayPilotRenderer} from "./daypilot_renderer.esm";
import {registry} from "@web/core/registry";

const viewRegistry = registry.category("views");

export const daypilotView = {
    type: "daypilot",
    icon: "fa-calendar-check-o",
    Controller: DayPilotController,
    Renderer: DayPilotRenderer,
    Model: DayPilotModel,
    ArchParser: DayPilotArchParser,
    searchMenuTypes: ["filter", "groupBy", "favorite"],
    buttonTemplate: "web_daypilot.DayPilotView.Buttons",

    props: (genericProps, view, config) => {
        const modelParams = {};
        if (genericProps.state) {
            modelParams.metaData = genericProps.state.metaData;
        } else {
            const {arch, fields, resModel} = genericProps;
            const parser = new view.ArchParser();
            const archInfo = parser.parse(arch);

            let formViewId = archInfo.formViewId;
            if (!formViewId) {
                const formView = config.views.find((v) => v[1] === "form");
                if (formView) {
                    formViewId = formView[0];
                }
            }

            modelParams.metaData = {
                ...archInfo,
                fields,
                resModel,
                formViewId,
            };
        }

        return {
            ...genericProps,
            modelParams,
            Model: view.Model,
            Renderer: view.Renderer,
            buttonTemplate: view.buttonTemplate,
        };
    },
};

viewRegistry.add("daypilot", daypilotView);
