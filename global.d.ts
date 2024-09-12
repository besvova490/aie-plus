// types
import { ISheet } from "./src/types/utils/ISheet";

declare global {
  interface Window {
    electronAPI: {
      readXlsx: (payload: { data: ArrayBuffer[] }) => void;
      readXlsxCallback: (
        callback: (e: any, payload: { sheets: ISheet[] }) => void
      ) => void;
      saveFile: (payload: { file: ArrayBuffer, title: string, type: string }) => void;
      saveFileCallback: (callback: (e: any, payload: string) => void) => void;
      openPath: (payload: { path: string }) => void;
      openFile: (payload: { path: string }) => void;
      clearData: (callback: () => void) => void;
    }
  }
}

export {};
