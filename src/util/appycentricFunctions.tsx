import axios from 'axios';
import { clog, GOOGLE_API_SETTINGS, GOOGLE_SEARCH_API_NAME_NORMAL, 
         COMPLETE_APP_SETTINGS, NA, GOOGLE_SEARCH_API_NAME_NO_YELLOW, GOOGLE_SEARCH_API_NAME_YELLOW } from '../constants';
import { InitialSysAPIParams } from '../interfaces/SysAPIParams';
import { InitResults, emptyInitResults } from '../interfaces/InitResults';
import { SysResults, emptySysResults } from '../interfaces/SysResults';
import { SysAPIParams } from '../interfaces/SysAPIParams';
import { StoredGoogleSearchAPIParams } from '../interfaces/StoredGoogleSearchAPIParams';
import { HeaderProps } from '../interfaces/HeaderProps';
import { ErrorProps } from '../interfaces/ErrorProps';
import { Params } from '../interfaces/Params';
import { Setter } from '../interfaces/commons';


const DEBUG_DATA_SEPARATOR = '### DEBUG DATA AFTER THIS LINE ###';


/**
 * 
 * @param initParams url parameters sent to the application if it is called
 * from AppyCentric platform.
 * @see InitialSysApiParams
 * 
 * @returns initialization response along with 
 * @see InitResult
 */
export const getSystemApiCredentials = async(initParams: InitialSysAPIParams): Promise<InitResults> => {
    try {
        clog(`Prior to initialization via system API:`);
        clog(initParams);
        
        let response = await axios.post(initParams.sysAPIUrl, {
            userEmail: initParams.userEmail,
            planId: initParams.planId,
            appId: initParams.appId,
            initialApiKey: initParams.initialAPIKey
        });

        let res = response.data?.data;
        clog("Sys Api response", res);

        if(!res || !res.status)
            return { 
                ...emptyInitResults,
                status: 403, 
                message: `Response not valid. Please try later. Reponse: [${response.data?.data}]. Http response status: ${response.status}.`
            };

        return {
            status:    res.status,
            message:   res.message || NA,
            userEmail: res.userEmail || NA,
            appId:     res.appId || NA,
            planId:    res.planId || NA,
            sysAPIKey: res.sysApiKey || NA,
            sysAPIUrl: res.sysApiUrl || NA
        };
    } catch(error: any) {
        return {
            ...emptyInitResults,
            status: error.response.status,
            message: error.response?.data?.error || error.toString()
        };
    }
}

/**
 * Renews API parameters, recalling the system API.
 */
export const renewParams = async(props: ErrorProps): Promise<SysResults> => {
    try {
    
        let storedParams: SysResults = JSON.parse(localStorage.getItem(COMPLETE_APP_SETTINGS) || "{}");
        
        let reinitArgs: SysAPIParams = {
            appId: storedParams.appId,
            planId: storedParams.planId,
            sysAPIKey: storedParams.sysAPIKey,
            sysAPIUrl: storedParams.sysAPIUrl,
            userEmail: storedParams.userEmail
        }

        let res: SysResults = await getPlanAPIs(props.params, props.setParams, reinitArgs);
        return res;

    } catch(parseError) {
        return {
            ...emptySysResults,
            status: 403,
            message: "Prior parameters are not valid."
        };        
    }
}


export const getPlanAPIs = async(params: Params, setParams: Setter, query: SysAPIParams): Promise<SysResults> => {
    try {
        clog(`Prior to system API call:`);
        clog(query);
        
        let response = await axios.post(query.sysAPIUrl, {
            userEmail: query.userEmail,
            planId: query.planId,
            appId: query.appId,
            sysApiKey: query.sysAPIKey
        });

        let res = response.data?.data;
        clog("Sys Api response", res);

        if(!res || !res.status)
            return { 
                ...emptySysResults,
                status: 403, 
                message: `Response not valid. Please try later. Reponse: [${response.data?.data}]. Http response status: ${response.status}.`
            };

        
        let sysAPIResponse: SysResults = { 
            status:         res.status || 0,
            message:        res.message || NA,
            validationInfo: res.validationInfo || NA,
            appId:          res.appId || NA,
            planId:         res.planId || NA,
            sysAPIKey:      res.sysApiKey || NA,
            userEmail:      res.userEmail || NA,
            userName:       res.userName || NA,
            sysAPIUrl:      res.sysApiUrl || NA,
            userCompany:    res.userCompany || NA,
            userCId:        res.userCId || NA,
            planName:       res.planName || NA,
            planStartTime:  res.planStartTime || NA,
            planEndTime:    res.planEndTime || NA,
            lang:           res.lang || NA,
            apiUrl:         res.apiUrl || NA,
            APIs:           res.APIs || [],
            usingSavedParameters: false,
            renewedAt:       (new Date(Date.now())).toISOString()
        };

        // we can store this object permanently. It remains valid accross sessions.
        localStorage.setItem(COMPLETE_APP_SETTINGS, JSON.stringify(sysAPIResponse));
        
        // Extract Google search API parameters from sysAPIResponse
        let {status, message} = validateAndStoreAPIParams(params, setParams, sysAPIResponse);
        
        if(status !== 200) { // we will attempt to ignore validation messages
            sysAPIResponse.validationInfo = 'Validation warning (trying to ignore): ' + message;
        }

        return sysAPIResponse;

    } catch(error: any) {
        return {
            ...emptySysResults,
            status: error.response.status,
            message: error.response?.data?.error || error.toString()
        };
    }
}




/** 
 * @parameters input parameters
 * @return { status: status code, 200 = ok
 *           message: explanation
 *         }
 * 
 * This function extracts and validates parameters for Google Search API, and stores it in the localStorage.
 * 
 * To use any API, we need the following:
 *   - ret.userEmail: user email is a part of required credentials
 *   - ret.apiUrl: API url is where requests are sent to
 *  
 *   Each product can have multiple APIs. They are stored in the APIs array. 
 *   Each API has: 
 *   - api_name:  name of the API, by which we identify it in the application. 
 *                api_name is known to the application in advance, because API names are part of product definition.
 *                If multiple APIs are expected in the APIs array, we need api_name to identify them.
 *                We can use API names to validate actually available APIs against what we expect to have.
 *   - api_key:   api key - a required part of credentials
 *   - api_type:  "http" or "ALRJ". This is also known to the app in advance, and can be used for validation.
 *  
 *   For the purpose of Google Search, we expect to have only one API.
 *   Therefore we can extract and error-check the following:
 *   ret.userEmail: required credentials
 *   ret.apiURL: APIs URL of this particular product
 *   ret.APIs - available APIs
 *   ret.APIs[n].api_name - name of the API - known to the application upfront, as this is how the product is defined;
 *   ret.APIs[n].api_key - API key;
 *   ret.APIs[n].api_type - must be "http" in this case, since this is how the product is defined.
 */

const validateAndStoreAPIParams = (params: Params, setParams: Setter, parameters: any) => {

    let toStore: StoredGoogleSearchAPIParams = { 
        APIs: [],
        apiUrl: NA,
        userEmail: NA
    };

    if((parameters.userEmail || '') === '') 
        return {
            status: 500,
            message: "User email received from the system API is not valid."
        }
    toStore.userEmail = parameters.userEmail;

    if((parameters.apiUrl || '') === '') 
        return {
            status: 500,
            message: "API Url received from the system API is not valid."
        }
    toStore.apiUrl = parameters.apiUrl;

    if(parameters.APIs?.length < 1) 
        return {
            status: 500,
            message: "APIs received from the system API do not contain any product APIs."
        }
    

    let apis: Array<{api_name: string; api_key: string; api_type: string}> = parameters.APIs;
    let apiNames: Array<string> = [];

    let foundExpectedAPIs=0;
    let selectedAPI;
    apis.forEach(api => {
        if(api.api_name === GOOGLE_SEARCH_API_NAME_NORMAL ||
           api.api_name === GOOGLE_SEARCH_API_NAME_NO_YELLOW ||
           api.api_name === GOOGLE_SEARCH_API_NAME_YELLOW) {
               if(api.api_type !== "http") 
               return {
                   status: 500,
                   message: `Unexpected API type: The user API type, as received from the system API, is not named as the application expects "http", but "${api.api_type}".`
               }
           
           if((api.api_key || '') === '') 
               return {
                   status: 500,
                   message: "At least one of the google search API keys received from the system API is not valid."
               }

           if(foundExpectedAPIs === 0)
                selectedAPI = api.api_name;

           foundExpectedAPIs++;
               
           toStore.APIs.push({key: api.api_key, name: api.api_name});
           apiNames.push(api.api_name);
              
        } else 
            clog(`Found unknown API "${api.api_name}". The application does not recognize this API and will not use it.`, );
        
    });

    // update parameters with renewed api names:
    setParams({
        ...params,
        APINames: apiNames,
        selectedAPI: selectedAPI
    });

    if(foundExpectedAPIs === 0) {
        return {
            status: 500,
            message: `No recognized APIs found. The application expects at least one of the following APIs: "${GOOGLE_SEARCH_API_NAME_NORMAL}", "${GOOGLE_SEARCH_API_NAME_YELLOW}", "${GOOGLE_SEARCH_API_NAME_NO_YELLOW}".`
        }

    }

    localStorage.setItem(GOOGLE_API_SETTINGS, JSON.stringify(toStore));
    
    return { 
        status: 200,
        message: "Ok"
    };
}


/**
 * @param apiResponse response body from appycentric API server. If there is
 * a header entry in your request:
 * x-appycentricDebugApi: yes
 * then, in addition to your original API response, there will be debug
 * data appended. Function removeDebugData() removes it.
 * @see extractDebugData
 * @returns original response body from your API
 */
export const removeDebugData = (apiResponse: string | object): object => {
    
    if(typeof apiResponse == 'object')
        return apiResponse;
        
    try{ // if we are a test user, it is a string and contains debug data

      
        let i = apiResponse.indexOf(DEBUG_DATA_SEPARATOR);
        if(i>-1) // clog("Separator FOUND - removing debug data and parsing the rest to JSON");
            return JSON.parse(apiResponse.substring(0, i));
            
    } catch(removeDebugDataError) {
        // clog("Could not parse API response / remove debug data: ", removeDebugDataError);
    } 

    // proceed to parsing the whole response to JSON, as there is no debug data present:
    try {
        return JSON.parse(apiResponse);
    } catch(error) {
        throw new Error(`Invalid API response format: "${apiResponse.substring(0, 100)}..."`);
    }
}


/**
 * @param apiResponse response body from appycentric API server. If there is
 * a header entry in your request:
 * x-appycentricDebugApi: yes
 * then, in addition to your original API response, there will be debug
 * data appended. Function extractDebugData() extracts this data
 * from the response and returns a JSON object.
 * @see removeDebugData()
 * @returns original response body from your API
 */

  /* eslint-disable @typescript-eslint/no-unused-vars */
  export const extractDebugData = (apiResponse: string) => {
    
    let i = apiResponse.indexOf(DEBUG_DATA_SEPARATOR);
    if(i>-1)
       return JSON.parse(apiResponse.substring(i+DEBUG_DATA_SEPARATOR.length));
    else
       return {}; // no debug data
}

export const setError = (props: HeaderProps, newError: string) => {
    let newPar = props.params;
    newPar.error = newError;
    props.setParams(newPar);
}