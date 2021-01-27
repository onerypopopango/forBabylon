// this is an attempt to clean up the individual javascript files
// with reusable code and such faked js overloading
class BabylonCall {

    ///****************************************************************************///
    //overloadingFunctions section
    attributeChangedCallback() {
        var forSingleModel = function (name, oldValue, newValue) {
            switch (name) {
                case 'src':
                    //(3)
                    console.log(`loading ${newValue}...` );    
                    this.loadGLTF(newValue); 
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

        var forMultipleModels = function (name, oldValue, newValue) {
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

        // this helps select with function to use based on arg type
        if (Array.isArray(arguments[2])) { 
            return forMultipleModels(arguments); 
        } else { 
            return forSingleModel(arguments); 
        } 
    }
    ///****************************************************************************///

    set setCanvas(cnv) {
        this.cnv = cnv;
    } 

    get getCanvas() {
        return this.cnv;
    }

    constructor() {
        
        let cnv;
        let scene = null;
        let BJSloaded = false;

        //sets up the babylon environment for loading object into it
        //this was called fourth (4)
        function setUp3DEnvironment(){
            console.log("setUp3DEnvironment");
            const engine = new BABYLON.Engine(cnv, true);

            let createScene = function() {
                var scene = new BABYLON.Scene(engine);
                // scene.clearColor = new BABYLON.Color3(1, 100, 1);
                // scene.createDefaultCameraOrLight(true, true, true);

                // Parameters: name, alpha, beta, radius, target position, scene
                var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(15, 0, 22), scene);
                var light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene);  
                var frameRate = 24;

                //for camera to sweep round
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
                camera.setPosition(new BABYLON.Vector3(0, 30, 60));
                camera.attachControl(cnv, true);

                //so beginDirectAnimation didn't work... this did instead
                camera.animations.push(rotate);
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



                const meshTask = assetsManager.addMeshTask(path[1], '', path[0], path[1]);
                meshTask.onSuccess = function (task){
                    task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
                }
                meshTask.onError = function(task, message, exception){
                    console.log(message, exception);
                }
            });

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

        ///*****************************************///
        // function to change bg colour of babylonjs
        let changeBGColorAux = function(color){
            const s = scene;
            s.clearColor = new BABYLON.Color3.FromHexString(color);
        };

        this.changeBGColor = function(color){
            loadBJS.then(function(fulfilled){
                changeBGColorAux(color);                
            })
            .catch(function (error){
                console.log(error.message);
            });
        };
        ///*****************************************///

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
}

export { BabylonCall };