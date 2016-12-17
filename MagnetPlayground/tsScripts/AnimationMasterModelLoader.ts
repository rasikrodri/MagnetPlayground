///Only mesh groups will be loaded if at least one is found,
///otherwise the whole model will be loaded

class AnimationMasterModelLoader {
    private scene: BABYLON.Scene;
    private amModel: AMModel;

    static LoadMeshIntoScene(sceneCreator: BABYLON.Scene, amModel: AMModel) {
        var meshLoader = new AnimationMasterModelLoader(sceneCreator, amModel)
        meshLoader.CreateMeshInScene();
    }

    constructor(scene: BABYLON.Scene, amModel: AMModel) {
        this.scene = scene;
        this.amModel = amModel;
    }

    private CreateMeshInScene() {
        if (this.amModel.Groups.some(function (e): boolean { if (e.IsMesh === true) { return true; } })) {
            this.BuildMeshFromGroups()
            //this.AddMagnetsCode()
        }
        else {
            this.BuildPolygonMeshFromAmModel();
        }
    }
    private amModelNumber: number = 0;
    private BuildPolygonMeshFromAmModel() {
        this.amModelNumber += 1;
        var mesh = new BABYLON.Mesh("amModel-" + this.amModelNumber, this.scene);

        ////sceneCreator.shadowGenerator.getShadowMap().renderList.push(amModel);
        //amModel.receiveShadows = true;

        //var mat = new BABYLON.StandardMaterial(amModel.name + "Mat", sceneCreator.scene);
        //mat.diffuseColor = new BABYLON.Color3(.1, .5, .5);
        ////mat.backFaceCulling = false;
        //amModel.material = mat;

        //count the amount of cps
        var cpsCount = 0;
        for (var i = 0; i < this.amModel.OrderedCps.length; i++) {
            if (this.amModel.OrderedCps[i] !== null) {
                cpsCount += 1;
            }
        }
        //Create vertex array
        var positions = new Array<number>();//every 3 entries is x, y z of a vertex/cp
        var indices = [];//every index point to a vertex in variable "positions". Every 3 indexes equals a 3 vertex polygon/face/patch
        //var normalsArray = new Array<number>();
        var currentVertexIndex = 0;
        var cp: AmCP;
        var baseTweenCp: AmCP;
        for (var p = 0; p < this.amModel.Patches.length; p++) {
            var patch = this.amModel.Patches[p]

            for (var c = 0; c < patch.Cps.length; c++) {
                cp = patch.Cps[c];
                baseTweenCp = cp.getBaseTwinCP(this.amModel.OrderedCps);
                if (baseTweenCp.VertexIndex === -1) {
                    baseTweenCp.VertexIndex = currentVertexIndex;
                    currentVertexIndex += 1;

                    positions.push(baseTweenCp.X);
                    positions.push(baseTweenCp.Y);
                    positions.push(baseTweenCp.Z);
                }
                cp.VertexIndex = baseTweenCp.VertexIndex;
            }

            var normal: AmNormal;
            if (patch.Cps.length === 3) {
                indices.push(patch.Cps[0].VertexIndex);
                //normal = patch.Normals[0]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[1].VertexIndex);
                //normal = patch.Normals[1]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[2].VertexIndex);
                //normal = patch.Normals[2]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
            } else if (patch.Cps.length === 4) {
                indices.push(patch.Cps[0].VertexIndex);
                //normal = patch.Normals[0]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[1].VertexIndex);
                //normal = patch.Normals[1]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[2].VertexIndex);
                //normal = patch.Normals[2]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);

                indices.push(patch.Cps[0].VertexIndex);
                //normal = patch.Normals[0]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[2].VertexIndex);
                //normal = patch.Normals[2]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[3].VertexIndex);
                //normal = patch.Normals[3]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
            } else if (patch.Cps.length === 5) {
                indices.push(patch.Cps[0].VertexIndex);
                //normal = patch.Normals[0]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[1].VertexIndex);
                //normal = patch.Normals[1]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[2].VertexIndex);
                //normal = patch.Normals[2]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);

                indices.push(patch.Cps[0].VertexIndex);
                //normal = patch.Normals[0]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[2].VertexIndex);
                //normal = patch.Normals[2]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[3].VertexIndex);
                //normal = patch.Normals[3]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);

                indices.push(patch.Cps[0].VertexIndex);
                //normal = patch.Normals[0]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[3].VertexIndex);
                //normal = patch.Normals[3]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
                indices.push(patch.Cps[4].VertexIndex);
                //normal = patch.Normals[4]; normalsArray.push(normal.X); normalsArray.push(normal.Y); normalsArray.push(normal.Z);
            }
        }


        //Empty array to contain calculated values or normals added
        var normalsArray = [];
        //Calculations of normals added
        BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);

        var vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normalsArray;
        vertexData.applyToMesh(mesh);

        ////Convert it to flat shaded if you wan it flat shaded
        ////It will recreate the vertexbuffer to make all faces have their own vertexes instead of charing them
        //amModel.convertToFlatShadedMesh()

        //var sphere = BABYLON.Mesh.CreateSphere("sphere", 24, 15, sceneCreator.scene);
        //sphere.position = new BABYLON.Vector3(15, 5, 0);


        //var box = BABYLON.Mesh.CreateBox("boxNormals", 10, sceneCreator.scene);
        //box.position = new BABYLON.Vector3(15, 5, 0);
    }

    private BuildMeshFromGroups() {
        for (var i = 0; i < this.amModel.Groups.length; i++) {
            var groupMesh = this.amModel.Groups[i];
            if (groupMesh.IsMesh) {
                if (groupMesh.Patches.length > 0) {
                    this.BuildPolygonMeshFromAmModelFromGroupsMesh(groupMesh);
                }
            }
        }

        //now apply physics to the group meshes
        this.AssignPhysicsPropertiesToGroupMeshes();
        this.AddJoints();
        //addJoints(groups);       
    }
    private BuildPolygonMeshFromAmModelFromGroupsMesh(groupMesh: AmGroup) {
        groupMesh.GroupMesh = new BABYLON.Mesh(groupMesh.Name, this.scene);
        //groupMesh.GroupMesh.showBoundingBox = true

        //sceneCreator.shadowGenerator.getShadowMap().renderList.push(groupMesh.GroupMesh);
        //groupMesh.GroupMesh.receiveShadows = true;

        var mat = new BABYLON.StandardMaterial(groupMesh.Name, this.scene);
        mat.diffuseColor = new BABYLON.Color3(.1, .5, .5);
        //mat.backFaceCulling = false;
        groupMesh.GroupMesh.material = mat;

        //Clean cp and base cp "VertexIndex" so that this group is treated as new
        for (var i = 0; i < groupMesh.Patches.length; i++) {
            for (var c = 0; c < groupMesh.Patches[i].Cps.length; c++) {
                groupMesh.Patches[i].Cps[c].VertexIndex = -1;
                groupMesh.Patches[i].Cps[c].getBaseTwinCP(this.amModel.OrderedCps).VertexIndex = -1;
            }
        }

        var positions = this.GetMeshBuildVertexArrayForGroupMesh(groupMesh, this.amModel.OrderedCps);

        //Create faces from patches
        var indices = [];//every index point to a vertex in variable "positions". Every 3 indexes equals a 3 vertex polygon/face/patch
        var patch: AMPatch;
        for (var i = 0; i < groupMesh.Patches.length; i++) {
            patch = groupMesh.Patches[i];
            if (patch.Cps.length === 3) {
                for (var c = 0; c < patch.Cps.length; c++) {
                    indices.push(patch.Cps[c].VertexIndex);
                }
            } else if (patch.Cps.length === 4) {
                indices.push(patch.Cps[0].VertexIndex);
                indices.push(patch.Cps[1].VertexIndex);
                indices.push(patch.Cps[2].VertexIndex);

                indices.push(patch.Cps[0].VertexIndex);
                indices.push(patch.Cps[2].VertexIndex);
                indices.push(patch.Cps[3].VertexIndex);
            } else if (patch.Cps.length === 5) {
                indices.push(patch.Cps[0].VertexIndex);
                indices.push(patch.Cps[1].VertexIndex);
                indices.push(patch.Cps[2].VertexIndex);

                indices.push(patch.Cps[0].VertexIndex);
                indices.push(patch.Cps[2].VertexIndex);
                indices.push(patch.Cps[3].VertexIndex);

                indices.push(patch.Cps[0].VertexIndex);
                indices.push(patch.Cps[3].VertexIndex);
                indices.push(patch.Cps[4].VertexIndex);
            }
        }

        //var normalsArray = new Array<number>(normals.length * 3);
        //var normalIndex = 0;
        //var normal: AmNormals;
        //for (var i = 0; i < normals.length; i++) {
        //    normal = normals[i];
        //    normalsArray[normalIndex] = normal.X;
        //    normalIndex += 1;
        //    normalsArray[normalIndex] = normal.Y;
        //    normalIndex += 1;
        //    normalsArray[normalIndex] = normal.Z;
        //    normalIndex += 1;
        //}

        //Empty array to contain calculated values or normals added
        var normalsArray = [];
        //Calculations of normals added
        BABYLON.VertexData.ComputeNormals(positions, indices, normalsArray);

        var vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normalsArray;
        vertexData.applyToMesh(groupMesh.GroupMesh);

        ////Convert it to flat shaded if you wan it flat shaded
        ////It will recreate the vertexbuffer to make all faces have their own vertexes instead of charing them
        //amModel.convertToFlatShadedMesh()
    }
    private GetMeshBuildVertexArrayForGroupMesh(groupMesh: AmGroup, cps: Array<AmCP>) {
        //Get the front most back most, left, right, bottom and up most cps to calculate the center
        //and to place the whole mesh as it it's center is in x, y, z = 0
        var topMostCp = groupMesh.Patches[0].Cps[0].getBaseTwinCP(cps);
        var bottomMostCp = topMostCp;
        var leftMostCp = topMostCp;
        var rigthMostCp = topMostCp;
        var frontMostCp = topMostCp;
        var backMostCp = topMostCp;
        for (var i = 0; i < groupMesh.Patches.length; i++) {
            for (var c = 0; c < groupMesh.Patches[i].Cps.length; c++) {
                var baseCp = groupMesh.Patches[i].Cps[c].getBaseTwinCP(cps);
                if (topMostCp.Y < baseCp.Y) { topMostCp = baseCp; }
                if (bottomMostCp.Y > baseCp.Y) { bottomMostCp = baseCp; }
                if (leftMostCp.X < baseCp.X) { leftMostCp = baseCp; }
                if (rigthMostCp.X > baseCp.X) { rigthMostCp = baseCp; }
                if (frontMostCp.Z < baseCp.Z) { frontMostCp = baseCp; }
                if (backMostCp.Z > baseCp.Z) { backMostCp = baseCp; }
            }
        }

        groupMesh.LeftMostCp = leftMostCp;
        groupMesh.RightMostCp = rigthMostCp;
        groupMesh.FrontMostCp = frontMostCp;
        groupMesh.BackMostCp = backMostCp;
        groupMesh.TopMostCp = topMostCp;
        groupMesh.BottomMostCp = bottomMostCp;

        //calculate the center.position
        var meshCenter = new BABYLON.Vector3(
            leftMostCp.X - ((leftMostCp.X - rigthMostCp.X) / 2),
            topMostCp.Y - ((topMostCp.Y - bottomMostCp.Y) / 2),
            frontMostCp.Z - ((frontMostCp.Z - backMostCp.Z) / 2));
        groupMesh.GroupMeshPosition = meshCenter;

        //Add cp coordinates
        var positions = new Array<number>();//every 3 entries is x, y z of a vertex/cp
        var currentVertexIndex = 0;
        var cp: AmCP;
        for (var i = 0; i < groupMesh.Patches.length; i++) {
            for (var c = 0; c < groupMesh.Patches[i].Cps.length; c++) {
                cp = groupMesh.Patches[i].Cps[c];

                var baseCp = cp.getBaseTwinCP(cps);
                if (baseCp.VertexIndex === -1) {
                    cp.VertexIndex = currentVertexIndex;
                    baseCp.VertexIndex = currentVertexIndex;
                    currentVertexIndex += 1;

                    positions.push(baseCp.X - meshCenter.x);
                    positions.push(baseCp.Y - meshCenter.y);
                    positions.push(baseCp.Z - meshCenter.z);
                }
                else {
                    cp.VertexIndex = baseCp.VertexIndex;
                }
            }
        }

        return positions;
    }
    private AssignPhysicsPropertiesToGroupMeshes() {
        var meshGroups = new Array<AmGroup>();
        for (var i = 0; i < this.amModel.Groups.length; i++) {
            var groupMesh = this.amModel.Groups[i];
            if (groupMesh.IsMesh) {
                meshGroups.push(groupMesh);
            }
        }

        //apply physics settings
        for (var i = 0; i < meshGroups.length; i++) {
            var group = meshGroups[i];
            //Make sure that it has at least one physics property assigned, otherwise skip it
            if (group.Mass !== undefined || group.Friction !== undefined || group.Restitution !== undefined || group.ImpostorType !== undefined) {
                var mass = (group.Mass === undefined) ? 1 : group.Mass;
                var friction = (group.Friction === undefined) ? 0.2 : group.Friction;
                var restitution = (group.Restitution === undefined) ? 0.1 : group.Restitution;
                var impostorType = (group.ImpostorType === undefined) ? BABYLON.PhysicsImpostor.BoxImpostor : group.ImpostorType;

                group.GroupMesh.position = group.GroupMeshPosition;
                group.GroupMesh.physicsImpostor = new BABYLON.PhysicsImpostor(meshGroups[i].GroupMesh, impostorType, { mass: mass, friction: friction, restitution: restitution }, this.scene);
            }
            else {
                //move the object to original position
                group.GroupMesh.position = group.GroupMeshPosition;
            }
        }
    }
    private AddJoints() {
        var presetJointProcessor = new JointPresetProcessor();

        for (var i = 0; i < this.amModel.Groups.length; i++) {
            var g = this.amModel.Groups[i];
            if (g.JointPropertyName !== undefined) {
                var amProperty = presetJointProcessor.GetAmJointPropertyByName(this.amModel.UserProperties, g.JointPropertyName);
                switch (amProperty.JointPreset) {
                    case JointPreset.RIPZ:
                        var otherMesh = presetJointProcessor.GetGroupByName(this.amModel.Groups, amProperty.OnMesh).GroupMesh;
                        if (otherMesh === undefined) {
                            throw ("Cannot apply joint 'RIPZ' because " + amProperty.OnMesh + " was not found");
                        }
                        presetJointProcessor.SetJointRotateInPlaceZ(g.GroupMesh, otherMesh);
                        break;
                    case JointPreset.JoinWith:
                        var otherMesh = presetJointProcessor.GetGroupByName(this.amModel.Groups, amProperty.OnMesh).GroupMesh;
                        if (otherMesh === undefined) {
                            throw ("Cannot apply joint 'RIPZ' because " + amProperty.OnMesh + " was not found");
                        }
                        presetJointProcessor.SetJointJoinWith(g.GroupMesh, otherMesh);
                        break;
                    default:
                        throw ("Not implemented");
                }
            }
        }
    }

//    private AddMagnetsCode() {

//        //Get magnet meshes
//        var magnetMeshes = new Array<BABYLON.Mesh>();
//        this.amModel.Groups.forEach(function (group, i, groups) {
//            if (group.MagnetNegativePoleCp !== undefined) {
//                magnetMeshes.push(group.GroupMesh);
//            }
//        });

//        //Create MagnetManager s
//        var magnetManagers = new Array<MagnetManager>();
//        for (var i = 0; i < magnetMeshes.length; i++) {
//            for (var a = i + 1; a < magnetMeshes.length; a++) {
//                magnetManagers.push(new MagnetManager(this.scene, magnetMeshes[i], magnetMeshes[a]));
//            }
//        }

//        var scene = this.scene;
//        scene.registerBeforeRender(function () {
//            magnetManagers.forEach(function (magnetManager, i, magnetManagers) {
//                magnetManager.Update();
//            });
//        })


//        //var magnet7 = this.amModel.Groups[7].GroupMesh;
//        //var factor = 4;
//        //var s = BABYLON.MeshBuilder.CreateSphere("bigSphere", { diameter: 2, segments: 16 }, this.scene);
//        //s.isVisible = true;

//        //var scene = this.scene;
//        //scene.registerBeforeRender(function () {
//        //    var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (m) {
//        //        return m === magnet7
//        //    }, true);
//        //    if (pickInfo.hit) {
//        //        s.position = pickInfo.pickedPoint;
//        //    //    contactPoints.forEach(function (c, idx) {
//        //    //        if (s.intersectsPoint(c.position)) {
//        //    //            c.physicsImpostor.applyImpulse(new BABYLON.Vector3(Math.random() * factor, Math.random() * factor, Math.random() * factor), c.position)
//        //    //        }
//        //    //    });

//        //    }
//        //})
//    }
}

//class MagnetManager {
//    private scene: BABYLON.Scene;
//    private firstMesh: BABYLON.Mesh;
//    private secondMesh: BABYLON.Mesh;
//    private line: BABYLON.Mesh;
//    constructor(_scene:BABYLON.Scene, firstMesh: BABYLON.Mesh, secondMesh: BABYLON.Mesh) {
//        this.scene = _scene;
//        this.firstMesh = firstMesh;
//        this.secondMesh = secondMesh;
//        this.CreateLine();
//    }
//    private CreateLine() {
//        var mesh = new BABYLON.Mesh("magline", this.scene);        
//        var vertexData = new BABYLON.VertexData();
//        vertexData.positions = this.GetVertexPositions();
//        vertexData.indices = [0, 1, 2, 0, 2, 3];
//        vertexData.applyToMesh(mesh);

        
//        this.line = mesh;
//    }
//    private UpdateLine() {
//        var vertexData = new BABYLON.VertexData();
//        vertexData.positions = this.GetVertexPositions();
//        vertexData.indices = [0, 1, 2, 0, 2, 3];
//        vertexData.applyToMesh(this.line);

//        //var positions = this.GetVertexPositions();
//        //this.line.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false, false);
//        //var normals = new Array<number>();
//        //BABYLON.VertexData.ComputeNormals(positions, [0, 1, 2, 0, 2, 3], normals);
//        //this.line.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals, false, false);
//    }
//    private GetVertexPositions(): Array<number> {
//        var positions = new Array<number>();
//        positions.push(this.firstMesh.position.x);
//        positions.push(this.firstMesh.position.y + 0.05);
//        positions.push(this.firstMesh.position.z);
//        positions.push(this.firstMesh.position.x);
//        positions.push(this.firstMesh.position.y - 0.05);
//        positions.push(this.firstMesh.position.z);

//        positions.push(this.secondMesh.position.x);
//        positions.push(this.secondMesh.position.y - 0.05);
//        positions.push(this.secondMesh.position.z);
//        positions.push(this.secondMesh.position.x);
//        positions.push(this.secondMesh.position.y + 0.05);
//        positions.push(this.secondMesh.position.z);
//        return positions;
//    }
//    Update() {
//        this.UpdateLine();
//    }
//}

