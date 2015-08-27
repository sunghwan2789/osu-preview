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