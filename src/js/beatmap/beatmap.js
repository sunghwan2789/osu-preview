function Beatmap(osu)
{
    // for temporary vars that need for drawing
    this.tmp = {};

    // [General]
    this.StackLeniency = 0.7;

    // [Metadata]
    this.Title = '';
    this.TitleUnicode = undefined;
    this.Artist = '';
    this.ArtistUnicode = undefined;
    this.Creator = '';
    this.Version = 'Normal';

    // [Difficulty]
    this.CircleSize = 5;
    this.OverallDifficulty = 5;
    this.ApproachRate = undefined;
    this.SliderMultiplier = 1.4;

    // [TimingPoints]
    this.TimingPoints = [];

    // [Colours]
    this.Colors = [];

    // [HitObjects]
    this.HitObjects = [];


    var stream = osu.replace(/\r\n?/g, '\n').split('\n').reverse(),
        currentSection = undefined,
        line = undefined,
        init = undefined;
    while (typeof (line = stream.pop()) !== 'undefined')
    {
        // skip comments
        if (/^\/\//.test(line))
        {
            continue;
        }

        if (/^\[/.test(line))
        {
            currentSection = line.slice(1, line.indexOf(']'));
            continue;
        }

        switch (currentSection)
        {
            case 'General':
            case 'Metadata':
            case 'Difficulty':
            {
                // let [key, value] = line.split(':', 2);
                var data = line.split(':'),
                    key = data.shift(),
                    value = data.join(':');
                if (key in this)
                {
                    this[key] = parseFloat(value) == value ? +value : value;
                }
                break;
            }
            case 'TimingPoints':
            {
                try
                {
                    this.TimingPoints.push(new TimingPoint(line, this));
                }
                catch (e) {}
                break;
            }
            case 'Colours':
            {
                // let [key, value] = line.split(':');
                var data = line.split(':');
                if (/^Combo\d+/.test(data[0]))
                {
                    this.Colors.push('rgb(' + data[1] + ')');
                }
                break;
            }
            case 'HitObjects':
            {
                if (typeof init === 'undefined')
                {
                    if (typeof this.initialize !== 'undefined')
                    {
                        this.initialize();
                    }
                    init = 1;
                }
                try
                {
                    var hitObject = HitObject.parse(line, this);
                    if (typeof this.processHitObject !== 'undefined')
                    {
                        this.processHitObject(hitObject);
                    }
                    this.HitObjects.push(hitObject);
                }
                catch (e) {}
                break;
            }
        }
    }
    if (typeof init === 'undefined' &&
        typeof this.initialize !== 'undefined')
    {
        this.initialize();
    }
}
Beatmap.prototype = {
    hitObjectTypes: undefined,
    initialize: undefined,
    processHitObject: undefined,
    draw: undefined,
    processBG: undefined
};
Beatmap.WIDTH = 640;
Beatmap.HEIGHT = 480;
Beatmap.MAX_X = 512;
Beatmap.MAX_Y = 384;
Beatmap.modes = {};
Beatmap.parse = function(osu)
{
    if (!/^osu/.test(osu))
    {
        throw 'target is not a beatmap file';
    }

    // default mode is standard(id: 0)
    var mode = +((osu.match(/[\r\n]Mode.*?:(.*?)[\r\n]/) || [])[1]) || 0;
    if (!(mode in Beatmap.modes))
    {
        throw 'we do not support this beatmap mode';
    }

    return new Beatmap.modes[mode](osu);
};
Beatmap.prototype.timingPointIndexAt = function(time)
{
    var begin = 0,
        end = this.TimingPoints.length - 1;
    while (begin <= end)
    {
        var mid = (begin + end) / 2 | 0;
        if (time >= this.TimingPoints[mid].time)
        {
            if (mid + 1 == this.TimingPoints.length ||
                time < this.TimingPoints[mid + 1].time)
            {
                return mid;
            }
            begin = mid + 1;
        }
        else
        {
            end = mid - 1;
        }
    }
    return 0;
};
Beatmap.prototype.timingPointAt = function(time)
{
    return this.TimingPoints[this.timingPointIndexAt(time)];
};
Beatmap.prototype.toString = function()
{
    var unicode = JSON.parse(localStorage['osu_tool'] || '{"unicode":false}')['unicode'];
    return [
        (unicode ?
            [
                this.ArtistUnicode || this.Artist,
                this.TitleUnicode || this.Title
            ] :
            [
                this.Artist,
                this.Title
            ]
        ).join(' - '),
        ' (', this.Creator, ')',
        ' [', this.Version || 'Normal' , ']'
    ].join('');
};
Beatmap.prototype.makeBG = function(img)
{
    var canvas = Player.background,
        ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
        // TODO osu! 비트맵 설정으로 하던 거 이어서...
        var aw = img.height * 4 / 3;
        ctx.drawImage(img, (img.width - aw) / 2, 0, aw, img.height, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, .4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (typeof this.processBG !== 'undefined')
    {
        this.processBG(ctx);
    }
    Player.container.css('background-image', 'url(' + canvas.toDataURL('image/png') + ')');
};
