class SceneCreator {

    static babylonSceenCreator: SceneCreator;

    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.FreeCamera;
    ssao: BABYLON.SSAORenderingPipeline;
    shadowGenerator: BABYLON.ShadowGenerator;
    magnetManager: MagnetManager;

    constructor(canvasId: string) {

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        
        // create a basic BJS Scene object
        this.scene = new BABYLON.Scene(this.engine);
        //this.engine.cullBackFaces = true;

        this.scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.CannonJSPlugin());
        //this.scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.OimoJSPlugin());
        //this.scene.collisionsEnabled = true;
        //this.scene.forceWireframe = true;
               
        

        this.createCamera();
        this.createLigths();
        this.createObjects();

        //this.configureSSAO();

        var sceneForRunLoop = this.scene;
        this.engine.runRenderLoop(function () {
            sceneForRunLoop.render();
        });
        var sceneForWindowResize = this.engine;
        window.addEventListener('resize', function () {
            sceneForWindowResize.resize();
        });

        //Create Magnet manager and subscribe magnets update before render
        this.magnetManager = new MagnetManager();         
        var magnetManager = this.magnetManager;
        this.scene.registerBeforeRender(function () {
            magnetManager.UpdateMagnets();
        });
    }

    createCamera() {
        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 20, 20), this.scene);
        //this.camera.rotation = new BABYLON.Vector3(this.camera.rotation.x, 180, this.camera.rotation.z);
        // target the camera to scene origin
        this.camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        this.camera.attachControl(this.canvas, false);
    }

    createLigths() {

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        //var fillLight = new BABYLON.SpotLight('fillLight', new BABYLON.Vector3(-5, 10, 5), new BABYLON.Vector3(-5, 10, 5), 45, 10, this.scene);
        //var light = new BABYLON.PointLight('light1', new BABYLON.Vector3(-5, 10, 5), this.scene);
        //var light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(-5, 10, -5), this.scene);
        //var light3 = new BABYLON.PointLight('light3', new BABYLON.Vector3(5, 10, 5), this.scene);
        //var light4 = new BABYLON.PointLight('light4', new BABYLON.Vector3(5, 10, -5), this.scene);
        //this.shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        //this.shadowGenerator.bias = 0.01;
        //this.shadowGenerator.useVarianceShadowMap = true;
        //this.shadowGenerator.usePoissonSampling = true;
        //this.shadowGenerator.useBlurVarianceShadowMap = true;
    }

    createObjects() {
        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGround('ground1', 100, 100, 2, this.scene);
        var materialGround = new BABYLON.StandardMaterial("ground", this.scene);
        //materialGround.backFaceCulling = false;
        //this.shadowGenerator.getShadowMap().renderList.push(ground);
        ground.receiveShadows = true;

        //materialGround.diffuseColor = new BABYLON.Color3(.1, .5, .5);
        materialGround.diffuseTexture = new BABYLON.Texture("grass.png", this.scene);
        ground.material = materialGround;

        //this.createWeelAndMagnets();
        //this.createOutsidePullingMagnets();
    }

    createWeelAndMagnets() {
        //Create the spinning weel
        var spinningWeel = BABYLON.Mesh.CreateCylinder("spinnigweel", 0.1, 10, 10, 48, 1, this.scene, false);
        spinningWeel.rotation.x = Math.PI / 2;  // Rotate 90 degrees on the x-axis.
        spinningWeel.position.y = 6;
        //this.shadowGenerator.getShadowMap().renderList.push(spinningWeel);
        spinningWeel.receiveShadows = true;        

        //Create and position the 5 magnets along the edge of the spinning weel
        var materialMagnets = new BABYLON.StandardMaterial("weelmagnets", this.scene);
        materialMagnets.diffuseColor = new BABYLON.Color3(.1, .5, .5);
        var weelMagnets = [];
        var angleBetweenMagnets = -18;//fit them inside 90 degress space
        for (var i = 1; i < 6; i++) {
            var m = BABYLON.Mesh.CreateCylinder("cylinder", 0.3, 1, 1, 24, 1, this.scene, false);
            m.material = materialMagnets;
            m.rotation.x = Math.PI / 2;
            m.position.x = -4.5;
            m.position.y = spinningWeel.position.y;
            var angle = angleBetweenMagnets * i;
            var newPosition = this.rotate_point(m.position.x, m.position.y, spinningWeel.position.x, spinningWeel.position.y, angle);
            m.position.x = newPosition.x;
            m.position.y = newPosition.y;
            weelMagnets.push(m);

            //this.shadowGenerator.getShadowMap().renderList.push(m);
            m.receiveShadows = true;
        }
    }
    createOutsidePullingMagnets() {
        //Create the spinning weel
        var outsideMagnetsBase = BABYLON.Mesh.CreateCylinder("spinnigweel", 0.1, 10, 10, 48, 1, this.scene, false);
        outsideMagnetsBase.rotation.x = Math.PI / 2;  // Rotate 90 degrees on the x-axis.
        outsideMagnetsBase.rotation.z = Math.PI / 1.25;
        outsideMagnetsBase.position.y = 6;
        outsideMagnetsBase.position.z = 6;
        //this.shadowGenerator.getShadowMap().renderList.push(outsideMagnetsBase);
        outsideMagnetsBase.receiveShadows = true;

        var materialHolder = new BABYLON.StandardMaterial("weelmagnets", this.scene);
        materialHolder.alpha = 0.5;//.diffuseColor = new BABYLON.Color3(.1, .5, .5);
        outsideMagnetsBase.material = materialHolder;


        //Create and position the 5 magnets along the edge of the spinning weel
        var materialMagnets = new BABYLON.StandardMaterial("weelmagnets", this.scene);
        materialMagnets.diffuseColor = new BABYLON.Color3(.1, .5, .5);
        var weelMagnets = [];
        var angleBetweenMagnets = -18;//fit them inside 90 degress space
        for (var i = 1; i < 6; i++) {
            var m = BABYLON.Mesh.CreateCylinder("cylinder", 0.3, 1, 1, 24, 1, this.scene, false);
            m.material = materialMagnets;
            m.rotation.x = Math.PI / 2;
            m.position.x = -4.5;
            m.position.y = outsideMagnetsBase.position.y;
            m.position.z = outsideMagnetsBase.position.z;
            var angle = angleBetweenMagnets * i;
            var newPosition = this.rotate_point(m.position.x, m.position.y, outsideMagnetsBase.position.x, outsideMagnetsBase.position.y, angle);
            m.position.x = newPosition.x;
            m.position.y = newPosition.y;
            weelMagnets.push(m);

            //this.shadowGenerator.getShadowMap().renderList.push(m);
            m.receiveShadows = true;
        }
    }

    rotate_point(pointX, pointY, originX, originY, angle) {
        angle = angle * Math.PI / 180.0;
        return {
            x: Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
            y: Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
        };
    }

    configureSSAO() {
        this.ssao = new BABYLON.SSAORenderingPipeline('ssaopipeline', this.scene, 0.9, [this.camera]);
    }

    openFile(theFile:any, fileText: string) {
        var xmlLoder = new XmlFileLoader();
        xmlLoder.openFile(this, theFile, fileText);
    }
}

window.addEventListener('DOMContentLoaded', function () {

    SceneCreator.babylonSceenCreator = new SceneCreator("renderCanvas");

    function handleFileSelect(evt) {

        var files = evt.target.files; // FileList object
        var f = files[0];
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                SceneCreator.babylonSceenCreator.openFile(theFile, e.currentTarget.result);
            };
        })(f);

        reader.readAsText(f);
    }

    document.getElementById('file').addEventListener('change', handleFileSelect, false);
});