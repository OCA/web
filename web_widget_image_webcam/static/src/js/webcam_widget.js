/*
    Copyright 2016 Siddharth Bhalgami <siddharth.bhalgami@techreceptives.com>
    Copyright 2019 Shurshilov Artem <shurshilov.a@yandex.ru>
    License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl).
*/
odoo.define('web_widget_image_webcam.webcam_widget', function(require) {
    "use strict";

    var core = require('web.core');
//    var Model = require('web.Model');
    var Dialog = require('web.Dialog');
    var base_f = require('web.basic_fields');
    var imageWidget = base_f.FieldBinaryImage;
    var DocumentViewer = require('mail.DocumentViewer');
    var field_utils = require('web.field_utils');

    var _t = core._t;
    var QWeb = core.qweb;

    imageWidget.include({

        _render: function () {
            this._super();

            var self = this,
                WebCamDialog = $(QWeb.render("WebCamDialog")),
                img_data;

            // ::webcamjs:: < https://github.com/jhuckaby/webcamjs >
            // Webcam: Set Custom Parameters
            Webcam.set({
                width: 320,
                height: 240,
                dest_width: 320,
                dest_height: 240,
                image_format: 'jpeg',
                jpeg_quality: 90,
                force_flash: false,
                fps: 45,
                swfURL: '/web_widget_image_webcam/static/src/js/webcam.swf',
                //force_flash: true,
            });

            self.$el.find('.o_form_binary_file_web_cam').removeClass('col-md-offset-5');

/*            new Model('ir.config_parameter').call('get_param', ['web_widget_image_webcam.flash_fallback_mode', false]).
            then(function(default_flash_fallback_mode) {
                if (default_flash_fallback_mode == 1) {
                    Webcam.set({
                        
                            :: Important Note about Chrome 47+ :: < https://github.com/jhuckaby/webcamjs#important-note-for-chrome-47 >
                            Setting "force_flash" to "true" will always run in Adobe Flash fallback mode on Chrome, but it is not desirable.
                        
                        force_flash: true,
                    });
                }
            });*/

            self.$el.find('.o_form_binary_file_web_cam').off().on('click', function(){
                // Init Webcam
                new Dialog(self, {
                    size: 'large',
                    dialogClass: 'o_act_window',
                    title: _t("WebCam Booth"),
                    $content: WebCamDialog,
                    buttons: [
                        {
                            text: _t("Take Snapshot"), classes: 'btn-primary take_snap_btn',
                            click: function () {
                                Webcam.snap( function(data) {
                                    img_data = data;
                                    // Display Snap besides Live WebCam Preview
                                    WebCamDialog.find("#webcam_result").html('<img src="'+img_data+'"/>');
                                });
                                // Remove "disabled" attr from "Save & Close" button
                                $('.save_close_btn').removeAttr('disabled');
                            }
                        },
                        {
                            text: _t("Save & Close"), classes: 'btn-primary save_close_btn', close: true,
                            click: function () {
                                var img_data_base64 = img_data.split(',')[1];

                                /*
                                    Size in base64 is approx 33% overhead the original data size.

                                    Source: -> http://stackoverflow.com/questions/11402329/base64-encoded-image-size
                                            -> http://stackoverflow.com/questions/6793575/estimating-the-size-of-binary-data-encoded-as-a-b64-string-in-python

                                            -> https://en.wikipedia.org/wiki/Base64
                                            [ The ratio of output bytes to input bytes is 4:3 (33% overhead).
                                            Specifically, given an input of n bytes, the output will be "4[n/3]" bytes long in base64,
                                            including padding characters. ]
                                */

                                // From the above info, we doing the opposite stuff to find the approx size of Image in bytes.
                                var approx_img_size = 3 * (img_data_base64.length / 4)  // like... "3[n/4]"

                                // Upload image in Binary Field
                                self.on_file_uploaded(approx_img_size, "web-cam-preview.jpeg", "image/jpeg", img_data_base64);
                            }
                        },
                        {
                            text: _t("Close"), close: true
                        }
                    ]
                }).open();
                 console.log(WebCamDialog);
                 console.log(WebCamDialog.find('#live_webcam'));
                Webcam.attach(WebCamDialog.find('#live_webcam')[0]);

                // At time of Init "Save & Close" button is disabled
                $('.save_close_btn').attr('disabled', 'disabled');

                // Placeholder Image in the div "webcam_result"
                WebCamDialog.find("#webcam_result").html('<img src="/web_widget_image_webcam/static/src/img/webcam_placeholder.png"/>');
            });
        },
    });

    Dialog.include({
        destroy: function () {
            // Shut Down the Live Camera Preview | Reset the System
            Webcam.reset();
            this._super.apply(this, arguments);
        },
    });

});
