function Beatmap(osu)
{
    // for temporary vars that need for drawing
    this.current = {};

    // [General]
    this.Mode = 0;
    this.StackLeniency = 0.7;

    // [Metadata]
    this.Title = '';
    this.TitleUnicode = undefined;
    this.Artist = '';
    this.ArtistUnicode = undefined;
    this.Creator = '';
    this.Version = 'Normal';

    // [Difficulty]
    this.CircleSize = 4;
    this.OverallDifficulty = 5;
    this.ApproachRate = undefined;
    this.SliderMultiplier = 1;

    // [TimingPoints]
    this.TimingPoints = [];

    // [Colours]
    this.Colors = [];

    // [HitObjects]
    this.HitObjects = [];
}
Beatmap.modes = {};
Beatmap.prototype = {
    hitObjectTypes: undefined,
    processHitObject: undefined,
    onload: undefined,
    draw: undefined,
    processBG: undefined
};
Beatmap.WIDTH = 640;
Beatmap.HEIGHT = 480;
Beatmap.MAX_X = 512;
Beatmap.MAX_Y = 384;
Beatmap.prototype.parse = function(osu)
{
    if (!/^osu/.test(osu))
    {
        throw 'target is not a beatmap file';
    }

    var currentSection = undefined,
        stream = osu.replace(/\r\n?/g, '\n').split('\n').reverse(),
        line = undefined;
    while (typeof (line = stream.pop()) !== 'undefined')
    {
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
                var data = line.split(':', 2),
                    key = data[0],
                    value = data[1];
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
                    this.TimingPoints.push(new TimingPoint(line));
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
                if (typeof this.hitObjectTypes === 'undefined')
                {
                    var mode = Beatmap.modes[this.Mode];
                    // **********************************************
                    if (typeof mode === 'undefined')
                    {
                        throw 'we do not support this beatmap mode';
                    }
                    // **********************************************
                    mode.call(this);
                }
                try
                {
                    var hitObject = new HitObject(line);
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
    if (typeof this.onload !== 'undefined')
    {
        this.onload();
    }
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