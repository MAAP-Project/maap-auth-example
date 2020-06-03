const MAAP_AUTH_HOST = "auth.nasa.maap.xyz";
var proxyGrantingTicket = '';

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

function handleMessageDispatch(ev) {
    window.removeEventListener('message', handleMessageDispatch);

    let sTicket = ev.data;
    loginWindow.close();

    var parameters = { 
        ticket: sTicket,
        service: encodeURIComponent(window.location.href.split('?')[0]),
        pgtUrl: encodeURIComponent('https://' + MAAP_AUTH_HOST + '/cas')
    };

    $.get('/maapLogin', parameters, function(data) {
        console.log(data);

        var userName = data['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0];
        var attributes = data['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:attributes'][0];
        proxyGrantingTicket = data['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:attributes'][0]['cas:proxyGrantingTicket'][0];

        console.log(userName);
        console.log(attributes);
        console.log(proxyGrantingTicket);

        if(proxyGrantingTicket) {
            //maapStatus
            $('#maapStatus').text(function(i, oldText) {
                return 'Logged in!';
            });

            //maapDetails
            $('#maapDetails').text(function(i, oldText) {
                return userName + JSON.stringify(attributes);
            });

            $('#btnApi').show();
        }

    });
}

function callMaapApi() {

    var parameters = { 
        proxyTicket: proxyGrantingTicket
    };

    $.get('/maapApi', parameters, function(data) {
        console.log(data);

        $("#maapApiResponse").append("The result =" + JSON.stringify(data));
    });
}

 if (window.location.href.includes('ticket=')) {
    let name = 'ticket';
    let url = window.location.href;
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    let ticketValue = decodeURIComponent(results[2].replace(/\+/g, ' '));
    window.opener.postMessage(ticketValue, url);
}