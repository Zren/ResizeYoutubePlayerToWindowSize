// ==UserScript==
// @name            Resize YT To Window Size
// @description     Moves the video to the top of the website and resizes it to the screen size.
// @author          Chris H (Zren / Shade)
// @icon            https://youtube.com/favicon.ico
// @homepageURL     https://github.com/Zren/ResizeYoutubePlayerToWindowSize/
// @namespace       http://xshade.ca
// @version         56
// @include         http*://*.youtube.com/*
// @include         http*://youtube.com/*
// @include         http*://*.youtu.be/*
// @include         http*://youtu.be/*
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
    // ytplayer
    var uw = window.top;

    //--- Already Loaded?
    // GreaseMonkey loads this script twice for some reason.
    if (uw.ytwp) return;

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

    //--- jQuery
    // Based on jQuery
    // https://github.com/jquery/jquery/blob/master/src/manipulation.js
    var core_rnotwhite = /\S+/g;
    var rclass = /[\t\r\n\f]/g;
    var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

    var jQuery = {
        trim: function( text ) {
            return (text || "").replace( rtrim, "" );
        },
        addClass: function( elem, value ) {
            var classes, cur, clazz, j,
                proceed = typeof value === "string" && value;

            if ( proceed ) {
                // The disjunction here is for better compressibility (see removeClass)
                classes = ( value || "" ).match( core_rnotwhite ) || [];

                cur = elem.nodeType === 1 && ( elem.className ?
                    ( " " + elem.className + " " ).replace( rclass, " " ) :
                    " "
                );

                if ( cur ) {
                    j = 0;
                    while ( (clazz = classes[j++]) ) {
                        if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
                            cur += clazz + " ";
                        }
                    }
                    elem.className = jQuery.trim( cur );
                }
            }
        },
        removeClass: function( elem, value ) {
            var classes, cur, clazz, j,
                proceed = arguments.length === 0 || typeof value === "string" && value;

            if ( proceed ) {
                classes = ( value || "" ).match( core_rnotwhite ) || [];

                // This expression is here for better compressibility (see addClass)
                cur = elem.nodeType === 1 && ( elem.className ?
                    ( " " + elem.className + " " ).replace( rclass, " " ) :
                    ""
                );

                if ( cur ) {
                    j = 0;
                    while ( (clazz = classes[j++]) ) {
                        // Remove *all* instances
                        while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
                            cur = cur.replace( " " + clazz + " ", " " );
                        }
                    }
                    elem.className = value ? jQuery.trim( cur ) : "";
                }
            }
        }
    };


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
            // appendRule('#blarg', 'display', 'none');
            var d = {};
            d[k] = v;
            newStyle = this.buildRule(selector, d);
        } else if (!isUndefined(k) && isUndefined(v) && isObjectType(k)) {
            // appendRule('#blarg', {'display': 'none'});
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

    var Html5PlayerFix = {
        YTRect: null,
        YTApplication: null,
        playerInstances: null,
        moviePlayer: null,
        moviePlayerElement: null,
        app: null,
    };
    Html5PlayerFix.getPlayerRect = function() {
        return new Html5PlayerFix.YTRect(Html5PlayerFix.moviePlayerElement.clientWidth, Html5PlayerFix.moviePlayerElement.clientHeight);
    };
    Html5PlayerFix.getApplicationClass = function() {
        if (Html5PlayerFix.YTApplication === null) {
            var testEl = document.createElement('div');
            var testAppInstance = uw.yt.player.Application.create(testEl, {});
            Html5PlayerFix.YTApplication = testAppInstance.constructor;

            // Cleanup testAppInstance
            var playerInstances = Html5PlayerFix.getPlayerInstances();

            var testAppInstanceKey = null;
            Object.keys(playerInstances).forEach(function(key) {
                if (playerInstances[key] === testAppInstance) {
                    testAppInstanceKey = key;
                }
            });
            testAppInstance.dispose();
            delete playerInstances[testAppInstanceKey];
            
        }


        return Html5PlayerFix.YTApplication;
    };
    Html5PlayerFix.getPlayerInstances = function() {
        if (Html5PlayerFix.playerInstances === null) {
            var YTApplication =  Html5PlayerFix.getApplicationClass();
            if (YTApplication === null)
                return null;

            // Use yt.player.Application.create to find the playerInstancesKey.
            // function (a,b){try{var c=U7.A(a);if(U7.j[c]){try{U7.j[c].dispose()}catch(d){Sf(d)}U7.j[c]=null}var e=new U7(a,b);ti(e,function(){U7.j[c]=null});return U7.j[c]=e}catch(g){throw Sf(g),g;}}
            var appCreateRegex = /^^function \(\w+,\w+\)\{try\{var \w+=\w+\.\w+\(\w+\);if\(\w+\.(\w+)\[\w+\]\)/;
            var fnString = yt.player.Application.create.toString();
            var m = appCreateRegex.exec(fnString);
            if (m) {
                var playerInstancesKey = m[1];
                Html5PlayerFix.playerInstances = YTApplication[playerInstancesKey];
            } else {
                ytwp.error('Error trying to find playerInstancesKey.', fnString);
            }
            Html5PlayerFix.playerInstances = YTApplication.j;
        }

        return Html5PlayerFix.playerInstances;
    };
    Html5PlayerFix.getPlayerInstance = function() {
        if (!ytwp.ytapp) {
            var playerInstances = Html5PlayerFix.getPlayerInstances();
            ytwp.log('playerInstances', playerInstances);
            var appInstance = null;
            var appInstanceKey = null;
            Object.keys(playerInstances).forEach(function(key) {
                appInstanceKey = key;
                appInstance = playerInstances[key];
            });
            ytwp.ytapp = appInstance;
        }
        return ytwp.ytapp;
    };
    Html5PlayerFix.autohideControls = function() {
        var moviePlayerElement = document.getElementById('movie_player');
        if (!moviePlayerElement) return;
        // ytwp.log(moviePlayerElement.classList);
        jQuery.removeClass(moviePlayerElement, 'autohide-controlbar autominimize-controls-aspect autohide-controls-fullscreenonly autohide-controls hide-controls-when-cued autominimize-progress-bar autominimize-progress-bar-fullscreenonly autohide-controlbar-fullscreenonly autohide-controls-aspect autohide-controls-fullscreen autominimize-progress-bar-non-aspect');
        jQuery.addClass(moviePlayerElement, 'autominimize-progress-bar autohide-controls hide-controls-when-cued');
        // ytwp.log(moviePlayerElement.classList);
    };
    Html5PlayerFix.update = function(app) {
        if (!app)
            return;

        var moviePlayerElement = document.getElementById('movie_player');
        var moviePlayer = null;
        var moviePlayerKey = null;

        // function (){var a=this.j.W();return"detailpage"!=a.ja||a.hb?F8.K.wb.call(this):A6(a,!0)}
        var clientRectFn1Regex = /^(function \(\)\{var a=this\.\w+\.\w+\(\);return"detailpage"!=a\.\w+).+(:\w+\(a,!0\)\})$/;
        var clientRectFn1 = null;
        var clientRectFn1Key = null;


        // function (){var a=this.app.R();return"detailpage"!=a.da||a.Za?R7.J.hb.call(this):L5(a)}
        var clientRectFn2Regex = /^(function \(\)\{var a=this\.\w+\.\w+\(\);return"detailpage"!=a\.\w+).+(:\w+\(a\)\})$/;
        var clientRectFn2 = null;
        var clientRectFn2Key = null;

        // function (){L7.J.jk.call(this);N7(this,this.hb())}
        // var clientRectUpdateFnRegex = /^function \(\)\{\w+\.\w+\.\w+\.call\(this\);\w+\(this,this\.\w+\(\)\)\}$/;
        // var clientRectUpdateFn = null;
        // var clientRectUpdateFnKey = null;

        var fnAlreadyReplacedCount = 0;

        Object.keys(app).forEach(function(key1) {
            var val1 = app[key1];//console.log(key1, val1);
            if (typeof val1 === 'object' && val1 !== null && val1.element === moviePlayerElement) {
                moviePlayer = val1;
                moviePlayerKey = key1;

                Object.keys(moviePlayer.constructor.prototype).forEach(function(key2) {
                    var val2 = moviePlayer[key2];//console.log(key1, key2, val2);
                    if (typeof val2 === 'function') {
                        var fnString = val2.toString();
                        // console.log(fnString);
                        if (clientRectFn1 === null && clientRectFn1Regex.test(fnString)) {
                            clientRectFn1 = val2;
                            clientRectFn1Key = key2;
                        } else if (clientRectFn2 === null && clientRectFn2Regex.test(fnString)) {
                            clientRectFn2 = val2;
                            clientRectFn2Key = key2;
                        // } else if (clientRectUpdateFn === null && clientRectUpdateFnRegex.test(fnString)) {
                        //     clientRectUpdateFn = val2;
                        //     clientRectUpdateFnKey = key2;
                        } else if (val2 === Html5PlayerFix.getPlayerRect) {
                            fnAlreadyReplacedCount += 1;
                        } else {
                            // console.log(key1, key2, val2, '[Not Used]');
                        }
                    }
                });
            }
        });

        if (fnAlreadyReplacedCount > 0) {
            return;
        }

        if (moviePlayer === null || clientRectFn1 === null || clientRectFn2 === null /*|| clientRectUpdateFn === null*/) {
            console.log('[ytwp] ', '[Error]', 'HTML5 Player has changed');
            console.log('moviePlayer', moviePlayerKey, moviePlayer);
            console.log('clientRectFn1', clientRectFn1Key, clientRectFn1);
            console.log('clientRectFn2', clientRectFn2Key, clientRectFn2);
            // console.log('clientRectUpdateFn', clientRectUpdateFnKey, clientRectUpdateFn);
            console.log('fnAlreadyReplacedCount', fnAlreadyReplacedCount);
            return;
        }
        
        Html5PlayerFix.moviePlayerElement = moviePlayerElement;
        Html5PlayerFix.YTRect = moviePlayer[clientRectFn1Key].call(moviePlayer).constructor;

        moviePlayer[clientRectFn1Key] = Html5PlayerFix.getPlayerRect;
        moviePlayer[clientRectFn2Key] = Html5PlayerFix.getPlayerRect;
        //clientRectUpdateFn();
    };
    ytwp.Html5PlayerFix = Html5PlayerFix;

    ytwp.event = {
        init: function() {
            ytwp.log('init');
            if (ytwp.initialized) return;

            ytwp.isWatchPage = ytwp.util.isWatchUrl();
            if (!ytwp.isWatchPage) return;

            ytwp.event.initStyle();
            ytwp.event.initScroller();
            ytwp.initialized = true;
            ytwp.pageReady = false;
        },
        initScroller: function() {
            // Register listener & Call it now.
            unsafeWindow.addEventListener('scroll', ytwp.event.onScroll, false);
            unsafeWindow.addEventListener('resize', ytwp.event.onScroll, false);
            ytwp.event.onScroll();
        },
        onScroll: function() {
            var viewportHeight = document.documentElement.clientHeight;

            // topOfPageClassId
            if (unsafeWindow.scrollY == 0) {
                jQuery.addClass(document.body, topOfPageClassId);
            } else {
                jQuery.removeClass(document.body, topOfPageClassId);
            }

            // viewingVideoClassId
            if (unsafeWindow.scrollY <= viewportHeight) {
                jQuery.addClass(document.body, viewingVideoClassId);
            } else {
                jQuery.removeClass(document.body, viewingVideoClassId);
            }
        },
        initStyle: function() {
            ytwp.log('initStyle');
            ytwp.style = new JSStyleSheet(scriptStyleId);
            ytwp.event.buildStylesheet();
            ytwp.style.injectIntoHeader();
        },
        buildStylesheet: function() {
            ytwp.log('buildStylesheet');
            //--- Video Player

            //
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

            ytwp.style.appendRule(scriptBodyClassSelector + ' #player-api', d);

            // !important is mainly for simplicity, but is needed to override the !important styling when the Guide is open due to:
            // .sidebar-collapsed #watch7-video, .sidebar-collapsed #watch7-main, .sidebar-collapsed .watch7-playlist { width: 945px!important; }
            // Also, Youtube Center resizes #player at element level.
            ytwp.style.appendRule(
                [
                    scriptBodyClassSelector + ' #player',
                    scriptBodyClassSelector + ' #movie_player',
                    scriptBodyClassSelector + ' #player-mole-container',
                    scriptBodyClassSelector + ' .html5-main-video',
                ],
                {
                    'width': '100% !important',
                    'min-width': '100% !important',
                    'max-width': '100% !important',
                    'height': '100% !important',
                    'min-height': '100% !important',
                    'max-height': '100% !important',
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
            ytwp.style.appendRule(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #masthead-positioner', {
                'position': 'absolute',
                'top': '100% !important'
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

            ytwp.style.appendRule(scriptBodyClassSelector + ' .skip-nav', 'display', 'none');

            //--- Whitespace Leftover From Moving The Video
            ytwp.style.appendRule(scriptBodyClassSelector + ' #page.watch', 'padding-top', '0');
            ytwp.style.appendRule(scriptBodyClassSelector + ' .player-branded-banner', 'height', '0');

            //--- Playlist Bar
            //ytwp.style.appendRule(scriptBodyClassSelector + ' #watch7-playlist-tray-container', "margin", "-15px -10px 20px -10px");
            ytwp.style.appendRule(scriptBodyClassSelector + ' .watch7-playlist-bar-left', 'width', '640px !important'); // Same width as .watch-content
            ytwp.style.appendRule([
                scriptBodyClassSelector + ' .playlist',
                scriptBodyClassSelector + ' .playlist .watch7-playlist-bar',
            ], 'max-width', '1040px'); // Same width as .watch-content (640px) + .watch-sidebar (300-400px).
            ytwp.style.appendRule(scriptBodyClassSelector + ' #watch7-playlist-tray-container', {
                "margin-top": "-15px",
                "height": "287px !important", // 65 (playlist tile) * 4 + 27 (trim on bottom)
                "margin-bottom": "15px"
            });
            ytwp.style.appendRule([
                scriptBodyClassSelector + '.cardified-page #watch7-playlist-tray-container + #watch7-sidebar-contents', // Pre Oct 26
                scriptBodyClassSelector + '.cardified-page #watch-appbar-playlist + #watch7-sidebar-contents', // Post Oct 26
            ], 'padding-top', '15px');

            // YT Center
            ytwp.style.appendRule(scriptBodyClassSelector + ' #player', 'margin-bottom', '0 !important');
            ytwp.style.appendRule(scriptBodyClassSelector + ' #watch7-playlist-tray-container', {
                'left': 'initial !important',
                'width': 'initial !important'
            });
            ytwp.style.appendRule(scriptBodyClassSelector + ' .watch7-playlist-bar-right', 'width', '363px !important');
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
            ytwp.ytapp = null;
        },
        addBodyClass: function() {
            // Insert CSS Into the body so people can style around the effects of this script.
            jQuery.addClass(document.body, scriptBodyClassId);
            ytwp.log('Applied ' + scriptBodyClassSelector);
        },
        html5PlayerFix: function() {
            ytwp.log('html5PlayerFix');

            // https://github.com/YePpHa/YouTubeCenter/issues/1083
            if (!uw.ytcenter
                && (!ytwp.ytapp)
                && (uw.ytplayer && uw.ytplayer.config)
                && (uw.yt && uw.yt.player && uw.yt.player.Application && uw.yt.player.Application.create)
            ) {
                ytwp.ytapp = Html5PlayerFix.getPlayerInstance();
                return;
                
                if (document.querySelectorAll('#movie_player').length > 0)
                    return;
                
                ytwp.log('rerunning ytplayer.load()');
                
                // Since we have to reload the player anyways, might as well set some useful settings.
                uw.ytplayer.config.args.autohide = 1; // Autohide the playback control bar.
                
                // Next 2 lines are equivalent to: ytplayer.load();
                ytwp.log(document.querySelectorAll('#movie_player'));
                ytwp.ytapp = uw.yt.player.Application.create("player-api", uw.ytplayer.config);
                ytwp.log(document.querySelectorAll('#movie_player'));
                uw.ytplayer.config.loaded = true;
            }

            Html5PlayerFix.update(ytwp.ytapp);
            Html5PlayerFix.autohideControls();
        },
    };


    ytwp.pubsubListeners = {
        'init': function() { // Not always called
            ytwp.event.init();
            ytwp.event.onWatchInit();
            ytwp.event.html5PlayerFix();
        },
        'init-watch': function() { // Not always called
            ytwp.event.init();
            ytwp.event.onWatchInit();
            ytwp.event.html5PlayerFix();
        },
        'player-added': function() { // Not always called
            // Usually called after init-watch, however this is called before init when going from channel -> watch page.
            // The init event is when the body element resets all it's classes.
            ytwp.event.init();
            ytwp.event.onWatchInit();
            ytwp.event.html5PlayerFix();
        },
        // 'player-resize': function() {},
        // 'player-playback-start': function() {},
        'appbar-guide-delay-load': function() {
            // Listen to a later event that is always called in case the others are missed.
            ytwp.event.init();
            ytwp.event.onWatchInit();

            // Channel -> /watch
            if (ytwp.util.isWatchUrl())
                ytwp.event.addBodyClass();
        },
        // 'dispose-watch': function() {},
        'dispose': function() {
            ytwp.event.onDispose();
        }
    };

    ytwp.registerYoutubeListeners = function() {
        ytwp.registerYoutubePubSubListeners();
    };

    ytwp.registerYoutubePubSubListeners = function() {
        // Subscribe
        for (var eventName in ytwp.pubsubListeners) {
            var eventListener = ytwp.pubsubListeners[eventName];
            uw.yt.pubsub.instance_.subscribe(eventName, eventListener);
        }
    };

    ytwp.main = function() {
        try {
            ytwp.registerYoutubeListeners();
        } catch(e) {
            ytwp.error("Could not hook yt.pubsub", e);
            setTimeout(ytwp.main, 1000);
        }
        ytwp.event.html5PlayerFix();
        ytwp.event.init();
        ytwp.event.onWatchInit();
    };

    ytwp.main();
    
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
