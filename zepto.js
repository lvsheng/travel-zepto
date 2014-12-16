var $ = (function (d) {
    var slice = [].slice, k,
        CN = 'className', AEL = 'addEventListener', PN = 'parentNode',
        ADJ_OPS = {append: 'beforeEnd', prepend: 'afterBegin', before: 'beforeBegin', after: 'afterEnd'};

    function $ (_, context) {
        if (context !== void 0) return $(context).find(_);
        function fn (_) { return fn.dom.forEach(_), fn; }
        fn.dom = (typeof _ === 'function' && 'dom' in _) ?
            _.dom : (_ instanceof Array ? _ : (_ instanceof Element ? [_] : elSelect(d, fn.selector = _)));
        for (var k in $.fn) { fn[k] = $.fn[k]; }
        return fn;
    }

    function classRE (name) { return new RegExp("(^|\\s)" + name + "(\\s|$)") }
    function elSelect (el, selector) { return slice.call(el.querySelectorAll(selector)) }

    $.fn = {
        get: function (idx) { return idx === void 0 ? this.dom : this.dom[idx]; },
        remove: function () { return this(function (el) { el[PN].removeChild(el) }) },
        each: function (callback) { return this(function (el) { callback(el) }) },
        find: function (selector) {
            return $(this.dom.map(function(el){ return elSelect(el, selector) }).reduce(function(a,b){ return a.concat(b) }, []));
        },
        closet: function (selector) {
            var el = this.dom[0][PN], nodes = elSelect(d, selector);
            while (el && nodes.indexOf(el)<0) el = el[PN];
            return $(el && !(el===d) ? el : []);
        },
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
            return { left: obj.left + document.body.scrollLeft, top: obj.top + document.body.scrollTop, width: obj.width, height: obj.height };
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
})(document);
