/** @odoo-module **/
// TODO: Implement in OWL in v16. It should have be a much much simpler implementation.
import {FieldFloat} from "web.basic_fields";
import {_lt} from "@web/core/l10n/translation";
import {_t} from "web.translation";
import fieldRegistry from "web.field_registry";
import session from "web.session";

// Animate the measure steps for each measure received.
export const nextState = {
    "fa-thermometer-empty": "fa-thermometer-quarter",
    "fa-thermometer-quarter": "fa-thermometer-half",
    "fa-thermometer-half": "fa-thermometer-three-quarters",
    "fa-thermometer-three-quarters": "fa-thermometer-full",
    "fa-thermometer-full": "fa-thermometer-empty",
};

export const RemoteMeasureMixin = {
    /**
     * F501 Protocol response:
     * [STX][status1][status2][data][ETX]
     * - status1 beign weight status: \x20 (space) for stable weight and ? for unstable
     * - status2 beign weight sign: + for positive and - for negative.
     * - data being the weight itself with 6 characters for weight and one . for the
     *   decimal dot
     *
     * @param {String} msg ASCII string
     * @returns {Object} with the value and the stable flag
     */
    _proccess_msg_f501(msg) {
        return {
            stable: msg[1] === "\x20",
            value: parseFloat(msg.slice(2, 10)),
        };
    },
    /**
     * Implemented for a continous remote stream
     * TODO: Abstract more the possible device scenarios
     */
    _connect_to_websockets() {
        try {
            this.socket = new WebSocket(this.host);
        } catch (error) {
            // Avoid websockets security error. Local devices won't have wss normally
            if (error.code === 18) {
                return;
            }
            throw error;
        }
        var icon = "fa-thermometer-empty";
        var stream_success_counter = 10;
        this.socket.onmessage = async (msg) => {
            const data = await msg.data.text();
            const processed_data = this[`_proccess_msg_${this.protocol}`](data);
            if (!processed_data.stable) {
                stream_success_counter = 5;
            }
            if (processed_data.stable && !stream_success_counter) {
                this._stableMeasure();
                this._closeSocket();
                this._awaitingMeasure();
                this._recordMeasure();
                return;
            }
            this._unstableMeasure();

            if (stream_success_counter) {
                --stream_success_counter;
            }
            icon = this._nextStateIcon(icon);
            this.amount = processed_data.value;
            this._setMeasure();
        };
        this.socket.onerror = () => {
            this._awaitingMeasure();
        };
    },
    /**
     * Implement for your device protocol service
     */
    _connect_to_webservices() {
        return;
    },
    /**
     * Send read params to the remote device
     * @returns {Object}
     */
    _read_from_device_tcp_params() {
        return {command: false};
    },
    /**
     * Process call
     * @returns {Number}
     */
    async _read_from_device_tcp() {
        const data = await this._rpc({
            route: `/remote_measure_device/${this.remote_device_data.id}` || [],
            params: this._read_from_device_tcp_params(),
        });
        if (!data) {
            return null;
        }
        const processed_data = this[`_proccess_msg_${this.protocol}`](data);
        if (isNaN(processed_data.value)) {
            processed_data.value = 0;
        }
        return processed_data;
    },
    /**
     * Connect to the local controller, which makes the direct connection to the
     * scale.
     */
    async _connect_to_tcp() {
        var icon = "fa-thermometer-empty";
        var stream_success_counter = 20;
        this._unstableMeasure();
        // Used to set the read interval if any
        const timer = (ms) => new Promise((res) => setTimeout(res, ms));
        // Don't keep going forever unless non stop reading
        for (
            let attemps_left = this.remote_device_data.non_stop_read ? Infinity : 1000;
            attemps_left > 0;
            attemps_left--
        ) {
            // Allow to break the loop manually
            if (this.stop) {
                break;
            }
            const processed_data = await this._read_from_device_tcp();
            if (!processed_data) {
                continue;
            }
            if (processed_data.stable) {
                this._stableMeasure();
            } else {
                this._unstableMeasure();
                stream_success_counter = 20;
            }
            if (processed_data.stable && stream_success_counter <= 0) {
                this._stableMeasure();
                this._awaitingMeasure();
                this._recordMeasure();
                break;
            } else if (this.remote_device_data.non_stop_read) {
                stream_success_counter = 20;
                this._recordMeasure();
            }
            if (stream_success_counter) {
                --stream_success_counter;
            }
            icon = this._nextStateIcon(icon);
            this.amount = processed_data.value;
            this._setMeasure();
            // Set sleep interval
            if (this.remote_device_data.read_interval) {
                await timer(this.remote_device_data.read_interval);
            }
        }
    },
    /**
     * Convert the measured units to the units expecte by the record if different
     * @param {Number} amount
     * @returns {Number} converted amount
     */
    _compute_quantity(amount) {
        if (this.uom.id === this.device_uom.id) {
            return amount;
        }
        let converted_amount = amount / this.remote_device_data.uom_factor;
        converted_amount *= this.uom.factor;
        return converted_amount;
    },
    /**
     * Set value
     */
    async _setMeasure() {
        if (isNaN(this.amount)) {
            return;
        }
        this.amount = this._compute_quantity(this.amount);
        if (this.start_add) {
            this.amount += this.input_val;
        }
        this.$input.val(this.amount.toLocaleString(this.locale_code));
        this._setValue(this.$input.val());
    },
    /**
     * Procure to close the socket whenever the widget stops being used
     */
    _closeSocket() {
        if (this.socket) {
            this.socket.close();
        }
    },
    /**
     * Animate the measure steps for each measure received.
     * @param {String} icon
     * @returns {String} next icon
     */
    _nextStateIcon(icon) {
        const next_icon = nextState[icon];
        this.$icon.removeClass(icon);
        this.$icon.addClass(next_icon);
        return next_icon;
    },
    /**
     * While a measure is not stable the button will be red
     */
    _unstableMeasure() {
        this.$stop_measure.removeClass("btn-primary btn-success");
        this.$stop_measure.addClass("btn-danger");
    },
    /**
     * Once we consider the measure is stable render the button as green
     */
    _stableMeasure() {
        this.$stop_measure.removeClass("btn-primary btn-danger");
        this.$stop_measure.addClass("btn-success");
    },
    /**
     * While the widget isn't querying it will be purple as a signal that we can start
     */
    _awaitingMeasure() {
        this.$start_measure.removeClass("btn-success btn-danger");
        this.$start_measure.addClass("btn-primary");
        this.$stop_measure.addClass("d-none");
        this.$start_measure.removeClass("d-none");
        if (this.$start_measure_add) {
            this.$start_measure_add.removeClass("d-none");
        }
    },
    /**
     *
     */
    _recordMeasure() {
        this.start_add = false;
        this.input_val = this.amount;
        this.start_add = false;
    },
    /**
     * Request measure to remote device
     */
    measure() {
        this.stop = false;
        this.$start_measure.addClass("d-none");
        this.$stop_measure.removeClass("d-none");
        this.$icon = this.$stop_measure.find("i");
        this[`_connect_to_${this.connection_mode}`]();
    },
    /**
     * Stop requesting measures from device
     */
    measure_stop() {
        this._closeSocket();
        this.stop = true;
        this._awaitingMeasure();
        this._recordMeasure();
    },
    /**
     * Start requesting measures from the remote device
     * @param {MouseEvent} ev
     */
    _onMeasure(ev) {
        ev.preventDefault();
        this.measure();
    },
    _onMeasureAdd(ev) {
        ev.preventDefault();
        this.start_add = true;
        this.$start_measure.addClass("d-none");
        this.$start_measure_add.addClass("d-none");
        this.$stop_measure.removeClass("d-none");
        this.$icon = this.$stop_measure.find("i");
        this[`_connect_to_${this.connection_mode}`]();
    },
    /**
     * Validate the requested measure
     * @param {MouseEvent} ev
     */
    _onValidateMeasure(ev) {
        ev.preventDefault();
        this.measure_stop();
    },
    /**
     * Remote measure handle to start measuring
     * @returns {jQueryElement}
     */
    _addRemoteMeasureWidgetStart() {
        return $(
            `
            <span class="o_field_remote_device_start btn btn-primary mr-1">
                <i class="fa fa-thermometer-half">
            </span>
            `
        ).on("click", this._onMeasure.bind(this));
    },
    /**
     * Remote measure handle to start measuring
     * @returns {jQueryElement}
     */
    _addRemoteMeasureWidgetStartAdd() {
        return $(
            `
            <span class="o_field_remote_device_start btn btn-link mr-1">
                <i class="fa fa-plus">
            </span>
            `
        ).on("click", this._onMeasureAdd.bind(this));
    },
    /**
     * Remote measure handle to stop and register measuring
     * @returns {jQueryElement}
     */
    _addRemoteMeasureWidgetStop() {
        return $(
            `
            <span class="o_field_remote_device_stop btn btn-secondary d-none mr-1">
                <i class="fa fa-thermometer-empty">
            </span>
            `
        ).on("click", this._onValidateMeasure.bind(this));
    },
};

export const RemoteMeasure = FieldFloat.extend(RemoteMeasureMixin, {
    description: _lt("Remote Measure"),
    className: "o_field_remote_device o_field_number",
    tagName: "span",
    isQuickEditable: true,
    resetOnAnyFieldChange: true,
    events: Object.assign({}, FieldFloat.prototype.events, {
        focusin: "_onFocusIn",
    }),
    /**
     * Setup the field layout and the remote device parameters
     */
    init() {
        this._super(...arguments);
        if (this.mode === "edit") {
            this.tagName = "div";
            this.className += " o_input";
        }
        this.locale_code = _t.database.parameters.code.replace("_", "-");
        this.decimal_separator = _t.database.parameters.decimal_point;
        this.thousands_sep = _t.database.parameters.thousands_sep;
        this.remote_device_field = this.nodeOptions.remote_device_field;
        this.default_user_device = this.nodeOptions.default_user_device;
        if (this.nodeOptions.remote_device_field === "id") {
            this.remote_device_data = this.recordData;
        } else if (this.remote_device_field) {
            this.remote_device_data = this.recordData[this.remote_device_field].data;
        }
        this.uom = this.recordData[this.nodeOptions.uom_field].data;
        this.allow_additive_measure = this.nodeOptions.allow_additive_measure;
        // Add to your view options so you can log requests and responses
    },
    /**
     * Request the configured remote device info
     */
    async willStart() {
        await this._super(...arguments);
        // Try to get the user's preferred device if any
        if (!this.remote_device_data && this.default_user_device) {
            [this.remote_device_data] = await this._rpc({
                model: "res.users",
                method: "read",
                args: [session.uid, ["remote_measure_device_id"]],
            });
            if (!this.remote_device_data.remote_measure_device_id) {
                return;
            }
            if (this.remote_device_data) {
                this.remote_device_data.id =
                    this.remote_device_data.remote_measure_device_id[0];
            }
        }
        if (!this.remote_device_data || !this.uom) {
            return;
        }
        [this.remote_device_data] = await this._rpc({
            model: "remote.measure.device",
            method: "read",
            args: [this.remote_device_data.id, []],
        });
        [this.uom] = await this._rpc({
            model: "uom.uom",
            method: "read",
            args: [this.uom.id, []],
        });
        this.uom_category = this.uom.category_id[0];
        this.device_uom_category = this.remote_device_data.uom_category_id[0];
        this.device_uom = this.remote_device_data.uom_id[0];
        this.host = this.remote_device_data && this.remote_device_data.host;
        this.protocol = this.remote_device_data && this.remote_device_data.protocol;
        this.connection_mode =
            this.remote_device_data && this.remote_device_data.connection_mode;
    },
    /**
     * Set de widget layout up
     * @returns {Promise}
     */
    _renderEdit() {
        this.$el.empty();
        var def = this._prepareInput(this.$input).appendTo(this.$el);
        // From locale format
        if (this.input_val === undefined) {
            let pre_value = this.$input.val() || "0";
            pre_value = pre_value.replace(this.thousands_sep, "");
            pre_value = pre_value.replace(this.decimal_separator, ".");
            this.input_val = parseFloat(pre_value);
        }
        this.start_add = false;
        const [device_uom = undefined] =
            (this.remote_device_data && this.remote_device_data.uom_id) || [];
        if (
            !this.remote_device_data ||
            !this.uom ||
            !device_uom ||
            this.uom_category !== this.device_uom_category
        ) {
            return def;
        }
        this.$start_measure = this._addRemoteMeasureWidgetStart();
        this.$stop_measure = this._addRemoteMeasureWidgetStop();
        if (this.allow_additive_measure && this.input_val > 0) {
            this.$start_measure_add = this._addRemoteMeasureWidgetStartAdd();
            this.$el.prepend(this.$start_measure_add);
        }
        this.$el.prepend(this.$start_measure, this.$stop_measure);
        return def;
    },
    /**
     * Read right on if configured
     * @override
     */
    start() {
        this._super(...arguments).then(() => {
            if (this.remote_device_data.instant_read) {
                this.measure();
            }
        });
    },
    /**
     * Ensure that the socket is allways closed
     */
    destroy() {
        this._closeSocket();
        this._super.apply(this, arguments);
    },
    /**
     * Auto select all the content
     */
    _onFocusIn: function () {
        // Auto select all content when user enters into fields with this
        // widget.
        this.$input.select();
    },
});

fieldRegistry.add("remote_measure", RemoteMeasure);
