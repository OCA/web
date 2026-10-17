import {append, createElement} from "@web/core/utils/xml";
import {onMounted, onPatched, onWillUnmount, useState} from "@odoo/owl";
import {FormCompiler} from "@web/views/form/form_compiler";
import {FormRenderer} from "@web/views/form/form_renderer";
import {patch} from "@web/core/utils/patch";

const SELECTORS = {
    chatter: ".o-mail-Form-chatter:not(.o-isInFormSheetBg)",
    fallbackChatter: ".o-mail-Form-chatter",
    formView: ".o_form_view",
    formRenderer: ".o_form_renderer",
    rootContent: ".o_content",
    sheet: ".o_form_sheet_bg",
    toggleButton: ".o_web_toggle_chatter_toggle_btn",
    toggleWrapper: ".o_web_toggle_chatter_toggle_wrapper",
};

const CLASSES = {
    collapsed: "o_web_toggle_chatter_collapsed",
    enabled: "o_web_toggle_chatter_enabled",
    flexColumn: "flex-column",
    mobileMode: "o_web_toggle_chatter_mobile_mode",
    toggleWrapper: "o_web_toggle_chatter_toggle_wrapper",
};

const TEMPLATES = {
    toggleButton: "web_toggle_chatter.ChatterToggleButton",
};

const WIDTHS = {
    chatter: "30%",
    sheetExpanded: "70%",
    sheetCollapsed: "100%",
};

const INLINE_STYLE_PROPERTIES = [
    "max-width",
    "flex-basis",
    "opacity",
    "pointer-events",
];

patch(FormCompiler.prototype, {
    compile(node, params = {}) {
        const compiledArch = super.compile(node, params);
        if (params.isSubView) {
            return compiledArch;
        }
        this._ensureChatterToggleButton(compiledArch);
        return compiledArch;
    },

    _ensureChatterToggleButton(compiledArch) {
        if (compiledArch.querySelector(`.${CLASSES.toggleWrapper}`)) {
            return;
        }
        const chatterContainer =
            compiledArch.querySelector(SELECTORS.chatter) ||
            compiledArch.querySelector(SELECTORS.fallbackChatter);
        if (!chatterContainer || !chatterContainer.parentNode) {
            return;
        }
        const formView =
            chatterContainer.closest(SELECTORS.formView) ||
            compiledArch.querySelector(SELECTORS.formView);
        formView?.classList.add(CLASSES.enabled);
        chatterContainer.parentNode.insertBefore(
            this._createChatterToggleWrapper(),
            chatterContainer
        );
    },

    _createChatterToggleWrapper() {
        const toggleWrapper = createElement("div");
        toggleWrapper.classList.add(CLASSES.toggleWrapper);
        append(toggleWrapper, this._createChatterToggleButtonTemplateNode());
        return toggleWrapper;
    },

    _createChatterToggleButtonTemplateNode() {
        const templateNode = createElement("t");
        templateNode.setAttribute("t-call", TEMPLATES.toggleButton);
        return templateNode;
    },
});

patch(FormRenderer.prototype, {
    setup() {
        super.setup();
        this.webToggleChatterState = useState({
            isVisible: true,
        });
        this._onViewportChange = this._onViewportChange.bind(this);
        this.onToggleChatter = this.onToggleChatter.bind(this);
        onMounted(() => {
            window.addEventListener("resize", this._onViewportChange);
            this._syncChatterLayout();
        });
        onPatched(() => this._syncChatterLayout());
        onWillUnmount(() => {
            window.removeEventListener("resize", this._onViewportChange);
        });
    },

    onToggleChatter(event) {
        const formContainer = this._resolveFormContainer(event);
        if (formContainer && this._isMobileLayout(formContainer)) {
            this._syncChatterLayout(event);
            return;
        }
        this.webToggleChatterState.isVisible = !this.webToggleChatterState.isVisible;
        this._syncChatterLayout(event);
    },

    _syncChatterLayout(event = null) {
        const formContainer = this._resolveFormContainer(event);
        if (!formContainer) {
            return;
        }
        const chatterContainer = this._resolveChatterContainer(formContainer);
        if (!chatterContainer) {
            formContainer.classList.remove(CLASSES.enabled);
            formContainer.classList.remove(CLASSES.collapsed);
            formContainer.classList.remove(CLASSES.mobileMode);
            return;
        }
        this._ensureRuntimeToggleWrapper(formContainer, chatterContainer);
        if (!formContainer.querySelector(SELECTORS.toggleWrapper)) {
            formContainer.classList.remove(CLASSES.enabled);
            return;
        }
        formContainer.classList.add(CLASSES.enabled);
        this._syncToggleButtonIcon(formContainer);
        const isMobileLayout = this._isMobileLayout(formContainer);
        formContainer.classList.toggle(CLASSES.mobileMode, isMobileLayout);
        if (isMobileLayout) {
            formContainer.classList.remove(CLASSES.collapsed);
            this._clearInlineStyles(formContainer, chatterContainer);
            return;
        }
        const isCollapsed = !this.webToggleChatterState.isVisible;

        formContainer.classList.toggle(CLASSES.collapsed, isCollapsed);
        this._applyDesktopInlineStyles(formContainer, chatterContainer, isCollapsed);
    },

    _applyDesktopInlineStyles(formContainer, chatterContainer, isCollapsed) {
        const sheetContainer = formContainer.querySelector(SELECTORS.sheet);
        chatterContainer.style.maxWidth = isCollapsed ? "0" : WIDTHS.chatter;
        chatterContainer.style.flexBasis = isCollapsed ? "0" : WIDTHS.chatter;
        chatterContainer.style.opacity = isCollapsed ? "0" : "1";
        if (isCollapsed) {
            chatterContainer.style.pointerEvents = "none";
            if (sheetContainer) {
                sheetContainer.style.width = WIDTHS.sheetCollapsed;
            }
            return;
        }
        chatterContainer.style.removeProperty("pointer-events");
        if (sheetContainer) {
            sheetContainer.style.width = WIDTHS.sheetExpanded;
        }
    },

    _clearInlineStyles(formContainer, chatterContainer) {
        const sheetContainer = formContainer.querySelector(SELECTORS.sheet);
        for (const propertyName of INLINE_STYLE_PROPERTIES) {
            chatterContainer.style.removeProperty(propertyName);
        }
        if (sheetContainer) {
            sheetContainer.style.removeProperty("width");
        }
    },

    _ensureRuntimeToggleWrapper(formContainer, chatterContainer) {
        if (formContainer.querySelector(SELECTORS.toggleWrapper)) {
            return;
        }
        const toggleWrapper = document.createElement("div");
        toggleWrapper.classList.add(CLASSES.toggleWrapper);
        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "o_web_toggle_chatter_toggle_btn btn btn-light";
        toggleButton.setAttribute("aria-label", "Toggle chatter");
        const icon = document.createElement("i");
        icon.className = "fa fa-angle-right";
        toggleButton.appendChild(icon);
        toggleButton.addEventListener("click", (clickEvent) => {
            clickEvent.preventDefault();
            this.onToggleChatter(clickEvent);
        });
        toggleWrapper.appendChild(toggleButton);
        chatterContainer.parentNode.insertBefore(toggleWrapper, chatterContainer);
    },

    _syncToggleButtonIcon(formContainer) {
        const toggleButton = formContainer.querySelector(SELECTORS.toggleButton);
        if (!toggleButton) {
            return;
        }
        const icon = toggleButton.querySelector(".fa");
        const isVisible = this.webToggleChatterState.isVisible;
        toggleButton.setAttribute(
            "aria-label",
            isVisible ? "Toggle chatter" : "Show chatter"
        );
        if (!icon) {
            return;
        }
        icon.classList.toggle("fa-angle-right", isVisible);
        icon.classList.toggle("fa-angle-left", !isVisible);
    },

    _onViewportChange() {
        this._syncChatterLayout();
    },

    _isMobileLayout(formContainer) {
        const layoutContainer = this._resolveLayoutContainer(formContainer);
        if (!layoutContainer) {
            return false;
        }
        if (layoutContainer.classList.contains(CLASSES.flexColumn)) {
            return true;
        }
        return window.getComputedStyle(layoutContainer).flexDirection === "column";
    },

    _resolveLayoutContainer(formContainer) {
        if (!formContainer) {
            return null;
        }
        if (formContainer.matches(SELECTORS.formRenderer)) {
            return formContainer;
        }
        return (
            formContainer.closest(SELECTORS.formRenderer) ||
            formContainer.querySelector(SELECTORS.formRenderer) ||
            formContainer
        );
    },

    _resolveFormContainer(event = null) {
        const candidates = [event?.currentTarget, event?.target, this.el];
        for (const candidate of candidates) {
            const formContainer = this._closestFormContainer(candidate);
            if (formContainer) {
                return this._normalizeFormContainer(formContainer);
            }
        }
        const rootFormView = document.querySelector(
            `${SELECTORS.rootContent} ${SELECTORS.formView}`
        );
        if (rootFormView) {
            return rootFormView;
        }
        return (
            this._normalizeFormContainer(
                document.querySelector(
                    `${SELECTORS.rootContent} ${SELECTORS.formRenderer}`
                )
            ) || null
        );
    },

    _closestFormContainer(element) {
        if (!element || typeof element.closest !== "function") {
            return null;
        }
        return (
            element.closest(SELECTORS.formView) ||
            element.closest(SELECTORS.formRenderer)
        );
    },

    _normalizeFormContainer(formContainer) {
        if (!formContainer) {
            return null;
        }
        if (formContainer.matches(SELECTORS.formRenderer)) {
            return formContainer.querySelector(SELECTORS.formView) || formContainer;
        }
        return formContainer;
    },

    _resolveChatterContainer(formContainer) {
        return (
            formContainer.querySelector(SELECTORS.chatter) ||
            formContainer.querySelector(SELECTORS.fallbackChatter)
        );
    },
});
