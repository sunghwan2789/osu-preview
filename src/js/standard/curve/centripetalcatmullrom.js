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
CentripetalCatmullRom.prototype.pointAt = function(t)
{
    t = Math.lerp(1, 2, t);
    var A1 = this.points[0].clone().mul(1 - t).add(this.points[1].clone().mul(t));
    var A2 = this.points[1].clone().mul(2 - t).add(this.points[2].clone().mul(t - 1));
    var A3 = this.points[2].clone().mul(3 - t).add(this.points[3].clone().mul(t - 2));
    var B1 = A1.clone().mul(2 - t).add(A2.clone().mul(t));
    var B2 = A2.clone().mul(3 - t).add(A3.clone().mul(t - 1));
    return B1.clone().mul(2 - t).add(B2.clone().mul(t - 1)).mul(0.5);
};