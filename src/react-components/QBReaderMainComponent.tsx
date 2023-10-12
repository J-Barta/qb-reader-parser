import { Pull } from "src/APIUtil";
import {QBREaderView, useApp} from "src/QBREaderView";
import { TFile } from "obsidian";
import * as React from "react";
import {SubjectSelector} from "./SubjectSelector";
import {useEffect, useRef, useState} from "react";
import TossupDisplay from "./TossupDisplay";
import {QBReaderSettings} from "../../main";
import {difficulties, difficulty} from "../Difficulties";
import {ClipLoader} from "react-spinners";
import {useIsVisible} from "../IntersectionHook";
import {SearchContext} from "./context";
import {c} from "./helpers";
import {Icon} from "./Icon/Icon";
import {categories} from "../Categories";

export type Tossup = {
	question:string,
	answer:string,
	rawAnswer:string,
	category: string,
	subcat: string,
	setName: string,
	difficulty: number,
	matchID: number
}

const defaultTossup = {
	matchID: -1
}

export const QBReaderMainComponent = (props: {settings:QBReaderSettings, view:QBREaderView}) => {

    const {workspace} = useApp()!;

	const [questionQuery, setQuestionQuery] = useState("");

	const [activeCategories, setActiveCategories] = useState<string[]>(props.settings.activeCats)
	const [activeSubcats, setActiveSubcats] = useState<string[]>([])
	const [catSelectActive, setCatSelectActive] = useState(false)

	const [activeDifficulties, setActiveDifficulties] = useState<number[]>([])
	const [diffDropdownActive, setDiffDropdownActive] = useState(false)

	const [numberToLoad, setNumberToLoad] = useState(props.settings.defaultNumberQuestions)

	const [searchType, setSearchType] = useState("all")

    const [questions, setQuestions] = React.useState<Tossup[]>([]);

    const file:TFile = workspace.getActiveFile()!;

	const [loading, setLoading] = useState(false)

	const titleRef = useRef(null)
	const isTitleVisible = useIsVisible(titleRef)

	const mainQueryRef = useRef<HTMLInputElement>(null);

	const handleDiffChange = (val:boolean, diff:difficulty) => {
		if(val) {
			activeDifficulties.push(diff.level)

			setActiveDifficulties([...activeDifficulties])
		} else {
			setActiveDifficulties(activeDifficulties.filter(ele => diff.level !== ele))
		}
	}

	const pullQuestions = () => {

		setLoading(true)
		setQuestions([])

		updateCatSelect(false)
		updateDiffSelector(false)

		const diffsToUse = activeDifficulties.length > 0 ? activeDifficulties : difficulties.map(e => e.level)

		const availableSubcats:string[] = categories.filter(e => activeCategories.includes(e.name)).reduce((acc:string[], ele) => {
			acc.push(...ele.subcats)
			return acc;
		}, [])

		const sendSubcats = availableSubcats.length !== activeSubcats.length

		Pull("query", [
				{key: "queryString", val: questionQuery},
				{key: "searchType", val: searchType},
				{key: "categories", val: activeCategories.reduce((acc, e) => acc+","+e, "")},
				{key: "subcategories", val: sendSubcats ? activeSubcats.reduce((acc, e) => acc+","+e, "") : ""},
				{key: "difficulties", val: diffsToUse.reduce((acc, e) => acc+","+e, "")},
				{key: "maxReturnLength", val: numberToLoad.toString()}
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
						...defaultTossup
					}
				});

				setQuestions(questionContent);

				setLoading(false)
			}
		)
	}

	const updateDiffSelector = (val:boolean) => {
		setDiffDropdownActive(val)

		if(val) setCatSelectActive(false)
	}

	const updateCatSelect = (val:boolean) => {
		setCatSelectActive(val)

		if(val) setDiffDropdownActive(false)
	}

	//Search stuff

	const searchRef = useRef<HTMLInputElement>(null);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [debouncedSearchQuery, setDebouncedSearchQuery] =
		useState<string>('');

	const [searchMatches, setSearchMatches] = useState<Tossup[]>([])
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

	const addSearchMatch = (tossup:Tossup) => {
		searchMatches.push(tossup)

		searchMatches.sort((e1, e2) => questions.indexOf(e1) - questions.indexOf(e2))

		setSearchMatches([...searchMatches])

		return searchMatches.indexOf(tossup)
	}

	const removeSearchMatch = (tossup:Tossup) => {
		setSearchMatches(searchMatches.filter(e => e != tossup))
	}


	useEffect(() => {
		const onSearchHotkey = (e: string) => {

			if (e === 'editor:open-search') {
				setIsSearching((val) => !val);
			}
		};

		props.view.emitter.on('hotkey', onSearchHotkey);

		return () => {
			props.view.emitter.off('hotkey', onSearchHotkey);
		};
	}, [props.view]);

	useEffect(() => {
		if (isSearching) {
			searchRef.current?.focus();
		}
	}, [isSearching]);

	useEffect(() => {

		setCurrentMatchIndex(0);

		const win = props.view.getWindow();
		const trimmed = searchQuery.trim();
		let id: number;

		if (trimmed) {
			id = win.setTimeout(() => {
				setDebouncedSearchQuery(trimmed);
			}, 250);
		} else {
			setDebouncedSearchQuery('');
		}

		return () => {
			win.clearTimeout(id);
		};
	}, [searchQuery, props.view]);

	useEffect(() => {
		if(searchMatches.length > 0 && isSearching) {
			scrollMatchIntoView(0)
		}
	}, [searchMatches])

	const scrollMatchIntoView = (index:number) => {
		document.getElementById(`search-match-${index}`)?.scrollIntoView({block:"center", behavior: "smooth"})
	}

	const closeSearchBar = () => {
		setSearchQuery('');
		setCurrentMatchIndex(0)
		setDebouncedSearchQuery('');
		setIsSearching(false);
	}


    return <SearchContext.Provider
		value={
			debouncedSearchQuery
				? debouncedSearchQuery.toLocaleLowerCase()
				: null
		}
	>

		<div
			onKeyDown={(e) => {
				if (e.key === "Enter" && document.activeElement !== searchRef.current) {
					pullQuestions();
				}
			}}
			tabIndex={0}
			className={"main-container"}
			>

			{isSearching && (
				<div className={c('search-wrapper')}>
					<input
						ref={searchRef}
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery((e.target as HTMLInputElement).value);
							setSearchMatches([])
						}}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								setSearchQuery('');
								setDebouncedSearchQuery('');
								setCurrentMatchIndex(0);
								(e.target as HTMLInputElement).blur();
								setIsSearching(false);
							}
						}}
						type="text"
						className={c('filter-input')}
						placeholder={'Search...'}
					/>
					<a
						className={`${c('search-cancel-button')} clickable-icon`}
						onClick={() => {
							if(currentMatchIndex > 0) {
								setCurrentMatchIndex(currentMatchIndex-1)
								scrollMatchIntoView(currentMatchIndex-1)
							} else {
								scrollMatchIntoView(currentMatchIndex)
							}
						}}
						aria-label={'Next Match'}
					>
						<Icon name="lucide-chevron-up" />
					</a>

					<p>{currentMatchIndex+1} of {searchMatches.length}</p>

					<a
						className={`${c('search-cancel-button')} clickable-icon`}
						onClick={() => {
							if(currentMatchIndex < searchMatches.length-1) {
								setCurrentMatchIndex(currentMatchIndex+1)
								scrollMatchIntoView(currentMatchIndex+1)
							} else {
								scrollMatchIntoView(currentMatchIndex)
							}
						}}
						aria-label={'Previous Match'}
					>
						<Icon name="lucide-chevron-down" />
					</a>
					<a
						className={`${c('search-cancel-button')} clickable-icon`}
						onClick={() => {
							closeSearchBar();
						}}
						aria-label={'Cancel'}
					>
						<Icon name="lucide-x" />
					</a>
				</div>
			)}

			<h1 id={"title-text"} ref={titleRef}>{file.basename} QB Reader Import</h1>

			<div className={"qb-input-container"}>

				<input
					ref={mainQueryRef}
					className={"qb-query"}
					spellCheck={false}
					type={"text"}
					placeholder={"Search Query"}
					value={questionQuery}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setQuestionQuery(event.target.value)
					}}
				/>

				<div className={"qb-input-row"}>
					<p>Max questions</p>
					<input
						className={"num-questions"}
						spellCheck={false}
						type={"text"}
						value={numberToLoad}
						onChange={(event) => {

							let numberVal = parseInt(event.target.value)
							if(numberVal) {
								if(numberVal > 10000) numberVal = 10000

								setNumberToLoad(numberVal)
							} else if(event.target.value === "") {
								setNumberToLoad(0)
							}

						}}
					/>
					<select
						className={"dropdown"}
						onChange={(e) => setSearchType(e.target.value)}
						value={searchType}
					>
						<option value={"all"}>All Text</option>
						<option value={"question"}>Question</option>
						<option value={"answer"}>Answer</option>
					</select>

					<div className={"difficulty-container"}>

						<button
							className={`toggle-button ${diffDropdownActive ? "mod-cta" : ""}`}
							onClick={() => updateDiffSelector(!diffDropdownActive)}
						>
							Difficulties
						</button>

						<div className={"difficulty-dropdown " + (!diffDropdownActive ? "diff-drop-inactive" : "")} >
							{
								difficulties.map(e => {
									const active = activeDifficulties.includes(e.level);
									return <div
										className={"difficulty-selector " + (active ? "diff-item-active" : "") }
										onClick={() => handleDiffChange(!active, e)}
										key={e.name}
									>
											<input
												type={"checkbox"}
												checked={active}
												readOnly={true}
											/>
										<p className={"difficulty-text"}>{e.level}: {e.name}</p>
									</div>
								})
							}
						</div>
						<button
							onClick={() => updateCatSelect(!catSelectActive)}
							className={"toggle-button " + (catSelectActive ? " mod-cta " : " ")}
						>
							Categories
						</button>

						<button className={"mod-cta"} onClick={pullQuestions}>Search</button>

					</div>
				</div>

				<SubjectSelector settings={props.settings} active={catSelectActive} upliftActiveCategories={setActiveCategories} upliftActiveSubcats={setActiveSubcats}/>

				<div className={"loading-container"}>
					<ClipLoader color={"var(--interactive-accent)"} size={75} loading={loading}/>
				</div>

			</div>
			<div>
				{
					questions.map(e => <TossupDisplay
						key={e.question}
						tossup={e}
						file={file}
						searchQuery={debouncedSearchQuery}
						addToSearchResults={() => addSearchMatch(e)}
						removeFromSearchResults={() => removeSearchMatch(e)}
						matchID={searchMatches.indexOf(e)}
						displayNumberOfCardsInDoc={props.settings.numberOfCardsInDocument}
					/>)
				}
			</div>

		</div>

		<button
			className={`top-scroll-button ${isTitleVisible ? "scroll-button-inactive" : ""}`}
			onClick={() => {
				closeSearchBar()
				mainQueryRef.current?.focus();
			}}
		>
			<h1>Scroll To Top</h1>
		</button>

	</SearchContext.Provider>
}



