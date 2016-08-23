/* Adapted from https://github.com/MattKetmo/darkroomjs/tree/master/lib/js/plugins
 * License https://github.com/MattKetmo/darkroomjs/blob/master/LICENSE
 */

odoo.define('web_widget_darkroom.darkroom_history', function(require){
  
  'use strict';

  var DarkroomPluginHistory = function() {
  
    Darkroom.plugins['history'] = Darkroom.Plugin.extend({
      undoTransformations: [],
  
      initialize: function InitDarkroomHistoryPlugin() {
        this._initButtons();
  
        this.darkroom.addEventListener('core:transformation', this._onTranformationApplied.bind(this));
      },
  
      undo: function() {
        if (this.darkroom.transformations.length === 0) {
          return;
        }
  
        var lastTransformation = this.darkroom.transformations.pop();
        this.undoTransformations.unshift(lastTransformation);
  
        this.darkroom.reinitializeImage();
        this._updateButtons();
      },
  
      redo: function() {
        if (this.undoTransformations.length === 0) {
          return;
        }
  
        var cancelTransformation = this.undoTransformations.shift();
        this.darkroom.transformations.push(cancelTransformation);
  
        this.darkroom.reinitializeImage();
        this._updateButtons();
      },
  
      _initButtons: function() {
        var buttonGroup = this.darkroom.toolbar.createButtonGroup();
  
        this.backButton = buttonGroup.createButton({
          image: 'fa fa-step-backward',
          disabled: true,
          editOnly: true,
        });
  
        this.forwardButton = buttonGroup.createButton({
          image: 'fa fa-step-forward',
          disabled: true,
          editOnly: true,
        });
  
        this.backButton.addEventListener('click', this.undo.bind(this));
        this.forwardButton.addEventListener('click', this.redo.bind(this));
  
        return this;
      },
  
      _updateButtons: function() {
        this.backButton.disable((this.darkroom.transformations.length === 0))
        this.forwardButton.disable((this.undoTransformations.length === 0))
      },
  
      _onTranformationApplied: function() {
        this.undoTransformations = [];
        this._updateButtons();
      }
    });
    
  };
    
  return {DarkroomPluginHistory: DarkroomPluginHistory};
  
});
