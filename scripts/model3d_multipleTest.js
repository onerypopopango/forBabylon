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

        // animation groups and animation stuff
        var buildingAnimExpand;
        var buildingAnimContract;
        var expand = false;
        var animating = false;

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

                    building.actionManager = new BABYLON.ActionManager(scene);

                    building.actionManager.registerAction(
                        new BABYLON.InterpolateValueAction (
                            BABYLON.ActionManager.OnPickUpTrigger,
                            building,
                            "scaling",
                            new BABYLON.Vector3(1.1, 1.1, 1.1),
                            800
                        )
                    ).then(
                        new BABYLON.InterpolateValueAction (
                            BABYLON.ActionManager.OnPickUpTrigger,
                            building,
                            "scaling",
                            new BABYLON.Vector3(1, 1, 1),
                            800
                        )
                    );

                    // building.actionManager.registerAction(
                    //     new BABYLON.InterpolateValueAction (
                    //         BABYLON.ActionManager.OnPickUpTrigger,
                    //         this.building,
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
                camera.attachControl(cnv, true);

                //so beginDirectAnimation didn't work... this did instead
                camera.animations.push(rotate);

                // attempt to create actionManager for scene
                var inputMap = {};
                scene.actionManager = new BABYLON.ActionManager(scene);
                scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnKeyDownTrigger, function (event) {
                        console.log('button pressed?')
                        animateBuilding();
                }));

                function animateBuilding() {
                    animating = true;
                    expand = !expand;

                    if (animating == true) {
                        if (expand == true) {
                            console.log('expand');
                            buildingAnimExpand.start(true, 1.0, frameRate, frameRate * 16, false);
                            animating = false;
                        } else {
                            console.log('contract');
                            buildingAnimContract.start(true, 1.0, frameRate, frameRate * 16, false);
                            animating = false;
                        }
                    } 

                    stopAnim();
                };         
                
                function stopAnim() {
                    if (animating == false) {
                        buildingAnimContract.stop();
                        buildingAnimExpand.stop();
                    }
                };

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

                    console.log('task: ', task);
                    task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
                    task.loadedAnimationGroups[0].stop();   // stops default anim

                    buildingAnimContract = task.loadedAnimationGroups[0];
                    buildingAnimExpand = task.loadedAnimationGroups[1];
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

        //this loads fifth (5)
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

        //separates path from file name in given resource
        //this loads sixth (6)
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

    //this was called second (2) and third (3)
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'src':
                //(3)
                console.log(`loading ${newValue}`);  
                let urlArray = newValue.split("|");
                console.log(`loading `, urlArray);  
                this.loadGLTF(urlArray); 
                break;
            case 'background-color':
                //(2)
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