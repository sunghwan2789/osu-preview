function Curve()
{
    this.startAngle = this.path[0].angleTo(this.path[1]);
    var path2 = this.path.slice(-2);
    this.endAngle = path2[1].angleTo(path2[0]);
}
Curve.prototype = {
    path: undefined,
    pointAt: undefined
};
Curve.PRECISION = 5;
Curve.parse = function(sliderType, points, pixelLength)
{
    if (sliderType == 'P' && points.length == 3)
    {
        try
        {
            return new CircumscribedCircle(points, pixelLength);
        }
        catch (e)
        {
            // CircumscribedCircle throws error if vectors are parallel
            return new LinearBezier(points, pixelLength, false);
        }
    }
    if (sliderType == 'C')
    {
        return new CatmullCurve(points, pixelLength);
    }
    return new LinearBezier(points, pixelLength, sliderType == 'L');
}