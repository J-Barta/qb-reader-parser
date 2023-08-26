const apiHost = "https://qbreader.org/api/";


type parameter = {
    key: string,
    val: string
}
export async function Pull(endpoint:string, parameters:parameter[],  callback:(e:any) => void):Promise<void> {    

	const input = apiHost + endpoint + parameters.reduce((acc, e) => `${acc}${e.key}=${e.val}&`, "/?")

	try {
        await fetch(input)
            .then(response => {
                return response.json()
            })
            .then(callback)
            .catch(() => {})
    }catch (e) {
    }
}
