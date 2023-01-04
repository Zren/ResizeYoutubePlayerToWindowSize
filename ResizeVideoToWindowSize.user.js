// ==UserScript==
// @name            Resize Video To Window Size
// @description     Resize the video player for various sites to the window size.
// @author          Chris H (Zren / Shade)
// @namespace       http://xshade.ca
// @version         64
// @include         https://www.crunchyroll.com/*
// @include         https://beta.crunchyroll.com/*
// @include         https://static.crunchyroll.com/vilos-v2/web/vilos/player.html*
// @include         https://docs.google.com/file/*
// @include         https://drive.google.com/drive/*
// @include         https://drive.google.com/file/*
// @include         https://vimeo.com/*
// @include         http://onepieceofficial.com/videos.aspx*
// @include         http://www.onepieceofficial.com/videos.aspx*
// @include         https://www.youpak.com/watch*
// @include         https://olympics.cbc.ca/video/*
// @include         https://olympics.cbc.ca/divaPlayer/*
// @include         http://www.dailymotion.com/*
// @include         https://www.dailymotion.com/*
// @include         https://streamable.com/*
// @include         https://www.globaltv.com/shows/*
// @include         https://watch.globaltv.com/video/*
// @include         https://www.much.com/shows/south-park/episode/*/*/
// @include         http://*.ctvnews.ca/*
// @include         https://watch.cbc.ca/live/channel/*
// @include         https://watch.cbc.ca/live/*
// @include         https://www.ctv.ca/shows/*
// @include         https://www.ctv.ca/video/*
// @include         https://www.ctv.ca/*/Video*
// @include         https://www.ctv.ca/Movie/*
// @include         https://www.funimation.com/shows/*
// @include         https://www.funimation.com/player/*
// @include         https://www.crave.ca/*
// @include         https://tubitv.com/*
// @grant           GM_addStyle
// ==/UserScript==

(function() {
    var fixedOverlayPlayer = function(selector) {
        var css = selector + "{";
        css += "position: fixed;";
        css += "top: 0;";
        css += "left: 0;";
        css += "right: 0;";
        css += "bottom: 0;";
        css += "}";
        GM_addStyle(css);
    };

    var absoluteTopPlayer = function(selector, staticSelectors) {
        var css = selector + "{";
        css += "position: absolute;";
        css += "top: 0;";
        css += "left: 0;";
        css += "width: 100vw;";
        css += "height: 100vh;";
        css += "padding: 0;";
        css += "margin: 0;";
        css += "}";
        css += "body {";
        css += "margin-top: 100vh;";
        css += "margin-top: 100vh;";
        css += "padding-top: 0;";
        css += "}";
        if (staticSelectors) {
            css += staticSelectors + "{";
            css += "position: static";
            css += "}";
        }
        GM_addStyle(css);
    };

    var movedTopPlayer = function(videoBoxElement) {
        document.body.insertBefore(videoBoxElement, document.body.firstChild);
        videoBoxElement.style.width = '100%';
        videoBoxElement.style.height = '100%';
        videoBoxElement.style.backgroundColor = '#000';
    };

    var waitFor = function(selector, callback) {
        var tick = function(){
            var e = document.querySelector(selector);
            if (e) {
                callback(e);
            } else {
                setTimeout(tick, 100);
            }
        };
        tick();
    };

    var bindJWPlayerSpacebar = function() {
        window.addEventListener('keydown', function(e){
            if (e.key == ' ' && e.target == document.body) {
                var video = document.querySelector('.jwplayer video')
                if (video) {
                    e.preventDefault();
                    if (video.paused) {
                        video.play()
                    } else {
                        video.pause()
                    }
                }
            }
        });
    };

    var urlMatch = function(regexStr) {
        regexStr = regexStr.replace(/\//g, '\\/'); // Auto escape forward slashes to make url regexes more legible.
        var regex = new RegExp(regexStr);
        return regex.exec(window.location.href);
    };

    if (document.location.host.endsWith('crunchyroll.com')) {
        // console.log('doc loc', document.location)
        // console.log('win loc', window.location)
        if (document.location.hostname == 'www.crunchyroll.com' || document.location.hostname == 'beta.crunchyroll.com') {
            var rvtwsHeaderClass = 'rvtws-header-hidden'
            var css = ''
            css += '.erc-header.'+rvtwsHeaderClass+' { position: absolute; }'
            css += '.erc-header.'+rvtwsHeaderClass+' .header-content { opacity: 0; transition: opacity: 0.1s; }'
            css += '.erc-header.'+rvtwsHeaderClass+' .header-content:hover { opacity: 1; }'
            css += '.erc-watch-episode-layout .video-player-wrapper { max-height: 100vh; height: 100vh; display: flex; }'
            // css += '.erc-watch-episode-layout .video-player { height: 56.25vw; align-self: center; }'
            GM_addStyle(css)
            function updateHeader() {
                var ercHeader = document.querySelector('.erc-header')
                var ercWatchEpisode = document.querySelector('.erc-watch-episode')
                if (ercHeader) {
                    if (ercWatchEpisode) {
                        ercHeader.classList.add(rvtwsHeaderClass)
                    } else {
                        ercHeader.classList.remove(rvtwsHeaderClass)
                    }
                }
            }
            window.addEventListener('popstate', updateHeader)
            setInterval(updateHeader, 1000)
            updateHeader()
        } else if (document.location.hostname == 'static.crunchyroll.com' && document.location.pathname == '/vilos-v2/web/vilos/player.html') {
            GM_addStyle('#vilosRoot { height: 100vh !important; }');
            GM_addStyle('#vilosControlsContainer > div:first-child { margin-top: 3.75rem; }'); // Make room for header
        }
    } else if (document.location.href.startsWith('https://docs.google.com/file/')) {
        fixedOverlayPlayer('#drive-viewer-video-player-object-0');
        var css = 'body:not(:hover) .ytp-chrome-bottom { opacity: 0 !important; }';
        css += 'body:not(:hover) .drive-viewer-toolstrip { opacity: 0 !important; }';
        GM_addStyle(css);
    } else if (document.location.href.startsWith('https://drive.google.com/')) {
        fixedOverlayPlayer('.drive-viewer-video-player');
        var css = '.drive-viewer-toolstrip { opacity: 0 !important; }';
        css += '.drive-viewer-toolstrip:hover { opacity: 1 !important; }';
        GM_addStyle(css);
    } else if (document.location.href.startsWith('https://vimeo.com/')) {
        if (! /\/\d+/.exec(document.location.pathname))
            return;
        var css = '.js-player_area-wrapper, .player_area-wrapper, .player_area, .player_container, .player, .video-wrapper, .video, .video * { width: 100vw !important; height: 100vh !important; max-height: 100vh !important; }';
        css += '.vp-player-layout { left: 0 !important; top: 0 !important; width: 100vw !important; height: 100vh !important; }';
        css += '.clip_main > *:not(.player_area-wrapper) { margin-top: 70px; }';
        css += '.VimeoBrand_ColorRibbon, .body_ribbon, .topnav_desktop, .topnav_mobile { position: absolute; top: 100vh; width: 100%; }';
        css += '.topnav_desktop { top: calc(100vh + 5px); }';
        GM_addStyle(css);

        // autoplay
        function tick() {
            var e = document.querySelector('button.play[aria-label="Play"]');
            if (e) {
                e.click();
            } else {
                setTimeout(tick, 100);
            }
        }
        setTimeout(tick, 100);
    } else if (document.location.host.endsWith('onepieceofficial.com')) {
        movedTopPlayer(document.querySelector('#FUNimationVideo'));
    } else if (document.location.host.endsWith('youpak.com')) {
        movedTopPlayer(document.querySelector('.videoWrapper'))
        var css = 'body > .container { padding-top: 60px; }'
        css += '.navbar-fixed-top { position: absolute; top: 100vh; }'
        css += 'body { padding-top: 0; }'
        GM_addStyle(css)
    } else if (document.location.host == 'olympics.cbc.ca') {
        console.log(document.location.pathname, document.location.pathname.match(/\/video\/([^\/]+)\/([^\/]+)(\/?)/))
        if (document.location.pathname.match(/\/video\/([^\/]+)\/([^\/]+)(\/?)/)) {
            var css = '.cbc-video--player-wrapper { position: static !important; }'
            css += '.cbc-video {'
            css += '    position: absolute !important;'
            css += '    top: 0 !important;'
            css += '    left: 0 !important;'
            css += '    padding: 0px !important;'
            css += '    margin: 0px !important;'
            css += '    width: 100% !important;'
            css += '    height: 100vh !important;'
            css += '}'
            css += 'figure.cbc-video--thumb-wrapper, a[data-js-hook="play-video"] picture img { max-height: 100vh !important; }'
            css += '.or-podium .or-box { position: static !important; }'
            css += '.or-podium .col-xs-1, .or-podium .col-sm-1, .or-podium .col-md-1, .or-podium .col-lg-1, .or-podium .col-xs-2, .or-podium .col-sm-2, .or-podium .col-md-2, .or-podium .col-lg-2, .or-podium .col-xs-3, .or-podium .col-sm-3, .or-podium .col-md-3, .or-podium .col-lg-3, .or-podium .col-xs-4, .or-podium .col-sm-4, .or-podium .col-md-4, .or-podium .col-lg-4, .or-podium .col-xs-5, .or-podium .col-sm-5, .or-podium .col-md-5, .or-podium .col-lg-5, .or-podium .col-xs-6, .or-podium .col-sm-6, .or-podium .col-md-6, .or-podium .col-lg-6, .or-podium .col-xs-7, .or-podium .col-sm-7, .or-podium .col-md-7, .or-podium .col-lg-7, .or-podium .col-xs-8, .or-podium .col-sm-8, .or-podium .col-md-8, .or-podium .col-lg-8, .or-podium .col-xs-9, .or-podium .col-sm-9, .or-podium .col-md-9, .or-podium .col-lg-9, .or-podium .col-xs-10, .or-podium .col-sm-10, .or-podium .col-md-10, .or-podium .col-lg-10, .or-podium .col-xs-11, .or-podium .col-sm-11, .or-podium .col-md-11, .or-podium .col-lg-11, .or-podium .col-xs-12, .or-podium .col-sm-12, .or-podium .col-md-12, .or-podium .col-lg-12 { position: static; }'
            css += 'body:not(.cbc-main-page) { padding-top: 100vh; }'
            GM_addStyle(css);
            var playVideoButton = document.querySelector('a[data-js-hook="play-video"]')
            if (playVideoButton) {
                playVideoButton.click()
            }
        } else if (document.location.pathname.startsWith('/divaPlayer')) {
            var css = '#videoContainer:not(:hover) > .caption { opacity: 0; }'
            css += '#videoContainer:not(:hover) .controlbar-diva { opacity: 0 !important; }'
            css += '#videoContainer:not(:hover) #icon-menu-diva { opacity: 0; }'
            css += '#videoContainer:not(:hover) diva-simple-controls { opacity: 0 !important; }'
            GM_addStyle(css);
        } else {
            return; // Keep scrollbars
        }
    } else if (false && document.location.host.endsWith('www.dailymotion.com')) {
        var css = '#player:not(:hover) .dmp_will-transition.dmp_is-transitioned--fadeinslide { opacity: 0; }';
        if (document.location.pathname.startsWith('/playlist')) {
            css += '#player_container { height: 100vh!important; width: 100vw!important; }';
            css += '#playerv5-iframe { width: 100% !important; height: 100% !important; }'; // playlists
            css += '.sd_header.sd_header--fixed { top: 100vh; position: absolute; }';
            css += '#content { margin-top: 60px; }';
            movedTopPlayer(document.querySelector('#player_container'));
            absoluteTopPlayer('#player_container');

            GM_addStyle(css);

        } else if (document.location.pathname.startsWith('/video')) {
            //css +='.main-container-player { display: none; }';
            //css += '#player { height: 100vh!important; width: 100vw!important; }';
            css += '.Player { height: 100vh!important; width: 100vw!important; }';
            css += '.Player { top: 0!important; left: 0!important; }';
            css += 'header { position: absolute!important; top: 100vh !important; }';
            css += 'footer { margin-top: 50px; }';
            css += 'div[class^="Video__placeholder___"] { margin-top: -180px; height: 100vh!important; }';
            GM_addStyle(css);
            document.addEventListener('load',function(){
                movedTopPlayer(document.querySelector('.Player'));
            });
        }

    } else if (document.location.host.endsWith('streamable.com')) {
        if (document.location.pathname == '/') {
            return;
        }
        var css = '#player-content, #player.container .media-container, #player.container #filler, #player.container .player { max-width: 100% !important; width:100%; }';
        css += '#player.container #filler { padding-bottom: 100vh !important; }';
        css += '.player { background: #000; }';
        css += '#player.container .player { display: flex; }';
        css += '.player, #player.container video { max-height: 100vh; object-fit: contain; }';
        css += '#player > div[style="height:15px;"] { display: none; }';
        css += '#player.container .topbanner { display: none; }';
        GM_addStyle(css);
    } else if (document.location.host.endsWith('globaltv.com')) {
        var css = 'html, body, #root, .App, .Video {'
        css += 'min-height: 100%; height: 100%; max-height: 100%;'
        css += 'min-width: 100%; width: 100%; max-width: 100%;'
        css += '}'
        css += 'body { overflow-y: auto; }'
        GM_addStyle(css);
        waitFor('.jwplayer', function(jwPlayerElement) {
            waitFor('.jwplayer video', function(videoElement) {
                setTimeout(function() {
                    videoElement.muted = false;
                }, 200)
            });
        });
        bindJWPlayerSpacebar();
    } else if (document.location.host.endsWith('much.com')) {
        var css = '#TopVideoWidgetSection, #ShowNav, #MainHeader, #MastHeadTakeover { display: none; }';
        css += '#ShowTop #PlayerWrapper, #ShowTop .container-fluid, #ShowTop #ShowInfo, #ShowTop {';
        css += 'margin: 0 !important; padding: 0 !important;';
        css += 'width: 100vw !important; height: 100vh !important; max-width: 100vw !important; max-height: 100vh !important;';
        css += '}';
        css += '#ShowTop #ShowInfo #EpisodeInfo { margin-top: 0 !important; }';
        css += '.jwplayer { max-height: 100vh; }';
        css += '#EpisodeInfo .new-episodes { display: none !important; }';
        GM_addStyle(css);
    } else if (document.location.host.endsWith('ctvnews.ca')) {
        if (window.location.pathname == '/latest') {
            // Redirect to latest video
            document.body.style.opacity = "0"
            document.documentElement.style.transition = "background 0.4s"
            document.documentElement.style.background = "#000"
            var latestVideoLink = document.querySelector('.mainnavigation + .drop_down + script + .drop_down > .drop_down_element_container > div > div > ul > li:first-child > a')
            if (latestVideoLink) {
                window.location.href = latestVideoLink.href
            }
        } else if (window.location.pathname == '/video') {
            var contentWrapper = document.querySelector('body > .content > .video-header > .content-wrapper')
            if (contentWrapper) {
                var header = document.querySelector('body > header')
                document.body.insertBefore(contentWrapper, header)
                var mediaplayerdiv = document.querySelector('#mediaplayerdiv')

                contentWrapper.querySelector('.topname').style.display = "none"
                contentWrapper.style.width = "100%"
                contentWrapper.style.height = "100vh"
                contentWrapper.style.maxWidth = "100vw"
                contentWrapper.style.maxHeight = "100vh"
                contentWrapper.style.background="#000"

                function onWindowResize() {
                    var viewportWidth = document.documentElement.clientWidth
                    var viewportHeight = document.documentElement.clientHeight
                    var translate = "translate(" + ((viewportWidth - 960)/2) + "px, " + ((viewportHeight - 540)/2) + "px)"
                    var scale = "scale(" + Math.min(viewportWidth / 960, viewportHeight / 540) + ")"
                    mediaplayerdiv.style.transform = translate + " " + scale
                }
                window.addEventListener('resize', onWindowResize);
                onWindowResize();
                return; // Keep scrollbars
            }
        } else {
            return; // Keep scrollbars
        }
    } else if (document.location.host.endsWith('watch.cbc.ca')) {
        var css = '#masthead { position: absolute; z-index: 1; width: 100%; opacity: 0; transition: opacity 250ms ease-in-out; }';
        css += '#masthead:hover { opacity: 1; }';
        css += '.regional-channel .container { max-width: 100%; }';
        css += '.player-container.live, .jwplayer.jw-flag-aspect-mode { max-height: 100vh; }';
        css += '.jwplayer.jw-stretch-uniform video { object-fit: contain !important; }';
        css += '.regional-channel footer.regional-channel-footer, section.content-article.live { padding: 10px 0; }';
        css += 'section.content-article.live-premium { display: none; }';
        css += '.upgrade-banner, .live-premium, iframe.zEWidget-launcher { display: none; }';
        css += '.upgrade-banner + .app-container.with-banner-large { top: 0; }';
        css += '.content-article { padding-top: 0; padding-bottom: 0; }';
        css += '.content-section.live-detail-layout { max-width: 100%; }';
        GM_addStyle(css);
    } else if (document.location.host.endsWith('www.ctv.ca')) {
        var css = ''
        css += 'header.navigation { opacity: 0; position: fixed; }'
        css += 'header.navigation:hover { opacity: 1; }'
        css += '.main { padding-top: 0 !important; }'
        css += '#vidi-player-standalone { margin: 0vw 0vw 0; }'
        css += 'div[class*="VidiPlayerstyles__VidiPlayerStandAloneContainer"] { margin: 0vw 0vw 0; }'
        css += '.jwplayer.jw-flag-aspect-mode { min-height: 100vh !important; height: 100vh !important; max-height: 100vh !important; }'
        css += 'div[class*="BrowserNotificationstyles"] { display: none; }'
        css += 'div[class^="ArrowBackstyles__ButtonContainer"] { display: none; }'

        css += 'div[class^="globalStyles__MainContainer"] { padding-top: 0 !important; }'
        css += 'div[class^="VidiPlayerstyles__VidiPlayerPageContainer"] { margin: 0 !important; }'
        GM_addStyle(css);
        waitFor('.jwplayer', function(jwPlayerElement) {
            waitFor('.jwplayer video', function(videoElement) {
                setTimeout(function() {
                    videoElement.muted = false;
                }, 200)
            });
        });
        bindJWPlayerSpacebar();
        var reverseEpisodeOrder = [
            '/shows/the-daily-show-with-trevor-noah',
        ]
        waitFor('ul[class*="Episodesstyles__EpisodeList"]', function(ul) {
            if (reverseEpisodeOrder.indexOf(document.location.pathname) >= 0) {
                for (var i = 0; i < ul.children.length; i++) {
                    ul.insertBefore(ul.children[i], ul.firstChild)
                }
            }
        });
        setInterval(function(){
            var e = document.querySelector('#__next div:not(.App)')
            if (e) {
                var h2 = e.querySelector('h2')
                if (h2 && h2.textContent == 'An unexpected error has occurred.') {
                    // CTV doesn't like uBlockOrigin, so reload the page to workaround the AJAX React links breaking.
                    window.location.reload()
                }
            }
        }, 100);
    } else if (document.location.host.endsWith('funimation.com')) {
        console.log('funimation.com')
        var videoBoxElement = document.querySelector('.video-player-section .video-player-container');
        console.log('videoBoxElement', videoBoxElement)
        if (videoBoxElement) {
            movedTopPlayer(videoBoxElement);
            videoBoxElement.classList.remove('col-md-10');

            var css = 'html, body { width: 100%; height: 100%; }';
            css += '.video-player-container { width: 100vw !important; height: 100vh !important; }';
            css += '#funimation-main-site-header { position: absolute; top: 100vh; }';
            GM_addStyle(css);
        } else {
            console.log('location', document.location)
            waitFor('#brightcove-player', function(player){
                console.log('player', player)
                player.removeAttribute('muted')
                waitFor('.vjs-mute-control.vjs-vol-0', function(muteButton){
                    console.log('muteButton', muteButton)
                    muteButton.click()
                })
            })
        }
    } else if (document.location.host.endsWith('crave.ca')) {
        if (document.location.pathname.startsWith('/live')) return;
        var videoBoxElement = document.querySelector('video-player');
        if (!videoBoxElement) return;
        var css = 'footer, .back-button-wrapper, #mega-menu { display: none !important; }';
        css += '.container-site-margin { margin-left: 0; margin-right: 0; }';
        css += '.web-videoplayer { margin: 0; }';
        css += 'html .jwplayer.jw-flag-aspect-mode { height: 100vh !important; }';
        GM_addStyle(css);
    } else if (document.location.host.endsWith('tubitv.com')) {
        var css = 'header { transition: transform .3s, opacity .3s !important; }';
        css += 'header.hide-header { opacity: 0 !important }';
        css += 'header.hide-header:hover { opacity: 1 !important; }';
        css += 'header + div > div:first-child > div:first-child > div:nth-child(2) { top: 0 !important; left: 0 !important; width: 100% !important; height: 100vh !important; }';
        css += 'header + div > div:first-child > div:first-child > div:nth-child(2) > div:first-child > section { padding-top: 0 !important; height: 100vh !important; }';
        css += 'header + div > div:first-child > div:first-child > div:nth-child(2) > div:first-child > section > div > div:nth-child(2) > div:first-child { background-image: linear-gradient(0deg,rgba(0,0,0,0), rgba(0,0,0,0.25) 30%, rgba(0, 0, 0, 1) 90%); }';
        css += 'header + div > div:first-child > div:first-child > div:nth-child(2) > div:first-child > section > div > div:nth-child(2) > div:nth-child(2) { background-image: linear-gradient(180deg,rgba(0,0,0,0), rgba(0,0,0,0.25) 30%, rgba(0, 0, 0, 1) 90%); }';
        css += '#captionsComponent > span { background: none !important; font-size: 3rem !important;';
        css += 'text-shadow: 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000, 0 0 0.5rem #000;';
        css += '}';
        GM_addStyle(css);
        var updateHeader = function() {
            var header = document.querySelector('header')
            if (header) {
                var video = document.querySelector('video')
                if (video) {
                    header.classList.add('hide-header')
                } else {
                    header.classList.remove('hide-header')
                }
            }
        }
        updateHeader()
        setInterval(updateHeader, 1000)
    }

    GM_addStyle('html::-webkit-scrollbar { width: 0; height: 0; } body::-webkit-scrollbar { width: 0; height: 0; }');
    GM_addStyle('html { scrollbar-width: none; } body { scrollbar-width: none; }');
})();
