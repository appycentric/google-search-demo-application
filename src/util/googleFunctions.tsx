import axios from 'axios';
import { clog, GOOGLE_API_SETTINGS, ROWS_PER_PAGE } from '../constants';
import { HeaderProps } from '../interfaces/HeaderProps';
import { StoredGoogleSearchAPIParams } from '../interfaces/StoredGoogleSearchAPIParams';
import { removeDebugData } from './appycentricFunctions';

/**
 * 
 * @param props all parameters required for the search and return of results are here.
 * @returns search results
 * 
 * --- Understanding API response: For 'test' users and 'test' APIs your
 * expected business server response will be enriched with debug data. Please
 * see the Appycentric documentation for details The following code simply 
 * removes debug data (if any), and returns plain responses from your API.
 */
 export const search = async (props: HeaderProps, start?: number, num?: number) =>  {
    try {
        props.setShowError(false);
        clog(`start: ${start}, num: ${num}, search phrase: ${props.params.searchPhrase}.`);
        
        let googleAPISettings: StoredGoogleSearchAPIParams = JSON.parse(localStorage.getItem(GOOGLE_API_SETTINGS) || "{}");

        let config = {
            headers: getRequestHeaderWithAuthData(props.params.selectedAPI, googleAPISettings)
        }
        
        // The target business service you are selling to your users, for the
        // purpose of this demo, is Google search. Parameters:
        // query - search query
        // start - index of the first result to return
        // num - number of results to return
        // props.params.url is the url of the Appycentric API server

        let url = `${googleAPISettings.apiUrl}?query=${props.params.searchPhrase}&start=${start || props.params.start}&num=${num || props.params.num}`;

        clog("Search request URL: ", url);
        clog("Search request headers: ", JSON.stringify(config.headers));
        
        props.setShowQuery(false);

        let response = await axios.get(url, config);
        
        let apiResponse = response.data; // if we are not a test user using a test app, the response is JSON
        
        if(apiResponse?.error) // did a business server (in this case Google API) return an error?
            throw new Error(JSON.stringify(apiResponse.error)); // tell it to the user


        apiResponse = removeDebugData(response.data);
        
        if(start && num && (start !== props.params.start || num !== props.params.num)) { // update params
            let newParams = props.params;
            newParams.start = start;
            newParams.num = num;
            props.setParams(newParams);
        }

        props.setSearchResults(apiResponse);

        return apiResponse;
    } catch(anyError: any) {
        let msg1 = anyError?.response?.data?.error;
        let msg2 = anyError?.response?.statusText;
        if(msg2 !== undefined) {
            msg2 = await decodeURIComponent(msg2); 
            clog('URL decoded:', msg2);
        }

        let newParams = { 
            ...props.params,
        }

        newParams.error =  `${msg1 || msg2 || anyError}`;

        props.setParams(newParams);
        props.setShowError(true);
        clog(newParams.error);
        return {};
    }
}

/**
 * Search next page
 */
export const nextPage = (props: HeaderProps) => {
    let newParams = props.params;
    newParams.start = Math.min(newParams.start + ROWS_PER_PAGE, props.searchResults?.searchInformation?.totalResults);
    newParams.num = Math.min(ROWS_PER_PAGE, props.searchResults?.searchInformation?.totalResults-newParams.start);
    props.setParams(newParams);
    search(props);
}

/**
 * Search previous page
 */
export const prevPage = (props: HeaderProps) => {
    let newParams = props.params;
    newParams.num = ROWS_PER_PAGE;
    newParams.start = Math.max(newParams.start - ROWS_PER_PAGE, 1);
    props.setParams(newParams);
    search(props);
}


/**
 * 
 * @returns header with populated Appycentric auth data
 * 
 * API auth data has been saved in local storage. This data remains valid
 * accross application usage sessions. API auth data becomes invalid
 * only if the plan/subscription expires or API keys are rest.
 * 
 * There are several ways of authentication to Appycentric APIs: <br/>
 * - sending auth data in a request header<br/>
 * - sending auth data in URL parameters<br/>
 * - sending auth data in body (for certain http methods)<br/>
 * - by IP address, without auth data<br/>
 * <br/>
 * Please see the docs for details. In this example we will communicate
 * auth data in the request header.<br/>
 * <br/>
 * 
 */
 const getRequestHeaderWithAuthData = (apiName: string, googleAPISettings: StoredGoogleSearchAPIParams) => {
    
    //let lang = props.queryParams.lang.length>2 ? 'en': props.queryParams.lang;

    // - set your API key
    // - set your user in, which is your email address
    // - pass any request headers to your destination API
    // - set preferred language, 2-char ISO 639-1 code, e.g. "en"

    let apikey;
    googleAPISettings.APIs.forEach(api => {
        if(api.name === apiName) 
            apikey = api.key
    });

    if(!apikey)
       throw new Error("Saved API parameters seem to be damaged. Please log in to tohe application from your user profile.");

    return {
        'x-appycentricApiKey': apikey,
        'x-appycentricUser': googleAPISettings.userEmail,
        'x-appycentricBsHeader': '{}', 
        'x-appycentricLang': 'en',
        'x-appycentricDebugApi': 'no'
    };

}