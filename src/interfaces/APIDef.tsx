/**
 * Product API definition: each product has one or more APIs
 */
 export interface APIDef {
    name: string;             // name of the API
    type: "html" | "alrj";    // type of the API
    key: string;              // API key
    allKeys: Array<string>;   // all API keys
}
