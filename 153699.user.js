// ==UserScript==
// @name            Resize YT To Window Size
// @description     Moves the YouTube video to the top of the website and fill the window with the video player.
// @author          Chris H (Zren / Shade)
// @icon            https://youtube.com/favicon.ico
// @homepageURL     https://github.com/Zren/ResizeYoutubePlayerToWindowSize/
// @namespace       http://xshade.ca
// @version         96
// @include         http*://*.youtube.com/*
// @include         http*://youtube.com/*
// @include         http*://*.youtu.be/*
// @include         http*://youtu.be/*
// @grant           none
// ==/UserScript==

// Github:          https://github.com/Zren/ResizeYoutubePlayerToWindowSize
// GreasyFork:      https://greasyfork.org/scripts/811-resize-yt-to-window-size
// OpenUserJS.org:  https://openuserjs.org/scripts/zren/Resize_YT_To_Window_Size
// Userscripts.org: http://userscripts-mirror.org/scripts/show/153699

(function (window) {
    "use strict";
    
    //--- Imported Globals
    // yt
    // ytcenter
    // html5Patched (Youtube+)
    // ytplayer
    var uw = window;

    //--- Already Loaded?
    // GreaseMonkey loads this script twice for some reason.
    if (uw.ytwp) return;
    
    //--- Is iframe?
    function inIframe () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
    if (inIframe()) return;

    //--- Utils
    function isStringType(obj) { return typeof obj === 'string'; }
    function isArrayType(obj) { return obj instanceof Array; }
    function isObjectType(obj) { return typeof obj === 'object'; }
    function isUndefined(obj) { return typeof obj === 'undefined'; }
    function buildVenderPropertyDict(propertyNames, value) {
        var d = {};
        for (var i in propertyNames)
            d[propertyNames[i]] = value;
        return d;
    }
    function addClass(el, value) {
        var classes = value.split(' ');
        for (var i = 0; i < classes.length; i++) {
            el.classList.add(classes[i]);
        }
    }
    function removeClass(el, value) {
        var classes = value.split(' ');
        for (var i = 0; i < classes.length; i++) {
            el.classList.remove(classes[i]);
        }
    }
    function observe(selector, config, callback) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation){
                callback(mutation);
            });
        });
        var target = document.querySelector(selector);
        if (!target) {
            return null;
        }
        observer.observe(target, config);
        return observer;
    }

    //--- Stylesheet
    var JSStyleSheet = function(id) {
        this.id = id;
        this.stylesheet = '';
    };

    JSStyleSheet.prototype.buildRule = function(selector, styles) {
        var s = "";
        for (var key in styles) {
            s += "\t" + key + ": " + styles[key] + ";\n";
        }
        return selector + " {\n" + s + "}\n";
    };

    JSStyleSheet.prototype.appendRule = function(selector, k, v) {
        if (isArrayType(selector))
            selector = selector.join(',\n');
        var newStyle;
        if (!isUndefined(k) && !isUndefined(v) && isStringType(k)) { // v can be any type (as we stringify it).
            var d = {};
            d[k] = v;
            newStyle = this.buildRule(selector, d);
        } else if (!isUndefined(k) && isUndefined(v) && isObjectType(k)) {
            newStyle = this.buildRule(selector, k);
        } else {
            // Invalid Arguments
            console.log('Illegal arguments', arguments);
            return;
        }

        this.stylesheet += newStyle;
    };

    JSStyleSheet.injectIntoHeader = function(injectedStyleId, stylesheet) {
        var styleElement = document.getElementById(injectedStyleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.id = injectedStyleId;
            document.getElementsByTagName('head')[0].appendChild(styleElement);
        }
        styleElement.appendChild(document.createTextNode(stylesheet));
    };

    JSStyleSheet.prototype.injectIntoHeader = function(injectedStyleId, stylesheet) {
        JSStyleSheet.injectIntoHeader(this.id, this.stylesheet);
    };

    //--- History
    var HistoryEvent = function() {}
    HistoryEvent.listeners = []

    HistoryEvent.dispatch = function(state, title, url) {
      var stack = this.listeners
      for (var i = 0, l = stack.length; i < l; i++) {
        stack[i].call(this, state, title, url)
      }
    }
    HistoryEvent.onPushState = function(state, title, url) {
        HistoryEvent.dispatch(state, title, url)
        return HistoryEvent.origPushState.apply(window.history, arguments)
    }
    HistoryEvent.onReplaceState = function(state, title, url) {
        HistoryEvent.dispatch(state, title, url)
        return HistoryEvent.origReplaceState.apply(window.history, arguments)
    }
    HistoryEvent.inject = function() {
        if (!HistoryEvent.injected) {
            HistoryEvent.origPushState = window.history.pushState
            HistoryEvent.origReplaceState = window.history.replaceState

            window.history.pushState = HistoryEvent.onPushState
            window.history.replaceState = HistoryEvent.onReplaceState
            HistoryEvent.injected = true
        }
    }

    HistoryEvent.timerId = 0
    HistoryEvent.onTick = function() {
        if (HistoryEvent.lastPath != window.location.pathname) {
            HistoryEvent.dispatch({}, document.title, window.location.href)
            HistoryEvent.lastPath = window.location.pathname
        }
    }
    HistoryEvent.startTimer = function() {
        HistoryEvent.lastPath = window.location.pathname
        HistoryEvent.timerId = setInterval(HistoryEvent.onTick, 500)
    }
    HistoryEvent.stopTimer = function() {
        clearInterval(HistoryEvent.timerId)
    }


    //--- Constants
    var scriptShortName = 'ytwp'; // YT Window Player
    var scriptStyleId = scriptShortName + '-style'; // ytwp-style
    var scriptBodyClassId = scriptShortName + '-window-player'; // .ytwp-window-player
    var viewingVideoClassId = scriptShortName + '-viewing-video'; // .ytwp-viewing-video
    var topOfPageClassId = scriptShortName + '-scrolltop'; // .ytwp-scrolltop
    var scriptBodyClassSelector = 'body.' + scriptBodyClassId; // body.ytwp-window-player

    var videoContainerId = 'player';
    var videoContainerPlacemarkerId = scriptShortName + '-placemarker'; // ytwp-placemarker

    var transitionProperties = ["transition", "-ms-transition", "-moz-transition", "-webkit-transition", "-o-transition"];
    var transformProperties = ["transform", "-ms-transform", "-moz-transform", "-webkit-transform", "-o-transform"];

    //--- YTWP
    var ytwp = uw.ytwp = {
        scriptShortName: scriptShortName, // YT Window Player
        log_: function(logger, args) { logger.apply(console, ['[' + this.scriptShortName + '] '].concat(Array.prototype.slice.call(args))); return 1; },
        log: function() { return this.log_(console.log, arguments); },
        error: function() { return this.log_(console.error, arguments); },

        initialized: false,
        pageReady: false,
        watchPage: false,
    };

    ytwp.util = {
        isWatchUrl: function (url) {
            if (!url)
                url = uw.location.href;
            return url.match(/https?:\/\/(www\.)?youtube.com\/watch\?/);
        }
    };

    ytwp.html5 = {
        app: null,
        YTRect: null,
        YTApplication: null,
        playerInstances: null,
        moviePlayerElement: null,
    };
    ytwp.html5.getPlayerRect = function() {
        var moviePlayerElement = this.element || ytwp.html5.moviePlayerElement || document.querySelector('movie_player');
        return new ytwp.html5.YTRect(moviePlayerElement.clientWidth, moviePlayerElement.clientHeight);
    };
    ytwp.html5.getApplicationClass = function() {
        if (ytwp.html5.YTApplication === null) {
            var testEl = document.createElement('div');
            var testAppInstance = uw.yt.player.Application.create(testEl, {});
            // var testAppInstance = uw.yt.player.Application.create("player-api", uw.ytplayer.config);
            ytwp.html5.YTApplication = testAppInstance.constructor;

            // Cleanup testAppInstance
            var playerInstances = ytwp.html5.getPlayerInstances();

            var testAppInstanceKey = null;
            Object.keys(playerInstances).forEach(function(key) {
                if (playerInstances[key] === testAppInstance) {
                    testAppInstanceKey = key;
                }
            });
            testAppInstance.dispose();
            delete playerInstances[testAppInstanceKey];
        }
        return ytwp.html5.YTApplication;
    };
    ytwp.html5.getPlayerInstances = function() {
        if (ytwp.html5.playerInstances === null) {
            var YTApplication =  ytwp.html5.getApplicationClass();
            if (YTApplication === null)
                return null;

            // Use yt.player.Application.create to find the playerInstancesKey.
            // function (a,b){try{var c=e9.D(a);if(e9.o[c]){try{e9.o[c].dispose()}catch(e){Fi(e)}e9.o[c]=null}var d=new e9(a,b);Kb(d,function(){e9.o[c]=null});return e9.o[c]=d}catch(e){throw Fi(e),e.stack;}}
            var appCreateRegex = /^function \(a,b\)\{try\{var c=([a-zA-Z_$][\w_$]*)\.([a-zA-Z_$][\w_$]*)\(a\);if\(([a-zA-Z_$][\w_$]*)\.([a-zA-Z_$][\w_$]*)\[c\]\)/;
            var fnString = yt.player.Application.create.toString();
            var m = appCreateRegex.exec(fnString);
            if (m) {
                var playerInstancesKey = m[4];
                ytwp.html5.playerInstances = YTApplication[playerInstancesKey];
            } else {
                ytwp.error('Error trying to find playerInstancesKey.', fnString);
            }
            ytwp.html5.playerInstances = YTApplication[playerInstancesKey];
        }

        return ytwp.html5.playerInstances;
    };
    ytwp.html5.getPlayerInstance = function() {
        if (!ytwp.html5.app) {
            var playerInstances = ytwp.html5.getPlayerInstances();
            ytwp.log('playerInstances', playerInstances);
            var appInstance = null;
            var appInstanceKey = null;
            Object.keys(playerInstances).forEach(function(key) {
                appInstanceKey = key;
                appInstance = playerInstances[key];
            });
            ytwp.html5.app = appInstance;
        }
        return ytwp.html5.app;
    };
    ytwp.html5.autohideControls = function() {
        var moviePlayerElement = document.getElementById('movie_player');
        if (!moviePlayerElement) return;
        // ytwp.log(moviePlayerElement.classList);
        removeClass(moviePlayerElement, 'autohide-controlbar autominimize-controls-aspect autohide-controls-fullscreenonly autohide-controls hide-controls-when-cued autominimize-progress-bar autominimize-progress-bar-fullscreenonly autohide-controlbar-fullscreenonly autohide-controls-aspect autohide-controls-fullscreen autominimize-progress-bar-non-aspect');
        addClass(moviePlayerElement, 'autominimize-progress-bar autohide-controls hide-controls-when-cued');
        // ytwp.log(moviePlayerElement.classList);
    };
    ytwp.html5.update = function() {
        if (!ytwp.html5.playerInstances)
            return;
        for (var key in ytwp.html5.playerInstances) {
            var playerInstance = ytwp.html5.playerInstances[key];
            ytwp.html5.updatePlayerInstance(playerInstance);
        }
    };
    ytwp.html5.replaceClientRect = function(app, moviePlayerKey, clientRectFnKey) {
        var moviePlayer = app[moviePlayerKey];
        ytwp.html5.moviePlayerElement = moviePlayer.element;
        ytwp.html5.YTRect = moviePlayer[clientRectFnKey].call(moviePlayer).constructor;
        moviePlayer[clientRectFnKey] = ytwp.html5.getPlayerRect;
    };
    ytwp.html5.setRectFn = function(app, moviePlayerKey, clientRectFnKey) {
        ytwp.html5.moviePlayerElement = document.getElementById('movie_player');
        var moviePlayer = app[moviePlayerKey];
        ytwp.html5.YTRect = moviePlayer[clientRectFnKey].call(moviePlayer).constructor;
        moviePlayer.constructor.prototype[clientRectFnKey] = ytwp.html5.getPlayerRect;
    };
    ytwp.html5.updatePlayerInstance = function(app) {
        if (!app) {
            return;
        }

        var moviePlayerElement = document.getElementById('movie_player');
        var moviePlayer = null;
        var moviePlayerKey = null;

        // function (a,b){return this.isDisposed()?!1:this.R.P.apply(this.R,arguments)}
        var applyFnRegex1 = /^function \(a,b\)\{return this\.isDisposed\(\)\?!1:this\.([a-zA-Z_$][\w_$]*)\.([a-zA-Z_$][\w_$]*)\.apply\(this\.([a-zA-Z_$][\w_$]*),arguments\)\}$/;
        // function (a,b){return this.O.Y.apply(this.O,arguments)}
        var applyFnRegex2 = /^function \(a,b\)\{return this\.([a-zA-Z_$][\w_$]*)\.([a-zA-Z_$][\w_$]*)\.apply\(this\.([a-zA-Z_$][\w_$]*),arguments\)\}$/;
        var applyFnKey = null;
        var applyKey1 = null;
        var applyKey2 = null;

        // function (a){var b=this.j.X(),c=n$.L.xb.call(this);a||"detailpage"!=b.ma||b.ib||b.experiments.T||(c.height+=30);return c}
        // function (a){var b=this.app.X(),c=n$.M.xb.call(this);a||!JK(b)||b.ab||b.experiments.U||(c.height+=30);return c}
        var clientRectFnRegex1 = /^(function \(a\)\{var b=this\.([a-zA-Z_$][\w_$]*)\.([a-zA-Z_$][\w_$]*)\(\)).*(\|\|\(c\.height\+=30\);return c})$/;
        // function (){var a=this.A.U();if(window.matchMedia){if((a.wb||a.Fb)&&window.matchMedia("(width: "+window.innerWidth+"px) and (height: "+window.innerHeight+"px)").matches)return new H(window.innerWidth,window.innerHeight);if("detailpage"==a.ja&&"blazer"!=a.j&&!a.Fb){a=a.experiments.A;if(window.matchMedia(S6.C).matches)return new H(426,a?280:240);var b=this.A.ha;if(window.matchMedia(b?S6.o:S6.j).matches)return new H(1280,a?760:720);if(b||window.matchMedia(S6.A).matches)return new H(854,a?520:480);if(window.matchMedia(S6.B).matches)return new H(640,a?400:360)}}return new H(this.element.clientWidth,this.element.clientHeight)}
        //     Tail: return new H(this.element.clientWidth,this.element.clientHeight)}
        // function (){var a=this.app.T,b=Yh()==this.element;if(b&&Lp())return new g.ef(window.outerWidth,window.outerHeight);if(b||a.Xe){var c;window.matchMedia&&(a="(width: "+window.innerWidth+"px) and (height: "+window.innerHeight+"px)",this.F&&this.F.media==a||(this.F=window.matchMedia(a)),c=this.F&&this.F.matches);if(c)return new g.ef(window.innerWidth,window.innerHeight)}else if(this.N){if(a.experiments.ba("flex_theater_mode")&&this.app.fa||a.experiments.ba("player_scaling_360p_to_720p")&&this.da.matches)return new g.ef(this.element.clientWidth,this.element.clientHeight);if(this.N.matches)return new g.ef(426,240);a=this.app.fa;if((a?this.aa:this.$).matches)return new g.ef(1280,720);if(a||this.ca.matches)return new g.ef(854,480);if(this.fa.matches)return new g.ef(640,360)}return new g.ef(this.element.clientWidth,this.element.clientHeight)}
        //     Tail: return new g.ef(this.element.clientWidth,this.element.clientHeight)}
        var clientRectFnRegex2 = /^(function \()(.|\n)*(return new ([a-zA-Z_$][\w_$]*\.)?([a-zA-Z_$][\w_$]*)\(this\.element\.clientWidth,this\.element\.clientHeight\)})$/;
        var clientRectFn = null;
        var clientRectFnKey = null;

        var fnAlreadyReplacedCount = 0;

        for (var key1 in app) {
            var val1 = app[key1];//console.log(key1, val1);
            if (typeof val1 === 'object' && val1 !== null && val1.element === moviePlayerElement) {
                moviePlayer = val1;
                moviePlayerKey = key1;

                for (var key2 in moviePlayer) {
                    var val2 = moviePlayer[key2];//console.log(key1, key2, val2);
                    if (typeof val2 === 'function') {
                        var fnString = val2.toString();
                        // console.log(fnString);
                        if (clientRectFn === null && (clientRectFnRegex1.test(fnString) || clientRectFnRegex2.test(fnString))) {
                            clientRectFn = val2;
                            clientRectFnKey = key2;
                        } else if (val2 === ytwp.html5.getPlayerRect) {
                            fnAlreadyReplacedCount += 1;
                            clientRectFn = val2;
                            clientRectFnKey = key2;
                        } else if (applyFnRegex2.test(fnString)) {
                            console.log('applyFnRegex2', key1, key2,  applyKey1, applyKey2, moviePlayerKey)
                            applyKey1 = key1;
                            applyKey2 = key2;
                        } else {
                            // console.log(key1, key2, val2, '[Not Used]');
                        }
                    }
                }
            } else if (typeof val1 === 'object' && val1 !== null && typeof val1.logEvent === 'function') {
                for (var key2 in val1) {
                    var val2 = val1[key2];//console.log(key1, key2, val2);
                    if (typeof val2 === 'function') {
                        var fnString = val2.toString();
                        // console.log(fnString);
                        if (applyKey2 === null && applyFnRegex1.test(fnString)) {
                            console.log('applyFnRegex1', key1, key2,  applyKey1, applyKey2, moviePlayerKey)
                            applyKey1 = key1;
                            applyKey2 = key2;
                        }
                    }
                }
            } else if (typeof val1 === 'function') {
                var fnString = val1.toString();
                if (applyFnRegex1.test(fnString)) {
                    applyFnKey = key1;
                }
            }
        }

        if (fnAlreadyReplacedCount > 0) {
            // return;
        }

        if (moviePlayer === null || clientRectFn === null) {
            console.log('[ytwp] ', '[Error]', 'HTML5 Player has changed or there\'s multiple playerInstances and this one has been destroyed.');
            console.log('moviePlayer', moviePlayerKey, moviePlayer);
            console.log('clientRectFn', clientRectFnKey, clientRectFn);
            console.log('fnAlreadyReplacedCount', fnAlreadyReplacedCount);
            if (moviePlayer === null) {
                console.log('Debugging: moviePlayer');
                var table = [];
                Object.keys(app).forEach(function(key1) {
                    var val1 = app[key1];
                    table.push({
                        key: key1,
                        element: typeof val1 === 'object' && val1 !== null && val1.element === moviePlayerElement,
                        val: val1,
                    });
                });
                console.table(table);
            }
            if (moviePlayer != null) {
                console.log('Debugging: clientRectFn');
                var table = [];
                for (var key2 in moviePlayer) {
                    var val2 = moviePlayer[key2];
                    table.push({
                        key: key2,
                        returns: moviePlayer[key2] && moviePlayer[key2].toString().indexOf('return'),
                        src: moviePlayer[key2] && moviePlayer[key2].toString(),
                    });
                }
                console.table(table);
            }
            return;
        }
        
        ytwp.html5.setRectFn(app, moviePlayerKey, clientRectFnKey);

        if (applyFnKey) { // Probably not needed.
            ytwp.log('applyFnKey', applyFnKey);
            app[applyFnKey]('resize', ytwp.html5.getPlayerRect());
        } else if (applyKey1 && applyKey2) {
            ytwp.log('applyKey', applyKey1, applyKey2, app[applyKey1][applyKey2]);
            app[applyKey1][applyKey2]('resize', ytwp.html5.getPlayerRect());
        } else {
            ytwp.log('applyFn not found');
            //app.oa.T('resize', ytwp.html5.getPlayerRect()); // tempfix
        }
    };


    ytwp.init = function() {
        ytwp.log('init');
        if (!ytwp.initialized) {
            ytwp.isWatchPage = ytwp.util.isWatchUrl();
            if (ytwp.isWatchPage) {
                if (!document.getElementById(scriptStyleId)) {
                    ytwp.event.initStyle();
                }
                ytwp.initScroller();
                ytwp.initialized = true;
                ytwp.pageReady = false;
            }
        }
        ytwp.event.onWatchInit();
        if (ytwp.isWatchPage) {
            ytwp.html5PlayerFix();
        }
    }

    ytwp.initScroller = function() {
        // Register listener & Call it now.
        uw.addEventListener('scroll', ytwp.onScroll, false);
        uw.addEventListener('resize', ytwp.onScroll, false);
        ytwp.onScroll();
    }

    ytwp.onScroll = function() {
        var viewportHeight = document.documentElement.clientHeight;

        // topOfPageClassId
        if (ytwp.isWatchPage && uw.scrollY == 0) {
            document.body.classList.add(topOfPageClassId);
            //var player = document.getElementById('movie_player');
            //if (player)
            //    player.focus();
        } else {
            document.body.classList.remove(topOfPageClassId);
        }

        // viewingVideoClassId
        if (ytwp.isWatchPage && uw.scrollY <= viewportHeight) {
            document.body.classList.add(viewingVideoClassId);
        } else {
            document.body.classList.remove(viewingVideoClassId);
        }
    }

    ytwp.event = {
        initStyle: function() {
            ytwp.log('initStyle');
            ytwp.style = new JSStyleSheet(scriptStyleId);
            ytwp.event.buildStylesheet();
            // Duplicate stylesheet targeting data-spf-name if enabled.
            if (uw.spf) {
                var temp = scriptBodyClassSelector;
                scriptBodyClassSelector = 'body[data-spf-name="watch"]';
                ytwp.event.buildStylesheet();
                ytwp.style.appendRule('body[data-spf-name="watch"]:not(.ytwp-window-player) #masthead-positioner',  {
                    'position': 'absolute',
                    'top': '100% !important'
                });
            }
            ytwp.style.injectIntoHeader();
        },
        buildStylesheet: function() {
            ytwp.log('buildStylesheet');
            //--- Browser Scrollbar
            ytwp.style.appendRule(scriptBodyClassSelector + '::-webkit-scrollbar', {
                'width': '0',
                'height': '0',
            });

            //--- Video Player
            var d;
            d = buildVenderPropertyDict(transitionProperties, 'left 0s linear, padding-left 0s linear');
            d['padding'] = '0 !important';
            d['margin'] = '0 !important';
            ytwp.style.appendRule([
                scriptBodyClassSelector + ' #player',
                scriptBodyClassSelector + '.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible #player',
                scriptBodyClassSelector + '.ltr.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible.guide-collapsed #player',
                scriptBodyClassSelector + '.ltr.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible.guide-collapsed #player-legacy',
                scriptBodyClassSelector + '.ltr.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible.guide-collapsed #watch7-main-container',
            ], d);
            //
            d = buildVenderPropertyDict(transitionProperties, 'width 0s linear, left 0s linear');

            // Bugfix for Firefox
            // Parts of the header (search box) are hidden under the player.
            // Firefox doesn't seem to be using the fixed header+guide yet.
            d['float'] = 'initial';

            // Skinny mode
            d['left'] = 0;
            d['margin-left'] = 0;

            ytwp.style.appendRule(scriptBodyClassSelector + ' #player-api', d);

            // Theatre mode
            ytwp.style.appendRule(scriptBodyClassSelector + ' .watch-stage-mode #player .player-api', {
                'left': 'initial',
                'margin-left': 'initial',
            });
            
            // Hide the cinema/wide mode button since it's useless.
            //ytwp.style.appendRule(scriptBodyClassSelector + ' #movie_player .ytp-size-button', 'display', 'none');

            // !important is mainly for simplicity, but is needed to override the !important styling when the Guide is open due to:
            // .sidebar-collapsed #watch7-video, .sidebar-collapsed #watch7-main, .sidebar-collapsed .watch7-playlist { width: 945px!important; }
            // Also, Youtube Center resizes #player at element level.
            // Don't resize if Youtube+'s html.floater is detected.
            ytwp.style.appendRule(
                [
                    scriptBodyClassSelector + ' #player',
                    scriptBodyClassSelector + ' #player-api',
                    'html:not(.floater) ' + scriptBodyClassSelector + ' #movie_player',
                    scriptBodyClassSelector + ' #player-mole-container',
                    'html:not(.floater) ' + scriptBodyClassSelector + ' .html5-video-container',
                    'html:not(.floater) ' + scriptBodyClassSelector + ' .html5-main-video',
                ],
                {
                    'width': '100% !important',
                    'min-width': '100% !important',
                    'max-width': '100% !important',
                    'height': '100vh !important',
                    'min-height': '100vh !important',
                    'max-height': '100vh !important',
                }
            );

             ytwp.style.appendRule(
                [
                    scriptBodyClassSelector + ' #player',
                    scriptBodyClassSelector + ' .html5-main-video',
                ],
                {
                    'top': '0 !important',
                    'right': '0 !important',
                    'bottom': '0 !important',
                    'left': '0 !important',
                }
            );
            // Resize #player-unavailable, #player-api
            // Using min/max width/height will keep
            ytwp.style.appendRule(scriptBodyClassSelector + ' #player .player-width', 'width', '100% !important');
            ytwp.style.appendRule(scriptBodyClassSelector + ' #player .player-height', 'height', '100% !important');

            // Fix video overlays
            ytwp.style.appendRule([
                scriptBodyClassSelector + ' .html5-video-player .ad-container-single-media-element-annotations', // Ad
                scriptBodyClassSelector + ' .html5-video-player .ytp-upnext', // Autoplay Next Video
            ], 'top', '0');
            

            //--- Move Video Player
            ytwp.style.appendRule(scriptBodyClassSelector + ' #player', {
                'position': 'absolute',
                // Already top:0; left: 0;
            });
            ytwp.style.appendRule(scriptBodyClassSelector, { // body
                'margin-top': '100vh',
            });


            //--- Sidebar
            // Remove the transition delay as you can see it moving on page load.
            d = buildVenderPropertyDict(transitionProperties, 'margin-top 0s linear, padding-top 0s linear');
            d['margin-top'] = '0 !important';
            d['top'] = '0 !important';
            ytwp.style.appendRule(scriptBodyClassSelector + ' #watch7-sidebar', d);

            ytwp.style.appendRule(scriptBodyClassSelector + '.cardified-page #watch7-sidebar-contents', 'padding-top', '0');

            //--- Absolutely position the fixed header.
            // Masthead
            d = buildVenderPropertyDict(transitionProperties, 'top 0s linear !important');
            ytwp.style.appendRule(scriptBodyClassSelector + '.hide-header-transition #masthead-positioner', d);
            ytwp.style.appendRule(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #masthead-positioner', {
                'position': 'absolute',
                'top': '100% !important'
            });
            // Lower masthead below Youtube+'s html.floater
            ytwp.style.appendRule('html.floater ' + scriptBodyClassSelector + '.' + viewingVideoClassId + ' #masthead-positioner', {
                'z-index': '5',
            });

            // Guide
            // When watching the video, we need to line it up with the masthead.
            ytwp.style.appendRule(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #appbar-guide-menu', {
                'display': 'initial',
                'position': 'absolute',
                'top': '100% !important' // Masthead height
            });
            ytwp.style.appendRule(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #page.watch #guide', {
                'display': 'initial',
                'margin': '0',
                'position': 'initial'
            });


            //---
            // Hide Scrollbars
            ytwp.style.appendRule(scriptBodyClassSelector + '.' + topOfPageClassId, 'overflow-x', 'hidden');


            //--- Fix Other Possible Style Issues
            ytwp.style.appendRule(scriptBodyClassSelector + ' #placeholder-player', 'display', 'none');
            ytwp.style.appendRule(scriptBodyClassSelector + ' #watch-sidebar-spacer', 'display', 'none');
            ytwp.style.appendRule(scriptBodyClassSelector + ' .skip-nav', 'display', 'none');

            //--- Whitespace Leftover From Moving The Video
            ytwp.style.appendRule(scriptBodyClassSelector + ' #page.watch', 'padding-top', '0');
            ytwp.style.appendRule(scriptBodyClassSelector + ' .player-branded-banner', 'height', '0');

            //--- Youtube+ Compatiblity
            ytwp.style.appendRule(scriptBodyClassSelector + ' #body-container', 'position', 'static');
            ytwp.style.appendRule('.part_static_size:not(.content-snap-width-skinny-mode) ' + scriptBodyClassSelector + ' .watch-non-stage-mode #player-playlist', 'width', '1066px');

            //--- Playlist Bar
            ytwp.style.appendRule([
                scriptBodyClassSelector + ' #placeholder-playlist',
                scriptBodyClassSelector + ' #player .player-height#watch-appbar-playlist',
            ], {
                'height': '540px !important',
                'max-height': '540px !important',
            });

            d = buildVenderPropertyDict(transitionProperties, 'transform 0s linear');
            ytwp.style.appendRule(scriptBodyClassSelector + ' #watch-appbar-playlist', d);
            d = buildVenderPropertyDict(transformProperties, 'translateY(0px)');
            d['margin-left'] = '0';
            d['top'] = 'calc(100vh + 60px)';
            ytwp.style.appendRule(scriptBodyClassSelector + ' #player .player-height#watch-appbar-playlist', d);
            ytwp.style.appendRule(scriptBodyClassSelector + ' .playlist-videos-list', {
                'max-height': '470px !important',
                'height': 'initial !important',
            });
            
            //---
            // Material UI
            ytwp.style.appendRule(scriptBodyClassSelector + '.ytwp-scrolltop #extra-buttons', 'display', 'none !important');
            // ytwp.style.appendRule('body > #player:not(.ytd-watch)', 'display', 'none');
            // ytwp.style.appendRule('body.ytwp-viewing-video #content:not(app-header-layout) ytd-page-manager', 'margin-top', '0 !important');
            // ytwp.style.appendRule('.ytd-watch-0 #content-separator.ytd-watch', 'margin-top', '0');
            ytwp.style.appendRule('ytd-app', 'position', 'static !important');
            ytwp.style.appendRule('ytd-watch #top', 'margin-top', '71px !important'); // 56px (topnav height) + 15px (margin)
            ytwp.style.appendRule('ytd-watch #container', 'margin-top', '0 !important');
            ytwp.style.appendRule('ytd-watch #content-separator', 'margin-top', '0 !important');
            ytwp.style.appendRule(scriptBodyClassSelector + '.ytwp-viewing-video ytd-app #masthead-container.ytd-app', {
                'position': 'absolute',
                'top': '100vh',
            });
            ytwp.style.appendRule(scriptBodyClassSelector + '.ytwp-viewing-video ytd-watch #masthead-positioner', {
                'top': '100vh !important',
            });
        },
        onWatchInit: function() {
            ytwp.log('onWatchInit');
            if (!ytwp.initialized) return;
            if (ytwp.pageReady) return;

            ytwp.event.addBodyClass();
            ytwp.pageReady = true;
        },
        onDispose: function() {
            ytwp.log('onDispose');
            ytwp.initialized = false;
            ytwp.pageReady = false;
            ytwp.isWatchPage = false;
            ytwp.html5.app = null;
            // ytwp.html5.YTRect = null;
            ytwp.html5.YTApplication = null;
            ytwp.html5.playerInstances = null;
            //ytwp.html5.moviePlayerElement = null;
        },
        addBodyClass: function() {
            // Insert CSS Into the body so people can style around the effects of this script.
            document.body.classList.add(scriptBodyClassId);
            ytwp.log('Applied ' + scriptBodyClassSelector);
        },
    };

    ytwp.html5PlayerFix = function() {
        ytwp.log('html5PlayerFix');

        try {
            if (!uw.ytcenter // Youtube Center
                && !uw.html5Patched // Youtube+
                && (!ytwp.html5.app)
                && (uw.ytplayer && uw.ytplayer.config)
                && (uw.yt && uw.yt.player && uw.yt.player.Application && uw.yt.player.Application.create)
            ) {
                ytwp.html5.app = ytwp.html5.getPlayerInstance();
            }

            ytwp.html5.update();
            ytwp.html5.autohideControls();
        } catch (e) {
            ytwp.error(e);
        }
    }

    ytwp.fixMasthead = function() {
        ytwp.log('fixMasthead');
        var el = document.querySelector('#masthead-positioner-height-offset');
        if (el) {
            ytwp.fixMastheadElement(el);
        }
    }
    ytwp.fixMastheadElement = function(el) {
        ytwp.log('fixMastheadElement', el);
        if (el.style.height) { // != ""
            setTimeout(function(){
                el.style.height = ""
                document.querySelector('#appbar-guide-menu').style.marginTop = "";
            }, 0);
        }
    }

    ytwp.registerMastheadFix = function() {
        ytwp.log('registerMastheadFix');
        // Fix the offset when closing the Share widget (element.style.height = ~275px).

        observe('#masthead-positioner-height-offset', {
            attributes: true,
        }, function(mutation) {
            console.log(mutation.type, mutation)
            if (mutation.attributeName === 'style') {
                var el = mutation.target;
                if (el.style.height) { // != ""
                    setTimeout(function(){
                        el.style.height = ""
                        document.querySelector('#appbar-guide-menu').style.marginTop = "";
                    }, 0);
                }

            }
        });
    }

    //--- Material UI
    ytwp.materialPageTransition = function() {
        ytwp.init();

        if (ytwp.util.isWatchUrl()) {
            ytwp.event.addBodyClass();
            if (!ytwp.html5.app) {
                ytwp.log('materialPageTransition !ytwp.html5.app', ytwp.html5.app)
                setTimeout(ytwp.materialPageTransition, 100);
            }
        } else {
            ytwp.event.onDispose();
            document.body.classList.remove(scriptBodyClassId);
        }
        ytwp.onScroll();
        ytwp.fixMasthead();
    };

    //--- Listeners
    ytwp.registerListeners = function() {
        ytwp.registerMaterialListeners();
        ytwp.registerMastheadFix();
    };

    ytwp.registerMaterialListeners = function() {
        // For Material UI
        HistoryEvent.listeners.push(ytwp.materialPageTransition);
        HistoryEvent.startTimer();
        // HistoryEvent.inject();
        // HistoryEvent.listeners.push(console.log.bind(console));
    };

    ytwp.main = function() {
        ytwp.registerListeners();
        ytwp.init();
        ytwp.fixMasthead();
    };

    ytwp.main();
    
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
