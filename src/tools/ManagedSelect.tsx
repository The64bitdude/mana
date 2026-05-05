import {Manager,tsType} from "../StateManager";
import React, {ReactNode, useEffect, useId} from "react";
import {ManaElem, ManagedElement} from "./ManagedElement";
import GetChildren = Manager.GetChildren;
import {ManaProps,Mana} from "./ManagedHTML";
import Dependant = Manager.Dependant;



export namespace ManagedSelect {
    import Dependant = Manager.Dependant;
    export type SelectType<T extends tsType> = boolean extends T?number extends T ? string extends T? "boolean"|"number"|"string"|"custom":"boolean"|"number"|"custom" :  string extends T?"boolean"|"string"|"custom":"boolean"|"custom":number extends T ? string extends T? "number"|"string"|"custom":"number"|"custom" :  string extends T?"string"|"custom":"custom";
    export type OptionType<T extends tsType> =({dis:string,grp:OptionType<T>[]}|{val:T,dis:React.ReactNode}|T);
    export type SelectTypeProps<T extends tsType,K extends SelectType<T>> ={
        outputType:K,
        options:OptionType<T>[]|Dependant<any,OptionType<T>[],any>
    }&(K extends "custom"?{
        customOutput:(value:string,e:HTMLSelectElement)=>T;
        customInput:(value:T)=>string;
    }:{
    });
    export function DefaultInput<T extends tsType,K extends SelectType<T>>(value:T,outputType:K,customInput:K extends "custom"?(value:T)=>string:undefined):string{
        if(outputType==="custom"){
            // @ts-ignore
            return customInput(value)
        }else if(outputType==="number"){
            return String(value);
        }else if(outputType==="boolean"){
            return String(value || "");
        }
        return (value||"") as string;
    }
    export function DefaultOutput<T extends tsType,K extends SelectType<T>>(e:React.ChangeEvent<HTMLSelectElement>,outputType:K,customOutput:K extends "custom"?(value:string,elem:HTMLInputElement)=>T:undefined):T{
        if(outputType==="custom"){
            // @ts-ignore
            return customOutput(e.target["value"],e.target)
        } else if(outputType==="number"){
            // @ts-ignore
            return Number(e.target.value) as T
        } else if(outputType==="boolean"){
            return Boolean(e.target.value) as T;
        }
        // @ts-ignore
        return e.target.value as T
    }
    export function IndexOpt(A: React.ReactNode[]) {
        return A.map((v, i) => ({
            val: i,
            dis: v
        }));
    }
}
export function OptionMap<M extends Manager.ObjectState<any>,K extends (keyof Manager.GetChildren<M>)&string>(map:ManagedSelect.OptionType<Manager.GetChildren<M>[K]>[],_props:any){
    return map.map((v,idx)=> {
        let val: Manager.GetChildren<M>[K];
        let dis: React.ReactNode;
        if (v && typeof v === "object" && "dis" in v && ("val" in v || "grp" in v)) {
            if ("val" in v) {
                // @ts-ignore
                val = ManagedSelect.DefaultInput<Manager.GetChildren<M>[K], P>(v.val, _props.outputType, _props.customInput);
                dis = v.dis;

            } else {
                return <optgroup key={`grp:${v.dis}:${idx}`} label={v.dis}>{OptionMap(v.grp,_props)}</optgroup>
            }
        } else {
            // @ts-ignore
            val = ManagedSelect.DefaultInput<Manager.GetChildren<M>[K], P>(v.val, _props.outputType, _props.customInput);
            dis = val as React.ReactNode;
        }
        return <option key={`opt:${val}:${idx}`} value={val}>{dis}</option>
    })
    //@ts-ignore
}
export function ManaSelect<M extends Manager.ObjectState<any>,K extends (keyof Manager.GetChildren<M>)&string,P extends ManagedSelect.SelectType<Manager.GetChildren<M>[K]>>(_props:Omit<ManaProps<"select">,"name"|"tag">&{manager:M,callerKey?:string,name:K,onUpdate?:(newVal:Manager.GetChildren<M>[K],oldVal:Manager.GetChildren<M>[K],name:K,h:M,e:React.ChangeEvent<HTMLSelectElement>)=>void}&ManagedSelect.SelectTypeProps<Manager.GetChildren<M>[K], P>){
    // @ts-ignore
    return <Mana tag={"select"} children={_props.options instanceof Dependant?_props.options.apply((v)=>OptionMap(v,_props)):OptionMap(_props.options,_props)} value={_props.manager.dep(_props.name).apply((v)=>ManagedSelect.DefaultInput<Manager.GetChildren<M>[K],P>(v,_props.outputType,_props.customInput))} onChange={(e)=>{const oldVal=_props.manager.getValue(_props.name);_props.manager.set(_props.name,ManagedSelect.DefaultOutput(e,_props.outputType,_props.customOutput),_props.callerKey && {callerKey:_props.callerKey});if(_props.onUpdate){_props.onUpdate(_props.manager.getValue(_props.name),oldVal,_props.name,_props.manager,e)}}} {..._props}/>
}