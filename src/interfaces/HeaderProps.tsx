import { Setter } from './commons';
import { Params } from './Params';
import { InitialSysAPIParams } from './SysAPIParams';

export interface HeaderProps {
    params: Params;
    queryParams: InitialSysAPIParams;
    setParams: Setter;
    searchResults: any;
    setSearchResults: Setter;
    setShowError: Setter;
    setShowQuery: Setter;
}