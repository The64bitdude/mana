import React, {DOMAttributes, HTMLAttributes, LegacyRef, useId, useRef} from "react";
import {JSX} from "react/jsx-runtime";


export namespace ReactElement {
    export type Tags = JSX.IntrinsicElements;
    export type Tag = keyof Tags;
    export type Props<H extends Tag> = H extends Tag?Tags[H] extends React.DetailedHTMLProps<infer P,infer T>?P:never:never;
    export type Events<H extends Tag> = H extends Tag?{[P in keyof Props<H> as P extends `on${infer X}`?P:never]:Props<H>[P]}:never;
    export type NoEventProps<H extends Tag> =H extends Tag ? Omit<Props<H>,keyof Events<H>>:never;
    export type Elem<H extends Tag> = H extends Tag ? Tags[H] extends React.DetailedHTMLProps<infer P, infer T> ? T: never : never;
    export type ElementProps<H extends Tag> = Props<H>&{tagName:H}&{ref?: LegacyRef<Elem<H>>};
    export function ReactElem<H extends Tag>(_props: ElementProps<H>) {
        return React.createElement<Props<H>,Elem<H>>(_props.tagName, _props as any)
    }
    export function useConst<T>(init:()=>T){
        const ref = useRef<T>(null);
        if(ref.current===null){
            // @ts-ignore
            ref.current=init();
        }
        return ref.current;

    }
}