function HitCircle()
{
    this.newCombo = this.flag & 4;
    this.comboSkip = this.flag >> 4;

    this.endTime = this.time;

    this.stack = 0;

    this.draw = HitCircle.draw;
}
HitCircle.id = 1;
Standard.hitObjectTypes[HitCircle.id] = HitCircle;
//HitCircle.prototype = Object.create(HitObject.prototype);
//HitCircle.prototype.constructor = HitCircle;
HitCircle.FADE_IN_TIME = 0.375;
HitCircle.FADE_OUT_TIME = 0.2;
HitCircle.draw = function(time)
{
    var dt = this.time - time,
        opacity = 1;
    if (dt >= 0)
    {
        opacity = (Player.beatmap.approachTime - dt) / HitCircle.FADE_IN_TIME;
    }
    else
    {
        opacity = 1 + dt / HitCircle.FADE_OUT_TIME;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));

    HitCircle.drawCircle.call(this, this.x, this.y);
    HitCircle.drawText.call(this, this.x, this.y, this.combo);
    if (dt >= 0)
    {
        HitCircle.drawApproach.call(this, dt);
    }
};
HitCircle.drawCircle = function(x, y)
{
    // HitCircle
    Player.ctx.beginPath();
    Player.ctx.arc(x - this.stack * Player.beatmap.stackOffset, y - this.stack * Player.beatmap.stackOffset, Player.beatmap.circleRadius - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.shadowBlur = 0;
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    // Overlay
    Player.ctx.shadowBlur = Player.beatmap.shadowBlur;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleBorder;
    Player.ctx.stroke();
};
HitCircle.drawText = function(x, y, text, deg)
{
    Player.ctx.shadowBlur = Player.beatmap.shadowBlur;
    Player.ctx.fillStyle = '#fff';
    Player.ctx.save();
    Player.ctx.translate(x - this.stack * Player.beatmap.stackOffset, y - this.stack * Player.beatmap.stackOffset);
    if (typeof deg !== 'undefined')
    {
        Player.ctx.rotate(deg);
    }
    Player.ctx.fillText(text, 0, 0);
    Player.ctx.restore();
};
HitCircle.drawApproach = function(dt)
{
    var scale = 1 + dt / Player.beatmap.approachTime * 3;
    Player.ctx.beginPath();
    Player.ctx.arc(this.x - this.stack * Player.beatmap.stackOffset, this.y - this.stack * Player.beatmap.stackOffset, Player.beatmap.circleRadius * scale - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.shadowBlur = 0;
    Player.ctx.strokeStyle = this.color;
    Player.ctx.lineWidth = Player.beatmap.circleBorder / 2 * scale;
    Player.ctx.stroke();
};