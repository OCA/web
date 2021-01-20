"use strict";
/* eslint strict: ["error", "global"] */
/* eslint-disable no-undef, no-implicit-globals, no-unused-vars */
/* Copyright Odoo S.A.
   Copyright 2020 Tecnativa - Alexandre D. Díaz
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl). */

odoo.define("web_pwa_cache.PWA.core.base.Tools", function (require) {
    "use strict";

    const ODOO_DATE_FORMAT = 'YYYY-MM-DD';
    const ODOO_TIME_FORMAT = 'HH:mm:ss';
    const ODOO_DATETIME_FORMAT = `${ODOO_DATE_FORMAT} ${ODOO_TIME_FORMAT}`;

    /**
     * Make a 'application/json' response
     *
     * @param {Object} data
     */
    function ResponseJSONRPC(data) {
        const blob = new Blob([
            JSON.stringify({
                id: new Date().getTime(),
                jsonrpc: '2.0',
                result: data,
            }, null, 2)
        ], {type : 'application/json'});
        return new Response(blob, {
            status: 200,
            statusText: 'OK',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Make a 'Image' response
     *
     * @param {Base64} data
     */
    function ResponseImage(data) {
        const file_type_magic_word = {
            '/': 'jpg',
            'R': 'gif',
            'i': 'png',
            'P': 'svg+xml',
        };

        const mimetype = `image/${file_type_magic_word[data[0]] || 'png'}`;
        const blob = b64toBlob(data, mimetype);
        return new Response(blob, {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Length': atob(data).length,
                'Content-Type': mimetype,
            },
        });
    }

    /**
     * Make a 'Redirect' response
     *
     * @param {Base64} data
     */
    function ResponseRedirect(url) {
        return new Response(null, {
            status: 302, // Temporally moved
            statusText: 'Found',
            headers: {
                'Location': url,
            },
        });
    }

    /**
     * Helper function to create POST requests
     *
     * @param {String} url
     * @param {Object} data
     * @returns {Promise}
     */
    function MakePost(url, data) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
    }

    /**
     * Converts Base64 to a Blob object
     *
     * @param {String} b64Data
     * @param {String} contentType
     * @param {Number} sliceSize
     */
    function b64toBlob(b64Data, contentType='', sliceSize=512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

    /**
     * Format seconds to Date
     *
     * @param {Date} date
     */
    function SecondsToDate(seconds) {
        if (!seconds) {
            return null;
        }
        return (new moment()).utc(seconds);
    }

    /**
     * Format a Date to string
     *
     * @param {Date} date
     */
    function DateToOdooFormat(date, only_date = false) {
        return (new moment(date)).utc().format(only_date ? ODOO_DATE_FORMAT : ODOO_DATETIME_FORMAT);
    }

    /**
     * Convert string to Date
     *
     * @param {Date} date
     */
    function OdooDateToMoment(strdate, only_date = false) {
        return (new moment.utc(strdate, only_date ? ODOO_DATE_FORMAT : ODOO_DATETIME_FORMAT));
    }

    /**
     * Odoo implementation to rounding
     *
     * @param {Number} value
     * @param {Number} precision
     */
    function round_precision(value, precision) {
        if (!value) {
            return 0;
        } else if (!precision || precision < 0) {
            precision = 1;
        }
        var normalized_value = value / precision;
        var epsilon_magnitude = Math.log(Math.abs(normalized_value))/Math.log(2);
        var epsilon = Math.pow(2, epsilon_magnitude - 52);
        normalized_value += normalized_value >= 0 ? epsilon : -epsilon;

        /**
         * Javascript performs strictly the round half up method, which is asymmetric.
         * However, in Python, the method is symmetric. For example:
         * - In JS, Math.round(-0.5) is equal to -0.
         * - In Python, round(-0.5) is equal to -1.
         * We want to keep the Python behavior for consistency.
         */
        var sign = normalized_value < 0 ? -1.0 : 1.0;
        var rounded_value = sign * Math.round(Math.abs(normalized_value));
        return rounded_value * precision;
    }

    /**
     * Odoo implementation to rounding
     *
     * @param {Number} value
     * @param {Number} decimals
     */
    function round_decimals(value, decimals) {
        /**
         * The following decimals introduce numerical errors:
         * Math.pow(10, -4) = 0.00009999999999999999
         * Math.pow(10, -5) = 0.000009999999999999999
         *
         * Such errors will propagate in round_precision and lead to inconsistencies
         * between Python and JavaScript. To avoid this, we parse the scientific notation.
         */
        return round_precision(value, parseFloat('1e' + -decimals));
    }

    // Code from https://stackoverflow.com/a/18639903
    const crc32 = (function()
    {
        var table = new Uint32Array(256);

        // Pre-generate crc32 polynomial lookup table
        // http://wiki.osdev.org/CRC32#Building_the_Lookup_Table
        // ... Actually use Alex's because it generates the correct bit order
        //     so no need for the reversal function
        for(var i=256; i--;)
        {
            var tmp = i;

            for(var k=8; k--;)
            {
                tmp = tmp & 1 ? 3988292384 ^ tmp >>> 1 : tmp >>> 1;
            }

            table[i] = tmp;
        }

        // crc32b
        // Example input        : [97, 98, 99, 100, 101] (Uint8Array)
        // Example output       : 2240272485 (Uint32)
        return function( data )
        {
            var crc = -1; // Begin with all bits set ( 0xffffffff )

            for(var i=0, l=data.length; i<l; i++)
            {
                crc = crc >>> 8 ^ table[ crc & 255 ^ data[i] ];
            }

            return (crc ^ -1) >>> 0; // Apply binary NOT
        };

    })();

    function hex(number) {
        return number.toString(16);
    }

    // Code from https://stackoverflow.com/a/32538867
    function isIterable(obj) {
        if (_.isNull(obj) || _.isUndefined(obj)) {
        return false;
        }
        return typeof obj[Symbol.iterator] === 'function';
    }

    function isCalleable(obj) {
        if (_.isNull(obj) || _.isUndefined(obj)) {
        return false;
        }
        return typeof obj === 'function';
    }

    function s_quote(to_quote) {
        if (to_quote.indexOf('"') === -1) {
            return `"${to_quote}"`;
        }
        return to_quote;
    }

    return {
        ODOO_DATE_FORMAT: ODOO_DATE_FORMAT,
        ODOO_TIME_FORMAT: ODOO_TIME_FORMAT,
        ODOO_DATETIME_FORMAT: ODOO_DATETIME_FORMAT,

        ResponseJSONRPC: ResponseJSONRPC,
        ResponseImage: ResponseImage,
        ResponseRedirect: ResponseRedirect,

        MakePost: MakePost,
        b64toBlob: b64toBlob,

        SecondsToDate: SecondsToDate,
        DateToOdooFormat: DateToOdooFormat,
        OdooDateToMoment: OdooDateToMoment,

        round_precision: round_precision,
        round_decimals: round_decimals,

        crc32: crc32,
        hex: hex,

        isIterable: isIterable,
        isCalleable: isCalleable,

        s_quote: s_quote,
    }

});
