var Zepto = (function () {
    var slice = [].slice, d = document,
        CN = 'className', AEL = 'addEventListener', PN = 'parentNode', QSA = 'querySelectorAll',
        ADJ_OPS = {append: 'beforeEnd', prepend: 'afterBegin', before: 'beforeBegin', after: 'afterEnd'},
        touch = {}, touchTimeout,
        e, k;

    function $ (_, context) {
        if (context !== void 0) return $(context).find(_);
        function fn (_) { return fn.dom.forEach(_), fn; }
        fn.dom = (typeof _ === 'function' && 'dom' in _) ?
            _.dom : (_ instanceof Array ? _ :
            (_ instanceof Element ? [_] :
                slice.call(d[QSA](fn.selector = _)))).filter(function (el) {
                return el !== void 0 && el !== null;
            });
        for (var k in $.fn) { fn[k] = $.fn[k]; }
        return fn;
    }

    function classRE (name) { return new RegExp("(^|\\s)" + name + "(\\s|$)") }
    function elSelect (el, selector) { return slice.call(el[QSA](selector)) }

    $.fn = {
        get: function (idx) { return idx === void 0 ? this.dom : this.dom[idx]; },
        remove: function () { return this(function (el) { el[PN].removeChild(el) }) },
        each: function (callback) { return this(callback) },
        find: function (selector) {
            return $(this.dom.map(function(el){ return elSelect(el, selector) }).reduce(function(a,b){ return a.concat(b) }, []));
        },
        closet: function (selector) {
            var el = this.dom[0][PN], nodes = elSelect(d, selector);
            while (el && nodes.indexOf(el)<0) el = el[PN];
            return $(el && !(el===d) ? el : []);
        },
        show: function () { return this.css("display:block") },
        hide: function () { return this.css("display:none") },
        prev: function () { return $(this.dom.map(function(el){ return el.previousElementSibling })) },
        next: function () { return $(this.dom.map(function(el){ return el.nextElementSibling })) },
        html: function (html) {
            return (html === void 0) ? (this.dom[0] ? this.dom[0].innerHTML : null) : this(function (el) { el.innerHTML = html });
        },
        attr: function (name, value) {
            return (typeof name === 'string' && value === void 0) ? (this.dom[0] ? this.dom[0].getAttribute(name) || undefined : null) :
                this(function (el) {
                    if (typeof name === 'object') for (k in name) el.setAttribute(k, name[k]);
                    else el.setAttribute(name, value);
                });
        },
        offset: function () {
            var obj = this.dom[0].getBoundingClientRect();
            return { left: obj.left + d.body.scrollLeft, top: obj.top + d.body.scrollTop, width: obj.width, height: obj.height };
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
        bind: function (event, callback) {
            return this(function (el) {
                event.split(/\s+/).forEach(function (event) { el[AEL](event, callback, false) });
            });
        },
        delegate: function (selector, event, callback) {
            return this(function (el) {
                el[AEL](event, function (event) {
                    var target = event.target, nodes = elSelect(el, selector);
                    while (target && nodes.indexOf(target) < 0) { target = target[PN]; }
                    if (target && target !== el && target !== d) callback.call(target, event);
                }, false)
            });
        },
        addClass: function (name) {
            return this(function (el) {
                !classRE(name).test(el[CN]) && (el[CN] += (el[CN] ? ' ' : '') + name);
            });
        },
        removeClass: function (name) {
            return this(function (el) {
                el[CN] = el[CN].replace(classRE(name), ' ').replace(/^\s+|\s+$/g, '');
            });
        }
    };

    ['width', 'height'].forEach(function(m){ $.fn[m] = function(){ return this.offset()[m] }});

    for (k in ADJ_OPS)
        $.fn[k] = (function (op) {
            return function (html) { return this(function (el) {
                el['insertAdjacent' + (html instanceof Element ? 'Element' : 'HTML')](op,html);
            }) };
        })(ADJ_OPS[k]);

    ['swipe', 'doubleTap', 'tap'].forEach(function (m) {
        $.fn[m] = function (callback) { return this.bind(m, callback) };
    });

    function dispatch (event, target) { target.dispatchEvent(e = d.createEvent("Events"), e.initEvent(event, true, false)) }

    d.ontouchstart = function (e) {
        var now = Date.now(), delta = now - (touch.last || now);
        touch.target = e.touches[0].target;
        touchTimeout && clearTimeout(touchTimeout);
        touch.x1 = e.touches[0].pageX;
        if (delta > 0 && delta <= 250) { touch.isDoubleTap = true; }
        touch.last = now;
    };

    d.ontouchmove = function(e){ touch.x2 = e.touches[0].pageX };

    d.ontouchend = function (e) {
        if (touch.isDoubleTap) {
            dispatch('doubleTap', touch.target);
            touch = {};
        } else if (touch.x2 > 0) {
            Math.abs(touch.x1 - touch.x2) > 30 && dispatch("swipe", touch.target);
            touch.x2 = touch.x1 = touch.last = 0;
        } else if ('last' in touch) {
            touchTimeout = setTimeout(function () {
                touchTimeout = null;
                dispatch("tap", touch.target);
                touch = {};
            }, 250);
        }
    };

    function ajax (method, url, success) {
        var r = new XMLHttpRequest();
        r.onreadystatechange = function () {
            if (r.readyState === 4 && (r.status === 200 || r.status === 0)) {
                success(r.responseText);
            }
        };
        r.open(method, url, true);
        r.setRequestHeader('X-Requested-With','XMLHttpRequest');
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
})();

if (!('$' in window)) window.$ = Zepto;