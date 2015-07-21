function Slider(data)
{
    HitCircle.parseFlag.call(this);

    this.sliderType = data[0][0];
    this.points = Slider.getPoints.call(this, data[0]);
    this.repeat = data[1] | 0;
    this.pixelLength = +data[2];
    Slider.parsePath.call(this);
    this.endTime += this.time;

    this.draw = Slider.draw;
}
Slider.id = 2;
Standard.hitObjectTypes[Slider.id] = Slider;
//Slider.prototype = Object.create(HitCircle.prototype);
//Slider.prototype.constructor = Slider;
Slider.getPoints = function(data)
{
    var points = data.split('|');
    for (var i = 1, l = points.length; i < l; i++)
    {
        var point = points[i].split(':');
        points[i] = {
            x: point[0] | 0,
            y: point[1] | 0
        };
    }
    points[0] = this;
    return points;
};
Slider.parsePath = function()
{
    this.path = [ this ];
    switch (this.sliderType)
    {
        case 'B':
        {
            Slider.parseBezier.call(this);
            break;
        }
        case 'C':
        {
            Slider.parseCatmull.call(this);
            break;
        }
        case 'P':
        {
            Slider.parsePeppy.call(this);
            break;
        }
        case 'L':
        {
            Slider.parseLinear.call(this);
            break;
        }
    }
    var EOP = this.path.slice(-1)[0];
    this.endX = EOP.x;
    this.endY = EOP.y;
    var velocity = Player.beatmap.SliderMultiplier *
            (100 / Player.beatmap.getTimingPoint(this.time).beatLength);
    this.endTime = this.pixelLength / velocity * this.repeat / 1000;
};
Slider.parseBezier = function() //TODO FIX LENGTH
{
    // https://github.com/pictuga/osu-web/blob/master/js/curves.js
    var segmentLength = 5,
        n = this.points.length - 1,
        segments = this.pixelLength / segmentLength | 0;
    for (var i = 1; i <= segments; i++)
    {
        var c = 1,
            x = 0,
            y = 0;
        for (var j = 0; j <= n; j++)
        {
            var t = c * Math.pow(1 - i / segments, n - j) * Math.pow(i / segments, j);
            x += t * this.points[j].x;
            y += t * this.points[j].y;
            c = c * (n - j) / (j + 1);
        }
        this.path.push({
            x: x,
            y: y
        });
    }
};
Slider.parseCatmull = function() //TODO FIX LENGTH
{
    // https://github.com/pictuga/osu-web/blob/master/js/curves.js
    var segmentLength = 5,
        segments = this.pixelLength / segmentLength | 0;
    for (var i = 0, l = this.points.length - 1; i < l; i++)
    {
        for (var j = 1; j <= segments; j++)
        {
            var p0 = this.points[i - (i >= 1)],
                p1 = this.points[i],
                p2 = i + 1 < l + 1 ? this.points[i + 1] : {
                    x: p1.x * 2 - p0.x,
                    y: p1.y * 2 - p0.y
                },
                p3 = i + 2 < l + 2 ? this.points[i + 2] : {
                    x: p2.x * 2 - p1.x,
                    y: p2.y * 2 - p1.y
                };
            this.path.push({
                x: 0.5 * (
                    (   -p0.x + p1.x * 3 - p2.x * 3 + p3.x) * Math.pow(j / segments, 3) +
                    (p0.x * 2 - p1.x * 5 + p2.x * 4 - p3.x) * Math.pow(j / segments, 2) +
                    (   -p0.x            + p2.x) * j / segments +
                    p1.x * 2),
                y: 0.5 * (
                    (   -p0.y + p1.y * 3 - p2.y * 3 + p3.y) * Math.pow(j / segments, 3) +
                    (p0.y * 2 - p1.y * 5 + p2.y * 4 - p3.y) * Math.pow(j / segments, 2) +
                    (   -p0.y            + p2.y) * j / segments +
                    p1.y * 2)
            });
        }
    }
};
Slider.parsePeppy = function()
{
    // Circumscribed Circle
    var segmentLength = 10,
        a = this.points[0].x - this.points[1].x, b = this.points[0].y - this.points[1].y,
        c = this.points[1].x - this.points[2].x, d = this.points[1].y - this.points[2].y,
        q = (a * d - b * c) * 2,
        l0 = this.points[0].x * this.points[0].x + this.points[0].y * this.points[0].y,
        l1 = this.points[1].x * this.points[1].x + this.points[1].y * this.points[1].y,
        l2 = this.points[2].x * this.points[2].x + this.points[2].y * this.points[2].y,
        x = ((l0 - l1) * d + (l1 - l2) * -b) / q,
        y = ((l0 - l1) * -c + (l1 - l2) * a) / q,
        dx = this.points[0].x - x,
        dy = this.points[0].y - y,
        base = Math.atan2(dy, dx),
        r = Math.sqrt(dx * dx + dy * dy),
        p = a ? (a < 0) ^ (c * b / a < d) : (b > 0) ^ (c > 0), // if 2 over 01 ? t > 0 : t < 0
        t = this.pixelLength / r * (p ? 1 : -1),
        segments = this.pixelLength / segmentLength | 0;
    for (var i = 1; i <= segments; i++)
    {
        this.path.push({
            x: x + Math.cos(base + t * i / segments) * r,
            y: y + Math.sin(base + t * i / segments) * r
        });
    }
};
Slider.parseLinear = function()
{
    var segments = 10,
        t = Math.atan2(this.points[1].y - this.points[0].y, this.points[1].x - this.points[0].x);
    for (var i = 1; i <= segments; i++)
    {
        this.path.push({
            x: this.points[0].x + Math.cos(t) * this.pixelLength * i / segments,
            y: this.points[0].y + Math.sin(t) * this.pixelLength * i / segments
        });
    }
};
Slider.draw = function(time)
{
    var opacity = 1;
    if (time < this.time)
    {
        opacity = (Player.beatmap.approachTime - (this.time - time)) / 0.4;
    }
    else if (time > this.endTime)
    {
        opacity = 1 - (time - this.endTime) / 0.2;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));
    Player.ctx.shadowBlur = Player.beatmap.shadowBlur;
    // path
    Player.ctx.beginPath();
    Player.ctx.moveTo(this.x, this.y);
    for (var i = 1, l = this.path.length; i < l; i++)
    {
        Player.ctx.lineTo(this.path[i].x, this.path[i].y);
    }
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleRadius * 2;
    Player.ctx.stroke();
    Player.ctx.strokeStyle = this.color;
    Player.ctx.lineWidth = (Player.beatmap.circleRadius - Player.beatmap.circleBorder) * 2;
    Player.ctx.stroke();
    // endHitcircle
    Player.ctx.beginPath();
    Player.ctx.arc(this.endX, this.endY, Player.beatmap.circleRadius - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleBorder;
    Player.ctx.stroke();
    // hitcircle
    Player.ctx.beginPath();
    Player.ctx.arc(this.x, this.y, Player.beatmap.circleRadius - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.fillStyle = this.color;
    Player.ctx.fill();
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleBorder;
    Player.ctx.stroke();
    // combo
    Player.ctx.fillStyle = '#fff';
    var repeat = (time - this.time) * this.repeat / (this.endTime - this.time);
    if (this.repeat > 1 && repeat <= this.repeat - (this.repeat % 2 ? 2 : 1))
    {
        var preEOP = this.path.slice(-2)[0];
        Player.ctx.save();
        Player.ctx.translate(this.endX, this.endY);
        Player.ctx.rotate(Math.PI + Math.atan2(this.endY - preEOP.y, this.endX - preEOP.x));
        Player.ctx.fillText(String.fromCharCode(10132), 0, 0);
        Player.ctx.restore();
    }
    if (repeat > 0)
    {
        if (repeat <= this.repeat - ((this.repeat + 1) % 2 ? 2 : 1))
        {
            var posSOP = this.path[1];
            Player.ctx.save();
            Player.ctx.translate(this.x, this.y);
            Player.ctx.rotate(Math.atan2(posSOP.y - this.y, posSOP.x - this.x));
            Player.ctx.fillText(String.fromCharCode(10132), 0, 0);
            Player.ctx.restore();
        }
    }
    else
    {
        Player.ctx.fillText(this.combo, this.x, this.y);
    }
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
    // slider followHitCircle
    // http://sc-wu.com/p/Wosu/
    if (time >= this.time && time <= this.endTime)
    {
        repeat %= 2;
        if (repeat > 1)
        {
            repeat = 2 - repeat;
        }
        var l = this.path.length,
            a = l * repeat | 0,
            b = a + 1,
            t = l * repeat - a;
        if (a >= l)
        {
            a = l - 1;
        }
        if (b >= l)
        {
            b = l - 1;
        }
        Player.ctx.beginPath();
        Player.ctx.arc(
            this.path[a].x * (1 - t) + this.path[b].x * t,
            this.path[a].y * (1 - t) + this.path[b].y * t,
            Player.beatmap.circleRadius - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
        Player.ctx.strokeStyle = '#fff';
        Player.ctx.stroke();
    }
};