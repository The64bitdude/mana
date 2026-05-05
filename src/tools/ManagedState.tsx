import {Manager} from "../StateManager";
import {useId} from "react";
import useManagerState = Manager.ReactHooks.useManagerState;

export function ManaState<M extends Manager.State<any>>(_props:{manager:M,renderFunc:(element:Manager.GetState<M>,manager:M)=>React.ReactNode}){
    const uniqueID = useId();
    const storedValue = useManagerState(_props.manager,uniqueID);
    return <>{_props.renderFunc(storedValue,_props.manager)}</>;
}