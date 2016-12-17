enum JointPreset {
    RIPZ = 1, //Parameters to pass ([the name of the GroupMesh used as the center of the rotation])
    JoinWith = 2//Parameters to pass ([the name of the GroupMesh to join with]) 
}

class JointPresetProcessor {    
    GetGroupByName(groups: AmGroup[], groupName: string): AmGroup {
        var g: AmGroup;
        groups.some(function (e) {
            if (e.Name === groupName) { g = e; return true; }
        })

        if (g === null) {
            throw ("Group " + groupName + " does not exist. Trying to add joint");
        }

        return g;
    }
    GetAmJointPropertyByName(userProperties: AmUserProperty[], amJointName: string): AmUserProperty {
        var up: AmUserProperty;
        userProperties.some(function (e) {
            if (e.JointPropertyName === amJointName) { up = e; return true; }
        })

        if (up === null) {
            throw ("Joint property " + amJointName + " does not exist. Trying to add joint");
        }

        return up;
    }

    SetJointRotateInPlaceZ(meshTojoin: BABYLON.Mesh, meshToJoinToo: BABYLON.Mesh) {
        var hingeJoint = new BABYLON.HingeJoint({
            mainPivot: new BABYLON.Vector3(0, 0, 0),
            connectedPivot: new BABYLON.Vector3(0, 0, 0),
            mainAxis: new BABYLON.Vector3(0, 0, 0),
            connectedAxis: new BABYLON.Vector3(0, 0, 1),
            collision: false,
            nativeParams: {
                limit: [90, 90]
            }
        });
        meshTojoin.physicsImpostor.addJoint(meshToJoinToo.physicsImpostor, hingeJoint);

    }
    SetJointJoinWith(meshTojoin: BABYLON.Mesh, meshToJoinToo: BABYLON.Mesh) {
        meshTojoin.physicsImpostor.createJoint(meshToJoinToo.physicsImpostor, BABYLON.PhysicsJoint.LockJoint, new BABYLON.Vector3(0, 0, 0));
    }
}