function HoldNote(data)
{
    this.column = 0;

    this.endTime = this.time;

    //if (this instanceof HoldNote)
    //{
    //    this.parse(data);
    //}
    //else
    //{
    //    HoldNote.prototype.parse.call(this, data);
    //}
    HoldNote.parse.call(this, data);

    this.draw = HoldNote.draw;
}
HoldNote.id = 128;
Mania.hitObjectTypes[HoldNote.id] = HoldNote;
//HoldNote.prototype = Object.create(HitObject.prototype);
//HoldNote.prototype.constructor = HoldNote;
HoldNote.parse = function(data)
{
    HitNote.parse.call(this);

    this.endTime = data[0].split(':')[0] / 1000;
};
HoldNote.draw = function(time)
{
    var sy = HitNote.calcY.call(this, time),
        ey = HitNote.calcY.call(this, time, this.endTime);

    var w = Player.beatmap.columnWidth * 0.8;
    Player.ctx.beginPath();
    Player.ctx.rect(this.x + (Player.beatmap.columnWidth - w) / 2, ey, w, sy - ey);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();

    Player.ctx.beginPath();
    Player.ctx.rect(this.x, sy, Player.beatmap.columnWidth, Player.getLength(10));
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();


    Player.ctx.beginPath();
    Player.ctx.rect(this.x, ey, Player.beatmap.columnWidth, Player.getLength(10));
    Player.ctx.fill();
    Player.ctx.stroke();
};