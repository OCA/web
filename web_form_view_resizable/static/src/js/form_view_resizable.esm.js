import {onMounted, onPatched, onWillUnmount, useRef} from "@odoo/owl";
import {FormRenderer} from "@web/views/form/form_renderer";
import {patch} from "@web/core/utils/patch";

const HANDLE_CLASS = "o_web_form_view_resizable_handle";
const SHEET_SELECTOR = ":scope > .o_form_sheet_bg";
const PREVIEW_SELECTOR = ".o_attachment_preview";
const PREVIEW_RESIZING_CLASS = "o_web_form_view_resizable_preview_disabled";
const RESIZING_CLASS = "o_web_form_view_resizing";
const MIN_WIDTH = 400;
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
        const targetEl = rootEl.querySelector(SHEET_SELECTOR) || rootEl;
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

        this._setupResizableFormView(rootEl, targetEl);
    },

    _setupResizableFormView(rootEl, targetEl) {
        const previewEls = [...rootEl.querySelectorAll(PREVIEW_SELECTOR)];
        if (targetEl.querySelector(`:scope > .${HANDLE_CLASS}`)) {
            return;
        }

        const handleEl = document.createElement("div");
        handleEl.className = HANDLE_CLASS;
        targetEl.parentNode.insertBefore(handleEl, targetEl.nextSibling);

        let pointerId = null;
        let fixedEdge = 0;
        const setTargetWidth = (width) => {
            targetEl.style.flex = "0 0 auto";
            targetEl.style.width = `${width}px`;
        };
        const getBounds = () => {
            return {
                minWidth: MIN_WIDTH,
                maxWidth: window.screen.width,
            };
        };
        const stopResizing = () => {
            if (pointerId === null) {
                return;
            }
            if (handleEl.hasPointerCapture(pointerId)) {
                handleEl.releasePointerCapture(pointerId);
            }
            pointerId = null;
            for (const previewEl of previewEls) {
                previewEl.classList.remove(PREVIEW_RESIZING_CLASS);
            }
            document.body.classList.remove(RESIZING_CLASS);
        };
        const onPointerDown = (ev) => {
            if (ev.button !== 0) {
                return;
            }
            ev.preventDefault();
            const targetRect = targetEl.getBoundingClientRect();
            pointerId = ev.pointerId;
            fixedEdge = targetRect.left;
            handleEl.setPointerCapture(pointerId);
            for (const previewEl of previewEls) {
                previewEl.classList.add(PREVIEW_RESIZING_CLASS);
            }
            document.body.classList.add(RESIZING_CLASS);
        };
        const onPointerMove = (ev) => {
            if (ev.pointerId !== pointerId) {
                return;
            }
            const nextWidth = ev.clientX - fixedEdge;
            const {minWidth, maxWidth} = getBounds();
            setTargetWidth(clampWidth(nextWidth, minWidth, maxWidth));
        };
        const onWindowResize = () => {
            const currentWidth = targetEl.getBoundingClientRect().width;
            const {minWidth, maxWidth} = getBounds();
            setTargetWidth(clampWidth(currentWidth, minWidth, maxWidth));
        };

        handleEl.addEventListener("pointerdown", onPointerDown);
        handleEl.addEventListener("pointermove", onPointerMove);
        handleEl.addEventListener("pointerup", stopResizing);
        handleEl.addEventListener("pointercancel", stopResizing);
        window.addEventListener("resize", onWindowResize);

        this[RESIZE_STATE] = {
            targetEl,
            handleEl,
            onPointerDown,
            onPointerMove,
            stopResizing,
            onWindowResize,
        };
    },

    _removeResizableFormView() {
        const resizeState = this[RESIZE_STATE];
        if (!resizeState) {
            return;
        }
        const {handleEl, onPointerDown, onPointerMove, stopResizing, onWindowResize} =
            resizeState;
        stopResizing();
        handleEl.removeEventListener("pointerdown", onPointerDown);
        handleEl.removeEventListener("pointermove", onPointerMove);
        handleEl.removeEventListener("pointerup", stopResizing);
        handleEl.removeEventListener("pointercancel", stopResizing);
        window.removeEventListener("resize", onWindowResize);
        const previewEls = document.querySelectorAll(
            `${PREVIEW_SELECTOR}.${PREVIEW_RESIZING_CLASS}`
        );
        for (const previewEl of previewEls) {
            previewEl.classList.remove(PREVIEW_RESIZING_CLASS);
        }
        document.body.classList.remove(RESIZING_CLASS);
        handleEl.remove();
        delete this[RESIZE_STATE];
    },
});
