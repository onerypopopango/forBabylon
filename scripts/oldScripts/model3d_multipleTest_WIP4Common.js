import { BabylonCall } from './common_functions.js';

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
        BabylonCall.setCanvas(cnv);
    }

    /*HANDLING ATTRIBUTES*/
    static get observedAttributes(){
        return ['src', 'background-color'];
    }

    //this was called second (2) and third (3)
    attributeChangedCallback(name, oldValue, newValue) {
        BabylonCall.attributeChangedCallback(name, oldValue, newValue);
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