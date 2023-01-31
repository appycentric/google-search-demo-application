import React, { useState, useEffect } from 'react';
import './App.scss';

import Header from './components/header/Header';
import Results from './components/results/Results';
import Footer from './components/footer/Footer';
import ErrorView from './components/errorview/ErrorView';

import { getSystemApiCredentials, getPlanAPIs } from './util/appycentricFunctions';
import { emptyInitResults } from './interfaces/InitResults';
import { SysResults, emptySysResults } from './interfaces/SysResults';
import { StoredGoogleSearchAPIParams } from './interfaces/StoredGoogleSearchAPIParams';
import { InitialSysAPIParams } from './interfaces/SysAPIParams';

import { clog, NA, GOOGLE_API_SETTINGS, COMPLETE_APP_SETTINGS } from './constants';


function App() {
  //const undef = 'Optional parameter missing [Ok]';
  const undefError = 'Required parameter missing [Error]';
  const [query] = useState(new URLSearchParams(window.location.search));
  const [queryParams, setQueryParams] = useState({
    userEmail:      query.get('userEmail') || undefError,
    planId:         query.get('planId') || undefError,
    appId:          query.get('appId') || undefError,
    initialAPIKey:  query.get('initialApiKey') || undefError,
    sysAPIUrl:      query.get('sysApiUrl') || undefError
  });
  
  const [searchResults, setSearchResults] = useState({});
  let emptyStringArray: Array<string> = [];
  const [params, setParams] = useState({
    key: '',
    error: '',
    selectedAPI: '',
    APINames: emptyStringArray,
    searchPhrase: '',
    start: 0,
    num: 0,
  });
  const [showError, setShowError] = useState(true);
  const [showQuery, setShowQuery] = useState(false);
  const [initResponse, setInitResults] = useState({ ...emptyInitResults });
  const [sysResponse, setSysResults] = useState({ ...emptySysResults });

  useEffect(() => {
    
    let newParams = params;

    try {
      
      let paramsMissing = 
          queryParams.sysAPIUrl === undefError || 
          queryParams.appId === undefError ||
          queryParams.initialAPIKey === undefError ||
          queryParams.planId === undefError ||
          queryParams.userEmail === undefError;

      if(!paramsMissing) {
          // initialization parameters are provided, therefore:
          initializeAppFromProvidedParams(queryParams) 
          .catch(err => {
            clog("Unexpected error: ", err);
            newParams.error = err;
            setParams(newParams);
            setShowError(true);
          });
          return;
      }
       
      // init parameters are not provided. Check if there are saved
      // parameters from prior sessions.
      let storedParams: StoredGoogleSearchAPIParams = JSON.parse(localStorage.getItem(GOOGLE_API_SETTINGS) || "{}");
      paramsMissing = 
        storedParams.APIs === undefined ||
        storedParams.APIs === [] ||
        storedParams.apiUrl === undefined ||
        storedParams.userEmail === undefined;
      
      if(paramsMissing) {
          newParams.error = "Neither initial nor saved access credentials and parameters are found. Please start the application from your AppyCentric user menu to have the params renewed.";
          clog(`Setting params.error to [${newParams.error}]`);
          setShowError(true);
          setParams(newParams);
      } else {
          // initialization parameters are not there, but there are
          // sufficient parameters saved from prior sessions.

          // populate parameter explanations:

          let storedOptionalParams: SysResults = JSON.parse(localStorage.getItem(COMPLETE_APP_SETTINGS) || "{}");
          
          let notNeeded = 'Not used.'
          setQueryParams({
            userEmail:      notNeeded,
            planId:         notNeeded,
            appId:          notNeeded,
            initialAPIKey:  notNeeded,
            sysAPIUrl:      notNeeded
          });

          setInitResults({ 
            appId: notNeeded,
            message: 'This API is not called. Saved parameters are used.',
            planId: notNeeded,
            status: 0,
            sysAPIKey: notNeeded,
            sysAPIUrl: notNeeded,
            userEmail: notNeeded
          });

          setSysResults({
            ...storedOptionalParams,
            message: 'These parameters were saved in prior sessions. Saved message:' + storedOptionalParams.message,
            usingSavedParameters: true  
          });
        
          newParams.error = 'Parameters reused from prior sessions.';
          let first = true;
          storedParams.APIs.forEach(storedAPI => {
            newParams.APINames.push(storedAPI.name);
            if(first) {
              newParams.selectedAPI = storedAPI.name;
              first = false;
            }
          });
          setShowError(false);
          setParams(newParams);
        }

    } catch( parseError ) {
        newParams.error = `Bad or missing initialization parameters: ${parseError}`;
        setShowError(true);
        setParams(newParams);
    } finally {
      // remove URL parameters, they are a bit unsightly :)
      let i = window.location?.href.indexOf('?');
      if((typeof i === 'number') && i>0)
          window.history.replaceState('', '', window.location.href.substring(0,i));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  /**
   * 
   * @param params initial parameters sent to the application when it is run
   * from the AppyCentric platform.
   * 
   * Each AppyCentric front-end application corresponds to an online product,
   * called a plan or subscription. Each product publishes a set of APIs which
   * are made available for front-end application(s) to use.
   * 
   * This function retrieves the user's credentials and API data related to the
   * current Plan for which this application is called.
   * 
   * <em>The initial process is 3-fold:</em>
   * 1. Initially the app is given a temporary one-time initialApiKey, which
   * the application uses immediately to call the system API and retrieve the
   * permanent systemApiKey.
   * @see getSystemApiCredentials()
   * 
   * 
   * 2. System API is called to retrieve the Plan APIs. This represents a set
   * of all APIs which belong to the current Plan or subscription. This data
   * is saved in the devices local storage, so that it can be used in
   * future sessions.
   * @see getPlanAPIs()
   * 
   * 3. The user uses the product via the front-end app, which calls Plan 
   * APIs as needed.
   * 
   * <em>Any subsequent session:</em>
   * 1. The application attempts to reuse the API data saved in prior
   * sessions. If the plan has expired, or has been renewed with another
   * subscription, then the application can use the system api call 
   * to renew the API data @see getPlanAPIs() or instruct the user
   * to run the application from the AppyCentric platform.
   * 
   * When applications are run from the application platform, they are
   * supposed to ignore any saved data and reinitialize from scratch.
   * 
   * 2. The user uses the product via the front-end app, which calls Plan 
   * APIs as needed.
   *   
   */
  const initializeAppFromProvidedParams = async (queryParams: InitialSysAPIParams) => {

    let initRes = await getSystemApiCredentials(queryParams);
    setInitResults(initRes);
    
    if(initRes.status <300 && initRes.status>=200) {
        params.error = NA;
        setParams(params);
        clog(`App initialization step Ok. Status: ${initRes.status}, Message: ${initRes.message}. Proceeding to system API call.`);

        let sysRes = await getPlanAPIs(params, setParams, initRes );
        
        if(sysRes.status <300 && sysRes.status>=200) {
            params.error = NA;
            setSysResults(sysRes);
            clog(`Sys API call Ok. Status: ${sysRes.status}, Message: ${sysRes.message}`);
            setShowError(false);
        } else {
          clog(`App initialization error. Status: ${sysRes.status}, Message: ${sysRes.message}`);
          params.error = sysRes.message;
          setParams({...params});
          setShowError(true);
        }
      } else {
        clog(`App initialization error. Status: ${initRes.status}, Message: ${initRes.message}`);
        params.error = initRes.message;
        setParams({...params});
        setShowError(true);
      }
  }

  return (
    <div className="App">
      <Header 
        params={params} 
        queryParams={queryParams}
        setParams={setParams}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        setShowError={setShowError}
        setShowQuery={setShowQuery}
      />
      {showError || showQuery ? 
        <ErrorView 
          isError={showError}
          initResponse={initResponse}
          sysResponse={sysResponse}
          params={params} 
          setParams={setParams}
          query={query}
          queryParams={queryParams}
          searchResults={searchResults}
        />
      :
        <Results  
          params={params}
          queryParams={queryParams}
          setParams={setParams}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          setShowError={setShowError}
          setShowQuery={setShowQuery}
        />
      }
      <Footer
          setShowQuery={setShowQuery}
          showQuery={showQuery}
          isError={showError}
      />
    </div>
  );
}

export default App;
