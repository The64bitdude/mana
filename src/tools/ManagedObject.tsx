import {Manager,tsTypeObject} from "../StateManager";
import {useId} from "react";
import GetChildren = Manager.GetChildren;
import ObjectState = Manager.ObjectState;

function ValRenderFunc(v:React.ReactNode){return v};
export function Val<M extends Manager.ObjectState<any>,K extends keyof GetChildren<M>>(_props:{manager:M,name:K}){
      return <ManaChild manager={_props.manager} name={_props.name} renderFunc={ValRenderFunc}/>
}
export function ManaChild<M extends Manager.ObjectState<any>,K extends keyof GetChildren<M>>(_props:{manager:M,name:K,renderFunc:(element:GetChildren<M>[K],key:K,manager:M)=>React.ReactNode}){
    const uniqueID = useId();
    const storedValue = Manager.ReactHooks.useChildState(_props.manager,_props.name,uniqueID);

    return <>{_props.renderFunc(storedValue,_props.name,_props.manager)}</>
}
export function ManaObj<M extends Manager.ObjectState<any>>(_props:{manager:M,renderFunc:(element:GetChildren<M>,manager:M)=>React.ReactNode}){
    const uniqueID = useId();
    const [storedValue,updater] = Manager.ReactHooks.useObjectState(_props.manager,uniqueID)

    return <>{_props.renderFunc(storedValue,_props.manager)}</>
}