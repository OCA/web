/* © 2016-TODAY LasLabs Inc.
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
 */

odoo.define('web_widget_slick.slick_widget', function(require){
  "use strict";
  
  var core = require('web.core');
  var AbstractManyField = require('web.form_relational').AbstractManyField;
  
  var QWeb = core.qweb;
  var _t = core._t;
  
  var FieldSlickImages = AbstractManyField.extend({
    
    className: 'o_slick',
    template: 'FieldSlickImages',
    $slick: null,
    no_rerender: true,
    loading: [],
    loaded: 0,
    
    defaults: {
      lazyLoad: 'ondemand',
      fieldName: 'datas',
      modelName: 'ir.attachment',
      slidesToShow: 3,
      slidesToScroll: 1,
      dots: true,
      infinite: true,
      speed: 500,
      arrows: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        },
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ],
    },
    
    init: function(field_manager, node) {
      this._super(field_manager, node);
      this.options = _.defaults(this.options, this.defaults);
    },
    
    destroy_content: function() {
      var self = this;
      if (this.$slick) {
        console.log('Destroying SlickJS');
        var $imgs = this.$el.find('img');
        $imgs.each(function(idx, val){
          console.log('Removing ' + $imgs[idx]);
          self.$slick.slick('slickRemove', $imgs[idx]);
        });
      }
    },
    
    render_value: function() {
      var self = this;
      this._super();
      console.log('Rerendering SlickJS');
      this.destroy_content();
      
      var baseUrl = '/web/image/' + this.options.modelName;

      this.$slick = $('<div class="slick-container"></div>');
      this.$el.append(this.$slick);
      this.$slick.slick(this.options);
      
      self.loading.push.apply(self.get('value'));
      
      _.each(self.get('value'), function(id){
        var $img = $('<img></img>');
        var $div = $('<div></div>');
        $div.append($img);
        $img.attr('data-lazy', baseUrl + '/' + id + '/' + self.options.fieldName);
        self.$el.append($div);
        self.$slick.slick('slickAdd', $div);
        self.$slick.slick('slickGoTo', 0);
      });
      
    },
    
  });
  
  core.form_widget_registry.add("one2many_slick_images", FieldSlickImages);
  
  return {
    FieldSlickImages: FieldSlickImages,
  }
  
});
