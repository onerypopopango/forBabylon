class Model3d extends HTMLElement{
    constructor() {
        super();

        //Shadow DOM(?) method
        let shadow = this.attachShadow({mode:'open'}); 
        //adds canvas to the component
        const cnv = document.createElement('canvas');
        cnv.setAttribute('id', 'renderCanvas');
        cnv.setAttribute('touch-action', 'none');
        cnv.style = "width: 100%; height: 100%; touch-action: none;";
        shadow.appendChild(cnv);

        let scene = null;
        let BJSloaded = false;

        // animation groups and animation stuff
        var officeFace01Contract;
        var officeFace01Expand;
        var officeFace02Contract;
        var officeFace02Expand;
        var officeFace03Contract;
        var officeFace03Expand;
        var officeFace04Contract;
        var officeFace04Expand;
        var officeFace05Contract;
        var officeFace05Expand;
        var buidlingGroundContract;
        var buildingGroundExpand;

        var expand = true;

        var floor1Expand;
        var floor1Contract;
        var floor2Expand;
        var floor2Contract;
        var floor3Expand;
        var floor3Contract;
        var floor4Expand;
        var floor4Contract;
        var floor5Expand;
        var floor5Contract;
        var floorExpand = true;

        var frameRate = 24;

        // highlight layer
        var hl;

        // lightmaps and shadow stuff
        var lightmap;
        var material;
        var shadowGenerator;
        var floorPlanMaterial;

        // sets up the babylon environment for loading object into it
        // this was called fourth (4)
        function setUp3DEnvironment() {
            console.log("setUp3DEnvironment");
            const engine = new BABYLON.Engine(cnv, true);

            let createScene = function() {
                var scene = new BABYLON.Scene(engine);
                // scene.clearColor = new BABYLON.Color3(1, 100, 1);
                // scene.createDefaultCameraOrLight(true, true, true);

                // Parameters: name, alpha, beta, radius, target position (x, y, z), scene
                // old vector coordinates for target position => new BABYLON.Vector3(15, 0, 22)
                var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);

                // highlight layer
                hl = new BABYLON.HighlightLayer("hl1", scene); 

                // Positions the camera overwriting alpha, beta, radius
                camera.setPosition(new BABYLON.Vector3(0, 30, 120));
                // camera.attachControl(cnv, true);

                // try this one for auto rotate camera instead...
                camera.useAutoRotationBehavior = true;
                scene.activeCamera.autoRotationBehavior.idleRotationSpeed = 0.1;
                scene.activeCamera.autoRotationBehavior.idleRotationWaitTime = 10;
                scene.activeCamera.autoRotationBehavior.idleRotationSpinupTime = 10;

                // target: any, from: number, to: number, loop?: boolean, 
                // speedRatio?: number, onAnimationEnd?: () => void, animatable?: Animatable, 
                // stopCurrent?: boolean, targetMask?: (target: any) => boolean, onAnimationLoop?: () => void, isAdditive?: boolean
                scene.beginAnimation(camera, 0, frameRate * 16, true);
                // scene.activeCamera = camera;

                return scene;
            }

            scene = createScene();

            //starts the render loop
            engine.runRenderLoop(function () { 
                scene.render();
            });

            //manages resizing of container
            window.addEventListener("resize", function () {
                engine.resize();
            });
        }

        //this loads first (1)
        let loadBJS = new Promise((resolve, reject) => {
            console.log("loadBJS");
            try{
                const bjs = document.createElement('script');
                bjs.src = 'https://cdn.babylonjs.com/babylon.js';
                bjs.async = false;
                document.head.appendChild(bjs);
                const bjsloader = document.createElement('script');
                bjsloader.src = 'https://preview.babylonjs.com/loaders/babylonjs.loaders.min.js';
                bjsloader.async = false;
                document.head.appendChild(bjsloader);
                const bjsGui = document.createElement('script');
                bjsGui.src = "https://preview.babylonjs.com/gui/babylon.gui.js";
                bjsGui.async = false;
                document.head.appendChild(bjsGui);
                const pep = document.createElement('script');
                pep.src = 'https://code.jquery.com/pep/0.4.3/pep.js';
                pep.async = false;
                document.head.appendChild(pep);
                pep.addEventListener('load', function(){
                    BJSloaded = true;
                    resolve(true);
                    setUp3DEnvironment();
                });
            }
            catch(e){
                reject(e);
            }
        });

        this.getScene = function(){
            return scene;
        };

        /*LOAD 3D MODELS*/
        //method that loads 3d models into the created scene via assetsManager
        let loadGLTFAux = function(fileArray) {
            console.log('file: ', fileArray);
            scene.meshes.pop();
            var assetsManager = new BABYLON.AssetsManager(scene);

            // lights in scene
            var light = new BABYLON.DirectionalLight("DirectionalLight1", new BABYLON.Vector3(4, -1, 2), scene);  
            var lightSecond = new BABYLON.DirectionalLight("DirectionalLight2", new BABYLON.Vector3(2, -1, 3), scene);
            var lightThird= new BABYLON.DirectionalLight("DirectionalLight3", new BABYLON.Vector3(-2, -1, -3), scene);
            
            light.intensity = 5;
            lightSecond.intensity = 4;
            light.specular = new BABYLON.Color3(0, 0, 0);
            lightSecond.specular = new BABYLON.Color3(0, 0, 0);
            lightThird.specular = new BABYLON.Color3(0, 0, 0);

            // this adds a lot of light
            var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
            hemiLight.specular = new BABYLON.Color3(0, 0, 0);

            // create lightmap texture & shadow generator
            lightmap = new BABYLON.Texture("../textures/Lightmap-0_comp_light.exr", scene);
            shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
            floorPlanMaterial = new BABYLON.Texture("../textures/Floorplan_2_Base.png", scene);

            // for multiple loaded glbs
            fileArray.forEach(file => {
                const path = decodePath(file);
                console.log('path: ', path);

                // .addMeshTask(taskName, meshesNames, rootUrl, sceneFilename)
                const meshTask = assetsManager.addMeshTask(path[1], '', path[0], path[1]);
                meshTask.onSuccess = function (task){
                    
                    task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
                    task.loadedAnimationGroups[0].stop();   // stops default anim from playing
                    // console.log('task: ', task);

                    // assigning animations from imported glbs
                    if (task.name === "officeBlockMoreAnims.glb") {
                        console.log('Transfering animation from: ', task.name);
                        officeFace01Contract = task.loadedAnimationGroups[0];
                        officeFace01Expand = task.loadedAnimationGroups[1];
                        officeFace02Contract = task.loadedAnimationGroups[2];
                        officeFace02Expand = task.loadedAnimationGroups[3];
                        officeFace03Contract = task.loadedAnimationGroups[5];
                        officeFace03Expand = task.loadedAnimationGroups[4];
                        officeFace04Contract = task.loadedAnimationGroups[6];
                        officeFace04Expand = task.loadedAnimationGroups[7];
                        officeFace05Contract = task.loadedAnimationGroups[8];
                        officeFace05Expand = task.loadedAnimationGroups[9];
                        buidlingGroundContract = task.loadedAnimationGroups[10];
                        buildingGroundExpand = task.loadedAnimationGroups[11];
                    } else if (task.name === "floorPlanMultipleForAnim.glb") {
                        console.log('Transfering animation from: ', task.name);
                        floor1Contract = task.loadedAnimationGroups[8];
                        floor1Expand = task.loadedAnimationGroups[9];
                        floor2Contract = task.loadedAnimationGroups[4];
                        floor2Expand = task.loadedAnimationGroups[5];
                        floor3Contract = task.loadedAnimationGroups[0];
                        floor3Expand = task.loadedAnimationGroups[1];
                        floor4Contract = task.loadedAnimationGroups[12];
                        floor4Expand = task.loadedAnimationGroups[13];
                        floor5Contract = task.loadedAnimationGroups[16];
                        floor5Expand = task.loadedAnimationGroups[17];
                    } else {
                        console.log("ERROR: No task to transfer animations from...");
                    }
                }

                meshTask.onError = function(task, message, exception){
                    console.log(message, exception);
                }
            });

            assetsManager.onFinish = function (tasks) {
                var buildingFace01 = scene.getMeshByName("officeFace01");
                var buildingFace02 = scene.getMeshByName("officeFace02");
                var buildingFace03 = scene.getMeshByName("officeFace03");
                var buildingFace04 = scene.getMeshByName("officeFace04");
                var buildingFace05 = scene.getMeshByName("officeFace05");
                var buidlingGround = scene.getMeshByName("officeGround");
                var floorOne = scene.getMeshByName("2.5D Floorplan.001");
                var floorTwo = scene.getMeshByName("2.5D Floorplan.002");
                var floorThree = scene.getMeshByName("2.5D Floorplan.003");
                var floorFour = scene.getMeshByName("2.5D Floorplan.004");
                var floorFive = scene.getMeshByName("2.5D Floorplan.005");

                //****************************************************//
                //  Over/Out <= this is it!!!! for hover flash anims  //
                //****************************************************//
                var makeOverOut = function (mesh) {
                    var check = mesh.name.includes('officeFace');
                    // console.log('makeOverOut: ', check);
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function () {
                            if (check > 0) {
                                hl.addMesh(buildingFace01, BABYLON.Color3.Teal());
                                hl.addMesh(buildingFace02, BABYLON.Color3.Teal());
                                hl.addMesh(buildingFace03, BABYLON.Color3.Teal());
                                hl.addMesh(buildingFace04, BABYLON.Color3.Teal());
                                hl.addMesh(buildingFace05, BABYLON.Color3.Teal());
                            } else {
                                hl.addMesh(floorOne, BABYLON.Color3.Teal());
                                hl.addMesh(floorTwo, BABYLON.Color3.Teal());
                                hl.addMesh(floorThree, BABYLON.Color3.Teal());
                                hl.addMesh(floorFour, BABYLON.Color3.Teal());
                                hl.addMesh(floorFive, BABYLON.Color3.Teal());
                            }
                        })
                    );
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function () {
                            if (check > 0) {
                                hl.removeMesh(buildingFace01);
                                hl.removeMesh(buildingFace02);
                                hl.removeMesh(buildingFace03);
                                hl.removeMesh(buildingFace04);
                                hl.removeMesh(buildingFace05);
                            } else {
                                hl.removeMesh(floorOne, BABYLON.Color3.Teal());
                                hl.removeMesh(floorTwo, BABYLON.Color3.Teal());
                                hl.removeMesh(floorThree, BABYLON.Color3.Teal());
                                hl.removeMesh(floorFour, BABYLON.Color3.Teal());
                                hl.removeMesh(floorFive, BABYLON.Color3.Teal());
                            }
                        })
                    );
                }

                var openBuilding = function () {
                    officeFace01Contract.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace02Contract.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace03Contract.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace04Contract.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace05Contract.start(false, 1.0, frameRate, frameRate * 12, false);
                    buidlingGroundContract.start(false, 1.0, frameRate, frameRate * 12, false);
                    floor1Expand.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor2Expand.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor3Expand.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor4Expand.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor5Expand.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    expand = !expand;
                    floorExpand = !floorExpand;
                    // button1.isVisible = true;
                }

                var closeBuilding = function () {
                    officeFace01Expand.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace02Expand.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace03Expand.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace04Expand.start(false, 1.0, frameRate, frameRate * 12, false);
                    officeFace05Expand.start(false, 1.0, frameRate, frameRate * 12, false);
                    buildingGroundExpand.start(false, 1.0, frameRate, frameRate * 12, false);
                    floor1Contract.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor2Contract.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor3Contract.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor4Contract.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    floor5Contract.start(false, 1.0, frameRate * 16, frameRate * 32, false);
                    expand = !expand;
                    floorExpand = !floorExpand;
                }

                var meshClick = function (mesh) {
                    // console.log('MeshClick: ', mesh);
                    var check = mesh.name.includes('officeFace');
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                            if (check > 0) {
                                openBuilding();
                            } else {
                                closeBuilding();
                            }
                        })
                    );
                }

                var editMesh = function (mesh) {
                    var check = mesh.name.includes('office');

                    if (check > 0) {
                        mesh.receiveShadows = true;
                        shadowGenerator.addShadowCaster(mesh);
                    } else {
                        mesh.material.albedoTexture = floorPlanMaterial;
                        mesh.material.alpha = 0.2;
                    }
                }

                if (!buildingFace01) {
                    console.log('there is no building');
                } else if (!floorOne) {
                    console.log('there is no floorplan');
                } else {
                    console.log('there is a building: ', buildingFace01);
                    console.log('there are also floorPlans, eg: ', floorOne);

                    buildingFace01.actionManager = new BABYLON.ActionManager(scene);
                    buildingFace02.actionManager = new BABYLON.ActionManager(scene);
                    buildingFace03.actionManager = new BABYLON.ActionManager(scene);
                    buildingFace04.actionManager = new BABYLON.ActionManager(scene);
                    buildingFace05.actionManager = new BABYLON.ActionManager(scene);
                    buidlingGround.actionManager = new BABYLON.ActionManager(scene);
                    floorOne.actionManager = new BABYLON.ActionManager(scene);
                    floorTwo.actionManager = new BABYLON.ActionManager(scene);
                    floorThree.actionManager = new BABYLON.ActionManager(scene);
                    floorFour.actionManager = new BABYLON.ActionManager(scene);
                    floorFive.actionManager = new BABYLON.ActionManager(scene);

                    editMesh(buildingFace01);
                    editMesh(buildingFace02);
                    editMesh(buildingFace03);
                    editMesh(buildingFace04);
                    editMesh(buildingFace05);
                    editMesh(buidlingGround);
                    editMesh(floorOne);
                    editMesh(floorTwo);
                    editMesh(floorThree);
                    editMesh(floorFour);
                    editMesh(floorFive);

                    makeOverOut(buildingFace01);
                    makeOverOut(buildingFace02);
                    makeOverOut(buildingFace03);
                    makeOverOut(buildingFace04);
                    makeOverOut(buildingFace05);
                    makeOverOut(floorOne);
                    makeOverOut(floorTwo);
                    makeOverOut(floorThree);
                    makeOverOut(floorFour);
                    makeOverOut(floorFive);

                    meshClick(buildingFace01);
                    meshClick(buildingFace02);
                    meshClick(buildingFace03);
                    meshClick(buildingFace04);
                    meshClick(buildingFace05);
                    meshClick(buidlingGround);
                    meshClick(floorOne);
                    meshClick(floorTwo);
                    meshClick(floorThree);
                    meshClick(floorFour);
                    meshClick(floorFive);
                }
            };
            assetsManager.load();
        };

        // this loads fifth (5)
        this.loadGLTF = function(fileArray){
            loadBJS.then(function(fulfilled){
                console.log("loadGLTF");
                loadGLTFAux(fileArray);                
            })
            .catch(function (error){
                console.log(error.message);
            });
        };

        let changeBGColorAux = function(color){
            const s = scene;
            // s.clearColor = new BABYLON.Color3.FromHexString(color);
            s.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        };

        this.changeBGColor = function(color){
            loadBJS.then(function(fulfilled){
                changeBGColorAux(color);                
            })
            .catch(function (error){
                console.log(error.message);
            });
        };

        // separates path from file name in given resource
        // this loads sixth (6)
        let decodePath = function(path){
            console.log("decodePath");
            const fileStart = path.lastIndexOf('/') + 1;
            const fileName = path.substring(fileStart);
            const filePath = path.substring(0, fileStart);
            //console.log(fileName);
            return [filePath, fileName];
        };
    }

    /*HANDLING ATTRIBUTES*/
    static get observedAttributes(){
        return ['src', 'background-color'];
    }

    // this was called second (2) and third (3)
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'src':
                // (3)
                console.log(`loading ${newValue}`);  
                let urlArray = newValue.split("|");
                console.log(`loading `, urlArray);  
                this.loadGLTF(urlArray); 
                break;
            case 'background-color':
                // (2)
                console.log(`changing color to ${newValue} from ${oldValue}`);
                this.changeBGColor(newValue);                
                break;            
            default:
                break;
        }
    }

    get modelUrl(){
        return this.getAttribute('model-url');
    }

    get backgroundColor(){
        return this.getAttribute('background-color');
    }

    set modelUrl(newValue){
        this.setAttribute('model-url', newValue);
    }

    set backgroundColor(newValue){
        this.setAttribute('background-color', newValue);
    }
}

//creates the custom element and links it to the Model3d class
customElements.define('model-3d', Model3d);