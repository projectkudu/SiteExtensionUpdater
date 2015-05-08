(function () {   
            
    // The site extension's name should be part of the url.
    //
    // For example, if your site extension is named "MyExtension" then the 
    // path to your site extension would be: 
    //    https://<sitename>.scm.azurewebsites.net/MyExtension
    //
    // For this to work make sure you give your site extension the same Id
    // in the package.nuspec file 
    var getSiteExtensionName = function () {

        var url = window.location.href;

        var siteExtensionNameRegex = /https?:\/\/[\w-_\.]+.scm.[\w-_\.]+\/([^\/]+)/i;
        var match = siteExtensionNameRegex.exec(url);

        var siteExtensionName = null;
        if (!match && match.length > 1) {
            siteExtensionName = match[1];
        }

        return siteExtensionName;
    };

    var ajaxMethod = function (method, url, callbackSuccess, callbackFailure) {
        var http = new XMLHttpRequest();
        http.open(method, url, true);

        http.onreadystatechange = function () {
            // Invoke callback when state changes.
            if (http.readyState === 4) {
                if (http.status === 200) {
                    callbackSuccess(JSON.parse(http.responseText));
                } else if (http.status >= 400) {
                    callbackFailure(http.status, http.responseText);
                }
            }
        };
        http.send();
    };

    var ajaxPUT = function put(url, callbackSuccess, callbackFailure) {
        ajaxMethod("PUT", url, callbackSuccess, callbackFailure);
    };

    var ajaxGET = function get(url, callbackSuccess, callbackFailure) {
        ajaxMethod("GET", url, callbackSuccess, callbackFailure);
    };

    var ajaxDELETE = function get(url, callbackSuccess, callbackFailure) {
        ajaxMethod("DELETE", url, callbackSuccess, callbackFailure);
    };
    
    var tellUserSiteHasUpdated = function (delay) {
        delay = delay || 0;
    
        // All done. Give the kudu site some time to restart
        setTimeout(function() {
            alert("This site extension has been updated. We'll now reload your page for you to give you the latest updates");
            location.reload(); 
        }, delay);
    };
    
    var restartScmSite = function() {
        var restartSiteCallback = function () {
            // All done. Give the kudu site some time to restart
            tellUserSiteHasUpdated(2000);
        };
        
        var scmW3wpProcessUrl = "/api/processes/0";            
        ajaxDELETE(scmW3wpProcessUrl, restartSiteCallback, restartSiteCallback);
    };

    var updateSiteExtension = function (siteExtensionsApiUrl, shouldRestartScmSite, retryAllowed) {
        
        shouldRestartScmSite = shouldRestartScmSite || false;
        retryAllowed = retryAllowed !== false;
                
        ajaxPUT(
            siteExtensionsApiUrl, 
            function() {
                if (shouldRestartScmSite) {
                    restartScmSite();   
                } else {
                    tellUserSiteHasUpdated();
                }
            }, 
            function() {
                // If it fails the first time retry one more time
                if (retryAllowed) { 
                    setTimeout(
                        function() {
                            updateSiteExtension(siteExtensionsApiUrl, shouldRestartScmSite, false);
                        }, 1000);
                }
            });
    };

    var tryUpdateSiteExtension = function () {
        var siteExtensionName = getSiteExtensionName();

        if (siteExtensionName === null) {
            console.warn("This isn't a site extension running under the scm site.  I can't update you");
            return;
        }

        var siteExtensionsApiUrl = "/api/siteExtensions/" + siteExtensionName;

        ajaxGET(siteExtensionsApiUrl,
            function (status) {
                if (!status.local_is_latest_version) {
                    updateSiteExtension(siteExtensionsApiUrl);
                }
            },
            function (err, data) {
                if (err === 404) {
                    // The site extension hasn't been registered with Kudu. 
                    // Restart the scm site to regenerate the applicationHost.config file 
                    // with the new applicationHost.xdt updates 
                    var restartScmSite = true;
                    updateSiteExtension(siteExtensionsApiUrl, restartScmSite);
                }
            }
        );
    };

    tryUpdateSiteExtension();
})();