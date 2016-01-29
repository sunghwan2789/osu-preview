function Standard(osu)
{
    Beatmap.call(this, osu);



    if (this.Colors.length)
    {
        this.Colors.push(this.Colors.shift());
    }
    else
    {
        this.Colors = Standard.DEFAULT_COLORS;
    }
    this.tmp.combo = 1;
    this.tmp.comboIndex = -1;
    this.tmp.setComboIndex = 1;


    for (var i = 0; i < this.HitObjects.length; i++)
    {
        var hitObject = this.HitObjects[i];
        if (hitObject instanceof Spinner)
        {
            this.tmp.setComboIndex = 1;
        }
        else if (hitObject.newCombo || this.tmp.setComboIndex)
        {
            this.tmp.combo = 1;
            this.tmp.comboIndex = (
                (this.tmp.comboIndex + 1) + hitObject.comboSkip
            ) % this.Colors.length;
            this.tmp.setComboIndex = 0;
        }
        hitObject.combo = this.tmp.combo++;
        hitObject.color = this.Colors[this.tmp.comboIndex];
    }


    // calculate stacks
    // https://gist.github.com/peppy/1167470
    for (var i = this.HitObjects.length - 1; i > 0; i--)
    {
        var hitObject = this.HitObjects[i];
        if (hitObject.stack != 0 || hitObject instanceof Spinner)
        {
            continue;
        }

        for (var n = i - 1; n >= 0; n--)
        {
            var hitObjectN = this.HitObjects[n];
            if (hitObjectN instanceof Spinner)
            {
                continue;
            }

            if (hitObject.time - hitObjectN.endTime > this.approachTime * this.StackLeniency)
            {
                break;
            }

            if (hitObject.position.distanceTo(hitObjectN.endPosition) < Standard.STACK_LENIENCE)
            {
                if (hitObjectN instanceof Slider)
                {
                    var offset = hitObject.stack - hitObjectN.stack + 1;
                    for (var j = n + 1; j <= i; j++)
                    {
                        var hitObjectJ = this.HitObjects[j];
                        if (hitObjectJ.position.distanceTo(hitObjectN.endPosition) < Standard.STACK_LENIENCE)
                        {
                            hitObjectJ.stack -= offset;
                        }
                    }
                    break;
                }

                hitObjectN.stack = hitObject.stack + 1;
                hitObject = hitObjectN;
            }
        }
    }

    this.circleRadius = this.circleDiameter / 2;
    this.circleBorder = this.circleRadius / 8;
    this.shadowBlur = this.circleRadius / 15;
}
Standard.prototype = Object.create(Beatmap.prototype);
Standard.prototype.costructor = Standard;
Standard.prototype.hitObjectTypes = {};
Standard.ID = 0;
Beatmap.modes[Standard.ID] = Standard;
Standard.DEFAULT_COLORS = [
    'rgb(0,202,0)',
    'rgb(18,124,255)',
    'rgb(242,24,57)',
    'rgb(255,292,0)'
];
Standard.STACK_LENIENCE = 3;
Object.defineProperties(Standard.prototype, {
    approachTime: {
        get: function()
        {
            var ar = this.ApproachRate || this.OverallDifficulty;
            return ar < 5 ? 1800 - ar * 120 : 1200 - (ar - 5) * 150;
        }
    },
    // https://github.com/itdelatrisu/opsu/commit/8892973d98e04ebaa6656fe2a23749e61a122705
    circleDiameter: {
        get: function()
        {
            return 108.848 - this.CircleSize * 8.9646;
        }
    },
    stackOffset: {
        get: function()
        {
            return this.circleDiameter / 20;
        }
    }
});
Standard.prototype.update = function(ctx)
{
    ctx.shadowColor = '#666';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.font = this.circleRadius + 'px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate((Beatmap.WIDTH - Beatmap.MAX_X) / 2, (Beatmap.HEIGHT - Beatmap.MAX_Y) / 2);
};
Standard.prototype.draw = function(time, ctx)
{
    if (typeof this.tmp.first == 'undefined')
    {
        this.tmp.first = 0;
        this.tmp.last = -1;
    }

    while (this.tmp.first < this.HitObjects.length)
    {
        var hitObject = this.HitObjects[this.tmp.first];
        if (time <= hitObject.endTime + hitObject.__proto__.constructor.FADE_OUT_TIME)
        {
            break;
        }
        this.tmp.first++;
    }
    while (this.tmp.last + 1 < this.HitObjects.length &&
        time >= this.HitObjects[this.tmp.last + 1].time - this.approachTime)
    {
        this.tmp.last++;
    }
    for (var i = this.tmp.last; i >= this.tmp.first; i--)
    {
        var hitObject = this.HitObjects[i];
        if (time > hitObject.endTime + hitObject.__proto__.constructor.FADE_OUT_TIME)
        {
            continue;
        }
        hitObject.draw(time, ctx);
    }
};
