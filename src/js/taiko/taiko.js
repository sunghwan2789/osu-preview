function Taiko(osu)
{
    Scroll.call(this, osu);

    for (var i = 0; i < this.HitObjects.length; i++)
    {
        var hitObject = this.HitObjects[i];
    }
}
Taiko.prototype = Object.create(Scroll.prototype, {

});
Taiko.prototype.constructor = Taiko;
Taiko.prototype.hitObjectTypes = {};
Taiko.ID = 1;
Beatmap.modes[Taiko.ID] = Taiko;
Taiko.DEFAULT_COLORS = [
    '#eb452c',
    '#438eac',
    '#fcb806'
];
Taiko.DIAMETER = 56;
Taiko.prototype.calcX = function(x, scroll)
{
    return (x - scroll) * 20 * 0.025;
};
Taiko.prototype.update = function(ctx)
{
    ctx.shadowColor = '#666';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(160, 200);
};
Taiko.prototype.draw = function(time, ctx)
{
    if (typeof this.tmp.first == 'undefined')
    {
        this.tmp.first = 0;
        this.tmp.last = -1;
        this.tmp.barLine = 0;
    }

    var scroll = this.scrollAt(time);
    while (this.tmp.barLine < this.barLines.length &&
        this.calcX(this.barLines[this.tmp.barLine], scroll) < -Taiko.DIAMETER)
    {
        this.tmp.barLine++;
    }
    for (var i = this.tmp.barLine; i < this.barLines.length && this.calcX(this.barLines[i], scroll) < Beatmap.WIDTH; i++)
    {
        var barLine = this.calcX(this.barLines[i], scroll);
        ctx.beginPath();
        ctx.moveTo(barLine, -Taiko.DIAMETER);
        ctx.lineTo(barLine, Taiko.DIAMETER);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
};
Taiko.prototype.processBG = function(ctx)
{
    var offset = 200 - Taiko.DIAMETER;
    ctx.drawImage(ctx.canvas, 0, offset, ctx.canvas.width, ctx.canvas.height);

    ctx.beginPath();
    ctx.rect(0, 0, Beatmap.WIDTH, offset);
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(0, offset, Beatmap.WIDTH, Taiko.DIAMETER * 2);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(0, offset, Taiko.DIAMETER * 2, Taiko.DIAMETER * 2);
    ctx.fillStyle = '#ff0080';
    ctx.fill();
};
