/*
# Copyright 2009-2019 Noviat.
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).
*/
odoo.define('web_widget_image_paint.web_paint', function (require) {
    "use strict";
    var core = require('web.core');
    var FormView = require('web.FormView');
    var BasicFields= require('web.basic_fields');
    var Registry = require('web.field_registry');
    var FormController = require('web.FormController');
    var utils = require('web.utils');
    var session = require('web.session');
    var field_utils = require('web.field_utils');
    var _t = core._t;
    var QWeb = core.qweb;
    const WIDTH = 500;
    const HEIGHT = 376;

    var FieldPainting = BasicFields.FieldBinaryImage.extend({
        template: 'FieldPainting',
        placeholder: "/web_widget_image_paint/static/src/img/image-placeholder.png",
        events: _.extend({}, BasicFields.FieldBinaryImage.prototype.events, {
            "click #reset": "reset_clicked",
            "click #add_marker": "add_marker",
            "click #drawing-mode": "drawing_mode",
            "change #drawing-mode-selector": "drawing_mode_selection",
            "change #drawing-color": "drawingColorEl_onchange",
            "change #drawing-shadow-color": "drawingShadowColorEl_onchange",
            "change #drawing-line-width": "drawingLineWidthEl_onchange",
            "change #drawing-shadow-width": "drawingShadowWidth_onchange",
            "change #drawing-shadow-offset": "drawingShadowOffset_onchange",
            "change #file_paint": "file_paint_onchange",
            "click #edit_click": "edit_click",
            "click #clear_click": "reset_clicked",
            'click .save_paint': 'save_paint',
        }),

        // **********************************************************
        // * edit_click
        // **********************************************************
        edit_click: function (ev) {
            var self = this;
            this.$el.find('#file_paint').click();
        },
        // **********************************************************
        // * file_paint_onchange
        // **********************************************************
        file_paint_onchange: function (ev) {
            var self = this;
            var image_input = null;
            var file = document.getElementById('file_paint').files[0];
            if (file) {
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    self.__reset_with_local_file = e.target.result;
                    self.__is_reset = true;
                    self.__is_reset_with_local_file = true;
                    self.render_value();
                }
            }
        },
        // **********************************************************
        // * reset_clicked (custom)
        // **********************************************************
        reset_clicked: function (ev) {
            this.__is_reset = true;
            this.render_value();
        },
        // **********************************************************
        // * get_url
        // **********************************************************
        get_url: function (background_image_field) {
            var self = this;
            var background_url = self.attrs['background'] || self.placeholder;
            var url = background_url;
            if (background_image_field) {
                var image_field = self.fields[background_image_field];
                if (image_field) {
                    url = session.url('/web/image', {
                        model: self.model,
                        field: self.nodeOptions.preview_image ? self.nodeOptions.preview_image : background_image_field,
                        unique: field_utils.format.datetime(self.recordData.__last_update).replace(/[^0-9]/g, ''),
                        id: JSON.stringify(self.recordData.id || null),
                    });
                };
            };
            if (self.__is_reset && !self.get('value')) {
                if (self.__is_reset_with_local_file) {
                    self.__is_reset_with_local_file = false;
                    url = self.__reset_with_local_file;
                }
                self.__is_reset = false;
            }
            else {
                if (self['value']) {
                    url = session.url('/web/image', {
                        model: self.model,
                        id: JSON.stringify(self.res_id),
                        field: self.nodeOptions.preview_image ? self.nodeOptions.preview_image : self.name,
                        unique: field_utils.format.datetime(self.recordData.__last_update).replace(/[^0-9]/g, ''),
                        id: JSON.stringify(self.recordData.id || null),
                    });
                }
            };
            return url || background_url;
        },
        // **********************************************************
        // * get_options
        // **********************************************************
        get_options: function () {
            var self = this;
            var options = {};
            var options = self.attrs.options;
            if (options['drawing_mode'] == undefined) {
                options['drawing_mode'] = true;
            };
            if (options['add_marker'] == undefined) {
                options['add_marker'] = true;
            };
            if (options['edit_background_image'] == undefined) {
                options['edit_background_image'] = true;
            };
            if (options['background_image_field'] == undefined) {
                options['background_image_field'] = false;
            };
            if (options['marker_shape'] == undefined) {
                options['marker_shape'] = 'x-sign';
            };
            if (options['marker_size'] == undefined) {
                options['marker_size'] = 20;
            };
            if (options['marker_color'] == undefined) {
                options['marker_color'] = 'red';
            };
            if (self.attrs['readonly'] == true) {
                options['readonly'] = true;
            };
            return options;
        },

        // **********************************************************
        // * start
        // **********************************************************
        start: function() {
            var self = this;
            self.render_value();
        },
        // **********************************************************
        // * save_paint
        // **********************************************************
        save_paint: function(value_) {
            var self = this;
            var canvas = self.$el.find("#c")[0];
            var data = canvas.toDataURL().replace('data:image/png;base64,', '');
            this.$el.find("#field_painting").prevObject[0].firstElementChild.style="display:none"
            this._setValue(data);
        },

        // **********************************************************
        // * render_value
        // **********************************************************
        render_value: function () {
            var self = this;
            var options = self.get_options();
            var url = false;
            // *** view and edit (not create)
            if (self.value) {// vs self.mode != 'create' because self.mode never has value 'create'
                self.$el.children().remove();
                if (self.mode == 'edit') {
                    self.__box = QWeb.render(
                        "DesignBox",
                        {
                            edit_background_image: options['edit_background_image'],
                            drawing_mode: options['drawing_mode'],
                            add_marker: options['add_marker']
                        });
                    self.$el.append(self.__box);
                    if (options['readonly'] == true){
                        $("#box").css('display','none');
                    }
                };
                self.$el.prepend(QWeb.render("CanvasTemplate"));
                url = self.get_url(options['background_image_field']);
                var is_drawing = false;
                var canvas;
                canvas = self.__canvas = new fabric.Canvas(self.$el.find('.painting_class > canvas')[0], {
                    isDrawingMode: false
                });
                self.sizing(canvas, url);
                if (self.mode == 'edit') {
                    self.paint_function(canvas);
                }
            }
            // *** create view
            else {
                self.$el.children().remove();
                self.__box = QWeb.render(
                    "DesignBox",
                    {
                        edit_background_image: options['edit_background_image'],
                        drawing_mode: options['drawing_mode'],
                        add_marker: options['add_marker']
                    });
                self.$el.append(self.__box);
                if (options['readonly'] == true){
                    $("#box").css('display','none');
                }
                self.$el.prepend(QWeb.render("CanvasTemplate"));
                var canvas = self.__canvas = new fabric.Canvas(self.$el.find('.painting_class > canvas')[0], {
                    isDrawingMode: is_drawing
                });
                url = self.get_url(options['background_image_field']);
                if (url.includes('&id=null') == true) {
                    url = options['background'] ||
                    self.attrs['background'] ||
                    self.placeholder;
                }
                self.sizing(canvas, url);
                self.paint_function(canvas);
                url = 'data:image/png;base64,' + self.get('value');
            }
        },
        // **********************************************************
        // * canvas dimension
        // **********************************************************
        sizing: function (canvas, url) {
            var self = this;
            var ctx = canvas.getContext();
            ctx.canvas.width = WIDTH;
            ctx.canvas.height = HEIGHT;
            canvas.setHeight(HEIGHT);
            canvas.setWidth(WIDTH);
            if (self.attrs['height']) {
                ctx.canvas.height = self.attrs['height'];
                canvas.setHeight(self.attrs['height']);
            }
            if (self.attrs['width']) {
                ctx.canvas.width = self.attrs['width'];
                canvas.setWidth(self.attrs['width']);
            }
            fabric.Image.fromURL(url, function(img) {
            if (img.width > img.height) {
                img.scaleToWidth(canvas.width);
                var ratio = img.width / canvas.width;
                img.top =  (canvas.height - (img.height / ratio )) / 2;
            }
            else {
                img.scaleToHeight(canvas.height);
                var ratio = img.height / canvas.height;
                img.left =  (canvas.width - (img.width / ratio )) / 2;
            }
               canvas.setBackgroundImage(img);
               canvas.renderAll();
//               canvas.add(img); //  moving background
            });
        },
        // **********************************************************
        // * drawing_mode_selection and construction of patterns
        // **********************************************************
        drawing_mode_selection: function (ev, args) {
            var canvas = this.__canvas;
            if (!canvas) {
                return
            }
            var brush = ev.target.value.toLowerCase();
            self = this;
            if (fabric.PatternBrush) {
                var vLinePatternBrush = new fabric.PatternBrush(canvas);
                vLinePatternBrush.getPatternSrc = function () {
                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = 10;
                    var ctx = patternCanvas.getContext('2d');
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.lineTo(10, 5);
                    ctx.closePath();
                    ctx.stroke();
                    return patternCanvas;
                };
                var hLinePatternBrush = new fabric.PatternBrush(canvas);
                hLinePatternBrush.getPatternSrc = function () {
                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = 10;
                    var ctx = patternCanvas.getContext('2d');
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(5, 0);
                    ctx.lineTo(5, 10);
                    ctx.closePath();
                    ctx.stroke();
                    return patternCanvas;
                };
                var squarePatternBrush = new fabric.PatternBrush(canvas);
                squarePatternBrush.getPatternSrc = function () {
                    var squareWidth = 10,
                        squareDistance = 2;
                    var patternCanvas = fabric.document.createElement('canvas');
                    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
                    var ctx = patternCanvas.getContext('2d');
                    ctx.fillStyle = this.color;
                    ctx.fillRect(0, 0, squareWidth, squareWidth);
                    return patternCanvas;
                };
                var diamondPatternBrush = new fabric.PatternBrush(canvas);
                diamondPatternBrush.getPatternSrc = function () {
                    var squareWidth = 10,
                        squareDistance = 5;
                    var patternCanvas = fabric.document.createElement('canvas');
                    var rect = new fabric.Rect({
                        width: squareWidth,
                        height: squareWidth,
                        angle: 45,
                        fill: this.color
                    });
                    var canvasWidth = rect.getBoundingRect().width;
                    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
                    rect.set({
                        left: canvasWidth / 2,
                        top: canvasWidth / 2
                    });
                    var ctx = patternCanvas.getContext('2d');
                    rect.render(ctx);
                    return patternCanvas;
                };
                var img = new Image();
                img.src = '../assets/honey_im_subtle.png';
                var texturePatternBrush = new fabric.PatternBrush(canvas);
                texturePatternBrush.source = img;
            }
            if (brush === _t('hline')) {
                // ../.. bug in comparaison ???
                canvas.freeDrawingBrush = vLinePatternBrush;
            } else if (brush === _t('vline')) {
                // ../.. bug in comparaison ???
                canvas.freeDrawingBrush = hLinePatternBrush;
            } else if (brush === _t('square')) {
                canvas.freeDrawingBrush = squarePatternBrush;
            } else if (brush === _t('diamond')) {
                canvas.freeDrawingBrush = diamondPatternBrush;
            } else if (brush === _t('texture')) {
                canvas.freeDrawingBrush = texturePatternBrush;
            } else if (brush === _t('circle')) {
                canvas.freeDrawingBrush = new fabric['CircleBrush'](canvas);
            } else if (brush === _t('pencil')) {
                canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
            } else if (brush === _t('spray')) {
                canvas.freeDrawingBrush = new fabric['SprayBrush'](canvas);
            } else if (brush === _t('motif')) {
                canvas.freeDrawingBrush = new fabric['PatternBrush'](canvas);
            } else {
                // ../..
            }
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = this.__drawingColorEl[0].value;
                canvas.freeDrawingBrush.width = parseInt(this.__drawingLineWidthEl[0].value, 10) || 1;
                canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: parseInt(this.__drawingShadowWidth[0].value, 10) || 0,
                    offsetX: 0,
                    offsetY: 0,
                    affectStroke: true,
                    color: this.__drawingShadowColorEl[0].value,
                });
            }
        },
        // **********************************************************
        // * drawingModeEl
        // **********************************************************
        drawing_mode: function () {
            var canvas = this.__canvas;
            var drawingModeEl = this.$el.find('#drawing-mode');
            var drawingOptionsEl = this.$el.find('#drawing-mode-options');
            canvas.isDrawingMode = !canvas.isDrawingMode;
            if (canvas.isDrawingMode) {
                drawingModeEl[0].innerHTML = _t('Return moving mode');
                drawingOptionsEl[0].style.display = '';
            } else {
                drawingModeEl[0].innerHTML = _t('Enter drawing mode');
                drawingOptionsEl[0].style.display = 'none';
            }
            return -1;
        },
        // **********************************************************
        // * drawingColorEl_onchange
        // **********************************************************
        drawingColorEl_onchange: function (ev) {
            var canvas = this.__canvas;
            var e = ev.target.value;
            canvas.freeDrawingBrush.color = e;
        },
        // **********************************************************
        // * drawingShadowColorEl_onchange
        // **********************************************************
        drawingShadowColorEl_onchange: function (ev) {
            var canvas = this.__canvas;
            var e = ev.target.value;
            canvas.freeDrawingBrush.shadow.color = e;
        },
        // **********************************************************
        // * drawingLineWidthEl_onchange
        // **********************************************************
        drawingLineWidthEl_onchange: function (ev) {
            var canvas = this.__canvas;
            var e = ev.target.value;
            canvas.freeDrawingBrush.width = parseInt(e, 10) || 1;
            var current = this.$el.find('#drawing-line-width');
            current[0].previousElementSibling.innerHTML = e;
        },
        // **********************************************************
        // * drawingShadowWidth_onchange
        // **********************************************************
        drawingShadowWidth_onchange: function (ev) {
            var canvas = this.__canvas;
            var e = ev.target.value;
            canvas.freeDrawingBrush.shadow.blur = parseInt(e, 10) || 1;
            var current = this.$el.find('#drawing-shadow-width');
            current[0].previousElementSibling.innerHTML = e;
        },
        // **********************************************************
        // * drawingShadowOffset_onchange
        // **********************************************************
        drawingShadowOffset_onchange: function (ev) {
            var canvas = this.__canvas;
            var e = ev.target.value;
            canvas.freeDrawingBrush.shadow.offsetX = parseInt(e, 10) || 1;
            var current = this.$el.find('#drawing-shadow-offset');
            current[0].previousElementSibling.innerHTML = e;
        },
        // **********************************************************
        // * paint_function
        // **********************************************************
        paint_function: function (canvas = null) {
            canvas = this.__canvas;// no good : canvas = this.$el.find('#c');
            var box = this.$el.find('#box');
            if (canvas == null) {
                return
            }
            if (box == null) {
                return
            }
            fabric.Object.prototype.hasControls = false;
            fabric.Object.prototype.hasBorders = false;
            var drawingModeEl = this.__drawingModeEl = box.find('#drawing-mode');
            var drawingOptionsEl = this.__drawingOptionsEl = box.find('#drawing-mode-options');
            var drawingColorEl = this.__drawingColorEl = box.find('#drawing-color');
            var drawingShadowColorEl = this.__drawingShadowColorEl = box.find('#drawing-shadow-color');
            var drawingLineWidthEl = this.__drawingLineWidthEl = box.find('#drawing-line-width');
            var drawingShadowWidth = this.__drawingShadowWidth = box.find('#drawing-shadow-width');
            var drawingShadowOffset = this.__drawingShadowOffset = box.find('#drawing-shadow-offset');
            var clearEl = this.__clearEl = box.find('#clear-canvas');
            if (drawingModeEl && drawingModeEl[0]) {
                drawingModeEl[0].innerHTML = _t('Enter drawing mode');
            }
            if (drawingOptionsEl && drawingOptionsEl[0]) {

                drawingOptionsEl[0].style.display = 'none';
            }
            canvas.isDrawingMode = false;
            //            clearEl.onclick = function() {
            //                canvas.clear();
            //            };
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = drawingColorEl[0].value;
                canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl[0].value, 10) || 1;
                canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: parseInt(drawingShadowWidth[0].value, 10) || 0,
                    offsetX: 0,
                    offsetY: 0,
                    affectStroke: true,
                    color: drawingShadowColorEl[0].value,
                });
            }
            return;
        },
        // **********************************************************
        // * add_marker
        // **********************************************************
        add_marker: function () {
            var options = this.get_options();
            var cs = this.$el.find("c");
            if (this.__canvas) {
                var canvas = this.__canvas;
                isDrawingMode: true;
            } else {
                var canvas = this.__canvas = new fabric.Canvas('c', {
                    isDrawingMode: false
                });
            }
            if (options['marker_shape'] == 'x-sign') {
                var a = new fabric.Rect({
                    top: 100,
                    left: 100,
                    width: 20,
                    height: 4,
                    fill: 'red',
                    angle: 90
                });
                var b = new fabric.Rect({
                    top: 108,
                    left: 87,
                    width: 20,
                    height: 4,
                    fill: 'red',
                    angle: 0
                });
                var dpl = 0;
                var g = new fabric.Group([a, b], {
                    left: 40 + dpl,
                    top: 40 + dpl,
                    angle: 45,
                    height: options['marker_size'],
                    fill: options['marker_color'],
                });
                canvas.add(g);
                dpl += 5;

            }
            if (options['marker_shape'] == 'circle') {
                var a = new fabric.Circle({
                    radius: options['marker_size'] / 2,
                    fill: red,
                    left: 100,
                    top: 100
                });
                var dpl = 0;
                var g = new fabric.Group([a], {
                    left: 40 + dpl,
                    top: 40 + dpl,
                    fill: options['marker_color'],
                });
                canvas.add(g);
                dpl += 5;
            }
            if (options['marker_shape'] == 'square') {
                var a = new fabric.Rect({
                    fill: 'red',
                    left: 100,
                    width: options['marker_size'],
                    height: options['marker_size'],
                    top: 100
                });
                var dpl = 0;
                var g = new fabric.Group([a], {
                    left: 40 + dpl,
                    top: 40 + dpl,
                    fill: options['marker_color'],
                });
                canvas.add(g);
                dpl += 5;

            }
            if (options['marker_shape'] == 'diamond') {
                var a = new fabric.Rect({
                    fill: 'red',
                    left: 100,
                    width: options['marker_size'],
                    height: options['marker_size'],
                    top: 100
                });
                var dpl = 0;
                var g = new fabric.Group([a], {
                    left: 40 + dpl,
                    top: 40 + dpl,
                    fill: options['marker_color'],
                    angle: 45,
                });
                canvas.add(g);
                dpl += 5;
            }
        },
    });

    // * assign the name of the widget
    Registry.add('image_paint', FieldPainting);

    FormController.include({
        saveRecord: function() {
            this.$('.save_paint').click();
            var res = this._super.apply(this, arguments);
            return res;
        }
    });

    return {
        FieldPainting: FieldPainting,
    };
});