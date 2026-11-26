import {Component, EventBus, useRef, useState} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {sprintf} from "@web/core/utils/strings";

export class Highlighter extends Component {
    static props = {
        bus: {type: EventBus},
    };
    setup() {
        this.state = useState({visible: false});
        this.props.bus.addEventListener("HIDE", this.hide.bind(this));
        this.props.bus.addEventListener(
            "HIGHLIGHT",
            ({detail: {selector, content, animate, padding}}) =>
                this.highlight(selector, content, animate, padding)
        );
        this.highlightRef = useRef("highlightRef");
        this.overlayRef = useRef("overlay");
    }

    hide() {
        this.state.visible = false;
        this.resetAnimation();
    }

    _getBoundsOfElement($el) {
        const bounds = {
            x: Number.MAX_SAFE_INTEGER,
            y: Number.MAX_SAFE_INTEGER,
        };

        let xEnd = 0,
            yEnd = 0;

        $el.filter(":visible").each(function () {
            const elementBounds = this.getBoundingClientRect();
            if (elementBounds.x < bounds.x) {
                bounds.x = elementBounds.x;
            }
            if (elementBounds.y < bounds.y) {
                bounds.y = elementBounds.y;
            }
            if (xEnd < elementBounds.x + elementBounds.width) {
                xEnd = elementBounds.x + elementBounds.width;
            }
            if (yEnd < elementBounds.y + elementBounds.height) {
                yEnd = elementBounds.y + elementBounds.height;
            }
        });

        bounds.width = xEnd - bounds.x;
        bounds.height = yEnd - bounds.y;
        return bounds;
    }

    highlight(selector, content, animate = 250, padding = 10) {
        const selection = $(selector);

        if (!selection.length) {
            return console.error("Element not found.", selector);
        }
        const bounds = this._getBoundsOfElement(selection);
        this.state.visible = true;
        this.animate(content, bounds, animate, padding);
    }

    animate(content, bounds, animate = 250, padding = 10) {
        const $el = $(this.highlightRef.el);

        $el.popover("dispose");
        $el.animate(
            {
                top: sprintf("%spx", Math.floor(bounds.y) - padding),
                left: sprintf("%spx", Math.floor(bounds.x) - padding),
                width: sprintf("%spx", Math.floor(bounds.width) + padding * 2),
                height: sprintf("%spx", Math.floor(bounds.height) + padding * 2),
            },
            animate ? animate : 0,
            function () {
                $el.popover(
                    Object.assign({}, this._getPopoverOptions(), {
                        content: content,
                    })
                ).popover("show");
            }.bind(this)
        );
    }

    _getPopoverOptions() {
        return {
            container: $(this.overlayRef.el),
            placement: "auto",
            html: true,
            trigger: "manual",
            boundary: "viewport",
            sanitize: false,
            template:
                '<div class="popover" role="tooltip"><div class="popover-body"></div></div>',
        };
    }

    resetAnimation() {
        const $el = $(this.highlightRef.el);
        $el.popover("dispose");
        $el.css({
            top: 0,
            left: 0,
            width: 0,
            height: 0,
        });
    }
}
Highlighter.template = "web_help.Highlighter";

export const highlighterService = {
    start() {
        const bus = new EventBus();

        registry.category("main_components").add("Highlighter", {
            Component: Highlighter,
            props: {bus},
        });

        return {
            hide: () => bus.trigger("HIDE"),
            highlight: (selector, content, animate = 250, padding = 10) =>
                bus.trigger("HIGHLIGHT", {
                    selector: selector,
                    content: content,
                    animate: animate,
                    padding: padding,
                }),
        };
    },
};

registry.category("services").add("highlighter", highlighterService);
