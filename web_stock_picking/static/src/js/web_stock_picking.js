/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl). */

// Most of this code is bad and I feel bad. Rewrite once I know it will work

odoo.define('web_stock.picking', function(require) {
    'use strict';

    var Widget = require('web.Widget');
    var snippet_animation = require('web_editor.snippets.animation');
    var ParentedMixin = require('web.mixins').ParentedMixin;
    var BarcodeHandlerMixin = require('barcodes.BarcodeHandlerMixin');
    var BarcodeParser = require('barcodes.BarcodeParser');
    var Model = require('web.DataModel');
    var $ = require('$');
    var _ = require('_');
    
    var core = require('web.core');
    
    /* It should provide a more basic version of website_form js
     * This allows for removal of website dependencies
     **/
    var formMixin = {
        handleSubmit: function(event) {
            var self = this;
            event.preventDefault();
            var $target = $(event.target);
            var data = $target.serializeArray();
            return $.ajax({
                method: $target.attr('method') || 'GET',
                url: $target.attr('action'),
                data: data,
                dataType: 'json',
            }).done(function(data) {
                if(data.errors.length || data.error_fields.length) {
                    // @TODO: Handle error fields
                    var $errorDivs = $('');
                    _.each(data.errors, function(error) {
                        $errorDivs.append('<div class="alert">' + error + '</div>');
                    });
                    self.$target.find('.js_picking_form_result').html($errorDivs);
                } else {
                    var redirectUri = self.$target.data('success-page');
                    if (redirectUri) {
                        window.location.href = redirectUri;
                    } else {
                        window.location.reload();
                    }
                }
            });
        }
    };
    
    /* It should provide click events for common additional action buttons
     * in modals
     **/
    var buttonAdditionalMixer = {
        events: {
            'click .js_picking_btn_additional': function(event) {
                $('.js_picking_additional_action').val(event.target.name || '');
                $('#pickingModal').modal('hide');
                $('.js_picking_validate').trigger('click');
            }
        }
    };
    
    var ModalBackorder = Widget.extend(buttonAdditionalMixer, {
        template: 'web_stock_picking.picking_validate_backorder',
    });
    
    var ModalImmediate = Widget.extend(buttonAdditionalMixer, {
        template: 'web_stock_picking.picking_immediate_transfer',
    });
    
    var ModalOverpick = Widget.extend(buttonAdditionalMixer, {
        template: 'web_stock_picking.picking_overpick',
    });
    
    /* It provides Stock Picking details form and event handlers
     **/
    snippet_animation.registry.js_picking_form = snippet_animation.Class.extend(formMixin, {
        
        selector: '.js_picking_form',
        
        start: function() {
            var self = this;
            var $validateBtn = $(self.$target.find('.js_picking_validate'));
            var $modal = $('#pickingModal');
            $modal.on('show.bs.modal', function(event) {
                var $modalDoc = $modal.find('.modal-dialog');
                var complete = true;
                var overpick = false;
                var totalVal = 0.0;
                $modalDoc.html("");
                _.each(self.$target.find('.js_picking_picked_qty'), function(val) {
                    var $val = $(val);
                    if ($val.val()) {
                        var floatVal = parseFloat($val.val());
                        var productQty = parseFloat($val.data('product-qty'));
                        totalVal += floatVal;
                        if (productQty != floatVal) {
                            complete = false;
                            if (productQty < floatVal) {
                                overpick = true;
                            }
                        }
                    }
                });
                if (overpick) {
                    return new ModalOverpick(self).appendTo($modalDoc);
                }
                if (totalVal === 0) {
                    if (self.$target.find('.js_picking_pack_op_done').length === 0) {
                        return new ModalImmediate(self).appendTo($modalDoc);
                    }
                } else if (complete) {
                    event.preventDefault();
                    $validateBtn.trigger('click');
                    return;
                }
                return new ModalBackorder(self).appendTo($modalDoc);
            });
            this.$target.find('.js_picking_form_send').click(function(event) {
                self.$target.find('.js_picking_submit_action').val(event.target.value);
            });
            this.$target.submit(function(event) {
                self.handleSubmit(event);
            });
        },
        
    });
    
    /* It provides Stock Picking search form and event handlers
     **/
    snippet_animation.registry.js_picking_search = snippet_animation.Class.extend({
        
        selector: '.js_picking_search',
        
        start: function() {
            var self = this;
            this.$target.find('.js_picking_submit_immediate').change(function() {
                self.$target.submit();
            });
        },
        
    });

    snippet_animation.registry.js_picking_form_barcode = snippet_animation.Class.extend(ParentedMixin, BarcodeHandlerMixin, {
        
        selector: '.js_picking_form_barcode',
        loaded: false,
        barcodeParser: false,
        barcodeHistory: [],  // Most recent first
        
        // Let subclasses add custom behavior before onchange. Must return a deferred.
        // Resolve the deferred with true proceed with the onchange, false to prevent it.
        preOnchangeHook: function() {
            return $.Deferred().resolve(true);
        },
    
        start: function() {
            var self = this;
            // Compat w/ multi-barcodes update
            this.el = this.$target[0];
            this.actionMap = {
                'product': this.handleProductScan,
                'error': this.throwError,
                'lot': this.handleLotScan,
            };
            if(!this.barcodeParser) {
                this.barcodeParser = new BarcodeParser({
                    'nomenclature_id': [$('#barcodeNomenclatureId').val()],
                });
                this.barcodeParser.load().then(function(){
                    self.loaded = true;
                    console.log('Barcode parser initialized');
                });
            }
            this.$target.on('barcode_scanned', this.on_barcode_scanned);
        },
        
        on_barcode_scanned: function(barcode) {
            var self = this;
            // Call hook method possibly implemented by subclass
            this.preOnchangeHook(barcode).then(function(proceed) {
                if (proceed === true) {
                    var parsedBarcode = self.barcodeParser.parse_barcode(barcode);
                    self.barcodeHistory.unshift(parsedBarcode);
                    try{
                        self.actionMap[parsedBarcode.type].call(self, parsedBarcode);
                    } catch (err) {
                        self.actionMap.error.call(self, parsedBarcode, err);
                    }
                }
            });
        },
        
        throwError: function(parsedBarcode, exception) {
            console.log('throwError called with');
            console.log(parsedBarcode);
            console.log(exception);
            // @TODO: create throwError method
        },
        
        handleProductScan: function(parsedBarcode) {
            var barcodeQty = parseFloat(parsedBarcode.value);
            if (barcodeQty === 0.0) {
                barcodeQty = 1.0;
            }
            var productCode = this._stripBarcodePrefix(parsedBarcode);
            var $productEls = $('.js_picking_picked_qty[data-barcode="' + productCode.code + '"]');
            if ($productEls.length === 0) {
                alert('No product on page matching barcode "' + parsedBarcode.code + '"');
                return;
            }
            this._handleBarcodeQty(barcodeQty, $productEls);
        },
        
        handleLotScan: function(parsedBarcode) {
            var self = this;
            var lotObj = new Model('stock.production.lot');
            var barcodeQty = parseFloat(parsedBarcode.value);
            if (barcodeQty === 0.0) {
                barcodeQty = 1.0;
            }
            var lotCode = this._stripBarcodePrefix(parsedBarcode);
            lotObj.query(['name', 'product_id'])
                .filter(['|',
                         ['name', '=', lotCode.code],
                         ['ref', '=', lotCode.code],
                        ])
                .limit(1)
                .first()
                .then(function(lot){
                    var $productEls = $('.js_picking_picked_qty[data-product-id="' + lot.product_id[0] + '"]');
                    if ($productEls.length === 0) {
                        alert('No product on page matching barcode "' + lotCode.code + '"');
                        return;
                    }
                    self._handleBarcodeQty(barcodeQty, $productEls);
                });
        },
        
        _handleBarcodeQty: function(barcodeQty, $productEls) {
            _.each($productEls, function(el){
                var $el = $(el);
                // @TODO: Add better logic here
                var maxVal = parseFloat($el.data('product-qty'));
                var existingVal = parseFloat($el.val());
                if (isNaN(existingVal)) {
                    existingVal = 0.0;
                }
                if (barcodeQty !== 0.0) {
                    var newVal = barcodeQty + existingVal;
                    if (newVal > maxVal) {
                        newVal = maxVal;
                        barcodeQty -= maxVal - existingVal;
                    } else if (newVal < 0) {
                        barcodeQty = newVal;
                        newVal = 0;
                    } else {
                        barcodeQty -= newVal - existingVal;
                    }
                    $el.val(newVal);
                }
            });
        },
        
        /* It identifies difference of code + base_code, and provides
         * the prefix + a version of the code with the prefix and
         * zeroes that were appended by parser removed
         *
         *  Given:
         *      {encoding: "any", type: "product", code: "11023454545656767", base_code: "11000004545656767", value: 23.45}
         *  For Nomenclature:
         *      Product: 11{NNNDD}
         *  Get:
         *      {prefix: "110", code: "4545656767"}
         *      
         **/
        _stripBarcodePrefix: function(parsedBarcode) {
            var baseCode = parsedBarcode.base_code.split(""),
                unmatched = 0,
                leftCode = [],
                rightCode = [];
            _.each(parsedBarcode.code.split(""), function(chr, idx) {
                if (chr != baseCode[idx]) {
                    unmatched += 1;
                }
                if (!unmatched) {
                    leftCode.push(baseCode[idx]);
                } else {
                    rightCode.push(baseCode[idx]);
                }
            });
            leftCode = leftCode.join("");
            rightCode = rightCode.join("").substring(unmatched);
            var prefix, code;
            if (rightCode.length === 0) {
                prefix = '';
                code = leftCode;
            } else {
                prefix = leftCode;
                code = rightCode;
            }
            return {prefix: prefix, code: code};
        },
        
    });
    
    return {
        buttonAdditionalMixer: buttonAdditionalMixer,
        formMixin: formMixin,
        pickingForm: snippet_animation.registry.js_picking_form,
        pickingSearch: snippet_animation.registry.js_picking_search,
        pickingFormBarcode: snippet_animation.registry.js_picking_form_barcode,
        ModalBackorder: ModalBackorder,
        ModalImmediate: ModalImmediate,
        ModalOverpick: ModalOverpick,
    };
    
});
