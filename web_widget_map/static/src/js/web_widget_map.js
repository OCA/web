odoo.define('web_widget_map', function (require) {
    "use strict";

    var widget_registry = require('web.widget_registry');
    var Widget = require('web.Widget');

    var MapWidget = Widget.extend({
        template: 'Map',
        events: {
            'click #loadMap': '_initializeMap',
        },
        init: function () {
            this._super.apply(this, arguments);
            this.mapLayers = [new ol.layer.Tile({
                source: new ol.source.OSM()
            })];
            this.centerMap = [0, 0];
            this.markers = [];
        },
        _initializeMap: function () {
            var self = this;
            $("#loadMap").remove()
            $("#map").addClass("map")
            $("#mapLegend").removeClass("legend-hidden")

            self._initializeMarkers()

            var map = new ol.Map({
                layers: self.mapLayers,
                target: $("#map")[0],
                view: new ol.View({
                    center: ol.proj.fromLonLat(self.centerMap),
                    zoom: 10
                })
            });

            $(".marker").each(function () {
                var element = this;
                var popup = new ol.Overlay({
                    element: element,
                    positioning: 'bottom-center',
                    stopEvent: false,
                    offset: [0, -50]
                });
                map.addOverlay(popup);
            });

        },
        _initializeMarkers: function () {
            var features = [];
            if (this.markers.length) {
                for (var marker of this.markers) {
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([marker[1], marker[2]])),
                        name: marker[0],
                    });

                    var iconStyle = new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            scale: 0.1,
                            src: marker[3],
                        })
                    });
                    iconFeature.setStyle(iconStyle);
                    features.push(iconFeature);
                }
                var vectorSource = new ol.source.Vector({
                    features: features,
                });
                var vectorLayer = new ol.layer.Vector({
                    source: vectorSource,
                });
                this.mapLayers.push(vectorLayer)
            }

        },
    });

    widget_registry.add('map_widget', MapWidget);

    return MapWidget
});
