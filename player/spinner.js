function Spinner(data)
{
    HitCircle.call(this);

    this.endTime = data[0] | 0;
    this.duration = this.endTime - this.time;

    this.draw = Spinner.draw;
}
Spinner.id = 8;
Standard.hitObjectTypes[Spinner.id] = Spinner;
//Spinner.prototype = Object.create(HitCirle.prototype);
//Spinner.prototype.constructor = Spinner;
Spinner.FADE_IN_TIME = 500;
Spinner.FADE_OUT_TIME = 200;
Spinner.RADIUS = Beatmap.MAX_Y / 2;
Spinner.BORDER_WIDTH = Spinner.RADIUS / 20;
Spinner.draw = function(time)
{
    var dt = this.time - time,
        opacity = 1;
    if (dt >= 0)
    {
        opacity = (Player.beatmap.approachTime - dt) / Spinner.FADE_IN_TIME;
    }
    else if (time > this.endTime)
    {
        opacity = 1 - (time - this.endTime) / Spinner.FADE_OUT_TIME;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));
    Player.ctx.save();
    // Spinner
    Player.ctx.beginPath();
    Player.ctx.arc(this.x, this.y, Spinner.RADIUS - Spinner.BORDER_WIDTH / 2, -Math.PI, Math.PI);
    Player.ctx.globalCompositeOperation = 'destination-over';
    Player.ctx.shadowBlur = 0;
    Player.ctx.fillStyle = 'rgba(0,0,0,.4)';
    Player.ctx.fill();
    // Border
    Player.ctx.shadowBlur = Spinner.BORDER_WIDTH;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Spinner.BORDER_WIDTH;
    Player.ctx.stroke();
    Player.ctx.restore();
    // Approach
    if (dt < 0 && time <= this.endTime)
    {
        var scale = 1 + dt / this.duration;
        Player.ctx.beginPath();
        Player.ctx.arc(this.x, this.y, (Spinner.RADIUS - Spinner.BORDER_WIDTH / 2) * scale, -Math.PI, Math.PI);
        Player.ctx.shadowBlur = 3;
        Player.ctx.strokeStyle = '#fff';
        Player.ctx.lineWidth = (Spinner.BORDER_WIDTH / 2) * scale;
        Player.ctx.stroke();
    }
};