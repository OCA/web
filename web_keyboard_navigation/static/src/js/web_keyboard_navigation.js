odoo.define('web_keyboard_navigation.KeyboardNavigationMixin', function (
    require) {
    "use strict";
    var BrowserDetection = require('web.BrowserDetection');

    /**
     * List of the key that should not be used as accesskeys.
     * Either because we want to reserve them for a specific behavior in Odoo
     * or because they will not work in certain browser/OS
     */
    var knownUnusableAccessKeys = [' ',
        'A',
        'C',
        'H',
        'J',
        'K',
        'L',
        'N',
        'P',
        'S',
        'Q',
        'E',
        'F',
        'D',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    ];

    var KeyboardNavigationMixin = {
        events: {
            'keydown': '_onKeyDown',
            'keyup': '_onKeyUp',
        },

        init: function () {
            this._super();
            this._areAccessKeyVisible = false;
            this.BrowserDetection = new BrowserDetection();
        },

        _addAccessKeyOverlays: function () {
            var accesskeyElements = $(document).find('[accesskey]').filter(
                ':visible');
            _.each(accesskeyElements, function (elem) {
                var overlay = $(_.str.sprintf(
                    "<div class='o_web_accesskey_overlay'>%s</div>",
                    $(elem).attr('accesskey').toUpperCase()));
                var $overlayParent = null;
                if (elem.tagName.toUpperCase() === "INPUT") {
                    $overlayParent = $(elem).parent();
                } else {
                    $overlayParent = $(elem);
                }
                if ($overlayParent.css('position') !== 'absolute') {
                    $overlayParent.css('position', 'relative');
                }
                overlay.appendTo($overlayParent);
            });
        },

        _getAllUsedAccessKeys: function () {
            var usedAccessKeys = knownUnusableAccessKeys.slice();
            this.$el.find('[accesskey]').each(function (_, elem) {
                usedAccessKeys.push(elem.accessKey.toUpperCase());
            });
            return usedAccessKeys;
        },

        _hideAccessKeyOverlay: function () {
            this._areAccessKeyVisible = false;
            var overlays = this.$el.find('.o_web_accesskey_overlay');
            if (overlays.length) {
                return overlays.remove();
            }
        },

        _setAccessKeyOnTopNavigation: function () {
            this.$el.find(
                '.o_menu_sections>li>a').each(function (number, item) {
                item.accessKey = number + 1;
            });
        },

        _onKeyDown: function (keyDownEvent) {
            if ($('body.o_ui_blocked').length &&
            (keyDownEvent.altKey || keyDownEvent.key === 'Alt') &&
            !keyDownEvent.ctrlKey) {
                if (keyDownEvent.preventDefault) {
                    keyDownEvent.preventDefault();
                } else {
                    keyDownEvent.returnValue = false;
                }
                if (keyDownEvent.stopPropagation) {
                    keyDownEvent.stopPropagation();
                }
                if (keyDownEvent.cancelBubble) {
                    keyDownEvent.cancelBubble = true;
                }
                return false;
            }
            if (!this._areAccessKeyVisible &&
                (keyDownEvent.altKey || keyDownEvent.key === 'Alt') &&
                !keyDownEvent.ctrlKey) {
                this._areAccessKeyVisible = true;
                this._setAccessKeyOnTopNavigation();
                var usedAccessKey = this._getAllUsedAccessKeys();
                var buttonsWithoutAccessKey = this.$el.find(
                    'button.btn:visible')
                    .not('[accesskey]')
                    .not('[disabled]')
                    .not('[tabindex="-1"]');
                _.each(buttonsWithoutAccessKey, function (elem) {
                    var buttonString = [elem.innerText, elem.title,
                        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"].join('');
                    for (var letterIndex = 0;
                        letterIndex < buttonString.length;
                        letterIndex++) {
                        var candidateAccessKey = buttonString[
                            letterIndex].toUpperCase();
                        if (candidateAccessKey >= 'A' &&
                                candidateAccessKey <= 'Z' &&
                                !_.includes(usedAccessKey,
                                    candidateAccessKey)) {
                            elem.accessKey = candidateAccessKey;
                            usedAccessKey.push(candidateAccessKey);
                            break;
                        }
                    }
                });
                var elementsWithoutAriaKeyshortcut = this.$el.find(
                    '[accesskey]').not('[aria-keyshortcuts]');
                _.each(elementsWithoutAriaKeyshortcut, function (elem) {
                    elem.setAttribute(
                        'aria-keyshortcuts', 'Alt+Shift+' + elem.accessKey);
                });
                this._addAccessKeyOverlays();
            }
            if (this.BrowserDetection.isOsMac()) {
                return;
            }
            if (keyDownEvent.altKey &&
                    !keyDownEvent.ctrlKey &&
                    keyDownEvent.key.length === 1) {
                var elementWithAccessKey = [];
                if (keyDownEvent.keyCode >= 65 &&
                        keyDownEvent.keyCode <= 90 ||
                        keyDownEvent.keyCode >= 97 &&
                        keyDownEvent.keyCode <= 122) {
                    elementWithAccessKey = document.querySelectorAll(
                        '[accesskey="' + String.fromCharCode(
                            keyDownEvent.keyCode).toLowerCase() +
                        '"], [accesskey="' + String.fromCharCode(
                            keyDownEvent.keyCode).toUpperCase() + '"]');
                    if (elementWithAccessKey.length) {
                        if (this.BrowserDetection.isOsMac() ||
                            !this.BrowserDetection.isBrowserChrome()) {
                            elementWithAccessKey[0].focus();
                            elementWithAccessKey[0].click();
                            if (keyDownEvent.preventDefault) {
                                keyDownEvent.preventDefault();
                            } else {
                                keyDownEvent.returnValue = false;
                            }
                            if (keyDownEvent.stopPropagation) {
                                keyDownEvent.stopPropagation();
                            }
                            if (keyDownEvent.cancelBubble) {
                                keyDownEvent.cancelBubble = true;
                            }
                            return false;
                        }
                    }
                    }
                else {
                    var numberKey = null;
                    if (keyDownEvent.originalEvent.code &&
                            keyDownEvent.originalEvent.code.indexOf(
                                'Digit') === 0) {
                        numberKey = keyDownEvent.originalEvent.code[
                            keyDownEvent.originalEvent.code.length - 1];
                    } else if (keyDownEvent.originalEvent.key &&
                        keyDownEvent.originalEvent.key.length === 1 &&
                        keyDownEvent.originalEvent.key >= '0' &&
                        keyDownEvent.originalEvent.key <= '9') {
                        numberKey = keyDownEvent.originalEvent.key;
                    } else if (
                        keyDownEvent.keyCode >= 48 &&
                            keyDownEvent.keyCode <= 57) {
                        numberKey = keyDownEvent.keyCode - 48;
                    }
                    if (numberKey >= '0' && numberKey <= '9') {
                        elementWithAccessKey = document.querySelectorAll(
                            '[accesskey="' + numberKey + '"]');
                        if (elementWithAccessKey.length) {
                            elementWithAccessKey[0].click();
                            if (keyDownEvent.preventDefault) {
                                keyDownEvent.preventDefault();
                            } else {
                                keyDownEvent.returnValue = false;
                            }
                            if (keyDownEvent.stopPropagation) {
                                keyDownEvent.stopPropagation();
                            }
                            if (keyDownEvent.cancelBubble) {
                                keyDownEvent.cancelBubble = true;
                            }
                            return false;
                        }
                    }
                }
            }
        },

        _onKeyUp: function (keyUpEvent) {
            if ((keyUpEvent.altKey || keyUpEvent.key === 'Alt') &&
                    !keyUpEvent.ctrlKey) {
                this._hideAccessKeyOverlay();
                if (keyUpEvent.preventDefault) {
                    keyUpEvent.preventDefault();
                }
                else {
                    keyUpEvent.returnValue = false;
                }
                if (keyUpEvent.stopPropagation) {
                    keyUpEvent.stopPropagation();
                }
                if (keyUpEvent.cancelBubble) {
                    keyUpEvent.cancelBubble = true;
                }
                return false;
            }
        },
    };

    return KeyboardNavigationMixin;

});

