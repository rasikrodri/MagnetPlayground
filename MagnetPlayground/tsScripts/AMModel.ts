class AMModel {
    JointsUserProperties: Array<AmJointProperty>;
    PhysicsUserProperties: Array<AmPhysicsProperty>;
    Splines: Array<AmSpline>;
    OrderedCps: Array<AmCP>;
    Normals: Array<AmNormal>;
    Patches: Array<AMPatch>;
    Groups: Array<AmGroup>;

    constructor(LoadedFile: string) {
        var xmlModel = $.parseXML(LoadedFile);
        var meshNodes = xmlModel.getElementsByTagName("MESH");
        var mesh = meshNodes[0];

        this.LoadUserProperties(xmlModel);
        this.LoadSplines(mesh);
        this.LoadNormals(mesh);
        this.LoadPatches(mesh);
        this.LoadGroups(xmlModel);
    }

    private LoadUserProperties(mesh: XMLDocument) {
        //This will get folders, User Properties is a folder
        var propertyFoldersData = mesh.getElementsByTagName("USERPROPERTY");
        this.JointsUserProperties = new Array<AmJointProperty>();
        this.PhysicsUserProperties = new Array<AmPhysicsProperty>();
        for (var i = 0; i < propertyFoldersData.length; i++) {
            var currFolder = propertyFoldersData[i];
            for (var p = 0; p < currFolder.childNodes.length; p++) {
                var property = currFolder.childNodes[p];
                if (property.nodeName === "BOOL" || property.nodeName === "PERCENT") {
                    var innerHtml = (property as Element).innerHTML.trim();
                    if (innerHtml.indexOf("-joint") === 0) {
                        this.JointsUserProperties.push(new AmJointProperty(innerHtml, AmUserPropertySwitchType[property.nodeName]));
                    }
                    else if (innerHtml.indexOf("-physics") === 0) {
                        this.PhysicsUserProperties.push(new AmPhysicsProperty(innerHtml, AmUserPropertySwitchType[property.nodeName]));
                    }
                }
            }
        }
    }
    private LoadSplines(mesh: Element) {
        var splinesData = mesh.getElementsByTagName("SPLINE");
        this.Splines = Array<AmSpline>(splinesData.length);
        var splineCps = null;
        for (var i = 0; i < splinesData.length; i++) {
            splineCps = splinesData[i].innerHTML.trim().split("\n");
            var spline = new AmSpline();
            spline.Cps = new Array<AmCP>(splineCps.length);
            this.Splines[i] = spline;
            for (var a = 0; a < splineCps.length; a++) {
                spline.Cps[a] = new AmCP(splineCps[a]);
            }
        }

        this.LoadCpsAndOrganizeWithIndexEqualToCpNumber();
    }
    private LoadCpsAndOrganizeWithIndexEqualToCpNumber() {
        //Get the number of the highest cp number
        var highestCpNumber = 0;
        var currentSpline: AmSpline;
        var currentCp: AmCP;
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
        this.OrderedCps = new Array<AmCP>(highestCpNumber + 1);

        //Place cps in their indexes
        for (var i = 0; i < this.Splines.length; i++) {
            currentSpline = this.Splines[i];
            for (var a = 0; a < currentSpline.Cps.length; a++) {
                currentCp = currentSpline.Cps[a];
                this.OrderedCps[currentCp.CpNumber] = currentCp;
            }
        }
    }
    private LoadNormals(mesh: Element) {
        var normalsData = mesh.getElementsByTagName("NORMALS");
        var allNomals = normalsData[0].innerHTML.trim().split("\n");
        this.Normals = new Array<AmNormal>(allNomals.length);

        for (var i = 0; i < allNomals.length; i++) {
            this.Normals[i] = new AmNormal(allNomals[i]);
        }
    }
    private LoadPatches(mesh: Element) {
        var patchesData = mesh.getElementsByTagName("PATCHES");
        var patches = patchesData[0].innerHTML.trim().split("\n");
        this.Patches = new Array<AMPatch>(patches.length);

        for (var i = 0; i < patches.length; i++) {
            this.Patches[i] = new AMPatch(patches[i], this.OrderedCps, this.Normals);
        }
    }
    private LoadGroups(mesh: XMLDocument) {
        var groupsData = mesh.getElementsByTagName("GROUP");
        this.Groups = new Array<AmGroup>(groupsData.length);

        for (var i = 0; i < groupsData.length; i++) {
            this.Groups[i] = new AmGroup(groupsData[i], this.OrderedCps);
        }
    }
}

class AmSpline {
    Cps: Array<AmCP>;
}
class AmCP {
    VertexIndex: number = -1;//used to store in which index the vertex equivalent to this cp is
    Patches = new Array<AMPatch>();
    FirstParm: number;//Don't know what it is
    TwinHasParms: number;
    CpNumber: number;
    HookPercentBetween: number;//the position is the percent between twin cp and it's next cp in it's spline.
    CpTwinNumber: number;
    X: number;
    Y: number;
    Z: number;
    InBiasAlpha: number = 0;
    InBiasGama: number = 0;
    InBiasMagnitude: number = 100;
    OutBiasAlpha: number = 0;
    OutBiasGama: number = 0;
    OutBiasMagnitude: number = 100;
    IsPositivePoleCp: boolean;
    IsNegativePoleCp: boolean;

    constructor(cpText: string) {
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
            this.X = parseFloat(s[3]) * -0.5;//rescale and flip x
            this.Y = parseFloat(s[4]) * 0.5;//rescale
            this.Z = parseFloat(s[5]) * 0.5;//rescale
            this.setBiasParms(s.slice(6));
        }
    }

    setBiasParms(biasText: Array<string>) {
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
    }

    public GetBaseTwinCP(cps: Array<AmCP>): AmCP {
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
    }
}
class AMPatch {
    FirstParm: number;//Don't know what it is
    Cps: Array<AmCP> = [];
    LastParm: number;//Don't know what it is
    Normals: Array<AmNormal> = [];

    constructor(patchText: string, cps: Array<AmCP>, normals: Array<AmNormal>) {
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
}
class AmNormal {
    X: number;
    Y: number;
    Z: number;
    constructor(normalText: string) {
        var s = normalText.split(" ");
        this.X = parseFloat(s[0]) * -1;//flip x
        this.Y = parseFloat(s[1]);
        this.Z = parseFloat(s[2]);
    }
}
class AmInLineObjectParser {
    static ParseTextObjectFromInnerHtml(innerHtml: string) {
        innerHtml = innerHtml.replace(/-/g, '":"');
        innerHtml = innerHtml.replace(/\//g, '","');
        innerHtml = innerHtml.replace(/}/g, '"}');
        innerHtml = innerHtml.replace(/{/g, '{"');

        return JSON.parse(innerHtml);
    }
}
class AmGroup {
    Name: string;
    DiffuseColor: Int32Array;
    IsMesh: boolean;
    GroupMeshCps: Array<AmCP> = new Array<AmCP>();
    Mass: number;//The only mandatory parameters is mass, which is the object's mass in kg. A 0 as a value will create a static impostor - good for floors.
    Friction: number;//is the impostor's friction when colliding against other impostors.
    Restitution: number;//is the amount of force the body will "give back" when colliding. A low value will create no bounce, a value of 1 will be a very bouncy interaction.
    MagnetPositivePoleCp: number;
    MagnetNegativePoleCp: number;
    Patches: AMPatch[] = new Array<AMPatch>();
    GroupMesh: BABYLON.Mesh;//To store the created mesh of the group in order to apply physics to it
    GroupMeshPosition: BABYLON.Vector3;//To store and position the mesh were it will start at
    LeftMostCp: AmCP;
    RightMostCp: AmCP;
    FrontMostCp: AmCP;
    BackMostCp: AmCP;
    TopMostCp: AmCP;
    BottomMostCp: AmCP;
    ImpostorType: number;
    JointPropertyName: string;
    PhysicsPropertyName: string;

    //Used to load the parameters in the same order the function asks for excluding this GroupMesh itself
    JointParametersInOrder = new Array<string>();

    constructor(groupElem: Element, organizedCps: AmCP[]) {
        var groupText = groupElem.innerHTML;
        var s = groupText.trim().split("\n");
        this.getNameOrGroupMesh(s[0].substring(5), organizedCps);
        this.getCps(groupElem, organizedCps);
        if (this.IsMesh) {
            this.collectPatches();
        }
    }
    getNameOrGroupMesh(name: string, organizedCps: AmCP[]) {
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
    }
    GetJoint(jointText: string) {

    }
    getCps(groupElem: Element, organizedCps: AmCP[]) {
        var cpsNumbersElem = groupElem.getElementsByTagName("CPS");
        if (cpsNumbersElem.length > 0) {
            var cpsList = cpsNumbersElem[0].innerHTML.trim().split("\n");
            for (var i = 0; i < cpsList.length; i++) {
                this.GroupMeshCps.push(organizedCps[parseInt(cpsList[i])]);
            }


        }
    }
    collectPatches() {
        //Collect patches that form full faces for this group

        var currentPatch: AMPatch;
        var cpsFoundForPath: number = 0;
        for (var i = 0; i < this.GroupMeshCps.length; i++) {

            for (var p = 0; p < this.GroupMeshCps[i].Patches.length; p++) {

                this.addPatches(this.GroupMeshCps[i].Patches[p]);

            }

        }
    }

    private addPatches(currentPatch: AMPatch) {
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
    }
}
class AmUserProperty {
    SwitchType: AmUserPropertySwitchType;
    PercentFactorialValue = 100;//Used for PERCENT properties. It is the max percent on the slider
    BoolDefaultValue: boolean;
    BoolValue: boolean;//for on/off
    FloatValue: number;//For percent. The selecte percent    

    constructor(switchType: AmUserPropertySwitchType, propertyText: string[]) {
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
            else if (propertyText[i].indexOf("FactorValue=") === 0) {//Percent
                this.PercentFactorialValue = parseFloat(propertyText[i].substr(12))
            }
        }
    }
}
class AmJointProperty extends AmUserProperty {
    JointPropertyName: string;
    JointPreset: JointPreset;
    OnMesh: string;
    constructor(jointPropertyInnerHtml: string, switchType: AmUserPropertySwitchType) {
        var s = jointPropertyInnerHtml.trim().split("\n");
        var jsonObj = AmInLineObjectParser.ParseTextObjectFromInnerHtml(s[0].substr(6));

        super(switchType, s);

        this.JointPropertyName = jsonObj.Name.toLowerCase();
        this.JointPreset = JointPreset[jsonObj.PresetName as string];

        if (jsonObj.With !== undefined) {
            this.OnMesh = jsonObj.With.toLowerCase();
        }
        else if (jsonObj.On != undefined) {
            this.OnMesh = jsonObj.On.toLowerCase();
        }
    }
}
class AmPhysicsProperty extends AmUserProperty {
    PhysicsPropertyName: string;
    ImpostorType: number;
    Mass: number;
    Friction: number;
    Restitution: number;
    constructor(jointPropertyInnerHtml: string, switchType: AmUserPropertySwitchType) {
        var s = jointPropertyInnerHtml.trim().split("\n");
        var jsonObj = AmInLineObjectParser.ParseTextObjectFromInnerHtml(s[0].substr(8));

        super(switchType, s);

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

    private SetImpostor(impostor: string) {
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
    }
}

enum AmUserPropertySwitchType {
    BOOL = 0,
    PERCENT = 1
}
