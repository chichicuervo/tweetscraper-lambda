import * as React from 'react'
import { hot } from 'react-hot-loader'

import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import 'typeface-roboto';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    }
}); // seems this should be an include

function applyTheme(Component) {
    return (props) => {
        return (
            <MuiThemeProvider theme={theme}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <Component {...props} />
            </MuiThemeProvider>
        );
    };
}

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const styles = theme  => ({
    root: {
        flexGrow: 1
    }
});

const PageHeader = () => (
    <Toolbar>
        <Typography variant="h6" color="inherit">
            TweetScraper
        </Typography>
    </Toolbar>
);

import SearchForm from 'App/SearchForm';

const PageBody = () => (
    <SearchForm />
);

class Shell extends React.Component {

    render() {
        const { classes, theme, children } = this.props;

        return (
            <div className={classes.root}>
                <Grid container
                    direction="column"
                    justify="flex-start"
                    alignItems="stretch"
                    spacing={theme.spacing.unit}
                >
                    {/* header here */}
                    <AppBar
                        position="static"
                        color="primary"
                    >
                        <PageHeader />
                    </AppBar>
                    <Grid item>
                        <Grid container
                            direction="row"
                            justify="center"
                            alignItems="flex-start"
                            spacing={theme.spacing.unit}
                        >
                            <Grid item xs={10}>
                                <PageBody />
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* put footer here */}
                </Grid>
            </div>
        );
    }
}


export default hot(module)(applyTheme(withStyles(styles, { withTheme: true })(Shell)))
