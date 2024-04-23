(function(root, factory) {
//  if(typeof exports === 'object' && typeof module === 'object')
//    factory(require("Bokeh"));
//  else if(typeof define === 'function' && define.amd)
//    define(["Bokeh"], factory);
//  else if(typeof exports === 'object')
//    factory(require("Bokeh"));
//  else
    factory(root["Bokeh"]);
})(this, function(Bokeh) {
  var define;
  return (function(modules, aliases, entry) {
    if (Bokeh != null) {
      return Bokeh.register_plugin(modules, aliases, entry);
    } else {
      throw new Error("Cannot find Bokeh. You have to load it prior to loading plugins.");
    }
  })
({
365: /* models/widgets/abstract_button */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty, slice = [].slice;
var p = require(13    /* core/properties */);
var dom_1 = require(4    /* core/dom */);
var build_views_1 = require(3    /* core/build_views */);
var widget_1 = require(405    /* ./widget */);
exports.AbstractButtonView = function (superClass) {
    extend(AbstractButtonView, superClass);
    function AbstractButtonView() {
        return AbstractButtonView.__super__.constructor.apply(this, arguments);
    }
    AbstractButtonView.prototype.initialize = function (options) {
        AbstractButtonView.__super__.initialize.call(this, options);
        this.icon_views = {};
        return this.render();
    };
    AbstractButtonView.prototype.connect_signals = function () {
        AbstractButtonView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    AbstractButtonView.prototype.remove = function () {
        build_views_1.remove_views(this.icon_views);
        return AbstractButtonView.__super__.remove.call(this);
    };
    AbstractButtonView.prototype._render_button = function () {
        var children;
        children = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return dom_1.button.apply(null, [{
                type: 'button',
                disabled: this.model.disabled,
                'class': [
                    'bk-bs-btn',
                    'bk-bs-btn-' + this.model.button_type
                ]
            }].concat(slice.call(children)));
    };
    AbstractButtonView.prototype.render = function () {
        var icon;
        AbstractButtonView.__super__.render.call(this);
        dom_1.empty(this.el);
        this.buttonEl = this._render_button(this.model.label);
        this.buttonEl.addEventListener('click', function (_this) {
            return function (event) {
                return _this._button_click(event);
            };
        }(this));
        this.el.appendChild(this.buttonEl);
        icon = this.model.icon;
        if (icon != null) {
            build_views_1.build_views(this.icon_views, [icon], { parent: this });
            dom_1.prepend(this.buttonEl, this.icon_views[icon.id].el, dom_1.nbsp);
        }
        return this;
    };
    AbstractButtonView.prototype._button_click = function (event) {
        event.preventDefault();
        return this.change_input();
    };
    AbstractButtonView.prototype.change_input = function () {
        var ref;
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    };
    return AbstractButtonView;
}(widget_1.WidgetView);
exports.AbstractButton = function (superClass) {
    extend(AbstractButton, superClass);
    function AbstractButton() {
        return AbstractButton.__super__.constructor.apply(this, arguments);
    }
    AbstractButton.prototype.type = 'AbstractButton';
    AbstractButton.prototype.default_view = exports.AbstractButtonView;
    AbstractButton.define({
        callback: [p.Instance],
        label: [
            p.String,
            'Button'
        ],
        icon: [p.Instance],
        button_type: [
            p.String,
            'default'
        ]
    });
    return AbstractButton;
}(widget_1.Widget);    
},
366: /* models/widgets/abstract_icon */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var widget_1 = require(405    /* ./widget */);
exports.AbstractIcon = function (superClass) {
    extend(AbstractIcon, superClass);
    function AbstractIcon() {
        return AbstractIcon.__super__.constructor.apply(this, arguments);
    }
    AbstractIcon.prototype.type = 'AbstractIcon';
    return AbstractIcon;
}(widget_1.Widget);    
},
367: /* models/widgets/abstract_slider */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var noUiSlider = require(396    /* nouislider */);
var p = require(13    /* core/properties */);
var dom_1 = require(4    /* core/dom */);
var logging_1 = require(12    /* core/logging */);
var callback_1 = require(22    /* core/util/callback */);
var widget_1 = require(405    /* ./widget */);
exports.AbstractSliderView = function (superClass) {
    extend(AbstractSliderView, superClass);
    function AbstractSliderView() {
        return AbstractSliderView.__super__.constructor.apply(this, arguments);
    }
    AbstractSliderView.prototype.initialize = function (options) {
        AbstractSliderView.__super__.initialize.call(this, options);
        return this.render();
    };
    AbstractSliderView.prototype.connect_signals = function () {
        return this.connect(this.model.change, function (_this) {
            return function () {
                return _this.render();
            };
        }(this));
    };
    AbstractSliderView.prototype._calc_to = function () {
    };
    AbstractSliderView.prototype._calc_from = function (values) {
    };
    AbstractSliderView.prototype.render = function () {
        var callback, end, formatter, i, prefix, pretty, ref, start, step, toggleTooltip, tooltips, v, value;
        if (this.sliderEl == null) {
            AbstractSliderView.__super__.render.call(this);
        }
        if (this.model.callback != null) {
            callback = function (_this) {
                return function () {
                    return _this.model.callback.execute(_this.model);
                };
            }(this);
            switch (this.model.callback_policy) {
            case 'continuous':
                this.callback_wrapper = callback;
                break;
            case 'throttle':
                this.callback_wrapper = callback_1.throttle(callback, this.model.callback_throttle);
            }
        }
        prefix = 'bk-noUi-';
        ref = this._calc_to(), start = ref.start, end = ref.end, value = ref.value, step = ref.step;
        if (this.model.tooltips) {
            formatter = {
                to: function (_this) {
                    return function (value) {
                        return _this.model.pretty(value);
                    };
                }(this)
            };
            tooltips = function () {
                var j, ref1, results;
                results = [];
                for (i = j = 0, ref1 = value.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
                    results.push(formatter);
                }
                return results;
            }();
        } else {
            tooltips = false;
        }
        this.el.classList.add('bk-slider');
        if (this.sliderEl == null) {
            this.sliderEl = dom_1.div();
            this.el.appendChild(this.sliderEl);
            noUiSlider.create(this.sliderEl, {
                cssPrefix: prefix,
                range: {
                    min: start,
                    max: end
                },
                start: value,
                step: step,
                behaviour: this.model.behaviour,
                connect: this.model.connected,
                tooltips: tooltips,
                orientation: this.model.orientation,
                direction: this.model.direction
            });
            this.sliderEl.noUiSlider.on('slide', function (_this) {
                return function (_, __, values) {
                    return _this._slide(values);
                };
            }(this));
            this.sliderEl.noUiSlider.on('change', function (_this) {
                return function (_, __, values) {
                    return _this._change(values);
                };
            }(this));
            toggleTooltip = function (_this) {
                return function (i, show) {
                    var handle, tooltip;
                    handle = _this.sliderEl.querySelectorAll('.' + prefix + 'handle')[i];
                    tooltip = handle.querySelector('.' + prefix + 'tooltip');
                    return tooltip.style.display = show ? 'block' : '';
                };
            }(this);
            this.sliderEl.noUiSlider.on('start', function (_this) {
                return function (_, i) {
                    return toggleTooltip(i, true);
                };
            }(this));
            this.sliderEl.noUiSlider.on('end', function (_this) {
                return function (_, i) {
                    return toggleTooltip(i, false);
                };
            }(this));
        } else {
            this.sliderEl.noUiSlider.updateOptions({
                range: {
                    min: start,
                    max: end
                },
                start: value,
                step: step
            });
        }
        if (this.titleEl != null) {
            this.el.removeChild(this.titleEl);
        }
        if (this.valueEl != null) {
            this.el.removeChild(this.valueEl);
        }
        if (this.model.title != null) {
            if (this.model.title.length !== 0) {
                this.titleEl = dom_1.label({}, this.model.title + ':');
                this.el.insertBefore(this.titleEl, this.sliderEl);
            }
            if (this.model.show_value) {
                pretty = function () {
                    var j, len, results;
                    results = [];
                    for (j = 0, len = value.length; j < len; j++) {
                        v = value[j];
                        results.push(this.model.pretty(v));
                    }
                    return results;
                }.call(this).join(' .. ');
                this.valueEl = dom_1.div({ 'class': 'bk-slider-value' }, pretty);
                this.el.insertBefore(this.valueEl, this.sliderEl);
            }
        }
        if (!this.model.disabled) {
            this.sliderEl.querySelector('.' + prefix + 'connect').style.backgroundColor = this.model.bar_color;
        }
        if (this.model.disabled) {
            this.sliderEl.setAttribute('disabled', true);
        } else {
            this.sliderEl.removeAttribute('disabled');
        }
        return this;
    };
    AbstractSliderView.prototype._slide = function (values) {
        var pretty, v, value;
        value = this._calc_from(values);
        pretty = function () {
            var j, len, results;
            results = [];
            for (j = 0, len = values.length; j < len; j++) {
                v = values[j];
                results.push(this.model.pretty(v));
            }
            return results;
        }.call(this).join(' .. ');
        logging_1.logger.debug('[slider slide] value = ' + pretty);
        if (this.valueEl != null) {
            this.valueEl.textContent = pretty;
        }
        this.model.value = value;
        return typeof this.callback_wrapper === 'function' ? this.callback_wrapper() : void 0;
    };
    AbstractSliderView.prototype._change = function (values) {
        var pretty, ref, v, value;
        value = this._calc_from(values);
        pretty = function () {
            var j, len, results;
            results = [];
            for (j = 0, len = values.length; j < len; j++) {
                v = values[j];
                results.push(this.model.pretty(v));
            }
            return results;
        }.call(this).join(' .. ');
        logging_1.logger.debug('[slider change] value = ' + pretty);
        if (this.valueEl != null) {
            this.valueEl.value = pretty;
        }
        this.model.value = value;
        switch (this.model.callback_policy) {
        case 'mouseup':
        case 'throttle':
            return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
        }
    };
    return AbstractSliderView;
}(widget_1.WidgetView);
exports.AbstractSlider = function (superClass) {
    extend(AbstractSlider, superClass);
    function AbstractSlider() {
        return AbstractSlider.__super__.constructor.apply(this, arguments);
    }
    AbstractSlider.prototype.type = 'AbstractSlider';
    AbstractSlider.prototype.default_view = exports.AbstractSliderView;
    AbstractSlider.define({
        title: [
            p.String,
            ''
        ],
        show_value: [
            p.Bool,
            true
        ],
        start: [p.Any],
        end: [p.Any],
        value: [p.Any],
        step: [
            p.Number,
            1
        ],
        format: [p.String],
        orientation: [
            p.Orientation,
            'horizontal'
        ],
        direction: [
            p.Any,
            'ltr'
        ],
        tooltips: [
            p.Boolean,
            true
        ],
        callback: [p.Instance],
        callback_throttle: [
            p.Number,
            200
        ],
        callback_policy: [
            p.String,
            'throttle'
        ],
        bar_color: [
            p.Color,
            '#e6e6e6'
        ]
    });
    AbstractSlider.prototype.behaviour = null;
    AbstractSlider.prototype.connected = false;
    AbstractSlider.prototype._formatter = function (value, format) {
        return '' + value;
    };
    AbstractSlider.prototype.pretty = function (value) {
        return this._formatter(value, this.format);
    };
    return AbstractSlider;
}(widget_1.Widget);    
},
368: /* models/widgets/autocomplete_input */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var text_input_1 = require(393    /* ./text_input */);
var common_1 = require(372    /* ./common */);
var dom_1 = require(4    /* core/dom */);
var p = require(13    /* core/properties */);
exports.AutocompleteInputView = function (superClass) {
    extend(AutocompleteInputView, superClass);
    function AutocompleteInputView() {
        return AutocompleteInputView.__super__.constructor.apply(this, arguments);
    }
    AutocompleteInputView.prototype.connect_signals = function () {
        AutocompleteInputView.__super__.connect_signals.call(this);
        return common_1.clear_menus.connect(function (_this) {
            return function () {
                return _this._clear_menu();
            };
        }(this));
    };
    AutocompleteInputView.prototype.render = function () {
        AutocompleteInputView.__super__.render.call(this);
        this.inputEl.classList.add('bk-autocomplete-input');
        this.inputEl.addEventListener('keydown', function (_this) {
            return function (event) {
                return _this._keydown(event);
            };
        }(this));
        this.inputEl.addEventListener('keyup', function (_this) {
            return function (event) {
                return _this._keyup(event);
            };
        }(this));
        this.menuEl = dom_1.ul({ 'class': 'bk-bs-dropdown-menu' });
        this.menuEl.addEventListener('click', function (_this) {
            return function (event) {
                return _this._item_click(event);
            };
        }(this));
        this.el.appendChild(this.menuEl);
        return this;
    };
    AutocompleteInputView.prototype._render_items = function (completions) {
        var i, itemEl, len, results, text;
        dom_1.empty(this.menuEl);
        results = [];
        for (i = 0, len = completions.length; i < len; i++) {
            text = completions[i];
            itemEl = dom_1.li({}, dom_1.a({ data: { text: text } }, text));
            results.push(this.menuEl.appendChild(itemEl));
        }
        return results;
    };
    AutocompleteInputView.prototype._open_menu = function () {
        return this.el.classList.add('bk-bs-open');
    };
    AutocompleteInputView.prototype._clear_menu = function () {
        return this.el.classList.remove('bk-bs-open');
    };
    AutocompleteInputView.prototype._item_click = function (event) {
        var el, text;
        event.preventDefault();
        if (event.target !== event.currentTarget) {
            el = event.target;
            text = el.dataset.text;
            return this.model.value = text;
        }
    };
    AutocompleteInputView.prototype._keydown = function (event) {
    };
    AutocompleteInputView.prototype._keyup = function (event) {
        var completions, i, len, ref, text, value;
        switch (event.keyCode) {
        case dom_1.Keys.Enter:
            return console.log('enter');
        case dom_1.Keys.Esc:
            return this._clear_menu();
        case dom_1.Keys.Up:
        case dom_1.Keys.Down:
            return console.log('up/down');
        default:
            value = this.inputEl.value;
            if (value.length <= 1) {
                this._clear_menu();
                return;
            }
            completions = [];
            ref = this.model.completions;
            for (i = 0, len = ref.length; i < len; i++) {
                text = ref[i];
                if (text.indexOf(value) !== -1) {
                    completions.push(text);
                }
            }
            if (completions.length === 0) {
                return this._clear_menu();
            } else {
                this._render_items(completions);
                return this._open_menu();
            }
        }
    };
    return AutocompleteInputView;
}(text_input_1.TextInputView);
exports.AutocompleteInput = function (superClass) {
    extend(AutocompleteInput, superClass);
    function AutocompleteInput() {
        return AutocompleteInput.__super__.constructor.apply(this, arguments);
    }
    AutocompleteInput.prototype.type = 'AutocompleteInput';
    AutocompleteInput.prototype.default_view = exports.AutocompleteInputView;
    AutocompleteInput.define({
        completions: [
            p.Array,
            []
        ]
    });
    AutocompleteInput.internal({
        active: [
            p.Boolean,
            true
        ]
    });
    return AutocompleteInput;
}(text_input_1.TextInput);    
},
369: /* models/widgets/button */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var p = require(13    /* core/properties */);
var bokeh_events_1 = require(2    /* core/bokeh_events */);
var abstract_button_1 = require(365    /* ./abstract_button */);
exports.ButtonView = function (superClass) {
    extend(ButtonView, superClass);
    function ButtonView() {
        return ButtonView.__super__.constructor.apply(this, arguments);
    }
    ButtonView.prototype.change_input = function () {
        this.model.trigger_event(new bokeh_events_1.ButtonClick({}));
        this.model.clicks = this.model.clicks + 1;
        return ButtonView.__super__.change_input.call(this);
    };
    return ButtonView;
}(abstract_button_1.AbstractButtonView);
exports.Button = function (superClass) {
    extend(Button, superClass);
    function Button() {
        return Button.__super__.constructor.apply(this, arguments);
    }
    Button.prototype.type = 'Button';
    Button.prototype.default_view = exports.ButtonView;
    Button.define({
        clicks: [
            p.Number,
            0
        ]
    });
    return Button;
}(abstract_button_1.AbstractButton);
bokeh_events_1.register_with_event(bokeh_events_1.ButtonClick, exports.Button);    
},
370: /* models/widgets/checkbox_button_group */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty, indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item)
                return i;
        }
        return -1;
    };
var dom_1 = require(4    /* core/dom */);
var p = require(13    /* core/properties */);
var widget_1 = require(405    /* ./widget */);
exports.CheckboxButtonGroupView = function (superClass) {
    extend(CheckboxButtonGroupView, superClass);
    function CheckboxButtonGroupView() {
        return CheckboxButtonGroupView.__super__.constructor.apply(this, arguments);
    }
    CheckboxButtonGroupView.prototype.initialize = function (options) {
        CheckboxButtonGroupView.__super__.initialize.call(this, options);
        return this.render();
    };
    CheckboxButtonGroupView.prototype.connect_signals = function () {
        CheckboxButtonGroupView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    CheckboxButtonGroupView.prototype.render = function () {
        var active, divEl, i, inputEl, j, labelEl, len, ref, text;
        CheckboxButtonGroupView.__super__.render.call(this);
        dom_1.empty(this.el);
        divEl = dom_1.div({ 'class': 'bk-bs-btn-group' });
        this.el.appendChild(divEl);
        active = this.model.active;
        ref = this.model.labels;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            text = ref[i];
            inputEl = dom_1.input({
                type: 'checkbox',
                value: '' + i,
                checked: indexOf.call(active, i) >= 0
            });
            inputEl.addEventListener('change', function (_this) {
                return function () {
                    return _this.change_input();
                };
            }(this));
            labelEl = dom_1.label({
                'class': [
                    'bk-bs-btn',
                    'bk-bs-btn-' + this.model.button_type
                ]
            }, inputEl, text);
            if (indexOf.call(active, i) >= 0) {
                labelEl.classList.add('bk-bs-active');
            }
            divEl.appendChild(labelEl);
        }
        return this;
    };
    CheckboxButtonGroupView.prototype.change_input = function () {
        var active, checkbox, i, ref;
        active = function () {
            var j, len, ref, results;
            ref = this.el.querySelectorAll('input');
            results = [];
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                checkbox = ref[i];
                if (checkbox.checked) {
                    results.push(i);
                }
            }
            return results;
        }.call(this);
        this.model.active = active;
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    };
    return CheckboxButtonGroupView;
}(widget_1.WidgetView);
exports.CheckboxButtonGroup = function (superClass) {
    extend(CheckboxButtonGroup, superClass);
    function CheckboxButtonGroup() {
        return CheckboxButtonGroup.__super__.constructor.apply(this, arguments);
    }
    CheckboxButtonGroup.prototype.type = 'CheckboxButtonGroup';
    CheckboxButtonGroup.prototype.default_view = exports.CheckboxButtonGroupView;
    CheckboxButtonGroup.define({
        active: [
            p.Array,
            []
        ],
        labels: [
            p.Array,
            []
        ],
        button_type: [
            p.String,
            'default'
        ],
        callback: [p.Instance]
    });
    return CheckboxButtonGroup;
}(widget_1.Widget);    
},
371: /* models/widgets/checkbox_group */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty, indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item)
                return i;
        }
        return -1;
    };
var dom_1 = require(4    /* core/dom */);
var p = require(13    /* core/properties */);
var widget_1 = require(405    /* ./widget */);
exports.CheckboxGroupView = function (superClass) {
    extend(CheckboxGroupView, superClass);
    function CheckboxGroupView() {
        return CheckboxGroupView.__super__.constructor.apply(this, arguments);
    }
    CheckboxGroupView.prototype.initialize = function (options) {
        CheckboxGroupView.__super__.initialize.call(this, options);
        return this.render();
    };
    CheckboxGroupView.prototype.connect_signals = function () {
        CheckboxGroupView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    CheckboxGroupView.prototype.render = function () {
        var active, divEl, i, inputEl, j, labelEl, len, ref, text;
        CheckboxGroupView.__super__.render.call(this);
        dom_1.empty(this.el);
        active = this.model.active;
        ref = this.model.labels;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            text = ref[i];
            inputEl = dom_1.input({
                type: 'checkbox',
                value: '' + i
            });
            inputEl.addEventListener('change', function (_this) {
                return function () {
                    return _this.change_input();
                };
            }(this));
            if (this.model.disabled) {
                inputEl.disabled = true;
            }
            if (indexOf.call(active, i) >= 0) {
                inputEl.checked = true;
            }
            labelEl = dom_1.label({}, inputEl, text);
            if (this.model.inline) {
                labelEl.classList.add('bk-bs-checkbox-inline');
                this.el.appendChild(labelEl);
            } else {
                divEl = dom_1.div({ 'class': 'bk-bs-checkbox' }, labelEl);
                this.el.appendChild(divEl);
            }
        }
        return this;
    };
    CheckboxGroupView.prototype.change_input = function () {
        var active, checkbox, i, ref;
        active = function () {
            var j, len, ref, results;
            ref = this.el.querySelectorAll('input');
            results = [];
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                checkbox = ref[i];
                if (checkbox.checked) {
                    results.push(i);
                }
            }
            return results;
        }.call(this);
        this.model.active = active;
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    };
    return CheckboxGroupView;
}(widget_1.WidgetView);
exports.CheckboxGroup = function (superClass) {
    extend(CheckboxGroup, superClass);
    function CheckboxGroup() {
        return CheckboxGroup.__super__.constructor.apply(this, arguments);
    }
    CheckboxGroup.prototype.type = 'CheckboxGroup';
    CheckboxGroup.prototype.default_view = exports.CheckboxGroupView;
    CheckboxGroup.define({
        active: [
            p.Array,
            []
        ],
        labels: [
            p.Array,
            []
        ],
        inline: [
            p.Bool,
            false
        ],
        callback: [p.Instance]
    });
    return CheckboxGroup;
}(widget_1.Widget);    
},
372: /* models/widgets/common */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var signaling_1 = require(18    /* core/signaling */);
exports.clear_menus = new signaling_1.Signal({}, 'clear_menus');
document.addEventListener('click', function () {
    return exports.clear_menus.emit(undefined);
});    
},
373: /* models/widgets/date_picker */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    }, extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var input_widget_1 = require(379    /* ./input_widget */);
var dom_1 = require(4    /* core/dom */);
var p = require(13    /* core/properties */);
var Pikaday = require(397    /* pikaday */);
Pikaday.prototype.adjustPosition = function () {
    var clientRect, field, height, left, scrollTop, top, viewportHeight, viewportWidth, width;
    if (this._o.container) {
        return;
    }
    this.el.style.position = 'absolute';
    field = this._o.trigger;
    width = this.el.offsetWidth;
    height = this.el.offsetHeight;
    viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    clientRect = field.getBoundingClientRect();
    left = clientRect.left + window.pageXOffset;
    top = clientRect.bottom + window.pageYOffset;
    left -= this.el.parentElement.offsetLeft;
    top -= this.el.parentElement.offsetTop;
    if (this._o.reposition && left + width > viewportWidth || this._o.position.indexOf('right') > -1 && left - width + field.offsetWidth > 0) {
        left = left - width + field.offsetWidth;
    }
    if (this._o.reposition && top + height > viewportHeight + scrollTop || this._o.position.indexOf('top') > -1 && top - height - field.offsetHeight > 0) {
        top = top - height - field.offsetHeight;
    }
    this.el.style.left = left + 'px';
    return this.el.style.top = top + 'px';
};
exports.DatePickerView = function (superClass) {
    extend(DatePickerView, superClass);
    function DatePickerView() {
        this._on_select = bind(this._on_select, this);
        return DatePickerView.__super__.constructor.apply(this, arguments);
    }
    DatePickerView.prototype.className = 'bk-widget-form-group';
    DatePickerView.prototype.render = function () {
        DatePickerView.__super__.render.call(this);
        if (this._picker != null) {
            this._picker.destroy();
        }
        dom_1.empty(this.el);
        this.labelEl = dom_1.label({}, this.model.title);
        this.el.appendChild(this.labelEl);
        this.inputEl = dom_1.input({
            type: 'text',
            'class': 'bk-widget-form-input',
            disabled: this.model.disabled
        });
        this.el.appendChild(this.inputEl);
        this._picker = new Pikaday({
            field: this.inputEl,
            defaultDate: new Date(this.model.value),
            setDefaultDate: true,
            minDate: this.model.min_date != null ? new Date(this.model.min_date) : null,
            maxDate: this.model.max_date != null ? new Date(this.model.max_date) : null,
            onSelect: this._on_select
        });
        this._root_element.appendChild(this._picker.el);
        return this;
    };
    DatePickerView.prototype._on_select = function (date) {
        this.model.value = date.toString();
        return this.change_input();
    };
    return DatePickerView;
}(input_widget_1.InputWidgetView);
exports.DatePicker = function (superClass) {
    extend(DatePicker, superClass);
    function DatePicker() {
        return DatePicker.__super__.constructor.apply(this, arguments);
    }
    DatePicker.prototype.type = 'DatePicker';
    DatePicker.prototype.default_view = exports.DatePickerView;
    DatePicker.define({
        value: [
            p.Any,
            Date.now()
        ],
        min_date: [p.Any],
        max_date: [p.Any]
    });
    return DatePicker;
}(input_widget_1.InputWidget);    
},
374: /* models/widgets/date_range_slider */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var tz = require(356    /* timezone */);
var abstract_slider_1 = require(367    /* ./abstract_slider */);
exports.DateRangeSliderView = function (superClass) {
    extend(DateRangeSliderView, superClass);
    function DateRangeSliderView() {
        return DateRangeSliderView.__super__.constructor.apply(this, arguments);
    }
    DateRangeSliderView.prototype._calc_to = function () {
        return {
            start: this.model.start,
            end: this.model.end,
            value: this.model.value,
            step: this.model.step
        };
    };
    DateRangeSliderView.prototype._calc_from = function (values) {
        return values;
    };
    return DateRangeSliderView;
}(abstract_slider_1.AbstractSliderView);
exports.DateRangeSlider = function (superClass) {
    extend(DateRangeSlider, superClass);
    function DateRangeSlider() {
        return DateRangeSlider.__super__.constructor.apply(this, arguments);
    }
    DateRangeSlider.prototype.type = 'DateRangeSlider';
    DateRangeSlider.prototype.default_view = exports.DateRangeSliderView;
    DateRangeSlider.prototype.behaviour = 'drag';
    DateRangeSlider.prototype.connected = [
        false,
        true,
        false
    ];
    DateRangeSlider.prototype._formatter = tz;
    DateRangeSlider.override({ format: '%d %b %G' });
    return DateRangeSlider;
}(abstract_slider_1.AbstractSlider);    
},
375: /* models/widgets/date_slider */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var tz = require(356    /* timezone */);
var abstract_slider_1 = require(367    /* ./abstract_slider */);
exports.DateSliderView = function (superClass) {
    extend(DateSliderView, superClass);
    function DateSliderView() {
        return DateSliderView.__super__.constructor.apply(this, arguments);
    }
    DateSliderView.prototype._calc_to = function () {
        return {
            start: this.model.start,
            end: this.model.end,
            value: [this.model.value],
            step: this.model.step
        };
    };
    DateSliderView.prototype._calc_from = function (arg) {
        var value;
        value = arg[0];
        return value;
    };
    return DateSliderView;
}(abstract_slider_1.AbstractSliderView);
exports.DateSlider = function (superClass) {
    extend(DateSlider, superClass);
    function DateSlider() {
        return DateSlider.__super__.constructor.apply(this, arguments);
    }
    DateSlider.prototype.type = 'DateSlider';
    DateSlider.prototype.default_view = exports.DateSliderView;
    DateSlider.prototype.behaviour = 'tap';
    DateSlider.prototype.connected = [
        true,
        false
    ];
    DateSlider.prototype._formatter = tz;
    DateSlider.override({ format: '%d %b %G' });
    return DateSlider;
}(abstract_slider_1.AbstractSlider);    
},
376: /* models/widgets/div */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var markup_1 = require(381    /* ./markup */);
var dom_1 = require(4    /* core/dom */);
var p = require(13    /* core/properties */);
exports.DivView = function (superClass) {
    extend(DivView, superClass);
    function DivView() {
        return DivView.__super__.constructor.apply(this, arguments);
    }
    DivView.prototype.render = function () {
        var content;
        DivView.__super__.render.call(this);
        content = dom_1.div();
        if (this.model.render_as_text) {
            content.textContent = this.model.text;
        } else {
            content.innerHTML = this.model.text;
        }
        this.markupEl.appendChild(content);
        return this;
    };
    return DivView;
}(markup_1.MarkupView);
exports.Div = function (superClass) {
    extend(Div, superClass);
    function Div() {
        return Div.__super__.constructor.apply(this, arguments);
    }
    Div.prototype.type = 'Div';
    Div.prototype.default_view = exports.DivView;
    Div.define({
        render_as_text: [
            p.Bool,
            false
        ]
    });
    return Div;
}(markup_1.Markup);    
},
377: /* models/widgets/dropdown */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var dom_1 = require(4    /* core/dom */);
var p = require(13    /* core/properties */);
var abstract_button_1 = require(365    /* ./abstract_button */);
var common_1 = require(372    /* ./common */);
exports.DropdownView = function (superClass) {
    extend(DropdownView, superClass);
    function DropdownView() {
        return DropdownView.__super__.constructor.apply(this, arguments);
    }
    DropdownView.prototype.connect_signals = function () {
        DropdownView.__super__.connect_signals.call(this);
        return common_1.clear_menus.connect(function (_this) {
            return function () {
                return _this._clear_menu();
            };
        }(this));
    };
    DropdownView.prototype.render = function () {
        var caretEl, i, item, itemEl, items, label, len, link, menuEl, ref, value;
        DropdownView.__super__.render.call(this);
        if (!this.model.is_split_button) {
            this.el.classList.add('bk-bs-dropdown');
            this.buttonEl.classList.add('bk-bs-dropdown-toggle');
            this.buttonEl.appendChild(dom_1.span({ 'class': 'bk-bs-caret' }));
        } else {
            this.el.classList.add('bk-bs-btn-group');
            caretEl = this._render_button(dom_1.span({ 'class': 'bk-bs-caret' }));
            caretEl.classList.add('bk-bs-dropdown-toggle');
            caretEl.addEventListener('click', function (_this) {
                return function (event) {
                    return _this._caret_click(event);
                };
            }(this));
            this.el.appendChild(caretEl);
        }
        if (this.model.active) {
            this.el.classList.add('bk-bs-open');
        }
        items = [];
        ref = this.model.menu;
        for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            if (item != null) {
                label = item[0], value = item[1];
                link = dom_1.a({}, label);
                link.dataset.value = value;
                link.addEventListener('click', function (_this) {
                    return function (event) {
                        return _this._item_click(event);
                    };
                }(this));
                itemEl = dom_1.li({}, link);
            } else {
                itemEl = dom_1.li({ 'class': 'bk-bs-divider' });
            }
            items.push(itemEl);
        }
        menuEl = dom_1.ul({ 'class': 'bk-bs-dropdown-menu' }, items);
        this.el.appendChild(menuEl);
        return this;
    };
    DropdownView.prototype._clear_menu = function () {
        return this.model.active = false;
    };
    DropdownView.prototype._toggle_menu = function () {
        var active;
        active = this.model.active;
        common_1.clear_menus.emit();
        if (!active) {
            return this.model.active = true;
        }
    };
    DropdownView.prototype._button_click = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.model.is_split_button) {
            return this._toggle_menu();
        } else {
            this._clear_menu();
            return this.set_value(this.model.default_value);
        }
    };
    DropdownView.prototype._caret_click = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return this._toggle_menu();
    };
    DropdownView.prototype._item_click = function (event) {
        event.preventDefault();
        this._clear_menu();
        return this.set_value(event.currentTarget.dataset.value);
    };
    DropdownView.prototype.set_value = function (value) {
        this.buttonEl.value = this.model.value = value;
        return this.change_input();
    };
    return DropdownView;
}(abstract_button_1.AbstractButtonView);
exports.Dropdown = function (superClass) {
    extend(Dropdown, superClass);
    function Dropdown() {
        return Dropdown.__super__.constructor.apply(this, arguments);
    }
    Dropdown.prototype.type = 'Dropdown';
    Dropdown.prototype.default_view = exports.DropdownView;
    Dropdown.define({
        value: [p.String],
        default_value: [p.String],
        menu: [
            p.Array,
            []
        ]
    });
    Dropdown.override({ label: 'Dropdown' });
    Dropdown.internal({
        active: [
            p.Boolean,
            false
        ]
    });
    Dropdown.getters({
        is_split_button: function () {
            return this.default_value != null;
        }
    });
    return Dropdown;
}(abstract_button_1.AbstractButton);    
},
378: /* models/widgets/index */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var abstract_button_1 = require(365    /* ./abstract_button */);
exports.AbstractButton = abstract_button_1.AbstractButton;
var abstract_icon_1 = require(366    /* ./abstract_icon */);
exports.AbstractIcon = abstract_icon_1.AbstractIcon;
var autocomplete_input_1 = require(368    /* ./autocomplete_input */);
exports.AutocompleteInput = autocomplete_input_1.AutocompleteInput;
var button_1 = require(369    /* ./button */);
exports.Button = button_1.Button;
var checkbox_button_group_1 = require(370    /* ./checkbox_button_group */);
exports.CheckboxButtonGroup = checkbox_button_group_1.CheckboxButtonGroup;
var checkbox_group_1 = require(371    /* ./checkbox_group */);
exports.CheckboxGroup = checkbox_group_1.CheckboxGroup;
var date_picker_1 = require(373    /* ./date_picker */);
exports.DatePicker = date_picker_1.DatePicker;
var date_range_slider_1 = require(374    /* ./date_range_slider */);
exports.DateRangeSlider = date_range_slider_1.DateRangeSlider;
var date_slider_1 = require(375    /* ./date_slider */);
exports.DateSlider = date_slider_1.DateSlider;
var div_1 = require(376    /* ./div */);
exports.Div = div_1.Div;
var dropdown_1 = require(377    /* ./dropdown */);
exports.Dropdown = dropdown_1.Dropdown;
var input_widget_1 = require(379    /* ./input_widget */);
exports.InputWidget = input_widget_1.InputWidget;
var markup_1 = require(381    /* ./markup */);
exports.Markup = markup_1.Markup;
var multiselect_1 = require(382    /* ./multiselect */);
exports.MultiSelect = multiselect_1.MultiSelect;
var panel_1 = require(383    /* ./panel */);
exports.Panel = panel_1.Panel;
var paragraph_1 = require(384    /* ./paragraph */);
exports.Paragraph = paragraph_1.Paragraph;
var password_input_1 = require(385    /* ./password_input */);
exports.PasswordInput = password_input_1.PasswordInput;
var pretext_1 = require(386    /* ./pretext */);
exports.PreText = pretext_1.PreText;
var radio_button_group_1 = require(387    /* ./radio_button_group */);
exports.RadioButtonGroup = radio_button_group_1.RadioButtonGroup;
var radio_group_1 = require(388    /* ./radio_group */);
exports.RadioGroup = radio_group_1.RadioGroup;
var range_slider_1 = require(389    /* ./range_slider */);
exports.RangeSlider = range_slider_1.RangeSlider;
var selectbox_1 = require(390    /* ./selectbox */);
exports.Select = selectbox_1.Select;
var slider_1 = require(391    /* ./slider */);
exports.Slider = slider_1.Slider;
var tabs_1 = require(392    /* ./tabs */);
exports.Tabs = tabs_1.Tabs;
var text_input_1 = require(393    /* ./text_input */);
exports.TextInput = text_input_1.TextInput;
var toggle_1 = require(394    /* ./toggle */);
exports.Toggle = toggle_1.Toggle;
var widget_1 = require(405    /* ./widget */);
exports.Widget = widget_1.Widget;    
},
379: /* models/widgets/input_widget */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var widget_1 = require(405    /* ./widget */);
var p = require(13    /* core/properties */);
exports.InputWidgetView = function (superClass) {
    extend(InputWidgetView, superClass);
    function InputWidgetView() {
        return InputWidgetView.__super__.constructor.apply(this, arguments);
    }
    InputWidgetView.prototype.change_input = function () {
        var ref;
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    };
    return InputWidgetView;
}(widget_1.WidgetView);
exports.InputWidget = function (superClass) {
    extend(InputWidget, superClass);
    function InputWidget() {
        return InputWidget.__super__.constructor.apply(this, arguments);
    }
    InputWidget.prototype.type = 'InputWidget';
    InputWidget.prototype.default_view = exports.InputWidgetView;
    InputWidget.define({
        callback: [p.Instance],
        title: [
            p.String,
            ''
        ]
    });
    return InputWidget;
}(widget_1.Widget);    
},
380: /* models/widgets/main */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Widgets = require(378    /* ./index */);
exports.Widgets = Widgets;
var base_1 = require(0    /* ../../base */);
base_1.register_models(Widgets);    
},
381: /* models/widgets/markup */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend1 = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var p = require(13    /* core/properties */);
var dom_1 = require(4    /* core/dom */);
var object_1 = require(28    /* core/util/object */);
var widget_1 = require(405    /* ./widget */);
exports.MarkupView = function (superClass) {
    extend1(MarkupView, superClass);
    function MarkupView() {
        return MarkupView.__super__.constructor.apply(this, arguments);
    }
    MarkupView.prototype.initialize = function (options) {
        MarkupView.__super__.initialize.call(this, options);
        return this.render();
    };
    MarkupView.prototype.connect_signals = function () {
        MarkupView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    MarkupView.prototype.render = function () {
        var style;
        MarkupView.__super__.render.call(this);
        dom_1.empty(this.el);
        style = object_1.extend({
            width: this.model.width + 'px',
            height: this.model.height + 'px'
        }, this.model.style);
        this.markupEl = dom_1.div({ style: style });
        return this.el.appendChild(this.markupEl);
    };
    return MarkupView;
}(widget_1.WidgetView);
exports.Markup = function (superClass) {
    extend1(Markup, superClass);
    function Markup() {
        return Markup.__super__.constructor.apply(this, arguments);
    }
    Markup.prototype.type = 'Markup';
    Markup.prototype.initialize = function (options) {
        return Markup.__super__.initialize.call(this, options);
    };
    Markup.define({
        text: [
            p.String,
            ''
        ],
        style: [
            p.Any,
            {}
        ]
    });
    return Markup;
}(widget_1.Widget);    
},
382: /* models/widgets/multiselect */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    }, extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty, indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item)
                return i;
        }
        return -1;
    };
var dom_1 = require(4    /* core/dom */);
var types_1 = require(40    /* core/util/types */);
var p = require(13    /* core/properties */);
var input_widget_1 = require(379    /* ./input_widget */);
exports.MultiSelectView = function (superClass) {
    extend(MultiSelectView, superClass);
    function MultiSelectView() {
        this.render_selection = bind(this.render_selection, this);
        return MultiSelectView.__super__.constructor.apply(this, arguments);
    }
    MultiSelectView.prototype.initialize = function (options) {
        MultiSelectView.__super__.initialize.call(this, options);
        return this.render();
    };
    MultiSelectView.prototype.connect_signals = function () {
        MultiSelectView.__super__.connect_signals.call(this);
        this.connect(this.model.properties.value.change, function () {
            return this.render_selection();
        });
        this.connect(this.model.properties.options.change, function () {
            return this.render();
        });
        this.connect(this.model.properties.name.change, function () {
            return this.render();
        });
        this.connect(this.model.properties.title.change, function () {
            return this.render();
        });
        return this.connect(this.model.properties.size.change, function () {
            return this.render();
        });
    };
    MultiSelectView.prototype.render = function () {
        var labelEl, options;
        MultiSelectView.__super__.render.call(this);
        dom_1.empty(this.el);
        labelEl = dom_1.label({ 'for': this.model.id }, this.model.title);
        this.el.appendChild(labelEl);
        options = this.model.options.map(function (_this) {
            return function (opt) {
                var _label, selected, value;
                if (types_1.isString(opt)) {
                    value = _label = opt;
                } else {
                    value = opt[0], _label = opt[1];
                }
                selected = indexOf.call(_this.model.value, value) >= 0;
                return dom_1.option({
                    selected: selected,
                    value: value
                }, _label);
            };
        }(this));
        this.selectEl = dom_1.select({
            multiple: true,
            'class': 'bk-widget-form-input',
            id: this.model.id,
            name: this.model.name,
            size: this.model.size
        }, options);
        this.selectEl.addEventListener('change', function (_this) {
            return function () {
                return _this.change_input();
            };
        }(this));
        this.el.appendChild(this.selectEl);
        return this;
    };
    MultiSelectView.prototype.render_selection = function () {
        var el, i, j, len, len1, ref, ref1, values, x;
        values = {};
        ref = this.model.value;
        for (i = 0, len = ref.length; i < len; i++) {
            x = ref[i];
            values[x] = true;
        }
        ref1 = this.el.querySelectorAll('option');
        for (j = 0, len1 = ref1.length; j < len1; j++) {
            el = ref1[j];
            if (values[el.value]) {
                el.selected = 'selected';
            }
        }
        return this.selectEl.size = this.model.size;
    };
    MultiSelectView.prototype.change_input = function () {
        var el, i, is_focused, len, ref, values;
        is_focused = this.el.querySelector('select:focus') !== null;
        values = [];
        ref = this.el.querySelectorAll('option');
        for (i = 0, len = ref.length; i < len; i++) {
            el = ref[i];
            if (el.selected) {
                values.push(el.value);
            }
        }
        this.model.value = values;
        MultiSelectView.__super__.change_input.call(this);
        if (is_focused) {
            return this.selectEl.focus();
        }
    };
    return MultiSelectView;
}(input_widget_1.InputWidgetView);
exports.MultiSelect = function (superClass) {
    extend(MultiSelect, superClass);
    function MultiSelect() {
        return MultiSelect.__super__.constructor.apply(this, arguments);
    }
    MultiSelect.prototype.type = 'MultiSelect';
    MultiSelect.prototype.default_view = exports.MultiSelectView;
    MultiSelect.define({
        value: [
            p.Array,
            []
        ],
        options: [
            p.Array,
            []
        ],
        size: [
            p.Number,
            4
        ]
    });
    return MultiSelect;
}(input_widget_1.InputWidget);    
},
383: /* models/widgets/panel */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var widget_1 = require(405    /* ./widget */);
var p = require(13    /* core/properties */);
var dom_1 = require(4    /* core/dom */);
exports.PanelView = function (superClass) {
    extend(PanelView, superClass);
    function PanelView() {
        return PanelView.__super__.constructor.apply(this, arguments);
    }
    PanelView.prototype.render = function () {
        PanelView.__super__.render.call(this);
        dom_1.empty(this.el);
        return this;
    };
    return PanelView;
}(widget_1.WidgetView);
exports.Panel = function (superClass) {
    extend(Panel, superClass);
    function Panel() {
        return Panel.__super__.constructor.apply(this, arguments);
    }
    Panel.prototype.type = 'Panel';
    Panel.prototype.default_view = exports.PanelView;
    Panel.define({
        title: [
            p.String,
            ''
        ],
        child: [p.Instance],
        closable: [
            p.Bool,
            false
        ]
    });
    return Panel;
}(widget_1.Widget);    
},
384: /* models/widgets/paragraph */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var markup_1 = require(381    /* ./markup */);
var dom_1 = require(4    /* core/dom */);
exports.ParagraphView = function (superClass) {
    extend(ParagraphView, superClass);
    function ParagraphView() {
        return ParagraphView.__super__.constructor.apply(this, arguments);
    }
    ParagraphView.prototype.render = function () {
        var content;
        ParagraphView.__super__.render.call(this);
        content = dom_1.p({ style: { margin: 0 } }, this.model.text);
        return this.markupEl.appendChild(content);
    };
    return ParagraphView;
}(markup_1.MarkupView);
exports.Paragraph = function (superClass) {
    extend(Paragraph, superClass);
    function Paragraph() {
        return Paragraph.__super__.constructor.apply(this, arguments);
    }
    Paragraph.prototype.type = 'Paragraph';
    Paragraph.prototype.default_view = exports.ParagraphView;
    return Paragraph;
}(markup_1.Markup);    
},
385: /* models/widgets/password_input */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var text_input_1 = require(393    /* ./text_input */);
exports.PasswordInputView = function (superClass) {
    extend(PasswordInputView, superClass);
    function PasswordInputView() {
        return PasswordInputView.__super__.constructor.apply(this, arguments);
    }
    PasswordInputView.prototype.render = function () {
        PasswordInputView.__super__.render.call(this);
        return this.inputEl.type = 'password';
    };
    return PasswordInputView;
}(text_input_1.TextInputView);
exports.PasswordInput = function (superClass) {
    extend(PasswordInput, superClass);
    function PasswordInput() {
        return PasswordInput.__super__.constructor.apply(this, arguments);
    }
    PasswordInput.prototype.type = 'PasswordInput';
    PasswordInput.prototype.default_view = exports.PasswordInputView;
    return PasswordInput;
}(text_input_1.TextInput);    
},
386: /* models/widgets/pretext */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var markup_1 = require(381    /* ./markup */);
var dom_1 = require(4    /* core/dom */);
exports.PreTextView = function (superClass) {
    extend(PreTextView, superClass);
    function PreTextView() {
        return PreTextView.__super__.constructor.apply(this, arguments);
    }
    PreTextView.prototype.render = function () {
        var content;
        PreTextView.__super__.render.call(this);
        content = dom_1.pre({ style: { overflow: 'auto' } }, this.model.text);
        return this.markupEl.appendChild(content);
    };
    return PreTextView;
}(markup_1.MarkupView);
exports.PreText = function (superClass) {
    extend(PreText, superClass);
    function PreText() {
        return PreText.__super__.constructor.apply(this, arguments);
    }
    PreText.prototype.type = 'PreText';
    PreText.prototype.default_view = exports.PreTextView;
    return PreText;
}(markup_1.Markup);    
},
387: /* models/widgets/radio_button_group */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var dom_1 = require(4    /* core/dom */);
var string_1 = require(35    /* core/util/string */);
var p = require(13    /* core/properties */);
var widget_1 = require(405    /* ./widget */);
exports.RadioButtonGroupView = function (superClass) {
    extend(RadioButtonGroupView, superClass);
    function RadioButtonGroupView() {
        return RadioButtonGroupView.__super__.constructor.apply(this, arguments);
    }
    RadioButtonGroupView.prototype.initialize = function (options) {
        RadioButtonGroupView.__super__.initialize.call(this, options);
        return this.render();
    };
    RadioButtonGroupView.prototype.connect_signals = function () {
        RadioButtonGroupView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    RadioButtonGroupView.prototype.render = function () {
        var active, divEl, i, inputEl, j, labelEl, len, name, ref, text;
        RadioButtonGroupView.__super__.render.call(this);
        dom_1.empty(this.el);
        divEl = dom_1.div({ 'class': 'bk-bs-btn-group' });
        this.el.appendChild(divEl);
        name = string_1.uniqueId();
        active = this.model.active;
        ref = this.model.labels;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            text = ref[i];
            inputEl = dom_1.input({
                type: 'radio',
                name: name,
                value: '' + i,
                checked: i === active
            });
            inputEl.addEventListener('change', function (_this) {
                return function () {
                    return _this.change_input();
                };
            }(this));
            labelEl = dom_1.label({
                'class': [
                    'bk-bs-btn',
                    'bk-bs-btn-' + this.model.button_type
                ]
            }, inputEl, text);
            if (i === active) {
                labelEl.classList.add('bk-bs-active');
            }
            divEl.appendChild(labelEl);
        }
        return this;
    };
    RadioButtonGroupView.prototype.change_input = function () {
        var active, i, radio, ref;
        active = function () {
            var j, len, ref, results;
            ref = this.el.querySelectorAll('input');
            results = [];
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                radio = ref[i];
                if (radio.checked) {
                    results.push(i);
                }
            }
            return results;
        }.call(this);
        this.model.active = active[0];
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    };
    return RadioButtonGroupView;
}(widget_1.WidgetView);
exports.RadioButtonGroup = function (superClass) {
    extend(RadioButtonGroup, superClass);
    function RadioButtonGroup() {
        return RadioButtonGroup.__super__.constructor.apply(this, arguments);
    }
    RadioButtonGroup.prototype.type = 'RadioButtonGroup';
    RadioButtonGroup.prototype.default_view = exports.RadioButtonGroupView;
    RadioButtonGroup.define({
        active: [
            p.Any,
            null
        ],
        labels: [
            p.Array,
            []
        ],
        button_type: [
            p.String,
            'default'
        ],
        callback: [p.Instance]
    });
    return RadioButtonGroup;
}(widget_1.Widget);    
},
388: /* models/widgets/radio_group */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var dom_1 = require(4    /* core/dom */);
var string_1 = require(35    /* core/util/string */);
var p = require(13    /* core/properties */);
var widget_1 = require(405    /* ./widget */);
exports.RadioGroupView = function (superClass) {
    extend(RadioGroupView, superClass);
    function RadioGroupView() {
        return RadioGroupView.__super__.constructor.apply(this, arguments);
    }
    RadioGroupView.prototype.initialize = function (options) {
        RadioGroupView.__super__.initialize.call(this, options);
        return this.render();
    };
    RadioGroupView.prototype.connect_signals = function () {
        RadioGroupView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    RadioGroupView.prototype.render = function () {
        var active, divEl, i, inputEl, j, labelEl, len, name, ref, text;
        RadioGroupView.__super__.render.call(this);
        dom_1.empty(this.el);
        name = string_1.uniqueId();
        active = this.model.active;
        ref = this.model.labels;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
            text = ref[i];
            inputEl = dom_1.input({
                type: 'radio',
                name: name,
                value: '' + i
            });
            inputEl.addEventListener('change', function (_this) {
                return function () {
                    return _this.change_input();
                };
            }(this));
            if (this.model.disabled) {
                inputEl.disabled = true;
            }
            if (i === active) {
                inputEl.checked = true;
            }
            labelEl = dom_1.label({}, inputEl, text);
            if (this.model.inline) {
                labelEl.classList.add('bk-bs-radio-inline');
                this.el.appendChild(labelEl);
            } else {
                divEl = dom_1.div({ 'class': 'bk-bs-radio' }, labelEl);
                this.el.appendChild(divEl);
            }
        }
        return this;
    };
    RadioGroupView.prototype.change_input = function () {
        var active, i, radio, ref;
        active = function () {
            var j, len, ref, results;
            ref = this.el.querySelectorAll('input');
            results = [];
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
                radio = ref[i];
                if (radio.checked) {
                    results.push(i);
                }
            }
            return results;
        }.call(this);
        this.model.active = active[0];
        return (ref = this.model.callback) != null ? ref.execute(this.model) : void 0;
    };
    return RadioGroupView;
}(widget_1.WidgetView);
exports.RadioGroup = function (superClass) {
    extend(RadioGroup, superClass);
    function RadioGroup() {
        return RadioGroup.__super__.constructor.apply(this, arguments);
    }
    RadioGroup.prototype.type = 'RadioGroup';
    RadioGroup.prototype.default_view = exports.RadioGroupView;
    RadioGroup.define({
        active: [
            p.Any,
            null
        ],
        labels: [
            p.Array,
            []
        ],
        inline: [
            p.Bool,
            false
        ],
        callback: [p.Instance]
    });
    return RadioGroup;
}(widget_1.Widget);    
},
389: /* models/widgets/range_slider */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var numbro_1 = require(325    /* numbro */);
var abstract_slider_1 = require(367    /* ./abstract_slider */);
exports.RangeSliderView = function (superClass) {
    extend(RangeSliderView, superClass);
    function RangeSliderView() {
        return RangeSliderView.__super__.constructor.apply(this, arguments);
    }
    RangeSliderView.prototype._calc_to = function () {
        return {
            start: this.model.start,
            end: this.model.end,
            value: this.model.value,
            step: this.model.step
        };
    };
    RangeSliderView.prototype._calc_from = function (values) {
        return values;
    };
    return RangeSliderView;
}(abstract_slider_1.AbstractSliderView);
exports.RangeSlider = function (superClass) {
    extend(RangeSlider, superClass);
    function RangeSlider() {
        return RangeSlider.__super__.constructor.apply(this, arguments);
    }
    RangeSlider.prototype.type = 'RangeSlider';
    RangeSlider.prototype.default_view = exports.RangeSliderView;
    RangeSlider.prototype.behaviour = 'drag';
    RangeSlider.prototype.connected = [
        false,
        true,
        false
    ];
    RangeSlider.prototype._formatter = numbro_1.format;
    RangeSlider.override({ format: '0[.]00' });
    return RangeSlider;
}(abstract_slider_1.AbstractSlider);    
},
390: /* models/widgets/selectbox */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var dom_1 = require(4    /* core/dom */);
var types_1 = require(40    /* core/util/types */);
var logging_1 = require(12    /* core/logging */);
var p = require(13    /* core/properties */);
var input_widget_1 = require(379    /* ./input_widget */);
exports.SelectView = function (superClass) {
    extend(SelectView, superClass);
    function SelectView() {
        return SelectView.__super__.constructor.apply(this, arguments);
    }
    SelectView.prototype.initialize = function (options) {
        SelectView.__super__.initialize.call(this, options);
        return this.render();
    };
    SelectView.prototype.connect_signals = function () {
        SelectView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    SelectView.prototype.render = function () {
        var labelEl, options;
        SelectView.__super__.render.call(this);
        dom_1.empty(this.el);
        labelEl = dom_1.label({ 'for': this.model.id }, this.model.title);
        this.el.appendChild(labelEl);
        options = this.model.options.map(function (_this) {
            return function (opt) {
                var _label, selected, value;
                if (types_1.isString(opt)) {
                    value = _label = opt;
                } else {
                    value = opt[0], _label = opt[1];
                }
                selected = _this.model.value === value;
                return dom_1.option({
                    selected: selected,
                    value: value
                }, _label);
            };
        }(this));
        this.selectEl = dom_1.select({
            'class': 'bk-widget-form-input',
            id: this.model.id,
            name: this.model.name
        }, options);
        this.selectEl.addEventListener('change', function (_this) {
            return function () {
                return _this.change_input();
            };
        }(this));
        this.el.appendChild(this.selectEl);
        return this;
    };
    SelectView.prototype.change_input = function () {
        var value;
        value = this.selectEl.value;
        logging_1.logger.debug('selectbox: value = ' + value);
        this.model.value = value;
        return SelectView.__super__.change_input.call(this);
    };
    return SelectView;
}(input_widget_1.InputWidgetView);
exports.Select = function (superClass) {
    extend(Select, superClass);
    function Select() {
        return Select.__super__.constructor.apply(this, arguments);
    }
    Select.prototype.type = 'Select';
    Select.prototype.default_view = exports.SelectView;
    Select.define({
        value: [
            p.String,
            ''
        ],
        options: [
            p.Any,
            []
        ]
    });
    return Select;
}(input_widget_1.InputWidget);    
},
391: /* models/widgets/slider */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var numbro_1 = require(325    /* numbro */);
var abstract_slider_1 = require(367    /* ./abstract_slider */);
exports.SliderView = function (superClass) {
    extend(SliderView, superClass);
    function SliderView() {
        return SliderView.__super__.constructor.apply(this, arguments);
    }
    SliderView.prototype._calc_to = function () {
        return {
            start: this.model.start,
            end: this.model.end,
            value: [this.model.value],
            step: this.model.step
        };
    };
    SliderView.prototype._calc_from = function (arg) {
        var value;
        value = arg[0];
        return value;
    };
    return SliderView;
}(abstract_slider_1.AbstractSliderView);
exports.Slider = function (superClass) {
    extend(Slider, superClass);
    function Slider() {
        return Slider.__super__.constructor.apply(this, arguments);
    }
    Slider.prototype.type = 'Slider';
    Slider.prototype.default_view = exports.SliderView;
    Slider.prototype.behaviour = 'tap';
    Slider.prototype.connected = [
        true,
        false
    ];
    Slider.prototype._formatter = numbro_1.format;
    Slider.override({ format: '0[.]00' });
    return Slider;
}(abstract_slider_1.AbstractSlider);    
},
392: /* models/widgets/tabs */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var dom_1 = require(4    /* core/dom */);
var array_1 = require(20    /* core/util/array */);
var p = require(13    /* core/properties */);
var widget_1 = require(405    /* ./widget */);
exports.TabsView = function (superClass) {
    extend(TabsView, superClass);
    function TabsView() {
        return TabsView.__super__.constructor.apply(this, arguments);
    }
    TabsView.prototype.connect_signals = function () {
        TabsView.__super__.connect_signals.call(this);
        return this.connect(this.model.properties.tabs.change, function (_this) {
            return function () {
                return _this.rebuild_child_views();
            };
        }(this));
    };
    TabsView.prototype.render = function () {
        var child, j, len, len1, panelEl, panels, panelsEl, ref, ref1, tabs, tabsEl;
        TabsView.__super__.render.call(this);
        dom_1.empty(this.el);
        len = this.model.tabs.length;
        if (len === 0) {
            return;
        } else if (this.model.active >= len) {
            this.model.active = len - 1;
        }
        tabs = this.model.tabs.map(function (tab, i) {
            return dom_1.li({}, dom_1.span({ data: { index: i } }, tab.title));
        });
        tabs[this.model.active].classList.add('bk-bs-active');
        tabsEl = dom_1.ul({
            'class': [
                'bk-bs-nav',
                'bk-bs-nav-tabs'
            ]
        }, tabs);
        this.el.appendChild(tabsEl);
        panels = this.model.tabs.map(function (tab) {
            return dom_1.div({ 'class': 'bk-bs-tab-pane' });
        });
        panels[this.model.active].classList.add('bk-bs-active');
        panelsEl = dom_1.div({ 'class': 'bk-bs-tab-content' }, panels);
        this.el.appendChild(panelsEl);
        tabsEl.addEventListener('click', function (_this) {
            return function (event) {
                var el, new_active, old_active, ref;
                event.preventDefault();
                if (event.target !== event.currentTarget) {
                    el = event.target;
                    old_active = _this.model.active;
                    new_active = parseInt(el.dataset.index);
                    if (old_active !== new_active) {
                        tabs[old_active].classList.remove('bk-bs-active');
                        panels[old_active].classList.remove('bk-bs-active');
                        tabs[new_active].classList.add('bk-bs-active');
                        panels[new_active].classList.add('bk-bs-active');
                        _this.model.active = new_active;
                        return (ref = _this.model.callback) != null ? ref.execute(_this.model) : void 0;
                    }
                }
            };
        }(this));
        ref = array_1.zip(this.model.children, panels);
        for (j = 0, len1 = ref.length; j < len1; j++) {
            ref1 = ref[j], child = ref1[0], panelEl = ref1[1];
            panelEl.appendChild(this.child_views[child.id].el);
        }
        return this;
    };
    return TabsView;
}(widget_1.WidgetView);
exports.Tabs = function (superClass) {
    extend(Tabs, superClass);
    function Tabs() {
        return Tabs.__super__.constructor.apply(this, arguments);
    }
    Tabs.prototype.type = 'Tabs';
    Tabs.prototype.default_view = exports.TabsView;
    Tabs.define({
        tabs: [
            p.Array,
            []
        ],
        active: [
            p.Number,
            0
        ],
        callback: [p.Instance]
    });
    Tabs.getters({
        children: function () {
            var j, len1, ref, results, tab;
            ref = this.tabs;
            results = [];
            for (j = 0, len1 = ref.length; j < len1; j++) {
                tab = ref[j];
                results.push(tab.child);
            }
            return results;
        }
    });
    Tabs.prototype.get_layoutable_children = function () {
        return this.children;
    };
    return Tabs;
}(widget_1.Widget);    
},
393: /* models/widgets/text_input */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var logging_1 = require(12    /* core/logging */);
var p = require(13    /* core/properties */);
var dom_1 = require(4    /* core/dom */);
var input_widget_1 = require(379    /* ./input_widget */);
exports.TextInputView = function (superClass) {
    extend(TextInputView, superClass);
    function TextInputView() {
        return TextInputView.__super__.constructor.apply(this, arguments);
    }
    TextInputView.prototype.className = 'bk-widget-form-group';
    TextInputView.prototype.initialize = function (options) {
        TextInputView.__super__.initialize.call(this, options);
        return this.render();
    };
    TextInputView.prototype.connect_signals = function () {
        TextInputView.__super__.connect_signals.call(this);
        return this.connect(this.model.change, function () {
            return this.render();
        });
    };
    TextInputView.prototype.render = function () {
        var labelEl;
        TextInputView.__super__.render.call(this);
        dom_1.empty(this.el);
        labelEl = dom_1.label({ 'for': this.model.id }, this.model.title);
        this.el.appendChild(labelEl);
        this.inputEl = dom_1.input({
            type: 'text',
            'class': 'bk-widget-form-input',
            id: this.model.id,
            name: this.model.name,
            value: this.model.value,
            disabled: this.model.disabled,
            placeholder: this.model.placeholder
        });
        this.inputEl.addEventListener('change', function (_this) {
            return function () {
                return _this.change_input();
            };
        }(this));
        this.el.appendChild(this.inputEl);
        if (this.model.height) {
            this.inputEl.style.height = this.model.height - 35 + 'px';
        }
        return this;
    };
    TextInputView.prototype.change_input = function () {
        var value;
        value = this.inputEl.value;
        logging_1.logger.debug('widget/text_input: value = ' + value);
        this.model.value = value;
        return TextInputView.__super__.change_input.call(this);
    };
    return TextInputView;
}(input_widget_1.InputWidgetView);
exports.TextInput = function (superClass) {
    extend(TextInput, superClass);
    function TextInput() {
        return TextInput.__super__.constructor.apply(this, arguments);
    }
    TextInput.prototype.type = 'TextInput';
    TextInput.prototype.default_view = exports.TextInputView;
    TextInput.define({
        value: [
            p.String,
            ''
        ],
        placeholder: [
            p.String,
            ''
        ]
    });
    return TextInput;
}(input_widget_1.InputWidget);    
},
394: /* models/widgets/toggle */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var p = require(13    /* core/properties */);
var abstract_button_1 = require(365    /* ./abstract_button */);
exports.ToggleView = function (superClass) {
    extend(ToggleView, superClass);
    function ToggleView() {
        return ToggleView.__super__.constructor.apply(this, arguments);
    }
    ToggleView.prototype.render = function () {
        ToggleView.__super__.render.call(this);
        if (this.model.active) {
            this.buttonEl.classList.add('bk-bs-active');
        }
        return this;
    };
    ToggleView.prototype.change_input = function () {
        this.model.active = !this.model.active;
        return ToggleView.__super__.change_input.call(this);
    };
    return ToggleView;
}(abstract_button_1.AbstractButtonView);
exports.Toggle = function (superClass) {
    extend(Toggle, superClass);
    function Toggle() {
        return Toggle.__super__.constructor.apply(this, arguments);
    }
    Toggle.prototype.type = 'Toggle';
    Toggle.prototype.default_view = exports.ToggleView;
    Toggle.define({
        active: [
            p.Bool,
            false
        ]
    });
    Toggle.override({ label: 'Toggle' });
    return Toggle;
}(abstract_button_1.AbstractButton);    
},
405: /* models/widgets/widget */ function(require, module, exports) {
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var extend = function (child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    }, hasProp = {}.hasOwnProperty;
var layout_dom_1 = require(134    /* ../layouts/layout_dom */);
exports.WidgetView = function (superClass) {
    extend(WidgetView, superClass);
    function WidgetView() {
        return WidgetView.__super__.constructor.apply(this, arguments);
    }
    WidgetView.prototype.className = 'bk-widget';
    WidgetView.prototype.render = function () {
        this._render_classes();
        if (this.model.height != null) {
            this.el.style.height = this.model.height + 'px';
        }
        if (this.model.width != null) {
            return this.el.style.width = this.model.width + 'px';
        }
    };
    return WidgetView;
}(layout_dom_1.LayoutDOMView);
exports.Widget = function (superClass) {
    extend(Widget, superClass);
    function Widget() {
        return Widget.__super__.constructor.apply(this, arguments);
    }
    Widget.prototype.type = 'Widget';
    Widget.prototype.default_view = exports.WidgetView;
    return Widget;
}(layout_dom_1.LayoutDOM);    
},
396: /* nouislider/distribute/nouislider */ function(require, module, exports) {
/*! nouislider - 10.1.0 - 2017-07-28 17:11:18 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        window.noUiSlider = factory();
    }
}(function () {
    'use strict';
    var VERSION = '10.1.0';
    function isValidFormatter(entry) {
        return typeof entry === 'object' && typeof entry.to === 'function' && typeof entry.from === 'function';
    }
    function removeElement(el) {
        el.parentElement.removeChild(el);
    }
    // Bindable version
    function preventDefault(e) {
        e.preventDefault();
    }
    // Removes duplicates from an array.
    function unique(array) {
        return array.filter(function (a) {
            return !this[a] ? this[a] = true : false;
        }, {});
    }
    // Round a value to the closest 'to'.
    function closest(value, to) {
        return Math.round(value / to) * to;
    }
    // Current position of an element relative to the document.
    function offset(elem, orientation) {
        var rect = elem.getBoundingClientRect();
        var doc = elem.ownerDocument;
        var docElem = doc.documentElement;
        var pageOffset = getPageOffset(doc);
        // getBoundingClientRect contains left scroll in Chrome on Android.
        // I haven't found a feature detection that proves this. Worst case
        // scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
        if (/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)) {
            pageOffset.x = 0;
        }
        return orientation ? rect.top + pageOffset.y - docElem.clientTop : rect.left + pageOffset.x - docElem.clientLeft;
    }
    // Checks whether a value is numerical.
    function isNumeric(a) {
        return typeof a === 'number' && !isNaN(a) && isFinite(a);
    }
    // Sets a class and removes it after [duration] ms.
    function addClassFor(element, className, duration) {
        if (duration > 0) {
            addClass(element, className);
            setTimeout(function () {
                removeClass(element, className);
            }, duration);
        }
    }
    // Limits a value to 0 - 100
    function limit(a) {
        return Math.max(Math.min(a, 100), 0);
    }
    // Wraps a variable as an array, if it isn't one yet.
    // Note that an input array is returned by reference!
    function asArray(a) {
        return Array.isArray(a) ? a : [a];
    }
    // Counts decimals
    function countDecimals(numStr) {
        numStr = String(numStr);
        var pieces = numStr.split('.');
        return pieces.length > 1 ? pieces[1].length : 0;
    }
    // http://youmightnotneedjquery.com/#add_class
    function addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    }
    // http://youmightnotneedjquery.com/#remove_class
    function removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }
    // https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
    function hasClass(el, className) {
        return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
    function getPageOffset(doc) {
        var supportPageOffset = window.pageXOffset !== undefined;
        var isCSS1Compat = (doc.compatMode || '') === 'CSS1Compat';
        var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? doc.documentElement.scrollLeft : doc.body.scrollLeft;
        var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? doc.documentElement.scrollTop : doc.body.scrollTop;
        return {
            x: x,
            y: y
        };
    }
    // we provide a function to compute constants instead
    // of accessing window.* as soon as the module needs it
    // so that we do not compute anything if not needed
    function getActions() {
        // Determine the events to bind. IE11 implements pointerEvents without
        // a prefix, which breaks compatibility with the IE10 implementation.
        return window.navigator.pointerEnabled ? {
            start: 'pointerdown',
            move: 'pointermove',
            end: 'pointerup'
        } : window.navigator.msPointerEnabled ? {
            start: 'MSPointerDown',
            move: 'MSPointerMove',
            end: 'MSPointerUp'
        } : {
            start: 'mousedown touchstart',
            move: 'mousemove touchmove',
            end: 'mouseup touchend'
        };
    }
    // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
    // Issue #785
    function getSupportsPassive() {
        var supportsPassive = false;
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function () {
                    supportsPassive = true;
                }
            });
            window.addEventListener('test', null, opts);
        } catch (e) {
        }
        return supportsPassive;
    }
    function getSupportsTouchActionNone() {
        return window.CSS && CSS.supports && CSS.supports('touch-action', 'none');
    }
    // Value calculation
    // Determine the size of a sub-range in relation to a full range.
    function subRangeRatio(pa, pb) {
        return 100 / (pb - pa);
    }
    // (percentage) How many percent is this value of this range?
    function fromPercentage(range, value) {
        return value * 100 / (range[1] - range[0]);
    }
    // (percentage) Where is this value on this range?
    function toPercentage(range, value) {
        return fromPercentage(range, range[0] < 0 ? value + Math.abs(range[0]) : value - range[0]);
    }
    // (value) How much is this percentage on this range?
    function isPercentage(range, value) {
        return value * (range[1] - range[0]) / 100 + range[0];
    }
    // Range conversion
    function getJ(value, arr) {
        var j = 1;
        while (value >= arr[j]) {
            j += 1;
        }
        return j;
    }
    // (percentage) Input a value, find where, on a scale of 0-100, it applies.
    function toStepping(xVal, xPct, value) {
        if (value >= xVal.slice(-1)[0]) {
            return 100;
        }
        var j = getJ(value, xVal), va, vb, pa, pb;
        va = xVal[j - 1];
        vb = xVal[j];
        pa = xPct[j - 1];
        pb = xPct[j];
        return pa + toPercentage([
            va,
            vb
        ], value) / subRangeRatio(pa, pb);
    }
    // (value) Input a percentage, find where it is on the specified range.
    function fromStepping(xVal, xPct, value) {
        // There is no range group that fits 100
        if (value >= 100) {
            return xVal.slice(-1)[0];
        }
        var j = getJ(value, xPct), va, vb, pa, pb;
        va = xVal[j - 1];
        vb = xVal[j];
        pa = xPct[j - 1];
        pb = xPct[j];
        return isPercentage([
            va,
            vb
        ], (value - pa) * subRangeRatio(pa, pb));
    }
    // (percentage) Get the step that applies at a certain value.
    function getStep(xPct, xSteps, snap, value) {
        if (value === 100) {
            return value;
        }
        var j = getJ(value, xPct), a, b;
        // If 'snap' is set, steps are used as fixed points on the slider.
        if (snap) {
            a = xPct[j - 1];
            b = xPct[j];
            // Find the closest position, a or b.
            if (value - a > (b - a) / 2) {
                return b;
            }
            return a;
        }
        if (!xSteps[j - 1]) {
            return value;
        }
        return xPct[j - 1] + closest(value - xPct[j - 1], xSteps[j - 1]);
    }
    // Entry parsing
    function handleEntryPoint(index, value, that) {
        var percentage;
        // Wrap numerical input in an array.
        if (typeof value === 'number') {
            value = [value];
        }
        // Reject any invalid input, by testing whether value is an array.
        if (Object.prototype.toString.call(value) !== '[object Array]') {
            throw new Error('noUiSlider (' + VERSION + '): \'range\' contains invalid value.');
        }
        // Covert min/max syntax to 0 and 100.
        if (index === 'min') {
            percentage = 0;
        } else if (index === 'max') {
            percentage = 100;
        } else {
            percentage = parseFloat(index);
        }
        // Check for correct input.
        if (!isNumeric(percentage) || !isNumeric(value[0])) {
            throw new Error('noUiSlider (' + VERSION + '): \'range\' value isn\'t numeric.');
        }
        // Store values.
        that.xPct.push(percentage);
        that.xVal.push(value[0]);
        // NaN will evaluate to false too, but to keep
        // logging clear, set step explicitly. Make sure
        // not to override the 'step' setting with false.
        if (!percentage) {
            if (!isNaN(value[1])) {
                that.xSteps[0] = value[1];
            }
        } else {
            that.xSteps.push(isNaN(value[1]) ? false : value[1]);
        }
        that.xHighestCompleteStep.push(0);
    }
    function handleStepPoint(i, n, that) {
        // Ignore 'false' stepping.
        if (!n) {
            return true;
        }
        // Factor to range ratio
        that.xSteps[i] = fromPercentage([
            that.xVal[i],
            that.xVal[i + 1]
        ], n) / subRangeRatio(that.xPct[i], that.xPct[i + 1]);
        var totalSteps = (that.xVal[i + 1] - that.xVal[i]) / that.xNumSteps[i];
        var highestStep = Math.ceil(Number(totalSteps.toFixed(3)) - 1);
        var step = that.xVal[i] + that.xNumSteps[i] * highestStep;
        that.xHighestCompleteStep[i] = step;
    }
    // Interface
    function Spectrum(entry, snap, singleStep) {
        this.xPct = [];
        this.xVal = [];
        this.xSteps = [singleStep || false];
        this.xNumSteps = [false];
        this.xHighestCompleteStep = [];
        this.snap = snap;
        var index, ordered = [];
        // Map the object keys to an array.
        for (index in entry) {
            if (entry.hasOwnProperty(index)) {
                ordered.push([
                    entry[index],
                    index
                ]);
            }
        }
        // Sort all entries by value (numeric sort).
        if (ordered.length && typeof ordered[0][0] === 'object') {
            ordered.sort(function (a, b) {
                return a[0][0] - b[0][0];
            });
        } else {
            ordered.sort(function (a, b) {
                return a[0] - b[0];
            });
        }
        // Convert all entries to subranges.
        for (index = 0; index < ordered.length; index++) {
            handleEntryPoint(ordered[index][1], ordered[index][0], this);
        }
        // Store the actual step values.
        // xSteps is sorted in the same order as xPct and xVal.
        this.xNumSteps = this.xSteps.slice(0);
        // Convert all numeric steps to the percentage of the subrange they represent.
        for (index = 0; index < this.xNumSteps.length; index++) {
            handleStepPoint(index, this.xNumSteps[index], this);
        }
    }
    Spectrum.prototype.getMargin = function (value) {
        var step = this.xNumSteps[0];
        if (step && value / step % 1 !== 0) {
            throw new Error('noUiSlider (' + VERSION + '): \'limit\', \'margin\' and \'padding\' must be divisible by step.');
        }
        return this.xPct.length === 2 ? fromPercentage(this.xVal, value) : false;
    };
    Spectrum.prototype.toStepping = function (value) {
        value = toStepping(this.xVal, this.xPct, value);
        return value;
    };
    Spectrum.prototype.fromStepping = function (value) {
        return fromStepping(this.xVal, this.xPct, value);
    };
    Spectrum.prototype.getStep = function (value) {
        value = getStep(this.xPct, this.xSteps, this.snap, value);
        return value;
    };
    Spectrum.prototype.getNearbySteps = function (value) {
        var j = getJ(value, this.xPct);
        return {
            stepBefore: {
                startValue: this.xVal[j - 2],
                step: this.xNumSteps[j - 2],
                highestStep: this.xHighestCompleteStep[j - 2]
            },
            thisStep: {
                startValue: this.xVal[j - 1],
                step: this.xNumSteps[j - 1],
                highestStep: this.xHighestCompleteStep[j - 1]
            },
            stepAfter: {
                startValue: this.xVal[j - 0],
                step: this.xNumSteps[j - 0],
                highestStep: this.xHighestCompleteStep[j - 0]
            }
        };
    };
    Spectrum.prototype.countStepDecimals = function () {
        var stepDecimals = this.xNumSteps.map(countDecimals);
        return Math.max.apply(null, stepDecimals);
    };
    // Outside testing
    Spectrum.prototype.convert = function (value) {
        return this.getStep(this.toStepping(value));
    };
    /*	Every input option is tested and parsed. This'll prevent
	endless validation in internal methods. These tests are
	structured with an item for every option available. An
	option can be marked as required by setting the 'r' flag.
	The testing function is provided with three arguments:
		- The provided value for the option;
		- A reference to the options object;
		- The name for the option;

	The testing function returns false when an error is detected,
	or true when everything is OK. It can also modify the option
	object, to make sure all values can be correctly looped elsewhere. */
    var defaultFormatter = {
        'to': function (value) {
            return value !== undefined && value.toFixed(2);
        },
        'from': Number
    };
    function validateFormat(entry) {
        // Any object with a to and from method is supported.
        if (isValidFormatter(entry)) {
            return true;
        }
        throw new Error('noUiSlider (' + VERSION + '): \'format\' requires \'to\' and \'from\' methods.');
    }
    function testStep(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error('noUiSlider (' + VERSION + '): \'step\' is not numeric.');
        }
        // The step option can still be used to set stepping
        // for linear sliders. Overwritten if set in 'range'.
        parsed.singleStep = entry;
    }
    function testRange(parsed, entry) {
        // Filter incorrect input.
        if (typeof entry !== 'object' || Array.isArray(entry)) {
            throw new Error('noUiSlider (' + VERSION + '): \'range\' is not an object.');
        }
        // Catch missing start or end.
        if (entry.min === undefined || entry.max === undefined) {
            throw new Error('noUiSlider (' + VERSION + '): Missing \'min\' or \'max\' in \'range\'.');
        }
        // Catch equal start or end.
        if (entry.min === entry.max) {
            throw new Error('noUiSlider (' + VERSION + '): \'range\' \'min\' and \'max\' cannot be equal.');
        }
        parsed.spectrum = new Spectrum(entry, parsed.snap, parsed.singleStep);
    }
    function testStart(parsed, entry) {
        entry = asArray(entry);
        // Validate input. Values aren't tested, as the public .val method
        // will always provide a valid location.
        if (!Array.isArray(entry) || !entry.length) {
            throw new Error('noUiSlider (' + VERSION + '): \'start\' option is incorrect.');
        }
        // Store the number of handles.
        parsed.handles = entry.length;
        // When the slider is initialized, the .val method will
        // be called with the start options.
        parsed.start = entry;
    }
    function testSnap(parsed, entry) {
        // Enforce 100% stepping within subranges.
        parsed.snap = entry;
        if (typeof entry !== 'boolean') {
            throw new Error('noUiSlider (' + VERSION + '): \'snap\' option must be a boolean.');
        }
    }
    function testAnimate(parsed, entry) {
        // Enforce 100% stepping within subranges.
        parsed.animate = entry;
        if (typeof entry !== 'boolean') {
            throw new Error('noUiSlider (' + VERSION + '): \'animate\' option must be a boolean.');
        }
    }
    function testAnimationDuration(parsed, entry) {
        parsed.animationDuration = entry;
        if (typeof entry !== 'number') {
            throw new Error('noUiSlider (' + VERSION + '): \'animationDuration\' option must be a number.');
        }
    }
    function testConnect(parsed, entry) {
        var connect = [false];
        var i;
        // Map legacy options
        if (entry === 'lower') {
            entry = [
                true,
                false
            ];
        } else if (entry === 'upper') {
            entry = [
                false,
                true
            ];
        }
        // Handle boolean options
        if (entry === true || entry === false) {
            for (i = 1; i < parsed.handles; i++) {
                connect.push(entry);
            }
            connect.push(false);
        }    // Reject invalid input
        else if (!Array.isArray(entry) || !entry.length || entry.length !== parsed.handles + 1) {
            throw new Error('noUiSlider (' + VERSION + '): \'connect\' option doesn\'t match handle count.');
        } else {
            connect = entry;
        }
        parsed.connect = connect;
    }
    function testOrientation(parsed, entry) {
        // Set orientation to an a numerical value for easy
        // array selection.
        switch (entry) {
        case 'horizontal':
            parsed.ort = 0;
            break;
        case 'vertical':
            parsed.ort = 1;
            break;
        default:
            throw new Error('noUiSlider (' + VERSION + '): \'orientation\' option is invalid.');
        }
    }
    function testMargin(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error('noUiSlider (' + VERSION + '): \'margin\' option must be numeric.');
        }
        // Issue #582
        if (entry === 0) {
            return;
        }
        parsed.margin = parsed.spectrum.getMargin(entry);
        if (!parsed.margin) {
            throw new Error('noUiSlider (' + VERSION + '): \'margin\' option is only supported on linear sliders.');
        }
    }
    function testLimit(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error('noUiSlider (' + VERSION + '): \'limit\' option must be numeric.');
        }
        parsed.limit = parsed.spectrum.getMargin(entry);
        if (!parsed.limit || parsed.handles < 2) {
            throw new Error('noUiSlider (' + VERSION + '): \'limit\' option is only supported on linear sliders with 2 or more handles.');
        }
    }
    function testPadding(parsed, entry) {
        if (!isNumeric(entry)) {
            throw new Error('noUiSlider (' + VERSION + '): \'padding\' option must be numeric.');
        }
        if (entry === 0) {
            return;
        }
        parsed.padding = parsed.spectrum.getMargin(entry);
        if (!parsed.padding) {
            throw new Error('noUiSlider (' + VERSION + '): \'padding\' option is only supported on linear sliders.');
        }
        if (parsed.padding < 0) {
            throw new Error('noUiSlider (' + VERSION + '): \'padding\' option must be a positive number.');
        }
        if (parsed.padding >= 50) {
            throw new Error('noUiSlider (' + VERSION + '): \'padding\' option must be less than half the range.');
        }
    }
    function testDirection(parsed, entry) {
        // Set direction as a numerical value for easy parsing.
        // Invert connection for RTL sliders, so that the proper
        // handles get the connect/background classes.
        switch (entry) {
        case 'ltr':
            parsed.dir = 0;
            break;
        case 'rtl':
            parsed.dir = 1;
            break;
        default:
            throw new Error('noUiSlider (' + VERSION + '): \'direction\' option was not recognized.');
        }
    }
    function testBehaviour(parsed, entry) {
        // Make sure the input is a string.
        if (typeof entry !== 'string') {
            throw new Error('noUiSlider (' + VERSION + '): \'behaviour\' must be a string containing options.');
        }
        // Check if the string contains any keywords.
        // None are required.
        var tap = entry.indexOf('tap') >= 0;
        var drag = entry.indexOf('drag') >= 0;
        var fixed = entry.indexOf('fixed') >= 0;
        var snap = entry.indexOf('snap') >= 0;
        var hover = entry.indexOf('hover') >= 0;
        if (fixed) {
            if (parsed.handles !== 2) {
                throw new Error('noUiSlider (' + VERSION + '): \'fixed\' behaviour must be used with 2 handles');
            }
            // Use margin to enforce fixed state
            testMargin(parsed, parsed.start[1] - parsed.start[0]);
        }
        parsed.events = {
            tap: tap || snap,
            drag: drag,
            fixed: fixed,
            snap: snap,
            hover: hover
        };
    }
    function testMultitouch(parsed, entry) {
        parsed.multitouch = entry;
        if (typeof entry !== 'boolean') {
            throw new Error('noUiSlider (' + VERSION + '): \'multitouch\' option must be a boolean.');
        }
    }
    function testTooltips(parsed, entry) {
        if (entry === false) {
            return;
        } else if (entry === true) {
            parsed.tooltips = [];
            for (var i = 0; i < parsed.handles; i++) {
                parsed.tooltips.push(true);
            }
        } else {
            parsed.tooltips = asArray(entry);
            if (parsed.tooltips.length !== parsed.handles) {
                throw new Error('noUiSlider (' + VERSION + '): must pass a formatter for all handles.');
            }
            parsed.tooltips.forEach(function (formatter) {
                if (typeof formatter !== 'boolean' && (typeof formatter !== 'object' || typeof formatter.to !== 'function')) {
                    throw new Error('noUiSlider (' + VERSION + '): \'tooltips\' must be passed a formatter or \'false\'.');
                }
            });
        }
    }
    function testAriaFormat(parsed, entry) {
        parsed.ariaFormat = entry;
        validateFormat(entry);
    }
    function testFormat(parsed, entry) {
        parsed.format = entry;
        validateFormat(entry);
    }
    function testCssPrefix(parsed, entry) {
        if (entry !== undefined && typeof entry !== 'string' && entry !== false) {
            throw new Error('noUiSlider (' + VERSION + '): \'cssPrefix\' must be a string or `false`.');
        }
        parsed.cssPrefix = entry;
    }
    function testCssClasses(parsed, entry) {
        if (entry !== undefined && typeof entry !== 'object') {
            throw new Error('noUiSlider (' + VERSION + '): \'cssClasses\' must be an object.');
        }
        if (typeof parsed.cssPrefix === 'string') {
            parsed.cssClasses = {};
            for (var key in entry) {
                if (!entry.hasOwnProperty(key)) {
                    continue;
                }
                parsed.cssClasses[key] = parsed.cssPrefix + entry[key];
            }
        } else {
            parsed.cssClasses = entry;
        }
    }
    function testUseRaf(parsed, entry) {
        if (entry === true || entry === false) {
            parsed.useRequestAnimationFrame = entry;
        } else {
            throw new Error('noUiSlider (' + VERSION + '): \'useRequestAnimationFrame\' option should be true (default) or false.');
        }
    }
    // Test all developer settings and parse to assumption-safe values.
    function testOptions(options) {
        // To prove a fix for #537, freeze options here.
        // If the object is modified, an error will be thrown.
        // Object.freeze(options);
        var parsed = {
            margin: 0,
            limit: 0,
            padding: 0,
            animate: true,
            animationDuration: 300,
            ariaFormat: defaultFormatter,
            format: defaultFormatter
        };
        // Tests are executed in the order they are presented here.
        var tests = {
            'step': {
                r: false,
                t: testStep
            },
            'start': {
                r: true,
                t: testStart
            },
            'connect': {
                r: true,
                t: testConnect
            },
            'direction': {
                r: true,
                t: testDirection
            },
            'snap': {
                r: false,
                t: testSnap
            },
            'animate': {
                r: false,
                t: testAnimate
            },
            'animationDuration': {
                r: false,
                t: testAnimationDuration
            },
            'range': {
                r: true,
                t: testRange
            },
            'orientation': {
                r: false,
                t: testOrientation
            },
            'margin': {
                r: false,
                t: testMargin
            },
            'limit': {
                r: false,
                t: testLimit
            },
            'padding': {
                r: false,
                t: testPadding
            },
            'behaviour': {
                r: true,
                t: testBehaviour
            },
            'multitouch': {
                r: true,
                t: testMultitouch
            },
            'ariaFormat': {
                r: false,
                t: testAriaFormat
            },
            'format': {
                r: false,
                t: testFormat
            },
            'tooltips': {
                r: false,
                t: testTooltips
            },
            'cssPrefix': {
                r: false,
                t: testCssPrefix
            },
            'cssClasses': {
                r: false,
                t: testCssClasses
            },
            'useRequestAnimationFrame': {
                r: false,
                t: testUseRaf
            }
        };
        var defaults = {
            'connect': false,
            'direction': 'ltr',
            'behaviour': 'tap',
            'multitouch': false,
            'orientation': 'horizontal',
            'cssPrefix': 'noUi-',
            'cssClasses': {
                target: 'target',
                base: 'base',
                origin: 'origin',
                handle: 'handle',
                handleLower: 'handle-lower',
                handleUpper: 'handle-upper',
                horizontal: 'horizontal',
                vertical: 'vertical',
                background: 'background',
                connect: 'connect',
                ltr: 'ltr',
                rtl: 'rtl',
                draggable: 'draggable',
                drag: 'state-drag',
                tap: 'state-tap',
                active: 'active',
                tooltip: 'tooltip',
                pips: 'pips',
                pipsHorizontal: 'pips-horizontal',
                pipsVertical: 'pips-vertical',
                marker: 'marker',
                markerHorizontal: 'marker-horizontal',
                markerVertical: 'marker-vertical',
                markerNormal: 'marker-normal',
                markerLarge: 'marker-large',
                markerSub: 'marker-sub',
                value: 'value',
                valueHorizontal: 'value-horizontal',
                valueVertical: 'value-vertical',
                valueNormal: 'value-normal',
                valueLarge: 'value-large',
                valueSub: 'value-sub'
            },
            'useRequestAnimationFrame': true
        };
        // AriaFormat defaults to regular format, if any.
        if (options.format && !options.ariaFormat) {
            options.ariaFormat = options.format;
        }
        // Run all options through a testing mechanism to ensure correct
        // input. It should be noted that options might get modified to
        // be handled properly. E.g. wrapping integers in arrays.
        Object.keys(tests).forEach(function (name) {
            // If the option isn't set, but it is required, throw an error.
            if (options[name] === undefined && defaults[name] === undefined) {
                if (tests[name].r) {
                    throw new Error('noUiSlider (' + VERSION + '): \'' + name + '\' is required.');
                }
                return true;
            }
            tests[name].t(parsed, options[name] === undefined ? defaults[name] : options[name]);
        });
        // Forward pips options
        parsed.pips = options.pips;
        var styles = [
            [
                'left',
                'top'
            ],
            [
                'right',
                'bottom'
            ]
        ];
        // Pre-define the styles.
        parsed.style = styles[parsed.dir][parsed.ort];
        parsed.styleOposite = styles[parsed.dir ? 0 : 1][parsed.ort];
        return parsed;
    }
    function closure(target, options, originalOptions) {
        var actions = getActions();
        var supportsTouchActionNone = getSupportsTouchActionNone();
        var supportsPassive = supportsTouchActionNone && getSupportsPassive();
        // All variables local to 'closure' are prefixed with 'scope_'
        var scope_Target = target;
        var scope_Locations = [];
        var scope_Base;
        var scope_Handles;
        var scope_HandleNumbers = [];
        var scope_ActiveHandlesCount = 0;
        var scope_Connects;
        var scope_Spectrum = options.spectrum;
        var scope_Values = [];
        var scope_Events = {};
        var scope_Self;
        var scope_Pips;
        var scope_Document = target.ownerDocument;
        var scope_DocumentElement = scope_Document.documentElement;
        var scope_Body = scope_Document.body;
        // Creates a node, adds it to target, returns the new node.
        function addNodeTo(target, className) {
            var div = scope_Document.createElement('div');
            if (className) {
                addClass(div, className);
            }
            target.appendChild(div);
            return div;
        }
        // Append a origin to the base
        function addOrigin(base, handleNumber) {
            var origin = addNodeTo(base, options.cssClasses.origin);
            var handle = addNodeTo(origin, options.cssClasses.handle);
            handle.setAttribute('data-handle', handleNumber);
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
            // 0 = focusable and reachable
            handle.setAttribute('tabindex', '0');
            handle.setAttribute('role', 'slider');
            handle.setAttribute('aria-orientation', options.ort ? 'vertical' : 'horizontal');
            if (handleNumber === 0) {
                addClass(handle, options.cssClasses.handleLower);
            } else if (handleNumber === options.handles - 1) {
                addClass(handle, options.cssClasses.handleUpper);
            }
            return origin;
        }
        // Insert nodes for connect elements
        function addConnect(base, add) {
            if (!add) {
                return false;
            }
            return addNodeTo(base, options.cssClasses.connect);
        }
        // Add handles to the slider base.
        function addElements(connectOptions, base) {
            scope_Handles = [];
            scope_Connects = [];
            scope_Connects.push(addConnect(base, connectOptions[0]));
            // [::::O====O====O====]
            // connectOptions = [0, 1, 1, 1]
            for (var i = 0; i < options.handles; i++) {
                // Keep a list of all added handles.
                scope_Handles.push(addOrigin(base, i));
                scope_HandleNumbers[i] = i;
                scope_Connects.push(addConnect(base, connectOptions[i + 1]));
            }
        }
        // Initialize a single slider.
        function addSlider(target) {
            // Apply classes and data to the target.
            addClass(target, options.cssClasses.target);
            if (options.dir === 0) {
                addClass(target, options.cssClasses.ltr);
            } else {
                addClass(target, options.cssClasses.rtl);
            }
            if (options.ort === 0) {
                addClass(target, options.cssClasses.horizontal);
            } else {
                addClass(target, options.cssClasses.vertical);
            }
            scope_Base = addNodeTo(target, options.cssClasses.base);
        }
        function addTooltip(handle, handleNumber) {
            if (!options.tooltips[handleNumber]) {
                return false;
            }
            return addNodeTo(handle.firstChild, options.cssClasses.tooltip);
        }
        // The tooltips option is a shorthand for using the 'update' event.
        function tooltips() {
            // Tooltips are added with options.tooltips in original order.
            var tips = scope_Handles.map(addTooltip);
            bindEvent('update', function (values, handleNumber, unencoded) {
                if (!tips[handleNumber]) {
                    return;
                }
                var formattedValue = values[handleNumber];
                if (options.tooltips[handleNumber] !== true) {
                    formattedValue = options.tooltips[handleNumber].to(unencoded[handleNumber]);
                }
                tips[handleNumber].innerHTML = formattedValue;
            });
        }
        function aria() {
            bindEvent('update', function (values, handleNumber, unencoded, tap, positions) {
                // Update Aria Values for all handles, as a change in one changes min and max values for the next.
                scope_HandleNumbers.forEach(function (handleNumber) {
                    var handle = scope_Handles[handleNumber];
                    var min = checkHandlePosition(scope_Locations, handleNumber, 0, true, true, true);
                    var max = checkHandlePosition(scope_Locations, handleNumber, 100, true, true, true);
                    var now = positions[handleNumber];
                    var text = options.ariaFormat.to(unencoded[handleNumber]);
                    handle.children[0].setAttribute('aria-valuemin', min.toFixed(1));
                    handle.children[0].setAttribute('aria-valuemax', max.toFixed(1));
                    handle.children[0].setAttribute('aria-valuenow', now.toFixed(1));
                    handle.children[0].setAttribute('aria-valuetext', text);
                });
            });
        }
        function getGroup(mode, values, stepped) {
            // Use the range.
            if (mode === 'range' || mode === 'steps') {
                return scope_Spectrum.xVal;
            }
            if (mode === 'count') {
                if (!values) {
                    throw new Error('noUiSlider (' + VERSION + '): \'values\' required for mode \'count\'.');
                }
                // Divide 0 - 100 in 'count' parts.
                var spread = 100 / (values - 1);
                var v;
                var i = 0;
                values = [];
                // List these parts and have them handled as 'positions'.
                while ((v = i++ * spread) <= 100) {
                    values.push(v);
                }
                mode = 'positions';
            }
            if (mode === 'positions') {
                // Map all percentages to on-range values.
                return values.map(function (value) {
                    return scope_Spectrum.fromStepping(stepped ? scope_Spectrum.getStep(value) : value);
                });
            }
            if (mode === 'values') {
                // If the value must be stepped, it needs to be converted to a percentage first.
                if (stepped) {
                    return values.map(function (value) {
                        // Convert to percentage, apply step, return to value.
                        return scope_Spectrum.fromStepping(scope_Spectrum.getStep(scope_Spectrum.toStepping(value)));
                    });
                }
                // Otherwise, we can simply use the values.
                return values;
            }
        }
        function generateSpread(density, mode, group) {
            function safeIncrement(value, increment) {
                // Avoid floating point variance by dropping the smallest decimal places.
                return (value + increment).toFixed(7) / 1;
            }
            var indexes = {};
            var firstInRange = scope_Spectrum.xVal[0];
            var lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length - 1];
            var ignoreFirst = false;
            var ignoreLast = false;
            var prevPct = 0;
            // Create a copy of the group, sort it and filter away all duplicates.
            group = unique(group.slice().sort(function (a, b) {
                return a - b;
            }));
            // Make sure the range starts with the first element.
            if (group[0] !== firstInRange) {
                group.unshift(firstInRange);
                ignoreFirst = true;
            }
            // Likewise for the last one.
            if (group[group.length - 1] !== lastInRange) {
                group.push(lastInRange);
                ignoreLast = true;
            }
            group.forEach(function (current, index) {
                // Get the current step and the lower + upper positions.
                var step;
                var i;
                var q;
                var low = current;
                var high = group[index + 1];
                var newPct;
                var pctDifference;
                var pctPos;
                var type;
                var steps;
                var realSteps;
                var stepsize;
                // When using 'steps' mode, use the provided steps.
                // Otherwise, we'll step on to the next subrange.
                if (mode === 'steps') {
                    step = scope_Spectrum.xNumSteps[index];
                }
                // Default to a 'full' step.
                if (!step) {
                    step = high - low;
                }
                // Low can be 0, so test for false. If high is undefined,
                // we are at the last subrange. Index 0 is already handled.
                if (low === false || high === undefined) {
                    return;
                }
                // Make sure step isn't 0, which would cause an infinite loop (#654)
                step = Math.max(step, 1e-7);
                // Find all steps in the subrange.
                for (i = low; i <= high; i = safeIncrement(i, step)) {
                    // Get the percentage value for the current step,
                    // calculate the size for the subrange.
                    newPct = scope_Spectrum.toStepping(i);
                    pctDifference = newPct - prevPct;
                    steps = pctDifference / density;
                    realSteps = Math.round(steps);
                    // This ratio represents the ammount of percentage-space a point indicates.
                    // For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-devided.
                    // Round the percentage offset to an even number, then divide by two
                    // to spread the offset on both sides of the range.
                    stepsize = pctDifference / realSteps;
                    // Divide all points evenly, adding the correct number to this subrange.
                    // Run up to <= so that 100% gets a point, event if ignoreLast is set.
                    for (q = 1; q <= realSteps; q += 1) {
                        // The ratio between the rounded value and the actual size might be ~1% off.
                        // Correct the percentage offset by the number of points
                        // per subrange. density = 1 will result in 100 points on the
                        // full range, 2 for 50, 4 for 25, etc.
                        pctPos = prevPct + q * stepsize;
                        indexes[pctPos.toFixed(5)] = [
                            'x',
                            0
                        ];
                    }
                    // Determine the point type.
                    type = group.indexOf(i) > -1 ? 1 : mode === 'steps' ? 2 : 0;
                    // Enforce the 'ignoreFirst' option by overwriting the type for 0.
                    if (!index && ignoreFirst) {
                        type = 0;
                    }
                    if (!(i === high && ignoreLast)) {
                        // Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
                        indexes[newPct.toFixed(5)] = [
                            i,
                            type
                        ];
                    }
                    // Update the percentage count.
                    prevPct = newPct;
                }
            });
            return indexes;
        }
        function addMarking(spread, filterFunc, formatter) {
            var element = scope_Document.createElement('div');
            var valueSizeClasses = [
                options.cssClasses.valueNormal,
                options.cssClasses.valueLarge,
                options.cssClasses.valueSub
            ];
            var markerSizeClasses = [
                options.cssClasses.markerNormal,
                options.cssClasses.markerLarge,
                options.cssClasses.markerSub
            ];
            var valueOrientationClasses = [
                options.cssClasses.valueHorizontal,
                options.cssClasses.valueVertical
            ];
            var markerOrientationClasses = [
                options.cssClasses.markerHorizontal,
                options.cssClasses.markerVertical
            ];
            addClass(element, options.cssClasses.pips);
            addClass(element, options.ort === 0 ? options.cssClasses.pipsHorizontal : options.cssClasses.pipsVertical);
            function getClasses(type, source) {
                var a = source === options.cssClasses.value;
                var orientationClasses = a ? valueOrientationClasses : markerOrientationClasses;
                var sizeClasses = a ? valueSizeClasses : markerSizeClasses;
                return source + ' ' + orientationClasses[options.ort] + ' ' + sizeClasses[type];
            }
            function addSpread(offset, values) {
                // Apply the filter function, if it is set.
                values[1] = values[1] && filterFunc ? filterFunc(values[0], values[1]) : values[1];
                // Add a marker for every point
                var node = addNodeTo(element, false);
                node.className = getClasses(values[1], options.cssClasses.marker);
                node.style[options.style] = offset + '%';
                // Values are only appended for points marked '1' or '2'.
                if (values[1]) {
                    node = addNodeTo(element, false);
                    node.className = getClasses(values[1], options.cssClasses.value);
                    node.style[options.style] = offset + '%';
                    node.innerText = formatter.to(values[0]);
                }
            }
            // Append all points.
            Object.keys(spread).forEach(function (a) {
                addSpread(a, spread[a]);
            });
            return element;
        }
        function removePips() {
            if (scope_Pips) {
                removeElement(scope_Pips);
                scope_Pips = null;
            }
        }
        function pips(grid) {
            // Fix #669
            removePips();
            var mode = grid.mode;
            var density = grid.density || 1;
            var filter = grid.filter || false;
            var values = grid.values || false;
            var stepped = grid.stepped || false;
            var group = getGroup(mode, values, stepped);
            var spread = generateSpread(density, mode, group);
            var format = grid.format || { to: Math.round };
            scope_Pips = scope_Target.appendChild(addMarking(spread, filter, format));
            return scope_Pips;
        }
        // Shorthand for base dimensions.
        function baseSize() {
            var rect = scope_Base.getBoundingClientRect(), alt = 'offset' + [
                    'Width',
                    'Height'
                ][options.ort];
            return options.ort === 0 ? rect.width || scope_Base[alt] : rect.height || scope_Base[alt];
        }
        // Handler for attaching events trough a proxy.
        function attachEvent(events, element, callback, data) {
            // This function can be used to 'filter' events to the slider.
            // element is a node, not a nodeList
            var method = function (e) {
                if (scope_Target.hasAttribute('disabled')) {
                    return false;
                }
                // Stop if an active 'tap' transition is taking place.
                if (hasClass(scope_Target, options.cssClasses.tap)) {
                    return false;
                }
                e = fixEvent(e, data.pageOffset, data.target || element);
                // Handle reject of multitouch
                if (!e) {
                    return false;
                }
                // Ignore right or middle clicks on start #454
                if (events === actions.start && e.buttons !== undefined && e.buttons > 1) {
                    return false;
                }
                // Ignore right or middle clicks on start #454
                if (data.hover && e.buttons) {
                    return false;
                }
                // 'supportsPassive' is only true if a browser also supports touch-action: none in CSS.
                // iOS safari does not, so it doesn't get to benefit from passive scrolling. iOS does support
                // touch-action: manipulation, but that allows panning, which breaks
                // sliders after zooming/on non-responsive pages.
                // See: https://bugs.webkit.org/show_bug.cgi?id=133112
                if (!supportsPassive) {
                    e.preventDefault();
                }
                e.calcPoint = e.points[options.ort];
                // Call the event handler with the event [ and additional data ].
                callback(e, data);
            };
            var methods = [];
            // Bind a closure on the target for every event type.
            events.split(' ').forEach(function (eventName) {
                element.addEventListener(eventName, method, supportsPassive ? { passive: true } : false);
                methods.push([
                    eventName,
                    method
                ]);
            });
            return methods;
        }
        // Provide a clean event with standardized offset values.
        function fixEvent(e, pageOffset, target) {
            // Filter the event to register the type, which can be
            // touch, mouse or pointer. Offset changes need to be
            // made on an event specific basis.
            var touch = e.type.indexOf('touch') === 0;
            var mouse = e.type.indexOf('mouse') === 0;
            var pointer = e.type.indexOf('pointer') === 0;
            var x;
            var y;
            // IE10 implemented pointer events with a prefix;
            if (e.type.indexOf('MSPointer') === 0) {
                pointer = true;
            }
            // In the event that multitouch is activated, the only thing one handle should be concerned
            // about is the touches that originated on top of it.
            if (touch && options.multitouch) {
                // Returns true if a touch originated on the target.
                var isTouchOnTarget = function (touch) {
                    return touch.target === target || target.contains(touch.target);
                };
                // In the case of touchstart events, we need to make sure there is still no more than one
                // touch on the target so we look amongst all touches.
                if (e.type === 'touchstart') {
                    var targetTouches = Array.prototype.filter.call(e.touches, isTouchOnTarget);
                    // Do not support more than one touch per handle.
                    if (targetTouches.length > 1) {
                        return false;
                    }
                    x = targetTouches[0].pageX;
                    y = targetTouches[0].pageY;
                } else {
                    // In the other cases, find on changedTouches is enough.
                    var targetTouch = Array.prototype.find.call(e.changedTouches, isTouchOnTarget);
                    // Cancel if the target touch has not moved.
                    if (!targetTouch) {
                        return false;
                    }
                    x = targetTouch.pageX;
                    y = targetTouch.pageY;
                }
            } else if (touch) {
                // Fix bug when user touches with two or more fingers on mobile devices.
                // It's useful when you have two or more sliders on one page,
                // that can be touched simultaneously.
                // #649, #663, #668
                if (e.touches.length > 1) {
                    return false;
                }
                // noUiSlider supports one movement at a time,
                // so we can select the first 'changedTouch'.
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
            }
            pageOffset = pageOffset || getPageOffset(scope_Document);
            if (mouse || pointer) {
                x = e.clientX + pageOffset.x;
                y = e.clientY + pageOffset.y;
            }
            e.pageOffset = pageOffset;
            e.points = [
                x,
                y
            ];
            e.cursor = mouse || pointer;
            // Fix #435
            return e;
        }
        // Translate a coordinate in the document to a percentage on the slider
        function calcPointToPercentage(calcPoint) {
            var location = calcPoint - offset(scope_Base, options.ort);
            var proposal = location * 100 / baseSize();
            return options.dir ? 100 - proposal : proposal;
        }
        // Find handle closest to a certain percentage on the slider
        function getClosestHandle(proposal) {
            var closest = 100;
            var handleNumber = false;
            scope_Handles.forEach(function (handle, index) {
                // Disabled handles are ignored
                if (handle.hasAttribute('disabled')) {
                    return;
                }
                var pos = Math.abs(scope_Locations[index] - proposal);
                if (pos < closest) {
                    handleNumber = index;
                    closest = pos;
                }
            });
            return handleNumber;
        }
        // Moves handle(s) by a percentage
        // (bool, % to move, [% where handle started, ...], [index in scope_Handles, ...])
        function moveHandles(upward, proposal, locations, handleNumbers) {
            var proposals = locations.slice();
            var b = [
                !upward,
                upward
            ];
            var f = [
                upward,
                !upward
            ];
            // Copy handleNumbers so we don't change the dataset
            handleNumbers = handleNumbers.slice();
            // Check to see which handle is 'leading'.
            // If that one can't move the second can't either.
            if (upward) {
                handleNumbers.reverse();
            }
            // Step 1: get the maximum percentage that any of the handles can move
            if (handleNumbers.length > 1) {
                handleNumbers.forEach(function (handleNumber, o) {
                    var to = checkHandlePosition(proposals, handleNumber, proposals[handleNumber] + proposal, b[o], f[o], false);
                    // Stop if one of the handles can't move.
                    if (to === false) {
                        proposal = 0;
                    } else {
                        proposal = to - proposals[handleNumber];
                        proposals[handleNumber] = to;
                    }
                });
            }    // If using one handle, check backward AND forward
            else {
                b = f = [true];
            }
            var state = false;
            // Step 2: Try to set the handles with the found percentage
            handleNumbers.forEach(function (handleNumber, o) {
                state = setHandle(handleNumber, locations[handleNumber] + proposal, b[o], f[o]) || state;
            });
            // Step 3: If a handle moved, fire events
            if (state) {
                handleNumbers.forEach(function (handleNumber) {
                    fireEvent('update', handleNumber);
                    fireEvent('slide', handleNumber);
                });
            }
        }
        // External event handling
        function fireEvent(eventName, handleNumber, tap) {
            Object.keys(scope_Events).forEach(function (targetEvent) {
                var eventType = targetEvent.split('.')[0];
                if (eventName === eventType) {
                    scope_Events[targetEvent].forEach(function (callback) {
                        callback.call(// Use the slider public API as the scope ('this')
                        scope_Self, // Return values as array, so arg_1[arg_2] is always valid.
                        scope_Values.map(options.format.to), // Handle index, 0 or 1
                        handleNumber, // Unformatted slider values
                        scope_Values.slice(), // Event is fired by tap, true or false
                        tap || false, // Left offset of the handle, in relation to the slider
                        scope_Locations.slice());
                    });
                }
            });
        }
        // Fire 'end' when a mouse or pen leaves the document.
        function documentLeave(event, data) {
            if (event.type === 'mouseout' && event.target.nodeName === 'HTML' && event.relatedTarget === null) {
                eventEnd(event, data);
            }
        }
        // Handle movement on document for handle and range drag.
        function eventMove(event, data) {
            // Fix #498
            // Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
            // https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
            // IE9 has .buttons and .which zero on mousemove.
            // Firefox breaks the spec MDN defines.
            if (navigator.appVersion.indexOf('MSIE 9') === -1 && event.buttons === 0 && data.buttonsProperty !== 0) {
                return eventEnd(event, data);
            }
            // Check if we are moving up or down
            var movement = (options.dir ? -1 : 1) * (event.calcPoint - data.startCalcPoint);
            // Convert the movement into a percentage of the slider width/height
            var proposal = movement * 100 / data.baseSize;
            moveHandles(movement > 0, proposal, data.locations, data.handleNumbers);
        }
        // Unbind move events on document, call callbacks.
        function eventEnd(event, data) {
            // The handle is no longer active, so remove the class.
            if (data.handle) {
                removeClass(data.handle, options.cssClasses.active);
                scope_ActiveHandlesCount -= 1;
            }
            // Unbind the move and end events, which are added on 'start'.
            data.listeners.forEach(function (c) {
                scope_DocumentElement.removeEventListener(c[0], c[1]);
            });
            if (scope_ActiveHandlesCount === 0) {
                // Remove dragging class.
                removeClass(scope_Target, options.cssClasses.drag);
                setZindex();
                // Remove cursor styles and text-selection events bound to the body.
                if (event.cursor) {
                    scope_Body.style.cursor = '';
                    scope_Body.removeEventListener('selectstart', preventDefault);
                }
            }
            data.handleNumbers.forEach(function (handleNumber) {
                fireEvent('change', handleNumber);
                fireEvent('set', handleNumber);
                fireEvent('end', handleNumber);
            });
        }
        // Bind move events on document.
        function eventStart(event, data) {
            var handle;
            if (data.handleNumbers.length === 1) {
                var handleOrigin = scope_Handles[data.handleNumbers[0]];
                // Ignore 'disabled' handles
                if (handleOrigin.hasAttribute('disabled')) {
                    return false;
                }
                handle = handleOrigin.children[0];
                scope_ActiveHandlesCount += 1;
                // Mark the handle as 'active' so it can be styled.
                addClass(handle, options.cssClasses.active);
            }
            // A drag should never propagate up to the 'tap' event.
            event.stopPropagation();
            // Record the event listeners.
            var listeners = [];
            // Attach the move and end events.
            var moveEvent = attachEvent(actions.move, scope_DocumentElement, eventMove, {
                // The event target has changed so we need to propagate the original one so that we keep
                // relying on it to extract target touches.
                target: event.target,
                handle: handle,
                listeners: listeners,
                startCalcPoint: event.calcPoint,
                baseSize: baseSize(),
                pageOffset: event.pageOffset,
                handleNumbers: data.handleNumbers,
                buttonsProperty: event.buttons,
                locations: scope_Locations.slice()
            });
            var endEvent = attachEvent(actions.end, scope_DocumentElement, eventEnd, {
                target: event.target,
                handle: handle,
                listeners: listeners,
                handleNumbers: data.handleNumbers
            });
            var outEvent = attachEvent('mouseout', scope_DocumentElement, documentLeave, {
                target: event.target,
                handle: handle,
                listeners: listeners,
                handleNumbers: data.handleNumbers
            });
            // We want to make sure we pushed the listeners in the listener list rather than creating
            // a new one as it has already been passed to the event handlers.
            listeners.push.apply(listeners, moveEvent.concat(endEvent, outEvent));
            // Text selection isn't an issue on touch devices,
            // so adding cursor styles can be skipped.
            if (event.cursor) {
                // Prevent the 'I' cursor and extend the range-drag cursor.
                scope_Body.style.cursor = getComputedStyle(event.target).cursor;
                // Mark the target with a dragging state.
                if (scope_Handles.length > 1) {
                    addClass(scope_Target, options.cssClasses.drag);
                }
                // Prevent text selection when dragging the handles.
                // In noUiSlider <= 9.2.0, this was handled by calling preventDefault on mouse/touch start/move,
                // which is scroll blocking. The selectstart event is supported by FireFox starting from version 52,
                // meaning the only holdout is iOS Safari. This doesn't matter: text selection isn't triggered there.
                // The 'cursor' flag is false.
                // See: http://caniuse.com/#search=selectstart
                scope_Body.addEventListener('selectstart', preventDefault, false);
            }
            data.handleNumbers.forEach(function (handleNumber) {
                fireEvent('start', handleNumber);
            });
        }
        // Move closest handle to tapped location.
        function eventTap(event) {
            // The tap event shouldn't propagate up
            event.stopPropagation();
            var proposal = calcPointToPercentage(event.calcPoint);
            var handleNumber = getClosestHandle(proposal);
            // Tackle the case that all handles are 'disabled'.
            if (handleNumber === false) {
                return false;
            }
            // Flag the slider as it is now in a transitional state.
            // Transition takes a configurable amount of ms (default 300). Re-enable the slider after that.
            if (!options.events.snap) {
                addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
            }
            setHandle(handleNumber, proposal, true, true);
            setZindex();
            fireEvent('slide', handleNumber, true);
            fireEvent('update', handleNumber, true);
            fireEvent('change', handleNumber, true);
            fireEvent('set', handleNumber, true);
            if (options.events.snap) {
                eventStart(event, { handleNumbers: [handleNumber] });
            }
        }
        // Fires a 'hover' event for a hovered mouse/pen position.
        function eventHover(event) {
            var proposal = calcPointToPercentage(event.calcPoint);
            var to = scope_Spectrum.getStep(proposal);
            var value = scope_Spectrum.fromStepping(to);
            Object.keys(scope_Events).forEach(function (targetEvent) {
                if ('hover' === targetEvent.split('.')[0]) {
                    scope_Events[targetEvent].forEach(function (callback) {
                        callback.call(scope_Self, value);
                    });
                }
            });
        }
        // Attach events to several slider parts.
        function bindSliderEvents(behaviour) {
            // Attach the standard drag event to the handles.
            if (!behaviour.fixed) {
                scope_Handles.forEach(function (handle, index) {
                    // These events are only bound to the visual handle
                    // element, not the 'real' origin element.
                    attachEvent(actions.start, handle.children[0], eventStart, { handleNumbers: [index] });
                });
            }
            // Attach the tap event to the slider base.
            if (behaviour.tap) {
                attachEvent(actions.start, scope_Base, eventTap, {});
            }
            // Fire hover events
            if (behaviour.hover) {
                attachEvent(actions.move, scope_Base, eventHover, { hover: true });
            }
            // Make the range draggable.
            if (behaviour.drag) {
                scope_Connects.forEach(function (connect, index) {
                    if (connect === false || index === 0 || index === scope_Connects.length - 1) {
                        return;
                    }
                    var handleBefore = scope_Handles[index - 1];
                    var handleAfter = scope_Handles[index];
                    var eventHolders = [connect];
                    addClass(connect, options.cssClasses.draggable);
                    // When the range is fixed, the entire range can
                    // be dragged by the handles. The handle in the first
                    // origin will propagate the start event upward,
                    // but it needs to be bound manually on the other.
                    if (behaviour.fixed) {
                        eventHolders.push(handleBefore.children[0]);
                        eventHolders.push(handleAfter.children[0]);
                    }
                    eventHolders.forEach(function (eventHolder) {
                        attachEvent(actions.start, eventHolder, eventStart, {
                            handles: [
                                handleBefore,
                                handleAfter
                            ],
                            handleNumbers: [
                                index - 1,
                                index
                            ]
                        });
                    });
                });
            }
        }
        // Split out the handle positioning logic so the Move event can use it, too
        function checkHandlePosition(reference, handleNumber, to, lookBackward, lookForward, getValue) {
            // For sliders with multiple handles, limit movement to the other handle.
            // Apply the margin option by adding it to the handle positions.
            if (scope_Handles.length > 1) {
                if (lookBackward && handleNumber > 0) {
                    to = Math.max(to, reference[handleNumber - 1] + options.margin);
                }
                if (lookForward && handleNumber < scope_Handles.length - 1) {
                    to = Math.min(to, reference[handleNumber + 1] - options.margin);
                }
            }
            // The limit option has the opposite effect, limiting handles to a
            // maximum distance from another. Limit must be > 0, as otherwise
            // handles would be unmoveable.
            if (scope_Handles.length > 1 && options.limit) {
                if (lookBackward && handleNumber > 0) {
                    to = Math.min(to, reference[handleNumber - 1] + options.limit);
                }
                if (lookForward && handleNumber < scope_Handles.length - 1) {
                    to = Math.max(to, reference[handleNumber + 1] - options.limit);
                }
            }
            // The padding option keeps the handles a certain distance from the
            // edges of the slider. Padding must be > 0.
            if (options.padding) {
                if (handleNumber === 0) {
                    to = Math.max(to, options.padding);
                }
                if (handleNumber === scope_Handles.length - 1) {
                    to = Math.min(to, 100 - options.padding);
                }
            }
            to = scope_Spectrum.getStep(to);
            // Limit percentage to the 0 - 100 range
            to = limit(to);
            // Return false if handle can't move
            if (to === reference[handleNumber] && !getValue) {
                return false;
            }
            return to;
        }
        function toPct(pct) {
            return pct + '%';
        }
        // Updates scope_Locations and scope_Values, updates visual state
        function updateHandlePosition(handleNumber, to) {
            // Update locations.
            scope_Locations[handleNumber] = to;
            // Convert the value to the slider stepping/range.
            scope_Values[handleNumber] = scope_Spectrum.fromStepping(to);
            // Called synchronously or on the next animationFrame
            var stateUpdate = function () {
                scope_Handles[handleNumber].style[options.style] = toPct(to);
                updateConnect(handleNumber);
                updateConnect(handleNumber + 1);
            };
            // Set the handle to the new position.
            // Use requestAnimationFrame for efficient painting.
            // No significant effect in Chrome, Edge sees dramatic performace improvements.
            // Option to disable is useful for unit tests, and single-step debugging.
            if (window.requestAnimationFrame && options.useRequestAnimationFrame) {
                window.requestAnimationFrame(stateUpdate);
            } else {
                stateUpdate();
            }
        }
        function setZindex() {
            scope_HandleNumbers.forEach(function (handleNumber) {
                // Handles before the slider middle are stacked later = higher,
                // Handles after the middle later is lower
                // [[7] [8] .......... | .......... [5] [4]
                var dir = scope_Locations[handleNumber] > 50 ? -1 : 1;
                var zIndex = 3 + (scope_Handles.length + dir * handleNumber);
                scope_Handles[handleNumber].childNodes[0].style.zIndex = zIndex;
            });
        }
        // Test suggested values and apply margin, step.
        function setHandle(handleNumber, to, lookBackward, lookForward) {
            to = checkHandlePosition(scope_Locations, handleNumber, to, lookBackward, lookForward, false);
            if (to === false) {
                return false;
            }
            updateHandlePosition(handleNumber, to);
            return true;
        }
        // Updates style attribute for connect nodes
        function updateConnect(index) {
            // Skip connects set to false
            if (!scope_Connects[index]) {
                return;
            }
            var l = 0;
            var h = 100;
            if (index !== 0) {
                l = scope_Locations[index - 1];
            }
            if (index !== scope_Connects.length - 1) {
                h = scope_Locations[index];
            }
            scope_Connects[index].style[options.style] = toPct(l);
            scope_Connects[index].style[options.styleOposite] = toPct(100 - h);
        }
        // ...
        function setValue(to, handleNumber) {
            // Setting with null indicates an 'ignore'.
            // Inputting 'false' is invalid.
            if (to === null || to === false) {
                return;
            }
            // If a formatted number was passed, attemt to decode it.
            if (typeof to === 'number') {
                to = String(to);
            }
            to = options.format.from(to);
            // Request an update for all links if the value was invalid.
            // Do so too if setting the handle fails.
            if (to !== false && !isNaN(to)) {
                setHandle(handleNumber, scope_Spectrum.toStepping(to), false, false);
            }
        }
        // Set the slider value.
        function valueSet(input, fireSetEvent) {
            var values = asArray(input);
            var isInit = scope_Locations[0] === undefined;
            // Event fires by default
            fireSetEvent = fireSetEvent === undefined ? true : !!fireSetEvent;
            values.forEach(setValue);
            // Animation is optional.
            // Make sure the initial values were set before using animated placement.
            if (options.animate && !isInit) {
                addClassFor(scope_Target, options.cssClasses.tap, options.animationDuration);
            }
            // Now that all base values are set, apply constraints
            scope_HandleNumbers.forEach(function (handleNumber) {
                setHandle(handleNumber, scope_Locations[handleNumber], true, false);
            });
            setZindex();
            scope_HandleNumbers.forEach(function (handleNumber) {
                fireEvent('update', handleNumber);
                // Fire the event only for handles that received a new value, as per #579
                if (values[handleNumber] !== null && fireSetEvent) {
                    fireEvent('set', handleNumber);
                }
            });
        }
        // Reset slider to initial values
        function valueReset(fireSetEvent) {
            valueSet(options.start, fireSetEvent);
        }
        // Get the slider value.
        function valueGet() {
            var values = scope_Values.map(options.format.to);
            // If only one handle is used, return a single value.
            if (values.length === 1) {
                return values[0];
            }
            return values;
        }
        // Removes classes from the root and empties it.
        function destroy() {
            for (var key in options.cssClasses) {
                if (!options.cssClasses.hasOwnProperty(key)) {
                    continue;
                }
                removeClass(scope_Target, options.cssClasses[key]);
            }
            while (scope_Target.firstChild) {
                scope_Target.removeChild(scope_Target.firstChild);
            }
            delete scope_Target.noUiSlider;
        }
        // Get the current step size for the slider.
        function getCurrentStep() {
            // Check all locations, map them to their stepping point.
            // Get the step point, then find it in the input list.
            return scope_Locations.map(function (location, index) {
                var nearbySteps = scope_Spectrum.getNearbySteps(location);
                var value = scope_Values[index];
                var increment = nearbySteps.thisStep.step;
                var decrement = null;
                // If the next value in this step moves into the next step,
                // the increment is the start of the next step - the current value
                if (increment !== false) {
                    if (value + increment > nearbySteps.stepAfter.startValue) {
                        increment = nearbySteps.stepAfter.startValue - value;
                    }
                }
                // If the value is beyond the starting point
                if (value > nearbySteps.thisStep.startValue) {
                    decrement = nearbySteps.thisStep.step;
                } else if (nearbySteps.stepBefore.step === false) {
                    decrement = false;
                }    // If a handle is at the start of a step, it always steps back into the previous step first
                else {
                    decrement = value - nearbySteps.stepBefore.highestStep;
                }
                // Now, if at the slider edges, there is not in/decrement
                if (location === 100) {
                    increment = null;
                } else if (location === 0) {
                    decrement = null;
                }
                // As per #391, the comparison for the decrement step can have some rounding issues.
                var stepDecimals = scope_Spectrum.countStepDecimals();
                // Round per #391
                if (increment !== null && increment !== false) {
                    increment = Number(increment.toFixed(stepDecimals));
                }
                if (decrement !== null && decrement !== false) {
                    decrement = Number(decrement.toFixed(stepDecimals));
                }
                return [
                    decrement,
                    increment
                ];
            });
        }
        // Attach an event to this slider, possibly including a namespace
        function bindEvent(namespacedEvent, callback) {
            scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
            scope_Events[namespacedEvent].push(callback);
            // If the event bound is 'update,' fire it immediately for all handles.
            if (namespacedEvent.split('.')[0] === 'update') {
                scope_Handles.forEach(function (a, index) {
                    fireEvent('update', index);
                });
            }
        }
        // Undo attachment of event
        function removeEvent(namespacedEvent) {
            var event = namespacedEvent && namespacedEvent.split('.')[0];
            var namespace = event && namespacedEvent.substring(event.length);
            Object.keys(scope_Events).forEach(function (bind) {
                var tEvent = bind.split('.')[0], tNamespace = bind.substring(tEvent.length);
                if ((!event || event === tEvent) && (!namespace || namespace === tNamespace)) {
                    delete scope_Events[bind];
                }
            });
        }
        // Updateable: margin, limit, padding, step, range, animate, snap
        function updateOptions(optionsToUpdate, fireSetEvent) {
            // Spectrum is created using the range, snap, direction and step options.
            // 'snap' and 'step' can be updated.
            // If 'snap' and 'step' are not passed, they should remain unchanged.
            var v = valueGet();
            var updateAble = [
                'margin',
                'limit',
                'padding',
                'range',
                'animate',
                'snap',
                'step',
                'format'
            ];
            // Only change options that we're actually passed to update.
            updateAble.forEach(function (name) {
                if (optionsToUpdate[name] !== undefined) {
                    originalOptions[name] = optionsToUpdate[name];
                }
            });
            var newOptions = testOptions(originalOptions);
            // Load new options into the slider state
            updateAble.forEach(function (name) {
                if (optionsToUpdate[name] !== undefined) {
                    options[name] = newOptions[name];
                }
            });
            scope_Spectrum = newOptions.spectrum;
            // Limit, margin and padding depend on the spectrum but are stored outside of it. (#677)
            options.margin = newOptions.margin;
            options.limit = newOptions.limit;
            options.padding = newOptions.padding;
            // Update pips, removes existing.
            if (options.pips) {
                pips(options.pips);
            }
            // Invalidate the current positioning so valueSet forces an update.
            scope_Locations = [];
            valueSet(optionsToUpdate.start || v, fireSetEvent);
        }
        // Throw an error if the slider was already initialized.
        if (scope_Target.noUiSlider) {
            throw new Error('noUiSlider (' + VERSION + '): Slider was already initialized.');
        }
        // Create the base element, initialise HTML and set classes.
        // Add handles and connect elements.
        addSlider(scope_Target);
        addElements(options.connect, scope_Base);
        scope_Self = {
            destroy: destroy,
            steps: getCurrentStep,
            on: bindEvent,
            off: removeEvent,
            get: valueGet,
            set: valueSet,
            reset: valueReset,
            // Exposed for unit testing, don't use this in your application.
            __moveHandles: function (a, b, c) {
                moveHandles(a, b, scope_Locations, c);
            },
            options: originalOptions,
            // Issue #600, #678
            updateOptions: updateOptions,
            target: scope_Target,
            // Issue #597
            removePips: removePips,
            pips: pips    // Issue #594
        };
        // Attach user events.
        bindSliderEvents(options.events);
        // Use the public value method to set the start values.
        valueSet(options.start);
        if (options.pips) {
            pips(options.pips);
        }
        if (options.tooltips) {
            tooltips();
        }
        aria();
        return scope_Self;
    }
    // Run the standard initializer
    function initialize(target, originalOptions) {
        if (!target || !target.nodeName) {
            throw new Error('noUiSlider (' + VERSION + '): create requires a single element, got: ' + target);
        }
        // Test the options and create the slider environment;
        var options = testOptions(originalOptions, target);
        var api = closure(target, options, originalOptions);
        target.noUiSlider = api;
        return api;
    }
    // Use an object instead of a function for future expansibility;
    return {
        version: VERSION,
        create: initialize
    };
}));},
397: /* pikaday/pikaday */ function(require, module, exports) {
/*!
 * Pikaday
 *
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/dbushell/Pikaday
 */
(function (root, factory) {
    'use strict';
    var moment;
    if (typeof exports === 'object') {
        // CommonJS module
        // Load moment.js as an optional dependency
        try {
            moment = require('moment'    /* moment */);
        } catch (e) {
        }
        module.exports = factory(moment);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function (req) {
            // Load moment.js as an optional dependency
            var id = 'moment';
            try {
                moment = req(id);
            } catch (e) {
            }
            return factory(moment);
        });
    } else {
        root.Pikaday = factory(root.moment);
    }
}(this, function (moment) {
    'use strict';
    /**
     * feature detection and helper functions
     */
    var hasMoment = typeof moment === 'function', hasEventListeners = !!window.addEventListener, document = window.document, sto = window.setTimeout, addEvent = function (el, e, callback, capture) {
            if (hasEventListeners) {
                el.addEventListener(e, callback, !!capture);
            } else {
                el.attachEvent('on' + e, callback);
            }
        }, removeEvent = function (el, e, callback, capture) {
            if (hasEventListeners) {
                el.removeEventListener(e, callback, !!capture);
            } else {
                el.detachEvent('on' + e, callback);
            }
        }, trim = function (str) {
            return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
        }, hasClass = function (el, cn) {
            return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
        }, addClass = function (el, cn) {
            if (!hasClass(el, cn)) {
                el.className = el.className === '' ? cn : el.className + ' ' + cn;
            }
        }, removeClass = function (el, cn) {
            el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
        }, isArray = function (obj) {
            return /Array/.test(Object.prototype.toString.call(obj));
        }, isDate = function (obj) {
            return /Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
        }, isWeekend = function (date) {
            var day = date.getDay();
            return day === 0 || day === 6;
        }, isLeapYear = function (year) {
            // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
        }, getDaysInMonth = function (year, month) {
            return [
                31,
                isLeapYear(year) ? 29 : 28,
                31,
                30,
                31,
                30,
                31,
                31,
                30,
                31,
                30,
                31
            ][month];
        }, setToStartOfDay = function (date) {
            if (isDate(date))
                date.setHours(0, 0, 0, 0);
        }, compareDates = function (a, b) {
            // weak date comparison (use setToStartOfDay(date) to ensure correct result)
            return a.getTime() === b.getTime();
        }, extend = function (to, from, overwrite) {
            var prop, hasProp;
            for (prop in from) {
                hasProp = to[prop] !== undefined;
                if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                    if (isDate(from[prop])) {
                        if (overwrite) {
                            to[prop] = new Date(from[prop].getTime());
                        }
                    } else if (isArray(from[prop])) {
                        if (overwrite) {
                            to[prop] = from[prop].slice(0);
                        }
                    } else {
                        to[prop] = extend({}, from[prop], overwrite);
                    }
                } else if (overwrite || !hasProp) {
                    to[prop] = from[prop];
                }
            }
            return to;
        }, fireEvent = function (el, eventName, data) {
            var ev;
            if (document.createEvent) {
                ev = document.createEvent('HTMLEvents');
                ev.initEvent(eventName, true, false);
                ev = extend(ev, data);
                el.dispatchEvent(ev);
            } else if (document.createEventObject) {
                ev = document.createEventObject();
                ev = extend(ev, data);
                el.fireEvent('on' + eventName, ev);
            }
        }, adjustCalendar = function (calendar) {
            if (calendar.month < 0) {
                calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
                calendar.month += 12;
            }
            if (calendar.month > 11) {
                calendar.year += Math.floor(Math.abs(calendar.month) / 12);
                calendar.month -= 12;
            }
            return calendar;
        },
        /**
     * defaults and localisation
     */
        defaults = {
            // bind the picker to a form field
            field: null,
            // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
            bound: undefined,
            // position of the datepicker, relative to the field (default to bottom & left)
            // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
            position: 'bottom left',
            // automatically fit in the viewport even if it means repositioning from the position option
            reposition: true,
            // the default output format for `.toString()` and `field` value
            format: 'YYYY-MM-DD',
            // the toString function which gets passed a current date object and format
            // and returns a string
            toString: null,
            // used to create date object from current input string
            parse: null,
            // the initial date to view when first opened
            defaultDate: null,
            // make the `defaultDate` the initial selected value
            setDefaultDate: false,
            // first day of week (0: Sunday, 1: Monday etc)
            firstDay: 0,
            // the default flag for moment's strict date parsing
            formatStrict: false,
            // the minimum/earliest date that can be selected
            minDate: null,
            // the maximum/latest date that can be selected
            maxDate: null,
            // number of years either side, or array of upper/lower range
            yearRange: 10,
            // show week numbers at head of row
            showWeekNumber: false,
            // Week picker mode
            pickWholeWeek: false,
            // used internally (don't config outside)
            minYear: 0,
            maxYear: 9999,
            minMonth: undefined,
            maxMonth: undefined,
            startRange: null,
            endRange: null,
            isRTL: false,
            // Additional text to append to the year in the calendar title
            yearSuffix: '',
            // Render the month after year in the calendar title
            showMonthAfterYear: false,
            // Render days of the calendar grid that fall in the next or previous month
            showDaysInNextAndPreviousMonths: false,
            // Allows user to select days that fall in the next or previous month
            enableSelectionDaysInNextAndPreviousMonths: false,
            // how many months are visible
            numberOfMonths: 1,
            // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
            // only used for the first display or when a selected date is not visible
            mainCalendar: 'left',
            // Specify a DOM element to render the calendar in
            container: undefined,
            // Blur field when date is selected
            blurFieldOnSelect: true,
            // internationalization
            i18n: {
                previousMonth: 'Previous Month',
                nextMonth: 'Next Month',
                months: [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ],
                weekdays: [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                ],
                weekdaysShort: [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat'
                ]
            },
            // Theme Classname
            theme: null,
            // events array
            events: [],
            // callback function
            onSelect: null,
            onOpen: null,
            onClose: null,
            onDraw: null
        },
        /**
     * templating functions to abstract HTML rendering
     */
        renderDayName = function (opts, day, abbr) {
            day += opts.firstDay;
            while (day >= 7) {
                day -= 7;
            }
            return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
        }, renderDay = function (opts) {
            var arr = [];
            var ariaSelected = 'false';
            if (opts.isEmpty) {
                if (opts.showDaysInNextAndPreviousMonths) {
                    arr.push('is-outside-current-month');
                    if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
                        arr.push('is-selection-disabled');
                    }
                } else {
                    return '<td class="is-empty"></td>';
                }
            }
            if (opts.isDisabled) {
                arr.push('is-disabled');
            }
            if (opts.isToday) {
                arr.push('is-today');
            }
            if (opts.isSelected) {
                arr.push('is-selected');
                ariaSelected = 'true';
            }
            if (opts.hasEvent) {
                arr.push('has-event');
            }
            if (opts.isInRange) {
                arr.push('is-inrange');
            }
            if (opts.isStartRange) {
                arr.push('is-startrange');
            }
            if (opts.isEndRange) {
                arr.push('is-endrange');
            }
            return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' + '<button class="pika-button pika-day" type="button" ' + 'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' + opts.day + '</button>' + '</td>';
        }, renderWeek = function (d, m, y) {
            // Lifted from http://javascript.about.com/library/blweekyear.htm, lightly modified.
            var onejan = new Date(y, 0, 1), weekNum = Math.ceil(((new Date(y, m, d) - onejan) / 86400000 + onejan.getDay() + 1) / 7);
            return '<td class="pika-week">' + weekNum + '</td>';
        }, renderRow = function (days, isRTL, pickWholeWeek, isRowSelected) {
            return '<tr class="pika-row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
        }, renderBody = function (rows) {
            return '<tbody>' + rows.join('') + '</tbody>';
        }, renderHead = function (opts) {
            var i, arr = [];
            if (opts.showWeekNumber) {
                arr.push('<th></th>');
            }
            for (i = 0; i < 7; i++) {
                arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
            }
            return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
        }, renderTitle = function (instance, c, year, month, refYear, randId) {
            var i, j, arr, opts = instance._o, isMinYear = year === opts.minYear, isMaxYear = year === opts.maxYear, html = '<div id="' + randId + '" class="pika-title" role="heading" aria-live="assertive">', monthHtml, yearHtml, prev = true, next = true;
            for (arr = [], i = 0; i < 12; i++) {
                arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
            }
            monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';
            if (isArray(opts.yearRange)) {
                i = opts.yearRange[0];
                j = opts.yearRange[1] + 1;
            } else {
                i = year - opts.yearRange;
                j = 1 + year + opts.yearRange;
            }
            for (arr = []; i < j && i <= opts.maxYear; i++) {
                if (i >= opts.minYear) {
                    arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + i + '</option>');
                }
            }
            yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';
            if (opts.showMonthAfterYear) {
                html += yearHtml + monthHtml;
            } else {
                html += monthHtml + yearHtml;
            }
            if (isMinYear && (month === 0 || opts.minMonth >= month)) {
                prev = false;
            }
            if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
                next = false;
            }
            if (c === 0) {
                html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
            }
            if (c === instance._o.numberOfMonths - 1) {
                html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
            }
            return html += '</div>';
        }, renderTable = function (opts, data, randId) {
            return '<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>';
        },
        /**
     * Pikaday constructor
     */
        Pikaday = function (options) {
            var self = this, opts = self.config(options);
            self._onMouseDown = function (e) {
                if (!self._v) {
                    return;
                }
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (!target) {
                    return;
                }
                if (!hasClass(target, 'is-disabled')) {
                    if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
                        self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                        if (opts.bound) {
                            sto(function () {
                                self.hide();
                                if (opts.blurFieldOnSelect && opts.field) {
                                    opts.field.blur();
                                }
                            }, 100);
                        }
                    } else if (hasClass(target, 'pika-prev')) {
                        self.prevMonth();
                    } else if (hasClass(target, 'pika-next')) {
                        self.nextMonth();
                    }
                }
                if (!hasClass(target, 'pika-select')) {
                    // if this is touch event prevent mouse events emulation
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                        return false;
                    }
                } else {
                    self._c = true;
                }
            };
            self._onChange = function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                if (!target) {
                    return;
                }
                if (hasClass(target, 'pika-select-month')) {
                    self.gotoMonth(target.value);
                } else if (hasClass(target, 'pika-select-year')) {
                    self.gotoYear(target.value);
                }
            };
            self._onKeyChange = function (e) {
                e = e || window.event;
                if (self.isVisible()) {
                    switch (e.keyCode) {
                    case 13:
                    case 27:
                        if (opts.field) {
                            opts.field.blur();
                        }
                        break;
                    case 37:
                        e.preventDefault();
                        self.adjustDate('subtract', 1);
                        break;
                    case 38:
                        self.adjustDate('subtract', 7);
                        break;
                    case 39:
                        self.adjustDate('add', 1);
                        break;
                    case 40:
                        self.adjustDate('add', 7);
                        break;
                    }
                }
            };
            self._onInputChange = function (e) {
                var date;
                if (e.firedBy === self) {
                    return;
                }
                if (opts.parse) {
                    date = opts.parse(opts.field.value, opts.format);
                } else if (hasMoment) {
                    date = moment(opts.field.value, opts.format, opts.formatStrict);
                    date = date && date.isValid() ? date.toDate() : null;
                } else {
                    date = new Date(Date.parse(opts.field.value));
                }
                if (isDate(date)) {
                    self.setDate(date);
                }
                if (!self._v) {
                    self.show();
                }
            };
            self._onInputFocus = function () {
                self.show();
            };
            self._onInputClick = function () {
                self.show();
            };
            self._onInputBlur = function () {
                // IE allows pika div to gain focus; catch blur the input field
                var pEl = document.activeElement;
                do {
                    if (hasClass(pEl, 'pika-single')) {
                        return;
                    }
                } while (pEl = pEl.parentNode);
                if (!self._c) {
                    self._b = sto(function () {
                        self.hide();
                    }, 50);
                }
                self._c = false;
            };
            self._onClick = function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement, pEl = target;
                if (!target) {
                    return;
                }
                if (!hasEventListeners && hasClass(target, 'pika-select')) {
                    if (!target.onchange) {
                        target.setAttribute('onchange', 'return;');
                        addEvent(target, 'change', self._onChange);
                    }
                }
                do {
                    if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                        return;
                    }
                } while (pEl = pEl.parentNode);
                if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                    self.hide();
                }
            };
            self.el = document.createElement('div');
            self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');
            addEvent(self.el, 'mousedown', self._onMouseDown, true);
            addEvent(self.el, 'touchend', self._onMouseDown, true);
            addEvent(self.el, 'change', self._onChange);
            addEvent(document, 'keydown', self._onKeyChange);
            if (opts.field) {
                if (opts.container) {
                    opts.container.appendChild(self.el);
                } else if (opts.bound) {
                    document.body.appendChild(self.el);
                } else {
                    opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
                }
                addEvent(opts.field, 'change', self._onInputChange);
                if (!opts.defaultDate) {
                    if (hasMoment && opts.field.value) {
                        opts.defaultDate = moment(opts.field.value, opts.format).toDate();
                    } else {
                        opts.defaultDate = new Date(Date.parse(opts.field.value));
                    }
                    opts.setDefaultDate = true;
                }
            }
            var defDate = opts.defaultDate;
            if (isDate(defDate)) {
                if (opts.setDefaultDate) {
                    self.setDate(defDate, true);
                } else {
                    self.gotoDate(defDate);
                }
            } else {
                self.gotoDate(new Date());
            }
            if (opts.bound) {
                this.hide();
                self.el.className += ' is-bound';
                addEvent(opts.trigger, 'click', self._onInputClick);
                addEvent(opts.trigger, 'focus', self._onInputFocus);
                addEvent(opts.trigger, 'blur', self._onInputBlur);
            } else {
                this.show();
            }
        };
    /**
     * public Pikaday API
     */
    Pikaday.prototype = {
        /**
         * configure functionality
         */
        config: function (options) {
            if (!this._o) {
                this._o = extend({}, defaults, true);
            }
            var opts = extend(this._o, options, true);
            opts.isRTL = !!opts.isRTL;
            opts.field = opts.field && opts.field.nodeName ? opts.field : null;
            opts.theme = typeof opts.theme === 'string' && opts.theme ? opts.theme : null;
            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);
            opts.trigger = opts.trigger && opts.trigger.nodeName ? opts.trigger : opts.field;
            opts.disableWeekends = !!opts.disableWeekends;
            opts.disableDayFn = typeof opts.disableDayFn === 'function' ? opts.disableDayFn : null;
            var nom = parseInt(opts.numberOfMonths, 10) || 1;
            opts.numberOfMonths = nom > 4 ? 4 : nom;
            if (!isDate(opts.minDate)) {
                opts.minDate = false;
            }
            if (!isDate(opts.maxDate)) {
                opts.maxDate = false;
            }
            if (opts.minDate && opts.maxDate && opts.maxDate < opts.minDate) {
                opts.maxDate = opts.minDate = false;
            }
            if (opts.minDate) {
                this.setMinDate(opts.minDate);
            }
            if (opts.maxDate) {
                this.setMaxDate(opts.maxDate);
            }
            if (isArray(opts.yearRange)) {
                var fallback = new Date().getFullYear() - 10;
                opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
            } else {
                opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                if (opts.yearRange > 100) {
                    opts.yearRange = 100;
                }
            }
            return opts;
        },
        /**
         * return a formatted string of the current selection (using Moment.js if available)
         */
        toString: function (format) {
            format = format || this._o.format;
            if (!isDate(this._d)) {
                return '';
            }
            if (this._o.toString) {
                return this._o.toString(this._d, format);
            }
            if (hasMoment) {
                return moment(this._d).format(format);
            }
            return this._d.toDateString();
        },
        /**
         * return a Moment.js object of the current selection (if available)
         */
        getMoment: function () {
            return hasMoment ? moment(this._d) : null;
        },
        /**
         * set the current selection from a Moment.js object (if available)
         */
        setMoment: function (date, preventOnSelect) {
            if (hasMoment && moment.isMoment(date)) {
                this.setDate(date.toDate(), preventOnSelect);
            }
        },
        /**
         * return a Date object of the current selection
         */
        getDate: function () {
            return isDate(this._d) ? new Date(this._d.getTime()) : null;
        },
        /**
         * set the current selection
         */
        setDate: function (date, preventOnSelect) {
            if (!date) {
                this._d = null;
                if (this._o.field) {
                    this._o.field.value = '';
                    fireEvent(this._o.field, 'change', { firedBy: this });
                }
                return this.draw();
            }
            if (typeof date === 'string') {
                date = new Date(Date.parse(date));
            }
            if (!isDate(date)) {
                return;
            }
            var min = this._o.minDate, max = this._o.maxDate;
            if (isDate(min) && date < min) {
                date = min;
            } else if (isDate(max) && date > max) {
                date = max;
            }
            this._d = new Date(date.getTime());
            setToStartOfDay(this._d);
            this.gotoDate(this._d);
            if (this._o.field) {
                this._o.field.value = this.toString();
                fireEvent(this._o.field, 'change', { firedBy: this });
            }
            if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.getDate());
            }
        },
        /**
         * change view to a specific date
         */
        gotoDate: function (date) {
            var newCalendar = true;
            if (!isDate(date)) {
                return;
            }
            if (this.calendars) {
                var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1), lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1), visibleDate = date.getTime();
                // get the end of the month
                lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
                lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
                newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
            }
            if (newCalendar) {
                this.calendars = [{
                        month: date.getMonth(),
                        year: date.getFullYear()
                    }];
                if (this._o.mainCalendar === 'right') {
                    this.calendars[0].month += 1 - this._o.numberOfMonths;
                }
            }
            this.adjustCalendars();
        },
        adjustDate: function (sign, days) {
            var day = this.getDate() || new Date();
            var difference = parseInt(days) * 24 * 60 * 60 * 1000;
            var newDay;
            if (sign === 'add') {
                newDay = new Date(day.valueOf() + difference);
            } else if (sign === 'subtract') {
                newDay = new Date(day.valueOf() - difference);
            }
            this.setDate(newDay);
        },
        adjustCalendars: function () {
            this.calendars[0] = adjustCalendar(this.calendars[0]);
            for (var c = 1; c < this._o.numberOfMonths; c++) {
                this.calendars[c] = adjustCalendar({
                    month: this.calendars[0].month + c,
                    year: this.calendars[0].year
                });
            }
            this.draw();
        },
        gotoToday: function () {
            this.gotoDate(new Date());
        },
        /**
         * change view to a specific month (zero-index, e.g. 0: January)
         */
        gotoMonth: function (month) {
            if (!isNaN(month)) {
                this.calendars[0].month = parseInt(month, 10);
                this.adjustCalendars();
            }
        },
        nextMonth: function () {
            this.calendars[0].month++;
            this.adjustCalendars();
        },
        prevMonth: function () {
            this.calendars[0].month--;
            this.adjustCalendars();
        },
        /**
         * change view to a specific full year (e.g. "2012")
         */
        gotoYear: function (year) {
            if (!isNaN(year)) {
                this.calendars[0].year = parseInt(year, 10);
                this.adjustCalendars();
            }
        },
        /**
         * change the minDate
         */
        setMinDate: function (value) {
            if (value instanceof Date) {
                setToStartOfDay(value);
                this._o.minDate = value;
                this._o.minYear = value.getFullYear();
                this._o.minMonth = value.getMonth();
            } else {
                this._o.minDate = defaults.minDate;
                this._o.minYear = defaults.minYear;
                this._o.minMonth = defaults.minMonth;
                this._o.startRange = defaults.startRange;
            }
            this.draw();
        },
        /**
         * change the maxDate
         */
        setMaxDate: function (value) {
            if (value instanceof Date) {
                setToStartOfDay(value);
                this._o.maxDate = value;
                this._o.maxYear = value.getFullYear();
                this._o.maxMonth = value.getMonth();
            } else {
                this._o.maxDate = defaults.maxDate;
                this._o.maxYear = defaults.maxYear;
                this._o.maxMonth = defaults.maxMonth;
                this._o.endRange = defaults.endRange;
            }
            this.draw();
        },
        setStartRange: function (value) {
            this._o.startRange = value;
        },
        setEndRange: function (value) {
            this._o.endRange = value;
        },
        /**
         * refresh the HTML
         */
        draw: function (force) {
            if (!this._v && !force) {
                return;
            }
            var opts = this._o, minYear = opts.minYear, maxYear = opts.maxYear, minMonth = opts.minMonth, maxMonth = opts.maxMonth, html = '', randId;
            if (this._y <= minYear) {
                this._y = minYear;
                if (!isNaN(minMonth) && this._m < minMonth) {
                    this._m = minMonth;
                }
            }
            if (this._y >= maxYear) {
                this._y = maxYear;
                if (!isNaN(maxMonth) && this._m > maxMonth) {
                    this._m = maxMonth;
                }
            }
            randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);
            for (var c = 0; c < opts.numberOfMonths; c++) {
                html += '<div class="pika-lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
            }
            this.el.innerHTML = html;
            if (opts.bound) {
                if (opts.field.type !== 'hidden') {
                    sto(function () {
                        opts.trigger.focus();
                    }, 1);
                }
            }
            if (typeof this._o.onDraw === 'function') {
                this._o.onDraw(this);
            }
            if (opts.bound) {
                // let the screen reader user know to use arrow keys
                opts.field.setAttribute('aria-label', 'Use the arrow keys to pick a date');
            }
        },
        adjustPosition: function () {
            var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect;
            if (this._o.container)
                return;
            this.el.style.position = 'absolute';
            field = this._o.trigger;
            pEl = field;
            width = this.el.offsetWidth;
            height = this.el.offsetHeight;
            viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top = pEl.offsetTop + pEl.offsetHeight;
                while (pEl = pEl.offsetParent) {
                    left += pEl.offsetLeft;
                    top += pEl.offsetTop;
                }
            }
            // default position is bottom & left
            if (this._o.reposition && left + width > viewportWidth || this._o.position.indexOf('right') > -1 && left - width + field.offsetWidth > 0) {
                left = left - width + field.offsetWidth;
            }
            if (this._o.reposition && top + height > viewportHeight + scrollTop || this._o.position.indexOf('top') > -1 && top - height - field.offsetHeight > 0) {
                top = top - height - field.offsetHeight;
            }
            this.el.style.left = left + 'px';
            this.el.style.top = top + 'px';
        },
        /**
         * render HTML for a particular month
         */
        render: function (year, month, randId) {
            var opts = this._o, now = new Date(), days = getDaysInMonth(year, month), before = new Date(year, month, 1).getDay(), data = [], row = [];
            setToStartOfDay(now);
            if (opts.firstDay > 0) {
                before -= opts.firstDay;
                if (before < 0) {
                    before += 7;
                }
            }
            var previousMonth = month === 0 ? 11 : month - 1, nextMonth = month === 11 ? 0 : month + 1, yearOfPreviousMonth = month === 0 ? year - 1 : year, yearOfNextMonth = month === 11 ? year + 1 : year, daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
            var cells = days + before, after = cells;
            while (after > 7) {
                after -= 7;
            }
            cells += 7 - after;
            var isWeekSelected = false;
            for (var i = 0, r = 0; i < cells; i++) {
                var day = new Date(year, month, 1 + (i - before)), isSelected = isDate(this._d) ? compareDates(day, this._d) : false, isToday = compareDates(day, now), hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false, isEmpty = i < before || i >= days + before, dayNumber = 1 + (i - before), monthNumber = month, yearNumber = year, isStartRange = opts.startRange && compareDates(opts.startRange, day), isEndRange = opts.endRange && compareDates(opts.endRange, day), isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange, isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);
                if (isEmpty) {
                    if (i < before) {
                        dayNumber = daysInPreviousMonth + dayNumber;
                        monthNumber = previousMonth;
                        yearNumber = yearOfPreviousMonth;
                    } else {
                        dayNumber = dayNumber - days;
                        monthNumber = nextMonth;
                        yearNumber = yearOfNextMonth;
                    }
                }
                var dayConfig = {
                    day: dayNumber,
                    month: monthNumber,
                    year: yearNumber,
                    hasEvent: hasEvent,
                    isSelected: isSelected,
                    isToday: isToday,
                    isDisabled: isDisabled,
                    isEmpty: isEmpty,
                    isStartRange: isStartRange,
                    isEndRange: isEndRange,
                    isInRange: isInRange,
                    showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
                    enableSelectionDaysInNextAndPreviousMonths: opts.enableSelectionDaysInNextAndPreviousMonths
                };
                if (opts.pickWholeWeek && isSelected) {
                    isWeekSelected = true;
                }
                row.push(renderDay(dayConfig));
                if (++r === 7) {
                    if (opts.showWeekNumber) {
                        row.unshift(renderWeek(i - before, month, year));
                    }
                    data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected));
                    row = [];
                    r = 0;
                    isWeekSelected = false;
                }
            }
            return renderTable(opts, data, randId);
        },
        isVisible: function () {
            return this._v;
        },
        show: function () {
            if (!this.isVisible()) {
                this._v = true;
                this.draw();
                removeClass(this.el, 'is-hidden');
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                    this.adjustPosition();
                }
                if (typeof this._o.onOpen === 'function') {
                    this._o.onOpen.call(this);
                }
            }
        },
        hide: function () {
            var v = this._v;
            if (v !== false) {
                if (this._o.bound) {
                    removeEvent(document, 'click', this._onClick);
                }
                this.el.style.position = 'static';
                // reset
                this.el.style.left = 'auto';
                this.el.style.top = 'auto';
                addClass(this.el, 'is-hidden');
                this._v = false;
                if (v !== undefined && typeof this._o.onClose === 'function') {
                    this._o.onClose.call(this);
                }
            }
        },
        /**
         * GAME OVER
         */
        destroy: function () {
            this.hide();
            removeEvent(this.el, 'mousedown', this._onMouseDown, true);
            removeEvent(this.el, 'touchend', this._onMouseDown, true);
            removeEvent(this.el, 'change', this._onChange);
            removeEvent(document, 'keydown', this._onKeyChange);
            if (this._o.field) {
                removeEvent(this._o.field, 'change', this._onInputChange);
                if (this._o.bound) {
                    removeEvent(this._o.trigger, 'click', this._onInputClick);
                    removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                    removeEvent(this._o.trigger, 'blur', this._onInputBlur);
                }
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }
    };
    return Pikaday;
}));}
}, {"models/widgets/abstract_button":365,"models/widgets/abstract_icon":366,"models/widgets/abstract_slider":367,"models/widgets/autocomplete_input":368,"models/widgets/button":369,"models/widgets/checkbox_button_group":370,"models/widgets/checkbox_group":371,"models/widgets/common":372,"models/widgets/date_picker":373,"models/widgets/date_range_slider":374,"models/widgets/date_slider":375,"models/widgets/div":376,"models/widgets/dropdown":377,"models/widgets/index":378,"models/widgets/input_widget":379,"models/widgets/main":380,"models/widgets/markup":381,"models/widgets/multiselect":382,"models/widgets/panel":383,"models/widgets/paragraph":384,"models/widgets/password_input":385,"models/widgets/pretext":386,"models/widgets/radio_button_group":387,"models/widgets/radio_group":388,"models/widgets/range_slider":389,"models/widgets/selectbox":390,"models/widgets/slider":391,"models/widgets/tabs":392,"models/widgets/text_input":393,"models/widgets/toggle":394,"models/widgets/widget":405}, 380);
})

//# sourceMappingURL=bokeh-widgets.js.map
