var $ = (function (d) {
    var slice = [].slice, k,
        ADJ_OPS = {append: 'beforeEnd', prepend: 'afterBegin', before: 'beforeBegin', after: 'afterEnd'};

    function $ (_) {
        function fn (_) { return arguments.callee.dom.forEach(_), arguments.callee; }
        fn.dom = _ instanceof Element ? [_] : slice.call(d.querySelectorAll(fn.selector = _));
        for (var k in $.fn) { fn[k] = $.fn[k]; }
        return fn;
    }

    function classRE (name) { return new RegExp("(^|\\s)" + name + "(\\s|$)") }

    $.fn = {
        get: function (idx) { return idx === void 0 ? this.dom : this.dom[idx]; },
        remove: function () { return this(function (el) { el.parentNode.removeChild(el) }) },
        each: function (callback) { return this(function (el) { callback(el) }) },
        html: function (html) {
            return (html === void 0) ? this.dom[0].innerHTML : this(function (el) { el.innerHTML = html });
        },
        attr: function (name, value) {
            return (value === void 0) ? this.dom[0].getAttribute(name) || void 0 :
                this(function (el) { el.setAttribute(name, value) });
        },
        css: function (style) {
            return this(function (el) { el.style.cssText += ';' + style; });
        },
        index: function (target) {
            return this.dom.indexOf($(target).get(0));
        },
        anim: function (transform, opacity, dur) {
            return this.css('transition: all ' + (dur || 0.5) + 's;' +
            'transform: ' + transform + '; opacity: ' + (opacity === 0 ? 0 : opacity || 1));
        },
        delegate: function (selector, event, callback) {
            return this(function (el) {
                el.addEventListener(event, function (event) {
                    var target = event.target, nodes = slice.call(el.querySelectorAll(selector));
                    while (target && nodes.indexOf(target) < 0) { target = target.parentNode; }
                    if (target && target !== el && target !== d) callback.call(target, event);
                }, false)
            });
        },
        addClass: function (name) {
            return this(function (el) {
                !classRE(name).test(el.className) && (el.className += (el.className ? ' ' : '') + name);
            });
        },
        removeClass: function (name) {
            return this(function (el) {
                el.className = el.className.replace(classRE(name), ' ').replace(/^\s+|\s+$/g, '');
            });
        }
    };

    for (k in ADJ_OPS)
        $.fn[k] = (function (op) {
            return function (html) { return this(function (el) { el.insertAdjacentHTML(op,html) }) };
        })(ADJ_OPS[k]);

    function ajax (method, url, success) {
        var r = new XMLHttpRequest();
        r.onreadystatechange = function () {
            if (r.readyState === 4 && (r.status === 200 || r.status === 0)) {
                success(r.responseText);
            }
        };
        r.open(method, url, true);
        r.send(null);
    }

    $.get = function (url, success) {
        ajax('GET', url, success);
    };
    $.post = function (url, success) {
        ajax('POST', url, success);
    };
    $.getJSON = function (url, success) {
        $.get(url, function (json) {
            success(JSON.parse(json));
        });
    };

    return $;
})(document);
