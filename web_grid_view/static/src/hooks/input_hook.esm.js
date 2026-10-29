import {useEffect, useRef} from "@odoo/owl";

export function useInputHook(params) {
    const inputRef = useRef("input");
    let isDirty = false;

    const getValue = params.getValue || (() => 0);
    const parse = params.parse || ((v) => parseFloat(v) || 0);
    const format = params.format || ((v) => String(v));
    const onCommit = params.onCommit || (() => undefined);
    const onDiscard = params.onDiscard || (() => undefined);

    const discard = () => {
        if (inputRef.el) {
            inputRef.el.value = format(getValue());
        }
        isDirty = false;
        onDiscard();
    };

    const commit = () => {
        if (!isDirty) {
            return;
        }
        isDirty = false;
        const raw = inputRef.el ? inputRef.el.value : "";
        let parsed = null;
        try {
            parsed = parse(raw);
        } catch {
            discard();
            return;
        }
        onCommit(parsed);
    };

    const onInput = () => {
        isDirty = true;
    };

    const onKeydown = (ev) => {
        if (ev.key === "Enter" || ev.key === "Tab") {
            ev.preventDefault();
            ev.stopPropagation();
            commit();
            if (params.onNavigate) {
                params.onNavigate(ev.key, ev.shiftKey);
            }
        } else if (ev.key === "Escape") {
            ev.preventDefault();
            discard();
        }
    };

    // The input is mounted lazily, when the cell enters edit mode: focus it as
    // soon as the element shows up, not only on the component's first mount.
    useEffect(
        (el) => {
            if (el) {
                el.value = format(getValue());
                el.focus();
                el.select();
            }
        },
        () => [inputRef.el]
    );

    return {inputRef, onInput, onKeydown, commit, discard};
}
