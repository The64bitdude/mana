import {useEffect, useMemo, useRef, useState} from "react";

export const jsTypeExtractor_ONLY_THE_TYPE_NOT_THE_VALUE = typeof Object;
export interface jsType {
    string:string,
    number:number,
    bigint:bigint,
    boolean:boolean,
    symbol:symbol,
    undefined:undefined,
    object:object,
    function:Function,
}
export type jsTypes = typeof jsTypeExtractor_ONLY_THE_TYPE_NOT_THE_VALUE|keyof jsType;
export type tsTypePrimitive=jsType[jsTypes];
export type tsTypeNull=null;
export type tsTypeArray =(tsType)[]
export type tsTypeObject=object;
/**
 * the purpose of this is to define a more specific any type which just refers to any built in structures in js
 */
export type tsType= tsTypePrimitive|tsTypeNull;


export namespace Manager {

    export type Key = string|number|symbol;
    export type OptionalObject<T extends tsTypeObject> = T extends tsTypeObject?{[P in keyof T]+?:T[P]}:never
    export type EventManager<C extends Callback<any>> = {[key:Key]:C};
    export type Callback<C extends EventTypes.Event<any>> = (e: C) => void;
    export type MultiCallback<P extends any[]> = (...args:P) => void;
    export namespace EventTypes {
        export interface Event<S extends State<any>>{
            manager:S,
            eventType:Key,
            eventIDX:Key,
            callerKey?: Key,
        }
        export interface RemovalEvent<S extends State<any>> extends Event<S>{
            eventKey:Key,
            eventType:Key,
            childKey?:Key,
        }
        export interface ChangeEvent<T extends tsTypeObject,S extends ObjectState<T>> extends Event<S> {
            childKey?:keyof T
        }
        export interface ArrayChangeEvent<T extends tsTypeArray,S extends ArrayState<T>> extends Event<S> {
            childKey?:number
        }
        export interface UpdateEvent<T extends tsType,S extends State<T>> extends Event<S>{
            currState:T,
            prevState:T,
        }
        export interface ChildUpdateEvent<T extends tsTypeObject,S extends ObjectState<T>> extends Event<S> {
            parentState:T,
            childCurrState:T[keyof T],
            childPrevState:T[keyof T],
            childKey:keyof T
        }
        export interface IndexUpdateEvent<T extends tsTypeArray,S extends ArrayState<T>> extends Event<S> {
            parentState:T,
            childCurrState:T[number],
            childPrevState:T[number],
            childIndex:number
        }
        export interface LengthUpdateEvent<T extends tsTypeArray,S extends ArrayState<T>> extends Event<S> {
            currState:T,
            currLength:number;
            prevLength:number;
        }
    }
    export namespace EventOptionTypes {
        export interface EventOptions{
            omitEventIDX?:Key[],
            allowEventIDX?:Key[],
            callerKey?: Key
        }
        export interface RemovalEventOptions extends EventOptions{
            eventKey:Key,
            eventType:Key,
            childKey?:Key,
        }
        export interface ChangeEventOptions<T extends tsTypeObject> extends EventOptions {
            childKey?:keyof T
        }
        export interface ArrayChangeEventOptions<T extends tsTypeArray> extends EventOptions {
            childKey?:number
        }
        export interface UpdateEventOptions<T extends tsType> extends EventOptions{
            currState:T;
            prevState:T;
        }
        export interface ChildUpdateEventOptions<T extends tsTypeObject> extends EventOptions{
            parentState:T,
            childCurrState:T[keyof T],
            childPrevState:T[keyof T],
            childKey:keyof T
        }
        export interface IndexUpdateEventOptions<T extends tsTypeArray> extends EventOptions{
            parentState:T,
            childCurrState:T[number],
            childPrevState:T[number],
            childKey:number
        }
        export interface LengthUpdateEventOptions<T extends tsTypeArray> extends EventOptions {
            currState:T,
            currLength:number;
            prevLength:number;
        }
    }
    export interface EventHolder{
        [key:Key]:EventManager<Callback<any>>|undefined;
    }
    export type getEvents<S extends {getEvents:()=>any}>=S extends {getEvents:()=>any}?extractEvents<S["getEvents"]>:never;
    export type extractEvents<S extends ()=>any> = S extends () => infer R?R:never;
    export type ChangeReturnType<F extends (...args:any[])=>any,NR> = F extends (...args:infer P)=>infer R?(...args:P)=>NR:never;
    export type GetArgType<F extends (...args:any[])=>any> = F extends (...args:infer P)=>infer R?P:never;

    export namespace ReactHooks {
        /**
         *
         */
        export function useInstantEffect(effect: React.EffectCallback,deps: React.DependencyList){
            const dest = useMemo(effect,deps);
            useEffect(()=>dest,[dest]);
        }
        /**
         *
         * ` useManager` returns a {@link State} Object that holds the given state `S` optionally initialized by the
         * argument (`initialState`). The returned object will persist for the full lifetime of the component.
         *
         * Usage note: if you do not provide an `initialState` the returned {@link State} will infer that it can be undefined.
         * @typeParam S - underlying value of the state inside the {@link State} object
         * @see {@link State}
         */
        export function useManager<S extends tsType>(initialState: S): State<S>;
        /**
         *
         * ` useManager` returns a {@link State} Object that holds the given state `S` optionally initialized by the
         * argument (`initialState`). The returned object will persist for the full lifetime of the component.
         *
         * Usage note: if you do not provide an `initialState` the returned {@link State} will infer that it can be undefined.
         * @typeParam S - underlying value of the state inside the {@link State} object
         * @see {@link State}
         */
        export function useManager<S extends tsType = undefined>(): State<S|undefined>;
        export function useManager<S extends tsType = undefined>(initialState?: S){
            const ref = useRef<State<S>>(undefined);
            if(ref.current===undefined){
                ref.current=new State<S>(initialState as S);
            }
            return ref.current;
        }
        /**
         *
         * similar to `useManager`, `useObjectManager` returns a {@link ObjectState} Object that holds the given state `S` optionally initialized by the
         * argument (`initialState`). The returned object will persist for the full lifetime of the component.
         *
         * Usage note: if you do not provide an `initialState` the returned {@link ObjectState} will infer that all attributes of the provided state can be optional.
         * @typeParam S - underlying value of the state inside the {@link ObjectState} object (must be an object)
         * @see {@link useManager}
         * @see {@link ObjectState}
         */
        export function useObjectManager<S extends tsTypeObject>(initialState: S | (()=>S)): ObjectState<S>;
        /**
         *
         * similar to `useManager`, `useObjectManager` returns a {@link ObjectState} Object that holds the given state `S` optionally initialized by the
         * argument (`initialState`). The returned object will persist for the full lifetime of the component.
         *
         * Usage note: if you do not provide an `initialState` the returned {@link ObjectState} will infer that all attributes of the provided state can be optional / an empty object.
         * @typeParam S - underlying value of the state inside the {@link ObjectState} object (must be an object)
         * @see {@link useManager}
         * @see {@link ObjectState}
         */
        export function useObjectManager<S extends tsTypeObject = {}>(): ObjectState<OptionalObject<S>>;
        export function useObjectManager<S extends tsTypeObject = {}>(initialState?: S | (()=>S)){
            const ref = useRef<ObjectState<S>>(undefined);
            if(ref.current===undefined){
                ref.current=new ObjectState<S>( (initialState!==undefined?typeof initialState =="function"?initialState():initialState:{}) as S);
            }
            return ref.current;
        }
        /**
         *
         * similar to `useManager`, `useArrayManager` returns a {@link ArrayState} Object that holds the given state `S` optionally initialized by the
         * argument (`initialState`). The returned object will persist for the full lifetime of the component.
         *
         * Usage note: if you do not provide an `initialState` the returned {@link ObjectState} will infer that the `initialState` was an empty array.
         * @typeParam S - underlying value of the state inside the {@link ArrayState} object (must be an array)
         * @see {@link useManager}
         * @see {@link ArrayState}
         */
        export function useArrayManager<S extends tsTypeArray = []>(initialState?: S | (()=>S)){
            const ref = useRef<ArrayState<S>>(undefined);
            if(ref.current===undefined){
                ref.current=new ArrayState<S>((initialState!==undefined?typeof initialState == "function"?initialState():initialState:[]) as S);
            }
            return ref.current;
        }
        /**
         *
         * `useArrayMonitor` returns a `onChange` event, but this is not the main purpose. The main purpose of this hook is to monitor for `onChange` events in a `manager`:{@link ArrayState} (that has already been created using {@link useArrayManager} or a child that was gotten using get from a parent whose ancestor was created using any `useManager` hook).
         * On every `onChange` event called to the `manager` the function param `onEvent` is called, with the `onChange` event and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link EventHolders.ArrayStateEvents.onChange|onChange}
         */
        export function useArrayMonitor<S extends ArrayState<any>>(manager:S,onEvent:ChangeReturnType<Exclude<getEvents<S>["onChange"],undefined>[number],boolean|void>, eventKey?:Key){
            const [event, setEvent] = useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent("onChange",(e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey);
                return ()=>{
                    manager.removeEvent("onChange",realEventKey);
                }
            },[manager]);
            return event;
        }
        /**
         *
         * `useArrayState` returns the state inside a {@link ArrayState}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever an `onChange` Event is called to a {@link ArrayState} and pass its updated state.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link EventHolders.ArrayStateEvents.onChange|onChange}
         */
        export function useArrayState<S extends ArrayState<any>>(manager:S, eventKey?:Key):[state:GetArrayChildren<S>,updater:{}]{
            const [state, setState] = useState({});
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent("onChange",()=>setState({}),eventKey)
                return ()=>{
                    manager.removeEvent("onChange",realEventKey);
                }
            },[manager]);
            return [manager.state,state];
        }
        /**
         *
         * `useObjectMonitor` returns a `onChange` event, but this is not the main purpose. The main purpose of this hook is to monitor for `onChange` events in a `manager`:{@link ObjectState} (that has already been created using {@link useObjectManager} or a child that was gotten using get from a parent whose ancestor was created using any `useManager` hook).
         * On every `onChange` event called to the `manager` the function param `onEvent` is called, with the `onChange` event and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ObjectState} passed
         * @see {@link ObjectState}
         * @see {@link EventHolders.ObjectStateEvents.onChange|onChange}
         */
        export function useObjectMonitor<S extends ObjectState<any>>(manager:S,onEvent:ChangeReturnType<Exclude<getEvents<S>["onChange"],undefined>[number],boolean|void>, eventKey?:Key){
            const [event, setEvent] = useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent("onChange",(e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey);
                return ()=>{
                    manager.removeEvent("onChange",realEventKey);
                }
            },[manager,eventKey]);
            return event;
        }
        /**
         *
         * `useObjectState` returns the state inside a {@link ObjectState}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever an `onChange` Event is called to a {@link ObjectState} and pass its updated state.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ObjectState} passed
         * @see {@link ObjectState}
         * @see {@link EventHolders.ObjectStateEvents.onChange|onChange}
         */
        export function useObjectState<S extends ObjectState<any>>(manager:S, eventKey?:Key):[state:GetChildren<S>,updater:{}]{
            const [state, setState] = useState({});
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent("onChange",()=>setState({}),eventKey);
                return ()=>{
                    manager.removeEvent("onChange",realEventKey);
                }
            },[manager]);
            return [manager.state,state];
        }
        /**
         *
         * `useEventMonitor` returns the event `name` provided  event, but this is not the main purpose. The main purpose of this hook is to monitor for events with the `name` parameter given, withing the specified `manager`:{@link State} (that has already been created using any {@link useManager}, such as {@link useObjectManager} or {@link useArrayManager}).
         * On every event called to the `manager` the function param `onEvent` is called, with the event, which type is being defined by the `name` parameter and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link State} passed
         * @see {@link State}
         */
        export function useEventMonitor<S extends State<any>,K extends keyof getEvents<S>>(manager: S, name:K, onEvent:ChangeReturnType<Exclude<getEvents<S>[K],undefined>[number],boolean|void>, eventKey?:Key){
            const [event, setEvent] = useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent(name,(e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey)
                return ()=>{
                   manager.removeEvent(name,realEventKey);
                }
            },[manager]);
            return event;
        }
        /**
         *
         * `useStateMonitor` returns a `onUpdate` event, but this is not the main purpose. The main purpose of this hook is to monitor for `onUpdate` events in a `manager`:{@link State} (that has already been created using {@link useManager} or a child that was gotten using get from a parent whose ancestor was created using any `useManager` hook).
         * On every `onUpdate` event called to the `manager` the function param `onEvent` is called, with the `onUpdate` event and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link State} passed
         * @see {@link State}
         * @see {@link EventHolders.StateEvents.onUpdate|onUpdate}
         */
        export function useStateMonitor<S extends State<any>>(manager:S,onEvent:ChangeReturnType<Exclude<getEvents<S>["onUpdate"],undefined>[number],boolean|void>, eventKey?:Key){
            const [event, setEvent] = useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent("onUpdate",(e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey);
                return () => {
                    manager.removeEvent("onUpdate",realEventKey);
                }
            },[manager]);
            return event;
        }
        /**
         *
         * `useManagerState` returns the state inside a {@link State}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever an `onUpdate` Event is called to a {@link State} and pass its updated state.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link State} passed
         * @see {@link State}
         * @see {@link EventHolders.StateEvents.onUpdate|onUpdate}
         */
        export function useManagerState<S extends State<any>>(manager: S, eventKey?:Key){
            const [value, setValue] = useState<S["state"]>(manager.state);
            useInstantEffect(()=>{
                const realEventKey = manager.addEvent("onUpdate",(e)=>setValue(e.currState),eventKey);
                return ()=>{
                    manager.removeEvent("onUpdate",realEventKey);
                }
            },[manager]);
            return value;
        }
        /**
         *
         * `useChildMonitor` returns a `onChildUpdate` event, but this is not the main purpose. The main purpose of this hook is to monitor for `onChildUpdate` events specifically for the child specified by the `key` parameter in a `manager`:{@link ObjectState} (that has already been created using {@link useObjectManager} or a child that was gotten using get from a parent whose ancestor was created using any `useManager` hook).
         * On every `onChildUpdate` event called to the `manager` the function param `onEvent` is called, with the `onChildUpdate` event and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ObjectState} passed
         * @see {@link ObjectState}
         * @see {@link EventHolders.ObjectStateEvents.onChildUpdate|onChildUpdate}
         */
        export function useChildMonitor<S extends ObjectState<any>,K extends keyof S["state"]>(manager: S, key:K, onEvent:ChangeReturnType<Exclude<getEvents<S>["onChildUpdate"],undefined>[number],boolean|void>, eventKey?:Key){
            const [event, setEvent] = useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey = manager.addChildEvent(key,(e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey)
                return ()=>{
                    manager.removeEvent("onChildUpdate",realEventKey);
                }
            },[manager,key,eventKey]);
            return event;
        }
        /**
         *
         * `useChildState` returns the state of a child specified by `key` inside a {@link ObjectState}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever an `onChildUpdate` Event is called with the correct `key` to a {@link ObjectState} and pass the child's updated state.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ObjectState} passed
         * @see {@link ObjectState}
         * @see {@link useId}
         * @see {@link EventHolders.ObjectStateEvents.onChildUpdate|onChildUpdate}
         */
        export function useChildState<S extends ObjectState<any>,K extends keyof S["state"]>(manager:S,key:K,eventKey?:Key){
            const [value,setValue]=useState<S["state"][K]>(manager.state[key]);
            useInstantEffect(()=>{
                const realEventKey = manager.addChildEvent(key,(e)=>setValue(e.childCurrState),eventKey);
                return ()=>{
                    manager.removeEvent("onChildUpdate",realEventKey,key);
                }
            },[manager]);
            return value;
        }
        /**
         *
         * `useIndexMonitor` returns a `onChildUpdate` event, but this is not the main purpose. The main purpose of this hook is to monitor for `onChildUpdate` events specifically for the child specified by the `index` parameter in a `manager`:{@link ObjectState} (that has already been created using {@link useObjectManager} or a child that was gotten using get from a parent whose ancestor was created using any `useManager` hook).
         * On every `onChildUpdate` event called to the `manager` the function param `onEvent` is called, with the `onChildUpdate` event and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link EventHolders.ArrayStateEvents.onChildUpdate|onChildUpdate}
         */
        export function useIndexMonitor<S extends ArrayState<any>>(manager: S, index:number, onEvent:ChangeReturnType<Exclude<getEvents<S>["onChildUpdate"],undefined>[number],boolean|void>, eventKey?:Key){
            const [event, setEvent] = useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey = manager.addChildEvent(index,(e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey)
                return ()=>{
                    manager.removeEvent("onChildUpdate",realEventKey,index);
                }
            },[manager,index,eventKey]);
            return event;
        }
        /**
         *
         * `useIndexState` returns the state of a child specified by `index` inside a {@link ArrayState}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever an `onChildUpdate` Event is called with the correct `index` to a {@link ArrayState} and pass the child's updated state.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link useId}
         * @see {@link EventHolders.ArrayStateEvents.onChildUpdate|onChildUpdate}
         */
        export function useIndexState<S extends ArrayState<any>>(manager:S,index:number,eventKey?:Key){
            const [value,setValue]=useState<S["state"][number]>(manager.state[index]);
            useInstantEffect(()=>{
                const realEventKey= manager.addChildEvent(index,(e)=>setValue(e.childCurrState),eventKey);
                return ()=>{
                    manager.removeEvent("onChildUpdate",realEventKey,index);
                }
            },[manager]);
            return value;
        }
        /**
         *
         * `useLengthMonitor` returns a `onLengthUpdate` event, but this is not the main purpose. The main purpose of this hook is to monitor for `onLengthUpdate` events in a `manager`:{@link ArrayState} (that has already been created using {@link useArrayManager} or a child that was gotten using get from a parent whose ancestor was created using any `useManager` hook).
         * On every `onLengthUpdate` event called to the `manager` the function param `onEvent` is called, with the `onLengthUpdate` event and if the `onEvent` function returns nothing or false nothing happens, but if the function returns true it causes a rerender of
         * the component this hook is used in, specifically due to the returned event state being updated to the event that was passed when the `onEvent` function returned true.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link EventHolders.ArrayStateEvents.onLengthUpdate|onLengthUpdate}
         */
        export function useLengthMonitor<S extends ArrayState<any>>(manager: S,onEvent:ChangeReturnType<Exclude<getEvents<S>["onLengthUpdate"],undefined>[number],boolean|void>, eventKey?:Key){
            const [event,setEvent]=useState<GetArgType<typeof onEvent>[0]>();
            useInstantEffect(()=>{
                const realEventKey =manager.addLengthEvent((e)=>{
                    if(onEvent(e)){
                        setEvent(e);
                    }
                },eventKey)
                return ()=>{
                    manager.removeEvent("onLengthUpdate",realEventKey)
                }
            },[manager]);
            return event;
        }
        /**
         *
         * `useLengthState` returns the length of the state inside a {@link ArrayState}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever an `onLengthUpdate` Event is called to a {@link ArrayState} and pass the updated length.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link useId}
         * @see {@link EventHolders.ArrayStateEvents.onLengthUpdate|onLengthUpdate}
         */
        export function useLengthState<S extends ArrayState<any>>(manager:S,eventKey?:Key){
            const [value,setValue]=useState<number>(manager.state.length);
            useInstantEffect(()=>{
                const realEventKey =manager.addLengthEvent((e)=>setValue(e.currLength),eventKey);
                return ()=>{
                    manager.removeEvent("onLengthUpdate",realEventKey)
                }
            },[manager]);
            return value;
        }
        /**
         *
         * `useDepState` returns the State of each dependent in the {@link DependencyArray}, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever any of the dependents `onChange` for objects and arrays or `onUpdate` for regular dependents Event is called to any {@link State} and pass the updated list of states.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam N - underlying type of the {@link DependencyArray} passed
         * @see {@link DependencyArray}
         * @see {@link useId}
         * @see {@link EventHolders.ArrayStateEvents.onChange|onChange}
         * @see {@link EventHolders.ObjectStateEvents.onChange|onChange}
         * @see {@link EventHolders.StateEvents.onUpdate|onUpdate}
         */
        export function useDepState<const M extends DependencyArray>(deps:M, eventKey?:Manager.Key):[state:DependencyArgs<M>,updator:any]{
            const realState = useArrayManager<DependencyArgs<M>>(()=>deps.map((dep)=>dep.val()) as DependencyArgs<M>)
            const lastEvent =useEventMonitor(realState,"onChildUpdate",()=>true,eventKey);
            useInstantEffect(()=>{
                for(let i = 0;i<deps.length;i++){
                    const dep = deps[i];
                    dep.attachEvent((v)=>realState.set(i,v));
                }
                return ()=>{
                    for(const dep of deps){
                        dep.clearEvents();
                    }
                }
            },deps);
            return [realState.state,lastEvent];
        }
        /**
         *
         * `useDepState` returns the Event when of each dependent in the {@link DependencyArray} changes, but this is not the main purpose. The main purpose of this hook is to cause a rerender whenever any of the dependents `onChange` for objects and arrays or `onUpdate` for regular dependents Event is called to any {@link State} and pass the updated list of states and you pass true to the event function.
         *
         * Usage note: eventKey is used to prevent many eventListeners from being attached to the same manager for the same rerender request.
         * @typeParam S - underlying type of the manager {@link ArrayState} passed
         * @see {@link ArrayState}
         * @see {@link DependencyArray}
         * @see {@link useId}
         * @see {@link EventHolders.ArrayStateEvents.onChange|onChange}
         * @see {@link EventHolders.ObjectStateEvents.onChange|onChange}
         * @see {@link EventHolders.StateEvents.onUpdate|onUpdate}
         * @see {@link EventHolders.ArrayStateEvents.onChildUpdate|onChildUpdate}
         */
        export function useDepMonitor<const M extends DependencyArray>(deps:M,onEvent:DependencyFunc<M,boolean|void>, eventKey?:Manager.Key){
            const realState = useArrayManager<DependencyArgs<M>>(()=>deps.map((dep)=>dep.val()) as DependencyArgs<M>)
            const lastEvent =useEventMonitor(realState,"onChildUpdate",()=>onEvent(realState.state,deps),eventKey);
            useInstantEffect(()=>{
                for(let i = 0;i<deps.length;i++){
                    const dep = deps[i];
                    dep.attachEvent((v)=>realState.set(i,v));
                }
                return ()=>{
                    for(const dep of deps){
                        dep.clearEvents();
                    }
                }
            },deps);
            return lastEvent;
        }

    }
    export namespace EventHolders{
        export interface StateEvents<T extends tsType,S extends State<T>> extends EventHolder {
            /**
             * `onAlert` is a misc event that should be used to separate when you want to notify the component from something actually changing in the {@link State}
             * @see {@link State}
             */
            onAlert?:EventManager<Callback<EventTypes.Event<S>>>;
            /**
             * `onRemoval` is a event that should be used for cleanup of anything created inside of the events of this {@link State}
             * @see {@link State}
             */
            onRemoval?:EventManager<Callback<EventTypes.RemovalEvent<S>>>;
            /**
             * `onUpdate` should be called when the underlying state inside a {@link State} object has been Updated.
             *
             * Usage Note: this event should not be called if only the attributes/children inside the underlying state have changed.
             * @see {@link State}
             */
            onUpdate?:EventManager<Callback<EventTypes.UpdateEvent<T,S>>>,
        }
        export interface ObjectStateEvents<T extends tsTypeObject,S extends ObjectState<T>> extends StateEvents<T,S> {
            /**
             * `onChange` should be called when the underlying state inside a {@link ObjectState} object has been Updated or its children have been Updated.
             *
             * @see {@link ObjectState}
             */
            onChange?:EventManager<Callback<EventTypes.ChangeEvent<T,S>>>;
            /**
             * `onChildUpdate` should be called when the underlying state inside a {@link ObjectState} object's children have been Updated.
             *
             * @see {@link ObjectState}
             */
            onChildUpdate?:EventManager<Callback<EventTypes.ChildUpdateEvent<T,S>>>
        }
        export interface ArrayStateEvents<T extends tsTypeArray,S extends ArrayState<T>> extends StateEvents<T,S> {
            /**
             * `onLengthUpdate` should be called when the underlying length of the state inside a {@link ArrayState} object has been changed.
             *
             * @see {@link ArrayState}
             */
            onLengthUpdate?:EventManager<Callback<EventTypes.LengthUpdateEvent<T, S>>>;
            /**
             * `onChildUpdate` should be called when the underlying state inside a {@link ArrayState} object's children/entries have been Updated.
             *
             * @see {@link ArrayState}
             */
            onChildUpdate?:EventManager<Callback<EventTypes.IndexUpdateEvent<T,S>>>;
            /**
             * `onChange` should be called when the underlying state inside a {@link ArrayState} object has been Updated or its children have been Updated.
             *
             * @see {@link ArrayState}
             */
            onChange?:EventManager<Callback<EventTypes.ArrayChangeEvent<T,S>>>;
        }
    }


    export type GetState<M extends State<any>> = M extends State<any>?M["state"]:never;

    export class State<T extends tsType>{
        state:T;
        events:EventHolder;
        eventIDX:number;

        constructor(init:T) {
            this.state=init;
            this.events={};
            this.eventIDX=0;
        }
        getEvents<E extends EventHolders.StateEvents<T,this>>(){
            return this.events as E;
        }
        addEvent<K extends keyof EventHolders.StateEvents<T,this>>(name:K,event:Exclude<EventHolders.StateEvents<T,this>[K],undefined>[number],eventKey?:Key,childKey?:Key){
            if(childKey!==undefined){
                if(!this.events["childEvents"]) {
                    this.events["childEvents"] = {};
                }
                if(!this.events["childEvents"][childKey]){
                    // @ts-ignore
                    this.events["childEvents"][childKey]={}
                }
            }
            // @ts-ignore
            const events = (childKey!==undefined?this.events["childEvents"][childKey]:this.events) as EventHolder
            if(!events[name]){
                // @ts-ignore
                events[name]={};
            }
            // @ts-ignore
            if(!((eventKey)&&(eventKey in events[name]))){
                this.eventIDX++;
            }
            events[name][eventKey?eventKey:this.eventIDX-1]=event;
            return eventKey?eventKey:this.eventIDX-1;
        }
        removeEvent<K extends keyof EventHolders.StateEvents<T,this>>(name:K,eventKey:Key,childKey?:Key){
            if(childKey!==undefined){
                // @ts-ignore
                if(this.events?.["childEvents"]?.[childKey]?.[name]?.[eventKey]) {
                    // @ts-ignore
                    delete this.events["childEvents"][childKey][name][eventKey]
                }
            }else{
                if(this.events[name]?.[eventKey]) {
                    delete this.events[name][eventKey]
                }
            }
            this.triggerRemoval({eventType:name, eventKey:eventKey,childKey:childKey});
        }
        hasEvent<K extends keyof EventHolders.StateEvents<T,this>>(name:K,eventKey:Key,childKey?:Key){
            if(childKey!==undefined){
                // @ts-ignore
                return !!(this.events?.["childEvents"]?.[childKey]?.[name]?.[eventKey])
            }else{
                return !!(this.events[name]?.[eventKey])
            }
        }

        trigger<E extends EventHolder,K extends keyof E,O extends EventOptionTypes.EventOptions>(eventName:K,options:O){

            const paraEvents = (this.events as unknown as E)[eventName];
            // @ts-ignore
            const childEvents:E[K] ='childKey' in options && options.childKey!==undefined?(this.events.childEvents?.[options.childKey]?.[eventName]) :undefined;
            const events:E[K] = paraEvents?childEvents?{...paraEvents,...childEvents}:paraEvents:childEvents;
            if(events!==undefined) {
                if (options.omitEventIDX || options.allowEventIDX) {
                    let keys = (options.allowEventIDX ? options.allowEventIDX : Object.keys(events));
                    if (options.omitEventIDX) {
                        const omitSet = new Set(options.omitEventIDX)
                        keys = keys?.filter(key => !omitSet.has(key))
                    }
                    delete options.omitEventIDX;
                    delete options.allowEventIDX;
                    keys?.forEach((idx) => events[idx]({manager:this,eventIDX:idx,eventType:eventName,...options}));
                } else {
                    Object.entries(events).forEach(([idx,callback]) => callback({manager: this, eventIDX: idx,eventType:eventName,...options}))
                }
            }
        }
        triggerAlert(options:EventOptionTypes.EventOptions){
            this.trigger<EventHolders.StateEvents<T,this>,"onAlert",EventOptionTypes.EventOptions>("onAlert",options);
        }
        triggerUpdate(options:EventOptionTypes.UpdateEventOptions<T>){
            this.trigger<EventHolders.StateEvents<T,this>,"onUpdate",EventOptionTypes.UpdateEventOptions<T>>("onUpdate",options);
        }
        triggerRemoval(options:EventOptionTypes.RemovalEventOptions){
            this.trigger<EventHolders.StateEvents<T,this>,"onRemoval",EventOptionTypes.RemovalEventOptions>("onRemoval",options);
        }
        update(newVal:T,options?:EventOptionTypes.EventOptions){
            this.triggerUpdate({...options,prevState:this.state,currState:this.state=newVal});
        }
        getState(){
            return this.state;
        }
        dep():Dependant<this,T,T>{
            return new Dependant(this)
        }
        copy(){
            return new State(this.state)
        }
    }

    export type GetChildren<O extends ObjectState<any>> = O extends ObjectState<infer T>?T:never;
    export type GetStateType<T>=T extends tsType ? T extends tsTypeArray?ArrayState<T>:T extends tsTypeObject?ObjectState<T>:undefined:never;
    export class ObjectState<T extends tsTypeObject> extends State<T> {
        childManagers:{[P in keyof T as Exclude<T[P],undefined> extends tsTypeObject|tsTypeArray?P:never]+?: GetStateType<Exclude<T[P],undefined>>};
        hasDeps:boolean=false;
        constructor(init:T) {
            super(init);
            this.childManagers={};
        }
        override getEvents<E extends EventHolders.ObjectStateEvents<T,this>>(){
            return this.events as E;
        }
        override addEvent<K extends keyof EventHolders.ObjectStateEvents<T,this>>(name: K, event: Exclude<EventHolders.ObjectStateEvents<T,this>[K], undefined>[number],eventKey?:Key,childKey?:Key) {
            return super.addEvent(name, event,eventKey,childKey);
        }
        override removeEvent<K extends keyof EventHolders.ObjectStateEvents<T,this>>(name:K,eventKey:Key,childKey?:Key){
            return super.removeEvent(name, eventKey,childKey);
        }
        override hasEvent<K extends keyof EventHolders.ObjectStateEvents<T,this>>(name:K,eventKey:Key,childKey?:Key){
            return super.hasEvent(name, eventKey,childKey);
        }
        addChildEvent<K extends keyof T>(key:K,event:Exclude<EventHolders.ObjectStateEvents<T,this>["onChildUpdate"], undefined>[number],eventKey?:Key){
            return this.addEvent("onChildUpdate",event,eventKey,key);
        }
        triggerChildUpdate(options:EventOptionTypes.ChildUpdateEventOptions<T>){
            this.trigger<EventHolders.ObjectStateEvents<T,this>,"onChildUpdate",EventOptionTypes.ChildUpdateEventOptions<T>>("onChildUpdate",options);
        }
        triggerChange(options:EventOptionTypes.ChangeEventOptions<T>){
            this.trigger<EventHolders.ObjectStateEvents<T,this>,"onChange",EventOptionTypes.ChangeEventOptions<T>>("onChange",options);
        }
        override update(newVal:T,options?:EventOptionTypes.EventOptions,prev?:T){
            const prevState=(prev || this.state)
            if(newVal!==prevState){
                if(!prev) {
                    super.update(newVal, options);
                }
                for(const key in prevState){
                    if(key in this.childManagers) {
                        if (!(key in newVal) || newVal[key] === undefined || !(newVal[key] && typeof newVal[key] === "object")) {
                            // @ts-ignore
                            delete this.childManagers[key];
                        } else if (prevState[key] !== newVal[key]) {
                            // @ts-ignore
                            this.childManagers[key]?.update(newVal[key],{omitEventIDX:["0"]})
                        }
                    }else if(!(key in newVal)){
                        this.triggerChildUpdate({...options,childKey:key,childPrevState:prevState[key],childCurrState:undefined as T[keyof T],parentState:newVal});
                    }
                }
                for(const key in newVal){
                    if(prevState[key]!==this.state[key]) {
                        this.triggerChildUpdate({
                            ...options,
                            childKey: key,
                            childPrevState: prevState[key],
                            childCurrState: this.state[key],
                            parentState: this.state
                        });
                    }
                }
                this.triggerChange({callerKey:options?.callerKey,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
            }
        }

        has<K extends keyof T>(key:K):boolean{
            return key in this.state
        }
        hasManager<K extends keyof T>(key:K):boolean{
            return key in this.childManagers;
        }
        set<K extends keyof T>(key:K,value:T[K],options?:EventOptionTypes.EventOptions) {
            this.triggerChildUpdate({...options,childKey:key,childPrevState:this.state[key],childCurrState:this.state[key] = value,parentState:this.state});
            this.triggerChange({callerKey:options?.callerKey,childKey:key,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
        }
        remove<K extends keyof T>(key:K,options?:EventOptionTypes.EventOptions) {
            //@ts-ignore
            this.triggerChildUpdate({...options,childKey:key,childPrevState:this.state[key],childCurrState:(delete this.state[key])?undefined:undefined,parentState:this.state});
            this.triggerChange({callerKey:options?.callerKey,childKey:key,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
        }
        getValue<K extends keyof T>(key:K) {
            return this.state[key];
        }
        override dep<K extends (keyof T|undefined) = undefined>(key?:K):K extends undefined?Dependant<this,T,T>:StateDependant<this, K&keyof T,T[K&keyof T]> {
            this.hasDeps=true;
            // @ts-ignore
            return key!==undefined?new StateDependant(this,key):super.dep();
        }
        get<K extends keyof typeof this.childManagers,I extends T[K]|undefined=undefined>(key:K,init?:I):I extends undefined?undefined extends T[K]?typeof this.childManagers[K]:Exclude<typeof this.childManagers[K],undefined>:Exclude<typeof this.childManagers[K],undefined>{

            if(key in this.childManagers){
                // @ts-ignore
                return this.childManagers[key];
            }else {
                if(this.state[key]===undefined&&init!==undefined){
                    this.state[key]=init;
                }
                if(this.state[key]===undefined||!(this.state[key]&&typeof this.state[key]==="object")){
                    // @ts-ignore
                    return undefined
                }
                // @ts-ignore
                const newState = this.childManagers[key]= Array.isArray(this.state[key])?new ArrayState(this.state[key]):new ObjectState(this.state[key] as tsTypeObject);
                newState.addEvent("onUpdate",(e)=>{
                    // @ts-ignore
                    this.set(key,e.currState);
                })
                // @ts-ignore
                return newState;
            }
        }
        override copy(){
            return new ObjectState({...this.state});
        }

    }
    export type GetArrayChildren<O extends ArrayState<any>> = O extends ArrayState<infer T>?T:never;
    export type GetArrayChildManager<T extends ArrayState<any>> =undefined extends GetArrayChildren<T>[number]?T["childManagers"][number]:Exclude<T["childManagers"][number],undefined>
    export class ArrayState<T extends tsTypeArray> extends State<T> {
        childManagers:{[P in keyof T&number]+?: GetStateType<T[P]>};
        retired:typeof this.childManagers;
        hasDeps:boolean=false;
        constructor(init:T) {
            super(init);
            this.childManagers={};
            this.retired={};
        }
        override getEvents<E extends EventHolders.ArrayStateEvents<T,this>>(){
            return this.events as E;
        }
        override addEvent<K extends keyof EventHolders.ArrayStateEvents<T,this>>(name: K, event: Exclude<EventHolders.ArrayStateEvents<T,this>[K], undefined>[number],eventKey?:Key,childKey?:Key){
            return super.addEvent(name, event,eventKey,childKey);
        }
        override removeEvent<K extends keyof EventHolders.ArrayStateEvents<T,this>>(name:K,eventKey:Key,childKey?:Key){
            return super.removeEvent(name, eventKey,childKey);
        }
        override hasEvent<K extends keyof EventHolders.ArrayStateEvents<T,this>>(name:K,eventKey:Key,childKey?:Key){
            return super.hasEvent(name, eventKey,childKey);
        }
        addChildEvent(key:number,event:Exclude<EventHolders.ArrayStateEvents<T,this>["onChildUpdate"], undefined>[number],eventKey?:Key){
            return this.addEvent("onChildUpdate",event,eventKey,key);
        }
        addLengthEvent(event:Exclude<EventHolders.ArrayStateEvents<T,this>["onLengthUpdate"], undefined>[number],eventKey?:Key){
            return this.addEvent("onLengthUpdate",event,eventKey);
        }
        triggerChange(options:EventOptionTypes.ArrayChangeEventOptions<T>) {
            this.trigger<EventHolders.ArrayStateEvents<T,this>,"onChange",EventOptionTypes.ArrayChangeEventOptions<T>>("onChange",options);
        }
        triggerChildUpdate(options:EventOptionTypes.IndexUpdateEventOptions<T>){
            this.trigger<EventHolders.ArrayStateEvents<T,this>,"onChildUpdate",EventOptionTypes.IndexUpdateEventOptions<T>>("onChildUpdate",options);
        }
        triggerLengthUpdate(options:EventOptionTypes.LengthUpdateEventOptions<T>){
            this.trigger<EventHolders.ArrayStateEvents<T,this>,"onLengthUpdate",EventOptionTypes.LengthUpdateEventOptions<T>>("onLengthUpdate",options);
        }
        override update(newVal:T,options?:EventOptionTypes.EventOptions,prev?:T){
            const prevState=(prev || this.state);
            if(newVal!==prevState) {
                if (!prev){
                    super.update(newVal, options);
                }
                for (const key in prevState) {
                    if (key in this.childManagers) {
                        if (!(key in newVal) || newVal[key] === undefined || !(newVal[key] && typeof newVal[key] === "object")) {
                            // @ts-ignore
                            if(this.childManagers[key].hasDeps){
                                this.retired[key]=this.childManagers[key];
                            }
                            // @ts-ignore
                            delete this.childManagers[key];
                        } else if (prevState[key] !== newVal[key]) {
                            // @ts-ignore
                            this.childManagers[key]?.update(newVal[key], {omitEventIDX: ["0"]})
                        }
                    } else if (!(key in newVal)) {
                        this.triggerChildUpdate({
                            ...options,
                            childKey: Number(key),
                            childPrevState: prevState[key],
                            childCurrState: undefined,
                            parentState: newVal
                        });
                    }
                }
                for (const key in newVal) {
                    if(prevState[key]!==this.state[key]) {
                        if(key in this.retired&&(newVal[key] && typeof newVal[key] === "object")){
                            this.childManagers[key]=this.retired[key];
                            delete this.retired[key];
                            // @ts-ignore
                            this.childManagers[key]?.update(newVal[key], {omitEventIDX: ["0"]})
                        }
                        this.triggerChildUpdate({
                            ...options,
                            childKey: Number(key),
                            childPrevState: prevState[key],
                            childCurrState: this.state[key],
                            parentState: this.state
                        });
                    }
                }
                if(newVal.length!==prevState.length){
                    this.triggerLengthUpdate({...options,currLength:this.state.length,prevLength:prevState.length,currState:this.state});
                }
                this.triggerChange({callerKey:options?.callerKey,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
            }
        }
        sort(compareFn:(a:T[number],b:T[number])=>number,options?:EventOptionTypes.EventOptions){
            const changes = [...Array(this.state.length).keys()].sort((a,b)=>compareFn(this.state[a],this.state[b]));
            const changeSet:{[key:number]:T[number]}={}
            let changed:boolean=false;
            for(let i = 0;i<this.state.length;i++){
                if(i!=changes[i]){
                   changeSet[i]=this.at(changes[i]);
                   changed = true;
                }
            }
            for (const key in changeSet) {
                const temp = this.state[key];
                this.state[key]=changeSet[key];
                changeSet[key]=temp;
            }
            if(changed) {
                for (const key in changeSet) {
                    const prev = changeSet[key];
                    if (key in this.childManagers) {
                        if (this.state[key] === undefined || !(this.state[key] && typeof this.state[key] === "object")) {
                            // @ts-ignore
                            if(this.childManagers[key].hasDeps){
                                this.retired[key]=this.childManagers[key];
                            }
                            // @ts-ignore
                            delete this.childManagers[key];
                        } else if (this.state[key] !== prev) {
                            // @ts-ignore
                            this.childManagers[key]?.update(this.state[key], {omitEventIDX: ["0"]})
                        }
                    }
                    this.triggerChildUpdate({
                        ...options,
                        childKey: Number(key),
                        childPrevState: prev,
                        childCurrState: this.state[key],
                        parentState: this.state
                    });
                }
                this.triggerChange({
                    callerKey: options?.callerKey,
                    allowEventIDX: options?.allowEventIDX,
                    omitEventIDX: options?.omitEventIDX
                });
                return true;
            }
            return false;
        }
        set(key:number,value:T[number],options?:EventOptionTypes.EventOptions) {
            this.triggerChildUpdate({...options,childKey:key,childPrevState:this.state[key],childCurrState:this.state[key]=value,parentState:this.state});
            this.triggerChange({callerKey:options?.callerKey,childKey:key,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
        }
        remove(key:number,options?:EventOptionTypes.EventOptions) {
            //@ts-ignore
            this.triggerChildUpdate({...options,childKey:key,childPrevState:this.state[key],childCurrState:(delete this.state[key])?undefined:undefined,parentState:this.state});
            this.triggerChange({callerKey:options?.callerKey,childKey:key,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
        }
        push(value:T[number],options?:EventOptionTypes.EventOptions) {
            this.triggerChildUpdate({...options,childKey:this.state.push(value)-1,childPrevState:undefined,childCurrState:this.state[this.state.length-1],parentState:this.state});
            this.triggerLengthUpdate({...options,currLength:this.state.length,prevLength:this.state.length-1,currState:this.state});
            this.triggerChange({callerKey:options?.callerKey,childKey:this.state.length-1,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
        }
        append(...values:T[number][]){
            this.appendOptions(undefined,...values);
        }
        appendOptions(options?:EventOptionTypes.EventOptions,...values:T[number][]){
            const prev = [...this.state]  as T;
            this.state.push(...values);
            this.update(this.state,options,prev);
        }
        insertOptions(index:number,options?:EventOptionTypes.EventOptions,...values:T[number][]) {
           this.spliceOptions(index,0,options,...values);
        }
        insert(index:number,...values:T[number][]){
            this.splice(index,0,...values);
        }
        insertRaw(index:number,...values:T[number][]){
            this.spliceRaw(index,0,...values);
        }
        getStateCopy(){
            return [...this.state];
        }
        updateDiff(copy:T,options?:EventOptionTypes.EventOptions){
            this.update(this.state,options,copy);
        }
        spliceOptions(index:number,deleteCount: number,options?:EventOptionTypes.EventOptions,...values:T[number][]) {
            const prev = [...this.state]  as T;
            this.state.splice(index, deleteCount,...values);
            this.update(this.state,options,prev);
        }
        spliceRaw(index:number,deleteCount:number,...values:T[number][]){
            this.state.splice(index, deleteCount,...values);
        }
        splice(index:number,deleteCount:number,...values:T[number][]) {
            this.spliceOptions(index,deleteCount,undefined,...values);
        }
        removeLast(options?:EventOptionTypes.EventOptions){
            this.triggerChildUpdate({...options,childKey:this.state.length-1,childPrevState:this.state.pop(),childCurrState:undefined,parentState:this.state});
            this.triggerLengthUpdate({...options,currLength:this.state.length,prevLength:this.state.length+1,currState:this.state});
            this.triggerChange({callerKey:options?.callerKey,childKey:this.state.length,allowEventIDX:options?.allowEventIDX,omitEventIDX:options?.omitEventIDX});
        }
        last(){
            return this.at(this.state.length-1)
        }
        first(){
            return this.at(0);
        }
        length(){
            return this.state.length;
        }
        at(key:number) {
            return this.state[key] as T[number];
        }
        override dep<K extends ((keyof T&number) | undefined)=undefined>(key?:K):K extends undefined?Dependant<this,T,T>:StateDependant<this, K&number,T[K&number]>{
            this.hasDeps=true;
            //@ts-ignore
            return key!==undefined?new StateDependant(this,key):super.dep();
        }
        get<K extends keyof T&number,I extends T[K]|undefined=undefined>(key:K,init?:I):I extends undefined?undefined extends T[K]?typeof this.childManagers[K]:Exclude<typeof this.childManagers[K],undefined>:Exclude<typeof this.childManagers[K],undefined>{

            if(key in this.childManagers){
                // @ts-ignore
                return this.childManagers[key];
            }else {
                if(this.state[key]===undefined&&init!==undefined){
                    this.state[key]=init;
                }
                if(this.state[key]===undefined||!(this.state[key]&&typeof this.state[key]==="object")){
                    // @ts-ignore
                    return undefined
                }
                let state;
                if(!!(state=this.retired[key])){
                    delete this.retired[key];
                   if((Array.isArray(this.state[key])?state instanceof ArrayState:state instanceof ObjectState)){
                       //@ts-ignore
                       this.childManagers[key]=state;

                   }else{
                       state=undefined;
                   }
                }
                if(!state) {
                    // @ts-ignore
                    state = this.childManagers[key] = Array.isArray(this.state[key]) ? new ArrayState(this.state[key]) : new ObjectState(this.state[key] as tsTypeObject);
                    state.addEvent("onUpdate", (e) => {
                        // @ts-ignore
                        this.set(key, e.currState);
                    })
                }
                // @ts-ignore
                return state;
            }
        }
        override copy(){
            return new ArrayState([...this.state]) as ArrayState<T>;
        }
    }
    export type StateKey<M extends ObjectState<any>|ArrayState<any>,K> = M extends ArrayState<any>?GetArrayChildren<M>[K&keyof GetArrayChildren<M>]:M extends ObjectState<infer T>?T[K&keyof T]:never;
    export class Dependant<M extends State<any>,V=GetState<M>,D=GetState<M>>{
        manager:M;
        transFunc?:(val:D)=>V;
        deTransFunc?:(inVal:any)=>any;
        events?:Set<Key>;
        constructor(manager:M){
            this.manager = manager;
        }
        _val():D{
           return this.manager.getState();
        }
        val():V{
            if(this.transFunc){
                return this.transFunc(this._val());
            }else {
                return this._val() as unknown as V;
            }
        }
        apply<NV>(func:(val:D)=>NV){
            //@ts-ignore
            this.transFunc = func;
            return this as unknown as Dependant<M,NV,D>;
        }
        unapply(func:(inVal:V)=>D){
            this.deTransFunc=func;
            return this;
        }
        _update(val:D){
            this.manager.update(val);
        }
        /**
         * assumes you have a detrans otherwise updates the dependent
         */
        update(inVal:V){
            if(this.deTransFunc){
                this._update(this.deTransFunc(inVal));
            }else{
                this._update(inVal as unknown as D);
            }
        }
        spread<O extends {[key:Key]:any}>(func:(val:D)=>O){
            const val = func(this._val());
            const saver:{saved:OptionalObject<O>|O} = {saved:{} as OptionalObject<O>};
            for(const key in val){
                //@ts-ignore
                val[key]=new Dependant(this.manager).apply((v)=>{
                    if(!(key in saver.saved)){
                        saver.saved=func(v);
                    }
                    const temp = saver.saved[key];
                    delete saver.saved[key];
                    return temp as O[Extract<keyof O, string>];
                });
            }
            return val as {[P in keyof O]:Dependant<M,O[P],D>};
        }
        clearEvents(){
            if(this.events) {
                for (const key of this.events) {
                    if (this.manager instanceof Manager.ObjectState || this.manager instanceof Manager.ArrayState) {
                        this.manager.removeEvent("onChange", key)
                    } else {
                        this.manager.removeEvent("onUpdate", key)
                    }
                }
            }
        }
        attachEvent(func:(val:V)=>void,eventKey?: Manager.Key){
            let event;
            if(this.manager instanceof Manager.ObjectState || this.manager instanceof Manager.ArrayState){
                event=this.manager.addEvent("onChange",()=>func(this.val()),eventKey)
            }else{
                event=this.manager.addEvent("onUpdate",()=>func(this.val()),eventKey);
            }
            if(!this.events){
                this.events = new Set();
            }
            this.events.add(event);
        }
    }
    export class StateDependant<M extends ObjectState<any>|ArrayState<any>,K,V=StateKey<M,K>> extends Dependant<M,V,StateKey<M,K>>{
        key:K;
        constructor(manager:M,key:K) {
            super(manager);
            this.key = key;
        }
        override _val():StateKey<M,K>{
            if(this.manager instanceof ObjectState){
                //@ts-ignore
                return this.manager.getValue(this.key);
            }else{
                //@ts-ignore
                return this.manager.at(this.key);
            }
        }
        override apply<NV>(func:(val:StateKey<M,K>)=>NV){
            //@ts-ignore
            this.transFunc = func;
            return this as unknown as StateDependant<M,K,NV>;
        }
        override _update(val: Manager.StateKey<M, K>) {
                //@ts-ignore
                this.manager.set(this.key, val);
        }
        override unapply(func:(inVal:V)=>Manager.StateKey<M, K>){
            //@ts-ignore
            this.deTransFunc=func;
            return this;
        }
        override spread<O extends {[key:Key]:any}>(func:(val:StateKey<M,K>)=>O){
            const val = func(this._val());
            const saver:{saved:OptionalObject<O>|O} = {saved:{} as OptionalObject<O>};
            for(const key in val){
                //@ts-ignore
                val[key]=new StateDependant(this.manager,this.key).apply((v)=>{
                    if(!(key in saver.saved)){
                        saver.saved=func(v);
                    }
                    const temp = saver.saved[key];
                    delete saver.saved[key];
                    return temp as O[Extract<keyof O, string>];
                });
            }
            return val as {[P in keyof O]:StateDependant<M,K,O[P]>};
        }
        override clearEvents(){
            if(this.events) {
                for (const key of this.events) {
                    //@ts-ignore
                    this.manager.removeEvent("onChildUpdate", key, this.key);
                }
            }
        }
        override attachEvent(func:(val:V)=>void,eventKey?: Manager.Key){
            //@ts-ignore
            const event = this.manager.addChildEvent(this.key,()=>func(this.val()),eventKey);
            if(!this.events){
                this.events = new Set();
            }
            this.events.add(event);
        }
        

    }
    export type GetDepVal<D extends Dependant<any,any,any>> = D extends Dependant<infer _,infer V,infer _D>?V:never;
    export type DependencyArray = Dependant<any,any,any>[]
    export type DependencyArgs<M extends DependencyArray> = M extends [infer R extends Dependant<any,any,any>,...(infer L extends Dependant<any,any,any>[])]?[R extends Dependant<infer _,infer V,infer D>?V:never,...DependencyArgs<L>]:[]
    export type DependencyFunc<M extends DependencyArray,O> = (args:DependencyArgs<M>,deps:M)=>O

}







