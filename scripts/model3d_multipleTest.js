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

        //meshes
        var building;
        var buidlingGround;
        var floorOne;
        var floorTwo;
        var floorThree;
        var floorFour;
        var floorFive;

        // animation groups and animation stuff
        var buildingAnimExpand;
        var buildingAnimContract;
        var expand = true;
        var animating = false;

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
        var floor4Expand;
        var floor4Contract;
        var floor4Focus;
        var floor4Unfocus;
        var floor5Expand;
        var floor5Contract;
        var floor5Focus;
        var floor5Unfocus;
        var floorExpand = false;
        var floorFocus = false;

        //sets up the babylon environment for loading object into it
        //this was called fourth (4)
        function setUp3DEnvironment(){
            console.log("setUp3DEnvironment");
            const engine = new BABYLON.Engine(cnv, true);

            let createScene = function() {
                var scene = new BABYLON.Scene(engine);
                // scene.clearColor = new BABYLON.Color3(1, 100, 1);
                // scene.createDefaultCameraOrLight(true, true, true);

                // Parameters: name, alpha, beta, radius, target position (x, y, z), scene
                // var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(15, 0, 22), scene);
                var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);

                // lights in scene
                var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene);  
                var lightSecond = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(2, 1, -3), scene);
                var lightThird= new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-2, -1, 3), scene);

                // GUI
                var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Building");
                button1.width = "150px"
                button1.height = "40px";
                button1.color = "white";
                button1.cornerRadius = 15;
                button1.background = "black";
                button1.onPointerClickObservable.add(function() {

                    console.log('button: ', button1);
                    console.log('building from button: ', building);

                    animateBuilding();
                    zoomFloors();

                    // building.actionManager = new BABYLON.ActionManager(scene);

                    // building.actionManager.registerAction(
                    //     new BABYLON.InterpolateValueAction (
                    //         BABYLON.ActionManager.OnPickUpTrigger,
                    //         building,
                    //         "scaling",
                    //         new BABYLON.Vector3(1.1, 1.1, 1.1),
                    //         800
                    //     )
                    // ).then(
                    //     new BABYLON.InterpolateValueAction (
                    //         BABYLON.ActionManager.OnPickUpTrigger,
                    //         building,
                    //         "scaling",
                    //         new BABYLON.Vector3(1, 1, 1),
                    //         800
                    //     )
                    // );
                });
                button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                advancedTexture.addControl(button1);    

                var frameRate = 24;

                // animation loop for camera to sweep round
                // (name, property, frames per second, property type, loop mode)
                var rotate = new BABYLON.Animation(
                    "rotate",
                    "alpha",
                    frameRate,
                    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
                );

                var rotate_keys = [];

                rotate_keys.push({
                    frame: 0,
                    value: 0
                });

                rotate_keys.push({
                    frame: frameRate * 8,
                    value: Math.PI
                });

                rotate_keys.push({
                    frame: frameRate * 16,
                    value: Math.PI * 2
                });

                rotate.setKeys(rotate_keys);
                
                // Positions the camera overwriting alpha, beta, radius
                camera.setPosition(new BABYLON.Vector3(0, 30, 120));
                // camera.attachControl(cnv, true);

                //so beginDirectAnimation didn't work... this did instead
                camera.animations.push(rotate);

                // attempt to create actionManager for scene for controlling building anim
                // var inputMap = {};
                // scene.actionManager = new BABYLON.ActionManager(scene);
                // scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                //     BABYLON.ActionManager.OnKeyDownTrigger, function (event) {
                //         console.log('button pressed?')
                //         animateBuilding();
                // }));

                function animateBuilding() {
                    // animating = true;
                                        
                    // if (animating == true) {
                        
                    // }    
                    // animating = false;

                    // start(loop?: boolean, speedRatio?: number, from?: number, to?: number, isAdditive?: boolean)
                    if (expand == true) {
                        console.log('building expand');
                        buildingAnimExpand.start(false, 1.0, frameRate, frameRate * 16, false);
                    } else {
                        console.log('contract');
                        buildingAnimContract.start(false, 1.0, frameRate, frameRate * 16, false);
                    }
                    expand = !expand;
                };    
                
                function zoomFloors() {
                    
                    if (floorExpand == true) {
                        console.log('floor expand');
                        floor1Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor2Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor3Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor4Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor5Expand.start(false, 1.0, frameRate, frameRate * 16, false);
                    } else {
                        floor1Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor2Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor3Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor4Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                        floor5Contract.start(false, 1.0, frameRate, frameRate * 16, false);
                    }
                    floorExpand = !floorExpand;
                }

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
        let loadGLTFAux = function(fileArray){
            console.log('file: ', fileArray);
            scene.meshes.pop();
            var assetsManager = new BABYLON.AssetsManager(scene);

            fileArray.forEach(file => {
                const path = decodePath(file);
                console.log('path: ', path);

                // taskName, meshesNames, rootUrl, sceneFilename
                const meshTask = assetsManager.addMeshTask(path[1], '', path[0], path[1]);
                meshTask.onSuccess = function (task){
                    
                    task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
                    task.loadedAnimationGroups[0].stop();   // stops default anim
                    console.log('task: ', task);

                    if (task.name === "officeBlock.glb") {
                        console.log('Transfering animation from: ', task.name);
                        buildingAnimContract = task.loadedAnimationGroups[0];
                        buildingAnimExpand = task.loadedAnimationGroups[1];
                    } else if (task.name === "floorPlanMultipleForAnim.glb") {
                        console.log('Transfering animation from: ', task.name);
                        floor1Contract = task.loadedAnimationGroups[6];
                        floor1Expand = task.loadedAnimationGroups[7];
                        floor1Focus = task.loadedAnimationGroups[8];
                        floor1Unfocus = task.loadedAnimationGroups[9];
                        floor2Contract = task.loadedAnimationGroups[2];
                        floor2Expand = task.loadedAnimationGroups[3];
                        floor2Focus = task.loadedAnimationGroups[4];
                        floor2Unfocus = task.loadedAnimationGroups[5];
                        floor3Contract = task.loadedAnimationGroups[0];
                        floor3Expand = task.loadedAnimationGroups[1];
                        floor4Contract = task.loadedAnimationGroups[10];
                        floor4Expand = task.loadedAnimationGroups[11];
                        floor4Focus = task.loadedAnimationGroups[12];
                        floor4Unfocus = task.loadedAnimationGroups[13];
                        floor5Contract = task.loadedAnimationGroups[14];
                        floor5Expand = task.loadedAnimationGroups[15];
                        floor5Focus = task.loadedAnimationGroups[16];
                        floor5Unfocus = task.loadedAnimationGroups[17];
                    } else {
                        console.log("ERROR: No task to transfer animations from...")
                    }
                    
                }

                meshTask.onError = function(task, message, exception){
                    console.log(message, exception);
                }
            });

            assetsManager.onFinish = function (tasks) {
                building = scene.getMeshByName("SiteOffice001");
                buidlingGround = scene.getMeshByName("SiteOffice_Ground");
                console.log('building: ', building);

                if (!building) {
                    console.log('there is no building: ', building);
                } else {
                    console.log('there is a building: ', building);

                    building.actionManager = new BABYLON.ActionManager(scene);
                    buidlingGround.actionManager = new BABYLON.ActionManager(scene);

                    // building.actionManager.registerAction(
                    //     new BABYLON.InterpolateValueAction (
                    //         BABYLON.ActionManager.OnPickUpTrigger,
                    //         building,
                    //         "scaling",
                    //         new BABYLON.Vector3(1.5, 1.5, 1.5),
                    //         800
                    //     )
                    // ).then (
                    //     new BABYLON.InterpolateValueAction (
                    //         BABYLON.ActionManager.OnPickUpTrigger,
                    //         building,
                    //         "scaling",
                    //         new BABYLON.Vector3(1, 1, 1),
                    //         800
                    //     )
                    // );

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