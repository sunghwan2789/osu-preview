function TimingPoint(line)
{
    var data = line.split(',');
    if (data.length < 2)
    {
        return;
    }

    this.time = data[0] / 1000;

    var beatLength = +data[1];
    if (beatLength >= 0)
    {
        this.sliderVelocity = 1;
        this.beatLength = beatLength;
        Player.beatmap.current.beatLength = this.beatLength;
    }
    else
    {
        this.sliderVelocity = beatLength / -100;
        this.beatLength = Player.beatmap.current.beatLength * this.sliderVelocity;
    }
}
TimingPoint.prototype.getBPM = function()
{
    return 1000 / this.beatLength * 60;
};