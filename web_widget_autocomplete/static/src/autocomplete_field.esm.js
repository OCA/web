import {useChildRef, useService} from "@web/core/utils/hooks";
import {CharField, charField} from "@web/views/fields/char/char_field";
import {AutoComplete} from "@web/core/autocomplete/autocomplete";
import {_t} from "@web/core/l10n/translation";
import {getActiveHotkey} from "@web/core/hotkeys/hotkey_service";
import {registry} from "@web/core/registry";
import {useDebounced} from "@web/core/utils/timing";
import {useInputField} from "@web/views/fields/input_field_hook";

const DEFAULT_MIN_SYMBOLS = 3;
const DEFAULT_DELAY = 250;

function coerceNonNegativeNumber(value, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
        return fallback;
    }
    return number;
}

/**
 * AutoComplete subclass that honours a `delay` prop.
 *
 * Core AutoComplete always sets `this.timeout = 250` inside `setup()`
 * before `useDebounced`, so a subclass cannot change the delay by
 * assigning `this.timeout` before `super.setup()`.
 */
export class DelayedAutoComplete extends AutoComplete {
    static props = {
        ...AutoComplete.props,
        delay: {type: Number, optional: true},
    };
    static defaultProps = {
        ...AutoComplete.defaultProps,
        delay: DEFAULT_DELAY,
    };
    setup() {
        super.setup();
        this.debouncedProcessInput = useDebounced(async () => {
            const currentPromise = this.pendingPromise;
            this.pendingPromise = null;
            this.props.onInput({
                inputValue: this.inputRef.el.value,
            });
            try {
                await this.open(true);
                currentPromise.resolve();
            } catch {
                currentPromise.reject();
            } finally {
                if (currentPromise === this.loadingPromise) {
                    this.loadingPromise = null;
                }
            }
        }, this.props.delay);
    }

    /**
     * Stop Enter from reaching ``useInputField``. Core AutoComplete only
     * ``stopPropagation``s, so the field hook can still commit the typed
     * string after (or instead of) the selected row.
     *
     * @param {KeyboardEvent} ev
     * @returns {Promise<void>}
     */
    async onInputKeydown(ev) {
        const hotkey = getActiveHotkey(ev);
        if (
            hotkey === "enter" &&
            (this.loadingPromise || (this.isOpened && this.state.activeSourceOption))
        ) {
            ev.stopImmediatePropagation();
        }
        return super.onInputKeydown(ev);
    }

    /**
     * Keep the input in sync with the selected label before ``onSelect``.
     * A later ``useInputField`` commit would otherwise still see the typed
     * request string.
     *
     * @param {Object} option
     * @param {Object} [params]
     * @returns {void}
     */
    selectOption(option, params = {}) {
        const label = option && option.label;
        if (typeof label === "string") {
            this.state.value = label;
            if (this.inputRef.el) {
                this.inputRef.el.value = label;
            }
        }
        return super.selectOption(option, params);
    }
}

export class AutocompleteField extends CharField {
    static template = "web_widget_autocomplete.AutocompleteField";
    static components = {
        ...CharField.components,
        AutoComplete: DelayedAutoComplete,
    };
    static props = {
        ...CharField.props,
        function: {type: String, optional: true},
        minSymbols: {type: Number, optional: true},
        delay: {type: Number, optional: true},
        context: {type: Object, optional: true},
        // Other addons patch CharField.props after this class is defined.
        "*": true,
    };

    setup() {
        super.setup();
        this.orm = useService("orm");
        this.inputRef = useChildRef();
        useInputField({
            getValue: () => this.props.record.data[this.props.name] || "",
            parse: (v) => this.parse(v),
            ref: this.inputRef,
        });
    }

    get sources() {
        return [
            {
                options: (request) => this.loadSuggestions(request),
            },
        ];
    }

    async loadSuggestions(request) {
        const method = this.props.function;
        const minSymbols = this.props.minSymbols ?? DEFAULT_MIN_SYMBOLS;
        if (!method || request.length < minSymbols) {
            return [];
        }
        try {
            const kwargs = {};
            if (this.props.context) {
                kwargs.context = this.props.context;
            }
            const result = await this.orm.silent.call(
                this.props.record.resModel,
                method,
                [request],
                kwargs
            );
            if (!Array.isArray(result)) {
                return [];
            }
            return this.mapSuggestions(result);
        } catch {
            return [];
        }
    }

    mapSuggestions(rows) {
        const fieldName = this.props.name;
        const options = [];
        for (const row of rows) {
            if (!row || typeof row !== "object" || Array.isArray(row)) {
                continue;
            }
            const label = row[fieldName];
            if (typeof label !== "string") {
                continue;
            }
            options.push({label, values: row});
        }
        return options;
    }

    async onSelect(option) {
        const values = option.values;
        if (!values || typeof values !== "object") {
            return;
        }
        const {record} = this.props;
        const changes = {};
        for (const [key, value] of Object.entries(values)) {
            if (key === "id") {
                continue;
            }
            if (!(key in record.fields) || !(key in record.activeFields)) {
                continue;
            }
            const fieldType = record.fields[key].type;
            if (fieldType === "char") {
                if (typeof value === "string") {
                    changes[key] = value;
                }
            } else if (fieldType === "integer") {
                const number = Number(value);
                if (Number.isFinite(number)) {
                    changes[key] = number;
                }
            }
        }
        if (Object.keys(changes).length) {
            await record.update(changes);
        }
    }
}

export const autocompleteField = {
    ...charField,
    component: AutocompleteField,
    displayName: _t("Autocomplete"),
    extractProps: (fieldInfo, dynamicInfo) => {
        const {options} = fieldInfo;
        const props = {
            ...charField.extractProps(fieldInfo, dynamicInfo),
            minSymbols: coerceNonNegativeNumber(
                options.min_symbols,
                DEFAULT_MIN_SYMBOLS
            ),
            delay: coerceNonNegativeNumber(options.debounce, DEFAULT_DELAY),
        };
        if (typeof options.function === "string" && options.function) {
            props.function = options.function;
        }
        if (fieldInfo.context && fieldInfo.context !== "{}") {
            props.context = dynamicInfo.context;
        }
        return props;
    },
};

registry.category("fields").add("autocomplete", autocompleteField);
