import * as React from "react"
import {useEffect} from "react";
import {QBReaderSettings} from "../../../main";

export const SubjectButton = (props: {text:string, color:string, onClick:() => void, active:boolean, settings:QBReaderSettings})  => {

	useEffect(() => {

	}, [props.active])

	return <button
		onClick={props.onClick}
		className={(props.active ? "mod-cta" : "") + " subj-button-transition"}
		style={{color: props.active && ! props.settings.disableCatColors ? props.color : "", fontWeight: "bold"}}
	>
			{props.text}
	</button>

}
