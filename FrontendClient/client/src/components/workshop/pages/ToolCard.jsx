import SmallButton from "./SmallButton";
import EditButton from "./EditButton";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function ToolCard(props) {
    const { userRole } = useContext(AuthContext)

    return (
        <div className=" bg-white flex flex-col rounded-2xl justify-start border-2 h-auto md:flex-col md:w-96 md:h-60">
            <div className="w-50 min-h-54 md:w-50 md:h-full md:flex md:flex-row" >
                <img
                    className="h-40 w-full m-0 object-cover rounded-t-2xl aspect-square justify-center top-0 left-0 right-0 bottom-0 mt-0 md:w-44 md:rounded-l-2xl md:rounded-r-none md:justify-start md:min-h-full"
                    src={props.src}
                    alt={props.alt}
                />
                <h1 className="text-3xl font-bold ml-3 w-52 md:w-28 md:text-xl md:hidden">
                    {props.name}
                </h1>
                <div className="flex justify-items-end flex-col md:max-w-max md:flex-col md:ml-3">

                    <h1 className="hidden text-3xl font-bold ml-3 w-52 md:w-28 md:text-2xl md:block md:mb-4 md:mt-3">
                        {props.name}
                    </h1>

                    <div className="h-24 md:h-60">
                        <p className="ml-3 mr-2 w-52 md:w-36 md:text-sm md:mb-3 md:ml-3">
                            {props.paragraph}
                        </p>
                    </div>

                    <div className="w-20 flex flex-row justify-start mt-2 md:mt-0 md:w-44 md:flex-row md:justify-end mb-3">
                        <SmallButton text="Book" toolId={props.id} />
                        {userRole === 1  ? <EditButton text="Edit" toolId={props.id} /> : null}
                    </div>

                </div>
            </div>
        </div>
    );
}
