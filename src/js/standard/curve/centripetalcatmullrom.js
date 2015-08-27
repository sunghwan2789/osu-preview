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
        approxLength += this.points[i].distanceTo(this.points[i - 1]);
    }

    CurveType.call(this, approxLength / 2);
}
CentripetalCatmullRom.prototype = Object.create(CurveType.prototype);
CentripetalCatmullRom.prototype.constructor = CentripetalCatmullRom;
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
    return new Point(this.pointAt(t, 'x'), this.pointAt(t, 'y'));
};