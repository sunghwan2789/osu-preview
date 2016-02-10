function Drumroll(data, beatmap)
{
    Slider.call(this, data, beatmap);

}
Drumroll.prototype = Object.create(Slider.prototype, {});
Drumroll.prototype.constructor = Drumroll;
Drumroll.ID = 2;
Taiko.prototype.hitObjectTypes[Drumroll.ID] = Drumroll;
Drumroll.prototype.draw = function(time, ctx)
{

};
