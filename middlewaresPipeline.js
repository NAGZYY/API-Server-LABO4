/////////////////////////////////////////////////////////////////////
// Use this class to insert into middlewares into the pipeline
// 
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
import CachedRequestsManager from "./CachedRequestsManager.js";

export default class MiddlewaresPipeline {
    constructor() {
        this.middlewares = [];
    }
    add(middleware) {
        this.middlewares.push(middleware);
    }
    handleHttpRequest(HttpContext) {
        for (let middleware of this.middlewares) {
            if (middleware(HttpContext)) 
                return true;
        }
        return false;
    }
}
const middlewaresPipeline = new MiddlewaresPipeline();
const cachedRequestsMiddleware = CachedRequestsManager.get.bind(CachedRequestsManager);
middlewaresPipeline.add(cachedRequestsMiddleware);