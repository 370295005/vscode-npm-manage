declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare interface StringObject {
  [propName: string]: string;
}

interface VsCode {
  postMessage(message: any): void;
}
declare const vscode: VsCode;
declare function acquireVsCodeApi(): VsCode;
