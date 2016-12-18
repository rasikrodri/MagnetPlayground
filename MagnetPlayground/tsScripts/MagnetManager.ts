class MagnetManager {
    private magnets: Array<MagnetPair>
    constructor(_magnets: Array<MagnetPair> = new Array<MagnetPair>()) {
        this.magnets = _magnets;
    }

    AddMagnetsFromAMGroupMeshes(_scene: BABYLON.Scene, _amModel: AMModel) {
        //Get magnet meshes
        var magnetGroups = new Array<AmGroup>();
        _amModel.Groups.forEach(function (group, i, groups) {
            if (group.MagnetNegativePoleCp !== undefined) {
                magnetGroups.push(group);
            }
        });

        //Create MagnetPars
        var twinCp: AmCP;
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
                this.magnets.push(new MagnetPair(_scene, firstGroup.GroupMesh, secondGroup.GroupMesh,
                    fPositivePosition, fNegativePosition, sPosiivePosition, sNegativePosition));
            }
        }
    }

    UpdateMagnets() {
        this.magnets.forEach(function (currMagnet, i, magnets) {
            currMagnet.Update();
        });
    }
}

class MagnetPair {
    private scene: BABYLON.Scene;
    private firstMesh: BABYLON.Mesh;//first magnet
    private fPosMesh: BABYLON.Mesh;//first magnet positive mesh
    private fNegMesh: BABYLON.Mesh;//first magnet negative mesh
    private secondMesh: BABYLON.Mesh;//second magnet
    private sPosMesh: BABYLON.Mesh;//second magnet positive mesh
    private sNegMesh: BABYLON.Mesh;//second magnet negative mesh
    private lines: BABYLON.LinesMesh;//line from first magnet to second magnet
    constructor(_scene: BABYLON.Scene, firstMesh: BABYLON.Mesh, secondMesh: BABYLON.Mesh,
        fPositive: BABYLON.Vector3, fNegative: BABYLON.Vector3, sPositive: BABYLON.Vector3, sNegative: BABYLON.Vector3) {
        this.scene = _scene;
        this.firstMesh = firstMesh;
        this.secondMesh = secondMesh;
        this.CreatePolesMeshes(fPositive, fNegative, sPositive, sNegative);
        this.CreateLines();
    }
    private CreatePolesMeshes(fPositive: BABYLON.Vector3, fNegative: BABYLON.Vector3,
        sPositive: BABYLON.Vector3, sNegative: BABYLON.Vector3) {
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
            this.fPosMesh = children[0] as BABYLON.Mesh;
            this.fNegMesh = children[1] as BABYLON.Mesh;
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
            this.sPosMesh = children[0] as BABYLON.Mesh;
            this.sNegMesh = children[1] as BABYLON.Mesh;
        }
    }
    private CreateLines() {
        this.lines = BABYLON.Mesh.CreateLines("lines", this.CalculateLinePosition(), this.scene, true);
        //this.lines = BABYLON.Mesh.CreateDashedLines("lines", [this.firstMesh.position, this.secondMesh.position], 0.5, 0.5, 10, this.scene, true);
    }
    private UpdateLine() {
        this.lines = BABYLON.MeshBuilder.CreateLines(null, { points: this.CalculateLinePosition(), instance: this.lines }, this.scene);
        //this.lines = BABYLON.MeshBuilder.CreateDashedLines(null, { points: [this.firstMesh.position, this.secondMesh.position], instance: this.lines }, this.scene);
    }
    CalculateLinePosition(): BABYLON.Vector3[] {
        var fPAbsolute = this.fPosMesh.getAbsolutePosition();
        var fNAbsolute = this.fNegMesh.getAbsolutePosition();
        var sPAbsolute = this.sPosMesh.getAbsolutePosition();
        var sNAbsolute = this.sNegMesh.getAbsolutePosition();
        var posToSecond = BABYLON.Vector3.Distance(fPAbsolute, this.secondMesh.getAbsolutePosition());
        var negToSecond = BABYLON.Vector3.Distance(fNAbsolute, this.secondMesh.getAbsolutePosition());
        var posToFirst = BABYLON.Vector3.Distance(sPAbsolute, this.firstMesh.getAbsolutePosition());
        var negToFirst = BABYLON.Vector3.Distance(sNAbsolute, this.firstMesh.getAbsolutePosition());
        var startPolePos: BABYLON.Vector3;
        var endPolePos: BABYLON.Vector3;

        if (posToSecond < negToSecond) {
            startPolePos = fPAbsolute;
        }
        else {
            startPolePos = fNAbsolute;
        }

        if (posToFirst < negToFirst) {
            endPolePos = sPAbsolute
        }
        else {
            endPolePos = sNAbsolute
        }

        this.firstMesh.app

        return [startPolePos, endPolePos];
    }
    Update() {
        this.UpdateLine();
    }
}