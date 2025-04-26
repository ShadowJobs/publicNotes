export type Result<T = any> = {
  status: number;
  message: string | null;
  data: T | null;
};

export class APIError<T = Record<string, string[]>> extends Error {
  data: T;
  status: number;
  statusText: string;

  constructor(message: string, status: number, statusText: string, data: T, cause: Error) {
    super(message, { cause });
    this.data = data;
    this.status = status;
    this.statusText = statusText;
  }

  get details() {
    if (this.data && typeof this.data !== "string") {
      return Object.entries(this.data).map(([name, messages]) => {
        if (Array.isArray(messages)) {
          return `${name}: ${messages.join("; ")}`;
        } else {
          return `${name}: ${JSON.stringify(messages)}`;
        }
      });
    }
    return ["Service Error"];
  }
}

export type ListResult<T = any> = {
  count: number;
  results: T[];
};

export type AutoCompleteItem = {
  label: string;
  value: string;
};

export * as UserService from "./user";
