/* Copyright 2016 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html).
 */

odoo.define('web_widget_darkroom.darkroom_zoom', function(require){

  'use strict';

  var DarkroomPluginZoom = function(){
  
    Darkroom.plugins['zoom'] = Darkroom.Plugin.extend({
      
      inZoom: false,
      zoomLevel: 0,
      zoomFactor: .1,
      
      initialize: function() {
        var self = this;
        var buttonGroup = this.darkroom.toolbar.createButtonGroup();
        
        this.zoomButton = buttonGroup.createButton({
          image: 'fa fa-search',
        })
        this.zoomInButton = buttonGroup.createButton({
          image: 'fa fa-plus',
        })
        this.zoomOutButton = buttonGroup.createButton({
          image: 'fa fa-minus',
        })
        this.okButton = buttonGroup.createButton({
          image: 'fa fa-check',
          type: 'success',
          hide: true,
          editOnly: true,
        });
        this.cancelButton = buttonGroup.createButton({
          image: 'fa fa-times',
          type: 'danger',
          hide: true
        });
        
        // Buttons click
        this.zoomButton.addEventListener('click', this.toggleZoom.bind(this));
        this.zoomInButton.addEventListener('click', this.zoomIn.bind(this));
        this.zoomOutButton.addEventListener('click', this.zoomOut.bind(this));
        //this.okButton.addEventListener('click', this.saveZoom.bind(this));
        this.cancelButton.addEventListener('click', this.releaseFocus.bind(this));
    
        // Canvas events
        this.darkroom.canvas.on('mouse:down', this.onMouseDown.bind(this));
        this.darkroom.canvas.on('mouse:move', this.onMouseMove.bind(this));
        this.darkroom.canvas.on('mouse:up', this.onMouseUp.bind(this));
        //this.darkroom.canvas.on('object:moving', this.onObjectMoving.bind(this));
        //this.darkroom.canvas.on('object:scaling', this.onObjectScaling.bind(this));
        $(this.darkroom.canvas.wrapperEl).on('mousewheel', function(event){
          self.onMouseWheel(event);
        });
    
        //fabric.util.addListener(fabric.document, 'keydown', this.onKeyDown.bind(this));
        //fabric.util.addListener(fabric.document, 'keyup', this.onKeyUp.bind(this));
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
      
      toggleElements: function(activate) {
        if (activate === 'undefined') {
            activate = !this.hasFocus();
        }
        this.zoomButton.active(!activate);
        this.inZoom = activate;
        this.zoomInButton.hide(!activate);
        this.zoomOutButton.hide(!activate);
        this.okButton.hide(!activate);
        this.cancelButton.hide(!activate);
        this.darkroom.canvas.default_cursor = activate ? "move" : "default";
      },
      
      // Return fabric.Point object for center of canvas
      getCenterPoint: function() {
        var center = this.darkroom.canvas.getCenter();
        return new fabric.Point(center.left, center.top);
      },
      
      // Set internal zoom
      setZoomLevel: function(factor, point) {
        var zoomLevel = this.zoomLevel + factor;
        if (zoomLevel < 0) zoomLevel = 0;
        if (zoomLevel == this.zoomLevel) return false;
        console.log('Setting zoom factor');
        console.log(zoomLevel);
        console.log(point);
        if (point) {
          var canvas = this.darkroom.canvas;
          canvas.zoomToPoint(point, zoomLevel + 1); // Add one for zero index
          this.zoomLevel = zoomLevel;
        }
        return true;
      },
      
      getObjectBounds: function() {
        var canvas = this.darkroom.canvas;
        var objects = canvas.getObjects();
        var top = 0, bottom = 0, left = 0, right = 0;
        for (var idx in objects) {
          var obj = objects[idx];
          var objRight = obj.left + obj.getWidth();
          var objBottom = obj.top + obj.getHeight();
          if (obj.left < left) left = obj.left;
          if (objRight > right) right = objRight;
          if (obj.top < top) top = obj.top;
          if (objBottom > bottom) bottom = objBottom;
        }
        return {
          top: top,
          bottom: bottom,
          left: left,
          right: right,
          height: (bottom - top),
          width: (right - left),
        }
      },
      
      zoomIn: function() {
        return this.setZoomLevel(this.zoomFactor, this.getCenterPoint());
      },
      
      zoomOut: function() {
        return this.setZoomLevel(-this.zoomFactor, this.getCenterPoint());
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
      
      onMouseDown: function(event) {
        if (this.hasFocus()) {
            this.panning = true;
        }
      },
      
      onMouseUp: function(event) {
        this.panning = false;
      },
      
      onMouseMove: function(event) {
		if (this.panning && event && event.e) {
          var delta = new fabric.Point(event.e.movementX,
                                       event.e.movementY);
          var canvas = this.darkroom.canvas;
          var objBounds = this.getObjectBounds();
          var newPoint = new fabric.Point(
            -delta.x - canvas.viewportTransform[4],
            -delta.y - canvas.viewportTransform[5]
          )
          if (newPoint.x < objBounds.left || newPoint.x > objBounds.right) {
            return;
          }
          if (newPoint.y < objBounds.top || newPoint.y > objBounds.bottom) {
            return;
          }
          canvas.absolutePan(newPoint);
          //canvas.setCoords();
        }
      },
      
    });
    
  }
  
  return {DarkroomPluginZoom: DarkroomPluginZoom};

});
