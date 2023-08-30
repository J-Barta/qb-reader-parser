import * as React from "react";
import {Tossup} from "./QBReaderMainComponent";
import {Popover, Typography} from "@mui/material";
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


	const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

	const [activeSentence, setActiveSentence]
		= useState<sentence>({text:"", pronoun:""})

	const open = Boolean(anchorEl);

	const rawAnswerParser = /[^[]*/g;
	const rawPrimaryAnswer = [...props.tossup.rawAnswer.matchAll(rawAnswerParser)][0][0]

	const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, sentence:sentence) => {
		setAnchorEl(event.currentTarget);
		setActiveSentence(sentence)
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
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
					key={e.text} className={"sentence"}
					onMouseEnter={(event) => handlePopoverOpen(event, e)}
					onMouseLeave={handlePopoverClose}
					onClick={() => handleSentenceClick(e)}
				>
					{e.text.substring(0, e.text.indexOf(e.pronoun))}
					<span className={"pronoun-replace"}>
						<b>
							{e.pronoun}
						</b>
					</span>
					{e.text.substring(e.text.indexOf(e.pronoun)+e.pronoun.length)}
				</span>
			)}
		</p>

		<Popover
			id="mouse-over-popover"
			sx={{
				pointerEvents: 'none',
			}}
			open={open}
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'left',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'left',
			}}
			onClose={handlePopoverClose}
			disableRestoreFocus
		>
			<Typography sx={{ p: 1 }}>{activeSentence.pronoun} ➡ {rawPrimaryAnswer}</Typography>
		</Popover>
		<p><b>Answer:</b> <span dangerouslySetInnerHTML={{__html: props.tossup.answer}}/></p>
		<hr/>
	</div>
}
