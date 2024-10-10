/** @odoo-module **/
import {qweb} from "web.core";

export class Trip {
    constructor(env, highlighterService) {
        this.steps = [];
        this.env = env;
        this.index = -1;
        this.highlighterService = highlighterService;
    }

    get count() {
        return this.steps.length;
    }

    get isAtLastStep() {
        return this.index === this.count - 1;
    }

    _getStepTemplate() {
        const step = this.steps[this.index];
        if (step.template) {
            return step.template;
        }
        return this.isAtLastStep ? "web_help.TripStepLast" : "web_help.TripStep";
    }

    setup() {
        return;
    }

    addStep({
        selector,
        content,
        beforeHighlight = async () => {
            return;
        },
        animate = 250,
        padding = 10,
        template = null,
        renderContext = {},
    }) {
        this.steps.push({
            selector: selector,
            content: content,
            beforeHighlight: beforeHighlight,
            animate: animate,
            padding: padding,
            template: template,
            renderContext: renderContext,
        });
    }

    start() {
        this.nextStep();
    }

    stop() {
        this.index = -1;
        this.highlighterService.hide();
    }

    _getStepRenderContext() {
        const step = this.steps[this.index];

        return Object.assign(
            {
                content: step.content,
                cbBtnText: this.isAtLastStep
                    ? this.env._t("Finish")
                    : this.env._t("Got it"),
                closeBtnText: this.env._t("Close"),
            },
            step.renderContext
        );
    }

    async nextStep() {
        this.index++;
        let cb = this.nextStep;
        if (this.isAtLastStep) {
            cb = this.stop;
        }
        const step = this.steps[this.index];

        const $stepRender = $(
            qweb.render(this._getStepTemplate(), this._getStepRenderContext())
        );
        const $cbButton = $stepRender.find(".web_help_cb_button");
        $cbButton.click(() => {
            $cbButton.attr("disabled", "disabled");
            cb.bind(this)();
        });
        $stepRender.find(".web_help_close").click(this.stop.bind(this));
        await step.beforeHighlight();
        this.highlighterService.highlight(
            step.selector,
            $stepRender,
            step.animate,
            step.padding
        );
    }
}
