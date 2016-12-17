var MagnetManager = (function () {
    function MagnetManager(_magnets) {
        if (_magnets === void 0) { _magnets = new Array(); }
        this.magnets = _magnets;
    }
    MagnetManager.prototype.AddMagnetsFromAMGroupMeshes = function (_scene, _amModel) {
        //Get magnet meshes
        var magnetMeshes = new Array();
        _amModel.Groups.forEach(function (group, i, groups) {
            if (group.MagnetNegativePoleCp !== undefined) {
                magnetMeshes.push(group.GroupMesh);
            }
        });
        //Create MagnetManager s
        for (var i = 0; i < magnetMeshes.length; i++) {
            for (var a = i + 1; a < magnetMeshes.length; a++) {
                this.magnets.push(new Magnet(_scene, magnetMeshes[i], magnetMeshes[a]));
            }
        }
    };
    MagnetManager.prototype.UpdateMagnets = function () {
        this.magnets.forEach(function (currMagnet, i, magnets) {
            currMagnet.Update();
        });
        //var magnet7 = this.amModel.Groups[7].GroupMesh;
        //var factor = 4;
        //var s = BABYLON.MeshBuilder.CreateSphere("bigSphere", { diameter: 2, segments: 16 }, this.scene);
        //s.isVisible = true;
        //var scene = this.scene;
        //scene.registerBeforeRender(function () {
        //    var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (m) {
        //        return m === magnet7
        //    }, true);
        //    if (pickInfo.hit) {
        //        s.position = pickInfo.pickedPoint;
        //    //    contactPoints.forEach(function (c, idx) {
        //    //        if (s.intersectsPoint(c.position)) {
        //    //            c.physicsImpostor.applyImpulse(new BABYLON.Vector3(Math.random() * factor, Math.random() * factor, Math.random() * factor), c.position)
        //    //        }
        //    //    });
        //    }
        //})
    };
    return MagnetManager;
}());
var Magnet = (function () {
    function Magnet(_scene, firstMesh, secondMesh) {
        this.scene = _scene;
        this.firstMesh = firstMesh;
        this.secondMesh = secondMesh;
        this.CreateLine();
    }
    Magnet.prototype.CreateLine = function () {
        var mesh = new BABYLON.Mesh("magline", this.scene);
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = this.GetVertexPositions();
        vertexData.indices = [0, 1, 2, 0, 2, 3];
        vertexData.applyToMesh(mesh);
        this.line = mesh;
    };
    Magnet.prototype.UpdateLine = function () {
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = this.GetVertexPositions();
        vertexData.indices = [0, 1, 2, 0, 2, 3];
        vertexData.applyToMesh(this.line);
        //var positions = this.GetVertexPositions();
        //this.line.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false, false);
        //var normals = new Array<number>();
        //BABYLON.VertexData.ComputeNormals(positions, [0, 1, 2, 0, 2, 3], normals);
        //this.line.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals, false, false);
    };
    Magnet.prototype.GetVertexPositions = function () {
        var positions = new Array();
        positions.push(this.firstMesh.position.x);
        positions.push(this.firstMesh.position.y + 0.05);
        positions.push(this.firstMesh.position.z);
        positions.push(this.firstMesh.position.x);
        positions.push(this.firstMesh.position.y - 0.05);
        positions.push(this.firstMesh.position.z);
        positions.push(this.secondMesh.position.x);
        positions.push(this.secondMesh.position.y - 0.05);
        positions.push(this.secondMesh.position.z);
        positions.push(this.secondMesh.position.x);
        positions.push(this.secondMesh.position.y + 0.05);
        positions.push(this.secondMesh.position.z);
        return positions;
    };
    Magnet.prototype.Update = function () {
        this.UpdateLine();
    };
    return Magnet;
}());
//# sourceMappingURL=MagnetManager.js.map