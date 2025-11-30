import { CleanedDataTable } from "../cleanedData/cleanedData";

export interface Database {
  public: {
    Tables: {
      cleaned_data: {
        Row: CleanedDataTable;
        Insert: CleanedDataTable;
        Update: Partial<CleanedDataTable>;
      };
    };
  };
}
