/** @odoo-module */

import {loadCSS, loadJS} from "@web/core/assets";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {useInputField} from "@web/views/fields/input_field_hook";
import {
    Component,
    onMounted,
    onPatched,
    onWillPatch,
    onWillStart,
    onWillUpdateProps,
    useRef,
    useState,
} from "@odoo/owl";

export class MapField extends Component {
    static template = "map_field.MapField";
    static props = {
        ...standardFieldProps,
    };

    setup() {
        this.rpc = useService("rpc");
        this.orm = useRef("orm");
        this.marker = null;
        this.mapElementList = null;
        this.state = useState({
            location: {
                lat: this.props.record.data[this.props.name]
                    ? parseFloat(this.props.record.data[this.props.name].split(",")[0])
                    : 0.0,
                lng: this.props.record.data[this.props.name]
                    ? parseFloat(this.props.record.data[this.props.name].split(",")[1])
                    : 0.0,
            },
            fields: this.props.field_list
                ? JSON.parse(this.props.field_list.split(","))
                : [],
        });
        useInputField({
            getValue: () => this.state.location,
            parse: (value) => this.parseLatLng(value),
            setValue: (value) => {
                this.state.location = value;
                this.placeMarker(value);
            },
        });

        onWillStart(() =>
            Promise.all([
                loadJS("/web_widget_map/static/lib/leaflet/leaflet.js"),
                loadCSS("/web_widget_map/static/lib/leaflet/leaflet.css"),
            ])
        );

        onMounted(() => {
            this.initializeMap();
        });

        onWillUpdateProps(() => {
            this.placeMarker(this.parseLatLng(this.props.record.data[this.props.name]));
            this.state.location = this.parseLatLng(
                this.props.record.data[this.props.name]
            );
        });

        onPatched(() => {
            this.placeMarker(this.parseLatLng(this.props.record.data[this.props.name]));
            this.resetZoom(this.parseLatLng(this.props.record.data[this.props.name]));
        });

        onWillPatch(() => {
            this.placeMarker(this.parseLatLng(this.props.record.data[this.props.name]));
            this.resetZoom(this.parseLatLng(this.props.record.data[this.props.name]));
        });
    }

    initializeMap() {
        const mapOptions = {
            center: {lat: this.state.location.lat, lng: this.state.location.lng},
            zoom: 13,
        };
        // eslint-disable-next-line no-undef
        this.map = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
        });
        this.mapElementList = document.getElementsByClassName("o_map_field");
        this.mapDiv = this.mapElementList[0];
        // eslint-disable-next-line no-undef
        this.mapDiv.el = L.map(this.mapDiv, mapOptions);
        this.mapDiv.el.addLayer(this.map);
        this.placeMarker(this.state.location);
    }

    placeMarker(latLng) {
        if (this.marker) {
            this.marker.remove();
        }
        // eslint-disable-next-line no-undef
        this.marker = new L.Marker([latLng.lat, latLng.lng], {draggable: true});
        this.marker.addTo(this.mapDiv.el);
        this.marker.on("dragend", (e) => this.updateLocation(e.target.getLatLng()));
    }

    updateLocation(latLng) {
        this.state.location = {
            lat: latLng.lat,
            lng: latLng.lng,
        };
        this.props.record.update({[this.props.name]: `${latLng.lat}, ${latLng.lng}`});
    }

    resetZoom(latLng) {
        this.mapDiv.el.setView([latLng.lat, latLng.lng], 13);
    }

    parseLatLng(value) {
        if (typeof value === "string" && value.includes(",")) {
            return {
                lat: parseFloat(value.split(",")[0]),
                lng: parseFloat(value.split(",")[1]),
            };
        }
        return {lat: 0, lng: 0};
    }
}

export const mapField = {
    component: MapField,
    displayName: "Map",
    supportedTypes: ["point"],
};

registry.category("fields").add("map", mapField);
