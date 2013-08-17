// ==UserScript==
// @name            Resize YT To Window Size
// @description     Moves the video to the top of the website and resizes it to the screen size.
// @author          Chris H (Zren / Shade)
// @icon            http://youtube.com/favicon.ico
// @homepageURL     http://userscripts.org/scripts/show/153699
// @downloadURL     http://userscripts.org/scripts/source/153699.user.js
// @updateURL       http://userscripts.org/scripts/source/153699.meta.js
// @namespace       http://xshade.ca
// @version         1.25
// @include         http*://*.youtube.com/*
// @include         http*://youtube.com/*
// ==/UserScript==

// https://github.com/Zren/ResizeYoutubePlayerToWindowSize

(function () {
    "use strict";

    //--- Constants
    var scriptShortName = 'ytwp'; // YT Window Player
    var injectedStyleId = scriptShortName + '-style'; // ytwp-style
    var scriptBodyClassId = scriptShortName + '-window-player'; // .ytwp-window-player
    var viewingVideoClassId = scriptShortName + '-viewing-video'; // .ytwp-viewing-video
    var topOfPageClassId = scriptShortName + '-scrolltop'; // .ytwp-scrolltop
    var scriptBodyClassSelector = 'body.' + scriptBodyClassId; // body.ytwp-window-player
    
    var videoContainerId = "player-api-legacy";
    
    var scriptStylesheet = '';
    
    var transitionProperties = ["transition", "-ms-transition", "-moz-transition", "-webkit-transition", "-o-transition"];
    
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
            var classes, elem, cur, clazz, j,
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
    
    //--- Utils
    function isStringType(obj) { return typeof obj === 'string'; }
    function isArrayType(obj) { return obj instanceof Array; }
    function isObjectType(obj) { return typeof obj === 'object'; }
    function isUndefined(obj) { return typeof obj === 'undefined'; }
    
    function buildCSS(selector, styles) {
        var s = "";
        for (var key in styles) {
            s += "\t" + key + ": " + styles[key] + ";\n";
        }
        return selector + " {\n" + s + "}\n";
    }
    
    
    function appendStyle(selector, k, v) {
        var newStyle;
        if (!isUndefined(k) && !isUndefined(v) && isStringType(k)) { // v can be any type (as we stringify it).
            // appendStyle('#blarg', 'display', 'none');
            var d = {};
            d[k] = v;
            newStyle = buildCSS(selector, d);
        } else if (!isUndefined(k) && isUndefined(v) && isObjectType(k)) {
            // appendStyle('#blarg', {'display': 'none'});
            newStyle = buildCSS(selector, k);
        } else {
            // Invalid Arguments
            console.log('Illegal arguments', selector, k, v);
            return;
        }
        
        scriptStylesheet += newStyle;
    }
    
    function injectStyle(style) {
        var styleElement = document.getElementById(injectedStyleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.id = injectedStyleId;
            document.getElementsByTagName('head')[0].appendChild(styleElement);
        }
        styleElement.appendChild(document.createTextNode(style));
        
        return 1;
    }
    
    function buildVenderPropertyDict(propertyNames, value) {
        var d = {};
        for (var i in propertyNames)
            d[propertyNames[i]] = value;
        return d;
    }
    
    //--- 
    
    function moveVideoContainer() {
        //--- Video Container
        var videoContainer = document.getElementById(videoContainerId);
        
        // Make sure YT hasn't changed or on a page without a video player.
        if (!videoContainer) return 0;
        
        // Move the video to the top of page.
        var body = document.body;
        body.insertBefore(videoContainer, body.firstChild);

        return 1;
    }
    
    function movePlaylist() {
        // Move the bar to the top of the main container.
        var mainContainer = document.getElementById('watch7-main-container');
        var bar = document.getElementById('playlist-legacy');
        if (mainContainer && bar)
            mainContainer.insertBefore(bar, mainContainer.firstChild);
        
        // Move the tray to inside the sidebar
        var tray = document.getElementById('watch7-playlist-tray-container');
        var sidebar = document.getElementById('watch7-sidebar');
        if (tray && sidebar)
            sidebar.insertBefore(tray, sidebar.firstChild);
        
        return 1;
    }
    
    function resizeVideoPlayer() {
        //--- Video Player
        
        //
        var d = buildVenderPropertyDict(transitionProperties, 'left 0s linear, padding-left 0s linear');
        
        // Youtube Center resizes #player at element level.
        d['width'] = '0 !important';
        d['height'] = '0 !important';

        appendStyle(scriptBodyClassSelector + ' #player', d);
        
        //
        var d = buildVenderPropertyDict(transitionProperties, 'width 0s linear, left 0s linear');

        // Bugfix for Firefox
        // Parts of the header (search box) are hidden under the player.
        // Firefox doesn't seem to be using the fixed header+guide yet.
        d['float'] = 'initial';

        appendStyle(scriptBodyClassSelector + ' #' + videoContainerId, d);
        
        // !important is mainly for simplicity, but is needed to override the !important styling when the Guide is open due to:
        // .sidebar-collapsed #watch7-video, .sidebar-collapsed #watch7-main, .sidebar-collapsed .watch7-playlist { width: 945px!important; }
        appendStyle(
            scriptBodyClassSelector + ' #' + videoContainerId + ', ' + scriptBodyClassSelector + ' #movie_player',
            {
                'width': '100% !important',
                'height': '100% !important'
            }
        );
        
            
        //--- Sidebar
        
        // Remove the transition delay as you can see it moving on page load.
        var d = buildVenderPropertyDict(transitionProperties, 'margin-top 0s linear, padding-top 0s linear');
        d['margin-top'] = '0 !important';
        appendStyle(scriptBodyClassSelector + ' #watch7-sidebar', d);
        
        //--- Fix Other Possible Style Issues

        //--- Whitespace Leftover From Moving The Video
        appendStyle(scriptBodyClassSelector + ' #page.watch', 'padding-top', '0');
        appendStyle(scriptBodyClassSelector + ' .player-branded-banner', 'height', '0');
        appendStyle(scriptBodyClassSelector + ' #player-legacy', {
            'height': '0',
            'margin-top': '0',
            'padding-top': '0'
        });
        
        //--- Video Manager (When viewing own videos)
        appendStyle(scriptBodyClassSelector + ' #watch7-creator-bar', 'width', '100% !important');
        
        //--- Playlist Bar
        appendStyle(scriptBodyClassSelector + ' #watch7-playlist-tray-container', "margin", "-15px -10px 20px -10px");
        
        return 1;
    }
    
    function addBodyClass() {
        // Insert CSS Into the body so people can style around the effects of this script.
        jQuery.addClass(document.body, scriptBodyClassId);
        
        return 1;
    }
    
    function onScroll() {
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
    }
    
    function scrollTriggered() {
        //--- Absolutely position the fixed header.
        // Masthead
        appendStyle(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #masthead-positioner', {
            'position': 'absolute',
            'top': '100%'
        });
        
        // Guide
        appendStyle(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #appbar-guide-menu', {
            'display': 'initial',
            'position': 'absolute',
            'top': '0'
        });
        appendStyle(scriptBodyClassSelector + '.' + viewingVideoClassId + ' #page.watch #guide', {
            'display': 'initial',
            'margin': '0',
            'position': 'initial'
        });

        //---
        // Hide Scrollbars
        appendStyle(scriptBodyClassSelector + '.' + topOfPageClassId, 'overflow-x', 'hidden');
        

        // Register listener & Call it now.
        unsafeWindow.addEventListener('scroll', onScroll, false);
        unsafeWindow.addEventListener('resize', onScroll, false);
        
        onScroll();
        
        return 1;
    }

    function onNavigate() {
        // Unload
        
        // Delete the Video player (as it's not where it normally is).
        var videoContainer = document.getElementById(videoContainerId);
        if (videoContainer)
            videoContainer.remove();
        
        // Remove our stylesheet.
        var styleElement = document.getElementById(injectedStyleId);
        if (styleElement)
            styleElement.remove();

        //jQuery.removeClass(document.body, scriptBodyClassId);
    }

    function onVideoPage() {
        !document.body.classList.contains(scriptBodyClassId) // Test if the script has already been run.
            && resizeVideoPlayer()
            && scrollTriggered()
            && injectStyle(scriptStylesheet) // Apply created stylesheet.
            && movePlaylist()
            && moveVideoContainer()
            && addBodyClass() // Only add class if found & moved the player.
            ;
    }

    function registerYoutubeListeners() {
        unsafeWindow.yt.pubsub.instance_.subscribe("navigate", function(){
            unsafeWindow.location.href; // Current URL. pushState hasn't yet been called.
            
            onNavigate();

            // @return DoAjaxNavigation, A false value will prevent SPF and do a normal page navigation.
            return true;
        });

        unsafeWindow.yt.pubsub.instance_.subscribe("player-added", function(player){
            unsafeWindow.location.href; // Should be a video URL
            
            onVideoPage();

            // @return ?, Return true just in case.
            return true;
        });
    }
    
    function main() {
        try {
            registerYoutubeListeners();
        } catch(e) {
            console.error("[Resize YT Player]", "Could not hook yt.pubsub");
        }
        onVideoPage();
    }
    
    main();

})();
