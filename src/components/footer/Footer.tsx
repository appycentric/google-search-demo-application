import React, { FC } from 'react';
import styles from './Footer.module.scss';
import { buildInfo } from '../../buildInfo';
import { FooterProps } from '../../interfaces/FooterProps';

const Footer: FC<FooterProps> = (props) => { 

  const handleClick = (event: any) => {
      event.preventDefault();
      if(!props.isError)
        props.setShowQuery(!props.showQuery);
  }

  return (
    <div className={styles.Footer + " bg-light"}>
            <div className="container mt-1">
                <div className="row">
                    <div className="col-lg-6 text-center text-lg-start my-auto h-100">
                        <ul className="list-inline mb-2">
                            <li className="list-inline-item"><span>⋅</span></li>
                            <li className="list-inline-item" onClick={e => handleClick(e)}>
                               {props.showQuery && <a href="#1" className={props.isError ? styles.noUnderline : ""}>
                                <span className={props.isError ? styles.disabled : ""}>
                                  Hide parameters provided to the application
                                </span></a>}
                               {props.showQuery || <a href="#2" className={props.isError ? styles.noUnderline : ""}>
                                <span className={props.isError ? styles.disabled : ""}>
                                  Show parameters provided to the application
                                </span></a>}
                            </li>
                            <li className="list-inline-item"><span>⋅</span></li>
                        </ul>
                    </div>
                    <div className="col-lg-6 text-center text-lg-end my-auto h-100 mt-lg-2">
                        <div className="text-muted small mb-lg-1 text-right">
                            Standalone application demo v{buildInfo.buildVersion} (c) <strong>APPY</strong>CENTRIC 
                            <img src="img/appycentric-logo-gs.png" className={styles.Logo} alt="logo"/>
                            2022.
                        </div>
                    </div>
                </div>
            </div>
    </div>
  );
}
export default Footer;
