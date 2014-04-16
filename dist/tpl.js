!function(t, e) {
    "function" == typeof define && define.amd ? define(e) : "object" == typeof exports ? module.exports = e(require, exports, module) : t.tpl = e();
}(this, function() {
    "use strict";
    var UNDEF, util = {
        noop: function() {},
        toBool: function(t) {
            if ("undefined" === t || t === UNDEF || null === t) return !1;
            var e = util.type(t), n = !!t.length;
            return "boolean" === e ? t : "array" === e ? n : "number" === e ? 0 !== t : "string" === e ? !("0" === t || "" === t) : "object" === e ? !!util.keys(t).length : !!t;
        },
        type: function(t) {
            return {}.toString.call(t).replace(/^\[object (\w+)\]$/, "$1").toLowerCase();
        },
        each: function(t, e, n) {
            if ("array" === util.type(t)) for (var r = 0, i = t.length; i > r && e.call(n || t[r], t[r], r, t) !== !1; r++) ; else for (var l in t) if (t.hasOwnProperty(l) && e.call(n || t[l], t[l], l, t) === !1) break;
        },
        extend: function(t) {
            return util.each([].slice.call(arguments, 1), function(e) {
                e && util.each(e, function(e, n) {
                    t[n] = e;
                });
            }), t;
        },
        arrTobj: function(t) {
            var e = {};
            return util.each(t, function(t) {
                e[t] = t;
            }), e;
        },
        keys: Object.keys || function(t) {
            var e = [];
            return util.each(t, function(t) {
                e.push(t);
            }), e;
        },
        tap: function(t, e, n) {
            var r = t, i = e.length;
            return i ? (e === e + "" && (e = e.replace(/\[([^\]])+\]/g, function(t, e, n) {
                return (n ? "." : "") + e;
            }).split(".")), util.each(e, function(t, e) {
                return UNDEF === r ? !1 : e === i - 1 && n !== UNDEF ? (r[t] = n, !1) : void (r = r[t]);
            }), n !== UNDEF ? t : r) : t;
        },
        replace: function(t, e) {
            var n = [].slice.call(arguments, 2), r = "\\{\\{" + n[0], i = "\\}\\}";
            return n[1] && (r += i, i = "\\{\\{" + n[1] + i), t.replace(new RegExp(r + "(((?!" + i + ")[\\s\\S])*)" + i), function() {
                return e(arguments[1]);
            });
        },
        fetchTpl: function(t) {
            return t.value || t.innerHTML || ("function" === util.type(t) ? (t.toString().match(/\/\*!?(?:\@preserve)?\s*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//) || [ "", "" ])[1] : t + "");
        },
        parseData: function(t) {
            return t !== t + "" ? t : window.JSON && window.JSON.parse ? window.JSON.parse(t) : new Function("return " + t)();
        },
        filter: function(t, e) {
            var n = !1;
            return util.each(e, function(e) {
                var r = [];
                e = e.replace(/\s*\(([^)]*)\)/g, function(t, e) {
                    return r = r.concat(e.split(/\s*,\s*/)), "";
                }), "unescape" === e ? n = !0 : t[e] ? t = t[e].apply(t, r) : filter[e] && (t = filter[e].apply(t, [ t ].concat(r)));
            }), n ? t : filter.escape(t);
        },
        exec: function() {}
    }, filter = {
        trim: function(t) {
            return (t += "").trim ? t.trim.call(t) : t.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "");
        },
        escape: function(t) {
            return (t + "").replace(/[&<>'"]/g, function(t) {
                return "&" + {
                    "&": "amp",
                    "<": "lt",
                    ">": "gt",
                    "'": "#39",
                    '"': "quot"
                }[t] + ";";
            });
        },
        regescape: function(t) {
            return t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },
        unwrap: function(t) {
            return t.replace(/\r?\n|\r|\t/g, "");
        }
    }, helper = {
        ROUTE: function(t, e, n) {
            return util.each(t, function(t) {
                "block" === t.mark && (t.mark = (t.mark = t.content.match(/#\s*([^\s]+)/)) ? t.mark[1] : "NULL"), 
                n = util.replace(n, function(n) {
                    return (helper[t.mark] || helper.NULL)(t, e, n);
                }, t.id, t.end);
            }), n;
        },
        exp: function(ast, data, tpl) {
            var filters = [], quotes = [], result, tmp;
            if (result = ast.content.replace(/"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'/g, function(t) {
                return quotes.push(t.slice(1, -1)), "#{" + (quotes.length - 1) + "}";
            }), tmp = result.match(/if\s+([^$]*)/), tmp && (result = tmp[1]), /\s*[^=]=[^=]\s*/.test(result)) return "";
            filters = result.split(/\s*[^\|\\]\|[^\|]\s*/), result = filters.shift().replace(/[\[\$@_a-zA-Z][\.\w\[\]]*/g, function(t) {
                var e = ~"undefined true false null NaN".indexOf(t) ? "" : util.tap(data, t);
                return '"' + (e === UNDEF ? "" : e) + '"';
            }).replace(/#\{([^}]*)\}/g, function() {
                return '"' + quotes.shift() + '"';
            });
            try {
                result = eval(result);
            } catch (e) {}
            return util.filter(result, filters);
        },
        "for": function(t, e, n) {
            var r, i = t.content.match(/in\s+([^\s]*)/), l = t.content.match(/for\s+([^\s]*)/), u = util.tap(e, i ? i[1] : ""), a = 0, o = "", c = [];
            return l = l ? l[1] : "", "array" === util.type(u) && (r = {}), util.each(u, function(t, e) {
                r && (r[e] = t), (e === +e || 0 !== e.indexOf("@")) && e !== l && c.push(e);
            }), r && (u = r), u ? (u["@total"] = u["@length"] = c.length, u["@first"] = u[c[0]], 
            u["@last"] = u[c[c.length - 1]], util.each(u, function(e, r) {
                r.indexOf("@") && r !== l && (u[l] = e, u["@key"] = r, u["@index"] = a++, o += helper.ROUTE(t, u, n));
            }), o) : o;
        },
        "if": function(t, e, n) {
            util.each(t, function(t) {
                return "else" === t.mark ? (n = n.split(new RegExp("\\{\\{" + t.id + "\\}\\}")), 
                !1) : void 0;
            }), "array" !== util.type(n) && (n = [ n, "" ]);
            var r = helper.exp(t, e);
            return helper.ROUTE(t, e, "false" !== r && util.toBool(r) ? n[0] : n[1]);
        },
        "with": function(t, e, n) {
            var r = t.content.match(/with\s+([^\s]*)/);
            return helper.ROUTE(t, util.tap(e, r ? r[1] : ""), n);
        },
        NULL: function() {
            return "";
        }
    }, engine = function(t, e, n) {
        var r = this;
        return r.data = util.parseData(e), r.opts = util.extend({
            delimiterBegin: "{{",
            delimiterEnd: "}}",
            removeLineBreaks: !1
        }, n), util.extend(util, r.opts.util), util.extend(helper, r.opts.helper), util.extend(filter, r.opts.filter), 
        r.walkers = {
            "/": "close",
            "#": "block",
            "{": "unescape"
        }, r.keywords = util.arrTobj("else break contiue".split(" ")), r.ast = {}, r.cache = {}, 
        r.tokenStack = [], r.tpl = util.fetchTpl(t), r.tokenId = 0, r.tokenReg = new RegExp(r.opts.delimiterBegin + "(((?!" + r.opts.delimiterEnd + ")[\\s\\S])*)" + r.opts.delimiterEnd, "g"), 
        r.commentReg = new RegExp(r.opts.delimiterBegin + "\\s*\\*[\\S\\s]*?\\*\\s*" + r.opts.delimiterEnd, "g"), 
        r.preCompile().astWalker().compile(), r.data ? r.tpl : r.ast;
    }, fn = engine.prototype;
    util.each("decodeURIComponent encodeURIComponent decodeURI encodeURI".split(" "), function(t) {
        filter[t] = window[t];
    }), fn.preCompile = function() {
        var t = this;
        return t.opts.removeLineBreaks && (t.tpl = filter.unwrap(t.tpl)), t.tpl = t.tpl.replace(t.commentReg, ""), 
        t;
    }, fn.astWalker = function() {
        var t = this;
        return t.tpl = t.tpl.replace(t.tokenReg, function() {
            return t.addToken(t.parseToken(arguments)), "{{" + t.tokenId++ + "}}";
        }), t;
    }, fn.parseToken = function(t) {
        var e = this, n = filter.trim(t[1]);
        return {
            mark: e.keywords[n] || e.walkers[n.slice(0, 1)] || "exp",
            pos: t[3],
            id: e.tokenId,
            content: n
        };
    }, fn.addToken = function(t) {
        var e, n = this;
        "block" === t.mark ? (n.tokenStack.push(t.id), util.tap(n.ast, n.tokenStack, t)) : "close" === t.mark ? (e = util.tap(n.ast, n.tokenStack), 
        e.end = t.id, util.tap(n.ast, n.tokenStack, e), n.tokenStack.pop()) : (e = n.tokenStack.slice(0), 
        e.push(t.id), util.tap(n.ast, e, t));
    }, fn.compile = function() {
        var t = this;
        return t.data && (t.tpl = helper.ROUTE(t.ast, t.data, t.tpl)), t;
    };
    var tpl = function(t, e, n) {
        var r = new engine(t, e, n);
        return e ? r.tpl : r.ast;
    };
    return tpl.VERSION = "0.0.1", tpl.util = util, tpl.helper = helper, tpl.filter = filter, 
    tpl.engine = engine, "undefined" == typeof module || "undefined" == typeof module.exports ? tpl : void (module.exports = tpl);
});