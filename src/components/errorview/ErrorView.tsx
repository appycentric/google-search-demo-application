import React, { FC, useRef, useState } from 'react';
import { clog } from '../../constants';
import { ErrorProps } from '../../interfaces/ErrorProps';
import { emptyInitResults } from '../../interfaces/InitResults';
import { emptySysResults, SysResults } from '../../interfaces/SysResults';
import { renewParams } from '../../util/appycentricFunctions';
import styles from './ErrorView.module.scss';


const ErrorView: FC<ErrorProps> = (inputProps: ErrorProps) => {
  const bRef = useRef<HTMLButtonElement>(null);
  const [processing, setProcessing] = useState({
    running: false,
    message: ''
  });

  const[props, setProps] = useState(inputProps);

  let initPar: string[] = [];
  let initRsp: string[] = [];
  let sysRsp: string[] = [];


  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    
    if(null!== bRef.current) 
      bRef.current.blur();
    
    e.preventDefault();
    
    let msg = 'Renewing application parameters ...';
    setProcessing({ running: true, message: msg });

    try {
      let x: SysResults = await renewParams(props);
      msg = `Parameters renewed at ${x.renewedAt}.`;
      let newProps: ErrorProps = JSON.parse(JSON.stringify(props));
      newProps.sysResponse = x;
      // the setParams setter function reference does not get returned from API, but remains the same
      newProps.setParams = props.setParams; 
      setProps(newProps);
    } catch(error) {
      msg = `Could not refresh parameters: ${error}.`;
    } finally {
      setProcessing({ running: false, message: msg});
    }
  };


  clog('Initialization parameters provided to the application:');
  Object.keys(props.queryParams).forEach(key => {
    clog("  ",  key + ': ' + props.queryParams[key as keyof object]);
    initPar.push(`${(key).padEnd(20,'.')}:  ${props.queryParams[key as keyof object]}`);
  });

  clog('Sys API call #1 (to get the system api key) response:');
  Object.keys(props.initResponse).forEach(key => {
    clog("  ",  key + ': ' + props.initResponse[key as keyof object]);
    initRsp.push(`${(key).padEnd(20,'.')}:  ${props.initResponse[key as keyof object]}`);
  });

  clog('Sys API call #2 (to get up to date parameters) response:');
  Object.keys(props.sysResponse).forEach(key => {
    clog("  ",  key + ': ' + props.sysResponse[key as keyof object]);
    
    try {
      let val = key !== 'APIs' ?  
          props.sysResponse[key as keyof object] :
          JSON.stringify(props.sysResponse[key as keyof object]);

      sysRsp.push(`${(key).padEnd(20,'.')}:  ${val}`);
    } catch(error) {
      sysRsp.push(`${(key).padEnd(20,'.')}:  Error [${error}] parsing data: [${props.sysResponse[key as keyof object]}]`);
    }

  });

  
  let initParItems = initPar.map((x) => <li key={x}>{x}</li>);
  let initRspItems = initRsp.map((x) => <li key={x}>{x}</li>);
  let sysRspItems  = sysRsp.map((x) => <li key={x}>{x}</li>);

  return (
  <div className={props.isError ? styles.ErrorView: styles.InfoView}>
    {  (props.isError && !props.params.error) && 
       (props.initResponse.status===emptyInitResults.status && props.sysResponse.status===emptySysResults.status) && 
       <div><h3>Parameters error</h3><h4>Required parameters missing</h4></div>
    }

    {(props.isError && !props.params.error) && (props.initResponse.status>=400) && <div><h3>Initialization error</h3><h4>{props.initResponse.message}</h4></div>}
    {(props.isError && !props.params.error) && (props.sysResponse.status>=400) && <div><h3>System API call error</h3><h4>{props.sysResponse.message}</h4></div>}
    {props.isError && props.params.error && props.initResponse.status>0 && props.sysResponse.status>0 && <div><h3>Search error</h3><h5>{props.params.error}</h5></div>}
    {props.isError && props.params.error && (props.initResponse.status===0 || props.sysResponse.status===0)  && <div><h3>Request error</h3><h5>{props.params.error}</h5></div>}

    {props.isError || <h4>Info and parameters available to the application</h4>}
    This is a demo of an <b>APPY</b><em>CENTRIC</em> <em>external application</em>. Below you can see the expected and received URL parameters, parameters returned by the system API call.
    For more information, refer to the links below or the <b>APPY</b><em>CENTRIC</em> documentation.
    <br/><br/>
    {props.sysResponse.usingSavedParameters ? 
      <div><h5>Using parameters saved in prior sessions:</h5><ol>{sysRspItems}</ol></div>
     :
      <div><h5>Initial parameters provided to the application:</h5><ol>{initParItems}</ol>
           <h5>System API call #1, using <em>initialApiKey</em> to get <em>sysApiKey</em>{props.initResponse.status>0 ? ' called and responded with:' : ': not called.'}</h5>{props.initResponse.status>0 && <ol>{initRspItems}</ol>}
           <h5>System API call #2, using <em>sysApiKey</em> to list available <em>API</em>s{props.sysResponse.status>0 ? ' called and responded with:' : ': not called.'}</h5>{props.sysResponse.status>0 && <ol>{sysRspItems}</ol>}
      </div>
    }
    <h4>&nbsp;</h4>
    <div className={styles.foot + " align-middle"}>
      <button ref={bRef} 
              className="btn btn-primary btn-small" 
              type="submit" disabled={processing.running}
              onClick={handleClick}>Renew parameters</button>
      <h5>&nbsp;{processing.message}</h5>
    </div>
  </div>
  );
}

export default ErrorView;
