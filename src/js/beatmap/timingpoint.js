function TimingPoint(line)
{
    var data = line.split(',');
    if (data.length < 3)
    {
        throw 'invalid data';
    }

    this.time = data[0] | 0;
    this.beatLength = +data[1];
    this.sliderVelocity = 1;
    this.meter = data[2] | 0;

    // this is non-inherited timingPoint
    if (this.beatLength >= 0)
    {
        this.parent = this;
        Player.beatmap.tmp.tpBase = this;
    }
    else
    {
        this.parent = Player.beatmap.tmp.tpBase;
        this.meter = this.parent.meter;
        this.sliderVelocity = -100 / this.beatLength;
        this.beatLength = this.parent.beatLength / this.sliderVelocity;
    }
}
TimingPoint.prototype.getBPM = function()
{
    return 60000 / this.beatLength;
};