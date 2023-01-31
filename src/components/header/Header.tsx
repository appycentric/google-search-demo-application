import React, { useRef, useState, FC } from 'react';
import styles from './Header.module.scss';
import { HeaderProps } from '../../interfaces/HeaderProps';
import { clog, ROWS_PER_PAGE } from '../../constants';
import { search } from '../../util/googleFunctions';


const Header: FC<HeaderProps> = (props) => {
  const bRef = useRef<HTMLButtonElement>(null);
  const [newSearchPhrase, setNewSearchPhrase] = useState('');
  const [oldSearchPhrase, setOldSearchPhrase] = useState('');
  const [oldAPI, setOldAPI] = useState('');
  const [newAPI, setNewAPI] = useState('');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if(null!== bRef.current) 
      bRef.current.blur();
    
    e.preventDefault();

    if(oldSearchPhrase === newSearchPhrase && oldAPI === newAPI && props.params.start === 1)
      return;

    if(newSearchPhrase.length===0)
      return;

    if(resetSearchPhrase())
      search(props, 1, ROWS_PER_PAGE);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
        e.preventDefault();

        if(oldSearchPhrase === newSearchPhrase && oldAPI === newAPI && props.params.start === 1)
            return;
        
        if(newSearchPhrase.length===0)
            return;

        if(resetSearchPhrase())
          search(props, 1, ROWS_PER_PAGE);
    }
  };


  const handleChange= (e: React.ChangeEvent<HTMLInputElement>) => {    
    setNewSearchPhrase(e.target.value);
    //clog("New search phrase: " +  e.target.value);
  }

  const handleChangeAPI= (e: React.ChangeEvent<HTMLSelectElement>) => {
    clog(`${oldAPI} ---> ${newAPI}`);
    setNewAPI(e.target.value);
    
    props.setParams({
      ...props.params,
      selectedAPI: e.target.value
    });
    //clog("New search API: " +  e.target.value);
  }

  
  const resetSearchPhrase = () => {
    clog(`${oldSearchPhrase} ---> ${newSearchPhrase}`);
    
    if(oldSearchPhrase?.trim() === newSearchPhrase?.trim() && oldAPI === newAPI && props.params.start === 1)
      return false;
    

    let newParams = props.params;
    setOldSearchPhrase(newSearchPhrase);
    setOldAPI(newAPI !=='' ? newAPI : newParams.selectedAPI);
    newParams.selectedAPI = newAPI !=='' ? newAPI : newParams.selectedAPI;
    newParams.searchPhrase = newSearchPhrase;
    newParams.error = '';
    props.setParams(newParams);

    return newSearchPhrase!=='';
  }

  return  (
  <div className={styles.Header + " text-center masthead"}>
      <div className="overlay"></div>
      <div className="container">
          <div className="row">
              <div className="col-xl-9 mx-auto position-relative">
                  <h2 className="mb-5">Google Search Demo</h2>
              </div>
                  <form className="row col-md-11 col-lg-10 col-xl-9 mx-auto position-relative">
                          <div className="col-12 col-md-10 mb-2 d-inline-flex">
                              <label className="col-3 col-md-3 text-nowrap text-left form-control-lg">Select API:</label>
                              <select className="form-select form-select-lg" value={props.params.selectedAPI} placeholder="Select search API" onChange={e => handleChangeAPI(e)}>
                              { props.params.APINames.map((apiName, index) => {
                                    return <option key={index} value={apiName}>{apiName}</option>
                              })}
                              </select>
                          </div>
                          <div className="col-12 col-md-10 mb-2 d-inline-flex">
                              <label className="col-3 col-md-3 text-nowrap text-left form-control-lg">Search phrase:</label>
                              <input className="form-control form-control-lg" type="text" placeholder="Enter your serach phrase"
                              value={newSearchPhrase} onChange={e => handleChange(e)} onKeyPress={e=> handleKeyPress(e)}></input>
                          </div>
                          <div className="col-12 col-md-2">
                              <button ref={bRef} className="btn btn-primary btn-lg" type="submit" 
                              onClick={handleClick} disabled={ props.params?.start===1 &&
                                (((newSearchPhrase?.trim() === oldSearchPhrase?.trim() && oldSearchPhrase?.trim()!=='') || 
                                newSearchPhrase?.trim()==='')) &&
                                (((newAPI === oldAPI && oldAPI!=='') || 
                                newAPI===''))
                                }>&nbsp;Search</button>
                          </div>
                  </form>
          </div>
      </div>
  </div>
  )
};

export default Header;