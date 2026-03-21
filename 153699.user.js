// ==UserScript==
// @name            Resize YT To Window Size
// @description     Moves the YouTube video to the top of the website and fill the window with the video player.
// @author          Chris H (Zren / Shade)
// @license         MIT
// @icon            https://s.ytimg.com/yts/img/favicon_32-vflOogEID.png
// @homepageURL     https://github.com/Zren/ResizeYoutubePlayerToWindowSize/
// @namespace       http://xshade.ca
// @version         139
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
 
    //--- Settings
    const playerHeight = '100vh';
    const enableOnLoad = true;
    const scriptToggleKey = 'w';
 
    //--- Imported Globals
    // yt
    // ytcenter
    // html5Patched (Youtube+)
    // ytplayer
    const uw = window;
 
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
        const d = {};
        for (const i in propertyNames)
            d[propertyNames[i]] = value;
        return d;
    }
    function observe(selector, config, callback) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation){
                callback(mutation);
            });
        });
        const target = document.querySelector(selector);
        if (!target) {
            return null;
        }
        observer.observe(target, config);
        return observer;
    }
 
    //--- Stylesheet
    const JSStyleSheet = function(id) {
        this.id = id;
        this.rules = [];
    };
 
    JSStyleSheet.prototype.buildRule = function(selector, styles) {
        let s = "";
        for (const key in styles) {
            s += "\t" + key + ": " + styles[key] + ";\n";
        }
        return selector + " {\n" + s + "}\n";
    };
 
    // Accepts either (selector, stylesObject) or (selector, property, value).
    JSStyleSheet.prototype.appendRule = function(selector, k, v) {
        if (isArrayType(selector))
            selector = selector.join(',\n');
        let styles;
        if (isStringType(k) && !isUndefined(v)) {
            styles = {};
            styles[k] = v;
        } else if (isObjectType(k) && isUndefined(v)) {
            styles = k;
        } else {
            console.log('JSStyleSheet.appendRule: illegal arguments', arguments);
            return;
        }
        this.rules.push(this.buildRule(selector, styles));
    };
 
    // Appends a raw CSS string (e.g. @media blocks) directly to the stylesheet.
    JSStyleSheet.prototype.appendRaw = function(str) {
        this.rules.push(str);
    };
 
    JSStyleSheet.injectIntoHeader = function(injectedStyleId, stylesheet) {
        let styleElement = document.getElementById(injectedStyleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.id = injectedStyleId;
            document.getElementsByTagName('head')[0].appendChild(styleElement);
        }
        styleElement.appendChild(document.createTextNode(stylesheet));
    };
 
    JSStyleSheet.prototype.injectIntoHeader = function() {
        JSStyleSheet.injectIntoHeader(this.id, this.rules.join(''));
    };
 
    //--- Constants
    const scriptShortName = 'ytwp'; // YT Window Player
    const scriptStyleId = scriptShortName + '-style'; // ytwp-style
    const scriptBodyClassId = scriptShortName + '-window-player'; // .ytwp-window-player
    const viewingVideoClassId = scriptShortName + '-viewing-video'; // .ytwp-viewing-video
    const topOfPageClassId = scriptShortName + '-scrolltop'; // .ytwp-scrolltop
 
    const scriptHtmlSelector = 'html:not([fullscreen="true"])';
    let scriptBodySelector = 'body.' + scriptBodyClassId; // body.ytwp-window-player
    scriptBodySelector += ':not(.efyt-mini-player)'; // Support "Enhancer for Youtube" (Pull Request #51)
        
    let scriptSelector = scriptHtmlSelector + ' ' + scriptBodySelector;
 
    const videoContainerId = 'player';
    const videoContainerPlacemarkerId = scriptShortName + '-placemarker'; // ytwp-placemarker
 
    const transitionProperties = ["transition", "-ms-transition", "-moz-transition", "-webkit-transition", "-o-transition"];
    const transformProperties = ["transform", "-ms-transform", "-moz-transform", "-webkit-transform", "-o-transform"];
 
    //--- YTWP
    const ytwp = uw.ytwp = {
        scriptShortName: scriptShortName, // YT Window Player
        log_: function(logger, args) { logger.apply(console, ['[' + this.scriptShortName + '] '].concat(Array.prototype.slice.call(args))); return 1; },
        log: function() { return this.log_(console.log, arguments); },
        error: function() { return this.log_(console.error, arguments); },
 
        initialized: false,
        pageReady: false,
        isWatchPage: false,
    };
 
    ytwp.debugPage = function() {
        function prettyHtml(el) {
            const s = el.outerHTML
            return s.substr(0, s.indexOf('>')+1)
        }
        const defStyle = {
            'display':'block', 'position': 'static',
            'left': 'auto', 'right': 'auto', 'top': 'auto', 'bottom': 'auto',
            'padding-left':'0px', 'padding-right':'0px', 'padding-top':'0px', 'padding-bottom':'0px',
            'margin-left':'0px', 'margin-right':'0px', 'margin-top':'0px', 'margin-bottom':'0px',
            'width': 'auto', 'min-width': 'auto', 'max-width': 'auto',
            'height': 'auto', 'min-height': 'auto', 'max-height': 'auto',
        }
        const keyFilter = Object.keys(defStyle)
        let node = document.querySelector('#movie_player video')
        let outStr = ''
        while (node && node.parentNode) {
            const style = getComputedStyle(node)
            const styleDiff = {}
            for (const key of style) {
                if (keyFilter.includes(key) && style[key] != defStyle[key]) {
                    styleDiff[key] = style[key]
                }
            }
            outStr += prettyHtml(node) + ' ' + JSON.stringify(styleDiff) + '\n'
            node = node.parentNode
        }
        outStr = outStr.split('\n').reverse().join('\n')
        ytwp.log('debugPage', outStr)
    }
 
    ytwp.hasYoutubeChanged = function() {
        const tree = [
            'html',
            'body',
            'ytd-app',
            '#content.ytd-app',
            'ytd-page-manager#page-manager.ytd-app',
            'ytd-watch-flexy.ytd-page-manager',
            '#full-bleed-container.ytd-watch-flexy',
            '#player-full-bleed-container.ytd-watch-flexy',
            '#player-container.ytd-watch-flexy',
            'ytd-player#ytd-player.ytd-watch-flexy',
            '#container.ytd-player',
            '.html5-video-player',
            '.html5-video-container',
            'video.html5-main-video',
        ]
        tree.reverse()
        let node = document.querySelector(tree[0])
        if (!node) {
            ytwp.error('YT has changed!', tree[0], 'no longer exists!')
            return true
        }
        for (let i = 1; i < tree.length; i++) {
            const parent = node.parentNode
            const selector = tree[i]
            if (parent.matches(selector)) {
                node = parent
            } else {
                ytwp.error('YT has changed!', selector, 'no longer matches! parent is:', parent)
                return true
            }
        }
        return false
    }
 
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
 
    ytwp.setTheaterMode = function(enable) {
        let watchElement = document.querySelector('ytd-watch:not([hidden])') || document.querySelector('ytd-watch-flexy:not([hidden])') || document.querySelector('ytd-watch-grid:not([hidden])')
        if (watchElement) {
            const isTheater = watchElement.hasAttribute('theater')
            if (enable != isTheater) {
                let sizeButton = document.querySelector(watchElement.tagName + ':not([hidden]) button.ytp-size-button')
                if (!sizeButton) {
                    const screenModeButtons = document.querySelectorAll(watchElement.tagName + ':not([hidden]) button.ytp-screen-mode-settings-button')
                    sizeButton = screenModeButtons[1] // 2nd button is "Theater mode (t)"
                }
                if (sizeButton) {
                    sizeButton.click()
                }
            }
            watchElement.canFitTheater_ = true // When it's too small, it disables the theater mode.
        } else if (watchElement = document.querySelector('#page.watch')) {
            const isTheater = watchElement.classList.contains('watch-stage-mode')
            if (enable != isTheater) {
                const sizeButton = watchElement.querySelector('button.ytp-size-button')
                if (sizeButton) {
                    sizeButton.click()
                }
            }
        }
    }
    ytwp.enterTheaterMode = function() {
        if (!document.body.classList.contains(scriptBodyClassId)) {
            return
        }
 
        ytwp.setTheaterMode(true)
    }
    ytwp.enterTheaterMode();
    uw.addEventListener('resize', ytwp.enterTheaterMode);
 
    ytwp.detectPlayerUnavailable = function() {
        if (document.querySelector('[player-unavailable]')) {
            ytwp.event.removeBodyClass()
        }
    }
 
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
    }
 
    ytwp.initScroller = function() {
        // Register listener & Call it now.
        uw.addEventListener('scroll', ytwp.onScroll, false);
        uw.addEventListener('resize', ytwp.onScroll, false);
        ytwp.onScroll();
    }
 
    ytwp.onScroll = function() {
        const viewportHeight = document.documentElement.clientHeight;
 
        // topOfPageClassId
        if (ytwp.isWatchPage && uw.scrollY == 0) {
            document.body.classList.add(topOfPageClassId);
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
                const temp = scriptBodySelector;
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
            ytwp.event._styleScrollbar();
            ytwp.event._stylePlayer();
            ytwp.event._styleSidebar();
            ytwp.event._styleMasthead();
            ytwp.event._styleMiniplayer();
            ytwp.event._styleMisc();
            ytwp.event._stylePlaylistBar();
            ytwp.event._styleMaterialUI();
        },
 
        _styleScrollbar: function() {
            // Chrome/Webkit
            ytwp.style.appendRule(scriptBodySelector + '::-webkit-scrollbar', {
                'width': '0 !important',
                'height': '0 !important',
            });
            // Firefox/Gecko
            // Requires about:config flag to be toggled as of FireFox v63
            // https://github.com/Zren/ResizeYoutubePlayerToWindowSize/issues/42
            ytwp.style.appendRule('html', {
                'scrollbar-width': 'none',
            });
        },
 
        _stylePlayer: function() {
            let d;
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
 
            d = buildVenderPropertyDict(transitionProperties, 'width 0s linear, left 0s linear');
            // Bugfix for Firefox
            // Parts of the header (search box) are hidden under the player.
            // Firefox doesn't seem to be using the fixed header+guide yet.
            d['float'] = 'initial';
            // Skinny mode
            d['left'] = 0;
            d['margin-left'] = 0;
            ytwp.style.appendRule(scriptBodySelector + ' #player-api', d);
 
            // Theater mode
            ytwp.style.appendRule(scriptBodySelector + ' .watch-stage-mode #player .player-api', {
                'left': 'initial !important',
                'margin-left': 'initial !important',
            });
 
            // !important is mainly for simplicity, but is needed to override the !important styling when the Guide is open due to:
            // .sidebar-collapsed #watch7-video, .sidebar-collapsed #watch7-main, .sidebar-collapsed .watch7-playlist { width: 945px!important; }
            // Also, Youtube Center resizes #player at element level.
            // Don't resize if Youtube+'s html.floater is detected.
            // Dont' resize if Youtube+ (Iridium/Material)'s html.iri-always-visible is detected.
            ytwp.style.appendRule(
                [
                    scriptSelector + ' #player',
                    scriptSelector + ' #player-wrap',
                    scriptSelector + ' #player-api',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #movie_player',
                    scriptSelector + ' #player-mole-container',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' .html5-video-container',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' .html5-main-video',
                    scriptSelector + ' ytd-watch-flexy[theater] #player-theater-container.ytd-watch-flexy',
                    scriptSelector + ' ytd-watch-flexy[flexy] #player-container-outer.ytd-watch-flexy',
                    scriptSelector + ' ytd-watch-flexy[flexy] #player-container-inner.ytd-watch-flexy',
                    scriptSelector + ' ytd-watch-flexy[flexy] #player-container.ytd-watch-flexy',
                    scriptSelector + ' ytd-watch-grid[theater] #player-theater-container.ytd-watch-grid',
                    scriptSelector + ' ytd-watch-grid[flexy] #player-container-outer.ytd-watch-grid',
                    scriptSelector + ' ytd-watch-grid[flexy] #player-container-inner.ytd-watch-grid',
                    scriptSelector + ' ytd-watch-grid[flexy] #player-container.ytd-watch-grid',
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
 
            // Fix video cropping (object-fit: cover) (Issue #70)
            ytwp.style.appendRule(scriptSelector + ' .ytp-fit-cover-video .html5-main-video', 'object-fit', 'contain !important');
            // Thumbnail cropping
            ytwp.style.appendRule(scriptSelector + ' .ytp-cued-thumbnail-overlay-image', {
                'background-size': 'contain !important',
                '-moz-background-size': 'contain !important',
                '-webkit-background-size': 'contain !important',
            });
 
            //--- Video Container Background
            ytwp.style.appendRule(scriptSelector + ' #movie_player', 'background-color', '#000000');
 
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
        },
 
        _styleSidebar: function() {
            // Remove the transition delay as you can see it moving on page load.
            const d = buildVenderPropertyDict(transitionProperties, 'margin-top 0s linear, padding-top 0s linear');
            d['margin-top'] = '0 !important';
            d['top'] = '0 !important';
            ytwp.style.appendRule(scriptSelector + ' #watch7-sidebar', d);
            ytwp.style.appendRule(scriptSelector + '.cardified-page #watch7-sidebar-contents', 'padding-top', '0');
        },
 
        _styleMasthead: function() {
            // Absolutely position the fixed header.
            ytwp.style.appendRule('#skip-navigation.ytd-masthead', 'top', '-150vh'); // Normally -1000px can be shorter than screen (Issue #77)
            const d = buildVenderPropertyDict(transitionProperties, 'top 0s linear !important');
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
            // When the guide is open, it adds body{top:-1000px} which messes with the top position (Issue #77)
            ytwp.style.appendRule(scriptSelector + '.lock-scrollbar', {
                'top': '0 !important',
                'position': 'static !important',
            });
        },
 
        _styleMiniplayer: function() {
            ytwp.style.appendRule(scriptSelector + ' #miniplayer-bar #player', {
                'position': 'static',
            });
            ytwp.style.appendRule(
                [
                    scriptSelector + ' #miniplayer-bar #player',
                    scriptSelector + ' #miniplayer-bar #player-api',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #miniplayer-bar #movie_player',
                    scriptSelector + ' #player-mole-container',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #miniplayer-bar .html5-video-container',
                    scriptHtmlSelector + ':not(.floater):not(.iri-always-visible) ' + scriptBodySelector + ' #miniplayer-bar .html5-main-video',
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
        },
 
        _styleMisc: function() {
            // Hide Scrollbars
            ytwp.style.appendRule(scriptSelector + '.' + topOfPageClassId, 'overflow-x', 'hidden');
 
            // Fix Other Possible Style Issues
            ytwp.style.appendRule(scriptSelector + ' #placeholder-player', 'display', 'none');
            ytwp.style.appendRule(scriptSelector + ' #watch-sidebar-spacer', 'display', 'none');
            ytwp.style.appendRule(scriptSelector + ' .skip-nav', 'display', 'none');
 
            // Whitespace Leftover From Moving The Video
            ytwp.style.appendRule(scriptSelector + ' #page.watch', 'padding-top', '0');
            ytwp.style.appendRule(scriptSelector + ' .player-branded-banner', 'height', '0');
 
            // Youtube+ Compatibility
            ytwp.style.appendRule(scriptSelector + ' #body-container', 'position', 'static');
            ytwp.style.appendRule(scriptHtmlSelector + '.part_static_size:not(.content-snap-width-skinny-mode) ' + scriptBodySelector + ' .watch-non-stage-mode #player-playlist', 'width', '1066px');
        },
 
        _stylePlaylistBar: function() {
            ytwp.style.appendRule([
                scriptSelector + ' #placeholder-playlist',
                scriptSelector + ' #player .player-height#watch-appbar-playlist',
            ], {
                'height': '540px !important',
                'max-height': '540px !important',
            });
 
            let d = buildVenderPropertyDict(transitionProperties, 'transform 0s linear');
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
            ytwp.style.appendRaw('@media screen and (min-height: 630px) and (min-width: 1294px) {\n');
            ytwp.style.appendRule(scriptSelector + ' #player .player-height#watch-appbar-playlist', {
                'left': 'calc((100vw - 1280px)/2 + 854px + 10px)',
            });
            ytwp.style.appendRaw('}\n @media screen and (min-width: 1720px) and (min-height:980px) {\n');
            ytwp.style.appendRule(scriptSelector + ' #player .player-height#watch-appbar-playlist', {
                'left': 'calc((100vw - 1706px)/2 + 1280px + 10px)',
            });
            ytwp.style.appendRaw('}\n');
        },
 
        _styleMaterialUI: function() {
            ytwp.style.appendRule(scriptSelector + '.ytwp-scrolltop #extra-buttons', 'display', 'none !important');
            ytwp.style.appendRule('ytd-app', 'position', 'static !important');
            ytwp.style.appendRule('ytd-watch #top', 'margin-top', '71px !important'); // 56px (topnav height) + 15px (margin)
            ytwp.style.appendRule('ytd-watch #container', 'margin-top', '0 !important');
            ytwp.style.appendRule('ytd-watch #content-separator', 'margin-top', '0 !important');
            // Note: Container is now relative since 2023 June (Issue #77)
            // Note: Container is now a full-bleed-player (Issue #79)
            ytwp.style.appendRule([
                scriptSelector + ' ytd-watch-flexy[theater] #player-wide-container.ytd-watch-flexy',
                scriptSelector + ' ytd-watch-flexy[fullscreen] #player-wide-container.ytd-watch-flexy',
                scriptSelector + ' ytd-watch-flexy[full-bleed-player] #player-full-bleed-container.ytd-watch-flexy', // Issue #79 (2023-08-17)
                scriptSelector + ' ytd-watch-flexy[full-bleed-player] #full-bleed-container.ytd-watch-flexy', // Issue #79 (2023-08-22)
                scriptSelector + ' ytd-watch-grid[theater] #player-wide-container.ytd-watch-grid',
                scriptSelector + ' ytd-watch-grid[fullscreen] #player-wide-container.ytd-watch-grid',
                scriptSelector + ' ytd-watch-grid[full-bleed-player] #player-full-bleed-container.ytd-watch-grid', // Issue #81 (2023-08-30)
                scriptSelector + ' ytd-watch-grid[full-bleed-player] #full-bleed-container.ytd-watch-grid', // Issue #81 (2023-08-30)
            ], {
                'position': 'static',
                'height': 0,
                'min-height': 0,
            });
 
            ytwp.style.appendRule(scriptSelector + '.ytwp-viewing-video ytd-app #masthead-container.ytd-app', {
                'position': 'absolute',
                'top': playerHeight,
                'z-index': 0,
            });
            ytwp.style.appendRule(scriptSelector + '.ytwp-viewing-video ytd-watch #masthead-positioner', {
                'top': playerHeight + ' !important',
            });
            ytwp.style.appendRule(scriptSelector + ' .ytp-cued-thumbnail-overlay', 'z-index', '10');
 
            // Flexy UI
            ytwp.style.appendRule([
                scriptSelector + ' ytd-watch-flexy[theater] #player-theater-container.ytd-watch-flexy',
                scriptSelector + ' ytd-watch-grid[theater] #player-theater-container.ytd-watch-grid',
            ], {
                'position': 'absolute',
                'top': '0',
            });
            ytwp.style.appendRule('#page-manager.ytd-app', 'padding-top', 'var(--ytd-masthead-height,var(--ytd-toolbar-height))');
            ytwp.style.appendRule(scriptSelector + ' #error-screen', 'z-index', '11');
        },
        onWatchInit: function() {
            ytwp.log('onWatchInit');
            if (!ytwp.initialized) return;
            if (ytwp.pageReady) return;
 
            if (enableOnLoad) {
                ytwp.event.addBodyClass();
            }
            if (ytwp.hasYoutubeChanged()) {
                ytwp.debugPage()
            }
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
        removeBodyClass: function() {
            document.body.classList.remove(scriptBodyClassId);
            ytwp.log('Removed ' + scriptBodySelector);
        },
    };
 
    ytwp.fixMasthead = function() {
        ytwp.log('fixMasthead');
        const el = document.querySelector('#masthead-positioner-height-offset');
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
        const e = document.querySelector('input#search');
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
                const el = mutation.target;
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
    const INIT_RETRY_MAX = 20; // 20 retries x 100ms = 2 seconds max wait
 
    ytwp.initRetryCount = 0;
 
    // Entry point called by navigation events and on first load.
    // Resets the retry counter so each new navigation gets a fresh 2-second window.
    ytwp.materialPageTransition = function() {
        ytwp.log('materialPageTransition')
        ytwp.initRetryCount = 0;
        ytwp.materialPageTransitionAttempt();
    };
 
    // Contains the actual transition logic. Called immediately by materialPageTransition,
    // and retried up to INIT_RETRY_MAX times when the player is not yet in the DOM.
    ytwp.materialPageTransitionAttempt = function() {
        ytwp.init();
 
        if (ytwp.isWatchUrl()) {
            ytwp.removeSearchAutofocus();
            if (enableOnLoad) {
                ytwp.event.addBodyClass();
            }
            if (!ytwp.initialized) {
                if (ytwp.initRetryCount < INIT_RETRY_MAX) {
                    ytwp.initRetryCount++;
                    ytwp.log('materialPageTransition: player not ready, retry ' + ytwp.initRetryCount + '/' + INIT_RETRY_MAX)
                    setTimeout(ytwp.materialPageTransitionAttempt, 100);
                } else {
                    ytwp.error('materialPageTransition: player did not appear after ' + INIT_RETRY_MAX + ' retries, giving up')
                }
            } else {
                ytwp.observePlayer();
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
        // Using YouTube's own navigation events (more reliable than history patching).
        document.addEventListener('yt-page-data-fetched', ytwp.materialPageTransition)
        document.addEventListener('yt-navigate-finish', ytwp.materialPageTransition)
 
        // Debugging
        document.addEventListener('yt-page-data-fetched', function(e){ ytwp.log('document.yt-page-data-fetched', e)})
        document.addEventListener('yt-navigate-finish', function(e){ ytwp.log('document.yt-navigate-finish', e)})
    };
 
    ytwp.playerObservers = [];
 
    ytwp.observePlayer = function() {
        ytwp.playerObservers.forEach(function(obs) { if (obs) obs.disconnect(); });
        ytwp.playerObservers = [];
 
        let debounceTimer = 0;
        function onMutation() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(ytwp.updatePlayer, 50);
        }
        ytwp.playerObservers.push(observe('ytd-page-manager', { childList: true }, onMutation));
        ytwp.playerObservers.push(observe('ytd-watch-flexy', { attributes: true, attributeFilter: ['theater', 'hidden'] }, onMutation));
        ytwp.playerObservers.push(observe('ytd-watch-grid',  { attributes: true, attributeFilter: ['theater', 'hidden'] }, onMutation));
    }
 
    ytwp.main = function() {
        ytwp.registerListeners();
        ytwp.init();
        ytwp.fixMasthead();
        ytwp.observePlayer();
    };
 
    ytwp.main();
 
    ytwp.attemptToUpdatePlayer = function() {
        ytwp.updatePlayer();
    }
 
    ytwp.updatePlayer = function() {
        ytwp.removeSearchAutofocus();
        ytwp.enterTheaterMode();
        ytwp.detectPlayerUnavailable();
    }
 
    ytwp.toggleExtension = function() {
        document.body.classList.toggle('ytwp-window-player')
        ytwp.setTheaterMode(document.body.classList.contains('ytwp-window-player'))
    }
  
    //--- Main
    ytwp.materialPageTransition()
    setInterval(ytwp.updatePlayer, 5000);
 
    //--- Keyboard Shortcut
    function childOf(child, ancestor) {
        let parent = child.parentNode
        while (parent) {
            if (parent == ancestor) {
                return true
            }
            parent = parent.parentNode
        }
        return false
    }
    function cancelIfToggleKey(validKeyCallback, e) {
        const isKey = e.key === scriptToggleKey
        const validTarget = (
            e.target === document.body
            || e.target.id === 'player-api'
            || e.target.id === 'movie_player'
            || childOf(e.target, document.querySelector('#movie_player'))
        )
        if (validTarget && isKey) {
            e.preventDefault()
            e.stopPropagation()
            console.log('cancelIfToggleKey.validKeyCallback', validKeyCallback, 'e', e)
            if (validKeyCallback) {
                validKeyCallback()
            }
        }
    }
    window.addEventListener('keydown', cancelIfToggleKey.bind(null, ytwp.toggleExtension), true)
    window.addEventListener('keyup', cancelIfToggleKey.bind(null, null), true)
 
    //--- Browser Extension
    if (typeof browser !== "undefined") {
        browser.runtime.onMessage.addListener(request => {
            if (request.id == "toggle") {
                ytwp.toggleExtension()
 
                return Promise.resolve({
                    enabled: document.body.classList.contains('ytwp-window-player'),
                })
            } else {
                return Promise.reject(new Error('Unreconized message.id'))
            }
        });
    }
})(window);
