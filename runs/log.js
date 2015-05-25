'use strict';

App.run(['$window', 'Const',
    function($window, Const) {
        var isShowLog = Const && Const.debugLog;

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

                debugSwitchEl.onclick = function() {
                    debugEl.classList.toggle('show');
                };

                input.addEventListener("keypress", function(ev) {
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
                console.log = function() {
                    var args = isCordova ? [parseArguments(arguments)] : arguments;
                    logOld.apply(console, args);
                    $window.log(parseArguments(arguments));
                };
            } else {
                console.log = $window.log;
            }

            var oldError = $window.onerror;
            $window.onerror = function(message, url, linenumber, column, errObj) {
                $window.log(parseArguments(arguments));
                oldError && oldError.apply($window, arguments);
            };

            $window.log = function(obj, prefix, showTime) {
                (typeof showTime === 'undefined') && (showTime = true);

                if (!isShowLog) return false;

                prefix = prefix || '';
                showTime && (prefix = (new Date()).toLocaleTimeString() + ' ' + prefix);
                prefix && (prefix = prefix + ': ');

                var msg = prefix + obj;
                addMessage(msg);

                return msg;
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

        function addMessage(msg) {
            var loggerEl = document.querySelector('#logger'),
                debugSwitchEl = document.querySelector('#debugger-switcher');
            var logEl = document.createElement('div');
            logEl.className = 'log-event';
            logEl.innerHTML = '<pre>' + msg + '</pre>';
            loggerEl.appendChild(logEl);
            loggerEl.scrollTop = loggerEl.scrollHeight;
            debugSwitchEl.style.zoom = 1;
        }

        function parseArguments(args) {
            var text = "";
            for (var i = 0, l = args.length; i < l; i++) {
                var item = args[i];
                text = text + angular.toJson(item, true) + "; ";
            }

            return text;
        }
    }
]);
