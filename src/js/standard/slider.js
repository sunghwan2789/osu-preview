function Slider(data)
{
    HitCircle.call(this, data);

    var points = data[5].split('|');
    this.sliderType = points[0];
    for (var i = 1; i < points.length; i++)
    {
        var point = points[i].split(':');
        points[i] = {
            x: point[0] | 0,
            y: point[1] | 0
        };
    }
    this.points = [this].concat(points.slice(1));
    this.repeat = data[6] | 0;
    this.pixelLength = +data[7];

    var speed = 100 / Player.beatmap.timingPointAt(this.time).beatLength *
            Player.beatmap.SliderMultiplier;
    this.endTime += this.pixelLength / speed * this.repeat;
    this.duration = this.endTime - this.time;

    // currently, there are 4 sliderTypes
    // Passthrough, Catmull, Bezier, Linear
    if (this.sliderType == 'P' && this.points.length == 3)
    {
        Slider.parseCircumscribedCircle.call(this);
    }
    else if (this.sliderType == 'C')
    {
        Slider.parseCatmullCurve.call(this);
    }
    else
    {
        Slider.parseBezierCurve.call(this);
    }
    var path = this.path.slice(0, 2);
    this.startAngle = Math.atan2(path[1].y - path[0].y, path[1].x - path[0].x);
    path = this.path.slice(-2);
    this.endAngle = Math.atan2(path[0].y - path[1].y, path[0].x - path[1].x);
    this.endX = path[1].x;
    this.endY = path[1].y;
}
Slider.prototype = Object.create(HitCircle.prototype);
Slider.prototype.constructor = Slider;
Slider.id = 2;
Standard.prototype.hitObjectTypes[Slider.id] = Slider;
Slider.CURVE_LENGTH = 5;
Slider.parseCircumscribedCircle = function()
{
    var a = this.points[0].x - this.points[1].x, b = this.points[0].y - this.points[1].y,
        c = this.points[1].x - this.points[2].x, d = this.points[1].y - this.points[2].y,
        q = (a * d - b * c) * 2,
        l0 = this.points[0].x * this.points[0].x + this.points[0].y * this.points[0].y,
        l1 = this.points[1].x * this.points[1].x + this.points[1].y * this.points[1].y,
        l2 = this.points[2].x * this.points[2].x + this.points[2].y * this.points[2].y,
        x = ((l0 - l1) * d + (l1 - l2) * -b) / q,
        y = ((l0 - l1) * -c + (l1 - l2) * a) / q,
        dx = this.points[0].x - x,
        dy = this.points[0].y - y,
        r = Math.hypot(dx, dy),
        base = Math.atan2(dy, dx),
        p = a ? (a < 0) ^ (c * b / a < d) : (b > 0) ^ (c > 0), // if l2 over l0l1 ? t > 0 : t < 0
        t = this.pixelLength / r * (p ? 1 : -1);
    this.circle = {
        x: x,
        y: y,
        radius: r
    };
    this.angle = {
        base: base,
        delta: t
    };
    this.pointAt = function(t, scaled)
    {
        var angle = this.angle.base + this.angle.delta * t;
        return {
            x: this.circle.x + Math.cos(angle) * this.circle.radius,
            y: this.circle.y + Math.sin(angle) * this.circle.radius
        };
    };

    var nCurve = this.pixelLength / Slider.CURVE_LENGTH | 0;
    this.path = [];
    for (var i = 0; i <= nCurve; i++)
    {
        this.path[i] = this.pointAt(i / nCurve);
    }
};
Slider.parseCatmullCurve = function()
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/CatmullCurve.java
    var catmulls = [],
        points = [];
    if (this.points[0].x != this.points[1].x || this.points[0].y != this.points[1].y)
    {
        points.push(this.points[0]);
    }
    for (var i = 0; i < this.points.length; i++)
    {
        points.push(this.points[i]);
        try
        {
            catmulls.push(new CentripetalCatmullRom(points));
            points.shift();
        }
        catch (e) {}
    }
    var point2 = this.points.slice(-2);
    if (point2[0].x != point2[1].x || point2[0].y != point2[1].y)
    {
        points.push(point2[1]);
    }
    try
    {
        catmulls.push(new CentripetalCatmullRom(points));
    }
    catch (e) {}
    Slider.parseEqualDistanceMultiCurve.call(this, catmulls);
};
function CentripetalCatmullRom(points)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/CentripetalCatmullRom.java
    // needs 4 points
    if (points.length != 4)
    {
        throw 'invalid data';
    }

    this.points = points;
    var approxLength = 0;
    for (var i = 1; i < 4; i++)
    {
        approxLength += Math.hypot(this.points[i].x - this.points[i - 1].x, this.points[i].y - this.points[i - 1].y);
    }
    Curve.call(this, approxLength / 2);
}
CentripetalCatmullRom.prototype.pointAt = function(t, p)
{
    if (typeof p !== 'undefined')
    {
        var A1 = this.points[0][p] * (2 - t) + this.points[1][p] * (t - 1),
            A2 = this.points[1][p] * (3 - t) + this.points[2][p] * (t - 2),
            A3 = this.points[2][p] * (4 - t) + this.points[3][p] * (t - 3),
            B1 = (A1 * (3 - t) + A2 * (t - 1)) / 2,
            B2 = (A2 * (4 - t) + A3 * (t - 2)) / 2,
            C = B1 * (3 - t) + B2 * (t - 2);
        return C;
    }
    return {
        x: this.pointAt(t, 'x'),
        y: this.pointAt(t, 'y')
    };
};
Slider.parseBezierCurve = function()
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/LinearBezier.java
    var beziers = [],
        points = [],
        last = {};
    for (var i = 0; i < this.points.length; i++)
    {
        var point = this.points[i];
        if (point.x == last.x && point.y == last.y)
        {
            try
            {
                beziers.push(new Bezier2(points));
            }
            catch (e) {}
            points = [];
        }
        points.push(point);
        last = point;
    }
    try
    {
        beziers.push(new Bezier2(points));
    }
    catch (e) {}
    Slider.parseEqualDistanceMultiCurve.call(this, beziers);
};
function Bezier2(points)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/Bezier2.java
    if (points.length < 2)
    {
        throw 'invalid data';
    }

    this.points = points;
    var approxLength = 0;
    for (var i = 1; i < this.points.length; i++)
    {
        approxLength += Math.hypot(this.points[i].x - this.points[i - 1].x, this.points[i].y - this.points[i - 1].y);
    }
    Curve.call(this, approxLength);
}
Bezier2.prototype.pointAt = function(t)
{
    var n = this.points.length - 1,
        x = 0,
        y = 0,
        combination = 1;
    for (var i = 0; i <= n; i++)
    {
        var bernstein = combination * Math.pow(t, i) * Math.pow(1 - t, n - i);
        x += this.points[i].x * bernstein;
        y += this.points[i].y * bernstein;
        combination = combination * (n - i) / (i + 1);
    }
    return {
        x: x,
        y: y
    };
};
function Curve(approxLength)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/CurveType.java
    var points = (approxLength / 4 | 0) + 1;
    this.path = [];
    for (var i = 0; i <= points; i++)
    {
        this.path[i] = this.pointAt(i / points);
    }

    this.distance = [ 0 ];
    for (var i = 1; i <= points; i++)
    {
        this.distance[i] = Math.hypot(this.path[i].x - this.path[i - 1].x, this.path[i].y - this.path[i - 1].y);
    }
}
Slider.parseEqualDistanceMultiCurve = function(curves)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/EqualDistanceMultiCurve.java
    var nCurve = this.pixelLength / Slider.CURVE_LENGTH | 0;
    this.path = [];

    var distanceAt = 0,
        curveIndex = 0,
        curve = curves[curveIndex],
        pointIndex = 0,
        startPoint = curve.path[0],
        lastDistanceAt = 0;
    // for each distance, try to get in between the two points that are between it
    for (var i = 0; i <= nCurve; i++)
    {
        var prefDistance = i * this.pixelLength / nCurve | 0;
        while (distanceAt < prefDistance)
        {
            lastDistanceAt = distanceAt;
            startPoint = curve.path[pointIndex];

            if (++pointIndex >= curve.path.length)
            {
                if (curveIndex + 1 < curves.length)
                {
                    curve = curves[++curveIndex];
                    pointIndex = 0;
                }
                else
                {
                    pointIndex = curve.path.length - 1;
                    if (lastDistanceAt == distanceAt)
                    {
                        // out of points even though the preferred distance hasn't been reached
                        break;
                    }
                }
            }
            distanceAt += curve.distance[pointIndex];
        }
        var endPoint = curve.path[pointIndex];

        // interpolate the point between the two closest distances
        if (distanceAt - lastDistanceAt > 1)
        {
            var t = (prefDistance - lastDistanceAt) / (distanceAt - lastDistanceAt);
            this.path[i] = {
                x: startPoint.x + (endPoint.x - startPoint.x) * t,
                y: startPoint.y + (endPoint.y - startPoint.y) * t
            };
        }
        else
        {
            this.path[i] = endPoint;
        }
    }
    this.pointAt = function(t)
    {
        var indexF = this.path.length * t,
            index = indexF | 0;
        if (index + 1 < this.path.length)
        {
            var p1 = this.path[index],
                p2 = this.path[index + 1],
                t2 = indexF - index;
            return {
                x: p1.x + (p2.x - p1.x) * t2,
                y: p1.y + (p2.y - p1.y) * t2
            };
        }
        else
        {
            return this.path[this.path.length - 1];
        }
    };
};
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
        opacity = (Player.beatmap.approachTime - dt) / Slider.FADE_IN_TIME;
    }
    else if (time > this.endTime)
    {
        opacity = 1 - (time - this.endTime) / Slider.FADE_OUT_TIME;
    }
    Player.ctx.globalAlpha = Math.max(0, Math.min(opacity, 1));

    this.drawPath();
    this.drawCircle(this.endX, this.endY);
    this.drawCircle(this.x, this.y);

    var repeat = -dt * this.repeat / this.duration;
    if (this.repeat > 1 && repeat <= this.repeat - 1 - this.repeat % 2)
    {
        this.drawText(this.endX, this.endY, Slider.REVERSE_ARROW, this.endAngle);
    }
    if (repeat > 0 &&
        repeat <= this.repeat - 1 - (this.repeat + 1) % 2)
    {
        this.drawText(this.x, this.y, Slider.REVERSE_ARROW, this.startAngle);
    }
    else if (dt >= 0)
    {
        this.drawText(this.x, this.y, this.combo);
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
    Player.ctx.moveTo(this.x - this.stack * Player.beatmap.stackOffset, this.y - this.stack * Player.beatmap.stackOffset);
    for (var i = 1; i < this.path.length; i++)
    {
        Player.ctx.lineTo(this.path[i].x - this.stack * Player.beatmap.stackOffset, this.path[i].y - this.stack * Player.beatmap.stackOffset);
    }
    Player.ctx.shadowBlur = 0;
    Player.ctx.strokeStyle = this.color;
    Player.ctx.lineWidth = (Player.beatmap.circleRadius - Player.beatmap.circleBorder) * 2;
    Player.ctx.stroke();
    // Border
    Player.ctx.globalCompositeOperation = 'destination-over';
    Player.ctx.shadowBlur = 0;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleRadius * 2;
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
    var point = this.pointAt(repeat);
    Player.ctx.beginPath();
    Player.ctx.arc(point.x - this.stack * Player.beatmap.stackOffset, point.y - this.stack * Player.beatmap.stackOffset, Player.beatmap.circleRadius - Player.beatmap.circleBorder / 2, -Math.PI, Math.PI);
    Player.ctx.shadowBlur = Player.beatmap.shadowBlur;
    Player.ctx.strokeStyle = '#fff';
    Player.ctx.lineWidth = Player.beatmap.circleBorder;
    Player.ctx.stroke();
}