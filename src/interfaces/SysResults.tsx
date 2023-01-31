import { APIDef } from './APIDef';
import { NA } from '../constants';

export interface SysResults {
    userEmail: string;              // this user's email - a credential for using APIs
    userName: string;               // optional info
    planId: string;                 // this plan or subscription Id
    appId: string;                  // this application Id
    sysAPIUrl: string;              // system API URL
    sysAPIKey: string;              // system API key
    userCompany: string;            // user's company name
    userCId: string;                // user's company ID - an abbreviation or number
    planName: string;               // the name of the plan/subscription/digital product, e.g. "Google Web Search"
    planStartTime: string;          // plan activity start
    planEndTime: string;            // plan activity end. If exhausted prematurely, automatic renewal may occur before planEndTime.
    status: Number;                 // status code of the call to system API: 200-299 = Ok, 400+ = error, 0 = uninitialized
    message: string;                // additional message or explanation of the status code
    validationInfo: string;         // data validation info or additional message
    lang: string;                   // user's preference of the language 
    apiUrl: string;                 // plan APIs URL
    APIs: Array<APIDef>;            // plan APIs. @see APIDef
    usingSavedParameters: boolean;  // this flag indicates if the sys api has been called or saved data reused
    renewedAt: string;               // time when parameters were saved 
}

export const emptySysResults: SysResults = {
    userEmail: NA,
    userName: NA,
    planId: NA,
    appId: NA,
    sysAPIUrl: NA,
    sysAPIKey: NA,
    userCompany: NA,
    userCId: NA,
    planName: NA,
    planStartTime: NA,
    planEndTime: NA,
    status: 0,
    message: NA,
    validationInfo: NA,
    lang: NA,
    apiUrl: NA,
    APIs: [],
    usingSavedParameters: false,
    renewedAt: NA
}
