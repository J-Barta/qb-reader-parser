import * as React from "react";

import "../../styles.css"
import {useEffect} from "react";
import {categories, Category} from "../Categories";
import {QBReaderSettings} from "../../main";
import {SubjectButton} from "./ui/SubjectButton";

export function SubjectSelector(props: {
	settings:QBReaderSettings,
	upliftActiveCategories:(val:string[]) => void,
	upliftActiveSubcats:(val:string[]) => void
}) {

	const [activeCategories, setActiveCategories] =
		React.useState(() => props.settings.activeCats);

	const [availableSubcats, setAvailableSubcats] = React.useState<Category[]>([])


	React.useEffect(() => {

		const nowAvailableSubcats:Category[] = categories
			.filter(e => activeCategories.includes(e.name))
			.reduce(
				(acc:Category[], e) => {
					acc.push(...e.subcats.map(subcat =>
						{return {name: subcat, color: e.color, subcats: []}})
					)
					return acc
				}, []);

		const nowAvailableSubcatNames:string[] = nowAvailableSubcats.map(e => e.name)

		const currentAvailableSubcatNames = availableSubcats.map(e => e.name)
		//Subcats that weren't available before
		const newAvailableSubcatNames = nowAvailableSubcats.filter(e =>
			!currentAvailableSubcatNames.includes(e.name)).map(e => e.name)

		setAvailableSubcats(nowAvailableSubcats)

		const newActiveSubcats = activeSubcats.filter((e) => nowAvailableSubcatNames.includes(e))
		newActiveSubcats.push(...newAvailableSubcatNames)

		setActiveSubcats(newActiveSubcats)

		props.upliftActiveCategories(activeCategories)

	}, [activeCategories])

	const [activeSubcats, setActiveSubcats] = React.useState<string[]>([])

	useEffect(() => {
		props.upliftActiveSubcats(activeSubcats)
	}, [activeSubcats])

	return (
		<div className={"flex test-class-name"}>

			<div className={"category-flex"}>
				<h2>Categories</h2>

				{
					categories.map(e => {
						const active = activeCategories.includes(e.name)

						return <SubjectButton
							key={e.name}
							text={e.name}
							color={e.color}
							settings={props.settings}
							onClick={() => {

								if(!active) {
									activeCategories.push(e.name)

									setActiveCategories([...activeCategories])
								} else {
									setActiveCategories(activeCategories.filter(ele => ele !== e.name))
								}

							}}
							active={activeCategories.includes(e.name)}/>
					}
					)
				}
			</div>

			<div className={"category-flex"}>
				<h2>Subcategories</h2>

				{
					availableSubcats.map(e => {
						const active = activeSubcats.includes(e.name)

						return <SubjectButton
							key={e.name}
							text={e.name}
							color={e.color}
							settings={props.settings}
							onClick={() => {

								if(!active) {
									activeSubcats.push(e.name)

									setActiveSubcats([...activeSubcats])
								} else {
									setActiveSubcats(activeSubcats.filter(ele => ele !== e.name))
								}

							}}
							active={activeSubcats.includes(e.name)}/>
					})
				}
			</div>

		</div>
	);
}
