var MagnetManager = (function () {
    function MagnetManager(_magnets) {
        if (_magnets === void 0) { _magnets = new Array(); }
        this.magnets = _magnets;
    }
    MagnetManager.prototype.AddMagnetsFromAMGroupMeshes = function (_scene, _amModel) {
        this.CustomCreateMagnetPairs(_scene, _amModel);
        ////Get magnet meshes
        //var magnetGroups = new Array<AmGroup>();
        //_amModel.Groups.forEach(function (group, i, groups) {
        //    if (group.MagnetNegativePoleCp !== undefined) {
        //        magnetGroups.push(group);
        //    }
        //});
        ////Create MagnetPars
        //var twinCp: AmCP;
        //for (var i = 0; i < magnetGroups.length; i++) {
        //    var firstGroup = magnetGroups[i];
        //    twinCp = _amModel.OrderedCps[firstGroup.MagnetPositivePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
        //    var fPositivePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
        //    twinCp = _amModel.OrderedCps[firstGroup.MagnetNegativePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
        //    var fNegativePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
        //    for (var a = i + 1; a < magnetGroups.length; a++) {
        //        var secondGroup = magnetGroups[a];
        //        if (this.DoesItMatchesPreset(firstGroup, secondGroup)) {
        //            twinCp = _amModel.OrderedCps[secondGroup.MagnetPositivePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
        //            var sPositivePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
        //            twinCp = _amModel.OrderedCps[secondGroup.MagnetNegativePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
        //            var sNegativePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
        //            this.magnets.push(new MagnetPair(_scene, firstGroup.GroupMesh, secondGroup.GroupMesh,
        //                fPositivePosition, fNegativePosition, sPositivePosition, sNegativePosition));
        //        }
        //    }
        //}
    };
    MagnetManager.prototype.CustomCreateMagnetPairs = function (_scene, _amModel) {
        //Get magnet meshes
        var magnetGroups = new Array();
        _amModel.Groups.forEach(function (group, i, groups) {
            if (group.MagnetNegativePoleCp !== undefined) {
                magnetGroups.push(group);
            }
        });
        var weelMagnets = new Array();
        var staticMagnets = new Array();
        magnetGroups.forEach(function (group, i, groups) {
            if (group.PhysicsPropertyName == "weelmagnets") {
                weelMagnets.push(group);
            }
            else if (group.PhysicsPropertyName == "staticmagnets") {
                staticMagnets.push(group);
            }
        });
        //Create MagnetPars
        var twinCp;
        for (var i = 0; i < weelMagnets.length; i++) {
            var firstGroup = weelMagnets[i];
            twinCp = _amModel.OrderedCps[firstGroup.MagnetPositivePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
            var fPositivePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
            twinCp = _amModel.OrderedCps[firstGroup.MagnetNegativePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
            var fNegativePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
            for (var a = 0; a < staticMagnets.length; a++) {
                var secondGroup = staticMagnets[a];
                twinCp = _amModel.OrderedCps[secondGroup.MagnetPositivePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
                var sPositivePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
                twinCp = _amModel.OrderedCps[secondGroup.MagnetNegativePoleCp].GetBaseTwinCP(_amModel.OrderedCps);
                var sNegativePosition = new BABYLON.Vector3(twinCp.X, twinCp.Y, twinCp.Z);
                this.magnets.push(new MagnetPair(_scene, firstGroup.GroupMesh, secondGroup.GroupMesh, fPositivePosition, fNegativePosition, sPositivePosition, sNegativePosition));
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
        this.CreateLines([new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 1, 1)]); //if the second vector is also 0,0,0 the dashed lines will not show.
    }
    MagnetPair.PrepareLinesMaterials = function (scene) {
        MagnetPair.hundredMat = new BABYLON.Color3(0, 0, 1);
        MagnetPair.nightyMat = new BABYLON.Color3(0, 0, 0.9);
        MagnetPair.eightyMat = new BABYLON.Color3(0, 0, 0.8);
        MagnetPair.seventyMat = new BABYLON.Color3(0, 0, 0.7);
        MagnetPair.sixtyMat = new BABYLON.Color3(0, 0, 0.6);
        MagnetPair.fiftyMat = new BABYLON.Color3(0, 0, 0.5);
        MagnetPair.fourtyMat = new BABYLON.Color3(0, 0, 0.4);
        MagnetPair.thirtyMat = new BABYLON.Color3(0, 0, 0.3);
        MagnetPair.twentyMat = new BABYLON.Color3(0, 0, 0.2);
        MagnetPair.tenMat = new BABYLON.Color3(0, 0, 0.1);
        MagnetPair.zeroMat = new BABYLON.Color3(0, 0, 0);
    };
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
    MagnetPair.prototype.CreateLines = function (points) {
        this.lines = BABYLON.Mesh.CreateLines("lines", points, this.scene, true);
        //this.lines = BABYLON.Mesh.CreateDashedLines("lines", points, 0.5, 0.5, 10, this.scene, true);
    };
    MagnetPair.prototype.Update = function () {
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
        this.firstMesh.applyImpulse(direction.scale(0.005), startPolePos);
        var direction = fPAbsolute.subtract(sNAbsolute);
        this.secondMesh.applyImpulse(direction.scale(0.005), endPolePos);
        //update line material
        this.lines.color = MagnetPair.GetCorrespondetMat(BABYLON.Vector3.Distance(startPolePos, endPolePos));
        //update line
        this.lines = BABYLON.MeshBuilder.CreateLines(null, { points: [startPolePos, endPolePos], instance: this.lines }, this.scene);
        //this.lines = BABYLON.MeshBuilder.CreateDashedLines(null, { points: [startPolePos, endPolePos], instance: this.lines }, this.scene);
    };
    MagnetPair.GetCorrespondetMat = function (dist) {
        //treat 2 as the 100 away from other magnet
        //until we implement the magnet formula
        var percent = dist / 10;
        if (percent > 0.9) {
            return MagnetPair.hundredMat;
        }
        else if (percent > 0.8 && percent <= 0.9) {
            return MagnetPair.nightyMat;
        }
        else if (percent > 0.7 && percent <= 0.8) {
            return MagnetPair.eightyMat;
        }
        else if (percent > 0.6 && percent <= 0.7) {
            return MagnetPair.seventyMat;
        }
        else if (percent > 0.5 && percent <= 0.6) {
            return MagnetPair.sixtyMat;
        }
        else if (percent > 0.4 && percent <= 0.5) {
            return MagnetPair.fiftyMat;
        }
        else if (percent > 0.3 && percent <= 0.4) {
            return MagnetPair.fourtyMat;
        }
        else if (percent > 0.2 && percent <= 0.3) {
            return MagnetPair.thirtyMat;
        }
        else if (percent > 0.1 && percent <= 0.2) {
            return MagnetPair.twentyMat;
        }
        else if (percent > 0 && percent <= 0.1) {
            return MagnetPair.tenMat;
        }
        else if (percent <= 0) {
            return MagnetPair.zeroMat;
        }
    };
    return MagnetPair;
}());
//# sourceMappingURL=magnetmanager.js.map