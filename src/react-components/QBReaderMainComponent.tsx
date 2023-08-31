import { Pull } from "src/APIUtil";
import { useApp } from "src/QBREaderView";
import { TFile } from "obsidian";
import * as React from "react";
import {SubjectSelector} from "./SubjectSelector";
import {useState} from "react";
import TossupDisplay from "./TossupDisplay";
import {QBReaderSettings} from "../../main";

export type Tossup = {
	question:string,
	answer:string,
	rawAnswer:string,
	category: string,
	subcat: string,
	setName: string,
	difficulty: number,
}

export const QBReaderMainComponent = (props: {settings:QBReaderSettings}) => {

    const {workspace} = useApp()!;

	const [questionQuery, setQuestionQuery] = useState("");

	const [activeCategories, setActiveCategories] = useState<string[]>(props.settings.activeCats)
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
					return {
						question: e.question,
						answer: e.formatted_answer,
						rawAnswer: e.answer,
						category: e.category,
						subcat: e.subcategory,
						setName: e.setName,
						difficulty: e.difficulty,
					}
				});

				setQuestions(questionContent);
			}
		)
	}

    return <div
		onKeyDown={(e) => {
			console.log("keydown enter?")
			if (e.key === "Enter") {
				pullQuestions();
			}
		}}
		>

		<h1>{file.basename} QB Reader Import</h1>

		<div className={"white-background"}>

			<input
				spellCheck={false}
				type={"text"}
				placeholder={"Search Query"}
				value={questionQuery}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setQuestionQuery(event.target.value)
				}}
			/>

			<p>Search Type</p>
			<select
				className={"dropdown"}
				onChange={(e) => setSearchType(e.target.value)}
				value={searchType}
			>
				<option value={"all"}>All Text</option>
				<option value={"question"}>Question</option>
				<option value={"answer"}>Answer</option>
			</select>

			<SubjectSelector settings={props.settings} upliftActiveCategories={setActiveCategories} upliftActiveSubcats={setActiveSubcats}/>

			<button className={"mod-cta"} onClick={pullQuestions}>Search</button>
		</div>
		<div>
			{
				questions.map(e => <TossupDisplay key={e.question} tossup={e} file={file}/>)
			}
		</div>

    </div>
}
