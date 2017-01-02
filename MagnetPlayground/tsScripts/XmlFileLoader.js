var XmlFileLoader = (function () {
    function XmlFileLoader() {
    }
    XmlFileLoader.prototype.readXml = function (xmlFile) {
        //if (typeof document.DOMParser != "undefined") {
        //    this.xmlhttp = new XMLHttpRequest();
        //    this.xmlhttp.open("GET", xmlFile, false);
        //    if (this.xmlhttp.overrideMimeType) {
        //        this.xmlhttp.overrideMimeType('text/xml');
        //    }
        //    this.xmlhttp.send();
        //    this.xmlDoc = this.xmlhttp.responseXML;
        //}
        //else {
        //    this.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        //    this.xmlDoc.async = "false";
        //    this.xmlDoc.load(xmlFile);
        //}
        //var tagObj = this.xmlDoc.getElementsByTagName("marker");
        //var typeValue = tagObj[0].getElementsByTagName("type")[0].childNodes[0].nodeValue;
        //var titleValue = tagObj[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    };
    XmlFileLoader.prototype.openFile = function (sceneManag, theFile, amModelFile) {
        var onlyName = theFile.name;
        var dotIndex = onlyName.indexOf(".");
        var fileExtension = onlyName.substring(dotIndex + 1);
        switch (fileExtension) {
            case "mdl":
                try {
                    var amModel = new AMModel(amModelFile);
                    AnimationMasterModelLoader.LoadMeshIntoScene(sceneManag, amModel);
                    sceneManag.magnetManager.AddMagnetsFromAMGroupMeshes(sceneManag.scene, amModel);
                    break;
                }
                catch (e) {
                    alert(e);
                }
        }
    };
    return XmlFileLoader;
}());
//# sourceMappingURL=XmlFileLoader.js.map