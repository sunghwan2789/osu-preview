function Mania(osu)
{
    Beatmap.call(this, osu);


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
    var currentIdx = this.timingPointIndexAt(0),
        current = this.TimingPoints[currentIdx],
        base = this.TimingPoints[0],
        scrollVelocity = base.beatLength / current.beatLength;
    this.scrollAtTimingPointIndex[currentIdx] = current.time * scrollVelocity;
    while (++currentIdx < this.TimingPoints.length)
    {
        var next = this.TimingPoints[currentIdx];
        this.scrollAtTimingPointIndex[currentIdx] = (next.time - current.time) * scrollVelocity +
            this.scrollAtTimingPointIndex[currentIdx - 1];
        current = next;
        scrollVelocity = base.beatLength / current.beatLength;
    }


    for (var i = 0; i < this.HitObjects.length; i++)
    {
        var hitObject = this.HitObjects[i];
        hitObject.color = this.Colors[hitObject.column];
        hitObject.position.x = Mania.COLUMN_WIDTH * hitObject.column;
        hitObject.position.y = this.scrollAt(hitObject.time);
        hitObject.endPosition.y = this.scrollAt(hitObject.endTime);
    }
}
Mania.prototype = Object.create(Beatmap.prototype);
Mania.prototype.costructor = Mania;
Mania.prototype.hitObjectTypes = {};
Mania.ID = 3;
Beatmap.modes[Mania.ID] = Mania;
Mania.DEFAULT_COLORS = [
    '#5bf',
    '#ccc',
    '#da2'
];
Mania.COLUMN_START = 130;
Mania.HIT_POSITION = 400;
Mania.COLUMN_WIDTH = 30;
Mania.SCROLL_SPEED = 20; // TODO: remember speed changes
Object.defineProperties(Mania.prototype, {
    keyCount: {
        get: function()
        {
            return this.CircleSize;
        }
    },
    columnSize: {
        get: function()
        {
            return Beatmap.MAX_X / this.keyCount;
        }
    }
});
Mania.prototype.scrollAt = function(time)
{
    var currentIdx = this.timingPointIndexAt(time),
        current = this.TimingPoints[currentIdx],
        base = this.TimingPoints[0],
        scrollVelocity = base.beatLength / current.beatLength;
    return (time - current.time) * scrollVelocity + this.scrollAtTimingPointIndex[currentIdx];
};
Mania.prototype.calcY = function(y, scroll)
{
    return Mania.HIT_POSITION - (y - scroll) * this.scrollSpeed * 0.035;
};
Mania.prototype.update = function(ctx)
{
    ctx.translate(Mania.COLUMN_START, 0);
};
Mania.prototype.draw = function(time, ctx)
{
    if (typeof this.tmp.first == 'undefined')
    {
        this.tmp.first = 0;
        this.tmp.last = -1;
    }

    var scroll = this.scrollAt(time);
    while (this.tmp.first < this.HitObjects.length &&
        time > this.HitObjects[this.tmp.first].endTime)
    {
        this.tmp.first++;
    }
    while (this.tmp.last + 1 < this.HitObjects.length)
    {
        var hitObject = this.HitObjects[this.tmp.last + 1];
        if (this.calcY(hitObject.position.y, scroll) < -Mania.COLUMN_WIDTH)
        {
            break;
        }
        this.tmp.last++;
    }
    var barlines = [];
    for (var i = this.timingPointIndexAt(time); i < this.TimingPoints.length; i++)
    {
        var current = this.TimingPoints[i],
            base = current.parent || current,
            barLength = base.beatLength * base.meter,
            n = -(time - base.time) / barLength | 0,
            barTime = base.time + barLength * n,
            barline = this.scrollAt(barTime);
        for (var j = barlines.length - 1; barlines[j] >= barline; j--)
        {
            barlines.pop();
        }
        while (this.calcY(barline, scroll) > -Mania.COLUMN_WIDTH)
        {
            if (barline > scroll)
            {
                barlines.push(barline);
            }
            barTime += barLength;
            barline = this.scrollAt(barTime);
        }
    }
    while (barlines.length > 0)
    {
        var barline = this.calcY(barlines.pop(), scroll);
        ctx.beginPath();
        ctx.moveTo(0, barline);
        ctx.lineTo(Mania.COLUMN_WIDTH * this.keyCount, barline);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    for (var i = this.tmp.first; i <= this.tmp.last; i++)
    {
        var hitObject = this.HitObjects[i];
        if (time > hitObject.endTime)
        {
            continue;
        }
        hitObject.draw(scroll, ctx);
    }
    ctx.clearRect(0, Mania.HIT_POSITION, Beatmap.WIDTH, Beatmap.HEIGHT - Mania.HIT_POSITION);
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
        ctx.lineTo(x, Mania.HIT_POSITION);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(x, Mania.HIT_POSITION, Mania.COLUMN_WIDTH, Beatmap.HEIGHT - Mania.HIT_POSITION);
        ctx.fillStyle = this.Colors[i];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    var x = Mania.COLUMN_START + Mania.COLUMN_WIDTH * this.keyCount;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, Mania.HIT_POSITION);
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
