function Standard()
{
    this.hitObjectTypes = Standard.hitObjectTypes;
    this.processHitObject = Standard.processHitObject;

    var ar = this.ApproachRate || this.OverallDifficulty;
    this.approachTime = 1.2 + (5 - ar) * (ar <= 5 ? 0.12 : 0.15);
    this.circleRadius = Player.getLength(50 - this.CircleSize * 4.0625);
    this.circleBorder = this.circleRadius / 8;
    this.shadowBlur = this.circleRadius / 15;
    this.font = this.circleRadius + 'px "Comic Sans MS", cursive, sans-serif';
    this.basePosition = {
        x: Player.getLength(64),
        y: Player.getLength(48 + 8.25)
    };
    this.baseColors = [
        '#fff'
    ];

    this.draw = Standard.draw;
    this.processBG = Standard.processBG;
}
Standard.id = 0;
Standard.hitObjectTypes = {};
Beatmap.modes[Standard.id] = Standard;
//Standard.prototype = Object.create(Beatmap.prototype);
//Standard.prototype.costructor = Standard;
Standard.processHitObject = function(hitObject)
{
    if (typeof this.current.combo === 'undefined')
    {
        if (this.Colors.length)
        {
            this.Colors.push(this.Colors.shift());
        }
        else
        {
            this.Colors = this.baseColors;
        }
        this.current.combo = 1;
        this.current.comboIndex = -1;
        this.current.setComboIndex = 1;
    }
    if (hitObject.type.id == Spinner.id)
    {
        this.current.setComboIndex = 1;
    }
    else if (hitObject.newCombo || this.current.setComboIndex)
    {
        this.current.combo = 1;
        this.current.comboIndex = (
            (this.current.comboIndex + 1) + hitObject.comboSkip
        ) % this.Colors.length;
        this.current.setComboIndex = 0;
    }
    hitObject.combo = this.current.combo++;
    hitObject.color = this.Colors[this.current.comboIndex];

    hitObject.x = this.basePosition.x + Player.getLength(hitObject.x);
    hitObject.y = this.basePosition.y + Player.getLength(hitObject.y);
    if (hitObject.type.id === Slider.id)
    {
        for (var i = 1, l = hitObject.path.length; i < l; i++)
        {
            hitObject.path[i].x = this.basePosition.x + Player.getLength(hitObject.path[i].x);
            hitObject.path[i].y = this.basePosition.y + Player.getLength(hitObject.path[i].y);
        }
        hitObject.endX = this.basePosition.x + Player.getLength(hitObject.endX);
        hitObject.endY = this.basePosition.y + Player.getLength(hitObject.endY);
    }
};
Standard.draw = function(time)
{
    if (typeof this.current.first === 'undefined')
    {
        this.current.first = 0;
        this.current.last = -1;
        Player.ctx.shadowOffsetX = 0;
        Player.ctx.shadowOffsetY = 0;
        Player.ctx.font = this.font;
        Player.ctx.textAlign = 'center';
        Player.ctx.textBaseline = 'middle';
        Player.ctx.shadowColor = '#666';
        Player.ctx.lineCap = 'round';
        Player.ctx.lineJoin = 'round';
    }
    while (this.current.last + 1 < this.HitObjects.length &&
        time >= this.HitObjects[this.current.last + 1].time - this.approachTime)
    {
        this.current.last++;
    }
    for (var i = this.current.last; i >= this.current.first; i--)
    {
        var hitObject = this.HitObjects[i];
        if (time > (hitObject.endTime || hitObject.time) + 0.2)
        {
            this.current.first = i + 1;
            break;
        }

        hitObject.draw(time);
    }
};