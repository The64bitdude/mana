import {Manager, tsType} from "../StateManager";
import React, {useId} from "react";
import {ManagedElement} from "./ManagedElement";
import {ManaProps,Mana} from "./ManagedHTML";

export namespace ManagedInput {
    interface HTMLInputType{value?:string,checked?:boolean,files?:FileList|null,valueAsDate?:Date|null,valueAsNumber?:number}
    type InputType<I extends keyof HTMLInputType|void=void>=[I] extends (infer L extends keyof HTMLInputType)[] ?{[P in L]:Exclude<HTMLInputType[P],undefined>}&{[P in Exclude<keyof HTMLInputType,L>]?:HTMLInputType[P]}:HTMLInputType;
    export interface InputTypes{
        "button":InputType;
        "checkbox":InputType<"checked">;
        "color":InputType<"value">;
        "date":InputType<"valueAsDate"|"valueAsNumber"|"value">;
        "datetime-local":InputType<"valueAsNumber"|"value">;
        "email":InputType<"value">;
        "file":InputType<"files"|"value">;
        "hidden":InputType;
        "image":InputType;
        "month":InputType<"valueAsDate"|"value"|"valueAsNumber">;
        "number":InputType<"valueAsNumber"|"value">;
        "password":InputType<"value">;
        "radio":InputType<"checked"|"value">;
        "range":InputType<"value"|"valueAsNumber">;
        "reset":InputType;
        "search":InputType<"value">;
        "submit":InputType;
        "tel":InputType<"value">;
        "text":InputType<"value">;
        "time":InputType<"valueAsDate"|"value"|"valueAsNumber">;
        "url":InputType<"value">;
        "week":InputType<"valueAsDate"|"value"|"valueAsNumber">;
    }
    export type GetInputTypesFromKey<K extends keyof HTMLInputType> = K extends keyof HTMLInputType?keyof {[P in keyof InputTypes as undefined extends InputTypes[P][K]?never:P]:InputTypes[P]}:never;
    export type GetKeyFromType<T extends tsType> = T extends tsType?T extends HTMLInputType[keyof HTMLInputType]?keyof {[P in keyof HTMLInputType as T extends HTMLInputType[P]?P:never]:HTMLInputType[P]}|"custom":"custom":never;
    export type GetHTMLInputTypesFromType<T extends tsType> =  [T] extends tsType[]? [T] extends [undefined] ? "custom":[T] extends [(infer R extends tsType)|undefined]?GetKeyFromType<R>:never:never;
    export interface InputTypeHelper{
        "checked":GetInputTypesFromKey<"checked">;
        "value":GetInputTypesFromKey<"value">;
        "valueAsDate":GetInputTypesFromKey<"valueAsDate">;
        "valueAsNumber":GetInputTypesFromKey<"valueAsNumber">;
        "files":GetInputTypesFromKey<"files">;
    }
    export type InputTypeProps<T extends tsType,K extends GetHTMLInputTypesFromType<T>> ={
        outputKey:K,
    }&(K extends "custom"?{
        type?:keyof InputTypes;
        customOutput:(elem:HTMLInputElement)=>T;
        customInput:(value:T)=>{value:string}|{checked:boolean}|{files:FileList|null};
    }:{
        type:GetInputTypesFromKey<Exclude<K,"custom">>
    });
    function getDateWeek(date:Date) {
        const currentDate:Date =
            (typeof date === 'object') ? date : new Date();
        const januaryFirst:Date =
            new Date(currentDate.getFullYear(), 0, 1);
        const daysToNextMonday =
            (januaryFirst.getDay() === 1) ? 0 :
                (7 - januaryFirst.getDay()) % 7;
        const nextMonday:Date =
            new Date(currentDate.getFullYear(), 0,
                januaryFirst.getDate() + daysToNextMonday);

        return (currentDate < nextMonday) ? 52 :
            (currentDate > nextMonday ? Math.ceil(
                (currentDate.getTime() - nextMonday.getTime()) / (24 * 3600 * 1000) / 7) : 1);
    }
    export const DateTypesToValue=(key:InputTypeHelper["valueAsDate"],value:Date)=>{
        if(value) {
            switch (key) {
                case "date":
                    return (value as Date).toISOString().substring(0, 10);
                case "month":
                    return (value as Date).toISOString().substring(0, 7);
                case "time":
                    return (value as Date).toISOString().slice(11, -1);
                case "week":
                    return `${(value as Date).getUTCFullYear()}-W${getDateWeek(value as Date)}`;
                default:
                    return value.toString();
            }
        }
        return value as string;
    }
    export function DefaultInput<T extends tsType,K extends GetHTMLInputTypesFromType<T>>(value:T,outputKey:K,type:K extends "custom"?keyof InputTypes|undefined:GetInputTypesFromKey<Exclude<K,"custom">>,customInput:K extends "custom"?(value:T)=>{value:string}|{checked:boolean}|{files:FileList|null}:undefined){
        if(outputKey=="custom"){
            // @ts-ignore
            return customInput(value)
        } else if(outputKey=="valueAsDate"){
            // @ts-ignore
            return {value:DateTypesToValue(type,value)}
        } else if(outputKey=="valueAsNumber"){
            return {value:String(value)};
        }else if(outputKey=="checked"){
            return {checked:value}
        }else if(outputKey=="files"){
            return {files:value}
        }
        return {value:value};
    }
    export function DefaultOutput<T extends tsType,K extends GetHTMLInputTypesFromType<T>>(e:React.ChangeEvent<HTMLInputElement>,outputKey:K,customOutput:K extends "custom"?(elem:HTMLInputElement)=>T:undefined):T{
        if(outputKey=="custom"){
            // @ts-ignore
            return customOutput(e.target)
        } else {
            // @ts-ignore
            return e.target[outputKey] as T
        }
    }
}
export function ManaInput<M extends Manager.ObjectState<any>,K extends (keyof Manager.GetChildren<M>)&string,P extends ManagedInput.GetHTMLInputTypesFromType<Manager.GetChildren<M>[K]>>(_props:Omit<ManaProps<"input">,"name"|"type"|"tag">&{manager:M,callerKey?:string,name:K,onBeforeUpdate?:(newVal:Manager.GetChildren<M>[K],oldVal:Manager.GetChildren<M>[K],name:K,h:M,e:React.ChangeEvent<HTMLInputElement>)=>void}&ManagedInput.InputTypeProps<Manager.GetChildren<M>[K], P>){
   //@ts-ignore
    return <Mana tag={"input"} {..._props.manager.dep(_props.name).spread((v)=>ManagedInput.DefaultInput<Manager.GetChildren<M>[K],P>(v,_props.outputKey,_props.type,_props.customInput))} onChange={(e)=>{const newVal = ManagedInput.DefaultOutput(e,_props.outputKey,_props.customOutput);if(_props.onBeforeUpdate){_props.onBeforeUpdate(newVal,_props.manager.getValue(_props.name),_props.name,_props.manager,e)}_props.manager.set(_props.name,newVal,_props.callerKey && {callerKey:_props.callerKey});}} {..._props}/>
}