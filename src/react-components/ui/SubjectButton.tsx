import * as React from "React"
import {useEffect} from "react";

export const SubjectButton = (props: {text:string, color:string, onClick:() => void, active:boolean})  => {

	useEffect(() => {

	}, [props.active])

	return <button
		onClick={props.onClick}
		className={(props.active ? "mod-cta" : "") + " subj-button-transition"}
		style={{color: props.active ? props.color : "", fontWeight: "bold"}}
	>
			{props.text}
	</button>

}
