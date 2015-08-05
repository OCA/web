openerp.web.ListView.include({
  /**
   * Override all list view to add sticky header behavior
   **/
  init: function(parent, dataset, view_id, options) {
    var self = this;
    self._super(parent, dataset, view_id, options);
    this.scroll_start = false;

  },

  do_show: function(){
    /**
     * Move search div to a sticky location.
     * Add scroll event listener and remove leftover headers
     **/
    var self = this;
    self._super();
    if (self instanceof openerp.web.form.One2ManyListView){
      return;
    };
    $('.oe_view_manager_body').off('scroll.sticky_header');
    self.delete_sticky_headers();
    var event_set = false;
    // we avoid to have the listener attach many time on scroll bar
    if ($._data($('.oe_view_manager_body')[0], 'events')){
      even_set = $._data($('.oe_view_manager_body')[0], 'events').scroll.some(function(element, index, array) {
        return element.namespace == 'sticky_header';
      });
    };
    if (! event_set){
      $('.oe_view_manager_body').first().on('scroll.sticky_header', self.do_sticky_headers);
    };
    var search_div = $('.oe_searchview_drawer_container').first()
    search_div.detach();
    $('.oe_view_manager_header').first().after(search_div);
    var sticky_top_anchor = $(document.createElement('div'));
    sticky_top_anchor.addClass('oe_list_sticky_top_anchor');
    search_div.after(sticky_top_anchor);
    sticky_top_anchor.height(self.get_original_headers().height() + 20);
    this.scroll_start = false;
  },

  do_hide: function(){

    /**
     * Move search div to a sticky location.
     * Add scroll event listener and remove leftover headers
     **/
    var self = this;
    self._super();
    if (self instanceof openerp.web.form.One2ManyListView){
      return;
    };
    self.delete_sticky_headers();
    $('.oe_view_manager_body').off('scroll.sticky_header');
  },

  delete_sticky_headers: function(){
    /**
     * Delete the sticky header created by `do_sticky_header`
     **/
    if ($('.oe_list_sticky_top_anchor').length > 0){
      $('.oe_list_sticky_top_anchor').empty();
    };

    // $('.oe_list_content').find('thead').css('visibility', 'visible');
    this.scroll_start = false;
  },

  get_original_headers: function(){
    /**
     * Get original table header element of list view
     **/
    return original_headers = $(
        $('.oe_list_content').children()[0]
        );
  },

  do_search: function(domain, context, group_by) {
    var self=this, _super = self._super, args=arguments;
    var ready = self.editor.is_editing()
      ? self.cancel_edition(true)
      : $.when();

    return ready.then(function () {
      return _super.apply(self, args);
      this.scroll_start = false;
    });
  },
  do_sticky_headers: function(){
    /**
     * Copy actual header without event listener
     * and set a suitable position in layout
     **/
    var self = this;
    if ($('.oe_view_manager_body').scrollTop() === 0){
      self.delete_sticky_headers();
      return;
    };
    if (this.scroll_start == true) {
      return;
    };
    var sticky_headers_containers = $(document.createElement('div'));
    var sticky_headers = $(document.createElement('table'));
    sticky_headers_containers.addClass('oe_list_content_containers_custom');
    sticky_headers_containers.append(sticky_headers);
    sticky_headers.width($('.oe_list_content').width());
    var original_headers = self.get_original_headers();
    var headers_copy = original_headers.clone();
    jQuery.map(headers_copy.find('div'), function(el, i){
      $(el).removeAttr('width');
      $(el).removeAttr('height');
      $(el).removeClass();
      $(el).width($(original_headers.find('div')[i]).width());
      $(el).height($(original_headers.find('div')[i]).height());

    });
    jQuery.map(headers_copy.find('th'), function(el, i){
      $(el).removeAttr('width');
      $(el).removeAttr('height');
      $(el).removeAttr('data-id');
      $(el).removeClass();
      $(el).width($(original_headers.find('th')[i]).width());
      $(el).height($(original_headers.find('th')[i]).height());
    });
    sticky_headers.append(headers_copy);
    sticky_headers.addClass('oe_list_content_custom');

    $('.oe_list_sticky_top_anchor').prepend(sticky_headers_containers);
    // $('.oe_list_content').find('thead').css('visibility', 'hidden');

    this.scroll_start = true;
  },
});
openerp.web.ViewManager.include({
  /**
   * Hack to prevent error that appear on addons list
   * due to custom override that calls switch_mode mutliple times
   * */
  switch_mode: function (view_type, no_store, options) {
    var res =  this._super(view_type, no_store, options);
    if (view_type != 'list') {
      $('.oe_view_manager_body').off('scroll.sticky_header');
      $('.oe_list_sticky_top_anchor').remove();
      $('.oe_searchview_drawer_container').slice(1).remove();
    };
    return res;
  },
});
