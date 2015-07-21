function TimingPoint(line)
{
    var data = line.split(',');
    if (data.length < 2)
    {
        return;
    }

    this.time = data[0] / 1000;

    var beatLength = +data[1];
    if (beatLength > 0)
    {
        this.beatLength = beatLength;
        Player.beatmap.current.beatLength = this.beatLength;
    }
    else
    {
        this.velocity = beatLength / -100;
        this.beatLength = Player.beatmap.current.beatLength * this.velocity;
        this.inherited = 1;
    }
}