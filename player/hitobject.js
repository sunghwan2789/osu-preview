function HitObject(line)
{
    this.x = undefined;
    this.y = undefined;
    this.time = 0;
    this.flag = undefined;
    //this.sound = 0;

    this.parse(line);
}
HitObject.prototype = {
    type: undefined,
    draw: undefined
};
HitObject.prototype.parse = function(line)
{
    var data = line.split(',');
    if (data.length < 5)
    {
        return;
    }

    this.x = data[0] | 0;
    this.y = data[1] | 0;
    this.time = data[2] / 1000;
    this.flag = data[3] | 0;

    this.getType().call(this, data.slice(5));
};
HitObject.prototype.getType = function()
{
    var type = this.flag & Player.beatmap.hitObjectTypeMask;
    return Player.beatmap.hitObjectTypes.filter(function(i) {
        return i.id === type;
    })[0];
};