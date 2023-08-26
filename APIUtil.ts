let apiHost = "https://qbreader.org/api/";


type parameter = {
    key: string,
    val: string
}
export async function Pull(endpoint:string, parameters:parameter[],  callback:(e:any) => void):Promise<void> {    

    try {
        

        await fetch(apiHost + endpoint + parameters.reduce((acc, e) => `${acc}${e.key}=${e.val}&`, "/?"))
            .then(response => { 
                console.log(response)
                return response.json()
            })
            .then(callback)
            .catch(() => {})
    }catch (e) {
        console.log(e)
    }
}

export async function test() {
    let result = await fetch("https://qbreader.org/api/query/?queryString=plasma&searchType=question&")

    console.log(result)
}
