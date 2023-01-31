import { Params } from './Params';
import { InitResults } from './InitResults';
import { SysResults } from './SysResults';
import { InitialSysAPIParams } from './SysAPIParams';
import { Setter } from './commons';

export interface ErrorProps {
    isError: boolean;
    initResponse: InitResults;
    sysResponse: SysResults;
    params: Params;
    query: URLSearchParams;
    queryParams: InitialSysAPIParams;
    searchResults: any;
    setParams: Setter;
}