export interface StoredAPIs {
    name: string;
    key: string;
}


export interface StoredGoogleSearchAPIParams {
    userEmail: string;
    APIs:      Array<StoredAPIs>;
    apiUrl:    string;
}