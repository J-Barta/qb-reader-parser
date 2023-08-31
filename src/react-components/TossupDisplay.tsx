import * as React from "react";
import {Tossup} from "./QBReaderMainComponent";
import {useState} from "react";
import {TFile} from "obsidian";
import {useApp} from "../QBREaderView";

type sentence = {
	text:string,
	pronoun:string
}
export default function TossupDisplay(props: {tossup:Tossup, file:TFile}) {

	const {vault} = useApp()!;

	const sentenceSplitter = /[^.!?]*((?:[tT]his|[tT]hese) [\w-]+)[^.!?]*[.!?]["”]*/g;

	const sentences:sentence[] = [...props.tossup.question.matchAll(sentenceSplitter)]
		.map((e):sentence => {return {text: e[0], pronoun: e[1]}});



	const [activeSentence, setActiveSentence]
		= useState<sentence>({text:"", pronoun:""})

	const [popupOpen, setPopupOpen] = useState(false);

	const rawAnswerParser = /[^[]*/g;
	const rawPrimaryAnswer = [...props.tossup.rawAnswer.matchAll(rawAnswerParser)][0][0]

	const handlePopupOpen = (event: React.MouseEvent<HTMLElement>, sentence:sentence) => {
		setPopupOpen(true);
		setActiveSentence(sentence)
	};

	const handlePopupClose = () => {
		setPopupOpen(false);
	};

	const handleSentenceClick = async (sentence:sentence) => {

		const content = await vault.read(props.file);

		// Append content (use \n for line break)
		const newContent = content + "\n\n"
			+sentence.text.replace(sentence.pronoun, `==${rawPrimaryAnswer}::${sentence.pronoun}==`);
		// Update file you want to edit
		await vault.modify(props.file, newContent);
	}

	return <div>
		<p><b>{props.tossup.category}</b> - {props.tossup.subcat} - {props.tossup.setName} - {props.tossup.difficulty}</p>
		<p>
			{sentences.map(e =>
				<span
					key={e.text}
					className="popup sentence"
					onMouseEnter={(event) => handlePopupOpen(event, e)}
					onMouseLeave={() => handlePopupClose()}
					onClick={() => handleSentenceClick(e)}
				>

					{e.text.substring(0, e.text.indexOf(e.pronoun))}
						<span className={"pronoun-replace"}>
							<b>
								{e.pronoun}
							</b>
						</span>
						{e.text.substring(e.text.indexOf(e.pronoun)+e.pronoun.length)}

					{/*The Actual popup*/}
					<span className={`popuptext ${popupOpen && activeSentence.text === e.text ? "show" : ""}`} id="myPopup">{activeSentence.pronoun} ➡ {rawPrimaryAnswer}</span>
				</span>


			)}
		</p>

		<p><b>Answer:</b> <span dangerouslySetInnerHTML={{__html: props.tossup.answer}}/></p>
		<hr/>
	</div>
}
