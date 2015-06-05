'use strict';

App.run(['$window', 'CONST',
    function($window, CONST) {
        var isShowLog = CONST && CONST.debug;

        var showLogBtnPosition = {
            offsetX: 0,
            offsetY: 0,
            radius: 12
        };

        if (isShowLog && !document.querySelector('#debugger')) {
            var isNativeConsole = !!$window['console'];
            var console = isNativeConsole ? $window.console : $window.console = {};

            (function() {
                var debugEl = document.querySelector('#debugger');
                debugEl = document.createElement('div');
                debugEl.id = 'debugger';
                debugEl.className = 'debugger';
                debugEl.innerHTML = '<div id="logger" class="logger"></div><div id="debugger-switcher"></div><div class="input-line"><input id="console-input" type="text" class="console-input" placeholder=">"></div><div class="clear-btn"><button>Clear</button></div>';
                document.body.appendChild(debugEl);
                var loggerEl = document.querySelector('#logger'),
                    input = document.querySelector('#console-input'),
                    debugSwitchEl = document.querySelector('#debugger-switcher');
                debugEl.querySelector('button').onclick = function() {
                    loggerEl.innerHTML = '';
                    debugSwitchEl.style.zoom = 1;
                };
                var css = '#debugger {position: absolute; top: 0px; bottom: 0px; right: 0px; left: 100%; z-index: 9999; background-color: rgba(255,255,255,.9); color: #000;}' +
                    '#logger {overflow: auto; position: absolute; top: 0px; left: 0px; right: 0px; bottom: 40px;}' +
                    '#logger:empty + #debugger-switcher {background-color: rgba(0,255,0,.4);}' +
                    '#debugger-switcher {content: ""; display: block; position: absolute; ' +
                    'left: ' + (-showLogBtnPosition.offsetY - showLogBtnPosition.radius * 2) + 'px; top: ' + (showLogBtnPosition.offsetX) + 'px; ' +
                    'width: ' + (showLogBtnPosition.radius * 2) + 'px; height: ' + (showLogBtnPosition.radius * 2) + 'px; ' +
                    'background-color: rgba(255,0,0,.4); border-radius: 50%;}' +
                    '#debugger .log-event {border-top: 1px dashed #ccc;}' +
                    '#debugger .log-event pre {line-height: 1; background-color: transparent; border: none; padding: 5px; font-size: 10px; margin: 0;}' +
                    '#debugger .input-line {text-align: center; position: absolute; bottom: 0px; left: 0px; right: 0px;}' +
                    '#debugger .input-line input {width: 100%; height: 20px; padding: 0; border: 0; background-color: #eeeeee;}' +
                    '#debugger .clear-btn {text-align: right; position: absolute; bottom: 20px; left: 0px; right: 0px;}' +
                    '#debugger .clear-btn button {width: 50px; height: 20px; padding: 0; border: 0; display: none;}' +
                    '#debugger.show {left: 20%;}' +
                    '#debugger.show button {display: inline-block;}';
                var styleElem = document.createElement('style');
                styleElem.type = 'text/css';
                styleElem.styleSheet ? styleElem.styleSheet.cssText = css : styleElem.appendChild(document.createTextNode(css));
                document.querySelector('head').appendChild(styleElem);

                debugSwitchEl.onclick = function () {
                    debugEl.classList.toggle('show');
                };

                input.addEventListener("keypress", function (ev) {
                    if (ev.keyCode == 13) {
                        var cmd = this.value;
                        this.value = "";
                        runCmd(cmd);
                    }
                })
            })();

            var isCordova = !!$window.cordova;
            if (isNativeConsole) {
                var logOld = console.log;
                console.log = function () {
                    var args = isCordova ? [parseArguments(arguments)] : arguments;
                    logOld.apply(console, args);
                    $window.log(parseArguments(arguments));
                };
            } else {
                console.log = $window.log;
            }

            var oldError = $window.onerror;
            $window.onerror = function (message, url, linenumber, column, errObj) {
                $window.log(parseArguments(arguments));
                oldError && oldError.apply($window, arguments);
            };

            $window.log = function (arrOfObj, prefix, showTime) {
                (typeof showTime === 'undefined') && (showTime = true);
                if (!Array.isArray(arrOfObj)) {
                    arrOfObj = [arrOfObj];
                }

                if (!isShowLog) return false;

                prefix = prefix || '';
                showTime && (prefix = (new Date()).toLocaleTimeString() + ' ' + prefix);

                addPrefix(prefix);
                arrOfObj.forEach(function (obj) {
                    addMessage(obj);
                });

                return arrOfObj;
            };
        }

        function runCmd(cmd) {
            try {
                cmd = 'console.log(' + cmd + ')';
                eval.call($window, cmd);
            } catch (e) {
                log(e.stack, e.message);
            }
        }

        function addPrefix(prefix) {
            var loggerEl = document.querySelector('#logger'),
                debugSwitchEl = document.querySelector('#debugger-switcher');
            var logEl = document.createElement('div');
            logEl.className = 'log-event';
            logEl.innerHTML = '<pre>' + prefix + '</pre>';
            loggerEl.appendChild(logEl);
            loggerEl.scrollTop = loggerEl.scrollHeight;
            debugSwitchEl.style.zoom = 1;
        }

        function addMessage(msg) {
            var loggerEl = document.querySelector('#logger'),
                debugSwitchEl = document.querySelector('#debugger-switcher');
            renderjson.set_icons('+', '-')
                .set_show_to_level(1);
            loggerEl.appendChild(renderjson(msg));
            loggerEl.scrollTop = loggerEl.scrollHeight;
            debugSwitchEl.style.zoom = 1;
        }

        function parseArguments(args) {
            return Array.prototype.slice.call(args);
        }


        // Copyright © 2013-2014 David Caldwell <david@porkrind.org>
        // https://github.com/caldwell/renderjson
        var renderjson = (function () {
            var themetext = function (/* [class, text]+ */) {
                var spans = [];
                while (arguments.length)
                    spans.push(append(span(Array.prototype.shift.call(arguments)),
                        text(Array.prototype.shift.call(arguments))));
                return spans;
            };
            var append = function (/* el, ... */) {
                var el = Array.prototype.shift.call(arguments);
                for (var a = 0; a < arguments.length; a++)
                    if (arguments[a].constructor == Array)
                        append.apply(this, [el].concat(arguments[a]));
                    else
                        el.appendChild(arguments[a]);
                return el;
            };
            var prepend = function (el, child) {
                el.insertBefore(child, el.firstChild);
                return el;
            };
            var isempty = function (obj) {
                for (var k in obj) if (obj.hasOwnProperty(k)) return false;
                return true;
            };
            var text = function (txt) {
                return document.createTextNode(txt)
            };
            var div = function () {
                return document.createElement("div")
            };
            var span = function (classname) {
                var s = document.createElement("span");
                if (classname) s.className = classname;
                return s;
            };
            var A = function A(txt, classname, callback) {
                var a = document.createElement("a");
                if (classname) a.className = classname;
                a.appendChild(text(txt));
                a.href = '#';
                a.onclick = function () {
                    callback();
                    return false;
                };
                return a;
            };

            function _renderjson(json, indent, dont_indent, show_level, max_string, sort_objects) {
                var my_indent = dont_indent ? "" : indent;

                var disclosure = function (open, placeholder, close, type, builder) {
                    var content;
                    var empty = span(type);
                    var show = function () {
                        if (!content) append(empty.parentNode,
                            content = prepend(builder(),
                                A(renderjson.hide, "disclosure",
                                    function () {
                                        content.style.display = "none";
                                        empty.style.display = "inline";
                                    })));
                        content.style.display = "inline";
                        empty.style.display = "none";
                    };
                    append(empty,
                        A(renderjson.show, "disclosure", show),
                        themetext(type + " syntax", open),
                        A(placeholder, null, show),
                        themetext(type + " syntax", close));

                    var el = append(span(), text(my_indent.slice(0, -1)), empty);
                    if (show_level > 0)
                        show();
                    return el;
                };

                if (json === null) return themetext(null, my_indent, "keyword", "null");
                if (json === void 0) return themetext(null, my_indent, "keyword", "undefined");

                if (typeof(json) == "string" && json.length > max_string)
                    return disclosure('"', json.substr(0, max_string) + " ...", '"', "string", function () {
                        return append(span("string"), themetext(null, my_indent, "string", JSON.stringify(json)));
                    });

                if (typeof(json) != "object") // Strings, numbers and bools
                    return themetext(null, my_indent, typeof(json), JSON.stringify(json));

                if (json.constructor == Array) {
                    if (json.length == 0) return themetext(null, my_indent, "array syntax", "[]");

                    return disclosure("[", " ... ", "]", "array", function () {
                        var as = append(span("array"), themetext("array syntax", "[", null, "\n"));
                        for (var i = 0; i < json.length; i++)
                            append(as,
                                _renderjson(json[i], indent + "    ", false, show_level - 1, max_string, sort_objects),
                                i != json.length - 1 ? themetext("syntax", ",") : [],
                                text("\n"));
                        append(as, themetext(null, indent, "array syntax", "]"));
                        return as;
                    });
                }

                // object
                if (isempty(json))
                    return themetext(null, my_indent, "object syntax", "{}");

                return disclosure("{", "...", "}", "object", function () {
                    var os = append(span("object"), themetext("object syntax", "{", null, "\n"));
                    for (var k in json) var last = k;
                    var keys = Object.keys(json);
                    if (sort_objects)
                        keys = keys.sort();
                    for (var i in keys) {
                        var k = keys[i];
                        append(os, themetext(null, indent + "    ", "key", '"' + k + '"', "object syntax", ': '),
                            _renderjson(json[k], indent + "    ", true, show_level - 1, max_string, sort_objects),
                            k != last ? themetext("syntax", ",") : [],
                            text("\n"));
                    }
                    append(os, themetext(null, indent, "object syntax", "}"));
                    return os;
                });
            }

            var renderjson = function renderjson(json) {
                var pre = append(document.createElement("pre"), _renderjson(json, "", false, renderjson.show_to_level, renderjson.max_string_length, renderjson.sort_objects));
                pre.className = "renderjson";
                return pre;
            };
            renderjson.set_icons = function (show, hide) {
                renderjson.show = show;
                renderjson.hide = hide;
                return renderjson;
            };
            renderjson.set_show_to_level = function (level) {
                renderjson.show_to_level = typeof level == "string" &&
                level.toLowerCase() === "all" ? Number.MAX_VALUE
                    : level;
                return renderjson;
            };
            renderjson.set_max_string_length = function (length) {
                renderjson.max_string_length = typeof length == "string" &&
                length.toLowerCase() === "none" ? Number.MAX_VALUE
                    : length;
                return renderjson;
            };
            renderjson.set_sort_objects = function (sort_bool) {
                renderjson.sort_objects = sort_bool;
                return renderjson;
            };
            // Backwards compatiblity. Use set_show_to_level() for new code.
            renderjson.set_show_by_default = function (show) {
                renderjson.show_to_level = show ? Number.MAX_VALUE : 0;
                return renderjson;
            };
            renderjson.set_icons('?', '?');
            renderjson.set_show_by_default(false);
            renderjson.set_sort_objects(false);
            renderjson.set_max_string_length("none");
            return renderjson;
        })();
    }
]);
