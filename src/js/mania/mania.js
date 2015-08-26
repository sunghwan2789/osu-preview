function Mania()
{
    this.hitObjectTypes = Mania.hitObjectTypes;
    this.processHitObject = Mania.processHitObject;

    this.keyCount = this.CircleSize;
    this.columnSize = Beatmap.MAX_X / this.keyCount;
    this.columnWidth = 30;
    this.scrollSpeed = 20;

    this.onload = Mania.onload;
    this.draw = Mania.draw;
    this.processBG = Mania.processBG;
}
Mania.id = 3;
Mania.hitObjectTypes = {};
Beatmap.modes[Mania.id] = Mania;
//Mania.prototype = Object.create(Beatmap.prototype);
//Mania.prototype.costructor = Mania;
Mania.DEFAULT_COLORS = [
    '#5bf',
    '#ccc',
    '#da2'
];
Mania.COLUMN_START = 130;
Mania.HIT_POSITION = 400;
Mania.processHitObject = function(hitObject)
{
    if (typeof this.current.colored === 'undefined')
    {
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
        this.current.colored = 1;
    }
    hitObject.color = this.Colors[hitObject.column];
    hitObject.x = this.columnWidth * hitObject.column;
    var base = this.timingPointIndexAt(0);
    hitObject.y = this.TimingPoints[base].time * this.TimingPoints[base].sliderVelocity;
    for (var i = base + 1; i <= this.timingPointIndexAt(hitObject.time); i++)
    {
        var current = this.TimingPoints[i],
            prev = this.TimingPoints[i - 1];
        hitObject.y += (current.time - prev.time) * prev.sliderVelocity;
    }
    var current = this.timingPointAt(hitObject.time);
    hitObject.endY = hitObject.y;
    hitObject.y += (hitObject.time - current.time) * current.sliderVelocity;

    for (var i = this.timingPointIndexAt(hitObject.time) + 1; i <= this.timingPointIndexAt(hitObject.endTime); i++)
    {
        var current = this.TimingPoints[i],
            prev = this.TimingPoints[i - 1];
        hitObject.endY += (current.time - prev.time) * prev.sliderVelocity;
    }
    var current = this.timingPointAt(hitObject.endTime);
    hitObject.endY += (hitObject.endTime - current.time) * current.sliderVelocity;
};
Mania.onload = function()
{
    Player.ctx.translate(Mania.COLUMN_START, 0);

    $('#mania').addClass('e');
    $('#scroll').text(this.scrollSpeed);
};
Mania.draw = function(time)
{
    if (typeof this.current.first === 'undefined')
    {
        this.current.first = 0;
        this.current.last = -1;
        this.current.pending = undefined;
        var base = this.timingPointIndexAt(0);
        this.current.timingPointIndex = base + 1;
        this.current.scroll = this.TimingPoints[base].time * this.TimingPoints[base].sliderVelocity;
    }
    var timingPointIndex = this.timingPointIndexAt(time);
    for (; this.current.timingPointIndex <= timingPointIndex; this.current.timingPointIndex++)
    {
        var current = this.TimingPoints[this.current.timingPointIndex],
            prev = this.TimingPoints[this.current.timingPointIndex - 1];
        this.current.scroll += (current.time - prev.time) * prev.sliderVelocity;
    }
    var current = this.TimingPoints[timingPointIndex];
    var scroll = this.current.scroll + (time - current.time) * current.sliderVelocity;

    while (this.current.last + 1 < this.HitObjects.length &&
        time >= this.HitObjects[this.current.last + 1].time - 20000)
    {
        this.current.last++;
    }
    for (var i = this.current.first; i <= this.current.last; i++)
    {
        var hitObject = this.HitObjects[i];
        if (hitObject.type.id == HoldNote.id &&
            typeof this.current.pending === 'undefined')
        {
            this.current.pending = {
                endTime: hitObject.endTime,
                idx: i
            };
        }
        if (time > hitObject.endTime)
        {
            this.current.first = i + 1;
            continue;
        }

        hitObject.draw(scroll);
    }
    if (typeof this.current.pending !== 'undefined')
    {
        if (this.current.first > this.current.pending.idx)
        {
            this.current.first = this.current.pending.idx;
        }
        if (time > this.current.pending.endTime)
        {
            this.current.pending = undefined;
        }
    }
    Player.ctx.clearRect(0, Mania.HIT_POSITION, Beatmap.WIDTH, Beatmap.HEIGHT - Mania.HIT_POSITION);
};
Mania.processBG = function(ctx)
{
    ctx.beginPath();
    ctx.rect(Mania.COLUMN_START, 0, this.columnWidth * this.keyCount, Beatmap.HEIGHT);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fill();

    for (var i = 0; i < this.keyCount; i++)
    {
        var x = Mania.COLUMN_START + this.columnWidth * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, Beatmap.HEIGHT - 80);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(x, Beatmap.HEIGHT - 80, this.columnWidth, 80);
        ctx.fillStyle = this.Colors[i];
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    var x = Mania.COLUMN_START + this.columnWidth * this.keyCount;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, Beatmap.HEIGHT - 80);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    // HIT POSITION
    ctx.beginPath();
    ctx.rect(Mania.COLUMN_START, Mania.HIT_POSITION, this.columnWidth * this.keyCount, this.columnWidth / 3);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#568';
    ctx.fill();
};