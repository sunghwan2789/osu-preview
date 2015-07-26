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
HitNote.calcY = function(y)
{
    // Player.ctx.font = '20px Arial';
    // Player.ctx.textBaseline = 'top';
    // Player.ctx.fillText(Player.beatmap.timingPoint(time).bpm, 0, 60);
    return Mania.HIT_POSITION - (this.y - y)
        * Player.beatmap.scrollSpeed
        ;
};
HitNote.draw = function(time, y)
{
    Player.ctx.beginPath();
    Player.ctx.rect(this.x, HitNote.calcY.call(this, y)
        // + Player.beatmap.timingPoint(time).sliderVelocity * Player.beatmap.timingPoint(time).getBPM() * Player.beatmap.sliderSpeed,
        , Player.beatmap.columnWidth, Player.beatmap.columnWidth / 3);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();
};