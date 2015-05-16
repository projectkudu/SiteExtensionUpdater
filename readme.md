# Site Extension Updater
A one line code change to allow your Azure Site Extension to auto-update 

##Introduction
You can use [Azure Site Extensions](http://azure.microsoft.com/blog/2014/06/20/azure-web-sites-extensions/) to extend any Azure Web App pretty easily and enhance the site’s functionality.  For example, there are extensions which integrate [New Relic](https://docs.newrelic.com/docs/agents/net-agent/azure-installation/azure-web-apps) and [Visual Studio Online](http://blogs.msdn.com/b/monaco/archive/2013/12/06/using-monaco-for-in-depth-modifications.aspx) to any Azure Web App.  You can even [write your own](http://blog.azure.com/2014/09/09/writing-a-site-extension-for-azure-websites/) and post them to the [Site Extension gallery](https://github.com/projectkudu/kudu/wiki/Azure-Site-Extensions#site-extension-gallery).  If you don’t know how to create a site extension and publish it to the gallery, [you can find the instructions here](http://blog.azure.com/2014/09/09/writing-a-site-extension-for-azure-websites/).

Updating those site extensions is a bit of a hassle though. When you publish a new version of your site extension, in order to get that newer version your users need to browse to the Site Extension gallery, notice that your site extension has an update available, and then click the update button.  That’s a lot of steps.
We’re introducing a way for you to make your site extensions auto-update themselves with just one line of code. 

##Enable auto-updates
The auto-update feature works for site extensions with a UI.  
To make your site extension auto-update you just need to include the following script tag in your site extension’s home page (or any page your users will often visit):

    <script src="https://azureappservices.blob.core.windows.net/publicscripts/siteExtensionUpdater.1.0.0.js"></script>

Simple as that.

Now every time anyone navigates to your site extension, in the background the script will check to see if there’s a newer version of the extension available. If there is, the script will update the user’s copy of your site extension and ask them to refresh their page to get the new bits. 

All in just a few seconds.

###Install via Bower
If you prefer using Bower we've got you covered there as well.

You can install the script via bower by running 
```shell
bower install  azure-site-extension-updater
```

##Using a custom applicationHost.xdt file
If you don’t use an applicationHost.xdt file for your site extension, you can skip this section.  If you do, there’s something you need to be aware of.

One thing the auto-updater needs from you is that the id you publish in your site extension’s *.nuspec file should match the route you list for your site extension in your applicationHost.xdt file.

*Fun fact: if you don’t include an applicationHost.xdt file with your site extension then Kudu will generate a default one for you with the correct route*

Example *.nuspec file:

    <?xml version="1.0"?>
    <package >
      <metadata>
        <id>MySiteExtension</id>
        <version>7.0.0</version>
        <authors>ZainRizvi</authors>
        <owners>ZainRizvi</owners>
        <licenseUrl>http://www.github.com/zainrizvi/mysite/license</licenseUrl>
        <projectUrl>http://www.github.com/zainrizvi/mysite</projectUrl>
        <iconUrl>http://www.github.com/zainrizvi/mysite/image.ico</iconUrl>
        <requireLicenseAcceptance>false</requireLicenseAcceptance>
        <description>Package description</description>
        <releaseNotes>Summary of changes made in this release of the package.</releaseNotes>
        <copyright>Copyright 2015</copyright>
        <tags>Tag1 Tag2</tags>
      </metadata>
      <files>
        <file src="\**\*.*" target="content" />
      </files>
    </package>

Example applicationHost.xdt file:

    <?xml version="1.0"?>
    <configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
      <system.applicationHost>
        <sites>
          <site name="%XDT_SCMSITENAME%" xdt:Locator="Match(name)">
            *emphasized text*<application path="/MySiteExtension" xdt:Locator="Match(path)" xdt:Transform="Remove" />
            <application path="/MySiteExtension" applicationPool="%XDT_APPPOOLNAME%" xdt:Transform="Insert">
              <virtualDirectory path="/" physicalPath="%XDT_EXTENSIONPATH%" />
            </application>
          </site>
        </sites>
      </system.applicationHost>
    </configuration>

##Limitations
The auto-update script comes with two caveats:

 1. Because the auto-update script is a javascript file that has to run in a browser, for your site extension to actually get updated your user has to navigate to the page that imports the script. This means only UI-based site extensions can be auto-updated.

 2.	The update occurs by making api calls to the Kudu (scm) site, but in order to get access to the Kudu site the user has to be authenticated. This means that if the route to your site extension isn’t based off of the Kudu site already (https://&lt;sitename&gt;.scm.azurewebsites.net/...) then the site extension will lack the necessary authorization and won’t get auto-updated. (By default your site extension is routed under the Kudu site)

##How does it work?
The script parses the url of the page to figure out the name of the site extension. So if your site extension is located at https://&lt;sitename&gt;.scm.azurewebsites.net/MySiteExtension/ it’ll figure that the name must be “MySiteExtension”

With the name in hand the script just makes a couple api calls to the Kudu site to see if there is any updated version of your site extension available. If there is then the script tells Kudu to please install the latest version of the site extension by sending:

    PUT https://<sitename>.scm.azurewebsites.net/api/siteExtensions/<siteExtensionName>

This is the same request made when you click the “update” button on a site extension in the gallery.

Happy coding.

