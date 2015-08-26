var Player = {};

Player.init = function(dest, settings)
{
    Player.container = dest;

    Player.playfield = document.createElement('canvas');
    for (var keys = Object.keys(settings), i = keys.length; i--;)
    {
        Player.playfield[keys[i]] = settings[i];
    }
    Player.container.appendChild(Player.playfield);

    Player.background = document.createElement('canvas');
    Player.background.width = Player.playfield.width;
    Player.background.height = Player.playfield.height;

    Player.audio = new Audio();
};

Player.changeBeatmap = function(id)
{
    if (typeof Player.xhr !== 'undefined')
    {
        Player.xhr.abort();
    }
    Player.xhr = new XMLHttpRequest();
    Player.xhr.addEventHandler('load', function(e)
    {
        Player.beatmap = new Beatmap();
        Player.beatmap.parse(Player.xhr.responseText);
        var image = new Image();
        image.addEventHandler('load', function(){

        });
    });
    Player.xhr.open('GET', 'b/' + id);
    Player.xhr.send();
};