declare function resemble(fileData: any): {
    onComplete: (callback: any) => void;
    async: () => Promise<unknown>;
    compareTo: (secondFileData: any) => {
        ignoreNothing: () => any;
        ignoreAntialiasing: () => any;
        ignoreColors: () => any;
        ignoreRectangles: (rectangles: any) => any;
        repaint: () => any;
        onComplete: (callback: any) => any;
        async: () => Promise<unknown>;
    };
};
declare namespace resemble {
    var outputSettings: (options: any) => any;
    var compareImg: (inputImage: any, compareWith: any) => Promise<unknown>;
}
export = resemble;
