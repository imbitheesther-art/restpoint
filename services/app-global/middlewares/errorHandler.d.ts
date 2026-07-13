declare function errorHandler(err: any, req: any, res: any, next: any): void;
declare function notFoundHandler(req: any, res: any): void;
declare function asyncHandler(fn: any): (req: any, res: any, next: any) => void;

export { errorHandler, notFoundHandler, asyncHandler };