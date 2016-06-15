openerp.web_flexnav = function (instance) {

    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery'], factory);
        } else {
            // Browser globals
            factory(jQuery);
        }
    }

        (function ($) {
            var flexObjects = [], // Array of all flexMenu objects
                resizeTimeout;

            function collapseAllExcept($menuToAvoid) {
                var $activeMenus,
                    $menusToCollapse;
                $activeMenus = $('button.flexMenu-viewMore.active');
                $menusToCollapse = $activeMenus.not($menuToAvoid);
                $menusToCollapse.removeClass('active').find('> div').hide();
            }

            $(window).resize(function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function () {
                    $('div.menu.flex').flexMenu({'undo': true});
                    $('div.menu.flex').flexMenu();
                }, 200);
            });

            $.fn.flexMenu = function (options) {
                var checkFlexObject,
                    s = $.extend({
                        'threshold' : 2, // [integer] If there are this many items or fewer in the list, we will not display a "View More" link and will instead let the list break to the next line. This is useful in cases where adding a "view more" link would actually cause more things to break  to the next line.
                        'linkText' : 'More', // [string] What text should we display on the "view more" link?
                        'linkTitle' : 'View More', // [string] What should the title of the "view more" button be?
                        'popupAbsolute' : true, // [boolean] Should we absolutely position the popup? Usually this is a good idea. That way, the popup can appear over other content and spill outside a parent that has overflow: hidden set. If you want to do something different from this in CSS, just set this option to false.
                        'popupClass' : '', // [string] If this is set, this class will be added to the popup
                        'undo' : false // [boolean] Move the list items back to where they were before, and remove the "View More" link.
                    }, options);
                this.options = s; // Set options on object

                return this.each(function () {
                    var $this = $(this),
                        $items = $this.find('> button').not('.oe_form_invisible'),
                        $self = $this,
                        $firstItem = $items.first(),
                        $lastItem = $items.last(),
                        numItems = $this.find('button').length,
                        firstItemTop = Math.floor($firstItem.offset().top),
                        firstItemHeight = Math.floor($firstItem.outerHeight(true)),
                        $lastChild,
                        keepLooking,
                        $moreItem,
                        $moreLink,
                        numToRemove,
                        allInPopup = false,
                        $menu,
                        i;

                    function needsMenu($itemOfInterest) {
                        return (Math.ceil($itemOfInterest.offset().top) >= (firstItemTop + firstItemHeight)) ? true : false;
                    }

                    if (needsMenu($lastItem) && numItems > s.threshold && !s.undo && $this.is(':visible')) {

                        var $popup = $('<div class="flexMenu-popup" style="display:none;' + ((s.popupAbsolute) ? ' position: absolute;' : '') + '"></div>'),
                            firstItemOffset = $firstItem.offset().top;
                        $popup.width($('.openerp .oe_button_nav .oe_stat_button').outerWidth());
                        $popup.addClass(s.popupClass);

                        // Move all list items after the first to this new popup ul
                        for (i = numItems; i > 1; i--) {
                            $lastChild = $($this.find('> button')[$this.find('> button').length - 1]);
                            keepLooking = (needsMenu($lastChild));
                            $lastChild.removeClass('oe_inline');
                            $lastChild.appendTo($popup);
                            if (!keepLooking) {
                                break;
                            }
                        }
                        $this.append('<button class="oe_stat_button btn btn-default oe_more_button flexMenu-viewMore"><a href="#" title="' + s.linkTitle + '">' + s.linkText + '</a></button>');
                        $moreItem = $this.find('> button.flexMenu-viewMore');

                        // Check to see whether the more link has been pushed down. This might happen if the link immediately before it is especially wide.
                        for (var n = 0; n < numItems; n++) {
                            if (needsMenu($moreItem)) {
                                $($this.find('> button')[$this.find('> button').length - 2]).removeClass('oe_inline').appendTo($popup);
                            }
                            else {
                                break;
                            }
                        }

                        // The popup menu is currently in reverse order. Let's fix that.
                        $popup.children().each(function (i, btn) {
                            $popup.prepend(btn);
                        });

                        // Add event click to More button
                        $moreItem.append($popup);
                        $moreItem.click(function (e) {
                            e.preventDefault();
                            collapseAllExcept($(this));
                            $popup.toggle();
                            $(this).toggleClass('active');

                        });

                        // Add event to hide menu below More button
                        var handler = function(event) {
                            // if the target is a descendant of menu do nothing
                            var target = $(event.target);
                            if (target.parents('div.menu.flex').length) {
                                return;
                            }
                            // hide popup
                            $popup.hide();
                            $moreItem.removeClass('active');
                        }
                        $(document).on("click", handler);

                    } else if (s.undo && $this.find('div.flexMenu-popup')) {
                        $menu = $this.find('div.flexMenu-popup');
                        numToRemove = $menu.find('button').length;
                        for (i = 1; i <= numToRemove; i++) {
                            $menu.find('> button:first-child').addClass('oe_inline').appendTo($this);
                        }
                        $menu.remove();
                        $this.find('> button.flexMenu-viewMore').remove();
                    }
                });
            };
        })


    );
    
    instance.web.FormView.include({
        load_record: function(record) {
            var _super = this._super(record);
            $('div.menu.flex').flexMenu({'undo': true});
            $('div.menu.flex').flexMenu();
            return _super;
        },
        do_update_pager: function(hide_index) {
            var _super = this._super(hide_index);
            $('div.menu.flex').flexMenu({'undo': true});
            $('div.menu.flex').flexMenu();
            return _super;
        }
    });
};