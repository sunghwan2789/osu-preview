function Slider(data, beatmap)
{
    HitCircle.call(this, data, beatmap);

    var points = data[5].split('|');
    var sliderType = points[0];
    points[0] = this.position;
    for (var i = 1; i < points.length; i++)
    {
        points[i] = new Point(points[i].split(':'));
    }
    this.repeat = data[6] | 0;
    this.pixelLength = +data[7];

    var sliderTime = this.beatmap.timingPointAt(this.time).beatLength * (
            this.pixelLength / this.beatmap.SliderMultiplier
        ) / 100;
    this.endTime += sliderTime * this.repeat;
    this.duration = this.endTime - this.time;

    this.curve = Curve.parse(sliderType, points, this.pixelLength);

    this.endPosition = this.curve.pointAt(1);
}
Slider.prototype = Object.create(HitCircle.prototype);
Slider.prototype.constructor = Slider;
Slider.id = 2;
Standard.prototype.hitObjectTypes[Slider.id] = Slider;
Slider.FADE_IN_TIME = 375;
Slider.FADE_OUT_TIME = 200;
Slider.REVERSE_ARROW = String.fromCharCode(10132);
Slider.OPACITY = 0.66;
Slider.prototype.draw = function(time)
{
    var dt = this.time - time,
        opacity = 1;
    if (dt >= 0)
    {
        opacity = (this.beatmap.approachTime - dt) / Slider.FADE_IN_TIME;
    }
    else if (time > this.endTime)
    {
        opacity = 1 - (time - this.endTime) / Slider.FADE_OUT_TIME;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));

    this.drawPath();
    this.drawCircle(this.endPosition);
    this.drawCircle(this.position);

    var repeat = -dt * this.repeat / this.duration;
    if (this.repeat > 1 && repeat <= this.repeat - 1 - this.repeat % 2)
    {
        this.drawText(this.endPosition, Slider.REVERSE_ARROW, this.curve.endAngle);
    }
    if (repeat > 0 &&
        repeat <= this.repeat - 1 - (this.repeat + 1) % 2)
    {
        this.drawText(this.position, Slider.REVERSE_ARROW, this.curve.startAngle);
    }
    else if (dt >= 0)
    {
        this.drawText(this.position, this.combo);
    }

    if (dt >= 0)
    {
        this.drawApproach(dt);
    }
    else if (time < this.endTime)
    {
        this.drawFollowCircle(repeat);
    }
};
Slider.prototype.drawPath = function()
{
    Player.ctx.save();
    // Slider
    Player.ctx.globalAlpha *= Slider.OPACITY;
    Player.ctx.beginPath();
    Player.ctx.moveTo(this.position.x - this.stack * this.beatmap.stackOffset,
        this.position.y - this.stack * this.beatmap.stackOffset);
    for (var i = 1; i < this.curve.path.length; i++)
    {
        Player.ctx.lineTo(this.curve.path[i].x - this.stack * this.beatmap.stackOffset,
            this.curve.path[i].y - this.stack * this.beatmap.stackOffset);
    }
    Player.ctx.shadowBlur = 0;
    Player.ctx.strokeStyle = this.color;
    Player.ctx.lineWidth = (this.beatmap.circleRadius - this.beatmap.circleBorder) * 2;
    Player.ctx.stroke();
    // Border
    Player.ctx.globalCompositeOperation = 'destination-over';
    Player.ctx.shadowBlur = 0;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = this.beatmap.circleRadius * 2;
    Player.ctx.stroke();
    Player.ctx.restore();
};
Slider.prototype.drawFollowCircle = function(repeat)
{
    repeat %= 2;
    if (repeat > 1)
    {
        repeat = 2 - repeat;
    }
    var point = this.curve.pointAt(repeat);
    Player.ctx.beginPath();
    Player.ctx.arc(point.x - this.stack * this.beatmap.stackOffset,
        point.y - this.stack * this.beatmap.stackOffset,
        this.beatmap.circleRadius - this.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.shadowBlur = this.beatmap.shadowBlur;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = this.beatmap.circleBorder;
    Player.ctx.stroke();
}
