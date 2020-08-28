// ==UserScript==
// @name            Resize Reddit To Window Size
// @description     Resize the video player for various sites to the window size.
// @author          Chris H (Zren / Shade)
// @namespace       https://www.github.com/Zren
// @icon            https://reddit.com/favicon.ico
// @version         50
// @include         https://*.reddit.com/*
// @grant           GM_addStyle
// ==/UserScript==

(function() {
    var movedTopPlayer = function(videoBoxElement) {
        document.body.insertBefore(videoBoxElement, document.body.firstChild);
        videoBoxElement.style.width = '100%'
        videoBoxElement.style.height = '100vh'
        videoBoxElement.style.backgroundColor = '#000'
    }

    var urlMatch = function(regexStr) {
        regexStr = regexStr.replace(/\//g, '\\/'); // Auto escape forward slashes to make url regexes more legible.
        var regex = new RegExp(regexStr);
        return regex.exec(window.location.href);
    }

    var addViewportHeight = function(selector) {
        var el = document.querySelector(selector)
        if (!el) { return }
        var style = getComputedStyle(el)
        if (style.position == "absolute") {
            var top = style.top || "0"
            el.style.top = "calc(100vh + " + top + ")"
        }
    }

    if (document.location.host.endsWith('reddit.com')) {
        var commentsRegex = /^https:\/\/www\.reddit\.com\/(r|user)\/[^\/]+\/comments\//
        if (!window.location.href.match(commentsRegex)) { return }
        var videoBoxElement = document.querySelector('.reddit-video-player-root')
        if (!videoBoxElement) { return }
        movedTopPlayer(videoBoxElement)
        var css = '.reddit-video-player-root { width: 100vw !important; height: 100vh !important; position: relative !important; display: block !important; float: none; z-index: 1000000; }'
        css += '.reddit-video-player-root .pinned-controls { display: none; }'
        css += '.pinnable-content.pinned { background-color: transparent !important; box-shadow: none !important; }'
        css += '.pinnable-content.pinned .dismiss-pinnable { display: none; }'
        css += '.pinnable-content .expando { display: none; }'
        css += '.pinnable-content .expando-button { visibility: hidden; }'
        css += '.pinnable-content.pinned { position: static !important; }'
        css += '.pinnable-content.pinned .top-matter { position: static !important; }'
        css += '.pinnable-content.pinned .midcol { position: static !important; }'
        css += 'html, body { padding-left: 0 !important; padding-right: 0 !important }'
        GM_addStyle(css)

        setTimeout(function(){
            addViewportHeight('.side #search')
            addViewportHeight('.side .submit-link')
            addViewportHeight('.side .submit-text')
            addViewportHeight('.linkinfo')
        }, 2000)
    }

    GM_addStyle('html::-webkit-scrollbar { width: 0; height: 0; } body::-webkit-scrollbar { width: 0; height: 0; }')
    GM_addStyle('html { scrollbar-width: none; } body { scrollbar-width: none; }')
})();
