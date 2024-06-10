/** @odoo-module **/
import {RemoteMeasure} from "@web_widget_remote_measure/js/remote_measure_widget.esm";

export const RemoteMeasureUtilcell = RemoteMeasure.include({
    _read_from_device_tcp_params() {
        switch (this.protocol) {
            case "utilcell_f10":
                return {command: "PF10\r\n"};
            case "utilcell_f16":
                return {command: "PF16\r\n"};
        }
        return this._super(...arguments);
    },
    /**
     * Utilcell F10 Protocol response: +0020940
     * [status/sign][weight]
     * - status/sign: 1 character ? | + |
     * - weight: 7 characters
     * @param {String} msg ASCII string
     * @returns {Object} with the value and the stable flag
     */
    _proccess_msg_utilcell_f10(msg) {
        // eslint-disable-next-line init-declarations
        var stable, weight;
        try {
            // eslint-disable-next-line no-unused-vars
            stable = msg[0] !== "?";
            // If the weight isn't stable we don't want to parse the first character
            if (stable) {
                weight = msg.slice(0, 8);
            } else {
                weight = msg.slice(1, 8);
            }
        } catch {
            // Just return empty. We don't want to deal with single fails
            return {};
        }
        return {
            stable: stable,
            value: weight,
        };
    },
    /**
     * Utilcell F16 Protocol response: ST,GS,+0000000kg
     * [status],[mode],[sign][weight][uom]
     * - status: 2 characters ST | US | ER | OL | UL
     * - mode: 2 characters GS | NT
     * - sign: + | -
     * - weight: 7 characters
     * - uom: UTILCELL UOM 2 characters
     * @param {String} msg ASCII string
     * @returns {Object} with the value and the stable flag
     */
    _proccess_msg_utilcell_f16(msg) {
        // eslint-disable-next-line init-declarations
        var state, _mode, weight, uom;
        try {
            // eslint-disable-next-line no-unused-vars
            [state, _mode, weight] = msg.split(",");
            uom = weight.slice(8, 10);
            weight = weight.replace(/..\r\n/, "");
        } catch {
            // Just return empty. We don't want to deal with single fails
            return {};
        }
        return {
            stable: state === "ST",
            value: weight,
            uom: uom,
        };
    },
});
