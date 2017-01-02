var ConstraintsManager = (function () {
    function ConstraintsManager() {
        this.RotConstrX = new Array();
        this.RotConstrY = new Array();
        this.RotConstrZ = new Array();
    }
    ConstraintsManager.prototype.Update = function () {
        this.UpdateAllRotX();
        this.UpdateAllRotY();
        this.UpdateAllRotZ();
    };
    ConstraintsManager.prototype.UpdateAllRotX = function () {
        for (var i = 0; i < this.RotConstrX.length; i++) {
            var c = this.RotConstrX[i];
            var currAngles = c.Mesh.rotationQuaternion.toEulerAngles();
            if (currAngles.x < c.Min) {
                c.Mesh.rotation.x = c.Min - currAngles.x;
            }
            else if (currAngles.x > c.Max) {
                c.Mesh.rotation.x = -(currAngles.x - c.Max);
            }
        }
    };
    ConstraintsManager.prototype.UpdateAllRotY = function () {
        for (var i = 0; i < this.RotConstrY.length; i++) {
            var c = this.RotConstrX[i];
            var currAngles = c.Mesh.rotationQuaternion.toEulerAngles();
            if (currAngles.y < c.Min) {
                c.Mesh.rotation.y = c.Min - currAngles.y;
            }
            else if (currAngles.y > c.Max) {
                c.Mesh.rotation.y = -(currAngles.y - c.Max);
            }
        }
    };
    ConstraintsManager.prototype.UpdateAllRotZ = function () {
        for (var i = 0; i < this.RotConstrZ.length; i++) {
            var c = this.RotConstrX[i];
            var currAngles = c.Mesh.rotationQuaternion.toEulerAngles();
            if (currAngles.z < c.Min) {
                c.Mesh.rotation.z = c.Min - currAngles.z;
            }
            else if (currAngles.z > c.Max) {
                c.Mesh.rotation.z = -(currAngles.z - c.Max);
            }
        }
    };
    //max is maximun angle, min is minimum angle.
    ConstraintsManager.prototype.CreateRotationConstraintX = function (mesh, max, min) {
        this.RotConstrX.push(new RotationConstraint(mesh, max, min));
    };
    //max is maximun angle, min is minimum angle.
    ConstraintsManager.prototype.CreateRotationConstraintY = function (mesh, max, min) {
        this.RotConstrY.push(new RotationConstraint(mesh, max, min));
    };
    //max is maximun angle, min is minimum angle.
    ConstraintsManager.prototype.CreateRotationConstraintZ = function (mesh, max, min) {
        this.RotConstrZ.push(new RotationConstraint(mesh, max, min));
    };
    return ConstraintsManager;
}());
var RotationConstraint = (function () {
    function RotationConstraint(mesh, max, min) {
        this.Mesh = mesh;
        this.Max = max * Math.PI / 180.0;
        this.Min = min * Math.PI / 180.0;
    }
    return RotationConstraint;
}());
//# sourceMappingURL=constraintsmanager.js.map