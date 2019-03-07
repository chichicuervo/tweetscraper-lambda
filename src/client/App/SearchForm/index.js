import path from 'path';
import React, { Component, createRef } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme  => ({
    root: {
        width: '100%',
    },
    button: {
        margin: theme.spacing.unit / 2,
    },
    paperRoot: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
        marginTop: theme.spacing.unit * 8,
    },
    subPaperRoot: {
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        padding: `${theme.spacing.unit * 1}px ${theme.spacing.unit * 3}px`,
        marginTop: theme.spacing.unit,
    },
    paperResult: {
        display: 'flex',
        // alignItems: 'center',
        // flexGrow: 1,
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
        marginTop: theme.spacing.unit,
        // textAlign: 'center',
        // verticalAlign: 'middle',
    },
    imgImg: {
        margin: 'auto',
    },
    searchButtonText: {
        paddingLeft: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        overflow: 'visible',
        whiteSpace: 'nowrap'
    },
    searchField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },

});

class SearchForm extends Component {

    state = {
        spinner: null,
        url: null,
        tweetData: null,
        hasTimeline: false,
        hasReplies: false,
        hasParents: false,
        noScreenshot: false,
        disabledSwitches: false,
    }

    doSubmit(event) {
        event.preventDefault();

        const raw_url = this.state.url;

        this.setState({
            spinner: 1,
            tweetData: null
        });

        let matches;
        if (!(matches = raw_url.match(/^(?:(?:https?:\/+)?(?:[\w\d]+\.)?twitter\.com\/([\w\d]+)\/status\/)?(\d+)/i))) {
            this.setState({spinner: -1});
            return;
        }

        const tweet_id = matches.pop();
        const uname = matches.pop();
        const fetch_url = path.join('/api/tweet', uname || '', uname ? 'status' : '', tweet_id);
        // console.log(tweet_id, uname, fetch_url);

        // const data = new FormData();
        // data.append('file', file, file.name);
        let frag = '';
        const {hasTimeline, hasReplies, hasParents, noScreenshot}  = this.state;
        if (hasTimeline == true) {
            frag = frag ? (frag + '&') : frag;
            // frag = frag + 'timeline=' + (noScreenshot ? 'true' : 'full');
            frag = frag + 'timeline=full';

            if (noScreenshot == true) {
                frag = frag ? (frag + '&') : frag;
                frag = frag + 'replies=true&parents=true';
            }
        } else {
            if (hasReplies == true) {
                frag = frag ? (frag + '&') : frag;
                frag = frag + 'replies=true';
            }
            if (hasParents == true) {
                frag = frag ? (frag + '&') : frag;
                frag = frag + 'parents=true';
            }
        }

        if (noScreenshot == true) {
            frag = frag ? (frag + '&') : frag;
            frag = frag + 'screenshot=false';
        }

        fetch(fetch_url + (frag ? ('?' + frag) : ''), {

        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            this.setState({
                tweetData: data,
                spinner: 0
            });
        })
        .catch(err => {
            console.log(err);
            this.setState({spinner: -1});
        })
    }

    download() {
        const { tweetData } = this.state;

        if (tweetData) {
            const  a = document.createElement('a');

            a.href = 'data:application/json;charset=utf-8,' + JSON.stringify(tweetData);
            a.download = (tweetData.tweetData.tweetId || 'tweet') + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    handleChange(event) {
        this.setState({
            spinner: 0,
            url: event.target.value
        });
    }

    handleSwitch = name => event => {
        this.setState({
            [name]: event.target.checked
        })

        if (name == 'hasTimeline') {
            this.setState({
                disabledSwitches: event.target.checked
            });
        }
    };

    render() {
        const { classes, theme, children } = this.props;
        const { spinner, tweetData } = this.state;

        return  (<>
            <form onSubmit={e => this.doSubmit(e)} className={classes.root}>
                <Paper className={classes.paperRoot} >
                    <TextField fullWidth label="Tweet URL" margin="dense" variant="outlined"
                        className={classes.searchField}
                        onChange={e => this.handleChange(e)}
                    />
                    <Button variant="contained" type="submit" className={classes.button}
                        color={spinner === -1 ? 'default' : "primary"}
                        disabled={spinner === 1 || spinner === -1}
                    >
                        <Typography color="inherit" className={classes.searchButtonText} >
                            {spinner === -1 ? 'ERROR' : 'Scrape Tweet'}
                        </Typography>
                        {spinner === 1 && <CircularProgress size={24} className={classes.buttonProgress}/>}
                    </Button>
                    {tweetData && (
                        <Button variant="contained" color="primary" className={classes.button} onClick={e => this.download()}>
                            <Typography color="inherit" className={classes.searchButtonText} >
                                Download Data
                            </Typography>
                        </Button>
                    )}
                </Paper>
                <Paper className={classes.subPaperRoot} >
                    <FormGroup row>
                        <FormControlLabel control={
                            <Switch value="fullTimeline" color="primary"
                                checked={this.state.hasTimeline}
                                onChange={this.handleSwitch('hasTimeline')}
                            />
                        } label="Full Timeline, incl. Reply/Parent Objects" />
                        <FormControlLabel control={
                            <Switch value="replies" color="primary"
                                checked={this.state.hasReplies}
                                disabled={this.state.disabledSwitches}
                                onChange={this.handleSwitch('hasReplies')}
                            />
                        } label="Include Reply List" />
                        <FormControlLabel control={
                            <Switch value="parents" color="primary"
                                checked={this.state.hasParents}
                                disabled={this.state.disabledSwitches}
                                onChange={this.handleSwitch('hasParents')}
                            />
                        } label="Include Parent List" />
                        <FormControlLabel control={
                            <Switch value="no_screenshot" color="secondary"
                                checked={this.state.noScreenshot}
                                onChange={this.handleSwitch('noScreenshot')}
                            />
                        } label="No Screenshots" />
                    </FormGroup>
                </Paper>
            </form>
            {tweetData && (<>
                {tweetData.tweetData.screenshot && (<Paper className={classes.paperResult} >
                    <img src={tweetData.tweetData.screenshot} className={classes.imgImg} />
                </Paper>)}
            </>)}
        </>);
    }

}

export default withStyles(styles, { withTheme: true })(SearchForm);
