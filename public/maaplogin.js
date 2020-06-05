const MAAP_AUTH_HOST = "auth.nasa.maap.xyz";
var proxyGrantingTicket = '';

//Open login pop-up window pointing to the authentication server, 
//including a redirect back to our current location.
function openLoginWindow() {
    var url = 'https://' + MAAP_AUTH_HOST + '/cas/login?service=' + encodeURIComponent(window.location.href.split('?')[0]);
    var title = 'MAAP Login';
    const w = 800;
    const h = 750;

    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);

    loginWindow =  window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);

    if (window.focus) loginWindow.focus();
    window.addEventListener('message', handleMessageDispatch);
}

//Wait for the authentication server redirect that contains a 'ticket' value from CAS
if (window.location.href.includes('ticket=')) {
    let name = 'ticket';
    let url = window.location.href;
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    let ticketValue = decodeURIComponent(results[2].replace(/\+/g, ' '));

    //Post a message to our parent window from this pop-up that contains the ticket value from CAS
    window.opener.postMessage(ticketValue, url);
}

//Respond to the pop-up window's message containing the CAS ticket.
function handleMessageDispatch(ev) {
    window.removeEventListener('message', handleMessageDispatch);

    let sTicket = ev.data;

    //Now that we have the ticket from the pop-up, close the pop-up window.
    loginWindow.close();

    var parameters = { 
        ticket: sTicket,
        service: encodeURIComponent(window.location.href.split('?')[0]),
        pgtUrl: encodeURIComponent('https://' + MAAP_AUTH_HOST + '/cas')
    };

    //Trigger a proxy validation service call from our node server
    $.get('/maapLogin', parameters, function(data) {
        console.log(data);

        //We naively assume that the authentication is successful and forgo error handling for brevity
        var userName = data['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0];
        var attributes = data['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:attributes'][0];
        proxyGrantingTicket = data['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:attributes'][0]['cas:proxyGrantingTicket'][0];

        if(proxyGrantingTicket) {
            
            //With the proxy ticket in hand, update our UI with the CAS response.
            $('#maapStatus').text(function(i, oldText) {
                return 'Logged in!';
            });

            $('#maapDetails').text(function(i, oldText) {
                return userName + JSON.stringify(attributes);
            });

            $('#btnApi').show();
        }

    });
}

//Additional call to the MAAP API's /members/self endpoint to demonstrate a proxy API call.
function callMaapApi() {

    var parameters = { 
        proxyTicket: proxyGrantingTicket
    };

    $.get('/maapApi', parameters, function(data) {
        console.log(data);

        $("#maapApiResponse").append("The result =" + JSON.stringify(data));
    });
}