# MAAP Proxy Login Example

This simple Node.js app demonstrates how to add a MAAP login button to a web application to enable proxy calls to the MAAP API. 

## Usage

To run this application, run the following commands in the project root folder:

```
npm install
node app.js
```

## User login workflow

In order to provide the most seamless user experience with your application while adhering to MAAP security protocols, we implemented a
browser pop-up window to facilitate user interaction between the host application and MAAP's CAS service. A pop-up window allows the host
application to securely route the delegated CAS authentication HTTP redirects via either ESA or URS. 

Once a successful login is initated in the host application, a new popup window should be spawned with the following URL:

`https://[maap auth server]/cas/login?service=[base url of host application]`

Ex: `https://auth.nasa.maap.xyz/cas/login?service=http%3A%2F%2Flocalhost%3A8080`

This will open a CAS login page, from which the login process can begin. Upon a successful login using either ESA or URS, a final redirect
will occur to the URL specified in the `service` parameter above. The full URL will look like the following:

 `http://[host application]?ticket=ST-...`

 Ex: `http://localhost:8080?ticket=ST-1234567890`

Using this `ticket` supplied by CAS, your web server can then make a new request to the CAS server to obtain the user's proxy ticket
and profile info:

`https://[maap auth server]/p3/serviceValidate?ticket=[ticket]&service=[base url of host application]&pgtUrl=[maap auth server]&state=`

Ex: `https://auth.nasa.maap.xyz/cas/p3/serviceValidate?ticket=ST-1234567890&service=http%3A%2F%2Flocalhost%3A8080&state=`

This request will return an XML response containing the MAAP user's profile information and `proxyGrantingTicket`. Below is an example response:

```xml
<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
    <cas:authenticationSuccess>
        <cas:user>brian.p.satorius@jpl.nasa.gov</cas:user>
        <cas:proxyGrantingTicket>PGTIOU-65-gy...UCv391iecip-172-31-38-38</cas:proxyGrantingTicket>
        <cas:attributes>
            <cas:isFromNewLogin>false</cas:isFromNewLogin>
            <cas:authenticationDate>2020-06-02T20:11:06.888Z[Etc/UTC]</cas:authenticationDate>
            <cas:clientName>URS</cas:clientName>
            <cas:successfulAuthenticationHandlers>ClientAuthenticationHandler</cas:successfulAuthenticationHandlers>
            <cas:preferred_username>bsatoriu</cas:preferred_username>
            <cas:given_name>Brian</cas:given_name>
            <cas:access_token>12345</cas:access_token>
            <cas:credentialType>ClientCredential</cas:credentialType>
            <cas:affiliation>Government</cas:affiliation>
            <cas:authenticationMethod>ClientAuthenticationHandler</cas:authenticationMethod>
            <cas:organization>JPL</cas:organization>
            <cas:proxyGrantingTicket>f6...Rc=</cas:proxyGrantingTicket>
            <cas:study_area>Cryospheric Studies</cas:study_area>
            <cas:name>Brian Satorius</cas:name>
            <cas:longTermAuthenticationRequestTokenUsed>false</cas:longTermAuthenticationRequestTokenUsed>
            <cas:family_name>Satorius</cas:family_name>
            <cas:email>brian.p.satorius@jpl.nasa.gov</cas:email>
            </cas:attributes>
    </cas:authenticationSuccess>
</cas:serviceResponse>
```

The `proxyGrantingTicket` attribute found within the `cas:attributes` element is the value required for making MAAP API requests. 

Once this response has been retrieved and returned to the host application client, the popup window can send a `window.opener.postMessage(ticketValue, url);` command.
This will notify the parent window that the login process is complete, after which the parent window can close this popup window without any
further action from the user.

