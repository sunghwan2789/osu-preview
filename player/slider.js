function Slider(data)
{
    HitCircle.call(this);

    var points = data[0].split('|');
    this.sliderType = points[0];
    for (var i = 1, l = points.length; i < l; i++)
    {
        var point = points[i].split(':');
        points[i] = {
            x: point[0] | 0,
            y: point[1] | 0
        };
    }
    this.points = [ this ].concat(points.slice(1));
    this.repeat = data[1] | 0;
    this.pixelLength = +data[2];

    var velocity = 100 / Player.beatmap.getTimingPoint(this.time).beatLength *
            Player.beatmap.SliderMultiplier;
    this.endTime += this.pixelLength / velocity * this.repeat / 1000;
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
        Slider.parseLinearBezier.call(this, this.sliderType == 'L');
    }
    var path = this.path.slice(0, 2);
    this.startAngle = Math.atan2(path[1].y - path[0].y, path[1].x - path[0].x);
    path = this.path.slice(-2);
    this.endAngle = Math.atan2(path[0].y - path[1].y, path[0].x - path[1].x);
    this.endX = path[1].x;
    this.endY = path[1].y;

    this.draw = Slider.draw;
}
Slider.id = 2;
Standard.hitObjectTypes[Slider.id] = Slider;
//Slider.prototype = Object.create(HitCircle.prototype);
//Slider.prototype.constructor = Slider;
Slider.SEGMENT_LENGTH = 5;
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
        r = Math.sqrt(dx * dx + dy * dy),
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
        var angle = this.angle.base + this.angle.delta * t,
            x = this.circle.x + Math.cos(angle) * this.circle.radius,
            y = this.circle.y + Math.sin(angle) * this.circle.radius;
        return {
            x: x,
            y: y
        };
    };

    var segments = this.pixelLength / Slider.SEGMENT_LENGTH | 0;
    this.path = [];
    for (var i = 0; i <= segments; i++)
    {
        this.path[i] = this.pointAt(i / segments);
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
    for (var i = 0, l = this.points.length; i < l; i++)
    {
        points.push(this.points[i]);
        if (points.length == 4)
        {
            catmulls.push(new CentripetalCatmullRom(points));
            points.shift();
        }
    }
    var point2 = this.points.slice(-2);
    if (point2[0].x != point2[1].x || point2[0].y != point2[1].y)
    {
        points.push(this.points.slice(-1));
    }
    if (points.length == 4)
    {
        catmulls.push(new CentripetalCatmullRom(points));
    }
    Slider.parseEqualDistanceMultiCurve.call(this, catmulls);
};
function CentripetalCatmullRom(points)
{
    // needs 4 points
    this.points = points;
    var approxLength = 0;
    for (var i = 1; i < 4; i++)
    {
        var dx = this.points[i].x - this.points[i - 1].x,
            dy = this.points[i].y - this.points[i - 1].y,
            len = Math.sqrt(dx * dx + dy * dy);
        approxLength += len;
    }
    CurveType.call(this, approxLength / 2);
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
Slider.parseLinearBezier = function(line)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/LinearBezier.java
    var beziers = [],
        points = [],
        last = undefined;
    for (var i = 0, l = this.points.length; i < l; i++)
    {
        var point = this.points[i];
        if (line)
        {
            if (typeof last !== 'undefined')
            {
                points.push(point);
                beziers.push(new Bezier2(points));
                points = [];
            }
        }
        else if (typeof last !== 'undefined' &&
            point.x == last.x && point.y == last.y)
        {
            if (points.length >= 2)
            {
                beziers.push(new Bezier2(points));
            }
            points = [];
        }
        points.push(point);
        last = point;
    }
    if (!line && points.length >= 2)
    {
        beziers.push(new Bezier2(points));
    }
    Slider.parseEqualDistanceMultiCurve.call(this, beziers);
};
function Bezier2(points)
{
    this.points = points;
    var approxLength = 0;
    for (var i = 1, l = this.points.length; i < l; i++)
    {
        var dx = this.points[i].x - this.points[i - 1].x,
            dy = this.points[i].y - this.points[i - 1].y,
            len = Math.sqrt(dx * dx + dy * dy);
        approxLength += len;
    }
    CurveType.call(this, approxLength);
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
function CurveType(approxLength)
{
    this.pathLength = (approxLength / 4 | 0) + 2;
    this.path = [];
    for (var i = 0; i < this.pathLength; i++)
    {
        this.path[i] = this.pointAt(i / (this.pathLength - 1));
    }

    this.pathDistance = [ 0 ];
    this.totalDistance = 0;
    for (var i = 1; i < this.pathLength; i++)
    {
        var dx = this.path[i].x - this.path[i - 1].x,
            dy = this.path[i].y - this.path[i - 1].y,
            len = Math.sqrt(dx * dx + dy * dy);
        this.pathDistance[i] = len;
        this.totalDistance += len;
    }
}
Slider.parseEqualDistanceMultiCurve = function(curves)
{
    var segments = this.pixelLength / Slider.SEGMENT_LENGTH | 0;
    this.path = [];

    var distanceAt = 0,
        curveIndex = 0,
        curCurve = curves[curveIndex],
        curPoint = 0,
        lastCurve = curCurve.path[0],
        lastDistanceAt = 0;
    // for each distance, try to get in between the two points that are between it
    for (var i = 0; i <= segments; i++)
    {
        var prefDistance = i * this.pixelLength / segments | 0;
        while (distanceAt < prefDistance)
        {
            lastDistanceAt = distanceAt;
            lastCurve = curCurve.path[curPoint];

            if (++curPoint >= curCurve.path.length)
            {
                if (curveIndex + 1 < curves.length)
                {
                    curCurve = curves[++curveIndex];
                    curPoint = 0;
                }
                else
                {
                    curPoint = curCurve.path.length - 1;
                    if (lastDistanceAt == distanceAt)
                    {
                        // out of points even though the preferred distance hasn't been reached
                        break;
                    }
                }
            }
            distanceAt += curCurve.pathDistance[curPoint];
        }
        var thisCurve = curCurve.path[curPoint];

        // interpolate the point between the two closest distances
        if (distanceAt - lastDistanceAt > 1)
        {
            var t = (prefDistance - lastDistanceAt) / (distanceAt - lastDistanceAt);
            this.path[i] = {
                x: lastCurve.x + (thisCurve.x - lastCurve.x) * t,
                y: lastCurve.y + (thisCurve.y - lastCurve.y) * t
            };
        }
        else
        {
            this.path[i] = thisCurve;
        }
    }
    this.pointAt = function(t)
    {
        var segments = this.path.length,
            indexF = t * segments,
            index = indexF | 0;
        if (index + 1 >= segments)
        {
            return this.path[segments - 1];
        }
        else
        {
            var p1 = this.path[index],
                p2 = this.path[index + 1],
                t2 = indexF - index;
            return {
                x: p1.x + (p2.x - p1.x) * t2,
                y: p1.y + (p2.y - p1.y) * t2
            };
        }
    };
};
Slider.FADE_IN_TIME = 0.375;
Slider.FADE_OUT_TIME = 0.2;
Slider.REVERSE_ARROW = String.fromCharCode(10132);
Slider.OPACITY = 0.66;
Slider.draw = function(time)
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

    Slider.drawPath.call(this);
    HitCircle.drawCircle.call(this, this.endX, this.endY);
    HitCircle.drawCircle.call(this, this.x, this.y);

    var repeat = -dt * this.repeat / this.duration;
    if (this.repeat > 1 && repeat <= this.repeat - 1 - this.repeat % 2)
    {
        HitCircle.drawText.call(this, this.endX, this.endY, Slider.REVERSE_ARROW, this.endAngle);
    }
    if (repeat > 0 &&
        repeat <= this.repeat - 1 - (this.repeat + 1) % 2)
    {
        HitCircle.drawText.call(this, this.x, this.y, Slider.REVERSE_ARROW, this.startAngle);
    }
    else if (dt >= 0)
    {
        HitCircle.drawText.call(this, this.x, this.y, this.combo);
    }

    if (dt >= 0)
    {
        HitCircle.drawApproach.call(this, dt);
    }
    else if (time < this.endTime)
    {
        Slider.drawFollowCircle.call(this, repeat);
    }
};
Slider.drawPath = function()
{
    Player.ctx.save();
    // Slider
    Player.ctx.globalAlpha *= Slider.OPACITY;
    Player.ctx.beginPath();
    Player.ctx.moveTo(this.x - this.stack * Player.beatmap.stackOffset, this.y - this.stack * Player.beatmap.stackOffset);
    for (var i = 1, l = this.path.length; i < l; i++)
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
Slider.drawFollowCircle = function(repeat)
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