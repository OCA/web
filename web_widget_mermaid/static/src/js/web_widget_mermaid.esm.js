/* global mermaid */
import {
    Component,
    onMounted,
    onPatched,
    onWillStart,
    useRef,
    useState,
} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {useAutoresize} from "@web/core/utils/autoresize";
import {useSpellCheck} from "@web/core/utils/hooks";

// Calling mermaid.initialize() multiple times is ok.
// But there's a catch: it will keep the config of previous calls unless
// explicitly overridden, instead of reverting to the default settings.
// Therefore we make the default config explicit. This is taken from
// https://mermaid.js.org/config/schema-docs/config.html
// so try copying from there if you update to a new version of mermaid
// with new options/defaults.
// Changes to the original default are marked with comments.

export const defaultConfig = {
    // Mermaid site-wide theme config:
    // https://mermaid.js.org/config/theming.html
    // Note that `darkMode` theme variable is not automatically set
    // from cookie `(cookie.get("color_scheme") === "dark")` because
    // some colors are badly adapted in dark mode.
    theme: "base",
    themeVariables: {},
    logLevel: "fatal",
    securityLevel: "strict",
    // Rendering is initiated manually
    startOnLoad: false,
    arrowMarkerAbsolute: false,

    flowchart: {
        htmlLabels: true,
        curve: "linear",
    },

    sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false,
    },

    gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        barGap: 4,
        topPadding: 50,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        // Match Odoo's font choices
        fontFamily: '"Lucida Grande", Helvetica, Verdana, Arial, sans-serif',
        numberSectionStyles: 4,
        // Match configured date format
        axisFormat: _t.database?.parameters?.date_format || "%Y-%m-%d",
    },
};

// Odoo theme variables - applied when odoo_theme option is True
// According Odoo colors (https://www.odoo.com/page/brand-assets)
export const odooThemeVariables = {
    primaryColor: "#714B67",
    primaryTextColor: "#FFFFFF",
    primaryBorderColor: "#8F8F8F",
    lineColor: "#8F8F8F",
    textColor: "#8F8F8F",
    fontSize: "16px",
};

let chartIdCounter = 0;

// Render queue to ensure initialize() and render() are called atomically
// This prevents multiple widgets from interleaving their calls
let renderQueue = Promise.resolve();

/**
 * Renders a mermaid diagram with the given config and code.
 * Uses a queue to ensure initialize() and render() are called sequentially
 * without interference from other widgets.
 *
 * @param {Object} config - Mermaid configuration
 * @param {String} renderId - Unique ID for this render
 * @param {String} code - Mermaid diagram code
 * @returns {Promise<{svg: string}>} - Rendered SVG
 */
async function queuedMermaidRender(config, renderId, code) {
    // Chain this render operation to the queue
    const renderPromise = renderQueue.then(async () => {
        mermaid.initialize(config);
        return await mermaid.render(renderId, code);
    });
    // Update the queue to wait for this render to complete
    renderQueue = renderPromise.catch();
    return renderPromise;
}

/**
 * MermaidField is an OWL component that renders Mermaid diagrams.
 * Since Odoo 16.0, there's no separate edit/view mode - fields are always editable.
 *
 * Behavior:
 * - By default, shows the rendered mermaid diagram (or a placeholder if empty)
 * - On click, switches to textarea for editing
 * - On blur (focus out), switches back to diagram display
 */
export class MermaidField extends Component {
    static template = "web_widget_mermaid.MermaidField";
    static props = {
        ...standardFieldProps,
        placeholder: {type: String, optional: true},
        options: {type: Object, optional: true},
    };
    static defaultProps = {
        options: {},
    };

    setup() {
        this.chartRef = useRef("chart");
        this.textareaRef = useRef("textarea");
        this.chartId = `mermaid_chart_${++chartIdCounter}`;
        this.state = useState({
            errorMessage: null,
            isEditing: false,
        });

        useSpellCheck({refName: "textarea"});
        useAutoresize(this.textareaRef);

        onWillStart(async () => {
            // Download latest version from: https://unpkg.com/mermaid/dist/mermaid.js
            await loadJS(
                "/web_widget_mermaid/static/lib/mermaid-11.12.2/mermaid.min.js"
            );
        });

        onMounted(() => {
            // Initial rendering
            this.renderDiagram();
        });

        onPatched(() => {
            if (this.state.isEditing && this.textareaRef.el) {
                // Focus textarea when entering edit mode
                this.textareaRef.el.focus();
            } else {
                // Re-render diagram after any state/prop changes
                this.renderDiagram();
            }
        });
    }

    get value() {
        return this.props.record.data[this.props.name] || "";
    }

    get isEmpty() {
        return !this.value || this.value.trim() === "";
    }

    get placeholderText() {
        return this.props.placeholder || _t("Insert a Mermaid diagram...");
    }

    onDiagramClick() {
        if (!this.props.readonly) {
            this.state.isEditing = true;
        }
    }

    onTextareaBlur() {
        this.state.isEditing = false;
    }

    onTextareaInput(ev) {
        this.props.record.update({[this.props.name]: ev.target.value});
    }

    onTextareaKeydown(ev) {
        // Allow Escape to exit edit mode
        if (ev.key === "Escape") {
            ev.preventDefault();
            this.state.isEditing = false;
            return;
        }
        // Handle Tab key to insert spaces instead of changing focus
        if (ev.key === "Tab") {
            ev.preventDefault();
            // 4-spaces for indentation
            const spaces = "    ";
            // Use execCommand to preserve undo/redo history
            document.execCommand("insertText", false, spaces);
            // Trigger input event to update the record
            this.onTextareaInput(ev);
        }
    }

    async renderDiagram() {
        if (this.state.isEditing || !this.chartRef.el) {
            return;
        }

        if (this.isEmpty) {
            // Show placeholder for empty diagram
            this.chartRef.el.innerHTML = "";
            return;
        }

        // Build config from defaults and options
        const options = this.props.options || {};
        const config = {...defaultConfig, ...options};

        // Apply Odoo theme if `odoo_theme` option is set
        if (options.odoo_theme) {
            config.themeVariables = {
                ...config.themeVariables,
                ...odooThemeVariables,
            };
        }

        // Ensure mermaid is available
        if (typeof mermaid === "undefined") {
            this.state.errorMessage = _t("Mermaid library not loaded");
            return;
        }

        try {
            // Use queued render to ensure initialize() and render() are atomic
            const {svg} = await queuedMermaidRender(config, this.chartId, this.value);
            this.state.errorMessage = null;

            if (this.chartRef.el) {
                this.chartRef.el.innerHTML = svg;
            }
        } catch (e) {
            this.state.errorMessage = e.message || String(e);

            if (this.chartRef.el) {
                this.chartRef.el.innerHTML = "";
            }
        }
    }
}

export const mermaidField = {
    component: MermaidField,
    displayName: _t("Mermaid"),
    supportedTypes: ["text", "char"],
    extractProps: ({attrs, options}) => ({
        options: options || {},
        placeholder: attrs.placeholder,
    }),
};

registry.category("fields").add("mermaid", mermaidField);
