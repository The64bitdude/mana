import {Manager,tsType} from "../StateManager";
import React, {useId} from "react";
import {ManaElem, ManagedElement} from "./ManagedElement";
import {ManaProps,Mana} from "./ManagedHTML";


export namespace ManagedTextArea {
    export type TextAreaType<T extends tsType> = number extends T ? string extends T? "number"|"string"|"custom":"number"|"custom" :  string extends T?"string"|"custom":"custom";
    export type TextAreaTypeProps<T extends tsType,K extends TextAreaType<T>> ={
        outputType:K,
    }&(K extends "custom"?{
        customOutput:(value:string,e:HTMLTextAreaElement)=>T;
        customInput:(value:T)=>string;
    }:{
    });
    export function DefaultInput<T extends tsType,K extends TextAreaType<T>>(value:T,outputType:K,customInput:K extends "custom"?(value:T)=>string:undefined):string{
        if(outputType=="custom"){
            // @ts-ignore
            return customInput(value)
        }else if(outputType=="number"){
            return String(value);
        }
        return value as string;
    }
    export function DefaultOutput<T extends tsType,K extends TextAreaType<T>>(e:React.ChangeEvent<HTMLTextAreaElement>,outputType:K,customOutput:K extends "custom"?(value:string,elem:HTMLInputElement)=>T:undefined):T{
        if(outputType=="custom"){
            // @ts-ignore
            return customOutput(e.target["value"],e.target)
        } else if(outputType=="number"){
            // @ts-ignore
            return Number(e.target.value) as T
        }
        // @ts-ignore
        return e.target.value as T
    }
}

export function ManaTextArea<M extends Manager.ObjectState<any>,K extends (keyof Manager.GetChildren<M>)&string,P extends ManagedTextArea.TextAreaType<Manager.GetChildren<M>[K]>>(_props:Omit<ManaProps<"textarea">,"name"|"tag">&{manager:M,name:K,callerKey?:string}&ManagedTextArea.TextAreaTypeProps<Manager.GetChildren<M>[K], P>){
    // @ts-ignore
    return <Mana tag={"textarea"} value={_props.manager.dep(_props.name).apply((v)=>ManagedTextArea.DefaultInput<Manager.GetChildren<M>[K],P>(v,_props.outputType,_props.customInput))} onChange={(e)=>_props.manager.set(_props.name,ManagedTextArea.DefaultOutput(e,_props.outputType,_props.customOutput),_props.callerKey && {callerKey:_props.callerKey})} {..._props}/>
}