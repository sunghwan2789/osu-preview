function HitObject(line)
{
    var data = line.split(',');
    if (data.length < 5)
    {
        return;
    }

    this.x = data[0] | 0;
    this.y = data[1] | 0;
    this.time = data[2] | 0;
    this.flag = data[3] | 0;

    var type = Player.beatmap.hitObjectTypes[this.flag & Player.beatmap.hitObjectTypeMask];
    if (typeof type !== 'undefined')
    {
        this.type = type;
        this.type.call(this, data.slice(5));
    }
}
HitObject.prototype = {
    draw: undefined
};