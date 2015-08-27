function HitObject(data)
{
    this.position = new Point(data);
    this.time = data[2] | 0;
    this.flag = data[3] | 0;
}
HitObject.prototype = {
    draw: undefined
};
HitObject.parse = function(line)
{
    var data = line.split(',');
    if (data.length < 5)
    {
        throw 'invalid data';
    }

    var type = data[3] & Player.beatmap.current.mask;
    if (!(type in Player.beatmap.hitObjectTypes))
    {
        // throw 'we do not support this hitobject type';
        return new HitObject(data);
    }

    return new Player.beatmap.hitObjectTypes[type](data);
};