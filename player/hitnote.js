function HitNote()
{
    this.column = 0;

    HitNote.parse.call(this);

    this.draw = HitNote.draw;
}
HitNote.id = 1;
Mania.hitObjectTypes[HitNote.id] = HitNote;
//HitNote.prototype = Object.create(HitObject.prototype);
//HitNote.prototype.constructor = HitNote;
HitNote.parse = function()
{
    this.column = Math.max(1, Math.min(Math.round((this.x * 2 / Player.beatmap.columnSize + 1) / 2), Player.beatmap.keyCount)) - 1;
};
HitNote.calcY = function(time, nTime)
{
    // Player.ctx.font = '20px Arial';
    // Player.ctx.textBaseline = 'top';
    // Player.ctx.fillText(Player.beatmap.getTimingPoint(time).bpm, 0, 60);
    // nTime = nTime || this.time;
    // return Player.beatmap.basePosition.y -
    //     Player.getScaled(nTime - time) /
    //     (60 * 60 / Player.beatmap.getTimingPoint(nTime).bpm / Player.beatmap.getTimingPoint(time).bpm) *
    //     Player.beatmap.scrollVelocity;
    nTime = nTime || this.time;
    return Player.beatmap.basePosition.y -
        (nTime - time) *
        (120 / 4) * // bpm based y calculation
        Player.beatmap.scrollVelocity;
};
HitNote.draw = function(time)
{
    Player.ctx.beginPath();
    Player.ctx.rect(this.x, HitNote.calcY.call(this, time), Player.beatmap.columnWidth, 10);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#ccc';
    Player.ctx.lineWidth = 1;
    Player.ctx.stroke();
};