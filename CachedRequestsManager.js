import * as utilities from "./utilities.js";
import { log } from "./log.js";

// Repository file data models cache
globalThis.cachedRequests = [];

export default class CachedRequestsManager {
    static add(url, content, ETag = "") {
        if (url !== "") {
            CachedRequestsManager.clear(url);
            globalThis.cachedRequests.push({
                url,
                content,
                ETag,
                Expire_Time: utilities.nowInSeconds() + cachedRequestsExpirationTime,
            });
            console.log("Request for " + url + " added to cache");
        }
    }

    static find(url) {
        try {
            if (url !== "") {
                for (let cacheKey in globalThis.cachedRequests) {
                    const cache = globalThis.cachedRequests[cacheKey];
                    if (cache.url === url) {
                        // Renouveler la cache
                        cache.Expire_Time =
                            utilities.nowInSeconds() + cachedRequestsExpirationTime;
                        console.log("Request for " + url + " retrieved from cache");
                        return { content: cache.content, ETag: cache.ETag };
                    }
                }
            }
        } catch (error) {
            console.log("Cached request error!", error);
        }
        return null;
    }

    static clear(url) {
        console.log("CLEAR");
        let indexToDelete = [];
        let index = 0;
        for (let cachedRequest of globalThis.cachedRequests) {
            if (cachedRequest.url.toLowerCase().includes(url.toLowerCase())) {
                console.log("Suppression de la cache avec l’url associé: " + cachedRequest.url);
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(globalThis.cachedRequests, indexToDelete);
    }

    static flushExpired() {
        console.log("EXPIRED"); 
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cachedRequest of globalThis.cachedRequests) {
            if (cachedRequest.Expire_Time < now) {
                console.log("Retrait de cache expirée avec l’url associé: " + cachedRequest.url);
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(globalThis.cachedRequests, indexToDelete);
    }

    static get(HttpContext) {
        console.log(HttpContext.req.url);
        const url = HttpContext.req.url;
        const cachedResponse = CachedRequestsManager.find(url);
        console.log(cachedResponse);
        if (cachedResponse) {
            console.log(`Extraction de la cache avec l'URL associé: ${url}`);
            HttpContext.response.JSON(cachedResponse.content, cachedResponse.ETag, true);
            return true;
        } else {
            console.log(`Cache non trouvée pour l'URL: ${url}`);
        }

        return false;
    }
}

//setInterval(CachedRequestsManager.flushExpired, cachedRequestsExpirationTime * 1000);
//log(BgWhite, FgBlack, "Periodic cached requests cleaning process started...");

////const cachedRequestsExpirationTime = 3600; // seconds
