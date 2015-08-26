function HoldNote(data)
{
    HitNote.call(this, data);

    this.endTime = data[5].split(':')[0] | 0;
}
HoldNote.prototype = Object.create(HitNote.prototype);
HoldNote.prototype.constructor = HoldNote;
HoldNote.id = 128;
Mania.prototype.hitObjectTypes[HoldNote.id] = HoldNote;
HoldNote.prototype.draw = function(scroll)
{
    var sy = this.calcY(this.y, scroll),
        ey = this.calcY(this.endY, scroll);

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