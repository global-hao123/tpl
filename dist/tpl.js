!function(e, t) {
    "function" == typeof define && define.amd ? define(t) : "object" == typeof exports ? module.exports = t(require, exports, module) : e.tpl = t();
}(this, function() {
    "use strict";
    var UNDEF, util = {
        noop: function() {},
        toBool: function(e) {
            if ("undefined" === e || e === UNDEF || null === e) return !1;
            var t = util.type(e), n = !!e.length;
            return "boolean" === t ? e : "array" === t ? n : "number" === t ? 0 !== e : "string" === t ? !("0" === e || "" === e) : "object" === t ? !!util.keys(e).length : !!e;
        },
        type: function(e) {
            return {}.toString.call(e).replace(/^\[object (\w+)\]$/, "$1").toLowerCase();
        },
        each: function(e, t, n) {
            if ("array" === util.type(e)) for (var r = 0, i = e.length; i > r && t.call(n || e[r], e[r], r, e) !== !1; r++) ; else for (var l in e) if (e.hasOwnProperty(l) && t.call(n || e[l], e[l], l, e) === !1) break;
        },
        extend: function(e) {
            return util.each([].slice.call(arguments, 1), function(t) {
                t && util.each(t, function(t, n) {
                    e[n] = t;
                });
            }), e;
        },
        arrTobj: function(e) {
            var t = {};
            return util.each(e, function(e) {
                t[e] = e;
            }), t;
        },
        keys: Object.keys || function(e) {
            var t = [];
            return util.each(e, function(e) {
                t.push(e);
            }), t;
        },
        tap: function(e, t, n) {
            var r = e, i = t.length;
            return i ? (t === t + "" && (t = t.replace(/\[([^\]])+\]/g, function(e, t, n) {
                return (n ? "." : "") + t;
            }).split(".")), util.each(t, function(e, t) {
                return UNDEF === r ? !1 : t === i - 1 && n !== UNDEF ? (r[e] = n, !1) : void (r = r[e]);
            }), n !== UNDEF ? e : r) : e;
        },
        replace: function(e, t) {
            var n = [].slice.call(arguments, 2), r = "\\{\\{" + n[0], i = "\\}\\}";
            return n[1] && (r += i, i = "\\{\\{" + n[1] + i), e.replace(new RegExp(r + "(((?!" + i + ")[\\s\\S])*)" + i), function() {
                return t(arguments[1]);
            });
        },
        fetchTpl: function(e) {
            return e.value || e.innerHTML || ("function" === util.type(e) ? (e.toString().match(/\/\*!?(?:\@preserve)?\s*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//) || [ "", "" ])[1] : e + "");
        },
        parseData: function(e) {
            return e !== e + "" ? e : JSON && JSON.parse ? JSON.parse(e) : new Function("return " + e)();
        },
        filter: function(e, t) {
            var n = !1;
            return util.each(t, function(t) {
                var r = [];
                t = t.replace(/\s*\(([^)]*)\)/g, function(e, t) {
                    return r = r.concat(t.split(/\s*,\s*/)), "";
                }), "unescape" === t ? n = !0 : e[t] ? e = e[t].apply(e, r) : filter[t] && (e = filter[t].apply(e, [ e ].concat(r)));
            }), n ? e : filter.escape(e);
        },
        exec: function() {}
    }, filter = {
        trim: function(e) {
            return (e += "").trim ? e.trim.call(e) : e.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "");
        },
        escape: function(e) {
            return (e + "").replace(/[&<>'"]/g, function(e) {
                return "&" + {
                    "&": "amp",
                    "<": "lt",
                    ">": "gt",
                    "'": "#39",
                    '"': "quot"
                }[e] + ";";
            });
        },
        regescape: function(e) {
            return e.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        },
        unwrap: function(e) {
            return e.replace(/\r?\n|\r|\t/g, "");
        }
    }, helper = {
        ROUTE: function(e, t, n) {
            return util.each(e, function(e) {
                "block" === e.mark && (e.mark = (e.mark = e.content.match(/#\s*([^\s]+)/)) ? e.mark[1] : "NULL"), 
                n = util.replace(n, function(n) {
                    return (helper[e.mark] || helper.NULL)(e, t, n);
                }, e.id, e.end);
            }), n;
        },
        exp: function(ast, data, tpl) {
            var filters = [], quotes = [], result, tmp;
            if (result = ast.content.replace(/"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'/g, function(e) {
                return quotes.push(e.slice(1, -1)), "#{" + (quotes.length - 1) + "}";
            }), tmp = result.match(/if\s+([\s\S]*)/), tmp && (result = tmp[1]), /\s*[^=]=[^=]\s*/.test(result)) return "";
            !function e(t, n) {
                return (n = /[^\|\\]\|[^\|]/.exec(t)) ? (filters.push(filter.trim(t.slice(0, n.index + 1))), 
                void e(t.slice(n.index + 2))) : filters.push(filter.trim(t));
            }(result), result = filters.shift().replace(/[\[\$@_a-zA-Z][\.\w\[\]]*/g, function(e) {
                var t = ~"undefined true false null NaN".indexOf(e) ? "" : util.tap(data, e);
                return '"' + (t === UNDEF ? "" : t) + '"';
            }).replace(/#\{([^}]*)\}/g, function() {
                return '"' + quotes.shift() + '"';
            });
            try {
                result = eval(result);
            } catch (e) {}
            return util.filter(result, filters);
        },
        "for": function(e, t, n) {
            var r, i = e.content.match(/in\s+([^\s]*)/), l = e.content.match(/for\s+([^\s]*)/), u = util.tap(t, i ? i[1] : ""), a = 0, o = "", c = [];
            return l = l ? l[1] : "", "array" === util.type(u) && (r = {}), util.each(u, function(e, t) {
                r && (r[t] = e), (t === +t || 0 !== t.indexOf("@")) && t !== l && c.push(t);
            }), r && (u = r), u ? (u["@total"] = u["@length"] = c.length, u["@first"] = u[c[0]], 
            u["@last"] = u[c[c.length - 1]], util.each(u, function(t, r) {
                r.indexOf("@") && r !== l && (u[l] = t, u["@key"] = r, u["@index"] = a++, o += helper.ROUTE(e, u, n));
            }), o) : o;
        },
        "if": function(e, t, n) {
            util.each(e, function(e) {
                return "else" === e.mark ? (n = n.split(new RegExp("\\{\\{" + e.id + "\\}\\}")), 
                !1) : void 0;
            }), "array" !== util.type(n) && (n = [ n, "" ]);
            var r = helper.exp(e, t);
            return helper.ROUTE(e, t, "false" !== r && util.toBool(r) ? n[0] : n[1]);
        },
        "with": function(e, t, n) {
            var r = e.content.match(/with\s+([^\s]*)/);
            return helper.ROUTE(e, util.tap(t, r ? r[1] : ""), n);
        },
        NULL: function() {
            return "";
        }
    }, engine = function(e, t, n) {
        var r = this;
        return r.data = util.parseData(t), r.opts = util.extend({
            delimiterBegin: "{{",
            delimiterEnd: "}}",
            removeLineBreaks: !1
        }, n), util.extend(util, r.opts.util), util.extend(helper, r.opts.helper), util.extend(filter, r.opts.filter), 
        r.walkers = {
            "/": "close",
            "#": "block",
            "{": "unescape"
        }, r.keywords = util.arrTobj("else break contiue".split(" ")), r.ast = {}, r.cache = {}, 
        r.tokenStack = [], r.tpl = util.fetchTpl(e), r.tokenId = 0, r.tokenReg = new RegExp(r.opts.delimiterBegin + "(((?!" + r.opts.delimiterEnd + ")[\\s\\S])*)" + r.opts.delimiterEnd, "g"), 
        r.commentReg = new RegExp(r.opts.delimiterBegin + "\\s*\\*[\\S\\s]*?\\*\\s*" + r.opts.delimiterEnd, "g"), 
        r.preCompile().astWalker().compile(), r.data ? r.tpl : r.ast;
    }, fn = engine.prototype;
    util.each("decodeURIComponent encodeURIComponent decodeURI encodeURI".split(" "), function(e) {
        filter[e] = window[e];
    }), fn.preCompile = function() {
        var e = this;
        return e.opts.removeLineBreaks && (e.tpl = filter.unwrap(e.tpl)), e.tpl = e.tpl.replace(e.commentReg, ""), 
        e;
    }, fn.astWalker = function() {
        var e = this;
        return e.tpl = e.tpl.replace(e.tokenReg, function() {
            return e.addToken(e.parseToken(arguments)), "{{" + e.tokenId++ + "}}";
        }), e;
    }, fn.parseToken = function(e) {
        var t = this, n = filter.trim(e[1]);
        return {
            mark: t.keywords[n] || t.walkers[n.slice(0, 1)] || "exp",
            pos: e[3],
            id: t.tokenId,
            content: n
        };
    }, fn.addToken = function(e) {
        var t, n = this;
        "block" === e.mark ? (n.tokenStack.push(e.id), util.tap(n.ast, n.tokenStack, e)) : "close" === e.mark ? (t = util.tap(n.ast, n.tokenStack), 
        t.end = e.id, util.tap(n.ast, n.tokenStack, t), n.tokenStack.pop()) : (t = n.tokenStack.slice(0), 
        t.push(e.id), util.tap(n.ast, t, e));
    }, fn.compile = function() {
        var e = this;
        return e.data && (e.tpl = helper.ROUTE(e.ast, e.data, e.tpl)), e;
    };
    var tpl = function(e, t, n) {
        var r = new engine(e, t, n);
        return t ? r.tpl : r.ast;
    };
    return tpl.VERSION = "0.0.1", tpl.util = util, tpl.helper = helper, tpl.filter = filter, 
    tpl.engine = engine, "undefined" == typeof module || "undefined" == typeof module.exports ? tpl : void (module.exports = tpl);
});