function BezierCurve(points, pixelLength)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/LinearBezier.java
    var beziers = [],
        controls = [],
        last = new Point(-1, -1);
    for (var i = 0; i < points.length; i++)
    {
        var point = points[i];
        if (point.equalTo(last))
        {
            try
            {
                beziers.push(new Bezier2(controls));
            }
            catch (e) {}
            controls = [];
        }
        controls.push(point);
        last = point;
    }
    try
    {
        beziers.push(new Bezier2(controls));
    }
    catch (e) {}

    EqualDistanceMultiCurve.call(this, beziers, pixelLength);
};
BezierCurve.prototype = Object.create(EqualDistanceMultiCurve.prototype);
BezierCurve.prototype.constructor = BezierCurve;