import { NA }  from '../constants';

export interface InitResults {
    status: Number;      //  initialization status: 200-299 = Ok, 400+ = error, 0 = uninitialized
    message: string;     //  initialization status explanation 
    planId: string;      //  plan/subscription Id
    appId: string;       //  this front-end application Id
    userEmail: string;   //  this user's email
    sysAPIKey: string;   //  system API key
    sysAPIUrl: string;   //  system API URL
}

export const emptyInitResults: InitResults = {
    status: 0,
    message: NA,
    planId: NA,   
    appId: NA,    
    userEmail: NA,
    sysAPIKey: NA,
    sysAPIUrl: NA 
}