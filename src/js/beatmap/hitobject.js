function HitObject(data, beatmap)
{
    this.beatmap = beatmap;

    this.position = new Point(data);
    this.time = data[2] | 0;
    this.flag = data[3] | 0;
}
HitObject.prototype = {
    draw: undefined
};
HitObject.parse = function(line, beatmap)
{
    var data = line.split(',');
    if (data.length < 5)
    {
        throw 'invalid data';
    }

    if (typeof beatmap.tmp.mask === 'undefined')
    {
        beatmap.tmp.mask = Object.keys(beatmap.hitObjectTypes).reduce(function(a, b)
        {
            return a | b;
        })
    }
    var type = data[3] & beatmap.tmp.mask;
    if (!(type in beatmap.hitObjectTypes))
    {
        // throw 'we do not support this hitobject type';
        return new HitObject(data, beatmap);
    }

    return new beatmap.hitObjectTypes[type](data, beatmap);
};
