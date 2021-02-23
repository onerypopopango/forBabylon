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
        var floor1Expand;
        var floor1Contract;
        var floor1Focus;
        var floor1Unfocus;
        var floor2Expand;
        var floor2Contract;
        var floor2Focus;
        var floor2Unfocus;
        var floor3Expand;
        var floor3Contract;
        var floor3Focus;
        var floor3Unfocus;
        var floor4Expand;
        var floor4Contract;
        var floor4Focus;
        var floor4Unfocus;
        var floor5Expand;
        var floor5Contract;
        var floor5Focus;
        var floor5Unfocus;
        var floorFocus = false;

        var frameRate = 24;
        var camera;
        var floorPlanMaterial;

        // highlight layer
        var hl;

        // sets up the babylon environment for loading object into it
        // this was called fourth (4)
        function setUp3DEnvironment(){
            console.log("setUp3DEnvironment");
            const engine = new BABYLON.Engine(cnv, true);

            let createScene = function() {
                var scene = new BABYLON.Scene(engine);
                // scene.clearColor = new BABYLON.Color3(1, 100, 1);
                // scene.createDefaultCameraOrLight(true, true, true);

                // Parameters: name, alpha, beta, radius, target position (x, y, z), scene
                // var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(15, 0, 22), scene);
                camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);

                // highlight layer
                hl = new BABYLON.HighlightLayer("hl1", scene);
                
                // Positions the camera overwriting alpha, beta, radius
                camera.setPosition(new BABYLON.Vector3(0, 30, 120));
                // camera.attachControl(cnv, true);

                // try this one for auto rotate camera instead...
                camera.useAutoRotationBehavior = true;
                scene.activeCamera.autoRotationBehavior.idleRotationSpeed = 0.5;
                scene.activeCamera.autoRotationBehavior.idleRotationWaitTime = 10;
                scene.activeCamera.autoRotationBehavior.idleRotationSpinupTime = 10;

                // target: any, from: number, to: number, loop?: boolean, 
                // speedRatio?: number, onAnimationEnd?: () => void, animatable?: Animatable, 
                // stopCurrent?: boolean, targetMask?: (target: any) => boolean, onAnimationLoop?: () => void, isAdditive?: boolean
                scene.beginAnimation(camera, 0, frameRate * 16, true);
                
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
            var lightFourth= new BABYLON.DirectionalLight("DirectionalLight3", new BABYLON.Vector3(-1, -1, -3), scene);

            light.intensity = 2;
            light.specular = new BABYLON.Color3(0, 0, 0);
            lightSecond.specular = new BABYLON.Color3(0, 0, 0);
            lightThird.specular = new BABYLON.Color3(0, 0, 0);
            lightFourth.specular = new BABYLON.Color3(0, 0, 0);

            floorPlanMaterial = new BABYLON.Texture("../textures/Floorplan_2_Base.png", scene);

            fileArray.forEach(file => {
                const path = decodePath(file);
                console.log('path: ', path);

                // taskName, meshesNames, rootUrl, sceneFilename
                const meshTask = assetsManager.addMeshTask(path[1], '', path[0], path[1]);
                meshTask.onSuccess = function (task){

                    task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
                    task.loadedAnimationGroups[0].stop();   // stops default anim
                    console.log('task: ', task);

                    // assigning animations from imported glb
                    if (task.name === "floorPlanAnim.glb") {
                        console.log('Transfering animation from: ', task.name);
                        floor1Contract = task.loadedAnimationGroups[8];
                        floor1Expand = task.loadedAnimationGroups[9];
                        floor1Focus = task.loadedAnimationGroups[10];
                        floor1Unfocus = task.loadedAnimationGroups[11];
                        floor2Contract = task.loadedAnimationGroups[4];
                        floor2Expand = task.loadedAnimationGroups[5];
                        floor2Focus = task.loadedAnimationGroups[6];
                        floor2Unfocus = task.loadedAnimationGroups[7];
                        floor3Contract = task.loadedAnimationGroups[0];
                        floor3Expand = task.loadedAnimationGroups[1];
                        floor3Focus = task.loadedAnimationGroups[2];
                        floor3Unfocus = task.loadedAnimationGroups[3];
                        floor4Contract = task.loadedAnimationGroups[12];
                        floor4Expand = task.loadedAnimationGroups[13];
                        floor4Focus = task.loadedAnimationGroups[14];
                        floor4Unfocus = task.loadedAnimationGroups[15];
                        floor5Contract = task.loadedAnimationGroups[16];
                        floor5Expand = task.loadedAnimationGroups[17];
                        floor5Focus = task.loadedAnimationGroups[18];
                        floor5Unfocus = task.loadedAnimationGroups[19];
                    } else {
                        console.log("ERROR: No task to transfer animations from...");
                    }
                }

                meshTask.onError = function(task, message, exception){
                    console.log(message, exception);
                }
            });

            assetsManager.onFinish = function (tasks) {
                var floorOne = scene.getMeshByName("2.5D Floorplan.003");
                var floorTwo = scene.getMeshByName("2.5D Floorplan.002");
                var floorThree = scene.getMeshByName("2.5D Floorplan.001");
                var floorFour = scene.getMeshByName("2.5D Floorplan.004");
                var floorFive = scene.getMeshByName("2.5D Floorplan.005");

                var doorOne = scene.getMeshByName("doorPosition.001");
                var doorTwo = scene.getMeshByName("doorPosition.002");
                var doorThree = scene.getMeshByName("doorPosition.003");
                var doorFour = scene.getMeshByName("doorPosition.004");
                var doorFive = scene.getMeshByName("doorPosition.005");
                var doorSix = scene.getMeshByName("doorPosition.006");
                var doorSeven = scene.getMeshByName("doorPosition.007");
                var doorEight = scene.getMeshByName("doorPosition.008");
                var doorNine = scene.getMeshByName("doorPosition.009");
                var doorTen = scene.getMeshByName("doorPosition.010");
                var doorEleven = scene.getMeshByName("doorPosition.011");
                var doorTwelve = scene.getMeshByName("doorPosition.012");
                var doorThirteen = scene.getMeshByName("doorPosition.013");
                var doorFourteen = scene.getMeshByName("doorPosition.014");
                var doorFifteen = scene.getMeshByName("doorPosition.015");

                var cameraFifteen = scene.getMeshByName("cameraLocation.015");
                var cameraSixteen = scene.getMeshByName("cameraLocation.016");
                var cameraSeventeen = scene.getMeshByName("cameraLocation.017");
                var cameraEighteen = scene.getMeshByName("cameraLocation.018");
                var cameraNineteen = scene.getMeshByName("cameraLocation.019");
                var cameraTwenty = scene.getMeshByName("cameraLocation.020");
                var cameraTwentyone = scene.getMeshByName("cameraLocation.021");

                // GUI
                var gui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                var doorOnline = new BABYLON.GUI.Image("button", "../textures/Icons/DoorContact_online.png");
                doorOnline.width = "50px";
                doorOnline.height = "50px";
                var doorOffline = new BABYLON.GUI.Image("button", "../textures/Icons/DoorContact_offline.png");
                doorOffline.width = "50px";
                doorOffline.height = "50px";
                var doorOrange = new BABYLON.GUI.Image("button", "../textures/Icons/DoorContact_orange.png");
                doorOrange.width = "50px";
                doorOrange.height = "50px";
                var doorRed = new BABYLON.GUI.Image("button", "../textures/Icons/DoorContact_red.png");
                doorRed.width = "50px";
                doorRed.height = "50px";

                // temp
                var doorOnlineOne = new BABYLON.GUI.Image("button", "../textures/Icons/DoorContact_red.png");
                doorOnlineOne.width = "50px";
                doorOnlineOne.height = "50px";
                var doorOnlineTwo = new BABYLON.GUI.Image("button", "../textures/Icons/DoorContact_red.png");
                doorOnlineTwo.width = "50px";
                doorOnlineTwo.height = "50px";
                

                //****************************************************//
                //  Over/Out <= this is it!!!! for hover flash anims  //
                //****************************************************//
                var makeOverOut = function (mesh) {
                    console.log('makeOverOut: ', mesh);
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function () {
                            hl.addMesh(mesh, BABYLON.Color3.Teal());
                        })
                    );
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function () {
                            hl.removeMesh(mesh);
                        })
                    );
                }
                //****************************************************//

                var meshClick = function (mesh) {
                    console.log('MeshClick: ', mesh);
                    mesh.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function () {
                            switch (mesh) {
                                case floorOne: 
                                    console.log('Floor 1 selected...')
                                    if (floorFocus == false) {
                                        floor1Focus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.addControl(doorOnline);
                                        doorOnline.linkWithMesh(doorOne);
                                    } else if (floorFocus == true) {
                                        floor1Unfocus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.removeControl(doorOnline);
                                    };
                                    break;
                                case floorTwo:
                                    console.log('Floor 2 selected...')
                                    if (floorFocus == false) {
                                        floor1Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Focus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.addControl(doorOnline);
                                        doorOnline.linkWithMesh(doorSix);  
                                    } else if (floorFocus == true) {
                                        floor1Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Unfocus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.removeControl(doorOnline);
                                    };
                                    break;
                                case floorThree:
                                    console.log('Floor 3 selected...')
                                    if (floorFocus == false) {
                                        floor1Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Focus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.addControl(doorOnline);
                                        doorOnline.linkWithMesh(doorNine);  
                                    } else if (floorFocus == true) {
                                        floor1Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Unfocus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.removeControl(doorOnline);
                                    };
                                    break;
                                case floorFour:
                                    console.log('Floor 4 selected...')
                                    if (floorFocus == false) {
                                        floor1Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Focus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.addControl(doorOnline);
                                        doorOnline.linkWithMesh(doorTwelve);  
                                    } else if (floorFocus == true) {
                                        floor1Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Unfocus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.removeControl(doorOnline);
                                    };
                                    break; 
                                case floorFive:
                                    console.log('Floor 5 selected...')
                                    if (floorFocus == false) {
                                        floor1Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Focus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.addControl(doorOnline);
                                        gui.addControl(doorOnlineOne);
                                        gui.addControl(doorOnlineTwo);
                                        doorOnline.linkWithMesh(doorFifteen);
                                        doorOnlineOne.linkWithMesh(doorFourteen);
                                        doorOnlineTwo.linkWithMesh(doorThirteen);
                                        camera.setPosition(new BABYLON.Vector3(0, 120, 220));
                                    } else if (floorFocus == true) {
                                        floor1Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor2Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor3Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor4Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                                        floor5Unfocus.start(false, 1.0, frameRate, frameRate * 16, false);
                                        gui.removeControl(doorOnline);
                                        gui.removeControl(doorOnlineOne);
                                        gui.removeControl(doorOnlineTwo);
                                        camera.setPosition(new BABYLON.Vector3(0, 30, 120));
                                    };
                                    break;
                                default:
                                    console.log("no floorplan mesh??")
                            }
                            floorFocus= !floorFocus;
                        })
                    );
                }

                var editMesh = function (mesh) {
                    mesh.material.albedoTexture = floorPlanMaterial;
                    mesh.material.alpha = 0.2;
                }

                if (!floorOne) {
                    console.log('there is no floorplan');
                } else {
                    console.log('there are floorPlans, eg: ', floorOne);

                    floorOne.actionManager = new BABYLON.ActionManager(scene);
                    floorTwo.actionManager = new BABYLON.ActionManager(scene);
                    floorThree.actionManager = new BABYLON.ActionManager(scene);
                    floorFour.actionManager = new BABYLON.ActionManager(scene);
                    floorFive.actionManager = new BABYLON.ActionManager(scene);

                    editMesh(floorOne);
                    editMesh(floorTwo);
                    editMesh(floorThree);
                    editMesh(floorFour);
                    editMesh(floorFive);

                    makeOverOut(floorOne);
                    makeOverOut(floorTwo);
                    makeOverOut(floorThree);
                    makeOverOut(floorFour);
                    makeOverOut(floorFive);

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