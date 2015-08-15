function Standard()
{
    this.hitObjectTypes = Standard.hitObjectTypes;
    this.processHitObject = Standard.processHitObject;

    var ar = this.ApproachRate || this.OverallDifficulty;
    this.approachTime = ar < 5 ? 1800 - ar * 120 : 1200 - (ar - 5) * 150;
    this.circleDiameter = 104 - this.CircleSize * 8;
    this.stackOffset = this.circleDiameter * Standard.STACK_OFFSET_MODIFIER;

    this.onload = Standard.onload;
    this.draw = Standard.draw;
    this.processBG = Standard.processBG;
}
Standard.id = 0;
Standard.hitObjectTypes = {};
Beatmap.modes[Standard.id] = Standard;
//Standard.prototype = Object.create(Beatmap.prototype);
//Standard.prototype.costructor = Standard;
Standard.DEFAULT_COLORS = [
    'rgb(0,202,0)',
    'rgb(18,124,255)',
    'rgb(242,24,57)',
    'rgb(255,292,0)'
];
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
            this.Colors = Standard.DEFAULT_COLORS;
        }
        this.current.combo = 1;
        this.current.comboIndex = -1;
        this.current.setComboIndex = 1;
        if (typeof Spinner === 'undefined')
        {
            window.Spinner = {};
        }
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
};
Standard.STACK_LENIENCE = 3;
Standard.STACK_TIMEOUT = 1000;
Standard.STACK_OFFSET_MODIFIER = 0.05;
Standard.calcStacks = function()
{
    // https://gist.github.com/peppy/1167470
    if (typeof Slider === 'undefined')
    {
        window.Slider = {};
    }
    for (var i = this.HitObjects.length - 1; i > 0; i--)
    {
        var hitObject = this.HitObjects[i];
        if (hitObject.stack != 0 || hitObject.type.id == Spinner.id)
        {
            continue;
        }

        for (var n = i - 1; n >= 0; n--)
        {
            var hitObjectN = this.HitObjects[n];
            if (hitObjectN.type.id == Spinner.id)
            {
                continue;
            }

            if (hitObject.time - hitObjectN.endTime > Standard.STACK_TIMEOUT * this.StackLeniency)
            {
                break;
            }

            var distance = Math.hypot(hitObject.x - hitObjectN.endX, hitObject.y - hitObjectN.endY);
            if (hitObjectN.type.id == Slider.id &&
                distance < Standard.STACK_LENIENCE)
            {
                var offset = hitObject.stack - hitObjectN.stack + 1;
                for (var j = n + 1; j <= i; j++)
                {
                    var hitObjectJ = this.HitObjects[j];
                    if (Math.hypot(hitObjectJ.x - hitObjectN.endX, hitObjectJ.y - hitObjectN.endY) < Standard.STACK_LENIENCE)
                    {
                        hitObjectJ.stack -= offset;
                    }
                }
                break;
            }

            if (distance < Standard.STACK_LENIENCE)
            {
                hitObjectN.stack = hitObject.stack + 1;
                hitObject = hitObjectN;
            }
        }
    }
};
Standard.onload = function()
{
    Standard.calcStacks.call(this);

    this.circleRadius = this.circleDiameter / 2;
    this.circleBorder = this.circleRadius / 8;
    this.shadowBlur = this.circleRadius / 15;
    Player.ctx.shadowColor = '#666';
    Player.ctx.lineCap = 'round';
    Player.ctx.lineJoin = 'round';
    Player.ctx.font = this.circleRadius + 'px "Comic Sans MS", cursive, sans-serif';
    Player.ctx.textAlign = 'center';
    Player.ctx.textBaseline = 'middle';
    Player.ctx.translate((Beatmap.WIDTH - Beatmap.MAX_X) / 2, (Beatmap.HEIGHT - Beatmap.MAX_Y) / 2);
};
Standard.draw = function(time)
{
    if (typeof this.current.first === 'undefined')
    {
        this.current.first = 0;
        this.current.last = -1;
    }
    while (this.current.last + 1 < this.HitObjects.length &&
        time >= this.HitObjects[this.current.last + 1].time - this.approachTime)
    {
        this.current.last++;
    }
    for (var i = this.current.last; i >= this.current.first; i--)
    {
        var hitObject = this.HitObjects[i];
        if (time > hitObject.endTime + hitObject.type.FADE_OUT_TIME)
        {
            this.current.first = i + 1;
            break;
        }

        hitObject.draw(time);
    }
};