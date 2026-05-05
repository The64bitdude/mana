import {Manager} from "../StateManager";
import {useEffect, useId} from "react";
import {ManagedInput} from "./ManagedInput";
import GetArrayChildren = Manager.GetArrayChildren;
import useIndexState = Manager.ReactHooks.useIndexState;
import useLengthState = Manager.ReactHooks.useLengthState;
import useObjectManager = Manager.ReactHooks.useObjectManager;
import useArrayMonitor = Manager.ReactHooks.useArrayMonitor;
import GetStateType = Manager.GetStateType;
import GetArrayChildManager = Manager.GetArrayChildManager;
import StateDependant = Manager.StateDependant;


export class IndexRenderOptions<M extends Manager.ArrayState<any>>{
    val:GetArrayChildren<M>[number];
    private _mana?:GetArrayChildManager<M>|null=null;
    idx:number;
    arrMana:M;
    constructor(arrMana:M, idx:number) {
        this.idx = idx;
        this.arrMana = arrMana;
        this.val=this.arrMana.at(this.idx);
    }
    mana():GetArrayChildManager<M>{
        return this._mana!==null?this._mana:(this._mana=this.arrMana.get(this.idx));
    }
    next():boolean{
        if(this.idx < this.arrMana.length() - 1){
            this.idx++;
            this.val=this.arrMana.at(this.idx);
            this._mana=null;
            return true;
        }
        return false;
    }
    getNext():IndexRenderOptions<M>|undefined{
        return (this.idx < this.arrMana.length() - 1)?new IndexRenderOptions(this.arrMana,this.idx+1):undefined;
    }
    prev():boolean{
        if(this.idx > 0){
            this.idx--;
            this.val=this.arrMana.at(this.idx);
            this._mana=null;
            return true;
        }
        return false;
    }
    getPrev():IndexRenderOptions<M>|undefined{
        return (this.idx > 0)?new IndexRenderOptions(this.arrMana,this.idx-1):undefined;
    }
    copy(){
        return new IndexRenderOptions(this.arrMana,this.idx);
    }
    isLast(){
        return this.idx===this.arrMana.length() - 1;
    }
    isFirst(){
        return this.idx===0;
    }
    dep(){
        return this.arrMana.dep(this.idx) as StateDependant<M, number>;
    }

}
export interface ManaSetProps<M extends Manager.ArrayState<any>>{
    manager:M,
    renderFunc:(o:IndexRenderOptions<M>)=>React.ReactNode
}
export function ManaSet<M extends Manager.ArrayState<any>>(_props:ManaSetProps<M>){
    const uniqueID = useId();
    const storedValue = useLengthState(_props.manager,uniqueID);
    // @ts-ignore
    return <>{_props.manager.state.map((v,idx)=>_props.renderFunc(new IndexRenderOptions(_props.manager,idx)))}</>
}
export interface ManaIndexProps<M extends Manager.ArrayState<any>> extends ManaSetProps<M> {
    idx:number;
}
export function ManaIndex<M extends Manager.ArrayState<any>>(_props:ManaIndexProps<M>){
    const uniqueID = useId();
    const storedValue = useIndexState(_props.manager,_props.idx,uniqueID);

    return <>{_props.renderFunc(new IndexRenderOptions(_props.manager,_props.idx))}</>
}
function ManaRawIndex<M extends Manager.ArrayState<any>>(_props:ManaIndexProps<M>){
    return <>{_props.renderFunc(new IndexRenderOptions(_props.manager,_props.idx))}</>
}
