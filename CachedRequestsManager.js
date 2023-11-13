import * as utilities from "./utilities.js";
import * as serverVariables from "./serverVariables.js";
import {log} from "./log.js";
let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data models cache
globalThis.repositoryCaches = [];

export default class CachedRequestsManager {
    static add(url, payload, ETag = "") {
        if (url !== "") {
            //log(FgGreen, "Add");
            CachedRequestsManager.clear(url);
            repositoryCaches.push({
                url,
                payload,
                ETag,
                Expire_Time: utilities.nowInSeconds() + repositoryCachesExpirationTime
            });
            console.log("Ajout dans la cache avec l'url associé: " + url);
            //log(FgGreen, repositoryCaches);
        }
    }

    static find(url) {
        try {
            if (url != "") {
                for (let cache of repositoryCaches) {

                    if (cache.url == url) {

                        // renew cache
                        cache.Expire_Time = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                        console.log(`Extraction de la cache avec l'URL associé: ${url}`);
                        return cache;
                    }
                }
            }
        } catch (error) {
            console.log("repository cache error!", error);
        }
        return null;
    }

    static clear(url) {
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of repositoryCaches) {
                if (cache.url == url) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(repositoryCaches, indexToDelete);
        }
    }
    
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cache of repositoryCaches) {
            if (cache.Expire_Time < now) {
                console.log("Les données en cache du fichier " + cache.model + ".json ont expirées");
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(repositoryCaches, indexToDelete);
    }

    static get(HttpContext) {
        const url = HttpContext.req.url;
        const cachedResponse = CachedRequestsManager.find(url);
        //log(FgRed, cachedResponse);
        //log(FgYellow, repositoryCaches);
        if (cachedResponse != null) {
            HttpContext.response.JSON(cachedResponse.payload, cachedResponse.ETag, true);
            return true;
        } else {
            CachedRequestsManager.add(url, HttpContext.payload, HttpContext.req.headers);
        }
        return false;
    }
}

setInterval(CachedRequestsManager.flushExpired, repositoryCachesExpirationTime * 1000);
log(BgWhite, FgBlack, "Periodic repository caches cleaning process started...");
