import fetch from 'node-fetch';

const isTrue = i => {
    return i == true || i == 1 || i == 'true' || i == 't' || i == 'T'
}

const getProxyListProxy = apikey => {
    var url = "https://api.getproxylist.com/proxy?" +
        "country[]=US&country[]=CA&country[]=UK&" +
        "anonymity=transparent&" +
        "allowsUserAgentHeader=1&" +
        "allowsHttps=1&" +
        "maxConnectTime=2&" +
        "maxSecondsToFirstByte=3&" +
        "minUptime=90&"

    if (apikey) {
        url += 'apiKey=' + apikey;
    }

    return fetch(url)
        .then(res => res.json())
        .then(data => {
            return {
                url: data.protocol + "://" + data.ip + ":" + data.port,
                // password: data.password || null,
                // username: data.username || null
            }
        })
        .catch (err => {
            console.log('get proxy error', err);
        })
}

const extractProxy = req => {
    const q = req.query;

    if (q.proxy_url) {
        return {
            url: q.proxy_url
        };
    }

    if (isTrue(q.proxy)) {
        return getProxyListProxy(q.apikey || null);
    }
}

export default extractProxy
