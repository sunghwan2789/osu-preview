function HitNote(data, beatmap)
{
    HitObject.call(this, data, beatmap);

    this.column = Math.max(1, Math.min((this.position.x / this.beatmap.columnSize + 1) | 0, this.beatmap.keyCount)) - 1;

    this.endPosition = new Point(data);
    this.endTime = this.time;
}
HitNote.prototype = Object.create(HitObject.prototype);
HitNote.prototype.constructor = HitNote;
HitNote.id = 1;
Mania.prototype.hitObjectTypes[HitNote.id] = HitNote;
HitNote.prototype.draw = function(scroll)
{
    Player.ctx.beginPath();
    Player.ctx.rect(this.position.x, this.beatmap.calcY(this.position.y, scroll) - Mania.COLUMN_WIDTH / 3,
        Mania.COLUMN_WIDTH, Mania.COLUMN_WIDTH / 3);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();
};
