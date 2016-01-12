!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.markdownItAttrs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var utils = require('./utils.js');

module.exports = function attributes(md) {

  function curlyAttrs(state){
    var tokens = state.tokens;
    var l = tokens.length;
    for (var i = 0; i < l; ++i) {
      // block tokens contain markup
      // inline tokens contain the text
      if (tokens[i].type !== 'inline') {
        continue;
      }

      var inlineTokens = tokens[i].children;
      if (!inlineTokens || inlineTokens.length <= 0) {
        continue;
      }

      // attributes in inline tokens
      for (var j=0, k=inlineTokens.length; j<k; ++j) {
        // should be inline token of type text
        if (!inlineTokens[j] || inlineTokens[j].type !== 'text') {
          continue;
        }
        // token before should not be opening
        if (!inlineTokens[j - 1] || inlineTokens[j - 1].nesting === 1) {
          continue;
        }
        // token should contain { in begining
        if (inlineTokens[j].content[0] !== '{') {
          continue;
        }
        // } should be found
        var endChar = inlineTokens[j].content.indexOf('}');
        if (endChar === -1) {
          continue;
        }
        // which token to add attributes to
        var attrToken = matchingOpeningToken(inlineTokens, j - 1);
        if (!attrToken) {
          continue;
        }
        var attrs = utils.getAttrs(inlineTokens[j].content, 1, endChar);
        if (attrs.length !== 0) {
          // remove {}
          inlineTokens[j].content = inlineTokens[j].content.substr(endChar + 1);
          // add attributes
          attrToken.info = "b";
          utils.addAttrs(attrs, attrToken);
        }
      }

      // attributes for blocks
      if (hasCurlyEnd(tokens[i])) {
        var content = last(inlineTokens).content;
        var curlyStart = content.lastIndexOf('{');
        var attrs = utils.getAttrs(content, curlyStart + 1, content.length - 1);
        // some blocks are hidden, example li > paragraph_open
        utils.addAttrs(attrs, firstTokenNotHidden(tokens, i - 1));
        if (content[curlyStart - 1] === ' ') {
          // trim space before {}
          curlyStart -= 1;
        }
        last(inlineTokens).content = content.slice(0, curlyStart);
      }

    }
  }
  md.core.ruler.push('curly_attributes', curlyAttrs);
  // render inline code blocks with attrs
  md.renderer.rules.code_inline = renderCodeInline;
};

function renderCodeInline(tokens, idx, _, __, slf) {
  var token = tokens[idx];
  return '<code'+ slf.renderAttrs(token) +'>'
       + utils.escapeHtml(tokens[idx].content)
       + '</code>';
}
/**
 * test if inline token has proper formated curly end
 */
function hasCurlyEnd(token) {
  // we need minimum four chars, example {.b}
  if (!token.content || token.content.length < 4) {
    return false;
  }

  // should end in }
  var content = token.content;
  if (content.charAt(content.length - 1) !== '}') {
    return false;
  }

  // should start with {
  var curlyStart = content.indexOf('{');
  if (curlyStart === -1) {
    return false;
  }
  return true;
}

/**
 * some blocks are hidden (not rendered)
 */
function firstTokenNotHidden(tokens, i) {
  if (tokens[i].hidden) {
    return firstTokenNotHidden(tokens, i - 1);
  }
  return tokens[i];
}

/**
 * find corresponding opening block
 */
function matchingOpeningToken(tokens, i) {
  if (tokens[i].type === 'softbreak') {
    return false;
  }
  // non closing blocks, example img
  if (tokens[i].nesting === 0) {
    return tokens[i];
  }
  var type = tokens[i].type.replace('_close', '_open');
  for (; i >= 0; --i) {
    if (tokens[i].type === type) {
      return tokens[i];
    }
  }
}

function last(arr) {
  return arr.slice(-1)[0];
}

},{"./utils.js":2}],2:[function(require,module,exports){
/**
 * parse {.class #id key=val} strings
 * @param {string} str: string to parse
 * @param {int} start: where to start parsing (not including {)
 * @param {int} end: where to stop parsing (not including })
 * @returns {2d array}: [['key', 'val'], ['class', 'red']]
 */
exports.getAttrs = function(str, start, end) {
  // not tab, line feed, form feed, space, solidus, greater than sign, quotation mark, apostrophe and equals sign
  var allowedKeyChars = /[^\t\n\f \/>"'=]/;
  var pairSeparator = ' ';
  var keySeparator = '=';
  var classChar = '.';
  var idChar = '#';

  var attrs = [];
  var key = '';
  var value = '';
  var parsingKey = true;
  var valueInsideQuotes = false;

  // read inside {}
  for (var i=start; i <= end; ++i) {
    var char = str.charAt(i);

    // switch to reading value if equal sign
    if (char === keySeparator) {
      parsingKey = false;
      continue;
    }

    // {.class}
    if (char === classChar && key === '') {
      key = 'class';
      parsingKey = false;
      continue;
    }

    // {#id}
    if (char === idChar && key === '') {
      key = 'id';
      parsingKey = false;
      continue;
    }

    // {value="inside quotes"}
    if (char === '"' && value === '') {
      valueInsideQuotes = true;
      continue;
    }
    if (char === '"' && valueInsideQuotes) {
      valueInsideQuotes = false;
      continue;
    }

    // read next key/value pair
    if ((char === pairSeparator && !valueInsideQuotes) || i === end) {
      attrs.push([key, value]);
      key = '';
      value = '';
      parsingKey = true;
      continue;
    }

    // continue if character not allowed
    if (parsingKey && char.search(allowedKeyChars) === -1) {
      continue;
    }

    // no other conditions met; append to key/value
    if (parsingKey) {
      key += char;
      continue;
    }
    value += char;
  }
  return attrs;
}

/**
 * add attributes from [['key', 'val']] list
 * @param {array} attrs: [['key', 'val']]
 * @param {token} token: which token to add attributes
 * @returns token
 */
exports.addAttrs = function(attrs, token) {
  for (var j=0, l=attrs.length; j<l; ++j) {
    var key = attrs[j][0];
    if (key === 'class' && token.attrIndex('class') !== -1) {
      // append space seperated text string
      var classIdx = token.attrIndex('class');
      token.attrs[classIdx][1] += ' ' + attrs[j][1];
    } else {
      token.attrPush(attrs[j]);
    }
  }
  return token;
}

/**
 * from https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js
 */
var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

exports.escapeHtml = function(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

},{}]},{},[1])(1)
});