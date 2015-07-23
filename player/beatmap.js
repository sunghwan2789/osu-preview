function Beatmap(osu)
{
    // for temporary vars that need for drawing
    this.current = {};

    // [General]
    this.Mode = 0;
    this.StackLeniency = 0.7;
    this.WidescreenStoryboard = 0;

    // [Metadata]
    this.Title = '';
    this.TitleUnicode = undefined;
    this.Artist = '';
    this.ArtistUnicode = undefined;
    this.Creator = '';
    this.Version = 'Normal';

    // [Difficulty]
    this.HPDrainRate = 5;
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
    hitObjectTypeMask: 0,
    processHitObject: undefined,
    draw: undefined,
    processBG: undefined
};
Beatmap.MAX_X = 512;
Beatmap.MAX_Y = 384;
Beatmap.prototype.parse = function(osu)
{
    if (!/^osu/.test(osu))
    {
        throw 'target is not a beatmap file';
    }

    var currentSection = undefined,
        data = osu.replace(/\r\n?/g, '\n').split('\n').reverse(),
        line = undefined;
    while (typeof (line = data.pop()) !== 'undefined')
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
                this.parsePair(line);
                break;
            }
            case 'TimingPoints':
            {
                this.parseTimingPoint(line);
                break;
            }
            case 'Colours':
            {
                this.parseColor(line);
                break;
            }
            case 'HitObjects':
            {
                this.parseHitObject(line);
                break;
            }
        }
    }
};
Beatmap.prototype.parsePair = function(line)
{
    var data = line.split(':'),
        key = data[0],
        value = data.slice(1).join(':');
    if (key in this)
    {
        this[key] = parseFloat(value) == value ? +value : value;
    }
};
Beatmap.prototype.parseTimingPoint = function(line)
{
    var timingPoint = new TimingPoint(line);
    if (typeof timingPoint.time !== 'undefined')
    {
        this.TimingPoints.push(timingPoint);
    }
};
Beatmap.prototype.parseColor = function(line)
{
    var data = line.split(':');
    if (typeof data[1] !== 'undefined' &&
        /Combo\d+/.test(data[0]))
    {
        this.Colors.push('rgb(' + data[1] + ')');
    }
};
Beatmap.prototype.parseHitObject = function(line)
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
        this.hitObjectTypeMask = Object.keys(this.hitObjectTypes).reduce(function(a, b)
        {
            return a | b;
        });
    }
    var hitObject = new HitObject(line);
    if (typeof hitObject.type !== 'undefined')
    {
        if (typeof this.processHitObject !== 'undefined')
        {
            this.processHitObject(hitObject);
        }
        this.HitObjects.push(hitObject);
    }
};
Beatmap.prototype.getTimingPoint = function(time)
{
    // var begin = 0,
    //     end = this.TimingPoints.length,
    //     mid = 0;
    // while (begin <= end)
    // {
    //     mid = (begin + end) / 2 | 0;
    //     if (time >= this.TimingPoints[mid].time)
    //     {
    //         if (mid + 1 == end || time < this.TimingPoints[mid + 1].time)
    //         {
    //             return this.TimingPoints[mid];
    //         }
    //         begin = mid + 1;
    //     }
    //     else
    //     {
    //         end = mid - 1;
    //     }
    // }
    // return this.TimingPoints[mid];
    if (typeof this.current.timingPointIndex === 'undefined')
    {
        this.current.timingPointIndex = 0;
    }
    while (this.current.timingPointIndex + 1 < this.TimingPoints.length &&
        time >= this.TimingPoints[this.current.timingPointIndex + 1].time)
    {
        this.current.timingPointIndex++;
    }
    return this.TimingPoints[this.current.timingPointIndex];
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
    img.remove();

    if (typeof this.processBG !== 'undefined')
    {
        this.processBG(ctx);
    }
    Player.container.css('background-image', 'url(' + canvas.toDataURL('image/png') + ')');
};