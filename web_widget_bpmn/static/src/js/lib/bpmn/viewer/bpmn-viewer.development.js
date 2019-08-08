/*!
 * bpmn-js - bpmn-viewer v4.0.3
 *
 * Copyright (c) 2014-present, camunda Services GmbH
 *
 * Released under the bpmn.io license
 * http://bpmn.io/license
 *
 * Source Code: https://github.com/bpmn-io/bpmn-js
 *
 * Date: 2019-07-22
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.BpmnJS = factory());
}(this, function () { 'use strict';

  /**
   * Flatten array, one level deep.
   *
   * @param {Array<?>} arr
   *
   * @return {Array<?>}
   */

  var nativeToString = Object.prototype.toString;
  var nativeHasOwnProperty = Object.prototype.hasOwnProperty;
  function isUndefined(obj) {
    return obj === undefined;
  }
  function isDefined(obj) {
    return obj !== undefined;
  }
  function isArray(obj) {
    return nativeToString.call(obj) === '[object Array]';
  }
  function isObject(obj) {
    return nativeToString.call(obj) === '[object Object]';
  }
  function isNumber(obj) {
    return nativeToString.call(obj) === '[object Number]';
  }
  function isFunction(obj) {
    var tag = nativeToString.call(obj);
    return tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]' || tag === '[object AsyncGeneratorFunction]' || tag === '[object Proxy]';
  }
  function isString(obj) {
    return nativeToString.call(obj) === '[object String]';
  }
  /**
   * Return true, if target owns a property with the given key.
   *
   * @param {Object} target
   * @param {String} key
   *
   * @return {Boolean}
   */

  function has(target, key) {
    return nativeHasOwnProperty.call(target, key);
  }

  /**
   * Find element in collection.
   *
   * @param  {Array|Object} collection
   * @param  {Function|Object} matcher
   *
   * @return {Object}
   */

  function find(collection, matcher) {
    matcher = toMatcher(matcher);
    var match;
    forEach(collection, function (val, key) {
      if (matcher(val, key)) {
        match = val;
        return false;
      }
    });
    return match;
  }
  /**
   * Find element in collection.
   *
   * @param  {Array|Object} collection
   * @param  {Function} matcher
   *
   * @return {Array} result
   */

  function filter(collection, matcher) {
    var result = [];
    forEach(collection, function (val, key) {
      if (matcher(val, key)) {
        result.push(val);
      }
    });
    return result;
  }
  /**
   * Iterate over collection; returning something
   * (non-undefined) will stop iteration.
   *
   * @param  {Array|Object} collection
   * @param  {Function} iterator
   *
   * @return {Object} return result that stopped the iteration
   */

  function forEach(collection, iterator) {
    var val, result;

    if (isUndefined(collection)) {
      return;
    }

    var convertKey = isArray(collection) ? toNum : identity;

    for (var key in collection) {
      if (has(collection, key)) {
        val = collection[key];
        result = iterator(val, convertKey(key));

        if (result === false) {
          return val;
        }
      }
    }
  }
  /**
   * Reduce collection, returning a single result.
   *
   * @param  {Object|Array} collection
   * @param  {Function} iterator
   * @param  {Any} result
   *
   * @return {Any} result returned from last iterator
   */

  function reduce(collection, iterator, result) {
    forEach(collection, function (value, idx) {
      result = iterator(result, value, idx);
    });
    return result;
  }
  /**
   * Return true if every element in the collection
   * matches the criteria.
   *
   * @param  {Object|Array} collection
   * @param  {Function} matcher
   *
   * @return {Boolean}
   */

  function every(collection, matcher) {
    return reduce(collection, function (matches, val, key) {
      return matches && matcher(val, key);
    }, true);
  }
  /**
   * Return true if some elements in the collection
   * match the criteria.
   *
   * @param  {Object|Array} collection
   * @param  {Function} matcher
   *
   * @return {Boolean}
   */

  function some(collection, matcher) {
    return !!find(collection, matcher);
  }
  /**
   * Transform a collection into another collection
   * by piping each member through the given fn.
   *
   * @param  {Object|Array}   collection
   * @param  {Function} fn
   *
   * @return {Array} transformed collection
   */

  function map(collection, fn) {
    var result = [];
    forEach(collection, function (val, key) {
      result.push(fn(val, key));
    });
    return result;
  }
  /**
   * Create an object pattern matcher.
   *
   * @example
   *
   * const matcher = matchPattern({ id: 1 });
   *
   * var element = find(elements, matcher);
   *
   * @param  {Object} pattern
   *
   * @return {Function} matcherFn
   */

  function matchPattern(pattern) {
    return function (el) {
      return every(pattern, function (val, key) {
        return el[key] === val;
      });
    };
  }

  function toMatcher(matcher) {
    return isFunction(matcher) ? matcher : function (e) {
      return e === matcher;
    };
  }

  function identity(arg) {
    return arg;
  }

  function toNum(arg) {
    return Number(arg);
  }

  /**
   * Debounce fn, calling it only once if
   * the given time elapsed between calls.
   *
   * @param  {Function} fn
   * @param  {Number} timeout
   *
   * @return {Function} debounced function
   */
  function debounce(fn, timeout) {
    var timer;
    var lastArgs;
    var lastThis;
    var lastNow;

    function fire() {
      var now = Date.now();
      var scheduledDiff = lastNow + timeout - now;

      if (scheduledDiff > 0) {
        return schedule(scheduledDiff);
      }

      fn.apply(lastThis, lastArgs);
      timer = lastNow = lastArgs = lastThis = undefined;
    }

    function schedule(timeout) {
      timer = setTimeout(fire, timeout);
    }

    return function () {
      lastNow = Date.now();

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      lastArgs = args;
      lastThis = this; // ensure an execution is scheduled

      if (!timer) {
        schedule(timeout);
      }
    };
  }
  /**
   * Bind function against target <this>.
   *
   * @param  {Function} fn
   * @param  {Object}   target
   *
   * @return {Function} bound function
   */

  function bind(fn, target) {
    return fn.bind(target);
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  /**
   * Convenience wrapper for `Object.assign`.
   *
   * @param {Object} target
   * @param {...Object} others
   *
   * @return {Object} the target
   */

  function assign(target) {
    for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      others[_key - 1] = arguments[_key];
    }

    return _extends.apply(void 0, [target].concat(others));
  }
  /**
   * Pick given properties from the target object.
   *
   * @param {Object} target
   * @param {Array} properties
   *
   * @return {Object} target
   */

  function pick(target, properties) {
    var result = {};
    var obj = Object(target);
    forEach(properties, function (prop) {
      if (prop in obj) {
        result[prop] = target[prop];
      }
    });
    return result;
  }
  /**
   * Pick all target properties, excluding the given ones.
   *
   * @param {Object} target
   * @param {Array} properties
   *
   * @return {Object} target
   */

  function omit(target, properties) {
    var result = {};
    var obj = Object(target);
    forEach(obj, function (prop, key) {
      if (properties.indexOf(key) === -1) {
        result[key] = prop;
      }
    });
    return result;
  }

  /**
   * Set attribute `name` to `val`, or get attr `name`.
   *
   * @param {Element} el
   * @param {String} name
   * @param {String} [val]
   * @api public
   */
  function attr(el, name, val) {
    // get
    if (arguments.length == 2) {
      return el.getAttribute(name);
    }

    // remove
    if (val === null) {
      return el.removeAttribute(name);
    }

    // set
    el.setAttribute(name, val);

    return el;
  }

  var indexOf = [].indexOf;

  var indexof = function(arr, obj){
    if (indexOf) return arr.indexOf(obj);
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === obj) return i;
    }
    return -1;
  };

  /**
   * Taken from https://github.com/component/classes
   *
   * Without the component bits.
   */

  /**
   * Whitespace regexp.
   */

  var re = /\s+/;

  /**
   * toString reference.
   */

  var toString = Object.prototype.toString;

  /**
   * Wrap `el` in a `ClassList`.
   *
   * @param {Element} el
   * @return {ClassList}
   * @api public
   */

  function classes(el) {
    return new ClassList(el);
  }

  /**
   * Initialize a new ClassList for `el`.
   *
   * @param {Element} el
   * @api private
   */

  function ClassList(el) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required');
    }
    this.el = el;
    this.list = el.classList;
  }

  /**
   * Add class `name` if not already present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.add = function (name) {
    // classList
    if (this.list) {
      this.list.add(name);
      return this;
    }

    // fallback
    var arr = this.array();
    var i = indexof(arr, name);
    if (!~i) arr.push(name);
    this.el.className = arr.join(' ');
    return this;
  };

  /**
   * Remove class `name` when present, or
   * pass a regular expression to remove
   * any which match.
   *
   * @param {String|RegExp} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.remove = function (name) {
    if ('[object RegExp]' == toString.call(name)) {
      return this.removeMatching(name);
    }

    // classList
    if (this.list) {
      this.list.remove(name);
      return this;
    }

    // fallback
    var arr = this.array();
    var i = indexof(arr, name);
    if (~i) arr.splice(i, 1);
    this.el.className = arr.join(' ');
    return this;
  };

  /**
   * Remove all classes matching `re`.
   *
   * @param {RegExp} re
   * @return {ClassList}
   * @api private
   */

  ClassList.prototype.removeMatching = function (re) {
    var arr = this.array();
    for (var i = 0; i < arr.length; i++) {
      if (re.test(arr[i])) {
        this.remove(arr[i]);
      }
    }
    return this;
  };

  /**
   * Toggle class `name`, can force state via `force`.
   *
   * For browsers that support classList, but do not support `force` yet,
   * the mistake will be detected and corrected.
   *
   * @param {String} name
   * @param {Boolean} force
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.toggle = function (name, force) {
    // classList
    if (this.list) {
      if ('undefined' !== typeof force) {
        if (force !== this.list.toggle(name, force)) {
          this.list.toggle(name); // toggle again to correct
        }
      } else {
        this.list.toggle(name);
      }
      return this;
    }

    // fallback
    if ('undefined' !== typeof force) {
      if (!force) {
        this.remove(name);
      } else {
        this.add(name);
      }
    } else {
      if (this.has(name)) {
        this.remove(name);
      } else {
        this.add(name);
      }
    }

    return this;
  };

  /**
   * Return an array of classes.
   *
   * @return {Array}
   * @api public
   */

  ClassList.prototype.array = function () {
    var className = this.el.getAttribute('class') || '';
    var str = className.replace(/^\s+|\s+$/g, '');
    var arr = str.split(re);
    if ('' === arr[0]) arr.shift();
    return arr;
  };

  /**
   * Check if class `name` is present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.has = ClassList.prototype.contains = function (name) {
    return this.list ? this.list.contains(name) : !!~indexof(this.array(), name);
  };

  /**
   * Remove all children from the given element.
   */
  function clear(el) {

    var c;

    while (el.childNodes.length) {
      c = el.childNodes[0];
      el.removeChild(c);
    }

    return el;
  }

  /**
   * Element prototype.
   */

  var proto = Element.prototype;

  /**
   * Vendor function.
   */

  var vendor = proto.matchesSelector
    || proto.webkitMatchesSelector
    || proto.mozMatchesSelector
    || proto.msMatchesSelector
    || proto.oMatchesSelector;

  /**
   * Expose `match()`.
   */

  var matchesSelector = match;

  /**
   * Match `el` to `selector`.
   *
   * @param {Element} el
   * @param {String} selector
   * @return {Boolean}
   * @api public
   */

  function match(el, selector) {
    if (vendor) return vendor.call(el, selector);
    var nodes = el.parentNode.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; ++i) {
      if (nodes[i] == el) return true;
    }
    return false;
  }

  var closest = function (element, selector, checkYoSelf) {
    var parent = checkYoSelf ? element : element.parentNode;

    while (parent && parent !== document) {
      if (matchesSelector(parent, selector)) return parent;
      parent = parent.parentNode;
    }
  };

  var bind$1 = window.addEventListener ? 'addEventListener' : 'attachEvent',
      unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
      prefix = bind$1 !== 'addEventListener' ? 'on' : '';

  /**
   * Bind `el` event `type` to `fn`.
   *
   * @param {Element} el
   * @param {String} type
   * @param {Function} fn
   * @param {Boolean} capture
   * @return {Function}
   * @api public
   */

  var bind_1 = function(el, type, fn, capture){
    el[bind$1](prefix + type, fn, capture || false);
    return fn;
  };

  /**
   * Unbind `el` event `type`'s callback `fn`.
   *
   * @param {Element} el
   * @param {String} type
   * @param {Function} fn
   * @param {Boolean} capture
   * @return {Function}
   * @api public
   */

  var unbind_1 = function(el, type, fn, capture){
    el[unbind](prefix + type, fn, capture || false);
    return fn;
  };

  var componentEvent = {
  	bind: bind_1,
  	unbind: unbind_1
  };

  /**
   * Module dependencies.
   */



  /**
   * Delegate event `type` to `selector`
   * and invoke `fn(e)`. A callback function
   * is returned which may be passed to `.unbind()`.
   *
   * @param {Element} el
   * @param {String} selector
   * @param {String} type
   * @param {Function} fn
   * @param {Boolean} capture
   * @return {Function}
   * @api public
   */

  // Some events don't bubble, so we want to bind to the capture phase instead
  // when delegating.
  var forceCaptureEvents = ['focus', 'blur'];

  var bind$1$1 = function(el, selector, type, fn, capture){
    if (forceCaptureEvents.indexOf(type) !== -1) capture = true;

    return componentEvent.bind(el, type, function(e){
      var target = e.target || e.srcElement;
      e.delegateTarget = closest(target, selector, true);
      if (e.delegateTarget) fn.call(el, e);
    }, capture);
  };

  /**
   * Unbind event `type`'s callback `fn`.
   *
   * @param {Element} el
   * @param {String} type
   * @param {Function} fn
   * @param {Boolean} capture
   * @api public
   */

  var unbind$1 = function(el, type, fn, capture){
    if (forceCaptureEvents.indexOf(type) !== -1) capture = true;

    componentEvent.unbind(el, type, fn, capture);
  };

  var delegateEvents = {
  	bind: bind$1$1,
  	unbind: unbind$1
  };

  /**
   * Expose `parse`.
   */

  var domify = parse;

  /**
   * Tests for browser support.
   */

  var innerHTMLBug = false;
  var bugTestDiv;
  if (typeof document !== 'undefined') {
    bugTestDiv = document.createElement('div');
    // Setup
    bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
    // Make sure that link elements get serialized correctly by innerHTML
    // This requires a wrapper element in IE
    innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
    bugTestDiv = undefined;
  }

  /**
   * Wrap map from jquery.
   */

  var map$1 = {
    legend: [1, '<fieldset>', '</fieldset>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    // for script/link/style tags to work in IE6-8, you have to wrap
    // in a div with a non-whitespace character in front, ha!
    _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
  };

  map$1.td =
  map$1.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

  map$1.option =
  map$1.optgroup = [1, '<select multiple="multiple">', '</select>'];

  map$1.thead =
  map$1.tbody =
  map$1.colgroup =
  map$1.caption =
  map$1.tfoot = [1, '<table>', '</table>'];

  map$1.polyline =
  map$1.ellipse =
  map$1.polygon =
  map$1.circle =
  map$1.text =
  map$1.line =
  map$1.path =
  map$1.rect =
  map$1.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

  /**
   * Parse `html` and return a DOM Node instance, which could be a TextNode,
   * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
   * instance, depending on the contents of the `html` string.
   *
   * @param {String} html - HTML string to "domify"
   * @param {Document} doc - The `document` instance to create the Node for
   * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
   * @api private
   */

  function parse(html, doc) {
    if ('string' != typeof html) throw new TypeError('String expected');

    // default to the global `document` object
    if (!doc) doc = document;

    // tag name
    var m = /<([\w:]+)/.exec(html);
    if (!m) return doc.createTextNode(html);

    html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

    var tag = m[1];

    // body support
    if (tag == 'body') {
      var el = doc.createElement('html');
      el.innerHTML = html;
      return el.removeChild(el.lastChild);
    }

    // wrap map
    var wrap = map$1[tag] || map$1._default;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var el = doc.createElement('div');
    el.innerHTML = prefix + html + suffix;
    while (depth--) el = el.lastChild;

    // one element
    if (el.firstChild == el.lastChild) {
      return el.removeChild(el.firstChild);
    }

    // several elements
    var fragment = doc.createDocumentFragment();
    while (el.firstChild) {
      fragment.appendChild(el.removeChild(el.firstChild));
    }

    return fragment;
  }

  var proto$1 = typeof Element !== 'undefined' ? Element.prototype : {};
  var vendor$1 = proto$1.matches
    || proto$1.matchesSelector
    || proto$1.webkitMatchesSelector
    || proto$1.mozMatchesSelector
    || proto$1.msMatchesSelector
    || proto$1.oMatchesSelector;

  function query(selector, el) {
    el = el || document;

    return el.querySelector(selector);
  }

  function remove(el) {
    el.parentNode && el.parentNode.removeChild(el);
  }

  function ensureImported(element, target) {

    if (element.ownerDocument !== target.ownerDocument) {
      try {
        // may fail on webkit
        return target.ownerDocument.importNode(element, true);
      } catch (e) {
        // ignore
      }
    }

    return element;
  }

  /**
   * appendTo utility
   */

  /**
   * Append a node to a target element and return the appended node.
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} target
   *
   * @return {SVGElement} the appended node
   */
  function appendTo(element, target) {
    return target.appendChild(ensureImported(element, target));
  }

  /**
   * append utility
   */

  /**
   * Append a node to an element
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} node
   *
   * @return {SVGElement} the element
   */
  function append(target, node) {
    appendTo(node, target);
    return target;
  }

  /**
   * attribute accessor utility
   */

  var LENGTH_ATTR = 2;

  var CSS_PROPERTIES = {
    'alignment-baseline': 1,
    'baseline-shift': 1,
    'clip': 1,
    'clip-path': 1,
    'clip-rule': 1,
    'color': 1,
    'color-interpolation': 1,
    'color-interpolation-filters': 1,
    'color-profile': 1,
    'color-rendering': 1,
    'cursor': 1,
    'direction': 1,
    'display': 1,
    'dominant-baseline': 1,
    'enable-background': 1,
    'fill': 1,
    'fill-opacity': 1,
    'fill-rule': 1,
    'filter': 1,
    'flood-color': 1,
    'flood-opacity': 1,
    'font': 1,
    'font-family': 1,
    'font-size': LENGTH_ATTR,
    'font-size-adjust': 1,
    'font-stretch': 1,
    'font-style': 1,
    'font-variant': 1,
    'font-weight': 1,
    'glyph-orientation-horizontal': 1,
    'glyph-orientation-vertical': 1,
    'image-rendering': 1,
    'kerning': 1,
    'letter-spacing': 1,
    'lighting-color': 1,
    'marker': 1,
    'marker-end': 1,
    'marker-mid': 1,
    'marker-start': 1,
    'mask': 1,
    'opacity': 1,
    'overflow': 1,
    'pointer-events': 1,
    'shape-rendering': 1,
    'stop-color': 1,
    'stop-opacity': 1,
    'stroke': 1,
    'stroke-dasharray': 1,
    'stroke-dashoffset': 1,
    'stroke-linecap': 1,
    'stroke-linejoin': 1,
    'stroke-miterlimit': 1,
    'stroke-opacity': 1,
    'stroke-width': LENGTH_ATTR,
    'text-anchor': 1,
    'text-decoration': 1,
    'text-rendering': 1,
    'unicode-bidi': 1,
    'visibility': 1,
    'word-spacing': 1,
    'writing-mode': 1
  };


  function getAttribute(node, name) {
    if (CSS_PROPERTIES[name]) {
      return node.style[name];
    } else {
      return node.getAttributeNS(null, name);
    }
  }

  function setAttribute(node, name, value) {
    var hyphenated = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    var type = CSS_PROPERTIES[hyphenated];

    if (type) {
      // append pixel unit, unless present
      if (type === LENGTH_ATTR && typeof value === 'number') {
        value = String(value) + 'px';
      }

      node.style[hyphenated] = value;
    } else {
      node.setAttributeNS(null, name, value);
    }
  }

  function setAttributes(node, attrs) {

    var names = Object.keys(attrs), i, name;

    for (i = 0, name; (name = names[i]); i++) {
      setAttribute(node, name, attrs[name]);
    }
  }

  /**
   * Gets or sets raw attributes on a node.
   *
   * @param  {SVGElement} node
   * @param  {Object} [attrs]
   * @param  {String} [name]
   * @param  {String} [value]
   *
   * @return {String}
   */
  function attr$1(node, name, value) {
    if (typeof name === 'string') {
      if (value !== undefined) {
        setAttribute(node, name, value);
      } else {
        return getAttribute(node, name);
      }
    } else {
      setAttributes(node, name);
    }

    return node;
  }

  /**
   * Clear utility
   */
  function index(arr, obj) {
    if (arr.indexOf) {
      return arr.indexOf(obj);
    }


    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === obj) {
        return i;
      }
    }

    return -1;
  }

  var re$1 = /\s+/;

  var toString$1 = Object.prototype.toString;

  function defined(o) {
    return typeof o !== 'undefined';
  }

  /**
   * Wrap `el` in a `ClassList`.
   *
   * @param {Element} el
   * @return {ClassList}
   * @api public
   */

  function classes$1(el) {
    return new ClassList$1(el);
  }

  function ClassList$1(el) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required');
    }
    this.el = el;
    this.list = el.classList;
  }

  /**
   * Add class `name` if not already present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList$1.prototype.add = function(name) {

    // classList
    if (this.list) {
      this.list.add(name);
      return this;
    }

    // fallback
    var arr = this.array();
    var i = index(arr, name);
    if (!~i) {
      arr.push(name);
    }

    if (defined(this.el.className.baseVal)) {
      this.el.className.baseVal = arr.join(' ');
    } else {
      this.el.className = arr.join(' ');
    }

    return this;
  };

  /**
   * Remove class `name` when present, or
   * pass a regular expression to remove
   * any which match.
   *
   * @param {String|RegExp} name
   * @return {ClassList}
   * @api public
   */

  ClassList$1.prototype.remove = function(name) {
    if ('[object RegExp]' === toString$1.call(name)) {
      return this.removeMatching(name);
    }

    // classList
    if (this.list) {
      this.list.remove(name);
      return this;
    }

    // fallback
    var arr = this.array();
    var i = index(arr, name);
    if (~i) {
      arr.splice(i, 1);
    }
    this.el.className.baseVal = arr.join(' ');
    return this;
  };

  /**
   * Remove all classes matching `re`.
   *
   * @param {RegExp} re
   * @return {ClassList}
   * @api private
   */

  ClassList$1.prototype.removeMatching = function(re) {
    var arr = this.array();
    for (var i = 0; i < arr.length; i++) {
      if (re.test(arr[i])) {
        this.remove(arr[i]);
      }
    }
    return this;
  };

  /**
   * Toggle class `name`, can force state via `force`.
   *
   * For browsers that support classList, but do not support `force` yet,
   * the mistake will be detected and corrected.
   *
   * @param {String} name
   * @param {Boolean} force
   * @return {ClassList}
   * @api public
   */

  ClassList$1.prototype.toggle = function(name, force) {
    // classList
    if (this.list) {
      if (defined(force)) {
        if (force !== this.list.toggle(name, force)) {
          this.list.toggle(name); // toggle again to correct
        }
      } else {
        this.list.toggle(name);
      }
      return this;
    }

    // fallback
    if (defined(force)) {
      if (!force) {
        this.remove(name);
      } else {
        this.add(name);
      }
    } else {
      if (this.has(name)) {
        this.remove(name);
      } else {
        this.add(name);
      }
    }

    return this;
  };

  /**
   * Return an array of classes.
   *
   * @return {Array}
   * @api public
   */

  ClassList$1.prototype.array = function() {
    var className = this.el.getAttribute('class') || '';
    var str = className.replace(/^\s+|\s+$/g, '');
    var arr = str.split(re$1);
    if ('' === arr[0]) {
      arr.shift();
    }
    return arr;
  };

  /**
   * Check if class `name` is present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList$1.prototype.has =
  ClassList$1.prototype.contains = function(name) {
    return (
      this.list ?
        this.list.contains(name) :
        !! ~index(this.array(), name)
    );
  };

  function remove$1(element) {
    var parent = element.parentNode;

    if (parent) {
      parent.removeChild(element);
    }

    return element;
  }

  /**
   * Clear utility
   */

  /**
   * Removes all children from the given element
   *
   * @param  {DOMElement} element
   * @return {DOMElement} the element (for chaining)
   */
  function clear$1(element) {
    var child;

    while ((child = element.firstChild)) {
      remove$1(child);
    }

    return element;
  }

  var ns = {
    svg: 'http://www.w3.org/2000/svg'
  };

  /**
   * DOM parsing utility
   */

  var SVG_START = '<svg xmlns="' + ns.svg + '"';

  function parse$1(svg) {

    var unwrap = false;

    // ensure we import a valid svg document
    if (svg.substring(0, 4) === '<svg') {
      if (svg.indexOf(ns.svg) === -1) {
        svg = SVG_START + svg.substring(4);
      }
    } else {
      // namespace svg
      svg = SVG_START + '>' + svg + '</svg>';
      unwrap = true;
    }

    var parsed = parseDocument(svg);

    if (!unwrap) {
      return parsed;
    }

    var fragment = document.createDocumentFragment();

    var parent = parsed.firstChild;

    while (parent.firstChild) {
      fragment.appendChild(parent.firstChild);
    }

    return fragment;
  }

  function parseDocument(svg) {

    var parser;

    // parse
    parser = new DOMParser();
    parser.async = false;

    return parser.parseFromString(svg, 'text/xml');
  }

  /**
   * Create utility for SVG elements
   */


  /**
   * Create a specific type from name or SVG markup.
   *
   * @param {String} name the name or markup of the element
   * @param {Object} [attrs] attributes to set on the element
   *
   * @returns {SVGElement}
   */
  function create(name, attrs) {
    var element;

    if (name.charAt(0) === '<') {
      element = parse$1(name).firstChild;
      element = document.importNode(element, true);
    } else {
      element = document.createElementNS(ns.svg, name);
    }

    if (attrs) {
      attr$1(element, attrs);
    }

    return element;
  }

  /**
   * Geometry helpers
   */

  // fake node used to instantiate svg geometry elements
  var node = create('svg');

  function extend(object, props) {
    var i, k, keys = Object.keys(props);

    for (i = 0; (k = keys[i]); i++) {
      object[k] = props[k];
    }

    return object;
  }

  /**
   * Create matrix via args.
   *
   * @example
   *
   * createMatrix({ a: 1, b: 1 });
   * createMatrix();
   * createMatrix(1, 2, 0, 0, 30, 20);
   *
   * @return {SVGMatrix}
   */
  function createMatrix(a, b, c, d, e, f) {
    var matrix = node.createSVGMatrix();

    switch (arguments.length) {
    case 0:
      return matrix;
    case 1:
      return extend(matrix, a);
    case 6:
      return extend(matrix, {
        a: a,
        b: b,
        c: c,
        d: d,
        e: e,
        f: f
      });
    }
  }

  function createTransform(matrix) {
    if (matrix) {
      return node.createSVGTransformFromMatrix(matrix);
    } else {
      return node.createSVGTransform();
    }
  }

  /**
   * Serialization util
   */

  var TEXT_ENTITIES = /([&<>]{1})/g;
  var ATTR_ENTITIES = /([\n\r"]{1})/g;

  var ENTITY_REPLACEMENT = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '\''
  };

  function escape(str, pattern) {

    function replaceFn(match, entity) {
      return ENTITY_REPLACEMENT[entity] || entity;
    }

    return str.replace(pattern, replaceFn);
  }

  function serialize(node, output) {

    var i, len, attrMap, attrNode, childNodes;

    switch (node.nodeType) {
    // TEXT
    case 3:
      // replace special XML characters
      output.push(escape(node.textContent, TEXT_ENTITIES));
      break;

    // ELEMENT
    case 1:
      output.push('<', node.tagName);

      if (node.hasAttributes()) {
        attrMap = node.attributes;
        for (i = 0, len = attrMap.length; i < len; ++i) {
          attrNode = attrMap.item(i);
          output.push(' ', attrNode.name, '="', escape(attrNode.value, ATTR_ENTITIES), '"');
        }
      }

      if (node.hasChildNodes()) {
        output.push('>');
        childNodes = node.childNodes;
        for (i = 0, len = childNodes.length; i < len; ++i) {
          serialize(childNodes.item(i), output);
        }
        output.push('</', node.tagName, '>');
      } else {
        output.push('/>');
      }
      break;

    // COMMENT
    case 8:
      output.push('<!--', escape(node.nodeValue, TEXT_ENTITIES), '-->');
      break;

    // CDATA
    case 4:
      output.push('<![CDATA[', node.nodeValue, ']]>');
      break;

    default:
      throw new Error('unable to handle node ' + node.nodeType);
    }

    return output;
  }

  /**
   * innerHTML like functionality for SVG elements.
   * based on innerSVG (https://code.google.com/p/innersvg)
   */


  function set(element, svg) {

    var parsed = parse$1(svg);

    // clear element contents
    clear$1(element);

    if (!svg) {
      return;
    }

    if (!isFragment(parsed)) {
      // extract <svg> from parsed document
      parsed = parsed.documentElement;
    }

    var nodes = slice(parsed.childNodes);

    // import + append each node
    for (var i = 0; i < nodes.length; i++) {
      appendTo(nodes[i], element);
    }

  }

  function get(element) {
    var child = element.firstChild,
        output = [];

    while (child) {
      serialize(child, output);
      child = child.nextSibling;
    }

    return output.join('');
  }

  function isFragment(node) {
    return node.nodeName === '#document-fragment';
  }

  function innerSVG(element, svg) {

    if (svg !== undefined) {

      try {
        set(element, svg);
      } catch (e) {
        throw new Error('error parsing SVG: ' + e.message);
      }

      return element;
    } else {
      return get(element);
    }
  }


  function slice(arr) {
    return Array.prototype.slice.call(arr);
  }

  /**
   * transform accessor utility
   */

  function wrapMatrix(transformList, transform) {
    if (transform instanceof SVGMatrix) {
      return transformList.createSVGTransformFromMatrix(transform);
    }

    return transform;
  }


  function setTransforms(transformList, transforms) {
    var i, t;

    transformList.clear();

    for (i = 0; (t = transforms[i]); i++) {
      transformList.appendItem(wrapMatrix(transformList, t));
    }
  }

  /**
   * Get or set the transforms on the given node.
   *
   * @param {SVGElement} node
   * @param  {SVGTransform|SVGMatrix|Array<SVGTransform|SVGMatrix>} [transforms]
   *
   * @return {SVGTransform} the consolidated transform
   */
  function transform(node, transforms) {
    var transformList = node.transform.baseVal;

    if (transforms) {

      if (!Array.isArray(transforms)) {
        transforms = [ transforms ];
      }

      setTransforms(transformList, transforms);
    }

    return transformList.consolidate();
  }

  var CLASS_PATTERN = /^class /;

  function isClass(fn) {
    return CLASS_PATTERN.test(fn.toString());
  }

  function isArray$1(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function annotate() {
    var args = Array.prototype.slice.call(arguments);

    if (args.length === 1 && isArray$1(args[0])) {
      args = args[0];
    }

    var fn = args.pop();

    fn.$inject = args;

    return fn;
  }

  // Current limitations:
  // - can't put into "function arg" comments
  // function /* (no parenthesis like this) */ (){}
  // function abc( /* xx (no parenthesis like this) */ a, b) {}
  //
  // Just put the comment before function or inside:
  // /* (((this is fine))) */ function(a, b) {}
  // function abc(a) { /* (((this is fine))) */}
  //
  // - can't reliably auto-annotate constructor; we'll match the
  // first constructor(...) pattern found which may be the one
  // of a nested class, too.

  var CONSTRUCTOR_ARGS = /constructor\s*[^(]*\(\s*([^)]*)\)/m;
  var FN_ARGS = /^function\s*[^(]*\(\s*([^)]*)\)/m;
  var FN_ARG = /\/\*([^*]*)\*\//m;

  function parse$2(fn) {

    if (typeof fn !== 'function') {
      throw new Error('Cannot annotate "' + fn + '". Expected a function!');
    }

    var match = fn.toString().match(isClass(fn) ? CONSTRUCTOR_ARGS : FN_ARGS);

    // may parse class without constructor
    if (!match) {
      return [];
    }

    return match[1] && match[1].split(',').map(function (arg) {
      match = arg.match(FN_ARG);
      return match ? match[1].trim() : arg.trim();
    }) || [];
  }

  function Module() {
    var providers = [];

    this.factory = function (name, factory) {
      providers.push([name, 'factory', factory]);
      return this;
    };

    this.value = function (name, value) {
      providers.push([name, 'value', value]);
      return this;
    };

    this.type = function (name, type) {
      providers.push([name, 'type', type]);
      return this;
    };

    this.forEach = function (iterator) {
      providers.forEach(iterator);
    };
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  function Injector(modules, parent) {
    parent = parent || {
      get: function get(name, strict) {
        currentlyResolving.push(name);

        if (strict === false) {
          return null;
        } else {
          throw error('No provider for "' + name + '"!');
        }
      }
    };

    var currentlyResolving = [];
    var providers = this._providers = Object.create(parent._providers || null);
    var instances = this._instances = Object.create(null);

    var self = instances.injector = this;

    var error = function error(msg) {
      var stack = currentlyResolving.join(' -> ');
      currentlyResolving.length = 0;
      return new Error(stack ? msg + ' (Resolving: ' + stack + ')' : msg);
    };

    /**
     * Return a named service.
     *
     * @param {String} name
     * @param {Boolean} [strict=true] if false, resolve missing services to null
     *
     * @return {Object}
     */
    var get = function get(name, strict) {
      if (!providers[name] && name.indexOf('.') !== -1) {
        var parts = name.split('.');
        var pivot = get(parts.shift());

        while (parts.length) {
          pivot = pivot[parts.shift()];
        }

        return pivot;
      }

      if (hasProp(instances, name)) {
        return instances[name];
      }

      if (hasProp(providers, name)) {
        if (currentlyResolving.indexOf(name) !== -1) {
          currentlyResolving.push(name);
          throw error('Cannot resolve circular dependency!');
        }

        currentlyResolving.push(name);
        instances[name] = providers[name][0](providers[name][1]);
        currentlyResolving.pop();

        return instances[name];
      }

      return parent.get(name, strict);
    };

    var fnDef = function fnDef(fn) {
      var locals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (typeof fn !== 'function') {
        if (isArray$1(fn)) {
          fn = annotate(fn.slice());
        } else {
          throw new Error('Cannot invoke "' + fn + '". Expected a function!');
        }
      }

      var inject = fn.$inject || parse$2(fn);
      var dependencies = inject.map(function (dep) {
        if (hasProp(locals, dep)) {
          return locals[dep];
        } else {
          return get(dep);
        }
      });

      return {
        fn: fn,
        dependencies: dependencies
      };
    };

    var instantiate = function instantiate(Type) {
      var _fnDef = fnDef(Type),
          dependencies = _fnDef.dependencies,
          fn = _fnDef.fn;

      return new (Function.prototype.bind.apply(fn, [null].concat(_toConsumableArray(dependencies))))();
    };

    var invoke = function invoke(func, context, locals) {
      var _fnDef2 = fnDef(func, locals),
          dependencies = _fnDef2.dependencies,
          fn = _fnDef2.fn;

      return fn.call.apply(fn, [context].concat(_toConsumableArray(dependencies)));
    };

    var createPrivateInjectorFactory = function createPrivateInjectorFactory(privateChildInjector) {
      return annotate(function (key) {
        return privateChildInjector.get(key);
      });
    };

    var createChild = function createChild(modules, forceNewInstances) {
      if (forceNewInstances && forceNewInstances.length) {
        var fromParentModule = Object.create(null);
        var matchedScopes = Object.create(null);

        var privateInjectorsCache = [];
        var privateChildInjectors = [];
        var privateChildFactories = [];

        var provider;
        var cacheIdx;
        var privateChildInjector;
        var privateChildInjectorFactory;
        for (var name in providers) {
          provider = providers[name];

          if (forceNewInstances.indexOf(name) !== -1) {
            if (provider[2] === 'private') {
              cacheIdx = privateInjectorsCache.indexOf(provider[3]);
              if (cacheIdx === -1) {
                privateChildInjector = provider[3].createChild([], forceNewInstances);
                privateChildInjectorFactory = createPrivateInjectorFactory(privateChildInjector);
                privateInjectorsCache.push(provider[3]);
                privateChildInjectors.push(privateChildInjector);
                privateChildFactories.push(privateChildInjectorFactory);
                fromParentModule[name] = [privateChildInjectorFactory, name, 'private', privateChildInjector];
              } else {
                fromParentModule[name] = [privateChildFactories[cacheIdx], name, 'private', privateChildInjectors[cacheIdx]];
              }
            } else {
              fromParentModule[name] = [provider[2], provider[1]];
            }
            matchedScopes[name] = true;
          }

          if ((provider[2] === 'factory' || provider[2] === 'type') && provider[1].$scope) {
            /* jshint -W083 */
            forceNewInstances.forEach(function (scope) {
              if (provider[1].$scope.indexOf(scope) !== -1) {
                fromParentModule[name] = [provider[2], provider[1]];
                matchedScopes[scope] = true;
              }
            });
          }
        }

        forceNewInstances.forEach(function (scope) {
          if (!matchedScopes[scope]) {
            throw new Error('No provider for "' + scope + '". Cannot use provider from the parent!');
          }
        });

        modules.unshift(fromParentModule);
      }

      return new Injector(modules, self);
    };

    var factoryMap = {
      factory: invoke,
      type: instantiate,
      value: function value(_value) {
        return _value;
      }
    };

    modules.forEach(function (module) {

      function arrayUnwrap(type, value) {
        if (type !== 'value' && isArray$1(value)) {
          value = annotate(value.slice());
        }

        return value;
      }

      // TODO(vojta): handle wrong inputs (modules)
      if (module instanceof Module) {
        module.forEach(function (provider) {
          var name = provider[0];
          var type = provider[1];
          var value = provider[2];

          providers[name] = [factoryMap[type], arrayUnwrap(type, value), type];
        });
      } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object') {
        if (module.__exports__) {
          var clonedModule = Object.keys(module).reduce(function (m, key) {
            if (key.substring(0, 2) !== '__') {
              m[key] = module[key];
            }
            return m;
          }, Object.create(null));

          var privateInjector = new Injector((module.__modules__ || []).concat([clonedModule]), self);
          var getFromPrivateInjector = annotate(function (key) {
            return privateInjector.get(key);
          });
          module.__exports__.forEach(function (key) {
            providers[key] = [getFromPrivateInjector, key, 'private', privateInjector];
          });
        } else {
          Object.keys(module).forEach(function (name) {
            if (module[name][2] === 'private') {
              providers[name] = module[name];
              return;
            }

            var type = module[name][0];
            var value = module[name][1];

            providers[name] = [factoryMap[type], arrayUnwrap(type, value), type];
          });
        }
      }
    });

    // public API
    this.get = get;
    this.invoke = invoke;
    this.instantiate = instantiate;
    this.createChild = createChild;
  }

  // helpers /////////////////

  function hasProp(obj, prop) {
    return Object.hasOwnProperty.call(obj, prop);
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var inherits_browser = createCommonjsModule(function (module) {
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  });

  var DEFAULT_RENDER_PRIORITY = 1000;

  /**
   * The base implementation of shape and connection renderers.
   *
   * @param {EventBus} eventBus
   * @param {Number} [renderPriority=1000]
   */
  function BaseRenderer(eventBus, renderPriority) {
    var self = this;

    renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY;

    eventBus.on([ 'render.shape', 'render.connection' ], renderPriority, function(evt, context) {
      var type = evt.type,
          element = context.element,
          visuals = context.gfx;

      if (self.canRender(element)) {
        if (type === 'render.shape') {
          return self.drawShape(visuals, element);
        } else {
          return self.drawConnection(visuals, element);
        }
      }
    });

    eventBus.on([ 'render.getShapePath', 'render.getConnectionPath'], renderPriority, function(evt, element) {
      if (self.canRender(element)) {
        if (evt.type === 'render.getShapePath') {
          return self.getShapePath(element);
        } else {
          return self.getConnectionPath(element);
        }
      }
    });
  }

  /**
   * Should check whether *this* renderer can render
   * the element/connection.
   *
   * @param {element} element
   *
   * @returns {Boolean}
   */
  BaseRenderer.prototype.canRender = function() {};

  /**
   * Provides the shape's snap svg element to be drawn on the `canvas`.
   *
   * @param {djs.Graphics} visuals
   * @param {Shape} shape
   *
   * @returns {Snap.svg} [returns a Snap.svg paper element ]
   */
  BaseRenderer.prototype.drawShape = function() {};

  /**
   * Provides the shape's snap svg element to be drawn on the `canvas`.
   *
   * @param {djs.Graphics} visuals
   * @param {Connection} connection
   *
   * @returns {Snap.svg} [returns a Snap.svg paper element ]
   */
  BaseRenderer.prototype.drawConnection = function() {};

  /**
   * Gets the SVG path of a shape that represents it's visual bounds.
   *
   * @param {Shape} shape
   *
   * @return {string} svg path
   */
  BaseRenderer.prototype.getShapePath = function() {};

  /**
   * Gets the SVG path of a connection that represents it's visual bounds.
   *
   * @param {Connection} connection
   *
   * @return {string} svg path
   */
  BaseRenderer.prototype.getConnectionPath = function() {};

  function componentsToPath(elements) {
    return elements.join(',').replace(/,?([A-z]),?/g, '$1');
  }

  function toSVGPoints(points) {
    var result = '';

    for (var i = 0, p; (p = points[i]); i++) {
      result += p.x + ',' + p.y + ' ';
    }

    return result;
  }

  function createLine(points, attrs) {

    var line = create('polyline');
    attr$1(line, { points: toSVGPoints(points) });

    if (attrs) {
      attr$1(line, attrs);
    }

    return line;
  }

  function updateLine(gfx, points) {
    attr$1(gfx, { points: toSVGPoints(points) });

    return gfx;
  }

  /**
   * Returns the surrounding bbox for all elements in
   * the array or the element primitive.
   *
   * @param {Array<djs.model.Shape>|djs.model.Shape} elements
   * @param {Boolean} stopRecursion
   */
  function getBBox(elements, stopRecursion) {

    stopRecursion = !!stopRecursion;
    if (!isArray(elements)) {
      elements = [elements];
    }

    var minX,
        minY,
        maxX,
        maxY;

    forEach(elements, function(element) {

      // If element is a connection the bbox must be computed first
      var bbox = element;
      if (element.waypoints && !stopRecursion) {
        bbox = getBBox(element.waypoints, true);
      }

      var x = bbox.x,
          y = bbox.y,
          height = bbox.height || 0,
          width = bbox.width || 0;

      if (x < minX || minX === undefined) {
        minX = x;
      }
      if (y < minY || minY === undefined) {
        minY = y;
      }

      if ((x + width) > maxX || maxX === undefined) {
        maxX = x + width;
      }
      if ((y + height) > maxY || maxY === undefined) {
        maxY = y + height;
      }
    });

    return {
      x: minX,
      y: minY,
      height: maxY - minY,
      width: maxX - minX
    };
  }


  function getType(element) {

    if ('waypoints' in element) {
      return 'connection';
    }

    if ('x' in element) {
      return 'shape';
    }

    return 'root';
  }

  function isFrameElement(element) {

    return !!(element && element.isFrame);
  }

  // apply default renderer with lowest possible priority
  // so that it only kicks in if noone else could render
  var DEFAULT_RENDER_PRIORITY$1 = 1;

  /**
   * The default renderer used for shapes and connections.
   *
   * @param {EventBus} eventBus
   * @param {Styles} styles
   */
  function DefaultRenderer(eventBus, styles) {
    //
    BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY$1);

    this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
    this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
    this.FRAME_STYLE = styles.style([ 'no-fill' ], { stroke: 'fuchsia', strokeDasharray: 4, strokeWidth: 2 });
  }

  inherits_browser(DefaultRenderer, BaseRenderer);


  DefaultRenderer.prototype.canRender = function() {
    return true;
  };

  DefaultRenderer.prototype.drawShape = function drawShape(visuals, element) {
    var rect = create('rect');

    attr$1(rect, {
      x: 0,
      y: 0,
      width: element.width || 0,
      height: element.height || 0
    });

    if (isFrameElement(element)) {
      attr$1(rect, this.FRAME_STYLE);
    } else {
      attr$1(rect, this.SHAPE_STYLE);
    }

    append(visuals, rect);

    return rect;
  };

  DefaultRenderer.prototype.drawConnection = function drawConnection(visuals, connection) {

    var line = createLine(connection.waypoints, this.CONNECTION_STYLE);
    append(visuals, line);

    return line;
  };

  DefaultRenderer.prototype.getShapePath = function getShapePath(shape) {

    var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height;

    var shapePath = [
      ['M', x, y],
      ['l', width, 0],
      ['l', 0, height],
      ['l', -width, 0],
      ['z']
    ];

    return componentsToPath(shapePath);
  };

  DefaultRenderer.prototype.getConnectionPath = function getConnectionPath(connection) {
    var waypoints = connection.waypoints;

    var idx, point, connectionPath = [];

    for (idx = 0; (point = waypoints[idx]); idx++) {

      // take invisible docking into account
      // when creating the path
      point = point.original || point;

      connectionPath.push([ idx === 0 ? 'M' : 'L', point.x, point.y ]);
    }

    return componentsToPath(connectionPath);
  };


  DefaultRenderer.$inject = [ 'eventBus', 'styles' ];

  /**
   * A component that manages shape styles
   */
  function Styles() {

    var defaultTraits = {

      'no-fill': {
        fill: 'none'
      },
      'no-border': {
        strokeOpacity: 0.0
      },
      'no-events': {
        pointerEvents: 'none'
      }
    };

    var self = this;

    /**
     * Builds a style definition from a className, a list of traits and an object of additional attributes.
     *
     * @param  {String} className
     * @param  {Array<String>} traits
     * @param  {Object} additionalAttrs
     *
     * @return {Object} the style defintion
     */
    this.cls = function(className, traits, additionalAttrs) {
      var attrs = this.style(traits, additionalAttrs);

      return assign(attrs, { 'class': className });
    };

    /**
     * Builds a style definition from a list of traits and an object of additional attributes.
     *
     * @param  {Array<String>} traits
     * @param  {Object} additionalAttrs
     *
     * @return {Object} the style defintion
     */
    this.style = function(traits, additionalAttrs) {

      if (!isArray(traits) && !additionalAttrs) {
        additionalAttrs = traits;
        traits = [];
      }

      var attrs = reduce(traits, function(attrs, t) {
        return assign(attrs, defaultTraits[t] || {});
      }, {});

      return additionalAttrs ? assign(attrs, additionalAttrs) : attrs;
    };

    this.computeStyle = function(custom, traits, defaultStyles) {
      if (!isArray(traits)) {
        defaultStyles = traits;
        traits = [];
      }

      return self.style(traits || [], assign({}, defaultStyles, custom || {}));
    };
  }

  var DrawModule = {
    __init__: [ 'defaultRenderer' ],
    defaultRenderer: [ 'type', DefaultRenderer ],
    styles: [ 'type', Styles ]
  };

  /**
   * Failsafe remove an element from a collection
   *
   * @param  {Array<Object>} [collection]
   * @param  {Object} [element]
   *
   * @return {Number} the previous index of the element
   */
  function remove$2(collection, element) {

    if (!collection || !element) {
      return -1;
    }

    var idx = collection.indexOf(element);

    if (idx !== -1) {
      collection.splice(idx, 1);
    }

    return idx;
  }

  /**
   * Fail save add an element to the given connection, ensuring
   * it does not yet exist.
   *
   * @param {Array<Object>} collection
   * @param {Object} element
   * @param {Number} idx
   */
  function add(collection, element, idx) {

    if (!collection || !element) {
      return;
    }

    if (typeof idx !== 'number') {
      idx = -1;
    }

    var currentIdx = collection.indexOf(element);

    if (currentIdx !== -1) {

      if (currentIdx === idx) {
        // nothing to do, position has not changed
        return;
      } else {

        if (idx !== -1) {
          // remove from current position
          collection.splice(currentIdx, 1);
        } else {
          // already exists in collection
          return;
        }
      }
    }

    if (idx !== -1) {
      // insert at specified position
      collection.splice(idx, 0, element);
    } else {
      // push to end
      collection.push(element);
    }
  }

  function round(number, resolution) {
    return Math.round(number * resolution) / resolution;
  }

  function ensurePx(number) {
    return isNumber(number) ? number + 'px' : number;
  }

  /**
   * Creates a HTML container element for a SVG element with
   * the given configuration
   *
   * @param  {Object} options
   * @return {HTMLElement} the container element
   */
  function createContainer(options) {

    options = assign({}, { width: '100%', height: '100%' }, options);

    var container = options.container || document.body;

    // create a <div> around the svg element with the respective size
    // this way we can always get the correct container size
    // (this is impossible for <svg> elements at the moment)
    var parent = document.createElement('div');
    parent.setAttribute('class', 'djs-container');

    assign(parent.style, {
      position: 'relative',
      overflow: 'hidden',
      width: ensurePx(options.width),
      height: ensurePx(options.height)
    });

    container.appendChild(parent);

    return parent;
  }

  function createGroup(parent, cls, childIndex) {
    var group = create('g');
    classes$1(group).add(cls);

    var index = childIndex !== undefined ? childIndex : parent.childNodes.length - 1;

    // must ensure second argument is node or _null_
    // cf. https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
    parent.insertBefore(group, parent.childNodes[index] || null);

    return group;
  }

  var BASE_LAYER = 'base';


  var REQUIRED_MODEL_ATTRS = {
    shape: [ 'x', 'y', 'width', 'height' ],
    connection: [ 'waypoints' ]
  };

  /**
   * The main drawing canvas.
   *
   * @class
   * @constructor
   *
   * @emits Canvas#canvas.init
   *
   * @param {Object} config
   * @param {EventBus} eventBus
   * @param {GraphicsFactory} graphicsFactory
   * @param {ElementRegistry} elementRegistry
   */
  function Canvas(config, eventBus, graphicsFactory, elementRegistry) {

    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
    this._graphicsFactory = graphicsFactory;

    this._init(config || {});
  }

  Canvas.$inject = [
    'config.canvas',
    'eventBus',
    'graphicsFactory',
    'elementRegistry'
  ];


  Canvas.prototype._init = function(config) {

    var eventBus = this._eventBus;

    // Creates a <svg> element that is wrapped into a <div>.
    // This way we are always able to correctly figure out the size of the svg element
    // by querying the parent node.
    //
    // (It is not possible to get the size of a svg element cross browser @ 2014-04-01)
    //
    // <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
    //   <svg width="100%" height="100%">
    //    ...
    //   </svg>
    // </div>

    // html container
    var container = this._container = createContainer(config);

    var svg = this._svg = create('svg');
    attr$1(svg, { width: '100%', height: '100%' });

    append(container, svg);

    var viewport = this._viewport = createGroup(svg, 'viewport');

    this._layers = {};

    // debounce canvas.viewbox.changed events
    // for smoother diagram interaction
    if (config.deferUpdate !== false) {
      this._viewboxChanged = debounce(bind(this._viewboxChanged, this), 300);
    }

    eventBus.on('diagram.init', function() {

      /**
       * An event indicating that the canvas is ready to be drawn on.
       *
       * @memberOf Canvas
       *
       * @event canvas.init
       *
       * @type {Object}
       * @property {SVGElement} svg the created svg element
       * @property {SVGElement} viewport the direct parent of diagram elements and shapes
       */
      eventBus.fire('canvas.init', {
        svg: svg,
        viewport: viewport
      });

    }, this);

    // reset viewbox on shape changes to
    // recompute the viewbox
    eventBus.on([
      'shape.added',
      'connection.added',
      'shape.removed',
      'connection.removed',
      'elements.changed'
    ], function() {
      delete this._cachedViewbox;
    }, this);

    eventBus.on('diagram.destroy', 500, this._destroy, this);
    eventBus.on('diagram.clear', 500, this._clear, this);
  };

  Canvas.prototype._destroy = function(emit) {
    this._eventBus.fire('canvas.destroy', {
      svg: this._svg,
      viewport: this._viewport
    });

    var parent = this._container.parentNode;

    if (parent) {
      parent.removeChild(this._container);
    }

    delete this._svg;
    delete this._container;
    delete this._layers;
    delete this._rootElement;
    delete this._viewport;
  };

  Canvas.prototype._clear = function() {

    var self = this;

    var allElements = this._elementRegistry.getAll();

    // remove all elements
    allElements.forEach(function(element) {
      var type = getType(element);

      if (type === 'root') {
        self.setRootElement(null, true);
      } else {
        self._removeElement(element, type);
      }
    });

    // force recomputation of view box
    delete this._cachedViewbox;
  };

  /**
   * Returns the default layer on which
   * all elements are drawn.
   *
   * @returns {SVGElement}
   */
  Canvas.prototype.getDefaultLayer = function() {
    return this.getLayer(BASE_LAYER, 0);
  };

  /**
   * Returns a layer that is used to draw elements
   * or annotations on it.
   *
   * Non-existing layers retrieved through this method
   * will be created. During creation, the optional index
   * may be used to create layers below or above existing layers.
   * A layer with a certain index is always created above all
   * existing layers with the same index.
   *
   * @param {String} name
   * @param {Number} index
   *
   * @returns {SVGElement}
   */
  Canvas.prototype.getLayer = function(name, index) {

    if (!name) {
      throw new Error('must specify a name');
    }

    var layer = this._layers[name];

    if (!layer) {
      layer = this._layers[name] = this._createLayer(name, index);
    }

    // throw an error if layer creation / retrival is
    // requested on different index
    if (typeof index !== 'undefined' && layer.index !== index) {
      throw new Error('layer <' + name + '> already created at index <' + index + '>');
    }

    return layer.group;
  };

  /**
   * Creates a given layer and returns it.
   *
   * @param {String} name
   * @param {Number} [index=0]
   *
   * @return {Object} layer descriptor with { index, group: SVGGroup }
   */
  Canvas.prototype._createLayer = function(name, index) {

    if (!index) {
      index = 0;
    }

    var childIndex = reduce(this._layers, function(childIndex, layer) {
      if (index >= layer.index) {
        childIndex++;
      }

      return childIndex;
    }, 0);

    return {
      group: createGroup(this._viewport, 'layer-' + name, childIndex),
      index: index
    };

  };

  /**
   * Returns the html element that encloses the
   * drawing canvas.
   *
   * @return {DOMNode}
   */
  Canvas.prototype.getContainer = function() {
    return this._container;
  };


  // markers //////////////////////

  Canvas.prototype._updateMarker = function(element, marker, add) {
    var container;

    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    // we need to access all
    container = this._elementRegistry._elements[element.id];

    if (!container) {
      return;
    }

    forEach([ container.gfx, container.secondaryGfx ], function(gfx) {
      if (gfx) {
        // invoke either addClass or removeClass based on mode
        if (add) {
          classes$1(gfx).add(marker);
        } else {
          classes$1(gfx).remove(marker);
        }
      }
    });

    /**
     * An event indicating that a marker has been updated for an element
     *
     * @event element.marker.update
     * @type {Object}
     * @property {djs.model.Element} element the shape
     * @property {Object} gfx the graphical representation of the shape
     * @property {String} marker
     * @property {Boolean} add true if the marker was added, false if it got removed
     */
    this._eventBus.fire('element.marker.update', { element: element, gfx: container.gfx, marker: marker, add: !!add });
  };


  /**
   * Adds a marker to an element (basically a css class).
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @example
   * canvas.addMarker('foo', 'some-marker');
   *
   * var fooGfx = canvas.getGraphics('foo');
   *
   * fooGfx; // <g class="... some-marker"> ... </g>
   *
   * @param {String|djs.model.Base} element
   * @param {String} marker
   */
  Canvas.prototype.addMarker = function(element, marker) {
    this._updateMarker(element, marker, true);
  };


  /**
   * Remove a marker from an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param  {String|djs.model.Base} element
   * @param  {String} marker
   */
  Canvas.prototype.removeMarker = function(element, marker) {
    this._updateMarker(element, marker, false);
  };

  /**
   * Check the existence of a marker on element.
   *
   * @param  {String|djs.model.Base} element
   * @param  {String} marker
   */
  Canvas.prototype.hasMarker = function(element, marker) {
    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    var gfx = this.getGraphics(element);

    return classes$1(gfx).has(marker);
  };

  /**
   * Toggles a marker on an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param  {String|djs.model.Base} element
   * @param  {String} marker
   */
  Canvas.prototype.toggleMarker = function(element, marker) {
    if (this.hasMarker(element, marker)) {
      this.removeMarker(element, marker);
    } else {
      this.addMarker(element, marker);
    }
  };

  Canvas.prototype.getRootElement = function() {
    if (!this._rootElement) {
      this.setRootElement({ id: '__implicitroot', children: [] });
    }

    return this._rootElement;
  };



  // root element handling //////////////////////

  /**
   * Sets a given element as the new root element for the canvas
   * and returns the new root element.
   *
   * @param {Object|djs.model.Root} element
   * @param {Boolean} [override] whether to override the current root element, if any
   *
   * @return {Object|djs.model.Root} new root element
   */
  Canvas.prototype.setRootElement = function(element, override) {

    if (element) {
      this._ensureValid('root', element);
    }

    var currentRoot = this._rootElement,
        elementRegistry = this._elementRegistry,
        eventBus = this._eventBus;

    if (currentRoot) {
      if (!override) {
        throw new Error('rootElement already set, need to specify override');
      }

      // simulate element remove event sequence
      eventBus.fire('root.remove', { element: currentRoot });
      eventBus.fire('root.removed', { element: currentRoot });

      elementRegistry.remove(currentRoot);
    }

    if (element) {
      var gfx = this.getDefaultLayer();

      // resemble element add event sequence
      eventBus.fire('root.add', { element: element });

      elementRegistry.add(element, gfx, this._svg);

      eventBus.fire('root.added', { element: element, gfx: gfx });
    }

    this._rootElement = element;

    return element;
  };



  // add functionality //////////////////////

  Canvas.prototype._ensureValid = function(type, element) {
    if (!element.id) {
      throw new Error('element must have an id');
    }

    if (this._elementRegistry.get(element.id)) {
      throw new Error('element with id ' + element.id + ' already exists');
    }

    var requiredAttrs = REQUIRED_MODEL_ATTRS[type];

    var valid = every(requiredAttrs, function(attr) {
      return typeof element[attr] !== 'undefined';
    });

    if (!valid) {
      throw new Error(
        'must supply { ' + requiredAttrs.join(', ') + ' } with ' + type);
    }
  };

  Canvas.prototype._setParent = function(element, parent, parentIndex) {
    add(parent.children, element, parentIndex);
    element.parent = parent;
  };

  /**
   * Adds an element to the canvas.
   *
   * This wires the parent <-> child relationship between the element and
   * a explicitly specified parent or an implicit root element.
   *
   * During add it emits the events
   *
   *  * <{type}.add> (element, parent)
   *  * <{type}.added> (element, gfx)
   *
   * Extensions may hook into these events to perform their magic.
   *
   * @param {String} type
   * @param {Object|djs.model.Base} element
   * @param {Object|djs.model.Base} [parent]
   * @param {Number} [parentIndex]
   *
   * @return {Object|djs.model.Base} the added element
   */
  Canvas.prototype._addElement = function(type, element, parent, parentIndex) {

    parent = parent || this.getRootElement();

    var eventBus = this._eventBus,
        graphicsFactory = this._graphicsFactory;

    this._ensureValid(type, element);

    eventBus.fire(type + '.add', { element: element, parent: parent });

    this._setParent(element, parent, parentIndex);

    // create graphics
    var gfx = graphicsFactory.create(type, element, parentIndex);

    this._elementRegistry.add(element, gfx);

    // update its visual
    graphicsFactory.update(type, element, gfx);

    eventBus.fire(type + '.added', { element: element, gfx: gfx });

    return element;
  };

  /**
   * Adds a shape to the canvas
   *
   * @param {Object|djs.model.Shape} shape to add to the diagram
   * @param {djs.model.Base} [parent]
   * @param {Number} [parentIndex]
   *
   * @return {djs.model.Shape} the added shape
   */
  Canvas.prototype.addShape = function(shape, parent, parentIndex) {
    return this._addElement('shape', shape, parent, parentIndex);
  };

  /**
   * Adds a connection to the canvas
   *
   * @param {Object|djs.model.Connection} connection to add to the diagram
   * @param {djs.model.Base} [parent]
   * @param {Number} [parentIndex]
   *
   * @return {djs.model.Connection} the added connection
   */
  Canvas.prototype.addConnection = function(connection, parent, parentIndex) {
    return this._addElement('connection', connection, parent, parentIndex);
  };


  /**
   * Internal remove element
   */
  Canvas.prototype._removeElement = function(element, type) {

    var elementRegistry = this._elementRegistry,
        graphicsFactory = this._graphicsFactory,
        eventBus = this._eventBus;

    element = elementRegistry.get(element.id || element);

    if (!element) {
      // element was removed already
      return;
    }

    eventBus.fire(type + '.remove', { element: element });

    graphicsFactory.remove(element);

    // unset parent <-> child relationship
    remove$2(element.parent && element.parent.children, element);
    element.parent = null;

    eventBus.fire(type + '.removed', { element: element });

    elementRegistry.remove(element);

    return element;
  };


  /**
   * Removes a shape from the canvas
   *
   * @param {String|djs.model.Shape} shape or shape id to be removed
   *
   * @return {djs.model.Shape} the removed shape
   */
  Canvas.prototype.removeShape = function(shape) {

    /**
     * An event indicating that a shape is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.remove
     * @type {Object}
     * @property {djs.model.Shape} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */

    /**
     * An event indicating that a shape has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.removed
     * @type {Object}
     * @property {djs.model.Shape} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */
    return this._removeElement(shape, 'shape');
  };


  /**
   * Removes a connection from the canvas
   *
   * @param {String|djs.model.Connection} connection or connection id to be removed
   *
   * @return {djs.model.Connection} the removed connection
   */
  Canvas.prototype.removeConnection = function(connection) {

    /**
     * An event indicating that a connection is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event connection.remove
     * @type {Object}
     * @property {djs.model.Connection} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */

    /**
     * An event indicating that a connection has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event connection.removed
     * @type {Object}
     * @property {djs.model.Connection} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */
    return this._removeElement(connection, 'connection');
  };


  /**
   * Return the graphical object underlaying a certain diagram element
   *
   * @param {String|djs.model.Base} element descriptor of the element
   * @param {Boolean} [secondary=false] whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
  Canvas.prototype.getGraphics = function(element, secondary) {
    return this._elementRegistry.getGraphics(element, secondary);
  };


  /**
   * Perform a viewbox update via a given change function.
   *
   * @param {Function} changeFn
   */
  Canvas.prototype._changeViewbox = function(changeFn) {

    // notify others of the upcoming viewbox change
    this._eventBus.fire('canvas.viewbox.changing');

    // perform actual change
    changeFn.apply(this);

    // reset the cached viewbox so that
    // a new get operation on viewbox or zoom
    // triggers a viewbox re-computation
    this._cachedViewbox = null;

    // notify others of the change; this step
    // may or may not be debounced
    this._viewboxChanged();
  };

  Canvas.prototype._viewboxChanged = function() {
    this._eventBus.fire('canvas.viewbox.changed', { viewbox: this.viewbox() });
  };


  /**
   * Gets or sets the view box of the canvas, i.e. the
   * area that is currently displayed.
   *
   * The getter may return a cached viewbox (if it is currently
   * changing). To force a recomputation, pass `false` as the first argument.
   *
   * @example
   *
   * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
   *
   * // sets the visible area of the diagram to (100|100) -> (600|100)
   * // and and scales it according to the diagram width
   *
   * var viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
   *
   * console.log(viewbox);
   * // {
   * //   inner: Dimensions,
   * //   outer: Dimensions,
   * //   scale,
   * //   x, y,
   * //   width, height
   * // }
   *
   * // if the current diagram is zoomed and scrolled, you may reset it to the
   * // default zoom via this method, too:
   *
   * var zoomedAndScrolledViewbox = canvas.viewbox();
   *
   * canvas.viewbox({
   *   x: 0,
   *   y: 0,
   *   width: zoomedAndScrolledViewbox.outer.width,
   *   height: zoomedAndScrolledViewbox.outer.height
   * });
   *
   * @param  {Object} [box] the new view box to set
   * @param  {Number} box.x the top left X coordinate of the canvas visible in view box
   * @param  {Number} box.y the top left Y coordinate of the canvas visible in view box
   * @param  {Number} box.width the visible width
   * @param  {Number} box.height
   *
   * @return {Object} the current view box
   */
  Canvas.prototype.viewbox = function(box) {

    if (box === undefined && this._cachedViewbox) {
      return this._cachedViewbox;
    }

    var viewport = this._viewport,
        innerBox,
        outerBox = this.getSize(),
        matrix,
        transform$1,
        scale,
        x, y;

    if (!box) {
      // compute the inner box based on the
      // diagrams default layer. This allows us to exclude
      // external components, such as overlays
      innerBox = this.getDefaultLayer().getBBox();

      transform$1 = transform(viewport);
      matrix = transform$1 ? transform$1.matrix : createMatrix();
      scale = round(matrix.a, 1000);

      x = round(-matrix.e || 0, 1000);
      y = round(-matrix.f || 0, 1000);

      box = this._cachedViewbox = {
        x: x ? x / scale : 0,
        y: y ? y / scale : 0,
        width: outerBox.width / scale,
        height: outerBox.height / scale,
        scale: scale,
        inner: {
          width: innerBox.width,
          height: innerBox.height,
          x: innerBox.x,
          y: innerBox.y
        },
        outer: outerBox
      };

      return box;
    } else {

      this._changeViewbox(function() {
        scale = Math.min(outerBox.width / box.width, outerBox.height / box.height);

        var matrix = this._svg.createSVGMatrix()
          .scale(scale)
          .translate(-box.x, -box.y);

        transform(viewport, matrix);
      });
    }

    return box;
  };


  /**
   * Gets or sets the scroll of the canvas.
   *
   * @param {Object} [delta] the new scroll to apply.
   *
   * @param {Number} [delta.dx]
   * @param {Number} [delta.dy]
   */
  Canvas.prototype.scroll = function(delta) {

    var node = this._viewport;
    var matrix = node.getCTM();

    if (delta) {
      this._changeViewbox(function() {
        delta = assign({ dx: 0, dy: 0 }, delta || {});

        matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix);

        setCTM(node, matrix);
      });
    }

    return { x: matrix.e, y: matrix.f };
  };


  /**
   * Gets or sets the current zoom of the canvas, optionally zooming
   * to the specified position.
   *
   * The getter may return a cached zoom level. Call it with `false` as
   * the first argument to force recomputation of the current level.
   *
   * @param {String|Number} [newScale] the new zoom level, either a number, i.e. 0.9,
   *                                   or `fit-viewport` to adjust the size to fit the current viewport
   * @param {String|Point} [center] the reference point { x: .., y: ..} to zoom to, 'auto' to zoom into mid or null
   *
   * @return {Number} the current scale
   */
  Canvas.prototype.zoom = function(newScale, center) {

    if (!newScale) {
      return this.viewbox(newScale).scale;
    }

    if (newScale === 'fit-viewport') {
      return this._fitViewport(center);
    }

    var outer,
        matrix;

    this._changeViewbox(function() {

      if (typeof center !== 'object') {
        outer = this.viewbox().outer;

        center = {
          x: outer.width / 2,
          y: outer.height / 2
        };
      }

      matrix = this._setZoom(newScale, center);
    });

    return round(matrix.a, 1000);
  };

  function setCTM(node, m) {
    var mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')';
    node.setAttribute('transform', mstr);
  }

  Canvas.prototype._fitViewport = function(center) {

    var vbox = this.viewbox(),
        outer = vbox.outer,
        inner = vbox.inner,
        newScale,
        newViewbox;

    // display the complete diagram without zooming in.
    // instead of relying on internal zoom, we perform a
    // hard reset on the canvas viewbox to realize this
    //
    // if diagram does not need to be zoomed in, we focus it around
    // the diagram origin instead

    if (inner.x >= 0 &&
        inner.y >= 0 &&
        inner.x + inner.width <= outer.width &&
        inner.y + inner.height <= outer.height &&
        !center) {

      newViewbox = {
        x: 0,
        y: 0,
        width: Math.max(inner.width + inner.x, outer.width),
        height: Math.max(inner.height + inner.y, outer.height)
      };
    } else {

      newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height);
      newViewbox = {
        x: inner.x + (center ? inner.width / 2 - outer.width / newScale / 2 : 0),
        y: inner.y + (center ? inner.height / 2 - outer.height / newScale / 2 : 0),
        width: outer.width / newScale,
        height: outer.height / newScale
      };
    }

    this.viewbox(newViewbox);

    return this.viewbox(false).scale;
  };


  Canvas.prototype._setZoom = function(scale, center) {

    var svg = this._svg,
        viewport = this._viewport;

    var matrix = svg.createSVGMatrix();
    var point = svg.createSVGPoint();

    var centerPoint,
        originalPoint,
        currentMatrix,
        scaleMatrix,
        newMatrix;

    currentMatrix = viewport.getCTM();

    var currentScale = currentMatrix.a;

    if (center) {
      centerPoint = assign(point, center);

      // revert applied viewport transformations
      originalPoint = centerPoint.matrixTransform(currentMatrix.inverse());

      // create scale matrix
      scaleMatrix = matrix
        .translate(originalPoint.x, originalPoint.y)
        .scale(1 / currentScale * scale)
        .translate(-originalPoint.x, -originalPoint.y);

      newMatrix = currentMatrix.multiply(scaleMatrix);
    } else {
      newMatrix = matrix.scale(scale);
    }

    setCTM(this._viewport, newMatrix);

    return newMatrix;
  };


  /**
   * Returns the size of the canvas
   *
   * @return {Dimensions}
   */
  Canvas.prototype.getSize = function() {
    return {
      width: this._container.clientWidth,
      height: this._container.clientHeight
    };
  };


  /**
   * Return the absolute bounding box for the given element
   *
   * The absolute bounding box may be used to display overlays in the
   * callers (browser) coordinate system rather than the zoomed in/out
   * canvas coordinates.
   *
   * @param  {ElementDescriptor} element
   * @return {Bounds} the absolute bounding box
   */
  Canvas.prototype.getAbsoluteBBox = function(element) {
    var vbox = this.viewbox();
    var bbox;

    // connection
    // use svg bbox
    if (element.waypoints) {
      var gfx = this.getGraphics(element);

      bbox = gfx.getBBox();
    }
    // shapes
    // use data
    else {
      bbox = element;
    }

    var x = bbox.x * vbox.scale - vbox.x * vbox.scale;
    var y = bbox.y * vbox.scale - vbox.y * vbox.scale;

    var width = bbox.width * vbox.scale;
    var height = bbox.height * vbox.scale;

    return {
      x: x,
      y: y,
      width: width,
      height: height
    };
  };

  /**
   * Fires an event in order other modules can react to the
   * canvas resizing
   */
  Canvas.prototype.resized = function() {

    // force recomputation of view box
    delete this._cachedViewbox;

    this._eventBus.fire('canvas.resized');
  };

  var ELEMENT_ID = 'data-element-id';


  /**
   * @class
   *
   * A registry that keeps track of all shapes in the diagram.
   */
  function ElementRegistry(eventBus) {
    this._elements = {};

    this._eventBus = eventBus;
  }

  ElementRegistry.$inject = [ 'eventBus' ];

  /**
   * Register a pair of (element, gfx, (secondaryGfx)).
   *
   * @param {djs.model.Base} element
   * @param {SVGElement} gfx
   * @param {SVGElement} [secondaryGfx] optional other element to register, too
   */
  ElementRegistry.prototype.add = function(element, gfx, secondaryGfx) {

    var id = element.id;

    this._validateId(id);

    // associate dom node with element
    attr$1(gfx, ELEMENT_ID, id);

    if (secondaryGfx) {
      attr$1(secondaryGfx, ELEMENT_ID, id);
    }

    this._elements[id] = { element: element, gfx: gfx, secondaryGfx: secondaryGfx };
  };

  /**
   * Removes an element from the registry.
   *
   * @param {djs.model.Base} element
   */
  ElementRegistry.prototype.remove = function(element) {
    var elements = this._elements,
        id = element.id || element,
        container = id && elements[id];

    if (container) {

      // unset element id on gfx
      attr$1(container.gfx, ELEMENT_ID, '');

      if (container.secondaryGfx) {
        attr$1(container.secondaryGfx, ELEMENT_ID, '');
      }

      delete elements[id];
    }
  };

  /**
   * Update the id of an element
   *
   * @param {djs.model.Base} element
   * @param {String} newId
   */
  ElementRegistry.prototype.updateId = function(element, newId) {

    this._validateId(newId);

    if (typeof element === 'string') {
      element = this.get(element);
    }

    this._eventBus.fire('element.updateId', {
      element: element,
      newId: newId
    });

    var gfx = this.getGraphics(element),
        secondaryGfx = this.getGraphics(element, true);

    this.remove(element);

    element.id = newId;

    this.add(element, gfx, secondaryGfx);
  };

  /**
   * Return the model element for a given id or graphics.
   *
   * @example
   *
   * elementRegistry.get('SomeElementId_1');
   * elementRegistry.get(gfx);
   *
   *
   * @param {String|SVGElement} filter for selecting the element
   *
   * @return {djs.model.Base}
   */
  ElementRegistry.prototype.get = function(filter) {
    var id;

    if (typeof filter === 'string') {
      id = filter;
    } else {
      id = filter && attr$1(filter, ELEMENT_ID);
    }

    var container = this._elements[id];
    return container && container.element;
  };

  /**
   * Return all elements that match a given filter function.
   *
   * @param {Function} fn
   *
   * @return {Array<djs.model.Base>}
   */
  ElementRegistry.prototype.filter = function(fn) {

    var filtered = [];

    this.forEach(function(element, gfx) {
      if (fn(element, gfx)) {
        filtered.push(element);
      }
    });

    return filtered;
  };

  /**
   * Return all rendered model elements.
   *
   * @return {Array<djs.model.Base>}
   */
  ElementRegistry.prototype.getAll = function() {
    return this.filter(function(e) { return e; });
  };

  /**
   * Iterate over all diagram elements.
   *
   * @param {Function} fn
   */
  ElementRegistry.prototype.forEach = function(fn) {

    var map = this._elements;

    Object.keys(map).forEach(function(id) {
      var container = map[id],
          element = container.element,
          gfx = container.gfx;

      return fn(element, gfx);
    });
  };

  /**
   * Return the graphical representation of an element or its id.
   *
   * @example
   * elementRegistry.getGraphics('SomeElementId_1');
   * elementRegistry.getGraphics(rootElement); // <g ...>
   *
   * elementRegistry.getGraphics(rootElement, true); // <svg ...>
   *
   *
   * @param {String|djs.model.Base} filter
   * @param {Boolean} [secondary=false] whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
  ElementRegistry.prototype.getGraphics = function(filter, secondary) {
    var id = filter.id || filter;

    var container = this._elements[id];
    return container && (secondary ? container.secondaryGfx : container.gfx);
  };

  /**
   * Validate the suitability of the given id and signals a problem
   * with an exception.
   *
   * @param {String} id
   *
   * @throws {Error} if id is empty or already assigned
   */
  ElementRegistry.prototype._validateId = function(id) {
    if (!id) {
      throw new Error('element must have an id');
    }

    if (this._elements[id]) {
      throw new Error('element with id ' + id + ' already added');
    }
  };

  /**
   * An empty collection stub. Use {@link RefsCollection.extend} to extend a
   * collection with ref semantics.
   *
   * @class RefsCollection
   */

  /**
   * Extends a collection with {@link Refs} aware methods
   *
   * @memberof RefsCollection
   * @static
   *
   * @param  {Array<Object>} collection
   * @param  {Refs} refs instance
   * @param  {Object} property represented by the collection
   * @param  {Object} target object the collection is attached to
   *
   * @return {RefsCollection<Object>} the extended array
   */
  function extend$1(collection, refs, property, target) {

    var inverseProperty = property.inverse;

    /**
     * Removes the given element from the array and returns it.
     *
     * @method RefsCollection#remove
     *
     * @param {Object} element the element to remove
     */
    Object.defineProperty(collection, 'remove', {
      value: function(element) {
        var idx = this.indexOf(element);
        if (idx !== -1) {
          this.splice(idx, 1);

          // unset inverse
          refs.unset(element, inverseProperty, target);
        }

        return element;
      }
    });

    /**
     * Returns true if the collection contains the given element
     *
     * @method RefsCollection#contains
     *
     * @param {Object} element the element to check for
     */
    Object.defineProperty(collection, 'contains', {
      value: function(element) {
        return this.indexOf(element) !== -1;
      }
    });

    /**
     * Adds an element to the array, unless it exists already (set semantics).
     *
     * @method RefsCollection#add
     *
     * @param {Object} element the element to add
     * @param {Number} optional index to add element to
     *                 (possibly moving other elements around)
     */
    Object.defineProperty(collection, 'add', {
      value: function(element, idx) {

        var currentIdx = this.indexOf(element);

        if (typeof idx === 'undefined') {

          if (currentIdx !== -1) {
            // element already in collection (!)
            return;
          }

          // add to end of array, as no idx is specified
          idx = this.length;
        }

        // handle already in collection
        if (currentIdx !== -1) {

          // remove element from currentIdx
          this.splice(currentIdx, 1);
        }

        // add element at idx
        this.splice(idx, 0, element);

        if (currentIdx === -1) {
          // set inverse, unless element was
          // in collection already
          refs.set(element, inverseProperty, target);
        }
      }
    });

    // a simple marker, identifying this element
    // as being a refs collection
    Object.defineProperty(collection, '__refs_collection', {
      value: true
    });

    return collection;
  }


  function isExtended(collection) {
    return collection.__refs_collection === true;
  }

  var extend_1 = extend$1;

  var isExtended_1 = isExtended;

  var collection = {
  	extend: extend_1,
  	isExtended: isExtended_1
  };

  function hasOwnProperty(e, property) {
    return Object.prototype.hasOwnProperty.call(e, property.name || property);
  }

  function defineCollectionProperty(ref, property, target) {

    var collection$1 = collection.extend(target[property.name] || [], ref, property, target);

    Object.defineProperty(target, property.name, {
      enumerable: property.enumerable,
      value: collection$1
    });

    if (collection$1.length) {

      collection$1.forEach(function(o) {
        ref.set(o, property.inverse, target);
      });
    }
  }


  function defineProperty(ref, property, target) {

    var inverseProperty = property.inverse;

    var _value = target[property.name];

    Object.defineProperty(target, property.name, {
      configurable: property.configurable,
      enumerable: property.enumerable,

      get: function() {
        return _value;
      },

      set: function(value) {

        // return if we already performed all changes
        if (value === _value) {
          return;
        }

        var old = _value;

        // temporary set null
        _value = null;

        if (old) {
          ref.unset(old, inverseProperty, target);
        }

        // set new value
        _value = value;

        // set inverse value
        ref.set(_value, inverseProperty, target);
      }
    });

  }

  /**
   * Creates a new references object defining two inversly related
   * attribute descriptors a and b.
   *
   * <p>
   *   When bound to an object using {@link Refs#bind} the references
   *   get activated and ensure that add and remove operations are applied
   *   reversely, too.
   * </p>
   *
   * <p>
   *   For attributes represented as collections {@link Refs} provides the
   *   {@link RefsCollection#add}, {@link RefsCollection#remove} and {@link RefsCollection#contains} extensions
   *   that must be used to properly hook into the inverse change mechanism.
   * </p>
   *
   * @class Refs
   *
   * @classdesc A bi-directional reference between two attributes.
   *
   * @param {Refs.AttributeDescriptor} a property descriptor
   * @param {Refs.AttributeDescriptor} b property descriptor
   *
   * @example
   *
   * var refs = Refs({ name: 'wheels', collection: true, enumerable: true }, { name: 'car' });
   *
   * var car = { name: 'toyota' };
   * var wheels = [{ pos: 'front-left' }, { pos: 'front-right' }];
   *
   * refs.bind(car, 'wheels');
   *
   * car.wheels // []
   * car.wheels.add(wheels[0]);
   * car.wheels.add(wheels[1]);
   *
   * car.wheels // [{ pos: 'front-left' }, { pos: 'front-right' }]
   *
   * wheels[0].car // { name: 'toyota' };
   * car.wheels.remove(wheels[0]);
   *
   * wheels[0].car // undefined
   */
  function Refs(a, b) {

    if (!(this instanceof Refs)) {
      return new Refs(a, b);
    }

    // link
    a.inverse = b;
    b.inverse = a;

    this.props = {};
    this.props[a.name] = a;
    this.props[b.name] = b;
  }

  /**
   * Binds one side of a bi-directional reference to a
   * target object.
   *
   * @memberOf Refs
   *
   * @param  {Object} target
   * @param  {String} property
   */
  Refs.prototype.bind = function(target, property) {
    if (typeof property === 'string') {
      if (!this.props[property]) {
        throw new Error('no property <' + property + '> in ref');
      }
      property = this.props[property];
    }

    if (property.collection) {
      defineCollectionProperty(this, property, target);
    } else {
      defineProperty(this, property, target);
    }
  };

  Refs.prototype.ensureRefsCollection = function(target, property) {

    var collection$1 = target[property.name];

    if (!collection.isExtended(collection$1)) {
      defineCollectionProperty(this, property, target);
    }

    return collection$1;
  };

  Refs.prototype.ensureBound = function(target, property) {
    if (!hasOwnProperty(target, property)) {
      this.bind(target, property);
    }
  };

  Refs.prototype.unset = function(target, property, value) {

    if (target) {
      this.ensureBound(target, property);

      if (property.collection) {
        this.ensureRefsCollection(target, property).remove(value);
      } else {
        target[property.name] = undefined;
      }
    }
  };

  Refs.prototype.set = function(target, property, value) {

    if (target) {
      this.ensureBound(target, property);

      if (property.collection) {
        this.ensureRefsCollection(target, property).add(value);
      } else {
        target[property.name] = value;
      }
    }
  };

  var refs = Refs;

  var objectRefs = refs;

  var Collection = collection;
  objectRefs.Collection = Collection;

  var parentRefs = new objectRefs({ name: 'children', enumerable: true, collection: true }, { name: 'parent' }),
      labelRefs = new objectRefs({ name: 'labels', enumerable: true, collection: true }, { name: 'labelTarget' }),
      attacherRefs = new objectRefs({ name: 'attachers', collection: true }, { name: 'host' }),
      outgoingRefs = new objectRefs({ name: 'outgoing', collection: true }, { name: 'source' }),
      incomingRefs = new objectRefs({ name: 'incoming', collection: true }, { name: 'target' });

  /**
   * @namespace djs.model
   */

  /**
   * @memberOf djs.model
   */

  /**
   * The basic graphical representation
   *
   * @class
   *
   * @abstract
   */
  function Base() {

    /**
     * The object that backs up the shape
     *
     * @name Base#businessObject
     * @type Object
     */
    Object.defineProperty(this, 'businessObject', {
      writable: true
    });


    /**
     * Single label support, will mapped to multi label array
     *
     * @name Base#label
     * @type Object
     */
    Object.defineProperty(this, 'label', {
      get: function() {
        return this.labels[0];
      },
      set: function(newLabel) {

        var label = this.label,
            labels = this.labels;

        if (!newLabel && label) {
          labels.remove(label);
        } else {
          labels.add(newLabel, 0);
        }
      }
    });

    /**
     * The parent shape
     *
     * @name Base#parent
     * @type Shape
     */
    parentRefs.bind(this, 'parent');

    /**
     * The list of labels
     *
     * @name Base#labels
     * @type Label
     */
    labelRefs.bind(this, 'labels');

    /**
     * The list of outgoing connections
     *
     * @name Base#outgoing
     * @type Array<Connection>
     */
    outgoingRefs.bind(this, 'outgoing');

    /**
     * The list of incoming connections
     *
     * @name Base#incoming
     * @type Array<Connection>
     */
    incomingRefs.bind(this, 'incoming');
  }


  /**
   * A graphical object
   *
   * @class
   * @constructor
   *
   * @extends Base
   */
  function Shape() {
    Base.call(this);

    /**
     * Indicates frame shapes
     *
     * @name Shape#isFrame
     * @type Boolean
     */

    /**
     * The list of children
     *
     * @name Shape#children
     * @type Array<Base>
     */
    parentRefs.bind(this, 'children');

    /**
     * @name Shape#host
     * @type Shape
     */
    attacherRefs.bind(this, 'host');

    /**
     * @name Shape#attachers
     * @type Shape
     */
    attacherRefs.bind(this, 'attachers');
  }

  inherits_browser(Shape, Base);


  /**
   * A root graphical object
   *
   * @class
   * @constructor
   *
   * @extends Shape
   */
  function Root() {
    Shape.call(this);
  }

  inherits_browser(Root, Shape);


  /**
   * A label for an element
   *
   * @class
   * @constructor
   *
   * @extends Shape
   */
  function Label() {
    Shape.call(this);

    /**
     * The labeled element
     *
     * @name Label#labelTarget
     * @type Base
     */
    labelRefs.bind(this, 'labelTarget');
  }

  inherits_browser(Label, Shape);


  /**
   * A connection between two elements
   *
   * @class
   * @constructor
   *
   * @extends Base
   */
  function Connection() {
    Base.call(this);

    /**
     * The element this connection originates from
     *
     * @name Connection#source
     * @type Base
     */
    outgoingRefs.bind(this, 'source');

    /**
     * The element this connection points to
     *
     * @name Connection#target
     * @type Base
     */
    incomingRefs.bind(this, 'target');
  }

  inherits_browser(Connection, Base);


  var types = {
    connection: Connection,
    shape: Shape,
    label: Label,
    root: Root
  };

  /**
   * Creates a new model element of the specified type
   *
   * @method create
   *
   * @example
   *
   * var shape1 = Model.create('shape', { x: 10, y: 10, width: 100, height: 100 });
   * var shape2 = Model.create('shape', { x: 210, y: 210, width: 100, height: 100 });
   *
   * var connection = Model.create('connection', { waypoints: [ { x: 110, y: 55 }, {x: 210, y: 55 } ] });
   *
   * @param  {String} type lower-cased model name
   * @param  {Object} attrs attributes to initialize the new model instance with
   *
   * @return {Base} the new model instance
   */
  function create$1(type, attrs) {
    var Type = types[type];
    if (!Type) {
      throw new Error('unknown type: <' + type + '>');
    }
    return assign(new Type(), attrs);
  }

  /**
   * A factory for diagram-js shapes
   */
  function ElementFactory() {
    this._uid = 12;
  }


  ElementFactory.prototype.createRoot = function(attrs) {
    return this.create('root', attrs);
  };

  ElementFactory.prototype.createLabel = function(attrs) {
    return this.create('label', attrs);
  };

  ElementFactory.prototype.createShape = function(attrs) {
    return this.create('shape', attrs);
  };

  ElementFactory.prototype.createConnection = function(attrs) {
    return this.create('connection', attrs);
  };

  /**
   * Create a model element with the given type and
   * a number of pre-set attributes.
   *
   * @param  {String} type
   * @param  {Object} attrs
   * @return {djs.model.Base} the newly created model instance
   */
  ElementFactory.prototype.create = function(type, attrs) {

    attrs = assign({}, attrs || {});

    if (!attrs.id) {
      attrs.id = type + '_' + (this._uid++);
    }

    return create$1(type, attrs);
  };

  var FN_REF = '__fn';

  var DEFAULT_PRIORITY = 1000;

  var slice$1 = Array.prototype.slice;

  /**
   * A general purpose event bus.
   *
   * This component is used to communicate across a diagram instance.
   * Other parts of a diagram can use it to listen to and broadcast events.
   *
   *
   * ## Registering for Events
   *
   * The event bus provides the {@link EventBus#on} and {@link EventBus#once}
   * methods to register for events. {@link EventBus#off} can be used to
   * remove event registrations. Listeners receive an instance of {@link Event}
   * as the first argument. It allows them to hook into the event execution.
   *
   * ```javascript
   *
   * // listen for event
   * eventBus.on('foo', function(event) {
   *
   *   // access event type
   *   event.type; // 'foo'
   *
   *   // stop propagation to other listeners
   *   event.stopPropagation();
   *
   *   // prevent event default
   *   event.preventDefault();
   * });
   *
   * // listen for event with custom payload
   * eventBus.on('bar', function(event, payload) {
   *   console.log(payload);
   * });
   *
   * // listen for event returning value
   * eventBus.on('foobar', function(event) {
   *
   *   // stop event propagation + prevent default
   *   return false;
   *
   *   // stop event propagation + return custom result
   *   return {
   *     complex: 'listening result'
   *   };
   * });
   *
   *
   * // listen with custom priority (default=1000, higher is better)
   * eventBus.on('priorityfoo', 1500, function(event) {
   *   console.log('invoked first!');
   * });
   *
   *
   * // listen for event and pass the context (`this`)
   * eventBus.on('foobar', function(event) {
   *   this.foo();
   * }, this);
   * ```
   *
   *
   * ## Emitting Events
   *
   * Events can be emitted via the event bus using {@link EventBus#fire}.
   *
   * ```javascript
   *
   * // false indicates that the default action
   * // was prevented by listeners
   * if (eventBus.fire('foo') === false) {
   *   console.log('default has been prevented!');
   * };
   *
   *
   * // custom args + return value listener
   * eventBus.on('sum', function(event, a, b) {
   *   return a + b;
   * });
   *
   * // you can pass custom arguments + retrieve result values.
   * var sum = eventBus.fire('sum', 1, 2);
   * console.log(sum); // 3
   * ```
   */
  function EventBus() {
    this._listeners = {};

    // cleanup on destroy on lowest priority to allow
    // message passing until the bitter end
    this.on('diagram.destroy', 1, this._destroy, this);
  }


  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @param {String|Array<String>} events
   * @param {Number} [priority=1000] the priority in which this listener is called, larger is higher
   * @param {Function} callback
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  EventBus.prototype.on = function(events, priority, callback, that) {

    events = isArray(events) ? events : [ events ];

    if (isFunction(priority)) {
      that = callback;
      callback = priority;
      priority = DEFAULT_PRIORITY;
    }

    if (!isNumber(priority)) {
      throw new Error('priority must be a number');
    }

    var actualCallback = callback;

    if (that) {
      actualCallback = bind(callback, that);

      // make sure we remember and are able to remove
      // bound callbacks via {@link #off} using the original
      // callback
      actualCallback[FN_REF] = callback[FN_REF] || callback;
    }

    var self = this;

    events.forEach(function(e) {
      self._addListener(e, {
        priority: priority,
        callback: actualCallback,
        next: null
      });
    });
  };


  /**
   * Register an event listener that is executed only once.
   *
   * @param {String} event the event name to register for
   * @param {Number} [priority=1000] the priority in which this listener is called, larger is higher
   * @param {Function} callback the callback to execute
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  EventBus.prototype.once = function(event, priority, callback, that) {
    var self = this;

    if (isFunction(priority)) {
      that = callback;
      callback = priority;
      priority = DEFAULT_PRIORITY;
    }

    if (!isNumber(priority)) {
      throw new Error('priority must be a number');
    }

    function wrappedCallback() {
      var result = callback.apply(that, arguments);

      self.off(event, wrappedCallback);

      return result;
    }

    // make sure we remember and are able to remove
    // bound callbacks via {@link #off} using the original
    // callback
    wrappedCallback[FN_REF] = callback;

    this.on(event, priority, wrappedCallback);
  };


  /**
   * Removes event listeners by event and callback.
   *
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @param {String|Array<String>} events
   * @param {Function} [callback]
   */
  EventBus.prototype.off = function(events, callback) {

    events = isArray(events) ? events : [ events ];

    var self = this;

    events.forEach(function(event) {
      self._removeListener(event, callback);
    });

  };


  /**
   * Create an EventBus event.
   *
   * @param {Object} data
   *
   * @return {Object} event, recognized by the eventBus
   */
  EventBus.prototype.createEvent = function(data) {
    var event = new InternalEvent();

    event.init(data);

    return event;
  };


  /**
   * Fires a named event.
   *
   * @example
   *
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   *
   * @param {String} [name] the optional event name
   * @param {Object} [event] the event object
   * @param {...Object} additional arguments to be passed to the callback functions
   *
   * @return {Boolean} the events return value, if specified or false if the
   *                   default action was prevented by listeners
   */
  EventBus.prototype.fire = function(type, data) {

    var event,
        firstListener,
        returnValue,
        args;

    args = slice$1.call(arguments);

    if (typeof type === 'object') {
      event = type;
      type = event.type;
    }

    if (!type) {
      throw new Error('no event type specified');
    }

    firstListener = this._listeners[type];

    if (!firstListener) {
      return;
    }

    // we make sure we fire instances of our home made
    // events here. We wrap them only once, though
    if (data instanceof InternalEvent) {
      // we are fine, we alread have an event
      event = data;
    } else {
      event = this.createEvent(data);
    }

    // ensure we pass the event as the first parameter
    args[0] = event;

    // original event type (in case we delegate)
    var originalType = event.type;

    // update event type before delegation
    if (type !== originalType) {
      event.type = type;
    }

    try {
      returnValue = this._invokeListeners(event, args, firstListener);
    } finally {
      // reset event type after delegation
      if (type !== originalType) {
        event.type = originalType;
      }
    }

    // set the return value to false if the event default
    // got prevented and no other return value exists
    if (returnValue === undefined && event.defaultPrevented) {
      returnValue = false;
    }

    return returnValue;
  };


  EventBus.prototype.handleError = function(error) {
    return this.fire('error', { error: error }) === false;
  };


  EventBus.prototype._destroy = function() {
    this._listeners = {};
  };

  EventBus.prototype._invokeListeners = function(event, args, listener) {

    var returnValue;

    while (listener) {

      // handle stopped propagation
      if (event.cancelBubble) {
        break;
      }

      returnValue = this._invokeListener(event, args, listener);

      listener = listener.next;
    }

    return returnValue;
  };

  EventBus.prototype._invokeListener = function(event, args, listener) {

    var returnValue;

    try {
      // returning false prevents the default action
      returnValue = invokeFunction(listener.callback, args);

      // stop propagation on return value
      if (returnValue !== undefined) {
        event.returnValue = returnValue;
        event.stopPropagation();
      }

      // prevent default on return false
      if (returnValue === false) {
        event.preventDefault();
      }
    } catch (e) {
      if (!this.handleError(e)) {
        console.error('unhandled error in event listener');
        console.error(e.stack);

        throw e;
      }
    }

    return returnValue;
  };

  /*
   * Add new listener with a certain priority to the list
   * of listeners (for the given event).
   *
   * The semantics of listener registration / listener execution are
   * first register, first serve: New listeners will always be inserted
   * after existing listeners with the same priority.
   *
   * Example: Inserting two listeners with priority 1000 and 1300
   *
   *    * before: [ 1500, 1500, 1000, 1000 ]
   *    * after: [ 1500, 1500, (new=1300), 1000, 1000, (new=1000) ]
   *
   * @param {String} event
   * @param {Object} listener { priority, callback }
   */
  EventBus.prototype._addListener = function(event, newListener) {

    var listener = this._getListeners(event),
        previousListener;

    // no prior listeners
    if (!listener) {
      this._setListeners(event, newListener);

      return;
    }

    // ensure we order listeners by priority from
    // 0 (high) to n > 0 (low)
    while (listener) {

      if (listener.priority < newListener.priority) {

        newListener.next = listener;

        if (previousListener) {
          previousListener.next = newListener;
        } else {
          this._setListeners(event, newListener);
        }

        return;
      }

      previousListener = listener;
      listener = listener.next;
    }

    // add new listener to back
    previousListener.next = newListener;
  };


  EventBus.prototype._getListeners = function(name) {
    return this._listeners[name];
  };

  EventBus.prototype._setListeners = function(name, listener) {
    this._listeners[name] = listener;
  };

  EventBus.prototype._removeListener = function(event, callback) {

    var listener = this._getListeners(event),
        nextListener,
        previousListener,
        listenerCallback;

    if (!callback) {
      // clear listeners
      this._setListeners(event, null);

      return;
    }

    while (listener) {

      nextListener = listener.next;

      listenerCallback = listener.callback;

      if (listenerCallback === callback || listenerCallback[FN_REF] === callback) {
        if (previousListener) {
          previousListener.next = nextListener;
        } else {
          // new first listener
          this._setListeners(event, nextListener);
        }
      }

      previousListener = listener;
      listener = nextListener;
    }
  };

  /**
   * A event that is emitted via the event bus.
   */
  function InternalEvent() { }

  InternalEvent.prototype.stopPropagation = function() {
    this.cancelBubble = true;
  };

  InternalEvent.prototype.preventDefault = function() {
    this.defaultPrevented = true;
  };

  InternalEvent.prototype.init = function(data) {
    assign(this, data || {});
  };


  /**
   * Invoke function. Be fast...
   *
   * @param {Function} fn
   * @param {Array<Object>} args
   *
   * @return {Any}
   */
  function invokeFunction(fn, args) {
    return fn.apply(null, args);
  }

  /**
   * SVGs for elements are generated by the {@link GraphicsFactory}.
   *
   * This utility gives quick access to the important semantic
   * parts of an element.
   */

  /**
   * Returns the visual part of a diagram element
   *
   * @param {Snap<SVGElement>} gfx
   *
   * @return {Snap<SVGElement>}
   */
  function getVisual(gfx) {
    return query('.djs-visual', gfx);
  }

  /**
   * Returns the children for a given diagram element.
   *
   * @param {Snap<SVGElement>} gfx
   * @return {Snap<SVGElement>}
   */
  function getChildren(gfx) {
    return gfx.parentNode.childNodes[1];
  }

  /**
   * @param {<SVGElement>} element
   * @param {Number} x
   * @param {Number} y
   * @param {Number} angle
   * @param {Number} amount
   */
  function transform$1(gfx, x, y, angle, amount) {
    var translate = createTransform();
    translate.setTranslate(x, y);

    var rotate = createTransform();
    rotate.setRotate(angle, 0, 0);

    var scale = createTransform();
    scale.setScale(amount || 1, amount || 1);

    transform(gfx, [ translate, rotate, scale ]);
  }


  /**
   * @param {SVGElement} element
   * @param {Number} x
   * @param {Number} y
   */
  function translate(gfx, x, y) {
    var translate = createTransform();
    translate.setTranslate(x, y);

    transform(gfx, translate);
  }


  /**
   * @param {SVGElement} element
   * @param {Number} angle
   */
  function rotate(gfx, angle) {
    var rotate = createTransform();
    rotate.setRotate(angle, 0, 0);

    transform(gfx, rotate);
  }

  /**
   * A factory that creates graphical elements
   *
   * @param {EventBus} eventBus
   * @param {ElementRegistry} elementRegistry
   */
  function GraphicsFactory(eventBus, elementRegistry) {
    this._eventBus = eventBus;
    this._elementRegistry = elementRegistry;
  }

  GraphicsFactory.$inject = [ 'eventBus' , 'elementRegistry' ];


  GraphicsFactory.prototype._getChildren = function(element) {

    var gfx = this._elementRegistry.getGraphics(element);

    var childrenGfx;

    // root element
    if (!element.parent) {
      childrenGfx = gfx;
    } else {
      childrenGfx = getChildren(gfx);
      if (!childrenGfx) {
        childrenGfx = create('g');
        classes$1(childrenGfx).add('djs-children');

        append(gfx.parentNode, childrenGfx);
      }
    }

    return childrenGfx;
  };

  /**
   * Clears the graphical representation of the element and returns the
   * cleared visual (the <g class="djs-visual" /> element).
   */
  GraphicsFactory.prototype._clear = function(gfx) {
    var visual = getVisual(gfx);

    clear(visual);

    return visual;
  };

  /**
   * Creates a gfx container for shapes and connections
   *
   * The layout is as follows:
   *
   * <g class="djs-group">
   *
   *   <!-- the gfx -->
   *   <g class="djs-element djs-(shape|connection|frame)">
   *     <g class="djs-visual">
   *       <!-- the renderer draws in here -->
   *     </g>
   *
   *     <!-- extensions (overlays, click box, ...) goes here
   *   </g>
   *
   *   <!-- the gfx child nodes -->
   *   <g class="djs-children"></g>
   * </g>
   *
   * @param {String} type the type of the element, i.e. shape | connection
   * @param {SVGElement} [childrenGfx]
   * @param {Number} [parentIndex] position to create container in parent
   * @param {Boolean} [isFrame] is frame element
   *
   * @return {SVGElement}
   */
  GraphicsFactory.prototype._createContainer = function(
      type, childrenGfx, parentIndex, isFrame
  ) {
    var outerGfx = create('g');
    classes$1(outerGfx).add('djs-group');

    // insert node at position
    if (typeof parentIndex !== 'undefined') {
      prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex]);
    } else {
      append(childrenGfx, outerGfx);
    }

    var gfx = create('g');
    classes$1(gfx).add('djs-element');
    classes$1(gfx).add('djs-' + type);

    if (isFrame) {
      classes$1(gfx).add('djs-frame');
    }

    append(outerGfx, gfx);

    // create visual
    var visual = create('g');
    classes$1(visual).add('djs-visual');

    append(gfx, visual);

    return gfx;
  };

  GraphicsFactory.prototype.create = function(type, element, parentIndex) {
    var childrenGfx = this._getChildren(element.parent);
    return this._createContainer(type, childrenGfx, parentIndex, isFrameElement(element));
  };

  GraphicsFactory.prototype.updateContainments = function(elements) {

    var self = this,
        elementRegistry = this._elementRegistry,
        parents;

    parents = reduce(elements, function(map, e) {

      if (e.parent) {
        map[e.parent.id] = e.parent;
      }

      return map;
    }, {});

    // update all parents of changed and reorganized their children
    // in the correct order (as indicated in our model)
    forEach(parents, function(parent) {

      var children = parent.children;

      if (!children) {
        return;
      }

      var childGfx = self._getChildren(parent);

      forEach(children.slice().reverse(), function(c) {
        var gfx = elementRegistry.getGraphics(c);

        prependTo(gfx.parentNode, childGfx);
      });
    });
  };

  GraphicsFactory.prototype.drawShape = function(visual, element) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.shape', { gfx: visual, element: element });
  };

  GraphicsFactory.prototype.getShapePath = function(element) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.getShapePath', element);
  };

  GraphicsFactory.prototype.drawConnection = function(visual, element) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.connection', { gfx: visual, element: element });
  };

  GraphicsFactory.prototype.getConnectionPath = function(waypoints) {
    var eventBus = this._eventBus;

    return eventBus.fire('render.getConnectionPath', waypoints);
  };

  GraphicsFactory.prototype.update = function(type, element, gfx) {

    // do NOT update root element
    if (!element.parent) {
      return;
    }

    var visual = this._clear(gfx);

    // redraw
    if (type === 'shape') {
      this.drawShape(visual, element);

      // update positioning
      translate(gfx, element.x, element.y);
    } else
    if (type === 'connection') {
      this.drawConnection(visual, element);
    } else {
      throw new Error('unknown type: ' + type);
    }

    if (element.hidden) {
      attr$1(gfx, 'display', 'none');
    } else {
      attr$1(gfx, 'display', 'block');
    }
  };

  GraphicsFactory.prototype.remove = function(element) {
    var gfx = this._elementRegistry.getGraphics(element);

    // remove
    remove$1(gfx.parentNode);
  };


  // helpers //////////

  function prependTo(newNode, parentNode, siblingNode) {
    var node = siblingNode || parentNode.firstChild;

    // do not prepend node to itself to prevent IE from crashing
    // https://github.com/bpmn-io/bpmn-js/issues/746
    if (newNode === node) {
      return;
    }

    parentNode.insertBefore(newNode, node);
  }

  var CoreModule = {
    __depends__: [ DrawModule ],
    __init__: [ 'canvas' ],
    canvas: [ 'type', Canvas ],
    elementRegistry: [ 'type', ElementRegistry ],
    elementFactory: [ 'type', ElementFactory ],
    eventBus: [ 'type', EventBus ],
    graphicsFactory: [ 'type', GraphicsFactory ]
  };

  /**
   * Bootstrap an injector from a list of modules, instantiating a number of default components
   *
   * @ignore
   * @param {Array<didi.Module>} bootstrapModules
   *
   * @return {didi.Injector} a injector to use to access the components
   */
  function bootstrap(bootstrapModules) {

    var modules = [],
        components = [];

    function hasModule(m) {
      return modules.indexOf(m) >= 0;
    }

    function addModule(m) {
      modules.push(m);
    }

    function visit(m) {
      if (hasModule(m)) {
        return;
      }

      (m.__depends__ || []).forEach(visit);

      if (hasModule(m)) {
        return;
      }

      addModule(m);

      (m.__init__ || []).forEach(function(c) {
        components.push(c);
      });
    }

    bootstrapModules.forEach(visit);

    var injector = new Injector(modules);

    components.forEach(function(c) {

      try {
        // eagerly resolve component (fn or string)
        injector[typeof c === 'string' ? 'get' : 'invoke'](c);
      } catch (e) {
        console.error('Failed to instantiate component');
        console.error(e.stack);

        throw e;
      }
    });

    return injector;
  }

  /**
   * Creates an injector from passed options.
   *
   * @ignore
   * @param  {Object} options
   * @return {didi.Injector}
   */
  function createInjector(options) {

    options = options || {};

    var configModule = {
      'config': ['value', options]
    };

    var modules = [ configModule, CoreModule ].concat(options.modules || []);

    return bootstrap(modules);
  }


  /**
   * The main diagram-js entry point that bootstraps the diagram with the given
   * configuration.
   *
   * To register extensions with the diagram, pass them as Array<didi.Module> to the constructor.
   *
   * @class djs.Diagram
   * @memberOf djs
   * @constructor
   *
   * @example
   *
   * <caption>Creating a plug-in that logs whenever a shape is added to the canvas.</caption>
   *
   * // plug-in implemenentation
   * function MyLoggingPlugin(eventBus) {
   *   eventBus.on('shape.added', function(event) {
   *     console.log('shape ', event.shape, ' was added to the diagram');
   *   });
   * }
   *
   * // export as module
   * export default {
   *   __init__: [ 'myLoggingPlugin' ],
   *     myLoggingPlugin: [ 'type', MyLoggingPlugin ]
   * };
   *
   *
   * // instantiate the diagram with the new plug-in
   *
   * import MyLoggingModule from 'path-to-my-logging-plugin';
   *
   * var diagram = new Diagram({
   *   modules: [
   *     MyLoggingModule
   *   ]
   * });
   *
   * diagram.invoke([ 'canvas', function(canvas) {
   *   // add shape to drawing canvas
   *   canvas.addShape({ x: 10, y: 10 });
   * });
   *
   * // 'shape ... was added to the diagram' logged to console
   *
   * @param {Object} options
   * @param {Array<didi.Module>} [options.modules] external modules to instantiate with the diagram
   * @param {didi.Injector} [injector] an (optional) injector to bootstrap the diagram with
   */
  function Diagram(options, injector) {

    // create injector unless explicitly specified
    this.injector = injector = injector || createInjector(options);

    // API

    /**
     * Resolves a diagram service
     *
     * @method Diagram#get
     *
     * @param {String} name the name of the diagram service to be retrieved
     * @param {Boolean} [strict=true] if false, resolve missing services to null
     */
    this.get = injector.get;

    /**
     * Executes a function into which diagram services are injected
     *
     * @method Diagram#invoke
     *
     * @param {Function|Object[]} fn the function to resolve
     * @param {Object} locals a number of locals to use to resolve certain dependencies
     */
    this.invoke = injector.invoke;

    // init

    // indicate via event


    /**
     * An event indicating that all plug-ins are loaded.
     *
     * Use this event to fire other events to interested plug-ins
     *
     * @memberOf Diagram
     *
     * @event diagram.init
     *
     * @example
     *
     * eventBus.on('diagram.init', function() {
     *   eventBus.fire('my-custom-event', { foo: 'BAR' });
     * });
     *
     * @type {Object}
     */
    this.get('eventBus').fire('diagram.init');
  }


  /**
   * Destroys the diagram
   *
   * @method  Diagram#destroy
   */
  Diagram.prototype.destroy = function() {
    this.get('eventBus').fire('diagram.destroy');
  };

  /**
   * Clear the diagram, removing all contents.
   */
  Diagram.prototype.clear = function() {
    this.get('eventBus').fire('diagram.clear');
  };

  /**
   * Moddle base element.
   */
  function Base$1() { }

  Base$1.prototype.get = function(name) {
    return this.$model.properties.get(this, name);
  };

  Base$1.prototype.set = function(name, value) {
    this.$model.properties.set(this, name, value);
  };

  /**
   * A model element factory.
   *
   * @param {Moddle} model
   * @param {Properties} properties
   */
  function Factory(model, properties) {
    this.model = model;
    this.properties = properties;
  }


  Factory.prototype.createType = function(descriptor) {

    var model = this.model;

    var props = this.properties,
        prototype = Object.create(Base$1.prototype);

    // initialize default values
    forEach(descriptor.properties, function(p) {
      if (!p.isMany && p.default !== undefined) {
        prototype[p.name] = p.default;
      }
    });

    props.defineModel(prototype, model);
    props.defineDescriptor(prototype, descriptor);

    var name = descriptor.ns.name;

    /**
     * The new type constructor
     */
    function ModdleElement(attrs) {
      props.define(this, '$type', { value: name, enumerable: true });
      props.define(this, '$attrs', { value: {} });
      props.define(this, '$parent', { writable: true });

      forEach(attrs, bind(function(val, key) {
        this.set(key, val);
      }, this));
    }

    ModdleElement.prototype = prototype;

    ModdleElement.hasType = prototype.$instanceOf = this.model.hasType;

    // static links
    props.defineModel(ModdleElement, model);
    props.defineDescriptor(ModdleElement, descriptor);

    return ModdleElement;
  };

  /**
   * Built-in moddle types
   */
  var BUILTINS = {
    String: true,
    Boolean: true,
    Integer: true,
    Real: true,
    Element: true
  };

  /**
   * Converters for built in types from string representations
   */
  var TYPE_CONVERTERS = {
    String: function(s) { return s; },
    Boolean: function(s) { return s === 'true'; },
    Integer: function(s) { return parseInt(s, 10); },
    Real: function(s) { return parseFloat(s, 10); }
  };

  /**
   * Convert a type to its real representation
   */
  function coerceType(type, value) {

    var converter = TYPE_CONVERTERS[type];

    if (converter) {
      return converter(value);
    } else {
      return value;
    }
  }

  /**
   * Return whether the given type is built-in
   */
  function isBuiltIn(type) {
    return !!BUILTINS[type];
  }

  /**
   * Return whether the given type is simple
   */
  function isSimple(type) {
    return !!TYPE_CONVERTERS[type];
  }

  /**
   * Parses a namespaced attribute name of the form (ns:)localName to an object,
   * given a default prefix to assume in case no explicit namespace is given.
   *
   * @param {String} name
   * @param {String} [defaultPrefix] the default prefix to take, if none is present.
   *
   * @return {Object} the parsed name
   */
  function parseName(name, defaultPrefix) {
    var parts = name.split(/:/),
        localName, prefix;

    // no prefix (i.e. only local name)
    if (parts.length === 1) {
      localName = name;
      prefix = defaultPrefix;
    } else
    // prefix + local name
    if (parts.length === 2) {
      localName = parts[1];
      prefix = parts[0];
    } else {
      throw new Error('expected <prefix:localName> or <localName>, got ' + name);
    }

    name = (prefix ? prefix + ':' : '') + localName;

    return {
      name: name,
      prefix: prefix,
      localName: localName
    };
  }

  /**
   * A utility to build element descriptors.
   */
  function DescriptorBuilder(nameNs) {
    this.ns = nameNs;
    this.name = nameNs.name;
    this.allTypes = [];
    this.allTypesByName = {};
    this.properties = [];
    this.propertiesByName = {};
  }


  DescriptorBuilder.prototype.build = function() {
    return pick(this, [
      'ns',
      'name',
      'allTypes',
      'allTypesByName',
      'properties',
      'propertiesByName',
      'bodyProperty',
      'idProperty'
    ]);
  };

  /**
   * Add property at given index.
   *
   * @param {Object} p
   * @param {Number} [idx]
   * @param {Boolean} [validate=true]
   */
  DescriptorBuilder.prototype.addProperty = function(p, idx, validate) {

    if (typeof idx === 'boolean') {
      validate = idx;
      idx = undefined;
    }

    this.addNamedProperty(p, validate !== false);

    var properties = this.properties;

    if (idx !== undefined) {
      properties.splice(idx, 0, p);
    } else {
      properties.push(p);
    }
  };


  DescriptorBuilder.prototype.replaceProperty = function(oldProperty, newProperty, replace) {
    var oldNameNs = oldProperty.ns;

    var props = this.properties,
        propertiesByName = this.propertiesByName,
        rename = oldProperty.name !== newProperty.name;

    if (oldProperty.isId) {
      if (!newProperty.isId) {
        throw new Error(
          'property <' + newProperty.ns.name + '> must be id property ' +
          'to refine <' + oldProperty.ns.name + '>');
      }

      this.setIdProperty(newProperty, false);
    }

    if (oldProperty.isBody) {

      if (!newProperty.isBody) {
        throw new Error(
          'property <' + newProperty.ns.name + '> must be body property ' +
          'to refine <' + oldProperty.ns.name + '>');
      }

      // TODO: Check compatibility
      this.setBodyProperty(newProperty, false);
    }

    // validate existence and get location of old property
    var idx = props.indexOf(oldProperty);
    if (idx === -1) {
      throw new Error('property <' + oldNameNs.name + '> not found in property list');
    }

    // remove old property
    props.splice(idx, 1);

    // replacing the named property is intentional
    //
    //  * validate only if this is a "rename" operation
    //  * add at specific index unless we "replace"
    //
    this.addProperty(newProperty, replace ? undefined : idx, rename);

    // make new property available under old name
    propertiesByName[oldNameNs.name] = propertiesByName[oldNameNs.localName] = newProperty;
  };


  DescriptorBuilder.prototype.redefineProperty = function(p, targetPropertyName, replace) {

    var nsPrefix = p.ns.prefix;
    var parts = targetPropertyName.split('#');

    var name = parseName(parts[0], nsPrefix);
    var attrName = parseName(parts[1], name.prefix).name;

    var redefinedProperty = this.propertiesByName[attrName];
    if (!redefinedProperty) {
      throw new Error('refined property <' + attrName + '> not found');
    } else {
      this.replaceProperty(redefinedProperty, p, replace);
    }

    delete p.redefines;
  };

  DescriptorBuilder.prototype.addNamedProperty = function(p, validate) {
    var ns = p.ns,
        propsByName = this.propertiesByName;

    if (validate) {
      this.assertNotDefined(p, ns.name);
      this.assertNotDefined(p, ns.localName);
    }

    propsByName[ns.name] = propsByName[ns.localName] = p;
  };

  DescriptorBuilder.prototype.removeNamedProperty = function(p) {
    var ns = p.ns,
        propsByName = this.propertiesByName;

    delete propsByName[ns.name];
    delete propsByName[ns.localName];
  };

  DescriptorBuilder.prototype.setBodyProperty = function(p, validate) {

    if (validate && this.bodyProperty) {
      throw new Error(
        'body property defined multiple times ' +
        '(<' + this.bodyProperty.ns.name + '>, <' + p.ns.name + '>)');
    }

    this.bodyProperty = p;
  };

  DescriptorBuilder.prototype.setIdProperty = function(p, validate) {

    if (validate && this.idProperty) {
      throw new Error(
        'id property defined multiple times ' +
        '(<' + this.idProperty.ns.name + '>, <' + p.ns.name + '>)');
    }

    this.idProperty = p;
  };

  DescriptorBuilder.prototype.assertNotDefined = function(p, name) {
    var propertyName = p.name,
        definedProperty = this.propertiesByName[propertyName];

    if (definedProperty) {
      throw new Error(
        'property <' + propertyName + '> already defined; ' +
        'override of <' + definedProperty.definedBy.ns.name + '#' + definedProperty.ns.name + '> by ' +
        '<' + p.definedBy.ns.name + '#' + p.ns.name + '> not allowed without redefines');
    }
  };

  DescriptorBuilder.prototype.hasProperty = function(name) {
    return this.propertiesByName[name];
  };

  DescriptorBuilder.prototype.addTrait = function(t, inherited) {

    var typesByName = this.allTypesByName,
        types = this.allTypes;

    var typeName = t.name;

    if (typeName in typesByName) {
      return;
    }

    forEach(t.properties, bind(function(p) {

      // clone property to allow extensions
      p = assign({}, p, {
        name: p.ns.localName,
        inherited: inherited
      });

      Object.defineProperty(p, 'definedBy', {
        value: t
      });

      var replaces = p.replaces,
          redefines = p.redefines;

      // add replace/redefine support
      if (replaces || redefines) {
        this.redefineProperty(p, replaces || redefines, replaces);
      } else {
        if (p.isBody) {
          this.setBodyProperty(p);
        }
        if (p.isId) {
          this.setIdProperty(p);
        }
        this.addProperty(p);
      }
    }, this));

    types.push(t);
    typesByName[typeName] = t;
  };

  /**
   * A registry of Moddle packages.
   *
   * @param {Array<Package>} packages
   * @param {Properties} properties
   */
  function Registry(packages, properties) {
    this.packageMap = {};
    this.typeMap = {};

    this.packages = [];

    this.properties = properties;

    forEach(packages, bind(this.registerPackage, this));
  }


  Registry.prototype.getPackage = function(uriOrPrefix) {
    return this.packageMap[uriOrPrefix];
  };

  Registry.prototype.getPackages = function() {
    return this.packages;
  };


  Registry.prototype.registerPackage = function(pkg) {

    // copy package
    pkg = assign({}, pkg);

    var pkgMap = this.packageMap;

    ensureAvailable(pkgMap, pkg, 'prefix');
    ensureAvailable(pkgMap, pkg, 'uri');

    // register types
    forEach(pkg.types, bind(function(descriptor) {
      this.registerType(descriptor, pkg);
    }, this));

    pkgMap[pkg.uri] = pkgMap[pkg.prefix] = pkg;
    this.packages.push(pkg);
  };


  /**
   * Register a type from a specific package with us
   */
  Registry.prototype.registerType = function(type, pkg) {

    type = assign({}, type, {
      superClass: (type.superClass || []).slice(),
      extends: (type.extends || []).slice(),
      properties: (type.properties || []).slice(),
      meta: assign((type.meta || {}))
    });

    var ns = parseName(type.name, pkg.prefix),
        name = ns.name,
        propertiesByName = {};

    // parse properties
    forEach(type.properties, bind(function(p) {

      // namespace property names
      var propertyNs = parseName(p.name, ns.prefix),
          propertyName = propertyNs.name;

      // namespace property types
      if (!isBuiltIn(p.type)) {
        p.type = parseName(p.type, propertyNs.prefix).name;
      }

      assign(p, {
        ns: propertyNs,
        name: propertyName
      });

      propertiesByName[propertyName] = p;
    }, this));

    // update ns + name
    assign(type, {
      ns: ns,
      name: name,
      propertiesByName: propertiesByName
    });

    forEach(type.extends, bind(function(extendsName) {
      var extended = this.typeMap[extendsName];

      extended.traits = extended.traits || [];
      extended.traits.push(name);
    }, this));

    // link to package
    this.definePackage(type, pkg);

    // register
    this.typeMap[name] = type;
  };


  /**
   * Traverse the type hierarchy from bottom to top,
   * calling iterator with (type, inherited) for all elements in
   * the inheritance chain.
   *
   * @param {Object} nsName
   * @param {Function} iterator
   * @param {Boolean} [trait=false]
   */
  Registry.prototype.mapTypes = function(nsName, iterator, trait) {

    var type = isBuiltIn(nsName.name) ? { name: nsName.name } : this.typeMap[nsName.name];

    var self = this;

    /**
     * Traverse the selected trait.
     *
     * @param {String} cls
     */
    function traverseTrait(cls) {
      return traverseSuper(cls, true);
    }

    /**
     * Traverse the selected super type or trait
     *
     * @param {String} cls
     * @param {Boolean} [trait=false]
     */
    function traverseSuper(cls, trait) {
      var parentNs = parseName(cls, isBuiltIn(cls) ? '' : nsName.prefix);
      self.mapTypes(parentNs, iterator, trait);
    }

    if (!type) {
      throw new Error('unknown type <' + nsName.name + '>');
    }

    forEach(type.superClass, trait ? traverseTrait : traverseSuper);

    // call iterator with (type, inherited=!trait)
    iterator(type, !trait);

    forEach(type.traits, traverseTrait);
  };


  /**
   * Returns the effective descriptor for a type.
   *
   * @param  {String} type the namespaced name (ns:localName) of the type
   *
   * @return {Descriptor} the resulting effective descriptor
   */
  Registry.prototype.getEffectiveDescriptor = function(name) {

    var nsName = parseName(name);

    var builder = new DescriptorBuilder(nsName);

    this.mapTypes(nsName, function(type, inherited) {
      builder.addTrait(type, inherited);
    });

    var descriptor = builder.build();

    // define package link
    this.definePackage(descriptor, descriptor.allTypes[descriptor.allTypes.length - 1].$pkg);

    return descriptor;
  };


  Registry.prototype.definePackage = function(target, pkg) {
    this.properties.define(target, '$pkg', { value: pkg });
  };



  ///////// helpers ////////////////////////////

  function ensureAvailable(packageMap, pkg, identifierKey) {

    var value = pkg[identifierKey];

    if (value in packageMap) {
      throw new Error('package with ' + identifierKey + ' <' + value + '> already defined');
    }
  }

  /**
   * A utility that gets and sets properties of model elements.
   *
   * @param {Model} model
   */
  function Properties(model) {
    this.model = model;
  }


  /**
   * Sets a named property on the target element.
   * If the value is undefined, the property gets deleted.
   *
   * @param {Object} target
   * @param {String} name
   * @param {Object} value
   */
  Properties.prototype.set = function(target, name, value) {

    var property = this.model.getPropertyDescriptor(target, name);

    var propertyName = property && property.name;

    if (isUndefined$1(value)) {
      // unset the property, if the specified value is undefined;
      // delete from $attrs (for extensions) or the target itself
      if (property) {
        delete target[propertyName];
      } else {
        delete target.$attrs[name];
      }
    } else {
      // set the property, defining well defined properties on the fly
      // or simply updating them in target.$attrs (for extensions)
      if (property) {
        if (propertyName in target) {
          target[propertyName] = value;
        } else {
          defineProperty$1(target, property, value);
        }
      } else {
        target.$attrs[name] = value;
      }
    }
  };

  /**
   * Returns the named property of the given element
   *
   * @param  {Object} target
   * @param  {String} name
   *
   * @return {Object}
   */
  Properties.prototype.get = function(target, name) {

    var property = this.model.getPropertyDescriptor(target, name);

    if (!property) {
      return target.$attrs[name];
    }

    var propertyName = property.name;

    // check if access to collection property and lazily initialize it
    if (!target[propertyName] && property.isMany) {
      defineProperty$1(target, property, []);
    }

    return target[propertyName];
  };


  /**
   * Define a property on the target element
   *
   * @param  {Object} target
   * @param  {String} name
   * @param  {Object} options
   */
  Properties.prototype.define = function(target, name, options) {
    Object.defineProperty(target, name, options);
  };


  /**
   * Define the descriptor for an element
   */
  Properties.prototype.defineDescriptor = function(target, descriptor) {
    this.define(target, '$descriptor', { value: descriptor });
  };

  /**
   * Define the model for an element
   */
  Properties.prototype.defineModel = function(target, model) {
    this.define(target, '$model', { value: model });
  };


  function isUndefined$1(val) {
    return typeof val === 'undefined';
  }

  function defineProperty$1(target, property, value) {
    Object.defineProperty(target, property.name, {
      enumerable: !property.isReference,
      writable: true,
      value: value,
      configurable: true
    });
  }

  //// Moddle implementation /////////////////////////////////////////////////

  /**
   * @class Moddle
   *
   * A model that can be used to create elements of a specific type.
   *
   * @example
   *
   * var Moddle = require('moddle');
   *
   * var pkg = {
   *   name: 'mypackage',
   *   prefix: 'my',
   *   types: [
   *     { name: 'Root' }
   *   ]
   * };
   *
   * var moddle = new Moddle([pkg]);
   *
   * @param {Array<Package>} packages the packages to contain
   */
  function Moddle(packages) {

    this.properties = new Properties(this);

    this.factory = new Factory(this, this.properties);
    this.registry = new Registry(packages, this.properties);

    this.typeCache = {};
  }


  /**
   * Create an instance of the specified type.
   *
   * @method Moddle#create
   *
   * @example
   *
   * var foo = moddle.create('my:Foo');
   * var bar = moddle.create('my:Bar', { id: 'BAR_1' });
   *
   * @param  {String|Object} descriptor the type descriptor or name know to the model
   * @param  {Object} attrs   a number of attributes to initialize the model instance with
   * @return {Object}         model instance
   */
  Moddle.prototype.create = function(descriptor, attrs) {
    var Type = this.getType(descriptor);

    if (!Type) {
      throw new Error('unknown type <' + descriptor + '>');
    }

    return new Type(attrs);
  };


  /**
   * Returns the type representing a given descriptor
   *
   * @method Moddle#getType
   *
   * @example
   *
   * var Foo = moddle.getType('my:Foo');
   * var foo = new Foo({ 'id' : 'FOO_1' });
   *
   * @param  {String|Object} descriptor the type descriptor or name know to the model
   * @return {Object}         the type representing the descriptor
   */
  Moddle.prototype.getType = function(descriptor) {

    var cache = this.typeCache;

    var name = isString(descriptor) ? descriptor : descriptor.ns.name;

    var type = cache[name];

    if (!type) {
      descriptor = this.registry.getEffectiveDescriptor(name);
      type = cache[name] = this.factory.createType(descriptor);
    }

    return type;
  };


  /**
   * Creates an any-element type to be used within model instances.
   *
   * This can be used to create custom elements that lie outside the meta-model.
   * The created element contains all the meta-data required to serialize it
   * as part of meta-model elements.
   *
   * @method Moddle#createAny
   *
   * @example
   *
   * var foo = moddle.createAny('vendor:Foo', 'http://vendor', {
   *   value: 'bar'
   * });
   *
   * var container = moddle.create('my:Container', 'http://my', {
   *   any: [ foo ]
   * });
   *
   * // go ahead and serialize the stuff
   *
   *
   * @param  {String} name  the name of the element
   * @param  {String} nsUri the namespace uri of the element
   * @param  {Object} [properties] a map of properties to initialize the instance with
   * @return {Object} the any type instance
   */
  Moddle.prototype.createAny = function(name, nsUri, properties) {

    var nameNs = parseName(name);

    var element = {
      $type: name,
      $instanceOf: function(type) {
        return type === this.$type;
      }
    };

    var descriptor = {
      name: name,
      isGeneric: true,
      ns: {
        prefix: nameNs.prefix,
        localName: nameNs.localName,
        uri: nsUri
      }
    };

    this.properties.defineDescriptor(element, descriptor);
    this.properties.defineModel(element, this);
    this.properties.define(element, '$parent', { enumerable: false, writable: true });

    forEach(properties, function(a, key) {
      if (isObject(a) && a.value !== undefined) {
        element[a.name] = a.value;
      } else {
        element[key] = a;
      }
    });

    return element;
  };

  /**
   * Returns a registered package by uri or prefix
   *
   * @return {Object} the package
   */
  Moddle.prototype.getPackage = function(uriOrPrefix) {
    return this.registry.getPackage(uriOrPrefix);
  };

  /**
   * Returns a snapshot of all known packages
   *
   * @return {Object} the package
   */
  Moddle.prototype.getPackages = function() {
    return this.registry.getPackages();
  };

  /**
   * Returns the descriptor for an element
   */
  Moddle.prototype.getElementDescriptor = function(element) {
    return element.$descriptor;
  };

  /**
   * Returns true if the given descriptor or instance
   * represents the given type.
   *
   * May be applied to this, if element is omitted.
   */
  Moddle.prototype.hasType = function(element, type) {
    if (type === undefined) {
      type = element;
      element = this;
    }

    var descriptor = element.$model.getElementDescriptor(element);

    return (type in descriptor.allTypesByName);
  };

  /**
   * Returns the descriptor of an elements named property
   */
  Moddle.prototype.getPropertyDescriptor = function(element, property) {
    return this.getElementDescriptor(element).propertiesByName[property];
  };

  /**
   * Returns a mapped type's descriptor
   */
  Moddle.prototype.getTypeDescriptor = function(type) {
    return this.registry.typeMap[type];
  };

  var fromCharCode = String.fromCharCode;

  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

  var ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;

  var ENTITY_MAPPING = {
    'amp': '&',
    'apos': '\'',
    'gt': '>',
    'lt': '<',
    'quot': '"'
  };

  // map UPPERCASE variants of supported special chars
  Object.keys(ENTITY_MAPPING).forEach(function(k) {
    ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
  });


  function replaceEntities(_, d, x, z) {

    // reserved names, i.e. &nbsp;
    if (z) {
      if (hasOwnProperty$1.call(ENTITY_MAPPING, z)) {
        return ENTITY_MAPPING[z];
      } else {
        // fall back to original value
        return '&' + z + ';';
      }
    }

    // decimal encoded char
    if (d) {
      return fromCharCode(d);
    }

    // hex encoded char
    return fromCharCode(parseInt(x, 16));
  }


  /**
   * A basic entity decoder that can decode a minimal
   * sub-set of reserved names (&amp;) as well as
   * hex (&#xaaf;) and decimal (&#1231;) encoded characters.
   *
   * @param {string} str
   *
   * @return {string} decoded string
   */
  function decodeEntities(s) {
    if (s.length > 3 && s.indexOf('&') !== -1) {
      return s.replace(ENTITY_PATTERN, replaceEntities);
    }

    return s;
  }

  var XSI_URI = 'http://www.w3.org/2001/XMLSchema-instance';
  var XSI_PREFIX = 'xsi';
  var XSI_TYPE = 'xsi:type';

  var NON_WHITESPACE_OUTSIDE_ROOT_NODE = 'non-whitespace outside of root node';

  function error(msg) {
    return new Error(msg);
  }

  function missingNamespaceForPrefix(prefix) {
    return 'missing namespace for prefix <' + prefix + '>';
  }

  function getter(getFn) {
    return {
      'get': getFn,
      'enumerable': true
    };
  }

  function cloneNsMatrix(nsMatrix) {
    var clone = {}, key;
    for (key in nsMatrix) {
      clone[key] = nsMatrix[key];
    }
    return clone;
  }

  function uriPrefix(prefix) {
    return prefix + '$uri';
  }

  function buildNsMatrix(nsUriToPrefix) {
    var nsMatrix = {},
        uri,
        prefix;

    for (uri in nsUriToPrefix) {
      prefix = nsUriToPrefix[uri];
      nsMatrix[prefix] = prefix;
      nsMatrix[uriPrefix(prefix)] = uri;
    }

    return nsMatrix;
  }

  function noopGetContext() {
    return { 'line': 0, 'column': 0 };
  }

  function throwFunc(err) {
    throw err;
  }

  /**
   * Creates a new parser with the given options.
   *
   * @constructor
   *
   * @param  {!Object<string, ?>=} options
   */
  function Parser(options) {

    if (!this) {
      return new Parser(options);
    }

    var proxy = options && options['proxy'];

    var onText,
        onOpenTag,
        onCloseTag,
        onCDATA,
        onError = throwFunc,
        onWarning,
        onComment,
        onQuestion,
        onAttention;

    var getContext = noopGetContext;

    /**
     * Do we need to parse the current elements attributes for namespaces?
     *
     * @type {boolean}
     */
    var maybeNS = false;

    /**
     * Do we process namespaces at all?
     *
     * @type {boolean}
     */
    var isNamespace = false;

    /**
     * The caught error returned on parse end
     *
     * @type {Error}
     */
    var returnError = null;

    /**
     * Should we stop parsing?
     *
     * @type {boolean}
     */
    var parseStop = false;

    /**
     * A map of { uri: prefix } used by the parser.
     *
     * This map will ensure we can normalize prefixes during processing;
     * for each uri, only one prefix will be exposed to the handlers.
     *
     * @type {!Object<string, string>}}
     */
    var nsUriToPrefix;

    /**
     * Handle parse error.
     *
     * @param  {string|Error} err
     */
    function handleError(err) {
      if (!(err instanceof Error)) {
        err = error(err);
      }

      returnError = err;

      onError(err, getContext);
    }

    /**
     * Handle parse error.
     *
     * @param  {string|Error} err
     */
    function handleWarning(err) {

      if (!onWarning) {
        return;
      }

      if (!(err instanceof Error)) {
        err = error(err);
      }

      onWarning(err, getContext);
    }

    /**
     * Register parse listener.
     *
     * @param  {string}   name
     * @param  {Function} cb
     *
     * @return {Parser}
     */
    this['on'] = function(name, cb) {

      if (typeof cb !== 'function') {
        throw error('required args <name, cb>');
      }

      switch (name) {
      case 'openTag': onOpenTag = cb; break;
      case 'text': onText = cb; break;
      case 'closeTag': onCloseTag = cb; break;
      case 'error': onError = cb; break;
      case 'warn': onWarning = cb; break;
      case 'cdata': onCDATA = cb; break;
      case 'attention': onAttention = cb; break; // <!XXXXX zzzz="eeee">
      case 'question': onQuestion = cb; break; // <? ....  ?>
      case 'comment': onComment = cb; break;
      default:
        throw error('unsupported event: ' + name);
      }

      return this;
    };

    /**
     * Set the namespace to prefix mapping.
     *
     * @example
     *
     * parser.ns({
     *   'http://foo': 'foo',
     *   'http://bar': 'bar'
     * });
     *
     * @param  {!Object<string, string>} nsMap
     *
     * @return {Parser}
     */
    this['ns'] = function(nsMap) {

      if (typeof nsMap === 'undefined') {
        nsMap = {};
      }

      if (typeof nsMap !== 'object') {
        throw error('required args <nsMap={}>');
      }

      var _nsUriToPrefix = {}, k;

      for (k in nsMap) {
        _nsUriToPrefix[k] = nsMap[k];
      }

      // FORCE default mapping for schema instance
      _nsUriToPrefix[XSI_URI] = XSI_PREFIX;

      isNamespace = true;
      nsUriToPrefix = _nsUriToPrefix;

      return this;
    };

    /**
     * Parse xml string.
     *
     * @param  {string} xml
     *
     * @return {Error} returnError, if not thrown
     */
    this['parse'] = function(xml) {
      if (typeof xml !== 'string') {
        throw error('required args <xml=string>');
      }

      returnError = null;

      parse(xml);

      getContext = noopGetContext;
      parseStop = false;

      return returnError;
    };

    /**
     * Stop parsing.
     */
    this['stop'] = function() {
      parseStop = true;
    };

    /**
     * Parse string, invoking configured listeners on element.
     *
     * @param  {string} xml
     */
    function parse(xml) {
      var nsMatrixStack = isNamespace ? [] : null,
          nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null,
          _nsMatrix,
          nodeStack = [],
          anonymousNsCount = 0,
          tagStart = false,
          tagEnd = false,
          i = 0, j = 0,
          x, y, q, w,
          xmlns,
          elementName,
          _elementName,
          elementProxy
          ;

      var attrsString = '',
          attrsStart = 0,
          cachedAttrs // false = parsed with errors, null = needs parsing
          ;

      /**
       * Parse attributes on demand and returns the parsed attributes.
       *
       * Return semantics: (1) `false` on attribute parse error,
       * (2) object hash on extracted attrs.
       *
       * @return {boolean|Object}
       */
      function getAttrs() {
        if (cachedAttrs !== null) {
          return cachedAttrs;
        }

        var nsUri,
            nsUriPrefix,
            nsName,
            defaultAlias = isNamespace && nsMatrix['xmlns'],
            attrList = isNamespace && maybeNS ? [] : null,
            i = attrsStart,
            s = attrsString,
            l = s.length,
            hasNewMatrix,
            newalias,
            value,
            alias,
            name,
            attrs = {},
            seenAttrs = {},
            skipAttr,
            w,
            j;

        parseAttr:
        for (; i < l; i++) {
          skipAttr = false;
          w = s.charCodeAt(i);

          if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE={ \f\n\r\t\v}
            continue;
          }

          // wait for non whitespace character
          if (w < 65 || w > 122 || (w > 90 && w < 97)) {
            if (w !== 95 && w !== 58) { // char 95"_" 58":"
              handleWarning('illegal first char attribute name');
              skipAttr = true;
            }
          }

          // parse attribute name
          for (j = i + 1; j < l; j++) {
            w = s.charCodeAt(j);

            if (
              w > 96 && w < 123 ||
              w > 64 && w < 91 ||
              w > 47 && w < 59 ||
              w === 46 || // '.'
              w === 45 || // '-'
              w === 95 // '_'
            ) {
              continue;
            }

            // unexpected whitespace
            if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
              handleWarning('missing attribute value');
              i = j;

              continue parseAttr;
            }

            // expected "="
            if (w === 61) { // "=" == 61
              break;
            }

            handleWarning('illegal attribute name char');
            skipAttr = true;
          }

          name = s.substring(i, j);

          if (name === 'xmlns:xmlns') {
            handleWarning('illegal declaration of xmlns');
            skipAttr = true;
          }

          w = s.charCodeAt(j + 1);

          if (w === 34) { // '"'
            j = s.indexOf('"', i = j + 2);

            if (j === -1) {
              j = s.indexOf('\'', i);

              if (j !== -1) {
                handleWarning('attribute value quote missmatch');
                skipAttr = true;
              }
            }

          } else if (w === 39) { // "'"
            j = s.indexOf('\'', i = j + 2);

            if (j === -1) {
              j = s.indexOf('"', i);

              if (j !== -1) {
                handleWarning('attribute value quote missmatch');
                skipAttr = true;
              }
            }

          } else {
            handleWarning('missing attribute value quotes');
            skipAttr = true;

            // skip to next space
            for (j = j + 1; j < l; j++) {
              w = s.charCodeAt(j + 1);

              if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
                break;
              }
            }

          }

          if (j === -1) {
            handleWarning('missing closing quotes');

            j = l;
            skipAttr = true;
          }

          if (!skipAttr) {
            value = s.substring(i, j);
          }

          i = j;

          // ensure SPACE follows attribute
          // skip illegal content otherwise
          // example a="b"c
          for (; j + 1 < l; j++) {
            w = s.charCodeAt(j + 1);

            if (w === 32 || (w < 14 && w > 8)) { // WHITESPACE
              break;
            }

            // FIRST ILLEGAL CHAR
            if (i === j) {
              handleWarning('illegal character after attribute end');
              skipAttr = true;
            }
          }

          // advance cursor to next attribute
          i = j + 1;

          if (skipAttr) {
            continue parseAttr;
          }

          // check attribute re-declaration
          if (name in seenAttrs) {
            handleWarning('attribute <' + name + '> already defined');
            continue;
          }

          seenAttrs[name] = true;

          if (!isNamespace) {
            attrs[name] = value;
            continue;
          }

          // try to extract namespace information
          if (maybeNS) {
            newalias = (
              name === 'xmlns'
                ? 'xmlns'
                : (name.charCodeAt(0) === 120 && name.substr(0, 6) === 'xmlns:')
                  ? name.substr(6)
                  : null
            );

            // handle xmlns(:alias) assignment
            if (newalias !== null) {
              nsUri = decodeEntities(value);
              nsUriPrefix = uriPrefix(newalias);

              alias = nsUriToPrefix[nsUri];

              if (!alias) {
                // no prefix defined or prefix collision
                if (
                  (newalias === 'xmlns') ||
                  (nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri)
                ) {
                  // alocate free ns prefix
                  do {
                    alias = 'ns' + (anonymousNsCount++);
                  } while (typeof nsMatrix[alias] !== 'undefined');
                } else {
                  alias = newalias;
                }

                nsUriToPrefix[nsUri] = alias;
              }

              if (nsMatrix[newalias] !== alias) {
                if (!hasNewMatrix) {
                  nsMatrix = cloneNsMatrix(nsMatrix);
                  hasNewMatrix = true;
                }

                nsMatrix[newalias] = alias;
                if (newalias === 'xmlns') {
                  nsMatrix[uriPrefix(alias)] = nsUri;
                  defaultAlias = alias;
                }

                nsMatrix[nsUriPrefix] = nsUri;
              }

              // expose xmlns(:asd)="..." in attributes
              attrs[name] = value;
              continue;
            }

            // collect attributes until all namespace
            // declarations are processed
            attrList.push(name, value);
            continue;

          } /** end if (maybeNs) */

          // handle attributes on element without
          // namespace declarations
          w = name.indexOf(':');
          if (w === -1) {
            attrs[name] = value;
            continue;
          }

          // normalize ns attribute name
          if (!(nsName = nsMatrix[name.substring(0, w)])) {
            handleWarning(missingNamespaceForPrefix(name.substring(0, w)));
            continue;
          }

          name = defaultAlias === nsName
            ? name.substr(w + 1)
            : nsName + name.substr(w);
          // end: normalize ns attribute name

          // normalize xsi:type ns attribute value
          if (name === XSI_TYPE) {
            w = value.indexOf(':');

            if (w !== -1) {
              nsName = value.substring(0, w);
              // handle default prefixes, i.e. xs:String gracefully
              nsName = nsMatrix[nsName] || nsName;
              value = nsName + value.substring(w);
            } else {
              value = defaultAlias + ':' + value;
            }
          }
          // end: normalize xsi:type ns attribute value

          attrs[name] = value;
        }


        // handle deferred, possibly namespaced attributes
        if (maybeNS) {

          // normalize captured attributes
          for (i = 0, l = attrList.length; i < l; i++) {

            name = attrList[i++];
            value = attrList[i];

            w = name.indexOf(':');

            if (w !== -1) {
              // normalize ns attribute name
              if (!(nsName = nsMatrix[name.substring(0, w)])) {
                handleWarning(missingNamespaceForPrefix(name.substring(0, w)));
                continue;
              }

              name = defaultAlias === nsName
                ? name.substr(w + 1)
                : nsName + name.substr(w);
              // end: normalize ns attribute name

              // normalize xsi:type ns attribute value
              if (name === XSI_TYPE) {
                w = value.indexOf(':');

                if (w !== -1) {
                  nsName = value.substring(0, w);
                  // handle default prefixes, i.e. xs:String gracefully
                  nsName = nsMatrix[nsName] || nsName;
                  value = nsName + value.substring(w);
                } else {
                  value = defaultAlias + ':' + value;
                }
              }
              // end: normalize xsi:type ns attribute value
            }

            attrs[name] = value;
          }
          // end: normalize captured attributes
        }

        return cachedAttrs = attrs;
      }

      /**
       * Extract the parse context { line, column, part }
       * from the current parser position.
       *
       * @return {Object} parse context
       */
      function getParseContext() {
        var splitsRe = /(\r\n|\r|\n)/g;

        var line = 0;
        var column = 0;
        var startOfLine = 0;
        var endOfLine = j;
        var match;
        var data;

        while (i >= startOfLine) {

          match = splitsRe.exec(xml);

          if (!match) {
            break;
          }

          // end of line = (break idx + break chars)
          endOfLine = match[0].length + match.index;

          if (endOfLine > i) {
            break;
          }

          // advance to next line
          line += 1;

          startOfLine = endOfLine;
        }

        // EOF errors
        if (i == -1) {
          column = endOfLine;
          data = xml.substring(j);
        } else
        // start errors
        if (j === 0) {
          console.log(i - startOfLine);
          data = xml.substring(j, i);
        }
        // other errors
        else {
          column = i - startOfLine;
          data = (j == -1 ? xml.substring(i) : xml.substring(i, j + 1));
        }

        return {
          'data': data,
          'line': line,
          'column': column
        };
      }

      getContext = getParseContext;


      if (proxy) {
        elementProxy = Object.create({}, {
          'name': getter(function() {
            return elementName;
          }),
          'originalName': getter(function() {
            return _elementName;
          }),
          'attrs': getter(getAttrs),
          'ns': getter(function() {
            return nsMatrix;
          })
        });
      }

      // actual parse logic
      while (j !== -1) {

        if (xml.charCodeAt(j) === 60) { // "<"
          i = j;
        } else {
          i = xml.indexOf('<', j);
        }

        // parse end
        if (i === -1) {
          if (nodeStack.length) {
            return handleError('unexpected end of file');
          }

          if (j === 0) {
            return handleError('missing start tag');
          }

          if (j < xml.length) {
            if (xml.substring(j).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
            }
          }

          return;
        }

        // parse text
        if (j !== i) {

          if (nodeStack.length) {
            if (onText) {
              onText(xml.substring(j, i), decodeEntities, getContext);

              if (parseStop) {
                return;
              }
            }
          } else {
            if (xml.substring(j, i).trim()) {
              handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);

              if (parseStop) {
                return;
              }
            }
          }
        }

        w = xml.charCodeAt(i+1);

        // parse comments + CDATA
        if (w === 33) { // "!"
          w = xml.charCodeAt(i+2);
          if (w === 91 && xml.substr(i + 3, 6) === 'CDATA[') { // 91 == "["
            j = xml.indexOf(']]>', i);
            if (j === -1) {
              return handleError('unclosed cdata');
            }

            if (onCDATA) {
              onCDATA(xml.substring(i + 9, j), getContext);
              if (parseStop) {
                return;
              }
            }

            j += 3;
            continue;
          }


          if (w === 45 && xml.charCodeAt(i + 3) === 45) { // 45 == "-"
            j = xml.indexOf('-->', i);
            if (j === -1) {
              return handleError('unclosed comment');
            }


            if (onComment) {
              onComment(xml.substring(i + 4, j), decodeEntities, getContext);
              if (parseStop) {
                return;
              }
            }

            j += 3;
            continue;
          }

          j = xml.indexOf('>', i + 1);
          if (j === -1) {
            return handleError('unclosed tag');
          }

          if (onAttention) {
            onAttention(xml.substring(i, j + 1), decodeEntities, getContext);
            if (parseStop) {
              return;
            }
          }

          j += 1;
          continue;
        }

        if (w === 63) { // "?"
          j = xml.indexOf('?>', i);
          if (j === -1) {
            return handleError('unclosed question');
          }

          if (onQuestion) {
            onQuestion(xml.substring(i, j + 2), getContext);
            if (parseStop) {
              return;
            }
          }

          j += 2;
          continue;
        }

        j = xml.indexOf('>', i + 1);

        if (j == -1) {
          return handleError('unclosed tag');
        }

        // don't process attributes;
        // there are none
        cachedAttrs = {};

        // if (xml.charCodeAt(i+1) === 47) { // </...
        if (w === 47) { // </...
          tagStart = false;
          tagEnd = true;

          if (!nodeStack.length) {
            return handleError('missing open tag');
          }

          // verify open <-> close tag match
          x = elementName = nodeStack.pop();
          q = i + 2 + x.length;

          if (xml.substring(i + 2, q) !== x) {
            return handleError('closing tag mismatch');
          }

          // verify chars in close tag
          for (; q < j; q++) {
            w = xml.charCodeAt(q);

            if (w === 32 || (w > 8 && w < 14)) { // \f\n\r\t\v space
              continue;
            }

            return handleError('close tag');
          }

        } else {
          if (xml.charCodeAt(j - 1) === 47) { // .../>
            x = elementName = xml.substring(i + 1, j - 1);

            tagStart = true;
            tagEnd = true;

          } else {
            x = elementName = xml.substring(i + 1, j);

            tagStart = true;
            tagEnd = false;
          }

          if (!(w > 96 && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) { // char 95"_" 58":"
            return handleError('illegal first char nodeName');
          }

          for (q = 1, y = x.length; q < y; q++) {
            w = x.charCodeAt(q);

            if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w == 46) {
              continue;
            }

            if (w === 32 || (w < 14 && w > 8)) { // \f\n\r\t\v space
              elementName = x.substring(0, q);
              // maybe there are attributes
              cachedAttrs = null;
              break;
            }

            return handleError('invalid nodeName');
          }

          if (!tagEnd) {
            nodeStack.push(elementName);
          }
        }

        if (isNamespace) {

          _nsMatrix = nsMatrix;

          if (tagStart) {
            // remember old namespace
            // unless we're self-closing
            if (!tagEnd) {
              nsMatrixStack.push(_nsMatrix);
            }

            if (cachedAttrs === null) {
              // quick check, whether there may be namespace
              // declarations on the node; if that is the case
              // we need to eagerly parse the node attributes
              if ((maybeNS = x.indexOf('xmlns', q) !== -1)) {
                attrsStart = q;
                attrsString = x;

                getAttrs();

                maybeNS = false;
              }
            }
          }

          _elementName = elementName;

          w = elementName.indexOf(':');
          if (w !== -1) {
            xmlns = nsMatrix[elementName.substring(0, w)];

            // prefix given; namespace must exist
            if (!xmlns) {
              return handleError('missing namespace on <' + _elementName + '>');
            }

            elementName = elementName.substr(w + 1);
          } else {
            xmlns = nsMatrix['xmlns'];

            // if no default namespace is defined,
            // we'll import the element as anonymous.
            //
            // it is up to users to correct that to the document defined
            // targetNamespace, or whatever their undersanding of the
            // XML spec mandates.
          }

          // adjust namespace prefixs as configured
          if (xmlns) {
            elementName = xmlns + ':' + elementName;
          }

        }

        if (tagStart) {
          attrsStart = q;
          attrsString = x;

          if (onOpenTag) {
            if (proxy) {
              onOpenTag(elementProxy, decodeEntities, tagEnd, getContext);
            } else {
              onOpenTag(elementName, getAttrs, decodeEntities, tagEnd, getContext);
            }

            if (parseStop) {
              return;
            }
          }

        }

        if (tagEnd) {

          if (onCloseTag) {
            onCloseTag(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);

            if (parseStop) {
              return;
            }
          }

          // restore old namespace
          if (isNamespace) {
            if (!tagStart) {
              nsMatrix = nsMatrixStack.pop();
            } else {
              nsMatrix = _nsMatrix;
            }
          }
        }

        j += 1;
      }
    } /** end parse */

  }

  function hasLowerCaseAlias(pkg) {
    return pkg.xml && pkg.xml.tagAlias === 'lowerCase';
  }

  var DEFAULT_NS_MAP = {
    'xsi': 'http://www.w3.org/2001/XMLSchema-instance'
  };

  var XSI_TYPE$1 = 'xsi:type';

  function serializeFormat(element) {
    return element.xml && element.xml.serialize;
  }

  function serializeAsType(element) {
    return serializeFormat(element) === XSI_TYPE$1;
  }

  function serializeAsProperty(element) {
    return serializeFormat(element) === 'property';
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function aliasToName(aliasNs, pkg) {

    if (!hasLowerCaseAlias(pkg)) {
      return aliasNs.name;
    }

    return aliasNs.prefix + ':' + capitalize(aliasNs.localName);
  }

  function prefixedToName(nameNs, pkg) {

    var name = nameNs.name,
        localName = nameNs.localName;

    var typePrefix = pkg.xml && pkg.xml.typePrefix;

    if (typePrefix && localName.indexOf(typePrefix) === 0) {
      return nameNs.prefix + ':' + localName.slice(typePrefix.length);
    } else {
      return name;
    }
  }

  function normalizeXsiTypeName(name, model) {

    var nameNs = parseName(name);
    var pkg = model.getPackage(nameNs.prefix);

    return prefixedToName(nameNs, pkg);
  }

  function error$1(message) {
    return new Error(message);
  }

  /**
   * Get the moddle descriptor for a given instance or type.
   *
   * @param  {ModdleElement|Function} element
   *
   * @return {Object} the moddle descriptor
   */
  function getModdleDescriptor(element) {
    return element.$descriptor;
  }

  function defer(fn) {
    setTimeout(fn, 0);
  }

  /**
   * A parse context.
   *
   * @class
   *
   * @param {Object} options
   * @param {ElementHandler} options.rootHandler the root handler for parsing a document
   * @param {boolean} [options.lax=false] whether or not to ignore invalid elements
   */
  function Context(options) {

    /**
     * @property {ElementHandler} rootHandler
     */

    /**
     * @property {Boolean} lax
     */

    assign(this, options);

    this.elementsById = {};
    this.references = [];
    this.warnings = [];

    /**
     * Add an unresolved reference.
     *
     * @param {Object} reference
     */
    this.addReference = function(reference) {
      this.references.push(reference);
    };

    /**
     * Add a processed element.
     *
     * @param {ModdleElement} element
     */
    this.addElement = function(element) {

      if (!element) {
        throw error$1('expected element');
      }

      var elementsById = this.elementsById;

      var descriptor = getModdleDescriptor(element);

      var idProperty = descriptor.idProperty,
          id;

      if (idProperty) {
        id = element.get(idProperty.name);

        if (id) {
          // for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
          if (!/^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i.test(id)) {
            throw new Error('illegal ID <' + id + '>');
          }

          if (elementsById[id]) {
            throw error$1('duplicate ID <' + id + '>');
          }

          elementsById[id] = element;
        }
      }
    };

    /**
     * Add an import warning.
     *
     * @param {Object} warning
     * @param {String} warning.message
     * @param {Error} [warning.error]
     */
    this.addWarning = function(warning) {
      this.warnings.push(warning);
    };
  }

  function BaseHandler() {}

  BaseHandler.prototype.handleEnd = function() {};
  BaseHandler.prototype.handleText = function() {};
  BaseHandler.prototype.handleNode = function() {};


  /**
   * A simple pass through handler that does nothing except for
   * ignoring all input it receives.
   *
   * This is used to ignore unknown elements and
   * attributes.
   */
  function NoopHandler() { }

  NoopHandler.prototype = Object.create(BaseHandler.prototype);

  NoopHandler.prototype.handleNode = function() {
    return this;
  };

  function BodyHandler() {}

  BodyHandler.prototype = Object.create(BaseHandler.prototype);

  BodyHandler.prototype.handleText = function(text) {
    this.body = (this.body || '') + text;
  };

  function ReferenceHandler(property, context) {
    this.property = property;
    this.context = context;
  }

  ReferenceHandler.prototype = Object.create(BodyHandler.prototype);

  ReferenceHandler.prototype.handleNode = function(node) {

    if (this.element) {
      throw error$1('expected no sub nodes');
    } else {
      this.element = this.createReference(node);
    }

    return this;
  };

  ReferenceHandler.prototype.handleEnd = function() {
    this.element.id = this.body;
  };

  ReferenceHandler.prototype.createReference = function(node) {
    return {
      property: this.property.ns.name,
      id: ''
    };
  };

  function ValueHandler(propertyDesc, element) {
    this.element = element;
    this.propertyDesc = propertyDesc;
  }

  ValueHandler.prototype = Object.create(BodyHandler.prototype);

  ValueHandler.prototype.handleEnd = function() {

    var value = this.body || '',
        element = this.element,
        propertyDesc = this.propertyDesc;

    value = coerceType(propertyDesc.type, value);

    if (propertyDesc.isMany) {
      element.get(propertyDesc.name).push(value);
    } else {
      element.set(propertyDesc.name, value);
    }
  };


  function BaseElementHandler() {}

  BaseElementHandler.prototype = Object.create(BodyHandler.prototype);

  BaseElementHandler.prototype.handleNode = function(node) {
    var parser = this,
        element = this.element;

    if (!element) {
      element = this.element = this.createElement(node);

      this.context.addElement(element);
    } else {
      parser = this.handleChild(node);
    }

    return parser;
  };

  /**
   * @class Reader.ElementHandler
   *
   */
  function ElementHandler(model, typeName, context) {
    this.model = model;
    this.type = model.getType(typeName);
    this.context = context;
  }

  ElementHandler.prototype = Object.create(BaseElementHandler.prototype);

  ElementHandler.prototype.addReference = function(reference) {
    this.context.addReference(reference);
  };

  ElementHandler.prototype.handleText = function(text) {

    var element = this.element,
        descriptor = getModdleDescriptor(element),
        bodyProperty = descriptor.bodyProperty;

    if (!bodyProperty) {
      throw error$1('unexpected body text <' + text + '>');
    }

    BodyHandler.prototype.handleText.call(this, text);
  };

  ElementHandler.prototype.handleEnd = function() {

    var value = this.body,
        element = this.element,
        descriptor = getModdleDescriptor(element),
        bodyProperty = descriptor.bodyProperty;

    if (bodyProperty && value !== undefined) {
      value = coerceType(bodyProperty.type, value);
      element.set(bodyProperty.name, value);
    }
  };

  /**
   * Create an instance of the model from the given node.
   *
   * @param  {Element} node the xml node
   */
  ElementHandler.prototype.createElement = function(node) {
    var attributes = node.attributes,
        Type = this.type,
        descriptor = getModdleDescriptor(Type),
        context = this.context,
        instance = new Type({}),
        model = this.model,
        propNameNs;

    forEach(attributes, function(value, name) {

      var prop = descriptor.propertiesByName[name],
          values;

      if (prop && prop.isReference) {

        if (!prop.isMany) {
          context.addReference({
            element: instance,
            property: prop.ns.name,
            id: value
          });
        } else {
          // IDREFS: parse references as whitespace-separated list
          values = value.split(' ');

          forEach(values, function(v) {
            context.addReference({
              element: instance,
              property: prop.ns.name,
              id: v
            });
          });
        }

      } else {
        if (prop) {
          value = coerceType(prop.type, value);
        } else
        if (name !== 'xmlns') {
          propNameNs = parseName(name, descriptor.ns.prefix);

          // check whether attribute is defined in a well-known namespace
          // if that is the case we emit a warning to indicate potential misuse
          if (model.getPackage(propNameNs.prefix)) {

            context.addWarning({
              message: 'unknown attribute <' + name + '>',
              element: instance,
              property: name,
              value: value
            });
          }
        }

        instance.set(name, value);
      }
    });

    return instance;
  };

  ElementHandler.prototype.getPropertyForNode = function(node) {

    var name = node.name;
    var nameNs = parseName(name);

    var type = this.type,
        model = this.model,
        descriptor = getModdleDescriptor(type);

    var propertyName = nameNs.name,
        property = descriptor.propertiesByName[propertyName],
        elementTypeName,
        elementType;

    // search for properties by name first

    if (property) {

      if (serializeAsType(property)) {
        elementTypeName = node.attributes[XSI_TYPE$1];

        // xsi type is optional, if it does not exists the
        // default type is assumed
        if (elementTypeName) {

          // take possible type prefixes from XML
          // into account, i.e.: xsi:type="t{ActualType}"
          elementTypeName = normalizeXsiTypeName(elementTypeName, model);

          elementType = model.getType(elementTypeName);

          return assign({}, property, {
            effectiveType: getModdleDescriptor(elementType).name
          });
        }
      }

      // search for properties by name first
      return property;
    }

    var pkg = model.getPackage(nameNs.prefix);

    if (pkg) {
      elementTypeName = aliasToName(nameNs, pkg);
      elementType = model.getType(elementTypeName);

      // search for collection members later
      property = find(descriptor.properties, function(p) {
        return !p.isVirtual && !p.isReference && !p.isAttribute && elementType.hasType(p.type);
      });

      if (property) {
        return assign({}, property, {
          effectiveType: getModdleDescriptor(elementType).name
        });
      }
    } else {
      // parse unknown element (maybe extension)
      property = find(descriptor.properties, function(p) {
        return !p.isReference && !p.isAttribute && p.type === 'Element';
      });

      if (property) {
        return property;
      }
    }

    throw error$1('unrecognized element <' + nameNs.name + '>');
  };

  ElementHandler.prototype.toString = function() {
    return 'ElementDescriptor[' + getModdleDescriptor(this.type).name + ']';
  };

  ElementHandler.prototype.valueHandler = function(propertyDesc, element) {
    return new ValueHandler(propertyDesc, element);
  };

  ElementHandler.prototype.referenceHandler = function(propertyDesc) {
    return new ReferenceHandler(propertyDesc, this.context);
  };

  ElementHandler.prototype.handler = function(type) {
    if (type === 'Element') {
      return new GenericElementHandler(this.model, type, this.context);
    } else {
      return new ElementHandler(this.model, type, this.context);
    }
  };

  /**
   * Handle the child element parsing
   *
   * @param  {Element} node the xml node
   */
  ElementHandler.prototype.handleChild = function(node) {
    var propertyDesc, type, element, childHandler;

    propertyDesc = this.getPropertyForNode(node);
    element = this.element;

    type = propertyDesc.effectiveType || propertyDesc.type;

    if (isSimple(type)) {
      return this.valueHandler(propertyDesc, element);
    }

    if (propertyDesc.isReference) {
      childHandler = this.referenceHandler(propertyDesc).handleNode(node);
    } else {
      childHandler = this.handler(type).handleNode(node);
    }

    var newElement = childHandler.element;

    // child handles may decide to skip elements
    // by not returning anything
    if (newElement !== undefined) {

      if (propertyDesc.isMany) {
        element.get(propertyDesc.name).push(newElement);
      } else {
        element.set(propertyDesc.name, newElement);
      }

      if (propertyDesc.isReference) {
        assign(newElement, {
          element: element
        });

        this.context.addReference(newElement);
      } else {
        // establish child -> parent relationship
        newElement.$parent = element;
      }
    }

    return childHandler;
  };

  /**
   * An element handler that performs special validation
   * to ensure the node it gets initialized with matches
   * the handlers type (namespace wise).
   *
   * @param {Moddle} model
   * @param {String} typeName
   * @param {Context} context
   */
  function RootElementHandler(model, typeName, context) {
    ElementHandler.call(this, model, typeName, context);
  }

  RootElementHandler.prototype = Object.create(ElementHandler.prototype);

  RootElementHandler.prototype.createElement = function(node) {

    var name = node.name,
        nameNs = parseName(name),
        model = this.model,
        type = this.type,
        pkg = model.getPackage(nameNs.prefix),
        typeName = pkg && aliasToName(nameNs, pkg) || name;

    // verify the correct namespace if we parse
    // the first element in the handler tree
    //
    // this ensures we don't mistakenly import wrong namespace elements
    if (!type.hasType(typeName)) {
      throw error$1('unexpected element <' + node.originalName + '>');
    }

    return ElementHandler.prototype.createElement.call(this, node);
  };


  function GenericElementHandler(model, typeName, context) {
    this.model = model;
    this.context = context;
  }

  GenericElementHandler.prototype = Object.create(BaseElementHandler.prototype);

  GenericElementHandler.prototype.createElement = function(node) {

    var name = node.name,
        ns = parseName(name),
        prefix = ns.prefix,
        uri = node.ns[prefix + '$uri'],
        attributes = node.attributes;

    return this.model.createAny(name, uri, attributes);
  };

  GenericElementHandler.prototype.handleChild = function(node) {

    var handler = new GenericElementHandler(this.model, 'Element', this.context).handleNode(node),
        element = this.element;

    var newElement = handler.element,
        children;

    if (newElement !== undefined) {
      children = element.$children = element.$children || [];
      children.push(newElement);

      // establish child -> parent relationship
      newElement.$parent = element;
    }

    return handler;
  };

  GenericElementHandler.prototype.handleEnd = function() {
    if (this.body) {
      this.element.$body = this.body;
    }
  };

  /**
   * A reader for a meta-model
   *
   * @param {Object} options
   * @param {Model} options.model used to read xml files
   * @param {Boolean} options.lax whether to make parse errors warnings
   */
  function Reader(options) {

    if (options instanceof Moddle) {
      options = {
        model: options
      };
    }

    assign(this, { lax: false }, options);
  }


  /**
   * Parse the given XML into a moddle document tree.
   *
   * @param {String} xml
   * @param {ElementHandler|Object} options or rootHandler
   * @param  {Function} done
   */
  Reader.prototype.fromXML = function(xml, options, done) {

    var rootHandler = options.rootHandler;

    if (options instanceof ElementHandler) {
      // root handler passed via (xml, { rootHandler: ElementHandler }, ...)
      rootHandler = options;
      options = {};
    } else {
      if (typeof options === 'string') {
        // rootHandler passed via (xml, 'someString', ...)
        rootHandler = this.handler(options);
        options = {};
      } else if (typeof rootHandler === 'string') {
        // rootHandler passed via (xml, { rootHandler: 'someString' }, ...)
        rootHandler = this.handler(rootHandler);
      }
    }

    var model = this.model,
        lax = this.lax;

    var context = new Context(assign({}, options, { rootHandler: rootHandler })),
        parser = new Parser({ proxy: true }),
        stack = createStack();

    rootHandler.context = context;

    // push root handler
    stack.push(rootHandler);


    /**
     * Handle error.
     *
     * @param  {Error} err
     * @param  {Function} getContext
     * @param  {boolean} lax
     *
     * @return {boolean} true if handled
     */
    function handleError(err, getContext, lax) {

      var ctx = getContext();

      var line = ctx.line,
          column = ctx.column,
          data = ctx.data;

      // we receive the full context data here,
      // for elements trim down the information
      // to the tag name, only
      if (data.charAt(0) === '<' && data.indexOf(' ') !== -1) {
        data = data.slice(0, data.indexOf(' ')) + '>';
      }

      var message =
        'unparsable content ' + (data ? data + ' ' : '') + 'detected\n\t' +
          'line: ' + line + '\n\t' +
          'column: ' + column + '\n\t' +
          'nested error: ' + err.message;

      if (lax) {
        context.addWarning({
          message: message,
          error: err
        });

        return true;
      } else {
        throw error$1(message);
      }
    }

    function handleWarning(err, getContext) {
      // just like handling errors in <lax=true> mode
      return handleError(err, getContext, true);
    }

    /**
     * Resolve collected references on parse end.
     */
    function resolveReferences() {

      var elementsById = context.elementsById;
      var references = context.references;

      var i, r;

      for (i = 0; (r = references[i]); i++) {
        var element = r.element;
        var reference = elementsById[r.id];
        var property = getModdleDescriptor(element).propertiesByName[r.property];

        if (!reference) {
          context.addWarning({
            message: 'unresolved reference <' + r.id + '>',
            element: r.element,
            property: r.property,
            value: r.id
          });
        }

        if (property.isMany) {
          var collection = element.get(property.name),
              idx = collection.indexOf(r);

          // we replace an existing place holder (idx != -1) or
          // append to the collection instead
          if (idx === -1) {
            idx = collection.length;
          }

          if (!reference) {
            // remove unresolvable reference
            collection.splice(idx, 1);
          } else {
            // add or update reference in collection
            collection[idx] = reference;
          }
        } else {
          element.set(property.name, reference);
        }
      }
    }

    function handleClose() {
      stack.pop().handleEnd();
    }

    var PREAMBLE_START_PATTERN = /^<\?xml /i;

    var ENCODING_PATTERN = / encoding="([^"]+)"/i;

    var UTF_8_PATTERN = /^utf-8$/i;

    function handleQuestion(question) {

      if (!PREAMBLE_START_PATTERN.test(question)) {
        return;
      }

      var match = ENCODING_PATTERN.exec(question);
      var encoding = match && match[1];

      if (!encoding || UTF_8_PATTERN.test(encoding)) {
        return;
      }

      context.addWarning({
        message:
          'unsupported document encoding <' + encoding + '>, ' +
          'falling back to UTF-8'
      });
    }

    function handleOpen(node, getContext) {
      var handler = stack.peek();

      try {
        stack.push(handler.handleNode(node));
      } catch (err) {

        if (handleError(err, getContext, lax)) {
          stack.push(new NoopHandler());
        }
      }
    }

    function handleCData(text, getContext) {

      try {
        stack.peek().handleText(text);
      } catch (err) {
        handleWarning(err, getContext);
      }
    }

    function handleText(text, getContext) {
      // strip whitespace only nodes, i.e. before
      // <!CDATA[ ... ]> sections and in between tags
      text = text.trim();

      if (!text) {
        return;
      }

      handleCData(text, getContext);
    }

    var uriMap = model.getPackages().reduce(function(uriMap, p) {
      uriMap[p.uri] = p.prefix;

      return uriMap;
    }, {});

    parser
      .ns(uriMap)
      .on('openTag', function(obj, decodeStr, selfClosing, getContext) {

        // gracefully handle unparsable attributes (attrs=false)
        var attrs = obj.attrs || {};

        var decodedAttrs = Object.keys(attrs).reduce(function(d, key) {
          var value = decodeStr(attrs[key]);

          d[key] = value;

          return d;
        }, {});

        var node = {
          name: obj.name,
          originalName: obj.originalName,
          attributes: decodedAttrs,
          ns: obj.ns
        };

        handleOpen(node, getContext);
      })
      .on('question', handleQuestion)
      .on('closeTag', handleClose)
      .on('cdata', handleCData)
      .on('text', function(text, decodeEntities, getContext) {
        handleText(decodeEntities(text), getContext);
      })
      .on('error', handleError)
      .on('warn', handleWarning);

    // deferred parse XML to make loading really ascnchronous
    // this ensures the execution environment (node or browser)
    // is kept responsive and that certain optimization strategies
    // can kick in
    defer(function() {
      var err;

      try {
        parser.parse(xml);

        resolveReferences();
      } catch (e) {
        err = e;
      }

      var element = rootHandler.element;

      // handle the situation that we could not extract
      // the desired root element from the document
      if (!err && !element) {
        err = error$1('failed to parse document as <' + rootHandler.type.$descriptor.name + '>');
      }

      done(err, err ? undefined : element, context);
    });
  };

  Reader.prototype.handler = function(name) {
    return new RootElementHandler(this.model, name);
  };


  // helpers //////////////////////////

  function createStack() {
    var stack = [];

    Object.defineProperty(stack, 'peek', {
      value: function() {
        return this[this.length - 1];
      }
    });

    return stack;
  }

  var XML_PREAMBLE = '<?xml version="1.0" encoding="UTF-8"?>\n';

  var ESCAPE_ATTR_CHARS = /<|>|'|"|&|\n\r|\n/g;
  var ESCAPE_CHARS =  /<|>|&/g;


  function Namespaces(parent) {

    var prefixMap = {};
    var uriMap = {};
    var used = {};

    var wellknown = [];
    var custom = [];

    // API

    this.byUri = function(uri) {
      return uriMap[uri] || (
        parent && parent.byUri(uri)
      );
    };

    this.add = function(ns, isWellknown) {

      uriMap[ns.uri] = ns;

      if (isWellknown) {
        wellknown.push(ns);
      } else {
        custom.push(ns);
      }

      this.mapPrefix(ns.prefix, ns.uri);
    };

    this.uriByPrefix = function(prefix) {
      return prefixMap[prefix || 'xmlns'];
    };

    this.mapPrefix = function(prefix, uri) {
      prefixMap[prefix || 'xmlns'] = uri;
    };

    this.logUsed = function(ns) {
      var uri = ns.uri;

      used[uri] = this.byUri(uri);
    };

    this.getUsed = function(ns) {

      function isUsed(ns) {
        return used[ns.uri];
      }

      var allNs = [].concat(wellknown, custom);

      return allNs.filter(isUsed);
    };

  }

  function lower(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  function nameToAlias(name, pkg) {
    if (hasLowerCaseAlias(pkg)) {
      return lower(name);
    } else {
      return name;
    }
  }

  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }

  function nsName(ns) {
    if (isString(ns)) {
      return ns;
    } else {
      return (ns.prefix ? ns.prefix + ':' : '') + ns.localName;
    }
  }

  function getNsAttrs(namespaces) {

    return map(namespaces.getUsed(), function(ns) {
      var name = 'xmlns' + (ns.prefix ? ':' + ns.prefix : '');
      return { name: name, value: ns.uri };
    });

  }

  function getElementNs(ns, descriptor) {
    if (descriptor.isGeneric) {
      return assign({ localName: descriptor.ns.localName }, ns);
    } else {
      return assign({ localName: nameToAlias(descriptor.ns.localName, descriptor.$pkg) }, ns);
    }
  }

  function getPropertyNs(ns, descriptor) {
    return assign({ localName: descriptor.ns.localName }, ns);
  }

  function getSerializableProperties(element) {
    var descriptor = element.$descriptor;

    return filter(descriptor.properties, function(p) {
      var name = p.name;

      if (p.isVirtual) {
        return false;
      }

      // do not serialize defaults
      if (!element.hasOwnProperty(name)) {
        return false;
      }

      var value = element[name];

      // do not serialize default equals
      if (value === p.default) {
        return false;
      }

      // do not serialize null properties
      if (value === null) {
        return false;
      }

      return p.isMany ? value.length : true;
    });
  }

  var ESCAPE_ATTR_MAP = {
    '\n': '#10',
    '\n\r': '#10',
    '"': '#34',
    '\'': '#39',
    '<': '#60',
    '>': '#62',
    '&': '#38'
  };

  var ESCAPE_MAP = {
    '<': 'lt',
    '>': 'gt',
    '&': 'amp'
  };

  function escape$1(str, charPattern, replaceMap) {

    // ensure we are handling strings here
    str = isString(str) ? str : '' + str;

    return str.replace(charPattern, function(s) {
      return '&' + replaceMap[s] + ';';
    });
  }

  /**
   * Escape a string attribute to not contain any bad values (line breaks, '"', ...)
   *
   * @param {String} str the string to escape
   * @return {String} the escaped string
   */
  function escapeAttr(str) {
    return escape$1(str, ESCAPE_ATTR_CHARS, ESCAPE_ATTR_MAP);
  }

  function escapeBody(str) {
    return escape$1(str, ESCAPE_CHARS, ESCAPE_MAP);
  }

  function filterAttributes(props) {
    return filter(props, function(p) { return p.isAttr; });
  }

  function filterContained(props) {
    return filter(props, function(p) { return !p.isAttr; });
  }


  function ReferenceSerializer(tagName) {
    this.tagName = tagName;
  }

  ReferenceSerializer.prototype.build = function(element) {
    this.element = element;
    return this;
  };

  ReferenceSerializer.prototype.serializeTo = function(writer) {
    writer
      .appendIndent()
      .append('<' + this.tagName + '>' + this.element.id + '</' + this.tagName + '>')
      .appendNewLine();
  };

  function BodySerializer() {}

  BodySerializer.prototype.serializeValue =
  BodySerializer.prototype.serializeTo = function(writer) {
    writer.append(
      this.escape
        ? escapeBody(this.value)
        : this.value
    );
  };

  BodySerializer.prototype.build = function(prop, value) {
    this.value = value;

    if (prop.type === 'String' && value.search(ESCAPE_CHARS) !== -1) {
      this.escape = true;
    }

    return this;
  };

  function ValueSerializer(tagName) {
    this.tagName = tagName;
  }

  inherits(ValueSerializer, BodySerializer);

  ValueSerializer.prototype.serializeTo = function(writer) {

    writer
      .appendIndent()
      .append('<' + this.tagName + '>');

    this.serializeValue(writer);

    writer
      .append('</' + this.tagName + '>')
      .appendNewLine();
  };

  function ElementSerializer(parent, propertyDescriptor) {
    this.body = [];
    this.attrs = [];

    this.parent = parent;
    this.propertyDescriptor = propertyDescriptor;
  }

  ElementSerializer.prototype.build = function(element) {
    this.element = element;

    var elementDescriptor = element.$descriptor,
        propertyDescriptor = this.propertyDescriptor;

    var otherAttrs,
        properties;

    var isGeneric = elementDescriptor.isGeneric;

    if (isGeneric) {
      otherAttrs = this.parseGeneric(element);
    } else {
      otherAttrs = this.parseNsAttributes(element);
    }

    if (propertyDescriptor) {
      this.ns = this.nsPropertyTagName(propertyDescriptor);
    } else {
      this.ns = this.nsTagName(elementDescriptor);
    }

    // compute tag name
    this.tagName = this.addTagName(this.ns);

    if (!isGeneric) {
      properties = getSerializableProperties(element);

      this.parseAttributes(filterAttributes(properties));
      this.parseContainments(filterContained(properties));
    }

    this.parseGenericAttributes(element, otherAttrs);

    return this;
  };

  ElementSerializer.prototype.nsTagName = function(descriptor) {
    var effectiveNs = this.logNamespaceUsed(descriptor.ns);
    return getElementNs(effectiveNs, descriptor);
  };

  ElementSerializer.prototype.nsPropertyTagName = function(descriptor) {
    var effectiveNs = this.logNamespaceUsed(descriptor.ns);
    return getPropertyNs(effectiveNs, descriptor);
  };

  ElementSerializer.prototype.isLocalNs = function(ns) {
    return ns.uri === this.ns.uri;
  };

  /**
   * Get the actual ns attribute name for the given element.
   *
   * @param {Object} element
   * @param {Boolean} [element.inherited=false]
   *
   * @return {Object} nsName
   */
  ElementSerializer.prototype.nsAttributeName = function(element) {

    var ns;

    if (isString(element)) {
      ns = parseName(element);
    } else {
      ns = element.ns;
    }

    // return just local name for inherited attributes
    if (element.inherited) {
      return { localName: ns.localName };
    }

    // parse + log effective ns
    var effectiveNs = this.logNamespaceUsed(ns);

    // LOG ACTUAL namespace use
    this.getNamespaces().logUsed(effectiveNs);

    // strip prefix if same namespace like parent
    if (this.isLocalNs(effectiveNs)) {
      return { localName: ns.localName };
    } else {
      return assign({ localName: ns.localName }, effectiveNs);
    }
  };

  ElementSerializer.prototype.parseGeneric = function(element) {

    var self = this,
        body = this.body;

    var attributes = [];

    forEach(element, function(val, key) {

      var nonNsAttr;

      if (key === '$body') {
        body.push(new BodySerializer().build({ type: 'String' }, val));
      } else
      if (key === '$children') {
        forEach(val, function(child) {
          body.push(new ElementSerializer(self).build(child));
        });
      } else
      if (key.indexOf('$') !== 0) {
        nonNsAttr = self.parseNsAttribute(element, key, val);

        if (nonNsAttr) {
          attributes.push({ name: key, value: val });
        }
      }
    });

    return attributes;
  };

  ElementSerializer.prototype.parseNsAttribute = function(element, name, value) {
    var model = element.$model;

    var nameNs = parseName(name);

    var ns;

    // parse xmlns:foo="http://foo.bar"
    if (nameNs.prefix === 'xmlns') {
      ns = { prefix: nameNs.localName, uri: value };
    }

    // parse xmlns="http://foo.bar"
    if (!nameNs.prefix && nameNs.localName === 'xmlns') {
      ns = { uri: value };
    }

    if (!ns) {
      return {
        name: name,
        value: value
      };
    }

    if (model && model.getPackage(value)) {
      // register well known namespace
      this.logNamespace(ns, true, true);
    } else {
      // log custom namespace directly as used
      var actualNs = this.logNamespaceUsed(ns, true);

      this.getNamespaces().logUsed(actualNs);
    }
  };


  /**
   * Parse namespaces and return a list of left over generic attributes
   *
   * @param  {Object} element
   * @return {Array<Object>}
   */
  ElementSerializer.prototype.parseNsAttributes = function(element, attrs) {
    var self = this;

    var genericAttrs = element.$attrs;

    var attributes = [];

    // parse namespace attributes first
    // and log them. push non namespace attributes to a list
    // and process them later
    forEach(genericAttrs, function(value, name) {

      var nonNsAttr = self.parseNsAttribute(element, name, value);

      if (nonNsAttr) {
        attributes.push(nonNsAttr);
      }
    });

    return attributes;
  };

  ElementSerializer.prototype.parseGenericAttributes = function(element, attributes) {

    var self = this;

    forEach(attributes, function(attr) {

      // do not serialize xsi:type attribute
      // it is set manually based on the actual implementation type
      if (attr.name === XSI_TYPE$1) {
        return;
      }

      try {
        self.addAttribute(self.nsAttributeName(attr.name), attr.value);
      } catch (e) {
        console.warn(
          'missing namespace information for ',
          attr.name, '=', attr.value, 'on', element,
          e);
      }
    });
  };

  ElementSerializer.prototype.parseContainments = function(properties) {

    var self = this,
        body = this.body,
        element = this.element;

    forEach(properties, function(p) {
      var value = element.get(p.name),
          isReference = p.isReference,
          isMany = p.isMany;

      if (!isMany) {
        value = [ value ];
      }

      if (p.isBody) {
        body.push(new BodySerializer().build(p, value[0]));
      } else
      if (isSimple(p.type)) {
        forEach(value, function(v) {
          body.push(new ValueSerializer(self.addTagName(self.nsPropertyTagName(p))).build(p, v));
        });
      } else
      if (isReference) {
        forEach(value, function(v) {
          body.push(new ReferenceSerializer(self.addTagName(self.nsPropertyTagName(p))).build(v));
        });
      } else {
        // allow serialization via type
        // rather than element name
        var asType = serializeAsType(p),
            asProperty = serializeAsProperty(p);

        forEach(value, function(v) {
          var serializer;

          if (asType) {
            serializer = new TypeSerializer(self, p);
          } else
          if (asProperty) {
            serializer = new ElementSerializer(self, p);
          } else {
            serializer = new ElementSerializer(self);
          }

          body.push(serializer.build(v));
        });
      }
    });
  };

  ElementSerializer.prototype.getNamespaces = function(local) {

    var namespaces = this.namespaces,
        parent = this.parent,
        parentNamespaces;

    if (!namespaces) {
      parentNamespaces = parent && parent.getNamespaces();

      if (local || !parentNamespaces) {
        this.namespaces = namespaces = new Namespaces(parentNamespaces);
      } else {
        namespaces = parentNamespaces;
      }
    }

    return namespaces;
  };

  ElementSerializer.prototype.logNamespace = function(ns, wellknown, local) {
    var namespaces = this.getNamespaces(local);

    var nsUri = ns.uri,
        nsPrefix = ns.prefix;

    var existing = namespaces.byUri(nsUri);

    if (!existing) {
      namespaces.add(ns, wellknown);
    }

    namespaces.mapPrefix(nsPrefix, nsUri);

    return ns;
  };

  ElementSerializer.prototype.logNamespaceUsed = function(ns, local) {
    var element = this.element,
        model = element.$model,
        namespaces = this.getNamespaces(local);

    // ns may be
    //
    //   * prefix only
    //   * prefix:uri
    //   * localName only

    var prefix = ns.prefix,
        uri = ns.uri,
        newPrefix, idx,
        wellknownUri;

    // handle anonymous namespaces (elementForm=unqualified), cf. #23
    if (!prefix && !uri) {
      return { localName: ns.localName };
    }

    wellknownUri = DEFAULT_NS_MAP[prefix] || model && (model.getPackage(prefix) || {}).uri;

    uri = uri || wellknownUri || namespaces.uriByPrefix(prefix);

    if (!uri) {
      throw new Error('no namespace uri given for prefix <' + prefix + '>');
    }

    ns = namespaces.byUri(uri);

    if (!ns) {
      newPrefix = prefix;
      idx = 1;

      // find a prefix that is not mapped yet
      while (namespaces.uriByPrefix(newPrefix)) {
        newPrefix = prefix + '_' + idx++;
      }

      ns = this.logNamespace({ prefix: newPrefix, uri: uri }, wellknownUri === uri);
    }

    if (prefix) {
      namespaces.mapPrefix(prefix, uri);
    }

    return ns;
  };

  ElementSerializer.prototype.parseAttributes = function(properties) {
    var self = this,
        element = this.element;

    forEach(properties, function(p) {

      var value = element.get(p.name);

      if (p.isReference) {

        if (!p.isMany) {
          value = value.id;
        }
        else {
          var values = [];
          forEach(value, function(v) {
            values.push(v.id);
          });
          // IDREFS is a whitespace-separated list of references.
          value = values.join(' ');
        }

      }

      self.addAttribute(self.nsAttributeName(p), value);
    });
  };

  ElementSerializer.prototype.addTagName = function(nsTagName) {
    var actualNs = this.logNamespaceUsed(nsTagName);

    this.getNamespaces().logUsed(actualNs);

    return nsName(nsTagName);
  };

  ElementSerializer.prototype.addAttribute = function(name, value) {
    var attrs = this.attrs;

    if (isString(value)) {
      value = escapeAttr(value);
    }

    attrs.push({ name: name, value: value });
  };

  ElementSerializer.prototype.serializeAttributes = function(writer) {
    var attrs = this.attrs,
        namespaces = this.namespaces;

    if (namespaces) {
      attrs = getNsAttrs(namespaces).concat(attrs);
    }

    forEach(attrs, function(a) {
      writer
        .append(' ')
        .append(nsName(a.name)).append('="').append(a.value).append('"');
    });
  };

  ElementSerializer.prototype.serializeTo = function(writer) {
    var firstBody = this.body[0],
        indent = firstBody && firstBody.constructor !== BodySerializer;

    writer
      .appendIndent()
      .append('<' + this.tagName);

    this.serializeAttributes(writer);

    writer.append(firstBody ? '>' : ' />');

    if (firstBody) {

      if (indent) {
        writer
          .appendNewLine()
          .indent();
      }

      forEach(this.body, function(b) {
        b.serializeTo(writer);
      });

      if (indent) {
        writer
          .unindent()
          .appendIndent();
      }

      writer.append('</' + this.tagName + '>');
    }

    writer.appendNewLine();
  };

  /**
   * A serializer for types that handles serialization of data types
   */
  function TypeSerializer(parent, propertyDescriptor) {
    ElementSerializer.call(this, parent, propertyDescriptor);
  }

  inherits(TypeSerializer, ElementSerializer);

  TypeSerializer.prototype.parseNsAttributes = function(element) {

    // extracted attributes
    var attributes = ElementSerializer.prototype.parseNsAttributes.call(this, element);

    var descriptor = element.$descriptor;

    // only serialize xsi:type if necessary
    if (descriptor.name === this.propertyDescriptor.type) {
      return attributes;
    }

    var typeNs = this.typeNs = this.nsTagName(descriptor);
    this.getNamespaces().logUsed(this.typeNs);

    // add xsi:type attribute to represent the elements
    // actual type

    var pkg = element.$model.getPackage(typeNs.uri),
        typePrefix = (pkg.xml && pkg.xml.typePrefix) || '';

    this.addAttribute(
      this.nsAttributeName(XSI_TYPE$1),
      (typeNs.prefix ? typeNs.prefix + ':' : '') + typePrefix + descriptor.ns.localName
    );

    return attributes;
  };

  TypeSerializer.prototype.isLocalNs = function(ns) {
    return ns.uri === (this.typeNs || this.ns).uri;
  };

  function SavingWriter() {
    this.value = '';

    this.write = function(str) {
      this.value += str;
    };
  }

  function FormatingWriter(out, format) {

    var indent = [''];

    this.append = function(str) {
      out.write(str);

      return this;
    };

    this.appendNewLine = function() {
      if (format) {
        out.write('\n');
      }

      return this;
    };

    this.appendIndent = function() {
      if (format) {
        out.write(indent.join('  '));
      }

      return this;
    };

    this.indent = function() {
      indent.push('');
      return this;
    };

    this.unindent = function() {
      indent.pop();
      return this;
    };
  }

  /**
   * A writer for meta-model backed document trees
   *
   * @param {Object} options output options to pass into the writer
   */
  function Writer(options) {

    options = assign({ format: false, preamble: true }, options || {});

    function toXML(tree, writer) {
      var internalWriter = writer || new SavingWriter();
      var formatingWriter = new FormatingWriter(internalWriter, options.format);

      if (options.preamble) {
        formatingWriter.append(XML_PREAMBLE);
      }

      new ElementSerializer().build(tree).serializeTo(formatingWriter);

      if (!writer) {
        return internalWriter.value;
      }
    }

    return {
      toXML: toXML
    };
  }

  /**
   * A sub class of {@link Moddle} with support for import and export of BPMN 2.0 xml files.
   *
   * @class BpmnModdle
   * @extends Moddle
   *
   * @param {Object|Array} packages to use for instantiating the model
   * @param {Object} [options] additional options to pass over
   */
  function BpmnModdle(packages, options) {
    Moddle.call(this, packages, options);
  }

  BpmnModdle.prototype = Object.create(Moddle.prototype);


  /**
   * Instantiates a BPMN model tree from a given xml string.
   *
   * @param {String}   xmlStr
   * @param {String}   [typeName='bpmn:Definitions'] name of the root element
   * @param {Object}   [options]  options to pass to the underlying reader
   * @param {Function} done       callback that is invoked with (err, result, parseContext)
   *                              once the import completes
   */
  BpmnModdle.prototype.fromXML = function(xmlStr, typeName, options, done) {

    if (!isString(typeName)) {
      done = options;
      options = typeName;
      typeName = 'bpmn:Definitions';
    }

    if (isFunction(options)) {
      done = options;
      options = {};
    }

    var reader = new Reader(assign({ model: this, lax: true }, options));
    var rootHandler = reader.handler(typeName);

    reader.fromXML(xmlStr, rootHandler, done);
  };


  /**
   * Serializes a BPMN 2.0 object tree to XML.
   *
   * @param {String}   element    the root element, typically an instance of `bpmn:Definitions`
   * @param {Object}   [options]  to pass to the underlying writer
   * @param {Function} done       callback invoked with (err, xmlStr) once the import completes
   */
  BpmnModdle.prototype.toXML = function(element, options, done) {

    if (isFunction(options)) {
      done = options;
      options = {};
    }

    var writer = new Writer(options);

    var result;
    var err;

    try {
      result = writer.toXML(element);
    } catch (e) {
      err = e;
    }

    return done(err, result);
  };

  var name = "BPMN20";
  var uri = "http://www.omg.org/spec/BPMN/20100524/MODEL";
  var associations = [
  ];
  var types$1 = [
  	{
  		name: "Interface",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "operations",
  				type: "Operation",
  				isMany: true
  			},
  			{
  				name: "implementationRef",
  				type: "String",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Operation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "inMessageRef",
  				type: "Message",
  				isReference: true
  			},
  			{
  				name: "outMessageRef",
  				type: "Message",
  				isReference: true
  			},
  			{
  				name: "errorRef",
  				type: "Error",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "implementationRef",
  				type: "String",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "EndPoint",
  		superClass: [
  			"RootElement"
  		]
  	},
  	{
  		name: "Auditing",
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "GlobalTask",
  		superClass: [
  			"CallableElement"
  		],
  		properties: [
  			{
  				name: "resources",
  				type: "ResourceRole",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Monitoring",
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Performer",
  		superClass: [
  			"ResourceRole"
  		]
  	},
  	{
  		name: "Process",
  		superClass: [
  			"FlowElementsContainer",
  			"CallableElement"
  		],
  		properties: [
  			{
  				name: "processType",
  				type: "ProcessType",
  				isAttr: true
  			},
  			{
  				name: "isClosed",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "auditing",
  				type: "Auditing"
  			},
  			{
  				name: "monitoring",
  				type: "Monitoring"
  			},
  			{
  				name: "properties",
  				type: "Property",
  				isMany: true
  			},
  			{
  				name: "laneSets",
  				type: "LaneSet",
  				isMany: true,
  				replaces: "FlowElementsContainer#laneSets"
  			},
  			{
  				name: "flowElements",
  				type: "FlowElement",
  				isMany: true,
  				replaces: "FlowElementsContainer#flowElements"
  			},
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			},
  			{
  				name: "resources",
  				type: "ResourceRole",
  				isMany: true
  			},
  			{
  				name: "correlationSubscriptions",
  				type: "CorrelationSubscription",
  				isMany: true
  			},
  			{
  				name: "supports",
  				type: "Process",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "definitionalCollaborationRef",
  				type: "Collaboration",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "isExecutable",
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "LaneSet",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "lanes",
  				type: "Lane",
  				isMany: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Lane",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "partitionElementRef",
  				type: "BaseElement",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "partitionElement",
  				type: "BaseElement"
  			},
  			{
  				name: "flowNodeRef",
  				type: "FlowNode",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "childLaneSet",
  				type: "LaneSet",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "GlobalManualTask",
  		superClass: [
  			"GlobalTask"
  		]
  	},
  	{
  		name: "ManualTask",
  		superClass: [
  			"Task"
  		]
  	},
  	{
  		name: "UserTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "renderings",
  				type: "Rendering",
  				isMany: true
  			},
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Rendering",
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "HumanPerformer",
  		superClass: [
  			"Performer"
  		]
  	},
  	{
  		name: "PotentialOwner",
  		superClass: [
  			"HumanPerformer"
  		]
  	},
  	{
  		name: "GlobalUserTask",
  		superClass: [
  			"GlobalTask"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "renderings",
  				type: "Rendering",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Gateway",
  		isAbstract: true,
  		superClass: [
  			"FlowNode"
  		],
  		properties: [
  			{
  				name: "gatewayDirection",
  				type: "GatewayDirection",
  				"default": "Unspecified",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "EventBasedGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "instantiate",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "eventGatewayType",
  				type: "EventBasedGatewayType",
  				isAttr: true,
  				"default": "Exclusive"
  			}
  		]
  	},
  	{
  		name: "ComplexGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "activationCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ExclusiveGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "InclusiveGateway",
  		superClass: [
  			"Gateway"
  		],
  		properties: [
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ParallelGateway",
  		superClass: [
  			"Gateway"
  		]
  	},
  	{
  		name: "RootElement",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Relationship",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "type",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "direction",
  				type: "RelationshipDirection",
  				isAttr: true
  			},
  			{
  				name: "source",
  				isMany: true,
  				isReference: true,
  				type: "Element"
  			},
  			{
  				name: "target",
  				isMany: true,
  				isReference: true,
  				type: "Element"
  			}
  		]
  	},
  	{
  		name: "BaseElement",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				isAttr: true,
  				type: "String",
  				isId: true
  			},
  			{
  				name: "documentation",
  				type: "Documentation",
  				isMany: true
  			},
  			{
  				name: "extensionDefinitions",
  				type: "ExtensionDefinition",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "extensionElements",
  				type: "ExtensionElements"
  			}
  		]
  	},
  	{
  		name: "Extension",
  		properties: [
  			{
  				name: "mustUnderstand",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "definition",
  				type: "ExtensionDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ExtensionDefinition",
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "extensionAttributeDefinitions",
  				type: "ExtensionAttributeDefinition",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ExtensionAttributeDefinition",
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "type",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isReference",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "extensionDefinition",
  				type: "ExtensionDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ExtensionElements",
  		properties: [
  			{
  				name: "valueRef",
  				isAttr: true,
  				isReference: true,
  				type: "Element"
  			},
  			{
  				name: "values",
  				type: "Element",
  				isMany: true
  			},
  			{
  				name: "extensionAttributeDefinition",
  				type: "ExtensionAttributeDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Documentation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "text",
  				type: "String",
  				isBody: true
  			},
  			{
  				name: "textFormat",
  				"default": "text/plain",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Event",
  		isAbstract: true,
  		superClass: [
  			"FlowNode",
  			"InteractionNode"
  		],
  		properties: [
  			{
  				name: "properties",
  				type: "Property",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "IntermediateCatchEvent",
  		superClass: [
  			"CatchEvent"
  		]
  	},
  	{
  		name: "IntermediateThrowEvent",
  		superClass: [
  			"ThrowEvent"
  		]
  	},
  	{
  		name: "EndEvent",
  		superClass: [
  			"ThrowEvent"
  		]
  	},
  	{
  		name: "StartEvent",
  		superClass: [
  			"CatchEvent"
  		],
  		properties: [
  			{
  				name: "isInterrupting",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "ThrowEvent",
  		isAbstract: true,
  		superClass: [
  			"Event"
  		],
  		properties: [
  			{
  				name: "dataInputs",
  				type: "DataInput",
  				isMany: true
  			},
  			{
  				name: "dataInputAssociations",
  				type: "DataInputAssociation",
  				isMany: true
  			},
  			{
  				name: "inputSet",
  				type: "InputSet"
  			},
  			{
  				name: "eventDefinitions",
  				type: "EventDefinition",
  				isMany: true
  			},
  			{
  				name: "eventDefinitionRef",
  				type: "EventDefinition",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CatchEvent",
  		isAbstract: true,
  		superClass: [
  			"Event"
  		],
  		properties: [
  			{
  				name: "parallelMultiple",
  				isAttr: true,
  				type: "Boolean",
  				"default": false
  			},
  			{
  				name: "dataOutputs",
  				type: "DataOutput",
  				isMany: true
  			},
  			{
  				name: "dataOutputAssociations",
  				type: "DataOutputAssociation",
  				isMany: true
  			},
  			{
  				name: "outputSet",
  				type: "OutputSet"
  			},
  			{
  				name: "eventDefinitions",
  				type: "EventDefinition",
  				isMany: true
  			},
  			{
  				name: "eventDefinitionRef",
  				type: "EventDefinition",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "BoundaryEvent",
  		superClass: [
  			"CatchEvent"
  		],
  		properties: [
  			{
  				name: "cancelActivity",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "attachedToRef",
  				type: "Activity",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "EventDefinition",
  		isAbstract: true,
  		superClass: [
  			"RootElement"
  		]
  	},
  	{
  		name: "CancelEventDefinition",
  		superClass: [
  			"EventDefinition"
  		]
  	},
  	{
  		name: "ErrorEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "errorRef",
  				type: "Error",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "TerminateEventDefinition",
  		superClass: [
  			"EventDefinition"
  		]
  	},
  	{
  		name: "EscalationEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "escalationRef",
  				type: "Escalation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Escalation",
  		properties: [
  			{
  				name: "structureRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "escalationCode",
  				isAttr: true,
  				type: "String"
  			}
  		],
  		superClass: [
  			"RootElement"
  		]
  	},
  	{
  		name: "CompensateEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "waitForCompletion",
  				isAttr: true,
  				type: "Boolean",
  				"default": true
  			},
  			{
  				name: "activityRef",
  				type: "Activity",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "TimerEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "timeDate",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "timeCycle",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "timeDuration",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "LinkEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "target",
  				type: "LinkEventDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "source",
  				type: "LinkEventDefinition",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "MessageEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ConditionalEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "condition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "SignalEventDefinition",
  		superClass: [
  			"EventDefinition"
  		],
  		properties: [
  			{
  				name: "signalRef",
  				type: "Signal",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Signal",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "structureRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ImplicitThrowEvent",
  		superClass: [
  			"ThrowEvent"
  		]
  	},
  	{
  		name: "DataState",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ItemAwareElement",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "itemSubjectRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "dataState",
  				type: "DataState"
  			}
  		]
  	},
  	{
  		name: "DataAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "assignment",
  				type: "Assignment",
  				isMany: true
  			},
  			{
  				name: "sourceRef",
  				type: "ItemAwareElement",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "ItemAwareElement",
  				isReference: true
  			},
  			{
  				name: "transformation",
  				type: "FormalExpression",
  				xml: {
  					serialize: "property"
  				}
  			}
  		]
  	},
  	{
  		name: "DataInput",
  		superClass: [
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "inputSetRef",
  				type: "InputSet",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "inputSetWithOptional",
  				type: "InputSet",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "inputSetWithWhileExecuting",
  				type: "InputSet",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "DataOutput",
  		superClass: [
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "outputSetRef",
  				type: "OutputSet",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outputSetWithOptional",
  				type: "OutputSet",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outputSetWithWhileExecuting",
  				type: "OutputSet",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "InputSet",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "dataInputRefs",
  				type: "DataInput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "optionalInputRefs",
  				type: "DataInput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "whileExecutingInputRefs",
  				type: "DataInput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outputSetRefs",
  				type: "OutputSet",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "OutputSet",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "dataOutputRefs",
  				type: "DataOutput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "inputSetRefs",
  				type: "InputSet",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "optionalOutputRefs",
  				type: "DataOutput",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "whileExecutingOutputRefs",
  				type: "DataOutput",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Property",
  		superClass: [
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "DataInputAssociation",
  		superClass: [
  			"DataAssociation"
  		]
  	},
  	{
  		name: "DataOutputAssociation",
  		superClass: [
  			"DataAssociation"
  		]
  	},
  	{
  		name: "InputOutputSpecification",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "dataInputs",
  				type: "DataInput",
  				isMany: true
  			},
  			{
  				name: "dataOutputs",
  				type: "DataOutput",
  				isMany: true
  			},
  			{
  				name: "inputSets",
  				type: "InputSet",
  				isMany: true
  			},
  			{
  				name: "outputSets",
  				type: "OutputSet",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "DataObject",
  		superClass: [
  			"FlowElement",
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "InputOutputBinding",
  		properties: [
  			{
  				name: "inputDataRef",
  				type: "InputSet",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outputDataRef",
  				type: "OutputSet",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Assignment",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "from",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "to",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "DataStore",
  		superClass: [
  			"RootElement",
  			"ItemAwareElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "capacity",
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "isUnlimited",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "DataStoreReference",
  		superClass: [
  			"ItemAwareElement",
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "dataStoreRef",
  				type: "DataStore",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "DataObjectReference",
  		superClass: [
  			"ItemAwareElement",
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "dataObjectRef",
  				type: "DataObject",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ConversationLink",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "sourceRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ConversationAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "innerConversationNodeRef",
  				type: "ConversationNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outerConversationNodeRef",
  				type: "ConversationNode",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CallConversation",
  		superClass: [
  			"ConversationNode"
  		],
  		properties: [
  			{
  				name: "calledCollaborationRef",
  				type: "Collaboration",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "participantAssociations",
  				type: "ParticipantAssociation",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Conversation",
  		superClass: [
  			"ConversationNode"
  		]
  	},
  	{
  		name: "SubConversation",
  		superClass: [
  			"ConversationNode"
  		],
  		properties: [
  			{
  				name: "conversationNodes",
  				type: "ConversationNode",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ConversationNode",
  		isAbstract: true,
  		superClass: [
  			"InteractionNode",
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "messageFlowRefs",
  				type: "MessageFlow",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "correlationKeys",
  				type: "CorrelationKey",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "GlobalConversation",
  		superClass: [
  			"Collaboration"
  		]
  	},
  	{
  		name: "PartnerEntity",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "PartnerRole",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationProperty",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "correlationPropertyRetrievalExpression",
  				type: "CorrelationPropertyRetrievalExpression",
  				isMany: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "type",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Error",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "structureRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "errorCode",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "CorrelationKey",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "correlationPropertyRef",
  				type: "CorrelationProperty",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Expression",
  		superClass: [
  			"BaseElement"
  		],
  		isAbstract: false,
  		properties: [
  			{
  				name: "body",
  				type: "String",
  				isBody: true
  			}
  		]
  	},
  	{
  		name: "FormalExpression",
  		superClass: [
  			"Expression"
  		],
  		properties: [
  			{
  				name: "language",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "evaluatesToTypeRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Message",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "itemRef",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ItemDefinition",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "itemKind",
  				type: "ItemKind",
  				isAttr: true
  			},
  			{
  				name: "structureRef",
  				type: "String",
  				isAttr: true
  			},
  			{
  				name: "isCollection",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "import",
  				type: "Import",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "FlowElement",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "auditing",
  				type: "Auditing"
  			},
  			{
  				name: "monitoring",
  				type: "Monitoring"
  			},
  			{
  				name: "categoryValueRef",
  				type: "CategoryValue",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "SequenceFlow",
  		superClass: [
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "isImmediate",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "conditionExpression",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "sourceRef",
  				type: "FlowNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "FlowNode",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "FlowElementsContainer",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "laneSets",
  				type: "LaneSet",
  				isMany: true
  			},
  			{
  				name: "flowElements",
  				type: "FlowElement",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "CallableElement",
  		isAbstract: true,
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "ioSpecification",
  				type: "InputOutputSpecification",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "supportedInterfaceRef",
  				type: "Interface",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "ioBinding",
  				type: "InputOutputBinding",
  				isMany: true,
  				xml: {
  					serialize: "property"
  				}
  			}
  		]
  	},
  	{
  		name: "FlowNode",
  		isAbstract: true,
  		superClass: [
  			"FlowElement"
  		],
  		properties: [
  			{
  				name: "incoming",
  				type: "SequenceFlow",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outgoing",
  				type: "SequenceFlow",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "lanes",
  				type: "Lane",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationPropertyRetrievalExpression",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "messagePath",
  				type: "FormalExpression"
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationPropertyBinding",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "dataPath",
  				type: "FormalExpression"
  			},
  			{
  				name: "correlationPropertyRef",
  				type: "CorrelationProperty",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Resource",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "resourceParameters",
  				type: "ResourceParameter",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ResourceParameter",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isRequired",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "type",
  				type: "ItemDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "CorrelationSubscription",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "correlationKeyRef",
  				type: "CorrelationKey",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "correlationPropertyBinding",
  				type: "CorrelationPropertyBinding",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "MessageFlow",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "sourceRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "InteractionNode",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "MessageFlowAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "innerMessageFlowRef",
  				type: "MessageFlow",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outerMessageFlowRef",
  				type: "MessageFlow",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "InteractionNode",
  		isAbstract: true,
  		properties: [
  			{
  				name: "incomingConversationLinks",
  				type: "ConversationLink",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "outgoingConversationLinks",
  				type: "ConversationLink",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Participant",
  		superClass: [
  			"InteractionNode",
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "interfaceRef",
  				type: "Interface",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "participantMultiplicity",
  				type: "ParticipantMultiplicity"
  			},
  			{
  				name: "endPointRefs",
  				type: "EndPoint",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "processRef",
  				type: "Process",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ParticipantAssociation",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "innerParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "outerParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ParticipantMultiplicity",
  		properties: [
  			{
  				name: "minimum",
  				"default": 0,
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "maximum",
  				"default": 1,
  				isAttr: true,
  				type: "Integer"
  			}
  		],
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Collaboration",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "isClosed",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "participants",
  				type: "Participant",
  				isMany: true
  			},
  			{
  				name: "messageFlows",
  				type: "MessageFlow",
  				isMany: true
  			},
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			},
  			{
  				name: "conversations",
  				type: "ConversationNode",
  				isMany: true
  			},
  			{
  				name: "conversationAssociations",
  				type: "ConversationAssociation"
  			},
  			{
  				name: "participantAssociations",
  				type: "ParticipantAssociation",
  				isMany: true
  			},
  			{
  				name: "messageFlowAssociations",
  				type: "MessageFlowAssociation",
  				isMany: true
  			},
  			{
  				name: "correlationKeys",
  				type: "CorrelationKey",
  				isMany: true
  			},
  			{
  				name: "choreographyRef",
  				type: "Choreography",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "conversationLinks",
  				type: "ConversationLink",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ChoreographyActivity",
  		isAbstract: true,
  		superClass: [
  			"FlowNode"
  		],
  		properties: [
  			{
  				name: "participantRef",
  				type: "Participant",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "initiatingParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "correlationKeys",
  				type: "CorrelationKey",
  				isMany: true
  			},
  			{
  				name: "loopType",
  				type: "ChoreographyLoopType",
  				"default": "None",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "CallChoreography",
  		superClass: [
  			"ChoreographyActivity"
  		],
  		properties: [
  			{
  				name: "calledChoreographyRef",
  				type: "Choreography",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "participantAssociations",
  				type: "ParticipantAssociation",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "SubChoreography",
  		superClass: [
  			"ChoreographyActivity",
  			"FlowElementsContainer"
  		],
  		properties: [
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "ChoreographyTask",
  		superClass: [
  			"ChoreographyActivity"
  		],
  		properties: [
  			{
  				name: "messageFlowRef",
  				type: "MessageFlow",
  				isMany: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Choreography",
  		superClass: [
  			"Collaboration",
  			"FlowElementsContainer"
  		]
  	},
  	{
  		name: "GlobalChoreographyTask",
  		superClass: [
  			"Choreography"
  		],
  		properties: [
  			{
  				name: "initiatingParticipantRef",
  				type: "Participant",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "TextAnnotation",
  		superClass: [
  			"Artifact"
  		],
  		properties: [
  			{
  				name: "text",
  				type: "String"
  			},
  			{
  				name: "textFormat",
  				"default": "text/plain",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Group",
  		superClass: [
  			"Artifact"
  		],
  		properties: [
  			{
  				name: "categoryValueRef",
  				type: "CategoryValue",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Association",
  		superClass: [
  			"Artifact"
  		],
  		properties: [
  			{
  				name: "associationDirection",
  				type: "AssociationDirection",
  				isAttr: true
  			},
  			{
  				name: "sourceRef",
  				type: "BaseElement",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "targetRef",
  				type: "BaseElement",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "Category",
  		superClass: [
  			"RootElement"
  		],
  		properties: [
  			{
  				name: "categoryValue",
  				type: "CategoryValue",
  				isMany: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Artifact",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "CategoryValue",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "categorizedFlowElements",
  				type: "FlowElement",
  				isVirtual: true,
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "value",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Activity",
  		isAbstract: true,
  		superClass: [
  			"FlowNode"
  		],
  		properties: [
  			{
  				name: "isForCompensation",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "default",
  				type: "SequenceFlow",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "ioSpecification",
  				type: "InputOutputSpecification",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "boundaryEventRefs",
  				type: "BoundaryEvent",
  				isMany: true,
  				isReference: true
  			},
  			{
  				name: "properties",
  				type: "Property",
  				isMany: true
  			},
  			{
  				name: "dataInputAssociations",
  				type: "DataInputAssociation",
  				isMany: true
  			},
  			{
  				name: "dataOutputAssociations",
  				type: "DataOutputAssociation",
  				isMany: true
  			},
  			{
  				name: "startQuantity",
  				"default": 1,
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "resources",
  				type: "ResourceRole",
  				isMany: true
  			},
  			{
  				name: "completionQuantity",
  				"default": 1,
  				isAttr: true,
  				type: "Integer"
  			},
  			{
  				name: "loopCharacteristics",
  				type: "LoopCharacteristics"
  			}
  		]
  	},
  	{
  		name: "ServiceTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "SubProcess",
  		superClass: [
  			"Activity",
  			"FlowElementsContainer",
  			"InteractionNode"
  		],
  		properties: [
  			{
  				name: "triggeredByEvent",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "artifacts",
  				type: "Artifact",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "LoopCharacteristics",
  		isAbstract: true,
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "MultiInstanceLoopCharacteristics",
  		superClass: [
  			"LoopCharacteristics"
  		],
  		properties: [
  			{
  				name: "isSequential",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "behavior",
  				type: "MultiInstanceBehavior",
  				"default": "All",
  				isAttr: true
  			},
  			{
  				name: "loopCardinality",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "loopDataInputRef",
  				type: "ItemAwareElement",
  				isReference: true
  			},
  			{
  				name: "loopDataOutputRef",
  				type: "ItemAwareElement",
  				isReference: true
  			},
  			{
  				name: "inputDataItem",
  				type: "DataInput",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "outputDataItem",
  				type: "DataOutput",
  				xml: {
  					serialize: "property"
  				}
  			},
  			{
  				name: "complexBehaviorDefinition",
  				type: "ComplexBehaviorDefinition",
  				isMany: true
  			},
  			{
  				name: "completionCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "oneBehaviorEventRef",
  				type: "EventDefinition",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "noneBehaviorEventRef",
  				type: "EventDefinition",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "StandardLoopCharacteristics",
  		superClass: [
  			"LoopCharacteristics"
  		],
  		properties: [
  			{
  				name: "testBefore",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "loopCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "loopMaximum",
  				type: "Integer",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "CallActivity",
  		superClass: [
  			"Activity"
  		],
  		properties: [
  			{
  				name: "calledElement",
  				type: "String",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Task",
  		superClass: [
  			"Activity",
  			"InteractionNode"
  		]
  	},
  	{
  		name: "SendTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ReceiveTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "instantiate",
  				"default": false,
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "operationRef",
  				type: "Operation",
  				isAttr: true,
  				isReference: true
  			},
  			{
  				name: "messageRef",
  				type: "Message",
  				isAttr: true,
  				isReference: true
  			}
  		]
  	},
  	{
  		name: "ScriptTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "scriptFormat",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "script",
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "BusinessRuleTask",
  		superClass: [
  			"Task"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "AdHocSubProcess",
  		superClass: [
  			"SubProcess"
  		],
  		properties: [
  			{
  				name: "completionCondition",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "ordering",
  				type: "AdHocOrdering",
  				isAttr: true
  			},
  			{
  				name: "cancelRemainingInstances",
  				"default": true,
  				isAttr: true,
  				type: "Boolean"
  			}
  		]
  	},
  	{
  		name: "Transaction",
  		superClass: [
  			"SubProcess"
  		],
  		properties: [
  			{
  				name: "protocol",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "method",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "GlobalScriptTask",
  		superClass: [
  			"GlobalTask"
  		],
  		properties: [
  			{
  				name: "scriptLanguage",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "script",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "GlobalBusinessRuleTask",
  		superClass: [
  			"GlobalTask"
  		],
  		properties: [
  			{
  				name: "implementation",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ComplexBehaviorDefinition",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "condition",
  				type: "FormalExpression"
  			},
  			{
  				name: "event",
  				type: "ImplicitThrowEvent"
  			}
  		]
  	},
  	{
  		name: "ResourceRole",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "resourceRef",
  				type: "Resource",
  				isReference: true
  			},
  			{
  				name: "resourceParameterBindings",
  				type: "ResourceParameterBinding",
  				isMany: true
  			},
  			{
  				name: "resourceAssignmentExpression",
  				type: "ResourceAssignmentExpression"
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ResourceParameterBinding",
  		properties: [
  			{
  				name: "expression",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			},
  			{
  				name: "parameterRef",
  				type: "ResourceParameter",
  				isAttr: true,
  				isReference: true
  			}
  		],
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "ResourceAssignmentExpression",
  		properties: [
  			{
  				name: "expression",
  				type: "Expression",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		],
  		superClass: [
  			"BaseElement"
  		]
  	},
  	{
  		name: "Import",
  		properties: [
  			{
  				name: "importType",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "location",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "namespace",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "Definitions",
  		superClass: [
  			"BaseElement"
  		],
  		properties: [
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "targetNamespace",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "expressionLanguage",
  				"default": "http://www.w3.org/1999/XPath",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "typeLanguage",
  				"default": "http://www.w3.org/2001/XMLSchema",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "imports",
  				type: "Import",
  				isMany: true
  			},
  			{
  				name: "extensions",
  				type: "Extension",
  				isMany: true
  			},
  			{
  				name: "rootElements",
  				type: "RootElement",
  				isMany: true
  			},
  			{
  				name: "diagrams",
  				isMany: true,
  				type: "bpmndi:BPMNDiagram"
  			},
  			{
  				name: "exporter",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "relationships",
  				type: "Relationship",
  				isMany: true
  			},
  			{
  				name: "exporterVersion",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	}
  ];
  var enumerations = [
  	{
  		name: "ProcessType",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "Public"
  			},
  			{
  				name: "Private"
  			}
  		]
  	},
  	{
  		name: "GatewayDirection",
  		literalValues: [
  			{
  				name: "Unspecified"
  			},
  			{
  				name: "Converging"
  			},
  			{
  				name: "Diverging"
  			},
  			{
  				name: "Mixed"
  			}
  		]
  	},
  	{
  		name: "EventBasedGatewayType",
  		literalValues: [
  			{
  				name: "Parallel"
  			},
  			{
  				name: "Exclusive"
  			}
  		]
  	},
  	{
  		name: "RelationshipDirection",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "Forward"
  			},
  			{
  				name: "Backward"
  			},
  			{
  				name: "Both"
  			}
  		]
  	},
  	{
  		name: "ItemKind",
  		literalValues: [
  			{
  				name: "Physical"
  			},
  			{
  				name: "Information"
  			}
  		]
  	},
  	{
  		name: "ChoreographyLoopType",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "Standard"
  			},
  			{
  				name: "MultiInstanceSequential"
  			},
  			{
  				name: "MultiInstanceParallel"
  			}
  		]
  	},
  	{
  		name: "AssociationDirection",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "One"
  			},
  			{
  				name: "Both"
  			}
  		]
  	},
  	{
  		name: "MultiInstanceBehavior",
  		literalValues: [
  			{
  				name: "None"
  			},
  			{
  				name: "One"
  			},
  			{
  				name: "All"
  			},
  			{
  				name: "Complex"
  			}
  		]
  	},
  	{
  		name: "AdHocOrdering",
  		literalValues: [
  			{
  				name: "Parallel"
  			},
  			{
  				name: "Sequential"
  			}
  		]
  	}
  ];
  var prefix$1 = "bpmn";
  var xml = {
  	tagAlias: "lowerCase",
  	typePrefix: "t"
  };
  var BpmnPackage = {
  	name: name,
  	uri: uri,
  	associations: associations,
  	types: types$1,
  	enumerations: enumerations,
  	prefix: prefix$1,
  	xml: xml
  };

  var name$1 = "BPMNDI";
  var uri$1 = "http://www.omg.org/spec/BPMN/20100524/DI";
  var types$2 = [
  	{
  		name: "BPMNDiagram",
  		properties: [
  			{
  				name: "plane",
  				type: "BPMNPlane",
  				redefines: "di:Diagram#rootElement"
  			},
  			{
  				name: "labelStyle",
  				type: "BPMNLabelStyle",
  				isMany: true
  			}
  		],
  		superClass: [
  			"di:Diagram"
  		]
  	},
  	{
  		name: "BPMNPlane",
  		properties: [
  			{
  				name: "bpmnElement",
  				isAttr: true,
  				isReference: true,
  				type: "bpmn:BaseElement",
  				redefines: "di:DiagramElement#modelElement"
  			}
  		],
  		superClass: [
  			"di:Plane"
  		]
  	},
  	{
  		name: "BPMNShape",
  		properties: [
  			{
  				name: "bpmnElement",
  				isAttr: true,
  				isReference: true,
  				type: "bpmn:BaseElement",
  				redefines: "di:DiagramElement#modelElement"
  			},
  			{
  				name: "isHorizontal",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "isExpanded",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "isMarkerVisible",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "label",
  				type: "BPMNLabel"
  			},
  			{
  				name: "isMessageVisible",
  				isAttr: true,
  				type: "Boolean"
  			},
  			{
  				name: "participantBandKind",
  				type: "ParticipantBandKind",
  				isAttr: true
  			},
  			{
  				name: "choreographyActivityShape",
  				type: "BPMNShape",
  				isAttr: true,
  				isReference: true
  			}
  		],
  		superClass: [
  			"di:LabeledShape"
  		]
  	},
  	{
  		name: "BPMNEdge",
  		properties: [
  			{
  				name: "label",
  				type: "BPMNLabel"
  			},
  			{
  				name: "bpmnElement",
  				isAttr: true,
  				isReference: true,
  				type: "bpmn:BaseElement",
  				redefines: "di:DiagramElement#modelElement"
  			},
  			{
  				name: "sourceElement",
  				isAttr: true,
  				isReference: true,
  				type: "di:DiagramElement",
  				redefines: "di:Edge#source"
  			},
  			{
  				name: "targetElement",
  				isAttr: true,
  				isReference: true,
  				type: "di:DiagramElement",
  				redefines: "di:Edge#target"
  			},
  			{
  				name: "messageVisibleKind",
  				type: "MessageVisibleKind",
  				isAttr: true,
  				"default": "initiating"
  			}
  		],
  		superClass: [
  			"di:LabeledEdge"
  		]
  	},
  	{
  		name: "BPMNLabel",
  		properties: [
  			{
  				name: "labelStyle",
  				type: "BPMNLabelStyle",
  				isAttr: true,
  				isReference: true,
  				redefines: "di:DiagramElement#style"
  			}
  		],
  		superClass: [
  			"di:Label"
  		]
  	},
  	{
  		name: "BPMNLabelStyle",
  		properties: [
  			{
  				name: "font",
  				type: "dc:Font"
  			}
  		],
  		superClass: [
  			"di:Style"
  		]
  	}
  ];
  var enumerations$1 = [
  	{
  		name: "ParticipantBandKind",
  		literalValues: [
  			{
  				name: "top_initiating"
  			},
  			{
  				name: "middle_initiating"
  			},
  			{
  				name: "bottom_initiating"
  			},
  			{
  				name: "top_non_initiating"
  			},
  			{
  				name: "middle_non_initiating"
  			},
  			{
  				name: "bottom_non_initiating"
  			}
  		]
  	},
  	{
  		name: "MessageVisibleKind",
  		literalValues: [
  			{
  				name: "initiating"
  			},
  			{
  				name: "non_initiating"
  			}
  		]
  	}
  ];
  var associations$1 = [
  ];
  var prefix$2 = "bpmndi";
  var BpmnDiPackage = {
  	name: name$1,
  	uri: uri$1,
  	types: types$2,
  	enumerations: enumerations$1,
  	associations: associations$1,
  	prefix: prefix$2
  };

  var name$2 = "DC";
  var uri$2 = "http://www.omg.org/spec/DD/20100524/DC";
  var types$3 = [
  	{
  		name: "Boolean"
  	},
  	{
  		name: "Integer"
  	},
  	{
  		name: "Real"
  	},
  	{
  		name: "String"
  	},
  	{
  		name: "Font",
  		properties: [
  			{
  				name: "name",
  				type: "String",
  				isAttr: true
  			},
  			{
  				name: "size",
  				type: "Real",
  				isAttr: true
  			},
  			{
  				name: "isBold",
  				type: "Boolean",
  				isAttr: true
  			},
  			{
  				name: "isItalic",
  				type: "Boolean",
  				isAttr: true
  			},
  			{
  				name: "isUnderline",
  				type: "Boolean",
  				isAttr: true
  			},
  			{
  				name: "isStrikeThrough",
  				type: "Boolean",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Point",
  		properties: [
  			{
  				name: "x",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			},
  			{
  				name: "y",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			}
  		]
  	},
  	{
  		name: "Bounds",
  		properties: [
  			{
  				name: "x",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			},
  			{
  				name: "y",
  				type: "Real",
  				"default": "0",
  				isAttr: true
  			},
  			{
  				name: "width",
  				type: "Real",
  				isAttr: true
  			},
  			{
  				name: "height",
  				type: "Real",
  				isAttr: true
  			}
  		]
  	}
  ];
  var prefix$3 = "dc";
  var associations$2 = [
  ];
  var DcPackage = {
  	name: name$2,
  	uri: uri$2,
  	types: types$3,
  	prefix: prefix$3,
  	associations: associations$2
  };

  var name$3 = "DI";
  var uri$3 = "http://www.omg.org/spec/DD/20100524/DI";
  var types$4 = [
  	{
  		name: "DiagramElement",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				type: "String",
  				isAttr: true,
  				isId: true
  			},
  			{
  				name: "extension",
  				type: "Extension"
  			},
  			{
  				name: "owningDiagram",
  				type: "Diagram",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "owningElement",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "modelElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true,
  				type: "Element"
  			},
  			{
  				name: "style",
  				type: "Style",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "ownedElement",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Node",
  		isAbstract: true,
  		superClass: [
  			"DiagramElement"
  		]
  	},
  	{
  		name: "Edge",
  		isAbstract: true,
  		superClass: [
  			"DiagramElement"
  		],
  		properties: [
  			{
  				name: "source",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "target",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true,
  				isReference: true
  			},
  			{
  				name: "waypoint",
  				isUnique: false,
  				isMany: true,
  				type: "dc:Point",
  				xml: {
  					serialize: "xsi:type"
  				}
  			}
  		]
  	},
  	{
  		name: "Diagram",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				type: "String",
  				isAttr: true,
  				isId: true
  			},
  			{
  				name: "rootElement",
  				type: "DiagramElement",
  				isReadOnly: true,
  				isVirtual: true
  			},
  			{
  				name: "name",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "documentation",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "resolution",
  				isAttr: true,
  				type: "Real"
  			},
  			{
  				name: "ownedStyle",
  				type: "Style",
  				isReadOnly: true,
  				isVirtual: true,
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Shape",
  		isAbstract: true,
  		superClass: [
  			"Node"
  		],
  		properties: [
  			{
  				name: "bounds",
  				type: "dc:Bounds"
  			}
  		]
  	},
  	{
  		name: "Plane",
  		isAbstract: true,
  		superClass: [
  			"Node"
  		],
  		properties: [
  			{
  				name: "planeElement",
  				type: "DiagramElement",
  				subsettedProperty: "DiagramElement-ownedElement",
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "LabeledEdge",
  		isAbstract: true,
  		superClass: [
  			"Edge"
  		],
  		properties: [
  			{
  				name: "ownedLabel",
  				type: "Label",
  				isReadOnly: true,
  				subsettedProperty: "DiagramElement-ownedElement",
  				isVirtual: true,
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "LabeledShape",
  		isAbstract: true,
  		superClass: [
  			"Shape"
  		],
  		properties: [
  			{
  				name: "ownedLabel",
  				type: "Label",
  				isReadOnly: true,
  				subsettedProperty: "DiagramElement-ownedElement",
  				isVirtual: true,
  				isMany: true
  			}
  		]
  	},
  	{
  		name: "Label",
  		isAbstract: true,
  		superClass: [
  			"Node"
  		],
  		properties: [
  			{
  				name: "bounds",
  				type: "dc:Bounds"
  			}
  		]
  	},
  	{
  		name: "Style",
  		isAbstract: true,
  		properties: [
  			{
  				name: "id",
  				type: "String",
  				isAttr: true,
  				isId: true
  			}
  		]
  	},
  	{
  		name: "Extension",
  		properties: [
  			{
  				name: "values",
  				type: "Element",
  				isMany: true
  			}
  		]
  	}
  ];
  var associations$3 = [
  ];
  var prefix$4 = "di";
  var xml$1 = {
  	tagAlias: "lowerCase"
  };
  var DiPackage = {
  	name: name$3,
  	uri: uri$3,
  	types: types$4,
  	associations: associations$3,
  	prefix: prefix$4,
  	xml: xml$1
  };

  var name$4 = "bpmn.io colors for BPMN";
  var uri$4 = "http://bpmn.io/schema/bpmn/biocolor/1.0";
  var prefix$5 = "bioc";
  var types$5 = [
  	{
  		name: "ColoredShape",
  		"extends": [
  			"bpmndi:BPMNShape"
  		],
  		properties: [
  			{
  				name: "stroke",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "fill",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	},
  	{
  		name: "ColoredEdge",
  		"extends": [
  			"bpmndi:BPMNEdge"
  		],
  		properties: [
  			{
  				name: "stroke",
  				isAttr: true,
  				type: "String"
  			},
  			{
  				name: "fill",
  				isAttr: true,
  				type: "String"
  			}
  		]
  	}
  ];
  var enumerations$2 = [
  ];
  var associations$4 = [
  ];
  var BiocPackage = {
  	name: name$4,
  	uri: uri$4,
  	prefix: prefix$5,
  	types: types$5,
  	enumerations: enumerations$2,
  	associations: associations$4
  };

  var packages = {
    bpmn: BpmnPackage,
    bpmndi: BpmnDiPackage,
    dc: DcPackage,
    di: DiPackage,
    bioc: BiocPackage
  };

  function BpmnModdle$1(additionalPackages, options) {
    var pks = assign({}, packages, additionalPackages);

    return new BpmnModdle(pks, options);
  }

  function elementToString(e) {
    if (!e) {
      return '<null>';
    }

    return '<' + e.$type + (e.id ? ' id="' + e.id : '') + '" />';
  }

  var diRefs = new objectRefs(
    { name: 'bpmnElement', enumerable: true },
    { name: 'di', configurable: true }
  );

  /**
   * Returns true if an element has the given meta-model type
   *
   * @param  {ModdleElement}  element
   * @param  {String}         type
   *
   * @return {Boolean}
   */
  function is(element, type) {
    return element.$instanceOf(type);
  }


  /**
   * Find a suitable display candidate for definitions where the DI does not
   * correctly specify one.
   */
  function findDisplayCandidate(definitions) {
    return find(definitions.rootElements, function(e) {
      return is(e, 'bpmn:Process') || is(e, 'bpmn:Collaboration');
    });
  }


  function BpmnTreeWalker(handler, translate) {

    // list of containers already walked
    var handledElements = {};

    // list of elements to handle deferred to ensure
    // prerequisites are drawn
    var deferred = [];

    // Helpers //////////////////////

    function contextual(fn, ctx) {
      return function(e) {
        fn(e, ctx);
      };
    }

    function handled(element) {
      handledElements[element.id] = element;
    }

    function isHandled(element) {
      return handledElements[element.id];
    }

    function visit(element, ctx) {

      var gfx = element.gfx;

      // avoid multiple rendering of elements
      if (gfx) {
        throw new Error(
          translate('already rendered {element}', { element: elementToString(element) })
        );
      }

      // call handler
      return handler.element(element, ctx);
    }

    function visitRoot(element, diagram) {
      return handler.root(element, diagram);
    }

    function visitIfDi(element, ctx) {

      try {
        var gfx = element.di && visit(element, ctx);

        handled(element);

        return gfx;
      } catch (e) {
        logError(e.message, { element: element, error: e });

        console.error(translate('failed to import {element}', { element: elementToString(element) }));
        console.error(e);
      }
    }

    function logError(message, context) {
      handler.error(message, context);
    }

    // DI handling //////////////////////

    function registerDi(di) {
      var bpmnElement = di.bpmnElement;

      if (bpmnElement) {
        if (bpmnElement.di) {
          logError(
            translate('multiple DI elements defined for {element}', {
              element: elementToString(bpmnElement)
            }),
            { element: bpmnElement }
          );
        } else {
          diRefs.bind(bpmnElement, 'di');
          bpmnElement.di = di;
        }
      } else {
        logError(
          translate('no bpmnElement referenced in {element}', {
            element: elementToString(di)
          }),
          { element: di }
        );
      }
    }

    function handleDiagram(diagram) {
      handlePlane(diagram.plane);
    }

    function handlePlane(plane) {
      registerDi(plane);

      forEach(plane.planeElement, handlePlaneElement);
    }

    function handlePlaneElement(planeElement) {
      registerDi(planeElement);
    }


    // Semantic handling //////////////////////

    /**
     * Handle definitions and return the rendered diagram (if any)
     *
     * @param {ModdleElement} definitions to walk and import
     * @param {ModdleElement} [diagram] specific diagram to import and display
     *
     * @throws {Error} if no diagram to display could be found
     */
    function handleDefinitions(definitions, diagram) {
      // make sure we walk the correct bpmnElement

      var diagrams = definitions.diagrams;

      if (diagram && diagrams.indexOf(diagram) === -1) {
        throw new Error(translate('diagram not part of bpmn:Definitions'));
      }

      if (!diagram && diagrams && diagrams.length) {
        diagram = diagrams[0];
      }

      // no diagram -> nothing to import
      if (!diagram) {
        throw new Error(translate('no diagram to display'));
      }

      // load DI from selected diagram only
      handleDiagram(diagram);


      var plane = diagram.plane;

      if (!plane) {
        throw new Error(translate(
          'no plane for {element}',
          { element: elementToString(diagram) }
        ));
      }

      var rootElement = plane.bpmnElement;

      // ensure we default to a suitable display candidate (process or collaboration),
      // even if non is specified in DI
      if (!rootElement) {
        rootElement = findDisplayCandidate(definitions);

        if (!rootElement) {
          throw new Error(translate('no process or collaboration to display'));
        } else {

          logError(
            translate('correcting missing bpmnElement on {plane} to {rootElement}', {
              plane: elementToString(plane),
              rootElement: elementToString(rootElement)
            })
          );

          // correct DI on the fly
          plane.bpmnElement = rootElement;
          registerDi(plane);
        }
      }


      var ctx = visitRoot(rootElement, plane);

      if (is(rootElement, 'bpmn:Process')) {
        handleProcess(rootElement, ctx);
      } else if (is(rootElement, 'bpmn:Collaboration')) {
        handleCollaboration(rootElement);

        // force drawing of everything not yet drawn that is part of the target DI
        handleUnhandledProcesses(definitions.rootElements, ctx);
      } else {
        throw new Error(
          translate('unsupported bpmnElement for {plane}: {rootElement}', {
            plane: elementToString(plane),
            rootElement: elementToString(rootElement)
          })
        );
      }

      // handle all deferred elements
      handleDeferred();
    }

    function handleDeferred() {

      var fn;

      // drain deferred until empty
      while (deferred.length) {
        fn = deferred.shift();

        fn();
      }
    }

    function handleProcess(process, context) {
      handleFlowElementsContainer(process, context);
      handleIoSpecification(process.ioSpecification, context);

      handleArtifacts(process.artifacts, context);

      // log process handled
      handled(process);
    }

    function handleUnhandledProcesses(rootElements, ctx) {

      // walk through all processes that have not yet been drawn and draw them
      // if they contain lanes with DI information.
      // we do this to pass the free-floating lane test cases in the MIWG test suite
      var processes = filter(rootElements, function(e) {
        return !isHandled(e) && is(e, 'bpmn:Process') && e.laneSets;
      });

      processes.forEach(contextual(handleProcess, ctx));
    }

    function handleMessageFlow(messageFlow, context) {
      visitIfDi(messageFlow, context);
    }

    function handleMessageFlows(messageFlows, context) {
      forEach(messageFlows, contextual(handleMessageFlow, context));
    }

    function handleDataAssociation(association, context) {
      visitIfDi(association, context);
    }

    function handleDataInput(dataInput, context) {
      visitIfDi(dataInput, context);
    }

    function handleDataOutput(dataOutput, context) {
      visitIfDi(dataOutput, context);
    }

    function handleArtifact(artifact, context) {

      // bpmn:TextAnnotation
      // bpmn:Group
      // bpmn:Association

      visitIfDi(artifact, context);
    }

    function handleArtifacts(artifacts, context) {

      forEach(artifacts, function(e) {
        if (is(e, 'bpmn:Association')) {
          deferred.push(function() {
            handleArtifact(e, context);
          });
        } else {
          handleArtifact(e, context);
        }
      });
    }

    function handleIoSpecification(ioSpecification, context) {

      if (!ioSpecification) {
        return;
      }

      forEach(ioSpecification.dataInputs, contextual(handleDataInput, context));
      forEach(ioSpecification.dataOutputs, contextual(handleDataOutput, context));
    }

    function handleSubProcess(subProcess, context) {
      handleFlowElementsContainer(subProcess, context);
      handleArtifacts(subProcess.artifacts, context);
    }

    function handleFlowNode(flowNode, context) {
      var childCtx = visitIfDi(flowNode, context);

      if (is(flowNode, 'bpmn:SubProcess')) {
        handleSubProcess(flowNode, childCtx || context);
      }

      if (is(flowNode, 'bpmn:Activity')) {
        handleIoSpecification(flowNode.ioSpecification, context);
      }

      // defer handling of associations
      // affected types:
      //
      //   * bpmn:Activity
      //   * bpmn:ThrowEvent
      //   * bpmn:CatchEvent
      //
      deferred.push(function() {
        forEach(flowNode.dataInputAssociations, contextual(handleDataAssociation, context));
        forEach(flowNode.dataOutputAssociations, contextual(handleDataAssociation, context));
      });
    }

    function handleSequenceFlow(sequenceFlow, context) {
      visitIfDi(sequenceFlow, context);
    }

    function handleDataElement(dataObject, context) {
      visitIfDi(dataObject, context);
    }

    function handleBoundaryEvent(dataObject, context) {
      visitIfDi(dataObject, context);
    }

    function handleLane(lane, context) {

      deferred.push(function() {

        var newContext = visitIfDi(lane, context);

        if (lane.childLaneSet) {
          handleLaneSet(lane.childLaneSet, newContext || context);
        }

        wireFlowNodeRefs(lane);
      });
    }

    function handleLaneSet(laneSet, context) {
      forEach(laneSet.lanes, contextual(handleLane, context));
    }

    function handleLaneSets(laneSets, context) {
      forEach(laneSets, contextual(handleLaneSet, context));
    }

    function handleFlowElementsContainer(container, context) {
      handleFlowElements(container.flowElements, context);

      if (container.laneSets) {
        handleLaneSets(container.laneSets, context);
      }
    }

    function handleFlowElements(flowElements, context) {
      forEach(flowElements, function(e) {
        if (is(e, 'bpmn:SequenceFlow')) {
          deferred.push(function() {
            handleSequenceFlow(e, context);
          });
        } else if (is(e, 'bpmn:BoundaryEvent')) {
          deferred.unshift(function() {
            handleBoundaryEvent(e, context);
          });
        } else if (is(e, 'bpmn:FlowNode')) {
          handleFlowNode(e, context);
        } else if (is(e, 'bpmn:DataObject')) ; else if (is(e, 'bpmn:DataStoreReference')) {
          handleDataElement(e, context);
        } else if (is(e, 'bpmn:DataObjectReference')) {
          handleDataElement(e, context);
        } else {
          logError(
            translate('unrecognized flowElement {element} in context {context}', {
              element: elementToString(e),
              context: (context ? elementToString(context.businessObject) : 'null')
            }),
            { element: e, context: context }
          );
        }
      });
    }

    function handleParticipant(participant, context) {
      var newCtx = visitIfDi(participant, context);

      var process = participant.processRef;
      if (process) {
        handleProcess(process, newCtx || context);
      }
    }

    function handleCollaboration(collaboration) {

      forEach(collaboration.participants, contextual(handleParticipant));

      handleArtifacts(collaboration.artifacts);

      // handle message flows latest in the process
      deferred.push(function() {
        handleMessageFlows(collaboration.messageFlows);
      });
    }


    function wireFlowNodeRefs(lane) {
      // wire the virtual flowNodeRefs <-> relationship
      forEach(lane.flowNodeRef, function(flowNode) {
        var lanes = flowNode.get('lanes');

        if (lanes) {
          lanes.push(lane);
        }
      });
    }

    // API //////////////////////

    return {
      handleDeferred: handleDeferred,
      handleDefinitions: handleDefinitions,
      handleSubProcess: handleSubProcess,
      registerDi: registerDi
    };
  }

  /**
   * Import the definitions into a diagram.
   *
   * Errors and warnings are reported through the specified callback.
   *
   * @param  {djs.Diagram} diagram
   * @param  {ModdleElement<Definitions>} definitions
   * @param  {ModdleElement<BPMNDiagram>} [bpmnDiagram] the diagram to be rendered
   * (if not provided, the first one will be rendered)
   * @param  {Function} done the callback, invoked with (err, [ warning ]) once the import is done
   */
  function importBpmnDiagram(diagram, definitions, bpmnDiagram, done) {

    if (isFunction(bpmnDiagram)) {
      done = bpmnDiagram;
      bpmnDiagram = null;
    }

    var importer,
        eventBus,
        translate;

    var error,
        warnings = [];

    /**
     * Walk the diagram semantically, importing (=drawing)
     * all elements you encounter.
     *
     * @param {ModdleElement<Definitions>} definitions
     * @param {ModdleElement<BPMNDiagram>} bpmnDiagram
     */
    function render(definitions, bpmnDiagram) {

      var visitor = {

        root: function(element) {
          return importer.add(element);
        },

        element: function(element, parentShape) {
          return importer.add(element, parentShape);
        },

        error: function(message, context) {
          warnings.push({ message: message, context: context });
        }
      };

      var walker = new BpmnTreeWalker(visitor, translate);

      // traverse BPMN 2.0 document model,
      // starting at definitions
      walker.handleDefinitions(definitions, bpmnDiagram);
    }

    try {
      importer = diagram.get('bpmnImporter');
      eventBus = diagram.get('eventBus');
      translate = diagram.get('translate');

      eventBus.fire('import.render.start', { definitions: definitions });

      render(definitions, bpmnDiagram);

      eventBus.fire('import.render.complete', {
        error: error,
        warnings: warnings
      });
    } catch (e) {
      error = e;
    }

    done(error, warnings);
  }

  /**
   * Is an element of the given BPMN type?
   *
   * @param  {djs.model.Base|ModdleElement} element
   * @param  {String} type
   *
   * @return {Boolean}
   */
  function is$1(element, type) {
    var bo = getBusinessObject(element);

    return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
  }


  /**
   * Return the business object for a given element.
   *
   * @param  {djs.model.Base|ModdleElement} element
   *
   * @return {ModdleElement}
   */
  function getBusinessObject(element) {
    return (element && element.businessObject) || element;
  }

  function isExpanded(element) {

    if (is$1(element, 'bpmn:CallActivity')) {
      return false;
    }

    if (is$1(element, 'bpmn:SubProcess')) {
      return !!getBusinessObject(element).di.isExpanded;
    }

    if (is$1(element, 'bpmn:Participant')) {
      return !!getBusinessObject(element).processRef;
    }

    return true;
  }

  function isEventSubProcess(element) {
    return element && !!getBusinessObject(element).triggeredByEvent;
  }

  function getLabelAttr(semantic) {
    if (
      is$1(semantic, 'bpmn:FlowElement') ||
      is$1(semantic, 'bpmn:Participant') ||
      is$1(semantic, 'bpmn:Lane') ||
      is$1(semantic, 'bpmn:SequenceFlow') ||
      is$1(semantic, 'bpmn:MessageFlow') ||
      is$1(semantic, 'bpmn:DataInput') ||
      is$1(semantic, 'bpmn:DataOutput')
    ) {
      return 'name';
    }

    if (is$1(semantic, 'bpmn:TextAnnotation')) {
      return 'text';
    }

    if (is$1(semantic, 'bpmn:Group')) {
      return 'categoryValueRef';
    }
  }

  function getCategoryValue(semantic) {
    var categoryValueRef = semantic['categoryValueRef'];

    if (!categoryValueRef) {
      return '';
    }


    return categoryValueRef.value || '';
  }

  function getLabel(element) {
    var semantic = element.businessObject,
        attr = getLabelAttr(semantic);

    if (attr) {

      if (attr === 'categoryValueRef') {

        return getCategoryValue(semantic);
      }

      return semantic[attr] || '';
    }
  }

  // element utils //////////////////////

  /**
   * Checks if eventDefinition of the given element matches with semantic type.
   *
   * @return {boolean} true if element is of the given semantic type
   */
  function isTypedEvent(event, eventDefinitionType, filter) {

    function matches(definition, filter) {
      return every(filter, function(val, key) {

        // we want a == conversion here, to be able to catch
        // undefined == false and friends
        /* jshint -W116 */
        return definition[key] == val;
      });
    }

    return some(event.eventDefinitions, function(definition) {
      return definition.$type === eventDefinitionType && matches(event, filter);
    });
  }

  function isThrowEvent(event) {
    return (event.$type === 'bpmn:IntermediateThrowEvent') || (event.$type === 'bpmn:EndEvent');
  }

  function isCollection(element) {
    var dataObject = element.dataObjectRef;

    return element.isCollection || (dataObject && dataObject.isCollection);
  }

  function getDi(element) {
    return element.businessObject.di;
  }

  function getSemantic(element) {
    return element.businessObject;
  }


  // color access //////////////////////

  function getFillColor(element, defaultColor) {
    return getDi(element).get('bioc:fill') || defaultColor || 'white';
  }

  function getStrokeColor(element, defaultColor) {
    return getDi(element).get('bioc:stroke') || defaultColor || 'black';
  }


  // cropping path customizations //////////////////////

  function getCirclePath(shape) {

    var cx = shape.x + shape.width / 2,
        cy = shape.y + shape.height / 2,
        radius = shape.width / 2;

    var circlePath = [
      ['M', cx, cy],
      ['m', 0, -radius],
      ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
      ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
      ['z']
    ];

    return componentsToPath(circlePath);
  }

  function getRoundRectPath(shape, borderRadius) {

    var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height;

    var roundRectPath = [
      ['M', x + borderRadius, y],
      ['l', width - borderRadius * 2, 0],
      ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, borderRadius],
      ['l', 0, height - borderRadius * 2],
      ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, borderRadius],
      ['l', borderRadius * 2 - width, 0],
      ['a', borderRadius, borderRadius, 0, 0, 1, -borderRadius, -borderRadius],
      ['l', 0, borderRadius * 2 - height],
      ['a', borderRadius, borderRadius, 0, 0, 1, borderRadius, -borderRadius],
      ['z']
    ];

    return componentsToPath(roundRectPath);
  }

  function getDiamondPath(shape) {

    var width = shape.width,
        height = shape.height,
        x = shape.x,
        y = shape.y,
        halfWidth = width / 2,
        halfHeight = height / 2;

    var diamondPath = [
      ['M', x + halfWidth, y],
      ['l', halfWidth, halfHeight],
      ['l', -halfWidth, halfHeight],
      ['l', -halfWidth, -halfHeight],
      ['z']
    ];

    return componentsToPath(diamondPath);
  }

  function getRectPath(shape) {
    var x = shape.x,
        y = shape.y,
        width = shape.width,
        height = shape.height;

    var rectPath = [
      ['M', x, y],
      ['l', width, 0],
      ['l', 0, height],
      ['l', -width, 0],
      ['z']
    ];

    return componentsToPath(rectPath);
  }

  function createCommonjsModule$1(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var hat_1 = createCommonjsModule$1(function (module) {
  var hat = module.exports = function (bits, base) {
      if (!base) base = 16;
      if (bits === undefined) bits = 128;
      if (bits <= 0) return '0';
      
      var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
      for (var i = 2; digits === Infinity; i *= 2) {
          digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
      }
      
      var rem = digits - Math.floor(digits);
      
      var res = '';
      
      for (var i = 0; i < Math.floor(digits); i++) {
          var x = Math.floor(Math.random() * base).toString(base);
          res = x + res;
      }
      
      if (rem) {
          var b = Math.pow(base, rem);
          var x = Math.floor(Math.random() * b).toString(base);
          res = x + res;
      }
      
      var parsed = parseInt(res, base);
      if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
          return hat(bits, base)
      }
      else return res;
  };

  hat.rack = function (bits, base, expandBy) {
      var fn = function (data) {
          var iters = 0;
          do {
              if (iters ++ > 10) {
                  if (expandBy) bits += expandBy;
                  else throw new Error('too many ID collisions, use more bits')
              }
              
              var id = hat(bits, base);
          } while (Object.hasOwnProperty.call(hats, id));
          
          hats[id] = data;
          return id;
      };
      var hats = fn.hats = {};
      
      fn.get = function (id) {
          return fn.hats[id];
      };
      
      fn.set = function (id, value) {
          fn.hats[id] = value;
          return fn;
      };
      
      fn.bits = bits || 128;
      fn.base = base || 16;
      return fn;
  };
  });

  /**
   * Create a new id generator / cache instance.
   *
   * You may optionally provide a seed that is used internally.
   *
   * @param {Seed} seed
   */

  function Ids(seed) {
    if (!(this instanceof Ids)) {
      return new Ids(seed);
    }

    seed = seed || [128, 36, 1];
    this._seed = seed.length ? hat_1.rack(seed[0], seed[1], seed[2]) : seed;
  }
  /**
   * Generate a next id.
   *
   * @param {Object} [element] element to bind the id to
   *
   * @return {String} id
   */

  Ids.prototype.next = function (element) {
    return this._seed(element || true);
  };
  /**
   * Generate a next id with a given prefix.
   *
   * @param {Object} [element] element to bind the id to
   *
   * @return {String} id
   */


  Ids.prototype.nextPrefixed = function (prefix, element) {
    var id;

    do {
      id = prefix + this.next(true);
    } while (this.assigned(id)); // claim {prefix}{random}


    this.claim(id, element); // return

    return id;
  };
  /**
   * Manually claim an existing id.
   *
   * @param {String} id
   * @param {String} [element] element the id is claimed by
   */


  Ids.prototype.claim = function (id, element) {
    this._seed.set(id, element || true);
  };
  /**
   * Returns true if the given id has already been assigned.
   *
   * @param  {String} id
   * @return {Boolean}
   */


  Ids.prototype.assigned = function (id) {
    return this._seed.get(id) || false;
  };
  /**
   * Unclaim an id.
   *
   * @param  {String} id the id to unclaim
   */


  Ids.prototype.unclaim = function (id) {
    delete this._seed.hats[id];
  };
  /**
   * Clear all claimed ids.
   */


  Ids.prototype.clear = function () {
    var hats = this._seed.hats,
        id;

    for (id in hats) {
      this.unclaim(id);
    }
  };

  var RENDERER_IDS = new Ids();

  var TASK_BORDER_RADIUS = 10;
  var INNER_OUTER_DIST = 3;

  var DEFAULT_FILL_OPACITY = .95,
      HIGH_FILL_OPACITY = .35;


  function BpmnRenderer(
      config, eventBus, styles, pathMap,
      canvas, textRenderer, priority) {

    BaseRenderer.call(this, eventBus, priority);

    var defaultFillColor = config && config.defaultFillColor,
        defaultStrokeColor = config && config.defaultStrokeColor;

    var rendererId = RENDERER_IDS.next();

    var markers = {};

    var computeStyle = styles.computeStyle;

    function addMarker(id, options) {
      var attrs = assign({
        fill: 'black',
        strokeWidth: 1,
        strokeLinecap: 'round',
        strokeDasharray: 'none'
      }, options.attrs);

      var ref = options.ref || { x: 0, y: 0 };

      var scale = options.scale || 1;

      // fix for safari / chrome / firefox bug not correctly
      // resetting stroke dash array
      if (attrs.strokeDasharray === 'none') {
        attrs.strokeDasharray = [10000, 1];
      }

      var marker = create('marker');

      attr$1(options.element, attrs);

      append(marker, options.element);

      attr$1(marker, {
        id: id,
        viewBox: '0 0 20 20',
        refX: ref.x,
        refY: ref.y,
        markerWidth: 20 * scale,
        markerHeight: 20 * scale,
        orient: 'auto'
      });

      var defs = query('defs', canvas._svg);

      if (!defs) {
        defs = create('defs');

        append(canvas._svg, defs);
      }

      append(defs, marker);

      markers[id] = marker;
    }

    function colorEscape(str) {
      return str.replace(/[()\s,#]+/g, '_');
    }

    function marker(type, fill, stroke) {
      var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

      if (!markers[id]) {
        createMarker(id, type, fill, stroke);
      }

      return 'url(#' + id + ')';
    }

    function createMarker(id, type, fill, stroke) {

      if (type === 'sequenceflow-end') {
        var sequenceflowEnd = create('path');
        attr$1(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

        addMarker(id, {
          element: sequenceflowEnd,
          ref: { x: 11, y: 10 },
          scale: 0.5,
          attrs: {
            fill: stroke,
            stroke: stroke
          }
        });
      }

      if (type === 'messageflow-start') {
        var messageflowStart = create('circle');
        attr$1(messageflowStart, { cx: 6, cy: 6, r: 3.5 });

        addMarker(id, {
          element: messageflowStart,
          attrs: {
            fill: fill,
            stroke: stroke
          },
          ref: { x: 6, y: 6 }
        });
      }

      if (type === 'messageflow-end') {
        var messageflowEnd = create('path');
        attr$1(messageflowEnd, { d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z' });

        addMarker(id, {
          element: messageflowEnd,
          attrs: {
            fill: fill,
            stroke: stroke,
            strokeLinecap: 'butt'
          },
          ref: { x: 8.5, y: 5 }
        });
      }

      if (type === 'association-start') {
        var associationStart = create('path');
        attr$1(associationStart, { d: 'M 11 5 L 1 10 L 11 15' });

        addMarker(id, {
          element: associationStart,
          attrs: {
            fill: 'none',
            stroke: stroke,
            strokeWidth: 1.5
          },
          ref: { x: 1, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'association-end') {
        var associationEnd = create('path');
        attr$1(associationEnd, { d: 'M 1 5 L 11 10 L 1 15' });

        addMarker(id, {
          element: associationEnd,
          attrs: {
            fill: 'none',
            stroke: stroke,
            strokeWidth: 1.5
          },
          ref: { x: 12, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'conditional-flow-marker') {
        var conditionalflowMarker = create('path');
        attr$1(conditionalflowMarker, { d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z' });

        addMarker(id, {
          element: conditionalflowMarker,
          attrs: {
            fill: fill,
            stroke: stroke
          },
          ref: { x: -1, y: 10 },
          scale: 0.5
        });
      }

      if (type === 'conditional-default-flow-marker') {
        var conditionaldefaultflowMarker = create('path');
        attr$1(conditionaldefaultflowMarker, { d: 'M 6 4 L 10 16' });

        addMarker(id, {
          element: conditionaldefaultflowMarker,
          attrs: {
            stroke: stroke
          },
          ref: { x: 0, y: 10 },
          scale: 0.5
        });
      }
    }

    function drawCircle(parentGfx, width, height, offset, attrs) {

      if (isObject(offset)) {
        attrs = offset;
        offset = 0;
      }

      offset = offset || 0;

      attrs = computeStyle(attrs, {
        stroke: 'black',
        strokeWidth: 2,
        fill: 'white'
      });

      if (attrs.fill === 'none') {
        delete attrs.fillOpacity;
      }

      var cx = width / 2,
          cy = height / 2;

      var circle = create('circle');
      attr$1(circle, {
        cx: cx,
        cy: cy,
        r: Math.round((width + height) / 4 - offset)
      });
      attr$1(circle, attrs);

      append(parentGfx, circle);

      return circle;
    }

    function drawRect(parentGfx, width, height, r, offset, attrs) {

      if (isObject(offset)) {
        attrs = offset;
        offset = 0;
      }

      offset = offset || 0;

      attrs = computeStyle(attrs, {
        stroke: 'black',
        strokeWidth: 2,
        fill: 'white'
      });

      var rect = create('rect');
      attr$1(rect, {
        x: offset,
        y: offset,
        width: width - offset * 2,
        height: height - offset * 2,
        rx: r,
        ry: r
      });
      attr$1(rect, attrs);

      append(parentGfx, rect);

      return rect;
    }

    function drawDiamond(parentGfx, width, height, attrs) {

      var x_2 = width / 2;
      var y_2 = height / 2;

      var points = [{ x: x_2, y: 0 }, { x: width, y: y_2 }, { x: x_2, y: height }, { x: 0, y: y_2 }];

      var pointsString = points.map(function(point) {
        return point.x + ',' + point.y;
      }).join(' ');

      attrs = computeStyle(attrs, {
        stroke: 'black',
        strokeWidth: 2,
        fill: 'white'
      });

      var polygon = create('polygon');
      attr$1(polygon, {
        points: pointsString
      });
      attr$1(polygon, attrs);

      append(parentGfx, polygon);

      return polygon;
    }

    function drawLine(parentGfx, waypoints, attrs) {
      attrs = computeStyle(attrs, [ 'no-fill' ], {
        stroke: 'black',
        strokeWidth: 2,
        fill: 'none'
      });

      var line = createLine(waypoints, attrs);

      append(parentGfx, line);

      return line;
    }

    function drawPath(parentGfx, d, attrs) {

      attrs = computeStyle(attrs, [ 'no-fill' ], {
        strokeWidth: 2,
        stroke: 'black'
      });

      var path = create('path');
      attr$1(path, { d: d });
      attr$1(path, attrs);

      append(parentGfx, path);

      return path;
    }

    function drawMarker(type, parentGfx, path, attrs) {
      return drawPath(parentGfx, path, assign({ 'data-marker': type }, attrs));
    }

    function as(type) {
      return function(parentGfx, element) {
        return handlers[type](parentGfx, element);
      };
    }

    function renderer(type) {
      return handlers[type];
    }

    function renderEventContent(element, parentGfx) {

      var event = getSemantic(element);
      var isThrowing = isThrowEvent(event);

      if (event.eventDefinitions && event.eventDefinitions.length>1) {
        if (event.parallelMultiple) {
          return renderer('bpmn:ParallelMultipleEventDefinition')(parentGfx, element, isThrowing);
        }
        else {
          return renderer('bpmn:MultipleEventDefinition')(parentGfx, element, isThrowing);
        }
      }

      if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
        return renderer('bpmn:MessageEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
        return renderer('bpmn:TimerEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
        return renderer('bpmn:ConditionalEventDefinition')(parentGfx, element);
      }

      if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
        return renderer('bpmn:SignalEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
        return renderer('bpmn:EscalationEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
        return renderer('bpmn:LinkEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
        return renderer('bpmn:ErrorEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
        return renderer('bpmn:CancelEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
        return renderer('bpmn:CompensateEventDefinition')(parentGfx, element, isThrowing);
      }

      if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
        return renderer('bpmn:TerminateEventDefinition')(parentGfx, element, isThrowing);
      }

      return null;
    }

    function renderLabel(parentGfx, label, options) {

      options = assign({
        size: {
          width: 100
        }
      }, options);

      var text = textRenderer.createText(label || '', options);

      classes$1(text).add('djs-label');

      append(parentGfx, text);

      return text;
    }

    function renderEmbeddedLabel(parentGfx, element, align) {
      var semantic = getSemantic(element);

      return renderLabel(parentGfx, semantic.name, {
        box: element,
        align: align,
        padding: 5,
        style: {
          fill: getStrokeColor(element, defaultStrokeColor)
        }
      });
    }

    function renderExternalLabel(parentGfx, element) {

      var box = {
        width: 90,
        height: 30,
        x: element.width / 2 + element.x,
        y: element.height / 2 + element.y
      };

      return renderLabel(parentGfx, getLabel(element), {
        box: box,
        fitBox: true,
        style: assign(
          {},
          textRenderer.getExternalStyle(),
          {
            fill: getStrokeColor(element, defaultStrokeColor)
          }
        )
      });
    }

    function renderLaneLabel(parentGfx, text, element) {
      var textBox = renderLabel(parentGfx, text, {
        box: {
          height: 30,
          width: element.height
        },
        align: 'center-middle',
        style: {
          fill: getStrokeColor(element, defaultStrokeColor)
        }
      });

      var top = -1 * element.height;

      transform$1(textBox, 0, -top, 270);
    }

    function createPathFromConnection(connection) {
      var waypoints = connection.waypoints;

      var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
      for (var i = 1; i < waypoints.length; i++) {
        pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
      }
      return pathData;
    }

    var handlers = this.handlers = {
      'bpmn:Event': function(parentGfx, element, attrs) {

        if (!('fillOpacity' in attrs)) {
          attrs.fillOpacity = DEFAULT_FILL_OPACITY;
        }

        return drawCircle(parentGfx, element.width, element.height, attrs);
      },
      'bpmn:StartEvent': function(parentGfx, element) {
        var attrs = {
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        var semantic = getSemantic(element);

        if (!semantic.isInterrupting) {
          attrs = {
            strokeDasharray: '6',
            strokeLinecap: 'round',
            fill: getFillColor(element, defaultFillColor),
            stroke: getStrokeColor(element, defaultStrokeColor)
          };
        }

        var circle = renderer('bpmn:Event')(parentGfx, element, attrs);

        renderEventContent(element, parentGfx);

        return circle;
      },
      'bpmn:MessageEventDefinition': function(parentGfx, element, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_MESSAGE', {
          xScaleFactor: 0.9,
          yScaleFactor: 0.9,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.235,
            my: 0.315
          }
        });

        var fill = isThrowing ? getStrokeColor(element, defaultStrokeColor) : getFillColor(element, defaultFillColor);
        var stroke = isThrowing ? getFillColor(element, defaultFillColor) : getStrokeColor(element, defaultStrokeColor);

        var messagePath = drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: stroke
        });

        return messagePath;
      },
      'bpmn:TimerEventDefinition': function(parentGfx, element) {
        var circle = drawCircle(parentGfx, element.width, element.height, 0.2 * element.height, {
          strokeWidth: 2,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var pathData = pathMap.getScaledPath('EVENT_TIMER_WH', {
          xScaleFactor: 0.75,
          yScaleFactor: 0.75,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.5,
            my: 0.5
          }
        });

        drawPath(parentGfx, pathData, {
          strokeWidth: 2,
          strokeLinecap: 'square',
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        for (var i = 0;i < 12; i++) {

          var linePathData = pathMap.getScaledPath('EVENT_TIMER_LINE', {
            xScaleFactor: 0.75,
            yScaleFactor: 0.75,
            containerWidth: element.width,
            containerHeight: element.height,
            position: {
              mx: 0.5,
              my: 0.5
            }
          });

          var width = element.width / 2;
          var height = element.height / 2;

          drawPath(parentGfx, linePathData, {
            strokeWidth: 1,
            strokeLinecap: 'square',
            transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')',
            stroke: getStrokeColor(element, defaultStrokeColor)
          });
        }

        return circle;
      },
      'bpmn:EscalationEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_ESCALATION', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.5,
            my: 0.2
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:ConditionalEventDefinition': function(parentGfx, event) {
        var pathData = pathMap.getScaledPath('EVENT_CONDITIONAL', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.5,
            my: 0.222
          }
        });

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:LinkEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_LINK', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.57,
            my: 0.263
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:ErrorEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_ERROR', {
          xScaleFactor: 1.1,
          yScaleFactor: 1.1,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.2,
            my: 0.722
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:CancelEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_CANCEL_45', {
          xScaleFactor: 1.0,
          yScaleFactor: 1.0,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.638,
            my: -0.055
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        var path = drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });

        rotate(path, 45);

        return path;
      },
      'bpmn:CompensateEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_COMPENSATION', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.22,
            my: 0.5
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:SignalEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_SIGNAL', {
          xScaleFactor: 0.9,
          yScaleFactor: 0.9,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.5,
            my: 0.2
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill,
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:MultipleEventDefinition': function(parentGfx, event, isThrowing) {
        var pathData = pathMap.getScaledPath('EVENT_MULTIPLE', {
          xScaleFactor: 1.1,
          yScaleFactor: 1.1,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.222,
            my: 0.36
          }
        });

        var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: fill
        });
      },
      'bpmn:ParallelMultipleEventDefinition': function(parentGfx, event) {
        var pathData = pathMap.getScaledPath('EVENT_PARALLEL_MULTIPLE', {
          xScaleFactor: 1.2,
          yScaleFactor: 1.2,
          containerWidth: event.width,
          containerHeight: event.height,
          position: {
            mx: 0.458,
            my: 0.194
          }
        });

        return drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getStrokeColor(event, defaultStrokeColor),
          stroke: getStrokeColor(event, defaultStrokeColor)
        });
      },
      'bpmn:EndEvent': function(parentGfx, element) {
        var circle = renderer('bpmn:Event')(parentGfx, element, {
          strokeWidth: 4,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        renderEventContent(element, parentGfx);

        return circle;
      },
      'bpmn:TerminateEventDefinition': function(parentGfx, element) {
        var circle = drawCircle(parentGfx, element.width, element.height, 8, {
          strokeWidth: 4,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return circle;
      },
      'bpmn:IntermediateEvent': function(parentGfx, element) {
        var outer = renderer('bpmn:Event')(parentGfx, element, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        /* inner */
        drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, {
          strokeWidth: 1,
          fill: getFillColor(element, 'none'),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        renderEventContent(element, parentGfx);

        return outer;
      },
      'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
      'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

      'bpmn:Activity': function(parentGfx, element, attrs) {

        attrs = attrs || {};

        if (!('fillOpacity' in attrs)) {
          attrs.fillOpacity = DEFAULT_FILL_OPACITY;
        }

        return drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, attrs);
      },

      'bpmn:Task': function(parentGfx, element) {
        var attrs = {
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

        renderEmbeddedLabel(parentGfx, element, 'center-middle');
        attachTaskMarkers(parentGfx, element);

        return rect;
      },
      'bpmn:ServiceTask': function(parentGfx, element) {
        var task = renderer('bpmn:Task')(parentGfx, element);

        var pathDataBG = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
          abspos: {
            x: 12,
            y: 18
          }
        });

        /* service bg */ drawPath(parentGfx, pathDataBG, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
          abspos: {
            x: 17.2,
            y: 18
          }
        });

        /* service fill */ drawPath(parentGfx, fillPathData, {
          strokeWidth: 0,
          fill: getFillColor(element, defaultFillColor)
        });

        var pathData = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
          abspos: {
            x: 17,
            y: 22
          }
        });

        /* service */ drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return task;
      },
      'bpmn:UserTask': function(parentGfx, element) {
        var task = renderer('bpmn:Task')(parentGfx, element);

        var x = 15;
        var y = 12;

        var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
          abspos: {
            x: x,
            y: y
          }
        });

        /* user path */ drawPath(parentGfx, pathData, {
          strokeWidth: 0.5,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
          abspos: {
            x: x,
            y: y
          }
        });

        /* user2 path */ drawPath(parentGfx, pathData2, {
          strokeWidth: 0.5,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
          abspos: {
            x: x,
            y: y
          }
        });

        /* user3 path */ drawPath(parentGfx, pathData3, {
          strokeWidth: 0.5,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return task;
      },
      'bpmn:ManualTask': function(parentGfx, element) {
        var task = renderer('bpmn:Task')(parentGfx, element);

        var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
          abspos: {
            x: 17,
            y: 15
          }
        });

        /* manual path */ drawPath(parentGfx, pathData, {
          strokeWidth: 0.5, // 0.25,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return task;
      },
      'bpmn:SendTask': function(parentGfx, element) {
        var task = renderer('bpmn:Task')(parentGfx, element);

        var pathData = pathMap.getScaledPath('TASK_TYPE_SEND', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: 21,
          containerHeight: 14,
          position: {
            mx: 0.285,
            my: 0.357
          }
        });

        /* send path */ drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getFillColor(element, defaultFillColor)
        });

        return task;
      },
      'bpmn:ReceiveTask' : function(parentGfx, element) {
        var semantic = getSemantic(element);

        var task = renderer('bpmn:Task')(parentGfx, element);
        var pathData;

        if (semantic.instantiate) {
          drawCircle(parentGfx, 28, 28, 20 * 0.22, { strokeWidth: 1 });

          pathData = pathMap.getScaledPath('TASK_TYPE_INSTANTIATING_SEND', {
            abspos: {
              x: 7.77,
              y: 9.52
            }
          });
        } else {

          pathData = pathMap.getScaledPath('TASK_TYPE_SEND', {
            xScaleFactor: 0.9,
            yScaleFactor: 0.9,
            containerWidth: 21,
            containerHeight: 14,
            position: {
              mx: 0.3,
              my: 0.4
            }
          });
        }

        /* receive path */ drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return task;
      },
      'bpmn:ScriptTask': function(parentGfx, element) {
        var task = renderer('bpmn:Task')(parentGfx, element);

        var pathData = pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
          abspos: {
            x: 15,
            y: 20
          }
        });

        /* script path */ drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return task;
      },
      'bpmn:BusinessRuleTask': function(parentGfx, element) {
        var task = renderer('bpmn:Task')(parentGfx, element);

        var headerPathData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
          abspos: {
            x: 8,
            y: 8
          }
        });

        var businessHeaderPath = drawPath(parentGfx, headerPathData);
        attr$1(businessHeaderPath, {
          strokeWidth: 1,
          fill: getFillColor(element, '#aaaaaa'),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
          abspos: {
            x: 8,
            y: 8
          }
        });

        var businessPath = drawPath(parentGfx, headerData);
        attr$1(businessPath, {
          strokeWidth: 1,
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return task;
      },
      'bpmn:SubProcess': function(parentGfx, element, attrs) {
        attrs = assign({
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs);

        var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

        var expanded = isExpanded(element);

        if (isEventSubProcess(element)) {
          attr$1(rect, {
            strokeDasharray: '1,2'
          });
        }

        renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle');

        if (expanded) {
          attachTaskMarkers(parentGfx, element);
        } else {
          attachTaskMarkers(parentGfx, element, ['SubProcessMarker']);
        }

        return rect;
      },
      'bpmn:AdHocSubProcess': function(parentGfx, element) {
        return renderer('bpmn:SubProcess')(parentGfx, element);
      },
      'bpmn:Transaction': function(parentGfx, element) {
        var outer = renderer('bpmn:SubProcess')(parentGfx, element);

        var innerAttrs = styles.style([ 'no-fill', 'no-events' ], {
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        /* inner path */ drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS - 2, INNER_OUTER_DIST, innerAttrs);

        return outer;
      },
      'bpmn:CallActivity': function(parentGfx, element) {
        return renderer('bpmn:SubProcess')(parentGfx, element, {
          strokeWidth: 5
        });
      },
      'bpmn:Participant': function(parentGfx, element) {

        var attrs = {
          fillOpacity: DEFAULT_FILL_OPACITY,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        var lane = renderer('bpmn:Lane')(parentGfx, element, attrs);

        var expandedPool = isExpanded(element);

        if (expandedPool) {
          drawLine(parentGfx, [
            { x: 30, y: 0 },
            { x: 30, y: element.height }
          ], {
            stroke: getStrokeColor(element, defaultStrokeColor)
          });
          var text = getSemantic(element).name;
          renderLaneLabel(parentGfx, text, element);
        } else {
          // Collapsed pool draw text inline
          var text2 = getSemantic(element).name;
          renderLabel(parentGfx, text2, {
            box: element, align: 'center-middle',
            style: {
              fill: getStrokeColor(element, defaultStrokeColor)
            }
          });
        }

        var participantMultiplicity = !!(getSemantic(element).participantMultiplicity);

        if (participantMultiplicity) {
          renderer('ParticipantMultiplicityMarker')(parentGfx, element);
        }

        return lane;
      },
      'bpmn:Lane': function(parentGfx, element, attrs) {
        var rect = drawRect(parentGfx, element.width, element.height, 0, assign({
          fill: getFillColor(element, defaultFillColor),
          fillOpacity: HIGH_FILL_OPACITY,
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs));

        var semantic = getSemantic(element);

        if (semantic.$type === 'bpmn:Lane') {
          var text = semantic.name;
          renderLaneLabel(parentGfx, text, element);
        }

        return rect;
      },
      'bpmn:InclusiveGateway': function(parentGfx, element) {
        var diamond = renderer('bpmn:Gateway')(parentGfx, element);

        /* circle path */
        drawCircle(parentGfx, element.width, element.height, element.height * 0.24, {
          strokeWidth: 2.5,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return diamond;
      },
      'bpmn:ExclusiveGateway': function(parentGfx, element) {
        var diamond = renderer('bpmn:Gateway')(parentGfx, element);

        var pathData = pathMap.getScaledPath('GATEWAY_EXCLUSIVE', {
          xScaleFactor: 0.4,
          yScaleFactor: 0.4,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.32,
            my: 0.3
          }
        });

        if ((getDi(element).isMarkerVisible)) {
          drawPath(parentGfx, pathData, {
            strokeWidth: 1,
            fill: getStrokeColor(element, defaultStrokeColor),
            stroke: getStrokeColor(element, defaultStrokeColor)
          });
        }

        return diamond;
      },
      'bpmn:ComplexGateway': function(parentGfx, element) {
        var diamond = renderer('bpmn:Gateway')(parentGfx, element);

        var pathData = pathMap.getScaledPath('GATEWAY_COMPLEX', {
          xScaleFactor: 0.5,
          yScaleFactor:0.5,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.46,
            my: 0.26
          }
        });

        /* complex path */ drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return diamond;
      },
      'bpmn:ParallelGateway': function(parentGfx, element) {
        var diamond = renderer('bpmn:Gateway')(parentGfx, element);

        var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
          xScaleFactor: 0.6,
          yScaleFactor:0.6,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.46,
            my: 0.2
          }
        });

        /* parallel path */ drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return diamond;
      },
      'bpmn:EventBasedGateway': function(parentGfx, element) {

        var semantic = getSemantic(element);

        var diamond = renderer('bpmn:Gateway')(parentGfx, element);

        /* outer circle path */ drawCircle(parentGfx, element.width, element.height, element.height * 0.20, {
          strokeWidth: 1,
          fill: 'none',
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var type = semantic.eventGatewayType;
        var instantiate = !!semantic.instantiate;

        function drawEvent() {

          var pathData = pathMap.getScaledPath('GATEWAY_EVENT_BASED', {
            xScaleFactor: 0.18,
            yScaleFactor: 0.18,
            containerWidth: element.width,
            containerHeight: element.height,
            position: {
              mx: 0.36,
              my: 0.44
            }
          });

          var attrs = {
            strokeWidth: 2,
            fill: getFillColor(element, 'none'),
            stroke: getStrokeColor(element, defaultStrokeColor)
          };

          /* event path */ drawPath(parentGfx, pathData, attrs);
        }

        if (type === 'Parallel') {

          var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
            xScaleFactor: 0.4,
            yScaleFactor:0.4,
            containerWidth: element.width,
            containerHeight: element.height,
            position: {
              mx: 0.474,
              my: 0.296
            }
          });

          var parallelPath = drawPath(parentGfx, pathData);
          attr$1(parallelPath, {
            strokeWidth: 1,
            fill: 'none'
          });
        } else if (type === 'Exclusive') {

          if (!instantiate) {
            var innerCircle = drawCircle(parentGfx, element.width, element.height, element.height * 0.26);
            attr$1(innerCircle, {
              strokeWidth: 1,
              fill: 'none',
              stroke: getStrokeColor(element, defaultStrokeColor)
            });
          }

          drawEvent();
        }


        return diamond;
      },
      'bpmn:Gateway': function(parentGfx, element) {
        var attrs = {
          fill: getFillColor(element, defaultFillColor),
          fillOpacity: DEFAULT_FILL_OPACITY,
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        return drawDiamond(parentGfx, element.width, element.height, attrs);
      },
      'bpmn:SequenceFlow': function(parentGfx, element) {
        var pathData = createPathFromConnection(element);

        var fill = getFillColor(element, defaultFillColor),
            stroke = getStrokeColor(element, defaultStrokeColor);

        var attrs = {
          strokeLinejoin: 'round',
          markerEnd: marker('sequenceflow-end', fill, stroke),
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        var path = drawPath(parentGfx, pathData, attrs);

        var sequenceFlow = getSemantic(element);

        var source;

        if (element.source) {
          source = element.source.businessObject;

          // conditional flow marker
          if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Activity')) {
            attr$1(path, {
              markerStart: marker('conditional-flow-marker', fill, stroke)
            });
          }

          // default marker
          if (source.default && (source.$instanceOf('bpmn:Gateway') || source.$instanceOf('bpmn:Activity')) &&
              source.default === sequenceFlow) {
            attr$1(path, {
              markerStart: marker('conditional-default-flow-marker', fill, stroke)
            });
          }
        }

        return path;
      },
      'bpmn:Association': function(parentGfx, element, attrs) {

        var semantic = getSemantic(element);

        var fill = getFillColor(element, defaultFillColor),
            stroke = getStrokeColor(element, defaultStrokeColor);

        attrs = assign({
          strokeDasharray: '0.5, 5',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          stroke: getStrokeColor(element, defaultStrokeColor)
        }, attrs || {});

        if (semantic.associationDirection === 'One' ||
            semantic.associationDirection === 'Both') {
          attrs.markerEnd = marker('association-end', fill, stroke);
        }

        if (semantic.associationDirection === 'Both') {
          attrs.markerStart = marker('association-start', fill, stroke);
        }

        return drawLine(parentGfx, element.waypoints, attrs);
      },
      'bpmn:DataInputAssociation': function(parentGfx, element) {
        var fill = getFillColor(element, defaultFillColor),
            stroke = getStrokeColor(element, defaultStrokeColor);

        return renderer('bpmn:Association')(parentGfx, element, {
          markerEnd: marker('association-end', fill, stroke)
        });
      },
      'bpmn:DataOutputAssociation': function(parentGfx, element) {
        var fill = getFillColor(element, defaultFillColor),
            stroke = getStrokeColor(element, defaultStrokeColor);

        return renderer('bpmn:Association')(parentGfx, element, {
          markerEnd: marker('association-end', fill, stroke)
        });
      },
      'bpmn:MessageFlow': function(parentGfx, element) {

        var semantic = getSemantic(element),
            di = getDi(element);

        var fill = getFillColor(element, defaultFillColor),
            stroke = getStrokeColor(element, defaultStrokeColor);

        var pathData = createPathFromConnection(element);

        var attrs = {
          markerEnd: marker('messageflow-end', fill, stroke),
          markerStart: marker('messageflow-start', fill, stroke),
          strokeDasharray: '10, 12',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '1.5px',
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        var path = drawPath(parentGfx, pathData, attrs);

        if (semantic.messageRef) {
          var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

          var markerPathData = pathMap.getScaledPath('MESSAGE_FLOW_MARKER', {
            abspos: {
              x: midPoint.x,
              y: midPoint.y
            }
          });

          var messageAttrs = { strokeWidth: 1 };

          if (di.messageVisibleKind === 'initiating') {
            messageAttrs.fill = 'white';
            messageAttrs.stroke = 'black';
          } else {
            messageAttrs.fill = '#888';
            messageAttrs.stroke = 'white';
          }

          drawPath(parentGfx, markerPathData, messageAttrs);
        }

        return path;
      },
      'bpmn:DataObject': function(parentGfx, element) {
        var pathData = pathMap.getScaledPath('DATA_OBJECT_PATH', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.474,
            my: 0.296
          }
        });

        var elementObject = drawPath(parentGfx, pathData, {
          fill: getFillColor(element, defaultFillColor),
          fillOpacity: DEFAULT_FILL_OPACITY,
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var semantic = getSemantic(element);

        if (isCollection(semantic)) {
          renderDataItemCollection(parentGfx, element);
        }

        return elementObject;
      },
      'bpmn:DataObjectReference': as('bpmn:DataObject'),
      'bpmn:DataInput': function(parentGfx, element) {

        var arrowPathData = pathMap.getRawPath('DATA_ARROW');

        // page
        var elementObject = renderer('bpmn:DataObject')(parentGfx, element);

        /* input arrow path */ drawPath(parentGfx, arrowPathData, { strokeWidth: 1 });

        return elementObject;
      },
      'bpmn:DataOutput': function(parentGfx, element) {
        var arrowPathData = pathMap.getRawPath('DATA_ARROW');

        // page
        var elementObject = renderer('bpmn:DataObject')(parentGfx, element);

        /* output arrow path */ drawPath(parentGfx, arrowPathData, {
          strokeWidth: 1,
          fill: 'black'
        });

        return elementObject;
      },
      'bpmn:DataStoreReference': function(parentGfx, element) {
        var DATA_STORE_PATH = pathMap.getScaledPath('DATA_STORE', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0,
            my: 0.133
          }
        });

        var elementStore = drawPath(parentGfx, DATA_STORE_PATH, {
          strokeWidth: 2,
          fill: getFillColor(element, defaultFillColor),
          fillOpacity: DEFAULT_FILL_OPACITY,
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        return elementStore;
      },
      'bpmn:BoundaryEvent': function(parentGfx, element) {

        var semantic = getSemantic(element),
            cancel = semantic.cancelActivity;

        var attrs = {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        };

        if (!cancel) {
          attrs.strokeDasharray = '6';
          attrs.strokeLinecap = 'round';
        }

        // apply fillOpacity
        var outerAttrs = assign({}, attrs, {
          fillOpacity: 1
        });

        // apply no-fill
        var innerAttrs = assign({}, attrs, {
          fill: 'none'
        });

        var outer = renderer('bpmn:Event')(parentGfx, element, outerAttrs);

        /* inner path */ drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, innerAttrs);

        renderEventContent(element, parentGfx);

        return outer;
      },
      'bpmn:Group': function(parentGfx, element) {

        var group = drawRect(parentGfx, element.width, element.height, TASK_BORDER_RADIUS, {
          strokeWidth: 1,
          strokeDasharray: '8,3,1,3',
          fill: 'none',
          pointerEvents: 'none'
        });

        return group;
      },
      'label': function(parentGfx, element) {
        return renderExternalLabel(parentGfx, element);
      },
      'bpmn:TextAnnotation': function(parentGfx, element) {
        var style = {
          'fill': 'none',
          'stroke': 'none'
        };

        var textElement = drawRect(parentGfx, element.width, element.height, 0, 0, style);

        var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.0,
            my: 0.0
          }
        });

        drawPath(parentGfx, textPathData, {
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        var text = getSemantic(element).text || '';
        renderLabel(parentGfx, text, {
          box: element,
          align: 'left-top',
          padding: 5,
          style: {
            fill: getStrokeColor(element, defaultStrokeColor)
          }
        });

        return textElement;
      },
      'ParticipantMultiplicityMarker': function(parentGfx, element) {
        var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: ((element.width / 2) / element.width),
            my: (element.height - 15) / element.height
          }
        });

        drawMarker('participant-multiplicity', parentGfx, markerPath, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      },
      'SubProcessMarker': function(parentGfx, element) {
        var markerRect = drawRect(parentGfx, 14, 14, 0, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });

        // Process marker is placed in the middle of the box
        // therefore fixed values can be used here
        translate(markerRect, element.width / 2 - 7.5, element.height - 20);

        var markerPath = pathMap.getScaledPath('MARKER_SUB_PROCESS', {
          xScaleFactor: 1.5,
          yScaleFactor: 1.5,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: (element.width / 2 - 7.5) / element.width,
            my: (element.height - 20) / element.height
          }
        });

        drawMarker('sub-process', parentGfx, markerPath, {
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      },
      'ParallelMarker': function(parentGfx, element, position) {
        var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: ((element.width / 2 + position.parallel) / element.width),
            my: (element.height - 20) / element.height
          }
        });

        drawMarker('parallel', parentGfx, markerPath, {
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      },
      'SequentialMarker': function(parentGfx, element, position) {
        var markerPath = pathMap.getScaledPath('MARKER_SEQUENTIAL', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: ((element.width / 2 + position.seq) / element.width),
            my: (element.height - 19) / element.height
          }
        });

        drawMarker('sequential', parentGfx, markerPath, {
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      },
      'CompensationMarker': function(parentGfx, element, position) {
        var markerMath = pathMap.getScaledPath('MARKER_COMPENSATION', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: ((element.width / 2 + position.compensation) / element.width),
            my: (element.height - 13) / element.height
          }
        });

        drawMarker('compensation', parentGfx, markerMath, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      },
      'LoopMarker': function(parentGfx, element, position) {
        var markerPath = pathMap.getScaledPath('MARKER_LOOP', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: ((element.width / 2 + position.loop) / element.width),
            my: (element.height - 7) / element.height
          }
        });

        drawMarker('loop', parentGfx, markerPath, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor),
          strokeLinecap: 'round',
          strokeMiterlimit: 0.5
        });
      },
      'AdhocMarker': function(parentGfx, element, position) {
        var markerPath = pathMap.getScaledPath('MARKER_ADHOC', {
          xScaleFactor: 1,
          yScaleFactor: 1,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: ((element.width / 2 + position.adhoc) / element.width),
            my: (element.height - 15) / element.height
          }
        });

        drawMarker('adhoc', parentGfx, markerPath, {
          strokeWidth: 1,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      }
    };

    function attachTaskMarkers(parentGfx, element, taskMarkers) {
      var obj = getSemantic(element);

      var subprocess = taskMarkers && taskMarkers.indexOf('SubProcessMarker') !== -1;
      var position;

      if (subprocess) {
        position = {
          seq: -21,
          parallel: -22,
          compensation: -42,
          loop: -18,
          adhoc: 10
        };
      } else {
        position = {
          seq: -3,
          parallel: -6,
          compensation: -27,
          loop: 0,
          adhoc: 10
        };
      }

      forEach(taskMarkers, function(marker) {
        renderer(marker)(parentGfx, element, position);
      });

      if (obj.isForCompensation) {
        renderer('CompensationMarker')(parentGfx, element, position);
      }

      if (obj.$type === 'bpmn:AdHocSubProcess') {
        renderer('AdhocMarker')(parentGfx, element, position);
      }

      var loopCharacteristics = obj.loopCharacteristics,
          isSequential = loopCharacteristics && loopCharacteristics.isSequential;

      if (loopCharacteristics) {

        if (isSequential === undefined) {
          renderer('LoopMarker')(parentGfx, element, position);
        }

        if (isSequential === false) {
          renderer('ParallelMarker')(parentGfx, element, position);
        }

        if (isSequential === true) {
          renderer('SequentialMarker')(parentGfx, element, position);
        }
      }
    }

    function renderDataItemCollection(parentGfx, element) {

      var yPosition = (element.height - 16) / element.height;

      var pathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.451,
          my: yPosition
        }
      });

      /* collection path */ drawPath(parentGfx, pathData, {
        strokeWidth: 2
      });
    }


    // extension API, use at your own risk
    this._drawPath = drawPath;

  }


  inherits_browser(BpmnRenderer, BaseRenderer);

  BpmnRenderer.$inject = [
    'config.bpmnRenderer',
    'eventBus',
    'styles',
    'pathMap',
    'canvas',
    'textRenderer'
  ];


  BpmnRenderer.prototype.canRender = function(element) {
    return is$1(element, 'bpmn:BaseElement');
  };

  BpmnRenderer.prototype.drawShape = function(parentGfx, element) {
    var type = element.type;
    var h = this.handlers[type];

    /* jshint -W040 */
    return h(parentGfx, element);
  };

  BpmnRenderer.prototype.drawConnection = function(parentGfx, element) {
    var type = element.type;
    var h = this.handlers[type];

    /* jshint -W040 */
    return h(parentGfx, element);
  };

  BpmnRenderer.prototype.getShapePath = function(element) {

    if (is$1(element, 'bpmn:Event')) {
      return getCirclePath(element);
    }

    if (is$1(element, 'bpmn:Activity')) {
      return getRoundRectPath(element, TASK_BORDER_RADIUS);
    }

    if (is$1(element, 'bpmn:Gateway')) {
      return getDiamondPath(element);
    }

    return getRectPath(element);
  };

  var DEFAULT_BOX_PADDING = 0;

  var DEFAULT_LABEL_SIZE = {
    width: 150,
    height: 50
  };


  function parseAlign(align) {

    var parts = align.split('-');

    return {
      horizontal: parts[0] || 'center',
      vertical: parts[1] || 'top'
    };
  }

  function parsePadding(padding) {

    if (isObject(padding)) {
      return assign({ top: 0, left: 0, right: 0, bottom: 0 }, padding);
    } else {
      return {
        top: padding,
        left: padding,
        right: padding,
        bottom: padding
      };
    }
  }

  function getTextBBox(text, fakeText) {

    fakeText.textContent = text;

    var textBBox;

    try {
      var bbox,
          emptyLine = text === '';

      // add dummy text, when line is empty to
      // determine correct height
      fakeText.textContent = emptyLine ? 'dummy' : text;

      textBBox = fakeText.getBBox();

      // take text rendering related horizontal
      // padding into account
      bbox = {
        width: textBBox.width + textBBox.x * 2,
        height: textBBox.height
      };

      if (emptyLine) {
        // correct width
        bbox.width = 0;
      }

      return bbox;
    } catch (e) {
      return { width: 0, height: 0 };
    }
  }


  /**
   * Layout the next line and return the layouted element.
   *
   * Alters the lines passed.
   *
   * @param  {Array<String>} lines
   * @return {Object} the line descriptor, an object { width, height, text }
   */
  function layoutNext(lines, maxWidth, fakeText) {

    var originalLine = lines.shift(),
        fitLine = originalLine;

    var textBBox;

    for (;;) {
      textBBox = getTextBBox(fitLine, fakeText);

      textBBox.width = fitLine ? textBBox.width : 0;

      // try to fit
      if (fitLine === ' ' || fitLine === '' || textBBox.width < Math.round(maxWidth) || fitLine.length < 2) {
        return fit(lines, fitLine, originalLine, textBBox);
      }

      fitLine = shortenLine(fitLine, textBBox.width, maxWidth);
    }
  }

  function fit(lines, fitLine, originalLine, textBBox) {
    if (fitLine.length < originalLine.length) {
      var remainder = originalLine.slice(fitLine.length).trim();

      lines.unshift(remainder);
    }

    return {
      width: textBBox.width,
      height: textBBox.height,
      text: fitLine
    };
  }


  /**
   * Shortens a line based on spacing and hyphens.
   * Returns the shortened result on success.
   *
   * @param  {String} line
   * @param  {Number} maxLength the maximum characters of the string
   * @return {String} the shortened string
   */
  function semanticShorten(line, maxLength) {
    var parts = line.split(/(\s|-)/g),
        part,
        shortenedParts = [],
        length = 0;

    // try to shorten via spaces + hyphens
    if (parts.length > 1) {
      while ((part = parts.shift())) {
        if (part.length + length < maxLength) {
          shortenedParts.push(part);
          length += part.length;
        } else {
          // remove previous part, too if hyphen does not fit anymore
          if (part === '-') {
            shortenedParts.pop();
          }

          break;
        }
      }
    }

    return shortenedParts.join('');
  }


  function shortenLine(line, width, maxWidth) {
    var length = Math.max(line.length * (maxWidth / width), 1);

    // try to shorten semantically (i.e. based on spaces and hyphens)
    var shortenedLine = semanticShorten(line, length);

    if (!shortenedLine) {

      // force shorten by cutting the long word
      shortenedLine = line.slice(0, Math.max(Math.round(length - 1), 1));
    }

    return shortenedLine;
  }


  function getHelperSvg() {
    var helperSvg = document.getElementById('helper-svg');

    if (!helperSvg) {
      helperSvg = create('svg');

      attr$1(helperSvg, {
        id: 'helper-svg',
        width: 0,
        height: 0,
        style: 'visibility: hidden; position: fixed'
      });

      document.body.appendChild(helperSvg);
    }

    return helperSvg;
  }


  /**
   * Creates a new label utility
   *
   * @param {Object} config
   * @param {Dimensions} config.size
   * @param {Number} config.padding
   * @param {Object} config.style
   * @param {String} config.align
   */
  function Text(config) {

    this._config = assign({}, {
      size: DEFAULT_LABEL_SIZE,
      padding: DEFAULT_BOX_PADDING,
      style: {},
      align: 'center-top'
    }, config || {});
  }

  /**
   * Returns the layouted text as an SVG element.
   *
   * @param {String} text
   * @param {Object} options
   *
   * @return {SVGElement}
   */
  Text.prototype.createText = function(text, options) {
    return this.layoutText(text, options).element;
  };

  /**
   * Returns a labels layouted dimensions.
   *
   * @param {String} text to layout
   * @param {Object} options
   *
   * @return {Dimensions}
   */
  Text.prototype.getDimensions = function(text, options) {
    return this.layoutText(text, options).dimensions;
  };

  /**
   * Creates and returns a label and its bounding box.
   *
   * @method Text#createText
   *
   * @param {String} text the text to render on the label
   * @param {Object} options
   * @param {String} options.align how to align in the bounding box.
   *                               Any of { 'center-middle', 'center-top' },
   *                               defaults to 'center-top'.
   * @param {String} options.style style to be applied to the text
   * @param {boolean} options.fitBox indicates if box will be recalculated to
   *                                 fit text
   *
   * @return {Object} { element, dimensions }
   */
  Text.prototype.layoutText = function(text, options) {
    var box = assign({}, this._config.size, options.box),
        style = assign({}, this._config.style, options.style),
        align = parseAlign(options.align || this._config.align),
        padding = parsePadding(options.padding !== undefined ? options.padding : this._config.padding),
        fitBox = options.fitBox || false;

    var lineHeight = getLineHeight(style);

    var lines = text.split(/\r?\n/g),
        layouted = [];

    var maxWidth = box.width - padding.left - padding.right;

    // ensure correct rendering by attaching helper text node to invisible SVG
    var helperText = create('text');
    attr$1(helperText, { x: 0, y: 0 });
    attr$1(helperText, style);

    var helperSvg = getHelperSvg();

    append(helperSvg, helperText);

    while (lines.length) {
      layouted.push(layoutNext(lines, maxWidth, helperText));
    }

    if (align.vertical === 'middle') {
      padding.top = padding.bottom = 0;
    }

    var totalHeight = reduce(layouted, function(sum, line, idx) {
      return sum + (lineHeight || line.height);
    }, 0) + padding.top + padding.bottom;

    var maxLineWidth = reduce(layouted, function(sum, line, idx) {
      return line.width > sum ? line.width : sum;
    }, 0);

    // the y position of the next line
    var y = padding.top;

    if (align.vertical === 'middle') {
      y += (box.height - totalHeight) / 2;
    }

    // magic number initial offset
    y -= (lineHeight || layouted[0].height) / 4;


    var textElement = create('text');

    attr$1(textElement, style);

    // layout each line taking into account that parent
    // shape might resize to fit text size
    forEach(layouted, function(line) {

      var x;

      y += (lineHeight || line.height);

      switch (align.horizontal) {
      case 'left':
        x = padding.left;
        break;

      case 'right':
        x = ((fitBox ? maxLineWidth : maxWidth)
          - padding.right - line.width);
        break;

      default:
        // aka center
        x = Math.max((((fitBox ? maxLineWidth : maxWidth)
          - line.width) / 2 + padding.left), 0);
      }

      var tspan = create('tspan');
      attr$1(tspan, { x: x, y: y });

      tspan.textContent = line.text;

      append(textElement, tspan);
    });

    remove$1(helperText);

    var dimensions = {
      width: maxLineWidth,
      height: totalHeight
    };

    return {
      dimensions: dimensions,
      element: textElement
    };
  };


  function getLineHeight(style) {
    if ('fontSize' in style && 'lineHeight' in style) {
      return style.lineHeight * parseInt(style.fontSize, 10);
    }
  }

  var DEFAULT_FONT_SIZE = 12;
  var LINE_HEIGHT_RATIO = 1.2;

  var MIN_TEXT_ANNOTATION_HEIGHT = 30;


  function TextRenderer(config) {

    var defaultStyle = assign({
      fontFamily: 'Arial, sans-serif',
      fontSize: DEFAULT_FONT_SIZE,
      fontWeight: 'normal',
      lineHeight: LINE_HEIGHT_RATIO
    }, config && config.defaultStyle || {});

    var fontSize = parseInt(defaultStyle.fontSize, 10) - 1;

    var externalStyle = assign({}, defaultStyle, {
      fontSize: fontSize
    }, config && config.externalStyle || {});

    var textUtil = new Text({
      style: defaultStyle
    });

    /**
     * Get the new bounds of an externally rendered,
     * layouted label.
     *
     * @param  {Bounds} bounds
     * @param  {String} text
     *
     * @return {Bounds}
     */
    this.getExternalLabelBounds = function(bounds, text) {

      var layoutedDimensions = textUtil.getDimensions(text, {
        box: {
          width: 90,
          height: 30,
          x: bounds.width / 2 + bounds.x,
          y: bounds.height / 2 + bounds.y
        },
        style: externalStyle
      });

      // resize label shape to fit label text
      return {
        x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
        y: Math.round(bounds.y),
        width: Math.ceil(layoutedDimensions.width),
        height: Math.ceil(layoutedDimensions.height)
      };

    };

    /**
     * Get the new bounds of text annotation.
     *
     * @param  {Bounds} bounds
     * @param  {String} text
     *
     * @return {Bounds}
     */
    this.getTextAnnotationBounds = function(bounds, text) {

      var layoutedDimensions = textUtil.getDimensions(text, {
        box: bounds,
        style: defaultStyle,
        align: 'left-top',
        padding: 5
      });

      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: Math.max(MIN_TEXT_ANNOTATION_HEIGHT, Math.round(layoutedDimensions.height))
      };
    };

    /**
     * Create a layouted text element.
     *
     * @param {String} text
     * @param {Object} [options]
     *
     * @return {SVGElement} rendered text
     */
    this.createText = function(text, options) {
      return textUtil.createText(text, options || {});
    };

    /**
     * Get default text style.
     */
    this.getDefaultStyle = function() {
      return defaultStyle;
    };

    /**
     * Get the external text style.
     */
    this.getExternalStyle = function() {
      return externalStyle;
    };

  }

  TextRenderer.$inject = [
    'config.textRenderer'
  ];

  /**
   * Map containing SVG paths needed by BpmnRenderer.
   */

  function PathMap() {

    /**
     * Contains a map of path elements
     *
     * <h1>Path definition</h1>
     * A parameterized path is defined like this:
     * <pre>
     * 'GATEWAY_PARALLEL': {
     *   d: 'm {mx},{my} {e.x0},0 0,{e.x1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
            '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
     *   height: 17.5,
     *   width:  17.5,
     *   heightElements: [2.5, 7.5],
     *   widthElements: [2.5, 7.5]
     * }
     * </pre>
     * <p>It's important to specify a correct <b>height and width</b> for the path as the scaling
     * is based on the ratio between the specified height and width in this object and the
     * height and width that is set as scale target (Note x,y coordinates will be scaled with
     * individual ratios).</p>
     * <p>The '<b>heightElements</b>' and '<b>widthElements</b>' array must contain the values that will be scaled.
     * The scaling is based on the computed ratios.
     * Coordinates on the y axis should be in the <b>heightElement</b>'s array, they will be scaled using
     * the computed ratio coefficient.
     * In the parameterized path the scaled values can be accessed through the 'e' object in {} brackets.
     *   <ul>
     *    <li>The values for the y axis can be accessed in the path string using {e.y0}, {e.y1}, ....</li>
     *    <li>The values for the x axis can be accessed in the path string using {e.x0}, {e.x1}, ....</li>
     *   </ul>
     *   The numbers x0, x1 respectively y0, y1, ... map to the corresponding array index.
     * </p>
     */
    this.pathMap = {
      'EVENT_MESSAGE': {
        d: 'm {mx},{my} l 0,{e.y1} l {e.x1},0 l 0,-{e.y1} z l {e.x0},{e.y0} l {e.x0},-{e.y0}',
        height: 36,
        width:  36,
        heightElements: [6, 14],
        widthElements: [10.5, 21]
      },
      'EVENT_SIGNAL': {
        d: 'M {mx},{my} l {e.x0},{e.y0} l -{e.x1},0 Z',
        height: 36,
        width: 36,
        heightElements: [18],
        widthElements: [10, 20]
      },
      'EVENT_ESCALATION': {
        d: 'M {mx},{my} l {e.x0},{e.y0} l -{e.x0},-{e.y1} l -{e.x0},{e.y1} Z',
        height: 36,
        width: 36,
        heightElements: [20, 7],
        widthElements: [8]
      },
      'EVENT_CONDITIONAL': {
        d: 'M {e.x0},{e.y0} l {e.x1},0 l 0,{e.y2} l -{e.x1},0 Z ' +
           'M {e.x2},{e.y3} l {e.x0},0 ' +
           'M {e.x2},{e.y4} l {e.x0},0 ' +
           'M {e.x2},{e.y5} l {e.x0},0 ' +
           'M {e.x2},{e.y6} l {e.x0},0 ' +
           'M {e.x2},{e.y7} l {e.x0},0 ' +
           'M {e.x2},{e.y8} l {e.x0},0 ',
        height: 36,
        width:  36,
        heightElements: [8.5, 14.5, 18, 11.5, 14.5, 17.5, 20.5, 23.5, 26.5],
        widthElements:  [10.5, 14.5, 12.5]
      },
      'EVENT_LINK': {
        d: 'm {mx},{my} 0,{e.y0} -{e.x1},0 0,{e.y1} {e.x1},0 0,{e.y0} {e.x0},-{e.y2} -{e.x0},-{e.y2} z',
        height: 36,
        width: 36,
        heightElements: [4.4375, 6.75, 7.8125],
        widthElements: [9.84375, 13.5]
      },
      'EVENT_ERROR': {
        d: 'm {mx},{my} {e.x0},-{e.y0} {e.x1},-{e.y1} {e.x2},{e.y2} {e.x3},-{e.y3} -{e.x4},{e.y4} -{e.x5},-{e.y5} z',
        height: 36,
        width: 36,
        heightElements: [0.023, 8.737, 8.151, 16.564, 10.591, 8.714],
        widthElements: [0.085, 6.672, 6.97, 4.273, 5.337, 6.636]
      },
      'EVENT_CANCEL_45': {
        d: 'm {mx},{my} -{e.x1},0 0,{e.x0} {e.x1},0 0,{e.y1} {e.x0},0 ' +
          '0,-{e.y1} {e.x1},0 0,-{e.y0} -{e.x1},0 0,-{e.y1} -{e.x0},0 z',
        height: 36,
        width: 36,
        heightElements: [4.75, 8.5],
        widthElements: [4.75, 8.5]
      },
      'EVENT_COMPENSATION': {
        d: 'm {mx},{my} {e.x0},-{e.y0} 0,{e.y1} z m {e.x1},-{e.y2} {e.x2},-{e.y3} 0,{e.y1} -{e.x2},-{e.y3} z',
        height: 36,
        width: 36,
        heightElements: [6.5, 13, 0.4, 6.1],
        widthElements: [9, 9.3, 8.7]
      },
      'EVENT_TIMER_WH': {
        d: 'M {mx},{my} l {e.x0},-{e.y0} m -{e.x0},{e.y0} l {e.x1},{e.y1} ',
        height: 36,
        width:  36,
        heightElements: [10, 2],
        widthElements: [3, 7]
      },
      'EVENT_TIMER_LINE': {
        d:  'M {mx},{my} ' +
            'm {e.x0},{e.y0} l -{e.x1},{e.y1} ',
        height: 36,
        width:  36,
        heightElements: [10, 3],
        widthElements: [0, 0]
      },
      'EVENT_MULTIPLE': {
        d:'m {mx},{my} {e.x1},-{e.y0} {e.x1},{e.y0} -{e.x0},{e.y1} -{e.x2},0 z',
        height: 36,
        width:  36,
        heightElements: [6.28099, 12.56199],
        widthElements: [3.1405, 9.42149, 12.56198]
      },
      'EVENT_PARALLEL_MULTIPLE': {
        d:'m {mx},{my} {e.x0},0 0,{e.y1} {e.x1},0 0,{e.y0} -{e.x1},0 0,{e.y1} ' +
          '-{e.x0},0 0,-{e.y1} -{e.x1},0 0,-{e.y0} {e.x1},0 z',
        height: 36,
        width:  36,
        heightElements: [2.56228, 7.68683],
        widthElements: [2.56228, 7.68683]
      },
      'GATEWAY_EXCLUSIVE': {
        d:'m {mx},{my} {e.x0},{e.y0} {e.x1},{e.y0} {e.x2},0 {e.x4},{e.y2} ' +
                      '{e.x4},{e.y1} {e.x2},0 {e.x1},{e.y3} {e.x0},{e.y3} ' +
                      '{e.x3},0 {e.x5},{e.y1} {e.x5},{e.y2} {e.x3},0 z',
        height: 17.5,
        width:  17.5,
        heightElements: [8.5, 6.5312, -6.5312, -8.5],
        widthElements:  [6.5, -6.5, 3, -3, 5, -5]
      },
      'GATEWAY_PARALLEL': {
        d:'m {mx},{my} 0,{e.y1} -{e.x1},0 0,{e.y0} {e.x1},0 0,{e.y1} {e.x0},0 ' +
          '0,-{e.y1} {e.x1},0 0,-{e.y0} -{e.x1},0 0,-{e.y1} -{e.x0},0 z',
        height: 30,
        width:  30,
        heightElements: [5, 12.5],
        widthElements: [5, 12.5]
      },
      'GATEWAY_EVENT_BASED': {
        d:'m {mx},{my} {e.x0},{e.y0} {e.x0},{e.y1} {e.x1},{e.y2} {e.x2},0 z',
        height: 11,
        width:  11,
        heightElements: [-6, 6, 12, -12],
        widthElements: [9, -3, -12]
      },
      'GATEWAY_COMPLEX': {
        d:'m {mx},{my} 0,{e.y0} -{e.x0},-{e.y1} -{e.x1},{e.y2} {e.x0},{e.y1} -{e.x2},0 0,{e.y3} ' +
          '{e.x2},0  -{e.x0},{e.y1} l {e.x1},{e.y2} {e.x0},-{e.y1} 0,{e.y0} {e.x3},0 0,-{e.y0} {e.x0},{e.y1} ' +
          '{e.x1},-{e.y2} -{e.x0},-{e.y1} {e.x2},0 0,-{e.y3} -{e.x2},0 {e.x0},-{e.y1} -{e.x1},-{e.y2} ' +
          '-{e.x0},{e.y1} 0,-{e.y0} -{e.x3},0 z',
        height: 17.125,
        width:  17.125,
        heightElements: [4.875, 3.4375, 2.125, 3],
        widthElements: [3.4375, 2.125, 4.875, 3]
      },
      'DATA_OBJECT_PATH': {
        d:'m 0,0 {e.x1},0 {e.x0},{e.y0} 0,{e.y1} -{e.x2},0 0,-{e.y2} {e.x1},0 0,{e.y0} {e.x0},0',
        height: 61,
        width:  51,
        heightElements: [10, 50, 60],
        widthElements: [10, 40, 50, 60]
      },
      'DATA_OBJECT_COLLECTION_PATH': {
        d:'m {mx}, {my} ' +
          'm  0 15  l 0 -15 ' +
          'm  4 15  l 0 -15 ' +
          'm  4 15  l 0 -15 ',
        height: 61,
        width:  51,
        heightElements: [12],
        widthElements: [1, 6, 12, 15]
      },
      'DATA_ARROW': {
        d:'m 5,9 9,0 0,-3 5,5 -5,5 0,-3 -9,0 z',
        height: 61,
        width:  51,
        heightElements: [],
        widthElements: []
      },
      'DATA_STORE': {
        d:'m  {mx},{my} ' +
          'l  0,{e.y2} ' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0 ' +
          'l  0,-{e.y2} ' +
          'c -{e.x0},-{e.y1} -{e.x1},-{e.y1} -{e.x2},0' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0 ' +
          'm  -{e.x2},{e.y0}' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1} {e.x2},0' +
          'm  -{e.x2},{e.y0}' +
          'c  {e.x0},{e.y1} {e.x1},{e.y1}  {e.x2},0',
        height: 61,
        width:  61,
        heightElements: [7, 10, 45],
        widthElements:  [2, 58, 60]
      },
      'TEXT_ANNOTATION': {
        d: 'm {mx}, {my} m 10,0 l -10,0 l 0,{e.y0} l 10,0',
        height: 30,
        width: 10,
        heightElements: [30],
        widthElements: [10]
      },
      'MARKER_SUB_PROCESS': {
        d: 'm{mx},{my} m 7,2 l 0,10 m -5,-5 l 10,0',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'MARKER_PARALLEL': {
        d: 'm{mx},{my} m 3,2 l 0,10 m 3,-10 l 0,10 m 3,-10 l 0,10',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'MARKER_SEQUENTIAL': {
        d: 'm{mx},{my} m 0,3 l 10,0 m -10,3 l 10,0 m -10,3 l 10,0',
        height: 10,
        width: 10,
        heightElements: [],
        widthElements: []
      },
      'MARKER_COMPENSATION': {
        d: 'm {mx},{my} 7,-5 0,10 z m 7.1,-0.3 6.9,-4.7 0,10 -6.9,-4.7 z',
        height: 10,
        width: 21,
        heightElements: [],
        widthElements: []
      },
      'MARKER_LOOP': {
        d: 'm {mx},{my} c 3.526979,0 6.386161,-2.829858 6.386161,-6.320661 0,-3.490806 -2.859182,-6.320661 ' +
          '-6.386161,-6.320661 -3.526978,0 -6.38616,2.829855 -6.38616,6.320661 0,1.745402 ' +
          '0.714797,3.325567 1.870463,4.469381 0.577834,0.571908 1.265885,1.034728 2.029916,1.35457 ' +
          'l -0.718163,-3.909793 m 0.718163,3.909793 -3.885211,0.802902',
        height: 13.9,
        width: 13.7,
        heightElements: [],
        widthElements: []
      },
      'MARKER_ADHOC': {
        d: 'm {mx},{my} m 0.84461,2.64411 c 1.05533,-1.23780996 2.64337,-2.07882 4.29653,-1.97997996 2.05163,0.0805 ' +
          '3.85579,1.15803 5.76082,1.79107 1.06385,0.34139996 2.24454,0.1438 3.18759,-0.43767 0.61743,-0.33642 ' +
          '1.2775,-0.64078 1.7542,-1.17511 0,0.56023 0,1.12046 0,1.6807 -0.98706,0.96237996 -2.29792,1.62393996 ' +
          '-3.6918,1.66181996 -1.24459,0.0927 -2.46671,-0.2491 -3.59505,-0.74812 -1.35789,-0.55965 ' +
          '-2.75133,-1.33436996 -4.27027,-1.18121996 -1.37741,0.14601 -2.41842,1.13685996 -3.44288,1.96782996 z',
        height: 4,
        width: 15,
        heightElements: [],
        widthElements: []
      },
      'TASK_TYPE_SEND': {
        d: 'm {mx},{my} l 0,{e.y1} l {e.x1},0 l 0,-{e.y1} z l {e.x0},{e.y0} l {e.x0},-{e.y0}',
        height: 14,
        width:  21,
        heightElements: [6, 14],
        widthElements: [10.5, 21]
      },
      'TASK_TYPE_SCRIPT': {
        d: 'm {mx},{my} c 9.966553,-6.27276 -8.000926,-7.91932 2.968968,-14.938 l -8.802728,0 ' +
          'c -10.969894,7.01868 6.997585,8.66524 -2.968967,14.938 z ' +
          'm -7,-12 l 5,0 ' +
          'm -4.5,3 l 4.5,0 ' +
          'm -3,3 l 5,0' +
          'm -4,3 l 5,0',
        height: 15,
        width:  12.6,
        heightElements: [6, 14],
        widthElements: [10.5, 21]
      },
      'TASK_TYPE_USER_1': {
        d: 'm {mx},{my} c 0.909,-0.845 1.594,-2.049 1.594,-3.385 0,-2.554 -1.805,-4.62199999 ' +
          '-4.357,-4.62199999 -2.55199998,0 -4.28799998,2.06799999 -4.28799998,4.62199999 0,1.348 ' +
          '0.974,2.562 1.89599998,3.405 -0.52899998,0.187 -5.669,2.097 -5.794,4.7560005 v 6.718 ' +
          'h 17 v -6.718 c 0,-2.2980005 -5.5279996,-4.5950005 -6.0509996,-4.7760005 z' +
          'm -8,6 l 0,5.5 m 11,0 l 0,-5'
      },
      'TASK_TYPE_USER_2': {
        d: 'm {mx},{my} m 2.162,1.009 c 0,2.4470005 -2.158,4.4310005 -4.821,4.4310005 ' +
          '-2.66499998,0 -4.822,-1.981 -4.822,-4.4310005 '
      },
      'TASK_TYPE_USER_3': {
        d: 'm {mx},{my} m -6.9,-3.80 c 0,0 2.25099998,-2.358 4.27399998,-1.177 2.024,1.181 4.221,1.537 ' +
          '4.124,0.965 -0.098,-0.57 -0.117,-3.79099999 -4.191,-4.13599999 -3.57499998,0.001 ' +
          '-4.20799998,3.36699999 -4.20699998,4.34799999 z'
      },
      'TASK_TYPE_MANUAL': {
        d: 'm {mx},{my} c 0.234,-0.01 5.604,0.008 8.029,0.004 0.808,0 1.271,-0.172 1.417,-0.752 0.227,-0.898 ' +
          '-0.334,-1.314 -1.338,-1.316 -2.467,-0.01 -7.886,-0.004 -8.108,-0.004 -0.014,-0.079 0.016,-0.533 0,-0.61 ' +
          '0.195,-0.042 8.507,0.006 9.616,0.002 0.877,-0.007 1.35,-0.438 1.353,-1.208 0.003,-0.768 -0.479,-1.09 ' +
          '-1.35,-1.091 -2.968,-0.002 -9.619,-0.013 -9.619,-0.013 v -0.591 c 0,0 5.052,-0.016 7.225,-0.016 ' +
          '0.888,-0.002 1.354,-0.416 1.351,-1.193 -0.006,-0.761 -0.492,-1.196 -1.361,-1.196 -3.473,-0.005 ' +
          '-10.86,-0.003 -11.0829995,-0.003 -0.022,-0.047 -0.045,-0.094 -0.069,-0.139 0.3939995,-0.319 ' +
          '2.0409995,-1.626 2.4149995,-2.017 0.469,-0.4870005 0.519,-1.1650005 0.162,-1.6040005 -0.414,-0.511 ' +
          '-0.973,-0.5 -1.48,-0.236 -1.4609995,0.764 -6.5999995,3.6430005 -7.7329995,4.2710005 -0.9,0.499 ' +
          '-1.516,1.253 -1.882,2.19 -0.37000002,0.95 -0.17,2.01 -0.166,2.979 0.004,0.718 -0.27300002,1.345 ' +
          '-0.055,2.063 0.629,2.087 2.425,3.312 4.859,3.318 4.6179995,0.014 9.2379995,-0.139 13.8569995,-0.158 ' +
          '0.755,-0.004 1.171,-0.301 1.182,-1.033 0.012,-0.754 -0.423,-0.969 -1.183,-0.973 -1.778,-0.01 ' +
          '-5.824,-0.004 -6.04,-0.004 10e-4,-0.084 0.003,-0.586 10e-4,-0.67 z'
      },
      'TASK_TYPE_INSTANTIATING_SEND': {
        d: 'm {mx},{my} l 0,8.4 l 12.6,0 l 0,-8.4 z l 6.3,3.6 l 6.3,-3.6'
      },
      'TASK_TYPE_SERVICE': {
        d: 'm {mx},{my} v -1.71335 c 0.352326,-0.0705 0.703932,-0.17838 1.047628,-0.32133 ' +
          '0.344416,-0.14465 0.665822,-0.32133 0.966377,-0.52145 l 1.19431,1.18005 1.567487,-1.57688 ' +
          '-1.195028,-1.18014 c 0.403376,-0.61394 0.683079,-1.29908 0.825447,-2.01824 l 1.622133,-0.01 ' +
          'v -2.2196 l -1.636514,0.01 c -0.07333,-0.35153 -0.178319,-0.70024 -0.323564,-1.04372 ' +
          '-0.145244,-0.34406 -0.321407,-0.6644 -0.522735,-0.96217 l 1.131035,-1.13631 -1.583305,-1.56293 ' +
          '-1.129598,1.13589 c -0.614052,-0.40108 -1.302883,-0.68093 -2.022633,-0.82247 l 0.0093,-1.61852 ' +
          'h -2.241173 l 0.0042,1.63124 c -0.353763,0.0736 -0.705369,0.17977 -1.049785,0.32371 -0.344415,0.14437 ' +
          '-0.665102,0.32092 -0.9635006,0.52046 l -1.1698628,-1.15823 -1.5667691,1.5792 1.1684265,1.15669 ' +
          'c -0.4026573,0.61283 -0.68308,1.29797 -0.8247287,2.01713 l -1.6588041,0.003 v 2.22174 ' +
          'l 1.6724648,-0.006 c 0.073327,0.35077 0.1797598,0.70243 0.3242851,1.04472 0.1452428,0.34448 ' +
          '0.3214064,0.6644 0.5227339,0.96066 l -1.1993431,1.19723 1.5840256,1.56011 1.1964668,-1.19348 ' +
          'c 0.6140517,0.40346 1.3028827,0.68232 2.0233517,0.82331 l 7.19e-4,1.69892 h 2.226848 z ' +
          'm 0.221462,-3.9957 c -1.788948,0.7502 -3.8576,-0.0928 -4.6097055,-1.87438 -0.7521065,-1.78321 ' +
          '0.090598,-3.84627 1.8802645,-4.59604 1.78823,-0.74936 3.856881,0.0929 4.608987,1.87437 ' +
          '0.752106,1.78165 -0.0906,3.84612 -1.879546,4.59605 z'
      },
      'TASK_TYPE_SERVICE_FILL': {
        d: 'm {mx},{my} c -1.788948,0.7502 -3.8576,-0.0928 -4.6097055,-1.87438 -0.7521065,-1.78321 ' +
          '0.090598,-3.84627 1.8802645,-4.59604 1.78823,-0.74936 3.856881,0.0929 4.608987,1.87437 ' +
          '0.752106,1.78165 -0.0906,3.84612 -1.879546,4.59605 z'
      },
      'TASK_TYPE_BUSINESS_RULE_HEADER': {
        d: 'm {mx},{my} 0,4 20,0 0,-4 z'
      },
      'TASK_TYPE_BUSINESS_RULE_MAIN': {
        d: 'm {mx},{my} 0,12 20,0 0,-12 z' +
          'm 0,8 l 20,0 ' +
          'm -13,-4 l 0,8'
      },
      'MESSAGE_FLOW_MARKER': {
        d: 'm {mx},{my} m -10.5 ,-7 l 0,14 l 21,0 l 0,-14 z l 10.5,6 l 10.5,-6'
      }
    };

    this.getRawPath = function getRawPath(pathId) {
      return this.pathMap[pathId].d;
    };

    /**
     * Scales the path to the given height and width.
     * <h1>Use case</h1>
     * <p>Use case is to scale the content of elements (event, gateways) based
     * on the element bounding box's size.
     * </p>
     * <h1>Why not transform</h1>
     * <p>Scaling a path with transform() will also scale the stroke and IE does not support
     * the option 'non-scaling-stroke' to prevent this.
     * Also there are use cases where only some parts of a path should be
     * scaled.</p>
     *
     * @param {String} pathId The ID of the path.
     * @param {Object} param <p>
     *   Example param object scales the path to 60% size of the container (data.width, data.height).
     *   <pre>
     *   {
     *     xScaleFactor: 0.6,
     *     yScaleFactor:0.6,
     *     containerWidth: data.width,
     *     containerHeight: data.height,
     *     position: {
     *       mx: 0.46,
     *       my: 0.2,
     *     }
     *   }
     *   </pre>
     *   <ul>
     *    <li>targetpathwidth = xScaleFactor * containerWidth</li>
     *    <li>targetpathheight = yScaleFactor * containerHeight</li>
     *    <li>Position is used to set the starting coordinate of the path. M is computed:
      *    <ul>
      *      <li>position.x * containerWidth</li>
      *      <li>position.y * containerHeight</li>
      *    </ul>
      *    Center of the container <pre> position: {
     *       mx: 0.5,
     *       my: 0.5,
     *     }</pre>
     *     Upper left corner of the container
     *     <pre> position: {
     *       mx: 0.0,
     *       my: 0.0,
     *     }</pre>
     *    </li>
     *   </ul>
     * </p>
     *
     */
    this.getScaledPath = function getScaledPath(pathId, param) {
      var rawPath = this.pathMap[pathId];

      // positioning
      // compute the start point of the path
      var mx, my;

      if (param.abspos) {
        mx = param.abspos.x;
        my = param.abspos.y;
      } else {
        mx = param.containerWidth * param.position.mx;
        my = param.containerHeight * param.position.my;
      }

      var coordinates = {}; // map for the scaled coordinates
      if (param.position) {

        // path
        var heightRatio = (param.containerHeight / rawPath.height) * param.yScaleFactor;
        var widthRatio = (param.containerWidth / rawPath.width) * param.xScaleFactor;


        // Apply height ratio
        for (var heightIndex = 0; heightIndex < rawPath.heightElements.length; heightIndex++) {
          coordinates['y' + heightIndex] = rawPath.heightElements[heightIndex] * heightRatio;
        }

        // Apply width ratio
        for (var widthIndex = 0; widthIndex < rawPath.widthElements.length; widthIndex++) {
          coordinates['x' + widthIndex] = rawPath.widthElements[widthIndex] * widthRatio;
        }
      }

      // Apply value to raw path
      var path = format(
        rawPath.d, {
          mx: mx,
          my: my,
          e: coordinates
        }
      );
      return path;
    };
  }

  // helpers //////////////////////

  // copied from https://github.com/adobe-webplatform/Snap.svg/blob/master/src/svg.js
  var tokenRegex = /\{([^}]+)\}/g,
      objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches .xxxxx or ["xxxxx"] to run over object properties

  function replacer(all, key, obj) {
    var res = obj;
    key.replace(objNotationRegex, function(all, name, quote, quotedName, isFunc) {
      name = name || quotedName;
      if (res) {
        if (name in res) {
          res = res[name];
        }
        typeof res == 'function' && isFunc && (res = res());
      }
    });
    res = (res == null || res == obj ? all : res) + '';

    return res;
  }

  function format(str, obj) {
    return String(str).replace(tokenRegex, function(all, key) {
      return replacer(all, key, obj);
    });
  }

  var DrawModule$1 = {
    __init__: [ 'bpmnRenderer' ],
    bpmnRenderer: [ 'type', BpmnRenderer ],
    textRenderer: [ 'type', TextRenderer ],
    pathMap: [ 'type', PathMap ]
  };

  /**
   * A simple translation stub to be used for multi-language support
   * in diagrams. Can be easily replaced with a more sophisticated
   * solution.
   *
   * @example
   *
   * // use it inside any diagram component by injecting `translate`.
   *
   * function MyService(translate) {
   *   alert(translate('HELLO {you}', { you: 'You!' }));
   * }
   *
   * @param {String} template to interpolate
   * @param {Object} [replacements] a map with substitutes
   *
   * @return {String} the translated string
   */
  function translate$1(template, replacements) {

    replacements = replacements || {};

    return template.replace(/{([^}]+)}/g, function(_, key) {
      return replacements[key] || '{' + key + '}';
    });
  }

  var TranslateModule = {
    translate: [ 'value', translate$1 ]
  };

  var DEFAULT_LABEL_SIZE$1 = {
    width: 90,
    height: 20
  };

  var FLOW_LABEL_INDENT = 15;


  /**
   * Returns true if the given semantic has an external label
   *
   * @param {BpmnElement} semantic
   * @return {Boolean} true if has label
   */
  function isLabelExternal(semantic) {
    return is$1(semantic, 'bpmn:Event') ||
           is$1(semantic, 'bpmn:Gateway') ||
           is$1(semantic, 'bpmn:DataStoreReference') ||
           is$1(semantic, 'bpmn:DataObjectReference') ||
           is$1(semantic, 'bpmn:DataInput') ||
           is$1(semantic, 'bpmn:DataOutput') ||
           is$1(semantic, 'bpmn:SequenceFlow') ||
           is$1(semantic, 'bpmn:MessageFlow') ||
           is$1(semantic, 'bpmn:Group');
  }

  /**
   * Get the position for sequence flow labels
   *
   * @param  {Array<Point>} waypoints
   * @return {Point} the label position
   */
  function getFlowLabelPosition(waypoints) {

    // get the waypoints mid
    var mid = waypoints.length / 2 - 1;

    var first = waypoints[Math.floor(mid)];
    var second = waypoints[Math.ceil(mid + 0.01)];

    // get position
    var position = getWaypointsMid(waypoints);

    // calculate angle
    var angle = Math.atan((second.y - first.y) / (second.x - first.x));

    var x = position.x,
        y = position.y;

    if (Math.abs(angle) < Math.PI / 2) {
      y -= FLOW_LABEL_INDENT;
    } else {
      x += FLOW_LABEL_INDENT;
    }

    return { x: x, y: y };
  }


  /**
   * Get the middle of a number of waypoints
   *
   * @param  {Array<Point>} waypoints
   * @return {Point} the mid point
   */
  function getWaypointsMid(waypoints) {

    var mid = waypoints.length / 2 - 1;

    var first = waypoints[Math.floor(mid)];
    var second = waypoints[Math.ceil(mid + 0.01)];

    return {
      x: first.x + (second.x - first.x) / 2,
      y: first.y + (second.y - first.y) / 2
    };
  }


  function getExternalLabelMid(element) {

    if (element.waypoints) {
      return getFlowLabelPosition(element.waypoints);
    } else if (is$1(element, 'bpmn:Group')) {
      return {
        x: element.x + element.width / 2,
        y: element.y + DEFAULT_LABEL_SIZE$1.height / 2
      };
    } else {
      return {
        x: element.x + element.width / 2,
        y: element.y + element.height + DEFAULT_LABEL_SIZE$1.height / 2
      };
    }
  }


  /**
   * Returns the bounds of an elements label, parsed from the elements DI or
   * generated from its bounds.
   *
   * @param {BpmnElement} semantic
   * @param {djs.model.Base} element
   */
  function getExternalLabelBounds(semantic, element) {

    var mid,
        size,
        bounds,
        di = semantic.di,
        label = di.label;

    if (label && label.bounds) {
      bounds = label.bounds;

      size = {
        width: Math.max(DEFAULT_LABEL_SIZE$1.width, bounds.width),
        height: bounds.height
      };

      mid = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      };
    } else {

      mid = getExternalLabelMid(element);

      size = DEFAULT_LABEL_SIZE$1;
    }

    return assign({
      x: mid.x - size.width / 2,
      y: mid.y - size.height / 2
    }, size);
  }

  /**
   * This file contains portions that got extraced from Snap.svg (licensed Apache-2.0).
   *
   * @see https://github.com/adobe-webplatform/Snap.svg/blob/master/src/path.js
   */

  /* eslint no-fallthrough: "off" */

  var math = Math,
      PI = math.PI;

  function roundPoint(point) {

    return {
      x: Math.round(point.x),
      y: Math.round(point.y)
    };
  }


  /**
   * Get the mid of the given bounds or point.
   *
   * @param {Bounds|Point} bounds
   *
   * @return {Point}
   */
  function getMid(bounds) {
    return roundPoint({
      x: bounds.x + (bounds.width || 0) / 2,
      y: bounds.y + (bounds.height || 0) / 2
    });
  }

  function elementData(semantic, attrs) {
    return assign({
      id: semantic.id,
      type: semantic.$type,
      businessObject: semantic
    }, attrs);
  }

  function getWaypoints(bo, source, target) {

    var waypoints = bo.di.waypoint;

    if (!waypoints || waypoints.length < 2) {
      return [ getMid(source), getMid(target) ];
    }

    return waypoints.map(function(p) {
      return { x: p.x, y: p.y };
    });
  }

  function notYetDrawn(translate, semantic, refSemantic, property) {
    return new Error(translate('element {element} referenced by {referenced}#{property} not yet drawn', {
      element: elementToString(refSemantic),
      referenced: elementToString(semantic),
      property: property
    }));
  }


  /**
   * An importer that adds bpmn elements to the canvas
   *
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   * @param {ElementFactory} elementFactory
   * @param {ElementRegistry} elementRegistry
   * @param {Function} translate
   * @param {TextRenderer} textRenderer
   */
  function BpmnImporter(
      eventBus, canvas, elementFactory,
      elementRegistry, translate, textRenderer) {

    this._eventBus = eventBus;
    this._canvas = canvas;
    this._elementFactory = elementFactory;
    this._elementRegistry = elementRegistry;
    this._translate = translate;
    this._textRenderer = textRenderer;
  }

  BpmnImporter.$inject = [
    'eventBus',
    'canvas',
    'elementFactory',
    'elementRegistry',
    'translate',
    'textRenderer'
  ];


  /**
   * Add bpmn element (semantic) to the canvas onto the
   * specified parent shape.
   */
  BpmnImporter.prototype.add = function(semantic, parentElement) {

    var di = semantic.di,
        element,
        translate = this._translate,
        hidden;

    var parentIndex;

    // ROOT ELEMENT
    // handle the special case that we deal with a
    // invisible root element (process or collaboration)
    if (is$1(di, 'bpmndi:BPMNPlane')) {

      // add a virtual element (not being drawn)
      element = this._elementFactory.createRoot(elementData(semantic));

      this._canvas.setRootElement(element);
    }

    // SHAPE
    else if (is$1(di, 'bpmndi:BPMNShape')) {

      var collapsed = !isExpanded(semantic);
      hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

      var bounds = semantic.di.bounds;

      element = this._elementFactory.createShape(elementData(semantic, {
        collapsed: collapsed,
        hidden: hidden,
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
      }));

      if (is$1(semantic, 'bpmn:BoundaryEvent')) {
        this._attachBoundary(semantic, element);
      }

      // insert lanes behind other flow nodes (cf. #727)
      if (is$1(semantic, 'bpmn:Lane')) {
        parentIndex = 0;
      }

      if (is$1(semantic, 'bpmn:DataStoreReference')) {

        // check wether data store is inside our outside of its semantic parent
        if (!isPointInsideBBox(parentElement, getMid(bounds))) {
          parentElement = this._canvas.getRootElement();
        }
      }

      this._canvas.addShape(element, parentElement, parentIndex);
    }

    // CONNECTION
    else if (is$1(di, 'bpmndi:BPMNEdge')) {

      var source = this._getSource(semantic),
          target = this._getTarget(semantic);

      hidden = parentElement && (parentElement.hidden || parentElement.collapsed);

      element = this._elementFactory.createConnection(elementData(semantic, {
        hidden: hidden,
        source: source,
        target: target,
        waypoints: getWaypoints(semantic, source, target)
      }));

      if (is$1(semantic, 'bpmn:DataAssociation')) {

        // render always on top; this ensures DataAssociations
        // are rendered correctly across different "hacks" people
        // love to model such as cross participant / sub process
        // associations
        parentElement = null;
      }

      // insert sequence flows behind other flow nodes (cf. #727)
      if (is$1(semantic, 'bpmn:SequenceFlow')) {
        parentIndex = 0;
      }

      this._canvas.addConnection(element, parentElement, parentIndex);
    } else {
      throw new Error(translate('unknown di {di} for element {semantic}', {
        di: elementToString(di),
        semantic: elementToString(semantic)
      }));
    }
    // (optional) LABEL
    if (isLabelExternal(semantic) && getLabel(element)) {
      this.addLabel(semantic, element);
    }


    this._eventBus.fire('bpmnElement.added', { element: element });

    return element;
  };


  /**
   * Attach the boundary element to the given host
   *
   * @param {ModdleElement} boundarySemantic
   * @param {djs.model.Base} boundaryElement
   */
  BpmnImporter.prototype._attachBoundary = function(boundarySemantic, boundaryElement) {
    var translate = this._translate;
    var hostSemantic = boundarySemantic.attachedToRef;

    if (!hostSemantic) {
      throw new Error(translate('missing {semantic}#attachedToRef', {
        semantic: elementToString(boundarySemantic)
      }));
    }

    var host = this._elementRegistry.get(hostSemantic.id),
        attachers = host && host.attachers;

    if (!host) {
      throw notYetDrawn(translate, boundarySemantic, hostSemantic, 'attachedToRef');
    }

    // wire element.host <> host.attachers
    boundaryElement.host = host;

    if (!attachers) {
      host.attachers = attachers = [];
    }

    if (attachers.indexOf(boundaryElement) === -1) {
      attachers.push(boundaryElement);
    }
  };


  /**
   * add label for an element
   */
  BpmnImporter.prototype.addLabel = function(semantic, element) {
    var bounds,
        text,
        label;

    bounds = getExternalLabelBounds(semantic, element);

    text = getLabel(element);

    if (text) {
      // get corrected bounds from actual layouted text
      bounds = this._textRenderer.getExternalLabelBounds(bounds, text);
    }

    label = this._elementFactory.createLabel(elementData(semantic, {
      id: semantic.id + '_label',
      labelTarget: element,
      type: 'label',
      hidden: element.hidden || !getLabel(element),
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height)
    }));

    return this._canvas.addShape(label, element.parent);
  };

  /**
   * Return the drawn connection end based on the given side.
   *
   * @throws {Error} if the end is not yet drawn
   */
  BpmnImporter.prototype._getEnd = function(semantic, side) {

    var element,
        refSemantic,
        type = semantic.$type,
        translate = this._translate;

    refSemantic = semantic[side + 'Ref'];

    // handle mysterious isMany DataAssociation#sourceRef
    if (side === 'source' && type === 'bpmn:DataInputAssociation') {
      refSemantic = refSemantic && refSemantic[0];
    }

    // fix source / target for DataInputAssociation / DataOutputAssociation
    if (side === 'source' && type === 'bpmn:DataOutputAssociation' ||
        side === 'target' && type === 'bpmn:DataInputAssociation') {

      refSemantic = semantic.$parent;
    }

    element = refSemantic && this._getElement(refSemantic);

    if (element) {
      return element;
    }

    if (refSemantic) {
      throw notYetDrawn(translate, semantic, refSemantic, side + 'Ref');
    } else {
      throw new Error(translate('{semantic}#{side} Ref not specified', {
        semantic: elementToString(semantic),
        side: side
      }));
    }
  };

  BpmnImporter.prototype._getSource = function(semantic) {
    return this._getEnd(semantic, 'source');
  };

  BpmnImporter.prototype._getTarget = function(semantic) {
    return this._getEnd(semantic, 'target');
  };


  BpmnImporter.prototype._getElement = function(semantic) {
    return this._elementRegistry.get(semantic.id);
  };


  // helpers ////////////////////

  function isPointInsideBBox(bbox, point) {
    var x = point.x,
        y = point.y;

    return x >= bbox.x &&
      x <= bbox.x + bbox.width &&
      y >= bbox.y &&
      y <= bbox.y + bbox.height;
  }

  var ImportModule = {
    __depends__: [
      TranslateModule
    ],
    bpmnImporter: [ 'type', BpmnImporter ]
  };

  var CoreModule$1 = {
    __depends__: [
      DrawModule$1,
      ImportModule
    ]
  };

  function getOriginal(event) {
    return event.originalEvent || event.srcEvent;
  }

  function isMac() {
    return (/mac/i).test(navigator.platform);
  }

  function isPrimaryButton(event) {
    // button === 0 -> left áka primary mouse button
    return !(getOriginal(event) || event).button;
  }

  function hasPrimaryModifier(event) {
    var originalEvent = getOriginal(event) || event;

    if (!isPrimaryButton(event)) {
      return false;
    }

    // Use alt as primary modifier key for mac OS
    if (isMac()) {
      return originalEvent.metaKey;
    } else {
      return originalEvent.ctrlKey;
    }
  }

  function allowAll(e) { return true; }

  var LOW_PRIORITY = 500;

  /**
   * A plugin that provides interaction events for diagram elements.
   *
   * It emits the following events:
   *
   *   * element.hover
   *   * element.out
   *   * element.click
   *   * element.dblclick
   *   * element.mousedown
   *   * element.contextmenu
   *
   * Each event is a tuple { element, gfx, originalEvent }.
   *
   * Canceling the event via Event#preventDefault()
   * prevents the original DOM operation.
   *
   * @param {EventBus} eventBus
   */
  function InteractionEvents(eventBus, elementRegistry, styles) {

    var HIT_STYLE = styles.cls('djs-hit', [ 'no-fill', 'no-border' ], {
      stroke: 'white',
      strokeWidth: 15
    });

    /**
     * Fire an interaction event.
     *
     * @param {String} type local event name, e.g. element.click.
     * @param {DOMEvent} event native event
     * @param {djs.model.Base} [element] the diagram element to emit the event on;
     *                                   defaults to the event target
     */
    function fire(type, event, element) {

      if (isIgnored(type, event)) {
        return;
      }

      var target, gfx, returnValue;

      if (!element) {
        target = event.delegateTarget || event.target;

        if (target) {
          gfx = target;
          element = elementRegistry.get(gfx);
        }
      } else {
        gfx = elementRegistry.getGraphics(element);
      }

      if (!gfx || !element) {
        return;
      }

      returnValue = eventBus.fire(type, {
        element: element,
        gfx: gfx,
        originalEvent: event
      });

      if (returnValue === false) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    // TODO(nikku): document this
    var handlers = {};

    function mouseHandler(localEventName) {
      return handlers[localEventName];
    }

    function isIgnored(localEventName, event) {

      var filter = ignoredFilters[localEventName] || isPrimaryButton;

      // only react on left mouse button interactions
      // except for interaction events that are enabled
      // for secundary mouse button
      return !filter(event);
    }

    var bindings = {
      mouseover: 'element.hover',
      mouseout: 'element.out',
      click: 'element.click',
      dblclick: 'element.dblclick',
      mousedown: 'element.mousedown',
      mousemove: 'element.mousemove',
      mouseup: 'element.mouseup',
      contextmenu: 'element.contextmenu'
    };

    var ignoredFilters = {
      'element.contextmenu': allowAll
    };


    // manual event trigger

    /**
     * Trigger an interaction event (based on a native dom event)
     * on the target shape or connection.
     *
     * @param {String} eventName the name of the triggered DOM event
     * @param {MouseEvent} event
     * @param {djs.model.Base} targetElement
     */
    function triggerMouseEvent(eventName, event, targetElement) {

      // i.e. element.mousedown...
      var localEventName = bindings[eventName];

      if (!localEventName) {
        throw new Error('unmapped DOM event name <' + eventName + '>');
      }

      return fire(localEventName, event, targetElement);
    }


    var elementSelector = 'svg, .djs-element';

    // event registration

    function registerEvent(node, event, localEvent, ignoredFilter) {

      var handler = handlers[localEvent] = function(event) {
        fire(localEvent, event);
      };

      if (ignoredFilter) {
        ignoredFilters[localEvent] = ignoredFilter;
      }

      handler.$delegate = delegateEvents.bind(node, elementSelector, event, handler);
    }

    function unregisterEvent(node, event, localEvent) {

      var handler = mouseHandler(localEvent);

      if (!handler) {
        return;
      }

      delegateEvents.unbind(node, event, handler.$delegate);
    }

    function registerEvents(svg) {
      forEach(bindings, function(val, key) {
        registerEvent(svg, key, val);
      });
    }

    function unregisterEvents(svg) {
      forEach(bindings, function(val, key) {
        unregisterEvent(svg, key, val);
      });
    }

    eventBus.on('canvas.destroy', function(event) {
      unregisterEvents(event.svg);
    });

    eventBus.on('canvas.init', function(event) {
      registerEvents(event.svg);
    });


    eventBus.on([ 'shape.added', 'connection.added' ], function(event) {
      var element = event.element,
          gfx = event.gfx,
          hit;

      if (element.waypoints) {
        hit = createLine(element.waypoints);
      } else {
        hit = create('rect');
        attr$1(hit, {
          x: 0,
          y: 0,
          width: element.width,
          height: element.height
        });
      }

      attr$1(hit, HIT_STYLE);

      append(gfx, hit);
    });

    // Update djs-hit on change.
    // A low priortity is necessary, because djs-hit of labels has to be updated
    // after the label bounds have been updated in the renderer.
    eventBus.on('shape.changed', LOW_PRIORITY, function(event) {

      var element = event.element,
          gfx = event.gfx,
          hit = query('.djs-hit', gfx);

      attr$1(hit, {
        width: element.width,
        height: element.height
      });
    });

    eventBus.on('connection.changed', function(event) {

      var element = event.element,
          gfx = event.gfx,
          hit = query('.djs-hit', gfx);

      updateLine(hit, element.waypoints);
    });


    // API

    this.fire = fire;

    this.triggerMouseEvent = triggerMouseEvent;

    this.mouseHandler = mouseHandler;

    this.registerEvent = registerEvent;
    this.unregisterEvent = unregisterEvent;
  }


  InteractionEvents.$inject = [
    'eventBus',
    'elementRegistry',
    'styles'
  ];


  /**
   * An event indicating that the mouse hovered over an element
   *
   * @event element.hover
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has left an element
   *
   * @event element.out
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has clicked an element
   *
   * @event element.click
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has double clicked an element
   *
   * @event element.dblclick
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has gone down on an element.
   *
   * @event element.mousedown
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the mouse has gone up on an element.
   *
   * @event element.mouseup
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  /**
   * An event indicating that the context menu action is triggered
   * via mouse or touch controls.
   *
   * @event element.contextmenu
   *
   * @type {Object}
   * @property {djs.model.Base} element
   * @property {SVGElement} gfx
   * @property {Event} originalEvent
   */

  var InteractionEventsModule = {
    __init__: [ 'interactionEvents' ],
    interactionEvents: [ 'type', InteractionEvents ]
  };

  var LOW_PRIORITY$1 = 500;


  /**
   * @class
   *
   * A plugin that adds an outline to shapes and connections that may be activated and styled
   * via CSS classes.
   *
   * @param {EventBus} eventBus
   * @param {Styles} styles
   * @param {ElementRegistry} elementRegistry
   */
  function Outline(eventBus, styles, elementRegistry) {

    this.offset = 6;

    var OUTLINE_STYLE = styles.cls('djs-outline', [ 'no-fill' ]);

    var self = this;

    function createOutline(gfx, bounds) {
      var outline = create('rect');

      attr$1(outline, assign({
        x: 10,
        y: 10,
        width: 100,
        height: 100
      }, OUTLINE_STYLE));

      append(gfx, outline);

      return outline;
    }

    // A low priortity is necessary, because outlines of labels have to be updated
    // after the label bounds have been updated in the renderer.
    eventBus.on([ 'shape.added', 'shape.changed' ], LOW_PRIORITY$1, function(event) {
      var element = event.element,
          gfx = event.gfx;

      var outline = query('.djs-outline', gfx);

      if (!outline) {
        outline = createOutline(gfx);
      }

      self.updateShapeOutline(outline, element);
    });

    eventBus.on([ 'connection.added', 'connection.changed' ], function(event) {
      var element = event.element,
          gfx = event.gfx;

      var outline = query('.djs-outline', gfx);

      if (!outline) {
        outline = createOutline(gfx);
      }

      self.updateConnectionOutline(outline, element);
    });
  }


  /**
   * Updates the outline of a shape respecting the dimension of the
   * element and an outline offset.
   *
   * @param  {SVGElement} outline
   * @param  {djs.model.Base} element
   */
  Outline.prototype.updateShapeOutline = function(outline, element) {

    attr$1(outline, {
      x: -this.offset,
      y: -this.offset,
      width: element.width + this.offset * 2,
      height: element.height + this.offset * 2
    });

  };


  /**
   * Updates the outline of a connection respecting the bounding box of
   * the connection and an outline offset.
   *
   * @param  {SVGElement} outline
   * @param  {djs.model.Base} element
   */
  Outline.prototype.updateConnectionOutline = function(outline, connection) {

    var bbox = getBBox(connection);

    attr$1(outline, {
      x: bbox.x - this.offset,
      y: bbox.y - this.offset,
      width: bbox.width + this.offset * 2,
      height: bbox.height + this.offset * 2
    });

  };


  Outline.$inject = ['eventBus', 'styles', 'elementRegistry'];

  var OutlineModule = {
    __init__: [ 'outline' ],
    outline: [ 'type', Outline ]
  };

  /**
   * A service that offers the current selection in a diagram.
   * Offers the api to control the selection, too.
   *
   * @class
   *
   * @param {EventBus} eventBus the event bus
   */
  function Selection(eventBus) {

    this._eventBus = eventBus;

    this._selectedElements = [];

    var self = this;

    eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
      var element = e.element;
      self.deselect(element);
    });

    eventBus.on([ 'diagram.clear' ], function(e) {
      self.select(null);
    });
  }

  Selection.$inject = [ 'eventBus' ];


  Selection.prototype.deselect = function(element) {
    var selectedElements = this._selectedElements;

    var idx = selectedElements.indexOf(element);

    if (idx !== -1) {
      var oldSelection = selectedElements.slice();

      selectedElements.splice(idx, 1);

      this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
    }
  };


  Selection.prototype.get = function() {
    return this._selectedElements;
  };

  Selection.prototype.isSelected = function(element) {
    return this._selectedElements.indexOf(element) !== -1;
  };


  /**
   * This method selects one or more elements on the diagram.
   *
   * By passing an additional add parameter you can decide whether or not the element(s)
   * should be added to the already existing selection or not.
   *
   * @method Selection#select
   *
   * @param  {Object|Object[]} elements element or array of elements to be selected
   * @param  {boolean} [add] whether the element(s) should be appended to the current selection, defaults to false
   */
  Selection.prototype.select = function(elements, add) {
    var selectedElements = this._selectedElements,
        oldSelection = selectedElements.slice();

    if (!isArray(elements)) {
      elements = elements ? [ elements ] : [];
    }

    // selection may be cleared by passing an empty array or null
    // to the method
    if (add) {
      forEach(elements, function(element) {
        if (selectedElements.indexOf(element) !== -1) {
          // already selected
          return;
        } else {
          selectedElements.push(element);
        }
      });
    } else {
      this._selectedElements = selectedElements = elements.slice();
    }

    this._eventBus.fire('selection.changed', { oldSelection: oldSelection, newSelection: selectedElements });
  };

  var MARKER_HOVER = 'hover',
      MARKER_SELECTED = 'selected';


  /**
   * A plugin that adds a visible selection UI to shapes and connections
   * by appending the <code>hover</code> and <code>selected</code> classes to them.
   *
   * @class
   *
   * Makes elements selectable, too.
   *
   * @param {EventBus} events
   * @param {SelectionService} selection
   * @param {Canvas} canvas
   */
  function SelectionVisuals(events, canvas, selection, styles) {

    this._multiSelectionBox = null;

    function addMarker(e, cls) {
      canvas.addMarker(e, cls);
    }

    function removeMarker(e, cls) {
      canvas.removeMarker(e, cls);
    }

    events.on('element.hover', function(event) {
      addMarker(event.element, MARKER_HOVER);
    });

    events.on('element.out', function(event) {
      removeMarker(event.element, MARKER_HOVER);
    });

    events.on('selection.changed', function(event) {

      function deselect(s) {
        removeMarker(s, MARKER_SELECTED);
      }

      function select(s) {
        addMarker(s, MARKER_SELECTED);
      }

      var oldSelection = event.oldSelection,
          newSelection = event.newSelection;

      forEach(oldSelection, function(e) {
        if (newSelection.indexOf(e) === -1) {
          deselect(e);
        }
      });

      forEach(newSelection, function(e) {
        if (oldSelection.indexOf(e) === -1) {
          select(e);
        }
      });
    });
  }

  SelectionVisuals.$inject = [
    'eventBus',
    'canvas',
    'selection',
    'styles'
  ];

  function SelectionBehavior(
      eventBus, selection, canvas,
      elementRegistry) {

    eventBus.on('create.end', 500, function(e) {

      // select the created shape after a
      // successful create operation
      if (e.context.canExecute) {
        selection.select(e.context.shape);
      }
    });

    eventBus.on('connect.end', 500, function(e) {

      // select the connect end target
      // after a connect operation
      if (e.context.canExecute && e.context.target) {
        selection.select(e.context.target);
      }
    });

    eventBus.on('shape.move.end', 500, function(e) {
      var previousSelection = e.previousSelection || [];

      var shape = elementRegistry.get(e.context.shape.id);

      // make sure at least the main moved element is being
      // selected after a move operation
      var inSelection = find(previousSelection, function(selectedShape) {
        return shape.id === selectedShape.id;
      });

      if (!inSelection) {
        selection.select(shape);
      }
    });

    // Shift + click selection
    eventBus.on('element.click', function(event) {

      var element = event.element;

      // do not select the root element
      // or connections
      if (element === canvas.getRootElement()) {
        element = null;
      }

      var isSelected = selection.isSelected(element),
          isMultiSelect = selection.get().length > 1;

      // mouse-event: SELECTION_KEY
      var add = hasPrimaryModifier(event);

      // select OR deselect element in multi selection
      if (isSelected && isMultiSelect) {
        if (add) {
          return selection.deselect(element);
        } else {
          return selection.select(element);
        }
      } else
      if (!isSelected) {
        selection.select(element, add);
      } else {
        selection.deselect(element);
      }
    });
  }

  SelectionBehavior.$inject = [
    'eventBus',
    'selection',
    'canvas',
    'elementRegistry'
  ];

  var SelectionModule = {
    __init__: [ 'selectionVisuals', 'selectionBehavior' ],
    __depends__: [
      InteractionEventsModule,
      OutlineModule
    ],
    selection: [ 'type', Selection ],
    selectionVisuals: [ 'type', SelectionVisuals ],
    selectionBehavior: [ 'type', SelectionBehavior ]
  };

  /**
   * Util that provides unique IDs.
   *
   * @class djs.util.IdGenerator
   * @constructor
   * @memberOf djs.util
   *
   * The ids can be customized via a given prefix and contain a random value to avoid collisions.
   *
   * @param {String} prefix a prefix to prepend to generated ids (for better readability)
   */
  function IdGenerator(prefix) {

    this._counter = 0;
    this._prefix = (prefix ? prefix + '-' : '') + Math.floor(Math.random() * 1000000000) + '-';
  }

  /**
   * Returns a next unique ID.
   *
   * @method djs.util.IdGenerator#next
   *
   * @returns {String} the id
   */
  IdGenerator.prototype.next = function() {
    return this._prefix + (++this._counter);
  };

  // document wide unique overlay ids
  var ids = new IdGenerator('ov');

  var LOW_PRIORITY$2 = 500;


  /**
   * A service that allows users to attach overlays to diagram elements.
   *
   * The overlay service will take care of overlay positioning during updates.
   *
   * @example
   *
   * // add a pink badge on the top left of the shape
   * overlays.add(someShape, {
   *   position: {
   *     top: -5,
   *     left: -5
   *   },
   *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
   * });
   *
   * // or add via shape id
   *
   * overlays.add('some-element-id', {
   *   position: {
   *     top: -5,
   *     left: -5
   *   }
   *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
   * });
   *
   * // or add with optional type
   *
   * overlays.add(someShape, 'badge', {
   *   position: {
   *     top: -5,
   *     left: -5
   *   }
   *   html: '<div style="width: 10px; background: fuchsia; color: white;">0</div>'
   * });
   *
   *
   * // remove an overlay
   *
   * var id = overlays.add(...);
   * overlays.remove(id);
   *
   *
   * You may configure overlay defaults during tool by providing a `config` module
   * with `overlays.defaults` as an entry:
   *
   * {
   *   overlays: {
   *     defaults: {
   *       show: {
   *         minZoom: 0.7,
   *         maxZoom: 5.0
   *       },
   *       scale: {
   *         min: 1
   *       }
   *     }
   * }
   *
   * @param {Object} config
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   * @param {ElementRegistry} elementRegistry
   */
  function Overlays(config, eventBus, canvas, elementRegistry) {

    this._eventBus = eventBus;
    this._canvas = canvas;
    this._elementRegistry = elementRegistry;

    this._ids = ids;

    this._overlayDefaults = assign({
      // no show constraints
      show: null,

      // always scale
      scale: true
    }, config && config.defaults);

    /**
     * Mapping overlayId -> overlay
     */
    this._overlays = {};

    /**
     * Mapping elementId -> overlay container
     */
    this._overlayContainers = [];

    // root html element for all overlays
    this._overlayRoot = createRoot(canvas.getContainer());

    this._init();
  }


  Overlays.$inject = [
    'config.overlays',
    'eventBus',
    'canvas',
    'elementRegistry'
  ];


  /**
   * Returns the overlay with the specified id or a list of overlays
   * for an element with a given type.
   *
   * @example
   *
   * // return the single overlay with the given id
   * overlays.get('some-id');
   *
   * // return all overlays for the shape
   * overlays.get({ element: someShape });
   *
   * // return all overlays on shape with type 'badge'
   * overlays.get({ element: someShape, type: 'badge' });
   *
   * // shape can also be specified as id
   * overlays.get({ element: 'element-id', type: 'badge' });
   *
   *
   * @param {Object} search
   * @param {String} [search.id]
   * @param {String|djs.model.Base} [search.element]
   * @param {String} [search.type]
   *
   * @return {Object|Array<Object>} the overlay(s)
   */
  Overlays.prototype.get = function(search) {

    if (isString(search)) {
      search = { id: search };
    }

    if (isString(search.element)) {
      search.element = this._elementRegistry.get(search.element);
    }

    if (search.element) {
      var container = this._getOverlayContainer(search.element, true);

      // return a list of overlays when searching by element (+type)
      if (container) {
        return search.type ? filter(container.overlays, matchPattern({ type: search.type })) : container.overlays.slice();
      } else {
        return [];
      }
    } else
    if (search.type) {
      return filter(this._overlays, matchPattern({ type: search.type }));
    } else {
      // return single element when searching by id
      return search.id ? this._overlays[search.id] : null;
    }
  };

  /**
   * Adds a HTML overlay to an element.
   *
   * @param {String|djs.model.Base}   element   attach overlay to this shape
   * @param {String}                  [type]    optional type to assign to the overlay
   * @param {Object}                  overlay   the overlay configuration
   *
   * @param {String|DOMElement}       overlay.html                 html element to use as an overlay
   * @param {Object}                  [overlay.show]               show configuration
   * @param {Number}                  [overlay.show.minZoom]       minimal zoom level to show the overlay
   * @param {Number}                  [overlay.show.maxZoom]       maximum zoom level to show the overlay
   * @param {Object}                  overlay.position             where to attach the overlay
   * @param {Number}                  [overlay.position.left]      relative to element bbox left attachment
   * @param {Number}                  [overlay.position.top]       relative to element bbox top attachment
   * @param {Number}                  [overlay.position.bottom]    relative to element bbox bottom attachment
   * @param {Number}                  [overlay.position.right]     relative to element bbox right attachment
   * @param {Boolean|Object}          [overlay.scale=true]         false to preserve the same size regardless of
   *                                                               diagram zoom
   * @param {Number}                  [overlay.scale.min]
   * @param {Number}                  [overlay.scale.max]
   *
   * @return {String}                 id that may be used to reference the overlay for update or removal
   */
  Overlays.prototype.add = function(element, type, overlay) {

    if (isObject(type)) {
      overlay = type;
      type = null;
    }

    if (!element.id) {
      element = this._elementRegistry.get(element);
    }

    if (!overlay.position) {
      throw new Error('must specifiy overlay position');
    }

    if (!overlay.html) {
      throw new Error('must specifiy overlay html');
    }

    if (!element) {
      throw new Error('invalid element specified');
    }

    var id = this._ids.next();

    overlay = assign({}, this._overlayDefaults, overlay, {
      id: id,
      type: type,
      element: element,
      html: overlay.html
    });

    this._addOverlay(overlay);

    return id;
  };


  /**
   * Remove an overlay with the given id or all overlays matching the given filter.
   *
   * @see Overlays#get for filter options.
   *
   * @param {String} [id]
   * @param {Object} [filter]
   */
  Overlays.prototype.remove = function(filter) {

    var overlays = this.get(filter) || [];

    if (!isArray(overlays)) {
      overlays = [ overlays ];
    }

    var self = this;

    forEach(overlays, function(overlay) {

      var container = self._getOverlayContainer(overlay.element, true);

      if (overlay) {
        remove(overlay.html);
        remove(overlay.htmlContainer);

        delete overlay.htmlContainer;
        delete overlay.element;

        delete self._overlays[overlay.id];
      }

      if (container) {
        var idx = container.overlays.indexOf(overlay);
        if (idx !== -1) {
          container.overlays.splice(idx, 1);
        }
      }
    });

  };


  Overlays.prototype.show = function() {
    setVisible(this._overlayRoot);
  };


  Overlays.prototype.hide = function() {
    setVisible(this._overlayRoot, false);
  };

  Overlays.prototype.clear = function() {
    this._overlays = {};

    this._overlayContainers = [];

    clear(this._overlayRoot);
  };

  Overlays.prototype._updateOverlayContainer = function(container) {
    var element = container.element,
        html = container.html;

    // update container left,top according to the elements x,y coordinates
    // this ensures we can attach child elements relative to this container

    var x = element.x,
        y = element.y;

    if (element.waypoints) {
      var bbox = getBBox(element);
      x = bbox.x;
      y = bbox.y;
    }

    setPosition(html, x, y);

    attr(container.html, 'data-container-id', element.id);
  };


  Overlays.prototype._updateOverlay = function(overlay) {

    var position = overlay.position,
        htmlContainer = overlay.htmlContainer,
        element = overlay.element;

    // update overlay html relative to shape because
    // it is already positioned on the element

    // update relative
    var left = position.left,
        top = position.top;

    if (position.right !== undefined) {

      var width;

      if (element.waypoints) {
        width = getBBox(element).width;
      } else {
        width = element.width;
      }

      left = position.right * -1 + width;
    }

    if (position.bottom !== undefined) {

      var height;

      if (element.waypoints) {
        height = getBBox(element).height;
      } else {
        height = element.height;
      }

      top = position.bottom * -1 + height;
    }

    setPosition(htmlContainer, left || 0, top || 0);
  };


  Overlays.prototype._createOverlayContainer = function(element) {
    var html = domify('<div class="djs-overlays" style="position: absolute" />');

    this._overlayRoot.appendChild(html);

    var container = {
      html: html,
      element: element,
      overlays: []
    };

    this._updateOverlayContainer(container);

    this._overlayContainers.push(container);

    return container;
  };


  Overlays.prototype._updateRoot = function(viewbox) {
    var scale = viewbox.scale || 1;

    var matrix = 'matrix(' +
    [
      scale,
      0,
      0,
      scale,
      -1 * viewbox.x * scale,
      -1 * viewbox.y * scale
    ].join(',') +
    ')';

    setTransform(this._overlayRoot, matrix);
  };


  Overlays.prototype._getOverlayContainer = function(element, raw) {
    var container = find(this._overlayContainers, function(c) {
      return c.element === element;
    });


    if (!container && !raw) {
      return this._createOverlayContainer(element);
    }

    return container;
  };


  Overlays.prototype._addOverlay = function(overlay) {

    var id = overlay.id,
        element = overlay.element,
        html = overlay.html,
        htmlContainer,
        overlayContainer;

    // unwrap jquery (for those who need it)
    if (html.get && html.constructor.prototype.jquery) {
      html = html.get(0);
    }

    // create proper html elements from
    // overlay HTML strings
    if (isString(html)) {
      html = domify(html);
    }

    overlayContainer = this._getOverlayContainer(element);

    htmlContainer = domify('<div class="djs-overlay" data-overlay-id="' + id + '" style="position: absolute">');

    htmlContainer.appendChild(html);

    if (overlay.type) {
      classes(htmlContainer).add('djs-overlay-' + overlay.type);
    }

    overlay.htmlContainer = htmlContainer;

    overlayContainer.overlays.push(overlay);
    overlayContainer.html.appendChild(htmlContainer);

    this._overlays[id] = overlay;

    this._updateOverlay(overlay);
    this._updateOverlayVisibilty(overlay, this._canvas.viewbox());
  };


  Overlays.prototype._updateOverlayVisibilty = function(overlay, viewbox) {
    var show = overlay.show,
        minZoom = show && show.minZoom,
        maxZoom = show && show.maxZoom,
        htmlContainer = overlay.htmlContainer,
        visible = true;

    if (show) {
      if (
        (isDefined(minZoom) && minZoom > viewbox.scale) ||
        (isDefined(maxZoom) && maxZoom < viewbox.scale)
      ) {
        visible = false;
      }

      setVisible(htmlContainer, visible);
    }

    this._updateOverlayScale(overlay, viewbox);
  };


  Overlays.prototype._updateOverlayScale = function(overlay, viewbox) {
    var shouldScale = overlay.scale,
        minScale,
        maxScale,
        htmlContainer = overlay.htmlContainer;

    var scale, transform = '';

    if (shouldScale !== true) {

      if (shouldScale === false) {
        minScale = 1;
        maxScale = 1;
      } else {
        minScale = shouldScale.min;
        maxScale = shouldScale.max;
      }

      if (isDefined(minScale) && viewbox.scale < minScale) {
        scale = (1 / viewbox.scale || 1) * minScale;
      }

      if (isDefined(maxScale) && viewbox.scale > maxScale) {
        scale = (1 / viewbox.scale || 1) * maxScale;
      }
    }

    if (isDefined(scale)) {
      transform = 'scale(' + scale + ',' + scale + ')';
    }

    setTransform(htmlContainer, transform);
  };


  Overlays.prototype._updateOverlaysVisibilty = function(viewbox) {

    var self = this;

    forEach(this._overlays, function(overlay) {
      self._updateOverlayVisibilty(overlay, viewbox);
    });
  };


  Overlays.prototype._init = function() {

    var eventBus = this._eventBus;

    var self = this;


    // scroll/zoom integration

    function updateViewbox(viewbox) {
      self._updateRoot(viewbox);
      self._updateOverlaysVisibilty(viewbox);

      self.show();
    }

    eventBus.on('canvas.viewbox.changing', function(event) {
      self.hide();
    });

    eventBus.on('canvas.viewbox.changed', function(event) {
      updateViewbox(event.viewbox);
    });


    // remove integration

    eventBus.on([ 'shape.remove', 'connection.remove' ], function(e) {
      var element = e.element;
      var overlays = self.get({ element: element });

      forEach(overlays, function(o) {
        self.remove(o.id);
      });

      var container = self._getOverlayContainer(element);

      if (container) {
        remove(container.html);
        var i = self._overlayContainers.indexOf(container);
        if (i !== -1) {
          self._overlayContainers.splice(i, 1);
        }
      }
    });


    // move integration

    eventBus.on('element.changed', LOW_PRIORITY$2, function(e) {
      var element = e.element;

      var container = self._getOverlayContainer(element, true);

      if (container) {
        forEach(container.overlays, function(overlay) {
          self._updateOverlay(overlay);
        });

        self._updateOverlayContainer(container);
      }
    });


    // marker integration, simply add them on the overlays as classes, too.

    eventBus.on('element.marker.update', function(e) {
      var container = self._getOverlayContainer(e.element, true);
      if (container) {
        classes(container.html)[e.add ? 'add' : 'remove'](e.marker);
      }
    });


    // clear overlays with diagram

    eventBus.on('diagram.clear', this.clear, this);
  };



  // helpers /////////////////////////////

  function createRoot(parentNode) {
    var root = domify(
      '<div class="djs-overlay-container" style="position: absolute; width: 0; height: 0;" />'
    );

    parentNode.insertBefore(root, parentNode.firstChild);

    return root;
  }

  function setPosition(el, x, y) {
    assign(el.style, { left: x + 'px', top: y + 'px' });
  }

  function setVisible(el, visible) {
    el.style.display = visible === false ? 'none' : '';
  }

  function setTransform(el, transform) {

    el.style['transform-origin'] = 'top left';

    [ '', '-ms-', '-webkit-' ].forEach(function(prefix) {
      el.style[prefix + 'transform'] = transform;
    });
  }

  var OverlaysModule = {
    __init__: [ 'overlays' ],
    overlays: [ 'type', Overlays ]
  };

  /**
   * This file must not be changed or exchanged.
   *
   * @see http://bpmn.io/license for more information.
   */


  // inlined ../../resources/logo.svg
  var BPMNIO_LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960"><path fill="#fff" d="M960 60v839c0 33-27 61-60 61H60c-33 0-60-27-60-60V60C0 27 27 0 60 0h839c34 0 61 27 61 60z"/><path fill="#52b415" d="M217 548a205 205 0 0 0-144 58 202 202 0 0 0-4 286 202 202 0 0 0 285 3 200 200 0 0 0 48-219 203 203 0 0 0-185-128zM752 6a206 206 0 0 0-192 285 206 206 0 0 0 269 111 207 207 0 0 0 111-260A204 204 0 0 0 752 6zM62 0A62 62 0 0 0 0 62v398l60 46a259 259 0 0 1 89-36c5-28 10-57 14-85l99 2 12 85a246 246 0 0 1 88 38l70-52 69 71-52 68c17 30 29 58 35 90l86 14-2 100-86 12a240 240 0 0 1-38 89l43 58h413c37 0 60-27 60-61V407a220 220 0 0 1-44 40l21 85-93 39-45-76a258 258 0 0 1-98 1l-45 76-94-39 22-85a298 298 0 0 1-70-69l-86 22-38-94 76-45a258 258 0 0 1-1-98l-76-45 40-94 85 22a271 271 0 0 1 41-47z"/></svg>';

  var BPMNIO_LOGO_URL = 'data:image/svg+xml,' + encodeURIComponent(BPMNIO_LOGO_SVG);

  var BPMNIO_IMG = '<img width="52" height="52" src="' + BPMNIO_LOGO_URL + '" />';

  function css(attrs) {
    return attrs.join(';');
  }

  var LIGHTBOX_STYLES = css([
    'z-index: 1001',
    'position: fixed',
    'top: 0',
    'left: 0',
    'right: 0',
    'bottom: 0'
  ]);

  var BACKDROP_STYLES = css([
    'width: 100%',
    'height: 100%',
    'background: rgba(0,0,0,0.2)'
  ]);

  var NOTICE_STYLES = css([
    'position: absolute',
    'left: 50%',
    'top: 40%',
    'margin: 0 -130px',
    'width: 260px',
    'padding: 10px',
    'background: white',
    'border: solid 1px #AAA',
    'border-radius: 3px',
    'font-family: Helvetica, Arial, sans-serif',
    'font-size: 14px',
    'line-height: 1.2em'
  ]);

  var LIGHTBOX_MARKUP =
    '<div class="bjs-powered-by-lightbox" style="' + LIGHTBOX_STYLES + '">' +
      '<div class="backdrop" style="' + BACKDROP_STYLES + '"></div>' +
      '<div class="notice" style="' + NOTICE_STYLES + '">' +
        '<a href="http://bpmn.io" target="_blank" style="float: left; margin-right: 10px">' +
          BPMNIO_IMG +
        '</a>' +
        'Web-based tooling for BPMN, DMN and CMMN diagrams ' +
        'powered by <a href="http://bpmn.io" target="_blank">bpmn.io</a>.' +
      '</div>' +
    '</div>';


  var lightbox;

  function open() {

    if (!lightbox) {
      lightbox = domify(LIGHTBOX_MARKUP);

      delegateEvents.bind(lightbox, '.backdrop', 'click', function(event) {
        document.body.removeChild(lightbox);
      });
    }

    document.body.appendChild(lightbox);
  }

  /**
   * The code in the <project-logo></project-logo> area
   * must not be changed.
   *
   * @see http://bpmn.io/license for more information.
   */


  function checkValidationError(err) {

    // check if we can help the user by indicating wrong BPMN 2.0 xml
    // (in case he or the exporting tool did not get that right)

    var pattern = /unparsable content <([^>]+)> detected([\s\S]*)$/;
    var match = pattern.exec(err.message);

    if (match) {
      err.message =
        'unparsable content <' + match[1] + '> detected; ' +
        'this may indicate an invalid BPMN 2.0 diagram file' + match[2];
    }

    return err;
  }

  var DEFAULT_OPTIONS = {
    width: '100%',
    height: '100%',
    position: 'relative'
  };


  /**
   * Ensure the passed argument is a proper unit (defaulting to px)
   */
  function ensureUnit(val) {
    return val + (isNumber(val) ? 'px' : '');
  }


  /**
   * Find BPMNDiagram in definitions by ID
   *
   * @param {ModdleElement<Definitions>} definitions
   * @param {String} diagramId
   *
   * @return {ModdleElement<BPMNDiagram>|null}
   */
  function findBPMNDiagram(definitions, diagramId) {
    if (!diagramId) {
      return null;
    }

    return find(definitions.diagrams, function(element) {
      return element.id === diagramId;
    }) || null;
  }

  /**
   * A viewer for BPMN 2.0 diagrams.
   *
   * Have a look at {@link NavigatedViewer} or {@link Modeler} for bundles that include
   * additional features.
   *
   *
   * ## Extending the Viewer
   *
   * In order to extend the viewer pass extension modules to bootstrap via the
   * `additionalModules` option. An extension module is an object that exposes
   * named services.
   *
   * The following example depicts the integration of a simple
   * logging component that integrates with interaction events:
   *
   *
   * ```javascript
   *
   * // logging component
   * function InteractionLogger(eventBus) {
   *   eventBus.on('element.hover', function(event) {
   *     console.log()
   *   })
   * }
   *
   * InteractionLogger.$inject = [ 'eventBus' ]; // minification save
   *
   * // extension module
   * var extensionModule = {
   *   __init__: [ 'interactionLogger' ],
   *   interactionLogger: [ 'type', InteractionLogger ]
   * };
   *
   * // extend the viewer
   * var bpmnViewer = new Viewer({ additionalModules: [ extensionModule ] });
   * bpmnViewer.importXML(...);
   * ```
   *
   * @param {Object} [options] configuration options to pass to the viewer
   * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
   * @param {String|Number} [options.width] the width of the viewer
   * @param {String|Number} [options.height] the height of the viewer
   * @param {Object} [options.moddleExtensions] extension packages to provide
   * @param {Array<didi.Module>} [options.modules] a list of modules to override the default modules
   * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
   */
  function Viewer(options) {

    options = assign({}, DEFAULT_OPTIONS, options);

    this._moddle = this._createModdle(options);

    this._container = this._createContainer(options);

    /* <project-logo> */

    addProjectLogo(this._container);

    /* </project-logo> */

    this._init(this._container, this._moddle, options);
  }

  inherits_browser(Viewer, Diagram);


  /**
   * Parse and render a BPMN 2.0 diagram.
   *
   * Once finished the viewer reports back the result to the
   * provided callback function with (err, warnings).
   *
   * ## Life-Cycle Events
   *
   * During import the viewer will fire life-cycle events:
   *
   *   * import.parse.start (about to read model from xml)
   *   * import.parse.complete (model read; may have worked or not)
   *   * import.render.start (graphical import start)
   *   * import.render.complete (graphical import finished)
   *   * import.done (everything done)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @param {String} xml the BPMN 2.0 xml
   * @param {ModdleElement<BPMNDiagram>|String} [bpmnDiagram] BPMN diagram or id of diagram to render (if not provided, the first one will be rendered)
   * @param {Function} [done] invoked with (err, warnings=[])
   */
  Viewer.prototype.importXML = function(xml, bpmnDiagram, done) {

    if (isFunction(bpmnDiagram)) {
      done = bpmnDiagram;
      bpmnDiagram = null;
    }

    // done is optional
    done = done || function() {};

    var self = this;

    // hook in pre-parse listeners +
    // allow xml manipulation
    xml = this._emit('import.parse.start', { xml: xml }) || xml;

    this._moddle.fromXML(xml, 'bpmn:Definitions', function(err, definitions, context) {

      // hook in post parse listeners +
      // allow definitions manipulation
      definitions = self._emit('import.parse.complete', {
        error: err,
        definitions: definitions,
        context: context
      }) || definitions;

      var parseWarnings = context.warnings;

      if (err) {
        err = checkValidationError(err);

        self._emit('import.done', { error: err, warnings: parseWarnings });

        return done(err, parseWarnings);
      }

      self.importDefinitions(definitions, bpmnDiagram, function(err, importWarnings) {
        var allWarnings = [].concat(parseWarnings, importWarnings || []);

        self._emit('import.done', { error: err, warnings: allWarnings });

        done(err, allWarnings);
      });
    });
  };

  /**
   * Import parsed definitions and render a BPMN 2.0 diagram.
   *
   * Once finished the viewer reports back the result to the
   * provided callback function with (err, warnings).
   *
   * ## Life-Cycle Events
   *
   * During import the viewer will fire life-cycle events:
   *
   *   * import.render.start (graphical import start)
   *   * import.render.complete (graphical import finished)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @param {ModdleElement<Definitions>} definitions parsed BPMN 2.0 definitions
   * @param {ModdleElement<BPMNDiagram>|String} [bpmnDiagram] BPMN diagram or id of diagram to render (if not provided, the first one will be rendered)
   * @param {Function} [done] invoked with (err, warnings=[])
   */
  Viewer.prototype.importDefinitions = function(definitions, bpmnDiagram, done) {

    if (isFunction(bpmnDiagram)) {
      done = bpmnDiagram;
      bpmnDiagram = null;
    }

    // done is optional
    done = done || function() {};

    this._setDefinitions(definitions);

    return this.open(bpmnDiagram, done);
  };

  /**
   * Open diagram of previously imported XML.
   *
   * Once finished the viewer reports back the result to the
   * provided callback function with (err, warnings).
   *
   * ## Life-Cycle Events
   *
   * During switch the viewer will fire life-cycle events:
   *
   *   * import.render.start (graphical import start)
   *   * import.render.complete (graphical import finished)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @param {String|ModdleElement<BPMNDiagram>} [bpmnDiagramOrId] id or the diagram to open
   * @param {Function} [done] invoked with (err, warnings=[])
   */
  Viewer.prototype.open = function(bpmnDiagramOrId, done) {

    if (isFunction(bpmnDiagramOrId)) {
      done = bpmnDiagramOrId;
      bpmnDiagramOrId = null;
    }

    var definitions = this._definitions;
    var bpmnDiagram = bpmnDiagramOrId;

    // done is optional
    done = done || function() {};

    if (!definitions) {
      return done(new Error('no XML imported'));
    }

    if (typeof bpmnDiagramOrId === 'string') {
      bpmnDiagram = findBPMNDiagram(definitions, bpmnDiagramOrId);

      if (!bpmnDiagram) {
        return done(new Error('BPMNDiagram <' + bpmnDiagramOrId + '> not found'));
      }
    }

    // clear existing rendered diagram
    // catch synchronous exceptions during #clear()
    try {
      this.clear();
    } catch (error) {
      return done(error);
    }

    // perform graphical import
    return importBpmnDiagram(this, definitions, bpmnDiagram, done);
  };

  /**
   * Export the currently displayed BPMN 2.0 diagram as
   * a BPMN 2.0 XML document.
   *
   * ## Life-Cycle Events
   *
   * During XML saving the viewer will fire life-cycle events:
   *
   *   * saveXML.start (before serialization)
   *   * saveXML.serialized (after xml generation)
   *   * saveXML.done (everything done)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @param {Object} [options] export options
   * @param {Boolean} [options.format=false] output formated XML
   * @param {Boolean} [options.preamble=true] output preamble
   *
   * @param {Function} done invoked with (err, xml)
   */
  Viewer.prototype.saveXML = function(options, done) {

    if (!done) {
      done = options;
      options = {};
    }

    var self = this;

    var definitions = this._definitions;

    if (!definitions) {
      return done(new Error('no definitions loaded'));
    }

    // allow to fiddle around with definitions
    definitions = this._emit('saveXML.start', {
      definitions: definitions
    }) || definitions;

    this._moddle.toXML(definitions, options, function(err, xml) {

      try {
        xml = self._emit('saveXML.serialized', {
          error: err,
          xml: xml
        }) || xml;

        self._emit('saveXML.done', {
          error: err,
          xml: xml
        });
      } catch (e) {
        console.error('error in saveXML life-cycle listener', e);
      }

      done(err, xml);
    });
  };

  /**
   * Export the currently displayed BPMN 2.0 diagram as
   * an SVG image.
   *
   * ## Life-Cycle Events
   *
   * During SVG saving the viewer will fire life-cycle events:
   *
   *   * saveSVG.start (before serialization)
   *   * saveSVG.done (everything done)
   *
   * You can use these events to hook into the life-cycle.
   *
   * @param {Object} [options]
   * @param {Function} done invoked with (err, svgStr)
   */
  Viewer.prototype.saveSVG = function(options, done) {

    if (!done) {
      done = options;
      options = {};
    }

    this._emit('saveSVG.start');

    var svg, err;

    try {
      var canvas = this.get('canvas');

      var contentNode = canvas.getDefaultLayer(),
          defsNode = query('defs', canvas._svg);

      var contents = innerSVG(contentNode),
          defs = defsNode ? '<defs>' + innerSVG(defsNode) + '</defs>' : '';

      var bbox = contentNode.getBBox();

      svg =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<!-- created with bpmn-js / http://bpmn.io -->\n' +
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
             'width="' + bbox.width + '" height="' + bbox.height + '" ' +
             'viewBox="' + bbox.x + ' ' + bbox.y + ' ' + bbox.width + ' ' + bbox.height + '" version="1.1">' +
          defs + contents +
        '</svg>';
    } catch (e) {
      err = e;
    }

    this._emit('saveSVG.done', {
      error: err,
      svg: svg
    });

    done(err, svg);
  };

  /**
   * Get a named diagram service.
   *
   * @example
   *
   * var elementRegistry = viewer.get('elementRegistry');
   * var startEventShape = elementRegistry.get('StartEvent_1');
   *
   * @param {String} name
   *
   * @return {Object} diagram service instance
   *
   * @method Viewer#get
   */

  /**
   * Invoke a function in the context of this viewer.
   *
   * @example
   *
   * viewer.invoke(function(elementRegistry) {
   *   var startEventShape = elementRegistry.get('StartEvent_1');
   * });
   *
   * @param {Function} fn to be invoked
   *
   * @return {Object} the functions return value
   *
   * @method Viewer#invoke
   */


  Viewer.prototype._setDefinitions = function(definitions) {
    this._definitions = definitions;
  };

  Viewer.prototype.getModules = function() {
    return this._modules;
  };

  /**
   * Remove all drawn elements from the viewer.
   *
   * After calling this method the viewer can still
   * be reused for opening another diagram.
   *
   * @method Viewer#clear
   */
  Viewer.prototype.clear = function() {

    // remove businessObject#di binding
    //
    // this is necessary, as we establish the bindings
    // in the BpmnTreeWalker (and assume none are given
    // on reimport)
    this.get('elementRegistry').forEach(function(element) {
      var bo = element.businessObject;

      if (bo && bo.di) {
        delete bo.di;
      }
    });

    // remove drawn elements
    Diagram.prototype.clear.call(this);
  };

  /**
   * Destroy the viewer instance and remove all its
   * remainders from the document tree.
   */
  Viewer.prototype.destroy = function() {

    // diagram destroy
    Diagram.prototype.destroy.call(this);

    // dom detach
    remove(this._container);
  };

  /**
   * Register an event listener
   *
   * Remove a previously added listener via {@link #off(event, callback)}.
   *
   * @param {String} event
   * @param {Number} [priority]
   * @param {Function} callback
   * @param {Object} [that]
   */
  Viewer.prototype.on = function(event, priority, callback, target) {
    return this.get('eventBus').on(event, priority, callback, target);
  };

  /**
   * De-register an event listener
   *
   * @param {String} event
   * @param {Function} callback
   */
  Viewer.prototype.off = function(event, callback) {
    this.get('eventBus').off(event, callback);
  };

  Viewer.prototype.attachTo = function(parentNode) {

    if (!parentNode) {
      throw new Error('parentNode required');
    }

    // ensure we detach from the
    // previous, old parent
    this.detach();

    // unwrap jQuery if provided
    if (parentNode.get && parentNode.constructor.prototype.jquery) {
      parentNode = parentNode.get(0);
    }

    if (typeof parentNode === 'string') {
      parentNode = query(parentNode);
    }

    parentNode.appendChild(this._container);

    this._emit('attach', {});

    this.get('canvas').resized();
  };

  Viewer.prototype.getDefinitions = function() {
    return this._definitions;
  };

  Viewer.prototype.detach = function() {

    var container = this._container,
        parentNode = container.parentNode;

    if (!parentNode) {
      return;
    }

    this._emit('detach', {});

    parentNode.removeChild(container);
  };

  Viewer.prototype._init = function(container, moddle, options) {

    var baseModules = options.modules || this.getModules(),
        additionalModules = options.additionalModules || [],
        staticModules = [
          {
            bpmnjs: [ 'value', this ],
            moddle: [ 'value', moddle ]
          }
        ];

    var diagramModules = [].concat(staticModules, baseModules, additionalModules);

    var diagramOptions = assign(omit(options, [ 'additionalModules' ]), {
      canvas: assign({}, options.canvas, { container: container }),
      modules: diagramModules
    });

    // invoke diagram constructor
    Diagram.call(this, diagramOptions);

    if (options && options.container) {
      this.attachTo(options.container);
    }
  };

  /**
   * Emit an event on the underlying {@link EventBus}
   *
   * @param  {String} type
   * @param  {Object} event
   *
   * @return {Object} event processing result (if any)
   */
  Viewer.prototype._emit = function(type, event) {
    return this.get('eventBus').fire(type, event);
  };

  Viewer.prototype._createContainer = function(options) {

    var container = domify('<div class="bjs-container"></div>');

    assign(container.style, {
      width: ensureUnit(options.width),
      height: ensureUnit(options.height),
      position: options.position
    });

    return container;
  };

  Viewer.prototype._createModdle = function(options) {
    var moddleOptions = assign({}, this._moddleExtensions, options.moddleExtensions);

    return new BpmnModdle$1(moddleOptions);
  };

  // modules the viewer is composed of
  Viewer.prototype._modules = [
    CoreModule$1,
    TranslateModule,
    SelectionModule,
    OverlaysModule
  ];

  // default moddle extensions the viewer is composed of
  Viewer.prototype._moddleExtensions = {};

  /**
   * Adds the project logo to the diagram container as
   * required by the bpmn.io license.
   *
   * @see http://bpmn.io/license
   *
   * @param {Element} container
   */
  function addProjectLogo(container) {
    var img = BPMNIO_IMG;

    var linkMarkup =
      '<a href="http://bpmn.io" ' +
         'target="_blank" ' +
         'class="bjs-powered-by" ' +
         'title="Powered by bpmn.io" ' +
         'style="position: absolute; bottom: 15px; right: 15px; z-index: 100">' +
        img +
      '</a>';

    var linkElement = domify(linkMarkup);

    container.appendChild(linkElement);

    componentEvent.bind(linkElement, 'click', function(event) {
      open();

      event.preventDefault();
    });
  }

  /* </project-logo> */

  return Viewer;

}));
