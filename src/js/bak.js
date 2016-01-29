
var Player = $('canvas');
Player.audio = new Audio();
Player.background = $('<canvas>').prop({ width: Player.width(), height: Player.height() })[0];
Player.beatmap = undefined;
Player.ctx = Player[0].getContext('2d');
Player.body = $('body');
Player.container = $('#container');
Player.button = $('#play');
Player.progress = $('#progress');
Player.volume = $('#volume');
Player.speed = $('#speed');
Player.title = $('#title');


Player.loadBeatmap = function(id)
{
    Player.ctx.restore();
    Player.ctx.save();

    $('#mania').removeClass('e');

    Player.beatmap = undefined;
    $(Player.audio).trigger('pause')[0].pause();
    Player.button.removeClass('e');

    $('a', Player.title).prop('href', '//osu.ppy.sh/b/' + id).text('-');
    Player.audio.src = 'a/' + id;
    // var DLOPT = JSON.parse(decodeURIComponent((document.cookie.match(/\s?DLOPT=(.+?);/) || [])[1] || '{"bg":null}'));
    // if (!DLOPT.bg || DLOPT.bg == 'image')
    // {
    //     Player.container.css('background-image', 'url(' + (DLOPT.bg ? '_data/backgrounds/' + DLOPT.image : 'i/' + id) + ')');
    // }
    // else
    // {
    //     Player.container.css('background-color', DLOPT.color);
    // }
    $.get('b/' + id).done(function(osu) {
        try
        {
            // Player.beatmap = new Beatmap();
            // Player.beatmap.parse(osu);
            Player.beatmap = Beatmap.parse(osu);
            $('a', Player.title).text(Player.beatmap.toString());
            $(new Image()).on('load', function() {
                Player.beatmap.makeBG(this);
            }).prop('src', 'i/' + id);
            Player.button.addClass('e');
            Player.play();
        }
        catch (e)
        {
            alert(e);
            throw e;
        }
    });
};
Player.play = function()
{
    Player.ctx.save();
    Player.ctx.setTransform(1, 0, 0, 1, 0, 0);
    Player.ctx.clearRect(0, 0, Player.width(), Player.height());
    Player.ctx.restore();
    Player.beatmap.draw(Player.audio.currentTime * 1000);
    if (!Player.audio.paused)
    {
        requestAnimationFrame(Player.play);
    }
};

Player.toggle = 3000;


$(window).on('resize', function() {
    var w = this.innerWidth,
        h = this.innerHeight;
    if (w * 3 > h * 4)
    {
        Player.css('transform', 'scale(' + h / Player.height() + ')')
              .container.width(h / 3 * 4).height(h);
    }
    else
    {
        Player.css('transform', 'scale(' + w / Player.width() + ')')
              .container.width(w).height(w / 4 * 3);
    }
}).trigger('resize').on('hashchange', function() {
    Player.loadBeatmap(this.location.hash.slice(1));
}).trigger('hashchange');
Player.body.on('mousemove', function() {
    clearTimeout(Player.body.data('h'));
    Player.body.addClass('h').data('h', setTimeout(function() {
        if (!Player.audio.paused)
        {
            Player.body.removeClass('h');
        }
    }, Player.toggle));
});
$(Player.audio).on('pause', function() {
    Player.body.trigger('mousemove');
    if (typeof Player.beatmap !== 'undefined')
    {
        Player.button.addClass('e');
    }
}).on('durationchange', function() {
    Player.progress.val(0).prop('max', Player.audio.duration);
    Player.volume.trigger('change');
    $('.e', Player.speed).trigger('click');
}).on('play', function() {
    Player.button.removeClass('e');
    Player.beatmap.tmp = {};
    Player.play();
}).on('timeupdate', function() {
    Player.progress.val(Player.audio.currentTime);
});
Player.progress.on('change', function() {
    Player.audio.currentTime = Player.progress.val();
    Player.beatmap.tmp = {};
    if (Player.audio.paused)
    {
        Player.play();
    }
});
Player.volume.on('change', function() {
    Player.audio.volume = Player.volume.val() / 100;
});
$('button', Player.speed).on('click', function() {
    $('.e', Player.speed).removeClass('e');
    Player.audio.playbackRate = $(this).addClass('e').val();
});
$('#mania button').on('click', function()
{
    var val = $(this).val() | 0;
    if (val)
    {
        Player.beatmap.scrollSpeed += val;
        $('#mania #scroll').text(Player.beatmap.scrollSpeed);
        if (Player.audio.paused)
        {
            Player.play();
        }
    }
});
Player.button.on('click', function(e) {
    e.preventDefault();
    if (Player.button.hasClass('e'))
    {
        Player.audio.play();
    }
    else
    {
        Player.audio.pause();
    }
});
$('#share').on('click', function(e) {
    e.preventDefault();
    Player.audio.pause();
    var canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(Player.background, 0, 0, Player.background.width, Player.background.height, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(Player[0], 0, 0, Player.width(), Player.height(), 0, 0, canvas.width, canvas.height);
    var logo = document.querySelector('img');
    ctx.fillRect(0, 0, canvas.width, 40);
    ctx.drawImage(logo, 0, 0, logo.clientWidth, logo.clientHeight, 10, 5, logo.clientWidth, logo.clientHeight);
    var title = $('a', Player.title).text();
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Malgun Gothic"';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 40, 20);
    ctx.beginPath();
    var playWidth = 160;
    var playHeight = 200;
    ctx.fillStyle = 'rgba(255, 255, 255, .6)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#000';
    var sx = (canvas.width - playWidth) / 2;
    var sy = (canvas.height - playHeight) / 2;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + playWidth, sy + playHeight / 2);
    ctx.lineTo(sx, sy + playHeight);
    ctx.fill();
    $('#sharePrompt').html([
            '코드를 붙여넣어 이 미리보기를 공유하세요~',
            '<p><code>&lt;iframe&gt;</code>을 쓸 수 있는 경우',
                '<input type="text" value="$1" readonly>',
            '<p><code>&lt;img&gt;</code>을 쓸 수 있는 경우',
                '<input type="text" value="$2" readonly>',
            '<p>아무 것도 못 쓰면 주소 공유로~',
                '<input type="text" value="$3" readonly>',
            // '<p>스크린샷.jpg',
            //     '<input type="text" value="$4 readonly>',
        ].join('')
        .replace(/\$1/g, '<iframe src="$1" width="640" height="480"></iframe>'.replace(/"/g, '&quot;'))
        .replace(/\$3/g, '$1').replace(/\$4/g, '$3')
        .replace(/\$2/g, '<a href="$1" title="$2"><img src="$3" width="640" height="480"></a>'.replace(/"/g, '&quot;'))
        .replace(/\$1/g, location.href.replace(/^http:/, 'https:'))
        .replace(/\$2/g, 'osu! 비트맵 미러에서 ' + title.replace(/"/g, '&quot;') + ' 미리보기')
        .replace(/\$3/g, canvas.toDataURL('image/jpeg', 0.6)))
    .prepend($('<button>').html('&#10005;').on('click', function() {$('#sharePrompt').hide()}))
    .show();
});
$('#fullscreen').on('click', function(e) {
    e.preventDefault();
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
});