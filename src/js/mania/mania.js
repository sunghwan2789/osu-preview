function Mania(osu)
{
    Beatmap.call(this, osu);
}
Mania.prototype = Object.create(Beatmap.prototype);
Mania.prototype.costructor = Mania;
Mania.prototype.hitObjectTypes = {};
Mania.id = 3;
Beatmap.modes[Mania.id] = Mania;
Mania.DEFAULT_COLORS = [
    '#5bf',
    '#ccc',
    '#da2'
];
Mania.COLUMN_START = 130;
Mania.HIT_POSITION = 400;
Mania.COLUMN_WIDTH = 30;
Mania.SCROLL_SPEED = 20; // TODO: remember speed changes
Mania.prototype.initialize = function()
{
    // if (typeof HoldNote === 'undefined')
    // {
    //     HoldNote = function() {};
    // }

    this.keyCount = this.CircleSize;
    this.columnSize = Beatmap.MAX_X / this.keyCount;
    this.scrollSpeed = Mania.SCROLL_SPEED;

    for (var i = 0; i < this.keyCount; i++)
    {
        this.Colors[i] = Mania.DEFAULT_COLORS[i % 2];
    }
    var p = this.keyCount / 2;
    if (this.keyCount % 2)
    {
        this.Colors[p | 0] = Mania.DEFAULT_COLORS[2];
    }
    else
    {
        this.Colors = this.Colors.slice(0, p).concat(this.Colors.slice(p - 1));
    }

    // dp for numerous call to this.scrollAt
    this.scrollAtTimingPointIndex = [];
    var baseIdx = this.timingPointIndexAt(0),
        base = this.TimingPoints[baseIdx];
    this.scrollAtTimingPointIndex[baseIdx] = base.time * base.sliderVelocity;
    while (++baseIdx < this.TimingPoints.length)
    {
        var next = this.TimingPoints[baseIdx];
        this.scrollAtTimingPointIndex[baseIdx] =
            this.scrollAtTimingPointIndex[baseIdx - 1] +
            (next.time - base.time) * base.sliderVelocity;
        base = next;
    }
};
Mania.prototype.scrollAt = function(time)
{
    var baseIdx = this.timingPointIndexAt(time),
        base = this.TimingPoints[baseIdx];
    return this.scrollAtTimingPointIndex[baseIdx] + (time - base.time) * base.sliderVelocity;
};
Mania.prototype.processHitObject = function(hitObject)
{
    hitObject.color = this.Colors[hitObject.column];
    hitObject.position.x = Mania.COLUMN_WIDTH * hitObject.column;
    hitObject.position.y = this.scrollAt(hitObject.time);
    hitObject.endPosition.y = this.scrollAt(hitObject.endTime);
};
Mania.prototype.onload = function()
{
    Player.ctx.translate(Mania.COLUMN_START, 0);

    $('#mania').addClass('e');
    $('#scroll').text(this.scrollSpeed);
};
Mania.prototype.draw = function(time)
{
    if (typeof this.tmp.first === 'undefined')
    {
        this.tmp.first = 0;
        this.tmp.last = -1;
        this.tmp.pending = undefined;
    }
    var scroll = this.scrollAt(time);
    while (this.tmp.last + 1 < this.HitObjects.length)
    {
        var hitObject = this.HitObjects[this.tmp.last + 1];
        if (hitObject.calcY(hitObject.position.y, scroll) < -Mania.COLUMN_WIDTH)
        {
            break;
        }
        this.tmp.last++;
    }
    for (var i = this.tmp.first; i <= this.tmp.last; i++)
    {
        var hitObject = this.HitObjects[i];
        if (time > hitObject.endTime)
        {
            this.tmp.first = i + 1;
            continue;
        }
        else if (hitObject instanceof HoldNote &&
            typeof this.tmp.pending === 'undefined')
        {
            this.tmp.pending = i;
        }

        hitObject.draw(scroll);
    }
    if (typeof this.tmp.pending !== 'undefined')
    {
        if (this.tmp.first > this.tmp.pending)
        {
            this.tmp.first = this.tmp.pending;
        }
        this.tmp.pending = undefined;
    }
    Player.ctx.clearRect(0, Mania.HIT_POSITION, Beatmap.WIDTH, Beatmap.HEIGHT - Mania.HIT_POSITION);
};
Mania.prototype.processBG = function(ctx)
{
    ctx.beginPath();
    ctx.rect(Mania.COLUMN_START, 0, Mania.COLUMN_WIDTH * this.keyCount, Beatmap.HEIGHT);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fill();

    for (var i = 0; i < this.keyCount; i++)
    {
        var x = Mania.COLUMN_START + Mania.COLUMN_WIDTH * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, Beatmap.HEIGHT - 80);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(x, Beatmap.HEIGHT - 80, Mania.COLUMN_WIDTH, 80);
        ctx.fillStyle = this.Colors[i];
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    var x = Mania.COLUMN_START + Mania.COLUMN_WIDTH * this.keyCount;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, Beatmap.HEIGHT - 80);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    // HIT POSITION
    ctx.beginPath();
    ctx.rect(Mania.COLUMN_START, Mania.HIT_POSITION, Mania.COLUMN_WIDTH * this.keyCount, Mania.COLUMN_WIDTH / 3);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#568';
    ctx.fill();
};