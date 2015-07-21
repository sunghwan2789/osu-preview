function HitCircle()
{
    HitCircle.parseFlag.call(this);

    this.draw = HitCircle.draw;
}
HitCircle.id = 1;
Standard.hitObjectTypes[HitCircle.id] = HitCircle;
//HitCircle.prototype = Object.create(HitObject.prototype);
//HitCircle.prototype.constructor = HitCircle;
HitCircle.parseFlag = function()
{
    this.newCombo = this.flag & 4;
    this.comboSkip = this.flag >> 4;
};
HitCircle.draw = function(time)
{
    var opacity = 1;
    if (time < this.time)
    {
        opacity = (Player.beatmap.approachTime - (this.time - time)) / 0.4;
    }
    else if (time > this.time)
    {
        opacity = 1 - (time - this.time) / 0.2;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));
    Player.ctx.shadowBlur = Player.beatmap.shadowBlur;
    // hitHitCircle
    Player.ctx.beginPath();
    Player.ctx.arc(this.x, this.y, Player.beatmap.circleRadius - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleBorder;
    Player.ctx.stroke();
    // combo
    Player.ctx.fillStyle = '#fff';
    Player.ctx.fillText(this.combo, this.x, this.y);
    // approach
    if (time <= this.time)
    {
        var dtp = 1 - (this.time - time) / Player.beatmap.approachTime;
        Player.ctx.beginPath();
        Player.ctx.arc(this.x, this.y, Player.beatmap.circleRadius * (4 - 3 * dtp) - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
        Player.ctx.strokeStyle = this.color;
        Player.ctx.lineWidth = Player.beatmap.circleBorder / 2 * (2 - dtp);
        Player.ctx.stroke();
    }
};