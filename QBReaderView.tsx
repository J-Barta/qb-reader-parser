import { Pull } from "APIUtil";
import { useApp } from "ExampleView";
import { TFile } from "obsidian";
import * as React from "react";

type Tossup = {
	question:string,
	answer:string
}

export const QBReaderView = () => {

    const {vault, workspace} = useApp()!;

    const [questions, setQuestions] = React.useState<Tossup[]>([]);

    let file:TFile = workspace.getActiveFile()!;

    React.useEffect(() => {
        Pull("query", [
			{
				key: "queryString",
				val: "plasma"
			},
			{
				key: "searchType",
				val: "answer"
			}

		], (data) => {
			const questionContent:Tossup[] = data.tossups.questionArray.map((e:any):Tossup => {
				return {question: e.question, answer: e.formatted_answer}
			});

            setQuestions(questionContent);
		}
		)
    })

    return <div>
        <h1>{file.basename} QB Reader Import</h1>

        {
            questions.map(e => 
                <div>
                    <p>{e.question}</p>
					<p><b>Answer:</b> <span dangerouslySetInnerHTML={{__html: e.answer}}/></p>
					<hr/>
                </div>
            )
        }
        
    </div>
}
