/**
*    Copyright 2013 Matthieu Moquet
*    Copyright 2016-2017 LasLabs Inc.
*    Version 2.0.1
*    License MIT (https://opensource.org/licenses/MIT)
**/

(function() {
    'use strict';

    Darkroom.Utils = {
        extend: extend,
        computeImageViewPort: computeImageViewPort,
    };

    // Utility method to easily extend objects.
    function extend(b, a) {
        var prop;
        if (b === undefined) {
            return a;
        }

        for (prop in a) {
            if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
                b[prop] = a[prop];
            }
        }
        return b;
    }

    function computeImageViewPort(image) {
        return {
            height: Math.abs(image.getWidth() * (Math.sin(image.getAngle() * Math.PI/180))) + Math.abs(image.getHeight() * (Math.cos(image.getAngle() * Math.PI/180))),
            width: Math.abs(image.getHeight() * (Math.sin(image.getAngle() * Math.PI/180))) + Math.abs(image.getWidth() * (Math.cos(image.getAngle() * Math.PI/180))),
        };
    }
})();
