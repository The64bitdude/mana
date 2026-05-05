import {Manager} from "mana-ts/src/StateManager";
import useObjectManager = Manager.ReactHooks.useObjectManager;
import {ManaDep, ManaVal} from "mana-ts/src/tools/ManagedHTML";
import {ManaInput} from "mana-ts/src/tools/ManagedInput";


interface ExampleSubInterface{
    test:number,
    test2:string,
    test3?:string,
    test4?:number,
}
interface ExampleInterface extends ExampleSubInterface{
    test5:ExampleSubInterface,
    test6?:ExampleSubInterface;
    largeTable:ExampleSubInterface[];
}
export function UseCaseTest (){
    const data = useObjectManager<ExampleInterface>({
        test:0,
        test2:"test",
        test5:{
            test:3,
            test2:"hello"
        },
        largeTable:Array.from({length:50000}).map((_,i)=>({test:i,test2:`entry:${i}`}))
    });

    return <>
        <ManaDep dep={data.get("test5").dep("test")} val={(val)=><span>
            example: {val}
        </span>}/>
        <ManaInput manager={data.get("test5")} name={"test"} outputKey={"valueAsNumber"} type={"number"}/>
        <ManaVal val={data.dep("largeTable").apply((arr)=><div>
            {arr.map((val)=>
                <div>
                    <span>
                        index:{val.test},data:{val.test2}
                    </span>
                </div>)}
        </div>)}/>


    </>





}
