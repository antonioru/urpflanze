import { EShapePrimitiveAdaptMode } from "../../core/types/shape-base";
import { IShapeLoopAnimation, IVertexCallbackAnimation, TAnimation, TCallableValue } from "./animation";
import { ISceneChildDrawerData, TDrawerValue } from "./drawer";
import { TSceneChildProps } from "./scene-utilities";
/**
 * @category Services.Export/Import
 */
export interface IProjectSequence {
    durate: number;
    framerate: number;
}
/**
 * @category Services.Export/Import
 */
export interface IProject {
    id: string;
    name: string;
    background: string;
    color: string;
    width?: number;
    height?: number;
    resolution?: number;
    ratio: number;
    backgroundImage?: string;
    clear: boolean;
    ghosts: number;
    ghostSkipTime?: number;
    ghostSkipFunction?: number | string | CallableFunction;
    sequence: IProjectSequence;
    scene: {
        [key: string]: IProjectSceneChild;
    };
}
/**
 * @category Services.Export/Import
 */
export interface IProjectSceneChildData extends ISceneChildDrawerData {
    imported?: boolean;
    fillColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    strokeColor?: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
}
/**
 * @category Services.Export/Import
 */
export declare type IProjectSceneChildProps = {
    [k in keyof Omit<TSceneChildProps, 'id' | 'name' | 'order' | 'data' | 'adaptMode' | 'bCloseShape' | 'shape' | 'loop' | 'vertexCallback'>]: TAnimation | TCallableValue<number | Array<number> | string> | TDrawerValue;
} & {
    loop?: IShapeLoopAnimation;
    vertexCallback?: IVertexCallbackAnimation;
};
/**
 * @category Services.Export/Import
 */
export interface IProjectSceneChild {
    type: string;
    id: string;
    name: string;
    order: number;
    data: IProjectSceneChildData;
    adaptMode?: EShapePrimitiveAdaptMode;
    bCloseShape?: boolean;
    bUseParent?: boolean;
    vertexCallback?: string;
    shape?: Float32Array;
    bPrimitive: boolean;
    depth: number;
    props: IProjectSceneChildProps;
    parentId?: string | number;
    children?: Array<IProjectSceneChild>;
}
//# sourceMappingURL=project.d.ts.map