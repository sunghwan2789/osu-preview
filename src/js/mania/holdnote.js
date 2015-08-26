function HoldNote(data)
{
    HitNote.call(this);

    this.endTime = data[0].split(':')[0] | 0;

    this.draw = HoldNote.draw;
}
HoldNote.id = 128;
Mania.hitObjectTypes[HoldNote.id] = HoldNote;
//HoldNote.prototype = Object.create(HitObject.prototype);
//HoldNote.prototype.constructor = HoldNote;
HoldNote.draw = function(scroll)
{
    var sy = HitNote.calcY.call(this, this.y, scroll),
        ey = HitNote.calcY.call(this, this.endY, scroll);

    var w = Player.beatmap.columnWidth * 0.8;
    Player.ctx.beginPath();
    Player.ctx.rect(this.x + (Player.beatmap.columnWidth - w) / 2, ey, w, sy - ey);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();

    Player.ctx.beginPath();
    Player.ctx.rect(this.x, sy, Player.beatmap.columnWidth, Player.beatmap.columnWidth / 3);
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();

    Player.ctx.beginPath();
    Player.ctx.rect(this.x, ey, Player.beatmap.columnWidth, Player.beatmap.columnWidth / 3);
    Player.ctx.fill();
    Player.ctx.stroke();
};