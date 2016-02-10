function DonKat(data, beatmap)
{
    HitCircle.call(this, data, beatmap);

}
DonKat.prototype = Object.create(HitCircle.prototype, {
    don: {
        get: function()
        {
            return ~this.hitSound & 4;
        }
    },
    kai: {
        get: function()
        {
            return !this.don;
        }
    },
    dai: {
        get: function()
        {
            return this.hitSound & 8;
        }
    }
});
DonKat.prototype.constructor = DonKat;
DonKat.ID = 1;
Taiko.prototype.hitObjectTypes[DonKat.ID] = DonKat;
DonKat.prototype.draw = function(time, ctx)
{

};
