export type Category = {
	name:string,
	color: string,
	subcats:string[]
}

export const categories:Category[] = [
	{name: "Literature", color: "blue", subcats: [
			"American Literature", "British Literature", "Classical Literature", "European Literature", "World Literature"
		]},
	{name: "History", color: "green", subcats: [
			"American History", "Ancient History", "European History", "World History", "Other History"
		]},
	{name: "Science", color: "red", subcats: [
			"Biology", "Chemistry", "Physics", "Math", "Other Science"
		]},
	{name: "Fine Arts", color: "chocolate", subcats: [
			"Visual Fine Arts", "Auditory Fine Arts", "Other Fine Arts"
		]},
	{name: "Religion", color: "secondary", subcats: []},
	{name: "Mythology", color: "secondary", subcats: []},
	{name: "Philosophy", color: "secondary", subcats: []},
	{name: "Social Science", color: "secondary", subcats: []},
	{name: "Current Events", color: "secondary", subcats: []},
	{name: "Geography", color: "secondary", subcats: []},
	{name: "Other Academic", color: "secondary", subcats: []},
	{name: "Trash", color: "secondary", subcats: []},
]
