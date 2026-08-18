import {patch} from "@web/core/utils/patch";
import {FormRenderer} from "@web/views/form/form_renderer";
import {onMounted, onPatched, onWillUnmount, useRef} from "@odoo/owl";

const HANDLE_CLASS = "o_web_form_view_resizable_handle";
const HANDLE_START_CLASS = "o_web_form_view_resizable_handle_start";
const ASIDE_CHATTER_SELECTOR = ":scope > .o-mail-Form-chatter.o-aside";
const SHEET_SELECTOR = ":scope > .o_form_sheet_bg";
const PREVIEW_SELECTOR = ".o_attachment_preview";
const PREVIEW_RESIZING_CLASS = "o_web_form_view_resizable_preview_disabled";
const MIN_WIDTH = 400;
const MAX_WIDTH = 1200;
const RESIZE_STATE = Symbol("web_form_view_resizable");

function clampWidth(width, minWidth, maxWidth) {
    return Math.min(Math.max(minWidth, width), maxWidth);
}

patch(FormRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        this.compiledViewRootRef = useRef("compiled_view_root");
        onMounted(() => this._refreshResizableFormView());
        onPatched(() => this._refreshResizableFormView());
        onWillUnmount(() => this._removeResizableFormView());
    },

    _refreshResizableFormView() {
        const rootEl = this.compiledViewRootRef?.el;
        if (this.env.inDialog || !rootEl) {
            this._removeResizableFormView();
            return;
        }
        const asideChatterEl = rootEl.querySelector(ASIDE_CHATTER_SELECTOR);
        const hasAsideChatter = Boolean(asideChatterEl);
        const targetEl =
            (hasAsideChatter ? asideChatterEl : rootEl.querySelector(SHEET_SELECTOR)) ||
            rootEl;
        const resizeState = this[RESIZE_STATE];
        if (
            resizeState &&
            resizeState.targetEl === targetEl &&
            resizeState.handleEl.isConnected &&
            targetEl.contains(resizeState.handleEl)
        ) {
            return;
        }
        this._removeResizableFormView();

        this._setupResizableFormView(rootEl, targetEl, hasAsideChatter);
    },

    _setupResizableFormView(rootEl, targetEl, hasAsideChatter) {
        const previewEls = [...rootEl.querySelectorAll(PREVIEW_SELECTOR)];
        if (targetEl.querySelector(`:scope > .${HANDLE_CLASS}`)) {
            return;
        }

        const handleEl = document.createElement("div");
        handleEl.className = HANDLE_CLASS;
        if (hasAsideChatter) {
            handleEl.classList.add(HANDLE_START_CLASS);
        }
        targetEl.append(handleEl);

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        const setTargetWidth = (width) => {
            targetEl.style.flex = "0 0 auto";
            targetEl.style.width = `${width}px`;
        };
        const getBounds = () => {
            const totalWidth =
                rootEl.getBoundingClientRect().width || window.innerWidth;
            if (hasAsideChatter) {
                const minWidth = Math.max(0, totalWidth - MAX_WIDTH);
                const maxWidth = Math.max(minWidth, totalWidth - MIN_WIDTH);
                return {minWidth, maxWidth};
            }
            return {
                minWidth: MIN_WIDTH,
                maxWidth: MAX_WIDTH,
            };
        };
        const onMouseDown = (ev) => {
            if (ev.button !== 0) {
                return;
            }
            ev.preventDefault();
            isResizing = true;
            startX = ev.clientX;
            startWidth = targetEl.getBoundingClientRect().width;
            for (const previewEl of previewEls) {
                previewEl.classList.add(PREVIEW_RESIZING_CLASS);
            }
            document.body.classList.add("pe-none", "user-select-none");
        };
        const onMouseMove = (ev) => {
            if (!isResizing) {
                return;
            }
            const delta = ev.clientX - startX;
            const nextWidth = hasAsideChatter ? startWidth - delta : startWidth + delta;
            const {minWidth, maxWidth} = getBounds();
            setTargetWidth(clampWidth(nextWidth, minWidth, maxWidth));
        };
        const onMouseUp = () => {
            isResizing = false;
            for (const previewEl of previewEls) {
                previewEl.classList.remove(PREVIEW_RESIZING_CLASS);
            }
            document.body.classList.remove("pe-none", "user-select-none");
        };
        const onWindowResize = () => {
            const currentWidth = targetEl.getBoundingClientRect().width;
            const {minWidth, maxWidth} = getBounds();
            setTargetWidth(clampWidth(currentWidth, minWidth, maxWidth));
        };

        handleEl.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        window.addEventListener("resize", onWindowResize);

        this[RESIZE_STATE] = {
            targetEl,
            handleEl,
            onMouseDown,
            onMouseMove,
            onMouseUp,
            onWindowResize,
        };
    },

    _removeResizableFormView() {
        const resizeState = this[RESIZE_STATE];
        if (!resizeState) {
            return;
        }
        const {handleEl, onMouseDown, onMouseMove, onMouseUp, onWindowResize} =
            resizeState;
        handleEl.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("resize", onWindowResize);
        const previewEls = document.querySelectorAll(
            `${PREVIEW_SELECTOR}.${PREVIEW_RESIZING_CLASS}`
        );
        for (const previewEl of previewEls) {
            previewEl.classList.remove(PREVIEW_RESIZING_CLASS);
        }
        document.body.classList.remove("pe-none", "user-select-none");
        handleEl.remove();
        delete this[RESIZE_STATE];
    },
});
