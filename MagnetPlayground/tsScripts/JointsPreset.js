var JointPreset;
(function (JointPreset) {
    JointPreset[JointPreset["RIPZ"] = 1] = "RIPZ";
    JointPreset[JointPreset["JoinWith"] = 2] = "JoinWith"; //Parameters to pass ([the name of the GroupMesh to join with]) 
})(JointPreset || (JointPreset = {}));
var JointPresetProcessor = (function () {
    function JointPresetProcessor() {
    }
    JointPresetProcessor.prototype.GetGroupByName = function (groups, groupName) {
        var g;
        groups.some(function (e) {
            if (e.Name === groupName) {
                g = e;
                return true;
            }
        });
        if (g === null) {
            throw ("Group " + groupName + " does not exist. Trying to add joint");
        }
        return g;
    };
    JointPresetProcessor.prototype.GetAmJointPropertyByName = function (userProperties, amJointName) {
        var up;
        userProperties.some(function (e) {
            if (e.JointPropertyName === amJointName) {
                up = e;
                return true;
            }
        });
        if (up === null) {
            throw ("Joint property " + amJointName + " does not exist. Trying to add joint");
        }
        return up;
    };
    JointPresetProcessor.prototype.SetJointRotateInPlaceZ = function (meshTojoin, meshToJoinToo) {
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
    };
    JointPresetProcessor.prototype.SetJointJoinWith = function (meshTojoin, meshToJoinToo) {
        meshTojoin.physicsImpostor.createJoint(meshToJoinToo.physicsImpostor, BABYLON.PhysicsJoint.LockJoint, new BABYLON.Vector3(0, 0, 0));
    };
    return JointPresetProcessor;
}());
//# sourceMappingURL=JointsPreset.js.map