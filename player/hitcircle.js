function HitCircle()
{
    this.type = HitCircle.id;

    this.draw = HitCircle.draw;
}
HitCircle.id = 1;
//HitCircle.prototype = Object.create(HitObject.prototype);
//HitCircle.prototype.constructor = HitCircle;
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