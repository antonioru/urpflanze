import Vec2 from "../../core/math/Vec2";
import Scene from "../../core/Scene";
import Timeline from "../timeline/Timeline";
import SceneUtilities from "../scene-utilities/SceneUtilities";
import FrameBuffer from "./FrameBuffer";
import Emitter from "../events/Emitter";
import { now } from "../../core/Utilites";
class DrawerCanvas extends Emitter {
    constructor(scene, canvasOrContainer, drawOptions = {}, ratio = undefined, resolution = 0, bBuffering = false) {
        var _a, _b, _c, _d, _e, _f, _g;
        super();
        this.bBuffering = false;
        this.timeline = new Timeline();
        this.resolution = resolution || (scene && scene.width ? scene.width : 0);
        this.ratio = ratio || (scene && scene.width && scene.height ? scene.width / scene.height : 1);
        this.bBuffering = bBuffering;
        this.buffer = new FrameBuffer();
        if (scene) {
            const width = this.ratio >= 1 ? scene.width : scene.width * this.ratio;
            const height = this.ratio >= 1 ? scene.height / this.ratio : scene.height;
            scene.resize(width, height);
            this.setScene(scene);
        }
        if ((typeof HTMLCanvasElement !== 'undefined' && canvasOrContainer instanceof HTMLCanvasElement) ||
            (typeof OffscreenCanvas !== 'undefined' && canvasOrContainer instanceof OffscreenCanvas)) {
            const canvas = canvasOrContainer;
            this.setCanvas(canvas);
        }
        else if (canvasOrContainer) {
            const canvas = document.createElement('canvas');
            const container = canvasOrContainer;
            container.appendChild(canvas);
            this.setCanvas(canvas);
        }
        this.drawOptions = {
            scale: (_a = drawOptions.scale) !== null && _a !== void 0 ? _a : 1,
            translate: (_b = drawOptions.translate) !== null && _b !== void 0 ? _b : [0, 0],
            time: (_c = drawOptions.time) !== null && _c !== void 0 ? _c : 0,
            simmetricLine: (_d = drawOptions.simmetricLine) !== null && _d !== void 0 ? _d : 0,
            clearCanvas: (_e = drawOptions.clearCanvas) !== null && _e !== void 0 ? _e : true,
            fixedLineWidth: (_f = drawOptions.fixedLineWidth) !== null && _f !== void 0 ? _f : false,
            noBackground: (_g = drawOptions.noBackground) !== null && _g !== void 0 ? _g : false,
            ghosts: drawOptions.ghosts || 0,
            ghost_skip_time: drawOptions.ghost_skip_time || 0,
            ghost_skip_function: drawOptions.ghost_skip_function,
            backgroundImage: drawOptions.backgroundImage,
        };
        this.draw_id = null;
        this.redraw_id = null;
        this.animation_id = null;
        this.draw = this.draw.bind(this);
        this.animate = this.animate.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
    }
    setBuffering(bBuffering) {
        this.bBuffering = bBuffering;
        this.flushBuffer();
    }
    getBBuffering() {
        return this.bBuffering;
    }
    setScene(scene) {
        this.scene = scene;
        if (!this.resolution && this.scene.width)
            this.resolution = this.scene.width;
        if (this.canvas) {
            this.setCanvas(this.canvas);
        }
    }
    getScene() {
        return this.scene;
    }
    getTimeline() {
        return this.timeline;
    }
    setCanvas(canvasOrContainer) {
        let canvas;
        if (typeof HTMLElement !== 'undefined' && canvasOrContainer instanceof HTMLElement) {
            if (typeof HTMLCanvasElement !== 'undefined' && canvasOrContainer instanceof HTMLCanvasElement) {
                canvas = canvasOrContainer;
            }
            else {
                canvas = (this.canvas || document.createElement('canvas'));
                while (canvasOrContainer.lastChild)
                    canvasOrContainer.removeChild(canvasOrContainer.lastChild);
                canvasOrContainer.appendChild(canvas);
            }
        }
        else {
            canvas = canvasOrContainer;
        }
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d', {
            alpha: true,
            desynchronized: false,
        });
        this.resize(this.scene.width, this.scene.height);
    }
    getCanvas() {
        return this.canvas;
    }
    getContext() {
        return this.context;
    }
    resize(width, height, ratio, resolution) {
        const dpi = 1;
        ratio = ratio || this.ratio || width / height;
        const size = Math.max(width, height);
        width = ratio >= 1 ? size : size * ratio;
        height = ratio >= 1 ? size / ratio : size;
        this.ratio = ratio;
        if (this.scene)
            this.scene.resize(width, height);
        if (this.canvas) {
            this.canvas.width = width * dpi;
            this.canvas.height = height * dpi;
            if (typeof HTMLCanvasElement !== 'undefined' && this.canvas instanceof HTMLCanvasElement) {
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
            }
        }
        if (resolution && resolution != this.resolution && this.scene) {
            this.resolution = resolution;
            Scene.walk((sceneChild) => {
                const props = sceneChild.data.props;
                Object.keys(props).forEach(name => {
                    SceneUtilities.setProp(sceneChild, name, props[name], this);
                });
            }, this.scene);
        }
        this.flushBuffer();
        this.dispatch('drawer-canvas:resize');
    }
    flushBuffer() {
        if (this.bBuffering) {
            this.buffer.flush();
            this.dispatch('drawer-canvas:buffer_flush');
        }
    }
    getRenderedFrames() {
        if (this.bBuffering) {
            return this.buffer.getRenderedFrames();
        }
        return [];
    }
    setRatio(ratio) {
        this.resize(this.scene.width, this.scene.height, ratio);
    }
    getRatio() {
        return this.ratio;
    }
    getResolution() {
        return this.resolution;
    }
    setResolution(resolution) {
        this.resize(this.scene.width, this.scene.height, this.ratio, resolution);
    }
    getValueFromResolution(value) {
        return (value * this.resolution) / 200;
    }
    getValueFromResolutionScaled(value) {
        return (value * 200) / this.resolution;
    }
    setOption(name, value) {
        if (typeof name == 'object') {
            const keys = Object.keys(name);
            for (let i = 0, len = keys.length; i < len; i++) {
                this.drawOptions[keys[i]] = name[keys[i]];
            }
        }
        else {
            this.drawOptions[name] = value;
        }
        this.flushBuffer();
    }
    getOption(name, default_value) {
        var _a;
        return (_a = this.drawOptions[name]) !== null && _a !== void 0 ? _a : default_value;
    }
    getOptions() {
        return this.drawOptions;
    }
    animate(timestamp) {
        if (this.timeline.bSequenceStarted()) {
            this.animation_id = requestAnimationFrame(this.animate);
            if (this.timeline.tick(timestamp))
                this.draw();
        }
    }
    startAnimation() {
        this.stopAnimation();
        this.timeline.start();
        this.animation_id = requestAnimationFrame(this.animate);
    }
    stopAnimation() {
        this.timeline.stop();
        if (this.animation_id)
            cancelAnimationFrame(this.animation_id);
    }
    pauseAnimation() {
        this.timeline.pause();
        if (this.animation_id)
            cancelAnimationFrame(this.animation_id);
    }
    playAnimation() {
        this.timeline.start();
        requestAnimationFrame(this.animate);
    }
    draw() {
        var _a, _b;
        let draw_time = 0;
        const drawOptions = Object.assign({}, this.drawOptions);
        drawOptions.ghost_index = undefined;
        drawOptions.clearCanvas = this.drawOptions.clearCanvas || this.timeline.getCurrentFrame() <= 0;
        drawOptions.time = this.timeline.getTime();
        const current_frame = this.timeline.getFrameAtTime(drawOptions.time);
        this.dispatch('drawer-canvas:before_draw', {
            current_frame: current_frame,
            current_time: drawOptions.time,
        });
        if (this.bBuffering && this.buffer.exist(current_frame)) {
            (_a = this.context) === null || _a === void 0 ? void 0 : _a.putImageData(this.buffer.get(current_frame), 0, 0);
        }
        else {
            draw_time += DrawerCanvas.draw(this.scene, this.context, drawOptions, this.resolution);
            if (drawOptions.ghosts) {
                const time = this.timeline.getTime();
                const sequenceEndTime = this.timeline.getSequenceEndTime();
                for (let i = 1; i <= drawOptions.ghosts; i++) {
                    const ghostTime = time -
                        (drawOptions.ghost_skip_function
                            ? drawOptions.ghost_skip_function(i)
                            : i * ((_b = drawOptions.ghost_skip_time) !== null && _b !== void 0 ? _b : 30));
                    drawOptions.clearCanvas = false;
                    drawOptions.ghost_index = i;
                    drawOptions.time =
                        ghostTime < 0
                            ? ghostTime + sequenceEndTime
                            : ghostTime > sequenceEndTime
                                ? ghostTime % sequenceEndTime
                                : ghostTime;
                    draw_time += DrawerCanvas.draw(this.scene, this.context, drawOptions, this.resolution);
                }
            }
            if (this.bBuffering && this.context) {
                this.buffer.push(current_frame, this.context);
                if (this.buffer.count() >= this.timeline.getFramesCount()) {
                    this.dispatch('drawer-canvas:buffer_loaded');
                }
            }
        }
        return draw_time;
    }
    redraw() {
        if (!this.timeline.bSequenceStarted()) {
            this.draw_id && cancelAnimationFrame(this.draw_id);
            !this.drawOptions.clearCanvas &&
                (typeof this.drawOptions.ghosts == undefined || this.drawOptions.ghosts == 0) &&
                this.timeline.stop();
            this.draw_id = requestAnimationFrame(this.draw);
        }
        else if (!this.drawOptions.clearCanvas &&
            (typeof this.drawOptions.ghosts == undefined || this.drawOptions.ghosts == 0)) {
            this.stopAnimation();
            this.redraw_id && cancelAnimationFrame(this.redraw_id);
            this.redraw_id = requestAnimationFrame(this.startAnimation);
        }
    }
    static draw(scene, context, options, resolution) {
        var _a, _b, _c, _d;
        const start_time = now();
        if (context) {
            const scale = (_a = options.scale) !== null && _a !== void 0 ? _a : 1;
            const translate = (_b = options.translate) !== null && _b !== void 0 ? _b : [0, 0];
            const time = (_c = options.time) !== null && _c !== void 0 ? _c : 0;
            const simmetricLine = (_d = options.simmetricLine) !== null && _d !== void 0 ? _d : 0;
            const fixedLineWidth = options.fixedLineWidth;
            const clearCanvas = options.clearCanvas;
            const noBackground = options.noBackground;
            const backgroundImage = options.backgroundImage;
            const bGhost = typeof options.ghosts !== 'undefined' &&
                options.ghosts > 0 &&
                typeof options.ghost_index !== 'undefined' &&
                options.ghost_index > 0;
            const ghostMultiplier = bGhost
                ? 1 - options.ghost_index / (options.ghosts + 0.5)
                : 1;
            const width = scene.width;
            const height = scene.height;
            const ratio_x = width > height ? 1 : height / width;
            const ratio_y = width > height ? width / height : 1;
            resolution = resolution || width;
            const final_scale = [(width / (resolution / ratio_x)) * scale, (height / (resolution / ratio_y)) * scale];
            const final_translate = [
                width / 2 - (scale > 1 ? (translate[0] * width) / (1 / ((scale - 1) / 2)) : 0),
                height / 2 - (scale > 1 ? (translate[1] * height) / (1 / ((scale - 1) / 2)) : 0),
            ];
            scene.current_time = time;
            scene.getChildren().forEach((sceneChild) => {
                if (!sceneChild.data ||
                    !(sceneChild.data.visible === false) ||
                    !(bGhost && sceneChild.data.disableGhost === true))
                    sceneChild.generate(time, true);
            });
            if (clearCanvas) {
                if (noBackground) {
                    context.clearRect(0, 0, width, height);
                }
                else {
                    context.fillStyle = scene.background;
                    context.fillRect(0, 0, width, height);
                    backgroundImage && context.drawImage(backgroundImage, 0, 0, width, height);
                }
            }
            if (simmetricLine > 0) {
                const offset = Math.PI / simmetricLine;
                const size = Math.max(width, height) / 2;
                const center = [size / 2, size / 2];
                for (let i = 0; i < simmetricLine; i++) {
                    const a = Float32Array.from([-size, -size]);
                    const b = Float32Array.from([size * 2, size * 2]);
                    const rotate = i * offset + Math.PI / 4;
                    Vec2.rotateZ(a, center, rotate);
                    Vec2.rotateZ(b, center, rotate);
                    context.beginPath();
                    context.strokeStyle = scene.mainColor;
                    context.lineWidth = 1;
                    context.moveTo((a[0] - size / 2) * final_scale[0] + final_translate[0], (a[1] - size / 2) * final_scale[1] + final_translate[1]);
                    context.lineTo((b[0] - size / 2) * final_scale[0] + final_translate[0], (b[1] - size / 2) * final_scale[1] + final_translate[1]);
                    context.stroke();
                }
            }
            scene.draw(({ lineWidth, strokeColor, fillColor, shape, buffer, buffer_length, current_buffer_index }) => {
                if (shape.data && (shape.data.visible === false || (bGhost && shape.data.disableGhost === true)))
                    return;
                context.beginPath();
                context.moveTo((buffer[current_buffer_index] - width / 2) * final_scale[0] + final_translate[0], (buffer[current_buffer_index + 1] - height / 2) * final_scale[1] + final_translate[1]);
                for (let i = 2; i < buffer_length; i += 2) {
                    context.lineTo((buffer[current_buffer_index + i] - width / 2) * final_scale[0] + final_translate[0], (buffer[current_buffer_index + i + 1] - height / 2) * final_scale[1] + final_translate[1]);
                }
                shape && shape.isClosed() && context.closePath();
                if (shape && shape.data && shape.data.highlighted) {
                    context.lineWidth = (lineWidth || 1) * 3 * scale;
                    context.strokeStyle = scene.mainColor;
                    context.stroke();
                    return;
                }
                if (fillColor) {
                    if (bGhost) {
                        const color = /\((.+),(.+),(.+),(.+)?\)/g.exec(fillColor);
                        if (color) {
                            let [, a, b, c, o] = color;
                            const alpha = o ? parseFloat(o) : 1;
                            const ghostAlpha = alpha <= 0 ? 0 : alpha * ghostMultiplier;
                            fillColor =
                                fillColor.indexOf('rgb') >= 0
                                    ? `rgba(${a},${b},${c},${ghostAlpha})`
                                    : `hsla(${a},${b},${c},${ghostAlpha})`;
                        }
                    }
                    context.fillStyle = fillColor;
                    context.fill();
                }
                if (strokeColor && lineWidth) {
                    if (bGhost) {
                        const color = /\((.+),(.+),(.+),(.+)?\)/g.exec(strokeColor);
                        if (color) {
                            let [, a, b, c, o] = color;
                            const alpha = o ? parseFloat(o) : 1;
                            const ghostAlpha = alpha <= 0 ? 0 : alpha * ghostMultiplier;
                            strokeColor =
                                strokeColor.indexOf('rgb') >= 0
                                    ? `rgba(${a},${b},${c},${ghostAlpha})`
                                    : `hsla(${a},${b},${c},${ghostAlpha})`;
                        }
                        lineWidth *= ghostMultiplier;
                    }
                    context.lineWidth = fixedLineWidth ? lineWidth : lineWidth * scale;
                    context.strokeStyle = strokeColor;
                    context.stroke();
                }
            });
        }
        const end_time = now();
        return end_time - start_time;
    }
}
export default DrawerCanvas;
//# sourceMappingURL=DrawerCanvas.js.map