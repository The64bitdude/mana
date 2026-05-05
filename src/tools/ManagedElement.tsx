import {ReactElement} from "../ReactElement";
import {Manager} from "../StateManager";
import ReactElem = ReactElement.ReactElem;
import ElementProps = ReactElement.ElementProps;



export namespace ManagedElement {
    export function MapAtts<I, O>(input: I, func: (key: Extract<keyof I, string>, value: I[keyof I]) => any): O {
        const temp: any = {}
        for (const key in input) {
            temp[key] = func(key, input[key]);
        }
        return temp as O;
    }

    export type ElementProps<H extends ReactElement.Tag, M extends Manager.State<any>> =
        ReactElement.NoEventProps<H>
        & { manager: M, tagName: H }
        & { [K in keyof ReactElement.Events<H>]: ReactElement.Events<H>[K] extends ((event: infer E) => infer R) | undefined ? Manager.MultiCallback<[m: M, e: E]> : never }
}
export function ManaElem<H extends ReactElement.Tag,M extends Manager.State<any>>(_props:ManagedElement.ElementProps<H, M>){
    return <ReactElem<H> {...(ManagedElement.MapAtts<typeof _props,{key?:string}&ElementProps<H>>(_props,(key,value)=>key.startsWith("on")&&value?((e:Manager.EventTypes.Event<any>)=>value(_props.manager,e)):value))} />
}
