odoo.define('web.draw', function (require) {
"use strict";
    var core = require('web.core');
    var form_common = require('web.form_common');
    
    //TODO: Move events to events property of widget - Dennis Sluijk
    //TODO: Split functions - Dennis Sluijk
    //TODO: Implement touch - Dennis Sluijk
    var FieldDraw = form_common.AbstractField.extend({
        template: 'FieldDraw',
        init: function() {
            this._super.apply(this, arguments);
            console.log('FieldDraw.init');
        },
        start: function() {
            var self = this;
            
            this._super.apply(this, arguments);
            
            var $canvas = this.$el.find('canvas');
            //Canvas
            $canvas.mousedown(function(event) {
                if(self.get("effective_readonly")) return;
                var ctx = self.get('ctx');
                ctx.beginPath();
                ctx.moveTo(event.offsetX, event.offsetY);
                self.set('mouse', true);
                console.log('FieldDraw.mousedown');
            });
            $canvas.mouseup(function() { 
                self.set('mouse', false);
                var ctx = self.get('ctx');
                ctx.stroke();
                self.internal_set_value($canvas[0].toDataURL("image/png").split(',')[1]);
                console.log('FieldDraw.mouseup');
            });
            $canvas.mousemove(function(event) { 
                if(self.get('mouse')) {
                    var ctx = self.get('ctx');
                    ctx.lineTo(event.offsetX, event.offsetY);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(event.offsetX, event.offsetY);
                }
            });
            
            this.on("change:effective_readonly", this, function() {
                self.render_effective_readonly();
                self.render_value();
            });
            
            //Clear button
            var $clear_btn = this.$el.find('button');
            $clear_btn.click(function() { 
                self.clear();
            });
            
            self.render_effective_readonly();
        },
        clear: function() {
            var $canvas = this.$el.find('canvas');
            var ctx = this.get('ctx');
            ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
            console.log('FieldDraw.clear');
        },
        render_value: function() {
            //Init canvas
            var $canvas = this.$el.find('canvas');
            $canvas[0].height = 90;
            $canvas[0].width = 410;
            
            //Init 2d context
            var ctx = $canvas[0].getContext('2d');
            ctx.lineWidth = 4;
            this.set('ctx', ctx);
            
            //Clean
            this.clear();
            
            //Render current value
            var val = this.get("value");
            if (val) {
                this.draw_current_drawing(val);
            }
        },
        render_effective_readonly: function() {
            //Clear button
            if(this.get('effective_readonly')) {
                this.$el.find('button').hide();
            } else {
                this.$el.find('button').show();
            }
        },
        draw_current_drawing: function(val) {
            var self = this;
            var id = JSON.stringify(this.view.datarecord.id || null);
            var field = this.name;          
            var url = this.session.url('/web/image', {
                                        model: this.view.dataset.model,
                                        id: id,
                                        field: field,
                                        unique: (this.view.datarecord.__last_update || '').replace(/[^0-9]/g, '')});
                                        
            var current_drawing = new Image(410, 90);
            current_drawing.src = url;
            current_drawing.onload = function() {
                var ctx = self.get('ctx');
                ctx.drawImage(current_drawing, 0, 0);
            }
        },
    });
    
    core.form_widget_registry.add('draw', FieldDraw);
});