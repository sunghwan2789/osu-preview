function TimingPoint(line, beatmap)
{
    this.beatmap = beatmap;

    var data = line.split(',');
    if (data.length < 2)
    {
        throw 'invalid data';
    }

    this.time = data[0] | 0;
    this.beatLength = +data[1];
    this.meter = data[2] || 4 | 0;

    // this is non-inherited timingPoint
    if (this.beatLength >= 0)
    {
        this.beatmap.tmp.tpParent = this;
    }
    else
    {
        this.parent = this.beatmap.tmp.tpParent;
        var sliderVelocity = -100 / this.beatLength;
        this.beatLength = this.parent.beatLength / sliderVelocity;
        this.meter = this.parent.meter;
    }
}
TimingPoint.prototype.getBPM = function()
{
    return 60000 / this.beatLength;
};
