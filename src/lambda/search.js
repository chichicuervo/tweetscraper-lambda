'use strict';

import os from 'os';
import path from 'path';
import fetch from 'node-fetch';
import API from 'lambda-api';

import chromium from 'chrome-aws-lambda';
import ScrapeTweet from 'TweetScraper';

import extractProxy from 'proxy';

const api = API()

const isTrue = i => {
    return i == true || i == 1 || i == 'true' || i == 't' || i == 'T'
}

const isFalse = i => {
    return i == false || i == 0 || i == 'false' || i == 'f' || i == 'F'
}

const tweet = async (req, res)  => {
    try {
        var timelineMode = req.query.idsOnly && isTrue(req.query.idsOnly) ? 'light' : 'full';

        var url = `https://twitter.com/search?f=tweets&vertical=default&q=${req.query.q}&src=typd&qf=off`;

        var proxy = await extractProxy(req);
    } catch (e) {
        console.log(e);
        return res.sendStatus(400)
    }

    console.log(proxy);

    try {
        const launch_opts = {
            dumpio: DEV_MODE || false,
            defaultViewport: chromium.defaultViewport,
            headless: DEV_MODE || chromium.headless
        }

        if (os.platform() == 'freebsd') {
            launch_opts.executablePath = '/usr/local/bin/chrome'
        } else {
            launch_opts.executablePath = await chromium.executablePath
        }

        var scrape = new ScrapeTweet({ options: {
            launch: launch_opts,
            args: chromium.args,
            proxy: proxy,
            pages: 99,
            timeline: timelineMode,
            quote: true,
            loadWait: 1250,
            doScreenshot: req.query.screenshot && isFalse(req.query.screenshot) ? false : true,
            // debug: true
        }});

        var data = await scrape.getSearch(url);
        if (data) {
            delete data.screenshot;
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

api.get('/api/search', tweet)

export default async ( event, context ) => {
	return await api.run(event, context);
};
