function HitCircle(data, beatmap)
{
    HitObject.call(this, data, beatmap);

    this.newCombo = this.flag & 4;
    this.comboSkip = this.flag >> 4;

    this.endPosition = new Point(data);
    this.endTime = this.time;

    this.stack = 0;
}
HitCircle.prototype = Object.create(HitObject.prototype);
HitCircle.prototype.constructor = HitCircle;
HitCircle.id = 1;
Standard.prototype.hitObjectTypes[HitCircle.id] = HitCircle;
HitCircle.FADE_IN_TIME = 375;
HitCircle.FADE_OUT_TIME = 200;
HitCircle.prototype.draw = function(time)
{
    var dt = this.time - time,
        opacity = 1;
    if (dt >= 0)
    {
        opacity = (this.beatmap.approachTime - dt) / HitCircle.FADE_IN_TIME;
    }
    else
    {
        opacity = 1 + dt / HitCircle.FADE_OUT_TIME;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));

    this.drawCircle(this.position);
    this.drawText(this.position, this.combo);
    if (dt >= 0)
    {
        this.drawApproach(dt);
    }
};
HitCircle.prototype.drawCircle = function(position)
{
    // HitCircle
    Player.ctx.beginPath();
    Player.ctx.arc(position.x - this.stack * this.beatmap.stackOffset,
        position.y - this.stack * this.beatmap.stackOffset,
        this.beatmap.circleRadius - this.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.shadowBlur = 0;
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    // Overlay
    Player.ctx.shadowBlur = this.beatmap.shadowBlur;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = this.beatmap.circleBorder;
    Player.ctx.stroke();
};
HitCircle.prototype.drawText = function(position, text, deg)
{
    Player.ctx.shadowBlur = this.beatmap.shadowBlur;
    Player.ctx.fillStyle = '#fff';
    Player.ctx.save();
    Player.ctx.translate(position.x - this.stack * this.beatmap.stackOffset,
        position.y - this.stack * this.beatmap.stackOffset);
    if (typeof deg !== 'undefined')
    {
        Player.ctx.rotate(deg);
    }
    Player.ctx.fillText(text, 0, 0);
    Player.ctx.restore();
};
HitCircle.prototype.drawApproach = function(dt)
{
    var scale = 1 + dt / this.beatmap.approachTime * 3;
    Player.ctx.beginPath();
    Player.ctx.arc(this.position.x - this.stack * this.beatmap.stackOffset,
        this.position.y - this.stack * this.beatmap.stackOffset,
        this.beatmap.circleRadius * scale - this.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.shadowBlur = 0;
    Player.ctx.strokeStyle = this.color;
    Player.ctx.lineWidth = this.beatmap.circleBorder / 2 * scale;
    Player.ctx.stroke();
};
