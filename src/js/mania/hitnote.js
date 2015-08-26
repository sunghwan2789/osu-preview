function HitNote()
{
    this.column = Math.max(1, Math.min((this.x / Player.beatmap.columnSize + 1) | 0, Player.beatmap.keyCount)) - 1;
    this.endTime = this.time;

    this.draw = HitNote.draw;
}
HitNote.id = 1;
Mania.hitObjectTypes[HitNote.id] = HitNote;
//HitNote.prototype = Object.create(HitObject.prototype);
//HitNote.prototype.constructor = HitNote;
HitNote.calcY = function(y, scroll)
{
    return Mania.HIT_POSITION - (y - scroll) * Player.beatmap.scrollSpeed * 0.035;
};
HitNote.draw = function(scroll)
{
    Player.ctx.beginPath();
    Player.ctx.rect(this.x, HitNote.calcY.call(this, this.y, scroll), Player.beatmap.columnWidth, Player.beatmap.columnWidth / 3);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();
};