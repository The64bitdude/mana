import {ReactElement} from "../ReactElement";
import Props = ReactElement.Props;
import React, {useState, useMemo, useId, Ref, useRef, useEffect, RefObject} from "react";
import Tag = ReactElement.Tag;
import useConst = ReactElement.useConst;
import {Manager} from "../StateManager";
import StateDependant = Manager.StateDependant;
import useDepMonitor = Manager.ReactHooks.useDepMonitor;
import Dependant = Manager.Dependant;
import DependencyArray = Manager.DependencyArray;
import useInstantEffect = Manager.ReactHooks.useInstantEffect;
import ObjectState = Manager.ObjectState;
import ArrayState = Manager.ArrayState;
import State = Manager.State;
import Key = Manager.Key;
import Elem = ReactElement.Elem;
import GetDepVal=Manager.GetDepVal;
import useObjectManager = Manager.ReactHooks.useObjectManager;
import useManager = Manager.ReactHooks.useManager;
import GetState = Manager.GetState;
import DependencyArgs = Manager.DependencyArgs;

export type DepProps<M>={
    [P in keyof M]: M[P]|Dependant<any,M[P],any>;
}
export type Dep<T>=T|Dependant<any,T,any>;
export type ManaProps<H extends Tag>=DepProps<Props<H>>&{tag:Dep<H>,elemRef?:Ref<Elem<H>>,spread?:Dependant<any,Props<H>,any>};
export function useRawDepMonitor<const M extends {[key:string]:Dependant<any,any,any>}>(deps:M,onEvent:(e:{key:string,val:any})=>void|boolean, eventKey?:Manager.Key){
    const [event,setEvent]=useState<{key:string,val:any}>();
    const onEventHandle=useConst(()=>(key:string,val:any)=>{
        const e = {key:key,val:val};
        if(onEvent(e)){
            setEvent(e);
        }
    });
    useInstantEffect(()=>{
        for(const key in deps){
            const dep:Dependant<any> = deps[key];
            dep.attachEvent((v)=>onEventHandle(key,v));
        }
        return ()=>{
            for(const key in deps){
                const dep:Dependant<any> = deps[key];
                dep.clearEvents();
            }
        }
    },[]);
    return event;
}
export function Mana<H extends Tag>(_props:ManaProps<H>) {
    const [curr,deps] = useConst(()=>{
        const temp = {..._props};
        const deps:{[key:string]:Dependant<any,any,any>} = {};
        let realKey:keyof typeof temp;
        for(const key in temp){
            realKey = key as keyof typeof temp;
            if(key==="elemRef"){
                realKey = "ref" as keyof typeof temp;
            }
            //@ts-ignore
            if(key==="spread"&&temp[key] instanceof Dependant<any,any,any>){
                deps[key]=temp[key];
                Object.assign(temp,temp[key].val());
                if(key in temp) {
                    //@ts-ignore
                    delete temp[key];
                }
            }else {
                //@ts-ignore
                if (temp[key] instanceof Dependant<any, any, any>) {
                    //@ts-ignore
                    deps[realKey] = temp[key];
                    //@ts-ignore
                    temp[key] = temp[key].val();
                }
                if(realKey!==key){
                    temp[realKey]=temp[key as keyof typeof temp];
                    delete temp[key as keyof typeof temp];
                }
            }

        }
        return [temp as unknown as Props<H>&{tag:H},deps];
    });
    const render = useRawDepMonitor(deps,(e)=>{
        if(e.key==="spread") {
            //@ts-ignore
            Object.assign(curr,e.val);
            return true;
        }else {
            //@ts-ignore
            if (curr[e.key] !== e.val) {
                //@ts-ignore
                curr[e.key] = e.val;
                return true;
            }
        }
    })
    //@ts-ignore
    return useMemo(()=>React.createElement(curr.tag,curr),[render])
}
export function useVal<D extends Dependant<any,any,any>>(dep:D, eventKey?:Manager.Key){
    const [state,setState] = useState(()=>dep.val());
    useInstantEffect(()=>{
        dep.attachEvent((v) => setState(v), eventKey);
        return ()=>{
            dep.clearEvents();
        }
    },[]);
    return state;
}
export function useMultiVal<const D extends Dependant<any,any,any>[]>(dep:D, eventKey?:Manager.Key){
    const state = useConst(()=>dep.map(d=>d.val()));
    const [,update]=useState({});
    useInstantEffect(()=>{
        dep.forEach((dep,i)=>{
            dep.attachEvent((v) =>{state[i]=v;update({})}, eventKey);
        });
        return ()=>{
            dep.forEach((dep)=>{
                dep.clearEvents();
            })
        }
    },[]);
    return state as DependencyArgs<D>;
}
export function useDyn<D>(dep:D|Dependant<any,D,any>, eventKey?:Manager.Key){
    const [state,setState] = useState(()=>dep instanceof Dependant?dep.val():dep);
    useInstantEffect(()=>{
        if(dep instanceof Dependant) {
            dep.attachEvent((v) => setState(v), eventKey);
            return () => {
                dep.clearEvents();
            }
        }
    },[]);
    return state;
}
export function useValFunc<D extends Dependant<any,any,any>>(dep:D,callback:(val:GetDepVal<D>)=>void, eventKey?:Manager.Key){
    useInstantEffect(()=>{
       callback(dep.val());
       dep.attachEvent(callback, eventKey);
        return ()=>{
            dep.clearEvents();
        }
    },[]);
}
export function useMultiValFunc<const M extends Dependant<any,any,any>[]>(dep:M,callback:(...val:DependencyArgs<M>) => void,eventKey?:Manager.Key){
    useInstantEffect(()=>{
        callback(...dep.map((d)=>d.val()) as DependencyArgs<M>);
        dep.forEach((d,i)=>{
            d.attachEvent(() =>callback(...dep.map((dt)=>dt.val()) as DependencyArgs<M>), eventKey);
        });
        return ()=>{
            dep.forEach((d)=>{
                d.clearEvents();
            })
        }
    },[]);
}
export function useMultiDepEffect<const M extends Dependant<any,any,any>[]>(dep:M,callback:(...val:DependencyArgs<M>)=>(void|(()=>void)), eventKey?:Manager.Key){
    useInstantEffect(()=>{
        let lastCallback:(void|(()=>void))=undefined as void;
        function onEvent(){
            lastCallback?.();
            lastCallback=callback(...dep.map((dt)=>dt.val()) as DependencyArgs<M>);
        }
        dep.forEach((d,i)=>{
            d.attachEvent(onEvent, eventKey);
        });
        return ()=>{
            lastCallback?.();
            dep.forEach((d)=>{
                d.clearEvents();
            })
        }
    },[]);
}
export function useDepFunc<D extends Dependant<any,any,any>>(dep:D,callback:(val:GetDepVal<D>)=>void, eventKey?:Manager.Key){

    useInstantEffect(()=>{
        dep.attachEvent(callback, eventKey);
        return ()=>{
            dep.clearEvents();
        }
    },[]);
}
export function useDepEffect<D extends Dependant<any,any,any>>(dep:D,callback:(val:GetDepVal<D>)=>(void|(()=>void)), eventKey?:Manager.Key){
    useInstantEffect(()=>{
        let lastCallback:(void|(()=>void))=undefined as void;
        function onEvent(val:GetDepVal<D>){
            lastCallback?.();
            lastCallback=callback(val);
        }
        dep.attachEvent(onEvent, eventKey);
        return ()=>{
            lastCallback?.();
            dep.clearEvents();
        }
    },[]);
}
export interface RefSize{
    height:number;
    width:number;
    x:number;
    y:number;
    top:number;
    bottom:number;
    right:number;
    left:number;
}
export interface OffsetSize{
    top:number;
    left:number;
    right:number;
    bottom:number;
    height:number;
    width:number;
    maxHeight:number;
    maxWidth:number;
}
export function getOffset(child:RefSize,parent:RefSize){
    // @ts-ignore
    const base:OffsetSize ={width:child.width,height:child.height,left:child.x-parent.x,top:child.y-parent.y,maxHeight:parent.height,maxWidth:parent.width};
    base.right=base.maxWidth- (base.left+base.width);
    base.bottom = base.maxHeight - (base.top+base.height);
    return base;
}
export function useRefSize<E extends HTMLElement=HTMLElement>():[React.Ref<E>,ObjectState<RefSize>]{

   const bound = useObjectManager<RefSize>({height:0, width:0,x:0,y:0,right:0,left:0,bottom:0,top:0});
   const element = useManager<E|null>(null);
    const eventKey=useId();
    useDepEffect(element.dep(),(temp)=>{
        if(temp) {
            //console.log(temp);
            bound.update(temp.getBoundingClientRect());
            const resize = new ResizeObserver(() => {
                if(temp) {
                    bound.update(temp.getBoundingClientRect())
                }
            })
            resize.observe(temp);
            return ()=>{
                resize.disconnect();
            }
        }
    },eventKey);
   return [ref(element), bound];
}
export function useSize<E extends HTMLElement=HTMLElement>(element:State<E|null>){
    const bound = useObjectManager<RefSize>({height:0, width:0,x:0,y:0,right:0,left:0,bottom:0,top:0});
    const eventKey=useId();
    useDepEffect(element.dep(),(temp)=>{
        if(temp) {
            bound.update(temp.getBoundingClientRect());
            const resize = new ResizeObserver(() => {
                if(temp) {
                    bound.update(temp.getBoundingClientRect());
                }
            })
            resize.observe(temp);
            return ()=>{
                resize.disconnect();
            }
        }
    },eventKey);
    return bound;
}
export function ref<S extends State<any>>(state:S) {
    return (val:GetState<S>) => {
       state.update(val);
   }
}
export function ManaSize(_props:{val:(ref:React.Ref<any>,bound:ObjectState<RefSize>)=>React.ReactNode}){
    const [ref,bound]=useRefSize<any>();
    return _props.val(ref,bound);
}
export function ManaVal(_props:{val:Dependant<any,React.ReactNode,any>}){

    const uniqueID = useId();
    return useVal(_props.val,uniqueID) as React.ReactNode;
}
export function MultiDyn<const M extends Dependant<any,any,any>[]>(_props:{dep:M,val:(...val:DependencyArgs<M>) => React.ReactNode}){

    const uniqueID = useId();
    return _props.val(...useMultiVal(_props.dep,uniqueID)) as React.ReactNode;
}
export function ManaDep<T>(_props:{dep:Dependant<any,T,any>,val:(val:T) => React.ReactNode}){
    const uniqueID = useId();
    return  _props.val(useVal(_props.dep,uniqueID)) as React.ReactNode;
}
export function ManaDyn<T>(_props:{dep:T|Dependant<any,T,any>,val:(val:T) => React.ReactNode}){
    const uniqueID = useId();
    return  _props.val(useDyn(_props.dep,uniqueID)) as React.ReactNode;
}