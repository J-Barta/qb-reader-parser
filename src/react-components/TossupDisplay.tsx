import * as React from "react";
import {Tossup} from "./QBReaderMainComponent";
import {useEffect, useRef, useState} from "react";
import {TFile} from "obsidian";
import {useApp} from "../QBREaderView";

type sentence = {
	text:string,
	pronoun:string
}

type searchMatch  = {
	index:number,
	sentence:sentence
}

export default function TossupDisplay(props: {
	tossup:Tossup,
	file:TFile,
	searchQuery:string,
	addToSearchResults:(ele:HTMLElement) => void,
	removeFromSearchResults:() => void,
	matchID:number,
	displayNumberOfCardsInDoc:boolean
}) {

	const {vault} = useApp()!;

	const ref = useRef(null);

	const sentenceSplitter = /[^.!?]*((?:[tT]his|[tT]hese) [\w-]+)[^.!?]*[.!?]["”]*/g;

	//Replace problematic periods with random ascii characters
	const currentTossupText:string = props.tossup.question
		.replace(/([0-9]+).([0-9]+)/g, "$1ξ$2")
		.replace(/([Mm]rs*)./g, "$1ξ")

	const sentences:sentence[] = [...currentTossupText.matchAll(sentenceSplitter)]
		.map((e):sentence => {return {text: e[0], pronoun: e[1]}});

	//Switch those random ascii characters back to periods
	sentences.forEach(e => {
		e.text = e.text.replace("ξ", ".")
	})

	const [activeSentence, setActiveSentence]
		= useState<sentence>({text:"", pronoun:""})

	const [popupOpen, setPopupOpen] = useState(false);

	const rawAnswerParser = /[^[]*/g;
	const rawPrimaryAnswer = [...props.tossup.rawAnswer.matchAll(rawAnswerParser)][0][0]

	const [searchMatches, setSearchMatches] = useState<searchMatch[]>([])

	const handlePopupOpen = (event: React.MouseEvent<HTMLElement>, sentence:sentence) => {
		setPopupOpen(true);
		setActiveSentence(sentence)
	};

	const handlePopupClose = () => {
		setPopupOpen(false);
	};

	const handleSentenceClick = async (sentence:sentence) => {

		let sentenceResult = sentence.text.replace("(*) ", "")
		sentenceResult = sentenceResult.replace("For 10 points, ", "")
		sentenceResult = sentenceResult.replace(sentence.pronoun, `==${rawPrimaryAnswer}::${sentence.pronoun}==`).trim()

		let content = await vault.read(props.file);

		content = content.replace(new RegExp(/Number of cards in this document: \*\*[0-9]+\*\*/g), "")
		if(content[0] === "\n") content = content.substring(1)

		const numberOfCards = (content.match(/==.+?==/g) || []).length + 1

		// Append content (use \n for line break)
		const newContent = props.displayNumberOfCardsInDoc ?
			numberOfCardsString(numberOfCards)
			+ "\n"
			+ content
			+ "\n\n"
			+ sentenceResult
			+ "\n"
			+ numberOfCardsString(numberOfCards)
			:
			content + "\n\n" + sentenceResult
		;
		// Update file you want to edit
		await vault.modify(props.file, newContent);
	}

	const numberOfCardsString = (num:number) => {
		return `Number of cards in this document: **${num}**`
	}

	const getThisSearchMatch = (item:sentence) => {
		return searchMatches.filter(e => e.sentence.text === item.text)[0]
	}

	//Search stuff
	useEffect(() => {

		const newMatches:searchMatch[] = []

		if(props.searchQuery !== "") {
			sentences.forEach((e) => {
				const matchIndex = e.text.toLowerCase().indexOf(props.searchQuery.toLowerCase())

				if(matchIndex !== -1) {

					newMatches.push({index: matchIndex, sentence: e})
				}
			})
		}

		if(ref.current) {
			if(newMatches.length > 0) {
				props.addToSearchResults(ref.current)
			} else  {
				props.removeFromSearchResults()
			}
		}

		setSearchMatches(newMatches)
	}, [props.searchQuery])

	return <div ref={ref} id={`search-match-${props.matchID}`}>
		<p><b>{props.tossup.category}</b> - {props.tossup.subcat} - {props.tossup.setName} - {props.tossup.difficulty}</p>
		<p>
			{sentences.map(e =>
				<span
					key={e.text}
					className="qb-popup sentence"
					onMouseEnter={(event) => handlePopupOpen(event, e)}
					onMouseLeave={() => handlePopupClose()}
					onClick={() => handleSentenceClick(e)}
				>

					{searchMatches.filter(ele => ele.sentence.text === e.text).length > 0 ?
						<span>
							{e.text.substring(0, getThisSearchMatch(e).index)}

							<span className={"search-output"}>
									{e.text.substring(getThisSearchMatch(e).index, getThisSearchMatch(e).index + props.searchQuery.length)}
							</span>
							{
								e.text.substring(
								getThisSearchMatch(e).index+props.searchQuery.length)
							}

						</span> :
						<span>
							{e.text.substring(0, e.text.indexOf(e.pronoun))}

							<span className={"pronoun-replace"}>
								<b>
									{e.pronoun}
								</b>
							</span>
							{e.text.substring(e.text.indexOf(e.pronoun)+e.pronoun.length)}
						</span>
					}



					{/*The Actual popup*/}
					<span className={`qb-popup-text ${popupOpen && activeSentence.text === e.text ? "qb-show" : ""}`} id="myPopup">{activeSentence.pronoun} ➡ {rawPrimaryAnswer}</span>
				</span>


			)}
		</p>

		<p><b>Answer:</b> <span dangerouslySetInnerHTML={{__html: props.tossup.answer}}/></p>
		<hr/>
	</div>
}
