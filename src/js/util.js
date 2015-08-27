Math.hypot = Math.hypot || function()
{
    var power = 0;
    for (var i = 0; i < arguments.length; i++)
    {
        power += arguments[i] * arguments[i];
    }
    return Math.sqrt(power);
};
Math.lerp = Math.lerp || function(a, b, t)
{
    if (a instanceof Point)
    {
        return new Point(Math.lerp(a.x, b.x, t), Math.lerp(a.y, b.y, t));
    }
    return a + (b - a) * t;
};