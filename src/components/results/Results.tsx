import React, { useRef, FC } from 'react';
import styles from './Results.module.scss';
import { nextPage, prevPage } from '../../util/googleFunctions';
import { HeaderProps } from '../../interfaces/HeaderProps';
import { clog } from '../../constants';

const Results: FC<HeaderProps> = (props) => {
    
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    
    const handlePrevPage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        if(null!== prevRef.current) 
            prevRef.current.blur();
        clog("previousPage: ", e);
        prevPage(props);
    };
    const handleNextPage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        if(null!== nextRef.current) 
            nextRef.current.blur();
        
        clog("nextPage: ", e);
        nextPage(props);
    };
  

    let q = props.searchResults?.queries;
    let items = props.searchResults?.items;
    let totalResults = props.searchResults?.searchInformation?.formattedTotalResults;
    let searchTime = props.searchResults?.searchInformation?.formattedSearchTime;
    let start = items?.length? props.params.start : 0;
    let end = items?.length ? props.params.start + items.length -1: 0;

    return  (  <div className={styles.Results}>
            <div className="w-100">
                <div className="d-inline-flex align-items-center">
                <button className={"btn btn-primary  " + styles.Legendbtn} 
                        type="button" data-toggle="tooltip" data-placement="top" title="Previous page"
                        onClick={handlePrevPage} ref={prevRef} disabled={!q?.previousPage}>
                    &lt;&lt;
                </button>
                <button className={"btn btn-primary  " + styles.Legendbtn} 
                        type="button" data-toggle="tooltip" data-placement="top" title="next page"
                        onClick={handleNextPage} ref={nextRef} disabled={!q?.nextPage}>
                    &gt;&gt;</button>
                </div>
                <div className="d-inline-flex align-items-center">
                {props.params.start>0 ? 
                    (<span className={styles.Legend}>Search term: <strong>{props.params.searchPhrase}</strong>.
                     Showing <strong>{start} - {end}</strong> of
                     &nbsp;{totalResults}&nbsp;results. Time: {searchTime}s.
                     
                     </span>)
                        :
                    (<span className={styles.Legend}>No search term given.</span>)
                }
                </div>
            </div>
            { items && 
            <div className={"table-responsive " + styles.Cleft}>
                <table className={"table " + styles.Restable}>
                    <thead>
                        <tr>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((i: any, index: number) => 
                            { return i.pagemap ? 
                                <tr key={index}><td className={styles.leftCell}>
                                {i.pagemap.cse_image &&
                                <a href={i.pagemap.cse_image[0]?.src} target="_blank" rel="noreferrer">
                                     {i.pagemap.cse_thumbnail ? <img className={styles.zoom} src={i.pagemap.cse_thumbnail[0]?.src} height="50" alt="thumbnail"/>
                                     : <span className={styles.small}>Image</span>
                                     }
                                </a>}
                            </td><td valign="top" className={styles.rightCell}>
                                <a className={styles.blue} href={i.link} target="_blank" rel="noreferrer">{i.title}</a><br/>
                                <div className={styles.small}>{i.snippet}<br/></div>
                                { i.pagemap.person && 
                                    <div className={styles.small}>
                                        Person: <a href={i.pagemap.person[0].url} target="_blank" rel="noreferrer" className={styles.blue}>{i.pagemap.person[0].url}</a>
                                    {i.pagemap.person[0]?.role && <span className={styles.small}>Role: {i.pagemap.person[0].role} &nbsp;</span>}
                                    {i.pagemap.person[0]?.org  && <span className={styles.small}>Organisation: {i.pagemap.person[0].org} &nbsp;</span>}
                                    {i.pagemap.person[0]?.location  && <span className={styles.small}>Location: {i.pagemap.person[0].location} &nbsp;</span>}
                                    </div>
                                }
                                {i.pagemap.videoobject &&
                                    <div className={styles.small}>Video: <a href={i.pagemap.videoobject[0]?.url} target="_blank" rel="noreferrer" className={styles.blue}>{i.pagemap.videoobject[0]?.url}</a></div>
                                }
                            </td></tr>
                                : 
                                <tr key={index}><td><a className={styles.blue} href="{i.link}" target="_blank">{i.link}</a><br/>
                                <div className={styles.small}>{i.snippet}<br/></div></td></tr>;
                            }
                        )}
                    </tbody>
                </table>
            </div>}
    </div>
    )};

export default Results;
