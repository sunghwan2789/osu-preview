function CentripetalCatmullRom(points)
{
    // https://github.com/itdelatrisu/opsu/blob/master/src/itdelatrisu/opsu/objects/curves/CentripetalCatmullRom.java
    // needs 4 points
    if (points.length != 4)
    {
        throw 'invalid data';
    }

    this.points = points;
    this.time = [0];
    var approxLength = 0;
    for (var i = 1; i < 4; i++)
    {
        approxLength += this.points[i].distanceTo(this.points[i - 1]);
        this.time[i] = i;
    }

    CurveType.call(this, approxLength / 2);
}
CentripetalCatmullRom.prototype = Object.create(CurveType.prototype);
CentripetalCatmullRom.prototype.constructor = CentripetalCatmullRom;
CentripetalCatmullRom.prototype.pointAt = function(t)
{
    t = Math.lerp(this.time[1], this.time[2], t);
    var A1 = this.points[0].clone().mul((this.time[1] - t) / (this.time[1] - this.time[0]))
        .add(this.points[1].clone().mul((t - this.time[0]) / (this.time[1] - this.time[0])));
    var A2 = this.points[1].clone().mul((this.time[2] - t) / (this.time[2] - this.time[1]))
        .add(this.points[2].clone().mul((t - this.time[1]) / (this.time[2] - this.time[1])));
    var A3 = this.points[2].clone().mul((this.time[3] - t) / (this.time[3] - this.time[2]))
        .add(this.points[3].clone().mul((t - this.time[2]) / (this.time[3] - this.time[2])));
    var B1 = A1.clone().mul((this.time[2] - t) / (this.time[2] - this.time[0]))
        .add(A2.clone().mul((t - this.time[0]) / (this.time[2] - this.time[0])));
    var B2 = A2.clone().mul((this.time[3] - t) / (this.time[3] - this.time[1]))
        .add(A3.clone().mul((t - this.time[1]) / (this.time[3] - this.time[1])));
    return B1.clone().mul((this.time[2] - t) / (this.time[2] - this.time[1]))
        .add(B2.clone().mul((t - this.time[1]) / (this.time[2] - this.time[1])));
};