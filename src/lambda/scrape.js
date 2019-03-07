'use strict';

import os from 'os';
import path from 'path';
import fetch from 'node-fetch';
import API from 'lambda-api';

import ScrapeTweet from 'TweetScraper';

const api = API()

const isTrue = i => {
    return i == true || i == 1 || i == 'true' || i == 't' || i == 'T'
}

const isFalse = i => {
    return i == false || i == 0 || i == 'false' || i == 'f' || i == 'F'
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
        url += 'apikey=' + apikey;
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

    if (isTrue(q.proxy)) {
        return getProxyListProxy(q.apikey || null);
    }
}

const tweet = async (req, res)  => {
    try {
        var doTimeline = !!(req.query.timeline || isTrue(req.query.replies || false) || isTrue(req.query.parents || false));
        var timelineMode = req.query.timeline && req.query.timeline == 'full' ? 'full' : doTimeline;

        if (!req.params.tweet_id.match(/^\d+$/)) {
            throw new Error('Invalid tweet ID');
        }

        var url = path.join('https://twitter.com/', req.params.user || '_', 'status', req.params.tweet_id);

        var proxy = await extractProxy(req);
    } catch (e) {
        console.log(e);
        return res.sendStatus(400)
    }

    console.log(proxy);

    try {
        var scrape = new ScrapeTweet({ options: {
            launch: os.platform() == 'freebsd' ? {
                executablePath: '/usr/local/bin/chrome',
                dumpio: true,
            } : {
                dumpio: true,
            },
            proxy: proxy,
            pages: 99,
            timeline: timelineMode,
            replies: timelineMode == 'full' || isTrue(req.query.replies || false),
            parents: timelineMode == 'full' || isTrue(req.query.parents || false),
            quote: true,
            loadWait: 1250,
            doScreenshot: req.query.screenshot && isFalse(req.query.screenshot) ? false : true,
            // debug: true
        }});

        var data = await scrape.getTweet(url);
        if (data) {
            if (timelineMode !== 'full') {
                delete data.screenshot;
            }
            res.json(data);
        } else {
            res.sendStatus(404);
        }

    } catch (e) {
        console.log(e);
        res.sendStatus(400)
    }

    scrape.close();
}

api.get('/api/tweet/:tweet_id', tweet)
api.get('/api/tweet/:user/status/:tweet_id', tweet)

export default async ( event, context ) => {
	return await api.run(event, context);
};
