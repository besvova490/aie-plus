// types
import { ISheet } from "./src/types/utils/ISheet";

declare global {
  interface Window {
    electronAPI: {
      readXlsx: (payload: { data: ArrayBuffer }) => void;
      readXlsxCallback: (
        callback: (e: any, payload: { sheet: ISheet }) => void
      ) => void;
      saveFile: (payload: { file: ArrayBuffer, title: string, type: string }) => void;
      saveFileCallback: (callback: (e: any, payload: string) => void) => void;
    }
  }
}

export {};
