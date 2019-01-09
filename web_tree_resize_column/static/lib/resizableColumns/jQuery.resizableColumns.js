(function($) {
    $.fn.resizableColumns = function() {
      var isColResizing = false;
      var resizingPosX = 0;
      var _table = $(this);
      var _thead = $(this).find('thead');

      _thead.find('th').each(function() {
        $(this).css('position', 'relative');
        if ($(this).is(':not(:last-child)')) $(this).append("<div class='resizer' style='position:absolute;top:0px;right:-3px;bottom:0px;width:6px;z-index:999;background:transparent;cursor:col-resize'></div>");
      })

      $(document).mouseup(function(e) {
        _thead.find('th').removeClass('resizing');
        isColResizing = false;
        e.stopPropagation();
      })

      _table.find('.resizer').mousedown(function(e) {
        _thead.find('th').removeClass('resizing');
        $(_thead).find('tr:first-child th:nth-child(' + ($(this).closest('th').index() + 1) + ') .resizer').closest('th').addClass('resizing');
        resizingPosX = e.pageX;
        isColResizing = true;
        e.stopPropagation();
      })

      _table.mousemove(function(e) {
        if (isColResizing) {

          var _resizing = _thead.find('th.resizing .resizer');
          if (_resizing.length == 1) {
            var _nextRow = _thead.find('th.resizing + th');
            var _pageX = e.pageX || 0;
            var _widthDiff = _pageX - resizingPosX;
            var _setWidth = _resizing.closest('th').innerWidth() + _widthDiff;
            var _nextRowWidth = _nextRow.innerWidth() - _widthDiff;
            if (resizingPosX != 0 && _widthDiff != 0 && _setWidth > 50 && _nextRowWidth > 50) {
              _resizing.closest('th').innerWidth(_setWidth);
              resizingPosX = e.pageX;
              _nextRow.innerWidth(_nextRowWidth);
            }
          }
        }
      })
    };
  }
(jQuery));
