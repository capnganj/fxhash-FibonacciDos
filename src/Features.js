import { interpolateYlOrRd, interpolateInferno, interpolateMagma, interpolatePuBuGn, interpolatePlasma, interpolateRdPu, interpolateViridis, interpolateCividis, interpolateYlGnBu, interpolateYlGn, interpolateYlOrBr, interpolateCool, interpolateWarm } from 'd3-scale-chromatic'
import { rgb, hsl, color } from 'd3-color';
import * as THREE from 'three';

class Features {
    constructor() {

        //color palette 
        this.color = {
            name: ""
        };
        this.setColorPalette();


        //how noisy is our color story?
        this.noise = {
            tag: "",
            value: 0
        }
        this.setNoise();

        //background color
        this.background = {
            tag: "",
            value: {}
        }
        this.setBackground();

        //flower geometry parameters
        this.flowerGeometry = {
            width: 0.0,
            height: 0.0,
            factor: 0.0,
            power: 0.0,
        }

        //crystals 
        this.crystalGeometry = {
            g1Tag: "",
            g1Value: {},
            g2Tag: "",
            g2Value: {}
        }
    }

    //map function logic from processing <3
    map(n, start1, stop1, start2, stop2) {
        const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
        return newval;
    }

    //color palette interpolation
    interpolateFn(val) {
        let col;
        switch (this.color.name) {
            case "Ylorrd": 
                col = rgb(interpolateYlOrRd(val));
                break
            case "Rdpu": 
                col = rgb(interpolateRdPu(val));
                break;
            case "Viridis": 
                col = rgb(interpolateViridis(1-val));
                break;
            case "Magma": 
                col = rgb(interpolateMagma(1-val));
                break;
            case "Inferno": 
                col = rgb(interpolateInferno(1-val));
                break;
            case "Plasma": 
                col = rgb(interpolatePlasma(1-val));
                break;
            case "Cividis": 
                col = rgb(interpolateCividis(1-val));
                break;
            case "Ylgn":
                col = rgb(interpolateYlGn(val));
                break;
            case "Ylgnbu":
                col = rgb(interpolateYlGnBu(val));
                break;
            case "Pubugn":
                col = rgb(interpolatePuBuGn(val));
                break;
            case "Ylorbr":
                col = rgb(interpolateYlOrBr(val));
                break;
            case "Cool":
                col = rgb(interpolateCool(1-val));
                break;
            case "Warm":
                col = rgb(interpolateWarm(1-val));
                break;
            default:
                col = rgb(interpolateMagma(val));
        }

        if (this.color.inverted) {
            col = this.invertColor(col) 
        }

        return col;
    }

    //color inverter
    invertColor(rgb, bw) {
        let hex = color(rgb).formatHex()
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // https://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        let inverted = color("#" + padZero(r) + padZero(g) + padZero(b)).rgb();
        return inverted;

        function padZero(str, len) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        }
    }

    //desaturate by some %
    desaturateColor(col, percent) {
        let h = hsl(col);
        h.s = h.s * percent
        return h.rgb();
    }

    //lighten by some %
    lightenColor(col, percent) {
        let h = hsl(col);
        h.l  = h.l * percent;
        return h.rgb();
    }

    //set color palette globally
    setColorPalette() {
        let c = fxrand();

        //set palette

        
        if (c < 0.07) { //1
            this.color.name = "Ylorrd"
        }
        else if (c < 0.11) { //2
            this.color.name = "Rdpu"
        }
        else if (c < 0.19) { //3
            this.color.name = "Ylgn"
        }
        else if (c < 0.25) {  //4
            this.color.name = "Pubugn"
        }
        else if (c < 0.32) { //5
            this.color.name = "Ylgnbu"
        }
        else if (c < 0.41) { //6
            this.color.name = "Viridis" 
        }
        else if (c < 0.49) {  //7
            this.color.name = "Inferno" 
        }
        else if (c < 0.56) {  //8
            this.color.name = "Plasma" 
        }
        else if (c < 0.63) {  //9
            this.color.name = "Cividis" 
        }
        else if (c < 0.72) {  //11
            this.color.name = "Ylorbr" 
        }
        else if (c < 0.82) {  //13
            this.color.name = "Cool" 
        }
        else if (c < 0.92) {  //13
            this.color.name = "Warm" 
        }
        //...
        else {  //12
            this.color.name = "Magma"  
        }

        //inverted?
        if( fxrand() > 0.777 ) {
            this.color.inverted = true;
        }
    }

    setNoise(){
        const n = fxrand();
        if (n < 0.29) {
            this.noise.tag = "Hushed"
            this.noise.value = this.map(n, 0, 1, 0.05, 0.1);
        }
        else if ( n < 0.59) {
            this.noise.tag = "Quiet"
            this.noise.value = this.map(n, 0, 1, 0.12, 0.2);
        }
        else if ( n < 0.89) {
            this.noise.tag = "Loud"
            this.noise.value = this.map(n, 0, 1, 0.2, 0.35);
        }
        else {
            this.noise.tag = "Blown Out"
            this.noise.value = this.map(n, 0, 1, 0.35, 0.5);
        }
        
    }

    setBackground() {
        let b = fxrand();
        if (b < 0.07) {
            this.background.tag = "Rolling Paper";
            this.background.value = rgb(235, 213, 179);
        }
        else if (b < 0.30) {
            this.background.tag = "fxhash Dark";
            this.background.value = rgb(38, 38, 38);
        }
        else if (b < 0.33) {
            this.background.tag = "Newspaper";
            this.background.value = rgb(245, 242, 232);
        }
        else if (b < 0.39) {
            this.background.tag = "Brown Paper Bag";
            this.background.value = rgb(181, 155, 124);
        }
        else if (b < 0.88) {
            this.background.tag = "Palette Light";
            let col = this.color.inverted ? 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.66, 0.9)) : 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.1, 0.33));
            this.background.value = col;
        }
        else {
            this.background.tag = "Palette Dark";
            let col = this.color.inverted ? 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.2, 0.43)) : 
            this.interpolateFn(this.map(fxrand(), 0, 1, 0.56, 0.8));
            this.background.value = col;
        }
    }
}

export { Features }