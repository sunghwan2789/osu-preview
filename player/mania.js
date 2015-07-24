function Mania()
{
    this.hitObjectTypes = Mania.hitObjectTypes;
    this.processHitObject = Mania.processHitObject;

    this.keyCount = this.CircleSize;
    this.columnSize = Beatmap.MAX_X / this.keyCount;
    this.columnWidth = 30;
    this.basePosition = {
        x: 130,
        y: 403
    };
    this.baseColors = [
        '#5bf',
        '#ccc',
        '#da2',
        '#568'
    ];
    this.scrollVelocity = 10;

    this.draw = Mania.draw;
    this.processBG = Mania.processBG;
}
Mania.id = 3;
Mania.hitObjectTypes = {};
Beatmap.modes[Mania.id] = Mania;
//Mania.prototype = Object.create(Beatmap.prototype);
//Mania.prototype.costructor = Mania;
Mania.processHitObject = function(hitObject)
{
    if (typeof this.current.colored === 'undefined')
    {
        for (var i = 0; i < this.keyCount; i++)
        {
            this.Colors[i] = this.baseColors[i % 2];
        }
        var p = this.keyCount / 2;
        if (p != ~~p)
        {
            this.Colors[~~p] = this.baseColors[2];
        }
        else
        {
            this.Colors = this.Colors.slice(0, p).concat(this.Colors.slice(p - 1));
        }
        this.current.colored = 1;
    }
    hitObject.x = this.basePosition.x + this.columnWidth * hitObject.column;
    hitObject.color = this.Colors[hitObject.column];
};
Mania.draw = function(time)
{
    if (typeof this.current.last === 'undefined')
    {
        this.current.first = 0;
        this.current.last = -1;
        this.current.pending = undefined;
        Player.ctx.shadowBlur = 0;
        Player.ctx.globalAlpha = 1;
        Player.ctx.lineCap = 'butt';
        Player.ctx.lineJoin = 'miter';
    }
    while (this.current.last + 1 < this.HitObjects.length &&
        time >= this.HitObjects[this.current.last + 1].time - 5)
    {
        this.current.last++;
    }
    for (var i = this.current.first; i <= this.current.last; i++)
    {
        var hitObject = this.HitObjects[i];
        if (typeof hitObject.endTime !== 'undefined' &&
            typeof this.current.pending === 'undefined')
        {
            this.current.pending = {
                endTime: hitObject.endTime,
                idx: i
            };
        }
        if (time > (hitObject.endTime || hitObject.time))
        {
            this.current.first = i + 1;
            continue;
        }

        hitObject.draw(time);
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
    Player.ctx.clearRect(this.basePosition.x, this.basePosition.y, Player.w, Player.h);
};
Mania.processBG = function(ctx)
{
    var ey = Beatmap.HEIGHT;

    ctx.beginPath();
    ctx.rect(this.basePosition.x, 0, this.columnWidth * this.keyCount, ey);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fill();

    for (var i = 0; i < this.keyCount; i++)
    {
        var x = this.basePosition.x + this.columnWidth * i;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ey);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(x, this.basePosition.y, this.columnWidth, ey - this.basePosition.y);
        ctx.fillStyle = this.Colors[i];
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    var x = this.basePosition.x + this.columnWidth * this.keyCount;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ey);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.rect(this.basePosition.x, this.basePosition.y, this.columnWidth * this.keyCount, 10);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = this.baseColors[3];
    ctx.fill();

    ctx.fillStyle = '#09f';
    ctx.font = '26px Arial';
    ctx.textBaseline = 'top';
    ctx.fillText('WIP(Help me...)', 5, 60);
};