function HoldNote(data)
{
    HitNote.call(this, data);

    this.endTime = data[5].split(':')[0] | 0;
}
HoldNote.prototype = Object.create(HitNote.prototype);
HoldNote.prototype.constructor = HoldNote;
HoldNote.id = 128;
Mania.prototype.hitObjectTypes[HoldNote.id] = HoldNote;
HoldNote.WIDTH_SCALE = 0.8;
HoldNote.OPACITY = 0.66;
HoldNote.prototype.draw = function(scroll)
{
    var sy = Player.beatmap.calcY(this.position.y, scroll) - Mania.COLUMN_WIDTH / 3,
        ey = Player.beatmap.calcY(this.endPosition.y, scroll) - Mania.COLUMN_WIDTH / 3;

    var w = Mania.COLUMN_WIDTH * HoldNote.WIDTH_SCALE;
    Player.ctx.globalAlpha = HoldNote.OPACITY;
    Player.ctx.beginPath();
    Player.ctx.rect(this.position.x + (Mania.COLUMN_WIDTH - w) / 2, ey, w, sy - ey);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.globalAlpha = 1;

    Player.ctx.beginPath();
    Player.ctx.rect(this.position.x, sy, Mania.COLUMN_WIDTH, Mania.COLUMN_WIDTH / 3);
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();

    Player.ctx.beginPath();
    Player.ctx.rect(this.position.x, ey, Mania.COLUMN_WIDTH, Mania.COLUMN_WIDTH / 3);
    Player.ctx.fill();
    Player.ctx.stroke();
};