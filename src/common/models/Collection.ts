import PageInfo from './PageInfo';

// Return a set of T
export default interface Collection<T> {
  edges: T[];
  pageInfo: PageInfo; // For Pagination if needed
}
