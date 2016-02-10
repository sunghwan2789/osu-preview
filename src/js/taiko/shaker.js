function Shaker(data, beatmap)
{
    Spinner.call(this, data, beatmap);

}
Shaker.prototype = Object.create(Spinner.prototype, {});
Shaker.prototype.constructor = Shaker;
Shaker.ID = 8;
Taiko.prototype.hitObjectTypes[Shaker.ID] = Shaker;
Shaker.prototype.draw = function(time, ctx)
{

};
