var SceneCreator = (function () {
    function SceneCreator(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true);
        // create a basic BJS Scene object
        this.scene = new BABYLON.Scene(this.engine);
        this.createCamera();
        this.createLigths();
        this.createObjects();
        var sceneForRunLoop = this.scene;
        this.engine.runRenderLoop(function () {
            sceneForRunLoop.render();
        });
        var sceneForWindowResize = this.engine;
        window.addEventListener('resize', function () {
            sceneForWindowResize.resize();
        });
    }
    SceneCreator.prototype.createCamera = function () {
        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this.scene);
        // target the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // attach the camera to the canvas
        camera.attachControl(this.canvas, false);
    };
    SceneCreator.prototype.createLigths = function () {
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
    };
    SceneCreator.prototype.createObjects = function () {
        // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, this.scene);
        //Creation of a cylinder
        //(name, height, diameter, tessellation, scene, updatable)
        var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 3, 3, 3, 6, 1, this.scene, false);
        // move the sphere upward 1/2 of its height
        sphere.position.y = 1;
        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, this.scene);
    };
    return SceneCreator;
}());
window.addEventListener('DOMContentLoaded', function () {
    var babylonScenCreator = new SceneCreator("renderCanvas");
});
//# sourceMappingURL=app.js.map