class ConstraintsManager {
    private RotConstrX: Array<RotationConstraint> = new Array<RotationConstraint>();
    private RotConstrY: Array<RotationConstraint> = new Array<RotationConstraint>();
    private RotConstrZ: Array<RotationConstraint> = new Array<RotationConstraint>();

    public Update() {
        this.UpdateAllRotX();
        this.UpdateAllRotY();
        this.UpdateAllRotZ();
    }
    private UpdateAllRotX() {
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
    }
    private UpdateAllRotY() {
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
    }
    private UpdateAllRotZ() {
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
    }

    //max is maximun angle, min is minimum angle.
    public CreateRotationConstraintX(mesh: BABYLON.Mesh, max: number, min: number) {
        this.RotConstrX.push(new RotationConstraint(mesh, max, min));
    }
    //max is maximun angle, min is minimum angle.
    public CreateRotationConstraintY(mesh: BABYLON.Mesh, max: number, min: number) {
        this.RotConstrY.push(new RotationConstraint(mesh, max, min));
    }
    //max is maximun angle, min is minimum angle.
    public CreateRotationConstraintZ(mesh: BABYLON.Mesh, max: number, min: number) {
        this.RotConstrZ.push(new RotationConstraint(mesh, max, min));
    }
}

class RotationConstraint {
    Mesh: BABYLON.Mesh;
    Max: number;
    Min: number;
    constructor(mesh: BABYLON.Mesh, max: number, min: number) {
        this.Mesh = mesh;
        this.Max = max * Math.PI / 180.0;
        this.Min = min * Math.PI / 180.0;
    }
}
