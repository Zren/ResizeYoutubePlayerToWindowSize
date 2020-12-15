// ==UserScript==
// @name            Resize YT To Window Size
// @description     Moves the YouTube video to the top of the website and fill the window with the video player.
// @author          Chris H (Zren / Shade)
// @license         MIT
// @icon            https://s.ytimg.com/yts/img/favicon_32-vflOogEID.png
// @homepageURL     https://github.com/Zren/ResizeYoutubePlayerToWindowSize/
// @namespace       http://xshade.ca
// @version         124
// @include         http*://*.youtube.com/*
// @include         http*://youtube.com/*
// @include         http*://*.youtu.be/*
// @include         http*://youtu.be/*
// @grant           GM_addStyle
// ==/UserScript==

// Github:          https://github.com/Zren/ResizeYoutubePlayerToWindowSize
// GreasyFork:      https://greasyfork.org/scripts/811-resize-yt-to-window-size
// OpenUserJS.org:  https://openuserjs.org/scripts/zren/Resize_YT_To_Window_Size
// Userscripts.org: http://userscripts-mirror.org/scripts/show/153699

setInterval(function(){
	if (window.location.href.match(/m.youtube.com\/watch?/gi)){

		GM_addStyle("html { scrollbar-width: none; } #player-container-id { position: static !important; } #player-container-id .player-size { padding-bottom: 100vh; } ytm-app.sticky-player { padding-top: 0px !important; } ytm-app ytm-watch .player-size { padding-bottom: 0 !important; } ytm-mobile-topbar-renderer.sticky-player.in:not(:hover) { opacity: 0; } ytm-watch { margin-right: 0px !important; }");
		GM_addStyle(".scwnr-content > lazy-list { display: flex; flex-wrap: wrap; } .ytm-autonav-bar { width: 100%; } @media (orientation:landscape) { ytm-single-column-watch-next-results-renderer [section-identifier='related-items'] { position: static !important; width: 100% !important; } ytm-single-column-watch-next-results-renderer [section-identifier='related-items'] .item { width: 20vw; } } ");

	};
}, 1000);

(function (window) {
    "use strict";

    //--- Settings
    var playerHeight = '100vh';

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
        var currentPage = window.location.pathname + window.location.search
        if (HistoryEvent.lastPage != currentPage) {
            HistoryEvent.dispatch({}, document.title, window.location.href)
            HistoryEvent.lastPage = currentPage
        }
    }
    HistoryEvent.startTimer = function() {
        HistoryEvent.lastPage = window.location.pathname + window.location.search
        HistoryEvent.timerId = setInterval(HistoryEvent.onTick, 500)
    }
    HistoryEvent.stopTimer = function() {
        clearInterval(HistoryEvent.timerId)
    }
    window.ytwpHistoryEvent = HistoryEvent


    //--- Constants
    var scriptShortName = 'ytwp'; // YT Window Player
    var scriptStyleId = scriptShortName + '-style'; // ytwp-style
    var scriptBodyClassId = scriptShortName + '-window-player'; // .ytwp-window-player
    var viewingVideoClassId = scriptShortName + '-viewing-video'; // .ytwp-viewing-video
    var topOfPageClassId = scriptShortName + '-scrolltop'; // .ytwp-scrolltop

    var scriptHtmlSelector = 'html:not([fullscreen="true"])';
    var scriptBodySelector = 'body.' + scriptBodyClassId; // body.ytwp-window-player
    scriptBodySelector += ':not(.enhancer-for-youtube-pinned-player)'; // Support "Enhancer for Youtube" (Pull Request #51)
    var scriptSelector = scriptHtmlSelector + ' ' + scriptBodySelector;

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
        isWatchPage: false,
    };

    ytwp.isWatchUrl = function (url) {
        if (!url)
            url = uw.location.href;
        if (url.match(/https?:\/\/(www\.)?youtube.com\/(c|channel|user)\/[^\/]+\/live/)) {
            if (document.querySelector('ytd-browse')) {
                return false
            } else {
                return true
            }
        }
        return url.match(/https?:\/\/(www\.)?youtube.com\/watch\?/);
    };

    ytwp.enterTheaterMode = function() {
        // ytwp.log('enterTheaterMode')
        var watchElement = document.querySelector('ytd-watch:not([hidden])') || document.querySelector('ytd-watch-flexy:not([hidden])')
        if (watchElement) {
            if (!watchElement.hasAttribute('theater')) {
                var sizeButton = watchElement.querySelector('button.ytp-size-button')
                if (sizeButton) {
                    sizeButton.click()
                }
            }
            watchElement.canFitTheater_ = true // When it's too small, it disables the theater mode.
        } else if (watchElement = document.querySelector('#page.watch')) {
            if (!watchElement.classList.contains('watch-stage-mode')) {
                var sizeButton = watchElement.querySelector('button.ytp-size-button')
                if (sizeButton) {
                    sizeButton.click()
                }
            }
        }
    }
    ytwp.enterTheaterMode();
    uw.addEventListener('resize', ytwp.enterTheaterMode);

    ytwp.init = function() {
        ytwp.log('init');
        if (!ytwp.initialized) {
            ytwp.isWatchPage = ytwp.isWatchUrl();
            if (ytwp.isWatchPage) {
                ytwp.removeSearchAutofocus();
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
                var temp = scriptBodySelector;
                scriptBodySelector = 'body[data-spf-name="watch"]';
                scriptSelector = scriptHtmlSelector + ' ' + scriptBodySelector
                ytwp.event.buildStylesheet();
                ytwp.style.appendRule('body[data-spf-name="watch"]:not(.ytwp-window-player) #masthead-positioner',  {
                    'position': 'absolute',
                    'top': playerHeight + ' !important'
                });
            }
            ytwp.style.injectIntoHeader();
        },
        buildStylesheet: function() {
            ytwp.log('buildStylesheet');
            //--- Browser Scrollbar
            // Chrome/Webkit
            ytwp.style.appendRule(scriptBodySelector + '::-webkit-scrollbar', {
                'width': '0',
                'height': '0',
            });
            // Firefox/Gecko
            // Requires about:config flag to be toggled as of FireFox v63
            // https://github.com/Zren/ResizeYoutubePlayerToWindowSize/issues/42
            ytwp.style.appendRule('html', {
                'scrollbar-width': 'none',
            });

            //--- Video Player
            var d;
            d = buildVenderPropertyDict(transitionProperties, 'left 0s linear, padding-left 0s linear');
            d['padding'] = '0 !important';
            d['margin'] = '0 !important';
            ytwp.style.appendRule([
                scriptBodySelector + ' #player',
                scriptBodySelector + '.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible #player',
                scriptBodySelector + '.ltr.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible.guide-collapsed #player',
                scriptBodySelector + '.ltr.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible.guide-collapsed #player-legacy',
                scriptBodySelector + '.ltr.ytcenter-site-center.ytcenter-non-resize.ytcenter-guide-visible.guide-collapsed #watch7-main-container',
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

            ytwp.style.appendRule(scriptBodySelector + ' #player-api', d);

            // Theatre mode
            ytwp.style.appendRule(scriptBodySelector + ' .watch-stage-mode #player .player-api', {
                'left': 'initial !important',
                'margin-left': 'initial !important',
            });

            // Hide the cinema/wide mode button since it's useless.
            //ytwp.style.appendRule(scriptBodySelector + ' #movie_player .ytp-size-button', 'display', 'none');

            // !important is mainly for simplicity, but is needed to override the !important styling when the Guide is open due to:
            // .sidebar-collapsed #watch7-video, .sidebar-collapsed #watch7-main, .sidebar-collapsed .watch7-playlist { width: 945px!important; }
            // Also, Youtube Center resizes #player at element level.
            // Don't resize if Youtube+'s html.floater is detected.
            // Dont' resize if Youtube+ (Iridium/Material)'s html.iri-always-visible is detected.
            ytwp.style.appendRule(
                [
                    scriptSelector + ' #player',
                    scriptSelector + ' #player-api',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #movie_player',
                    scriptSelector + ' #player-mole-container',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' .html5-video-container',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' .html5-main-video',
                    scriptSelector + ' ytd-watch-flexy[theater] #player-theater-container.ytd-watch-flexy',
                ],
                {
                    'width': '100% !important',
                    'min-width': '100% !important',
                    'max-width': '100% !important',
                    'height': playerHeight + ' !important',
                    'min-height': playerHeight + ' !important',
                    'max-height': playerHeight + ' !important',
                }
            );

             ytwp.style.appendRule(
                [
                    scriptSelector + ' #player',
                    scriptSelector + ' .html5-main-video',
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
            ytwp.style.appendRule(scriptSelector + ' #player .player-width', 'width', '100% !important');
            ytwp.style.appendRule(scriptSelector + ' #player .player-height', 'height', '100% !important');

            // Fix video overlays
            ytwp.style.appendRule([
                scriptSelector + ' .html5-video-player .ad-container-single-media-element-annotations', // Ad
                scriptSelector + ' .html5-video-player .ytp-upnext', // Autoplay Next Video
            ], 'top', '0');


            //--- Move Video Player
            ytwp.style.appendRule(scriptSelector + ' #player', {
                'position': 'absolute',
                // Already top:0; left: 0;
            });
            ytwp.style.appendRule(scriptSelector, { // body
                'margin-top': playerHeight,
            });

            // Fix the top right avatar button
            ytwp.style.appendRule(scriptSelector + ' button.ytp-button.ytp-cards-button', 'top', '0');


            //--- Sidebar
            // Remove the transition delay as you can see it moving on page load.
            d = buildVenderPropertyDict(transitionProperties, 'margin-top 0s linear, padding-top 0s linear');
            d['margin-top'] = '0 !important';
            d['top'] = '0 !important';
            ytwp.style.appendRule(scriptSelector + ' #watch7-sidebar', d);

            ytwp.style.appendRule(scriptSelector + '.cardified-page #watch7-sidebar-contents', 'padding-top', '0');

            //--- Absolutely position the fixed header.
            // Masthead
            d = buildVenderPropertyDict(transitionProperties, 'top 0s linear !important');
            ytwp.style.appendRule(scriptSelector + '.hide-header-transition #masthead-positioner', d);
            ytwp.style.appendRule(scriptSelector + '.' + viewingVideoClassId + ' #masthead-positioner', {
                'position': 'absolute',
                'top': playerHeight + ' !important'
            });
            // Lower masthead below Youtube+'s html.floater
            ytwp.style.appendRule('html.floater ' + scriptBodySelector + '.' + viewingVideoClassId + ' #masthead-positioner', {
                'z-index': '5',
            });
            // Autocomplete popup
            ytwp.style.appendRule(scriptSelector + ' .sbdd_a', {
                'top': '56px',
            });
            ytwp.style.appendRule(scriptSelector + '.' + viewingVideoClassId + ' .sbdd_a', {
                'top': 'calc(' + playerHeight + ' + 56px) !important',
                'position': 'absolute !important',
            });

            // Guide
            // When watching the video, we need to line it up with the masthead.
            ytwp.style.appendRule(scriptSelector + '.' + viewingVideoClassId + ' #appbar-guide-menu', {
                'display': 'initial',
                'position': 'absolute',
                'top': '100% !important' // Masthead height
            });
            ytwp.style.appendRule(scriptSelector + '.' + viewingVideoClassId + ' #page.watch #guide', {
                'display': 'initial',
                'margin': '0',
                'position': 'initial'
            });


            //---
            // MiniPlayer-Bar
            ytwp.style.appendRule(scriptSelector + ' #miniplayer-bar #player', {
                'position': 'static',
            });
            ytwp.style.appendRule(
                [
                    scriptSelector + ' #miniplayer-bar #player',
                    scriptSelector + ' #miniplayer-bar #player-api',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #miniplayer-bar #movie_player',
                    scriptSelector + ' #player-mole-container',
                    scriptSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #miniplayer-bar .html5-video-container',
                    scriptSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #miniplayer-bar .html5-main-video',
                ],
                {
                    'width': '252px !important',
                    'min-width': '252px !important',
                    'max-width': '252px !important',
                    'height': '142px !important',
                    'min-height': '142px !important',
                    'max-height': '142px !important',
                }
            );
            // Override inline style (caused by a JS animation) that breaks the miniplayer video
            // https://github.com/Zren/ResizeYoutubePlayerToWindowSize/issues/41#issuecomment-439710130
            ytwp.style.appendRule('.video-stream.html5-main-video', {
                'top': '0 !important',
            });

            //---
            // Hide Scrollbars
            ytwp.style.appendRule(scriptSelector + '.' + topOfPageClassId, 'overflow-x', 'hidden');


            //--- Fix Other Possible Style Issues
            ytwp.style.appendRule(scriptSelector + ' #placeholder-player', 'display', 'none');
            ytwp.style.appendRule(scriptSelector + ' #watch-sidebar-spacer', 'display', 'none');
            ytwp.style.appendRule(scriptSelector + ' .skip-nav', 'display', 'none');

            //--- Whitespace Leftover From Moving The Video
            ytwp.style.appendRule(scriptSelector + ' #page.watch', 'padding-top', '0');
            ytwp.style.appendRule(scriptSelector + ' .player-branded-banner', 'height', '0');

            //--- Youtube+ Compatiblity
            ytwp.style.appendRule(scriptSelector + ' #body-container', 'position', 'static');
            ytwp.style.appendRule(scriptHtmlSelector + '.part_static_size:not(.content-snap-width-skinny-mode) ' + scriptBodySelector + ' .watch-non-stage-mode #player-playlist', 'width', '1066px');

            //--- Playlist Bar
            ytwp.style.appendRule([
                scriptSelector + ' #placeholder-playlist',
                scriptSelector + ' #player .player-height#watch-appbar-playlist',
            ], {
                'height': '540px !important',
                'max-height': '540px !important',
            });

            d = buildVenderPropertyDict(transitionProperties, 'transform 0s linear');
            ytwp.style.appendRule(scriptSelector + ' #watch-appbar-playlist', d);
            d = buildVenderPropertyDict(transformProperties, 'translateY(0px)');
            d['margin-left'] = '0';
            d['top'] = 'calc(' + playerHeight + ' + 60px)';
            ytwp.style.appendRule(scriptSelector + ' #player .player-height#watch-appbar-playlist', d);
            ytwp.style.appendRule(scriptSelector + ' .playlist-videos-list', {
                'max-height': '470px !important',
                'height': 'initial !important',
            });

            // Old layout `&disable_polymer=true`
            ytwp.style.appendRule(scriptSelector + ' #player .player-height#watch-appbar-playlist', {
                'left': 'calc((100vw - 1066px)/2 + 640px + 10px)',
                'width': '416px',
            });
            ytwp.style.stylesheet += '@media screen and (min-height: 630px) and (min-width: 1294px) {\n';
            ytwp.style.appendRule(scriptSelector + ' #player .player-height#watch-appbar-playlist', {
                'left': 'calc((100vw - 1280px)/2 + 854px + 10px)',
            });
            ytwp.style.stylesheet += '}\n @media screen and (min-width: 1720px) and (min-height:980px) {\n';
            ytwp.style.appendRule(scriptSelector + ' #player .player-height#watch-appbar-playlist', {
                'left': 'calc((100vw - 1706px)/2 + 1280px + 10px)',
            });
            ytwp.style.stylesheet += '}\n';

            //---
            // Material UI
            ytwp.style.appendRule(scriptSelector + '.ytwp-scrolltop #extra-buttons', 'display', 'none !important');
            // ytwp.style.appendRule('body > #player:not(.ytd-watch)', 'display', 'none');
            // ytwp.style.appendRule('body.ytwp-viewing-video #content:not(app-header-layout) ytd-page-manager', 'margin-top', '0 !important');
            // ytwp.style.appendRule('.ytd-watch-0 #content-separator.ytd-watch', 'margin-top', '0');
            ytwp.style.appendRule('ytd-app', 'position', 'static !important');
            ytwp.style.appendRule('ytd-watch #top', 'margin-top', '71px !important'); // 56px (topnav height) + 15px (margin)
            ytwp.style.appendRule('ytd-watch #container', 'margin-top', '0 !important');
            ytwp.style.appendRule('ytd-watch #content-separator', 'margin-top', '0 !important');
            ytwp.style.appendRule(scriptSelector + '.ytwp-viewing-video ytd-app #masthead-container.ytd-app', {
                'position': 'absolute',
                'top': playerHeight,
                'z-index': 0,
            });
            ytwp.style.appendRule(scriptSelector + '.ytwp-viewing-video ytd-watch #masthead-positioner', {
                'top': playerHeight + ' !important',
            });
            ytwp.style.appendRule(scriptSelector + ' .ytp-cued-thumbnail-overlay', 'z-index', '10');

            //---
            // Flexy UI
            ytwp.style.appendRule(scriptSelector + ' ytd-watch-flexy[theater] #player-theater-container.ytd-watch-flexy', {
                'position': 'absolute',
                'top': '0',
            });
            ytwp.style.appendRule(scriptSelector + ' ytd-watch-flexy', 'padding-top', '71px'); // 56px (topnav height) + 15px (margin)
            ytwp.style.appendRule(scriptSelector + ' #error-screen', 'z-index', '11');
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
        },
        addBodyClass: function() {
            // Insert CSS Into the body so people can style around the effects of this script.
            document.body.classList.add(scriptBodyClassId);
            ytwp.log('Applied ' + scriptBodySelector);
        },
    };

    ytwp.html5PlayerFix = function() {
        ytwp.log('html5PlayerFix');
        return;

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

    JSStyleSheet.injectIntoHeader(scriptStyleId + '-focusfix', 'input#search[autofocus] { display: none; }');
    ytwp.removeSearchAutofocus = function() {
        var e = document.querySelector('input#search');
        // ytwp.log('removeSearchAutofocus', e)
        if (e) {
            e.removeAttribute('autofocus')
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
        ytwp.log('materialPageTransition')
        ytwp.init();

        if (ytwp.isWatchUrl()) {
            ytwp.removeSearchAutofocus();
            ytwp.event.addBodyClass();
            // if (!ytwp.html5.app) {
            if (!ytwp.initialized) {
                ytwp.log('materialPageTransition !ytwp.html5.app', ytwp.html5.app)
                setTimeout(ytwp.materialPageTransition, 100);
            }
             var playerApi = document.querySelector('#player-api')
             if (playerApi) {
                 playerApi.click()
             }
        } else {
            ytwp.event.onDispose();
            document.body.classList.remove(scriptBodyClassId);
        }
        ytwp.onScroll();
        ytwp.fixMasthead();
        ytwp.attemptToUpdatePlayer();
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

    // ytwp.updatePlayerTimerId = 0;
    ytwp.updatePlayerAttempts = -1;
    ytwp.updatePlayerMaxAttempts = 150; // 60fps = 2.5sec
    ytwp.attemptToUpdatePlayer = function() {
        console.log('ytwp.attemptToUpdatePlayer')
        if (0 <= ytwp.updatePlayerAttempts && ytwp.updatePlayerAttempts < ytwp.updatePlayerMaxAttempts) {
            ytwp.updatePlayerAttempts = 0;
        } else {
            ytwp.updatePlayerAttempts = 0;
            ytwp.attemptToUpdatePlayerTick();
        }
        // setTimeout(ytwp.updatePlayer, 10000); /// Just in case it's not caught
    }
    ytwp.attemptToUpdatePlayerTick = function() {
        console.log('ytwp.attemptToUpdatePlayerTick', ytwp.updatePlayerAttempts)
        if (ytwp.updatePlayerAttempts < ytwp.updatePlayerMaxAttempts) {
            ytwp.updatePlayerAttempts += 1;
            ytwp.updatePlayer();
            // ytwp.updatePlayerTimerId = setTimeout(ytwp.attemptToUpdatePlayerTick, 200);
            requestAnimationFrame(ytwp.attemptToUpdatePlayerTick);
        }
    }

    ytwp.updatePlayer = function() {
        ytwp.removeSearchAutofocus();
        ytwp.enterTheaterMode();
    }

    ytwp.materialPageTransition()
    setInterval(ytwp.updatePlayer, 2500);

})(window);
