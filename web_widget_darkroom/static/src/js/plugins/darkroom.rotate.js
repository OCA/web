/**
*    Copyright 2013 Matthieu Moquet
*    Copyright 2016-2017 LasLabs Inc.
*    License MIT (https://opensource.org/licenses/MIT)
**/

odoo.define('web_widget_darkroom.darkroom_rotate', function() {
    'use strict';

    var DarkroomPluginRotate = function() {
        var Rotation = Darkroom.Transformation.extend({
            applyTransformation: function(canvas, image, next) {
                var angle = (image.getAngle() + this.options.angle) % 360;
                image.rotate(angle);

                var height = Math.abs(image.getWidth()*Math.sin(angle*Math.PI/180))+Math.abs(image.getHeight()*Math.cos(angle*Math.PI/180));
                var width = Math.abs(image.getHeight()*Math.sin(angle*Math.PI/180))+Math.abs(image.getWidth()*Math.cos(angle*Math.PI/180));

                canvas.setWidth(width);
                canvas.setHeight(height);

                canvas.centerObject(image);
                image.setCoords();
                canvas.renderAll();

                next();
            },
        });

        Darkroom.plugins.rotate = Darkroom.Plugin.extend({
            initialize: function InitDarkroomRotatePlugin() {
                var buttonGroup = this.darkroom.toolbar.createButtonGroup();

                var leftButton = buttonGroup.createButton({
                    image: 'fa fa-undo oe_edit_only',
                    editOnly: true,
                });
                var rightButton = buttonGroup.createButton({
                    image: 'fa fa-repeat oe_edit_only',
                    editOnly: true,
                });

                leftButton.addEventListener('click', this.rotateLeft.bind(this));
                rightButton.addEventListener('click', this.rotateRight.bind(this));
            },

            rotateLeft: function rotateLeft() {
                this.rotate(-90);
            },

            rotateRight: function rotateRight() {
                this.rotate(90);
            },

            rotate: function rotate(angle) {
                this.darkroom.applyTransformation(
                    new Rotation({angle: angle})
                );
            }
        });
    };

    return {DarkroomPluginRotate: DarkroomPluginRotate};
});
