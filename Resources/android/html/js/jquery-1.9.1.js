(function(window, undefined) {
    function isArraylike(obj) {
        var length = obj.length, type = jQuery.type(obj);
        if (jQuery.isWindow(obj)) return false;
        if (1 === obj.nodeType && length) return true;
        return "array" === type || "function" !== type && (0 === length || "number" == typeof length && length > 0 && length - 1 in obj);
    }
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(core_rnotwhite) || [], function(_, flag) {
            object[flag] = true;
        });
        return object;
    }
    function internalData(elem, name, data, pvt) {
        if (!jQuery.acceptData(elem)) return;
        var thisCache, ret, internalKey = jQuery.expando, getByName = "string" == typeof name, isNode = elem.nodeType, cache = isNode ? jQuery.cache : elem, id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;
        if ((!id || !cache[id] || !pvt && !cache[id].data) && getByName && data === undefined) return;
        id || (isNode ? elem[internalKey] = id = core_deletedIds.pop() || jQuery.guid++ : id = internalKey);
        if (!cache[id]) {
            cache[id] = {};
            isNode || (cache[id].toJSON = jQuery.noop);
        }
        ("object" == typeof name || "function" == typeof name) && (pvt ? cache[id] = jQuery.extend(cache[id], name) : cache[id].data = jQuery.extend(cache[id].data, name));
        thisCache = cache[id];
        if (!pvt) {
            thisCache.data || (thisCache.data = {});
            thisCache = thisCache.data;
        }
        data !== undefined && (thisCache[jQuery.camelCase(name)] = data);
        if (getByName) {
            ret = thisCache[name];
            null == ret && (ret = thisCache[jQuery.camelCase(name)]);
        } else ret = thisCache;
        return ret;
    }
    function internalRemoveData(elem, name, pvt) {
        if (!jQuery.acceptData(elem)) return;
        var i, l, thisCache, isNode = elem.nodeType, cache = isNode ? jQuery.cache : elem, id = isNode ? elem[jQuery.expando] : jQuery.expando;
        if (!cache[id]) return;
        if (name) {
            thisCache = pvt ? cache[id] : cache[id].data;
            if (thisCache) {
                if (jQuery.isArray(name)) name = name.concat(jQuery.map(name, jQuery.camelCase)); else if (name in thisCache) name = [ name ]; else {
                    name = jQuery.camelCase(name);
                    name = name in thisCache ? [ name ] : name.split(" ");
                }
                for (i = 0, l = name.length; l > i; i++) delete thisCache[name[i]];
                if (!(pvt ? isEmptyDataObject : jQuery.isEmptyObject)(thisCache)) return;
            }
        }
        if (!pvt) {
            delete cache[id].data;
            if (!isEmptyDataObject(cache[id])) return;
        }
        isNode ? jQuery.cleanData([ elem ], true) : jQuery.support.deleteExpando || cache != cache.window ? delete cache[id] : cache[id] = null;
    }
    function dataAttr(elem, key, data) {
        if (data === undefined && 1 === elem.nodeType) {
            var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
            data = elem.getAttribute(name);
            if ("string" == typeof data) {
                try {
                    data = "true" === data ? true : "false" === data ? false : "null" === data ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data;
                } catch (e) {}
                jQuery.data(elem, key, data);
            } else data = undefined;
        }
        return data;
    }
    function isEmptyDataObject(obj) {
        var name;
        for (name in obj) {
            if ("data" === name && jQuery.isEmptyObject(obj[name])) continue;
            if ("toJSON" !== name) return false;
        }
        return true;
    }
    function returnTrue() {
        return true;
    }
    function returnFalse() {
        return false;
    }
    function sibling(cur, dir) {
        do cur = cur[dir]; while (cur && 1 !== cur.nodeType);
        return cur;
    }
    function winnow(elements, qualifier, keep) {
        qualifier = qualifier || 0;
        if (jQuery.isFunction(qualifier)) return jQuery.grep(elements, function(elem, i) {
            var retVal = !!qualifier.call(elem, i, elem);
            return retVal === keep;
        });
        if (qualifier.nodeType) return jQuery.grep(elements, function(elem) {
            return elem === qualifier === keep;
        });
        if ("string" == typeof qualifier) {
            var filtered = jQuery.grep(elements, function(elem) {
                return 1 === elem.nodeType;
            });
            if (isSimple.test(qualifier)) return jQuery.filter(qualifier, filtered, !keep);
            qualifier = jQuery.filter(qualifier, filtered);
        }
        return jQuery.grep(elements, function(elem) {
            return jQuery.inArray(elem, qualifier) >= 0 === keep;
        });
    }
    function createSafeFragment(document) {
        var list = nodeNames.split("|"), safeFrag = document.createDocumentFragment();
        if (safeFrag.createElement) while (list.length) safeFrag.createElement(list.pop());
        return safeFrag;
    }
    function findOrAppend(elem, tag) {
        return elem.getElementsByTagName(tag)[0] || elem.appendChild(elem.ownerDocument.createElement(tag));
    }
    function disableScript(elem) {
        var attr = elem.getAttributeNode("type");
        elem.type = (attr && attr.specified) + "/" + elem.type;
        return elem;
    }
    function restoreScript(elem) {
        var match = rscriptTypeMasked.exec(elem.type);
        match ? elem.type = match[1] : elem.removeAttribute("type");
        return elem;
    }
    function setGlobalEval(elems, refElements) {
        var elem, i = 0;
        for (;null != (elem = elems[i]); i++) jQuery._data(elem, "globalEval", !refElements || jQuery._data(refElements[i], "globalEval"));
    }
    function cloneCopyEvent(src, dest) {
        if (1 !== dest.nodeType || !jQuery.hasData(src)) return;
        var type, i, l, oldData = jQuery._data(src), curData = jQuery._data(dest, oldData), events = oldData.events;
        if (events) {
            delete curData.handle;
            curData.events = {};
            for (type in events) for (i = 0, l = events[type].length; l > i; i++) jQuery.event.add(dest, type, events[type][i]);
        }
        curData.data && (curData.data = jQuery.extend({}, curData.data));
    }
    function fixCloneNodeIssues(src, dest) {
        var nodeName, e, data;
        if (1 !== dest.nodeType) return;
        nodeName = dest.nodeName.toLowerCase();
        if (!jQuery.support.noCloneEvent && dest[jQuery.expando]) {
            data = jQuery._data(dest);
            for (e in data.events) jQuery.removeEvent(dest, e, data.handle);
            dest.removeAttribute(jQuery.expando);
        }
        if ("script" === nodeName && dest.text !== src.text) {
            disableScript(dest).text = src.text;
            restoreScript(dest);
        } else if ("object" === nodeName) {
            dest.parentNode && (dest.outerHTML = src.outerHTML);
            jQuery.support.html5Clone && src.innerHTML && !jQuery.trim(dest.innerHTML) && (dest.innerHTML = src.innerHTML);
        } else if ("input" === nodeName && manipulation_rcheckableType.test(src.type)) {
            dest.defaultChecked = dest.checked = src.checked;
            dest.value !== src.value && (dest.value = src.value);
        } else "option" === nodeName ? dest.defaultSelected = dest.selected = src.defaultSelected : ("input" === nodeName || "textarea" === nodeName) && (dest.defaultValue = src.defaultValue);
    }
    function getAll(context, tag) {
        var elems, elem, i = 0, found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName(tag || "*") : typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll(tag || "*") : undefined;
        if (!found) for (found = [], elems = context.childNodes || context; null != (elem = elems[i]); i++) !tag || jQuery.nodeName(elem, tag) ? found.push(elem) : jQuery.merge(found, getAll(elem, tag));
        return tag === undefined || tag && jQuery.nodeName(context, tag) ? jQuery.merge([ context ], found) : found;
    }
    function fixDefaultChecked(elem) {
        manipulation_rcheckableType.test(elem.type) && (elem.defaultChecked = elem.checked);
    }
    function vendorPropName(style, name) {
        if (name in style) return name;
        var capName = name.charAt(0).toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length;
        while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in style) return name;
        }
        return origName;
    }
    function isHidden(elem, el) {
        elem = el || elem;
        return "none" === jQuery.css(elem, "display") || !jQuery.contains(elem.ownerDocument, elem);
    }
    function showHide(elements, show) {
        var display, elem, hidden, values = [], index = 0, length = elements.length;
        for (;length > index; index++) {
            elem = elements[index];
            if (!elem.style) continue;
            values[index] = jQuery._data(elem, "olddisplay");
            display = elem.style.display;
            if (show) {
                values[index] || "none" !== display || (elem.style.display = "");
                "" === elem.style.display && isHidden(elem) && (values[index] = jQuery._data(elem, "olddisplay", css_defaultDisplay(elem.nodeName)));
            } else if (!values[index]) {
                hidden = isHidden(elem);
                (display && "none" !== display || !hidden) && jQuery._data(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"));
            }
        }
        for (index = 0; length > index; index++) {
            elem = elements[index];
            if (!elem.style) continue;
            show && "none" !== elem.style.display && "" !== elem.style.display || (elem.style.display = show ? values[index] || "" : "none");
        }
        return elements;
    }
    function setPositiveNumber(elem, value, subtract) {
        var matches = rnumsplit.exec(value);
        return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
    }
    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ? 4 : "width" === name ? 1 : 0, val = 0;
        for (;4 > i; i += 2) {
            "margin" === extra && (val += jQuery.css(elem, extra + cssExpand[i], true, styles));
            if (isBorderBox) {
                "content" === extra && (val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles));
                "margin" !== extra && (val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles));
            } else {
                val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);
                "padding" !== extra && (val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles));
            }
        }
        return val;
    }
    function getWidthOrHeight(elem, name, extra) {
        var valueIsBorderBox = true, val = "width" === name ? elem.offsetWidth : elem.offsetHeight, styles = getStyles(elem), isBorderBox = jQuery.support.boxSizing && "border-box" === jQuery.css(elem, "boxSizing", false, styles);
        if (0 >= val || null == val) {
            val = curCSS(elem, name, styles);
            (0 > val || null == val) && (val = elem.style[name]);
            if (rnumnonpx.test(val)) return val;
            valueIsBorderBox = isBorderBox && (jQuery.support.boxSizingReliable || val === elem.style[name]);
            val = parseFloat(val) || 0;
        }
        return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
    }
    function css_defaultDisplay(nodeName) {
        var doc = document, display = elemdisplay[nodeName];
        if (!display) {
            display = actualDisplay(nodeName, doc);
            if ("none" === display || !display) {
                iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(doc.documentElement);
                doc = (iframe[0].contentWindow || iframe[0].contentDocument).document;
                doc.write("<!doctype html><html><body>");
                doc.close();
                display = actualDisplay(nodeName, doc);
                iframe.detach();
            }
            elemdisplay[nodeName] = display;
        }
        return display;
    }
    function actualDisplay(name, doc) {
        var elem = jQuery(doc.createElement(name)).appendTo(doc.body), display = jQuery.css(elem[0], "display");
        elem.remove();
        return display;
    }
    function buildParams(prefix, obj, traditional, add) {
        var name;
        if (jQuery.isArray(obj)) jQuery.each(obj, function(i, v) {
            traditional || rbracket.test(prefix) ? add(prefix, v) : buildParams(prefix + "[" + ("object" == typeof v ? i : "") + "]", v, traditional, add);
        }); else if (traditional || "object" !== jQuery.type(obj)) add(prefix, obj); else for (name in obj) buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
    }
    function addToPrefiltersOrTransports(structure) {
        return function(dataTypeExpression, func) {
            if ("string" != typeof dataTypeExpression) {
                func = dataTypeExpression;
                dataTypeExpression = "*";
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(core_rnotwhite) || [];
            if (jQuery.isFunction(func)) while (dataType = dataTypes[i++]) if ("+" === dataType[0]) {
                dataType = dataType.slice(1) || "*";
                (structure[dataType] = structure[dataType] || []).unshift(func);
            } else (structure[dataType] = structure[dataType] || []).push(func);
        };
    }
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
        function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery.each(structure[dataType] || [], function(_, prefilterOrFactory) {
                var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                if ("string" == typeof dataTypeOrTransport && !seekingTransport && !inspected[dataTypeOrTransport]) {
                    options.dataTypes.unshift(dataTypeOrTransport);
                    inspect(dataTypeOrTransport);
                    return false;
                }
                if (seekingTransport) return !(selected = dataTypeOrTransport);
            });
            return selected;
        }
        var inspected = {}, seekingTransport = structure === transports;
        return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
    }
    function ajaxExtend(target, src) {
        var deep, key, flatOptions = jQuery.ajaxSettings.flatOptions || {};
        for (key in src) src[key] !== undefined && ((flatOptions[key] ? target : deep || (deep = {}))[key] = src[key]);
        deep && jQuery.extend(true, target, deep);
        return target;
    }
    function ajaxHandleResponses(s, jqXHR, responses) {
        var firstDataType, ct, finalDataType, type, contents = s.contents, dataTypes = s.dataTypes, responseFields = s.responseFields;
        for (type in responseFields) type in responses && (jqXHR[responseFields[type]] = responses[type]);
        while ("*" === dataTypes[0]) {
            dataTypes.shift();
            ct === undefined && (ct = s.mimeType || jqXHR.getResponseHeader("Content-Type"));
        }
        if (ct) for (type in contents) if (contents[type] && contents[type].test(ct)) {
            dataTypes.unshift(type);
            break;
        }
        if (dataTypes[0] in responses) finalDataType = dataTypes[0]; else {
            for (type in responses) {
                if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                    finalDataType = type;
                    break;
                }
                firstDataType || (firstDataType = type);
            }
            finalDataType = finalDataType || firstDataType;
        }
        if (finalDataType) {
            finalDataType !== dataTypes[0] && dataTypes.unshift(finalDataType);
            return responses[finalDataType];
        }
    }
    function ajaxConvert(s, response) {
        var conv2, current, conv, tmp, converters = {}, i = 0, dataTypes = s.dataTypes.slice(), prev = dataTypes[0];
        s.dataFilter && (response = s.dataFilter(response, s.dataType));
        if (dataTypes[1]) for (conv in s.converters) converters[conv.toLowerCase()] = s.converters[conv];
        for (;current = dataTypes[++i]; ) if ("*" !== current) {
            if ("*" !== prev && prev !== current) {
                conv = converters[prev + " " + current] || converters["* " + current];
                if (!conv) for (conv2 in converters) {
                    tmp = conv2.split(" ");
                    if (tmp[1] === current) {
                        conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                        if (conv) {
                            if (true === conv) conv = converters[conv2]; else if (true !== converters[conv2]) {
                                current = tmp[0];
                                dataTypes.splice(i--, 0, current);
                            }
                            break;
                        }
                    }
                }
                if (true !== conv) if (conv && s["throws"]) response = conv(response); else try {
                    response = conv(response);
                } catch (e) {
                    return {
                        state: "parsererror",
                        error: conv ? e : "No conversion from " + prev + " to " + current
                    };
                }
            }
            prev = current;
        }
        return {
            state: "success",
            data: response
        };
    }
    function createStandardXHR() {
        try {
            return new window.XMLHttpRequest();
        } catch (e) {}
    }
    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
    }
    function createFxNow() {
        setTimeout(function() {
            fxNow = undefined;
        });
        return fxNow = jQuery.now();
    }
    function createTweens(animation, props) {
        jQuery.each(props, function(prop, value) {
            var collection = (tweeners[prop] || []).concat(tweeners["*"]), index = 0, length = collection.length;
            for (;length > index; index++) if (collection[index].call(animation, prop, value)) return;
        });
    }
    function Animation(elem, properties, options) {
        var result, stopped, index = 0, length = animationPrefilters.length, deferred = jQuery.Deferred().always(function() {
            delete tick.elem;
        }), tick = function() {
            if (stopped) return false;
            var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index = 0, length = animation.tweens.length;
            for (;length > index; index++) animation.tweens[index].run(percent);
            deferred.notifyWith(elem, [ animation, percent, remaining ]);
            if (1 > percent && length) return remaining;
            deferred.resolveWith(elem, [ animation ]);
            return false;
        }, animation = deferred.promise({
            elem: elem,
            props: jQuery.extend({}, properties),
            opts: jQuery.extend(true, {
                specialEasing: {}
            }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
                var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                animation.tweens.push(tween);
                return tween;
            },
            stop: function(gotoEnd) {
                var index = 0, length = gotoEnd ? animation.tweens.length : 0;
                if (stopped) return this;
                stopped = true;
                for (;length > index; index++) animation.tweens[index].run(1);
                gotoEnd ? deferred.resolveWith(elem, [ animation, gotoEnd ]) : deferred.rejectWith(elem, [ animation, gotoEnd ]);
                return this;
            }
        }), props = animation.props;
        propFilter(props, animation.opts.specialEasing);
        for (;length > index; index++) {
            result = animationPrefilters[index].call(animation, elem, props, animation.opts);
            if (result) return result;
        }
        createTweens(animation, props);
        jQuery.isFunction(animation.opts.start) && animation.opts.start.call(elem, animation);
        jQuery.fx.timer(jQuery.extend(tick, {
            elem: elem,
            anim: animation,
            queue: animation.opts.queue
        }));
        return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
    }
    function propFilter(props, specialEasing) {
        var value, name, index, easing, hooks;
        for (index in props) {
            name = jQuery.camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (jQuery.isArray(value)) {
                easing = value[1];
                value = props[index] = value[0];
            }
            if (index !== name) {
                props[name] = value;
                delete props[index];
            }
            hooks = jQuery.cssHooks[name];
            if (hooks && "expand" in hooks) {
                value = hooks.expand(value);
                delete props[name];
                for (index in value) if (!(index in props)) {
                    props[index] = value[index];
                    specialEasing[index] = easing;
                }
            } else specialEasing[name] = easing;
        }
    }
    function defaultPrefilter(elem, props, opts) {
        var prop, index, length, value, dataShow, toggle, tween, hooks, oldfire, anim = this, style = elem.style, orig = {}, handled = [], hidden = elem.nodeType && isHidden(elem);
        if (!opts.queue) {
            hooks = jQuery._queueHooks(elem, "fx");
            if (null == hooks.unqueued) {
                hooks.unqueued = 0;
                oldfire = hooks.empty.fire;
                hooks.empty.fire = function() {
                    hooks.unqueued || oldfire();
                };
            }
            hooks.unqueued++;
            anim.always(function() {
                anim.always(function() {
                    hooks.unqueued--;
                    jQuery.queue(elem, "fx").length || hooks.empty.fire();
                });
            });
        }
        if (1 === elem.nodeType && ("height" in props || "width" in props)) {
            opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];
            "inline" === jQuery.css(elem, "display") && "none" === jQuery.css(elem, "float") && (jQuery.support.inlineBlockNeedsLayout && "inline" !== css_defaultDisplay(elem.nodeName) ? style.zoom = 1 : style.display = "inline-block");
        }
        if (opts.overflow) {
            style.overflow = "hidden";
            jQuery.support.shrinkWrapBlocks || anim.always(function() {
                style.overflow = opts.overflow[0];
                style.overflowX = opts.overflow[1];
                style.overflowY = opts.overflow[2];
            });
        }
        for (index in props) {
            value = props[index];
            if (rfxtypes.exec(value)) {
                delete props[index];
                toggle = toggle || "toggle" === value;
                if (value === (hidden ? "hide" : "show")) continue;
                handled.push(index);
            }
        }
        length = handled.length;
        if (length) {
            dataShow = jQuery._data(elem, "fxshow") || jQuery._data(elem, "fxshow", {});
            "hidden" in dataShow && (hidden = dataShow.hidden);
            toggle && (dataShow.hidden = !hidden);
            hidden ? jQuery(elem).show() : anim.done(function() {
                jQuery(elem).hide();
            });
            anim.done(function() {
                var prop;
                jQuery._removeData(elem, "fxshow");
                for (prop in orig) jQuery.style(elem, prop, orig[prop]);
            });
            for (index = 0; length > index; index++) {
                prop = handled[index];
                tween = anim.createTween(prop, hidden ? dataShow[prop] : 0);
                orig[prop] = dataShow[prop] || jQuery.style(elem, prop);
                if (!(prop in dataShow)) {
                    dataShow[prop] = tween.start;
                    if (hidden) {
                        tween.end = tween.start;
                        tween.start = "width" === prop || "height" === prop ? 1 : 0;
                    }
                }
            }
        }
    }
    function Tween(elem, options, prop, end, easing) {
        return new Tween.prototype.init(elem, options, prop, end, easing);
    }
    function genFx(type, includeWidth) {
        var which, attrs = {
            height: type
        }, i = 0;
        includeWidth = includeWidth ? 1 : 0;
        for (;4 > i; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
        }
        includeWidth && (attrs.opacity = attrs.width = type);
        return attrs;
    }
    function getWindow(elem) {
        return jQuery.isWindow(elem) ? elem : 9 === elem.nodeType ? elem.defaultView || elem.parentWindow : false;
    }
    var readyList, rootjQuery, core_strundefined = typeof undefined, document = window.document, location = window.location, _jQuery = window.jQuery, _$ = window.$, class2type = {}, core_deletedIds = [], core_version = "1.9.1", core_concat = core_deletedIds.concat, core_push = core_deletedIds.push, core_slice = core_deletedIds.slice, core_indexOf = core_deletedIds.indexOf, core_toString = class2type.toString, core_hasOwn = class2type.hasOwnProperty, core_trim = core_version.trim, jQuery = function(selector, context) {
        return new jQuery.fn.init(selector, context, rootjQuery);
    }, core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, core_rnotwhite = /\S+/g, rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/, rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, rvalidchars = /^[\],:{}\s]*$/, rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g, rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi, fcamelCase = function(all, letter) {
        return letter.toUpperCase();
    }, completed = function(event) {
        if (document.addEventListener || "load" === event.type || "complete" === document.readyState) {
            detach();
            jQuery.ready();
        }
    }, detach = function() {
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", completed, false);
            window.removeEventListener("load", completed, false);
        } else {
            document.detachEvent("onreadystatechange", completed);
            window.detachEvent("onload", completed);
        }
    };
    jQuery.fn = jQuery.prototype = {
        jquery: core_version,
        constructor: jQuery,
        init: function(selector, context, rootjQuery) {
            var match, elem;
            if (!selector) return this;
            if ("string" == typeof selector) {
                match = "<" === selector.charAt(0) && ">" === selector.charAt(selector.length - 1) && selector.length >= 3 ? [ null, selector, null ] : rquickExpr.exec(selector);
                if (!match || !match[1] && context) return !context || context.jquery ? (context || rootjQuery).find(selector) : this.constructor(context).find(selector);
                if (match[1]) {
                    context = context instanceof jQuery ? context[0] : context;
                    jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, true));
                    if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) for (match in context) jQuery.isFunction(this[match]) ? this[match](context[match]) : this.attr(match, context[match]);
                    return this;
                }
                elem = document.getElementById(match[2]);
                if (elem && elem.parentNode) {
                    if (elem.id !== match[2]) return rootjQuery.find(selector);
                    this.length = 1;
                    this[0] = elem;
                }
                this.context = document;
                this.selector = selector;
                return this;
            }
            if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }
            if (jQuery.isFunction(selector)) return rootjQuery.ready(selector);
            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }
            return jQuery.makeArray(selector, this);
        },
        selector: "",
        length: 0,
        size: function() {
            return this.length;
        },
        toArray: function() {
            return core_slice.call(this);
        },
        get: function(num) {
            return null == num ? this.toArray() : 0 > num ? this[this.length + num] : this[num];
        },
        pushStack: function(elems) {
            var ret = jQuery.merge(this.constructor(), elems);
            ret.prevObject = this;
            ret.context = this.context;
            return ret;
        },
        each: function(callback, args) {
            return jQuery.each(this, callback, args);
        },
        ready: function(fn) {
            jQuery.ready.promise().done(fn);
            return this;
        },
        slice: function() {
            return this.pushStack(core_slice.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        eq: function(i) {
            var len = this.length, j = +i + (0 > i ? len : 0);
            return this.pushStack(j >= 0 && len > j ? [ this[j] ] : []);
        },
        map: function(callback) {
            return this.pushStack(jQuery.map(this, function(elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        push: core_push,
        sort: [].sort,
        splice: [].splice
    };
    jQuery.fn.init.prototype = jQuery.fn;
    jQuery.extend = jQuery.fn.extend = function() {
        var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if ("boolean" == typeof target) {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        "object" == typeof target || jQuery.isFunction(target) || (target = {});
        if (length === i) {
            target = this;
            --i;
        }
        for (;length > i; i++) if (null != (options = arguments[i])) for (name in options) {
            src = target[name];
            copy = options[name];
            if (target === copy) continue;
            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                if (copyIsArray) {
                    copyIsArray = false;
                    clone = src && jQuery.isArray(src) ? src : [];
                } else clone = src && jQuery.isPlainObject(src) ? src : {};
                target[name] = jQuery.extend(deep, clone, copy);
            } else copy !== undefined && (target[name] = copy);
        }
        return target;
    };
    jQuery.extend({
        noConflict: function(deep) {
            window.$ === jQuery && (window.$ = _$);
            deep && window.jQuery === jQuery && (window.jQuery = _jQuery);
            return jQuery;
        },
        isReady: false,
        readyWait: 1,
        holdReady: function(hold) {
            hold ? jQuery.readyWait++ : jQuery.ready(true);
        },
        ready: function(wait) {
            if (true === wait ? --jQuery.readyWait : jQuery.isReady) return;
            if (!document.body) return setTimeout(jQuery.ready);
            jQuery.isReady = true;
            if (true !== wait && --jQuery.readyWait > 0) return;
            readyList.resolveWith(document, [ jQuery ]);
            jQuery.fn.trigger && jQuery(document).trigger("ready").off("ready");
        },
        isFunction: function(obj) {
            return "function" === jQuery.type(obj);
        },
        isArray: Array.isArray || function(obj) {
            return "array" === jQuery.type(obj);
        },
        isWindow: function(obj) {
            return null != obj && obj == obj.window;
        },
        isNumeric: function(obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        type: function(obj) {
            if (null == obj) return String(obj);
            return "object" == typeof obj || "function" == typeof obj ? class2type[core_toString.call(obj)] || "object" : typeof obj;
        },
        isPlainObject: function(obj) {
            if (!obj || "object" !== jQuery.type(obj) || obj.nodeType || jQuery.isWindow(obj)) return false;
            try {
                if (obj.constructor && !core_hasOwn.call(obj, "constructor") && !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) return false;
            } catch (e) {
                return false;
            }
            var key;
            for (key in obj) ;
            return key === undefined || core_hasOwn.call(obj, key);
        },
        isEmptyObject: function(obj) {
            var name;
            for (name in obj) return false;
            return true;
        },
        error: function(msg) {
            throw new Error(msg);
        },
        parseHTML: function(data, context, keepScripts) {
            if (!data || "string" != typeof data) return null;
            if ("boolean" == typeof context) {
                keepScripts = context;
                context = false;
            }
            context = context || document;
            var parsed = rsingleTag.exec(data), scripts = !keepScripts && [];
            if (parsed) return [ context.createElement(parsed[1]) ];
            parsed = jQuery.buildFragment([ data ], context, scripts);
            scripts && jQuery(scripts).remove();
            return jQuery.merge([], parsed.childNodes);
        },
        parseJSON: function(data) {
            if (window.JSON && window.JSON.parse) return window.JSON.parse(data);
            if (null === data) return data;
            if ("string" == typeof data) {
                data = jQuery.trim(data);
                if (data && rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) return new Function("return " + data)();
            }
            jQuery.error("Invalid JSON: " + data);
        },
        parseXML: function(data) {
            var xml, tmp;
            if (!data || "string" != typeof data) return null;
            try {
                if (window.DOMParser) {
                    tmp = new DOMParser();
                    xml = tmp.parseFromString(data, "text/xml");
                } else {
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                }
            } catch (e) {
                xml = undefined;
            }
            xml && xml.documentElement && !xml.getElementsByTagName("parsererror").length || jQuery.error("Invalid XML: " + data);
            return xml;
        },
        noop: function() {},
        globalEval: function(data) {
            data && jQuery.trim(data) && (window.execScript || function(data) {
                window["eval"].call(window, data);
            })(data);
        },
        camelCase: function(string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
        },
        nodeName: function(elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },
        each: function(obj, callback, args) {
            var value, i = 0, length = obj.length, isArray = isArraylike(obj);
            if (args) if (isArray) for (;length > i; i++) {
                value = callback.apply(obj[i], args);
                if (false === value) break;
            } else for (i in obj) {
                value = callback.apply(obj[i], args);
                if (false === value) break;
            } else if (isArray) for (;length > i; i++) {
                value = callback.call(obj[i], i, obj[i]);
                if (false === value) break;
            } else for (i in obj) {
                value = callback.call(obj[i], i, obj[i]);
                if (false === value) break;
            }
            return obj;
        },
        trim: core_trim && !core_trim.call("﻿ ") ? function(text) {
            return null == text ? "" : core_trim.call(text);
        } : function(text) {
            return null == text ? "" : (text + "").replace(rtrim, "");
        },
        makeArray: function(arr, results) {
            var ret = results || [];
            null != arr && (isArraylike(Object(arr)) ? jQuery.merge(ret, "string" == typeof arr ? [ arr ] : arr) : core_push.call(ret, arr));
            return ret;
        },
        inArray: function(elem, arr, i) {
            var len;
            if (arr) {
                if (core_indexOf) return core_indexOf.call(arr, elem, i);
                len = arr.length;
                i = i ? 0 > i ? Math.max(0, len + i) : i : 0;
                for (;len > i; i++) if (i in arr && arr[i] === elem) return i;
            }
            return -1;
        },
        merge: function(first, second) {
            var l = second.length, i = first.length, j = 0;
            if ("number" == typeof l) for (;l > j; j++) first[i++] = second[j]; else while (second[j] !== undefined) first[i++] = second[j++];
            first.length = i;
            return first;
        },
        grep: function(elems, callback, inv) {
            var retVal, ret = [], i = 0, length = elems.length;
            inv = !!inv;
            for (;length > i; i++) {
                retVal = !!callback(elems[i], i);
                inv !== retVal && ret.push(elems[i]);
            }
            return ret;
        },
        map: function(elems, callback, arg) {
            var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];
            if (isArray) for (;length > i; i++) {
                value = callback(elems[i], i, arg);
                null != value && (ret[ret.length] = value);
            } else for (i in elems) {
                value = callback(elems[i], i, arg);
                null != value && (ret[ret.length] = value);
            }
            return core_concat.apply([], ret);
        },
        guid: 1,
        proxy: function(fn, context) {
            var args, proxy, tmp;
            if ("string" == typeof context) {
                tmp = fn[context];
                context = fn;
                fn = tmp;
            }
            if (!jQuery.isFunction(fn)) return undefined;
            args = core_slice.call(arguments, 2);
            proxy = function() {
                return fn.apply(context || this, args.concat(core_slice.call(arguments)));
            };
            proxy.guid = fn.guid = fn.guid || jQuery.guid++;
            return proxy;
        },
        access: function(elems, fn, key, value, chainable, emptyGet, raw) {
            var i = 0, length = elems.length, bulk = null == key;
            if ("object" === jQuery.type(key)) {
                chainable = true;
                for (i in key) jQuery.access(elems, fn, i, key[i], true, emptyGet, raw);
            } else if (value !== undefined) {
                chainable = true;
                jQuery.isFunction(value) || (raw = true);
                if (bulk) if (raw) {
                    fn.call(elems, value);
                    fn = null;
                } else {
                    bulk = fn;
                    fn = function(elem, key, value) {
                        return bulk.call(jQuery(elem), value);
                    };
                }
                if (fn) for (;length > i; i++) fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
            }
            return chainable ? elems : bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet;
        },
        now: function() {
            return new Date().getTime();
        }
    });
    jQuery.ready.promise = function(obj) {
        if (!readyList) {
            readyList = jQuery.Deferred();
            if ("complete" === document.readyState) setTimeout(jQuery.ready); else if (document.addEventListener) {
                document.addEventListener("DOMContentLoaded", completed, false);
                window.addEventListener("load", completed, false);
            } else {
                document.attachEvent("onreadystatechange", completed);
                window.attachEvent("onload", completed);
                var top = false;
                try {
                    top = null == window.frameElement && document.documentElement;
                } catch (e) {}
                top && top.doScroll && function doScrollCheck() {
                    if (!jQuery.isReady) {
                        try {
                            top.doScroll("left");
                        } catch (e) {
                            return setTimeout(doScrollCheck, 50);
                        }
                        detach();
                        jQuery.ready();
                    }
                }();
            }
        }
        return readyList.promise(obj);
    };
    jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    rootjQuery = jQuery(document);
    var optionsCache = {};
    jQuery.Callbacks = function(options) {
        options = "string" == typeof options ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
        var firing, memory, fired, firingLength, firingIndex, firingStart, list = [], stack = !options.once && [], fire = function(data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (;list && firingLength > firingIndex; firingIndex++) if (false === list[firingIndex].apply(data[0], data[1]) && options.stopOnFalse) {
                memory = false;
                break;
            }
            firing = false;
            list && (stack ? stack.length && fire(stack.shift()) : memory ? list = [] : self.disable());
        }, self = {
            add: function() {
                if (list) {
                    var start = list.length;
                    (function add(args) {
                        jQuery.each(args, function(_, arg) {
                            var type = jQuery.type(arg);
                            "function" === type ? options.unique && self.has(arg) || list.push(arg) : arg && arg.length && "string" !== type && add(arg);
                        });
                    })(arguments);
                    if (firing) firingLength = list.length; else if (memory) {
                        firingStart = start;
                        fire(memory);
                    }
                }
                return this;
            },
            remove: function() {
                list && jQuery.each(arguments, function(_, arg) {
                    var index;
                    while ((index = jQuery.inArray(arg, list, index)) > -1) {
                        list.splice(index, 1);
                        if (firing) {
                            firingLength >= index && firingLength--;
                            firingIndex >= index && firingIndex--;
                        }
                    }
                });
                return this;
            },
            has: function(fn) {
                return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            empty: function() {
                list = [];
                return this;
            },
            disable: function() {
                list = stack = memory = undefined;
                return this;
            },
            disabled: function() {
                return !list;
            },
            lock: function() {
                stack = undefined;
                memory || self.disable();
                return this;
            },
            locked: function() {
                return !stack;
            },
            fireWith: function(context, args) {
                args = args || [];
                args = [ context, args.slice ? args.slice() : args ];
                !list || fired && !stack || (firing ? stack.push(args) : fire(args));
                return this;
            },
            fire: function() {
                self.fireWith(this, arguments);
                return this;
            },
            fired: function() {
                return !!fired;
            }
        };
        return self;
    };
    jQuery.extend({
        Deferred: function(func) {
            var tuples = [ [ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ], [ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ], [ "notify", "progress", jQuery.Callbacks("memory") ] ], state = "pending", promise = {
                state: function() {
                    return state;
                },
                always: function() {
                    deferred.done(arguments).fail(arguments);
                    return this;
                },
                then: function() {
                    var fns = arguments;
                    return jQuery.Deferred(function(newDefer) {
                        jQuery.each(tuples, function(i, tuple) {
                            var action = tuple[0], fn = jQuery.isFunction(fns[i]) && fns[i];
                            deferred[tuple[1]](function() {
                                var returned = fn && fn.apply(this, arguments);
                                returned && jQuery.isFunction(returned.promise) ? returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify) : newDefer[action + "With"](this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments);
                            });
                        });
                        fns = null;
                    }).promise();
                },
                promise: function(obj) {
                    return null != obj ? jQuery.extend(obj, promise) : promise;
                }
            }, deferred = {};
            promise.pipe = promise.then;
            jQuery.each(tuples, function(i, tuple) {
                var list = tuple[2], stateString = tuple[3];
                promise[tuple[1]] = list.add;
                stateString && list.add(function() {
                    state = stateString;
                }, tuples[1 ^ i][2].disable, tuples[2][2].lock);
                deferred[tuple[0]] = function() {
                    deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                    return this;
                };
                deferred[tuple[0] + "With"] = list.fireWith;
            });
            promise.promise(deferred);
            func && func.call(deferred, deferred);
            return deferred;
        },
        when: function(subordinate) {
            var progressValues, progressContexts, resolveContexts, i = 0, resolveValues = core_slice.call(arguments), length = resolveValues.length, remaining = 1 !== length || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0, deferred = 1 === remaining ? subordinate : jQuery.Deferred(), updateFunc = function(i, contexts, values) {
                return function(value) {
                    contexts[i] = this;
                    values[i] = arguments.length > 1 ? core_slice.call(arguments) : value;
                    values === progressValues ? deferred.notifyWith(contexts, values) : --remaining || deferred.resolveWith(contexts, values);
                };
            };
            if (length > 1) {
                progressValues = new Array(length);
                progressContexts = new Array(length);
                resolveContexts = new Array(length);
                for (;length > i; i++) resolveValues[i] && jQuery.isFunction(resolveValues[i].promise) ? resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues)) : --remaining;
            }
            remaining || deferred.resolveWith(resolveContexts, resolveValues);
            return deferred.promise();
        }
    });
    jQuery.support = function() {
        var support, all, a, input, select, fragment, opt, eventName, isSupported, i, div = document.createElement("div");
        div.setAttribute("className", "t");
        div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
        all = div.getElementsByTagName("*");
        a = div.getElementsByTagName("a")[0];
        if (!all || !a || !all.length) return {};
        select = document.createElement("select");
        opt = select.appendChild(document.createElement("option"));
        input = div.getElementsByTagName("input")[0];
        a.style.cssText = "top:1px;float:left;opacity:.5";
        support = {
            getSetAttribute: "t" !== div.className,
            leadingWhitespace: 3 === div.firstChild.nodeType,
            tbody: !div.getElementsByTagName("tbody").length,
            htmlSerialize: !!div.getElementsByTagName("link").length,
            style: /top/.test(a.getAttribute("style")),
            hrefNormalized: "/a" === a.getAttribute("href"),
            opacity: /^0.5/.test(a.style.opacity),
            cssFloat: !!a.style.cssFloat,
            checkOn: !!input.value,
            optSelected: opt.selected,
            enctype: !!document.createElement("form").enctype,
            html5Clone: "<:nav></:nav>" !== document.createElement("nav").cloneNode(true).outerHTML,
            boxModel: "CSS1Compat" === document.compatMode,
            deleteExpando: true,
            noCloneEvent: true,
            inlineBlockNeedsLayout: false,
            shrinkWrapBlocks: false,
            reliableMarginRight: true,
            boxSizingReliable: true,
            pixelPosition: false
        };
        input.checked = true;
        support.noCloneChecked = input.cloneNode(true).checked;
        select.disabled = true;
        support.optDisabled = !opt.disabled;
        try {
            delete div.test;
        } catch (e) {
            support.deleteExpando = false;
        }
        input = document.createElement("input");
        input.setAttribute("value", "");
        support.input = "" === input.getAttribute("value");
        input.value = "t";
        input.setAttribute("type", "radio");
        support.radioValue = "t" === input.value;
        input.setAttribute("checked", "t");
        input.setAttribute("name", "t");
        fragment = document.createDocumentFragment();
        fragment.appendChild(input);
        support.appendChecked = input.checked;
        support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;
        if (div.attachEvent) {
            div.attachEvent("onclick", function() {
                support.noCloneEvent = false;
            });
            div.cloneNode(true).click();
        }
        for (i in {
            submit: true,
            change: true,
            focusin: true
        }) {
            div.setAttribute(eventName = "on" + i, "t");
            support[i + "Bubbles"] = eventName in window || false === div.attributes[eventName].expando;
        }
        div.style.backgroundClip = "content-box";
        div.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = "content-box" === div.style.backgroundClip;
        jQuery(function() {
            var container, marginDiv, tds, divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;", body = document.getElementsByTagName("body")[0];
            if (!body) return;
            container = document.createElement("div");
            container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";
            body.appendChild(container).appendChild(div);
            div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
            tds = div.getElementsByTagName("td");
            tds[0].style.cssText = "padding:0;margin:0;border:0;display:none";
            isSupported = 0 === tds[0].offsetHeight;
            tds[0].style.display = "";
            tds[1].style.display = "none";
            support.reliableHiddenOffsets = isSupported && 0 === tds[0].offsetHeight;
            div.innerHTML = "";
            div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
            support.boxSizing = 4 === div.offsetWidth;
            support.doesNotIncludeMarginInBodyOffset = 1 !== body.offsetTop;
            if (window.getComputedStyle) {
                support.pixelPosition = "1%" !== (window.getComputedStyle(div, null) || {}).top;
                support.boxSizingReliable = "4px" === (window.getComputedStyle(div, null) || {
                    width: "4px"
                }).width;
                marginDiv = div.appendChild(document.createElement("div"));
                marginDiv.style.cssText = div.style.cssText = divReset;
                marginDiv.style.marginRight = marginDiv.style.width = "0";
                div.style.width = "1px";
                support.reliableMarginRight = !parseFloat((window.getComputedStyle(marginDiv, null) || {}).marginRight);
            }
            if (typeof div.style.zoom !== core_strundefined) {
                div.innerHTML = "";
                div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
                support.inlineBlockNeedsLayout = 3 === div.offsetWidth;
                div.style.display = "block";
                div.innerHTML = "<div></div>";
                div.firstChild.style.width = "5px";
                support.shrinkWrapBlocks = 3 !== div.offsetWidth;
                support.inlineBlockNeedsLayout && (body.style.zoom = 1);
            }
            body.removeChild(container);
            container = div = tds = marginDiv = null;
        });
        all = select = fragment = opt = a = input = null;
        return support;
    }();
    var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, rmultiDash = /([A-Z])/g;
    jQuery.extend({
        cache: {},
        expando: "jQuery" + (core_version + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: true,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: true
        },
        hasData: function(elem) {
            elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando];
            return !!elem && !isEmptyDataObject(elem);
        },
        data: function(elem, name, data) {
            return internalData(elem, name, data);
        },
        removeData: function(elem, name) {
            return internalRemoveData(elem, name);
        },
        _data: function(elem, name, data) {
            return internalData(elem, name, data, true);
        },
        _removeData: function(elem, name) {
            return internalRemoveData(elem, name, true);
        },
        acceptData: function(elem) {
            if (elem.nodeType && 1 !== elem.nodeType && 9 !== elem.nodeType) return false;
            var noData = elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()];
            return !noData || true !== noData && elem.getAttribute("classid") === noData;
        }
    });
    jQuery.fn.extend({
        data: function(key, value) {
            var attrs, name, elem = this[0], i = 0, data = null;
            if (key === undefined) {
                if (this.length) {
                    data = jQuery.data(elem);
                    if (1 === elem.nodeType && !jQuery._data(elem, "parsedAttrs")) {
                        attrs = elem.attributes;
                        for (;attrs.length > i; i++) {
                            name = attrs[i].name;
                            if (!name.indexOf("data-")) {
                                name = jQuery.camelCase(name.slice(5));
                                dataAttr(elem, name, data[name]);
                            }
                        }
                        jQuery._data(elem, "parsedAttrs", true);
                    }
                }
                return data;
            }
            if ("object" == typeof key) return this.each(function() {
                jQuery.data(this, key);
            });
            return jQuery.access(this, function(value) {
                if (value === undefined) return elem ? dataAttr(elem, key, jQuery.data(elem, key)) : null;
                this.each(function() {
                    jQuery.data(this, key, value);
                });
            }, null, value, arguments.length > 1, null, true);
        },
        removeData: function(key) {
            return this.each(function() {
                jQuery.removeData(this, key);
            });
        }
    });
    jQuery.extend({
        queue: function(elem, type, data) {
            var queue;
            if (elem) {
                type = (type || "fx") + "queue";
                queue = jQuery._data(elem, type);
                data && (!queue || jQuery.isArray(data) ? queue = jQuery._data(elem, type, jQuery.makeArray(data)) : queue.push(data));
                return queue || [];
            }
        },
        dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery._queueHooks(elem, type), next = function() {
                jQuery.dequeue(elem, type);
            };
            if ("inprogress" === fn) {
                fn = queue.shift();
                startLength--;
            }
            hooks.cur = fn;
            if (fn) {
                "fx" === type && queue.unshift("inprogress");
                delete hooks.stop;
                fn.call(elem, next, hooks);
            }
            !startLength && hooks && hooks.empty.fire();
        },
        _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return jQuery._data(elem, key) || jQuery._data(elem, key, {
                empty: jQuery.Callbacks("once memory").add(function() {
                    jQuery._removeData(elem, type + "queue");
                    jQuery._removeData(elem, key);
                })
            });
        }
    });
    jQuery.fn.extend({
        queue: function(type, data) {
            var setter = 2;
            if ("string" != typeof type) {
                data = type;
                type = "fx";
                setter--;
            }
            if (setter > arguments.length) return jQuery.queue(this[0], type);
            return data === undefined ? this : this.each(function() {
                var queue = jQuery.queue(this, type, data);
                jQuery._queueHooks(this, type);
                "fx" === type && "inprogress" !== queue[0] && jQuery.dequeue(this, type);
            });
        },
        dequeue: function(type) {
            return this.each(function() {
                jQuery.dequeue(this, type);
            });
        },
        delay: function(time, type) {
            time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
            type = type || "fx";
            return this.queue(type, function(next, hooks) {
                var timeout = setTimeout(next, time);
                hooks.stop = function() {
                    clearTimeout(timeout);
                };
            });
        },
        clearQueue: function(type) {
            return this.queue(type || "fx", []);
        },
        promise: function(type, obj) {
            var tmp, count = 1, defer = jQuery.Deferred(), elements = this, i = this.length, resolve = function() {
                --count || defer.resolveWith(elements, [ elements ]);
            };
            if ("string" != typeof type) {
                obj = type;
                type = undefined;
            }
            type = type || "fx";
            while (i--) {
                tmp = jQuery._data(elements[i], type + "queueHooks");
                if (tmp && tmp.empty) {
                    count++;
                    tmp.empty.add(resolve);
                }
            }
            resolve();
            return defer.promise(obj);
        }
    });
    var nodeHook, boolHook, rclass = /[\t\r\n]/g, rreturn = /\r/g, rfocusable = /^(?:input|select|textarea|button|object)$/i, rclickable = /^(?:a|area)$/i, rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i, ruseDefault = /^(?:checked|selected)$/i, getSetAttribute = jQuery.support.getSetAttribute, getSetInput = jQuery.support.input;
    jQuery.fn.extend({
        attr: function(name, value) {
            return jQuery.access(this, jQuery.attr, name, value, arguments.length > 1);
        },
        removeAttr: function(name) {
            return this.each(function() {
                jQuery.removeAttr(this, name);
            });
        },
        prop: function(name, value) {
            return jQuery.access(this, jQuery.prop, name, value, arguments.length > 1);
        },
        removeProp: function(name) {
            name = jQuery.propFix[name] || name;
            return this.each(function() {
                try {
                    this[name] = undefined;
                    delete this[name];
                } catch (e) {}
            });
        },
        addClass: function(value) {
            var classes, elem, cur, clazz, j, i = 0, len = this.length, proceed = "string" == typeof value && value;
            if (jQuery.isFunction(value)) return this.each(function(j) {
                jQuery(this).addClass(value.call(this, j, this.className));
            });
            if (proceed) {
                classes = (value || "").match(core_rnotwhite) || [];
                for (;len > i; i++) {
                    elem = this[i];
                    cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");
                    if (cur) {
                        j = 0;
                        while (clazz = classes[j++]) 0 > cur.indexOf(" " + clazz + " ") && (cur += clazz + " ");
                        elem.className = jQuery.trim(cur);
                    }
                }
            }
            return this;
        },
        removeClass: function(value) {
            var classes, elem, cur, clazz, j, i = 0, len = this.length, proceed = 0 === arguments.length || "string" == typeof value && value;
            if (jQuery.isFunction(value)) return this.each(function(j) {
                jQuery(this).removeClass(value.call(this, j, this.className));
            });
            if (proceed) {
                classes = (value || "").match(core_rnotwhite) || [];
                for (;len > i; i++) {
                    elem = this[i];
                    cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");
                    if (cur) {
                        j = 0;
                        while (clazz = classes[j++]) while (cur.indexOf(" " + clazz + " ") >= 0) cur = cur.replace(" " + clazz + " ", " ");
                        elem.className = value ? jQuery.trim(cur) : "";
                    }
                }
            }
            return this;
        },
        toggleClass: function(value, stateVal) {
            var type = typeof value, isBool = "boolean" == typeof stateVal;
            if (jQuery.isFunction(value)) return this.each(function(i) {
                jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
            });
            return this.each(function() {
                if ("string" === type) {
                    var className, i = 0, self = jQuery(this), state = stateVal, classNames = value.match(core_rnotwhite) || [];
                    while (className = classNames[i++]) {
                        state = isBool ? state : !self.hasClass(className);
                        self[state ? "addClass" : "removeClass"](className);
                    }
                } else if (type === core_strundefined || "boolean" === type) {
                    this.className && jQuery._data(this, "__className__", this.className);
                    this.className = this.className || false === value ? "" : jQuery._data(this, "__className__") || "";
                }
            });
        },
        hasClass: function(selector) {
            var className = " " + selector + " ", i = 0, l = this.length;
            for (;l > i; i++) if (1 === this[i].nodeType && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) return true;
            return false;
        },
        val: function(value) {
            var ret, hooks, isFunction, elem = this[0];
            if (!arguments.length) {
                if (elem) {
                    hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()];
                    if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== undefined) return ret;
                    ret = elem.value;
                    return "string" == typeof ret ? ret.replace(rreturn, "") : null == ret ? "" : ret;
                }
                return;
            }
            isFunction = jQuery.isFunction(value);
            return this.each(function(i) {
                var val, self = jQuery(this);
                if (1 !== this.nodeType) return;
                val = isFunction ? value.call(this, i, self.val()) : value;
                null == val ? val = "" : "number" == typeof val ? val += "" : jQuery.isArray(val) && (val = jQuery.map(val, function(value) {
                    return null == value ? "" : value + "";
                }));
                hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];
                hooks && "set" in hooks && hooks.set(this, val, "value") !== undefined || (this.value = val);
            });
        }
    });
    jQuery.extend({
        valHooks: {
            option: {
                get: function(elem) {
                    var val = elem.attributes.value;
                    return !val || val.specified ? elem.value : elem.text;
                }
            },
            select: {
                get: function(elem) {
                    var value, option, options = elem.options, index = elem.selectedIndex, one = "select-one" === elem.type || 0 > index, values = one ? null : [], max = one ? index + 1 : options.length, i = 0 > index ? max : one ? index : 0;
                    for (;max > i; i++) {
                        option = options[i];
                        if (!(!option.selected && i !== index || (jQuery.support.optDisabled ? option.disabled : null !== option.getAttribute("disabled")) || option.parentNode.disabled && jQuery.nodeName(option.parentNode, "optgroup"))) {
                            value = jQuery(option).val();
                            if (one) return value;
                            values.push(value);
                        }
                    }
                    return values;
                },
                set: function(elem, value) {
                    var values = jQuery.makeArray(value);
                    jQuery(elem).find("option").each(function() {
                        this.selected = jQuery.inArray(jQuery(this).val(), values) >= 0;
                    });
                    values.length || (elem.selectedIndex = -1);
                    return values;
                }
            }
        },
        attr: function(elem, name, value) {
            var hooks, notxml, ret, nType = elem.nodeType;
            if (!elem || 3 === nType || 8 === nType || 2 === nType) return;
            if (typeof elem.getAttribute === core_strundefined) return jQuery.prop(elem, name, value);
            notxml = 1 !== nType || !jQuery.isXMLDoc(elem);
            if (notxml) {
                name = name.toLowerCase();
                hooks = jQuery.attrHooks[name] || (rboolean.test(name) ? boolHook : nodeHook);
            }
            if (value === undefined) {
                if (hooks && notxml && "get" in hooks && null !== (ret = hooks.get(elem, name))) return ret;
                typeof elem.getAttribute !== core_strundefined && (ret = elem.getAttribute(name));
                return null == ret ? undefined : ret;
            }
            if (null !== value) {
                if (hooks && notxml && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined) return ret;
                elem.setAttribute(name, value + "");
                return value;
            }
            jQuery.removeAttr(elem, name);
        },
        removeAttr: function(elem, value) {
            var name, propName, i = 0, attrNames = value && value.match(core_rnotwhite);
            if (attrNames && 1 === elem.nodeType) while (name = attrNames[i++]) {
                propName = jQuery.propFix[name] || name;
                rboolean.test(name) ? !getSetAttribute && ruseDefault.test(name) ? elem[jQuery.camelCase("default-" + name)] = elem[propName] = false : elem[propName] = false : jQuery.attr(elem, name, "");
                elem.removeAttribute(getSetAttribute ? name : propName);
            }
        },
        attrHooks: {
            type: {
                set: function(elem, value) {
                    if (!jQuery.support.radioValue && "radio" === value && jQuery.nodeName(elem, "input")) {
                        var val = elem.value;
                        elem.setAttribute("type", value);
                        val && (elem.value = val);
                        return value;
                    }
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function(elem, name, value) {
            var ret, hooks, notxml, nType = elem.nodeType;
            if (!elem || 3 === nType || 8 === nType || 2 === nType) return;
            notxml = 1 !== nType || !jQuery.isXMLDoc(elem);
            if (notxml) {
                name = jQuery.propFix[name] || name;
                hooks = jQuery.propHooks[name];
            }
            return value !== undefined ? hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== undefined ? ret : elem[name] = value : hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : elem[name];
        },
        propHooks: {
            tabIndex: {
                get: function(elem) {
                    var attributeNode = elem.getAttributeNode("tabindex");
                    return attributeNode && attributeNode.specified ? parseInt(attributeNode.value, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : undefined;
                }
            }
        }
    });
    boolHook = {
        get: function(elem, name) {
            var prop = jQuery.prop(elem, name), attr = "boolean" == typeof prop && elem.getAttribute(name), detail = "boolean" == typeof prop ? getSetInput && getSetAttribute ? null != attr : ruseDefault.test(name) ? elem[jQuery.camelCase("default-" + name)] : !!attr : elem.getAttributeNode(name);
            return detail && false !== detail.value ? name.toLowerCase() : undefined;
        },
        set: function(elem, value, name) {
            false === value ? jQuery.removeAttr(elem, name) : getSetInput && getSetAttribute || !ruseDefault.test(name) ? elem.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name) : elem[jQuery.camelCase("default-" + name)] = elem[name] = true;
            return name;
        }
    };
    getSetInput && getSetAttribute || (jQuery.attrHooks.value = {
        get: function(elem, name) {
            var ret = elem.getAttributeNode(name);
            return jQuery.nodeName(elem, "input") ? elem.defaultValue : ret && ret.specified ? ret.value : undefined;
        },
        set: function(elem, value, name) {
            if (!jQuery.nodeName(elem, "input")) return nodeHook && nodeHook.set(elem, value, name);
            elem.defaultValue = value;
        }
    });
    if (!getSetAttribute) {
        nodeHook = jQuery.valHooks.button = {
            get: function(elem, name) {
                var ret = elem.getAttributeNode(name);
                return ret && ("id" === name || "name" === name || "coords" === name ? "" !== ret.value : ret.specified) ? ret.value : undefined;
            },
            set: function(elem, value, name) {
                var ret = elem.getAttributeNode(name);
                ret || elem.setAttributeNode(ret = elem.ownerDocument.createAttribute(name));
                ret.value = value += "";
                return "value" === name || value === elem.getAttribute(name) ? value : undefined;
            }
        };
        jQuery.attrHooks.contenteditable = {
            get: nodeHook.get,
            set: function(elem, value, name) {
                nodeHook.set(elem, "" === value ? false : value, name);
            }
        };
        jQuery.each([ "width", "height" ], function(i, name) {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                set: function(elem, value) {
                    if ("" === value) {
                        elem.setAttribute(name, "auto");
                        return value;
                    }
                }
            });
        });
    }
    if (!jQuery.support.hrefNormalized) {
        jQuery.each([ "href", "src", "width", "height" ], function(i, name) {
            jQuery.attrHooks[name] = jQuery.extend(jQuery.attrHooks[name], {
                get: function(elem) {
                    var ret = elem.getAttribute(name, 2);
                    return null == ret ? undefined : ret;
                }
            });
        });
        jQuery.each([ "href", "src" ], function(i, name) {
            jQuery.propHooks[name] = {
                get: function(elem) {
                    return elem.getAttribute(name, 4);
                }
            };
        });
    }
    jQuery.support.style || (jQuery.attrHooks.style = {
        get: function(elem) {
            return elem.style.cssText || undefined;
        },
        set: function(elem, value) {
            return elem.style.cssText = value + "";
        }
    });
    jQuery.support.optSelected || (jQuery.propHooks.selected = jQuery.extend(jQuery.propHooks.selected, {
        get: function(elem) {
            var parent = elem.parentNode;
            if (parent) {
                parent.selectedIndex;
                parent.parentNode && parent.parentNode.selectedIndex;
            }
            return null;
        }
    }));
    jQuery.support.enctype || (jQuery.propFix.enctype = "encoding");
    jQuery.support.checkOn || jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[this] = {
            get: function(elem) {
                return null === elem.getAttribute("value") ? "on" : elem.value;
            }
        };
    });
    jQuery.each([ "radio", "checkbox" ], function() {
        jQuery.valHooks[this] = jQuery.extend(jQuery.valHooks[this], {
            set: function(elem, value) {
                if (jQuery.isArray(value)) return elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0;
            }
        });
    });
    var rformElems = /^(?:input|select|textarea)$/i, rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
    jQuery.event = {
        global: {},
        add: function(elem, types, handler, data, selector) {
            var tmp, events, t, handleObjIn, special, eventHandle, handleObj, handlers, type, namespaces, origType, elemData = jQuery._data(elem);
            if (!elemData) return;
            if (handler.handler) {
                handleObjIn = handler;
                handler = handleObjIn.handler;
                selector = handleObjIn.selector;
            }
            handler.guid || (handler.guid = jQuery.guid++);
            (events = elemData.events) || (events = elemData.events = {});
            if (!(eventHandle = elemData.handle)) {
                eventHandle = elemData.handle = function(e) {
                    return typeof jQuery === core_strundefined || e && jQuery.event.triggered === e.type ? undefined : jQuery.event.dispatch.apply(eventHandle.elem, arguments);
                };
                eventHandle.elem = elem;
            }
            types = (types || "").match(core_rnotwhite) || [ "" ];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || "").split(".").sort();
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                special = jQuery.event.special[type] || {};
                handleObj = jQuery.extend({
                    type: type,
                    origType: origType,
                    data: data,
                    handler: handler,
                    guid: handler.guid,
                    selector: selector,
                    needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                    namespace: namespaces.join(".")
                }, handleObjIn);
                if (!(handlers = events[type])) {
                    handlers = events[type] = [];
                    handlers.delegateCount = 0;
                    special.setup && false !== special.setup.call(elem, data, namespaces, eventHandle) || (elem.addEventListener ? elem.addEventListener(type, eventHandle, false) : elem.attachEvent && elem.attachEvent("on" + type, eventHandle));
                }
                if (special.add) {
                    special.add.call(elem, handleObj);
                    handleObj.handler.guid || (handleObj.handler.guid = handler.guid);
                }
                selector ? handlers.splice(handlers.delegateCount++, 0, handleObj) : handlers.push(handleObj);
                jQuery.event.global[type] = true;
            }
            elem = null;
        },
        remove: function(elem, types, handler, selector, mappedTypes) {
            var j, handleObj, tmp, origCount, t, events, special, handlers, type, namespaces, origType, elemData = jQuery.hasData(elem) && jQuery._data(elem);
            if (!elemData || !(events = elemData.events)) return;
            types = (types || "").match(core_rnotwhite) || [ "" ];
            t = types.length;
            while (t--) {
                tmp = rtypenamespace.exec(types[t]) || [];
                type = origType = tmp[1];
                namespaces = (tmp[2] || "").split(".").sort();
                if (!type) {
                    for (type in events) jQuery.event.remove(elem, type + types[t], handler, selector, true);
                    continue;
                }
                special = jQuery.event.special[type] || {};
                type = (selector ? special.delegateType : special.bindType) || type;
                handlers = events[type] || [];
                tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
                origCount = j = handlers.length;
                while (j--) {
                    handleObj = handlers[j];
                    if (!(!mappedTypes && origType !== handleObj.origType || handler && handler.guid !== handleObj.guid || tmp && !tmp.test(handleObj.namespace) || selector && selector !== handleObj.selector && ("**" !== selector || !handleObj.selector))) {
                        handlers.splice(j, 1);
                        handleObj.selector && handlers.delegateCount--;
                        special.remove && special.remove.call(elem, handleObj);
                    }
                }
                if (origCount && !handlers.length) {
                    special.teardown && false !== special.teardown.call(elem, namespaces, elemData.handle) || jQuery.removeEvent(elem, type, elemData.handle);
                    delete events[type];
                }
            }
            if (jQuery.isEmptyObject(events)) {
                delete elemData.handle;
                jQuery._removeData(elem, "events");
            }
        },
        trigger: function(event, data, elem, onlyHandlers) {
            var handle, ontype, cur, bubbleType, special, tmp, i, eventPath = [ elem || document ], type = core_hasOwn.call(event, "type") ? event.type : event, namespaces = core_hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = tmp = elem = elem || document;
            if (3 === elem.nodeType || 8 === elem.nodeType) return;
            if (rfocusMorph.test(type + jQuery.event.triggered)) return;
            if (type.indexOf(".") >= 0) {
                namespaces = type.split(".");
                type = namespaces.shift();
                namespaces.sort();
            }
            ontype = 0 > type.indexOf(":") && "on" + type;
            event = event[jQuery.expando] ? event : new jQuery.Event(type, "object" == typeof event && event);
            event.isTrigger = true;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            event.result = undefined;
            event.target || (event.target = elem);
            data = null == data ? [ event ] : jQuery.makeArray(data, [ event ]);
            special = jQuery.event.special[type] || {};
            if (!onlyHandlers && special.trigger && false === special.trigger.apply(elem, data)) return;
            if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                bubbleType = special.delegateType || type;
                rfocusMorph.test(bubbleType + type) || (cur = cur.parentNode);
                for (;cur; cur = cur.parentNode) {
                    eventPath.push(cur);
                    tmp = cur;
                }
                tmp === (elem.ownerDocument || document) && eventPath.push(tmp.defaultView || tmp.parentWindow || window);
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
                event.type = i > 1 ? bubbleType : special.bindType || type;
                handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle");
                handle && handle.apply(cur, data);
                handle = ontype && cur[ontype];
                handle && jQuery.acceptData(cur) && handle.apply && false === handle.apply(cur, data) && event.preventDefault();
            }
            event.type = type;
            if (!(onlyHandlers || event.isDefaultPrevented() || special._default && false !== special._default.apply(elem.ownerDocument, data) || "click" === type && jQuery.nodeName(elem, "a") || !jQuery.acceptData(elem) || !ontype || !elem[type] || jQuery.isWindow(elem))) {
                tmp = elem[ontype];
                tmp && (elem[ontype] = null);
                jQuery.event.triggered = type;
                try {
                    elem[type]();
                } catch (e) {}
                jQuery.event.triggered = undefined;
                tmp && (elem[ontype] = tmp);
            }
            return event.result;
        },
        dispatch: function(event) {
            event = jQuery.event.fix(event);
            var i, ret, handleObj, matched, j, handlerQueue = [], args = core_slice.call(arguments), handlers = (jQuery._data(this, "events") || {})[event.type] || [], special = jQuery.event.special[event.type] || {};
            args[0] = event;
            event.delegateTarget = this;
            if (special.preDispatch && false === special.preDispatch.call(this, event)) return;
            handlerQueue = jQuery.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
                    event.handleObj = handleObj;
                    event.data = handleObj.data;
                    ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                    if (ret !== undefined && false === (event.result = ret)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
            special.postDispatch && special.postDispatch.call(this, event);
            return event.result;
        },
        handlers: function(event, handlers) {
            var sel, handleObj, matches, i, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            if (delegateCount && cur.nodeType && (!event.button || "click" !== event.type)) for (;cur != this; cur = cur.parentNode || this) if (1 === cur.nodeType && (true !== cur.disabled || "click" !== event.type)) {
                matches = [];
                for (i = 0; delegateCount > i; i++) {
                    handleObj = handlers[i];
                    sel = handleObj.selector + " ";
                    matches[sel] === undefined && (matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [ cur ]).length);
                    matches[sel] && matches.push(handleObj);
                }
                matches.length && handlerQueue.push({
                    elem: cur,
                    handlers: matches
                });
            }
            handlers.length > delegateCount && handlerQueue.push({
                elem: this,
                handlers: handlers.slice(delegateCount)
            });
            return handlerQueue;
        },
        fix: function(event) {
            if (event[jQuery.expando]) return event;
            var i, prop, copy, type = event.type, originalEvent = event, fixHook = this.fixHooks[type];
            fixHook || (this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {});
            copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
            event = new jQuery.Event(originalEvent);
            i = copy.length;
            while (i--) {
                prop = copy[i];
                event[prop] = originalEvent[prop];
            }
            event.target || (event.target = originalEvent.srcElement || document);
            3 === event.target.nodeType && (event.target = event.target.parentNode);
            event.metaKey = !!event.metaKey;
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(event, original) {
                null == event.which && (event.which = null != original.charCode ? original.charCode : original.keyCode);
                return event;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(event, original) {
                var body, eventDoc, doc, button = original.button, fromElement = original.fromElement;
                if (null == event.pageX && null != original.clientX) {
                    eventDoc = event.target.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
                }
                !event.relatedTarget && fromElement && (event.relatedTarget = fromElement === event.target ? original.toElement : fromElement);
                event.which || button === undefined || (event.which = 1 & button ? 1 : 2 & button ? 3 : 4 & button ? 2 : 0);
                return event;
            }
        },
        special: {
            load: {
                noBubble: true
            },
            click: {
                trigger: function() {
                    if (jQuery.nodeName(this, "input") && "checkbox" === this.type && this.click) {
                        this.click();
                        return false;
                    }
                }
            },
            focus: {
                trigger: function() {
                    if (this !== document.activeElement && this.focus) try {
                        this.focus();
                        return false;
                    } catch (e) {}
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if (this === document.activeElement && this.blur) {
                        this.blur();
                        return false;
                    }
                },
                delegateType: "focusout"
            },
            beforeunload: {
                postDispatch: function(event) {
                    event.result !== undefined && (event.originalEvent.returnValue = event.result);
                }
            }
        },
        simulate: function(type, elem, event, bubble) {
            var e = jQuery.extend(new jQuery.Event(), event, {
                type: type,
                isSimulated: true,
                originalEvent: {}
            });
            bubble ? jQuery.event.trigger(e, null, elem) : jQuery.event.dispatch.call(elem, e);
            e.isDefaultPrevented() && event.preventDefault();
        }
    };
    jQuery.removeEvent = document.removeEventListener ? function(elem, type, handle) {
        elem.removeEventListener && elem.removeEventListener(type, handle, false);
    } : function(elem, type, handle) {
        var name = "on" + type;
        if (elem.detachEvent) {
            typeof elem[name] === core_strundefined && (elem[name] = null);
            elem.detachEvent(name, handle);
        }
    };
    jQuery.Event = function(src, props) {
        if (!(this instanceof jQuery.Event)) return new jQuery.Event(src, props);
        if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || false === src.returnValue || src.getPreventDefault && src.getPreventDefault() ? returnTrue : returnFalse;
        } else this.type = src;
        props && jQuery.extend(this, props);
        this.timeStamp = src && src.timeStamp || jQuery.now();
        this[jQuery.expando] = true;
    };
    jQuery.Event.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
        preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (!e) return;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        },
        stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (!e) return;
            e.stopPropagation && e.stopPropagation();
            e.cancelBubble = true;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
    };
    jQuery.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(orig, fix) {
        jQuery.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
                var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
                if (!related || related !== target && !jQuery.contains(target, related)) {
                    event.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    event.type = fix;
                }
                return ret;
            }
        };
    });
    jQuery.support.submitBubbles || (jQuery.event.special.submit = {
        setup: function() {
            if (jQuery.nodeName(this, "form")) return false;
            jQuery.event.add(this, "click._submit keypress._submit", function(e) {
                var elem = e.target, form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : undefined;
                if (form && !jQuery._data(form, "submitBubbles")) {
                    jQuery.event.add(form, "submit._submit", function(event) {
                        event._submit_bubble = true;
                    });
                    jQuery._data(form, "submitBubbles", true);
                }
            });
        },
        postDispatch: function(event) {
            if (event._submit_bubble) {
                delete event._submit_bubble;
                this.parentNode && !event.isTrigger && jQuery.event.simulate("submit", this.parentNode, event, true);
            }
        },
        teardown: function() {
            if (jQuery.nodeName(this, "form")) return false;
            jQuery.event.remove(this, "._submit");
        }
    });
    jQuery.support.changeBubbles || (jQuery.event.special.change = {
        setup: function() {
            if (rformElems.test(this.nodeName)) {
                if ("checkbox" === this.type || "radio" === this.type) {
                    jQuery.event.add(this, "propertychange._change", function(event) {
                        "checked" === event.originalEvent.propertyName && (this._just_changed = true);
                    });
                    jQuery.event.add(this, "click._change", function(event) {
                        this._just_changed && !event.isTrigger && (this._just_changed = false);
                        jQuery.event.simulate("change", this, event, true);
                    });
                }
                return false;
            }
            jQuery.event.add(this, "beforeactivate._change", function(e) {
                var elem = e.target;
                if (rformElems.test(elem.nodeName) && !jQuery._data(elem, "changeBubbles")) {
                    jQuery.event.add(elem, "change._change", function(event) {
                        !this.parentNode || event.isSimulated || event.isTrigger || jQuery.event.simulate("change", this.parentNode, event, true);
                    });
                    jQuery._data(elem, "changeBubbles", true);
                }
            });
        },
        handle: function(event) {
            var elem = event.target;
            if (this !== elem || event.isSimulated || event.isTrigger || "radio" !== elem.type && "checkbox" !== elem.type) return event.handleObj.handler.apply(this, arguments);
        },
        teardown: function() {
            jQuery.event.remove(this, "._change");
            return !rformElems.test(this.nodeName);
        }
    });
    jQuery.support.focusinBubbles || jQuery.each({
        focus: "focusin",
        blur: "focusout"
    }, function(orig, fix) {
        var attaches = 0, handler = function(event) {
            jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), true);
        };
        jQuery.event.special[fix] = {
            setup: function() {
                0 === attaches++ && document.addEventListener(orig, handler, true);
            },
            teardown: function() {
                0 === --attaches && document.removeEventListener(orig, handler, true);
            }
        };
    });
    jQuery.fn.extend({
        on: function(types, selector, data, fn, one) {
            var type, origFn;
            if ("object" == typeof types) {
                if ("string" != typeof selector) {
                    data = data || selector;
                    selector = undefined;
                }
                for (type in types) this.on(type, selector, data, types[type], one);
                return this;
            }
            if (null == data && null == fn) {
                fn = selector;
                data = selector = undefined;
            } else if (null == fn) if ("string" == typeof selector) {
                fn = data;
                data = undefined;
            } else {
                fn = data;
                data = selector;
                selector = undefined;
            }
            if (false === fn) fn = returnFalse; else if (!fn) return this;
            if (1 === one) {
                origFn = fn;
                fn = function(event) {
                    jQuery().off(event);
                    return origFn.apply(this, arguments);
                };
                fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
            }
            return this.each(function() {
                jQuery.event.add(this, types, fn, data, selector);
            });
        },
        one: function(types, selector, data, fn) {
            return this.on(types, selector, data, fn, 1);
        },
        off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
                handleObj = types.handleObj;
                jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler);
                return this;
            }
            if ("object" == typeof types) {
                for (type in types) this.off(type, selector, types[type]);
                return this;
            }
            if (false === selector || "function" == typeof selector) {
                fn = selector;
                selector = undefined;
            }
            false === fn && (fn = returnFalse);
            return this.each(function() {
                jQuery.event.remove(this, types, fn, selector);
            });
        },
        bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
        },
        unbind: function(types, fn) {
            return this.off(types, null, fn);
        },
        delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
        },
        undelegate: function(selector, types, fn) {
            return 1 === arguments.length ? this.off(selector, "**") : this.off(types, selector || "**", fn);
        },
        trigger: function(type, data) {
            return this.each(function() {
                jQuery.event.trigger(type, data, this);
            });
        },
        triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) return jQuery.event.trigger(type, data, elem, true);
        }
    });
    (function(window, undefined) {
        function isNative(fn) {
            return rnative.test(fn + "");
        }
        function createCache() {
            var cache, keys = [];
            return cache = function(key, value) {
                keys.push(key += " ") > Expr.cacheLength && delete cache[keys.shift()];
                return cache[key] = value;
            };
        }
        function markFunction(fn) {
            fn[expando] = true;
            return fn;
        }
        function assert(fn) {
            var div = document.createElement("div");
            try {
                return fn(div);
            } catch (e) {
                return false;
            } finally {
                div = null;
            }
        }
        function Sizzle(selector, context, results, seed) {
            var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
            (context ? context.ownerDocument || context : preferredDoc) !== document && setDocument(context);
            context = context || document;
            results = results || [];
            if (!selector || "string" != typeof selector) return results;
            if (1 !== (nodeType = context.nodeType) && 9 !== nodeType) return [];
            if (!documentIsXML && !seed) {
                if (match = rquickExpr.exec(selector)) if (m = match[1]) {
                    if (9 === nodeType) {
                        elem = context.getElementById(m);
                        if (!elem || !elem.parentNode) return results;
                        if (elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    } else if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                        results.push(elem);
                        return results;
                    }
                } else {
                    if (match[2]) {
                        push.apply(results, slice.call(context.getElementsByTagName(selector), 0));
                        return results;
                    }
                    if ((m = match[3]) && support.getByClassName && context.getElementsByClassName) {
                        push.apply(results, slice.call(context.getElementsByClassName(m), 0));
                        return results;
                    }
                }
                if (support.qsa && !rbuggyQSA.test(selector)) {
                    old = true;
                    nid = expando;
                    newContext = context;
                    newSelector = 9 === nodeType && selector;
                    if (1 === nodeType && "object" !== context.nodeName.toLowerCase()) {
                        groups = tokenize(selector);
                        (old = context.getAttribute("id")) ? nid = old.replace(rescape, "\\$&") : context.setAttribute("id", nid);
                        nid = "[id='" + nid + "'] ";
                        i = groups.length;
                        while (i--) groups[i] = nid + toSelector(groups[i]);
                        newContext = rsibling.test(selector) && context.parentNode || context;
                        newSelector = groups.join(",");
                    }
                    if (newSelector) try {
                        push.apply(results, slice.call(newContext.querySelectorAll(newSelector), 0));
                        return results;
                    } catch (qsaError) {} finally {
                        old || context.removeAttribute("id");
                    }
                }
            }
            return select(selector.replace(rtrim, "$1"), context, results, seed);
        }
        function siblingCheck(a, b) {
            var cur = b && a, diff = cur && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
            if (diff) return diff;
            if (cur) while (cur = cur.nextSibling) if (cur === b) return -1;
            return a ? 1 : -1;
        }
        function createInputPseudo(type) {
            return function(elem) {
                var name = elem.nodeName.toLowerCase();
                return "input" === name && elem.type === type;
            };
        }
        function createButtonPseudo(type) {
            return function(elem) {
                var name = elem.nodeName.toLowerCase();
                return ("input" === name || "button" === name) && elem.type === type;
            };
        }
        function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
                argument = +argument;
                return markFunction(function(seed, matches) {
                    var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length;
                    while (i--) seed[j = matchIndexes[i]] && (seed[j] = !(matches[j] = seed[j]));
                });
            });
        }
        function tokenize(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) return parseOnly ? 0 : cached.slice(0);
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
                if (!matched || (match = rcomma.exec(soFar))) {
                    match && (soFar = soFar.slice(match[0].length) || soFar);
                    groups.push(tokens = []);
                }
                matched = false;
                if (match = rcombinators.exec(soFar)) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        type: match[0].replace(rtrim, " ")
                    });
                    soFar = soFar.slice(matched.length);
                }
                for (type in Expr.filter) if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        type: type,
                        matches: match
                    });
                    soFar = soFar.slice(matched.length);
                }
                if (!matched) break;
            }
            return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0);
        }
        function toSelector(tokens) {
            var i = 0, len = tokens.length, selector = "";
            for (;len > i; i++) selector += tokens[i].value;
            return selector;
        }
        function addCombinator(matcher, combinator, base) {
            var dir = combinator.dir, checkNonElements = base && "parentNode" === dir, doneName = done++;
            return combinator.first ? function(elem, context, xml) {
                while (elem = elem[dir]) if (1 === elem.nodeType || checkNonElements) return matcher(elem, context, xml);
            } : function(elem, context, xml) {
                var data, cache, outerCache, dirkey = dirruns + " " + doneName;
                if (xml) {
                    while (elem = elem[dir]) if ((1 === elem.nodeType || checkNonElements) && matcher(elem, context, xml)) return true;
                } else while (elem = elem[dir]) if (1 === elem.nodeType || checkNonElements) {
                    outerCache = elem[expando] || (elem[expando] = {});
                    if ((cache = outerCache[dir]) && cache[0] === dirkey) {
                        if (true === (data = cache[1]) || data === cachedruns) return true === data;
                    } else {
                        cache = outerCache[dir] = [ dirkey ];
                        cache[1] = matcher(elem, context, xml) || cachedruns;
                        if (true === cache[1]) return true;
                    }
                }
            };
        }
        function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
                var i = matchers.length;
                while (i--) if (!matchers[i](elem, context, xml)) return false;
                return true;
            } : matchers[0];
        }
        function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = null != map;
            for (;len > i; i++) if ((elem = unmatched[i]) && (!filter || filter(elem, context, xml))) {
                newUnmatched.push(elem);
                mapped && map.push(i);
            }
            return newUnmatched;
        }
        function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            postFilter && !postFilter[expando] && (postFilter = setMatcher(postFilter));
            postFinder && !postFinder[expando] && (postFinder = setMatcher(postFinder, postSelector));
            return markFunction(function(seed, results, context, xml) {
                var temp, i, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || "*", context.nodeType ? [ context ] : context, []), matcherIn = !preFilter || !seed && selector ? elems : condense(elems, preMap, preFilter, context, xml), matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                matcher && matcher(matcherIn, matcherOut, context, xml);
                if (postFilter) {
                    temp = condense(matcherOut, postMap);
                    postFilter(temp, [], context, xml);
                    i = temp.length;
                    while (i--) (elem = temp[i]) && (matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem));
                }
                if (seed) {
                    if (postFinder || preFilter) {
                        if (postFinder) {
                            temp = [];
                            i = matcherOut.length;
                            while (i--) (elem = matcherOut[i]) && temp.push(matcherIn[i] = elem);
                            postFinder(null, matcherOut = [], temp, xml);
                        }
                        i = matcherOut.length;
                        while (i--) (elem = matcherOut[i]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1 && (seed[temp] = !(results[temp] = elem));
                    }
                } else {
                    matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut);
                    postFinder ? postFinder(null, results, matcherOut, xml) : push.apply(results, matcherOut);
                }
            });
        }
        function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
                return elem === checkContext;
            }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
                return indexOf.call(checkContext, elem) > -1;
            }, implicitRelative, true), matchers = [ function(elem, context, xml) {
                return !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
            } ];
            for (;len > i; i++) if (matcher = Expr.relative[tokens[i].type]) matchers = [ addCombinator(elementMatcher(matchers), matcher) ]; else {
                matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);
                if (matcher[expando]) {
                    j = ++i;
                    for (;len > j; j++) if (Expr.relative[tokens[j].type]) break;
                    return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1)).replace(rtrim, "$1"), matcher, j > i && matcherFromTokens(tokens.slice(i, j)), len > j && matcherFromTokens(tokens = tokens.slice(j)), len > j && toSelector(tokens));
                }
                matchers.push(matcher);
            }
            return elementMatcher(matchers);
        }
        function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var matcherCachedRuns = 0, bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, expandContext) {
                var elem, j, matcher, setMatched = [], matchedCount = 0, i = "0", unmatched = seed && [], outermost = null != expandContext, contextBackup = outermostContext, elems = seed || byElement && Expr.find["TAG"]("*", expandContext && context.parentNode || context), dirrunsUnique = dirruns += null == contextBackup ? 1 : Math.random() || .1;
                if (outermost) {
                    outermostContext = context !== document && context;
                    cachedruns = matcherCachedRuns;
                }
                for (;null != (elem = elems[i]); i++) {
                    if (byElement && elem) {
                        j = 0;
                        while (matcher = elementMatchers[j++]) if (matcher(elem, context, xml)) {
                            results.push(elem);
                            break;
                        }
                        if (outermost) {
                            dirruns = dirrunsUnique;
                            cachedruns = ++matcherCachedRuns;
                        }
                    }
                    if (bySet) {
                        (elem = !matcher && elem) && matchedCount--;
                        seed && unmatched.push(elem);
                    }
                }
                matchedCount += i;
                if (bySet && i !== matchedCount) {
                    j = 0;
                    while (matcher = setMatchers[j++]) matcher(unmatched, setMatched, context, xml);
                    if (seed) {
                        if (matchedCount > 0) while (i--) unmatched[i] || setMatched[i] || (setMatched[i] = pop.call(results));
                        setMatched = condense(setMatched);
                    }
                    push.apply(results, setMatched);
                    outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1 && Sizzle.uniqueSort(results);
                }
                if (outermost) {
                    dirruns = dirrunsUnique;
                    outermostContext = contextBackup;
                }
                return unmatched;
            };
            return bySet ? markFunction(superMatcher) : superMatcher;
        }
        function multipleContexts(selector, contexts, results) {
            var i = 0, len = contexts.length;
            for (;len > i; i++) Sizzle(selector, contexts[i], results);
            return results;
        }
        function select(selector, context, results, seed) {
            var i, tokens, token, type, find, match = tokenize(selector);
            if (!seed && 1 === match.length) {
                tokens = match[0] = match[0].slice(0);
                if (tokens.length > 2 && "ID" === (token = tokens[0]).type && 9 === context.nodeType && !documentIsXML && Expr.relative[tokens[1].type]) {
                    context = Expr.find["ID"](token.matches[0].replace(runescape, funescape), context)[0];
                    if (!context) return results;
                    selector = selector.slice(tokens.shift().value.length);
                }
                i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
                while (i--) {
                    token = tokens[i];
                    if (Expr.relative[type = token.type]) break;
                    if ((find = Expr.find[type]) && (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && context.parentNode || context))) {
                        tokens.splice(i, 1);
                        selector = seed.length && toSelector(tokens);
                        if (!selector) {
                            push.apply(results, slice.call(seed, 0));
                            return results;
                        }
                        break;
                    }
                }
            }
            compile(selector, match)(seed, context, documentIsXML, results, rsibling.test(selector));
            return results;
        }
        function setFilters() {}
        var i, cachedruns, Expr, getText, isXML, compile, hasDuplicate, outermostContext, setDocument, document, docElem, documentIsXML, rbuggyQSA, rbuggyMatches, matches, contains, sortOrder, expando = "sizzle" + -new Date(), preferredDoc = window.document, support = {}, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), strundefined = typeof undefined, MAX_NEGATIVE = 1 << 31, arr = [], pop = arr.pop, push = arr.push, slice = arr.slice, indexOf = arr.indexOf || function(elem) {
            var i = 0, len = this.length;
            for (;len > i; i++) if (this[i] === elem) return i;
            return -1;
        }, whitespace = "[\\x20\\t\\r\\n\\f]", characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", identifier = characterEncoding.replace("w", "w#"), operators = "([*^$|!~]?=)", attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace + "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]", pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)", rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rcombinators = new RegExp("^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
            ID: new RegExp("^#(" + characterEncoding + ")"),
            CLASS: new RegExp("^\\.(" + characterEncoding + ")"),
            NAME: new RegExp("^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]"),
            TAG: new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
            ATTR: new RegExp("^" + attributes),
            PSEUDO: new RegExp("^" + pseudos),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
        }, rsibling = /[\x20\t\r\n\f]*[+~]/, rnative = /^[^{]+\{\s*\[native code/, rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rescape = /'|\\/g, rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g, runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g, funescape = function(_, escaped) {
            var high = "0x" + escaped - 65536;
            return high !== high ? escaped : 0 > high ? String.fromCharCode(high + 65536) : String.fromCharCode(55296 | high >> 10, 56320 | 1023 & high);
        };
        try {
            slice.call(preferredDoc.documentElement.childNodes, 0)[0].nodeType;
        } catch (e) {
            slice = function(i) {
                var elem, results = [];
                while (elem = this[i++]) results.push(elem);
                return results;
            };
        }
        isXML = Sizzle.isXML = function(elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? "HTML" !== documentElement.nodeName : false;
        };
        setDocument = Sizzle.setDocument = function(node) {
            var doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc === document || 9 !== doc.nodeType || !doc.documentElement) return document;
            document = doc;
            docElem = doc.documentElement;
            documentIsXML = isXML(doc);
            support.tagNameNoComments = assert(function(div) {
                div.appendChild(doc.createComment(""));
                return !div.getElementsByTagName("*").length;
            });
            support.attributes = assert(function(div) {
                div.innerHTML = "<select></select>";
                var type = typeof div.lastChild.getAttribute("multiple");
                return "boolean" !== type && "string" !== type;
            });
            support.getByClassName = assert(function(div) {
                div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
                if (!div.getElementsByClassName || !div.getElementsByClassName("e").length) return false;
                div.lastChild.className = "e";
                return 2 === div.getElementsByClassName("e").length;
            });
            support.getByName = assert(function(div) {
                div.id = expando + 0;
                div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
                docElem.insertBefore(div, docElem.firstChild);
                var pass = doc.getElementsByName && doc.getElementsByName(expando).length === 2 + doc.getElementsByName(expando + 0).length;
                support.getIdNotName = !doc.getElementById(expando);
                docElem.removeChild(div);
                return pass;
            });
            Expr.attrHandle = assert(function(div) {
                div.innerHTML = "<a href='#'></a>";
                return div.firstChild && typeof div.firstChild.getAttribute !== strundefined && "#" === div.firstChild.getAttribute("href");
            }) ? {} : {
                href: function(elem) {
                    return elem.getAttribute("href", 2);
                },
                type: function(elem) {
                    return elem.getAttribute("type");
                }
            };
            if (support.getIdNotName) {
                Expr.find["ID"] = function(id, context) {
                    if (typeof context.getElementById !== strundefined && !documentIsXML) {
                        var m = context.getElementById(id);
                        return m && m.parentNode ? [ m ] : [];
                    }
                };
                Expr.filter["ID"] = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        return elem.getAttribute("id") === attrId;
                    };
                };
            } else {
                Expr.find["ID"] = function(id, context) {
                    if (typeof context.getElementById !== strundefined && !documentIsXML) {
                        var m = context.getElementById(id);
                        return m ? m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ? [ m ] : undefined : [];
                    }
                };
                Expr.filter["ID"] = function(id) {
                    var attrId = id.replace(runescape, funescape);
                    return function(elem) {
                        var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                        return node && node.value === attrId;
                    };
                };
            }
            Expr.find["TAG"] = support.tagNameNoComments ? function(tag, context) {
                if (typeof context.getElementsByTagName !== strundefined) return context.getElementsByTagName(tag);
            } : function(tag, context) {
                var elem, tmp = [], i = 0, results = context.getElementsByTagName(tag);
                if ("*" === tag) {
                    while (elem = results[i++]) 1 === elem.nodeType && tmp.push(elem);
                    return tmp;
                }
                return results;
            };
            Expr.find["NAME"] = support.getByName && function(tag, context) {
                if (typeof context.getElementsByName !== strundefined) return context.getElementsByName(name);
            };
            Expr.find["CLASS"] = support.getByClassName && function(className, context) {
                if (typeof context.getElementsByClassName !== strundefined && !documentIsXML) return context.getElementsByClassName(className);
            };
            rbuggyMatches = [];
            rbuggyQSA = [ ":focus" ];
            if (support.qsa = isNative(doc.querySelectorAll)) {
                assert(function(div) {
                    div.innerHTML = "<select><option selected=''></option></select>";
                    div.querySelectorAll("[selected]").length || rbuggyQSA.push("\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
                    div.querySelectorAll(":checked").length || rbuggyQSA.push(":checked");
                });
                assert(function(div) {
                    div.innerHTML = "<input type='hidden' i=''/>";
                    div.querySelectorAll("[i^='']").length && rbuggyQSA.push("[*^$]=" + whitespace + "*(?:\"\"|'')");
                    div.querySelectorAll(":enabled").length || rbuggyQSA.push(":enabled", ":disabled");
                    div.querySelectorAll("*,:x");
                    rbuggyQSA.push(",.*:");
                });
            }
            (support.matchesSelector = isNative(matches = docElem.matchesSelector || docElem.mozMatchesSelector || docElem.webkitMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) && assert(function(div) {
                support.disconnectedMatch = matches.call(div, "div");
                matches.call(div, "[s!='']:x");
                rbuggyMatches.push("!=", pseudos);
            });
            rbuggyQSA = new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = new RegExp(rbuggyMatches.join("|"));
            contains = isNative(docElem.contains) || docElem.compareDocumentPosition ? function(a, b) {
                var adown = 9 === a.nodeType ? a.documentElement : a, bup = b && b.parentNode;
                return a === bup || !!(bup && 1 === bup.nodeType && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup)));
            } : function(a, b) {
                if (b) while (b = b.parentNode) if (b === a) return true;
                return false;
            };
            sortOrder = docElem.compareDocumentPosition ? function(a, b) {
                var compare;
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                if (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition(b)) {
                    if (1 & compare || a.parentNode && 11 === a.parentNode.nodeType) {
                        if (a === doc || contains(preferredDoc, a)) return -1;
                        if (b === doc || contains(preferredDoc, b)) return 1;
                        return 0;
                    }
                    return 4 & compare ? -1 : 1;
                }
                return a.compareDocumentPosition ? -1 : 1;
            } : function(a, b) {
                var cur, i = 0, aup = a.parentNode, bup = b.parentNode, ap = [ a ], bp = [ b ];
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }
                if (!aup || !bup) return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : 0;
                if (aup === bup) return siblingCheck(a, b);
                cur = a;
                while (cur = cur.parentNode) ap.unshift(cur);
                cur = b;
                while (cur = cur.parentNode) bp.unshift(cur);
                while (ap[i] === bp[i]) i++;
                return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0;
            };
            hasDuplicate = false;
            [ 0, 0 ].sort(sortOrder);
            support.detectDuplicates = hasDuplicate;
            return document;
        };
        Sizzle.matches = function(expr, elements) {
            return Sizzle(expr, null, null, elements);
        };
        Sizzle.matchesSelector = function(elem, expr) {
            (elem.ownerDocument || elem) !== document && setDocument(elem);
            expr = expr.replace(rattributeQuotes, "='$1']");
            if (!(!support.matchesSelector || documentIsXML || rbuggyMatches && rbuggyMatches.test(expr) || rbuggyQSA.test(expr))) try {
                var ret = matches.call(elem, expr);
                if (ret || support.disconnectedMatch || elem.document && 11 !== elem.document.nodeType) return ret;
            } catch (e) {}
            return Sizzle(expr, document, null, [ elem ]).length > 0;
        };
        Sizzle.contains = function(context, elem) {
            (context.ownerDocument || context) !== document && setDocument(context);
            return contains(context, elem);
        };
        Sizzle.attr = function(elem, name) {
            var val;
            (elem.ownerDocument || elem) !== document && setDocument(elem);
            documentIsXML || (name = name.toLowerCase());
            if (val = Expr.attrHandle[name]) return val(elem);
            if (documentIsXML || support.attributes) return elem.getAttribute(name);
            return ((val = elem.getAttributeNode(name)) || elem.getAttribute(name)) && true === elem[name] ? name : val && val.specified ? val.value : null;
        };
        Sizzle.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
        };
        Sizzle.uniqueSort = function(results) {
            var elem, duplicates = [], i = 1, j = 0;
            hasDuplicate = !support.detectDuplicates;
            results.sort(sortOrder);
            if (hasDuplicate) {
                for (;elem = results[i]; i++) elem === results[i - 1] && (j = duplicates.push(i));
                while (j--) results.splice(duplicates[j], 1);
            }
            return results;
        };
        getText = Sizzle.getText = function(elem) {
            var node, ret = "", i = 0, nodeType = elem.nodeType;
            if (nodeType) {
                if (1 === nodeType || 9 === nodeType || 11 === nodeType) {
                    if ("string" == typeof elem.textContent) return elem.textContent;
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += getText(elem);
                } else if (3 === nodeType || 4 === nodeType) return elem.nodeValue;
            } else for (;node = elem[i]; i++) ret += getText(node);
            return ret;
        };
        Expr = Sizzle.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: true
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: true
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(match) {
                    match[1] = match[1].replace(runescape, funescape);
                    match[3] = (match[4] || match[5] || "").replace(runescape, funescape);
                    "~=" === match[2] && (match[3] = " " + match[3] + " ");
                    return match.slice(0, 4);
                },
                CHILD: function(match) {
                    match[1] = match[1].toLowerCase();
                    if ("nth" === match[1].slice(0, 3)) {
                        match[3] || Sizzle.error(match[0]);
                        match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * ("even" === match[3] || "odd" === match[3]));
                        match[5] = +(match[7] + match[8] || "odd" === match[3]);
                    } else match[3] && Sizzle.error(match[0]);
                    return match;
                },
                PSEUDO: function(match) {
                    var excess, unquoted = !match[5] && match[2];
                    if (matchExpr["CHILD"].test(match[0])) return null;
                    if (match[4]) match[2] = match[4]; else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                        match[0] = match[0].slice(0, excess);
                        match[2] = unquoted.slice(0, excess);
                    }
                    return match.slice(0, 3);
                }
            },
            filter: {
                TAG: function(nodeName) {
                    if ("*" === nodeName) return function() {
                        return true;
                    };
                    nodeName = nodeName.replace(runescape, funescape).toLowerCase();
                    return function(elem) {
                        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                    };
                },
                CLASS: function(className) {
                    var pattern = classCache[className + " "];
                    return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                        return pattern.test(elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
                    });
                },
                ATTR: function(name, operator, check) {
                    return function(elem) {
                        var result = Sizzle.attr(elem, name);
                        if (null == result) return "!=" === operator;
                        if (!operator) return true;
                        result += "";
                        return "=" === operator ? result === check : "!=" === operator ? result !== check : "^=" === operator ? check && 0 === result.indexOf(check) : "*=" === operator ? check && result.indexOf(check) > -1 : "$=" === operator ? check && result.slice(-check.length) === check : "~=" === operator ? (" " + result + " ").indexOf(check) > -1 : "|=" === operator ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
                    };
                },
                CHILD: function(type, what, argument, first, last) {
                    var simple = "nth" !== type.slice(0, 3), forward = "last" !== type.slice(-4), ofType = "of-type" === what;
                    return 1 === first && 0 === last ? function(elem) {
                        return !!elem.parentNode;
                    } : function(elem, context, xml) {
                        var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
                        if (parent) {
                            if (simple) {
                                while (dir) {
                                    node = elem;
                                    while (node = node[dir]) if (ofType ? node.nodeName.toLowerCase() === name : 1 === node.nodeType) return false;
                                    start = dir = "only" === type && !start && "nextSibling";
                                }
                                return true;
                            }
                            start = [ forward ? parent.firstChild : parent.lastChild ];
                            if (forward && useCache) {
                                outerCache = parent[expando] || (parent[expando] = {});
                                cache = outerCache[type] || [];
                                nodeIndex = cache[0] === dirruns && cache[1];
                                diff = cache[0] === dirruns && cache[2];
                                node = nodeIndex && parent.childNodes[nodeIndex];
                                while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) if (1 === node.nodeType && ++diff && node === elem) {
                                    outerCache[type] = [ dirruns, nodeIndex, diff ];
                                    break;
                                }
                            } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) diff = cache[1]; else while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) if ((ofType ? node.nodeName.toLowerCase() === name : 1 === node.nodeType) && ++diff) {
                                useCache && ((node[expando] || (node[expando] = {}))[type] = [ dirruns, diff ]);
                                if (node === elem) break;
                            }
                            diff -= last;
                            return diff === first || 0 === diff % first && diff / first >= 0;
                        }
                    };
                },
                PSEUDO: function(pseudo, argument) {
                    var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
                    if (fn[expando]) return fn(argument);
                    if (fn.length > 1) {
                        args = [ pseudo, pseudo, "", argument ];
                        return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches) {
                            var idx, matched = fn(seed, argument), i = matched.length;
                            while (i--) {
                                idx = indexOf.call(seed, matched[i]);
                                seed[idx] = !(matches[idx] = matched[i]);
                            }
                        }) : function(elem) {
                            return fn(elem, 0, args);
                        };
                    }
                    return fn;
                }
            },
            pseudos: {
                not: markFunction(function(selector) {
                    var input = [], results = [], matcher = compile(selector.replace(rtrim, "$1"));
                    return matcher[expando] ? markFunction(function(seed, matches, context, xml) {
                        var elem, unmatched = matcher(seed, null, xml, []), i = seed.length;
                        while (i--) (elem = unmatched[i]) && (seed[i] = !(matches[i] = elem));
                    }) : function(elem, context, xml) {
                        input[0] = elem;
                        matcher(input, null, xml, results);
                        return !results.pop();
                    };
                }),
                has: markFunction(function(selector) {
                    return function(elem) {
                        return Sizzle(selector, elem).length > 0;
                    };
                }),
                contains: markFunction(function(text) {
                    return function(elem) {
                        return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                    };
                }),
                lang: markFunction(function(lang) {
                    ridentifier.test(lang || "") || Sizzle.error("unsupported lang: " + lang);
                    lang = lang.replace(runescape, funescape).toLowerCase();
                    return function(elem) {
                        var elemLang;
                        do if (elemLang = documentIsXML ? elem.getAttribute("xml:lang") || elem.getAttribute("lang") : elem.lang) {
                            elemLang = elemLang.toLowerCase();
                            return elemLang === lang || 0 === elemLang.indexOf(lang + "-");
                        } while ((elem = elem.parentNode) && 1 === elem.nodeType);
                        return false;
                    };
                }),
                target: function(elem) {
                    var hash = window.location && window.location.hash;
                    return hash && hash.slice(1) === elem.id;
                },
                root: function(elem) {
                    return elem === docElem;
                },
                focus: function(elem) {
                    return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                },
                enabled: function(elem) {
                    return false === elem.disabled;
                },
                disabled: function(elem) {
                    return true === elem.disabled;
                },
                checked: function(elem) {
                    var nodeName = elem.nodeName.toLowerCase();
                    return "input" === nodeName && !!elem.checked || "option" === nodeName && !!elem.selected;
                },
                selected: function(elem) {
                    elem.parentNode && elem.parentNode.selectedIndex;
                    return true === elem.selected;
                },
                empty: function(elem) {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) if (elem.nodeName > "@" || 3 === elem.nodeType || 4 === elem.nodeType) return false;
                    return true;
                },
                parent: function(elem) {
                    return !Expr.pseudos["empty"](elem);
                },
                header: function(elem) {
                    return rheader.test(elem.nodeName);
                },
                input: function(elem) {
                    return rinputs.test(elem.nodeName);
                },
                button: function(elem) {
                    var name = elem.nodeName.toLowerCase();
                    return "input" === name && "button" === elem.type || "button" === name;
                },
                text: function(elem) {
                    var attr;
                    return "input" === elem.nodeName.toLowerCase() && "text" === elem.type && (null == (attr = elem.getAttribute("type")) || attr.toLowerCase() === elem.type);
                },
                first: createPositionalPseudo(function() {
                    return [ 0 ];
                }),
                last: createPositionalPseudo(function(matchIndexes, length) {
                    return [ length - 1 ];
                }),
                eq: createPositionalPseudo(function(matchIndexes, length, argument) {
                    return [ 0 > argument ? argument + length : argument ];
                }),
                even: createPositionalPseudo(function(matchIndexes, length) {
                    var i = 0;
                    for (;length > i; i += 2) matchIndexes.push(i);
                    return matchIndexes;
                }),
                odd: createPositionalPseudo(function(matchIndexes, length) {
                    var i = 1;
                    for (;length > i; i += 2) matchIndexes.push(i);
                    return matchIndexes;
                }),
                lt: createPositionalPseudo(function(matchIndexes, length, argument) {
                    var i = 0 > argument ? argument + length : argument;
                    for (;--i >= 0; ) matchIndexes.push(i);
                    return matchIndexes;
                }),
                gt: createPositionalPseudo(function(matchIndexes, length, argument) {
                    var i = 0 > argument ? argument + length : argument;
                    for (;length > ++i; ) matchIndexes.push(i);
                    return matchIndexes;
                })
            }
        };
        for (i in {
            radio: true,
            checkbox: true,
            file: true,
            password: true,
            image: true
        }) Expr.pseudos[i] = createInputPseudo(i);
        for (i in {
            submit: true,
            reset: true
        }) Expr.pseudos[i] = createButtonPseudo(i);
        compile = Sizzle.compile = function(selector, group) {
            var i, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
            if (!cached) {
                group || (group = tokenize(selector));
                i = group.length;
                while (i--) {
                    cached = matcherFromTokens(group[i]);
                    cached[expando] ? setMatchers.push(cached) : elementMatchers.push(cached);
                }
                cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
            }
            return cached;
        };
        Expr.pseudos["nth"] = Expr.pseudos["eq"];
        Expr.filters = setFilters.prototype = Expr.pseudos;
        Expr.setFilters = new setFilters();
        setDocument();
        Sizzle.attr = jQuery.attr;
        jQuery.find = Sizzle;
        jQuery.expr = Sizzle.selectors;
        jQuery.expr[":"] = jQuery.expr.pseudos;
        jQuery.unique = Sizzle.uniqueSort;
        jQuery.text = Sizzle.getText;
        jQuery.isXMLDoc = Sizzle.isXML;
        jQuery.contains = Sizzle.contains;
    })(window);
    var runtil = /Until$/, rparentsprev = /^(?:parents|prev(?:Until|All))/, isSimple = /^.[^:#\[\.,]*$/, rneedsContext = jQuery.expr.match.needsContext, guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    };
    jQuery.fn.extend({
        find: function(selector) {
            var i, ret, self, len = this.length;
            if ("string" != typeof selector) {
                self = this;
                return this.pushStack(jQuery(selector).filter(function() {
                    for (i = 0; len > i; i++) if (jQuery.contains(self[i], this)) return true;
                }));
            }
            ret = [];
            for (i = 0; len > i; i++) jQuery.find(selector, this[i], ret);
            ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret);
            ret.selector = (this.selector ? this.selector + " " : "") + selector;
            return ret;
        },
        has: function(target) {
            var i, targets = jQuery(target, this), len = targets.length;
            return this.filter(function() {
                for (i = 0; len > i; i++) if (jQuery.contains(this, targets[i])) return true;
            });
        },
        not: function(selector) {
            return this.pushStack(winnow(this, selector, false));
        },
        filter: function(selector) {
            return this.pushStack(winnow(this, selector, true));
        },
        is: function(selector) {
            return !!selector && ("string" == typeof selector ? rneedsContext.test(selector) ? jQuery(selector, this.context).index(this[0]) >= 0 : jQuery.filter(selector, this).length > 0 : this.filter(selector).length > 0);
        },
        closest: function(selectors, context) {
            var cur, i = 0, l = this.length, ret = [], pos = rneedsContext.test(selectors) || "string" != typeof selectors ? jQuery(selectors, context || this.context) : 0;
            for (;l > i; i++) {
                cur = this[i];
                while (cur && cur.ownerDocument && cur !== context && 11 !== cur.nodeType) {
                    if (pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors)) {
                        ret.push(cur);
                        break;
                    }
                    cur = cur.parentNode;
                }
            }
            return this.pushStack(ret.length > 1 ? jQuery.unique(ret) : ret);
        },
        index: function(elem) {
            if (!elem) return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            if ("string" == typeof elem) return jQuery.inArray(this[0], jQuery(elem));
            return jQuery.inArray(elem.jquery ? elem[0] : elem, this);
        },
        add: function(selector, context) {
            var set = "string" == typeof selector ? jQuery(selector, context) : jQuery.makeArray(selector && selector.nodeType ? [ selector ] : selector), all = jQuery.merge(this.get(), set);
            return this.pushStack(jQuery.unique(all));
        },
        addBack: function(selector) {
            return this.add(null == selector ? this.prevObject : this.prevObject.filter(selector));
        }
    });
    jQuery.fn.andSelf = jQuery.fn.addBack;
    jQuery.each({
        parent: function(elem) {
            var parent = elem.parentNode;
            return parent && 11 !== parent.nodeType ? parent : null;
        },
        parents: function(elem) {
            return jQuery.dir(elem, "parentNode");
        },
        parentsUntil: function(elem, i, until) {
            return jQuery.dir(elem, "parentNode", until);
        },
        next: function(elem) {
            return sibling(elem, "nextSibling");
        },
        prev: function(elem) {
            return sibling(elem, "previousSibling");
        },
        nextAll: function(elem) {
            return jQuery.dir(elem, "nextSibling");
        },
        prevAll: function(elem) {
            return jQuery.dir(elem, "previousSibling");
        },
        nextUntil: function(elem, i, until) {
            return jQuery.dir(elem, "nextSibling", until);
        },
        prevUntil: function(elem, i, until) {
            return jQuery.dir(elem, "previousSibling", until);
        },
        siblings: function(elem) {
            return jQuery.sibling((elem.parentNode || {}).firstChild, elem);
        },
        children: function(elem) {
            return jQuery.sibling(elem.firstChild);
        },
        contents: function(elem) {
            return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.merge([], elem.childNodes);
        }
    }, function(name, fn) {
        jQuery.fn[name] = function(until, selector) {
            var ret = jQuery.map(this, fn, until);
            runtil.test(name) || (selector = until);
            selector && "string" == typeof selector && (ret = jQuery.filter(selector, ret));
            ret = this.length > 1 && !guaranteedUnique[name] ? jQuery.unique(ret) : ret;
            this.length > 1 && rparentsprev.test(name) && (ret = ret.reverse());
            return this.pushStack(ret);
        };
    });
    jQuery.extend({
        filter: function(expr, elems, not) {
            not && (expr = ":not(" + expr + ")");
            return 1 === elems.length ? jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] : jQuery.find.matches(expr, elems);
        },
        dir: function(elem, dir, until) {
            var matched = [], cur = elem[dir];
            while (cur && 9 !== cur.nodeType && (until === undefined || 1 !== cur.nodeType || !jQuery(cur).is(until))) {
                1 === cur.nodeType && matched.push(cur);
                cur = cur[dir];
            }
            return matched;
        },
        sibling: function(n, elem) {
            var r = [];
            for (;n; n = n.nextSibling) 1 === n.nodeType && n !== elem && r.push(n);
            return r;
        }
    });
    var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g, rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"), rleadingWhitespace = /^\s+/, rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rtbody = /<tbody/i, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, manipulation_rcheckableType = /^(?:checkbox|radio)$/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /^$|\/(?:java|ecma)script/i, rscriptTypeMasked = /^true\/(.*)/, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, wrapMap = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        area: [ 1, "<map>", "</map>" ],
        param: [ 1, "<object>", "</object>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        _default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
    }, safeFragment = createSafeFragment(document), fragmentDiv = safeFragment.appendChild(document.createElement("div"));
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    jQuery.fn.extend({
        text: function(value) {
            return jQuery.access(this, function(value) {
                return value === undefined ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value));
            }, null, value, arguments.length);
        },
        wrapAll: function(html) {
            if (jQuery.isFunction(html)) return this.each(function(i) {
                jQuery(this).wrapAll(html.call(this, i));
            });
            if (this[0]) {
                var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);
                this[0].parentNode && wrap.insertBefore(this[0]);
                wrap.map(function() {
                    var elem = this;
                    while (elem.firstChild && 1 === elem.firstChild.nodeType) elem = elem.firstChild;
                    return elem;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(html) {
            if (jQuery.isFunction(html)) return this.each(function(i) {
                jQuery(this).wrapInner(html.call(this, i));
            });
            return this.each(function() {
                var self = jQuery(this), contents = self.contents();
                contents.length ? contents.wrapAll(html) : self.append(html);
            });
        },
        wrap: function(html) {
            var isFunction = jQuery.isFunction(html);
            return this.each(function(i) {
                jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                jQuery.nodeName(this, "body") || jQuery(this).replaceWith(this.childNodes);
            }).end();
        },
        append: function() {
            return this.domManip(arguments, true, function(elem) {
                (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && this.appendChild(elem);
            });
        },
        prepend: function() {
            return this.domManip(arguments, true, function(elem) {
                (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && this.insertBefore(elem, this.firstChild);
            });
        },
        before: function() {
            return this.domManip(arguments, false, function(elem) {
                this.parentNode && this.parentNode.insertBefore(elem, this);
            });
        },
        after: function() {
            return this.domManip(arguments, false, function(elem) {
                this.parentNode && this.parentNode.insertBefore(elem, this.nextSibling);
            });
        },
        remove: function(selector, keepData) {
            var elem, i = 0;
            for (;null != (elem = this[i]); i++) if (!selector || jQuery.filter(selector, [ elem ]).length > 0) {
                keepData || 1 !== elem.nodeType || jQuery.cleanData(getAll(elem));
                if (elem.parentNode) {
                    keepData && jQuery.contains(elem.ownerDocument, elem) && setGlobalEval(getAll(elem, "script"));
                    elem.parentNode.removeChild(elem);
                }
            }
            return this;
        },
        empty: function() {
            var elem, i = 0;
            for (;null != (elem = this[i]); i++) {
                1 === elem.nodeType && jQuery.cleanData(getAll(elem, false));
                while (elem.firstChild) elem.removeChild(elem.firstChild);
                elem.options && jQuery.nodeName(elem, "select") && (elem.options.length = 0);
            }
            return this;
        },
        clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = null == dataAndEvents ? false : dataAndEvents;
            deepDataAndEvents = null == deepDataAndEvents ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
                return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
            });
        },
        html: function(value) {
            return jQuery.access(this, function(value) {
                var elem = this[0] || {}, i = 0, l = this.length;
                if (value === undefined) return 1 === elem.nodeType ? elem.innerHTML.replace(rinlinejQuery, "") : undefined;
                if (!("string" != typeof value || rnoInnerhtml.test(value) || !jQuery.support.htmlSerialize && rnoshimcache.test(value) || !jQuery.support.leadingWhitespace && rleadingWhitespace.test(value) || wrapMap[(rtagName.exec(value) || [ "", "" ])[1].toLowerCase()])) {
                    value = value.replace(rxhtmlTag, "<$1></$2>");
                    try {
                        for (;l > i; i++) {
                            elem = this[i] || {};
                            if (1 === elem.nodeType) {
                                jQuery.cleanData(getAll(elem, false));
                                elem.innerHTML = value;
                            }
                        }
                        elem = 0;
                    } catch (e) {}
                }
                elem && this.empty().append(value);
            }, null, value, arguments.length);
        },
        replaceWith: function(value) {
            var isFunc = jQuery.isFunction(value);
            isFunc || "string" == typeof value || (value = jQuery(value).not(this).detach());
            return this.domManip([ value ], true, function(elem) {
                var next = this.nextSibling, parent = this.parentNode;
                if (parent) {
                    jQuery(this).remove();
                    parent.insertBefore(elem, next);
                }
            });
        },
        detach: function(selector) {
            return this.remove(selector, true);
        },
        domManip: function(args, table, callback) {
            args = core_concat.apply([], args);
            var first, node, hasScripts, scripts, doc, fragment, i = 0, l = this.length, set = this, iNoClone = l - 1, value = args[0], isFunction = jQuery.isFunction(value);
            if (isFunction || !(1 >= l || "string" != typeof value || jQuery.support.checkClone || !rchecked.test(value))) return this.each(function(index) {
                var self = set.eq(index);
                isFunction && (args[0] = value.call(this, index, table ? self.html() : undefined));
                self.domManip(args, table, callback);
            });
            if (l) {
                fragment = jQuery.buildFragment(args, this[0].ownerDocument, false, this);
                first = fragment.firstChild;
                1 === fragment.childNodes.length && (fragment = first);
                if (first) {
                    table = table && jQuery.nodeName(first, "tr");
                    scripts = jQuery.map(getAll(fragment, "script"), disableScript);
                    hasScripts = scripts.length;
                    for (;l > i; i++) {
                        node = fragment;
                        if (i !== iNoClone) {
                            node = jQuery.clone(node, true, true);
                            hasScripts && jQuery.merge(scripts, getAll(node, "script"));
                        }
                        callback.call(table && jQuery.nodeName(this[i], "table") ? findOrAppend(this[i], "tbody") : this[i], node, i);
                    }
                    if (hasScripts) {
                        doc = scripts[scripts.length - 1].ownerDocument;
                        jQuery.map(scripts, restoreScript);
                        for (i = 0; hasScripts > i; i++) {
                            node = scripts[i];
                            rscriptType.test(node.type || "") && !jQuery._data(node, "globalEval") && jQuery.contains(doc, node) && (node.src ? jQuery.ajax({
                                url: node.src,
                                type: "GET",
                                dataType: "script",
                                async: false,
                                global: false,
                                "throws": true
                            }) : jQuery.globalEval((node.text || node.textContent || node.innerHTML || "").replace(rcleanScript, "")));
                        }
                    }
                    fragment = first = null;
                }
            }
            return this;
        }
    });
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(name, original) {
        jQuery.fn[name] = function(selector) {
            var elems, i = 0, ret = [], insert = jQuery(selector), last = insert.length - 1;
            for (;last >= i; i++) {
                elems = i === last ? this : this.clone(true);
                jQuery(insert[i])[original](elems);
                core_push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
        };
    });
    jQuery.extend({
        clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var destElements, node, clone, i, srcElements, inPage = jQuery.contains(elem.ownerDocument, elem);
            if (jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">")) clone = elem.cloneNode(true); else {
                fragmentDiv.innerHTML = elem.outerHTML;
                fragmentDiv.removeChild(clone = fragmentDiv.firstChild);
            }
            if (!(jQuery.support.noCloneEvent && jQuery.support.noCloneChecked || 1 !== elem.nodeType && 11 !== elem.nodeType || jQuery.isXMLDoc(elem))) {
                destElements = getAll(clone);
                srcElements = getAll(elem);
                for (i = 0; null != (node = srcElements[i]); ++i) destElements[i] && fixCloneNodeIssues(node, destElements[i]);
            }
            if (dataAndEvents) if (deepDataAndEvents) {
                srcElements = srcElements || getAll(elem);
                destElements = destElements || getAll(clone);
                for (i = 0; null != (node = srcElements[i]); i++) cloneCopyEvent(node, destElements[i]);
            } else cloneCopyEvent(elem, clone);
            destElements = getAll(clone, "script");
            destElements.length > 0 && setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            destElements = srcElements = node = null;
            return clone;
        },
        buildFragment: function(elems, context, scripts, selection) {
            var j, elem, contains, tmp, tag, tbody, wrap, l = elems.length, safe = createSafeFragment(context), nodes = [], i = 0;
            for (;l > i; i++) {
                elem = elems[i];
                if (elem || 0 === elem) if ("object" === jQuery.type(elem)) jQuery.merge(nodes, elem.nodeType ? [ elem ] : elem); else if (rhtml.test(elem)) {
                    tmp = tmp || safe.appendChild(context.createElement("div"));
                    tag = (rtagName.exec(elem) || [ "", "" ])[1].toLowerCase();
                    wrap = wrapMap[tag] || wrapMap._default;
                    tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
                    j = wrap[0];
                    while (j--) tmp = tmp.lastChild;
                    !jQuery.support.leadingWhitespace && rleadingWhitespace.test(elem) && nodes.push(context.createTextNode(rleadingWhitespace.exec(elem)[0]));
                    if (!jQuery.support.tbody) {
                        elem = "table" !== tag || rtbody.test(elem) ? "<table>" !== wrap[1] || rtbody.test(elem) ? 0 : tmp : tmp.firstChild;
                        j = elem && elem.childNodes.length;
                        while (j--) jQuery.nodeName(tbody = elem.childNodes[j], "tbody") && !tbody.childNodes.length && elem.removeChild(tbody);
                    }
                    jQuery.merge(nodes, tmp.childNodes);
                    tmp.textContent = "";
                    while (tmp.firstChild) tmp.removeChild(tmp.firstChild);
                    tmp = safe.lastChild;
                } else nodes.push(context.createTextNode(elem));
            }
            tmp && safe.removeChild(tmp);
            jQuery.support.appendChecked || jQuery.grep(getAll(nodes, "input"), fixDefaultChecked);
            i = 0;
            while (elem = nodes[i++]) {
                if (selection && -1 !== jQuery.inArray(elem, selection)) continue;
                contains = jQuery.contains(elem.ownerDocument, elem);
                tmp = getAll(safe.appendChild(elem), "script");
                contains && setGlobalEval(tmp);
                if (scripts) {
                    j = 0;
                    while (elem = tmp[j++]) rscriptType.test(elem.type || "") && scripts.push(elem);
                }
            }
            tmp = null;
            return safe;
        },
        cleanData: function(elems, acceptData) {
            var elem, type, id, data, i = 0, internalKey = jQuery.expando, cache = jQuery.cache, deleteExpando = jQuery.support.deleteExpando, special = jQuery.event.special;
            for (;null != (elem = elems[i]); i++) if (acceptData || jQuery.acceptData(elem)) {
                id = elem[internalKey];
                data = id && cache[id];
                if (data) {
                    if (data.events) for (type in data.events) special[type] ? jQuery.event.remove(elem, type) : jQuery.removeEvent(elem, type, data.handle);
                    if (cache[id]) {
                        delete cache[id];
                        deleteExpando ? delete elem[internalKey] : typeof elem.removeAttribute !== core_strundefined ? elem.removeAttribute(internalKey) : elem[internalKey] = null;
                        core_deletedIds.push(id);
                    }
                }
            }
        }
    });
    var iframe, getStyles, curCSS, ralpha = /alpha\([^)]*\)/i, ropacity = /opacity\s*=\s*([^)]*)/, rposition = /^(top|right|bottom|left)$/, rdisplayswap = /^(none|table(?!-c[ea]).+)/, rmargin = /^margin/, rnumsplit = new RegExp("^(" + core_pnum + ")(.*)$", "i"), rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i"), rrelNum = new RegExp("^([+-])=(" + core_pnum + ")", "i"), elemdisplay = {
        BODY: "block"
    }, cssShow = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, cssNormalTransform = {
        letterSpacing: 0,
        fontWeight: 400
    }, cssExpand = [ "Top", "Right", "Bottom", "Left" ], cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
    jQuery.fn.extend({
        css: function(name, value) {
            return jQuery.access(this, function(elem, name, value) {
                var len, styles, map = {}, i = 0;
                if (jQuery.isArray(name)) {
                    styles = getStyles(elem);
                    len = name.length;
                    for (;len > i; i++) map[name[i]] = jQuery.css(elem, name[i], false, styles);
                    return map;
                }
                return value !== undefined ? jQuery.style(elem, name, value) : jQuery.css(elem, name);
            }, name, value, arguments.length > 1);
        },
        show: function() {
            return showHide(this, true);
        },
        hide: function() {
            return showHide(this);
        },
        toggle: function(state) {
            var bool = "boolean" == typeof state;
            return this.each(function() {
                (bool ? state : isHidden(this)) ? jQuery(this).show() : jQuery(this).hide();
            });
        }
    });
    jQuery.extend({
        cssHooks: {
            opacity: {
                get: function(elem, computed) {
                    if (computed) {
                        var ret = curCSS(elem, "opacity");
                        return "" === ret ? "1" : ret;
                    }
                }
            }
        },
        cssNumber: {
            columnCount: true,
            fillOpacity: true,
            fontWeight: true,
            lineHeight: true,
            opacity: true,
            orphans: true,
            widows: true,
            zIndex: true,
            zoom: true
        },
        cssProps: {
            "float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(elem, name, value, extra) {
            if (!elem || 3 === elem.nodeType || 8 === elem.nodeType || !elem.style) return;
            var ret, type, hooks, origName = jQuery.camelCase(name), style = elem.style;
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName));
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            if (value === undefined) {
                if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined) return ret;
                return style[name];
            }
            type = typeof value;
            if ("string" === type && (ret = rrelNum.exec(value))) {
                value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name));
                type = "number";
            }
            if (null == value || "number" === type && isNaN(value)) return;
            "number" !== type || jQuery.cssNumber[origName] || (value += "px");
            jQuery.support.clearCloneStyle || "" !== value || 0 !== name.indexOf("background") || (style[name] = "inherit");
            if (!(hooks && "set" in hooks && (value = hooks.set(elem, value, extra)) === undefined)) try {
                style[name] = value;
            } catch (e) {}
        },
        css: function(elem, name, extra, styles) {
            var num, val, hooks, origName = jQuery.camelCase(name);
            name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName));
            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];
            hooks && "get" in hooks && (val = hooks.get(elem, true, extra));
            val === undefined && (val = curCSS(elem, name, styles));
            "normal" === val && name in cssNormalTransform && (val = cssNormalTransform[name]);
            if ("" === extra || extra) {
                num = parseFloat(val);
                return true === extra || jQuery.isNumeric(num) ? num || 0 : val;
            }
            return val;
        },
        swap: function(elem, options, callback, args) {
            var ret, name, old = {};
            for (name in options) {
                old[name] = elem.style[name];
                elem.style[name] = options[name];
            }
            ret = callback.apply(elem, args || []);
            for (name in options) elem.style[name] = old[name];
            return ret;
        }
    });
    if (window.getComputedStyle) {
        getStyles = function(elem) {
            return window.getComputedStyle(elem, null);
        };
        curCSS = function(elem, name, _computed) {
            var width, minWidth, maxWidth, computed = _computed || getStyles(elem), ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined, style = elem.style;
            if (computed) {
                "" !== ret || jQuery.contains(elem.ownerDocument, elem) || (ret = jQuery.style(elem, name));
                if (rnumnonpx.test(ret) && rmargin.test(name)) {
                    width = style.width;
                    minWidth = style.minWidth;
                    maxWidth = style.maxWidth;
                    style.minWidth = style.maxWidth = style.width = ret;
                    ret = computed.width;
                    style.width = width;
                    style.minWidth = minWidth;
                    style.maxWidth = maxWidth;
                }
            }
            return ret;
        };
    } else if (document.documentElement.currentStyle) {
        getStyles = function(elem) {
            return elem.currentStyle;
        };
        curCSS = function(elem, name, _computed) {
            var left, rs, rsLeft, computed = _computed || getStyles(elem), ret = computed ? computed[name] : undefined, style = elem.style;
            null == ret && style && style[name] && (ret = style[name]);
            if (rnumnonpx.test(ret) && !rposition.test(name)) {
                left = style.left;
                rs = elem.runtimeStyle;
                rsLeft = rs && rs.left;
                rsLeft && (rs.left = elem.currentStyle.left);
                style.left = "fontSize" === name ? "1em" : ret;
                ret = style.pixelLeft + "px";
                style.left = left;
                rsLeft && (rs.left = rsLeft);
            }
            return "" === ret ? "auto" : ret;
        };
    }
    jQuery.each([ "height", "width" ], function(i, name) {
        jQuery.cssHooks[name] = {
            get: function(elem, computed, extra) {
                if (computed) return 0 === elem.offsetWidth && rdisplayswap.test(jQuery.css(elem, "display")) ? jQuery.swap(elem, cssShow, function() {
                    return getWidthOrHeight(elem, name, extra);
                }) : getWidthOrHeight(elem, name, extra);
            },
            set: function(elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, jQuery.support.boxSizing && "border-box" === jQuery.css(elem, "boxSizing", false, styles), styles) : 0);
            }
        };
    });
    jQuery.support.opacity || (jQuery.cssHooks.opacity = {
        get: function(elem, computed) {
            return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : computed ? "1" : "";
        },
        set: function(elem, value) {
            var style = elem.style, currentStyle = elem.currentStyle, opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + 100 * value + ")" : "", filter = currentStyle && currentStyle.filter || style.filter || "";
            style.zoom = 1;
            if ((value >= 1 || "" === value) && "" === jQuery.trim(filter.replace(ralpha, "")) && style.removeAttribute) {
                style.removeAttribute("filter");
                if ("" === value || currentStyle && !currentStyle.filter) return;
            }
            style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity;
        }
    });
    jQuery(function() {
        jQuery.support.reliableMarginRight || (jQuery.cssHooks.marginRight = {
            get: function(elem, computed) {
                if (computed) return jQuery.swap(elem, {
                    display: "inline-block"
                }, curCSS, [ elem, "marginRight" ]);
            }
        });
        !jQuery.support.pixelPosition && jQuery.fn.position && jQuery.each([ "top", "left" ], function(i, prop) {
            jQuery.cssHooks[prop] = {
                get: function(elem, computed) {
                    if (computed) {
                        computed = curCSS(elem, prop);
                        return rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed;
                    }
                }
            };
        });
    });
    if (jQuery.expr && jQuery.expr.filters) {
        jQuery.expr.filters.hidden = function(elem) {
            return 0 >= elem.offsetWidth && 0 >= elem.offsetHeight || !jQuery.support.reliableHiddenOffsets && "none" === (elem.style && elem.style.display || jQuery.css(elem, "display"));
        };
        jQuery.expr.filters.visible = function(elem) {
            return !jQuery.expr.filters.hidden(elem);
        };
    }
    jQuery.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(prefix, suffix) {
        jQuery.cssHooks[prefix + suffix] = {
            expand: function(value) {
                var i = 0, expanded = {}, parts = "string" == typeof value ? value.split(" ") : [ value ];
                for (;4 > i; i++) expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                return expanded;
            }
        };
        rmargin.test(prefix) || (jQuery.cssHooks[prefix + suffix].set = setPositiveNumber);
    });
    var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
    jQuery.fn.extend({
        serialize: function() {
            return jQuery.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                var elements = jQuery.prop(this, "elements");
                return elements ? jQuery.makeArray(elements) : this;
            }).filter(function() {
                var type = this.type;
                return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !manipulation_rcheckableType.test(type));
            }).map(function(i, elem) {
                var val = jQuery(this).val();
                return null == val ? null : jQuery.isArray(val) ? jQuery.map(val, function(val) {
                    return {
                        name: elem.name,
                        value: val.replace(rCRLF, "\r\n")
                    };
                }) : {
                    name: elem.name,
                    value: val.replace(rCRLF, "\r\n")
                };
            }).get();
        }
    });
    jQuery.param = function(a, traditional) {
        var prefix, s = [], add = function(key, value) {
            value = jQuery.isFunction(value) ? value() : null == value ? "" : value;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };
        traditional === undefined && (traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional);
        if (jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a)) jQuery.each(a, function() {
            add(this.name, this.value);
        }); else for (prefix in a) buildParams(prefix, a[prefix], traditional, add);
        return s.join("&").replace(r20, "+");
    };
    jQuery.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(i, name) {
        jQuery.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
        };
    });
    jQuery.fn.hover = function(fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    };
    var ajaxLocParts, ajaxLocation, ajax_nonce = jQuery.now(), ajax_rquery = /\?/, rhash = /#.*$/, rts = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/, _load = jQuery.fn.load, prefilters = {}, transports = {}, allTypes = "*/".concat("*");
    try {
        ajaxLocation = location.href;
    } catch (e) {
        ajaxLocation = document.createElement("a");
        ajaxLocation.href = "";
        ajaxLocation = ajaxLocation.href;
    }
    ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
    jQuery.fn.load = function(url, params, callback) {
        if ("string" != typeof url && _load) return _load.apply(this, arguments);
        var selector, response, type, self = this, off = url.indexOf(" ");
        if (off >= 0) {
            selector = url.slice(off, url.length);
            url = url.slice(0, off);
        }
        if (jQuery.isFunction(params)) {
            callback = params;
            params = undefined;
        } else params && "object" == typeof params && (type = "POST");
        self.length > 0 && jQuery.ajax({
            url: url,
            type: type,
            dataType: "html",
            data: params
        }).done(function(responseText) {
            response = arguments;
            self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText);
        }).complete(callback && function(jqXHR, status) {
            self.each(callback, response || [ jqXHR.responseText, status, jqXHR ]);
        });
        return this;
    };
    jQuery.each([ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function(i, type) {
        jQuery.fn[type] = function(fn) {
            return this.on(type, fn);
        };
    });
    jQuery.each([ "get", "post" ], function(i, method) {
        jQuery[method] = function(url, data, callback, type) {
            if (jQuery.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            return jQuery.ajax({
                url: url,
                type: method,
                dataType: type,
                data: data,
                success: callback
            });
        };
    });
    jQuery.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: ajaxLocation,
            type: "GET",
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": allTypes,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": window.String,
                "text html": true,
                "text json": jQuery.parseJSON,
                "text xml": jQuery.parseXML
            },
            flatOptions: {
                url: true,
                context: true
            }
        },
        ajaxSetup: function(target, settings) {
            return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target);
        },
        ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
        ajaxTransport: addToPrefiltersOrTransports(transports),
        ajax: function(url, options) {
            function done(status, nativeStatusText, responses, headers) {
                var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                if (2 === state) return;
                state = 2;
                timeoutTimer && clearTimeout(timeoutTimer);
                transport = undefined;
                responseHeadersString = headers || "";
                jqXHR.readyState = status > 0 ? 4 : 0;
                responses && (response = ajaxHandleResponses(s, jqXHR, responses));
                if (status >= 200 && 300 > status || 304 === status) {
                    if (s.ifModified) {
                        modified = jqXHR.getResponseHeader("Last-Modified");
                        modified && (jQuery.lastModified[cacheURL] = modified);
                        modified = jqXHR.getResponseHeader("etag");
                        modified && (jQuery.etag[cacheURL] = modified);
                    }
                    if (204 === status) {
                        isSuccess = true;
                        statusText = "nocontent";
                    } else if (304 === status) {
                        isSuccess = true;
                        statusText = "notmodified";
                    } else {
                        isSuccess = ajaxConvert(s, response);
                        statusText = isSuccess.state;
                        success = isSuccess.data;
                        error = isSuccess.error;
                        isSuccess = !error;
                    }
                } else {
                    error = statusText;
                    if (status || !statusText) {
                        statusText = "error";
                        0 > status && (status = 0);
                    }
                }
                jqXHR.status = status;
                jqXHR.statusText = (nativeStatusText || statusText) + "";
                isSuccess ? deferred.resolveWith(callbackContext, [ success, statusText, jqXHR ]) : deferred.rejectWith(callbackContext, [ jqXHR, statusText, error ]);
                jqXHR.statusCode(statusCode);
                statusCode = undefined;
                fireGlobals && globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [ jqXHR, s, isSuccess ? success : error ]);
                completeDeferred.fireWith(callbackContext, [ jqXHR, statusText ]);
                if (fireGlobals) {
                    globalEventContext.trigger("ajaxComplete", [ jqXHR, s ]);
                    --jQuery.active || jQuery.event.trigger("ajaxStop");
                }
            }
            if ("object" == typeof url) {
                options = url;
                url = undefined;
            }
            options = options || {};
            var parts, i, cacheURL, responseHeadersString, timeoutTimer, fireGlobals, transport, responseHeaders, s = jQuery.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event, deferred = jQuery.Deferred(), completeDeferred = jQuery.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, state = 0, strAbort = "canceled", jqXHR = {
                readyState: 0,
                getResponseHeader: function(key) {
                    var match;
                    if (2 === state) {
                        if (!responseHeaders) {
                            responseHeaders = {};
                            while (match = rheaders.exec(responseHeadersString)) responseHeaders[match[1].toLowerCase()] = match[2];
                        }
                        match = responseHeaders[key.toLowerCase()];
                    }
                    return null == match ? null : match;
                },
                getAllResponseHeaders: function() {
                    return 2 === state ? responseHeadersString : null;
                },
                setRequestHeader: function(name, value) {
                    var lname = name.toLowerCase();
                    if (!state) {
                        name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                        requestHeaders[name] = value;
                    }
                    return this;
                },
                overrideMimeType: function(type) {
                    state || (s.mimeType = type);
                    return this;
                },
                statusCode: function(map) {
                    var code;
                    if (map) if (2 > state) for (code in map) statusCode[code] = [ statusCode[code], map[code] ]; else jqXHR.always(map[jqXHR.status]);
                    return this;
                },
                abort: function(statusText) {
                    var finalText = statusText || strAbort;
                    transport && transport.abort(finalText);
                    done(0, finalText);
                    return this;
                }
            };
            deferred.promise(jqXHR).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(core_rnotwhite) || [ "" ];
            if (null == s.crossDomain) {
                parts = rurl.exec(s.url.toLowerCase());
                s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || ("http:" === parts[1] ? 80 : 443)) != (ajaxLocParts[3] || ("http:" === ajaxLocParts[1] ? 80 : 443))));
            }
            s.data && s.processData && "string" != typeof s.data && (s.data = jQuery.param(s.data, s.traditional));
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (2 === state) return jqXHR;
            fireGlobals = s.global;
            fireGlobals && 0 === jQuery.active++ && jQuery.event.trigger("ajaxStart");
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url;
            if (!s.hasContent) {
                if (s.data) {
                    cacheURL = s.url += (ajax_rquery.test(cacheURL) ? "&" : "?") + s.data;
                    delete s.data;
                }
                false === s.cache && (s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + ajax_nonce++) : cacheURL + (ajax_rquery.test(cacheURL) ? "&" : "?") + "_=" + ajax_nonce++);
            }
            if (s.ifModified) {
                jQuery.lastModified[cacheURL] && jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
                jQuery.etag[cacheURL] && jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
            }
            (s.data && s.hasContent && false !== s.contentType || options.contentType) && jqXHR.setRequestHeader("Content-Type", s.contentType);
            jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + ("*" !== s.dataTypes[0] ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
            for (i in s.headers) jqXHR.setRequestHeader(i, s.headers[i]);
            if (s.beforeSend && (false === s.beforeSend.call(callbackContext, jqXHR, s) || 2 === state)) return jqXHR.abort();
            strAbort = "abort";
            for (i in {
                success: 1,
                error: 1,
                complete: 1
            }) jqXHR[i](s[i]);
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (transport) {
                jqXHR.readyState = 1;
                fireGlobals && globalEventContext.trigger("ajaxSend", [ jqXHR, s ]);
                s.async && s.timeout > 0 && (timeoutTimer = setTimeout(function() {
                    jqXHR.abort("timeout");
                }, s.timeout));
                try {
                    state = 1;
                    transport.send(requestHeaders, done);
                } catch (e) {
                    if (!(2 > state)) throw e;
                    done(-1, e);
                }
            } else done(-1, "No Transport");
            return jqXHR;
        },
        getScript: function(url, callback) {
            return jQuery.get(url, undefined, callback, "script");
        },
        getJSON: function(url, data, callback) {
            return jQuery.get(url, data, callback, "json");
        }
    });
    jQuery.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(text) {
                jQuery.globalEval(text);
                return text;
            }
        }
    });
    jQuery.ajaxPrefilter("script", function(s) {
        s.cache === undefined && (s.cache = false);
        if (s.crossDomain) {
            s.type = "GET";
            s.global = false;
        }
    });
    jQuery.ajaxTransport("script", function(s) {
        if (s.crossDomain) {
            var script, head = document.head || jQuery("head")[0] || document.documentElement;
            return {
                send: function(_, callback) {
                    script = document.createElement("script");
                    script.async = true;
                    s.scriptCharset && (script.charset = s.scriptCharset);
                    script.src = s.url;
                    script.onload = script.onreadystatechange = function(_, isAbort) {
                        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                            script.onload = script.onreadystatechange = null;
                            script.parentNode && script.parentNode.removeChild(script);
                            script = null;
                            isAbort || callback(200, "success");
                        }
                    };
                    head.insertBefore(script, head.firstChild);
                },
                abort: function() {
                    script && script.onload(undefined, true);
                }
            };
        }
    });
    var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
    jQuery.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var callback = oldCallbacks.pop() || jQuery.expando + "_" + ajax_nonce++;
            this[callback] = true;
            return callback;
        }
    });
    jQuery.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
        var callbackName, overwritten, responseContainer, jsonProp = false !== s.jsonp && (rjsonp.test(s.url) ? "url" : "string" == typeof s.data && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
        if (jsonProp || "jsonp" === s.dataTypes[0]) {
            callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            jsonProp ? s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName) : false !== s.jsonp && (s.url += (ajax_rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName);
            s.converters["script json"] = function() {
                responseContainer || jQuery.error(callbackName + " was not called");
                return responseContainer[0];
            };
            s.dataTypes[0] = "json";
            overwritten = window[callbackName];
            window[callbackName] = function() {
                responseContainer = arguments;
            };
            jqXHR.always(function() {
                window[callbackName] = overwritten;
                if (s[callbackName]) {
                    s.jsonpCallback = originalSettings.jsonpCallback;
                    oldCallbacks.push(callbackName);
                }
                responseContainer && jQuery.isFunction(overwritten) && overwritten(responseContainer[0]);
                responseContainer = overwritten = undefined;
            });
            return "script";
        }
    });
    var xhrCallbacks, xhrSupported, xhrId = 0, xhrOnUnloadAbort = window.ActiveXObject && function() {
        var key;
        for (key in xhrCallbacks) xhrCallbacks[key](undefined, true);
    };
    jQuery.ajaxSettings.xhr = window.ActiveXObject ? function() {
        return !this.isLocal && createStandardXHR() || createActiveXHR();
    } : createStandardXHR;
    xhrSupported = jQuery.ajaxSettings.xhr();
    jQuery.support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
    xhrSupported = jQuery.support.ajax = !!xhrSupported;
    xhrSupported && jQuery.ajaxTransport(function(s) {
        if (!s.crossDomain || jQuery.support.cors) {
            var callback;
            return {
                send: function(headers, complete) {
                    var handle, i, xhr = s.xhr();
                    s.username ? xhr.open(s.type, s.url, s.async, s.username, s.password) : xhr.open(s.type, s.url, s.async);
                    if (s.xhrFields) for (i in s.xhrFields) xhr[i] = s.xhrFields[i];
                    s.mimeType && xhr.overrideMimeType && xhr.overrideMimeType(s.mimeType);
                    s.crossDomain || headers["X-Requested-With"] || (headers["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (i in headers) xhr.setRequestHeader(i, headers[i]);
                    } catch (err) {}
                    xhr.send(s.hasContent && s.data || null);
                    callback = function(_, isAbort) {
                        var status, responseHeaders, statusText, responses;
                        try {
                            if (callback && (isAbort || 4 === xhr.readyState)) {
                                callback = undefined;
                                if (handle) {
                                    xhr.onreadystatechange = jQuery.noop;
                                    xhrOnUnloadAbort && delete xhrCallbacks[handle];
                                }
                                if (isAbort) 4 !== xhr.readyState && xhr.abort(); else {
                                    responses = {};
                                    status = xhr.status;
                                    responseHeaders = xhr.getAllResponseHeaders();
                                    "string" == typeof xhr.responseText && (responses.text = xhr.responseText);
                                    try {
                                        statusText = xhr.statusText;
                                    } catch (e) {
                                        statusText = "";
                                    }
                                    status || !s.isLocal || s.crossDomain ? 1223 === status && (status = 204) : status = responses.text ? 200 : 404;
                                }
                            }
                        } catch (firefoxAccessException) {
                            isAbort || complete(-1, firefoxAccessException);
                        }
                        responses && complete(status, statusText, responses, responseHeaders);
                    };
                    if (s.async) if (4 === xhr.readyState) setTimeout(callback); else {
                        handle = ++xhrId;
                        if (xhrOnUnloadAbort) {
                            if (!xhrCallbacks) {
                                xhrCallbacks = {};
                                jQuery(window).unload(xhrOnUnloadAbort);
                            }
                            xhrCallbacks[handle] = callback;
                        }
                        xhr.onreadystatechange = callback;
                    } else callback();
                },
                abort: function() {
                    callback && callback(undefined, true);
                }
            };
        }
    });
    var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp("^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i"), rrun = /queueHooks$/, animationPrefilters = [ defaultPrefilter ], tweeners = {
        "*": [ function(prop, value) {
            var end, unit, tween = this.createTween(prop, value), parts = rfxnum.exec(value), target = tween.cur(), start = +target || 0, scale = 1, maxIterations = 20;
            if (parts) {
                end = +parts[2];
                unit = parts[3] || (jQuery.cssNumber[prop] ? "" : "px");
                if ("px" !== unit && start) {
                    start = jQuery.css(tween.elem, prop, true) || end || 1;
                    do {
                        scale = scale || ".5";
                        start /= scale;
                        jQuery.style(tween.elem, prop, start + unit);
                    } while (scale !== (scale = tween.cur() / target) && 1 !== scale && --maxIterations);
                }
                tween.unit = unit;
                tween.start = start;
                tween.end = parts[1] ? start + (parts[1] + 1) * end : end;
            }
            return tween;
        } ]
    };
    jQuery.Animation = jQuery.extend(Animation, {
        tweener: function(props, callback) {
            if (jQuery.isFunction(props)) {
                callback = props;
                props = [ "*" ];
            } else props = props.split(" ");
            var prop, index = 0, length = props.length;
            for (;length > index; index++) {
                prop = props[index];
                tweeners[prop] = tweeners[prop] || [];
                tweeners[prop].unshift(callback);
            }
        },
        prefilter: function(callback, prepend) {
            prepend ? animationPrefilters.unshift(callback) : animationPrefilters.push(callback);
        }
    });
    jQuery.Tween = Tween;
    Tween.prototype = {
        constructor: Tween,
        init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || "swing";
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
        },
        cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
        },
        run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            this.pos = eased = this.options.duration ? jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration) : percent;
            this.now = (this.end - this.start) * eased + this.start;
            this.options.step && this.options.step.call(this.elem, this.now, this);
            hooks && hooks.set ? hooks.set(this) : Tween.propHooks._default.set(this);
            return this;
        }
    };
    Tween.prototype.init.prototype = Tween.prototype;
    Tween.propHooks = {
        _default: {
            get: function(tween) {
                var result;
                if (null != tween.elem[tween.prop] && (!tween.elem.style || null == tween.elem.style[tween.prop])) return tween.elem[tween.prop];
                result = jQuery.css(tween.elem, tween.prop, "");
                return result && "auto" !== result ? result : 0;
            },
            set: function(tween) {
                jQuery.fx.step[tween.prop] ? jQuery.fx.step[tween.prop](tween) : tween.elem.style && (null != tween.elem.style[jQuery.cssProps[tween.prop]] || jQuery.cssHooks[tween.prop]) ? jQuery.style(tween.elem, tween.prop, tween.now + tween.unit) : tween.elem[tween.prop] = tween.now;
            }
        }
    };
    Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
        set: function(tween) {
            tween.elem.nodeType && tween.elem.parentNode && (tween.elem[tween.prop] = tween.now);
        }
    };
    jQuery.each([ "toggle", "show", "hide" ], function(i, name) {
        var cssFn = jQuery.fn[name];
        jQuery.fn[name] = function(speed, easing, callback) {
            return null == speed || "boolean" == typeof speed ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
        };
    });
    jQuery.fn.extend({
        fadeTo: function(speed, to, easing, callback) {
            return this.filter(isHidden).css("opacity", 0).show().end().animate({
                opacity: to
            }, speed, easing, callback);
        },
        animate: function(prop, speed, easing, callback) {
            var empty = jQuery.isEmptyObject(prop), optall = jQuery.speed(speed, easing, callback), doAnimation = function() {
                var anim = Animation(this, jQuery.extend({}, prop), optall);
                doAnimation.finish = function() {
                    anim.stop(true);
                };
                (empty || jQuery._data(this, "finish")) && anim.stop(true);
            };
            doAnimation.finish = doAnimation;
            return empty || false === optall.queue ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
        },
        stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
                var stop = hooks.stop;
                delete hooks.stop;
                stop(gotoEnd);
            };
            if ("string" != typeof type) {
                gotoEnd = clearQueue;
                clearQueue = type;
                type = undefined;
            }
            clearQueue && false !== type && this.queue(type || "fx", []);
            return this.each(function() {
                var dequeue = true, index = null != type && type + "queueHooks", timers = jQuery.timers, data = jQuery._data(this);
                if (index) data[index] && data[index].stop && stopQueue(data[index]); else for (index in data) data[index] && data[index].stop && rrun.test(index) && stopQueue(data[index]);
                for (index = timers.length; index--; ) if (timers[index].elem === this && (null == type || timers[index].queue === type)) {
                    timers[index].anim.stop(gotoEnd);
                    dequeue = false;
                    timers.splice(index, 1);
                }
                (dequeue || !gotoEnd) && jQuery.dequeue(this, type);
            });
        },
        finish: function(type) {
            false !== type && (type = type || "fx");
            return this.each(function() {
                var index, data = jQuery._data(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery.timers, length = queue ? queue.length : 0;
                data.finish = true;
                jQuery.queue(this, type, []);
                hooks && hooks.cur && hooks.cur.finish && hooks.cur.finish.call(this);
                for (index = timers.length; index--; ) if (timers[index].elem === this && timers[index].queue === type) {
                    timers[index].anim.stop(true);
                    timers.splice(index, 1);
                }
                for (index = 0; length > index; index++) queue[index] && queue[index].finish && queue[index].finish.call(this);
                delete data.finish;
            });
        }
    });
    jQuery.each({
        slideDown: genFx("show"),
        slideUp: genFx("hide"),
        slideToggle: genFx("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(name, props) {
        jQuery.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
        };
    });
    jQuery.speed = function(speed, easing, fn) {
        var opt = speed && "object" == typeof speed ? jQuery.extend({}, speed) : {
            complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
        };
        opt.duration = jQuery.fx.off ? 0 : "number" == typeof opt.duration ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default;
        (null == opt.queue || true === opt.queue) && (opt.queue = "fx");
        opt.old = opt.complete;
        opt.complete = function() {
            jQuery.isFunction(opt.old) && opt.old.call(this);
            opt.queue && jQuery.dequeue(this, opt.queue);
        };
        return opt;
    };
    jQuery.easing = {
        linear: function(p) {
            return p;
        },
        swing: function(p) {
            return .5 - Math.cos(p * Math.PI) / 2;
        }
    };
    jQuery.timers = [];
    jQuery.fx = Tween.prototype.init;
    jQuery.fx.tick = function() {
        var timer, timers = jQuery.timers, i = 0;
        fxNow = jQuery.now();
        for (;timers.length > i; i++) {
            timer = timers[i];
            timer() || timers[i] !== timer || timers.splice(i--, 1);
        }
        timers.length || jQuery.fx.stop();
        fxNow = undefined;
    };
    jQuery.fx.timer = function(timer) {
        timer() && jQuery.timers.push(timer) && jQuery.fx.start();
    };
    jQuery.fx.interval = 13;
    jQuery.fx.start = function() {
        timerId || (timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval));
    };
    jQuery.fx.stop = function() {
        clearInterval(timerId);
        timerId = null;
    };
    jQuery.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    };
    jQuery.fx.step = {};
    jQuery.expr && jQuery.expr.filters && (jQuery.expr.filters.animated = function(elem) {
        return jQuery.grep(jQuery.timers, function(fn) {
            return elem === fn.elem;
        }).length;
    });
    jQuery.fn.offset = function(options) {
        if (arguments.length) return options === undefined ? this : this.each(function(i) {
            jQuery.offset.setOffset(this, options, i);
        });
        var docElem, win, box = {
            top: 0,
            left: 0
        }, elem = this[0], doc = elem && elem.ownerDocument;
        if (!doc) return;
        docElem = doc.documentElement;
        if (!jQuery.contains(docElem, elem)) return box;
        typeof elem.getBoundingClientRect !== core_strundefined && (box = elem.getBoundingClientRect());
        win = getWindow(doc);
        return {
            top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
            left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
        };
    };
    jQuery.offset = {
        setOffset: function(elem, options, i) {
            var position = jQuery.css(elem, "position");
            "static" === position && (elem.style.position = "relative");
            var curTop, curLeft, curElem = jQuery(elem), curOffset = curElem.offset(), curCSSTop = jQuery.css(elem, "top"), curCSSLeft = jQuery.css(elem, "left"), calculatePosition = ("absolute" === position || "fixed" === position) && jQuery.inArray("auto", [ curCSSTop, curCSSLeft ]) > -1, props = {}, curPosition = {};
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;
            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }
            jQuery.isFunction(options) && (options = options.call(elem, i, curOffset));
            null != options.top && (props.top = options.top - curOffset.top + curTop);
            null != options.left && (props.left = options.left - curOffset.left + curLeft);
            "using" in options ? options.using.call(elem, props) : curElem.css(props);
        }
    };
    jQuery.fn.extend({
        position: function() {
            if (!this[0]) return;
            var offsetParent, offset, parentOffset = {
                top: 0,
                left: 0
            }, elem = this[0];
            if ("fixed" === jQuery.css(elem, "position")) offset = elem.getBoundingClientRect(); else {
                offsetParent = this.offsetParent();
                offset = this.offset();
                jQuery.nodeName(offsetParent[0], "html") || (parentOffset = offsetParent.offset());
                parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", true);
                parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", true);
            }
            return {
                top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
                left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
            };
        },
        offsetParent: function() {
            return this.map(function() {
                var offsetParent = this.offsetParent || document.documentElement;
                while (offsetParent && !jQuery.nodeName(offsetParent, "html") && "static" === jQuery.css(offsetParent, "position")) offsetParent = offsetParent.offsetParent;
                return offsetParent || document.documentElement;
            });
        }
    });
    jQuery.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(method, prop) {
        var top = /Y/.test(prop);
        jQuery.fn[method] = function(val) {
            return jQuery.access(this, function(elem, method, val) {
                var win = getWindow(elem);
                if (val === undefined) return win ? prop in win ? win[prop] : win.document.documentElement[method] : elem[method];
                win ? win.scrollTo(top ? jQuery(win).scrollLeft() : val, top ? val : jQuery(win).scrollTop()) : elem[method] = val;
            }, method, val, arguments.length, null);
        };
    });
    jQuery.each({
        Height: "height",
        Width: "width"
    }, function(name, type) {
        jQuery.each({
            padding: "inner" + name,
            content: type,
            "": "outer" + name
        }, function(defaultExtra, funcName) {
            jQuery.fn[funcName] = function(margin, value) {
                var chainable = arguments.length && (defaultExtra || "boolean" != typeof margin), extra = defaultExtra || (true === margin || true === value ? "margin" : "border");
                return jQuery.access(this, function(elem, type, value) {
                    var doc;
                    if (jQuery.isWindow(elem)) return elem.document.documentElement["client" + name];
                    if (9 === elem.nodeType) {
                        doc = elem.documentElement;
                        return Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                    }
                    return value === undefined ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra);
                }, type, chainable ? margin : undefined, chainable, null);
            };
        });
    });
    window.jQuery = window.$ = jQuery;
    "function" == typeof define && define.amd && define.amd.jQuery && define("jquery", [], function() {
        return jQuery;
    });
})(window);