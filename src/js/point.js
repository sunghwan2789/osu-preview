function Point()
{
    if (arguments.length >= 2)
    {
        this.x = +arguments[0];
        this.y = +arguments[1];
    }
    else if (arguments.length == 1)
    {
        this.x = +arguments[0][0];
        this.y = +arguments[0][1];
    }
    else
    {
        this.x = 0;
        this.y = 0;
    }
}
Point.prototype.distanceTo = function(point)
{
    return Math.hypot(point.x - this.x, point.y - this.y);
};
Point.prototype.equalTo = function(point)
{
    return this.x == point.x && this.y == point.y;
};
Point.prototype.angleTo = function(point)
{
    return Math.atan2(point.y - this.y, point.x - this.x);
};