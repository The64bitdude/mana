import {Manager} from "../StateManager";
import DependencyArray = Manager.DependencyArray;
import {useId} from "react";
import DependencyFunc = Manager.DependencyFunc;
import useDepState = Manager.ReactHooks.useDepState;

export function MultiMana<const M extends DependencyArray>(_props:{deps:M,renderFunc:DependencyFunc<M,React.ReactNode>}) {
    const uniqueID = useId();
    const [state,updater] = useDepState(_props.deps,uniqueID);

    return <>{_props.renderFunc(state,_props.deps)}</>
}
