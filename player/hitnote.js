function HitNote()
{
    this.column = Math.max(1, Math.min(Math.round((this.x * 2 / Player.beatmap.columnSize + 1) / 2), Player.beatmap.keyCount)) - 1;
    this.endTime = this.time;

    this.draw = HitNote.draw;
}
HitNote.id = 1;
Mania.hitObjectTypes[HitNote.id] = HitNote;
//HitNote.prototype = Object.create(HitObject.prototype);
//HitNote.prototype.constructor = HitNote;
HitNote.calcY = function(time, nTime)
{
    // Player.ctx.font = '20px Arial';
    // Player.ctx.textBaseline = 'top';
    // Player.ctx.fillText(Player.beatmap.getTimingPoint(time).bpm, 0, 60);
    nTime = nTime || this.time;
    return Mania.HIT_POSITION -
        (nTime - time) * Player.beatmap.getTimingPoint(time).sliderVelocity * Player.beatmap.scrollSpeed;
};
HitNote.draw = function(time)
{
    Player.ctx.beginPath();
    Player.ctx.rect(this.x, HitNote.calcY.call(this, time), Player.beatmap.columnWidth, Player.beatmap.columnWidth / 3);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();
};