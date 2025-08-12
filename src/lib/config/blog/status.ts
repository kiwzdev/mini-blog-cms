export interface Status {
  id: string;
  name: string;
  value: string;
}

export const BLOG_STATUSES: Status[] = [
  {
    id: "all",
    name: "All",
    value: "all",
  },
  {
    id: "published",
    name: "Published",
    value: "published",
  },
  {
    id: "draft",
    name: "Draft",
    value: "draft",
  },
];
