import { Pull } from "APIUtil";
import { useApp } from "QBREaderView";
import { TFile } from "obsidian";
import * as React from "react";
import {SubjectSelector} from "./SubjectSelector";
import {Button, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {useState} from "react";
import TossupDisplay from "./TossupDisplay";


export type Tossup = {
	question:string,
	answer:string,
	rawAnswer:string,
	category: string,
	subcat: string
}

export const QBReaderMainComponent = () => {

    const {workspace} = useApp()!;

	const [questionQuery, setQuestionQuery] = useState("");

	const [activeCategories, setActiveCategories] = useState<string[]>([])
	const [activeSubcats, setActiveSubcats] = useState<string[]>([])

	const [searchType, setSearchType] = useState("all")

    const [questions, setQuestions] = React.useState<Tossup[]>([]);

    const file:TFile = workspace.getActiveFile()!;

	const pullQuestions = () => {
		Pull("query", [
				{
					key: "queryString",
					val: questionQuery
				},
				{
					key: "searchType",
					val: searchType
				},
				{
					key: "categories",
					val: activeCategories.reduce((acc, e) => acc+","+e, "")
				},
				{
					key: "subcategories",
					val: activeSubcats.reduce((acc, e) => acc+","+e, "")
				}

			], (data) => {
				const questionContent:Tossup[] = data.tossups.questionArray.map((e:any):Tossup => {
					return {question: e.question, answer: e.formatted_answer, rawAnswer: e.answer, category: e.category, subcat: e.subcategory}
				});

				setQuestions(questionContent);
			}
		)
	}

    return <div>
        <h1>{file.basename} QB Reader Import</h1>

		<div className={"white-background"}>
			<TextField
				id={"standard-basic"}
				label={"Search Query"}
				variant={"standard"}
				value={questionQuery}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setQuestionQuery(event.target.value);
				}}/>
			<Select
				value={searchType}
				label={"Search Type"}
				onChange={(event:SelectChangeEvent) => setSearchType(event.target.value as string)}
			>
				<MenuItem value={"all"}>All Text</MenuItem>
				<MenuItem value={"question"}>Question</MenuItem>
				<MenuItem value={"answer"}>Answer</MenuItem>

			</Select>

			<SubjectSelector upliftActiveCategories={setActiveCategories} upliftActiveSubcats={setActiveSubcats}/>

			<Button onClick={pullQuestions}>Search</Button>
		</div>


        {
            questions.map(e => <TossupDisplay tossup={e} file={file}/>)
        }
        
    </div>
}
