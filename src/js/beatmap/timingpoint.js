function TimingPoint(line)
{
    var data = line.split(',');
    if (data.length < 2)
    {
        throw 'invalid data';
    }

    this.time = data[0] | 0;
    this.beatLength = +data[1];
    this.meter = (data[2] | 0) || 4;

    // this is non-inherited timingPoint
    if (this.beatLength >= 0)
    {
        TimingPoint.parent = this;
    }
    else
    {
        this.parent = TimingPoint.parent;
        var sliderVelocity = -100 / this.beatLength;
        this.beatLength = this.parent.beatLength / sliderVelocity;
        this.meter = this.parent.meter;
    }
}
Object.defineProperties(TimingPoint.prototype, {
    bpm: {
        get: function()
        {
            return 60000 / this.beatLength;
        }
    }
});
