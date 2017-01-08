var MagnetManager = (function () {
    function MagnetManager(_magnets) {
        if (_magnets === void 0) { _magnets = new Array(); }
        this.magnets = _magnets;
    }
    MagnetManager.prototype.AddMagnetsFromAMGroupMeshes = function (_scene, _amModel) {
        //Get magnet meshes
        var magnetGroups = new Array();
        _amModel.Groups.forEach(function (group, i, groups) {
            if (group.MagnetNegativePoleCp !== undefined) {
                magnetGroups.push(group);
            }
        });
        //Create MagnetPars
        var twinCp;
        for (var i = 0; i < magnetGroups.length; i++) {
            var firstGroup = magnetGroups[i];
            twinCp = _amModel.OrderedCps[firstGroup.MagnetPositivePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
            var fPositivePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
            twinCp = _amModel.OrderedCps[firstGroup.MagnetNegativePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
            var fNegativePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
            for (var a = i + 1; a < magnetGroups.length; a++) {
                var secondGroup = magnetGroups[a];
                twinCp = _amModel.OrderedCps[secondGroup.MagnetPositivePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
                var sPosiivePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
                twinCp = _amModel.OrderedCps[secondGroup.MagnetNegativePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
                var sNegativePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
                this.magnets.push(new MagnetPair(_scene, firstGroup.GroupMesh, secondGroup.GroupMesh, fPositivePosition, fNegativePosition, sPosiivePosition, sNegativePosition));
            }
        }
    };
    MagnetManager.prototype.UpdateMagnets = function () {
        this.magnets.forEach(function (currMagnet, i, magnets) {
            currMagnet.Update();
        });
    };
    return MagnetManager;
}());
var MagnetPair = (function () {
    function MagnetPair(_scene, firstMesh, secondMesh, fPositive, fNegative, sPositive, sNegative) {
        this.scene = _scene;
        this.firstMesh = firstMesh;
        this.secondMesh = secondMesh;
        this.CreatePolesMeshes(fPositive, fNegative, sPositive, sNegative);
        this.CreateLines();
    }
    MagnetPair.prototype.CreatePolesMeshes = function (fPositive, fNegative, sPositive, sNegative) {
        var redPositive = new BABYLON.StandardMaterial("redPositive", this.scene);
        redPositive.diffuseColor = new BABYLON.Color3(1, 0, 0);
        var blackNegative = new BABYLON.StandardMaterial("blackNegative", this.scene);
        blackNegative.diffuseColor = new BABYLON.Color3(0, 0, 0);
        var segments = 0.5;
        var diameter = 0.2;
        var visible = true;
        if (this.firstMesh.getChildMeshes().length === 0) {
            this.fPosMesh = BABYLON.Mesh.CreateSphere("pospole", segments, diameter, this.scene, false);
            this.fPosMesh.material = redPositive;
            this.fPosMesh.isVisible = visible;
            this.fPosMesh.parent = this.firstMesh;
            this.fPosMesh.position = fPositive;
            this.fNegMesh = BABYLON.Mesh.CreateSphere("negpole", segments, diameter, this.scene, false);
            this.fNegMesh.material = blackNegative;
            this.fNegMesh.isVisible = visible;
            this.fNegMesh.parent = this.firstMesh;
            this.fNegMesh.position = fNegative;
        }
        else {
            var children = this.firstMesh.getChildMeshes();
            this.fPosMesh = children[0];
            this.fNegMesh = children[1];
        }
        if (this.secondMesh.getChildMeshes().length === 0) {
            this.sPosMesh = BABYLON.Mesh.CreateSphere("pospole", segments, diameter, this.scene, false);
            this.sPosMesh.material = redPositive;
            this.sPosMesh.isVisible = visible;
            this.sPosMesh.parent = this.secondMesh;
            this.sPosMesh.position = sPositive;
            this.sNegMesh = BABYLON.Mesh.CreateSphere("negpole", segments, diameter, this.scene, false);
            this.sNegMesh.material = blackNegative;
            this.sNegMesh.isVisible = visible;
            this.sNegMesh.parent = this.secondMesh;
            this.sNegMesh.position = sNegative;
        }
        else {
            var children = this.secondMesh.getChildMeshes();
            this.sPosMesh = children[0];
            this.sNegMesh = children[1];
        }
    };
    MagnetPair.prototype.CreateLines = function () {
        this.lines = BABYLON.Mesh.CreateLines("lines", this.CalculateLinePosition(), this.scene, true);
        //this.lines = BABYLON.Mesh.CreateDashedLines("lines", [this.firstMesh.position, this.secondMesh.position], 0.5, 0.5, 10, this.scene, true);
    };
    MagnetPair.prototype.UpdateLine = function () {
        this.lines = BABYLON.MeshBuilder.CreateLines(null, { points: this.CalculateLinePosition(), instance: this.lines }, this.scene);
        //this.lines = BABYLON.MeshBuilder.CreateDashedLines(null, { points: [this.firstMesh.position, this.secondMesh.position], instance: this.lines }, this.scene);
    };
    MagnetPair.prototype.CalculateLinePosition = function () {
        var fPAbsolute = this.fPosMesh.getAbsolutePosition();
        var fNAbsolute = this.fNegMesh.getAbsolutePosition();
        var sPAbsolute = this.sPosMesh.getAbsolutePosition();
        var sNAbsolute = this.sNegMesh.getAbsolutePosition();
        var posToSecond = BABYLON.Vector3.Distance(fPAbsolute, this.secondMesh.getAbsolutePosition());
        var negToSecond = BABYLON.Vector3.Distance(fNAbsolute, this.secondMesh.getAbsolutePosition());
        var posToFirst = BABYLON.Vector3.Distance(sPAbsolute, this.firstMesh.getAbsolutePosition());
        var negToFirst = BABYLON.Vector3.Distance(sNAbsolute, this.firstMesh.getAbsolutePosition());
        var startPolePos;
        var endPolePos;
        if (posToSecond < negToSecond) {
            startPolePos = fPAbsolute;
        }
        else {
            startPolePos = fNAbsolute;
        }
        if (posToFirst < negToFirst) {
            endPolePos = sPAbsolute;
        }
        else {
            endPolePos = sNAbsolute;
        }
        //the force is the direction, contact point is wherein the object to apply that force
        //calculate direction of force towards the secondMesh negative pole, etc.
        var direction = sNAbsolute.subtract(fPAbsolute);
        this.firstMesh.applyImpulse(direction.scale(0.0005), startPolePos);
        var direction = fPAbsolute.subtract(sNAbsolute);
        this.secondMesh.applyImpulse(direction.scale(0.0005), endPolePos);
        return [startPolePos, endPolePos];
    };
    MagnetPair.prototype.Update = function () {
        this.UpdateLine();
    };
    return MagnetPair;
}());
//# sourceMappingURL=magnetmanager.js.map