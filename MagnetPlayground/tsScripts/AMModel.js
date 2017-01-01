var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AMModel = (function () {
    function AMModel(LoadedFile) {
        var xmlModel = $.parseXML(LoadedFile);
        var meshNodes = xmlModel.getElementsByTagName("MESH");
        var mesh = meshNodes[0];
        this.LoadUserProperties(xmlModel);
        this.LoadSplines(mesh);
        this.LoadNormals(mesh);
        this.LoadPatches(mesh);
        this.LoadGroups(xmlModel);
    }
    AMModel.prototype.LoadUserProperties = function (mesh) {
        //This will get folders, User Properties is a folder
        var propertyFoldersData = mesh.getElementsByTagName("USERPROPERTY");
        this.JointsUserProperties = new Array();
        this.PhysicsUserProperties = new Array();
        for (var i = 0; i < propertyFoldersData.length; i++) {
            var currFolder = propertyFoldersData[i];
            for (var p = 0; p < currFolder.childNodes.length; p++) {
                var property = currFolder.childNodes[p];
                if (property.nodeName === "BOOL" || property.nodeName === "PERCENT") {
                    var innerHtml = property.innerHTML.trim();
                    if (innerHtml.indexOf("-joint") === 0) {
                        this.JointsUserProperties.push(new AmJointProperty(innerHtml, AmUserPropertySwitchType[property.nodeName]));
                    }
                    else if (innerHtml.indexOf("-physics") === 0) {
                        this.PhysicsUserProperties.push(new AmPhysicsProperty(innerHtml, AmUserPropertySwitchType[property.nodeName]));
                    }
                }
            }
        }
    };
    AMModel.prototype.LoadSplines = function (mesh) {
        var splinesData = mesh.getElementsByTagName("SPLINE");
        this.Splines = Array(splinesData.length);
        var splineCps = null;
        for (var i = 0; i < splinesData.length; i++) {
            splineCps = splinesData[i].innerHTML.trim().split("\n");
            var spline = new AmSpline();
            spline.Cps = new Array(splineCps.length);
            this.Splines[i] = spline;
            for (var a = 0; a < splineCps.length; a++) {
                spline.Cps[a] = new AmCP(splineCps[a]);
            }
        }
        this.LoadCpsAndOrganizeWithIndexEqualToCpNumber();
    };
    AMModel.prototype.LoadCpsAndOrganizeWithIndexEqualToCpNumber = function () {
        //Get the number of the highest cp number
        var highestCpNumber = 0;
        var currentSpline;
        var currentCp;
        for (var i = 0; i < this.Splines.length; i++) {
            currentSpline = this.Splines[i];
            for (var a = 0; a < currentSpline.Cps.length; a++) {
                currentCp = currentSpline.Cps[a];
                if (highestCpNumber < currentCp.CpNumber) {
                    highestCpNumber = currentCp.CpNumber;
                }
            }
        }
        //creata array with highestCpNumber + 1 entries
        //create array to hold cps. Index = cp number
        this.OrderedCps = new Array(highestCpNumber + 1);
        //Place cps in their indexes
        for (var i = 0; i < this.Splines.length; i++) {
            currentSpline = this.Splines[i];
            for (var a = 0; a < currentSpline.Cps.length; a++) {
                currentCp = currentSpline.Cps[a];
                this.OrderedCps[currentCp.CpNumber] = currentCp;
            }
        }
    };
    AMModel.prototype.LoadNormals = function (mesh) {
        var normalsData = mesh.getElementsByTagName("NORMALS");
        var allNomals = normalsData[0].innerHTML.trim().split("\n");
        this.Normals = new Array(allNomals.length);
        for (var i = 0; i < allNomals.length; i++) {
            this.Normals[i] = new AmNormal(allNomals[i]);
        }
    };
    AMModel.prototype.LoadPatches = function (mesh) {
        var patchesData = mesh.getElementsByTagName("PATCHES");
        var patches = patchesData[0].innerHTML.trim().split("\n");
        this.Patches = new Array(patches.length);
        for (var i = 0; i < patches.length; i++) {
            this.Patches[i] = new AMPatch(patches[i], this.OrderedCps, this.Normals);
        }
    };
    AMModel.prototype.LoadGroups = function (mesh) {
        var groupsData = mesh.getElementsByTagName("GROUP");
        this.Groups = new Array(groupsData.length);
        for (var i = 0; i < groupsData.length; i++) {
            this.Groups[i] = new AmGroup(groupsData[i], this.OrderedCps);
        }
    };
    return AMModel;
}());
var AmSpline = (function () {
    function AmSpline() {
    }
    return AmSpline;
}());
var AmCP = (function () {
    function AmCP(cpText) {
        this.VertexIndex = -1; //used to store in which index the vertex equivalent to this cp is
        this.Patches = new Array();
        this.InBiasAlpha = 0;
        this.InBiasGama = 0;
        this.InBiasMagnitude = 100;
        this.OutBiasAlpha = 0;
        this.OutBiasGama = 0;
        this.OutBiasMagnitude = 100;
        var s = cpText.split(" ");
        this.FirstParm = parseInt(s[0]);
        this.TwinHasParms = parseInt(s[1]);
        this.CpNumber = parseInt(s[2]);
        //if (this.CpNumber === 5218) {
        //    var ttt = "";
        //}
        if (this.TwinHasParms === 1) {
            //Test for hook
            if (s.length === 5) {
                this.HookPercentBetween = parseFloat(s[3]);
                this.CpTwinNumber = parseInt(s[4]);
            }
            else {
                this.CpTwinNumber = parseInt(s[3]);
                this.setBiasParms(s.slice(4));
            }
        }
        else {
            this.X = parseFloat(s[3]) * -0.5; //rescale and flip x
            this.Y = parseFloat(s[4]) * 0.5; //rescale
            this.Z = parseFloat(s[5]) * 0.5; //rescale
            this.setBiasParms(s.slice(6));
        }
    }
    AmCP.prototype.setBiasParms = function (biasText) {
        if (biasText.length > 2) {
            if (biasText[0] !== ".") {
                this.InBiasAlpha = parseFloat(biasText[0]);
                this.InBiasGama = parseFloat(biasText[1]);
                this.InBiasMagnitude = parseFloat(biasText[2]);
                if (biasText[3] !== ".") {
                    this.OutBiasAlpha = parseFloat(biasText[3]);
                    this.OutBiasGama = parseFloat(biasText[4]);
                    this.OutBiasMagnitude = parseFloat(biasText[5]);
                }
            }
            else {
                if (biasText[1] !== ".") {
                    this.OutBiasAlpha = parseFloat(biasText[1]);
                    this.OutBiasGama = parseFloat(biasText[2]);
                    this.OutBiasMagnitude = parseFloat(biasText[3]);
                }
            }
        }
    };
    AmCP.prototype.GetBaseTwinCP = function (cps) {
        if (this.TwinHasParms === 1) {
            //var ddd = cps[this.CpTwinNumber];
            //if (ddd === undefined) {
            //    ddd = 2;
            //}
            return cps[this.CpTwinNumber].GetBaseTwinCP(cps);
        }
        else {
            return this;
        }
    };
    return AmCP;
}());
var AMPatch = (function () {
    function AMPatch(patchText, cps, normals) {
        this.Cps = [];
        this.Normals = [];
        var s = patchText.split(" ");
        this.FirstParm = parseInt(s[0]);
        //10 items = 4 cps or 3cps if the last one is the same cps as the first
        //12 items = 5 cps
        if (s.length === 10) {
            var firstCp = cps[parseInt(s[1])];
            var lastCp = cps[parseInt(s[4])];
            if (firstCp === lastCp) {
                this.Cps.push(firstCp);
                this.Cps.push(cps[parseInt(s[2])]);
                this.Cps.push(cps[parseInt(s[3])]);
                //skip the fourth cp because this is a 3 cp patch, therfore the forth cps is same as the frist
                this.Normals.push(normals[parseInt(s[5])]);
                this.Normals.push(normals[parseInt(s[6])]);
                this.Normals.push(normals[parseInt(s[7])]);
                //skip the fourth cp because this is a 3 cp patch, therfore the forth cps is same as the frist
                this.LastParm = parseInt(s[9]);
            }
            else {
                this.Cps.push(firstCp);
                this.Cps.push(cps[parseInt(s[2])]);
                this.Cps.push(cps[parseInt(s[3])]);
                this.Cps.push(lastCp);
                this.Normals.push(normals[parseInt(s[5])]);
                this.Normals.push(normals[parseInt(s[6])]);
                this.Normals.push(normals[parseInt(s[7])]);
                this.Normals.push(normals[parseInt(s[8])]);
                this.LastParm = parseInt(s[9]);
            }
        }
        else if (s.length === 12) {
            this.Cps.push(cps[parseInt(s[1])]);
            this.Cps.push(cps[parseInt(s[2])]);
            this.Cps.push(cps[parseInt(s[3])]);
            this.Cps.push(cps[parseInt(s[4])]);
            this.Cps.push(cps[parseInt(s[5])]);
            this.Normals.push(normals[parseInt(s[6])]);
            this.Normals.push(normals[parseInt(s[7])]);
            this.Normals.push(normals[parseInt(s[8])]);
            this.Normals.push(normals[parseInt(s[9])]);
            this.Normals.push(normals[parseInt(s[10])]);
            this.LastParm = parseInt(s[11]);
        }
        //Give a reference of the patch to the cps
        for (var i = 0; i < this.Cps.length; i++) {
            this.Cps[i].Patches.push(this);
        }
    }
    return AMPatch;
}());
var AmNormal = (function () {
    function AmNormal(normalText) {
        var s = normalText.split(" ");
        this.X = parseFloat(s[0]) * -1; //flip x
        this.Y = parseFloat(s[1]);
        this.Z = parseFloat(s[2]);
    }
    return AmNormal;
}());
var AmInLineObjectParser = (function () {
    function AmInLineObjectParser() {
    }
    AmInLineObjectParser.ParseTextObjectFromInnerHtml = function (innerHtml) {
        innerHtml = innerHtml.replace(/-/g, '":"');
        innerHtml = innerHtml.replace(/\//g, '","');
        innerHtml = innerHtml.replace(/}/g, '"}');
        innerHtml = innerHtml.replace(/{/g, '{"');
        return JSON.parse(innerHtml);
    };
    return AmInLineObjectParser;
}());
var AmGroup = (function () {
    function AmGroup(groupElem, organizedCps) {
        this.GroupMeshCps = new Array();
        this.Patches = new Array();
        //Used to load the parameters in the same order the function asks for excluding this GroupMesh itself
        this.JointParametersInOrder = new Array();
        var groupText = groupElem.innerHTML;
        var s = groupText.trim().split("\n");
        this.getNameOrGroupMesh(s[0].substring(5), organizedCps);
        this.getCps(groupElem, organizedCps);
        if (this.IsMesh) {
            this.collectPatches();
        }
    }
    AmGroup.prototype.getNameOrGroupMesh = function (name, organizedCps) {
        if (name.indexOf("-mesh{") === 0) {
            this.IsMesh = true;
            var jsonObj = AmInLineObjectParser.ParseTextObjectFromInnerHtml(name.substr(5));
            if (jsonObj.Name !== undefined) {
                this.Name = jsonObj.Name.toLowerCase();
            }
            if (jsonObj.PossitivePoleCp !== undefined) {
                this.MagnetPositivePoleCp = parseInt(jsonObj.PossitivePoleCp);
                try {
                    organizedCps[this.MagnetPositivePoleCp].IsPositivePoleCp = true;
                }
                catch (e) {
                    throw ("Cp " + this.MagnetPositivePoleCp + " not found. Trying to set it as Positive pole.");
                }
            }
            if (jsonObj.NegativePoleCp !== undefined) {
                this.MagnetNegativePoleCp = parseInt(jsonObj.NegativePoleCp);
                try {
                    organizedCps[this.MagnetPositivePoleCp].IsNegativePoleCp = true;
                }
                catch (e) {
                    throw ("Cp " + this.MagnetPositivePoleCp + " not found. Trying to set it as Negative pole.");
                }
            }
            if (jsonObj.Joint !== undefined) {
                this.JointPropertyName = jsonObj.Joint.toLowerCase();
            }
            if (jsonObj.Physics !== undefined) {
                this.PhysicsPropertyName = jsonObj.Physics.toLowerCase();
            }
        }
        else {
            this.Name = name;
        }
    };
    AmGroup.prototype.GetJoint = function (jointText) {
    };
    AmGroup.prototype.getCps = function (groupElem, organizedCps) {
        var cpsNumbersElem = groupElem.getElementsByTagName("CPS");
        if (cpsNumbersElem.length > 0) {
            var cpsList = cpsNumbersElem[0].innerHTML.trim().split("\n");
            for (var i = 0; i < cpsList.length; i++) {
                this.GroupMeshCps.push(organizedCps[parseInt(cpsList[i])]);
            }
        }
    };
    AmGroup.prototype.collectPatches = function () {
        //Collect patches that form full faces for this group
        var currentPatch;
        var cpsFoundForPath = 0;
        for (var i = 0; i < this.GroupMeshCps.length; i++) {
            for (var p = 0; p < this.GroupMeshCps[i].Patches.length; p++) {
                this.addPatches(this.GroupMeshCps[i].Patches[p]);
            }
        }
    };
    AmGroup.prototype.addPatches = function (currentPatch) {
        var cpsFoundForPath = 0;
        //find the cps in that patch
        for (var c = 0; c < this.GroupMeshCps.length; c++) {
            if (this.GroupMeshCps[c].Patches.indexOf(currentPatch) !== -1) {
                cpsFoundForPath += 1;
                if (currentPatch.Cps.length === cpsFoundForPath) {
                    if (this.Patches.indexOf(currentPatch) === -1) {
                        this.Patches.push(currentPatch);
                    }
                    cpsFoundForPath = 0;
                    break;
                }
            }
        }
    };
    return AmGroup;
}());
var AmUserProperty = (function () {
    function AmUserProperty(switchType, propertyText) {
        this.PercentFactorialValue = 100; //Used for PERCENT properties. It is the max percent on the slider
        this.SwitchType = switchType;
        for (var i = 1; i < propertyText.length; i++) {
            if (propertyText[i].indexOf("DefaultValue=") === 0) {
                this.BoolDefaultValue = (propertyText[i].substr(13) === "TRUE") ? true : false;
            }
            else if (propertyText[i].indexOf("Value=") === 0) {
                if (switchType === AmUserPropertySwitchType.BOOL) {
                    this.BoolValue = (propertyText[i].substr(6) === "TRUE") ? true : false;
                }
                else if (switchType === AmUserPropertySwitchType.PERCENT) {
                    this.FloatValue = parseFloat(propertyText[i].substr(6));
                }
            }
            else if (propertyText[i].indexOf("FactorValue=") === 0) {
                this.PercentFactorialValue = parseFloat(propertyText[i].substr(12));
            }
        }
    }
    return AmUserProperty;
}());
var AmJointProperty = (function (_super) {
    __extends(AmJointProperty, _super);
    function AmJointProperty(jointPropertyInnerHtml, switchType) {
        var s = jointPropertyInnerHtml.trim().split("\n");
        var jsonObj = AmInLineObjectParser.ParseTextObjectFromInnerHtml(s[0].substr(6));
        _super.call(this, switchType, s);
        this.JointPropertyName = jsonObj.Name.toLowerCase();
        this.JointPreset = JointPreset[jsonObj.PresetName];
        if (jsonObj.With !== undefined) {
            this.OnMesh = jsonObj.With.toLowerCase();
        }
        else if (jsonObj.On != undefined) {
            this.OnMesh = jsonObj.On.toLowerCase();
        }
    }
    return AmJointProperty;
}(AmUserProperty));
var AmPhysicsProperty = (function (_super) {
    __extends(AmPhysicsProperty, _super);
    function AmPhysicsProperty(jointPropertyInnerHtml, switchType) {
        var s = jointPropertyInnerHtml.trim().split("\n");
        var jsonObj = AmInLineObjectParser.ParseTextObjectFromInnerHtml(s[0].substr(8));
        _super.call(this, switchType, s);
        this.PhysicsPropertyName = jsonObj.Name.toLowerCase();
        if (jsonObj.Impostor !== undefined) {
            this.SetImpostor(jsonObj.Impostor);
        }
        if (jsonObj.Mass != undefined) {
            this.Mass = parseFloat(jsonObj.Mass);
        }
        if (jsonObj.Friction != undefined) {
            this.Friction = parseFloat(jsonObj.Friction);
        }
        if (jsonObj.Bounce != undefined) {
            this.Restitution = parseFloat(jsonObj.Bounce);
        }
    }
    AmPhysicsProperty.prototype.SetImpostor = function (impostor) {
        switch (impostor.toLowerCase()) {
            case "plane":
                this.ImpostorType = BABYLON.PhysicsImpostor.PlaneImpostor;
                break;
            case "box":
                this.ImpostorType = BABYLON.PhysicsImpostor.BoxImpostor;
                break;
            case "cylinder":
                this.ImpostorType = BABYLON.PhysicsImpostor.CylinderImpostor;
                break;
            case "sphere":
                this.ImpostorType = BABYLON.PhysicsImpostor.SphereImpostor;
                break;
            case "mesh":
                this.ImpostorType = BABYLON.PhysicsImpostor.MeshImpostor;
                break;
            case "none":
                this.ImpostorType = BABYLON.PhysicsImpostor.NoImpostor;
                break;
            default:
                alert("Impostor " + impostor + " not implemented");
                break;
        }
    };
    return AmPhysicsProperty;
}(AmUserProperty));
var AmUserPropertySwitchType;
(function (AmUserPropertySwitchType) {
    AmUserPropertySwitchType[AmUserPropertySwitchType["BOOL"] = 0] = "BOOL";
    AmUserPropertySwitchType[AmUserPropertySwitchType["PERCENT"] = 1] = "PERCENT";
})(AmUserPropertySwitchType || (AmUserPropertySwitchType = {}));
//# sourceMappingURL=AMModel.js.map