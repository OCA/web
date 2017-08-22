/* Copyright 2016-2017 LasLabs Inc.
 * License LGPL-3.0 or later (http://www.gnu.org/licenses/lgpl.html). */

odoo.define('web_widget_slick', function(require) {
  "use strict";

  var core = require('web.core');
  var AbstractManyField = require('web.form_relational').AbstractManyField;

  var FieldSlickImages = AbstractManyField.extend({

    widget_class: 'o_slick',
    template: 'FieldSlickImages',
    $slick: null,
    no_rerender: true,
    loading: [],
    loaded: 0,

    events: {
        'mousedown img': function(ev) {
          ev.preventDefault();
        },
        'touchstart img': function(ev) {
          ev.preventDefault();
        },
        // Triggering a resize on the lazyLoaded event prevents the carousel
        // from appearing empty when page loads
        'lazyLoaded': function(ev) {
          $(ev.target).trigger('resize');
        }
    },

    defaults: {
      lazyLoad: 'ondemand',
      fieldName: 'datas',
      modelName: 'ir.attachment',
      slidesToShow: 3,
      slidesToScroll: 1,
      swipeToSlide: true,
      dots: true,
      infinite: true,
      speed: 500,
      arrows: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ]
    },

    init: function(field_manager, node) {
      this._super(field_manager, node);
      this.options = _.defaults(this.options, this.defaults);
    },

    destroy_content: function() {
      if (this.$slick) {
        var $imgs = this.$el.find('img');
        // Unslicking removes the carousel but re-appends any images,
        // so removal of images is also required
        $imgs.each($.proxy(this._slickRemove, this));
        this.$slick.slick('unslick');
      }
    },

    render_value: function() {
      this._super();
      this.destroy_content();

      this.$el.parent('td').addClass('o_slick_cell');
      this.$slick = $('<div class="slick-container"></div>');
      if (this.options.arrows) {
        this.$slick.addClass('slick-arrowed');
      }
      this.$el.append(this.$slick);

      var baseUrl = '/web/image/' + this.options.modelName + '/';
      var value = this.get('value');
      this.loading.push.apply(value);
      _.each(value, $.proxy(this._slickRender, this, [baseUrl]));

      this.$slick.slick(this.options);
      core.bus.on('resize', this, this._resizeCarousel);
    },

    _resizeCarousel: function () {
      var maxWidth = this._resizeMaxWidth();
      var containerWidth = maxWidth;

      var $parentCell = this.$el.parent('td');
      if ($parentCell.length) {
        var scaledWidth = this._resizeScaledWidth($parentCell, maxWidth);
        var labelWidth = this._resizeLabelWidth($parentCell);
        containerWidth = scaledWidth - labelWidth;
      }

      var marginWidth = this._resizeMarginWidth(this.$slick);
      var carouselWidth = containerWidth - marginWidth;

      // Set outerWidth of carousel, with minimum size. Minimum size can cause
      // overflow in some cases but prevents displaying with zero width
      this.$slick.outerWidth(Math.max(carouselWidth, 150));
    },

    _resizeLabelWidth: function ($parentCell) {
      // If the widget has a label, subtract label cell's width, plus the extra
      // padding applied to the parent cell, from container width
      var $labelCell = $parentCell.prev('.o_td_label');
      if ($labelCell.length) {
        var parentPadding = $parentCell.outerWidth() - $parentCell.width();
        return $labelCell.outerWidth() + parentPadding;
      }

      return 0;
    },

    _resizeMarginWidth: function ($element) {
      // Subtract container's margins so outerWidth can be set properly
      return $element.outerWidth(true) - $element.outerWidth();
    },

    _resizeMaxWidth: function () {
      // Determine the maximum possible width the widget container can occupy
      var parentSelectors = ['.o_form_sheet', '.o_form_nosheet'];
      var containerWidth = parentSelectors.map(function (selector) {
        return this.$el.closest(selector).width();
      }, this).filter(function (width) {
        return width !== null;
      })[0];

      return containerWidth;
    },

    _resizeScaledWidth: function ($parentCell, maxWidth) {
      // If the widget is inside a group tag, scale carousel size based on
      // intended % width of parent cell
      return maxWidth * parseInt($parentCell[0].style.width, 10) / 100;
    },

    _slickRemove: function (idx, val) {
      this.$slick.slick('slickRemove', idx);
    },

    _slickRender: function (baseUrl, id) {
      var $img = $('<img class="img img-responsive"></img>');
      var $div = $('<div></div>');
      $img.attr('data-lazy', baseUrl + id + '/' + this.options.fieldName);
      $div.append($img);
      this.$slick.append($div);
    }

  });

  core.form_widget_registry.add("one2many_slick_images", FieldSlickImages);

  return {FieldSlickImages: FieldSlickImages};

});
