/**
*    Copyright 2013 Matthieu Moquet
*    Copyright 2016-2017 LasLabs Inc.
*    License MIT (https://opensource.org/licenses/MIT)
**/

odoo.define('web_widget_darkroom.darkroom_zoom', function() {
    'use strict';

    var DarkroomPluginZoom = function() {
        Darkroom.plugins.zoom = Darkroom.Plugin.extend({
            inZoom: false,
            zoomLevel: 0,
            zoomFactor: 0.1,

            initialize: function() {
                var self = this;
                var buttonGroup = this.darkroom.toolbar.createButtonGroup();

                this.zoomButton = buttonGroup.createButton({
                    image: 'fa fa-search',
                });
                this.zoomInButton = buttonGroup.createButton({
                    image: 'fa fa-plus',
                });
                this.zoomOutButton = buttonGroup.createButton({
                    image: 'fa fa-minus',
                });
                this.cancelButton = buttonGroup.createButton({
                    image: 'fa fa-times',
                    type: 'danger',
                    hide: true
                });

                // Button click events
                this.zoomButton.addEventListener('click', this.toggleZoom.bind(this));
                this.zoomInButton.addEventListener('click', this.zoomIn.bind(this));
                this.zoomOutButton.addEventListener('click', this.zoomOut.bind(this));
                this.cancelButton.addEventListener('click', this.releaseFocus.bind(this));

                // Canvas events
                this.darkroom.canvas.on('mouse:down', this.onMouseDown.bind(this));
                this.darkroom.canvas.on('mouse:move', this.onMouseMove.bind(this));
                this.darkroom.canvas.on('mouse:up', this.onMouseUp.bind(this));
                $(this.darkroom.canvas.wrapperEl).on('mousewheel', function(event){
                    self.onMouseWheel(event);
                });

                this.toggleElements(false);
            },

            toggleZoom: function() {
                if (this.hasFocus()) {
                    this.releaseFocus();
                } else {
                    this.requireFocus();
                }
            },

            hasFocus: function() {
                return this.inZoom;
            },

            releaseFocus: function() {
                this.toggleElements(false);
            },

            requireFocus: function() {
                this.toggleElements(true);
            },

            toggleElements: function(bool) {
                var toggle = bool;
                if (typeof bool === 'undefined') {
                    toggle = !this.hasFocus();
                }

                this.zoomButton.active(toggle);
                this.inZoom = toggle;
                this.zoomInButton.hide(!toggle);
                this.zoomOutButton.hide(!toggle);
                this.cancelButton.hide(!toggle);
                this.darkroom.canvas.default_cursor = toggle ? 'move' : 'default';
            },

            zoomIn: function() {
                return this.setZoomLevel(this.zoomFactor, this.getCenterPoint());
            },

            zoomOut: function() {
                return this.setZoomLevel(-this.zoomFactor, this.getCenterPoint());
            },

            // Return fabric.Point object for center of canvas
            getCenterPoint: function() {
                var center = this.darkroom.canvas.getCenter();
                return new fabric.Point(center.left, center.top);
            },

            // Set internal zoom
            setZoomLevel: function(factor, point) {
                var zoomLevel = this.zoomLevel + factor;
                if (zoomLevel < 0) {
                    zoomLevel = 0;
                }
                if (zoomLevel === this.zoomLevel) {
                    return false;
                }
                if (point) {
                    var canvas = this.darkroom.canvas;
                    // Add one for zero index
                    canvas.zoomToPoint(point, zoomLevel + 1);
                    this.zoomLevel = zoomLevel;
                }
                return true;
            },

            onMouseWheel: function(event) {
                if (this.hasFocus() && event && event.originalEvent) {
                    var modifier = event.originalEvent.wheelDelta < 0 ? -1 : 1;
                    var pointer = this.darkroom.canvas.getPointer(event.originalEvent);
                    var mousePoint = new fabric.Point(pointer.x, pointer.y);
                    this.setZoomLevel(modifier * this.zoomFactor, mousePoint);
                    return event.preventDefault();
                }
            },

            onMouseDown: function() {
                if (this.hasFocus()) {
                    this.panning = true;
                }
            },

            onMouseUp: function() {
                this.panning = false;
            },

            onMouseMove: function(event) {
                if (this.panning && event && event.e) {
                    var delta = new fabric.Point(event.e.movementX, event.e.movementY);
                    this.darkroom.canvas.relativePan(delta);
                }
            },
        });
    };

    return {DarkroomPluginZoom: DarkroomPluginZoom};
});
