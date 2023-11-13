import * as utilities from "./utilities.js";

export default class CachedRequestsManager {
    static cachedRequests = [];

    static add(url, content, ETag = "") {
        CachedRequestsManager.clear(url);
        CachedRequestsManager.cachedRequests.push({
            url,
            content,
            ETag, // stocker ETag dans l'objet cache
            expireTime: utilities.nowInSeconds() + 10, // Exemple de temps d'expiration en secondes
        });
        console.log("Ajout dans la cache avec l’url associé: " + url);
    }

    static find(url) {
        for (let cachedRequest of CachedRequestsManager.cachedRequests) {
            if (cachedRequest.url === url) {
                console.log("Extraction de la cache avec l’url associé: " + url);
                return cachedRequest;
            }
        }
        return null;
    }

    static clear(url) {
        let indexToDelete = [];
        let index = 0;
        for (let cachedRequest of CachedRequestsManager.cachedRequests) {
            if (cachedRequest.url.toLowerCase().includes(url.toLowerCase())) {
                console.log("Suppression de la cache avec l’url associé: " + cachedRequest.url);
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(CachedRequestsManager.cachedRequests, indexToDelete);
    }

    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cachedRequest of CachedRequestsManager.cachedRequests) {
            if (cachedRequest.expireTime < now) {
                console.log("Retrait de cache expirée avec l’url associé: " + cachedRequest.url);
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(CachedRequestsManager.cachedRequests, indexToDelete);
    }

    static get(HttpContext) {
        const url = HttpContext.request.url;
        const cachedRequest = CachedRequestsManager.find(url);

        if (cachedRequest) {
            HttpContext.response.JSON(cachedRequest.content, cachedRequest.ETag, true);
        }
    }
}
