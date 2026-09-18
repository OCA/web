import {useChildRef, useService} from "@web/core/utils/hooks";
import {CharField, charField} from "@web/views/fields/char/char_field";
import {deserializeDate, deserializeDateTime} from "@web/core/l10n/dates";
import {AutoComplete} from "@web/core/autocomplete/autocomplete";
import {_t} from "@web/core/l10n/translation";
import {getActiveHotkey} from "@web/core/hotkeys/hotkey_service";
import {registry} from "@web/core/registry";
import {useInputField} from "@web/views/fields/input_field_hook";

const DEFAULT_MIN_SYMBOLS = 3;
const DEFAULT_DELAY = 250;

/**
 * Validate the supported x2many command shapes before passing them to Odoo.
 * SET replaces existing relations; this is a format check, not access control.
 *
 * @param {*} command JSON ORM command
 * @returns {Boolean} whether the command can be applied
 */
function isSupportedCommand(command) {
    if (!Array.isArray(command)) {
        return false;
    }
    const [operation, id, values] = command;
    switch (operation) {
        case 0:
            return (
                command.length === 3 &&
                id === 0 &&
                values !== null &&
                typeof values === "object" &&
                !Array.isArray(values)
            );
        case 4:
            return (
                (command.length === 2 || (command.length === 3 && values === 0)) &&
                Number.isSafeInteger(id) &&
                id > 0
            );
        case 6:
            return (
                command.length === 3 &&
                id === 0 &&
                Array.isArray(values) &&
                values.every(
                    (recordId) => Number.isSafeInteger(recordId) && recordId > 0
                )
            );
        default:
            return false;
    }
}

/**
 * Convert a suggestion value to the client format required by record.update.
 * Unsupported types and invalid values are skipped independently of other keys.
 *
 * @param {Object} field field metadata from the record
 * @param {*} value JSON value returned by the autocomplete method
 * @returns {*} client value, or undefined to skip the field
 */
function coerceFieldValue(field, value) {
    switch (field.type) {
        case "char":
        case "text":
        case "html":
            return typeof value === "string" ? value : undefined;
        case "integer":
        case "float":
        case "monetary": {
            const number = Number(value);
            return Number.isFinite(number) ? number : undefined;
        }
        case "boolean":
            return typeof value === "boolean" ? value : undefined;
        case "selection":
            return value === false || field.selection.some(([key]) => key === value)
                ? value
                : undefined;
        case "date":
        case "datetime": {
            if (value === false) {
                return false;
            }
            if (typeof value !== "string") {
                return undefined;
            }
            const parsed =
                field.type === "date"
                    ? deserializeDate(value)
                    : deserializeDateTime(value);
            return parsed.isValid ? parsed : undefined;
        }
        case "many2one":
            if (value === false) {
                return false;
            }
            if (Number.isSafeInteger(value) && value > 0) {
                return [value];
            }
            return Array.isArray(value) &&
                value.length === 2 &&
                Number.isSafeInteger(value[0]) &&
                value[0] > 0 &&
                typeof value[1] === "string"
                ? value
                : undefined;
        case "one2many":
        case "many2many":
            return Array.isArray(value) && value.every(isSupportedCommand)
                ? value
                : undefined;
        default:
            return undefined;
    }
}

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
 * Odoo 18 AutoComplete assigns `this.timeout = 250` in `setup()` before
 * passing it to `useDebounced`. Ignore that assignment and provide the
 * configured delay without duplicating core's debounced callback.
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
    get timeout() {
        return this.props.delay;
    }
    set timeout(_value) {
        // Keep the configured delay when Odoo 18 assigns its default in setup.
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
        } catch (error) {
            console.warn("Autocomplete suggestions could not be loaded.", error);
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
            const coerced = coerceFieldValue(record.fields[key], value);
            if (coerced !== undefined) {
                changes[key] = coerced;
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
