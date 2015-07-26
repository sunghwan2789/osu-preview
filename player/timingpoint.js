function TimingPoint(line)
{
    var data = line.split(',');
    if (data.length < 2)
    {
        return;
    }

    this.time = data[0] | 0;

    var beatLength = +data[1];
    if (beatLength >= 0)
    {
        this.sliderVelocity = 1;
        this.beatLength = beatLength;
        Player.beatmap.current.beatLength = this.beatLength;
    }
    else
    {
        this.sliderVelocity = -100 / beatLength;
        this.beatLength = Player.beatmap.current.beatLength / this.sliderVelocity;
        this.inherited = 1;
    }
}
TimingPoint.prototype.getBPM = function()
{
    return 60000 / this.beatLength;
};