const apiKey: string = process.env.GOOGLE_API_KEY || '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

export async function generateFilterFromQuery(query: string): Promise<any> {
    try {
        console.log("AI Search triggered");
        
        const requestBody = {
            contents: [{
                parts: [{ 
                    text: "SYSTEM: You are a MongoDB filter generator for a soccer jersey store. Map user queries to JSON filters for Post.find(). Fields: jerseyDetails.team, jerseyDetails.league, jerseyDetails.size, jerseyDetails.price. For sizes, convert to single letters: S, M, L, XL, XXL. If the user says 'Medium', convert it to 'M'. If they say 'Large', convert it to 'L'. Return ONLY the JSON object. USER QUERY: " + query
                }]
            }]
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`HTTP error! status: ${response.status}`, errorBody);
            throw new Error(`Gemini API error: ${response.status} - ${errorBody}`);
        }

        const data = (await response.json()) as any;

        // Extract the text from the response
        const responseText = data.candidates[0].content.parts[0].text;
        const filter = JSON.parse(responseText);
        
        console.log("Final Filter object:", filter);

        return filter;
    } catch (error: any) {
        console.error("Error from Gemini API:", error.message);
        throw error;
    }
}
