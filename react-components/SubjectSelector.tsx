import * as React from "react";
import {
	alpha,
	createTheme,
	getContrastRatio,
	ThemeProvider,
	ToggleButton,
	ToggleButtonGroup
} from "@mui/material";

import "../styles.css"
import {useEffect} from "react";
import {categories, Category} from "./Categories";
import {QBReaderSettings} from "../main";

// Augment the palette to include a violet color
declare module '@mui/material/styles' {
	interface Palette {
		blue: Palette['primary'];
		green: Palette['primary'];
		red: Palette['primary'];
		orange: Palette['primary'];
	}

	interface PaletteOptions {
		blue?: PaletteOptions['primary'];
		green?: PaletteOptions['primary'];
		red?: PaletteOptions['primary'];
		orange?: PaletteOptions['primary'];
	}
}

// Update the Button's color options to include a violet option
declare module '@mui/material/Button' {
	interface ButtonPropsColorOverrides {
		blue: true;
		green: true;
		red: true;
		orange: true;
	}
}

const blueBase = '#6ea4e5';
const blueMain = alpha(blueBase, 0.7);

const greenBase = '#00be8f';
const greenMain = alpha(greenBase, 0.7);

const redBase = '#e84b41';
const redMain = alpha(redBase, 0.7);

const orangeBase = '#fe7f2e';
const orangeMain = alpha(orangeBase, 0.7);

const theme = createTheme({
	palette: {
		blue: {
			main: blueMain,
			light: alpha(blueBase, 0.5),
			dark: alpha(blueBase, 0.9),
			contrastText: getContrastRatio(blueMain, '#fff') > 4.5 ? '#fff' : '#111',
		},
		green: {
			main: greenMain,
			light: alpha(greenBase, 0.5),
			dark: alpha(greenBase, 0.9),
			contrastText: getContrastRatio(greenMain, '#fff') > 4.5 ? '#fff' : '#111',
		},
		red: {
			main: redMain,
			light: alpha(redBase, 0.5),
			dark: alpha(redBase, 0.9),
			contrastText: getContrastRatio(redMain, '#fff') > 4.5 ? '#fff' : '#111',
		},
		orange: {
			main: orangeMain,
			light: alpha(orangeBase, 0.5),
			dark: alpha(orangeBase, 0.9),
			// contrastText: getContrastRatio(orangeMain, '#000000') > 4.5 ? '#fff' : '#111',
			contrastText: '#fff',
		},
	},
});


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

	const [activeSubcats, setActiveSubcats] =
		React.useState(() => props.settings.activeSubcats)

	const handleFormat = (
		event: React.MouseEvent<HTMLElement>,
		newFormats: string[],
	) => {
		setActiveCategories(newFormats);
	};

	const handleSubcatChange = (
		event: React.MouseEvent<HTMLElement>,
		newFormats: string[]
	) => {
		setActiveSubcats(newFormats)
	}

	useEffect(() => {
		props.upliftActiveSubcats(activeSubcats)
	}, [activeSubcats])

	return (
		<ThemeProvider theme={theme}>
			<div className={"flex test-class-name"}>

				<div>
					<h2>Categories</h2>

					<ToggleButtonGroup
						orientation={"vertical"}
						value={activeCategories}
						onChange={handleFormat}
						aria-label="categories"
					>
						{categories.map(e =>
							// @ts-ignore
							<ToggleButton key={e.name} value={e.name} color={e.color}>{e.name}</ToggleButton>
						)}
					</ToggleButtonGroup>
				</div>

				<div>
					<h2>Subcategories</h2>
					<ToggleButtonGroup
						orientation={"vertical"}
						value={activeSubcats}
						onChange={handleSubcatChange}
						aria-label="subcategories"
					>
						{availableSubcats.map(e =>
							// @ts-ignore
							<ToggleButton key={e.name} value={e.name} color={e.color}>{e.name}</ToggleButton>
						)}
					</ToggleButtonGroup>
				</div>

			</div>
		</ThemeProvider>
	);
}
